from pathlib import Path
from uuid import uuid4
from rq import Retry

from job_queue import document_queue
from worker.tasks import process_document

from fastapi import APIRouter, Depends, HTTPException, UploadFile, status
from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from datetime import datetime, timezone

from database import get_db
from models import Document, User, Topic
from routers.auth import get_current_user
from services.document_processing import UPLOAD_PATH, UnreadableDocumentError, extract_text

##

router = APIRouter(
    prefix="/documents",
    tags=["documents"]
)

MIN_FILE_SIZE = 1 * 1024 # 1 KB
MAX_FILE_SIZE = MIN_FILE_SIZE * 1024 * 35  # 35 MB
ALLOWED_EXTENSIONS = {".pdf", ".docx", ".txt"}
MAX_DAILY_UPLOADS_FREE = 1
MAX_DAILY_UPLOADS_PAID = 5

##

def uploads_today(user):
    today = datetime.now(timezone.utc).date()

    if (user.last_upload.astimezone(timezone.utc).date() != today):
        return 0 


    return user.uploads


def get_topics_and_document_mastery(current_user, document):
    topics = []
    document_mastery = 0 

    for topic in document.topics:
        mastery_record = next(
            (
                record
                for record in topic.mastery_records
                if record.user_id == current_user.id
            ),
            None
        )


        if (not mastery_record):
            continue 


        mastery = mastery_record.mastery
        document_mastery += mastery 

        topics.append({
            "id": topic.id,
            "name": topic.name,
            "order_index": topic.order_index,
            "mastery": mastery,
            "status": mastery_record.status
        })


    if (document.topics):
        document_mastery = round(document_mastery / len(topics), 1)


    return topics, document_mastery
    

@router.post(
    "/upload",
    status_code=status.HTTP_201_CREATED
)
def upload(
    file: UploadFile,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if (not file.filename):
        raise HTTPException(
            status_code=400,
            detail="File must have a filename."
        )


    # Check that the file is of a valid file type (PDF, DOCX, TXT) before uploading.
    extension = Path(file.filename).suffix.lower()

    if (extension not in ALLOWED_EXTENSIONS):
        raise HTTPException(
            status_code=400,
            detail="File type is not supported."
        )


    db.refresh(current_user, with_for_update=True)
    user_uploads_today = uploads_today(current_user)

    if (user_uploads_today >= MAX_DAILY_UPLOADS_FREE):
        raise HTTPException(
            status_code=429,
            detail="You reached your daily upload limit."
        ) 


    # Stop users from uploading multiple files at once to help reduce server load / api load.
    query = (
        select(Document.id)
        .where(
            Document.user_id == current_user.id,
            Document.status.in_(["pending", "processing"])
        )
    ).limit(1)

    if (db.scalar(query)):
        raise HTTPException(
            status_code=429,
            detail="Wait for your previous upload to finish."
        )


    # Store document under a unique user folder with name set to user id. 
    # User folder must be dynamically created if it does not exist (first time uploading).
    # Github does not track empty folders so this is also needed to dynamically create "uploads" folder.
    user_directory = (
        UPLOAD_PATH / str(current_user.id)
    )

    user_directory.mkdir(
        parents=True,
        exist_ok=True
    )

    stored_filename = f"{uuid4()}{extension}"
    file_path = (user_directory / stored_filename)


    # Write the document in chunks of 1 MB to avoid storing entire document on memory.
    size = 0

    try:
        with (file_path.open("wb") as destination):
            while (chunk := file.file.read(1024 * 1024)):
                size += len(chunk)

                if (size > MAX_FILE_SIZE):
                    raise HTTPException(
                        status_code=413,
                        detail="File is too large."
                    )
                

                destination.write(chunk)


    except Exception:
        if (file_path.exists()):
            file_path.unlink()


        raise


    if (size < MIN_FILE_SIZE):
        file_path.unlink()

        raise HTTPException(
            status_code=422,
            detail="File is too small."
        )


    # Reject files without readable text (e.g. scanned PDFs) before they are queued.
    # Only the text is kept, so the file is deleted either way.
    try:
        text = extract_text(file_path)

    except UnreadableDocumentError as error:
        raise HTTPException(
            status_code=422,
            detail=str(error)
        )

    finally:
        file_path.unlink()


    document = Document(
        user_id=current_user.id,
        original_filename=file.filename,
        stored_filename=stored_filename,
        size_bytes=size,
        text=text
    )


    current_user.last_upload = datetime.now(timezone.utc)
    current_user.uploads = user_uploads_today + 1

    try:
        db.add(document)
        db.commit()
        db.refresh(document)

    except Exception:
        db.rollback()

        raise


    # Let AI Document processing be done in the background by a worker as it's expensive.
    document_queue.enqueue(
        process_document,
        document.id,
        job_timeout=300,
        retry=Retry(
            max=3,
            interval=[10, 30, 60]
        )
    )


@router.get("")
def get_documents(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    query = (
        select(Document)
        .options(
            selectinload(Document.topics)
            .selectinload(Topic.mastery_records)
        )
        .where(Document.user_id == current_user.id)
        .order_by(Document.uploaded_at.desc())
    )

    documents = db.scalars(query).all()
    documents_data = []

    for document in documents:
        topics, document_mastery = get_topics_and_document_mastery(current_user, document)

        data = {
            "id": document.id,
            "title": document.title,
            "size_bytes": document.size_bytes,
            "status": document.status,
            "mastery": document_mastery
        }

        documents_data.append(data)


    return documents_data 


@router.get("/{document_id}")
def get_document(
    document_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    query = (
        select(Document)
        .options(
            selectinload(Document.topics)
            .selectinload(Topic.mastery_records)
        )
        .where(
            Document.user_id == current_user.id,
            Document.id == document_id
        )
    )

    document = db.scalar(query)

    if (document is None):
        raise HTTPException(
            status_code=404,
            detail="Document not found."
        )


    topics, document_mastery = get_topics_and_document_mastery(current_user, document)

    return {
        "title": document.title,
        "topics": topics,
        "mastery": document_mastery
    }


@router.delete("/{document_id}")
def deleteDocument(
    document_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    query = (
        select(Document)
        .where(
            Document.id == document_id,
            Document.user_id == current_user.id
        )
    )

    document = db.scalar(query)

    if (document is None):
        raise HTTPException(
            status_code=404,
            detail="Document not found."
        )


    db.delete(document)
    db.commit()

    
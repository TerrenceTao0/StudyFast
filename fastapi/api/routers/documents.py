from pathlib import Path
from uuid import uuid4
from rq import Retry

from job_queue import document_queue
from tasks import process_document

from fastapi import APIRouter, Depends, HTTPException, UploadFile, status
from sqlalchemy import select 
from sqlalchemy.orm import Session

from database import get_db
from models import Document, User
from routers.auth import get_current_user

##

router = APIRouter(
    prefix="/documents",
    tags=["documents"]
)

UPLOAD_PATH = Path(__file__).resolve().parent.parent / "uploads"
MAX_FILE_SIZE = 20 * 1024 * 1024  # 20 MB
ALLOWED_EXTENSIONS = {".pdf", ".docx", ".txt"}

##

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


    # Store document under a unique user folder with name set to user id. 
    # User folder must be dynamically created if it does not exist (first time uploading).
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


    document = Document(
        user_id=current_user.id,
        original_filename=file.filename,
        stored_filename=stored_filename,
        size_bytes=size
    )


    try:
        db.add(document)
        db.commit()
        db.refresh(document)

    except Exception:
        db.rollback()

        if (file_path.exists()):
            file_path.unlink()


        raise


    job = document_queue.enqueue(
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
        .where(Document.user_id == current_user.id)
        .order_by(Document.uploaded_at.desc())
    )

    documents = db.scalars(query).all()

    return documents 


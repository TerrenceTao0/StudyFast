from sqlalchemy import select
from rq.exceptions import DuplicateJobError

from database import SessionLocal
from models import Document
from job_queue import document_queue
from tasks import process_document

##

def enqueue_pending_documents():
    db = SessionLocal()

    try:
        query = (
            select(Document)
            .where(Document.status == "pending")
        )

        documents = db.scalars(query).all()

        for document in documents:
            try:
                document_queue.enqueue(
                    process_document,
                    document.id,
                    job_id=f"document-{document.id}",
                    unique=True
                )

                print(f"Enqueued document {document.id}")

            except DuplicateJobError:
                print(f"Document {document.id} is already queued")


    finally:
        db.close()

##

if (__name__ == "__main__"):
    enqueue_pending_documents()


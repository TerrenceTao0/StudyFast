from sqlalchemy import select
from rq.exceptions import DuplicateJobError
from rq.job import Job

from database import SessionLocal
from models import Document
from job_queue import document_queue
from worker.tasks import process_document

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
            job_id = f"document-{document.id}"

            try:
                document_queue.enqueue(
                    process_document,
                    document.id,
                    job_id=job_id,
                    unique=True
                )

                print(f"Enqueued document {document.id}")

            except DuplicateJobError:
                job = Job.fetch(
                    job_id,
                    connection=document_queue.connection
                )

                status = job.get_status()

                if status == "failed":
                    document_queue.failed_job_registry.requeue(
                        job_id
                    )

                    print(
                        f"Requeued failed document {document.id}"
                    )

                else:
                    print(
                        f"Document {document.id} has "
                        f"job status: {status}"
                    )

    finally:
        db.close()

##

if __name__ == "__main__":
    enqueue_pending_documents()


import time

from database import SessionLocal
from models import Document

##

def process_document(document_id: int):
    db = SessionLocal()

    try:
        document = db.get(
            Document,
            document_id
        )

        if (document is None):
            return


        document.status = "processing"
        document.title = "Processing..."
    
        db.commit()

    except Exception as error:
        db.rollback()

        raise


    finally:
        db.close()


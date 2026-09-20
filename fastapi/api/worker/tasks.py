from database import SessionLocal
from models import Document, Topic, Flashcard, Question
from services import document_processing

##

def construct_topic(i, topic_data):
    topic = Topic(
        name=topic_data["name"],
        order_index=i
    )

    for flashcard_data in topic_data["flashcards"]:
        topic.flashcards.append(
            Flashcard(
                front=flashcard_data["front"],
                back=flashcard_data["back"]
            )
        )


    for question_data in topic_data["question_bank"]:
        topic.questions.append(
            Question(
                question=question_data["question"],
                options=question_data["options"],
                answer=question_data["answer"],
                explanation=question_data["explanation"],
                difficulty=question_data["difficulty"]
            )
        )


    return topic 


def process_document(document_id: int):
    db = SessionLocal()

    try:
        document = db.get(
            Document,
            document_id
        )

        if (document is None):
            return


        # Commit immediately so the frontend can see that processing has actually started.
        document.status = "processing"
        document.title = "Processing..."
        db.commit()

        document_path = (
            document_processing.UPLOAD_PATH 
            / str(document.user_id) 
            / document.stored_filename
        )
        document_text = document_processing.extract_text(document_path)
        ai_response = document_processing.analyze(document_text)

        # Convert the nested AI response into related database objects.
        for i, topic_data in enumerate(ai_response["topics"]):
            topic = construct_topic(i, topic_data)
            document.topics.append(topic)


        document.status = "ready"
        document.title = ai_response["title"]

        # Save the generated study material as one transaction.
        # If error occurs during construction, document rolls back to pending with no partially generated material.
        db.commit()

    except Exception:
        db.rollback()

        document = db.get(
            Document, 
            document_id 
        )


        if (document is not None):
            document.status = "pending"
            document.title = "Pending..."
            db.commit()


        raise


    finally:
        db.close()


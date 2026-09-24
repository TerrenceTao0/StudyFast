from fastapi import APIRouter, Depends, HTTPException 
from sqlalchemy import select
from sqlalchemy.orm import Session

from pydantic import BaseModel
from datetime import datetime, timezone, timedelta, date

import random 

from database import get_db
from models import User, Topic, Question, Document, TopicMastery, QuestionSession
from routers.auth import get_current_user

##

router = APIRouter(
    prefix="/questions",
    tags=["questions"]
)

class UserAnswer(BaseModel):
    user_answer: str

##

def construct_question_set(questions):
    cleaned_questions = []
    
    for question in questions:
        random.shuffle(question.options)

        cleaned_questions.append(
            {
                "id": question.id,
                "question": question.question, 
                "options": question.options,
                "difficulty": question.difficulty 
            }
        )


    return cleaned_questions


@router.get("/{topic_id}")
def get_questions(
    topic_id: int, 
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    today = datetime.now(timezone.utc).date()

    session_query = (
        select(QuestionSession)
        .join(Topic)
        .where(
            Topic.id == topic_id,
            QuestionSession.user_id == current_user.id 
        )
    )

    session = db.scalar(session_query)

    if (session):
        topic_mastery = db.scalar(
            select(TopicMastery)
            .where(
                TopicMastery.topic_id == topic_id,
                TopicMastery.user_id == current_user.id
            )
        )


        if (topic_mastery and session.round >= topic_mastery.round):
            raise HTTPException(
                status_code=409,
                detail="Session is already completed."
            )


        questions = db.scalars(
            select(Question)
            .where(Question.id.in_(session.question_ids))
        ).all()


        # Reconstruct correct order of questions.
        questions_by_id = {
            question.id: question
            for question in questions
        }

        questions = [
            questions_by_id[question_id]
            for question_id in session.question_ids
        ]

        cleaned_questions = construct_question_set(questions)

        return {
            "questions": cleaned_questions,
            "current_question_index": session.current_question_index
        } 


    query = (
        select(Question)
        .join(Topic)
        .join(Document)
        .where(
            Document.user_id == current_user.id,
            Topic.id == topic_id
        )
    )

    questions = db.scalars(query).all()

    if (not questions):
        raise HTTPException(
            status_code=404,
            detail="Questions not found."
        )


    random.shuffle(questions)
    questions = questions[:7]

    cleaned_questions = construct_question_set(questions)

    ids = [question["id"] for question in cleaned_questions]
    session = QuestionSession(
        user_id=current_user.id,
        topic_id=topic_id,
        current_question_index=0,
        question_ids=ids
    )


    db.add(session)
    db.commit()

    return {
        "questions": cleaned_questions,
        "current_question_index": session.current_question_index
    }


@router.post("/{topic_id}/{question_id}/answer")
def answer_question(
    question_id: int,
    topic_id: int,
    user_answer: UserAnswer,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    query = (
        select(QuestionSession)
        .where(
            QuestionSession.topic_id == topic_id,
            QuestionSession.user_id == current_user.id
        )
    )

    session = db.scalar(query)

    if (not session):
        raise HTTPException(
            status_code=404,
            detail="Question session for topic was not found."
        )


    topic_mastery = db.scalar(
        select(TopicMastery)
        .where(
            TopicMastery.topic_id == topic_id,
            TopicMastery.user_id == current_user.id
        )
    )

    if (topic_mastery is None):
        raise HTTPException(
            status_code=404,
            detail="Topic mastery was not found."
        )


    if (session.round >= topic_mastery.round):
        raise HTTPException(
            status_code=409,
            detail="Session is already completed."
        )

        
    question_ids = session.question_ids
    current_question_index = session.current_question_index
    
    # Check if user is actually answering their given question.
    if (question_ids[current_question_index] != question_id):
        raise HTTPException(
            status_code=400,
            detail="Answering incorrect question."
        )


    question = db.scalar((
        select(Question)
        .where(
            Question.topic_id == topic_id,
            Question.id == question_id
        )
    ))


    if (not question):
        raise HTTPException(
            status_code=404,
            detail="Question not found."
        )


    finished = session.current_question_index + 1 >= len(question_ids)

    if (finished):
        # User completed their daily question set.
        session.current_question_index = 0 
        session.round = topic_mastery.round 

    else:
        # User should progress to next question in the set.
        session.current_question_index += 1 


    correct = user_answer.user_answer == question.answer

    mastery_record = db.scalar(
        select(TopicMastery)
        .where(
            TopicMastery.user_id == current_user.id,
            TopicMastery.topic_id == question.topic_id
        )
    )

    
    if (mastery_record):
        if (correct):
            mastery_record.mastery = min(
                mastery_record.mastery + 2,
                100
            ) 

        else:
            mastery_record.mastery = max(
                mastery_record.mastery - 3,
                0
            ) 


    db.commit()

    if (finished):
        return {
            "correct": correct,
            "answer": question.answer,
            "explanation": question.explanation,
            "finished": True
        }

    else:
        return {
            "correct": correct,
            "answer": question.answer,
            "explanation": question.explanation,
        }


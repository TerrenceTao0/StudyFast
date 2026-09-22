from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from pydantic import BaseModel
from typing import Literal

from database import get_db
from datetime import datetime, timezone
from models import Topic, Document, User, Flashcard, FlashcardProgress
from routers.auth import get_current_user
from fsrs import Scheduler, Card, Rating, State

##

router = APIRouter(
    prefix="/flashcards",
    tags=["flashcards"]
)

scheduler = Scheduler()

class ReviewRequest(BaseModel):
    response: Literal["again", "good"]

##

@router.get("/{topic_id}")
def get_flashcard(
    topic_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    query = (
        select(Topic)
        .options(
            selectinload(Topic.flashcards)
        )
        .join(Document)
        .where(
            Topic.id == topic_id,
            Document.user_id == current_user.id
        )
    )

    topic = db.scalar(query)

    if (topic is None):
        raise HTTPException(
            status_code=404,
            detail="Topic not found."
        )


    if (not topic.flashcards):
        return {
            "state": "complete"
        }
    

    now = datetime.now(timezone.utc)
    new_card = None
    soonest_due = None 
    completed_cards = 0 

    # Show due cards first before showing new cards.
    # Give user flashcards until all cards are in "Review" state.
    for flashcard in topic.flashcards:
        progress = db.scalar(
            select(FlashcardProgress)
            .where(
                FlashcardProgress.user_id == current_user.id,
                FlashcardProgress.flashcard_id == flashcard.id
            )
        )

        if (not progress):
            if (not new_card):
                new_card = {
                    "state": "card",
                    "id": flashcard.id,
                    "front": flashcard.front,
                    "back": flashcard.back
                }


            continue


        card = Card.from_json(progress.fsrs_data)

        if (card.due <= now):
            return {
                "state": "card",
                "id": flashcard.id,
                "front": flashcard.front,
                "back": flashcard.back
            }

        else:
            if (soonest_due is None or card.due < soonest_due):
                soonest_due = card.due 


            # User finished initial learning of the card for current study session.
            if (card.state == State.Review or card.state == State.Relearning):
                completed_cards += 1 


    if (new_card):
        return new_card


    completion = round(completed_cards / len(topic.flashcards) * 100, 1)

    # User should move onto doing practice questions after learning all the cards.
    if (completion == 100):
        return {
            "state": "complete"
        }


    # All cards are now on cooldown in one of the short learning steps - This is a "break period".
    # User needs to see their flashcard review completion % and how long their "break" actually is.
    # Browser calculates break time left instead of server to avoid polling every second.
    return {
        "state": "break",
        "completion": completion,
        "soonest_due": soonest_due
    } 


@router.post("/{flashcard_id}/review")
def review(
    review: ReviewRequest,
    flashcard_id: int, 
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    query = (
        select(Flashcard)
        .join(Topic)
        .join(Document)
        .where(
            Flashcard.id == flashcard_id,
            Document.user_id == current_user.id
        )
    )

    flashcard = db.scalar(query)

    if (flashcard is None):
        raise HTTPException(
            status_code=404,
            detail="Flashcard not found."
        )


    progress = db.scalar(
        select(FlashcardProgress)
        .where(
            FlashcardProgress.user_id == current_user.id,
            FlashcardProgress.flashcard_id == flashcard.id
        )
    )

    if (progress is None):
        card = Card()

        progress = FlashcardProgress(
            user_id=current_user.id,
            flashcard_id=flashcard.id
        )

        db.add(progress)

    else:
        card = Card.from_json(progress.fsrs_data)


    rating = (
        Rating.Again
        if review.response == "again"
        else Rating.Good
    )

    card, review_log = scheduler.review_card(
        card,
        rating
    )

    progress.fsrs_data = card.to_json()

    db.commit()


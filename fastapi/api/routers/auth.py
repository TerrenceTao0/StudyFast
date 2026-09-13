from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError

from database import get_db
from models import User
from schemas import RegisterRequest, UserResponse
from hashing import hash_password

##

router = APIRouter(
    prefix="/auth",
    tags=["auth"]
)


@router.post(
    "/register",
    response_model=UserResponse,
    status_code=status.HTTP_201_CREATED
)
def register(
    data: RegisterRequest,
    db: Session = Depends(get_db)
):
    email = data.email.lower().strip()

    # Search for user with same email and reject request if a user is found.
    query = select(User).where(
        User.email == email
    )
    existing_user = db.scalar(query)

    if (existing_user):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="An account with this email already exists"
        )


    hashed_password = hash_password(data.password)

    user = User(
        email=email,
        password_hash=hashed_password
    )


    # Guard against concurrent account creations using same email.
    try:
        db.add(user)
        db.commit()
        db.refresh(user)

    except IntegrityError:
        db.rollback()

        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="An account with this email already exists"
        )


    return user


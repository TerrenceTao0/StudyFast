import os 

from fastapi import APIRouter, Depends, HTTPException, status, Response, Cookie
from sqlalchemy import select
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError

from database import get_db
from models import User
from schemas import RegisterRequest, LoginRequest
from hashing import hash_password, verify_password, create_access_token, decode_access_token

##

router = APIRouter(
    prefix="/auth",
    tags=["auth"]
)

IS_PRODUCTION = os.environ.get("IS_PRODUCTION") == "true"

##

@router.post(
    "/register",
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


@router.post("/login",)
def login(
    data: LoginRequest,
    response: Response,
    db: Session = Depends(get_db)
):
    email = data.email.lower().strip()

    # Check if account with email exists first.
    query = select(User).where(
        User.email == email 
    )
    existing_user = db.scalar(query)

    if (not existing_user):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email or password is not correct."
        )


    # Verify inputted password matches stored hash
    password_matches = verify_password(data.password, existing_user.password_hash)

    if (not password_matches):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email or password is not correct."
        )


    # Create json web token for user login that lasts 24 hours
    token = create_access_token(existing_user.id)

    response.set_cookie(
        key="access_token",
        value=token,
        httponly=True,
        secure=IS_PRODUCTION,
        samesite="lax",
        max_age=60*60*24
    )


def get_current_user(
    access_token: str | None = Cookie(default=None), 
    db: Session = Depends(get_db)
):
    if (access_token is None):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User is not authorized."
        ) 


    uid = decode_access_token(access_token)

    if (uid is None):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User is not authorized."
        )


    user = db.get(User, uid)

    if (user is None):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="This user does not exist."
        )


    return user 


@router.get("/account")
def account(current_user: User = Depends(get_current_user)):
    return {
        "id": current_user.id,
        "email": current_user.email
    }


@router.post("/logout")
def logout(response: Response):
    response.delete_cookie(
        key="access_token",
        path="/"
    )



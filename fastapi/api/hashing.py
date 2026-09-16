import os
import jwt

from datetime import datetime, timedelta, timezone
from dotenv import load_dotenv
from pwdlib import PasswordHash
from jwt.exceptions import InvalidTokenError

##

load_dotenv()

JWT_SECRET = os.environ["JWT_SECRET"]
JWT_ALGORITHM = "HS256"

password_hasher = PasswordHash.recommended()

##

def hash_password(password: str) -> str:
    return password_hasher.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return password_hasher.verify(
        plain_password,
        hashed_password
    )


def create_access_token(user_id: int):
    expiration = datetime.now(timezone.utc) + timedelta(hours=24)

    payload = {
        "sub": str(user_id),
        "exp": expiration
    }

    return jwt.encode(
        payload,
        JWT_SECRET,
        algorithm=JWT_ALGORITHM
    )


def decode_access_token(token: str) -> int | None:
    try:
        payload = jwt.decode(
            token,
            JWT_SECRET,
            algorithms=[JWT_ALGORITHM]
        )

        user_id = payload.get("sub")

        if (user_id is None):
            return None


        return int(user_id)

    except (InvalidTokenError):
        return None

    
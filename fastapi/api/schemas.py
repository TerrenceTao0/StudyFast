from pydantic import BaseModel, EmailStr, Field

##

class RegisterRequest(BaseModel):
    email: EmailStr
    password: str = Field(
        min_length=5,
        max_length=128
    )


class UserResponse(BaseModel):
    # Hashed password should not be exposed to user.
    id: int
    email: EmailStr


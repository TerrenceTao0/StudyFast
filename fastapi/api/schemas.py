from pydantic import BaseModel, EmailStr, Field

##

class RegisterRequest(BaseModel):
    email: EmailStr
    password: str = Field(
        min_length=5,
        max_length=128
    )


class UserResponse(BaseModel):
    id: int
    email: EmailStr


class LoginRequest(BaseModel):
    email: EmailStr
    password: str 

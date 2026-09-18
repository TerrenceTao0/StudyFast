from datetime import datetime
from database import Base

from sqlalchemy import String, ForeignKey, DateTime, BigInteger, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

## 

class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(
        primary_key=True
    )

    email: Mapped[str] = mapped_column(
        String(320),
        unique=True,
        index=True,
        nullable=False
    )

    password_hash: Mapped[str] = mapped_column(
        String(128),
        nullable=False
    )


    # User -< many Document
    documents: Mapped[list["Document"]] = relationship(
        back_populates="user"
    )


class Document(Base):
    __tablename__ = "documents"

    id: Mapped[int] = mapped_column(
        primary_key=True
    )

    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id"),
        nullable=False
    )

    original_filename: Mapped[str] = mapped_column(
        String(255),
        nullable=False
    )

    stored_filename: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
        unique=True
    )
    
    size_bytes: Mapped[int] = mapped_column(
        BigInteger,
        nullable=False
    )

    uploaded_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now()
    )

    title: Mapped[str] = mapped_column(
        String(20),
        nullable=False,
        default="Processing..."
    )


    # Statuses - pending, processing, ready
    status: Mapped[str] = mapped_column(
        String(20),
        nullable=False,
        default="pending"
    )


    # User -< Many Document
    user: Mapped["User"] = relationship(
        back_populates="documents"
    )


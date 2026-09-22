from datetime import datetime
from database import Base

from sqlalchemy import String, ForeignKey, DateTime, BigInteger, func, Text, JSON, Float, UniqueConstraint
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


class TopicMastery(Base):
    __tablename__ = "topic_mastery"

    __table_args__ = (
        UniqueConstraint(
            "user_id",
            "topic_id",
            name="user_topic_mastery"
        ),
    )

    id: Mapped[int] = mapped_column(
        primary_key=True
    )

    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id"),
        nullable=False
    )

    topic_id: Mapped[int] = mapped_column(
        ForeignKey("topics.id"),
        nullable=False
    )


    # Statuses - locked, unlocked, mastered
    status: Mapped[str] = mapped_column(
        String(20),
        nullable=False,
        default="locked"
    )

    mastery: Mapped[float] = mapped_column(
        Float,
        nullable=False,
        default=0
    )

    topic: Mapped["Topic"] = relationship(
        back_populates="mastery_records"
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
        String(100),
        nullable=False,
        default="Pending..."
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


    # Document -< Many Topic
    topics: Mapped[list["Topic"]] = relationship(
        back_populates="document",
        cascade="all, delete-orphan"
    ) 


class Topic(Base):
    __tablename__ = "topics"

    id: Mapped[int] = mapped_column(
        primary_key=True
    )

    document_id: Mapped[int] = mapped_column(
        ForeignKey("documents.id"),
        nullable=False
    )

    name: Mapped[str] = mapped_column(
        String(255),
        nullable=False
    )

    order_index: Mapped[int] = mapped_column(
        nullable=False
    )

    document: Mapped["Document"] = relationship(
        back_populates="topics"
    )


    # Topic -< Many Flashcards
    flashcards: Mapped[list["Flashcard"]] = relationship(
        back_populates="topic",
        cascade="all, delete-orphan"
    )


    # Topic -< Many Question
    questions: Mapped[list["Question"]] = relationship(
        back_populates="topic",
        cascade="all, delete-orphan"
    )


    # Topic -< Many TopicMastery Records
    mastery_records: Mapped[list["TopicMastery"]] = relationship(
        back_populates="topic",
        cascade="all, delete-orphan"
    )


class Flashcard(Base):
    __tablename__ = "flashcards"

    id: Mapped[int] = mapped_column(
        primary_key=True
    )

    topic_id: Mapped[int] = mapped_column(
        ForeignKey("topics.id"),
        nullable=False
    )

    front: Mapped[str] = mapped_column(
        Text, 
        nullable=False
    )

    back: Mapped[str] = mapped_column(
        Text,
        nullable=False
    )


    # Topic -< Many Flashcard
    topic: Mapped["Topic"] = relationship(
        back_populates="flashcards"
    )


    # Flashcard -< Many FlashcardProgress
    flashcard_progress: Mapped[list["FlashcardProgress"]] = relationship(
        back_populates="flashcard",
        cascade="all, delete-orphan"
    )


class FlashcardProgress(Base):
    __tablename__ = "flashcard_progress"

    __table_args__ = (
        UniqueConstraint(
            "user_id",
            "flashcard_id",
            name="user_flashcard_progress"
        ),
    )

    id: Mapped[int] = mapped_column(primary_key=True)

    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id")
    )

    flashcard_id: Mapped[int] = mapped_column(
        ForeignKey("flashcards.id")
    )

    fsrs_data: Mapped[str] = mapped_column(Text)

    flashcard: Mapped["Flashcard"] = relationship(
        back_populates="flashcard_progress"
    )


class Question(Base):
    __tablename__ = "questions"

    id: Mapped[int] = mapped_column(
        primary_key=True
    )

    topic_id: Mapped[int] = mapped_column(
        ForeignKey("topics.id"),
        nullable=False
    )

    question: Mapped[str] = mapped_column(
        Text,
        nullable=False
    )

    options: Mapped[list[str]] = mapped_column(
        JSON,
        nullable=False
    )

    answer: Mapped[str] = mapped_column(
        Text,
        nullable=False
    )

    explanation: Mapped[str] = mapped_column(
        Text,
        nullable=False
    )


    # Difficulties: easy, medium, hard
    difficulty: Mapped[str] = mapped_column(
        String(20),
        nullable=False
    )


    # Topic -< Many Question
    topic: Mapped["Topic"] = relationship(
        back_populates="questions"
    )


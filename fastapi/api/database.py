from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, sessionmaker

##

DATABASE_URL = "sqlite:///./studyfast.db"

engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False}
)

class Base(DeclarativeBase):
    pass

SessionLocal = sessionmaker(
    bind=engine,
    autoflush=False,
    expire_on_commit=False
)


def get_db():
    db = SessionLocal()

    try:
        yield db
    finally:
        db.close()


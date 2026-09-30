import os 

from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, sessionmaker

##

load_dotenv()

# Use the installed psycopg 3 driver even when the URL is a plain postgresql:// one (e.g. from Supabase).
DATABASE_URL = os.environ["DATABASE_URL"].replace("postgresql://", "postgresql+psycopg://", 1)
engine = create_engine(DATABASE_URL)

SessionLocal = sessionmaker(
    bind=engine,
    autoflush=False,
    expire_on_commit=False
)

##

class Base(DeclarativeBase):
    pass

##

def get_db():
    db = SessionLocal()

    try:
        yield db
        
    finally:
        db.close()


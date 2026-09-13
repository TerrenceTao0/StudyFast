from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from database import Base, engine
from routers import auth

##

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Create missing SQLAlchemy model tables.
Base.metadata.create_all(bind=engine)

app.include_router(auth.router)

@app.get("/")
def health_check():
    return {"status": "ok"}


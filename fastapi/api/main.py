from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from database import Base, engine
from routers import auth, documents, flashcards, questions

##

MAX_BODY_SIZE = 36 * 1024 * 1024

##

app = FastAPI()

# Reject oversized bodies before FastAPI parses them, as parsing happens before auth and the upload size check.
@app.middleware("http")
async def limit_body_size(request: Request, call_next):
    # Chunked bodies have no declared length, so they can't be checked up front.
    if ("transfer-encoding" in request.headers):
        return JSONResponse(
            status_code=411,
            content={"detail": "Content-Length required."}
        )


    if (int(request.headers.get("content-length", 0)) > MAX_BODY_SIZE):
        return JSONResponse(
            status_code=413,
            content={"detail": "File is too large."}
        )


    return await call_next(request)


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
app.include_router(documents.router)
app.include_router(flashcards.router)
app.include_router(questions.router)

@app.get("/")
def health_check():
    return {"status": "ok"}


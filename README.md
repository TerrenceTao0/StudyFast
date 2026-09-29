# StudyFast

StudyFast turns a PDF, Word document or text file into a structured course: AI-generated topics ordered from fundamentals to advanced concepts, spaced-repetition flashcards, and multiple-choice quizzes with per-topic mastery tracking.

## Features

- **Document upload**: PDF, DOCX and TXT files up to 35 MB. Files without extractable text are rejected at upload time with an error message.
- **AI course generation**: each document is split into 5–20 granular topics ordered by prerequisite, with 10 flashcards and a 20-question multiple-choice bank per topic.
- **Spaced-repetition flashcards**: reviews are scheduled with [FSRS](https://github.com/open-spaced-repetition/py-fsrs). When every card is on cooldown, a live break timer counts down.
- **Testing**: after the flashcards, a 5-question quiz is drawn at random from the topic's question bank.
- **Mastery tracking**: every answer moves the topic's mastery score, and each document shows its overall mastery.
- **Language-learning support**: non-Latin scripts are generated as `[[native|romanization]]` and rendered with HTML `<ruby>` annotations.
- **Live processing status**: the library polls while documents are being generated, so each one flips from "Processing…" to ready without a page refresh.

## Tech stack

| Layer | Technologies |
| --- | --- |
| Frontend | Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS v4 |
| Backend | FastAPI, SQLAlchemy 2.0, Pydantic |
| Database | PostgreSQL (psycopg 3) |
| Background jobs | Redis, RQ (with retries and a scheduler) |
| AI | OpenAI Responses API with strict JSON-schema structured outputs |
| Auth | Argon2 password hashing (pwdlib), JWT (PyJWT) in an HttpOnly cookie |
| Parsing and scheduling | pypdf, python-docx, py-fsrs |

## Architecture

1. The API streams the file to disk in chunks of 1MB, checks its type, size and readable text, saves a `pending` document and enqueues a job. The request then returns immediately.
2. A worker marks the document `processing`, extracts and cleans the text, and asks the model for a title, topics, flashcards and questions that must match a strict JSON schema.
3. Everything generated for a document is committed in a single transaction, and the status becomes `ready`.
4. The frontend polls until the document is ready, then the user works through each topic: flashcards first, then the quiz.

## Engineering highlights

- Generation runs in an RQ worker. Jobs time out after 5 minutes and retry up to 3 times, waiting 10, 30 and 60 seconds between attempts.
- Errors such as API or network failures reset the document to `pending` and re-raise so RQ retries the job. Unrecoverable errors, such as a corrupt file, raise a dedicated `UnreadableDocumentError`, and the worker deletes the document and the stored file instead of retrying.
- Strict structured outputs enforce topic, flashcard, question and answer-option counts, plus the difficulty values, so the JSON maps straight onto ORM objects.
- File type, minimum and maximum size, and whether the file has extractable text are all checked before anything is queued, so no AI budget is spent on files that can't be processed.
- Each quiz session stores its question IDs and current position, and an answer is accepted only for the current question, so the client can't skip ahead or answer out of order.
- All topics, flashcards and question queries are connected to the current user, so users can't read or change each other's data.

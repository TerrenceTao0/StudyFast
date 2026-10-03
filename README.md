# StudyFast

StudyFast turns a PDF, Word document or text file into a structured course: AI-generated topics ordered from fundamentals to advanced concepts, spaced-repetition flashcards, and multiple-choice quizzes with per-topic mastery tracking.

## Features

- **Document upload**: PDF, DOCX and TXT files up to 35 MB. Files without extractable text are rejected at upload time with an error message.
- **AI course generation**: each document is split into 5–20 granular topics ordered by prerequisite. A topic's 10 flashcards and 20-question multiple-choice bank are generated only when the user presses Generate on it.
- **Spaced-repetition flashcards**: reviews are scheduled with [FSRS](https://github.com/open-spaced-repetition/py-fsrs). When every card is on cooldown, a live break timer counts down.
- **Testing**: after the flashcards, a 5-question quiz is drawn at random from the topic's question bank.
- **Mastery tracking**: every answer moves the topic's mastery score, and each document shows its overall mastery.
- **Language-learning support**: non-Latin scripts are generated as `[[native|romanization]]` and rendered with HTML `<ruby>` annotations.
- **Live processing status**: the library and topic map poll while documents or topics are being generated, so each one flips to ready without a page refresh.

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

1. The API streams the file to disk in chunks of 1MB, checks its type and size, extracts and cleans its text, saves a `pending` document with that text, deletes the file and enqueues a job. The request then returns immediately.
2. A worker marks the document `processing`, splits the stored text into numbered sections of about a page, and asks the model for a title and an ordered topic list, with the sections each topic needs. The response must match a strict JSON schema.
3. The topics are committed in a single transaction, each storing only its own sections, and the document becomes `ready`.
4. When the user presses Generate on an unlocked topic, a second job sends only that topic's sections to the model and saves its flashcards and questions.
5. The frontend polls until the topic is ready, then the user works through it: flashcards first, then the quiz.

## Engineering highlights

- Generation runs in an RQ worker. Jobs time out after 5 minutes, and document jobs retry up to 3 times, waiting 10, 30 and 60 seconds between attempts.
- Errors such as API or network failures reset the document to `pending` and re-raise so RQ retries the job. A failed topic is marked `failed` instead, so the user can press Try again rather than wait on a stuck topic.
- Topic content is generated on demand and only for unlocked topics, so no AI budget is spent on topics a user never reaches. Each topic call sends only that topic's sections rather than the whole document.
- Generating a topic locks its row, so a double click can't queue it twice.
- The extracted text is stored with the document, so the worker never needs the uploaded file and the API and worker can run on separate machines.
- Strict structured outputs enforce topic, flashcard, question and answer-option counts, plus the difficulty values, so the JSON maps straight onto ORM objects.
- File type, minimum and maximum size, and whether the file has extractable text are all checked before anything is queued, so no AI budget is spent on files that can't be processed.
- Each quiz session stores its question IDs and current position, and an answer is accepted only for the current question, so the client can't skip ahead or answer out of order.
- All topics, flashcards and question queries are connected to the current user, so users can't read or change each other's data.

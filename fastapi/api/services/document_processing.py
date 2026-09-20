from pathlib import Path

from pypdf import PdfReader
from docx import Document as DocxDocument

from openai import OpenAI

import json 

##

UPLOAD_PATH = Path(__file__).resolve().parent.parent / "uploads"
client = OpenAI()

##

def extract_pdf(file_path: Path) -> str:
    reader = PdfReader(file_path)

    pages = []

    for page in reader.pages:
        text = page.extract_text()

        if (text):
            pages.append(text)


    return "\n".join(pages)


def extract_docx(file_path: Path) -> str:
    document = DocxDocument(file_path)

    paragraphs = []

    for paragraph in document.paragraphs:
        text = paragraph.text.strip()

        if (text):
            paragraphs.append(text)


    return "\n".join(paragraphs)


def extract_txt(file_path: Path) -> str:
    return file_path.read_text(
        encoding="utf-8",
        errors="replace"
    )


def extract_text(file_path: Path) -> str:
    extension = file_path.suffix.lower()

    if (extension == ".pdf"):
        return extract_pdf(file_path)


    if (extension == ".docx"):
        return extract_docx(file_path)


    if (extension == ".txt"):
        return extract_txt(file_path)


    raise ValueError(
        f"Unsupported file type: {extension}"
    )


def analyze(text: str) -> dict: 
    if (not text.strip()):
        raise ValueError("No text found.")


    response = client.responses.create(
        model="gpt-5.6-luna",

        instructions="""
            You analyze educational study materials.

            Generate:
            1. A concise descriptive title that cannot exceed 100 characters.
            2. A list of the main topics covered.
            3. Flashcards covering important facts, definitions, concepts, formulas, and relationships.
            4. A reusable question bank for practice sessions.

            Topic ordering requirements:
            - Order topics in a logical learning progression from foundational concepts to more advanced concepts.
            - Earlier topics should contain prerequisite knowledge needed to understand later topics.
            - Do not place an advanced topic before a simpler prerequisite topic.
            - When the source material itself follows a sensible teaching order, preserve that order.
            - If the source material is poorly ordered, reorder the topics into a more pedagogically appropriate sequence.
            - Prefer conceptual dependency over the order in which keywords happen to appear in the document.
            - For example, basic algebra should appear before calculus if calculus depends on that algebraic knowledge.
            - Keep closely related topics together.
            - Avoid duplicate or overlapping topic names.

            Study material requirements:
            - Base all generated content on the supplied material.
            - Do not invent facts that are not supported by the material.
            - Cover the material broadly rather than focusing heavily on one section.
            - Avoid duplicate or near-duplicate flashcards and questions.
            - Make flashcards concise and useful for active recall.
            - Associate each flashcard and question with one of the generated topics.
            - Questions should test understanding rather than merely copy sentences from the text.
            - Include a mixture of easy, medium, and hard questions.
            - Every question must be multiple-choice.
            - Provide exactly four distinct and plausible answer options.
            - Exactly one option for the question must be correct.
            - The other three answer options should be plausible but incorrect.
            - Include a short explanation for the answer for every question.
        """,

        input=text[:100_000],

        text={
            "format": {
                "type": "json_schema",
                "name": "study_material",
                "strict": True,
                "schema": {
                    "type": "object",
                    "properties": {
                        "title": {
                            "type": "string"
                        },
                        "topics": {
                            "type": "array",
                            "items": {
                                "type": "object",
                                "properties": {
                                    "name": {
                                        "type": "string"
                                    },
                                    "flashcards": {
                                        "type": "array",
                                        "items": {
                                            "type": "object",
                                            "properties": {
                                                "front": {
                                                    "type": "string"
                                                },
                                                "back": {
                                                    "type": "string"
                                                }
                                            },
                                            "required": [
                                                "front",
                                                "back"
                                            ],
                                            "additionalProperties": False
                                        }
                                    },
                                    "question_bank": {
                                        "type": "array",
                                        "items": {
                                            "type": "object",
                                            "properties": {
                                                "question": {
                                                    "type": "string"
                                                },
                                                "options": {
                                                    "type": "array",
                                                    "minItems": 4,
                                                    "maxItems": 4,
                                                    "items": {
                                                        "type": "string"
                                                    }
                                                },
                                                "answer": {
                                                    "type": "string"
                                                },
                                                "explanation": {
                                                    "type": "string"
                                                },
                                                "difficulty": {
                                                    "type": "string",
                                                    "enum": [
                                                        "easy",
                                                        "medium",
                                                        "hard"
                                                    ]
                                                }
                                            },
                                            "required": [
                                                "question",
                                                "options",
                                                "answer",
                                                "explanation",
                                                "difficulty"
                                            ],
                                            "additionalProperties": False
                                        }
                                    }
                                },
                                "required": [
                                    "name",
                                    "flashcards",
                                    "question_bank"
                                ],
                                "additionalProperties": False
                            }
                        }
                    },
                    "required": [
                        "title",
                        "topics"
                    ],
                    "additionalProperties": False
                }
            }
        }
    )


    result = json.loads(response.output_text)

    return result 


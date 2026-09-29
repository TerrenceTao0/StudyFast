from pathlib import Path
import re
import json 

from pypdf import PdfReader
from docx import Document as DocxDocument

from openai import OpenAI

##

UPLOAD_PATH = Path(__file__).resolve().parent.parent / "uploads"
client = OpenAI()

content_generation_prompt = open(Path(__file__).resolve().parent.parent / "prompts" / "content_generation.txt", "r", encoding="utf-8",).read()

##

# Raised when a document can never be processed, so retrying is pointless.
class UnreadableDocumentError(Exception):
    pass

##

def clean_text(text: str):
    # Replace repeated spaces/tabs with one space
    text = re.sub(r"[ \t]+", " ", text)

    # Replace 3+ newlines with 2
    text = re.sub(r"\n{3,}", "\n\n", text)

    return text.strip()


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
    extractors = {
        ".pdf": extract_pdf,
        ".docx": extract_docx,
        ".txt": extract_txt
    }

    if (extension not in extractors):
        raise UnreadableDocumentError(
            f"Unsupported file type: {extension}"
        )


    try:
        text = extractors[extension](file_path)

    except Exception as error:
        raise UnreadableDocumentError(
            "The file could not be read. It may be corrupted."
        ) from error


    # Scanned PDFs are only images, so they have no extractable text.
    if (not text.strip()):
        raise UnreadableDocumentError(
            "No readable text found in this file. Scanned PDFs are not supported."
        )


    # Clean the text to save on context window and speed up processing time.
    return clean_text(text)


def analyze(text: str) -> dict: 
    if (not text.strip()):
        raise ValueError("No text found.")


    response = client.responses.create(
        model="gpt-5.6-luna",

        instructions=content_generation_prompt,

        # Max context window is 1M tokens so we need to restrict text content size.
        input=text[:1_000_000],

        text={
            "format": {
                "type": "json_schema",
                "name": "study_material",
                "strict": True,
                "schema": {
                    "type": "object",
                    "properties": {
                        "title": {
                            "type": "string",
                            "maxLength": 100
                        },
                        "topics": {
                            "type": "array",
                            "minItems": 5,
                            "maxItems": 20,
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
                                        },
                                        "minItems": 10,
                                        "maxItems": 10
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
                                                "difficulty"
                                            ],
                                            "additionalProperties": False
                                        },
                                        "minItems": 20,
                                        "maxItems": 20
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


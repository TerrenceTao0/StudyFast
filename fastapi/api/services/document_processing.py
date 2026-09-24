from pathlib import Path
import re
import json 

from pypdf import PdfReader
from docx import Document as DocxDocument

from openai import OpenAI

##

UPLOAD_PATH = Path(__file__).resolve().parent.parent / "uploads"
client = OpenAI()

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
    text = None

    if (extension == ".pdf"):
        text = extract_pdf(file_path)

    elif (extension == ".docx"):
        text = extract_docx(file_path)

    elif (extension == ".txt"):
        text = extract_txt(file_path)


    if (text):
        # Clean the text to save on context window and speed up processing time.
        return clean_text(text)


    raise ValueError(
        f"Unsupported file type: {extension}"
    )


def analyze(text: str) -> dict: 
    if (not text.strip()):
        raise ValueError("No text found.")


    response = client.responses.create(
        model="gpt-5.6-luna",

        instructions="""
            You analyze educational study materials and generate structured study content.

            Your job is to identify the important knowledge in the supplied material
            and turn it into a logical learning progression with useful flashcards
            and multiple-choice questions.

            Generate:
            1. A concise descriptive title, maximum 100 characters.
            2. A list of granular topics covered by the material.
            3. Exactly 10 flashcards for each topic.
            4. Exactly 20 multiple-choice question for each topic.

            TOPIC REQUIREMENTS

            - Order topics in a logical learning progression from foundational concepts
            to more advanced concepts.
            - Earlier topics should contain prerequisite knowledge needed to understand
            later topics.
            - Do not place an advanced topic before a simpler prerequisite topic.
            - When the source material already follows a sensible teaching order,
            preserve that order.
            - If the material is poorly ordered, reorganize the topics into a more
            pedagogically useful sequence.
            - Prefer conceptual dependency over the order in which keywords happen
            to appear.
            - Keep closely related topics near each other.
            - Avoid duplicate or heavily overlapping topic names.
            - Make topics as granular as reasonably possible.
            - Each topic should focus on one independently learnable concept, skill,
            rule, method, or idea.
            - Avoid broad chapter-sized topics when they can be split into smaller
            meaningful topics.
            - Example:
            Do not use one broad topic called "Integration" if the material separately
            teaches integration by substitution, integration by parts, and partial
            fractions. Those should be separate topics.
            - Try generate as many topics as possible so it feels like a genuine course.

            STUDY MATERIAL REQUIREMENTS

            - Base all generated content on the supplied material.
            - Cover the material broadly rather than focusing too heavily on one section.
            - Prioritize knowledge that is useful to remember, understand, or apply.
            - Avoid trivial or incidental details unless they are important to the
            subject of the material.
            - Avoid duplicate or near-duplicate flashcards.
            - Make flashcards concise and suitable for active recall.
            - Associate every flashcard and every question with exactly one generated topic.
            - Questions should test understanding, application, recognition, or recall,
            rather than merely copy sentences from the source.
            - Include a mixture of easy, medium, and hard questions.
            - Every question must have exactly four distinct answer options.
            - Each question does not have to be entirely unique. 
            - Exactly one answer option must be correct.
            - Incorrect options should be plausible enough to require actual knowledge, 
            but must still be clearly wrong.
            - Every question must include a short explanation of why the correct answer is correct.

            GENERAL FORMATTING RULES

            - Put ordinary literal terms, vocabulary words, phrases, symbols, commands,
            or expressions in quotation marks when they are being explicitly discussed.
            - Examples:
            - What does "photosynthesis" refer to?
            - What does the command "git status" do?
            - For languages that use a non-Latin writing system, the special language
            formatting rules below take priority over ordinary quotation formatting.

            LANGUAGE LEARNING FORMATTING - REQUIRED

            When the material teaches, explains, or discusses a language whose normal
            writing system is non-Latin:

            1. Preserve the actual target-language vocabulary and expressions.
            Do not replace relevant target-language words or phrases with only an
            English translation.

            2. Every target-language word or phrase that has a standard romanization
            MUST be written using exactly this syntax:

            [[native script|romanization]]

            3. The romanization is the main readable text shown to the learner.
            The native script is the annotation that will be displayed above it.

            4. Never output:
            - native script by itself when a standard romanization exists
            - romanization by itself when the native script is known
            - an English translation as a replacement for the target-language
                expression when that expression itself is relevant

            5. English translations may be used to explain meaning, but they must not
            replace the target-language expression being taught or discussed.

            6. Apply the [[native script|romanization]] syntax everywhere target-language
            text appears, including:
            - flashcard fronts
            - flashcard backs
            - practice questions
            - multiple-choice answer options
            - explanations
            - example sentences

            7. When an entire example sentence is in the target language, annotate every
            target-language word or meaningful unit that should be readable to a learner.

            8. Never leave bare target-language romanization inside:
            - quotation marks
            - parentheses
            - example sentences
            - grammar explanations
            - answer options

            9. Never leave bare native script when a standard romanization is available.

            10. Before returning the generated study material, inspect every
                target-language word or phrase.
                If it can be represented as [[native script|romanization]], it MUST use
                that format.

            LANGUAGE FORMATTING EXAMPLES

            Incorrect:
            Use the person's name plus "さん".

            Incorrect:
            Use the person's name plus "san".

            Correct:
            Use the person's name plus [[さん|san]].

            Incorrect:
            What does "です" mean?

            Incorrect:
            What does "desu" mean?

            Correct:
            What does [[です|desu]] mean?

            Incorrect:
            What is the role of "wa" in "watashi wa Anna desu"?

            Correct:
            What is the role of [[は|wa]] in
            "[[私|watashi]] [[は|wa]] [[アンナ|Anna]] [[です|desu]]"?

            Incorrect:
            Which word means "cat"?
            A. neko
            B. inu
            C. tori
            D. sakana

            Correct:
            Which word means "cat"?
            A. [[猫|neko]]
            B. [[犬|inu]]
            C. [[鳥|tori]]
            D. [[魚|sakana]]

            IMPORTANT LANGUAGE QUESTION RULE

            Do not accidentally reveal the answer inside the question.

            For example, if the question asks for the pronunciation of a native-script
            term, do not display its romanization on the front because that would reveal
            the answer.

            Bad:
            How is [[は|wa]] pronounced when used as the topic particle?

            Better:
            Which pronunciation is used for "は" when it functions as the topic particle?
        """,

        # Max context window is 1M tokens.
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
                            "type": "string"
                        },
                        "topics": {
                            "type": "array",
                            "minItems": 10,
                            "maxItems": 50,
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


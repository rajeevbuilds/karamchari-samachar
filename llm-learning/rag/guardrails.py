"""Concepts 21 and 22 - Hallucination and Guardrails.

The cheapest anti-hallucination guardrail: if retrieval found nothing
relevant, do not even call the model - say "I don't know" instead.
"""
from .vectorstore import Hit

MAX_QUESTION_CHARS = 500
MIN_SCORE = 0.12  # below this, the retrieved text is not really about the question

NO_ANSWER = "I couldn't find this in the circulars I have, so I won't guess."


def check_question(question: str) -> str | None:
    """Return an error message if the input should be rejected, else None."""
    if not question.strip():
        return "Please type a question."
    if len(question) > MAX_QUESTION_CHARS:
        return f"Please keep the question under {MAX_QUESTION_CHARS} characters."
    return None


def relevant(hits: list[Hit]) -> list[Hit]:
    return [h for h in hits if h.score >= MIN_SCORE]

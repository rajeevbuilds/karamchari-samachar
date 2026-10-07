"""Concepts 10-13 - Prompt, System prompt, User prompt, Few-shot."""
from .vectorstore import Hit

# Concept 11: the system prompt sets role and rules.
SYSTEM_PROMPT = """You are a helpful assistant for Central Government employees in India.
Answer ONLY from the circular excerpts given in the user message.
If the excerpts do not contain the answer, say you could not find it - never guess.
Be brief (2-4 sentences) and end with the source ids in square brackets, e.g. [DEMO-DA-01]."""

# Concept 13: few-shot - one worked example shows the exact style we want.
FEW_SHOT = """Example
Question: How long do I have to claim travel allowance?
Excerpt [X-1]: Claims must be submitted within 30 days of the journey.
Answer: Claims must be submitted within 30 days of completing the journey. [X-1]
"""


def build_user_prompt(question: str, hits: list[Hit]) -> str:
    # Concept 12: the user prompt = the real question plus retrieved context.
    excerpts = "\n".join(f"Excerpt [{h.chunk.source_id}]: {h.chunk.text}" for h in hits)
    return f"{FEW_SHOT}\nNow the real task.\n{excerpts}\nQuestion: {question}\nAnswer:"

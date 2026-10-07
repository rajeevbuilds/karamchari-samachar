"""Concepts 16, 19, 20, 26-28 - Temperature, Stop sequence, Max tokens, API.

If ANTHROPIC_API_KEY is set (and `pip install anthropic`), we call Claude over
the API. Otherwise we fall back to an offline "extractive" answerer that just
picks the best sentences - not a real LLM, but it lets the whole pipeline run
with no key so you can study the retrieval half.
"""
import os

from .tokenize import tokenize
from .vectorstore import Hit

DEFAULT_MODEL = os.environ.get("CHAT_MODEL", "claude-haiku-4-5-20251001")


def have_api() -> bool:
    if not os.environ.get("ANTHROPIC_API_KEY"):
        return False
    try:
        import anthropic  # noqa: F401
    except ImportError:
        return False
    return True


def generate(system: str, user: str, *, temperature: float = 0.0, max_tokens: int = 300,
             stop_sequences: list[str] | None = None) -> str:
    import anthropic

    client = anthropic.Anthropic()
    response = client.messages.create(
        model=DEFAULT_MODEL,
        system=system,
        messages=[{"role": "user", "content": user}],
        temperature=temperature,      # 0 = focused and repeatable, 1 = more varied
        max_tokens=max_tokens,        # hard cap on answer length
        stop_sequences=stop_sequences or ["\nQuestion:"],  # stop if it starts a new Q&A
    )
    return "".join(block.text for block in response.content if block.type == "text").strip()


def extractive_answer(question: str, hits: list[Hit]) -> str:
    """Offline fallback: return the retrieved sentence sharing most words with the question."""
    q = set(tokenize(question))
    best, best_overlap = None, -1
    for h in hits:
        for sentence in h.chunk.text.split(". "):
            overlap = len(q & set(tokenize(sentence)))
            if overlap > best_overlap:
                best, best_overlap = (sentence.rstrip("."), h.chunk.source_id), overlap
    sentence, source = best
    return f"{sentence}. [{source}]"

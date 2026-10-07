"""Concept 25 - RAG: Retrieve relevant chunks, Augment the prompt, Generate."""
import json
from dataclasses import dataclass
from pathlib import Path

from . import guardrails, llm
from .prompt import SYSTEM_PROMPT, build_user_prompt
from .vectorstore import Chunk, Hit, VectorStore

DATA = Path(__file__).resolve().parent.parent / "data" / "circulars.json"


def load_store(path: Path = DATA) -> VectorStore:
    chunks = [
        Chunk(text=p, source_id=c["id"], title=c["title"], date=c["date"])
        for c in json.loads(path.read_text(encoding="utf-8"))
        for p in c["paragraphs"]  # one chunk per paragraph
    ]
    return VectorStore(chunks)


@dataclass
class Answer:
    text: str
    hits: list[Hit]
    prompt: str | None  # the exact prompt sent to the model (None if no model call)
    mode: str           # "claude", "offline" or "refused"


def ask(store: VectorStore, question: str, *, top_k: int = 3, temperature: float = 0.0,
        max_tokens: int = 300) -> Answer:
    error = guardrails.check_question(question)
    if error:
        return Answer(error, [], None, "refused")

    hits = guardrails.relevant(store.search(question, top_k=top_k))
    if not hits:
        return Answer(guardrails.NO_ANSWER, [], None, "refused")

    prompt = build_user_prompt(question, hits)
    if llm.have_api():
        text = llm.generate(SYSTEM_PROMPT, prompt, temperature=temperature, max_tokens=max_tokens)
        return Answer(text, hits, prompt, "claude")
    return Answer(llm.extractive_answer(question, hits), hits, prompt, "offline")

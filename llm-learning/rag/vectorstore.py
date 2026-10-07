"""Concept 24 - Vector database (and Concept 18, Top K).

A vector database stores embeddings and finds the closest ones fast. This one
is a plain numpy matrix with brute-force search - fine for thousands of
chunks. FAISS / pgvector do the same job at scale.
"""
from dataclasses import dataclass

import numpy as np

from .embed import TfidfEmbedder


@dataclass
class Chunk:
    text: str
    source_id: str
    title: str
    date: str


@dataclass
class Hit:
    chunk: Chunk
    score: float  # cosine similarity, 0..1


class VectorStore:
    def __init__(self, chunks: list[Chunk]):
        self.chunks = chunks
        self.embedder = TfidfEmbedder().fit([c.text for c in chunks])
        self.matrix = np.vstack([self.embedder.embed(c.text) for c in chunks])

    def search(self, query: str, top_k: int = 3) -> list[Hit]:
        scores = self.matrix @ self.embedder.embed(query)
        best = np.argsort(scores)[::-1][:top_k]  # top-k most similar chunks
        return [Hit(self.chunks[i], float(scores[i])) for i in best]

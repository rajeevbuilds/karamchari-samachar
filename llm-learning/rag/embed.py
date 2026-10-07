"""Concept 23 - Embeddings.

An embedding turns text into a vector of numbers so that similar texts end up
close together. Production systems use a neural model; here we use TF-IDF,
which is the classic hand-built version and needs nothing but numpy.
"""
import math
from collections import Counter

import numpy as np

from .tokenize import tokenize


class TfidfEmbedder:
    def fit(self, texts: list[str]) -> "TfidfEmbedder":
        docs = [set(tokenize(t)) for t in texts]
        vocab = sorted(set().union(*docs))
        self.index = {w: i for i, w in enumerate(vocab)}
        n = len(texts)
        # Rare words get a bigger weight: they say more about a document.
        self.idf = np.array(
            [math.log((1 + n) / (1 + sum(w in d for d in docs))) + 1 for w in vocab]
        )
        return self

    def embed(self, text: str) -> np.ndarray:
        vec = np.zeros(len(self.index))
        for word, count in Counter(tokenize(text)).items():
            i = self.index.get(word)
            if i is not None:
                vec[i] = count * self.idf[i]
        norm = np.linalg.norm(vec)
        return vec / norm if norm else vec  # unit length -> dot product == cosine

"""Concept 2 - Tokenization.

Real LLMs use sub-word tokenizers (BPE). We use a much simpler word-level
tokenizer, which is enough to show the idea: text in, list of tokens out.
"""
import re

STOPWORDS = frozenset(
    "a an and are as at be by for from has have in is it of on or that the this to was were will with within when what which who how can may".split()
)

_WORD = re.compile(r"[a-z0-9]+")

# TF-IDF only matches identical words, so it cannot know that "DA" means
# "Dearness Allowance". A neural embedding model learns such links on its own;
# here we spell the common abbreviations out by hand.
ALIASES = {
    "da": ["dearness", "allowance"],
    "dr": ["dearness", "relief"],
    "ltc": ["leave", "travel", "concession"],
    "ta": ["travelling", "allowance"],
    "cpc": ["pay", "commission"],
    "percentage": ["percent"],
}


def tokenize(text: str, drop_stopwords: bool = True) -> list[str]:
    tokens = [a for t in _WORD.findall(text.lower()) for a in ALIASES.get(t, [t])]
    if drop_stopwords:
        tokens = [t for t in tokens if t not in STOPWORDS]
    return [_stem(t) for t in tokens]


def _stem(token: str) -> str:
    """Tiny suffix stripper so 'allowances' matches 'allowance'."""
    for suffix in ("ing", "s"):
        if token.endswith(suffix) and len(token) - len(suffix) >= 4:
            return token[: -len(suffix)]
    return token

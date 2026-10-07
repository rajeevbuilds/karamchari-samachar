# LLM learning project: circulars Q&A (RAG)

A small chatbot that answers questions from circulars, built to practise the
"30 LLM concepts". The data in `data/circulars.json` is **made-up sample
text**, not real government orders.

## Run

```
python3 -m rag.chat "What is the new DA percentage?" --show-prompt
python3 -m rag.chat                       # interactive
python3 -m unittest discover -s tests -t .
```

Needs only `numpy`. To use a real LLM: `pip install anthropic` and set
`ANTHROPIC_API_KEY`; otherwise an offline fallback picks the best sentence.

## Where each concept lives

| Concept | File |
|---|---|
| 2 Tokenization | `rag/tokenize.py` |
| 23 Embeddings | `rag/embed.py` |
| 18 Top K, 24 Vector database | `rag/vectorstore.py` |
| 10-13 Prompt, system/user prompt, few-shot | `rag/prompt.py` |
| 16, 19, 20, 28 Temperature, stop sequence, max tokens, API | `rag/llm.py` |
| 21, 22 Hallucination, guardrails | `rag/guardrails.py` |
| 25 RAG | `rag/pipeline.py` |

## Try these experiments

1. `--show-prompt`: read exactly what the model receives.
2. `--top-k 1` vs `--top-k 5`: how much context helps or hurts.
3. Ask "What is the DA?" vs "What is dearness allowance?" and remove the alias
   table in `tokenize.py`: see why real embedding models beat keyword matching.
4. Ask something off-topic: watch the guardrail refuse instead of hallucinating.

## Next steps

- Add railway circulars with a `category` field and filter retrieval by it.
- Replace TF-IDF with a neural embedding model.
- Add tools / an agent (DA arrears calculator).

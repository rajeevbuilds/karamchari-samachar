"""Run:  python -m rag.chat "What is the new DA rate?" [--show-prompt] [--top-k 3]"""
import argparse

from .pipeline import ask, load_store


def main() -> None:
    parser = argparse.ArgumentParser(description="Ask questions about sample circulars (RAG demo)")
    parser.add_argument("question", nargs="?", help="omit for interactive mode")
    parser.add_argument("--top-k", type=int, default=3)
    parser.add_argument("--temperature", type=float, default=0.0)
    parser.add_argument("--max-tokens", type=int, default=300)
    parser.add_argument("--show-prompt", action="store_true", help="print the exact prompt sent to the model")
    args = parser.parse_args()

    store = load_store()

    def run(question: str) -> None:
        a = ask(store, question, top_k=args.top_k, temperature=args.temperature, max_tokens=args.max_tokens)
        print(f"\n[{a.mode}] {a.text}")
        for h in a.hits:
            print(f"   - {h.score:.2f}  {h.chunk.source_id}: {h.chunk.text[:70]}...")
        if args.show_prompt and a.prompt:
            print("\n----- prompt sent to the model -----\n" + a.prompt)

    if args.question:
        run(args.question)
        return
    while (q := input("\nAsk (blank to quit): ").strip()):
        run(q)


if __name__ == "__main__":
    main()

import os
import unittest

os.environ.pop("ANTHROPIC_API_KEY", None)  # tests always run offline

from rag.pipeline import ask, load_store
from rag.tokenize import tokenize


class RagTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.store = load_store()

    def test_tokenize_drops_stopwords_and_stems(self):
        self.assertEqual(tokenize("The allowances are payable"), ["allowance", "payable"])

    def test_retrieval_finds_right_circular(self):
        cases = {
            "What is the new DA percentage?": "DEMO-DA-01",
            "How often can I take LTC?": "DEMO-LV-03",
            "How much pension can be commuted?": "DEMO-PN-04",
            "When will the 8th Pay Commission report?": "DEMO-CPC-06",
        }
        for question, expected in cases.items():
            top = self.store.search(question, top_k=1)[0]
            self.assertEqual(top.chunk.source_id, expected, question)

    def test_unknown_topic_is_refused(self):
        a = ask(self.store, "Who won the cricket world cup?")
        self.assertEqual(a.mode, "refused")
        self.assertIn("won't guess", a.text)

    def test_empty_and_overlong_input_refused(self):
        self.assertEqual(ask(self.store, "  ").mode, "refused")
        self.assertEqual(ask(self.store, "x" * 600).mode, "refused")

    def test_answer_cites_source(self):
        a = ask(self.store, "What is the new DA percentage?")
        self.assertIn("[DEMO-DA-01]", a.text)
        self.assertIn("Question: What is the new DA percentage?", a.prompt)


if __name__ == "__main__":
    unittest.main()

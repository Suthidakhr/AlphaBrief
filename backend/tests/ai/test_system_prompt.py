from pathlib import Path

from app.ai import prompts

PROMPT_FILE = Path(__file__).resolve().parent.parent.parent / "app" / "ai" / "prompts.py"


def test_prompt_file_exists():
    assert PROMPT_FILE.exists(), f"System prompt file not found at {PROMPT_FILE}"


def test_no_price_predictions_constraint():
    assert "price prediction" in prompts.SYSTEM_PROMPT.lower(), \
        "Prompt must explicitly constrain price predictions (NFR-AI01)"


def test_no_security_recommendations_constraint():
    assert "security recommendation" in prompts.SYSTEM_PROMPT.lower(), \
        "Prompt must explicitly constrain security recommendations (NFR-AI01)"


def test_sentiment_values_constrained():
    for value in ("bullish", "bearish", "neutral"):
        assert value in prompts.SYSTEM_PROMPT, \
            f"Prompt must enumerate valid sentiment value: {value!r} (FR-A05)"


def test_disclaimer_phrase_present():
    phrase = "for informational purposes only and does not constitute investment advice"
    assert phrase in prompts.SYSTEM_PROMPT.lower(), \
        "Prompt must contain the mandatory disclaimer phrase (FR-A04)"

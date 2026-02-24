"""Evaluates student answers using the Claude API."""

import json
import os

import anthropic


SYSTEM_TEMPLATE = """You are a friendly, encouraging tutor helping a Grade 8 student study for their Alberta Social Studies exam on Edo Period Japan.

The student was asked: "{prompt_text}"

The key points their answer should include:
{rubric_points}

Evaluate their answer. Respond in this exact JSON format:
{{
  "points_hit": ["point 1 they covered", ...],
  "points_missed": ["point they missed", ...],
  "score": 3,
  "total": 4,
  "praise": "...",
  "hint": "...",
  "model_answer": "..."
}}

Be warm and encouraging. This is a 13-year-old studying for an exam.
Recognize partial understanding. Never be condescending.
Use language appropriate for a Grade 8 student."""


def _build_system_prompt(prompt_text: str, rubric: list[str]) -> str:
    rubric_points = "\n".join(f"- {point}" for point in rubric)
    return SYSTEM_TEMPLATE.format(
        prompt_text=prompt_text, rubric_points=rubric_points
    )


def _parse_response(text: str) -> dict:
    """Extract JSON from Claude's response, handling markdown code blocks."""
    cleaned = text.strip()
    if cleaned.startswith("```"):
        # Remove code block markers
        lines = cleaned.split("\n")
        lines = [l for l in lines if not l.strip().startswith("```")]
        cleaned = "\n".join(lines)
    return json.loads(cleaned)


async def evaluate_answer(prompt_text: str, rubric: list[str], student_answer: str) -> dict:
    api_key = os.environ.get("ANTHROPIC_API_KEY")
    if not api_key:
        raise EnvironmentError("ANTHROPIC_API_KEY environment variable is not set")

    client = anthropic.Anthropic(api_key=api_key)
    system_prompt = _build_system_prompt(prompt_text, rubric)

    message = client.messages.create(
        model="claude-sonnet-4-5-20250929",
        max_tokens=1024,
        system=system_prompt,
        messages=[{"role": "user", "content": student_answer}],
    )

    response_text = message.content[0].text

    try:
        result = _parse_response(response_text)
    except (json.JSONDecodeError, IndexError):
        # Graceful fallback if Claude doesn't return valid JSON
        return {
            "points_hit": [],
            "points_missed": rubric,
            "score": 0,
            "total": len(rubric),
            "praise": "Thanks for your answer! I had a little trouble analyzing it.",
            "hint": "Try to be more specific about the key points.",
            "model_answer": response_text,
        }

    # Validate and normalize
    return {
        "points_hit": result.get("points_hit", []),
        "points_missed": result.get("points_missed", []),
        "score": int(result.get("score", 0)),
        "total": int(result.get("total", len(rubric))),
        "praise": result.get("praise", ""),
        "hint": result.get("hint", ""),
        "model_answer": result.get("model_answer", ""),
    }

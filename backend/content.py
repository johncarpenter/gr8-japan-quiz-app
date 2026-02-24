"""Content loader — reads JSON files from the content/ directory."""

import json
from pathlib import Path
from typing import Optional

CONTENT_DIR = Path(__file__).resolve().parent.parent / "content"


def _load_json(filename: str) -> dict:
    filepath = CONTENT_DIR / filename
    with open(filepath, "r", encoding="utf-8") as f:
        return json.load(f)


def get_flashcards(
    category: Optional[str] = None, difficulty: Optional[str] = None
) -> list[dict]:
    data = _load_json("flashcards.json")
    cards = data.get("cards", [])
    if category:
        cards = [c for c in cards if c["category"].lower() == category.lower()]
    if difficulty:
        cards = [c for c in cards if c["difficulty"].lower() == difficulty.lower()]
    return cards


def get_quiz_questions(
    count: Optional[int] = None,
    category: Optional[str] = None,
    difficulty: Optional[str] = None,
) -> list[dict]:
    import random

    data = _load_json("quiz_questions.json")
    questions = data.get("questions", [])
    if category:
        cats = [c.strip().lower() for c in category.split(",")]
        questions = [q for q in questions if q["category"].lower() in cats]
    if difficulty:
        questions = [
            q for q in questions if q["difficulty"].lower() == difficulty.lower()
        ]
    random.shuffle(questions)
    if count and count < len(questions):
        questions = questions[:count]
    return questions


def get_explain_prompts(
    category: Optional[str] = None, difficulty: Optional[str] = None
) -> list[dict]:
    data = _load_json("explain_prompts.json")
    prompts = data.get("prompts", [])
    if category:
        prompts = [p for p in prompts if p["category"].lower() == category.lower()]
    if difficulty:
        prompts = [
            p for p in prompts if p["difficulty"].lower() == difficulty.lower()
        ]
    return prompts


def get_explain_prompts_without_rubrics(
    category: Optional[str] = None, difficulty: Optional[str] = None
) -> list[dict]:
    prompts = get_explain_prompts(category, difficulty)
    return [
        {k: v for k, v in p.items() if k != "rubric"}
        for p in prompts
    ]


def get_prompt_by_id(prompt_id: str) -> Optional[dict]:
    data = _load_json("explain_prompts.json")
    for p in data.get("prompts", []):
        if p["id"] == prompt_id:
            return p
    return None


def get_categories() -> list[str]:
    categories = set()
    for loader, key in [
        ("flashcards.json", "cards"),
        ("quiz_questions.json", "questions"),
        ("explain_prompts.json", "prompts"),
    ]:
        try:
            data = _load_json(loader)
            for item in data.get(key, []):
                categories.add(item.get("category", ""))
        except (FileNotFoundError, json.JSONDecodeError):
            continue
    return sorted(c for c in categories if c)


def get_stats() -> dict:
    stats = {"flashcards": 0, "quiz_questions": 0, "explain_prompts": 0, "by_category": {}}
    try:
        cards = _load_json("flashcards.json").get("cards", [])
        stats["flashcards"] = len(cards)
        for c in cards:
            cat = c.get("category", "Unknown")
            stats["by_category"].setdefault(cat, {"flashcards": 0, "quiz": 0, "explain": 0})
            stats["by_category"][cat]["flashcards"] += 1
    except (FileNotFoundError, json.JSONDecodeError):
        pass
    try:
        questions = _load_json("quiz_questions.json").get("questions", [])
        stats["quiz_questions"] = len(questions)
        for q in questions:
            cat = q.get("category", "Unknown")
            stats["by_category"].setdefault(cat, {"flashcards": 0, "quiz": 0, "explain": 0})
            stats["by_category"][cat]["quiz"] += 1
    except (FileNotFoundError, json.JSONDecodeError):
        pass
    try:
        prompts = _load_json("explain_prompts.json").get("prompts", [])
        stats["explain_prompts"] = len(prompts)
        for p in prompts:
            cat = p.get("category", "Unknown")
            stats["by_category"].setdefault(cat, {"flashcards": 0, "quiz": 0, "explain": 0})
            stats["by_category"][cat]["explain"] += 1
    except (FileNotFoundError, json.JSONDecodeError):
        pass
    return stats

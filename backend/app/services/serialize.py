"""Konversi konten ke baris DB dan sanitasi (membuang kunci jawaban) untuk frontend."""
from __future__ import annotations

SECRET_STEP_KEYS = {"answer", "errors", "keywords", "model_answer", "tolerance"}


def question_to_row(q: dict) -> dict:
    return {
        "id": q["id"],
        "category": q["category"],
        "difficulty": q["difficulty"],
        "question_type": q["question_type"],
        "cylinder_type": q.get("cylinder_type"),
        "title": q["title"],
        "story_text": q.get("story_text", ""),
        "highlights_json": q.get("highlights", []),
        "steps_json": q["steps"],
        "hints_json": q.get("hints", []),
        "explanation": q.get("explanation", ""),
        "max_score": q["max_score"],
    }


def literacy_to_row(q: dict) -> dict:
    return question_to_row({
        **q,
        "category": f"literacy_{q['indicator']}",
        "difficulty": 3,
        "question_type": "literacy",
        "cylinder_type": None,
        "hints": [],
    })


def sanitize_step(step: dict) -> dict:
    out = {k: v for k, v in step.items() if k not in SECRET_STEP_KEYS}
    if "options" in out:
        out["options"] = [{"id": o["id"], "text": o["text"]} for o in out["options"]]
    return out


def sanitize_question(q: dict, include_hints: bool = True) -> dict:
    out = {
        "id": q["id"],
        "title": q["title"],
        "story_text": q.get("story_text", ""),
        "highlights": q.get("highlights", []),
        "steps": [sanitize_step(s) for s in q["steps"]],
        "max_score": q["max_score"],
    }
    for key in ("category", "difficulty", "question_type", "cylinder_type", "indicator"):
        if key in q:
            out[key] = q[key]
    if include_hints:
        out["hints"] = q.get("hints", [])
    return out

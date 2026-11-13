from __future__ import annotations

from app.services.cylinder_math import fmt


def step_answer_text(step: dict) -> str:
    if step["kind"] == "number":
        unit = step.get("unit", "")
        if unit == "Rp":
            return f"Rp{fmt(step['answer'])}"
        return f"{fmt(step['answer'])} {unit}".strip()
    if step["kind"] == "choice":
        return next(o["text"] for o in step["options"] if o["id"] == step["answer"])
    return step.get("model_answer", "")


def correct_answers(q: dict) -> dict[str, str]:
    return {s["id"]: step_answer_text(s) for s in q["steps"]}

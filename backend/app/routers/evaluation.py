from __future__ import annotations

from typing import Any

from fastapi import APIRouter, Depends
from pydantic import BaseModel, Field

from app.content.literacy import INDICATORS, LITERACY_QUESTIONS
from app.db import get_repository
from app.security import get_current_user
from app.services.answers import step_answer_text
from app.services.gamification import award_xp, log_activity, refresh
from app.services.grading import grade_question
from app.services.serialize import sanitize_question

router = APIRouter(prefix="/evaluation", tags=["evaluation"])


class SubmitIn(BaseModel):
    answers: dict[str, dict[str, Any]] = Field(default_factory=dict)


def score_evaluation(answers: dict[str, dict]) -> dict:
    """Skor parsial per tahap → skor per indikator (0–6) dan total (0–24)."""
    scores = {k: 0.0 for k in INDICATORS}
    detail = {}
    for q in LITERACY_QUESTIONS:
        given = answers.get(q["id"], {}) or {}
        g = grade_question(q, given)
        scores[q["indicator"]] = float(g["score"])
        detail[q["id"]] = {
            "indicator": q["indicator"],
            "score": g["score"],
            "max_score": g["max_score"],
            "steps": [
                {**res, "prompt": step["prompt"], "student_answer": str(given.get(step["id"], ""))[:1000],
                 "correct_answer": step_answer_text(step)}
                for step, res in zip(q["steps"], g["step_results"])
            ],
        }
    return {"scores": scores, "total": sum(scores.values()), "detail": detail}


@router.get("/questions")
def questions(user: dict = Depends(get_current_user)):
    return {"indicators": INDICATORS,
            "questions": [sanitize_question(q, include_hints=False) for q in LITERACY_QUESTIONS]}


def _result_payload(row: dict) -> dict:
    explanations = {q["id"]: {"title": q["title"], "explanation": q["explanation"]} for q in LITERACY_QUESTIONS}
    return {
        "id": row["id"],
        "completed_at": row["completed_at"],
        "scores": {
            "reasoning": float(row["score_reasoning"]),
            "formulating": float(row["score_formulating"]),
            "employing": float(row["score_employing"]),
            "evaluating": float(row["score_evaluating"]),
        },
        "total_score": float(row["total_score"]),
        "max_total": 24,
        "indicators": INDICATORS,
        "detail": row["answers_detail_json"],
        "explanations": explanations,
    }


@router.post("/submit")
def submit(body: SubmitIn, user: dict = Depends(get_current_user)):
    repo = get_repository()
    result = score_evaluation(body.answers)
    s = result["scores"]
    row = repo.insert("literacy_evaluations", {
        "student_id": user["id"],
        "score_reasoning": s["reasoning"], "score_formulating": s["formulating"],
        "score_employing": s["employing"], "score_evaluating": s["evaluating"],
        "total_score": result["total"], "answers_detail_json": result["detail"],
    })
    title = f"Final Challenge — skor {result['total']:g}/24"
    xp = award_xp(repo, user["id"], "eval:first", int(20 + result["total"] * 5), "evaluation", title,
                  score=result["total"])
    if xp == 0:
        log_activity(repo, user["id"], "evaluation", title + " (ulang)", score=result["total"])
    r = refresh(repo, user["id"])
    return {**_result_payload(row), "xp_awarded": xp, "new_badges": r["new_badges"]}


@router.get("/latest")
def latest(user: dict = Depends(get_current_user)):
    rows = get_repository().select("literacy_evaluations", {"student_id": user["id"]}, order="completed_at",
                                   desc=True, limit=1)
    return {"result": _result_payload(rows[0]) if rows else None}

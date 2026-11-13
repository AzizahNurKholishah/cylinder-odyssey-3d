from __future__ import annotations

from typing import Any

from fastapi import APIRouter, Depends
from pydantic import BaseModel, Field

from app.content.questions import QUESTIONS, QUESTIONS_BY_ID
from app.db import get_repository
from app.security import api_error, get_current_user
from app.services.answers import correct_answers
from app.services.gamification import award_xp, practice_xp, refresh
from app.services.grading import grade_question
from app.services.serialize import sanitize_question

router = APIRouter(prefix="/practice", tags=["practice"])


class AttemptIn(BaseModel):
    answers: dict[str, Any] = Field(default_factory=dict)
    hints_used: int = Field(default=0, ge=0, le=3)
    reveal: bool = False


class ReflectionIn(BaseModel):
    text: str = Field(min_length=1, max_length=1000)


def _get_question(qid: str) -> dict:
    q = QUESTIONS_BY_ID.get(qid)
    if q is None:
        raise api_error(404, "question_not_found", "Soal tidak ditemukan.")
    return q


@router.get("/questions")
def list_questions(user: dict = Depends(get_current_user)):
    attempts = get_repository().select("practice_attempts", {"student_id": user["id"]})
    out = []
    for q in QUESTIONS:
        mine = [a for a in attempts if a["question_id"] == q["id"]]
        out.append({k: q[k] for k in ("id", "title", "difficulty", "question_type", "cylinder_type", "category")}
                   | {"attempts": len(mine), "solved": any(a["is_correct"] for a in mine)})
    return {"questions": out}


@router.get("/questions/{qid}")
def get_question(qid: str, user: dict = Depends(get_current_user)):
    return {"question": sanitize_question(_get_question(qid))}


@router.post("/questions/{qid}/attempt")
def attempt(qid: str, body: AttemptIn, user: dict = Depends(get_current_user)):
    q = _get_question(qid)
    repo = get_repository()
    g = grade_question(q, body.answers)
    answers = {k: str(v)[:500] for k, v in body.answers.items()}
    row = repo.insert("practice_attempts", {
        "student_id": user["id"], "question_id": qid, "is_correct": g["is_correct"],
        "hints_used": body.hints_used, "error_type": g["error_type"], "answers_json": answers,
    })
    xp = 0
    if g["is_correct"]:
        xp = award_xp(repo, user["id"], f"practice:{qid}", practice_xp(q["difficulty"], body.hints_used),
                      "practice", f"Latihan: {q['title']}", score=g["score"])
    r = refresh(repo, user["id"])
    reveal = g["is_correct"] or (body.reveal and body.hints_used >= 3)
    return {
        "attempt_id": row["id"],
        **g,
        "xp_awarded": xp,
        "new_badges": r["new_badges"],
        "explanation": q["explanation"] if reveal else None,
        "correct_answers": correct_answers(q) if reveal else None,
    }


@router.post("/attempts/{attempt_id}/reflection")
def save_reflection(attempt_id: str, body: ReflectionIn, user: dict = Depends(get_current_user)):
    repo = get_repository()
    rows = repo.select("practice_attempts", {"id": attempt_id, "student_id": user["id"]}, limit=1)
    if not rows:
        raise api_error(404, "attempt_not_found", "Percobaan tidak ditemukan.")
    repo.update("practice_attempts", {"id": attempt_id, "student_id": user["id"]},
                {"reflection_text": body.text.strip()})
    return {"ok": True}

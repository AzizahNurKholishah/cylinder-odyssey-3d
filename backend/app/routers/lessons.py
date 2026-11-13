from __future__ import annotations

from fastapi import APIRouter, Depends

from app.db import get_repository
from app.security import api_error, get_current_user
from app.services.gamification import XP_LESSON, StudentContext, award_xp, now_iso, refresh
from app.services.progress import lesson_status

router = APIRouter(prefix="/lessons", tags=["lessons"])


@router.get("")
def list_lessons(user: dict = Depends(get_current_user)):
    return {"lessons": lesson_status(StudentContext(get_repository(), user["id"]))}


@router.post("/{slug}/complete")
def complete_lesson(slug: str, user: dict = Depends(get_current_user)):
    repo = get_repository()
    lessons = lesson_status(StudentContext(repo, user["id"]))
    lesson = next((l for l in lessons if l["slug"] == slug), None)
    if lesson is None:
        raise api_error(404, "lesson_not_found", "Level tidak ditemukan.")
    if not lesson["is_unlocked"]:
        raise api_error(403, "lesson_locked", "Selesaikan level sebelumnya terlebih dahulu.")
    if not lesson["is_completed"]:
        repo.upsert("lesson_progress", {"student_id": user["id"], "lesson_id": lesson["id"], "is_completed": True,
                                        "completed_at": now_iso()}, on_conflict="student_id,lesson_id")
    xp = award_xp(repo, user["id"], f"lesson:{slug}", XP_LESSON, "lesson",
                  f"Menyelesaikan Level 0{lesson['level_number']} — {lesson['title']}")
    r = refresh(repo, user["id"])
    return {"ok": True, "xp_awarded": xp, "new_badges": r["new_badges"], "total_xp": r["stats"]["total_xp"]}

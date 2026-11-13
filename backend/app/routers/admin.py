from __future__ import annotations

from fastapi import APIRouter, Depends
from pydantic import BaseModel, Field

from app.db import DuplicateError, get_repository
from app.security import CODE_PATTERN, api_error, normalize_code, public_profile, require_teacher

router = APIRouter(prefix="/admin", tags=["admin"])


class StudentIn(BaseModel):
    student_code: str = Field(max_length=20)
    full_name: str = Field(default="", max_length=80)
    class_name: str = Field(default="VIII", max_length=20)


@router.get("/students")
def list_students(teacher: dict = Depends(require_teacher)):
    repo = get_repository()
    students = repo.select("profiles", {"role": "student"}, order="student_code")
    stats = {s["student_id"]: s for s in repo.select("user_stats")}
    latest_eval: dict[str, dict] = {}
    for ev in repo.select("literacy_evaluations", order="completed_at", desc=True):
        latest_eval.setdefault(ev["student_id"], ev)
    out = []
    for p in students:
        st = stats.get(p["id"], {})
        ev = latest_eval.get(p["id"])
        out.append({**public_profile(p), "created_at": p.get("created_at"),
                    "total_xp": st.get("total_xp", 0), "missions_completed": st.get("missions_completed", 0),
                    "latest_literacy_total": float(ev["total_score"]) if ev else None})
    return {"students": out}


@router.post("/students", status_code=201)
def create_student(body: StudentIn, teacher: dict = Depends(require_teacher)):
    code = normalize_code(body.student_code)
    if not CODE_PATTERN.match(code):
        raise api_error(400, "invalid_format", "Format kode tidak valid. Contoh: SMP8-31.")
    try:
        row = get_repository().insert("profiles", {"student_code": code,
                                                   "full_name": body.full_name.strip() or f"Siswa {code}",
                                                   "class_name": body.class_name.strip() or "VIII",
                                                   "role": "student"})
    except DuplicateError:
        raise api_error(409, "duplicate_code", "Kode siswa sudah terdaftar.")
    return {"student": public_profile(row)}

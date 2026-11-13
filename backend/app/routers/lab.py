from __future__ import annotations

from typing import Literal

from fastapi import APIRouter, Depends
from pydantic import BaseModel

from app.db import get_repository
from app.security import api_error, get_current_user
from app.services import cylinder_math as cm
from app.services.gamification import XP_LAB_UNFOLD, award_xp, refresh
from app.services.numbers import parse_number_candidates

router = APIRouter(prefix="/lab", tags=["lab"])

MAX_SIZE = 10_000


class ExploredIn(BaseModel):
    feature: Literal["unfold"]


class CalcIn(BaseModel):
    input_type: Literal["r", "d"]
    value: str | float
    height: str | float
    cylinder_type: Literal["closed", "open", "blanket"]
    pi: Literal["auto", "22/7", "3.14"] = "auto"


def _positive(raw, label: str) -> float:
    cands = parse_number_candidates(raw)
    if not cands:
        raise api_error(422, "invalid_number", f"{label} harus berupa angka.")
    v = cands[0]
    if v <= 0:
        raise api_error(422, "not_positive", f"{label} harus lebih dari 0.")
    if v > MAX_SIZE:
        raise api_error(422, "too_large", f"{label} maksimal {MAX_SIZE}.")
    return v


def calculate(body: CalcIn) -> dict:
    v = _positive(body.value, "Jari-jari" if body.input_type == "r" else "Diameter")
    t = _positive(body.height, "Tinggi")
    r = v if body.input_type == "r" else v / 2
    d = 2 * r
    pi, reason = cm.choose_pi(r, d) if body.pi == "auto" else (body.pi, "π dipilih manual.")
    pi_txt = "22/7" if pi == "22/7" else "3,14"
    alas = cm.circle_area(r, pi)
    selimut = cm.blanket_area(r, t, pi)
    total = cm.surface_area(r, t, body.cylinder_type, pi)
    formula = {"closed": "L = 2πr² + 2πrt = 2πr(r + t)", "open": "L = πr² + 2πrt", "blanket": "L = 2πrt"}
    subst = {
        "closed": f"L = 2 × {pi_txt} × {cm.fmt(r)} × ({cm.fmt(r)} + {cm.fmt(t)})",
        "open": f"L = {pi_txt} × {cm.fmt(r)}² + 2 × {pi_txt} × {cm.fmt(r)} × {cm.fmt(t)}",
        "blanket": f"L = 2 × {pi_txt} × {cm.fmt(r)} × {cm.fmt(t)}",
    }
    steps = [
        {"label": "Diketahui", "text": (f"r = {cm.fmt(r)} cm" if body.input_type == "r"
                                         else f"d = {cm.fmt(d)} cm → r = d ÷ 2 = {cm.fmt(r)} cm") + f", t = {cm.fmt(t)} cm"},
        {"label": "Pilih π", "text": f"π = {pi_txt}. {reason}"},
        {"label": "Rumus", "text": formula[body.cylinder_type]},
        {"label": "Substitusi", "text": subst[body.cylinder_type]},
        {"label": "Hasil", "text": f"L = {cm.fmt(total, 2)} cm²"},
    ]
    return {"r": r, "d": d, "t": t, "pi": pi, "pi_reason": reason, "base_area": cm.clean(alas),
            "blanket_area": cm.clean(selimut), "total": cm.clean(total), "steps": steps}


@router.post("/calculate")
def calculate_endpoint(body: CalcIn, user: dict = Depends(get_current_user)):
    return calculate(body)


@router.post("/explored")
def explored(body: ExploredIn, user: dict = Depends(get_current_user)):
    repo = get_repository()
    xp = award_xp(repo, user["id"], f"lab:{body.feature}", XP_LAB_UNFOLD, "lab",
                  "Membentangkan jaring-jaring tabung 3D")
    r = refresh(repo, user["id"])
    return {"ok": True, "xp_awarded": xp, "new_badges": r["new_badges"]}

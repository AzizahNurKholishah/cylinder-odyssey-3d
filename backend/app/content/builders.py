"""Helper pembuat langkah soal.

Setiap langkah numerik otomatis dilengkapi daftar "nilai jebakan" (errors):
angka yang akan muncul jika siswa melakukan kesalahan umum tertentu.
Grader memakai daftar ini untuk mendiagnosis kesalahan.
"""
from __future__ import annotations

from app.services import cylinder_math as cm


def _dedupe_errors(answer: float, errors: list[dict]) -> list[dict]:
    out: list[dict] = []
    for e in errors:
        v = cm.clean(e["value"])
        if abs(v - answer) < 1e-6:
            continue
        if any(abs(v - o["value"]) < 1e-6 for o in out):
            continue
        out.append({"value": v, "error_type": e["error_type"]})
    return out


def number_step(step_id: str, prompt: str, answer: float, unit: str = "", errors: list[dict] | None = None,
                score: int = 1, tolerance: float | None = None) -> dict:
    answer = cm.clean(answer)
    step = {
        "id": step_id,
        "prompt": prompt,
        "kind": "number",
        "unit": unit,
        "answer": answer,
        "errors": _dedupe_errors(answer, errors or []),
        "score": score,
    }
    if tolerance is not None:
        step["tolerance"] = tolerance
    return step


def choice_step(step_id: str, prompt: str, options: list[tuple[str, str, str | None]], answer: str,
                score: int = 1) -> dict:
    """options: list of (id, text, error_type_if_chosen)."""
    return {
        "id": step_id,
        "prompt": prompt,
        "kind": "choice",
        "options": [{"id": oid, "text": text, "error_type": err} for oid, text, err in options],
        "answer": answer,
        "score": score,
    }


def text_step(step_id: str, prompt: str, keyword_groups: list[tuple[list[str], int]], score: int,
              model_answer: str) -> dict:
    return {
        "id": step_id,
        "prompt": prompt,
        "kind": "text",
        "keywords": [{"any": words, "points": pts} for words, pts in keyword_groups],
        "model_answer": model_answer,
        "score": score,
    }


def radius_step(step_id: str, d: float, score: int = 1) -> dict:
    return number_step(step_id, f"Diameter = {cm.fmt(d)} cm. Berapa jari-jarinya (r)?", d / 2, "cm",
                       [{"value": d, "error_type": "diameter_as_radius"},
                        {"value": d * 2, "error_type": "radius_doubled"}], score)


def circle_area_step(step_id: str, prompt: str, r: float, pi: str, given_d: bool = False, score: int = 1,
                     multiplier: int = 1) -> dict:
    ans = multiplier * cm.circle_area(r, pi)
    errors = [
        {"value": multiplier * cm.circle_area(r, cm.other_pi(pi)), "error_type": "wrong_pi"},
        {"value": multiplier * cm.circumference(r, pi), "error_type": "area_vs_circumference"},
        {"value": multiplier * cm.PI_VALUES[pi] * r, "error_type": "area_vs_circumference"},
    ]
    if multiplier == 2:
        errors.append({"value": cm.circle_area(r, pi), "error_type": "forgot_two"})
    if given_d:
        errors.append({"value": multiplier * cm.circle_area(2 * r, pi), "error_type": "diameter_as_radius"})
    return number_step(step_id, prompt, ans, "cm²", errors, score)


def circumference_step(step_id: str, prompt: str, r: float, pi: str, given_d: bool = False, score: int = 1) -> dict:
    errors = [
        {"value": cm.circumference(r, cm.other_pi(pi)), "error_type": "wrong_pi"},
        {"value": cm.PI_VALUES[pi] * r, "error_type": "forgot_two"},
        {"value": cm.circle_area(r, pi), "error_type": "area_vs_circumference"},
    ]
    if given_d:
        errors.append({"value": cm.circumference(2 * r, pi), "error_type": "diameter_as_radius"})
    return number_step(step_id, prompt, cm.circumference(r, pi), "cm", errors, score)


def surface_step(step_id: str, prompt: str, r: float, t: float, cylinder_type: str, pi: str,
                 given_d: bool = False, score: int = 1, multiplier: float = 1, unit: str = "cm²") -> dict:
    """Langkah luas (selimut / tanpa tutup / tertutup) dengan jebakan yang relevan."""
    def area(kind: str, rr: float = r, p: str = pi) -> float:
        return multiplier * cm.surface_area(rr, t, kind, p)

    errors = [{"value": area(cylinder_type, p=cm.other_pi(pi)), "error_type": "wrong_pi"}]
    if given_d:
        errors.append({"value": area(cylinder_type, rr=2 * r), "error_type": "diameter_as_radius"})
    if cylinder_type == "closed":
        errors += [{"value": area("open"), "error_type": "open_instead_of_closed"},
                   {"value": area("blanket"), "error_type": "blanket_only"}]
    elif cylinder_type == "open":
        errors += [{"value": area("closed"), "error_type": "closed_instead_of_open"},
                   {"value": area("blanket"), "error_type": "blanket_only"}]
    else:
        errors += [{"value": area("open"), "error_type": "included_bases"},
                   {"value": area("closed"), "error_type": "included_bases"},
                   {"value": area("blanket") / 2, "error_type": "forgot_two"}]
    if multiplier != 1:
        errors.append({"value": cm.surface_area(r, t, cylinder_type, pi), "error_type": "missing_quantity"})
    return number_step(step_id, prompt, area(cylinder_type), unit, errors, score)


UNIT_OPTIONS = [("a", "cm²", None), ("b", "cm", "wrong_unit"), ("c", "cm³", "wrong_unit")]


def unit_step(step_id: str = "unit", score: int = 1) -> dict:
    return choice_step(step_id, "Cek satuan: luas permukaan dinyatakan dalam satuan apa?", UNIT_OPTIONS, "a", score)

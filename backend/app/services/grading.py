"""Penilaian langkah jawaban + diagnosis kesalahan umum."""
from __future__ import annotations

import re

from app.services.numbers import matches, parse_number_candidates

ERROR_FEEDBACK: dict[str, str] = {
    "diameter_as_radius": "Sepertinya kamu memakai diameter sebagai jari-jari. Ingat: r = d ÷ 2.",
    "radius_doubled": "Jari-jari justru setengah dari diameter, bukan dua kalinya. r = d ÷ 2.",
    "closed_instead_of_open": "Hati-hati! Benda ini tanpa tutup, jadi hanya ada 1 lingkaran (alas). Rumusnya πr² + 2πrt.",
    "open_instead_of_closed": "Benda ini tertutup, jadi ada 2 lingkaran (alas + tutup). Jangan lupa tutupnya!",
    "blanket_only": "Kamu baru menghitung selimutnya saja. Cek lagi: ada lingkaran alas/tutup yang perlu dihitung?",
    "included_bases": "Bagian ini hanya selimut (sisi lengkung). Lingkaran alas/tutup tidak ikut dihitung.",
    "wrong_pi": "Nilai π yang dipakai berbeda dengan yang diminta soal. Baca lagi: π = 22/7 atau 3,14?",
    "forgot_two": "Ada angka 2 yang terlewat. Keliling = 2πr, selimut = 2πrt, alas + tutup = 2πr².",
    "area_vs_circumference": "Luas lingkaran = πr² (r dikuadratkan), sedangkan keliling = 2πr. Jangan tertukar.",
    "unit_conversion": "Cek konversi satuan. 1 m = 100 cm, sedangkan 1 m² = 10.000 cm².",
    "missing_quantity": "Jumlah bendanya lebih dari satu! Kalikan hasil satu benda dengan banyaknya benda.",
    "rounding_down": "Untuk kebutuhan barang, hasil harus dibulatkan KE ATAS agar bahannya cukup.",
    "rounding_not_applied": "Barang tidak bisa dibeli pecahan. Bulatkan hasilnya ke atas.",
    "wrong_unit": "Luas selalu bersatuan persegi, misalnya cm² atau m².",
    "volume_confusion": "πr²t adalah rumus volume (isi), bukan luas permukaan.",
    "concept": "Konsepnya belum tepat. Coba buka petunjuk untuk mengingat kembali.",
    "calculation": "Rumusnya mungkin sudah benar, tapi hitungannya belum tepat. Cek lagi langkah perkaliannya.",
    "invalid_input": "Jawaban belum diisi atau bukan angka yang valid.",
    "empty": "Bagian ini belum dijawab.",
    "partial_reason": "Alasanmu sudah ada, tapi lengkapi dengan perbandingan angka hasil perhitungan.",
}


def _norm_text(s: str) -> str:
    return re.sub(r"\s+", " ", s.lower()).strip()


def grade_step(step: dict, raw) -> dict:
    """Kembalikan {step_id, correct, points, max_points, error_type, feedback}."""
    max_pts = step.get("score", 1)
    result = {"step_id": step["id"], "correct": False, "points": 0, "max_points": max_pts,
              "error_type": None, "feedback": ""}
    kind = step["kind"]

    if raw is None or (isinstance(raw, str) and not raw.strip()):
        result.update(error_type="empty", feedback=ERROR_FEEDBACK["empty"])
        return result

    if kind == "choice":
        if str(raw) == step["answer"]:
            result.update(correct=True, points=max_pts, feedback="Tepat!")
            return result
        chosen = next((o for o in step["options"] if o["id"] == str(raw)), None)
        if chosen is None:
            result.update(error_type="invalid_input", feedback=ERROR_FEEDBACK["invalid_input"])
            return result
        err = chosen.get("error_type") or "concept"
        result.update(error_type=err, feedback=ERROR_FEEDBACK.get(err, ERROR_FEEDBACK["concept"]))
        return result

    if kind == "number":
        cands = parse_number_candidates(raw)
        if not cands:
            result.update(error_type="invalid_input", feedback=ERROR_FEEDBACK["invalid_input"])
            return result
        tol = step.get("tolerance")
        if matches(cands, step["answer"], tol):
            result.update(correct=True, points=max_pts, feedback="Tepat!")
            return result
        for e in step.get("errors", []):
            if matches(cands, e["value"], tol):
                result.update(error_type=e["error_type"], feedback=ERROR_FEEDBACK.get(e["error_type"], ""))
                return result
        result.update(error_type="calculation", feedback=ERROR_FEEDBACK["calculation"])
        return result

    if kind == "text":
        text = _norm_text(str(raw))
        pts = 0
        for group in step.get("keywords", []):
            if any(_norm_text(w) in text for w in group["any"]):
                pts += group["points"]
        pts = min(pts, max_pts)
        if pts >= max_pts:
            result.update(correct=True, points=pts, feedback="Alasanmu lengkap.")
        elif pts > 0:
            result.update(points=pts, error_type="partial_reason", feedback=ERROR_FEEDBACK["partial_reason"])
        else:
            result.update(error_type="concept", feedback="Alasan belum menjelaskan hasil perhitungan.")
        return result

    raise ValueError(f"kind tidak dikenal: {kind}")


def grade_question(question: dict, answers: dict) -> dict:
    answers = answers or {}
    results = [grade_step(s, answers.get(s["id"])) for s in question["steps"]]
    all_correct = all(r["correct"] for r in results)
    first_error = next((r["error_type"] for r in results if not r["correct"]), None)
    return {
        "is_correct": all_correct,
        "score": sum(r["points"] for r in results),
        "max_score": sum(r["max_points"] for r in results),
        "error_type": first_error,
        "step_results": results,
    }

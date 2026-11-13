"""Parser angka yang ramah penulisan Indonesia maupun internasional.

Siswa bisa menulis "8,272", "8.272", "Rp48.840", "1.540 cm²", "3,5".
Karena "8.272" ambigu (desimal atau ribuan), parser mengembalikan
SEMUA tafsiran yang masuk akal, lalu grader menerima jika salah satunya cocok.
"""
from __future__ import annotations

import re

_THOUSANDS_DOT = re.compile(r"^-?\d{1,3}(\.\d{3})+$")
_THOUSANDS_COMMA = re.compile(r"^-?\d{1,3}(,\d{3})+$")
_UNIT_PATTERN = re.compile(r"(cm|mm|dm|m)\s*\^?[23²³]?|lembar|kaleng|buah", re.IGNORECASE)


def parse_number_candidates(raw: object) -> list[float]:
    if raw is None:
        return []
    if isinstance(raw, bool):
        return []
    if isinstance(raw, (int, float)):
        return [float(raw)]
    s = str(raw).strip()
    if not s:
        return []
    s = s.replace("Rp", "").replace("rp", "").replace("RP", "")
    s = _UNIT_PATTERN.sub("", s)
    s = s.replace(" ", "").replace(" ", "")
    if not re.fullmatch(r"-?[\d.,]+", s) or not re.search(r"\d", s):
        return []

    candidates: list[float] = []

    def add(text: str) -> None:
        try:
            v = float(text)
        except ValueError:
            return
        if v not in candidates:
            candidates.append(v)

    has_dot, has_comma = "." in s, "," in s
    if has_dot and has_comma:
        if s.rfind(",") > s.rfind("."):  # 1.540,5
            add(s.replace(".", "").replace(",", "."))
        else:  # 1,540.5
            add(s.replace(",", ""))
    elif has_comma:
        if s.count(",") == 1:
            add(s.replace(",", "."))
        if _THOUSANDS_COMMA.match(s):
            add(s.replace(",", ""))
    elif has_dot:
        if s.count(".") == 1:
            add(s)
        if _THOUSANDS_DOT.match(s):
            add(s.replace(".", ""))
    else:
        add(s)
    return candidates


def default_tolerance(target: float) -> float:
    return max(0.05, abs(target) * 0.0002)


def matches(candidates: list[float], target: float, tolerance: float | None = None) -> bool:
    tol = default_tolerance(target) if tolerance is None else tolerance
    return any(abs(c - target) <= tol for c in candidates)

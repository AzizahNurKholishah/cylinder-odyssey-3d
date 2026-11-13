"""Rumus-rumus lingkaran dan tabung yang dipakai di seluruh backend."""
from __future__ import annotations

PI_VALUES = {"22/7": 22 / 7, "3.14": 3.14}
CYLINDER_TYPES = ("closed", "open", "blanket")


def _is_multiple_of_7(x: float | None) -> bool:
    if x is None or x <= 0:
        return False
    q = x / 7
    return abs(q - round(q)) < 1e-9


def choose_pi(r: float, d: float | None = None) -> tuple[str, str]:
    """Pilih π yang paling efisien beserta alasannya."""
    d = d if d is not None else 2 * r
    if _is_multiple_of_7(r):
        return "22/7", f"r = {fmt(r)} adalah kelipatan 7, jadi π = 22/7 membuat hitungan lebih sederhana."
    if _is_multiple_of_7(d):
        return "22/7", f"d = {fmt(d)} adalah kelipatan 7, jadi π = 22/7 membuat hitungan lebih sederhana."
    return "3.14", f"r = {fmt(r)} dan d = {fmt(d)} bukan kelipatan 7, jadi gunakan π = 3,14."


def other_pi(key: str) -> str:
    return "3.14" if key == "22/7" else "22/7"


def circle_area(r: float, pi: str) -> float:
    return PI_VALUES[pi] * r * r


def circumference(r: float, pi: str) -> float:
    return 2 * PI_VALUES[pi] * r


def blanket_area(r: float, t: float, pi: str) -> float:
    return 2 * PI_VALUES[pi] * r * t


def surface_area(r: float, t: float, cylinder_type: str, pi: str) -> float:
    if cylinder_type == "closed":
        return 2 * circle_area(r, pi) + blanket_area(r, t, pi)
    if cylinder_type == "open":
        return circle_area(r, pi) + blanket_area(r, t, pi)
    if cylinder_type == "blanket":
        return blanket_area(r, t, pi)
    raise ValueError(f"cylinder_type tidak dikenal: {cylinder_type}")


def clean(x: float) -> float:
    """Hilangkan galat floating point (mis. 153.99999999 → 154)."""
    return round(x, 6)


def fmt(x: float, decimals: int = 4) -> str:
    """Format angka gaya Indonesia: 1.540,5"""
    x = round(float(x), decimals)
    if abs(x - round(x)) < 1e-9:
        return f"{int(round(x)):,}".replace(",", ".")
    s = f"{x:,.{decimals}f}".rstrip("0").rstrip(".")
    integer, _, frac = s.partition(".")
    return integer.replace(",", ".") + ("," + frac if frac else "")

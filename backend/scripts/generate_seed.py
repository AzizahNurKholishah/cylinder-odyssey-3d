"""Hasilkan supabase/seed.sql dari konten di app/content (satu sumber kebenaran).

Jalankan dari folder backend:  python scripts/generate_seed.py
"""
from __future__ import annotations

import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))

from app.content.catalog import ACHIEVEMENTS, GAMES, LESSONS, SAMPLE_PROFILES  # noqa: E402
from app.content.literacy import LITERACY_QUESTIONS  # noqa: E402
from app.content.questions import QUESTIONS  # noqa: E402
from app.services.serialize import literacy_to_row, question_to_row  # noqa: E402

OUT = ROOT.parent / "supabase" / "seed.sql"
JSON_COLS = {"highlights_json", "steps_json", "hints_json"}


def lit(v, col: str = "") -> str:
    if v is None:
        return "null"
    if col in JSON_COLS:
        return "'" + json.dumps(v, ensure_ascii=False).replace("'", "''") + "'::jsonb"
    if isinstance(v, bool):
        return "true" if v else "false"
    if isinstance(v, (int, float)):
        return str(v)
    return "'" + str(v).replace("'", "''") + "'"


def upsert(table: str, rows: list[dict], conflict: str, update_cols: list[str] | None = None) -> str:
    cols = list(rows[0].keys())
    values = ",\n".join("  (" + ", ".join(lit(r[c], c) for c in cols) + ")" for r in rows)
    update_cols = update_cols if update_cols is not None else [c for c in cols if c != conflict]
    action = ("do update set " + ", ".join(f"{c} = excluded.{c}" for c in update_cols)) if update_cols else "do nothing"
    return f"insert into public.{table} ({', '.join(cols)}) values\n{values}\non conflict ({conflict}) {action};\n"


def main() -> None:
    questions = [question_to_row(q) for q in QUESTIONS] + [literacy_to_row(q) for q in LITERACY_QUESTIONS]
    parts = [
        "-- =====================================================================",
        "-- CYLINDER ODYSSEY 3D — seed data (DIHASILKAN OTOMATIS, jangan edit manual)",
        "-- Sumber: backend/app/content/*.py  →  python scripts/generate_seed.py",
        "-- Jalankan setelah schema.sql. Aman dijalankan ulang.",
        "-- =====================================================================\n",
        "-- Level materi", upsert("lessons", LESSONS, "id"),
        "-- Mini games", upsert("games", GAMES, "id"),
        "-- Lencana", upsert("achievements", ACHIEVEMENTS, "id"),
        f"-- Bank soal: {len(QUESTIONS)} soal latihan + {len(LITERACY_QUESTIONS)} soal literasi (Final Challenge)",
        upsert("questions", questions, "id"),
        "-- Akun contoh (nama generik, bukan identitas asli)",
        upsert("profiles", SAMPLE_PROFILES, "student_code", update_cols=[]),
    ]
    OUT.write_text("\n".join(parts), encoding="utf-8")
    print(f"Ditulis: {OUT} ({len(questions)} soal, {len(SAMPLE_PROFILES)} profil)")


if __name__ == "__main__":
    main()

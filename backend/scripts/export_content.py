"""Ekspor konten (soal, kunci, nilai jebakan, katalog) ke JSON untuk mode standalone frontend.

Sumber kebenaran tetap backend/app/content/*.py.
Jalankan dari folder backend:  python scripts/export_content.py
"""
from __future__ import annotations

import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))

from app.content.catalog import ACHIEVEMENTS, GAMES, LESSONS, SAMPLE_PROFILES  # noqa: E402
from app.content.literacy import INDICATORS, LITERACY_QUESTIONS  # noqa: E402
from app.content.questions import QUESTIONS  # noqa: E402
from app.services import gamification as g  # noqa: E402
from app.services.grading import ERROR_FEEDBACK  # noqa: E402

OUT = ROOT.parent / "frontend" / "src" / "content" / "generated" / "content.json"


def build() -> dict:
    return {
        "_note": "DIHASILKAN OTOMATIS dari backend/app/content — jangan edit manual. "
                 "Jalankan: python backend/scripts/export_content.py",
        "lessons": LESSONS,
        "games": GAMES,
        "achievements": ACHIEVEMENTS,
        "profiles": SAMPLE_PROFILES,
        "questions": QUESTIONS,
        "literacy": LITERACY_QUESTIONS,
        "indicators": INDICATORS,
        "error_feedback": ERROR_FEEDBACK,
        "rules": {
            "level_thresholds": g.LEVEL_THRESHOLDS,
            "level_titles": g.LEVEL_TITLES,
            "xp_lesson": g.XP_LESSON,
            "xp_lab_unfold": g.XP_LAB_UNFOLD,
            "xp_game_first": g.XP_GAME_FIRST,
            "xp_game_mastery": g.XP_GAME_MASTERY,
            "game_mastery_score": g.GAME_MASTERY_SCORE,
            "training_mission_target": g.TRAINING_MISSION_TARGET,
            "hint_free_target": g.HINT_FREE_TARGET,
        },
    }


def render() -> str:
    return json.dumps(build(), ensure_ascii=False, indent=1) + "\n"


if __name__ == "__main__":
    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(render(), encoding="utf-8")
    print(f"Ditulis: {OUT}")

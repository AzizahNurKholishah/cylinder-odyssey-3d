"""XP idempoten, level penjelajah, misi, dan lencana."""
from __future__ import annotations

from datetime import datetime, timezone

from app.content.catalog import ACHIEVEMENTS, GAMES, LESSONS
from app.db.base import DuplicateError

LEVEL_THRESHOLDS = [0, 100, 250, 450, 700, 1000, 1400]
LEVEL_TITLES = ["Penjelajah Pemula", "Pengamat Lingkaran", "Perakit Jaring", "Arsitek Rumus",
                "Penjaga Benteng", "Pendaki Literasi", "Master Tabung"]

XP_LESSON = 50
XP_LAB_UNFOLD = 20
XP_GAME_FIRST = 15
XP_GAME_MASTERY = 25
GAME_MASTERY_SCORE = 70
TRAINING_MISSION_TARGET = 5
HINT_FREE_TARGET = 5


def now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def level_info(xp: int) -> dict:
    level = 1
    for i, threshold in enumerate(LEVEL_THRESHOLDS):
        if xp >= threshold:
            level = i + 1
    idx = level - 1
    next_at = LEVEL_THRESHOLDS[idx + 1] if idx + 1 < len(LEVEL_THRESHOLDS) else None
    return {"level": level, "title": LEVEL_TITLES[idx], "xp": xp, "level_start": LEVEL_THRESHOLDS[idx],
            "next_level_at": next_at}


def practice_xp(difficulty: int, hints_used: int) -> int:
    return 10 * difficulty + (5 if hints_used == 0 else 0)


def award_xp(repo, student_id: str, xp_key: str, xp: int, activity_type: str, title: str,
             score: float | None = None) -> int:
    """Catat XP sekali saja per xp_key. Kembalikan XP yang benar-benar diberikan (0 jika duplikat)."""
    try:
        repo.insert("activity_logs", {"student_id": student_id, "activity_type": activity_type,
                                      "activity_title": title, "score_earned": score, "xp_earned": xp,
                                      "xp_key": xp_key})
        return xp
    except DuplicateError:
        return 0


def log_activity(repo, student_id: str, activity_type: str, title: str, score: float | None = None) -> None:
    repo.insert("activity_logs", {"student_id": student_id, "activity_type": activity_type,
                                  "activity_title": title, "score_earned": score, "xp_earned": 0,
                                  "xp_key": None})


class StudentContext:
    """Memuat semua data progres siswa sekali, lalu menghitung misi & lencana."""

    def __init__(self, repo, student_id: str) -> None:
        self.repo, self.student_id = repo, student_id
        f = {"student_id": student_id}
        self.lesson_progress = repo.select("lesson_progress", f)
        self.practice = repo.select("practice_attempts", f, order="created_at", desc=True)
        self.games = repo.select("game_attempts", f, order="played_at", desc=True)
        self.evaluations = repo.select("literacy_evaluations", f, order="completed_at", desc=True)
        self.logs = repo.select("activity_logs", f, order="created_at", desc=True)
        self.user_achievements = repo.select("user_achievements", f)

    # -- turunan ---------------------------------------------------------
    @property
    def completed_lesson_ids(self) -> set[int]:
        return {p["lesson_id"] for p in self.lesson_progress if p.get("is_completed")}

    def lesson_done(self, slug: str) -> bool:
        lesson = next(l for l in LESSONS if l["slug"] == slug)
        return lesson["id"] in self.completed_lesson_ids

    @property
    def xp_keys(self) -> set[str]:
        return {l["xp_key"] for l in self.logs if l.get("xp_key")}

    @property
    def correct_questions(self) -> set[str]:
        return {a["question_id"] for a in self.practice if a.get("is_correct")}

    @property
    def hint_free_questions(self) -> set[str]:
        return {a["question_id"] for a in self.practice if a.get("is_correct") and a.get("hints_used", 0) == 0}

    @property
    def games_played(self) -> set[int]:
        return {g["game_id"] for g in self.games}

    @property
    def total_xp(self) -> int:
        return int(sum(l.get("xp_earned") or 0 for l in self.logs))

    def missions(self) -> list[dict]:
        m = [
            {"code": f"lesson:{l['slug']}", "title": f"Level 0{l['level_number']} — {l['title']}",
             "route": f"/lesson/{l['slug']}", "done": self.lesson_done(l["slug"])}
            for l in LESSONS
        ]
        m += [
            {"code": "lab", "title": "Bentangkan jaring-jaring di Cylinder Laboratory", "route": "/lab",
             "done": "lab:unfold" in self.xp_keys},
            {"code": "training", "title": f"Jawab benar {TRAINING_MISSION_TARGET} soal di Training Zone",
             "route": "/training", "done": len(self.correct_questions) >= TRAINING_MISSION_TARGET},
            {"code": "playground", "title": "Mainkan kelima mini games", "route": "/playground",
             "done": len(self.games_played) >= len(GAMES)},
            {"code": "final", "title": "Selesaikan Final Challenge", "route": "/final",
             "done": len(self.evaluations) > 0},
        ]
        return m

    def earned_achievement_codes(self) -> set[str]:
        earned = set()
        if self.lesson_done("lembah-lingkaran"):
            earned.add("circle_guardian")
        if "lab:unfold" in self.xp_keys:
            earned.add("net_unfolder")
        if self.lesson_done("bengkel-jaring"):
            earned.add("formula_architect")
        if self.lesson_done("benteng-terbuka"):
            earned.add("open_top_specialist")
        if len(self.hint_free_questions) >= HINT_FREE_TARGET:
            earned.add("hint_free_solver")
        if len(self.games_played) >= len(GAMES):
            earned.add("playground_explorer")
        if self.evaluations:
            earned.add("literacy_champion")
        return earned


def refresh(repo, student_id: str) -> dict:
    """Buka lencana baru, hitung ulang user_stats. Kembalikan {stats, new_badges, context}."""
    ctx = StudentContext(repo, student_id)
    owned = {ua["achievement_id"] for ua in ctx.user_achievements}
    new_badges = []
    for ach in ACHIEVEMENTS:
        if ach["code"] in ctx.earned_achievement_codes() and ach["id"] not in owned:
            try:
                repo.insert("user_achievements", {"student_id": student_id, "achievement_id": ach["id"]})
                new_badges.append({k: ach[k] for k in ("code", "title", "description", "icon_name")})
            except DuplicateError:
                pass
    if new_badges:
        ctx.user_achievements = repo.select("user_achievements", {"student_id": student_id})

    xp = ctx.total_xp
    missions_done = sum(1 for m in ctx.missions() if m["done"])
    stats = repo.upsert("user_stats", {"student_id": student_id, "total_xp": xp,
                                       "current_level": level_info(xp)["level"],
                                       "missions_completed": missions_done, "updated_at": now_iso()},
                        on_conflict="student_id")
    return {"stats": stats, "new_badges": new_badges, "context": ctx}

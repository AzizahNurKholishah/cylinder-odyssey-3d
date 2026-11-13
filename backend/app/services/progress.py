"""Penyusun data dashboard & profil siswa."""
from __future__ import annotations

from app.content.catalog import ACHIEVEMENTS, GAMES, LESSONS
from app.content.literacy import INDICATORS
from app.services.gamification import level_info, refresh


def lesson_status(ctx) -> list[dict]:
    done = ctx.completed_lesson_ids
    out = []
    for i, l in enumerate(sorted(LESSONS, key=lambda x: x["order_index"])):
        unlocked = i == 0 or LESSONS[i - 1]["id"] in done
        out.append({**l, "is_unlocked": unlocked, "is_completed": l["id"] in done})
    return out


def badges(ctx) -> list[dict]:
    owned = {ua["achievement_id"]: ua.get("unlocked_at") for ua in ctx.user_achievements}
    return [{**{k: a[k] for k in ("code", "title", "description", "icon_name")},
             "unlocked": a["id"] in owned, "unlocked_at": owned.get(a["id"])} for a in ACHIEVEMENTS]


def _activity(log: dict) -> dict:
    return {"type": log["activity_type"], "title": log["activity_title"], "score": log.get("score_earned"),
            "xp": log.get("xp_earned", 0), "created_at": log.get("created_at")}


def _evaluation_summary(ev: dict | None) -> dict | None:
    if not ev:
        return None
    return {
        "id": ev["id"],
        "completed_at": ev["completed_at"],
        "total_score": float(ev["total_score"]),
        "scores": {
            "reasoning": float(ev["score_reasoning"]),
            "formulating": float(ev["score_formulating"]),
            "employing": float(ev["score_employing"]),
            "evaluating": float(ev["score_evaluating"]),
        },
    }


def build_dashboard(repo, user: dict) -> dict:
    return _dashboard(user, refresh(repo, user["id"]))


def _dashboard(user: dict, r: dict) -> dict:
    ctx, stats = r["context"], r["stats"]
    missions = ctx.missions()
    done = sum(1 for m in missions if m["done"])
    lessons = lesson_status(ctx)
    next_lesson = next((l for l in lessons if l["is_unlocked"] and not l["is_completed"]), None)
    if next_lesson:
        rec = {"title": f"Lanjutkan Level 0{next_lesson['level_number']} — {next_lesson['title']}",
               "route": f"/lesson/{next_lesson['slug']}"}
    else:
        m = next((m for m in missions if not m["done"]), None)
        rec = {"title": m["title"], "route": m["route"]} if m else \
            {"title": "Semua misi selesai! Ulangi Final Challenge untuk skor terbaik.", "route": "/final"}
    return {
        "profile": {k: user.get(k) for k in ("id", "student_code", "full_name", "class_name", "role")},
        "stats": {**level_info(int(stats["total_xp"])), "missions_completed": done, "missions_total": len(missions)},
        "progress_percent": round(100 * done / len(missions)),
        "missions": missions,
        "lessons": lessons,
        "badges": badges(ctx),
        "recent_activities": [_activity(l) for l in ctx.logs[:6]],
        "recommendation": rec,
        "latest_evaluation": _evaluation_summary(ctx.evaluations[0] if ctx.evaluations else None),
    }


def build_profile(repo, user: dict) -> dict:
    r = refresh(repo, user["id"])
    data = _dashboard(user, r)
    ctx = r["context"]
    evals = [_evaluation_summary(e) for e in ctx.evaluations]
    best = max(evals, key=lambda e: e["total_score"]) if evals else None
    game_best = {}
    for g in GAMES:
        scores = [a["score"] for a in ctx.games if a["game_id"] == g["id"]]
        game_best[g["slug"]] = {"title": g["title"], "best": max(scores) if scores else None, "plays": len(scores)}
    practice = ctx.practice
    data.update({
        "indicators": INDICATORS,
        "evaluations": evals,
        "best_evaluation": best,
        "practice_summary": {
            "attempts": len(practice),
            "questions_correct": len(ctx.correct_questions),
            "hints_used_total": sum(a.get("hints_used", 0) for a in practice),
            "hint_free_correct": len(ctx.hint_free_questions),
        },
        "game_summary": game_best,
        "history": [_activity(l) for l in ctx.logs[:50]],
    })
    return data

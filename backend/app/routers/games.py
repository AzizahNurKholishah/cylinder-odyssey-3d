from __future__ import annotations

from fastapi import APIRouter, Depends
from pydantic import BaseModel, Field

from app.content.catalog import GAMES
from app.db import get_repository
from app.security import api_error, get_current_user
from app.services.gamification import GAME_MASTERY_SCORE, XP_GAME_FIRST, XP_GAME_MASTERY, award_xp, log_activity, refresh

router = APIRouter(prefix="/games", tags=["games"])


class GameAttemptIn(BaseModel):
    score: int = Field(ge=0, le=100)


@router.get("")
def list_games(user: dict = Depends(get_current_user)):
    attempts = get_repository().select("game_attempts", {"student_id": user["id"]})
    out = []
    for g in GAMES:
        scores = [a["score"] for a in attempts if a["game_id"] == g["id"]]
        out.append({**g, "best_score": max(scores) if scores else None, "plays": len(scores)})
    return {"games": out}


@router.post("/{slug}/attempts")
def submit_attempt(slug: str, body: GameAttemptIn, user: dict = Depends(get_current_user)):
    game = next((g for g in GAMES if g["slug"] == slug), None)
    if game is None:
        raise api_error(404, "game_not_found", "Game tidak ditemukan.")
    repo = get_repository()
    repo.insert("game_attempts", {"student_id": user["id"], "game_id": game["id"], "score": body.score})
    title = f"Bermain {game['title']} — skor {body.score}"
    xp = award_xp(repo, user["id"], f"game:{slug}:play", XP_GAME_FIRST, "game", title, score=body.score)
    if body.score >= GAME_MASTERY_SCORE:
        xp += award_xp(repo, user["id"], f"game:{slug}:mastery", XP_GAME_MASTERY, "game",
                       f"Menguasai {game['title']} (skor ≥ {GAME_MASTERY_SCORE})", score=body.score)
    if xp == 0:
        log_activity(repo, user["id"], "game", title, score=body.score)
    r = refresh(repo, user["id"])
    return {"ok": True, "xp_awarded": xp, "new_badges": r["new_badges"]}

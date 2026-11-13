from __future__ import annotations

from fastapi import APIRouter, Depends

from app.db import get_repository
from app.security import get_current_user
from app.services.progress import build_dashboard, build_profile

router = APIRouter(prefix="/me", tags=["me"])


@router.get("/dashboard")
def dashboard(user: dict = Depends(get_current_user)):
    return build_dashboard(get_repository(), user)


@router.get("/profile")
def profile(user: dict = Depends(get_current_user)):
    return build_profile(get_repository(), user)

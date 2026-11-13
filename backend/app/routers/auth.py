from __future__ import annotations

import hmac

from fastapi import APIRouter, Depends, Request
from pydantic import BaseModel, Field

from app.config import get_settings
from app.db import get_repository
from app.security import (CODE_PATTERN, api_error, client_ip, create_token, get_current_user, login_limiter,
                          normalize_code, public_profile)

router = APIRouter(prefix="/auth", tags=["auth"])


class LoginIn(BaseModel):
    student_code: str = Field(default="", max_length=40)
    access_key: str | None = Field(default=None, max_length=200)


@router.post("/login")
def login(body: LoginIn, request: Request):
    if not login_limiter.check(client_ip(request)):
        raise api_error(429, "too_many_attempts", "Terlalu banyak percobaan. Tunggu 1 menit, lalu coba lagi.")
    code = normalize_code(body.student_code)
    if not code:
        raise api_error(400, "empty_code", "Kode siswa belum diisi.")
    if not CODE_PATTERN.match(code):
        raise api_error(400, "invalid_format", "Format kode tidak valid. Contoh: SMP8-01.")
    rows = get_repository().select("profiles", {"student_code": code}, limit=1)
    if not rows:
        raise api_error(404, "not_registered", "Kode siswa tidak terdaftar. Tanyakan kodemu kepada guru.")
    profile = rows[0]
    if profile["role"] == "teacher":
        if not body.access_key:
            raise api_error(401, "access_key_required", "Akun guru membutuhkan access key.")
        if not hmac.compare_digest(body.access_key.encode(), get_settings().teacher_access_key.encode()):
            raise api_error(401, "invalid_access_key", "Access key guru salah.")
    return {"token": create_token(profile), "profile": public_profile(profile)}


@router.get("/me")
def me(user: dict = Depends(get_current_user)):
    return {"profile": public_profile(user)}

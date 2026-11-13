"""Token sesi (JWT), dependency autentikasi, dan pembatas laju login."""
from __future__ import annotations

import re
import threading
import time
from collections import defaultdict, deque
from datetime import datetime, timedelta, timezone

import jwt
from fastapi import Depends, HTTPException, Request, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from app.config import get_settings
from app.db import get_repository

CODE_PATTERN = re.compile(r"^[A-Z0-9]{2,8}-[A-Z0-9]{1,6}$")
_bearer = HTTPBearer(auto_error=False)


def api_error(status_code: int, code: str, message: str) -> HTTPException:
    return HTTPException(status_code=status_code, detail={"code": code, "message": message})


def normalize_code(raw: str | None) -> str:
    return (raw or "").strip().upper().replace(" ", "")


def create_token(profile: dict) -> str:
    s = get_settings()
    now = datetime.now(timezone.utc)
    payload = {
        "sub": profile["id"],
        "code": profile["student_code"],
        "role": profile["role"],
        "iat": now,
        "exp": now + timedelta(hours=s.jwt_expire_hours),
    }
    return jwt.encode(payload, s.jwt_secret, algorithm="HS256")


def public_profile(p: dict) -> dict:
    return {k: p.get(k) for k in ("id", "student_code", "full_name", "class_name", "role")}


def get_current_user(creds: HTTPAuthorizationCredentials | None = Depends(_bearer)) -> dict:
    if creds is None or creds.scheme.lower() != "bearer":
        raise api_error(status.HTTP_401_UNAUTHORIZED, "not_authenticated", "Silakan masuk terlebih dahulu.")
    try:
        payload = jwt.decode(creds.credentials, get_settings().jwt_secret, algorithms=["HS256"])
    except jwt.ExpiredSignatureError:
        raise api_error(401, "session_expired", "Sesi berakhir. Silakan masuk kembali.")
    except jwt.InvalidTokenError:
        raise api_error(401, "invalid_token", "Sesi tidak valid. Silakan masuk kembali.")
    rows = get_repository().select("profiles", {"id": payload.get("sub")}, limit=1)
    if not rows:
        raise api_error(401, "invalid_token", "Akun tidak ditemukan. Silakan masuk kembali.")
    return rows[0]


def require_teacher(user: dict = Depends(get_current_user)) -> dict:
    if user.get("role") != "teacher":
        raise api_error(403, "forbidden", "Halaman ini khusus guru.")
    return user


class RateLimiter:
    def __init__(self, limit: int, window_seconds: int = 60) -> None:
        self.limit, self.window = limit, window_seconds
        self._hits: dict[str, deque] = defaultdict(deque)
        self._lock = threading.Lock()

    def check(self, key: str) -> bool:
        now = time.monotonic()
        with self._lock:
            q = self._hits[key]
            while q and now - q[0] > self.window:
                q.popleft()
            if len(q) >= self.limit:
                return False
            q.append(now)
            return True

    def reset(self) -> None:
        with self._lock:
            self._hits.clear()


login_limiter = RateLimiter(get_settings().login_rate_limit)


def client_ip(request: Request) -> str:
    forwarded = request.headers.get("x-forwarded-for")
    if forwarded:
        return forwarded.split(",")[0].strip()
    return request.client.host if request.client else "unknown"

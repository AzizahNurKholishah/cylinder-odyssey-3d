from __future__ import annotations

import os
import secrets
from dataclasses import dataclass, field
from functools import lru_cache

from dotenv import load_dotenv

load_dotenv()


def _list(value: str) -> list[str]:
    return [v.strip() for v in value.split(",") if v.strip()]


@dataclass(frozen=True)
class Settings:
    data_backend: str = field(default_factory=lambda: os.getenv("DATA_BACKEND", "memory").lower())
    supabase_url: str = field(default_factory=lambda: os.getenv("SUPABASE_URL", ""))
    supabase_service_role_key: str = field(default_factory=lambda: os.getenv("SUPABASE_SERVICE_ROLE_KEY", ""))
    jwt_secret: str = field(default_factory=lambda: os.getenv("JWT_SECRET", ""))
    jwt_expire_hours: int = field(default_factory=lambda: int(os.getenv("JWT_EXPIRE_HOURS", "12")))
    teacher_access_key: str = field(default_factory=lambda: os.getenv("TEACHER_ACCESS_KEY", ""))
    cors_origins: list[str] = field(default_factory=lambda: _list(os.getenv(
        "CORS_ORIGINS",
        "http://localhost:5173,http://127.0.0.1:5173,http://localhost:4173,capacitor://localhost,https://localhost,http://localhost",
    )))
    login_rate_limit: int = field(default_factory=lambda: int(os.getenv("LOGIN_RATE_LIMIT", "10")))

    @property
    def is_production(self) -> bool:
        return self.data_backend == "supabase"


@lru_cache
def get_settings() -> Settings:
    s = Settings()
    if s.is_production:
        missing = [n for n, v in (("JWT_SECRET", s.jwt_secret), ("TEACHER_ACCESS_KEY", s.teacher_access_key)) if not v]
        if missing:
            raise RuntimeError(f"Environment variable wajib belum diisi: {', '.join(missing)}")
        if len(s.jwt_secret) < 32:
            raise RuntimeError("JWT_SECRET minimal 32 karakter")
        return s
    # Mode pengembangan: nilai default yang aman dipakai lokal saja.
    object.__setattr__(s, "jwt_secret", s.jwt_secret or secrets.token_urlsafe(48))
    object.__setattr__(s, "teacher_access_key", s.teacher_access_key or "guru-dev-123")
    return s

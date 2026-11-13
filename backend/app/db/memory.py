"""Repository di memori untuk pengembangan lokal dan pengujian.

Meniru perilaku penting PostgreSQL yang dipakai aplikasi:
primary key otomatis (uuid), timestamp default, dan unique constraint.
"""
from __future__ import annotations

import copy
import threading
import uuid
from datetime import datetime, timezone
from typing import Any

from app.db.base import DuplicateError

PRIMARY_KEYS = {"user_stats": "student_id"}

UNIQUE = {
    "profiles": [("student_code",)],
    "lessons": [("slug",)],
    "games": [("slug",)],
    "achievements": [("code",)],
    "lesson_progress": [("student_id", "lesson_id")],
    "user_achievements": [("student_id", "achievement_id")],
    "activity_logs": [("student_id", "xp_key")],
}

TIMESTAMP_DEFAULTS = {
    "profiles": "created_at",
    "practice_attempts": "created_at",
    "literacy_evaluations": "completed_at",
    "game_attempts": "played_at",
    "user_achievements": "unlocked_at",
    "activity_logs": "created_at",
    "user_stats": "updated_at",
}


def now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


class MemoryRepository:
    def __init__(self) -> None:
        self._tables: dict[str, list[dict]] = {}
        self._lock = threading.RLock()

    # -- helpers ---------------------------------------------------------
    def _rows(self, table: str) -> list[dict]:
        return self._tables.setdefault(table, [])

    @staticmethod
    def _match(row: dict, filters: dict[str, Any] | None) -> bool:
        return all(row.get(k) == v for k, v in (filters or {}).items())

    def _check_unique(self, table: str, row: dict, ignore: dict | None = None) -> dict | None:
        pk = PRIMARY_KEYS.get(table, "id")
        constraints = [(pk,)] + UNIQUE.get(table, [])
        for cols in constraints:
            values = tuple(row.get(c) for c in cols)
            if any(v is None for v in values):  # NULL tidak pernah bentrok (perilaku PostgreSQL)
                continue
            for existing in self._rows(table):
                if existing is ignore:
                    continue
                if tuple(existing.get(c) for c in cols) == values:
                    return existing
        return None

    def _prepare(self, table: str, row: dict) -> dict:
        row = copy.deepcopy(row)
        pk = PRIMARY_KEYS.get(table, "id")
        if row.get(pk) is None:
            row[pk] = str(uuid.uuid4())
        ts = TIMESTAMP_DEFAULTS.get(table)
        if ts and not row.get(ts):
            row[ts] = now_iso()
        return row

    # -- API -------------------------------------------------------------
    def select(self, table: str, filters: dict[str, Any] | None = None, order: str | None = None,
               desc: bool = False, limit: int | None = None) -> list[dict]:
        with self._lock:
            rows = [copy.deepcopy(r) for r in self._rows(table) if self._match(r, filters)]
        if order:
            rows.sort(key=lambda r: (r.get(order) is None, r.get(order)), reverse=desc)
        if limit is not None:
            rows = rows[:limit]
        return rows

    def insert(self, table: str, row: dict) -> dict:
        with self._lock:
            row = self._prepare(table, row)
            if self._check_unique(table, row):
                raise DuplicateError(f"duplicate row in {table}")
            self._rows(table).append(row)
            return copy.deepcopy(row)

    def upsert(self, table: str, row: dict, on_conflict: str) -> dict:
        cols = tuple(c.strip() for c in on_conflict.split(","))
        with self._lock:
            for existing in self._rows(table):
                if all(existing.get(c) == row.get(c) for c in cols):
                    existing.update(copy.deepcopy(row))
                    return copy.deepcopy(existing)
            return self.insert(table, row)

    def update(self, table: str, filters: dict[str, Any], values: dict) -> list[dict]:
        out = []
        with self._lock:
            for r in self._rows(table):
                if self._match(r, filters):
                    r.update(copy.deepcopy(values))
                    out.append(copy.deepcopy(r))
        return out

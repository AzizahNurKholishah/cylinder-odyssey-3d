from __future__ import annotations

from typing import Any, Protocol


class DuplicateError(Exception):
    """Pelanggaran unique constraint (mis. xp_key sudah ada)."""


class RepositoryError(Exception):
    """Kegagalan komunikasi dengan database."""


class Repository(Protocol):
    def select(self, table: str, filters: dict[str, Any] | None = None, order: str | None = None,
               desc: bool = False, limit: int | None = None) -> list[dict]: ...

    def insert(self, table: str, row: dict) -> dict: ...

    def upsert(self, table: str, row: dict, on_conflict: str) -> dict: ...

    def update(self, table: str, filters: dict[str, Any], values: dict) -> list[dict]: ...

"""Repository Supabase via PostgREST (HTTP). Hanya dipakai di backend dengan service key."""
from __future__ import annotations

from typing import Any

import httpx

from app.db.base import DuplicateError, RepositoryError


def _encode(v: Any) -> str:
    if isinstance(v, bool):
        return "true" if v else "false"
    if v is None:
        return "null"
    return str(v)


class SupabaseRepository:
    def __init__(self, url: str, service_key: str, timeout: float = 15.0) -> None:
        if not url or not service_key:
            raise RuntimeError("SUPABASE_URL dan SUPABASE_SERVICE_ROLE_KEY wajib diisi untuk DATA_BACKEND=supabase")
        headers = {"apikey": service_key, "Content-Type": "application/json"}
        if service_key.startswith("eyJ"):  # legacy JWT service_role key
            headers["Authorization"] = f"Bearer {service_key}"
        self._client = httpx.Client(base_url=f"{url.rstrip('/')}/rest/v1", headers=headers, timeout=timeout)

    @staticmethod
    def _check(resp: httpx.Response) -> None:
        if resp.status_code == 409:
            raise DuplicateError(resp.text)
        if resp.status_code >= 400:
            raise RepositoryError(f"Supabase {resp.status_code}: {resp.text[:300]}")

    def _filters(self, filters: dict[str, Any] | None) -> dict[str, str]:
        params: dict[str, str] = {}
        for k, v in (filters or {}).items():
            params[k] = "is.null" if v is None else f"eq.{_encode(v)}"
        return params

    def select(self, table: str, filters: dict[str, Any] | None = None, order: str | None = None,
               desc: bool = False, limit: int | None = None) -> list[dict]:
        params = {"select": "*", **self._filters(filters)}
        if order:
            params["order"] = f"{order}.{'desc' if desc else 'asc'}"
        if limit is not None:
            params["limit"] = str(limit)
        try:
            resp = self._client.get(f"/{table}", params=params)
        except httpx.HTTPError as exc:
            raise RepositoryError(str(exc)) from exc
        self._check(resp)
        return resp.json()

    def insert(self, table: str, row: dict) -> dict:
        try:
            resp = self._client.post(f"/{table}", json=row, headers={"Prefer": "return=representation"})
        except httpx.HTTPError as exc:
            raise RepositoryError(str(exc)) from exc
        self._check(resp)
        return resp.json()[0]

    def upsert(self, table: str, row: dict, on_conflict: str) -> dict:
        try:
            resp = self._client.post(
                f"/{table}", json=row, params={"on_conflict": on_conflict},
                headers={"Prefer": "resolution=merge-duplicates,return=representation"},
            )
        except httpx.HTTPError as exc:
            raise RepositoryError(str(exc)) from exc
        self._check(resp)
        return resp.json()[0]

    def update(self, table: str, filters: dict[str, Any], values: dict) -> list[dict]:
        if not filters:
            raise ValueError("update tanpa filter tidak diizinkan")
        try:
            resp = self._client.patch(f"/{table}", json=values, params=self._filters(filters),
                                      headers={"Prefer": "return=representation"})
        except httpx.HTTPError as exc:
            raise RepositoryError(str(exc)) from exc
        self._check(resp)
        return resp.json()

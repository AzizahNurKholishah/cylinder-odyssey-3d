from __future__ import annotations

import logging

from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.config import get_settings
from app.db import RepositoryError
from app.routers import admin, auth, evaluation, games, lab, lessons, me, practice

log = logging.getLogger("cylinder")


def create_app() -> FastAPI:
    settings = get_settings()
    app = FastAPI(title="Cylinder Odyssey 3D API", version="1.0.0",
                  description="Backend aplikasi pembelajaran Luas Permukaan Tabung.")
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins,
        allow_credentials=False,
        allow_methods=["GET", "POST", "OPTIONS"],
        allow_headers=["Authorization", "Content-Type"],
    )

    @app.exception_handler(RepositoryError)
    async def repo_error(_: Request, exc: RepositoryError):
        log.error("Database error: %s", exc)
        return JSONResponse(status_code=503, content={"detail": {
            "code": "db_unavailable", "message": "Server data sedang bermasalah. Coba lagi sebentar lagi."}})

    @app.exception_handler(RequestValidationError)
    async def validation_error(_: Request, exc: RequestValidationError):
        return JSONResponse(status_code=422, content={"detail": {
            "code": "validation_error", "message": "Data yang dikirim tidak valid.",
            "errors": [{"loc": e.get("loc"), "msg": e.get("msg")} for e in exc.errors()]}})

    @app.get("/api/health", tags=["health"])
    def health():
        """Cek server + koneksi database (dipakai untuk memverifikasi deploy)."""
        from app.db import get_repository
        try:
            lessons = len(get_repository().select("lessons"))
            students = len(get_repository().select("profiles", {"role": "student"}))
            db = {"ok": True, "lessons": lessons, "students": students}
        except Exception as exc:  # noqa: BLE001 — laporkan apa pun penyebabnya
            log.error("Health check DB gagal: %s", exc)
            db = {"ok": False, "error": str(exc)[:200]}
        return {"status": "ok" if db["ok"] else "db_error", "data_backend": settings.data_backend, "database": db}

    for r in (auth, me, lessons, practice, evaluation, games, lab, admin):
        app.include_router(r.router, prefix="/api")
    return app


app = create_app()

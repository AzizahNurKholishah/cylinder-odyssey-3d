from __future__ import annotations

from functools import lru_cache

from app.config import get_settings
from app.db.base import DuplicateError, Repository, RepositoryError  # noqa: F401


def seed_memory(repo) -> None:
    """Isi repository memori dengan konten yang sama dengan supabase/seed.sql."""
    from app.content.catalog import ACHIEVEMENTS, GAMES, LESSONS, SAMPLE_PROFILES
    from app.content.literacy import LITERACY_QUESTIONS
    from app.content.questions import QUESTIONS
    from app.services.serialize import literacy_to_row, question_to_row

    for row in LESSONS:
        repo.insert("lessons", row)
    for row in GAMES:
        repo.insert("games", row)
    for row in ACHIEVEMENTS:
        repo.insert("achievements", row)
    for q in QUESTIONS:
        repo.insert("questions", question_to_row(q))
    for q in LITERACY_QUESTIONS:
        repo.insert("questions", literacy_to_row(q))
    for p in SAMPLE_PROFILES:
        repo.insert("profiles", p)


@lru_cache
def get_repository() -> Repository:
    settings = get_settings()
    if settings.data_backend == "supabase":
        from app.db.supabase_rest import SupabaseRepository
        return SupabaseRepository(settings.supabase_url, settings.supabase_service_role_key)
    from app.db.memory import MemoryRepository
    repo = MemoryRepository()
    seed_memory(repo)
    return repo

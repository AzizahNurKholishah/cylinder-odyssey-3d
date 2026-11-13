import os

os.environ["DATA_BACKEND"] = "memory"
os.environ["TEACHER_ACCESS_KEY"] = "test-key"
os.environ["LOGIN_RATE_LIMIT"] = "1000"

import pytest  # noqa: E402
from fastapi.testclient import TestClient  # noqa: E402

from app.db import get_repository  # noqa: E402
from app.main import app  # noqa: E402
from app.security import login_limiter  # noqa: E402


@pytest.fixture()
def client():
    get_repository.cache_clear()
    login_limiter.reset()
    with TestClient(app) as c:
        yield c


def login(client, code="SMP8-01", **extra):
    r = client.post("/api/auth/login", json={"student_code": code, **extra})
    assert r.status_code == 200, r.text
    return {"Authorization": f"Bearer {r.json()['token']}"}


@pytest.fixture()
def auth(client):
    return login(client)

from tests.conftest import login

FULL_LITERACY = {
    "LIT-1": {"r_b": "3,5", "lp_a": "748", "lp_b": "957", "pilih": "a",
              "alasan": "Desain A lebih hemat karena luasnya 748 cm² lebih kecil dari 957 cm²."},
    "LIT-2": {"model": "a", "r": "28", "lp_satu": "16544", "lp_total": "82720", "lp_m2": "8,272", "cukup": "a"},
    "LIT-3": {"tutup": "154", "selimut": "660", "total": "814", "biaya": "Rp48.840"},
    "LIT-4": {"lp_satu": "5632", "lp_total": "33792", "lembar": "6,76", "klaim": "a", "beli": "7",
              "alasan": "Kalau beli 6 lembar sengnya kurang, jadi dibulatkan ke atas."},
}


# ----------------------------------------------------------------- auth
def test_login_validation(client):
    assert client.post("/api/auth/login", json={"student_code": ""}).json()["detail"]["code"] == "empty_code"
    assert client.post("/api/auth/login", json={"student_code": "!!"}).json()["detail"]["code"] == "invalid_format"
    r = client.post("/api/auth/login", json={"student_code": "SMP8-99"})
    assert r.status_code == 404 and r.json()["detail"]["code"] == "not_registered"
    r = client.post("/api/auth/login", json={"student_code": " smp8-01 "})
    assert r.status_code == 200 and r.json()["profile"]["student_code"] == "SMP8-01"


def test_teacher_login_requires_key(client):
    assert client.post("/api/auth/login", json={"student_code": "GURU-01"}).status_code == 401
    assert client.post("/api/auth/login", json={"student_code": "GURU-01", "access_key": "x"}).status_code == 401
    login(client, "GURU-01", access_key="test-key")


def test_private_routes_require_token(client):
    assert client.get("/api/me/dashboard").status_code == 401
    assert client.get("/api/me/dashboard", headers={"Authorization": "Bearer junk"}).status_code == 401


def test_rate_limit(client):
    from app.security import login_limiter
    login_limiter.limit = 3
    try:
        codes = [client.post("/api/auth/login", json={"student_code": "SMP8-99"}).status_code for _ in range(5)]
        assert codes[-1] == 429
    finally:
        login_limiter.limit = 1000
        login_limiter.reset()


# ----------------------------------------------------------------- lessons & XP
def test_lessons_unlock_in_order_and_xp_idempotent(client, auth):
    assert client.post("/api/lessons/bengkel-jaring/complete", headers=auth).status_code == 403
    r1 = client.post("/api/lessons/lembah-lingkaran/complete", headers=auth).json()
    r2 = client.post("/api/lessons/lembah-lingkaran/complete", headers=auth).json()
    assert r1["xp_awarded"] == 50 and r2["xp_awarded"] == 0
    assert [b["code"] for b in r1["new_badges"]] == ["circle_guardian"]
    d = client.get("/api/me/dashboard", headers=auth).json()
    assert d["stats"]["xp"] == 50
    assert d["lessons"][1]["is_unlocked"] is True
    assert d["recommendation"]["route"] == "/lesson/bengkel-jaring"


def test_students_cannot_see_each_other(client, auth):
    client.post("/api/lessons/lembah-lingkaran/complete", headers=auth)
    other = login(client, "SMP8-02")
    d = client.get("/api/me/dashboard", headers=other).json()
    assert d["stats"]["xp"] == 0 and d["profile"]["student_code"] == "SMP8-02"


# ----------------------------------------------------------------- practice
def test_practice_no_answer_leak_and_feedback(client, auth):
    q = client.get("/api/practice/questions/TZ-I02", headers=auth).json()["question"]
    dumped = str(q)
    assert "'answer'" not in dumped and "errors" not in dumped and len(q["hints"]) == 3

    wrong = client.post("/api/practice/questions/TZ-I02/attempt", headers=auth,
                        json={"answers": {"r": "60", "lp": "1", "unit": "a"}, "hints_used": 1}).json()
    assert wrong["is_correct"] is False and wrong["error_type"] == "diameter_as_radius"
    assert wrong["explanation"] is None and wrong["xp_awarded"] == 0

    revealed = client.post("/api/practice/questions/TZ-I02/attempt", headers=auth,
                           json={"answers": {}, "hints_used": 3, "reveal": True}).json()
    assert revealed["explanation"] and revealed["correct_answers"]["lp"] == "22.608 cm²"

    ok = client.post("/api/practice/questions/TZ-I02/attempt", headers=auth,
                     json={"answers": {"r": "30", "lp": "22.608", "unit": "a"}, "hints_used": 0}).json()
    assert ok["is_correct"] and ok["xp_awarded"] == 25
    again = client.post("/api/practice/questions/TZ-I02/attempt", headers=auth,
                        json={"answers": {"r": "30", "lp": "22608", "unit": "a"}}).json()
    assert again["xp_awarded"] == 0

    r = client.post(f"/api/practice/attempts/{ok['attempt_id']}/reflection", headers=auth,
                    json={"text": "Karena drumnya tertutup."})
    assert r.status_code == 200
    other = login(client, "SMP8-03")
    assert client.post(f"/api/practice/attempts/{ok['attempt_id']}/reflection", headers=other,
                       json={"text": "hack"}).status_code == 404


def test_hint_free_badge(client, auth):
    answers = {
        "TZ-B01": {"r": "a"}, "TZ-B02": {"tf": "salah"}, "TZ-B03": {"shape": "a"}, "TZ-B06": {"tf": "benar"},
        "TZ-B07": {"pi": "a"},
    }
    badges = []
    for qid, a in answers.items():
        res = client.post(f"/api/practice/questions/{qid}/attempt", headers=auth, json={"answers": a}).json()
        assert res["is_correct"], qid
        badges += [b["code"] for b in res["new_badges"]]
    assert "hint_free_solver" in badges


# ----------------------------------------------------------------- evaluation
def test_evaluation_full_score(client, auth):
    q = client.get("/api/evaluation/questions", headers=auth).json()
    assert len(q["questions"]) == 4 and "model_answer" not in str(q)
    res = client.post("/api/evaluation/submit", headers=auth, json={"answers": FULL_LITERACY}).json()
    assert res["total_score"] == 24, res["detail"]
    assert res["scores"] == {"reasoning": 6, "formulating": 6, "employing": 6, "evaluating": 6}
    assert any(b["code"] == "literacy_champion" for b in res["new_badges"])
    assert client.get("/api/evaluation/latest", headers=auth).json()["result"]["total_score"] == 24


def test_evaluation_partial_credit(client, auth):
    partial = {
        "LIT-1": {"r_b": "3.5", "lp_a": "748", "lp_b": "1000", "pilih": "b", "alasan": "pokoknya"},
        "LIT-3": {"tutup": "154", "selimut": "660", "total": "968", "biaya": "1"},
        "LIT-4": {"lp_satu": "5632", "lp_total": "33792", "lembar": "6,76", "klaim": "b", "beli": "6",
                  "alasan": "dibulatkan saja"},
    }
    res = client.post("/api/evaluation/submit", headers=auth, json={"answers": partial}).json()
    assert res["scores"] == {"reasoning": 2, "formulating": 0, "employing": 3, "evaluating": 3}
    assert res["total_score"] == 8
    lit3 = res["detail"]["LIT-3"]["steps"]
    assert lit3[2]["error_type"] == "closed_instead_of_open"
    lit4 = res["detail"]["LIT-4"]["steps"]
    assert lit4[4]["error_type"] == "rounding_down"


# ----------------------------------------------------------------- games, lab, profile, admin
def test_games_and_playground_badge(client, auth):
    for slug in ["part-detector", "radius-pi-sprint", "net-matcher", "formula-builder"]:
        assert client.post(f"/api/games/{slug}/attempts", headers=auth, json={"score": 80}).json()["xp_awarded"] == 40
    res = client.post("/api/games/cylinder-quest/attempts", headers=auth, json={"score": 50}).json()
    assert res["xp_awarded"] == 15 and res["new_badges"][0]["code"] == "playground_explorer"
    assert client.post("/api/games/net-matcher/attempts", headers=auth, json={"score": 101}).status_code == 422
    games = client.get("/api/games", headers=auth).json()["games"]
    assert games[0]["best_score"] == 80


def test_lab(client, auth):
    r = client.post("/api/lab/explored", headers=auth, json={"feature": "unfold"}).json()
    assert r["xp_awarded"] == 20 and r["new_badges"][0]["code"] == "net_unfolder"
    calc = client.post("/api/lab/calculate", headers=auth, json={
        "input_type": "d", "value": "14", "height": "10", "cylinder_type": "closed"}).json()
    assert calc["total"] == 748 and calc["pi"] == "22/7"
    for bad in ["0", "-3", "abc", ""]:
        r = client.post("/api/lab/calculate", headers=auth, json={
            "input_type": "r", "value": bad, "height": "10", "cylinder_type": "open"})
        assert r.status_code == 422, bad


def test_profile(client, auth):
    client.post("/api/evaluation/submit", headers=auth, json={"answers": FULL_LITERACY})
    p = client.get("/api/me/profile", headers=auth).json()
    assert p["best_evaluation"]["total_score"] == 24
    assert p["history"] and set(p["indicators"]) == {"reasoning", "formulating", "employing", "evaluating"}


def test_admin(client, auth):
    assert client.get("/api/admin/students", headers=auth).status_code == 403
    teacher = login(client, "GURU-01", access_key="test-key")
    r = client.post("/api/admin/students", headers=teacher, json={"student_code": "smp8-31", "full_name": "Siswa 31"})
    assert r.status_code == 201
    assert client.post("/api/admin/students", headers=teacher, json={"student_code": "SMP8-31"}).status_code == 409
    students = client.get("/api/admin/students", headers=teacher).json()["students"]
    assert len(students) == 31
    login(client, "SMP8-31")


def test_health_reports_database(client):
    d = client.get("/api/health").json()
    assert d["status"] == "ok" and d["database"] == {"ok": True, "lessons": 4, "students": 30}

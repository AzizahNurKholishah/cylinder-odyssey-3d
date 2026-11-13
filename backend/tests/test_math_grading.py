import pytest

from app.content.literacy import LITERACY_QUESTIONS
from app.content.questions import QUESTIONS, QUESTIONS_BY_ID
from app.services import cylinder_math as cm
from app.services.grading import grade_question, grade_step
from app.services.numbers import parse_number_candidates


def test_formulas():
    assert cm.clean(cm.surface_area(7, 10, "closed", "22/7")) == 748
    assert cm.clean(cm.surface_area(3.5, 10, "open", "22/7")) == 258.5
    assert cm.clean(cm.surface_area(7, 10, "blanket", "22/7")) == 440
    assert cm.clean(cm.surface_area(30, 90, "closed", "3.14")) == 22608


@pytest.mark.parametrize("r,d,expected", [(7, None, "22/7"), (3.5, 7, "22/7"), (10, None, "3.14"), (14, None, "22/7")])
def test_choose_pi(r, d, expected):
    assert cm.choose_pi(r, d)[0] == expected


@pytest.mark.parametrize("raw,expected", [
    ("8,272", [8.272, 8272.0]), ("8.272", [8.272, 8272.0]), ("Rp48.840", [48.84, 48840.0]),
    ("1.540,5 cm²", [1540.5]), ("836 cm2", [836.0]), ("3,5", [3.5]), ("abc", []), ("", []), ("7 lembar", [7.0]),
])
def test_parse_numbers(raw, expected):
    assert parse_number_candidates(raw) == expected


def test_fmt():
    assert cm.fmt(22608) == "22.608"
    assert cm.fmt(258.5) == "258,5"
    assert cm.fmt(3617.28) == "3.617,28"


def test_all_questions_have_three_hints_and_valid_answers():
    for q in QUESTIONS:
        assert len(q["hints"]) == 3, q["id"]
        assert q["explanation"], q["id"]
        for s in q["steps"]:
            if s["kind"] == "choice":
                assert s["answer"] in {o["id"] for o in s["options"]}, (q["id"], s["id"])


def test_literacy_total_is_24():
    assert sum(q["max_score"] for q in LITERACY_QUESTIONS) == 24
    assert [len(q["steps"]) for q in LITERACY_QUESTIONS] == [5, 6, 4, 6]


def test_correct_answers_grade_full():
    q = QUESTIONS_BY_ID["TZ-I01"]
    res = grade_question(q, {"alas": "154", "dua": "308", "ls": "528", "lp": "836", "unit": "a"})
    assert res["is_correct"] and res["score"] == res["max_score"]


@pytest.mark.parametrize("qid,step_id,answer,error", [
    ("TZ-I02", "r", "60", "diameter_as_radius"),
    ("TZ-I02", "lp", "56520", "diameter_as_radius"),  # pakai r = 60
    ("TZ-I03", "lp", "297", "closed_instead_of_open"),
    ("TZ-I01", "lp", "682", "open_instead_of_closed"),
    ("TZ-I01", "lp", "528", "blanket_only"),
    ("TZ-I01", "lp", "835.24", "wrong_pi"),
    ("TZ-E04", "lembar", "2", "rounding_down"),
    ("TZ-E01", "m2", "225,28", "unit_conversion"),
    ("TZ-B05", "ls", "220", "forgot_two"),
])
def test_error_detection(qid, step_id, answer, error):
    step = next(s for s in QUESTIONS_BY_ID[qid]["steps"] if s["id"] == step_id)
    res = grade_step(step, answer)
    assert not res["correct"]
    assert res["error_type"] == error


def test_invalid_and_empty_inputs():
    step = QUESTIONS_BY_ID["TZ-I01"]["steps"][0]
    assert grade_step(step, "")["error_type"] == "empty"
    assert grade_step(step, "seratus")["error_type"] == "invalid_input"
    assert grade_step(step, "999")["error_type"] == "calculation"

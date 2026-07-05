"""Servervalidatie + anonymisering van gespreksrichting-antwoorden in /survey/submit.

Spec: docs/superpowers/specs/2026-07-05-richtingsvraag-behoud-design.md par. 6.
Fixture-opzet gespiegeld aan tests/test_deepening_submit.py (trede 1).
"""
from __future__ import annotations

from sqlalchemy.orm import Session

from backend.models import SurveyResponse
from backend.scoring import ORG_FACTOR_KEYS

from tests.test_api_flows import _create_campaign, _create_org, _create_respondent


def _org_raw(low_factors: dict[str, int] | None = None) -> dict[str, int]:
    base = {f"{factor}_{idx}": 4 for factor in ORG_FACTOR_KEYS for idx in range(1, 4)}
    for factor, value in (low_factors or {}).items():
        for idx in range(1, 4):
            base[f"{factor}_{idx}"] = value
    return base


def _retention_payload(token: str, *, org_raw: dict[str, int], deepening=None) -> dict:
    payload = {
        "token": token,
        "tenure_years": None,
        "exit_reason_category": None,
        "enps_score": 9,
        "stay_intent_score": 4,
        "sdt_raw": {f"B{i}": 4 for i in range(1, 13)},
        "org_raw": org_raw,
        "pull_factors_raw": {},
        "open_text": "Meer ontwikkelruimte zou helpen.",
        "uwes_raw": {"uwes_1": 4, "uwes_2": 5, "uwes_3": 4},
        "turnover_intention_raw": {"ti_1": 2, "ti_2": 3},
    }
    if deepening is not None:
        payload["deepening_responses"] = deepening
    return payload


def _exit_payload(token: str, *, org_raw: dict[str, int], deepening=None) -> dict:
    payload = {
        "token": token,
        "tenure_years": 2.0,
        "exit_reason_category": "groei",
        "enps_score": 8,
        "stay_intent_score": 4,
        "signal_visibility_score": 2,
        "sdt_raw": {f"B{i}": 3 for i in range(1, 13)},
        "org_raw": org_raw,
        "pull_factors_raw": {"leiderschap": 1},
        "open_text": "Ik miste vooral duidelijk groeiperspectief.",
        "uwes_raw": {},
        "turnover_intention_raw": {},
    }
    if deepening is not None:
        payload["deepening_responses"] = deepening
    return payload


def _answered_workload_entry(scan_type: str = "retention") -> dict:
    return {
        "factor_key": "workload",
        "question_set_version": f"{scan_type}_workload_v1",
        "status": "answered",
        "primary": "wl_recovery",
    }


def _setup(db: Session, *, scan_type: str = "retention"):
    org = _create_org(db, api_key="direction-submit-key")
    campaign = _create_campaign(db, org, name="Richtingsvraag", scan_type=scan_type)
    respondent = _create_respondent(db, campaign, email="richting@example.com")
    return respondent


def _stored(db: Session, respondent) -> SurveyResponse:
    return db.query(SurveyResponse).filter(SurveyResponse.respondent_id == respondent.id).one()


def test_direction_accepted_and_persisted(client, db_session: Session):
    respondent = _setup(db_session)
    entry = _answered_workload_entry()
    entry["direction"] = {
        "question_set_version": "retention_workload_direction_v1",
        "status": "answered",
        "choice": "wld_recovery",
        "other_text": None,
    }
    payload = _retention_payload(respondent.token, org_raw=_org_raw({"workload": 2}), deepening=[entry])

    response = client.post("/survey/submit", json=payload)

    assert response.status_code == 200
    stored = _stored(db_session, respondent)
    assert stored.deepening_responses[0]["direction"]["choice"] == "wld_recovery"


def test_direction_unknown_choice_422(client, db_session: Session):
    respondent = _setup(db_session)
    entry = _answered_workload_entry()
    entry["direction"] = {
        "question_set_version": "retention_workload_direction_v1",
        "status": "answered",
        "choice": "wld_bestaat_niet",
        "other_text": None,
    }
    payload = _retention_payload(respondent.token, org_raw=_org_raw({"workload": 2}), deepening=[entry])

    response = client.post("/survey/submit", json=payload)

    assert response.status_code == 422
    assert response.json()["detail"] == "Onbekende gespreksrichting-optie."


def test_direction_wrong_version_422(client, db_session: Session):
    respondent = _setup(db_session)
    entry = _answered_workload_entry()
    entry["direction"] = {
        "question_set_version": "retention_workload_direction_v9",
        "status": "answered",
        "choice": "wld_recovery",
        "other_text": None,
    }
    payload = _retention_payload(respondent.token, org_raw=_org_raw({"workload": 2}), deepening=[entry])

    response = client.post("/survey/submit", json=payload)

    assert response.status_code == 422
    assert response.json()["detail"] == "Verouderde gespreksrichting-versie."


def test_direction_on_exit_scan_422(client, db_session: Session):
    respondent = _setup(db_session, scan_type="exit")
    entry = _answered_workload_entry(scan_type="exit")
    entry["direction"] = {
        "question_set_version": "retention_workload_direction_v1",
        "status": "answered",
        "choice": "wld_recovery",
        "other_text": None,
    }
    payload = _exit_payload(respondent.token, org_raw=_org_raw({"workload": 2}), deepening=[entry])

    response = client.post("/survey/submit", json=payload)

    assert response.status_code == 422
    assert response.json()["detail"] == "Gespreksrichting wordt niet ondersteund voor dit scantype."


def test_direction_other_text_is_anonymized(client, db_session: Session):
    respondent = _setup(db_session)
    entry = _answered_workload_entry()
    entry["direction"] = {
        "question_set_version": "retention_workload_direction_v1",
        "status": "answered",
        "choice": "wld_other",
        "other_text": "Jan de Vries van team Alpha moet weg",
    }
    payload = _retention_payload(respondent.token, org_raw=_org_raw({"workload": 2}), deepening=[entry])

    response = client.post("/survey/submit", json=payload)

    assert response.status_code == 200
    stored = _stored(db_session, respondent)
    assert "Jan" not in (stored.deepening_responses[0]["direction"]["other_text"] or "")

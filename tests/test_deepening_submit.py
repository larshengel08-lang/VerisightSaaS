"""Server-side validatie + persistentie van verdiepingsantwoorden in /survey/submit."""
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


def _setup_retention(db: Session):
    org = _create_org(db, api_key="deepening-submit-key")
    campaign = _create_campaign(db, org, name="Retentie verdieping", scan_type="retention")
    respondent = _create_respondent(db, campaign, email="deep@example.com")
    return respondent


def _stored(db: Session, respondent) -> SurveyResponse:
    return db.query(SurveyResponse).filter(SurveyResponse.respondent_id == respondent.id).one()


def test_valid_deepening_persisted(client, db_session: Session):
    respondent = _setup_retention(db_session)
    payload = _retention_payload(
        respondent.token,
        org_raw=_org_raw({"workload": 2}),
        deepening=[{
            "factor_key": "workload",
            "question_set_version": "retention_workload_v1",
            "status": "answered",
            "primary": "wl_recovery",
        }],
    )

    response = client.post("/survey/submit", json=payload)

    assert response.status_code == 200
    stored = _stored(db_session, respondent)
    assert stored.deepening_responses[0]["primary"] == "wl_recovery"
    assert stored.deepening_responses[0]["factor_key"] == "workload"


def test_skipped_entry_persisted(client, db_session: Session):
    respondent = _setup_retention(db_session)
    payload = _retention_payload(
        respondent.token,
        org_raw=_org_raw({"workload": 2}),
        deepening=[{
            "factor_key": "workload",
            "question_set_version": "retention_workload_v1",
            "status": "skipped",
        }],
    )

    response = client.post("/survey/submit", json=payload)

    assert response.status_code == 200
    stored = _stored(db_session, respondent)
    assert stored.deepening_responses[0]["status"] == "skipped"


def test_entry_for_unoffered_factor_rejected(client, db_session: Session):
    respondent = _setup_retention(db_session)
    payload = _retention_payload(
        respondent.token,
        org_raw=_org_raw(),  # alles 4 → geen triggers
        deepening=[{
            "factor_key": "growth",
            "question_set_version": "retention_growth_v1",
            "status": "answered",
            "primary": "gr_time",
        }],
    )

    response = client.post("/survey/submit", json=payload)

    assert response.status_code == 422
    assert response.json()["detail"] == "Verdieping hoort niet bij deze inzending."


def test_duplicate_factor_rejected(client, db_session: Session):
    respondent = _setup_retention(db_session)
    entry = {
        "factor_key": "workload",
        "question_set_version": "retention_workload_v1",
        "status": "answered",
        "primary": "wl_recovery",
    }
    payload = _retention_payload(
        respondent.token,
        org_raw=_org_raw({"workload": 2}),
        deepening=[entry, {**entry, "primary": "wl_volume"}],
    )

    response = client.post("/survey/submit", json=payload)

    assert response.status_code == 422
    assert response.json()["detail"] == "Dubbele verdieping voor dezelfde factor."


def test_unknown_option_key_rejected(client, db_session: Session):
    respondent = _setup_retention(db_session)
    payload = _retention_payload(
        respondent.token,
        org_raw=_org_raw({"workload": 2}),
        deepening=[{
            "factor_key": "workload",
            "question_set_version": "retention_workload_v1",
            "status": "answered",
            "primary": "wl_bestaat_niet",
        }],
    )

    response = client.post("/survey/submit", json=payload)

    assert response.status_code == 422
    assert response.json()["detail"] == "Onbekende verdiepingsoptie."


def test_stale_version_rejected(client, db_session: Session):
    respondent = _setup_retention(db_session)
    payload = _retention_payload(
        respondent.token,
        org_raw=_org_raw({"workload": 2}),
        deepening=[{
            "factor_key": "workload",
            "question_set_version": "retention_workload_v0",
            "status": "answered",
            "primary": "wl_recovery",
        }],
    )

    response = client.post("/survey/submit", json=payload)

    assert response.status_code == 422
    assert response.json()["detail"] == "Verouderde vragenset-versie."


def test_other_text_is_anonymized(client, db_session: Session):
    respondent = _setup_retention(db_session)
    payload = _retention_payload(
        respondent.token,
        org_raw=_org_raw({"workload": 2}),
        deepening=[{
            "factor_key": "workload",
            "question_set_version": "retention_workload_v1",
            "status": "answered",
            "primary": "wl_other",
            "other_text": "Mail maar naar jan.jansen@voorbeeld.nl hierover.",
        }],
    )

    response = client.post("/survey/submit", json=payload)

    assert response.status_code == 200
    stored = _stored(db_session, respondent)
    other_text = stored.deepening_responses[0]["other_text"]
    assert "jan.jansen@voorbeeld.nl" not in other_text
    assert "[EMAIL]" in other_text


def test_no_deepening_still_works(client, db_session: Session):
    respondent = _setup_retention(db_session)
    payload = _retention_payload(respondent.token, org_raw=_org_raw({"workload": 2}))

    response = client.post("/survey/submit", json=payload)

    assert response.status_code == 200
    stored = _stored(db_session, respondent)
    assert stored.deepening_responses is None

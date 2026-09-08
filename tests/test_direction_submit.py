"""Servervalidatie + persistentie van direction_response in /survey/submit (spec par. 4.3)."""
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


def _retention_payload(token: str, *, org_raw: dict[str, int], direction=None, deepening=None) -> dict:
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
    if direction is not None:
        payload["direction_response"] = direction
    if deepening is not None:
        payload["deepening_responses"] = deepening
    return payload


def _exit_payload(token: str, *, org_raw: dict[str, int], direction=None) -> dict:
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
    if direction is not None:
        payload["direction_response"] = direction
    return payload


def _dr(scan_type="retention", fk="workload", status="answered", choice="wld_peaks", other_text=None):
    version = "v2" if scan_type == "retention" else "v1"
    return {"factor_key": fk, "question_set_version": f"{scan_type}_{fk}_direction_{version}",
            "status": status, "choice": choice if status == "answered" else None,
            "other_text": other_text}


def _setup(db: Session, *, scan_type: str = "retention"):
    org = _create_org(db, api_key=f"direction-submit-{scan_type}")
    campaign = _create_campaign(db, org, name="Richtingsvraag", scan_type=scan_type)
    return _create_respondent(db, campaign, email=f"richting-{scan_type}@example.com")


def _stored(db: Session, respondent) -> SurveyResponse:
    return db.query(SurveyResponse).filter(SurveyResponse.respondent_id == respondent.id).one()


def test_retention_accepted_and_persisted(client, db_session: Session):
    r = _setup(db_session)
    resp = client.post("/survey/submit", json=_retention_payload(
        r.token, org_raw=_org_raw({"workload": 2}), direction=_dr()))
    assert resp.status_code == 200, resp.text
    stored = _stored(db_session, r)
    assert stored.direction_response == _dr()


def test_exit_accepted_and_persisted(client, db_session: Session):
    r = _setup(db_session, scan_type="exit")
    resp = client.post("/survey/submit", json=_exit_payload(
        r.token, org_raw=_org_raw({"growth": 2}), direction=_dr("exit", "growth", choice="grd_time")))
    assert resp.status_code == 200, resp.text
    assert _stored(db_session, r).direction_response["factor_key"] == "growth"


def test_high_scorer_without_trigger_can_answer_direction(client, db_session: Session):
    # Laagste factor scoort nog goed: geen verdieping, wel een richtingvraag.
    r = _setup(db_session)
    org_raw = _org_raw(); org_raw["growth_3"] = 3
    resp = client.post("/survey/submit", json=_retention_payload(
        r.token, org_raw=org_raw, direction=_dr(fk="growth", choice="grd_none")))
    assert resp.status_code == 200, resp.text
    stored = _stored(db_session, r)
    assert stored.deepening_responses is None
    assert stored.direction_response["choice"] == "grd_none"


def test_wrong_factor_422(client, db_session: Session):
    r = _setup(db_session)
    resp = client.post("/survey/submit", json=_retention_payload(
        r.token, org_raw=_org_raw({"workload": 2}), direction=_dr(fk="growth", choice="grd_time")))
    assert resp.status_code == 422
    assert resp.json()["detail"] == "Gespreksrichting hoort niet bij deze inzending."


def test_unknown_factor_key_422(client, db_session: Session):
    # Pint de volgorde: de factorcheck moet vóór de set-lookup staan, anders 500 i.p.v. 422.
    r = _setup(db_session)
    resp = client.post("/survey/submit", json=_retention_payload(
        r.token, org_raw=_org_raw({"workload": 2}), direction=_dr(fk="bestaat_niet")))
    assert resp.status_code == 422
    assert resp.json()["detail"] == "Gespreksrichting hoort niet bij deze inzending."


def test_unknown_choice_422(client, db_session: Session):
    r = _setup(db_session)
    resp = client.post("/survey/submit", json=_retention_payload(
        r.token, org_raw=_org_raw({"workload": 2}), direction=_dr(choice="wld_bestaat_niet")))
    assert resp.status_code == 422
    assert resp.json()["detail"] == "Onbekende gespreksrichting-optie."


def test_wrong_version_422(client, db_session: Session):
    r = _setup(db_session)
    d = _dr(); d["question_set_version"] = "retention_workload_direction_v1"   # de juli-versie
    resp = client.post("/survey/submit", json=_retention_payload(
        r.token, org_raw=_org_raw({"workload": 2}), direction=d))
    assert resp.status_code == 422
    assert resp.json()["detail"] == "Verouderde gespreksrichting-versie."


def test_legacy_nested_direction_422(client, db_session: Session):
    r = _setup(db_session)
    legacy_entry = {"factor_key": "workload", "question_set_version": "retention_workload_v1",
                    "status": "answered", "primary": "wl_recovery",
                    "direction": {"question_set_version": "retention_workload_direction_v1",
                                  "status": "answered", "choice": "wld_recovery", "other_text": None}}
    resp = client.post("/survey/submit", json=_retention_payload(
        r.token, org_raw=_org_raw({"workload": 2}), deepening=[legacy_entry]))
    assert resp.status_code == 422
    assert "Verouderd inzendformaat voor gespreksrichting" in resp.text


def test_missing_field_accepted_and_null(client, db_session: Session):
    r = _setup(db_session)
    resp = client.post("/survey/submit", json=_retention_payload(r.token, org_raw=_org_raw({"workload": 2})))
    assert resp.status_code == 200, resp.text
    assert _stored(db_session, r).direction_response is None


def test_skipped_persisted(client, db_session: Session):
    r = _setup(db_session)
    resp = client.post("/survey/submit", json=_retention_payload(
        r.token, org_raw=_org_raw({"workload": 2}), direction=_dr(status="skipped")))
    assert resp.status_code == 200, resp.text
    stored = _stored(db_session, r).direction_response
    assert stored["status"] == "skipped" and stored["choice"] is None


def test_other_text_is_anonymized(client, db_session: Session):
    r = _setup(db_session)
    resp = client.post("/survey/submit", json=_retention_payload(
        r.token, org_raw=_org_raw({"workload": 2}),
        direction=_dr(choice="wld_other", other_text="Mail maar naar jan.jansen@voorbeeld.nl hierover.")))
    assert resp.status_code == 200, resp.text
    assert "jan.jansen@voorbeeld.nl" not in _stored(db_session, r).direction_response["other_text"]

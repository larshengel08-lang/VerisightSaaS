"""Servervalidatie + persistentie van de vertrekmaand in /survey/submit (spec 2026-10-07 par. 1)."""
from __future__ import annotations

import re
from datetime import date
from pathlib import Path

import pytest
from sqlalchemy.orm import Session

from backend import exit_month as em
from backend.main import _survey_exit_month_options
from backend.models import Respondent, SurveyResponse

from tests.test_api_flows import _create_campaign, _create_org, _create_respondent
from tests.test_direction_submit import _exit_payload, _org_raw, _retention_payload

FIXED_TODAY = date(2026, 10, 7)


@pytest.fixture(autouse=True)
def _pin_today(monkeypatch: pytest.MonkeyPatch) -> None:
    """Zoals test_survey_closes_at.py: zonder deze pin roept de test en de
    request elk apart today_amsterdam() aan en kan het venster rond
    middernacht verschillen."""
    monkeypatch.setattr("backend.main.today_amsterdam", lambda: FIXED_TODAY)


def _setup(db: Session, *, scan_type: str = "exit", exit_month: str | None = None) -> Respondent:
    org = _create_org(db, api_key=f"exit-month-submit-{scan_type}-{exit_month}")
    campaign = _create_campaign(db, org, name="Vertrekmaand", scan_type=scan_type)
    return _create_respondent(
        db, campaign,
        email=f"vertrekmaand-{scan_type}@example.com",
        exit_month=exit_month,
    )


def _stored(db: Session, respondent: Respondent) -> SurveyResponse:
    return db.query(SurveyResponse).filter(SurveyResponse.respondent_id == respondent.id).one()


def test_exit_submit_met_geldige_maand(client, db_session: Session):
    r = _setup(db_session, exit_month=None)
    payload = _exit_payload(r.token, org_raw=_org_raw())
    payload["exit_month"] = "2026-09"
    resp = client.post("/survey/submit", json=payload)
    assert resp.status_code == 200, resp.text
    db_session.refresh(r)
    assert r.exit_month == "2026-09"
    assert r.completed is True


def test_exit_submit_zonder_maand_blijft_leeg(client, db_session: Session):
    r = _setup(db_session, exit_month=None)
    payload = _exit_payload(r.token, org_raw=_org_raw())
    payload["exit_month"] = None
    resp = client.post("/survey/submit", json=payload)
    assert resp.status_code == 200, resp.text
    db_session.refresh(r)
    assert r.exit_month is None
    assert r.completed is True


@pytest.mark.parametrize("waarde", ["2026-13", "liever_niet", "2020-01"])
def test_exit_submit_ongeldige_maand_422(client, db_session: Session, waarde: str):
    r = _setup(db_session, exit_month=None)
    payload = _exit_payload(r.token, org_raw=_org_raw())
    payload["exit_month"] = waarde
    resp = client.post("/survey/submit", json=payload)
    assert resp.status_code == 422, resp.text
    db_session.refresh(r)
    assert r.completed is False
    assert r.exit_month is None
    assert db_session.query(SurveyResponse).filter(SurveyResponse.respondent_id == r.id).count() == 0


def test_retention_submit_met_exit_month_422(client, db_session: Session):
    r = _setup(db_session, scan_type="retention", exit_month=None)
    payload = _retention_payload(r.token, org_raw=_org_raw())
    payload["exit_month"] = "2026-09"
    resp = client.post("/survey/submit", json=payload)
    assert resp.status_code == 422, resp.text
    assert "alleen bij Loep Vertrek" in resp.json()["detail"]
    db_session.refresh(r)
    assert r.completed is False


def test_hr_vertrekmaand_blijft_leidend_bij_poging_overschrijven(client, db_session: Session):
    r = _setup(db_session, exit_month="2026-05")
    payload = _exit_payload(r.token, org_raw=_org_raw())
    payload["exit_month"] = "2026-09"
    resp = client.post("/survey/submit", json=payload)
    assert resp.status_code == 422, resp.text
    assert "al vastgelegd" in resp.json()["detail"]
    db_session.refresh(r)
    assert r.exit_month == "2026-05"
    assert r.completed is False


def test_hr_vertrekmaand_blijft_leidend_bij_null(client, db_session: Session):
    r = _setup(db_session, exit_month="2026-05")
    payload = _exit_payload(r.token, org_raw=_org_raw())
    payload["exit_month"] = None
    resp = client.post("/survey/submit", json=payload)
    assert resp.status_code == 200, resp.text
    db_session.refresh(r)
    assert r.exit_month == "2026-05"
    assert r.completed is True


def test_survey_exit_month_options_exit_zonder_hr_waarde(db_session: Session):
    r = _setup(db_session, exit_month=None)
    opties = _survey_exit_month_options(r.campaign, r)
    assert opties != []
    assert opties[0] == em.exit_month_options(FIXED_TODAY)[0]


def test_survey_exit_month_options_exit_met_hr_waarde_is_leeg(db_session: Session):
    r = _setup(db_session, exit_month="2026-05")
    assert _survey_exit_month_options(r.campaign, r) == []


def test_survey_exit_month_options_retention_is_leeg(db_session: Session):
    r = _setup(db_session, scan_type="retention", exit_month=None)
    assert _survey_exit_month_options(r.campaign, r) == []


def test_exit_month_niet_leesbaar_voor_klanten():
    sql = Path("migrations/2026_07_13_lock_individual_data_to_operator.sql").read_text(encoding="utf-8")
    grant = re.search(r"grant select \(([^)]*)\)\s*on public\.respondents to authenticated", sql)
    assert grant, "kolomgrant op respondents niet gevonden"
    assert "exit_month" not in grant.group(1)

    schema_path = Path("supabase/schema.sql")
    if schema_path.exists():
        schema_sql = schema_path.read_text(encoding="utf-8")
        schema_grant = re.search(
            r"grant select \(([^)]*)\)\s*on public\.respondents to authenticated", schema_sql,
        )
        if schema_grant:
            assert "exit_month" not in schema_grant.group(1)

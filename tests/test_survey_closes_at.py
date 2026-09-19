"""De open survey-flow weigert na de sluitdatum (amendement par. 4.3a).

Vier endpoints, één helper. Elke test zet closes_at direct op het model
(precies wat de wizard via Supabase doet) en spreekt de echte routes aan via
de TestClient uit tests/conftest.py.

`today_amsterdam` wordt hier gepind op een vaste dag (autouse fixture): zonder
die pin roept de test en de request elk apart `today_amsterdam()` aan, en een
testrun die toevallig over middernacht Amsterdamse tijd loopt zou dan de
"op de sluitdag zelf"-tests flakey maken.
"""
from __future__ import annotations

from datetime import date, timedelta

import pytest
from sqlalchemy.orm import Session

from backend import survey_window
from backend.models import Respondent
from backend.survey_window import SURVEY_CLOSED_MESSAGE
from tests.test_api_flows import _create_campaign, _create_org, _create_respondent
from tests.test_deepening_submit import _org_raw, _retention_payload

FIXED_DAY = date(2026, 9, 18)


@pytest.fixture(autouse=True)
def _pin_today_amsterdam(monkeypatch):
    monkeypatch.setattr(survey_window, "today_amsterdam", lambda now=None: FIXED_DAY)


def _campaign(db: Session, *, closes_at, is_active: bool = True):
    org = _create_org(db, api_key="closes-at-key")
    campaign = _create_campaign(db, org, name="Behoud najaar", scan_type="retention")
    campaign.closes_at = closes_at
    campaign.is_active = is_active
    db.commit()
    db.refresh(campaign)
    return campaign


# --- GET /survey/open/{token} (intro) ------------------------------------

def test_intro_weigert_na_de_sluitdatum_met_de_gesloten_copy(client, db_session):
    campaign = _campaign(db_session, closes_at=FIXED_DAY - timedelta(days=1))
    r = client.get(f"/survey/open/{campaign.public_survey_token}")
    assert r.status_code == 410
    assert SURVEY_CLOSED_MESSAGE in r.text
    assert "Deze meting is gesloten" in r.text


def test_intro_open_op_de_sluitdag_zelf(client, db_session):
    campaign = _campaign(db_session, closes_at=FIXED_DAY)
    r = client.get(f"/survey/open/{campaign.public_survey_token}")
    assert r.status_code == 200


def test_intro_open_zonder_sluitdatum(client, db_session):
    campaign = _campaign(db_session, closes_at=None)
    r = client.get(f"/survey/open/{campaign.public_survey_token}")
    assert r.status_code == 200


def test_intro_inactief_geeft_dezelfde_gesloten_copy(client, db_session):
    campaign = _campaign(db_session, closes_at=None, is_active=False)
    r = client.get(f"/survey/open/{campaign.public_survey_token}")
    assert r.status_code == 410
    assert SURVEY_CLOSED_MESSAGE in r.text


# --- POST /survey/open/{token}/start --------------------------------------

def test_start_weigert_na_de_sluitdatum_en_maakt_geen_respondent(client, db_session):
    campaign = _campaign(db_session, closes_at=FIXED_DAY - timedelta(days=1))
    before = db_session.query(Respondent).filter(Respondent.campaign_id == campaign.id).count()
    r = client.post(f"/survey/open/{campaign.public_survey_token}/start", follow_redirects=False)
    after = db_session.query(Respondent).filter(Respondent.campaign_id == campaign.id).count()
    assert r.status_code == 410
    assert SURVEY_CLOSED_MESSAGE in r.text
    assert after == before


def test_start_werkt_op_de_sluitdag_zelf(client, db_session):
    campaign = _campaign(db_session, closes_at=FIXED_DAY)
    r = client.post(f"/survey/open/{campaign.public_survey_token}/start", follow_redirects=False)
    assert r.status_code == 303


# --- GET /survey/{respondent_token} ---------------------------------------

def test_persoonlijke_link_weigert_na_de_sluitdatum(client, db_session):
    campaign = _campaign(db_session, closes_at=FIXED_DAY - timedelta(days=1))
    respondent = _create_respondent(db_session, campaign)
    r = client.get(f"/survey/{respondent.token}")
    assert r.status_code == 410
    assert SURVEY_CLOSED_MESSAGE in r.text


def test_persoonlijke_link_open_op_de_sluitdag_zelf(client, db_session):
    campaign = _campaign(db_session, closes_at=FIXED_DAY)
    respondent = _create_respondent(db_session, campaign)
    r = client.get(f"/survey/{respondent.token}")
    assert r.status_code == 200


def test_persoonlijke_link_na_sluitdatum_zet_geen_opened_at(client, db_session):
    """Een link die pas na de sluitdag wordt geopend telt niet als 'geopend':
    anders zou een respondent die te laat is toch als opened_at geregistreerd
    staan, terwijl de meting hem meteen weigert."""
    campaign = _campaign(db_session, closes_at=FIXED_DAY - timedelta(days=1))
    respondent = _create_respondent(db_session, campaign)
    assert respondent.opened_at is None

    r = client.get(f"/survey/{respondent.token}")
    assert r.status_code == 410

    db_session.refresh(respondent)
    assert respondent.opened_at is None


# --- POST /survey/submit --------------------------------------------------

def test_submit_weigert_na_de_sluitdatum_met_dezelfde_boodschap(client, db_session):
    campaign = _campaign(db_session, closes_at=FIXED_DAY - timedelta(days=1))
    respondent = _create_respondent(db_session, campaign)
    payload = _retention_payload(respondent.token, org_raw=_org_raw())
    r = client.post("/survey/submit", json=payload)
    assert r.status_code == 410
    assert r.json()["detail"] == SURVEY_CLOSED_MESSAGE


def test_submit_werkt_op_de_sluitdag_zelf(client, db_session):
    campaign = _campaign(db_session, closes_at=FIXED_DAY)
    respondent = _create_respondent(db_session, campaign)
    payload = _retention_payload(respondent.token, org_raw=_org_raw())
    r = client.post("/survey/submit", json=payload)
    assert r.status_code == 200


# --- Verlengen opent de deur weer -----------------------------------------

def test_verlengen_opent_de_deur_weer(client, db_session):
    """extendCampaignAction (frontend) zet closes_at op max(vandaag, closes_at) + 14.
    De backend kent geen verlengactie; dit pint dat een vooruitgeschoven datum
    de meting weer opent zonder enige andere wijziging."""
    campaign = _campaign(db_session, closes_at=FIXED_DAY - timedelta(days=1))
    token = campaign.public_survey_token
    assert client.get(f"/survey/open/{token}").status_code == 410

    campaign.closes_at = FIXED_DAY + timedelta(days=14)
    db_session.commit()

    assert client.get(f"/survey/open/{token}").status_code == 200
    assert client.post(f"/survey/open/{token}/start", follow_redirects=False).status_code == 303

"""De open survey-flow weigert na de sluitdatum (amendement par. 4.3a).

Vier endpoints, één helper. Elke test zet closes_at direct op het model
(precies wat de wizard via Supabase doet) en spreekt de echte routes aan via
de TestClient uit tests/conftest.py.
"""
from __future__ import annotations

from datetime import timedelta

from sqlalchemy.orm import Session

from backend.models import Respondent
from backend.survey_window import SURVEY_CLOSED_MESSAGE, today_amsterdam
from tests.test_api_flows import _create_campaign, _create_org, _create_respondent
from tests.test_deepening_submit import _org_raw, _retention_payload


def _campaign(db: Session, *, closes_at, is_active: bool = True):
    org = _create_org(db, api_key="closes-at-key")
    campaign = _create_campaign(db, org, name="Behoud najaar", scan_type="retention")
    campaign.closes_at = closes_at
    campaign.is_active = is_active
    db.commit()
    db.refresh(campaign)
    return campaign


def _yesterday():
    return today_amsterdam() - timedelta(days=1)


# --- GET /survey/open/{token} (intro) ------------------------------------

def test_intro_weigert_na_de_sluitdatum_met_de_gesloten_copy(client, db_session):
    campaign = _campaign(db_session, closes_at=_yesterday())
    r = client.get(f"/survey/open/{campaign.public_survey_token}")
    assert r.status_code == 410
    assert SURVEY_CLOSED_MESSAGE in r.text
    assert "Deze meting is gesloten" in r.text


def test_intro_open_op_de_sluitdag_zelf(client, db_session):
    campaign = _campaign(db_session, closes_at=today_amsterdam())
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
    campaign = _campaign(db_session, closes_at=_yesterday())
    before = db_session.query(Respondent).filter(Respondent.campaign_id == campaign.id).count()
    r = client.post(f"/survey/open/{campaign.public_survey_token}/start", follow_redirects=False)
    after = db_session.query(Respondent).filter(Respondent.campaign_id == campaign.id).count()
    assert r.status_code == 410
    assert SURVEY_CLOSED_MESSAGE in r.text
    assert after == before


def test_start_werkt_op_de_sluitdag_zelf(client, db_session):
    campaign = _campaign(db_session, closes_at=today_amsterdam())
    r = client.post(f"/survey/open/{campaign.public_survey_token}/start", follow_redirects=False)
    assert r.status_code == 303


# --- GET /survey/{respondent_token} ---------------------------------------

def test_persoonlijke_link_weigert_na_de_sluitdatum(client, db_session):
    campaign = _campaign(db_session, closes_at=_yesterday())
    respondent = _create_respondent(db_session, campaign)
    r = client.get(f"/survey/{respondent.token}")
    assert r.status_code == 410
    assert SURVEY_CLOSED_MESSAGE in r.text


def test_persoonlijke_link_open_op_de_sluitdag_zelf(client, db_session):
    campaign = _campaign(db_session, closes_at=today_amsterdam())
    respondent = _create_respondent(db_session, campaign)
    r = client.get(f"/survey/{respondent.token}")
    assert r.status_code == 200


# --- POST /survey/submit --------------------------------------------------

def test_submit_weigert_na_de_sluitdatum_met_dezelfde_boodschap(client, db_session):
    campaign = _campaign(db_session, closes_at=_yesterday())
    respondent = _create_respondent(db_session, campaign)
    payload = _retention_payload(respondent.token, org_raw=_org_raw())
    r = client.post("/survey/submit", json=payload)
    assert r.status_code == 410
    assert r.json()["detail"] == SURVEY_CLOSED_MESSAGE


def test_submit_werkt_op_de_sluitdag_zelf(client, db_session):
    campaign = _campaign(db_session, closes_at=today_amsterdam())
    respondent = _create_respondent(db_session, campaign)
    payload = _retention_payload(respondent.token, org_raw=_org_raw())
    r = client.post("/survey/submit", json=payload)
    assert r.status_code == 200


# --- Verlengen opent de deur weer -----------------------------------------

def test_verlengen_opent_de_deur_weer(client, db_session):
    """extendCampaignAction (frontend) zet closes_at op max(vandaag, closes_at) + 14.
    De backend kent geen verlengactie; dit pint dat een vooruitgeschoven datum
    de meting weer opent zonder enige andere wijziging."""
    campaign = _campaign(db_session, closes_at=_yesterday())
    token = campaign.public_survey_token
    assert client.get(f"/survey/open/{token}").status_code == 410

    campaign.closes_at = today_amsterdam() + timedelta(days=14)
    db_session.commit()

    assert client.get(f"/survey/open/{token}").status_code == 200
    assert client.post(f"/survey/open/{token}/start", follow_redirects=False).status_code == 303

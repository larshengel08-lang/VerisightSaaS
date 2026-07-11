from __future__ import annotations

from backend.models import Campaign, Organization, OrganizationSecret, Respondent


def _make_campaign(db_session, *, segment_departments=None):
    org = Organization(name="Acme BV", slug="acme-bv", contact_email="hr@acme.nl")
    db_session.add(org)
    db_session.flush()
    db_session.add(OrganizationSecret(org_id=org.id, api_key="key-1"))
    campaign = Campaign(
        organization_id=org.id,
        name="Exit Q2",
        scan_type="exit",
        delivery_mode="baseline",
        comms_mode="self_send",
        is_active=True,
        segment_departments=segment_departments,
    )
    db_session.add(campaign)
    db_session.commit()
    db_session.refresh(campaign)
    return campaign


SEGMENTS = [
    {"label": "Sales", "slug": "sales"},
    {"label": "Operations", "slug": "operations"},
]


def test_geldige_slug_slaat_keuzescherm_over_en_zet_department(client, db_session):
    campaign = _make_campaign(db_session, segment_departments=SEGMENTS)
    token = campaign.public_survey_token

    r = client.get(f"/survey/open/{token}", params={"afd": "sales"})
    assert r.status_code == 200
    assert "Bij welke afdeling" not in r.text
    assert 'name="afd" value="sales"' in r.text

    before = db_session.query(Respondent).filter(Respondent.campaign_id == campaign.id).count()
    r2 = client.post(f"/survey/open/{token}/start", data={"afd": "sales"}, follow_redirects=False)
    assert r2.status_code == 303
    after = db_session.query(Respondent).filter(Respondent.campaign_id == campaign.id).count()
    assert after == before + 1

    respondent = (
        db_session.query(Respondent)
        .filter(Respondent.campaign_id == campaign.id)
        .order_by(Respondent.id.desc())
        .first()
    )
    assert respondent.department == "Sales"


def test_kale_link_in_segmentmodus_toont_verplicht_keuzescherm(client, db_session):
    campaign = _make_campaign(db_session, segment_departments=SEGMENTS)
    token = campaign.public_survey_token

    r = client.get(f"/survey/open/{token}")
    assert r.status_code == 200
    assert "Bij welke afdeling" in r.text
    assert "Sales" in r.text
    assert "Operations" in r.text


def test_gemanipuleerde_slug_valt_terug_op_keuzescherm(client, db_session):
    campaign = _make_campaign(db_session, segment_departments=SEGMENTS)
    token = campaign.public_survey_token

    r = client.get(f"/survey/open/{token}", params={"afd": "directie"})
    assert r.status_code == 200
    assert "Bij welke afdeling" in r.text

    before = db_session.query(Respondent).filter(Respondent.campaign_id == campaign.id).count()
    r2 = client.post(f"/survey/open/{token}/start", data={"afd": "directie"}, follow_redirects=False)
    after = db_session.query(Respondent).filter(Respondent.campaign_id == campaign.id).count()
    assert after == before
    assert r2.status_code == 422


def test_start_zonder_afd_in_segmentmodus_geeft_422(client, db_session):
    campaign = _make_campaign(db_session, segment_departments=SEGMENTS)
    token = campaign.public_survey_token

    r = client.post(f"/survey/open/{token}/start", data={}, follow_redirects=False)
    assert r.status_code == 422


def test_campagne_zonder_segmenten_ongewijzigd(client, db_session):
    campaign = _make_campaign(db_session, segment_departments=None)
    token = campaign.public_survey_token

    r = client.get(f"/survey/open/{token}")
    assert r.status_code == 200
    assert "Bij welke afdeling" not in r.text

    r2 = client.post(f"/survey/open/{token}/start", data={}, follow_redirects=False)
    assert r2.status_code == 303

    respondent = (
        db_session.query(Respondent)
        .filter(Respondent.campaign_id == campaign.id)
        .order_by(Respondent.id.desc())
        .first()
    )
    assert respondent.department is None

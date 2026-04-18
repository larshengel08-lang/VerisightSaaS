from __future__ import annotations

import io
from datetime import datetime, timezone

import pytest
from sqlalchemy.orm import Session

from backend.email import EmailSendResult, send_contact_request_result
from backend.models import Campaign, ContactRequest, Organization, OrganizationSecret, Respondent, SurveyResponse
from backend.scoring import ORG_FACTOR_KEYS


def _create_org(db: Session, *, name: str = "Acme BV", slug: str = "acme-bv", api_key: str = "org-test-key"):
    org = Organization(name=name, slug=slug, contact_email="hr@acme.nl")
    db.add(org)
    db.flush()
    db.add(OrganizationSecret(org_id=org.id, api_key=api_key))
    db.commit()
    db.refresh(org)
    return org


def _create_campaign(db: Session, org: Organization, *, name: str = "Exit Q2", scan_type: str = "exit"):
    campaign = Campaign(
        organization_id=org.id,
        name=name,
        scan_type=scan_type,
        delivery_mode="baseline",
        is_active=True,
        enabled_modules=["segment_deep_dive"],
    )
    db.add(campaign)
    db.commit()
    db.refresh(campaign)
    return campaign


def _create_respondent(
    db: Session,
    campaign: Campaign,
    *,
    email: str | None = None,
    department: str | None = "Operations",
    role_level: str | None = "specialist",
    exit_month: str | None = "2026-03",
    completed: bool = False,
):
    respondent = Respondent(
        campaign_id=campaign.id,
        email=email,
        department=department,
        role_level=role_level,
        exit_month=exit_month,
        completed=completed,
        completed_at=datetime.now(timezone.utc) if completed else None,
    )
    db.add(respondent)
    db.commit()
    db.refresh(respondent)
    return respondent


def _create_response(
    db: Session,
    respondent: Respondent,
    *,
    risk_score: float = 5.8,
    risk_band: str = "MIDDEN",
):
    response = SurveyResponse(
        respondent_id=respondent.id,
        tenure_years=2.4,
        exit_reason_category="groei",
        exit_reason_code="P3",
        stay_intent_score=4,
        sdt_raw={f"B{i}": 3 for i in range(1, 13)},
        sdt_scores={"autonomy": 5.5, "competence": 5.5, "relatedness": 5.5, "sdt_total": 5.5, "sdt_risk": 5.5},
        org_raw={f"{factor}_{idx}": 3 for factor in ORG_FACTOR_KEYS for idx in range(1, 4)},
        org_scores={factor: 5.5 for factor in ORG_FACTOR_KEYS},
        pull_factors_raw={"P1": 1},
        open_text_raw="Meer groeiperspectief gewenst.",
        risk_score=risk_score,
        risk_band=risk_band,
        preventability="GEMENGD_WERKSIGNAAL",
        full_result={"risk_result": {"risk_score": risk_score, "risk_band": risk_band}},
    )
    respondent.completed = True
    respondent.completed_at = datetime.now(timezone.utc)
    db.add(response)
    db.add(respondent)
    db.commit()
    db.refresh(response)
    return response


def _survey_payload(token: str):
    return {
        "token": token,
        "tenure_years": 2.0,
        "exit_reason_category": "groei",
        "stay_intent_score": 4,
        "signal_visibility_score": 2,
        "sdt_raw": {f"B{i}": 3 for i in range(1, 13)},
        "org_raw": {f"{factor}_{idx}": 3 for factor in ORG_FACTOR_KEYS for idx in range(1, 4)},
        "pull_factors_raw": {"leiderschap": 1},
        "open_text": "Ik miste vooral duidelijk groeiperspectief.",
        "uwes_raw": {},
        "turnover_intention_raw": {},
    }


def _retention_payload(token: str):
    return {
        "token": token,
        "tenure_years": None,
        "exit_reason_category": None,
        "stay_intent_score": 4,
        "sdt_raw": {f"B{i}": 4 for i in range(1, 13)},
        "org_raw": {f"{factor}_{idx}": 4 for factor in ORG_FACTOR_KEYS for idx in range(1, 4)},
        "pull_factors_raw": {},
        "open_text": "Meer ontwikkelruimte en duidelijkere prioriteiten zouden helpen.",
        "uwes_raw": {"uwes_1": 4, "uwes_2": 5, "uwes_3": 4},
        "turnover_intention_raw": {"ti_1": 2, "ti_2": 3},
    }


def _pulse_payload(token: str):
    return {
        "token": token,
        "tenure_years": None,
        "exit_reason_category": None,
        "stay_intent_score": 4,
        "signal_visibility_score": None,
        "sdt_raw": {"B1": 4, "B5": 4, "B9": 5},
        "org_raw": {
            "leadership_1": 4,
            "growth_1": 3,
            "workload_1": 2,
        },
        "pull_factors_raw": {},
        "open_text": "Meer rust in de planning en duidelijker prioriteiten zouden nu het meeste helpen.",
        "uwes_raw": {},
        "turnover_intention_raw": {},
    }


def _team_payload(token: str):
    return {
        "token": token,
        "tenure_years": None,
        "exit_reason_category": None,
        "stay_intent_score": 3,
        "signal_visibility_score": None,
        "sdt_raw": {"B1": 4, "B5": 3, "B9": 4},
        "org_raw": {
            "leadership_1": 4,
            "culture_1": 3,
            "workload_1": 2,
            "role_clarity_1": 4,
        },
        "pull_factors_raw": {},
        "open_text": "Meer duidelijkheid over prioriteiten en minder piekdruk zou hier nu het meeste helpen.",
        "uwes_raw": {},
        "turnover_intention_raw": {},
    }


def _onboarding_payload(token: str):
    return {
        "token": token,
        "tenure_years": None,
        "exit_reason_category": None,
        "stay_intent_score": 4,
        "signal_visibility_score": None,
        "sdt_raw": {"B1": 4, "B5": 4, "B9": 5},
        "org_raw": {
            "leadership_1": 4,
            "role_clarity_1": 3,
            "culture_1": 4,
            "growth_1": 3,
        },
        "pull_factors_raw": {},
        "open_text": "Meer duidelijkheid over de eerste 30 dagen en snellere toegang tot hulp zou nu het meeste helpen.",
        "uwes_raw": {},
        "turnover_intention_raw": {},
    }


def _leadership_payload(token: str):
    return {
        "token": token,
        "tenure_years": None,
        "exit_reason_category": None,
        "stay_intent_score": 3,
        "signal_visibility_score": None,
        "sdt_raw": {"B1": 4, "B5": 3, "B9": 4},
        "org_raw": {
            "leadership_1": 3,
            "role_clarity_1": 4,
            "culture_1": 4,
            "growth_1": 3,
        },
        "pull_factors_raw": {},
        "open_text": "Meer consistente prioritering en sneller escaleren zou nu het meeste verschil maken.",
        "uwes_raw": {},
        "turnover_intention_raw": {},
    }


def test_create_campaign_defaults_to_baseline_delivery_mode(client, db_session: Session):
    org = _create_org(db_session, api_key="campaign-default-key")

    response = client.post(
        "/api/campaigns",
        headers={"x-api-key": "campaign-default-key"},
        json={"name": "Exit Baseline", "scan_type": "exit"},
    )

    assert response.status_code == 201
    body = response.json()
    assert body["delivery_mode"] == "baseline"

    stored = db_session.query(Campaign).filter(Campaign.organization_id == org.id).one()
    assert stored.delivery_mode == "baseline"


def test_create_campaign_accepts_live_delivery_mode(client, db_session: Session):
    org = _create_org(db_session, api_key="campaign-live-key")

    response = client.post(
        "/api/campaigns",
        headers={"x-api-key": "campaign-live-key"},
        json={"name": "Exit Live", "scan_type": "exit", "delivery_mode": "live"},
    )

    assert response.status_code == 201
    body = response.json()
    assert body["delivery_mode"] == "live"

    stored = db_session.query(Campaign).filter(Campaign.organization_id == org.id).one()
    assert stored.delivery_mode == "live"


def test_create_pulse_campaign_defaults_to_baseline_delivery_mode(client, db_session: Session):
    org = _create_org(db_session, api_key="pulse-default-key")

    response = client.post(
        "/api/campaigns",
        headers={"x-api-key": "pulse-default-key"},
        json={"name": "Pulse April", "scan_type": "pulse"},
    )

    assert response.status_code == 201
    body = response.json()
    assert body["scan_type"] == "pulse"
    assert body["delivery_mode"] == "baseline"


def test_create_pulse_campaign_rejects_live_delivery_mode(client, db_session: Session):
    org = _create_org(db_session, api_key="pulse-live-key")

    response = client.post(
        "/api/campaigns",
        headers={"x-api-key": "pulse-live-key"},
        json={"name": "Pulse Live", "scan_type": "pulse", "delivery_mode": "live"},
    )

    assert response.status_code == 422
    assert "Pulse" in response.text


def test_create_team_campaign_defaults_to_baseline_delivery_mode(client, db_session: Session):
    _create_org(db_session, api_key="team-default-key")

    response = client.post(
        "/api/campaigns",
        headers={"x-api-key": "team-default-key"},
        json={"name": "TeamScan Operations", "scan_type": "team"},
    )

    assert response.status_code == 201
    body = response.json()
    assert body["scan_type"] == "team"
    assert body["delivery_mode"] == "baseline"


def test_create_team_campaign_rejects_live_delivery_mode(client, db_session: Session):
    _create_org(db_session, api_key="team-live-key")

    response = client.post(
        "/api/campaigns",
        headers={"x-api-key": "team-live-key"},
        json={"name": "TeamScan Live", "scan_type": "team", "delivery_mode": "live"},
    )

    assert response.status_code == 422
    assert "TeamScan" in response.text


def test_create_onboarding_campaign_defaults_to_baseline_delivery_mode(client, db_session: Session):
    _create_org(db_session, api_key="onboarding-default-key")

    response = client.post(
        "/api/campaigns",
        headers={"x-api-key": "onboarding-default-key"},
        json={"name": "Onboarding checkpoint Mei", "scan_type": "onboarding"},
    )

    assert response.status_code == 201
    body = response.json()
    assert body["scan_type"] == "onboarding"
    assert body["delivery_mode"] == "baseline"


def test_create_onboarding_campaign_rejects_live_delivery_mode(client, db_session: Session):
    _create_org(db_session, api_key="onboarding-live-key")

    response = client.post(
        "/api/campaigns",
        headers={"x-api-key": "onboarding-live-key"},
        json={"name": "Onboarding Live", "scan_type": "onboarding", "delivery_mode": "live"},
    )

    assert response.status_code == 422
    assert "Onboarding 30-60-90" in response.text


def test_create_leadership_campaign_defaults_to_baseline_delivery_mode(client, db_session: Session):
    _create_org(db_session, api_key="leadership-default-key")

    response = client.post(
        "/api/campaigns",
        headers={"x-api-key": "leadership-default-key"},
        json={"name": "Leadership Scan Juni", "scan_type": "leadership"},
    )

    assert response.status_code == 201
    body = response.json()
    assert body["scan_type"] == "leadership"
    assert body["delivery_mode"] == "baseline"


def test_create_leadership_campaign_rejects_live_delivery_mode(client, db_session: Session):
    _create_org(db_session, api_key="leadership-live-key")

    response = client.post(
        "/api/campaigns",
        headers={"x-api-key": "leadership-live-key"},
        json={"name": "Leadership Live", "scan_type": "leadership", "delivery_mode": "live"},
    )

    assert response.status_code == 422
    assert "Leadership Scan" in response.text


def test_create_organization_creates_secret_when_missing(client, db_session: Session):
    response = client.post(
        "/api/organizations",
        json={
            "name": "Verisight Ops",
            "slug": "verisight-ops",
            "contact_email": "ops@example.com",
        },
    )

    assert response.status_code == 201
    body = response.json()
    org = db_session.query(Organization).filter(Organization.slug == "verisight-ops").one()
    secret = db_session.query(OrganizationSecret).filter(OrganizationSecret.org_id == org.id).one()

    assert body["id"] == str(org.id)
    assert str(secret.org_id) == str(org.id)
    assert secret.api_key


def test_survey_submit_persists_response_and_marks_respondent_complete(client, db_session: Session):
    org = _create_org(db_session)
    campaign = _create_campaign(db_session, org)
    respondent = _create_respondent(db_session, campaign)

    response = client.post("/survey/submit", json=_survey_payload(respondent.token))

    assert response.status_code == 200
    body = response.json()
    assert body["status"] == "ok"

    db_session.refresh(respondent)
    stored = db_session.query(SurveyResponse).filter(SurveyResponse.respondent_id == respondent.id).one()
    assert respondent.completed is True
    assert stored.risk_score is not None
    assert stored.exit_reason_code == "P3"
    assert stored.full_result["exit_context_summary"]["signal_visibility_score"] == 2
    assert stored.full_result["exit_context_summary"]["primary_reason_label"] == "Gebrek aan groei"


def test_survey_submit_rejects_duplicate_submission(client, db_session: Session):
    org = _create_org(db_session)
    campaign = _create_campaign(db_session, org)
    respondent = _create_respondent(db_session, campaign, completed=True)
    _create_response(db_session, respondent, risk_score=6.2, risk_band="MIDDEN")

    response = client.post("/survey/submit", json=_survey_payload(respondent.token))

    assert response.status_code == 409
    assert response.json()["detail"] == "Survey al ingevuld."


def test_survey_submit_rejects_unknown_token(client):
    response = client.post("/survey/submit", json=_survey_payload("missing-token"))

    assert response.status_code == 404
    assert response.json()["detail"] == "Ongeldige token."


def test_exit_survey_submit_requires_signal_visibility_answer(client, db_session: Session):
    org = _create_org(db_session, api_key="missing-signal-key")
    campaign = _create_campaign(db_session, org, name="Exit zonder signalering")
    respondent = _create_respondent(db_session, campaign)
    payload = _survey_payload(respondent.token)
    payload["signal_visibility_score"] = None

    response = client.post("/survey/submit", json=payload)

    assert response.status_code == 422
    assert "eerdere signalering" in response.json()["detail"]


def test_retention_survey_submit_persists_normalized_scores_and_summary(client, db_session: Session):
    org = _create_org(db_session, api_key="retention-key")
    campaign = _create_campaign(db_session, org, name="Retentie Q2", scan_type="retention")
    respondent = _create_respondent(db_session, campaign, email="retention@example.com", department="People")

    response = client.post("/survey/submit", json=_retention_payload(respondent.token))

    assert response.status_code == 200
    stored = db_session.query(SurveyResponse).filter(SurveyResponse.respondent_id == respondent.id).one()

    assert stored.uwes_score is not None
    assert stored.turnover_intention_score is not None
    assert 1.0 <= stored.uwes_score <= 10.0
    assert 1.0 <= stored.turnover_intention_score <= 10.0
    assert stored.preventability is None
    assert stored.full_result["retention_summary"]["retention_signal_score"] == stored.risk_score
    assert stored.full_result["retention_summary"]["engagement_score"] == stored.uwes_score
    assert stored.full_result["retention_summary"]["turnover_intention_score"] == stored.turnover_intention_score
    assert stored.full_result["retention_summary"]["stay_intent_score"] is not None
    assert stored.full_result["retention_summary"]["signal_profile"] in {
        "overwegend_stabiel",
        "vroegsignaal",
        "vertrekdenken_zichtbaar",
        "scherp_aandachtssignaal",
    }


def test_retention_report_route_returns_pdf(client, db_session: Session):
    org = _create_org(db_session, api_key="retention-report-key")
    campaign = _create_campaign(db_session, org, name="Retentie Rapport", scan_type="retention")
    respondent = _create_respondent(db_session, campaign, email="retention-report@example.com", department="Operations")
    client.post("/survey/submit", json=_retention_payload(respondent.token))

    response = client.get(
        f"/api/campaigns/{campaign.id}/report",
        headers={"x-api-key": "retention-report-key"},
    )

    assert response.status_code == 200
    assert response.headers["content-type"] == "application/pdf"
    assert response.content.startswith(b"%PDF")


def test_retention_survey_submit_rejects_incomplete_signal_blocks(client, db_session: Session):
    org = _create_org(db_session, api_key="retention-incomplete-key")
    campaign = _create_campaign(db_session, org, name="Retentie Incompleet", scan_type="retention")
    respondent = _create_respondent(db_session, campaign, email="retention-incomplete@example.com", department="People")
    payload = _retention_payload(respondent.token)
    payload["stay_intent_score"] = None
    payload["uwes_raw"] = {"uwes_1": 4, "uwes_2": 5}

    response = client.post("/survey/submit", json=payload)

    assert response.status_code == 422
    assert "RetentieScan vereist" in response.json()["detail"]


def test_pulse_survey_submit_persists_snapshot_summary(client, db_session: Session):
    org = _create_org(db_session, api_key="pulse-submit-key")
    campaign = _create_campaign(db_session, org, name="Pulse Snapshot", scan_type="pulse")
    respondent = _create_respondent(db_session, campaign, email="pulse@example.com", department="People")

    response = client.post("/survey/submit", json=_pulse_payload(respondent.token))

    assert response.status_code == 200
    stored = db_session.query(SurveyResponse).filter(SurveyResponse.respondent_id == respondent.id).one()

    assert stored.preventability is None
    assert stored.uwes_score is None
    assert stored.turnover_intention_score is None
    assert set(stored.sdt_raw.keys()) == {"B1", "B5", "B9"}
    assert set(stored.org_scores.keys()) == {"leadership", "growth", "workload"}
    assert stored.full_result["pulse_summary"]["snapshot_type"] == "current_cycle"
    assert stored.full_result["pulse_summary"]["pulse_signal_score"] == stored.risk_score


def test_pulse_report_route_is_not_yet_supported(client, db_session: Session):
    org = _create_org(db_session, api_key="pulse-report-key")
    campaign = _create_campaign(db_session, org, name="Pulse Report", scan_type="pulse")

    response = client.get(
        f"/api/campaigns/{campaign.id}/report",
        headers={"x-api-key": "pulse-report-key"},
    )

    assert response.status_code == 422
    assert "Pulse" in response.json()["detail"]


def test_team_survey_submit_persists_local_summary(client, db_session: Session):
    org = _create_org(db_session, api_key="team-submit-key")
    campaign = _create_campaign(db_session, org, name="Team Snapshot", scan_type="team")
    respondent = _create_respondent(db_session, campaign, email="team@example.com", department="Operations")

    response = client.post("/survey/submit", json=_team_payload(respondent.token))

    assert response.status_code == 200
    stored = db_session.query(SurveyResponse).filter(SurveyResponse.respondent_id == respondent.id).one()

    assert stored.preventability is None
    assert stored.uwes_score is None
    assert stored.turnover_intention_score is None
    assert set(stored.sdt_raw.keys()) == {"B1", "B5", "B9"}
    assert set(stored.org_scores.keys()) == {"leadership", "culture", "workload", "role_clarity"}
    assert stored.full_result["team_summary"]["snapshot_type"] == "current_localization_cycle"
    assert stored.full_result["team_summary"]["localization_boundary"] == "department"
    assert stored.full_result["team_summary"]["team_signal_score"] == stored.risk_score


def test_team_report_route_returns_pdf(client, db_session: Session):
    org = _create_org(db_session, api_key="team-report-key")
    campaign = _create_campaign(db_session, org, name="Team Report", scan_type="team")
    respondent = _create_respondent(db_session, campaign, email="team-report@example.com", department="Operations")
    client.post("/survey/submit", json=_team_payload(respondent.token))

    response = client.get(
        f"/api/campaigns/{campaign.id}/report",
        headers={"x-api-key": "team-report-key"},
    )

    assert response.status_code == 200
    assert response.headers["content-type"] == "application/pdf"
    assert response.content.startswith(b"%PDF")


def test_onboarding_survey_submit_persists_checkpoint_summary(client, db_session: Session):
    org = _create_org(db_session, api_key="onboarding-submit-key")
    campaign = _create_campaign(db_session, org, name="Onboarding Checkpoint", scan_type="onboarding")
    respondent = _create_respondent(db_session, campaign, email="onboarding@example.com", department="People")

    response = client.post("/survey/submit", json=_onboarding_payload(respondent.token))

    assert response.status_code == 200
    stored = db_session.query(SurveyResponse).filter(SurveyResponse.respondent_id == respondent.id).one()

    assert stored.preventability is None
    assert stored.uwes_score is None
    assert stored.turnover_intention_score is None
    assert set(stored.sdt_raw.keys()) == {"B1", "B5", "B9"}
    assert set(stored.org_scores.keys()) == {"leadership", "role_clarity", "culture", "growth"}
    assert stored.full_result["onboarding_summary"]["snapshot_type"] == "single_checkpoint"
    assert stored.full_result["onboarding_summary"]["checkpoint_scope"] == "single_checkpoint_per_campaign"
    assert stored.full_result["onboarding_summary"]["onboarding_signal_score"] == stored.risk_score


def test_onboarding_report_route_returns_pdf(client, db_session: Session):
    org = _create_org(db_session, api_key="onboarding-report-key")
    campaign = _create_campaign(db_session, org, name="Onboarding Report", scan_type="onboarding")
    respondent = _create_respondent(db_session, campaign, email="onboarding-report@example.com", department="People", exit_month=None)
    client.post("/survey/submit", json=_onboarding_payload(respondent.token))

    response = client.get(
        f"/api/campaigns/{campaign.id}/report",
        headers={"x-api-key": "onboarding-report-key"},
    )

    assert response.status_code == 200
    assert response.headers["content-type"] == "application/pdf"
    assert response.content[:4] == b"%PDF"


def test_leadership_survey_submit_persists_management_summary(client, db_session: Session):
    org = _create_org(db_session, api_key="leadership-submit-key")
    campaign = _create_campaign(db_session, org, name="Leadership Snapshot", scan_type="leadership")
    respondent = _create_respondent(db_session, campaign, email="leadership@example.com", department="People")

    response = client.post("/survey/submit", json=_leadership_payload(respondent.token))

    assert response.status_code == 200
    stored = db_session.query(SurveyResponse).filter(SurveyResponse.respondent_id == respondent.id).one()

    assert stored.preventability is None
    assert stored.uwes_score is None
    assert stored.turnover_intention_score is None
    assert set(stored.sdt_raw.keys()) == {"B1", "B5", "B9"}
    assert set(stored.org_scores.keys()) == {"leadership", "role_clarity", "culture", "growth"}
    assert stored.full_result["leadership_summary"]["snapshot_type"] == "current_management_context_cycle"
    assert stored.full_result["leadership_summary"]["context_scope"] == "group_level_only"
    assert stored.full_result["leadership_context_summary"]["named_leader_output"] is False
    assert stored.full_result["leadership_summary"]["leadership_signal_score"] == stored.risk_score


def test_leadership_report_route_returns_pdf(client, db_session: Session):
    org = _create_org(db_session, api_key="leadership-report-key")
    campaign = _create_campaign(db_session, org, name="Leadership Report", scan_type="leadership")
    respondent = _create_respondent(
        db_session,
        campaign,
        email="leadership-report@example.com",
        department="People",
    )

    submit = client.post("/survey/submit", json=_leadership_payload(respondent.token))
    assert submit.status_code == 200

    response = client.get(
        f"/api/campaigns/{campaign.id}/report",
        headers={"x-api-key": "leadership-report-key"},
    )

    assert response.status_code == 200
    assert response.headers["content-type"] == "application/pdf"
    assert response.content.startswith(b"%PDF")


def test_respondent_import_creates_rows_without_sending_invites(client, db_session: Session):
    org = _create_org(db_session, api_key="import-key")
    campaign = _create_campaign(db_session, org, name="Importcampagne")
    csv_content = (
        "email,department,role_level,exit_month,annual_salary_eur\n"
        "a@example.com,Operations,specialist,2026-03,55000\n"
        "b@example.com,Sales,manager,2026-02,72000\n"
    )

    response = client.post(
        f"/api/campaigns/{campaign.id}/respondents/import",
        headers={"x-api-key": "import-key"},
        data={"dry_run": "false", "send_invites": "false"},
        files={"upload": ("respondents.csv", io.BytesIO(csv_content.encode("utf-8")), "text/csv")},
    )

    assert response.status_code == 200
    body = response.json()
    assert body["imported"] == 2
    assert body["emails_sent"] == 0
    assert body["invalid_rows"] == 0

    rows = db_session.query(Respondent).filter(Respondent.campaign_id == campaign.id).all()
    assert len(rows) == 2
    assert {row.exit_month for row in rows} == {"2026-03", "2026-02"}


def test_respondent_import_dry_run_reports_duplicate_email_without_persisting(client, db_session: Session):
    org = _create_org(db_session, api_key="duplicate-key")
    campaign = _create_campaign(db_session, org, name="Dryrun duplicaten")
    _create_respondent(db_session, campaign, email="a@example.com")
    csv_content = (
        "email,department,role_level,exit_month\n"
        "a@example.com,Operations,specialist,2026-03\n"
    )

    response = client.post(
        f"/api/campaigns/{campaign.id}/respondents/import",
        headers={"x-api-key": "duplicate-key"},
        data={"dry_run": "true", "send_invites": "false"},
        files={"upload": ("respondents.csv", io.BytesIO(csv_content.encode("utf-8")), "text/csv")},
    )

    assert response.status_code == 200
    body = response.json()
    assert body["imported"] == 0
    assert body["invalid_rows"] == 1
    assert body["errors"][0]["field"] == "email"
    assert "bestaat al" in body["errors"][0]["message"].lower()

    rows = db_session.query(Respondent).filter(Respondent.campaign_id == campaign.id).all()
    assert len(rows) == 1


def test_implementation_smoke_flow_imports_sends_invites_and_generates_output(
    client,
    db_session: Session,
    monkeypatch: pytest.MonkeyPatch,
):
    monkeypatch.setattr("backend.main.send_survey_invite", lambda **kwargs: True)
    org = _create_org(db_session, api_key="implementation-smoke-key")

    create_response = client.post(
        "/api/campaigns",
        headers={"x-api-key": "implementation-smoke-key"},
        json={"name": "Implementation Smoke", "scan_type": "exit"},
    )

    assert create_response.status_code == 201
    campaign_id = create_response.json()["id"]
    csv_content = (
        "email,department,role_level,exit_month,annual_salary_eur\n"
        "launch.one@example.com,Operations,specialist,2026-03,55000\n"
        "launch.two@example.com,People,manager,2026-02,68000\n"
    )

    import_response = client.post(
        f"/api/campaigns/{campaign_id}/respondents/import",
        headers={"x-api-key": "implementation-smoke-key"},
        data={"dry_run": "false", "send_invites": "true"},
        files={"upload": ("implementation.csv", io.BytesIO(csv_content.encode("utf-8")), "text/csv")},
    )

    assert import_response.status_code == 200
    import_body = import_response.json()
    assert import_body["imported"] == 2
    assert import_body["emails_sent"] == 2

    campaign = db_session.query(Campaign).filter(Campaign.id == campaign_id).one()
    respondents = (
        db_session.query(Respondent)
        .filter(Respondent.campaign_id == campaign.id)
        .order_by(Respondent.email.asc())
        .all()
    )
    assert len(respondents) == 2
    assert all(respondent.sent_at is not None for respondent in respondents)

    survey_response = client.post("/survey/submit", json=_survey_payload(respondents[0].token))
    assert survey_response.status_code == 200

    stats_response = client.get(
        f"/api/campaigns/{campaign.id}/stats",
        headers={"x-api-key": "implementation-smoke-key"},
    )
    assert stats_response.status_code == 200
    assert stats_response.json()["total_invited"] == 2
    assert stats_response.json()["total_completed"] == 1

    report_response = client.get(
        f"/api/campaigns/{campaign.id}/report",
        headers={"x-api-key": "implementation-smoke-key"},
    )
    assert report_response.status_code == 200
    assert report_response.headers["content-type"] == "application/pdf"


def test_campaign_stats_returns_expected_counts_and_distribution(client, db_session: Session):
    org = _create_org(db_session, api_key="stats-key")
    campaign = _create_campaign(db_session, org, name="Statscampagne")
    respondent_one = _create_respondent(db_session, campaign, email="one@example.com", department="Operations")
    respondent_two = _create_respondent(db_session, campaign, email="two@example.com", department="Sales")
    _create_respondent(db_session, campaign, email="three@example.com", department="HR", completed=False)
    _create_response(db_session, respondent_one, risk_score=7.2, risk_band="HOOG")
    _create_response(db_session, respondent_two, risk_score=4.8, risk_band="MIDDEN")

    response = client.get(
        f"/api/campaigns/{campaign.id}/stats",
        headers={"x-api-key": "stats-key"},
    )

    assert response.status_code == 200
    body = response.json()
    assert body["total_invited"] == 3
    assert body["total_completed"] == 2
    assert body["risk_band_distribution"]["HOOG"] == 1
    assert body["risk_band_distribution"]["MIDDEN"] == 1
    assert body["risk_band_distribution"]["LAAG"] == 0
    assert body["completion_rate_pct"] == 66.7
    assert body["avg_signal_score"] == body["avg_risk_score"] == 6.0


def test_campaign_stats_returns_zero_values_for_empty_campaign(client, db_session: Session):
    org = _create_org(db_session, api_key="empty-stats-key")
    campaign = _create_campaign(db_session, org, name="Lege campagne")

    response = client.get(
        f"/api/campaigns/{campaign.id}/stats",
        headers={"x-api-key": "empty-stats-key"},
    )

    assert response.status_code == 200
    body = response.json()
    assert body["total_invited"] == 0
    assert body["total_completed"] == 0
    assert body["avg_risk_score"] is None
    assert body["avg_signal_score"] is None
    assert body["completion_rate_pct"] == 0.0
    assert body["risk_band_distribution"] == {"HOOG": 0, "MIDDEN": 0, "LAAG": 0}


def test_report_route_returns_pdf(client, db_session: Session):
    org = _create_org(db_session, api_key="report-key")
    campaign = _create_campaign(db_session, org, name="Rapportcampagne")
    respondent = _create_respondent(db_session, campaign, email="report@example.com", department="Operations")
    _create_response(db_session, respondent, risk_score=5.8, risk_band="MIDDEN")

    response = client.get(
        f"/api/campaigns/{campaign.id}/report",
        headers={"x-api-key": "report-key"},
    )

    assert response.status_code == 200
    assert response.headers["content-type"] == "application/pdf"
    assert response.content.startswith(b"%PDF")


def test_exit_smoke_flow_covers_submit_stats_and_report(client, db_session: Session):
    org = _create_org(db_session, api_key="exit-smoke-key")
    campaign = _create_campaign(db_session, org, name="Exit Smoke")
    respondent = _create_respondent(db_session, campaign, email="smoke@example.com", department="People")

    submit_response = client.post("/survey/submit", json=_survey_payload(respondent.token))

    assert submit_response.status_code == 200

    stored = db_session.query(SurveyResponse).filter(SurveyResponse.respondent_id == respondent.id).one()
    assert stored.full_result["exit_context_summary"]["signal_visibility_summary"]["label"] == (
        "Signalen bleven grotendeels onder de radar"
    )
    assert stored.preventability in {"STERK_WERKSIGNAAL", "GEMENGD_WERKSIGNAAL", "BEPERKT_WERKSIGNAAL"}

    stats_response = client.get(
        f"/api/campaigns/{campaign.id}/stats",
        headers={"x-api-key": "exit-smoke-key"},
    )

    assert stats_response.status_code == 200
    stats_body = stats_response.json()
    assert stats_body["scan_type"] == "exit"
    assert stats_body["total_completed"] == 1
    assert stats_body["avg_risk_score"] is not None
    assert stats_body["pattern_report"]["sufficient_data"] is False

    report_response = client.get(
        f"/api/campaigns/{campaign.id}/report",
        headers={"x-api-key": "exit-smoke-key"},
    )

    assert report_response.status_code == 200
    assert report_response.headers["content-type"] == "application/pdf"
    assert report_response.content.startswith(b"%PDF")


def test_report_route_rejects_invalid_api_key(client, db_session: Session):
    org = _create_org(db_session, api_key="valid-report-key")
    campaign = _create_campaign(db_session, org, name="Afgeschermd rapport")

    response = client.get(
        f"/api/campaigns/{campaign.id}/report",
        headers={"x-api-key": "wrong-key"},
    )

    assert response.status_code == 401
    assert response.json()["detail"] == "Ongeldige API-sleutel."


def test_contact_request_persists_when_email_notification_fails(client, db_session: Session, monkeypatch: pytest.MonkeyPatch):
    monkeypatch.setattr(
        "backend.main.send_contact_request_result",
        lambda **kwargs: EmailSendResult(ok=False, reason="missing_resend_api_key"),
    )

    response = client.post(
        "/api/contact-request",
        json={
            "name": "Lars",
            "work_email": "lars@verisight.nl",
            "organization": "Verisight",
            "employee_count": "200-500",
            "current_question": "Wij willen weten hoe de baseline werkt.",
            "website": "",
        },
        headers={"x-forwarded-for": "203.0.113.10"},
    )

    assert response.status_code == 202
    assert response.json()["message"] == "Aanvraag opgeslagen"
    assert response.json()["notification_sent"] is False
    assert response.json()["lead_id"]

    stored = db_session.query(ContactRequest).one()
    assert stored.notification_sent is False
    assert stored.notification_error == "missing_resend_api_key"
    assert stored.route_interest == "exitscan"
    assert stored.cta_source == "website_contact_form"
    assert stored.desired_timing == "orienterend"
    assert response.json()["lead_id"] == stored.id


def test_contact_request_marks_notification_sent_and_clears_error(client, db_session: Session, monkeypatch: pytest.MonkeyPatch):
    monkeypatch.setattr(
        "backend.main.send_contact_request_result",
        lambda **kwargs: EmailSendResult(ok=True),
    )

    response = client.post(
        "/api/contact-request",
        json={
            "name": "Lars",
            "work_email": "lars@verisight.nl",
            "organization": "Verisight",
            "employee_count": "200-500",
            "route_interest": "retentiescan",
            "cta_source": "product_retention_hero",
            "desired_timing": "deze-maand",
            "current_question": "Wij willen weten hoe de live scan werkt.",
            "website": "",
        },
        headers={"x-forwarded-for": "203.0.113.11"},
    )

    assert response.status_code == 200
    assert response.json()["notification_sent"] is True
    assert response.json()["lead_id"]

    stored = db_session.query(ContactRequest).one()
    assert stored.notification_sent is True
    assert stored.notification_error is None
    assert stored.route_interest == "retentiescan"
    assert stored.cta_source == "product_retention_hero"
    assert stored.desired_timing == "deze-maand"


def test_contact_request_accepts_leadership_route_and_persists_it(
    client,
    db_session: Session,
    monkeypatch: pytest.MonkeyPatch,
):
    captured: dict[str, str] = {}

    def _fake_send_contact_request_result(**kwargs):
        captured.update(kwargs)
        return EmailSendResult(ok=True)

    monkeypatch.setattr("backend.main.send_contact_request_result", _fake_send_contact_request_result)

    response = client.post(
        "/api/contact-request",
        json={
            "name": "Lars",
            "work_email": "lars@verisight.nl",
            "organization": "Verisight",
            "employee_count": "200-500",
            "route_interest": "leadership",
            "cta_source": "product_leadership_form",
            "desired_timing": "dit-kwartaal",
            "current_question": "We willen weten welke managementcontext eerst duiding of verificatie vraagt.",
            "website": "",
        },
        headers={"x-forwarded-for": "203.0.113.13"},
    )

    assert response.status_code == 200
    assert response.json()["notification_sent"] is True

    stored = db_session.query(ContactRequest).one()
    assert stored.route_interest == "leadership"
    assert stored.cta_source == "product_leadership_form"
    assert stored.desired_timing == "dit-kwartaal"
    assert captured["route_interest"] == "leadership"


def test_contact_requests_list_returns_recent_leads(client, db_session: Session, monkeypatch: pytest.MonkeyPatch):
    monkeypatch.setattr(
        "backend.main.send_contact_request_result",
        lambda **kwargs: EmailSendResult(ok=True),
    )

    client.post(
        "/api/contact-request",
        json={
            "name": "Lars",
            "work_email": "lars@verisight.nl",
            "organization": "Verisight",
            "employee_count": "200-500",
            "route_interest": "combinatie",
            "cta_source": "product_combination_callout",
            "desired_timing": "dit-kwartaal",
            "current_question": "Wij willen weten hoe de baseline werkt.",
            "website": "",
        },
        headers={"x-forwarded-for": "203.0.113.12"},
    )

    response = client.get("/api/contact-requests?limit=5")

    assert response.status_code == 200
    payload = response.json()
    assert len(payload) == 1
    assert payload[0]["organization"] == "Verisight"
    assert payload[0]["notification_sent"] is True
    assert payload[0]["route_interest"] == "combinatie"
    assert payload[0]["cta_source"] == "product_combination_callout"
    assert payload[0]["desired_timing"] == "dit-kwartaal"


def test_contact_request_update_accepts_bounded_commerce_fields_for_exit(
    client,
    db_session: Session,
    monkeypatch: pytest.MonkeyPatch,
):
    monkeypatch.setattr(
        "backend.main.send_contact_request_result",
        lambda **kwargs: EmailSendResult(ok=True),
    )

    create_response = client.post(
        "/api/contact-request",
        json={
            "name": "Lars",
            "work_email": "lars@verisight.nl",
            "organization": "Verisight",
            "employee_count": "200-500",
            "route_interest": "exitscan",
            "cta_source": "pricing_primary_cta",
            "desired_timing": "deze-maand",
            "current_question": "We willen ExitScan commercieel scherp bevestigen en startklaar maken.",
            "website": "",
        },
        headers={"x-forwarded-for": "203.0.113.21"},
    )

    lead_id = create_response.json()["lead_id"]
    update_response = client.patch(
        f"/api/contact-requests/{lead_id}",
        json={
            "ops_stage": "implementation_intake_ready",
            "qualification_status": "route_confirmed",
            "qualified_route": "exitscan",
            "qualification_reviewed_by": "Verisight Intake",
            "qualification_note": "ExitScan bevestigd als eerste route na intake.",
            "commercial_agreement_status": "confirmed",
            "commercial_pricing_mode": "public_anchor",
            "commercial_agreement_confirmed_by": "Verisight Ops",
            "commercial_start_readiness_status": "ready",
            "commercial_readiness_reviewed_by": "Delivery Lead",
            "ops_handoff_note": "ExitScan akkoord, intake bevestigd en klaar voor setup.",
        },
    )

    assert update_response.status_code == 200
    body = update_response.json()
    assert body["commercial_agreement_status"] == "confirmed"
    assert body["commercial_pricing_mode"] == "public_anchor"
    assert body["commercial_start_readiness_status"] == "ready"
    assert body["commercial_agreement_confirmed_by"] == "Verisight Ops"
    assert body["commercial_readiness_reviewed_by"] == "Delivery Lead"
    assert body["commercial_start_blocker"] is None
    assert body["qualification_status"] == "route_confirmed"
    assert body["qualified_route"] == "exitscan"
    assert body["qualification_reviewed_by"] == "Verisight Intake"
    assert body["qualification_reviewed_at"] is not None

    stored = db_session.query(ContactRequest).filter(ContactRequest.id == lead_id).one()
    assert stored.qualification_status == "route_confirmed"
    assert stored.qualified_route == "exitscan"
    assert stored.qualification_reviewed_by == "Verisight Intake"
    assert stored.qualification_reviewed_at is not None
    assert stored.commercial_agreement_status == "confirmed"
    assert stored.commercial_pricing_mode == "public_anchor"
    assert stored.commercial_start_readiness_status == "ready"
    assert stored.commercial_agreement_confirmed_by == "Verisight Ops"
    assert stored.commercial_readiness_reviewed_by == "Delivery Lead"
    assert stored.commercial_start_blocker is None


def test_contact_request_update_rejects_bounded_commerce_for_non_core_routes(
    client,
    db_session: Session,
    monkeypatch: pytest.MonkeyPatch,
):
    monkeypatch.setattr(
        "backend.main.send_contact_request_result",
        lambda **kwargs: EmailSendResult(ok=True),
    )

    create_response = client.post(
        "/api/contact-request",
        json={
            "name": "Lars",
            "work_email": "lars@verisight.nl",
            "organization": "Verisight",
            "employee_count": "200-500",
            "route_interest": "combinatie",
            "cta_source": "portfolio_route_cta",
            "desired_timing": "orienterend",
            "current_question": "We denken aan een combinatieroute.",
            "website": "",
        },
        headers={"x-forwarded-for": "203.0.113.22"},
    )

    lead_id = create_response.json()["lead_id"]
    update_response = client.patch(
        f"/api/contact-requests/{lead_id}",
        json={
            "commercial_agreement_status": "confirmed",
            "commercial_pricing_mode": "custom_quote",
            "commercial_start_readiness_status": "ready",
        },
    )

    assert update_response.status_code == 422
    assert "alleen ExitScan en RetentieScan" in update_response.json()["detail"]

    stored = db_session.query(ContactRequest).filter(ContactRequest.id == lead_id).one()
    assert stored.commercial_agreement_status == "not_started"
    assert stored.commercial_pricing_mode is None
    assert stored.commercial_start_readiness_status == "not_ready"


def test_contact_request_update_rejects_ready_without_confirmed_agreement(
    client,
    db_session: Session,
    monkeypatch: pytest.MonkeyPatch,
):
    monkeypatch.setattr(
        "backend.main.send_contact_request_result",
        lambda **kwargs: EmailSendResult(ok=True),
    )

    create_response = client.post(
        "/api/contact-request",
        json={
            "name": "Lars",
            "work_email": "lars@verisight.nl",
            "organization": "Verisight",
            "employee_count": "200-500",
            "route_interest": "retentiescan",
            "cta_source": "retention_pricing_cta",
            "desired_timing": "dit-kwartaal",
            "current_question": "We willen RetentieScan voorbereiden, maar het akkoord is nog niet rond.",
            "website": "",
        },
        headers={"x-forwarded-for": "203.0.113.23"},
    )

    lead_id = create_response.json()["lead_id"]
    update_response = client.patch(
        f"/api/contact-requests/{lead_id}",
        json={
            "commercial_agreement_status": "blocked",
            "commercial_pricing_mode": "custom_quote",
            "commercial_start_readiness_status": "ready",
        },
    )

    assert update_response.status_code == 422
    assert "Start readiness kan alleen op ready staan" in update_response.json()["detail"]


def test_bounded_billing_foundation_smoke_flow_confirms_core_route_and_readiness(
    client,
    db_session: Session,
    monkeypatch: pytest.MonkeyPatch,
):
    monkeypatch.setattr(
        "backend.main.send_contact_request_result",
        lambda **kwargs: EmailSendResult(ok=True),
    )

    create_response = client.post(
        "/api/contact-request",
        json={
            "name": "Lars",
            "work_email": "lars@verisight.nl",
            "organization": "Verisight",
            "employee_count": "200-500",
            "route_interest": "retentiescan",
            "cta_source": "pricing_primary_cta",
            "desired_timing": "deze-maand",
            "current_question": "We willen de route bevestigen en pas daarna de implementatie starten.",
            "website": "",
        },
        headers={"x-forwarded-for": "203.0.113.24"},
    )

    assert create_response.status_code == 200
    lead_id = create_response.json()["lead_id"]

    update_response = client.patch(
        f"/api/contact-requests/{lead_id}",
        json={
            "ops_stage": "implementation_intake_ready",
            "ops_owner": "Verisight Ops",
            "ops_next_step": "Plan intake en bevestig deliverystart.",
            "ops_handoff_note": "RetentieScan akkoord en intake mag nu naar delivery.",
            "qualification_status": "route_confirmed",
            "qualified_route": "retentiescan",
            "qualification_reviewed_by": "Verisight Intake",
            "qualification_note": "RetentieScan bevestigd als eerste route na qualification.",
            "commercial_agreement_status": "confirmed",
            "commercial_pricing_mode": "custom_quote",
            "commercial_agreement_confirmed_by": "Verisight Ops",
            "commercial_start_readiness_status": "ready",
            "commercial_readiness_reviewed_by": "Delivery Lead",
        },
    )

    assert update_response.status_code == 200
    body = update_response.json()
    assert body["route_interest"] == "retentiescan"
    assert body["commercial_agreement_status"] == "confirmed"
    assert body["commercial_pricing_mode"] == "custom_quote"
    assert body["commercial_start_readiness_status"] == "ready"
    assert body["commercial_agreement_confirmed_by"] == "Verisight Ops"
    assert body["commercial_readiness_reviewed_by"] == "Delivery Lead"
    assert body["ops_stage"] == "implementation_intake_ready"
    assert body["qualification_status"] == "route_confirmed"
    assert body["qualified_route"] == "retentiescan"
    assert body["qualification_reviewed_by"] == "Verisight Intake"

    list_response = client.get("/api/contact-requests?limit=5")
    assert list_response.status_code == 200
    listed = list_response.json()[0]
    assert listed["id"] == lead_id
    assert listed["commercial_agreement_status"] == "confirmed"
    assert listed["commercial_start_readiness_status"] == "ready"
    assert listed["commercial_agreement_confirmed_by"] == "Verisight Ops"
    assert listed["commercial_readiness_reviewed_by"] == "Delivery Lead"
    assert listed["qualification_status"] == "route_confirmed"
    assert listed["qualified_route"] == "retentiescan"


def test_contact_request_update_rejects_ready_without_internal_confirmation_and_review(
    client,
    db_session: Session,
    monkeypatch: pytest.MonkeyPatch,
):
    monkeypatch.setattr(
        "backend.main.send_contact_request_result",
        lambda **kwargs: EmailSendResult(ok=True),
    )

    create_response = client.post(
        "/api/contact-request",
        json={
            "name": "Lars",
            "work_email": "lars@verisight.nl",
            "organization": "Verisight",
            "employee_count": "200-500",
            "route_interest": "exitscan",
            "cta_source": "pricing_primary_cta",
            "desired_timing": "deze-maand",
            "current_question": "We willen weten of delivery-start te vroeg geblokkeerd wordt.",
            "website": "",
        },
        headers={"x-forwarded-for": "203.0.113.27"},
    )

    lead_id = create_response.json()["lead_id"]
    update_response = client.patch(
        f"/api/contact-requests/{lead_id}",
        json={
            "commercial_agreement_status": "confirmed",
            "commercial_pricing_mode": "public_anchor",
            "commercial_start_readiness_status": "ready",
        },
    )

    assert update_response.status_code == 422
    assert "intern akkoord expliciet is bevestigd" in update_response.json()["detail"]


def test_contact_request_update_rejects_implementation_intake_ready_without_confirmed_qualification(
    client,
    db_session: Session,
    monkeypatch: pytest.MonkeyPatch,
):
    monkeypatch.setattr(
        "backend.main.send_contact_request_result",
        lambda **kwargs: EmailSendResult(ok=True),
    )

    create_response = client.post(
        "/api/contact-request",
        json={
            "name": "Lars",
            "work_email": "lars@verisight.nl",
            "organization": "Verisight",
            "employee_count": "200-500",
            "route_interest": "exitscan",
            "cta_source": "pricing_primary_cta",
            "desired_timing": "deze-maand",
            "current_question": "We willen weten of qualification eerst expliciet bevestigd moet zijn.",
            "website": "",
        },
        headers={"x-forwarded-for": "203.0.113.29"},
    )

    lead_id = create_response.json()["lead_id"]
    update_response = client.patch(
        f"/api/contact-requests/{lead_id}",
        json={
            "ops_stage": "implementation_intake_ready",
            "commercial_agreement_status": "confirmed",
            "commercial_pricing_mode": "public_anchor",
            "commercial_agreement_confirmed_by": "Verisight Ops",
            "commercial_start_readiness_status": "ready",
            "commercial_readiness_reviewed_by": "Delivery Lead",
        },
    )

    assert update_response.status_code == 422
    assert "bevestigde qualificationroute" in update_response.json()["detail"]


def test_contact_request_update_tracks_confirmed_qualification_route_and_review(
    client,
    db_session: Session,
    monkeypatch: pytest.MonkeyPatch,
):
    monkeypatch.setattr(
        "backend.main.send_contact_request_result",
        lambda **kwargs: EmailSendResult(ok=True),
    )

    create_response = client.post(
        "/api/contact-request",
        json={
            "name": "Lars",
            "work_email": "lars@verisight.nl",
            "organization": "Verisight",
            "employee_count": "200-500",
            "route_interest": "teamscan",
            "cta_source": "teamscan_cta",
            "desired_timing": "dit-kwartaal",
            "current_question": "Na een bestaand signaal willen we lokaal bepalen waar eerst verificatie nodig is.",
            "website": "",
        },
        headers={"x-forwarded-for": "203.0.113.30"},
    )

    lead_id = create_response.json()["lead_id"]
    update_response = client.patch(
        f"/api/contact-requests/{lead_id}",
        json={
            "qualification_status": "route_confirmed",
            "qualified_route": "teamscan",
            "qualification_reviewed_by": "Verisight Intake",
            "qualification_note": "TeamScan bevestigd als bounded vervolgrichting na eerder signaal.",
        },
    )

    assert update_response.status_code == 200
    body = update_response.json()
    assert body["qualification_status"] == "route_confirmed"
    assert body["qualified_route"] == "teamscan"
    assert body["qualification_reviewed_by"] == "Verisight Intake"
    assert body["qualification_reviewed_at"] is not None

    stored = db_session.query(ContactRequest).filter(ContactRequest.id == lead_id).one()
    assert stored.qualification_status == "route_confirmed"
    assert stored.qualified_route == "teamscan"
    assert stored.qualification_note == "TeamScan bevestigd als bounded vervolgrichting na eerder signaal."
    assert stored.qualification_reviewed_at is not None


def test_contact_request_update_tracks_internal_confirmation_and_readiness_review(
    client,
    db_session: Session,
    monkeypatch: pytest.MonkeyPatch,
):
    monkeypatch.setattr(
        "backend.main.send_contact_request_result",
        lambda **kwargs: EmailSendResult(ok=True),
    )

    create_response = client.post(
        "/api/contact-request",
        json={
            "name": "Lars",
            "work_email": "lars@verisight.nl",
            "organization": "Verisight",
            "employee_count": "200-500",
            "route_interest": "exitscan",
            "cta_source": "pricing_primary_cta",
            "desired_timing": "deze-maand",
            "current_question": "We willen akkoord en start readiness intern expliciet bevestigen.",
            "website": "",
        },
        headers={"x-forwarded-for": "203.0.113.25"},
    )

    lead_id = create_response.json()["lead_id"]
    update_response = client.patch(
        f"/api/contact-requests/{lead_id}",
        json={
            "commercial_agreement_status": "confirmed",
            "commercial_pricing_mode": "public_anchor",
            "commercial_agreement_confirmed_by": "Verisight Ops",
            "commercial_start_readiness_status": "ready",
            "commercial_readiness_reviewed_by": "Delivery Lead",
        },
    )

    assert update_response.status_code == 200
    body = update_response.json()
    assert body["commercial_agreement_confirmed_by"] == "Verisight Ops"
    assert body["commercial_agreement_confirmed_at"] is not None
    assert body["commercial_readiness_reviewed_by"] == "Delivery Lead"
    assert body["commercial_readiness_reviewed_at"] is not None

    stored = db_session.query(ContactRequest).filter(ContactRequest.id == lead_id).one()
    assert stored.commercial_agreement_confirmed_by == "Verisight Ops"
    assert stored.commercial_agreement_confirmed_at is not None
    assert stored.commercial_readiness_reviewed_by == "Delivery Lead"
    assert stored.commercial_readiness_reviewed_at is not None


def test_contact_request_update_clears_confirmation_metadata_when_commerce_resets(
    client,
    db_session: Session,
    monkeypatch: pytest.MonkeyPatch,
):
    monkeypatch.setattr(
        "backend.main.send_contact_request_result",
        lambda **kwargs: EmailSendResult(ok=True),
    )

    create_response = client.post(
        "/api/contact-request",
        json={
            "name": "Lars",
            "work_email": "lars@verisight.nl",
            "organization": "Verisight",
            "employee_count": "200-500",
            "route_interest": "retentiescan",
            "cta_source": "pricing_primary_cta",
            "desired_timing": "deze-maand",
            "current_question": "We willen bounded commerce daarna weer veilig terugzetten.",
            "website": "",
        },
        headers={"x-forwarded-for": "203.0.113.26"},
    )

    lead_id = create_response.json()["lead_id"]
    first_update = client.patch(
        f"/api/contact-requests/{lead_id}",
        json={
            "commercial_agreement_status": "confirmed",
            "commercial_pricing_mode": "custom_quote",
            "commercial_agreement_confirmed_by": "Verisight Ops",
            "commercial_start_readiness_status": "blocked",
            "commercial_start_blocker": "Start wacht op definitieve doelgroepcheck.",
            "commercial_readiness_reviewed_by": "Delivery Lead",
        },
    )
    assert first_update.status_code == 200

    reset_response = client.patch(
        f"/api/contact-requests/{lead_id}",
        json={
            "commercial_agreement_status": "not_started",
        },
    )

    assert reset_response.status_code == 200
    body = reset_response.json()
    assert body["commercial_pricing_mode"] is None
    assert body["commercial_start_readiness_status"] == "not_ready"
    assert body["commercial_start_blocker"] is None
    assert body["commercial_agreement_confirmed_by"] is None
    assert body["commercial_agreement_confirmed_at"] is None
    assert body["commercial_readiness_reviewed_by"] is None
    assert body["commercial_readiness_reviewed_at"] is None


def test_send_contact_request_result_returns_missing_contact_email_reason(monkeypatch: pytest.MonkeyPatch):
    monkeypatch.setattr("backend.email._CONTACT_EMAIL", "")

    result = send_contact_request_result(
        name="Lars",
        work_email="lars@verisight.nl",
        organization="Verisight",
        employee_count="200-500",
        route_interest="exitscan",
        cta_source="website_contact_form",
        desired_timing="orienterend",
        current_question="Hoe werkt dit?",
    )

    assert result.ok is False
    assert result.reason == "missing_contact_email"


def test_send_contact_request_result_uses_buyer_facing_leadership_label(monkeypatch: pytest.MonkeyPatch):
    captured: dict[str, str] = {}

    def _fake_send_result(*, to: str, subject: str, html: str, reply_to: str | None = None):
        captured["to"] = to
        captured["subject"] = subject
        captured["html"] = html
        captured["reply_to"] = reply_to or ""
        return EmailSendResult(ok=True)

    monkeypatch.setattr("backend.email._CONTACT_EMAIL", "hallo@verisight.nl")
    monkeypatch.setattr("backend.email._send_result", _fake_send_result)

    result = send_contact_request_result(
        name="Lars",
        work_email="lars@verisight.nl",
        organization="Verisight",
        employee_count="200-500",
        route_interest="leadership",
        cta_source="product_leadership_form",
        desired_timing="orienterend",
        current_question="Hoe leest Leadership Scan buyer-facing in de contactstroom?",
    )

    assert result.ok is True
    assert captured["to"] == "hallo@verisight.nl"
    assert captured["reply_to"] == "lars@verisight.nl"
    assert "Leadership Scan" in captured["html"]
    assert "route_interest=leadership" not in captured["html"]

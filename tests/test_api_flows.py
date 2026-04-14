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


def test_send_contact_request_result_returns_missing_contact_email_reason(monkeypatch: pytest.MonkeyPatch):
    monkeypatch.setattr("backend.email._CONTACT_EMAIL", "")

    result = send_contact_request_result(
        name="Lars",
        work_email="lars@verisight.nl",
        organization="Verisight",
        employee_count="200-500",
        current_question="Hoe werkt dit?",
    )

    assert result.ok is False
    assert result.reason == "missing_contact_email"

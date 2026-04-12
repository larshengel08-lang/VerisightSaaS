from __future__ import annotations

import io
from datetime import datetime, timezone

from sqlalchemy.orm import Session

from backend.models import Campaign, Organization, OrganizationSecret, Respondent, SurveyResponse
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
        "sdt_raw": {f"B{i}": 3 for i in range(1, 13)},
        "org_raw": {f"{factor}_{idx}": 3 for factor in ORG_FACTOR_KEYS for idx in range(1, 4)},
        "pull_factors_raw": {"leiderschap": 1},
        "open_text": "Ik miste vooral duidelijk groeiperspectief.",
        "uwes_raw": {},
        "turnover_intention_raw": {},
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

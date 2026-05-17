from pathlib import Path

import pytest
from sqlalchemy.orm import Session

import backend.main as backend_main
import backend.products.shared.registry as product_registry
import backend.report as backend_report
from backend.models import Campaign, ContactRequest, Organization, OrganizationSecret, Respondent
from backend.scan_definitions import get_scan_definition
from backend.products.shared.registry import get_product_module
from backend.schemas import CampaignCreate, ContactRequestCreate, ContactRequestUpdate


def test_culture_assessment_is_allowed_in_shared_route_contracts():
    campaign = CampaignCreate(
        name="Culture Baseline",
        scan_type="culture_assessment",
        delivery_mode="baseline",
    )
    lead = ContactRequestCreate(
        name="Board Sponsor",
        work_email="board@example.com",
        organization="Loep Corp",
        employee_count="500-1000",
        route_interest="culture_assessment",
        current_question="We need a broad annual culture and engagement baseline.",
    )
    update = ContactRequestUpdate(qualified_route="culture_assessment")
    module = get_product_module("culture_assessment")
    scan_definition = get_scan_definition("culture_assessment")

    assert campaign.scan_type == "culture_assessment"
    assert lead.route_interest == "culture_assessment"
    assert update.qualified_route == "culture_assessment"
    assert module.scan_type == "culture_assessment"
    assert module.get_definition()["product_name"] == "Loep Culture Assessment"
    assert scan_definition["product_name"] == "Loep Culture Assessment"
    assert scan_definition["signal_label"] == "Loep Culture Index"
    assert scan_definition["route_type"] == "primary_route_placeholder"
    assert "in opbouw" in scan_definition["dashboard_signal_help"].lower()

    with pytest.raises(NotImplementedError, match="culture_assessment backend product module is not implemented yet"):
        module.get_management_summary_payload()


def test_culture_assessment_is_baseline_only_for_now():
    with pytest.raises(ValueError, match="Loep Culture Assessment ondersteunt in deze wave alleen baseline campaigns."):
        CampaignCreate(
            name="Culture Live",
            scan_type="culture_assessment",
            delivery_mode="live",
        )


def test_culture_assessment_placeholder_only_covers_missing_top_level_module(monkeypatch: pytest.MonkeyPatch):
    def fake_import_module(module_path: str):
        raise ModuleNotFoundError("missing dependency", name="backend.products.culture_assessment.definition")

    monkeypatch.setattr(product_registry, "import_module", fake_import_module)

    with pytest.raises(ModuleNotFoundError, match="missing dependency"):
        product_registry.get_product_module("culture_assessment")


def _create_org(db: Session, *, api_key: str = "culture-contract-key") -> Organization:
    org = Organization(name="Culture Org", slug="culture-org", contact_email="team@example.com")
    db.add(org)
    db.flush()
    db.add(OrganizationSecret(org_id=org.id, api_key=api_key))
    db.commit()
    db.refresh(org)
    return org


def _create_campaign(db: Session, org: Organization, *, scan_type: str = "culture_assessment") -> Campaign:
    campaign = Campaign(
        organization_id=org.id,
        name="Culture Assessment Placeholder",
        scan_type=scan_type,
        delivery_mode="baseline",
        is_active=True,
        enabled_modules=None,
    )
    db.add(campaign)
    db.commit()
    db.refresh(campaign)
    return campaign


def _create_respondent(db: Session, campaign: Campaign) -> Respondent:
    respondent = Respondent(
        campaign_id=campaign.id,
        email="participant@example.com",
        completed=False,
    )
    db.add(respondent)
    db.commit()
    db.refresh(respondent)
    return respondent


def _culture_payload(token: str) -> dict[str, object]:
    return {
        "token": token,
        "tenure_years": 2.0,
        "exit_reason_category": "cultuur",
        "stay_intent_score": 4,
        "signal_visibility_score": 3,
        "sdt_raw": {f"B{i}": 3 for i in range(1, 13)},
        "org_raw": {
            "leadership_1": 3,
            "culture_1": 4,
            "growth_1": 3,
            "workload_1": 3,
        },
        "pull_factors_raw": {"cultuur": 1},
        "open_text": "We willen eerst een brede cultuurbaseline, nog zonder live route.",
        "uwes_raw": {},
        "turnover_intention_raw": {},
    }


def test_culture_assessment_confirmation_path_accepts_confirmed_route(client, db_session: Session):
    create_response = client.post(
        "/api/contact-request",
        json={
            "name": "Board Sponsor",
            "work_email": "board@example.com",
            "organization": "Loep Corp",
            "employee_count": "500-1000",
            "route_interest": "culture_assessment",
            "cta_source": "culture_assessment_primary_cta",
            "desired_timing": "orienterend",
            "current_question": "We willen een organisatiebrede cultuurbaseline bevestigen.",
            "website": "",
        },
        headers={"x-forwarded-for": "203.0.113.50"},
    )
    lead_id = create_response.json()["lead_id"]

    update_response = client.patch(
        f"/api/contact-requests/{lead_id}",
        json={
            "ops_stage": "implementation_intake_ready",
            "qualification_status": "route_confirmed",
            "qualified_route": "culture_assessment",
            "qualification_reviewed_by": "Verisight Intake",
            "qualification_note": "Culture assessment blijft placeholder-only maar de route mag wel bevestigd worden.",
        },
    )

    assert create_response.status_code == 200
    assert update_response.status_code == 200
    assert backend_main._supports_confirmable_qualified_route("culture_assessment") is True
    stored = db_session.query(ContactRequest).filter(ContactRequest.id == lead_id).one()
    assert stored.route_interest == "culture_assessment"
    assert stored.qualification_status == "route_confirmed"
    assert stored.qualified_route == "culture_assessment"


def test_culture_assessment_submit_path_is_safely_fenced(client, db_session: Session):
    org = _create_org(db_session, api_key="culture-submit-key")
    campaign = _create_campaign(db_session, org)
    respondent = _create_respondent(db_session, campaign)

    response = client.post("/survey/submit", json=_culture_payload(respondent.token))

    assert response.status_code == 422
    assert "Loep Culture Assessment" in response.json()["detail"]
    db_session.refresh(respondent)
    assert respondent.completed is False


def test_culture_assessment_report_generation_is_safely_fenced(client, db_session: Session):
    org = _create_org(db_session, api_key="culture-report-key")
    campaign = _create_campaign(db_session, org)

    response = client.get(
        f"/api/campaigns/{campaign.id}/report",
        headers={"x-api-key": "culture-report-key"},
    )

    assert response.status_code == 422
    assert response.json()["detail"] == "Loep Culture Assessment ondersteunt in deze wave nog geen PDF-rapport."

    with pytest.raises(ValueError, match="Loep Culture Assessment ondersteunt in deze wave nog geen PDF-rapport."):
        backend_report.generate_campaign_report(campaign.id, db_session)


def test_culture_assessment_schema_sql_constraints_include_confirmed_route_contract():
    schema_sql = Path("C:/Users/larsh/Desktop/Business/Verisight/supabase/schema.sql").read_text(encoding="utf-8")

    assert "qualified_route is null or qualified_route in ('exitscan', 'retentiescan', 'teamscan', 'onboarding', 'leadership', 'combinatie', 'culture_assessment')" in schema_sql
    assert "scan_type in ('exit', 'retention', 'pulse', 'team', 'onboarding', 'leadership', 'culture_assessment')" in schema_sql

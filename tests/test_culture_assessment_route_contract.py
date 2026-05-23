from pathlib import Path

import pytest
from sqlalchemy.orm import Session

import backend.main as backend_main
from backend.email import EmailSendResult
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
    assert module.get_management_summary_payload()["index_label"] == "Loep Culture Index"
    assert module.get_methodology_payload()["benchmark_state"] == "inactive_v1"
    assert scan_definition["product_name"] == "Loep Culture Assessment"
    assert scan_definition["signal_label"] == "Loep Culture Index"
    assert scan_definition["route_type"] == "primary_route"
    assert "geen eindoordeel" in scan_definition["dashboard_signal_help"].lower()


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


def _create_campaign(
    db: Session,
    org: Organization,
    *,
    scan_type: str = "culture_assessment",
    is_active: bool = True,
    enabled_modules: list[str] | None = None,
) -> Campaign:
    campaign = Campaign(
        organization_id=org.id,
        name="Culture Assessment Placeholder",
        scan_type=scan_type,
        delivery_mode="baseline",
        is_active=is_active,
        enabled_modules=enabled_modules,
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
    sdt_raw = {f"CA{i:02d}": 4 for i in range(1, 21)}
    org_raw = {f"CA{i:02d}": 4 for i in range(21, 41)}
    sdt_raw["CA04"] = 2
    sdt_raw["CA08"] = 2
    sdt_raw["CA12"] = 2
    sdt_raw["CA16"] = 2
    sdt_raw["CA20"] = 2
    org_raw["CA24"] = 2
    org_raw["CA28"] = 2
    org_raw["CA32"] = 2
    org_raw["CA36"] = 2
    org_raw["CA40"] = 2
    return {
        "token": token,
        "tenure_years": None,
        "exit_reason_category": None,
        "stay_intent_score": None,
        "signal_visibility_score": None,
        "sdt_raw": sdt_raw,
        "org_raw": org_raw,
        "pull_factors_raw": {},
        "open_text": "Brede cultuurread met aandacht voor vertrouwen, werkdruk en richting.",
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


def test_culture_assessment_submit_path_accepts_baseline_submission(client, db_session: Session):
    org = _create_org(db_session, api_key="culture-submit-key")
    campaign = _create_campaign(db_session, org)
    respondent = _create_respondent(db_session, campaign)

    response = client.post("/survey/submit", json=_culture_payload(respondent.token))

    assert response.status_code == 200
    db_session.refresh(respondent)
    assert respondent.completed is True
    assert respondent.response is not None
    assert respondent.response.risk_score is not None
    assert respondent.response.risk_band in {"HOOG", "MIDDEN", "LAAG"}
    assert respondent.response.org_scores["engagement_involvement"] > 0
    assert respondent.response.org_scores["trust_psychological_safety"] > 0
    assert respondent.response.full_result["culture_index"] == respondent.response.risk_score


def test_culture_assessment_survey_page_renders_for_respondents(client, db_session: Session):
    org = _create_org(db_session, api_key="culture-survey-page-key")
    campaign = _create_campaign(db_session, org)
    respondent = _create_respondent(db_session, campaign)

    response = client.get(f"/survey/{respondent.token}")

    assert response.status_code == 200
    assert "Loep Culture Assessment" in response.text
    assert "CA01" in response.text
    assert "CA40" in response.text


def test_culture_assessment_respondent_management_paths_are_available(client, db_session: Session, monkeypatch: pytest.MonkeyPatch):
    org = _create_org(db_session, api_key="culture-respondent-key")
    campaign = _create_campaign(db_session, org)
    respondent = _create_respondent(db_session, campaign)

    monkeypatch.setattr(
        backend_main,
        "send_survey_invite_result",
        lambda **_kwargs: EmailSendResult(ok=True, provider="test"),
    )

    add_response = client.post(
        f"/api/campaigns/{campaign.id}/respondents",
        headers={"x-api-key": "culture-respondent-key"},
        json={
            "respondents": [{"email": "extra@example.com", "department": "People", "role_level": "manager"}],
            "send_invites": False,
        },
    )
    assert add_response.status_code == 201
    assert len(add_response.json()) == 1

    import_response = client.post(
        f"/api/campaigns/{campaign.id}/respondents/import",
        headers={"x-api-key": "culture-respondent-key"},
        files={
            "upload": (
                "respondenten.csv",
                b"email,department,role_level\na@example.com,People,manager\n",
                "text/csv",
            )
        },
        data={"dry_run": "true", "send_invites": "false"},
    )
    assert import_response.status_code == 200
    assert import_response.json()["valid_rows"] == 1

    invite_response = client.post(
        f"/api/campaigns/{campaign.id}/send-invites",
        headers={"x-api-key": "culture-respondent-key"},
        json=[{"token": str(respondent.token), "email": respondent.email}],
    )
    assert invite_response.status_code == 200
    assert invite_response.json()["sent"] == 1


def test_culture_assessment_report_generation_requires_closed_baseline(client, db_session: Session):
    org = _create_org(db_session, api_key="culture-report-key")
    campaign = _create_campaign(db_session, org)

    response = client.get(
        f"/api/campaigns/{campaign.id}/report",
        headers={"x-api-key": "culture-report-key"},
    )

    assert response.status_code == 422
    assert response.json()["detail"] == "Loep Culture Assessment boardrapport komt pas beschikbaar na formele sluiting van de baseline."

    with pytest.raises(ValueError, match="Loep Culture Assessment boardrapport komt pas beschikbaar na formele sluiting van de baseline."):
        backend_report.generate_campaign_report(campaign.id, db_session)


def test_culture_assessment_report_generation_allows_closed_baseline_route(client, db_session: Session, monkeypatch: pytest.MonkeyPatch):
    org = _create_org(db_session, api_key="culture-report-live-key")
    campaign = _create_campaign(db_session, org, is_active=False)

    monkeypatch.setattr(backend_report, "generate_campaign_report", lambda *_args, **_kwargs: b"%PDF-1.4 fake culture report")

    response = client.get(
        f"/api/campaigns/{campaign.id}/report",
        headers={"x-api-key": "culture-report-live-key"},
    )

    assert response.status_code == 200
    assert response.headers["content-type"] == "application/pdf"
    assert response.content.startswith(b"%PDF-1.4")


def test_culture_assessment_segment_summary_export_requires_governed_add_on(client, db_session: Session):
    org = _create_org(db_session, api_key="culture-segment-export-key")
    campaign = _create_campaign(db_session, org, is_active=False)

    response = client.get(
        f"/api/internal/campaigns/{campaign.id}/report?format=segment_summary",
    )

    assert response.status_code == 422
    assert response.json()["detail"] == (
        "Segment summary export opent alleen binnen governed drilldown met segment deep dive."
    )


def test_culture_assessment_segment_summary_export_public_route_stays_internal_only(
    client,
    db_session: Session,
):
    org = _create_org(db_session, api_key="culture-segment-public-key")
    campaign = _create_campaign(
        db_session,
        org,
        is_active=False,
        enabled_modules=["segment_deep_dive"],
    )

    response = client.get(
        f"/api/campaigns/{campaign.id}/report?format=segment_summary",
        headers={"x-api-key": "culture-segment-public-key"},
    )

    assert response.status_code == 403
    assert response.json()["detail"] == (
        "Segment summary export is alleen beschikbaar via de interne governance-proxy."
    )


def test_culture_assessment_segment_summary_export_allows_governed_closed_baseline_internal_route(
    client,
    db_session: Session,
    monkeypatch: pytest.MonkeyPatch,
):
    org = _create_org(db_session, api_key="culture-segment-export-live-key")
    campaign = _create_campaign(
        db_session,
        org,
        is_active=False,
        enabled_modules=["segment_deep_dive"],
    )

    monkeypatch.setattr(
        backend_report,
        "generate_culture_assessment_segment_summary_export",
        lambda *_args, **_kwargs: b"segment_type,segment_label,n,culture_index\r\nAfdeling,People,18,6.4\r\n",
    )

    response = client.get(
        f"/api/internal/campaigns/{campaign.id}/report?format=segment_summary",
    )

    assert response.status_code == 200
    assert response.headers["content-type"].startswith("text/csv")
    assert response.content.startswith(b"segment_type,segment_label")


def test_culture_assessment_schema_sql_constraints_include_confirmed_route_contract():
    schema_sql = Path("C:/Users/larsh/Desktop/Business/Verisight/supabase/schema.sql").read_text(encoding="utf-8")

    assert "qualified_route is null or qualified_route in ('exitscan', 'retentiescan', 'teamscan', 'onboarding', 'leadership', 'combinatie', 'culture_assessment')" in schema_sql
    assert "scan_type in ('exit', 'retention', 'pulse', 'team', 'onboarding', 'leadership', 'culture_assessment')" in schema_sql


def test_culture_assessment_runtime_migration_aligns_scan_type_constraints():
    migration_sql = (
        Path(__file__).resolve().parents[1] / "migrations/2026_05_23_align_scan_type_constraints.sql"
    ).read_text(encoding="utf-8").lower()

    assert "campaigns_scan_type_check" in migration_sql
    assert "pilot_learning_dossiers_scan_type_check" in migration_sql
    assert "scan_type in (" in migration_sql
    assert "'culture_assessment'" in migration_sql
    assert "'leadership'" in migration_sql

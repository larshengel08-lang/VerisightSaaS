from backend.models import (
    Campaign,
    ContactRequest,
    Organization,
    PilotLearningCheckpoint,
    PilotLearningDossier,
)
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]


def test_learning_dossier_persists_with_checkpoint_defaults(db_session):
    org = Organization(name="Verisight", slug="verisight", contact_email="hello@verisight.nl")
    campaign = Campaign(
        organization=org,
        name="ExitScan Q2",
        scan_type="exit",
        delivery_mode="baseline",
    )
    lead = ContactRequest(
        name="Lars",
        work_email="lars@example.com",
        organization="Verisight",
        employee_count="50-100",
        route_interest="exitscan",
        cta_source="website_primary_cta",
        desired_timing="deze-maand",
        current_question="Waarom vertrekken mensen nu?",
    )
    dossier = PilotLearningDossier(
        organization=org,
        campaign=campaign,
        contact_request=lead,
        title="Pilotlearning - ExitScan Q2",
        route_interest="exitscan",
        scan_type="exit",
        delivery_mode="baseline",
        triage_status="nieuw",
        buyer_question="Waarom vertrekken mensen nu?",
        expected_first_value="Eerste managementduiding",
        first_management_value="MT ziet welke vertrekredenen als eerste bestuurlijke aandacht vragen.",
        first_action_taken="Directe leidinggevenden krijgen eerste handoff.",
        review_moment="Review over 45 dagen",
        case_evidence_closure_status="internal_proof_only",
        case_approval_status="internal_review",
        case_permission_status="internal_only",
        case_quote_potential="middel",
        case_reference_potential="laag",
        case_outcome_quality="indicatief",
        case_outcome_classes=["kwalitatieve_les", "management_adoptie"],
        claimable_observations="De eerste managementread gaf meteen een bruikbare prioritering.",
        supporting_artifacts="Kickoff-notes, managementread-summary",
    )
    checkpoint = PilotLearningCheckpoint(
        dossier=dossier,
        checkpoint_key="lead_route_hypothesis",
        owner_label="Founder / Verisight",
        status="nieuw",
        lesson_strength="incidentele_observatie",
        destination_areas=["sales", "operations"],
    )

    db_session.add_all([org, campaign, lead, dossier, checkpoint])
    db_session.commit()
    db_session.refresh(dossier)
    db_session.refresh(checkpoint)

    assert dossier.id is not None
    assert dossier.organization_id == org.id
    assert dossier.campaign_id == campaign.id
    assert dossier.contact_request_id == lead.id
    assert dossier.triage_status == "nieuw"
    assert dossier.case_evidence_closure_status == "internal_proof_only"
    assert dossier.case_outcome_classes == ["kwalitatieve_les", "management_adoptie"]
    assert checkpoint.destination_areas == ["sales", "operations"]
    assert checkpoint.lesson_strength == "incidentele_observatie"


def test_learning_checkpoint_can_store_confirmed_lesson_and_destinations(db_session):
    org = Organization(name="Acme", slug="acme", contact_email="hr@acme.nl")
    dossier = PilotLearningDossier(
        organization=org,
        title="Pilotlearning - Acme",
        route_interest="retentiescan",
        triage_status="bevestigd",
        trust_friction="Twijfel over privacyframing",
        case_evidence_closure_status="sales_usable",
        case_approval_status="claim_check",
        case_permission_status="anonymous_case_only",
        case_quote_potential="hoog",
        case_reference_potential="middel",
        case_outcome_quality="stevig",
        case_outcome_classes=["operationele_uitkomst"],
    )
    checkpoint = PilotLearningCheckpoint(
        dossier=dossier,
        checkpoint_key="first_management_use",
        owner_label="Klant + Verisight",
        status="bevestigd",
        qualitative_notes="Management wilde eerst verificatie, geen snelle interventie.",
        interpreted_observation="Verification-first framing helpt, maar next-step copy kan compacter.",
        confirmed_lesson="RetentieScan managementread moet verificatie en eerste interventie nog scherper scheiden.",
        lesson_strength="direct_uitvoerbare_verbetering",
        destination_areas=["report", "product"],
    )

    db_session.add_all([org, dossier, checkpoint])
    db_session.commit()

    stored = db_session.get(PilotLearningCheckpoint, checkpoint.id)
    assert stored is not None
    assert stored.status == "bevestigd"
    assert stored.lesson_strength == "direct_uitvoerbare_verbetering"
    assert stored.destination_areas == ["report", "product"]
    assert "verificatie" in (stored.confirmed_lesson or "").lower()

    stored_dossier = db_session.get(PilotLearningDossier, dossier.id)
    assert stored_dossier is not None
    assert stored_dossier.case_permission_status == "anonymous_case_only"
    assert stored_dossier.case_outcome_quality == "stevig"


def test_learning_route_contract_includes_teamscan_for_persisted_dossiers():
    schema = (ROOT / "supabase/schema.sql").read_text(encoding="utf-8").lower()
    migration = (
        ROOT / "migrations/2026_04_25_add_teamscan_learning_route.sql"
    ).read_text(encoding="utf-8").lower()

    assert "route_interest in ('exitscan', 'retentiescan', 'teamscan', 'combinatie', 'nog-onzeker')" in schema
    assert "pilot_learning_dossiers_route_interest_check" in migration
    assert "teamscan" in migration

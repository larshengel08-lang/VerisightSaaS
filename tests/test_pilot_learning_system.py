from backend.models import (
    Campaign,
    ContactRequest,
    Organization,
    PilotLearningCheckpoint,
    PilotLearningDossier,
)


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

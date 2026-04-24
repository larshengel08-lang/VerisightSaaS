from __future__ import annotations

from sqlalchemy import inspect, text

from backend.models import Campaign, Organization, Respondent
from demo_environment import (
    BUYER_FACING_SAMPLE_ORG_SLUG,
    DEMO_LAYER_CONTRACTS,
    DEMO_SCENARIOS,
    GUIDED_SELF_SERVE_ACCEPTANCE_ORG_SLUG,
    GUIDED_SELF_SERVE_SETUP_CAMPAIGN_NAME,
    GUIDED_SELF_SERVE_THRESHOLD_CAMPAIGN_NAME,
    INTERNAL_SALES_DEMO_ORG_SLUG,
    RESPONSE_THRESHOLDS,
    SAFE_DEMO_EMAIL_DOMAIN,
    advance_guided_self_serve_acceptance,
    seed_guided_self_serve_acceptance,
    seed_sales_demo_exit,
    seed_sales_demo_retention,
)


def test_demo_scenario_registry_covers_expected_layers_and_scenarios():
    assert set(DEMO_LAYER_CONTRACTS.keys()) == {
        "buyer_facing_showcase",
        "internal_sales_demo",
        "qa_live_fixture",
        "validation_sandbox",
    }
    assert set(DEMO_SCENARIOS.keys()) == {
        "sales_demo_exit",
        "sales_demo_retention",
        "qa_exit_live_test",
        "qa_guided_self_serve_acceptance",
        "qa_retention_demo",
        "validation_retention_pilot",
    }

    assert DEMO_SCENARIOS["sales_demo_exit"].layer == "internal_sales_demo"
    assert DEMO_SCENARIOS["sales_demo_retention"].layer == "internal_sales_demo"
    assert DEMO_SCENARIOS["qa_exit_live_test"].layer == "qa_live_fixture"
    assert DEMO_SCENARIOS["qa_guided_self_serve_acceptance"].layer == "qa_live_fixture"
    assert DEMO_SCENARIOS["validation_retention_pilot"].layer == "validation_sandbox"


def test_internal_sales_demo_identity_stays_separate_from_buyer_facing_sample_identity():
    assert INTERNAL_SALES_DEMO_ORG_SLUG != BUYER_FACING_SAMPLE_ORG_SLUG
    assert DEMO_SCENARIOS["sales_demo_exit"].org_slug == INTERNAL_SALES_DEMO_ORG_SLUG
    assert DEMO_SCENARIOS["sales_demo_retention"].org_slug == INTERNAL_SALES_DEMO_ORG_SLUG


def test_seed_sales_demo_exit_is_idempotent_and_uses_safe_demo_mailboxes(db_session):
    first = seed_sales_demo_exit(db_session)
    second = seed_sales_demo_exit(db_session)

    assert first["org_slug"] == INTERNAL_SALES_DEMO_ORG_SLUG
    assert second["campaign_count"] == first["campaign_count"]

    org = db_session.query(Organization).filter(Organization.slug == INTERNAL_SALES_DEMO_ORG_SLUG).one()
    campaigns = (
        db_session.query(Campaign)
        .filter(Campaign.organization_id == org.id, Campaign.scan_type == "exit")
        .all()
    )
    respondents = (
        db_session.query(Respondent)
        .join(Campaign, Campaign.id == Respondent.campaign_id)
        .filter(Campaign.organization_id == org.id, Campaign.scan_type == "exit")
        .all()
    )

    assert len(campaigns) == 5
    assert {campaign.name for campaign in campaigns} == {
        "ExitScan Sales Demo - Empty",
        "ExitScan Sales Demo - Early Signal",
        "ExitScan Sales Demo - Indicative",
        "ExitScan Sales Demo - Decision Ready",
        "ExitScan Sales Demo - Closed Archive",
    }
    assert all(
        respondent.email is None or respondent.email.endswith(f"@{SAFE_DEMO_EMAIL_DOMAIN}")
        for respondent in respondents
    )
    assert any(campaign.is_active for campaign in campaigns)
    assert any(not campaign.is_active for campaign in campaigns)


def test_seed_sales_demo_retention_creates_trend_pair_and_threshold_states(db_session):
    result = seed_sales_demo_retention(db_session)

    assert result["org_slug"] == INTERNAL_SALES_DEMO_ORG_SLUG
    assert result["detail_threshold"] == RESPONSE_THRESHOLDS["detail"]
    assert result["pattern_threshold"] == RESPONSE_THRESHOLDS["pattern"]

    org = db_session.query(Organization).filter(Organization.slug == INTERNAL_SALES_DEMO_ORG_SLUG).one()
    campaigns = (
        db_session.query(Campaign)
        .filter(Campaign.organization_id == org.id, Campaign.scan_type == "retention")
        .order_by(Campaign.name.asc())
        .all()
    )

    assert len(campaigns) == 3
    assert {campaign.name for campaign in campaigns} == {
        "RetentieScan Sales Demo - Baseline Najaar 2025",
        "RetentieScan Sales Demo - Indicative",
        "RetentieScan Sales Demo - Voorjaar 2026",
    }

    response_counts = {
        campaign.name: sum(1 for respondent in campaign.respondents if respondent.completed)
        for campaign in campaigns
    }
    assert response_counts["RetentieScan Sales Demo - Indicative"] >= RESPONSE_THRESHOLDS["detail"]
    assert response_counts["RetentieScan Sales Demo - Voorjaar 2026"] >= RESPONSE_THRESHOLDS["pattern"]
    assert any(not campaign.is_active for campaign in campaigns)
    assert any(campaign.is_active for campaign in campaigns)

    all_emails = [respondent.email for campaign in campaigns for respondent in campaign.respondents if respondent.email]
    assert all(email.endswith(f"@{SAFE_DEMO_EMAIL_DOMAIN}") for email in all_emails)


def test_seed_guided_self_serve_acceptance_creates_setup_and_threshold_journeys(db_session):
    result = seed_guided_self_serve_acceptance(db_session, viewer_user_id="viewer-guided-self-serve")

    assert result["org_slug"] == GUIDED_SELF_SERVE_ACCEPTANCE_ORG_SLUG
    assert result["campaign_count"] == 2
    assert result["detail_threshold"] == RESPONSE_THRESHOLDS["detail"]
    assert result["pattern_threshold"] == RESPONSE_THRESHOLDS["pattern"]
    assert result["viewer_user_id"] == "viewer-guided-self-serve"

    org = db_session.query(Organization).filter(Organization.slug == GUIDED_SELF_SERVE_ACCEPTANCE_ORG_SLUG).one()
    campaigns = (
        db_session.query(Campaign)
        .filter(Campaign.organization_id == org.id, Campaign.scan_type == "exit")
        .order_by(Campaign.name.asc())
        .all()
    )

    assert [campaign.name for campaign in campaigns] == [
        GUIDED_SELF_SERVE_SETUP_CAMPAIGN_NAME,
        GUIDED_SELF_SERVE_THRESHOLD_CAMPAIGN_NAME,
    ]

    setup_campaign = next(campaign for campaign in campaigns if campaign.name == GUIDED_SELF_SERVE_SETUP_CAMPAIGN_NAME)
    threshold_campaign = next(campaign for campaign in campaigns if campaign.name == GUIDED_SELF_SERVE_THRESHOLD_CAMPAIGN_NAME)

    assert setup_campaign.is_active is True
    assert len(setup_campaign.respondents) == 0
    assert threshold_campaign.is_active is True
    assert len(threshold_campaign.respondents) == 8
    assert sum(1 for respondent in threshold_campaign.respondents if respondent.completed) == 4
    assert all(
        respondent.email is None or respondent.email.endswith(f"@{SAFE_DEMO_EMAIL_DOMAIN}")
        for respondent in threshold_campaign.respondents
    )


def test_seed_guided_self_serve_acceptance_can_assign_owner_executor(db_session):
    result = seed_guided_self_serve_acceptance(db_session, owner_user_id="owner-guided-self-serve")

    assert result["owner_user_id"] == "owner-guided-self-serve"

    if not inspect(db_session.bind).has_table("org_members"):
        return

    org = db_session.query(Organization).filter(Organization.slug == GUIDED_SELF_SERVE_ACCEPTANCE_ORG_SLUG).one()
    membership = db_session.execute(
        text(
            """
            select role
            from public.org_members
            where org_id = :org_id and user_id = :user_id
            """
        ),
        {"org_id": org.id, "user_id": "owner-guided-self-serve"},
    ).scalar_one()

    assert membership == "owner"


def test_advance_guided_self_serve_acceptance_progresses_threshold_journey(db_session):
    seed_guided_self_serve_acceptance(db_session)

    min_display = advance_guided_self_serve_acceptance(db_session, phase="min_display")
    patterns = advance_guided_self_serve_acceptance(db_session, phase="patterns")

    assert min_display["phase"] == "min_display"
    assert min_display["total_completed"] == RESPONSE_THRESHOLDS["detail"]
    assert patterns["phase"] == "patterns"
    assert patterns["total_completed"] == RESPONSE_THRESHOLDS["pattern"]

    org = db_session.query(Organization).filter(Organization.slug == GUIDED_SELF_SERVE_ACCEPTANCE_ORG_SLUG).one()
    threshold_campaign = (
        db_session.query(Campaign)
        .filter(
            Campaign.organization_id == org.id,
            Campaign.name == GUIDED_SELF_SERVE_THRESHOLD_CAMPAIGN_NAME,
        )
        .one()
    )

    assert len(threshold_campaign.respondents) == RESPONSE_THRESHOLDS["pattern"]
    assert sum(1 for respondent in threshold_campaign.respondents if respondent.completed) == RESPONSE_THRESHOLDS["pattern"]

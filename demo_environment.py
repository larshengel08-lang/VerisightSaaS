from __future__ import annotations

import random
import uuid
from dataclasses import dataclass
from datetime import datetime, timedelta, timezone
from typing import Literal

from sqlalchemy.orm import Session

from backend.models import Campaign, Organization, OrganizationSecret, Respondent, SurveyResponse
from generate_voorbeeldrapport import (
    DEPARTMENTS,
    EXIT_PROFILES,
    RETENTION_PROFILES,
    ROLE_LEVELS,
    SALARIES,
    _build_exit_response,
    _build_retention_response,
    _pick_profile,
)

SAFE_DEMO_EMAIL_DOMAIN = "demo.verisight.local"

BUYER_FACING_SAMPLE_ORG_NAME = "TechBouw B.V."
BUYER_FACING_SAMPLE_ORG_SLUG = "techbouw-demo"

INTERNAL_SALES_DEMO_ORG_NAME = "Verisight Sales Demo"
INTERNAL_SALES_DEMO_ORG_SLUG = "verisight-sales-demo"
INTERNAL_SALES_DEMO_CONTACT_EMAIL = "sales-demo@verisight.nl"

QA_EXIT_ORG_NAME = "Verisight ExitScan Live Test"
QA_EXIT_ORG_SLUG = "exitscan-live-test"
QA_RETENTION_ORG_SLUG = "bakker-partners-demo"

VALIDATION_RETENTION_DEFAULT_DB = "data/retention_pilot_dummy.db"
VALIDATION_RETENTION_DEFAULT_OUTDIR = "data/retention_pilot_dummy_run"

RANDOM_SEEDS = {
    "sales_demo_exit": 20260415,
    "sales_demo_retention": 20260416,
}

RESPONSE_THRESHOLDS = {
    "detail": 5,
    "pattern": 10,
}

DemoLayerKey = Literal["buyer_facing_showcase", "internal_sales_demo", "qa_live_fixture", "validation_sandbox"]
DemoScenarioKey = Literal[
    "sales_demo_exit",
    "sales_demo_retention",
    "qa_exit_live_test",
    "qa_retention_demo",
    "validation_retention_pilot",
]


@dataclass(frozen=True)
class DemoLayerContract:
    key: DemoLayerKey
    label: str
    audience: str
    intended_use: str
    claim_boundary: str
    reset_strategy: str
    owner: str
    data_hygiene: str


@dataclass(frozen=True)
class DemoScenarioDefinition:
    key: DemoScenarioKey
    label: str
    layer: DemoLayerKey
    audience: str
    scenario_type: str
    org_name: str | None
    org_slug: str | None
    purpose: str
    claim_boundary: str
    reset_strategy: str
    data_policy: str
    expected_campaign_states: tuple[str, ...]
    entrypoint: str


@dataclass(frozen=True)
class ExitSalesFixture:
    name: str
    delivery_mode: str
    is_active: bool
    invited: int
    completed: int
    enabled_modules: list[str] | None
    created_days_ago: int
    state_label: str


@dataclass(frozen=True)
class RetentionSalesFixture:
    name: str
    delivery_mode: str
    is_active: bool
    invited: int
    completed: int
    enabled_modules: list[str] | None
    created_days_ago: int
    profile_shift: dict[str, float]
    state_label: str


DEMO_LAYER_CONTRACTS: dict[DemoLayerKey, DemoLayerContract] = {
    "buyer_facing_showcase": DemoLayerContract(
        key="buyer_facing_showcase",
        label="Buyer-facing showcase",
        audience="buyers, website visitors, pricing and trust conversations",
        intended_use="Public proof layer based on real report output and teaser previews.",
        claim_boundary="Illustrative fictive output only; never sold as case proof, diagnosis, or richer than the real product.",
        reset_strategy="Regenerate from the report engine and mirror to public examples when report contracts change.",
        owner="Verisight product/marketing",
        data_hygiene="Only fictive data and buyer-facing trust framing; no confidential customer framing.",
    ),
    "internal_sales_demo": DemoLayerContract(
        key="internal_sales_demo",
        label="Internal sales demo",
        audience="Lars and Verisight operators during assisted demos and onboarding calls",
        intended_use="Live dashboard walkthroughs with safe fictive tenants and campaign states.",
        claim_boundary="Demonstrates real product behavior but never overrides buyer-facing sample assets as the public proof layer.",
        reset_strategy="Idempotent reseed into a dedicated shared demo org.",
        owner="Verisight sales/demo owner",
        data_hygiene="Fictive org, campaigns, and safe demo mailboxes only.",
    ),
    "qa_live_fixture": DemoLayerContract(
        key="qa_live_fixture",
        label="QA/live fixture",
        audience="operators and engineers validating launch, reminders, archive, and access flows",
        intended_use="Functional fixtures for product checks, not for buyer-facing proof.",
        claim_boundary="Can show real product states, but must not be used as the default sales story.",
        reset_strategy="Repeatable fixture seed per QA org and scenario.",
        owner="Verisight product/ops",
        data_hygiene="Fictive org and safe demo addresses; action-safe campaigns clearly separated.",
    ),
    "validation_sandbox": DemoLayerContract(
        key="validation_sandbox",
        label="Validation sandbox",
        audience="product and validation work",
        intended_use="Local dummy data for retention validation and pragmatic pilot simulations.",
        claim_boundary="Methodical sandbox only; not a buyer-facing or routine sales environment.",
        reset_strategy="Local dataset regeneration into a dedicated dummy sqlite path.",
        owner="Verisight validation owner",
        data_hygiene="Dummy local data only and explicit separation from sales demo tenants.",
    ),
}


DEMO_SCENARIOS: dict[DemoScenarioKey, DemoScenarioDefinition] = {
    "sales_demo_exit": DemoScenarioDefinition(
        key="sales_demo_exit",
        label="ExitScan internal sales demo",
        layer="internal_sales_demo",
        audience="sales, assisted onboarding, early customer conversations",
        scenario_type="internal_sales_demo",
        org_name=INTERNAL_SALES_DEMO_ORG_NAME,
        org_slug=INTERNAL_SALES_DEMO_ORG_SLUG,
        purpose="Shared demo org with ExitScan campaign states for empty, early, indicative, decision-ready, and closed reads.",
        claim_boundary="Use for live walkthroughs after the buyer-facing sample report has framed the route.",
        reset_strategy="Reseeds only named internal sales demo ExitScan campaigns inside the shared sales demo org.",
        data_policy="Fictive org, safe demo mailboxes, and real product scoring/report behavior only.",
        expected_campaign_states=("empty", "early_signal", "indicative", "decision_ready", "closed_archive"),
        entrypoint="manage_demo_environment.py run sales_demo_exit",
    ),
    "sales_demo_retention": DemoScenarioDefinition(
        key="sales_demo_retention",
        label="RetentieScan internal sales demo",
        layer="internal_sales_demo",
        audience="sales, assisted onboarding, early customer conversations with explicit retention questions",
        scenario_type="internal_sales_demo",
        org_name=INTERNAL_SALES_DEMO_ORG_NAME,
        org_slug=INTERNAL_SALES_DEMO_ORG_SLUG,
        purpose="Shared demo org with RetentieScan trend and verification-first campaigns.",
        claim_boundary="Use only when the buyer question is explicitly about active-population retention and verification.",
        reset_strategy="Reseeds only named internal sales demo RetentieScan campaigns inside the shared sales demo org.",
        data_policy="Fictive org, safe demo mailboxes, grouped trend logic, and no individual predictor framing.",
        expected_campaign_states=("indicative", "decision_ready", "trend_baseline", "trend_follow_up"),
        entrypoint="manage_demo_environment.py run sales_demo_retention",
    ),
    "qa_exit_live_test": DemoScenarioDefinition(
        key="qa_exit_live_test",
        label="ExitScan QA live fixture",
        layer="qa_live_fixture",
        audience="operators and engineers",
        scenario_type="qa_live_fixture",
        org_name=QA_EXIT_ORG_NAME,
        org_slug=QA_EXIT_ORG_SLUG,
        purpose="Fixture org with action-safe tokens and campaign states for live flow checks.",
        claim_boundary="Never use as the default buyer-facing demo story.",
        reset_strategy="Replays the existing ExitScan live test fixture seed.",
        data_policy="Fictive org, safe demo mailboxes, and token/test-only behavior.",
        expected_campaign_states=("empty", "early_signal", "indicative", "decision_ready", "closed_archive", "action_safe"),
        entrypoint="manage_demo_environment.py run qa_exit_live_test",
    ),
    "qa_retention_demo": DemoScenarioDefinition(
        key="qa_retention_demo",
        label="RetentieScan QA/demo fixture",
        layer="qa_live_fixture",
        audience="operators and engineers",
        scenario_type="qa_live_fixture",
        org_name=None,
        org_slug=QA_RETENTION_ORG_SLUG,
        purpose="Existing retention demo org with previous/current measurements and segment metadata.",
        claim_boundary="Useful for live product validation and explicit retention demos, but not a public proof layer.",
        reset_strategy="Replays the existing RetentieScan demo seed in a pre-existing org.",
        data_policy="Fictive responses, safe demo mailboxes, and grouped retention output only.",
        expected_campaign_states=("trend_baseline", "trend_follow_up"),
        entrypoint="manage_demo_environment.py run qa_retention_demo",
    ),
    "validation_retention_pilot": DemoScenarioDefinition(
        key="validation_retention_pilot",
        label="RetentieScan validation sandbox",
        layer="validation_sandbox",
        audience="product and validation work",
        scenario_type="validation_sandbox",
        org_name=None,
        org_slug=None,
        purpose="Local sqlite dummy pilot plus validation outputs and follow-up datasets.",
        claim_boundary="Validation-only sandbox, not for standard sales or onboarding demos.",
        reset_strategy="Rebuilds local dummy dataset and validation output directories.",
        data_policy="Local dummy data only under data/ retention pilot paths.",
        expected_campaign_states=("validation_baseline", "validation_follow_up"),
        entrypoint="manage_demo_environment.py run validation_retention_pilot",
    ),
}


EXIT_SALES_FIXTURES: tuple[ExitSalesFixture, ...] = (
    ExitSalesFixture(
        name="ExitScan Sales Demo - Empty",
        delivery_mode="baseline",
        is_active=True,
        invited=0,
        completed=0,
        enabled_modules=None,
        created_days_ago=1,
        state_label="empty",
    ),
    ExitSalesFixture(
        name="ExitScan Sales Demo - Early Signal",
        delivery_mode="baseline",
        is_active=True,
        invited=7,
        completed=4,
        enabled_modules=None,
        created_days_ago=3,
        state_label="early_signal",
    ),
    ExitSalesFixture(
        name="ExitScan Sales Demo - Indicative",
        delivery_mode="baseline",
        is_active=True,
        invited=11,
        completed=8,
        enabled_modules=None,
        created_days_ago=6,
        state_label="indicative",
    ),
    ExitSalesFixture(
        name="ExitScan Sales Demo - Decision Ready",
        delivery_mode="live",
        is_active=True,
        invited=16,
        completed=12,
        enabled_modules=["segment_deep_dive"],
        created_days_ago=10,
        state_label="decision_ready",
    ),
    ExitSalesFixture(
        name="ExitScan Sales Demo - Closed Archive",
        delivery_mode="baseline",
        is_active=False,
        invited=14,
        completed=11,
        enabled_modules=["segment_deep_dive"],
        created_days_ago=18,
        state_label="closed_archive",
    ),
)


RETENTION_SALES_FIXTURES: tuple[RetentionSalesFixture, ...] = (
    RetentionSalesFixture(
        name="RetentieScan Sales Demo - Baseline Najaar 2025",
        delivery_mode="baseline",
        is_active=False,
        invited=52,
        completed=34,
        enabled_modules=["segment_deep_dive"],
        created_days_ago=160,
        profile_shift={
            "lead_bias": -0.15,
            "growth_bias": -0.10,
            "work_bias": -0.10,
            "engagement_base": -0.05,
            "turnover_base": 0.15,
        },
        state_label="trend_baseline",
    ),
    RetentionSalesFixture(
        name="RetentieScan Sales Demo - Indicative",
        delivery_mode="baseline",
        is_active=True,
        invited=9,
        completed=6,
        enabled_modules=None,
        created_days_ago=30,
        profile_shift={
            "growth_bias": 0.05,
            "work_bias": 0.05,
            "engagement_base": 0.05,
            "turnover_base": -0.05,
        },
        state_label="indicative",
    ),
    RetentionSalesFixture(
        name="RetentieScan Sales Demo - Voorjaar 2026",
        delivery_mode="baseline",
        is_active=True,
        invited=58,
        completed=39,
        enabled_modules=["segment_deep_dive"],
        created_days_ago=14,
        profile_shift={
            "lead_bias": 0.10,
            "growth_bias": 0.10,
            "work_bias": 0.10,
            "engagement_base": 0.20,
            "turnover_base": -0.10,
        },
        state_label="trend_follow_up",
    ),
)


def get_demo_scenarios() -> list[DemoScenarioDefinition]:
    return list(DEMO_SCENARIOS.values())


def get_demo_layer_contracts() -> list[DemoLayerContract]:
    return list(DEMO_LAYER_CONTRACTS.values())


def _safe_demo_email(prefix: str, state_label: str, status: str, index: int) -> str:
    return f"{prefix}-{state_label}-{status}-{index:03d}@{SAFE_DEMO_EMAIL_DOMAIN}"


def _get_or_create_org(
    db: Session,
    *,
    slug: str,
    name: str,
    contact_email: str,
) -> Organization:
    org = db.query(Organization).filter(Organization.slug == slug).one_or_none()
    if org is None:
        org = Organization(
            id=str(uuid.uuid4()),
            name=name,
            slug=slug,
            contact_email=contact_email,
            is_active=True,
        )
        db.add(org)
        db.flush()
    else:
        org.name = name
        org.contact_email = contact_email
        org.is_active = True
        db.flush()
    return org


def _ensure_org_secret(db: Session, org: Organization) -> None:
    existing = db.query(OrganizationSecret).filter(OrganizationSecret.org_id == org.id).one_or_none()
    if existing is None:
        db.add(OrganizationSecret(org_id=org.id))
        db.flush()


def _purge_campaign(db: Session, campaign: Campaign) -> None:
    for respondent in list(campaign.respondents):
        if respondent.response is not None:
            db.delete(respondent.response)
    db.flush()
    db.delete(campaign)
    db.flush()


def _purge_named_campaigns(db: Session, org: Organization, names: list[str]) -> None:
    campaigns = (
        db.query(Campaign)
        .filter(Campaign.organization_id == org.id, Campaign.name.in_(names))
        .all()
    )
    for campaign in campaigns:
        _purge_campaign(db, campaign)


def _pick_exit_profile() -> dict[str, float | str]:
    profile = _pick_profile(EXIT_PROFILES)
    return {
        "name": str(profile["name"]),
        "sdt_bias": float(profile["sdt_bias"]),
        "lead_bias": float(profile["lead_bias"]),
        "growth_bias": float(profile["growth_bias"]),
        "work_bias": float(profile["work_bias"]),
        "culture_bias": float(profile["culture_bias"]),
        "compensation_bias": float(profile["compensation_bias"]),
        "role_bias": float(profile["role_bias"]),
        "reason_category": str(profile["reason_category"]),
        "reason_code": str(profile["reason_code"]),
    }


def _create_exit_campaign(db: Session, *, org: Organization, fixture: ExitSalesFixture) -> Campaign:
    created_at = datetime.now(timezone.utc) - timedelta(days=fixture.created_days_ago)
    campaign = Campaign(
        id=str(uuid.uuid4()),
        organization_id=org.id,
        name=fixture.name,
        scan_type="exit",
        delivery_mode=fixture.delivery_mode,
        is_active=fixture.is_active,
        enabled_modules=fixture.enabled_modules,
        created_at=created_at,
        closed_at=None if fixture.is_active else created_at + timedelta(days=3),
    )
    db.add(campaign)
    db.flush()
    return campaign


def _create_retention_campaign(db: Session, *, org: Organization, fixture: RetentionSalesFixture) -> Campaign:
    created_at = datetime.now(timezone.utc) - timedelta(days=fixture.created_days_ago)
    campaign = Campaign(
        id=str(uuid.uuid4()),
        organization_id=org.id,
        name=fixture.name,
        scan_type="retention",
        delivery_mode=fixture.delivery_mode,
        is_active=fixture.is_active,
        enabled_modules=fixture.enabled_modules,
        created_at=created_at,
        closed_at=None if fixture.is_active else created_at + timedelta(days=21),
    )
    db.add(campaign)
    db.flush()
    return campaign


def _create_pending_respondent(
    db: Session,
    *,
    campaign: Campaign,
    email: str,
    sent_at: datetime,
    opened: bool = False,
    department: str | None = None,
    role_level: str | None = None,
    exit_month: str | None = None,
) -> Respondent:
    respondent = Respondent(
        id=str(uuid.uuid4()),
        campaign_id=campaign.id,
        department=department or random.choice(DEPARTMENTS),
        role_level=role_level or random.choice(ROLE_LEVELS),
        annual_salary_eur=float(random.choice(SALARIES)),
        email=email,
        exit_month=exit_month,
        sent_at=sent_at,
        opened_at=sent_at + timedelta(hours=6) if opened else None,
        completed=False,
        completed_at=None,
        token_expires_at=datetime.now(timezone.utc) + timedelta(days=45),
    )
    db.add(respondent)
    db.flush()
    return respondent


def _create_exit_completed_respondent(
    db: Session,
    *,
    campaign: Campaign,
    email: str,
    completed_at: datetime,
) -> Respondent:
    department = random.choice(DEPARTMENTS)
    role_level = random.choice(ROLE_LEVELS)
    salary = random.choice(SALARIES)
    profile = _pick_exit_profile()
    response_payload = _build_exit_response(profile, salary, role_level)

    respondent = Respondent(
        id=str(uuid.uuid4()),
        campaign_id=campaign.id,
        department=department,
        role_level=role_level,
        exit_month="2026-03",
        annual_salary_eur=float(salary),
        email=email,
        sent_at=completed_at - timedelta(days=2),
        opened_at=completed_at - timedelta(days=1, hours=4),
        completed=True,
        completed_at=completed_at,
        token_expires_at=completed_at + timedelta(days=30),
    )
    db.add(respondent)
    db.flush()

    db.add(
        SurveyResponse(
            id=str(uuid.uuid4()),
            respondent_id=respondent.id,
            tenure_years=response_payload["tenure_years"],
            exit_reason_category=response_payload["exit_reason_category"],
            exit_reason_code=response_payload["exit_reason_code"],
            stay_intent_score=response_payload["stay_intent_score"],
            sdt_raw=response_payload["sdt_raw"],
            sdt_scores=response_payload["sdt_scores"],
            org_raw=response_payload["org_raw"],
            org_scores=response_payload["org_scores"],
            pull_factors_raw=response_payload["pull_factors_raw"],
            open_text_raw=response_payload["open_text_raw"],
            uwes_raw=response_payload["uwes_raw"],
            uwes_score=response_payload["uwes_score"],
            turnover_intention_raw=response_payload["turnover_intention_raw"],
            turnover_intention_score=response_payload["turnover_intention_score"],
            risk_score=response_payload["risk_score"],
            risk_band=response_payload["risk_band"],
            preventability=response_payload["preventability"],
            replacement_cost_eur=response_payload["replacement_cost_eur"],
            full_result=response_payload["full_result"],
            submitted_at=completed_at,
            scoring_version="v1.1",
        )
    )
    db.flush()
    return respondent


def _create_retention_completed_respondent(
    db: Session,
    *,
    campaign: Campaign,
    email: str,
    completed_at: datetime,
    profile_shift: dict[str, float],
) -> Respondent:
    profile = dict(_pick_profile(RETENTION_PROFILES))
    for key, delta in profile_shift.items():
        if key in profile:
            profile[key] = float(profile[key]) + delta

    department = random.choice(DEPARTMENTS)
    role_level = random.choice(ROLE_LEVELS)
    salary = random.choice(SALARIES)
    response_payload = _build_retention_response(profile)

    respondent = Respondent(
        id=str(uuid.uuid4()),
        campaign_id=campaign.id,
        department=department,
        role_level=role_level,
        annual_salary_eur=float(salary),
        email=email,
        sent_at=completed_at - timedelta(days=2),
        opened_at=completed_at - timedelta(days=1, hours=4),
        completed=True,
        completed_at=completed_at,
        token_expires_at=completed_at + timedelta(days=30),
    )
    db.add(respondent)
    db.flush()

    db.add(
        SurveyResponse(
            id=str(uuid.uuid4()),
            respondent_id=respondent.id,
            tenure_years=response_payload["tenure_years"],
            exit_reason_category=response_payload["exit_reason_category"],
            exit_reason_code=response_payload["exit_reason_code"],
            stay_intent_score=response_payload["stay_intent_score"],
            sdt_raw=response_payload["sdt_raw"],
            sdt_scores=response_payload["sdt_scores"],
            org_raw=response_payload["org_raw"],
            org_scores=response_payload["org_scores"],
            pull_factors_raw=response_payload["pull_factors_raw"],
            open_text_raw=response_payload["open_text_raw"],
            uwes_raw=response_payload["uwes_raw"],
            uwes_score=response_payload["uwes_score"],
            turnover_intention_raw=response_payload["turnover_intention_raw"],
            turnover_intention_score=response_payload["turnover_intention_score"],
            risk_score=response_payload["risk_score"],
            risk_band=response_payload["risk_band"],
            preventability=response_payload["preventability"],
            replacement_cost_eur=response_payload["replacement_cost_eur"],
            full_result=response_payload["full_result"],
            submitted_at=completed_at,
            scoring_version="v1.1",
        )
    )
    db.flush()
    return respondent


def seed_sales_demo_exit(
    db: Session,
    *,
    org_slug: str = INTERNAL_SALES_DEMO_ORG_SLUG,
    org_name: str = INTERNAL_SALES_DEMO_ORG_NAME,
    contact_email: str = INTERNAL_SALES_DEMO_CONTACT_EMAIL,
) -> dict[str, str | int]:
    random.seed(RANDOM_SEEDS["sales_demo_exit"])

    org = _get_or_create_org(db, slug=org_slug, name=org_name, contact_email=contact_email)
    _ensure_org_secret(db, org)
    _purge_named_campaigns(db, org, [fixture.name for fixture in EXIT_SALES_FIXTURES])

    for fixture in EXIT_SALES_FIXTURES:
        campaign = _create_exit_campaign(db, org=org, fixture=fixture)
        pending_count = fixture.invited - fixture.completed

        for index in range(fixture.completed):
            completed_at = campaign.created_at + timedelta(days=1, minutes=index * 11)
            _create_exit_completed_respondent(
                db,
                campaign=campaign,
                email=_safe_demo_email("sales-exit", fixture.state_label, "completed", index + 1),
                completed_at=completed_at,
            )

        for index in range(pending_count):
            sent_at = campaign.created_at + timedelta(days=1)
            _create_pending_respondent(
                db,
                campaign=campaign,
                email=_safe_demo_email("sales-exit", fixture.state_label, "pending", index + 1),
                sent_at=sent_at,
                opened=index % 2 == 0,
                exit_month="2026-03",
            )

    db.commit()
    return {
        "org_slug": org.slug,
        "campaign_count": len(EXIT_SALES_FIXTURES),
        "detail_threshold": RESPONSE_THRESHOLDS["detail"],
        "pattern_threshold": RESPONSE_THRESHOLDS["pattern"],
    }


def seed_sales_demo_retention(
    db: Session,
    *,
    org_slug: str = INTERNAL_SALES_DEMO_ORG_SLUG,
    org_name: str = INTERNAL_SALES_DEMO_ORG_NAME,
    contact_email: str = INTERNAL_SALES_DEMO_CONTACT_EMAIL,
) -> dict[str, str | int]:
    random.seed(RANDOM_SEEDS["sales_demo_retention"])

    org = _get_or_create_org(db, slug=org_slug, name=org_name, contact_email=contact_email)
    _ensure_org_secret(db, org)
    _purge_named_campaigns(db, org, [fixture.name for fixture in RETENTION_SALES_FIXTURES])

    for fixture in RETENTION_SALES_FIXTURES:
        campaign = _create_retention_campaign(db, org=org, fixture=fixture)
        pending_count = fixture.invited - fixture.completed

        for index in range(fixture.completed):
            completed_at = campaign.created_at + timedelta(days=4, minutes=index * 17)
            _create_retention_completed_respondent(
                db,
                campaign=campaign,
                email=_safe_demo_email("sales-retention", fixture.state_label, "completed", index + 1),
                completed_at=completed_at,
                profile_shift=fixture.profile_shift,
            )

        for index in range(pending_count):
            sent_at = campaign.created_at + timedelta(days=1)
            _create_pending_respondent(
                db,
                campaign=campaign,
                email=_safe_demo_email("sales-retention", fixture.state_label, "pending", index + 1),
                sent_at=sent_at,
                opened=index % 2 == 0,
            )

    db.commit()
    return {
        "org_slug": org.slug,
        "campaign_count": len(RETENTION_SALES_FIXTURES),
        "detail_threshold": RESPONSE_THRESHOLDS["detail"],
        "pattern_threshold": RESPONSE_THRESHOLDS["pattern"],
    }

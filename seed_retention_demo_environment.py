"""
Verisight - RetentieScan demo environment seed
==============================================

Zet een volledige RetentieScan-demo neer in een bestaande organisatie,
inclusief:
- vorige meting voor trend
- actuele actieve campaign
- uitnodigingen, non-responders en ingevulde responses
- segmentmetadata (department, role_level)

Gebruik:
    python seed_retention_demo_environment.py
    python seed_retention_demo_environment.py --org-slug bakker-partners-demo
"""

from __future__ import annotations

import argparse
import random
import sys
import uuid
from datetime import datetime, timedelta, timezone
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))

from backend.database import SessionLocal, init_db
from backend.models import Campaign, Organization, Respondent, SurveyResponse
from generate_voorbeeldrapport import (
    DEPARTMENTS,
    ROLE_LEVELS,
    SALARIES,
    RETENTION_PROFILES,
    _build_retention_response,
    _pick_profile,
)


CURRENT_CAMPAIGN_NAME = "RetentieScan Voorjaar 2026 Demo"
PREVIOUS_CAMPAIGN_NAME = "RetentieScan Najaar 2025 Demo"
DEFAULT_ORG_SLUG = "bakker-partners-demo"
DEFAULT_OWNER_EMAIL = "lars@verisight.nl"
SEGMENT_DEEP_DIVE_MODULES = ["segment_deep_dive"]
CURRENT_INVITED = 58
CURRENT_COMPLETED = 39
PREVIOUS_INVITED = 52
PREVIOUS_COMPLETED = 34
RANDOM_SEED = 20260413


def _parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Seed een volledige RetentieScan-demo in een bestaande Verisight-organisatie.")
    parser.add_argument("--org-slug", default=DEFAULT_ORG_SLUG, help="Slug van de organisatie waarin de demo moet landen.")
    parser.add_argument(
        "--owner-email",
        default=DEFAULT_OWNER_EMAIL,
        help="Alleen voor logging en sanity check; de organisatie moet al aan deze gebruiker hangen.",
    )
    return parser.parse_args()


def _purge_campaign(db, campaign: Campaign) -> None:
    for respondent in list(campaign.respondents):
        if respondent.response is not None:
            db.delete(respondent.response)
    db.flush()

    db.delete(campaign)
    db.flush()


def _get_org(db, slug: str) -> Organization:
    org = db.query(Organization).filter(Organization.slug == slug).first()
    if not org:
        raise RuntimeError(f"Organisatie met slug '{slug}' niet gevonden.")
    return org


def _seed_non_responders(
    *,
    db,
    campaign: Campaign,
    count: int,
    prefix: str,
    sent_at: datetime,
) -> None:
    for index in range(count):
        respondent = Respondent(
            id=str(uuid.uuid4()),
            campaign_id=campaign.id,
            department=random.choice(DEPARTMENTS),
            role_level=random.choice(ROLE_LEVELS),
            annual_salary_eur=float(random.choice(SALARIES)),
            email=f"{prefix}-pending-{index + 1:03d}@demo.verisight.local",
            sent_at=sent_at,
            opened_at=None,
            completed=False,
            completed_at=None,
        )
        db.add(respondent)


def _seed_completed_responses(
    *,
    db,
    campaign: Campaign,
    invited_count: int,
    completed_count: int,
    response_prefix: str,
    sent_at: datetime,
    completed_at_start: datetime,
    profile_shift: dict[str, float] | None = None,
) -> None:
    profile_shift = profile_shift or {}
    non_responders = invited_count - completed_count
    _seed_non_responders(
        db=db,
        campaign=campaign,
        count=non_responders,
        prefix=response_prefix,
        sent_at=sent_at,
    )

    for index in range(completed_count):
        profile = dict(_pick_profile(RETENTION_PROFILES))
        for key, delta in profile_shift.items():
            if key in profile:
                profile[key] = float(profile[key]) + delta

        department = random.choice(DEPARTMENTS)
        role = random.choice(ROLE_LEVELS)
        salary = random.choice(SALARIES)

        respondent = Respondent(
            id=str(uuid.uuid4()),
            campaign_id=campaign.id,
            department=department,
            role_level=role,
            annual_salary_eur=float(salary),
            email=f"{response_prefix}-completed-{index + 1:03d}@demo.verisight.local",
            sent_at=sent_at,
            opened_at=sent_at + timedelta(hours=2),
            completed=True,
            completed_at=completed_at_start + timedelta(minutes=index * 17),
        )
        db.add(respondent)
        db.flush()

        response_payload = _build_retention_response(profile)
        response = SurveyResponse(
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
            submitted_at=completed_at_start + timedelta(minutes=index * 17),
            scoring_version="v1.1",
        )
        db.add(response)


def _create_campaign(
    *,
    db,
    org: Organization,
    name: str,
    created_at: datetime,
    is_active: bool,
) -> Campaign:
    campaign = Campaign(
        id=str(uuid.uuid4()),
        organization_id=org.id,
        name=name,
        scan_type="retention",
        delivery_mode="baseline",
        is_active=is_active,
        enabled_modules=SEGMENT_DEEP_DIVE_MODULES,
        created_at=created_at,
        closed_at=None if is_active else created_at + timedelta(days=21),
    )
    db.add(campaign)
    db.flush()
    return campaign


def main() -> None:
    args = _parse_args()
    random.seed(RANDOM_SEED)

    init_db()
    db = SessionLocal()
    try:
        org = _get_org(db, args.org_slug)
        existing = (
            db.query(Campaign)
            .filter(
                Campaign.organization_id == org.id,
                Campaign.scan_type == "retention",
                Campaign.name.in_([CURRENT_CAMPAIGN_NAME, PREVIOUS_CAMPAIGN_NAME]),
            )
            .all()
        )
        for campaign in existing:
            _purge_campaign(db, campaign)

        now = datetime.now(timezone.utc)
        previous_created_at = now - timedelta(days=160)
        current_created_at = now - timedelta(days=14)

        previous_campaign = _create_campaign(
            db=db,
            org=org,
            name=PREVIOUS_CAMPAIGN_NAME,
            created_at=previous_created_at,
            is_active=False,
        )
        _seed_completed_responses(
            db=db,
            campaign=previous_campaign,
            invited_count=PREVIOUS_INVITED,
            completed_count=PREVIOUS_COMPLETED,
            response_prefix="retention-demo-2025",
            sent_at=previous_created_at + timedelta(days=1),
            completed_at_start=previous_created_at + timedelta(days=6),
            profile_shift={
                "lead_bias": -0.15,
                "growth_bias": -0.10,
                "work_bias": -0.10,
                "engagement_base": -0.05,
                "turnover_base": 0.15,
            },
        )

        current_campaign = _create_campaign(
            db=db,
            org=org,
            name=CURRENT_CAMPAIGN_NAME,
            created_at=current_created_at,
            is_active=True,
        )
        _seed_completed_responses(
            db=db,
            campaign=current_campaign,
            invited_count=CURRENT_INVITED,
            completed_count=CURRENT_COMPLETED,
            response_prefix="retention-demo-2026",
            sent_at=current_created_at + timedelta(days=1),
            completed_at_start=current_created_at + timedelta(days=4),
            profile_shift={
                "lead_bias": 0.10,
                "growth_bias": 0.10,
                "work_bias": 0.10,
                "engagement_base": 0.20,
                "turnover_base": -0.10,
            },
        )

        db.commit()

        print(f"RetentieScan demo-seed voltooid voor organisatie '{org.name}' ({org.slug}).")
        print(f"Aangenomen eigenaar/account: {args.owner_email}")
        print(
            f"Vorige meting: {PREVIOUS_CAMPAIGN_NAME} | invited={PREVIOUS_INVITED} completed={PREVIOUS_COMPLETED} | active=False"
        )
        print(
            f"Huidige meting: {CURRENT_CAMPAIGN_NAME} | invited={CURRENT_INVITED} completed={CURRENT_COMPLETED} | active=True"
        )
        print(f"Org ID: {org.id}")
        print(f"Current campaign ID: {current_campaign.id}")
        print(f"Previous campaign ID: {previous_campaign.id}")
    finally:
        db.close()


if __name__ == "__main__":
    main()

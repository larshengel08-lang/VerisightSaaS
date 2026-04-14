"""
Verisight - ExitScan live test fixture seed
===========================================

Zet een complete ExitScan testomgeving neer voor live checks, inclusief:
- meerdere campaigns voor de relevante dashboardstates
- een dedicated actie-campaign voor reminder/archive tests
- sample survey tokens voor valid / expired / completed / closed checks

Gebruik:
    python seed_exit_live_test_environment.py
    python seed_exit_live_test_environment.py --org-slug exitscan-live-test
    python seed_exit_live_test_environment.py --org-name "Verisight Exit QA" --contact-email qa@verisight.nl

Belangrijk:
- het script ververst alleen zijn eigen fixture-campaigns binnen de gekozen organisatie
- bestaande niet-fixture campaigns blijven ongemoeid
- organisatie-secret wordt aangemaakt als die nog ontbreekt, zodat report-routes kunnen werken
"""

from __future__ import annotations

import argparse
import random
import sys
import uuid
from dataclasses import dataclass
from datetime import datetime, timedelta, timezone
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))

from sqlalchemy import inspect, text

from backend.database import SessionLocal, init_db
from backend.models import Campaign, Organization, OrganizationSecret, Respondent, SurveyResponse
from generate_voorbeeldrapport import (
    DEPARTMENTS,
    EXIT_PROFILES,
    ROLE_LEVELS,
    SALARIES,
    _build_exit_response,
)


DEFAULT_ORG_SLUG = "exitscan-live-test"
DEFAULT_ORG_NAME = "Verisight ExitScan Live Test"
DEFAULT_CONTACT_EMAIL = "qa@verisight.nl"
RANDOM_SEED = 20260414


@dataclass(frozen=True)
class CampaignFixture:
    name: str
    delivery_mode: str
    is_active: bool
    invited: int
    completed: int
    enabled_modules: list[str] | None
    created_days_ago: int
    safe_for_actions: bool = False


FIXTURE_CAMPAIGNS: tuple[CampaignFixture, ...] = (
    CampaignFixture(
        name="ExitScan Live Test - Empty",
        delivery_mode="baseline",
        is_active=True,
        invited=0,
        completed=0,
        enabled_modules=None,
        created_days_ago=1,
    ),
    CampaignFixture(
        name="ExitScan Live Test - Early Signal",
        delivery_mode="live",
        is_active=True,
        invited=7,
        completed=4,
        enabled_modules=None,
        created_days_ago=3,
    ),
    CampaignFixture(
        name="ExitScan Live Test - Indicative",
        delivery_mode="live",
        is_active=True,
        invited=11,
        completed=8,
        enabled_modules=None,
        created_days_ago=6,
    ),
    CampaignFixture(
        name="ExitScan Live Test - Decision Ready",
        delivery_mode="live",
        is_active=True,
        invited=16,
        completed=12,
        enabled_modules=["segment_deep_dive"],
        created_days_ago=10,
    ),
    CampaignFixture(
        name="ExitScan Live Test - Closed",
        delivery_mode="baseline",
        is_active=False,
        invited=14,
        completed=11,
        enabled_modules=["segment_deep_dive"],
        created_days_ago=18,
    ),
    CampaignFixture(
        name="ExitScan Live Test - Action Safe",
        delivery_mode="live",
        is_active=True,
        invited=15,
        completed=11,
        enabled_modules=["segment_deep_dive"],
        created_days_ago=2,
        safe_for_actions=True,
    ),
)


def _parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Seed ExitScan live test fixtures.")
    parser.add_argument("--org-slug", default=DEFAULT_ORG_SLUG, help="Slug van de fixture-organisatie.")
    parser.add_argument("--org-name", default=DEFAULT_ORG_NAME, help="Naam van de fixture-organisatie.")
    parser.add_argument("--contact-email", default=DEFAULT_CONTACT_EMAIL, help="Contactadres voor de fixture-organisatie.")
    parser.add_argument("--admin-user-id", default=None, help="Supabase user ID voor Verisight-admin + owner-membership.")
    parser.add_argument("--member-user-id", action="append", default=[], help="Supabase user ID voor member-membership. Herhaalbaar.")
    parser.add_argument("--viewer-user-id", action="append", default=[], help="Supabase user ID voor viewer-membership. Herhaalbaar.")
    return parser.parse_args()


def _purge_campaign(db, campaign: Campaign) -> None:
    for respondent in list(campaign.respondents):
        if respondent.response is not None:
            db.delete(respondent.response)
    db.flush()

    db.delete(campaign)
    db.flush()


def _get_or_create_org(
    db,
    *,
    slug: str,
    name: str,
    contact_email: str,
    creator_user_id: str | None = None,
) -> Organization:
    org = db.query(Organization).filter(Organization.slug == slug).first()
    if org:
        return org

    # Live Supabase gebruikt nog een trigger die bij nieuwe organisaties direct
    # een owner-membership probeert te maken op basis van auth.uid(). Omdat dit
    # seedscript via een serviceverbinding draait, zetten we die claim hier
    # expliciet zodat de trigger niet faalt.
    if creator_user_id:
        db.execute(
            text("select set_config('request.jwt.claim.sub', :creator_user_id, true)"),
            {"creator_user_id": creator_user_id},
        )

    org = Organization(
        id=str(uuid.uuid4()),
        name=name,
        slug=slug,
        contact_email=contact_email,
        is_active=True,
    )
    db.add(org)
    db.flush()
    return org


def _ensure_org_secret(db, org: Organization) -> None:
    existing = db.query(OrganizationSecret).filter(OrganizationSecret.org_id == org.id).first()
    if existing:
        return

    db.add(OrganizationSecret(org_id=org.id))
    db.flush()


def _create_campaign(db, *, org: Organization, fixture: CampaignFixture) -> Campaign:
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


def _create_pending_respondent(
    db,
    *,
    campaign: Campaign,
    email: str,
    department: str | None = None,
    role_level: str | None = None,
    exit_month: str = "2026-03",
    sent_days_ago: int = 1,
    opened: bool = False,
    expired: bool = False,
) -> Respondent:
    sent_at = datetime.now(timezone.utc) - timedelta(days=sent_days_ago)
    respondent = Respondent(
        id=str(uuid.uuid4()),
        campaign_id=campaign.id,
        department=department or random.choice(DEPARTMENTS),
        role_level=role_level or random.choice(ROLE_LEVELS),
        exit_month=exit_month,
        annual_salary_eur=float(random.choice(SALARIES)),
        email=email,
        sent_at=sent_at,
        opened_at=sent_at + timedelta(hours=6) if opened else None,
        completed=False,
        completed_at=None,
        token_expires_at=(
            datetime.now(timezone.utc) - timedelta(days=2)
            if expired
            else datetime.now(timezone.utc) + timedelta(days=45)
        ),
    )
    db.add(respondent)
    db.flush()
    return respondent


def _has_table(db, table_name: str) -> bool:
    return inspect(db.bind).has_table(table_name)


def _ensure_role_memberships(
    db,
    *,
    org: Organization,
    admin_user_id: str | None,
    member_user_ids: list[str],
    viewer_user_ids: list[str],
) -> None:
    if not (_has_table(db, "profiles") and _has_table(db, "org_members")):
        return

    assignments: list[tuple[str, str, bool]] = []
    if admin_user_id:
        assignments.append((admin_user_id, "owner", True))
    assignments.extend((user_id, "member", False) for user_id in member_user_ids)
    assignments.extend((user_id, "viewer", False) for user_id in viewer_user_ids)

    for user_id, role, is_admin in assignments:
        db.execute(
            text(
                """
                insert into public.profiles (id, is_verisight_admin)
                values (:user_id, :is_admin)
                on conflict (id) do update
                set is_verisight_admin = excluded.is_verisight_admin
                """
            ),
            {"user_id": user_id, "is_admin": is_admin},
        )
        db.execute(
            text(
                """
                insert into public.org_members (org_id, user_id, role)
                values (:org_id, :user_id, :role)
                on conflict (org_id, user_id) do update
                set role = excluded.role
                """
            ),
            {"org_id": org.id, "user_id": user_id, "role": role},
        )


def _create_completed_response(
    db,
    *,
    campaign: Campaign,
    respondent_email: str,
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
        email=respondent_email,
        sent_at=completed_at - timedelta(days=2),
        opened_at=completed_at - timedelta(days=1, hours=6),
        completed=True,
        completed_at=completed_at,
        token_expires_at=completed_at + timedelta(days=30),
    )
    db.add(respondent)
    db.flush()

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
        submitted_at=completed_at,
        scoring_version="v1.1",
    )
    db.add(response)
    db.flush()
    return respondent


def _pick_exit_profile() -> dict[str, float | str]:
    r = random.random()
    cumulative = 0.0
    for profile in EXIT_PROFILES:
        cumulative += profile[1]
        if r <= cumulative:
            (
                name,
                _weight,
                sdt_b,
                lead_b,
                growth_b,
                work_b,
                culture_b,
                comp_b,
                role_b,
                reason_category,
                reason_code,
            ) = profile
            return {
                "name": name,
                "sdt_bias": sdt_b,
                "lead_bias": lead_b,
                "growth_bias": growth_b,
                "work_bias": work_b,
                "culture_bias": culture_b,
                "compensation_bias": comp_b,
                "role_bias": role_b,
                "reason_category": reason_category,
                "reason_code": reason_code,
            }

    fallback = EXIT_PROFILES[-1]
    return {
        "name": fallback[0],
        "sdt_bias": fallback[2],
        "lead_bias": fallback[3],
        "growth_bias": fallback[4],
        "work_bias": fallback[5],
        "culture_bias": fallback[6],
        "compensation_bias": fallback[7],
        "role_bias": fallback[8],
        "reason_category": fallback[9],
        "reason_code": fallback[10],
    }


def main() -> None:
    args = _parse_args()
    random.seed(RANDOM_SEED)

    init_db()
    db = SessionLocal()

    try:
        org = _get_or_create_org(
            db,
            slug=args.org_slug,
            name=args.org_name,
            contact_email=args.contact_email,
            creator_user_id=args.admin_user_id,
        )
        _ensure_org_secret(db, org)
        _ensure_role_memberships(
            db,
            org=org,
            admin_user_id=args.admin_user_id,
            member_user_ids=args.member_user_id,
            viewer_user_ids=args.viewer_user_id,
        )

        existing = (
            db.query(Campaign)
            .filter(Campaign.organization_id == org.id)
            .filter(Campaign.name.in_([fixture.name for fixture in FIXTURE_CAMPAIGNS]))
            .all()
        )
        for campaign in existing:
            _purge_campaign(db, campaign)

        campaign_map: dict[str, Campaign] = {}
        sample_tokens: dict[str, str] = {}

        for fixture in FIXTURE_CAMPAIGNS:
            campaign = _create_campaign(db, org=org, fixture=fixture)
            campaign_map[fixture.name] = campaign

            pending_needed = fixture.invited - fixture.completed
            for idx in range(fixture.completed):
                completed_at = campaign.created_at + timedelta(days=1, minutes=idx * 11)
                respondent = _create_completed_response(
                    db,
                    campaign=campaign,
                    respondent_email=f"{args.org_slug}-{fixture.name.lower().replace(' ', '-')}-completed-{idx + 1:03d}@demo.verisight.local",
                    completed_at=completed_at,
                )
                if fixture.name == "ExitScan Live Test - Decision Ready" and idx == 0:
                    sample_tokens["completed_token"] = respondent.token

            for idx in range(pending_needed):
                email = f"{args.org_slug}-{fixture.name.lower().replace(' ', '-')}-pending-{idx + 1:03d}@demo.verisight.local"
                if fixture.name == "ExitScan Live Test - Action Safe" and idx == 0:
                    respondent = _create_pending_respondent(
                        db,
                        campaign=campaign,
                        email=email,
                        opened=True,
                        expired=False,
                    )
                    sample_tokens["valid_open_token"] = respondent.token
                    continue
                if fixture.name == "ExitScan Live Test - Action Safe" and idx == 1:
                    respondent = _create_pending_respondent(
                        db,
                        campaign=campaign,
                        email=email,
                        opened=True,
                        expired=True,
                    )
                    sample_tokens["expired_token"] = respondent.token
                    continue
                if fixture.name == "ExitScan Live Test - Closed" and idx == 0:
                    respondent = _create_pending_respondent(
                        db,
                        campaign=campaign,
                        email=email,
                        opened=True,
                        expired=False,
                    )
                    sample_tokens["closed_campaign_token"] = respondent.token
                    continue

                _create_pending_respondent(
                    db,
                    campaign=campaign,
                    email=email,
                    opened=idx % 2 == 0,
                    expired=False,
                )

        db.commit()

        print(f"ExitScan live test fixtures seeded voor organisatie '{org.name}' ({org.slug})")
        print(f"Org ID: {org.id}")
        print("")
        print("Campaign fixtures:")
        for fixture in FIXTURE_CAMPAIGNS:
            campaign = campaign_map[fixture.name]
            print(
                f"- {fixture.name}"
                f" | id={campaign.id}"
                f" | active={campaign.is_active}"
                f" | mode={campaign.delivery_mode or 'baseline'}"
                f" | invited={fixture.invited}"
                f" | completed={fixture.completed}"
                f"{' | safe_for_actions=yes' if fixture.safe_for_actions else ''}"
            )

        print("")
        print("Sample survey tokens:")
        print(f"- valid_open_token: {sample_tokens.get('valid_open_token', 'n/a')}")
        print(f"- expired_token: {sample_tokens.get('expired_token', 'n/a')}")
        print(f"- completed_token: {sample_tokens.get('completed_token', 'n/a')}")
        print(f"- closed_campaign_token: {sample_tokens.get('closed_campaign_token', 'n/a')}")
        print("- invalid_token: gebruik een willekeurige niet-bestaande token voor de negatieve check")
        print("")
        print("Nog handmatig nodig voor volledige live uitvoering:")
        if args.admin_user_id or args.member_user_id or args.viewer_user_id:
            print("- opgegeven user IDs zijn aan de organisatie gekoppeld voor hun rol")
        else:
            print("- koppel of nodig viewer/member accounts uit via de bestaande beheerflow of geef user IDs mee aan het script")
        print("- gebruik een account zonder membership voor de 'geen toegang'-check")
        print("- voer reminder/archive alleen uit op 'ExitScan Live Test - Action Safe'")
    finally:
        db.close()


if __name__ == "__main__":
    main()

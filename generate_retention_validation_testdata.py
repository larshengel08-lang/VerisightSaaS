from __future__ import annotations

import argparse
import os
import random
import sys
import uuid
from datetime import datetime, timezone
from pathlib import Path


def _bootstrap_path() -> Path:
    root = Path(__file__).resolve().parent
    sys.path.insert(0, str(root))
    return root


def _configure_database_url(db_path: str) -> None:
    os.environ["DATABASE_URL"] = f"sqlite:///{Path(db_path).resolve()}"


RETENTION_PROFILES = [
    {
        "name": "stabiel",
        "weight": 0.30,
        "sdt_bias": 0.8,
        "lead_bias": 0.7,
        "growth_bias": 0.5,
        "work_bias": 0.4,
        "engagement_bias": 0.9,
        "turnover_bias": -1.0,
        "stay_bias": 1.0,
    },
    {
        "name": "vroegsignaal_groei",
        "weight": 0.25,
        "sdt_bias": -0.1,
        "lead_bias": 0.0,
        "growth_bias": -1.1,
        "work_bias": 0.0,
        "engagement_bias": -0.2,
        "turnover_bias": 0.4,
        "stay_bias": -0.1,
    },
    {
        "name": "leiderschap_en_cultuur",
        "weight": 0.20,
        "sdt_bias": -0.6,
        "lead_bias": -1.3,
        "growth_bias": -0.2,
        "work_bias": 0.0,
        "engagement_bias": -0.5,
        "turnover_bias": 0.8,
        "stay_bias": -0.6,
    },
    {
        "name": "werkdruk",
        "weight": 0.15,
        "sdt_bias": -0.5,
        "lead_bias": 0.1,
        "growth_bias": -0.1,
        "work_bias": -1.4,
        "engagement_bias": -0.7,
        "turnover_bias": 0.8,
        "stay_bias": -0.7,
    },
    {
        "name": "scherp_signaal",
        "weight": 0.10,
        "sdt_bias": -1.1,
        "lead_bias": -1.0,
        "growth_bias": -1.0,
        "work_bias": -1.2,
        "engagement_bias": -1.0,
        "turnover_bias": 1.2,
        "stay_bias": -1.1,
    },
]

DEPARTMENTS = ["Operations", "Sales", "Finance", "People", "IT"]
ROLE_LEVELS = ["uitvoerend", "specialist", "senior", "manager"]


def _pick_profile() -> dict[str, float | str]:
    draw = random.random()
    cursor = 0.0
    for profile in RETENTION_PROFILES:
        cursor += float(profile["weight"])
        if draw <= cursor:
            return profile
    return RETENTION_PROFILES[-1]


def _likert(base: float, bias: float = 0.0, reverse: bool = False) -> int:
    raw = base + bias + random.gauss(0, 0.55)
    raw = max(1.0, min(5.0, raw))
    if reverse:
        raw = 6.0 - raw
    return int(round(raw))


def _sdt_items(profile: dict[str, float | str]) -> dict[str, int]:
    base = 3.2 + float(profile["sdt_bias"])
    return {
        "B1": _likert(base),
        "B2": _likert(base),
        "B3": _likert(base),
        "B4": _likert(base, reverse=True),
        "B5": _likert(base + 0.2),
        "B6": _likert(base + 0.2),
        "B7": _likert(base + 0.2),
        "B8": _likert(base + 0.2, reverse=True),
        "B9": _likert(base + 0.1),
        "B10": _likert(base + 0.1),
        "B11": _likert(base + 0.1),
        "B12": _likert(base + 0.1, reverse=True),
    }


def _org_items(profile: dict[str, float | str]) -> dict[str, int]:
    base = 3.1
    lead = float(profile["lead_bias"])
    growth = float(profile["growth_bias"])
    work = float(profile["work_bias"])
    return {
        "leadership_1": _likert(base + lead),
        "leadership_2": _likert(base + lead),
        "leadership_3": _likert(base + lead),
        "culture_1": _likert(base + lead / 2),
        "culture_2": _likert(base + lead / 2),
        "culture_3": _likert(base + lead / 2),
        "growth_1": _likert(base + growth),
        "growth_2": _likert(base + growth),
        "growth_3": _likert(base + growth),
        "compensation_1": _likert(base + 0.1),
        "compensation_2": _likert(base + 0.1),
        "compensation_3": _likert(base),
        "workload_1": _likert(base + work),
        "workload_2": _likert(base + work),
        "workload_3": _likert(base + work),
        "role_clarity_1": _likert(base + 0.2),
        "role_clarity_2": _likert(base + 0.2),
        "role_clarity_3": _likert(base + 0.2),
    }


def _uwes_items(profile: dict[str, float | str]) -> dict[str, int]:
    base = 3.3 + float(profile["engagement_bias"])
    return {
        "uwes_1": _likert(base),
        "uwes_2": _likert(base),
        "uwes_3": _likert(base),
    }


def _turnover_items(profile: dict[str, float | str]) -> dict[str, int]:
    base = 2.6 + float(profile["turnover_bias"])
    return {
        "ti_1": _likert(base),
        "ti_2": _likert(base),
    }


def _stay_intent(profile: dict[str, float | str]) -> int:
    base = 3.0 + float(profile["stay_bias"])
    return _likert(base)


def main() -> None:
    parser = argparse.ArgumentParser(description="Genereer synthetische RetentieScan-validatiedata.")
    parser.add_argument("--db-path", default="data/retention_validation_demo.db", help="Doel SQLite database.")
    parser.add_argument("--responses", type=int, default=180, help="Aantal responses.")
    parser.add_argument("--seed", type=int, default=42, help="Random seed.")
    args = parser.parse_args()

    random.seed(args.seed)
    root = _bootstrap_path()
    _configure_database_url(str((root / args.db_path).resolve()))

    from backend.database import SessionLocal, init_db
    from backend.models import Campaign, Organization, OrganizationSecret, Respondent, SurveyResponse
    from backend.products.retention.scoring import score_submission

    class Payload:
        def __init__(self, sdt_raw, org_raw, uwes_raw, turnover_intention_raw, stay_intent_score):
            self.sdt_raw = sdt_raw
            self.org_raw = org_raw
            self.uwes_raw = uwes_raw
            self.turnover_intention_raw = turnover_intention_raw
            self.stay_intent_score = stay_intent_score
            self.tenure_years = None
            self.exit_reason_category = None
            self.exit_reason_code = None
            self.pull_factors_raw = {}
            self.open_text = None

    init_db()
    db = SessionLocal()
    try:
        org = Organization(
            name="RetentieScan Demo",
            slug=f"retentie-validation-{uuid.uuid4().hex[:8]}",
            contact_email="people@example.com",
        )
        db.add(org)
        db.flush()
        db.add(OrganizationSecret(org_id=org.id, api_key=f"validation-{uuid.uuid4().hex[:12]}"))

        campaign = Campaign(
            organization_id=org.id,
            name="RetentieScan Validatie Demo",
            scan_type="retention",
            delivery_mode="baseline",
            is_active=False,
            enabled_modules=["segment_deep_dive"],
        )
        db.add(campaign)
        db.flush()

        for _ in range(args.responses):
            profile = _pick_profile()
            respondent = Respondent(
                campaign_id=campaign.id,
                department=random.choice(DEPARTMENTS),
                role_level=random.choice(ROLE_LEVELS),
                completed=True,
                sent_at=datetime.now(timezone.utc),
                opened_at=datetime.now(timezone.utc),
                completed_at=datetime.now(timezone.utc),
            )
            db.add(respondent)
            db.flush()

            payload = Payload(
                sdt_raw=_sdt_items(profile),
                org_raw=_org_items(profile),
                uwes_raw=_uwes_items(profile),
                turnover_intention_raw=_turnover_items(profile),
                stay_intent_score=_stay_intent(profile),
            )

            score = score_submission(
                payload=payload,
                campaign=campaign,
                respondent=respondent,
                contributing_reason_codes=[],
            )

            response = SurveyResponse(
                respondent_id=respondent.id,
                tenure_years=None,
                exit_reason_category=None,
                exit_reason_code=None,
                stay_intent_score=payload.stay_intent_score,
                sdt_raw=payload.sdt_raw,
                sdt_scores=score["sdt_scores"],
                org_raw=payload.org_raw,
                org_scores=score["org_scores"],
                pull_factors_raw={},
                open_text_raw=None,
                open_text_analysis=None,
                uwes_raw=payload.uwes_raw,
                uwes_score=score["uwes_score"],
                turnover_intention_raw=payload.turnover_intention_raw,
                turnover_intention_score=score["turnover_intention_score"],
                risk_score=score["risk_result"]["risk_score"],
                risk_band=score["risk_result"]["risk_band"],
                preventability=None,
                replacement_cost_eur=None,
                full_result=score["full_result"],
                submitted_at=datetime.now(timezone.utc),
                scoring_version=score["scoring_version"],
            )
            db.add(response)

        db.commit()
        print(
            f"Gegenereerd: {args.responses} RetentieScan demo-responses in {Path(args.db_path).resolve()}"
        )
    finally:
        db.close()


if __name__ == "__main__":
    main()

"""
Verisight - Voorbeeldrapport Generator
======================================
Genereert een fictief ExitScan- of RetentieScan-rapport met synthetische data.

Gebruik:
    python generate_voorbeeldrapport.py
    python generate_voorbeeldrapport.py retention
    python generate_voorbeeldrapport.py exit --keep-data
"""

from __future__ import annotations

import argparse
import random
import sys
import uuid
from datetime import datetime, timezone
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))

from backend.database import SessionLocal, init_db
from backend.models import Campaign, Organization, Respondent, SurveyResponse
from backend.report import generate_campaign_report
from backend.scoring import (
    anonymize_text,
    compute_org_scores,
    compute_preventability,
    compute_replacement_cost,
    compute_retention_risk,
    compute_retention_signal_profile,
    compute_retention_supplemental_scores,
    compute_sdt_scores,
    get_recommendations,
)


RANDOM_SEED = 2026
random.seed(RANDOM_SEED)

DEMO_ORG_NAME = "TechBouw B.V."
DEMO_ORG_SLUG = "techbouw-demo"
DEMO_ORG_EMAIL = "demo@techbouw.nl"

DEPARTMENTS = [
    "Operations", "Operations", "Operations",
    "Finance", "Finance",
    "Sales", "Sales",
    "HR",
    "IT",
    "Marketing",
    "Customer Success",
]
ROLE_LEVELS = [
    "specialist", "specialist", "senior",
    "manager", "uitvoerend", "uitvoerend",
]
SALARIES = [38_000, 42_000, 48_000, 52_000, 58_000, 65_000, 74_000]
TENURES = [0.5, 1.0, 1.5, 2.0, 2.0, 3.0, 4.0, 5.5, 7.0]

EXIT_CONFIG = {
    "scan_type": "exit",
    "campaign_name": "ExitScan Q1 2026",
    "output_name": "docs/examples/voorbeeldrapport_verisight.pdf",
    "invited": 51,
    "responses": 35,
}

RETENTION_CONFIG = {
    "scan_type": "retention",
    "campaign_name": "RetentieScan Voorjaar 2026",
    "output_name": "docs/examples/voorbeeldrapport_retentiescan.pdf",
    "invited": 58,
    "responses": 39,
}

EXIT_PROFILES = [
    (
        "leiderschap_probleem", 0.34,
        -1.4, -2.0, -0.4, 0.4, 0.0, 0.0, 0.0,
        "leiderschap", "P1",
    ),
    (
        "groei_frustratie", 0.31,
        -0.7, -0.3, -2.8, 0.0, 0.0, 0.0, 0.0,
        "groei", "P3",
    ),
    (
        "werkdruk", 0.14,
        0.0, 0.0, -0.2, -1.9, 0.0, 0.0, 0.0,
        "werkdruk", "P5",
    ),
    (
        "pull_aanbod", 0.12,
        0.6, 0.6, 0.4, 0.1, 0.0, 0.0, 0.0,
        "beter_aanbod", "PL1",
    ),
    (
        "persoonlijk", 0.09,
        0.1, 0.2, 0.2, 0.0, 0.0, 0.0, 0.0,
        "persoonlijk", "S1",
    ),
]

RETENTION_PROFILES = [
    (
        "bevlogen_kern", 0.24,
        0.9, 0.7, 0.5, 0.6, 0.5, 0.4, 0.3,
        4.7, 1.4,
    ),
    (
        "groei_twijfel", 0.25,
        -0.1, 0.2, -1.6, 0.0, 0.1, 0.0, 0.1,
        3.2, 2.8,
    ),
    (
        "werkdruk_oplopend", 0.22,
        -0.5, -0.3, -0.4, -1.8, -0.1, 0.0, 0.0,
        2.8, 3.5,
    ),
    (
        "leiding_onzeker", 0.18,
        -0.8, -1.9, -0.4, -0.5, -0.8, -0.1, -0.1,
        2.6, 3.9,
    ),
    (
        "voorwaarden_spanning", 0.11,
        -0.2, -0.1, -0.3, 0.1, 0.0, -1.5, 0.1,
        3.0, 3.1,
    ),
]

EXIT_OPEN_TEXTS = [
    "Mijn manager gaf nooit feedback en was zelden beschikbaar voor overleg.",
    "Er was weinig ruimte voor eigen initiatief. Alles moest via de manager.",
    "Ik had het gevoel dat mijn ontwikkeling er niet toe deed voor de organisatie.",
    "De werkdruk was structureel te hoog. Na drukke periodes was er geen herstelruimte.",
    "Ik heb een betere kans gekregen elders met meer verantwoordelijkheid en salaris.",
    "Persoonlijke omstandigheden maakten de huidige functie niet meer haalbaar.",
    "Weinig transparantie over beslissingen. Ik wist nooit waar ik aan toe was.",
    "Mooie organisatie, maar voor mij geen zichtbare doorgroeimogelijkheden.",
    "De teamcultuur voelde gesloten. Nieuwe ideeen werden zelden serieus genomen.",
    "Ik miste erkenning voor mijn bijdrage, ook bij goede resultaten.",
    "",
    "",
]

RETENTION_OPEN_TEXTS = [
    "Meer voorspelbaarheid in planning zou mijn werkdruk direct verlagen.",
    "Ik zou vaker inhoudelijke feedback en coaching van mijn leidinggevende willen.",
    "Een concreet groeipad binnen mijn functie zou mij helpen om hier langer te blijven.",
    "De samenwerking tussen afdelingen kan veel soepeler; nu kost het veel energie.",
    "Meer flexibiliteit in werktijden zou mijn werk beter vol te houden maken.",
    "Ik mis erkenning wanneer het team onder hoge druk goede resultaten neerzet.",
    "Meer duidelijkheid over verantwoordelijkheden zou veel frustratie voorkomen.",
    "Ik zou meer ruimte willen om zelf beslissingen te nemen in mijn werk.",
    "Als de bezetting structureel beter wordt, blijft mijn energie ook hoger.",
    "",
    "",
]

STAY_INTENT_MAP = {
    "leiderschap_probleem": [3, 4, 4, 5],
    "groei_frustratie": [3, 4, 4],
    "werkdruk": [2, 3, 4],
    "pull_aanbod": [1, 2],
    "persoonlijk": [1, 1, 2],
}

CONTRIBUTING_REASON_MAP = {
    "leiderschap_probleem": ["P3", "P6"],
    "groei_frustratie": ["P1", "P4"],
    "werkdruk": ["P6", "P1"],
    "pull_aanbod": ["P3", "P4"],
    "persoonlijk": [],
}


def _pick_profile(profiles: list[tuple]) -> dict[str, float | str]:
    r = random.random()
    cumulative = 0.0
    for profile in profiles:
        cumulative += profile[1]
        if r <= cumulative:
            if isinstance(profile[-1], (int, float)) and isinstance(profile[-2], (int, float)):
                (
                    name, _weight,
                    sdt_b, lead_b, growth_b, work_b, culture_b, comp_b, role_b,
                    engagement_b, turnover_b,
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
                    "engagement_base": engagement_b,
                    "turnover_base": turnover_b,
                }

            (
                name, _weight,
                sdt_b, lead_b, growth_b, work_b, culture_b, comp_b, role_b,
                reason_category, reason_code,
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
    return {
        "name": "fallback",
        "sdt_bias": 0.0,
        "lead_bias": 0.0,
        "growth_bias": 0.0,
        "work_bias": 0.0,
        "culture_bias": 0.0,
        "compensation_bias": 0.0,
        "role_bias": 0.0,
    }


def _likert(base: float, bias: float = 0.0, reverse: bool = False) -> int:
    raw = base + bias + random.gauss(0, 0.6)
    raw = max(1.0, min(5.0, raw))
    if reverse:
        raw = 6.0 - raw
    return int(round(raw))


def _sdt_items(sdt_bias: float) -> dict[str, int]:
    base = 3.3 + sdt_bias
    return {
        "B1": _likert(base),
        "B2": _likert(base),
        "B3": _likert(base),
        "B4": _likert(base, reverse=True),
        "B5": _likert(base + 0.4),
        "B6": _likert(base + 0.4),
        "B7": _likert(base + 0.4),
        "B8": _likert(base + 0.4, reverse=True),
        "B9": _likert(base + 0.2),
        "B10": _likert(base + 0.2),
        "B11": _likert(base + 0.2),
        "B12": _likert(base + 0.2, reverse=True),
    }


def _org_items(
    lead_bias: float,
    growth_bias: float,
    work_bias: float,
    culture_bias: float = 0.0,
    compensation_bias: float = 0.0,
    role_bias: float = 0.0,
) -> dict[str, int]:
    base = 3.35
    return {
        "leadership_1": _likert(base + lead_bias),
        "leadership_2": _likert(base + lead_bias),
        "leadership_3": _likert(base + lead_bias),
        "culture_1": _likert(base + 0.5 + culture_bias),
        "culture_2": _likert(base + 0.5 + culture_bias),
        "culture_3": _likert(base + 0.5 + culture_bias),
        "growth_1": _likert(base + growth_bias),
        "growth_2": _likert(base + growth_bias),
        "growth_3": _likert(base + growth_bias),
        "compensation_1": _likert(base + 0.4 + compensation_bias),
        "compensation_2": _likert(base + 0.4 + compensation_bias),
        "compensation_3": _likert(base + 0.2 + compensation_bias),
        "workload_1": _likert(base + work_bias),
        "workload_2": _likert(base + work_bias),
        "workload_3": _likert(base + work_bias),
        "role_clarity_1": _likert(base + 0.3 + role_bias),
        "role_clarity_2": _likert(base + 0.3 + role_bias),
        "role_clarity_3": _likert(base + 0.3 + role_bias),
    }


def _uwes_items(base: float) -> dict[str, int]:
    return {
        "uwes_1": _likert(base),
        "uwes_2": _likert(base + 0.1),
        "uwes_3": _likert(base + 0.2),
    }


def _turnover_items(base: float) -> dict[str, int]:
    return {
        "ti_1": _likert(base),
        "ti_2": _likert(base + 0.1),
    }


def _stay_intent(turnover_base: float) -> int:
    return _likert(max(1.2, 5.4 - turnover_base))


def _get_or_create_demo_org(db) -> tuple[Organization, bool]:
    org = db.query(Organization).first()
    if org:
        return org, False

    org = Organization(
        id=str(uuid.uuid4()),
        name=DEMO_ORG_NAME,
        slug=DEMO_ORG_SLUG,
        contact_email=DEMO_ORG_EMAIL,
        is_active=True,
    )
    db.add(org)
    db.flush()
    return org, True


def _purge_campaign(db, campaign: Campaign) -> None:
    respondents = list(campaign.respondents)
    for respondent in respondents:
        if respondent.response is not None:
            db.delete(respondent.response)
    db.flush()

    db.delete(campaign)
    db.flush()


def _parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Genereer een fictief Verisight-rapport.")
    parser.add_argument(
        "scan_type",
        nargs="?",
        default="exit",
        choices=["exit", "retention"],
        help="Welk rapporttype je wilt genereren.",
    )
    parser.add_argument(
        "--keep-data",
        action="store_true",
        help="Laat de tijdelijke demo-campagne in de database staan.",
    )
    return parser.parse_args()


def _build_exit_response(profile: dict[str, float | str], salary: int, role: str) -> dict:
    stay_intent = random.choice(STAY_INTENT_MAP.get(str(profile["name"]), [2, 3, 4]))
    text = random.choice(EXIT_OPEN_TEXTS)

    sdt_raw = _sdt_items(float(profile["sdt_bias"]))
    org_raw = _org_items(
        float(profile["lead_bias"]),
        float(profile["growth_bias"]),
        float(profile["work_bias"]),
        float(profile["culture_bias"]),
        float(profile["compensation_bias"]),
        float(profile["role_bias"]),
    )

    sdt_scores = compute_sdt_scores(sdt_raw)
    org_scores = compute_org_scores(org_raw)
    risk_result = compute_retention_risk(sdt_scores, org_scores)
    prev_result = compute_preventability(
        exit_reason_category=str(profile["reason_category"]),
        stay_intent_score=stay_intent,
        sdt_scores=sdt_scores,
        org_scores=org_scores,
        contributing_reason_codes=CONTRIBUTING_REASON_MAP.get(str(profile["name"]), []),
    )
    replacement_cost = compute_replacement_cost(salary, role)

    full_result = {
        "sdt_scores": sdt_scores,
        "org_scores": org_scores,
        "risk_result": risk_result,
        "preventability_result": prev_result,
        "recommendations": get_recommendations(risk_result["factor_risks"]),
    }

    return {
        "tenure_years": random.choice(TENURES),
        "exit_reason_category": str(profile["reason_category"]),
        "exit_reason_code": str(profile["reason_code"]),
        "stay_intent_score": stay_intent,
        "sdt_raw": sdt_raw,
        "sdt_scores": sdt_scores,
        "org_raw": org_raw,
        "org_scores": org_scores,
        "pull_factors_raw": {code: 1 for code in CONTRIBUTING_REASON_MAP.get(str(profile["name"]), [])},
        "open_text_raw": anonymize_text(text) if text else None,
        "uwes_raw": {},
        "uwes_score": None,
        "turnover_intention_raw": {},
        "turnover_intention_score": None,
        "risk_score": risk_result["risk_score"],
        "risk_band": risk_result["risk_band"],
        "preventability": prev_result["preventability"],
        "replacement_cost_eur": replacement_cost["cost_per_employee"],
        "full_result": full_result,
    }


def _build_retention_response(profile: dict[str, float | str]) -> dict:
    text = random.choice(RETENTION_OPEN_TEXTS)

    sdt_raw = _sdt_items(float(profile["sdt_bias"]))
    org_raw = _org_items(
        float(profile["lead_bias"]),
        float(profile["growth_bias"]),
        float(profile["work_bias"]),
        float(profile["culture_bias"]),
        float(profile["compensation_bias"]),
        float(profile["role_bias"]),
    )
    uwes_raw = _uwes_items(float(profile["engagement_base"]))
    turnover_raw = _turnover_items(float(profile["turnover_base"]))

    sdt_scores = compute_sdt_scores(sdt_raw)
    org_scores = compute_org_scores(org_raw)
    risk_result = compute_retention_risk(sdt_scores, org_scores, scan_type="retention")
    stay_intent = _stay_intent(float(profile["turnover_base"]))
    supplemental = compute_retention_supplemental_scores(uwes_raw, turnover_raw, stay_intent)

    retention_summary = {
        "retention_signal_score": risk_result["risk_score"],
        "retention_signal_band": risk_result["risk_band"],
        "engagement_score": supplemental["engagement_score"],
        "turnover_intention_score": supplemental["turnover_intention_score"],
        "stay_intent_score": supplemental["stay_intent_score"],
        "signal_profile": compute_retention_signal_profile(
            risk_score=risk_result["risk_score"],
            engagement_score=supplemental["engagement_score"],
            turnover_intention_score=supplemental["turnover_intention_score"],
            stay_intent_score=supplemental["stay_intent_score"],
        ),
    }

    full_result = {
        "sdt_scores": sdt_scores,
        "org_scores": org_scores,
        "risk_result": risk_result,
        "recommendations": get_recommendations(risk_result["factor_risks"]),
        "uwes_score": supplemental["engagement_score"],
        "turnover_intention_score": supplemental["turnover_intention_score"],
        "stay_intent_signal_score": supplemental["stay_intent_score"],
        "retention_summary": retention_summary,
    }

    return {
        "tenure_years": None,
        "exit_reason_category": None,
        "exit_reason_code": None,
        "stay_intent_score": stay_intent,
        "sdt_raw": sdt_raw,
        "sdt_scores": sdt_scores,
        "org_raw": org_raw,
        "org_scores": org_scores,
        "pull_factors_raw": {},
        "open_text_raw": anonymize_text(text) if text else None,
        "uwes_raw": uwes_raw,
        "uwes_score": supplemental["engagement_score"],
        "turnover_intention_raw": turnover_raw,
        "turnover_intention_score": supplemental["turnover_intention_score"],
        "risk_score": risk_result["risk_score"],
        "risk_band": risk_result["risk_band"],
        "preventability": None,
        "replacement_cost_eur": None,
        "full_result": full_result,
    }


def main() -> None:
    args = _parse_args()
    config = RETENTION_CONFIG if args.scan_type == "retention" else EXIT_CONFIG

    init_db()
    db = SessionLocal()

    org, created_org = _get_or_create_demo_org(db)
    existing_demo_campaigns = (
        db.query(Campaign)
        .filter(
            Campaign.organization_id == org.id,
            Campaign.name == config["campaign_name"],
            Campaign.scan_type == config["scan_type"],
        )
        .all()
    )
    for existing_campaign in existing_demo_campaigns:
        _purge_campaign(db, existing_campaign)

    campaign = Campaign(
        id=str(uuid.uuid4()),
        organization_id=org.id,
        name=config["campaign_name"],
        scan_type=config["scan_type"],
        is_active=False,
    )
    db.add(campaign)
    db.flush()

    invited = int(config["invited"])
    responses = int(config["responses"])
    non_responders = invited - responses

    print(f"Organisatie:   {org.name}")
    print(f"Demo-campagne: {campaign.name}")
    print(f"Scantype:      {campaign.scan_type}")
    print(f"Uitgenodigden: {invited}  |  Ingevuld: {responses}  |  Respons: {responses / invited * 100:.1f}%")
    print("")

    for _ in range(non_responders):
        respondent = Respondent(
            id=str(uuid.uuid4()),
            campaign_id=campaign.id,
            department=random.choice(DEPARTMENTS),
            role_level=random.choice(ROLE_LEVELS),
            annual_salary_eur=float(random.choice(SALARIES)),
            sent_at=datetime.now(timezone.utc),
            opened_at=None,
            completed=False,
            completed_at=None,
        )
        db.add(respondent)

    print(f"  {non_responders} non-responders aangemaakt")
    print(f"  Genereer {responses} ingevulde responses...")
    print("")

    profiles = RETENTION_PROFILES if campaign.scan_type == "retention" else EXIT_PROFILES

    for index in range(responses):
        profile = _pick_profile(profiles)
        department = random.choice(DEPARTMENTS)
        role = random.choice(ROLE_LEVELS)
        salary = random.choice(SALARIES)

        respondent = Respondent(
            id=str(uuid.uuid4()),
            campaign_id=campaign.id,
            department=department,
            role_level=role,
            annual_salary_eur=float(salary),
            sent_at=datetime.now(timezone.utc),
            opened_at=datetime.now(timezone.utc),
            completed=True,
            completed_at=datetime.now(timezone.utc),
        )
        db.add(respondent)
        db.flush()

        if campaign.scan_type == "retention":
            response_payload = _build_retention_response(profile)
            print(
                f"  [{index + 1:02d}] {department:<16} {role:<12} "
                f"retentiesignaal {response_payload['risk_score']:.1f}  "
                f"bevlogenheid {response_payload['uwes_score']:.1f}  "
                f"vertrekintentie {response_payload['turnover_intention_score']:.1f}  "
                f"stay-intent {response_payload['full_result']['retention_summary']['stay_intent_score']:.1f}"
            )
        else:
            response_payload = _build_exit_response(profile, salary, role)
            print(
                f"  [{index + 1:02d}] {department:<16} {role:<12} "
                f"risico {response_payload['risk_score']:.1f}  "
                f"preventability={response_payload['preventability']:<18}  "
                f"reden={response_payload['exit_reason_code']}"
            )

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
        )
        db.add(response)

    db.commit()
    print("")
    print(f"{invited} respondenten totaal opgeslagen ({responses} ingevuld). Rapport genereren...")

    pdf_bytes = generate_campaign_report(campaign.id, db)
    output_path = Path(__file__).parent / str(config["output_name"])
    output_path.parent.mkdir(parents=True, exist_ok=True)
    output_path.write_bytes(pdf_bytes)

    print(f"Rapport opgeslagen: {output_path}")
    print(f"Grootte: {len(pdf_bytes) / 1024:.1f} KB")

    if args.keep_data:
        print("Demo-data behouden in de database.")
        db.close()
        return

    _purge_campaign(db, campaign)
    if created_org:
        db.delete(org)
    db.commit()
    db.close()
    print("Tijdelijke demo-data verwijderd uit de database.")


if __name__ == "__main__":
    main()

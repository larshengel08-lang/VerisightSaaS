"""
Loep - Voorbeeldrapport Generator
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

from sqlalchemy import Engine, create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

sys.path.insert(0, str(Path(__file__).resolve().parent))

from backend.database import Base, DATABASE_URL, SessionLocal, init_db
from backend.models import Campaign, Organization, Respondent, SurveyResponse
from backend.products.shared.deepening import compute_deepening_offers
from backend.report_html import generate_campaign_report_html as generate_campaign_report_html
from backend.report import generate_campaign_report as _generate_campaign_report_legacy
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
_IS_SQLITE = DATABASE_URL.startswith("sqlite")

DEMO_ORG_NAME = "TechBouw B.V."
DEMO_ORG_SLUG = "techbouw-demo"
DEMO_ORG_EMAIL = "demo@techbouw.nl"
DEMO_DB_DIR = Path(__file__).parent / "data"
DOCS_EXAMPLES_DIR = Path("docs/examples")
PUBLIC_EXAMPLES_DIR = Path("frontend/public/examples")

DEPARTMENTS = [
    "Operations", "Operations", "Operations",
    "Finance", "Finance",
    "Sales", "Sales",
    "HR",
    "IT",
    "Marketing",
    "Customer Success",
]
CULTURE_DEPARTMENTS = [
    "Operatie", "Operatie", "Operatie", "Operatie", "Operatie",
    "Support", "Support", "Support", "Support", "Support",
    "Staf",
]
ROLE_LEVELS = [
    "specialist", "specialist", "senior",
    "manager", "uitvoerend", "uitvoerend",
]
SALARIES = [38_000, 42_000, 48_000, 52_000, 58_000, 65_000, 74_000]
TENURES = [0.5, 1.0, 1.5, 2.0, 2.0, 3.0, 4.0, 5.5, 7.0]

EXIT_CONFIG = {
    "scan_type": "exit",
    "campaign_name": "Loep Vertrek Q1 2026",
    "docs_output_name": "voorbeeldrapport_loep.pdf",
    "public_output_name": "voorbeeldrapport_loep.pdf",
    "invited": 51,
    "responses": 35,
}

RETENTION_CONFIG = {
    "scan_type": "retention",
    "campaign_name": "Loep Behoud Voorjaar 2026",
    "docs_output_name": "voorbeeldrapport_retentiescan.pdf",
    "public_output_name": "voorbeeldrapport_retentiescan.pdf",
    "invited": 58,
    "responses": 39,
}

CULTURE_CONFIG = {
    "scan_type": "culture_assessment",
    "campaign_name": "Loep Cultuurbeeld 2026",
    "org_name": "Noordhaven Industrie Groep",
    "org_slug": "noordhaven-industrie-groep-demo",
    "org_email": "board@noordhaven-industrie-groep.demo",
    "docs_output_name": "voorbeeldrapport_cultuurbeeld.pdf",
    "enabled_modules": ["segment_deep_dive"],
    "invited": 120,
    "responses": 48,
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

CULTURE_PROFILES = [
    (
        "vertrouwen_richting_spanning", 0.27,
        6.1, 5.5, 5.3, 5.8, 5.6, 5.9, 5.7, 5.8, 5.9, 5.7,
    ),
    (
        "werkdruk_draagkracht", 0.24,
        6.0, 5.8, 5.9, 5.9, 5.1, 5.4, 5.7, 5.8, 5.9, 5.8,
    ),
    (
        "groei_alignment", 0.19,
        6.2, 5.9, 5.8, 5.4, 5.7, 5.8, 5.2, 5.5, 5.8, 5.4,
    ),
    (
        "verandering_samenwerking", 0.18,
        6.0, 5.8, 5.7, 5.3, 5.6, 5.7, 5.8, 5.1, 5.7, 5.6,
    ),
    (
        "stabiel_maar_voorzichtig", 0.12,
        6.6, 6.3, 6.2, 6.1, 6.0, 6.1, 6.2, 6.0, 6.1, 6.2,
    ),
]

ONBOARDING_CONFIG = {
    "scan_type": "onboarding",
    "campaign_name": "Onboarding Checkpoint Q1 2026",
    "docs_output_name": "voorbeeldrapport_onboarding.html",
    "public_output_name": "voorbeeldrapport_onboarding.html",
    "invited": 42,
    "responses": 28,
}

# Onboarding profielen: (naam, gewicht, sdt_bias, lead_bias, growth_bias, work_bias, culture_bias, comp_bias, role_bias, stay_intent_base)
ONBOARDING_PROFILES = [
    ("goede_landing",         0.28, 0.6,  0.5,  0.3,  0.2,  0.6,  0.3,  0.4,  4),
    ("rolhelderheid_frictie", 0.27, 0.0, -0.8,  0.0, -0.1,  0.2,  0.0, -1.6,  3),
    ("werkdruk_vroeg",        0.22, 0.1, -0.2, -0.1, -1.7,  0.1,  0.0, -0.3,  3),
    ("cultuur_onzeker",       0.15, -0.3, -0.3, -0.1,  0.0, -1.5,  0.0, -0.2,  2),
    ("snelle_twijfel",        0.08, -0.8, -1.2, -0.6, -0.8, -0.8,  0.0, -0.9,  1),
]

ONBOARDING_OPEN_TEXTS = [
    "Ik weet nog niet precies wat er van mij verwacht wordt in de eerste maanden.",
    "De inwerkperiode gaat goed, maar wat meer structuur in de eerste weken zou helpen.",
    "Mijn manager is bereikbaar maar geeft weinig concrete terugkoppeling over mijn aanpak.",
    "Er is veel informatie tegelijk. Prioriteiten zijn niet altijd even helder.",
    "Ik voel me welkom in het team, maar de cultuur is nog lastig te lezen.",
    "De werkdruk viel me hoger uit dan verwacht in deze eerste fase.",
    "Duidelijkere doelen voor de eerste 90 dagen zouden mij helpen om sneller bij te dragen.",
    "Goed gevoel over de organisatie, maar het duurt even voor je weet hoe dingen echt werken.",
    "",
    "",
]

CULTURE_OPEN_TEXTS = [
    "Meer richting en voorspelbaarheid vanuit de top zou helpen om vertrouwen vast te houden.",
    "Samenwerking tussen teams voelt stroperig wanneer prioriteiten niet scherp genoeg zijn.",
    "Werkdruk en herstel vragen meer aandacht als dit tempo structureel zo blijft.",
    "Ik zie kansen, maar mis soms ontwikkelperspectief en heldere vervolgafspraken.",
    "We zijn betrokken, maar verandering kost veel energie als afstemming achterblijft.",
    "Beloning is niet het hoofdthema, maar eerlijkheid en uitlegbaarheid mogen sterker.",
    "De basis is redelijk stabiel, toch blijft psychologische veiligheid niet overal vanzelfsprekend.",
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


# Verdiepingsvragen: gewogen keuzeverdelingen voor de fictieve respondenten.
# Alleen gebruikt voor factoren die daadwerkelijk triggeren via
# compute_deepening_offers(org_raw) — er worden geen entries gefabriceerd.
DEEPENING_PRIMARY_WEIGHTS: dict[str, dict[str, float]] = {
    "workload": {"wl_recovery": 0.60, "wl_volume": 0.15, "wl_capacity": 0.15, "wl_priorities": 0.10},
    "leadership": {"ld_feedback": 0.45, "ld_availability": 0.25, "ld_recognition": 0.20, "ld_support": 0.10},
    "growth": {"gr_visibility": 0.40, "gr_conversation": 0.30, "gr_follow_through": 0.20, "gr_time": 0.10},
    "culture": {"cu_cross_team": 0.50, "cu_exclusion": 0.30, "cu_conflict": 0.20},
    "compensation": {"cp_external": 0.40, "cp_growth": 0.35, "cp_clarity": 0.25},
    "role_clarity": {"rc_priorities": 0.40, "rc_conflicting": 0.35, "rc_scope": 0.25},
}
DEEPENING_SECONDARY_WEIGHTS: dict[str, dict[str, float]] = {
    "workload": {"wl_capacity": 0.55, "wl_priorities": 0.45},
    "leadership": {"ld_recognition": 0.55, "ld_availability": 0.45},
    "growth": {"gr_conversation": 0.55, "gr_time": 0.45},
}
DEEPENING_SKIP_RATE = 0.12
DEEPENING_SECONDARY_RATE = 0.55


def _weighted_choice(weights: dict[str, float]) -> str:
    r = random.random() * sum(weights.values())
    cumulative = 0.0
    for key, weight in weights.items():
        cumulative += weight
        if r <= cumulative:
            return key
    return next(iter(weights))


def _build_deepening_entries(org_raw: dict[str, int], scan_type: str) -> list[dict] | None:
    entries: list[dict] = []
    for factor_key in compute_deepening_offers(org_raw, scan_type):
        version = f"{scan_type}_{factor_key}_v1"
        if random.random() < DEEPENING_SKIP_RATE:
            entries.append({
                "factor_key": factor_key,
                "question_set_version": version,
                "status": "skipped",
                "primary": None,
                "secondary": None,
                "other_text": None,
            })
            continue
        primary = _weighted_choice(DEEPENING_PRIMARY_WEIGHTS[factor_key])
        secondary = None
        if random.random() < DEEPENING_SECONDARY_RATE:
            candidate = _weighted_choice(
                DEEPENING_SECONDARY_WEIGHTS.get(factor_key, DEEPENING_PRIMARY_WEIGHTS[factor_key])
            )
            if candidate != primary:
                secondary = candidate
        entries.append({
            "factor_key": factor_key,
            "question_set_version": version,
            "status": "answered",
            "primary": primary,
            "secondary": secondary,
            "other_text": None,
        })
    return entries or None


def _pick_profile(profiles: list[tuple]) -> dict[str, float | str]:
    r = random.random()
    cumulative = 0.0
    for profile in profiles:
        cumulative += profile[1]
        if r <= cumulative:
            if len(profile) == 12:
                (
                    name, _weight,
                    engagement_involvement,
                    trust_psychological_safety,
                    leadership_direction,
                    collaboration_alignment,
                    workload_capacity,
                    autonomy_role_clarity,
                    growth_development,
                    change_readiness,
                    reward_conditions,
                    organizational_connection_intent,
                ) = profile
                return {
                    "name": name,
                    "engagement_involvement": engagement_involvement,
                    "trust_psychological_safety": trust_psychological_safety,
                    "leadership_direction": leadership_direction,
                    "collaboration_alignment": collaboration_alignment,
                    "workload_capacity": workload_capacity,
                    "autonomy_role_clarity": autonomy_role_clarity,
                    "growth_development": growth_development,
                    "change_readiness": change_readiness,
                    "reward_conditions": reward_conditions,
                    "organizational_connection_intent": organizational_connection_intent,
                }
            if len(profile) == 10:
                (
                    name, _weight,
                    sdt_b, lead_b, growth_b, work_b, culture_b, comp_b, role_b,
                    stay_intent_b,
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
                    "stay_intent_base": stay_intent_b,
                }
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


def _culture_department_for_index(index: int, total_responses: int) -> str:
    safe_segment_size = max(10, total_responses // 2 - 4)
    if index < safe_segment_size:
        return "Operatie"
    if index < safe_segment_size * 2:
        return "Support"
    return "Staf"


def _get_or_create_demo_org(db, config: dict[str, str | int] | None = None) -> tuple[Organization, bool]:
    org_name = str((config or {}).get("org_name") or DEMO_ORG_NAME)
    org_slug = str((config or {}).get("org_slug") or DEMO_ORG_SLUG)
    org_email = str((config or {}).get("org_email") or DEMO_ORG_EMAIL)
    org = (
        db.query(Organization)
        .filter(Organization.slug == org_slug)
        .one_or_none()
    )
    if org:
        org.name = org_name
        org.contact_email = org_email
        org.is_active = True
        db.flush()
        return org, False

    org = Organization(
        id=str(uuid.uuid4()),
        name=org_name,
        slug=org_slug,
        contact_email=org_email,
        is_active=True,
    )
    db.add(org)
    db.flush()
    return org, True


def _resolved_output_paths(config: dict[str, str | int]) -> list[Path]:
    docs_path = Path(__file__).parent / DOCS_EXAMPLES_DIR / str(config["docs_output_name"])
    output_paths = [docs_path]

    public_output_name = config.get("public_output_name")
    if public_output_name:
        public_path = Path(__file__).parent / PUBLIC_EXAMPLES_DIR / str(public_output_name)
        output_paths.append(public_path)

    return output_paths


def _write_pdf_outputs(pdf_bytes: bytes, config: dict[str, str | int]) -> list[Path]:
    output_paths = _resolved_output_paths(config)
    for output_path in output_paths:
        output_path.parent.mkdir(parents=True, exist_ok=True)
        output_path.write_bytes(pdf_bytes)
    return output_paths


def _build_demo_session_factory(
    scan_type: str,
    keep_data: bool,
) -> tuple[sessionmaker, str | None, Path | None, Engine | None]:
    if _IS_SQLITE:
        init_db()
        return SessionLocal, None, None, None

    DEMO_DB_DIR.mkdir(parents=True, exist_ok=True)
    if keep_data:
        demo_db_path = DEMO_DB_DIR / f"voorbeeldrapport-generator-{scan_type}.db"
    else:
        demo_db_path = DEMO_DB_DIR / f"voorbeeldrapport-generator-{scan_type}-{uuid.uuid4().hex}.db"

    demo_database_url = f"sqlite:///{demo_db_path}"
    demo_engine = create_engine(
        demo_database_url,
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
        echo=False,
    )
    Base.metadata.create_all(bind=demo_engine)
    demo_session_factory = sessionmaker(autocommit=False, autoflush=False, bind=demo_engine)
    return demo_session_factory, demo_database_url, demo_db_path, demo_engine


def _purge_campaign(db, campaign: Campaign) -> None:
    respondents = list(campaign.respondents)
    for respondent in respondents:
        if respondent.response is not None:
            db.delete(respondent.response)
    db.flush()

    db.delete(campaign)
    db.flush()


def _parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Genereer een fictief Loep-rapport.")
    parser.add_argument(
        "scan_type",
        nargs="?",
        default="exit",
        choices=["exit", "retention", "onboarding", "culture_assessment"],
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
        "deepening_responses": _build_deepening_entries(org_raw, "exit"),
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
        "deepening_responses": _build_deepening_entries(org_raw, "retention"),
    }


def _build_culture_response(profile: dict[str, float | str]) -> dict:
    domain_scores = {
        "engagement_involvement": round(float(profile["engagement_involvement"]), 1),
        "trust_psychological_safety": round(float(profile["trust_psychological_safety"]), 1),
        "leadership_direction": round(float(profile["leadership_direction"]), 1),
        "collaboration_alignment": round(float(profile["collaboration_alignment"]), 1),
        "workload_capacity": round(float(profile["workload_capacity"]), 1),
        "autonomy_role_clarity": round(float(profile["autonomy_role_clarity"]), 1),
        "growth_development": round(float(profile["growth_development"]), 1),
        "change_readiness": round(float(profile["change_readiness"]), 1),
        "reward_conditions": round(float(profile["reward_conditions"]), 1),
        "organizational_connection_intent": round(float(profile["organizational_connection_intent"]), 1),
    }
    culture_index = round(sum(domain_scores.values()) / len(domain_scores), 2)
    if culture_index >= 7:
        risk_band = "HOOG"
    elif culture_index >= 5.5:
        risk_band = "MIDDEN"
    else:
        risk_band = "LAAG"
    text = random.choice(CULTURE_OPEN_TEXTS)

    return {
        "tenure_years": None,
        "exit_reason_category": None,
        "exit_reason_code": None,
        "stay_intent_score": None,
        "sdt_raw": {},
        "sdt_scores": {
            "culture_wave_1": round(sum(list(domain_scores.values())[:5]) / 5, 2),
            "culture_wave_2": round(sum(list(domain_scores.values())[5:]) / 5, 2),
            "culture_index": culture_index,
            "answered_items": 40,
        },
        "org_raw": {},
        "org_scores": domain_scores,
        "pull_factors_raw": {},
        "open_text_raw": anonymize_text(text) if text else None,
        "uwes_raw": {},
        "uwes_score": None,
        "turnover_intention_raw": {},
        "turnover_intention_score": None,
        "risk_score": culture_index,
        "risk_band": risk_band,
        "preventability": None,
        "replacement_cost_eur": None,
        "full_result": {
            "culture_index": culture_index,
            "domain_scores": domain_scores,
            "board_attention_points": [],
            "response_basis": {
                "answered_closed_items": 40,
                "minimum_closed_items_answered": 32,
                "minimum_valid_domains": 8,
            },
            "method_guardrails": {
                "no_causal_claims": True,
                "no_individual_predictions": True,
                "no_manager_ranking_logic": True,
            },
        },
    }


def _build_onboarding_response(profile: dict[str, float | str | int]) -> dict:
    from backend.products.onboarding.scoring import compute_onboarding_risk

    # Onboarding gebruikt alleen B1, B5, B9 als SDT-checkpoint items
    base_sdt = 3.3 + float(profile["sdt_bias"])
    sdt_raw = {
        "B1": _likert(base_sdt),
        "B5": _likert(base_sdt + 0.4),
        "B9": _likert(base_sdt + 0.2),
    }
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
    active_factors = list(org_scores.keys())
    risk_result = compute_onboarding_risk(sdt_scores, org_scores, active_factors)

    stay_intent_raw = max(1, min(5, int(profile.get("stay_intent_base", 3)) + random.randint(-1, 1)))
    stay_intent_raw = max(1, min(5, stay_intent_raw))

    onboarding_summary = {
        "onboarding_signal_score": risk_result["risk_score"],
        "onboarding_signal_band": risk_result["risk_band"],
        "checkpoint_direction_score": stay_intent_raw,
        "active_factors": active_factors,
        "snapshot_type": "single_checkpoint",
    }

    text = random.choice(ONBOARDING_OPEN_TEXTS)

    return {
        "tenure_years": None,
        "exit_reason_category": None,
        "exit_reason_code": None,
        "stay_intent_score": stay_intent_raw,
        "sdt_raw": sdt_raw,
        "sdt_scores": sdt_scores,
        "org_raw": org_raw,
        "org_scores": org_scores,
        "pull_factors_raw": {},
        "open_text_raw": anonymize_text(text) if text else None,
        "uwes_raw": {},
        "uwes_score": None,
        "turnover_intention_raw": {},
        "turnover_intention_score": None,
        "risk_score": risk_result["risk_score"],
        "risk_band": risk_result["risk_band"],
        "preventability": None,
        "replacement_cost_eur": None,
        "full_result": {
            "sdt_scores": sdt_scores,
            "org_scores": org_scores,
            "risk_result": risk_result,
            "onboarding_summary": onboarding_summary,
            "recommendations": get_recommendations(risk_result["factor_risks"]),
            "active_factors": active_factors,
        },
    }


def main() -> None:
    args = _parse_args()
    if args.scan_type == "retention":
        config = RETENTION_CONFIG
    elif args.scan_type == "onboarding":
        config = ONBOARDING_CONFIG
    elif args.scan_type == "culture_assessment":
        config = CULTURE_CONFIG
    else:
        config = EXIT_CONFIG

    session_factory, isolated_database_url, isolated_db_path, isolated_engine = _build_demo_session_factory(
        str(config["scan_type"]),
        args.keep_data,
    )
    db = session_factory()

    if isolated_database_url is not None:
        print(f"Gebruik geisoleerde demo-database: {isolated_database_url}")
        print("")

    org, created_org = _get_or_create_demo_org(db, config)
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
        enabled_modules=list(config.get("enabled_modules", [])) or None,
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

    if campaign.scan_type == "retention":
        profiles = RETENTION_PROFILES
    elif campaign.scan_type == "onboarding":
        profiles = ONBOARDING_PROFILES
    elif campaign.scan_type == "culture_assessment":
        profiles = CULTURE_PROFILES
    else:
        profiles = EXIT_PROFILES

    for index in range(responses):
        profile = _pick_profile(profiles)
        department = (
            _culture_department_for_index(index, responses)
            if campaign.scan_type == "culture_assessment"
            else random.choice(DEPARTMENTS)
        )
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
        elif campaign.scan_type == "onboarding":
            response_payload = _build_onboarding_response(profile)
            print(
                f"  [{index + 1:02d}] {department:<16} {role:<12} "
                f"onboarding {response_payload['risk_score']:.1f}  "
                f"stay-intent {response_payload['stay_intent_score']}  "
                f"profiel={profile.get('name','?')}"
            )
        elif campaign.scan_type == "culture_assessment":
            response_payload = _build_culture_response(profile)
            print(
                f"  [{index + 1:02d}] {department:<16} {role:<12} "
                f"culture index {response_payload['risk_score']:.1f}  "
                f"vertrouwen {response_payload['org_scores']['trust_psychological_safety']:.1f}  "
                f"werkdruk {response_payload['org_scores']['workload_capacity']:.1f}"
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
            deepening_responses=response_payload.get("deepening_responses"),
        )
        db.add(response)

    db.commit()
    print("")
    print(f"{invited} respondenten totaal opgeslagen ({responses} ingevuld). Rapport genereren...")

    if config["scan_type"] in ("exit", "retention", "onboarding"):
        # Gebruik de verfijnde WeasyPrint-gebaseerde HTML-renderer (report_html.py)
        from backend.report_html import build_report_data, render_report_html
        html_content = render_report_html(build_report_data(campaign.id, db))
        html_bytes = html_content.encode("utf-8")

        # Sla op als .html (vervang .pdf extensie)
        html_config = dict(config)
        html_config["docs_output_name"] = str(config["docs_output_name"]).replace(".pdf", ".html")
        html_config["public_output_name"] = str(config.get("public_output_name", "")).replace(".pdf", ".html") or None

        output_paths = []
        docs_path = Path(__file__).parent / DOCS_EXAMPLES_DIR / html_config["docs_output_name"]
        docs_path.parent.mkdir(parents=True, exist_ok=True)
        docs_path.write_bytes(html_bytes)
        output_paths.append(docs_path)

        if html_config.get("public_output_name"):
            pub_path = Path(__file__).parent / PUBLIC_EXAMPLES_DIR / html_config["public_output_name"]
            pub_path.parent.mkdir(parents=True, exist_ok=True)
            pub_path.write_bytes(html_bytes)
            output_paths.append(pub_path)

        size_kb = len(html_bytes) / 1024
        file_type = "HTML"
    else:
        pdf_bytes = generate_campaign_report_html(campaign.id, db)
        output_paths = _write_pdf_outputs(pdf_bytes, config)
        size_kb = len(pdf_bytes) / 1024
        file_type = "PDF"

    print(f"Rapport opgeslagen ({file_type}):")
    for output_path in output_paths:
        print(f"  - {output_path}")
    print(f"Grootte: {size_kb:.1f} KB")

    if args.keep_data:
        print("Demo-data behouden in de database.")
        db.close()
        return

    _purge_campaign(db, campaign)
    if created_org:
        db.delete(org)
    db.commit()
    db.close()
    if isolated_engine is not None:
        isolated_engine.dispose()
    if isolated_db_path is not None and isolated_db_path.exists():
        isolated_db_path.unlink()
    print("Tijdelijke demo-data verwijderd uit de database.")


if __name__ == "__main__":
    main()

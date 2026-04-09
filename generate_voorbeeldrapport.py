"""
Verisight — Voorbeeldrapport Generator
=======================================
Genereert een fictief PDF-rapport op basis van ~35 synthetische respondenten.
Draai met:  python generate_voorbeeldrapport.py

Het rapport wordt opgeslagen als:  voorbeeldrapport_verisight.pdf
"""

from __future__ import annotations

import random
import sys
import uuid
from datetime import datetime, timezone
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))

from backend.database import SessionLocal, init_db
from backend.models import Campaign, Organization, Respondent, SurveyResponse  # noqa: F401
from backend.report import generate_campaign_report
from backend.scoring import (
    anonymize_text,
    compute_org_scores,
    compute_preventability,
    compute_replacement_cost,
    compute_retention_risk,
    compute_sdt_scores,
    get_recommendations,
)

# ---------------------------------------------------------------------------
# Configuratie
# ---------------------------------------------------------------------------

N_RESPONSES = 35
RANDOM_SEED = 2026
random.seed(RANDOM_SEED)

DEMO_ORG_NAME = "TechBouw B.V."
DEMO_CAMPAIGN_NAME = "ExitScan Q1 2026"

# ---------------------------------------------------------------------------
# Profielen
# ---------------------------------------------------------------------------

PROFILES = [
    # (naam, kans, sdt_bias, leiderschaps_bias, groei_bias, werkdruk_bias, reden_cat, reden_code)
    ("leiderschap_probleem",  0.38, -1.5, -2.0,  0.0,  0.5, "leiderschap",  "P1"),
    ("groei_frustratie",      0.25, -0.5,  0.0, -2.0,  0.0, "groei",        "P3"),
    ("werkdruk",              0.15,  0.0,  0.0,  0.0, -2.0, "werkdruk",     "P5"),
    ("pull_aanbod",           0.12,  0.5,  0.5,  0.0,  0.0, "beter_aanbod", "PL1"),
    ("persoonlijk",           0.10,  0.0,  0.0,  0.0,  0.0, "persoonlijk",  "S1"),
]

DEPARTMENTS = [
    "Operations", "Operations", "Operations",
    "Finance", "Finance",
    "Sales", "Sales",
    "HR",
    "IT",
    "Marketing",
]
ROLE_LEVELS = ["specialist", "specialist", "senior", "manager", "uitvoerend", "uitvoerend"]
SALARIES    = [44_000, 52_000, 58_000, 65_000, 74_000, 38_000, 42_000]
TENURES     = [0.5, 1.0, 1.5, 2.0, 2.0, 3.0, 4.0, 5.5, 7.0]

OPEN_TEXTS = [
    "Mijn manager gaf nooit feedback en was zelden beschikbaar voor overleg.",
    "Er was weinig ruimte voor eigen initiatief. Alles moest via de manager.",
    "Ik had het gevoel dat mijn ontwikkeling er niet toe deed voor de organisatie.",
    "De werkdruk was structureel te hoog. Na drukke periodes was er geen herstelruimte.",
    "Ik heb een betere kans gekregen elders met meer verantwoordelijkheid en salaris.",
    "Persoonlijke omstandigheden maakten de huidige functie niet meer haalbaar.",
    "Weinig transparantie over beslissingen. Ik wist nooit waar ik aan toe was.",
    "Mooie organisatie, maar voor mij geen zichtbare doorgroeimogelijkheden.",
    "De teamcultuur voelde gesloten. Nieuwe ideeën werden zelden serieus genomen.",
    "Ik miste erkenning voor mijn bijdrage, ook bij goede resultaten.",
    "De samenwerking met andere afdelingen was stroef en kostbaar.",
    "",
    "",
]

STAY_INTENT_MAP = {
    "leiderschap_probleem": [3, 4, 4, 5],
    "groei_frustratie":     [3, 4, 4],
    "werkdruk":             [2, 3, 4],
    "pull_aanbod":          [1, 2],
    "persoonlijk":          [1, 1, 2],
}

# ---------------------------------------------------------------------------
# Hulpfuncties (identiek aan generate_testdata.py)
# ---------------------------------------------------------------------------


def _pick_profile() -> dict:
    r = random.random()
    cumulative = 0.0
    for name, weight, sdt_b, lead_b, growth_b, work_b, reden_cat, reden_code in PROFILES:
        cumulative += weight
        if r <= cumulative:
            return {
                "name": name, "sdt_bias": sdt_b, "lead_bias": lead_b,
                "growth_bias": growth_b, "work_bias": work_b,
                "reden_cat": reden_cat, "reden_code": reden_code,
            }
    return {"name": "pull_aanbod", "sdt_bias": 0, "lead_bias": 0,
            "growth_bias": 0, "work_bias": 0, "reden_cat": "beter_aanbod", "reden_code": "PL1"}


def _likert(base: float, bias: float = 0.0, reverse: bool = False) -> int:
    raw = base + bias + random.gauss(0, 0.6)
    raw = max(1.0, min(5.0, raw))
    if reverse:
        raw = 6.0 - raw
    return int(round(raw))


def _sdt_items(sdt_bias: float) -> dict[str, int]:
    base = 3.3 + sdt_bias
    return {
        "B1":  _likert(base),
        "B2":  _likert(base),
        "B3":  _likert(base),
        "B4":  _likert(base, reverse=True),
        "B5":  _likert(base + 0.4),
        "B6":  _likert(base + 0.4),
        "B7":  _likert(base + 0.4),
        "B8":  _likert(base + 0.4, reverse=True),
        "B9":  _likert(base + 0.2),
        "B10": _likert(base + 0.2),
        "B11": _likert(base + 0.2),
        "B12": _likert(base + 0.2, reverse=True),
    }


def _org_items(lead_bias: float, growth_bias: float, work_bias: float) -> dict[str, int]:
    base = 3.2
    return {
        "leadership_1":   _likert(base + lead_bias),
        "leadership_2":   _likert(base + lead_bias),
        "leadership_3":   _likert(base + lead_bias),
        "culture_1":      _likert(base + 0.3),
        "culture_2":      _likert(base + 0.3),
        "culture_3":      _likert(base + 0.3),
        "growth_1":       _likert(base + growth_bias),
        "growth_2":       _likert(base + growth_bias),
        "growth_3":       _likert(base + growth_bias),
        "compensation_1": _likert(base + 0.2),
        "compensation_2": _likert(base + 0.2),
        "compensation_3": _likert(base),
        "workload_1":     _likert(base + work_bias),
        "workload_2":     _likert(base + work_bias),
        "workload_3":     _likert(base + work_bias),
        "role_clarity_1": _likert(base + 0.1),
        "role_clarity_2": _likert(base + 0.1),
        "role_clarity_3": _likert(base + 0.1),
    }


# ---------------------------------------------------------------------------
# Hoofd
# ---------------------------------------------------------------------------


def main() -> None:
    init_db()
    db = SessionLocal()

    # Gebruik de eerste bestaande organisatie (aanmaken triggert auth-hook)
    org = db.query(Organization).first()
    if not org:
        print("Geen organisatie gevonden in de database. Maak er eerst één aan via het dashboard.")
        db.close()
        return

    # Maak een tijdelijke demo-campagne aan onder de bestaande org
    camp = Campaign(
        id=str(uuid.uuid4()),
        organization_id=org.id,
        name=DEMO_CAMPAIGN_NAME,
        scan_type="exit",
        is_active=False,
    )
    db.add(camp)
    db.flush()

    print(f"Organisatie:   {org.name}")
    print(f"Demo-campagne: {DEMO_CAMPAIGN_NAME}")
    print(f"Genereer {N_RESPONSES} synthetische respondenten...\n")

    for i in range(N_RESPONSES):
        profile = _pick_profile()
        dept    = random.choice(DEPARTMENTS)
        role    = random.choice(ROLE_LEVELS)
        salary  = random.choice(SALARIES)
        tenure  = random.choice(TENURES)
        stay    = random.choice(STAY_INTENT_MAP.get(profile["name"], [2, 3, 4]))
        text    = random.choice(OPEN_TEXTS)

        sdt_raw = _sdt_items(profile["sdt_bias"])
        org_raw = _org_items(profile["lead_bias"], profile["growth_bias"], profile["work_bias"])

        sdt_scores  = compute_sdt_scores(sdt_raw)
        org_scores  = compute_org_scores(org_raw)
        risk_result = compute_retention_risk(sdt_scores, org_scores)

        prev_result = compute_preventability(
            exit_reason_category=profile["reden_cat"],
            stay_intent_score=stay,
            sdt_scores=sdt_scores,
            org_scores=org_scores,
        )

        rc = compute_replacement_cost(salary, role)

        full_result = {
            "sdt_scores":            sdt_scores,
            "org_scores":            org_scores,
            "risk_result":           risk_result,
            "preventability_result": prev_result,
            "recommendations":       get_recommendations(risk_result["factor_risks"]),
        }

        respondent = Respondent(
            id=str(uuid.uuid4()),
            campaign_id=camp.id,
            department=dept,
            role_level=role,
            annual_salary_eur=float(salary),
            sent_at=datetime.now(timezone.utc),
            opened_at=datetime.now(timezone.utc),
            completed=True,
            completed_at=datetime.now(timezone.utc),
        )
        db.add(respondent)
        db.flush()

        response = SurveyResponse(
            id=str(uuid.uuid4()),
            respondent_id=respondent.id,
            tenure_years=tenure,
            exit_reason_category=profile["reden_cat"],
            exit_reason_code=profile["reden_code"],
            stay_intent_score=stay,
            sdt_raw=sdt_raw,
            sdt_scores=sdt_scores,
            org_raw=org_raw,
            org_scores=org_scores,
            pull_factors_raw={},
            open_text_raw=anonymize_text(text) if text else None,
            uwes_raw={},
            uwes_score=None,
            turnover_intention_raw={},
            turnover_intention_score=None,
            risk_score=risk_result["risk_score"],
            risk_band=risk_result["risk_band"],
            preventability=prev_result["preventability"],
            replacement_cost_eur=rc["cost_per_employee"],
            full_result=full_result,
        )
        db.add(response)

        band_icon = {"HOOG": "[H]", "MIDDEN": "[M]", "LAAG": "[L]"}.get(risk_result["risk_band"], "")
        print(
            f"  [{i+1:02d}] {dept:<12} {role:<12} "
            f"risico {risk_result['risk_score']:.1f} {band_icon}  "
            f"prev={prev_result['preventability']:<16}  reden={profile['reden_code']}"
        )

    db.commit()
    print(f"\nAlle {N_RESPONSES} respondenten opgeslagen. Rapport genereren...")

    # Genereer PDF
    pdf_bytes = generate_campaign_report(camp.id, db)
    db.close()

    output_path = Path(__file__).parent / "voorbeeldrapport_verisight.pdf"
    output_path.write_bytes(pdf_bytes)
    print(f"\nRapport opgeslagen: {output_path}")
    print(f"  Grootte: {len(pdf_bytes) / 1024:.1f} KB")

    # Verwijder de demo-data weer (optioneel — commando deze regels uit om data te bewaren)
    # db2 = SessionLocal()
    # db2.query(Organization).filter(Organization.id == org.id).delete()
    # db2.commit()
    # db2.close()
    # print("  Demo-data verwijderd uit database.")


if __name__ == "__main__":
    main()

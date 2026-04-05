"""
Verisight — Testdata Generator
======================================
Genereert realistische synthetische responses voor de demo-campaign.
Draai met:  python generate_testdata.py

Maakt 20 gevarieerde responses aan in de eerste exit-campaign die het vindt.
Patronen:
  - Leiderschap is dominant push-factor (hoog risico)
  - Groei scoort ook slecht
  - Werkbelasting wisselend
  - SDT autonoom laag, competentie redelijk
"""

from __future__ import annotations

import random
import sys
import uuid
from datetime import datetime, timezone
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))

from backend.database import SessionLocal, init_db
from backend.models import Campaign, Organization, Respondent, SurveyResponse
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

N_RESPONSES = 20
RANDOM_SEED = 42
random.seed(RANDOM_SEED)

# ---------------------------------------------------------------------------
# Profielen — bepalen het risicopatroon per respondent
# ---------------------------------------------------------------------------

PROFILES = [
    # (naam, kans, sdt_bias, leiderschaps_bias, groei_bias, werkdruk_bias, reden_cat, reden_code)
    # hoog leiderschap-risico (dominant patroon — 40%)
    ("leiderschap_probleem",  0.40, -1.5, -2.0,  0.0,  0.5, "leiderschap",  "P1"),
    # groei-frustratie (25%)
    ("groei_frustratie",      0.25, -0.5,  0.0, -2.0,  0.0, "groei",        "P3"),
    # werkdruk te hoog (15%)
    ("werkdruk",              0.15,  0.0,  0.0,  0.0, -2.0, "werkdruk",     "P5"),
    # pull: beter aanbod (10%)
    ("pull_aanbod",           0.10,  0.5,  0.5,  0.0,  0.0, "beter_aanbod", "PL1"),
    # persoonlijk / niet redbaar (10%)
    ("persoonlijk",           0.10,  0.0,  0.0,  0.0,  0.0, "persoonlijk",  "S1"),
]

DEPARTMENTS = ["Operations", "Operations", "Finance", "Sales", "HR"]
ROLE_LEVELS = ["specialist", "specialist", "senior", "manager", "uitvoerend"]
SALARIES    = [48_000, 55_000, 62_000, 72_000, 38_000]

TENURES = [0.5, 1.0, 2.0, 2.0, 3.5, 5.0, 7.5]

OPEN_TEXTS = [
    "Mijn manager gaf nooit feedback en was zelden beschikbaar voor overleg.",
    "Er was weinig ruimte voor eigen initiatief. Alles moest via de manager.",
    "Ik had het gevoel dat mijn ontwikkeling er niet toe deed voor de organisatie.",
    "De werkdruk was structureel te hoog. Geen herstelruimte na drukke periodes.",
    "Ik heb een betere kans gekregen elders met meer verantwoordelijkheid.",
    "Persoonlijke omstandigheden maakten de huidige functie niet meer haalbaar.",
    "Weinig transparantie over beslissingen. Ik wist nooit waar ik aan toe was.",
    "Mooie organisatie, maar geen doorgroeimogelijkheden voor mij zichtbaar.",
    "",  # geen toelichting
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
# Hulpfuncties
# ---------------------------------------------------------------------------


def _pick_profile() -> dict:
    """Selecteer een profiel op basis van gewichten."""
    r = random.random()
    cumulative = 0.0
    for name, weight, sdt_b, lead_b, growth_b, work_b, reden_cat, reden_code in PROFILES:
        cumulative += weight
        if r <= cumulative:
            return {
                "name": name,
                "sdt_bias": sdt_b,
                "lead_bias": lead_b,
                "growth_bias": growth_b,
                "work_bias": work_b,
                "reden_cat": reden_cat,
                "reden_code": reden_code,
            }
    return {"name": "pull_aanbod", "sdt_bias": 0, "lead_bias": 0, "growth_bias": 0, "work_bias": 0,
            "reden_cat": "beter_aanbod", "reden_code": "PL1"}


def _likert(base: float, bias: float = 0.0, reverse: bool = False) -> int:
    """Genereer een Likert-waarde 1-5 met bias en ruis."""
    raw = base + bias + random.gauss(0, 0.6)
    raw = max(1.0, min(5.0, raw))
    if reverse:
        raw = 6.0 - raw
    return int(round(raw))


def _sdt_items(sdt_bias: float) -> dict[str, int]:
    base = 3.3 + sdt_bias
    return {
        "B1":  _likert(base),                        # autonomie
        "B2":  _likert(base),
        "B3":  _likert(base),
        "B4":  _likert(base, reverse=True),          # frustratie-item (reversed)
        "B5":  _likert(base + 0.4),                  # competentie iets hoger
        "B6":  _likert(base + 0.4),
        "B7":  _likert(base + 0.4),
        "B8":  _likert(base + 0.4, reverse=True),
        "B9":  _likert(base + 0.2),                  # verbondenheid neutraal
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
# Hoofdscript
# ---------------------------------------------------------------------------


def main() -> None:
    init_db()
    db = SessionLocal()

    # Zoek de eerste exit-campaign
    camp = db.query(Campaign).filter(Campaign.scan_type == "exit").first()
    if not camp:
        print("Geen exit-campaign gevonden. Maak er eerst een aan via het dashboard.")
        db.close()
        return

    print(f"Campaign gevonden: '{camp.name}' (org: {camp.organization.name})")
    print(f"   Bestaande respondenten: {len(camp.respondents)}")
    print(f"   Genereer {N_RESPONSES} nieuwe responses...\n")

    created = 0
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
        db.flush()  # respondent.id beschikbaar voor FK

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

        band_icon = {"HOOG": "[HOOG]", "MIDDEN": "[MIDDEN]", "LAAG": "[LAAG]"}.get(risk_result["risk_band"], "")
        print(
            f"  [{i+1:02d}] {dept:<12} {role:<12} "
            f"risico {risk_result['risk_score']:.1f} {band_icon:<8}  "
            f"prev={prev_result['preventability']:<16}  reden={profile['reden_code']}"
        )
        created += 1

    db.commit()
    db.close()

    print(f"\nKlaar: {created} responses aangemaakt en opgeslagen.")
    print("   Herlaad het dashboard op http://localhost:8501 om de data te zien.")


if __name__ == "__main__":
    main()

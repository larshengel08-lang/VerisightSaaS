"""Stresstest-harnas voor de Loep-rapportgeneratie.

NIET-PRODUCTIE. Dit script is een QA-hulpmiddel: het genereert rapporten voor
een vaste matrix van datacondities zodat de zwakke plekken van het rapport
zichtbaar worden voordat een klant ze ziet. Het schrijft NOOIT naar
frontend/public/examples of docs/examples -- alleen naar docs/stresstest/.

Verschil met generate_voorbeeldrapport.py (dat blijft de bron voor de publieke
voorbeeldrapporten): hier is elk datakenmerk parametriseerbaar -- aantal
respondenten, uitgenodigd, scoreprofiel per factor (gemiddelde + spreiding),
afdelingsindeling, overslagkans op de verdieping, kans op "Niets, dit zit hier
goed" en op "Anders" bij de richtingvraag.

Wat NIET gefaket wordt: welke verdiepingsvragen een respondent krijgt
(compute_deepening_offers) en op welke factor de richtingvraag valt
(compute_direction_factor) komen uit de echte productielogica. De harness
levert alleen ruwe likert-antwoorden en een keuze uit de echte optiesets.

Gebruik:
    python scripts/stresstest_report.py --list
    python scripts/stresstest_report.py                 # alle scenario's -> HTML
    python scripts/stresstest_report.py 01 07 20        # selectie
    python scripts/stresstest_report.py --pdf           # + PDF via Chromium
"""

from __future__ import annotations

import argparse
import json
import random
import sys
import uuid
from dataclasses import dataclass, field
from datetime import datetime, timezone
from pathlib import Path

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT))

from backend.database import Base  # noqa: E402
from backend.models import Campaign, Organization, Respondent, SurveyResponse  # noqa: E402
from backend.products.shared.deepening import (  # noqa: E402
    DEEPENING_SETS,
    DIRECTION_SETS,
    compute_deepening_offers,
    compute_direction_factor,
    get_deepening_sets,
    get_direction_sets,
)
from backend.products.shared.enps import build_enps_summary  # noqa: E402
from backend.report_html import build_report_data, render_report_html  # noqa: E402
from backend.scoring import (  # noqa: E402
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
from backend.scoring_config import ORG_FACTOR_KEYS  # noqa: E402
from backend.segments import _slugify as slugify_department  # noqa: E402

OUT_DIR = ROOT / "docs" / "stresstest"
SEED = 20260910

ROLE_LEVELS = ["specialist", "specialist", "senior", "manager", "uitvoerend", "uitvoerend"]
SALARIES = [38_000, 42_000, 48_000, 52_000, 58_000, 65_000, 74_000]
TENURES = [0.5, 1.0, 1.5, 2.0, 2.0, 3.0, 4.0, 5.5, 7.0]

# Open teksten: overgenomen uit generate_voorbeeldrapport.py zodat de
# quote-sectie realistisch vult (en bij korte lijsten eerlijk dichtblijft).
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
EXIT_OPEN_TEXTS = [
    "Mijn manager gaf nooit feedback en was zelden beschikbaar voor overleg.",
    "Er was weinig ruimte voor eigen initiatief. Alles moest via de manager.",
    "Ik had het gevoel dat mijn ontwikkeling er niet toe deed voor de organisatie.",
    "De werkdruk was structureel te hoog. Na drukke periodes was er geen herstelruimte.",
    "Ik heb een betere kans gekregen elders met meer verantwoordelijkheid en salaris.",
    "Weinig transparantie over beslissingen. Ik wist nooit waar ik aan toe was.",
    "Mooie organisatie, maar voor mij geen zichtbare doorgroeimogelijkheden.",
    "Ik miste erkenning voor mijn bijdrage, ook bij goede resultaten.",
    "",
    "",
]
ONBOARDING_OPEN_TEXTS = [
    "Ik weet nog niet precies wat er van mij verwacht wordt in de eerste maanden.",
    "De inwerkperiode gaat goed, maar wat meer structuur in de eerste weken zou helpen.",
    "Mijn manager is bereikbaar maar geeft weinig concrete terugkoppeling over mijn aanpak.",
    "Er is veel informatie tegelijk. Prioriteiten zijn niet altijd even helder.",
    "Ik voel me welkom in het team, maar de cultuur is nog lastig te lezen.",
    "Duidelijkere doelen voor de eerste 90 dagen zouden mij helpen om sneller bij te dragen.",
    "",
    "",
]

EXIT_REASON_BY_FACTOR = {
    "leadership": ("leiderschap", "P1"),
    "culture": ("cultuur", "P2"),
    "growth": ("groei", "P3"),
    "compensation": ("beloning", "P4"),
    "workload": ("werkdruk", "P5"),
    "role_clarity": ("rolonduidelijkheid", "P6"),
}

ITEM_NOISE = 0.45  # spreiding tussen de 3 stellingen binnen één factor (likert)


# ─── Schaalhulp ──────────────────────────────────────────────────────────────

def to_likert(score10: float) -> float:
    """Inverse van scale_to_ten: 10-puntsscore -> likert 1-5."""
    return (score10 - 1.0) / 9.0 * 4.0 + 1.0


def to_ten(likert: float) -> float:
    return (likert - 1.0) / 4.0 * 9.0 + 1.0


def _clamp_item(x: float) -> int:
    return int(max(1, min(5, round(x))))


# ─── Scenario-definitie ──────────────────────────────────────────────────────

DEFAULT_DEPTS = [
    ("Operations", 0.30), ("Sales", 0.18), ("Finance", 0.14),
    ("IT", 0.12), ("Customer Success", 0.11), ("Marketing", 0.08), ("HR", 0.07),
]


@dataclass
class Scenario:
    key: str
    title: str
    doel: str
    factors: dict[str, tuple[float, float]]      # factor -> (gemiddelde op 10, sd op 10)
    scan_type: str = "retention"
    n: int = 45
    invited: int | None = None
    depts: list[tuple[str, int]] | None = None   # (label, aantal responses); None = default verdeling
    dept_shift: dict[str, float] = field(default_factory=dict)  # afdeling -> verschuiving in 10-punten
    deepening_skip: float = 0.12
    deepening_other: float = 0.0
    direction_skip: float = 0.10
    direction_none: float = 0.15
    direction_other: float = 0.0
    direction_top_share: float = 0.62            # aandeel van de resterende massa voor de topoptie
    direction_flat: bool = False                 # verdeeld: geen optie springt eruit

    @property
    def num(self) -> str:
        return self.key.split("_")[0]


def flat(mean: float, sd: float = 0.9) -> dict[str, tuple[float, float]]:
    return {fk: (mean, sd) for fk in ORG_FACTOR_KEYS}


def prof(**kw: tuple[float, float]) -> dict[str, tuple[float, float]]:
    base = flat(6.8)
    base.update(kw)
    return base


# ── De matrix ────────────────────────────────────────────────────────────────

VLAK = {
    "leadership": (6.1, 0.7), "culture": (6.3, 0.7), "growth": (5.7, 0.7),
    "compensation": (6.0, 0.7), "workload": (5.9, 0.7), "role_clarity": (6.4, 0.7),
}

EEN_LAGE = {
    "leadership": (7.0, 0.9), "culture": (7.4, 0.9), "growth": (4.5, 1.1),
    "compensation": (6.6, 0.9), "workload": (7.1, 0.9), "role_clarity": (7.3, 0.9),
}

SCENARIOS: list[Scenario] = [
    Scenario("01_vlak_middelmatig", "Vlak middelmatig profiel (n=45)",
             "Geen uitschieter: verdieping vuurt nauwelijks, ranglijst vol vrijwel-gelijk.",
             factors=VLAK),
    Scenario("02_een_lage_factor", "Eén duidelijk lage factor (n=45)",
             "Het gunstige geval: growth 4.5, rest 6.5-7.5.",
             factors=EEN_LAGE),
    Scenario("03_twee_near_ties", "Twee near-ties laag (n=45)",
             "growth 4.8 en workload 4.9: tie-break moet zichtbaar en verdedigbaar zijn.",
             factors={"leadership": (6.8, 0.9), "culture": (7.2, 0.9), "growth": (4.8, 1.0),
                      "compensation": (6.6, 0.9), "workload": (4.9, 1.0), "role_clarity": (7.0, 0.9)}),
    Scenario("04_alles_hoog", "Alles hoog (n=45)",
             "Geen verdieping, richting overwegend 'niets nodig'.",
             factors=flat(8.0, 0.7), direction_none=0.62, deepening_skip=0.12),
    Scenario("05_alles_laag", "Alles laag / crisis (n=45)",
             "Cap van 3 verdiepingen, veel richting.",
             factors={"leadership": (3.6, 0.9), "culture": (4.3, 0.9), "growth": (3.8, 0.9),
                      "compensation": (4.4, 0.9), "workload": (3.5, 0.9), "role_clarity": (4.2, 0.9)},
             direction_none=0.04),
    Scenario("06_een_afdeling_laag", "Eén afdeling laag (n=45)",
             "Operations 4.5 op alles, rest 7+: segment vs organisatiebeeld.",
             factors=flat(7.3, 0.8),
             depts=[("Operations", 14), ("Sales", 9), ("Finance", 7), ("IT", 6),
                    ("Customer Success", 5), ("Marketing", 4)],
             dept_shift={"Operations": -2.8}),
    Scenario("07_exit_n8", "Vertrek, n=8",
             "Onder de patroonanalyse-drempel (MIN_AGGREGATE_N=10).",
             scan_type="exit", n=8, invited=14, factors=VLAK,
             depts=[("Operations", 3), ("Sales", 2), ("Finance", 2), ("IT", 1)]),
    Scenario("08_exit_n12", "Vertrek, n=12",
             "Net boven de drempel; alle segmenten onder MIN_SEGMENT_N=5.",
             scan_type="exit", n=12, invited=19,
             factors={"leadership": (4.6, 1.0), "culture": (6.4, 1.0), "growth": (5.2, 1.0),
                      "compensation": (6.1, 1.0), "workload": (5.5, 1.0), "role_clarity": (6.6, 1.0)},
             depts=[("Operations", 4), ("Sales", 3), ("Finance", 3), ("IT", 2)]),
    Scenario("09_gemengde_afdelingen", "Gemengde afdelingsgrootte (n=25)",
             "3 afdelingen van 10+, 2 van 3-4: wat gebeurt er met de kleine?",
             n=25, invited=36, factors=VLAK,
             depts=[("Operations", 10), ("Sales", 6), ("Finance", 5), ("HR", 3), ("Marketing", 1)]),
    Scenario("10_veel_kleine_afdelingen", "Twaalf kleine afdelingen (n=90)",
             "12 afdelingen van 5-9: segmentblok met alleen duidingslabels.",
             n=90, invited=120,
             factors={"leadership": (5.4, 1.1), "culture": (6.5, 1.0), "growth": (5.1, 1.1),
                      "compensation": (6.2, 1.0), "workload": (5.6, 1.1), "role_clarity": (6.6, 1.0)},
             depts=[("Operations", 9), ("Sales", 8), ("Finance", 8), ("IT", 8),
                    ("Customer Success", 8), ("Marketing", 7), ("HR", 7), ("Logistiek", 7),
                    ("Inkoop", 7), ("Kwaliteit", 7), ("Productie", 7), ("Techniek", 7)]),
    Scenario("11_groot_normaal", "Grote populatie, normaal profiel (n=180)",
             "Alles ruim boven elke drempel.",
             n=180, invited=240,
             factors={"leadership": (5.9, 1.2), "culture": (6.8, 1.1), "growth": (5.2, 1.2),
                      "compensation": (6.4, 1.1), "workload": (5.5, 1.2), "role_clarity": (6.9, 1.1)},
             depts=[("Operations", 46), ("Sales", 30), ("Finance", 24), ("IT", 22),
                    ("Customer Success", 20), ("Marketing", 20), ("HR", 18)]),
    Scenario("12_veel_overslag", "60% slaat de verdieping over (n=45)",
             "Profiel 02, maar de verdiepingsbasis valt weg.",
             factors=EEN_LAGE, deepening_skip=0.60),
    Scenario("13_veel_niets_nodig", "40% kiest 'Niets, dit zit hier goed' (n=45)",
             "Primacy-effect op de richtingvraag bij een profiel met een echt probleem.",
             factors=EEN_LAGE,
             direction_none=0.40),
    Scenario("14_veel_anders", "35% kiest 'Anders' (n=45)",
             "Optieset dekt de werkelijkheid niet: wat doet het rapport?",
             factors=EEN_LAGE,
             deepening_other=0.35, direction_other=0.35, direction_none=0.10),
    Scenario("15_richting_verdeeld", "Richting verdeeld op het startpunt (n=45)",
             "Geen optie boven 35%: state 'divided'.",
             factors=EEN_LAGE,
             direction_flat=True, direction_none=0.12),
    Scenario("16_respons_30", "Respons 30% (45 van 150)",
             "Lage respons, verder normaal profiel.",
             n=45, invited=150,
             factors={"leadership": (5.6, 1.1), "culture": (6.6, 1.0), "growth": (5.0, 1.1),
                      "compensation": (6.3, 1.0), "workload": (5.4, 1.1), "role_clarity": (6.7, 1.0)}),
    Scenario("16b_respons_25", "Respons 25% (45 van 180)",
             "Onder de indicatieve drempel: remt het rapport zijn stelligheid?",
             n=45, invited=180,
             factors={"leadership": (5.6, 1.1), "culture": (6.6, 1.0), "growth": (5.0, 1.1),
                      "compensation": (6.3, 1.0), "workload": (5.4, 1.1), "role_clarity": (6.7, 1.0)}),
    Scenario("17_respons_90", "Respons 90% (45 van 50)",
             "Zelfde profiel, hoge respons: verandert het rapport hier iets aan?",
             n=45, invited=50,
             factors={"leadership": (5.6, 1.1), "culture": (6.6, 1.0), "growth": (5.0, 1.1),
                      "compensation": (6.3, 1.0), "workload": (5.4, 1.1), "role_clarity": (6.7, 1.0)}),
    Scenario("18_vlak_n12", "Vlak profiel + n=12",
             "Combinatie: geen uitschieter én nauwelijks basis.",
             n=12, invited=19, factors=VLAK,
             depts=[("Operations", 4), ("Sales", 3), ("Finance", 3), ("IT", 2)]),
    Scenario("19_vlak_niets_nodig", "Vlak profiel + 40% 'niets nodig'",
             "Geen uitschieter én de richtingdata wijst nergens heen.",
             factors=VLAK, direction_none=0.40),
    Scenario("20_onboarding_sanity", "Loep Start sanity (n=30)",
             "Geen verdieping/richting in v1: klopt de copy, geen loze beloften?",
             scan_type="onboarding", n=30, invited=42,
             factors={"leadership": (6.2, 1.0), "culture": (7.0, 1.0), "growth": (6.4, 1.0),
                      "compensation": (6.9, 1.0), "workload": (5.6, 1.1), "role_clarity": (5.1, 1.1)},
             depts=[("Operations", 9), ("Sales", 6), ("Finance", 5), ("IT", 5), ("Marketing", 5)]),
]


# ─── Respondentgeneratie ─────────────────────────────────────────────────────

def _org_items_for(sc: Scenario, dept: str, rng: random.Random) -> dict[str, int]:
    """Ruwe likert-antwoorden (1-5) op de 18 organisatiestellingen."""
    out: dict[str, int] = {}
    shift = sc.dept_shift.get(dept, 0.0)
    for fk in ORG_FACTOR_KEYS:
        mean10, sd10 = sc.factors[fk]
        base_l = to_likert(mean10 + shift)
        sd_l = sd10 * 4.0 / 9.0
        target = rng.gauss(base_l, sd_l)
        for i in (1, 2, 3):
            out[f"{fk}_{i}"] = _clamp_item(rng.gauss(target, ITEM_NOISE))
    return out


def _overall_likert(org_raw: dict[str, int]) -> float:
    vals = list(org_raw.values())
    return sum(vals) / len(vals)


def _sdt_items(overall: float, rng: random.Random, keys: list[str] | None = None) -> dict[str, int]:
    keys = keys or [f"B{i}" for i in range(1, 13)]
    reverse = {"B4", "B8", "B12"}
    base = overall + 0.15
    out = {}
    for k in keys:
        v = rng.gauss(base, 0.6)
        if k in reverse:
            v = 6.0 - v
        out[k] = _clamp_item(v)
    return out


# ── Verdieping & richting: keuzes uit de ECHTE optiesets ─────────────────────

def _split_keys(options: list[dict]) -> tuple[list[str], str | None, str | None]:
    keys = [o["key"] for o in options]
    none_k = next((k for k in keys if k.endswith("_none")), None)
    other_k = next((k for k in keys if k.endswith("_other")), None)
    normal = [k for k in keys if k not in (none_k, other_k)]
    return normal, none_k, other_k


def _concentrated(normal: list[str], mass: float, top_share: float) -> dict[str, float]:
    """Topoptie krijgt top_share van de massa, de rest loopt af."""
    if not normal:
        return {}
    w = {normal[0]: mass * top_share}
    rest = mass * (1 - top_share)
    tail = normal[1:]
    if tail:
        decay = [0.5 ** i for i in range(len(tail))]
        s = sum(decay)
        for k, d in zip(tail, decay):
            w[k] = rest * d / s
    else:
        w[normal[0]] += rest
    return w


def _weights(options: list[dict], *, p_none: float, p_other: float,
             top_share: float, flat_dist: bool) -> dict[str, float]:
    normal, none_k, other_k = _split_keys(options)
    p_none = p_none if none_k else 0.0
    p_other = p_other if other_k else 0.0
    mass = max(0.0, 1.0 - p_none - p_other)
    if flat_dist:
        w = {k: mass / len(normal) for k in normal}
    else:
        w = _concentrated(normal, mass, top_share)
    if none_k:
        w[none_k] = p_none
    if other_k:
        w[other_k] = p_other
    return w


def _pick(weights: dict[str, float], rng: random.Random) -> str:
    r = rng.random() * sum(weights.values())
    acc = 0.0
    for k, v in weights.items():
        acc += v
        if r <= acc:
            return k
    return next(iter(weights))


def _deepening_entries(sc: Scenario, org_raw: dict[str, int], rng: random.Random) -> list[dict] | None:
    entries: list[dict] = []
    sets = get_deepening_sets(sc.scan_type)
    for fk in compute_deepening_offers(org_raw, sc.scan_type):
        version = sets[fk]["question_set_version"]
        if rng.random() < sc.deepening_skip:
            entries.append({"factor_key": fk, "question_set_version": version,
                            "status": "skipped", "primary": None, "secondary": None,
                            "other_text": None})
            continue
        opts = DEEPENING_SETS[fk]["options"]
        w = _weights(opts, p_none=0.0, p_other=sc.deepening_other,
                     top_share=0.45, flat_dist=False)
        primary = _pick(w, rng)
        secondary = None
        if rng.random() < 0.45:
            cand = _pick(w, rng)
            if cand != primary:
                secondary = cand
        entries.append({
            "factor_key": fk, "question_set_version": version, "status": "answered",
            "primary": primary, "secondary": secondary,
            "other_text": ("Iets wat hier niet tussen staat." if primary.endswith("_other") else None),
        })
    return entries or None


def _direction_response(sc: Scenario, org_raw: dict[str, int], rng: random.Random) -> dict | None:
    fk = compute_direction_factor(org_raw)
    if fk is None:
        return None
    version = get_direction_sets(sc.scan_type)[fk]["question_set_version"]
    if rng.random() < sc.direction_skip:
        return {"factor_key": fk, "question_set_version": version, "status": "skipped",
                "choice": None, "other_text": None}
    w = _weights(DIRECTION_SETS[fk]["options"], p_none=sc.direction_none,
                 p_other=sc.direction_other, top_share=sc.direction_top_share,
                 flat_dist=sc.direction_flat)
    choice = _pick(w, rng)
    return {"factor_key": fk, "question_set_version": version, "status": "answered",
            "choice": choice,
            "other_text": ("Iets wat hier niet tussen staat." if choice.endswith("_other") else None)}


# ── Payloads per scantype ────────────────────────────────────────────────────

def _retention_payload(sc: Scenario, org_raw: dict[str, int], rng: random.Random) -> dict:
    overall = _overall_likert(org_raw)
    sdt_raw = _sdt_items(overall, rng)
    sdt_scores = compute_sdt_scores(sdt_raw)
    org_scores = compute_org_scores(org_raw)
    risk = compute_retention_risk(sdt_scores, org_scores, scan_type="retention")

    eng_base = 1.0 + (overall - 1.0) * 1.05
    to_base = 5.4 - (overall - 1.0) * 1.05
    uwes_raw = {f"uwes_{i}": _clamp_item(rng.gauss(eng_base, 0.6)) for i in (1, 2, 3)}
    turnover_raw = {f"ti_{i}": _clamp_item(rng.gauss(to_base, 0.6)) for i in (1, 2)}
    stay_intent = _clamp_item(rng.gauss(max(1.2, 5.4 - to_base), 0.6))
    supp = compute_retention_supplemental_scores(uwes_raw, turnover_raw, stay_intent)

    summary = {
        "retention_signal_score": risk["risk_score"],
        "retention_signal_band": risk["risk_band"],
        "engagement_score": supp["engagement_score"],
        "turnover_intention_score": supp["turnover_intention_score"],
        "stay_intent_score": supp["stay_intent_score"],
        "signal_profile": compute_retention_signal_profile(
            risk_score=risk["risk_score"], engagement_score=supp["engagement_score"],
            turnover_intention_score=supp["turnover_intention_score"],
            stay_intent_score=supp["stay_intent_score"]),
    }
    text = rng.choice(RETENTION_OPEN_TEXTS)
    return dict(
        tenure_years=None, exit_reason_category=None, exit_reason_code=None,
        stay_intent_score=stay_intent, sdt_raw=sdt_raw, sdt_scores=sdt_scores,
        org_raw=org_raw, org_scores=org_scores, pull_factors_raw={},
        open_text_raw=anonymize_text(text) if text else None,
        uwes_raw=uwes_raw, uwes_score=supp["engagement_score"],
        turnover_intention_raw=turnover_raw,
        turnover_intention_score=supp["turnover_intention_score"],
        risk_score=risk["risk_score"], risk_band=risk["risk_band"],
        preventability=None, replacement_cost_eur=None,
        full_result={
            "sdt_scores": sdt_scores, "org_scores": org_scores, "risk_result": risk,
            "recommendations": get_recommendations(risk["factor_risks"]),
            "uwes_score": supp["engagement_score"],
            "turnover_intention_score": supp["turnover_intention_score"],
            "stay_intent_signal_score": supp["stay_intent_score"],
            "retention_summary": summary,
            "enps": build_enps_summary(max(0, min(10, round(
                supp["engagement_score"] + rng.uniform(0.0, 3.0))))),
        },
        deepening_responses=_deepening_entries(sc, org_raw, rng),
        direction_response=_direction_response(sc, org_raw, rng),
    )


def _exit_payload(sc: Scenario, org_raw: dict[str, int], rng: random.Random,
                  salary: int, role: str) -> dict:
    overall = _overall_likert(org_raw)
    sdt_raw = _sdt_items(overall, rng)
    sdt_scores = compute_sdt_scores(sdt_raw)
    org_scores = compute_org_scores(org_raw)
    risk = compute_retention_risk(sdt_scores, org_scores)

    lowest = min(ORG_FACTOR_KEYS, key=lambda fk: org_scores.get(fk, 5.5))
    roll = rng.random()
    if roll < 0.62:
        category, code = EXIT_REASON_BY_FACTOR[lowest]
    elif roll < 0.82:
        category, code = "beter_aanbod", "PL1"
    else:
        category, code = "persoonlijk", "S1"

    contributing = []
    ranked = sorted(ORG_FACTOR_KEYS, key=lambda fk: org_scores.get(fk, 5.5))
    for fk in ranked[1:3]:
        if org_scores.get(fk, 10) < 6.0 and rng.random() < 0.5:
            contributing.append(EXIT_REASON_BY_FACTOR[fk][1])

    stay_intent = _clamp_item(rng.gauss(2.0 + (overall - 1.0) * 0.6, 0.7))
    prev = compute_preventability(
        exit_reason_category=category, stay_intent_score=stay_intent,
        sdt_scores=sdt_scores, org_scores=org_scores,
        contributing_reason_codes=contributing)
    repl = compute_replacement_cost(salary, role)
    text = rng.choice(EXIT_OPEN_TEXTS)
    return dict(
        tenure_years=rng.choice(TENURES), exit_reason_category=category,
        exit_reason_code=code, stay_intent_score=stay_intent,
        sdt_raw=sdt_raw, sdt_scores=sdt_scores, org_raw=org_raw, org_scores=org_scores,
        pull_factors_raw={c: 1 for c in contributing},
        open_text_raw=anonymize_text(text) if text else None,
        uwes_raw={}, uwes_score=None, turnover_intention_raw={},
        turnover_intention_score=None,
        risk_score=risk["risk_score"], risk_band=risk["risk_band"],
        preventability=prev["preventability"],
        replacement_cost_eur=repl["cost_per_employee"],
        full_result={
            "sdt_scores": sdt_scores, "org_scores": org_scores, "risk_result": risk,
            "preventability_result": prev,
            "recommendations": get_recommendations(risk["factor_risks"]),
            "enps": build_enps_summary(max(0, min(10, round(
                10 - risk["risk_score"] + rng.uniform(0.5, 2.5))))),
        },
        deepening_responses=_deepening_entries(sc, org_raw, rng),
        direction_response=_direction_response(sc, org_raw, rng),
    )


def _onboarding_payload(sc: Scenario, org_raw: dict[str, int], rng: random.Random) -> dict:
    from backend.products.onboarding.scoring import compute_onboarding_risk

    overall = _overall_likert(org_raw)
    sdt_raw = _sdt_items(overall, rng, keys=["B1", "B5", "B9"])
    sdt_scores = compute_sdt_scores(sdt_raw)
    org_scores = compute_org_scores(org_raw)
    active = list(org_scores.keys())
    risk = compute_onboarding_risk(sdt_scores, org_scores, active)
    stay_intent = _clamp_item(rng.gauss(1.5 + (overall - 1.0) * 0.8, 0.7))
    text = rng.choice(ONBOARDING_OPEN_TEXTS)
    return dict(
        tenure_years=None, exit_reason_category=None, exit_reason_code=None,
        stay_intent_score=stay_intent, sdt_raw=sdt_raw, sdt_scores=sdt_scores,
        org_raw=org_raw, org_scores=org_scores, pull_factors_raw={},
        open_text_raw=anonymize_text(text) if text else None,
        uwes_raw={}, uwes_score=None, turnover_intention_raw={},
        turnover_intention_score=None,
        risk_score=risk["risk_score"], risk_band=risk["risk_band"],
        preventability=None, replacement_cost_eur=None,
        full_result={
            "sdt_scores": sdt_scores, "org_scores": org_scores, "risk_result": risk,
            "onboarding_summary": {
                "onboarding_signal_score": risk["risk_score"],
                "onboarding_signal_band": risk["risk_band"],
                "checkpoint_direction_score": stay_intent,
                "active_factors": active, "snapshot_type": "single_checkpoint",
            },
            "recommendations": get_recommendations(risk["factor_risks"]),
            "active_factors": active,
        },
        deepening_responses=None, direction_response=None,
    )


# ─── Uitvoering ──────────────────────────────────────────────────────────────

def _dept_plan(sc: Scenario) -> list[str]:
    if sc.depts:
        labels: list[str] = []
        for label, cnt in sc.depts:
            labels.extend([label] * cnt)
        if len(labels) != sc.n:
            raise ValueError(f"{sc.key}: afdelingsplan telt {len(labels)}, verwacht {sc.n}")
        return labels
    labels = []
    for label, share in DEFAULT_DEPTS:
        labels.extend([label] * max(1, round(sc.n * share)))
    return labels[:sc.n] + [DEFAULT_DEPTS[0][0]] * max(0, sc.n - len(labels))


def run_scenario(sc: Scenario) -> dict:
    rng = random.Random(f"{SEED}-{sc.key}")
    engine = create_engine("sqlite://", connect_args={"check_same_thread": False},
                           poolclass=StaticPool, echo=False)
    Base.metadata.create_all(bind=engine)
    db = sessionmaker(autocommit=False, autoflush=False, bind=engine)()

    org = Organization(id=str(uuid.uuid4()), name="Stresstest B.V.",
                       slug=f"stresstest-{sc.num}", contact_email="qa@stresstest.local",
                       is_active=True)
    db.add(org)
    db.flush()
    campaign = Campaign(id=str(uuid.uuid4()), organization_id=org.id,
                        name=f"Stresstest {sc.num} - {sc.title}", scan_type=sc.scan_type,
                        is_active=False)
    db.add(campaign)
    db.flush()

    invited = sc.invited if sc.invited is not None else max(sc.n, round(sc.n / 0.7))
    labels = _dept_plan(sc)
    dept_counts: dict[str, int] = {}
    now = datetime.now(timezone.utc)

    for i in range(sc.n):
        dept = labels[i]
        role = rng.choice(ROLE_LEVELS)
        salary = rng.choice(SALARIES)
        respondent = Respondent(id=str(uuid.uuid4()), campaign_id=campaign.id,
                                department=dept, role_level=role,
                                annual_salary_eur=float(salary), sent_at=now,
                                opened_at=now, completed=True, completed_at=now)
        db.add(respondent)
        db.flush()
        dept_counts[dept] = dept_counts.get(dept, 0) + 1
        org_raw = _org_items_for(sc, dept, rng)
        if sc.scan_type == "retention":
            p = _retention_payload(sc, org_raw, rng)
        elif sc.scan_type == "exit":
            p = _exit_payload(sc, org_raw, rng, salary, role)
        else:
            p = _onboarding_payload(sc, org_raw, rng)
        db.add(SurveyResponse(id=str(uuid.uuid4()), respondent_id=respondent.id, **p))

    # Non-responders: verdeeld over dezelfde afdelingen, zodat de noemer per
    # afdeling (invited_count) een realistische responsgraad geeft.
    for i in range(invited - sc.n):
        dept = labels[i % len(labels)]
        db.add(Respondent(id=str(uuid.uuid4()), campaign_id=campaign.id, department=dept,
                          role_level=rng.choice(ROLE_LEVELS),
                          annual_salary_eur=float(rng.choice(SALARIES)),
                          sent_at=now, opened_at=None, completed=False, completed_at=None))
        dept_counts[dept] = dept_counts.get(dept, 0) + 1

    campaign.segment_departments = [
        {"label": label, "slug": slugify_department(label), "invited_count": cnt}
        for label, cnt in sorted(dept_counts.items())
    ]
    db.commit()

    data = build_report_data(campaign.id, db)
    html = render_report_html(data)
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    out = OUT_DIR / f"{sc.key}.html"
    out.write_text(html, encoding="utf-8")

    meta = {
        "key": sc.key, "title": sc.title, "doel": sc.doel, "scan_type": sc.scan_type,
        "n": sc.n, "invited": invited,
        "respons_pct": round(sc.n / invited * 100, 1),
        "factor_avgs": {k: v for k, v in (data.get("factor_avgs") or {}).items()},
        "has_pattern": data.get("has_pattern"),
        "deepening_agg": data.get("deepening_agg"),
        "direction_agg": data.get("direction_agg"),
        "segment_rows": data.get("segment_rows"),
        "enps_available": data.get("enps_available"),
        "open_texts": len(data.get("open_texts") or []),
        "html": str(out),
        "html_kb": round(len(html.encode("utf-8")) / 1024, 1),
    }
    (OUT_DIR / f"{sc.key}.meta.json").write_text(
        json.dumps(meta, indent=2, ensure_ascii=False, default=str), encoding="utf-8")

    db.close()
    engine.dispose()
    return meta


def _render_pdfs(keys: list[str]) -> None:
    """PDF via Chromium (WeasyPrint-Docker draait niet op deze machine).
    Paginering benadert WeasyPrint; goed genoeg voor 'holle pagina'-detectie."""
    from playwright.sync_api import sync_playwright

    with sync_playwright() as pw:
        browser = pw.chromium.launch()
        page = browser.new_page()
        for k in keys:
            src = OUT_DIR / f"{k}.html"
            if not src.exists():
                continue
            page.goto(src.as_uri())
            page.pdf(path=str(OUT_DIR / f"{k}.pdf"), format="A4",
                     print_background=True, margin={"top": "0", "bottom": "0",
                                                    "left": "0", "right": "0"})
            print(f"  pdf: {k}.pdf")
        browser.close()


def main() -> None:
    ap = argparse.ArgumentParser(description="Loep rapport-stresstest (QA, niet-productie).")
    ap.add_argument("selection", nargs="*", help="Scenario-nummers, bv. 01 07 20")
    ap.add_argument("--list", action="store_true")
    ap.add_argument("--pdf", action="store_true", help="Render ook PDF via Chromium.")
    args = ap.parse_args()

    if args.list:
        for sc in SCENARIOS:
            print(f"{sc.num}  {sc.scan_type:<10} n={sc.n:<4} {sc.title}")
        return

    todo = [sc for sc in SCENARIOS if not args.selection or sc.num in args.selection]
    for sc in todo:
        meta = run_scenario(sc)
        fa = meta["factor_avgs"]
        shown = " ".join(f"{k[:4]}={fa[k]:.1f}" for k in ORG_FACTOR_KEYS if k in fa)
        print(f"[{sc.num}] {sc.title}: n={meta['n']}/{meta['invited']} "
              f"({meta['respons_pct']}%) patroon={meta['has_pattern']} {shown}")
    if args.pdf:
        _render_pdfs([sc.key for sc in todo])


if __name__ == "__main__":
    main()

"""
Verisight — Scoring Engine
================================
All HR-methodological logic lives here. No I/O, no DB, no web framework.
Pure functions: input dict → output dict.

Scientific foundations:
  - SDT / BPNS-Work: Van den Broeck et al. (2010); Deci et al. (2001)
  - LMX-7: Graen & Uhl-Bien (1995)
  - Psychological Safety: Edmondson (1999)
  - JD-R: Bakker & Demerouti (2007)
  - JSS: Spector (1985)
  - Role Conflict/Ambiguity: Rizzo, House & Lirtzman (1970)
  - UWES-3: Schaufeli et al. (2006)
  - Push-Pull: Mitchell & Lee (2001); Lee & Mitchell (1994)
  - Avoidable Turnover: Holtom et al. (2008)
  - Replacement costs: SHRM / Josh Bersin Institute
  - Gallup State of the Workplace 2023 (management weight)
"""

from __future__ import annotations

import re
from typing import Any

# ---------------------------------------------------------------------------
# Constants
# ---------------------------------------------------------------------------

# Scale transform: Likert 1-5 → internal 1-10
# formula: (raw - 1) / 4 * 9 + 1
def _scale(raw: float) -> float:
    return (raw - 1) / 4 * 9 + 1


# SDT reverse-coded items (1-indexed question labels within Module B)
# Items B4, B8, B12 measure frustration → must be reversed before averaging
SDT_REVERSE_ITEMS = {"B4", "B8", "B12"}

# Module B item → dimension mapping
# Autonomy: B1-B4, Competence: B5-B8, Relatedness: B9-B12
SDT_DIMENSION_ITEMS: dict[str, list[str]] = {
    "autonomy":    ["B1", "B2", "B3", "B4"],
    "competence":  ["B5", "B6", "B7", "B8"],
    "relatedness": ["B9", "B10", "B11", "B12"],
}

# Org-factor module keys (Module C)
ORG_FACTOR_KEYS = [
    "leadership",   # C1  LMX / management quality
    "culture",      # C2  psychological safety / fit
    "growth",       # C3  career / development
    "compensation", # C4  pay / benefits
    "workload",     # C5  JD-R demands (inverse: high score = high load)
    "role_clarity", # C6  role ambiguity/conflict
]

# Gallup 2023 + JD-R weighting for retention risk score
# management ×2.5 is the headline Gallup finding
SCAN_WEIGHTS: dict[str, float] = {
    "leadership":   2.5,
    "culture":      1.5,
    "growth":       1.5,
    "compensation": 1.0,
    "workload":     1.0,   # raw score is load; inverted before weighting
    "role_clarity": 1.0,
}

# Role-based replacement cost multipliers (SHRM / Bersin Institute)
ROLE_MULTIPLIERS: dict[str, float] = {
    "uitvoerend":  0.50,
    "specialist":  1.00,
    "senior":      1.50,
    "manager":     2.00,
    "director":    2.50,
    "c_level":     3.00,
}
DEFAULT_ROLE_MULTIPLIER = 1.00

# Risk thresholds
RISK_HIGH   = 7.0
RISK_MEDIUM = 4.5

# ---------------------------------------------------------------------------
# Text anonymisation (AVG/GDPR)
# ---------------------------------------------------------------------------

_PATTERNS = [
    (re.compile(r"\b[A-Za-z0-9._%+\-]+@[A-Za-z0-9.\-]+\.[A-Za-z]{2,}\b"), "[EMAIL]"),
    (re.compile(r"\b(?:\+31|0031|0)[1-9]\d{8}\b"), "[TELEFOON]"),
    # Dutch full name patterns: capitalised word + capitalised word (heuristic)
    (re.compile(r"\b[A-Z][a-z]{2,}\s(?:van\s(?:de[rn]?\s)?|de\s|den\s|der\s)?[A-Z][a-z]{2,}\b"), "[NAAM]"),
    (re.compile(r"\b\d{4}\s?[A-Z]{2}\b"), "[POSTCODE]"),
]


def anonymize_text(text: str) -> str:
    """Strip PII patterns from open-text responses."""
    for pattern, replacement in _PATTERNS:
        text = pattern.sub(replacement, text)
    return text.strip()


# ---------------------------------------------------------------------------
# Module B — SDT scoring
# ---------------------------------------------------------------------------

def compute_sdt_scores(responses: dict[str, int]) -> dict[str, Any]:
    """
    Compute SDT need satisfaction scores from Module B Likert responses.

    Parameters
    ----------
    responses : dict mapping item key (e.g. "B1") to raw Likert value 1-5

    Returns
    -------
    {
        "autonomy":    float (1-10),
        "competence":  float (1-10),
        "relatedness": float (1-10),
        "sdt_total":   float (1-10),  # unweighted mean of 3 dimensions
        "sdt_risk":    float (0-10),  # inverted: low satisfaction = high risk
    }
    """
    dim_scores: dict[str, float] = {}

    for dimension, items in SDT_DIMENSION_ITEMS.items():
        scaled_values = []
        for item in items:
            raw = responses.get(item)
            if raw is None:
                continue
            raw = float(raw)
            # Reverse frustration items before scaling
            if item in SDT_REVERSE_ITEMS:
                raw = 6.0 - raw  # invert on 1-5 scale
            scaled_values.append(_scale(raw))

        if scaled_values:
            dim_scores[dimension] = round(sum(scaled_values) / len(scaled_values), 2)
        else:
            dim_scores[dimension] = 5.5  # neutral fallback

    sdt_total = round(sum(dim_scores.values()) / len(dim_scores), 2)
    sdt_risk  = round(11.0 - sdt_total, 2)  # 10→1 (very satisfied = low risk)

    return {
        "autonomy":    dim_scores.get("autonomy",    5.5),
        "competence":  dim_scores.get("competence",  5.5),
        "relatedness": dim_scores.get("relatedness", 5.5),
        "sdt_total":   sdt_total,
        "sdt_risk":    sdt_risk,
    }


# ---------------------------------------------------------------------------
# Module C — Org-factor scoring
# ---------------------------------------------------------------------------

def compute_org_scores(responses: dict[str, int | float]) -> dict[str, float]:
    """
    Compute per-theme org-factor scores from Module C items.

    Workload items are averaged but NOT inverted here — the inversion happens
    in the risk model so that visualisations can show raw load vs. risk
    contribution separately.

    Parameters
    ----------
    responses : dict mapping e.g. "leadership_1", "leadership_2", ...
                Each value is a raw Likert 1-5.

    Returns
    -------
    dict mapping factor name → scaled score (1-10).
    """
    factor_scores: dict[str, float] = {}

    for factor in ORG_FACTOR_KEYS:
        items = [v for k, v in responses.items() if k.startswith(factor)]
        if items:
            avg = sum(float(i) for i in items) / len(items)
            factor_scores[factor] = round(_scale(avg), 2)
        else:
            factor_scores[factor] = 5.5

    return factor_scores


# ---------------------------------------------------------------------------
# Retention risk score
# ---------------------------------------------------------------------------

def compute_retention_risk(
    sdt_scores: dict[str, Any],
    org_scores: dict[str, float],
) -> dict[str, Any]:
    """
    Compute weighted retention risk score (0-10).

    Model:
      1. Each org factor is converted to a risk contribution.
         For workload: risk = raw_score (high load = high risk).
         For all others: risk = 11 - score (low satisfaction = high risk).
      2. SDT risk contributes as an additional weighted component (weight = 2.0).
      3. Weighted sum is normalised to 0-10.

    Returns dict with:
      - "risk_score"       : float 0-10
      - "risk_band"        : "HOOG" | "MIDDEN" | "LAAG"
      - "factor_risks"     : dict factor → risk contribution (pre-weight)
      - "factor_weights"   : dict factor → weight used
      - "weighted_factors" : dict factor → weighted risk value
    """
    factor_risks: dict[str, float] = {}
    weighted: dict[str, float] = {}
    weights = dict(SCAN_WEIGHTS)  # copy

    # Org factor risk contributions
    for factor in ORG_FACTOR_KEYS:
        score = org_scores.get(factor, 5.5)
        if factor == "workload":
            risk = score  # already high = bad
        else:
            risk = round(11.0 - score, 2)
        factor_risks[factor] = round(risk, 2)
        weighted[factor] = round(risk * weights[factor], 2)

    # SDT risk as synthetic factor
    sdt_risk = sdt_scores.get("sdt_risk", 5.5)
    sdt_weight = 2.0
    weights["sdt"] = sdt_weight
    factor_risks["sdt"] = round(sdt_risk, 2)
    weighted["sdt"] = round(sdt_risk * sdt_weight, 2)

    total_weight = sum(weights.values())
    raw_risk = sum(weighted.values()) / total_weight
    # Clamp to [1, 10]
    risk_score = round(max(1.0, min(10.0, raw_risk)), 2)

    if risk_score >= RISK_HIGH:
        band = "HOOG"
    elif risk_score >= RISK_MEDIUM:
        band = "MIDDEN"
    else:
        band = "LAAG"

    return {
        "risk_score":       risk_score,
        "risk_band":        band,
        "factor_risks":     factor_risks,
        "factor_weights":   weights,
        "weighted_factors": weighted,
    }


# ---------------------------------------------------------------------------
# Preventability algorithm (exit surveys only)
# ---------------------------------------------------------------------------

def compute_preventability(
    exit_reason_category: str,
    stay_intent_score: int,
    sdt_scores: dict[str, Any],
    org_scores: dict[str, float],
) -> dict[str, Any]:
    """
    4-step avoidable turnover classification (Holtom et al., 2008 framework).

    Step 1 — Is exit reason inherently unpreventable?
      Unpreventable categories: "persoonlijk", "verhuizing", "studie", "pensioen",
      "partner_verhuisd", "gezondheid".
      If yes → "NIET_REDBAAR" immediately.

    Step 2 — Stay intent check.
      stay_intent_score: 1 (definitely leaving) … 5 (might have stayed).
      If score ≤ 2 AND reason is NOT a push factor → "MOGELIJK_REDBAAR".

    Step 3 — SDT + org context check.
      If any SDT dimension < 4.0 OR any satisfier factor < 4.0 → "REDBAAR".

    Step 4 — Fallback → "MOGELIJK_REDBAAR".

    Returns
    -------
    {
        "preventability": "REDBAAR" | "MOGELIJK_REDBAAR" | "NIET_REDBAAR",
        "preventability_label": str (Dutch),
        "reasoning": str,
    }
    """
    UNPREVENTABLE = {
        "persoonlijk", "verhuizing", "studie", "pensioen",
        "partner_verhuisd", "gezondheid", "overig_persoonlijk",
    }
    SATISFIER_FACTORS = {"leadership", "culture", "growth", "role_clarity"}

    # Step 1
    if exit_reason_category.lower() in UNPREVENTABLE:
        return {
            "preventability": "NIET_REDBAAR",
            "preventability_label": "Niet redbaar",
            "reasoning": "Vertrekreden is van persoonlijke aard en buiten invloedssfeer organisatie.",
        }

    # Step 2
    if stay_intent_score <= 2:
        # Strong intent to leave even with org factors at play
        return {
            "preventability": "MOGELIJK_REDBAAR",
            "preventability_label": "Mogelijk redbaar",
            "reasoning": "Lage blijfbereidheid — organisatie had wellicht eerder kunnen ingrijpen.",
        }

    # Step 3 — SDT context
    sdt_dims = ["autonomy", "competence", "relatedness"]
    low_sdt = [d for d in sdt_dims if sdt_scores.get(d, 5.5) < 4.0]
    low_org = [f for f in SATISFIER_FACTORS if org_scores.get(f, 5.5) < 4.0]

    if low_sdt or low_org:
        triggers = low_sdt + low_org
        return {
            "preventability": "REDBAAR",
            "preventability_label": "Redbaar",
            "reasoning": (
                f"Lage scores op: {', '.join(triggers)}. "
                "Gerichte interventie had vertrek mogelijk voorkomen."
            ),
        }

    # Step 4
    return {
        "preventability": "MOGELIJK_REDBAAR",
        "preventability_label": "Mogelijk redbaar",
        "reasoning": "Scores geven geen duidelijk patroon; aanvullende context aanbevolen.",
    }


# ---------------------------------------------------------------------------
# Replacement cost estimate
# ---------------------------------------------------------------------------

def compute_replacement_cost(
    annual_salary: float,
    role_level: str,
    n_employees_affected: int = 1,
) -> dict[str, Any]:
    """
    Estimate replacement cost based on SHRM / Bersin Institute multipliers.

    Parameters
    ----------
    annual_salary : gross annual salary in EUR
    role_level    : one of ROLE_MULTIPLIERS keys (default: "specialist")
    n_employees_affected : for aggregate calculations

    Returns
    -------
    {
        "multiplier":         float,
        "cost_per_employee":  float (EUR),
        "total_cost":         float (EUR),
        "role_level":         str,
    }
    """
    multiplier = ROLE_MULTIPLIERS.get(role_level.lower(), DEFAULT_ROLE_MULTIPLIER)
    cost_per = round(annual_salary * multiplier, 2)
    return {
        "multiplier":        multiplier,
        "cost_per_employee": cost_per,
        "total_cost":        round(cost_per * n_employees_affected, 2),
        "role_level":        role_level,
    }


# ---------------------------------------------------------------------------
# Recommendation engine
# ---------------------------------------------------------------------------

# Per-theme, per-band recommendations (Dutch, ready for dashboard/report)
RECOMMENDATIONS: dict[str, dict[str, list[str]]] = {
    "leadership": {
        "HOOG": [
            "Implementeer direct een 1:1 check-in structuur (wekelijks, 30 min).",
            "Start leiderschapstraject gericht op coachend management (SDT-based).",
            "Overweeg 360°-feedback voor direct leidinggevenden binnen 30 dagen.",
            "Evalueer span-of-control: is het aantal directe rapporten beheersbaar?",
        ],
        "MIDDEN": [
            "Plan kwartaalgesprekken over ontwikkeling en werkbeleving.",
            "Introduceer concrete feedbackmomenten in bestaande teamoverleggen.",
            "Zorg voor heldere escalatiepaden bij spanningen tussen medewerker en manager.",
        ],
        "LAAG": [
            "Leiderschapskwaliteit scoort goed — periodiek monitoren volstaat.",
            "Deel best practices van sterke managers intern.",
        ],
    },
    "culture": {
        "HOOG": [
            "Voer cultuuraudit uit (psychologische veiligheid — Edmondson-instrument).",
            "Stel actieplan op voor inclusie en respect op de werkplek.",
            "Adresseer specifieke cultuurklachten uit open teksten binnen 2 weken.",
        ],
        "MIDDEN": [
            "Organiseer team-sessies rondom waarden en gedragsnormen.",
            "Meet psychologische veiligheid elk kwartaal (benchmark intern).",
        ],
        "LAAG": [
            "Cultuurscores positief — bewaken bij organisatieveranderingen.",
        ],
    },
    "growth": {
        "HOOG": [
            "Stel binnen 30 dagen persoonlijk ontwikkelplan op voor iedere medewerker.",
            "Introduceer of activeer mentoring- en interne mobiliteitsprogramma.",
            "Maak loopbaanpaden zichtbaar en bespreekbaar (carrière-architectuur).",
        ],
        "MIDDEN": [
            "Evalueer of L&D-budget effectief wordt ingezet.",
            "Voeg groeigesprek toe aan jaarcyclus (naast beoordelingsgesprek).",
        ],
        "LAAG": [
            "Groeimogelijkheden worden gewaardeerd — behoud huidige aanpak.",
        ],
    },
    "compensation": {
        "HOOG": [
            "Voer marktconforme beloningsscan uit (benchmark extern).",
            "Onderzoek non-financiële arbeidsvoorwaarden als aanvulling.",
            "Communiceer transparant over beloningsstructuur en groeipaden.",
        ],
        "MIDDEN": [
            "Evalueer arbeidsvoorwaarden bij volgende CAO-ronde of budgetcyclus.",
            "Overweeg flexibele benefits (keuzebudget).",
        ],
        "LAAG": [
            "Beloning wordt als marktconform ervaren — geen directe actie vereist.",
        ],
    },
    "workload": {
        "HOOG": [
            "Urgent: analyseer werklastklachten en stel concrete capaciteitsmaatregelen in.",
            "Voer JD-R resources-scan uit — zijn er voldoende taakhulpbronnen?",
            "Overweeg tijdelijke capaciteitsuitbreiding of herindeling van taken.",
        ],
        "MIDDEN": [
            "Monitor werklastbeleving maandelijks via korte pulse-meting.",
            "Bespreek werkdruk actief in teamoverleg.",
        ],
        "LAAG": [
            "Werkbelasting in balans — handhaven huidige aanpak.",
        ],
    },
    "role_clarity": {
        "HOOG": [
            "Herschrijf functiebeschrijvingen en bespreek deze individueel.",
            "Introduceer RACI-model voor cruciale processen.",
            "Zorg dat verwachtingen aantoonbaar zijn gecommuniceerd (schriftelijk).",
        ],
        "MIDDEN": [
            "Verhelder taken en verantwoordelijkheden in teamoverleg.",
            "Controleer of KPI's en doelen voor iedereen helder zijn.",
        ],
        "LAAG": [
            "Rolhelderheid goed — geen actie vereist.",
        ],
    },
}


def get_recommendations(
    factor_risks: dict[str, float],
    risk_bands: dict[str, str] | None = None,
) -> dict[str, list[str]]:
    """
    Return relevant recommendations per factor based on risk scores.

    Parameters
    ----------
    factor_risks : dict factor → risk value (1-10)
    risk_bands   : optional override; if None, bands are derived from scores

    Returns
    -------
    dict factor → list of recommendation strings
    """
    result: dict[str, list[str]] = {}

    for factor in ORG_FACTOR_KEYS:
        score = factor_risks.get(factor, 5.5)

        if risk_bands and factor in risk_bands:
            band = risk_bands[factor]
        elif score >= RISK_HIGH:
            band = "HOOG"
        elif score >= RISK_MEDIUM:
            band = "MIDDEN"
        else:
            band = "LAAG"

        recs = RECOMMENDATIONS.get(factor, {}).get(band, [])
        result[factor] = recs

    return result


# ---------------------------------------------------------------------------
# Pattern detection (aggregate — min n=5 for GDPR-safe reporting)
# ---------------------------------------------------------------------------

MIN_AGGREGATE_N = 5

FACTOR_LABELS_NL: dict[str, str] = {
    "leadership":   "Leiderschap",
    "culture":      "Cultuur & Veiligheid",
    "growth":       "Groei & Ontwikkeling",
    "compensation": "Beloning",
    "workload":     "Werkbelasting",
    "role_clarity": "Rolhelderheid",
    "sdt":          "Basisbehoeften (SDT)",
    "autonomy":     "Autonomie",
    "competence":   "Competentie",
    "relatedness":  "Verbondenheid",
}

EXIT_REASON_LABELS_NL: dict[str, str] = {
    # Push factors
    "P1": "Leiderschap / management",
    "P2": "Organisatiecultuur",
    "P3": "Gebrek aan groei",
    "P4": "Beloning",
    "P5": "Werkdruk / stress",
    "P6": "Rolonduidelijkheid",
    # Pull factors
    "PL1": "Beter aanbod elders",
    "PL2": "Carrièreswitch",
    "PL3": "Ondernemerschap",
    # Situational
    "S1": "Persoonlijke omstandigheid",
    "S2": "Verhuizing / partner",
    "S3": "Studie / pensioen",
}


def detect_patterns(responses: list[dict[str, Any]]) -> dict[str, Any]:
    """
    Detect organisational risk patterns from a list of (exit or retention) response dicts.

    Each response dict should contain at minimum:
      - "org_scores"  : dict factor → float
      - "sdt_scores"  : dict with autonomy/competence/relatedness/sdt_total
      - "risk_score"  : float
      - Optionally "exit_reason_code", "preventability", "department", "role_level"

    Returns a pattern report dict (safe for display when n >= MIN_AGGREGATE_N).
    """
    n = len(responses)
    if n < MIN_AGGREGATE_N:
        return {
            "n": n,
            "sufficient_data": False,
            "message": f"Minimaal {MIN_AGGREGATE_N} responses vereist voor anonieme rapportage (nu: {n}).",
        }

    # Aggregate factor scores
    all_factors = ORG_FACTOR_KEYS + ["autonomy", "competence", "relatedness"]
    factor_totals: dict[str, list[float]] = {f: [] for f in all_factors}

    risk_scores: list[float] = []
    preventability_counts: dict[str, int] = {"REDBAAR": 0, "MOGELIJK_REDBAAR": 0, "NIET_REDBAAR": 0}
    exit_reason_counts: dict[str, int] = {}
    department_risks: dict[str, list[float]] = {}

    for r in responses:
        # Org scores
        org = r.get("org_scores", {})
        for f in ORG_FACTOR_KEYS:
            val = org.get(f)
            if val is not None:
                factor_totals[f].append(float(val))

        # SDT scores
        sdt = r.get("sdt_scores", {})
        for dim in ["autonomy", "competence", "relatedness"]:
            val = sdt.get(dim)
            if val is not None:
                factor_totals[dim].append(float(val))

        # Risk
        rs = r.get("risk_score")
        if rs is not None:
            risk_scores.append(float(rs))

        # Preventability
        prev = r.get("preventability")
        if prev in preventability_counts:
            preventability_counts[prev] += 1

        # Exit reason
        code = r.get("exit_reason_code")
        if code:
            exit_reason_counts[code] = exit_reason_counts.get(code, 0) + 1

        # Department breakdown
        dept = r.get("department", "Onbekend")
        rs_val = r.get("risk_score")
        if rs_val is not None:
            department_risks.setdefault(dept, []).append(float(rs_val))

    # Compute averages
    factor_averages = {
        f: round(sum(vals) / len(vals), 2)
        for f, vals in factor_totals.items()
        if vals
    }

    avg_risk = round(sum(risk_scores) / len(risk_scores), 2) if risk_scores else None

    # Identify top risks (factors with risk > threshold)
    top_risks = sorted(
        [
            (f, round(11.0 - factor_averages[f], 2) if f != "workload" else factor_averages[f])
            for f in ORG_FACTOR_KEYS
            if f in factor_averages
        ],
        key=lambda x: x[1],
        reverse=True,
    )

    # Department averages
    dept_avg = {
        dept: round(sum(vals) / len(vals), 2)
        for dept, vals in department_risks.items()
        if len(vals) >= 2  # at least 2 per dept for safety
    }

    # Exit reason top 3
    top_exit_reasons = sorted(exit_reason_counts.items(), key=lambda x: x[1], reverse=True)[:3]

    # Avoidable turnover rate
    total_exit = sum(preventability_counts.values())
    avoidable_rate = (
        round(preventability_counts.get("REDBAAR", 0) / total_exit * 100, 1)
        if total_exit > 0 else None
    )

    return {
        "n":                    n,
        "sufficient_data":      True,
        "avg_risk_score":       avg_risk,
        "factor_averages":      factor_averages,
        "top_risk_factors":     top_risks,
        "preventability_counts": preventability_counts,
        "avoidable_rate_pct":   avoidable_rate,
        "exit_reason_counts":   exit_reason_counts,
        "top_exit_reasons":     [
            {"code": code, "label": EXIT_REASON_LABELS_NL.get(code, code), "count": cnt}
            for code, cnt in top_exit_reasons
        ],
        "department_avg_risk":  dept_avg,
    }

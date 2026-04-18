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
from backend.scoring_config import (
    DEFAULT_ROLE_MULTIPLIER,
    EXIT_REASON_LABELS_NL,
    EXIT_SCAN_WEIGHTS,
    FACTOR_LABELS_NL,
    MIN_AGGREGATE_N,
    MIN_SEGMENT_N,
    ORG_FACTOR_KEYS,
    RECOMMENDATIONS,
    RETENTION_SCAN_WEIGHTS,
    RISK_HIGH,
    RISK_MEDIUM,
    ROLE_MULTIPLIERS,
    SCORING_VERSION,
    SDT_DIMENSION_ITEMS,
    SDT_REVERSE_ITEMS,
)


def _scale(raw: float) -> float:
    from backend.products.shared.sdt import scale_to_ten

    return scale_to_ten(raw)


def compute_retention_signal_profile(
    risk_score: float,
    engagement_score: float | None,
    turnover_intention_score: float | None,
    stay_intent_score: float | None,
) -> str:
    from backend.products.retention.scoring import compute_retention_signal_profile as _impl

    return _impl(
        risk_score=risk_score,
        engagement_score=engagement_score,
        turnover_intention_score=turnover_intention_score,
        stay_intent_score=stay_intent_score,
    )

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
    from backend.products.shared.sdt import compute_sdt_scores as _impl

    return _impl(responses)


# ---------------------------------------------------------------------------
# Module C — Org-factor scoring
# ---------------------------------------------------------------------------

def compute_org_scores(responses: dict[str, int | float]) -> dict[str, float]:
    from backend.products.shared.org_factors import compute_org_scores as _impl

    return _impl(responses)


# ---------------------------------------------------------------------------
# Shared signal score helper
# ---------------------------------------------------------------------------

def compute_retention_risk(
    sdt_scores: dict[str, Any],
    org_scores: dict[str, float],
    scan_type: str = "exit",
) -> dict[str, Any]:
    if scan_type == "retention":
        from backend.products.retention.scoring import compute_retention_risk as _impl

        return _impl(sdt_scores, org_scores, scan_type=scan_type)

    # ExitScan keeps this shared helper for backwards compatibility, but the
    # actual implementation lives in the ExitScan product module so logic and
    # terminology cannot silently drift apart.
    from backend.products.exit.scoring import compute_exit_friction as _exit_impl

    return _exit_impl(sdt_scores, org_scores)


def compute_retention_supplemental_scores(
    uwes_raw: dict[str, int | float],
    turnover_intention_raw: dict[str, int | float],
    stay_intent_raw: int | float | None = None,
) -> dict[str, float | None]:
    from backend.products.retention.scoring import compute_retention_supplemental_scores as _impl

    return _impl(
        uwes_raw=uwes_raw,
        turnover_intention_raw=turnover_intention_raw,
        stay_intent_raw=stay_intent_raw,
    )


# ---------------------------------------------------------------------------
# Preventability algorithm (exit surveys only)
# ---------------------------------------------------------------------------

def compute_preventability(
    exit_reason_category: str,
    stay_intent_score: int,
    sdt_scores: dict[str, Any],
    org_scores: dict[str, float],
    contributing_reason_codes: list[str] | None = None,
) -> dict[str, Any]:
    """
    Indicatieve classificatie van beïnvloedbare werkfactoren in een exitcontext.

    Belangrijk:
      - Dit is nadrukkelijk geen causale of juridische vaststelling.
      - De uitkomst benoemt alleen hoe sterk de antwoorden wijzen op
        beïnvloedbare werkfactoren rondom het vertrek.
      - De logica is bewust zachter dan een klassieke "redbaar / niet redbaar"
        classificatie om overclaiming te beperken.

    Returns
    -------
    {
        "preventability": "STERK_WERKSIGNAAL" | "GEMENGD_WERKSIGNAAL" | "BEPERKT_WERKSIGNAAL",
        "preventability_label": str (Dutch),
        "reasoning": str,
        "signal_score": float,
    }
    """
    UNPREVENTABLE = {
        "persoonlijk", "verhuizing", "studie", "pensioen",
        "partner_verhuisd", "gezondheid", "overig_persoonlijk",
    }
    PUSH_FACTORS = {"leiderschap", "cultuur", "groei", "beloning", "werkdruk", "rolonduidelijkheid"}
    PUSH_CODES = {"P1", "P2", "P3", "P4", "P5", "P6"}
    SATISFIER_FACTORS = {"leadership", "culture", "growth", "role_clarity"}
    contributing_reason_codes = contributing_reason_codes or []
    primary_reason = exit_reason_category.lower()
    signal_score = 0.0
    reasoning_parts: list[str] = []

    # Hoofdreden buiten invloedsfeer organisatie → terughoudend classificeren
    if primary_reason in UNPREVENTABLE:
        return {
            "preventability": "BEPERKT_WERKSIGNAAL",
            "preventability_label": "Voorlopig stabiel",
            "reasoning": "De hoofdreden voor vertrek ligt volgens de respondent vooral buiten de directe invloedssfeer van de organisatie.",
            "signal_score": 0.5,
        }

    if primary_reason in PUSH_FACTORS:
        signal_score += 2.0
        reasoning_parts.append("de hoofdreden ligt in de werksituatie")
    else:
        signal_score += 0.5
        reasoning_parts.append("de hoofdreden ligt niet uitsluitend in de werksituatie")

    if stay_intent_score >= 4:
        signal_score += 2.0
        reasoning_parts.append("de respondent ziet duidelijke invloed van ander organisatiegedrag")
    elif stay_intent_score == 3:
        signal_score += 1.0
        reasoning_parts.append("de respondent ziet enige invloed van ander organisatiegedrag")
    else:
        reasoning_parts.append("de respondent ziet weinig invloed van ander organisatiegedrag")

    sdt_dims = ["autonomy", "competence", "relatedness"]
    low_sdt = [d for d in sdt_dims if sdt_scores.get(d, 5.5) < 4.5]
    low_org = [f for f in SATISFIER_FACTORS if org_scores.get(f, 5.5) < 4.5]
    push_contributors = sorted(code for code in contributing_reason_codes if code in PUSH_CODES)

    if low_org:
        signal_score += min(2.0, float(len(low_org)))
        reasoning_parts.append(f"lage scores op werkfactoren ({', '.join(low_org)})")
    if low_sdt:
        signal_score += 1.5 if len(low_sdt) >= 2 else 1.0
        reasoning_parts.append(f"lage SDT-scores ({', '.join(low_sdt)})")
    if push_contributors:
        signal_score += 1.0
        reasoning_parts.append("ook aanvullende werkfactoren zijn als meespelend genoemd")

    if signal_score >= 5.0:
        return {
            "preventability": "STERK_WERKSIGNAAL",
            "preventability_label": "Direct aandachtspunt",
            "reasoning": "Deze combinatie van antwoorden wijst relatief sterk op beïnvloedbare werkfactoren rondom het vertrek: "
            + "; ".join(reasoning_parts) + ".",
            "signal_score": round(signal_score, 2),
        }
    if signal_score >= 3.0:
        return {
            "preventability": "GEMENGD_WERKSIGNAAL",
            "preventability_label": "Aandacht nodig",
            "reasoning": "De antwoorden laten een aandachtspunt zien: er zijn aanwijzingen voor beïnvloedbare werkfactoren, maar ook voor andere verklaringen of beperkte stelligheid.",
            "signal_score": round(signal_score, 2),
        }
    return {
        "preventability": "BEPERKT_WERKSIGNAAL",
        "preventability_label": "Voorlopig stabiel",
        "reasoning": "De antwoorden geven weinig harde aanwijzingen dat beïnvloedbare werkfactoren de dominante verklaring voor het vertrek waren.",
        "signal_score": round(signal_score, 2),
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
    engagement_scores: list[float] = []
    turnover_intention_scores: list[float] = []
    stay_intent_scores: list[float] = []
    preventability_counts: dict[str, int] = {
        "STERK_WERKSIGNAAL": 0,
        "GEMENGD_WERKSIGNAAL": 0,
        "BEPERKT_WERKSIGNAAL": 0,
    }
    exit_reason_counts: dict[str, int] = {}
    contributing_reason_counts: dict[str, int] = {}
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

        engagement = r.get("uwes_score")
        if engagement is not None:
            engagement_scores.append(float(engagement))

        turnover_intention = r.get("turnover_intention_score")
        if turnover_intention is not None:
            turnover_intention_scores.append(float(turnover_intention))

        stay_intent = r.get("stay_intent_score")
        if stay_intent is not None:
            stay_intent_scores.append(round(_scale(float(stay_intent)), 2))

        # Preventability
        prev = r.get("preventability")
        if prev in preventability_counts:
            preventability_counts[prev] += 1

        # Exit reason
        code = r.get("exit_reason_code")
        if code:
            exit_reason_counts[code] = exit_reason_counts.get(code, 0) + 1

        # Meespelende redenen
        for code in r.get("contributing_reason_codes", []):
            contributing_reason_counts[code] = contributing_reason_counts.get(code, 0) + 1

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
    avg_engagement = (
        round(sum(engagement_scores) / len(engagement_scores), 2)
        if engagement_scores else None
    )
    avg_turnover_intention = (
        round(sum(turnover_intention_scores) / len(turnover_intention_scores), 2)
        if turnover_intention_scores else None
    )
    avg_stay_intent = (
        round(sum(stay_intent_scores) / len(stay_intent_scores), 2)
        if stay_intent_scores else None
    )

    # Identify top risks (factors with risk > threshold)
    top_risks = sorted(
        [
            (f, round(11.0 - factor_averages[f], 2))
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
        if len(vals) >= MIN_SEGMENT_N
    }

    # Exit reason top 3
    top_exit_reasons = sorted(exit_reason_counts.items(), key=lambda x: x[1], reverse=True)[:3]
    top_contributing_reasons = sorted(contributing_reason_counts.items(), key=lambda x: x[1], reverse=True)[:5]

    # Signaalpercentages
    total_exit = sum(preventability_counts.values())
    strong_signal_rate = (
        round(preventability_counts.get("STERK_WERKSIGNAAL", 0) / total_exit * 100, 1)
        if total_exit > 0 else None
    )
    any_work_signal_rate = (
        round(
            (
                preventability_counts.get("STERK_WERKSIGNAAL", 0)
                + preventability_counts.get("GEMENGD_WERKSIGNAAL", 0)
            ) / total_exit * 100,
            1,
        )
        if total_exit > 0 else None
    )

    return {
        "n":                    n,
        "sufficient_data":      True,
        "avg_risk_score":       avg_risk,
        "avg_engagement_score": avg_engagement,
        "avg_turnover_intention_score": avg_turnover_intention,
        "avg_stay_intent_score": avg_stay_intent,
        "factor_averages":      factor_averages,
        "top_risk_factors":     top_risks,
        "preventability_counts": preventability_counts,
        "avoidable_rate_pct":   strong_signal_rate,
        "strong_work_signal_pct": strong_signal_rate,
        "any_work_signal_pct":  any_work_signal_rate,
        "exit_reason_counts":   exit_reason_counts,
        "top_exit_reasons":     [
            {"code": code, "label": EXIT_REASON_LABELS_NL.get(code, code), "count": cnt}
            for code, cnt in top_exit_reasons
        ],
        "top_contributing_reasons": [
            {"code": code, "label": EXIT_REASON_LABELS_NL.get(code, code), "count": cnt}
            for code, cnt in top_contributing_reasons
        ],
        "department_avg_risk":  dept_avg,
    }

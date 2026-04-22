from __future__ import annotations

from typing import Any

from fastapi import HTTPException

from backend.products.leadership.definition import DEFAULT_LEADERSHIP_MODULES
from backend.products.shared.org_factors import compute_org_scores
from backend.products.shared.sdt import compute_sdt_scores, scale_to_ten
from backend.scoring import get_recommendations
from backend.scoring_config import ORG_FACTOR_KEYS, RISK_HIGH, RISK_MEDIUM, SCORING_VERSION

LEADERSHIP_SDT_ITEMS = {"B1", "B5", "B9"}


def _extract_active_factors(org_raw: dict[str, int]) -> list[str]:
    factors = []
    for factor in ORG_FACTOR_KEYS:
        if any(key.startswith(f"{factor}_") for key in org_raw.keys()):
            factors.append(factor)
    return factors or list(DEFAULT_LEADERSHIP_MODULES)


def validate_submission(payload: Any) -> None:
    keys = set(payload.sdt_raw.keys())
    missing = LEADERSHIP_SDT_ITEMS - keys
    extra = keys - LEADERSHIP_SDT_ITEMS
    if missing:
        raise HTTPException(status_code=422, detail="Leadership Scan vereist 3 vaste context-items.")
    if extra:
        raise HTTPException(
            status_code=422,
            detail="Leadership Scan accepteert in deze wave alleen de compacte context-set.",
        )
    if payload.stay_intent_score is None:
        raise HTTPException(status_code=422, detail="Leadership Scan vereist een management-richtingsvraag.")
    if not payload.org_raw:
        raise HTTPException(status_code=422, detail="Leadership Scan vereist minimaal een actieve werkfactor.")


def compute_leadership_risk(
    sdt_scores: dict[str, Any],
    org_scores: dict[str, float],
    active_factors: list[str],
) -> dict[str, Any]:
    factor_risks: dict[str, float] = {}
    weighted: dict[str, float] = {}
    weights: dict[str, float] = {}

    for factor in active_factors:
        score = org_scores.get(factor, 5.5)
        risk = round(11.0 - score, 2)
        factor_risks[factor] = risk
        weights[factor] = 1.0
        weighted[factor] = risk

    sdt_risk = round(float(sdt_scores.get("sdt_risk", 5.5)), 2)
    factor_risks["sdt"] = sdt_risk
    weights["sdt"] = 1.0
    weighted["sdt"] = sdt_risk

    risk_score = round(sum(weighted.values()) / max(len(weighted), 1), 2)
    risk_score = max(1.0, min(10.0, risk_score))

    if risk_score >= RISK_HIGH:
        band = "HOOG"
    elif risk_score >= RISK_MEDIUM:
        band = "MIDDEN"
    else:
        band = "LAAG"

    return {
        "risk_score": risk_score,
        "risk_band": band,
        "factor_risks": factor_risks,
        "factor_weights": weights,
        "weighted_factors": weighted,
        "active_factors": active_factors,
    }


def score_submission(
    *,
    payload: Any,
    campaign: Any,
    respondent: Any,
    exit_reason_code: str | None = None,
    contributing_reason_codes: list[str],
) -> dict[str, Any]:
    active_factors = _extract_active_factors(payload.org_raw)
    sdt_scores = compute_sdt_scores(payload.sdt_raw)
    full_org_scores = compute_org_scores(payload.org_raw)
    org_scores = {factor: full_org_scores[factor] for factor in active_factors}
    risk_result = compute_leadership_risk(sdt_scores, org_scores, active_factors)
    leadership_direction_score = round(scale_to_ten(float(payload.stay_intent_score)), 2)
    recommendations = get_recommendations(risk_result["factor_risks"])

    leadership_summary = {
        "leadership_signal_score": risk_result["risk_score"],
        "leadership_signal_band": risk_result["risk_band"],
        "leadership_direction_score": leadership_direction_score,
        "active_factors": active_factors,
        "snapshot_type": "current_management_context_cycle",
        "measurement_model": "aggregated_management_context_triage",
        "interpretation_mode": "group_level_context_then_handoff",
        "context_scope": "group_level_only",
        "boundary_state": "named_leader_output_forbidden",
        "signal_reading": (
            "Leadership Scan leest een geaggregeerde managementcontext op groepsniveau: "
            "welke leiderschaps- of werkfactor kleurt het people-signaal nu het sterkst, "
            "wie trekt de eerste managementhuddle en welke begrensde verificatie of correctie hoort daar nu bij."
        ),
        "named_leader_distinction": (
            "Leadership Scan is geen named leader model, geen manager ranking en geen 360-laag. "
            "De output blijft op groepsniveau en identity-light."
        ),
        "interpretation_boundary": (
            "Gebruik Leadership Scan als geaggregeerde management-context triage, niet als bewijs van individuele "
            "leiderschapskwaliteit, hierarchy-output, 360-laag of performance-oordeel."
        ),
    }
    leadership_context_summary = {
        "management_scope": "group_level_only",
        "allowed_context": ["department", "role_level"],
        "named_leader_output": False,
        "identity_model": "none",
        "identity_boundary": "group_level_only_non_named_non_360",
    }
    signal_patterns = [
        {
            "factor_key": factor,
            "factor_signal_value": round(risk_result["factor_risks"][factor], 2),
            "signal_band": risk_result["risk_band"],
        }
        for factor in active_factors
    ]

    full_result = {
        "sdt_scores": sdt_scores,
        "org_scores": org_scores,
        "risk_result": risk_result,
        "leadership_summary": leadership_summary,
        "leadership_context_summary": leadership_context_summary,
        "signal_patterns": signal_patterns,
        "recommendations": recommendations,
        "active_factors": active_factors,
        "survey_scope": "leadership_wave_01_foundation",
    }

    return {
        "sdt_scores": sdt_scores,
        "org_scores": org_scores,
        "risk_result": risk_result,
        "preventability_result": {},
        "replacement_cost_eur": None,
        "recommendations": recommendations,
        "uwes_score": None,
        "turnover_intention_score": None,
        "retention_summary": None,
        "full_result": full_result,
        "scoring_version": SCORING_VERSION,
    }

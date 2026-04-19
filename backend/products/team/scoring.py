from __future__ import annotations

from typing import Any

from fastapi import HTTPException

from backend.products.shared.org_factors import compute_org_scores
from backend.products.shared.sdt import compute_sdt_scores, scale_to_ten
from backend.products.team.definition import DEFAULT_TEAM_MODULES
from backend.scoring import get_recommendations
from backend.scoring_config import ORG_FACTOR_KEYS, RISK_HIGH, RISK_MEDIUM, SCORING_VERSION

TEAM_SDT_ITEMS = {"B1", "B5", "B9"}


def _extract_active_factors(org_raw: dict[str, int]) -> list[str]:
    factors = []
    for factor in ORG_FACTOR_KEYS:
        if any(key.startswith(f"{factor}_") for key in org_raw.keys()):
            factors.append(factor)
    return factors or list(DEFAULT_TEAM_MODULES)


def validate_submission(payload: Any) -> None:
    keys = set(payload.sdt_raw.keys())
    missing = TEAM_SDT_ITEMS - keys
    extra = keys - TEAM_SDT_ITEMS
    if missing:
        raise HTTPException(status_code=422, detail="TeamScan vereist 3 vaste werkbelevingsitems.")
    if extra:
        raise HTTPException(
            status_code=422,
            detail="TeamScan accepteert in deze wave alleen de compacte werkbelevingsset.",
        )
    if payload.stay_intent_score is None:
        raise HTTPException(status_code=422, detail="TeamScan vereist een lokale richtingvraag.")
    if not payload.org_raw:
        raise HTTPException(status_code=422, detail="TeamScan vereist minimaal een actieve werkfactor.")


def compute_team_risk(
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
    risk_result = compute_team_risk(sdt_scores, org_scores, active_factors)
    local_direction_score = round(scale_to_ten(float(payload.stay_intent_score)), 2)
    recommendations = get_recommendations(risk_result["factor_risks"])

    team_summary = {
        "team_signal_score": risk_result["risk_score"],
        "team_signal_band": risk_result["risk_band"],
        "local_direction_score": local_direction_score,
        "active_factors": active_factors,
        "snapshot_type": "current_localization_cycle",
        "localization_boundary": "department",
        "context_mode": "department_first",
        "measurement_model": "compact_work_context_triage",
        "interpretation_mode": "localize_then_verify",
        "signal_reading": (
            "Lees TeamScan als een compacte lokale read van werkbeleving, actieve werkfactoren "
            "en een lokale richtingsvraag. De uitkomst helpt bepalen waar eerst verificatie "
            "nodig is, niet welke manager of teamoorzaak vaststaat."
        ),
        "segment_deep_dive_distinction": (
            "Segment Deep Dive blijft een beschrijvende add-on binnen bredere scans. "
            "TeamScan gebruikt een eigen lokalisatie- en verificatielogica om te bepalen "
            "waar het huidige signaal eerst lokaal moet worden getoetst."
        ),
        "interpretation_boundary": (
            "Gebruik deze read als department-first lokalisatiehulp op groepsniveau. "
            "Kleine groepen, manageroordelen en causale claims blijven bewust buiten scope."
        ),
    }

    full_result = {
        "sdt_scores": sdt_scores,
        "org_scores": org_scores,
        "risk_result": risk_result,
        "team_summary": team_summary,
        "recommendations": recommendations,
        "active_factors": active_factors,
        "survey_scope": "teamscan_wave_01_foundation",
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

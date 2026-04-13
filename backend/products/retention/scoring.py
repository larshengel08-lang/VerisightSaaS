from __future__ import annotations

from typing import Any

from fastapi import HTTPException

from backend.products.shared.org_factors import compute_org_scores
from backend.products.shared.sdt import compute_sdt_scores, scale_to_ten
from backend.scoring import get_recommendations
from backend.scoring_config import ORG_FACTOR_KEYS, RETENTION_SCAN_WEIGHTS, RISK_HIGH, RISK_MEDIUM, SCORING_VERSION


def compute_retention_signal_profile(
    risk_score: float,
    engagement_score: float | None,
    turnover_intention_score: float | None,
    stay_intent_score: float | None,
) -> str:
    engagement_low = engagement_score is not None and engagement_score < 5.5
    turnover_high = turnover_intention_score is not None and turnover_intention_score >= 5.5
    stay_low = stay_intent_score is not None and stay_intent_score < 5.5

    if risk_score >= RISK_HIGH and (engagement_low or turnover_high or stay_low):
        return "scherp_aandachtssignaal"
    if turnover_high and stay_low:
        return "vertrekdenken_zichtbaar"
    if risk_score >= RISK_MEDIUM or engagement_low or stay_low:
        return "vroegsignaal"
    return "overwegend_stabiel"


def compute_retention_risk(
    sdt_scores: dict[str, Any],
    org_scores: dict[str, float],
    scan_type: str = "retention",
) -> dict[str, Any]:
    factor_risks: dict[str, float] = {}
    weighted: dict[str, float] = {}
    weights = dict(RETENTION_SCAN_WEIGHTS)

    for factor in ORG_FACTOR_KEYS:
        score = org_scores.get(factor, 5.5)
        risk = round(11.0 - score, 2)
        factor_risks[factor] = round(risk, 2)
        weighted[factor] = round(risk * weights[factor], 2)

    sdt_risk = sdt_scores.get("sdt_risk", 5.5)
    weights["sdt"] = 1.0
    factor_risks["sdt"] = round(sdt_risk, 2)
    weighted["sdt"] = round(sdt_risk, 2)

    total_weight = sum(weights.values())
    raw_risk = sum(weighted.values()) / total_weight
    risk_score = round(max(1.0, min(10.0, raw_risk)), 2)

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
    }


def compute_retention_supplemental_scores(
    uwes_raw: dict[str, int | float],
    turnover_intention_raw: dict[str, int | float],
    stay_intent_raw: int | float | None = None,
) -> dict[str, float | None]:
    engagement_score: float | None = None
    turnover_score: float | None = None
    stay_score: float | None = None

    if uwes_raw:
        uwes_values = [float(value) for value in uwes_raw.values()]
        if uwes_values:
            engagement_score = round(scale_to_ten(sum(uwes_values) / len(uwes_values)), 2)

    if turnover_intention_raw:
        turnover_values = [float(value) for value in turnover_intention_raw.values()]
        if turnover_values:
            turnover_score = round(scale_to_ten(sum(turnover_values) / len(turnover_values)), 2)

    if stay_intent_raw is not None:
        stay_score = round(scale_to_ten(float(stay_intent_raw)), 2)

    return {
        "engagement_score": engagement_score,
        "turnover_intention_score": turnover_score,
        "stay_intent_score": stay_score,
    }


def validate_submission(payload: Any) -> None:
    if len(payload.uwes_raw) != 3:
        raise HTTPException(status_code=422, detail="RetentieScan vereist 3 bevlogenheidsitems.")
    if len(payload.turnover_intention_raw) != 2:
        raise HTTPException(status_code=422, detail="RetentieScan vereist 2 vertrekintentie-items.")
    if payload.stay_intent_score is None:
        raise HTTPException(status_code=422, detail="RetentieScan vereist een stay-intent antwoord.")


def score_submission(
    *,
    payload: Any,
    campaign: Any,
    respondent: Any,
    contributing_reason_codes: list[str],
) -> dict[str, Any]:
    sdt_scores = compute_sdt_scores(payload.sdt_raw)
    org_scores = compute_org_scores(payload.org_raw)
    risk_result = compute_retention_risk(sdt_scores, org_scores)
    supplemental_scores = compute_retention_supplemental_scores(
        payload.uwes_raw,
        payload.turnover_intention_raw,
        payload.stay_intent_score,
    )
    uwes_score = supplemental_scores["engagement_score"]
    ti_score = supplemental_scores["turnover_intention_score"]
    stay_signal_score = supplemental_scores["stay_intent_score"]

    recommendations = get_recommendations(risk_result["factor_risks"])
    retention_summary = {
        "retention_signal_score": risk_result["risk_score"],
        "retention_signal_band": risk_result["risk_band"],
        "engagement_score": uwes_score,
        "turnover_intention_score": ti_score,
        "stay_intent_score": stay_signal_score,
        "signal_profile": compute_retention_signal_profile(
            risk_score=risk_result["risk_score"],
            engagement_score=uwes_score,
            turnover_intention_score=ti_score,
            stay_intent_score=stay_signal_score,
        ),
    }

    full_result = {
        "sdt_scores": sdt_scores,
        "org_scores": org_scores,
        "risk_result": risk_result,
        "contributing_reason_codes": contributing_reason_codes,
        "recommendations": recommendations,
        "uwes_score": uwes_score,
        "turnover_intention_score": ti_score,
        "stay_intent_signal_score": stay_signal_score,
        "retention_summary": retention_summary,
    }

    return {
        "sdt_scores": sdt_scores,
        "org_scores": org_scores,
        "risk_result": risk_result,
        "preventability_result": {},
        "replacement_cost_eur": None,
        "recommendations": recommendations,
        "uwes_score": uwes_score,
        "turnover_intention_score": ti_score,
        "retention_summary": retention_summary,
        "full_result": full_result,
        "scoring_version": SCORING_VERSION,
    }

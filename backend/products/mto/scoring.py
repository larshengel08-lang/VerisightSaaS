from __future__ import annotations

from typing import Any

from fastapi import HTTPException

from backend.products.shared.org_factors import compute_org_scores
from backend.products.shared.sdt import compute_sdt_scores, scale_to_ten
from backend.scoring import get_recommendations
from backend.scoring_config import ORG_FACTOR_KEYS, RISK_HIGH, RISK_MEDIUM, SCORING_VERSION


def compute_mto_risk(
    sdt_scores: dict[str, Any],
    org_scores: dict[str, float],
) -> dict[str, Any]:
    factor_risks: dict[str, float] = {}
    weighted: dict[str, float] = {}
    weights: dict[str, float] = {}

    for factor in ORG_FACTOR_KEYS:
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
    }


def validate_submission(payload: Any) -> None:
    expected_sdt = {f"B{i}" for i in range(1, 13)}
    if set(payload.sdt_raw.keys()) != expected_sdt:
        raise HTTPException(status_code=422, detail="MTO vereist alle 12 werkbelevingsitems.")
    expected_org = {f"{factor}_{index}" for factor in ORG_FACTOR_KEYS for index in range(1, 4)}
    if set(payload.org_raw.keys()) != expected_org:
        raise HTTPException(status_code=422, detail="MTO vereist alle standaard werkfactoritems.")
    if payload.stay_intent_score is None:
        raise HTTPException(status_code=422, detail="MTO vereist een brede richtingsvraag.")


def score_submission(
    *,
    payload: Any,
    campaign: Any,
    respondent: Any,
    exit_reason_code: str | None = None,
    contributing_reason_codes: list[str],
) -> dict[str, Any]:
    sdt_scores = compute_sdt_scores(payload.sdt_raw)
    org_scores = compute_org_scores(payload.org_raw)
    risk_result = compute_mto_risk(sdt_scores, org_scores)
    stay_signal_score = round(scale_to_ten(float(payload.stay_intent_score)), 2)
    recommendations = get_recommendations(risk_result["factor_risks"])

    theme_priorities = [
        {
            "factor_key": factor,
            "signal_value": round(signal_value, 2),
        }
        for factor, signal_value in sorted(
            ((factor, risk_result["factor_risks"][factor]) for factor in ORG_FACTOR_KEYS),
            key=lambda item: item[1],
            reverse=True,
        )[:3]
    ]

    management_questions = [
        f"Wat vraagt nu als eerste brede organisatieduiding rond {priority['factor_key']}?"
        for priority in theme_priorities
    ]

    mto_summary = {
        "mto_signal_score": risk_result["risk_score"],
        "mto_signal_band": risk_result["risk_band"],
        "stay_intent_score": stay_signal_score,
        "snapshot_type": "broad_org_read_cycle",
        "measurement_model": "organization_wide_foundation_read",
        "interpretation_mode": "broad_org_read_then_prioritize",
        "context_scope": "group_level_only",
        "boundary_state": "report_and_action_log_not_open",
        "optional_segment_enrichment": True,
        "report_layer_open": False,
        "action_log_open": False,
        "signal_reading": (
            "MTO leest in deze eerste wave een brede hoofdmeting op groepsniveau: welke combinatie van "
            "werkbeleving en werkfactoren vraagt nu eerst organisatieduiding, welke brede managementvraag hoort "
            "daarbij en welke eerste begrensde stap moet daarna volgen."
        ),
        "interpretation_boundary": (
            "Gebruik deze eerste MTO-read als brede hoofdmeting en niet als formeel rapport, action-loglaag, "
            "individueel tevredenheidsoordeel of publieke hoofdroute."
        ),
    }

    full_result = {
        "sdt_scores": sdt_scores,
        "org_scores": org_scores,
        "risk_result": risk_result,
        "theme_priorities": theme_priorities,
        "management_questions": management_questions,
        "mto_summary": mto_summary,
        "recommendations": recommendations,
        "survey_scope": "mto_wave_01_foundation",
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

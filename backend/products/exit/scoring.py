from __future__ import annotations

from typing import Any

from fastapi import HTTPException

from backend.products.shared.org_factors import compute_org_scores
from backend.products.shared.sdt import compute_sdt_scores
from backend.scoring import compute_preventability, compute_replacement_cost, get_recommendations
from backend.scoring_config import (
    EXIT_REASON_LABELS_NL,
    EXIT_SCAN_WEIGHTS,
    ORG_FACTOR_KEYS,
    RISK_HIGH,
    RISK_MEDIUM,
    SCORING_VERSION,
)


def validate_submission(payload: Any) -> None:
    if payload.tenure_years is None:
        raise HTTPException(status_code=422, detail="ExitScan vereist een antwoord op diensttijd.")
    if payload.exit_reason_category is None:
        raise HTTPException(status_code=422, detail="ExitScan vereist een hoofdreden voor vertrek.")
    if payload.stay_intent_score is None:
        raise HTTPException(status_code=422, detail="ExitScan vereist een antwoord op beïnvloedbaarheid.")
    if payload.signal_visibility_score is None:
        raise HTTPException(status_code=422, detail="ExitScan vereist een antwoord op eerdere signalering.")


def compute_exit_friction(
    sdt_scores: dict[str, Any],
    org_scores: dict[str, float],
) -> dict[str, Any]:
    factor_risks: dict[str, float] = {}
    weighted: dict[str, float] = {}
    weights = dict(EXIT_SCAN_WEIGHTS)

    for factor in ORG_FACTOR_KEYS:
        score = org_scores.get(factor, 5.5)
        risk = round(11.0 - score, 2)
        factor_risks[factor] = round(risk, 2)
        weighted[factor] = round(risk * weights[factor], 2)

    sdt_risk = sdt_scores.get("sdt_risk", 5.5)
    weights["sdt"] = 2.0
    factor_risks["sdt"] = round(sdt_risk, 2)
    weighted["sdt"] = round(sdt_risk * weights["sdt"], 2)

    total_weight = sum(weights.values())
    raw_friction = sum(weighted.values()) / total_weight
    friction_score = round(max(1.0, min(10.0, raw_friction)), 2)

    if friction_score >= RISK_HIGH:
        band = "HOOG"
    elif friction_score >= RISK_MEDIUM:
        band = "MIDDEN"
    else:
        band = "LAAG"

    return {
        "risk_score": friction_score,
        "risk_band": band,
        "factor_risks": factor_risks,
        "factor_weights": weights,
        "weighted_factors": weighted,
    }


def _build_signal_visibility_summary(signal_visibility_score: int | None) -> dict[str, Any] | None:
    if signal_visibility_score is None:
        return None

    if signal_visibility_score >= 4:
        label = "Signalen waren zichtbaar of bespreekbaar"
        management_hint = (
            "Gebruik dit om te toetsen waar opvolging of escalatie achterbleef nadat signalen al op tafel lagen."
        )
    elif signal_visibility_score == 3:
        label = "Signalen waren deels zichtbaar"
        management_hint = (
            "Gebruik dit om te verkennen waar twijfels wel voelbaar waren, maar nog niet scherp genoeg zijn opgepakt."
        )
    else:
        label = "Signalen bleven grotendeels onder de radar"
        management_hint = (
            "Gebruik dit om te onderzoeken waar signalen te laat zichtbaar werden of psychologisch onveilig bleven om te benoemen."
        )

    return {
        "score": signal_visibility_score,
        "label": label,
        "management_hint": management_hint,
    }


def build_exit_context_summary(
    *,
    payload: Any,
    exit_reason_code: str | None,
    contributing_reason_codes: list[str],
) -> dict[str, Any]:
    return {
        "primary_reason_code": exit_reason_code,
        "primary_reason_label": EXIT_REASON_LABELS_NL.get(
            exit_reason_code or "",
            payload.exit_reason_category or "Onbekend",
        ),
        "contributing_reason_codes": contributing_reason_codes,
        "contributing_reason_labels": [
            EXIT_REASON_LABELS_NL.get(code, code) for code in contributing_reason_codes
        ],
        "signal_visibility_score": payload.signal_visibility_score,
        "signal_visibility_summary": _build_signal_visibility_summary(payload.signal_visibility_score),
        "stay_intent_score": payload.stay_intent_score,
    }


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
    risk_result = compute_exit_friction(sdt_scores, org_scores)

    preventability_result: dict[str, Any] = {}
    if payload.exit_reason_category:
        preventability_result = compute_preventability(
            exit_reason_category=payload.exit_reason_category,
            stay_intent_score=payload.stay_intent_score or 3,
            sdt_scores=sdt_scores,
            org_scores=org_scores,
            contributing_reason_codes=contributing_reason_codes,
        )

    replacement_cost_eur: float | None = None
    if respondent.annual_salary_eur:
        rc = compute_replacement_cost(
            annual_salary=respondent.annual_salary_eur,
            role_level=respondent.role_level or "specialist",
        )
        replacement_cost_eur = rc["cost_per_employee"]

    recommendations = get_recommendations(risk_result["factor_risks"])
    exit_context_summary = build_exit_context_summary(
        payload=payload,
        exit_reason_code=exit_reason_code,
        contributing_reason_codes=contributing_reason_codes,
    )
    full_result = {
        "sdt_scores": sdt_scores,
        "org_scores": org_scores,
        "risk_result": risk_result,
        "preventability_result": preventability_result,
        "exit_context_summary": exit_context_summary,
        "contributing_reason_codes": contributing_reason_codes,
        "recommendations": recommendations,
    }

    return {
        "sdt_scores": sdt_scores,
        "org_scores": org_scores,
        "risk_result": risk_result,
        "preventability_result": preventability_result,
        "replacement_cost_eur": replacement_cost_eur,
        "recommendations": recommendations,
        "uwes_score": None,
        "turnover_intention_score": None,
        "retention_summary": None,
        "full_result": full_result,
        "scoring_version": SCORING_VERSION,
    }

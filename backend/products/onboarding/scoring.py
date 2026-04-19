from __future__ import annotations

from typing import Any

from fastapi import HTTPException

from backend.products.onboarding.definition import DEFAULT_ONBOARDING_MODULES
from backend.products.shared.org_factors import compute_org_scores
from backend.products.shared.sdt import compute_sdt_scores, scale_to_ten
from backend.scoring import get_recommendations
from backend.scoring_config import ORG_FACTOR_KEYS, RISK_HIGH, RISK_MEDIUM, SCORING_VERSION

ONBOARDING_SDT_ITEMS = {"B1", "B5", "B9"}


def _extract_active_factors(org_raw: dict[str, int]) -> list[str]:
    factors = []
    for factor in ORG_FACTOR_KEYS:
        if any(key.startswith(f"{factor}_") for key in org_raw.keys()):
            factors.append(factor)
    return factors or list(DEFAULT_ONBOARDING_MODULES)


def validate_submission(payload: Any) -> None:
    keys = set(payload.sdt_raw.keys())
    missing = ONBOARDING_SDT_ITEMS - keys
    extra = keys - ONBOARDING_SDT_ITEMS
    if missing:
        raise HTTPException(status_code=422, detail="Onboarding vereist 3 vaste checkpoint-items.")
    if extra:
        raise HTTPException(
            status_code=422,
            detail="Onboarding accepteert in deze wave alleen de compacte checkpoint-set.",
        )
    if payload.stay_intent_score is None:
        raise HTTPException(status_code=422, detail="Onboarding vereist een checkpoint-richtingsvraag.")
    if not payload.org_raw:
        raise HTTPException(status_code=422, detail="Onboarding vereist minimaal een actieve werkfactor.")


def compute_onboarding_risk(
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
    risk_result = compute_onboarding_risk(sdt_scores, org_scores, active_factors)
    checkpoint_direction_score = round(scale_to_ten(float(payload.stay_intent_score)), 2)
    recommendations = get_recommendations(risk_result["factor_risks"])

    onboarding_summary = {
        "onboarding_signal_score": risk_result["risk_score"],
        "onboarding_signal_band": risk_result["risk_band"],
        "checkpoint_direction_score": checkpoint_direction_score,
        "active_factors": active_factors,
        "snapshot_type": "single_checkpoint",
        "checkpoint_scope": "single_checkpoint_per_campaign",
        "measurement_model": "single_checkpoint_lifecycle_triage",
        "interpretation_mode": "checkpoint_then_handoff",
        "lifecycle_boundary": "single_checkpoint_only",
        "signal_reading": (
            "Lees onboarding als een bounded single-checkpoint lifecycle-read van werkbeleving, "
            "actieve vroege werkfactoren en een checkpoint-richtingsvraag. De uitkomst helpt bepalen "
            "hoe nieuwe medewerkers nu landen, wie de eerste handoff trekt en welke kleine borg- of "
            "correctiestap nu logisch is."
        ),
        "client_onboarding_distinction": (
            "Client onboarding blijft implementatie- en adoptiebegeleiding voor klanten. "
            "Onboarding 30-60-90 is juist een employee lifecycle-checkpoint voor nieuwe medewerkers op groepsniveau."
        ),
        "interpretation_boundary": (
            "Gebruik dit als managementread van een enkel meetmoment. Geen journey-engine, "
            "geen hire-date model, geen retentievoorspeller en geen individuele onboardingbeoordeling."
        ),
    }

    full_result = {
        "sdt_scores": sdt_scores,
        "org_scores": org_scores,
        "risk_result": risk_result,
        "onboarding_summary": onboarding_summary,
        "recommendations": recommendations,
        "active_factors": active_factors,
        "survey_scope": "onboarding_wave_01_foundation",
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

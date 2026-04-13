from __future__ import annotations

from typing import Any

from backend.products.shared.org_factors import compute_org_scores
from backend.products.shared.sdt import compute_sdt_scores
from backend.products.retention.scoring import compute_retention_risk
from backend.scoring import compute_preventability, compute_replacement_cost, get_recommendations
from backend.scoring_config import SCORING_VERSION


def validate_submission(payload: Any) -> None:
    return None


def score_submission(
    *,
    payload: Any,
    campaign: Any,
    respondent: Any,
    contributing_reason_codes: list[str],
) -> dict[str, Any]:
    sdt_scores = compute_sdt_scores(payload.sdt_raw)
    org_scores = compute_org_scores(payload.org_raw)
    risk_result = compute_retention_risk(sdt_scores, org_scores, scan_type="exit")

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
    full_result = {
        "sdt_scores": sdt_scores,
        "org_scores": org_scores,
        "risk_result": risk_result,
        "preventability_result": preventability_result,
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

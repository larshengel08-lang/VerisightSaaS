from __future__ import annotations

from types import SimpleNamespace

import pytest
from fastapi import HTTPException

from backend.products.mto.scoring import compute_mto_risk, score_submission, validate_submission
from backend.scoring_config import ORG_FACTOR_KEYS


def _full_org_raw(value: int = 4) -> dict[str, int]:
    return {f"{factor}_{index}": value for factor in ORG_FACTOR_KEYS for index in range(1, 4)}


def _full_sdt_raw(value: int = 4) -> dict[str, int]:
    return {f"B{i}": value for i in range(1, 13)}


def test_mto_validate_submission_requires_full_foundation_blocks():
    payload = SimpleNamespace(
        sdt_raw={"B1": 4, "B2": 4},
        stay_intent_score=None,
        org_raw={"leadership_1": 4},
    )

    with pytest.raises(HTTPException) as exc:
        validate_submission(payload)

    assert exc.value.status_code == 422
    assert "MTO vereist" in exc.value.detail


def test_compute_mto_risk_weights_sdt_and_org_layers_into_broad_signal():
    sdt_scores = {
        "autonomy": 6.0,
        "competence": 6.5,
        "relatedness": 6.2,
        "sdt_total": 6.23,
        "sdt_risk": 4.77,
    }
    org_scores = {
        "leadership": 5.4,
        "culture": 6.1,
        "growth": 5.0,
        "compensation": 4.9,
        "workload": 4.7,
        "role_clarity": 5.3,
    }

    result = compute_mto_risk(sdt_scores, org_scores)

    assert 1.0 <= result["risk_score"] <= 10.0
    assert result["risk_band"] in {"HOOG", "MIDDEN", "LAAG"}
    assert result["factor_risks"]["sdt"] == pytest.approx(4.77, abs=0.01)
    assert set(result["factor_risks"].keys()) == set(ORG_FACTOR_KEYS) | {"sdt"}


def test_mto_score_submission_builds_broad_org_read_summary_and_theme_priorities():
    payload = SimpleNamespace(
        sdt_raw=_full_sdt_raw(4),
        org_raw=_full_org_raw(4),
        stay_intent_score=4,
    )
    respondent = SimpleNamespace(role_level="specialist", department="Operations", annual_salary_eur=None)

    result = score_submission(
        payload=payload,
        campaign=SimpleNamespace(enabled_modules=None),
        respondent=respondent,
        exit_reason_code=None,
        contributing_reason_codes=[],
    )

    assert result["retention_summary"] is None
    assert result["uwes_score"] is None
    assert result["turnover_intention_score"] is None
    assert result["full_result"]["mto_summary"]["snapshot_type"] == "broad_org_read_cycle"
    assert result["full_result"]["mto_summary"]["measurement_model"] == "organization_wide_foundation_read"
    assert result["full_result"]["mto_summary"]["boundary_state"] == "report_and_action_log_not_open"
    assert result["full_result"]["mto_summary"]["optional_segment_enrichment"] is True
    assert result["full_result"]["mto_summary"]["report_layer_open"] is False
    assert result["full_result"]["mto_summary"]["action_log_open"] is False
    assert len(result["full_result"]["theme_priorities"]) == 3
    assert result["full_result"]["theme_priorities"][0]["factor_key"] in ORG_FACTOR_KEYS
    assert "hoofdmeting" in result["full_result"]["mto_summary"]["signal_reading"].lower()

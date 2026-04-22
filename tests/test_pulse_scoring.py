from __future__ import annotations

import pytest
from types import SimpleNamespace

from fastapi import HTTPException

from backend.products.pulse.definition import DEFAULT_PULSE_MODULES, get_definition
from backend.products.pulse.scoring import compute_pulse_risk, score_submission, validate_submission
from backend.products.shared.sdt import compute_sdt_scores


def test_pulse_validate_submission_requires_compact_sdt_and_stay_intent():
    payload = SimpleNamespace(
        sdt_raw={"B1": 4, "B5": 4},
        stay_intent_score=None,
        org_raw={"leadership_1": 4},
    )

    with pytest.raises(HTTPException) as exc:
        validate_submission(payload)

    assert exc.value.status_code == 422


def test_compute_pulse_risk_uses_only_active_factors():
    sdt_scores = compute_sdt_scores({"B1": 5, "B5": 5, "B9": 5})
    org_scores = {"leadership": 9.0, "workload": 3.0}

    result = compute_pulse_risk(sdt_scores, org_scores, ["leadership", "workload"])

    assert set(result["active_factors"]) == {"leadership", "workload"}
    assert "growth" not in result["factor_risks"]
    assert 1.0 <= result["risk_score"] <= 10.0


def test_pulse_score_submission_builds_snapshot_summary():
    payload = SimpleNamespace(
        sdt_raw={"B1": 4, "B5": 3, "B9": 5},
        org_raw={"leadership_1": 4, "growth_1": 3, "workload_1": 2},
        stay_intent_score=4,
    )
    respondent = SimpleNamespace(role_level="specialist", annual_salary_eur=None)

    result = score_submission(
        payload=payload,
        campaign=SimpleNamespace(enabled_modules=DEFAULT_PULSE_MODULES),
        respondent=respondent,
        exit_reason_code=None,
        contributing_reason_codes=[],
    )

    assert result["retention_summary"] is None
    assert result["uwes_score"] is None
    assert result["turnover_intention_score"] is None
    assert result["full_result"]["pulse_summary"]["snapshot_type"] == "current_cycle"
    assert set(result["org_scores"].keys()) == {"leadership", "growth", "workload"}


def test_pulse_definition_uses_bounded_review_copy_without_old_wave_framing():
    definition = get_definition()
    trust = definition["trust_contract"]

    assert "compacte reviewroute" in trust["what_it_is"].lower()
    assert "momentopname" not in trust["how_to_read"].lower()
    assert "eerste wave" not in trust["evidence_status"].lower()
    assert "volgende wave" not in definition["report_repeat_body"].lower()
    assert "snapshot" not in definition["report_repeat_body"].lower()

from __future__ import annotations

import pytest
from types import SimpleNamespace

from fastapi import HTTPException

from backend.products.team.report_content import (
    get_management_summary_payload,
    get_hypothesis_rows,
    get_signal_page_cards_payload,
)
from backend.products.shared.sdt import compute_sdt_scores
from backend.products.team.definition import DEFAULT_TEAM_MODULES
from backend.products.team.scoring import compute_team_risk, score_submission, validate_submission


def test_team_validate_submission_requires_compact_sdt_and_local_direction():
    payload = SimpleNamespace(
        sdt_raw={"B1": 4, "B5": 4},
        stay_intent_score=None,
        org_raw={"leadership_1": 4},
    )

    with pytest.raises(HTTPException) as exc:
        validate_submission(payload)

    assert exc.value.status_code == 422


def test_compute_team_risk_uses_only_active_factors():
    sdt_scores = compute_sdt_scores({"B1": 5, "B5": 5, "B9": 5})
    org_scores = {"culture": 8.7, "workload": 3.2}

    result = compute_team_risk(sdt_scores, org_scores, ["culture", "workload"])

    assert set(result["active_factors"]) == {"culture", "workload"}
    assert "leadership" not in result["factor_risks"]
    assert 1.0 <= result["risk_score"] <= 10.0


def test_team_score_submission_builds_local_summary():
    payload = SimpleNamespace(
        sdt_raw={"B1": 4, "B5": 3, "B9": 5},
        org_raw={"leadership_1": 4, "culture_1": 3, "workload_1": 2, "role_clarity_1": 4},
        stay_intent_score=3,
    )
    respondent = SimpleNamespace(role_level="specialist", annual_salary_eur=None)

    result = score_submission(
        payload=payload,
        campaign=SimpleNamespace(enabled_modules=DEFAULT_TEAM_MODULES),
        respondent=respondent,
        exit_reason_code=None,
        contributing_reason_codes=[],
    )

    assert result["retention_summary"] is None
    assert result["uwes_score"] is None
    assert result["turnover_intention_score"] is None
    assert result["full_result"]["team_summary"]["snapshot_type"] == "current_localization_cycle"
    assert result["full_result"]["team_summary"]["localization_boundary"] == "department"
    assert result["full_result"]["team_summary"]["measurement_model"] == "compact_work_context_triage"
    assert result["full_result"]["team_summary"]["interpretation_mode"] == "localize_then_verify"
    assert "verificatie" in result["full_result"]["team_summary"]["signal_reading"].lower()
    assert set(result["org_scores"].keys()) == {"leadership", "culture", "workload", "role_clarity"}


def test_team_report_payloads_keep_department_first_boundary():
    responses = [
        SimpleNamespace(respondent=SimpleNamespace(department="Operations"))
        for _ in range(5)
    ]

    cards = get_signal_page_cards_payload(
        responses=responses,
        avg_signal=6.2,
        avg_stay_intent=5.4,
        avg_turnover_intention=None,
        top_factor_labels=["Werkdruk"],
        top_factor_keys=["workload"],
    )
    hypotheses = get_hypothesis_rows(
        top_risks=[("workload", 7.1)],
        factor_avgs={"workload": 3.9},
        top_factor_labels=["Werkdruk"],
        top_factor_keys=["workload"],
    )

    assert cards[0]["title"] == "Teamsignaal"
    assert cards[2]["value"] == "1 veilige afdeling(en)"
    assert "afdeling" in cards[2]["body"].lower()
    assert "werkdruk" in hypotheses[0]["title"].lower()
    assert "managerranking" not in hypotheses[0]["body"].lower()


def test_team_report_payloads_surface_suppression_and_fallback_boundaries():
    sparse_responses = [
        SimpleNamespace(respondent=SimpleNamespace(department="Operations"))
        for _ in range(4)
    ] + [
        SimpleNamespace(respondent=SimpleNamespace(department="People"))
        for _ in range(2)
    ]

    fallback_summary = get_management_summary_payload(
        top_factor_labels=["Werkdruk"],
        top_factor_keys=["workload"],
        responses=sparse_responses,
        avg_stay_intent=5.1,
    )
    fallback_cards = get_signal_page_cards_payload(
        responses=sparse_responses,
        avg_signal=5.8,
        avg_stay_intent=5.1,
        top_factor_labels=["Werkdruk"],
        top_factor_keys=["workload"],
    )

    assert "bredere diagnose" in fallback_summary["boardroom_cards"][2]["body"].lower()
    assert "onderdrukt" in fallback_summary["trust_note"].lower()
    assert "bredere diagnose" in fallback_cards[2]["body"].lower()

    mixed_responses = [
        SimpleNamespace(respondent=SimpleNamespace(department="Operations"))
        for _ in range(5)
    ] + [
        SimpleNamespace(respondent=SimpleNamespace(department="People"))
        for _ in range(5)
    ] + [
        SimpleNamespace(respondent=SimpleNamespace(department="Support"))
        for _ in range(3)
    ]

    mixed_summary = get_management_summary_payload(
        top_factor_labels=["Werkdruk"],
        top_factor_keys=["workload"],
        responses=mixed_responses,
        avg_stay_intent=5.4,
    )
    mixed_cards = get_signal_page_cards_payload(
        responses=mixed_responses,
        avg_signal=6.2,
        avg_stay_intent=5.4,
        top_factor_labels=["Werkdruk"],
        top_factor_keys=["workload"],
    )

    assert "onderdrukt" in mixed_summary["boardroom_cards"][2]["body"].lower()
    assert "onderdrukt" in mixed_cards[2]["body"].lower()

from __future__ import annotations

from types import SimpleNamespace

import pytest
from fastapi import HTTPException

from backend.products.leadership.definition import DEFAULT_LEADERSHIP_MODULES
from backend.products.leadership.scoring import (
    compute_leadership_risk,
    score_submission,
    validate_submission,
)
from backend.products.leadership.report_content import (
    get_hypothesis_rows,
    get_management_summary_payload,
    get_methodology_payload,
    get_next_steps_payload,
    get_signal_page_cards_payload,
)
from backend.products.shared.sdt import compute_sdt_scores


def test_leadership_validate_submission_requires_compact_context_and_direction():
    payload = SimpleNamespace(
        sdt_raw={"B1": 4, "B5": 4},
        stay_intent_score=None,
        org_raw={"leadership_1": 4},
    )

    with pytest.raises(HTTPException) as exc:
        validate_submission(payload)

    assert exc.value.status_code == 422


def test_compute_leadership_risk_uses_only_active_factors():
    sdt_scores = compute_sdt_scores({"B1": 5, "B5": 5, "B9": 5})
    org_scores = {"leadership": 3.6, "role_clarity": 4.4}

    result = compute_leadership_risk(sdt_scores, org_scores, ["leadership", "role_clarity"])

    assert set(result["active_factors"]) == {"leadership", "role_clarity"}
    assert "culture" not in result["factor_risks"]
    assert 1.0 <= result["risk_score"] <= 10.0


def test_leadership_score_submission_builds_group_level_summary():
    payload = SimpleNamespace(
        sdt_raw={"B1": 4, "B5": 3, "B9": 4},
        org_raw={"leadership_1": 3, "role_clarity_1": 4, "culture_1": 4, "growth_1": 3},
        stay_intent_score=3,
    )
    respondent = SimpleNamespace(role_level="specialist", annual_salary_eur=None)

    result = score_submission(
        payload=payload,
        campaign=SimpleNamespace(enabled_modules=DEFAULT_LEADERSHIP_MODULES),
        respondent=respondent,
        exit_reason_code=None,
        contributing_reason_codes=[],
    )

    assert result["retention_summary"] is None
    assert result["uwes_score"] is None
    assert result["turnover_intention_score"] is None
    assert result["full_result"]["leadership_summary"]["snapshot_type"] == "current_management_context_cycle"
    assert result["full_result"]["leadership_summary"]["measurement_model"] == "aggregated_management_context_triage"
    assert result["full_result"]["leadership_summary"]["interpretation_mode"] == "group_level_context_then_handoff"
    assert result["full_result"]["leadership_summary"]["boundary_state"] == "named_leader_output_forbidden"
    assert "managementcontext" in result["full_result"]["leadership_summary"]["signal_reading"].lower()
    assert "named leader" in result["full_result"]["leadership_summary"]["named_leader_distinction"].lower()
    assert "360" in result["full_result"]["leadership_summary"]["interpretation_boundary"].lower()
    assert result["full_result"]["leadership_context_summary"]["named_leader_output"] is False
    assert result["full_result"]["leadership_context_summary"]["identity_boundary"] == "group_level_only_non_named_non_360"
    assert set(result["org_scores"].keys()) == {"leadership", "role_clarity", "culture", "growth"}


def test_leadership_report_payloads_keep_group_level_boundary():
    summary = get_management_summary_payload(
        top_factor_labels=["Leiderschap"],
        top_factor_keys=["leadership"],
        avg_stay_intent=5.9,
    )
    cards = get_signal_page_cards_payload(
        responses=[],
        avg_signal=6.1,
        avg_stay_intent=5.9,
        top_factor_labels=["Leiderschap"],
        top_factor_keys=["leadership"],
    )
    hypotheses = get_hypothesis_rows(
        top_risks=[("leadership", 6.8)],
        factor_avgs={"leadership": 4.2},
        top_factor_labels=["Leiderschap"],
        top_factor_keys=["leadership"],
    )
    methodology = get_methodology_payload()
    next_steps = get_next_steps_payload(
        top_focus_labels=["Leiderschap"],
        top_focus_keys=["leadership"],
    )

    assert "groepsniveau" in summary["trust_note"].lower()
    assert "360" in summary["boardroom_watchout"].lower()
    assert "performance" in summary["boardroom_watchout"].lower()
    assert summary["executive_title"] == "Begrensde managementcontext"
    assert "bestaand people-signaal" in summary["executive_intro"].lower()
    assert len(summary["boardroom_cards"]) == 4
    assert len(summary["highlight_cards"]) == 4
    assert cards[2]["value"] == "Alleen groepsniveau"
    assert "named leaders" in cards[2]["body"].lower()
    assert "performance" in cards[2]["body"].lower()
    assert "leiderschap" in hypotheses[0]["title"].lower()
    assert "performance" not in hypotheses[0]["body"].lower()
    assert "5 responses" in methodology["intro_text"].lower()
    assert "10 responses" in methodology["intro_text"].lower()
    assert "compacte managementread" in methodology["intro_text"].lower()
    assert "formeel leesbare" not in methodology["intro_text"].lower()
    assert next_steps["session_title"] == "Eerste begrensde check na oplevering"
    assert "360" in next_steps["session_watchout"].lower()
    assert "groepsniveau" in next_steps["session_watchout"].lower()

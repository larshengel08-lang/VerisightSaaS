from __future__ import annotations

import pytest
from types import SimpleNamespace

from fastapi import HTTPException

from backend.products.onboarding.definition import DEFAULT_ONBOARDING_MODULES
from backend.products.onboarding.report_content import (
    get_hypothesis_rows,
    get_management_summary_payload,
    get_methodology_payload,
    get_next_steps_payload,
    get_signal_page_cards_payload,
)
from backend.products.onboarding.scoring import compute_onboarding_risk, score_submission, validate_submission
from backend.products.shared.sdt import compute_sdt_scores


def test_onboarding_validate_submission_requires_compact_checkpoint_set_and_direction():
    payload = SimpleNamespace(
        sdt_raw={"B1": 4, "B5": 4},
        stay_intent_score=None,
        org_raw={"role_clarity_1": 4},
    )

    with pytest.raises(HTTPException) as exc:
        validate_submission(payload)

    assert exc.value.status_code == 422


def test_compute_onboarding_risk_uses_only_active_checkpoint_factors():
    sdt_scores = compute_sdt_scores({"B1": 5, "B5": 5, "B9": 4})
    org_scores = {"role_clarity": 8.0, "culture": 4.0}

    result = compute_onboarding_risk(sdt_scores, org_scores, ["role_clarity", "culture"])

    assert set(result["active_factors"]) == {"role_clarity", "culture"}
    assert "growth" not in result["factor_risks"]
    assert 1.0 <= result["risk_score"] <= 10.0


def test_onboarding_score_submission_builds_single_checkpoint_summary():
    payload = SimpleNamespace(
        sdt_raw={"B1": 4, "B5": 3, "B9": 5},
        org_raw={"leadership_1": 4, "role_clarity_1": 3, "culture_1": 4, "growth_1": 2},
        stay_intent_score=4,
    )
    respondent = SimpleNamespace(role_level="specialist", annual_salary_eur=None)

    result = score_submission(
        payload=payload,
        campaign=SimpleNamespace(enabled_modules=DEFAULT_ONBOARDING_MODULES),
        respondent=respondent,
        exit_reason_code=None,
        contributing_reason_codes=[],
    )

    assert result["retention_summary"] is None
    assert result["uwes_score"] is None
    assert result["turnover_intention_score"] is None
    assert result["full_result"]["onboarding_summary"]["snapshot_type"] == "single_checkpoint"
    assert result["full_result"]["onboarding_summary"]["checkpoint_scope"] == "single_checkpoint_per_campaign"
    assert result["full_result"]["onboarding_summary"]["measurement_model"] == "single_checkpoint_lifecycle_triage"
    assert result["full_result"]["onboarding_summary"]["interpretation_mode"] == "checkpoint_then_handoff"
    assert result["full_result"]["onboarding_summary"]["lifecycle_boundary"] == "single_checkpoint_only"
    assert "single-checkpoint" in result["full_result"]["onboarding_summary"]["signal_reading"].lower()
    assert "client onboarding" in result["full_result"]["onboarding_summary"]["client_onboarding_distinction"].lower()
    assert "geen journey-engine" in result["full_result"]["onboarding_summary"]["interpretation_boundary"].lower()
    assert set(result["org_scores"].keys()) == {"leadership", "role_clarity", "culture", "growth"}


def test_onboarding_report_payloads_keep_single_checkpoint_boundary():
    summary = get_management_summary_payload(
        top_factor_labels=["Rolverwachting"],
        top_factor_keys=["role_clarity"],
        avg_stay_intent=5.7,
    )
    cards = get_signal_page_cards_payload(
        responses=[],
        avg_signal=5.9,
        avg_stay_intent=5.7,
        top_factor_labels=["Rolverwachting"],
        top_factor_keys=["role_clarity"],
    )
    hypotheses = get_hypothesis_rows(
        top_risks=[("role_clarity", 6.8)],
        factor_avgs={"role_clarity": 4.2},
        top_factor_labels=["Rolverwachting"],
        top_factor_keys=["role_clarity"],
    )

    assert summary["section_title"] == "Managementsamenvatting"
    assert summary["boardroom_title"] == "Bestuurlijke handoff"
    assert "vroege landingsduiding" in summary["executive_title"].lower()
    assert "single-checkpoint" in summary["trust_note"].lower()
    assert "client onboarding-route" in summary["boardroom_watchout"].lower()
    assert [card["title"] for card in summary["boardroom_cards"]] == [
        "Wat speelt nu",
        "Waarom telt dit nu",
        "Eerste werkspoor",
        "Eerste eigenaar",
        "Reviewmoment",
    ]
    assert cards[2]["value"] == "Enkel checkpoint"
    assert "journey" in cards[2]["body"].lower()
    assert "rolverwachting" in hypotheses[0]["title"].lower()
    assert "retentie" not in hypotheses[0]["body"].lower()


def test_onboarding_methodology_and_next_steps_keep_threshold_and_boundary_contract():
    methodology = get_methodology_payload()
    next_steps = get_next_steps_payload(
        top_focus_labels=["Rolverwachting"],
        top_focus_keys=["role_clarity"],
    )

    assert "5 responses" in methodology["intro_text"].lower()
    assert "10 responses" in methodology["intro_text"].lower()
    assert next_steps["section_title"] == "Route en actie"
    assert next_steps["session_title"] == "Eerste managementsessie"
    assert "journey-engine" in next_steps["session_watchout"].lower()
    assert "client onboarding-route" in next_steps["session_watchout"].lower()
    assert isinstance(next_steps["steps"], list)
    assert next_steps["steps"][0]["number"] == "1"
    assert "rolverwachting" in next_steps["steps"][0]["body"].lower()

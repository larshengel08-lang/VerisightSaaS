from __future__ import annotations

import json

import numpy as np

from analysis.retention.codebook import RETENTION_CODEBOOK
from analysis.retention.evidence import assess_validation_evidence, infer_dataset_origin, resolve_dataset_origin
from analysis.retention.validation import (
    cronbach_alpha,
    omega_total,
    pearson_correlation,
    render_markdown_report,
    run_validation_summary,
)


def _retention_row(seed: int) -> dict[str, float | int | str | None]:
    base = 3 + (seed % 2)
    low_turnover = 2 + (seed % 2)
    return {
        "campaign_id": "camp-1",
        "campaign_name": "RetentieScan Demo",
        "organization_id": "org-1",
        "respondent_id": f"resp-{seed}",
        "department": "Operations" if seed % 2 == 0 else "People",
        "role_level": "specialist",
        "submitted_at": "2026-04-13T10:00:00+00:00",
        "risk_score": 4.5 + (seed * 0.02),
        "risk_band": "MIDDEN",
        "engagement_score": 6.5 - (seed * 0.01),
        "turnover_intention_score": 3.8 + (seed * 0.01),
        "stay_intent_score_raw": base,
        "stay_intent_score_norm": 5.5 + (seed * 0.02),
        "retention_signal_score": 4.6 + (seed * 0.02),
        "signal_profile": "vroegsignaal",
        "B1": base,
        "B2": base,
        "B3": base,
        "B4": 6 - base,
        "B5": base,
        "B6": base,
        "B7": base,
        "B8": 6 - base,
        "B9": base,
        "B10": base,
        "B11": base,
        "B12": 6 - base,
        "leadership_1": base,
        "leadership_2": base,
        "leadership_3": base,
        "culture_1": base,
        "culture_2": base,
        "culture_3": base,
        "growth_1": base,
        "growth_2": base,
        "growth_3": base,
        "compensation_1": base,
        "compensation_2": base,
        "compensation_3": base,
        "workload_1": base,
        "workload_2": base,
        "workload_3": base,
        "role_clarity_1": base,
        "role_clarity_2": base,
        "role_clarity_3": base,
        "uwes_1": base,
        "uwes_2": base,
        "uwes_3": base,
        "ti_1": low_turnover,
        "ti_2": low_turnover,
    }


def test_cronbach_alpha_returns_value_for_consistent_items():
    matrix = np.array(
        [
            [4, 4, 4],
            [5, 5, 5],
            [3, 3, 3],
            [4, 4, 4],
        ],
        dtype=float,
    )
    alpha = cronbach_alpha(matrix)
    assert alpha is not None
    assert alpha >= 0.9


def test_omega_total_returns_value_for_consistent_items():
    matrix = np.array(
        [
            [4, 4, 5],
            [5, 5, 5],
            [3, 3, 4],
            [4, 4, 4],
            [2, 2, 3],
        ],
        dtype=float,
    )
    omega = omega_total(matrix)
    assert omega is not None
    assert 0.0 <= omega <= 1.0


def test_pearson_correlation_handles_insufficient_data():
    result = pearson_correlation([1.0, None], [2.0, 3.0])
    assert result["n"] == 1
    assert result["r"] is None


def test_run_validation_summary_produces_expected_sections():
    rows = [_retention_row(seed) for seed in range(50)]
    summary = run_validation_summary(rows)

    assert summary["meta"]["n_responses"] == 50
    assert "reliability" in summary
    assert "construct_validity" in summary
    assert "factor_checks" in summary
    assert "segment_aggregates" in summary
    assert any(item["scale"] == "sdt_total" for item in summary["reliability"])


def test_render_markdown_report_mentions_reliability_and_factor_checks():
    rows = [_retention_row(seed) for seed in range(50)]
    summary = run_validation_summary(rows)
    rendered = render_markdown_report(summary)

    assert "## Betrouwbaarheid" in rendered
    assert "## Factorcontrole" in rendered
    assert "## Pragmatische validatie" in rendered


def test_codebook_contains_stay_intent_and_derived_signal():
    codebook = [
        {
            "item_id": item.item_id,
            "scale": item.scale,
            "derived": item.derived,
        }
        for item in RETENTION_CODEBOOK
    ]
    payload = json.dumps(codebook, ensure_ascii=False)

    assert "stay_intent_score" in payload
    assert "retention_signal_score" in payload


def test_infer_dataset_origin_detects_synthetic_and_dummy_paths():
    assert infer_dataset_origin("retention_validation_demo.db") == "synthetic"
    assert infer_dataset_origin("retention_pilot_dummy.db") == "dummy"
    assert infer_dataset_origin("customer-retention.sqlite") == "unknown"


def test_resolve_dataset_origin_prefers_explicit_value():
    assert resolve_dataset_origin("real", "retention_validation_demo.db") == "real"


def test_assess_validation_evidence_blocks_synthetic_market_claims():
    evidence = assess_validation_evidence(responses_origin="synthetic")

    assert evidence["counts_as_market_evidence"] is False
    assert evidence["counts_as_statistical_validation"] is False
    assert evidence["counts_as_pragmatic_validation"] is False
    assert any("niet als empirisch bewijs" in warning.lower() for warning in evidence["warnings"])


def test_assess_validation_evidence_requires_real_outcomes_for_pragmatic_validation():
    evidence = assess_validation_evidence(
        responses_origin="real",
        outcomes_origin="dummy",
    )

    assert evidence["counts_as_market_evidence"] is True
    assert evidence["counts_as_statistical_validation"] is True
    assert evidence["counts_as_pragmatic_validation"] is False
    assert any("follow-up" in warning.lower() for warning in evidence["warnings"])

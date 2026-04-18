from __future__ import annotations

from datetime import datetime, timezone

from backend.schemas import CampaignStats, SurveyResponseRead


def test_campaign_stats_expose_non_breaking_average_signal_alias():
    stats = CampaignStats.model_validate(
        {
            "campaign_id": "cmp-1",
            "campaign_name": "Retentie Voorjaar",
            "scan_type": "retention",
            "total_invited": 12,
            "total_completed": 10,
            "completion_rate_pct": 83.3,
            "avg_risk_score": 6.2,
            "risk_band_distribution": {"HOOG": 3, "MIDDEN": 5, "LAAG": 2},
            "pattern_report": None,
        }
    )

    assert stats.avg_signal_score == 6.2


def test_survey_response_expose_non_breaking_signal_aliases():
    response = SurveyResponseRead.model_validate(
        {
            "id": "resp-1",
            "respondent_id": "r-1",
            "risk_score": 5.7,
            "risk_band": "MIDDEN",
            "preventability": None,
            "stay_intent_score": 3,
            "sdt_scores": {"autonomy": 5.2},
            "org_scores": {"leadership": 4.8},
            "submitted_at": datetime.now(timezone.utc),
        }
    )

    assert response.signal_score == 5.7
    assert response.direction_signal_score == 3

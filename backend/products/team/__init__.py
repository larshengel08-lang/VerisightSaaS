from __future__ import annotations

from backend.products.team.definition import SCAN_DEFINITION, get_definition
from backend.products.team.report_content import (
    get_hypotheses_payload,
    get_hypothesis_rows,
    get_management_summary_payload,
    get_methodology_payload,
    get_next_steps_payload,
    get_signal_page_cards_payload,
    get_signal_page_payload,
)
from backend.products.team.scoring import compute_team_risk, score_submission, validate_submission

scan_type = "team"

__all__ = [
    "SCAN_DEFINITION",
    "compute_team_risk",
    "get_definition",
    "get_hypotheses_payload",
    "get_hypothesis_rows",
    "get_management_summary_payload",
    "get_methodology_payload",
    "get_next_steps_payload",
    "get_signal_page_cards_payload",
    "get_signal_page_payload",
    "score_submission",
    "scan_type",
    "validate_submission",
]

from __future__ import annotations

from backend.products.onboarding.definition import SCAN_DEFINITION, get_definition
from backend.products.onboarding.scoring import (
    compute_onboarding_risk,
    score_submission,
    validate_submission,
)
from backend.products.onboarding.report_content import (
    get_hypotheses_payload,
    get_hypothesis_rows,
    get_management_summary_payload,
    get_methodology_payload,
    get_next_steps_payload,
    get_signal_page_cards_payload,
    get_signal_page_payload,
)

scan_type = "onboarding"

__all__ = [
    "SCAN_DEFINITION",
    "compute_onboarding_risk",
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

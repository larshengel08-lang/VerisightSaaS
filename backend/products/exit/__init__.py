from __future__ import annotations

from backend.products.exit.definition import SCAN_DEFINITION, get_definition
from backend.products.exit.report_content import (
    get_hypotheses_payload,
    get_management_summary_payload,
    get_methodology_payload,
    get_next_steps_payload,
    get_signal_page_payload,
)
from backend.products.exit.scoring import score_submission, validate_submission

scan_type = "exit"

__all__ = [
    "SCAN_DEFINITION",
    "get_definition",
    "get_hypotheses_payload",
    "get_management_summary_payload",
    "get_methodology_payload",
    "get_next_steps_payload",
    "get_signal_page_payload",
    "score_submission",
    "scan_type",
    "validate_submission",
]

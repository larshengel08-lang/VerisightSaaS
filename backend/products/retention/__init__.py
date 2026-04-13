from __future__ import annotations

from backend.products.retention.definition import SCAN_DEFINITION, get_definition
from backend.products.retention.report_content import (
    get_action_playbook_calibration_note,
    get_action_playbooks_payload,
    get_methodology_payload,
    get_signal_page_payload,
)
from backend.products.retention.scoring import (
    compute_retention_risk,
    compute_retention_signal_profile,
    compute_retention_supplemental_scores,
    score_submission,
    validate_submission,
)

scan_type = "retention"

__all__ = [
    "SCAN_DEFINITION",
    "compute_retention_risk",
    "compute_retention_signal_profile",
    "compute_retention_supplemental_scores",
    "get_action_playbook_calibration_note",
    "get_action_playbooks_payload",
    "get_definition",
    "get_methodology_payload",
    "get_signal_page_payload",
    "score_submission",
    "scan_type",
    "validate_submission",
]

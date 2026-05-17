from __future__ import annotations

from backend.products.culture_assessment.definition import SCAN_DEFINITION, get_definition
from backend.products.culture_assessment.report_content import (
    get_management_summary_payload,
    get_methodology_payload,
)
from backend.products.culture_assessment.scoring import score_submission, validate_submission

scan_type = "culture_assessment"

__all__ = [
    "SCAN_DEFINITION",
    "get_definition",
    "get_management_summary_payload",
    "get_methodology_payload",
    "score_submission",
    "scan_type",
    "validate_submission",
]

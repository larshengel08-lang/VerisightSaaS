from __future__ import annotations

from backend.products.mto.definition import SCAN_DEFINITION, get_definition
from backend.products.mto.scoring import compute_mto_risk, score_submission, validate_submission

scan_type = "mto"

__all__ = [
    "SCAN_DEFINITION",
    "compute_mto_risk",
    "get_definition",
    "score_submission",
    "scan_type",
    "validate_submission",
]

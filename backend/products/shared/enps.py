from __future__ import annotations

from typing import Any


def build_enps_summary(raw_score: int) -> dict[str, Any]:
    if raw_score >= 9:
        band = "promoter"
    elif raw_score >= 7:
        band = "passive"
    else:
        band = "detractor"

    return {
        "raw_score": raw_score,
        "band": band,
    }

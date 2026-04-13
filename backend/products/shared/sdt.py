from __future__ import annotations

from typing import Any

from backend.scoring_config import SDT_DIMENSION_ITEMS, SDT_REVERSE_ITEMS


def scale_to_ten(raw: float) -> float:
    return (raw - 1) / 4 * 9 + 1


def compute_sdt_scores(responses: dict[str, int]) -> dict[str, Any]:
    dim_scores: dict[str, float] = {}

    for dimension, items in SDT_DIMENSION_ITEMS.items():
        scaled_values = []
        for item in items:
            raw = responses.get(item)
            if raw is None:
                continue
            raw = float(raw)
            if item in SDT_REVERSE_ITEMS:
                raw = 6.0 - raw
            scaled_values.append(scale_to_ten(raw))

        if scaled_values:
            dim_scores[dimension] = round(sum(scaled_values) / len(scaled_values), 2)
        else:
            dim_scores[dimension] = 5.5

    sdt_total = round(sum(dim_scores.values()) / len(dim_scores), 2)
    sdt_risk = round(11.0 - sdt_total, 2)

    return {
        "autonomy": dim_scores.get("autonomy", 5.5),
        "competence": dim_scores.get("competence", 5.5),
        "relatedness": dim_scores.get("relatedness", 5.5),
        "sdt_total": sdt_total,
        "sdt_risk": sdt_risk,
    }

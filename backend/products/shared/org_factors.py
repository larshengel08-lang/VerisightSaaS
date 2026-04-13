from __future__ import annotations

from backend.products.shared.sdt import scale_to_ten
from backend.scoring_config import ORG_FACTOR_KEYS


def compute_org_scores(responses: dict[str, int | float]) -> dict[str, float]:
    factor_scores: dict[str, float] = {}

    for factor in ORG_FACTOR_KEYS:
        items = [v for k, v in responses.items() if k.startswith(factor)]
        if items:
            avg = sum(float(i) for i in items) / len(items)
            factor_scores[factor] = round(scale_to_ten(avg), 2)
        else:
            factor_scores[factor] = 5.5

    return factor_scores

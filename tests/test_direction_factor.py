"""compute_direction_factor: eigen laagste factor per respondent (spec par. 5.1)."""
from backend.products.shared.deepening import (
    DEEPENING_FACTOR_KEYS,
    compute_deepening_offers,
    compute_direction_factor,
)


def _raw(**per_factor):
    """per_factor: factor_key -> lijst van 3 stellingscores."""
    out = {}
    for fk in DEEPENING_FACTOR_KEYS:
        vals = per_factor.get(fk, [4, 4, 4])
        for i, v in enumerate(vals, start=1):
            out[f"{fk}_{i}"] = v
    return out


def test_lowest_average_wins():
    raw = _raw(workload=[2, 2, 3], growth=[3, 3, 3])
    assert compute_direction_factor(raw) == "workload"


def test_high_scores_still_yield_a_factor():
    # De 'iemand wiens laagste een 8 is'-respondent: geen trigger, wel een richtingfactor.
    raw = _raw(growth=[4, 4, 3])
    assert compute_direction_factor(raw) == "growth"
    assert compute_deepening_offers(raw, "retention") == []


def test_tiebreak_low_count_then_min_then_order():
    # Gelijk gemiddelde 3.0: workload heeft twee stellingen <=2, growth een -> workload.
    raw = _raw(workload=[2, 2, 5], growth=[1, 4, 4])
    assert compute_direction_factor(raw) == "workload"
    # Gelijk gemiddelde, gelijk low_count: laagste minimum wint.
    raw = _raw(workload=[2, 3, 4], growth=[1, 4, 4])
    assert compute_direction_factor(raw) == "growth"
    # Volledig gelijk: vaste volgorde (leadership staat voor culture).
    raw = _raw(culture=[3, 3, 3], leadership=[3, 3, 3])
    assert compute_direction_factor(raw) == "leadership"


def test_none_without_items():
    assert compute_direction_factor({}) is None
    assert compute_direction_factor({"iets_anders": 3}) is None


def test_agrees_with_first_deepening_offer_when_triggered():
    raw = _raw(workload=[1, 2, 2], growth=[2, 2, 3], leadership=[2, 3, 3])
    offers = compute_deepening_offers(raw, "retention")
    assert offers and offers[0] == compute_direction_factor(raw)


def test_partially_answered_factor_still_counts():
    # De docstring belooft een factor bij minstens één beantwoorde stelling.
    # Eén lage losse score verslaat een consequent lage, volledig ingevulde factor.
    raw = {"growth_1": 1, "workload_1": 2, "workload_2": 2, "workload_3": 2}
    assert compute_direction_factor(raw) == "growth"


def test_deepening_factor_keys_match_org_factor_keys():
    # De idx-tiebreak leunt op deze volgorde; een zevende org-factor zou anders
    # stilzwijgend buiten verdieping en richting vallen.
    from backend.scoring import ORG_FACTOR_KEYS
    assert DEEPENING_FACTOR_KEYS == list(ORG_FACTOR_KEYS)

import pytest
from backend.products.shared.deepening import compute_deepening_offers


def _org(fk, a, b, c):
    return {f"{fk}_1": a, f"{fk}_2": b, f"{fk}_3": c}


def test_avg_below_threshold_triggers():
    org = _org("workload", 2, 2, 3)  # avg 2.33
    assert "workload" in compute_deepening_offers(org, "retention")


def test_exactly_2_5_triggers():
    org = {"workload_1": 2, "workload_2": 3}  # avg exact 2.5 (2 items)
    assert "workload" in compute_deepening_offers(org, "retention")


def test_single_item_1_with_avg_below_3_5_triggers():
    org = _org("workload", 1, 4, 4)  # avg 3.0, one item == 1
    assert "workload" in compute_deepening_offers(org, "retention")


def test_single_item_1_with_high_avg_does_not_trigger():
    org = _org("workload", 1, 5, 5)  # avg 3.67 — bounded out
    assert "workload" not in compute_deepening_offers(org, "retention")


def test_two_items_leq_2_triggers():
    org = _org("workload", 2, 2, 5)  # avg 3.0, two items <= 2
    assert "workload" in compute_deepening_offers(org, "retention")


def test_high_scores_do_not_trigger():
    org = _org("workload", 4, 4, 5)
    assert compute_deepening_offers(org, "retention") == []


def test_missing_items_no_trigger():
    assert compute_deepening_offers({}, "retention") == []


def test_cap_retention_3_exit_3():
    # Retention-cap 2->3 per spec 2026-07-05 (gespreksrichting-ronde).
    org = {**_org("workload", 1, 1, 1), **_org("growth", 2, 2, 2),
           **_org("culture", 2, 2, 3), **_org("leadership", 1, 2, 2)}
    assert len(compute_deepening_offers(org, "retention")) == 3
    assert len(compute_deepening_offers(org, "exit")) == 3


def test_cap_priority_lowest_avg_first():
    org = {**_org("workload", 1, 1, 1),   # avg 1.0
           **_org("growth", 2, 2, 2)}      # avg 2.0
    offers = compute_deepening_offers(org, "retention")
    assert offers == ["workload", "growth"]


def test_cap_tiebreak_most_low_items_then_lowest_min():
    org = {**_org("workload", 2, 2, 2),   # avg 2.0, 3 items <=2, min 2
           **_org("growth", 1, 2, 3),      # avg 2.0, 2 items <=2, min 1
           **_org("culture", 1, 1, 4)}     # avg 2.0, 2 items <=2, min 1
    offers = compute_deepening_offers(org, "retention")
    # equal avg -> workload wins on most low items; growth vs culture: equal lowcount,
    # equal min -> DEEPENING_FACTOR_KEYS order decides (culture before growth)
    assert offers == ["workload", "culture", "growth"]


def test_unknown_scan_type_raises():
    with pytest.raises(ValueError):
        compute_deepening_offers({}, "bogus")


def test_non_factor_keys_ignored():
    org = {**_org("workload", 2, 2, 2), "enps_score": 1, "B1": 1}
    assert compute_deepening_offers(org, "retention") == ["workload"]

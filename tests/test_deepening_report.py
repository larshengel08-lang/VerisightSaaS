import pytest
from backend.products.shared.deepening import aggregate_deepening, agenda_enrichment


def _resp(status="answered", primary="wl_recovery", secondary=None, factor="workload",
          version="retention_workload_v1"):
    return {"factor_key": factor, "question_set_version": version,
            "status": status, "primary": primary, "secondary": secondary, "other_text": None}


def _low(fk="workload"):
    return {f"{fk}_1": 2, f"{fk}_2": 2, f"{fk}_3": 2}


def _high(fk="workload"):
    return {f"{fk}_1": 5, f"{fk}_2": 5, f"{fk}_3": 5}


def test_full_chain_counts():
    rows = [
        (_low(), [_resp()]),                                  # answered
        (_low(), [_resp(status="skipped", primary=None)]),    # offered, skipped
        (_low(), []),                                         # triggered, no entry (cap-verdrongen)
        (_high(), []),                                        # not triggered
    ]
    agg = aggregate_deepening(rows, "retention")["workload"]
    assert agg["triggered"] == 3
    assert agg["offered"] == 2
    assert agg["answered"] == 1
    assert agg["skipped"] == 1
    assert agg["primary_counts"] == {"wl_recovery": 1}


def test_secondary_counted_separately():
    rows = [(_low(), [_resp(secondary="wl_peaks_adhoc")]) for _ in range(6)]
    agg = aggregate_deepening(rows, "retention")["workload"]
    assert agg["secondary_counts"] == {"wl_peaks_adhoc": 6}
    assert agg["primary_counts"] == {"wl_recovery": 6}


def test_multiple_factors_aggregated_independently():
    rows = [
        ({**_low("workload"), **_low("growth")},
         [_resp(), _resp(factor="growth", primary="gr_time", version="retention_growth_v1")]),
    ]
    agg = aggregate_deepening(rows, "retention")
    assert agg["workload"]["answered"] == 1
    assert agg["growth"]["primary_counts"] == {"gr_time": 1}


def test_unknown_scan_type_raises():
    with pytest.raises(ValueError):
        aggregate_deepening([], "bogus")


def _agg(primary_counts, answered=None):
    n = answered if answered is not None else sum(primary_counts.values())
    return {"triggered": n, "offered": n, "answered": n, "skipped": 0,
            "primary_counts": primary_counts, "secondary_counts": {}}


def test_enrichment_all_conditions_met():
    agg = _agg({"wl_recovery": 6, "wl_volume": 2})  # n=8, top 75%, >=4, lead 4
    e = agenda_enrichment(agg, "retention", "workload")
    assert e is not None
    assert e["option_key"] == "wl_recovery"
    assert e["count"] == 6 and e["answered"] == 8
    assert "herstel" in e["agenda_question"].lower()


def test_enrichment_blocked_below_n8():
    assert agenda_enrichment(_agg({"wl_recovery": 5, "wl_volume": 2}), "retention", "workload") is None  # n=7


def test_enrichment_blocked_below_50pct():
    # n=9, top 4 -> 44%
    assert agenda_enrichment(_agg({"wl_recovery": 4, "wl_volume": 2, "wl_process": 3}), "retention", "workload") is None


def test_enrichment_blocked_top_below_4():
    # n=8 with top 3: 3+3+2 -> also fails lead; use answered=8 top=3 40% anyway blocked by >=4
    assert agenda_enrichment(_agg({"wl_recovery": 3, "wl_volume": 3, "wl_process": 2}), "retention", "workload") is None


def test_enrichment_blocked_without_lead_of_2():
    # n=9: top 5, second 4 -> lead 1 < 2 (top 55%, >=4: only lead blocks)
    assert agenda_enrichment(_agg({"wl_recovery": 5, "wl_volume": 4}), "retention", "workload") is None


def test_enrichment_lead_of_exactly_2_passes():
    # n=8: top 5 (62%), second 3 -> lead 2 passes
    e = agenda_enrichment(_agg({"wl_recovery": 5, "wl_volume": 3}), "retention", "workload")
    assert e is not None


def test_enrichment_boundary_n8_top4_exact_50pct_lead2_passes():
    # n=8: top 4 (exact 50%), second 2 (voorsprong exact 2) -> alle grenzen inclusief
    e = agenda_enrichment(_agg({"wl_recovery": 4, "wl_volume": 2}, answered=8), "retention", "workload")
    assert e is not None
    assert e["option_key"] == "wl_recovery" and e["count"] == 4 and e["answered"] == 8


def test_enrichment_blocked_when_other_is_top():
    assert agenda_enrichment(_agg({"wl_other": 6, "wl_volume": 2}), "retention", "workload") is None


def test_enrichment_none_when_no_answers():
    assert agenda_enrichment(_agg({}, answered=0), "retention", "workload") is None

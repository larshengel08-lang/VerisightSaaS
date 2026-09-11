"""aggregate_direction + direction_state (spec 2026-09-07 par. 5.3 en 5.4)."""
import logging

import pytest

from backend.products.shared.deepening import (
    DEEPENING_FACTOR_KEYS,
    aggregate_deepening,
    aggregate_direction,
    direction_state,
)

# org_raw waarbij workload de eigen laagste is (2.0) en growth de op een na laagste (3.0).
LOW_WL = {"workload_1": 2, "workload_2": 2, "workload_3": 2,
          "growth_1": 3, "growth_2": 3, "growth_3": 3,
          "leadership_1": 4, "leadership_2": 4, "leadership_3": 4}
# org_raw waarbij growth de eigen laagste is.
LOW_GR = {"growth_1": 2, "growth_2": 3, "growth_3": 2,
          "workload_1": 4, "workload_2": 4, "workload_3": 4}


def _dr(fk="workload", status="answered", choice="wld_peaks"):
    return {"factor_key": fk, "question_set_version": f"retention_{fk}_direction_v2",
            "status": status, "choice": choice if status == "answered" else None,
            "other_text": None}


def test_each_respondent_counts_in_exactly_one_factor():
    rows = [(LOW_WL, _dr()), (LOW_WL, _dr()), (LOW_GR, _dr("growth", choice="grd_time"))]
    agg = aggregate_direction(rows, "retention")
    assert set(agg) == set(DEEPENING_FACTOR_KEYS)
    assert agg["workload"]["lowest_n"] == 2 and agg["growth"]["lowest_n"] == 1
    assert sum(a["lowest_n"] for a in agg.values()) == 3
    assert agg["workload"]["counts"] == {"wld_peaks": 2}
    assert agg["growth"]["counts"] == {"grd_time": 1}


def test_chain_counts_offered_answered_skipped():
    rows = [(LOW_WL, _dr()), (LOW_WL, _dr(status="skipped")), (LOW_WL, None)]
    a = aggregate_direction(rows, "retention")["workload"]
    assert a == {"lowest_n": 3, "offered": 2, "answered": 1, "skipped": 1,
                 "counts": {"wld_peaks": 1}}


def test_missing_field_shows_as_not_offered():
    # Oude client zonder direction_response: lowest_n telt, offered niet.
    a = aggregate_direction([(LOW_WL, None)], "retention")["workload"]
    assert a["lowest_n"] == 1 and a["offered"] == 0


def test_warns_but_counts_when_offered_exceeds_lowest(caplog):
    # Kan door de servervalidatie niet ontstaan; de aggregatie vertrouwt daar niet op.
    rows = [(LOW_GR, _dr("workload"))]   # zegt workload, maar growth is de laagste
    with caplog.at_level(logging.WARNING):
        a = aggregate_direction(rows, "retention")
    assert a["workload"]["offered"] == 1 and a["workload"]["lowest_n"] == 0
    assert any("offered > lowest_n" in r.message for r in caplog.records)


def test_unknown_scan_type_raises():
    with pytest.raises(ValueError):
        aggregate_direction([], "onboarding")


def test_answered_without_choice_counts_as_answered_not_skipped():
    # Een datadefect mag nooit als "sloeg over" in het rapport belanden (spec par. 6.1).
    rows = [(LOW_WL, _dr(choice=None))]
    a = aggregate_direction(rows, "retention")["workload"]
    assert a["answered"] == 1 and a["skipped"] == 0 and a["counts"] == {}


def test_aggregate_deepening_ignores_legacy_nested_direction():
    # Oude pilotdata (juli 2026) heeft een genest `direction`-veld dat bewust niet
    # wordt gebackfilld en via report_html.py rechtstreeks uit de JSONB binnenkomt.
    legacy = {"factor_key": "workload", "question_set_version": "retention_workload_v1",
              "status": "answered", "primary": "wl_recovery", "secondary": None,
              "other_text": None,
              "direction": {"question_set_version": "retention_workload_direction_v1",
                            "status": "answered", "choice": "wld_recovery", "other_text": None}}
    a = aggregate_deepening([(LOW_WL, [legacy])], "retention")["workload"]
    assert a == {"triggered": 1, "offered": 1, "answered": 1, "skipped": 0,
                 "primary_counts": {"wl_recovery": 1}, "secondary_counts": {}}


# ── direction_state ────────────────────────────────────────────────────────

def _agg(offered=None, lowest_n=None, **counts):
    """Aggregaat voor direction_state. answered <= offered <= lowest_n wordt
    expliciet gesteld, niet aangenomen."""
    n = sum(counts.values())
    offered = n if offered is None else offered
    lowest_n = offered if lowest_n is None else lowest_n
    assert n <= offered <= lowest_n
    return {"lowest_n": lowest_n, "offered": offered, "answered": n,
            "skipped": offered - n, "counts": counts}


def test_too_few_below_3():
    assert direction_state(_agg(wld_peaks=2), "workload")["state"] == "too_few"
    assert direction_state(_agg(), "workload")["state"] == "too_few"


def test_clear_requires_half_and_margin_2():
    assert direction_state(_agg(wld_peaks=3), "workload")["state"] == "clear"            # 3-0
    assert direction_state(_agg(wld_peaks=2, wld_scope=1), "workload")["state"] == "divided"  # 2-1: marge 1
    assert direction_state(_agg(wld_peaks=3, wld_scope=1), "workload")["state"] == "clear"    # 3-1
    assert direction_state(_agg(wld_peaks=5, wld_scope=3, wld_none=2), "workload")["state"] == "clear"   # 50%, marge 2
    assert direction_state(_agg(wld_peaks=5, wld_scope=4, wld_none=1), "workload")["state"] == "divided"  # marge 1
    assert direction_state(_agg(wld_peaks=4, wld_scope=2, wld_none=2, wld_time=2), "workload")["state"] == "divided"  # 40%


def test_none_needed_requires_a_strict_majority():
    """B11: de kop zegt 'volgens de meeste betrokkenen', dus precies de helft
    is niet genoeg. Boven de helft telt wel, ook bij kleine n."""
    assert direction_state(_agg(wld_none=3, wld_peaks=1), "workload")["state"] == "none_needed"   # 3 van 4
    assert direction_state(_agg(wld_none=2, wld_peaks=1), "workload")["state"] == "none_needed"   # 2 van 3
    assert direction_state(_agg(wld_none=5, wld_peaks=1, wld_scope=1), "workload")["state"] == "none_needed"
    # Precies de helft: valt door naar de gewone logica.
    assert direction_state(_agg(wld_none=2, wld_peaks=2), "workload")["state"] != "none_needed"   # 2 van 4
    assert direction_state(_agg(wld_none=3, wld_peaks=2, wld_scope=1), "workload")["state"] != "none_needed"  # 3 van 6
    # Onder de vloer is too_few sterker dan welke ratio ook.
    assert direction_state(_agg(wld_none=1, wld_peaks=1), "workload")["state"] == "too_few"       # 1 van 2


def test_exactly_half_none_falls_through_to_divided():
    """Op precies de helft mag de niets-optie nooit als 'clear' eindigen: dan
    zou het rapport een opdrachtvorm voor niets-doen drukken. De clear-tak
    sluit *_none uit, dus de fall-through landt hier gegarandeerd op divided."""
    for counts in ({"wld_none": 2, "wld_peaks": 2},
                   {"wld_none": 2, "wld_peaks": 1, "wld_scope": 1},
                   {"wld_none": 4, "wld_peaks": 2, "wld_scope": 2}):
        st = direction_state(_agg(**counts), "workload")
        assert st["state"] == "divided", counts
        assert not (st["state"] == "clear" and st["top_key"].endswith("_none"))


def test_strikte_niets_meerderheid_wordt_none_needed_minderheid_niet():
    """Boven de helft "niets" -> none_needed; eronder niet.

    Heette test_none_needed_is_evaluated_before_clear, met de claim dat een
    niets-meerderheid wint van een route die zelf de clear-drempel haalt. Die
    claim is sinds de strikte meerderheid (commit 83cce033) rekenkundig
    onmogelijk -- none_needed vraagt de niets-optie boven 50%, clear vraagt een
    niet-niets-optie op of boven 50% -- en de fixture hieronder (niets 5 van 8,
    hoogste route 2) benaderde hem sowieso nooit.
    """
    s = direction_state(_agg(wld_none=5, wld_peaks=2, wld_scope=1), "workload")
    assert s["state"] == "none_needed" and s["top_key"] == "wld_none" and s["top_n"] == 5
    assert direction_state(_agg(wld_none=2, wld_peaks=3), "workload")["state"] == "divided"  # niets 40%, peaks 60% marge 1


def test_other_as_top_is_divided_and_logged(caplog):
    with caplog.at_level(logging.WARNING):
        s = direction_state(_agg(wld_other=6, wld_peaks=2), "workload")
    assert s["state"] == "divided"
    assert any("optieset review" in r.message for r in caplog.records)


def test_other_top_below_warn_threshold_is_silent(caplog):
    with caplog.at_level(logging.WARNING):
        s = direction_state(_agg(wld_other=4, wld_peaks=2), "workload")
    assert s["state"] == "divided"
    assert not [r for r in caplog.records if "optieset review" in r.message]


def test_state_payload_shape():
    s = direction_state(_agg(wld_peaks=6, wld_scope=2, wld_none=2), "workload")
    assert s["state"] == "clear"
    assert s["n"] == 10 and s["top_key"] == "wld_peaks" and s["top_n"] == 6 and s["second_n"] == 2
    assert s["ranked"][0] == ("wld_peaks", 6)
    assert [k for k, _ in s["ranked"]] == ["wld_peaks", "wld_none", "wld_scope"]  # aantal desc, key asc


def test_empty_counts_with_enough_answered_raises():
    agg = {"lowest_n": 3, "offered": 3, "answered": 3, "skipped": 0, "counts": {}}
    with pytest.raises(ValueError):
        direction_state(agg, "workload")

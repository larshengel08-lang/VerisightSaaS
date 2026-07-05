"""Aggregatie + concordantie + agenda-scenario's (spec 2026-07-05 par. 5/7.2/7.3)."""
from backend.products.shared.deepening import (
    aggregate_deepening,
    direction_agenda_scenario,
    is_concordant,
)

LOW = {"workload_1": 1, "workload_2": 2, "workload_3": 2}  # triggert workload


def _row(primary="wl_recovery", dir_status="answered", choice="wld_recovery"):
    entry = {"factor_key": "workload", "question_set_version": "retention_workload_v1",
             "status": "answered", "primary": primary, "secondary": None, "other_text": None}
    if dir_status is not None:
        entry["direction"] = {"question_set_version": "retention_workload_direction_v1",
                              "status": dir_status, "choice": choice, "other_text": None}
    return (LOW, [entry])


def test_is_concordant_via_related_mapping():
    assert is_concordant("workload", primary="wl_recovery", direction_choice="wld_recovery")
    assert not is_concordant("workload", primary="wl_capacity", direction_choice="wld_priorities")


def test_aggregate_counts_direction_chain():
    rows = [_row() for _ in range(6)] + [_row(dir_status="skipped", choice=None)] + \
           [_row(dir_status=None)]  # entry zonder direction = niet aangeboden/legacy
    agg = aggregate_deepening(rows, "retention")["workload"]
    assert agg["direction_offered"] == 7          # entries mét direction-veld
    assert agg["direction_answered"] == 6
    assert agg["direction_skipped"] == 1
    assert agg["direction_counts"] == {"wld_recovery": 6}


def test_scenario_concordant_when_tops_related():
    rows = [_row() for _ in range(10)]            # oorzaak-top wl_recovery, richting-top wld_recovery
    agg = aggregate_deepening(rows, "retention")["workload"]
    s = direction_agenda_scenario(agg, "retention", "workload")
    assert s["scenario"] == "concordant"
    assert s["agenda_question"].endswith("?")


def test_scenario_discrepant_when_tops_unrelated():
    rows = [_row(primary="wl_capacity", choice="wld_priorities") for _ in range(10)]
    agg = aggregate_deepening(rows, "retention")["workload"]
    s = direction_agenda_scenario(agg, "retention", "workload")
    assert s["scenario"] == "discrepant"


def test_scenario_none_when_direction_weak():
    # richting versnipperd: topoptie haalt <4 respondenten en <50% -> alleen-oorzaak
    rows = ([_row(choice="wld_recovery") for _ in range(3)] +
            [_row(choice="wld_priorities") for _ in range(3)] +
            [_row(choice="wld_planning") for _ in range(2)] +
            [_row(choice="wld_peaks") for _ in range(2)])
    agg = aggregate_deepening(rows, "retention")["workload"]
    s = direction_agenda_scenario(agg, "retention", "workload")
    assert s["scenario"] == "cause_only"


def test_scenario_none_when_direction_top_is_other():
    rows = [_row(choice="wld_other") for _ in range(10)]
    agg = aggregate_deepening(rows, "retention")["workload"]
    s = direction_agenda_scenario(agg, "retention", "workload")
    assert s["scenario"] == "cause_only"          # other nooit template-verrijking


def test_scenario_stopregel_hoge_overslag():
    # >40% van aangeboden richtingen geskipt -> direction_suppressed
    rows = [_row() for _ in range(8)] + [_row(dir_status="skipped", choice=None) for _ in range(6)]
    agg = aggregate_deepening(rows, "retention")["workload"]
    s = direction_agenda_scenario(agg, "retention", "workload")
    assert s["scenario"] == "cause_only"
    assert s["direction_suppressed_by_skip"] is True

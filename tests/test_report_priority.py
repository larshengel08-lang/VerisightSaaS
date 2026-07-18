"""Tests voor rank_factors (spec 2026-07-18 par. 3) — pure rangorde-logica."""
import pytest

from backend.report_priority import (
    PRIORITY_TIE_MARGIN,
    SPREAD_FLAG_MIN_SHARE,
    rank_factors,
)

# Handige defaults: geen spreiding-data, geen deepening, geen exit-redenen.
def _rank(scan_type, avgs, resp=None, deep=None, reasons=None, labels=None):
    return rank_factors(scan_type, avgs, resp or {}, deep or {},
                        exit_reason_counts=reasons, labels=labels or {})


def test_basic_order_is_score_ascending():
    avgs = {"growth": 5.1, "workload": 6.2, "leadership": 7.0}
    keys = [r["key"] for r in _rank("retention", avgs)]
    assert keys == ["growth", "workload", "leadership"]


def test_sdt_dimensions_never_in_raster():
    # Bugfix 2026-07-13: factor_averages bevat ook SDT-dimensies; autonomy heeft
    # hier de laagste score en mag toch nooit verschijnen.
    avgs = {"autonomy": 2.0, "competence": 2.5, "relatedness": 3.0,
            "growth": 5.1, "workload": 6.2}
    keys = [r["key"] for r in _rank("retention", avgs)]
    assert keys == ["growth", "workload"]


def test_exit_reason_weight_shifts_base():
    # Bestaande formule: base = score - 0.4 * vertrekreden-count.
    avgs = {"growth": 5.0, "workload": 5.5}
    rows = _rank("exit", avgs, reasons={"workload": 2})  # workload base = 4.7
    assert [r["key"] for r in rows] == ["workload", "growth"]
    assert rows[0]["base"] == pytest.approx(4.7)
    assert rows[0]["score"] == pytest.approx(5.5)  # getoonde score blijft onbewerkt


def test_retention_ignores_exit_reasons():
    avgs = {"growth": 5.0, "workload": 5.5}
    rows = _rank("retention", avgs, reasons={"workload": 5})
    assert [r["key"] for r in rows] == ["growth", "workload"]


def test_agenda_roles_top2():
    avgs = {"growth": 5.1, "workload": 5.9, "leadership": 7.0}
    rows = _rank("retention", avgs)
    assert rows[0]["agenda_role"] == "startpunt"
    assert rows[1]["agenda_role"] == "tweede"
    assert rows[2]["agenda_role"] is None


def test_deterministic_alphabetical_final_tiebreak():
    # Identieke scores, geen vlaggen: alfabetisch op label, en stabiel over runs.
    avgs = {"culture": 6.0, "workload": 6.0}
    labels = {"culture": "Cultuur en psychologische veiligheid",
              "workload": "Werkdruk en herstelruimte"}
    for _ in range(3):
        rows = _rank("retention", avgs, labels=labels)
        assert [r["key"] for r in rows] == ["culture", "workload"]

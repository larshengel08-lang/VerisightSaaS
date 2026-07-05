"""Rendering van het gespreksrichting-blok + agenda-scenario's (spec 2026-07-05 par. 7.1-7.3)."""
from backend.report_html import _direction_block, _direction_agenda_line

AGG_OK = {"triggered": 18, "offered": 15, "answered": 12, "skipped": 3,
          "primary_counts": {"wl_recovery": 8, "wl_capacity": 4},
          "direction_offered": 12, "direction_answered": 10, "direction_skipped": 2,
          "direction_counts": {"wld_recovery": 6, "wld_priorities": 4}}


def test_direction_block_shows_full_chain_and_footer():
    html = _direction_block(AGG_OK, "retention", "workload")
    assert "18" in html and "12" in html and "10" in html and "6" in html   # keten
    assert "input van respondenten" in html                                  # voetregel
    for verboden in ("aanbeveling", "actieplan", "verschilmaker"):
        assert verboden not in html.lower()


def test_direction_block_hidden_below_privacy_floor():
    agg = dict(AGG_OK, direction_answered=4, direction_counts={"wld_recovery": 4})
    html = _direction_block(agg, "retention", "workload")
    assert "Te weinig" in html and "wld" not in html


def test_agenda_line_concordant_compact():
    line = _direction_agenda_line(AGG_OK, "retention", "workload")
    assert "sluit daarbij aan" in line
    assert "Gespreksvraag:" in line and line.rstrip().endswith("?")


def test_agenda_line_discrepant():
    agg = dict(AGG_OK, primary_counts={"wl_capacity": 8, "wl_recovery": 4},
               direction_counts={"wld_priorities": 6, "wld_recovery": 4})
    line = _direction_agenda_line(agg, "retention", "workload")
    assert "lopen" in line and "verschil" in line


def test_agenda_line_none_when_cause_only():
    agg = dict(AGG_OK, direction_counts={"wld_recovery": 3, "wld_priorities": 3,
                                         "wld_planning": 2, "wld_peaks": 2})
    assert _direction_agenda_line(agg, "retention", "workload") is None

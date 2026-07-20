"""Bronregel p.02 (mq-source) volgt hoe het raster-startpunt tot stand kwam.

Sinds het prioriteringsraster (rank_factors) kan het startpunt binnen de
gelijkspel-marge via een spreidings- of verdiepingsvlag voor de strikt
laagste factor komen; de vaste regel "Gebaseerd op de laagst scorende
factor." zou p.02 dan het raster tegenspreken. _raster_attribution kiest
de regel op basis van de daadwerkelijke ranking.
"""
from backend.report_html import _bestuurlijke_read, _raster_attribution
from backend.report_priority import rank_factors


def _rank(scan_type, avgs, resp=None, deep=None, reasons=None):
    return rank_factors(scan_type, avgs, resp or {}, deep or {},
                        exit_reason_counts=reasons)


def _flagged_deep():
    # Zelfde fixture-vorm als test_report_priority: echte wl_*-keys omdat
    # agenda_enrichment bij een gevuurde staffel get_agenda_question aanroept.
    return {"triggered": 13, "offered": 13, "answered": 13, "skipped": 0,
            "primary_counts": {"wl_volume": 9, "wl_recovery": 1},
            "secondary_counts": {}, "direction_offered": 0,
            "direction_answered": 0, "direction_skipped": 0,
            "direction_counts": {}}


def test_score_based_ranking_keeps_static_line():
    rows = _rank("retention", {"growth": 5.1, "workload": 6.2})
    assert rows[0]["key"] == "growth"
    assert _raster_attribution(rows, "retention") == \
        "Gebaseerd op de laagst scorende factor."


def test_spread_flag_flip_names_spread():
    # workload (5.4) passeert growth (5.2) via de spreidingsvlag (6 van 12
    # respondenten onder de 5): de bronregel mag dan niet meer claimen dat
    # workload de laagst scorende factor is.
    resp = {"workload": [4.0] * 6 + [7.0] * 6}
    rows = _rank("retention", {"growth": 5.2, "workload": 5.4}, resp=resp)
    assert rows[0]["key"] == "workload"
    line = _raster_attribution(rows, "retention")
    assert "vrijwel gelijk" in line and "spreiding" in line
    assert "laagst scorende factor" not in line


def test_deepening_flag_flip_names_toelichting():
    rows = _rank("retention", {"growth": 5.2, "workload": 5.4},
                 deep={"workload": _flagged_deep()})
    assert rows[0]["key"] == "workload"
    line = _raster_attribution(rows, "retention")
    assert "vrijwel gelijk" in line and "toelichting" in line
    assert "laagst scorende factor" not in line


def test_both_flags_flip_names_both_signals():
    resp = {"workload": [4.0] * 6 + [7.0] * 6}
    rows = _rank("retention", {"growth": 5.2, "workload": 5.4},
                 resp=resp, deep={"workload": _flagged_deep()})
    assert rows[0]["key"] == "workload"
    line = _raster_attribution(rows, "retention")
    assert "spreiding" in line and "toelichting" in line


def test_exit_reason_weight_flip_names_vertrekredenen():
    # workload wint op base (5.5 - 2 * 0.4 = 4.7) maar growth heeft de
    # laagste kale score: "laagst scorende factor" zou hier onwaar zijn.
    rows = _rank("exit", {"growth": 5.0, "workload": 5.5},
                 reasons={"workload": 2})
    assert rows[0]["key"] == "workload"
    line = _raster_attribution(rows, "exit")
    assert "vertrekreden" in line
    assert "laagst scorende factor" not in line


def test_exit_lowest_score_and_base_keeps_static_line():
    rows = _rank("exit", {"growth": 5.0, "workload": 6.5},
                 reasons={"growth": 1})
    assert rows[0]["key"] == "growth"
    assert _raster_attribution(rows, "exit") == \
        "Gebaseerd op de laagst scorende factor."


def test_empty_rows_give_empty_line():
    assert _raster_attribution([], "retention") == ""


def test_attribution_copy_has_no_em_dashes():
    # Vaste eis: geen em-dashes in klantzichtbare copy.
    cases = [
        ("retention", _rank("retention", {"growth": 5.1, "workload": 6.2})),
        ("retention", _rank("retention", {"growth": 5.2, "workload": 5.4},
                            resp={"workload": [4.0] * 6 + [7.0] * 6})),
        ("retention", _rank("retention", {"growth": 5.2, "workload": 5.4},
                            deep={"workload": _flagged_deep()})),
        ("exit", _rank("exit", {"growth": 5.0, "workload": 5.5},
                       reasons={"workload": 2})),
    ]
    for scan_type, rows in cases:
        assert "—" not in _raster_attribution(rows, scan_type)


def test_p02_label_is_gespreksopener():
    # Harmonisatie: p.02 en het raster labelen dezelfde vraag hetzelfde.
    html = _bestuurlijke_read(
        kernzin="K.", totaalbeeld="T.", primary_label="Groeiperspectief",
        why_cells_html="", strong_label="Rolhelderheid", strong_score=7.2,
        mgmt_q="Vraag?")
    assert 'class="mq-label">Gespreksopener<' in html
    assert "Eerste managementvraag" not in html

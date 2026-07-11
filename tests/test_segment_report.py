"""Segmentblok rapport-v6 (spec: 2026-07-11-segmentanalyse-afdelingen-design.md)."""
from backend.report_html import _department_segment_rows, render_retention_report_html
from tests.test_report_distribution import _min_retention_data


def _resp(dept, score):
    return {"department": dept, "signal_score": score}


def test_kwalificatie_n5_en_minimaal_2_afdelingen():
    # Sales n=5, Ops n=6, HR n=2 -> HR onder drempel -> Overige (n=2 < 5: geen eigen
    # rij, en Overige-bucket haalt de drempel ook niet -> geen Overige-rij)
    rows = _department_segment_rows(
        [_resp("Sales", 6.0)] * 5 + [_resp("Ops", 4.0)] * 6 + [_resp("HR", 5.0)] * 2)
    names = [r["department"] for r in rows]
    assert "Sales" in names and "Ops" in names and "HR" not in names


def test_geen_rows_bij_1_kwalificerende_afdeling():
    rows = _department_segment_rows(
        [_resp("Sales", 6.0)] * 8 + [_resp("Ops", 4.0)] * 3)
    assert rows == []          # 1 afdeling tegenover de rest = zinloos + privacyrisico


def test_overige_bucket_vanaf_n5():
    rows = _department_segment_rows(
        [_resp("Sales", 6.0)] * 5 + [_resp("Ops", 4.0)] * 5
        + [_resp("HR", 5.0)] * 3 + [_resp("Finance", 5.0)] * 2)
    overige = [r for r in rows if r["department"] == "Overige afdelingen"]
    assert len(overige) == 1 and overige[0]["n"] == 5


def test_row_bevat_score_scores_en_sortering_laagste_eerst():
    rows = _department_segment_rows(
        [_resp("Sales", 7.0)] * 5 + [_resp("Ops", 4.0)] * 5)
    assert rows[0]["department"] == "Ops"              # laagste signaal bovenaan
    assert rows[0]["avg"] == 4.0
    assert rows[0]["scores"] == [4.0] * 5              # per-respondent scores voor de strip


def test_max_8_rijen_ook_bij_overige_zonder_overflow():
    # 8 kwalificerende afdelingen (n=5, elk), dus geen overflow uit `rows[:8]`.
    # Plus 2 sub-drempel afdelingen (n=3 elk) die samen n=6 >= MIN_SEGMENT_N poolen
    # in "Overige afdelingen" -- dit moet zelfstandig (zonder overflow) ook trimmen
    # naar max 8 totale rijen i.p.v. 9.
    respondents = []
    for i, avg in enumerate([4.0, 4.5, 5.0, 5.5, 6.0, 6.5, 7.0, 7.5]):
        respondents += [_resp(f"Afd{i}", avg)] * 5
    respondents += [_resp("Klein1", 5.0)] * 3
    respondents += [_resp("Klein2", 5.0)] * 3

    rows = _department_segment_rows(respondents)

    assert len(rows) == 8
    overige = [r for r in rows if r["department"] == "Overige afdelingen"]
    assert len(overige) == 1
    assert overige[0]["n"] == 6


def test_respondenten_zonder_department_tellen_niet_mee():
    rows = _department_segment_rows(
        [_resp("Sales", 6.0)] * 5 + [_resp("Ops", 4.0)] * 5 + [_resp(None, 9.0)] * 4)
    assert all(r["n"] in (5,) for r in rows)


def _with_segments(rows):
    d = _min_retention_data()
    d["segment_rows"] = rows
    return d


def test_segmentblok_gerenderd_bij_data():
    html = render_retention_report_html(_with_segments([
        {"department": "Operations", "n": 14, "avg": 4.1, "scores": [4.0] * 14},
        {"department": "Sales", "n": 9, "avg": 6.8, "scores": [6.8] * 9},
    ]))
    assert "Operations" in html and "Sales" in html
    assert "minimaal 5 responses" in html            # voetregel
    assert "causale ranking" in html.lower() or "causale" in html


def test_strip_alleen_vanaf_n10():
    html = render_retention_report_html(_with_segments([
        {"department": "Operations", "n": 14, "avg": 4.1, "scores": [4.0] * 14},
        {"department": "Sales", "n": 9, "avg": 6.8, "scores": [6.8] * 9},
    ]))
    assert "spreiding vanaf 10 responses" in html    # Sales n=9: geen strip


def test_overige_zonder_strip():
    html = render_retention_report_html(_with_segments([
        {"department": "Operations", "n": 14, "avg": 4.1, "scores": [4.0] * 14},
        {"department": "Overige afdelingen", "n": 11, "avg": 5.6, "scores": [5.6] * 11,
         "is_pooled": True},
    ]))
    assert "samengestelde restgroep" in html


def test_afdeling_met_naam_overige_wordt_niet_verward_met_pool():
    # Regressietest: een ECHTE afdeling die toevallig "Overige afdelingen" heet
    # (geen gereserveerd token) moet normaal behandeld worden -- niet verward
    # met de samengestelde restgroep die _department_segment_rows zelf bouwt.
    from backend.report_html import _segment_block
    rows = [
        {"department": "Sales", "n": 12, "avg": 6.5, "scores": [6.5] * 12, "is_pooled": False},
        {"department": "Overige afdelingen", "n": 10, "avg": 3.9, "scores": [3.9] * 10,
         "is_pooled": False},
    ]
    html = _segment_block(rows, "retention")
    # De echte afdeling "Overige afdelingen" (n=10, is_pooled=False) moet WEL
    # een spreidingsstrip krijgen (SVG), niet de "samengestelde restgroep"-tekst.
    assert "samengestelde restgroep" not in html
    assert "<svg" in html


def test_degraded_state_blijft_zonder_segmentdata():
    html = render_retention_report_html(_with_segments([]))
    assert "Segmentverschillen zijn niet getoond" in html

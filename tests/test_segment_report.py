"""Segmentblok rapport-v6 (spec: 2026-07-11-segmentanalyse-afdelingen-design.md)."""
from backend.report_html import _department_segment_rows


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


def test_respondenten_zonder_department_tellen_niet_mee():
    rows = _department_segment_rows(
        [_resp("Sales", 6.0)] * 5 + [_resp("Ops", 4.0)] * 5 + [_resp(None, 9.0)] * 4)
    assert all(r["n"] in (5,) for r in rows)

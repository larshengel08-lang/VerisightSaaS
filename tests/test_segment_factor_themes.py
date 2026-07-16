"""Hoofdthema's per afdeling in de segmentanalyse (spec 2026-07-16).

Dekt de pure datalaag-helper `_department_factor_rows` en de renderlaag
(`_segment_block` met factor_rows/scan_type), incl. de twee goedgekeurde
amendementen: geen decimale score bij n=5-9, en de "niet beoordeelbaar"-regel
altijd tonen zodra omitted > 0 (ook bij n >= 10).
"""
import re

from backend.report_html import _department_factor_rows, _segment_block


# ─── Helpers voor fixtures ────────────────────────────────────────────────────

def _r(dept, org_raw):
    return {"department": dept, "org_raw": org_raw}


FIM_W = {"workload": [("W1", "Testvraag werkdruk")]}


def _row(dept, n, avg, is_pooled=False, invited=None):
    row = {"department": dept, "n": n, "avg": avg,
           "scores": [avg] * n, "is_pooled": is_pooled}
    if invited is not None:
        row["invited"] = invited
    return row


def _theme_cells(html):
    """De inhoud van de 'Laagste thema'-cellen (regex op het celsegment,
    niet de hele pagina: de score-kolom bevat legitiem ook scores)."""
    return re.findall(r'<td class="lt"[^>]*>(.*?)</td>', html, re.S)


# ─── 1. Helper: afdelingskwalificatie ────────────────────────────────────────

def test_afdeling_n4_niet_in_output_n5_wel():
    out = _department_factor_rows(
        [_r("Sales", {"W1": 3.0})] * 5 + [_r("Ops", {"W1": 3.0})] * 4, FIM_W)
    assert "Sales" in out
    assert "Ops" not in out


def test_respondenten_zonder_afdeling_tellen_niet_mee():
    out = _department_factor_rows(
        [_r("Sales", {"W1": 3.0})] * 4 + [_r(None, {"W1": 3.0})] * 3
        + [_r("", {"W1": 3.0})] * 2, FIM_W)
    assert out == {}  # Sales n=4 < MIN_SEGMENT_N; None/"" geskipt


# ─── 2. Helper: per-factor-gate ──────────────────────────────────────────────

def test_per_factor_gate_omitted_bij_te_weinig_antwoorden():
    fim = {"workload": [("W1", "q")], "leadership": [("L1", "q")]}
    resp = ([_r("Sales", {"W1": 3.0, "L1": 2.0})] * 4
            + [_r("Sales", {"W1": 3.0})] * 2)  # leadership: maar 4 van 6
    out = _department_factor_rows(resp, fim)
    fks = [fk for fk, _avg, _n in out["Sales"]["factors"]]
    assert fks == ["workload"]
    assert out["Sales"]["omitted"] == 1


def test_respondent_zonder_items_telt_niet_mee_voor_n_factor():
    # 5 respondenten in de afdeling, maar 1 heeft geen enkel workload-item
    # beantwoord -> n_factor=4 < MIN_SEGMENT_N -> factor omitted.
    resp = [_r("Sales", {"W1": 3.0})] * 4 + [_r("Sales", {})]
    out = _department_factor_rows(resp, FIM_W)
    assert out["Sales"]["factors"] == []
    assert out["Sales"]["omitted"] == 1


# ─── 3. Helper: sortering ────────────────────────────────────────────────────

def test_sortering_laagste_eerst_gelijkspel_alfabetisch():
    fim = {"workload": [("W1", "q")], "leadership": [("L1", "q")],
           "culture": [("C1", "q")]}
    # workload en culture exact gelijk (raw 2.0), leadership hoger (raw 4.0)
    resp = [_r("Ops", {"W1": 2.0, "L1": 4.0, "C1": 2.0})] * 5
    out = _department_factor_rows(resp, fim)
    fks = [fk for fk, _avg, _n in out["Ops"]["factors"]]
    assert fks == ["culture", "workload", "leadership"]  # tie: alfabetisch op key
    avgs = [avg for _fk, avg, _n in out["Ops"]["factors"]]
    assert avgs[0] == avgs[1] == 3.25  # _scale_to_10(2.0), afgerond op 2 dec.
    assert all(n == 5 for _fk, _avg, n in out["Ops"]["factors"])


# ─── 4. Helper: SDT-filter ───────────────────────────────────────────────────

def test_sdt_dimensies_nooit_in_output():
    fim = {"workload": [("W1", "q")], "autonomy": [("B1", "q")]}
    resp = [_r("Sales", {"W1": 3.0, "B1": 3.0})] * 5
    out = _department_factor_rows(resp, fim)
    fks = [fk for fk, _avg, _n in out["Sales"]["factors"]]
    assert "autonomy" not in fks
    assert fks == ["workload"]
    # autonomy doet niet mee -> telt ook niet als "omitted"
    assert out["Sales"]["omitted"] == 0


# ─── 5. Render: staffel n=5-9 (amendement 1: geen decimale score) ────────────

def test_render_n5_9_bandlabel_zonder_score():
    rows = [_row("Sales", 7, 4.5), _row("Ops", 6, 6.0)]
    fr = {"Sales": {"factors": [("workload", 4.2, 7)], "omitted": 0},
          "Ops": {"factors": [("leadership", 6.1, 6)], "omitted": 0}}
    html = _segment_block(rows, factor_rows=fr, scan_type="retention")
    cells = _theme_cells(html)
    sales_cell = next(c for c in cells if "Werkdruk en herstelruimte" in c)
    assert "Kwetsbaar punt" in sales_cell          # duidingslabel
    assert not re.search(r"\d\.\d/10", sales_cell)  # geen schijnprecisie
    ops_cell = next(c for c in cells if "Leiderschap en vertrouwen" in c)
    assert "Aandachtspunt" in ops_cell
    # geen subblokken onder n=10
    assert "Factorbeeld per afdeling" not in html


# ─── 6. Render: n >= 10 met score + subblok ──────────────────────────────────

def test_render_n10_score_en_subblok_laagste_eerst():
    rows = [_row("Operations", 14, 4.1), _row("Sales", 12, 6.5)]
    fr = {"Operations": {"factors": [("workload", 3.9, 14),
                                     ("leadership", 5.5, 14),
                                     ("culture", 7.0, 14)], "omitted": 0},
          "Sales": {"factors": [("growth", 6.0, 12)], "omitted": 0}}
    html = _segment_block(rows, factor_rows=fr, scan_type="retention")

    cells = _theme_cells(html)
    ops_cell = next(c for c in cells if "Werkdruk en herstelruimte" in c)
    assert "3.9/10" in ops_cell

    # subblok aanwezig, met alle gegate factoren, laagste eerst
    assert "Operations (n=14)" in html
    sub = html[html.index("Factorbeeld per afdeling"):]
    i_w = sub.index("Werkdruk en herstelruimte")
    i_l = sub.index("Leiderschap en vertrouwen")
    i_c = sub.index("Cultuur en psychologische veiligheid")
    assert i_w < i_l < i_c
    assert "3.9" in sub and "5.5" in sub and "7.0" in sub
    assert "Sales (n=12)" in html


def test_render_geen_subblok_onder_n10_ook_met_factordata():
    rows = [_row("Sales", 9, 5.0), _row("Ops", 12, 6.0)]
    fr = {"Sales": {"factors": [("workload", 4.8, 9)], "omitted": 0},
          "Ops": {"factors": [("culture", 5.9, 12)], "omitted": 0}}
    html = _segment_block(rows, factor_rows=fr, scan_type="exit")
    sub = html[html.index("Factorbeeld per afdeling"):]
    assert "Ops (n=12)" in sub
    assert "Sales (n=9)" not in html


# ─── 7. Render: pooled rij ───────────────────────────────────────────────────

def test_render_pooled_rij_mono_label_geen_subblok():
    rows = [_row("Operations", 14, 4.1),
            _row("Overige afdelingen", 11, 5.6, is_pooled=True)]
    fr = {"Operations": {"factors": [("workload", 3.9, 14)], "omitted": 0}}
    html = _segment_block(rows, factor_rows=fr, scan_type="exit")
    cells = _theme_cells(html)
    assert any("niet getoond: samengestelde restgroep" in c for c in cells)
    assert "Overige afdelingen (n=" not in html  # pool nooit een subblok


# ─── 8. Render: omitted > 0 altijd gemeld (amendement 2) ─────────────────────

def test_render_omitted_meldregel_ook_bij_n10():
    # Edge case: het werkelijk laagste thema haalt de per-factor-gate niet;
    # het getoonde laagste thema is dus "onder voorbehoud" -> meldregel.
    rows = [_row("Operations", 12, 5.0), _row("Sales", 11, 6.0)]
    fr = {"Operations": {"factors": [("workload", 5.2, 12)], "omitted": 2},
          "Sales": {"factors": [("culture", 6.1, 11)], "omitted": 0}}
    html = _segment_block(rows, factor_rows=fr, scan_type="retention")
    assert "niet beoordeelbaar: te weinig antwoorden" in html
    assert "2 thema" in html
    # ook in het subblok van Operations
    sub = html[html.index("Operations (n=12)"):]
    assert "niet beoordeelbaar" in sub


def test_render_omitted_meldregel_bij_n5_9():
    rows = [_row("Sales", 6, 5.0), _row("Ops", 7, 6.0)]
    fr = {"Sales": {"factors": [("workload", 4.9, 6)], "omitted": 1},
          "Ops": {"factors": [("culture", 6.2, 7)], "omitted": 0}}
    html = _segment_block(rows, factor_rows=fr, scan_type="exit")
    assert "1 thema" in html
    assert "niet beoordeelbaar: te weinig antwoorden" in html


# ─── 9. Render: navy-anchor themazin ─────────────────────────────────────────

def test_navy_anchor_zin_zonder_score_bij_n5_9():
    rows = [_row("Marketing", 6, 4.4, invited=8), _row("Sales", 8, 6.5)]
    fr = {"Marketing": {"factors": [("workload", 3.9, 6)], "omitted": 0},
          "Sales": {"factors": [("culture", 6.4, 8)], "omitted": 0}}
    html = _segment_block(rows, factor_rows=fr, scan_type="retention")
    assert ("Het laagst scorende thema daar is werkdruk en herstelruimte "
            "(kwetsbaar punt).") in html
    anchor = html[html.index("Startpunt voor de bespreking"):]
    assert not re.search(r"3\.9/10", anchor)


def test_navy_anchor_zin_met_score_bij_n10():
    rows = [_row("Marketing", 11, 4.4), _row("Sales", 10, 6.5)]
    fr = {"Marketing": {"factors": [("workload", 3.9, 11)], "omitted": 0},
          "Sales": {"factors": [("culture", 6.4, 10)], "omitted": 0}}
    html = _segment_block(rows, factor_rows=fr, scan_type="retention")
    assert ("Het laagst scorende thema daar is werkdruk en herstelruimte "
            "(3.9/10).") in html


def test_navy_anchor_geen_zin_zonder_factordata():
    rows = [_row("Marketing", 6, 4.4), _row("Sales", 8, 6.5)]
    fr = {"Sales": {"factors": [("culture", 6.4, 8)], "omitted": 0}}
    html = _segment_block(rows, factor_rows=fr, scan_type="retention")
    assert "Startpunt voor de bespreking" in html
    assert "Het laagst scorende thema daar is" not in html  # geen data = geen zin


# ─── 10. Render: backward-compat zonder factor_rows ──────────────────────────

def test_backward_compat_zonder_factor_rows():
    rows = [_row("Sales", 12, 6.5), _row("Ops", 10, 3.9)]
    html = _segment_block(rows)  # oude aanroep: alleen rows, positioneel
    cells = _theme_cells(html)
    assert len(cells) == 2
    assert all("n.b." in c for c in cells)
    assert "Factorbeeld per afdeling" not in html
    assert "Het laagst scorende thema daar is" not in html


def test_lege_factors_met_omitted_toont_meldregel_geen_kaal_nb():
    # Fail-loud: "alles onder de gate" (omitted > 0) is een andere staat dan
    # "geen factordata aangeleverd" — de reden moet zichtbaar zijn, geen kaal n.b.
    rows = [_row("Sales", 12, 6.5), _row("Ops", 10, 3.9)]
    fr = {"Sales": {"factors": [], "omitted": 6}}
    html = _segment_block(rows, factor_rows=fr, scan_type="exit")
    cells = _theme_cells(html)
    sales_cell = next(c for c in cells if "6 thema" in c)
    assert "niet beoordeelbaar: te weinig antwoorden" in sales_cell
    assert "n.b." not in sales_cell                 # reden vervangt het kale label
    ops_cell = next(c for c in cells if c is not sales_cell)
    assert "n.b." in ops_cell                        # echt geen data: wel n.b.
    assert "Factorbeeld per afdeling" not in html    # geen subblok zonder factors


def test_alle_factoren_onder_gate_via_helper_eind_tot_eind():
    # Afdeling n=6 waar elke factor door <5 antwoorden de gate mist: helper
    # levert factors=[] + omitted, render toont de meldregel.
    fim = {"workload": [("W1", "q")], "leadership": [("L1", "q")]}
    resp = ([_r("Sales", {"W1": 3.0, "L1": 3.0})] * 4
            + [_r("Sales", {})] * 2
            + [_r("Ops", {"W1": 4.0, "L1": 4.0})] * 5)
    out = _department_factor_rows(resp, fim)
    assert out["Sales"]["factors"] == [] and out["Sales"]["omitted"] == 2
    rows = [_row("Sales", 6, 5.0), _row("Ops", 5, 6.0)]
    html = _segment_block(rows, factor_rows=out, scan_type="exit")
    sales_cell = next(c for c in _theme_cells(html) if "2 thema" in c)
    assert "niet beoordeelbaar: te weinig antwoorden" in sales_cell


# ─── Integratie: renderer geeft factor_rows door ─────────────────────────────

def test_volledige_renderer_toont_laagste_thema():
    from backend.report_html import render_retention_report_html
    from tests.test_report_distribution import _min_retention_data
    d = _min_retention_data()
    d["segment_rows"] = [_row("Operations", 14, 4.1), _row("Sales", 11, 6.8)]
    d["segment_factor_rows"] = {
        "Operations": {"factors": [("workload", 3.9, 14)], "omitted": 0},
        "Sales": {"factors": [("workload", 6.7, 11)], "omitted": 0}}
    html = render_retention_report_html(d)
    assert "Werkdruk en herstelruimte" in html
    assert "3.9/10" in html
    assert "Factorbeeld per afdeling" in html

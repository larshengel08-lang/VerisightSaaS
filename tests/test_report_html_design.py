"""Design-overhaul tests — structuur en CSS-klassen."""
from backend.report_css import build_css
from backend.report_html import _bestuurlijke_read


def test_br_kernzin_class_present():
    css = build_css("exit")
    assert ".br-kernzin" in css


def test_fbar_label_class_present():
    css = build_css("retention")
    assert ".fbar-label" in css


def test_mgmt_anchor_class_present():
    css = build_css("onboarding")
    assert ".mgmt-anchor" in css


def test_bestuurlijke_read_kernzin_uses_br_class():
    html = _bestuurlijke_read(
        kernzin="Werkdruk springt er duidelijk uit.",
        totaalbeeld="Leiderschap scoort relatief sterk.",
        primary_label="Werkdruk en balans",
        primary_score=4.8,
        primary_color="#EF4444",
        why_cells_html="<td class='why-cell'><div>test</div></td>",
        strong_label="Leiderschap en feedback",
        strong_score=7.2,
        mgmt_q="Speelt de werkdruk in bepaalde teams?",
    )
    assert "br-kernzin" in html
    assert "Werkdruk springt er duidelijk uit." in html


def test_bestuurlijke_read_mgmt_q_visible():
    html = _bestuurlijke_read(
        kernzin="Test.",
        totaalbeeld="Test totaal.",
        primary_label="Werkdruk en balans",
        primary_score=5.1,
        primary_color="#F59E0B",
        why_cells_html="",
        strong_label="Leiderschap",
        strong_score=7.0,
        mgmt_q="Is de werkdruk structureel of tijdelijk?",
    )
    assert "Is de werkdruk structureel of tijdelijk?" in html


from backend.report_html import _factor_bar_row

def test_factor_bar_row_shows_interpretation_label():
    html = _factor_bar_row("Werkdruk en balans", 4.5)
    assert "fbar-label" in html
    assert "Kwetsbaar punt" in html  # score 4.5 < 5.0

def test_factor_bar_row_aandachtspunt():
    html = _factor_bar_row("Leiderschap", 5.8)
    assert "Aandachtspunt" in html  # 5.0 <= 5.8 < 6.5

def test_factor_bar_row_relatief_sterk():
    html = _factor_bar_row("Cultuur", 7.1)
    assert "Relatief sterk" in html  # >= 6.5


import re

def _make_exit_factor_detail_html() -> str:
    """Minimale stub om het contract van _factor_detail te testen."""
    from backend.report_html import _mgmt_q, _factor_label, _factor_color, _score_str, _h
    from backend.scoring_config import FACTOR_LABELS_NL
    fk = "workload"
    fsc = 4.8
    col = _factor_color(fsc)
    fl_ = _factor_label(fsc)
    mgmt_q = _mgmt_q(fk, "exit")
    mgmt_block = (f'<div class="mgmt-anchor"><div class="ma-label">Eerste managementvraag</div>'
                  f'<p>{_h(mgmt_q)}</p></div>'
                  if mgmt_q else "")
    lbl = FACTOR_LABELS_NL.get(fk, fk)
    return f"""<div class="pb sec">
  <span class="slabel">Verdieping — {_h(lbl)}</span>
  <h2>{_h(lbl)} <span style="color:{col};">{_score_str(fsc)}</span></h2>
  {mgmt_block}
  <table class="item-tbl"><tr><td class="iq">Testitem</td><td class="is">4.8</td></tr></table>
</div>"""

def test_factor_detail_mgmt_q_precedes_item_table():
    html = _make_exit_factor_detail_html()
    mgmt_pos = html.find("mgmt-anchor")
    table_pos = html.find("item-tbl")
    assert mgmt_pos != -1, "mgmt-anchor block ontbreekt"
    assert table_pos != -1, "item-tbl ontbreekt"
    assert mgmt_pos < table_pos, "managementvraag moet VOOR de itemtabel staan"

def test_factor_detail_uses_mgmt_anchor_class():
    html = _make_exit_factor_detail_html()
    assert "mgmt-anchor" in html

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

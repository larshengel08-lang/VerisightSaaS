"""Leesbaarheidsronde rapport (spec: 2026-07-13-rapport-leesbaarheidsronde-design.md)."""
from tests.test_report_distribution import _min_retention_data
from backend.report_html import render_retention_report_html


def test_opener_heeft_grote_titel_geen_mono_slabel():
    from backend.report_html import _ChapterCounter
    ch = _ChapterCounter()
    html = ch.opener("Overzichtsprofiel")
    assert '<h2 class="ch-title">Overzichtsprofiel</h2>' in html
    assert 'class="slabel"' not in html


def test_opener_met_kicker():
    from backend.report_html import _ChapterCounter
    ch = _ChapterCounter()
    html = ch.opener("Gespreksagenda", kicker="Eerste managementspoor")
    assert '<span class="ch-kicker">Eerste managementspoor</span>' in html
    assert '<h2 class="ch-title">Gespreksagenda</h2>' in html


def test_vervolg_blijft_klein_mono():
    from backend.report_html import _ChapterCounter
    html = _ChapterCounter.vervolg("Verdieping — Werkdruk")
    assert 'class="slabel"' in html and "vervolg" in html


def test_agenda_na_bewijs_voor_appendix():
    # _min_retention_data() heeft maar 1 factor en n=12 — de appendix wordt pas
    # getoond bij n>20 en >5 factoren (_should_show_appendix); verrijk zodat de
    # appendix daadwerkelijk rendert, anders is de volgordecheck een no-op.
    d = _min_retention_data(n=25)
    d["factor_avgs"] = {
        "leadership": 6.0, "culture": 5.5, "growth": 4.5,
        "compensation": 5.8, "workload": 5.0, "role_clarity": 6.2,
    }
    d["factor_items_map"] = {fk: [(f"{fk}_1", f"Testvraag {fk}")] for fk in d["factor_avgs"]}
    d["org_item_avgs"] = {f"{fk}_1": v for fk, v in d["factor_avgs"].items()}
    html = render_retention_report_html(d)
    agenda = html.find("Gespreksagenda")
    appendix = html.find("Appendix")
    werkbeleving = html.find("Werkbeleving")
    assert -1 not in (agenda, appendix, werkbeleving)
    assert werkbeleving < agenda < appendix, "agenda moet na het bewijs en voor de appendix staan"

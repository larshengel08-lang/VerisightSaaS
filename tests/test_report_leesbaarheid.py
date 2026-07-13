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

"""Designsprong rapport (spec: 2026-07-12-rapport-designsprong-design.md)."""
from tests.test_report_distribution import _min_retention_data
from backend.report_html import render_retention_report_html


def test_openingspagina_bevat_read_en_responsbasis_in_een_sectie():
    html = render_retention_report_html(_min_retention_data())
    # Responsbasis-stats staan in dezelfde sectie als de bestuurlijke read:
    # tussen "Bestuurlijke read" en de eerstvolgende sectiestart mag geen
    # pagina-einde (class="pb sec") zitten vóór "Uitgenodigd".
    start = html.find("Bestuurlijke read")
    uitgenodigd = html.find("Uitgenodigd", start)
    next_page = html.find('class="pb sec"', start + 1)
    assert start != -1 and uitgenodigd != -1
    assert uitgenodigd < next_page, "responsbasis moet op de openingspagina staan"


def test_geen_zie_p03_meer():
    html = render_retention_report_html(_min_retention_data())
    assert "p.03" not in html


def test_responsbasis_compact_geen_eigen_pagina():
    from backend.report_html import _responsbasis
    band = _responsbasis(
        invited=58, completed=39, pct=67, period="Q2 2026",
        population="Actieve medewerkers",
        segment_available=True, enps_available=True, compact=True)
    assert 'class="pb sec"' not in band
    assert "Uitgenodigd" in band and "Responsbasis" in band

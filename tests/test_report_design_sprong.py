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


def test_agenda_is_navy_vlak_met_amber_labels():
    from backend.report_html import _eerste_managementspoor
    html = _eerste_managementspoor(
        primary_theme="Bespreek eerst 'X' (4.8/10)",
        second_point="Werkdruk en herstelruimte (5.5/10)",
        mgmt_q="Waar begint het gesprek?",
        review_when="Plan binnen 45-90 dagen een vervolgmoment.")
    assert 'class="agenda-dark"' in html
    assert "Gespreksopener" in html


def test_agenda_waarom_regels_alleen_bij_dataclaim():
    from backend.report_html import _eerste_managementspoor
    html = _eerste_managementspoor(
        primary_theme="Bespreek eerst 'X' (4.8/10)",
        second_point="Werkdruk en herstelruimte (5.5/10)",
        mgmt_q="Q?", review_when="R.",
        primary_why="Laagste item in het cijferbeeld (4.8/10); 6 van de 9 respondenten met verdieping kozen deze toelichting.",
        second_why="Tweede laagste factorscore in het overzichtsprofiel.")
    assert html.count('class="agenda-why"') == 2
    assert "6 van de 9" in html
    # Zonder why-regels: geen agenda-why spans
    html2 = _eerste_managementspoor(
        primary_theme="X", second_point="Y", mgmt_q="Q?", review_when="R.")
    assert 'class="agenda-why"' not in html2


def test_segmentconclusie_navy_blok():
    from backend.report_html import _segment_block
    rows = [
        {"department": "Marketing", "n": 5, "avg": 4.4, "scores": [4.4] * 5, "is_pooled": False},
        {"department": "Sales", "n": 6, "avg": 6.8, "scores": [6.8] * 6, "is_pooled": False},
    ]
    html = _segment_block(rows)
    assert "Startpunt voor de bespreking" in html
    assert "#0D1B2A" in html.split("Startpunt voor de bespreking")[0][-400:]
    # Pooled laagste rij: geen conclusieblok (bestaande voorwaarde blijft)
    rows_pooled = [
        {"department": "Overige afdelingen", "n": 6, "avg": 4.0, "scores": [4.0] * 6, "is_pooled": True},
        {"department": "Sales", "n": 6, "avg": 6.8, "scores": [6.8] * 6, "is_pooled": False},
    ]
    assert "Startpunt voor de bespreking" not in _segment_block(rows_pooled)

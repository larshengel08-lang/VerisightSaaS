"""B9 paginavulling (spec par. 9): geen halflege pagina's. Structuur in de
HTML; de meting op de PDF loopt via scripts/check_pdf_report.py (WeasyPrint)."""
import re
import subprocess
import sys
from pathlib import Path

import pytest

from backend.report_html import (
    _ChapterCounter,
    _enps_block,
    render_exit_report_html,
    render_onboarding_report_html,
    render_retention_report_html,
)
from tests.conftest import requires_pymupdf, requires_weasyprint
from tests.test_report_degraded_page_two import _fixture
from tests.test_report_distribution import _min_retention_data

ROOT = Path(__file__).resolve().parent.parent


def _body(html):
    return html.split("</style>")[-1]


def test_enps_block_toont_aanraders_en_critici():
    html = _enps_block(8, {"n": 39, "promoters": 12, "detractors": 9})
    t = re.sub(r"<[^>]+>", " ", html)
    assert "+8" in t and "12 aanraders" in t and "9 critici" in t and "van 39" in t
    assert _enps_block(None, None) == ""


def test_enps_heeft_geen_eigen_hoofdstuk_meer_en_staat_bij_de_context():
    d = _min_retention_data()
    d["enps_available"], d["enps_score"] = True, 8
    d["enps_detail"] = {"n": 12, "promoters": 4, "detractors": 3}
    body = _body(render_retention_report_html(d))
    assert '<h2 class="ch-title">Werkgeversaanbeveling</h2>' not in body
    ctx = body.index("Waar staat behoud onder druk?")
    volgende = body.index('class="pb sec"', ctx + 10)
    assert "Werkgeversaanbeveling" in body[ctx:volgende]
    assert "4 aanraders" in body[ctx:volgende]


def test_verdiepingspaginas_na_de_eerste_stromen_en_heten_niet_vervolg():
    body = _body(render_exit_report_html(_fixture("exit", n=12, profile=True)))
    assert body.count('class="sec flow"') >= 2
    assert "(vervolg)" not in body.split('<h2 class="ch-title">Werkbeleving</h2>')[0]   # niet bij de verdieping
    body_r = _body(render_retention_report_html(_fixture("retention", n=12, profile=True)))
    assert "(vervolg)" in body_r  # de spreidingspagina van de behoudscontext blijft een echt vervolg


def test_sub_kop_zonder_vervolg():
    assert _ChapterCounter.sub("Werkdruk en balans") == '<span class="slabel">Werkdruk en balans</span>'


def test_werkbeleving_en_appendix_staan_in_twee_kolommen():
    d = _fixture("retention", n=25, profile=True)
    d["sdt_avgs"] = {"autonomy": 6.1, "competence": 6.4, "relatedness": 6.0}
    d["sdt_item_avgs"] = {"B1": 6.1, "B5": 6.4, "B9": 6.0}
    d["sdt_items"] = [("B1", "a"), ("B5", "b"), ("B9", "c")]
    body = _body(render_retention_report_html(d))
    wb = body[body.index("Werkbeleving"):]
    assert 'class="tcol wb-cols"' in wb
    app = body[body.index("Appendix"):]
    assert 'class="tcol app-cols"' in app


# ── Fail Loud: een lege werkbelevingssectie kost geen hoofdstuknummer ─────────

@pytest.mark.parametrize("scan_type", ["exit", "retention", "onboarding"])
def test_zonder_werkbeleving_geen_leeg_hoofdstuk_en_geen_gat_in_de_nummering(scan_type):
    """Een sectie die niets kan tonen, mag ook geen hoofdstuknummer opeisen.

    Voorheen rendeerden Vertrek en Behoud een Werkbeleving-pagina met een lege
    kaart zodra sdt_avgs leeg was; de leidraad wist dat al (_heeft_werkbeleving)
    en verwees er niet naar. Nu volgen sectie en leidraad dezelfde gate, en
    lopen de hoofdstuknummers zonder gat door.
    """
    d = _fixture(scan_type, n=12, profile=True)
    d["sdt_avgs"] = {}
    d["sdt_item_avgs"] = {}
    d["sdt_items"] = []
    body = _body({"exit": render_exit_report_html,
                  "retention": render_retention_report_html,
                  "onboarding": render_onboarding_report_html}[scan_type](d))
    assert '<h2 class="ch-title">Werkbeleving</h2>' not in body
    nummers = [int(m) for m in re.findall(r'<span class="ch-idx">(\d+)</span>', body)]
    assert nummers == list(range(1, len(nummers) + 1)), nummers


def test_appendix_noemt_de_enps_score_met_tellingen():
    """C7: de appendixregel zegt wat de score is, niet "zie hoofdrapport"."""
    d = _fixture("retention", n=25, profile=True)
    d["enps_available"], d["enps_score"] = True, -4
    d["enps_detail"] = {"n": 25, "promoters": 5, "detractors": 6}
    body = _body(render_retention_report_html(d))
    app = body[body.index('<h2 class="ch-title">Appendix</h2>'):]
    assert "Werkgeversaanbeveling (eNPS): -4, 5 aanraders en 6 critici van 25." in app
    assert "zie hoofdrapport" not in app

    d2 = _fixture("retention", n=25, profile=True)
    body2 = _body(render_retention_report_html(d2))
    app2 = body2[body2.index('<h2 class="ch-title">Appendix</h2>'):]
    assert "Werkgeversaanbeveling (eNPS): niet gemeten in deze meting." in app2
    assert "wave" not in app2.lower()


@pytest.mark.parametrize("scan_type", ["exit", "retention", "onboarding"])
def test_elke_renderer_laat_de_volgende_verdieping_doorstromen(scan_type):
    """Alle drie de renderers, niet alleen Vertrek.

    De klasse zit in drie bijna identieke lokale helpers (_factor_detail,
    _ret_factor_detail, _ob_factor_detail); tijdens het bouwen van deze taak
    kreeg eerst alleen Vertrek de flow-klasse en bleven Behoud en Loep Start
    stil op een geforceerde paginabreuk staan. Deze test vangt dat.
    """
    body = _body({"exit": render_exit_report_html,
                  "retention": render_retention_report_html,
                  "onboarding": render_onboarding_report_html}[scan_type](
        _fixture(scan_type, n=12, profile=True)))
    assert body.count('class="sec flow"') >= 1, "geen enkele doorstromende verdiepingspagina"


def test_geen_em_dashes_in_de_nieuwe_blokken():
    d = _fixture("retention", n=25, profile=True)
    d["enps_available"], d["enps_score"] = True, 8
    d["enps_detail"] = {"n": 25, "promoters": 9, "detractors": 7}
    body = _body(render_retention_report_html(d))
    assert "—" not in body and "&#x2014;" not in body


def _grote_appendix_data():
    """Retentiedata waarvan de appendix gegarandeerd hoger is dan één A4.

    Zes onderwerpen met elk vier stellingen plus twaalf werkbelevingsitems:
    dat is meer dan de tekstkolom van een A4 aankan, dus de tweekolomsrij van
    de appendix moet over de paginagrens gesplitst worden.
    """
    d = _fixture("retention", n=25, profile=True)
    fa = dict(d["factor_avgs"])
    fim, oim = {}, {}
    for i, fk in enumerate(fa):
        items = [(f"{fk}_{j}", f"Appendixstelling {i}{j} over dit onderwerp") for j in range(4)]
        fim[fk] = items
        for ik, _ in items:
            oim[ik] = fa[fk]
    d["factor_items_map"] = fim
    d["org_item_avgs"] = oim
    d["sdt_items"] = [(f"B{k}", f"Werkbelevingsstelling {k} over de dagelijkse praktijk")
                      for k in range(1, 13)]
    d["sdt_item_avgs"] = {f"B{k}": 6.0 for k in range(1, 13)}
    return d


@requires_weasyprint
@requires_pymupdf
def test_pdf_appendix_verliest_geen_rijen_bij_de_kolomsplitsing(tmp_path):
    """De tweekolomsappendix is hoger dan één A4 (Chromium-proxy op scenario 11:
    303mm tegen een tekstkolom van 259mm). De rij moet dus over de paginagrens
    splitsen. Kan de renderer dat niet, dan valt de onderkant van een kolom
    buiten de pagina en verdwijnen stellingen stil uit het rapport: precies wat
    Fail Loud verbiedt. WeasyPrint 70 splitst cellen (layout/table.py), maar dat
    is hier niet op een echte render te controleren; deze test doet dat wel
    zodra een renderer beschikbaar is.
    """
    from weasyprint import HTML
    import pymupdf

    d = _grote_appendix_data()
    pdf = tmp_path / "appendix.pdf"
    HTML(string=render_retention_report_html(d)).write_pdf(str(pdf))
    doc = pymupdf.open(str(pdf))
    try:
        tekst = re.sub(r"\s+", " ", "".join(p.get_text() for p in doc))
    finally:
        doc.close()
    ontbreekt = [q for _, q in
                 [it for items in d["factor_items_map"].values() for it in items]
                 + d["sdt_items"] if q not in tekst]
    assert not ontbreekt, f"stellingen verdwenen uit de PDF: {ontbreekt}"


@requires_weasyprint
@pytest.mark.parametrize("scan_type", ["exit", "retention", "onboarding"])
def test_pdf_heeft_geen_pagina_onder_veertig_procent(scan_type, tmp_path):
    from weasyprint import HTML
    html = {"exit": render_exit_report_html, "retention": render_retention_report_html,
            "onboarding": render_onboarding_report_html}[scan_type](_fixture(scan_type, n=25, profile=True))
    pdf = tmp_path / f"{scan_type}.pdf"
    HTML(string=html).write_pdf(str(pdf))
    r = subprocess.run([sys.executable, str(ROOT / "scripts" / "check_pdf_report.py"), str(pdf)],
                       capture_output=True, text=True)
    assert r.returncode == 0, r.stdout

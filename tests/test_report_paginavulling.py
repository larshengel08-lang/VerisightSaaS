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
    # "sec flow" plus eventuele extra klassen (verd, verd-eerste; fixronde 2).
    assert len(re.findall(r'class="sec flow[ "]', body)) >= 2
    assert "(vervolg)" not in body.split('<h2 class="ch-title">Werkbeleving</h2>')[0]   # niet bij de verdieping
    body_r = _body(render_retention_report_html(_fixture("retention", n=12, profile=True)))
    assert "(vervolg)" in body_r  # de spreidingspagina van de behoudscontext blijft een echt vervolg


def test_sub_kop_zonder_vervolg():
    assert _ChapterCounter.sub("Werkdruk en balans") == '<span class="slabel">Werkdruk en balans</span>'


def _volle_sdt(d):
    """Werkbeleving zoals Vertrek en Behoud die meten: vier stellingen per
    dimensie (B1 t/m B12), niet de drie checkpoint-items van Loep Start."""
    from backend.scoring_config import SDT_DIMENSION_ITEMS
    keys = [k for dim in SDT_DIMENSION_ITEMS for k in SDT_DIMENSION_ITEMS[dim]]
    d["sdt_avgs"] = {"autonomy": 6.1, "competence": 6.4, "relatedness": 6.0}
    d["sdt_items"] = [(k, f"Werkbelevingsstelling {k}") for k in keys]
    d["sdt_item_avgs"] = {k: 6.2 for k in keys}
    return d


def test_werkbeleving_staat_in_twee_kolommen_bij_een_volle_sdt_set():
    body = _body(render_retention_report_html(_volle_sdt(_fixture("retention", n=25, profile=True))))
    wb = body[body.index("Werkbeleving"):]
    assert 'class="tcol wb-cols"' in wb


def test_werkbeleving_blijft_een_kolom_als_elke_kaart_een_stelling_draagt():
    """Loep Start meet drie werkbelevingsitems (B1/B5/B9), dus &eacute;&eacute;n stelling per
    dimensie. Twee kolommen halveren dan een sectie die al dun was (0,32-0,35
    vulling gemeten op main): precies de verkeerde kant voor B9.
    """
    d = _fixture("onboarding", n=25, profile=True)
    d["sdt_avgs"] = {"autonomy": 6.1, "competence": 6.4, "relatedness": 6.0}
    d["sdt_items"] = [("B1", "a"), ("B5", "b"), ("B9", "c")]
    d["sdt_item_avgs"] = {"B1": 6.1, "B5": 6.4, "B9": 6.0}
    body = _body(render_onboarding_report_html(d))
    wb = body[body.index("Werkbeleving"):]
    assert 'class="tcol wb-cols"' not in wb
    # De kaarten staan er wel, alleen onder elkaar.
    for dim in ("Autonomie", "Competentie", "Verbondenheid"):
        assert dim in wb
    # En omgekeerd: met een volle set krijgt Loep Start wel twee kolommen, dus
    # de keuze hangt aan de data en niet aan het scantype.
    body2 = _body(render_onboarding_report_html(_volle_sdt(_fixture("onboarding", n=25, profile=True))))
    assert 'class="tcol wb-cols"' in body2[body2.index("Werkbeleving"):]


def test_appendix_staat_in_een_kolom():
    """Codereview taak 8: twee kolommen spaarden geen pagina (360mm naar 303mm,
    beide meer dan de 259mm van &eacute;&eacute;n vel) en maakten de staartpagina juist leger
    (39% naar 17%). Bovendien vroeg die opmaak celsplitsing over een
    paginagrens, een pad dat geen draaiende test dekt.
    """
    d = _volle_sdt(_fixture("retention", n=25, profile=True))
    body = _body(render_retention_report_html(d))
    app = body[body.index('<h2 class="ch-title">Appendix</h2>'):]
    assert "app-cols" not in app and 'class="tcol' not in app
    # De gedeelde helper blijft: &eacute;&eacute;n tabel per onderwerp, kop "Stelling".
    assert app.count('<th class="aq">Stelling</th>') == len(d["factor_items_map"]) + 1
    assert ">Vraag<" not in app


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
    # Niet "niet gemeten": onder de rapportagedrempel is de vraag wel gesteld,
    # alleen niet gerapporteerd. Spiegelt de meetgegevens op pagina twee, die
    # ook alleen "Niet in dit rapport" zeggen (codereview taak 8).
    assert "Werkgeversaanbeveling (eNPS): niet gerapporteerd in dit rapport." in app2
    assert "niet gemeten" not in app2 and "wave" not in app2.lower()


def test_enps_zonder_tellingen_bij_een_aanwezige_score_faalt_hard():
    """Fail Loud: een score zonder tellingen is een datafout, geen "niet gemeten".

    Zou de renderer daar stil "niet gerapporteerd" van maken, dan verdween een
    gemeten score uit het rapport zonder dat iemand het merkt.
    """
    from backend.report_html import _enps_cijfers
    assert _enps_cijfers({"enps_available": True, "enps_score": 8,
                          "enps_detail": {"n": 9, "promoters": 3, "detractors": 2}}) == (
        8, {"n": 9, "promoters": 3, "detractors": 2})
    assert _enps_cijfers({"enps_available": False, "enps_score": None}) == (None, None)
    # Ook een score die de drempel niet haalde telt niet mee.
    assert _enps_cijfers({"enps_available": False, "enps_score": 8,
                          "enps_detail": {"n": 3, "promoters": 1, "detractors": 0}}) == (None, None)
    with pytest.raises(ValueError, match="enps_detail"):
        _enps_cijfers({"enps_available": True, "enps_score": 8, "enps_detail": None})


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
    assert len(re.findall(r'class="sec flow[ "]', body)) >= 1, "geen enkele doorstromende verdiepingspagina"


def test_een_gate_voor_de_werkgeversaanbeveling():
    """Drie spellingen van dezelfde voorwaarde konden uiteenlopen.

    Een score die de rapportagedrempel niet haalde (enps_available False met een
    score in de data) mag nergens opduiken: niet in het contextblok, niet in de
    appendix, en de meetgegevens horen hem bij "Niet in dit rapport" te zetten.
    """
    d = _volle_sdt(_fixture("retention", n=25, profile=True))
    d["enps_available"], d["enps_score"] = False, 8
    d["enps_detail"] = {"n": 3, "promoters": 1, "detractors": 0}
    body = _body(render_retention_report_html(d))
    assert "aanraders" not in body
    assert "Niet in dit rapport:" in body and "werkgeversaanbeveling (eNPS)" in body
    assert "Werkgeversaanbeveling (eNPS): niet gerapporteerd in dit rapport." in body


def test_werkbeleving_volgt_de_dimensielijst_en_niet_een_vast_drietal(monkeypatch):
    """Sectie en gate lezen dezelfde lijst (SDT_LABELS).

    Komt er een dimensie bij, dan hoort die in de sectie te verschijnen zonder
    dat iemand een hardcoded drietal hoeft bij te werken; anders zou de leidraad
    naar een pagina verwijzen die die dimensie niet toont.
    """
    from backend import report_html as rh
    monkeypatch.setitem(rh.SDT_LABELS, "meaning", "Zingeving")
    monkeypatch.setitem(rh.SDT_HELP, "meaning", "Ervaren betekenis van het werk.")
    monkeypatch.setitem(rh.SDT_DIMENSION_ITEMS, "meaning", ["Z1", "Z2"])
    html = rh._werkbeleving_section(
        {"autonomy": 6.1, "meaning": 5.4},
        {"B1": 6.1, "B2": 6.0, "Z1": 5.4, "Z2": 5.5},
        [("B1", "a"), ("B2", "b"), ("Z1", "Zin 1"), ("Z2", "Zin 2")],
        "<span>kop</span>")
    assert "Zingeving" in html and "Zin 1" in html
    assert rh._heeft_werkbeleving({"meaning": 5.4}) is True


def test_css_zonder_dode_regel_en_met_afbrekende_itemtekst():
    from backend.report_css import build_css
    css = build_css("retention")
    flow = re.search(r"\.sec\.flow\s*\{([^}]+)\}", css).group(1)
    # break-before: auto is de standaardwaarde; .sec.flow draagt geen .pb, dus
    # die declaratie zette niets terug (codereview taak 8).
    assert "break-before" not in flow and "break-inside: avoid" in flow
    td = re.search(r"\.item-tbl td\s*\{([^}]+)\}", css).group(1)
    # In een halve kolom (werkbeleving) moet een lange stelling kunnen afbreken,
    # zoals .app-tbl td dat al deed.
    assert "overflow-wrap: break-word" in td


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


def test_werkbeleving_overzichtskaart_staat_boven_de_kolommen_niet_erin():
    """Stresstest na plan 3a, observatie 8: in de linkerkolom was de balkenkaart
    breder dan een halve kolom, zodat de rechterkolom van het vel liep en
    WeasyPrint die tekst afsneed. De balken staan nu over de volle breedte vóór
    de kolommen; de kolommen dragen alleen kaarten, en de tabel heeft een vaste
    opmaak zodat een cel niet met zijn inhoud meegroeit."""
    from backend.report_css import build_css
    body = _body(render_retention_report_html(_volle_sdt(_fixture("retention", n=25, profile=True))))
    wb = body[body.index('<h2 class="ch-title">Werkbeleving</h2>'):]
    kolommen = wb.index('class="tcol wb-cols"')
    assert 'class="fbar-row"' in wb[:kolommen]
    assert 'class="fbar-row"' not in wb[kolommen:wb.index('class="pb sec"')]
    # Elke kolom draagt kaarten; de eerste de grootste helft (twee van drie).
    links = wb[wb.index('class="tc-l"'):wb.index('class="tc-r"')]
    assert links.count('class="card no-break"') == 2
    css = build_css("retention")
    assert re.search(r"\.tcol\.wb-cols\s*\{[^}]*table-layout:\s*fixed", css)


# ── Fixronde na plan 3a, punt 4: geen losse conclusie of losse opener ────────

def _seg_rows():
    def r(dept, n, avg, pooled=False):
        return {"department": dept, "n": n, "avg": avg, "scores": [avg] * n,
                "is_pooled": pooled}
    return [r("Operations", 14, 4.5), r("Sales", 12, 6.8), r("IT", 11, 7.0)]


def _seg_factor_rows():
    return {d: {"factors": [("growth", 4.0, n), ("workload", 5.0, n)], "omitted": 0}
            for d, n in (("Operations", 14), ("Sales", 12), ("IT", 11))}


def test_segmentconclusie_staat_direct_onder_de_tabel_voor_de_uitsplitsing():
    """Observatie 10: onderaan de sectie paste het navy blok in vijftien
    scenario's niet meer en stond het alleen op een vel (7 tot 10%). Het loopt
    nu mee met de tabel; wat doorschuift is de uitsplitsing per afdeling."""
    from backend.report_html import _segment_block
    html = _segment_block(_seg_rows(), factor_rows=_seg_factor_rows(), scan_type="retention")
    assert html.index("</table>") < html.index("Waar het per afdeling begint")
    assert html.index("Waar het per afdeling begint") < html.index("Alle onderwerpen per afdeling")
    assert '<table class="item-tbl seg-tbl">' in html


def test_uitsplitsing_per_afdeling_twee_naast_elkaar_en_uitleg_bij_het_eerste_paar():
    from backend.report_html import _segment_factor_subblocks
    drie = _segment_factor_subblocks(_seg_rows(), _seg_factor_rows(), "retention")
    assert drie.startswith('<table class="sub-cols">')
    assert drie.count('<tbody class="sub-grp">') == 2          # paren: 2 + 1
    eerste = drie[:drie.index("</tbody>")]
    assert "Alle onderwerpen per afdeling" in eerste and "Operations (n=14)" in eerste
    assert "Sales (n=12)" in eerste and "IT (n=11)" not in eerste
    een = _segment_factor_subblocks(_seg_rows()[:1], _seg_factor_rows(), "retention")
    assert een.startswith('<div class="no-break">') and "sub-cols" not in een
    assert een.index("Alle onderwerpen per afdeling") < een.index("Operations (n=14)")
    from backend.report_css import build_css
    css = build_css("retention")
    assert ".sub-cols tbody.sub-grp { break-inside: avoid; }" in css


def test_melding_zonder_afdelingstabel_houdt_kop_en_melding_bij_elkaar():
    """Anders stond "06 Per afdeling" als laatste regel onder de werkbeleving
    en de melding alleen op het volgende vel."""
    from backend.report_html import _segment_status_block
    html = _segment_status_block(0, has_segment_data=False, opener_html="<h2>kop</h2>")
    assert html.startswith('<div class="sec no-break seg-status">')


def test_raster_agenda_invulregels_naast_elkaar_en_slotregel_reist_mee():
    """De drie invulregels onder elkaar maakten het navy blok bijna een derde
    vel hoog; met de slotregel viel het los op een eigen pagina (30 tot 32%, in
    15 alleen de slotregel op 1%)."""
    d = _fixture("retention", n=25, profile=True)
    body = _body(render_retention_report_html(d))
    slot = body[body.index('<div class="no-break agenda-slot">'):]
    slot = slot[:slot.index("Nog niet besluiten")]
    assert '<table class="steps fill-steps">' in slot
    rij = slot[slot.index('<table class="steps fill-steps">'):slot.index("</table>")]
    assert rij.count('<td class="step">') == 3
    for label in ("Prioriteit", "Eigenaar", "Vervolgmoment"):
        assert label in rij


# ── Fixronde 2 na plan 3a: ook het eerste onderwerp stroomt ──────────────────

@pytest.mark.parametrize("scan_type", ["exit", "retention", "onboarding"])
def test_ook_het_eerste_verdiepingsonderwerp_stroomt(scan_type):
    """Met een eigen vel voor het eerste onderwerp bleef het laatste alleen op
    een pagina van 27 tot 37% (01, 03, 04, 09, 18, 19). Het eerste onderwerp
    draagt de hoofdstukkop en stroomt onder het overzichtsprofiel als het past."""
    body = _body({"exit": render_exit_report_html,
                  "retention": render_retention_report_html,
                  "onboarding": render_onboarding_report_html}[scan_type](
        _fixture(scan_type, n=25, profile=True)))
    eerste = re.search(r'<div class="sec flow verd[^"]*verd-eerste">', body)
    assert eerste, "eerste verdiepingsonderwerp stroomt niet"
    assert 'class="ch-head"' in body[eerste.end():eerste.end() + 300]
    assert ("verd-compact" in eerste.group(0)) is (scan_type == "onboarding")


def test_zonder_profiel_stromen_overzicht_en_verdieping_behalve_bij_loep_start():
    """Stresstest 07: zonder profiel waren overzichtsprofiel en verdieping elk
    één zin op een eigen vel (10 en 12%). Ze stromen nu onder het vorige
    hoofdstuk. Bij Loep Start is het overzichtsprofiel hoofdstuk 02 en blijft
    het op een eigen vel, zodat pagina twee eindigt met de meetgegevens (H16)."""
    exit_body = _body(render_exit_report_html(_fixture("exit", n=8, profile=False)))
    for kop in ("Overzichtsprofiel", "Verdieping: onderwerpen met de meeste aandacht"):
        i = exit_body.index(f'<h2 class="ch-title">{kop}</h2>')
        start = exit_body.rindex("<div class=", 0, exit_body.rindex('<div class="ch-head"', 0, i) + 1)
        assert exit_body[start:start + 40].startswith('<div class="sec flow">'), kop
    ob = _body(render_onboarding_report_html(_fixture("onboarding", n=8, profile=False)))
    i = ob.index('<h2 class="ch-title">Overzichtsprofiel</h2>')
    start = ob.rindex("<div class=", 0, ob.rindex('<div class="ch-head"', 0, i) + 1)
    assert ob[start:start + 40].startswith('<div class="pb sec">')

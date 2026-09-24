"""Regel `paginaverwijzing` leest de link-annotaties (fixronde leesronde 24-9).

Een verwijzing mag naar een blok midden op een pagina wijzen, zolang het
getoonde nummer de pagina is waar het anker werkelijk staat. Gemeten op PDF's
die PyMuPDF zelf bouwt en op het echte voorbeeldrapport (WeasyPrint 70.0).
"""
from pathlib import Path

import pytest

pymupdf = pytest.importorskip("pymupdf")

from scripts import check_pdf_report as cpr  # noqa: E402

A4 = (595.0, 842.0)
ROOT = Path(__file__).resolve().parent.parent
VOORBEELD = ROOT / "docs" / "examples" / "voorbeeldrapport_retentiescan.pdf"


def _pdf(pad: Path, *, getoond: str | None, doel: int | None, leidraad: bool = False,
         kop_op_doel: bool = False) -> str:
    """Vier pagina's. Pagina 2 draagt "zie pagina <getoond>" met een link naar
    pagina-index `doel` (None: geen link). De doelpagina begint alleen met een
    hoofdstukkop als `kop_op_doel` waar is; de andere pagina's altijd."""
    doc = pymupdf.open()
    for i in range(4):
        page = doc.new_page(width=A4[0], height=A4[1])
        zonder_kop = doel is not None and i == doel and not kop_op_doel
        page.insert_text((60.0, 70.0), "regel bovenaan" if zonder_kop else "0" + str(i + 1) + " Kop",
                         fontsize=11)
        for y in range(100, 740, 20):
            page.insert_text((60.0, float(y)), "regel op " + str(y), fontsize=11)
    p2 = doc[1]
    if leidraad:
        p2.insert_text((60.0, 750.0), cpr.LEIDRAAD_MARKER + " in 45 minuten", fontsize=11)
    if getoond is not None:
        voor = "zie pagina "
        p2.insert_text((60.0, 780.0), voor + getoond, fontsize=11)
        x0 = 60.0 + pymupdf.get_text_length(voor, fontsize=11)
        x1 = x0 + max(pymupdf.get_text_length(getoond, fontsize=11), 6.0)
        rect = pymupdf.Rect(x0 - 0.5, 768.0, x1 + 0.5, 786.0)
        if doel is not None:
            p2.insert_link({"kind": pymupdf.LINK_GOTO, "from": rect, "page": doel,
                            "to": pymupdf.Point(45.0, 300.0)})
    doc.save(str(pad))
    doc.close()
    return str(pad)


def _meldingen(pad: str) -> list[str]:
    return [b.melding for b in cpr.check(pad, regels=(cpr.REGEL_VERWIJZING,))]


def test_juist_nummer_naar_het_midden_van_een_pagina_is_goed(tmp_path):
    """Het werkvragenblok staat midden op een pagina. Dat is geen fout meer,
    zolang het nummer klopt."""
    assert _meldingen(_pdf(tmp_path / "goed.pdf", getoond="3", doel=2)) == []


def test_verkeerd_nummer_is_een_bevinding(tmp_path):
    assert _meldingen(_pdf(tmp_path / "fout.pdf", getoond="3", doel=3, kop_op_doel=True)) == [
        "pagina 2: de verwijzing naar een intern anker toont pagina 3, "
        "maar het anker staat op pagina 4"]


def test_link_zonder_nummer_is_een_bevinding(tmp_path):
    pad = _pdf(tmp_path / "leeg.pdf", getoond="", doel=2)
    assert _meldingen(pad) == ["pagina 2: de link naar een intern anker toont geen paginanummer"]


def test_leidraad_met_nummers_maar_zonder_links_is_een_bevinding(tmp_path):
    """Zonder link-annotaties valt er niets na te gaan; dat mag niet als
    "geen overtreding" doorgaan."""
    pad = _pdf(tmp_path / "zonderlink.pdf", getoond="3", doel=None, leidraad=True)
    assert ("pagina 2 draagt de leidraad met paginanummers, maar geen enkele interne link; "
            "de meting kan niet nagaan of die nummers kloppen") in _meldingen(pad)


@pytest.mark.skipif(not VOORBEELD.exists(), reason="voorbeeldrapport ontbreekt")
def test_echt_voorbeeldrapport_heeft_alleen_kloppende_links():
    doc = pymupdf.open(str(VOORBEELD))
    try:
        links = [l for i in range(doc.page_count) for l in cpr._interne_links(doc[i])]
        assert len(links) >= 10, "te weinig interne links gevonden; leest de meting de PDF nog?"
        assert cpr._link_bevindingen(doc) == []
    finally:
        doc.close()


@pytest.mark.skipif(not VOORBEELD.exists(), reason="voorbeeldrapport ontbreekt")
def test_echt_voorbeeldrapport_met_een_verschoven_link_valt_op(tmp_path):
    """Mutatietest op de echte tekstlaag: vervang op pagina 2 de eerste link
    door een link naar de pagina erna. De meting moet het getoonde nummer en
    de nieuwe doelpagina noemen."""
    doc = pymupdf.open(str(VOORBEELD))
    p2 = doc[1]
    eerste = cpr._interne_links(p2)[0]
    rect = pymupdf.Rect(eerste["from"])
    getoond = int("".join(c for c in cpr._tekst_in(p2, rect) if c.isdigit()))
    for link in list(p2.get_links()):
        if pymupdf.Rect(link["from"]) == rect:
            p2.delete_link(link)
    p2.insert_link({"kind": pymupdf.LINK_GOTO, "from": rect, "page": eerste["page"] + 1,
                    "to": pymupdf.Point(45.0, 100.0)})
    pad = tmp_path / "gemuteerd.pdf"
    doc.save(str(pad))
    doc.close()
    verwacht = ("pagina 2: de verwijzing naar een intern anker toont pagina " + str(getoond)
                + ", maar het anker staat op pagina " + str(eerste["page"] + 2))
    assert verwacht in _meldingen(str(pad))

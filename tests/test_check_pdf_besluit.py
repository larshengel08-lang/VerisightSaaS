"""De twee regels die plan 3b aan scripts/check_pdf_report.py toevoegt.

Gemeten op PDF's die PyMuPDF zelf bouwt, met per regel een document dat hem
overtreedt en een document dat hem haalt. De echte render loopt via het
productie-image (plan 3b, Taak 15).
"""
from pathlib import Path

import pytest

pymupdf = pytest.importorskip("pymupdf")

from backend.report_css import build_css  # noqa: E402
from backend.report_html import BESLUIT_TITEL, BESLUIT_VOETREGEL  # noqa: E402
from scripts import check_pdf_report as cpr  # noqa: E402

A4 = (595.0, 842.0)


def _pdf(pad: Path, paginas: list[list[tuple[float, str]]]) -> str:
    doc = pymupdf.open()
    for regels in paginas:
        page = doc.new_page(width=A4[0], height=A4[1])
        for y, tekst in regels:
            page.insert_text((60.0, y), tekst, fontsize=11)
    doc.save(str(pad))
    doc.close()
    return str(pad)


def _vol(kop: str) -> list[tuple[float, str]]:
    return [(70.0, kop)] + [(y, "regel op " + str(int(y))) for y in range(100, 760, 20)]


def _dun(kop: str) -> list[tuple[float, str]]:
    return [(70.0, kop)] + [(y, "regel op " + str(int(y))) for y in range(100, 260, 20)]


BELOFTE = (400.0, "Leg het besluit vast op pagina 4: wat precies, wie, en op welke datum.")
VOET = (740.0, BESLUIT_VOETREGEL[:60])


def _besluit(met_voet: bool = True) -> list[tuple[float, str]]:
    regels = [(70.0, "04 " + BESLUIT_TITEL), (120.0, "Startpunt"), (400.0, "Eigenaar")]
    return regels + ([VOET] if met_voet else [])


# ── (a) besluit-op-een-a4 ────────────────────────────────────────────────────

def test_markers_komen_uit_de_renderer():
    assert cpr.BESLUIT_KOP == BESLUIT_TITEL
    assert BESLUIT_VOETREGEL.startswith(cpr.BESLUIT_VOET)


def test_besluitpagina_op_een_vel_is_goed(tmp_path):
    pad = _pdf(tmp_path / "goed.pdf", [_vol("cover"), _vol("01 Kop"), _vol("03 Agenda") + [BELOFTE],
                                       _besluit(), _vol("05 Appendix"), _vol("06 Methodiek")])
    assert cpr.check(pad, regels=(cpr.REGEL_BESLUIT,)) == []


def test_belofte_zonder_besluitpagina_is_een_bevinding(tmp_path):
    pad = _pdf(tmp_path / "weg.pdf", [_vol("cover"), _vol("01 Kop"), _vol("03 Agenda") + [BELOFTE],
                                      _vol("04 Appendix"), _vol("05 Methodiek")])
    meldingen = [b.melding for b in cpr.check(pad, regels=(cpr.REGEL_BESLUIT,))]
    assert len(meldingen) == 1 and "geen pagina die met" in meldingen[0]


def test_overgelopen_besluitpagina_is_een_bevinding(tmp_path):
    pad = _pdf(tmp_path / "over.pdf", [_vol("cover"), _vol("01 Kop"), _vol("03 Agenda") + [BELOFTE],
                                       _besluit(met_voet=False), [VOET], _vol("05 Appendix")])
    meldingen = [b.melding for b in cpr.check(pad, regels=(cpr.REGEL_BESLUIT,))]
    assert any("voetregel" in m for m in meldingen)
    assert any("begint niet met een hoofdstukkop" in m for m in meldingen)


def test_twee_besluitpaginas_is_een_bevinding(tmp_path):
    pad = _pdf(tmp_path / "twee.pdf", [_vol("cover"), _vol("01 Kop") + [BELOFTE], _besluit(),
                                       _besluit(), _vol("05 Methodiek")])
    meldingen = [b.melding for b in cpr.check(pad, regels=(cpr.REGEL_BESLUIT,))]
    assert len(meldingen) == 1 and "2 pagina's" in meldingen[0]


def test_oud_rapport_zonder_belofte_en_zonder_pagina_geeft_geen_bevinding(tmp_path):
    pad = _pdf(tmp_path / "oud.pdf", [_vol("cover"), _vol("01 Kop"), _vol("02 Agenda"), _vol("03 Methodiek")])
    assert cpr.check(pad, regels=(cpr.REGEL_BESLUIT,)) == []


def test_regel_zit_in_de_standaardselectie():
    assert cpr.REGEL_BESLUIT in cpr.ALLE_REGELS


def test_besluitpagina_houdt_de_appendix_van_het_vel():
    css = build_css("retention")
    regel = css[css.index(".besluit {"):]
    regel = regel[:regel.index("}")]
    assert "break-after: page" in regel and "break-inside: avoid" in regel


# ── (b) appendixstaart ───────────────────────────────────────────────────────

def _met_appendix(staart: list[tuple[float, str]]) -> list[list[tuple[float, str]]]:
    return [_vol("cover"), _vol("01 Kop"), _vol("02 Cijfers"), _vol("05 Appendix"), staart,
            _vol("06 Methodiek, privacy"), _dun("slot")]


def test_dunne_appendixstaart_is_uitgezonderd(tmp_path):
    pad = _pdf(tmp_path / "staart.pdf", _met_appendix(_dun("Werkbeleving: alle stellingen")))
    assert cpr.check(pad, regels=(cpr.REGEL_VULLING,)) == []


def test_uitzondering_is_met_een_schakelaar_terug_te_draaien(tmp_path, monkeypatch):
    pad = _pdf(tmp_path / "staart.pdf", _met_appendix(_dun("Werkbeleving: alle stellingen")))
    monkeypatch.setattr(cpr, "APPENDIX_STAART_UITGEZONDERD", False)
    meldingen = [b.melding for b in cpr.check(pad, regels=(cpr.REGEL_VULLING,))]
    assert len(meldingen) == 1 and meldingen[0].startswith("pagina 5 is")


def test_dunne_openingspagina_van_de_appendix_is_niet_uitgezonderd(tmp_path):
    pad = _pdf(tmp_path / "open.pdf", [_vol("cover"), _vol("01 Kop"), _vol("02 Cijfers"),
                                       _dun("05 Appendix"), _vol("06 Methodiek, privacy"), _dun("slot")])
    meldingen = [b.melding for b in cpr.check(pad, regels=(cpr.REGEL_VULLING,))]
    assert len(meldingen) == 1 and meldingen[0].startswith("pagina 4 is")


def test_een_dunne_pagina_elders_blijft_een_bevinding(tmp_path):
    paginas = _met_appendix(_vol("Werkbeleving: alle stellingen"))
    paginas[2] = _dun("02 Cijfers")
    meldingen = [b.melding for b in cpr.check(_pdf(tmp_path / "elders.pdf", paginas),
                                               regels=(cpr.REGEL_VULLING,))]
    assert len(meldingen) == 1 and meldingen[0].startswith("pagina 3 is")

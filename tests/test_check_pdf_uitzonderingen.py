"""Vastgelegde dunne pagina's in scripts/check_pdf_report.py (plan 2026-10-12,
Taak 4, besluit A2 van Lars op 12-10).

Een uitzondering geldt alleen voor het genoemde bestand en de hele paginakop,
alleen zolang de vulling niet onder de ondergrens zakt, en alleen via
check_met_uitzonderingen (check() en _check_doc zonder naam passen er geen
toe). Alle andere regels blijven meten. Gemeten op PDF's die PyMuPDF zelf bouwt; de echte render loopt
via het productie-image.
"""
import subprocess
import sys
from pathlib import Path

import pytest

pymupdf = pytest.importorskip("pymupdf")

from scripts import check_pdf_report as cpr  # noqa: E402

A4 = (595.0, 842.0)
ROOT = Path(__file__).resolve().parent.parent

# Zo staat de kop van de werkvragenpagina in de tekstlaag van de echte render
# (letterspatiëring en text-transform: uppercase), gemeten op 01, 09 en 14.
WERKVRAGEN_KOP = "Z O M A A K J E E R E E N B E S L U I T V A N"


def _regels(kop: str, tot_y: int) -> list[tuple[float, str]]:
    return [(70.0, kop)] + [(float(y), "regel op " + str(y)) for y in range(100, tot_y, 20)]


def _vol(kop: str) -> list[tuple[float, str]]:
    return _regels(kop, 760)


def _dun(kop: str) -> list[tuple[float, str]]:
    return _regels(kop, 260)


def _pdf(pad: Path, paginas: list[list[tuple[float, str]]],
         buiten_marge_op: int | None = None) -> str:
    doc = pymupdf.open()
    for i, regels in enumerate(paginas):
        page = doc.new_page(width=A4[0], height=A4[1])
        for y, tekst in regels:
            page.insert_text((60.0, y), tekst, fontsize=11)
        if i == buiten_marge_op:
            page.insert_text((560.0, 150.0), "Aandachtspunt", fontsize=11)
    doc.save(str(pad))
    doc.close()
    return str(pad)


# Pagina 2 draagt het meetgegevensblok, anders meldt de regel p02-op-een-a4.
P02 = _vol("01 Kop") + [(770.0, "Meetgegevens"), (785.0, "Meetperiode")]


def _rapport(dunne_kop: str = WERKVRAGEN_KOP) -> list[list[tuple[float, str]]]:
    """Zes pagina's die alle regels halen, behalve dat pagina 4 dun is en met
    `dunne_kop` begint."""
    return [_vol("cover"), P02, _vol("02 Cijfers"), _dun(dunne_kop),
            _vol("05 Methodiek"), _dun("slot")]


def _vulling(pad: str, pagina: int) -> float:
    doc = pymupdf.open(pad)
    try:
        return cpr.page_fill(doc[pagina - 1])
    finally:
        doc.close()


def _met_uitzondering(monkeypatch, pad: str, *, voorvoegsel: str = "01_",
                      marge: float) -> float:
    """Zet één uitzondering voor de werkvragenpagina, met de ondergrens `marge`
    onder (negatief: boven) de gemeten vulling van pagina 4. Geeft de grens."""
    grens = _vulling(pad, 4) - marge
    monkeypatch.setattr(cpr, "VULLING_UITZONDERINGEN", (
        cpr.VullingUitzondering(voorvoegsel, "Zo maak je er een besluit van", grens,
                                "werkvragenpagina"),))
    return grens


def _vulmeldingen(bevindingen: list) -> list[str]:
    return [b.melding for b in bevindingen if b.regel == cpr.REGEL_VULLING]


# ── de uitzondering zelf ─────────────────────────────────────────────────────

def test_uitgezonderde_pagina_telt_niet_en_staat_bij_naam(tmp_path, monkeypatch):
    pad = _pdf(tmp_path / "01_vlak_middelmatig.pdf", _rapport())
    _met_uitzondering(monkeypatch, pad, marge=0.01)
    assert _vulling(pad, 4) < cpr.MIN_FILL
    bevindingen, toegepast = cpr.check_met_uitzonderingen(pad)
    assert bevindingen == []
    assert [(u.naam, u.pagina) for u in toegepast] == [("werkvragenpagina", 4)]
    assert str(toegepast[0]) == f"werkvragenpagina p.4 {_vulling(pad, 4):.0%}"


def test_check_zonder_naam_past_geen_uitzondering_toe(tmp_path, monkeypatch):
    """`check` geeft geen naam door: daar is elke dunne pagina een bevinding.
    Alleen check_met_uitzonderingen (CLI, render_in_image) past de lijst toe."""
    pad = _pdf(tmp_path / "01_vlak_middelmatig.pdf", _rapport())
    _met_uitzondering(monkeypatch, pad, marge=0.01)
    meldingen = _vulmeldingen(cpr.check(pad))
    assert len(meldingen) == 1 and meldingen[0].startswith("pagina 4 is ")


def test_check_doc_zonder_naam_past_geen_uitzondering_toe(tmp_path, monkeypatch):
    pad = _pdf(tmp_path / "01_vlak_middelmatig.pdf", _rapport())
    _met_uitzondering(monkeypatch, pad, marge=0.01)
    doc = pymupdf.open(pad)
    try:
        bevindingen, toegepast = cpr._check_doc(doc, None, cpr.ALLE_REGELS)
    finally:
        doc.close()
    assert toegepast == []
    assert len(_vulmeldingen(bevindingen)) == 1


def test_onder_de_ondergrens_is_weer_een_bevinding(tmp_path, monkeypatch):
    """De melding toont vulling en grens met dezelfde precisie (een decimaal,
    beide naar beneden), zodat ze nooit hetzelfde getal tonen: 0,3859 tegen
    een grens van 0,386 is 38.5% tegen 38.6%, niet twee keer 38.6%."""
    pad = _pdf(tmp_path / "01_vlak_middelmatig.pdf", _rapport())
    echt = cpr.page_fill
    monkeypatch.setattr(cpr, "page_fill", lambda page: (
        0.3859 if cpr.first_text(page) == WERKVRAGEN_KOP else echt(page)))
    monkeypatch.setattr(cpr, "VULLING_UITZONDERINGEN", (
        cpr.VullingUitzondering("01_", "Zo maak je er een besluit van", 0.386,
                                "werkvragenpagina"),))
    bevindingen, toegepast = cpr.check_met_uitzonderingen(pad)
    assert toegepast == []
    assert _vulmeldingen(bevindingen) == [
        "pagina 4 is 38.5% gevuld, onder de ondergrens 38.6% van de uitzondering "
        "werkvragenpagina (< 40%); begint met " + repr(WERKVRAGEN_KOP)]


def test_vulling_en_grens_tonen_vlak_onder_de_grens_verschillende_getallen():
    """0,3859 ligt onder 0,386; gewoon afronden zou beide als 38.6% tonen."""
    assert cpr._promille_omlaag(0.3859) == "38.5%"
    assert f"{0.386:.1%}" == "38.6%"
    assert cpr._promille_omlaag(0.3211) == "32.1%"


def test_twee_uitzonderingen_in_een_bestand(tmp_path, monkeypatch):
    paginas = _rapport()
    paginas[4] = _dun("Verdieping: Werkdruk en herstelruimte")
    pad = _pdf(tmp_path / "01_vlak_middelmatig.pdf", paginas)
    monkeypatch.setattr(cpr, "VULLING_UITZONDERINGEN", (
        cpr.VullingUitzondering("01_", "Zo maak je er een besluit van",
                                _vulling(pad, 4) - 0.01, "werkvragenpagina"),
        cpr.VullingUitzondering("01_", "VERDIEPING: WERKDRUK EN HERSTELRUIMTE",
                                _vulling(pad, 5) - 0.01, "verdiepingspagina"),))
    bevindingen, toegepast = cpr.check_met_uitzonderingen(pad)
    assert bevindingen == []
    assert [(u.naam, u.pagina) for u in toegepast] == [("werkvragenpagina", 4),
                                                       ("verdiepingspagina", 5)]


def test_vervolgpagina_valt_niet_onder_de_uitzondering(tmp_path):
    """De hele kop moet gelijk zijn, niet alleen het begin."""
    assert cpr._uitzondering_voor("01_vlak_middelmatig",
                                  "VERDIEPING: WERKDRUK EN HERSTELRUIMTE") is not None
    assert cpr._uitzondering_voor("01_vlak_middelmatig",
                                  "VERDIEPING: WERKDRUK EN HERSTELRUIMTE, VERVOLG") is None
    pad = _pdf(tmp_path / "01_vlak_middelmatig.pdf",
               _rapport("VERDIEPING: WERKDRUK EN HERSTELRUIMTE, VERVOLG"))
    bevindingen, toegepast = cpr.check_met_uitzonderingen(pad)
    assert toegepast == []
    assert len(_vulmeldingen(bevindingen)) == 1


def test_zelfde_dunne_pagina_in_een_ander_bestand_is_een_bevinding(tmp_path, monkeypatch):
    pad_lijst = _pdf(tmp_path / "01_vlak_middelmatig.pdf", _rapport())
    _met_uitzondering(monkeypatch, pad_lijst, marge=0.01)
    pad = _pdf(tmp_path / "02_een_lage_factor.pdf", _rapport())
    bevindingen, toegepast = cpr.check_met_uitzonderingen(pad)
    assert toegepast == []
    meldingen = _vulmeldingen(bevindingen)
    assert len(meldingen) == 1 and meldingen[0].startswith("pagina 4 is ")
    assert "ondergrens" not in meldingen[0]


def test_voorvoegsel_matcht_niet_op_een_langer_scenarionummer(tmp_path, monkeypatch):
    pad_lijst = _pdf(tmp_path / "01_vlak_middelmatig.pdf", _rapport())
    _met_uitzondering(monkeypatch, pad_lijst, marge=0.01)
    pad = _pdf(tmp_path / "010_nieuw.pdf", _rapport())
    assert len(_vulmeldingen(cpr.check_met_uitzonderingen(pad)[0])) == 1


def test_andere_dunne_pagina_in_hetzelfde_bestand_blijft_een_bevinding(tmp_path, monkeypatch):
    paginas = _rapport()
    paginas[4] = _dun("05 Methodiek")
    pad = _pdf(tmp_path / "01_vlak_middelmatig.pdf", paginas)
    _met_uitzondering(monkeypatch, pad, marge=0.01)
    bevindingen, toegepast = cpr.check_met_uitzonderingen(pad)
    assert [u.pagina for u in toegepast] == [4]
    meldingen = _vulmeldingen(bevindingen)
    assert len(meldingen) == 1 and meldingen[0].startswith("pagina 5 is ")


def test_een_andere_regel_blijft_meten(tmp_path, monkeypatch):
    """De uitzondering geldt alleen voor de vulling; een woord buiten de
    zijmarge op dezelfde pagina blijft een bevinding."""
    pad = _pdf(tmp_path / "01_vlak_middelmatig.pdf", _rapport(), buiten_marge_op=3)
    _met_uitzondering(monkeypatch, pad, marge=0.01)
    bevindingen, toegepast = cpr.check_met_uitzonderingen(pad)
    assert [u.pagina for u in toegepast] == [4]
    assert [b.regel for b in bevindingen] == [cpr.REGEL_ZIJMARGE]
    assert bevindingen[0].melding.startswith("pagina 4 heeft 1 woord(en) buiten de zijmarge")


def test_naam_is_te_overschrijven(tmp_path, monkeypatch):
    pad = _pdf(tmp_path / "anders.pdf", _rapport())
    _met_uitzondering(monkeypatch, pad, marge=0.01)
    assert len(_vulmeldingen(cpr.check_met_uitzonderingen(pad)[0])) == 1
    bevindingen, toegepast = cpr.check_met_uitzonderingen(pad, naam="01_vlak_middelmatig")
    assert bevindingen == [] and len(toegepast) == 1


def test_cli_noemt_de_uitzondering(tmp_path, monkeypatch):
    """Zonder monkeypatch: de echte lijst, met een pagina die boven de echte
    ondergrens van 01 ligt en onder MIN_FILL."""
    pad = _pdf(tmp_path / "01_vlak_middelmatig.pdf",
               [_vol("cover"), P02, _vol("02 Cijfers"), _regels(WERKVRAGEN_KOP, 340) + [(348.0, "slotregel")],
                _vol("05 Methodiek"), _dun("slot")])
    assert 0.386 <= _vulling(pad, 4) < cpr.MIN_FILL
    uit = subprocess.run([sys.executable, str(ROOT / "scripts" / "check_pdf_report.py"), pad],
                         capture_output=True, text=True, cwd=str(ROOT))
    assert uit.returncode == 0, uit.stdout + uit.stderr
    assert "uitzondering: werkvragenpagina p.4" in uit.stdout


# ── de vastgelegde lijst ─────────────────────────────────────────────────────

# De eerste tekstregel van elke uitgezonderde pagina zoals de render van 13-10
# hem in de tekstlaag zet (first_text), met de gemeten vulling.
GEMETEN = [
    ("01_vlak_middelmatig", "VERDIEPING: WERKDRUK EN HERSTELRUIMTE", 0.3558, "verdiepingspagina"),
    ("01_vlak_middelmatig", WERKVRAGEN_KOP, 0.3863, "werkvragenpagina"),
    ("09_gemengde_afdelingen", "VERDIEPING: CULTUUR EN PSYCHOLOGISCHE VEILIGHEID", 0.2575,
     "verdiepingspagina"),
    ("09_gemengde_afdelingen", WERKVRAGEN_KOP, 0.3863, "werkvragenpagina"),
    ("14_veel_anders", WERKVRAGEN_KOP, 0.3211, "werkvragenpagina"),
    ("19_vlak_niets_nodig", "VERDIEPING: BELONING EN EERLIJKHEID", 0.3558, "verdiepingspagina"),
]


def test_lijst_is_precies_het_besluit_van_12_10():
    assert len(cpr.VULLING_UITZONDERINGEN) == len(GEMETEN)
    for naam, kop, vulling, soort in GEMETEN:
        u = cpr._uitzondering_voor(naam, kop)
        assert u is not None, (naam, kop)
        assert u.naam == soort
        # De ondergrens is de huidige meting (naar beneden op een promille),
        # niet ruimer.
        assert u.ondergrens <= vulling < u.ondergrens + 0.001, (naam, u.ondergrens, vulling)
        # En hij staat op een hele promille, zodat de melding (die op een
        # promille afrondt) nooit een getal toont dat boven de grens lijkt.
        assert abs(u.ondergrens * 1000 - round(u.ondergrens * 1000)) < 1e-9, (naam, u.ondergrens)


def test_lijst_dekt_geen_andere_bestanden():
    for naam in ("02_een_lage_factor", "14_veel_anders", "19_vlak_niets_nodig",
                 "voorbeeldrapport_retentiescan", "zz_besluitmax_max_06_een_afdeling_laag"):
        for _, kop, _, _ in GEMETEN:
            u = cpr._uitzondering_voor(naam, kop)
            gedekt = any(n == naam and k == kop for n, k, _, _ in GEMETEN)
            assert (u is not None) == gedekt, (naam, kop)

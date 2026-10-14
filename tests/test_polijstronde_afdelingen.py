"""Polijstronde taak 7: afdelingen (koude leesronde 8-10, R14 en S9).

R14: de intro zei dat kleine afdelingen geen cijfer achter de komma krijgen,
terwijl de kolom Score dat wel toonde (de zin ging over de kolom ernaast), en
de kolom zei niet welke score het was.
S9: het navy blok noemde de cijfers van afdelingen met 5 tot 9 antwoorden in
de conclusie zelf ("Sales 6.0/10 en Operations 6.2/10"), tegen de intro in.
"""
import re

import pytest

from backend.report_distribution import MIN_DISTRIBUTION_N
from backend.report_html import (
    SEGMENT_SCOREKOLOM,
    _pref,
    _department_segment_rows,
    _segment_block,
)


def _rows(*specs):
    out = []
    for dept, n, score in specs:
        out.extend({"department": dept, "signal_score": score} for _ in range(n))
    return out


def _anchor(html):
    m = re.search(r'<div class="navy-anchor">(.*?)</p>', html, re.S)
    assert m, "geen navy blok"
    return re.sub(r"<[^>]+>", "", m.group(1))


def _block(*specs, scan_type="onboarding"):
    return _segment_block(_department_segment_rows(_rows(*specs)), scan_type=scan_type)


# ── S9: geen cijfers van kleine afdelingen in de conclusie ──────────────────

def test_s9_dicht_bij_elkaar_zonder_cijfers_bij_kleine_afdelingen():
    # Het Start-voorbeeld letterlijk: Sales 7 antwoorden, Operations 5.
    a = _anchor(_block(("Sales", 7, 6.0), ("Operations", 5, 6.2)))
    assert "De twee laagste afdelingen liggen dicht bij elkaar (Sales en Operations)." in a
    assert "/10" not in a


def test_s9_dicht_bij_elkaar_houdt_cijfers_bij_grote_afdelingen():
    a = _anchor(_block(("Sales", 12, 6.0), ("Operations", 11, 6.2)))
    assert ("De twee laagste afdelingen liggen dicht bij elkaar "
            "(Sales 6.0/10 en Operations 6.2/10).") in a


def test_s9_een_kleine_van_de_twee_is_genoeg_om_beide_cijfers_weg_te_laten():
    a = _anchor(_block(("Sales", 12, 6.0), ("Operations", MIN_DISTRIBUTION_N - 1, 6.2)))
    assert "liggen dicht bij elkaar (Sales en Operations)." in a
    assert "/10" not in a


def test_s9_dezelfde_score_zonder_cijfer_bij_kleine_afdelingen():
    # Gelijke score: meeste antwoorden eerst, de tie-break van de tabel.
    a = _anchor(_block(("Sales", 7, 6.0), ("Finance", 6, 6.0)))
    assert "De twee laagste afdelingen komen op dezelfde score uit (Sales en Finance)." in a
    assert "/10" not in a


def test_s9_precies_op_de_grens_blijven_de_cijfers_staan():
    n = MIN_DISTRIBUTION_N
    a = _anchor(_block(("Sales", n, 6.0), ("Operations", n, 6.2)))
    assert "(Sales 6.0/10 en Operations 6.2/10)." in a
    a = _anchor(_block(("Sales", n, 6.0), ("Finance", n, 6.0)))
    assert "(Sales en Finance, beide 6.0/10)." in a or "(Finance en Sales, beide 6.0/10)." in a


def test_s9_net_onder_de_grens_aan_een_kant_geen_cijfers():
    n = MIN_DISTRIBUTION_N
    a = _anchor(_block(("Sales", n, 6.0), ("Operations", n - 1, 6.2)))
    assert "(Sales en Operations)." in a and "/10" not in a
    a = _anchor(_block(("Sales", n - 1, 6.0), ("Operations", n, 6.2)))
    assert "(Sales en Operations)." in a and "/10" not in a


def test_s9_dezelfde_score_groot_en_klein_zonder_cijfer():
    a = _anchor(_block(("Sales", 12, 6.0), ("Finance", 6, 6.0)))
    assert "De twee laagste afdelingen komen op dezelfde score uit (Sales en Finance)." in a
    assert "/10" not in a


def test_s9_dezelfde_score_houdt_cijfer_bij_grote_afdelingen():
    a = _anchor(_block(("Sales", 12, 6.0), ("Finance", 12, 6.0)))
    assert "komen op dezelfde score uit (Finance en Sales, beide 6.0/10)." in a


def test_s9_staat_2_noemt_geen_cijfer_van_de_kleine_laagste_afdeling():
    # Staat 2 heeft per definitie een laagste afdeling onder de 10.
    a = _anchor(_block(("Operations", 8, 4.5), ("Sales", 20, 7.0)))
    assert ("Operations scoort het laagst van de afdelingen die apart getoond "
            "worden, maar telt 8 antwoorden.") in a
    assert "/10" not in a


def test_s9_kleine_restgroep_zonder_cijfer():
    a = _anchor(_block(("Sales", 13, 5.0), ("Finance", 12, 7.0),
                       ("Marketing", 3, 4.0), ("Customer Success", 3, 4.0)))
    assert "vastgelegd) scoort lager, maar is samengesteld uit kleine afdelingen" in a
    assert "4.0/10" not in a
    # De aangewezen afdeling heeft er 13: haar cijfer blijft staan.
    assert "(5.0/10; 13 antwoorden)" in a


def test_s9_grote_restgroep_houdt_cijfer():
    a = _anchor(_block(("Sales", 13, 5.0), ("Finance", 12, 7.0),
                       ("Marketing", 4, 4.0), ("Customer Success", 4, 4.0),
                       ("Legal", 3, 4.0)))
    assert "vastgelegd) scoort lager (4.0/10), maar is samengesteld" in a


# ── R14: intro en kolomkop zeggen welke score het is ────────────────────────

def _kop(html):
    m = re.search(r"<thead>(.*?)</thead>", html, re.S)
    assert m
    return re.sub(r"<[^>]+>", "|", m.group(1)).replace("&shy;", "")


_GROOT = (("Operations", 12, 5.0), ("Sales", 12, 7.0))
_P02 = "pagina " + _pref("p02")


@pytest.mark.parametrize("scan_type, kop, zin", [
    ("retention", "Werkbeeld",
     "De kolom Werkbeeld is het werkbeeld van " + _P02 + ", per afdeling."),
    ("onboarding", "Checkpointscore",
     "De kolom Checkpointscore is de checkpointscore van " + _P02 + ", per afdeling."),
    # A8 (beslisronde 12-10): de frictiescore zelf, hoger is slechter.
    ("exit", "Frictiescore",
     "De kolom Frictiescore is de frictiescore van " + _P02
     + ", per afdeling: hoger is slechter. De kolom Band gebruikt de grenzen van de "
     "frictiescore: laag onder 4,5, sterk vanaf 7,0."),
])
def test_r14_kolomkop_en_intro_per_scan(scan_type, kop, zin):
    html = _block(*_GROOT, scan_type=scan_type)
    assert f"|{kop}|" in _kop(html)
    intro = re.search(r'<p class="sec-intro">(.*?)</p>', html, re.S).group(1)
    assert intro.endswith(zin)
    # De staffelzin gaat expliciet over de kolom met het laagste onderwerp.
    # A4 (beslisronde 12-10): de staffelzin geldt nu voor die kolom en de scorekolom.
    assert ("De kolom met het laagste onderwerp noemt per afdeling het laagst scorende "
            "onderwerp. Bij kleine afdelingen (5 tot 9 antwoorden) staat in die kolom en in "
            "de scorekolom alleen een label") in intro
    assert "tonen we" not in intro
    # De uitsplitsing met alle onderwerpen staat onder de tabel, onder de naam
    # waarmee _segment_factor_subblocks haar opent.
    assert ("Vanaf 10 antwoorden staan alle onderwerpen met hun scores onder de tabel, "
            "bij &lsquo;Alle onderwerpen per afdeling&rsquo;.") in intro
    assert "onder de tabel" in intro
    # Dezelfde naam opent de echte uitsplitsing (n >= 10 met onderwerpdata).
    met_uitsplitsing = _segment_block(
        _department_segment_rows(_rows(*_GROOT)),
        factor_rows={d: {"factors": [("growth", 5.0, 12)], "omitted": 0}
                     for d in ("Operations", "Sales")},
        scan_type=scan_type)
    assert '<p class="seg-sub-intro">Alle onderwerpen per afdeling:' in met_uitsplitsing
    # Eén zin per scan, niet die van een ander product erbij.
    for ander, info in SEGMENT_SCOREKOLOM.items():
        if ander != scan_type:
            assert info["zin"] not in intro


def test_r14_scorekolom_houdt_zijn_breedte_en_breekt_in_de_kop():
    # Een bredere scorekolom kostte Band en Laagste onderwerp een regel per rij
    # (gemeten in het productie-image: scenario 03 en 06 kregen een pagina van
    # 21%). De kop breekt daarom met zachte afbreekstreepjes; de breedtes
    # blijven die van voor R14.
    for scan_type, info in SEGMENT_SCOREKOLOM.items():
        html = _block(*_GROOT, scan_type=scan_type)
        assert f'<th style="width:8%">{info["kop"]}</th>' in html
        assert '<th style="width:27%">Laagste onderwerp</th>' in html
    assert SEGMENT_SCOREKOLOM["retention"]["kop"] == "Werk&shy;beeld"
    assert SEGMENT_SCOREKOLOM["onboarding"]["kop"] == "Check&shy;point&shy;score"

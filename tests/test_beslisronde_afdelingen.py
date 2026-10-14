"""Beslisronde na de polijstronde, taak 2 (besluiten Lars 12-10): A4 en A8.

A4: de scorekolom van de afdelingstabel toonde bij afdelingen met 5 tot 9
antwoorden nog een cijfer achter de komma, terwijl de conclusie (S9) en de
themakolom dat bij die omvang al bewust weglieten. Nu staat er "kleine
afdeling"; de kolom Band draagt het label. De restgroep volgt haar eigen n.

A8: Loep Vertrek toonde per afdeling de frictiescore "omgedraaid" (11 min de
frictiescore, hoger is beter), naast een pagina twee waar de frictiescore
hoger-is-slechter is. Nu staat overal waar Vertrek een afdelingscijfer toont
de frictiescore zelf, met kleur en band uit de frictiebanden. Welke afdeling
genoemd wordt verandert niet.
"""
import re

import pytest

from backend.report_css import RAG_HIGH, RAG_LOW, RAG_MID
from backend.report_distribution import MIN_DISTRIBUTION_N, _x, distribution_svg
from backend.report_html import (
    SECTION_INTROS,
    SEGMENT_SCOREKOLOM,
    _brugzin,
    _seg_woord,
    _department_segment_rows,
    _pref,
    _segment_block,
    _segment_startpunt,
)


def _rows(*specs):
    out = []
    for dept, n, score in specs:
        out.extend({"department": dept, "signal_score": score} for _ in range(n))
    return out


def _block(*specs, scan_type, factor_rows=None):
    return _segment_block(_department_segment_rows(_rows(*specs)),
                          factor_rows=factor_rows, scan_type=scan_type)


def _cellen(html, dept):
    """De cellen van de tabelrij van `dept`, elk als ruwe HTML vanaf de <td>-tag (met stijl)."""
    for grp in re.findall(r'<tbody class="seg-grp">(.*?)</tbody>', html, re.S):
        if dept in grp.split("</td>")[0]:
            return re.findall(r"(<td[^>]*>.*?)</td>", grp, re.S)
    raise AssertionError(f"geen rij voor {dept}")


def _tekst(fragment):
    """Zichtbare tekst: tags weg, een <br> telt als spatie, zachte afbreekstreepjes weg."""
    return re.sub(r"<[^>]+>", "", fragment.replace("<br>", " ")).replace("&shy;", "").strip()


def _anchor(html):
    m = re.search(r'<div class="navy-anchor">(.*?)</p>', html, re.S)
    assert m, "geen navy blok"
    return re.sub(r"<[^>]+>", "", m.group(1))


# ── A4: geen cijfer in de scorekolom bij kleine afdelingen ──────────────────

@pytest.mark.parametrize("scan_type", ["exit", "retention", "onboarding"])
def test_a4_kleine_afdeling_toont_label_in_plaats_van_cijfer(scan_type):
    html = _block(("Sales", 12, 6.0), ("Operations", 7, 6.2), scan_type=scan_type)
    score, band = _cellen(html, "Operations")[2:4]
    assert _tekst(score) == "kleine afdeling"
    assert "color:#94A3B8" in score  # klein en grijs, zoals de andere duidingsregels
    # Twee regels, afbreekbaar (langste stuk 6 tekens) en niet vet (de cel zelf
    # is .is, vet): anders verbreedt de smalle scorekolom (8%) ten koste van
    # Band en Laagste onderwerp (gemeten in het productie-image).
    assert "kleine<br>af&shy;de&shy;ling" in score
    assert "font-weight:400" in score
    assert "text-transform:uppercase" not in score
    # De kolom Band draagt het label nog.
    assert _tekst(band)


@pytest.mark.parametrize("scan_type", ["exit", "retention", "onboarding"])
def test_a4_een_rij_van_een_kleine_afdeling_bevat_nergens_een_cijfer_achter_de_komma(scan_type):
    html = _block(("Sales", 12, 6.0), ("Operations", 7, 6.2), scan_type=scan_type,
                  factor_rows={"Sales": {"factors": [("growth", 5.4, 12)], "omitted": 0},
                               "Operations": {"factors": [("growth", 5.6, 7)], "omitted": 0}})
    rij = "".join(_cellen(html, "Operations"))
    assert not re.search(r"\d[.,]\d", _tekst(rij))


@pytest.mark.parametrize("scan_type", ["exit", "retention", "onboarding"])
def test_a4_vanaf_de_grens_blijft_het_cijfer_staan(scan_type):
    html = _block(("Sales", MIN_DISTRIBUTION_N, 6.0), ("Operations", MIN_DISTRIBUTION_N - 1, 6.2),
                  scan_type=scan_type)
    assert re.fullmatch(r"\d\.\d", _tekst(_cellen(html, "Sales")[2]))
    assert _tekst(_cellen(html, "Operations")[2]) == "kleine afdeling"


def test_a4_restgroep_volgt_haar_eigen_aantal():
    # Restgroep van 3 + 3 = 6 antwoorden: kleine afdeling.
    klein = _block(("Sales", 13, 5.0), ("Finance", 12, 7.0),
                   ("Marketing", 3, 4.0), ("Customer Success", 3, 4.0), scan_type="retention")
    assert _tekst(_cellen(klein, "Overige afdelingen")[2]) == "kleine afdeling"
    # Restgroep van 4 + 4 + 3 = 11 antwoorden: het cijfer blijft.
    groot = _block(("Sales", 13, 5.0), ("Finance", 12, 7.0),
                   ("Marketing", 4, 4.0), ("Customer Success", 4, 4.0), ("Legal", 3, 4.0),
                   scan_type="retention")
    assert _tekst(_cellen(groot, "Overige afdelingen")[2]) == "4.0"


def test_a4_intro_noemt_de_scorekolom_en_de_onderwerpkolom():
    # Plantekst "score- en themakolom", maar "thema" staat op de verboden lijst
    # van de taalguard (klantcopy zegt "onderwerp"); daarom de kolomnamen.
    intro = SECTION_INTROS["segmentanalyse"]
    assert ("De kolom met het laagste onderwerp noemt per afdeling het laagst scorende "
            "onderwerp. Bij kleine afdelingen (5 tot 9 antwoorden) staat in die kolom en in "
            "de scorekolom alleen een label, geen cijfer achter de komma; de kolom Band "
            "zegt hoe de afdeling scoort.") in intro
    assert "thema" not in intro.lower()
    # De oude zin ging alleen over de onderwerpkolom.
    assert "staat daar alleen een label" not in intro


# ── A8: Loep Vertrek toont de frictiescore zelf ─────────────────────────────

_P02 = "pagina " + _pref("p02")


def test_a8_exit_kop_en_scanzin():
    assert SEGMENT_SCOREKOLOM["exit"]["kop"] == "Fric&shy;tie&shy;score"
    # Langste stuk hooguit 6 tekens, zodat de kop in de kolom van 8% past.
    assert max(len(d) for d in SEGMENT_SCOREKOLOM["exit"]["kop"].split("&shy;")) <= 6
    assert SEGMENT_SCOREKOLOM["exit"]["zin"] == (
        "De kolom Frictiescore is de frictiescore van " + _P02 + ", per afdeling: hoger is slechter. "
        # Fixronde 14-10 (punt 3).
        "De kolom Band gebruikt de grenzen van de frictiescore: laag onder 4,5, sterk vanaf 7,0.")
    html = _block(("Operations", 12, 5.0), ("Sales", 12, 7.0), scan_type="exit")
    kop = re.sub(r"<[^>]+>", "|", re.search(r"<thead>(.*?)</thead>", html, re.S).group(1))
    assert "|Frictiescore|" in kop.replace("&shy;", "")
    # De kolom houdt haar breedte.
    assert f'<th style="width:8%">{SEGMENT_SCOREKOLOM["exit"]["kop"]}</th>' in html


@pytest.mark.parametrize("gezond, frictie, label, kleur", [
    (8.0, "3.0", "Laag frictiebeeld", RAG_LOW),
    (6.0, "5.0", "Gemengd frictiebeeld", RAG_MID),
    # 6,5 is op de werkonderwerp-ladder (gespiegeld) al rood; in de
    # frictiebanden (vanaf 7,0 sterk) nog gemengd. De frictiebanden tellen.
    (4.5, "6.5", "Gemengd frictiebeeld", RAG_MID),
    (3.0, "8.0", "Sterk frictiebeeld", RAG_HIGH),
])
def test_a8_exit_cel_en_band_op_de_frictieschaal(gezond, frictie, label, kleur):
    html = _block(("Operations", 12, gezond), ("Sales", 12, 9.5), scan_type="exit")
    score, band = _cellen(html, "Operations")[2:4]
    assert _tekst(score) == frictie
    assert f"color:{kleur}" in score
    assert _tekst(band) == label
    assert f"color:{kleur}" in band


def test_a8_retention_en_onboarding_veranderen_niet():
    for scan_type in ("retention", "onboarding"):
        html = _block(("Operations", 12, 6.0), ("Sales", 12, 9.5), scan_type=scan_type)
        score, band = _cellen(html, "Operations")[2:4]
        assert _tekst(score) == "6.0"
        assert _tekst(band) == "Aandachtspunt"


def test_a8_exit_volgorde_blijft_de_afdeling_met_de_hoogste_frictie_bovenaan():
    html = _block(("Sales", 12, 7.0), ("Operations", 12, 4.5), scan_type="exit")
    eerste = re.search(r'<tbody class="seg-grp">(.*?)</tbody>', html, re.S).group(1)
    assert "Operations" in eerste


def test_a8_exit_strook_toont_het_gemiddelde_op_de_frictieschaal():
    exit_html = _block(("Operations", 12, 6.0), ("Sales", 12, 9.5), scan_type="exit")
    ops = _cellen(exit_html, "Operations")[5]
    assert "GEM 5.0" in ops and "GEM 6.0" not in ops
    ret = _cellen(_block(("Operations", 12, 6.0), ("Sales", 12, 9.5), scan_type="retention"),
                  "Operations")[5]
    assert "GEM 6.0" in ret


@pytest.mark.parametrize("helft", [3.1, 3.3, 7.1, 7.3])
def test_a8_exit_strook_gem_gelijk_aan_de_cel_ook_op_een_afrondingsgrens(helft):
    # Gemiddelde precies op x,x5 op de gezondheidsschaal: de cel rekent vanaf de
    # getoonde score terug (11 min 3,1 = 7,9), het gemiddelde van de omgerekende
    # stippen is 7,85 en zou als 7,8 in de strook staan. Eén getal per rij.
    rijen = ([{"department": "Operations", "signal_score": helft}] * 6
             + [{"department": "Operations", "signal_score": round(helft + 0.1, 1)}] * 6
             + [{"department": "Sales", "signal_score": 9.5}] * 12)
    html = _segment_block(_department_segment_rows(rijen), scan_type="exit")
    cellen = _cellen(html, "Operations")
    assert "GEM " + _tekst(cellen[2]) + "<" in cellen[5]


def test_a8_exit_strook_kleurt_stippen_met_de_frictiebanden():
    # Frictie 6,5 is gemengd in de frictiebanden, 7,5 sterk, 4,0 laag.
    html = _block(("Operations", 12, 4.5), ("Sales", 12, 9.5), scan_type="exit")
    assert f'fill="{RAG_MID}" fill-opacity' in _cellen(html, "Operations")[5]
    html = _block(("Operations", 12, 3.5), ("Sales", 12, 9.5), scan_type="exit")
    assert f'fill="{RAG_HIGH}" fill-opacity' in _cellen(html, "Operations")[5]
    html = _block(("Operations", 12, 7.0), ("Sales", 12, 9.5), scan_type="exit")
    assert f'fill="{RAG_LOW}" fill-opacity' in _cellen(html, "Operations")[5]


def test_a8_exit_grens_gezond_4_is_frictiescore_7_sterk_rood_in_cel_en_strook():
    # Gezondheid 4,0 is frictiescore 7,0 = RISK_HIGH: de grens hoort bij "sterk".
    html = _block(("Operations", 12, 4.0), ("Sales", 12, 9.5), scan_type="exit")
    cellen = _cellen(html, "Operations")
    score, band, strook = cellen[2], cellen[3], cellen[5]
    assert _tekst(score) == "7.0"
    assert f"color:{RAG_HIGH}" in score
    assert _tekst(band) == "Sterk frictiebeeld"
    assert f'fill="{RAG_HIGH}" fill-opacity' in strook
    assert f'fill="{RAG_MID}" fill-opacity' not in strook


def test_distribution_svg_zonevakken_volgen_zone_bounds():
    vals = [5.0] * 12
    std = distribution_svg(vals)
    eigen = distribution_svg(vals, zone_bounds=(4.5, 7.0))
    for grens in (4.5, 7.0):
        assert f'<rect x="{_x(grens, 440)}" y="6"' in eigen
        assert f'<rect x="{_x(grens, 440)}" y="6"' not in std
    for grens in (5.0, 6.5):
        assert f'<rect x="{_x(grens, 440)}" y="6"' in std


def test_distribution_svg_zone_bounds_en_gem_alleen_als_trefwoord():
    vals = [5.0] * 12
    with pytest.raises(TypeError):
        distribution_svg(vals, 440, 34, 3.5, 7, False, (4.5, 7.0))
    with pytest.raises(TypeError):
        distribution_svg(vals, 440, 34, 3.5, 7, False, None, 5.0)


def test_seg_woord_kent_alleen_de_drie_producten():
    assert _seg_woord("retention", "laagst") == "scoort het laagst"
    assert _seg_woord("onboarding", "laagst") == "scoort het laagst"
    assert _seg_woord("exit", "laagst") == "heeft de hoogste frictiescore"
    with pytest.raises(KeyError):
        _seg_woord("culture_assessment", "laagst")


def test_distribution_svg_zonegrenzen_standaard_ongewijzigd():
    vals = [4.9, 5.0, 6.4, 6.5] * 3
    assert distribution_svg(vals) == distribution_svg(vals, zone_bounds=None, gem=None)


def test_distribution_svg_gem_vervangt_alleen_het_getal():
    vals = [4.9, 5.0, 6.4, 6.5] * 3
    standaard = distribution_svg(vals)
    assert "GEM 5.7<" in standaard
    assert distribution_svg(vals, gem=5.8) == standaard.replace("GEM 5.7<", "GEM 5.8<")


# Navy conclusie: dezelfde afdeling, de frictiescore erbij, neutraal verwoord.

_LAAGST_WOORDEN = ("scoort het laagst", "laagste score", "scoort lager",
                   "De twee laagste afdelingen")


def _geen_laagst_taal(tekst):
    for w in _LAAGST_WOORDEN:
        assert w not in tekst, w


def test_a8_exit_staat_3_noemt_dezelfde_afdeling_met_haar_frictiescore():
    a = _anchor(_block(("Operations", 12, 4.5), ("Sales", 12, 7.0), scan_type="exit"))
    assert ("Operations heeft de hoogste frictiescore van de afdelingen die apart getoond "
            "worden (6.5/10; 12 antwoorden).") in a
    _geen_laagst_taal(a)


def test_a8_exit_staat_1_dicht_bij_elkaar():
    a = _anchor(_block(("Sales", 12, 6.0), ("Operations", 11, 6.2), scan_type="exit"))
    assert ("De twee afdelingen met de hoogste frictiescore liggen dicht bij elkaar "
            "(Sales 5.0/10 en Operations 4.8/10).") in a
    _geen_laagst_taal(a)


def test_a8_exit_staat_1_dezelfde_score():
    a = _anchor(_block(("Sales", 12, 6.0), ("Finance", 12, 6.0), scan_type="exit"))
    assert ("De twee afdelingen met de hoogste frictiescore komen op dezelfde score uit "
            "(Finance en Sales, beide 5.0/10).") in a


def test_a8_exit_staat_2_zonder_cijfer():
    a = _anchor(_block(("Operations", 8, 4.5), ("Sales", 20, 7.0), scan_type="exit"))
    assert ("Operations heeft de hoogste frictiescore van de afdelingen die apart getoond "
            "worden, maar telt 8 antwoorden.") in a
    assert "/10" not in a
    _geen_laagst_taal(a)


def test_a8_exit_restgroep_met_hogere_frictiescore():
    a = _anchor(_block(("Sales", 13, 5.0), ("Finance", 12, 7.0),
                       ("Marketing", 4, 4.0), ("Customer Success", 4, 4.0), ("Legal", 3, 4.0),
                       scan_type="exit"))
    assert "vastgelegd) heeft een hogere frictiescore (7.0/10), maar is samengesteld" in a
    assert "Sales heeft de hoogste frictiescore" in a
    assert "(6.0/10; 13 antwoorden)" in a
    _geen_laagst_taal(a)


def test_a8_retention_navy_blok_ongewijzigd():
    a = _anchor(_block(("Operations", 12, 4.5), ("Sales", 12, 7.0), scan_type="retention"))
    assert ("Operations heeft de laagste score van de afdelingen die apart getoond "
            "worden (4.5/10; 12 antwoorden).") in a


# Brugzin op pagina twee.

def _seg_rows_met_restgroep():
    return _department_segment_rows(_rows(
        ("Operations", 12, 5.0), ("Sales", 12, 7.0),
        ("Marketing", 4, 4.0), ("Customer Success", 4, 4.0), ("Legal", 3, 4.0)))


def test_a8_exit_brugzin_zonder_thema_op_de_frictieschaal():
    seg = _segment_startpunt(_seg_rows_met_restgroep(), None)
    assert seg["department"] == "Operations"
    zin = _brugzin("growth", "Groeiperspectief", seg, "exit")
    assert ("Operations heeft de hoogste frictiescore van de afdelingen die apart getoond "
            "worden (6.0/10); welk onderwerp daar het zwaarst weegt is niet te zeggen") in zin
    assert ("De restgroep heeft een hogere frictiescore, maar bestaat uit kleine afdelingen "
            "en telt daarom niet als startpunt.") in zin
    _geen_laagst_taal(zin)


def test_a8_retention_brugzin_ongewijzigd():
    seg = _segment_startpunt(_seg_rows_met_restgroep(), None)
    zin = _brugzin("growth", "Groeiperspectief", seg, "retention")
    assert "Operations scoort het laagst van de afdelingen die apart getoond worden (5.0/10)" in zin
    assert "De restgroep scoort lager" in zin

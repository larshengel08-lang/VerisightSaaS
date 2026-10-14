"""Fixronde 14-10, punt 1 (besluit Lars 14-10): geen telling bij 0 of alle.

Heeft in een afdeling niemand of juist iedereen veel vertrekgedachten ("0 van
de 14" of "14 van de 14"), dan weet het MT van elk lid van die afdeling hoe
het zit. Het blok "Blijf- en vertrekintentie per afdeling" toont dan geen
telling, alleen het gemiddelde met label en een korte neutrale regel.

Pagina twee toont het totaal voor de hele meting. Trek je daar de getoonde
tellingen van af, dan houd je de som over van wat niet getoond is (de afdeling
zonder telling plus iedereen buiten het blok). Is die som zelf 0 of alles, dan
verraadt pagina twee via die aftreksom alsnog de afdeling. Dan valt ook de
telling van de kleinste andere afdeling weg.
"""
import html as htmllib
import random
import re

import pytest

from backend.report_distribution import score_distribution
from backend.report_html import (
    INTENTIE_TELLING_NIET_GETOOND,
    _department_intent_rows,
    _department_segment_rows,
    _intentie_afdelingen_block,
)


def _plain(fragment: str) -> str:
    t = htmllib.unescape(re.sub(r"\s+", " ", re.sub(r"<[^>]+>", " ", fragment)))
    return t.replace("­", "").replace(" ", " ").strip()


def _resp(dept, n, to=4.0, stay=6.0):
    return [{"department": dept, "signal_score": 6.0, "stay": stay, "turnover": to}
            for _ in range(n)]


def _seg(*specs):
    rows = []
    for dept, n in specs:
        rows.extend({"department": dept, "signal_score": 6.0} for _ in range(n))
    return _department_segment_rows(rows)


def _info(resp, *specs):
    to = [r["turnover"] for r in resp if r["turnover"] is not None]
    return _department_intent_rows(
        resp, _seg(*specs),
        total_stay_n=sum(1 for r in resp if r["stay"] is not None),
        total_to_n=len(to), total_to_high=score_distribution(to)["zones"][2])


def _tonen(info):
    return {r["department"]: r["to_high_tonen"] for r in info["rows"]}


def _aftreksom(info, total_to_n, total_to_high):
    """Wat een lezer van pagina twee kan afleiden over alles wat niet getoond is."""
    getoond = [r for r in info["rows"] if r["to_high_tonen"]]
    return (total_to_high - sum(r["to_high"] for r in getoond),
            total_to_n - sum(r["to_n"] for r in getoond))


# -- Data ----------------------------------------------------------------------

def test_totaal_veel_vertrekgedachten_is_verplicht():
    with pytest.raises(TypeError):
        _department_intent_rows(_resp("Ops", 12), _seg(("Ops", 12)),
                                total_stay_n=12, total_to_n=12)


def test_gewone_telling_blijft_staan():
    resp = (_resp("Ops", 4, to=7.0) + _resp("Ops", 10)
            + _resp("Fin", 3, to=7.0) + _resp("Fin", 8))
    info = _info(resp, ("Ops", 14), ("Fin", 11))
    assert _tonen(info) == {"Ops": True, "Fin": True}


@pytest.mark.parametrize("to", [4.0, 7.0])
def test_niemand_of_iedereen_geen_telling(to):
    # Ops: 0 of alle 14. De rest (Fin 6 + 10 zonder afdeling) is gemengd, dus de
    # aftreksom over Ops plus de rest is niet 0 of alles.
    resp = (_resp("Ops", 14, to=to) + _resp("Fin", 3, to=7.0) + _resp("Fin", 3)
            + _resp(None, 5, to=7.0) + _resp(None, 5))
    info = _info(resp, ("Ops", 14), ("Fin", 6))
    assert _tonen(info) == {"Ops": False}


def test_aftreksom_van_nul_laat_nog_een_telling_vallen():
    # Ops 0 van 14, Fin 3 van 12, iedereen in een getoonde afdeling (rest 0).
    # Met alleen Ops verborgen is de aftreksom 0 van 14: Ops alsnog verraden.
    resp = _resp("Ops", 14) + _resp("Fin", 3, to=7.0) + _resp("Fin", 9)
    info = _info(resp, ("Ops", 14), ("Fin", 12))
    assert _tonen(info) == {"Ops": False, "Fin": False}


def test_aftreksom_van_alles_laat_de_kleinste_andere_vallen():
    # Ops alle 14, Fin 3 van 12, HR 5 van 11; rest 0. Ops verborgen: aftreksom
    # 14 van 14. De kleinste andere afdeling (HR, 11) valt ook weg.
    resp = (_resp("Ops", 14, to=7.0) + _resp("Fin", 3, to=7.0) + _resp("Fin", 9)
            + _resp("HR", 5, to=7.0) + _resp("HR", 6))
    info = _info(resp, ("Ops", 14), ("Fin", 12), ("HR", 11))
    assert _tonen(info) == {"Ops": False, "Fin": True, "HR": False}


def test_rest_die_zelf_nul_is_wordt_ook_beschermd():
    # Geen afdeling 0 of alle, maar de rest buiten het blok (Fin 6 + 4 zonder
    # afdeling) heeft niemand met veel vertrekgedachten. Pagina twee min Ops
    # zou dat over die tien mensen verraden: dan ook geen telling bij Ops.
    resp = _resp("Ops", 4, to=7.0) + _resp("Ops", 10) + _resp("Fin", 6) + _resp(None, 4)
    info = _info(resp, ("Ops", 14), ("Fin", 6))
    assert _tonen(info) == {"Ops": False}


def test_heel_de_meting_nul_verbergt_elke_telling():
    resp = _resp("Ops", 14) + _resp("Fin", 12)
    info = _info(resp, ("Ops", 14), ("Fin", 12))
    assert _tonen(info) == {"Ops": False, "Fin": False}


@pytest.mark.parametrize("seed", range(60))
def test_aftreksom_nooit_nul_of_alles_als_er_iets_verborgen_is(seed):
    rnd = random.Random(seed)
    resp, specs = [], []
    for dept in ("A", "B", "C", "D"):
        n = rnd.choice([10, 11, 12, 15, 20])
        hoog = rnd.choice([0, n, rnd.randint(0, n)])
        resp += _resp(dept, hoog, to=7.0) + _resp(dept, n - hoog)
        specs.append((dept, n))
    rest = rnd.choice([0, 10, 12])
    rest_hoog = rnd.choice([0, rest, rnd.randint(0, rest)])
    resp += _resp(None, rest_hoog, to=7.0) + _resp(None, rest - rest_hoog)
    info = _info(resp, *specs)
    to = [r["turnover"] for r in resp]
    totaal_hoog = score_distribution(to)["zones"][2]
    for r in info["rows"]:
        if r["to_high_tonen"]:
            assert 0 < r["to_high"] < r["to_n"]
    if any(not r["to_high_tonen"] for r in info["rows"]):
        hoog, n = _aftreksom(info, len(to), totaal_hoog)
        geen_getoond = all(not r["to_high_tonen"] for r in info["rows"])
        # Alleen als niets meer getoond wordt mag de som 0 of alles zijn: dat is
        # dan het totaal van pagina twee zelf.
        assert geen_getoond or 0 < hoog < n


# -- Blok ----------------------------------------------------------------------

def _rij(dept="Operations", n=14, stay_avg=6.5, to_high=0, tonen=False):
    return {"department": dept, "n": n, "stay_avg": stay_avg, "stay_n": n,
            "to_n": n, "to_high": to_high, "to_high_tonen": tonen}


def test_blok_zonder_telling_toont_gemiddelde_label_en_neutrale_regel():
    html = _intentie_afdelingen_block({"rows": [_rij()], "dropped": [], "reason": ""})
    t = _plain(html)
    assert "0 van de 14" not in t
    assert not re.search(r"\d+ van de \d+", t)
    assert "6.5/10" in t
    assert "Relatief sterk" in t
    assert "niet getoond" in t
    assert INTENTIE_TELLING_NIET_GETOOND.format(namen="Operations") in t
    assert "—" not in t and "–" not in t


def test_blok_neutrale_regel_noemt_niet_waarom():
    # De regel mag niet zeggen dat het om niemand of iedereen gaat: dan weet
    # de lezer het alsnog.
    regel = INTENTIE_TELLING_NIET_GETOOND.format(namen="Operations").lower()
    for woord in ("niemand", "iedereen", "geen van", "allemaal", "alle "):
        assert woord not in regel


def test_blok_gemengd_toont_alleen_de_verborgen_namen():
    rows = [_rij("Operations", to_high=14, tonen=False),
            _rij("Finance", n=12, to_high=3, tonen=True, stay_avg=4.0)]
    t = _plain(_intentie_afdelingen_block({"rows": rows, "dropped": [], "reason": ""}))
    assert "3 van de 12" in t
    assert "14 van de 14" not in t
    assert INTENTIE_TELLING_NIET_GETOOND.format(namen="Operations") in t
    assert INTENTIE_TELLING_NIET_GETOOND.format(namen="Finance") not in t


def test_blok_met_alle_tellingen_geen_neutrale_regel():
    t = _plain(_intentie_afdelingen_block(
        {"rows": [_rij(to_high=5, tonen=True)], "dropped": [], "reason": ""}))
    assert "5 van de 14" in t
    assert "niet getoond" not in t


def test_blok_zonder_veld_tonen_faalt_luid():
    rij = _rij()
    del rij["to_high_tonen"]
    with pytest.raises(KeyError):
        _intentie_afdelingen_block({"rows": [rij], "dropped": [], "reason": ""})


# -- Gerenderd: stresstest 04 (niemand) en 05 (iedereen) ------------------------

def _scenario(key):
    from scripts import stresstest_report as st
    from tests.test_report_degraded_page_two import _body
    sc = {s.key: s for s in st.SCENARIOS}[key]
    return _body(open(st.run_scenario(sc)["html"], encoding="utf-8").read())


def _blok_en_p02(body):
    i = body.index('id="sec-intenties"')
    blok = body[i:body.index("</div>", body.index("</table>", i))]
    j = body.index('class="p02-duiding"')
    return blok, body[j:body.index("</p>", j)]


@pytest.mark.usefixtures("stresstest_naar_tmp")
@pytest.mark.parametrize("key", ["04_alles_hoog", "05_alles_laag"])
def test_scenario_niemand_of_iedereen(key):
    blok, p02 = _blok_en_p02(_scenario(key))
    tabel = _plain(blok[blok.index("<table"):blok.index("</table>")])
    assert not re.search(r"\d+ van de \d+", tabel)
    assert "niet getoond" in tabel
    assert INTENTIE_TELLING_NIET_GETOOND.format(namen="Operations") in _plain(blok)
    # Pagina twee noemt geen afdeling en geen telling per afdeling: alleen het
    # totaal en de verwijzing naar het blok.
    tekst = _plain(p02)
    assert "Operations" not in tekst
    # Precies één totaal: "x van de n" of "Geen van de n".
    assert len(re.findall(r"(?:\d+|Geen) van de \d+", tekst)) == 1


@pytest.mark.usefixtures("stresstest_naar_tmp")
def test_scenario_05_aftreksom_met_pagina_twee_verraadt_operations_niet():
    blok, p02 = _blok_en_p02(_scenario("05_alles_laag"))
    m = re.search(r"(\d+) van de (\d+) hebben veel vertrekgedachten", _plain(p02))
    assert m
    hoog, n = int(m.group(1)), int(m.group(2))
    # Operations (14) staat zonder telling en er is geen andere telling om af
    # te trekken: de aftreksom is het totaal zelf, en dat is niet 0 of alles.
    assert 0 < hoog < n

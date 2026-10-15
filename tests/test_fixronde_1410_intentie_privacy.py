"""Privacy van "veel vertrekgedachten" per afdeling (Loep Behoud).

Fixronde 15-10 (besluit Lars 15-10), vervangt de aanpak van 14-10. Daar stond
bij 0 of alle "niet getoond" met de zin "Bij Operations staat geen aantal:
daarmee zou je kunnen afleiden...". Die melding verraadde juist dat het 0 of
iedereen was.

Nieuw: het blok toont het aantal als exact getal, BEHALVE als het aantal
kleiner is dan 3 of als n min het aantal kleiner is dan 3. Dan staat er een
grens: "minder dan 3 van de 14" of "meer dan 11 van de 14". Eén uitleg in de
intro van het blok, voor alle afdelingen; geen melding per afdeling.

Pagina twee toont het totaal voor de hele meting. Trek je daar de exacte
tellingen van af, dan houd je de som over van wat niet exact getoond is (de
afdelingen met een grens plus iedereen buiten het blok). Die aftreksom mag
geen exact aantal van een afdeling met een grens opleveren, en mag zelf geen
heel klein aantal zijn (dan is ook daar iemand aan te wijzen). Anders valt de
kleinste afdeling met een exact getal uit het blok, en pagina twee en het blok
melden dat zoals bij de bestaande aftrekregel (A5).
"""
import html as htmllib
import random
import re

import pytest

from backend.report_distribution import score_distribution
from backend.report_html import (
    INTENTIE_AFDELING_ZIN,
    INTENTIE_GRENS_UITLEG,
    INTENTIE_TELLING_GRENS,
    _department_intent_rows,
    _department_segment_rows,
    _intent_staat,
    _intentie_afdelingen_block,
    _intentie_duiding,
    _telling_weergave,
)


def _plain(fragment: str) -> str:
    t = htmllib.unescape(re.sub(r"\s+", " ", re.sub(r"<[^>]+>", " ", fragment)))
    return t.replace("­", "").replace(" ", " ").strip()


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


def _weergave(info):
    return {r["department"]: _telling_weergave(r["to_high"], r["to_n"]) for r in info["rows"]}


# -- De weergaveregel ------------------------------------------------------------

def test_grens_is_drie():
    assert INTENTIE_TELLING_GRENS == 3


@pytest.mark.parametrize("hoog,verwacht", [
    (0, "minder dan 3 van de 14"), (1, "minder dan 3 van de 14"), (2, "minder dan 3 van de 14"),
    (3, "3 van de 14"), (7, "7 van de 14"), (11, "11 van de 14"),
    (12, "meer dan 11 van de 14"), (13, "meer dan 11 van de 14"), (14, "meer dan 11 van de 14"),
])
def test_weergave_per_aantal(hoog, verwacht):
    assert _telling_weergave(hoog, 14) == verwacht


def test_weergave_bij_tien():
    assert _telling_weergave(2, 10) == "minder dan 3 van de 10"
    assert _telling_weergave(3, 10) == "3 van de 10"
    assert _telling_weergave(7, 10) == "7 van de 10"
    assert _telling_weergave(8, 10) == "meer dan 7 van de 10"


def test_weergave_is_altijd_waar():
    for n in range(10, 40):
        for hoog in range(0, n + 1):
            tekst = _telling_weergave(hoog, n)
            if tekst.startswith("minder dan "):
                assert hoog < int(tekst.split()[2])
            elif tekst.startswith("meer dan "):
                assert hoog > int(tekst.split()[2])
            else:
                assert tekst == f"{hoog} van de {n}"


def test_weergave_te_kleine_n_faalt_luid():
    # Onder 6 kan een aantal tegelijk onder 3 en boven n-3 liggen; dat komt in
    # het blok nooit voor (minstens 10), dus een fout in plaats van een gok.
    with pytest.raises(ValueError):
        _telling_weergave(2, 5)


# -- Data: aftreksom met pagina twee ---------------------------------------------

def test_totaal_veel_vertrekgedachten_is_verplicht():
    with pytest.raises(TypeError):
        _department_intent_rows(_resp("Ops", 12), _seg(("Ops", 12)),
                                total_stay_n=12, total_to_n=12)


def test_gewone_telling_blijft_staan():
    resp = (_resp("Ops", 4, to=7.0) + _resp("Ops", 10)
            + _resp("Fin", 3, to=7.0) + _resp("Fin", 8))
    info = _info(resp, ("Ops", 14), ("Fin", 11))
    assert _weergave(info) == {"Ops": "4 van de 14", "Fin": "3 van de 11"}
    assert info["dropped"] == [] and info["dropped_aantal"] == []


@pytest.mark.parametrize("to,tekst", [(4.0, "minder dan 3 van de 14"),
                                      (7.0, "meer dan 11 van de 14")])
def test_niemand_of_iedereen_geeft_een_grens(to, tekst):
    # Ops: 0 of alle 14. Geen andere exacte telling: de aftreksom is het
    # totaal van pagina twee, een uitspraak over de hele meting.
    resp = (_resp("Ops", 14, to=to) + _resp("Fin", 3, to=7.0) + _resp("Fin", 3)
            + _resp(None, 5, to=7.0) + _resp(None, 5))
    info = _info(resp, ("Ops", 14), ("Fin", 6))
    assert _weergave(info) == {"Ops": tekst}
    assert info["dropped_aantal"] == []


def test_aftreksom_die_de_grens_ontmaskert_laat_een_exacte_telling_vallen():
    # Ops 0 van 14, Fin 3 van 12, iedereen in het blok (rest 0). Pagina twee
    # min Fin is 0 van 14: Ops alsnog exact. Fin valt uit het blok.
    resp = _resp("Ops", 14) + _resp("Fin", 3, to=7.0) + _resp("Fin", 9)
    info = _info(resp, ("Ops", 14), ("Fin", 12))
    assert _weergave(info) == {"Ops": "minder dan 3 van de 14"}
    assert info["dropped_aantal"] == [{"department": "Fin", "n": 12}]
    assert info["dropped"] == []


def test_aftreksom_die_een_grens_vastpint_laat_een_exacte_telling_vallen():
    # Ops 12 van 14 ("meer dan 11"), Sales 0 van 10 ("minder dan 3"), Fin 5
    # van 12, rest 0. Pagina twee min Fin: 12 van 24 voor Ops en Sales samen.
    # Sales is hoogstens 2 en Ops hoogstens 14, dus Ops is precies 12.
    resp = (_resp("Ops", 12, to=7.0) + _resp("Ops", 2) + _resp("Sales", 10)
            + _resp("Fin", 5, to=7.0) + _resp("Fin", 7))
    info = _info(resp, ("Ops", 14), ("Fin", 12), ("Sales", 10))
    assert info["dropped_aantal"] == [{"department": "Fin", "n": 12}]
    assert set(_weergave(info)) == {"Ops", "Sales"}


def test_rest_die_zelf_een_heel_klein_aantal_is_wordt_ook_beschermd():
    # Geen afdeling met een grens, maar de rest buiten het blok (Fin 6 + 4
    # zonder afdeling) heeft niemand met veel vertrekgedachten. Pagina twee
    # min Ops zou dat over die tien mensen verraden. Ops valt weg; er blijft
    # geen afdeling over, en pagina twee zegt waarom.
    resp = _resp("Ops", 4, to=7.0) + _resp("Ops", 10) + _resp("Fin", 6) + _resp(None, 4)
    info = _info(resp, ("Ops", 14), ("Fin", 6))
    assert info["rows"] == []
    assert info["reason"] == "herleidbaar_aantal"
    assert info["dropped_aantal"] == [{"department": "Ops", "n": 14}]


def test_heel_de_meting_nul_toont_grenzen():
    resp = _resp("Ops", 14) + _resp("Fin", 12)
    info = _info(resp, ("Ops", 14), ("Fin", 12))
    assert _weergave(info) == {"Ops": "minder dan 3 van de 14", "Fin": "minder dan 3 van de 12"}
    assert info["dropped_aantal"] == []


def _bereik(tekst: str, n: int) -> tuple[int, int]:
    if tekst.startswith("minder dan "):
        return 0, int(tekst.split()[2]) - 1
    if tekst.startswith("meer dan "):
        return int(tekst.split()[2]) + 1, n
    v = int(tekst.split()[0])
    return v, v


@pytest.mark.parametrize("seed", range(120))
def test_aftreksom_geeft_nooit_een_exact_aantal_van_een_afdeling_met_een_grens(seed):
    rnd = random.Random(seed)
    resp, specs = [], []
    for dept in ("A", "B", "C", "D"):
        n = rnd.choice([10, 11, 12, 15, 20])
        hoog = rnd.choice([0, 1, 2, n - 2, n - 1, n, rnd.randint(0, n)])
        resp += _resp(dept, hoog, to=7.0) + _resp(dept, n - hoog)
        specs.append((dept, n))
    rest = rnd.choice([0, 10, 12])
    rest_hoog = rnd.choice([0, 1, rest, rnd.randint(0, rest)])
    resp += _resp(None, rest_hoog, to=7.0) + _resp(None, rest - rest_hoog)
    info = _info(resp, *specs)
    to = [r["turnover"] for r in resp]
    totaal_hoog, totaal_n = score_distribution(to)["zones"][2], len(to)

    # Wat de lezer ziet: per rij een bereik; de rest (alles buiten de rijen)
    # is onbekend tussen 0 en zijn omvang.
    zichtbaar = {r["department"]: _bereik(_telling_weergave(r["to_high"], r["to_n"]), r["to_n"])
                 for r in info["rows"]}
    for r in info["rows"]:
        lo, hi = zichtbaar[r["department"]]
        assert lo <= r["to_high"] <= hi
    exact = [r for r in info["rows"] if zichtbaar[r["department"]][0] == zichtbaar[r["department"]][1]]
    grens = [r for r in info["rows"] if r not in exact]
    if not exact:
        return  # de aftreksom is het totaal van pagina twee zelf
    hoog_g = totaal_hoog - sum(r["to_high"] for r in exact)
    n_g = totaal_n - sum(r["to_n"] for r in exact)
    assert INTENTIE_TELLING_GRENS <= hoog_g <= n_g - INTENTIE_TELLING_GRENS
    rest_n = n_g - sum(r["to_n"] for r in grens)
    delen = [zichtbaar[r["department"]] for r in grens] + ([(0, rest_n)] if rest_n else [])
    for i, r in enumerate(grens):
        lo, hi = delen[i]
        anderen = delen[:i] + delen[i + 1:]
        onder = max(lo, hoog_g - sum(h for _l, h in anderen))
        boven = min(hi, hoog_g - sum(l for l, _h in anderen))
        assert onder < boven, f"{r['department']} vastgepind op {onder}"


# -- Blok ------------------------------------------------------------------------

def _rij(dept="Operations", n=14, stay_avg=6.5, to_high=0):
    return {"department": dept, "n": n, "stay_avg": stay_avg, "stay_n": n,
            "to_n": n, "to_high": to_high}


def _blok(rows, dropped=None, dropped_aantal=None):
    return _intentie_afdelingen_block({"rows": rows, "dropped": dropped or [],
                                       "dropped_aantal": dropped_aantal or [], "reason": ""})


def test_blok_toont_een_grens_zonder_melding_per_afdeling():
    t = _plain(_blok([_rij()]))
    assert "minder dan 3 van de 14" in t
    assert "0 van de 14" not in t.replace("minder dan 3 van de 14", "")
    assert "6.5/10" in t and "Relatief sterk" in t
    assert "niet getoond" not in t
    assert "Operations staat" not in t and "Bij Operations" not in t
    assert "—" not in t and "–" not in t


def test_blok_meer_dan():
    t = _plain(_blok([_rij(to_high=14)]))
    assert "meer dan 11 van de 14" in t
    assert "14 van de 14" not in t


def test_uitleg_staat_altijd_in_de_intro_en_noemt_geen_afdeling():
    for rows in ([_rij(to_high=5)], [_rij()], [_rij(to_high=14)]):
        html = _blok(rows)
        intro = html[:html.index("<table")]
        assert INTENTIE_GRENS_UITLEG in _plain(intro)
        assert "Operations" not in _plain(intro)
    assert "thema" not in INTENTIE_GRENS_UITLEG.lower()
    assert "—" not in INTENTIE_GRENS_UITLEG and "–" not in INTENTIE_GRENS_UITLEG


def test_uitleg_noemt_niet_wie_het_raakt():
    regel = INTENTIE_GRENS_UITLEG.lower()
    for woord in ("niemand heeft", "iedereen heeft", "allemaal"):
        assert woord not in regel


def test_blok_meldt_een_afdeling_die_wegviel_om_de_aftreksom():
    html = _blok([_rij()], dropped_aantal=[{"department": "Finance", "n": 12}])
    t = _plain(html)
    tabel = html[html.index("<table"):html.index("</table>")]
    assert "Finance" not in tabel
    assert "Finance (12 antwoorden) staat hier niet in" in t
    # Niet de reden van de bestaande aftrekregel (groep onder de tien).
    assert "minder dan 10 mensen" not in t


def test_blok_zonder_to_high_faalt_luid():
    rij = _rij()
    del rij["to_high"]
    with pytest.raises(KeyError):
        _blok([rij])


# -- Pagina twee ------------------------------------------------------------------

def test_pagina_twee_noemt_beide_soorten_weggevallen_afdelingen():
    t = _plain(_intentie_duiding(
        3.9, [2.0] * 30, [7.0] * 10 + [3.0] * 20, startpunt_label="Groeiperspectief",
        startpunt_score=4.5, intenties_afdeling="blok",
        intenties_weggelaten=[{"department": "Fin", "n": 11}, {"department": "IT", "n": 12}]))
    assert "Fin en IT staan er niet in" in t


def test_reden_herleidbaar_aantal_bestaat():
    assert "herleidbaar_aantal" in INTENTIE_AFDELING_ZIN
    zin = INTENTIE_AFDELING_ZIN["herleidbaar_aantal"]
    assert "minder dan 10" not in zin
    assert _intent_staat({"rows": [], "dropped": [], "dropped_aantal": [],
                          "reason": "herleidbaar_aantal"}, "") == "herleidbaar_aantal"


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
@pytest.mark.parametrize("key,grens,exact", [("04_alles_hoog", "minder dan 3 van de 14", "0 van de 14"),
                                             ("05_alles_laag", "meer dan 11 van de 14", "14 van de 14")])
def test_scenario_niemand_of_iedereen(key, grens, exact):
    body = _scenario(key)
    blok, p02 = _blok_en_p02(body)
    tabel = _plain(blok[blok.index("<table"):blok.index("</table>")])
    assert grens in tabel
    assert "niet getoond" not in _plain(blok)
    assert INTENTIE_GRENS_UITLEG in _plain(blok)
    # Nergens in het rapport het exacte aantal van Operations.
    assert not re.search(r"(?<!\d)" + re.escape(exact) + r"(?!\d)",
                         _plain(body).replace(grens, ""))
    # Pagina twee noemt geen afdeling en precies één totaal.
    tekst = _plain(p02)
    assert "Operations" not in tekst
    assert len(re.findall(r"(?:\d+|Geen) van de \d+", tekst)) == 1


@pytest.mark.usefixtures("stresstest_naar_tmp")
def test_scenario_05_aftreksom_met_pagina_twee_verraadt_operations_niet():
    blok, p02 = _blok_en_p02(_scenario("05_alles_laag"))
    m = re.search(r"(\d+) van de (\d+) hebben veel vertrekgedachten", _plain(p02))
    assert m
    hoog, n = int(m.group(1)), int(m.group(2))
    # Operations staat met een grens en er is geen exacte telling om af te
    # trekken: de aftreksom is het totaal zelf, over meer dan alleen Operations.
    assert n > 14 and 0 < hoog < n


# -- Punt 11: de intro zegt dat een restgroep er nooit in staat ------------------

def test_intro_noemt_dat_de_restgroep_er_nooit_in_staat():
    t = _plain(_blok([_rij(to_high=5)]))
    assert ("Alleen afdelingen met minstens 10 antwoorden, dezelfde grens als voor alle "
            "onderwerpen per afdeling. Een samengevoegde restgroep staat er nooit in.") in t

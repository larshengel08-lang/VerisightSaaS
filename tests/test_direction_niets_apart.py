"""Richtingkaart en pagina twee melden de niets-stemmen apart (spec 2026-10-07,
taak 7).

Sinds taak 6 beslissen clear en plurality op change_n: de echte veranderkeuzes,
zonder ‘Niets, dit zit hier goed’. Een eenduidige richting kan daardoor naast
niets-stemmen bestaan. De kaart en pagina twee zeggen dan op welke noemer de
richting rust en hoeveel mensen niets kozen; anders leest "Volgens 4 van de 8"
naast een tabel met 3 niets-stemmen als een rekenfout.

Zonder niets-stemmen (en zonder rijen zonder keuze) blijft elke zin byte-gelijk:
BASELINE hieronder is de uitvoer van HEAD (a8db33a3) vóór deze wijziging,
letterlijk overgenomen.
"""
import itertools
import logging
import re

import pytest

from backend.products.shared.deepening import (
    DEEPENING_FACTOR_KEYS,
    aggregate_direction,
    direction_option_texts,
    direction_state,
)
from backend.report_html import (
    _direction_card_cell,
    _direction_p02_line,
    _drempeltabel,
    _trust_page,
)

NIETS = {"retention": "Niets, dit zit hier goed", "exit": "Niets, dit zat hier goed"}
OPT_VIS = {"retention": "Beter zicht op welke mogelijkheden er voor mij zijn",
           "exit": "Beter zicht op welke mogelijkheden er voor mij waren"}
IMP_VIS = "Maak zichtbaar welke mogelijkheden er voor medewerkers zijn."
NOEMER = ("zijn de mensen bij wie groeiperspectief het laagst scoorde en die de vraag "
          "beantwoordden.")


def agg(n, counts):
    return {"answered": n, "counts": counts, "other_texts": [], "lowest_n": n,
            "offered": n, "skipped": 0}


def card(a, scan_type, score=6.2):
    return _direction_card_cell("startpunt", label="Groeiperspectief", agg=a,
                                scan_type=scan_type, factor_key="growth",
                                n_total=a["answered"], factor_score=score)


def p02(a, scan_type, score=6.2):
    return _direction_p02_line({"growth": a}, "growth", scan_type, score)


def src(html):
    m = re.search(r'<div class="dir-src">(.*?)</div>', html)
    assert m, html
    return m.group(1)


def head(html):
    return re.search(r'<div class="dir-head">(.*?)</div>', html).group(1)


# fmt: off
BASELINE = {
    'retention/clear0/card': '<td class="dir-card dir-clear"><div class="dir-role">Startpunt: Groeiperspectief</div><div class="dir-head">Maak zichtbaar welke mogelijkheden er voor medewerkers zijn.</div><div class="dir-src">Volgens 6 van de 8; die 8 zijn de mensen bij wie groeiperspectief het laagst scoorde en die de vraag beantwoordden.</div><table class="item-tbl dir-tbl"><tr><td class="iq">Beter zicht op welke mogelijkheden er voor mij zijn</td><td class="is">6 van de 8</td></tr><tr><td class="iq">Ontwikkeling beter inplannen naast het reguliere werk</td><td class="is">2 van de 8</td></tr></table><div class="dir-chain">8 van de 8 respondenten hadden dit als eigen laagste onderwerp; 8 van de 8 beantwoordden de vraag.</div></td>',
    'retention/clear0/p02': 'Wat er moet gebeuren volgens 6 van de 8 die dit het laagst scoorden en de vraag beantwoordden: Maak zichtbaar welke mogelijkheden er voor medewerkers zijn.',
    'retention/plur0/card': '<td class="dir-card dir-plurality"><div class="dir-role">Startpunt: Groeiperspectief</div><div class="dir-head">De grootste groep kiest ‘Beter zicht op welke mogelijkheden er voor mij zijn’, zonder meerderheid.</div><div class="dir-src">3 van de 7 kozen die richting; 1 koos ‘Een concreter gesprek over mijn ontwikkeling’. Die 7 zijn de mensen bij wie groeiperspectief het laagst scoorde en die de vraag beantwoordden. Wat er volgens de grootste groep moet gebeuren: Maak zichtbaar welke mogelijkheden er voor medewerkers zijn.</div><table class="item-tbl dir-tbl"><tr><td class="iq">Beter zicht op welke mogelijkheden er voor mij zijn</td><td class="is">3 van de 7</td></tr><tr><td class="iq">Een concreter gesprek over mijn ontwikkeling</td><td class="is">1 van de 7</td></tr><tr><td class="iq">Duidelijkere criteria voor hoe doorgroei wordt bepaald</td><td class="is">1 van de 7</td></tr><tr><td class="iq">Ontwikkelafspraken concreter vastleggen en zichtbaar opvolgen</td><td class="is">1 van de 7</td></tr><tr><td class="iq">Ontwikkeling beter inplannen naast het reguliere werk</td><td class="is">1 van de 7</td></tr></table><div class="dir-chain">7 van de 7 respondenten hadden dit als eigen laagste onderwerp; 7 van de 7 beantwoordden de vraag.</div></td>',
    'retention/plur0/p02': 'Wat er moet gebeuren volgens de grootste groep, 3 van de 7 die dit het laagst scoorden en de vraag beantwoordden, zonder meerderheid: Maak zichtbaar welke mogelijkheden er voor medewerkers zijn.',
    'retention/plur0big/card': '<td class="dir-card dir-plurality"><div class="dir-role">Startpunt: Groeiperspectief</div><div class="dir-head">De grootste groep kiest ‘Beter zicht op welke mogelijkheden er voor mij zijn’, zonder meerderheid.</div><div class="dir-src">8 van de 20 (40%) kozen die richting; 5 kozen ‘Een concreter gesprek over mijn ontwikkeling’. Die 20 zijn de mensen bij wie groeiperspectief het laagst scoorde en die de vraag beantwoordden. Wat er volgens de grootste groep moet gebeuren: Maak zichtbaar welke mogelijkheden er voor medewerkers zijn.</div><table class="item-tbl dir-tbl"><tr><td class="iq">Beter zicht op welke mogelijkheden er voor mij zijn</td><td class="is">8 van de 20 (40%)</td></tr><tr><td class="iq">Een concreter gesprek over mijn ontwikkeling</td><td class="is">5 van de 20 (25%)</td></tr><tr><td class="iq">Ontwikkeling beter inplannen naast het reguliere werk</td><td class="is">4 van de 20 (20%)</td></tr><tr><td class="iq">Duidelijkere criteria voor hoe doorgroei wordt bepaald</td><td class="is">3 van de 20 (15%)</td></tr></table><div class="dir-chain">20 van de 20 respondenten hadden dit als eigen laagste onderwerp; 20 van de 20 beantwoordden de vraag.</div></td>',
    'retention/plur0big/p02': 'Wat er moet gebeuren volgens de grootste groep, 8 van de 20 (40%) die dit het laagst scoorden en de vraag beantwoordden, zonder meerderheid: Maak zichtbaar welke mogelijkheden er voor medewerkers zijn.',
    'exit/clear0/card': '<td class="dir-card dir-clear"><div class="dir-role">Startpunt: Groeiperspectief</div><div class="dir-head">Maak zichtbaar welke mogelijkheden er voor medewerkers zijn.</div><div class="dir-src">Volgens 6 van de 8; die 8 zijn de mensen bij wie groeiperspectief het laagst scoorde en die de vraag beantwoordden.</div><table class="item-tbl dir-tbl"><tr><td class="iq">Beter zicht op welke mogelijkheden er voor mij waren</td><td class="is">6 van de 8</td></tr><tr><td class="iq">Ontwikkeling beter inplannen naast het reguliere werk</td><td class="is">2 van de 8</td></tr></table><div class="dir-chain">8 van de 8 respondenten hadden dit als eigen laagste onderwerp; 8 van de 8 beantwoordden de vraag.</div></td>',
    'exit/clear0/p02': 'Wat er moet gebeuren volgens 6 van de 8 die dit het laagst scoorden en de vraag beantwoordden: Maak zichtbaar welke mogelijkheden er voor medewerkers zijn.',
    'exit/plur0/card': '<td class="dir-card dir-plurality"><div class="dir-role">Startpunt: Groeiperspectief</div><div class="dir-head">De grootste groep kiest ‘Beter zicht op welke mogelijkheden er voor mij waren’, zonder meerderheid.</div><div class="dir-src">3 van de 7 kozen die richting; 1 koos ‘Een concreter gesprek over mijn ontwikkeling’. Die 7 zijn de mensen bij wie groeiperspectief het laagst scoorde en die de vraag beantwoordden. Wat er volgens de grootste groep moet gebeuren: Maak zichtbaar welke mogelijkheden er voor medewerkers zijn.</div><table class="item-tbl dir-tbl"><tr><td class="iq">Beter zicht op welke mogelijkheden er voor mij waren</td><td class="is">3 van de 7</td></tr><tr><td class="iq">Een concreter gesprek over mijn ontwikkeling</td><td class="is">1 van de 7</td></tr><tr><td class="iq">Duidelijkere criteria voor hoe doorgroei werd bepaald</td><td class="is">1 van de 7</td></tr><tr><td class="iq">Ontwikkelafspraken concreter vastleggen en zichtbaar opvolgen</td><td class="is">1 van de 7</td></tr><tr><td class="iq">Ontwikkeling beter inplannen naast het reguliere werk</td><td class="is">1 van de 7</td></tr></table><div class="dir-chain">7 van de 7 respondenten hadden dit als eigen laagste onderwerp; 7 van de 7 beantwoordden de vraag.</div></td>',
    'exit/plur0/p02': 'Wat er moet gebeuren volgens de grootste groep, 3 van de 7 die dit het laagst scoorden en de vraag beantwoordden, zonder meerderheid: Maak zichtbaar welke mogelijkheden er voor medewerkers zijn.',
    'exit/plur0big/card': '<td class="dir-card dir-plurality"><div class="dir-role">Startpunt: Groeiperspectief</div><div class="dir-head">De grootste groep kiest ‘Beter zicht op welke mogelijkheden er voor mij waren’, zonder meerderheid.</div><div class="dir-src">8 van de 20 (40%) kozen die richting; 5 kozen ‘Een concreter gesprek over mijn ontwikkeling’. Die 20 zijn de mensen bij wie groeiperspectief het laagst scoorde en die de vraag beantwoordden. Wat er volgens de grootste groep moet gebeuren: Maak zichtbaar welke mogelijkheden er voor medewerkers zijn.</div><table class="item-tbl dir-tbl"><tr><td class="iq">Beter zicht op welke mogelijkheden er voor mij waren</td><td class="is">8 van de 20 (40%)</td></tr><tr><td class="iq">Een concreter gesprek over mijn ontwikkeling</td><td class="is">5 van de 20 (25%)</td></tr><tr><td class="iq">Ontwikkeling beter inplannen naast het reguliere werk</td><td class="is">4 van de 20 (20%)</td></tr><tr><td class="iq">Duidelijkere criteria voor hoe doorgroei werd bepaald</td><td class="is">3 van de 20 (15%)</td></tr></table><div class="dir-chain">20 van de 20 respondenten hadden dit als eigen laagste onderwerp; 20 van de 20 beantwoordden de vraag.</div></td>',
    'exit/plur0big/p02': 'Wat er moet gebeuren volgens de grootste groep, 8 van de 20 (40%) die dit het laagst scoorden en de vraag beantwoordden, zonder meerderheid: Maak zichtbaar welke mogelijkheden er voor medewerkers zijn.',
}
# fmt: on

BASE_CASES = {
    "clear0": agg(8, {"grd_visibility": 6, "grd_time": 2}),
    "plur0": agg(7, {"grd_visibility": 3, "grd_conversation": 1, "grd_followthrough": 1,
                     "grd_time": 1, "grd_criteria": 1}),
    "plur0big": agg(20, {"grd_visibility": 8, "grd_conversation": 5, "grd_time": 4,
                         "grd_criteria": 3}),
}


@pytest.mark.parametrize("scan_type", ["retention", "exit"])
@pytest.mark.parametrize("name", sorted(BASE_CASES))
def test_zonder_niets_byte_gelijk(scan_type, name):
    a = BASE_CASES[name]
    assert card(a, scan_type) == BASELINE[f"{scan_type}/{name}/card"]
    assert p02(a, scan_type) == BASELINE[f"{scan_type}/{name}/p02"]


# 4 van de 5 die iets wilden kozen route A, 3 kozen niets: clear.
CLEAR_NIETS = agg(8, {"grd_visibility": 4, "grd_time": 1, "grd_none": 3})
# Niets is hier de grootste losse optie (8), dus "De grootste groep kiest ..."
# zonder "van wie om verandering vroeg" zou letterlijk onwaar zijn.
PLUR_NIETS = agg(20, {"grd_none": 8, "grd_visibility": 5, "grd_conversation": 3,
                      "grd_time": 2, "grd_criteria": 2})


@pytest.mark.parametrize("scan_type", ["retention", "exit"])
def test_clear_kaart_noemt_noemer_en_niets(scan_type):
    html = card(CLEAR_NIETS, scan_type)
    assert "dir-card dir-clear" in html
    assert src(html) == (
        f"Volgens 4 van de 5 die om verandering vroegen; 3 kozen ‘{NIETS[scan_type]}’. "
        f"Die 8 {NOEMER}")


@pytest.mark.parametrize("scan_type", ["retention", "exit"])
def test_clear_p02_noemt_noemer_en_niets(scan_type):
    assert p02(CLEAR_NIETS, scan_type) == (
        f"Wat er moet gebeuren volgens 4 van de 5 die om verandering vroegen: {IMP_VIS} "
        "3 vinden dat hier niets hoeft.")


@pytest.mark.parametrize("scan_type", ["retention", "exit"])
def test_plurality_kaart_met_niets(scan_type):
    html = card(PLUR_NIETS, scan_type)
    assert "dir-card dir-plurality" in html
    assert head(html) == ("Van wie om verandering vroeg, kiest de grootste groep "
                          f"‘{OPT_VIS[scan_type]}’, zonder meerderheid.")
    assert src(html) == (
        "5 van de 12 (42%) die om verandering vroegen, kozen die richting; 3 kozen "
        f"‘Een concreter gesprek over mijn ontwikkeling’; 8 kozen ‘{NIETS[scan_type]}’. "
        f"Die 20 {NOEMER} Wat er volgens de grootste groep moet gebeuren: {IMP_VIS}")


@pytest.mark.parametrize("scan_type", ["retention", "exit"])
def test_plurality_p02_met_niets(scan_type):
    assert p02(PLUR_NIETS, scan_type) == (
        "Wat er moet gebeuren volgens de grootste groep van wie om verandering vroeg, "
        f"5 van de 12 (42%), zonder meerderheid: {IMP_VIS} 8 vinden dat hier niets hoeft.")


def test_enkelvoud_bij_een_niets_stem():
    a = agg(6, {"grd_visibility": 4, "grd_time": 1, "grd_none": 1})
    assert "; 1 koos ‘Niets, dit zit hier goed’. Die 6 " in src(card(a, "retention"))
    assert p02(a, "retention").endswith(f"{IMP_VIS} 1 vindt dat hier niets hoeft.")


def test_rijen_zonder_keuze_krijgen_een_zin_en_alles_telt_op():
    # 5 veranderkeuzes + 3 niets + 2 zonder keuze = 10.
    a = agg(10, {"grd_visibility": 4, "grd_time": 1, "grd_none": 3})
    assert src(card(a, "retention")) == (
        "Volgens 4 van de 5 die om verandering vroegen; 3 kozen ‘Niets, dit zit hier "
        f"goed’. Die 10 {NOEMER} Bij 2 van hen is geen keuze vastgelegd.")
    # Zonder niets-stemmen: de oude zin plus dezelfde slotzin.
    b = agg(8, {"grd_visibility": 3})
    assert src(card(b, "retention")) == (
        f"Volgens 3 van de 8; die 8 {NOEMER} Bij 5 van hen is geen keuze vastgelegd.")
    # Eén rij zonder keuze: zelfde zin, geen enkelvoudsprobleem.
    d = agg(9, {"grd_visibility": 4, "grd_time": 1, "grd_none": 3})
    assert src(card(d, "retention")).endswith("Bij 1 van hen is geen keuze vastgelegd.")
    # Plurality: de slotzin hoort bij de noemer, vóór de opdrachtvorm.
    c = agg(23, {"grd_none": 8, "grd_visibility": 5, "grd_conversation": 3,
                 "grd_time": 2, "grd_criteria": 2})
    assert (f"Die 23 {NOEMER} Bij 3 van hen is geen keuze vastgelegd. Wat er volgens "
            "de grootste groep") in src(card(c, "retention"))


def test_plurality_tweede_is_nooit_de_niets_optie():
    sleutels = ["grd_visibility", "grd_time", "grd_conversation", "grd_other", "grd_none"]
    gezien = 0
    for waarden in itertools.product(range(6), repeat=len(sleutels)):
        counts = {k: v for k, v in zip(sleutels, waarden) if v}
        n = sum(counts.values())
        if n < 3:
            continue
        a = agg(n, counts)
        st = direction_state(a, "growth", 6.2)
        if st["state"] != "plurality":
            continue
        gezien += 1
        s = src(card(a, "retention"))
        verwacht = 1 if st["none_n"] else 0
        assert s.count("‘Niets, dit zit hier goed’") == verwacht, (counts, s)
    assert gezien > 20


def test_getallen_tellen_op_in_clear_en_plurality():
    sleutels = ["grd_visibility", "grd_time", "grd_conversation", "grd_none"]
    gezien = 0
    for waarden in itertools.product(range(7), repeat=len(sleutels)):
        counts = {k: v for k, v in zip(sleutels, waarden) if v}
        gekozen = sum(counts.values())
        if gekozen < 3:
            continue
        for defect in (0, 2):
            a = agg(gekozen + defect, counts)
            st = direction_state(a, "growth", 6.2)
            if st["state"] not in ("clear", "plurality") or not (st["none_n"] or defect):
                continue
            gezien += 1
            s = src(card(a, "retention"))
            assert st["change_n"] + st["none_n"] + defect == st["n"]
            if st["none_n"]:
                assert re.search(rf"van de {st['change_n']}( \(\d+%\))? die om verandering vroegen", s), s
                vorm = "koos" if st["none_n"] == 1 else "kozen"
                assert f"{st['none_n']} {vorm} ‘Niets" in s, s
            assert re.search(rf"[Dd]ie {st['n']} zijn de mensen", s), s
            if defect:
                assert f"Bij {defect} van hen is geen keuze vastgelegd." in s, s
    assert gezien > 50


def _alle_teksten():
    for scan_type in ("retention", "exit"):
        for a in [*BASE_CASES.values(), CLEAR_NIETS, PLUR_NIETS,
                  agg(10, {"grd_visibility": 4, "grd_time": 1, "grd_none": 3}),
                  agg(8, {"grd_visibility": 3}),
                  agg(23, {"grd_none": 8, "grd_visibility": 5, "grd_conversation": 3,
                           "grd_time": 2, "grd_criteria": 2})]:
            yield card(a, scan_type)
            yield p02(a, scan_type)


def test_geen_dubbele_punten_of_streepjes():
    for t in _alle_teksten():
        assert ".." not in t and ". ." not in t, t
        assert "—" not in t and "–" not in t, t
        # Geen zin die zonder spatie aan de vorige vastzit.
        assert not re.search(r"[a-z’]\.[A-Z0-9]", re.sub(r"<[^>]+>", " ", t)), t


@pytest.mark.parametrize("scan_type", ["retention", "exit"])
def test_niets_tekst_gelijk_over_factoren(scan_type):
    teksten = set()
    for fk in DEEPENING_FACTOR_KEYS:
        nones = [v for k, v in direction_option_texts(scan_type, fk).items()
                 if k.endswith("_none")]
        assert len(nones) == 1
        teksten |= set(nones)
    assert teksten == {NIETS[scan_type]}


@pytest.mark.parametrize("scan_type", ["retention", "exit"])
def test_methodiek_legt_uit_dat_niets_geen_richting_is(scan_type):
    html = _trust_page(scan_type, direction_active=True)
    zin = (f"‘{NIETS[scan_type]}’ telt niet als richting: of er een eenduidige "
           "richting is, bepalen de mensen die om verandering vroegen; hoeveel mensen "
           "niets kozen, staat er apart bij.")
    assert f"geen advies van Loep. {zin}" in html


def test_drempeltabel_zegt_dat_de_vloer_ook_voor_veranderkeuzes_geldt():
    html = _drempeltabel("retention", direction_active=True, direction_degraded=False,
                         deepening_active=True, ranking_active=True)
    assert "minstens drie mensen om verandering vroegen" in html


def _rows(zonder_keuze):
    low_gr = {"growth_1": 2, "growth_2": 3, "growth_3": 2,
              "workload_1": 4, "workload_2": 4, "workload_3": 4}
    dr = {"factor_key": "growth", "question_set_version": "retention_growth_direction_v2",
          "status": "answered", "choice": "grd_time", "other_text": None}
    leeg = {**dr, "choice": None}
    return [(low_gr, dr)] * 3 + [(low_gr, leeg)] * zonder_keuze


def test_rij_zonder_keuze_wordt_een_keer_per_aggregatie_gelogd(caplog):
    with caplog.at_level(logging.WARNING):
        out = aggregate_direction(_rows(2), "retention")
    hits = [r for r in caplog.records if "zonder keuze" in r.getMessage()]
    assert len(hits) == 1 and "growth" in hits[0].getMessage()
    caplog.clear()
    with caplog.at_level(logging.WARNING):
        # Renderen roept direction_state meerdere keren aan; dat logt niet meer.
        card(out["growth"], "retention")
        p02(out["growth"], "retention")
        direction_state(out["growth"], "growth", 6.2)
    assert not any("zonder keuze" in r.getMessage() for r in caplog.records)
    caplog.clear()
    with caplog.at_level(logging.WARNING):
        aggregate_direction(_rows(0), "retention")
    assert not any("zonder keuze" in r.getMessage() for r in caplog.records)

"""Spec 2026-10-09 par. 3 (besluit Lars 9-10): een richting heet pas duidelijk,
of de grootste groep, als hij meer stemmen heeft dan 'Niets, dit zit hier goed'.
Is de niets-groep even groot of groter, dan heet het onderwerp verdeeld."""
import itertools
import re

import pytest

from backend.products.shared import deepening as dp
from backend.products.shared.deepening import (
    DIRECTION_NONE_TOP_COUNTS_MIN,
    WORK_QUESTION_VARIANTS,
    direction_option_texts,
    translation_question,
)
from backend.report_html import (
    _direction_card_cell,
    _direction_p02_line,
    _trust_page,
    _werkvragen_block,
)
from tests.test_report_priority_render import _row

FK = "growth"


def _opties(scan_type="retention"):
    keys = list(direction_option_texts(scan_type, FK))
    none_key = next(k for k in keys if k.endswith("_none"))
    other_key = next(k for k in keys if k.endswith("_other"))
    routes = [k for k in keys if k not in (none_key, other_key)]
    return none_key, other_key, routes


def _agg(counts, answered=None):
    n = sum(counts.values()) if answered is None else answered
    return {"answered": n, "counts": counts, "other_texts": [], "lowest_n": n,
            "offered": n, "skipped": 0}


def test_niets_groter_dan_grootste_richting_is_verdeeld():
    none_key, _o, (a, b, c, *_r) = _opties()
    # change_n 7, a 4/7 met voorsprong 2 was clear; niets 5 > 4.
    st = dp.direction_state(_agg({a: 4, b: 2, c: 1, none_key: 5}), FK, 6.0)
    assert st["state"] == "divided"
    assert st["none_at_least_top"] is True
    assert st["change_top_n"] == 4 and st["none_n"] == 5


def test_niets_even_groot_als_grootste_richting_is_verdeeld():
    none_key, _o, (a, *_r) = _opties()
    st = dp.direction_state(_agg({a: 4, none_key: 4}), FK, 6.0)
    assert st["state"] == "divided" and st["none_at_least_top"] is True


def test_niets_een_kleiner_blijft_duidelijk_boven_de_vijf():
    none_key, _o, (a, b, *_r) = _opties()
    st = dp.direction_state(_agg({a: 4, b: 1, none_key: 3}), FK, 6.0)
    assert st["state"] == "clear" and st["none_at_least_top"] is False


def test_onder_de_vijf_blijft_split_none_voorgaan():
    none_key, _o, (a, *_r) = _opties()
    assert dp.direction_state(_agg({a: 4, none_key: 4}), FK, 4.5)["state"] == "split_none"


def test_onbekende_score_valt_ook_onder_de_regel():
    none_key, _o, (a, *_r) = _opties()
    assert dp.direction_state(_agg({a: 14, none_key: 14}), FK, None)["state"] == "divided"


def test_none_at_least_top_staat_altijd_in_de_uitkomst():
    none_key, _o, (a, b, *_r) = _opties()
    for counts in ({a: 1}, {a: 5, b: 1}, {none_key: 9, a: 1}, {a: 3, none_key: 3}):
        st = dp.direction_state(_agg(counts), FK, 6.0)
        assert "none_at_least_top" in st
        assert "change_top_n" in st


def test_eigenschap_clear_en_plurality_altijd_groter_dan_niets():
    none_key, other_key, routes = _opties()
    keys = [routes[0], routes[1], other_key, none_key]
    for waarden in itertools.product(range(0, 7), repeat=4):
        counts = {k: v for k, v in zip(keys, waarden) if v}
        if not counts:
            continue
        for score in (None, 5.0, 6.2, 8.0):
            st = dp.direction_state(_agg(counts), FK, score)
            if st["state"] in ("clear", "plurality"):
                assert st["top_n"] > st["none_n"], (counts, score, st)


def _kaart(counts, scan_type="retention", score=6.2):
    a = _agg(counts)
    return _direction_card_cell("startpunt", label="Groeiperspectief", agg=a,
                                scan_type=scan_type, factor_key=FK,
                                n_total=a["answered"], factor_score=score)


@pytest.mark.parametrize("scan_type", ["retention", "exit"])
def test_kaart_noemt_niets_groter_dan_de_grootste_richting(scan_type):
    none_key, _o, (a, b, *_r) = _opties(scan_type)
    html = _kaart({a: 5, b: 3, none_key: 8}, scan_type)
    assert 'class="dir-card dir-divided"' in html
    assert "Geen eenduidige richting." in html
    tekst = re.sub(r"<[^>]+>", " ", html)
    assert "meer mensen kozen" in tekst and "(8)" in tekst and "(5)" in tekst
    assert "grootste groep kiest" not in tekst


@pytest.mark.parametrize("scan_type", ["retention", "exit"])
def test_kaart_noemt_niets_even_groot(scan_type):
    none_key, _o, (a, *_r) = _opties(scan_type)
    tekst = re.sub(r"<[^>]+>", " ", _kaart({a: 4, none_key: 4}, scan_type))
    assert "even veel mensen kozen" in tekst


@pytest.mark.parametrize("scan_type", ["retention", "exit"])
def test_p02_regel_bij_niets_groter(scan_type):
    none_key, _o, (a, b, *_r) = _opties(scan_type)
    regel = _direction_p02_line({FK: _agg({a: 5, b: 3, none_key: 8})}, FK, scan_type, 6.2)
    assert regel.startswith("Over wat hier moet gebeuren zijn de 16 ")
    assert "8 vinden dat hier niets hoeft, tegen 5 voor de grootste richting." in regel
    assert "zonder meerderheid" not in regel


@pytest.mark.parametrize("scan_type", ["retention", "exit"])
def test_methodiek_noemt_de_nieuwe_regel(scan_type):
    html = _trust_page(scan_type, opener_html="", direction_active=True)
    tekst = re.sub(r"\s+", " ", re.sub(r"<[^>]+>", " ", html))
    assert "heet pas duidelijk, of de grootste groep, als hij meer stemmen heeft dan" in tekst


# Codereview taak 1: de vertaalvraag op de agenda mag de kaart niet
# tegenspreken. Bij een niets-groep die minstens zo groot is als de grootste
# richting stuurde de gewone verdeeld-zin het MT naar een route, en bij één
# route verdween de vraag helemaal.
NIETS_VARIANT = WORK_QUESTION_VARIANTS["none_at_least_top"]


def _een_route(scan_type):
    none_key, _o, (a, *_r) = _opties(scan_type)
    return {a: 4, none_key: 4}


def _meer_routes(scan_type):
    none_key, _o, (a, b, *_r) = _opties(scan_type)
    return {a: 5, b: 3, none_key: 8}


@pytest.mark.parametrize("scan_type", ["retention", "exit"])
@pytest.mark.parametrize("bouw", [_een_route, _meer_routes], ids=["een_route", "meer_routes"])
def test_vertaalvraag_bij_niets_minstens_even_groot(scan_type, bouw):
    st = dp.direction_state(_agg(bouw(scan_type)), FK, 6.2)
    assert st["state"] == "divided" and st["none_at_least_top"] is True
    vraag = translation_question(scan_type, FK, st)
    assert vraag == NIETS_VARIANT[scan_type]
    assert vraag != WORK_QUESTION_VARIANTS["divided"][scan_type]


@pytest.mark.parametrize("scan_type", ["retention", "exit"])
@pytest.mark.parametrize("bouw", [_een_route, _meer_routes], ids=["een_route", "meer_routes"])
def test_werkvragenblok_toont_de_niets_variant(scan_type, bouw):
    ranked = [_row(FK, "Groeiperspectief", 6.2, role="startpunt")]
    html = _werkvragen_block(ranked, {}, {FK: _agg(bouw(scan_type))}, scan_type)
    tekst = re.sub(r"\s+", " ", re.sub(r"<[^>]+>", " ", html))
    assert NIETS_VARIANT[scan_type] in tekst
    assert WORK_QUESTION_VARIANTS["divided"][scan_type] not in tekst
    # De wegingsregel hoort bij de gewone verdeeld-zin; hier zou "is geen
    # richting en telt hier niet mee" de niets-vraag tegenspreken.
    assert "De meest gekozen richtingen zijn die met" not in tekst
    assert "telt hier niet mee" not in tekst


def test_niets_variant_zegt_minstens_en_niet_even_groot():
    for scan_type, tekst in NIETS_VARIANT.items():
        assert "minstens zoveel" in tekst, scan_type
        assert "even groot" not in tekst, scan_type
        assert "\u2013" not in tekst and "\u2014" not in tekst, scan_type
        assert tekst.endswith("?"), scan_type
    assert "zeiden" in NIETS_VARIANT["exit"] and "zat" in NIETS_VARIANT["exit"]
    assert "voor wie er nu werkt" in NIETS_VARIANT["exit"]


# Codereview taak 1, punt 4: bij een grootste richting van één stem leest "even
# veel mensen kozen" als een groep die er niet is. Dan blijft de gewone
# verdeeld-tekst op kaart, pagina twee en werkvraag.
@pytest.mark.parametrize("scan_type", ["retention", "exit"])
def test_kleine_n_een_een_een_valt_terug_op_de_gewone_verdeeld_tekst(scan_type):
    assert DIRECTION_NONE_TOP_COUNTS_MIN == 2
    none_key, _o, (a, b, *_r) = _opties(scan_type)
    counts = {a: 1, b: 1, none_key: 1}
    st = dp.direction_state(_agg(counts), FK, 6.2)
    assert st["state"] == "divided" and st["none_at_least_top"] is True
    assert st["change_top_n"] == 1
    tekst = re.sub(r"<[^>]+>", " ", _kaart(counts, scan_type))
    assert ("De 3 die dit het laagst scoorden en de vraag beantwoordden kozen "
            "verschillend.") in tekst
    assert "mensen kozen" not in tekst
    assert _direction_p02_line({FK: _agg(counts)}, FK, scan_type, 6.2) == (
        "Over wat hier moet gebeuren zijn de 3 die dit het laagst scoorden en de "
        "vraag beantwoordden verdeeld. Zie de gespreksagenda.")
    assert translation_question(scan_type, FK, st) == WORK_QUESTION_VARIANTS["divided"][scan_type]


@pytest.mark.parametrize("scan_type", ["retention", "exit"])
def test_twee_tegen_twee_krijgt_wel_de_tellingen(scan_type):
    """De grens zelf: bij een grootste richting van twee stemmen wel de zin."""
    none_key, _o, (a, *_r) = _opties(scan_type)
    counts = {a: 2, none_key: 2}
    tekst = re.sub(r"<[^>]+>", " ", _kaart(counts, scan_type))
    assert "even veel mensen kozen" in tekst and "(2)" in tekst
    assert _direction_p02_line({FK: _agg(counts)}, FK, scan_type, 6.2).endswith(
        "2 vinden dat hier niets hoeft, tegen 2 voor de grootste richting.")

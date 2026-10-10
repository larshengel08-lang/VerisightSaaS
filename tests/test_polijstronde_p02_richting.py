"""R18 en spec 2026-10-09 par. 5: richtingregel op pagina twee zonder percentage,
en bij de grootste groep eerst de opdracht, dan de noemer in een slotzin."""
import re

import pytest

from backend.products.shared.deepening import direction_option_texts
from backend.report_html import _direction_card_cell, _direction_p02_line

FK = "growth"


def _keys(scan_type):
    keys = list(direction_option_texts(scan_type, FK))
    none_key = next(k for k in keys if k.endswith("_none"))
    routes = [k for k in keys if not k.endswith(("_none", "_other"))]
    return none_key, routes


def _agg(counts):
    n = sum(counts.values())
    return {"answered": n, "counts": counts, "other_texts": [], "lowest_n": n,
            "offered": n, "skipped": 0}


@pytest.mark.parametrize("scan_type", ["retention", "exit"])
def test_geen_percentage_op_pagina_twee(scan_type):
    _n, (a, b, *_r) = _keys(scan_type)
    regel = _direction_p02_line({FK: _agg({a: 11, b: 4})}, FK, scan_type, 4.7)
    assert "11 van de 15 die dit het laagst scoorden" in regel
    assert "%" not in regel


@pytest.mark.parametrize("scan_type", ["retention", "exit"])
def test_kaart_houdt_het_percentage(scan_type):
    _n, (a, b, *_r) = _keys(scan_type)
    a_ = _agg({a: 11, b: 4})
    kaart = _direction_card_cell("startpunt", label="Groeiperspectief", agg=a_,
                                 scan_type=scan_type, factor_key=FK, n_total=15,
                                 factor_score=4.7)
    assert "11 van de 15 (73%)" in kaart


@pytest.mark.parametrize("scan_type", ["retention", "exit"])
def test_grootste_groep_met_niets_opdracht_eerst_noemer_in_slotzin(scan_type):
    none_key, (a, b, c, d, *_r) = _keys(scan_type)
    # change_n 27: a 12 (44%), b 8, c 4, d 3; niets 8 < 12.
    regel = _direction_p02_line({FK: _agg({a: 12, b: 8, c: 4, d: 3, none_key: 8})},
                                FK, scan_type, 6.2)
    assert regel.startswith("Wat er moet gebeuren volgens de grootste groep, zonder meerderheid: ")
    assert regel.endswith(" Dat zijn 12 van de 27 die dit het laagst scoorden en om "
                          "verandering vroegen; 8 vinden dat hier niets hoeft.")
    assert "%" not in regel


@pytest.mark.parametrize("scan_type", ["retention", "exit"])
def test_grootste_groep_zonder_niets(scan_type):
    _n, (a, b, c, d, *_r) = _keys(scan_type)
    regel = _direction_p02_line({FK: _agg({a: 8, b: 5, c: 4, d: 3})}, FK, scan_type, 6.2)
    assert regel.endswith(" Dat zijn 8 van de 20 die dit het laagst scoorden en de vraag "
                          "beantwoordden.")

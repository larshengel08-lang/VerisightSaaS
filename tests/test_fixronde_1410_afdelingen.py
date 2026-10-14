"""Fixronde 14-10, punten 10, 9 en 8 (besluiten Lars 14-10): de afdelingspagina.

Punt 10: sinds A4 toont de tabel bij 5 tot 9 antwoorden geen cijfer. De
conclusie onder de tabel ("Waar het per afdeling begint") rangschikte die
kleine afdelingen nog wel ("De twee laagste afdelingen liggen dicht bij elkaar
(Sales en IT)"), en dat kan de lezer op de pagina niet controleren. Nu doen
alleen afdelingen met een getoond cijfer mee aan een vergelijking; valt er dan
niets te vergelijken, dan zegt het blok dat eerlijk. Dezelfde regel geldt voor
de brugzin op pagina twee (één gate, _segment_startpunt) en voor de restgroep.
"""
import random
import re

import pytest

from backend.report_distribution import MIN_DISTRIBUTION_N
from backend.report_html import (
    _brugzin,
    _department_segment_rows,
    _segment_block,
    _segment_startpunt,
)


def _resp(dept, n, score):
    return [{"department": dept, "signal_score": score} for _ in range(n)]


def _rows(*specs):
    out = []
    for dept, n, score in specs:
        out.extend(_resp(dept, n, score))
    return _department_segment_rows(out)


def _anchor(html):
    m = re.search(r'<div class="navy-anchor">(.*?)</p>', html, re.S)
    return re.sub(r"<[^>]+>", "", m.group(1)) if m else ""


def _note(*specs, scan_type="retention"):
    return _anchor(_segment_block(_rows(*specs), scan_type=scan_type))


# -- Punt 10: alleen afdelingen met een cijfer in de vergelijking ----------------

def test_kleine_afdelingen_worden_niet_meer_als_twee_laagste_genoemd():
    # Sales (8) en IT (5) zijn klein en hebben geen cijfer; Operations (14) en
    # Finance (12) wel en liggen dicht bij elkaar.
    t = _note(("Sales", 8, 5.0), ("IT", 5, 5.1), ("Operations", 14, 6.1),
              ("Finance", 12, 6.2))
    assert "Sales" not in t and "IT" not in t
    assert "Operations 6.1/10" in t and "Finance 6.2/10" in t
    assert "met een cijfer" in t


def test_een_afdeling_met_cijfer_niets_te_vergelijken():
    t = _note(("Operations", 14, 4.5), ("Sales", 9, 7.0), ("IT", 6, 7.5))
    assert "Operations" in t
    assert "Sales" not in t and "IT" not in t
    assert "laagst" not in t and "hoogste" not in t
    assert "niets te vergelijken" in t
    assert "organisatiebeeld" in t


def test_geen_afdeling_met_cijfer():
    t = _note(("Logistiek", 7, 4.0), ("Sales", 8, 6.0), ("IT", 9, 6.5))
    for naam in ("Logistiek", "Sales", "IT"):
        assert naam not in t
    assert "laagst" not in t
    assert "Geen afzonderlijke afdeling heeft genoeg antwoorden voor een cijfer" in t
    assert "organisatiebeeld" in t


def test_aanwijzing_tussen_twee_afdelingen_met_cijfer():
    # Een kleine afdeling die lager staat dan Operations mag de conclusie niet
    # ongecontroleerd maken: Operations is de laagste van de afdelingen MET een
    # cijfer, en de zin zegt dat.
    rows = _rows(("Klein", 6, 3.0), ("Operations", 14, 4.5), ("Finance", 12, 6.0))
    t = _anchor(_segment_block(rows, scan_type="retention"))
    assert "Operations heeft de laagste score van de afdelingen met een cijfer" in t
    assert "Klein" not in t
    seg = _segment_startpunt(rows, None)
    assert seg["department"] == "Operations"


def test_zonder_kleine_afdelingen_blijft_de_oude_formulering():
    t = _note(("Operations", 14, 4.5), ("Finance", 12, 6.0))
    assert "Operations heeft de laagste score van de afdelingen die apart getoond worden" in t
    assert "met een cijfer" not in t


def test_kleine_volgende_afdeling_telt_niet_als_vergelijking():
    # Voorheen werd Operations aangewezen omdat Sales (klein, zonder cijfer)
    # 0,5 hoger stond. Er is geen tweede afdeling met cijfer: niets aan te wijzen.
    rows = _rows(("Operations", 14, 4.5), ("Sales", 9, 5.0))
    assert _segment_startpunt(rows, None) is None
    assert _brugzin("growth", "Groeiperspectief", _segment_startpunt(rows, None),
                    "retention") == ""


def test_vertrek_met_een_cijfer():
    t = _note(("Operations", 14, 4.5), ("Sales", 9, 7.0), scan_type="exit")
    assert "Operations" in t and "Sales" not in t
    assert "hoogste" not in t and "laagst" not in t


def test_restgroep_zonder_cijfer_wordt_niet_vergeleken():
    # De restgroep (drie kleine afdelingen van 2 tot 3, samen 8) staat lager,
    # maar heeft geen cijfer: geen "scoort lager".
    rows = _rows(("Operations", 14, 5.0), ("Finance", 12, 6.0),
                 ("A", 3, 2.0), ("B", 3, 2.0), ("C", 2, 2.0))
    assert any(r["is_pooled"] for r in rows)
    t = _anchor(_segment_block(rows, scan_type="retention"))
    assert "restgroep" not in t
    assert _segment_startpunt(rows, None)["rest_lager"] is False


def test_restgroep_met_cijfer_wordt_nog_wel_genoemd():
    rows = _rows(("Operations", 14, 5.0), ("Finance", 12, 6.0),
                 ("A", 4, 2.0), ("B", 4, 2.0), ("C", 3, 2.0))
    pooled = next(r for r in rows if r["is_pooled"])
    assert pooled["n"] >= MIN_DISTRIBUTION_N
    t = _anchor(_segment_block(rows, scan_type="retention"))
    assert "restgroep" in t
    assert _segment_startpunt(rows, None)["rest_lager"] is True


@pytest.mark.parametrize("seed", range(80))
def test_conclusie_noemt_nooit_een_kleine_afdeling(seed):
    rnd = random.Random(seed)
    specs = []
    for i in range(rnd.randint(2, 6)):
        n = rnd.choice([5, 6, 7, 8, 9, 10, 12, 14, 20])
        specs.append((f"Afd{i}x", n, round(rnd.uniform(3.0, 8.0), 1)))
    rows = _rows(*specs)
    if len([r for r in rows if not r["is_pooled"]]) < 2:
        return
    for scan in ("retention", "exit", "onboarding"):
        t = _note(*specs, scan_type=scan)
        for dept, n, _s in specs:
            if n < MIN_DISTRIBUTION_N:
                assert dept not in t, (scan, t)
        assert "—" not in t and "–" not in t
        seg = _segment_startpunt(rows, None)
        if seg:
            assert seg["n"] >= MIN_DISTRIBUTION_N

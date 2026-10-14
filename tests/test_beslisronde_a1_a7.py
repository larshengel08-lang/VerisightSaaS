"""Beslisronde na de polijstronde, taak 1 (besluiten Lars 12-10).

A1: de werkvraagvariant none_at_least_top is goedgekeurd (geen CONCEPT-markering
meer) en "Beide kan kloppen" wordt "Beide kunnen kloppen", in die variant en in
split_none.

A7: wint een onderwerp het gelijkspel op de vraag om verandering terwijl de
richtingkaart van datzelfde onderwerp de verdeeld-staat toont met een
niets-groep die minstens zo groot is als de grootste richting, dan lazen
pagina twee en de markeringsregel onder de rasterrij als een tegenspraak met die
kaart. Daar komt een losse zin achter met de tellingen ("Tegelijk kozen ..."),
met dezelfde poort als de kaart (direction_none_at_least_top_shown op
direction_state met de getoonde score). In elke andere staat verandert er niets.

Fixronde 14-10, punt 7 (besluit Lars 14-10): op pagina twee niet meer. Daar
noemde de zin dezelfde tellingen als de richtingregel eronder en duwde hij de
kernzin naar de kleinere letter. De markeringsregel onder de rij houdt hem.

De niets-groep wordt vergeleken met de grootste ENKELE richting, niet met alle
veranderstemmen: die vergelijking staat daarom expliciet in de zin.

Synthetische invoer met echte optiesleutels. De niets-tekst komt uit
DIRECTION_NONE_TEXT, dezelfde bron als de respondentoptie.
"""
import re
from pathlib import Path

import pytest

from backend.products.shared import deepening as dp
from backend.products.shared.deepening import (
    DIRECTION_NONE_TOP_COUNTS_MIN,
    DIRECTION_SPLIT_NONE_MAX_SCORE,
    WORK_QUESTION_VARIANTS,
)
from backend.report_html import (
    _fl,
    _p02_opening,
    _p02_startpunt_gronden,
    _p02_startpunt_zin,
    _telling,
    profile_shape,
    render_exit_report_html,
    render_retention_report_html,
)
from backend.report_priority import direction_niets_zin, rank_factors
from backend.scoring_config import ORG_FACTOR_KEYS
from tests.conftest import exit_report_data
from tests.test_report_distribution import _min_retention_data

NIETS = {"retention": "Niets, dit zit hier goed", "exit": "Niets, dit zat hier goed"}


# ---------------------------------------------------------------- A1

@pytest.mark.parametrize("soort", ["none_at_least_top", "split_none"])
@pytest.mark.parametrize("scan", ["retention", "exit"])
def test_beide_kunnen_kloppen(soort, scan):
    tekst = WORK_QUESTION_VARIANTS[soort][scan]
    assert "Beide kunnen kloppen." in tekst
    assert "Beide kan" not in tekst


def test_geen_beide_kan_meer_in_de_varianten():
    for soort, per_scan in WORK_QUESTION_VARIANTS.items():
        for scan, tekst in per_scan.items():
            assert "Beide kan" not in tekst, (soort, scan)


def test_none_at_least_top_draagt_geen_concept_markering_meer():
    bron = Path(dp.__file__).read_text(encoding="utf-8")
    assert "CONCEPT: nog ter review bij Lars" not in bron


# ---------------------------------------------------------------- A7, de zin zelf

def test_niets_zin_bij_gelijk():
    feiten = {"none_n": 3, "n": 8, "change_top_n": 3}
    assert direction_niets_zin(feiten, "retention", "hier") == (
        "Tegelijk kozen hier 3 van de 8 ‘Niets, dit zit hier goed’, evenveel als "
        "de grootste richting.")


def test_niets_zin_bij_groter_noemt_de_grootste_richting():
    feiten = {"none_n": 4, "n": 9, "change_top_n": 3}
    assert direction_niets_zin(feiten, "exit", "bij Werkdruk en balans") == (
        "Tegelijk kozen bij Werkdruk en balans 4 van de 9 ‘Niets, dit zat hier goed’, "
        "meer dan de grootste richting (3).")


def test_niets_zin_telt_zoals_pagina_twee():
    # Dezelfde tellingsvorm als _telling(pct=False) op pagina twee (R18).
    zin = direction_niets_zin({"none_n": 12, "n": 25, "change_top_n": 10}, "retention", "hier")
    assert _telling(12, 25, pct=False) in zin
    assert "%" not in zin


# ---------------------------------------------------------------- A7, raster

def _agg(counts):
    n = sum(counts.values())
    return {"lowest_n": n, "offered": n, "answered": n, "skipped": 0, "counts": counts}


LABELS = {"growth": "Groeiperspectief", "workload": "Werkdruk"}


def _rank(workload_counts, *, scan="retention", score=6.0):
    """Werkdruk wint het gelijkspel op de vraag om verandering tegen
    Groeiperspectief (1 van de 8 vraagt daar om verandering)."""
    direction = {"workload": _agg(workload_counts),
                 "growth": _agg({"grd_visibility": 1, "grd_none": 7})}
    return rank_factors(scan, {"growth": score, "workload": score}, {}, {},
                        labels=LABELS, direction_agg=direction)


# Divided, niets (3) even groot als de grootste richting (3): de kaart zet ze
# tegenover elkaar. De veranderstemmen samen (5) zijn meer dan de niets-groep:
# precies waarom de zin met de grootste ENKELE richting vergelijkt.
NIETS_EVEN_GROOT = {"wld_scope": 3, "wld_planning": 2, "wld_none": 3}
NIETS_GROTER = {"wld_scope": 3, "wld_planning": 2, "wld_none": 4}


@pytest.mark.parametrize("scan", ["retention", "exit"])
def test_markeringsregel_krijgt_zin_bij_niets_even_groot(scan):
    top = _rank(NIETS_EVEN_GROOT, scan=scan)[0]
    assert top["key"] == "workload"
    assert top["decided_by"]["kind"] == "direction"
    assert dp.direction_none_at_least_top_shown(
        dp.direction_state(_agg(NIETS_EVEN_GROOT), "workload", 6.0))
    assert top["direction_niets_feiten"] == {"none_n": 3, "n": 8, "change_top_n": 3}
    assert top["tie_break_note"] == (
        "Staat hoger dan Groeiperspectief omdat hier meer mensen om verandering "
        "vragen (5 van de 8 tegen 1 van de 8). Tegelijk kozen hier 3 van de 8 "
        f"‘{NIETS[scan]}’, evenveel als de grootste richting.")


@pytest.mark.parametrize("scan", ["retention", "exit"])
def test_markeringsregel_krijgt_zin_bij_niets_groter(scan):
    top = _rank(NIETS_GROTER, scan=scan)[0]
    assert top["decided_by"]["kind"] == "direction"
    assert top["direction_niets_feiten"] == {"none_n": 4, "n": 9, "change_top_n": 3}
    assert top["tie_break_note"] == (
        "Staat hoger dan Groeiperspectief omdat hier meer mensen om verandering "
        "vragen (5 van de 9 tegen 1 van de 8). Tegelijk kozen hier 4 van de 9 "
        f"‘{NIETS[scan]}’, meer dan de grootste richting (3).")


@pytest.mark.parametrize("scan", ["retention", "exit"])
def test_markeringsregel_ongewijzigd_bij_een_duidelijke_richting(scan):
    # Niets (1) kleiner dan de grootste richting (5): clear, geen extra zin.
    top = _rank({"wld_scope": 5, "wld_planning": 2, "wld_none": 1}, scan=scan)[0]
    assert top["decided_by"]["kind"] == "direction"
    assert top["tie_break_note"] == (
        "Staat hoger dan Groeiperspectief omdat hier meer mensen om verandering "
        "vragen (7 van de 8 tegen 1 van de 8).")
    assert top["direction_niets_feiten"] is None


def test_markeringsregel_ongewijzigd_bij_een_richting_van_een_stem():
    # Dezelfde ondergrens als de kaart (DIRECTION_NONE_TOP_COUNTS_MIN): bij een
    # grootste richting van een stem blijft de gewone verdeeld-tekst staan.
    assert DIRECTION_NONE_TOP_COUNTS_MIN == 2
    counts = {"wld_scope": 1, "wld_planning": 1, "wld_peaks": 1,
              "wld_recovery": 1, "wld_none": 4}
    top = _rank(counts)[0]
    assert top["decided_by"]["kind"] == "direction"
    st = dp.direction_state(_agg(counts), "workload", 6.0)
    assert st["none_at_least_top"] is True and st["change_top_n"] == 1
    assert not dp.direction_none_at_least_top_shown(st)
    assert "Tegelijk" not in top["tie_break_note"]
    assert top["direction_niets_feiten"] is None


def test_markeringsregel_ongewijzigd_bij_split_none():
    # Onder DIRECTION_SPLIT_NONE_MAX_SCORE is dit split_none, niet de
    # verdeeld-staat van de kaart: daar hoort de extra zin niet bij.
    score = DIRECTION_SPLIT_NONE_MAX_SCORE - 0.5
    top = _rank(NIETS_EVEN_GROOT, score=score)[0]
    assert top["decided_by"]["kind"] == "direction"
    assert dp.direction_state(_agg(NIETS_EVEN_GROOT), "workload", score)["state"] == "split_none"
    assert "Tegelijk" not in top["tie_break_note"]
    assert top["direction_niets_feiten"] is None


def test_poort_gebruikt_de_getoonde_score():
    # 4.96 staat als 5.0 op de pagina: de kaart rekent op 5.0 (geen split_none,
    # dus de verdeeld-staat met niets minstens even groot). De markeringsregel
    # moet dezelfde staat zien, niet split_none op de rauwe 4.96.
    top = _rank(NIETS_EVEN_GROOT, score=4.96)[0]
    assert top["decided_by"]["kind"] == "direction"
    assert top["direction_niets_feiten"] == {"none_n": 3, "n": 8, "change_top_n": 3}
    assert "Tegelijk kozen hier 3 van de 8" in top["tie_break_note"]


def test_rij_zonder_richting_tie_break_heeft_geen_niets_feiten():
    rows = _rank(NIETS_EVEN_GROOT)
    assert rows[1]["decided_by"] is None
    assert rows[1]["direction_niets_feiten"] is None


# ---------------------------------------------------------------- A7, pagina twee

def _zin(**kw):
    basis = dict(tie_break_kind="direction", change=(5, 8),
                 change_other=("Groeiperspectief", 1, 8), next_delta=0.0,
                 direction_state_key=None, primary_is_lowest=True)
    basis.update(kw)
    return _p02_startpunt_zin("Werkdruk", **basis)


def test_startpuntzin_heeft_geen_niets_zin_meer():
    # Fixronde 14-10, punt 7: de parameter is weg, zodat geen aanroep de zin
    # per ongeluk terugbrengt.
    with pytest.raises(TypeError):
        _zin(niets_feiten={"none_n": 3, "n": 8, "change_top_n": 3}, scan_type="retention")
    assert _zin() == ("Als startpunt kiest Loep Werkdruk: daar vragen meer mensen om "
                      "verandering dan bij Groeiperspectief (5 van de 8 tegen 1 van de 8).")
    assert _zin(indicatief=True) == (
        "Als mogelijk startpunt kiest Loep Werkdruk: daar vragen meer mensen om "
        "verandering dan bij Groeiperspectief (5 van de 8 tegen 1 van de 8).")


# Vlak profiel zonder kwetsbaar onderwerp: de vlak-tak van de kernzin sluit af
# met de startpuntzin. (De tak "Geen onderwerp scoort kwetsbaar." noemt het
# startpunt zonder grond, en onder de 5,0 wordt de kaart split_none.)
AVGS = {"leadership": 6.6, "culture": 6.8, "growth": 6.0,
        "compensation": 6.5, "workload": 6.0, "role_clarity": 6.7}


def _rank_volledig(workload_counts, scan):
    direction = {"workload": _agg(workload_counts),
                 "growth": _agg({"grd_visibility": 1, "grd_none": 7})}
    labels = {fk: _fl(fk, scan) for fk in ORG_FACTOR_KEYS}
    return rank_factors(scan, AVGS, {}, {}, labels=labels, direction_agg=direction), labels


def _opening(rows, labels, scan):
    tk, chg, chg_other, delta = _p02_startpunt_gronden(rows)
    return _p02_opening(scan_type=scan, shape=profile_shape(AVGS), labels=labels,
                        primary_key="workload", tie_break_kind=tk, change=chg,
                        change_other=chg_other, next_delta=delta)


@pytest.mark.parametrize("scan", ["retention", "exit"])
def test_pagina_twee_van_rangorde_tot_kernzin(scan):
    # De rij draagt de niets-tellingen (de markeringsregel gebruikt ze), maar
    # pagina twee noemt ze niet meer (fixronde 14-10, punt 7).
    rows, labels = _rank_volledig(NIETS_EVEN_GROOT, scan)
    assert rows[0]["key"] == "workload"
    assert rows[0]["direction_niets_feiten"] == {"none_n": 3, "n": 8, "change_top_n": 3}
    assert "Tegelijk kozen" in rows[0]["tie_break_note"]
    zin = _opening(rows, labels, scan)
    assert zin.endswith("(5 van de 8 tegen 1 van de 8).")
    assert "Tegelijk" not in zin and NIETS[scan] not in zin


@pytest.mark.parametrize("scan", ["retention", "exit"])
def test_pagina_twee_ongewijzigd_bij_duidelijke_richting(scan):
    rows, labels = _rank_volledig({"wld_scope": 5, "wld_planning": 2, "wld_none": 1}, scan)
    assert rows[0]["key"] == "workload"
    assert rows[0]["direction_niets_feiten"] is None
    zin = _opening(rows, labels, scan)
    assert zin.endswith("(7 van de 8 tegen 1 van de 8).")
    assert "Tegelijk" not in zin


@pytest.mark.parametrize("scan", ["retention", "exit"])
def test_zin_zonder_streepjes(scan):
    note = _rank(NIETS_EVEN_GROOT, scan=scan)[0]["tie_break_note"]
    assert "–" not in note and "—" not in note


def test_niets_tekst_is_dezelfde_als_de_respondentoptie_bij_elk_onderwerp():
    # Eén bron: de zin citeert precies wat de respondent zag.
    assert dp.DIRECTION_NONE_TEXT == NIETS
    for fk in dp.DIRECTION_SETS:
        for scan in ("retention", "exit"):
            texts = dp.direction_option_texts(scan, fk)
            nones = [t for k, t in texts.items() if k.endswith("_none")]
            assert nones == [NIETS[scan]], (fk, scan)


# ---------------------------------------------------------------- A7, volledige render

# Twaalf respondenten in beide fixtures: de laagste-onderwerptellingen (8 + 4)
# mogen dat niet overschrijden. Werkdruk wint het gelijkspel op richting
# (5 van de 8 tegen 1 van de 4) met niets even groot als de grootste richting.
RENDER_DIR = {"workload": _agg(NIETS_EVEN_GROOT),
              "growth": _agg({"grd_visibility": 1, "grd_none": 3})}


def _retention_html():
    data = _min_retention_data()
    data["factor_avgs"] = {"workload": 6.0, "growth": 6.0}
    data["top_risks"] = [("workload", 6.0), ("growth", 6.0)]
    data["org_item_avgs"] = {"W1": 6.0, "G1": 6.0}
    data["direction_agg"] = RENDER_DIR
    return render_retention_report_html(data)


def _exit_html():
    return render_exit_report_html(exit_report_data(
        factor_avgs={"workload": 6.0, "growth": 6.0},
        factor_items_map={"workload": [("W1", "Testvraag werkdruk")],
                          "growth": [("G1", "Testvraag groei")]},
        direction_agg=RENDER_DIR))


@pytest.mark.parametrize("scan,html_fn", [("retention", _retention_html), ("exit", _exit_html)],
                         ids=["retention", "exit"])
def test_volledige_render_toont_de_zin_alleen_onder_de_rasterrij(scan, html_fn):
    # Fixronde 14-10, punt 7: pagina twee zonder de niets-zin, de
    # markeringsregel onder de rij van de ranglijst houdt hem.
    html = html_fn()
    label = _fl("workload", scan)
    p02 = (f"Als startpunt kiest Loep {label}: daar vragen meer mensen om verandering "
           f"dan bij Groeiperspectief (5 van de 8 tegen 1 van de 4).")
    assert p02 in html
    assert p02 + " Tegelijk" not in html
    assert f"Tegelijk kozen bij {label}" not in html
    assert html.count("Tegelijk kozen") == 1
    notes = re.findall(r'<tr class="r-note"><td colspan="\d+">(.*?)</td></tr>', html, re.S)
    assert notes == [
        "Staat hoger dan Groeiperspectief omdat hier meer mensen om verandering vragen "
        f"(5 van de 8 tegen 1 van de 4). Tegelijk kozen hier 3 van de 8 ‘{NIETS[scan]}’, "
        "evenveel als de grootste richting."]


def test_niets_tekst_is_onveranderbaar():
    # Fixronde 14-10, punt 12: een bevroren vorm voorkomt dat iemand per
    # ongeluk de niets-tekst van een scan overschrijft. Lezen blijft gelijk.
    with pytest.raises(TypeError):
        dp.DIRECTION_NONE_TEXT["retention"] = "iets anders"
    with pytest.raises(AttributeError):
        dp.DIRECTION_NONE_TEXT.pop("exit")
    assert dict(dp.DIRECTION_NONE_TEXT) == NIETS
    # De respondentoptie krijgt een eigen, gewone kopie.
    texts = dp.direction_option_texts("retention", "workload")
    assert NIETS["retention"] in texts.values()

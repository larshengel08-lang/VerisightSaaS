"""Beslisronde na de polijstronde, taak 1 (besluiten Lars 12-10).

A1: de werkvraagvariant none_at_least_top is goedgekeurd (geen CONCEPT-markering
meer) en "Beide kan kloppen" wordt "Beide kunnen kloppen", in die variant en in
split_none.

A7: wint een onderwerp het gelijkspel op de vraag om verandering terwijl de
richtingkaart van datzelfde onderwerp de verdeeld-staat toont met een
niets-groep die minstens zo groot is als de grootste richting, dan lazen
pagina twee en de markeringsregel onder de rasterrij als een tegenspraak met die
kaart. Daar komt een halve zin achter, met dezelfde poort als de kaart
(direction_none_at_least_top_shown op direction_state met de getoonde score).
In elke andere staat verandert er niets.

Synthetische invoer met echte optiesleutels: de halve zin citeert de niets-tekst
van de scan via direction_option_texts.
"""
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
    _p02_niets_even_groot,
    _p02_opening,
    _p02_startpunt_gronden,
    _p02_startpunt_zin,
    profile_shape,
)
from backend.report_priority import rank_factors
from backend.scoring_config import ORG_FACTOR_KEYS

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
# tegenover elkaar.
NIETS_EVEN_GROOT = {"wld_scope": 3, "wld_planning": 2, "wld_none": 3}
NIETS_GROTER = {"wld_scope": 3, "wld_planning": 2, "wld_none": 4}


@pytest.mark.parametrize("scan", ["retention", "exit"])
@pytest.mark.parametrize("counts", [NIETS_EVEN_GROOT, NIETS_GROTER],
                         ids=["even_groot", "groter"])
def test_markeringsregel_krijgt_halve_zin_bij_niets_minstens_even_groot(scan, counts):
    rows = _rank(counts, scan=scan)
    top = rows[0]
    assert top["key"] == "workload"
    assert top["decided_by"]["kind"] == "direction"
    st = dp.direction_state(_agg(counts), "workload", 6.0)
    assert dp.direction_none_at_least_top_shown(st)
    n = sum(counts.values())
    change = n - counts["wld_none"]
    assert top["tie_break_note"] == (
        f"Staat hoger dan Groeiperspectief omdat hier meer mensen om verandering "
        f"vragen ({change} van de {n} tegen 1 van de 8), al kiest hier een even "
        f"grote of grotere groep ‘{NIETS[scan]}’.")
    assert top["direction_niets_even_groot"] == NIETS[scan]


@pytest.mark.parametrize("scan", ["retention", "exit"])
def test_markeringsregel_ongewijzigd_bij_een_duidelijke_richting(scan):
    # Niets (1) kleiner dan de grootste richting (5): clear, geen halve zin.
    rows = _rank({"wld_scope": 5, "wld_planning": 2, "wld_none": 1}, scan=scan)
    top = rows[0]
    assert top["decided_by"]["kind"] == "direction"
    assert top["tie_break_note"] == (
        "Staat hoger dan Groeiperspectief omdat hier meer mensen om verandering "
        "vragen (7 van de 8 tegen 1 van de 8).")
    assert top["direction_niets_even_groot"] is None


def test_markeringsregel_ongewijzigd_bij_een_richting_van_een_stem():
    # Dezelfde ondergrens als de kaart (DIRECTION_NONE_TOP_COUNTS_MIN): bij een
    # grootste richting van een stem blijft de gewone verdeeld-tekst staan.
    assert DIRECTION_NONE_TOP_COUNTS_MIN == 2
    counts = {"wld_scope": 1, "wld_planning": 1, "wld_peaks": 1,
              "wld_recovery": 1, "wld_none": 4}
    rows = _rank(counts)
    top = rows[0]
    assert top["decided_by"]["kind"] == "direction"
    st = dp.direction_state(_agg(counts), "workload", 6.0)
    assert st["none_at_least_top"] is True and st["change_top_n"] == 1
    assert not dp.direction_none_at_least_top_shown(st)
    assert "al kiest" not in top["tie_break_note"]
    assert top["direction_niets_even_groot"] is None


def test_markeringsregel_ongewijzigd_bij_split_none():
    # Onder DIRECTION_SPLIT_NONE_MAX_SCORE is dit split_none, niet de
    # verdeeld-staat van de kaart: daar hoort de halve zin niet bij.
    score = DIRECTION_SPLIT_NONE_MAX_SCORE - 0.5
    rows = _rank(NIETS_EVEN_GROOT, score=score)
    top = rows[0]
    assert top["decided_by"]["kind"] == "direction"
    assert dp.direction_state(_agg(NIETS_EVEN_GROOT), "workload", score)["state"] == "split_none"
    assert "al kiest" not in top["tie_break_note"]
    assert top["direction_niets_even_groot"] is None


def test_poort_gebruikt_de_getoonde_score():
    # 4.96 staat als 5.0 op de pagina: de kaart rekent op 5.0 (geen split_none,
    # dus de verdeeld-staat met niets minstens even groot). De markeringsregel
    # moet dezelfde staat zien, niet split_none op de rauwe 4.96.
    rows = _rank(NIETS_EVEN_GROOT, score=4.96)
    top = rows[0]
    assert top["decided_by"]["kind"] == "direction"
    assert top["direction_niets_even_groot"] == NIETS["retention"]
    assert "al kiest hier" in top["tie_break_note"]


def test_rij_zonder_richting_tie_break_heeft_geen_niets_veld_waarde():
    rows = _rank(NIETS_EVEN_GROOT)
    assert rows[1]["decided_by"] is None
    assert rows[1]["direction_niets_even_groot"] is None


# ---------------------------------------------------------------- A7, pagina twee

def test_startpuntzin_krijgt_halve_zin_met_niets_tekst():
    zin = _p02_startpunt_zin(
        "Werkdruk", tie_break_kind="direction", change=(5, 8),
        change_other=("Groeiperspectief", 1, 8), next_delta=0.0,
        direction_state_key=None, primary_is_lowest=True,
        niets_tekst=NIETS["retention"])
    assert zin == ("Als startpunt kiest Loep Werkdruk: daar vragen meer mensen om "
                   "verandering dan bij Groeiperspectief (5 van de 8 tegen 1 van de 8), "
                   "al kiest daar een even grote of grotere groep "
                   "‘Niets, dit zit hier goed’.")


def test_startpuntzin_ongewijzigd_zonder_niets_tekst():
    zin = _p02_startpunt_zin(
        "Werkdruk", tie_break_kind="direction", change=(5, 8),
        change_other=("Groeiperspectief", 1, 8), next_delta=0.0,
        direction_state_key=None, primary_is_lowest=True)
    assert zin == ("Als startpunt kiest Loep Werkdruk: daar vragen meer mensen om "
                   "verandering dan bij Groeiperspectief (5 van de 8 tegen 1 van de 8).")


def test_startpuntzin_negeert_niets_tekst_buiten_de_richtingtak():
    # De halve zin hoort alleen bij de zin die de vraag om verandering noemt.
    zin = _p02_startpunt_zin(
        "Werkdruk", tie_break_kind="spread", change=None, change_other=None,
        next_delta=0.0, direction_state_key=None, primary_is_lowest=True,
        niets_tekst=NIETS["retention"])
    assert "al kiest" not in zin


def test_startpuntzin_indicatief_houdt_de_halve_zin():
    zin = _p02_startpunt_zin(
        "Werkdruk", tie_break_kind="direction", change=(5, 8),
        change_other=("Groeiperspectief", 1, 8), next_delta=0.0,
        direction_state_key=None, primary_is_lowest=True, indicatief=True,
        niets_tekst=NIETS["exit"])
    assert zin.startswith("Als mogelijk startpunt kiest Loep Werkdruk:")
    assert zin.endswith(", al kiest daar een even grote of grotere groep "
                        "‘Niets, dit zat hier goed’.")


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


@pytest.mark.parametrize("scan", ["retention", "exit"])
def test_pagina_twee_van_rangorde_tot_kernzin(scan):
    rows, labels = _rank_volledig(NIETS_EVEN_GROOT, scan)
    assert rows[0]["key"] == "workload"
    tk, chg, chg_other, delta = _p02_startpunt_gronden(rows)
    niets = _p02_niets_even_groot(rows)
    assert niets == NIETS[scan]
    zin = _p02_opening(scan_type=scan, shape=profile_shape(AVGS), labels=labels,
                       primary_key="workload", tie_break_kind=tk, change=chg,
                       change_other=chg_other, next_delta=delta, niets_tekst=niets)
    assert (f"(5 van de 8 tegen 1 van de 8), al kiest daar een even grote of "
            f"grotere groep ‘{NIETS[scan]}’.") in zin


@pytest.mark.parametrize("scan", ["retention", "exit"])
def test_pagina_twee_ongewijzigd_bij_duidelijke_richting(scan):
    rows, labels = _rank_volledig({"wld_scope": 5, "wld_planning": 2, "wld_none": 1}, scan)
    assert rows[0]["key"] == "workload"
    assert _p02_niets_even_groot(rows) is None
    tk, chg, chg_other, delta = _p02_startpunt_gronden(rows)
    zin = _p02_opening(scan_type=scan, shape=profile_shape(AVGS), labels=labels,
                       primary_key="workload", tie_break_kind=tk, change=chg,
                       change_other=chg_other, next_delta=delta,
                       niets_tekst=_p02_niets_even_groot(rows))
    assert "(7 van de 8 tegen 1 van de 8)." in zin
    assert "al kiest" not in zin


def test_niets_even_groot_leeg_zonder_rijen():
    assert _p02_niets_even_groot([]) is None


@pytest.mark.parametrize("scan", ["retention", "exit"])
def test_halve_zin_zonder_streepjes(scan):
    rows = _rank(NIETS_EVEN_GROOT, scan=scan)
    note = rows[0]["tie_break_note"]
    assert "–" not in note and "—" not in note


def test_niets_tekst_is_dezelfde_als_de_respondentoptie_bij_elk_onderwerp():
    # Eén bron: de halve zin citeert precies wat de respondent zag.
    assert dp.DIRECTION_NONE_TEXT == NIETS
    for fk in dp.DIRECTION_SETS:
        for scan in ("retention", "exit"):
            texts = dp.direction_option_texts(scan, fk)
            nones = [t for k, t in texts.items() if k.endswith("_none")]
            assert nones == [NIETS[scan]], (fk, scan)

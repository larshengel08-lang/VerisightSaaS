"""Staten plurality en split_none (spec ronde 2 par. 4).

Fixtures gebruiken de echte richting-optiesleutels (`grd_*` uit DIRECTION_SETS),
niet de verdiepingssleutels (`gr_*`): direction_state kijkt alleen naar de
achtervoegsels `_none` en `_other`, maar een verzonnen sleutel verbergt of de
staat ook met echte content klopt.
"""
import pytest

from backend.products.shared.deepening import (
    DIRECTION_PLURALITY_MIN_SHARE,
    DIRECTION_SPLIT_NONE_MAX_SCORE,
    direction_option_texts,
    direction_state,
)


def _agg(counts, answered=None):
    n = answered if answered is not None else sum(counts.values())
    return {"lowest_n": n, "offered": n, "answered": n, "skipped": 0, "counts": counts}


def test_drempels_zijn_benoemde_constanten():
    assert DIRECTION_PLURALITY_MIN_SHARE == 0.35
    assert DIRECTION_SPLIT_NONE_MAX_SCORE == 5.0


def test_kwetsbaar_grens_is_gelijk_aan_zone_low():
    """deepening.py is de contentlaag en importeert ZONE_LOW bewust niet (dat
    zou de afhankelijkheidsrichting omdraaien), dus de waarde staat twee keer.
    Deze test pint ze aan elkaar: zonder haar kan er stil een tweede
    kwetsbaar-definitie ontstaan."""
    from backend.report_distribution import ZONE_LOW
    assert DIRECTION_SPLIT_NONE_MAX_SCORE == ZONE_LOW


def test_fixturesleutels_bestaan_echt():
    """Valt om zodra een test hieronder een sleutel gebruikt die niet in de
    richtingset van deze factor zit (bijvoorbeeld een verdiepingssleutel)."""
    texts = direction_option_texts("retention", "growth")
    for key in ("grd_visibility", "grd_none", "grd_conversation", "grd_criteria",
                "grd_time", "grd_other"):
        assert key in texts


def test_scenario_11_grootste_groep_zonder_meerderheid():
    # Spec 2026-10-07 par. 3: niets telt niet mee; was plurality.
    # 27 van de 62 (44%) op alle beantwoorders, maar de 15 niets-stemmen kiezen
    # geen route: change_n = 62 - 15 = 47, en 27 van de 47 (57%) met een
    # voorsprong van 27 - 10 = 17 op de tweede veranderoptie is een meerderheid.
    agg = _agg({"grd_visibility": 27, "grd_none": 15, "grd_conversation": 10,
                "grd_criteria": 6, "grd_time": 4}, answered=62)
    st = direction_state(agg, "growth", factor_score=5.2)
    assert st["state"] == "clear"
    assert st["top_key"] == "grd_visibility"
    assert st["top_n"] == 27
    assert st["change_n"] == 47
    # second_n is de tweede VERANDEROPTIE (gesprek, 10), niet de niets-optie (15).
    assert st["second_n"] == 10
    assert st["none_n"] == 15


def test_plurality_heeft_nooit_een_meerderheid():
    """De kop zegt "zonder meerderheid"; bij >= 50% hoort clear te vuren."""
    agg = _agg({"grd_visibility": 5, "grd_none": 2, "grd_time": 1})
    st = direction_state(agg, "growth", factor_score=5.2)
    assert st["state"] == "clear"
    assert st["top_n"] / st["n"] >= 0.5


def test_plurality_vereist_de_share_en_de_voorsprong():
    # Spec 2026-10-07 par. 3: niets telt niet mee; was divided.
    # 30 van de 100, maar change_n = 75: 30/75 = 0,4 >= 0,35, voorsprong 30-25 = 5.
    agg = _agg({"grd_visibility": 30, "grd_none": 25, "grd_conversation": 25,
                "grd_time": 20})
    assert direction_state(agg, "growth", factor_score=5.2)["state"] == "plurality"
    # Net boven de share, zelfde voorsprong: plurality (36/75 = 0,48, voorsprong 11).
    agg = _agg({"grd_visibility": 36, "grd_none": 25, "grd_conversation": 25,
                "grd_time": 14})
    assert direction_state(agg, "growth", factor_score=5.2)["state"] == "plurality"
    # Spec 2026-10-07 par. 3: niets telt niet mee; was divided.
    # De voorsprong van 1 lag op de niets-optie; op de veranderopties is het
    # 10 van 16 (0,625) met voorsprong 4 op gesprek: clear.
    agg = _agg({"grd_visibility": 10, "grd_none": 9, "grd_conversation": 6})
    assert direction_state(agg, "growth", factor_score=5.2)["state"] == "clear"
    # Spec 2026-10-07 par. 3: niets telt niet mee; was plurality.
    # 11 van 17 (0,65) met voorsprong 5 op gesprek: clear.
    agg = _agg({"grd_visibility": 11, "grd_none": 9, "grd_conversation": 6})
    assert direction_state(agg, "growth", factor_score=5.2)["state"] == "clear"

    # Dezelfde vier grenzen, nu op de inhoudelijke stemmen (change_n), met
    # telkens 10 of 5 niets-stemmen die de noemer niet mogen raken.
    # 30% van change_n haalt de share niet, ook al is de voorsprong ruim:
    # change_n = 100, 30/100 = 0,30 < 0,35.
    agg = _agg({"grd_visibility": 30, "grd_conversation": 25, "grd_time": 25,
                "grd_criteria": 20, "grd_none": 10})
    assert direction_state(agg, "growth", factor_score=5.2)["state"] == "divided"
    # Net boven de share: 36/100 = 0,36, voorsprong 11: plurality.
    agg = _agg({"grd_visibility": 36, "grd_conversation": 25, "grd_time": 25,
                "grd_criteria": 14, "grd_none": 10})
    assert direction_state(agg, "growth", factor_score=5.2)["state"] == "plurality"
    # Wel de share (10/25 = 0,4), maar voorsprong 1 op de tweede veranderoptie.
    agg = _agg({"grd_visibility": 10, "grd_conversation": 9, "grd_time": 6,
                "grd_none": 5})
    assert direction_state(agg, "growth", factor_score=5.2)["state"] == "divided"
    # Wel de share (11/26 = 0,42) en voorsprong 2: kantelt naar plurality.
    agg = _agg({"grd_visibility": 11, "grd_conversation": 9, "grd_time": 6,
                "grd_none": 5})
    assert direction_state(agg, "growth", factor_score=5.2)["state"] == "plurality"


def test_plurality_share_grens_is_inclusief_en_exact():
    """Precies op DIRECTION_PLURALITY_MIN_SHARE telt mee, een haartje eronder
    niet. Zonder deze twee kan de vergelijking van >= naar > verschuiven zonder
    dat iets rood wordt (alle andere nieuwe grenzen zijn wel exact gepind)."""
    op_de_grens = _agg({"grd_visibility": 7, "grd_none": 5, "grd_conversation": 4,
                        "grd_time": 4})  # 7 van 20 = exact 0,35, voorsprong 2
    st = direction_state(op_de_grens, "growth", 5.2)
    assert st["top_n"] / st["n"] == DIRECTION_PLURALITY_MIN_SHARE
    assert st["state"] == "plurality"
    eronder = _agg({"grd_visibility": 17, "grd_none": 15, "grd_conversation": 9,
                    "grd_time": 9})  # 17 van 50 = 0,34, zelfde voorsprong
    st = direction_state(eronder, "growth", 5.2)
    assert st["top_n"] / st["n"] < DIRECTION_PLURALITY_MIN_SHARE
    # Spec 2026-10-07 par. 3: niets telt niet mee; was divided.
    # Op de inhoudelijke stemmen is het 17 van 35 = 0,49, voorsprong 8.
    assert st["state"] == "plurality"

    # De grens zelf ligt nu op change_n; hier opnieuw exact gepind, met
    # niets-stemmen erbij die de noemer niet mogen raken.
    op_de_grens = _agg({"grd_visibility": 7, "grd_conversation": 5, "grd_time": 4,
                        "grd_criteria": 4, "grd_none": 3})  # 7 van 20 = exact 0,35, voorsprong 2
    st = direction_state(op_de_grens, "growth", 5.2)
    assert st["change_n"] == 20
    assert st["top_n"] / st["change_n"] == DIRECTION_PLURALITY_MIN_SHARE
    assert st["state"] == "plurality"
    eronder = _agg({"grd_visibility": 17, "grd_conversation": 15, "grd_time": 9,
                    "grd_criteria": 9, "grd_none": 5})  # 17 van 50 = 0,34, voorsprong 2
    st = direction_state(eronder, "growth", 5.2)
    assert st["change_n"] == 50
    assert st["top_n"] / st["change_n"] < DIRECTION_PLURALITY_MIN_SHARE
    assert st["state"] == "divided"


def test_split_none_zet_second_n_expliciet_op_nul():
    """In deze staat dragen none_n en top_n de bevinding; "de tweede optie"
    heeft geen betekenis. De waarde uit de basis wees na het overschrijven van
    top_key naar de rij die daarvoor tweede was, en dat kan top_key zelf zijn.
    """
    st = direction_state(_agg({"grd_none": 14, "grd_visibility": 14,
                               "grd_conversation": 3}), "growth", 4.5)
    assert st["state"] == "split_none"
    assert st["second_n"] == 0


def test_scenario_13_verdeeld_over_wel_of_niets_op_een_lage_factor():
    # 14 niets tegenover 14 verandering op een factor die 4,5 scoort.
    agg = _agg({"grd_none": 14, "grd_visibility": 14, "grd_conversation": 3})
    st = direction_state(agg, "growth", factor_score=4.5)
    assert st["state"] == "split_none"
    assert st["none_n"] == 14
    assert st["none_key"] == "grd_none"
    assert st["top_key"] == "grd_visibility"
    assert st["top_n"] == 14


def test_split_none_alleen_op_een_kwetsbare_factor():
    agg = _agg({"grd_none": 14, "grd_visibility": 14, "grd_conversation": 3})
    # Zelfde verdeling, factor scoort 6,2: geen split_none.
    assert direction_state(agg, "growth", factor_score=6.2)["state"] != "split_none"
    # Precies op de grens telt niet als kwetsbaar (strikt kleiner dan).
    assert direction_state(agg, "growth",
                           factor_score=DIRECTION_SPLIT_NONE_MAX_SCORE)["state"] != "split_none"


def test_split_none_ook_bij_een_verschil_van_een():
    # "grootste of gedeeld-grootste": niets mag er een achter liggen.
    agg = _agg({"grd_none": 13, "grd_visibility": 14, "grd_conversation": 3})
    assert direction_state(agg, "growth", factor_score=4.5)["state"] == "split_none"
    agg = _agg({"grd_none": 12, "grd_visibility": 14, "grd_conversation": 3})
    assert direction_state(agg, "growth", factor_score=4.5)["state"] != "split_none"


def test_split_none_ook_als_niets_ruim_voorligt():
    """Niets kan de grootste keuze zijn zonder meerderheid: nog steeds verdeeld."""
    agg = _agg({"grd_none": 10, "grd_visibility": 4, "grd_conversation": 3}, answered=25)
    st = direction_state(agg, "growth", factor_score=4.5)
    assert st["state"] == "split_none"
    assert (st["none_n"], st["top_n"]) == (10, 4)


def test_split_none_niet_zonder_niets_optie():
    agg = _agg({"grd_visibility": 4, "grd_conversation": 3, "grd_time": 3})
    assert direction_state(agg, "growth", factor_score=4.5)["state"] == "divided"


def test_bestaande_staten_blijven_voorgaan():
    # too_few
    assert direction_state(_agg({"grd_visibility": 2}), "growth",
                           factor_score=4.0)["state"] == "too_few"
    # none_needed (strikte meerderheid) gaat voor split_none
    agg = _agg({"grd_none": 9, "grd_visibility": 4})
    assert direction_state(agg, "growth", factor_score=4.0)["state"] == "none_needed"
    # clear gaat voor plurality
    agg = _agg({"grd_visibility": 9, "grd_conversation": 2, "grd_none": 2})
    assert direction_state(agg, "growth", factor_score=4.0)["state"] == "clear"


def test_anders_wordt_nooit_een_richting():
    """*_other heeft geen opdrachtvorm; die mag nooit als richting gepresenteerd."""
    agg = _agg({"grd_other": 20, "grd_none": 10, "grd_visibility": 8})
    assert direction_state(agg, "growth", factor_score=5.5)["state"] == "divided"
    # Ook niet als tegenhanger van de niets-groep op een lage factor.
    agg = _agg({"grd_none": 10, "grd_other": 10, "grd_visibility": 3})
    assert direction_state(agg, "growth", factor_score=4.5)["state"] == "divided"


def test_factor_score_is_verplicht():
    """Een vergeten score leverde stil een andere klantzin op: geen fout, geen
    log, geen rode test. Daarom geen default meer."""
    with pytest.raises(TypeError):
        direction_state(_agg({"grd_visibility": 9, "grd_conversation": 2}), "growth")


def test_onbekende_score_geldt_nooit_als_kwetsbaar():
    agg = _agg({"grd_none": 14, "grd_visibility": 14, "grd_conversation": 3})
    # Spec 2026-10-07 par. 3: niets telt niet mee; was divided.
    # Geen split_none (onbekend is niet kwetsbaar); op de inhoudelijke stemmen
    # is het 14 van 17 met voorsprong 11 op gesprek: clear.
    st = direction_state(agg, "growth", None)
    assert st["state"] != "split_none"
    assert st["state"] == "clear"


def test_lege_counts_boven_de_vloer_blijft_fail_loud():
    with pytest.raises(ValueError):
        direction_state(_agg({}, answered=8), "growth", factor_score=4.5)


def test_payload_heeft_altijd_dezelfde_vorm():
    for agg, score in ((_agg({"grd_visibility": 2}), 4.0),
                       (_agg({"grd_none": 14, "grd_visibility": 14}), 4.5),
                       (_agg({"grd_none": 9, "grd_visibility": 4}), 4.0),
                       (_agg({"grd_visibility": 9, "grd_conversation": 2}), 4.0),
                       (_agg({"grd_visibility": 3, "grd_none": 3}), 6.0),
                       (_agg({"grd_visibility": 27, "grd_none": 15}, answered=62), 5.2)):
        st = direction_state(agg, "growth", factor_score=score)
        for key in ("state", "n", "change_n", "ranked", "top_key", "top_n", "second_n",
                    "none_n", "none_key"):
            assert key in st, (st["state"], key)

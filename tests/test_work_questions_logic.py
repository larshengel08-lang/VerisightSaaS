"""Welke vertaalvraag hoort bij welke richtingstaat (plan 3b, spec 16-9 par. 6).

De echte vraagteksten zijn gated content (Taak 13) en staan hier niet: deze
tests zetten twee neutrale testvragen en twee neutrale varianten in de module.
Elke staat komt uit de echte direction_state, zodat de test breekt als de
staatlogica verschuift.

Amendement plan 3b Taak 13 (concept-sectie 7 punt 1): de verdeeld-zinnen zijn
sinds versie 2 vaste teksten zonder plaatshouders {a}/{b}; translation_question
citeert de routeteksten niet meer. De VARIANTEN-fixture hieronder heeft dus
geen accolades meer, en de tests die vroeger een citaat verwachtten, checken
nu de vaste zin.
"""
import pytest

from backend.products.shared import deepening as dp

VRAGEN = {
    "growth": {"grd_visibility": {"retention": "Testvraag zicht, nu?", "exit": "Testvraag zicht, toen?"}},
    "workload": {"wld_peaks": {"retention": "Testvraag pieken, nu?", "exit": "Testvraag pieken, toen?"}},
    "leadership": {"ldd_mandate": {"retention": "Testvraag mandaat, nu?", "exit": "Testvraag mandaat, toen?"},
                   "ldd_escalation": {"retention": "Testvraag escalatie, nu?", "exit": "Testvraag escalatie, toen?"}},
}
VARIANTEN = {
    "divided": {"retention": "Nu verdeeld, vaste zin?", "exit": "Toen verdeeld, vaste zin?"},
    "split_none": {"retention": "Nu vraagt een deel, vaste zin?", "exit": "Toen vroeg een deel, vaste zin?"},
}


@pytest.fixture()
def gevuld(monkeypatch):
    monkeypatch.setattr(dp, "WORK_QUESTIONS", VRAGEN)
    monkeypatch.setattr(dp, "WORK_QUESTION_VARIANTS", VARIANTEN)


def _agg(counts, answered=None):
    n = answered if answered is not None else sum(counts.values())
    return {"lowest_n": n, "offered": n, "answered": n, "skipped": 0, "counts": counts,
            "other_texts": []}


def _vraag(scan, fk, counts, score, answered=None):
    st = dp.direction_state(_agg(counts, answered), fk, score)
    return st["state"], dp.translation_question(scan, fk, st)


def test_clear_geeft_de_route_eigen_vraag(gevuld):
    staat, vraag = _vraag("retention", "growth", {"grd_visibility": 6, "grd_none": 1, "grd_time": 1}, 5.1)
    assert staat == "clear"
    assert vraag == "Testvraag zicht, nu?"


def test_scan_type_wordt_echt_gebruikt(gevuld):
    _staat, vraag = _vraag("exit", "growth", {"grd_visibility": 6, "grd_none": 1, "grd_time": 1}, 5.1)
    assert vraag == "Testvraag zicht, toen?"


def test_plurality_geeft_de_vraag_van_de_grootste_groep(gevuld):
    staat, vraag = _vraag("retention", "growth",
                          {"grd_visibility": 4, "grd_time": 2, "grd_none": 2, "grd_criteria": 2}, 6.0)
    assert staat == "plurality"
    assert vraag == "Testvraag zicht, nu?"


def test_divided_met_twee_routes_geeft_de_vaste_verdeeld_zin(gevuld):
    """Amendement Taak 13: geen citaat meer van de routeteksten, alleen de
    vaste zin voor deze staat en dit scan_type."""
    staat, vraag = _vraag("retention", "workload", {"wld_peaks": 3, "wld_scope": 3, "wld_none": 2}, 5.4)
    assert staat == "divided"
    assert vraag == VARIANTEN["divided"]["retention"]


def test_divided_gebruikt_voor_vertrek_de_vertrekvariant(gevuld):
    """Amendement Taak 13: de Vertrek-variant van de vaste zin, geen citaat."""
    staat, vraag = _vraag("exit", "leadership", {"ldd_mandate": 3, "ldd_escalation": 3, "ldd_none": 2}, 5.4)
    assert staat == "divided"
    assert vraag == VARIANTEN["divided"]["exit"]


def test_divided_met_anders_als_grootste_veranderoptie_geeft_geen_vraag(gevuld):
    staat, vraag = _vraag("retention", "workload", {"wld_other": 4, "wld_peaks": 2, "wld_none": 2}, 5.4)
    assert staat == "divided"
    assert vraag is None


def test_divided_zonder_tweede_inhoudelijke_route_geeft_geen_vraag(gevuld):
    staat, vraag = _vraag("retention", "workload", {"wld_peaks": 3, "wld_none": 3, "wld_other": 2}, 6.0)
    assert staat == "divided"
    assert vraag is None


def test_split_none_geeft_de_vaste_zin_zonder_citaat(gevuld):
    """Amendement Taak 13: geen citaat van de veranderroute meer, alleen de
    vaste zin voor deze staat en dit scan_type."""
    staat, vraag = _vraag("retention", "workload", {"wld_none": 4, "wld_peaks": 4}, 4.5)
    assert staat == "split_none"
    assert vraag == VARIANTEN["split_none"]["retention"]
    assert "Niets, dit zit hier goed" not in vraag


@pytest.mark.parametrize("counts,answered", [({"wld_none": 5, "wld_peaks": 2, "wld_scope": 1}, None),
                                              ({"wld_peaks": 2}, 2)])
def test_none_needed_en_too_few_geven_geen_vraag(gevuld, counts, answered):
    staat, vraag = _vraag("retention", "workload", counts, 5.4, answered)
    assert staat in ("none_needed", "too_few")
    assert vraag is None


def test_lege_set_geeft_geen_vraag_en_geen_fout(monkeypatch):
    """De stand voor de reviewgate: de content is er nog niet. Expliciet leeg
    gezet, zodat deze test ook na Taak 13 (gevulde set) blijft kloppen."""
    monkeypatch.setattr(dp, "WORK_QUESTIONS", {})
    monkeypatch.setattr(dp, "WORK_QUESTION_VARIANTS", {})
    assert dp.work_questions_ready() is False
    _staat, vraag = _vraag("retention", "growth", {"grd_visibility": 6, "grd_none": 1, "grd_time": 1}, 5.1)
    assert vraag is None


def test_gevulde_set_zonder_deze_route_faalt_luid(gevuld):
    with pytest.raises(KeyError, match="grd_time"):
        dp.work_question("retention", "growth", "grd_time")


def test_niets_en_anders_hebben_geen_vraag(gevuld):
    for sleutel in ("grd_none", "grd_other"):
        with pytest.raises(KeyError, match="geen inhoudelijke route"):
            dp.work_question("retention", "growth", sleutel)


def test_onbekend_scantype_en_onbekend_onderwerp_falen_luid(gevuld):
    with pytest.raises(ValueError, match="onboarding"):
        dp.work_question("onboarding", "growth", "grd_visibility")
    with pytest.raises(KeyError, match="onbekend onderwerp"):
        dp.work_question("retention", "bestaat_niet", "grd_visibility")
    with pytest.raises(ValueError, match="onboarding"):
        dp.translation_question("onboarding", "growth", {"state": "clear", "top_key": "grd_visibility"})


def test_onbekende_staat_faalt_luid(gevuld):
    with pytest.raises(ValueError, match="onbekende staat"):
        dp.translation_question("retention", "growth", {"state": "iets_nieuws", "ranked": []})

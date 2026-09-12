"""Vlak profiel op pagina twee (spec ronde 2 par. 2)."""
import pytest

from backend.report_html import _p02_flat_sentence, profile_shape
from backend.report_distribution import ZONE_LOW
from backend.report_priority import FLAT_PROFILE_SPAN

VLAK = {"leadership": 6.17, "culture": 6.33, "growth": 5.67,
        "compensation": 5.70, "workload": 6.05, "role_clarity": 6.20}
EEN_LAGE = {"leadership": 6.8, "culture": 7.2, "growth": 4.5,
            "compensation": 6.6, "workload": 7.0, "role_clarity": 7.5}
ALLES_HOOG = {"leadership": 7.9, "culture": 8.1, "growth": 7.8,
              "compensation": 8.0, "workload": 7.9, "role_clarity": 7.8}


def test_flat_profile_span_is_one_point():
    assert FLAT_PROFILE_SPAN == 1.0


def test_vlak_profiel_wordt_herkend():
    shape = profile_shape(VLAK)
    assert shape["flat"] is True
    assert shape["low_key"] == "growth"
    assert shape["high_key"] == "culture"
    assert shape["n_vulnerable"] == 0
    assert shape["n_factors"] == 6


def test_alles_hoog_is_ook_vlak():
    shape = profile_shape(ALLES_HOOG)
    assert shape["flat"] is True
    assert shape["n_vulnerable"] == 0


def test_een_lage_factor_is_niet_vlak():
    shape = profile_shape(EEN_LAGE)
    assert shape["flat"] is False
    assert shape["n_vulnerable"] == 1
    assert shape["low_key"] == "growth"


def test_span_grens_is_strikt_kleiner_dan_een_punt():
    # Exact 1.0 verschil is GEEN vlak profiel (strikt kleiner dan).
    assert profile_shape({"growth": 5.0, "culture": 6.0})["flat"] is False
    assert profile_shape({"growth": 5.0, "culture": 5.9})["flat"] is True


def test_span_wordt_afgerond_voor_de_grens():
    # 8.2 - 7.2 is in binaire drijvende komma 0.9999999999999991. Zonder
    # afronding zou dit profiel "niets springt eruit" heten terwijl het op de
    # pagina precies een punt spant.
    shape = profile_shape({"growth": 7.2, "culture": 8.2})
    assert shape["span"] == 1.0
    assert shape["flat"] is False


def test_kwetsbaar_telt_tegen_de_gedeelde_grens():
    # Dezelfde grens als de spreidingsstrook gebruikt, niet een eigen literal.
    assert ZONE_LOW == 5.0
    assert profile_shape({"growth": ZONE_LOW, "culture": 7.0})["n_vulnerable"] == 0
    assert profile_shape({"growth": ZONE_LOW - 0.1, "culture": 7.0})["n_vulnerable"] == 1


def test_kwetsbaar_telt_op_de_getoonde_score():
    # 4.96 toont als 5.0 en is dus GEEN kwetsbaar punt (B15-consistentie).
    assert profile_shape({"growth": 4.96, "culture": 7.0})["n_vulnerable"] == 0
    assert profile_shape({"growth": 4.94, "culture": 7.0})["n_vulnerable"] == 1


def test_gelijke_getoonde_score_volgt_de_echte_waarde():
    # 5.67 en 5.70 tonen allebei 5.7. De laagste is dan de factor die ook in de
    # ranglijst het laagst staat (die sorteert op de onafgeronde waarde), niet
    # de alfabetisch eerste. Anders kan p.02 een ander onderwerp "het laagst"
    # noemen dan het raster bovenaan zet.
    shape = profile_shape({"compensation": 5.70, "growth": 5.67})
    assert shape["low_key"] == "growth"
    assert shape["low_score"] == 5.7
    assert shape["high_key"] == "compensation"


def test_sdt_dimensies_tellen_niet_mee():
    shape = profile_shape({"growth": 6.0, "culture": 6.5, "autonomy": 2.0})
    assert shape["n_factors"] == 2
    assert shape["n_vulnerable"] == 0
    assert shape["low_key"] == "growth"


def test_lege_invoer_geeft_geen_vorm():
    shape = profile_shape({})
    assert shape["n_factors"] == 0
    assert shape["flat"] is False
    assert shape["low_key"] is None
    assert shape["factors_low_to_high"] == []


def test_factors_low_to_high_draagt_elke_factor_met_de_getoonde_score():
    # Taak 3 somt de kwetsbare onderwerpen op uit dit veld, zonder de invoer
    # opnieuw te filteren; het moet dus de getoonde scores dragen, laagst eerst.
    assert profile_shape(VLAK)["factors_low_to_high"] == [
        ("growth", 5.7), ("compensation", 5.7), ("workload", 6.0),
        ("leadership", 6.2), ("role_clarity", 6.2), ("culture", 6.3),
    ]


def test_vlakke_zin_noemt_laagste_en_hoogste_met_scores():
    zin = _p02_flat_sentence(profile_shape(VLAK),
                             {"growth": "Groeiperspectief",
                              "culture": "Cultuur en psychologische veiligheid"})
    assert zin == (
        "Geen enkel onderwerp springt eruit: alle zes liggen binnen één punt "
        "van elkaar (laagste Groeiperspectief 5.7/10, hoogste Cultuur en "
        "psychologische veiligheid 6.3/10). Dat is zelf de bevinding."
    )
    assert "—" not in zin


def test_vlakke_zin_volgt_de_drempelconstante(monkeypatch):
    # De zin claimt de drempel, dus hij komt uit de constante die hem stuurt.
    monkeypatch.setattr("backend.report_html.FLAT_PROFILE_SPAN", 1.5)
    zin = _p02_flat_sentence(profile_shape({"growth": 5.0, "culture": 6.2}),
                             {"growth": "Groeiperspectief", "culture": "Cultuur"})
    assert "binnen 1,5 punt van elkaar" in zin
    assert "één punt" not in zin


def test_vlakke_zin_telt_het_echte_aantal_factoren():
    zin = _p02_flat_sentence(profile_shape({"growth": 5.0, "culture": 5.5}),
                             {"growth": "Groeiperspectief", "culture": "Cultuur"})
    assert "alle twee liggen binnen één punt van elkaar" in zin
    assert "alle zes" not in zin


def test_vlakke_zin_weigert_een_niet_vlak_profiel():
    with pytest.raises(ValueError):
        _p02_flat_sentence(profile_shape(EEN_LAGE),
                           {"growth": "Groeiperspectief", "role_clarity": "Rolhelderheid"})


def test_vlakke_zin_faalt_hard_op_een_ontbrekend_label():
    # Fail Loud: een ontbrekend label is een bug, geen reden om de interne
    # factorsleutel in klantcopy te zetten.
    with pytest.raises(KeyError):
        _p02_flat_sentence(profile_shape(VLAK), {"growth": "Groeiperspectief"})

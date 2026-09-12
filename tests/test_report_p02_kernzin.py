"""Kernzin p.02 beweegt mee met het aantal kwetsbare onderwerpen (spec ronde 2 par. 5).

Bevinding B17: scenario 01 (geen enkele factor kwetsbaar) en scenario 05 (alle
zes kwetsbaar) kregen structureel dezelfde openingszin, omdat die alleen de band
van het totaalsignaal volgde. De zin volgt nu het profiel zelf.
"""
import pytest

from backend.report_distribution import ZONE_HIGH
from backend.report_html import (
    P02_WHY_TITLE_FLAT,
    _bestuurlijke_read,
    _p02_direction_key,
    _p02_opening,
    _p02_why_title,
    profile_shape,
)
from backend.report_priority import PRIORITY_TIE_MARGIN

LABELS = {"leadership": "Leiderschap", "culture": "Cultuur", "growth": "Groeiperspectief",
          "compensation": "Beloning", "workload": "Werkdruk", "role_clarity": "Rolhelderheid"}
VLAK = {"leadership": 6.17, "culture": 6.33, "growth": 5.67,
        "compensation": 5.70, "workload": 6.05, "role_clarity": 6.20}
VLAK_EN_STERK = {"leadership": 7.9, "culture": 8.1, "growth": 7.8,
                 "compensation": 8.0, "workload": 7.9, "role_clarity": 7.8}
EEN_LAGE = {"leadership": 6.8, "culture": 7.2, "growth": 4.5,
            "compensation": 6.6, "workload": 7.0, "role_clarity": 7.5}
TWEE_LAAG = {"leadership": 6.8, "culture": 7.2, "growth": 4.5,
             "compensation": 6.6, "workload": 4.8, "role_clarity": 7.5}
ALLES_LAAG = {"leadership": 3.6, "culture": 4.3, "growth": 3.8,
              "compensation": 4.4, "workload": 3.5, "role_clarity": 4.2}
NIET_VLAK_GEEN_KWETSBAAR = {"leadership": 5.2, "culture": 7.4, "growth": 5.1,
                            "compensation": 6.6, "workload": 6.0, "role_clarity": 7.0}


def _open(avgs, scan="retention", primary=None, **kw):
    shape = profile_shape(avgs)
    return _p02_opening(scan_type=scan, shape=shape, labels=LABELS,
                        primary_key=primary or shape["low_key"], **kw)


def test_vlak_profiel_opent_met_de_vlakke_zin():
    zin = _open(VLAK)
    assert zin.startswith("Geen enkel onderwerp springt eruit")
    assert "Dat is zelf de bevinding." in zin


def test_geen_kwetsbaar_en_niet_vlak():
    # Laagste factor is hier ook het startpunt: dan mag de zin dat zeggen.
    zin = _open(NIET_VLAK_GEEN_KWETSBAAR, primary="growth")
    assert zin == ("Geen onderwerp scoort kwetsbaar. Groeiperspectief scoort het "
                   "laagst en is het eerste gesprekspunt.")


def test_geen_kwetsbaar_en_startpunt_wijkt_af_van_de_laagste():
    # Bij Loep Vertrek tilt de vertrekredenweging een andere factor bovenaan,
    # en binnen een gelijkspelgroep kan een tie-break dat ook. De zin mag dan
    # niet suggereren dat de laagste factor het startpunt is.
    zin = _open(NIET_VLAK_GEEN_KWETSBAAR, scan="exit", primary="leadership")
    assert "Groeiperspectief scoort het laagst" in zin
    assert "als eerste gesprekspunt kiest Loep Leiderschap" in zin
    assert "Groeiperspectief scoort het laagst en is" not in zin


def test_een_kwetsbaar_onderwerp():
    zin = _open(EEN_LAGE)
    assert "een onderwerp" in zin
    assert "Groeiperspectief (4.5/10)" in zin
    assert "twee onderwerpen" not in zin


def test_twee_kwetsbare_onderwerpen():
    zin = _open(TWEE_LAAG)
    assert "twee onderwerpen" in zin
    # Laagst eerst, met de eigen score erbij: een verwisseling van de twee
    # overleeft een losse substringtest wel, deze niet.
    assert "Groeiperspectief (4.5/10) en Werkdruk (4.8/10)" in zin


def test_drie_of_meer_is_breed_onder_druk():
    zin = _open(ALLES_LAAG)
    assert "breed onder druk" in zin
    assert "6 van de 6 onderwerpen scoren kwetsbaar" in zin


def test_drie_scenarios_geven_drie_verschillende_zinnen():
    # Scenario 01 (vlak), 02 (een lage factor), 05 (alles laag).
    zinnen = {_open(VLAK), _open(EEN_LAGE), _open(ALLES_LAAG)}
    assert len(zinnen) == 3


def test_startpuntgrond_bij_richting():
    zin = _open(VLAK, tie_break_kind="direction", change=(9, 11))
    assert "Als startpunt kiest Loep" in zin
    assert "9 van de 11" in zin
    assert "om verandering" in zin


def test_startpuntgrond_bij_alleen_score():
    zin = _open(VLAK, tie_break_kind=None, next_delta=0.03)
    assert "de laagste score" in zin
    assert "klein (0,03)" in zin
    assert "weeg dat mee" in zin


def test_klein_verschil_wordt_alleen_klein_genoemd_als_het_klein_is():
    """De zin zegt "het verschil met de volgende is klein". Dat mag alleen bij
    een verschil binnen de gelijkspelmarge; anders spreekt het getal in de zin
    de zin zelf tegen."""
    zin = _open(VLAK, tie_break_kind=None, next_delta=PRIORITY_TIE_MARGIN)
    assert "klein" not in zin
    assert "de laagste score" not in zin
    assert zin.endswith("Als startpunt kiest Loep Groeiperspectief.")


def test_laagste_score_wordt_niet_geclaimd_als_een_tiebreak_besliste():
    """Bij Loep Vertrek tilt de vertrekredenweging het startpunt weg van de
    laagste score. De grondregel mag dan niet "de laagste score" zeggen."""
    zin = _open(TWEE_LAAG, scan="exit", primary="leadership",
                tie_break_kind="exit_reason", next_delta=0.1)
    assert "de laagste score" not in zin
    assert "Als startpunt kiest Loep Leiderschap." in zin


def test_startpuntgrond_bij_niets_nodig():
    zin = _open(VLAK, direction_state_key="none_needed")
    assert "vragen nergens dringend om verandering" in zin
    assert "Bespreek of een startpunt nu nodig is" in zin


def test_per_product_eigen_onderwerpwoord():
    ret = _open(EEN_LAGE, scan="retention")
    ex = _open(EEN_LAGE, scan="exit")
    ob = _open(EEN_LAGE, scan="onboarding")
    assert ret != ex != ob
    assert "Behoud" in ret
    assert "—" not in ret + ex + ob


def test_onbekend_product_faalt_hard():
    # Geen stille terugval op de retention-copy in een ander product.
    with pytest.raises(KeyError):
        _open(EEN_LAGE, scan="team")


def test_geen_em_dashes_en_geen_ik_vorm():
    for avgs in (VLAK, EEN_LAGE, TWEE_LAAG, ALLES_LAAG, NIET_VLAK_GEEN_KWETSBAAR):
        for scan in ("retention", "exit", "onboarding"):
            zin = _open(avgs, scan=scan)
            assert "—" not in zin
            assert " ik " not in zin.lower()


def test_leeg_profiel_levert_lege_zin():
    # Zonder factorprofiel is er geen openingszin; de degraded tak van p.02
    # (ronde 1, B2) neemt het dan over.
    assert _p02_opening(scan_type="retention", shape=profile_shape({}),
                        labels=LABELS, primary_key=None) == ""


# ── het accent uit de vlak-zin overleeft het renderpad ───────────────────────

def test_vlakke_zin_houdt_zijn_accent_in_de_gerenderde_pagina():
    """De kernzin gaat door _h() (html.escape), niet door het niet-escapende
    intro-pad: letterlijke Unicode hoort er dus letterlijk uit te komen, en
    juist geen HTML-entity (die zou dubbel geescaped op de pagina belanden)."""
    html = _bestuurlijke_read(kernzin=_open(VLAK), totaalbeeld="T.",
                              primary_label="Groeiperspectief", why_cells_html="",
                              strong_label="", strong_score=None, mgmt_q="V?")
    assert "binnen één punt van elkaar" in html
    assert "&eacute;" not in html
    assert "&amp;#" not in html


# ── "nergens" is een uitspraak over het hele profiel ─────────────────────────

def _agg(none_n: int, change_n: int) -> dict:
    return {"lowest_n": none_n + change_n, "offered": none_n + change_n,
            "answered": none_n + change_n, "skipped": 0,
            "counts": {"growth_none": none_n, "growth_path": change_n}}


def test_direction_key_alleen_als_geen_enkele_factor_om_verandering_vraagt():
    agg = {"growth": _agg(5, 1), "workload": _agg(4, 0)}
    assert _p02_direction_key(agg, "growth") == "none_needed"


def test_direction_key_valt_weg_als_een_andere_factor_wel_om_verandering_vraagt():
    """"Je mensen vragen nergens om verandering" is onwaar zodra een andere
    factor een duidelijke richting laat zien."""
    agg = {"growth": _agg(5, 1), "workload": _agg(0, 6)}
    assert _p02_direction_key(agg, "growth") is None


def test_direction_key_negeert_factoren_onder_de_vloer():
    agg = {"growth": _agg(5, 1), "workload": _agg(0, 2)}
    assert _p02_direction_key(agg, "growth") == "none_needed"


def test_direction_key_zonder_data():
    assert _p02_direction_key({}, "growth") is None
    assert _p02_direction_key({"growth": _agg(5, 1)}, None) is None


# ── de why-kop belooft niets wat het profiel niet waarmaakt ──────────────────

def test_why_kop_wordt_neutraal_bij_een_vlak_en_sterk_profiel():
    shape = profile_shape(VLAK_EN_STERK)
    assert shape["flat"] is True and shape["low_score"] >= ZONE_HIGH
    assert _p02_why_title(shape) == P02_WHY_TITLE_FLAT


def test_why_kop_blijft_bij_een_vlak_maar_niet_sterk_profiel():
    shape = profile_shape(VLAK)
    assert shape["flat"] is True and shape["low_score"] < ZONE_HIGH
    assert _p02_why_title(shape) == ""


def test_why_kop_blijft_bij_een_niet_vlak_profiel():
    assert _p02_why_title(profile_shape(EEN_LAGE)) == ""
    assert _p02_why_title(profile_shape({})) == ""


def test_bestuurlijke_read_gebruikt_de_neutrale_kop():
    html = _bestuurlijke_read(kernzin="K.", totaalbeeld="T.",
                              primary_label="Rolhelderheid", why_cells_html="",
                              strong_label="", strong_score=None, mgmt_q="V?",
                              why_title=P02_WHY_TITLE_FLAT)
    assert P02_WHY_TITLE_FLAT in html
    assert "Waarom Rolhelderheid bovenaan staat" not in html


# ── het signaalgetal verdwijnt niet, het verhuist ────────────────────────────

def test_signaalcel_staat_in_de_onderbouwingsrij():
    cel = ('<td><div class="sc-l">Behoudssignaal</div>'
           '<div class="sc-v">8.0/10</div>'
           '<div class="sc-b">Behoudsklimaat stabiel</div></td>')
    html = _bestuurlijke_read(kernzin="K.", totaalbeeld="T.",
                              primary_label="Werkdruk", why_cells_html="",
                              strong_label="", strong_score=None, mgmt_q="V?",
                              signal_cell_html=cel)
    assert cel in html
    assert "<table class='sg'><tr>" in html


def test_onderbouwingsrij_blijft_weg_als_er_niets_in_staat():
    html = _bestuurlijke_read(kernzin="K.", totaalbeeld="T.",
                              primary_label="Werkdruk", why_cells_html="",
                              strong_label="", strong_score=None, mgmt_q="V?")
    assert "<table class='sg'><tr>" not in html

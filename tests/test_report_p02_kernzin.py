"""Kernzin p.02 beweegt mee met het aantal kwetsbare onderwerpen (spec ronde 2 par. 5).

Bevinding B17: scenario 01 (geen enkele factor kwetsbaar) en scenario 05 (alle
zes kwetsbaar) kregen structureel dezelfde openingszin, omdat die alleen de band
van het totaalsignaal volgde. De zin volgt nu het profiel zelf.

De labels komen uit _fl, dezelfde functie die de renderers gebruiken. Korte
verzonnen namen verbergen wat echte copy doet: bijna elk factorlabel bevat zelf
al "en", en dat bepaalt bijvoorbeeld hoe een opsomming van twee moet scheiden.
"""
import pytest

from backend.report_distribution import ZONE_HIGH, ZONE_LOW
from backend.report_html import (
    P02_WHY_TITLE_FLAT,
    _bestuurlijke_read,
    _fl,
    _p02_direction_key,
    _p02_opening,
    _p02_signal_cell,
    _p02_why_title,
    profile_shape,
)
from backend.report_priority import PRIORITY_TIE_MARGIN
from backend.scoring_config import ORG_FACTOR_KEYS


def L(fk: str, scan: str = "retention") -> str:
    return _fl(fk, scan)


VLAK = {"leadership": 6.17, "culture": 6.33, "growth": 5.67,
        "compensation": 5.70, "workload": 6.05, "role_clarity": 6.20}
VLAK_EN_STERK = {"leadership": 7.9, "culture": 8.1, "growth": 7.8,
                 "compensation": 8.0, "workload": 7.9, "role_clarity": 7.8}
EEN_LAGE = {"leadership": 6.8, "culture": 7.2, "growth": 4.5,
            "compensation": 6.6, "workload": 7.0, "role_clarity": 7.5}
TWEE_LAAG = {"leadership": 6.8, "culture": 7.2, "growth": 4.5,
             "compensation": 6.6, "workload": 4.8, "role_clarity": 7.5}
DRIE_LAAG = {"leadership": 6.8, "culture": 7.2, "growth": 4.5,
             "compensation": 4.9, "workload": 4.8, "role_clarity": 7.5}
ALLES_LAAG = {"leadership": 3.6, "culture": 4.3, "growth": 3.8,
              "compensation": 4.4, "workload": 3.5, "role_clarity": 4.2}
NIET_VLAK_GEEN_KWETSBAAR = {"leadership": 5.2, "culture": 7.4, "growth": 5.1,
                            "compensation": 6.6, "workload": 6.0, "role_clarity": 7.0}
# Twee onderwerpen op exact dezelfde getoonde score, geen enkele kwetsbaar, en
# een span van meer dan een punt zodat dit niet in de vlak-tak valt.
GEDEELDE_LAAGSTE = {"leadership": 5.85, "culture": 7.4, "growth": 6.6,
                    "compensation": 5.85, "workload": 6.0, "role_clarity": 7.0}


def _open(avgs, scan="retention", primary=None, **kw):
    shape = profile_shape(avgs)
    return _p02_opening(scan_type=scan, shape=shape,
                        labels={fk: _fl(fk, scan) for fk in ORG_FACTOR_KEYS},
                        primary_key=primary or shape["low_key"], **kw)


def test_vlak_profiel_opent_met_de_vlakke_zin():
    zin = _open(VLAK)
    assert zin.startswith("Geen enkel onderwerp springt eruit")
    assert "Dat is zelf de bevinding." in zin


def test_geen_kwetsbaar_en_niet_vlak():
    # Laagste factor is hier ook het startpunt: dan mag de zin dat zeggen.
    zin = _open(NIET_VLAK_GEEN_KWETSBAAR, primary="growth")
    assert zin == (f"Geen onderwerp scoort kwetsbaar. {L('growth')} scoort het "
                   f"laagst en is het eerste gesprekspunt.")


def test_geen_kwetsbaar_en_startpunt_wijkt_af_van_de_laagste():
    # Bij Loep Vertrek tilt de vertrekredenweging een andere factor bovenaan,
    # en binnen een gelijkspelgroep kan een tie-break dat ook. De zin mag dan
    # niet suggereren dat de laagste factor het startpunt is.
    zin = _open(NIET_VLAK_GEEN_KWETSBAAR, scan="exit", primary="leadership")
    assert f"{L('growth', 'exit')} scoort het laagst" in zin
    assert f"als eerste gesprekspunt kiest Loep {L('leadership', 'exit')}" in zin
    assert f"{L('growth', 'exit')} scoort het laagst en is" not in zin


def test_gedeelde_laagste_score_claimt_geen_alleenrecht():
    """Twee onderwerpen op dezelfde getoonde score: "X scoort het laagst" is dan
    geen uitspraak over X alleen, en het overzichtsprofiel toont ze verderop
    naast elkaar. Zelfde behandeling als de gelijkstand in de startpuntregel."""
    zin = _open(GEDEELDE_LAAGSTE)
    assert "scoort het laagst" not in zin
    assert (f"{L('compensation')} deelt de laagste score met het volgende "
            f"onderwerp en is het eerste gesprekspunt.") in zin


def test_gedeelde_laagste_score_ook_als_het_startpunt_afwijkt():
    zin = _open(GEDEELDE_LAAGSTE, primary="culture")
    assert f"{L('compensation')} deelt de laagste score met het volgende onderwerp;" in zin
    assert f"als eerste gesprekspunt kiest Loep {L('culture')}." in zin
    assert "scoort het laagst" not in zin


def test_een_kwetsbaar_onderwerp():
    zin = _open(EEN_LAGE)
    # Telwoord met accent, geen lidwoord: "een onderwerp" leest als "a topic"
    # in plaats van als tegenhanger van "twee onderwerpen" (spec par. 5.2).
    assert "één onderwerp" in zin
    assert "aandacht op een onderwerp" not in zin
    assert f"{L('growth')} (4.5/10)" in zin
    assert "twee onderwerpen" not in zin


def test_twee_kwetsbare_onderwerpen():
    zin = _open(TWEE_LAAG)
    assert "twee onderwerpen" in zin
    # Laagst eerst, met de eigen score erbij: een verwisseling van de twee
    # overleeft een losse substringtest wel, deze niet. Komma en geen "en":
    # beide echte labels bevatten zelf al "en".
    assert f"{L('growth')} (4.5/10), {L('workload')} (4.8/10)." in zin
    assert " en Werkdruk" not in zin


def test_drie_of_meer_is_breed_onder_druk():
    zin = _open(ALLES_LAAG)
    assert "breed onder druk" in zin
    assert "6 van de 6 onderwerpen scoren kwetsbaar" in zin


def test_grens_tussen_twee_en_drie_kwetsbare_onderwerpen():
    """Twee onderwerpen worden opgesomd, drie worden geteld. Verschuift die
    grens, dan somt het rapport er drie op of telt het er twee."""
    twee = _open(TWEE_LAAG)
    drie = _open(DRIE_LAAG)
    assert "twee onderwerpen" in twee and "scoren kwetsbaar" not in twee
    assert "3 van de 6 onderwerpen scoren kwetsbaar" in drie
    assert "drie onderwerpen:" not in drie
    assert f"{L('compensation')} (4.9/10)" not in drie


def test_kwetsbaar_is_strikt_onder_de_grens():
    """ZONE_LOW zelf is geen kwetsbaar punt (getoonde score, ronde 1 B15). Een
    onderwerp dat er precies op staat hoort dus niet in de opsomming, ook niet
    als er daarnaast wel een kwetsbaar onderwerp is."""
    op_de_grens = dict(EEN_LAGE, compensation=ZONE_LOW)
    zin = _open(op_de_grens)
    assert "één onderwerp" in zin
    assert f"{L('growth')} (4.5/10)." in zin
    assert "5.0/10" not in zin

    net_eronder = dict(EEN_LAGE, compensation=4.94)
    assert "twee onderwerpen" in _open(net_eronder)


def test_drie_scenarios_geven_drie_verschillende_zinnen():
    # Scenario 01 (vlak), 02 (een lage factor), 05 (alles laag).
    zinnen = {_open(VLAK), _open(EEN_LAGE), _open(ALLES_LAAG)}
    assert len(zinnen) == 3


# ── de grond onder de startpuntkeuze ─────────────────────────────────────────

def test_startpuntgrond_bij_richting_is_comparatief():
    """De vraag om verandering beslist relatief, niet absoluut: 2 van de 5 wint
    het van 0 van de 4 en beslist de volgorde terecht, maar is niet "de meeste".
    De zin noemt dus beide kanten, net als de markeringsregel onder de rasterrij."""
    zin = _open(VLAK, tie_break_kind="direction", change=(2, 5),
                change_other=(L("culture"), 0, 4))
    assert (f"Als startpunt kiest Loep {L('growth')}: daar vragen meer mensen om "
            f"verandering dan bij {L('culture')} (2 van de 5 tegen 0 van de 4).") in zin
    assert "de meeste mensen" not in zin


def test_richtinggrond_valt_weg_zonder_vergelijkingskant():
    # Een comparatieve zin met maar een kant is geen vergelijking.
    zin = _open(VLAK, tie_break_kind="direction", change=(9, 11))
    assert "om verandering" not in zin
    assert zin.endswith(f"Als startpunt kiest Loep {L('growth')}.")


def test_startpuntgrond_bij_alleen_score():
    zin = _open(VLAK, tie_break_kind=None, next_delta=0.03)
    assert "de laagste score" in zin
    # Prozagetal met komma en het woord "punt", zoals "binnen een punt van
    # elkaar" en "onder de 5,0"; scores houden hun punt en hun /10.
    assert "klein, 0,03 punt" in zin
    assert "weeg dat mee" in zin


def test_exacte_gelijkstand_krijgt_een_eigen_zin():
    """Bij een gelijkstand is de laagste score niet van dit onderwerp alleen, en
    "het verschil is klein (0,00)" oogt als een formatteerfout. De zin benoemt de
    stand dan, in plaats van hem weg te rekenen."""
    zin = _open(VLAK, tie_break_kind=None, next_delta=0.0)
    assert "deelt de laagste score met het volgende" in zin
    assert "weeg die gelijkstand mee in de bespreking" in zin
    assert "0,00" not in zin
    assert "is klein" not in zin


def test_klein_verschil_wordt_alleen_klein_genoemd_als_het_klein_is():
    """De zin zegt "het verschil met de volgende is klein". Dat mag alleen bij
    een verschil binnen de gelijkspelmarge; anders spreekt het getal in de zin
    de zin zelf tegen."""
    zin = _open(VLAK, tie_break_kind=None, next_delta=PRIORITY_TIE_MARGIN)
    assert "klein" not in zin
    assert "de laagste score" not in zin
    assert zin.endswith(f"Als startpunt kiest Loep {L('growth')}.")


def test_laagste_score_wordt_niet_geclaimd_als_het_startpunt_niet_de_laagste_is():
    """De directe erfgenaam van bug B1 (ronde 1): het startpunt is niet altijd de
    laagst scorende factor. Zonder tie-breaksignaal, met een kleine afstand, is
    alleen primary_is_lowest nog het verschil tussen een ware en een onware zin.
    """
    zin = _open(TWEE_LAAG, scan="exit", primary="leadership",
                tie_break_kind=None, next_delta=0.1)
    assert "de laagste score" not in zin
    assert "deelt de laagste score" not in zin
    assert zin.endswith(f"Als startpunt kiest Loep {L('leadership', 'exit')}.")


def test_laagste_score_wordt_niet_geclaimd_als_een_tiebreak_besliste():
    """Bij Loep Vertrek tilt de vertrekredenweging het startpunt weg van de
    laagste score. De grondregel mag dan niet "de laagste score" zeggen."""
    zin = _open(TWEE_LAAG, scan="exit", primary="leadership",
                tie_break_kind="exit_reason", next_delta=0.1)
    assert "de laagste score" not in zin
    assert f"Als startpunt kiest Loep {L('leadership', 'exit')}." in zin


def test_startpuntgrond_bij_niets_nodig():
    zin = _open(VLAK, direction_state_key="none_needed")
    assert "vragen nergens dringend om verandering" in zin
    assert "Bespreek of een startpunt nu nodig is" in zin


# ── product, taal en vorm ────────────────────────────────────────────────────

def test_per_product_eigen_onderwerpwoord():
    ret = _open(EEN_LAGE, scan="retention")
    ex = _open(EEN_LAGE, scan="exit")
    ob = _open(EEN_LAGE, scan="onboarding")
    assert ret != ex and ex != ob and ret != ob
    assert "Behoud" in ret
    assert "vertrekbeeld" in ex
    assert "nieuwe medewerkers" in ob
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
                        labels={}, primary_key=None) == ""


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

    # Zelfde pad, tweede accentzin: het telwoord in de kwetsbaar-opsomming.
    html = _bestuurlijke_read(kernzin=_open(EEN_LAGE), totaalbeeld="T.",
                              primary_label="Groeiperspectief", why_cells_html="",
                              strong_label="", strong_score=None, mgmt_q="V?")
    assert "aandacht op één onderwerp" in html
    assert "&eacute;" not in html


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

def test_signaalcel_toont_het_getal_met_zijn_band():
    cel = _p02_signal_cell("Behoudssignaal", "8.0/10", "Behoudsklimaat stabiel")
    assert '<div class="sc-l">Behoudssignaal</div>' in cel
    assert '<div class="sc-v">8.0/10</div>' in cel
    assert '<div class="sc-b">Behoudsklimaat stabiel</div>' in cel


def test_signaalcel_blijft_leeg_zonder_getal_of_band():
    """Een cel met een gat erin is geen eerlijke degradatie maar een kaal veld
    (Fail Loud). Zonder band is het getal onduidbaar, zonder getal is er niets
    te duiden; in beide gevallen draagt de degraded kernzin het verhaal."""
    assert _p02_signal_cell("Behoudssignaal", "", "Behoudsklimaat stabiel") == ""
    assert _p02_signal_cell("Behoudssignaal", "8.0/10", "") == ""


def test_signaalcel_staat_in_de_onderbouwingsrij():
    cel = _p02_signal_cell("Behoudssignaal", "8.0/10", "Behoudsklimaat stabiel")
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

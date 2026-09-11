"""Geen enkele zin in een rapport claimt dat het startpunt de laagste factor is.

Bug B1 (stresstest ronde 1, scenario 08): het raster-startpunt is bij Loep
Vertrek BY DESIGN niet altijd de laagst scorende factor -- de vertrekreden-
weging (EXIT_REASON_WEIGHT) en de spreidings-/verdiepingsvlaggen kunnen een
andere factor bovenaan zetten. De oude kernzin zei onvoorwaardelijk dat die
factor het laagst scoorde, terwijl het raster verderop een lagere score voor
een andere factor toont.

Ronde 2 van dezelfde bug: dezelfde claim overleefde op twee andere plekken --
de vertrekcontext-kaart ("zowel de meest genoemde vertrekreden als de laagste
factor") en de sectie-intro van het overzichtsprofiel ("de factor die het
laagst scoort, is het logische begin van het gesprek"), die in elk rapport van
alle drie de producten rendert. De regressietest hieronder is daarom
documentbreed: hij grept de hele gerenderde HTML af op elke variant van de
claim, in plaats van een enkele woordvolgorde per test te pinnen.

De fixture komt uit tests/conftest.py::exit_report_data (gedeeld met
tests/test_report_priority_consistency.py) en dwingt de divergentie af:
leadership 4.88 komt via twee vertrekreden-vermeldingen (base 4.88 - 2*0.4 =
4.08) boven growth 4.50, dat de laagste kale score heeft.
"""
from backend.report_html import (
    OVERZICHTSPROFIEL_RANGORDE,
    _fl,
    render_exit_report_html,
)
from backend.report_priority import rank_factors
from backend.scoring_config import ORG_FACTOR_KEYS

from tests.conftest import exit_report_data

# growth is de laagste kale score; leadership wordt het startpunt.
_FACTOR_AVGS = {
    "leadership":   4.88,
    "growth":       4.50,
    "workload":     5.90,
    "role_clarity": 6.20,
    "culture":      6.40,
    "compensation": 7.10,
}

_ITEM_MAP = {
    "leadership":    [("LD1", "Mijn leidinggevende geeft duidelijke feedback")],
    "growth":        [("GR1", "Ik zie voldoende ontwikkelmogelijkheden")],
    "workload":      [("WL1", "Mijn werkdruk is behapbaar")],
    "culture":       [("CU1", "Ik voel me veilig om kritiek te uiten")],
    "compensation":  [("CO1", "Mijn beloning past bij mijn werk")],
    "role_clarity":  [("RC1", "Mijn rol en verwachtingen zijn helder")],
}

# Elke zin die beweert dat het startpunt van het gesprek de laagst scorende
# factor is. Bij Loep Vertrek en Loep Behoud is dat onwaar zodra een vlag of de
# vertrekreden-weging het startpunt verschuift, dus in een rapport waarin die
# divergentie bestaat mag geen van deze frasen voorkomen. (Bij Loep Start
# klopt de claim wel: daar is de rangorde puur de score -- zie
# OVERZICHTSPROFIEL_RANGORDE["onboarding"].)
_LAAGSTE_CLAIMS = (
    "scoort het laagst",
    "laagste factor",
    "laagst scorende factor",
    "logische begin van het gesprek",
)

# Beide vertrekreden-takken (de p.02-kernzin en de vertrekcontext-kaart) zijn
# met de echte EXIT_REASON_LABELS_NL onbereikbaar: geen enkel vertrekreden-
# label bevat een volledig factorlabel als substring. Deze tests bereiken ze
# met een synthetisch label; zie de commentaren bij beide guards in
# backend/report_html.py.
_SYNTHETISCH_REDENLABEL = _fl("leadership", "exit")

_DIST_LOS = [{"code": "PL1", "label": "Beter aanbod elders", "count": 5},
             {"code": "P1", "label": "Leiderschap / management", "count": 2}]
_DIST_SAMENVALLEND = [{"code": "P1", "label": _SYNTHETISCH_REDENLABEL, "count": 2}]


def _exit_fixture(exit_r_dist):
    return exit_report_data(factor_avgs=_FACTOR_AVGS,
                            factor_items_map=_ITEM_MAP,
                            exit_r_dist=exit_r_dist)


def _startpunt_key(exit_r_dist):
    """Onafhankelijke herberekening van de rangorde: bewijst dat de fixture
    het startpunt daadwerkelijk weg van de laagste score duwt."""
    code_to_count = {r["code"]: r["count"] for r in exit_r_dist}
    from backend.report_html import FACTOR_EXIT_CODE
    reasons = {fk: code_to_count.get(FACTOR_EXIT_CODE.get(fk), 0) for fk in _FACTOR_AVGS}
    ranked = rank_factors("exit", _FACTOR_AVGS, {}, {}, exit_reason_counts=reasons,
                          labels={fk: _fl(fk, "exit") for fk in ORG_FACTOR_KEYS})
    return ranked[0]["key"]


_LOWEST_KEY = min(_FACTOR_AVGS, key=lambda fk: _FACTOR_AVGS[fk])


def test_startpunt_wijkt_af_van_laagste_score_in_deze_fixture():
    # Sanity: zonder deze divergentie toetst de regressietest niets.
    assert _LOWEST_KEY == "growth"
    assert _startpunt_key(_DIST_LOS) == "leadership"
    assert _startpunt_key(_DIST_SAMENVALLEND) == "leadership"


def test_geen_enkele_zin_claimt_dat_het_startpunt_het_laagst_scoort():
    """Documentbreed, over beide vertrekreden-takken.

    Vervangt de oude per-zin-asserties: die pinden elk een enkele woordvolgorde
    ("zowel de laagste factor") en lieten de near-verbatim tweeling in de
    vertrekcontext ("zowel de meest genoemde vertrekreden als de laagste
    factor") ongemoeid renderen.
    """
    for dist in (_DIST_LOS, _DIST_SAMENVALLEND):
        assert _startpunt_key(dist) == "leadership"
        html = render_exit_report_html(_exit_fixture(dist))
        for claim in _LAAGSTE_CLAIMS:
            assert claim not in html, (
                f"rapport claimt nog dat het startpunt het laagst scoort: {claim!r} "
                f"(startpunt = leadership 4,88; laagste score = growth 4,50)"
            )


def test_kernzin_claimt_niet_dat_startpunt_het_laagst_scoort():
    html = render_exit_report_html(_exit_fixture(_DIST_LOS))

    start_lbl = _fl("leadership", "exit")
    assert (f"Bovenaan staat {start_lbl} (4.9/10); Beter aanbod elders is de "
            f"meest genoemde vertrekreden.") in html
    # De bronregel onder de gespreksopener draagt de uitleg (een verhaal).
    assert ("Gebaseerd op de score en hoe vaak dit thema als vertrekreden is "
            "genoemd.") in html
    assert "Gebaseerd op de laagst scorende factor." not in html


def test_kernzin_bij_samenvallende_vertrekreden_claimt_geen_laagste_factor():
    # Tak 1: het startpuntlabel valt samen met de meest genoemde vertrekreden.
    html = render_exit_report_html(_exit_fixture(_DIST_SAMENVALLEND))

    start_lbl = _fl("leadership", "exit")
    assert (f"maar {start_lbl} springt eruit: het staat bovenaan en is de "
            f"meest genoemde vertrekreden.") in html


def test_vertrekcontext_vertelt_hetzelfde_verhaal_als_pagina_twee():
    """De kaart "Relatie met het overzichtsprofiel" is de near-verbatim
    tweeling van de p.02-kernzin en moet dus dezelfde positieclaim doen."""
    start_lbl = _fl("leadership", "exit")

    html = render_exit_report_html(_exit_fixture(_DIST_SAMENVALLEND))
    assert (f"{start_lbl} staat bovenaan in de rangorde en is tegelijk de "
            f"meest genoemde vertrekreden.") in html

    # De andere tak wijst naar de rangorde in plaats van naar de laagste
    # factor: de factordiepte toont immers de bovenste rasterrijen.
    html = render_exit_report_html(_exit_fixture(_DIST_LOS))
    assert ("De factoren die bovenaan de rangorde staan, komen terug in de "
            "factordiepte hierna.") in html


def test_overzichtsprofiel_intro_is_productbewust():
    """Loep Start heeft geen prioriteringsraster: daar rangschikt het rapport
    puur op score (_select_priority_factors met lege vertrekredenen), dus daar
    is de laagste-factor-regel wel waar. Een gedeelde zin voor alle drie de
    producten zou dus voor een van beide groepen onwaar zijn."""
    raster = OVERZICHTSPROFIEL_RANGORDE["exit"]
    assert OVERZICHTSPROFIEL_RANGORDE["retention"] == raster
    onboarding = OVERZICHTSPROFIEL_RANGORDE["onboarding"]
    assert onboarding != raster

    # Raster-variant: geen laagste-claim, wel een verwijzing naar de plek waar
    # de volgorde navolgbaar is.
    for claim in _LAAGSTE_CLAIMS:
        assert claim not in raster
    assert "welke signalen meewogen in de volgorde" in raster

    # Score-variant: mag de laagste-claim juist wel doen, en belooft geen
    # navolgbaarheidsraster dat in dat rapport niet bestaat.
    assert "het laagst scoort" in onboarding
    assert "welke signalen meewogen" not in onboarding

    html = render_exit_report_html(_exit_fixture(_DIST_LOS))
    assert raster in html
    assert onboarding not in html


def test_kernzin_copy_heeft_geen_em_dashes():
    html = render_exit_report_html(_exit_fixture(_DIST_LOS))
    start = html.find("Het vertrekbeeld is")
    assert start != -1
    einde = html.find("</p>", start)
    assert einde != -1
    kernzin = html[start:einde]
    # Escape en geen letterlijk teken: anders is deze guard zelf een treffer
    # bij een repo-brede grep op em-dashes.
    assert "\u2014" not in kernzin and "&#x2014;" not in kernzin

"""Polijstronde taak 4 (R13, R21, R27, S3, S11): pagina twee en de besluitpagina.

Bron: docs/rapport-koude-leesronde-2026-10-08.md, sectie 5. Elke test voert
minstens een assert uit: de scenario's zijn gekozen omdat ze het geval zeker
bevatten (gecontroleerd op de segmenttabel en de kernzin van de render).
"""
import html as htmllib
import re

import pytest

from backend.report_html import (
    BESLUIT_AFDELING_SAMEN,
    INTENTIE_DUIDING_KERN,
    LEIDRAAD_ANKERS,
    PATROONVRAAG,
    TOELICHTINGEN_VRAAG_VERTREK,
    _fl,
    _leidraad_block,
    _p02_afdelingen_zin,
    _p02_opening,
    profile_shape,
)
from backend.scoring_config import ORG_FACTOR_KEYS
from scripts import stresstest_report as st
from tests.test_report_degraded_page_two import _RENDERERS, _body, _fixture


# Scenario's renderen naar een tijdelijke map (gedeelde fixture in conftest.py).
pytestmark = pytest.mark.usefixtures("stresstest_naar_tmp")

_CACHE: dict[str, str] = {}


def _html(key: str) -> str:
    if key not in _CACHE:
        sc = {s.key: s for s in st.SCENARIOS}[key]
        _CACHE[key] = open(st.run_scenario(sc)["html"], encoding="utf-8").read()
    return _CACHE[key]


def _plain(fragment: str) -> str:
    return htmllib.unescape(re.sub(r"\s+", " ", re.sub(r"<[^>]+>", " ", fragment))).strip()


def _kern(html: str) -> str:
    """De tekst van "Het antwoord in het kort" tot aan de leidraad: kernzin,
    cijfers en de why-cellen van pagina twee."""
    t = _plain(_body(html))
    i = t.index("Het antwoord in het kort")
    return t[i:t.index("Zo leid je dit gesprek", i)]


def _leidraad(html: str) -> str:
    i = html.index('class="leidraad"')
    return html[i:html.index("</table>", i)]


def _href(anker: str) -> str:
    return 'href="#' + LEIDRAAD_ANKERS[anker] + '"'


def L(fk: str, scan: str = "retention") -> str:
    return _fl(fk, scan)


def _labels(scan: str = "retention") -> dict[str, str]:
    return {fk: _fl(fk, scan) for fk in ORG_FACTOR_KEYS}


# ── R27: geen voorspelling, geen verzonnen reden ─────────────────────────────

def test_r27_kern_zegt_ook_niet_wie_er_vertrekt():
    assert INTENTIE_DUIDING_KERN == (
        "Blijf- en vertrekintentie zeggen hoe dringend behoud hier is, niet bij welke "
        "afdeling het speelt of waarom, en ook niet wie er vertrekt: dit rapport splitst "
        "ze niet per afdeling uit.")


def test_r27_staat_op_pagina_twee():
    assert INTENTIE_DUIDING_KERN in _kern(_html("02_een_lage_factor"))


# ── R21: afdelingsafspraak en terugkoppeling, ook bij parkeren ───────────────

def test_r21_besluitpagina_ook_bij_parkeren():
    assert BESLUIT_AFDELING_SAMEN == ("Dit onderwerp is ook het tweede punt. Maak deze afspraak "
                                      "ook als jullie het tweede punt parkeren.")


def test_r21_wie_en_wanneer_staan_een_keer_in_beide_hintvarianten():
    from tests.test_report_leesronde_fixes import _besluit
    afd = {"department": "Operations", "topic": "Werkdruk en herstelruimte",
           "zwaar": True, "samen_met_tweede": True}
    for toelichtingen in (True, False):
        t = _plain(_besluit(afdeling=afd, afdeling_toelichtingen=toelichtingen))
        i = t.index(BESLUIT_AFDELING_SAMEN)
        hint = t[i:t.index("Terugkoppeling aan medewerkers", i)]
        assert hint.count("wie doet dat") == 1
        assert hint.count("wanneer") == 1
        assert hint.strip().endswith("Wat vragen jullie deze afdeling zelf, wie doet dat, en wanneer?")


VUL_TERUG = "Vul op de besluitpagina de terugkoppeling ook in als je het tweede punt parkeert."
VUL_AFDELING = ("Vul op de besluitpagina de afdelingsafspraak en de terugkoppeling ook in als je "
                "het tweede punt parkeert.")
PARKEERZIN = ("Het tweede punt alleen als er tijd is, anders parkeren jullie het tot het "
              "vervolgmoment.")


def _slot(html: str) -> str:
    rij = re.search(r"<tr><td class=\"lt\">31-45 min</td>.*?</tr>", html, re.S)
    assert rij, "rij 31-45 min niet gevonden"
    return _plain(rij.group(0))


def test_r21_leidraad_terugkoppeling_achter_de_parkeerzin():
    slot = _slot(_leidraad_block("retention", has_segments=True, has_quotes=True,
                                 has_deepening=True, has_werkvragen=True, has_tweede_punt=True))
    assert PARKEERZIN + " " + VUL_TERUG in slot
    assert "afdelingsafspraak" not in slot


def test_r21_leidraad_met_afdelingsafspraak():
    slot = _slot(_leidraad_block("retention", has_segments=True, has_quotes=True,
                                 has_deepening=True, has_werkvragen=True, has_tweede_punt=True,
                                 has_afdeling_afspraak=True))
    assert PARKEERZIN + " " + VUL_AFDELING in slot


def test_r21_zonder_tweede_punt_geen_parkeerregel():
    slot = _slot(_leidraad_block("retention", has_segments=True, has_quotes=True,
                                 has_deepening=True, has_werkvragen=True, has_tweede_punt=False,
                                 has_afdeling_afspraak=True))
    assert "parkeer" not in slot


def test_r21_renderer_zet_de_vlag_uit_het_afdelingsblok():
    """Scenario 06: Operations is de aangewezen afdeling en de besluitpagina
    krijgt een afdelingsblok; de leidraad noemt dan de afdelingsafspraak."""
    html = _html("06_een_afdeling_laag")
    assert "Afspraak per afdeling" in html
    assert VUL_AFDELING in _slot(html)


def test_r21_renderer_zonder_afdelingsblok_noemt_alleen_de_terugkoppeling():
    """Scenario 17: geen aangewezen afdeling (geen afdelingsblok), wel een
    tweede punt."""
    html = _html("17_respons_90")
    assert "Afspraak per afdeling" not in html
    slot = _slot(html)
    assert VUL_TERUG in slot and "afdelingsafspraak" not in slot


# ── R13: het startpunt een keer genoemd ──────────────────────────────────────

AANDACHT_EEN_KWETSBAAR = {"leadership": 5.7, "culture": 7.1, "growth": 4.7,
                          "compensation": 7.1, "workload": 5.2, "role_clarity": 7.1}


def _open(avgs, scan="retention", primary=None, **kw):
    shape = profile_shape(avgs)
    return _p02_opening(scan_type=scan, shape=shape, labels=_labels(scan),
                        primary_key=primary or shape["low_key"], **kw)


def test_r13_eenheid_aandachtspunten_blokkeren_daar_niet_meer():
    zin = _open(AANDACHT_EEN_KWETSBAAR, primary="growth")
    assert zin.endswith("aandachtspunten. Het gesprek begint bij het kwetsbare onderwerp.")
    assert "Als startpunt kiest Loep" not in zin
    zacht = _open(AANDACHT_EEN_KWETSBAAR, primary="growth", indicatief=True)
    assert zacht.endswith("Het gesprek begint waarschijnlijk bij het kwetsbare onderwerp.")


def test_r13_ander_startpunt_houdt_de_bestaande_zin():
    zin = _open(AANDACHT_EEN_KWETSBAAR, scan="exit", primary="workload")
    assert zin.endswith(f"Als startpunt kiest Loep {L('workload', 'exit')}.")


def test_r13_scenario_17():
    t = _kern(_html("17_respons_90"))
    assert "op één kwetsbaar onderwerp: Groeiperspectief (4.9/10)" in t
    assert "aandachtspunten. Het gesprek begint bij het kwetsbare onderwerp." in t
    assert "Als startpunt kiest Loep" not in t


def test_r13_respons_staart_blijft_bij_de_startpuntzin():
    """Scenario 16 (respons 30%): de noemer hoort bij de claim over het startpunt."""
    t = _kern(_html("16_respons_30"))
    assert ("Het gesprek begint bij het kwetsbare onderwerp (op basis van 45 van de 150 "
            "genodigden).") in t


# ── S3: afdelingen waar het laagste onderwerp wel kwetsbaar is ──────────────

def _seg(*depts, pooled=None):
    rows = [{"department": d, "n": n, "avg": 6.0, "scores": [6.0] * n, "is_pooled": False}
            for d, n in depts]
    if pooled:
        rows.append({"department": "Overige afdelingen", "n": pooled, "avg": 6.0,
                     "scores": [6.0] * pooled, "is_pooled": True, "members": ["X", "Y"]})
    return rows


GEEN_KWETSBAAR = {"leadership": 5.2, "culture": 7.4, "growth": 5.1,
                  "compensation": 6.6, "workload": 6.0, "role_clarity": 7.0}


def _afd(segment_rows, factor_rows, avgs=GEEN_KWETSBAAR, primary="growth", scan="retention"):
    return _p02_afdelingen_zin(shape=profile_shape(avgs), labels=_labels(scan),
                               primary_key=primary, segment_rows=segment_rows,
                               segment_factor_rows=factor_rows)


def test_s3_eenheid_twee_afdelingen_op_het_startpunt():
    zin = _afd(_seg(("Sales", 7), ("Operations", 12)),
               {"Sales": {"factors": [("growth", 4.6, 7), ("leadership", 5.5, 7)], "omitted": 0},
                "Operations": {"factors": [("growth", 4.8, 12)], "omitted": 0}})
    assert zin.startswith(f"In twee afdelingen is {L('growth')} wel een kwetsbaar punt (pagina ")
    assert _href("afdelingen") in zin


def test_s3_eenheid_ander_laagste_onderwerp():
    zin = _afd(_seg(("Sales", 7), ("Operations", 12)),
               {"Sales": {"factors": [("growth", 4.6, 7)], "omitted": 0},
                "Operations": {"factors": [("workload", 4.8, 12)], "omitted": 0}})
    assert zin.startswith("In twee afdelingen scoort het eigen laagste onderwerp wel kwetsbaar "
                          "(pagina ")


def test_s3_eenheid_een_afdeling_enkelvoud():
    zin = _afd(_seg(("Sales", 7), ("Operations", 12)),
               {"Sales": {"factors": [("growth", 4.6, 7)], "omitted": 0},
                "Operations": {"factors": [("growth", 5.4, 12)], "omitted": 0}})
    assert zin.startswith(f"In één afdeling is {L('growth')} wel een kwetsbaar punt (pagina ")


def test_s3_privacy_telt_alleen_wat_de_afdelingspagina_toont():
    """Nooit een ander onderwerp van een afdeling dan het laagste (dat staat
    niet op de afdelingspagina), nooit een afdeling buiten de tabel, nooit de
    restgroep. Telt de getoonde score: 4.96 staat als 5.0, aandachtspunt."""
    zin = _afd(_seg(("Sales", 7), ("Finance", 6), pooled=8),
               {"Sales": {"factors": [("growth", 5.2, 7), ("workload", 3.0, 7)], "omitted": 0},
                "Finance": {"factors": [("growth", 4.96, 6)], "omitted": 0},
                # Wel in de factorrijen, niet als eigen rij in de tabel:
                "Klein": {"factors": [("growth", 3.0, 5)], "omitted": 0},
                "Overige afdelingen": {"factors": [("growth", 3.0, 8)], "omitted": 0}})
    assert zin == ""


def test_s3_zonder_afdelingstabel_niets():
    assert _afd([], {"Sales": {"factors": [("growth", 4.0, 7)], "omitted": 0}}) == ""
    assert _afd(_seg(("Sales", 7), ("Finance", 6)), None) == ""


def test_s3_alleen_als_geen_onderwerp_kwetsbaar_scoort():
    factor_rows = {"Sales": {"factors": [("growth", 4.0, 7)], "omitted": 0}}
    rows = _seg(("Sales", 7), ("Finance", 6))
    een_kwetsbaar = dict(GEEN_KWETSBAAR, growth=4.5)
    assert _afd(rows, factor_rows, avgs=een_kwetsbaar) == ""
    vlak = {"leadership": 6.0, "culture": 6.3, "growth": 5.6,
            "compensation": 6.2, "workload": 5.9, "role_clarity": 6.1}
    assert _afd(rows, factor_rows, avgs=vlak) == ""


def test_s3_scenario_20_loep_start_gemengd():
    """Scenario 20: vier afdelingen tonen een kwetsbaar laagste onderwerp, niet
    allemaal het startpunt."""
    t = _kern(_html("20_onboarding_sanity"))
    assert t.count("Geen onderwerp scoort kwetsbaar.") == 1
    assert "In vier afdelingen scoort het eigen laagste onderwerp wel kwetsbaar (pagina" in t


def test_s3_scenario_11_behoud_een_afdeling_op_het_startpunt():
    t = _kern(_html("11_groot_normaal"))
    assert ("is het eerste gesprekspunt. In één afdeling is Groeiperspectief wel een "
            "kwetsbaar punt (pagina") in t


def test_s3_scenario_16b_respons_staart_blijft_bij_de_kernzin():
    t = _kern(_html("16b_respons_25"))
    assert ("een mogelijk eerste gesprekspunt (op basis van 45 van de 180 genodigden). In drie "
            "afdelingen is Groeiperspectief wel een kwetsbaar punt (pagina") in t


def test_s3_scenario_18_zonder_afdelingen_geen_zin():
    t = _kern(_html("18_vlak_n12"))
    assert "Geen onderwerp scoort kwetsbaar." in t
    assert "wel een kwetsbaar punt (pagina" not in t
    assert "laagste onderwerp wel kwetsbaar" not in t


def test_s3_renderer_loep_vertrek():
    data = _fixture("exit", n=25, profile=True)
    data["segment_rows"] = _seg(("Sales", 12), ("Finance", 13))
    data["segment_factor_rows"] = {
        "Sales": {"factors": [("workload", 4.4, 12)], "omitted": 0},
        "Finance": {"factors": [("growth", 5.6, 13)], "omitted": 0}}
    html = _RENDERERS["exit"](data)
    t = _kern(html)
    assert "Geen onderwerp scoort kwetsbaar." in t
    # Startpunt Werkdruk en balans (laagste, workload 5.1); Sales toont dat
    # onderwerp als laagste en kwetsbaar (4.4), Finance niet (5.6).
    assert (f"is het eerste gesprekspunt. In één afdeling is {L('workload', 'exit')} wel een "
            "kwetsbaar punt (pagina ). Organisatiecultuur is de meest genoemde hoofdreden") in t


# ── S11: Loep Start verwijst naar de open antwoorden ─────────────────────────

def test_patroonvraag_hernoemd():
    assert PATROONVRAAG == "wat komt terug in meer dan één antwoord?"
    assert PATROONVRAAG in TOELICHTINGEN_VRAAG_VERTREK


def test_s11_start_leidraad_met_afdelingen_en_open_antwoorden():
    blok = _leidraad_block("onboarding", has_segments=True, has_quotes=True, has_deepening=False)
    rij = re.search(r"<tr><td class=\"lt\">12-25 min</td>.*?</tr>", blok, re.S).group(0)
    tekst = _plain(rij)
    assert ("Het startpunt: de score en de laagste stelling (pagina ). Open met de "
            "gespreksopener hierboven. Het waarom staat in de open antwoorden (pagina ); vraag: "
            + PATROONVRAAG) in tekst
    assert _href("toelichtingen") in rij
    assert "verdieping" not in _plain(blok).lower()


def test_s11_geen_dubbele_verwijzing_als_rij_vier_al_naar_de_open_antwoorden_wijst():
    """Zonder afdelingen wijst rij 4 naar de open antwoorden; dan staat de
    patroonvraag daar, en rij 3 verwijst niet nog eens."""
    blok = _leidraad_block("onboarding", has_segments=False, has_quotes=True, has_deepening=False)
    assert "Wat mensen zelf schreven" in blok
    assert blok.count(_href("toelichtingen")) == 1
    assert "Het waarom staat in de open antwoorden" not in blok
    rij4 = re.search(r"<tr><td class=\"lt\">25-31 min</td>.*?</tr>", blok, re.S).group(0)
    assert _plain(rij4).endswith("(pagina ). Vraag: " + PATROONVRAAG)
    assert _plain(blok).count(PATROONVRAAG) == 1
    assert "verdieping" not in _plain(blok).lower()


def test_s11_met_afdelingen_staat_de_patroonvraag_een_keer_in_rij_drie():
    blok = _leidraad_block("onboarding", has_segments=True, has_quotes=True, has_deepening=False)
    assert _plain(blok).count(PATROONVRAAG) == 1
    assert blok.count(_href("toelichtingen")) == 1


def test_s11_behoud_krijgt_geen_patroonvraag_in_rij_vier():
    blok = _leidraad_block("retention", has_segments=False, has_quotes=True, has_deepening=True)
    assert PATROONVRAAG not in _plain(blok)


def test_s11_zonder_open_antwoorden_geen_verwijzing():
    blok = _leidraad_block("onboarding", has_segments=True, has_quotes=False, has_deepening=False)
    assert _href("toelichtingen") not in blok


def test_s11_scenario_20():
    leidraad = _leidraad(_html("20_onboarding_sanity"))
    assert "Het waarom staat in de open antwoorden (pagina" in _plain(leidraad)
    assert _href("toelichtingen") in leidraad
    assert "verdieping" not in _plain(leidraad).lower()


def test_s11_vertrek_en_behoud_ongewijzigd():
    for scan in ("exit", "retention"):
        blok = _leidraad_block(scan, has_segments=True, has_quotes=True, has_deepening=True)
        assert "Het waarom staat in de open antwoorden" not in blok

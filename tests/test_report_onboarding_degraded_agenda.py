"""De slotpagina van Loep Start is geen sjabloon met gaten (review ronde 2).

Zonder factorprofiel is `sorted_f` leeg, en dan kreeg _eerste_managementspoor
drie lege of letterlijke waarden mee:

* primary_theme viel door naar de placeholder "het leidende onboardingthema",
  die zo in lopende tekst op de klantpagina belandde;
* second_point was "" -> een lege cel onder de kop "Tweede aandachtspunt";
* mgmt_q was "" of de generieke nsp["first_decision"] -> een lege of
  jargonvolle Gespreksopener.

Tegelijk beloofde de sectie-intro erboven ongewijzigd dat deze pagina
"samenvat wat als eerste op tafel hoort, waarom juist dat", en stuurde de
leesroute op p.02 de lezer ernaartoe met "achteraan lees je waar het gesprek
kan beginnen". Drie beloftes die de pagina in die staat geen van drieën
waarmaakte.
"""
import pytest

from backend.report_html import (
    AGENDA_OPENER_GEEN_PROFIEL,
    GESPREKSAGENDA_INTRO_GEEN_PROFIEL,
    SECTION_INTROS,
)
from backend.scoring_config import MIN_AGGREGATE_N

from tests.test_report_degraded_page_two import _RENDERERS, _body, _fixture

_N_DEGRADED = 8
_N_NORMAL = 12
assert _N_DEGRADED < MIN_AGGREGATE_N <= _N_NORMAL


def _ob(*, n: int, profile: bool) -> str:
    return _body(_RENDERERS["onboarding"](_fixture("onboarding", n=n, profile=profile)))


def _agenda(html: str) -> str:
    """De gespreksagenda-sectie: het .pb-blok met de Gespreksopener erin."""
    i = html.rfind("Gespreksopener")
    assert i != -1, "gespreksagenda niet gevonden"
    start = html.rfind('<div class="pb sec">', 0, i)
    einde = html.find('<div class="pb sec">', i)
    return html[start:einde if einde != -1 else len(html)]


# ── Geen placeholders, geen lege cellen ─────────────────────────────────────

def test_geen_placeholder_in_lopende_tekst():
    assert "het leidende onboardingthema" not in _ob(n=_N_DEGRADED, profile=False)


def test_geen_lege_cel_onder_tweede_aandachtspunt():
    agenda = _agenda(_ob(n=_N_DEGRADED, profile=False))
    assert "Tweede aandachtspunt" not in agenda
    assert '<div class="step-body"></div>' not in agenda


def test_geen_lege_of_jargonvolle_gespreksopener():
    agenda = _agenda(_ob(n=_N_DEGRADED, profile=False))
    assert "></p>" not in agenda
    # De generieke nsp["first_decision"] van Loep Start.
    assert "Beslis welke kleine correctie of verificatie" not in agenda
    assert "de vroege werkcontext" not in agenda
    assert AGENDA_OPENER_GEEN_PROFIEL in agenda


# ── De intro belooft alleen wat de pagina waarmaakt ─────────────────────────

def test_intro_belooft_geen_samenvatting_die_er_niet_is():
    body = _ob(n=_N_DEGRADED, profile=False)
    assert SECTION_INTROS["gespreksagenda"] not in body
    assert "vat samen wat als eerste op tafel hoort" not in body
    assert GESPREKSAGENDA_INTRO_GEEN_PROFIEL in body


def test_de_pagina_zegt_wat_er_wel_gemeten_is():
    agenda = _agenda(_ob(n=_N_DEGRADED, profile=False))
    assert "Wat deze meting wel geeft" in agenda
    assert "Wat dit rapport wel laat zien: het checkpointoverzicht" in agenda
    assert ("Een score per thema ontbreekt, dus er is geen onderbouwde volgorde "
            "en geen eerste gesprekspunt dat uit de cijfers volgt.") in agenda


def test_de_leesroute_op_p02_komt_uit_bij_een_echte_vraag():
    """Het gebruiksblok stuurt naar "achteraan lees je waar het gesprek kan
    beginnen"; dat moet op deze pagina landen."""
    body = _ob(n=_N_DEGRADED, profile=False)
    assert "achteraan lees je waar het gesprek kan beginnen" in body
    assert AGENDA_OPENER_GEEN_PROFIEL in _agenda(body)


def test_slotpagina_is_vrij_van_em_dashes():
    agenda = _agenda(_ob(n=_N_DEGRADED, profile=False))
    assert "—" not in agenda and "&#x2014;" not in agenda


# ── Positieve controle: met profiel verandert er niets ──────────────────────

def test_met_profiel_blijft_de_slotpagina_zoals_hij_was():
    body = _ob(n=_N_NORMAL, profile=True)
    agenda = _agenda(body)
    assert "Primair thema" in agenda
    assert "Tweede aandachtspunt" in agenda
    assert SECTION_INTROS["gespreksagenda"] in body
    assert GESPREKSAGENDA_INTRO_GEEN_PROFIEL not in body
    assert AGENDA_OPENER_GEEN_PROFIEL not in body


@pytest.mark.parametrize("scan_type", ["exit", "retention"])
def test_de_onboarding_variant_lekt_niet_naar_de_andere_scans(scan_type):
    body = _body(_RENDERERS[scan_type](_fixture(scan_type, n=_N_DEGRADED, profile=False)))
    assert GESPREKSAGENDA_INTRO_GEEN_PROFIEL not in body
    assert "Wat deze meting wel geeft" not in body

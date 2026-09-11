"""Geen enkele sectie verwijst naar een factorprofiel dat er niet is.

Gevonden bij de eind-tot-eind-lezing van stresstest-scenario 07 (Loep Vertrek,
n=8) die hoorde bij de fix-ronde op B2/B3. Drie sjabloonzinnen bleven daar
staan en beloofden alle drie een profiel per factor dat het document niet
bevat:

1. de intro van het overzichtsprofiel beschrijft "elke factor hieronder" en
   belooft dat je "bij de gespreksagenda verderop per factor ziet welke
   signalen meewogen in de volgorde" -- op een pagina zonder factoren en in
   een rapport zonder volgorde;
2. de intro van de vertrekcontext belooft dat de redenen "samen met de
   factorscores verderop" laten zien of beide hetzelfde verhaal vertellen;
3. de kaart "Relatie met het overzichtsprofiel" op diezelfde pagina verwijst
   naar "de factoren die bovenaan de rangorde staan" en naar "de factordiepte
   hierna".

Zelfde Fail-Loud-defect als B2 en B3: het rapport belooft wat het niet levert.
"""
import pytest

from backend.report_html import SECTION_INTROS
from backend.scoring_config import MIN_AGGREGATE_N

from tests.test_report_degraded_page_two import _RENDERERS, _body, _fixture

_N_DEGRADED = 8
_N_NORMAL = 12
assert _N_DEGRADED < MIN_AGGREGATE_N <= _N_NORMAL

SCANS = ["exit", "retention", "onboarding"]


def _render(scan_type: str, *, profile: bool) -> str:
    return _body(_RENDERERS[scan_type](
        _fixture(scan_type, n=_N_NORMAL if profile else _N_DEGRADED, profile=profile)))


# ── 1. Overzichtsprofiel ────────────────────────────────────────────────────

@pytest.mark.parametrize("scan_type", SCANS)
def test_overzichtsprofiel_beschrijft_geen_factoren_die_er_niet_staan(scan_type):
    body = _render(scan_type, profile=False)
    assert SECTION_INTROS["overzichtsprofiel"] not in body
    assert "Elke factor hieronder is een thema" not in body
    assert "welke signalen meewogen in de volgorde" not in body
    assert "het laagst scoort, is het logische begin" not in body
    # De legenda legt kleuren uit van balken die er niet zijn.
    assert "kwetsbaar punt &nbsp;" not in body


@pytest.mark.parametrize("scan_type", SCANS)
def test_overzichtsprofiel_zegt_eerlijk_wat_er_ontbreekt(scan_type):
    body = _render(scan_type, profile=False)
    assert ("Voor deze meting zijn er geen scores per factor berekend, dus staat "
            "hier nog geen profiel.") in body
    # Het oude bericht schreef het ontbreken onterecht toe aan het aantal: de
    # lege staat hangt aan een leeg factorprofiel, niet aan n.
    assert "Onvoldoende responses (<10)" not in body


@pytest.mark.parametrize("scan_type", SCANS)
def test_overzichtsprofiel_ongewijzigd_met_profiel(scan_type):
    body = _render(scan_type, profile=True)
    assert SECTION_INTROS["overzichtsprofiel"] in body
    assert "kwetsbaar punt &nbsp;" in body
    assert "Voor deze meting zijn er geen scores per factor berekend, dus staat" not in body


# ── 2 en 3. Vertrekcontext (alleen Loep Vertrek) ────────────────────────────

def test_vertrekcontext_belooft_geen_factorscores_verderop():
    body = _render("exit", profile=False)
    assert SECTION_INTROS["vertrekcontext"] not in body
    assert "Samen met de factorscores verderop" not in body
    # De overgebleven zinnen blijven wel staan.
    assert "Deze pagina zet de vertrekredenen op een rij" in body
    assert "niet wie er nog zal vertrekken" in body


def test_vertrekcontext_verwijst_niet_naar_een_rangorde_die_er_niet_is():
    body = _render("exit", profile=False)
    assert "Relatie met het overzichtsprofiel" not in body
    assert "De factoren die bovenaan de rangorde staan" not in body
    assert "komen terug in de factordiepte hierna" not in body


def test_vertrekcontext_ongewijzigd_met_profiel():
    body = _render("exit", profile=True)
    assert SECTION_INTROS["vertrekcontext"] in body
    assert "Relatie met het overzichtsprofiel" in body

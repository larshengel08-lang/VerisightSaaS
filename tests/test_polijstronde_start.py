"""Spec 2026-10-09, leesronde 4 S2/S5/S7/S8: Loep Start zegt wat het rapport
doet (geen productplanning), gebruikt een bandnaam, heet overal Loep Start en
zet een stelling zonder dubbele punt in de zin."""
import re

import pytest

import generate_voorbeeldrapport as gen
from backend.report_html import (
    ONBOARDING_GEEN_VERDIEPING_NOTE,
    ONBOARDING_GEEN_VERDIEPING_NOTE_DEGRADED,
    _laagste_stelling_zin,
)
from scripts import stresstest_report as st


# Scenario's renderen naar een tijdelijke map (gedeelde fixture in conftest.py).
pytestmark = pytest.mark.usefixtures("stresstest_naar_tmp")

_CACHE: dict[str, str] = {}


def _html(key: str) -> str:
    if key not in _CACHE:
        sc = {s.key: s for s in st.SCENARIOS}[key]
        _CACHE[key] = open(st.run_scenario(sc)["html"], encoding="utf-8").read()
    return _CACHE[key]


def _tekst(html: str) -> str:
    return re.sub(r"\s+", " ", re.sub(r"<[^>]+>", " ", html))


# ── S2: zeggen wat dit rapport doet, geen productplanning ─────────────────────

@pytest.mark.parametrize("note", [ONBOARDING_GEEN_VERDIEPING_NOTE,
                                  ONBOARDING_GEEN_VERDIEPING_NOTE_DEGRADED])
def test_de_noten_bevatten_geen_productplanning(note):
    assert "volgende versie" not in note
    assert not re.search(r"\bnog\b", note)


@pytest.mark.parametrize("note", [ONBOARDING_GEEN_VERDIEPING_NOTE,
                                  ONBOARDING_GEEN_VERDIEPING_NOTE_DEGRADED])
def test_de_noten_wijzen_naar_het_gesprek_met_nieuwe_medewerkers(note):
    assert "geen verdiepingsvragen en geen richtingvraag" in note
    assert "vraag je in het gesprek met hen." in note


def test_startrapport_toont_de_nieuwe_noot_en_geen_volgende_versie():
    t = _tekst(_html("20_onboarding_sanity"))
    assert ONBOARDING_GEEN_VERDIEPING_NOTE in t
    assert "volgende versie" not in t


# ── S5: één bandnaam ──────────────────────────────────────────────────────────

def test_landingskwaliteit_legenda_gebruikt_de_bandnaam():
    html = _html("20_onboarding_sanity")
    assert "goed geland" not in html
    assert "&#9632;</span> relatief sterk" in html


# ── S7: één naam voor de demo ─────────────────────────────────────────────────

def test_demo_campagne_heet_loep_start():
    assert gen.ONBOARDING_CONFIG["campaign_name"] == "Loep Start Q1 2026"


def test_opschoning_ruimt_ook_de_demo_met_de_oude_naam_op():
    namen = gen._demo_campaign_names(gen.ONBOARDING_CONFIG)
    assert "Loep Start Q1 2026" in namen
    assert "Onboarding Checkpoint Q1 2026" in namen
    # De andere scans houden alleen hun eigen naam.
    assert gen._demo_campaign_names(gen.EXIT_CONFIG) == ["Loep Vertrek Q1 2026"]


# ── S8: stelling zonder afsluitend leesteken, score bij de stelling ───────────

@pytest.mark.parametrize("stelling", [
    "De hoeveelheid werk is haalbaar.",
    "De hoeveelheid werk is haalbaar?",
    "De hoeveelheid werk is haalbaar!",
    "De hoeveelheid werk is haalbaar",
])
def test_stelling_zonder_afsluitend_leesteken_in_de_zin(stelling):
    zin = _laagste_stelling_zin("Informatiedichtheid en werktempo", stelling, 4.6,
                                laagste_van_alles=True, uniek=True)
    assert zin == ("Bespreek eerst de stelling ‘De hoeveelheid werk is haalbaar’ "
                   "(4.6/10), binnen informatiedichtheid en werktempo. "
                   "Dat is de laagst scorende stelling in het cijferbeeld.")
    assert ".’" not in zin and "?’" not in zin and "!’" not in zin


def test_startrapport_agenda_heeft_geen_punt_binnen_de_aanhalingstekens():
    t = _tekst(_html("20_onboarding_sanity"))
    m = re.search(r"Bespreek eerst de stelling ‘([^’]*)’ \(\d+\.\d/10\), binnen ", t)
    assert m, "de nieuwe zinsvorm staat niet in het startrapport"
    assert not m.group(1).endswith((".", "?", "!"))

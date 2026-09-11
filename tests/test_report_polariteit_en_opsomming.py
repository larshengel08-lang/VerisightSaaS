# tests/test_report_polariteit_en_opsomming.py
#
# Herbeoordeling na fix-ronde 1 (docs/rapport-stresstest-2026-09-10.md).
# De B4-fix zette "Hoe hoger, hoe beter, net als bij elke andere score in dit
# rapport" in de behoudscontext-intro. Vier regels lager staat vertrekintentie,
# waar een hoge score juist meer vertrekgedachten betekent ("7.7/10 · hoog:
# actief vertrekrisico"). De claim was dus universeel gemaakt en daarmee onwaar
# in alle Loep Behoud-rapporten: precies de inversie die B4 moest wegnemen,
# een rij lager.
#
# Daarnaast: de degraded opsomming op p.02 ("Wat dit rapport wel laat zien")
# liet de werkgeversaanbeveling weg terwijl die sectie in dezelfde staat wél
# rendert, en de eNPS-intro verwees naar factoren die er dan niet zijn.
from __future__ import annotations

import re

import pytest

from backend.report_html import SECTION_INTROS, _geen_factorprofiel_note


RETENTION_INTRO = SECTION_INTROS["behoudscontext"]
ONBOARDING_INTRO = SECTION_INTROS["checkpointoverzicht"]


@pytest.mark.parametrize("intro", [RETENTION_INTRO, ONBOARDING_INTRO])
def test_polariteit_wordt_niet_over_het_hele_rapport_geclaimd(intro: str):
    """"net als bij elke andere score" is onwaar zodra één score omgekeerd leest."""
    assert "elke andere score" not in intro
    assert "Hoe hoger, hoe beter" in intro


def test_behoudscontext_benoemt_de_omgekeerde_vertrekintentie():
    """De intro staat direct boven de vier signaalrijen, waarvan er één omkeert."""
    assert "vertrekintentie leest een hoge score juist als meer vertrekgedachten" in RETENTION_INTRO


def test_enps_intro_belooft_geen_factoren():
    """Bij een leeg factorprofiel bestaat "de factoren" niet; de intro claimde ze wel."""
    intro = SECTION_INTROS["werkgeversaanbeveling"]
    assert "overzichtsprofiel" not in intro
    assert "de factoren zeggen waar dat gevoel vandaan komt" not in intro


def test_opsomming_noemt_de_werkgeversaanbeveling_als_die_rendert():
    note = _geen_factorprofiel_note(
        8, drempelzin="Dat profiel vraagt minimaal 10 antwoorden.",
        wel=["de opgegeven vertrekredenen", "de werkgeversaanbeveling",
             "de responsbasis onderaan deze pagina"])
    assert "de werkgeversaanbeveling" in note
    # De opsomming blijft een lopende zin, geen lijst met een dubbele punt erin.
    assert note.count(":") == 1


def test_opsomming_laat_lege_posities_weg():
    note = _geen_factorprofiel_note(
        8, drempelzin="Dat profiel vraagt minimaal 10 antwoorden.",
        wel=["de opgegeven vertrekredenen", "", "de responsbasis onderaan deze pagina"])
    assert ", ," not in note and "  " not in note


@pytest.mark.parametrize("intro", [RETENTION_INTRO, ONBOARDING_INTRO,
                                   SECTION_INTROS["werkgeversaanbeveling"]])
def test_gewijzigde_intros_zijn_vrij_van_em_dashes(intro: str):
    assert "—" not in intro
    assert "&#x2014;" not in intro


@pytest.mark.parametrize("intro", [RETENTION_INTRO, ONBOARDING_INTRO,
                                   SECTION_INTROS["werkgeversaanbeveling"]])
def test_gewijzigde_intros_renderen_zonder_rauwe_non_ascii(intro: str):
    """_intro() rendert deze waarden ongeescaped: non-ASCII moet een entity zijn."""
    assert re.search(r"[^\x00-\x7f]", intro) is None

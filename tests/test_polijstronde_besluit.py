"""R16, V14, S10, S6 en S4 (polijstronde taak 8): methodiek en besluitpagina.

- V14: de terugkoppelingsregel noemt afdelingen alleen als het rapport
  afdelingen toont.
- S10: Loep Start krijgt dezelfde grens als Behoud en Vertrek: wat je deelt,
  geen open antwoorden, geen kleine afdelingen.
- S6: de richtlijn voor het vervolgmoment van Loep Start noemt een termijn.
- S4: geen "bespreken we" in een Start-rapport (Loep zit niet aan tafel).
- R16: de methodiekkaarten (.tg) breken niet over een pagina.
"""
import html as _html
import re

import pytest

from backend.report_css import build_css
from backend.report_html import (
    BESLUIT_REVIEW_HINT,
    besluit_terugkoppeling,
)
from scripts import stresstest_report as st


@pytest.fixture(scope="module", autouse=True)
def _stresstest_naar_tmp(tmp_path_factory):
    """Scenario's renderen naar een tijdelijke map, niet naar docs/stresstest."""
    out = tmp_path_factory.mktemp("stresstest")
    with pytest.MonkeyPatch.context() as mp:
        mp.setattr(st, "OUT_DIR", out)
        yield

STREEPJES = ("—", "–")
AFDELINGSDEEL = "geen uitkomsten van afdelingen"


def _scenario_html(key):
    sc = {s.key: s for s in st.SCENARIOS}[key]
    with open(st.run_scenario(sc)["html"], encoding="utf-8") as fh:
        return fh.read()


def _terugkoppel_hint(page_html: str) -> str:
    start = page_html.index("Terugkoppeling aan medewerkers")
    m = re.search(r'<div class="bl-hint">(.*?)</div>', page_html[start:], re.S)
    assert m, "geen terugkoppelingshint op de besluitpagina"
    return _html.unescape(m.group(1))


def test_vertrek_zonder_afdelingen_eindigt_op_open_antwoorden():
    assert besluit_terugkoppeling("exit", False).endswith("Deel geen open antwoorden.")
    assert AFDELINGSDEEL not in besluit_terugkoppeling("exit", False)


def test_vertrek_met_afdelingen_noemt_de_grens():
    assert besluit_terugkoppeling("exit", True).endswith("met minder dan 10 antwoorden.")


def test_start_met_afdelingen_krijgt_dezelfde_grens():
    t = besluit_terugkoppeling("onboarding", True)
    assert t.startswith("Je mensen vulden in; ze horen wat het MT ermee doet.")
    assert "Deel geen open antwoorden en geen uitkomsten van afdelingen" in t


@pytest.mark.parametrize("scan_type", ["retention", "exit", "onboarding"])
@pytest.mark.parametrize("afdelingen", [True, False])
def test_terugkoppeling_zonder_streepjes_en_met_punt(scan_type, afdelingen):
    t = besluit_terugkoppeling(scan_type, afdelingen)
    assert not any(s in t for s in STREEPJES)
    assert t.endswith(".") and not t.endswith("..")
    assert (AFDELINGSDEEL in t) is afdelingen


def test_gerenderde_vertrek_zonder_afdelingen_noemt_geen_afdelingen():
    html = _scenario_html("08_exit_n12")
    assert "Niet in dit rapport" in html  # de afdelingstabel staat er niet
    hint = _terugkoppel_hint(html)
    assert hint == besluit_terugkoppeling("exit", False)


def test_gerenderde_behoud_met_afdelingen_noemt_de_grens():
    html = _scenario_html("06_een_afdeling_laag")
    assert _terugkoppel_hint(html) == besluit_terugkoppeling("retention", True)


def test_start_richtlijn_noemt_een_termijn():
    assert BESLUIT_REVIEW_HINT["onboarding"] == (
        "Richtlijn: rond het volgende checkpoint, ongeveer 30 dagen na dit gesprek.")


def test_start_rapport_zonder_bespreken_we():
    html = _scenario_html("20_onboarding_sanity")
    tekst = _html.unescape(re.sub(r"<[^>]+>", " ", html))
    assert "bespreken we" not in tekst
    assert "Een volgende meting krijgt een eigen rapport." in tekst
    assert BESLUIT_REVIEW_HINT["onboarding"] in tekst


def test_methodiekkaarten_breken_niet_over_een_pagina():
    css = build_css()
    regel = re.search(r"\.tg\s*\{([^}]*)\}", css)
    assert regel, ".tg ontbreekt in de CSS"
    assert "break-inside: avoid" in regel.group(1)
    assert "page-break-inside: avoid" in regel.group(1)

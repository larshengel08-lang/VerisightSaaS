"""Fixronde na de koude leesronde van 24-9 (docs/superpowers/plans/2026-09-24-fixronde-leesronde.md).

Elke sectie hoort bij één taak van het plan; de zinnen die hier gepind worden
komen letterlijk uit het plan. Loep Start valt buiten deze ronde: waar een test
Loep Start noemt, is het om te bewijzen dat daar niets verandert.
"""
import re

import pytest

from backend.report_html import (
    LEIDRAAD_ANKERS,
    WERKVRAGEN_EYEBROW,
    _besluit_page,
    _leidraad_block,
    render_exit_report_html,
    render_onboarding_report_html,
    render_retention_report_html,
)
from tests.test_report_degraded_page_two import _body, _fixture, _page_two
from tests.test_report_p02_mtvel import _retention_met_secties

STREEPJES = ("—", "–")


def _plain(html: str) -> str:
    return re.sub(r"\s+", " ", re.sub(r"<[^>]+>", " ", html)).strip()


def _rij(html: str, tijd: str) -> str:
    """De HTML van één leidraadrij, vanaf het tijdvak tot het einde van de rij."""
    start = html.index(tijd)
    return html[start:html.index("</tr>", start)]


def _href(anker: str) -> str:
    return 'href="#' + LEIDRAAD_ANKERS[anker] + '"'


# ── Taak 2: verwijzingen naar het werkvragenblok, slot van de vergadering ────

def test_rij_vijf_wijst_naar_het_werkvragenblok_zelf():
    html = _leidraad_block("retention", has_segments=True, has_quotes=True,
                           has_deepening=True, has_werkvragen=True)
    rij = _rij(html, "31-45 min")
    assert _href("werkvragen") in rij
    assert _href("besluit") in rij
    assert _href("agenda") not in rij


def test_rij_vijf_zegt_wat_je_overslaat_en_wat_je_parkeert():
    html = _leidraad_block("exit", has_segments=False, has_quotes=True,
                           has_deepening=True, has_werkvragen=True)
    tekst = _plain(_rij(html, "31-45 min"))
    assert "Bij het startpunt sla je Herkennen over, dat deden jullie al; neem de vragen eronder." in tekst
    assert ("Het tweede punt alleen als er tijd is, anders parkeren jullie het tot het "
            "vervolgmoment.") in tekst


def test_tijdvakken_geven_het_slot_veertien_minuten():
    html = _leidraad_block("retention", has_segments=True, has_quotes=True,
                           has_deepening=True, has_werkvragen=True)
    tekst = _plain(html)
    for tijd in ("0-5 min", "5-12 min", "12-25 min", "25-31 min", "31-45 min"):
        assert tijd in tekst
    assert "25-33 min" not in tekst and "33-45 min" not in tekst
    assert html.count("<tr>") == 5


def test_zonder_werkvragen_wijst_rij_vijf_naar_het_eerste_gesprekspunt():
    html = _leidraad_block("onboarding", has_segments=False, has_quotes=False,
                           has_deepening=False)
    rij = _rij(html, "31-45 min")
    assert "Het eerste gesprekspunt (pagina" in _plain(rij)
    assert _href("agenda") in rij
    assert "werkvragen" not in _plain(rij).lower()


def test_leidraadcopy_zonder_streepjes():
    for kwargs in (dict(has_werkvragen=True), dict(has_werkvragen=False)):
        html = _leidraad_block("retention", has_segments=True, has_quotes=True,
                               has_deepening=True, **kwargs)
        for streep in STREEPJES:
            assert streep not in html


def _exit_met_toelichtingen() -> dict:
    data = _fixture("exit", n=25, profile=True)
    data["open_texts"] = ["Toelichting " + str(i) for i in range(6)]
    return data


@pytest.mark.parametrize("render, data_fn", [
    (render_retention_report_html, _retention_met_secties),
    (render_exit_report_html, _exit_met_toelichtingen),
])
def test_render_verwijst_naar_een_werkvragenblok_dat_er_is(render, data_fn):
    html = render(data_fn())
    assert _href("werkvragen") in _page_two(html)
    assert _body(html).count('id="' + LEIDRAAD_ANKERS["werkvragen"] + '"') == 1


@pytest.mark.parametrize("render, data_fn", [
    (render_retention_report_html, _retention_met_secties),
    (render_exit_report_html, _exit_met_toelichtingen),
])
def test_werkvragenanker_staat_op_het_werkvragenblok_zelf(render, data_fn):
    """Codereview Taak 1: de PDF-meting kijkt alleen of het getoonde nummer de
    pagina van het anker is, niet op welk element het anker staat. Deze test
    pint dat het anker op de wrapper van het blok "Zo maak je er een besluit
    van" staat, direct gevolgd door de eigen eyebrow van dat blok, en niet op
    bijvoorbeeld de hoofdstukkop van de gespreksagenda."""
    body = _body(render(data_fn()))
    anker = 'id="' + LEIDRAAD_ANKERS["werkvragen"] + '"'
    i = body.index(anker)
    tag_start = body.rindex("<", 0, i)
    tag = body[tag_start:body.index(">", i) + 1]
    assert tag == '<div class="wq-block" ' + anker + ">"
    volgend = body[tag_start + len(tag):tag_start + len(tag) + 200]
    assert volgend.startswith('<span class="eyebrow">' + WERKVRAGEN_EYEBROW + "</span>")


def test_besluitpagina_verwijst_naar_het_werkvragenblok():
    html = _besluit_page(opener_html="<h2>kop</h2>", scan_type="retention", campaign_name="Wave 1",
                         startpunt_label="Groeiperspectief", tweede_label=None,
                         review_hint="Richtlijn: 45 tot 90 dagen na dit gesprek.",
                         heeft_werkvragen=True)
    assert _href("werkvragen") in html
    assert _href("agenda") not in html


def test_loep_start_verandert_niet():
    """Loep Start valt buiten deze ronde: geen werkvragen, geen verwijzing ernaar."""
    body = _body(render_onboarding_report_html(_fixture("onboarding", n=25, profile=True)))
    assert 'id="' + LEIDRAAD_ANKERS["werkvragen"] + '"' not in body
    assert _href("werkvragen") not in body

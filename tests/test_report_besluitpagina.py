"""De besluitpagina "Besluit van het MT" (plan 3b, spec 16-9 par. 7).

Invulbaar met de pen: lijnen, geen PDF-formulier. In alle drie de producten, ook
zonder factorprofiel. Niets op deze pagina veronderstelt een begeleider van Loep
(propositiebesluit 2026-09-19).
"""
import re

import pytest

from backend.report_html import (
    BESLUIT_TITEL,
    BESLUIT_VOETREGEL,
    LEIDRAAD_ANKERS,
    _besluit_page,
    _leidraad_block,
    render_exit_report_html,
    render_onboarding_report_html,
    render_retention_report_html,
)
from tests.test_report_degraded_page_two import _body, _fixture

_RENDER = {"exit": render_exit_report_html, "retention": render_retention_report_html,
           "onboarding": render_onboarding_report_html}


def _plain(html: str) -> str:
    return re.sub(r"\s+", " ", re.sub(r"<[^>]+>", " ", html)).strip()


def _pagina(**kw) -> str:
    basis = dict(opener_html="<h2>kop</h2>", scan_type="retention", campaign_name="Wave 1",
                 startpunt_label="Groeiperspectief", tweede_label="Werkdruk en herstelruimte",
                 review_hint="Richtlijn: 45 tot 90 dagen na dit gesprek.", heeft_werkvragen=True)
    basis.update(kw)
    return _besluit_page(**basis)


def test_pagina_draagt_alle_velden_uit_de_spec():
    t = _plain(_pagina())
    for veld in ("Meting", "Wave 1", "Datum van dit gesprek", "Startpunt", "Groeiperspectief",
                 "Wat precies", "Eigenaar", "Datum vervolgmoment", "Tweede punt",
                 "Werkdruk en herstelruimte", "Terugkoppeling aan medewerkers", "Wie", "Wanneer",
                 "Wat", "Waaraan zien we dat het werkt"):
        assert veld in t, veld
    assert BESLUIT_VOETREGEL in t


def test_pagina_is_een_eigen_vel_en_breekt_niet():
    html = _pagina()
    assert html.startswith('<div class="pb sec besluit">')
    assert html.count('class="bl-line"') >= 12     # 3 + 3 wat precies, eigenaar, 2 datums, 3 terugkoppeling, 1 succes


def test_vervolgmoment_vraagt_een_datum_met_de_hint_ernaast():
    t = _plain(_pagina())
    assert "Kies een datum, geen termijn." in t
    assert "Richtlijn: 45 tot 90 dagen na dit gesprek." in t


def test_zonder_tweede_punt_blijft_het_veld_invulbaar():
    t = _plain(_pagina(tweede_label=None))
    assert "Tweede punt (als jullie er een kiezen)" in t
    assert "None" not in t


def test_zonder_startpunt_zegt_de_pagina_dat_eerlijk():
    t = _plain(_pagina(startpunt_label=None, tweede_label=None, heeft_werkvragen=False))
    assert "Dit rapport wijst nog geen startpunt aan; kies zelf het onderwerp." in t
    assert "None" not in t


def test_inleiding_verwijst_naar_de_werkvragen_of_zegt_dat_ze_er_niet_zijn():
    met = _pagina()
    assert "Zo maak je er een besluit van" in _plain(met)
    assert 'href="#' + LEIDRAAD_ANKERS["agenda"] + '"' in met
    start = _plain(_pagina(scan_type="onboarding", heeft_werkvragen=False))
    assert "Zo maak je er een besluit van" not in start
    assert "Loep Start meet nog geen richtingvraag" in start


def test_niets_veronderstelt_een_begeleider_en_geen_streepjes():
    t = _plain(_pagina()).lower()
    for fout in ("tijdens de bespreking", "uit de bespreking", "begeleide", "bespreking met loep",
                 "vervolgmeting", "—", "–"):
        assert fout not in t, fout


@pytest.mark.parametrize("scan_type", ["exit", "retention", "onboarding"])
@pytest.mark.parametrize("profile,n", [(True, 25), (False, 7)])
def test_elk_product_heeft_de_pagina_voor_de_appendix_ook_zonder_profiel(scan_type, profile, n):
    body = _body(_RENDER[scan_type](_fixture(scan_type, n=n, profile=profile)))
    assert body.count('<div class="pb sec besluit">') == 1
    assert body.count('id="' + LEIDRAAD_ANKERS["besluit"] + '"') == 1
    assert BESLUIT_TITEL in body
    assert body.index(BESLUIT_TITEL) < body.index("Methodiek, privacy")
    if "Volledige vraagresultaten" in body:
        assert body.index(BESLUIT_TITEL) < body.index("Volledige vraagresultaten")


@pytest.mark.parametrize("scan_type", ["exit", "retention", "onboarding"])
def test_het_oude_blok_is_weg_en_de_agenda_verwijst_naar_de_besluitpagina(scan_type):
    body = _body(_RENDER[scan_type](_fixture(scan_type, n=25, profile=True)))
    t = _plain(body)
    assert "Uit de bespreking" not in t
    assert "In te vullen tijdens de bespreking" not in t
    assert "Nog niet besluiten" not in t
    assert "fill-steps" not in body
    assert "Leg het besluit vast op pagina" in t


def test_leidraad_rij_vijf_wijst_naar_agenda_en_besluit():
    html = _leidraad_block("retention", has_segments=True, has_quotes=True,
                           has_direction=True, has_deepening=True)
    rij = html[html.index("33-45 min"):]
    assert 'href="#' + LEIDRAAD_ANKERS["agenda"] + '"' in rij
    assert 'href="#' + LEIDRAAD_ANKERS["besluit"] + '"' in rij
    assert "met de werkvragen" in _plain(rij)
    assert html.count("<tr>") == 5          # geen extra rij: p.02 blijft een A4
    zonder = _leidraad_block("onboarding", has_segments=False, has_quotes=False,
                             has_direction=False, has_deepening=False)
    assert "werkvragen" not in _plain(zonder)
    assert 'href="#' + LEIDRAAD_ANKERS["besluit"] + '"' in zonder

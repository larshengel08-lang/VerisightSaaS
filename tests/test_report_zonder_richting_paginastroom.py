"""Regressie plan 3b: de gespreksagenda van een meting zonder richtingdata.

Een meting van vóór de richtingvraag heeft geen blok "Wat er moet gebeuren";
het agendaslot (werkvragen + navy gespreksopener) staat dan direct onder het
prioriteringsraster. Paste het slot daar niet meer, dan verhuisde het in zijn
geheel en stond het alleen op een vel van 35% (gemeten in het productie-image,
WeasyPrint 70.0, op de fixture hieronder; op main 10 pagina's zonder
bevindingen). De klasse raster-mee laat dan de laatste rasterrijen met hun
uitlegregels meereizen. De paginering zelf meet scripts/check_pdf_report.py in
het productie-image; hier bewaken we de HTML-structuur waar die van afhangt.
"""
import re

import pytest

from backend.report_css import build_css
from backend.report_html import (
    _prioriteringsraster,
    _werkvragen_block,
    render_exit_report_html,
    render_retention_report_html,
)
from tests.test_report_degraded_page_two import _body, _fixture
from tests.test_report_priority_render import DIRECTION, RANKED, RESP

_RENDERERS = {"exit": render_exit_report_html, "retention": render_retention_report_html}


def _agenda_sectie(body: str) -> str:
    i = body.index("Zo maak je er een besluit van")
    start = body.rindex('<div class="pb sec', 0, i)
    return body[start:body.index(">", start) + 1]


@pytest.mark.parametrize("scan_type", ["exit", "retention"])
def test_zonder_richtingdata_reist_het_raster_mee(scan_type):
    d = _fixture(scan_type, n=25, profile=True)
    assert not d["direction_agg"] and not d["deepening_agg"]
    body = _body(_RENDERERS[scan_type](d))
    assert "Wat er moet gebeuren" not in body
    assert _agenda_sectie(body) == '<div class="pb sec raster-mee">'
    # Het werkvragenblok blijft renderen, ook zonder richtingdata.
    assert "Zo maak je er een besluit van" in body
    assert not re.search("[–—]", body)


def test_met_richtingblok_verandert_er_niets():
    blok = _werkvragen_block(RANKED, {}, DIRECTION, "retention")
    html = _prioriteringsraster(ranked=RANKED, scan_type="retention", factor_resp_scores=RESP,
                                deepening_active=True, mgmt_q="Opener?", review_when="Later.",
                                opener_html="<h2>kop</h2>", direction_agg=DIRECTION,
                                n_total=17, werkvragen_html=blok)
    assert "Wat er moet gebeuren" in html
    assert "raster-mee" not in html
    assert html.startswith('<div class="pb sec">')


def test_zonder_werkvragen_verandert_er_niets():
    html = _prioriteringsraster(ranked=RANKED, scan_type="retention", factor_resp_scores=RESP,
                                deepening_active=True, mgmt_q="Opener?", review_when="Later.",
                                opener_html="<h2>kop</h2>")
    assert "raster-mee" not in html


def test_css_houdt_uitleg_en_slot_bij_de_laatste_rasterrij():
    css = build_css("retention")
    regel = css[css.index(".raster-mee .r-legend"):]
    regel = regel[:regel.index("}") + 1]
    for sel in (".raster-mee .r-legend", ".raster-mee .r-gate", ".raster-mee .r-uitleg",
                ".raster-mee .mq-brug-sec", ".raster-mee .agenda-slot"):
        assert sel in regel
    assert "break-before: avoid" in regel
    # De rijen zelf blijven heel en de kop herhaalt: daar hangt de breuk van af.
    assert ".raster-tbl tbody.r-grp { break-inside: avoid; }" in css
    assert ".raster-tbl thead { display: table-header-group; }" in css

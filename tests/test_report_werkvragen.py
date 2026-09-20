"""Blok "Zo maak je er een besluit van" (plan 3b, spec 16-9 par. 6).

Drie vragen per gesprekspunt: herkennen (datagedreven), vertalen (gated content,
hier met neutrale testvragen) en besluiten (vaste vorm). Plus de vaste regel op
de afdelingspagina (H7).
"""
import re

import pytest

from backend.products.shared import deepening as dp
from backend.report_html import (
    BESLUITVRAAG,
    BESLUITVRAAG_NIETS,
    SEGMENT_TOELICHTING_GRENS,
    _besluitvraag,
    _herkenningsvraag,
    _prioriteringsraster,
    _segment_block,
    _werkvragen_block,
    render_onboarding_report_html,
    render_retention_report_html,
)
from tests.test_report_degraded_page_two import _body, _fixture
from tests.test_report_priority_render import DIRECTION, RANKED, RESP

VRAGEN = {
    "growth": {"grd_visibility": {"retention": "Testvraag zicht, nu?", "exit": "Testvraag zicht, toen?"}},
}
VARIANTEN = {
    "divided": {"retention": "Nu verdeeld tussen ‘{a}’ en ‘{b}’?", "exit": "Toen verdeeld tussen ‘{a}’ en ‘{b}’?"},
    "split_none": {"retention": "Nu vraagt een deel om ‘{a}’?", "exit": "Toen vroeg een deel om ‘{a}’?"},
}

# n_total hoort bij DIRECTION: de som van lowest_n (9 + 8) is het minimum dat
# _direction_totals_line accepteert. Dezelfde waarde als _render in
# tests/test_report_priority_render.py; een lagere is een onmogelijke telling.
N_TOTAL = 17


@pytest.fixture()
def gevuld(monkeypatch):
    monkeypatch.setattr(dp, "WORK_QUESTIONS", VRAGEN)
    monkeypatch.setattr(dp, "WORK_QUESTION_VARIANTS", VARIANTEN)


def _deep(**counts):
    n = sum(counts.values())
    return {"triggered": n, "offered": n, "answered": n, "skipped": 0,
            "primary_counts": counts, "secondary_counts": {}, "other_texts": []}


def _plain(html: str) -> str:
    return re.sub(r"\s+", " ", re.sub(r"<[^>]+>", " ", html)).strip()


# ── Herkenningsvraag ─────────────────────────────────────────────────────────

def test_herkenningsvraag_noemt_de_toelichting_met_telling_en_noemer():
    zin = _herkenningsvraag({"growth": _deep(gr_visibility=6, gr_time=4, gr_criteria=3)},
                            "retention", "growth", "Groeiperspectief", 5.1)
    assert zin == ("6 van de 13 (46%) kozen als toelichting ‘Ik zie niet welke mogelijkheden er "
                   "voor mij zijn’; die 13 zijn de mensen die bij groeiperspectief duidelijk laag "
                   "antwoordden en de verdiepende vraag beantwoordden. Waar zie je dat bij jullie "
                   "terug, en waar niet?")


def test_herkenningsvraag_onder_tien_zonder_percentage_en_met_enkelvoud():
    zin = _herkenningsvraag({"growth": _deep(gr_visibility=1, gr_time=1, gr_criteria=1,
                                             gr_ceiling=1, gr_conversation=1)},
                            "retention", "growth", "Groeiperspectief", 5.1)
    assert zin.startswith("1 van de 5 koos als toelichting ‘")
    assert "%" not in zin


def test_herkenningsvraag_valt_terug_onder_de_staffel_en_noemt_de_score():
    zin = _herkenningsvraag({"growth": _deep(gr_visibility=4)}, "retention", "growth",
                            "Groeiperspectief", 6.2)
    assert zin == "Wat zit er volgens jullie achter de 6.2/10 op groeiperspectief?"
    assert "zo laag" not in zin


def test_herkenningsvraag_valt_terug_zonder_verdiepingsdata_en_bij_anders_als_grootste():
    verwacht = "Wat zit er volgens jullie achter de 5.1/10 op groeiperspectief?"
    assert _herkenningsvraag({}, "retention", "growth", "Groeiperspectief", 5.1) == verwacht
    assert _herkenningsvraag({"growth": _deep(gr_other=6, gr_time=2)}, "retention", "growth",
                             "Groeiperspectief", 5.1) == verwacht


def test_herkenningsvraag_faalt_luid_op_een_onbekende_toelichtingssleutel():
    with pytest.raises(KeyError, match="bestaat_niet"):
        _herkenningsvraag({"growth": _deep(bestaat_niet=6)}, "retention", "growth",
                          "Groeiperspectief", 5.1)


# ── Besluitvraag ─────────────────────────────────────────────────────────────

def test_besluitvraag_heeft_de_vaste_vorm_uit_de_spec():
    assert _besluitvraag("clear") == BESLUITVRAAG
    assert BESLUITVRAAG == ("Wat spreken jullie vandaag af, wie is eigenaar, en waaraan zie je "
                            "over 90 dagen dat het werkt?")


def test_besluitvraag_bij_niets_nodig_laat_het_mt_ook_niets_besluiten():
    assert _besluitvraag("none_needed") == BESLUITVRAAG_NIETS
    assert "niets te doen" in BESLUITVRAAG_NIETS
    assert "eigenaar" in BESLUITVRAAG_NIETS


# ── Het blok ─────────────────────────────────────────────────────────────────

def test_blok_toont_per_gesprekspunt_de_drie_vragen(gevuld):
    html = _werkvragen_block(RANKED, {"growth": _deep(gr_visibility=6, gr_time=4, gr_criteria=3)},
                             DIRECTION, "retention")
    t = _plain(html)
    assert "Zo maak je er een besluit van" in t
    assert "Startpunt: Groeiperspectief" in t
    assert "Tweede punt: Werkdruk en herstelruimte" in t
    assert "6 van de 13 (46%) kozen als toelichting" in t
    assert "Testvraag zicht, nu?" in t                       # growth is clear
    assert t.count(BESLUITVRAAG) == 2
    assert html.count('class="wq-card"') == 2


def test_verdeelde_richting_krijgt_de_verdeeld_zin_naast_de_toelichting(gevuld):
    """Gat B3 bij werkdruk: 'Geen eenduidige richting' stond los van de meest
    gekozen toelichting. Beide staan nu in dezelfde kaart."""
    html = _werkvragen_block(RANKED, {"workload": _deep(wl_recovery=6, wl_volume=3, wl_peaks_adhoc=3)},
                             DIRECTION, "retention")
    kaart = html[html.index("Tweede punt: Werkdruk en herstelruimte"):]
    t = _plain(kaart)
    assert "6 van de 12 (50%) kozen als toelichting" in t
    assert "Nu verdeeld tussen ‘Piekmomenten en spoedwerk eerder plannen" in t


def test_zonder_vertaalvraag_staat_er_geen_lege_rij(monkeypatch):
    """Voor de reviewgate (lege content) en bij staten zonder vertaalvraag.
    Expliciet leeg gezet, zodat de test ook na Taak 13 blijft kloppen."""
    monkeypatch.setattr(dp, "WORK_QUESTIONS", {})
    monkeypatch.setattr(dp, "WORK_QUESTION_VARIANTS", {})
    html = _werkvragen_block(RANKED, {}, DIRECTION, "retention")
    assert "Vertalen" not in _plain(html)
    assert html.count("Herkennen") == 2 and html.count("Besluiten") == 2
    assert "<td></td>" not in html and "None" not in html


def test_blok_rendert_ook_zonder_richtingdata_en_is_leeg_zonder_gesprekspunten():
    html = _werkvragen_block(RANKED, {}, {}, "retention")
    assert html.count('class="wq-card"') == 2
    assert _werkvragen_block([], {}, DIRECTION, "retention") == ""


def test_blok_rendert_met_de_echte_content_zonder_fout():
    """Rooktest die voor en na Taak 13 moet slagen: met lege content geen rij
    'Vertalen', met gevulde content voor elke route een vraag (anders KeyError)."""
    html = _werkvragen_block(RANKED, {}, DIRECTION, "retention")
    assert html.count('class="wq-card"') == 2


def test_blok_weigert_loep_start():
    with pytest.raises(ValueError, match="onboarding"):
        _werkvragen_block(RANKED, {}, {}, "onboarding")


def test_geen_streepjes_geen_advies_geen_begeleider(gevuld):
    html = _werkvragen_block(RANKED, {"growth": _deep(gr_visibility=6, gr_time=4, gr_criteria=3)},
                             DIRECTION, "retention")
    t = _plain(html).lower()
    for fout in ("—", "–", "loep adviseert", "aanbeveling", "begeleide", "de bespreking met loep"):
        assert fout not in t


# ── Wiring ───────────────────────────────────────────────────────────────────

def test_raster_zet_het_blok_onder_wat_er_moet_gebeuren():
    blok = _werkvragen_block(RANKED, {}, DIRECTION, "retention")
    html = _prioriteringsraster(ranked=RANKED, scan_type="retention", factor_resp_scores=RESP,
                                deepening_active=True, mgmt_q="Opener?", review_when="Later.",
                                opener_html="<h2>kop</h2>", direction_agg=DIRECTION,
                                n_total=N_TOTAL, werkvragen_html=blok)
    assert html.index("Wat er moet gebeuren") < html.index("Zo maak je er een besluit van")
    assert html.index("Zo maak je er een besluit van") < html.index("Gespreksopener")


def test_behoud_rendert_het_blok_en_loep_start_niet():
    behoud = _body(render_retention_report_html(_fixture("retention", n=25, profile=True)))
    assert "Zo maak je er een besluit van" in behoud
    start = _body(render_onboarding_report_html(_fixture("onboarding", n=25, profile=True)))
    assert "Zo maak je er een besluit van" not in start


def test_zonder_factorprofiel_geen_blok():
    html = _body(render_retention_report_html(_fixture("retention", n=7, profile=False)))
    assert "Zo maak je er een besluit van" not in html


# ── H7: de vaste regel op de afdelingspagina ─────────────────────────────────

def test_afdelingspagina_zegt_waar_de_toelichting_vandaan_moet_komen():
    rows = [{"department": "Operations", "n": 17, "avg": 5.2, "scores": [5.2] * 17,
             "is_pooled": False, "invited": 20},
            {"department": "Sales", "n": 6, "avg": 6.8, "scores": [6.8] * 6,
             "is_pooled": False, "invited": 8}]
    met = _segment_block(rows, scan_type="retention", toelichting_regel=True)
    zonder = _segment_block(rows, scan_type="retention")
    assert SEGMENT_TOELICHTING_GRENS in met
    assert SEGMENT_TOELICHTING_GRENS not in zonder
    assert SEGMENT_TOELICHTING_GRENS == (
        "Een lage score zegt niet waarom. Vraag de afdeling zelf naar de toelichting; "
        "het rapport toont die alleen organisatiebreed.")

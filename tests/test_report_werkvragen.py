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
    WERKVRAGEN_AANSTURING_HINT,
    _besluitvraag,
    _herkenningsvraag,
    _prioriteringsraster,
    _segment_block,
    _werkvragen_block,
    render_onboarding_report_html,
    render_retention_report_html,
)
from tests.test_report_degraded_page_two import _body, _fixture
from tests.test_report_priority_render import DIRECTION, RANKED, RESP, _row

VRAGEN = {
    "growth": {"grd_visibility": {"retention": "Testvraag zicht, nu?", "exit": "Testvraag zicht, toen?"}},
    "leadership": {"ldd_mandate": {"retention": "Testvraag mandaat, nu?", "exit": "Testvraag mandaat, toen?"}},
}
# Amendement plan 3b Taak 13 (concept-sectie 7 punt 1): de verdeeld-zinnen zijn
# sinds versie 2 vaste teksten zonder plaatshouders {a}/{b} en zonder citaat
# van de routeteksten.
VARIANTEN = {
    "divided": {"retention": "Nu verdeeld, vaste zin?", "exit": "Toen verdeeld, vaste zin?"},
    "split_none": {"retention": "Nu vraagt een deel, vaste zin?", "exit": "Toen vroeg een deel, vaste zin?"},
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
    """Lockstep bijgewerkt (N2a, eindreview): de oude fixture (vijf opties met
    elk telling 1, samen 5) was zelf een ongemerkte vijfvoudige gelijkstand --
    precies het patroon dat N2 als bug aanwijst. Met answered >= 5 verplicht
    (_deepening_shows_distribution) en primary_counts die daarbij optelt (zoals
    _deep() doet), is een unieke top van 1 wiskundig niet te maken zonder een
    tie: vijf mensen die elk een andere toelichting kozen met telling 1, zijn
    per definitie vijf toelichtingen met dezelfde telling. Deze test bouwt de
    aggregatie daarom met de hand: answered=5, maar met één vastgelegde
    toelichting (primary_counts hoeft niet op te tellen tot answered -- zie
    aggregate_deepening, dat "answered" ophoogt zodra de status "answered" is,
    los van of er een primary is vastgelegd), zodat de staffel- en
    enkelvoudsvorm van _telling los van N2 getest blijft."""
    agg = {"triggered": 5, "offered": 5, "answered": 5, "skipped": 0,
           "primary_counts": {"gr_visibility": 1}, "secondary_counts": {}, "other_texts": []}
    zin = _herkenningsvraag({"growth": agg}, "retention", "growth", "Groeiperspectief", 5.1)
    assert zin.startswith("1 van de 5 koos als toelichting ‘")
    assert "%" not in zin


def test_herkenningsvraag_bij_gelijkstand_noemt_alle_toelichtingen():
    """N2a: een gelijkstand aan de top (scenario 03 uit de stresstest, 4 van de
    14 elk) mag geen van de twee toelichtingen verzwijgen."""
    zin = _herkenningsvraag(
        {"growth": _deep(gr_conversation=4, gr_visibility=4, gr_time=3, gr_other=3)},
        "retention", "growth", "Groeiperspectief", 5.1)
    assert zin == ("Twee toelichtingen kregen evenveel stemmen (4 van de 14 (29%) elk): "
                   "‘Er wordt te weinig concreet met mij over ontwikkeling gesproken’ en "
                   "‘Ik zie niet welke mogelijkheden er voor mij zijn’; die 14 "
                   "zijn de mensen die bij groeiperspectief duidelijk laag antwoordden en de "
                   "verdiepende vraag beantwoordden. Waar zie je dat bij jullie terug, en waar "
                   "niet?")
    assert "—" not in zin and "–" not in zin


def test_herkenningsvraag_gelijkstand_negeert_een_meetellende_anders_optie():
    """Een _other-sleutel die toevallig hetzelfde aantal haalt als de top telt
    niet mee in de gelijkstand (N4 blijft buiten scope): alleen de twee echte
    toelichtingen worden genoemd, niet 'Anders'."""
    zin = _herkenningsvraag(
        {"growth": _deep(gr_conversation=4, gr_other=4, gr_visibility=4, gr_time=2)},
        "retention", "growth", "Groeiperspectief", 5.1)
    assert "Anders" not in zin
    assert "Twee toelichtingen kregen evenveel stemmen (4 van de 14 (29%) elk)" in zin


def test_herkenningsvraag_drievoudige_gelijkstand_noemt_ze_alle_drie():
    zin = _herkenningsvraag(
        {"growth": _deep(gr_conversation=2, gr_time=2, gr_visibility=2, gr_ceiling=1)},
        "retention", "growth", "Groeiperspectief", 5.1)
    assert zin.startswith("Drie toelichtingen kregen evenveel stemmen (2 van de 7 elk): ")
    assert "%" not in zin.split(":")[0]        # onder MIN_DISTRIBUTION_N (10): geen percentage
    assert "‘Er wordt te weinig concreet met mij over ontwikkeling gesproken’" in zin
    assert "‘Er is te weinig tijd of ruimte om mij te ontwikkelen’" in zin
    assert "‘Ik zie niet welke mogelijkheden er voor mij zijn’" in zin
    assert zin.count("‘") == 3 and zin.count("’") == 3   # drie toelichtingen, elk een quote-paar
    assert "—" not in zin and "–" not in zin


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


def test_herkennen_toont_de_beperkte_basis_regel_tussen_vijf_en_tien(gevuld):
    """N2b: de herkenningsvraag volgt dezelfde beperkte-basis-staffel als de
    verdiepingspagina (5 tot 9 beantwoorders), met dezelfde formulering
    (_beperkte_basis_note): geen nieuwe drempel, geen nieuwe zin."""
    zes = _werkvragen_block(RANKED, {"growth": _deep(gr_visibility=4, gr_time=2)},  # answered 6
                            DIRECTION, "retention")
    kaart = zes[:zes.index("Tweede punt")]
    assert "Beperkte basis: gebruik dit als gesprekshaakje, niet als conclusie" in kaart
    assert "—" not in kaart and "–" not in kaart

    tien = _werkvragen_block(RANKED, {"growth": _deep(gr_visibility=7, gr_time=3)},  # answered 10
                             DIRECTION, "retention")
    kaart10 = tien[:tien.index("Tweede punt")]
    assert "Beperkte basis" not in kaart10

    vier = _werkvragen_block(RANKED, {"growth": _deep(gr_visibility=4)},  # answered 4, onder de staffel
                             DIRECTION, "retention")
    kaart4 = vier[:vier.index("Tweede punt")]
    assert "Beperkte basis" not in kaart4


def test_verdeelde_richting_krijgt_de_verdeeld_zin_naast_de_toelichting(gevuld):
    """Gat B3 bij werkdruk: 'Geen eenduidige richting' stond los van de meest
    gekozen toelichting. Beide staan nu in dezelfde kaart.

    Amendement Taak 13: de verdeeld-zin is een vaste tekst, geen citaat meer
    van de routetekst.
    """
    html = _werkvragen_block(RANKED, {"workload": _deep(wl_recovery=6, wl_volume=3, wl_peaks_adhoc=3)},
                             DIRECTION, "retention")
    kaart = html[html.index("Tweede punt: Werkdruk en herstelruimte"):]
    t = _plain(kaart)
    assert "6 van de 12 (50%) kozen als toelichting" in t
    assert VARIANTEN["divided"]["retention"] in t


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


def test_ontbrekende_richtingsleutel_valt_luid_om():
    """Zelfde afspraak als _wat_moet_gebeuren_block: met richtingdata is een
    ontbrekende sleutel een codebug elders, geen kaart zonder vertaalvraag."""
    with pytest.raises(KeyError):
        _werkvragen_block(RANKED, {}, {"growth": DIRECTION["growth"]}, "retention")


def test_blok_weigert_loep_start():
    with pytest.raises(ValueError, match="onboarding"):
        _werkvragen_block(RANKED, {}, {}, "onboarding")


def test_geen_streepjes_geen_advies_geen_begeleider(gevuld):
    html = _werkvragen_block(RANKED, {"growth": _deep(gr_visibility=6, gr_time=4, gr_criteria=3)},
                             DIRECTION, "retention")
    t = _plain(html).lower()
    for fout in ("—", "–", "loep adviseert", "aanbeveling", "begeleide", "de bespreking met loep"):
        assert fout not in t


# ── Aansturing-hint (amendement plan 3b Taak 13, concept-sectie 6 punt 4) ────
# Vaste regel onder de vertaalvraag, alleen bij het onderwerp leadership en
# alleen als er ook echt een vertaalvraag staat.

LEADERSHIP_RANKED = [_row("leadership", "Leiderschap", 5.6, role="startpunt")]
LEADERSHIP_DIRECTION = {
    "leadership": {"lowest_n": 8, "offered": 8, "answered": 8, "skipped": 0,
                   "counts": {"ldd_mandate": 6, "ldd_none": 1, "ldd_escalation": 1}},
}


def test_aansturing_hint_staat_onder_de_vertaalvraag_van_leadership(gevuld):
    html = _werkvragen_block(LEADERSHIP_RANKED, {}, LEADERSHIP_DIRECTION, "retention")
    t = _plain(html)
    assert "Testvraag mandaat, nu?" in t
    assert WERKVRAGEN_AANSTURING_HINT in t
    # Staat na de vertaalvraag, in dezelfde cel, vóór de besluitvraag.
    assert t.index("Testvraag mandaat, nu?") < t.index(WERKVRAGEN_AANSTURING_HINT) < t.index(BESLUITVRAAG)


def test_aansturing_hint_niet_bij_loep_vertrek(gevuld):
    """Amendement 24-9 (A2): bij Loep Vertrek staat onder het onderwerp
    aansturing geen hint, ook als de vertaalvraag er wel staat. De namenregel
    van het blok (Taak 5) blijft wel staan."""
    from backend.report_html import NAMENREGEL_VERTREK
    html = _werkvragen_block(LEADERSHIP_RANKED, {}, LEADERSHIP_DIRECTION, "exit")
    t = _plain(html)
    assert "Testvraag mandaat, toen?" in t
    assert WERKVRAGEN_AANSTURING_HINT not in t
    assert "wq-hint" not in html
    assert NAMENREGEL_VERTREK in t


def test_aansturing_hint_verschijnt_niet_bij_een_ander_onderwerp(gevuld):
    html = _werkvragen_block(RANKED, {"growth": _deep(gr_visibility=6, gr_time=4, gr_criteria=3)},
                             DIRECTION, "retention")
    t = _plain(html)
    assert "Testvraag zicht, nu?" in t                       # growth heeft wel een vertaalvraag
    assert WERKVRAGEN_AANSTURING_HINT not in t


def test_aansturing_hint_verschijnt_niet_zonder_vertaalvraag(gevuld):
    """De regel staat "onder de vertaalvraag"; zonder vertaalvraag (hier: geen
    richtingdata, dus too_few) staat hij er ook niet, ook al is het onderwerp
    leadership."""
    html = _werkvragen_block(LEADERSHIP_RANKED, {}, {}, "retention")
    assert "Vertalen" not in _plain(html)
    assert WERKVRAGEN_AANSTURING_HINT not in _plain(html)


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

_SEG_ROWS = [
    {"department": "Operations", "n": 17, "avg": 5.2, "scores": [5.2] * 17,
     "is_pooled": False, "invited": 20},
    {"department": "Sales", "n": 8, "avg": 6.8, "scores": [6.8] * 8,
     "is_pooled": False, "invited": 10},
]


def _render_met_afdelingen(deepening_agg: dict) -> str:
    data = _fixture("retention", n=25, profile=True)
    data["segment_rows"] = list(_SEG_ROWS)
    data["deepening_agg"] = deepening_agg
    return _body(render_retention_report_html(data))


def test_h7_regel_alleen_als_het_rapport_ergens_een_toelichting_toont():
    """De regel belooft "het rapport toont die alleen organisatiebreed". Een
    actieve verdieping is daarvoor niet genoeg: haalt geen enkel onderwerp de
    staffel van _deepening_shows_distribution, dan staat er nergens een
    toelichting en is de belofte onwaar.
    """
    mager = _render_met_afdelingen({
        "workload": _deep(wl_recovery=2, wl_volume=1),          # answered 3
        "growth": _deep(gr_visibility=2, gr_time=2),            # answered 4
        "leadership": {"triggered": 2, "offered": 2, "answered": 0, "skipped": 2,
                       "primary_counts": {}, "secondary_counts": {}, "other_texts": []},
    })
    # De verdieping draaide wel degelijk in deze meting; het rapport meldt per
    # onderwerp dat het er te weinig zijn. Zonder die controle zou de test ook
    # slagen op een rapport zonder enige verdiepingsdata.
    assert "Te weinig verdiepingsantwoorden om een verdeling te tonen" in mager
    assert SEGMENT_TOELICHTING_GRENS not in mager

    ruim = _render_met_afdelingen({
        "workload": _deep(wl_recovery=6, wl_volume=4, wl_priorities=3),  # answered 13
        "growth": _deep(gr_visibility=2, gr_time=2),
    })
    assert "Er is te weinig ruimte om te herstellen of werk goed af te ronden" in ruim
    assert SEGMENT_TOELICHTING_GRENS in ruim


def test_h7_regel_verdwijnt_zonder_afdelingsrijen():
    data = _fixture("retention", n=25, profile=True)
    data["segment_rows"] = []
    data["deepening_agg"] = {"workload": _deep(wl_recovery=6, wl_volume=4, wl_priorities=3)}
    assert SEGMENT_TOELICHTING_GRENS not in _body(render_retention_report_html(data))


def test_loep_start_krijgt_de_h7_regel_niet():
    data = _fixture("onboarding", n=25, profile=True)
    data["segment_rows"] = list(_SEG_ROWS)
    assert SEGMENT_TOELICHTING_GRENS not in _body(render_onboarding_report_html(data))


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

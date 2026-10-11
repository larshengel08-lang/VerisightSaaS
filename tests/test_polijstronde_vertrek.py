"""Polijstronde taak 9 (V3, V11, V12, V13, V15, V16): Loep Vertrek.

Bron: docs/rapport-koude-leesronde-2026-10-08.md, sectie 5. De scenario's
renderen naar een tijdelijke map (st.OUT_DIR wordt per module omgezet), zodat
docs/stresstest niet geraakt wordt.
"""
import dataclasses
import html as htmllib
import re

import pytest

from backend.products.shared.deepening import (
    DIRECTION_MIN_N,
    DIRECTION_SETS,
    WORK_QUESTIONS,
    direction_option_texts,
)
from backend.report_html import (
    LEIDRAAD_ANKERS,
    UITSTROOM_RAND_MIN,
    _band,
    _bijlage_richting_block,
    _direction_totals_line,
    _enps_block,
    _frictie_duiding,
    _uitstroom_bereik,
    _uitstroomperiode,
    _vertrekcontext,
    _wat_moet_gebeuren_block,
    _werkvragen_block,
)
from scripts import stresstest_report as st

_CACHE: dict[str, str] = {}


# Scenario's renderen naar een tijdelijke map (gedeelde fixture in conftest.py).
pytestmark = pytest.mark.usefixtures("stresstest_naar_tmp")


# Een Vertrek-scenario met een bijlage (n > 20, alle zes onderwerpen gescoord)
# en een onderwerp buiten de agenda dat voor een flink deel het laagst scoort:
# werkdruk ligt net boven leiderschap en groei, dus een deel van de
# respondenten heeft werkdruk als eigen laagste onderwerp.
VERTREK_BIJLAGE = st.Scenario(
    "zz_vertrek_bijlage", "Vertrek, n=36, met appendix",
    "Polijstronde V12: keuzes buiten de agenda in de bijlage.",
    scan_type="exit", n=36, invited=50,
    factors=st.prof(leadership=(4.6, 1.2), growth=(4.8, 1.2), workload=(5.0, 1.2)),
    direction_skip=0.0)


def _html(key: str) -> str:
    if key not in _CACHE:
        sc = VERTREK_BIJLAGE if key == VERTREK_BIJLAGE.key else {s.key: s for s in st.SCENARIOS}[key]
        with open(st.run_scenario(sc)["html"], encoding="utf-8") as fh:
            _CACHE[key] = fh.read()
    return _CACHE[key]


def _plain(fragment: str) -> str:
    body = fragment.split("</style>")[-1]
    return htmllib.unescape(re.sub(r"\s+", " ", re.sub(r"<[^>]+>", " ", body))).strip()


def _assert_ankers_bestaan(html: str) -> None:
    for anker in set(re.findall(r'href="#([a-z0-9_-]+)"', html)):
        assert html.count(f'id="{anker}"') == 1, anker


# ── V3: redenen en scores naast elkaar ──────────────────────────────────────

def _context(factor_avgs, reason_counts, cont_counts):
    return _plain(_vertrekcontext(
        exit_reasons=[("Werkdruk / stress", 9)], contributing=[("Beloning", 18)], n=30,
        primary_factor_label="Werkdruk en balans", factor_avgs=factor_avgs,
        reason_counts=reason_counts, cont_counts=cont_counts))


def test_v3_reden_die_met_de_score_botst_krijgt_een_zin():
    t = _context({"compensation": 7.0, "workload": 4.2}, {"P5": 9}, {"P4": 18})
    assert ("Beloning werd 18 keer genoemd als reden die meespeelde, maar het onderwerp "
            "beloning en voorwaarden scoort 7.0 (relatief sterk): hier lopen redenen en "
            "scores uit elkaar.") in t
    # De zin staat vóór de bestaande zin over de invalshoeken.
    assert t.index("Beloning werd 18 keer") < t.index("belichten elk een eigen invalshoek")


def test_v3_niet_relatief_sterk_geen_zin():
    t = _context({"compensation": 6.0}, {}, {"P4": 18})
    assert "lopen redenen en scores uit elkaar" not in t


def test_v3_te_weinig_vermeldingen_geen_zin():
    t = _context({"compensation": 7.0}, {"P4": 1}, {"P4": 3})
    assert "lopen redenen en scores uit elkaar" not in t


def test_v3_hoofdreden_en_meespelend_samen_met_beide_aantallen():
    t = _context({"compensation": 6.9}, {"P4": 2}, {"P4": 4})
    assert ("Beloning werd 6 keer genoemd als reden (2 keer als hoofdreden, 4 keer als "
            "reden die meespeelde), maar het onderwerp beloning en voorwaarden scoort 6.9 "
            "(relatief sterk)") in t


def test_v3_alleen_hoofdreden():
    t = _context({"compensation": 7.4}, {"P4": 5}, {})
    assert ("Beloning werd 5 keer genoemd als hoofdreden, maar het onderwerp beloning en "
            "voorwaarden scoort 7.4") in t


def test_v3_op_de_getoonde_score():
    # 6.46 staat als 6.5 op de pagina en is dus relatief sterk (B15).
    t = _context({"compensation": 6.46}, {}, {"P4": 6})
    assert "beloning en voorwaarden scoort 6.5 (relatief sterk)" in t


def test_v3_maximaal_twee_hoogste_aantal_eerst():
    t = _context({"compensation": 7.0, "culture": 7.2, "role_clarity": 7.5},
                 {}, {"P4": 6, "P2": 9, "P6": 5})
    assert t.count("lopen redenen en scores uit elkaar") == 2
    assert t.index("Organisatiecultuur werd 9 keer") < t.index("Beloning werd 6 keer")
    assert "Rolonduidelijkheid werd" not in t
    # Het onderwerp staat bij naam, niet alleen het redenlabel.
    assert "het onderwerp cultuur en veiligheid scoort 7.2" in t


def test_v3_redenen_buiten_de_onderwerpen_tellen_niet():
    t = _context({"compensation": 7.0}, {"PL1": 20}, {"PL1": 9})
    assert "lopen redenen en scores uit elkaar" not in t


def test_v3_zonder_profiel_geen_zin():
    t = _plain(_vertrekcontext(
        exit_reasons=[], contributing=[("Beloning", 18)], n=30, primary_factor_label="",
        has_profile=False, factor_avgs={"compensation": 7.0}, reason_counts={},
        cont_counts={"P4": 18}))
    assert "lopen redenen en scores uit elkaar" not in t


def test_v3_geen_streepjes_en_geen_advies():
    t = _context({"compensation": 7.0}, {}, {"P4": 18})
    assert "—" not in t and "–" not in t
    assert "omdat" not in t and "advies" not in t


# ── V11: één tijdsanker ─────────────────────────────────────────────────────

def test_v11_grd_visibility_heeft_het_tijdsanker_van_pagina_twee():
    tekst = WORK_QUESTIONS["growth"]["grd_visibility"]["exit"]
    assert tekst.endswith(" En in de periode waar deze meting over gaat?")
    assert "een jaar geleden" not in tekst


def test_v11_bereik_volgt_dezelfde_gate_als_de_uitstroomperiode():
    maanden = ["2025-12", "2025-12", "2026-01", "2026-02", "2026-03", "2026-03"]
    assert _uitstroom_bereik(maanden) == ("december 2025", "maart 2026")
    # Randmaand van één persoon: geen bereik, en de regel op pagina twee valt ook weg.
    rand = ["2025-11"] + maanden[1:]
    assert _uitstroom_bereik(rand) is None
    assert _uitstroomperiode(rand, 6)[0] is None
    # Te weinig bekende maanden.
    assert _uitstroom_bereik(["2025-12", "2025-12", "2026-03", "2026-03"]) is None
    assert _uitstroom_bereik([]) is None and _uitstroom_bereik(None) is None


def test_v11_bereik_en_regel_op_pagina_twee_vallen_samen():
    gevallen = [
        ["2025-12"] * 5,
        ["2025-12", "2025-12", "2026-01", "2026-03", "2026-03"],
        ["2025-12", "2026-01", "2026-01", "2026-03", "2026-03"],
        ["2025-12", "2025-12", "2026-01", "2026-01"],
    ]
    for maanden in gevallen:
        regel, _reden = _uitstroomperiode(maanden, len(maanden))
        assert (regel is not None) == (_uitstroom_bereik(maanden) is not None), maanden
    assert UITSTROOM_RAND_MIN == 2


# Scenario 21 heeft wel een uitstroomperiode, maar zijn twee gesprekspunten
# staan allebei in de verdeeld-staat: hun vertaalvraag is een vaste variant
# zonder tijdsanker. Scenario 22 heeft een vertaalvraag met het anker, maar geen
# periode (randmaand van één persoon). Daarom ook 22 met de maanden van 21: dezelfde
# sleutel, dus dezelfde random-reeks en dezelfde antwoorden; alleen de
# vertrekmaanden verschillen (die komen niet uit de random-reeks).
def _html_22_met_periode() -> str:
    key = "22_met_periode"
    if key not in _CACHE:
        per_key = {s.key: s for s in st.SCENARIOS}
        sc = dataclasses.replace(per_key["22_exit_uitstroom_rand"],
                                 exit_months=per_key["21_exit_uitstroom"].exit_months)
        with open(st.run_scenario(sc)["html"], encoding="utf-8") as fh:
            _CACHE[key] = fh.read()
    return _CACHE[key]


def _werkvragen(html: str) -> str:
    i = html.index('id="' + LEIDRAAD_ANKERS["werkvragen"] + '"')
    return _plain(html[i:html.index("Besluit van het MT", i)])


def test_v11_met_periode_noemt_de_uitstroomperiode():
    html = _html_22_met_periode()
    wq = _werkvragen(html)
    assert "En in de uitstroomperiode (tussen december 2025 en maart 2026)?" in wq
    assert "in de periode waar deze meting over gaat" not in _plain(html)
    assert "een jaar geleden" not in _plain(html)
    # Hetzelfde woord als pagina twee.
    assert "Uitstroomperiode: vertrek tussen december 2025 en maart 2026" in _plain(html)


def test_v11_zonder_periode_houdt_de_algemene_vorm():
    html = _html("22_exit_uitstroom_rand")
    wq = _werkvragen(html)
    assert "En in de periode waar deze meting over gaat?" in wq
    assert "uitstroomperiode" not in wq.lower()
    assert "een jaar geleden" not in _plain(html)
    # Geen maand van vertrek: de randmaand (oktober 2025) is van één persoon.
    # (maart 2026 staat wel in de meetperiode, daarom alleen in de werkvragen.)
    assert "oktober 2025" not in _plain(html)
    for maand in ("december 2025", "maart 2026"):
        assert maand not in wq


def test_v11_scenario_21_zonder_jaar_geleden():
    t = _plain(_html("21_exit_uitstroom"))
    assert "een jaar geleden" not in t
    assert "in de periode waar deze meting over gaat" not in t


def test_v11_werkvragen_zonder_bereik_ongewijzigd():
    ranked = [{"key": "workload", "label": "Werkdruk en balans", "score": 4.0,
               "agenda_role": "startpunt"}]
    zonder = _werkvragen_block(ranked, {}, {}, "exit")
    met_none = _werkvragen_block(ranked, {}, {}, "exit", uitstroom=None)
    assert zonder == met_none


# ── V12: keuzes buiten de agenda in de bijlage ──────────────────────────────

def _agg(lowest_n, answered, counts):
    return {"lowest_n": lowest_n, "offered": answered, "answered": answered, "skipped": 0,
            "counts": counts, "other_texts": []}


def _leeg():
    return _agg(0, 0, {})


def _dir_agg(**per_factor):
    agg = {fk: _leeg() for fk in DIRECTION_SETS}
    agg.update(per_factor)
    return agg


def test_v12_regels_op_minstens_10px():
    agg = _dir_agg(leadership=_agg(10, 10, {}), workload=_agg(4, 4, {"wld_none": 4}))
    blok = _bijlage_richting_block(agg, ["leadership"], "exit")
    assert "font-size:9.5px;color:#243247;margin:0 0 5px" not in blok
    assert "font-size:10px" in blok


def test_v12_blok_toont_keuzes_niets_apart_achteraan_nul_weg():
    texts = direction_option_texts("exit", "workload")
    routes = [k for k in texts if not k.endswith(("_none", "_other"))]
    agg = _dir_agg(
        leadership=_agg(10, 10, {}), growth=_agg(8, 8, {}),
        workload=_agg(9, 9, {routes[0]: 2, routes[1]: 5, "wld_none": 2}))
    t = _plain(_bijlage_richting_block(agg, ["leadership", "growth"], "exit"))
    assert t.startswith("Richtingvraag bij de andere onderwerpen")
    assert ("Werkdruk en balans (9 antwoorden): ‘" + texts[routes[1]] + "’ 5, ‘"
            + texts[routes[0]] + "’ 2; ‘" + texts["wld_none"] + "’ 2.") in t
    assert texts[routes[2]] not in t
    assert t.endswith("Dit zijn de keuzes van respondenten, geen advies van Loep.")
    assert "Leiderschap" not in t and "Groeiperspectief" not in t


def test_v12_onder_de_vloer_geen_keuzes():
    agg = _dir_agg(leadership=_agg(10, 10, {}), growth=_agg(8, 8, {}),
                   workload=_agg(2, 2, {"wld_none": 2}), culture=_agg(1, 1, {"cud_none": 1}))
    t = _plain(_bijlage_richting_block(agg, ["leadership", "growth"], "exit"))
    assert ("Werkdruk en balans: 2 hadden dit als laagste onderwerp; te weinig antwoorden "
            "om iets over te zeggen.") in t
    assert ("Cultuur en veiligheid: 1 had dit als laagste onderwerp; te weinig antwoorden "
            "om iets over te zeggen.") in t
    assert "Niets" not in t
    assert DIRECTION_MIN_N == 3


def test_v12_geen_verwijzing_als_het_blok_geen_keuzes_toont():
    # Buiten de agenda alleen onderwerpen onder de vloer: het blok toont alleen
    # "te weinig antwoorden", dus de totaalregel verwijst er niet naar.
    agg = _dir_agg(leadership=_agg(10, 10, {"ldd_none": 10}), growth=_agg(8, 8, {"grd_none": 8}),
                   workload=_agg(2, 2, {"wld_none": 2}), culture=_agg(1, 1, {"cud_none": 1}))
    zin = _direction_totals_line(agg, ["leadership", "growth"], "exit", 21, bijlage=True)
    assert "niet uitgewerkt." in zin
    assert "Wat zij kozen" not in zin
    blok = _bijlage_richting_block(agg, ["leadership", "growth"], "exit")
    assert "te weinig antwoorden" in blok
    ranked = [{"key": "leadership", "label": "Leiderschap en feedback", "score": 4.0,
               "agenda_role": "startpunt"},
              {"key": "growth", "label": "Groeiperspectief", "score": 4.5,
               "agenda_role": "tweede"}]
    html = _wat_moet_gebeuren_block(ranked, agg, "exit", 21, bijlage=True)
    assert "href=\"#" + LEIDRAAD_ANKERS["richting_overig"] not in html
    # Precies op de vloer wel.
    agg["workload"] = _agg(3, 3, {"wld_none": 3})
    assert "Wat zij kozen" in _direction_totals_line(agg, ["leadership", "growth"], "exit",
                                                      22, bijlage=True)
    assert DIRECTION_MIN_N == 3


def test_v12_zonder_onderwerpen_buiten_de_agenda_geen_blok():
    agg = _dir_agg(leadership=_agg(10, 10, {}), growth=_agg(8, 8, {}))
    assert _bijlage_richting_block(agg, ["leadership", "growth"], "exit") == ""
    assert _bijlage_richting_block({}, ["leadership"], "exit") == ""


def test_v12_onboarding_heeft_geen_richtingvraag():
    agg = _dir_agg(workload=_agg(5, 5, {"wld_none": 5}))
    assert _bijlage_richting_block(agg, [], "onboarding") == ""


def test_v12_anders_heet_anders():
    agg = _dir_agg(leadership=_agg(10, 10, {}),
                   workload=_agg(4, 4, {"wld_other": 3, "wld_none": 1}))
    t = _plain(_bijlage_richting_block(agg, ["leadership"], "exit"))
    assert "‘Anders’ 3" in t and "namelijk" not in t


def test_v12_totaalregel_verwijst_alleen_met_bijlage():
    agg = _dir_agg(leadership=_agg(10, 10, {}), growth=_agg(8, 8, {}),
                   workload=_agg(9, 9, {"wld_none": 9}))
    zonder = _direction_totals_line(agg, ["leadership", "growth"], "exit", 27)
    met = _direction_totals_line(agg, ["leadership", "growth"], "exit", 27, bijlage=True)
    assert "niet uitgewerkt." in zonder and "Wat zij kozen" not in zonder
    assert ("niet uitgewerkt. Wat zij kozen, staat bij ‘Richtingvraag bij de andere "
            "onderwerpen’ (pagina ") in met
    assert "bijlage" not in met


ZIN = "Wat zij kozen, staat bij ‘Richtingvraag bij de andere onderwerpen’ (pagina"


def test_v12_vertrek_met_bijlage_gerenderd():
    html = _html(VERTREK_BIJLAGE.key)
    t = _plain(html)
    assert "Richtingvraag bij de andere onderwerpen" in t
    assert ZIN in t
    anker = LEIDRAAD_ANKERS["richting_overig"]
    assert html.count('href="#' + anker + '"') == 1
    assert html.count('id="' + anker + '"') == 1
    # Het anker staat op het blok zelf, niet op de appendixkop.
    i = html.index('id="' + anker + '"')
    assert "Richtingvraag bij de andere onderwerpen" in html[i:i + 400]
    assert "bijlage" not in t.lower()
    assert "Dit zijn de keuzes van respondenten, geen advies van Loep." in t
    _assert_ankers_bestaan(html)


def test_v12_behoud_met_bijlage_gerenderd():
    html = _html("02_een_lage_factor")
    t = _plain(html)
    assert "Richtingvraag bij de andere onderwerpen" in t
    assert ZIN in t
    assert html.count('id="' + LEIDRAAD_ANKERS["richting_overig"] + '"') == 1
    _assert_ankers_bestaan(html)


def test_v12_zonder_bijlage_geen_verwijzing():
    # Vertrek n=12: geen bijlage (n <= 20), dus ook geen verwijzing ernaar.
    html = _html("21_exit_uitstroom")
    assert "Richtingvraag bij de andere onderwerpen" not in html
    assert "Wat zij kozen" not in html
    assert LEIDRAAD_ANKERS["richting_overig"] not in html


# ── V13: eigen label en uitleg bij de frictiegrenzen ────────────────────────

def test_v13_middenband_heet_gemengd_frictiebeeld():
    assert _band(5.0, "exit")[0] == "Gemengd frictiebeeld"
    assert _band(5.0, "exit")[0] != "Gemengd vertrekbeeld"


def test_v13_frictieduiding_legt_de_andere_grenzen_uit():
    t = htmllib.unescape(_frictie_duiding(5.5))
    assert ("Deze grenzen horen bij de frictiescore en zijn niet dezelfde als de grenzen "
            "5,0 en 6,5 bij de onderwerpen.") in t
    assert t.index("laag.") < t.index("Deze grenzen horen")


def test_v13_zonder_onderwerpen_geen_verwijzing_naar_onderwerpen():
    t = htmllib.unescape(_frictie_duiding(5.5, met_onderwerpen=False))
    assert "bij de onderwerpen" not in t


# ── V15: geen Baseline op de cover ──────────────────────────────────────────

def test_v15_vertrekcover_zonder_baseline():
    html = _html("21_exit_uitstroom")
    cover = html[html.index('class="ceyebrow"'):]
    cover = cover[:cover.index("</div>")]
    assert "Loep Vertrek" in cover
    assert "Baseline" not in html and "Live" not in cover


# ── V16: eNPS van vertrekkers ───────────────────────────────────────────────

ENPS = {"n": 35, "promoters": 0, "detractors": 14}


def test_v16_vertrek_enps_zegt_van_wie_het_oordeel_is():
    t = htmllib.unescape(_enps_block(-40, ENPS, scan_type="exit"))
    assert ("Bij Loep Vertrek is dit het oordeel van mensen die vertrokken, niet van wie er "
            "nu werkt.") in t
    # Direct na de intro, als slotzin van dezelfde alinea (Taak 11: een eigen
    # alinea kostte de contextpagina van Loep Vertrek n=8 een vel van 12%).
    i = t.index("Lees dit als aanvullende context")
    j = t.index("Bij Loep Vertrek is dit het oordeel")
    assert i < j < t.index("Aanbevelingsscore")
    alinea = t[t.rindex('<p class="sec-intro">', 0, i):t.index("</p>", j)]
    assert "Lees dit als aanvullende context" in alinea
    assert alinea.endswith("vandaan komt. Bij Loep Vertrek is dit het oordeel van mensen die "
                           "vertrokken, niet van wie er nu werkt.")


def test_v16_behoud_en_start_zonder_die_zin():
    for scan in ("retention", "onboarding"):
        assert "oordeel van mensen die vertrokken" not in _enps_block(-40, ENPS, scan_type=scan)


def test_v16_gerenderd_vertrekrapport_met_enps():
    t = _plain(_html(VERTREK_BIJLAGE.key))
    assert "Aanbevelingsscore" in t
    assert t.count("oordeel van mensen die vertrokken") == 1

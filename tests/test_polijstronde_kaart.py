"""R7/V7, R19, R22, V10 en R23 (polijstronde taak 5): de richtingkaart.

- R7/V7: twee tellingen van hetzelfde getal op één pagina. Onder de keten van
  de kaart staat dat het een andere telling is dan die bij de toelichting, met
  een paginaverwijzing naar die toelichting.
- R22: "Niets" staat apart onder de richtingen, ook bij 0 stemmen; de
  weegregel bij de vertaalvraag noemt de richtingen bij naam.
- R19: de niet gekozen opties in één regel onder de tabel.
- V10: de beperkte-basis-regel ook als een richting op minder dan tien
  veranderkeuzes rust.
- R23: de kop van het blok blijft bij de kaarten.
"""
import re

import pytest

from backend.products.shared.deepening import direction_option_texts, direction_state
from backend.report_css import build_css
from backend.report_html import (
    _direction_card_cell,
    _drempeltabel,
    _richtingen_weging,
    _verdieping_anker,
)
from scripts import stresstest_report as st

FK = "growth"


def _keys(scan_type):
    keys = list(direction_option_texts(scan_type, FK))
    none_key = next(k for k in keys if k.endswith("_none"))
    routes = [k for k in keys if not k.endswith(("_none", "_other"))]
    return none_key, routes


def _agg(counts):
    n = sum(counts.values())
    return {"answered": n, "counts": counts, "other_texts": [], "lowest_n": n,
            "offered": n, "skipped": 0}


def _kaart(counts, scan_type="retention", **kw):
    a = _agg(counts)
    return _direction_card_cell("startpunt", label="Groeiperspectief", agg=a,
                                scan_type=scan_type, factor_key=FK,
                                n_total=a["answered"], factor_score=6.2, **kw)


def _plain(html):
    return re.sub(r"\s+", " ", re.sub(r"<[^>]+>", " ", html)).strip()


# ── R22: niets apart ─────────────────────────────────────────────────────────

@pytest.mark.parametrize("scan_type", ["retention", "exit"])
def test_niets_staat_onder_de_richtingen(scan_type):
    none_key, (a, b, *_r) = _keys(scan_type)
    # Niets (3) is groter dan route b (2): vroeger stond hij daarom ertussen.
    html = _kaart({a: 5, b: 2, none_key: 3}, scan_type)
    rijen = re.findall(r"<tr(?: class=\"([^\"]*)\")?>", html)
    assert rijen[-1] == "dir-niets"
    assert rijen[:-1] == ["", ""]
    niets = direction_option_texts(scan_type, FK)[none_key]
    assert re.search(r'<tr class="dir-niets"><td class="iq">' + re.escape(niets)
                     + r'</td><td class="is">3 van de 10 \(30%\)</td></tr></table>', html)


@pytest.mark.parametrize("scan_type", ["retention", "exit"])
def test_niets_rij_ook_bij_nul(scan_type):
    none_key, (a, b, *_r) = _keys(scan_type)
    html = _kaart({a: 11, b: 4}, scan_type)
    niets = direction_option_texts(scan_type, FK)[none_key]
    assert re.search(r'<tr class="dir-niets"><td class="iq">' + re.escape(niets)
                     + r'</td><td class="is">0 van de 15 \(0%\)</td></tr>', html)


def test_anders_telt_mee_bij_de_veranderopties():
    none_key, (a, *_r) = _keys("retention")
    other = next(k for k in direction_option_texts("retention", FK) if k.endswith("_other"))
    html = _kaart({a: 6, other: 4, none_key: 5}, "retention")
    volgorde = re.findall(r'<td class="iq">(.*?)</td>', html)
    teksten = direction_option_texts("retention", FK)
    assert volgorde == [teksten[a], teksten[other], teksten[none_key]]


def test_too_few_toont_geen_tabel_en_geen_niets_rij():
    _n, (a, *_r) = _keys("retention")
    html = _kaart({a: 2}, "retention")
    assert "dir-too_few" in html
    assert "dir-niets" not in html and "dir-unchosen" not in html


def test_weegregel_noemt_de_richtingen_bij_naam():
    t = direction_option_texts("retention", "workload")
    s = direction_state(_agg({"wld_recovery": 3, "wld_peaks": 2, "wld_scope": 2,
                              "wld_planning": 2, "wld_none": 2}), "workload", 6.2)
    assert s["state"] == "divided"
    tweeden = sorted(["wld_peaks", "wld_scope", "wld_planning"])
    assert _richtingen_weging(s, "retention", "workload") == (
        "De meest gekozen richtingen op de kaart bij ‘Wat er moet gebeuren’ zijn "
        f"‘{t['wld_recovery']}’ (3) en ‘{t[tweeden[0]]}’, ‘{t[tweeden[1]]}’ en "
        f"‘{t[tweeden[2]]}’ (elk 2). ‘Niets, dit zit hier goed’, gekozen door 2 van de 11 "
        "(18%), is geen richting en telt hier niet mee.")


def test_weegregel_een_gedeelde_hoogste_telling():
    t = direction_option_texts("retention", "workload")
    s = direction_state(_agg({"wld_peaks": 3, "wld_scope": 3, "wld_none": 2}), "workload", 6.2)
    assert _richtingen_weging(s, "retention", "workload") == (
        "De meest gekozen richtingen op de kaart bij ‘Wat er moet gebeuren’ zijn "
        f"‘{t['wld_peaks']}’ en ‘{t['wld_scope']}’ (elk 3). ‘Niets, dit zit hier goed’, "
        "gekozen door 2 van de 8, is geen richting en telt hier niet mee.")


# ── R19: niet gekozen opties ─────────────────────────────────────────────────

@pytest.mark.parametrize("scan_type", ["retention", "exit"])
def test_niet_gekozen_opties_in_een_regel(scan_type):
    _n, (a, b, *rest) = _keys(scan_type)
    html = _kaart({a: 11, b: 4}, scan_type)
    m = re.search(r'<div class="dir-unchosen">(.*?)</div>', html)
    assert m and m.group(1).startswith("Niet gekozen: ")
    teksten = direction_option_texts(scan_type, FK)
    for k in rest:
        assert teksten[k] in m.group(1)
    assert teksten[a] not in m.group(1) and teksten[b] not in m.group(1)
    assert "Niets" not in m.group(1) and "Anders" not in m.group(1)
    namen = [f"‘{teksten[k]}’" for k in rest]
    assert m.group(1) == "Niet gekozen: " + ", ".join(namen[:-1]) + " en " + namen[-1] + "."


def test_geen_niet_gekozen_regel_als_alles_gekozen_is():
    _n, routes = _keys("retention")
    html = _kaart({k: 2 for k in routes}, "retention")
    assert "dir-unchosen" not in html


def test_een_niet_gekozen_optie_zonder_opsomming():
    _n, routes = _keys("retention")
    counts = {k: 3 for k in routes[:-1]}
    html = _kaart(counts, "retention")
    tekst = direction_option_texts("retention", FK)[routes[-1]]
    assert f'<div class="dir-unchosen">Niet gekozen: ‘{tekst}’.</div>' in html


# ── V10: voorbehoud op de echte basis ────────────────────────────────────────

def test_voorbehoud_bij_richting_op_weinig_veranderkeuzes():
    none_key, (a, b, *_r) = _keys("exit")
    # Vertrek p.11: 4 van de 5 die om verandering vroegen, 3 kozen niets.
    html = _kaart({a: 4, b: 1, none_key: 3}, "exit")
    assert "dir-card dir-clear" in html
    assert "Beperkte basis" in html


def test_voorbehoud_bij_grootste_groep_op_weinig_veranderkeuzes():
    _n, (a, *rest) = _keys("retention")
    # 3 van de 7 veranderkeuzes: grootste groep zonder meerderheid.
    html = _kaart({a: 3, **{k: 1 for k in rest[:4]}}, "retention")
    assert "dir-card dir-plurality" in html
    assert "Beperkte basis" in html


def test_geen_voorbehoud_vanaf_tien_veranderkeuzes():
    _n, (a, b, *_r) = _keys("retention")
    html = _kaart({a: 8, b: 3}, "retention")
    assert "dir-card dir-clear" in html
    assert "Beperkte basis" not in html


def test_geen_voorbehoud_bij_verdeeld_boven_vier_antwoorden():
    # V10 geldt alleen voor een richting (clear, plurality): een verdeelde
    # kaart wijst er geen aan.
    none_key, (a, b, *_r) = _keys("retention")
    html = _kaart({a: 2, b: 2, none_key: 2}, "retention")
    assert "dir-card dir-divided" in html
    assert "Beperkte basis" not in html


def test_drempeltabel_noemt_de_nieuwe_voorbehoudregel():
    tekst = _plain(_drempeltabel("retention", direction_active=True,
                                 direction_degraded=False, deepening_active=True,
                                 ranking_active=True))
    assert ("bij drie of vier antwoorden, en bij een richting die op minder dan tien "
            "veranderkeuzes rust, staat er een beperkte-basis-regel bij") in tekst


# ── R7/V7: twee tellingen ────────────────────────────────────────────────────

ANDERE_TELLING = ("Dit is een andere telling dan de 16 bij de toelichting op pagina : daar "
                  "gaat het om wie op dit onderwerp duidelijk laag antwoordde, hier om wie "
                  "dit als eigen laagste onderwerp had.")


def test_andere_telling_onder_de_keten_met_verwijzing():
    _n, (a, b, *_r) = _keys("retention")
    html = _kaart({a: 11, b: 4}, "retention", deep_answered=16, verdieping_page=True)
    assert ANDERE_TELLING in _plain(html)
    # De verwijzing is een echte link, buiten de geëscapete tekst.
    assert f'<a class="pref" href="#{_verdieping_anker(FK)}"></a>' in html
    assert "&lt;a" not in html
    # Onder de keten.
    assert html.index('class="dir-chain"') < html.index("Dit is een andere telling")


def test_andere_telling_enkelvoud():
    _n, (a, b, *_r) = _keys("retention")
    html = _kaart({a: 11, b: 4}, "retention", deep_answered=1, verdieping_page=True)
    assert "Dit is een andere telling dan die ene bij de toelichting op pagina" in _plain(html)


@pytest.mark.parametrize("kw", [
    {},
    {"deep_answered": 16, "verdieping_page": False},
    {"deep_answered": 0, "verdieping_page": True},
    {"deep_answered": None, "verdieping_page": True},
])
def test_geen_andere_telling_zonder_toelichting(kw):
    _n, (a, b, *_r) = _keys("retention")
    html = _kaart({a: 11, b: 4}, "retention", **kw)
    assert "andere telling" not in html
    assert "sec-verdieping-" not in html


def test_verdieping_anker():
    assert _verdieping_anker("growth") == "sec-verdieping-growth"


def _scenario_html(key):
    sc = {s.key: s for s in st.SCENARIOS}[key]
    with open(st.run_scenario(sc)["html"], encoding="utf-8") as fh:
        return fh.read()


def _assert_ankers_bestaan(html):
    for anker in set(re.findall(r'href="#([a-z0-9_-]+)"', html)):
        assert html.count(f'id="{anker}"') == 1, anker


def test_tweede_telling_verwijst_naar_de_toelichting():
    html = _scenario_html("02_een_lage_factor")
    assert "Dit is een andere telling dan de" in html
    assert 'href="#sec-verdieping-growth"' in html
    # Het anker staat op de toelichting zelf, het leidraad-anker blijft op de
    # kop van de eerste verdiepingspagina.
    assert re.search(r'<div class="card" id="sec-verdieping-growth"><span class="eyebrow">'
                     r'Welke toelichting respondenten kozen', html)
    assert re.search(r'<div class="ch-head" id="sec-verdieping">', html)
    _assert_ankers_bestaan(html)


def test_vertrek_scenario_ankers_kloppen():
    html = _scenario_html("08_exit_n12")
    _assert_ankers_bestaan(html)


def test_start_heeft_geen_richtingkaart_en_geen_verwijzing():
    html = _scenario_html("20_onboarding_sanity")
    assert "andere telling" not in html
    assert "sec-verdieping-" not in html
    _assert_ankers_bestaan(html)


# ── R23: kop bij de kaarten ──────────────────────────────────────────────────

def test_kop_blijft_bij_de_kaarten():
    css = re.sub(r"\s+", " ", build_css("retention"))
    assert re.search(r"\.dir-intro, \.dir-totals \{[^}]*break-after: avoid", css)
    assert re.search(r"\.dir-tbl tr\.dir-niets td \{[^}]*border-top", css)
    assert re.search(r"\.dir-unchosen \{[^}]*font-size: 10px", css)
    # .dir-block zelf blijft breekbaar (scenario 14, plan 3b).
    assert not re.search(r"\.dir-block \{[^}]*break-inside: avoid", css)


def test_geen_streepjes_in_de_nieuwe_regels():
    none_key, (a, b, *_r) = _keys("exit")
    html = _kaart({a: 4, b: 1, none_key: 3}, "exit", deep_answered=6, verdieping_page=True)
    assert "—" not in html and "–" not in html

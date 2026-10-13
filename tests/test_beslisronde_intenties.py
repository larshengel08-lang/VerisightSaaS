"""Beslisronde na de polijstronde, taak 3 (besluit Lars 12-10): A5.

Loep Behoud toont blijf- en vertrekintentie per afdeling, voor afdelingen met
minstens MIN_DISTRIBUTION_N (10) antwoorden. Daaronder geen cijfers, ook niet
gebundeld. Pagina twee zei tot nu toe "dit rapport splitst ze niet per afdeling
uit"; die zin verwijst nu naar het blok, of zegt waarom het er niet staat.

Privacy (harde regel): ook geen combinatie die een kleine groep herleidbaar
maakt. Pagina twee toont de totalen voor de hele organisatie; trek je daar de
getoonde afdelingen van af, dan houd je de rest over. Is die rest 1 tot 9
mensen, dan valt de kleinste getoonde afdeling uit het blok (met een regel die
dat zegt), zodat de rest minstens 10 is.
"""
import html as htmllib
import re

import pytest

from backend.report_distribution import MIN_DISTRIBUTION_N, ZONE_HIGH
from backend.report_html import (
    INTENTIE_DUIDING_KERN,
    LEIDRAAD_ANKERS,
    _department_intent_rows,
    _department_segment_rows,
    _drempeltabel,
    _factor_label,
    _intentie_afdelingen_block,
    _intent_staat,
    _intentie_duiding,
    _segment_block,
    render_retention_report_html,
)
from scripts import stresstest_report as st
from tests.test_report_degraded_page_two import _body


pytestmark = pytest.mark.usefixtures("stresstest_naar_tmp")

ANKER = LEIDRAAD_ANKERS["intenties"]


def _plain(fragment: str) -> str:
    t = htmllib.unescape(re.sub(r"\s+", " ", re.sub(r"<[^>]+>", " ", fragment)))
    return t.replace("­", "").replace(" ", " ").strip()


def _resp(dept, n, stay=6.0, to=4.0, signal=6.0):
    return [{"department": dept, "signal_score": signal, "stay": stay, "turnover": to}
            for _ in range(n)]


def _r(dept, stay=6.0, to=4.0, signal=6.0):
    return {"department": dept, "signal_score": signal, "stay": stay, "turnover": to}


def _seg(*specs):
    """Segmentrijen zoals build_report_data ze maakt, uit (afdeling, n)."""
    rows = []
    for dept, n in specs:
        rows.extend({"department": dept, "signal_score": 6.0} for _ in range(n))
    return _department_segment_rows(rows)


def _info(resp, *specs):
    stay_n = sum(1 for r in resp if r["stay"] is not None)
    to_n = sum(1 for r in resp if r["turnover"] is not None)
    return _department_intent_rows(resp, _seg(*specs), total_stay_n=stay_n, total_to_n=to_n)


# ── Data ─────────────────────────────────────────────────────────────────────

def test_alleen_afdelingen_vanaf_tien():
    resp = _resp("Operations", 14) + _resp("Sales", 9) + _resp("IT", 6) + _resp("HR", 11)
    info = _info(resp, ("Operations", 14), ("Sales", 9), ("IT", 6), ("HR", 11))
    # Volgorde van de afdelingstabel: gelijke score, dus grootste eerst.
    assert [r["department"] for r in info["rows"]] == ["Operations", "HR"]
    assert all(r["n"] >= MIN_DISTRIBUTION_N for r in info["rows"])
    assert info["reason"] == ""
    assert info["dropped"] == []


def test_restgroep_komt_er_nooit_in():
    # Sales/IT/HR samen 15: in de tabel als "Overige afdelingen", nooit in dit blok.
    resp = _resp("Operations", 12) + _resp("Finance", 10) + _resp("Sales", 4) + \
        _resp("IT", 4) + _resp("HR", 4) + _resp("CS", 3)
    info = _info(resp, ("Operations", 12), ("Finance", 10), ("Sales", 4), ("IT", 4),
                 ("HR", 4), ("CS", 3))
    assert sorted(r["department"] for r in info["rows"]) == ["Finance", "Operations"]
    assert all(r["department"] != "Overige afdelingen" for r in info["rows"])


def test_volgorde_volgt_de_afdelingstabel():
    resp = _resp("A", 10) + _resp("B", 12) + _resp("C", 11) + _resp("D", 10)
    seg = [{"department": d, "n": n, "avg": avg, "scores": [], "is_pooled": False}
           for d, n, avg in (("C", 11, 4.0), ("A", 10, 5.0), ("B", 12, 6.0), ("D", 10, 7.0))]
    info = _department_intent_rows(resp, seg, total_stay_n=43, total_to_n=43)
    assert [r["department"] for r in info["rows"]] == ["C", "A", "B", "D"]


def test_zelfde_grenzen_als_pagina_twee():
    # Blijfintentie onder ZONE_LOW (5) telt als onder de 5; vertrekintentie vanaf
    # ZONE_HIGH (6,5) als veel vertrekgedachten, met 6,5 zelf erbij.
    resp = ([_r("Ops", stay=4.9, to=ZONE_HIGH)] * 3
            + [_r("Ops", stay=5.0, to=6.4)] * 9)
    resp += _resp("Fin", 10)
    info = _info(resp, ("Ops", 12), ("Fin", 10))
    ops = next(r for r in info["rows"] if r["department"] == "Ops")
    assert ops["n"] == 12
    assert ops["to_high"] == 3
    assert ops["to_n"] == 12 and ops["stay_n"] == 12
    assert ops["stay_avg"] == round((4.9 * 3 + 5.0 * 9) / 12, 2)


def test_afdeling_met_te_weinig_intentiescores_valt_eruit():
    # Tien mensen zonder afdeling houden de rest boven de privacygrens; anders
    # zou ook Finance wegvallen (de negen van Ops zijn dan af te leiden).
    resp = [_r("Ops", stay=None)] * 3 + _resp("Ops", 9) + \
        _resp("Fin", 10) + _resp(None, 10)
    info = _info(resp, ("Ops", 12), ("Fin", 10))
    assert [r["department"] for r in info["rows"]] == ["Fin"]


def test_geen_afdeling_van_tien():
    resp = _resp("A", 9) + _resp("B", 8) + _resp("C", 7)
    info = _info(resp, ("A", 9), ("B", 8), ("C", 7))
    assert info == {"rows": [], "dropped": [], "reason": "geen"}


def test_zonder_afdelingen_niet_vastgelegd():
    resp = _resp(None, 30)
    info = _department_intent_rows(resp, [], total_stay_n=30, total_to_n=30)
    assert info == {"rows": [], "dropped": [], "reason": "niet_vastgelegd"}


def test_telt_alleen_respondenten_met_een_werkbeeld():
    # Tien ingevuld, maar één zonder werkbeeldscore (risk_score None): de
    # afdelingstabel telt 9, dus het blok ook. Ops haalt de 10 niet.
    resp = _resp("Ops", 9) + [_r("Ops", signal=None)] + _resp("Fin", 12) + _resp(None, 10)
    seg = _department_segment_rows([r for r in resp if r["signal_score"] is not None])
    info = _department_intent_rows(resp, seg, total_stay_n=32, total_to_n=32)
    assert [r["department"] for r in info["rows"]] == ["Fin"]
    assert info["rows"][0]["n"] == 12


def test_ingevuld_is_de_n_van_de_tabelrij():
    resp = _resp("Ops", 14) + _resp("Fin", 11)
    seg = _seg(("Ops", 14), ("Fin", 11))
    info = _department_intent_rows(resp, seg, total_stay_n=25, total_to_n=25)
    n_tabel = {row["department"]: row["n"] for row in seg}
    assert {r["department"]: r["n"] for r in info["rows"]} == n_tabel


def test_alleen_werkbeeld_telt_voor_een_afdeling_van_tien():
    # Twaalf in Ops, maar acht met werkbeeld: telt als geen afdeling van tien.
    resp = _resp("Ops", 8) + [_r("Ops", signal=None)] * 4 + _resp("Fin", 6)
    seg = _department_segment_rows([r for r in resp if r["signal_score"] is not None])
    info = _department_intent_rows(resp, seg, total_stay_n=18, total_to_n=18)
    assert info["reason"] == "geen"


def test_afdeling_van_tien_maar_te_weinig_intentiescores():
    resp = [_r("Ops", to=None)] * 3 + _resp("Ops", 9) + _resp("Fin", 6) + _resp(None, 10)
    info = _info(resp, ("Ops", 12), ("Fin", 6))
    assert info == {"rows": [], "dropped": [], "reason": "te_weinig_intentie"}


def test_wel_een_afdeling_van_tien_maar_geen_afdelingstabel():
    # Eén afdeling van 12, de rest te klein voor een tabel (minstens twee
    # afdelingen van 5): geen pagina om het blok op te zetten.
    resp = _resp("Ops", 12) + _resp("Sales", 4) + _resp("IT", 3)
    info = _info(resp, ("Ops", 12), ("Sales", 4), ("IT", 3))
    assert info["rows"] == [] and info["reason"] == "geen_tabel"


def test_rest_van_een_tot_negen_laat_de_kleinste_afdeling_vallen():
    # 15 + 11 + 3: zonder ingreep is de rest (3) uit de totalen af te leiden.
    resp = _resp("Ops", 15) + _resp("Fin", 11) + _resp("IT", 3)
    info = _info(resp, ("Ops", 15), ("Fin", 11), ("IT", 3))
    assert [r["department"] for r in info["rows"]] == ["Ops"]
    assert info["dropped"] == [{"department": "Fin", "n": 11}]
    assert info["reason"] == ""


def test_rest_zonder_afdeling_telt_ook_mee():
    resp = _resp("Ops", 15) + _resp("Fin", 11) + _resp(None, 2)
    info = _department_intent_rows(resp, _seg(("Ops", 15), ("Fin", 11)),
                                   total_stay_n=28, total_to_n=28)
    assert [r["department"] for r in info["rows"]] == ["Ops"]


@pytest.mark.parametrize("rest", [0, 10, 17])
def test_rest_van_nul_of_vanaf_tien_is_veilig(rest):
    resp = _resp("Ops", 15) + _resp("Fin", 11) + _resp("IT", rest)
    specs = [("Ops", 15), ("Fin", 11)] + ([("IT", rest)] if rest else [])
    info = _info(resp, *specs)
    names = sorted(r["department"] for r in info["rows"])
    assert "Ops" in names and "Fin" in names
    assert info["dropped"] == []


def test_een_afdeling_met_een_kleine_rest_geeft_herleidbaar():
    # Twee afdelingen in de tabel (12 en 6), alleen de eerste haalt 10; de rest
    # (6) is uit de totalen af te leiden. Dan geen blok.
    resp = _resp("Ops", 12) + _resp("Fin", 6)
    info = _info(resp, ("Ops", 12), ("Fin", 6))
    assert info["rows"] == []
    assert info["dropped"] == [{"department": "Ops", "n": 12}]
    assert info["reason"] == "herleidbaar"


def test_rest_per_maat_apart_getoetst():
    # Vertrekintentie ontbreekt bij twee mensen buiten de afdelingen; de rest op
    # die maat is dan 2, ook al is de rest op blijfintentie 12.
    resp = (_resp("Ops", 15) + _resp("Fin", 11)
            + [_r("IT", to=None)] * 10
            + [_r("IT")] * 2)
    info = _info(resp, ("Ops", 15), ("Fin", 11), ("IT", 12))
    # IT haalt de 10 op vertrekintentie niet; de rest op die maat is 2.
    assert [r["department"] for r in info["rows"]] == ["Ops"]
    assert info["dropped"] == [{"department": "Fin", "n": 11}]


# ── Blok ─────────────────────────────────────────────────────────────────────

def _rij(dept="Operations", n=14, stay_avg=3.9, to_high=6):
    return {"department": dept, "n": n, "stay_avg": stay_avg, "stay_n": n,
            "to_n": n, "to_high": to_high}


def test_blok_kop_uitleg_kolommen_en_anker():
    html = _intentie_afdelingen_block({"rows": [_rij()], "dropped": [], "reason": ""})
    assert html.count('id="' + ANKER + '"') == 1
    assert 'class="no-break' in html
    t = _plain(html)
    assert "Blijf- en vertrekintentie per afdeling" in t
    assert ("Alleen afdelingen met minstens 10 antwoorden, dezelfde grens als voor alle "
            "onderwerpen per afdeling.") in t
    for kop in ("Afdeling", "Ingevuld", "Blijfintentie", "Veel vertrekgedachten"):
        assert kop in t
    assert "Operations" in t
    assert "3.9/10" in t
    assert _factor_label(3.9) in t
    # De telling onder de 5 staat op pagina twee, niet in dit smalle blok.
    assert "onder de 5" not in t
    assert "6 van de 14" in t
    assert "vanaf 6,5" in t


def test_blok_label_volgt_de_getoonde_score():
    # 4.96 toont als 5.0: aandachtspunt, niet kwetsbaar (B15, zoals pagina twee).
    t = _plain(_intentie_afdelingen_block({"rows": [_rij(stay_avg=4.96)], "dropped": [],
                                           "reason": ""}))
    assert "5.0/10" in t
    assert _factor_label(4.96) in t and _factor_label(4.96) == _factor_label(5.0)


def test_blok_leeg_zonder_rijen():
    for reason in ("geen", "geen_tabel", "herleidbaar"):
        assert _intentie_afdelingen_block({"rows": [], "dropped": [], "reason": reason}) == ""
    assert _intentie_afdelingen_block(None) == ""


def test_blok_meldt_een_weggelaten_afdeling():
    html = _intentie_afdelingen_block({"rows": [_rij()], "dropped": [{"department": "Finance",
                                                                      "n": 11}], "reason": ""})
    t = _plain(html)
    assert "Finance (11 antwoorden) staat hier niet in" in t
    assert "minder dan 10 mensen" in t
    tabel = html[html.index("<table"):html.index("</table>")]
    assert "Finance" not in tabel


def test_blok_staat_onder_de_afdelingstabel():
    seg = _seg(("Operations", 14), ("Sales", 9))
    blok = _intentie_afdelingen_block({"rows": [_rij()], "dropped": [], "reason": ""})
    html = _segment_block(seg, scan_type="retention", intent_html=blok)
    assert html.index("</table>") < html.index('id="' + ANKER + '"')


# ── Pagina twee ──────────────────────────────────────────────────────────────

STAY = [2.0] * 25 + [5.5] * 8 + [8.0] * 6
TO = [7.0] * 19 + [3.0] * 20
KERN = ("Blijf- en vertrekintentie zeggen hoe dringend behoud hier is, niet waarom, en ook "
        "niet wie er vertrekt.")


def _duiding(staat, weg=None):
    return _intentie_duiding(3.9, STAY, TO, startpunt_label="Groeiperspectief",
                             startpunt_score=4.5, intenties_afdeling=staat,
                             intenties_weggelaten=weg)


def test_kern_nieuw():
    assert INTENTIE_DUIDING_KERN == KERN


def test_pagina_twee_met_blok_verwijst_ernaar():
    html = _duiding("blok")
    assert html.count('href="#' + ANKER + '"') == 1
    assert _plain(html) == (
        "19 van de 39 hebben veel vertrekgedachten (vertrekintentie vanaf 6,5). " + KERN
        + " Per afdeling staan ze bij de afdelingen (pagina ), voor afdelingen met minstens "
        "10 antwoorden. Daarom begint het gesprek bij Groeiperspectief: daar zie je waar het "
        "wringt, en daar kan het MT zelf iets besluiten.")


@pytest.mark.parametrize("weg, staart", [
    ([{"department": "Finance", "n": 11}],
     "; Finance staat er niet in, zodat een kleine groep niet herleidbaar wordt."),
    ([{"department": "Finance", "n": 11}, {"department": "IT", "n": 10}],
     "; Finance en IT staan er niet in, zodat een kleine groep niet herleidbaar wordt."),
])
def test_pagina_twee_noemt_een_weggelaten_afdeling(weg, staart):
    t = _plain(_duiding("blok", weg))
    assert ("Per afdeling staan ze bij de afdelingen (pagina ), voor afdelingen met minstens "
            "10 antwoorden" + staart + " Daarom begint") in t


@pytest.mark.parametrize("weg", [None, []])
def test_pagina_twee_zonder_weggelaten_afdeling_onveranderd(weg):
    assert _duiding("blok", weg) == _duiding("blok")
    assert "herleidbaar" not in _duiding("blok", weg)


def test_pagina_twee_afdelingen_niet_vastgelegd():
    t = _plain(_duiding("niet_vastgelegd"))
    assert (KERN + " Per afdeling staan ze niet in dit rapport: afdelingen zijn niet vastgelegd "
            "bij deze meting. Daarom begint") in t


def test_pagina_twee_te_weinig_intentiescores():
    t = _plain(_duiding("te_weinig_intentie"))
    assert (KERN + " Per afdeling staan ze alleen bij afdelingen met minstens 10 antwoorden op "
            "deze vragen; die zijn er in deze meting niet. Daarom begint") in t


def test_pagina_twee_zonder_afdeling_van_tien():
    t = _plain(_duiding("geen"))
    assert (KERN + " Per afdeling staan ze alleen bij afdelingen met minstens 10 antwoorden; "
            "die zijn er in deze meting niet. Daarom begint") in t
    assert "href" not in _duiding("geen")


def test_pagina_twee_zonder_afdelingstabel():
    t = _plain(_duiding("geen_tabel"))
    assert KERN + " Per afdeling staan ze niet in dit rapport" in t
    assert "minstens 5 antwoorden" in t
    assert "href" not in _duiding("geen_tabel")


def test_pagina_twee_bij_herleidbare_rest():
    t = _plain(_duiding("herleidbaar"))
    assert (KERN + " Per afdeling staan ze niet in dit rapport: met de cijfers voor de hele "
            "organisatie zou je anders de antwoorden van een groep van minder dan 10 mensen "
            "kunnen afleiden. Daarom begint") in t


# ── _intent_staat ────────────────────────────────────────────────────────────

def test_intent_staat_blok_en_redenen():
    info = {"rows": [_rij()], "dropped": [], "reason": ""}
    assert _intent_staat(info, "<div>blok</div>") == "blok"
    assert _intent_staat(None, "") is None
    for reden in ("niet_vastgelegd", "geen", "geen_tabel", "te_weinig_intentie", "herleidbaar"):
        assert _intent_staat({"rows": [], "dropped": [], "reason": reden}, "") == reden


@pytest.mark.parametrize("info, blok", [
    ({"rows": [{"department": "X"}], "dropped": [], "reason": ""}, ""),   # rijen zonder blok
    ({"rows": [], "dropped": [], "reason": ""}, ""),                       # lege reden
    ({"rows": [], "dropped": [], "reason": "onzin"}, ""),                  # onbekende reden
    ({"rows": [], "dropped": [], "reason": "geen"}, "<div>blok</div>"),    # blok zonder rijen
    (None, "<div>blok</div>"),
])
def test_intent_staat_onmogelijke_staat_faalt_luid(info, blok):
    with pytest.raises(ValueError):
        _intent_staat(info, blok)


def test_pagina_twee_zonder_gegevens_zegt_niets_over_afdelingen():
    t = _plain(_duiding(None))
    assert "Per afdeling" not in t
    assert KERN in t


def test_drempeltabel_noemt_intenties_per_afdeling_alleen_met_blok():
    met = _plain(_drempeltabel("retention", intenties_per_afdeling=True))
    zonder = _plain(_drempeltabel("retention"))
    assert "blijf- en vertrekintentie per afdeling" in met
    assert "blijf- en vertrekintentie per afdeling" not in zonder


# ── Gerenderde scenario's ────────────────────────────────────────────────────

_CACHE: dict[str, str] = {}


def _html(key: str) -> str:
    if key not in _CACHE:
        sc = {s.key: s for s in st.SCENARIOS}[key]
        _CACHE[key] = _body(open(st.run_scenario(sc)["html"], encoding="utf-8").read())
    return _CACHE[key]


def _p02(body: str) -> str:
    i = body.index('class="p02-duiding"')
    return body[i:body.index("</p>", i)]


def test_scenario_11_alle_afdelingen_in_het_blok_en_p02_verwijst():
    body = _html("11_groot_normaal")
    assert body.count('id="' + ANKER + '"') == 1
    assert body.count('href="#' + ANKER + '"') == 1
    assert 'href="#' + ANKER + '"' in _p02(body)
    i = body.index('id="' + ANKER + '"')
    blok = _plain(body[i:body.index("</table>", i)])
    for dept in ("Operations", "Sales", "Finance", "IT", "Customer Success", "Marketing", "HR"):
        assert dept in blok
    # Het blok staat op de afdelingspagina, na de afdelingstabel.
    assert body.index('id="' + LEIDRAAD_ANKERS["afdelingen"] + '"') < i
    assert "dit rapport splitst ze niet per afdeling uit" not in body


def test_scenario_10_geen_afdeling_van_tien():
    body = _html("10_veel_kleine_afdelingen")
    assert 'id="' + ANKER + '"' not in body
    assert "die zijn er in deze meting niet" in _plain(_p02(body))


def test_scenario_02_alleen_operations():
    body = _html("02_een_lage_factor")
    i = body.index('id="' + ANKER + '"')
    rijen = re.findall(r"<tr>(.*?)</tr>", body[i:body.index("</table>", i)], re.S)
    namen = [_plain(r.split("</td>")[0]) for r in rijen if "<td" in r]
    assert namen == ["Operations"]


def test_vertrek_heeft_geen_blok():
    body = _html("08_exit_n12")
    assert 'id="' + ANKER + '"' not in body
    assert "Blijf- en vertrekintentie per afdeling" not in body


# ── Plaats op de afdelingspagina (paginapassing, gemeten in het productie-image) ─

_FR = {"Operations": {"factors": [("workload", 4.0, 14), ("growth", 4.5, 14)], "omitted": 0}}


def _seg_html(factor_rows=_FR, blok=True):
    seg = _seg(("Operations", 14), ("Sales", 9))
    intent = _intentie_afdelingen_block({"rows": [_rij()], "dropped": [], "reason": ""}) if blok else ""
    return _segment_block(seg, factor_rows=factor_rows, scan_type="retention", intent_html=intent)


def test_blok_staat_naast_het_enige_subblok():
    html = _seg_html()
    grp = re.findall(r'<tbody class="sub-grp">(.*?)</tbody>', html, re.S)
    assert len(grp) == 1
    assert "Operations (n=14)" in grp[0]
    assert 'id="' + ANKER + '"' in grp[0]


def _staart_wrapper(html):
    """De no-break-div die direct de conclusie (navy) opent, of None."""
    i = html.index('<div class="navy-anchor">')
    voor = html[:i].rstrip()
    return voor.endswith('<div class="no-break">')


def test_conclusie_blijft_bij_een_raster_van_een_rij():
    html = _seg_html()
    assert _staart_wrapper(html)
    # De wrapper omvat conclusie én raster: na het raster sluit hij.
    i = html.index('<div class="navy-anchor">')
    start = html.rindex('<div class="no-break">', 0, i)
    raster_eind = html.index("</table>", html.index('<table class="sub-cols met-intentie">'))
    assert html[raster_eind + len("</table>"):].lstrip().startswith("</div>")
    assert start < html.index('<table class="sub-cols met-intentie">')
    # Zonder intentieblok verandert er niets: het subblok staat alleen, geen wrapper.
    zonder = _seg_html(blok=False)
    assert "sub-cols" not in zonder
    assert not _staart_wrapper(zonder)


def test_raster_van_meer_rijen_krijgt_geen_wrapper():
    seg = _seg(("A", 14), ("B", 12), ("C", 11))
    fr = {d: {"factors": [("workload", 5.0, 10)], "omitted": 0} for d in ("A", "B", "C")}
    intent = _intentie_afdelingen_block({"rows": [_rij("A")], "dropped": [], "reason": ""})
    html = _segment_block(seg, factor_rows=fr, scan_type="retention", intent_html=intent)
    assert html.count('<tbody class="sub-grp">') == 2
    assert not _staart_wrapper(html)


def test_blok_zonder_subblokken_staat_alleen():
    html = _seg_html(factor_rows=None)
    assert "sub-cols" not in html
    assert 'id="' + ANKER + '"' in html


def test_compacte_rasterregels_alleen_met_intentieblok():
    from backend.report_css import build_css
    css = build_css("retention")
    assert ".sub-cols.met-intentie .item-tbl.seg-tbl td" in css
    assert ".sub-cols.met-intentie .seg-sub td.sub-band" in css
    assert '<table class="sub-cols met-intentie">' in _seg_html()
    # Zonder intentieblok houdt een raster de gewone klasse.
    seg = _seg(("A", 14), ("B", 12))
    fr = {d: {"factors": [("workload", 5.0, 10)], "omitted": 0} for d in ("A", "B")}
    zonder = _segment_block(seg, factor_rows=fr, scan_type="retention")
    assert '<table class="sub-cols">' in zonder and "met-intentie" not in zonder


def test_scenario_11_afdelingen_tellen_op_tot_pagina_twee():
    """Iedereen zit in een getoonde afdeling (rest 0): de tellingen per afdeling
    moeten dan precies optellen tot de zin op pagina twee. Zo kunnen blok en
    pagina twee niet op andere grenzen rekenen."""
    body = _html("11_groot_normaal")
    m = re.match(r"(\d+) van de (\d+) hebben veel vertrekgedachten", _plain(_p02(body)).split(">", 1)[-1].strip())
    assert m, _plain(_p02(body))[:120]
    i = body.index('id="' + ANKER + '"')
    tabel = body[i:body.index("</table>", i)]
    paren = [tuple(map(int, p)) for p in re.findall(r"<td[^>]*>(\d+) van de (\d+)</td>", tabel)]
    assert len(paren) == 7
    assert sum(k for k, _n in paren) == int(m.group(1))
    assert sum(n for _k, n in paren) == int(m.group(2))


# ── Gerenderd via render_retention_report_html (codereview taak 3) ───────────

def _render(intent, segment_rows=None):
    from tests.test_report_p02_mtvel import _retention_met_secties
    data = _retention_met_secties(
        avg_si=3.9, intent_resp={"stay": STAY, "turnover": TO, "engagement": [6.0] * 39},
        segment_rows=segment_rows if segment_rows is not None else _seg(("Operations", 15),
                                                                       ("Finance", 11),
                                                                       ("IT", 5)),
        segment_factor_rows=None, segment_intent=intent)
    return _body(render_retention_report_html(data))


def _p02_tekst(body):
    return _plain(_p02(body))


def test_gerenderd_weggelaten_afdeling():
    intent = {"rows": [_rij("Operations", n=15)], "dropped": [{"department": "Finance", "n": 11}],
              "reason": ""}
    body = _render(intent)
    assert body.count('id="' + ANKER + '"') == 1
    assert body.count('href="#' + ANKER + '"') == 1
    i = body.index('id="' + ANKER + '"')
    blok = body[i:body.index("</div>", body.index("</table>", i)) + 6]
    tabel = blok[blok.index("<table"):blok.index("</table>")]
    assert "Finance" not in tabel
    assert "Finance (11 antwoorden) staat hier niet in" in _plain(blok)
    assert ("; Finance staat er niet in, zodat een kleine groep niet herleidbaar wordt."
            in _p02_tekst(body))


def test_gerenderd_herleidbaar():
    intent = {"rows": [], "dropped": [{"department": "Operations", "n": 15}],
              "reason": "herleidbaar"}
    body = _render(intent)
    assert 'id="' + ANKER + '"' not in body
    assert 'href="#' + ANKER + '"' not in body
    assert "zou je anders de antwoorden van een groep van minder dan 10 mensen" in _p02_tekst(body)
    # Methodiekpagina: de drempelrij van tien noemt het blok niet.
    i = body.index('id="' + LEIDRAAD_ANKERS["drempels"] + '"')
    assert "blijf- en vertrekintentie per afdeling" not in _plain(body[i:])


def test_gerenderd_geen_tabel():
    intent = {"rows": [], "dropped": [], "reason": "geen_tabel"}
    body = _render(intent, segment_rows=[])
    assert 'href="#' + ANKER + '"' not in body
    assert 'id="' + ANKER + '"' not in body
    assert "er is geen overzicht per afdeling" in _p02_tekst(body)


def test_gerenderd_rijen_zonder_tabel_faalt_luid():
    intent = {"rows": [_rij()], "dropped": [], "reason": ""}
    with pytest.raises(ValueError):
        _render(intent, segment_rows=[])

"""Polijstronde taak 6 (R9, R10, R11, R17, R24, R25, R26): rangorde,
onderwerppagina's en jargon.

Bron: docs/rapport-koude-leesronde-2026-10-08.md, sectie 5. Elke test voert
minstens een assert uit. De scenario's renderen naar een tijdelijke map
(st.OUT_DIR wordt per module omgezet), zodat docs/stresstest niet geraakt wordt.
"""
import html as htmllib
import re

import pytest

from backend.report_distribution import distribution_block, score_distribution
from backend.report_html import (
    SDT_DIMENSION_ITEMS,
    SECTION_INTROS,
    _behoudscontext,
    _overzicht_summary_and_bands,
    _prioriteringsraster,
    _trigger_regel,
    _werkbeleving_section,
    raster_intro,
)
from backend.report_priority import CELL_TOO_FEW
from scripts import stresstest_report as st
from tests.test_report_priority_render import RESP, _row

_CACHE: dict[str, str] = {}


@pytest.fixture(scope="module")
def html_van(tmp_path_factory):
    out = tmp_path_factory.mktemp("stresstest")
    with pytest.MonkeyPatch.context() as mp:
        mp.setattr(st, "OUT_DIR", out)

        def _html(key: str) -> str:
            if key not in _CACHE:
                sc = {s.key: s for s in st.SCENARIOS}[key]
                with open(st.run_scenario(sc)["html"], encoding="utf-8") as fh:
                    _CACHE[key] = fh.read()
            return _CACHE[key]

        yield _html


def _plain(fragment: str) -> str:
    body = fragment.split("</style>")[-1]
    return htmllib.unescape(re.sub(r"\s+", " ", re.sub(r"<[^>]+>", " ", body))).strip()


# ── R9: gelijke hoogste score bij de sterke onderwerpen ─────────────────────

def test_r9_drie_gelijke_sterke_onderwerpen():
    summary, _ = _overzicht_summary_and_bands(
        [("A", 4.7), ("B", 5.6), ("C", 7.08), ("D", 7.1), ("E", 7.12)],
        laagste=["A"])
    assert summary == ("A is het enige kwetsbare punt. Drie onderwerpen vormen een "
                       "relatief sterke basis (alle drie 7.1/10): E, D, C.")


def test_r9_twee_gelijke_sterke_onderwerpen_heten_allebei():
    # Volgorde exact die van de band "sterk" (hoogste eerst, omgekeerde sortering).
    summary, bands = _overzicht_summary_and_bands(
        [("A", 4.2), ("B", 6.9), ("C", 6.9)], laagste=["A"])
    assert summary.endswith("Twee onderwerpen vormen een relatief sterke basis "
                            f"(allebei 6.9/10): {', '.join(bands['sterk'])}.")
    assert bands["sterk"] == ["C", "B"]


def test_r9_unieke_hoogste_blijft_een_onderwerp():
    summary, _ = _overzicht_summary_and_bands(
        [("A", 4.2), ("B", 6.8), ("C", 7.1)], laagste=["A"])
    assert summary == "A is het enige kwetsbare punt. C vormt een relatief sterke basis."


# ── R10: werkbeleving geduid na de drie dimensies ───────────────────────────

# Onderwerpscores: een onder 6,5 (dan klopt "zelf ook"), of alle relatief sterk.
MET_LAAG_ONDERWERP = {"growth": 4.7, "culture": 7.1}
ALLE_ONDERWERPEN_STERK = {"growth": 6.8, "culture": 7.1, "autonomy": 4.0}  # SDT telt niet mee


def _wb(scores: dict[str, float], factor_avgs: dict | None = None) -> str:
    sim, items = {}, []
    for dim, sc in scores.items():
        for ik in SDT_DIMENSION_ITEMS[dim]:
            sim[ik] = sc
            items.append((ik, f"stelling {ik}"))
    return _plain(_werkbeleving_section(scores, sim, items, "<span>kop</span>",
                                        factor_avgs=factor_avgs))


ONDER_DRUK = "Hier staat de werkbeleving zelf ook onder druk: geen van de drie scoort relatief sterk."
ONDER_DRUK_ZONDER_OOK = "Hier staat de werkbeleving onder druk: geen van de drie scoort relatief sterk."
ALLE_STERK = "Hier scoort de werkbeleving op alle drie relatief sterk."
_LAAG = {"autonomy": 5.5, "competence": 6.4, "relatedness": 4.9}


def test_r10_alle_drie_onder_65():
    t = _wb(_LAAG, MET_LAAG_ONDERWERP)
    assert ONDER_DRUK in t and ALLE_STERK not in t


def test_r10_zonder_laag_onderwerp_geen_ook():
    # 6.46 toont als 6.5: relatief sterk. Een SDT-sleutel in factor_avgs telt
    # niet als onderwerp (ORG_FACTOR_KEYS).
    for fa in (ALLE_ONDERWERPEN_STERK, {"growth": 6.46}, None, {}):
        t = _wb(_LAAG, fa)
        assert ONDER_DRUK_ZONDER_OOK in t, fa
        assert "zelf ook" not in t, fa


def test_r10_alle_drie_vanaf_65_op_de_getoonde_score():
    # 6.46 toont als 6.5 en telt dus als relatief sterk (B15).
    t = _wb({"autonomy": 6.46, "competence": 7.2, "relatedness": 8.0}, MET_LAAG_ONDERWERP)
    assert ALLE_STERK in t and ONDER_DRUK not in t


def test_r10_gemengd_geen_zin():
    t = _wb({"autonomy": 5.5, "competence": 7.2, "relatedness": 6.0}, MET_LAAG_ONDERWERP)
    assert ONDER_DRUK not in t and ALLE_STERK not in t
    assert "Hier staat de werkbeleving" not in t and "Hier scoort de werkbeleving" not in t


def test_r10_zonder_alle_drie_dimensies_geen_zin():
    t = _wb({"autonomy": 5.5, "competence": 6.0})
    assert "Hier staat de werkbeleving" not in t and "Hier scoort de werkbeleving" not in t
    assert "Autonomie" in t


# ── R11: gewone woorden ─────────────────────────────────────────────────────

_JARGON = ("Behoudscontext", "BEHOUDSCONTEXT", "behoudscontext", "Vertrekcontext",
           "UWES", "Enkelvoudig", "structureert", "GROEPSOUTPUT",
           "beantwoorders voor duiding", "duidingslabel", "automatische duiding",
           "noemen we", "meten we", "tonen we", "bespreken we")


@pytest.mark.parametrize("key", ["02_een_lage_factor", "08_exit_n12", "20_onboarding_sanity"])
def test_r11_geen_jargon_meer(html_van, key):
    raw = html_van(key)
    t = _plain(raw)
    for woord in _JARGON:
        assert woord not in t, (key, woord)
    # De voettekst staat in de CSS, niet in de body.
    assert "GROEPSOUTPUT" not in raw
    assert "ALLEEN GROEPSCIJFERS" in raw


def test_r11_nieuwe_kickers(html_van):
    assert "Blijven en vertrekken" in _plain(html_van("02_een_lage_factor"))
    assert "Waarom mensen vertrokken" in _plain(html_van("08_exit_n12"))


def test_r11_losse_teksten():
    assert CELL_TOO_FEW == "te weinig antwoorden om iets over te zeggen"
    assert raster_intro("retention", True, False).endswith(
        "Het MT beslist; de rangorde helpt alleen ordenen.")
    html = _behoudscontext(retention_score=6.0, stay_intent=6.0, turnover=4.0,
                           engagement=6.0, enps_html="", opener_html="")
    t = _plain(html)
    assert "Eén vraag; lees hem als indicatie." in t
    assert "Energie · Inspiratie · Zin om te gaan. Gemiddelde van 3 stellingen." in t
    for intro in SECTION_INTROS.values():
        assert "noemen we" not in intro and "meten we" not in intro
        assert "tonen we" not in intro


# ── R17: verdeeld alleen bij een dunne middengroep ──────────────────────────

def test_r17_middengroep_niet_dun_is_niet_verdeeld():
    vals = [3.0] * 15 + [5.8] * 14 + [8.0] * 10
    assert score_distribution(vals)["polarized"] is False
    assert "Verdeeld beeld" not in distribution_block(vals)


def test_r17_dunne_middengroep_blijft_verdeeld():
    vals = [3.0] * 4 + [5.8] * 2 + [8.0] * 4
    assert score_distribution(vals)["polarized"] is True


def test_r17_middengroep_gelijk_aan_een_buitengroep_is_niet_verdeeld():
    vals = [3.0] * 4 + [5.8] * 3 + [8.0] * 3
    assert score_distribution(vals)["polarized"] is False


# ── R24: strook en tellingen even breed ─────────────────────────────────────

def test_r24_strook_op_volle_breedte(html_van):
    html = html_van("02_een_lage_factor")
    assert 'width="440"' not in html
    assert '<svg width="660"' in html


def test_r24_tellingen_zo_breed_als_de_strook():
    blk = distribution_block([2.0] * 5 + [8.0] * 5, width=660)
    assert '<svg width="660"' in blk
    assert "justify-content:space-between;width:660px;" in blk


# ── R25: de schaal van de triggerregel uitgelegd ────────────────────────────

def test_r25_regel_legt_de_schaal_uit():
    assert _trigger_regel() == (
        "Duidelijk laag: op de antwoordschaal van de vragenlijst (1 is ‘helemaal "
        "niet’, 5 is ‘helemaal wel’) gemiddeld 2,5 of lager, minstens twee "
        "stellingen op 2 of lager, of een 1 bij gemiddeld hoogstens 3,5. De "
        "andere scores per onderwerp in dit rapport zijn omgerekend naar 1 tot 10.")


def test_r25_antwoordlabels_kloppen_met_de_vragenlijst():
    with open("templates/survey/shared-org.html", encoding="utf-8") as fh:
        tpl = fh.read()
    assert "<span>Helemaal niet</span><span>Helemaal wel</span>" in tpl
    assert "{% for i in range(1, 6) %}" in tpl


# ── R26: bijna-gelijkregel per groep ────────────────────────────────────────

def _raster_tekst(ranked) -> str:
    resp = {r["key"]: RESP.get(r["key"], [4.0] * 2 + [7.0] * 11) for r in ranked}
    return _plain(_prioriteringsraster(
        ranked=ranked, scan_type="retention", factor_resp_scores=resp,
        deepening_active=False, mgmt_q="Vraag?",
        opener_html="<span>kop</span>"))


def test_r26_drie_gelijke_scores_een_zin():
    ranked = [
        _row("growth", "Groeiperspectief", 5.1, role="startpunt"),
        _row("compensation", "Beloning", 7.08, role="tweede"),
        _row("culture", "Cultuur", 7.1, tie="compensation"),
        _row("role_clarity", "Rolhelderheid", 7.12, tie="culture"),
    ]
    t = _raster_tekst(ranked)
    assert "Drie onderwerpen staan gelijk op 7.1: Beloning, Cultuur, Rolhelderheid." in t
    assert "staat vrijwel gelijk aan" not in t


def test_r26_ongelijke_scores_heten_vrijwel_gelijk_met_bereik():
    ranked = [
        _row("growth", "Groeiperspectief", 5.1, role="startpunt"),
        _row("compensation", "Beloning", 6.9, role="tweede"),
        _row("culture", "Cultuur", 7.0, tie="compensation"),
        _row("role_clarity", "Rolhelderheid", 7.1, tie="culture"),
    ]
    t = _raster_tekst(ranked)
    assert ("Drie onderwerpen staan in de rangorde vrijwel gelijk (6.9 tot 7.1): "
            "Beloning, Cultuur, Rolhelderheid.") in t


def test_r26_twee_groepen_twee_zinnen():
    ranked = [
        _row("growth", "Groeiperspectief", 5.1, role="startpunt"),
        _row("workload", "Werkdruk", 5.3, role="tweede", tie="growth"),
        _row("leadership", "Leiderschap", 6.2),
        _row("compensation", "Beloning", 7.1, tie="leadership"),
    ]
    # De tweede koppeling is synthetisch (7.1 tegen 6.2 haalt de marge niet);
    # het gaat hier om de groepering, die de regel uit near_tie_with leest.
    t = _raster_tekst(ranked)
    assert ("Twee onderwerpen staan in de rangorde vrijwel gelijk (5.1 tot 5.3): "
            "Groeiperspectief, Werkdruk. Twee onderwerpen staan in de rangorde "
            "vrijwel gelijk (6.2 tot 7.1): Leiderschap, Beloning.") in t


def test_r26_keten_breder_dan_de_marge_wordt_niet_een_groep():
    """near_tie_with vergelijkt buren; 6.8, 7.0 en 7.2 zijn per paar binnen de
    marge maar samen niet. Eén zin "vrijwel gelijk (6.8 tot 7.2)" zou meer
    beweren dan de rangschikking deed."""
    ranked = [
        _row("growth", "Groeiperspectief", 5.1, role="startpunt"),
        _row("compensation", "Beloning", 6.8, role="tweede"),
        _row("culture", "Cultuur", 7.0, tie="compensation"),
        _row("role_clarity", "Rolhelderheid", 7.2, tie="culture"),
    ]
    t = _raster_tekst(ranked)
    assert ("Twee onderwerpen staan in de rangorde vrijwel gelijk (6.8 tot 7.0): "
            "Beloning, Cultuur. Twee onderwerpen staan in de rangorde vrijwel "
            "gelijk (7.0 tot 7.2): Cultuur, Rolhelderheid.") in t
    assert "(6.8 tot 7.2)" not in t


# ── R11-vervolg (specreview): geen verwijzing naar een sectienaam die niet
# meer bestaat. Kickers heten nu "Waarom mensen vertrokken" en "Blijven en
# vertrekken"; de copy mag niet meer naar de oude namen wijzen. Ankers,
# id's en functienamen blijven, dus de test kijkt alleen naar zichtbare tekst.

_OUDE_NAMEN = ("vertrekcontext", "behoudscontext")


def _zichtbaar(raw: str) -> str:
    return _plain(raw).lower()


def test_r11_vertrek_rapport_noemt_de_vertrekcontext_niet(html_van):
    t = _zichtbaar(html_van("08_exit_n12"))
    # Het scenario bevat de hoofdredenkaart op een onderwerppagina: die zin
    # verwees naar "de vertrekcontext".
    assert "als hoofdreden van vertrek genoemd; die telling staat ook bij ‘waarom mensen vertrokken’." in t
    for naam in _OUDE_NAMEN:
        assert naam not in t, naam


def test_r11_gedegradeerde_p02_vertrek_zonder_frictiescore():
    from tests.test_report_degraded_page_two import _N_DEGRADED, _RENDERERS, _fixture
    data = _fixture("exit", n=_N_DEGRADED, profile=False)
    data["avg_risk"] = None  # dan valt p.02 terug op de verwijzende zin
    t = _zichtbaar(_RENDERERS["exit"](data))
    assert "zie de vertrekredenen en de meetgegevens voor wat dit rapport wel toont." in t
    for naam in _OUDE_NAMEN:
        assert naam not in t, naam


def test_r11_gedegradeerde_p02_behoud_noemt_de_oude_naam_niet():
    from tests.test_report_degraded_page_two import _N_DEGRADED, _RENDERERS, _fixture
    for risk in (None, "fixture"):
        data = _fixture("retention", n=_N_DEGRADED, profile=False)
        if risk is None:
            data["avg_risk"] = None
        t = _zichtbaar(_RENDERERS["retention"](data))
        assert "blijven en vertrekken" in t
        for naam in _OUDE_NAMEN:
            assert naam not in t, (risk, naam)


def test_r26_groep_met_richtingwinnaar_vooraan_blijft_binnen_de_marge():
    """Codereview taak 6: de groep werd alleen tegen zijn eerste rij getoetst.
    Wint een rij op de vraag om verandering, dan staat hij vooraan zonder de
    laagste te zijn. Echte rangorde: bases 6.95 / 7.2 / 7.24 / 7.45, Leiderschap
    (7.2) wint op richting. Eerder: een zin "(7.0 tot 7.5)" over vier
    onderwerpen, een bereik van een halve punt."""
    from backend.report_priority import rank_factors
    fa = {"workload": 6.95, "leadership": 7.2, "growth": 7.24, "culture": 7.45,
          "role_clarity": 8.6, "compensation": 9.2}
    labels = {"workload": "Werkdruk", "leadership": "Leiderschap", "growth": "Groei",
              "culture": "Cultuur", "role_clarity": "Rol", "compensation": "Beloning"}
    direction = {"leadership": {"answered": 6, "counts": {"ldr_change": 6}},
                 "workload": {"answered": 6, "counts": {"wld_none": 5, "wld_peaks": 1}}}
    ranked = rank_factors("retention", fa, {}, {}, labels=labels, direction_agg=direction)
    assert [r["key"] for r in ranked][:4] == ["leadership", "workload", "growth", "culture"]
    assert [r["near_tie_with"] for r in ranked][1:4] == ["leadership", "workload", "growth"]
    from backend.report_html import _bijna_gelijk_zinnen
    zinnen = _bijna_gelijk_zinnen(ranked)
    assert zinnen == [
        "Drie onderwerpen staan in de rangorde vrijwel gelijk (7.0 tot 7.2): "
        "Leiderschap, Werkdruk, Groei.",
        "Twee onderwerpen staan in de rangorde vrijwel gelijk (7.2 tot 7.5): "
        "Groei, Cultuur.",
    ]
    assert not any("(7.0 tot 7.5)" in z for z in zinnen)

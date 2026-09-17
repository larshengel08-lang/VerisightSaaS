"""Pagina twee als MT-vel (spec 2026-09-16 par. 4).

Blok 2: blijfintentie met band en zones, respons met oordeel, vertrekreden met
noemer en gelijkspel. Elke zin die hier wordt gepind komt letterlijk uit de spec
of uit de leesronde (B1, H3, ronde-2-punt b).
"""
import re

from sqlalchemy.orm import Session

from backend.models import Campaign, Organization, Respondent, SurveyResponse
from backend.report_html import (
    build_report_data,
    render_exit_report_html,
    render_retention_report_html,
    _blijfintentie_cell,
    _blijfintentie_kopzin,
    _p02_cijfers_block,
    _respons_oordeel,
    _vertrekreden_cell,
    _vertrekreden_zin,
)

STAY_KWETSBAAR = [2.0] * 25 + [5.5] * 8 + [8.0] * 6   # n=39, gem 3.9
STAY_STERK = [8.0] * 30 + [6.0] * 9                   # n=39, gem 7.5


def _tekst(html: str) -> str:
    return re.sub(r"\s+", " ", re.sub(r"<[^>]+>", " ", html)).strip()


# ── blijfintentie ────────────────────────────────────────────────────────────

def test_blijfintentie_cel_toont_band_en_zones():
    cel = _tekst(_blijfintentie_cell(3.9, STAY_KWETSBAAR))
    assert "Blijfintentie 3.9/10" in cel
    assert "kwetsbaar" in cel
    assert "25 van de 39 zitten onder de 5" in cel


def test_blijfintentie_cel_relatief_sterk():
    cel = _tekst(_blijfintentie_cell(7.5, STAY_STERK))
    assert "relatief sterk" in cel
    assert "0 van de 39 zitten onder de 5" in cel


def test_blijfintentie_cel_leeg_zonder_score():
    assert _blijfintentie_cell(None, []) == ""


def test_blijfintentie_kopzin_alleen_bij_kwetsbaar():
    assert _blijfintentie_kopzin(3.9, STAY_KWETSBAAR) == (
        "Ook de blijfintentie is kwetsbaar: 3.9/10, 25 van de 39 zitten onder de 5.")
    assert _blijfintentie_kopzin(7.5, STAY_STERK) == ""
    assert _blijfintentie_kopzin(None, []) == ""
    # Op de grens beslist de getoonde score (B15): 4.96 toont 5.0 en is geen kwetsbaar punt.
    assert _blijfintentie_kopzin(4.96, [5.0] * 12) == ""


# ── respons ──────────────────────────────────────────────────────────────────

def test_respons_oordeel_genoeg():
    assert _respons_oordeel(39, 58) == (
        "39 van de 58 ingevuld (67%): genoeg voor een betrouwbaar groepsbeeld.")


def test_respons_oordeel_onder_de_helft():
    assert _respons_oordeel(45, 150) == (
        "45 van de 150 ingevuld (30%): het beeld van wie meedeed, niet van de hele organisatie.")


def test_respons_oordeel_indicatief():
    assert _respons_oordeel(45, 180) == (
        "45 van de 180 ingevuld (25%): indicatief, geen vastgesteld startpunt.")


def test_respons_oordeel_te_weinig_voor_profiel():
    assert _respons_oordeel(8, 14) == (
        "8 van de 14 ingevuld (57%): te weinig voor een profiel per onderwerp, daarvoor zijn er minimaal 10 nodig.")


def test_respons_oordeel_zonder_noemer():
    # Codereview taak 2: "niet vastgelegd" is onwaar bij een te laag vastgelegd
    # aantal of bij managed; zeg alleen wat zeker is (zelfde lijn als _respons_noemer).
    assert _respons_oordeel(39, None) == (
        "39 ingevuld; Loep kan het aantal uitgenodigden niet vaststellen, dus staat er geen percentage.")


def test_respons_oordeel_zonder_noemer_onder_drempel():
    assert _respons_oordeel(8, None) == (
        "8 ingevuld; Loep kan het aantal uitgenodigden niet vaststellen, dus staat er geen "
        "percentage. Te weinig voor een profiel per onderwerp, daarvoor zijn er minimaal 10 nodig.")


# ── vertrekreden (Loep Vertrek) ──────────────────────────────────────────────

DIST = [{"code": "PL1", "label": "Beter aanbod elders", "count": 4},
        {"code": "P1", "label": "Leiderschap / management", "count": 2}]
TIE = [{"code": "PL1", "label": "Beter aanbod elders", "count": 4},
       {"code": "P1", "label": "Leiderschap / management", "count": 4},
       {"code": "P3", "label": "Gebrek aan groei", "count": 1}]


def test_vertrekreden_zin_met_noemer():
    assert _vertrekreden_zin(DIST, 12) == (
        "Beter aanbod elders is de meest genoemde vertrekreden (4 van de 12).")


def test_vertrekreden_zin_benoemt_gelijkspel():
    assert _vertrekreden_zin(TIE, 12) == (
        "Twee redenen zijn even vaak genoemd (4 van de 12 elk): Beter aanbod elders en Leiderschap / management.")


def test_vertrekreden_zin_leeg_zonder_redenen():
    assert _vertrekreden_zin([], 12) == ""


def test_vertrekreden_cel_gelijkspel():
    cel = _tekst(_vertrekreden_cell(TIE, 12))
    assert "4 van de 12" in cel and "even vaak" in cel


def test_cijfers_block_bouwt_een_sg_tabel():
    html = _p02_cijfers_block(["<td>a</td>", "", "<td>b</td>"])
    assert html.count("<td>") == 2 and 'class="sg' in html
    assert _p02_cijfers_block(["", ""]) == ""


def test_blok2_copy_bevat_geen_em_dash():
    stukken = [
        _blijfintentie_cell(3.9, STAY_KWETSBAAR), _blijfintentie_kopzin(3.9, STAY_KWETSBAAR),
        _respons_oordeel(39, 58), _respons_oordeel(45, 150), _respons_oordeel(45, 180),
        _respons_oordeel(8, 14), _respons_oordeel(39, None),
        _vertrekreden_zin(DIST, 12), _vertrekreden_zin(TIE, 12), _vertrekreden_cell(TIE, 12),
    ]
    for s in stukken:
        assert "—" not in s and "&#x2014;" not in s and "&mdash;" not in s


# ── codereview taak 2 ────────────────────────────────────────────────────────

def test_blijfintentie_kopzin_zonder_kwetsbaar_onderwerp_zegt_wel():
    assert _blijfintentie_kopzin(3.9, STAY_KWETSBAAR, na_kwetsbaar_onderwerp=False) == (
        "Wel is de blijfintentie kwetsbaar: 3.9/10, 25 van de 39 zitten onder de 5.")


def test_blijfintentie_enkelvoud():
    stay = [2.0] + [8.0] * 38
    assert "1 van de 39 zit onder de 5" in _tekst(_blijfintentie_cell(3.9, stay))
    assert _blijfintentie_kopzin(3.9, stay) == (
        "Ook de blijfintentie is kwetsbaar: 3.9/10, 1 van de 39 zit onder de 5.")


def test_blijfintentie_kopzin_zonder_losse_scores_is_leeg():
    assert _blijfintentie_kopzin(3.9, []) == ""
    assert _blijfintentie_kopzin(3.9, [None, None]) == ""


def test_retention_render_sterk_profiel_kwetsbare_blijfintentie_zegt_geen_ook():
    from tests.test_report_distribution import _min_retention_data
    d = _min_retention_data(
        factor_resp_scores={"workload": [7.5] * 12},
        intent_resp={"stay": [2.0] * 10 + [8.0] * 2,
                     "turnover": [5.0] * 12, "engagement": [6.0] * 12})
    d["factor_avgs"] = {"workload": 7.5}
    d["top_risks"] = [("workload", 7.5)]
    d["org_item_avgs"] = {"W1": 7.5}
    d["avg_si"] = 3.0
    tekst = _tekst(render_retention_report_html(d))
    assert "Geen onderwerp scoort kwetsbaar." in tekst
    assert "Ook de blijfintentie" not in tekst
    assert "Wel is de blijfintentie kwetsbaar: 3.0/10, 10 van de 12 zitten onder de 5." in tekst


def test_vertrekreden_noemer_alleen_wie_een_reden_gaf():
    assert _vertrekreden_zin(DIST, 12, gegeven=10) == (
        "Beter aanbod elders is de meest genoemde vertrekreden (4 van de 10 die een reden gaven).")
    assert _vertrekreden_zin(DIST, 12, gegeven=12) == (
        "Beter aanbod elders is de meest genoemde vertrekreden (4 van de 12).")
    assert _vertrekreden_zin(TIE, 12, gegeven=10) == (
        "Twee redenen zijn even vaak genoemd (elk 4 van de 10 die een reden gaven): "
        "Beter aanbod elders en Leiderschap / management.")
    assert "4 van de 10 die een reden gaven" in _tekst(_vertrekreden_cell(DIST, 12, gegeven=10))


def _zes_bij_twee(k: int = 6):
    return [{"code": f"R{i}", "label": f"Reden {i}", "count": 2} for i in range(1, k + 1)]


def test_vertrekreden_gelijkspel_van_zes_en_boven_telwoord():
    assert _vertrekreden_zin(_zes_bij_twee(6), 12).startswith(
        "Zes redenen zijn even vaak genoemd (2 van de 12 elk): Reden 1, Reden 2,")
    assert _vertrekreden_zin(_zes_bij_twee(7), 14).startswith(
        "7 redenen zijn even vaak genoemd (2 van de 14 elk):")


def test_exit_renderer_gebruikt_volledige_top_en_gegeven_noemer():
    from tests.conftest import exit_report_data
    fa = {"leadership": 4.88, "growth": 4.50, "workload": 5.90,
          "role_clarity": 6.20, "culture": 6.40, "compensation": 7.10}
    items = {fk: [(fk[:2].upper() + "1", "Stelling " + fk)] for fk in fa}
    data = exit_report_data(factor_avgs=fa, factor_items_map=items,
                            exit_r_dist=_zes_bij_twee(6)[:5], n=12)
    data["exit_r_top"] = _zes_bij_twee(6)
    data["exit_r_given"] = 12
    tekst = _tekst(render_exit_report_html(data))
    assert "Zes redenen zijn even vaak genoemd (2 van de 12 elk)" in tekst
    assert "Reden 6" in tekst


def _exit_campagne(db_session: Session, codes: list[str | None]) -> str:
    org = Organization(name="TestOrg", slug="testorg", contact_email="hr@test.nl")
    db_session.add(org)
    db_session.flush()
    camp = Campaign(organization=org, name="Wave 1", scan_type="exit",
                    delivery_mode="baseline")
    db_session.add(camp)
    db_session.flush()
    for code in codes:
        r = Respondent(campaign=camp, department="Zorg", role_level="medewerker",
                       completed=True)
        db_session.add(r)
        db_session.add(SurveyResponse(
            respondent=r, sdt_raw={}, sdt_scores={}, org_raw={}, org_scores={},
            pull_factors_raw={}, uwes_raw={}, turnover_intention_raw={},
            risk_score=5.5, risk_band="MIDDEN", exit_reason_code=code))
    db_session.commit()
    return camp.id


def test_build_report_data_top_redenen_op_de_volledige_teller(db_session: Session):
    codes = [c for c in ("P1", "P2", "P3", "P4", "P5", "PL1") for _ in range(2)] + [None, None]
    data = build_report_data(_exit_campagne(db_session, codes), db_session)
    assert len(data["exit_r_dist"]) == 5          # tabel blijft top 5
    assert [r["code"] for r in data["exit_r_top"]] == ["P1", "P2", "P3", "P4", "P5", "PL1"]
    assert all(r["count"] == 2 for r in data["exit_r_top"])
    assert data["exit_r_given"] == 12
    assert data["n_completed"] == 14


# ── taak 4: onderbouwing zonder lege redenen, noemer ter plekke, één opener ──

from backend.products.shared.deepening import DEEPENING_SETS  # noqa: E402
from backend.report_html import (  # noqa: E402
    _bestuurlijke_read,
    _direction_p02_line,
    _gespreksopener,
    _mgmt_q,
    _p02_why_extra_cells,
)
from tests.test_report_priority_render import RANKED  # noqa: E402

CLEAR = {"lowest_n": 9, "offered": 9, "answered": 8, "skipped": 1,
         "counts": {"grd_visibility": 6, "grd_none": 1, "grd_time": 1}}


def test_bestuurlijke_read_heeft_geen_lege_redenen_meer():
    html = _bestuurlijke_read(kernzin="K.", primary_label="Groeiperspectief",
                              why_cells_html="<td class='why-cell'>x</td>", mgmt_q="V?",
                              cijfers_html="<table class='sg p02-cijfers'><tr><td>c</td></tr></table>")
    assert "wat w&eacute;l werkt" not in html and "Relatief sterk" not in html
    assert "<table class='sg'><tr>" not in html          # de oude onderbouwingsrij
    assert html.index("p02-cijfers") < html.index('class="why"')
    assert "<!-- /why -->" in html
    assert "—" not in _tekst(html)


def test_why_extra_cellen_alleen_bij_echte_signalen():
    # Echte optiesleutel: een onbekende geeft een fout (fail loud).
    top = dict(RANKED[0], spread_n=39, spread_below=21, spread_flag=True,
               deepening_top=("gr_visibility", 7, 13))
    cells = _tekst(_p02_why_extra_cells(top, "retention"))
    assert "Spreiding 21 van de 39 onder de 5" in cells
    assert "Verdieping 7 van de 13 kozen" in cells
    assert "—" not in cells
    kaal = dict(RANKED[3], spread_n=6, spread_below=1, spread_flag=False)   # state 5, n<10
    assert _p02_why_extra_cells(kaal, "retention") == ""


def test_direction_p02_line_draagt_de_noemer_ter_plekke():
    zin = _direction_p02_line({"growth": CLEAR}, "growth", "retention", 5.1)
    assert zin.startswith("Wat er volgens 6 van de 8 mensen bij wie dit het laagst scoorde moet gebeuren: ")
    assert "—" not in zin


def test_een_gespreksopener_voor_p02_en_agenda():
    # Zonder verdiepingsdata: de vaste vraag per onderwerp, op beide plekken dezelfde.
    assert _gespreksopener({}, "retention", "growth") == _mgmt_q("growth", "retention")
    # Met een gedeelde toelichting: de datagedreven vraag. Echte optiesleutels,
    # want agenda_enrichment slaat de agendavraag op sleutel op en faalt hard op
    # een onbekende.
    keys = [o["key"] for o in DEEPENING_SETS["growth"]["options"] if not o["key"].endswith("_other")]
    agg = {"triggered": 17, "offered": 17, "answered": 16, "skipped": 1,
           "primary_counts": {keys[0]: 8, keys[1]: 4, keys[2]: 4},
           "secondary_counts": {}}
    q = _gespreksopener({"growth": agg}, "retention", "growth")
    assert q.startswith("De meest gekozen toelichting was") and "Herkennen jullie dat beeld" in q


def _attr_row(key, label, score):
    return {"key": key, "label": label, "score": score, "base": score,
            "spread_flag": False, "deepening_state": 5, "decided_by": None}


def test_bronregel_zegt_het_als_de_laagste_score_gedeeld_is():
    from backend.report_html import _raster_attribution
    een = [_attr_row("growth", "Groeiperspectief", 5.46),
           _attr_row("workload", "Werkdruk", 5.54),
           _attr_row("culture", "Cultuur", 6.8)]
    zin = _raster_attribution(een, "retention")
    assert zin == "Gebaseerd op de laagste score; die deelt dit onderwerp met Werkdruk."
    twee = een[:2] + [_attr_row("culture", "Cultuur", 5.5)]
    zin = _raster_attribution(twee, "retention")
    assert zin == ("Gebaseerd op de laagste score; die deelt dit onderwerp met twee "
                   "andere onderwerpen.")
    assert "laagst scorende factor" not in zin and "—" not in zin


def test_loep_start_bronregel_zegt_het_als_de_laagste_score_gedeeld_is():
    from tests.test_report_degraded_page_two import _fixture, _page_two
    from backend.report_html import render_onboarding_report_html
    d = _fixture("onboarding", n=12, profile=True)
    fa = d["factor_avgs"]
    keys = sorted(fa, key=lambda k: fa[k])
    fa[keys[0]] = 4.2
    fa[keys[1]] = 4.2
    for k in keys[2:]:
        fa[k] = 6.8
    p2 = _tekst(_page_two(render_onboarding_report_html(d)))
    assert "Gebaseerd op de laagste score; die deelt dit onderwerp met" in p2
    assert "laagst scorende factor" not in p2


# ── codereview taak 4 ────────────────────────────────────────────────────────

import pytest  # noqa: E402

from backend.report_html import (  # noqa: E402
    _bron_laagste_score,
    _eerste_managementspoor,
    _hoofdreden_cell,
    _prioriteringsraster,
)

_TOPS_ENKEL = [{"code": "P1", "label": "Beter aanbod elders", "count": 30}]
_TOPS_GELIJK = [{"code": "P1", "label": "Beter aanbod elders", "count": 4},
                {"code": "P4", "label": "Leiderschap / management", "count": 4}]


def test_hoofdreden_enkel_top_maakt_alleen_de_koppeling_zonder_getal():
    cel = _tekst(_hoofdreden_cell(er_n=30, er_top=_TOPS_ENKEL, gegeven=None, n=45,
                                  tf_code="P1", color="#000"))
    assert "Hoofdreden" in cel
    assert "dit onderwerp hangt samen met de meest genoemde vertrekreden" in cel
    assert not any(ch.isdigit() for ch in cel)
    assert "—" not in cel


def test_hoofdreden_gelijkspel_met_startpunt_maakt_alleen_de_koppeling():
    cel = _tekst(_hoofdreden_cell(er_n=4, er_top=_TOPS_GELIJK, gegeven=None, n=12,
                                  tf_code="P4", color="#000"))
    assert "Als vertrekreden genoemd" in cel
    assert "een van de meest genoemde vertrekredenen" in cel
    assert not any(ch.isdigit() for ch in cel)


def test_hoofdreden_vaker_tak_spreekt_zichzelf_niet_tegen():
    cel = _tekst(_hoofdreden_cell(er_n=26, er_top=_TOPS_ENKEL, gegeven=None, n=45,
                                  tf_code="P4", color="#000"))
    assert "Hoofdreden" not in cel
    assert cel == ("Als vertrekreden genoemd 26&times; van de 45 vertrekkers; "
                   "Beter aanbod elders is vaker genoemd (30 keer)")
    # Noemer volgt wie een reden gaf, zoals blok 2.
    cel = _tekst(_hoofdreden_cell(er_n=3, er_top=_TOPS_GELIJK, gegeven=10, n=12,
                                  tf_code="P7", color="#000"))
    assert ("3&times; van de 10 vertrekkers die een reden gaven; Beter aanbod elders en "
            "Leiderschap / management zijn vaker genoemd (4 keer)") in cel
    assert _hoofdreden_cell(er_n=0, er_top=_TOPS_ENKEL, gegeven=None, n=45,
                            tf_code="P4", color="#000") == ""


def test_bron_laagste_score_enkel_telwoord_en_none():
    assert _bron_laagste_score(5.1, [("Werkdruk", 6.0)]) == "Gebaseerd op de laagst scorende factor."
    assert _bron_laagste_score(5.46, [("Werkdruk", 5.54), ("Cultuur", 6.0)]) ==         "Gebaseerd op de laagste score; die deelt dit onderwerp met Werkdruk."
    assert _bron_laagste_score(5.5, [("A", 5.5), ("B", 5.5), ("C", 5.5)]) ==         "Gebaseerd op de laagste score; die deelt dit onderwerp met drie andere onderwerpen."
    assert _bron_laagste_score(None, [("A", 5.5)]) == "Gebaseerd op de laagst scorende factor."
    assert _bron_laagste_score(5.5, [("A", None)]) == "Gebaseerd op de laagst scorende factor."


def _raster(ranked):
    return _prioriteringsraster(
        ranked=ranked, scan_type="retention", factor_resp_scores={},
        deepening_active=False, mgmt_q="Testvraag?",
        review_when="Plan binnen 45-90 dagen een vervolgmoment.",
        opener_html="<h2>Gespreksagenda</h2>", direction_agg=None, n_total=0)


# Het paginanummer komt van WeasyPrint (codereview taak 5, minor d): de "2" was
# hardcoded en blijft alleen waar zolang p.02 letterlijk pagina twee is.
_OPENER_P02 = 'Dezelfde opener staat op pagina <a class="pref" href="#p02"></a>.'


def test_agenda_verwijst_naar_pagina_twee_alleen_met_rasterrijen():
    assert _OPENER_P02 in _raster(RANKED)
    assert _OPENER_P02 not in _raster([])
    assert "op pagina 2." not in _raster(RANKED)


def test_onboarding_agenda_verwijst_naar_pagina_twee():
    kw = dict(primary_theme="A (5.0/10)", second_point="B (5.5/10)", mgmt_q="V?",
              review_when="Later.")
    assert _OPENER_P02 in _eerste_managementspoor(**kw, opener_op_p02=True)
    assert _OPENER_P02 not in _eerste_managementspoor(**kw)
    assert _OPENER_P02 not in _eerste_managementspoor(
        **kw, opener_op_p02=True, degraded_note="Niets.")


def test_onboarding_render_verwijst_naar_pagina_twee():
    from tests.test_report_degraded_page_two import _fixture
    from backend.report_html import render_onboarding_report_html
    html = render_onboarding_report_html(_fixture("onboarding", n=12, profile=True))
    assert _OPENER_P02 in html
    html = render_onboarding_report_html(_fixture("onboarding", n=8, profile=False))
    assert _OPENER_P02 not in html


def test_spreiding_cel_alleen_als_spreiding_een_signaal_is():
    geen = dict(RANKED[3], spread_n=45, spread_below=0, spread_flag=False, decided_by=None)
    assert "Spreiding" not in _p02_why_extra_cells(geen, "retention")
    beslist = dict(RANKED[3], spread_n=45, spread_below=12, spread_flag=False,
                   decided_by={"kind": "spread", "other": "growth"})
    assert "Spreiding" in _p02_why_extra_cells(beslist, "retention")


def test_verdieping_cel_weg_als_de_opener_dezelfde_toelichting_noemt():
    top = dict(RANKED[0], spread_flag=False, deepening_top=("gr_visibility", 7, 13))
    assert "Verdieping" in _p02_why_extra_cells(top, "retention")
    assert "Verdieping" not in _p02_why_extra_cells(top, "retention",
                                                    opener_toelichting="gr_visibility")
    assert "Verdieping" in _p02_why_extra_cells(top, "retention",
                                                opener_toelichting="gr_time")


def test_verdieping_cel_onbekende_optiesleutel_faalt_hard():
    top = dict(RANKED[0], spread_flag=False, deepening_top=("gr_bestaat_niet", 7, 13))
    with pytest.raises(KeyError, match="onbekende optiesleutel"):
        _p02_why_extra_cells(top, "retention")


# ── Taak 5: leidraad 45 minuten, paginaverwijzingen, meetgegevens (H4/H5/H8) ─

from backend.report_html import (  # noqa: E402
    LEIDRAAD_ANKERS,
    _ChapterCounter,
    _leidraad_block,
    _pref,
    _responsbasis,
    render_onboarding_report_html,
)
from tests.conftest import requires_weasyprint  # noqa: E402
from tests.test_report_degraded_page_two import _fixture as _degraded_fixture  # noqa: E402
from tests.test_report_distribution import _min_retention_data  # noqa: E402

_PREF_RE = r'<a class="pref" href="#([a-z0-9-]+)"></a>'


def _assert_verwijzingen_kloppen(html: str) -> list[str]:
    body = html.split("</style>")[-1]
    hrefs = re.findall(_PREF_RE, body)
    for h in set(hrefs):
        assert body.count(f'id="{h}"') == 1, f"anker {h} moet precies één keer bestaan"
    return hrefs


def test_pref_is_een_lege_anker_die_weasyprint_vult():
    assert _pref("sec-agenda") == '<a class="pref" href="#sec-agenda"></a>'


def test_opener_zet_het_anker_op_de_hoofdstukkop():
    ch = _ChapterCounter()
    html = ch.opener("Overzichtsprofiel", anchor="sec-overzicht")
    assert '<div class="ch-head" id="sec-overzicht">' in html
    assert '<div class="ch-head">' in _ChapterCounter().opener("Zonder anker")


def test_leidraad_heeft_vijf_tijdvakken_met_paginaverwijzingen():
    html = _leidraad_block("retention", has_segments=True, has_quotes=True,
                           has_direction=True, has_deepening=True)
    tekst = _tekst(html)
    assert "Zo leid je dit gesprek in 45 minuten" in tekst
    for tijd in ("0-5 min", "5-12 min", "12-25 min", "25-33 min", "33-45 min"):
        assert tijd in tekst
    assert html.count('class="pref"') >= 5
    assert "begeleide managementbespreking" not in tekst
    assert "pagina " in tekst
    assert "—" not in html and "&#x2014;" not in html


def test_leidraad_zonder_afdelingen_valt_terug_op_toelichtingen_of_werkbeleving():
    met_quotes = _tekst(_leidraad_block("retention", has_segments=False, has_quotes=True,
                                        has_direction=True, has_deepening=True))
    assert "Per afdeling" not in met_quotes and "Wat mensen zelf schreven" in met_quotes
    zonder = _tekst(_leidraad_block("retention", has_segments=False, has_quotes=False,
                                    has_direction=True, has_deepening=True))
    assert "Werkbeleving" in zonder


def test_leidraad_loep_start_belooft_geen_verdieping():
    tekst = _tekst(_leidraad_block("onboarding", has_segments=False, has_quotes=False,
                                   has_direction=False, has_deepening=False))
    assert "verdieping" not in tekst.lower()
    assert "Wat er volgens je mensen moet gebeuren" not in tekst


def test_leidraad_belooft_geen_toelichtingen_in_een_meting_zonder_verdieping():
    """Een meting van voor de verdiepings- en richtingvraag rendert die blokken
    niet (campagne-gate); regel 3 en 5 mogen ze dan niet aankondigen."""
    tekst = _tekst(_leidraad_block("retention", has_segments=True, has_quotes=False,
                                   has_direction=False, has_deepening=False))
    assert "wat mensen als toelichting kozen" not in tekst
    assert "De verdieping van het startpunt: de laagste stelling en de score van elke stelling" in tekst
    assert "Wat er volgens je mensen moet gebeuren" not in tekst
    assert "Het eerste gesprekspunt en het besluit" in tekst


def test_elke_paginaverwijzing_wijst_naar_precies_een_anker():
    for html in (render_retention_report_html(_min_retention_data()),
                 render_retention_report_html(_retention_met_secties()),
                 render_exit_report_html(_degraded_fixture("exit", n=12, profile=True)),
                 render_retention_report_html(_degraded_fixture("retention", n=12, profile=True)),
                 render_onboarding_report_html(_degraded_fixture("onboarding", n=12, profile=True))):
        assert _assert_verwijzingen_kloppen(html), "geen paginaverwijzingen gevonden"


def test_degraded_staat_heeft_geen_leidraad_en_geen_losse_verwijzing():
    """Zonder factorprofiel rendert de leidraad bewust niet: hij zou sturen naar
    een verdieping en een volgorde die er niet zijn. De degraded alinea op p.02
    zegt zelf wat er wél is."""
    for scan_type, render in (("exit", render_exit_report_html),
                              ("retention", render_retention_report_html),
                              ("onboarding", render_onboarding_report_html)):
        html = render(_degraded_fixture(scan_type, n=8, profile=False))
        assert "Zo leid je dit gesprek" not in html
        _assert_verwijzingen_kloppen(html)


def test_loep_start_zonder_werkbeleving_afdelingen_en_quotes_verwijst_niet_in_het_niets():
    data = _degraded_fixture("onboarding", n=12, profile=True)
    data["sdt_avgs"] = {}
    html = render_onboarding_report_html(data)
    assert "Zo leid je dit gesprek" not in html
    _assert_verwijzingen_kloppen(html)
    assert 'id="sec-werkbeleving"' not in html


def test_meetgegevens_tonen_datums_of_zeggen_dat_ze_ontbreken():
    met = _tekst(_responsbasis(invited=58, completed=39, period="Loep Behoud Voorjaar 2026",
                               population="Actieve medewerkers", segment_available=True,
                               period_start="9 maart 2026", period_end="30 maart 2026"))
    assert "Meetperiode 9 maart 2026 tot 30 maart 2026" in met
    assert "Uitgenodigd 58" in met and "Ingevuld 39" in met
    zonder = _tekst(_responsbasis(invited=58, completed=39, period="Loep Behoud Voorjaar 2026",
                                  population="Actieve medewerkers", segment_available=True))
    assert "Meetperiode niet vastgelegd" in zonder
    assert "Loep Behoud Voorjaar 2026" in zonder     # de naam van de meting blijft staan


def test_meetgegevens_zeggen_wat_niet_in_dit_rapport_staat():
    html = _tekst(_responsbasis(invited=58, completed=39, period="W", population="P",
                                segment_available=False, segment_reason="te weinig antwoorden per afdeling",
                                enps_available=False))
    assert "Niet in dit rapport: afdelingen (te weinig antwoorden per afdeling), werkgeversaanbeveling (eNPS)" in html
    assert "Segmentstatus" not in html and "Datastatus" not in html and "Populatie" not in html


def test_renderer_geeft_de_datums_door_aan_de_meetgegevens():
    data = _min_retention_data()
    data["period_start"] = "9 maart 2026"
    data["period_end"] = "30 maart 2026"
    assert "Meetperiode 9 maart 2026 tot 30 maart 2026" in _tekst(render_retention_report_html(data))


def test_gebruiksblok_en_begeleide_bespreking_zijn_weg():
    html = render_retention_report_html(_retention_met_secties())
    assert "Zo gebruik je dit rapport" not in html
    assert "begeleide managementbespreking" not in html
    assert "Zo leid je dit gesprek in 45 minuten" in html
    ob = render_onboarding_report_html(_degraded_fixture("onboarding", n=12, profile=True))
    assert "begeleide managementbespreking" not in ob


@requires_weasyprint
def test_de_pdf_vult_de_verwijzingen_met_echte_paginanummers():
    """De tests hierboven bewaken de structuur (elke verwijzing wijst naar een
    bestaand, uniek anker); deze bewaakt de uitkomst: WeasyPrint moet
    `target-counter` omzetten in een paginanummer dat in de tekstlaag staat en
    naar de juiste pagina wijst.

    Slaat over waar WeasyPrint niet kan renderen (Windows zonder GTK). Valideer
    daar via de WeasyPrint-Docker-image, zie CLAUDE.md. De renderwaarschuwingen
    van WeasyPrint gelden hier als fout: de eis is nul warnings.
    """
    import logging

    import pymupdf
    from weasyprint import HTML

    html = render_retention_report_html(_min_retention_data())

    class _Collect(logging.Handler):
        def __init__(self) -> None:
            super().__init__(level=logging.WARNING)
            self.records: list[str] = []

        def emit(self, record: logging.LogRecord) -> None:
            self.records.append(record.getMessage())

    logger = logging.getLogger("weasyprint")
    handler = _Collect()
    logger.addHandler(handler)
    try:
        pdf_bytes = HTML(string=html).write_pdf()
    finally:
        logger.removeHandler(handler)
    assert handler.records == [], f"WeasyPrint-warnings: {handler.records}"

    doc = pymupdf.open(stream=pdf_bytes, filetype="pdf")
    # Genormaliseerd: de tekstlaag breekt regels waar de lay-out dat doet, ook
    # tussen "pagina" en het nummer dat target-counter erachter zet.
    paginas = [re.sub(r"\s+", " ", p.get_text()) for p in doc]

    def _pagina_met(fragment: str) -> int:
        """1-gebaseerd paginanummer, zoals target-counter het telt."""
        treffers = [i + 1 for i, t in enumerate(paginas) if fragment in t]
        assert len(treffers) == 1, f"'{fragment}' staat op {treffers}, verwacht precies 1 pagina"
        return treffers[0]

    leidraad = paginas[_pagina_met("Zo leid je dit gesprek in 45 minuten") - 1]
    nummers = re.findall(r"pagina (\d+)", leidraad)
    assert len(nummers) >= 5, f"te weinig gevulde paginaverwijzingen: {nummers}"
    for nr in nummers:
        assert 1 <= int(nr) <= doc.page_count

    # De verwijzing uit de slotregel van de leidraad moet echt op de
    # gespreksagenda uitkomen, niet op een willekeurig nummer.
    assert str(_pagina_met("Waar begint het gesprek?")) in nummers
    assert str(_pagina_met("Overzichtsprofiel")) in nummers
    doc.close()


# ── Codereview taak 5: geen belofte die op niets uitkomt ─────────────────────

from datetime import date, datetime, timezone  # noqa: E402

from backend.models import CampaignDeliveryRecord  # noqa: E402
from backend.report_html import (  # noqa: E402
    _deepening_shows_distribution,
    _segment_absent_reason,
)


def _deep_agg(answered: int) -> dict:
    """Aggregaat van één onderwerp met `answered` beantwoorde verdiepingsvragen."""
    return {"triggered": answered + 2, "offered": answered + 2, "answered": answered,
            "primary_counts": {"wl_volume": answered}, "secondary_counts": {},
            "other_texts": [], "question_set_version": "retention_v2"}


def _retention_met_secties(**over) -> dict:
    """Retention-data die de secties van leidraadregel 4 echt bevat: afdelingen,
    open toelichtingen en werkbeleving."""
    data = _min_retention_data()
    data["sdt_avgs"] = {"autonomy": 5.5, "competence": 6.0, "relatedness": 6.5}
    data["sdt_item_avgs"] = {}
    data["segment_rows"] = [
        {"department": "Zorg", "n": 7, "avg": 4.8, "scores": [4.0] * 7, "is_pooled": False},
        {"department": "Techniek", "n": 6, "avg": 6.4, "scores": [6.0] * 6, "is_pooled": False},
    ]
    data["open_texts"] = [f"Toelichting {i}" for i in range(6)]
    data.update(over)
    return data


def test_deepening_staffel_is_een_bron_voor_blok_en_leidraad():
    assert _deepening_shows_distribution(None) is False
    assert _deepening_shows_distribution({}) is False
    assert _deepening_shows_distribution({"triggered": 0, "answered": 9}) is False
    assert _deepening_shows_distribution(_deep_agg(4)) is False
    assert _deepening_shows_distribution(_deep_agg(5)) is True


def test_leidraad_belooft_toelichtingen_alleen_als_het_blok_ze_toont():
    """Reproductie uit de codereview: met answered=2 beloofde regel 3 "wat
    mensen als toelichting kozen" terwijl die pagina zegt dat het er te weinig
    zijn. De vlag volgt nu het aggregaat van het startpunt, met dezelfde
    staffel als `_deepening_block`."""
    weinig = _retention_met_secties(deepening_agg={"workload": _deep_agg(2)})
    html = render_retention_report_html(weinig)
    assert "Te weinig verdiepingsantwoorden" in html
    assert "wat mensen als toelichting kozen" not in html
    assert "de score van elke stelling" in html

    genoeg = _retention_met_secties(deepening_agg={"workload": _deep_agg(6)})
    html = render_retention_report_html(genoeg)
    assert "wat mensen als toelichting kozen" in html
    assert "Te weinig verdiepingsantwoorden" not in html


def test_leidraad_verwijst_bij_loep_start_niet_naar_drempels_die_er_niet_zijn():
    """De methodiekpagina van Loep Start heeft geen drempelcel; die van Vertrek
    en Behoud wel. Regel 1 mag dus niet in alle drie hetzelfde beloven."""
    ob = render_onboarding_report_html(_degraded_fixture("onboarding", n=12, profile=True))
    assert "Drempelwaarden" not in ob
    assert "de drempels staan op" not in ob
    assert "wat Loep uit deze aantallen wel en niet afleidt" in ob

    ret = render_retention_report_html(_retention_met_secties())
    assert "Drempelwaarden" in ret
    assert "de drempels staan op" in ret


def test_afdelingen_en_toelichtingen_zijn_end_tot_eind_gepind():
    """Minor f: met afdelingen én toelichtingen verwijst de leidraad naar beide
    ankers, en die staan er allebei precies één keer."""
    html = render_retention_report_html(_retention_met_secties())
    hrefs = _assert_verwijzingen_kloppen(html)
    assert "sec-afdelingen" in hrefs
    assert "sec-toelichtingen" not in hrefs      # regel 4 kiest afdelingen
    assert 'id="sec-toelichtingen"' in html      # de sectie bestaat wel
    zonder_afdelingen = _retention_met_secties(segment_rows=[])
    hrefs = _assert_verwijzingen_kloppen(render_retention_report_html(zonder_afdelingen))
    assert "sec-toelichtingen" in hrefs and "sec-afdelingen" not in hrefs


def test_zonder_afdelingen_toelichtingen_en_werkbeleving_geen_leidraad():
    """Minor g: dezelfde gate als bij Loep Start. Zonder die drie secties heeft
    regel 4 niets om naar te verwijzen, ook bij Behoud en Vertrek."""
    kaal = _retention_met_secties(segment_rows=[], open_texts=[], sdt_avgs={})
    html = render_retention_report_html(kaal)
    assert "Zo leid je dit gesprek" not in html
    # De verwijzing van de gespreksagenda naar pagina twee blijft, en klopt.
    assert _assert_verwijzingen_kloppen(html) == ["p02"]


def test_omgekeerde_meetperiode_wordt_gemeld_niet_afgedrukt():
    tekst = _tekst(_responsbasis(invited=58, completed=39, period="Wave 1",
                                 population="Actieve medewerkers", segment_available=True,
                                 period_start="30 maart 2026", period_end="9 maart 2026",
                                 period_conflict=True))
    assert "Meetperiode niet betrouwbaar vastgelegd" in tekst
    assert "30 maart 2026" not in tekst and "9 maart 2026" not in tekst
    assert "in de verkeerde volgorde vastgelegd" in tekst


def test_build_report_data_drukt_een_omgekeerde_meetperiode_niet_af(db_session: Session):
    camp_id = _exit_campagne(db_session, ["P1"] * 12)
    camp = db_session.get(Campaign, camp_id)
    camp.closed_at = datetime(2026, 3, 9, 12, 0, tzinfo=timezone.utc)
    db_session.add(CampaignDeliveryRecord(
        organization_id=camp.organization_id, campaign_id=camp.id,
        launch_date=date(2026, 3, 30), invited_count=20))
    db_session.commit()
    data = build_report_data(camp_id, db_session)
    assert data["period_dates_conflict"] is True
    assert data["period_start"] is None and data["period_end"] is None
    assert "in de verkeerde volgorde vastgelegd" in _tekst(render_exit_report_html(data))


def test_build_report_data_noemt_de_echte_reden_zonder_afdelingstabel(db_session: Session):
    """Minor b: "geen afdelingen vastgelegd" is iets anders dan "te weinig
    antwoorden per afdeling"; de datalaag weet het verschil."""
    assert _segment_absent_reason([]) == "niet vastgelegd bij deze meting"
    assert _segment_absent_reason([{"department": None, "signal_score": 5.0}]) == (
        "niet vastgelegd bij deze meting")
    assert _segment_absent_reason([{"department": "Zorg", "signal_score": 5.0}]) == (
        "te weinig antwoorden per afdeling")
    # Alle respondenten in _exit_campagne zitten op afdeling Zorg: één afdeling,
    # dus geen tabel, maar de afdelingen zijn wel vastgelegd.
    data = build_report_data(_exit_campagne(db_session, ["P1"] * 12), db_session)
    assert data["segment_rows"] == []
    assert data["segment_reason"] == "te weinig antwoorden per afdeling"
    assert "afdelingen (te weinig antwoorden per afdeling)" in _tekst(
        render_exit_report_html(data))


# ── Taak 6: pagina twee is één A4, pagina drie begint met hoofdstuk 02 (H16) ──

import subprocess  # noqa: E402
import sys  # noqa: E402
from pathlib import Path  # noqa: E402

import pymupdf  # noqa: E402

from backend.report_css import build_css  # noqa: E402
from scripts.check_pdf_report import (  # noqa: E402
    ALLE_REGELS,
    MIN_FILL,
    REGEL_P02,
    REGEL_THEAD,
    REGEL_VERWIJZING,
    REGEL_VULLING,
    check,
    first_text,
    page_fill,
)

_SCRIPT = Path(__file__).resolve().parents[1] / "scripts" / "check_pdf_report.py"

_P02_STATEN = (
    ("retention minimaal", render_retention_report_html, _min_retention_data()),
    ("retention met secties", render_retention_report_html, _retention_met_secties()),
    ("exit met profiel", render_exit_report_html, _degraded_fixture("exit", n=12, profile=True)),
    ("exit zonder profiel", render_exit_report_html, _degraded_fixture("exit", n=8, profile=False)),
    ("retention zonder profiel", render_retention_report_html,
     _degraded_fixture("retention", n=8, profile=False)),
    ("onboarding met profiel", render_onboarding_report_html,
     _degraded_fixture("onboarding", n=12, profile=True)),
    ("onboarding zonder profiel", render_onboarding_report_html,
     _degraded_fixture("onboarding", n=8, profile=False)),
)


def _p02_slice(html: str) -> str:
    """Van de opening van p.02 tot de start van de volgende paginasectie."""
    body = html.split("</style>")[-1]
    start = body.index('<div class="pb sec" id="p02"')
    eind = body.index('<div class="pb sec"', start + 10)
    return body[start:eind]


def test_pagina_twee_heeft_geen_losse_kaarten_na_de_meetgegevens():
    """Alles wat na de meetgegevens komt hoort bij hoofdstuk 02 (H16). In de
    HTML: tussen "Meetgegevens" en de volgende paginasectie staat geen
    <div class="card"> meer, en de losse kaarten zijn nergens terug."""
    for naam, render, data in _P02_STATEN:
        html = render(data)
        blok = _p02_slice(html)
        na = blok[blok.index("Meetgegevens"):]
        assert '<div class="card' not in na, f"{naam}: losse kaart na de meetgegevens"
        assert "Segmentstatus" not in html and "Populatie" not in html, naam


def test_pagina_twee_is_een_enkele_paginabreuk():
    """Eén `pb sec` voor heel p.02: geen tweede paginabreuk binnen het blok en
    niets tussen het sluiten van p.02 en de volgende sectie, want dat zou een
    pagina drie opleveren die op één regel na leeg is (H16)."""
    for naam, render, data in _P02_STATEN:
        blok = _p02_slice(render(data))
        assert 'class="pb' not in blok[10:], f"{naam}: tweede paginabreuk binnen p.02"
        assert blok.rstrip().endswith("</div>"), f"{naam}: losse inhoud na p.02"


def test_pagina_drie_begint_met_hoofdstuk_02():
    """De sectie direct na p.02 opent met de hoofdstukkop 02; in de PDF is dat
    de eerste tekst van pagina drie (gemeten door scripts/check_pdf_report.py)."""
    for naam, render, data in _P02_STATEN:
        body = render(data).split("</style>")[-1]
        start = body.index('<div class="pb sec" id="p02"')
        volgende = body[body.index('<div class="pb sec"', start + 10):][:400]
        assert re.search(r'<div class="ch-head"[^>]*><span class="ch-idx">02</span>',
                         volgende), f"{naam}: {volgende[:120]!r}"


def test_css_houdt_pagina_twee_compact():
    """De compacte maten hangen aan #p02, niet aan de klassen zelf: de rest van
    het rapport houdt zijn eigen ruimte."""
    css = build_css("retention")
    for regel in ("#p02 .br-kernzin { font-size: 24px;",
                  "#p02 .why { padding: 14px 18px 12px;",
                  "#p02 .why-grid { margin-bottom: 10px;",
                  "#p02 .sg { margin-bottom: 10px;",
                  "#p02 .sc-v { font-size: 20px;",
                  "#p02 .leidraad { margin-top: 12px;"):
        assert regel in css, regel
    assert ".br-kernzin {\n  font-family" in css      # de basisstijl blijft staan
    # De overrides staan ná de basisregels die ze aanpassen. Anders is de eerste
    # `.why {`-regel in het stylesheet die van #p02, en die draagt geen
    # achtergrond of left-border: tests/test_report_html_design.py leest de
    # eerste treffer en zou dan de verkeerde regel keuren.
    for basis in (".br-kernzin {", ".why {", ".sg {", ".sc-v {", ".leidraad {"):
        assert css.index(basis) < css.index("#p02 " + basis), basis
    assert re.search(r"\.why\s*\{([^}]+)\}", css).group(1).count("border-left") == 1


# ── De meetlogica van check_pdf_report.py, gemeten op gebouwde PDF's ─────────
#
# WeasyPrint kan op Windows niet renderen (geen GTK) en de Docker-image was in
# deze sessie niet bereikbaar. De meetcode wordt daarom getest op PDF's die
# PyMuPDF zelf bouwt, met bekende paginavulling en bekende teksten: elke regel
# krijgt een document dat hem overtreedt en een document dat hem haalt. Dat
# bewijst de meting, niet de uitkomst voor het echte rapport; die staat in
# test_de_echte_pdf_zet_de_meetgegevens_op_pagina_twee (slaat over zonder
# renderer).

_A4 = (595.0, 842.0)


def _bouw_pdf(pad: Path, paginas: list[list[tuple[float, str]]]) -> Path:
    doc = pymupdf.open()
    for regels in paginas:
        page = doc.new_page(width=_A4[0], height=_A4[1])
        for y, tekst in regels:
            page.insert_text((60.0, y), tekst, fontsize=11)
    doc.save(str(pad))
    doc.close()
    return pad


def _vulregels(vanaf: float, tot: float, label: str) -> list[tuple[float, str]]:
    y = vanaf
    regels = []
    while y <= tot:
        regels.append((y, f"{label} regel op {y:.0f}"))
        y += 20.0
    return regels


def _goed_rapport(pad: Path, *, p2_extra: list[tuple[float, str]] | None = None,
                  p3_kop: str = "02 Behoudscontext",
                  p4_regels: list[tuple[float, str]] | None = None) -> Path:
    p2 = ([(60.0, "Behoud vraagt aandacht op een kwetsbaar onderwerp.")]
          + _vulregels(90.0, 620.0, "p2")
          + [(660.0, "Zo leid je dit gesprek in 45 minuten"),
             (680.0, "Lees eerst het overzichtsprofiel op pagina 4"),
             (700.0, "Sluit af met de gespreksagenda op pagina 6"),
             (730.0, "Meetgegevens")]
          + (p2_extra or []))
    return _bouw_pdf(pad, [
        [(400.0, "Loep Behoud"), (430.0, "Voorjaar 2026")],                 # cover
        p2,
        [(60.0, p3_kop)] + _vulregels(90.0, 760.0, "p3"),
        p4_regels if p4_regels is not None
        else [(60.0, "03 Overzichtsprofiel")] + _vulregels(90.0, 760.0, "p4"),
        [(60.0, "04 Verdieping")] + _vulregels(90.0, 760.0, "p5"),
        [(60.0, "05 Werkbeleving")] + _vulregels(90.0, 760.0, "p6"),
        [(60.0, "06 Methodiek"), (90.0, "korte slotpagina")],               # laatste
    ])


def test_page_fill_meet_de_tekstkolom_zonder_voetregel(tmp_path: Path):
    pad = _bouw_pdf(tmp_path / "vulling.pdf", [
        _vulregels(60.0, 780.0, "vol"),
        _vulregels(60.0, 200.0, "leeg"),
        [(810.0, "alleen een voetregel")],
    ])
    doc = pymupdf.open(str(pad))
    try:
        assert page_fill(doc[0]) > 0.95
        assert 0.15 < page_fill(doc[1]) < 0.25
        assert page_fill(doc[2]) == 0.0          # onder FOOTER_PT telt niet mee
        assert first_text(doc[1]).startswith("leeg regel op 60")
    finally:
        doc.close()


def test_check_keurt_een_goed_rapport_goed(tmp_path: Path):
    assert check(str(_goed_rapport(tmp_path / "goed.pdf"))) == []


def test_check_ziet_de_meetgegevens_van_pagina_twee_glijden(tmp_path: Path):
    pad = _bouw_pdf(tmp_path / "overloop.pdf", [
        [(400.0, "cover")],
        _vulregels(60.0, 760.0, "p2"),                       # geen Meetgegevens
        [(60.0, "Meetgegevens")] + _vulregels(90.0, 760.0, "p3"),
        [(60.0, "02 Behoudscontext")] + _vulregels(90.0, 760.0, "p4"),
        [(60.0, "korte slotpagina")],
    ])
    bevindingen = check(str(pad), regels=(REGEL_P02,))
    meldingen = [b.melding for b in bevindingen]
    assert any("bevat de meetgegevens niet" in m for m in meldingen)
    assert any("pagina 3 begint niet met hoofdstuk 02" in m for m in meldingen)
    assert all(b.regel == REGEL_P02 for b in bevindingen)


def test_check_ziet_een_andere_kop_op_pagina_drie(tmp_path: Path):
    pad = _goed_rapport(tmp_path / "p3.pdf", p3_kop="Segmentstatus")
    bevindingen = check(str(pad), regels=(REGEL_P02,))
    assert [b.regel for b in bevindingen] == [REGEL_P02]
    assert "Segmentstatus" in bevindingen[0].melding


def test_check_ziet_een_te_lege_pagina_en_spaart_cover_en_slot(tmp_path: Path):
    pad = _goed_rapport(tmp_path / "leeg.pdf",
                        p4_regels=[(60.0, "03 Overzichtsprofiel"), (90.0, "een regel")])
    bevindingen = check(str(pad), regels=(REGEL_VULLING,))
    assert len(bevindingen) == 1, [b.melding for b in bevindingen]
    assert bevindingen[0].melding.startswith("pagina 4 is ")
    assert "< 40%" in bevindingen[0].melding and MIN_FILL == 0.40
    assert "03 Overzichtsprofiel" in bevindingen[0].melding


def test_check_ziet_een_verwijzing_buiten_het_document(tmp_path: Path):
    pad = _goed_rapport(tmp_path / "ref.pdf",
                        p2_extra=[(750.0, "zie pagina 99 voor de afdelingen")])
    bevindingen = check(str(pad), regels=(REGEL_VERWIJZING,))
    assert [b.melding for b in bevindingen] == [
        "verwijzing naar pagina 99 buiten het document (7 pagina's)"]


def test_check_ziet_een_verwijzing_naar_een_pagina_zonder_hoofdstukkop(tmp_path: Path):
    pad = _goed_rapport(tmp_path / "ref2.pdf",
                        p2_extra=[(750.0, "zie pagina 2 voor de meetgegevens")])
    bevindingen = check(str(pad), regels=(REGEL_VERWIJZING,))
    assert len(bevindingen) == 1
    assert bevindingen[0].melding.startswith("pagina 2 begint niet met een hoofdstukkop")


def test_check_leest_een_verwijzing_die_over_twee_regels_afbreekt(tmp_path: Path):
    """In de tekstlaag kunnen "pagina" en het nummer dat target-counter erachter
    zet op twee regels staan; de meting normaliseert daarom de witruimte."""
    pad = _bouw_pdf(tmp_path / "afbreek.pdf", [
        [(400.0, "cover")],
        [(60.0, "Lees eerst het overzichtsprofiel op pagina"), (80.0, "99")]
        + _vulregels(110.0, 700.0, "p2") + [(730.0, "Meetgegevens")],
        [(60.0, "02 Behoudscontext")] + _vulregels(90.0, 760.0, "p3"),
        [(60.0, "korte slotpagina")],
    ])
    assert [b.melding for b in check(str(pad), regels=(REGEL_VERWIJZING,))] == [
        "verwijzing naar pagina 99 buiten het document (4 pagina's)"]


def test_check_thead_alleen_met_vlag(tmp_path: Path):
    pad = _goed_rapport(tmp_path / "thead.pdf")
    assert check(str(pad), thead=None) == []
    bevindingen = check(str(pad), thead="04 Verdieping")
    assert [b.regel for b in bevindingen] == [REGEL_THEAD]
    assert "staat op [5]" in bevindingen[0].melding
    # Een kop die zich op de vervolgpagina herhaalt, staat op twee pagina's.
    herhaald = _bouw_pdf(tmp_path / "herhaald.pdf", [
        [(400.0, "cover")],
        _vulregels(60.0, 700.0, "p2") + [(730.0, "Meetgegevens")],
        [(60.0, "02 Behoudscontext"), (90.0, "Onderwerp Score")]
        + _vulregels(120.0, 760.0, "p3"),
        [(60.0, "Onderwerp Score")] + _vulregels(90.0, 760.0, "p4"),
        [(60.0, "korte slotpagina")],
    ])
    assert check(str(herhaald), thead="Onderwerp Score",
                 regels=(REGEL_THEAD,)) == []


def test_check_meldt_een_document_dat_te_kort_is_om_te_meten(tmp_path: Path):
    pad = _bouw_pdf(tmp_path / "kort.pdf", [[(400.0, "cover")], [(60.0, "Meetgegevens")]])
    bevindingen = check(str(pad))
    assert [b.regel for b in bevindingen] == [REGEL_P02]
    assert "2 pagina" in bevindingen[0].melding
    # Ook als de regelselectie hem niet vraagt: zwijgen zou lezen als "gemeten
    # en goed", en er is juist niets te meten.
    assert check(str(pad), regels=(REGEL_VULLING,)) == bevindingen


def test_check_meet_alleen_de_gevraagde_regels(tmp_path: Path):
    pad = _goed_rapport(tmp_path / "filter.pdf", p3_kop="Segmentstatus",
                        p4_regels=[(60.0, "03 Overzichtsprofiel"), (90.0, "een regel")])
    assert {b.regel for b in check(str(pad), regels=ALLE_REGELS)} == {REGEL_P02, REGEL_VULLING}
    assert {b.regel for b in check(str(pad), regels=(REGEL_VULLING,))} == {REGEL_VULLING}


def _cli(*args: str) -> subprocess.CompletedProcess:
    return subprocess.run([sys.executable, str(_SCRIPT), *args],
                          capture_output=True, text=True,
                          cwd=str(_SCRIPT.parents[1]))


def test_cli_faalt_hard_en_zegt_welke_regel(tmp_path: Path):
    goed = _goed_rapport(tmp_path / "cli-goed.pdf")
    uit = _cli(str(goed))
    assert uit.returncode == 0, uit.stdout + uit.stderr
    assert "OK" in uit.stdout and "gemeten: " in uit.stdout

    fout = _goed_rapport(tmp_path / "cli-fout.pdf", p3_kop="Segmentstatus")
    uit = _cli(str(fout))
    assert uit.returncode == 1
    assert f"[{REGEL_P02}] pagina 3 begint niet met hoofdstuk 02" in uit.stdout
    assert "NIET OK" in uit.stdout

    uit = _cli(str(tmp_path / "bestaat-niet.pdf"))
    assert uit.returncode == 2
    assert "NIET GEMETEN" in uit.stdout


@requires_weasyprint
def test_de_echte_pdf_zet_de_meetgegevens_op_pagina_twee(tmp_path: Path):
    """H16 op de echte render: pagina 2 eindigt met de meetgegevens en pagina 3
    begint met hoofdstuk 02. De vullingsregel hoort bij taak 8 en wordt hier
    niet gemeten.

    Slaat over waar WeasyPrint niet kan renderen (Windows zonder GTK); valideer
    daar via de WeasyPrint-Docker-image en scripts/check_pdf_report.py, zie
    CLAUDE.md.
    """
    from weasyprint import HTML

    pad = tmp_path / "retention.pdf"
    HTML(string=render_retention_report_html(_retention_met_secties())).write_pdf(str(pad))
    bevindingen = check(str(pad), regels=(REGEL_P02, REGEL_VERWIJZING))
    assert bevindingen == [], [str(b) for b in bevindingen]

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


def test_agenda_verwijst_naar_pagina_twee_alleen_met_rasterrijen():
    assert "Dezelfde opener staat op pagina 2." in _raster(RANKED)
    assert "Dezelfde opener staat op pagina 2." not in _raster([])


def test_onboarding_agenda_verwijst_naar_pagina_twee():
    kw = dict(primary_theme="A (5.0/10)", second_point="B (5.5/10)", mgmt_q="V?",
              review_when="Later.")
    assert "Dezelfde opener staat op pagina 2." in _eerste_managementspoor(**kw, opener_op_p02=True)
    assert "Dezelfde opener staat op pagina 2." not in _eerste_managementspoor(**kw)
    assert "Dezelfde opener staat op pagina 2." not in _eerste_managementspoor(
        **kw, opener_op_p02=True, degraded_note="Niets.")


def test_onboarding_render_verwijst_naar_pagina_twee():
    from tests.test_report_degraded_page_two import _fixture
    from backend.report_html import render_onboarding_report_html
    html = render_onboarding_report_html(_fixture("onboarding", n=12, profile=True))
    assert "Dezelfde opener staat op pagina 2." in html
    html = render_onboarding_report_html(_fixture("onboarding", n=8, profile=False))
    assert "Dezelfde opener staat op pagina 2." not in html


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

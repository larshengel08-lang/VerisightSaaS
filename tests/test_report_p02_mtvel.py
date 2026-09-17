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

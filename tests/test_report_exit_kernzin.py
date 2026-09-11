"""Kernzin p.02 Loep Vertrek mag niet claimen dat het startpunt het laagst scoort.

Bug B1 (stresstest ronde 1, scenario 08): het raster-startpunt is bij Loep
Vertrek BY DESIGN niet altijd de laagst scorende factor -- de vertrekreden-
weging (EXIT_REASON_WEIGHT) en de spreidings-/verdiepingsvlaggen kunnen een
andere factor bovenaan zetten. De oude kernzin zei onvoorwaardelijk "X scoort
het laagst (4,9/10)", terwijl het raster drie pagina's verderop een lagere
score voor een andere factor toont.

De fixture hieronder is gemodelleerd op
tests/test_report_priority_consistency.py::_min_exit_fixture (zelfde vorm,
zelfde velden), maar dwingt de divergentie af: leadership 4.88 komt via twee
vertrekreden-vermeldingen (base 4.88 - 2*0.4 = 4.08) boven growth 4.50, dat
de laagste kale score heeft.
"""
from backend.report_html import _fl, render_exit_report_html
from backend.report_priority import rank_factors
from backend.scoring_config import ORG_FACTOR_KEYS

# growth is de laagste kale score; leadership wordt het startpunt.
_FACTOR_AVGS = {
    "leadership":   4.88,
    "growth":       4.50,
    "workload":     5.90,
    "role_clarity": 6.20,
    "culture":      6.40,
    "compensation": 7.10,
}

_ITEM_MAP = {
    "leadership":    [("LD1", "Mijn leidinggevende geeft duidelijke feedback")],
    "growth":        [("GR1", "Ik zie voldoende ontwikkelmogelijkheden")],
    "workload":      [("WL1", "Mijn werkdruk is behapbaar")],
    "culture":       [("CU1", "Ik voel me veilig om kritiek te uiten")],
    "compensation":  [("CO1", "Mijn beloning past bij mijn werk")],
    "role_clarity":  [("RC1", "Mijn rol en verwachtingen zijn helder")],
}
_ITEM_AVGS = {items[0][0]: _FACTOR_AVGS[fk] for fk, items in _ITEM_MAP.items()}


def _exit_fixture(exit_r_dist):
    n = 12
    return dict(
        campaign_id="c1", scan_type="exit", scan_lbl="Loep Vertrek",
        org_name="TestOrg", campaign_name="Wave 1", generated_at="11-09-2026",
        n_invited=n + 3, n_completed=n, completion_pct=80.0, avg_risk=5.5,
        factor_avgs=dict(_FACTOR_AVGS),
        top_fkeys=["growth"], top_flabels=[_fl("growth", "exit")],
        factor_items_map={fk: list(items) for fk, items in _ITEM_MAP.items()},
        org_item_avgs=dict(_ITEM_AVGS),
        sdt_item_avgs={}, sdt_avgs={}, nsp={},
        exit_r_dist=list(exit_r_dist), cont_dist=[],
        deepening_agg={}, factor_resp_scores={},
        segment_rows=[], segment_factor_rows=None,
        enps_available=False, enps_score=None,
        sdt_items=[], open_texts=[],
    )


def _startpunt_key(exit_r_dist):
    """Onafhankelijke herberekening van de rangorde: bewijst dat de fixture
    het startpunt daadwerkelijk weg van de laagste score duwt."""
    code_to_count = {r["code"]: r["count"] for r in exit_r_dist}
    from backend.report_html import FACTOR_EXIT_CODE
    reasons = {fk: code_to_count.get(FACTOR_EXIT_CODE.get(fk), 0) for fk in _FACTOR_AVGS}
    ranked = rank_factors("exit", _FACTOR_AVGS, {}, {}, exit_reason_counts=reasons,
                          labels={fk: _fl(fk, "exit") for fk in ORG_FACTOR_KEYS})
    return ranked[0]["key"]


_LOWEST_KEY = min(_FACTOR_AVGS, key=lambda fk: _FACTOR_AVGS[fk])


def test_startpunt_wijkt_af_van_laagste_score_in_deze_fixture():
    # Sanity: zonder deze divergentie toetst de regressietest niets.
    dist = [{"code": "PL1", "label": "Beter aanbod elders", "count": 5},
            {"code": "P1", "label": "Leiderschap / management", "count": 2}]
    assert _LOWEST_KEY == "growth"
    assert _startpunt_key(dist) == "leadership"


def test_kernzin_claimt_niet_dat_startpunt_het_laagst_scoort():
    dist = [{"code": "PL1", "label": "Beter aanbod elders", "count": 5},
            {"code": "P1", "label": "Leiderschap / management", "count": 2}]
    assert _startpunt_key(dist) == "leadership"
    html = render_exit_report_html(_exit_fixture(dist))

    start_lbl = _fl("leadership", "exit")
    assert (f"Bovenaan staat {start_lbl} (4.9/10); Beter aanbod elders is de "
            f"meest genoemde vertrekreden.") in html
    # Geen enkele variant van de laagste-claim mag terugkeren.
    assert "scoort het laagst" not in html
    assert "laagste factor" not in html
    # De bronregel onder de gespreksopener draagt de uitleg (één verhaal).
    assert ("Gebaseerd op de score en hoe vaak dit thema als vertrekreden is "
            "genoemd.") in html
    assert "Gebaseerd op de laagst scorende factor." not in html


def test_kernzin_bij_samenvallende_vertrekreden_claimt_geen_laagste_factor():
    # Tak 1: het startpuntlabel valt samen met de meest genoemde vertrekreden.
    # Synthetisch label -- de echte EXIT_REASON_LABELS_NL bevatten geen
    # volledig factorlabel, maar de tak bestaat en moet waar blijven.
    dist = [{"code": "P1", "label": _fl("leadership", "exit"), "count": 2}]
    assert _startpunt_key(dist) == "leadership"
    html = render_exit_report_html(_exit_fixture(dist))

    start_lbl = _fl("leadership", "exit")
    assert (f"maar {start_lbl} springt eruit: het staat bovenaan en is de "
            f"meest genoemde vertrekreden.") in html
    assert "zowel de laagste factor" not in html
    assert "scoort het laagst" not in html


def test_kernzin_copy_heeft_geen_em_dashes():
    dist = [{"code": "PL1", "label": "Beter aanbod elders", "count": 5},
            {"code": "P1", "label": "Leiderschap / management", "count": 2}]
    html = render_exit_report_html(_exit_fixture(dist))
    start = html.find("Het vertrekbeeld is")
    assert start != -1
    kernzin = html[start:start + 220]
    assert "\u2014" not in kernzin and "&#x2014;" not in kernzin

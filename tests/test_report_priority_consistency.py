"""Rapportbrede consistentie: p.02 primaire factor == raster-startpunt.

Spec: docs/superpowers/specs/2026-07-18-prioriteringsraster-gespreksagenda-design.md
par. 4 ("Doorwerking in de rest van het rapport") -- de p.02 "Bestuurlijke
read" primary-factor en de sluitende "Waar begint het gesprek?"-raster
("Startpunt"-rij) moeten in een echt gerenderd rapport dezelfde factor tonen,
niet alleen aantoonbaar via code-inspectie. Tijdens Taak 6's code-review werd
hier via handmatige inspectie een echte bug gevonden (p.02 gebruikte een
andere labellookup dan het raster voor precies dezelfde factor) -- dit
bestand vangt die bugklasse voortaan automatisch.

Bewust GEEN hergebruik van tests/test_report_distribution.py::_min_retention_data:
die fixture is single-factor (factor_avgs={"workload": 5.0}), waardoor "de
raster-startpunt == p.02-primary" altijd triviaal waar zou zijn, ongeacht of
de wiring klopt. Deze fixtures gebruiken 6 factoren met een duidelijke
spreiding zodat de ranking een echte kans heeft om fout te gaan.
"""
from backend.report_html import (
    _fl,
    render_exit_report_html,
    render_retention_report_html,
)
from backend.report_priority import rank_factors
from backend.scoring_config import ORG_FACTOR_KEYS

# Multi-factor spread (zelfde patroon als tests/test_report_priority.py's
# test_navolgbaarheid_invariant_over_scenarios): "growth" scoort duidelijk het
# laagst, geen van de verschillen valt binnen PRIORITY_TIE_MARGIN (0.3), dus
# geen vlaggen/gelijkspel-mechanica kan de simpele score-volgorde omgooien --
# de test moet puur de wiring toetsen, niet de tiebreak-logica (die heeft al
# een eigen dekking in test_report_priority.py).
_FACTOR_AVGS = {
    "growth": 5.1,
    "workload": 5.9,
    "leadership": 6.4,
    "culture": 6.8,
    "compensation": 7.1,
    "role_clarity": 6.2,
}

# Eén item per factor + een reële per-item score -- nodig voor de why-cells
# op p.02 en de item-tabel op de verdieping-detailpagina om te renderen
# zonder te crashen (zelfde patroon als _min_retention_data's
# factor_items_map={"workload": [("W1", "Testvraag werkdruk")]}).
_ITEM_MAP = {
    "growth":        [("GR1", "Ik zie voldoende ontwikkelmogelijkheden")],
    "workload":      [("WL1", "Mijn werkdruk is behapbaar")],
    "leadership":    [("LD1", "Mijn leidinggevende geeft duidelijke feedback")],
    "culture":       [("CU1", "Ik voel me veilig om kritiek te uiten")],
    "compensation":  [("CO1", "Mijn beloning past bij mijn werk")],
    "role_clarity":  [("RC1", "Mijn rol en verwachtingen zijn helder")],
}
_ITEM_AVGS = {fk_items[0][0]: _FACTOR_AVGS[fk] for fk, fk_items in _ITEM_MAP.items()}


def _min_retention_fixture():
    """Model op tests/test_report_distribution.py::_min_retention_data (regel
    ~93), maar met alle 6 organisatiefactoren i.p.v. één (zie moduledocstring
    voor waarom). Lokaal gebouwd -- die helper zelf blijft ongewijzigd, wordt
    ook door andere tests gebruikt."""
    n = 12
    return dict(
        campaign_id="c1", scan_type="retention", scan_lbl="Loep Behoud",
        org_name="TestOrg", campaign_name="Wave 1", generated_at="11-07-2026",
        delivery_mode="Baseline", n_invited=n + 3, n_completed=n,
        completion_pct=80.0, avg_risk=5.5, avg_eng=6.0, avg_to=5.0, avg_si=5.0,
        band_counts={"HOOG": 0, "MIDDEN": n, "LAAG": 0}, has_pattern=True,
        factor_avgs=dict(_FACTOR_AVGS),
        top_risks=[("growth", _FACTOR_AVGS["growth"])],
        top_fkeys=["growth"], top_flabels=[_fl("growth", "retention")],
        strong_work=None, top_exit_lbl=None, top_cont_lbl=None, sig_vis=None,
        sdt_avgs={}, sdt_item_avgs={}, org_item_avgs=dict(_ITEM_AVGS),
        exit_r_dist=[], cont_dist=[], prev_dist={}, open_texts=[],
        deepening_agg={}, retention_profile=None, exit_pbs=[], ret_pbs=[],
        msp=None, nsp={},
        factor_items_map={fk: list(items) for fk, items in _ITEM_MAP.items()},
        sdt_items=[], enps_available=False, enps_score=None,
        factor_resp_scores={},
        intent_resp={"stay": [5.0] * n, "turnover": [5.0] * n, "engagement": [5.0] * n},
    )


def _min_exit_fixture():
    """Lokale minimale fixture voor render_exit_report_html -- er bestaat nog
    geen equivalent van _min_retention_data voor exit. Gebouwd door alle
    data[...]/data.get(...)-toegangen in render_exit_report_html
    (backend/report_html.py, vanaf regel 1964) te lezen; exit_r_dist/cont_dist
    blijven leeg (geen vertrekreden-weging getest hier -- zie
    test_report_priority.py voor die interactie op rank_factors-niveau)."""
    n = 12
    return dict(
        campaign_id="c1", scan_type="exit", scan_lbl="Loep Vertrek",
        org_name="TestOrg", campaign_name="Wave 1", generated_at="11-07-2026",
        n_invited=n + 3, n_completed=n, completion_pct=80.0, avg_risk=5.5,
        factor_avgs=dict(_FACTOR_AVGS),
        top_fkeys=["growth"], top_flabels=[_fl("growth", "exit")],
        factor_items_map={fk: list(items) for fk, items in _ITEM_MAP.items()},
        org_item_avgs=dict(_ITEM_AVGS),
        sdt_item_avgs={}, sdt_avgs={}, nsp={},
        exit_r_dist=[], cont_dist=[],
        deepening_agg={}, factor_resp_scores={},
        segment_rows=[], segment_factor_rows=None,
        enps_available=False, enps_score=None,
        sdt_items=[], open_texts=[],
    )


def _assert_p02_matches_raster_startpunt(html: str, scan_type: str) -> None:
    """Gedeelde asserties voor beide scans.

    expected_fk/expected_label worden ONAFHANKELIJK berekend (via rank_factors
    + _fl, niet via een hardcoded stringgok) zodat de test breekt als de
    renderer ooit een andere labelbron of een andere rangorde gebruikt."""
    ranked = rank_factors(
        scan_type, _FACTOR_AVGS, {}, {},
        labels={fk: _fl(fk, scan_type) for fk in ORG_FACTOR_KEYS},
    )
    # Sanity: dit moet een echte, niet-triviale ranking zijn -- meerdere
    # factoren, en de laagste is niet toevallig de enige.
    assert len(ranked) > 1
    assert ranked[0]["key"] == "growth"

    expected_fk = ranked[0]["key"]
    expected_label = _fl(expected_fk, scan_type)

    # p.02 "Bestuurlijke read": why-title noemt de primaire factor.
    why_marker = f"Waarom {expected_label} bovenaan staat"
    why_idx = html.find(why_marker)
    assert why_idx != -1, f"p.02-marker niet gevonden: {why_marker!r}"

    # Sluitend prioriteringsraster: de "r-top"-rij (Startpunt) toont dezelfde
    # canonieke label, via de r-fl-span (zie _prioriteringsraster).
    raster_marker = f'<span class="r-fl">{expected_label}</span>'
    raster_idx = html.find(raster_marker)
    assert raster_idx != -1, f"raster r-top-marker niet gevonden: {raster_marker!r}"

    # p.02 staat vóór het sluitende raster (raster is naar het slot verplaatst).
    assert why_idx < raster_idx

    # De startpuntfactor krijgt ook een eigen verdieping/detailpagina --
    # priority_fkeys = [r["key"] for r in _raster_rows[:3]] moet dus deze
    # factor daadwerkelijk als sectie emitten, niet alleen als raster-rij.
    detail_marker = f"Verdieping: {expected_label}"
    assert detail_marker in html, f"verdieping-detailpagina niet gevonden: {detail_marker!r}"


def test_retention_p02_primary_matches_raster_startpunt():
    html = render_retention_report_html(_min_retention_fixture())
    _assert_p02_matches_raster_startpunt(html, "retention")


def test_exit_p02_primary_matches_raster_startpunt():
    html = render_exit_report_html(_min_exit_fixture())
    _assert_p02_matches_raster_startpunt(html, "exit")

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
    FACTOR_LABELS_NL,
    _fl,
    render_exit_report_html,
    render_retention_report_html,
)
from backend.report_priority import rank_factors
from backend.scoring_config import ORG_FACTOR_KEYS

from tests.conftest import exit_report_data

# Multi-factor spread (zelfde patroon als tests/test_report_priority.py's
# test_navolgbaarheid_invariant_over_scenarios): "workload" scoort duidelijk
# het laagst, geen van de verschillen valt binnen PRIORITY_TIE_MARGIN (0.3),
# dus geen vlaggen/gelijkspel-mechanica kan de simpele score-volgorde omgooien
# -- de test moet puur de wiring toetsen, niet de tiebreak-logica (die heeft
# al een eigen dekking in test_report_priority.py).
#
# BEWUST "workload" als laagste, niet "growth": code-review Taak 8 (mutatie-
# test) toonde dat "growth" toevallig hetzelfde label heeft in zowel de
# generieke FACTOR_LABELS_NL als de canonieke _fl(fk, scan_type) -- een test
# die "growth" als startpunt gebruikt, zou de exacte Taak-6-bugklasse (p.02
# gebruikte FACTOR_LABELS_NL i.p.v. _fl) NIET vangen als hij ooit terugkeert.
# "workload" heeft voor beide scans een echt afwijkend generiek label
# ("Werkbelasting" vs "Werkdruk en balans"/"Werkdruk en herstelruimte"), dus
# een terugval naar de generieke labelbron breekt deze test aantoonbaar.
_FACTOR_AVGS = {
    "workload": 5.1,
    "growth": 5.9,
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
        delivery_mode="Baseline", n_invited=n + 3, n_invited_note="", n_completed=n,
        completion_pct=80.0, avg_risk=5.5, avg_eng=6.0, avg_to=5.0, avg_si=5.0,
        band_counts={"HOOG": 0, "MIDDEN": n, "LAAG": 0}, has_pattern=True,
        factor_avgs=dict(_FACTOR_AVGS),
        # Bewust "growth" (niet "workload"): dit simuleert de OUDE,
        # losstaande ranking die p.02 vóór Taak 6/7 gebruikte. Blijft
        # opzettelijk afwijken van de nieuwe raster-startpunt ("workload"),
        # zodat deze test ook bewijst dat de nieuwe wiring de oude
        # top_fkeys-selectie daadwerkelijk overstemt, niet toevallig eendere
        # uitkomsten geeft.
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
    """Minimale fixture voor render_exit_report_html; de dict-vorm zelf staat in
    tests/conftest.py::exit_report_data (gedeeld met test_report_exit_kernzin.py,
    dat dezelfde vorm gebruikte met andere data).

    exit_r_dist/cont_dist blijven hier leeg: geen vertrekreden-weging in deze
    test -- zie test_report_priority.py voor die interactie op
    rank_factors-niveau, en test_report_exit_kernzin.py voor het effect op de
    copy."""
    return exit_report_data(factor_avgs=_FACTOR_AVGS, factor_items_map=_ITEM_MAP)


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
    assert ranked[0]["key"] == "workload"

    expected_fk = ranked[0]["key"]
    expected_label = _fl(expected_fk, scan_type)

    # Bewaakt de aanname waar deze hele test op leunt (code-review Taak 8):
    # "workload" is bewust gekozen omdat zijn canonieke label afwijkt van de
    # generieke FACTOR_LABELS_NL. Als die twee ooit weer gelijk worden (bijv.
    # door een toekomstige copy-wijziging), verliest deze test stilzwijgend
    # zijn vermogen om de Taak-6-bugklasse te vangen -- dat mag nooit stil
    # gebeuren. Als dit breekt: kies een andere ORG_FACTOR_KEYS-factor die nog
    # wel afwijkt (niet "growth"/"role_clarity" voor exit -- zie moduledocstring).
    assert expected_label != FACTOR_LABELS_NL.get(expected_fk), (
        f"'{expected_fk}' zijn canonieke label ({expected_label!r}) is gelijk "
        f"geworden aan het generieke FACTOR_LABELS_NL-label -- deze test kan "
        f"de Taak-6-labelbron-regressie niet meer vangen. Kies een andere "
        f"laagste factor in _FACTOR_AVGS."
    )

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
    #
    # Check op de factor-specifieke itemvraag (uit _ITEM_MAP), niet op het
    # "Verdieping: {label}"-koptekst-label: de exit-renderer's _factor_detail
    # gebruikt voor die koptekst nog de generieke FACTOR_LABELS_NL i.p.v. _fl
    # (bekend, apart getrackt vervolgpunt na code-review Taak 6 -- niet dit
    # rasterwerk se scope). Deze check moet puur bewijzen dat de JUISTE
    # FACTOR (op key) een detailpagina kreeg, onafhankelijk van welke
    # labelconventie de koptekst gebruikt.
    item_question = _ITEM_MAP[expected_fk][0][1]
    assert item_question in html, f"verdieping-detailpagina niet gevonden voor {expected_fk!r} (itemvraag {item_question!r} ontbreekt)"


def test_retention_p02_primary_matches_raster_startpunt():
    html = render_retention_report_html(_min_retention_fixture())
    _assert_p02_matches_raster_startpunt(html, "retention")


def test_exit_p02_primary_matches_raster_startpunt():
    html = render_exit_report_html(_min_exit_fixture())
    _assert_p02_matches_raster_startpunt(html, "exit")


# ── p.02 en het raster vertellen één verhaal over de vraag om verandering ────
# Beslissing reviewronde 2026-09-12 (spec ronde 2 par. 2.2): is het profiel breed
# "niets nodig", dan is de vraag ÓF er een startpunt moet zijn zelf aan de orde,
# en dan hoort er geen grond vóór dat startpunt te staan, hoe waar de telling ook
# is. De markeringsregel onder de rasterrij legt de volgorde dan nog steeds uit,
# dus er verdwijnt navolgbaarheid noch getal.

# Leiderschap (4,70) en cultuur (4,60) liggen binnen PRIORITY_TIE_MARGIN, en de
# vraag om verandering zet leiderschap bovenaan (3 van de 7 tegen 0 van de 4).
# Beide factoren zijn óók none_needed: de niets-optie heeft op elk van de twee
# een strikte meerderheid. Dat is precies de combinatie waarin p.02 en het
# raster elkaar zouden tegenspreken.
_NN_FACTOR_AVGS = {
    "leadership":   4.70,
    "culture":      4.60,
    "growth":       7.40,
    "compensation": 7.10,
    "workload":     7.00,
    "role_clarity": 7.20,
}
_NN_ITEM_MAP = {fk: [(fk[:2].upper() + "1", f"Stelling over {fk}")]
                for fk in _NN_FACTOR_AVGS}


def _nn_agg(none_n: int, change_n: int, none_key: str, change_key: str) -> dict:
    return {"lowest_n": none_n + change_n, "offered": none_n + change_n,
            "answered": none_n + change_n, "skipped": 0,
            "counts": {none_key: none_n, change_key: change_n}}


_NN_DIRECTION_AGG = {
    "leadership": _nn_agg(4, 3, "ldd_none", "ldd_feedback"),
    "culture": _nn_agg(4, 0, "cud_none", "cud_safety"),
}


def _nn_html() -> str:
    return render_exit_report_html(exit_report_data(
        factor_avgs=_NN_FACTOR_AVGS, factor_items_map=_NN_ITEM_MAP,
        direction_agg=_NN_DIRECTION_AGG))


def _kernzin(html: str) -> str:
    start = html.index('<p class="br-kernzin">')
    return html[start:html.index("</p>", start)]


def test_fixture_zet_de_botsing_echt_op():
    """Sanity: zonder deze twee eigenschappen toetst de test hieronder niets."""
    from backend.products.shared.deepening import direction_none_needed_view
    from backend.report_priority import rank_factors as _rank

    rows = _rank("exit", _NN_FACTOR_AVGS, {}, {}, exit_reason_counts={},
                 labels={fk: _fl(fk, "exit") for fk in ORG_FACTOR_KEYS},
                 direction_agg=_NN_DIRECTION_AGG)
    # De richting besliste de volgorde, tegen cultuur.
    assert rows[0]["key"] == "leadership"
    assert rows[0]["decided_by"] == {"kind": "direction", "other": "culture"}
    # En toch zegt elke factor met genoeg beantwoorders "hier hoeft niets".
    for fk, agg in _NN_DIRECTION_AGG.items():
        assert direction_none_needed_view(agg, fk) == "none_needed"


def test_bij_breed_niets_nodig_staat_er_geen_richtinggrond_op_pagina_twee():
    kernzin = _kernzin(_nn_html())
    assert "Je mensen vragen nergens dringend om verandering." in kernzin
    assert "Bespreek of een startpunt nu nodig is" in kernzin
    # De grond vóór het startpunt hoort hier niet: de vraag is of er een
    # startpunt moet zijn, niet waarom het dit onderwerp is.
    assert "vragen meer mensen om verandering dan bij" not in kernzin
    assert "Als startpunt kiest Loep" not in kernzin


def test_het_raster_legt_de_volgorde_nog_steeds_uit():
    """Er verdwijnt geen navolgbaarheid: de markeringsregel onder de rasterrij
    noemt het signaal en beide tellingen nog gewoon."""
    html = _nn_html()
    assert (f"Staat hoger dan {_fl('culture', 'exit')} omdat hier meer mensen om "
            f"verandering vragen (3 van de 7 tegen 0 van de 4).") in html

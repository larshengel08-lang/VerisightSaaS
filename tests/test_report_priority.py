"""Tests voor rank_factors (spec 2026-07-18 par. 3) — pure rangorde-logica."""
import pytest

from backend.report_priority import (
    PRIORITY_TIE_MARGIN,
    rank_factors,
)

# Handige defaults: geen spreiding-data, geen deepening, geen exit-redenen.
def _rank(scan_type, avgs, resp=None, deep=None, reasons=None, labels=None):
    return rank_factors(scan_type, avgs, resp or {}, deep or {},
                        exit_reason_counts=reasons, labels=labels or {})


def test_basic_order_is_score_ascending():
    avgs = {"growth": 5.1, "workload": 6.2, "leadership": 7.0}
    keys = [r["key"] for r in _rank("retention", avgs)]
    assert keys == ["growth", "workload", "leadership"]


def test_sdt_dimensions_never_in_raster():
    # Bugfix 2026-07-13: factor_averages bevat ook SDT-dimensies; autonomy heeft
    # hier de laagste score en mag toch nooit verschijnen.
    avgs = {"autonomy": 2.0, "competence": 2.5, "relatedness": 3.0,
            "growth": 5.1, "workload": 6.2}
    keys = [r["key"] for r in _rank("retention", avgs)]
    assert keys == ["growth", "workload"]


def test_exit_reason_weight_shifts_base():
    # Bestaande formule: base = score - 0.4 * vertrekreden-count.
    avgs = {"growth": 5.0, "workload": 5.5}
    rows = _rank("exit", avgs, reasons={"workload": 2})  # workload base = 4.7
    assert [r["key"] for r in rows] == ["workload", "growth"]
    assert rows[0]["base"] == pytest.approx(4.7)
    assert rows[0]["score"] == pytest.approx(5.5)  # getoonde score blijft onbewerkt


def test_retention_ignores_exit_reasons():
    avgs = {"growth": 5.0, "workload": 5.5}
    rows = _rank("retention", avgs, reasons={"workload": 5})
    assert [r["key"] for r in rows] == ["growth", "workload"]


def test_agenda_roles_top2():
    avgs = {"growth": 5.1, "workload": 5.9, "leadership": 7.0}
    rows = _rank("retention", avgs)
    assert rows[0]["agenda_role"] == "startpunt"
    assert rows[1]["agenda_role"] == "tweede"
    assert rows[2]["agenda_role"] is None


def test_deterministic_alphabetical_final_tiebreak():
    # Identieke scores, geen vlaggen: alfabetisch op label, en stabiel over runs.
    avgs = {"culture": 6.0, "workload": 6.0}
    labels = {"culture": "Cultuur en psychologische veiligheid",
              "workload": "Werkdruk en herstelruimte"}
    for _ in range(3):
        rows = _rank("retention", avgs, labels=labels)
        assert [r["key"] for r in rows] == ["culture", "workload"]


# ── Spreidingsvlag-gates ─────────────────────────────────────────────────────

def _scores(n, below):
    """n respondentscores waarvan `below` onder de 5.0."""
    return [4.0] * below + [7.0] * (n - below)


def test_spread_flag_requires_n10_and_share():
    avgs = {"growth": 6.0}
    # n=9, 5 onder de 5 (55%): vlag bestaat NIET onder MIN_DISTRIBUTION_N.
    rows = _rank("retention", avgs, resp={"growth": _scores(9, 5)})
    assert rows[0]["spread_flag"] is False
    # n=10, 3 onder de 5 (30%): precies op de share-drempel -> vlag.
    rows = _rank("retention", avgs, resp={"growth": _scores(10, 3)})
    assert rows[0]["spread_flag"] is True
    # n=10, 2 onder de 5 (20%): geen vlag.
    rows = _rank("retention", avgs, resp={"growth": _scores(10, 2)})
    assert rows[0]["spread_flag"] is False


# ── Verdiepingsvlag = exact agenda_enrichment ────────────────────────────────

def _agg(answered=0, offered=0, triggered=0, counts=None):
    return {"triggered": triggered, "offered": offered, "answered": answered,
            "skipped": 0, "primary_counts": counts or {}, "secondary_counts": {},
            "direction_offered": 0, "direction_answered": 0,
            "direction_skipped": 0, "direction_counts": {}}


def test_deepening_flag_follows_enrichment_gates():
    # Echte option-keys nodig: agenda_enrichment roept bij een gevuurde staffel
    # get_agenda_question aan, die een KeyError gooit op onbekende keys.
    # Growth-opties (backend.products.shared.deepening.DEEPENING_SETS):
    # gr_visibility, gr_conversation, gr_follow_through, gr_time, gr_criteria,
    # gr_ceiling, gr_other.
    avgs = {"growth": 6.0}
    # 7 van 13, marge >= 2: verrijkingsstaffel haalt -> staat 1 + vlag.
    ok = _agg(answered=13, offered=13, triggered=13,
              counts={"gr_visibility": 7, "gr_conversation": 3})
    rows = _rank("retention", avgs, deep={"growth": ok})
    assert rows[0]["deepening_state"] == 1
    assert rows[0]["flags"] == 1
    # 6 van 13 (46% < 50%): staffel haalt niet -> staat 2, geen vlag.
    # (Dit pad retourneert None uit agenda_enrichment vóór get_agenda_question
    # wordt aangeroepen, dus placeholder-keys zouden hier niet crashen -- maar
    # gebruik ook hier echte keys voor consistentie.)
    nok = _agg(answered=13, offered=13, triggered=13,
               counts={"gr_visibility": 6, "gr_conversation": 4})
    rows = _rank("retention", avgs, deep={"growth": nok})
    assert rows[0]["deepening_state"] == 2
    assert rows[0]["flags"] == 0


# ── Marge-mechanica ──────────────────────────────────────────────────────────

def _flagged_deep():
    # Workload-opties (DEEPENING_SETS): wl_volume, wl_recovery, wl_priorities,
    # wl_capacity, wl_peaks_adhoc, wl_process, wl_other. Deze fixture wordt
    # gebruikt voor de "workload"-factor, dus echte wl_*-keys (zie hierboven:
    # agenda_enrichment vuurt hier, dus get_agenda_question wordt aangeroepen).
    return _agg(answered=13, offered=13, triggered=13,
                counts={"wl_volume": 9, "wl_recovery": 1})


def test_flag_flips_only_within_margin():
    deep = {"workload": _flagged_deep()}
    # Verschil 0.2 (< 0.3): gevlagde workload 5.4 passeert growth 5.2.
    rows = _rank("retention", {"growth": 5.2, "workload": 5.4}, deep=deep)
    assert [r["key"] for r in rows] == ["workload", "growth"]
    # Verschil exact 0.3: GEEN flip (strikt kleiner dan) en GEEN label.
    rows = _rank("retention", {"growth": 5.1, "workload": 5.4}, deep=deep)
    assert [r["key"] for r in rows] == ["growth", "workload"]
    assert rows[1]["near_tie_with"] is None
    # Verschil 0.4 (> 0.3): geen flip.
    rows = _rank("retention", {"growth": 5.0, "workload": 5.4}, deep=deep)
    assert [r["key"] for r in rows] == ["growth", "workload"]


def test_flags_do_not_stack():
    # workload heeft TWEE vlaggen (spreiding + verdieping) maar passeert een
    # factor op 0.4 afstand nog steeds niet: vlaggen stapelen niet tot 0.6.
    deep = {"workload": _flagged_deep()}
    resp = {"workload": _scores(12, 6)}
    rows = _rank("retention", {"growth": 5.0, "workload": 5.4},
                 deep=deep, resp=resp)
    assert rows[0]["key"] == "growth"
    assert rows[1]["flags"] == 2


# ── Gelijkspel-label ─────────────────────────────────────────────────────────

def test_near_tie_label_requires_same_flagset():
    # Zelfde vlaggenset (geen vlaggen), verschil 0.2: label op de onderste rij.
    rows = _rank("retention", {"growth": 5.2, "workload": 5.4})
    assert rows[0]["near_tie_with"] is None  # bovenste rij nooit een label
    assert rows[1]["near_tie_with"] == "growth"
    # Verschillend vlaggenset: de vlag gaf de doorslag -> geen gelijkspel-label.
    rows = _rank("retention", {"growth": 5.2, "workload": 5.4},
                 deep={"workload": _flagged_deep()})
    assert [r["key"] for r in rows] == ["workload", "growth"]
    assert rows[1]["near_tie_with"] is None


def test_near_tie_label_exact_margin_with_equal_flagsets():
    # Code-review Taak 2: de vorige exact-0,3-check in
    # test_flag_flips_only_within_margin bevestigde "geen label" alleen omdat
    # de vlaggensets daar al verschilden (confound). Hier zijn de vlaggensets
    # gelijk (beide leeg) en is het verschil exact PRIORITY_TIE_MARGIN, dus dit
    # pint de strikte "<" op de near_tie_with-grens zelf, spec par. 3.4.
    rows = _rank("retention", {"growth": 5.1, "workload": 5.4})
    assert [r["key"] for r in rows] == ["growth", "workload"]
    assert rows[1]["near_tie_with"] is None


# ── Celstaten verdiepingskolom (spec par. 6, incl. amendement staat 2 >= 8) ──
# Let op: alleen de eerste case (state=1) laat agenda_enrichment daadwerkelijk
# vuren -> gebruik dan verplicht echte growth-option-keys (gr_visibility/
# gr_conversation), anders KeyError uit get_agenda_question. De overige cases
# vallen allemaal onder agenda_enrichment's eigen "answered<8 -> return None"
# of margin-check, dus daar zijn de keys onschadelijk (behouden als "a"/"b"
# zou kunnen, maar voor consistentie ook hier echte keys).

@pytest.mark.parametrize("agg,expected_state", [
    (_agg(answered=13, offered=13, triggered=13,
          counts={"gr_visibility": 9, "gr_conversation": 1}), 1),
    (_agg(answered=9, offered=10, triggered=10,
          counts={"gr_visibility": 5, "gr_conversation": 4}), 2),
    # Amendement-grens: answered==8 is exact de nieuwe drempel (was >=5) —
    # zonder deze case blijft het enige verschil tussen het oude en het
    # geamendeerde gedrag ongetest.
    (_agg(answered=8, offered=9, triggered=9,
          counts={"gr_visibility": 4, "gr_conversation": 4}), 2),
    # Amendement: 5-7 beantwoorders is staat 3, ook met schijnbare meerderheid.
    (_agg(answered=6, offered=8, triggered=8,
          counts={"gr_visibility": 5, "gr_conversation": 1}), 3),
    (_agg(answered=2, offered=4, triggered=6, counts={"gr_visibility": 2}), 3),
    (_agg(answered=0, offered=0, triggered=4), 4),
    (_agg(answered=0, offered=0, triggered=0), 5),
], ids=["state1_fires", "state2_no_majority_n9", "state2_boundary_n8",
        "state3_low_n_apparent_majority", "state3_very_low_n",
        "state4_cap_reached", "state5_not_triggered"])
def test_deepening_cell_states(agg, expected_state):
    rows = _rank("retention", {"growth": 6.0}, deep={"growth": agg})
    assert rows[0]["deepening_state"] == expected_state


def test_campaign_gate_off_gives_state_zero_and_no_flag():
    rows = _rank("retention", {"growth": 4.0}, deep={})
    assert rows[0]["deepening_state"] == 0
    assert rows[0]["flags"] == 0


# ── Navolgbaarheids-invariant (spec par. 3, kernbelofte; par. 9 test 2) ──────

def _invariant(rows):
    """Elke afwijking van pure base-volgorde moet een zichtbaar signaal dragen;
    het gelijkspel-label verschijnt exact wanneer de voorwaarde geldt, nooit
    daarbuiten (code-review Taak 3: de oorspronkelijke versie was
    eenrichtings — controleerde alleen dat het label aanwezig IS binnen de
    marge, nooit dat het AFWEZIG is erbuiten; dat maskeerde over-labeling)."""
    for i, r in enumerate(rows):
        for later in rows[i + 1:]:
            if r["base"] > later["base"]:
                # r staat hoger dan zijn score rechtvaardigt -> vlag verplicht.
                assert r["flags"] > 0, f"onzichtbare flip: {r['key']} boven {later['key']}"
    for i, r in enumerate(rows[1:], start=1):
        prev = rows[i - 1]
        same_flagset = (r["spread_flag"] == prev["spread_flag"]
                        and (r["deepening_state"] == 1) == (prev["deepening_state"] == 1))
        should_label = abs(r["base"] - prev["base"]) < PRIORITY_TIE_MARGIN and same_flagset
        if should_label:
            assert r["near_tie_with"] == prev["key"], f"label mist op {r['key']}"
        else:
            assert r["near_tie_with"] is None, f"onterecht label op {r['key']}"


def test_navolgbaarheid_invariant_over_scenarios():
    scenarios = [
        # (avgs, resp, deep, reasons, scan_type)
        ({"growth": 5.1, "workload": 5.4, "leadership": 5.6,
          "culture": 6.8, "compensation": 7.1, "role_clarity": 6.3}, {}, {}, None, "retention"),
        ({"growth": 5.2, "workload": 5.4}, {}, {"workload": _flagged_deep()}, None, "retention"),
        ({"growth": 5.2, "workload": 5.3, "leadership": 5.4},
         {"leadership": _scores(12, 6)}, {}, None, "retention"),
        ({"growth": 5.0, "workload": 5.5, "culture": 5.5}, {}, {}, {"workload": 2}, "exit"),
        ({"growth": 6.0, "workload": 6.0, "culture": 6.1}, {}, {}, None, "retention"),
    ]
    for avgs, resp, deep, reasons, st in scenarios:
        _invariant(_rank(st, avgs, resp=resp, deep=deep, reasons=reasons))

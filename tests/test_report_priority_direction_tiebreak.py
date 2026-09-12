"""Tests voor de richting-tie-break en de markeringsregels (spec ronde 2 par. 1)."""
from backend.products.shared.deepening import DIRECTION_MIN_N
from backend.report_priority import DIRECTION_TIE_MIN_MARGIN, rank_factors


def _dir(answered, change, none_key="gr_none", change_key="gr_visibility"):
    """Richtingaggregaat: `change` mensen vroegen om verandering, de rest koos niets."""
    counts = {}
    if change:
        counts[change_key] = change
    if answered - change:
        counts[none_key] = answered - change
    return {"lowest_n": answered, "offered": answered, "answered": answered,
            "skipped": 0, "counts": counts}


def _rank(avgs, direction=None, resp=None, deep=None, reasons=None, labels=None,
          scan_type="retention"):
    return rank_factors(scan_type, avgs, resp or {}, deep or {},
                        exit_reason_counts=reasons, labels=labels or {},
                        direction_agg=direction)


def test_direction_wins_within_margin():
    # Gelijke scores: de factor waar meer mensen om verandering vragen komt boven.
    avgs = {"growth": 6.0, "workload": 6.0}
    direction = {"growth": _dir(11, 4),
                 "workload": _dir(11, 9, none_key="wl_none", change_key="wl_volume")}
    rows = _rank(avgs, direction=direction)
    assert [r["key"] for r in rows] == ["workload", "growth"]
    assert rows[0]["direction_change"] == 9
    assert rows[1]["direction_change"] == 4


def test_direction_outranks_spread_within_margin():
    # growth heeft een spreidingsvlag, workload meer vraag om verandering.
    # Richting staat hoger in de signaalvolgorde, dus workload wint.
    avgs = {"growth": 6.0, "workload": 6.1}
    resp = {"growth": [4.0] * 5 + [7.0] * 7}          # 5 van 12 onder de 5 -> vlag
    direction = {"growth": _dir(11, 2),
                 "workload": _dir(11, 10, none_key="wl_none", change_key="wl_volume")}
    rows = _rank(avgs, direction=direction, resp=resp)
    assert rows[0]["key"] == "workload"
    assert rows[0]["tie_break_kind"] == "direction"


def test_direction_ignored_below_the_floor():
    # workload heeft 2 beantwoorders (< DIRECTION_MIN_N): richting telt voor de
    # hele groep niet mee; de spreidingsvlag van growth beslist dan.
    # growth staat hier BOVEN workload in score (6.1 tegen 6.0), zodat de
    # spreidingsvlag echt de flip veroorzaakt en dus gemarkeerd hoort te worden.
    # Telde richting wel mee, dan won workload (2 van 2 tegen 1 van 11).
    assert DIRECTION_MIN_N == 3
    avgs = {"growth": 6.1, "workload": 6.0}
    resp = {"growth": [4.0] * 5 + [7.0] * 7}
    direction = {"growth": _dir(11, 1),
                 "workload": _dir(2, 2, none_key="wl_none", change_key="wl_volume")}
    rows = _rank(avgs, direction=direction, resp=resp)
    assert rows[0]["key"] == "growth"
    assert rows[0]["tie_break_kind"] == "spread"
    assert rows[1]["direction_change"] is None


def test_direction_does_not_work_outside_the_margin():
    # Verschil 0.5 (> PRIORITY_TIE_MARGIN): richting mag niets flippen. Dit is
    # scenario 01 uit het bevindingenrapport: Leiderschap 6.17 met 10 van de 11
    # vraag om verandering blijft ONDER Groeiperspectief 5.67 met 9 van de 11.
    avgs = {"growth": 5.67, "leadership": 6.17}
    direction = {"growth": _dir(11, 9),
                 "leadership": _dir(11, 10, none_key="ldd_none",
                                    change_key="ldd_feedback")}
    rows = _rank(avgs, direction=direction)
    assert [r["key"] for r in rows] == ["growth", "leadership"]
    assert rows[0]["tie_break_kind"] is None


def test_marking_only_on_rows_that_actually_flipped():
    avgs = {"growth": 6.0, "workload": 6.1}
    direction = {"growth": _dir(11, 3),
                 "workload": _dir(11, 9, none_key="wl_none", change_key="wl_volume")}
    labels = {"growth": "Groeiperspectief", "workload": "Werkdruk en herstelruimte"}
    rows = _rank(avgs, direction=direction, labels=labels)
    assert rows[0]["key"] == "workload"
    note = rows[0]["tie_break_note"]
    assert "Groeiperspectief" in note
    assert "9 van de 11" in note and "3 van de 11" in note
    assert "verandering" in note
    # De gepasseerde rij zelf krijgt nooit een markering.
    assert rows[1]["tie_break_note"] is None


def test_exit_reason_weight_is_marked_and_counted():
    # Bij exit tilt de vertrekreden-weging leadership boven growth, terwijl de
    # zichtbare score van growth lager is. Dat moet gemarkeerd en geteld worden.
    avgs = {"growth": 4.5, "leadership": 4.9}
    reasons = {"leadership": 9, "growth": 4}
    labels = {"growth": "Groeiperspectief", "leadership": "Leiderschap en feedback"}
    rows = _rank(avgs, reasons=reasons, labels=labels, scan_type="exit")
    assert rows[0]["key"] == "leadership"
    assert rows[0]["exit_reason_n"] == 9
    assert rows[0]["tie_break_kind"] == "exit_reason"
    assert "vaker als vertrekreden" in rows[0]["tie_break_note"]
    assert "9 keer tegen 4" in rows[0]["tie_break_note"]


def test_retention_rows_carry_zero_exit_reason_count():
    rows = _rank({"growth": 6.0})
    assert rows[0]["exit_reason_n"] == 0


def test_every_row_has_the_new_fields():
    # Fail Loud: de renderlaag leest deze velden zonder .get()-fallback.
    rows = _rank({"growth": 6.0, "workload": 6.5})
    for r in rows:
        for field in ("direction_answered", "direction_change", "exit_reason_n",
                      "tie_break_kind", "tie_break_note"):
            assert field in r
        assert "_dir_winner" not in r


def test_notes_have_no_em_dashes():
    avgs = {"growth": 6.0, "workload": 6.1}
    direction = {"growth": _dir(11, 3),
                 "workload": _dir(11, 9, none_key="wl_none", change_key="wl_volume")}
    rows = _rank(avgs, direction=direction, labels={"growth": "Groeiperspectief"})
    for r in rows:
        assert "—" not in (r["tie_break_note"] or "")


def test_without_direction_agg_behaviour_is_unchanged():
    # Bestaande aanroepers die geen direction_agg meegeven blijven werken.
    rows = rank_factors("retention", {"growth": 5.2, "workload": 5.4}, {}, {})
    assert [r["key"] for r in rows] == ["growth", "workload"]
    assert rows[0]["direction_change"] is None


def test_direction_needs_a_margin_of_two():
    # "5 van de 11 tegen 4 van de 11" is ruis: de voorsprong haalt
    # DIRECTION_TIE_MIN_MARGIN niet, dus richting beslist niets en de groep valt
    # door naar base. Bij een voorsprong van precies 2 flipt het wel.
    assert DIRECTION_TIE_MIN_MARGIN == 2
    avgs = {"growth": 6.0, "workload": 6.1}
    krap = {"growth": _dir(11, 4),
            "workload": _dir(11, 5, none_key="wl_none", change_key="wl_volume")}
    rows = _rank(avgs, direction=krap)
    assert [r["key"] for r in rows] == ["growth", "workload"]
    assert rows[0]["tie_break_kind"] is None
    genoeg = {"growth": _dir(11, 4),
              "workload": _dir(11, 6, none_key="wl_none", change_key="wl_volume")}
    rows = _rank(avgs, direction=genoeg)
    assert [r["key"] for r in rows] == ["workload", "growth"]
    assert rows[0]["tie_break_kind"] == "direction"


def test_row_below_the_floor_does_not_disable_the_group():
    # Regressie: de eerste versie zette het richtingsignaal voor de HELE groep
    # uit zodra een rij te weinig beantwoorders had. Scenario 06 heeft precies
    # zo'n rij (workload, 2 beantwoorders), waardoor het signaal uitstond in het
    # scenario waarvoor het gebouwd is. Een rij onder de vloer telt nu als 0.
    avgs = {"growth": 6.0, "workload": 6.05, "culture": 6.1}
    direction = {"growth": _dir(11, 2),
                 "workload": _dir(2, 2, none_key="wl_none", change_key="wl_volume"),
                 "culture": _dir(11, 9, none_key="cu_none", change_key="cu_safety")}
    rows = _rank(avgs, direction=direction)
    assert rows[0]["key"] == "culture"
    assert rows[0]["tie_break_kind"] == "direction"
    assert rows[0]["direction_change"] == 9


def test_marking_at_exactly_equal_base():
    # Spec par. 1.3: "lagere of gelijke score". Bij een gelijke base toont de
    # scorekolom twee keer hetzelfde getal; zonder markering legt de pagina niet
    # uit waarom de ene rij boven de andere staat.
    avgs = {"culture": 6.2, "compensation": 6.2}
    direction = {"culture": _dir(11, 3, none_key="cu_none", change_key="cu_safety"),
                 "compensation": _dir(11, 8, none_key="cp_none", change_key="cp_insight")}
    labels = {"culture": "Cultuur en psychologische veiligheid",
              "compensation": "Beloning en voorwaarden"}
    rows = _rank(avgs, direction=direction, labels=labels)
    assert rows[0]["key"] == "compensation"
    assert rows[0]["tie_break_note"].startswith(
        "Staat hoger dan Cultuur en psychologische veiligheid omdat hier meer mensen")
    assert "8 van de 11 tegen 3 van de 11" in rows[0]["tie_break_note"]


def test_equal_counts_fall_through_to_the_next_signal():
    # Gelijke tellingen: richting beslist niets, de verdiepingsvlag wel, en de
    # markering noemt dan de verdieping (niet de richting).
    ok = {"triggered": 13, "offered": 13, "answered": 13, "skipped": 0,
          "primary_counts": {"cp_external": 9, "cp_internal": 1}, "secondary_counts": {}}
    avgs = {"culture": 6.2, "compensation": 6.2}
    direction = {"culture": _dir(11, 7, none_key="cu_none", change_key="cu_safety"),
                 "compensation": _dir(11, 7, none_key="cp_none", change_key="cp_insight")}
    labels = {"culture": "Cultuur", "compensation": "Beloning"}
    rows = _rank(avgs, direction=direction, labels=labels,
                 deep={"compensation": ok})
    assert rows[0]["key"] == "compensation"
    assert rows[0]["tie_break_kind"] == "deepening"
    assert "gedeelde toelichting" in rows[0]["tie_break_note"]


def test_direction_marking_is_honest_when_the_other_row_has_no_count():
    # De winnaar passeert alleen een rij onder de vloer: dan is er geen tweede
    # telling om tegen af te zetten. De regel zegt dat, in plaats van de flip
    # onverklaard te laten of een getal te suggereren dat er niet is.
    avgs = {"growth": 6.1, "workload": 6.0}
    direction = {"growth": _dir(11, 9),
                 "workload": _dir(2, 2, none_key="wl_none", change_key="wl_volume")}
    labels = {"growth": "Groeiperspectief", "workload": "Werkdruk en herstelruimte"}
    rows = _rank(avgs, direction=direction, labels=labels)
    assert rows[0]["key"] == "growth"
    note = rows[0]["tie_break_note"]
    assert "9 van de 11" in note
    assert "te weinig mensen antwoord om dat te vergelijken" in note
    assert "van de 2" not in note
    assert "—" not in note

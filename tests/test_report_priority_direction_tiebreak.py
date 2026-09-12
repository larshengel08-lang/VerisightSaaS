"""Tests voor de richting-tie-break en de markeringsregels (spec ronde 2 par. 1)."""
from backend.products.shared.deepening import DIRECTION_MIN_N, TOP_CHOICE_MIN_LEAD
from backend.report_html import _raster_attribution
from backend.report_priority import rank_factors


def _dir(answered, change, none_key="gr_none", change_key="gr_visibility"):
    """Richtingaggregaat: `change` mensen vroegen om verandering, de rest koos niets."""
    counts = {}
    if change:
        counts[change_key] = change
    if answered - change:
        counts[none_key] = answered - change
    return {"lowest_n": answered, "offered": answered, "answered": answered,
            "skipped": 0, "counts": counts}


def _kind(row):
    """Het signaal dat de sorteerder vastlegde, of None."""
    return row["decided_by"]["kind"] if row["decided_by"] else None


def _deep_agg(counts):
    return {"triggered": 13, "offered": 13, "answered": 13, "skipped": 0,
            "primary_counts": counts, "secondary_counts": {}}


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
    assert _kind(rows[0]) == "direction"


def test_row_below_the_floor_has_no_count_but_keeps_its_answered_total():
    # Onder DIRECTION_MIN_N beantwoorders is er geen bruikbaar aantal. De rij
    # houdt wel zijn beantwoorderstotaal, zodat de noemer-keten elders klopt.
    assert DIRECTION_MIN_N == 3
    rows = _rank({"workload": 6.0},
                 direction={"workload": _dir(2, 2, none_key="wl_none",
                                             change_key="wl_volume")})
    assert rows[0]["direction_answered"] == 2
    assert rows[0]["direction_change"] is None


def test_direction_needs_two_rows_with_a_valid_count():
    # Scenario 09 en 13: een factor met 3 van de 3 tegenover een rij die te
    # weinig antwoorden had. "Meer mensen" beweren en in dezelfde zin zeggen dat
    # vergelijken onmogelijk is, is ruis; richting beslist hier dus niet. De
    # spreidingsvlag van growth doet dat wel, en die regel klopt wel.
    avgs = {"growth": 6.1, "workload": 6.0}
    resp = {"growth": [4.0] * 5 + [7.0] * 7}          # 5 van 12 onder de 5 -> vlag
    direction = {"growth": _dir(11, 9),
                 "workload": _dir(2, 2, none_key="wl_none", change_key="wl_volume")}
    labels = {"growth": "Groeiperspectief", "workload": "Werkdruk en herstelruimte"}
    rows = _rank(avgs, direction=direction, resp=resp, labels=labels)
    assert rows[0]["key"] == "growth"
    assert _kind(rows[0]) == "spread"
    assert "verandering" not in rows[0]["tie_break_note"]
    assert "vergelijken" not in rows[0]["tie_break_note"]


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
    assert _kind(rows[0]) is None


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
    assert _kind(rows[0]) == "exit_reason"
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
                      "decided_by", "tie_break_note"):
            assert field in r
        # Tijdelijke sorteertoestand hoort nooit op een rij te blijven staan die
        # de renderlaag in handen krijgt.
        assert not [k for k in r if k.startswith("_")], sorted(r)


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
    # TOP_CHOICE_MIN_LEAD niet, dus richting beslist niets en de groep valt
    # door naar base. Bij een voorsprong van precies 2 flipt het wel.
    assert TOP_CHOICE_MIN_LEAD == 2
    avgs = {"growth": 6.0, "workload": 6.1}
    krap = {"growth": _dir(11, 4),
            "workload": _dir(11, 5, none_key="wl_none", change_key="wl_volume")}
    rows = _rank(avgs, direction=krap)
    assert [r["key"] for r in rows] == ["growth", "workload"]
    assert _kind(rows[0]) is None
    genoeg = {"growth": _dir(11, 4),
              "workload": _dir(11, 6, none_key="wl_none", change_key="wl_volume")}
    rows = _rank(avgs, direction=genoeg)
    assert [r["key"] for r in rows] == ["workload", "growth"]
    assert _kind(rows[0]) == "direction"


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
    assert _kind(rows[0]) == "direction"
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
    assert _kind(rows[0]) == "deepening"
    assert "gedeelde toelichting" in rows[0]["tie_break_note"]


def test_direction_needs_the_larger_share_too():
    # Scenario 10: 27 van de 35 tegen 17 van de 19. Het aantal is hoger, het
    # aandeel lager (77 tegen 89 procent). De markeringsregel zou zichzelf dan
    # tegenspreken, dus richting beslist niet en de base bepaalt de volgorde.
    avgs = {"growth": 6.0, "workload": 6.1}
    direction = {"growth": _dir(19, 17),
                 "workload": _dir(35, 27, none_key="wl_none", change_key="wl_volume")}
    rows = _rank(avgs, direction=direction)
    assert [r["key"] for r in rows] == ["growth", "workload"]
    assert _kind(rows[0]) is None
    assert rows[0]["tie_break_note"] is None


def test_direction_wins_when_count_and_share_are_both_higher():
    # Zelfde vorm als hierboven, maar nu is ook het aandeel hoger: 27 van de 35
    # (77 procent) tegen 5 van de 19 (26 procent).
    avgs = {"growth": 6.0, "workload": 6.1}
    direction = {"growth": _dir(19, 5),
                 "workload": _dir(35, 27, none_key="wl_none", change_key="wl_volume")}
    rows = _rank(avgs, direction=direction, labels={"growth": "Groeiperspectief"})
    assert rows[0]["key"] == "workload"
    assert _kind(rows[0]) == "direction"
    assert "27 van de 35 tegen 5 van de 19" in rows[0]["tie_break_note"]


def _flip_invariant(rows):
    """Elke rij die boven een lagere base staat moet een markeringsregel dragen."""
    for i, r in enumerate(rows):
        for later in rows[i + 1:]:
            if r["base"] > later["base"]:
                assert r["tie_break_note"], (
                    f"flip zonder markeringsregel: {r['key']} boven {later['key']}")


def test_k1_winner_passeert_geen_rij_die_hij_niet_kan_noemen():
    # De winnaar (growth, 9 van de 11) heeft zijn vergelijkingsrij (culture,
    # 2 van de 11) BOVEN zich in base; de enige rij die hij zou passeren is
    # workload, met een telling onder de vloer. Dan is er geen zin te schrijven
    # die klopt, dus mag de flip niet plaatsvinden.
    avgs = {"workload": 6.0, "growth": 6.2, "culture": 6.25}
    direction = {"growth": _dir(11, 9),
                 "culture": _dir(11, 2, none_key="cu_none", change_key="cu_safety"),
                 "workload": _dir(2, 2, none_key="wl_none", change_key="wl_volume")}
    labels = {"workload": "Werkdruk", "growth": "Groeiperspectief", "culture": "Cultuur"}
    rows = _rank(avgs, direction=direction, labels=labels)
    _flip_invariant(rows)
    # En p.02 verzint geen verdieping in een meting zonder verdiepingsdata.
    line = _raster_attribution(rows, "retention")
    assert "verdieping" not in line, line


def test_k2_vertrekredenregel_noemt_nooit_een_gelijk_aantal():
    # Zelfde vorm, nu bij Loep Vertrek: zonder gard viel de markering door naar
    # de vertrekreden-tak en schreef "(1 keer tegen 1)", met bovendien de
    # verkeerde oorzaak.
    avgs = {"workload": 5.2, "growth": 5.4, "culture": 5.45}
    reasons = {"workload": 2, "growth": 2, "culture": 2}
    direction = {"growth": _dir(11, 9),
                 "culture": _dir(11, 2, none_key="cu_none", change_key="cu_safety"),
                 "workload": _dir(2, 2, none_key="wl_none", change_key="wl_volume")}
    labels = {"workload": "Werkdruk", "growth": "Groeiperspectief", "culture": "Cultuur"}
    rows = _rank(avgs, direction=direction, reasons=reasons, labels=labels,
                 scan_type="exit")
    for r in rows:
        note = r["tie_break_note"] or ""
        assert "keer tegen 2" not in note, note
        assert "vertrekreden" not in note or r["exit_reason_n"] > 2, note
    _flip_invariant(rows)


def test_spread_marking_names_a_row_without_the_flag():
    # Guard: een gepasseerde rij die zelf de spreidingsvlag draagt mag nooit de
    # referentie zijn; de zin zou dan een verschil claimen dat er niet is.
    avgs = {"growth": 6.1, "workload": 6.0, "culture": 6.05}
    resp = {"growth": [4.0] * 5 + [7.0] * 7, "workload": [4.0] * 5 + [7.0] * 7}
    labels = {"growth": "Groeiperspectief", "workload": "Werkdruk",
              "culture": "Cultuur"}
    rows = _rank(avgs, resp=resp, labels=labels)
    top = next(r for r in rows if r["key"] == "growth")
    assert top["decided_by"] == {"kind": "spread", "other": "culture"}
    assert "Cultuur" in top["tie_break_note"]
    assert "Werkdruk" not in top["tie_break_note"]


def test_deepening_marking_names_a_row_without_the_toelichting():
    # Zelfde guard voor de verdiepingstak.
    avgs = {"growth": 6.1, "workload": 6.0, "culture": 6.05}
    deep = {"growth": _deep_agg({"gr_visibility": 9, "gr_conversation": 1}),
            "workload": _deep_agg({"wl_volume": 9, "wl_recovery": 1})}
    labels = {"growth": "Groeiperspectief", "workload": "Werkdruk",
              "culture": "Cultuur"}
    rows = _rank(avgs, deep=deep, labels=labels)
    top = next(r for r in rows if r["key"] == "growth")
    assert top["decided_by"] == {"kind": "deepening", "other": "culture"}
    assert "Cultuur" in top["tie_break_note"]
    assert "Werkdruk" not in top["tie_break_note"]


def test_reference_row_is_the_lowest_of_the_passed_rows():
    # Twee kandidaten die allebei het verschil tonen: de laagste base wordt
    # genoemd, niet de hoogste.
    avgs = {"growth": 6.1, "workload": 6.0, "culture": 6.05}
    resp = {"growth": [4.0] * 5 + [7.0] * 7}
    labels = {"growth": "Groeiperspectief", "workload": "Werkdruk",
              "culture": "Cultuur"}
    rows = _rank(avgs, resp=resp, labels=labels)
    assert rows[0]["key"] == "growth"
    assert rows[0]["decided_by"]["other"] == "workload"      # base 6.0, niet 6.05
    assert "Werkdruk" in rows[0]["tie_break_note"]


def test_decided_by_records_the_reference_row_for_direction():
    avgs = {"growth": 6.0, "workload": 6.1}
    direction = {"growth": _dir(11, 3),
                 "workload": _dir(11, 9, none_key="wl_none", change_key="wl_volume")}
    rows = _rank(avgs, direction=direction, labels={"growth": "Groeiperspectief"})
    assert rows[0]["decided_by"] == {"kind": "direction", "other": "growth"}
    assert rows[1]["decided_by"] is None


def test_direction_marking_skips_a_lower_row_without_a_count():
    # De rij met de laagste base heeft geen telling (workload komt niet voor in
    # direction_agg), de noembare rij ligt hoger. Voorwaarde 4 garandeert dat er
    # een noembare rij is, maar niet dat die als eerste uit de keuze komt: de
    # laagste base wint daar. Zonder de overslag in _decision zou de zin
    # "tegen None van de 0" in een klant-PDF belanden.
    avgs = {"workload": 6.0, "culture": 6.1, "growth": 6.2}
    direction = {"growth": _dir(16, 8),
                 "culture": _dir(11, 2, none_key="cu_none", change_key="cu_safety")}
    labels = {"workload": "Werkdruk", "culture": "Cultuur",
              "growth": "Groeiperspectief"}
    rows = _rank(avgs, direction=direction, labels=labels)
    assert rows[0]["key"] == "growth"
    assert rows[0]["direction_change"] == 8
    # De rij zonder telling (base 6.0) ligt lager dan de rij met telling (6.1)
    # en zou dus als eerste gekozen worden.
    assert rows[1]["key"] == "workload" and rows[1]["direction_change"] is None
    assert rows[0]["decided_by"] == {"kind": "direction", "other": "culture"}
    note = rows[0]["tie_break_note"]
    assert "8 van de 16 tegen 2 van de 11" in note
    assert "None" not in note and "van de 0" not in note

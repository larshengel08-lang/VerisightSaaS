"""Contract-tests voor _prioriteringsraster (spec par. 2, 6, 8)."""
import re

from backend.report_html import (
    RASTER_LEGENDA,
    _factor_color,
    _prioriteringsraster,
    raster_gate_note,
    raster_intro,
    raster_uitleg,
)
from backend.report_priority import (
    CELL_CAP_REACHED,
    CELL_NO_MAJORITY,
    CELL_NOT_TRIGGERED,
    CELL_TOO_FEW,
)


def _row(key, label, score, role=None, state=5, top=None, tie=None,
         spread_n=13, spread_below=2, spread_flag=False, exit_reason_n=0,
         direction_answered=0, direction_change=None,
         tie_kind=None, tie_note=None):
    return {"key": key, "label": label, "score": score, "base": score,
            "spread_n": spread_n, "spread_below": spread_below,
            "spread_flag": spread_flag, "deepening_state": state,
            "deepening_top": top, "flags": int(spread_flag) + int(state == 1),
            "agenda_role": role, "near_tie_with": tie,
            "exit_reason_n": exit_reason_n,
            "direction_answered": direction_answered,
            "direction_change": direction_change,
            "tie_break_kind": tie_kind, "tie_break_note": tie_note}


RANKED = [
    _row("growth", "Groeiperspectief", 5.1, role="startpunt", state=1,
         top=("growth_no_path", 7, 13)),
    _row("workload", "Werkdruk en herstelruimte", 5.4, role="tweede", state=2),
    _row("leadership", "Leiderschap", 5.6, state=3, tie="workload"),
    _row("role_clarity", "Rolhelderheid", 6.3, state=5),
    _row("culture", "Cultuur en psychologische veiligheid", 6.8, state=5),
    _row("compensation", "Beloning en voorwaarden", 7.1, state=4),
]

RESP = {r["key"]: [4.0] * r["spread_below"] + [7.0] * (r["spread_n"] - r["spread_below"])
        for r in RANKED}

# Richtingdata voor de twee agendarijen (startpunt growth, tweede workload);
# echte optiesleutels, want direction_state/direction_imperative slaan erop op.
DIRECTION = {
    "growth": {"lowest_n": 9, "offered": 9, "answered": 8, "skipped": 1,
               "counts": {"grd_visibility": 6, "grd_none": 1, "grd_time": 1}},
    "workload": {"lowest_n": 8, "offered": 8, "answered": 8, "skipped": 0,
                 "counts": {"wld_peaks": 3, "wld_scope": 3, "wld_none": 2}},
}


def _render(scan_type="retention", ranked=RANKED, resp=RESP, active=True,
            direction=None, **extra):
    return _prioriteringsraster(
        ranked=ranked, scan_type=scan_type, factor_resp_scores=resp,
        deepening_active=active, mgmt_q="Testvraag?",
        review_when="Plan binnen 45-90 dagen een vervolgmoment.",
        opener_html="<h2>Gespreksagenda</h2>",
        direction_agg=direction, n_total=13 if direction else 0, **extra)


def test_uitlegregel_letterlijk_gepind_in_alle_vier_de_combinaties():
    # Intro en uitlegregel worden samengesteld uit de signalen die deze meting
    # had; beide scan-types maal verdieping aan/uit maal richting aan/uit.
    for scan in ("retention", "exit"):
        for deep in (True, False):
            for direction in (DIRECTION, None):
                html = _render(scan, active=deep, direction=direction)
                assert raster_uitleg(scan, deep, bool(direction)) in html
                assert raster_intro(scan, deep, bool(direction)) in html
    # De exit-variant noemt het vertrekredengewicht, de retention-variant niet.
    assert "vertrekreden" in raster_uitleg("exit", True, True)
    assert "vertrekreden" not in raster_uitleg("retention", True, True)


def test_uitlegregel_noemt_alleen_de_drempels_die_meespeelden():
    zonder = raster_uitleg("retention", False, False)
    assert "verdieping" not in zonder
    assert "vraag om verandering" not in zonder
    assert "Spreiding tonen we vanaf 10 responses." in zonder
    alleen_richting = raster_uitleg("retention", False, True)
    assert "verdiepingsduiding" not in alleen_richting
    assert "vanaf 3 beantwoorders per factor" in alleen_richting
    alleen_verdieping = raster_uitleg("retention", True, False)
    assert "verdiepingsduiding vanaf 8 beantwoorders per factor" in alleen_verdieping
    assert "om verandering" not in alleen_verdieping


def test_richting_gate_volgt_de_pagina_niet_het_aggregaat():
    # Bug B3-patroon: is het richtingblok onderdrukt, dan mag de intro de vraag
    # om verandering niet noemen, ook al zit er wel een aggregaat in de data.
    html = _render(direction=DIRECTION, direction_block_html="")
    assert raster_intro("retention", True, False) in html
    assert "om verandering vragen" not in html


def test_intro_en_legenda_aanwezig():
    html = _render()
    assert raster_intro("retention", True, False) in html
    assert RASTER_LEGENDA in html


def test_celstaten_letterlijk():
    html = _render()
    assert CELL_NO_MAJORITY in html
    assert CELL_TOO_FEW in html
    assert CELL_CAP_REACHED in html
    assert CELL_NOT_TRIGGERED in html
    # Staat 1: telling + optietekst-quote.
    assert "7 van 13 kozen:" in html


def test_agenda_kolom_en_gelijkspel():
    html = _render()
    assert "Startpunt" in html
    assert "Tweede punt" in html
    assert "vrijwel gelijk aan Werkdruk en herstelruimte" in html
    # Geen rangnummer-verwijzingen (spec par. 8).
    assert "nr." not in html


def test_canonieke_labels_geen_verkorte_set():
    html = _render()
    assert "Beloning en voorwaarden" in html
    assert "Compensatie" not in html
    assert "Rolhelderheid" in html


def test_geen_em_dashes_in_nieuwe_copy():
    assert "—" not in _render()
    assert "—" not in _render(active=False)


def test_scores_via_score_str():
    # Punt als decimaalteken, /10-formaat zoals de rest van het rapport.
    assert "5.1/10" in _render()


def test_score_kleur_via_bestaande_bandkleuren():
    # Code-review Taak 5: de scorekolom moet dezelfde gedempte RAG-bandkleur
    # dragen als overal elders in het rapport (_factor_color), niet ongekleurd.
    html = _render()
    assert f'color:{_factor_color(5.1)};' in html  # growth, 5.1 -> RAG_HIGH


def test_spreiding_degraded_onder_n10():
    kleine = [dict(r, spread_n=7, spread_below=2) for r in RANKED]
    resp7 = {r["key"]: [4.0, 4.0, 7.0, 7.0, 7.0, 7.0, 7.0] for r in kleine}
    html = _render(ranked=kleine, resp=resp7)
    assert "spreiding vanaf 10 responses" in html
    assert "onder de 5" not in html  # geen telregel onder de staffel


def test_campagne_gate_kolom_weg_plus_disclosure():
    html = _render(active=False)
    assert raster_gate_note(False) in html
    assert raster_intro("retention", False, False) in html
    assert "Verdieping" not in html  # kolomkop weg
    assert CELL_NOT_TRIGGERED not in html


def test_navy_slotblok_met_opener_en_invulregels():
    html = _render()
    assert "Gespreksopener" in html
    assert "Testvraag?" in html
    assert "Prioriteit" in html and "Eigenaar" in html and "Vervolgmoment" in html
    assert "In te vullen tijdens de bespreking" in html


def test_zichtbaar_signaal_bij_vlag_in_html():
    # Render-kant van de navolgbaarheids-invariant: een rij met spread_flag
    # toont de telregel; een rij met staat 1 toont de telling.
    flagged = [
        _row("growth", "Groeiperspectief", 5.4, role="startpunt", state=1,
             top=("growth_no_path", 7, 13), spread_flag=True, spread_below=5),
        _row("workload", "Werkdruk en herstelruimte", 5.2, role="tweede", state=5),
    ]
    html = _render(ranked=flagged)
    assert "5 van 13 onder de 5" in html
    assert "7 van 13 kozen:" in html


def test_markeringsregel_staat_onder_de_rij():
    ranked = [
        _row("workload", "Werkdruk en herstelruimte", 6.1, role="startpunt",
             tie_note="Staat hoger dan Groeiperspectief omdat hier meer mensen om "
                      "verandering vragen (9 van de 11 tegen 3 van de 11).",
             tie_kind="direction"),
        _row("growth", "Groeiperspectief", 6.0, role="tweede"),
    ]
    html = _render(ranked=ranked, resp={r["key"]: [6.0] * 13 for r in ranked})
    # De markering hoort bij de rij erboven, dus in een eigen rij die de volle
    # tabelbreedte overspant (hier 5 kolommen: retention met verdiepingskolom).
    assert ('<tr class="r-note"><td colspan="5">Staat hoger dan Groeiperspectief '
            "omdat hier meer mensen om verandering vragen "
            "(9 van de 11 tegen 3 van de 11).</td></tr>") in html


def test_geen_markeringsregel_zonder_flip():
    html = _render()
    assert "r-note" not in html


def test_exit_krijgt_een_vertrekredenkolom():
    ranked = [_row("leadership", "Leiderschap en feedback", 4.9, role="startpunt",
                   exit_reason_n=9),
              _row("growth", "Groeiperspectief", 4.5, role="tweede", exit_reason_n=4)]
    resp = {r["key"]: [4.0] * 13 for r in ranked}
    html_exit = _render(scan_type="exit", ranked=ranked, resp=resp)
    assert '<th style="width:13%">Als vertrekreden genoemd</th>' in html_exit
    # De telling staat in de vertrekredencel zelf, niet ergens anders op de pagina.
    assert '<td class="r-mono">9</td>' in html_exit
    assert '<td class="r-mono">4</td>' in html_exit
    # Loep Behoud kent geen vertrekredenen en krijgt de kolom dus niet.
    html_ret = _render(scan_type="retention", ranked=ranked, resp=resp)
    assert "Als vertrekreden genoemd" not in html_ret


def test_uitlegregel_noemt_de_richtingvraag_als_eerste_tiebreak():
    for scan in ("retention", "exit"):
        uitleg = raster_uitleg(scan, True, True)
        assert "om verandering vragen" in uitleg
        assert "—" not in uitleg


def test_intro_en_gatecopy_zijn_eerlijk_over_de_vraag_om_verandering():
    # De vraag om verandering staat los van de verdiepings-gate: elke respondent
    # beantwoordt hem. De intro mag hem dus niet verzwijgen, en mag ook niet
    # beloven dat hij per factor in een kolom staat (die is er bewust niet).
    assert "vier signalen" in raster_intro("retention", True, True)
    assert "drie signalen" in raster_intro("retention", False, True)
    assert "drie signalen" in raster_intro("retention", True, False)
    assert "twee signalen" in raster_intro("retention", False, False)
    for copy in (raster_intro("retention", True, True), raster_intro("retention", False, True)):
        assert "om verandering vragen" in copy
        assert "onder de rij" in copy
        assert "—" not in copy
    # Zonder richtingdata noemt de intro het signaal niet, en belooft de
    # gate-notitie het ook niet.
    for copy in (raster_intro("retention", True, False), raster_intro("retention", False, False)):
        assert "om verandering" not in copy
        assert "onder de rij" not in copy
    assert "vraag om verandering" in raster_gate_note(True)
    assert raster_gate_note(False).endswith("volgorde volgt score en spreiding.")
    assert "—" not in raster_gate_note(True) and "—" not in raster_gate_note(False)


def test_uitlegregel_noemt_de_marge_van_twee():
    for scan in ("retention", "exit"):
        assert "minstens 2 mensen" in raster_uitleg(scan, True, True)
        # Zonder richtingdata speelt de marge niet en wordt hij niet genoemd.
        assert "minstens 2 mensen" not in raster_uitleg(scan, True, False)


def test_exit_intro_noemt_de_vertrekredenkolom():
    # De exit-tabel heeft een kolom extra; de opsomming moet die noemen, anders
    # belooft de intro minder dan de pagina toont.
    intro = raster_intro("exit", True, True)
    assert "vijf signalen" in intro
    assert "hoe vaak een factor als vertrekreden is genoemd" in intro
    assert "De eerste vier staan in de tabel." in intro
    assert intro in _render("exit", direction=DIRECTION)
    # Loep Behoud kent geen vertrekredenen en noemt ze dus ook niet.
    assert "vertrekreden" not in raster_intro("retention", True, True)

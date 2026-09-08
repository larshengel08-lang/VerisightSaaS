"""Rapportblok 'Wat er moet gebeuren' + p.02-regel (spec 2026-09-07 par. 6)."""
from backend.report_html import (
    DIRECTION_BLOCK_EYEBROW,
    _bestuurlijke_read,
    _direction_card,
    _direction_chain,
    _direction_p02_line,
    _prioriteringsraster,
    _wat_moet_gebeuren_block,
)
from tests.test_report_priority_render import RANKED, RESP

FORBIDDEN = ["risico", "interventie", "actieplan", "loep adviseert", "aanbeveling"]


def _agg(answered, counts, lowest=None, skipped=1, offered=None):
    lowest = lowest if lowest is not None else answered + skipped
    offered = offered if offered is not None else answered + skipped
    return {"lowest_n": lowest, "offered": offered, "answered": answered,
            "skipped": skipped, "counts": counts}


CLEAR = _agg(8, {"grd_visibility": 6, "grd_none": 1, "grd_time": 1})
DIVIDED = _agg(8, {"wld_peaks": 3, "wld_scope": 3, "wld_none": 2}, skipped=0)
NONE = _agg(8, {"wld_none": 5, "wld_peaks": 2, "wld_scope": 1}, skipped=0)
FEW = _agg(2, {"wld_peaks": 2}, skipped=0)


def test_clear_card_shows_imperative_source_and_chain():
    html = _direction_card("startpunt", "Groeiperspectief", CLEAR, "retention", "growth", 13)
    assert "Startpunt: Groeiperspectief" in html
    assert "Maak zichtbaar welke mogelijkheden er voor medewerkers zijn." in html
    assert "Volgens 6 van de 8 bij wie groeiperspectief het laagst scoorde." in html
    assert "Van de 13 respondenten hadden 9 dit als laagste; 8 beantwoordden de vraag, 1 sloeg over." in html
    assert "Niets, dit zit hier goed" in html
    assert "%" not in html
    assert "Beperkte basis" not in html


def test_divided_card():
    html = _direction_card("tweede", "Werkdruk en herstelruimte", DIVIDED, "retention", "workload", 13)
    assert "Tweede punt: Werkdruk en herstelruimte" in html
    assert "Geen eenduidige richting." in html
    assert "De 8 bij wie dit het laagst scoorde kozen verschillend." in html
    assert "Plan piekmomenten" not in html


def test_none_needed_card_questions_the_role():
    start = _direction_card("startpunt", "Werkdruk en herstelruimte", NONE, "retention", "workload", 13)
    assert "Hier hoeft volgens de meeste betrokkenen niets." in start
    assert "5 van de 8 bij wie dit het laagst scoorde kozen 'Niets, dit zit hier goed'. Bespreek of dit dan het startpunt moet zijn." in start
    second = _direction_card("tweede", "Werkdruk en herstelruimte", NONE, "retention", "workload", 13)
    assert "het tweede punt moet zijn." in second


def test_too_few_card_only_chain():
    html = _direction_card("tweede", "Werkdruk en herstelruimte", FEW, "retention", "workload", 13)
    assert "Te weinig antwoorden voor een richting." in html
    assert "item-tbl" not in html
    assert "Van de 13 respondenten hadden 2 dit als laagste; 2 beantwoordden de vraag." in html


def test_percentages_from_10_and_caveat_at_3_4():
    big = _direction_card("startpunt", "Groeiperspectief",
                          _agg(10, {"grd_visibility": 7, "grd_none": 3}), "retention", "growth", 20)
    assert "70% (7)" in big and "30% (3)" in big
    small = _direction_card("startpunt", "Groeiperspectief",
                            _agg(3, {"grd_visibility": 3}, skipped=0), "retention", "growth", 13)
    assert "Beperkte basis: gebruik dit als gesprekshaakje, niet als conclusie." in small
    assert "Volgens 3 van de 3" in small


def test_exit_tense_in_none_option_text():
    html = _direction_card("startpunt", "Werkdruk en balans",
                           _agg(8, {"wld_none": 5, "wld_peaks": 3}, skipped=0), "exit", "workload", 13)
    assert "Niets, dit zat hier goed" in html


def test_chain_with_old_client_gap():
    agg = _agg(6, {"wld_peaks": 6}, lowest=9, offered=7, skipped=1)
    assert _direction_chain(agg, 13) == (
        "Van de 13 respondenten hadden 9 dit als laagste; 7 kregen de vraag, "
        "6 beantwoordden die, 1 sloeg over.")
    assert _direction_chain(_agg(1, {"wld_peaks": 1}, skipped=2), 13) == (
        "Van de 13 respondenten hadden 3 dit als laagste; 1 beantwoordde de vraag, 2 sloegen over.")


def test_block_two_cards_for_startpunt_and_tweede_only():
    agg = {"growth": CLEAR, "workload": DIVIDED, "leadership": CLEAR}
    html = _wat_moet_gebeuren_block(RANKED, agg, "retention", 13)
    assert DIRECTION_BLOCK_EYEBROW in html
    assert html.count('class="dir-card') == 2
    assert "Startpunt: Groeiperspectief" in html and "Tweede punt: Werkdruk en herstelruimte" in html
    assert "geen advies van Loep" in html


def test_block_empty_without_data_and_missing_factor_is_too_few():
    assert _wat_moet_gebeuren_block(RANKED, {}, "retention", 13) == ""
    html = _wat_moet_gebeuren_block(RANKED, {"growth": CLEAR}, "retention", 13)
    assert "Te weinig antwoorden voor een richting." in html


def test_raster_integration_gate():
    kwargs = dict(ranked=RANKED, scan_type="retention", factor_resp_scores=RESP,
                  deepening_active=True, mgmt_q="Testvraag?",
                  review_when="Plan binnen 45-90 dagen een vervolgmoment.",
                  opener_html="<h2>Gespreksagenda</h2>")
    without = _prioriteringsraster(**kwargs)
    with_dir = _prioriteringsraster(**kwargs, direction_agg={"growth": CLEAR, "workload": DIVIDED}, n_total=13)
    assert DIRECTION_BLOCK_EYEBROW not in without
    assert DIRECTION_BLOCK_EYEBROW in with_dir
    assert with_dir.index(DIRECTION_BLOCK_EYEBROW) < with_dir.index('class="agenda-dark"')


def test_p02_line_per_state():
    assert _direction_p02_line({"growth": CLEAR}, "growth", "retention") == (
        "Wat er volgens 6 van de 8 moet gebeuren: Maak zichtbaar welke mogelijkheden er voor medewerkers zijn.")
    assert _direction_p02_line({"workload": DIVIDED}, "workload", "retention") == (
        "Over wat hier moet gebeuren zijn de 8 die dit het laagst scoorden verdeeld. Zie de gespreksagenda.")
    assert _direction_p02_line({"workload": NONE}, "workload", "retention") == (
        "5 van de 8 die dit het laagst scoorden zeggen: hier hoeft niets.")
    assert _direction_p02_line({"workload": FEW}, "workload", "retention") == ""
    assert _direction_p02_line({}, "workload", "retention") == ""
    assert _direction_p02_line({"workload": CLEAR}, None, "retention") == ""


def test_bestuurlijke_read_renders_direction_line_only_when_given():
    kwargs = dict(kernzin="k", totaalbeeld="t", primary_label="Groeiperspectief",
                  why_cells_html="", strong_label="", strong_score=None, mgmt_q="Vraag?")
    assert "mq-direction" not in _bestuurlijke_read(**kwargs)
    html = _bestuurlijke_read(**kwargs, direction_line="Wat er volgens 6 van de 8 moet gebeuren: X.")
    assert 'class="mq-direction"' in html and "6 van de 8" in html


def test_no_em_dashes_or_forbidden_words():
    blobs = [
        _direction_card("startpunt", "Groeiperspectief", CLEAR, "retention", "growth", 13),
        _direction_card("tweede", "Werkdruk en herstelruimte", DIVIDED, "retention", "workload", 13),
        _direction_card("startpunt", "Werkdruk en herstelruimte", NONE, "retention", "workload", 13),
        _direction_card("tweede", "Werkdruk en herstelruimte", FEW, "retention", "workload", 13),
        _wat_moet_gebeuren_block(RANKED, {"growth": CLEAR, "workload": DIVIDED}, "exit", 13),
    ]
    for b in blobs:
        assert "—" not in b and "&#x2014;" not in b
        low = b.lower()
        for w in FORBIDDEN:
            assert w not in low, w

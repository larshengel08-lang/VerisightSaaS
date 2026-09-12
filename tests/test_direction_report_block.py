"""Rapportblok 'Wat er moet gebeuren' + p.02-regel (spec 2026-09-07 par. 6)."""
import pytest

from backend.report_html import (
    DIRECTION_BLOCK_EYEBROW,
    _bestuurlijke_read,
    _direction_card_cell,
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
    html = _direction_card_cell("startpunt", label="Groeiperspectief", agg=CLEAR,
                                scan_type="retention", factor_key="growth", n_total=13)
    assert "Startpunt: Groeiperspectief" in html
    assert "Maak zichtbaar welke mogelijkheden er voor medewerkers zijn." in html
    assert "Volgens 6 van de 8 bij wie groeiperspectief het laagst scoorde." in html
    assert "Van de 13 respondenten hadden 9 dit als laagste; 8 beantwoordden de vraag, 1 sloeg over." in html
    assert "Niets, dit zit hier goed" in html
    assert "%" not in html
    assert "Beperkte basis" not in html
    assert 'class="dir-card dir-clear"' in html


def test_divided_card():
    html = _direction_card_cell("tweede", label="Werkdruk en herstelruimte", agg=DIVIDED,
                                scan_type="retention", factor_key="workload", n_total=13)
    assert "Tweede punt: Werkdruk en herstelruimte" in html
    assert "Geen eenduidige richting." in html
    assert "De 8 bij wie dit het laagst scoorde kozen verschillend." in html
    assert "Plan piekmomenten" not in html


def test_none_needed_card_questions_the_role():
    start = _direction_card_cell("startpunt", label="Werkdruk en herstelruimte", agg=NONE,
                                 scan_type="retention", factor_key="workload", n_total=13)
    assert "Hier hoeft volgens de meeste betrokkenen niets." in start
    assert "5 van de 8 bij wie dit het laagst scoorde kozen ‘Niets, dit zit hier goed’. Bespreek of dit dan het startpunt moet zijn." in start
    second = _direction_card_cell("tweede", label="Werkdruk en herstelruimte", agg=NONE,
                                  scan_type="retention", factor_key="workload", n_total=13)
    assert "het tweede punt moet zijn." in second


def test_half_none_card_prints_no_do_nothing_imperative():
    """B11: bij precies de helft 'Niets, dit zit hier goed' is 'volgens de meeste
    betrokkenen' onwaar. De kaart valt terug op divided en mag geen opdrachtvorm
    tonen - ook niet een die zegt dat er niets hoeft."""
    half = _agg(4, {"wld_none": 2, "wld_peaks": 2}, skipped=0)
    html = _direction_card_cell("startpunt", label="Werkdruk en herstelruimte", agg=half,
                                scan_type="retention", factor_key="workload", n_total=13)
    assert 'class="dir-card dir-divided"' in html
    assert "Geen eenduidige richting." in html
    assert "Hier hoeft volgens de meeste betrokkenen niets." not in html
    assert "Bespreek of dit dan het startpunt moet zijn." not in html
    assert "De 4 bij wie dit het laagst scoorde kozen verschillend." in html
    # De verdeling blijft zichtbaar, inclusief de niets-optie.
    assert "Niets, dit zit hier goed" in html
    assert "Beperkte basis" in html


def test_half_none_p02_line_makes_no_majority_claim():
    half = _agg(4, {"wld_none": 2, "wld_peaks": 2}, skipped=0)
    line = _direction_p02_line({"workload": half}, "workload", "retention")
    assert line == ("Over wat hier moet gebeuren zijn de 4 die dit het laagst "
                    "scoorden verdeeld. Zie de gespreksagenda.")
    assert "hier hoeft niets" not in line


def test_too_few_card_only_chain():
    html = _direction_card_cell("tweede", label="Werkdruk en herstelruimte", agg=FEW,
                                scan_type="retention", factor_key="workload", n_total=13)
    assert "Te weinig antwoorden voor een richting." in html
    assert "item-tbl" not in html
    assert "Van de 13 respondenten hadden 2 dit als laagste; 2 beantwoordden de vraag." in html


def test_unknown_role_raises():
    with pytest.raises(ValueError):
        _direction_card_cell("derde", label="Groeiperspectief", agg=CLEAR,
                             scan_type="retention", factor_key="growth", n_total=13)


def test_unknown_option_key_raises_instead_of_printing_raw_key():
    """Code-review (na Task 10): een onbekende optiesleutel mag nooit als
    rauwe key in een klantzichtbare PDF verschijnen (Fail-Loud-principe)."""
    agg = _agg(8, {"grd_visibility": 5, "grd_bogus_key": 3}, skipped=0)
    with pytest.raises(KeyError, match="grd_bogus_key"):
        _direction_card_cell("tweede", label="Groeiperspectief", agg=agg,
                             scan_type="retention", factor_key="growth", n_total=13)


def test_percentages_from_10_and_caveat_at_3_4():
    big = _direction_card_cell("startpunt", label="Groeiperspectief",
                               agg=_agg(10, {"grd_visibility": 7, "grd_none": 3}),
                               scan_type="retention", factor_key="growth", n_total=20)
    assert "70% (7)" in big and "30% (3)" in big
    small = _direction_card_cell("startpunt", label="Groeiperspectief",
                                 agg=_agg(3, {"grd_visibility": 3}, skipped=0),
                                 scan_type="retention", factor_key="growth", n_total=13)
    assert "Beperkte basis: gebruik dit als gesprekshaakje, niet als conclusie." in small
    assert "Volgens 3 van de 3" in small


def test_percentage_denominator_is_answered_not_sum_of_counts():
    # answered=10 maar de counts tellen op tot 8 (een answered-rij zonder
    # choice telt wel mee in answered, niet in counts, spec 6.1). De
    # verdelingstabel moet delen door answered (10), niet door sum(counts)
    # (8) -- anders klopt de weergegeven verhouding niet met de noemer-zin.
    agg = _agg(10, {"grd_visibility": 5, "grd_time": 3}, skipped=0)
    html = _direction_card_cell("startpunt", label="Groeiperspectief", agg=agg,
                                scan_type="retention", factor_key="growth", n_total=13)
    assert "50% (5)" in html
    assert "30% (3)" in html


def test_exit_tense_in_none_option_text():
    html = _direction_card_cell(
        "startpunt", label="Werkdruk en balans",
        agg=_agg(8, {"wld_none": 5, "wld_peaks": 3}, skipped=0),
        scan_type="exit", factor_key="workload", n_total=13)
    assert "Niets, dit zat hier goed" in html


def test_chain_with_old_client_gap():
    agg = _agg(6, {"wld_peaks": 6}, lowest=9, offered=7, skipped=1)
    assert _direction_chain(agg, 13) == (
        "Van de 13 respondenten hadden 9 dit als laagste; 7 kregen de vraag, "
        "6 beantwoordden die, 1 sloeg over.")
    assert _direction_chain(_agg(1, {"wld_peaks": 1}, skipped=2), 13) == (
        "Van de 13 respondenten hadden 3 dit als laagste; 1 beantwoordde de vraag, 2 sloegen over.")


def test_chain_lowest_zero():
    agg = {"lowest_n": 0, "offered": 0, "answered": 0, "skipped": 0, "counts": {}}
    assert _direction_chain(agg, 13) == "Niemand had dit als laagste onderwerp."


def test_chain_zero_answered_nonzero_skipped():
    agg = {"lowest_n": 5, "offered": 5, "answered": 0, "skipped": 5, "counts": {}}
    assert _direction_chain(agg, 13) == (
        "Van de 13 respondenten hadden 5 dit als laagste; 5 sloegen over.")


def test_chain_offered_zero_ends_at_opener():
    agg = {"lowest_n": 4, "offered": 0, "answered": 0, "skipped": 0, "counts": {}}
    assert _direction_chain(agg, 13) == "Van de 13 respondenten hadden 4 dit als laagste."


def test_chain_singular_lowest():
    agg = {"lowest_n": 1, "offered": 1, "answered": 1, "skipped": 0, "counts": {}}
    assert _direction_chain(agg, 13) == (
        "Van de 13 respondenten had 1 dit als laagste; 1 beantwoordde de vraag.")


def test_chain_singular_gap_offered_and_answered():
    agg = {"lowest_n": 2, "offered": 1, "answered": 1, "skipped": 0, "counts": {}}
    assert _direction_chain(agg, 13) == (
        "Van de 13 respondenten hadden 2 dit als laagste; 1 kreeg de vraag, 1 beantwoordde die.")


def test_chain_singular_skipped():
    agg = {"lowest_n": 3, "offered": 3, "answered": 2, "skipped": 1, "counts": {}}
    assert _direction_chain(agg, 13) == (
        "Van de 13 respondenten hadden 3 dit als laagste; 2 beantwoordden de vraag, 1 sloeg over.")


def test_block_two_cards_for_startpunt_and_tweede_only():
    agg = {"growth": CLEAR, "workload": DIVIDED, "leadership": CLEAR}
    html = _wat_moet_gebeuren_block(RANKED, agg, "retention", 13)
    assert DIRECTION_BLOCK_EYEBROW in html
    assert "Wat er moet gebeuren" in html
    assert html.count('class="dir-card') == 2
    assert "Startpunt: Groeiperspectief" in html and "Tweede punt: Werkdruk en herstelruimte" in html
    assert "geen advies van Loep" in html


def test_block_empty_without_data_and_missing_factor_raises_keyerror():
    assert _wat_moet_gebeuren_block(RANKED, {}, "retention", 13) == ""
    with pytest.raises(KeyError):
        _wat_moet_gebeuren_block(RANKED, {"growth": CLEAR}, "retention", 13)


def test_raster_integration_gate():
    kwargs = dict(ranked=RANKED, scan_type="retention", factor_resp_scores=RESP,
                  deepening_active=True, mgmt_q="Testvraag?",
                  review_when="Plan binnen 45-90 dagen een vervolgmoment.",
                  opener_html="<h2>Gespreksagenda</h2>")
    without = _prioriteringsraster(**kwargs)
    with_dir = _prioriteringsraster(**kwargs, direction_agg={"growth": CLEAR, "workload": DIVIDED}, n_total=13)
    assert DIRECTION_BLOCK_EYEBROW not in without
    assert DIRECTION_BLOCK_EYEBROW in with_dir
    assert "Wat er moet gebeuren" in with_dir
    assert with_dir.index(DIRECTION_BLOCK_EYEBROW) < with_dir.index('class="agenda-dark"')


def test_prioriteringsraster_raises_without_n_total():
    kwargs = dict(ranked=RANKED, scan_type="retention", factor_resp_scores=RESP,
                  deepening_active=True, mgmt_q="Testvraag?",
                  review_when="Plan binnen 45-90 dagen een vervolgmoment.",
                  opener_html="<h2>Gespreksagenda</h2>")
    with pytest.raises(ValueError):
        _prioriteringsraster(**kwargs, direction_agg={"growth": CLEAR})


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


# ── Ronde 2 par. 4: plurality en split_none ──────────────────────────

# Scenario 11: 27 van de 62 (44%), voorsprong 12 op de niets-groep.
PLURALITY = _agg(62, {"grd_visibility": 27, "grd_none": 15, "grd_conversation": 10,
                      "grd_criteria": 6, "grd_time": 4}, skipped=0)
# Scenario 13: 14 tegenover 14 op een factor die 4,5 scoort.
SPLIT_NONE = _agg(31, {"grd_none": 14, "grd_visibility": 14, "grd_conversation": 3},
                  skipped=0)


def _plurality_card():
    return _direction_card_cell("startpunt", label="Groeiperspectief", agg=PLURALITY,
                                scan_type="retention", factor_key="growth",
                                n_total=180, factor_score=5.2)


def _split_none_card():
    return _direction_card_cell("startpunt", label="Groeiperspectief", agg=SPLIT_NONE,
                                scan_type="retention", factor_key="growth",
                                n_total=45, factor_score=4.5)


def test_plurality_card_names_the_largest_group_without_claiming_a_majority():
    html = _plurality_card()
    assert 'class="dir-card dir-plurality"' in html
    assert ("De grootste groep kiest ‘Beter zicht op welke mogelijkheden er voor "
            "mij zijn’, zonder meerderheid.") in html
    assert ("27 van de 62 bij wie groeiperspectief het laagst scoorde kozen die "
            "richting; 15 kozen ‘Niets, dit zit hier goed’. Wat er volgens de "
            "grootste groep moet gebeuren: Maak zichtbaar welke mogelijkheden er "
            "voor medewerkers zijn.") in html
    # Nooit een meerderheidsclaim, en de percentages blijven binnen de staffel.
    assert "volgens de meeste" not in html
    assert "44% (27)" in html
    assert "Van de 180 respondenten hadden 62 dit als laagste; 62 beantwoordden de vraag." in html


def test_plurality_card_without_a_runner_up_makes_no_second_claim():
    """answered telt hoger dan de som van de counts (een beantwoorde rij zonder
    keuze): dan is er maar een optie om te noemen en mag de zin er geen tweede
    verzinnen."""
    agg = _agg(8, {"grd_visibility": 3}, skipped=0)
    html = _direction_card_cell("tweede", label="Groeiperspectief", agg=agg,
                                scan_type="retention", factor_key="growth",
                                n_total=20, factor_score=5.2)
    assert 'class="dir-card dir-plurality"' in html
    assert ("3 van de 8 bij wie groeiperspectief het laagst scoorde kozen die richting. "
            "Wat er volgens de grootste groep moet gebeuren: Maak zichtbaar welke "
            "mogelijkheden er voor medewerkers zijn.") in html
    assert ";" not in html.split('class="dir-src"')[1].split("</div>")[0]


def test_split_none_card_makes_the_split_the_subject():
    html = _split_none_card()
    assert 'class="dir-card dir-split_none"' in html
    assert ("Verdeeld: een deel zegt dat hier niets hoeft, een even groot deel vraagt "
            "om ‘Beter zicht op welke mogelijkheden er voor mij zijn’.") in html
    assert ("14 kozen ‘Niets, dit zit hier goed’; 14 kozen ‘Beter zicht op welke "
            "mogelijkheden er voor mij zijn’. Op een onderwerp dat laag scoort "
            "(4.5/10) is dat verschil van inzicht zelf het gesprek. Wat die andere "
            "groep vraagt: Maak zichtbaar welke mogelijkheden er voor medewerkers "
            "zijn.") in html


def test_split_none_head_never_claims_groups_the_numbers_contradict():
    """De kop mag niet "even groot" zeggen als de tellingen eronder verschillen."""
    een_achter = _direction_card_cell(
        "startpunt", label="Groeiperspectief",
        agg=_agg(30, {"grd_none": 13, "grd_visibility": 14, "grd_conversation": 3}, skipped=0),
        scan_type="retention", factor_key="growth", n_total=45, factor_score=4.5)
    assert 'class="dir-card dir-split_none"' in een_achter
    assert ("Verdeeld: een deel zegt dat hier niets hoeft, een ander deel vraagt om "
            "‘Beter zicht op welke mogelijkheden er voor mij zijn’.") in een_achter
    assert "even groot" not in een_achter
    niets_groter = _direction_card_cell(
        "startpunt", label="Groeiperspectief",
        agg=_agg(25, {"grd_none": 10, "grd_visibility": 4, "grd_conversation": 3}, skipped=0),
        scan_type="retention", factor_key="growth", n_total=45, factor_score=4.5)
    assert "een ander deel vraagt om" in niets_groter
    assert "even groot" not in niets_groter


def test_split_none_quotes_the_scan_specific_none_text():
    """Loep Vertrek stelt de vraag in de verleden tijd; de niets-optie mag niet
    hardgecodeerd in de tegenwoordige tijd staan."""
    html = _direction_card_cell("startpunt", label="Werkdruk en balans",
                                agg=_agg(20, {"wld_none": 9, "wld_peaks": 9,
                                              "wld_scope": 2}, skipped=0),
                                scan_type="exit", factor_key="workload",
                                n_total=30, factor_score=4.2)
    assert "9 kozen ‘Niets, dit zat hier goed’;" in html
    assert "dit zit hier goed" not in html


def test_new_states_stay_out_without_a_factor_score():
    """Bestaande aanroepers geven geen score mee; dan blijft het gedrag van voor
    ronde 2 staan en verschijnt er geen split_none-kop."""
    html = _direction_card_cell("startpunt", label="Groeiperspectief", agg=SPLIT_NONE,
                                scan_type="retention", factor_key="growth", n_total=45)
    assert 'class="dir-card dir-divided"' in html
    assert "een deel zegt dat hier niets hoeft" not in html


def test_p02_line_for_the_new_states():
    assert _direction_p02_line({"growth": PLURALITY}, "growth", "retention",
                               factor_score=5.2) == (
        "Wat er volgens de grootste groep moet gebeuren (27 van de 62, zonder "
        "meerderheid): Maak zichtbaar welke mogelijkheden er voor medewerkers zijn.")
    assert _direction_p02_line({"growth": SPLIT_NONE}, "growth", "retention",
                               factor_score=4.5) == (
        "Wat er moet gebeuren: je mensen zijn hierover verdeeld. 14 zeggen dat hier "
        "niets hoeft, 14 vragen om ‘Beter zicht op welke mogelijkheden er voor mij "
        "zijn’.")
    # Zonder score blijft de oude regel staan (geen stille gedragswijziging).
    assert _direction_p02_line({"growth": SPLIT_NONE}, "growth", "retention") == (
        "Over wat hier moet gebeuren zijn de 31 die dit het laagst scoorden verdeeld. "
        "Zie de gespreksagenda.")


def test_p02_split_none_line_is_singular_correct():
    agg = _agg(4, {"grd_none": 1, "grd_visibility": 2, "grd_time": 1}, skipped=0)
    assert _direction_p02_line({"growth": agg}, "growth", "retention",
                               factor_score=4.5) == (
        "Wat er moet gebeuren: je mensen zijn hierover verdeeld. 1 zegt dat hier "
        "niets hoeft, 2 vragen om ‘Beter zicht op welke mogelijkheden er voor mij "
        "zijn’.")


def test_block_passes_the_factor_score_from_the_raster_row():
    """De kaarten krijgen de score uit de rasterrij; zonder die koppeling kan
    split_none nooit vuren in een echt rapport."""
    ranked = [dict(r) for r in RANKED]
    ranked[0]["score"] = 4.5
    html = _wat_moet_gebeuren_block(ranked, {"growth": SPLIT_NONE, "workload": DIVIDED},
                                    "retention", 45)
    assert "dir-split_none" in html
    assert "(4.5/10) is dat verschil van inzicht zelf het gesprek" in html


def test_no_em_dashes_or_forbidden_words():
    blobs = [
        _direction_card_cell("startpunt", label="Groeiperspectief", agg=CLEAR,
                             scan_type="retention", factor_key="growth", n_total=13),
        _direction_card_cell("tweede", label="Werkdruk en herstelruimte", agg=DIVIDED,
                             scan_type="retention", factor_key="workload", n_total=13),
        _direction_card_cell("startpunt", label="Werkdruk en herstelruimte", agg=NONE,
                             scan_type="retention", factor_key="workload", n_total=13),
        _direction_card_cell("tweede", label="Werkdruk en herstelruimte", agg=FEW,
                             scan_type="retention", factor_key="workload", n_total=13),
        _wat_moet_gebeuren_block(RANKED, {"growth": CLEAR, "workload": DIVIDED}, "exit", 13),
        _plurality_card(),
        _split_none_card(),
    ]
    for b in blobs:
        assert "—" not in b and "&#x2014;" not in b
        low = b.lower()
        for w in FORBIDDEN:
            assert w not in low, w


def test_verdieping_intro_no_longer_promises_direction_per_deepening():
    from backend.report_html import SECTION_INTROS
    intro = SECTION_INTROS["verdieping"]
    assert "gespreksrichting" not in intro.lower()
    assert "welke richting" not in intro.lower()
    assert "toelichting past het best" in intro
    # Mutatiebestendig (code-review taak 9C): pin de VOLLEDIGE, letterlijke
    # afsluitzin die naar de gespreksagenda doorverwijst. Alleen het woord
    # "gespreksrichting" afwezig-checken laat een mutatie die de zin in
    # andere woorden herformuleert, of 'm gewoon weglaat, ongemerkt door.
    assert "Wat er volgens hen moet gebeuren staat bij de gespreksagenda." in intro


def test_trust_page_explains_direction_question_for_exit_and_retention_only():
    from backend.report_html import _trust_page
    # Decisive justification, verbatim (code-review taak 9C): de vloer van 3
    # (lager dan de 5 die voor afdelingen geldt) is alleen verdedigbaar MET
    # deze reden. Alleen het getal "3" pinnen (via "vanaf 3 antwoorden")
    # laat een mutatie die de reden weghaalt maar het getal laat staan
    # ongemerkt door.
    justification = "omdat niemand in de organisatie kan zien wie een onderwerp als laagste had"
    for st in ("exit", "retention"):
        html = _trust_page(st, direction_active=True)
        assert "Richtingvraag" in html
        assert "geen advies van Loep" in html
        assert "vanaf 3 antwoorden" in html
        assert justification in html
        assert "\u2014" not in html
    assert "Richtingvraag" not in _trust_page("onboarding", direction_active=True)


def test_trust_page_direction_row_requires_direction_active():
    """Code-review taak 9, fix B: scan_type in DIRECTION_SCAN_TYPES zegt
    alleen dat het PRODUCT de richtingvraag kan stellen; de campagnegate in
    build_report_data kan direction_agg voor DEZE meting leeg maken (nog
    niemand aangeboden). De Richtingvraag-rij mag dan niet beweren dat er
    een vraag is gesteld, precies zoals _prioriteringsraster's
    deepening_active al voorkomt voor de verdiepingskolom."""
    from backend.report_html import _trust_page
    for st in ("exit", "retention"):
        assert "Richtingvraag" not in _trust_page(st, direction_active=False)
        assert "Richtingvraag" not in _trust_page(st)  # default = False
        assert "Richtingvraag" in _trust_page(st, direction_active=True)
    # Onboarding kent de richtingvraag sowieso niet (niet in
    # DIRECTION_SCAN_TYPES), ongeacht direction_active.
    assert "Richtingvraag" not in _trust_page("onboarding", direction_active=True)
    assert "Richtingvraag" not in _trust_page("onboarding", direction_active=False)


def _min_onboarding_data():
    """Minimale data-dict voor render_onboarding_report_html(), model op
    tests/test_report_distribution.py::_min_retention_data maar met de
    onboarding-specifieke keys (nsp/sdt_item_avgs/sdt_items i.p.v.
    avg_eng/avg_to/band_counts/exit_r_dist/...)."""
    n = 12
    return dict(
        scan_lbl="Loep Start", org_name="TestOrg", campaign_name="Wave 1",
        n_invited=n + 3, n_invited_note="", n_completed=n, completion_pct=80.0,
        avg_risk=5.0, avg_si=5.0,
        factor_avgs={"workload": 5.0}, sdt_avgs={}, nsp={},
        top_fkeys=["workload"], top_flabels=["Werkdruk en herstelruimte"],
        factor_items_map={"workload": [("W1", "Testvraag werkdruk")]},
        org_item_avgs={"W1": 5.0}, sdt_item_avgs={},
        sdt_items=[], enps_available=False, enps_score=None,
        open_texts=[], factor_resp_scores={"workload": [5.0] * n},
        deepening_agg={}, segment_rows=[], segment_factor_rows=None,
    )


def test_onboarding_report_drops_verdieping_intro_retention_keeps_it():
    """Code-review taak 9, fix A: SECTION_INTROS["verdieping"] belooft een
    automatische vervolgvraag + een gespreksagenda gevuld met wat
    respondenten kozen. Dat klopt voor exit/retention (deepening + evt.
    richtingvraag), maar niet voor onboarding: geen deepening-set in v1,
    geen richtingdata (DIRECTION_SCAN_TYPES sluit onboarding uit), dus de
    onboarding-gespreksagenda komt uit een vaste template-lookup, niet uit
    wat respondenten zelf kozen. De onboarding-renderer moet die intro dus
    niet meer tonen; exit/retention wel."""
    from backend.report_html import render_onboarding_report_html, render_retention_report_html
    from tests.test_report_distribution import _min_retention_data

    opening_clause = "Respondenten die laag scoorden op dit thema kregen automatisch"

    onboarding_html = render_onboarding_report_html(_min_onboarding_data())
    assert opening_clause not in onboarding_html

    retention_html = render_retention_report_html(_min_retention_data())
    assert opening_clause in retention_html


def test_too_few_card_is_vertically_centred():
    # De too_few-kaart mist bronregel, tabel en caveat en is dus veel korter dan
    # haar buur; de tabelrij dwingt beide cellen op dezelfde hoogte, wat onderin
    # dode witruimte gaf die als render-bug las. Table-native gecentreerd, geen
    # flex: WeasyPrint negeert daar stilzwijgend eigenschappen op.
    from backend.report_css import build_css
    assert ".dir-card.dir-too_few { vertical-align: middle; }" in build_css("retention")

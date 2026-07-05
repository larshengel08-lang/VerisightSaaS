# tests/test_pdf_redesign.py
from __future__ import annotations

from backend.report_fonts import font_face_css, FONT_SPECS
from backend.report_css import build_css, ACCENTS


def test_font_face_css_embeds_all_families_as_base64():
    css = font_face_css()
    for spec in FONT_SPECS:
        assert f"font-family: '{spec.family}'" in css
    assert "src: url(data:font/ttf;base64," in css
    assert "fonts.googleapis.com" not in css
    assert ".ttf)" not in css  # no raw path references


def test_build_css_injects_scan_accent_and_sharp_corners():
    css = build_css("exit")
    assert "#E8A020" in css
    assert "border-radius: 0" in css
    assert "'Inter Tight'" in css
    assert "@font-face" in css


def test_accent_is_amber_for_all_products():
    # Beslissing 2026-06-13: amber is het enige accent; producten verschillen
    # alleen via eyebrow-tekst, niet via kleur.
    for st in ("exit", "retention", "onboarding", "culture_assessment"):
        assert ACCENTS[st]["accent"] == "#E8A020"
        assert ACCENTS[st]["accent_lo"] == "#B07A10"
        assert "#E8A020" in build_css(st)


from backend.report_html import _cover


def test_cover_shows_opening_question_and_value_stats_not_metadata():
    html = _cover(
        scan_label="ExitScan", scan_type="exit", org_name="Acme BV",
        period="Q2 2026", opening_question="Wat speelde mee bij vertrek?",
        stats=[("Respondenten", "34"), ("Respons", "76%"), ("Primair signaal", "Groeiperspectief")],
    )
    assert "Wat speelde mee bij vertrek?" in html
    assert "Groeiperspectief" in html
    assert "ExitScan" in html
    assert "VERTROUWELIJK" in html
    assert "Pagina" not in html
    assert "Gemiddelde score" not in html


from backend.report_html import _bestuurlijke_read, _responsbasis


def test_responsbasis_shows_counts_and_trustline():
    html = _responsbasis(invited=45, completed=34, pct=76, period="apr–mei 2026",
                         population="Alle medewerkers", segment_available=False,
                         segment_reason="te weinig responses per groep")
    assert "45" in html and "34" in html and "76" in html
    assert "Individuen zijn niet herleidbaar" in html
    assert "te weinig responses per groep" in html





def test_bestuurlijke_read_contains_core_blocks():
    html = _bestuurlijke_read(
        kernzin="Het vertrekbeeld is gemengd; groeiperspectief springt eruit.",
        totaalbeeld="Drie factoren scoren laag. Eén factor is relatief sterk.",
        primary_label="Groeiperspectief", primary_score=4.2, primary_color="#C0392B",
        why_cells_html="<td class='why-cell'><div class='why-l'>Score</div><div class='why-v'>4.2</div></td>",
        strong_label="Werksfeer", strong_score=7.1,
        mgmt_q="Welke loopbaanstappen ontbreken voor deze groep?",
    )
    assert "Groeiperspectief" in html
    assert 'class="why"' in html
    assert "Werksfeer" in html
    assert "Welke loopbaanstappen" in html
    assert "p.03" in html or "responsbasis" in html.lower()


from backend.report_html import _overzichtsprofiel


def test_overzichtsprofiel_ranks_all_factors_with_rag():
    factors = [("Groeiperspectief", 4.2), ("Beloning", 5.1), ("Werksfeer", 7.3)]
    html = _overzichtsprofiel(factors)
    assert "Groeiperspectief" in html and "Werksfeer" in html
    assert html.index("Groeiperspectief") < html.index("Werksfeer")
    assert "4.2" in html and "7.3" in html


from backend.report_html import _vertrekcontext


def test_vertrekcontext_separates_hoofdreden_from_meespelend():
    html = _vertrekcontext(
        exit_reasons=[("Groeiperspectief", 12), ("Beloning", 7), ("Leiding", 4)],
        contributing=[("Werkdruk", 9), ("Werksfeer", 5)],
        n=34, primary_factor_label="Groeiperspectief",
    )
    assert "Groeiperspectief" in html and "12" in html
    assert "Werkdruk" in html
    assert "meespeel" in html.lower() or "hoofdreden" in html.lower()


from backend.report_html import _select_priority_factors


def test_priority_factors_weighs_exit_reason_not_only_score():
    factor_avgs = {"growth": 4.2, "pay": 4.0, "workload": 4.5}
    exit_codes = {"growth": 12, "pay": 2, "workload": 3}
    out = _select_priority_factors(factor_avgs, exit_codes, max_n=3)
    assert out[0] == "growth"
    assert len(out) <= 3


from backend.report_html import _behoudscontext


def test_behoudscontext_shows_stay_intent_and_signal():
    html = _behoudscontext(retention_score=6.4, stay_intent=7.2, turnover=1.8,
                           engagement=5.9, primary_factor="Autonomie")
    assert "7.2" in html and "Autonomie" in html
    assert "behoud" in html.lower()


from backend.report_html import _checkpointoverzicht, _landingskwaliteit


def test_checkpointoverzicht_shows_three_phases():
    html = _checkpointoverzicht(checkpoints=[("30 dagen", 6.8), ("60 dagen", 6.1), ("90 dagen", 5.7)])
    assert "30 dagen" in html and "90 dagen" in html
    assert "6.8" in html and "5.7" in html


def test_checkpointoverzicht_single_measurement_degraded():
    html = _checkpointoverzicht(checkpoints=[("Huidig checkpoint", 6.5)])
    assert "6.5" in html
    assert "herhaalde meting" in html.lower()


def test_landingskwaliteit_renders_domains():
    domains = [
        ("Rolhelderheid en verwachtingen", 5.2),
        ("Begeleiding en bereikbaarheid", 6.8),
        ("Sociale landing en cultuurbegrip", 4.9),
    ]
    html = _landingskwaliteit(domains)
    assert "Rolhelderheid" in html
    assert "5.2" in html and "6.8" in html
    assert "Landingskwaliteit" in html


from backend.report_html import _should_show_appendix, _should_show_quotes


def test_module_gating():
    assert _should_show_appendix(n=25, n_factors=6) is True
    assert _should_show_appendix(n=15, n_factors=6) is False
    assert _should_show_appendix(n=25, n_factors=4) is False
    assert _should_show_quotes(["a", "b", "c", "d", "e"]) is True
    assert _should_show_quotes(["a", "b"]) is False


from backend.report_html import _segment_status_block, _eerste_managementspoor


def test_segment_state_b_uses_spec_copy():
    html = _segment_status_block(n=8, has_segment_data=False)
    assert "herleidbaarheid te voorkomen" in html
    assert "zodra voldoende responses" in html


def test_managementspoor_avoids_hard_language():
    html = _eerste_managementspoor(
        primary_theme="Groeiperspectief + vertrekcontext", second_point="Beloning",
        mgmt_q="Welke loopbaanstappen ontbreken?",
        review_when="over 1 kwartaal")
    low = html.lower()
    assert "risicofactor" not in low
    assert "interventie" not in low
    assert "gespreksopener" in low or "aandachtspunt" in low


def test_managementspoor_eigenaarschap_is_blank_not_ai_suggested():
    """Eigenaarschap wordt bewust niet door Loep gesuggereerd (geen aanname wie
    dit oppakt) — het vak is een invulbare lege regel voor tijdens de
    bespreking, met een uitleghint, geen algoritmisch geschatte rol.
    """
    html = _eerste_managementspoor(
        primary_theme="Groeiperspectief + vertrekcontext", second_point="Beloning",
        mgmt_q="Welke loopbaanstappen ontbreken?",
        review_when="over 1 kwartaal")
    assert "step-fill" in html
    assert "in te vullen tijdens de bespreking" in html.lower()
    assert "hr " not in html.lower().split("eigenaarschap")[1].split("</td>")[0]

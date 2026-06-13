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

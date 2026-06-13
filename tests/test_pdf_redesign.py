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
    assert "#3C8D8A" in build_css("retention")


def test_accents_defined_for_all_products():
    for st in ("exit", "retention", "onboarding"):
        assert st in ACCENTS
        assert ACCENTS[st]["accent"].startswith("#")
        assert ACCENTS[st]["accent_lo"].startswith("#")

# tests/test_pdf_redesign.py
from __future__ import annotations

from backend.report_fonts import font_face_css, FONT_SPECS


def test_font_face_css_embeds_all_families_as_base64():
    css = font_face_css()
    for spec in FONT_SPECS:
        assert f"font-family: '{spec.family}'" in css
    assert "src: url(data:font/ttf;base64," in css
    assert "fonts.googleapis.com" not in css
    assert ".ttf)" not in css  # no raw path references

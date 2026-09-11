# tests/test_cover_label_overflow.py
#
# Stresstest B10 (docs/rapport-stresstest-2026-09-10.md): de derde coverstat
# ("Eerste aandachtspunt") droeg een lange factornaam die in WeasyPrint buiten
# de rechter paginarand liep. De fix: een vaste tabelbreedte op .cmeta, breken
# binnen de kolom, en een kleinere corpsgrootte (cmv-long) voor lange waarden.
#
# Er bestond nog geen guard op WeasyPrint-onveilige CSS-eigenschappen (gap,
# var(), inset), hoewel die precies de reden waren waarom de fixes van
# 2026-07-05 in de cover eerder stilzwijgend wegvielen. Deze test pint ze.
from __future__ import annotations

import re

import pytest

from backend.report_css import build_css
from backend.report_html import _cover


LONG_VALUES = [
    "Informatiedichtheid en werktempo",
    "Cultuur en psychologische veiligheid",
    "Rolhelderheid en eigenaarschap",
]


def _render(third_value: str) -> str:
    return _cover(
        scan_label="Loep Start", scan_type="onboarding", org_name="Acme BV",
        period="Q2 2026", opening_question="Hoe landen nieuwe collega's?",
        stats=[("Respondenten", "30"), ("Respons", "71%"),
               ("Eerste aandachtspunt", third_value)],
    )


def _value_cells(html: str) -> list[str]:
    """Alle class-attributen van de .cmv-waardecellen, in documentvolgorde."""
    return re.findall(r'<div class="(cmv[^"]*)">', html)


@pytest.mark.parametrize("value", LONG_VALUES)
def test_long_cover_value_gets_long_modifier(value: str):
    cells = _value_cells(_render(value))
    assert len(cells) == 3
    assert cells[0] == "cmv"            # "30": kort, blijft 22px
    assert cells[1] == "cmv"            # "71%": kort, blijft 22px
    assert cells[2] == "cmv cmv-long"   # lange factornaam breekt af op 15px


def test_short_cover_value_gets_no_long_modifier():
    cells = _value_cells(_render("Werkdruk"))
    assert cells == ["cmv", "cmv", "cmv"]


def test_long_modifier_threshold_is_eighteen_characters():
    assert _value_cells(_render("a" * 18))[2] == "cmv"
    assert _value_cells(_render("a" * 19))[2] == "cmv cmv-long"


def _cover_rules(css: str) -> str:
    start = css.index("/* ── Cover ── */")
    end = css.index("/* ──", start + 5)
    return css[start:end]


def _rule(css: str, selector: str) -> str:
    m = re.search(re.escape(selector) + r"\s*\{([^}]*)\}", css)
    assert m, f"selector {selector} ontbreekt in de CSS"
    return m.group(1)


@pytest.mark.parametrize("scan_type", ["exit", "retention", "onboarding"])
def test_cover_meta_table_has_fixed_layout_and_full_width(scan_type: str):
    css = build_css(scan_type)
    cover = _cover_rules(css)
    cmeta = _rule(cover, ".cmeta")
    assert "table-layout: fixed" in cmeta
    assert "width: 100%" in cmeta
    assert "width: auto" not in cmeta

    cmc = _rule(cover, ".cmc")
    assert "display: table-cell" in cmc
    assert "overflow-wrap: break-word" in cmc
    assert "word-wrap: break-word" in cmc
    assert "vertical-align: top" in cmc

    cmv = _rule(cover, ".cmv")
    assert "white-space: normal" in cmv
    assert "font-size: 22px" in cmv

    cmv_long = _rule(cover, ".cmv-long")
    assert "font-size: 15px" in cmv_long


def test_cover_rules_avoid_weasyprint_unsafe_properties():
    # WeasyPrint negeert `gap`, CSS custom properties en de `inset`-shorthand
    # stilzwijgend (zie beslissingslog 2026-07-05). Guard op de coverregels,
    # zodat de fix niet opnieuw alleen in Chromium werkt.
    cover = _cover_rules(build_css("onboarding"))
    assert "gap:" not in cover
    assert "var(" not in cover
    assert "inset:" not in cover

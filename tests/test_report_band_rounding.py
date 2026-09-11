"""B15: bandlabel en bandkleur horen bij de GETOONDE (1-decimaal afgeronde) score.

Stresstest-bevinding: 6.55 / 6.47 / 6.55 werden alle drie als "6.5/10" getoond,
maar kregen "Relatief sterk" / "Aandachtspunt" / "Relatief sterk" omdat de
labels op de onafgeronde waarde werden berekend, terwijl de methodiekpagina
"relatief sterk (vanaf 6,5)" zegt. Een lezer ziet dan hetzelfde getal met twee
labels. Alle helpers moeten daarom eerst afronden zoals _score_str toont.

De tests leiden de verwachting af uit de display-string zelf, zodat ze
representatie-onafhankelijk zijn (6.45 kan als "6.4" of "6.5" formatteren).
"""
from __future__ import annotations

import pytest

from backend.report_html import (
    RAG_HIGH,
    RAG_LOW,
    RAG_MID,
    _band,
    _behoudscontext,
    _checkpointoverzicht,
    _factor_color,
    _factor_label,
    _overzicht_summary_and_bands,
    _rag_color,
    _score_str,
    _shown,
)
from backend.scoring_config import RISK_HIGH, RISK_MEDIUM


def _expected_label(x: float) -> str:
    shown = float(f"{x:.1f}")
    if shown < 5.0:
        return "Kwetsbaar punt"
    if shown < 6.5:
        return "Aandachtspunt"
    return "Relatief sterk"


_COLOR_FOR = {"Kwetsbaar punt": RAG_HIGH, "Aandachtspunt": RAG_MID, "Relatief sterk": RAG_LOW}


# ── _shown ────────────────────────────────────────────────────────────────────

def test_shown_matches_score_str_representation():
    for x in (6.45, 6.55, 4.95, 4.05, 6.449999, 6.5000001, 9.99, 1.0):
        assert _shown(x) == float(_score_str(x).removesuffix("/10"))


def test_shown_none_stays_none():
    assert _shown(None) is None


# ── grenswaarden ─────────────────────────────────────────────────────────────

@pytest.mark.parametrize("x", [6.45, 6.55, 4.95, 5.05])
def test_factor_label_follows_display_on_boundary(x):
    assert _factor_label(x) == _expected_label(x)


def test_factor_label_clear_cases():
    assert _factor_label(6.44) == "Aandachtspunt"
    assert _factor_label(6.5) == "Relatief sterk"
    assert _factor_label(4.94) == "Kwetsbaar punt"
    assert _factor_label(5.0) == "Aandachtspunt"
    assert _factor_label(None) == "Geen data"


def test_stresstest_scenario_6_55_and_6_47_same_display_same_label():
    # 6.55 en 6.47 tonen beide "6.5/10" en horen dus hetzelfde label te krijgen.
    assert _score_str(6.55) == _score_str(6.47) == "6.5/10"
    assert _factor_label(6.55) == _factor_label(6.47) == "Relatief sterk"
    assert _factor_color(6.55) == _factor_color(6.47) == RAG_LOW
    assert _rag_color(6.55) == _rag_color(6.47) == RAG_LOW


@pytest.mark.parametrize("x", [6.45, 6.55, 6.44, 4.95, 4.94, 5.05])
def test_factor_color_and_rag_color_follow_display(x):
    expected = _COLOR_FOR[_expected_label(x)]
    assert _factor_color(x) == expected
    assert _rag_color(x) == expected


# ── property-stijl over een raster ───────────────────────────────────────────

def test_label_and_colour_invariant_under_display_rounding():
    for k in range(100, 1001):
        x = k / 100
        shown = float(f"{x:.1f}")
        assert _factor_label(x) == _factor_label(shown), x
        assert _factor_color(x) == _factor_color(shown), x
        assert _rag_color(x) == _rag_color(shown), x
        for st in ("exit", "retention", "onboarding"):
            assert _band(x, st) == _band(shown, st), (x, st)


# ── _band (totaalscore, RISK_HIGH / RISK_MEDIUM) ─────────────────────────────

def test_band_rounds_like_display():
    just_below_high = RISK_HIGH - 0.04   # toont als RISK_HIGH
    just_below_med = RISK_MEDIUM - 0.04  # toont als RISK_MEDIUM
    assert _shown(just_below_high) == RISK_HIGH
    assert _shown(just_below_med) == RISK_MEDIUM
    for st in ("exit", "retention", "onboarding"):
        assert _band(just_below_high, st) == _band(RISK_HIGH, st)
        assert _band(just_below_med, st) == _band(RISK_MEDIUM, st)
        assert _band(RISK_HIGH - 0.06, st) != _band(RISK_HIGH, st)
    assert _band(None) == ("Geen data", "#94A3B8")


# ── overzichtsprofiel-banden ─────────────────────────────────────────────────

def test_overzicht_bands_use_displayed_score():
    _summary, bands = _overzicht_summary_and_bands([
        ("Autonomie", 6.55), ("Competentie", 6.47), ("Verbondenheid", 4.96), ("Leiderschap", 4.94),
    ])
    assert bands["sterk"] == ["Autonomie", "Competentie"]
    assert bands["aandacht"] == ["Verbondenheid"]
    assert bands["kwetsbaar"] == ["Leiderschap"]


# ── gerenderde output ────────────────────────────────────────────────────────

def _cells(html: str) -> list[str]:
    return html.split("<td>")[1:]


def test_checkpointoverzicht_never_shows_6_5_with_aandachtspunt():
    html = _checkpointoverzicht([("30 dagen", 6.47), ("60 dagen", 6.55), ("90 dagen", 6.44)])
    cells = _cells(html)
    assert len(cells) == 3
    for cell in cells:
        if "6.5/10" in cell:
            assert "Aandachtspunt" not in cell
            assert "Relatief sterk" in cell
            assert RAG_LOW in cell
        if "6.4/10" in cell:
            assert "Aandachtspunt" in cell


def test_behoudscontext_notes_follow_displayed_score():
    html = _behoudscontext(retention_score=RISK_HIGH - 0.04, stay_intent=None,
                           turnover=6.46, engagement=7.46)
    # Behoudssignaal toont RISK_HIGH -> zelfde note als een echte RISK_HIGH.
    assert f"{RISK_HIGH:.1f}/10" in html
    assert "onder druk" in html
    # Vertrekintentie toont 6.5 -> "zichtbaar" (grens <= 6.5), niet "hoog".
    assert "6.5/10" in html and "zichtbaar" in html and "actief vertrekrisico" not in html
    # Bevlogenheid toont 7.5 -> "hoog".
    assert "7.5/10" in html
    assert ">hoog<" in html or "hoog</span>" in html

"""Spec 2026-10-09 par. 2 en R20/R12: de score heet Werkbeeld, met een eerlijke
uitleg, en de vier cijfers op p.03 gebruiken de bandlabels van de rest van het rapport."""
import re

import pytest

from backend.report_html import _band, _behoudscontext, _p02_signal_cell
from scripts import stresstest_report as st

_CACHE: dict[str, str] = {}


def _html(key: str) -> str:
    if key not in _CACHE:
        sc = {s.key: s for s in st.SCENARIOS}[key]
        _CACHE[key] = open(st.run_scenario(sc)["html"], encoding="utf-8").read()
    return _CACHE[key]


def _tekst(html: str) -> str:
    return re.sub(r"\s+", " ", re.sub(r"<[^>]+>", " ", html))


UITLEG = "De zes werkonderwerpen en de werkbeleving samen; geen meting van of mensen blijven."


def test_geen_behoudssignaal_meer_in_een_behoudrapport():
    html = _html("02_een_lage_factor")
    assert "ehoudssignaal" not in html and "EHOUDSSIGNAAL" not in html


def test_tegel_op_pagina_twee_heet_werkbeeld_met_uitleg():
    t = _tekst(_html("02_een_lage_factor"))
    assert "Werkbeeld" in t
    assert UITLEG in t


def test_uitleg_is_waar_en_noemt_geen_gemiddelde_van_zes():
    t = _tekst(_html("02_een_lage_factor"))
    assert "gemiddelde van de zes" not in t


def test_vertrekrapport_en_startrapport_houden_hun_eigen_naam():
    assert "Frictiescore" in _html("08_exit_n12") and "Werkbeeld" not in _html("08_exit_n12")
    assert "Checkpointscore" in _html("20_onboarding_sanity")
    assert "Werkbeeld" not in _html("20_onboarding_sanity")


def test_uitleg_onder_de_tegel_alleen_bij_loep_behoud():
    assert UITLEG not in _tekst(_html("08_exit_n12"))
    assert UITLEG not in _tekst(_html("20_onboarding_sanity"))
    assert 'class="sc-n"' not in _html("08_exit_n12") and 'class="sc-n"' not in _html("20_onboarding_sanity")


def test_vertrekrapport_gebruikt_werkbeeld_niet_als_los_woord():
    assert "werkbeeld" not in _html("08_exit_n12").lower()


def test_p03_labels_uit_een_set():
    html = _html("02_een_lage_factor")
    notes = re.findall(r'class="sigrow-note"[^>]*>(.*?)<', html)
    toegestaan = {"onder druk", "vraagt aandacht", "relatief sterk",
                  "veel vertrekgedachten", "weinig vertrekgedachten"}
    assert len(notes) == 4, notes
    for note in notes:
        assert note.strip().lower() in toegestaan, note


def test_p03_intro_noemt_werkbeeld_en_de_basisbehoeften():
    t = _tekst(_html("02_een_lage_factor"))
    assert "Het werkbeeld is een samenvattende groepsscore" in t
    assert "Het zegt hoe mensen hun werk ervaren, niet of ze blijven" in t


# ── Eenheid: de bandsets ─────────────────────────────────────────────────────

@pytest.mark.parametrize("score,label", [
    (8.0, "Relatief sterk"), (6.5, "Relatief sterk"), (6.4, "Vraagt aandacht"),
    (5.0, "Vraagt aandacht"), (4.9, "Onder druk"), (4.0, "Onder druk"),
])
def test_retention_band_onder_de_tegel(score, label):
    assert _band(score, "retention")[0] == label


def _note(html: str, titel: str) -> str:
    start = html.index(f'<div class="sigrow-title">{titel}</div>')
    m = re.search(r'class="sigrow-note">([^<]*)<', html[start:])
    nxt = html.find('<div class="sigrow">', start + 1)
    assert m and (nxt == -1 or start + m.start() < nxt), f"geen note bij {titel}"
    return m.group(1)


@pytest.mark.parametrize("v,label", [
    (4.9, "onder druk"), (5.0, "vraagt aandacht"), (6.4, "vraagt aandacht"),
    (6.5, "relatief sterk"), (8.0, "relatief sterk"),
])
@pytest.mark.parametrize("veld,titel", [
    ("retention_score", "Werkbeeld"), ("stay_intent", "Blijfintentie"),
    ("engagement", "Bevlogenheid"),
])
def test_gezondheidscijfers_op_p03_een_ladder(veld, titel, v, label):
    kwargs = {"retention_score": None, "stay_intent": None, "turnover": None,
              "engagement": None}
    kwargs[veld] = v
    assert _note(_behoudscontext(**kwargs), titel) == label


def test_bevlogenheid_volgt_de_ladder_van_zijn_kleur_niet_meer_eigen_grenzen():
    # Voorheen: 7.0 heette "gemiddeld" (eigen grens 7,5) terwijl de kleur teal was.
    html = _behoudscontext(retention_score=None, stay_intent=None, turnover=None,
                           engagement=7.0)
    assert _note(html, "Bevlogenheid") == "relatief sterk"


@pytest.mark.parametrize("v,label", [
    (2.0, "weinig vertrekgedachten"), (4.9, "weinig vertrekgedachten"),
    (4.96, "vraagt aandacht"),  # toont 5.0
    (5.0, "vraagt aandacht"), (6.4, "vraagt aandacht"),
    (6.5, "veel vertrekgedachten"), (9.0, "veel vertrekgedachten"),
])
def test_vertrekintentie_label_volgt_de_zones_van_de_strook(v, label):
    html = _behoudscontext(retention_score=None, stay_intent=None, turnover=v,
                           engagement=None)
    assert _note(html, "Vertrekintentie") == label


def test_signaalcel_met_en_zonder_uitleg():
    zonder = _p02_signal_cell("Checkpointscore", "6.0/10", "Gemengd")
    assert 'class="sc-n"' not in zonder
    met = _p02_signal_cell("Werkbeeld", "6.0/10", "Vraagt aandacht", note=UITLEG)
    assert f'<div class="sc-n">{UITLEG}</div>' in met
    assert met.index('class="sc-b"') < met.index('class="sc-n"')

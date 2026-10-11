"""Spec 2026-10-09 par. 2 en R20/R12: de score heet Werkbeeld, met een eerlijke
uitleg, en de vier cijfers op p.03 gebruiken de bandlabels van de rest van het rapport."""
import re

import pytest

from backend.report_html import _band, _behoudscontext, _p02_signal_cell
from scripts import stresstest_report as st


@pytest.fixture(scope="module", autouse=True)
def _stresstest_naar_tmp(tmp_path_factory):
    """Scenario's renderen naar een tijdelijke map, niet naar docs/stresstest."""
    out = tmp_path_factory.mktemp("stresstest")
    with pytest.MonkeyPatch.context() as mp:
        mp.setattr(st, "OUT_DIR", out)
        yield

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
    from backend.report_html import _FACTOR_LABEL_WOORDEN
    toegestaan = {w.lower() for w in _FACTOR_LABEL_WOORDEN} | {
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
    (8.0, "Relatief sterk"), (6.5, "Relatief sterk"), (6.4, "Aandachtspunt"),
    (5.0, "Aandachtspunt"), (4.9, "Kwetsbaar punt"), (4.0, "Kwetsbaar punt"),
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
    (4.9, "kwetsbaar punt"), (5.0, "aandachtspunt"), (6.4, "aandachtspunt"),
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
    (4.96, "aandachtspunt"),  # toont 5.0
    (5.0, "aandachtspunt"), (6.4, "aandachtspunt"),
    (6.5, "veel vertrekgedachten"), (9.0, "veel vertrekgedachten"),
])
def test_vertrekintentie_label_volgt_de_zones_van_de_strook(v, label):
    html = _behoudscontext(retention_score=None, stay_intent=None, turnover=v,
                           engagement=None)
    assert _note(html, "Vertrekintentie") == label


def test_signaalcel_met_en_zonder_uitleg():
    zonder = _p02_signal_cell("Checkpointscore", "6.0/10", "Gemengd")
    assert 'class="sc-n"' not in zonder
    met = _p02_signal_cell("Werkbeeld", "6.0/10", "Aandachtspunt", note=UITLEG)
    assert f'<div class="sc-n">{UITLEG}</div>' in met
    assert met.index('class="sc-b"') < met.index('class="sc-n"')


def test_p03_intro_laat_loep_niet_spreken_en_noemt_de_labelwoorden():
    from backend.report_html import SECTION_INTROS
    intro = SECTION_INTROS["behoudscontext"]
    assert "noemen we" not in intro
    assert "Onder de 5,0 heet een score een kwetsbaar punt, tussen 5,0 en 6,5 een aandachtspunt" in intro


def test_labels_komen_uit_factor_label():
    from backend.report_html import _RETENTION_BANDS, _factor_label
    assert [_RETENTION_BANDS[k][0] for k in ("HOOG", "MIDDEN", "LAAG")] == [
        _factor_label(4.0), _factor_label(5.5), _factor_label(7.0)]


@pytest.mark.parametrize("score,zin", [
    (4.0, "Het werkbeeld is 4.0/10: een kwetsbaar punt."),
    (5.5, "Het werkbeeld is 5.5/10: een aandachtspunt."),
    (7.0, "Het werkbeeld is 7.0/10: relatief sterk."),
])
def test_zin_zonder_profiel_is_grammaticaal(score, zin):
    from backend.report_html import _werkbeeld_zin
    assert _werkbeeld_zin(score) == zin


@pytest.mark.parametrize("score,niveau", [
    (4.94, 0), (4.96, 1), (5.0, 1), (6.44, 1), (6.46, 2), (6.5, 2), (9.0, 2),
])
def test_factor_level_en_zone_index_op_de_getoonde_score(score, niveau):
    from backend.report_distribution import zone_index
    from backend.report_html import _FACTOR_LABEL_WOORDEN, _factor_label, _factor_level
    assert zone_index(score) == niveau
    assert _factor_level(score) == niveau
    assert _factor_label(score) == _FACTOR_LABEL_WOORDEN[niveau]


def test_factor_level_zonder_score():
    from backend.report_html import _factor_label, _factor_level
    assert _factor_level(None) is None
    assert _factor_label(None) == "Geen data"

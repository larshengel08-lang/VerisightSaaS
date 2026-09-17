"""Pagina twee als MT-vel (spec 2026-09-16 par. 4).

Blok 2: blijfintentie met band en zones, respons met oordeel, vertrekreden met
noemer en gelijkspel. Elke zin die hier wordt gepind komt letterlijk uit de spec
of uit de leesronde (B1, H3, ronde-2-punt b).
"""
import re

from backend.report_html import (
    _blijfintentie_cell,
    _blijfintentie_kopzin,
    _p02_cijfers_block,
    _respons_oordeel,
    _vertrekreden_cell,
    _vertrekreden_zin,
)

STAY_KWETSBAAR = [2.0] * 25 + [5.5] * 8 + [8.0] * 6   # n=39, gem 3.9
STAY_STERK = [8.0] * 30 + [6.0] * 9                   # n=39, gem 7.5


def _tekst(html: str) -> str:
    return re.sub(r"\s+", " ", re.sub(r"<[^>]+>", " ", html)).strip()


# ── blijfintentie ────────────────────────────────────────────────────────────

def test_blijfintentie_cel_toont_band_en_zones():
    cel = _tekst(_blijfintentie_cell(3.9, STAY_KWETSBAAR))
    assert "Blijfintentie 3.9/10" in cel
    assert "kwetsbaar" in cel
    assert "25 van de 39 zitten onder de 5" in cel


def test_blijfintentie_cel_relatief_sterk():
    cel = _tekst(_blijfintentie_cell(7.5, STAY_STERK))
    assert "relatief sterk" in cel
    assert "0 van de 39 zitten onder de 5" in cel


def test_blijfintentie_cel_leeg_zonder_score():
    assert _blijfintentie_cell(None, []) == ""


def test_blijfintentie_kopzin_alleen_bij_kwetsbaar():
    assert _blijfintentie_kopzin(3.9, STAY_KWETSBAAR) == (
        "Ook de blijfintentie is kwetsbaar: 3.9/10, 25 van de 39 zitten onder de 5.")
    assert _blijfintentie_kopzin(7.5, STAY_STERK) == ""
    assert _blijfintentie_kopzin(None, []) == ""
    # Op de grens beslist de getoonde score (B15): 4.96 toont 5.0 en is geen kwetsbaar punt.
    assert _blijfintentie_kopzin(4.96, [5.0] * 12) == ""


# ── respons ──────────────────────────────────────────────────────────────────

def test_respons_oordeel_genoeg():
    assert _respons_oordeel(39, 58) == (
        "39 van de 58 ingevuld (67%): genoeg voor een betrouwbaar groepsbeeld.")


def test_respons_oordeel_onder_de_helft():
    assert _respons_oordeel(45, 150) == (
        "45 van de 150 ingevuld (30%): het beeld van wie meedeed, niet van de hele organisatie.")


def test_respons_oordeel_indicatief():
    assert _respons_oordeel(45, 180) == (
        "45 van de 180 ingevuld (25%): indicatief, geen vastgesteld startpunt.")


def test_respons_oordeel_te_weinig_voor_profiel():
    assert _respons_oordeel(8, 14) == (
        "8 van de 14 ingevuld (57%): te weinig voor een profiel per onderwerp, daarvoor zijn er minimaal 10 nodig.")


def test_respons_oordeel_zonder_noemer():
    assert _respons_oordeel(39, None) == (
        "39 ingevuld; het aantal uitgenodigden is niet vastgelegd, dus staat er geen percentage.")


# ── vertrekreden (Loep Vertrek) ──────────────────────────────────────────────

DIST = [{"code": "PL1", "label": "Beter aanbod elders", "count": 4},
        {"code": "P1", "label": "Leiderschap / management", "count": 2}]
TIE = [{"code": "PL1", "label": "Beter aanbod elders", "count": 4},
       {"code": "P1", "label": "Leiderschap / management", "count": 4},
       {"code": "P3", "label": "Gebrek aan groei", "count": 1}]


def test_vertrekreden_zin_met_noemer():
    assert _vertrekreden_zin(DIST, 12) == (
        "Beter aanbod elders is de meest genoemde vertrekreden (4 van de 12).")


def test_vertrekreden_zin_benoemt_gelijkspel():
    assert _vertrekreden_zin(TIE, 12) == (
        "Twee redenen zijn even vaak genoemd (4 van de 12 elk): Beter aanbod elders en Leiderschap / management.")


def test_vertrekreden_zin_leeg_zonder_redenen():
    assert _vertrekreden_zin([], 12) == ""


def test_vertrekreden_cel_gelijkspel():
    cel = _tekst(_vertrekreden_cell(TIE, 12))
    assert "4 van de 12" in cel and "even vaak" in cel


def test_cijfers_block_bouwt_een_sg_tabel():
    html = _p02_cijfers_block(["<td>a</td>", "", "<td>b</td>"])
    assert html.count("<td>") == 2 and 'class="sg' in html
    assert _p02_cijfers_block(["", ""]) == ""


def test_blok2_copy_bevat_geen_em_dash():
    stukken = [
        _blijfintentie_cell(3.9, STAY_KWETSBAAR), _blijfintentie_kopzin(3.9, STAY_KWETSBAAR),
        _respons_oordeel(39, 58), _respons_oordeel(45, 150), _respons_oordeel(45, 180),
        _respons_oordeel(8, 14), _respons_oordeel(39, None),
        _vertrekreden_zin(DIST, 12), _vertrekreden_zin(TIE, 12), _vertrekreden_cell(TIE, 12),
    ]
    for s in stukken:
        assert "—" not in s and "&#x2014;" not in s and "&mdash;" not in s

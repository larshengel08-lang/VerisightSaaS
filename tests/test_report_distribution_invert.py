"""Omgekeerde kleurschaal zonder de waarden te verdraaien (spec ronde 2 par. 7b).

De spreidingsstrook is health-georienteerd: rechts/hoog is teal "sterk". Bij
vertrekintentie is hoog juist slecht. Tot ronde 2 werd de waarde daarom
gespiegeld (11 - v), zodat de kleuren klopten. Gevolg: de rij erboven toonde
3.4 en de strook eronder 7.6, voor exact dezelfde vraag. Nu draait alleen de
kleurschaal om; de stippen en de gemiddelde-marker staan op hun echte waarde.
"""
import re

from backend.report_distribution import (
    ZONE_HIGH,
    ZONE_LOW,
    distribution_block,
    distribution_svg,
    score_distribution,
)


# Alle waarden onder ZONE_LOW: weinig vertrekgedachten. Gemiddelde 3.375 -> 3.4;
# gespiegeld zou dat 7.6 zijn (precies de bug).
LOW_TURNOVER = [2.0, 3.0, 3.0, 3.5, 3.5, 4.0, 4.0, 4.0, 2.5, 3.0, 3.5, 4.5]

_C_RED, _C_AMBER, _C_TEAL = "#C0392B", "#C17C00", "#3C8D8A"


def _cx_values(svg: str) -> list[str]:
    return re.findall(r'<circle cx="([^"]+)"', svg)


def _dots(svg: str) -> list[tuple[float, str]]:
    """(x-positie, kleur) per stip, op x gesorteerd.

    Tellen alleen is niet genoeg: bij een symmetrische verdeling levert een
    niet-omgedraaide schaal exact dezelfde aantallen rood en teal. De kleur moet
    aan de kant vastzitten.
    """
    pairs = re.findall(r'<circle cx="([^"]+)" cy="[^"]+" r="[^"]+" fill="([^"]+)"', svg)
    return sorted((float(x), c) for x, c in pairs)


# ── het getal ────────────────────────────────────────────────────────────────

def test_gemiddelde_is_de_echte_waarde_niet_de_gespiegelde():
    html = distribution_block(LOW_TURNOVER, invert_scale=True)
    mean = score_distribution(LOW_TURNOVER)["mean"]
    assert f"GEM {mean:.1f}" in html
    # De gespiegelde waarde mag nergens staan.
    assert f"GEM {11 - mean:.1f}" not in html


def test_rij_en_strook_tonen_hetzelfde_getal():
    # Dit is de bug: de rij toonde 3.4 en de strook 7.6.
    vals = LOW_TURNOVER
    rij = sum(vals) / len(vals)
    html = distribution_block(vals, invert_scale=True)
    assert f"GEM {round(rij, 2):.1f}" in html
    assert "GEM 7.6" not in html


def test_stippen_staan_op_dezelfde_x_als_zonder_inversie():
    # Alleen de kleurschaal draait; geen enkele stip verschuift.
    normaal = distribution_svg(LOW_TURNOVER)
    gedraaid = distribution_svg(LOW_TURNOVER, invert_scale=True)
    assert _cx_values(normaal) == _cx_values(gedraaid)
    assert _cx_values(gedraaid)  # niet per ongeluk twee lege lijsten vergelijken


# ── de kleuren en de tellingen ───────────────────────────────────────────────

def test_tellingen_noemen_vertrekgedachten_en_staan_aan_de_goede_kant():
    html = distribution_block(LOW_TURNOVER, invert_scale=True)
    # Hele fragmenten: label en kleur horen bij elkaar. Laag = weinig
    # vertrekgedachten = teal, hoog = veel vertrekgedachten = rood.
    assert f'<span style="color:{_C_TEAL};">Weinig vertrekgedachten 12</span>' in html
    assert f'<span style="color:{_C_AMBER};">Aandacht 0</span>' in html
    assert f'<span style="color:{_C_RED};">Veel vertrekgedachten 0</span>' in html
    # De health-woorden horen hier niet: 12 respondenten zonder vertrekgedachten
    # zijn niet "kwetsbaar".
    assert "Kwetsbaar" not in html
    assert "Sterk" not in html


def test_blok_geeft_de_inversie_door_aan_de_strook_zelf():
    # Zonder doorgifte draaien alleen de tellingnamen om en blijven de stippen
    # health-gekleurd: rode stippen onder het woord "weinig vertrekgedachten".
    html = distribution_block(LOW_TURNOVER, invert_scale=True)
    assert distribution_svg(LOW_TURNOVER, invert_scale=True) in html
    assert distribution_svg(LOW_TURNOVER) not in html


def test_stippen_kleuren_omgedraaid_op_de_zonegrenzen():
    """De kleur zit aan de kant vast, en de grenswaarden zelf liggen gepind.

    Precies op de grenzen: 4.9 valt in de laagste zone, 5.0 in het midden,
    6.4 nog in het midden, 6.5 in de hoogste zone.
    """
    assert (ZONE_LOW, ZONE_HIGH) == (5.0, 6.5)
    grenzen = [ZONE_LOW - 0.1, ZONE_LOW, ZONE_HIGH - 0.1, ZONE_HIGH]
    vals = grenzen * 3  # n=12, boven MIN_DISTRIBUTION_N
    # Zonder inversie: links rood, rechts teal. Met inversie precies andersom.
    kleuren = lambda svg: [c for _x, c in _dots(svg)]
    assert kleuren(distribution_svg(vals)) == (
        [_C_RED] * 3 + [_C_AMBER] * 6 + [_C_TEAL] * 3)
    assert kleuren(distribution_svg(vals, invert_scale=True)) == (
        [_C_TEAL] * 3 + [_C_AMBER] * 6 + [_C_RED] * 3)


def test_zonevlakken_wisselen_van_kant():
    gedraaid = distribution_svg(LOW_TURNOVER, invert_scale=True)
    # De linkerzone begint op x=0 en krijgt bij inversie de teal tint.
    assert '<rect x="0" y="6" width="' in gedraaid
    linker = gedraaid[gedraaid.index('<rect x="0" y="6"'):]
    linker = linker[:linker.index("/>") + 2]
    assert 'fill="rgba(60,141,138,0.10)"' in linker
    # En de onderrand van diezelfde linkerzone is teal, niet rood.
    assert f'height="2" fill="{_C_TEAL}"' in gedraaid
    assert gedraaid.index(f'height="2" fill="{_C_TEAL}"') < gedraaid.index(
        f'height="2" fill="{_C_RED}"')


# ── de normale schaal blijft precies zoals hij was ───────────────────────────

def test_normale_schaal_blijft_onveranderd():
    html = distribution_block([6.0] * 12)
    assert f'<span style="color:{_C_RED};">Kwetsbaar 0</span>' in html
    assert f'<span style="color:{_C_TEAL};">Sterk 0</span>' in html
    assert "vertrekgedachten" not in html


def test_default_is_de_normale_schaal():
    # Elke andere aanroeper (factorverdieping, raster, segment) rekent hierop.
    assert distribution_block([6.0] * 12) == distribution_block([6.0] * 12, invert_scale=False)
    assert distribution_svg([6.0] * 12) == distribution_svg([6.0] * 12, invert_scale=False)


def test_onder_de_drempel_nog_steeds_leeg():
    assert distribution_block([3.0] * 9, invert_scale=True) == ""


# ── de polarisatiezin blijft waar bij een omgekeerde as ──────────────────────

def test_polarisatiezin_beschrijft_zones_niet_goed_of_slecht():
    # 5 laag + 5 hoog: gepolariseerd. De zin praat over de laagste en hoogste
    # zone (de scores zelf), niet over sterk of kwetsbaar, en blijft daarmee
    # waar als de kleurschaal omdraait.
    vals = [2.0] * 5 + [8.0] * 5
    html = distribution_block(vals, invert_scale=True)
    assert ("<strong>Verdeeld beeld:</strong> 5 van de 10 respondenten scoren in de "
            "laagste zone, 5 in de hoogste.") in html
    for verboden in ("sterk", "kwetsbaar", "Sterk", "Kwetsbaar"):
        assert verboden not in html, verboden


def test_geen_em_dash_in_de_strookcopy():
    assert "—" not in distribution_block(LOW_TURNOVER, invert_scale=True)

"""Spreidingsweergave voor rapportscores (spec: 2026-07-11-rapport-spreiding-design.md).

Pure functies, geen DB. Zone-drempels zijn exact de _factor_label-drempels
(kwetsbaar < 5.0, aandacht < 6.5, sterk >= 6.5) - EEN bandensysteem rapportbreed.
"""
from __future__ import annotations

from backend.report_css import RAG_HIGH, RAG_LOW, RAG_MID

ZONE_LOW = 5.0   # < ZONE_LOW  -> kwetsbaar punt (laagste zone)
ZONE_HIGH = 6.5  # < ZONE_HIGH -> aandachtspunt; >= ZONE_HIGH -> relatief sterk

# Polarisatie: beide buitenzones >= 25% en samen >= 60% van de respondenten.
_POL_EACH = 0.25
_POL_COMBINED = 0.60


def score_distribution(values: list[float]) -> dict:
    """Aggregeer individuele scores (1-10) naar zones + polarisatie-signaal."""
    vals = [v for v in values if v is not None]
    if not vals:
        return {"zones": (0, 0, 0), "dots": [], "mean": None, "polarized": False}
    low = sum(1 for v in vals if v < ZONE_LOW)
    high = sum(1 for v in vals if v >= ZONE_HIGH)
    mid = len(vals) - low - high
    n = len(vals)
    polarized = (low / n >= _POL_EACH and high / n >= _POL_EACH
                 and (low + high) / n >= _POL_COMBINED)
    return {
        "zones": (low, mid, high),
        "dots": sorted(vals),
        "mean": round(sum(vals) / n, 2),
        "polarized": polarized,
    }


# De RAG-set komt uit report_css: één huisstijlbron. Eerder stonden de hexwaarden
# hier als kopie met een comment dat ze gelijk waren aan die van report_css. Sinds
# de signaalrijen in de behoudscontext hun kleur hier vandaan halen en de
# factorbalken op dezelfde kaart uit report_css, zou een huisstijlronde die twee
# uiteen laten lopen zonder dat een test dat merkt (spec ronde 2 par. 7b).
# Let op de naamdraai: een LAGE score is een HOOG risico, dus _C_LOW is RAG_HIGH.
_C_LOW, _C_MID, _C_HIGH = RAG_HIGH, RAG_MID, RAG_LOW


def _tint(hex_color: str, alpha: str = "0.10") -> str:
    """Doorschijnende zonevulling uit dezelfde hex, zodat er niets te synchroniseren valt."""
    r, g, b = (int(hex_color[i:i + 2], 16) for i in (1, 3, 5))
    return f"rgba({r},{g},{b},{alpha})"


_TRACK_BG = {"low": _tint(_C_LOW), "mid": _tint(_C_MID), "high": _tint(_C_HIGH)}

MIN_DISTRIBUTION_N = 10  # zelfde drempel als patroonanalyse

# Omgekeerde as (spec ronde 2 par. 7b): bij vertrekintentie is een hoge score
# slecht. De waarden blijven ongemoeid, alleen de kleur en de tellingnamen
# draaien om, zodat de strook hetzelfde getal toont als de rij erboven. Eerder
# werd de waarde zelf gespiegeld (11 - v): de kleuren klopten, maar de rij zei
# 3.4 en de strook 7.6 voor dezelfde vraag.
_ZONE_LABELS = ("Kwetsbaar", "Aandacht", "Sterk")
_ZONE_LABELS_INVERT = ("Weinig vertrekgedachten", "Aandacht", "Veel vertrekgedachten")


def _zone_ends(invert_scale: bool) -> tuple[str, str]:
    """(kleur van de laagste zone, kleur van de hoogste zone)."""
    return (_C_HIGH, _C_LOW) if invert_scale else (_C_LOW, _C_HIGH)


def shown(score: float | None) -> float | None:
    """De score zoals de lezer 'm ziet: op 1 decimaal, exact zoals _score_str formatteert.

    B15: labels en kleuren werden op de onafgeronde waarde berekend, terwijl de
    score afgerond getoond wordt. 6.55 / 6.47 / 6.55 toonden alle drie "6.5/10"
    maar kregen "Relatief sterk" / "Aandachtspunt" / "Relatief sterk", terwijl
    de methodiekpagina "relatief sterk (vanaf 6,5)" zegt. Elke band-helper die
    naast een getoonde score staat, vergelijkt daarom via deze functie. Bewust
    via de f-string (niet round()) zodat display en vergelijking nooit uiteenlopen.

    Staat in deze module en niet in report_html, omdat de afronding en de
    zonedrempels samen bepalen in welke band het getal valt dat de lezer ziet.
    report_html importeert hem als _shown (spec ronde 2 par. 7b).
    """
    if score is None:
        return None
    return float(f"{score:.1f}")


def _zone_color(v: float, invert_scale: bool) -> str:
    """De ladder: de enige plek in de codebase met deze drempels.

    Alles wat een score of een stip een RAG-kleur geeft, loopt hier langs:
    zone_color (naast een getoonde score), dot_color (een stip in de strook) en
    via zone_color ook _rag_color en _factor_color in report_html. Voorheen
    stond dezelfde ladder op drie plekken en kleurde de rij vertrekintentie
    bovendien via een eigen spiegeling (10 - v), waardoor bij vertrekintentie
    4.0 een amber rij boven een teal stip stond (spec ronde 2 par. 7b).
    """
    low, high = _zone_ends(invert_scale)
    if v < ZONE_LOW:
        return low
    if v < ZONE_HIGH:
        return _C_MID
    return high


def zone_color(score: float, invert_scale: bool = False) -> str:
    """Kleur voor een score die als getal naast de kleur staat. Rondt af (B15).

    Dit is de functie die je wilt voor een kleur naast een getoonde score: hij
    duidt hetzelfde getal als de lezer leest. Voor een stip in de strook is dat
    dot_color, die op de exacte waarde kleurt.
    """
    return _zone_color(shown(score), invert_scale)


def dot_color(value: float, invert_scale: bool = False) -> str:
    """Kleur van één stip: op de exacte waarde, bewust zonder afronding.

    Een stip staat op de x-positie van zijn eigen waarde en moet de kleur
    hebben van het zonevak waarin hij getekend is. Afronden zou een stip die
    net links van de 5,0-lijn staat de kleur van het middenvak geven: een
    kleur die zijn eigen positie tegenspreekt. Staat er een getal naast de
    kleur, gebruik dan zone_color (spec ronde 2 par. 7b).
    """
    return _zone_color(value, invert_scale)


# Inset zodat stippen (r=3.5) en de gemiddelde-marker op de schaaluitersten
# (score 1.0 / 10.0) niet half buiten de SVG-viewport vallen.
_X_PAD = 5


def _x(v: float, width: int) -> float:
    return round(_X_PAD + (v - 1.0) / 9.0 * (width - 2 * _X_PAD), 1)


def _jitter_offset(i: int, denom: int) -> int:
    """Deterministische, goed gespreide verticale jitter (bit-reversal / van der Corput).

    Simpele modulo-cycli (bv. (i*7) % 14) botsen op een klein aantal y-waarden
    zodra denom en de stap een gemeenschappelijke deler hebben (gcd(7,14)=7 ->
    slechts 2 waarden). Bit-reversal spreidt elke opeenvolgende i zo ver
    mogelijk uit over [0, denom), onafhankelijk van de factoren van denom, en
    blijft volledig deterministisch (geen random, geen seed).
    """
    denom = max(1, denom)
    bits = 16
    reversed_bits = 0
    for b in range(bits):
        if i & (1 << b):
            reversed_bits |= 1 << (bits - 1 - b)
    frac = reversed_bits / (1 << bits)
    return int(frac * denom) % denom


def distribution_svg(values: list[float], width: int = 440, height: int = 34,
                     dot_r: float = 3.5, label_size: int = 7,
                     invert_scale: bool = False) -> str:
    """Stippen-op-zone-as: zone-tinten, stippen, gemiddelde-marker.

    invert_scale: alleen de kleurschaal draait om (laag wordt teal, hoog rood).
    De x-posities, de stippen en de gemiddelde-marker blijven op hun echte
    waarde staan; zie de toelichting bij _ZONE_LABELS_INVERT.
    """
    dist = score_distribution(values)
    if dist["mean"] is None:
        return ""
    x_low, x_high = _x(ZONE_LOW, width), _x(ZONE_HIGH, width)
    band_y, band_h = 6, height - 12
    c_low, c_high = _zone_ends(invert_scale)
    bg_low, bg_high = ((_TRACK_BG["high"], _TRACK_BG["low"]) if invert_scale
                       else (_TRACK_BG["low"], _TRACK_BG["high"]))
    parts = [
        f'<svg width="{width}" height="{height}" xmlns="http://www.w3.org/2000/svg">',
        # zone-achtergronden + 2px onderrand per zone
        f'<rect x="0" y="{band_y}" width="{x_low}" height="{band_h}" fill="{bg_low}"/>',
        f'<rect x="{x_low}" y="{band_y}" width="{x_high - x_low}" height="{band_h}" fill="{_TRACK_BG["mid"]}"/>',
        f'<rect x="{x_high}" y="{band_y}" width="{width - x_high}" height="{band_h}" fill="{bg_high}"/>',
        f'<rect x="0" y="{band_y + band_h}" width="{x_low}" height="2" fill="{c_low}"/>',
        f'<rect x="{x_low}" y="{band_y + band_h}" width="{x_high - x_low}" height="2" fill="{_C_MID}"/>',
        f'<rect x="{x_high}" y="{band_y + band_h}" width="{width - x_high}" height="2" fill="{c_high}"/>',
    ]
    # stippen: deterministische verticale jitter op index (geen random)
    jitter_range = max(1, band_h - 8)
    for i, v in enumerate(dist["dots"]):
        cy = band_y + 5 + _jitter_offset(i, jitter_range)
        parts.append(f'<circle cx="{_x(v, width)}" cy="{cy}" r="{dot_r}" '
                     f'fill="{dot_color(v, invert_scale)}" fill-opacity="0.9"/>')
    # gemiddelde-marker: navy lijn + mono-label
    mx = _x(dist["mean"], width)
    parts.append(f'<rect x="{mx - 1}" y="0" width="2" height="{height}" fill="#0D1B2A"/>')
    anchor = "end" if mx > width - 40 else "start"
    tx = mx - 4 if anchor == "end" else mx + 4
    parts.append(f'<text x="{tx}" y="{max(5, label_size - 2)}" font-family="JetBrains Mono, monospace" '
                 f'font-size="{label_size}" fill="#0D1B2A" text-anchor="{anchor}">GEM {dist["mean"]:.1f}</text>')
    parts.append('</svg>')
    return "".join(parts)


def distribution_block(values: list[float], width: int = 440, height: int = 34,
                       dot_r: float = 3.5, label_size: int = 7,
                       invert_scale: bool = False) -> str:
    """SVG + zone-aantallen + (alleen bij polarisatie) duidingszin. Leeg onder n=10.

    width/height/dot_r/label_size: doorgifte naar distribution_svg voor het
    grote formaat op de eigen spreidingspagina (behoudscontext); defaults
    blijven het compacte formaat in de factorverdieping.

    invert_scale: draait de kleurschaal en de tellingnamen om voor een signaal
    waar hoog slecht is (vertrekintentie). De getoonde waarden veranderen niet.
    """
    vals = [v for v in values if v is not None]
    if len(vals) < MIN_DISTRIBUTION_N:
        return ""
    dist = score_distribution(vals)
    low, mid, high = dist["zones"]
    labels = _ZONE_LABELS_INVERT if invert_scale else _ZONE_LABELS
    c_low, c_high = _zone_ends(invert_scale)
    counts = (
        f'<div style="display:flex;justify-content:space-between;margin-top:3px;'
        f"font-family:'JetBrains Mono', monospace;font-size:8px;letter-spacing:0.08em;"
        f'text-transform:uppercase;">'
        f'<span style="color:{c_low};">{labels[0]} {low}</span>'
        f'<span style="color:{_C_MID};">{labels[1]} {mid}</span>'
        f'<span style="color:{c_high};">{labels[2]} {high}</span></div>'
    )
    sentence = ""
    if dist["polarized"]:
        n = len(vals)
        sentence = (
            f'<p style="font-size:10px;color:#0D1B2A;margin:6px 0 0;line-height:1.5;">'
            f'<strong>Verdeeld beeld:</strong> {low} van de {n} respondenten scoren in de '
            f'laagste zone, {high} in de hoogste. Dit gemiddelde beschrijft twee '
            f'verschillende ervaringen.</p>'
        )
    return (f'<div class="no-break" style="margin:10px 0 4px;">'
            f'{distribution_svg(vals, width=width, height=height, dot_r=dot_r, label_size=label_size, invert_scale=invert_scale)}'
            f'{counts}{sentence}</div>')

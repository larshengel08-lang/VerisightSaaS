"""Spreidingsweergave voor rapportscores (spec: 2026-07-11-rapport-spreiding-design.md).

Pure functies, geen DB. Zone-drempels zijn exact de _factor_label-drempels
(kwetsbaar < 5.0, aandacht < 6.5, sterk >= 6.5) - EEN bandensysteem rapportbreed.
"""
from __future__ import annotations

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


# RAG-kleuren: zelfde gedempte set als report_css (RAG_HIGH/MID/LOW).
_C_LOW, _C_MID, _C_HIGH = "#C0392B", "#C17C00", "#3C8D8A"
_TRACK_BG = {"low": "rgba(192,57,43,0.10)", "mid": "rgba(193,124,0,0.10)",
             "high": "rgba(60,141,138,0.10)"}

MIN_DISTRIBUTION_N = 10  # zelfde drempel als patroonanalyse


def _zone_color(v: float) -> str:
    if v < ZONE_LOW:
        return _C_LOW
    if v < ZONE_HIGH:
        return _C_MID
    return _C_HIGH


def _x(v: float, width: int) -> float:
    return round((v - 1.0) / 9.0 * width, 1)


def distribution_svg(values: list[float], width: int = 440, height: int = 34) -> str:
    """Stippen-op-zone-as: zone-tinten, stippen, gemiddelde-marker."""
    dist = score_distribution(values)
    if dist["mean"] is None:
        return ""
    x_low, x_high = _x(ZONE_LOW, width), _x(ZONE_HIGH, width)
    band_y, band_h = 6, height - 12
    parts = [
        f'<svg width="{width}" height="{height}" xmlns="http://www.w3.org/2000/svg">',
        # zone-achtergronden + 2px onderrand per zone
        f'<rect x="0" y="{band_y}" width="{x_low}" height="{band_h}" fill="{_TRACK_BG["low"]}"/>',
        f'<rect x="{x_low}" y="{band_y}" width="{x_high - x_low}" height="{band_h}" fill="{_TRACK_BG["mid"]}"/>',
        f'<rect x="{x_high}" y="{band_y}" width="{width - x_high}" height="{band_h}" fill="{_TRACK_BG["high"]}"/>',
        f'<rect x="0" y="{band_y + band_h}" width="{x_low}" height="2" fill="{_C_LOW}"/>',
        f'<rect x="{x_low}" y="{band_y + band_h}" width="{x_high - x_low}" height="2" fill="{_C_MID}"/>',
        f'<rect x="{x_high}" y="{band_y + band_h}" width="{width - x_high}" height="2" fill="{_C_HIGH}"/>',
    ]
    # stippen: deterministische verticale jitter op index (geen random)
    for i, v in enumerate(dist["dots"]):
        cy = band_y + 5 + (i * 7) % (band_h - 8)
        parts.append(f'<circle cx="{_x(v, width)}" cy="{cy}" r="3.5" '
                     f'fill="{_zone_color(v)}" fill-opacity="0.9"/>')
    # gemiddelde-marker: navy lijn + mono-label
    mx = _x(dist["mean"], width)
    parts.append(f'<rect x="{mx - 1}" y="0" width="2" height="{height}" fill="#0D1B2A"/>')
    anchor = "end" if mx > width - 40 else "start"
    tx = mx - 4 if anchor == "end" else mx + 4
    parts.append(f'<text x="{tx}" y="5" font-family="JetBrains Mono, monospace" '
                 f'font-size="7" fill="#0D1B2A" text-anchor="{anchor}">GEM {dist["mean"]:.1f}</text>')
    parts.append('</svg>')
    return "".join(parts)


def distribution_block(values: list[float]) -> str:
    """SVG + zone-aantallen + (alleen bij polarisatie) duidingszin. Leeg onder n=10."""
    vals = [v for v in values if v is not None]
    if len(vals) < MIN_DISTRIBUTION_N:
        return ""
    dist = score_distribution(vals)
    low, mid, high = dist["zones"]
    counts = (
        f'<div style="display:flex;justify-content:space-between;margin-top:3px;'
        f"font-family:'JetBrains Mono', monospace;font-size:8px;letter-spacing:0.08em;"
        f'text-transform:uppercase;">'
        f'<span style="color:{_C_LOW};">Kwetsbaar {low}</span>'
        f'<span style="color:{_C_MID};">Aandacht {mid}</span>'
        f'<span style="color:{_C_HIGH};">Sterk {high}</span></div>'
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
            f'{distribution_svg(vals)}{counts}{sentence}</div>')

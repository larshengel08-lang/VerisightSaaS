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

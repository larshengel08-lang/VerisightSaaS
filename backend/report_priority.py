"""Prioriteringsraster: deterministische factorrangorde voor de gespreksagenda.

Spec: docs/superpowers/specs/2026-07-18-prioriteringsraster-gespreksagenda-design.md
Pure module: geen I/O, geen rendering. De sort-key is implementatie en wordt
nooit gerenderd (geen composietcijfer op de pagina).
"""
from __future__ import annotations

from typing import Any

from backend.products.shared.deepening import agenda_enrichment
from backend.report_distribution import MIN_DISTRIBUTION_N, ZONE_LOW
from backend.scoring_config import ORG_FACTOR_KEYS

# Gelijkspel-marge, vergelijking STRIKT kleiner dan (spec par. 3.4):
# 5.1 vs 5.4 is exact 0.3 verschil en is dus geen gelijkspel.
PRIORITY_TIE_MARGIN = 0.3

# Spreidingsvlag: aandeel respondenten met factorscore < ZONE_LOW (5.0, de
# bestaande kwetsbaar-grens) is >= deze share, EN n >= MIN_DISTRIBUTION_N.
# Enige echt nieuwe drempel in dit ontwerp; wijziging vereist een spec-update.
SPREAD_FLAG_MIN_SHARE = 0.30

# Exit: gewicht per vertrekreden-vermelding (exact de bestaande
# _select_priority_factors-formule uit report_html.py).
EXIT_REASON_WEIGHT = 0.4

# Celstaten verdiepingskolom (spec par. 6): vaste copy, klantentaal.
# Staat 1 heeft een dynamische tekst (telling + optietekst) en staat niet hier.
CELL_NO_MAJORITY = "geen toelichting gekozen door een duidelijke meerderheid"
CELL_TOO_FEW = "te weinig beantwoorders voor duiding"
CELL_CAP_REACHED = "niet aangeboden: maximum aantal verdiepingen per respondent bereikt"
CELL_NOT_TRIGGERED = "geen verdieping aangeboden: score boven de drempel"


def _deepening_state(agg: dict[str, Any] | None, scan_type: str,
                     fk: str) -> tuple[int, tuple[str, int, int] | None]:
    """Celstaat 1-5 (spec par. 6) + topkeuze bij staat 1.

    Staat 0 = geen deepening-data voor deze factor (campagne-gate uit of
    factor onbekend in de aggregatie).
    Amendement planreview: staat 2 vereist answered >= 8; bij 5-7 kan 'geen
    duidelijke meerderheid' feitelijk onwaar zijn (bv. 5 van 6 kozen hetzelfde).
    """
    if not agg:
        return 0, None
    enr = agenda_enrichment(agg, scan_type, fk)
    if enr is not None:
        return 1, (enr["option_key"], enr["count"], enr["answered"])
    if agg.get("answered", 0) >= 8:
        return 2, None
    if agg.get("offered", 0) > 0:
        return 3, None
    if agg.get("triggered", 0) > 0:
        return 4, None
    return 5, None


def _spread(scores: list[float]) -> tuple[int, int, bool]:
    """(n, aantal onder ZONE_LOW, vlag). Vlag bestaat alleen vanaf n >= 10:
    de tiebreak gebruikt uitsluitend wat de pagina toont (zichtbaarheids-
    invariant, spec par. 3)."""
    vals = [v for v in scores if v is not None]
    n = len(vals)
    below = sum(1 for v in vals if v < ZONE_LOW)
    flag = n >= MIN_DISTRIBUTION_N and (below / n) >= SPREAD_FLAG_MIN_SHARE
    return n, below, flag


def rank_factors(scan_type: str,
                 factor_avgs: dict[str, float | None],
                 factor_resp_scores: dict[str, list[float]],
                 deepening_agg: dict[str, Any],
                 exit_reason_counts: dict[str, int] | None = None,
                 labels: dict[str, str] | None = None) -> list[dict[str, Any]]:
    """Deterministische rangorde over de organisatiefactoren (spec par. 3).

    - SDT-filter als eerste stap (bugfix 2026-07-13).
    - base = score, bij exit verminderd met EXIT_REASON_WEIGHT per vertrekreden.
    - Vlaggen (spreiding, verdieping) flippen alleen binnen PRIORITY_TIE_MARGIN
      en stapelen niet: een vlag geeft dezelfde bump als twee.
    - Slotvolgorde alfabetisch op canoniek label: twee runs geven altijd
      dezelfde volgorde.
    """
    labels = labels or {}
    reasons = exit_reason_counts or {}
    rows: list[dict[str, Any]] = []
    for fk in ORG_FACTOR_KEYS:
        score = factor_avgs.get(fk)
        if score is None:
            continue
        base = score - EXIT_REASON_WEIGHT * reasons.get(fk, 0) if scan_type == "exit" else score
        n, below, spread_flag = _spread(factor_resp_scores.get(fk) or [])
        state, top = _deepening_state((deepening_agg or {}).get(fk), scan_type, fk)
        deep_flag = state == 1
        rows.append({
            "key": fk,
            "label": labels.get(fk, fk),
            "score": score,
            "base": base,
            "spread_n": n,
            "spread_below": below,
            "spread_flag": spread_flag,
            "deepening_state": state,
            "deepening_top": top,
            "flags": int(spread_flag) + int(deep_flag),
        })
    rows.sort(key=lambda r: (
        r["base"] - PRIORITY_TIE_MARGIN if r["flags"] else r["base"],
        r["base"],
        -r["flags"],
        r["label"],
    ))
    for i, r in enumerate(rows):
        r["agenda_role"] = "startpunt" if i == 0 else ("tweede" if i == 1 else None)
        prev = rows[i - 1] if i else None
        r["near_tie_with"] = (
            prev["key"]
            if prev is not None
            and abs(r["base"] - prev["base"]) < PRIORITY_TIE_MARGIN
            and r["spread_flag"] == prev["spread_flag"]
            and (r["deepening_state"] == 1) == (prev["deepening_state"] == 1)
            else None)
    return rows

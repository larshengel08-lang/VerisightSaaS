"""Prioriteringsraster: deterministische factorrangorde voor de gespreksagenda.

Spec: docs/superpowers/specs/2026-07-18-prioriteringsraster-gespreksagenda-design.md
Pure module: geen I/O, geen rendering. De sort-key is implementatie en wordt
nooit gerenderd (geen composietcijfer op de pagina).
"""
from __future__ import annotations

from typing import Any

from backend.products.shared.deepening import DIRECTION_MIN_N, agenda_enrichment
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


def _change_demand(agg: dict[str, Any] | None) -> tuple[int, int | None]:
    """(beantwoorders, aantal dat om verandering vroeg) voor een factor.

    Het tweede getal is None zodra er minder dan DIRECTION_MIN_N beantwoorders
    zijn: onder die vloer telt het signaal nergens mee, net als in het
    richtingblok in het rapport. Geen nieuwe drempel dus. Er is per factor
    precies een *_none-optie (contentgarantie in deepening.py), dus de aftrek
    raakt gegarandeerd een telling.
    """
    if not agg:
        return 0, None
    answered = agg["answered"]
    counts: dict[str, int] = agg.get("counts") or {}
    if answered < DIRECTION_MIN_N:
        return answered, None
    none_key = next((k for k in sorted(counts) if k.endswith("_none")), None)
    return answered, sum(counts.values()) - (counts[none_key] if none_key else 0)


def _tie_groups(rows: list[dict[str, Any]]) -> list[list[dict[str, Any]]]:
    """Deel de op base gesorteerde rijen in gelijkspel-groepen.

    Een rij hoort bij de lopende groep zolang zijn base minder dan
    PRIORITY_TIE_MARGIN boven het anker (de laagste base van die groep) ligt.
    Strikt kleiner dan, consistent met near_tie_with: exact 0,3 is geen
    gelijkspel.
    """
    groups: list[list[dict[str, Any]]] = []
    for r in rows:
        if groups and r["base"] - groups[-1][0]["base"] < PRIORITY_TIE_MARGIN:
            groups[-1].append(r)
        else:
            groups.append([r])
    return groups


def _tie_break_marking(row: dict[str, Any],
                       below_rows: list[dict[str, Any]]) -> tuple[str | None, str | None]:
    """Welk signaal tilde deze rij boven een lager scorende rij, plus de zin erbij.

    Twee soorten: een tie-break binnen de gelijkspel-groep (richting, spreiding,
    verdieping) en bij Loep Vertrek de vertrekreden-weging, die al in base zit
    en dus buiten de groepslogica om werkt. Geen van beide = (None, None); de
    rij staat dan gewoon op zijn score en heeft geen uitleg nodig.
    """
    passed = [o for o in below_rows if o["base"] < row["base"]]
    if passed:
        other = min(passed, key=lambda o: o["base"])
        lbl = other["label"]
        if (row["_dir_decided"] and other["_dir_decided"]
                and row["direction_change"] is not None
                and other["direction_change"] is not None
                and row["direction_change"] > other["direction_change"]):
            return "direction", (
                f"Staat hoger dan {lbl} omdat hier meer mensen om verandering vragen "
                f"({row['direction_change']} van de {row['direction_answered']} tegen "
                f"{other['direction_change']} van de {other['direction_answered']}).")
        if row["spread_flag"] and not other["spread_flag"]:
            return "spread", (
                f"Staat hoger dan {lbl} omdat de antwoorden hier verder uiteenlopen "
                f"({row['spread_below']} van de {row['spread_n']} onder de 5).")
        if row["deepening_state"] == 1 and other["deepening_state"] != 1:
            return "deepening", (
                f"Staat hoger dan {lbl} omdat hier een gedeelde toelichting uit de "
                f"verdieping ligt.")
        return None, None
    passed_score = [o for o in below_rows if o["score"] < row["score"]]
    if passed_score and row["exit_reason_n"]:
        other = min(passed_score, key=lambda o: o["score"])
        return "exit_reason", (
            f"Staat hoger dan {other['label']} omdat dit vaker als vertrekreden is "
            f"genoemd ({row['exit_reason_n']} keer tegen {other['exit_reason_n']}).")
    return None, None


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
                 labels: dict[str, str] | None = None,
                 direction_agg: dict[str, Any] | None = None) -> list[dict[str, Any]]:
    """Deterministische rangorde over de organisatiefactoren (spec par. 3,
    uitgebreid in stresstest ronde 2 par. 1).

    - SDT-filter als eerste stap (bugfix 2026-07-13).
    - base = score, bij exit verminderd met EXIT_REASON_WEIGHT per vertrekreden.
    - Binnen een gelijkspel-groep (alle rijen binnen PRIORITY_TIE_MARGIN van de
      laagste base van die groep) beslist achtereenvolgens: vraag om
      verandering, spreidingsvlag, verdiepingsvlag, base, label.
    - De richting-tie-break telt alleen als elke rij in de groep een geldig
      aantal beantwoorders heeft (>= DIRECTION_MIN_N). Groepsbreed en niet
      paarsgewijs, omdat een paarsgewijze regel niet transitief is en het
      sorteerresultaat dan van de invoervolgorde zou afhangen.
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
        reason_n = reasons.get(fk, 0) if scan_type == "exit" else 0
        base = score - EXIT_REASON_WEIGHT * reason_n if scan_type == "exit" else score
        n, below, spread_flag = _spread(factor_resp_scores.get(fk) or [])
        state, top = _deepening_state((deepening_agg or {}).get(fk), scan_type, fk)
        deep_flag = state == 1
        dir_answered, dir_change = _change_demand((direction_agg or {}).get(fk))
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
            "exit_reason_n": reason_n,
            "direction_answered": dir_answered,
            "direction_change": dir_change,
        })

    rows.sort(key=lambda r: (r["base"], r["label"]))
    ordered: list[dict[str, Any]] = []
    for group in _tie_groups(rows):
        use_direction = (len(group) > 1
                         and all(r["direction_change"] is not None for r in group))
        group.sort(key=lambda r: (
            -(r["direction_change"] or 0) if use_direction else 0,
            -int(r["spread_flag"]),
            -int(r["deepening_state"] == 1),
            r["base"],
            r["label"],
        ))
        for r in group:
            r["_dir_decided"] = use_direction
        ordered.extend(group)
    rows = ordered

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
        kind, note = _tie_break_marking(r, rows[i + 1:])
        r["tie_break_kind"] = kind
        r["tie_break_note"] = note
    for r in rows:
        del r["_dir_decided"]
    return rows

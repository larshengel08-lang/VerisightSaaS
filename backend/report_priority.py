"""Prioriteringsraster: deterministische factorrangorde voor de gespreksagenda.

Spec: docs/superpowers/specs/2026-07-18-prioriteringsraster-gespreksagenda-design.md
Pure module: geen I/O, geen rendering. De sort-key is implementatie en wordt
nooit gerenderd (geen composietcijfer op de pagina).
"""
from __future__ import annotations

from typing import Any

from backend.products.shared.deepening import (
    DIRECTION_MIN_N,
    TOP_CHOICE_MIN_LEAD,
    agenda_enrichment,
)
from backend.report_distribution import MIN_DISTRIBUTION_N, ZONE_LOW
from backend.scoring_config import ORG_FACTOR_KEYS

# Gelijkspel-marge, vergelijking STRIKT kleiner dan (spec par. 3.4):
# 5.1 vs 5.4 is exact 0.3 verschil en is dus geen gelijkspel.
PRIORITY_TIE_MARGIN = 0.3

# Vlak profiel (spec ronde 2 par. 2.1): het verschil tussen de hoogst en laagst
# scorende werkfactor is STRIKT kleiner dan dit. Een punt op tien is in een zin
# uit te leggen ("binnen een punt van elkaar") en ligt ruim boven de ruis die
# een enkel antwoord in een groep van 45 veroorzaakt. De constante hoort hier
# omdat het een rangorde-eigenschap is; de functie die hem gebruikt staat in
# report_html.py, want die heeft _shown en de factorlabels nodig.
FLAT_PROFILE_SPAN = 1.0

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


def _direction_counts(agg: dict[str, Any] | None) -> tuple[int, int | None]:
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
    counts: dict[str, int] = agg["counts"]
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


def _change_share(row: dict[str, Any]) -> float:
    """Aandeel van de beantwoorders dat om verandering vroeg. Alleen aanroepen
    voor rijen met een geldig aantal; die hebben er minstens DIRECTION_MIN_N."""
    return row["direction_change"] / row["direction_answered"]


# De signalen in de sorteersleutel, op de plek waar ze in die sleutel staan.
# _decision leest de index van het eerste verschil terug en weet daarmee precies
# welk signaal de volgorde bepaalde; dat hoeft dus niet gereconstrueerd te worden.
_KEY_SIGNALS = ("direction", "spread", "deepening")


def _sort_key(row: dict[str, Any],
              winner: dict[str, Any] | None) -> tuple[Any, ...]:
    """De volgorde binnen een gelijkspel-groep: vraag om verandering, spreiding,
    verdieping, base, label. Een sleutel en geen paarsgewijze vergelijking, dus
    altijd een totale orde: transitief en onafhankelijk van de invoervolgorde."""
    return (0 if row is winner else 1,
            -int(row["spread_flag"]),
            -int(row["deepening_state"] == 1),
            row["base"],
            row["label"])


def _direction_winner(group: list[dict[str, Any]]) -> dict[str, Any] | None:
    """De ene rij die de gelijkspel-groep wint op de vraag om verandering.

    Vier voorwaarden, alle vier bedoeld om te voorkomen dat de markeringsregel
    wordt tegengesproken door de getallen die er zelf in staan:

    1. Er zijn minstens twee rijen met een geldig aantal (>= DIRECTION_MIN_N
       beantwoorders). Zonder tweede rij is er niets om mee te vergelijken, en
       "hier vragen meer mensen om verandering" is dan een lege bewering.
    2. De hoogste rij ligt minstens TOP_CHOICE_MIN_LEAD boven de hoogste andere
       geldige rij. Een verschil van 1 is ruis.
    3. Het aandeel van de winnaar is niet lager dan dat van welke andere geldige
       rij ook. Spec par. 1.2 maakt het aantal leidend, maar "27 van de 35 tegen
       17 van de 19" leest als onwaar zolang 77 procent onder 89 procent ligt.
    4. Staat er een rij met een lagere of gelijke base in de groep, dan heeft
       minstens een daarvan zelf een geldig aantal. Anders verschuift de
       volgorde wel, maar is er geen rij te noemen waartegen het verschil
       zichtbaar is (bevinding K1). Passeert de winnaar niemand, dan speelt dat
       niet en houdt het signaal hem gewoon boven een spreidings- of
       verdiepingsvlag, zoals spec par. 1.2 voorschrijft.
    """
    valid = [r for r in group if r["direction_change"] is not None]
    if len(valid) < 2:
        return None
    top, *rest = sorted(valid, key=lambda r: (-r["direction_change"], r["label"]))
    if top["direction_change"] - rest[0]["direction_change"] < TOP_CHOICE_MIN_LEAD:
        return None
    if _change_share(top) < max(_change_share(o) for o in rest):
        return None
    # De rijen waartegen de markering straks geschreven wordt: alles in de groep
    # met een lagere of gelijke base. Is er geen enkele met een telling, dan
    # verschuift de volgorde wel maar valt er niets te noemen, en dat mag niet.
    # Zijn er er helemaal geen, dan passeert de winnaar niets en is er ook niets
    # uit te leggen; het signaal mag hem dan gewoon boven een vlag houden.
    lower = [o for o in group if o is not top and o["base"] <= top["base"]]
    if lower and not any(o["direction_change"] is not None for o in lower):
        return None
    return top


def _first_diff(a: tuple[Any, ...], b: tuple[Any, ...]) -> int | None:
    return next((i for i, (x, y) in enumerate(zip(a, b)) if x != y), None)


def _decision(row: dict[str, Any], below_rows: list[dict[str, Any]],
              keys: dict[str, tuple[Any, ...]]) -> tuple[str, dict[str, Any]] | None:
    """Welk signaal zette deze rij boven een rij met een lagere of gelijke stand,
    en tegenover welke rij; None als de rij gewoon op zijn plek staat.

    De sorteersleutel is de bron: de index van het eerste verschil zegt welk
    signaal besliste. Daardoor kan een flip niet zonder verklaring blijven, en
    kan de verklaring ook niet afwijken van wat de sorteerder deed. Van de
    kandidaten wint het vroegste signaal, en daarbinnen de laagste base.

    Uitzondering: de vertrekreden-weging van Loep Vertrek zit al in base en dus
    niet in de sleutel. Die komt alleen aan bod als de sleutel niets besliste.
    """
    passed = [o for o in below_rows if o["base"] <= row["base"]]
    best: tuple[tuple[int, float, str], dict[str, Any]] | None = None
    for other in passed:
        idx = _first_diff(keys[row["key"]], keys[other["key"]])
        if idx is None or idx >= len(_KEY_SIGNALS):
            # Gelijk tot en met de verdiepingsvlag: base of het label besliste,
            # en dat is geen flip die uitleg nodig heeft.
            continue
        if idx == 0 and other["direction_change"] is None:
            # Geen telling om te noemen. _direction_winner garandeert dat er een
            # gepasseerde rij is die er wel een heeft.
            continue
        rank = (idx, other["base"], other["label"])
        if best is None or rank < best[0]:
            best = (rank, other)
    if best is not None:
        return _KEY_SIGNALS[best[0][0]], best[1]
    # Vertrekreden-weging: alleen tegenover een rij die er ook echt minder heeft,
    # anders zou de zin "vaker genoemd (1 keer tegen 1)" opleveren (bevinding K2).
    # Die vergelijking kan sinds voorwaarde 4 in _direction_winner niet meer
    # vuren: deze tak wordt alleen bereikt als de sorteersleutel niets besliste,
    # en dan staat de base-volgorde nog ongeschonden, waardoor een lager
    # scorende rij lager in base altijd minder vermeldingen heeft. Vangnet
    # bewust laten staan: valt die invariant ooit weg, dan is dit het verschil
    # tussen een kloppende zin en een onware.
    weighed = [o for o in below_rows if o["score"] < row["score"]
               and o["exit_reason_n"] < row["exit_reason_n"]]
    if weighed:
        return "exit_reason", min(weighed, key=lambda o: (o["score"], o["label"]))
    return None


def _tie_break_note(row: dict[str, Any], other: dict[str, Any], kind: str) -> str:
    """De zin onder de rij. Formuleert alleen; de beslissing komt uit _decision."""
    lbl = other["label"]
    if kind == "direction":
        return (f"Staat hoger dan {lbl} omdat hier meer mensen om verandering "
                f"vragen ({row['direction_change']} van de "
                f"{row['direction_answered']} tegen {other['direction_change']} "
                f"van de {other['direction_answered']}).")
    if kind == "spread":
        return (f"Staat hoger dan {lbl} omdat de antwoorden hier verder "
                f"uiteenlopen ({row['spread_below']} van de {row['spread_n']} "
                "onder de 5).")
    if kind == "deepening":
        return (f"Staat hoger dan {lbl} omdat hier een gedeelde toelichting uit "
                "de verdieping ligt.")
    if kind == "exit_reason":
        return (f"Staat hoger dan {lbl} omdat dit vaker als vertrekreden is "
                f"genoemd ({row['exit_reason_n']} keer tegen "
                f"{other['exit_reason_n']}).")
    raise ValueError(f"onbekend tie-break-signaal {kind!r}")


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
    - De vraag om verandering zet alleen de hoogste rij van de groep vooruit,
      onder de vier voorwaarden in _direction_winner. Een rij met te weinig
      beantwoorders doet daar niet aan mee: ze telt niet als vergelijkingsrij,
      maar blokkeert het signaal ook niet voor de rest van de groep.
    - Elke rij draagt achteraf decided_by: welk signaal hem boven een lager of
      gelijk scorende rij zette, en tegenover welke rij. Dat komt uit dezelfde
      sorteersleutel, dus de uitleg kan niet afwijken van de volgorde.
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
        dir_answered, dir_change = _direction_counts((direction_agg or {}).get(fk))
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
            "exit_reason_n": reason_n,
            "direction_answered": dir_answered,
            "direction_change": dir_change,
        })

    rows.sort(key=lambda r: (r["base"], r["label"]))
    ordered: list[dict[str, Any]] = []
    keys: dict[str, tuple[Any, ...]] = {}
    for group in _tie_groups(rows):
        winner = _direction_winner(group)
        for r in group:
            keys[r["key"]] = _sort_key(r, winner)
        group.sort(key=lambda r: keys[r["key"]])
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
        decided = _decision(r, rows[i + 1:], keys)
        # decided_by legt vast wat de sorteerder besloot: het signaal en de rij
        # waartegen dat zichtbaar is. De markeringsregel is daar de formulering
        # van, geen tweede redenering.
        r["decided_by"] = ({"kind": decided[0], "other": decided[1]["key"]}
                           if decided else None)
        r["tie_break_note"] = (_tie_break_note(r, decided[1], decided[0])
                               if decided else None)
    return rows

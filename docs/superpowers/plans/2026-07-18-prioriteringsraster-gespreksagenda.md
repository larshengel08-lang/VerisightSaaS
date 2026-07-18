# Prioriteringsraster Gespreksagenda Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** De gespreksagenda-pagina van Loep Vertrek + Loep Behoud herbouwen tot een prioriteringsraster: alle 6 organisatiefactoren gesorteerd op navolgbare signalen (score, spreiding, verdieping), zonder composietcijfer, met de agenda-elementen geintegreerd.

**Architecture:** Nieuwe pure module `backend/report_priority.py` (constanten + `rank_factors` + celstaat-logica, geen I/O) + nieuwe renderhelper `_prioriteringsraster` in `backend/report_html.py` die `_eerste_managementspoor` vervangt voor exit en retention (onboarding behoudt de oude helper, tijdelijk). De rangorde vervangt ook `_select_priority_factors` en p.02's `top_fkeys[0]`-primair voor die twee scans: een rangorde per rapport.

**Tech Stack:** Python (FastAPI-backend rapportlaag), pytest, WeasyPrint (via Docker `ghcr.io/weasyprint/weasyprint`). Geen DB-wijziging, geen frontend.

**Spec:** `docs/superpowers/specs/2026-07-18-prioriteringsraster-gespreksagenda-design.md` — lees die eerst volledig. De spec is bindend; bij twijfel wint de spec.

**Harde randvoorwaarden uit de spec (samengevat):**
- Gelijkspel-marge strikt `<` 0.3 (5.1 vs 5.4 is exact 0.3 en dus GEEN gelijkspel).
- Vlaggen flippen alleen binnen de marge; stapelen niet.
- Zichtbaarheids-invariant: tiebreak-inputs volgen dezelfde staffels als de weergave.
- Canonieke labels via `_fl`; scores via `_score_str`; GEEN em-dashes in nieuwe copy.
- Alle klantzichtbare copy is letterlijk gepind (zie constanten in Taak 1/5).
- SDT-dimensies nooit in het raster (bugfix 2026-07-13 verhuist mee).

**Spec-amendement (goedgekeurd bij planreview):** celstaat 2 vereist `answered >= 8`
(niet 5): bij 5-7 beantwoorders kan "geen duidelijke meerderheid" feitelijk onwaar zijn
(bijv. 5 van 6 kozen hetzelfde maar de verrijkingsstaffel haalt niet door n<8). 5-7
beantwoorders valt dus onder celstaat 3 ("te weinig beantwoorders voor duiding") — dat is
altijd waar.

**Werkwijze:** git worktree op basis van lokale `main`. Elke taak eindigt met een commit.
Baseline vooraf vastleggen (Taak 0). Volledige suite draait met:
`.venv/Scripts/python.exe -m pytest tests/ -q` vanuit de repo-root `Verisight/`.

---

### Taak 0: Baseline vastleggen

**Files:** geen wijzigingen.

- [ ] **Step 1: Draai de volledige suite en bewaar de faalset**

Run (vanuit `Verisight/`):
```bash
.venv/Scripts/python.exe -m pytest tests/ -q 2>&1 | grep -E "^(FAILED|ERROR)" | sort > /tmp/baseline_failures.txt
.venv/Scripts/python.exe -m pytest tests/ -q 2>&1 | tail -3
```
Expected: ~25 failed (pre-existente baseline). `/tmp/baseline_failures.txt` is de referentie: aan het eind van dit plan moet de faalset hier byte-identiek aan zijn (na de bewuste lockstep-updates in Taak 6/7 kunnen testnamen verdwijnen die wij zelf hebben bijgewerkt; er mag NIETS nieuws bij komen).

---

### Taak 1: `backend/report_priority.py` — kern-rangorde

**Files:**
- Create: `backend/report_priority.py`
- Test: `tests/test_report_priority.py`

- [ ] **Step 1: Schrijf de failing tests voor de kernvolgorde**

Maak `tests/test_report_priority.py`:

```python
"""Tests voor rank_factors (spec 2026-07-18 par. 3) — pure rangorde-logica."""
import pytest

from backend.report_priority import (
    PRIORITY_TIE_MARGIN,
    SPREAD_FLAG_MIN_SHARE,
    rank_factors,
)

# Handige defaults: geen spreiding-data, geen deepening, geen exit-redenen.
def _rank(scan_type, avgs, resp=None, deep=None, reasons=None, labels=None):
    return rank_factors(scan_type, avgs, resp or {}, deep or {},
                        exit_reason_counts=reasons, labels=labels or {})


def test_basic_order_is_score_ascending():
    avgs = {"growth": 5.1, "workload": 6.2, "leadership": 7.0}
    keys = [r["key"] for r in _rank("retention", avgs)]
    assert keys == ["growth", "workload", "leadership"]


def test_sdt_dimensions_never_in_raster():
    # Bugfix 2026-07-13: factor_averages bevat ook SDT-dimensies; autonomy heeft
    # hier de laagste score en mag toch nooit verschijnen.
    avgs = {"autonomy": 2.0, "competence": 2.5, "relatedness": 3.0,
            "growth": 5.1, "workload": 6.2}
    keys = [r["key"] for r in _rank("retention", avgs)]
    assert keys == ["growth", "workload"]


def test_exit_reason_weight_shifts_base():
    # Bestaande formule: base = score - 0.4 * vertrekreden-count.
    avgs = {"growth": 5.0, "workload": 5.5}
    rows = _rank("exit", avgs, reasons={"workload": 2})  # workload base = 4.7
    assert [r["key"] for r in rows] == ["workload", "growth"]
    assert rows[0]["base"] == pytest.approx(4.7)
    assert rows[0]["score"] == pytest.approx(5.5)  # getoonde score blijft onbewerkt


def test_retention_ignores_exit_reasons():
    avgs = {"growth": 5.0, "workload": 5.5}
    rows = _rank("retention", avgs, reasons={"workload": 5})
    assert [r["key"] for r in rows] == ["growth", "workload"]


def test_agenda_roles_top2():
    avgs = {"growth": 5.1, "workload": 5.9, "leadership": 7.0}
    rows = _rank("retention", avgs)
    assert rows[0]["agenda_role"] == "startpunt"
    assert rows[1]["agenda_role"] == "tweede"
    assert rows[2]["agenda_role"] is None


def test_deterministic_alphabetical_final_tiebreak():
    # Identieke scores, geen vlaggen: alfabetisch op label, en stabiel over runs.
    avgs = {"culture": 6.0, "workload": 6.0}
    labels = {"culture": "Cultuur en psychologische veiligheid",
              "workload": "Werkdruk en herstelruimte"}
    for _ in range(3):
        rows = _rank("retention", avgs, labels=labels)
        assert [r["key"] for r in rows] == ["culture", "workload"]
```

- [ ] **Step 2: Run de tests, verwacht ImportError**

Run: `.venv/Scripts/python.exe -m pytest tests/test_report_priority.py -v`
Expected: FAIL/ERROR met `ModuleNotFoundError: No module named 'backend.report_priority'`

- [ ] **Step 3: Schrijf de module met de kernvolgorde**

Maak `backend/report_priority.py`:

```python
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
```

- [ ] **Step 4: Run de tests, verwacht PASS**

Run: `.venv/Scripts/python.exe -m pytest tests/test_report_priority.py -v`
Expected: 6 passed

- [ ] **Step 5: Commit**

```bash
git add backend/report_priority.py tests/test_report_priority.py
git commit -m "feat(raster): rank_factors kernvolgorde + SDT-guard + exit-gewicht"
```

---

### Taak 2: Vlaggen, marge-mechanica en gelijkspel-label

**Files:**
- Modify: `backend/report_priority.py` (alleen als tests iets blootleggen; de implementatie uit Taak 1 zou dit al moeten dekken)
- Test: `tests/test_report_priority.py` (uitbreiden)

- [ ] **Step 1: Schrijf de failing tests voor vlag- en gelijkspelgedrag**

Voeg toe aan `tests/test_report_priority.py`:

```python
# ── Spreidingsvlag-gates ─────────────────────────────────────────────────────

def _scores(n, below):
    """n respondentscores waarvan `below` onder de 5.0."""
    return [4.0] * below + [7.0] * (n - below)


def test_spread_flag_requires_n10_and_share():
    avgs = {"growth": 6.0}
    # n=9, 5 onder de 5 (55%): vlag bestaat NIET onder MIN_DISTRIBUTION_N.
    rows = _rank("retention", avgs, resp={"growth": _scores(9, 5)})
    assert rows[0]["spread_flag"] is False
    # n=10, 3 onder de 5 (30%): precies op de share-drempel -> vlag.
    rows = _rank("retention", avgs, resp={"growth": _scores(10, 3)})
    assert rows[0]["spread_flag"] is True
    # n=10, 2 onder de 5 (20%): geen vlag.
    rows = _rank("retention", avgs, resp={"growth": _scores(10, 2)})
    assert rows[0]["spread_flag"] is False


# ── Verdiepingsvlag = exact agenda_enrichment ────────────────────────────────

def _agg(answered=0, offered=0, triggered=0, counts=None):
    return {"triggered": triggered, "offered": offered, "answered": answered,
            "skipped": 0, "primary_counts": counts or {}, "secondary_counts": {},
            "direction_offered": 0, "direction_answered": 0,
            "direction_skipped": 0, "direction_counts": {}}


def test_deepening_flag_follows_enrichment_gates():
    # Echte option-keys nodig: agenda_enrichment roept bij een gevuurde staffel
    # get_agenda_question aan, die een KeyError gooit op onbekende keys.
    # Growth-opties (backend.products.shared.deepening.DEEPENING_SETS):
    # gr_visibility, gr_conversation, gr_follow_through, gr_time, gr_criteria,
    # gr_ceiling, gr_other.
    avgs = {"growth": 6.0}
    # 7 van 13, marge >= 2: verrijkingsstaffel haalt -> staat 1 + vlag.
    ok = _agg(answered=13, offered=13, triggered=13,
              counts={"gr_visibility": 7, "gr_conversation": 3})
    rows = _rank("retention", avgs, deep={"growth": ok})
    assert rows[0]["deepening_state"] == 1
    assert rows[0]["flags"] == 1
    # 6 van 13 (46% < 50%): staffel haalt niet -> staat 2, geen vlag.
    # (Dit pad retourneert None uit agenda_enrichment vóór get_agenda_question
    # wordt aangeroepen, dus placeholder-keys zouden hier niet crashen -- maar
    # gebruik ook hier echte keys voor consistentie.)
    nok = _agg(answered=13, offered=13, triggered=13,
               counts={"gr_visibility": 6, "gr_conversation": 4})
    rows = _rank("retention", avgs, deep={"growth": nok})
    assert rows[0]["deepening_state"] == 2
    assert rows[0]["flags"] == 0


# ── Marge-mechanica ──────────────────────────────────────────────────────────

def _flagged_deep():
    # Workload-opties (DEEPENING_SETS): wl_volume, wl_recovery, wl_priorities,
    # wl_capacity, wl_peaks_adhoc, wl_process, wl_other. Deze fixture wordt
    # gebruikt voor de "workload"-factor, dus echte wl_*-keys (zie hierboven:
    # agenda_enrichment vuurt hier, dus get_agenda_question wordt aangeroepen).
    return _agg(answered=13, offered=13, triggered=13,
                counts={"wl_volume": 9, "wl_recovery": 1})


def test_flag_flips_only_within_margin():
    deep = {"workload": _flagged_deep()}
    # Verschil 0.2 (< 0.3): gevlagde workload 5.4 passeert growth 5.2.
    rows = _rank("retention", {"growth": 5.2, "workload": 5.4}, deep=deep)
    assert [r["key"] for r in rows] == ["workload", "growth"]
    # Verschil exact 0.3: GEEN flip (strikt kleiner dan) en GEEN label.
    rows = _rank("retention", {"growth": 5.1, "workload": 5.4}, deep=deep)
    assert [r["key"] for r in rows] == ["growth", "workload"]
    assert rows[1]["near_tie_with"] is None
    # Verschil 0.4 (> 0.3): geen flip.
    rows = _rank("retention", {"growth": 5.0, "workload": 5.4}, deep=deep)
    assert [r["key"] for r in rows] == ["growth", "workload"]


def test_flags_do_not_stack():
    # workload heeft TWEE vlaggen (spreiding + verdieping) maar passeert een
    # factor op 0.4 afstand nog steeds niet: vlaggen stapelen niet tot 0.6.
    deep = {"workload": _flagged_deep()}
    resp = {"workload": _scores(12, 6)}
    rows = _rank("retention", {"growth": 5.0, "workload": 5.4},
                 deep=deep, resp=resp)
    assert rows[0]["key"] == "growth"
    assert rows[1]["flags"] == 2


# ── Gelijkspel-label ─────────────────────────────────────────────────────────

def test_near_tie_label_requires_same_flagset():
    # Zelfde vlaggenset (geen vlaggen), verschil 0.2: label op de onderste rij.
    rows = _rank("retention", {"growth": 5.2, "workload": 5.4})
    assert rows[0]["near_tie_with"] is None  # bovenste rij nooit een label
    assert rows[1]["near_tie_with"] == "growth"
    # Verschillend vlaggenset: de vlag gaf de doorslag -> geen gelijkspel-label.
    rows = _rank("retention", {"growth": 5.2, "workload": 5.4},
                 deep={"workload": _flagged_deep()})
    assert [r["key"] for r in rows] == ["workload", "growth"]
    assert rows[1]["near_tie_with"] is None
```

Let op bij `test_near_tie_label_requires_same_flagset` laatste geval: na de flip staat
workload (gevlagd) boven growth (ongevlagd); het verschil in base is 0.2 maar de
vlaggensets verschillen, dus geen label. Dat is exact spec par. 3.5.

- [ ] **Step 2: Run de tests**

Run: `.venv/Scripts/python.exe -m pytest tests/test_report_priority.py -v`
Expected: alles PASS als Taak 1 correct was. Faalt er iets: fix `rank_factors` minimaal tot groen (de spec is bindend, de tests coderen de spec).

- [ ] **Step 3: Commit**

```bash
git add tests/test_report_priority.py backend/report_priority.py
git commit -m "test(raster): vlag-gates, marge-mechanica en gelijkspel-label"
```

---

### Taak 3: Celstaten + navolgbaarheids-invariant (pure laag)

**Files:**
- Test: `tests/test_report_priority.py` (uitbreiden)

- [ ] **Step 1: Schrijf de failing tests voor de vijf celstaten**

Voeg toe aan `tests/test_report_priority.py`:

```python
# ── Celstaten verdiepingskolom (spec par. 6, incl. amendement staat 2 >= 8) ──
# Let op: alleen de eerste case (state=1) laat agenda_enrichment daadwerkelijk
# vuren -> gebruik dan verplicht echte growth-option-keys (gr_visibility/
# gr_conversation), anders KeyError uit get_agenda_question. De overige cases
# vallen allemaal onder agenda_enrichment's eigen "answered<8 -> return None"
# of margin-check, dus daar zijn de keys onschadelijk (behouden als "a"/"b"
# zou kunnen, maar voor consistentie ook hier echte keys).

@pytest.mark.parametrize("agg,expected_state", [
    (_agg(answered=13, offered=13, triggered=13,
          counts={"gr_visibility": 9, "gr_conversation": 1}), 1),
    (_agg(answered=9, offered=10, triggered=10,
          counts={"gr_visibility": 5, "gr_conversation": 4}), 2),
    # Amendement: 5-7 beantwoorders is staat 3, ook met schijnbare meerderheid.
    (_agg(answered=6, offered=8, triggered=8,
          counts={"gr_visibility": 5, "gr_conversation": 1}), 3),
    (_agg(answered=2, offered=4, triggered=6, counts={"gr_visibility": 2}), 3),
    (_agg(answered=0, offered=0, triggered=4), 4),
    (_agg(answered=0, offered=0, triggered=0), 5),
])
def test_deepening_cell_states(agg, expected_state):
    rows = _rank("retention", {"growth": 6.0}, deep={"growth": agg})
    assert rows[0]["deepening_state"] == expected_state


def test_campaign_gate_off_gives_state_zero_and_no_flag():
    rows = _rank("retention", {"growth": 4.0}, deep={})
    assert rows[0]["deepening_state"] == 0
    assert rows[0]["flags"] == 0


# ── Navolgbaarheids-invariant (spec par. 3, kernbelofte; par. 9 test 2) ──────

def _invariant(rows):
    """Elke afwijking van pure base-volgorde moet een zichtbaar signaal dragen;
    elk onbeslist gelijkspel draagt het label."""
    for i, r in enumerate(rows):
        for later in rows[i + 1:]:
            if r["base"] > later["base"]:
                # r staat hoger dan zijn score rechtvaardigt -> vlag verplicht.
                assert r["flags"] > 0, f"onzichtbare flip: {r['key']} boven {later['key']}"
    for i, r in enumerate(rows[1:], start=1):
        prev = rows[i - 1]
        same_flagset = (r["spread_flag"] == prev["spread_flag"]
                        and (r["deepening_state"] == 1) == (prev["deepening_state"] == 1))
        if abs(r["base"] - prev["base"]) < PRIORITY_TIE_MARGIN and same_flagset:
            assert r["near_tie_with"] == prev["key"], f"label mist op {r['key']}"


def test_navolgbaarheid_invariant_over_scenarios():
    scenarios = [
        # (avgs, resp, deep, reasons, scan_type)
        ({"growth": 5.1, "workload": 5.4, "leadership": 5.6,
          "culture": 6.8, "compensation": 7.1, "role_clarity": 6.3}, {}, {}, None, "retention"),
        ({"growth": 5.2, "workload": 5.4}, {}, {"workload": _flagged_deep()}, None, "retention"),
        ({"growth": 5.2, "workload": 5.3, "leadership": 5.4},
         {"leadership": _scores(12, 6)}, {}, None, "retention"),
        ({"growth": 5.0, "workload": 5.5, "culture": 5.5}, {}, {}, {"workload": 2}, "exit"),
        ({"growth": 6.0, "workload": 6.0, "culture": 6.1}, {}, {}, None, "retention"),
    ]
    for avgs, resp, deep, reasons, st in scenarios:
        _invariant(_rank(st, avgs, resp=resp, deep=deep, reasons=reasons))
```

- [ ] **Step 2: Run en fix tot groen**

Run: `.venv/Scripts/python.exe -m pytest tests/test_report_priority.py -v`
Expected: alles PASS (de Taak 1-implementatie dekt dit al; zo niet, minimal fix in `report_priority.py`).

- [ ] **Step 3: Commit**

```bash
git add tests/test_report_priority.py backend/report_priority.py
git commit -m "test(raster): celstaten + navolgbaarheids-invariant"
```

---

### Taak 4: CSS voor het raster

**Files:**
- Modify: `backend/report_css.py`

- [ ] **Step 1: Voeg de raster-classes toe**

Zoek in `backend/report_css.py` het blok met de bestaande `.steps`/`.agenda-dark`-styling en voeg direct daarna toe (let op de WeasyPrint-beperkingen: geen `var()`, geen `gap`, geen `inset`; kleuren via directe Python-interpolatie zoals de rest van het bestand — gebruik de bestaande module-constanten voor navy/amber/chalk zoals ze daar heten, bijv. in f-string-interpolatie identiek aan aangrenzende regels):

```css
/* ── Prioriteringsraster (spec 2026-07-18) ── */
.raster-tbl {{ width:100%; border-collapse:collapse; font-size:10.5px; margin-top:12px; }}
.raster-tbl th {{ text-align:left; font-family:'JetBrains Mono', monospace; font-size:8px;
  text-transform:uppercase; letter-spacing:0.08em; color:#6b6555;
  border-bottom:1.5px solid {NAVY}; padding:4px 7px; }}
.raster-tbl td {{ border-bottom:1px solid #ddd6c6; padding:6px 7px; vertical-align:middle; }}
.raster-tbl tr.r-top td {{ background:{NAVY}; color:{CHALK}; }}
.raster-tbl tr.r-top td .r-fl {{ color:{AMBER}; font-weight:600; }}
.r-mono {{ font-family:'JetBrains Mono', monospace; font-size:8px; color:#6b6555; }}
.raster-tbl tr.r-top .r-mono {{ color:#94A3B8; }}
.r-legend {{ font-size:10px; color:#6b6555; margin-top:6px; }}
.r-uitleg {{ font-size:10px; color:#5a5443; margin-top:10px; line-height:1.5;
  border-left:3px solid {AMBER}; padding-left:9px; }}
.r-gate {{ font-size:10px; color:#6b6555; margin-top:6px; font-style:italic; }}
```

`{NAVY}`/`{AMBER}`/`{CHALK}` staan hier symbolisch: gebruik exact dezelfde
interpolatiemethode en constantenamen die `report_css.py` al gebruikt voor
`#0D1B2A`, `#E8A020` en `#F4F1EA` (kijk naar de aangrenzende classes en volg dat
patroon letterlijk; staan de kleuren daar hardcoded, hardcode ze hier dan ook).
De navy-blok-styling (`.agenda-dark`, `.step-fill`, `.step-sublbl`,
`.agenda-opener`) bestaat al en wordt hergebruikt, niet gedupliceerd.

- [ ] **Step 2: Sanity-run bestaande design-tests**

Run: `.venv/Scripts/python.exe -m pytest tests/test_report_html_design.py tests/test_pdf_redesign.py -q`
Expected: zelfde uitslag als baseline (CSS-toevoeging breekt niets).

- [ ] **Step 3: Commit**

```bash
git add backend/report_css.py
git commit -m "feat(raster): CSS-classes prioriteringsraster (WeasyPrint-safe)"
```

---

### Taak 5: `_prioriteringsraster`-renderer + contract-tests

**Files:**
- Modify: `backend/report_html.py` (nieuwe helper + copy-constanten, direct onder `_eerste_managementspoor`)
- Test: `tests/test_report_priority_render.py` (nieuw)

- [ ] **Step 1: Schrijf de failing contract-tests**

Maak `tests/test_report_priority_render.py`:

```python
"""Contract-tests voor _prioriteringsraster (spec par. 2, 6, 8)."""
import re

from backend.report_html import (
    RASTER_GATE_NOTE,
    RASTER_INTRO,
    RASTER_INTRO_GATE,
    RASTER_LEGENDA,
    RASTER_UITLEG,
    _prioriteringsraster,
)
from backend.report_priority import (
    CELL_CAP_REACHED,
    CELL_NO_MAJORITY,
    CELL_NOT_TRIGGERED,
    CELL_TOO_FEW,
)


def _row(key, label, score, role=None, state=5, top=None, tie=None,
         spread_n=13, spread_below=2, spread_flag=False):
    return {"key": key, "label": label, "score": score, "base": score,
            "spread_n": spread_n, "spread_below": spread_below,
            "spread_flag": spread_flag, "deepening_state": state,
            "deepening_top": top, "flags": int(spread_flag) + int(state == 1),
            "agenda_role": role, "near_tie_with": tie}


RANKED = [
    _row("growth", "Groeiperspectief", 5.1, role="startpunt", state=1,
         top=("growth_no_path", 7, 13)),
    _row("workload", "Werkdruk en herstelruimte", 5.4, role="tweede", state=2),
    _row("leadership", "Leiderschap", 5.6, state=3, tie="workload"),
    _row("role_clarity", "Rolhelderheid", 6.3, state=5),
    _row("culture", "Cultuur en psychologische veiligheid", 6.8, state=5),
    _row("compensation", "Beloning en voorwaarden", 7.1, state=4),
]

RESP = {r["key"]: [4.0] * r["spread_below"] + [7.0] * (r["spread_n"] - r["spread_below"])
        for r in RANKED}


def _render(scan_type="retention", ranked=RANKED, resp=RESP, active=True):
    return _prioriteringsraster(
        ranked=ranked, scan_type=scan_type, factor_resp_scores=resp,
        deepening_active=active, mgmt_q="Testvraag?",
        review_when="Plan binnen 45-90 dagen een vervolgmoment.",
        opener_html="<h2>Gespreksagenda</h2>")


def test_uitlegregel_letterlijk_gepind_beide_varianten():
    assert RASTER_UITLEG["retention"] in _render("retention")
    assert RASTER_UITLEG["exit"] in _render("exit")
    # De exit-variant noemt het vertrekredengewicht.
    assert "vertrekreden" in RASTER_UITLEG["exit"]
    assert "vertrekreden" not in RASTER_UITLEG["retention"]


def test_intro_en_legenda_aanwezig():
    html = _render()
    assert RASTER_INTRO in html
    assert RASTER_LEGENDA in html


def test_celstaten_letterlijk():
    html = _render()
    assert CELL_NO_MAJORITY in html
    assert CELL_TOO_FEW in html
    assert CELL_CAP_REACHED in html
    assert CELL_NOT_TRIGGERED in html
    # Staat 1: telling + optietekst-quote.
    assert "7 van 13 kozen:" in html


def test_agenda_kolom_en_gelijkspel():
    html = _render()
    assert "Startpunt" in html
    assert "Tweede punt" in html
    assert "vrijwel gelijk aan Werkdruk en herstelruimte" in html
    # Geen rangnummer-verwijzingen (spec par. 8).
    assert "nr." not in html


def test_canonieke_labels_geen_verkorte_set():
    html = _render()
    assert "Beloning en voorwaarden" in html
    assert "Compensatie" not in html
    assert "Rolhelderheid" in html


def test_geen_em_dashes_in_nieuwe_copy():
    assert "—" not in _render()
    assert "—" not in _render(active=False)


def test_scores_via_score_str():
    # Punt als decimaalteken, /10-formaat zoals de rest van het rapport.
    assert "5.1/10" in _render()


def test_spreiding_degraded_onder_n10():
    kleine = [dict(r, spread_n=7, spread_below=2) for r in RANKED]
    resp7 = {r["key"]: [4.0, 4.0, 7.0, 7.0, 7.0, 7.0, 7.0] for r in kleine}
    html = _render(ranked=kleine, resp=resp7)
    assert "spreiding vanaf 10 responses" in html
    assert "onder de 5" not in html  # geen telregel onder de staffel


def test_campagne_gate_kolom_weg_plus_disclosure():
    html = _render(active=False)
    assert RASTER_GATE_NOTE in html
    assert RASTER_INTRO_GATE in html
    assert "Verdieping" not in html  # kolomkop weg
    assert CELL_NOT_TRIGGERED not in html


def test_navy_slotblok_met_opener_en_invulregels():
    html = _render()
    assert "Gespreksopener" in html
    assert "Testvraag?" in html
    assert "Prioriteit" in html and "Eigenaar" in html and "Vervolgmoment" in html
    assert "In te vullen tijdens de bespreking" in html


def test_zichtbaar_signaal_bij_vlag_in_html():
    # Render-kant van de navolgbaarheids-invariant: een rij met spread_flag
    # toont de telregel; een rij met staat 1 toont de telling.
    flagged = [
        _row("growth", "Groeiperspectief", 5.4, role="startpunt", state=1,
             top=("growth_no_path", 7, 13), spread_flag=True, spread_below=5),
        _row("workload", "Werkdruk en herstelruimte", 5.2, role="tweede", state=5),
    ]
    html = _render(ranked=flagged)
    assert "5 van 13 onder de 5" in html
    assert "7 van 13 kozen:" in html
```

- [ ] **Step 2: Run, verwacht ImportError**

Run: `.venv/Scripts/python.exe -m pytest tests/test_report_priority_render.py -v`
Expected: FAIL met ImportError op `RASTER_UITLEG` / `_prioriteringsraster`.

- [ ] **Step 3: Implementeer copy-constanten + `_prioriteringsraster`**

In `backend/report_html.py`, direct onder `_eerste_managementspoor` (na regel ~722). Voeg bovenin bij de bestaande imports uit `backend.report_distribution` niets toe (`distribution_svg` wordt lokaal geimporteerd zoals `_segment_block` dat al doet) en importeer bij de bestaande deepening-imports niets extra. Voeg toe:

```python
# ── Prioriteringsraster (spec 2026-07-18) ────────────────────────────────────
# Alle copy hieronder is gepind met contract-tests: inkorten = rode test.

RASTER_INTRO = (
    "Dit overzicht weegt alle zes factoren tegen elkaar af op drie zichtbare "
    "signalen: de gemiddelde score, de spreiding tussen respondenten en wat "
    "respondenten in de verdieping als toelichting kozen. De volgorde is "
    "daarmee navolgbaar: je ziet per factor wat meewoog. De bespreking "
    "beslist; dit raster structureert.")

RASTER_INTRO_GATE = (
    "Dit overzicht weegt alle zes factoren tegen elkaar af op twee zichtbare "
    "signalen: de gemiddelde score en de spreiding tussen respondenten. De "
    "volgorde is daarmee navolgbaar: je ziet per factor wat meewoog. De "
    "bespreking beslist; dit raster structureert.")

RASTER_UITLEG: dict[str, str] = {
    "retention": (
        "Hoe deze volgorde tot stand komt: gesorteerd op score. Bij vrijwel "
        "gelijke scores (verschil kleiner dan 0,3) geven grote spreiding of "
        "een gedeelde toelichting uit de verdieping de doorslag. Spreiding "
        "tonen we vanaf 10 responses; verdiepingsduiding vanaf 8 "
        "beantwoorders per factor."),
    "exit": (
        "Hoe deze volgorde tot stand komt: gesorteerd op score, waarbij ook "
        "meeweegt hoe vaak een factor als vertrekreden is genoemd. Bij "
        "vrijwel gelijke scores (verschil kleiner dan 0,3) geven grote "
        "spreiding of een gedeelde toelichting uit de verdieping de "
        "doorslag. Spreiding tonen we vanaf 10 responses; verdiepingsduiding "
        "vanaf 8 beantwoorders per factor."),
}

RASTER_LEGENDA = (
    "Het blokje in de spreidingsbalk markeert het groepsgemiddelde; de "
    "telling eronder toont hoeveel respondenten deze factor onder de 5 "
    "scoren.")

RASTER_GATE_NOTE = (
    "In deze meting waren geen verdiepingsvragen actief; de volgorde volgt "
    "score en spreiding.")


def _raster_deepening_cell(row: dict, scan_type: str) -> str:
    """Celtekst verdiepingskolom volgens de vijf vaste staten (spec par. 6)."""
    state = row["deepening_state"]
    if state == 1:
        key, cnt, answered = row["deepening_top"]
        opt = _deepening_option_texts(scan_type, row["key"]).get(key, key)
        return f'{cnt} van {answered} kozen: "{_h(opt)}"'
    return _h({2: CELL_NO_MAJORITY, 3: CELL_TOO_FEW,
               4: CELL_CAP_REACHED, 5: CELL_NOT_TRIGGERED}.get(state, ""))


def _prioriteringsraster(*, ranked: list[dict], scan_type: str,
                         factor_resp_scores: dict[str, list[float]],
                         deepening_active: bool,
                         mgmt_q: str, review_when: str,
                         opener_html: str) -> str:
    """Prioriteringsraster + geintegreerde gespreksagenda (spec par. 2).

    Vervangt _eerste_managementspoor voor exit en retention. De tabel toont
    het afwegingswerk (zichtbaarheids-invariant: elke tiebreak-input staat in
    een kolom); het navy slotblok draagt opener + invulregels.
    """
    from backend.report_distribution import MIN_DISTRIBUTION_N, distribution_svg

    def _spread_cell(row: dict) -> str:
        scores = [v for v in (factor_resp_scores.get(row["key"]) or []) if v is not None]
        if len(scores) < MIN_DISTRIBUTION_N:
            return '<span class="r-mono">spreiding vanaf 10 responses</span>'
        strip = distribution_svg(scores, width=200, height=22)
        return (f'{strip}<br><span class="r-mono">'
                f'{row["spread_below"]} van {row["spread_n"]} onder de 5</span>')

    def _agenda_cell(row: dict) -> str:
        parts = []
        if row["agenda_role"] == "startpunt":
            parts.append("<b>Startpunt</b>")
        elif row["agenda_role"] == "tweede":
            parts.append("<b>Tweede punt</b>")
        if row["near_tie_with"]:
            tie_lbl = next((r["label"] for r in ranked if r["key"] == row["near_tie_with"]),
                           row["near_tie_with"])
            parts.append(f'<span class="r-mono">vrijwel gelijk aan {_h(tie_lbl)}</span>')
        return "<br>".join(parts)

    deep_th = '<th style="width:29%">Verdieping</th>' if deepening_active else ""
    body = ""
    for row in ranked:
        top_cls = ' class="r-top"' if row["agenda_role"] else ""
        fl_html = (f'<span class="r-fl">{_h(row["label"])}</span>'
                   if row["agenda_role"] else _h(row["label"]))
        deep_td = (f'<td style="font-size:9.5px;">{_raster_deepening_cell(row, scan_type)}</td>'
                   if deepening_active else "")
        body += (f'<tr{top_cls}><td>{fl_html}</td>'
                 f'<td>{_score_str(row["score"])}</td>'
                 f'<td>{_spread_cell(row)}</td>'
                 f'{deep_td}'
                 f'<td>{_agenda_cell(row)}</td></tr>')

    intro = RASTER_INTRO if deepening_active else RASTER_INTRO_GATE
    gate = f'<p class="r-gate">{RASTER_GATE_NOTE}</p>' if not deepening_active else ""

    def _fill_row(label: str, hint: str) -> str:
        return (f'<div class="step-sublbl">{_h(label)}</div>'
                f'<div class="step-fill"></div>'
                f'<div class="step-fill-hint">{_h(hint)}</div>')

    return f"""<div class="pb sec">
  {opener_html}
  <p class="sec-intro">{intro}</p>
  <table class="raster-tbl"><tr>
    <th style="width:27%">Factor</th><th style="width:12%">Score</th>
    <th style="width:22%">Spreiding</th>{deep_th}<th style="width:14%">Agenda</th>
  </tr>{body}</table>
  <p class="r-legend">{RASTER_LEGENDA}</p>
  {gate}
  <div class="r-uitleg"><b>{RASTER_UITLEG[scan_type].split(":")[0]}:</b>{RASTER_UITLEG[scan_type].split(":", 1)[1]}</div>
  <div class="agenda-dark" style="margin-top:16px;">
    <div class="agenda-opener">
      <div style="font-family:'JetBrains Mono', monospace;font-size:9px;letter-spacing:0.14em;text-transform:uppercase;color:#E8A020;margin-bottom:7px;">Gespreksopener</div>
      <p style="margin-bottom:0;font-size:12.5px;line-height:1.6;color:#F4F1EA;">{_h(mgmt_q)}</p>
    </div>
    <table class="steps"><tr><td class="step">
      {_fill_row("Prioriteit", "In te vullen tijdens de bespreking")}
      {_fill_row("Eigenaar", "In te vullen tijdens de bespreking")}
      {_fill_row("Vervolgmoment", review_when)}
    </td></tr></table>
  </div>
  <p class="trustline">Nog niet besluiten of een verdieping of kortere vervolgmeting nodig is: dat volgt uit het gesprek.</p>
</div>"""
```

Importeer bovenin `report_html.py` bij de andere backend-imports:

```python
from backend.report_priority import (
    CELL_CAP_REACHED, CELL_NO_MAJORITY, CELL_NOT_TRIGGERED, CELL_TOO_FEW,
    rank_factors,
)
```

Let op: de `RASTER_UITLEG`-split op `":"` zet alleen het deel voor de eerste
dubbele punt vet ("Hoe deze volgorde tot stand komt"); de gepinde string zelf
blijft integraal in de HTML aanwezig (de contract-test checkt daarom op de
volledige string MIN de bold-markup; als dat door de `<b>`-splitsing niet
letterlijk matcht, render dan zonder splitsing: hele regel plain in het blok en
de eerste woorden niet vet. De test is leidend: `RASTER_UITLEG[...] in html`
moet letterlijk waar zijn — kies dus de plain variant als de splitsing dat
breekt).

- [ ] **Step 4: Run de contract-tests**

Run: `.venv/Scripts/python.exe -m pytest tests/test_report_priority_render.py -v`
Expected: 11 passed. Faalt `test_uitlegregel_letterlijk_gepind_beide_varianten` door de `<b>`-splitsing: gebruik de plain variant (zie noot hierboven).

- [ ] **Step 5: Commit**

```bash
git add backend/report_html.py tests/test_report_priority_render.py
git commit -m "feat(raster): _prioriteringsraster renderer + gepinde copy"
```

---

### Taak 6: Exit-renderer aansluiten

**Files:**
- Modify: `backend/report_html.py` — exit-renderer (regio's rond regels 1855-1904, 1958-1963, 2105-2135; regelnummers verschuiven door Taak 5)
- Modify: `tests/test_report_html_design.py` (lockstep)

- [ ] **Step 1: Bereken de rangorde vroeg in de exit-renderer**

Zoek in de exit-renderer het blok dat NA de bestuurlijke read staat:

```python
    _code_to_count = {r["code"]: r["count"] for r in data["exit_r_dist"]}
    exit_code_counts = {fk: _code_to_count.get(FACTOR_EXIT_CODE.get(fk), 0) for fk in fa}
    priority_fkeys = _select_priority_factors(fa, exit_code_counts, max_n=3)
    deep_agg = data.get("deepening_agg") or {}
```

Verplaats de eerste twee regels + `deep_agg` naar VOOR het "Bestuurlijke read"-blok (voor `if top_fkeys:`) en voeg de rangorde toe:

```python
    _code_to_count = {r["code"]: r["count"] for r in data["exit_r_dist"]}
    exit_code_counts = {fk: _code_to_count.get(FACTOR_EXIT_CODE.get(fk), 0) for fk in fa}
    deep_agg = data.get("deepening_agg") or {}
    _raster_rows = rank_factors(
        "exit", fa, data.get("factor_resp_scores") or {}, deep_agg,
        exit_reason_counts=exit_code_counts,
        labels={fk: _fl(fk, "exit") for fk in ORG_FACTOR_KEYS})
    priority_fkeys = [r["key"] for r in _raster_rows[:3]]
```

Op de oorspronkelijke plek blijft alleen een verwijzende comment achter; de dubbele
`_ex_priority_fkeys = _select_priority_factors(...)`-regel verderop vervalt (zie Step 3).

- [ ] **Step 2: p.02 primair = raster-startpunt**

In het "Bestuurlijke read"-blok: vervang `if top_fkeys:` / `tf = top_fkeys[0]` door:

```python
    if _raster_rows:
        tf      = _raster_rows[0]["key"]
```

De rest van het blok (`tf_lbl`, `why_cells`, `_short_mgmt_q`) blijft ongewijzigd:
alles is al op `tf` gebaseerd. `top_fkeys` blijft bestaan voor de quotes-sectie
(`_themed_quotes`) — dat is bewust buiten scope.

- [ ] **Step 3: Vervang het agenda-blok**

Vervang het volledige blok van `_ex_priority_fkeys = _select_priority_factors(...)` t/m de afsluitende `)` van de `s += _eerste_managementspoor(...)`-aanroep door:

```python
    _startpunt_fk = _raster_rows[0]["key"] if _raster_rows else None
    _enriched_q = (_deepening_mgmt_q(deep_agg, "exit", _startpunt_fk)
                   if _startpunt_fk else None)
    s += _prioriteringsraster(
        ranked=_raster_rows,
        scan_type="exit",
        factor_resp_scores=data.get("factor_resp_scores") or {},
        deepening_active=bool(deep_agg),
        mgmt_q=_enriched_q or (_mgmt_q(_startpunt_fk, "exit") if _startpunt_fk else (nsp.get("first_decision") or "")),
        review_when="Plan binnen 45-90 dagen een vervolgmoment: bespreek dan wat er is opgepakt en of dit thema nog voorrang verdient.",
        opener_html=ch.opener("Waar begint het gesprek?", kicker="Prioritering & gespreksagenda"),
    )
```

De variabelen `_ex_primary_items`/`_ex_primary_low`/`_ex_primary_theme`/`_primary_why`/`_second_why` vervallen (kaarten bestaan niet meer; het redeneerwerk zit in de tabelkolommen).

- [ ] **Step 4: Draai de gerichte tests en werk lockstep-tests bij**

Run: `.venv/Scripts/python.exe -m pytest tests/test_report_html_design.py tests/test_report_design_sprong.py tests/test_report_leesbaarheid.py tests/test_deepening_report_html.py tests/test_direction_report_html.py -q`

Verwacht: fails in tests die de oude agenda-structuur pinnen. Werk ze bij volgens deze principes (de spec par. 9.5 benoemt dit als verwacht lockstep-werk):
- `test_managementspoor_eigenaarschap_is_blank_not_ai_suggested`: assert nu dat het navy blok de drie invulregels bevat ("Prioriteit", "Eigenaar", "Vervolgmoment", "In te vullen tijdens de bespreking") en GEEN vooringevulde eigenaar. De kaarten "Primair thema"/"Tweede aandachtspunt" bestaan niet meer: verwijder die asserts en assert in plaats daarvan `"Startpunt" in html`.
- `test_mgmt_q_enriched_when_gates_pass`: de verrijkte openerregel ("De meest gekozen toelichting was ...") blijft ongewijzigd renderen in het navy blok; alleen als de test de omliggende kaartstructuur pint, versoepel naar de opener-assert.
- Tests die `"Gespreksagenda"` als paginatitel pinnen: nieuwe titel is `"Waar begint het gesprek?"` met kicker `"Prioritering & gespreksagenda"`.
- Elke wijziging aan een bestaande test krijgt een comment `# lockstep raster 2026-07-18`.

Vergelijk daarna met de baseline: `diff` van de nieuwe faalset tegen `/tmp/baseline_failures.txt` mag alleen verschillen tonen in tests die je zojuist bewust hebt bijgewerkt.

- [ ] **Step 5: Commit**

```bash
git add backend/report_html.py tests/
git commit -m "feat(raster): exit-renderer op rank_factors + prioriteringsraster"
```

---

### Taak 7: Retention-renderer aansluiten

**Files:**
- Modify: `backend/report_html.py` — retention-renderer (regio's rond regels 2230-2250, 2335-2341, 2472-2509)
- Modify: lockstep-tests idem Taak 6

- [ ] **Step 1: Rangorde vroeg berekenen**

Zoek in de retention-renderer:

```python
    deep_agg = data.get("deepening_agg") or {}

    # ── Factor detail (itemniveau prioritaire factoren) ──────────────────────
    # Priority = (10-score) — no exit-reason counts exist for retention, pass {}
    priority_fkeys = _select_priority_factors(fa, {}, max_n=3)
```

Verplaats `deep_agg` naar VOOR het bestuurlijke-read-blok (voor `if top_fkeys:` rond regel 2230) en vervang door:

```python
    deep_agg = data.get("deepening_agg") or {}
    _raster_rows = rank_factors(
        "retention", fa, data.get("factor_resp_scores") or {}, deep_agg,
        labels={fk: _fl(fk, ST) for fk in ORG_FACTOR_KEYS})
    priority_fkeys = [r["key"] for r in _raster_rows[:3]]
```

- [ ] **Step 2: p.02 primair = raster-startpunt**

In het retention bestuurlijke-read-blok: vervang `tf = top_fkeys[0]` door `tf = _raster_rows[0]["key"]` (zelfde patroon als Taak 6 Step 2; de guard wordt `if _raster_rows:`).

- [ ] **Step 3: Vervang het agenda-blok**

Vervang het blok van `_ret_priority_fkeys = _select_priority_factors(fa, {}, max_n=3)` t/m de afsluitende `)` van `s += _eerste_managementspoor(...)` door:

```python
    _startpunt_fk = _raster_rows[0]["key"] if _raster_rows else None
    # Richting-scenario (spec 7.2) eerst; None -> trede-1-verrijking of menuvraag.
    _direction_q = (_direction_agenda_line(deep_agg[_startpunt_fk], ST, _startpunt_fk)
                    if _startpunt_fk and _startpunt_fk in deep_agg else None)
    _enriched_q = _direction_q or (_deepening_mgmt_q(deep_agg, ST, _startpunt_fk)
                                   if _startpunt_fk else None)
    s += _prioriteringsraster(
        ranked=_raster_rows,
        scan_type=ST,
        factor_resp_scores=data.get("factor_resp_scores") or {},
        deepening_active=bool(deep_agg),
        mgmt_q=_enriched_q or (_mgmt_q(_startpunt_fk, ST) if _startpunt_fk else (nsp.get("first_decision") or "")),
        review_when="Plan binnen 45-90 dagen een vervolgmoment: bespreek dan wat er is opgepakt en of dit thema nog voorrang verdient.",
        opener_html=ch.opener("Waar begint het gesprek?", kicker="Prioritering & gespreksagenda"),
    )
```

- [ ] **Step 4: Gerichte tests + lockstep zoals Taak 6 Step 4**

Run: `.venv/Scripts/python.exe -m pytest tests/test_report_html_design.py tests/test_direction_report_html.py tests/test_deepening_report_html.py tests/test_report_leesbaarheid.py -q`
Zelfde bijwerk-principes en baseline-diff als Taak 6.

- [ ] **Step 5: Verifieer dat onboarding onaangeroerd is**

Run: `grep -n "_eerste_managementspoor\|_select_priority_factors" backend/report_html.py`
Expected: beide functies bestaan nog; aanroepen alleen nog in de onboarding-renderer (regio ~2755/2882/2897). Voeg bij `_eerste_managementspoor` een docstring-regel toe:

```python
    TIJDELIJK: alleen nog voor Loep Start. Migreert naar _prioriteringsraster
    zodra de Loep Start-verdiepingsset v1.1 landt; deze functie wordt dan
    verwijderd (spec 2026-07-18 par. 10).
```

- [ ] **Step 6: Commit**

```bash
git add backend/report_html.py tests/
git commit -m "feat(raster): retention-renderer op rank_factors + prioriteringsraster"
```

---

### Taak 8: Rapportbrede consistentietest

**Files:**
- Test: `tests/test_report_priority_render.py` (uitbreiden)

- [ ] **Step 1: Schrijf de failing consistentietest**

Deze test rendert een volledig rapport via de bestaande sample-databuilders. Kijk hoe `tests/test_report_html_design.py` zijn rapport-HTML opbouwt (welke fixture/builder het gebruikt: dezelfde route als `generate_voorbeeldrapport.py`) en gebruik exact datzelfde patroon. Voeg toe:

```python
def test_p02_managementvraag_factor_is_raster_startpunt():
    """Spec par. 4: een rangorde per rapport. De factor achter de Eerste
    managementvraag op p.02 en het Startpunt in het raster zijn dezelfde."""
    html = _render_full_retention_sample()  # zelfde builder als test_report_html_design
    # Het raster-startpunt is de eerste r-top rij; pak zijn factorlabel.
    m = re.search(r'class="r-top"><td><span class="r-fl">([^<]+)</span>', html)
    assert m, "raster-startpunt-rij niet gevonden"
    startpunt_label = m.group(1)
    # p.02 toont dezelfde factor als primair (bestuurlijke read).
    p02 = html.split("Waar begint het gesprek?")[0]
    assert startpunt_label in p02
```

Noot: `_render_full_retention_sample` is geen bestaande helper; definieer hem
bovenin dit testbestand door het aanroeppatroon van het dichtstbijzijnde
bestaande full-render-testbestand te kopieren (zoek in `tests/` naar de test
die `build_report_data` of de sample-generator aanroept en hergebruik die
opzet letterlijk). De verdiepingspagina-selectie hoeft geen aparte test:
`priority_fkeys` komt in Taak 6/7 rechtstreeks uit `_raster_rows[:3]`, dezelfde
bron — er bestaat geen tweede pad meer.

- [ ] **Step 2: Run tot groen**

Run: `.venv/Scripts/python.exe -m pytest tests/test_report_priority_render.py -v`
Expected: alles PASS.

- [ ] **Step 3: Commit**

```bash
git add tests/test_report_priority_render.py
git commit -m "test(raster): rapportbrede consistentie p.02 == raster-startpunt"
```

---

### Taak 9: Volledige verificatie + voorbeeldrapporten

**Files:**
- Regenerate: `docs/examples/*` en `frontend/public/examples/*` (voorbeeldrapport-PDF's/HTML)

- [ ] **Step 1: Volledige suite tegen de baseline**

```bash
.venv/Scripts/python.exe -m pytest tests/ -q 2>&1 | grep -E "^(FAILED|ERROR)" | sort > /tmp/final_failures.txt
diff /tmp/baseline_failures.txt /tmp/final_failures.txt
```
Expected: de diff bevat UITSLUITEND testnamen die in Taak 6/7 bewust zijn bijgewerkt of vervangen (gemarkeerd met `# lockstep raster 2026-07-18`). Elke andere regel = regressie: fixen voor je verder gaat.

- [ ] **Step 2: Voorbeeldrapporten regenereren**

Volg exact het bestaande regeneratiepatroon: open `generate_voorbeeldrapport.py` (repo-root `Verisight/`) en draai de daarin gedocumenteerde aanroep(en) voor exit en retention met `.venv/Scripts/python.exe`. Daarna PDF's via WeasyPrint-Docker (Windows-lokaal kan geen WeasyPrint):

```bash
docker run --rm -v "/c/Users/larsh/Desktop/Business/Verisight:/data" ghcr.io/weasyprint/weasyprint <input.html> <output.pdf>
```
(exacte in-/outputpaden: dezelfde als de bestaande `voorbeeldrapport_loep.pdf` / `voorbeeldrapport_retentiescan.pdf` in `docs/examples/` en `frontend/public/examples/`).
Expected: exit 0, lege stderr, 0 CSS-warnings.

- [ ] **Step 3: Visuele controle rasterpagina**

Render de rasterpagina van beide PDF's als afbeelding (PyMuPDF, zelfde aanpak als eerdere rondes) en controleer tegen spec par. 2: 6 rijen gesorteerd, navy top-2, canonieke labels, legenda, uitlegregel, navy slotblok met opener, geen em-dashes, geen "Compensatie", geen rangnummers.

- [ ] **Step 4: PDF-tekstlaag-checks**

```bash
.venv/Scripts/python.exe - <<'EOF'
import fitz
for p in ["docs/examples/voorbeeldrapport_loep.pdf", "docs/examples/voorbeeldrapport_retentiescan.pdf"]:
    text = "".join(page.get_text() for page in fitz.open(p))
    assert "Waar begint het gesprek?" in text, p
    assert "Compensatie" not in text, p
    assert "vrijwel gelijk aan nr." not in text, p
    print(p, "em-dashes:", text.count("—"))
EOF
```
Expected: beide "OK"-asserts slagen; het em-dash-aantal is niet hoger dan in de
huidige gepubliceerde PDF's (geen-data-placeholders "&#x2014;" mogen blijven,
nieuwe copy-em-dashes niet — bij twijfel: draai hetzelfde script eerst tegen de
oude PDF's uit git en vergelijk de twee tellingen).

- [ ] **Step 5: Commit + afronding**

```bash
git add docs/examples frontend/public/examples
git commit -m "chore(raster): voorbeeldrapporten geregenereerd (WeasyPrint 0 warnings)"
```

Meld in de afrondingssamenvatting expliciet: **Railway-redeploy nodig** (Python-rapportcode) en dat push naar origin nog moet gebeuren (beslissing Lars).

---

## Self-review checklist (uitgevoerd bij het schrijven)

- **Spec-dekking:** par. 2 (Taak 5), par. 3 (Taak 1-3), par. 4 (Taak 6-8), par. 5 (Taak 1), par. 6 (Taak 1/3/5), par. 7 (Taak 1/5), par. 8 (Taak 5 contract-tests), par. 9 (Taak 1-3/5/8/9), par. 10 (Taak 7 Step 5 docstring).
- **Afwijking van spec, bewust:** celstaat 2 vereist `answered >= 8` i.p.v. `>= 5` (amendement, zie kop van dit plan; door Lars goed te keuren voor uitvoering).
- **Type-consistentie:** `rank_factors` rijvorm (`key/label/score/base/spread_*/deepening_state/deepening_top/flags/agenda_role/near_tie_with`) is identiek in Taak 1, 3, 5 en 8.

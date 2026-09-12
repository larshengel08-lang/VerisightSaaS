# Stresstest ronde 2: de conclusielaag eerlijk maken — Implementatieplan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** De conclusielaag van het Loep-rapport (pagina twee, de ranglijst, het richtingblok en de segmentconclusie) zegt onder elke datacondities iets dat waar is en navolgbaar, in plaats van stellig.

**Architecture:** Alle wijzigingen zitten in de pure rapportlaag: `backend/report_priority.py` (rangorde), `backend/products/shared/deepening.py` (richtingstaten), `backend/report_distribution.py` (spreidingsstrook), `backend/report_html.py` (rendering) en `backend/report_css.py` (alleen waar een nieuw element CSS nodig heeft). Geen DB-migratie, geen API-wijziging, geen surveywijziging. Frontend raakt alleen copy voor Loep Start. Elke nieuwe drempel is een benoemde constante met een toelichting in dezelfde module waar hij werkt.

**Tech Stack:** Python 3.11, pytest, WeasyPrint (via Docker) voor PDF-validatie, Next.js/TypeScript + vitest voor de site-copy.

**Spec:** `docs/superpowers/specs/2026-09-11-stresstest-ronde2-design.md` (status AKKOORD). **Bevindingenrapport:** `docs/rapport-stresstest-2026-09-10.md` (scenario's, citaten, matrix na ronde 1).

---

## Vaste regels voor elke taak

Deze gelden voor alle taken. Een reviewer mag een taak afkeuren die ze schendt.

1. **Gewone taal** (copy-toon 2026-09-06). Loep is het onderwerp, nooit "ik". Geen HR-jargon.
2. **Geen em-dashes in klantcopy.** Gebruik een dubbele punt, komma, punt of `&middot;`. Elke nieuwe copy-test bevat een em-dash-guard.
3. **Fail Loud.** Nooit een stil weggelaten blok, nooit een kaal veld, nooit een placeholder-streepje waar een naam hoort. Kan iets niet, dan staat er een zin die zegt wat er niet kan en waarom.
4. **Elke nieuwe drempel is een benoemde constante** met een comment die zegt waarom die waarde, en wordt in één zin uitgelegd op de plek in het rapport waar hij werkt.
5. **Contract-tests die oude copy pinnen werken in lockstep mee.** Een test aanpassen mag alleen als de spec de nieuwe copy voorschrijft; noteer in de commit welke test en waarom.
6. **Baseline:** backend `25 failed, 736 passed, 5 skipped`. De faalset staat in `docs/superpowers/plans/ronde2-baseline-failset.txt` (taak 0). Nul nieuwe regressies; de faalset moet per testnaam identiek blijven.
7. **Testcommando** (vanuit de worktree-root):
   `/c/Users/larsh/Desktop/Business/Verisight/.venv/Scripts/python.exe -m pytest tests/ -q`
   De venv staat in de hoofdcheckout maar resolveert `backend` naar de worktree (geverifieerd).
8. **Wijk je af van de spec, documenteer dat in de spec zelf** (`docs/superpowers/specs/2026-09-11-stresstest-ronde2-design.md`) met de reden, in dezelfde commit.

---

## Bestandsoverzicht

| Bestand | Verantwoordelijkheid | Taken |
|---|---|---|
| `backend/report_priority.py` | Rangorde + tie-breaks + markeringsdata (pure functies) | 1 |
| `backend/report_html.py` | Alle rendering van het rapport | 1, 2, 3, 4, 5, 6, 7, 8 |
| `backend/products/shared/deepening.py` | Richtingstaten (`direction_state`) | 5 |
| `backend/report_distribution.py` | Spreidingsstrook (SVG + tellingen) | 7 |
| `backend/report_css.py` | CSS voor nieuwe elementen | 1, 6 |
| `scripts/stresstest_report.py` | QA-harnas, scenario-register | 9 |
| `frontend/components/marketing/home-page-content.tsx` | Scankaart Loep Start | 8 |
| `frontend/components/marketing/producten-content.tsx` | Productsectie Loep Start | 8 |

---

## Taakvolgorde en afhankelijkheden

Uitvoeren in deze volgorde. De spec-paragraaf staat erbij; de nummering hieronder is de **uitvoervolgorde**, niet het paragraafnummer.

| Taak | Spec par. | Onderwerp | Hangt af van |
|---|---|---|---|
| 0 | — | Baseline vastleggen | — |
| 1 | 1 | Ranglijst: richting als eerste tie-break, markering, exit-kolom | 0 |
| 2 | 2 | Vlak profiel op pagina twee | 1 |
| 3 | 5 | Kernzin volgt het aantal kwetsbare onderwerpen | 2 |
| 4 | 6 | Respons heeft gevolgen | 3 |
| 5 | 4 | Richtingstaten `plurality` en `split_none` | 0 |
| 6 | 3 | Segmentstartpunt alleen bij echt verschil + rij-cap weg | 0 |
| 7 | 7b | Spreidingsstrook vertrekintentie op dezelfde as | 0 |
| 8 | 7 | Loep Start eerlijk labelen (site + rapport) | 0 |
| 9 | 9 | Verificatie: scenario 16b, alle 20 scenario's, matrix, samples | 1-8 |

Taken 5, 6, 7 en 8 raken andere functies dan 1-4 en kunnen desgewenst parallel, maar houd de volgorde aan bij twijfel: taak 3 en 4 bewerken allebei de kernzin op p.02.

---

### Taak 0: Baseline vastleggen

**Files:**
- Create: `docs/superpowers/plans/ronde2-baseline-failset.txt`

- [ ] **Stap 1: Draai de volledige backend-suite en leg de faalset vast**

```bash
/c/Users/larsh/Desktop/Business/Verisight/.venv/Scripts/python.exe -m pytest tests/ -q 2>&1 | grep "^FAILED" | sed "s/ - .*//" | sort > docs/superpowers/plans/ronde2-baseline-failset.txt
```

```bash
wc -l < docs/superpowers/plans/ronde2-baseline-failset.txt
```

Verwacht: `25`. Wijkt dit af, dan is de worktree niet schoon op `main` (`cfd41bf1`); zoek dat eerst uit voordat je verder gaat.

- [ ] **Stap 2: Commit**

```bash
git add docs/superpowers/plans/ronde2-baseline-failset.txt && git commit -m "test(baseline): faalset van voor ronde 2 vastgelegd"
```

Na elke latere taak vergelijk je zo (nul verschil = nul regressies):

```bash
/c/Users/larsh/Desktop/Business/Verisight/.venv/Scripts/python.exe -m pytest tests/ -q 2>&1 | grep "^FAILED" | sed "s/ - .*//" | sort > /tmp/na.txt; diff docs/superpowers/plans/ronde2-baseline-failset.txt /tmp/na.txt && echo GEEN_REGRESSIES
```

---

### Taak 1 (spec par. 1): Ranglijst, richting als eerste tie-break + markering + exit-kolom

**Waarom:** Bevinding B5 en B6. Het raster toont een niet-oplopende scorekolom (scenario 06: 6.2, 6.2, 6.3, 6.2, 6.3, 6.5) zonder te zeggen wat de volgorde flipte, terwijl het in zijn eigen intro belooft dat de volgorde navolgbaar is. En het signaal dat het beste discrimineert (hoeveel mensen bij die factor om verandering vragen) doet helemaal niet mee.

**Files:**
- Modify: `backend/report_priority.py` (`rank_factors`, nieuwe helpers)
- Modify: `backend/report_html.py` (`RASTER_UITLEG`, `_prioriteringsraster`, `_raster_attribution`, de twee `rank_factors`-aanroepen)
- Modify: `backend/report_css.py` (regel voor de markeringsrij)
- Modify: `tests/test_report_priority_render.py` (helper `_row` en de uitlegregel-test in lockstep)
- Test: `tests/test_report_priority_direction_tiebreak.py` (nieuw)

#### Ontwerp in één alinea

`rank_factors` krijgt `direction_agg` mee. Per factor telt Loep hoeveel respondenten bij die factor iets anders kozen dan de niets-optie: de **vraag om verandering**. Rijen worden op `base` gesorteerd en dan in **tie-groepen** gedeeld: een rij hoort bij de lopende groep zolang zijn `base` minder dan `PRIORITY_TIE_MARGIN` boven het groepsanker (de laagste base van die groep) ligt. Binnen een groep beslist achtereenvolgens: vraag om verandering (aflopend), spreidingsvlag, verdiepingsvlag, base, label. Elke rij die daardoor boven een rij met lagere base komt krijgt een markeringsregel met de tellingen.

**Afwijking van de spec, te documenteren in de spec zelf (vaste regel 8):** par. 1.2 zegt dat de richting-tie-break geldt "alleen als beide rijen een geldig aantal hebben". Een paarsgewijze geldigheidsregel is niet transitief (A verslaat B op richting, B verslaat C op spreiding, C verslaat A op richting is mogelijk) en een niet-transitieve comparator maakt het sorteerresultaat afhankelijk van de invoervolgorde. Dat breekt het determinisme-contract van `rank_factors`. Daarom: **de richting-tie-break telt binnen een tie-groep alleen als élke rij in die groep een geldig aantal heeft.** Voor een groep van twee rijen (het normale geval) is dat exact wat de spec zegt; bij drie of meer is het strenger en dus conservatiever.

- [ ] **Stap 1: Schrijf de falende tests**

Maak `tests/test_report_priority_direction_tiebreak.py`:

```python
"""Tests voor de richting-tie-break en de markeringsregels (spec ronde 2 par. 1)."""
from backend.products.shared.deepening import DIRECTION_MIN_N
from backend.report_priority import rank_factors


def _dir(answered, change, none_key="gr_none", change_key="gr_visibility"):
    """Richtingaggregaat: `change` mensen vroegen om verandering, de rest koos niets."""
    counts = {}
    if change:
        counts[change_key] = change
    if answered - change:
        counts[none_key] = answered - change
    return {"lowest_n": answered, "offered": answered, "answered": answered,
            "skipped": 0, "counts": counts}


def _rank(avgs, direction=None, resp=None, deep=None, reasons=None, labels=None,
          scan_type="retention"):
    return rank_factors(scan_type, avgs, resp or {}, deep or {},
                        exit_reason_counts=reasons, labels=labels or {},
                        direction_agg=direction)


def test_direction_wins_within_margin():
    # Gelijke scores: de factor waar meer mensen om verandering vragen komt boven.
    avgs = {"growth": 6.0, "workload": 6.0}
    direction = {"growth": _dir(11, 4),
                 "workload": _dir(11, 9, none_key="wl_none", change_key="wl_volume")}
    rows = _rank(avgs, direction=direction)
    assert [r["key"] for r in rows] == ["workload", "growth"]
    assert rows[0]["direction_change"] == 9
    assert rows[1]["direction_change"] == 4


def test_direction_outranks_spread_within_margin():
    # growth heeft een spreidingsvlag, workload meer vraag om verandering.
    # Richting staat hoger in de signaalvolgorde, dus workload wint.
    avgs = {"growth": 6.0, "workload": 6.1}
    resp = {"growth": [4.0] * 5 + [7.0] * 7}          # 5 van 12 onder de 5 -> vlag
    direction = {"growth": _dir(11, 2),
                 "workload": _dir(11, 10, none_key="wl_none", change_key="wl_volume")}
    rows = _rank(avgs, direction=direction, resp=resp)
    assert rows[0]["key"] == "workload"
    assert rows[0]["tie_break_kind"] == "direction"


def test_direction_ignored_below_the_floor():
    # workload heeft 2 beantwoorders (< DIRECTION_MIN_N): richting telt voor de
    # hele groep niet mee; de spreidingsvlag van growth beslist dan.
    assert DIRECTION_MIN_N == 3
    avgs = {"growth": 6.0, "workload": 6.1}
    resp = {"growth": [4.0] * 5 + [7.0] * 7}
    direction = {"growth": _dir(11, 2),
                 "workload": _dir(2, 2, none_key="wl_none", change_key="wl_volume")}
    rows = _rank(avgs, direction=direction, resp=resp)
    assert rows[0]["key"] == "growth"
    assert rows[0]["tie_break_kind"] == "spread"
    assert rows[1]["direction_change"] is None


def test_direction_does_not_work_outside_the_margin():
    # Verschil 0.5 (> PRIORITY_TIE_MARGIN): richting mag niets flippen. Dit is
    # scenario 01 uit het bevindingenrapport: Leiderschap 6.17 met 10 van de 11
    # vraag om verandering blijft ONDER Groeiperspectief 5.67 met 9 van de 11.
    avgs = {"growth": 5.67, "leadership": 6.17}
    direction = {"growth": _dir(11, 9),
                 "leadership": _dir(11, 10, none_key="ldd_none",
                                    change_key="ldd_feedback")}
    rows = _rank(avgs, direction=direction)
    assert [r["key"] for r in rows] == ["growth", "leadership"]
    assert rows[0]["tie_break_kind"] is None


def test_marking_only_on_rows_that_actually_flipped():
    avgs = {"growth": 6.0, "workload": 6.1}
    direction = {"growth": _dir(11, 3),
                 "workload": _dir(11, 9, none_key="wl_none", change_key="wl_volume")}
    labels = {"growth": "Groeiperspectief", "workload": "Werkdruk en herstelruimte"}
    rows = _rank(avgs, direction=direction, labels=labels)
    assert rows[0]["key"] == "workload"
    note = rows[0]["tie_break_note"]
    assert "Groeiperspectief" in note
    assert "9 van de 11" in note and "3 van de 11" in note
    assert "verandering" in note
    # De gepasseerde rij zelf krijgt nooit een markering.
    assert rows[1]["tie_break_note"] is None


def test_exit_reason_weight_is_marked_and_counted():
    # Bij exit tilt de vertrekreden-weging leadership boven growth, terwijl de
    # zichtbare score van growth lager is. Dat moet gemarkeerd en geteld worden.
    avgs = {"growth": 4.5, "leadership": 4.9}
    reasons = {"leadership": 9, "growth": 4}
    labels = {"growth": "Groeiperspectief", "leadership": "Leiderschap en feedback"}
    rows = _rank(avgs, reasons=reasons, labels=labels, scan_type="exit")
    assert rows[0]["key"] == "leadership"
    assert rows[0]["exit_reason_n"] == 9
    assert rows[0]["tie_break_kind"] == "exit_reason"
    assert "vaker als vertrekreden" in rows[0]["tie_break_note"]
    assert "9 keer tegen 4" in rows[0]["tie_break_note"]


def test_retention_rows_carry_zero_exit_reason_count():
    rows = _rank({"growth": 6.0})
    assert rows[0]["exit_reason_n"] == 0


def test_every_row_has_the_new_fields():
    # Fail Loud: de renderlaag leest deze velden zonder .get()-fallback.
    rows = _rank({"growth": 6.0, "workload": 6.5})
    for r in rows:
        for field in ("direction_answered", "direction_change", "exit_reason_n",
                      "tie_break_kind", "tie_break_note"):
            assert field in r
        assert "_dir_decided" not in r


def test_notes_have_no_em_dashes():
    avgs = {"growth": 6.0, "workload": 6.1}
    direction = {"growth": _dir(11, 3),
                 "workload": _dir(11, 9, none_key="wl_none", change_key="wl_volume")}
    rows = _rank(avgs, direction=direction, labels={"growth": "Groeiperspectief"})
    for r in rows:
        assert "—" not in (r["tie_break_note"] or "")


def test_without_direction_agg_behaviour_is_unchanged():
    # Bestaande aanroepers die geen direction_agg meegeven blijven werken.
    rows = rank_factors("retention", {"growth": 5.2, "workload": 5.4}, {}, {})
    assert [r["key"] for r in rows] == ["growth", "workload"]
    assert rows[0]["direction_change"] is None
```

- [ ] **Stap 2: Draai de tests, verifieer dat ze falen**

```bash
/c/Users/larsh/Desktop/Business/Verisight/.venv/Scripts/python.exe -m pytest tests/test_report_priority_direction_tiebreak.py -q
```

Verwacht: FAIL met `TypeError: rank_factors() got an unexpected keyword argument 'direction_agg'`.

- [ ] **Stap 3: Implementeer de pure laag in `backend/report_priority.py`**

Wijzig de bestaande import:

```python
from backend.products.shared.deepening import DIRECTION_MIN_N, agenda_enrichment
```

Voeg na de constante `EXIT_REASON_WEIGHT` deze twee helpers toe:

```python
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
```

Vervang `rank_factors` volledig door:

```python
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
```

- [ ] **Stap 4: Draai de nieuwe tests plus de bestaande rangorde-tests**

```bash
/c/Users/larsh/Desktop/Business/Verisight/.venv/Scripts/python.exe -m pytest tests/test_report_priority_direction_tiebreak.py tests/test_report_priority.py -q
```

Verwacht: alles PASS. De bestaande vlag-tests (`test_flag_flips_only_within_margin`, `test_flags_do_not_stack`, `test_near_tie_label_requires_same_flagset`) moeten slagen zonder wijziging: bij 0,4 verschil vallen de rijen in verschillende groepen, dus een vlag kan niet flippen. Faalt er een, repareer de groepslogica, niet de test.

- [ ] **Stap 5: Commit de pure laag**

```bash
git add backend/report_priority.py tests/test_report_priority_direction_tiebreak.py && git commit -m "feat(raster): richting als eerste tie-break binnen het gelijkspel, met markeringsdata"
```

- [ ] **Stap 6: Schrijf de falende renderingtests**

Voeg toe aan `tests/test_report_priority_render.py` (helper `_row` eerst uitbreiden, zie stap 7):

```python
def test_markeringsregel_staat_onder_de_rij():
    ranked = [
        _row("workload", "Werkdruk en herstelruimte", 6.1, role="startpunt",
             tie_note="Staat hoger dan Groeiperspectief omdat hier meer mensen om "
                      "verandering vragen (9 van de 11 tegen 3 van de 11).",
             tie_kind="direction"),
        _row("growth", "Groeiperspectief", 6.0, role="tweede"),
    ]
    html = _render(ranked=ranked, resp={r["key"]: [6.0] * 13 for r in ranked})
    assert "meer mensen om verandering vragen" in html
    assert "r-note" in html
    # De markering hoort bij de rij erboven, dus in een eigen rij met colspan.
    assert "colspan" in html


def test_geen_markeringsregel_zonder_flip():
    html = _render()
    assert "r-note" not in html


def test_exit_krijgt_een_vertrekredenkolom():
    ranked = [_row("leadership", "Leiderschap en feedback", 4.9, role="startpunt",
                   exit_reason_n=9),
              _row("growth", "Groeiperspectief", 4.5, role="tweede", exit_reason_n=4)]
    resp = {r["key"]: [4.0] * 13 for r in ranked}
    html_exit = _render(scan_type="exit", ranked=ranked, resp=resp)
    assert "Als vertrekreden genoemd" in html_exit
    assert ">9<" in html_exit
    # Loep Behoud kent geen vertrekredenen en krijgt de kolom dus niet.
    html_ret = _render(scan_type="retention", ranked=ranked, resp=resp)
    assert "Als vertrekreden genoemd" not in html_ret


def test_uitlegregel_noemt_de_richtingvraag_als_eerste_tiebreak():
    for scan in ("retention", "exit"):
        uitleg = RASTER_UITLEG[scan]
        assert "om verandering vragen" in uitleg
        assert "—" not in uitleg
```

Voeg toe aan `tests/test_report_priority_attribution.py`:

```python
def test_direction_flip_names_the_change_demand():
    rows = [
        {"key": "workload", "label": "Werkdruk", "score": 6.1, "base": 6.1,
         "spread_flag": False, "deepening_state": 5, "tie_break_kind": "direction"},
        {"key": "growth", "label": "Groeiperspectief", "score": 6.0, "base": 6.0,
         "spread_flag": False, "deepening_state": 5, "tie_break_kind": None},
    ]
    line = _raster_attribution(rows, "retention")
    assert line == ("De scores lagen vrijwel gelijk; het aantal mensen dat om "
                    "verandering vraagt gaf de doorslag.")
    assert "—" not in line
```

- [ ] **Stap 7: Werk de renderingtest-helper in lockstep bij**

In `tests/test_report_priority_render.py`, vervang `_row` door:

```python
def _row(key, label, score, role=None, state=5, top=None, tie=None,
         spread_n=13, spread_below=2, spread_flag=False, exit_reason_n=0,
         direction_answered=0, direction_change=None,
         tie_kind=None, tie_note=None):
    return {"key": key, "label": label, "score": score, "base": score,
            "spread_n": spread_n, "spread_below": spread_below,
            "spread_flag": spread_flag, "deepening_state": state,
            "deepening_top": top, "flags": int(spread_flag) + int(state == 1),
            "agenda_role": role, "near_tie_with": tie,
            "exit_reason_n": exit_reason_n,
            "direction_answered": direction_answered,
            "direction_change": direction_change,
            "tie_break_kind": tie_kind, "tie_break_note": tie_note}
```

Werk `test_uitlegregel_letterlijk_gepind_beide_varianten` bij: de assertie `"vertrekreden" not in RASTER_UITLEG["retention"]` blijft, de rest blijft zoals het is (de test pint de constante, niet de letterlijke oude zin).

- [ ] **Stap 8: Implementeer de rendering in `backend/report_html.py`**

Vervang `RASTER_UITLEG` door:

```python
RASTER_UITLEG: dict[str, str] = {
    "retention": (
        "Hoe deze volgorde tot stand komt: gesorteerd op score. Liggen scores "
        "binnen 0,3 van elkaar, dan telt eerst waar de meeste mensen om "
        "verandering vragen; is dat ook gelijk, dan een grote spreiding en een "
        "gedeelde toelichting uit de verdieping. Spreiding tonen we vanaf 10 "
        "responses; verdiepingsduiding vanaf 8 beantwoorders per factor; de "
        "vraag om verandering vanaf 3 beantwoorders per factor."),
    "exit": (
        "Hoe deze volgorde tot stand komt: gesorteerd op score, waarbij ook "
        "meeweegt hoe vaak een factor als vertrekreden is genoemd. Liggen "
        "scores binnen 0,3 van elkaar, dan telt eerst waar de meeste mensen om "
        "verandering vragen; is dat ook gelijk, dan een grote spreiding en een "
        "gedeelde toelichting uit de verdieping. Spreiding tonen we vanaf 10 "
        "responses; verdiepingsduiding vanaf 8 beantwoorders per factor; de "
        "vraag om verandering vanaf 3 beantwoorders per factor."),
}
```

In `_prioriteringsraster`, vervang de tabelopbouw (de `deep_th`-regel tot en met de `tabel = f"""..."""`-toekenning) door:

```python
    deep_th = '<th style="width:23%">Verdieping</th>' if deepening_active else ""
    is_exit = scan_type == "exit"
    reason_th = '<th style="width:13%">Als vertrekreden genoemd</th>' if is_exit else ""
    # Kolombreedtes: Loep Vertrek heeft een kolom extra, dus smaller factor- en
    # spreidingsveld. De spreidings-SVG is 200px breed en past in beide.
    w_factor, w_spread = ("22%", "19%") if is_exit else ("27%", "22%")
    n_cols = 4 + int(deepening_active) + int(is_exit)
    body = ""
    for row in ranked:
        top_cls = ' class="r-top"' if row["agenda_role"] else ""
        fl_html = (f'<span class="r-fl">{_h(row["label"])}</span>'
                   if row["agenda_role"] else _h(row["label"]))
        deep_td = (f'<td style="font-size:9.5px;">{_raster_deepening_cell(row, scan_type)}</td>'
                   if deepening_active else "")
        reason_td = (f'<td class="r-mono">{row["exit_reason_n"]}</td>' if is_exit else "")
        body += (f'<tr{top_cls}><td>{fl_html}</td>'
                 f'<td style="color:{_factor_color(row["score"])};">{_score_str(row["score"])}</td>'
                 f'{reason_td}'
                 f'<td>{_spread_cell(row)}</td>'
                 f'{deep_td}'
                 f'<td>{_agenda_cell(row)}</td></tr>')
        # Markeringsregel over de volle breedte (spec ronde 2 par. 1.3): de
        # agendakolom is te smal voor een hele zin, en de regel hoort visueel
        # bij de rij erboven.
        if row["tie_break_note"]:
            body += (f'<tr class="r-note"><td colspan="{n_cols}">'
                     f'{_h(row["tie_break_note"])}</td></tr>')

    tabel = f"""<table class="raster-tbl"><tr>
    <th style="width:{w_factor}">Factor</th><th style="width:12%">Score</th>
    {reason_th}<th style="width:{w_spread}">Spreiding</th>{deep_th}<th style="width:14%">Agenda</th>
  </tr>{body}</table>
  {legenda}
  {gate}
  <div class="r-uitleg">{RASTER_UITLEG[scan_type]}</div>""" if ranked else ""
```

Let op: `legenda` en `gate` worden in de bestaande code vlak boven de `tabel`-toekenning berekend; laat die berekeningen staan waar ze staan en zorg dat de nieuwe `tabel`-toekenning erna komt.

Voeg in `_raster_attribution` de richting-tak toe, direct na `top = rows[0]`:

```python
    if top["tie_break_kind"] == "direction":
        return ("De scores lagen vrijwel gelijk; het aantal mensen dat om "
                "verandering vraagt gaf de doorslag.")
```

Geef bij beide aanroepen van `rank_factors` de richtingdata mee. In de exit-renderer (rond `report_html.py:2610`) en de retention-renderer (rond `:3062`) wordt `direction_agg` al vlak ervoor opgebouwd; voeg toe:

```python
        direction_agg=direction_agg,
```

- [ ] **Stap 9: Voeg de CSS toe in `backend/report_css.py`**

Direct onder de bestaande `.raster-tbl`-regels:

```css
.raster-tbl tr.r-note td { border-top: none; padding: 0 8px 8px; font-size: 9.5px;
  line-height: 1.45; color: #4A6070; }
```

- [ ] **Stap 10: Draai alles en verifieer**

```bash
/c/Users/larsh/Desktop/Business/Verisight/.venv/Scripts/python.exe -m pytest tests/test_report_priority_render.py tests/test_report_priority_attribution.py tests/test_report_priority_consistency.py tests/test_direction_report_block.py tests/test_report_exit_kernzin.py -q
```

Verwacht: alles PASS.

- [ ] **Stap 11: Volledige suite + faalset-diff**

```bash
/c/Users/larsh/Desktop/Business/Verisight/.venv/Scripts/python.exe -m pytest tests/ -q 2>&1 | grep "^FAILED" | sed "s/ - .*//" | sort > /tmp/na.txt; diff docs/superpowers/plans/ronde2-baseline-failset.txt /tmp/na.txt && echo GEEN_REGRESSIES
```

- [ ] **Stap 12: Documenteer de afwijking in de spec en commit**

Voeg in `docs/superpowers/specs/2026-09-11-stresstest-ronde2-design.md` onder par. 1.2 toe:

```markdown
**Implementatie-afwijking (2026-09-11, taak 1):** "alleen als beide rijen een geldig
aantal hebben" is geimplementeerd als een groepsbrede gate: de richting-tie-break telt
binnen een gelijkspel-groep alleen als elke rij in die groep >= DIRECTION_MIN_N
beantwoorders heeft. Reden: een paarsgewijze geldigheidsregel is niet transitief, en een
niet-transitieve comparator laat het sorteerresultaat van de invoervolgorde afhangen. Dat
breekt het determinisme-contract van rank_factors. Bij een groep van twee rijen is het
gedrag identiek aan de spec; bij drie of meer is het strenger.
```

```bash
git add -A && git commit -m "feat(raster): markeringsregel per tie-break, vertrekredenkolom bij Loep Vertrek"
```

---

### Taak 2 (spec par. 2): Vlak profiel op pagina twee

**Waarom:** Bevinding B6, de oorspronkelijke zorg van Lars. In scenario 01 liggen zes factoren tussen 5,67 en 6,33 en zegt pagina twee toch "Groeiperspectief is het eerste gesprekspunt", op een verschil van 0,03 punt. In scenario 04 staat "Rolhelderheid is het eerste gesprekspunt" boven een cel die "7.8/10 relatief sterk" zegt.

**Files:**
- Modify: `backend/report_priority.py` (constante `FLAT_PROFILE_SPAN`)
- Modify: `backend/report_html.py` (`profile_shape`, `_p02_flat_sentence`, de drie renderers)
- Test: `tests/test_report_p02_profielvorm.py` (nieuw)

#### Ontwerp

Een nieuwe pure functie `profile_shape(factor_avgs)` in `report_html.py` levert de vorm van het profiel: aantal kwetsbare factoren, of het profiel vlak is, en de laagste en hoogste factor met score. De telling gebruikt `_shown` (de getoonde, afgeronde score), zodat hij niet kan botsen met `_factor_label` (ronde 1, B15). `FLAT_PROFILE_SPAN` staat in `report_priority.py` omdat het een rangorde-eigenschap is; de functie die hem gebruikt staat in `report_html.py` omdat hij `_shown` en `_factor_label` nodig heeft en anders een circulaire import ontstaat.

- [ ] **Stap 1: Schrijf de falende tests**

Maak `tests/test_report_p02_profielvorm.py`:

```python
"""Vlak profiel op pagina twee (spec ronde 2 par. 2)."""
from backend.report_html import _p02_flat_sentence, profile_shape
from backend.report_priority import FLAT_PROFILE_SPAN

VLAK = {"leadership": 6.17, "culture": 6.33, "growth": 5.67,
        "compensation": 5.70, "workload": 6.05, "role_clarity": 6.20}
EEN_LAGE = {"leadership": 6.8, "culture": 7.2, "growth": 4.5,
            "compensation": 6.6, "workload": 7.0, "role_clarity": 7.5}
ALLES_HOOG = {"leadership": 7.9, "culture": 8.1, "growth": 7.8,
              "compensation": 8.0, "workload": 7.9, "role_clarity": 7.8}


def test_flat_profile_span_is_one_point():
    assert FLAT_PROFILE_SPAN == 1.0


def test_vlak_profiel_wordt_herkend():
    shape = profile_shape(VLAK)
    assert shape["flat"] is True
    assert shape["low_key"] == "growth"
    assert shape["high_key"] == "culture"
    assert shape["n_vulnerable"] == 0
    assert shape["n_factors"] == 6


def test_alles_hoog_is_ook_vlak():
    shape = profile_shape(ALLES_HOOG)
    assert shape["flat"] is True
    assert shape["n_vulnerable"] == 0


def test_een_lage_factor_is_niet_vlak():
    shape = profile_shape(EEN_LAGE)
    assert shape["flat"] is False
    assert shape["n_vulnerable"] == 1
    assert shape["low_key"] == "growth"


def test_span_grens_is_strikt_kleiner_dan_een_punt():
    # Exact 1.0 verschil is GEEN vlak profiel (strikt kleiner dan).
    assert profile_shape({"growth": 5.0, "culture": 6.0})["flat"] is False
    assert profile_shape({"growth": 5.0, "culture": 5.9})["flat"] is True


def test_kwetsbaar_telt_op_de_getoonde_score():
    # 4.96 toont als 5.0 en is dus GEEN kwetsbaar punt (B15-consistentie).
    assert profile_shape({"growth": 4.96, "culture": 7.0})["n_vulnerable"] == 0
    assert profile_shape({"growth": 4.94, "culture": 7.0})["n_vulnerable"] == 1


def test_lege_invoer_geeft_geen_vorm():
    shape = profile_shape({})
    assert shape["n_factors"] == 0
    assert shape["flat"] is False
    assert shape["low_key"] is None


def test_vlakke_zin_noemt_laagste_en_hoogste_met_scores():
    zin = _p02_flat_sentence(profile_shape(VLAK),
                             {"growth": "Groeiperspectief",
                              "culture": "Cultuur en psychologische veiligheid"})
    assert "Geen enkel onderwerp springt eruit" in zin
    assert "alle zes" in zin
    assert "Groeiperspectief" in zin and "5.7" in zin
    assert "Cultuur en psychologische veiligheid" in zin and "6.3" in zin
    assert "Dat is zelf de bevinding." in zin
    assert "—" not in zin


def test_vlakke_zin_telt_het_echte_aantal_factoren():
    zin = _p02_flat_sentence(profile_shape({"growth": 5.0, "culture": 5.5}),
                             {"growth": "Groeiperspectief", "culture": "Cultuur"})
    assert "alle twee" in zin
    assert "alle zes" not in zin
```

- [ ] **Stap 2: Draai de tests, verifieer dat ze falen**

```bash
/c/Users/larsh/Desktop/Business/Verisight/.venv/Scripts/python.exe -m pytest tests/test_report_p02_profielvorm.py -q
```

Verwacht: FAIL met `ImportError: cannot import name 'profile_shape'`.

- [ ] **Stap 3: Voeg de constante toe in `backend/report_priority.py`**

Onder `PRIORITY_TIE_MARGIN`:

```python
# Vlak profiel (spec ronde 2 par. 2.1): het verschil tussen de hoogst en laagst
# scorende werkfactor is STRIKT kleiner dan dit. Een punt op tien is in een zin
# uit te leggen ("binnen een punt van elkaar") en ligt ruim boven de ruis die
# een enkel antwoord in een groep van 45 veroorzaakt.
FLAT_PROFILE_SPAN = 1.0
```

- [ ] **Stap 4: Implementeer in `backend/report_html.py`**

Voeg de import toe bij de bestaande `from backend.report_priority import ...`:

```python
from backend.report_priority import FLAT_PROFILE_SPAN, rank_factors
```

(Behoud de bestaande namen uit die import; voeg `FLAT_PROFILE_SPAN` toe.)

Voeg beide functies toe, direct onder `_factor_label`:

```python
# Aantalwoorden voor de vlak-profiel-zin: "alle zes" leest beter dan "alle 6".
_TELWOORD = {1: "een", 2: "twee", 3: "drie", 4: "vier", 5: "vijf", 6: "zes"}


def profile_shape(factor_avgs: dict[str, float | None]) -> dict[str, Any]:
    """De vorm van het factorprofiel: hoeveel kwetsbaar, en ligt alles dicht bijeen.

    Telt op de getoonde (afgeronde) score via _shown, zodat deze telling nooit
    kan botsen met het bandlabel dat de lezer ernaast ziet (ronde 1, B15).
    Alleen organisatiefactoren; SDT-dimensies horen hier niet in.
    """
    pairs = [(fk, _shown(v)) for fk, v in factor_avgs.items()
             if fk in ORG_FACTOR_KEYS and v is not None]
    if not pairs:
        return {"n_factors": 0, "n_vulnerable": 0, "flat": False, "span": None,
                "low_key": None, "low_score": None, "high_key": None, "high_score": None}
    pairs.sort(key=lambda t: (t[1], t[0]))
    low_key, low_score = pairs[0]
    high_key, high_score = pairs[-1]
    span = round(high_score - low_score, 2)
    return {
        "n_factors": len(pairs),
        "n_vulnerable": sum(1 for _fk, v in pairs if v < 5.0),
        "flat": len(pairs) > 1 and span < FLAT_PROFILE_SPAN,
        "span": span,
        "low_key": low_key, "low_score": low_score,
        "high_key": high_key, "high_score": high_score,
    }


def _p02_flat_sentence(shape: dict[str, Any], labels: dict[str, str]) -> str:
    """De vlak-profiel-zin op pagina twee (spec ronde 2 par. 2.2).

    Zegt expliciet dat er niets uitspringt, met de echte uiterste waarden erbij,
    zodat de lezer de conclusie zelf kan narekenen.
    """
    if not shape["flat"]:
        raise ValueError("_p02_flat_sentence: alleen bij een vlak profiel")
    telwoord = _TELWOORD.get(shape["n_factors"], str(shape["n_factors"]))
    low = labels.get(shape["low_key"], shape["low_key"])
    high = labels.get(shape["high_key"], shape["high_key"])
    return (f"Geen enkel onderwerp springt eruit: alle {telwoord} liggen binnen "
            f"een punt van elkaar (laagste {low} {_score_str(shape['low_score'])}, "
            f"hoogste {high} {_score_str(shape['high_score'])}). "
            f"Dat is zelf de bevinding.")
```

- [ ] **Stap 5: Draai de tests**

```bash
/c/Users/larsh/Desktop/Business/Verisight/.venv/Scripts/python.exe -m pytest tests/test_report_p02_profielvorm.py -q
```

Verwacht: PASS.

- [ ] **Stap 6: Commit**

```bash
git add -A && git commit -m "feat(p02): profielvorm en de zin die zegt dat er niets uitspringt"
```

De inbouw in de kernzin gebeurt in taak 3, die de hele openingszin herschrijft. Bouw hem hier nog niet in de renderers in: dan zou je dezelfde code in taak 3 opnieuw moeten omgooien.

---

### Taak 3 (spec par. 5 + par. 2.2): Kernzin volgt het aantal kwetsbare onderwerpen

**Waarom:** Bevinding B17. Scenario 01 (geen enkele factor kwetsbaar) en scenario 05 (alle zes kwetsbaar, 42 van de 45 onder de 5 op Leiderschap) kregen dezelfde zin. Na de polariteitsfix van ronde 1 verschillen de bandlabels wel, maar structureel is er nog niets dat meebeweegt met hoeveel er kwetsbaar scoort.

**Files:**
- Modify: `backend/report_html.py` (nieuwe `_p02_opening`, de drie kernzin-takken, de why-cellen, `_bestuurlijke_read`)
- Test: `tests/test_report_p02_kernzin.py` (nieuw)
- Modify: bestaande kernzin-contracttests in lockstep (zie stap 6)

#### Ontwerp

Eén gedeelde functie `_p02_opening(...)` bouwt de eerste zin van pagina twee voor alle drie de producten, volgens par. 5.2 met de vlak-variant uit par. 2.2 als eerste geval. De productstaart blijft per renderer: Loep Vertrek plakt er de meest genoemde vertrekreden achter.

**Verfijning van de spec, te documenteren (vaste regel 8):** par. 5.2 geeft alleen retention-copy ("Behoud vraagt aandacht op ..."). De bevinding geldt product-breed, dus de router werkt voor alle drie met een eigen onderwerpwoord per scan. En par. 5.2 zegt "Het behoudssignaal-getal blijft in de cel eronder staan met zijn band" zonder te zeggen welke cel; dat wordt een nieuwe onderbouwingscel, zodat het getal met zijn band zichtbaar blijft en niet stilzwijgend verdwijnt.

- [ ] **Stap 1: Schrijf de falende tests**

Maak `tests/test_report_p02_kernzin.py`:

```python
"""Kernzin p.02 beweegt mee met het aantal kwetsbare onderwerpen (spec ronde 2 par. 5)."""
import pytest

from backend.report_html import _p02_opening, profile_shape

LABELS = {"leadership": "Leiderschap", "culture": "Cultuur", "growth": "Groeiperspectief",
          "compensation": "Beloning", "workload": "Werkdruk", "role_clarity": "Rolhelderheid"}
VLAK = {"leadership": 6.17, "culture": 6.33, "growth": 5.67,
        "compensation": 5.70, "workload": 6.05, "role_clarity": 6.20}
EEN_LAGE = {"leadership": 6.8, "culture": 7.2, "growth": 4.5,
            "compensation": 6.6, "workload": 7.0, "role_clarity": 7.5}
TWEE_LAAG = {"leadership": 6.8, "culture": 7.2, "growth": 4.5,
             "compensation": 6.6, "workload": 4.8, "role_clarity": 7.5}
ALLES_LAAG = {"leadership": 3.6, "culture": 4.3, "growth": 3.8,
              "compensation": 4.4, "workload": 3.5, "role_clarity": 4.2}
NIET_VLAK_GEEN_KWETSBAAR = {"leadership": 5.2, "culture": 7.4, "growth": 5.1,
                            "compensation": 6.6, "workload": 6.0, "role_clarity": 7.0}


def _open(avgs, scan="retention", primary=None, **kw):
    shape = profile_shape(avgs)
    return _p02_opening(scan_type=scan, shape=shape, labels=LABELS,
                        primary_key=primary or shape["low_key"], **kw)


def test_vlak_profiel_opent_met_de_vlakke_zin():
    zin = _open(VLAK)
    assert zin.startswith("Geen enkel onderwerp springt eruit")
    assert "Dat is zelf de bevinding." in zin


def test_geen_kwetsbaar_en_niet_vlak():
    # Laagste factor is hier ook het startpunt: dan mag de zin dat zeggen.
    zin = _open(NIET_VLAK_GEEN_KWETSBAAR, primary="growth")
    assert zin == ("Geen onderwerp scoort kwetsbaar. Groeiperspectief scoort het "
                   "laagst en is het eerste gesprekspunt.")


def test_geen_kwetsbaar_en_startpunt_wijkt_af_van_de_laagste():
    # Bij Loep Vertrek tilt de vertrekredenweging een andere factor bovenaan,
    # en binnen een gelijkspelgroep kan een tie-break dat ook. De zin mag dan
    # niet suggereren dat de laagste factor het startpunt is.
    zin = _open(NIET_VLAK_GEEN_KWETSBAAR, scan="exit", primary="leadership")
    assert "Groeiperspectief scoort het laagst" in zin
    assert "als eerste gesprekspunt kiest Loep Leiderschap" in zin
    assert "Groeiperspectief scoort het laagst en is" not in zin


def test_een_kwetsbaar_onderwerp():
    zin = _open(EEN_LAGE)
    assert "een onderwerp" in zin
    assert "Groeiperspectief" in zin and "4.5" in zin
    assert "twee onderwerpen" not in zin


def test_twee_kwetsbare_onderwerpen():
    zin = _open(TWEE_LAAG)
    assert "twee onderwerpen" in zin
    assert "Groeiperspectief" in zin and "Werkdruk" in zin


def test_drie_of_meer_is_breed_onder_druk():
    zin = _open(ALLES_LAAG)
    assert "breed onder druk" in zin
    assert "6 van de 6" in zin


def test_drie_scenarios_geven_drie_verschillende_zinnen():
    # Scenario 01 (vlak), 02 (een lage factor), 05 (alles laag).
    zinnen = {_open(VLAK), _open(EEN_LAGE), _open(ALLES_LAAG)}
    assert len(zinnen) == 3


def test_startpuntgrond_bij_richting():
    zin = _open(VLAK, tie_break_kind="direction", change=(9, 11))
    assert "Als startpunt kiest Loep" in zin
    assert "9 van de 11" in zin
    assert "om verandering" in zin


def test_startpuntgrond_bij_alleen_score():
    zin = _open(VLAK, tie_break_kind=None, next_delta=0.03)
    assert "de laagste score" in zin
    assert "0,03" in zin
    assert "weeg dat mee" in zin


def test_startpuntgrond_bij_niets_nodig():
    zin = _open(VLAK, direction_state_key="none_needed")
    assert "vragen nergens dringend om verandering" in zin
    assert "Bespreek of een startpunt nu nodig is" in zin


def test_per_product_eigen_onderwerpwoord():
    ret = _open(EEN_LAGE, scan="retention")
    ex = _open(EEN_LAGE, scan="exit")
    ob = _open(EEN_LAGE, scan="onboarding")
    assert ret != ex != ob
    assert "Behoud" in ret
    assert "—" not in ret + ex + ob


def test_geen_em_dashes_en_geen_ik_vorm():
    for avgs in (VLAK, EEN_LAGE, TWEE_LAAG, ALLES_LAAG, NIET_VLAK_GEEN_KWETSBAAR):
        for scan in ("retention", "exit", "onboarding"):
            zin = _open(avgs, scan=scan)
            assert "—" not in zin
            assert " ik " not in zin.lower()


def test_leeg_profiel_levert_lege_zin():
    # Zonder factorprofiel is er geen openingszin; de degraded tak van p.02
    # (ronde 1, B2) neemt het dan over.
    assert _p02_opening(scan_type="retention", shape=profile_shape({}),
                        labels=LABELS, primary_key=None) == ""
```

- [ ] **Stap 2: Draai de tests, verifieer dat ze falen**

```bash
/c/Users/larsh/Desktop/Business/Verisight/.venv/Scripts/python.exe -m pytest tests/test_report_p02_kernzin.py -q
```

Verwacht: FAIL met `ImportError: cannot import name '_p02_opening'`.

- [ ] **Stap 3: Implementeer `_p02_opening` in `backend/report_html.py`**

Direct onder `_p02_flat_sentence`:

```python
# Onderwerpwoord per product voor de kernzin (spec ronde 2 par. 5.2, verfijnd
# naar drie producten): dezelfde structuur, de taal van het product.
_P02_DRUKWOORD = {
    "retention": ("Behoud vraagt aandacht op", "Behoud staat breed onder druk"),
    "exit": ("Het vertrekbeeld wijst naar", "Het vertrekbeeld wijst breed naar meerdere onderwerpen"),
    "onboarding": ("De landing van nieuwe medewerkers vraagt aandacht op",
                   "De landing van nieuwe medewerkers staat breed onder druk"),
}


def _p02_opening(*, scan_type: str, shape: dict[str, Any], labels: dict[str, str],
                 primary_key: str | None,
                 tie_break_kind: str | None = None,
                 change: tuple[int, int] | None = None,
                 next_delta: float | None = None,
                 direction_state_key: str | None = None) -> str:
    """De eerste zin van pagina twee (spec ronde 2 par. 2.2 en par. 5.2).

    Beweegt mee met hoeveel onderwerpen kwetsbaar scoren, en zegt het expliciet
    als er niets uitspringt. Zonder factorprofiel leeg: de degraded tak van
    _bestuurlijke_read (ronde 1, B2) draagt dan het verhaal.
    """
    if not shape["n_factors"] or primary_key is None:
        return ""
    k = shape["n_vulnerable"]
    zacht, breed = _P02_DRUKWOORD[scan_type]
    if k == 0 and shape["flat"]:
        kop = _p02_flat_sentence(shape, labels)
    elif k == 0:
        # De laagst scorende factor is NIET altijd het startpunt: bij Loep
        # Vertrek verschuift de vertrekredenweging de base, en binnen een
        # gelijkspelgroep kan richting, spreiding of verdieping de volgorde
        # bepalen. Vallen ze samen, dan mag de zin dat zeggen; verschillen ze,
        # dan noemt de zin ze apart en legt de bronregel eronder uit waarom.
        laagste = labels[shape["low_key"]]
        if shape["low_key"] == primary_key:
            kop = (f"Geen onderwerp scoort kwetsbaar. {laagste} scoort het laagst "
                   f"en is het eerste gesprekspunt.")
        else:
            kop = (f"Geen onderwerp scoort kwetsbaar. {laagste} scoort het laagst; "
                   f"als eerste gesprekspunt kiest Loep {labels[primary_key]}.")
    elif k <= 2:
        vuln = [(fk, v) for fk, v in
                sorted(((fk, s) for fk, s in shape["factors_low_to_high"]), key=lambda t: (t[1], t[0]))
                if v < 5.0][:2]
        onderwerp = "een onderwerp" if k == 1 else "twee onderwerpen"
        namen = " en ".join(f"{labels[fk]} ({_score_str(v)})" for fk, v in vuln)
        kop = f"{zacht} {onderwerp}: {namen}."
    else:
        kop = (f"{breed}: {k} van de {shape['n_factors']} onderwerpen scoren "
               f"kwetsbaar.")
    if k == 0 and not shape["flat"]:
        return kop            # noemt het startpunt al
    return f"{kop} {_p02_startpunt_zin(labels[primary_key], tie_break_kind=tie_break_kind, change=change, next_delta=next_delta, direction_state_key=direction_state_key)}"


def _p02_startpunt_zin(primary_label: str, *, tie_break_kind: str | None,
                       change: tuple[int, int] | None, next_delta: float | None,
                       direction_state_key: str | None) -> str:
    """Welk onderwerp Loep als startpunt kiest, met de grond erbij."""
    if direction_state_key == "none_needed":
        return ("Je mensen vragen nergens dringend om verandering. Bespreek of een "
                "startpunt nu nodig is, of dat dit beeld eerst gedeeld wordt.")
    if tie_break_kind == "direction" and change:
        a, b = change
        return (f"Als startpunt kiest Loep {primary_label}: daar vragen de meeste "
                f"mensen om verandering ({a} van de {b}).")
    if next_delta is not None:
        delta = f"{next_delta:.2f}".replace(".", ",")
        return (f"Als startpunt kiest Loep {primary_label}, de laagste score. Het "
                f"verschil met de volgende is klein ({delta}); weeg dat mee in de "
                f"bespreking.")
    return f"Als startpunt kiest Loep {primary_label}."
```

Voeg in `profile_shape` het veld `factors_low_to_high` toe aan de returnwaarde (beide takken), zodat `_p02_opening` de kwetsbare factoren kan opsommen zonder de invoer opnieuw te filteren:

```python
        "factors_low_to_high": pairs,
```

(in de lege tak: `"factors_low_to_high": []`.)

- [ ] **Stap 4: Draai de tests**

```bash
/c/Users/larsh/Desktop/Business/Verisight/.venv/Scripts/python.exe -m pytest tests/test_report_p02_kernzin.py -q
```

Verwacht: PASS. Faalt `test_leeg_profiel_levert_lege_zin`, controleer dat `profile_shape({})` ook `factors_low_to_high` teruggeeft.

- [ ] **Stap 5: Sluit de kernzin aan in de drie renderers**

In de **retention**-renderer (rond `report_html.py:3139`), vervang de `exec_line`-tak door:

```python
    _shape = profile_shape(fa)
    _primary = _raster_rows[0]["key"] if _raster_rows else None
    _tk = _raster_rows[0]["tie_break_kind"] if _raster_rows else None
    _chg = ((_raster_rows[0]["direction_change"], _raster_rows[0]["direction_answered"])
            if _raster_rows and _raster_rows[0]["direction_change"] is not None else None)
    _delta = (round(_raster_rows[1]["score"] - _raster_rows[0]["score"], 2)
              if len(_raster_rows) > 1 else None)
    _dstate = (direction_state(direction_agg[_primary], _primary)["state"]
               if direction_agg and _primary and _primary in direction_agg else None)
    exec_line = _p02_opening(scan_type=ST, shape=_shape, labels=_raster_labels,
                             primary_key=_primary, tie_break_kind=_tk, change=_chg,
                             next_delta=_delta, direction_state_key=_dstate)
    if not exec_line:
        exec_line = ("Zie de behoudscontext en de responsbasis voor wat dit rapport "
                     "wel toont.")
```

`_raster_labels` is het labels-dict dat al aan `rank_factors` wordt meegegeven (`{fk: _fl(fk, ST) for fk in ORG_FACTOR_KEYS}`); hijs die toekenning zo nodig omhoog zodat hij hier beschikbaar is.

Doe hetzelfde in de **onboarding**-renderer (rond `:3563`), met als fallback de bestaande "Zie het checkpointoverzicht ..."-zin. Onboarding heeft geen `direction_agg`, dus `_dstate=None` en `_chg=None`.

In de **exit**-renderer (rond `:2669`), vervang de eerste zin en houd de vertrekreden-staart:

```python
    exec_line = _p02_opening(scan_type="exit", shape=profile_shape(fa),
                             labels=_raster_labels, primary_key=_primary,
                             tie_break_kind=_tk, change=_chg, next_delta=_delta,
                             direction_state_key=_dstate)
    if exec_line and er_top:
        exec_line = f"{exec_line} {er_top} is de meest genoemde vertrekreden."
    if not exec_line:
        exec_line = "Zie de vertrekcontext en de responsbasis voor wat dit rapport wel toont."
```

- [ ] **Stap 6: Zet het signaalgetal in een eigen onderbouwingscel**

Het behoudssignaal (retention), de checkpointscore (onboarding) en de frictiescore (exit) staan nu in de kernzin. Die plek is ingenomen, dus verhuizen ze naar een cel, met hun band ernaast. Voeg bij alle drie de renderers deze cel vooraan `why_cells` toe (retention getoond; pas label en variabele per product aan):

```python
    _signal_cell = (f'<td><div class="sc-l">Behoudssignaal</div>'
                    f'<div class="sc-v">{_score_str(signal)}</div>'
                    f'<div class="sc-b">{_h(band_lbl)}</div></td>') if signal else ""
```

Labels per product: retention "Behoudssignaal", onboarding "Checkpointscore", exit "Frictiescore" (met `rdsp` als waarde en `fl` als band).

- [ ] **Stap 7: Werk de contract-tests in lockstep bij**

Deze tests pinnen de oude kernzin en moeten mee (draai ze en pas alleen de gepinde copy aan, niet de intentie):

```bash
/c/Users/larsh/Desktop/Business/Verisight/.venv/Scripts/python.exe -m pytest tests/test_report_signal_polarity.py tests/test_report_exit_kernzin.py tests/test_report_priority_consistency.py tests/test_report_degraded_page_two.py tests/test_report_onboarding_degraded_agenda.py -q
```

`test_retention_kernzin_shows_health_value_and_matching_band` en `test_onboarding_kernzin_shows_health_value_and_matching_band` verwachten het getal in de kernzin. Het getal staat nu in de onderbouwingscel: pas de assertie aan zodat hij het getal met bijpassende band in het rapport zoekt, niet specifiek in `br-kernzin`. Noteer in de commit welke tests je hebt aangepast en waarom.

- [ ] **Stap 8: Volledige suite + faalset-diff, dan commit**

```bash
/c/Users/larsh/Desktop/Business/Verisight/.venv/Scripts/python.exe -m pytest tests/ -q 2>&1 | grep "^FAILED" | sed "s/ - .*//" | sort > /tmp/na.txt; diff docs/superpowers/plans/ronde2-baseline-failset.txt /tmp/na.txt && echo GEEN_REGRESSIES
```

Documenteer de twee verfijningen uit het ontwerp in de spec (par. 5.2), dan:

```bash
git add -A && git commit -m "feat(p02): kernzin volgt het aantal kwetsbare onderwerpen, signaalgetal naar een eigen cel"
```

---

### Taak 4 (spec par. 6): Respons heeft gevolgen

**Waarom:** Bevinding B19. Scenario 16 (30% respons) en 17 (90%) leveren structureel identieke rapporten. Bij een uitstroommeting waar 105 van de 150 mensen niets invulden is dat de eerste vraag die een MT-lid stelt.

**Files:**
- Modify: `backend/report_html.py` (constanten, `_responsbasis`, de drie kernzin-takken, `build_report_data`)
- Test: `tests/test_report_respons_gevolgen.py` (nieuw)

#### Ontwerp: waar komt de noemer vandaan

`build_report_data` zet nu `n_invited = len(camp.respondents)`. Bij de self-send-flow bestaan er geen rijen voor mensen die niet invulden, dus dan is `n_invited == n_completed` en zou het rapport 100% respons tonen, wat onwaar is. De noemer wordt daarom in deze volgorde bepaald:

1. `camp.delivery_record.invited_count` als die bestaat en groter is dan nul.
2. Anders `len(camp.respondents)`, maar alleen als dat groter is dan het aantal afgeronde vragenlijsten (de managed flow heeft dan echte non-responder-rijen).
3. Anders: **onbekend**. Geen percentage, wel de zin dat het aantal genodigden niet is vastgelegd.

- [ ] **Stap 1: Schrijf de falende tests**

Maak `tests/test_report_respons_gevolgen.py`:

```python
"""Responspercentage heeft gevolgen voor de stelligheid (spec ronde 2 par. 6)."""
from backend.report_html import (
    RESPONSE_CAUTION_RATE,
    RESPONSE_INDICATIVE_RATE,
    _respons_caution,
    _respons_kernzin_staart,
)


def test_drempels_zijn_benoemde_constanten():
    assert RESPONSE_CAUTION_RATE == 0.5
    assert RESPONSE_INDICATIVE_RATE == 0.3


def test_geen_waarschuwing_bij_voldoende_respons():
    assert _respons_caution(45, 50) == ""
    assert _respons_kernzin_staart(45, 50) == ("", False)


def test_waarschuwing_onder_de_helft():
    zin = _respons_caution(45, 150)
    assert "Minder dan de helft heeft ingevuld (45 van de 150)." in zin
    assert "het beeld van wie meedeed" in zin
    assert "—" not in zin


def test_staart_onder_de_helft_maar_niet_indicatief():
    # Scenario 16: 30% is niet onder de 30%-drempel, dus alleen de caution-staart.
    staart, indicatief = _respons_kernzin_staart(45, 150)
    assert staart == " (op basis van 45 van de 150 genodigden)"
    assert indicatief is False


def test_indicatief_onder_de_dertig_procent():
    # Scenario 16b: 45 van de 180 is 25%.
    staart, indicatief = _respons_kernzin_staart(45, 180)
    assert indicatief is True
    assert "45 van de 180" in staart


def test_noemer_onbekend_geeft_geen_percentage_maar_een_zin():
    zin = _respons_caution(45, None)
    assert "niet vastgelegd" in zin
    assert "%" not in zin
    staart, indicatief = _respons_kernzin_staart(45, None)
    assert staart == ""
    assert indicatief is False


def test_exacte_grens_van_de_helft_geeft_geen_waarschuwing():
    # Strikt kleiner dan: precies 50% is geen "minder dan de helft".
    assert _respons_caution(50, 100) == ""
```

Voeg een integratietest toe in hetzelfde bestand die de kernzin controleert:

```python
def test_indicatief_beeld_verzacht_het_startpunt():
    from backend.report_html import _p02_respons_prefix
    zin = _p02_respons_prefix("Als startpunt kiest Loep Groeiperspectief.",
                              indicatief=True)
    assert zin.startswith("Indicatief beeld:")
    assert "mogelijk startpunt" in zin
    assert "Als startpunt" not in zin
```

- [ ] **Stap 2: Draai de tests, verifieer dat ze falen**

```bash
/c/Users/larsh/Desktop/Business/Verisight/.venv/Scripts/python.exe -m pytest tests/test_report_respons_gevolgen.py -q
```

Verwacht: FAIL met `ImportError`.

- [ ] **Stap 3: Implementeer in `backend/report_html.py`**

Bij de overige drempelconstanten bovenin:

```python
# Respons (spec ronde 2 par. 6.1). Onder de helft is het beeld dat van wie
# meedeed, niet van de organisatie; onder de 30% is het hooguit indicatief.
# Beide vergelijken STRIKT kleiner dan, zodat precies de helft geen
# waarschuwing krijgt.
RESPONSE_CAUTION_RATE = 0.5
RESPONSE_INDICATIVE_RATE = 0.3


def _response_rate(completed: int, invited: int | None) -> float | None:
    """Responsgraad, of None als het aantal genodigden niet bekend is."""
    if not invited or invited <= 0:
        return None
    return completed / invited


def _respons_caution(completed: int, invited: int | None) -> str:
    """Zin bij de responsbasis; leeg zodra de respons de helft haalt."""
    rate = _response_rate(completed, invited)
    if rate is None:
        return ("Het aantal genodigden is niet vastgelegd; het responspercentage is "
                "daarom niet bekend.")
    if rate >= RESPONSE_CAUTION_RATE:
        return ""
    return (f"Minder dan de helft heeft ingevuld ({completed} van de {invited}). "
            f"Lees de uitkomsten als het beeld van wie meedeed, niet van de hele "
            f"organisatie.")


def _respons_kernzin_staart(completed: int, invited: int | None) -> tuple[str, bool]:
    """(staart achter de kernzin, is het beeld indicatief)."""
    rate = _response_rate(completed, invited)
    if rate is None or rate >= RESPONSE_CAUTION_RATE:
        return "", False
    return (f" (op basis van {completed} van de {invited} genodigden)",
            rate < RESPONSE_INDICATIVE_RATE)


def _p02_respons_prefix(zin: str, *, indicatief: bool) -> str:
    """Verzacht de stelligheid van de kernzin bij een zeer lage respons."""
    if not indicatief:
        return zin
    return "Indicatief beeld: " + zin.replace("Als startpunt kiest Loep",
                                              "Als mogelijk startpunt kiest Loep")
```

- [ ] **Stap 4: Bepaal de noemer in `build_report_data`**

Vervang de bestaande `n_invited`-toekenning (rond `report_html.py:2106`):

```python
    # Noemer voor het responspercentage (spec ronde 2 par. 6.1). Bij de
    # self-send-flow bestaan er geen rijen voor wie niet invulde, dus dan zou
    # len(respondents) een respons van 100% suggereren. Liever geen getal dan
    # een onwaar getal.
    _record_invited = getattr(camp.delivery_record, "invited_count", None)
    if _record_invited and _record_invited > 0:
        n_invited: int | None = _record_invited
    elif len(respondents) > len(responses):
        n_invited = len(respondents)
    else:
        n_invited = None
    n_completed = len(responses)
    completion = round(n_completed / n_invited * 100, 1) if n_invited else 0.0
```

- [ ] **Stap 5: Toon de gevolgen in het rapport**

In `_responsbasis`: als `invited` None is, vervang de cellen "Uitgenodigd" en "Respons" door één cel "Afgerond" plus de zin uit `_respons_caution`. Als `invited` bekend is maar de respons onder de helft ligt, zet de zin onder de tabel:

```python
    caution = _respons_caution(completed, invited)
    caution_html = (f'<p class="trustline" style="margin-top:6px;">{_h(caution)}</p>'
                    if caution else "")
```

Voeg `caution_html` toe aan de returnwaarde van `_responsbasis`, direct onder de tabel.

In de drie renderers, na het bepalen van `exec_line` (taak 3):

```python
    _staart, _indicatief = _respons_kernzin_staart(data["n_completed"], data["n_invited"])
    if exec_line:
        exec_line = _p02_respons_prefix(exec_line, indicatief=_indicatief) + _staart
```

- [ ] **Stap 6: Draai de tests, de suite en de faalset-diff**

```bash
/c/Users/larsh/Desktop/Business/Verisight/.venv/Scripts/python.exe -m pytest tests/test_report_respons_gevolgen.py tests/test_report_p02_kernzin.py -q
```

```bash
/c/Users/larsh/Desktop/Business/Verisight/.venv/Scripts/python.exe -m pytest tests/ -q 2>&1 | grep "^FAILED" | sed "s/ - .*//" | sort > /tmp/na.txt; diff docs/superpowers/plans/ronde2-baseline-failset.txt /tmp/na.txt && echo GEEN_REGRESSIES
```

Let op: `_responsbasis` wordt door alle drie de renderers aangeroepen en door `test_pdf_redesign.py` en `test_report_html_design.py` aangeraakt. Werk die in lockstep bij als ze de oude celstructuur pinnen.

- [ ] **Stap 7: Commit**

```bash
git add -A && git commit -m "feat(p02): lage respons remt de stelligheid, onbekende noemer geeft geen percentage"
```

---

### Taak 5 (spec par. 4): Richtingstaten `plurality` en `split_none`

**Waarom:** Bevinding B12. In scenario 11 kozen 27 van de 62 dezelfde richting met een voorsprong van 12 op nummer twee, en het rapport zegt "Geen eenduidige richting". In scenario 13 kozen 14 mensen "niets nodig" en 14 een verandering, op een factor die 4,5 scoort met 30 van de 45 onder de 5. Dat is inhoudelijk het interessantste resultaat in de hele matrix en het rapport zegt er niets over.

**Files:**
- Modify: `backend/products/shared/deepening.py` (`direction_state`, twee constanten)
- Modify: `backend/report_html.py` (`_direction_card_cell`, `_direction_p02_line`, de aanroepers geven de factorscore mee)
- Test: `tests/test_direction_state_plurality.py` (nieuw)
- Modify: `tests/test_direction_aggregation.py`, `tests/test_direction_report_block.py` (lockstep waar nodig)

- [ ] **Stap 1: Schrijf de falende tests**

Maak `tests/test_direction_state_plurality.py`:

```python
"""Staten plurality en split_none (spec ronde 2 par. 4)."""
from backend.products.shared.deepening import (
    DIRECTION_PLURALITY_MIN_SHARE,
    DIRECTION_SPLIT_NONE_MAX_SCORE,
    direction_state,
)


def _agg(counts, answered=None):
    n = answered if answered is not None else sum(counts.values())
    return {"lowest_n": n, "offered": n, "answered": n, "skipped": 0, "counts": counts}


def test_drempels_zijn_benoemde_constanten():
    assert DIRECTION_PLURALITY_MIN_SHARE == 0.35
    assert DIRECTION_SPLIT_NONE_MAX_SCORE == 5.0


def test_scenario_11_grootste_groep_zonder_meerderheid():
    # 27 van de 62 (44%) met een voorsprong van 12: een duidelijke grootste groep.
    agg = _agg({"gr_visibility": 27, "gr_none": 15, "gr_conversation": 10,
                "gr_criteria": 6, "gr_time": 4}, answered=62)
    st = direction_state(agg, "growth", factor_score=5.2)
    assert st["state"] == "plurality"
    assert st["top_key"] == "gr_visibility"
    assert st["top_n"] == 27
    assert st["second_n"] == 15


def test_plurality_vereist_de_share_en_de_voorsprong():
    # 34% haalt de share niet.
    agg = _agg({"gr_visibility": 34, "gr_none": 30, "gr_conversation": 36})
    assert direction_state(agg, "growth", factor_score=5.2)["state"] == "divided"
    # Wel de share, maar voorsprong 1.
    agg = _agg({"gr_visibility": 10, "gr_none": 9, "gr_conversation": 6})
    assert direction_state(agg, "growth", factor_score=5.2)["state"] == "divided"


def test_scenario_13_verdeeld_over_wel_of_niets_op_een_lage_factor():
    # 14 niets tegenover 14 verandering op een factor die 4,5 scoort.
    agg = _agg({"gr_none": 14, "gr_visibility": 14, "gr_conversation": 3})
    st = direction_state(agg, "growth", factor_score=4.5)
    assert st["state"] == "split_none"
    assert st["none_n"] == 14
    assert st["top_key"] == "gr_visibility"


def test_split_none_alleen_op_een_kwetsbare_factor():
    agg = _agg({"gr_none": 14, "gr_visibility": 14, "gr_conversation": 3})
    # Zelfde verdeling, factor scoort 6,2: geen split_none.
    assert direction_state(agg, "growth", factor_score=6.2)["state"] != "split_none"


def test_split_none_ook_bij_een_verschil_van_een():
    # "grootste of gedeeld-grootste": niets mag er een achter liggen.
    agg = _agg({"gr_none": 13, "gr_visibility": 14, "gr_conversation": 3})
    assert direction_state(agg, "growth", factor_score=4.5)["state"] == "split_none"
    agg = _agg({"gr_none": 12, "gr_visibility": 14, "gr_conversation": 3})
    assert direction_state(agg, "growth", factor_score=4.5)["state"] != "split_none"


def test_bestaande_staten_blijven_voorgaan():
    # too_few
    assert direction_state(_agg({"gr_visibility": 2}), "growth",
                           factor_score=4.0)["state"] == "too_few"
    # none_needed (strikte meerderheid) gaat voor split_none
    agg = _agg({"gr_none": 9, "gr_visibility": 4})
    assert direction_state(agg, "growth", factor_score=4.0)["state"] == "none_needed"
    # clear gaat voor plurality
    agg = _agg({"gr_visibility": 9, "gr_conversation": 2, "gr_none": 2})
    assert direction_state(agg, "growth", factor_score=4.0)["state"] == "clear"


def test_anders_wordt_nooit_een_plurality():
    # *_other heeft geen opdrachtvorm; die mag nooit als richting gepresenteerd.
    agg = _agg({"gr_other": 20, "gr_none": 10, "gr_visibility": 8})
    assert direction_state(agg, "growth", factor_score=5.5)["state"] == "divided"


def test_factor_score_is_optioneel_voor_bestaande_aanroepers():
    agg = _agg({"gr_visibility": 9, "gr_conversation": 2})
    assert direction_state(agg, "growth")["state"] == "clear"


def test_payload_heeft_altijd_dezelfde_vorm():
    for agg, score in ((_agg({"gr_visibility": 2}), 4.0),
                       (_agg({"gr_none": 14, "gr_visibility": 14}), 4.5),
                       (_agg({"gr_visibility": 27, "gr_none": 15}, answered=62), 5.2)):
        st = direction_state(agg, "growth", factor_score=score)
        for key in ("state", "n", "ranked", "top_key", "top_n", "second_n", "none_n"):
            assert key in st
```

Voeg toe aan `tests/test_direction_report_block.py`:

```python
def test_plurality_card_names_the_largest_group_without_claiming_a_majority():
    agg = {"lowest_n": 62, "offered": 62, "answered": 62, "skipped": 0,
           "counts": {"gr_visibility": 27, "gr_none": 15, "gr_conversation": 10,
                      "gr_criteria": 6, "gr_time": 4}}
    html = _direction_card_cell("startpunt", label="Groeiperspectief", agg=agg,
                                scan_type="retention", factor_key="growth",
                                n_total=180, factor_score=5.2)
    assert "De grootste groep kiest" in html
    assert "zonder meerderheid" in html
    assert "volgens de grootste groep" in html
    assert "volgens de meeste" not in html
    assert "—" not in html


def test_split_none_card_makes_the_split_the_subject():
    agg = {"lowest_n": 31, "offered": 31, "answered": 31, "skipped": 0,
           "counts": {"gr_none": 14, "gr_visibility": 14, "gr_conversation": 3}}
    html = _direction_card_cell("startpunt", label="Groeiperspectief", agg=agg,
                                scan_type="retention", factor_key="growth",
                                n_total=45, factor_score=4.5)
    assert "een deel zegt dat hier niets hoeft" in html
    assert "14" in html
    assert "4.5" in html
    assert "dat verschil zelf het gesprek" in html


def test_p02_line_for_the_new_states():
    from backend.report_html import _direction_p02_line
    plural = {"growth": {"lowest_n": 62, "offered": 62, "answered": 62, "skipped": 0,
                         "counts": {"gr_visibility": 27, "gr_none": 15,
                                    "gr_conversation": 10}}}
    line = _direction_p02_line(plural, "growth", "retention", factor_score=5.2)
    assert "volgens de grootste groep" in line
    assert "27 van de 62" in line
    split = {"growth": {"lowest_n": 31, "offered": 31, "answered": 31, "skipped": 0,
                        "counts": {"gr_none": 14, "gr_visibility": 14}}}
    line = _direction_p02_line(split, "growth", "retention", factor_score=4.5)
    assert "verdeeld" in line
    assert "14" in line
```

- [ ] **Stap 2: Draai, verifieer falen**

```bash
/c/Users/larsh/Desktop/Business/Verisight/.venv/Scripts/python.exe -m pytest tests/test_direction_state_plurality.py -q
```

Verwacht: FAIL met `ImportError: cannot import name 'DIRECTION_PLURALITY_MIN_SHARE'`.

- [ ] **Stap 3: Implementeer in `backend/products/shared/deepening.py`**

Bij de bestaande `DIRECTION_*`-constanten:

```python
# Grootste groep zonder meerderheid (spec ronde 2 par. 4.2). Onder ruim een
# derde van de beantwoorders is "de grootste groep" geen zinvolle uitspraak
# meer; daarboven met een voorsprong van minstens 2 wel.
DIRECTION_PLURALITY_MIN_SHARE = 0.35
# Verdeeld over wel of niets (spec ronde 2 par. 4.3): alleen op een factor die
# kwetsbaar scoort. Dezelfde grens als _factor_label en ZONE_LOW gebruiken,
# zodat er geen tweede kwetsbaar-definitie in het product ontstaat.
DIRECTION_SPLIT_NONE_MAX_SCORE = 5.0
```

Vervang `direction_state`:

```python
def direction_state(agg: dict[str, Any], factor_key: str,
                    factor_score: float | None = None) -> dict[str, Any]:
    """Staat van het richtingblok voor een factor (spec par. 5.4, uitgebreid in
    stresstest ronde 2 par. 4), geevalueerd in de volgorde
    too_few -> none_needed -> clear -> split_none -> plurality -> divided.

    factor_score is nodig voor split_none: die staat bestaat alleen op een
    factor die kwetsbaar scoort. Zonder score valt die tak weg en blijft het
    gedrag gelijk aan voor ronde 2.

    Retourneert altijd {state, n, top_key, top_n, second_n, none_n, ranked}.
    """
    n = agg["answered"]
    counts: dict[str, int] = agg.get("counts") or {}
    ranked = sorted(counts.items(), key=lambda kv: (-kv[1], kv[0]))
    base: dict[str, Any] = {"n": n, "ranked": ranked, "top_key": None, "top_n": 0,
                            "second_n": 0, "none_n": 0}
    if n < DIRECTION_MIN_N:
        return {**base, "state": "too_few"}
    if not counts:
        raise ValueError(
            f"direction_state: answered={n} maar geen counts voor {factor_key!r}")
    none_key = next((k for k in sorted(counts) if k.endswith("_none")), None)
    none_n = counts.get(none_key, 0) if none_key else 0
    base["none_n"] = none_n
    # Strikte meerderheid (> 0.5), niet >= 0.5: de kop van dit blok zegt "volgens
    # de meeste betrokkenen", en precies de helft is niet "de meeste" (B11).
    if none_key is not None and none_n / n > 0.5:
        return {**base, "state": "none_needed",
                "top_key": none_key, "top_n": none_n}
    top_key, top_n = ranked[0]
    second_n = ranked[1][1] if len(ranked) > 1 else 0
    base.update(top_key=top_key, top_n=top_n, second_n=second_n)
    if top_key.endswith("_other") and n >= DIRECTION_OTHER_WARN_N:
        logger.warning("direction: *_other is topoptie voor %s - optieset review nodig",
                       factor_key)
    if (not top_key.endswith(("_none", "_other"))
            and top_n / n >= 0.5 and top_n - second_n >= 2):
        return {**base, "state": "clear"}
    # Vanaf hier kijken we naar de grootste optie die om verandering vraagt.
    change_ranked = [(k, c) for k, c in ranked if k != none_key]
    if not change_ranked:
        return {**base, "state": "divided"}
    change_key, change_n = change_ranked[0]
    # Verdeeld over wel of niets, op een onderwerp dat laag scoort: het verschil
    # tussen die twee groepen is zelf de bevinding.
    if (factor_score is not None and factor_score < DIRECTION_SPLIT_NONE_MAX_SCORE
            and none_key is not None and none_n >= change_n - 1
            and not change_key.endswith("_other")):
        return {**base, "state": "split_none",
                "top_key": change_key, "top_n": change_n}
    # Grootste groep zonder meerderheid. *_other blijft uitgesloten: die optie
    # heeft geen opdrachtvorm, dus er valt niets te tonen wat er moet gebeuren.
    rest = [c for k, c in ranked if k != change_key]
    runner_up = max(rest) if rest else 0
    if (not change_key.endswith("_other")
            and change_n / n >= DIRECTION_PLURALITY_MIN_SHARE
            and change_n - runner_up >= 2):
        return {**base, "state": "plurality",
                "top_key": change_key, "top_n": change_n, "second_n": runner_up}
    return {**base, "state": "divided"}
```

- [ ] **Stap 4: Render de twee nieuwe staten in `backend/report_html.py`**

Bij de `DIRECTION_HEAD_*`-constanten:

```python
DIRECTION_HEAD_PLURALITY = "De grootste groep kiest {opt}, zonder meerderheid."
DIRECTION_HEAD_SPLIT_NONE = ("Verdeeld: een deel zegt dat hier niets hoeft, een even "
                             "groot deel vraagt om {opt}.")
```

Geef `_direction_card_cell` en `_direction_p02_line` een `factor_score`-parameter en geef die door aan `direction_state`. Voeg in `_direction_card_cell` de twee takken toe, tussen `clear` en de `else`-tak:

```python
    elif st["state"] == "plurality":
        opt = texts[st["top_key"]]
        head = DIRECTION_HEAD_PLURALITY.format(opt=_lc(opt))
        tweede = ""
        if len(st["ranked"]) > 1:
            k2, c2 = st["ranked"][1] if st["ranked"][0][0] == st["top_key"] else st["ranked"][0]
            tweede = f" {c2} kozen {_lc(texts[k2])}."
        src = (f"{st['top_n']} van de {n} bij wie {_lc(label)} het laagst scoorde kozen "
               f"{_lc(opt)}.{tweede} Volgens de grootste groep is dit wat er moet "
               f"gebeuren: {direction_imperative(scan_type, factor_key, st['top_key'])}")
    elif st["state"] == "split_none":
        opt = texts[st["top_key"]]
        head = DIRECTION_HEAD_SPLIT_NONE.format(opt=_lc(opt))
        src = (f"{st['none_n']} kozen 'Niets, dit zit hier goed'; {st['top_n']} kozen "
               f"{_lc(opt)}. Op een onderwerp dat laag scoort "
               f"({_score_str(factor_score)}) is dat verschil zelf het gesprek. Wat de "
               f"andere helft vraagt: "
               f"{direction_imperative(scan_type, factor_key, st['top_key'])}")
```

Voeg in `_direction_p02_line` toe, na de `clear`-tak:

```python
    if st["state"] == "plurality":
        return (f"Wat er moet gebeuren volgens de grootste groep: "
                f"{direction_imperative(scan_type, factor_key, st['top_key'])} "
                f"({st['top_n']} van de {n}, zonder meerderheid).")
    if st["state"] == "split_none":
        return (f"Wat er moet gebeuren: je mensen zijn hierover verdeeld "
                f"({st['none_n']} zegt niets nodig, {st['top_n']} vraagt om "
                f"{_lc(direction_option_texts(scan_type, factor_key)[st['top_key']])}).")
```

Geef de factorscore mee bij elke aanroep. In `_wat_moet_gebeuren_block` is dat `factor_score=r["score"]` uit de raster-rij; in de renderers bij `_direction_p02_line` is dat de score van de startpuntfactor.

- [ ] **Stap 5: Draai de tests en de suite**

```bash
/c/Users/larsh/Desktop/Business/Verisight/.venv/Scripts/python.exe -m pytest tests/test_direction_state_plurality.py tests/test_direction_report_block.py tests/test_direction_aggregation.py -q
```

```bash
/c/Users/larsh/Desktop/Business/Verisight/.venv/Scripts/python.exe -m pytest tests/ -q 2>&1 | grep "^FAILED" | sed "s/ - .*//" | sort > /tmp/na.txt; diff docs/superpowers/plans/ronde2-baseline-failset.txt /tmp/na.txt && echo GEEN_REGRESSIES
```

- [ ] **Stap 6: Commit**

```bash
git add -A && git commit -m "feat(richting): grootste groep zonder meerderheid en verdeeld over wel of niets"
```

---

### Taak 6 (spec par. 3): Segmentstartpunt alleen bij een echt verschil, rij-cap weg

**Waarom:** Bevinding B7 en B8. In 16 van de 17 scenario's met segmenten wijst het zwaarste visuele element van het rapport een afdeling aan op grond van 0,00 tot 0,30 punt verschil, twee keer met een aantoonbaar onjuiste "laagste"-claim (scenario 01: de restgroep staat op 5,86 in dezelfde tabel, lager dan de aangewezen Sales op 6,02). En in scenario 10 verdwijnen vijf afdelingen met 7 tot 9 responses in de restgroep, tegen een intro die vijf als grens noemt.

**Files:**
- Modify: `backend/report_html.py` (`_department_segment_rows`, `_segment_block`, constante)
- Modify: `backend/report_css.py` (tabel mag breken, navy-blok niet)
- Test: `tests/test_report_segment_startpunt.py` (nieuw)

- [ ] **Stap 1: Schrijf de falende tests**

Maak `tests/test_report_segment_startpunt.py`:

```python
"""Segmentstartpunt en rij-cap (spec ronde 2 par. 3)."""
from backend.report_html import (
    SEGMENT_START_MIN_DELTA,
    _department_segment_rows,
    _segment_block,
)


def _resp(dept, n, score):
    return [{"department": dept, "signal_score": score} for _ in range(n)]


def _rows(*specs):
    out = []
    for dept, n, score in specs:
        out.extend(_resp(dept, n, score))
    return out


def test_drempel_is_een_benoemde_constante():
    assert SEGMENT_START_MIN_DELTA == 0.3


def test_alle_afdelingen_met_genoeg_respons_krijgen_een_rij():
    # Scenario 10: twaalf afdelingen van 7 tot 9. Geen enkele mag verdwijnen.
    specs = [(f"Afdeling {i}", 7 + (i % 3), 5.0 + i * 0.1) for i in range(12)]
    rows = _department_segment_rows(_rows(*specs))
    assert len(rows) == 12
    assert not any(r["is_pooled"] for r in rows)
    namen = {r["department"] for r in rows}
    assert namen == {s[0] for s in specs}


def test_te_kleine_afdelingen_blijven_gebundeld():
    rows = _department_segment_rows(_rows(("Groot", 10, 6.0), ("Ook groot", 8, 6.5),
                                          ("Klein", 3, 4.0), ("Ook klein", 3, 4.0)))
    assert [r["department"] for r in rows if r["is_pooled"]] == ["Overige afdelingen"]
    assert {r["department"] for r in rows if not r["is_pooled"]} == {"Groot", "Ook groot"}


def test_startpunt_alleen_bij_voldoende_verschil_en_omvang():
    # Verschil 2.5, beide n >= 10: wel een startpunt.
    html = _segment_block(_department_segment_rows(
        _rows(("Operations", 14, 4.5), ("Sales", 12, 7.0))), scan_type="retention")
    assert "Startpunt voor de bespreking" in html
    assert "Operations" in html


def test_geen_startpunt_bij_een_klein_verschil():
    # Scenario 01: 6.02 tegen 6.10, verschil 0.08.
    html = _segment_block(_department_segment_rows(
        _rows(("Sales", 13, 6.02), ("Finance", 12, 6.10))), scan_type="retention")
    assert "De afdelingen liggen dicht bij elkaar" in html
    assert "heeft de laagste score" not in html
    assert "Geen afdeling vraagt als eerste aandacht" in html


def test_geen_startpunt_bij_een_exacte_gelijkspel():
    # Scenario 02 en 19: twee afdelingen exact gelijk.
    html = _segment_block(_department_segment_rows(
        _rows(("Sales", 12, 6.0), ("Finance", 12, 6.0))), scan_type="retention")
    assert "heeft de laagste score" not in html
    assert "dicht bij elkaar" in html


def test_geen_startpunt_als_een_van_beide_te_klein_is():
    # Verschil groot genoeg, maar de tweede afdeling heeft er maar 6.
    html = _segment_block(_department_segment_rows(
        _rows(("Operations", 12, 4.5), ("Sales", 6, 7.0))), scan_type="retention")
    assert "heeft de laagste score" not in html


def test_restgroep_wordt_genoemd_als_die_lager_uitkomt():
    # Scenario 01: "Overige afdelingen" 5.86 onder de aangewezen Sales 6.02.
    rows = _department_segment_rows(
        _rows(("Sales", 13, 5.0), ("Finance", 12, 7.0),
              ("Klein", 3, 4.0), ("Ook klein", 3, 4.0)))
    html = _segment_block(rows, scan_type="retention")
    assert "Overige afdelingen" in html
    assert "wordt daarom niet als startpunt genoemd" in html


def test_geen_em_dashes_in_de_nieuwe_copy():
    html = _segment_block(_department_segment_rows(
        _rows(("Sales", 13, 6.02), ("Finance", 12, 6.10))), scan_type="retention")
    assert "—" not in html
```

- [ ] **Stap 2: Draai, verifieer falen**

```bash
/c/Users/larsh/Desktop/Business/Verisight/.venv/Scripts/python.exe -m pytest tests/test_report_segment_startpunt.py -q
```

- [ ] **Stap 3: Haal de cap weg in `_department_segment_rows`**

Vervang het blok vanaf `visible, overflow = rows[:8], rows[8:]`:

```python
    # Geen rijlimiet meer (spec ronde 2 par. 3.2): de intro belooft dat alleen
    # afdelingen onder de vijf responses gebundeld worden, en dat was met een
    # cap van acht rijen aantoonbaar onwaar (scenario 10: vijf afdelingen met 7
    # tot 9 responses verdwenen, waaronder de grootste van de meting).
    rest = [s for d, v in grouped.items() if d not in eligible for s in v]
    if len(rest) >= MIN_SEGMENT_N:
        rows.append({"department": "Overige afdelingen", "n": len(rest),
                     "avg": round(sum(rest) / len(rest), 2), "scores": sorted(rest),
                     "is_pooled": True})
    return rows
```

Werk de docstring bij: "max 8 rijen" vervalt, "Overige afdelingen altijd onderaan" blijft (de pooled rij wordt geappend na de sortering).

- [ ] **Stap 4: Herschrijf het navy-blok in `_segment_block`**

Voeg bovenin `report_html.py` bij de andere drempels toe:

```python
# Afdelingsstartpunt (spec ronde 2 par. 3.1): pas een afdeling aanwijzen als het
# verschil met de volgende dit haalt EN beide afdelingen groot genoeg zijn voor
# een spreidingsbeeld. Onder deze grens is "de laagste afdeling" niet te
# onderscheiden van de volgende en wordt het zwaarste blok van het rapport een
# uitspraak over ruis.
SEGMENT_START_MIN_DELTA = 0.3
```

Vervang het `lowest = segment_rows[0]` / `low_note`-blok door:

```python
    named = [r for r in segment_rows if not r.get("is_pooled", False)]
    pooled = next((r for r in segment_rows if r.get("is_pooled", False)), None)
    low_note = ""
    if len(named) >= 2:
        lowest, runner_up = named[0], named[1]
        delta = round(runner_up["avg"] - lowest["avg"], 2)
        big_enough = (lowest["n"] >= MIN_DISTRIBUTION_N
                      and runner_up["n"] >= MIN_DISTRIBUTION_N)
        if delta >= SEGMENT_START_MIN_DELTA and big_enough:
            _low_inv = lowest.get("invited")
            _low_basis = (f'{lowest["n"]} van de {_low_inv} uitgenodigden vulden in'
                          if _low_inv else f'{lowest["n"]} responses')
            theme_sentence = ""
            low_info = (factor_rows or {}).get(lowest["department"])
            if low_info and low_info.get("factors"):
                _lfk, _lavg, _lnf = low_info["factors"][0]
                _llbl = _h(_lc(_fl(_lfk, scan_type)))
                if lowest["n"] >= MIN_DISTRIBUTION_N:
                    theme_sentence = f' Het laagst scorende thema daar is {_llbl} ({_lavg:.1f}/10).'
                else:
                    theme_sentence = (f' Het laagst scorende thema daar is {_llbl} '
                                      f'({_h(_factor_label(_lavg).lower())}).')
            rest_sentence = ""
            if pooled and pooled["avg"] < lowest["avg"]:
                rest_sentence = (
                    f' De restgroep &ldquo;Overige afdelingen&rdquo; scoort lager '
                    f'({pooled["avg"]:.1f}), maar is samengesteld uit kleine afdelingen '
                    f'en wordt daarom niet als startpunt genoemd.')
            low_note = (
                f'<div class="navy-anchor">'
                f'<div class="navy-anchor-eyebrow">Startpunt voor de bespreking</div>'
                f'<p><strong>{_h(lowest["department"])}</strong> heeft de laagste score '
                f'({lowest["avg"]:.1f}/10; {_low_basis}). Gebruik dit om te toetsen wat hier '
                f'speelt, geen ranking of oordeel.{theme_sentence}{rest_sentence}</p></div>')
        else:
            highest = named[-1]
            low_note = (
                f'<div class="navy-anchor">'
                f'<div class="navy-anchor-eyebrow">Startpunt voor de bespreking</div>'
                f'<p>De afdelingen liggen dicht bij elkaar (laagste '
                f'{_h(named[0]["department"])} {named[0]["avg"]:.1f}, hoogste '
                f'{_h(highest["department"])} {highest["avg"]:.1f}). Geen afdeling vraagt '
                f'als eerste aandacht; kijk naar het organisatiebeeld.</p></div>')
```

Fail Loud: het navy-blok verdwijnt nooit stilzwijgend. Bij minder dan twee benoemde afdelingen blijft `low_note` leeg, precies zoals nu, en dekt `_segment_status_block` die staat al af.

- [ ] **Stap 5: CSS voor een tabel die over de paginagrens mag lopen**

In `backend/report_css.py`, onder de `.item-tbl`-regels:

```css
/* Segmenttabel mag over een paginagrens lopen sinds de rijlimiet verviel
   (ronde 2 par. 3.2); de kop herhaalt dan niet, dus houd de rijen zelf heel. */
.item-tbl tr { break-inside: avoid; }
```

En bescherm het navy-blok, dat die bescherming nog niet had terwijl `.agenda-dark` hem wel heeft:

```css
.navy-anchor { break-inside: avoid; }
```

(Voeg de regel toe aan de bestaande `.navy-anchor`-declaratie in plaats van een tweede blok te maken.)

- [ ] **Stap 6: Draai de tests en de suite**

```bash
/c/Users/larsh/Desktop/Business/Verisight/.venv/Scripts/python.exe -m pytest tests/test_report_segment_startpunt.py tests/test_segment_report.py -q
```

```bash
/c/Users/larsh/Desktop/Business/Verisight/.venv/Scripts/python.exe -m pytest tests/ -q 2>&1 | grep "^FAILED" | sed "s/ - .*//" | sort > /tmp/na.txt; diff docs/superpowers/plans/ronde2-baseline-failset.txt /tmp/na.txt && echo GEEN_REGRESSIES
```

- [ ] **Stap 7: Commit**

```bash
git add -A && git commit -m "fix(segment): startpunt alleen bij een echt verschil, elke afdeling met genoeg respons een rij"
```

---

### Taak 7 (spec par. 7b): Spreidingsstrook vertrekintentie op dezelfde as als de rij

**Waarom:** Bijvangst uit de ronde-1-herbeoordeling. De rij vertrekintentie toont 3,4 en de strook eronder toont voor dezelfde vraag 7,6, omdat de strook de waarden omkeert (`11 - v`) om de kleuren te laten kloppen. De lezer ziet twee getallen voor één vraag.

**Files:**
- Modify: `backend/report_distribution.py` (`distribution_svg`, `distribution_block`, `score_distribution`)
- Modify: `backend/report_html.py` (`_behoudscontext`)
- Test: `tests/test_report_distribution_invert.py` (nieuw)

#### Ontwerp

In plaats van de waarden om te keren, keert de strook alleen zijn **kleurschaal** om. De stippen en de gemiddelde-marker staan dan op hun echte waarde (3,4 blijft 3,4, net als in de rij erboven), maar laag kleurt teal (weinig vertrekgedachten is goed) en hoog rood. De zone-tellingen wisselen van betekenis mee, en het label onder de strook zegt in één zin hoe je hem leest.

- [ ] **Stap 1: Schrijf de falende tests**

Maak `tests/test_report_distribution_invert.py`:

```python
"""Omgekeerde kleurschaal zonder de waarden te verdraaien (spec ronde 2 par. 7b)."""
from backend.report_distribution import distribution_block, score_distribution


LOW_TURNOVER = [2.0, 3.0, 3.0, 3.5, 3.5, 4.0, 4.0, 4.0, 2.5, 3.0, 3.5, 4.5]


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


def test_kleuren_zijn_omgedraaid():
    html = distribution_block(LOW_TURNOVER, invert_scale=True)
    # Lage vertrekintentie is goed: de tellingen noemen dat sterk, niet kwetsbaar.
    assert "Weinig vertrekgedachten 12" in html
    assert "Kwetsbaar" not in html


def test_normale_schaal_blijft_onveranderd():
    html = distribution_block([6.0] * 12)
    assert "Kwetsbaar" in html and "Sterk" in html
    assert "Weinig vertrekgedachten" not in html


def test_onder_de_drempel_nog_steeds_leeg():
    assert distribution_block([3.0] * 9, invert_scale=True) == ""
```

Voeg toe aan de retention-rendertests (bijvoorbeeld `tests/test_report_signal_polarity.py`):

```python
def test_vertrekintentie_rij_en_strook_lopen_niet_uiteen():
    from backend.report_html import _behoudscontext
    vals = [2.0, 3.0, 3.0, 3.5, 3.5, 4.0, 4.0, 4.0, 2.5, 3.0, 3.5, 4.5]
    gem = round(sum(vals) / len(vals), 1)
    html = _behoudscontext(retention_score=6.0, stay_intent=7.0, turnover=gem,
                           engagement=6.5, intent_resp={"turnover": vals})
    assert f"{gem:.1f}/10" in html
    assert f"GEM {gem:.1f}" in html
    assert "hoe hoger, hoe meer vertrekgedachten" in html.lower()
```

- [ ] **Stap 2: Draai, verifieer falen**

```bash
/c/Users/larsh/Desktop/Business/Verisight/.venv/Scripts/python.exe -m pytest tests/test_report_distribution_invert.py -q
```

Verwacht: FAIL met `TypeError: distribution_block() got an unexpected keyword argument 'invert_scale'`.

- [ ] **Stap 3: Implementeer in `backend/report_distribution.py`**

Voeg de omgekeerde zone-labels toe naast de bestaande kleuren:

```python
# Omgekeerde as (spec ronde 2 par. 7b): bij vertrekintentie is een hoge score
# slecht. De waarden blijven ongemoeid, alleen de kleur en de tellingnamen
# draaien om, zodat de strook hetzelfde getal toont als de rij erboven.
_ZONE_LABELS = ("Kwetsbaar", "Aandacht", "Sterk")
_ZONE_LABELS_INVERT = ("Weinig vertrekgedachten", "Aandacht", "Veel vertrekgedachten")
```

Geef `_zone_color`, `distribution_svg` en `distribution_block` een `invert_scale`-parameter:

```python
def _zone_color(v: float, invert_scale: bool = False) -> str:
    low, high = (_C_HIGH, _C_LOW) if invert_scale else (_C_LOW, _C_HIGH)
    if v < ZONE_LOW:
        return low
    if v < ZONE_HIGH:
        return _C_MID
    return high
```

In `distribution_svg`: geef `invert_scale` door aan `_zone_color` en wissel de drie zone-achtergronden en onderranden om (de linkerzone krijgt `_C_HIGH` bij inversie, de rechter `_C_LOW`). De x-posities, stippen en de gemiddelde-marker blijven exact zoals ze zijn: de waarden veranderen niet.

In `distribution_block`: geef `invert_scale` door, kies de labelset en wissel de kleuren van de tellingen mee:

```python
    labels = _ZONE_LABELS_INVERT if invert_scale else _ZONE_LABELS
    c_low, c_high = ((_C_HIGH, _C_LOW) if invert_scale else (_C_LOW, _C_HIGH))
```

en gebruik die in de `counts`-HTML. De polarisatiezin blijft ongewijzigd van vorm; controleer wel dat hij bij inversie niet "laagste zone" als slecht aanduidt. Maak de zin daarom neutraal:

```python
            f'<strong>Verdeeld beeld:</strong> {low} van de {n} respondenten scoren in '
            f'de laagste zone, {high} in de hoogste. Dit gemiddelde beschrijft twee '
            f'verschillende ervaringen.</p>'
```

(Dat is de bestaande tekst en die is al neutraal; laat hem staan.)

- [ ] **Stap 4: Gebruik de nieuwe parameter in `_behoudscontext`**

Vervang de stroken-lus:

```python
    for key, label, invert in (
        ("stay", "Blijfintentie", False),
        # Vertrekintentie is hoog=slecht. Eerder werd de waarde gespiegeld
        # (11 - v) zodat de kleuren klopten, maar dan toonde de strook 7.6 waar
        # de rij erboven 3.4 zei: twee getallen voor dezelfde vraag. Nu draait
        # alleen de kleurschaal om en blijft het getal hetzelfde (par. 7b).
        ("turnover", "Vertrekintentie (hoe hoger, hoe meer vertrekgedachten)", True),
        ("engagement", "Bevlogenheid", False),
    ):
        vals = [v for v in (intent_resp or {}).get(key, []) if v is not None]
        blk = distribution_block(vals, width=660, height=52, dot_r=4.5, label_size=9,
                                 invert_scale=invert)
```

- [ ] **Stap 5: Draai de tests en de suite, dan commit**

```bash
/c/Users/larsh/Desktop/Business/Verisight/.venv/Scripts/python.exe -m pytest tests/test_report_distribution_invert.py tests/test_report_signal_polarity.py -q
```

```bash
/c/Users/larsh/Desktop/Business/Verisight/.venv/Scripts/python.exe -m pytest tests/ -q 2>&1 | grep "^FAILED" | sed "s/ - .*//" | sort > /tmp/na.txt; diff docs/superpowers/plans/ronde2-baseline-failset.txt /tmp/na.txt && echo GEEN_REGRESSIES
```

```bash
git add -A && git commit -m "fix(spreiding): vertrekintentie toont hetzelfde getal als de rij, alleen de kleurschaal draait"
```

---

### Taak 8 (spec par. 7): Loep Start eerlijk labelen

**Waarom:** Bevinding B18. Loep Start heeft geen verdiepingsvragen, geen richtingvraag en geen prioriteringsraster, maar de pagina's heten wel "Verdieping: X" en nergens staat dat dit product die laag mist. Op de gespreksagenda staat dezelfde constatering twee keer, en de claim "het laagst van het hele beeld" klopt niet: de `min()` kijkt alleen binnen de eerste factor.

**Files:**
- Modify: `frontend/components/marketing/home-page-content.tsx` (scankaart)
- Modify: `frontend/components/marketing/producten-content.tsx` (lead en output)
- Modify: `backend/report_html.py` (p.02-regel, paginatitels, gespreksagenda)
- Test: `tests/test_report_onboarding_eerlijk.py` (nieuw)
- Modify: frontend-tests in lockstep waar ze de copy pinnen

- [ ] **Stap 1: Schrijf de falende backend-tests**

Maak `tests/test_report_onboarding_eerlijk.py`:

```python
"""Loep Start zegt wat het wel en niet levert (spec ronde 2 par. 7)."""
import pytest

from backend.report_html import ONBOARDING_GEEN_VERDIEPING_NOTE


def test_de_note_zegt_wat_er_ontbreekt_en_wat_er_wel_is():
    note = ONBOARDING_GEEN_VERDIEPING_NOTE
    assert "geen verdiepingsvragen" in note
    assert "geen richtingvraag" in note
    assert "waar het wringt bij nieuwe medewerkers" in note
    assert "volgende versie" in note
    assert "—" not in note
    assert " ik " not in note.lower()
```

Voeg toe aan `tests/test_report_onboarding_degraded_agenda.py` (of maak het nieuwe bestand groter):

```python
def test_start_paginas_heten_geen_verdieping(onboarding_html):
    assert "Verdieping:" not in onboarding_html


def test_de_agenda_constateert_niet_twee_keer_hetzelfde(onboarding_html):
    assert onboarding_html.count("Laagst scorende stelling in het cijferbeeld") <= 1
    assert "scoort de groep het laagst van het hele beeld" not in onboarding_html


def test_bij_gelijkspel_geen_strikt_laagste_claim():
    from backend.report_html import _laagste_stelling_zin
    # Twee stellingen delen de laagste score: geen "het laagst"-claim.
    zin = _laagste_stelling_zin("Rolhelderheid", "Ik weet wat er van mij wordt verwacht",
                                5.1, strikt_laagste=False)
    assert "een van de laagst scorende stellingen" in zin
    zin = _laagste_stelling_zin("Rolhelderheid", "Ik weet wat er van mij wordt verwacht",
                                5.1, strikt_laagste=True)
    assert "de laagst scorende stelling" in zin
```

Gebruik voor `onboarding_html` de bestaande fixture uit dat bestand; bestaat die niet, bouw hem met dezelfde helper die de andere onboarding-tests gebruiken.

- [ ] **Stap 2: Draai, verifieer falen**

```bash
/c/Users/larsh/Desktop/Business/Verisight/.venv/Scripts/python.exe -m pytest tests/test_report_onboarding_eerlijk.py -q
```

- [ ] **Stap 3: Voeg de note toe in `backend/report_html.py`**

```python
# Loep Start levert de verdiepings- en richtinglaag nog niet (spec ronde 2
# par. 7). Zolang dat zo is, zegt het rapport dat zelf, op de plek waar de lezer
# anders naar die laag zou zoeken.
ONBOARDING_GEEN_VERDIEPING_NOTE = (
    "Deze scan bevat nog geen verdiepingsvragen en geen richtingvraag. Het rapport "
    "laat zien waar het wringt bij nieuwe medewerkers; wat er volgens hen moet "
    "gebeuren volgt in een volgende versie.")
```

Geef `_bestuurlijke_read` een parameter `scope_note: str = ""` en render die direct onder de kernzin:

```python
    scope_html = (f'<p class="trustline" style="margin-top:-14px;margin-bottom:18px;">'
                  f'{_h(scope_note)}</p>') if scope_note else ""
```

Geef in de onboarding-renderer `scope_note=ONBOARDING_GEEN_VERDIEPING_NOTE` mee.

- [ ] **Stap 4: Hernoem de paginatitels**

In de onboarding-renderer, vervang in de `priority_fkeys`-lus `f"Verdieping: {_lbl}"` door `_lbl`, en de fallback-opener `f'<span class="slabel">Verdieping: {_h(lbl)}</span>'` in `_ob_factor_detail` door `f'<span class="slabel">{_h(lbl)}</span>'`. Ook de lege-staat-opener `ch.opener("Verdieping: prioritaire factoren")` wordt `ch.opener("Factoren met de meeste aandacht")`.

Laat exit en retention ongemoeid: die hebben wel een verdieping.

- [ ] **Stap 5: Ontdubbel de gespreksagenda en maak de claim waar**

Voeg een helper toe:

```python
def _laagste_stelling_zin(factor_label: str, stelling: str, score: float,
                          *, strikt_laagste: bool) -> str:
    """Een constatering over de laagst scorende stelling, precies een keer.

    strikt_laagste is alleen waar als geen enkele andere stelling in het hele
    rapport dezelfde score haalt; bij gelijkspel is "het laagst" onwaar en
    spreekt de appendix het rapport tegen.
    """
    welke = ("de laagst scorende stelling" if strikt_laagste
             else "een van de laagst scorende stellingen")
    return (f"Bespreek eerst '{stelling}' binnen {factor_label.lower()} "
            f"({score:.1f}/10). Dat is {welke} in het cijferbeeld.")
```

In de onboarding-renderer: bereken of de gekozen stelling strikt de laagste is over **alle** itemscores in het rapport, niet alleen binnen de eerste factor:

```python
    _alle_scores = [v for v in oim.values() if v is not None]
    _strikt = (_ob_primary_low is not None
               and sum(1 for v in _alle_scores if v == _ob_primary_low[2]) == 1)
    _ob_primary_theme = (_laagste_stelling_zin(_fl(_ob_primary_fk, ST),
                                               _ob_primary_low[1], _ob_primary_low[2],
                                               strikt_laagste=_strikt)
                         if _ob_primary_low else low_lbl)
```

En geef `_eerste_managementspoor` voor onboarding een lege `primary_why` mee, zodat "Laagst scorende stelling in het cijferbeeld (5.1/10)" niet als tweede constatering onder dezelfde kaart verschijnt. De informatie staat nu volledig in de zin erboven.

- [ ] **Stap 6: Werk de site-copy bij**

In `frontend/components/marketing/home-page-content.tsx`, de scankaart Loep Start:

```tsx
    body: 'Wij meten vroeg hoe nieuwe medewerkers landen. Helder groepsbeeld, geen individuele beoordeling. De verdieping (waarom, volgens je mensen) en het blok "wat er moet gebeuren" komen in een volgende versie.',
```

In `frontend/components/marketing/producten-content.tsx`, het Loep Start-blok:

```tsx
    output: 'Rapport met de vroege landing in rol, leiding en team op groepsniveau. De verdieping (waarom, volgens je mensen) en het blok "wat er moet gebeuren" komen in een volgende versie.',
```

Let op de guard in `frontend/lib/marketing-portfolio-cleanup.test.ts`: de tekenreeks `Start scan` is verboden op deze pagina's en `title: 'Loep Start'` moet blijven staan. De nieuwe copy bevat geen van beide problemen, maar draai de test.

- [ ] **Stap 7: Draai backend, frontend en de faalset-diffs**

```bash
/c/Users/larsh/Desktop/Business/Verisight/.venv/Scripts/python.exe -m pytest tests/test_report_onboarding_eerlijk.py tests/test_report_onboarding_degraded_agenda.py -q
```

```bash
/c/Users/larsh/Desktop/Business/Verisight/.venv/Scripts/python.exe -m pytest tests/ -q 2>&1 | grep "^FAILED" | sed "s/ - .*//" | sort > /tmp/na.txt; diff docs/superpowers/plans/ronde2-baseline-failset.txt /tmp/na.txt && echo GEEN_REGRESSIES
```

```bash
cd frontend && npx tsc --noEmit 2>&1 | grep -c "error TS"
```

Verwacht: `133` (baseline).

```bash
cd frontend && npx vitest run 2>&1 | tail -6
```

Verwacht: `65 failed | 1115 passed`, met dezelfde testnamen als de baseline.

- [ ] **Stap 8: Commit**

```bash
git add -A && git commit -m "feat(start): Loep Start zegt in rapport en op de site wat het nog niet levert"
```

---

### Taak 9 (spec par. 9): Verificatie, scenario 16b en de matrix

**Files:**
- Modify: `scripts/stresstest_report.py` (scenario 16b)
- Modify: `docs/rapport-stresstest-2026-09-10.md` (sectie "Na ronde 2")
- Modify: `docs/examples/*.pdf`, `frontend/public/examples/*.pdf` (geregenereerd)

- [ ] **Stap 1: Voeg scenario 16b toe**

In `scripts/stresstest_report.py`, direct na scenario 16 in `SCENARIOS`:

```python
    Scenario("16b_respons_25", "Respons 25% (45 van 180)",
             "Onder de indicatieve drempel: remt het rapport zijn stelligheid?",
             n=45, invited=180,
             factors={"leadership": (5.6, 1.1), "culture": (6.6, 1.0), "growth": (5.0, 1.1),
                      "compensation": (6.3, 1.0), "workload": (5.4, 1.1), "role_clarity": (6.7, 1.0)}),
```

De `num`-property splitst op de eerste underscore, dus dit scenario heet `16b` en botst niet met `16`. Laat `depts` weg zodat de standaardverdeling wordt gebruikt.

Controleer:

```bash
/c/Users/larsh/Desktop/Business/Verisight/.venv/Scripts/python.exe scripts/stresstest_report.py --list
```

Verwacht: 21 regels, met `16b  retention   n=45` ertussen.

- [ ] **Stap 2: Genereer alle scenario's**

```bash
/c/Users/larsh/Desktop/Business/Verisight/.venv/Scripts/python.exe scripts/stresstest_report.py
```

Verwacht: 21 regels output, geen tracebacks. De HTML en `.meta.json` staan in `docs/stresstest/`.

- [ ] **Stap 3: Beoordeel elk scenario langs de zes vragen**

Voor elk van de 21 scenario's: lees de gegenereerde HTML, controleer de claims tegen de bijbehorende `.meta.json` (niet tegen het rapport zelf), en noteer de letterlijke openingszin van pagina twee. Gebruik dit om de citaten te verzamelen:

```bash
/c/Users/larsh/Desktop/Business/Verisight/.venv/Scripts/python.exe - <<'PY'
import pathlib, re, json
for p in sorted(pathlib.Path("docs/stresstest").glob("*.html")):
    html = p.read_text(encoding="utf-8")
    m = re.search(r'<p class="br-kernzin">(.*?)</p>', html, re.S)
    zin = re.sub(r"<[^>]+>", "", m.group(1)).strip() if m else "(geen kernzin gevonden)"
    print(f"{p.stem}: {zin}\n")
PY
```

- [ ] **Stap 4: Werk de matrix bij in het bevindingenrapport**

Voeg onderaan `docs/rapport-stresstest-2026-09-10.md` een sectie `## Na ronde 2 (11 september 2026)` toe met:
- de volledige matrix van 21 rijen en zes vraagkolommen, gewijzigde cellen vet;
- de scoreregel eronder, met de stand na ronde 1 ter vergelijking;
- **per scenario het letterlijke citaat van de nieuwe openingszin van pagina twee** (uit stap 3);
- een tabel "wat er per bevinding veranderde" voor B5, B6, B7, B8, B12, B17, B18, B19 plus de par. 7b-bijvangst, elk met bewijs uit een concreet scenario;
- een expliciete lijst van de ✗-cellen die blijven staan, met per cel welke ronde-3-bevinding hem draagt (B9 paginavulling, B13 Anders, B14 brug tussen tellingen, B20 drempelconsistentie).

Gebruik dezelfde beoordelingsregel als ronde 1: een cel beweegt alleen als de bevindingen die hem droegen tot de gefixte horen én geen openstaande bevinding dezelfde cel zelfstandig op hetzelfde niveau houdt.

- [ ] **Stap 5: Regenereer de drie voorbeeldrapporten**

```bash
/c/Users/larsh/Desktop/Business/Verisight/.venv/Scripts/python.exe generate_voorbeeldrapport.py
```

Dan door WeasyPrint, voor elk van de drie:

```bash
docker run --rm -v "$(pwd)":/data ghcr.io/weasyprint/weasyprint /data/docs/examples/voorbeeldrapport_loep.html /data/docs/examples/voorbeeldrapport_loep.pdf
```

Verwacht per run: exit 0 en **lege stdout en stderr** (nul waarschuwingen). Een waarschuwing betekent dat WeasyPrint een CSS-eigenschap niet kent en stilzwijgend negeert; los die op voordat je verder gaat (zie de les van commit `8d9bc61`: `var()`, `gap` op flex en `inset` werken niet).

Controleer daarna de tekstlaag op em-dashes:

```bash
/c/Users/larsh/Desktop/Business/Verisight/.venv/Scripts/python.exe -c "import fitz,sys; [print(p, chr(8212) in fitz.open(p).load_page(i).get_text()) for p in sys.argv[1:] for i in range(fitz.open(p).page_count)]" docs/examples/voorbeeldrapport_loep.pdf | grep True || echo "GEEN EM-DASHES"
```

- [ ] **Stap 6: Controleer de vier pagina's visueel**

Bekijk in elk van de drie samples: pagina twee (nieuwe openingszin, respons-staart, signaalcel), de ranglijst (markeringsregels, exit-kolom), de segmentpagina (startpunt of de "dicht bij elkaar"-zin, alle afdelingsrijen) en het richtingblok (de nieuwe staten waar de data ze oplevert). Noteer wat je ziet; een staat die in geen enkele sample voorkomt, render je apart via een wegwerpscenario.

- [ ] **Stap 7: Laatste volledige verificatie**

```bash
/c/Users/larsh/Desktop/Business/Verisight/.venv/Scripts/python.exe -m pytest tests/ -q 2>&1 | tail -3
```

Verwacht: `25 failed, ... passed, 5 skipped`, faalset byte-identiek aan `docs/superpowers/plans/ronde2-baseline-failset.txt`.

```bash
cd frontend && npx tsc --noEmit 2>&1 | grep -c "error TS"
```

Verwacht: `133`.

- [ ] **Stap 8: Commit**

```bash
git add -A && git commit -m "test(stresstest): scenario 16b, matrix na ronde 2, voorbeeldrapporten geregenereerd"
```

---

## Zelfreview van dit plan

**Spec-dekking.** Par. 1 → taak 1. Par. 2 → taak 2 en 3 (de zin in 2, de inbouw in 3). Par. 3 → taak 6. Par. 4 → taak 5. Par. 5 → taak 3. Par. 6 → taak 4. Par. 7 → taak 8. Par. 7b → taak 7. Par. 8 (buiten scope) → geen taak, bewust. Par. 9 → taak 9. Par. 0 besluit 1 (polariteit) is in ronde 1 gedaan en hier alleen een afhankelijkheid.

**Bekende afwijkingen, te documenteren in de spec tijdens de betreffende taak:**
1. Taak 1: de richting-tie-break gebruikt een groepsbrede in plaats van een paarsgewijze geldigheidsgate (determinisme).
2. Taak 3: de kernzin-router werkt voor alle drie de producten met een eigen onderwerpwoord, en het signaalgetal krijgt een eigen onderbouwingscel.
3. Taak 5: `*_other` is ook van `plurality` en `split_none` uitgesloten, net als van `clear`, omdat die optie geen opdrachtvorm heeft.
4. Taak 4: de noemer voor het responspercentage komt uit het delivery record wanneer dat bestaat, omdat `len(respondents)` bij self-send een respons van 100% zou suggereren.

**Typeconsistentie.** `profile_shape` levert `factors_low_to_high` (taak 2) en `_p02_opening` leest dat (taak 3). `rank_factors` levert `tie_break_kind`, `tie_break_note`, `exit_reason_n`, `direction_answered` en `direction_change` (taak 1); `_prioriteringsraster`, `_raster_attribution` en de kernzin-takken lezen precies die namen (taak 1 en 3). `direction_state` levert er `none_n` bij (taak 5) en `_direction_card_cell` en `_direction_p02_line` lezen dat. `distribution_block` krijgt `invert_scale` (taak 7) en `_behoudscontext` geeft die door.

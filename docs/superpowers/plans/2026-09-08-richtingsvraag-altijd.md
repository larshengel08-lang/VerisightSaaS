# Richtingsvraag voor elke respondent + "Wat er moet gebeuren" — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Elke respondent van Loep Vertrek/Behoud beantwoordt precies één richtingvraag op zijn eigen laagst scorende werkfactor (met "Niets, dit zit hier goed" als eerste optie); het rapport toont per startpunt en tweede punt "Wat er moet gebeuren" in opdrachtvorm met bron, in vier eerlijke staten, plus één regel op pagina 2.

**Architecture:** De bestaande richting-na-verdieping (retention-only, genest in `deepening_responses`) wordt vervangen door een eigen JSONB-kolom `direction_response` met één object per response. Alle logica (laagste-factor-keten, contentsets voor exit+retention, aggregatie, staatbepaling) leeft in `backend/products/shared/deepening.py`; de server herberekent de factor en weigert afwijkingen met 422. Het rapport krijgt één nieuw blok in `_prioriteringsraster` en één regel in `_bestuurlijke_read`; de scenariomachine (concordant/discrepant, 40%-stopregel) en het blok per verdiepingspagina verdwijnen.

**Tech Stack:** Python 3 (FastAPI, SQLAlchemy, Pydantic v2), Jinja2-template + vanilla JS (`templates/survey.html`), pytest, WeasyPrint via Docker (`ghcr.io/weasyprint/weasyprint`), Supabase-migratie (SQL).

**Spec:** `docs/superpowers/specs/2026-09-07-richtingsvraag-altijd-design.md` (par.-verwijzingen hieronder slaan daarop).

**Repo-root voor alle commando's:** `C:\Users\larsh\Desktop\Business\Verisight` (of de worktree uit Taak 0). Python = `.venv/Scripts/python.exe`. Tests = `.venv/Scripts/python.exe -m pytest tests -q`.

**Conventies uit CLAUDE.md die hier gelden:** Fail Loud (geen stille fallback), geen em-dashes in klantzichtbare copy, geen "risico"/"interventie"/"actieplan" in rapportcopy, opdrachtvorm = stem van de respondenten, nooit "Loep adviseert".

---

## Bestandsoverzicht

| Bestand | Verantwoordelijkheid in dit plan |
|---|---|
| `backend/products/shared/deepening.py` | `_priority_key`, `compute_direction_factor`, nieuwe `DIRECTION_SETS` (exit+retention, `imperative`, `*_none`), `DIRECTION_VERSION`, `get_direction_sets`, `direction_option_texts`, `direction_imperative`, `aggregate_direction`, `direction_state`. Scenariomachine en direction-tellers in `aggregate_deepening` verwijderd. |
| `backend/schemas.py` | `DirectionResponse`; `direction_response` op `SurveySubmit`; `DeepeningEntry` zonder `direction` + before-validator die het oude geneste formaat met een duidelijke melding weigert; `DeepeningDirection` weg. |
| `backend/models.py` | Kolom `direction_response` (JSON, nullable) op `SurveyResponse`. |
| `migrations/2026_09_07_add_direction_response.sql` | Additieve, idempotente migratie. |
| `backend/main.py` | Render-endpoint levert `direction_sets` voor exit én retention; submit valideert en bewaart `direction_response`; oude geneste validatie/anonymisering weg. |
| `backend/report_html.py` | `_direction_block`/`_direction_agenda_line` weg; nieuw `_direction_chain`, `_direction_card`, `_wat_moet_gebeuren_block`, `_direction_p02_line`; `_prioriteringsraster(direction_agg=, n_total=)`; `_bestuurlijke_read(direction_line=)`; `build_report_data` levert `direction_agg`; copy in `SECTION_INTROS["verdieping"]` en `_trust_page`. |
| `backend/report_css.py` | `.dir-*`-klassen en `.mq-direction`. |
| `templates/survey/shared-deepening.html` | Richtingstap altijd aanwezig voor exit/retention, buiten het `deepening_sets`-blok. |
| `templates/survey.html` | JS: `computeDirectionFactor`, `renderDirectionBlock`, restore, payload `direction_response`; oude per-verdieping-richting weg. |
| `generate_voorbeeldrapport.py` | `_build_direction_response` via de echte `compute_direction_factor`; geneste direction weg. |
| Tests | Nieuw: `tests/test_direction_factor.py`, `tests/test_direction_report_block.py`. Herschreven: `tests/test_direction_content.py`, `tests/test_direction_aggregation.py`, `tests/test_direction_schema.py`, `tests/test_direction_submit.py`. Aangepast: `tests/test_deepening_template.py`. Verwijderd: `tests/test_direction_report_html.py`. |

---

## Taak 0: Worktree + baseline

**Files:** geen codewijziging.

- [ ] **Stap 1: Worktree en branch aanmaken**

```bash
cd /c/Users/larsh/Desktop/Business/Verisight
git worktree add .worktrees/richtingsvraag-altijd -b feature/richtingsvraag-altijd main
cd .worktrees/richtingsvraag-altijd
```

NB: de `.venv` staat in de hoofdmap. Gebruik in de worktree steeds `../../.venv/Scripts/python.exe`, of maak een symlink/kopie niet; alle commando's hieronder schrijven `PY=../../.venv/Scripts/python.exe` uit.

- [ ] **Stap 2: Baseline-faalset vastleggen**

```bash
cd /c/Users/larsh/Desktop/Business/Verisight/.worktrees/richtingsvraag-altijd
PY=../../.venv/Scripts/python.exe
$PY -m pytest tests -q -p no:cacheprovider 2>&1 | grep -E "^(FAILED|ERROR)" | sed 's/ - .*//' | sort > /tmp/baseline_fail.txt
wc -l /tmp/baseline_fail.txt
```

Verwacht: ~25 regels (de bekende pre-existente faalset). Dit bestand is de referentie voor de stash-diff in Taak 12.

- [ ] **Stap 3: Spec meenemen**

De spec staat al op `main` (`a789dc7c`), dus in de worktree aanwezig. Geen actie.

---

## Taak 1: `compute_direction_factor` + gedeelde prioriteitssleutel

**Files:**
- Modify: `backend/products/shared/deepening.py` (regels 554-589: `_factor_items`, `_is_triggered`, `compute_deepening_offers`)
- Create: `tests/test_direction_factor.py`

- [ ] **Stap 1: Failing tests schrijven**

```python
# tests/test_direction_factor.py
"""compute_direction_factor: eigen laagste factor per respondent (spec par. 5.1)."""
from backend.products.shared.deepening import (
    DEEPENING_FACTOR_KEYS,
    compute_deepening_offers,
    compute_direction_factor,
)


def _raw(**per_factor):
    """per_factor: factor_key -> lijst van 3 stellingscores."""
    out = {}
    for fk in DEEPENING_FACTOR_KEYS:
        vals = per_factor.get(fk, [4, 4, 4])
        for i, v in enumerate(vals, start=1):
            out[f"{fk}_{i}"] = v
    return out


def test_lowest_average_wins():
    raw = _raw(workload=[2, 2, 3], growth=[3, 3, 3])
    assert compute_direction_factor(raw) == "workload"


def test_high_scores_still_yield_a_factor():
    # De 'iemand wiens laagste een 8 is'-respondent: geen trigger, wel een richtingfactor.
    raw = _raw(growth=[4, 4, 3])
    assert compute_direction_factor(raw) == "growth"
    assert compute_deepening_offers(raw, "retention") == []


def test_tiebreak_low_count_then_min_then_order():
    # Gelijk gemiddelde 3.0: workload heeft twee stellingen <=2, growth een -> workload.
    raw = _raw(workload=[2, 2, 5], growth=[1, 4, 4])
    assert compute_direction_factor(raw) == "workload"
    # Gelijk gemiddelde, gelijk low_count: laagste minimum wint.
    raw = _raw(workload=[2, 3, 4], growth=[1, 4, 4])
    assert compute_direction_factor(raw) == "growth"
    # Volledig gelijk: vaste volgorde (leadership staat voor culture).
    raw = _raw(culture=[3, 3, 3], leadership=[3, 3, 3])
    assert compute_direction_factor(raw) == "leadership"


def test_none_without_items():
    assert compute_direction_factor({}) is None
    assert compute_direction_factor({"iets_anders": 3}) is None


def test_agrees_with_first_deepening_offer_when_triggered():
    raw = _raw(workload=[1, 2, 2], growth=[2, 2, 3], leadership=[2, 3, 3])
    offers = compute_deepening_offers(raw, "retention")
    assert offers and offers[0] == compute_direction_factor(raw)
```

- [ ] **Stap 2: Run, verwacht ImportError**

```bash
$PY -m pytest tests/test_direction_factor.py -q
```
Verwacht: `ImportError: cannot import name 'compute_direction_factor'`.

- [ ] **Stap 3: Implementeren**

Vervang in `backend/products/shared/deepening.py` de functie `compute_deepening_offers` (regels 572-589) door onderstaande drie functies (de `_factor_items`/`_is_triggered` erboven blijven staan):

```python
def _priority_key(items: list[int], idx: int) -> tuple[float, int, int, int]:
    """Eén prioriteitsregel voor verdieping én richting (spec 2026-09-07 par. 5.1):
    laagste gemiddelde -> meeste stellingen <=2 -> laagste minimum -> vaste volgorde."""
    avg = sum(items) / len(items)
    low_count = sum(1 for v in items if v <= 2)
    return (avg, -low_count, min(items), idx)


def compute_deepening_offers(org_raw: dict[str, int], scan_type: str) -> list[str]:
    """Getriggerde factoren, geprioriteerd via _priority_key en afgekapt op de scan-cap."""
    if scan_type not in DEEPENING_CAP:
        raise ValueError(f"unknown scan_type {scan_type!r}")
    triggered: list[tuple[tuple[float, int, int, int], str]] = []
    for idx, fk in enumerate(DEEPENING_FACTOR_KEYS):
        items = _factor_items(org_raw, fk)
        if _is_triggered(items):
            triggered.append((_priority_key(items, idx), fk))
    triggered.sort()
    return [fk for _, fk in triggered[:DEEPENING_CAP[scan_type]]]


def compute_direction_factor(org_raw: dict[str, int]) -> str | None:
    """De eigen laagst scorende werkfactor van een respondent (spec par. 5.1).

    Zelfde sleutel als de verdieping, maar zonder triggerfilter: iedereen met
    minstens één beantwoorde stelling krijgt een factor. None alleen zonder
    stellingen (dan is er geen richtingvraag)."""
    candidates: list[tuple[tuple[float, int, int, int], str]] = []
    for idx, fk in enumerate(DEEPENING_FACTOR_KEYS):
        items = _factor_items(org_raw, fk)
        if items:
            candidates.append((_priority_key(items, idx), fk))
    if not candidates:
        return None
    candidates.sort()
    return candidates[0][1]
```

- [ ] **Stap 4: Run, verwacht groen (ook de bestaande triggertests)**

```bash
$PY -m pytest tests/test_direction_factor.py tests/test_deepening_trigger.py -q
```
Verwacht: alles PASS.

- [ ] **Stap 5: Commit**

```bash
git add backend/products/shared/deepening.py tests/test_direction_factor.py
git commit -m "feat(deepening): compute_direction_factor + gedeelde prioriteitssleutel

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---
## Taak 2: Rapport-opruiming: oude richtingblokken en scenariozinnen weg

Eerst de consumenten weg, dan pas (Taak 3) de logica in `deepening.py`, zodat er nooit een import naar een verwijderde functie achterblijft.

**Files:**
- Modify: `backend/report_html.py` (imports regel 26-32; `_direction_block` regel 991-1040; `_direction_agenda_line` regel 1043-1059; retention-verdiepingspagina regel 2574-2586; retention raster-callsite regel 2672-2677)
- Delete: `tests/test_direction_report_html.py`

- [ ] **Stap 1: Test verwijderen die de oude blokken pint**

```bash
git rm tests/test_direction_report_html.py
```

- [ ] **Stap 2: Imports opschonen**

In `backend/report_html.py` regel 26-32, vervang:

```python
from backend.products.shared.deepening import (
    DIRECTION_SETS,
    agenda_enrichment,
    aggregate_deepening,
    direction_agenda_scenario,
    get_deepening_sets,
)
```
door:
```python
from backend.products.shared.deepening import (
    agenda_enrichment,
    aggregate_deepening,
    get_deepening_sets,
)
```

- [ ] **Stap 3: `_direction_block` en `_direction_agenda_line` verwijderen**

Verwijder de volledige functies `_direction_block(agg, scan_type, factor_key)` (begint op regel 991 met de docstring `"""Blok 'Welke gespreksrichting respondenten kozen' ...`) en `_direction_agenda_line(agg, scan_type, factor_key)` (regel 1043-1059). `_deepening_block`, `_short_mgmt_q` en `_deepening_mgmt_q` blijven.

- [ ] **Stap 4: Retention-verdiepingspagina: `dir_block` weg**

Rond regel 2574-2586 (functie die de verdiepingspagina per factor rendert in `render_retention_report_html`), vervang:

```python
        deep_block = (_deepening_block(deep_agg[fk], ST, fk)
                      if fk in deep_agg else "")
        # ── Gespreksrichting-blok (spec 7.1) — direct na de toelichting ──
        dir_block = (_direction_block(deep_agg[fk], ST, fk)
                     if fk in deep_agg else "")
```
door:
```python
        deep_block = (_deepening_block(deep_agg[fk], ST, fk)
                      if fk in deep_agg else "")
```
en in de f-string van die functie `{deep_block}{dir_block}` door `{deep_block}`.

- [ ] **Stap 5: Retention raster-callsite: scenariozin weg**

Rond regel 2672-2677, vervang:

```python
    _startpunt_fk = _raster_rows[0]["key"] if _raster_rows else None
    # Richting-scenario (spec 7.2) eerst; None -> trede-1-verrijking of menuvraag.
    _direction_q = (_direction_agenda_line(deep_agg[_startpunt_fk], ST, _startpunt_fk)
                    if _startpunt_fk and _startpunt_fk in deep_agg else None)
    _enriched_q = _direction_q or (_deepening_mgmt_q(deep_agg, ST, _startpunt_fk)
                                   if _startpunt_fk else None)
```
door:
```python
    _startpunt_fk = _raster_rows[0]["key"] if _raster_rows else None
    _enriched_q = (_deepening_mgmt_q(deep_agg, ST, _startpunt_fk)
                   if _startpunt_fk else None)
```

- [ ] **Stap 6: Controle dat niets meer naar de verwijderde namen wijst**

```bash
grep -n "_direction_block\|_direction_agenda_line\|DIRECTION_SETS\|direction_agenda_scenario" backend/report_html.py
```
Verwacht: geen output.

- [ ] **Stap 7: Tests**

```bash
$PY -m pytest tests/test_deepening_report_html.py tests/test_report_priority_render.py tests/test_report_priority_attribution.py tests/test_pdf_redesign.py tests/test_report_html_design.py -q
```
Verwacht: PASS (zelfde faalset als baseline voor eventuele pre-existente fails in die bestanden; controleer tegen `/tmp/baseline_fail.txt`).

- [ ] **Stap 8: Commit**

```bash
git add -A backend/report_html.py tests/test_direction_report_html.py
git commit -m "refactor(rapport): oude gespreksrichting-blokken en scenariozin verwijderd

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---

## Taak 3: Scenariomachine en direction-tellers uit `deepening.py`

**Files:**
- Modify: `backend/products/shared/deepening.py` (`aggregate_deepening` regel 606-654; `is_concordant`, `_direction_top`, `get_direction_agenda_question`, `direction_agenda_scenario` regel 688-748)
- Delete: `tests/test_direction_aggregation.py` (wordt in Taak 5 opnieuw aangemaakt met nieuwe inhoud)

- [ ] **Stap 1: Oude aggregatietest weg**

```bash
git rm tests/test_direction_aggregation.py
```

- [ ] **Stap 2: `aggregate_deepening` zonder direction-tellers**

Vervang de functie volledig door:

```python
def aggregate_deepening(
    rows: list[tuple[dict[str, int], list[dict] | None]],
    scan_type: str,
) -> dict[str, dict[str, Any]]:
    """Per factor de volledige noemer-keten (spec 6.1) + keuze-verdelingen.

    rows: per respondent (org_raw, deepening_responses).
    triggered = trigger vuurde (ongeacht cap); offered = entry aanwezig;
    answered/skipped = status; counts alleen over answered.

    NB: offered > triggered is mogelijk bij historische data (bijv. gewijzigde
    triggerregels of optiesets) en wordt bewust getolereerd. Een eventueel
    genest `direction`-veld uit het juli-formaat wordt hier genegeerd; de
    richting leeft sinds spec 2026-09-07 in survey_responses.direction_response.
    """
    if scan_type not in DEEPENING_CAP:
        raise ValueError(f"unknown scan_type {scan_type!r}")
    out: dict[str, dict[str, Any]] = {
        fk: {"triggered": 0, "offered": 0, "answered": 0, "skipped": 0,
             "primary_counts": {}, "secondary_counts": {}}
        for fk in DEEPENING_FACTOR_KEYS
    }
    for org_raw, entries in rows:
        for fk in DEEPENING_FACTOR_KEYS:
            if _is_triggered(_factor_items(org_raw, fk)):
                out[fk]["triggered"] += 1
        for e in entries or []:
            agg = out.get(e["factor_key"])
            if agg is None:
                continue
            agg["offered"] += 1
            if e["status"] == "answered":
                agg["answered"] += 1
                if e.get("primary"):
                    agg["primary_counts"][e["primary"]] = agg["primary_counts"].get(e["primary"], 0) + 1
                if e.get("secondary"):
                    agg["secondary_counts"][e["secondary"]] = agg["secondary_counts"].get(e["secondary"], 0) + 1
            else:
                agg["skipped"] += 1
    return out
```

- [ ] **Stap 3: Scenariomachine verwijderen**

Verwijder de functies `is_concordant`, `_direction_top`, `get_direction_agenda_question` en `direction_agenda_scenario` (alles vanaf regel 688 tot het einde van het bestand). `agenda_enrichment` en `get_agenda_question` blijven.

- [ ] **Stap 4: Controle**

```bash
grep -rn "is_concordant\|_direction_top\|get_direction_agenda_question\|direction_agenda_scenario\|direction_offered\|direction_counts" backend/ tests/ --include=*.py | grep -v "^tests/test_report_priority"
```
Verwacht: geen output. (De fixture-dicts in `tests/test_report_priority.py` en `tests/test_report_priority_attribution.py` bevatten nog `direction_*`-sleutels; dat zijn extra dict-keys die door niets gelezen worden. Laat staan.)

- [ ] **Stap 5: Tests**

```bash
$PY -m pytest tests/test_deepening_trigger.py tests/test_deepening_report.py tests/test_deepening_report_html.py tests/test_deepening_content.py tests/test_report_priority.py -q
```
Verwacht: PASS.

- [ ] **Stap 6: Commit**

```bash
git add -A backend/products/shared/deepening.py tests/test_direction_aggregation.py
git commit -m "refactor(deepening): concordantie/scenario-logica en geneste direction-tellers verwijderd

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---
## Taak 4: `DIRECTION_SETS` voor exit + retention, met `imperative` en `*_none`

**Files:**
- Modify: `backend/products/shared/deepening.py` (`DIRECTION_SETS` regel 389-535; `get_direction_sets` regel 537-551)
- Rewrite: `tests/test_direction_content.py`

- [ ] **Stap 1: Failing tests schrijven** (bestand volledig vervangen)

```python
# tests/test_direction_content.py
"""Content-guard voor de richtingsets (spec 2026-09-07 par. 3.2 en 8)."""
import pytest

from backend.products.shared.deepening import (
    DEEPENING_FACTOR_KEYS,
    DIRECTION_SETS,
    DIRECTION_VERSION,
    direction_imperative,
    direction_option_texts,
    get_direction_sets,
)

# Verboden in respondent- en rapportcopy.
FORBIDDEN = [
    "laag gescoord", "niet goed", "risico", "probleem", "oorzaak", "interventie",
    "anoniem", "betrouwbaar", "verschilmaker", "aanbeveling", "actieplan",
    "management moet", "loep adviseert",
]


def test_sets_complete_with_none_first_and_other_last():
    assert set(DIRECTION_SETS) == set(DEEPENING_FACTOR_KEYS)
    for fk, s in DIRECTION_SETS.items():
        keys = [o["key"] for o in s["options"]]
        assert len(keys) == 8, fk                       # none + 6 routes + other
        assert keys[0].endswith("_none"), fk
        assert keys[-1].endswith("_other"), fk
        assert len(set(keys)) == 8, fk


@pytest.mark.parametrize("scan_type", ["exit", "retention"])
def test_get_direction_sets_shape_per_scan(scan_type):
    sets = get_direction_sets(scan_type)
    assert set(sets) == set(DEEPENING_FACTOR_KEYS)
    for fk, s in sets.items():
        assert s["question_set_version"] == f"{scan_type}_{fk}_direction_{DIRECTION_VERSION[scan_type]}"
        assert "scoorde" in s["question"] and "het laagst" in s["question"]
        assert s["options"][0]["text"].startswith("Niets, dit z")
        for o in s["options"]:
            assert set(o) == {"key", "text"}, "imperative mag niet naar de client"
            assert isinstance(o["text"], str) and o["text"]


def test_tense_per_scan():
    ret = get_direction_sets("retention")["workload"]
    ex = get_direction_sets("exit")["workload"]
    assert "zou hier volgens jou het meest helpen" in ret["question"]
    assert "had hier volgens jou het meest geholpen" in ex["question"]
    assert ret["options"][0]["text"] == "Niets, dit zit hier goed"
    assert ex["options"][0]["text"] == "Niets, dit zat hier goed"
    # Eerste-persoonsroutes staan bij exit in de verleden tijd.
    assert "mocht beslissen" in direction_option_texts("exit", "leadership")["ldd_mandate"]
    assert "mag beslissen" in direction_option_texts("retention", "leadership")["ldd_mandate"]


def test_versions():
    assert DIRECTION_VERSION == {"retention": "v2", "exit": "v1"}


def test_unknown_scan_type_raises():
    with pytest.raises(ValueError):
        get_direction_sets("onboarding")


def test_every_route_has_imperative_except_none_and_other():
    for fk, s in DIRECTION_SETS.items():
        for o in s["options"]:
            imp = direction_imperative(fk, o["key"])
            if o["key"].endswith(("_none", "_other")):
                assert imp is None, f"{fk}/{o['key']}"
            else:
                assert imp and imp[0].isupper() and imp.endswith("."), f"{fk}/{o['key']}"
                assert "—" not in imp


def test_no_forbidden_words_and_no_em_dashes():
    for scan_type in ("exit", "retention"):
        for fk, s in get_direction_sets(scan_type).items():
            blob = (s["question"] + " " + " ".join(o["text"] for o in s["options"])).lower()
            for w in FORBIDDEN:
                assert w not in blob, f"{scan_type}/{fk}: {w}"
            assert "—" not in blob
    for fk, s in DIRECTION_SETS.items():
        for o in s["options"]:
            imp = (o.get("imperative") or "").lower()
            for w in FORBIDDEN:
                assert w not in imp, f"{fk}/{o['key']}: {w}"


def test_direction_imperative_unknown_key_raises():
    with pytest.raises(KeyError):
        direction_imperative("workload", "wld_bestaat_niet")
```

- [ ] **Stap 2: Run, verwacht ImportError op `DIRECTION_VERSION`**

```bash
$PY -m pytest tests/test_direction_content.py -q
```

- [ ] **Stap 3: `DIRECTION_SETS` vervangen**

Vervang het volledige `DIRECTION_SETS`-dict (regel 389 t/m de sluitende `}` vóór `def get_direction_sets`) door onderstaande code. `_t(retention, exit=None)` maakt een tekst-dict; zonder tweede argument is de Vertrek-tekst gelijk aan de Behoud-tekst. De "Anders, namelijk"-tekst eindigt op het bestaande beletselteken (U+2026), geen em-dash.

```python
def _t(retention: str, exit: str | None = None) -> dict[str, str]:
    return {"retention": retention, "exit": exit if exit is not None else retention}


def _q(onderwerp: str) -> dict[str, str]:
    return {
        "retention": (f"Van deze onderwerpen scoorde {onderwerp} bij jou het laagst. "
                      "Wat zou hier volgens jou het meest helpen?"),
        "exit": (f"Van deze onderwerpen scoorde {onderwerp} bij jou het laagst. "
                 "Wat had hier volgens jou het meest geholpen?"),
    }


def _none(prefix: str) -> dict[str, Any]:
    return {"key": f"{prefix}_none",
            "text": _t("Niets, dit zit hier goed", "Niets, dit zat hier goed"),
            "imperative": None}


def _other(prefix: str) -> dict[str, Any]:
    return {"key": f"{prefix}_other", "text": _t("Anders, namelijk…"), "imperative": None}


# Versie per scan: retention v1 -> v2 (optieset gewijzigd: *_none toegevoegd,
# vraag herformuleerd, losgekoppeld van de verdieping); exit is nieuw.
DIRECTION_VERSION: dict[str, str] = {"retention": "v2", "exit": "v1"}

# Richtingsets (spec 2026-09-07 par. 8). `imperative` is de opdrachtvorm voor het
# rapportblok "Wat er moet gebeuren": tijd-neutraal, de stem van de respondenten.
DIRECTION_SETS: dict[str, dict[str, Any]] = {
    "workload": {
        "question": _q("werkbelasting"),
        "options": [
            _none("wld"),
            {"key": "wld_scope",
             "text": _t("Takenpakket en werkvolume beter afbakenen"),
             "imperative": "Baken het takenpakket en het werkvolume scherper af."},
            {"key": "wld_planning",
             "text": _t("Planning en bezetting beter laten aansluiten op het werk dat er ligt"),
             "imperative": "Laat planning en bezetting beter aansluiten op het werk dat er ligt."},
            {"key": "wld_peaks",
             "text": _t("Piekmomenten en spoedwerk eerder plannen, verdelen of begrenzen"),
             "imperative": "Plan piekmomenten en spoedwerk eerder, verdeel ze beter of begrens ze."},
            {"key": "wld_recovery",
             "text": _t("Meer ruimte om te herstellen en werk goed af te ronden"),
             "imperative": "Maak meer ruimte om te herstellen en werk goed af te ronden."},
            {"key": "wld_priorities",
             "text": _t("Duidelijkere keuzes over wat voorrang heeft en wat kan wachten"),
             "imperative": "Maak duidelijker wat voorrang heeft en wat kan wachten."},
            {"key": "wld_friction",
             "text": _t("Minder dubbel werk, systeemgedoe of fouten in overdracht"),
             "imperative": "Haal dubbel werk, systeemgedoe en fouten in de overdracht weg."},
            _other("wld"),
        ],
    },
    "leadership": {
        "question": _q("de aansturing"),
        "options": [
            _none("ldd"),
            {"key": "ldd_feedback",
             "text": _t("Meer bruikbare feedback en richting"),
             "imperative": "Geef meer bruikbare feedback en richting."},
            {"key": "ldd_mandate",
             "text": _t("Duidelijker wat ik zelf mag beslissen in mijn werk",
                        "Duidelijker wat ik zelf mocht beslissen in mijn werk"),
             "imperative": "Maak duidelijker wat medewerkers zelf mogen beslissen."},
            {"key": "ldd_escalation",
             "text": _t("Duidelijkere steun als er spanningen zijn of situaties vastlopen",
                        "Duidelijkere steun als er spanningen waren of situaties vastliepen"),
             "imperative": "Bied duidelijkere steun als er spanningen zijn of situaties vastlopen."},
            {"key": "ldd_recognition",
             "text": _t("Concretere terugkoppeling op wat goed gaat en wat wordt gewaardeerd",
                        "Concretere terugkoppeling op wat goed ging en wat werd gewaardeerd"),
             "imperative": "Koppel concreter terug wat goed gaat en wat wordt gewaardeerd."},
            {"key": "ldd_availability",
             "text": _t("Meer beschikbaarheid en zichtbaarheid van mijn leidinggevende"),
             "imperative": "Zorg dat leidinggevenden beschikbaarder en zichtbaarder zijn."},
            {"key": "ldd_consistency",
             "text": _t("Stabielere en beter uitlegbare besluiten en verwachtingen"),
             "imperative": "Maak besluiten en verwachtingen stabieler en beter uitlegbaar."},
            _other("ldd"),
        ],
    },
    "culture": {
        "question": _q("de samenwerking in het team"),
        "options": [
            _none("cud"),
            {"key": "cud_safety",
             "text": _t("Fouten of twijfels makkelijker en veiliger kunnen bespreken"),
             "imperative": "Maak het makkelijker en veiliger om fouten of twijfels te bespreken."},
            {"key": "cud_dissent",
             "text": _t("Meer ruimte voor kritische vragen en afwijkende meningen"),
             "imperative": "Geef kritische vragen en afwijkende meningen meer ruimte."},
            {"key": "cud_conflict",
             "text": _t("Spanningen of conflicten eerder bespreekbaar maken"),
             "imperative": "Maak spanningen of conflicten eerder bespreekbaar."},
            {"key": "cud_agreements",
             "text": _t("Duidelijkere teamafspraken over gedrag, samenwerking en opvolging"),
             "imperative": "Maak duidelijkere teamafspraken over gedrag, samenwerking en opvolging."},
            {"key": "cud_involvement",
             "text": _t("Eerder betrokken worden bij besluiten of veranderingen die het team raken",
                        "Eerder betrokken worden bij besluiten of veranderingen die het team raakten"),
             "imperative": "Betrek medewerkers eerder bij besluiten of veranderingen die het team raken."},
            {"key": "cud_crossteam",
             "text": _t("Betere samenwerking tussen teams of afdelingen"),
             "imperative": "Verbeter de samenwerking tussen teams of afdelingen."},
            _other("cud"),
        ],
    },
    "growth": {
        "question": _q("groeiperspectief"),
        "options": [
            _none("grd"),
            {"key": "grd_visibility",
             "text": _t("Beter zicht op welke mogelijkheden er voor mij zijn",
                        "Beter zicht op welke mogelijkheden er voor mij waren"),
             "imperative": "Maak zichtbaar welke mogelijkheden er voor medewerkers zijn."},
            {"key": "grd_conversation",
             "text": _t("Een concreter gesprek over mijn ontwikkeling"),
             "imperative": "Voer een concreter gesprek over ontwikkeling."},
            {"key": "grd_followthrough",
             "text": _t("Ontwikkelafspraken concreter vastleggen en zichtbaar opvolgen"),
             "imperative": "Leg ontwikkelafspraken concreter vast en volg ze zichtbaar op."},
            {"key": "grd_time",
             "text": _t("Ontwikkeling beter inplannen naast het reguliere werk"),
             "imperative": "Plan ontwikkeling in naast het reguliere werk."},
            {"key": "grd_criteria",
             "text": _t("Duidelijkere criteria voor hoe doorgroei wordt bepaald",
                        "Duidelijkere criteria voor hoe doorgroei werd bepaald"),
             "imperative": "Maak duidelijker hoe doorgroei wordt bepaald."},
            {"key": "grd_nextstep",
             "text": _t("Een open en concreet gesprek over realistische vervolgstappen binnen de organisatie"),
             "imperative": "Voer een open en concreet gesprek over realistische vervolgstappen binnen de organisatie."},
            _other("grd"),
        ],
    },
    "compensation": {
        "question": _q("beloning en voorwaarden"),
        "options": [
            _none("cpd"),
            {"key": "cpd_insight",
             "text": _t("Beter inzicht in hoe beloning zich verhoudt tot vergelijkbaar werk elders",
                        "Beter inzicht in hoe beloning zich verhield tot vergelijkbaar werk elders"),
             "imperative": "Geef inzicht in hoe de beloning zich verhoudt tot vergelijkbaar werk elders."},
            {"key": "cpd_explain",
             "text": _t("Meer uitlegbaarheid van verschillen tussen vergelijkbare functies"),
             "imperative": "Leg verschillen tussen vergelijkbare functies beter uit."},
            {"key": "cpd_review",
             "text": _t("Beter kijken of beloning past bij de zwaarte en verantwoordelijkheid van mijn werk",
                        "Beter kijken of beloning paste bij de zwaarte en verantwoordelijkheid van mijn werk"),
             "imperative": "Kijk opnieuw of de beloning past bij de zwaarte en verantwoordelijkheid van het werk."},
            {"key": "cpd_path",
             "text": _t("Meer duidelijkheid over mogelijke salarisgroei, voorwaarden en timing"),
             "imperative": "Geef duidelijkheid over mogelijke salarisgroei, voorwaarden en timing."},
            {"key": "cpd_clarity",
             "text": _t("Meer duidelijkheid over hoe beloning en groei worden bepaald",
                        "Meer duidelijkheid over hoe beloning en groei werden bepaald"),
             "imperative": "Maak duidelijk hoe beloning en groei worden bepaald."},
            {"key": "cpd_flex",
             "text": _t("Meer duidelijkheid of ruimte rond rooster, werktijden of flexibiliteit"),
             "imperative": "Geef meer duidelijkheid of ruimte rond rooster, werktijden en flexibiliteit."},
            _other("cpd"),
        ],
    },
    "role_clarity": {
        "question": _q("duidelijkheid over je rol"),
        "options": [
            _none("rcd"),
            {"key": "rcd_priorities",
             "text": _t("Duidelijkere prioriteiten binnen mijn rol"),
             "imperative": "Maak de prioriteiten binnen rollen duidelijker."},
            {"key": "rcd_expectations",
             "text": _t("Duidelijkheid over verwachtingen en waarop ik word aangesproken",
                        "Duidelijkheid over verwachtingen en waarop ik werd aangesproken"),
             "imperative": "Maak duidelijk wat er wordt verwacht en waarop medewerkers worden aangesproken."},
            {"key": "rcd_alignment",
             "text": _t("Eenduidigere opdrachten en betere afstemming tussen betrokkenen"),
             "imperative": "Maak opdrachten eenduidiger en stem beter af tussen betrokkenen."},
            {"key": "rcd_scope",
             "text": _t("Duidelijke afspraken als mijn takenpakket verandert",
                        "Duidelijke afspraken als mijn takenpakket veranderde"),
             "imperative": "Maak duidelijke afspraken wanneer een takenpakket verandert."},
            {"key": "rcd_mandate",
             "text": _t("Duidelijkheid over wat ik zelf mag beslissen",
                        "Duidelijkheid over wat ik zelf mocht beslissen"),
             "imperative": "Maak duidelijk wat medewerkers zelf mogen beslissen."},
            {"key": "rcd_information",
             "text": _t("Betere informatie, context en overdracht voor mijn werk"),
             "imperative": "Zorg voor betere informatie, context en overdracht."},
            _other("rcd"),
        ],
    },
}
```

- [ ] **Stap 4: `get_direction_sets` + helpers vervangen**

Vervang de bestaande `get_direction_sets` (regel 537-551, met de `if scan_type != "retention": return {}`-tak) door:

```python
def get_direction_sets(scan_type: str) -> dict[str, dict[str, Any]]:
    """Per factor: question_set_version, question, options (key+text, scan-specifiek).
    `imperative` blijft server-side (alleen voor het rapport)."""
    if scan_type not in DIRECTION_VERSION:
        raise ValueError(f"unknown scan_type {scan_type!r}")
    out: dict[str, dict[str, Any]] = {}
    for fk in DEEPENING_FACTOR_KEYS:
        raw = DIRECTION_SETS[fk]
        out[fk] = {
            "question_set_version": f"{scan_type}_{fk}_direction_{DIRECTION_VERSION[scan_type]}",
            "question": raw["question"][scan_type],
            "options": [{"key": o["key"], "text": o["text"][scan_type]} for o in raw["options"]],
        }
    return out


def direction_option_texts(scan_type: str, factor_key: str) -> dict[str, str]:
    """key -> respondenttekst voor het rapport (verdelingstabel, niets-optie)."""
    return {o["key"]: o["text"] for o in get_direction_sets(scan_type)[factor_key]["options"]}


def direction_imperative(factor_key: str, option_key: str) -> str | None:
    """Opdrachtvorm van een route; None voor *_none en *_other."""
    options = {o["key"]: o["imperative"] for o in DIRECTION_SETS[factor_key]["options"]}
    if option_key not in options:
        raise KeyError(f"unknown option_key {option_key!r} for factor {factor_key!r}")
    return options[option_key]
```

- [ ] **Stap 5: Run**

```bash
$PY -m pytest tests/test_direction_content.py tests/test_deepening_content.py -q
```
Verwacht: PASS.

- [ ] **Stap 6: Commit**

```bash
git add backend/products/shared/deepening.py tests/test_direction_content.py
git commit -m "feat(deepening): richtingsets voor exit+retention met niets-optie en opdrachtvorm

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---
## Taak 5: `aggregate_direction` + `direction_state`

**Files:**
- Modify: `backend/products/shared/deepening.py` (toevoegen na `aggregate_deepening`)
- Create: `tests/test_direction_aggregation.py` (nieuwe inhoud; het oude bestand is in Taak 3 verwijderd)

- [ ] **Stap 1: Failing tests schrijven**

```python
# tests/test_direction_aggregation.py
"""aggregate_direction + direction_state (spec 2026-09-07 par. 5.3 en 5.4)."""
import logging

import pytest

from backend.products.shared.deepening import (
    DEEPENING_FACTOR_KEYS,
    aggregate_direction,
    direction_state,
)

# org_raw waarbij workload de eigen laagste is (2.0) en growth de op een na laagste (3.0).
LOW_WL = {"workload_1": 2, "workload_2": 2, "workload_3": 2,
          "growth_1": 3, "growth_2": 3, "growth_3": 3,
          "leadership_1": 4, "leadership_2": 4, "leadership_3": 4}
# org_raw waarbij growth de eigen laagste is.
LOW_GR = {"growth_1": 2, "growth_2": 3, "growth_3": 2,
          "workload_1": 4, "workload_2": 4, "workload_3": 4}


def _dr(fk="workload", status="answered", choice="wld_peaks"):
    return {"factor_key": fk, "question_set_version": f"retention_{fk}_direction_v2",
            "status": status, "choice": choice if status == "answered" else None,
            "other_text": None}


def test_each_respondent_counts_in_exactly_one_factor():
    rows = [(LOW_WL, _dr()), (LOW_WL, _dr()), (LOW_GR, _dr("growth", choice="grd_time"))]
    agg = aggregate_direction(rows, "retention")
    assert set(agg) == set(DEEPENING_FACTOR_KEYS)
    assert agg["workload"]["lowest_n"] == 2 and agg["growth"]["lowest_n"] == 1
    assert sum(a["lowest_n"] for a in agg.values()) == 3
    assert agg["workload"]["counts"] == {"wld_peaks": 2}
    assert agg["growth"]["counts"] == {"grd_time": 1}


def test_chain_counts_offered_answered_skipped():
    rows = [(LOW_WL, _dr()), (LOW_WL, _dr(status="skipped")), (LOW_WL, None)]
    a = aggregate_direction(rows, "retention")["workload"]
    assert a == {"lowest_n": 3, "offered": 2, "answered": 1, "skipped": 1,
                 "counts": {"wld_peaks": 1}}


def test_missing_field_shows_as_not_offered():
    # Oude client zonder direction_response: lowest_n telt, offered niet.
    a = aggregate_direction([(LOW_WL, None)], "retention")["workload"]
    assert a["lowest_n"] == 1 and a["offered"] == 0


def test_warns_but_counts_when_offered_exceeds_lowest(caplog):
    # Kan door de servervalidatie niet ontstaan; de aggregatie vertrouwt daar niet op.
    rows = [(LOW_GR, _dr("workload"))]   # zegt workload, maar growth is de laagste
    with caplog.at_level(logging.WARNING):
        a = aggregate_direction(rows, "retention")
    assert a["workload"]["offered"] == 1 and a["workload"]["lowest_n"] == 0
    assert any("offered > lowest_n" in r.message for r in caplog.records)


def test_unknown_scan_type_raises():
    with pytest.raises(ValueError):
        aggregate_direction([], "onboarding")


# ── direction_state ────────────────────────────────────────────────────────

def _agg(**counts):
    n = sum(counts.values())
    return {"lowest_n": n + 1, "offered": n + 1, "answered": n, "skipped": 1, "counts": counts}


def test_too_few_below_3():
    assert direction_state(_agg(wld_peaks=2))["state"] == "too_few"
    assert direction_state(_agg())["state"] == "too_few"


def test_clear_requires_half_and_margin_2():
    assert direction_state(_agg(wld_peaks=3))["state"] == "clear"            # 3-0
    assert direction_state(_agg(wld_peaks=2, wld_scope=1))["state"] == "divided"  # 2-1: marge 1
    assert direction_state(_agg(wld_peaks=3, wld_scope=1))["state"] == "clear"    # 3-1
    assert direction_state(_agg(wld_peaks=5, wld_scope=3, wld_none=2))["state"] == "clear"   # 50%, marge 2
    assert direction_state(_agg(wld_peaks=5, wld_scope=4, wld_none=1))["state"] == "divided"  # marge 1
    assert direction_state(_agg(wld_peaks=4, wld_scope=2, wld_none=2, wld_time=2))["state"] == "divided"  # 40%


def test_none_needed_wins_ties_and_is_evaluated_first():
    s = direction_state(_agg(wld_none=2, wld_peaks=2))     # 2-2 op n=4
    assert s["state"] == "none_needed" and s["top_key"] == "wld_none" and s["top_n"] == 2
    assert direction_state(_agg(wld_none=5, wld_peaks=1, wld_scope=1))["state"] == "none_needed"
    assert direction_state(_agg(wld_none=2, wld_peaks=3))["state"] == "divided"  # niets 40%, peaks 60% marge 1


def test_other_as_top_is_divided_and_logged(caplog):
    with caplog.at_level(logging.WARNING):
        s = direction_state(_agg(wld_other=6, wld_peaks=2), factor_key="workload")
    assert s["state"] == "divided"
    assert any("optieset review" in r.message for r in caplog.records)


def test_state_payload_shape():
    s = direction_state(_agg(wld_peaks=6, wld_scope=2, wld_none=2))
    assert s["state"] == "clear"
    assert s["n"] == 10 and s["top_key"] == "wld_peaks" and s["top_n"] == 6 and s["second_n"] == 2
    assert s["ranked"][0] == ("wld_peaks", 6)
    assert [k for k, _ in s["ranked"]] == ["wld_peaks", "wld_none", "wld_scope"]  # aantal desc, key asc
```

- [ ] **Stap 2: Run, verwacht ImportError**

```bash
$PY -m pytest tests/test_direction_aggregation.py -q
```

- [ ] **Stap 3: Implementeren** (direct na `aggregate_deepening` in `deepening.py`; `logging` staat nog niet in dit bestand: voeg bovenaan `import logging` en `logger = logging.getLogger(__name__)` toe)

```python
DIRECTION_MIN_N = 3          # vloer voor het rapportblok (spec par. 5.4; bewust lager dan MIN_SEGMENT_N,
                             # zie spec par. 6.3: subgroep onzichtbaar voor de organisatie)
DIRECTION_OTHER_WARN_N = 8   # vanaf hier een reviewvlag als *_other de topoptie is


def aggregate_direction(
    rows: list[tuple[dict[str, int], dict | None]],
    scan_type: str,
) -> dict[str, dict[str, Any]]:
    """Per factor de keten laagst -> aangeboden -> beantwoord/overgeslagen + keuzeverdeling
    (spec 2026-09-07 par. 5.3).

    rows: per respondent (org_raw, direction_response | None).
    lowest_n wordt herberekend uit org_raw (niet uit het opgeslagen veld), zodat de
    keten ook klopt als een oude client niets meestuurde (lowest_n > offered)."""
    if scan_type not in DIRECTION_VERSION:
        raise ValueError(f"unknown scan_type {scan_type!r}")
    out: dict[str, dict[str, Any]] = {
        fk: {"lowest_n": 0, "offered": 0, "answered": 0, "skipped": 0, "counts": {}}
        for fk in DEEPENING_FACTOR_KEYS
    }
    for org_raw, dr in rows:
        lowest = compute_direction_factor(org_raw)
        if lowest is not None:
            out[lowest]["lowest_n"] += 1
        if not dr:
            continue
        agg = out.get(dr.get("factor_key"))
        if agg is None:
            continue
        agg["offered"] += 1
        if dr.get("status") == "answered" and dr.get("choice"):
            agg["answered"] += 1
            agg["counts"][dr["choice"]] = agg["counts"].get(dr["choice"], 0) + 1
        else:
            agg["skipped"] += 1
    for fk, agg in out.items():
        if agg["offered"] > agg["lowest_n"]:
            logger.warning("direction: offered > lowest_n voor %s (%d > %d)",
                           fk, agg["offered"], agg["lowest_n"])
    return out


def direction_state(agg: dict[str, Any], factor_key: str | None = None) -> dict[str, Any]:
    """Staat van het richtingblok voor een factor (spec par. 5.4), geëvalueerd in
    de volgorde too_few -> none_needed -> clear -> divided.

    Retourneert altijd {state, n, top_key, top_n, second_n, ranked}."""
    n = agg["answered"]
    counts: dict[str, int] = agg.get("counts") or {}
    ranked = sorted(counts.items(), key=lambda kv: (-kv[1], kv[0]))
    base: dict[str, Any] = {"n": n, "ranked": ranked, "top_key": None, "top_n": 0, "second_n": 0}
    if n < DIRECTION_MIN_N:
        return {**base, "state": "too_few"}
    none_items = [(k, c) for k, c in counts.items() if k.endswith("_none")]
    none_n = sum(c for _, c in none_items)
    if none_n / n >= 0.5:
        return {**base, "state": "none_needed", "top_key": none_items[0][0], "top_n": none_n}
    top_key, top_n = ranked[0]
    second_n = ranked[1][1] if len(ranked) > 1 else 0
    base.update(top_key=top_key, top_n=top_n, second_n=second_n)
    if top_key.endswith("_other") and n >= DIRECTION_OTHER_WARN_N:
        logger.warning("direction: *_other is topoptie voor %s - optieset review nodig",
                       factor_key or top_key.split("_")[0])
    if (not top_key.endswith(("_none", "_other"))
            and top_n / n >= 0.5 and top_n - second_n >= 2):
        return {**base, "state": "clear"}
    return {**base, "state": "divided"}
```

- [ ] **Stap 4: Run**

```bash
$PY -m pytest tests/test_direction_aggregation.py tests/test_direction_factor.py -q
```
Verwacht: PASS.

- [ ] **Stap 5: Commit**

```bash
git add backend/products/shared/deepening.py tests/test_direction_aggregation.py
git commit -m "feat(deepening): aggregate_direction + direction_state met vier staten

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---

## Taak 6: Pydantic-schema's

**Files:**
- Modify: `backend/schemas.py` (regel 292-330 `DeepeningDirection`/`DeepeningEntry`; regel 375 `SurveySubmit.deepening_responses`)
- Rewrite: `tests/test_direction_schema.py`

- [ ] **Stap 1: Failing tests schrijven** (bestand volledig vervangen)

```python
# tests/test_direction_schema.py
"""DirectionResponse + weigering van het oude geneste formaat (spec par. 4.2/4.3)."""
import pytest
from pydantic import ValidationError

from backend.schemas import DeepeningEntry, DirectionResponse, SurveySubmit


def _dr(**over):
    base = dict(factor_key="workload", question_set_version="retention_workload_direction_v2",
                status="answered", choice="wld_peaks")
    base.update(over)
    return base


def test_answered_requires_choice():
    with pytest.raises(ValidationError):
        DirectionResponse(**_dr(choice=None))


def test_skipped_forbids_choice_and_other():
    with pytest.raises(ValidationError):
        DirectionResponse(**_dr(status="skipped"))
    with pytest.raises(ValidationError):
        DirectionResponse(**_dr(status="skipped", choice=None, other_text="x"))
    ok = DirectionResponse(**_dr(status="skipped", choice=None))
    assert ok.choice is None and ok.other_text is None


def test_other_requires_text_and_text_requires_other():
    with pytest.raises(ValidationError):
        DirectionResponse(**_dr(choice="wld_other"))
    with pytest.raises(ValidationError):
        DirectionResponse(**_dr(choice="wld_other", other_text="   "))
    with pytest.raises(ValidationError):
        DirectionResponse(**_dr(other_text="tekst bij een gewone route"))
    assert DirectionResponse(**_dr(choice="wld_other", other_text="Iets anders")).other_text == "Iets anders"


def test_other_text_max_200():
    with pytest.raises(ValidationError):
        DirectionResponse(**_dr(choice="wld_other", other_text="x" * 201))


def test_deepening_entry_has_no_direction_field_and_rejects_legacy():
    assert "direction" not in DeepeningEntry.model_fields
    with pytest.raises(ValidationError) as exc:
        DeepeningEntry(factor_key="workload", question_set_version="retention_workload_v1",
                       status="answered", primary="wl_recovery",
                       direction={"question_set_version": "x", "status": "skipped"})
    assert "Verouderd inzendformaat voor gespreksrichting" in str(exc.value)


def test_survey_submit_accepts_optional_direction_response():
    assert SurveySubmit.model_fields["direction_response"].default is None
```

- [ ] **Stap 2: Run, verwacht ImportError op `DirectionResponse`**

```bash
$PY -m pytest tests/test_direction_schema.py -q
```

- [ ] **Stap 3: Implementeren**

In `backend/schemas.py` vervang het blok van `class DeepeningDirection(BaseModel):` t/m het einde van `class DeepeningEntry` (regel 292-330) door:

```python
class DirectionResponse(BaseModel):
    """Eén richtingantwoord per respondent, op de eigen laagste werkfactor
    (spec 2026-09-07 par. 4.1). Vervangt het geneste DeepeningDirection uit juli."""
    factor_key: str
    question_set_version: str
    status: Literal["answered", "skipped"]
    choice: Optional[str] = None
    other_text: Optional[str] = Field(None, max_length=200)

    @model_validator(mode="after")
    def _validate(self) -> "DirectionResponse":
        if self.status == "answered" and not self.choice:
            raise ValueError("answered vereist een keuze")
        if self.status == "skipped" and (self.choice or self.other_text):
            raise ValueError("skipped mag geen keuze of toelichting bevatten")
        if self.choice and self.choice.endswith("_other") and not (self.other_text and self.other_text.strip()):
            raise ValueError("other-keuze vereist een toelichting")
        if self.other_text and not (self.choice and self.choice.endswith("_other")):
            raise ValueError("other_text alleen bij een *_other keuze")
        return self


class DeepeningEntry(BaseModel):
    """Eén verdiepingsantwoord (spec: docs/superpowers/specs/2026-07-03-verdiepingsvragen-design.md §5)."""
    factor_key: str
    question_set_version: str
    status: Literal["answered", "skipped"]
    primary: Optional[str] = None
    secondary: Optional[str] = None
    other_text: Optional[str] = Field(None, max_length=200)

    @model_validator(mode="before")
    @classmethod
    def _reject_legacy_direction(cls, data):
        # Fail Loud (spec 2026-09-07 par. 4.3): het geneste juli-formaat niet stil negeren.
        if isinstance(data, dict) and "direction" in data:
            raise ValueError("Verouderd inzendformaat voor gespreksrichting.")
        return data

    @model_validator(mode="after")
    def _validate_choices(self) -> "DeepeningEntry":
        if self.status == "answered" and not self.primary:
            raise ValueError("answered vereist een hoofdkeuze")
        if self.status == "skipped" and (self.primary or self.secondary or self.other_text):
            raise ValueError("skipped mag geen keuzes bevatten")
        if self.secondary and self.secondary == self.primary:
            raise ValueError("meespelende keuze moet verschillen van hoofdkeuze")
        if self.other_text:
            if not any(k and k.endswith("_other") for k in (self.primary, self.secondary)):
                raise ValueError("other_text alleen bij een *_other keuze")
        return self
```

En in `SurveySubmit`, direct onder regel 375 (`deepening_responses: list[DeepeningEntry] = Field(default_factory=list)`):

```python
    direction_response: Optional[DirectionResponse] = None
```

- [ ] **Stap 4: Run**

```bash
$PY -m pytest tests/test_direction_schema.py tests/test_deepening_schema.py -q
```
Verwacht: PASS.

- [ ] **Stap 5: Commit**

```bash
git add backend/schemas.py tests/test_direction_schema.py
git commit -m "feat(schemas): DirectionResponse op SurveySubmit; genest direction-formaat wordt geweigerd

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---
## Taak 7: Kolom, migratie en servervalidatie in `/survey/submit`

**Files:**
- Modify: `backend/models.py:271` (naast `deepening_responses`)
- Create: `migrations/2026_09_07_add_direction_response.sql`
- Modify: `backend/main.py` (import regel 76; render-endpoint regel 1337; submit-validatie regel 1369-1410; persist regel 1485)
- Rewrite: `tests/test_direction_submit.py`

- [ ] **Stap 1: Failing tests schrijven** (bestand volledig vervangen)

```python
# tests/test_direction_submit.py
"""Servervalidatie + persistentie van direction_response in /survey/submit (spec par. 4.3)."""
from __future__ import annotations

from sqlalchemy.orm import Session

from backend.models import SurveyResponse
from backend.scoring import ORG_FACTOR_KEYS

from tests.test_api_flows import _create_campaign, _create_org, _create_respondent


def _org_raw(low_factors: dict[str, int] | None = None) -> dict[str, int]:
    base = {f"{factor}_{idx}": 4 for factor in ORG_FACTOR_KEYS for idx in range(1, 4)}
    for factor, value in (low_factors or {}).items():
        for idx in range(1, 4):
            base[f"{factor}_{idx}"] = value
    return base


def _retention_payload(token: str, *, org_raw: dict[str, int], direction=None, deepening=None) -> dict:
    payload = {
        "token": token,
        "tenure_years": None,
        "exit_reason_category": None,
        "enps_score": 9,
        "stay_intent_score": 4,
        "sdt_raw": {f"B{i}": 4 for i in range(1, 13)},
        "org_raw": org_raw,
        "pull_factors_raw": {},
        "open_text": "Meer ontwikkelruimte zou helpen.",
        "uwes_raw": {"uwes_1": 4, "uwes_2": 5, "uwes_3": 4},
        "turnover_intention_raw": {"ti_1": 2, "ti_2": 3},
    }
    if direction is not None:
        payload["direction_response"] = direction
    if deepening is not None:
        payload["deepening_responses"] = deepening
    return payload


def _exit_payload(token: str, *, org_raw: dict[str, int], direction=None) -> dict:
    payload = {
        "token": token,
        "tenure_years": 2.0,
        "exit_reason_category": "groei",
        "enps_score": 8,
        "stay_intent_score": 4,
        "signal_visibility_score": 2,
        "sdt_raw": {f"B{i}": 3 for i in range(1, 13)},
        "org_raw": org_raw,
        "pull_factors_raw": {"leiderschap": 1},
        "open_text": "Ik miste vooral duidelijk groeiperspectief.",
        "uwes_raw": {},
        "turnover_intention_raw": {},
    }
    if direction is not None:
        payload["direction_response"] = direction
    return payload


def _dr(scan_type="retention", fk="workload", status="answered", choice="wld_peaks", other_text=None):
    version = "v2" if scan_type == "retention" else "v1"
    return {"factor_key": fk, "question_set_version": f"{scan_type}_{fk}_direction_{version}",
            "status": status, "choice": choice if status == "answered" else None,
            "other_text": other_text}


def _setup(db: Session, *, scan_type: str = "retention"):
    org = _create_org(db, api_key=f"direction-submit-{scan_type}")
    campaign = _create_campaign(db, org, name="Richtingsvraag", scan_type=scan_type)
    return _create_respondent(db, campaign, email=f"richting-{scan_type}@example.com")


def _stored(db: Session, respondent) -> SurveyResponse:
    return db.query(SurveyResponse).filter(SurveyResponse.respondent_id == respondent.id).one()


def test_retention_accepted_and_persisted(client, db_session: Session):
    r = _setup(db_session)
    resp = client.post("/survey/submit", json=_retention_payload(
        r.token, org_raw=_org_raw({"workload": 2}), direction=_dr()))
    assert resp.status_code == 200, resp.text
    stored = _stored(db_session, r)
    assert stored.direction_response == _dr()


def test_exit_accepted_and_persisted(client, db_session: Session):
    r = _setup(db_session, scan_type="exit")
    resp = client.post("/survey/submit", json=_exit_payload(
        r.token, org_raw=_org_raw({"growth": 2}), direction=_dr("exit", "growth", choice="grd_time")))
    assert resp.status_code == 200, resp.text
    assert _stored(db_session, r).direction_response["factor_key"] == "growth"


def test_high_scorer_without_trigger_can_answer_direction(client, db_session: Session):
    # Laagste factor is een 'hoge' score (4/5 overal behalve growth 4,4,3): geen verdieping, wel richting.
    r = _setup(db_session)
    org_raw = _org_raw(); org_raw["growth_3"] = 3
    resp = client.post("/survey/submit", json=_retention_payload(
        r.token, org_raw=org_raw, direction=_dr(fk="growth", choice="grd_none")))
    assert resp.status_code == 200, resp.text
    stored = _stored(db_session, r)
    assert stored.deepening_responses is None
    assert stored.direction_response["choice"] == "grd_none"


def test_wrong_factor_422(client, db_session: Session):
    r = _setup(db_session)
    resp = client.post("/survey/submit", json=_retention_payload(
        r.token, org_raw=_org_raw({"workload": 2}), direction=_dr(fk="growth", choice="grd_time")))
    assert resp.status_code == 422
    assert resp.json()["detail"] == "Gespreksrichting hoort niet bij deze inzending."


def test_unknown_choice_422(client, db_session: Session):
    r = _setup(db_session)
    resp = client.post("/survey/submit", json=_retention_payload(
        r.token, org_raw=_org_raw({"workload": 2}), direction=_dr(choice="wld_bestaat_niet")))
    assert resp.status_code == 422
    assert resp.json()["detail"] == "Onbekende gespreksrichting-optie."


def test_wrong_version_422(client, db_session: Session):
    r = _setup(db_session)
    d = _dr(); d["question_set_version"] = "retention_workload_direction_v1"   # de juli-versie
    resp = client.post("/survey/submit", json=_retention_payload(
        r.token, org_raw=_org_raw({"workload": 2}), direction=d))
    assert resp.status_code == 422
    assert resp.json()["detail"] == "Verouderde gespreksrichting-versie."


def test_legacy_nested_direction_422(client, db_session: Session):
    r = _setup(db_session)
    legacy_entry = {"factor_key": "workload", "question_set_version": "retention_workload_v1",
                    "status": "answered", "primary": "wl_recovery",
                    "direction": {"question_set_version": "retention_workload_direction_v1",
                                  "status": "answered", "choice": "wld_recovery", "other_text": None}}
    resp = client.post("/survey/submit", json=_retention_payload(
        r.token, org_raw=_org_raw({"workload": 2}), deepening=[legacy_entry]))
    assert resp.status_code == 422
    assert "Verouderd inzendformaat voor gespreksrichting" in resp.text


def test_missing_field_accepted_and_null(client, db_session: Session):
    r = _setup(db_session)
    resp = client.post("/survey/submit", json=_retention_payload(r.token, org_raw=_org_raw({"workload": 2})))
    assert resp.status_code == 200, resp.text
    assert _stored(db_session, r).direction_response is None


def test_skipped_persisted(client, db_session: Session):
    r = _setup(db_session)
    resp = client.post("/survey/submit", json=_retention_payload(
        r.token, org_raw=_org_raw({"workload": 2}), direction=_dr(status="skipped")))
    assert resp.status_code == 200, resp.text
    stored = _stored(db_session, r).direction_response
    assert stored["status"] == "skipped" and stored["choice"] is None


def test_other_text_is_anonymized(client, db_session: Session):
    r = _setup(db_session)
    resp = client.post("/survey/submit", json=_retention_payload(
        r.token, org_raw=_org_raw({"workload": 2}),
        direction=_dr(choice="wld_other", other_text="Mail maar naar jan.jansen@voorbeeld.nl hierover.")))
    assert resp.status_code == 200, resp.text
    assert "jan.jansen@voorbeeld.nl" not in _stored(db_session, r).direction_response["other_text"]
```

- [ ] **Stap 2: Run, verwacht failures** (`direction_response` bestaat niet op het model / 422's kloppen nog niet)

```bash
$PY -m pytest tests/test_direction_submit.py -q
```

- [ ] **Stap 3: Kolom op het model**

In `backend/models.py` direct onder regel 271:

```python
    deepening_responses: Mapped[list | None] = mapped_column(JSON, nullable=True)
    # Eén richtingantwoord per respondent op de eigen laagste werkfactor (spec 2026-09-07 par. 4.1).
    direction_response: Mapped[dict | None] = mapped_column(JSON, nullable=True)
```

- [ ] **Stap 4: Migratie**

```sql
-- migrations/2026_09_07_add_direction_response.sql
-- Migration: richtingantwoord per respondent op survey_responses
-- Spec: docs/superpowers/specs/2026-09-07-richtingsvraag-altijd-design.md par. 4.1
-- Uitvoeren in: Supabase Dashboard → SQL Editor, VÓÓR de Railway-redeploy.
-- Additief en idempotent.

ALTER TABLE public.survey_responses
  ADD COLUMN IF NOT EXISTS direction_response jsonb;
```

- [ ] **Stap 5: `main.py` import + render-endpoint**

Regel 76, vervang:
```python
from backend.products.shared.deepening import DEEPENING_CAP, compute_deepening_offers, get_deepening_sets, get_direction_sets
```
door:
```python
from backend.products.shared.deepening import (
    DEEPENING_CAP, compute_deepening_offers, compute_direction_factor,
    get_deepening_sets, get_direction_sets,
)
```

Regel 1337 in het render-endpoint, vervang:
```python
            "direction_sets":  get_direction_sets(campaign.scan_type) if campaign.scan_type == "retention" else {},
```
door:
```python
            "direction_sets":  get_direction_sets(campaign.scan_type) if campaign.scan_type in ("exit", "retention") else {},
```

- [ ] **Stap 6: Submit-validatie herschrijven**

Vervang in `/survey/submit` het blok vanaf `# --- Verdiepingsvragen: server-side semantische validatie` t/m `deepening_clean.append(d)` (regel 1368-1410) door:

```python
    # --- Verdiepingsvragen: server-side semantische validatie (client is untrusted) ---
    if payload.deepening_responses:
        scan_type = respondent.campaign.scan_type
        if scan_type not in ("exit", "retention"):
            raise HTTPException(
                status_code=422,
                detail="Verdieping wordt niet ondersteund voor dit scantype.",
            )
        offered_factors = compute_deepening_offers(payload.org_raw, scan_type)
        deepening_sets = get_deepening_sets(scan_type)
        seen_factors: set[str] = set()
        for entry in payload.deepening_responses:
            if entry.factor_key not in offered_factors:
                raise HTTPException(status_code=422, detail="Verdieping hoort niet bij deze inzending.")
            if entry.factor_key in seen_factors:
                raise HTTPException(status_code=422, detail="Dubbele verdieping voor dezelfde factor.")
            seen_factors.add(entry.factor_key)
            factor_set = deepening_sets[entry.factor_key]
            valid_option_keys = {option["key"] for option in factor_set["options"]}
            for choice in (entry.primary, entry.secondary):
                if choice is not None and choice not in valid_option_keys:
                    raise HTTPException(status_code=422, detail="Onbekende verdiepingsoptie.")
            if entry.question_set_version != factor_set["question_set_version"]:
                raise HTTPException(status_code=422, detail="Verouderde vragenset-versie.")

    deepening_clean: list[dict] = []
    for entry in payload.deepening_responses:
        d = entry.model_dump()
        if d.get("other_text"):
            d["other_text"] = anonymize_text(d["other_text"])
        deepening_clean.append(d)

    # --- Richtingvraag: één per respondent, op de eigen laagste factor (spec 2026-09-07 par. 4.3) ---
    direction_clean: dict | None = None
    if payload.direction_response is not None:
        scan_type = respondent.campaign.scan_type
        if scan_type not in ("exit", "retention"):
            raise HTTPException(status_code=422, detail="Gespreksrichting wordt niet ondersteund voor dit scantype.")
        dr = payload.direction_response
        if dr.factor_key != compute_direction_factor(payload.org_raw):
            raise HTTPException(status_code=422, detail="Gespreksrichting hoort niet bij deze inzending.")
        direction_set = get_direction_sets(scan_type)[dr.factor_key]
        if dr.question_set_version != direction_set["question_set_version"]:
            raise HTTPException(status_code=422, detail="Verouderde gespreksrichting-versie.")
        if dr.choice is not None and dr.choice not in {o["key"] for o in direction_set["options"]}:
            raise HTTPException(status_code=422, detail="Onbekende gespreksrichting-optie.")
        direction_clean = dr.model_dump()
        if direction_clean.get("other_text"):
            direction_clean["other_text"] = anonymize_text(direction_clean["other_text"])
```

- [ ] **Stap 7: Persisteren**

Regel 1485 (`deepening_responses   = deepening_clean or None,`), voeg direct eronder toe:

```python
        direction_response    = direction_clean,
```

- [ ] **Stap 8: Run**

```bash
$PY -m pytest tests/test_direction_submit.py tests/test_deepening_submit.py tests/test_api_flows.py -q
```
Verwacht: PASS (voor `test_api_flows.py`: dezelfde skips/fails als in `/tmp/baseline_fail.txt`).

- [ ] **Stap 9: Commit**

```bash
git add backend/models.py backend/main.py migrations/2026_09_07_add_direction_response.sql tests/test_direction_submit.py
git commit -m "feat(api): direction_response kolom + servervalidatie op de eigen laagste factor

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---
## Taak 8: Rapportblok "Wat er moet gebeuren" + regel op pagina 2

**Files:**
- Modify: `backend/report_html.py` (imports regel 26-30; `_bestuurlijke_read` regel 534-556; nieuwe helpers vlak vóór `_prioriteringsraster` (regel ~789); `_prioriteringsraster` signature + template; `build_report_data` regel 1650-1657 en de return-dict regel ~1748; exit-renderer rond regel 2016 / 2143 / 2321; retention-renderer rond regel 2416 / 2505 / 2678)
- Modify: `backend/report_css.py` (na `.r-gate`, regel ~236)
- Create: `tests/test_direction_report_block.py`

- [ ] **Stap 1: Failing tests schrijven**

```python
# tests/test_direction_report_block.py
"""Rapportblok 'Wat er moet gebeuren' + p.02-regel (spec 2026-09-07 par. 6)."""
from backend.report_html import (
    DIRECTION_BLOCK_EYEBROW,
    _bestuurlijke_read,
    _direction_card,
    _direction_chain,
    _direction_p02_line,
    _prioriteringsraster,
    _wat_moet_gebeuren_block,
)
from tests.test_report_priority_render import RANKED, RESP

FORBIDDEN = ["risico", "interventie", "actieplan", "loep adviseert", "aanbeveling"]


def _agg(answered, counts, lowest=None, skipped=1, offered=None):
    lowest = lowest if lowest is not None else answered + skipped
    offered = offered if offered is not None else answered + skipped
    return {"lowest_n": lowest, "offered": offered, "answered": answered,
            "skipped": skipped, "counts": counts}


CLEAR = _agg(8, {"grd_visibility": 6, "grd_none": 1, "grd_time": 1})          # 9 laagste, 8 antw, 1 skip
DIVIDED = _agg(8, {"wld_peaks": 3, "wld_scope": 3, "wld_none": 2}, skipped=0)
NONE = _agg(8, {"wld_none": 5, "wld_peaks": 2, "wld_scope": 1}, skipped=0)
FEW = _agg(2, {"wld_peaks": 2}, skipped=0)


def test_clear_card_shows_imperative_source_and_chain():
    html = _direction_card("startpunt", "Groeiperspectief", CLEAR, "retention", "growth", 13)
    assert "Startpunt: Groeiperspectief" in html
    assert "Maak zichtbaar welke mogelijkheden er voor medewerkers zijn." in html
    assert "Volgens 6 van de 8 bij wie groeiperspectief het laagst scoorde." in html
    assert "Van de 13 respondenten hadden 9 dit als laagste; 8 beantwoordden de vraag, 1 sloeg over." in html
    assert "Niets, dit zit hier goed" in html            # verdelingstabel toont ook de niets-optie
    assert "%" not in html                                # n<10: alleen aantallen
    assert "Beperkte basis" not in html                   # n=8


def test_divided_card():
    html = _direction_card("tweede", "Werkdruk en herstelruimte", DIVIDED, "retention", "workload", 13)
    assert "Tweede punt: Werkdruk en herstelruimte" in html
    assert "Geen eenduidige richting." in html
    assert "De 8 bij wie dit het laagst scoorde kozen verschillend." in html
    assert "Plan piekmomenten" not in html                # geen opdrachtvorm bij verdeeld


def test_none_needed_card_questions_the_role():
    start = _direction_card("startpunt", "Werkdruk en herstelruimte", NONE, "retention", "workload", 13)
    assert "Hier hoeft volgens de meeste betrokkenen niets." in start
    assert "5 van de 8 bij wie dit het laagst scoorde kozen 'Niets, dit zit hier goed'. Bespreek of dit dan het startpunt moet zijn." in start
    second = _direction_card("tweede", "Werkdruk en herstelruimte", NONE, "retention", "workload", 13)
    assert "het tweede punt moet zijn." in second


def test_too_few_card_only_chain():
    html = _direction_card("tweede", "Werkdruk en herstelruimte", FEW, "retention", "workload", 13)
    assert "Te weinig antwoorden voor een richting." in html
    assert "item-tbl" not in html
    assert "Van de 13 respondenten hadden 2 dit als laagste; 2 beantwoordden de vraag." in html


def test_percentages_from_10_and_caveat_at_3_4():
    big = _direction_card("startpunt", "Groeiperspectief",
                          _agg(10, {"grd_visibility": 7, "grd_none": 3}), "retention", "growth", 20)
    assert "70% (7)" in big and "30% (3)" in big
    small = _direction_card("startpunt", "Groeiperspectief",
                            _agg(3, {"grd_visibility": 3}, skipped=0), "retention", "growth", 13)
    assert "Beperkte basis: gebruik dit als gesprekshaakje, niet als conclusie." in small
    assert "Volgens 3 van de 3" in small


def test_exit_tense_in_none_option_text():
    html = _direction_card("startpunt", "Werkdruk en balans",
                           _agg(8, {"wld_none": 5, "wld_peaks": 3}, skipped=0), "exit", "workload", 13)
    assert "Niets, dit zat hier goed" in html


def test_chain_with_old_client_gap():
    agg = _agg(6, {"wld_peaks": 6}, lowest=9, offered=7, skipped=1)
    assert _direction_chain(agg, 13) == (
        "Van de 13 respondenten hadden 9 dit als laagste; 7 kregen de vraag, "
        "6 beantwoordden die, 1 sloeg over.")
    assert _direction_chain(_agg(1, {"wld_peaks": 1}, skipped=2), 13) == (
        "Van de 13 respondenten hadden 3 dit als laagste; 1 beantwoordde de vraag, 2 sloegen over.")


def test_block_two_cards_for_startpunt_and_tweede_only():
    agg = {"growth": CLEAR, "workload": DIVIDED, "leadership": CLEAR}
    html = _wat_moet_gebeuren_block(RANKED, agg, "retention", 13)
    assert DIRECTION_BLOCK_EYEBROW in html
    assert html.count('class="dir-card') == 2
    assert "Startpunt: Groeiperspectief" in html and "Tweede punt: Werkdruk en herstelruimte" in html
    assert "Leiderschap" not in html.split("dir-grid")[1]
    assert "geen advies van Loep" in html


def test_block_empty_without_data_and_missing_factor_is_too_few():
    assert _wat_moet_gebeuren_block(RANKED, {}, "retention", 13) == ""
    html = _wat_moet_gebeuren_block(RANKED, {"growth": CLEAR}, "retention", 13)
    assert "Te weinig antwoorden voor een richting." in html   # workload ontbreekt in agg -> lege keten


def test_raster_integration_gate():
    kwargs = dict(ranked=RANKED, scan_type="retention", factor_resp_scores=RESP,
                  deepening_active=True, mgmt_q="Testvraag?",
                  review_when="Plan binnen 45-90 dagen een vervolgmoment.",
                  opener_html="<h2>Gespreksagenda</h2>")
    without = _prioriteringsraster(**kwargs)
    with_dir = _prioriteringsraster(**kwargs, direction_agg={"growth": CLEAR, "workload": DIVIDED}, n_total=13)
    assert DIRECTION_BLOCK_EYEBROW not in without
    assert DIRECTION_BLOCK_EYEBROW in with_dir
    # Het blok staat vóór het navy slotblok.
    assert with_dir.index(DIRECTION_BLOCK_EYEBROW) < with_dir.index('class="agenda-dark"')


def test_p02_line_per_state():
    assert _direction_p02_line({"growth": CLEAR}, "growth", "retention") == (
        "Wat er volgens 6 van de 8 moet gebeuren: Maak zichtbaar welke mogelijkheden er voor medewerkers zijn.")
    assert _direction_p02_line({"workload": DIVIDED}, "workload", "retention") == (
        "Over wat hier moet gebeuren zijn de 8 die dit het laagst scoorden verdeeld. Zie de gespreksagenda.")
    assert _direction_p02_line({"workload": NONE}, "workload", "retention") == (
        "5 van de 8 die dit het laagst scoorden zeggen: hier hoeft niets.")
    assert _direction_p02_line({"workload": FEW}, "workload", "retention") == ""
    assert _direction_p02_line({}, "workload", "retention") == ""
    assert _direction_p02_line({"workload": CLEAR}, None, "retention") == ""


def test_bestuurlijke_read_renders_direction_line_only_when_given():
    kwargs = dict(kernzin="k", totaalbeeld="t", primary_label="Groeiperspectief",
                  why_cells_html="", strong_label="", strong_score=None, mgmt_q="Vraag?")
    assert "mq-direction" not in _bestuurlijke_read(**kwargs)
    html = _bestuurlijke_read(**kwargs, direction_line="Wat er volgens 6 van de 8 moet gebeuren: X.")
    assert 'class="mq-direction"' in html and "6 van de 8" in html


def test_no_em_dashes_or_forbidden_words():
    blobs = [
        _direction_card("startpunt", "Groeiperspectief", CLEAR, "retention", "growth", 13),
        _direction_card("tweede", "Werkdruk en herstelruimte", DIVIDED, "retention", "workload", 13),
        _direction_card("startpunt", "Werkdruk en herstelruimte", NONE, "retention", "workload", 13),
        _direction_card("tweede", "Werkdruk en herstelruimte", FEW, "retention", "workload", 13),
        _wat_moet_gebeuren_block(RANKED, {"growth": CLEAR, "workload": DIVIDED}, "exit", 13),
    ]
    for b in blobs:
        assert "—" not in b and "&#x2014;" not in b
        low = b.lower()
        for w in FORBIDDEN:
            assert w not in low, w
```

- [ ] **Stap 2: Run, verwacht ImportError**

```bash
$PY -m pytest tests/test_direction_report_block.py -q
```

- [ ] **Stap 3: Imports in `report_html.py`**

Regel 26-30, vervang door:

```python
from backend.products.shared.deepening import (
    agenda_enrichment,
    aggregate_deepening,
    aggregate_direction,
    direction_imperative,
    direction_option_texts,
    direction_state,
    get_deepening_sets,
)
```

- [ ] **Stap 4: `_bestuurlijke_read` krijgt `direction_line`**

Signature (regel 534-539): voeg `direction_line: str = ""` toe achter `usage_html: str = ""`. In de template vervang de regel

```python
    <div class="mq-line"><span class="mq-label">Gespreksopener</span><p>{_h(mgmt_q)}</p>{f'<span class="mq-source">{_h(mgmt_q_source)}</span>' if mgmt_q_source else ''}</div>
```
door:
```python
    <div class="mq-line"><span class="mq-label">Gespreksopener</span><p>{_h(mgmt_q)}</p>{f'<span class="mq-source">{_h(mgmt_q_source)}</span>' if mgmt_q_source else ''}{f'<p class="mq-direction">{_h(direction_line)}</p>' if direction_line else ''}</div>
```

- [ ] **Stap 5: Helpers toevoegen** (direct vóór `def _prioriteringsraster`, na `_raster_deepening_cell`)

```python
# ── Richtingblok "Wat er moet gebeuren" (spec 2026-09-07 par. 6) ─────────────

DIRECTION_BLOCK_EYEBROW = "Wat er moet gebeuren"
DIRECTION_BLOCK_INTRO = (
    "Elke respondent kreeg één vraag over het onderwerp dat bij henzelf het laagst "
    "scoorde: wat zou hier het meest helpen? Hieronder staat wat die respondenten kozen "
    "voor het startpunt en het tweede punt. Dit is hun keuze, geen advies van Loep.")
_EMPTY_DIRECTION_AGG = {"lowest_n": 0, "offered": 0, "answered": 0, "skipped": 0, "counts": {}}


def _direction_chain(agg: dict, n_total: int) -> str:
    """Keten laagst -> (aangeboden ->) beantwoord/overgeslagen (spec par. 6.1)."""
    lowest, offered = agg["lowest_n"], agg["offered"]
    answered, skipped = agg["answered"], agg["skipped"]
    had = f"hadden {lowest}" if lowest != 1 else "had 1"
    parts: list[str] = []
    if offered < lowest:
        parts.append(f"{offered} kregen de vraag" if offered != 1 else "1 kreeg de vraag")
        parts.append(f"{answered} beantwoordden die" if answered != 1 else "1 beantwoordde die")
    else:
        parts.append(f"{answered} beantwoordden de vraag" if answered != 1 else "1 beantwoordde de vraag")
    if skipped:
        parts.append(f"{skipped} sloegen over" if skipped != 1 else "1 sloeg over")
    return f"Van de {n_total} respondenten {had} dit als laagste; {', '.join(parts)}."


def _direction_card(role: str, label: str, agg: dict, scan_type: str,
                    factor_key: str, n_total: int) -> str:
    """Eén kaart (startpunt of tweede punt) in de vier staten van spec par. 6.1."""
    st = direction_state(agg, factor_key)
    texts = direction_option_texts(scan_type, factor_key)
    n = st["n"]
    role_lbl = "Startpunt" if role == "startpunt" else "Tweede punt"
    which = "het startpunt" if role == "startpunt" else "het tweede punt"
    if st["state"] == "too_few":
        head, src = "Te weinig antwoorden voor een richting.", ""
    elif st["state"] == "clear":
        head = direction_imperative(factor_key, st["top_key"]) or ""
        src = f"Volgens {st['top_n']} van de {n} bij wie {_lc(label)} het laagst scoorde."
    elif st["state"] == "none_needed":
        head = "Hier hoeft volgens de meeste betrokkenen niets."
        src = (f"{st['top_n']} van de {n} bij wie dit het laagst scoorde kozen "
               f"'{texts.get(st['top_key'], st['top_key'])}'. Bespreek of dit dan {which} moet zijn.")
    else:
        head = "Geen eenduidige richting."
        src = f"De {n} bij wie dit het laagst scoorde kozen verschillend."

    table = ""
    if st["state"] != "too_few":
        rows = "".join(
            f'<tr><td class="iq">{_h(texts.get(k, k))}</td>'
            f'<td class="is">{f"{round(c / n * 100)}% ({c})" if n >= 10 else c}</td></tr>'
            for k, c in st["ranked"])
        table = f'<table class="item-tbl dir-tbl">{rows}</table>'
        if n <= 4:
            table += ('<p class="dir-caveat">Beperkte basis: gebruik dit als '
                      'gesprekshaakje, niet als conclusie.</p>')
    src_html = f'<div class="dir-src">{_h(src)}</div>' if src else ""
    return (f'<td class="dir-card dir-{st["state"]}">'
            f'<div class="dir-role">{role_lbl}: {_h(label)}</div>'
            f'<div class="dir-head">{_h(head)}</div>{src_html}{table}'
            f'<div class="dir-chain">{_h(_direction_chain(agg, n_total))}</div></td>')


def _wat_moet_gebeuren_block(ranked: list[dict], direction_agg: dict,
                             scan_type: str, n_total: int) -> str:
    """Twee kaarten (startpunt + tweede punt) onder het raster. Leeg zonder
    richtingdata (campagne-gate zit in build_report_data)."""
    if not direction_agg:
        return ""
    cards = "".join(
        _direction_card(r["agenda_role"], r["label"],
                        direction_agg.get(r["key"]) or _EMPTY_DIRECTION_AGG,
                        scan_type, r["key"], n_total)
        for r in ranked if r["agenda_role"] in ("startpunt", "tweede"))
    if not cards:
        return ""
    return (f'<div class="dir-block"><span class="eyebrow">{DIRECTION_BLOCK_EYEBROW}</span>'
            f'<p class="dir-intro">{DIRECTION_BLOCK_INTRO}</p>'
            f'<table class="dir-grid"><tr>{cards}</tr></table></div>')


def _direction_p02_line(direction_agg: dict, factor_key: str | None, scan_type: str) -> str:
    """Eén regel over het startpunt op de openingspagina (spec par. 6.2); leeg onder de vloer."""
    if not direction_agg or not factor_key or factor_key not in direction_agg:
        return ""
    st = direction_state(direction_agg[factor_key], factor_key)
    n = st["n"]
    if st["state"] == "clear":
        return (f"Wat er volgens {st['top_n']} van de {n} moet gebeuren: "
                f"{direction_imperative(factor_key, st['top_key'])}")
    if st["state"] == "divided":
        return (f"Over wat hier moet gebeuren zijn de {n} die dit het laagst scoorden "
                "verdeeld. Zie de gespreksagenda.")
    if st["state"] == "none_needed":
        return f"{st['top_n']} van de {n} die dit het laagst scoorden zeggen: hier hoeft niets."
    return ""
```

- [ ] **Stap 6: `_prioriteringsraster` uitbreiden**

Signature: voeg achter `opener_html: str` toe: `direction_agg: dict | None = None, n_total: int = 0`. In de f-string, vervang

```python
  <div class="r-uitleg">{RASTER_UITLEG[scan_type]}</div>
  <div class="agenda-dark" style="margin-top:16px;">
```
door:
```python
  <div class="r-uitleg">{RASTER_UITLEG[scan_type]}</div>
  {_wat_moet_gebeuren_block(ranked, direction_agg or {}, scan_type, n_total)}
  <div class="agenda-dark" style="margin-top:16px;">
```

- [ ] **Stap 7: `build_report_data` levert `direction_agg`**

Direct na het `deepening_agg`-blok (regel 1650-1657):

```python
    # Richtingvraag (spec 2026-09-07 par. 5.3): zelfde campagne-gate-idee als de verdieping.
    direction_agg: dict[str, Any] = {}
    if scan_type in ("exit", "retention"):
        direction_agg = aggregate_direction(
            [(r.org_raw or {}, r.direction_response) for r in responses], scan_type)
        if not any(a["offered"] > 0 for a in direction_agg.values()):
            direction_agg = {}
```
En in de return-dict, direct onder `deepening_agg=deepening_agg,`: `direction_agg=direction_agg,`.

- [ ] **Stap 8: Exit-renderer bedraden**

Rond regel 2016 (`deep_agg = data.get("deepening_agg") or {}`), voeg eronder toe:
```python
    direction_agg = data.get("direction_agg") or {}
```
Bij de `_bestuurlijke_read(`-aanroep rond regel 2143, voeg als extra kwarg toe:
```python
        direction_line=_direction_p02_line(direction_agg, _raster_rows[0]["key"] if _raster_rows else None, "exit"),
```
Bij de `_prioriteringsraster(`-aanroep rond regel 2321, voeg toe:
```python
        direction_agg=direction_agg,
        n_total=n,
```
(`n` is de bestaande responsteller die ook in `cover_stats` staat: `("Respondenten", str(n))`. Controleer met `grep -n '("Respondenten", str(n))' backend/report_html.py` dat die in beide renderers bestaat.)

- [ ] **Stap 9: Retention-renderer bedraden**

Zelfde drie ingrepen: `direction_agg = data.get("direction_agg") or {}` onder regel 2416; `direction_line=_direction_p02_line(direction_agg, _raster_rows[0]["key"] if _raster_rows else None, ST),` bij `_bestuurlijke_read(` rond regel 2505; `direction_agg=direction_agg, n_total=n,` bij `_prioriteringsraster(` rond regel 2678.

- [ ] **Stap 10: CSS**

In `backend/report_css.py`, direct na de `.r-gate`-regel (regel ~236), binnen dezelfde raw-string:

```python
/* ── Richtingblok "Wat er moet gebeuren" ── */
.dir-block { margin-top: 18px; break-inside: avoid; }
.dir-intro { font-size: 10px; color: #374151; line-height: 1.5; margin: 4px 0 10px; max-width: 70ch; }
.dir-grid { width: 100%; border-collapse: separate; border-spacing: 12px 0; margin-left: -12px; }
.dir-card { width: 50%; vertical-align: top; background: #FFFFFF; border-left: 3px solid """ + HAIRLINE + r"""; padding: 12px 14px; }
.dir-card.dir-clear { border-left-color: """ + accent + r"""; }
.dir-role { font-family: 'JetBrains Mono', monospace; font-size: 8px; letter-spacing: 0.12em; text-transform: uppercase; color: """ + accent_lo + r"""; margin-bottom: 6px; }
.dir-head { font-size: 14px; font-weight: 700; line-height: 1.3; color: """ + NAVY + r"""; margin-bottom: 6px; }
.dir-src { font-size: 10px; color: #374151; margin-bottom: 8px; }
.dir-tbl td { font-size: 9.5px; padding: 5px 6px; }
.dir-caveat { font-size: 10px; color: #92400E; margin: 4px 0 0; }
.dir-chain { font-family: 'JetBrains Mono', monospace; font-size: 8.5px; color: """ + STEEL + r"""; margin-top: 8px; }
.mq-direction { font-size: 11px; font-weight: 600; color: """ + NAVY + r"""; margin: 8px 0 0; }
```
(`HAIRLINE`, `STEEL`, `NAVY`, `accent`, `accent_lo` bestaan al in dit bestand; geen `gap`, geen CSS-variabelen, geen `inset` (WeasyPrint-beperkingen, zie beslissing 2026-07-05).)

- [ ] **Stap 11: Run**

```bash
$PY -m pytest tests/test_direction_report_block.py tests/test_report_priority_render.py tests/test_report_priority_attribution.py tests/test_deepening_report_html.py tests/test_pdf_redesign.py tests/test_report_html_design.py -q
```
Verwacht: PASS (pre-existente fails conform baseline).

- [ ] **Stap 12: Commit**

```bash
git add backend/report_html.py backend/report_css.py tests/test_direction_report_block.py
git commit -m "feat(rapport): blok 'Wat er moet gebeuren' per startpunt/tweede punt + p.02-regel

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---
## Taak 9: Copy: sectie-intro verdieping + methodiekpagina

**Files:**
- Modify: `backend/report_html.py` (`SECTION_INTROS["verdieping"]` regel ~433-439; `_trust_page` regel ~1063-1140)
- Modify: `tests/test_direction_report_block.py` (twee tests erbij)

- [ ] **Stap 1: Failing tests toevoegen** (onderaan `tests/test_direction_report_block.py`)

```python
def test_verdieping_intro_no_longer_promises_direction_per_deepening():
    from backend.report_html import SECTION_INTROS
    intro = SECTION_INTROS["verdieping"]
    assert "gespreksrichting" not in intro.lower()
    assert "welke richting" not in intro.lower()
    assert "toelichting past het best" in intro


def test_trust_page_explains_direction_question_for_exit_and_retention_only():
    from backend.report_html import _trust_page
    for st in ("exit", "retention"):
        html = _trust_page(st)
        assert "Richtingvraag" in html
        assert "geen advies van Loep" in html
        assert "vanaf 3 antwoorden" in html
        assert "—" not in html
    assert "Richtingvraag" not in _trust_page("onboarding")
```

- [ ] **Stap 2: Run, verwacht 2 failures**

```bash
$PY -m pytest tests/test_direction_report_block.py -q -k "intro or trust"
```

- [ ] **Stap 3: `SECTION_INTROS["verdieping"]` vervangen**

```python
    "verdieping": (
        "Respondenten die laag scoorden op dit thema kregen automatisch een korte vervolgvraag: "
        "welke toelichting past het best bij hun ervaring? De aantallen hieronder zijn tellingen "
        "van wat respondenten zelf kozen, geen interpretatie achteraf. Zo zie je niet alleen "
        "d&aacute;t een thema laag scoort, maar ook wat de groep zelf als reden aandraagt. "
        "Wat er volgens hen moet gebeuren staat bij de gespreksagenda."
    ),
```

- [ ] **Stap 4: Methodiekpagina: vierde rij voor exit + retention**

In `_trust_page`, direct vóór `def _cells(...)`:

```python
    cells_r4: list[tuple[str, str]] = []
    if scan_type in ("exit", "retention"):
        cells_r4 = [
            ("Richtingvraag",
             "Elke respondent kreeg één vraag over het onderwerp dat bij henzelf het laagst "
             "scoorde: wat zou hier het meest helpen? De opdrachtvorm in 'Wat er moet gebeuren' "
             "geeft de keuze van die respondenten weer, geen advies van Loep. Dit blok toont al "
             "vanaf 3 antwoorden, lager dan de 5 die voor afdelingen geldt, omdat niemand in de "
             "organisatie kan zien wie een onderwerp als laagste had. Het risico bij kleine "
             "aantallen is dat het beeld toevallig is, niet dat het herleidbaar is; daarom staat "
             "er dan een beperkte-basis-regel bij."),
        ]
```
En in de return-f-string, na de `cells_r3`-tabel:

```python
  {f'<table class="tg" style="margin-top:10px;"><tr>{_cells(cells_r4, full=True)}</tr></table>' if cells_r4 else ''}
```

NB: het woord "risico" staat hier in de betekenis "statistisch risico" op de methodiekpagina, niet als duiding van een factor; de FORBIDDEN-guard in `test_direction_report_block.py` draait niet over `_trust_page`. Laat het zo.

- [ ] **Stap 5: Run**

```bash
$PY -m pytest tests/test_direction_report_block.py tests/test_report_html_design.py tests/test_pdf_redesign.py -q
```

- [ ] **Stap 6: Commit**

```bash
git add backend/report_html.py tests/test_direction_report_block.py
git commit -m "copy(rapport): verdieping-intro zonder richting; methodiekpagina legt richtingvraag en vloer 3 uit

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---

## Taak 10: Voorbeeldrapport-generator

**Files:**
- Modify: `generate_voorbeeldrapport.py` (import regel 29; `DIRECTION_WEIGHTS`/`DIRECTION_SKIP_RATE` regel ~299-310; `_build_deepening_entries` regel 321-370; response-dicts regel ~719 en ~800; `SurveyResponse(...)` regel ~1101)

- [ ] **Stap 1: Import**

Regel 29, vervang:
```python
from backend.products.shared.deepening import compute_deepening_offers
```
door:
```python
from backend.products.shared.deepening import (
    DIRECTION_VERSION, compute_deepening_offers, compute_direction_factor,
)
```

- [ ] **Stap 2: Gewichten vervangen**

Vervang het bestaande `DIRECTION_WEIGHTS`-dict + commentaar (regel ~295-309) door:

```python
# Richtingvraag (spec 2026-09-07): elke respondent één keer, op de eigen laagste
# factor, via compute_direction_factor (niets gefabriceerd). Gewichten incl. de
# niets-optie. Gekozen zodat de Behoud-sample 'clear' toont op het startpunt
# (growth) en 'divided' op het tweede punt (workload); voor exit alle routes
# geconcentreerd (startpunt 'clear'). none_needed/too_few zijn unit-getest.
DIRECTION_WEIGHTS: dict[str, dict[str, float]] = {
    "workload": {"wld_recovery": 0.30, "wld_priorities": 0.25, "wld_planning": 0.20,
                 "wld_none": 0.15, "wld_peaks": 0.10},
    "leadership": {"ldd_feedback": 0.65, "ldd_recognition": 0.15, "ldd_availability": 0.10, "ldd_none": 0.10},
    "growth": {"grd_visibility": 0.72, "grd_conversation": 0.12, "grd_none": 0.08, "grd_followthrough": 0.08},
    "culture": {"cud_crossteam": 0.60, "cud_involvement": 0.20, "cud_none": 0.20},
    "compensation": {"cpd_insight": 0.55, "cpd_path": 0.25, "cpd_none": 0.20},
    "role_clarity": {"rcd_priorities": 0.60, "rcd_alignment": 0.20, "rcd_none": 0.20},
}
DIRECTION_SKIP_RATE = 0.10
```

- [ ] **Stap 3: Geneste direction uit `_build_deepening_entries`, nieuwe builder erna**

In `_build_deepening_entries` verwijder het blok vanaf `# Gespreksrichting alleen bij beantwoorde retention-verdiepingen,` t/m de sluitende `}` van `entry["direction"] = {...}` in de else-tak (zodat de functie na `entry = {...}` direct `entries.append(entry)` doet). Voeg daarna deze functie toe:

```python
def _build_direction_response(org_raw: dict[str, int], scan_type: str) -> dict | None:
    """Eén richtingantwoord op de eigen laagste factor, via de echte keten."""
    factor_key = compute_direction_factor(org_raw)
    if factor_key is None:
        return None
    version = f"{scan_type}_{factor_key}_direction_{DIRECTION_VERSION[scan_type]}"
    if random.random() < DIRECTION_SKIP_RATE:
        return {"factor_key": factor_key, "question_set_version": version,
                "status": "skipped", "choice": None, "other_text": None}
    return {"factor_key": factor_key, "question_set_version": version,
            "status": "answered", "choice": _weighted_choice(DIRECTION_WEIGHTS[factor_key]),
            "other_text": None}
```

- [ ] **Stap 4: Response-dicts en persistentie**

Regel ~719 (exit) en ~800 (retention): voeg onder `"deepening_responses": _build_deepening_entries(org_raw, "exit"),` resp. `"retention"),` toe:
```python
        "direction_response": _build_direction_response(org_raw, "exit"),
```
resp. `"retention"`. Regel ~1101, onder `deepening_responses=response_payload.get("deepening_responses"),`:
```python
            direction_response=response_payload.get("direction_response"),
```

- [ ] **Stap 5: Genereren en staten controleren**

```bash
$PY generate_voorbeeldrapport.py retention
$PY generate_voorbeeldrapport.py exit
ls -t docs/examples | head -6          # Windows rendert HTML; de PDF's volgen in Taak 12 via Docker
RET_HTML=$(ls -t docs/examples/*retentie*.html | head -1)
EXIT_HTML=$(ls -t docs/examples/*loep*.html | head -1)
grep -o 'dir-card dir-[a-z_]*' "$RET_HTML"
grep -o 'dir-card dir-[a-z_]*' "$EXIT_HTML"
```
Verwacht retention: `dir-card dir-clear` gevolgd door `dir-card dir-divided`. Verwacht exit: eerste kaart `dir-clear`. Als de retention-tweede-kaart `clear` toont, verlaag `wld_recovery` naar 0.25 en verhoog `wld_none` naar 0.20; als de eerste kaart `divided` toont, verhoog `grd_visibility` naar 0.80 (ten koste van `grd_conversation`). Herhaal tot de staten kloppen; de generator is deterministisch geseed (controleer `random.seed(` bovenin het script), dus het resultaat is reproduceerbaar.

Controleer ook p.02:
```bash
grep -c "mq-direction" "$RET_HTML"
```
Verwacht: 1.

- [ ] **Stap 6: Commit** (HTML-samples in `docs/examples` en `frontend/public/examples` worden meegecommit zoals bij eerdere rondes; PDF's volgen in Taak 12)

```bash
git add generate_voorbeeldrapport.py docs/examples/*.html frontend/public/examples/*.html
git commit -m "chore(samples): richtingantwoorden geseed via compute_direction_factor; voorbeeldrapporten geregenereerd

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---
## Taak 11: Survey-template en -JS: één richtingstap, altijd

**Files:**
- Modify: `templates/survey/shared-deepening.html` (regel 23-48: richtingstap)
- Modify: `templates/survey.html` (JS: `updateDeepeningFromOrg` regel ~806-821; richtingsectie regel ~844-998; `restoreFromStorage` regel ~1084-1093; next-btn-handler regel ~1130-1141; payload regel ~1247-1265)
- Modify: `tests/test_deepening_template.py` (regel 35-49)

- [ ] **Stap 1: Failing template-tests** (vervang in `tests/test_deepening_template.py` de twee tests `test_direction_step_rendered_for_retention` en `test_direction_step_absent_for_exit` door)

```python
def test_direction_step_rendered_for_retention_and_exit(client, db_session: Session):
    for scan_type in ("retention", "exit"):
        html = _survey_page(client, db_session, scan_type)
        assert 'id="direction-step"' in html, scan_type
        assert "window.__DIRECTION_SETS = {" in html, scan_type
        assert "het onderwerp dat bij jou het laagst scoorde" in html, scan_type
        assert "geen toezegging" in html, scan_type
        # De oude per-verdieping-koppeling is weg.
        assert "Nog één korte vraag per onderwerp" not in html, scan_type
        assert "answeredDeepeningFactors" not in html, scan_type


def test_direction_question_text_per_scan_in_json(client, db_session: Session):
    ret = _survey_page(client, db_session, "retention")
    ex = _survey_page(client, db_session, "exit")
    assert "Wat zou hier volgens jou het meest helpen?" in ret
    assert "Niets, dit zit hier goed" in ret
    assert "Wat had hier volgens jou het meest geholpen?" in ex
    assert "Niets, dit zat hier goed" in ex


def test_direction_step_absent_for_onboarding(client, db_session: Session):
    html = _survey_page(client, db_session, "onboarding")
    assert 'id="direction-step"' not in html
    assert "window.__DIRECTION_SETS = {" not in html
```

Let op: `_survey_page` gebruikt een vaste `api_key` per scan_type; de eerste test roept hem twee keer aan met verschillende scan_types, dat is uniek genoeg. Als `onboarding` niet via `_create_campaign` te renderen is (andere template-vereisten), vervang de derde test door een aanroep met `scan_type="culture_assessment"`; het doel is alleen: een niet-exit/retention-scan zonder richtingstap.

- [ ] **Stap 2: Run, verwacht failures**

```bash
$PY -m pytest tests/test_deepening_template.py -q
```

- [ ] **Stap 3: Template: richtingstap buiten het `deepening_sets`-blok**

Vervang in `templates/survey/shared-deepening.html` alles vanaf regel 23 (`{% if direction_sets %}`) t/m het einde van het bestand door:

```jinja
{% endif %}
{% if direction_sets %}
{# Richtingstap (spec 2026-09-07 par. 3): altijd voor exit/retention, één vraag op de
   eigen laagste factor. Volgt op de verduidelijkingsstap als die er is; step_dir loopt
   in lockstep met dir_offset/step_d in survey.html. #}
{% set step_dir = (4 if scan_type == "exit" else 3) + (1 if deepening_sets else 0) %}
<div class="step" data-step="{{ step_dir }}" data-label="Wat zou helpen" id="direction-step">
  <div class="card">
    <div class="card-title">Stap {{ step_dir }} — {% if scan_type == "exit" %}Wat had geholpen?{% else %}Wat zou helpen?{% endif %}</div>
    <p style="color:var(--muted);font-size:13px;margin-bottom:8px;">
      Eén korte vraag over het onderwerp dat bij jou het laagst scoorde. Je antwoord wordt
      niet individueel teruggekoppeld; we tonen alleen groepsuitkomsten.
    </p>
    <p style="color:var(--muted);font-size:12px;margin-bottom:24px;">
      Dit helpt het gesprek te richten. Het is geen toezegging dat dit wordt uitgevoerd.
    </p>
    <div id="direction-blocks"></div>
  </div>
  <div class="nav-row">
    <button type="button" class="btn btn-secondary prev-btn">← Vorige</button>
    <button type="button" class="btn btn-primary next-btn">Volgende →</button>
  </div>
</div>
<script>
  window.__DIRECTION_SETS = {{ direction_sets | tojson }};
</script>
{% endif %}
```

Het bestand begint dus nog steeds met `{% if deepening_sets %}` (regel 1) en de verduidelijkingsstap; de eerste regel van het nieuwe blok (`{% endif %}`) sluit dat `if` af. Controleer dat er precies twee `{% endif %}` in het bestand staan.

- [ ] **Stap 4: JS: `updateDeepeningFromOrg` rendert ook de richtingstap**

Vervang de functie (regel ~806-821) door:

```js
  function updateDeepeningFromOrg () {
    if (deepStep) {
      const offers = computeDeepeningOffers();
      if (offers.length) {
        renderDeepeningBlocks(offers);
        deepStep.dataset.skipped = "0";
      } else {
        if (deepBlocks) deepBlocks.innerHTML = "";
        deepStep.dataset.skipped = "1";
      }
    }
    // Richtingstap volgt uit dezelfde org-antwoorden (eigen laagste factor).
    renderDirectionBlock();
  }
```

- [ ] **Stap 5: JS: richtingsectie vervangen**

Vervang alles vanaf `// ── Gespreksrichting-stap (alleen retention; volgt beantwoorde verdiepingen) ──` t/m de sluitende `}` van het `if (dirBlocks) { ... }`-listenerblok (vlak vóór `// ─────` en `// ── sessionStorage persistence`) door:

```js
  // ── Richtingstap: één vraag op de eigen laagste factor (spec 2026-09-07 par. 3) ──
  // Poort van compute_direction_factor (deepening.py): zelfde sleutel als de
  // verdieping, zonder triggerfilter. De server valideert opnieuw (422 bij mismatch).
  const dirStep   = document.getElementById("direction-step");
  const dirBlocks = document.getElementById("direction-blocks");

  function computeDirectionFactor () {
    const orgRaw = collectRadioGroup("org");
    const cands = [];
    DEEPENING_FACTOR_ORDER.forEach((fk, idx) => {
      const items = Object.entries(orgRaw)
        .filter(([k]) => k.startsWith(fk + "_")).map(([, v]) => v);
      if (!items.length) return;
      const avg = items.reduce((a, b) => a + b, 0) / items.length;
      const lowCount = items.filter(v => v <= 2).length;
      const minV = Math.min(...items);
      cands.push({ avg, lowCount, minV, idx, fk });
    });
    if (!cands.length) return null;
    cands.sort((a, b) => a.avg - b.avg || b.lowCount - a.lowCount || a.minV - b.minV || a.idx - b.idx);
    return cands[0].fk;
  }

  function currentDirectionBlock () {
    return dirBlocks ? dirBlocks.querySelector(".dpd-block") : null;
  }

  function renderDirectionBlock () {
    if (!dirStep || !dirBlocks || !window.__DIRECTION_SETS) return;
    const fk = computeDirectionFactor();
    const existing = currentDirectionBlock();
    // Factor ongewijzigd: antwoord blijft staan (terugnavigeren zonder scorewijziging).
    if (existing && existing.dataset.factor === fk) { dirStep.dataset.skipped = "0"; return; }
    dirBlocks.innerHTML = "";
    if (!fk || !window.__DIRECTION_SETS[fk]) { dirStep.dataset.skipped = "1"; return; }
    dirStep.dataset.skipped = "0";

    const set = window.__DIRECTION_SETS[fk];
    const block = document.createElement("div");
    block.className = "question-block dpd-block";
    block.dataset.factor = fk;

    const q = document.createElement("div");
    q.className = "question-text";
    q.textContent = set.question;
    block.appendChild(q);

    const body = document.createElement("div");
    body.className = "dp-body";
    const list = document.createElement("div");
    list.className = "checkbox-grid dpd-choice";
    set.options.forEach(opt => {
      list.appendChild(_dpOptionRow("dpd_choice", opt.key, opt.text, false));
    });
    body.appendChild(list);

    const other = document.createElement("div");
    other.className = "dp-other";
    other.style.display = "none";
    const otherInput = document.createElement("input");
    otherInput.type = "text";
    otherInput.name = "dpd_other";
    otherInput.maxLength = 200;
    otherInput.placeholder = "Licht kort toe…";
    const otherHelp = document.createElement("div");
    otherHelp.className = "helper-text";
    otherHelp.textContent = "Noem geen namen, functietitels, teams, locaties, medische informatie of herkenbare situaties.";
    other.appendChild(otherInput);
    other.appendChild(otherHelp);
    body.appendChild(other);
    block.appendChild(body);

    const skipBtn = document.createElement("button");
    skipBtn.type = "button";
    skipBtn.className = "dp-skip";
    skipBtn.textContent = "Deze vraag liever overslaan";
    block.appendChild(skipBtn);

    const skippedFlag = document.createElement("input");
    skippedFlag.type = "hidden";
    skippedFlag.name = "dpd_skipped";
    skippedFlag.value = "0";
    skippedFlag.dataset.persist = "1";
    block.appendChild(skippedFlag);

    // Factor waarvoor dit antwoord geldt; restore vergelijkt hiermee (spec par. 3.3).
    const factorFlag = document.createElement("input");
    factorFlag.type = "hidden";
    factorFlag.name = "dpd_factor";
    factorFlag.value = fk;
    factorFlag.dataset.persist = "1";
    block.appendChild(factorFlag);

    dirBlocks.appendChild(block);
    syncDirectionBlock(block);
  }

  function applyDirectionValue (name, val) {
    // Vrije tekst (other_text) kan quotes/backslashes bevatten; nooit in een
    // attribute-selector interpoleren — match waarden in JS.
    if (!dirBlocks) return;
    for (const inp of dirBlocks.querySelectorAll("input")) {
      if (inp.name !== name) continue;
      if (inp.type === "radio") {
        if (inp.value === val) { inp.checked = true; return; }
      } else {
        inp.value = val;
        return;
      }
    }
  }

  function syncDirectionBlock (block) {
    const sel = block.querySelector('input[name="dpd_choice"]:checked');
    const otherWrap = block.querySelector(".dp-other");
    if (otherWrap) otherWrap.style.display = sel && sel.value.endsWith("_other") ? "" : "none";
    const flag = block.querySelector('input[name="dpd_skipped"]');
    const skipped = flag && flag.value === "1";
    block.dataset.skipped = skipped ? "1" : "0";
    const body = block.querySelector(".dp-body");
    const skipBtn = block.querySelector(".dp-skip");
    if (body) body.style.display = skipped ? "none" : "";
    if (skipBtn) skipBtn.textContent = skipped ? "Toch beantwoorden" : "Deze vraag liever overslaan";
  }

  if (dirStep) dirStep.dataset.skipped = "1";   // tot de org-stap is ingevuld

  if (dirBlocks) {
    dirBlocks.addEventListener("change", (e) => {
      e.target.closest(".question-block")?.classList.remove("has-error");
      const block = e.target.closest(".dpd-block");
      if (block) syncDirectionBlock(block);
      saveToStorage();
    });
    dirBlocks.addEventListener("input", (e) => {
      e.target.closest(".question-block")?.classList.remove("has-error");
      saveToStorage();
    });
    dirBlocks.addEventListener("click", (e) => {
      const btn = e.target.closest(".dp-skip");
      if (!btn) return;
      const block = btn.closest(".dpd-block");
      const flag = block.querySelector('input[name="dpd_skipped"]');
      flag.value = flag.value === "1" ? "0" : "1";
      if (flag.value === "1") {
        // Overslaan wist de keuze (geen halve antwoorden bewaren).
        block.querySelectorAll('input[name="dpd_choice"]').forEach(i => { i.checked = false; });
        const otherInput = block.querySelector('input[name="dpd_other"]');
        if (otherInput) otherInput.value = "";
        block.classList.remove("has-error");
      }
      syncDirectionBlock(block);
      saveToStorage();
    });
  }
```

De bestaande `validateStep`-tak voor `.dpd-block` (regel ~600-608, `*_other` vereist tekst) blijft ongewijzigd werken: hij zoekt op `.dpd-choice input:checked` en `.dp-other input[type="text"]`.

- [ ] **Stap 6: JS: restore**

Vervang in `restoreFromStorage` de twee blokken `if (deepStep) { updateDeepeningFromOrg(); ... }` en `if (dirStep) { renderDirectionBlocks(); ... }` (regel ~1074-1093) door:

```js
    // Verduidelijking + richting: blokken opnieuw afleiden uit de org-antwoorden,
    // daarna de opgeslagen velden terugzetten.
    updateDeepeningFromOrg();
    if (deepStep) {
      Object.entries(data).forEach(([name, val]) => {
        if (name.indexOf("dp_") === 0 && !Array.isArray(val)) applyDeepeningValue(name, val);
      });
      deepBlocks?.querySelectorAll(".dp-block").forEach(syncDeepeningBlock);
    }
    if (dirStep) {
      // Alleen herstellen als het opgeslagen antwoord bij dezelfde factor hoort (spec par. 3.3).
      const block = currentDirectionBlock();
      if (block && data["dpd_factor"] === block.dataset.factor) {
        Object.entries(data).forEach(([name, val]) => {
          if (name.indexOf("dpd_") === 0 && name !== "dpd_factor" && !Array.isArray(val)) applyDirectionValue(name, val);
        });
        syncDirectionBlock(block);
      }
    }
```

- [ ] **Stap 7: JS: next-btn-handler**

Verwijder in de next-btn-handler (regel ~1130-1141) de regels:
```js
      // Verlaat de verduidelijkingsstap: bepaal welke richtingsvragen we tonen.
      if (active.id === "deepening-step") {
        renderDirectionBlocks();
      }
```
De aanroep `updateDeepeningFromOrg()` bij het verlaten van de org-stap blijft en rendert nu ook de richtingstap.

- [ ] **Stap 8: JS: payload**

Vervang in de submit-handler het blok vanaf `// Gespreksrichting koppelen aan de beantwoorde verdieping` t/m de sluitende `}` van `if (dirBlock && window.__DIRECTION_SETS && window.__DIRECTION_SETS[fk]) { ... }` (regel ~1245-1263) door niets (zodat na `const entry = {...};` direct `deepening_responses.push(entry);` volgt). Voeg direct ná `if (deepening_responses.length) payload.deepening_responses = deepening_responses;` toe:

```js
    // Richtingvraag: één object, op de eigen laagste factor (spec 2026-09-07 par. 4.1).
    const dirBlock = currentDirectionBlock();
    if (dirBlock && window.__DIRECTION_SETS) {
      const fk = dirBlock.dataset.factor;
      const set = window.__DIRECTION_SETS[fk];
      const flag = dirBlock.querySelector('input[name="dpd_skipped"]');
      const sel = dirBlock.querySelector(".dpd-choice input:checked");
      if (set) {
        if ((flag && flag.value === "1") || !sel) {
          // Expliciet overgeslagen, of doorgegaan zonder keuze -> overgeslagen.
          payload.direction_response = { factor_key: fk, question_set_version: set.question_set_version,
                                         status: "skipped", choice: null, other_text: null };
        } else {
          const otherRaw = dirBlock.querySelector('input[name="dpd_other"]')?.value.trim() || "";
          payload.direction_response = {
            factor_key: fk,
            question_set_version: set.question_set_version,
            status: "answered",
            choice: sel.value,
            other_text: sel.value.endsWith("_other") && otherRaw ? otherRaw.slice(0, 200) : null,
          };
        }
      }
    }
```

- [ ] **Stap 9: Controle op restanten**

```bash
grep -n "renderDirectionBlocks\|answeredDeepeningFactors\|dpd_\${fk}\|entry.direction" templates/survey.html
```
Verwacht: geen output.

- [ ] **Stap 10: Run**

```bash
$PY -m pytest tests/test_deepening_template.py tests/test_direction_submit.py -q
```
Verwacht: PASS.

- [ ] **Stap 11: Commit**

```bash
git add templates/survey/shared-deepening.html templates/survey.html tests/test_deepening_template.py
git commit -m "feat(survey): één richtingstap voor iedereen op de eigen laagste factor (exit + retention)

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---
## Taak 12: Browser-e2e, baseline-diff, PDF-regeneratie, afronding

**Files:** geen nieuwe code, tenzij de e2e een bug vindt (dan: fix + regressietest in het betreffende testbestand, eigen commit).

- [ ] **Stap 1: Volledige suite + byte-identieke baseline-diff**

```bash
$PY -m pytest tests -q -p no:cacheprovider 2>&1 | grep -E "^(FAILED|ERROR)" | sed 's/ - .*//' | sort > /tmp/after_fail.txt
diff /tmp/baseline_fail.txt /tmp/after_fail.txt && echo "0 nieuwe regressies"
$PY -m pytest tests -q -p no:cacheprovider 2>&1 | tail -1
```
Verwacht: `diff` leeg (exit 0) én `0 nieuwe regressies`. De tail-regel toont `N failed, M passed, 5 skipped` met N = het baseline-aantal. Als de diff regels toont die in Taak 2/3 bewust verwijderde testbestanden betreffen (`test_direction_report_html.py`, oude `test_direction_aggregation.py`), zijn dat verdwenen fails, geen nieuwe; alleen `>`-regels (nieuw in `after`) tellen als regressie.

- [ ] **Stap 2: Lokale backend starten (SQLite) voor de e2e**

Volg het patroon van de juli-e2e: lokale SQLite-DB, backend op poort 8010 via de `loep-backend`-entry in `C:\Users\larsh\Desktop\Business\.claude\launch.json` (of handmatig):

```bash
cd /c/Users/larsh/Desktop/Business/Verisight/.worktrees/richtingsvraag-altijd
DATABASE_URL="sqlite:///./e2e_direction.db" ../../.venv/Scripts/python.exe -m uvicorn backend.main:app --port 8010 --app-dir .
```
Maak vervolgens via de bestaande admin-API/seedroute (zoals in de juli-e2e) één retention-campagne + één exit-campagne met elk één respondent-token, en open `http://localhost:8010/survey/<token>` in de Claude-browserpreview.

- [ ] **Stap 3: E2e-scenario's doorlopen** (per scenario een screenshot van de richtingstap)

Retention-token:
1. **Nul-trigger-pad:** alle org-stellingen op 4, één stelling van groeiperspectief op 3 → na de org-stap direct de richtingstap (geen verduidelijkingsstap), vraag noemt "groeiperspectief", eerste optie "Niets, dit zit hier goed". Kies die, ga door, verstuur. DB-check: `direction_response.factor_key == "growth"`, `choice == "grd_none"`, `deepening_responses IS NULL`.
2. **Trigger-pad:** werkbelasting op 2/2/2 → verduidelijkingsstap (werkbelasting) → richtingstap over werkbelasting. Beantwoord beide. DB: `deepening_responses[0].factor_key == "workload"` én `direction_response.factor_key == "workload"`.
3. **Terugnavigeren met scorewijziging:** vanaf de richtingstap terug naar de org-stap, zet werkbelasting op 4/4/4 en groei op 2/2/2, door → richtingstap toont nu groeiperspectief, eerdere keuze weg.
4. **Terugnavigeren zonder wijziging:** kies een route, terug, direct weer door → keuze staat er nog.
5. **Refresh-restore:** kies een route, refresh de pagina → je landt op de richtingstap met de keuze intact.
6. **Anders-validatie:** kies "Anders, namelijk…" zonder tekst → "Volgende" blokkeert met foutmarkering; met tekst → door.
7. **Overslaan:** klik "Deze vraag liever overslaan" → body verdwijnt, knop wordt "Toch beantwoorden"; verstuur → DB `status == "skipped"`, `choice IS NULL`.
8. **Mobiel 375px:** richtingstap zonder horizontale overflow (`document.documentElement.scrollWidth === 375`).

Exit-token:
9. Vraag staat in de verleden tijd ("Wat had hier volgens jou het meest geholpen?"), eerste optie "Niets, dit zat hier goed"; verstuur → DB `question_set_version` eindigt op `_direction_v1`.

DB-check per scenario:
```bash
../../.venv/Scripts/python.exe - <<'EOF'
import sqlite3, json
con = sqlite3.connect("e2e_direction.db")
for row in con.execute("select id, deepening_responses, direction_response from survey_responses order by id desc limit 3"):
    print(row[0], row[1], row[2])
EOF
```

- [ ] **Stap 4: Rapport uit de e2e-data renderen (optioneel maar aanbevolen)**

Zet via de seedroute ≥8 retention-respondenten met werkbelasting als laagste en verschillende keuzes, download het rapport via de bestaande report-route en controleer visueel: blok "Wat er moet gebeuren" onder het raster, p.02-regel, en dat de keten-aantallen kloppen met de DB.

- [ ] **Stap 5: PDF's via WeasyPrint-Docker**

```bash
cd /c/Users/larsh/Desktop/Business/Verisight/.worktrees/richtingsvraag-altijd
RET_HTML=$(ls -t docs/examples/*retentie*.html | head -1)
EXIT_HTML=$(ls -t docs/examples/*loep*.html | head -1)
docker run --rm -v "$(pwd -W 2>/dev/null || pwd):/data" ghcr.io/weasyprint/weasyprint "/data/$RET_HTML" /data/docs/examples/voorbeeldrapport_retentiescan.pdf
docker run --rm -v "$(pwd -W 2>/dev/null || pwd):/data" ghcr.io/weasyprint/weasyprint "/data/$EXIT_HTML" /data/docs/examples/voorbeeldrapport_loep.pdf
cp docs/examples/voorbeeldrapport_retentiescan.pdf docs/examples/voorbeeldrapport_loep.pdf frontend/public/examples/
```
Verwacht: exit 0, lege stderr (0 warnings). Controleer daarna:

```bash
../../.venv/Scripts/python.exe - <<'EOF'
import fitz  # PyMuPDF
for name in ("docs/examples/voorbeeldrapport_retentiescan.pdf", "docs/examples/voorbeeldrapport_loep.pdf"):
    doc = fitz.open(name)
    text = "".join(p.get_text() for p in doc)
    print(name, len(doc), "pag.", "em-dash:", "\u2014" in text, "blok:", "Wat er moet gebeuren" in text)
EOF
```
Verwacht: `em-dash: False`, `blok: True` voor beide. Render de gespreksagenda-pagina en p.02 als afbeelding (`page.get_pixmap(dpi=110).save(...)`) en bekijk ze: twee kaarten naast elkaar, geen afgebroken kaart over een paginagrens, p.02-regel onder de bronregel.

- [ ] **Stap 6: Commit PDF's**

```bash
git add docs/examples/*.pdf frontend/public/examples/*.pdf
git commit -m "chore(samples): PDF-voorbeeldrapporten geregenereerd (WeasyPrint, 0 warnings)

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

- [ ] **Stap 7: Beslissingslog + afronding**

Voeg in `C:\Users\larsh\CLAUDE.md` onder de Beslissingslog (vóór "Openstaande acties bij Lars") een entry `[2026-09-xx]` toe met: wat is gebouwd (één zin per laag: survey, datamodel, aggregatie/staten, rapport), de verificatie (baseline-diff, e2e-scenario's, WeasyPrint 0 warnings), en de **drie handmatige acties voor Lars**: (1) migratie `migrations/2026_09_07_add_direction_response.sql` in Supabase draaien **vóór** de Railway-redeploy, (2) Railway-redeploy, (3) pre-pilot cognitieve pretest van de vraagtekst + niets-optie bij 2-3 HR-peers.

Daarna: `superpowers:finishing-a-development-branch` (merge naar lokale `main`, worktree opruimen). Niet pushen zonder akkoord van Lars.

---

## Zelfcontrole van dit plan (uitgevoerd bij het schrijven)

- **Spec-dekking:** par. 3 (survey) → Taak 11; par. 4 (datamodel/validatie) → Taak 6-7; par. 5 (logica) → Taak 1, 4, 5; par. 6 (rapport, p.02, methodiek, vervallen blokken) → Taak 2, 8, 9; par. 7 (samples) → Taak 10 + 12; par. 9 (tests) → verspreid, e2e in Taak 12; par. 10 (uitrol) → Taak 12 stap 7.
- **Bewuste afwijking van de spec:** de "scantype niet ondersteund"-422 voor `direction_response` (spec par. 4.3) is wél geïmplementeerd (Taak 7 stap 6) maar niet als API-test opgenomen, omdat een onboarding-campagne de payload al eerder in `product_module.validate_submission` kan afwijzen; de tak is defensief en gelijk aan de bestaande verdiepingstak.
- **Naamconsistentie:** `compute_direction_factor`, `DIRECTION_VERSION`, `get_direction_sets`, `direction_option_texts`, `direction_imperative`, `aggregate_direction`, `direction_state` (Taak 1/4/5) worden onder exact die namen geïmporteerd in Taak 7 (`main.py`), 8 (`report_html.py`) en 10 (generator). Rapporthelpers `_direction_chain`, `_direction_card`, `_wat_moet_gebeuren_block`, `_direction_p02_line`, constante `DIRECTION_BLOCK_EYEBROW` (Taak 8) komen overeen met de tests in Taak 8/9. Sleutels in `direction_state` (`state`, `n`, `top_key`, `top_n`, `second_n`, `ranked`) zijn gelijk in Taak 5 en 8. Agg-sleutels (`lowest_n`, `offered`, `answered`, `skipped`, `counts`) zijn gelijk in Taak 5, 8 en 10. JS-veldnamen `dpd_choice`/`dpd_other`/`dpd_skipped`/`dpd_factor` zijn consistent tussen render, sync, restore en payload (Taak 11).

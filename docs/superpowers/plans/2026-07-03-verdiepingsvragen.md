# Verdiepingsvragen bij lage factorscores — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Conditionele verdiepingsvragen (hoofdkeuze + optionele meespelende keuze) bij lage factorscores in Loep Vertrek en Loep Behoud, met noemer-transparante rapportage en gespreksagenda-verrijking.

**Architecture:** Alle contentsets en pure logica in `backend/products/shared/deepening.py` (zelfde patroon als `definitions.py`/`ORG_SECTIONS`). Trigger + cap draaien client-side (survey UX) én server-side (validatie — client is untrusted). Opslag als additieve JSON-kolom op `survey_responses`. Rapportage-aggregatie is een pure functie, gerenderd in `report_html.py`.

**Tech Stack:** FastAPI + SQLAlchemy + Jinja2 (survey), pytest. Geen frontend (Next.js) wijzigingen in v1 — het rapport is backend-PDF, dashboard buiten scope.

**Spec:** `docs/superpowers/specs/2026-07-03-verdiepingsvragen-design.md` (v3) — bij twijfel wint de spec.

**Belangrijke afwijking van de spec (bewust):** de spec zegt "direct aansluitend na de factorsectie". Alle zes factorsecties staan echter op één survey-stap (`templates/survey/shared-org.html`), en de cap-prioritering (laagste gemiddelde eerst) vereist dat álle factorscores bekend zijn. Daarom: de verdiepingen vormen één eigen stap **direct ná de organisatiefactoren-stap**, berekend bij het verlaten daarvan. Zelfde flow, robuuste cap.

---

## Task 0: Werkbranch

- [ ] **Step 1:** `git checkout -b feature/verdiepingsvragen` vanut `main`.

---

## Task 1: Contentmodule — optiesets, versies, gespreksvraag-templates

**Files:**
- Create: `backend/products/shared/deepening.py`
- Test: `backend/tests/test_deepening_content.py` (nieuwe file; volg de bestaande testlocatie — check `ls tests/` vs `backend/tests/`, het project gebruikt `tests/` in de repo-root: gebruik `tests/test_deepening_content.py`)

- [ ] **Step 1: Schrijf de failing content-guard test**

```python
# tests/test_deepening_content.py
import pytest
from backend.products.shared.deepening import (
    DEEPENING_SETS,
    DEEPENING_FACTOR_KEYS,
    get_deepening_sets,
    get_agenda_question,
)

SCAN_TYPES = ["exit", "retention"]
FORBIDDEN_RESPONDENT_WORDS = ["laag gescoord", "niet goed", "risico", "probleem", "oorzaak", "anoniem"]


def test_all_factors_have_sets_for_both_scans():
    for scan in SCAN_TYPES:
        sets = get_deepening_sets(scan)
        assert set(sets.keys()) == set(DEEPENING_FACTOR_KEYS)


def test_every_set_has_version_question_and_other():
    for scan in SCAN_TYPES:
        for fk, s in get_deepening_sets(scan).items():
            assert s["question_set_version"] == f"{scan}_{fk}_v1"
            assert s["question"].startswith("Welke omschrijving past het best")
            option_keys = [o["key"] for o in s["options"]]
            assert option_keys[-1].endswith("_other")
            assert 5 <= len(option_keys) - 1 <= 6  # 5-6 inhoudelijke opties + other
            assert len(option_keys) == len(set(option_keys))


def test_respondent_copy_has_no_forbidden_words():
    for scan in SCAN_TYPES:
        for s in get_deepening_sets(scan).values():
            blob = (s["question"] + " " + " ".join(o["text"] for o in s["options"])).lower()
            for word in FORBIDDEN_RESPONDENT_WORDS:
                assert word not in blob, f"verboden woord '{word}' in {s['question_set_version']}"


def test_agenda_question_exists_for_every_non_other_option():
    for scan in SCAN_TYPES:
        for fk, s in get_deepening_sets(scan).items():
            for o in s["options"]:
                if o["key"].endswith("_other"):
                    continue
                q = get_agenda_question(scan, fk, o["key"])
                assert isinstance(q, str) and q.endswith("?")


def test_exit_uses_past_tense_sample():
    exit_wl = get_deepening_sets("exit")["workload"]
    texts = " ".join(o["text"] for o in exit_wl["options"])
    assert "lag" in texts or "was" in texts or "maakten" in texts or "kostten" in texts
```

- [ ] **Step 2: Run test to verify it fails**

Run vanuit `Verisight/`: `.venv/Scripts/python.exe -m pytest tests/test_deepening_content.py -v`
Expected: FAIL met `ModuleNotFoundError: backend.products.shared.deepening`

- [ ] **Step 3: Implementeer de contentmodule**

Structuur (retentie-opties exact uit spec §4; exit = verleden tijd; gespreksvraag-templates per optie):

```python
# backend/products/shared/deepening.py
"""Verdiepingsvragen bij lage factorscores (spec: docs/superpowers/specs/2026-07-03-verdiepingsvragen-design.md).

Content + pure logica. Geen invloed op scoring.
"""
from __future__ import annotations

from typing import Any

DEEPENING_FACTOR_KEYS = [
    "leadership", "culture", "growth", "compensation", "workload", "role_clarity",
]

DEEPENING_CAP = {"exit": 3, "retention": 2}

# Vaste volgorde per set: persoonlijke ervaring -> samenwerking/leiding -> structuur/context -> other.
# text: {scan_type: formulering}; agenda: gespreksvraag-template voor "Wat nu?".
_SETS: dict[str, dict[str, Any]] = {
    "workload": {
        "question": {
            "retention": "Welke omschrijving past het best bij jouw ervaring met werkbelasting?",
            "exit": "Welke omschrijving past het best bij jouw ervaring met werkbelasting destijds?",
        },
        "options": [
            {"key": "wl_volume",
             "text": {"retention": "Binnen mijn rol ligt er structureel meer werk dan redelijk is",
                      "exit": "Binnen mijn rol lag er structureel meer werk dan redelijk was"},
             "agenda": "Past het takenpakket binnen deze rollen nog bij wat redelijk is?"},
            {"key": "wl_recovery",
             "text": {"retention": "Er is te weinig ruimte om te herstellen of werk goed af te ronden",
                      "exit": "Er was te weinig ruimte om te herstellen of werk goed af te ronden"},
             "agenda": "Hoe bewaken we herstel en afronding na piekperioden?"},
            {"key": "wl_priorities",
             "text": {"retention": "Onduidelijke prioriteiten maken het zwaarder dan nodig",
                      "exit": "Onduidelijke prioriteiten maakten het zwaarder dan nodig"},
             "agenda": "Hoe maken we prioriteiten explicieter zodat werkdruk niet onnodig oploopt?"},
            {"key": "wl_capacity",
             "text": {"retention": "De bezetting of planning sluit niet aan op het werk dat gedaan moet worden",
                      "exit": "De bezetting of planning sloot niet aan op het werk dat gedaan moest worden"},
             "agenda": "Sluiten bezetting en planning aan op het werkaanbod in de betrokken teams?"},
            {"key": "wl_peaks_adhoc",
             "text": {"retention": "Piekmomenten, spoedwerk of druk vanuit klanten/productie maken het zwaar",
                      "exit": "Piekmomenten, spoedwerk of druk vanuit klanten/productie maakten het zwaar"},
             "agenda": "Hoe vangen we piek- en spoeddruk op zonder dat die structureel wordt?"},
            {"key": "wl_process",
             "text": {"retention": "Processen, systemen of overdrachten kosten onnodig veel energie",
                      "exit": "Processen, systemen of overdrachten kostten onnodig veel energie"},
             "agenda": "Welke processen of systemen kosten nu de meeste onnodige energie?"},
            {"key": "wl_other", "text": {"retention": "Anders, namelijk…", "exit": "Anders, namelijk…"}, "agenda": None},
        ],
    },
    # ... zelfde structuur voor leadership, culture, growth, compensation, role_clarity
    # met exact de opties en formuleringen uit spec §4.2 t/m §4.6 (retention) + verleden-tijdsvariant (exit).
}


def get_deepening_sets(scan_type: str) -> dict[str, dict[str, Any]]:
    """Per factor: question, options (scan-specifieke tekst), question_set_version."""
    out: dict[str, dict[str, Any]] = {}
    for fk, raw in _SETS.items():
        out[fk] = {
            "question_set_version": f"{scan_type}_{fk}_v1",
            "question": raw["question"][scan_type],
            "options": [
                {"key": o["key"], "text": o["text"][scan_type]}
                for o in raw["options"]
            ],
        }
    return out


def get_agenda_question(scan_type: str, factor_key: str, option_key: str) -> str | None:
    for o in _SETS[factor_key]["options"]:
        if o["key"] == option_key:
            return o["agenda"]
    return None
```

De subagent schrijft alle zes sets volledig uit conform spec §4 (de tabellen zijn de bron; exit-formulering = zelfde zin in verleden tijd). Let op: `leadership` bevat `ld_recognition`, `culture` bevat `cu_behavior`, `growth` bevat `gr_follow_through`, `compensation` bevat `cp_flexibility` — de v3-sets, niet oudere varianten.

- [ ] **Step 4: Run test to verify it passes**

`.venv/Scripts/python.exe -m pytest tests/test_deepening_content.py -v` → PASS

- [ ] **Step 5: Commit**

```bash
git add backend/products/shared/deepening.py tests/test_deepening_content.py
git commit -m "feat: verdiepingsvragen contentsets (exit+retention) met versies en agenda-templates"
```

---

## Task 2: Pure triggerlogica + cap-prioritering

**Files:**
- Modify: `backend/products/shared/deepening.py`
- Test: `tests/test_deepening_trigger.py`

- [ ] **Step 1: Failing tests**

```python
# tests/test_deepening_trigger.py
from backend.products.shared.deepening import compute_deepening_offers

def _org(fk, a, b, c):
    return {f"{fk}_1": a, f"{fk}_2": b, f"{fk}_3": c}

def test_avg_below_threshold_triggers():
    org = _org("workload", 2, 2, 3)  # avg 2.33
    assert "workload" in compute_deepening_offers(org, "retention")

def test_exactly_2_5_triggers():
    org = _org("workload", 2, 3, 2)  # avg 2.33 -> use 2,2,3.5? ints only: 2,3,2=2.33; use 3,2,2 no. 2.5 exact: 2,3,2? -> 2.33
    org = _org("workload", 2, 2, 3) | {}
    # exact 2.5 vereist som 7.5 — kan niet met ints over 3 items; test de grens via 2 items (ontbrekend derde)
    org2 = {"workload_1": 2, "workload_2": 3}  # avg 2.5
    assert "workload" in compute_deepening_offers(org2, "retention")

def test_single_item_1_with_avg_below_3_5_triggers():
    org = _org("workload", 1, 4, 4)  # avg 3.0, één item = 1
    assert "workload" in compute_deepening_offers(org, "retention")

def test_single_item_1_with_high_avg_does_not_trigger():
    org = _org("workload", 1, 5, 5)  # avg 3.67 — begrensd: geen trigger
    assert "workload" not in compute_deepening_offers(org, "retention")

def test_two_items_leq_2_triggers():
    org = _org("workload", 2, 2, 5)  # avg 3.0, twee items <= 2
    assert "workload" in compute_deepening_offers(org, "retention")

def test_missing_items_no_trigger():
    assert compute_deepening_offers({}, "retention") == []

def test_cap_retention_2_exit_3():
    org = {**_org("workload", 1, 1, 1), **_org("growth", 2, 2, 2),
           **_org("culture", 2, 2, 3), **_org("leadership", 1, 2, 2)}
    assert len(compute_deepening_offers(org, "retention")) == 2
    assert len(compute_deepening_offers(org, "exit")) == 3

def test_cap_priority_lowest_avg_then_most_low_items_then_lowest_min():
    org = {**_org("workload", 2, 2, 2),   # avg 2.0, 3 items <=2, min 2
           **_org("growth", 1, 2, 3),      # avg 2.0, 2 items <=2, min 1
           **_org("culture", 1, 1, 4)}     # avg 2.0, 2 items <=2, min 1
    offers = compute_deepening_offers(org, "retention")
    # laagste avg gelijk (2.0) -> meeste items <=2 wint: workload eerst
    assert offers[0] == "workload"
    assert len(offers) == 2
```

- [ ] **Step 2:** Run → FAIL (`compute_deepening_offers` bestaat niet).

- [ ] **Step 3: Implementeer**

```python
# toevoegen aan backend/products/shared/deepening.py
def _factor_items(org_raw: dict[str, int], factor_key: str) -> list[int]:
    return [v for k, v in org_raw.items()
            if k.startswith(f"{factor_key}_") and isinstance(v, int)]


def _is_triggered(items: list[int]) -> bool:
    if not items:
        return False
    avg = sum(items) / len(items)
    if avg <= 2.5:
        return True
    if min(items) == 1 and avg <= 3.5:
        return True
    if sum(1 for v in items if v <= 2) >= 2:
        return True
    return False


def compute_deepening_offers(org_raw: dict[str, int], scan_type: str) -> list[str]:
    """Getriggerde factoren, geprioriteerd en afgekapt op de scan-cap.

    Prioritering: (1) laagste gemiddelde, (2) meeste items <= 2, (3) laagste minimumscore.
    Deterministisch: bij volledige gelijkheid wint de DEEPENING_FACTOR_KEYS-volgorde.
    """
    triggered: list[tuple[float, int, int, int, str]] = []
    for idx, fk in enumerate(DEEPENING_FACTOR_KEYS):
        items = _factor_items(org_raw, fk)
        if _is_triggered(items):
            avg = sum(items) / len(items)
            low_count = sum(1 for v in items if v <= 2)
            triggered.append((avg, -low_count, min(items), idx, fk))
    triggered.sort()
    cap = DEEPENING_CAP.get(scan_type, 2)
    return [t[4] for t in triggered[:cap]]
```

- [ ] **Step 4:** Run → PASS. Draai ook de volledige backend-suite (`.venv/Scripts/python.exe -m pytest tests/ -x -q`) — baseline is ~25 failed (pré-existerend); er mogen géén nieuwe fails bijkomen.

- [ ] **Step 5: Commit** — `feat: triggerlogica + cap-prioritering verdiepingsvragen`

---

## Task 3: Schema + model + migratie

**Files:**
- Modify: `backend/schemas.py` (SurveySubmit), `backend/models.py` (SurveyResponse)
- Create: `migrations/2026_07_03_add_deepening_responses.sql`
- Test: `tests/test_deepening_schema.py`

- [ ] **Step 1: Failing tests**

```python
# tests/test_deepening_schema.py
import pytest
from pydantic import ValidationError
from backend.schemas import DeepeningEntry, SurveySubmit

def test_valid_answered_entry():
    e = DeepeningEntry(factor_key="workload", question_set_version="retention_workload_v1",
                       status="answered", primary="wl_recovery", secondary="wl_peaks_adhoc")
    assert e.other_text is None

def test_skipped_entry_needs_no_choices():
    e = DeepeningEntry(factor_key="growth", question_set_version="retention_growth_v1",
                       status="skipped")
    assert e.primary is None

def test_answered_requires_primary():
    with pytest.raises(ValidationError):
        DeepeningEntry(factor_key="workload", question_set_version="retention_workload_v1",
                       status="answered", primary=None)

def test_secondary_must_differ_from_primary():
    with pytest.raises(ValidationError):
        DeepeningEntry(factor_key="workload", question_set_version="retention_workload_v1",
                       status="answered", primary="wl_volume", secondary="wl_volume")

def test_other_text_max_200():
    with pytest.raises(ValidationError):
        DeepeningEntry(factor_key="workload", question_set_version="retention_workload_v1",
                       status="answered", primary="wl_other", other_text="x" * 201)

def test_other_text_only_with_other_option():
    with pytest.raises(ValidationError):
        DeepeningEntry(factor_key="workload", question_set_version="retention_workload_v1",
                       status="answered", primary="wl_volume", other_text="tekst zonder other")

def test_survey_submit_accepts_deepening_list():
    s = SurveySubmit(token="t", deepening_responses=[
        {"factor_key": "workload", "question_set_version": "retention_workload_v1",
         "status": "answered", "primary": "wl_recovery"}])
    assert len(s.deepening_responses) == 1

def test_survey_submit_defaults_empty():
    assert SurveySubmit(token="t").deepening_responses == []
```

- [ ] **Step 2:** Run → FAIL.

- [ ] **Step 3: Implementeer schema**

```python
# backend/schemas.py — nieuw model boven SurveySubmit
class DeepeningEntry(BaseModel):
    factor_key: str
    question_set_version: str
    status: Literal["answered", "skipped"]
    primary: Optional[str] = None
    secondary: Optional[str] = None
    other_text: Optional[str] = Field(None, max_length=200)

    @model_validator(mode="after")
    def _validate_choices(self) -> "DeepeningEntry":
        if self.status == "answered" and not self.primary:
            raise ValueError("answered vereist een hoofdkeuze")
        if self.status == "skipped" and (self.primary or self.secondary or self.other_text):
            raise ValueError("skipped mag geen keuzes bevatten")
        if self.secondary and self.secondary == self.primary:
            raise ValueError("meespelende keuze moet verschillen van hoofdkeuze")
        if self.other_text:
            keys = {self.primary, self.secondary}
            if not any(k and k.endswith("_other") for k in keys):
                raise ValueError("other_text alleen bij een *_other keuze")
        return self

# in SurveySubmit toevoegen:
    deepening_responses: list[DeepeningEntry] = Field(default_factory=list)
```

(Imports: `Literal` uit `typing`, `model_validator` uit `pydantic` — check bestaande imports.)

- [ ] **Step 4: Model + migratie**

```python
# backend/models.py — SurveyResponse, na open_text_analysis:
    # Verdiepingsvragen (spec 2026-07-03): [{factor_key, question_set_version, status, primary, secondary, other_text}]
    deepening_responses: Mapped[list | None] = mapped_column(JSON, nullable=True)
```

```sql
-- migrations/2026_07_03_add_deepening_responses.sql
-- Additief en idempotent. Uitvoeren in Supabase Dashboard -> SQL Editor.
ALTER TABLE public.survey_responses
  ADD COLUMN IF NOT EXISTS deepening_responses jsonb;
```

- [ ] **Step 5:** Run schema-tests → PASS. Volledige suite: geen nieuwe fails.

- [ ] **Step 6: Commit** — `feat: DeepeningEntry schema + deepening_responses kolom en migratie`

---

## Task 4: Server-side validatie + persist in submit-endpoint

**Files:**
- Modify: `backend/main.py` (functie `submit_survey`, regel ~1296)
- Test: `tests/test_deepening_submit.py`

- [ ] **Step 1: Failing tests** — gebruik het bestaande test-setup-patroon voor submit-tests (zoek in `tests/` naar bestaande `submit_survey`/client-fixtures en volg dat patroon; er bestaan al survey-submit tests). Testgevallen:

```python
# tests/test_deepening_submit.py — pseudo, volg bestaand fixture-patroon
def test_valid_deepening_persisted(client, retention_respondent):
    payload = _base_retention_payload(retention_respondent.token)
    payload["org_raw"] = {**payload["org_raw"],
                          "workload_1": 2, "workload_2": 2, "workload_3": 2}
    payload["deepening_responses"] = [{
        "factor_key": "workload", "question_set_version": "retention_workload_v1",
        "status": "answered", "primary": "wl_recovery", "secondary": None, "other_text": None}]
    resp = client.post("/survey/submit", json=payload)
    assert resp.status_code == 200
    row = _get_response_row(retention_respondent)
    assert row.deepening_responses[0]["primary"] == "wl_recovery"

def test_entry_for_unoffered_factor_rejected(client, retention_respondent):
    # growth scoort hoog -> geen trigger -> entry ongeldig
    payload = _base_retention_payload(retention_respondent.token)  # alle factoren 4-5
    payload["deepening_responses"] = [{
        "factor_key": "growth", "question_set_version": "retention_growth_v1",
        "status": "answered", "primary": "gr_time"}]
    resp = client.post("/survey/submit", json=payload)
    assert resp.status_code == 422

def test_unknown_option_key_rejected(client, retention_respondent):
    payload = _low_workload_payload(retention_respondent.token)
    payload["deepening_responses"][0]["primary"] = "wl_bestaat_niet"
    assert client.post("/survey/submit", json=payload).status_code == 422

def test_other_text_is_anonymized(client, retention_respondent):
    payload = _low_workload_payload(retention_respondent.token)
    payload["deepening_responses"][0].update(primary="wl_other", other_text="Jan de teamleider doet niks")
    resp = client.post("/survey/submit", json=payload)
    assert resp.status_code == 200
    row = _get_response_row(retention_respondent)
    assert "Jan" not in (row.deepening_responses[0]["other_text"] or "")
```

- [ ] **Step 2:** Run → FAIL.

- [ ] **Step 3: Implementeer validatie in `submit_survey`** — ná `product_module.validate_submission(payload)`:

```python
    # --- Verdiepingsvragen: server-side hervalidatie (client is untrusted) ---
    if payload.deepening_responses:
        offered = set(compute_deepening_offers(payload.org_raw, respondent.campaign.scan_type))
        sets = get_deepening_sets(respondent.campaign.scan_type)
        seen_factors: set[str] = set()
        for entry in payload.deepening_responses:
            if entry.factor_key not in offered:
                raise HTTPException(status_code=422, detail="Verdieping hoort niet bij deze inzending.")
            if entry.factor_key in seen_factors:
                raise HTTPException(status_code=422, detail="Dubbele verdieping voor dezelfde factor.")
            seen_factors.add(entry.factor_key)
            valid_keys = {o["key"] for o in sets[entry.factor_key]["options"]}
            for choice in (entry.primary, entry.secondary):
                if choice and choice not in valid_keys:
                    raise HTTPException(status_code=422, detail="Onbekende verdiepingsoptie.")
            if entry.question_set_version != sets[entry.factor_key]["question_set_version"]:
                raise HTTPException(status_code=422, detail="Verouderde vragenset-versie.")

    deepening_clean: list[dict] = []
    for entry in (payload.deepening_responses or []):
        d = entry.model_dump()
        if d.get("other_text"):
            d["other_text"] = anonymize_text(d["other_text"])
        deepening_clean.append(d)
```

En in de `SurveyResponse(...)`-constructor: `deepening_responses = deepening_clean or None,`.
Import bovenin `main.py`: `from backend.products.shared.deepening import compute_deepening_offers, get_deepening_sets`.

- [ ] **Step 4:** Run → PASS; volledige suite geen nieuwe fails.

- [ ] **Step 5: Commit** — `feat: verdiepingsvragen server-side validatie + persist in survey submit`

---

## Task 5: Survey-UI — verdiepingsstap

**Files:**
- Create: `templates/survey/shared-deepening.html`
- Modify: `templates/survey.html` (include + JS), `backend/main.py` (survey GET-context, regel ~1279)

Geen unit-test mogelijk op Jinja/JS; verificatie handmatig in Step 5 + de submit-tests van Task 4 dekken het contract.

- [ ] **Step 1: Context meesturen in de survey GET** (`templates.TemplateResponse` rond regel 1281):

```python
    from backend.products.shared.deepening import get_deepening_sets, DEEPENING_CAP
    ...
    context={
        ...
        "deepening_sets": get_deepening_sets(campaign.scan_type),
        "deepening_cap": DEEPENING_CAP.get(campaign.scan_type, 2),
    },
```

Alleen meesturen voor `scan_type in ("exit", "retention")`; anders `deepening_sets: {}` (dan rendert de stap niet).

- [ ] **Step 2: Template** — nieuwe stap direct ná `{% include "survey/shared-org.html" %}`:

```html
{# templates/survey/shared-deepening.html #}
{% if deepening_sets %}
{% set step_dp = 4 if scan_type == "exit" else 3 %}
<div class="step" data-step="{{ step_dp }}" data-label="Verduidelijking" id="deepening-step" style="display:none">
  <div class="card">
    <div class="card-title">Korte verduidelijking</div>
    <p style="color:var(--muted);font-size:13px;margin-bottom:24px;">
      Soms stellen we een korte verduidelijkingsvraag bij enkele onderwerpen. Je antwoord wordt
      niet individueel teruggekoppeld; we tonen alleen groepsuitkomsten bij voldoende antwoorden.
    </p>
    <div id="deepening-blocks"></div>
  </div>
  <div class="nav-row">
    <button type="button" class="btn btn-secondary prev-btn">← Vorige</button>
    <button type="button" class="btn btn-primary next-btn">Volgende →</button>
  </div>
</div>
<script>
  window.__DEEPENING_SETS = {{ deepening_sets | tojson }};
  window.__DEEPENING_CAP = {{ deepening_cap }};
</script>
{% endif %}
```

**Let op stap-nummering:** de bestaande stap-D (`survey.html` regel ~417) en `shared-open-text.html` gebruiken hard berekende stapnummers. De step-navigatie in survey.html werkt echter op DOM-volgorde (`querySelectorAll(".step")`), niet op `data-step`. Controleer dit; als labels/progress `data-step` gebruiken, hernummer de latere stappen met een extra offset wanneer `deepening_sets` niet leeg is (`{% set dp_offset = 1 if deepening_sets else 0 %}`).

- [ ] **Step 3: JS-logica in `survey.html`** — poort van de Python-triggerlogica (moet 1-op-1 gelijk zijn; de servervalidatie van Task 4 vangt drift af):

```javascript
// --- Verdieping: trigger + rendering -------------------------------------
const FACTOR_ORDER = ["leadership","culture","growth","compensation","workload","role_clarity"];

function computeDeepeningOffers() {
  if (!window.__DEEPENING_SETS) return [];
  const orgRaw = collectRadioGroup("org");  // hergebruik: maak collectRadioGroup top-level
  const triggered = [];
  FACTOR_ORDER.forEach((fk, idx) => {
    const items = Object.entries(orgRaw)
      .filter(([k]) => k.startsWith(fk + "_")).map(([, v]) => v);
    if (!items.length) return;
    const avg = items.reduce((a, b) => a + b, 0) / items.length;
    const lowCount = items.filter(v => v <= 2).length;
    const trig = avg <= 2.5 || (Math.min(...items) === 1 && avg <= 3.5) || lowCount >= 2;
    if (trig) triggered.push({ avg, lowCount, min: Math.min(...items), idx, fk });
  });
  triggered.sort((a, b) => a.avg - b.avg || b.lowCount - a.lowCount || a.min - b.min || a.idx - b.idx);
  return triggered.slice(0, window.__DEEPENING_CAP).map(t => t.fk);
}

function renderDeepeningBlocks(offers) {
  const container = document.getElementById("deepening-blocks");
  container.innerHTML = "";
  offers.forEach(fk => {
    const set = window.__DEEPENING_SETS[fk];
    // per factor: vraag, radio-groep primary, daarna "Speelt er daarnaast nog iets mee?"
    // radio-groep secondary (default "Nee, dit was het"), other-tekstveld (maxlength 200,
    // microcopy "Noem liever geen namen, functietitels, teams of herkenbare situaties."),
    // en een "Deze vraag liever overslaan"-link die het blok markeert als skipped.
    container.insertAdjacentHTML("beforeend", buildDeepeningBlockHtml(fk, set));
  });
  container.querySelectorAll("input[data-dp-primary]").forEach(r =>
    r.addEventListener("change", syncSecondaryOptions));  // secondary != primary afdwingen
}
```

Gedrag bij het verlaten van de org-stap ("Volgende"): `const offers = computeDeepeningOffers()`; bij lege lijst wordt `#deepening-step` overgeslagen (display:none + uit de stap-navigatie), anders gerenderd en getoond. Bij teruggaan en scores wijzigen: opnieuw berekenen; reeds ingevulde blokken voor nog steeds aangeboden factoren behouden.

Payload-uitbreiding in de submit-handler:

```javascript
    const deepening_responses = collectDeepeningResponses();
    // per gerenderd blok: {factor_key, question_set_version, status: "answered"|"skipped",
    //  primary, secondary (null bij "Nee, dit was het"), other_text (alleen bij *_other)}
    const payload = { ...bestaande velden..., deepening_responses };
```

localStorage: de bestaande `saveToStorage`/`restoreFromStorage` werkt op form-velden — verdiepingsblokken zijn dynamisch; sla per blok de state op onder een eigen key binnen hetzelfde storage-object en herstel na rendering. Bestaand gedrag (wissen na submit via `clearStorage()`) blijft; controleer dat `clearStorage` ook de verdiepingsdata wist.

- [ ] **Step 4: Styling** — hergebruik bestaande `.question-block`/`.likert-*`-stijlen waar mogelijk; opties als verticale radio-lijst (geen likert). Geen rood/waarschuwingstaal. Secondary op hetzelfde scherm onder de hoofdvraag.

- [ ] **Step 5: Handmatige verificatie** — start de backend lokaal, maak een test-token (bestaand seed/dev-mechanisme), doorloop de survey:
  1. Alle factoren hoog → geen verdiepingsstap.
  2. Werkbelasting 2-2-2 + groei 1-2-3 + cultuur 2-2-3 (retention) → precies 2 blokken, workload eerst.
  3. Overslaan-link → submit bevat `status: "skipped"`.
  4. Other + tekst → maxlength 200 afgedwongen.
  5. Mobiel viewport (375px): langste set (werkbelasting) bruikbaar zonder scrollen binnen de vraag; anders opties inkorten (spec §3.7).
  6. Refresh halverwege → concept hersteld incl. verdieping.

- [ ] **Step 6: Commit** — `feat: verdiepingsstap in survey (trigger, cap, hoofd+meespelend, overslaan, persistence)`

---

## Task 6: Rapport-aggregatie (pure functie)

**Files:**
- Modify: `backend/products/shared/deepening.py`
- Test: `tests/test_deepening_report.py`

- [ ] **Step 1: Failing tests**

```python
# tests/test_deepening_report.py
from backend.products.shared.deepening import aggregate_deepening, agenda_enrichment

def _resp(status="answered", primary="wl_recovery", secondary=None):
    return {"factor_key": "workload", "question_set_version": "retention_workload_v1",
            "status": status, "primary": primary, "secondary": secondary, "other_text": None}

def test_full_chain_counts():
    rows = [  # (org_raw, deepening_responses) per respondent
        ({"workload_1": 2, "workload_2": 2, "workload_3": 2}, [_resp()]),
        ({"workload_1": 2, "workload_2": 2, "workload_3": 2}, [_resp(status="skipped", primary=None)]),
        ({"workload_1": 1, "workload_2": 2, "workload_3": 2}, []),   # getriggerd, cap-verdrongen/geen entry
        ({"workload_1": 5, "workload_2": 5, "workload_3": 5}, []),   # niet getriggerd
    ]
    agg = aggregate_deepening(rows, "retention")["workload"]
    assert agg["triggered"] == 3
    assert agg["offered"] == 2      # entries aanwezig (answered + skipped)
    assert agg["answered"] == 1
    assert agg["skipped"] == 1
    assert agg["primary_counts"] == {"wl_recovery": 1}

def test_secondary_counted_separately():
    rows = [({"workload_1": 2, "workload_2": 2, "workload_3": 2},
             [_resp(secondary="wl_peaks_adhoc")])] * 6
    agg = aggregate_deepening(rows, "retention")["workload"]
    assert agg["secondary_counts"] == {"wl_peaks_adhoc": 6}
    assert "wl_peaks_adhoc" not in agg["primary_counts"] or agg["primary_counts"].get("wl_peaks_adhoc", 0) == 0

def _agg(primary_counts, answered=None):
    n = answered if answered is not None else sum(primary_counts.values())
    return {"triggered": n, "offered": n, "answered": n, "skipped": 0,
            "primary_counts": primary_counts, "secondary_counts": {}}

def test_enrichment_all_conditions_met():
    agg = _agg({"wl_recovery": 6, "wl_volume": 2})  # n=8, top 75%, >=4, voorsprong 4
    e = agenda_enrichment(agg, "retention", "workload")
    assert e is not None and "herstel" in e["agenda_question"].lower()

def test_enrichment_blocked_below_n8():
    assert agenda_enrichment(_agg({"wl_recovery": 5, "wl_volume": 2}), "retention", "workload") is None  # n=7

def test_enrichment_blocked_without_lead_of_2():
    assert agenda_enrichment(_agg({"wl_recovery": 4, "wl_volume": 3, "wl_process": 1}), "retention", "workload") is None

def test_enrichment_blocked_below_50pct():
    assert agenda_enrichment(_agg({"wl_recovery": 4, "wl_volume": 2, "wl_process": 3}), "retention", "workload") is None  # 4/9

def test_enrichment_blocked_when_other_is_top():
    assert agenda_enrichment(_agg({"wl_other": 6, "wl_volume": 2}), "retention", "workload") is None
```

- [ ] **Step 2:** Run → FAIL.

- [ ] **Step 3: Implementeer**

```python
# toevoegen aan backend/products/shared/deepening.py
def aggregate_deepening(
    rows: list[tuple[dict[str, int], list[dict]]],
    scan_type: str,
) -> dict[str, dict[str, Any]]:
    """Per factor de volledige noemer-keten + verdeling.

    rows: per respondent (org_raw, deepening_responses).
    triggered = trigger vuurde (ongeacht cap); offered = entry aanwezig;
    answered/skipped = status; counts alleen over answered.
    """
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


def agenda_enrichment(agg: dict[str, Any], scan_type: str, factor_key: str) -> dict[str, Any] | None:
    """Spec 6.3: n>=8, top >=50%, top >=4, voorsprong >=2, top niet *_other."""
    n = agg["answered"]
    counts = agg["primary_counts"]
    if n < 8 or not counts:
        return None
    ranked = sorted(counts.items(), key=lambda kv: -kv[1])
    top_key, top_n = ranked[0]
    second_n = ranked[1][1] if len(ranked) > 1 else 0
    if top_key.endswith("_other"):
        return None  # optieset markeren voor review gebeurt in rapportlaag (log)
    if top_n < 4 or top_n / n < 0.5 or top_n - second_n < 2:
        return None
    return {
        "option_key": top_key,
        "count": top_n,
        "answered": n,
        "agenda_question": get_agenda_question(scan_type, factor_key, top_key),
    }
```

- [ ] **Step 4:** Run → PASS; volledige suite geen nieuwe fails.

- [ ] **Step 5: Commit** — `feat: rapport-aggregatie + agenda-verrijkingsregels verdiepingsvragen`

---

## Task 7: Rapportweergave — toelichtingsblok + agenda-verrijking

**Files:**
- Modify: `backend/report_html.py` (factoranalyse-sectie + "Wat nu?"-agenda), `backend/report.py` of de plek waar responsdata voor het rapport wordt verzameld (zoek de query die `SurveyResponse`-rijen ophaalt; geef `(org_raw, deepening_responses)` door aan `aggregate_deepening`)
- Test: `tests/test_deepening_report_html.py`

- [ ] **Step 1: Failing tests** (render-functies zijn string-in-string-uit; test op inhoud):

```python
# tests/test_deepening_report_html.py
from backend.report_html import _deepening_block

def test_block_hidden_below_5():
    html = _deepening_block(agg={"triggered": 8, "offered": 6, "answered": 4, "skipped": 2,
                                 "primary_counts": {"wl_recovery": 4}, "secondary_counts": {}},
                            scan_type="retention", factor_key="workload")
    assert "Te weinig verdiepingsantwoorden" in html
    assert "%" not in html

def test_block_counts_only_5_to_9():
    agg = {"triggered": 10, "offered": 9, "answered": 7, "skipped": 2,
           "primary_counts": {"wl_recovery": 4, "wl_volume": 3}, "secondary_counts": {}}
    html = _deepening_block(agg=agg, scan_type="retention", factor_key="workload")
    assert "Beperkte antwoordbasis" in html and "gesprekshaakje" in html
    assert "%" not in html
    assert "Welke toelichting respondenten kozen" in html

def test_block_percentages_from_10():
    agg = {"triggered": 14, "offered": 13, "answered": 12, "skipped": 1,
           "primary_counts": {"wl_recovery": 8, "wl_volume": 4}, "secondary_counts": {}}
    html = _deepening_block(agg=agg, scan_type="retention", factor_key="workload")
    assert "67%" in html and "(8)" in html

def test_chain_sentence_always_present():
    agg = {"triggered": 14, "offered": 13, "answered": 12, "skipped": 1,
           "primary_counts": {"wl_recovery": 8}, "secondary_counts": {}}
    html = _deepening_block(agg=agg, scan_type="retention", factor_key="workload")
    for fragment in ["14", "13", "12"]:
        assert fragment in html  # triggered/offered/answered zichtbaar

def test_no_forbidden_report_words():
    agg = {"triggered": 14, "offered": 13, "answered": 12, "skipped": 1,
           "primary_counts": {"wl_recovery": 8}, "secondary_counts": {}}
    html = _deepening_block(agg=agg, scan_type="retention", factor_key="workload").lower()
    assert "betrouwbaar" not in html and "aanwijzen" not in html and "aanwijzing" not in html
```

- [ ] **Step 2:** Run → FAIL.

- [ ] **Step 3: Implementeer `_deepening_block`** in `report_html.py`, in de Loep design-stijl (navy/amber, scherpe hoeken — hergebruik `_factor_bar_row`-achtige patronen):
  - Keten-zin altijd bovenaan: "Van de {triggered} respondenten met een verdieptrigger op {factorlabel} kregen {offered} de verdiepingsvraag; {answered} beantwoordden die." (Gebruik "laag signaal" alleen als het factorgemiddelde ≤ 2,5 is — geef dat als parameter mee of gebruik de neutrale "verdieptrigger"-formulering overal: eenvoudiger en altijd correct.)
  - Staffels exact per spec §6.2 (n<5 label; 5–9 aantallen + gesprekshaakje-kader; ≥10 percentages+aantallen).
  - Secondary: alleen bij ≥5 secondary-antwoorden, één compacte regel.
  - Optie-keys → teksten via `get_deepening_sets(scan_type)`.

- [ ] **Step 4: Integratie** — roep `aggregate_deepening` aan in de rapport-datastroom en render `_deepening_block` onder elke factor in de factoranalyse-sectie die als aandachtspunt wordt getoond (alleen exit/retention; bij factoren zonder triggers: geen blok). In het "Wat nu?"-/eerste-managementspoor-deel (`_eerste_managementspoor`, regel ~514): als `agenda_enrichment(...)` niet-None is voor een prioriteitsfactor, vervang de generieke gespreksregel door de keten-zin + `agenda_question` (spec §6.3-voorbeeldformat). Log een warning (`sentry_sdk` of logger) wanneer `*_other` topoptie is: "optieset review nodig".

- [ ] **Step 5:** Run alle deepening-tests + volledige suite (geen nieuwe fails). Genereer een proefrapport met `generate_voorbeeldrapport.py` als rooktest (het script seedt fictieve data — controleer of het `deepening_responses` meegeeft; zo niet, voeg fictieve verdiepingsdata toe aan het script zodat het blok zichtbaar is in het voorbeeld).

- [ ] **Step 6: Commit** — `feat: toelichtingsblok + agenda-verrijking in rapport`

---

## Task 8: Afronding

- [ ] **Step 1:** Volledige testsuite: `pytest tests/ -q` — vergelijk met baseline (~25 pré-existerende fails); 0 nieuwe.
- [ ] **Step 2:** Voorbeeldrapporten regenereren (exit + retentie) via WeasyPrint-Docker (`ghcr.io/weasyprint/weasyprint`, zie beslissingslog 2026-06-27) en visueel checken: toelichtingsblok, staffel-labels, agenda-verrijking.
- [ ] **Step 3:** Merge naar `main` (geen push zonder akkoord Lars). Herinner Lars aan de handmatige stap: `migrations/2026_07_03_add_deepening_responses.sql` uitvoeren in Supabase **vóór** de Railway-redeploy.
- [ ] **Step 4:** Beslissingslog in `CLAUDE.md` bijwerken.

---

## Buiten scope (bewaakt)

- Loep Start (v1.1 — eigen mini-spec eerst), dashboard-weergave, herhaalmeting-vergelijking, AI-analyse van other-teksten.
- Geen wijziging aan scoring, gewichten, bestaande vragen of frontend (Next.js).

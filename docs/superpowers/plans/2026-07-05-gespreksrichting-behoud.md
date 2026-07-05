# Gespreksrichting-vraag (Loep Behoud) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Na elke beantwoorde oorzaakverdieping in de Loep Behoud-survey een gespreksrichting-vraag stellen ("Welke richting zou het gesprek het meest helpen?"), die terugkomt in het rapport als "gespreksrichting uit de groep" met concordant/discrepant-scenario's — plus cap-verhoging retention 2→3.

**Spec:** `docs/superpowers/specs/2026-07-05-richtingsvraag-behoud-design.md` (v2). Bij twijfel wint de spec.

**Architecture:** Volgt de trede-1-verdieping exact: content + pure logica in `backend/products/shared/deepening.py`, Pydantic-validatie in `backend/schemas.py`, semantische servervalidatie in `backend/main.py` (submit-endpoint), survey-UI als extra stap in `templates/survey/shared-deepening.html` + client-side rendering in `templates/survey.html`, rapportweergave in `backend/report_html.py`. Opslag is additief in de bestaande JSONB-kolom `deepening_responses` (géén migratie).

**Spec→implementatie-mapping (belangrijk):** de spec zegt "eigen scherm direct ná de verdieping van dezelfde factor". De trede-1-implementatie bundelt alle verdiepingen in één survey-stap ("Korte verduidelijking") met een blok per factor. De richtingsvraag volgt datzelfde patroon: **één nieuwe stap "Gespreksrichting" direct ná de verduidelijkingsstap**, met een blok per beantwoorde factor. Dit is de vastgestelde vertaling van de spec naar de bestaande architectuur.

**Tech Stack:** Python 3 (FastAPI, Pydantic v2, pytest), Jinja2-template + vanilla JS (survey), WeasyPrint-HTML (rapport).

**Testcommando's:** backend: `.venv/Scripts/python.exe -m pytest tests/<file> -v` vanuit repo-root (Windows). Volledige suite-baseline: **25 failed** (pre-existent) — 0 nieuwe regressies is de eis.

**Werkwijze:** werk in een verse git worktree (superpowers:using-git-worktrees) — de repo-root heeft ongecommit parallel werk (analytics-workstream) dat NIET geraakt mag worden.

---

## Task 1: Content — routesets, cap 3, agenda-templates (mét reviewgate)

**Files:**
- Modify: `backend/products/shared/deepening.py`
- Test: `tests/test_direction_content.py` (nieuw)

- [ ] **Step 1: Schrijf de failing content-guard tests**

```python
# tests/test_direction_content.py
"""Content-guard voor gespreksrichting-sets (spec 2026-07-05 par. 4)."""
import re

import pytest

from backend.products.shared.deepening import (
    DEEPENING_CAP,
    DEEPENING_FACTOR_KEYS,
    DEEPENING_SETS,
    DIRECTION_SETS,
    get_direction_sets,
)

# Verboden in respondent- en rapportcopy (trede-1-lijst + spec-v2-aanvullingen).
FORBIDDEN = [
    "laag gescoord", "niet goed", "risico", "probleem", "oorzaak",
    "anoniem", "betrouwbaar", "verschilmaker", "aanbeveling", "actieplan",
    "management moet",
]


def test_cap_retention_is_3():
    assert DEEPENING_CAP == {"exit": 3, "retention": 3}


def test_direction_sets_complete():
    assert set(DIRECTION_SETS.keys()) == set(DEEPENING_FACTOR_KEYS)
    for fk, s in DIRECTION_SETS.items():
        keys = [o["key"] for o in s["options"]]
        assert len(keys) == 7, fk                      # 6 routes + other
        assert keys[-1].endswith("_other"), fk
        assert len(set(keys)) == 7, fk                 # geen dubbele keys
        assert s["question"], fk


def test_every_route_maps_to_existing_cause_keys():
    for fk, s in DIRECTION_SETS.items():
        cause_keys = {o["key"] for o in DEEPENING_SETS[fk]["options"]}
        for o in s["options"]:
            if o["key"].endswith("_other"):
                assert o["related"] == []
                continue
            assert o["related"], f"{fk}/{o['key']} mist verwantschaps-mapping"
            for rk in o["related"]:
                assert rk in cause_keys, f"{fk}/{o['key']} verwijst naar onbekende {rk}"


def test_every_route_has_toets_agenda_template():
    for fk, s in DIRECTION_SETS.items():
        for o in s["options"]:
            if o["key"].endswith("_other"):
                assert o["agenda"] is None
            else:
                assert o["agenda"].startswith("Wat moet management eerst toetsen"), \
                    f"{fk}/{o['key']}: template volgt het toets-patroon niet"


def test_no_forbidden_words_in_direction_copy():
    for fk, s in DIRECTION_SETS.items():
        blobs = [s["question"]] + [o["text"] for o in s["options"]] + \
                [o["agenda"] or "" for o in s["options"]]
        for blob in blobs:
            low = blob.lower()
            for word in FORBIDDEN:
                assert word not in low, f"{fk}: verboden woord {word!r} in {blob!r}"


def test_get_direction_sets_retention_only():
    sets = get_direction_sets("retention")
    assert set(sets.keys()) == set(DEEPENING_FACTOR_KEYS)
    for fk, s in sets.items():
        assert s["question_set_version"] == f"retention_{fk}_direction_v1"
        assert len(s["options"]) == 7
        assert all("text" in o and "key" in o for o in s["options"])
    assert get_direction_sets("exit") == {}          # exit: eigen ronde, geen sets


def test_get_direction_sets_unknown_scan_raises():
    with pytest.raises(ValueError):
        get_direction_sets("pulse")
```

- [ ] **Step 2: Run de tests — verwacht FAIL**

Run: `.venv/Scripts/python.exe -m pytest tests/test_direction_content.py -v`
Expected: FAIL met `ImportError: cannot import name 'DIRECTION_SETS'`

- [ ] **Step 3: Implementeer cap + DIRECTION_SETS + get_direction_sets in deepening.py**

Wijzig regel 14:

```python
# Cap op aantal verdiepingen per respondent; gebruikt door triggerlogica.
# Retention 2->3 per spec 2026-07-05 (gespreksrichting-ronde).
DEEPENING_CAP = {"exit": 3, "retention": 3}
```

Voeg ná het `DEEPENING_SETS`-blok (na regel 383) toe — dit is de volledige v1-content, exact conform spec §4 (route-teksten) en §7.2 (toets-templates). Elke route: `key`, `text` (retention-only in v1), `related` (verwante oorzaak-keys, alleen voor analyse), `agenda` (toets-template):

```python
# Gespreksrichting-sets (spec: docs/superpowers/specs/2026-07-05-richtingsvraag-behoud-design.md par. 4).
# GEEN 1-op-1-spiegeling van de oorzaakset: routes zijn managementrichtingen; `related`
# is een losse verwantschaps-mapping, uitsluitend voor concordantie-analyse.
DIRECTION_SETS: dict[str, dict[str, Any]] = {
    "workload": {
        "question": "Welke richting zou het gesprek over werkbelasting het meest helpen?",
        "options": [
            {"key": "wld_scope", "text": "Takenpakket en werkvolume beter afbakenen",
             "related": ["wl_volume"],
             "agenda": "Wat moet management eerst toetsen om te bepalen of het afbakenen van takenpakketten passend en haalbaar is?"},
            {"key": "wld_planning", "text": "Planning en bezetting beter laten aansluiten op het werk dat er ligt",
             "related": ["wl_capacity"],
             "agenda": "Wat moet management eerst toetsen om te bepalen of planning en bezetting beter kunnen aansluiten op het werkaanbod?"},
            {"key": "wld_peaks", "text": "Piekmomenten en spoedwerk eerder plannen, verdelen of begrenzen",
             "related": ["wl_peaks_adhoc"],
             "agenda": "Wat moet management eerst toetsen om piek- en spoeddruk eerder te kunnen plannen, verdelen of begrenzen?"},
            {"key": "wld_recovery", "text": "Meer ruimte om te herstellen en werk goed af te ronden",
             "related": ["wl_recovery"],
             "agenda": "Wat moet management eerst toetsen om te bepalen of meer herstel- en afrondingsruimte passend en haalbaar is?"},
            {"key": "wld_priorities", "text": "Duidelijkere keuzes over wat voorrang heeft en wat kan wachten",
             "related": ["wl_priorities"],
             "agenda": "Wat moet management eerst toetsen om prioriteiten explicieter te kunnen maken?"},
            {"key": "wld_friction", "text": "Minder dubbel werk, systeemfrictie of overdrachtsverlies",
             "related": ["wl_process"],
             "agenda": "Wat moet management eerst toetsen om te bepalen waar dubbel werk of systeemfrictie het meest knelt?"},
            {"key": "wld_other", "text": "Anders, namelijk…", "related": [], "agenda": None},
        ],
    },
    "leadership": {
        "question": "Welke richting zou het gesprek over de aansturing het meest helpen?",
        "options": [
            {"key": "ldd_feedback", "text": "Meer bruikbare feedback en richting",
             "related": ["ld_feedback"],
             "agenda": "Wat moet management eerst toetsen om te bepalen of medewerkers meer bruikbare feedback en richting kunnen krijgen?"},
            {"key": "ldd_mandate", "text": "Duidelijker mandaat om binnen mijn werk zelfstandig keuzes te maken",
             "related": ["ld_autonomy"],
             "agenda": "Wat moet management eerst toetsen om mandaten binnen het werk te verduidelijken?"},
            {"key": "ldd_escalation", "text": "Duidelijkere hulp bij escalaties, spanningen of vastlopende situaties",
             "related": ["ld_support"],
             "agenda": "Wat moet management eerst toetsen om hulp bij escalaties en spanningen te verduidelijken?"},
            {"key": "ldd_recognition", "text": "Concretere terugkoppeling op wat goed gaat en wat wordt gewaardeerd",
             "related": ["ld_recognition"],
             "agenda": "Wat moet management eerst toetsen om terugkoppeling op wat goed gaat concreter te maken?"},
            {"key": "ldd_availability", "text": "Meer beschikbaarheid en zichtbaarheid van mijn leidinggevende",
             "related": ["ld_availability"],
             "agenda": "Wat moet management eerst toetsen om te bepalen of de beschikbaarheid van leidinggevenden past bij de omvang van hun teams?"},
            {"key": "ldd_consistency", "text": "Stabielere en beter uitlegbare besluiten en verwachtingen",
             "related": ["ld_consistency"],
             "agenda": "Wat moet management eerst toetsen om besluiten en verwachtingen stabieler en beter uitlegbaar te maken?"},
            {"key": "ldd_other", "text": "Anders, namelijk…", "related": [], "agenda": None},
        ],
    },
    "culture": {
        "question": "Welke richting zou het gesprek over de samenwerking in het team het meest helpen?",
        "options": [
            {"key": "cud_safety", "text": "Fouten of twijfels makkelijker kunnen bespreken zonder negatieve gevolgen",
             "related": ["cu_mistakes"],
             "agenda": "Wat moet management eerst toetsen om het bespreken van fouten en twijfels veiliger te maken?"},
            {"key": "cud_dissent", "text": "Meer ruimte voor kritische vragen en afwijkende meningen",
             "related": ["cu_dissent"],
             "agenda": "Wat moet management eerst toetsen om kritische vragen en afwijkende meningen meer ruimte te geven?"},
            {"key": "cud_conflict", "text": "Spanningen of conflicten eerder bespreekbaar maken",
             "related": ["cu_conflict"],
             "agenda": "Wat moet management eerst toetsen om spanningen eerder bespreekbaar te maken?"},
            {"key": "cud_agreements", "text": "Duidelijkere teamafspraken over gedrag, samenwerking en opvolging",
             "related": ["cu_behavior"],
             "agenda": "Wat moet management eerst toetsen om teamafspraken over gedrag en opvolging te verduidelijken?"},
            {"key": "cud_involvement", "text": "Eerder betrokken worden bij besluiten of veranderingen die het team raken",
             "related": ["cu_exclusion"],
             "agenda": "Wat moet management eerst toetsen om medewerkers eerder te betrekken bij besluiten die het team raken?"},
            {"key": "cud_crossteam", "text": "Betere samenwerking tussen teams of afdelingen",
             "related": ["cu_cross_team"],
             "agenda": "Wat moet management eerst toetsen om de samenwerking tussen teams of afdelingen te verbeteren?"},
            {"key": "cud_other", "text": "Anders, namelijk…", "related": [], "agenda": None},
        ],
    },
    "growth": {
        "question": "Welke richting zou het gesprek over groeiperspectief het meest helpen?",
        "options": [
            {"key": "grd_visibility", "text": "Beter zicht op welke mogelijkheden er voor mij zijn",
             "related": ["gr_visibility"],
             "agenda": "Wat moet management eerst toetsen om ontwikkelmogelijkheden zichtbaarder te maken?"},
            {"key": "grd_conversation", "text": "Een concreter gesprek over mijn ontwikkeling",
             "related": ["gr_conversation"],
             "agenda": "Wat moet management eerst toetsen om ontwikkelgesprekken concreter te maken?"},
            {"key": "grd_followthrough", "text": "Ontwikkelafspraken concreter vastleggen en zichtbaar opvolgen",
             "related": ["gr_follow_through"],
             "agenda": "Wat moet management eerst toetsen om ontwikkelafspraken zichtbaar op te volgen?"},
            {"key": "grd_time", "text": "Ontwikkeling beter inplannen naast het reguliere werk",
             "related": ["gr_time"],
             "agenda": "Wat moet management eerst toetsen om ontwikkeling beter in te plannen naast het reguliere werk?"},
            {"key": "grd_criteria", "text": "Duidelijkere criteria voor hoe doorgroei wordt bepaald",
             "related": ["gr_criteria"],
             "agenda": "Wat moet management eerst toetsen om doorgroeicriteria te verduidelijken?"},
            {"key": "grd_nextstep", "text": "Een open en concreet gesprek over realistische vervolgstappen, binnen of buiten mijn huidige rol",
             "related": ["gr_ceiling"],
             "agenda": "Wat moet management eerst toetsen om realistische vervolgstappen bespreekbaar te maken?"},
            {"key": "grd_other", "text": "Anders, namelijk…", "related": [], "agenda": None},
        ],
    },
    "compensation": {
        "question": "Welke richting zou het gesprek over beloning en voorwaarden het meest helpen?",
        "options": [
            {"key": "cpd_insight", "text": "Beter inzicht in hoe beloning zich verhoudt tot vergelijkbaar werk elders",
             "related": ["cp_external"],
             "agenda": "Wat moet management eerst toetsen om inzicht te geven in hoe de beloning zich verhoudt tot vergelijkbaar werk elders?"},
            {"key": "cpd_explain", "text": "Meer uitlegbaarheid van verschillen tussen vergelijkbare functies",
             "related": ["cp_internal"],
             "agenda": "Wat moet management eerst toetsen om verschillen tussen vergelijkbare functies uitlegbaar te maken?"},
            {"key": "cpd_review", "text": "Beloning en rolzwaarte opnieuw tegen elkaar houden",
             "related": ["cp_responsibility"],
             "agenda": "Wat moet management eerst toetsen om beloning en rolzwaarte opnieuw tegen elkaar te houden?"},
            {"key": "cpd_path", "text": "Duidelijker groeipad in beloning, inclusief voorwaarden en timing",
             "related": ["cp_growth"],
             "agenda": "Wat moet management eerst toetsen om het groeipad in beloning te verduidelijken?"},
            {"key": "cpd_clarity", "text": "Meer duidelijkheid over hoe beloning en groei worden bepaald",
             "related": ["cp_clarity"],
             "agenda": "Wat moet management eerst toetsen om uitlegbaar te maken hoe beloning en groei worden bepaald?"},
            {"key": "cpd_flex", "text": "Rooster, werktijden of flexibiliteit die beter aansluiten",
             "related": ["cp_flexibility"],
             "agenda": "Wat moet management eerst toetsen om te bepalen of rooster, werktijden of flexibiliteit beter kunnen aansluiten?"},
            {"key": "cpd_other", "text": "Anders, namelijk…", "related": [], "agenda": None},
        ],
    },
    "role_clarity": {
        "question": "Welke richting zou het gesprek over rolhelderheid het meest helpen?",
        "options": [
            {"key": "rcd_priorities", "text": "Duidelijkere prioriteiten binnen mijn rol",
             "related": ["rc_priorities"],
             "agenda": "Wat moet management eerst toetsen om prioriteiten binnen rollen te verduidelijken?"},
            {"key": "rcd_expectations", "text": "Duidelijkheid over verwachtingen en waarop ik word aangesproken",
             "related": ["rc_expectations"],
             "agenda": "Wat moet management eerst toetsen om verwachtingen en aanspreekcriteria te verduidelijken?"},
            {"key": "rcd_alignment", "text": "Eenduidigere opdrachten en betere afstemming tussen betrokkenen",
             "related": ["rc_conflicting"],
             "agenda": "Wat moet management eerst toetsen om opdrachten eenduidiger te maken en afstemming te verbeteren?"},
            {"key": "rcd_scope", "text": "Duidelijke afspraken als mijn takenpakket verandert",
             "related": ["rc_scope"],
             "agenda": "Wat moet management eerst toetsen om afspraken bij veranderende takenpakketten te borgen?"},
            {"key": "rcd_mandate", "text": "Duidelijkheid over wat ik zelf mag beslissen",
             "related": ["rc_mandate"],
             "agenda": "Wat moet management eerst toetsen om beslisruimte te verduidelijken?"},
            {"key": "rcd_information", "text": "Betere informatie, context en overdracht voor mijn werk",
             "related": ["rc_information"],
             "agenda": "Wat moet management eerst toetsen om informatie en overdracht rond het werk te verbeteren?"},
            {"key": "rcd_other", "text": "Anders, namelijk…", "related": [], "agenda": None},
        ],
    },
}


def get_direction_sets(scan_type: str) -> dict[str, dict[str, Any]]:
    """Per factor: question_set_version, question, options. Alleen retention in v1."""
    if scan_type not in DEEPENING_CAP:
        raise ValueError(f"unknown scan_type {scan_type!r}")
    if scan_type != "retention":
        return {}
    out: dict[str, dict[str, Any]] = {}
    for fk in DEEPENING_FACTOR_KEYS:
        raw = DIRECTION_SETS[fk]
        out[fk] = {
            "question_set_version": f"retention_{fk}_direction_v1",
            "question": raw["question"],
            "options": [{"key": o["key"], "text": o["text"]} for o in raw["options"]],
        }
    return out
```

- [ ] **Step 4: Run de tests — verwacht PASS, plus trede-1-regressie**

Run: `.venv/Scripts/python.exe -m pytest tests/test_direction_content.py tests/test_deepening_content.py tests/test_deepening_trigger.py -v`
Expected: alle nieuw PASS. **Let op:** `test_deepening_trigger.py` bevat mogelijk een assert op cap retention == 2 — die test in lockstep bijwerken naar 3 (dit is de bewuste spec-wijziging, documenteer in de commit message).

- [ ] **Step 5: Commit**

```bash
git add backend/products/shared/deepening.py tests/test_direction_content.py tests/test_deepening_trigger.py
git commit -m "feat(deepening): gespreksrichting-routesets + agenda-templates + cap retention 2->3"
```

- [ ] **Step 6: 🛑 REVIEWGATE (verplicht, spec §7.2/#59) — STOP en leg aan Lars voor**

Presenteer de 36 routeteksten + 36 agenda-templates (rechtstreeks uit `DIRECTION_SETS`) ter review. Dit zijn klantzichtbare woorden (survey + rapport). **Niet verder bouwen vóór akkoord.** Wijzigingen: alleen teksten aanpassen, keys/structuur blijven.

---

## Task 2: Schema — `DeepeningDirection` op `DeepeningEntry`

**Files:**
- Modify: `backend/schemas.py` (DeepeningEntry staat op regel 292–312)
- Test: `tests/test_direction_schema.py` (nieuw)

- [ ] **Step 1: Schrijf de failing tests**

```python
# tests/test_direction_schema.py
import pytest
from pydantic import ValidationError

from backend.schemas import DeepeningDirection, DeepeningEntry


def _entry(**over):
    base = dict(factor_key="workload", question_set_version="retention_workload_v1",
                status="answered", primary="wl_recovery")
    base.update(over)
    return base


def test_direction_answered_requires_choice():
    with pytest.raises(ValidationError):
        DeepeningDirection(question_set_version="retention_workload_direction_v1",
                           status="answered", choice=None)


def test_direction_skipped_forbids_choice_and_other():
    with pytest.raises(ValidationError):
        DeepeningDirection(question_set_version="retention_workload_direction_v1",
                           status="skipped", choice="wld_recovery")
    with pytest.raises(ValidationError):
        DeepeningDirection(question_set_version="retention_workload_direction_v1",
                           status="skipped", other_text="x")


def test_direction_other_requires_other_text():
    with pytest.raises(ValidationError):
        DeepeningDirection(question_set_version="retention_workload_direction_v1",
                           status="answered", choice="wld_other", other_text=None)
    ok = DeepeningDirection(question_set_version="retention_workload_direction_v1",
                            status="answered", choice="wld_other", other_text="minder vergaderdruk")
    assert ok.other_text == "minder vergaderdruk"


def test_direction_other_text_forbidden_without_other_choice():
    with pytest.raises(ValidationError):
        DeepeningDirection(question_set_version="retention_workload_direction_v1",
                           status="answered", choice="wld_recovery", other_text="tekst")


def test_entry_direction_only_when_answered():
    d = dict(question_set_version="retention_workload_direction_v1",
             status="answered", choice="wld_recovery")
    ok = DeepeningEntry(**_entry(direction=d))
    assert ok.direction.choice == "wld_recovery"
    with pytest.raises(ValidationError):
        DeepeningEntry(**_entry(status="skipped", primary=None, direction=d))


def test_entry_without_direction_still_valid():
    ok = DeepeningEntry(**_entry())
    assert ok.direction is None
```

- [ ] **Step 2: Run — verwacht FAIL** (`ImportError: DeepeningDirection`)

Run: `.venv/Scripts/python.exe -m pytest tests/test_direction_schema.py -v`

- [ ] **Step 3: Implementeer in schemas.py, direct vóór `class DeepeningEntry`**

```python
class DeepeningDirection(BaseModel):
    """Gespreksrichting-antwoord bij een beantwoorde verdieping (spec 2026-07-05 par. 5/6)."""
    question_set_version: str
    status: Literal["answered", "skipped"]
    choice: Optional[str] = None
    other_text: Optional[str] = Field(None, max_length=200)

    @model_validator(mode="after")
    def _validate(self) -> "DeepeningDirection":
        if self.status == "answered" and not self.choice:
            raise ValueError("answered vereist een keuze")
        if self.status == "skipped" and (self.choice or self.other_text):
            raise ValueError("skipped mag geen keuze of toelichting bevatten")
        if self.choice and self.choice.endswith("_other") and not (self.other_text and self.other_text.strip()):
            raise ValueError("other-keuze vereist een toelichting")
        if self.other_text and not (self.choice and self.choice.endswith("_other")):
            raise ValueError("other_text alleen bij een *_other keuze")
        return self
```

En op `DeepeningEntry`: voeg het veld toe ná `other_text` en breid de bestaande `_validate_choices` uit:

```python
    direction: Optional[DeepeningDirection] = None
```

```python
        # in _validate_choices, vóór `return self`:
        if self.direction is not None and self.status != "answered":
            raise ValueError("gespreksrichting alleen bij een beantwoorde verdieping")
```

- [ ] **Step 4: Run — verwacht PASS** (zelfde commando)

- [ ] **Step 5: Commit**

```bash
git add backend/schemas.py tests/test_direction_schema.py
git commit -m "feat(schemas): DeepeningDirection met answered/skipped/other-validatie"
```

---

## Task 3: Aggregatie, concordantie en agenda-scenario's

**Files:**
- Modify: `backend/products/shared/deepening.py`
- Test: `tests/test_direction_aggregation.py` (nieuw)

- [ ] **Step 1: Schrijf de failing tests**

```python
# tests/test_direction_aggregation.py
"""Aggregatie + concordantie + agenda-scenario's (spec 2026-07-05 par. 5/7.2/7.3)."""
from backend.products.shared.deepening import (
    aggregate_deepening,
    direction_agenda_scenario,
    is_concordant,
)

LOW = {"workload_1": 1, "workload_2": 2, "workload_3": 2}  # triggert workload


def _row(primary="wl_recovery", dir_status="answered", choice="wld_recovery"):
    entry = {"factor_key": "workload", "question_set_version": "retention_workload_v1",
             "status": "answered", "primary": primary, "secondary": None, "other_text": None}
    if dir_status is not None:
        entry["direction"] = {"question_set_version": "retention_workload_direction_v1",
                              "status": dir_status, "choice": choice, "other_text": None}
    return (LOW, [entry])


def test_is_concordant_via_related_mapping():
    assert is_concordant("workload", primary="wl_recovery", direction_choice="wld_recovery")
    assert not is_concordant("workload", primary="wl_capacity", direction_choice="wld_priorities")


def test_aggregate_counts_direction_chain():
    rows = [_row() for _ in range(6)] + [_row(dir_status="skipped", choice=None)] + \
           [_row(dir_status=None)]  # entry zonder direction = niet aangeboden/legacy
    agg = aggregate_deepening(rows, "retention")["workload"]
    assert agg["direction_offered"] == 7          # entries mét direction-veld
    assert agg["direction_answered"] == 6
    assert agg["direction_skipped"] == 1
    assert agg["direction_counts"] == {"wld_recovery": 6}


def test_scenario_concordant_when_tops_related():
    rows = [_row() for _ in range(10)]            # oorzaak-top wl_recovery, richting-top wld_recovery
    agg = aggregate_deepening(rows, "retention")["workload"]
    s = direction_agenda_scenario(agg, "retention", "workload")
    assert s["scenario"] == "concordant"
    assert "toetsen" in s["agenda_question"]


def test_scenario_discrepant_when_tops_unrelated():
    rows = [_row(primary="wl_capacity", choice="wld_priorities") for _ in range(10)]
    agg = aggregate_deepening(rows, "retention")["workload"]
    s = direction_agenda_scenario(agg, "retention", "workload")
    assert s["scenario"] == "discrepant"


def test_scenario_none_when_direction_weak():
    # richting versnipperd: topoptie haalt <4 respondenten en <50% -> alleen-oorzaak
    rows = ([_row(choice="wld_recovery") for _ in range(3)] +
            [_row(choice="wld_priorities") for _ in range(3)] +
            [_row(choice="wld_planning") for _ in range(2)] +
            [_row(choice="wld_peaks") for _ in range(2)])
    agg = aggregate_deepening(rows, "retention")["workload"]
    s = direction_agenda_scenario(agg, "retention", "workload")
    assert s["scenario"] == "cause_only"


def test_scenario_none_when_direction_top_is_other():
    rows = [_row(choice="wld_other") for _ in range(10)]
    agg = aggregate_deepening(rows, "retention")["workload"]
    s = direction_agenda_scenario(agg, "retention", "workload")
    assert s["scenario"] == "cause_only"          # other nooit template-verrijking


def test_scenario_stopregel_hoge_overslag():
    # >40% van aangeboden richtingen geskipt -> direction_suppressed
    rows = [_row() for _ in range(8)] + [_row(dir_status="skipped", choice=None) for _ in range(6)]
    agg = aggregate_deepening(rows, "retention")["workload"]
    s = direction_agenda_scenario(agg, "retention", "workload")
    assert s["scenario"] == "cause_only"
    assert s["direction_suppressed_by_skip"] is True
```

- [ ] **Step 2: Run — verwacht FAIL** (`ImportError`)

Run: `.venv/Scripts/python.exe -m pytest tests/test_direction_aggregation.py -v`

- [ ] **Step 3: Implementeer in deepening.py**

(a) Breid `aggregate_deepening` uit — voeg in de init-dict per factor toe:

```python
             "direction_offered": 0, "direction_answered": 0,
             "direction_skipped": 0, "direction_counts": {},
```

en in de entries-loop, binnen `if e["status"] == "answered":`, ná de secondary-telling:

```python
                d = e.get("direction")
                if d is not None:
                    agg["direction_offered"] += 1
                    if d.get("status") == "answered" and d.get("choice"):
                        agg["direction_answered"] += 1
                        agg["direction_counts"][d["choice"]] = agg["direction_counts"].get(d["choice"], 0) + 1
                    else:
                        agg["direction_skipped"] += 1
```

(b) Nieuwe pure functies, onderaan het bestand:

```python
def is_concordant(factor_key: str, primary: str, direction_choice: str) -> bool:
    """Concordantie via de verwantschaps-mapping (spec par. 5): niet opgeslagen, afgeleid."""
    for o in DIRECTION_SETS[factor_key]["options"]:
        if o["key"] == direction_choice:
            return primary in o["related"]
    return False


def _direction_top(agg: dict[str, Any]) -> tuple[str, int, int] | None:
    """Topoptie over direction_answered met dezelfde vijf voorwaarden als trede 1."""
    n = agg["direction_answered"]
    counts = agg["direction_counts"]
    if n < 8 or not counts:
        return None
    ranked = sorted(counts.items(), key=lambda kv: (-kv[1], kv[0]))
    top_key, top_n = ranked[0]
    second_n = ranked[1][1] if len(ranked) > 1 else 0
    if top_key.endswith("_other"):
        return None
    if top_n < 4 or top_n / n < 0.5 or top_n - second_n < 2:
        return None
    return top_key, top_n, n


def get_direction_agenda_question(factor_key: str, route_key: str) -> str | None:
    options = {o["key"]: o["agenda"] for o in DIRECTION_SETS[factor_key]["options"]}
    if route_key not in options:
        raise KeyError(f"unknown route_key {route_key!r} for factor {factor_key!r}")
    return options[route_key]


def direction_agenda_scenario(agg: dict[str, Any], scan_type: str, factor_key: str) -> dict[str, Any]:
    """Spec par. 7.2/7.3: bepaal het agendascenario voor een factor.

    Retourneert altijd een dict met `scenario` in
    {"cause_only", "concordant", "discrepant", "none"} + velden voor rendering.
    - "none": ook de oorzaak-verrijking vuurt niet (render de generieke regel).
    - Stopregel: >40% van de aangeboden richtingen geskipt -> richting onderdrukt.
    """
    cause = agenda_enrichment(agg, scan_type, factor_key)
    suppressed = False
    offered = agg.get("direction_offered", 0)
    if offered > 0 and agg.get("direction_skipped", 0) / offered > 0.4:
        suppressed = True
    top = None if suppressed else _direction_top(agg)
    if cause is None:
        return {"scenario": "none", "direction_suppressed_by_skip": suppressed}
    if top is None:
        return {"scenario": "cause_only", "cause": cause,
                "direction_suppressed_by_skip": suppressed}
    route_key, route_n, dir_n = top
    concordant = is_concordant(factor_key, cause["option_key"], route_key)
    return {
        "scenario": "concordant" if concordant else "discrepant",
        "cause": cause,
        "direction_suppressed_by_skip": False,
        "route_key": route_key,
        "route_count": route_n,
        "direction_answered": dir_n,
        "agenda_question": get_direction_agenda_question(factor_key, route_key),
    }
```

- [ ] **Step 4: Run — verwacht PASS**, plus regressie op de bestaande aggregatie-tests

Run: `.venv/Scripts/python.exe -m pytest tests/test_direction_aggregation.py tests/test_deepening_report.py -v`
Expected: PASS (de init-dict-uitbreiding is additief; bestaande asserts vergelijken per-key, niet dict-geheel — faalt een bestaande test op dict-gelijkheid, werk die assert bij naar per-key checks en meld het in de commit).

- [ ] **Step 5: Commit**

```bash
git add backend/products/shared/deepening.py tests/test_direction_aggregation.py
git commit -m "feat(deepening): direction-aggregatie, concordantie-afleiding en agenda-scenario's"
```

---

## Task 4: Servervalidatie + anonymisering + survey-config (main.py)

**Files:**
- Modify: `backend/main.py` (validatieblok regels 1321–1351; survey-config regels 1288–1291)
- Test: `tests/test_direction_submit.py` (nieuw; gebruik `tests/test_deepening_submit.py` als voorbeeld voor fixtures/clients)

- [ ] **Step 1: Schrijf de failing tests** — kopieer de fixture-opzet (app-client, campagne, respondent, geldige payload) uit `tests/test_deepening_submit.py` en voeg deze cases toe:

```python
def test_direction_accepted_and_persisted(retention_client, valid_retention_payload):
    payload = valid_retention_payload  # bevat een answered workload-verdieping
    payload["deepening_responses"][0]["direction"] = {
        "question_set_version": "retention_workload_direction_v1",
        "status": "answered", "choice": "wld_recovery", "other_text": None,
    }
    r = retention_client.post(SUBMIT_URL, json=payload)
    assert r.status_code == 200
    stored = fetch_stored_response()  # zelfde helper als trede-1-test
    assert stored.deepening_responses[0]["direction"]["choice"] == "wld_recovery"


def test_direction_unknown_choice_422(retention_client, valid_retention_payload):
    valid_retention_payload["deepening_responses"][0]["direction"] = {
        "question_set_version": "retention_workload_direction_v1",
        "status": "answered", "choice": "wld_bestaat_niet", "other_text": None,
    }
    r = retention_client.post(SUBMIT_URL, json=valid_retention_payload)
    assert r.status_code == 422


def test_direction_wrong_version_422(retention_client, valid_retention_payload):
    valid_retention_payload["deepening_responses"][0]["direction"] = {
        "question_set_version": "retention_workload_direction_v9",
        "status": "answered", "choice": "wld_recovery", "other_text": None,
    }
    r = retention_client.post(SUBMIT_URL, json=valid_retention_payload)
    assert r.status_code == 422


def test_direction_on_exit_scan_422(exit_client, valid_exit_payload):
    valid_exit_payload["deepening_responses"][0]["direction"] = {
        "question_set_version": "retention_workload_direction_v1",
        "status": "answered", "choice": "wld_recovery", "other_text": None,
    }
    r = exit_client.post(SUBMIT_URL, json=valid_exit_payload)
    assert r.status_code == 422


def test_direction_other_text_is_anonymized(retention_client, valid_retention_payload):
    valid_retention_payload["deepening_responses"][0]["direction"] = {
        "question_set_version": "retention_workload_direction_v1",
        "status": "answered", "choice": "wld_other",
        "other_text": "Jan de Vries van team Alpha moet weg",
    }
    r = retention_client.post(SUBMIT_URL, json=valid_retention_payload)
    assert r.status_code == 200
    stored = fetch_stored_response()
    assert "Jan" not in (stored.deepening_responses[0]["direction"]["other_text"] or "")
```

- [ ] **Step 2: Run — verwacht FAIL** (direction wordt nu stilzwijgend geaccepteerd zonder validatie, of de assert op anonymisering faalt)

Run: `.venv/Scripts/python.exe -m pytest tests/test_direction_submit.py -v`

- [ ] **Step 3: Implementeer in main.py**

(a) Import uitbreiden (regel 76): voeg `get_direction_sets` toe aan de bestaande import uit `backend.products.shared.deepening`.

(b) In het validatieblok, binnen de `for entry in payload.deepening_responses:`-loop, ná de versiecheck (regel 1344):

```python
            if entry.direction is not None:
                if scan_type != "retention":
                    raise HTTPException(status_code=422, detail="Gespreksrichting wordt niet ondersteund voor dit scantype.")
                direction_set = get_direction_sets(scan_type)[entry.factor_key]
                valid_route_keys = {o["key"] for o in direction_set["options"]}
                if entry.direction.choice is not None and entry.direction.choice not in valid_route_keys:
                    raise HTTPException(status_code=422, detail="Onbekende gespreksrichting-optie.")
                if entry.direction.question_set_version != direction_set["question_set_version"]:
                    raise HTTPException(status_code=422, detail="Verouderde gespreksrichting-versie.")
```

(c) In de `deepening_clean`-loop (regels 1346–1351), ná de bestaande other_text-anonymisering:

```python
        d_dir = d.get("direction")
        if d_dir and d_dir.get("other_text"):
            d_dir["other_text"] = anonymize_text(d_dir["other_text"])
```

(d) Survey-config (regels 1289–1290) uitbreiden:

```python
            "direction_sets": get_direction_sets(campaign.scan_type) if campaign.scan_type == "retention" else {},
```

- [ ] **Step 4: Run — verwacht PASS**, plus trede-1-submit-regressie

Run: `.venv/Scripts/python.exe -m pytest tests/test_direction_submit.py tests/test_deepening_submit.py -v`

- [ ] **Step 5: Commit**

```bash
git add backend/main.py tests/test_direction_submit.py
git commit -m "feat(submit): servervalidatie + anonymisering gespreksrichting; direction_sets in survey-config"
```

---

## Task 5: Survey-UI — gespreksrichting-stap (template + JS)

**Files:**
- Modify: `templates/survey/shared-deepening.html`
- Modify: `templates/survey.html` (deepening-JS regio ~619–760; payload-bouw ~1030–1060; step-offsets rond regel 460)
- Test: `tests/test_deepening_template.py` (uitbreiden) — volg de bestaande template-teststijl (render + string-asserts)

- [ ] **Step 1: Schrijf failing template-tests** (uitbreiding van `tests/test_deepening_template.py`, zelfde render-helper):

```python
def test_direction_step_rendered_for_retention(rendered_retention_survey):
    html = rendered_retention_survey
    assert 'id="direction-step"' in html
    assert "Gespreksrichting" in html
    assert "geen toezegging" in html            # introductieregel
    assert "__DIRECTION_SETS" in html


def test_direction_step_absent_for_exit(rendered_exit_survey):
    assert 'id="direction-step"' not in rendered_exit_survey
```

- [ ] **Step 2: Run — verwacht FAIL**

Run: `.venv/Scripts/python.exe -m pytest tests/test_deepening_template.py -v`

- [ ] **Step 3: Template — voeg de stap toe in `shared-deepening.html`**, direct ná de bestaande deepening-stap (vóór de afsluitende `{% endif %}` een eigen conditie gebruiken):

```html
{% if direction_sets %}
{# Gespreksrichting-stap: volgt direct op de verduidelijkingsstap (alleen retention). #}
{% set step_dir = step_dp + 1 %}
<div class="step" data-step="{{ step_dir }}" data-label="Gespreksrichting" id="direction-step">
  <div class="card">
    <div class="card-title">Stap {{ step_dir }} — Gespreksrichting</div>
    <p style="color:var(--muted);font-size:13px;margin-bottom:8px;">
      Deze vraag helpt het gesprek te richten. Het is geen toezegging dat deze richting
      wordt uitgevoerd.
    </p>
    <p style="color:var(--muted);font-size:12px;margin-bottom:24px;">
      Nog één korte vraag per onderwerp. Kies wat als eerste gesprekspunt het meest zou
      helpen; andere punten kunnen ook meespelen.
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

**Let op de step-offsets in survey.html (regel ~460):** naast `{% set dp_offset = 1 if deepening_sets else 0 %}` komt `{% set dir_offset = 1 if direction_sets else 0 %}`; alle latere stappen schuiven `dp_offset + dir_offset` op. Loop alle `data-step`-berekeningen ná de deepening-stap na en pas ze aan — dit is de meest foutgevoelige stap van deze task; controleer de volledige stappenreeks handmatig in de browser (exit- én retention-variant).

- [ ] **Step 4: JS — rendering + payload in survey.html.** Voeg ná de bestaande `renderDeepeningBlocks`-machinerie toe (zelfde conventies: `checkbox-option`-rows via `_dpOptionRow`, skip-knop, hidden flag):

```javascript
  // ── Gespreksrichting-stap (alleen retention; volgt beantwoorde verdiepingen) ──
  const dirStep   = document.getElementById("direction-step");
  const dirBlocks = document.getElementById("direction-blocks");

  function answeredDeepeningFactors () {
    // Factoren waarvan de verdieping in de vorige stap beantwoord is (niet geskipt).
    if (!deepBlocks) return [];
    return Array.from(deepBlocks.querySelectorAll(".dp-block"))
      .filter(b => b.dataset.skipped !== "1")
      .filter(b => b.querySelector(".dp-primary input:checked"))
      .map(b => b.dataset.factor);
  }

  function renderDirectionBlocks () {
    if (!dirBlocks || !window.__DIRECTION_SETS) return;
    const factors = answeredDeepeningFactors();
    const prev = {};
    dirBlocks.querySelectorAll("input").forEach(inp => {
      if (!inp.name) return;
      if (inp.type === "radio") { if (inp.checked) prev[inp.name] = inp.value; }
      else prev[inp.name] = inp.value;
    });
    dirBlocks.innerHTML = "";
    factors.forEach(fk => {
      const set = window.__DIRECTION_SETS[fk];
      if (!set) return;
      const block = document.createElement("div");
      block.className = "question-block dpd-block";
      block.dataset.factor = fk;

      const q = document.createElement("div");
      q.className = "question-text";
      q.textContent = set.question;
      block.appendChild(q);

      const list = document.createElement("div");
      list.className = "checkbox-grid dpd-choice";
      set.options.forEach(opt => {
        list.appendChild(_dpOptionRow(`dpd_${fk}_choice`, opt.key, opt.text,
          prev[`dpd_${fk}_choice`] === opt.key));
      });
      block.appendChild(list);

      const other = document.createElement("div");
      other.className = "dp-other";
      other.style.display = "none";
      const otherInput = document.createElement("input");
      otherInput.type = "text";
      otherInput.name = `dpd_${fk}_other`;
      otherInput.maxLength = 200;
      otherInput.placeholder = "Licht kort toe…";
      if (prev[`dpd_${fk}_other`]) otherInput.value = prev[`dpd_${fk}_other`];
      const otherHelp = document.createElement("div");
      otherHelp.className = "helper-text";
      otherHelp.textContent = "Noem geen namen, functietitels, teams, locaties, medische informatie of herkenbare situaties.";
      other.appendChild(otherInput);
      other.appendChild(otherHelp);
      block.appendChild(other);

      list.addEventListener("change", () => {
        const sel = list.querySelector("input:checked");
        other.style.display = sel && sel.value.endsWith("_other") ? "" : "none";
      });

      const skipBtn = document.createElement("button");
      skipBtn.type = "button";
      skipBtn.className = "dp-skip";
      skipBtn.textContent = "Deze vraag liever overslaan";
      block.appendChild(skipBtn);
      skipBtn.addEventListener("click", () => {
        block.dataset.skipped = "1";
        list.querySelectorAll("input").forEach(i => { i.checked = false; });
        otherInput.value = "";
        other.style.display = "none";
        block.classList.add("dp-skipped");
      });

      dirBlocks.appendChild(block);
    });
    // Stap verbergen als er niets te vragen valt (geen beantwoorde verdiepingen).
    if (dirStep) dirStep.dataset.empty = factors.length ? "0" : "1";
  }
```

Roep `renderDirectionBlocks()` aan op het moment dat de gebruiker de verduidelijkingsstap verlaat (zelfde hook waar trede 1 `renderDeepeningBlocks` aanroept bij het betreden van de deepening-stap — zoek de step-navigatiehandler en spiegel het patroon; sla de stap over als `dataset.empty === "1"`, zoals de deepening-stap wordt overgeslagen zonder offers).

Payload-bouw (regel ~1030–1060): breid de bestaande `deepening_responses`-lus uit — per entry met `status: "answered"` het bijbehorende direction-blok opzoeken:

```javascript
      // gespreksrichting koppelen aan de beantwoorde verdieping
      const dirBlock = dirBlocks && dirBlocks.querySelector(`.dpd-block[data-factor="${fk}"]`);
      if (dirBlock && window.__DIRECTION_SETS && window.__DIRECTION_SETS[fk]) {
        const version = window.__DIRECTION_SETS[fk].question_set_version;
        const sel = dirBlock.querySelector(".dpd-choice input:checked");
        if (dirBlock.dataset.skipped === "1" || !sel) {
          entry.direction = { question_set_version: version, status: "skipped", choice: null, other_text: null };
        } else {
          const otherInput = dirBlock.querySelector(`input[name="dpd_${fk}_other"]`);
          entry.direction = {
            question_set_version: version,
            status: "answered",
            choice: sel.value,
            other_text: sel.value.endsWith("_other") ? (otherInput.value || "").slice(0, 200) : null,
          };
        }
      }
```

localStorage-persistence: de bestaande concept-persistence bewaart per input-name — de `dpd_*`-names liften daarop mee mits de blocks vóór restore gerenderd zijn; controleer dit expliciet in de e2e-check (refresh op de richtingstap).

- [ ] **Step 5: Run template-tests — verwacht PASS**

Run: `.venv/Scripts/python.exe -m pytest tests/test_deepening_template.py -v`

- [ ] **Step 6: Handmatige e2e- en mobiel-check (verplicht vóór commit)**

Start backend + frontend lokaal, open een retention-survey-token, en verifieer: (1) lage scores op 2 factoren → verduidelijking → gespreksrichting-stap met 2 blokken; (2) verdieping overslaan → geen richtingblok voor die factor; (3) richting overslaan → submit bevat `direction.status: "skipped"`; (4) refresh op de richtingstap → keuzes bewaard; (5) submit → 200 en opgeslagen entry bevat `direction`; (6) viewport 375px → langste routeset (beloning) bruikbaar zonder scrollen binnen de vraag; (7) exit-survey → geen richtingstap, stappenummering klopt.

- [ ] **Step 7: Commit**

```bash
git add templates/survey/shared-deepening.html templates/survey.html tests/test_deepening_template.py
git commit -m "feat(survey): gespreksrichting-stap na verduidelijking (retention), incl. skip-cascade en payload"
```

---

## Task 6: Rapport — blok "Welke gespreksrichting respondenten kozen" + agenda-scenario's

**Files:**
- Modify: `backend/report_html.py` (deepening-render-regio regels 541–629; aanroep-plekken rond 896–969)
- Test: `tests/test_direction_report_html.py` (nieuw; volg de stijl van `tests/test_deepening_report_html.py`)

- [ ] **Step 1: Schrijf failing tests**

```python
# tests/test_direction_report_html.py
from backend.report_html import _direction_block, _direction_agenda_line

AGG_OK = {"triggered": 18, "offered": 15, "answered": 12, "skipped": 3,
          "primary_counts": {"wl_recovery": 8, "wl_capacity": 4},
          "direction_offered": 12, "direction_answered": 10, "direction_skipped": 2,
          "direction_counts": {"wld_recovery": 6, "wld_priorities": 4}}


def test_direction_block_shows_full_chain_and_footer():
    html = _direction_block(AGG_OK, "retention", "workload")
    assert "18" in html and "12" in html and "10" in html and "6" in html   # keten
    assert "input van respondenten" in html                                  # voetregel
    for verboden in ("aanbeveling", "actieplan", "verschilmaker"):
        assert verboden not in html.lower()


def test_direction_block_hidden_below_privacy_floor():
    agg = dict(AGG_OK, direction_answered=4, direction_counts={"wld_recovery": 4})
    html = _direction_block(agg, "retention", "workload")
    assert "Te weinig" in html and "wld" not in html


def test_agenda_line_concordant_compact():
    line = _direction_agenda_line(AGG_OK, "retention", "workload")
    assert "sluit daarbij aan" in line
    assert "toetsen" in line


def test_agenda_line_discrepant():
    agg = dict(AGG_OK, primary_counts={"wl_capacity": 8, "wl_recovery": 4},
               direction_counts={"wld_priorities": 6, "wld_recovery": 4})
    line = _direction_agenda_line(agg, "retention", "workload")
    assert "lopen" in line and "verschil" in line


def test_agenda_line_none_when_cause_only():
    agg = dict(AGG_OK, direction_counts={"wld_recovery": 3, "wld_priorities": 3,
                                         "wld_planning": 2, "wld_peaks": 2})
    assert _direction_agenda_line(agg, "retention", "workload") is None
```

- [ ] **Step 2: Run — verwacht FAIL** (`ImportError`)

Run: `.venv/Scripts/python.exe -m pytest tests/test_direction_report_html.py -v`

- [ ] **Step 3: Implementeer in report_html.py**, direct ná `_deepening_block` (regel ~605), in dezelfde stijl (inline styles, `_h()`-escaping, `_fl()`-factorlabels, `_lc()`-lowercase-helpers zoals de buurfuncties):

```python
def _direction_block(agg: dict, scan_type: str, factor_key: str) -> str:
    """Blok 'Welke gespreksrichting respondenten kozen' (spec 2026-07-05 par. 7.1)."""
    n = agg.get("direction_answered", 0)
    offered = agg.get("direction_offered", 0)
    if offered == 0:
        return ""
    from backend.products.shared.deepening import DIRECTION_SETS
    opt_text = {o["key"]: o["text"] for o in DIRECTION_SETS[factor_key]["options"]}
    chain = (f"{agg['triggered']} respondenten hadden een verdieptrigger op "
             f"{_lc(_fl(factor_key, scan_type))}; {agg['offered']} kregen de verdieping, "
             f"{agg['answered']} beantwoordden die. Van hen gaven {n} een gespreksrichting.")
    if n < 5:
        body = ('<p style="font-size:9.5px;color:#64748B;margin:4px 0 0;">'
                'Te weinig antwoorden om een verdeling te tonen. Bespreek dit onderwerp '
                'in de managementbespreking.</p>')
    else:
        ranked = sorted(agg["direction_counts"].items(), key=lambda kv: (-kv[1], kv[0]))
        rows = []
        for key, cnt in ranked:
            label = _h(opt_text.get(key, key))
            if n >= 10:
                rows.append(f"<li>{label} &mdash; {cnt} ({round(cnt / n * 100)}%)</li>")
            else:
                rows.append(f"<li>{label} &mdash; {cnt}</li>")
        caveat = ""
        if n < 10:
            caveat = ('<p style="font-size:9px;color:#92400E;margin:4px 0 0;">'
                      'Beperkte antwoordbasis &mdash; gebruik dit als gesprekshaakje, '
                      'niet als conclusie.</p>')
        body = f'<ul style="font-size:9.5px;margin:4px 0 0;">{"".join(rows)}</ul>{caveat}'
    footer = ('<p style="font-size:8.5px;color:#94A3B8;margin:8px 0 0;">'
              'Gespreksrichting uit de groep is input van respondenten, geen uitvoeringsadvies. '
              'Haalbaarheid, rechtvaardigheid en passendheid binnen bestaand beleid wegen mee '
              'in de managementbespreking. Uitkomst van &eacute;&eacute;n meting: een '
              'gesprekshaakje, geen benchmark of trend.</p>')
    return (f'<div class="card"><span class="eyebrow">Welke gespreksrichting respondenten kozen</span>'
            f'<p style="font-size:9.5px;margin:4px 0 0;">{_h(chain)}</p>{body}{footer}</div>')


def _direction_agenda_line(agg: dict, scan_type: str, factor_key: str) -> str | None:
    """Verrijkte agenda-regel per scenario (spec par. 7.2); None -> bestaande regel blijft."""
    from backend.products.shared.deepening import direction_agenda_scenario
    from backend.products.shared.deepening import DIRECTION_SETS
    s = direction_agenda_scenario(agg, scan_type, factor_key)
    if s["scenario"] not in ("concordant", "discrepant"):
        return None
    cause = s["cause"]
    cause_text = _deepening_option_texts(scan_type, factor_key).get(cause["option_key"], cause["option_key"])
    route_text = {o["key"]: o["text"] for o in DIRECTION_SETS[factor_key]["options"]}[s["route_key"]]
    if s["scenario"] == "concordant":
        return (f"{cause['count']} van de {cause['answered']} kozen '{cause_text}' als belangrijkste "
                f"toelichting; de meest gekozen gespreksrichting sluit daarbij aan "
                f"({s['route_count']} van {s['direction_answered']}). "
                f"Gespreksvraag: {s['agenda_question']}")
    return (f"Respondenten kozen vooral '{cause_text}' als toelichting, maar "
            f"'{route_text}' als richting voor het gesprek "
            f"({s['route_count']} van {s['direction_answered']}). "
            f"Bespreek eerst waar dit verschil vandaan komt.")
```

Integratie: op de plek waar `_deepening_block` per factor gerenderd wordt, direct daarna `_direction_block` renderen; op de plek waar `_deepening_mgmt_q` de agenda verrijkt, eerst `_direction_agenda_line` proberen — geeft die een regel, dan vervangt die de trede-1-regel; geeft die `None`, dan blijft het bestaande gedrag (trede-1-verrijking of generieke regel) exact intact. Zoek beide aanroepplekken via `grep -n "_deepening_block\|_deepening_mgmt_q" backend/report_html.py`.

- [ ] **Step 4: Run — verwacht PASS**, plus rapportregressie én gate-check

Run: `.venv/Scripts/python.exe -m pytest tests/test_direction_report_html.py tests/test_deepening_report_html.py tests/test_deepening_report.py -v`
Expected: PASS. Campagnes zonder direction-data: `_direction_block` retourneert `""` (offered == 0) en `_direction_agenda_line` retourneert `None` → byte-identieke rendering (gate).

- [ ] **Step 5: Commit**

```bash
git add backend/report_html.py tests/test_direction_report_html.py
git commit -m "feat(rapport): gespreksrichting-blok + concordant/discrepant agenda-scenario's"
```

---

## Task 7: Voorbeeldrapport-generator + regressieafronding

**Files:**
- Modify: `generate_voorbeeldrapport.py` (repo-root) — de retention-seed
- Test: bestaande suites

- [ ] **Step 1: Seed richtingdata via de échte logica.** Zoek in `generate_voorbeeldrapport.py` waar de retention-respondenten `deepening_responses` krijgen (trede-1-seeding). Breid de answered entries uit met `direction`-objecten via `get_direction_sets("retention")`, zodanig dat de sample minimaal één **concordant** scenario (bijv. workload: oorzaak-top `wl_recovery`, richting-top `wld_recovery`) én één **discrepant** scenario (bijv. growth: oorzaak-top `gr_visibility`, richting-top `grd_followthrough`) bevat, met richting-beantwoorders ≥ 10 zodat percentages renderen. Gebruik uitsluitend geldige keys uit de sets — niets handmatig verzinnen.

- [ ] **Step 2: Genereer en inspecteer het voorbeeldrapport**

Run: `.venv/Scripts/python.exe generate_voorbeeldrapport.py` (of de bestaande batch-wrapper `genereer_voorbeeldrapport.bat`)
Expected: HTML/PDF bevat "Welke gespreksrichting respondenten kozen", de volledige keten, één concordante agenda-regel met "toetsen"-gespreksvraag en één "lopen uiteen"-regel. Geen "verschilmaker"/"aanbeveling"/"actieplan" (grep de output).

- [ ] **Step 3: Volledige backend-suite tegen baseline**

Run: `.venv/Scripts/python.exe -m pytest tests/ -q`
Expected: **exact 25 failed (pre-existente baseline), 0 nieuwe** — vergelijk de falende testnamen met een baseline-run op het merge-punt bij twijfel.

- [ ] **Step 4: Commit**

```bash
git add generate_voorbeeldrapport.py
git commit -m "feat(sample): richtingdata in voorbeeldrapport (concordant + discrepant scenario)"
```

- [ ] **Step 5: Afronding (buiten code, noteren in oplevering):** (a) PDF-samples regenereren via WeasyPrint-Docker (bestaande procedure) — kan samen met de nog openstaande trede-1-regeneratie; (b) CLAUDE.md-beslissingslog bijwerken; (c) pre-pilot checklistpunt doorgeven aan Lars: kop + één routeset cognitief pretesten bij 2–3 HR-peers; (d) pilotmetrics (drop-off richtingscherm, overslag per factor, concordantie-ratio) zijn afleidbaar uit de opgeslagen data — geen extra bouw; (e) **doelbindings-notitie (spec §8)**: voeg aan `docs/retentiescan-privacy-notes.md` een alinea toe — doel = groepsduiding t.b.v. het managementgesprek; geen individuele opvolging; geen arbeidsrechtelijke of beloningsbesluitvorming op persoonsniveau; richtingdata is agenda-input, geen maatregel-grondslag.

---

## Buiten scope (bewust — niet bouwen)

Exit-routeset; Loep Start; dashboard-weergave; segmentweergave van verdieping/richting (v1 = totaalniveau, afgedwongen doordat rendering alleen op campagneniveau plaatsvindt); vergelijking tussen metingen; AI; wijzigingen aan scoring of trede-1-triggers.

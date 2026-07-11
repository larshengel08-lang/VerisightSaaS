# Segmentanalyse per afdeling — implementatieplan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Afdelingssegmentatie via één survey-link + gevalideerde `?afd=`-slug (met verplicht keuzescherm bij kale binnenkomst in segment-modus), en een segmentblok in rapport-v6 met spreidingsstrips — plus linkgenerator in de setup-UI en afdelingen in de voorbeeldrapporten.

**Architecture:** Nieuw puur module `backend/segments.py` (slugify/validatie, geen DB). `Campaign.segment_departments` (JSON, nullable — `NULL`/leeg = huidige flow ongewijzigd). De bestaande open-flow (`/survey/open/{token}` in `backend/main.py` + `templates/survey-intro.html`) leest de slug of toont het keuzescherm; de start-POST zet `respondent.department`. Rapportzijde: `build_report_data` groepeert per-respondent signaalscores op afdeling; een nieuwe renderer in `report_html.py` port de legacy-kwalificatieregels (`backend/report.py:_build_department_overview_payload`) en hergebruikt `distribution_svg` uit de spreidingsronde. Spec: `docs/superpowers/specs/2026-07-11-segmentanalyse-afdelingen-design.md`.

**Tech Stack:** Python 3.11/FastAPI/SQLAlchemy/Jinja (backend), pytest, Next.js 15 route-proxies + React (setup-UI), vitest, WeasyPrint-Docker voor PDF-validatie.

**Referentiefeiten (geverifieerd in code, 2026-07-11):**
- Open-flow: `backend/main.py:1054` `GET /survey/open/{public_survey_token}` (rendert `templates/survey-intro.html`, geen DB-write) en `:1116` `POST /survey/open/{public_survey_token}/start` (maakt `Respondent(department=None, ...)` aan, 303 → `/survey/{token}`). Statuspagina's via `_render_survey_status`.
- `templates/survey-intro.html`: POST-form naar `/survey/open/{{ public_survey_token }}/start` met hidden `dedup_key`. **Let op: dit template staat nog op het oude blauwe merk** (`#1d4ed8`-hover, regel ~100) — de rebrand van 5 juli sloeg dit bestand over. Wordt in Task 2 meegenomen (Loep-tokens: chalk `#F4F1EA`, navy `#0D1B2A`, amber `#E8A020`, zelfde patroon als `templates/complete.html`).
- Next.js-proxies: `frontend/app/survey/open/[token]/route.ts` (GET) en `.../start/route.ts` (POST). **De GET-proxy stuurt query-params NIET door** — `?afd=` zou verloren gaan. Fix in Task 3.
- `Campaign`-model: `backend/models.py:~130-145` (naast `enabled_modules`, een bestaand JSON-veld — zelfde patroon). Migratie-conventie: idempotente SQL-bestanden in `migrations/` (voorbeeld: `2026_07_03_add_deepening_responses.sql`).
- `Respondent.department`: `backend/models.py:195` (String(100), nullable) — bestaat al.
- Legacy segmentlogica (referentie, niet aanpassen): `backend/report.py:1680-1795` — `_build_department_overview_row` (n≥`MIN_SEGMENT_N`, gem. score, band, topfactor) en `_build_department_overview_payload` (≥2 kwalificerende afdelingen anders `None`, max 8 rijen, rest "Overige afdelingen", sortering, voetregel).
- `MIN_SEGMENT_N = 5`: `backend/scoring_config.py:54`.
- Rapport-v6 degraded state: `_segment_status_block` in `backend/report_html.py:821`, aangeroepen op regels ~1619 (exit), ~1969 (retention), ~2344 (onboarding), altijd met `has_segment_data=False`. `_responsbasis` (`report_html.py:416`) krijgt `segment_available`-flag.
- Spreidingsronde-bouwstenen: `backend/report_distribution.py` — `distribution_svg(values, width, height)` (stippen-op-zone-as) en `MIN_DISTRIBUTION_N = 10`. `data["factor_resp_scores"]`/`data["intent_resp"]` bestaan al in `build_report_data`.
- Per-respondent signaalscore + afdeling in `build_report_data`: `completed` is een lijst `Respondent`-objecten met `.department` en `.response.risk_score` (zie `pattern_input`-bouw rond `report_html.py:928-936`).
- Setup-UI: `frontend/components/dashboard/new-campaign-form.tsx` insert direct via Supabase (`supabase.from('campaigns').insert({...})`, regel ~61). Linkweergave: `buildSurveyLink(frontendBaseUrl, publicSurveyToken)` in `frontend/lib/self-send-comms.ts:73`, geconsumeerd door `self-send-setup-panel.tsx` en `setup-wizard-card.tsx`.
- Voorbeeldgenerator: `generate_voorbeeldrapport.py` seedt `department=random.choice(DEPARTMENTS)` al (regel ~973) — Task 7 checkt alleen de verdeling (≥2 afdelingen boven n=5 + één eronder) en regenereert.
- Testbaseline backend: **25 failed** (pre-existent). tsc-baseline frontend: **133**. Elke taak eindigt exact op die baselines.
- Python: `../../.venv/Scripts/python.exe` vanuit de worktree (gedeelde venv in hoofdrepo). Windows/Git Bash. WeasyPrint-render via PowerShell (Git Bash-padvertaling breekt de Docker-mount).

---

### Task 1: `backend/segments.py` + Campaign-kolom + migratie

**Files:**
- Create: `backend/segments.py`
- Create: `migrations/2026_07_11_add_segment_departments.sql`
- Modify: `backend/models.py` (Campaign, naast `enabled_modules`)
- Test: `tests/test_segments.py`

- [ ] **Step 1: Schrijf de falende tests**

```python
# tests/test_segments.py
"""Afdelingssegmentatie: slugs + validatie (spec: 2026-07-11-segmentanalyse-afdelingen-design.md)."""
from backend.segments import build_segment_departments, resolve_department, has_segments


def test_build_genereert_slugs_uit_labels():
    out = build_segment_departments(["Sales", "Customer Success", "  Operations  "])
    assert out == [
        {"label": "Sales", "slug": "sales"},
        {"label": "Customer Success", "slug": "customer-success"},
        {"label": "Operations", "slug": "operations"},
    ]


def test_build_weigert_duplicaten_en_lege_labels():
    import pytest
    with pytest.raises(ValueError):
        build_segment_departments(["Sales", "sales"])  # zelfde slug
    with pytest.raises(ValueError):
        build_segment_departments(["Sales", "   "])


def test_resolve_geldige_slug_geeft_label():
    deps = build_segment_departments(["Sales", "Operations"])
    assert resolve_department(deps, "sales") == "Sales"


def test_resolve_ongeldige_of_lege_slug_geeft_none():
    deps = build_segment_departments(["Sales"])
    assert resolve_department(deps, "marketing") is None   # gemanipuleerd/onbekend
    assert resolve_department(deps, "") is None
    assert resolve_department(deps, None) is None


def test_has_segments():
    assert has_segments(None) is False
    assert has_segments([]) is False
    assert has_segments([{"label": "Sales", "slug": "sales"}]) is True
```

- [ ] **Step 2: Run — verwacht FAIL (module bestaat niet)**

Run: `../../.venv/Scripts/python.exe -m pytest tests/test_segments.py -q`
Expected: `ModuleNotFoundError: No module named 'backend.segments'`

- [ ] **Step 3: Implementeer de module**

```python
# backend/segments.py
"""Afdelingssegmentatie (spec: 2026-07-11-segmentanalyse-afdelingen-design.md).

Pure functies, geen DB. Campaign.segment_departments is een JSON-lijst
[{label, slug}]; NULL/leeg = campagne zonder segmenten (huidige flow).
Fail Loud: een onbekende slug wordt NOOIT als nieuw segment opgeslagen —
resolve_department geeft None en de flow toont het keuzescherm.
"""
from __future__ import annotations

import re
import unicodedata


def _slugify(label: str) -> str:
    s = unicodedata.normalize("NFKD", label).encode("ascii", "ignore").decode("ascii")
    s = re.sub(r"[^a-z0-9]+", "-", s.lower()).strip("-")
    return s


def build_segment_departments(labels: list[str]) -> list[dict]:
    """Labels (HR-invoer) -> [{label, slug}]. ValueError bij lege labels of slug-botsing."""
    out: list[dict] = []
    seen: set[str] = set()
    for raw in labels:
        label = (raw or "").strip()
        if not label:
            raise ValueError("Lege afdelingsnaam is niet toegestaan.")
        slug = _slugify(label)
        if not slug:
            raise ValueError(f"Afdelingsnaam '{label}' levert geen bruikbare slug op.")
        if slug in seen:
            raise ValueError(f"Dubbele afdeling (zelfde slug): '{label}'.")
        seen.add(slug)
        out.append({"label": label, "slug": slug})
    return out


def resolve_department(segment_departments: list[dict] | None, slug: str | None) -> str | None:
    """Slug -> label, alleen als de slug exact in de campagnelijst staat. Anders None."""
    if not segment_departments or not slug:
        return None
    for item in segment_departments:
        if item.get("slug") == slug:
            return item.get("label")
    return None


def has_segments(segment_departments: list[dict] | None) -> bool:
    return bool(segment_departments)
```

- [ ] **Step 4: Voeg de Campaign-kolom toe**

In `backend/models.py`, direct onder het bestaande `enabled_modules`-veld (~regel 143):

```python
    # Afdelingssegmentatie (spec 2026-07-11): JSON-lijst [{label, slug}].
    # NULL/leeg = campagne zonder segmenten (open flow ongewijzigd).
    segment_departments: Mapped[list | None] = mapped_column(JSON, nullable=True)
```

- [ ] **Step 5: Schrijf de idempotente migratie**

```sql
-- migrations/2026_07_11_add_segment_departments.sql
-- Afdelingssegmentatie: JSON-lijst [{label, slug}] per campagne.
-- NULL/leeg = campagne zonder segmenten (bestaand gedrag ongewijzigd).
-- Idempotent: veilig om meermaals te draaien.
alter table campaigns
  add column if not exists segment_departments jsonb;
```

- [ ] **Step 6: Run tests + regressie**

Run: `../../.venv/Scripts/python.exe -m pytest tests/test_segments.py tests/test_api_flows.py -q`
Expected: nieuwe tests groen; `test_api_flows` op zijn bestaande stand (bevat pre-existente fails uit de 25-baseline — vergelijk faalnamen, geen nieuwe).

- [ ] **Step 7: Commit**

```bash
git add backend/segments.py backend/models.py migrations/2026_07_11_add_segment_departments.sql tests/test_segments.py
git commit -m "feat(segmenten): segments-module + Campaign.segment_departments + migratie"
```

---

### Task 2: open-flow — slug lezen, keuzescherm, department opslaan (+ intro-rebrand)

**Files:**
- Modify: `backend/main.py` (`open_survey_intro` ~1054, `open_survey_start` ~1116)
- Modify: `templates/survey-intro.html` (keuzescherm + Loep-rebrand)
- Test: `tests/test_segment_flow.py`

- [ ] **Step 1: Schrijf de falende flow-tests**

Gebruik hetzelfde TestClient/fixture-patroon als `tests/test_api_flows.py` (SQLite-testdb; kopieer de bestaande fixture-opzet voor org+campagne — lees dat bestand eerst en hergebruik zijn helpers/conftest waar mogelijk).

```python
# tests/test_segment_flow.py
"""Open-flow met afdelingsslug + keuzescherm (spec: 2026-07-11)."""
# Fixture-opzet: volg tests/test_api_flows.py (client, db, org, actieve retention-campagne).
# Hieronder de gedragstests; `make_campaign(segment_departments=...)` verwijst naar de
# fixture-helper die je op basis van dat patroon bouwt.


def test_geldige_slug_slaat_keuzescherm_over_en_zet_department(client, make_campaign, db):
    camp = make_campaign(segment_departments=[
        {"label": "Sales", "slug": "sales"}, {"label": "Operations", "slug": "operations"}])
    r = client.get(f"/survey/open/{camp.public_survey_token}?afd=sales")
    assert r.status_code == 200
    assert "Bij welke afdeling" not in r.text          # geen keuzescherm
    assert 'name="afd" value="sales"' in r.text        # hidden field op het startform

    r2 = client.post(f"/survey/open/{camp.public_survey_token}/start",
                     data={"dedup_key": "", "afd": "sales"}, follow_redirects=False)
    assert r2.status_code == 303
    from backend.models import Respondent
    resp = db.query(Respondent).filter(Respondent.campaign_id == camp.id).first()
    assert resp.department == "Sales"                  # label, niet de slug


def test_kale_link_in_segmentmodus_toont_verplicht_keuzescherm(client, make_campaign):
    camp = make_campaign(segment_departments=[
        {"label": "Sales", "slug": "sales"}, {"label": "Operations", "slug": "operations"}])
    r = client.get(f"/survey/open/{camp.public_survey_token}")
    assert r.status_code == 200
    assert "Bij welke afdeling" in r.text
    assert "Sales" in r.text and "Operations" in r.text


def test_gemanipuleerde_slug_valt_terug_op_keuzescherm(client, make_campaign, db):
    camp = make_campaign(segment_departments=[{"label": "Sales", "slug": "sales"}])
    r = client.get(f"/survey/open/{camp.public_survey_token}?afd=directie")
    assert "Bij welke afdeling" in r.text              # onbekende slug = kale binnenkomst
    # en de POST accepteert een onbekende waarde evenmin als nieuw segment:
    client.post(f"/survey/open/{camp.public_survey_token}/start",
                data={"dedup_key": "", "afd": "directie"}, follow_redirects=False)
    from backend.models import Respondent
    resp = db.query(Respondent).filter(Respondent.campaign_id == camp.id).first()
    assert resp is None or resp.department is None     # geen stille nieuwe groep


def test_start_zonder_afd_in_segmentmodus_geeft_422(client, make_campaign):
    camp = make_campaign(segment_departments=[{"label": "Sales", "slug": "sales"}])
    r = client.post(f"/survey/open/{camp.public_survey_token}/start",
                    data={"dedup_key": ""}, follow_redirects=False)
    assert r.status_code == 422                        # verplicht kiezen, Fail Loud


def test_campagne_zonder_segmenten_ongewijzigd(client, make_campaign, db):
    camp = make_campaign(segment_departments=None)
    r = client.get(f"/survey/open/{camp.public_survey_token}")
    assert r.status_code == 200
    assert "Bij welke afdeling" not in r.text
    r2 = client.post(f"/survey/open/{camp.public_survey_token}/start",
                     data={"dedup_key": ""}, follow_redirects=False)
    assert r2.status_code == 303
    from backend.models import Respondent
    resp = db.query(Respondent).filter(Respondent.campaign_id == camp.id).first()
    assert resp.department is None
```

- [ ] **Step 2: Run — verwacht FAIL**

Run: `../../.venv/Scripts/python.exe -m pytest tests/test_segment_flow.py -q`
Expected: fails (hidden field/keuzescherm bestaan nog niet).

- [ ] **Step 3: Implementeer backend**

In `open_survey_intro` (na de bestaande campagne/actief/lock-checks):

```python
    from backend.segments import has_segments, resolve_department

    segment_departments = campaign.segment_departments or None
    afd_slug = request.query_params.get("afd")
    resolved_label = resolve_department(segment_departments, afd_slug)
    show_chooser = has_segments(segment_departments) and resolved_label is None

    return templates.TemplateResponse(
        request,
        "survey-intro.html",
        context={
            "product_name": product_name,
            "public_survey_token": public_survey_token,
            "afd_slug": afd_slug if resolved_label else "",
            "show_chooser": show_chooser,
            "segment_departments": segment_departments or [],
        },
    )
```

In `open_survey_start`, na het lezen van het form (bij de bestaande `form = await request.form()`), vóór het aanmaken van de respondent:

```python
    from backend.segments import has_segments, resolve_department

    department_label: str | None = None
    if has_segments(campaign.segment_departments):
        afd_slug = (form.get("afd") or "").strip()
        department_label = resolve_department(campaign.segment_departments, afd_slug)
        if department_label is None:
            # Fail Loud: verplicht kiezen in segment-modus; onbekende slug is
            # nooit een nieuw segment. 422 + terug naar de intropagina.
            return _render_survey_status(
                request,
                status_code=422,
                title="Kies je afdeling",
                heading="Kies eerst je afdeling",
                message="Open de link opnieuw en kies je afdeling om te starten.",
                tone="info",
            )
```

en in de `Respondent(...)`-aanmaak: `department=None` → `department=department_label`.

- [ ] **Step 4: Implementeer het keuzescherm in `templates/survey-intro.html`**

In het bestaande startform (regel ~139), boven de startknop:

```html
      <input type="hidden" name="afd" value="{{ afd_slug }}" id="afd-field" />
      {% if show_chooser %}
      <fieldset class="afd-chooser">
        <legend>Bij welke afdeling werk je?</legend>
        <p class="afd-note">Alleen gebruikt om resultaten op afdelingsniveau te groeperen (minimaal 5 personen per groep). Nooit individueel zichtbaar.</p>
        {% for dep in segment_departments %}
        <label class="afd-option">
          <input type="radio" name="afd" value="{{ dep.slug }}" required />
          <span>{{ dep.label }}</span>
        </label>
        {% endfor %}
      </fieldset>
      {% endif %}
```

Let op: bij `show_chooser` moet het hidden field NIET meegestuurd worden (twee `name="afd"`-velden) — zet het hidden field in een `{% if not show_chooser %}`-blok. Radio's krijgen `required` zodat de browser verplicht kiezen afdwingt; de 422-servercheck blijft de echte grens (Fail Loud).

**Rebrand in dezelfde taak** (bestand staat nog op oud blauw): vervang de `:root`-kleuren/knopstijl door het Loep-patroon uit `templates/complete.html` — chalk `#F4F1EA` achtergrond, navy `#0D1B2A` knop/tekst, amber `#E8A020` accent, wordmark "Loep •" + payoff "Scherper zien wat telt", scherpe hoeken. Style de `.afd-chooser`-radio's in datzelfde systeem (navy focus-ring, amber-soft geselecteerde staat). Verifieer visueel door de intropagina met en zonder chooser te renderen.

- [ ] **Step 5: Run — verwacht PASS + regressie**

Run: `../../.venv/Scripts/python.exe -m pytest tests/test_segment_flow.py tests/test_segments.py tests/test_api_flows.py -q`
Expected: nieuwe tests groen; `test_api_flows` exact op bestaande stand.

- [ ] **Step 6: Commit**

```bash
git add backend/main.py templates/survey-intro.html tests/test_segment_flow.py
git commit -m "feat(segmenten): slug-validatie + verplicht keuzescherm in open-flow; survey-intro naar Loep-merk"
```

---

### Task 3: Next.js-proxy — query-params doorsturen

**Files:**
- Modify: `frontend/app/survey/open/[token]/route.ts`
- Test: `frontend/app/survey/open/open-proxy.guard.test.ts`

- [ ] **Step 1: Schrijf de falende guard-test**

De proxy is een dun fetch-doorgeefluik; een source-guard-test (patroon: `new-campaign-form.guard.test.ts`) pint het gedrag zonder netwerk-mocks:

```typescript
// frontend/app/survey/open/open-proxy.guard.test.ts
import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

describe('open survey proxy — query-params', () => {
  it('stuurt de query-string (?afd=...) door naar de backend', () => {
    const src = readFileSync(join(__dirname, '[token]', 'route.ts'), 'utf-8')
    // De fetch-URL moet de zoekstring van het request bevatten:
    expect(src).toContain('req.nextUrl.search')
  })
})
```

- [ ] **Step 2: Run — verwacht FAIL**

Run vanuit `frontend/`: `npx vitest run app/survey/open/open-proxy.guard.test.ts`
Expected: FAIL (`req.nextUrl.search` staat er nog niet in).

- [ ] **Step 3: Fix de proxy**

In `frontend/app/survey/open/[token]/route.ts`, de fetch-regel:

```typescript
  const res = await fetch(`${BACKEND}/survey/open/${token}${req.nextUrl.search}`, {
    headers: { 'Accept': 'text/html' },
    cache: 'no-store',
  })
```

- [ ] **Step 4: Run — verwacht PASS + tsc-baseline**

Run vanuit `frontend/`: `npx vitest run app/survey/open/open-proxy.guard.test.ts && npx tsc --noEmit 2>&1 | grep -c "error TS"`
Expected: test groen; tsc-teller **133** (baseline, 0 nieuw).

- [ ] **Step 5: Commit**

```bash
git add "frontend/app/survey/open/[token]/route.ts" frontend/app/survey/open/open-proxy.guard.test.ts
git commit -m "fix(segmenten): open-survey-proxy stuurt querystring door (?afd= ging verloren)"
```

---

### Task 4: `build_report_data` — segmentdata per afdeling

**Files:**
- Modify: `backend/report_html.py` (nieuwe pure helper + `build_report_data`)
- Test: `tests/test_segment_report.py`

- [ ] **Step 1: Schrijf de falende tests**

```python
# tests/test_segment_report.py
"""Segmentblok rapport-v6 (spec: 2026-07-11-segmentanalyse-afdelingen-design.md)."""
from backend.report_html import _department_segment_rows


def _resp(dept, score):
    return {"department": dept, "signal_score": score}


def test_kwalificatie_n5_en_minimaal_2_afdelingen():
    # Sales n=5, Ops n=6, HR n=2 -> HR onder drempel -> Overige (n=2 < 5: geen eigen
    # rij, en Overige-bucket haalt de drempel ook niet -> geen Overige-rij)
    rows = _department_segment_rows(
        [_resp("Sales", 6.0)] * 5 + [_resp("Ops", 4.0)] * 6 + [_resp("HR", 5.0)] * 2)
    names = [r["department"] for r in rows]
    assert "Sales" in names and "Ops" in names and "HR" not in names


def test_geen_rows_bij_1_kwalificerende_afdeling():
    rows = _department_segment_rows(
        [_resp("Sales", 6.0)] * 8 + [_resp("Ops", 4.0)] * 3)
    assert rows == []          # 1 afdeling tegenover de rest = zinloos + privacyrisico


def test_overige_bucket_vanaf_n5():
    rows = _department_segment_rows(
        [_resp("Sales", 6.0)] * 5 + [_resp("Ops", 4.0)] * 5
        + [_resp("HR", 5.0)] * 3 + [_resp("Finance", 5.0)] * 2)
    overige = [r for r in rows if r["department"] == "Overige afdelingen"]
    assert len(overige) == 1 and overige[0]["n"] == 5


def test_row_bevat_score_scores_en_sortering_laagste_eerst():
    rows = _department_segment_rows(
        [_resp("Sales", 7.0)] * 5 + [_resp("Ops", 4.0)] * 5)
    assert rows[0]["department"] == "Ops"              # laagste signaal bovenaan
    assert rows[0]["avg"] == 4.0
    assert rows[0]["scores"] == [4.0] * 5              # per-respondent scores voor de strip


def test_respondenten_zonder_department_tellen_niet_mee():
    rows = _department_segment_rows(
        [_resp("Sales", 6.0)] * 5 + [_resp("Ops", 4.0)] * 5 + [_resp(None, 9.0)] * 4)
    assert all(r["n"] in (5,) for r in rows)
```

- [ ] **Step 2: Run — verwacht FAIL (`ImportError`)**

Run: `../../.venv/Scripts/python.exe -m pytest tests/test_segment_report.py -q`

- [ ] **Step 3: Implementeer de helper + wiring**

Pure modulefunctie in `backend/report_html.py` (plaats boven `build_report_data`, naast `_per_respondent_factor_scores`):

```python
def _department_segment_rows(respondents: list[dict]) -> list[dict]:
    """Segmentrijen voor het rapport (regels geport uit legacy report.py:1680-1795).

    Input: [{"department": str|None, "signal_score": float}] per afgeronde respondent.
    Kwalificatie: n >= MIN_SEGMENT_N per afdeling; minimaal 2 kwalificerende
    afdelingen (anders []); max 8 rijen, kleinere groepen samen als "Overige
    afdelingen" (alleen als die bucket zelf ook n >= MIN_SEGMENT_N haalt).
    Sortering: laagste gemiddelde eerst (grootste aandachtspunt bovenaan);
    "Overige afdelingen" altijd onderaan.
    """
    grouped: dict[str, list[float]] = {}
    for r in respondents:
        dept, score = r.get("department"), r.get("signal_score")
        if not dept or score is None:
            continue
        grouped.setdefault(str(dept), []).append(float(score))

    eligible = {d: v for d, v in grouped.items() if len(v) >= MIN_SEGMENT_N}
    if len(eligible) < 2:
        return []

    rows = [{"department": d, "n": len(v), "avg": round(sum(v) / len(v), 2),
             "scores": sorted(v)} for d, v in eligible.items()]
    rows.sort(key=lambda r: (r["avg"], -r["n"], r["department"]))

    visible, overflow = rows[:8], rows[8:]
    rest: list[float] = []
    for d, v in grouped.items():
        if d not in eligible:
            rest.extend(v)
    for row in overflow:
        rest.extend(row["scores"])
    if len(rest) >= MIN_SEGMENT_N:
        visible = visible[:7] if overflow else visible
        visible.append({"department": "Overige afdelingen", "n": len(rest),
                        "avg": round(sum(rest) / len(rest), 2), "scores": sorted(rest)})
    return visible
```

Import bovenin toevoegen aan de bestaande scoring_config-import: `MIN_SEGMENT_N` (staat in `backend/scoring_config.py:54`; check hoe `RISK_HIGH`/`RISK_MEDIUM` daar nu vandaan komen op regel ~43 en volg dat patroon).

In `build_report_data`, na de bouw van `factor_resp_scores`:

```python
    segment_rows = _department_segment_rows([
        {"department": r.department, "signal_score": r.response.risk_score}
        for r in completed
    ])
```

en in de `return dict(...)`: `segment_rows=segment_rows,`.

- [ ] **Step 4: Run — verwacht PASS + regressie**

Run: `../../.venv/Scripts/python.exe -m pytest tests/test_segment_report.py tests/test_report_distribution.py tests/test_report_html_design.py tests/test_pdf_redesign.py -q`
Expected: alles groen.

- [ ] **Step 5: Commit**

```bash
git add backend/report_html.py tests/test_segment_report.py
git commit -m "feat(segmenten): _department_segment_rows (legacy-regels geport) + segment_rows in build_report_data"
```

---

### Task 5: segmentblok-renderer in rapport-v6

**Files:**
- Modify: `backend/report_html.py` (`_segment_status_block` vervangen door blok-met-data-variant; 3 callsites; `_responsbasis`-flag)
- Test: `tests/test_segment_report.py`

- [ ] **Step 1: Schrijf de falende render-tests**

```python
# toevoegen aan tests/test_segment_report.py
from backend.report_html import render_retention_report_html
from tests.test_report_distribution import _min_retention_data


def _with_segments(rows):
    d = _min_retention_data()
    d["segment_rows"] = rows
    return d


def test_segmentblok_gerenderd_bij_data():
    html = render_retention_report_html(_with_segments([
        {"department": "Operations", "n": 14, "avg": 4.1, "scores": [4.0] * 14},
        {"department": "Sales", "n": 9, "avg": 6.8, "scores": [6.8] * 9},
    ]))
    assert "Operations" in html and "Sales" in html
    assert "minimaal 5 responses" in html            # voetregel
    assert "causale ranking" in html.lower() or "causale" in html


def test_strip_alleen_vanaf_n10():
    html = render_retention_report_html(_with_segments([
        {"department": "Operations", "n": 14, "avg": 4.1, "scores": [4.0] * 14},
        {"department": "Sales", "n": 9, "avg": 6.8, "scores": [6.8] * 9},
    ]))
    assert "spreiding vanaf 10 responses" in html    # Sales n=9: geen strip


def test_overige_zonder_strip():
    html = render_retention_report_html(_with_segments([
        {"department": "Operations", "n": 14, "avg": 4.1, "scores": [4.0] * 14},
        {"department": "Overige afdelingen", "n": 11, "avg": 5.6, "scores": [5.6] * 11},
    ]))
    assert "samengestelde restgroep" in html


def test_degraded_state_blijft_zonder_segmentdata():
    html = render_retention_report_html(_with_segments([]))
    assert "Segmentverschillen zijn niet getoond" in html
```

- [ ] **Step 2: Run — verwacht FAIL**

Run: `../../.venv/Scripts/python.exe -m pytest tests/test_segment_report.py -q -k "segmentblok or strip or overige or degraded"`

- [ ] **Step 3: Implementeer de renderer**

Breid `_segment_status_block` uit (of vervang de `has_segment_data=True`-tak — die "zie uitgebreide versie"-placeholder is dood) met een data-dragende variant. Nieuwe functie direct onder `_segment_status_block`:

```python
def _segment_block(segment_rows: list[dict], scan_type: str) -> str:
    """Segmentanalyse per afdeling: tabel + spreidingsstrip (spec 2026-07-11).

    Strip-gate n>=10 (MIN_DISTRIBUTION_N): rapportbreed EEN regel — bij 5-9
    responses wel de rij (score/band), geen stippen. "Overige afdelingen"
    krijgt nooit een strip (samengestelde restgroep).
    """
    from backend.report_distribution import MIN_DISTRIBUTION_N, distribution_svg

    if not segment_rows:
        return _segment_status_block(0, has_segment_data=False)

    rows_html = ""
    for row in segment_rows:
        dept, n_, avg, scores = row["department"], row["n"], row["avg"], row["scores"]
        col = _factor_color(avg)
        is_rest = dept == "Overige afdelingen"
        if is_rest:
            strip = '<span class="rm-mono" style="font-family:\'JetBrains Mono\', monospace;font-size:8px;letter-spacing:0.08em;text-transform:uppercase;color:#94A3B8;">spreiding niet getoond &mdash; samengestelde restgroep</span>'
        elif len(scores) >= MIN_DISTRIBUTION_N:
            strip = distribution_svg(scores, width=240, height=22)
        else:
            strip = '<span style="font-family:\'JetBrains Mono\', monospace;font-size:8px;letter-spacing:0.08em;text-transform:uppercase;color:#94A3B8;">spreiding vanaf 10 responses</span>'
        name_html = _h(dept) if is_rest else f"<strong>{_h(dept)}</strong>"
        rows_html += (
            f'<tr><td class="iq" style="width:24%;">{name_html}</td>'
            f'<td style="width:6%;">{n_}</td>'
            f'<td class="is" style="width:12%;text-align:left;color:{col};">{avg:.1f}</td>'
            f'<td style="width:16%;color:{col};font-size:9.5px;">{_h(_factor_label(avg))}</td>'
            f'<td>{strip}</td></tr>'
        )

    lowest = segment_rows[0]
    low_note = ""
    if lowest["department"] != "Overige afdelingen":
        low_note = (f'<p style="font-size:10.5px;color:#374151;margin-top:10px;margin-bottom:0;">'
                    f'<strong>{_h(lowest["department"])}</strong> scoort het laagst '
                    f'({lowest["avg"]:.1f}/10) &mdash; logisch startpunt voor de bespreking.</p>')

    return f"""<div class="pb sec">
  <span class="slabel">Segmentanalyse &mdash; per afdeling</span>
  <div class="card">
    <table class="item-tbl">{rows_html}</table>
    {low_note}
  </div>
  <p class="trustline">Alleen afdelingen met minimaal 5 responses worden individueel getoond;
  kleinere groepen vallen onder &ldquo;Overige afdelingen&rdquo;. Spreiding vanaf 10 responses
  per afdeling. Geen causale ranking &mdash; verschillen zijn gesprekstof, geen oordeel.</p>
</div>"""
```

Let op: de spec-mockup had een "laagste factor per afdeling"-regel; die vraagt per-afdeling-per-factor aggregatie. De `low_note` hierboven dekt de besliste versie (één regel voor de laagst scorende afdeling, zonder factorclaim — factorniveau per afdeling zou een n≥5-per-factor-per-afdeling-vraagstuk openen dat buiten deze ronde valt). Dit is een bewuste vereenvoudiging t.o.v. de mockup; noteer het in de commitbody.

Vervang de drie callsites (`report_html.py` ~1619, ~1969, ~2344):

```python
    s += _segment_block(data.get("segment_rows") or [], ST)
```

(bij exit is de scan-type-variabele mogelijk anders benoemd — check per renderer; de parameter wordt in v1 niet gebruikt maar houdt de signatuur toekomstvast voor scanspecifieke koppen.)

En de drie `_responsbasis(...)`-callsites (~1436, ~1790, ~2190): `segment_available=False` → `segment_available=bool(data.get("segment_rows"))` (de `segment_reason`-parameter blijft voor het degraded geval).

- [ ] **Step 4: Run — verwacht PASS + volledige regressie**

Run: `../../.venv/Scripts/python.exe -m pytest tests/ -q 2>&1 | tail -3`
Expected: **25 failed = baseline** (vergelijk faalnamen), rest groen.

- [ ] **Step 5: Commit**

```bash
git add backend/report_html.py tests/test_segment_report.py
git commit -m "feat(segmenten): segmentblok in rapport-v6 - tabel + spreidingsstrips, n>=10-gate, Overige-bucket"
```

---

### Task 6: setup-UI — segmenten invoeren + linkgenerator

**Files:**
- Modify: `frontend/components/dashboard/new-campaign-form.tsx` (~61: insert)
- Modify: `frontend/lib/self-send-comms.ts` (linkbuilder-variant)
- Modify: `frontend/components/dashboard/self-send-setup-panel.tsx` (linklijst per afdeling)
- Test: `frontend/lib/self-send-comms.test.ts` + `frontend/components/dashboard/new-campaign-form.guard.test.ts`

- [ ] **Step 1: Schrijf de falende tests**

```typescript
// toevoegen aan frontend/lib/self-send-comms.test.ts
import { buildSegmentSurveyLinks, buildSegmentDepartments } from './self-send-comms'

describe('segment-links', () => {
  it('bouwt per afdeling een link met slug-parameter', () => {
    const links = buildSegmentSurveyLinks('https://www.getloep.nl', 'tok-123', [
      { label: 'Sales', slug: 'sales' },
      { label: 'Customer Success', slug: 'customer-success' },
    ])
    expect(links).toEqual([
      { label: 'Sales', url: 'https://www.getloep.nl/survey/open/tok-123?afd=sales' },
      { label: 'Customer Success', url: 'https://www.getloep.nl/survey/open/tok-123?afd=customer-success' },
    ])
  })

  it('genereert slugs uit labels (zelfde regels als backend)', () => {
    expect(buildSegmentDepartments(['Sales', '  Customer Success '])).toEqual([
      { label: 'Sales', slug: 'sales' },
      { label: 'Customer Success', slug: 'customer-success' },
    ])
  })

  it('weigert duplicaten en lege labels', () => {
    expect(() => buildSegmentDepartments(['Sales', 'sales'])).toThrow()
    expect(() => buildSegmentDepartments(['  '])).toThrow()
  })
})
```

```typescript
// toevoegen aan frontend/components/dashboard/new-campaign-form.guard.test.ts
// (volg het bestaande source-guard-patroon in dat bestand)
it('stuurt segment_departments mee bij aanmaak en biedt de suggestie-optie', () => {
  const src = readFileSync(join(__dirname, 'new-campaign-form.tsx'), 'utf-8')
  expect(src).toContain('segment_departments')
  expect(src).toContain('Geen afdeling / overig')   // wizard-suggestie (spec §setup-UX)
})
```

- [ ] **Step 2: Run — verwacht FAIL**

Run vanuit `frontend/`: `npx vitest run lib/self-send-comms.test.ts components/dashboard/new-campaign-form.guard.test.ts`

- [ ] **Step 3: Implementeer**

**`frontend/lib/self-send-comms.ts`** — onder `buildSurveyLink`:

```typescript
export interface SegmentDepartment {
  label: string
  slug: string
}

function slugify(label: string): string {
  return label
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

// Zelfde regels als backend/segments.py: lege labels en slug-botsingen weigeren.
export function buildSegmentDepartments(labels: string[]): SegmentDepartment[] {
  const out: SegmentDepartment[] = []
  const seen = new Set<string>()
  for (const raw of labels) {
    const label = (raw ?? '').trim()
    if (!label) throw new Error('Lege afdelingsnaam is niet toegestaan.')
    const slug = slugify(label)
    if (!slug) throw new Error(`Afdelingsnaam '${label}' levert geen bruikbare slug op.`)
    if (seen.has(slug)) throw new Error(`Dubbele afdeling (zelfde slug): '${label}'.`)
    seen.add(slug)
    out.push({ label, slug })
  }
  return out
}

export function buildSegmentSurveyLinks(
  frontendBaseUrl: string,
  publicSurveyToken: string,
  departments: SegmentDepartment[],
): Array<{ label: string; url: string }> {
  const base = buildSurveyLink(frontendBaseUrl, publicSurveyToken)
  return departments.map((d) => ({ label: d.label, url: `${base}?afd=${d.slug}` }))
}
```

**`new-campaign-form.tsx`** — nieuwe sectie in het formulier (na de bestaande self-send-infoblok): checkbox "Rapporteren op afdelingsniveau" (state `useSegments`), bij aan: textarea `segmentLabels` (één afdeling per regel) met helptekst en een knop/link "Voeg 'Geen afdeling / overig' toe" die die regel aan de textarea toevoegt, plus één zin waarom ("mensen die nergens onder vallen klikken anders maar wat aan"). In `handleSubmit`, vóór de insert:

```typescript
    let segmentDepartments: SegmentDepartment[] | null = null
    if (useSegments) {
      try {
        segmentDepartments = buildSegmentDepartments(
          segmentLabels.split('\n').filter((l) => l.trim()),
        )
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Ongeldige afdelingslijst')
        setLoading(false)
        return
      }
      if (segmentDepartments.length < 2) {
        setError('Segmentrapportage vraagt minimaal 2 afdelingen.')
        setLoading(false)
        return
      }
    }
```

en in de insert: `segment_departments: segmentDepartments,`.

**`self-send-setup-panel.tsx`** — waar nu de enkele link staat (`buildSurveyLink`-memo, regel ~69): als de campagne `segment_departments` heeft, render in plaats van (niet naast!) de algemene link een lijst afdelingslinks (label + kopieerknop per rij, hergebruik de bestaande kopieer-interactie van de enkele link) met een kopregel "Deel per afdeling de eigen link — er is bewust geen algemene link." Het panel krijgt `segmentDepartments` als prop vanaf zijn bestaande data-bron (volg hoe `publicSurveyToken` het panel nu bereikt via `beheer-data.ts` en geef `segment_departments` op dezelfde route door).

- [ ] **Step 4: Run — verwacht PASS + tsc-baseline**

Run vanuit `frontend/`: `npx vitest run lib/self-send-comms.test.ts components/dashboard/new-campaign-form.guard.test.ts && npx tsc --noEmit 2>&1 | grep -c "error TS"`
Expected: tests groen; tsc **133**.

- [ ] **Step 5: Commit**

```bash
git add frontend/lib/self-send-comms.ts frontend/components/dashboard/new-campaign-form.tsx frontend/components/dashboard/self-send-setup-panel.tsx frontend/lib/self-send-comms.test.ts frontend/components/dashboard/new-campaign-form.guard.test.ts frontend/app/\(dashboard\)/campaigns/\[id\]/beheer/beheer-data.ts
git commit -m "feat(segmenten): afdelingen-invoer bij campagne-aanmaak + linkgenerator per afdeling in setup-panel"
```

---

### Task 7: samples met segmentblok + WeasyPrint-validatie

**Files:**
- Modify: `generate_voorbeeldrapport.py` (alleen indien de DEPARTMENTS-verdeling geen ≥2 kwalificerende afdelingen oplevert)
- Modify: `docs/examples/*.{html,pdf}`, `frontend/public/examples/*.{html,pdf}`

- [ ] **Step 1: Check de bestaande seeding**

De generator zet al `department=random.choice(DEPARTMENTS)` (regel ~973). Run eerst:

```bash
../../.venv/Scripts/python.exe generate_voorbeeldrapport.py retention 2>&1 | grep -E "Rapport|Grootte"
grep -c "Segmentanalyse" docs/examples/voorbeeldrapport_retentiescan.html
```

Als het segmentblok rendert (géén degraded-tekst "Segmentverschillen zijn niet getoond" in de HTML): seeding is al goed, ga naar Step 3. Zo niet: `random.choice` geeft mogelijk te vlakke spreiding — vervang de random-keuze door een deterministische verdeling die het ontwerp toont (≥2 afdelingen boven n=5 met verschillend profiel + 1 groep onder de drempel voor de "Overige"-bucketing), bijv. gewogen op index zoals `_culture_department_for_index` (regel ~545) dat al doet voor culture.

- [ ] **Step 2 (alleen indien nodig): pas de seeding aan en hergenereer**

Deterministisch patroon (voorbeeld voor de retention/exit-generator, sluit aan op bestaande stijl):

```python
def _sample_department_for_index(index: int) -> str:
    # Vaste verdeling zodat het segmentblok in de sample zichtbaar is:
    # Operations (laag profiel) en Kantoor/Sales boven de n=5-drempel,
    # HR eronder -> valt onder "Overige afdelingen".
    if index % 10 < 4:  return "Operations"
    if index % 10 < 7:  return "Kantoor"
    if index % 10 < 9:  return "Sales"
    return "HR"
```

- [ ] **Step 3: Regenereer alle drie + render PDF's (PowerShell, niet Git Bash)**

```bash
../../.venv/Scripts/python.exe generate_voorbeeldrapport.py exit
../../.venv/Scripts/python.exe generate_voorbeeldrapport.py retention
../../.venv/Scripts/python.exe generate_voorbeeldrapport.py onboarding
```

```powershell
$files = @("voorbeeldrapport_loep", "voorbeeldrapport_retentiescan", "voorbeeldrapport_onboarding")
foreach ($f in $files) {
  $out = docker run --rm -v "<WORKTREE-PAD>\docs\examples:/data" ghcr.io/weasyprint/weasyprint "/data/$f.html" "/data/$f.pdf" 2>&1
  "$f => exit $LASTEXITCODE, warnings: $($out | Measure-Object | Select-Object -ExpandProperty Count)"
}
```

Expected: 3× exit 0, **0 warnings**. Pagineringscheck met pypdf (elke pagina begint op een sectielabel; het segmentblok breekt niet):

```bash
../../.venv/Scripts/python.exe -c "
from pypdf import PdfReader
for name in ['voorbeeldrapport_loep', 'voorbeeldrapport_retentiescan', 'voorbeeldrapport_onboarding']:
    r = PdfReader(f'docs/examples/{name}.pdf')
    print(name, len(r.pages), 'pag.')
    for i, p in enumerate(r.pages, 1):
        print(f'  p{i:02d}:', p.extract_text().strip().replace(chr(10), ' ')[:80])
"
```

Controleer in de retention-PDF dat de segmentpagina de afdelingsrijen + strips toont en de degraded-tekst weg is.

- [ ] **Step 4: Kopieer, volledige suite, commit**

```bash
cp docs/examples/voorbeeldrapport_{loep,retentiescan,onboarding}.pdf frontend/public/examples/
../../.venv/Scripts/python.exe -m pytest tests/ -q 2>&1 | tail -3
```

Expected: **25 failed = baseline** (faalnamen vergelijken).

```bash
git add generate_voorbeeldrapport.py docs/examples/ frontend/public/examples/
git commit -m "chore(samples): segmentanalyse zichtbaar in voorbeeldrapporten (WeasyPrint-gevalideerd, 0 warnings)"
```

---

## Na afronding (handmatig, buiten dit plan)

1. **Supabase-migratie draaien** (`2026_07_11_add_segment_departments.sql`) — **vóór** Railway-redeploy.
2. Railway-redeploy (backend-Python gewijzigd).
3. Push → Vercel deployt frontend + samples automatisch.

## Zelfreview-notities (verwerkt)

- Spec-mockup toonde een "laagste factor"-kolom per afdeling; het ontwerpgesprek verving die door één topfactor-regel onder de tabel. Task 5 versimpelt verder naar een laagste-afdeling-regel zónder factorclaim: factorniveau per afdeling opent een n≥5-per-factor-per-afdeling-vraagstuk dat buiten deze ronde valt. Expliciet genoteerd in Task 5 zodat de reviewer dit als bewuste keuze ziet, niet als omissie.
- Slugify bestaat bewust twee keer (backend `segments.py`, frontend `self-send-comms.ts`) met identieke regels — de frontend genereert de lijst die de backend valideert; de backend-validatie is leidend (Fail Loud bij mismatch). Een gedeelde bron is er niet (Python/TS); de dubbele testdekking pint gelijkheid.
- `test_api_flows.py` bevat pre-existente fails (onderdeel van de 25-baseline) — plan-taken vergelijken faalnámen, niet alleen aantallen.
- Het keuzescherm gebruikt browser-`required` op de radio's + een 422-servercheck; de servercheck is de echte grens (JS/HTML is omzeilbaar).

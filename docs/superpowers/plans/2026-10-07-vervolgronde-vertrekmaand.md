# Vervolgronde vertrekmaand en zes keuzes: implementatieplan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** De zeven besloten punten uit `docs/superpowers/specs/2026-10-07-vervolgronde-vertrekmaand.md` bouwen: vertrekmaand in de Vertrek-vragenlijst, herleidbaarheidsregel voor de uitstroomperiode, richtingstaat op de inhoudelijke stemmen, geen "hierboven" na een paginabreuk, omvanglabels zonder overlap, besluitvelden begrensd op wat de PDF toont, en opschoning van gebruiksgegevens zonder meting.

**Architecture:** Backend (FastAPI, Jinja-survey, WeasyPrint-rapport in `backend/report_html.py`, contentlaag in `backend/products/shared/deepening.py`, opschoning in `backend/data_retention.py`) en frontend (Next.js, `frontend/lib/pricing.ts`, `frontend/lib/dashboard/campaign-decision.ts`, `frontend/components/dashboard/decision-block.tsx`). Geen migratie: de vertrekmaand gaat in de bestaande kolom `respondents.exit_month`. Elke taak is TDD, met de faalset per testnaam als gate.

**Tech Stack:** Python 3.11 (venv, gelijk aan Railway), pytest op SQLite, Jinja2, WeasyPrint 70.0 in het productie-image, TypeScript/React, vitest.

---

## Harde regels (voor elke implementer)

- Worktree `C:\Users\larsh\Desktop\Business\Verisight\.worktrees\vervolgronde`, branch `feature/vervolgronde-vertrekmaand`. **Niet mergen, niet pushen.**
- Nooit kaal `git stash`. Commit met `git commit -m "..." -- <paden>` (alleen je eigen paden). Commit alles vóór je stopt.
- Commitregel onderaan elk bericht: `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.
- `PY=/c/Users/larsh/Desktop/Business/Verisight/.venv/Scripts/python.exe` (3.11.9). Backendtests: `$PY -m pytest tests -q -p no:cacheprovider`.
- **Python 3.11:** geen PEP 701 f-strings (geen `\"` of dezelfde quotesoort binnen een f-string-expressie). `tests/test_python311_syntax_guard.py` blijft groen.
- Geen nieuwe dependencies.
- Nooit RLS, privacygates, staffels of drempels verzwakken om een test te laten slagen. De klant ziet nooit individuele antwoorden; de vertrekmaand is een quasi-identificerend gegeven.
- Klantcopy: Nederlands, je/jij, Loep als onderwerp, **geen em-dash of en-dash** (ook niet in nieuwe template-copy), geen jargon, geen oorzaak-claim.
- Opschoning: nooit `--apply` tegen productie, nooit een echte `DATABASE_URL` gebruiken.
- Frontend: `cd frontend`, `npx tsc --noEmit` (baseline 131 fouten), `npx vitest run` (baseline 47 falend van 1891). Geen junction naar `node_modules`. Na een eventuele `npm install`: `git checkout -- package-lock.json`.
- Een test die op main al faalt mag falen; een test die op main slaagde mag niet gaan falen. Faalsets op main: `docs/superpowers/plans/vervolgronde-backend-baseline-fails.txt` en `docs/superpowers/plans/vervolgronde-vitest-baseline-fails.txt`.

## Baselines (gemeten door de controller op `91ecfd14` + spec-commit `b70cbbb1`)

| | Main |
|---|---|
| Backend `pytest tests` | 25 failed / 1816 passed / 11 skipped |
| Frontend `tsc --noEmit` | 131 fouten |
| Frontend `vitest run` | 47 failed / 1891 tests |

Faalset vergelijken (backend):
```bash
$PY -m pytest tests -q -p no:cacheprovider -rf 2>&1 | grep "^FAILED" | sed 's/ - .*//' | sort > /c/Users/larsh/AppData/Local/Temp/loep-vervolgronde/na.txt
diff docs/superpowers/plans/vervolgronde-backend-baseline-fails.txt /c/Users/larsh/AppData/Local/Temp/loep-vervolgronde/na.txt && echo GEEN_REGRESSIES
```

## PDF's renderen in het productie-image (vast recept)

```bash
cd /c/Users/larsh/Desktop/Business/Verisight/.worktrees/vervolgronde
docker build -t loep-backend:test .
$PY scripts/stresstest_report.py
$PY generate_voorbeeldrapport.py exit && $PY generate_voorbeeldrapport.py retention && $PY generate_voorbeeldrapport.py onboarding
mkdir -p /c/Users/larsh/AppData/Local/Temp/loep-vervolgronde/out
MSYS_NO_PATHCONV=1 docker run --rm \
  -v "C:/Users/larsh/Desktop/Business/Verisight/.worktrees/vervolgronde:/repo:ro" \
  -v "C:/Users/larsh/AppData/Local/Temp/loep-vervolgronde/out:/out" \
  loep-backend:test sh -c "pip install -q pymupdf; python /repo/scripts/render_in_image.py"
```

Uitvoer per bestand `OK <naam> paginas=N warnings=0 emdash=0 check=OK` of `NIET OK` met bevindingen; slotregel `TOTAAL n bestanden, m met bevindingen`. **Bekende uitzondering (mag niet slechter worden):** scenario 01, 09 en 19 hebben elk één `paginavulling`-bevinding op pagina 7 (36%, 26%, 36%). Docker Desktop hangt soms op `%LOCALAPPDATA%\Docker\run\dockerInference`: Docker-processen stoppen, die map hernoemen, Docker Desktop herstarten; nooit factory reset.

---

## Bestandsoverzicht

| Bestand | Verantwoordelijkheid | Taken |
|---|---|---|
| `backend/exit_month.py` (nieuw) | Eén bron voor de vertrekmaand: maandnamen, vorm, venster, keuzelijst, validatie | 1 |
| `backend/main.py` | `_normalize_exit_month` streng; survey krijgt keuzelijst; submit valideert en slaat op | 1, 2 |
| `backend/schemas.py` | `SurveySubmit.exit_month` | 2 |
| `templates/survey/exit-context.html`, `templates/survey.html` | De vraag en het meesturen | 3 |
| `backend/report_html.py` | `_uitstroomperiode` (randregel, woordkeuze); richtingkaart en p.02-regel met niets-stemmen apart; weging; methodiekzin | 4, 7, 8 |
| `backend/products/shared/deepening.py` | `direction_state` op inhoudelijke stemmen; verdeeld-zinnen | 6, 8 |
| `scripts/stresstest_report.py`, `generate_voorbeeldrapport.py` | Vertrekmaanden in twee nieuwe scenario's en in het Vertrek-voorbeeld | 5 |
| `scripts/richting_staten.py` (nieuw) | Leest de richtingstaten uit de stresstest-HTML, voor de vergelijking voor/na | 0, 12 |
| `frontend/lib/pricing.ts`, `frontend/public/llms.txt` | Omvanglabel 1.000 of meer | 9 |
| `frontend/lib/dashboard/campaign-decision.ts`, `frontend/components/dashboard/decision-block.tsx` | Besluitvelden op 240 met teller | 10 |
| `backend/data_retention.py` | Gebruiksgegevens zonder meting na twee jaar weg | 11 |

---

### Task 0: Nulmeting richtingstaten en PDF's (controller)

**Files:**
- Create: `scripts/richting_staten.py`

- [ ] **Step 1: Schrijf het hulpscript**

```python
"""Richtingstaten per stresstestscenario, voor de vergelijking voor en na een wijziging.

QA-hulpmiddel, niet-productie. Leest docs/stresstest/*.html en, met --voorbeelden,
docs/examples/voorbeeldrapport_*.html. Per bestand de kaarten op de
gespreksagenda in volgorde: rol, onderwerp, staat (klasse dir-<staat>).

    python scripts/richting_staten.py > voor.txt
    python scripts/richting_staten.py --voorbeelden >> voor.txt
"""
from __future__ import annotations

import html
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
KAART = re.compile(r'<td class="dir-card dir-([a-z_]+)"><div class="dir-role">(.*?)</div>')


def staten(pad: Path) -> list[str]:
    tekst = pad.read_text(encoding="utf-8")
    return [html.unescape(rol) + " = " + staat for staat, rol in KAART.findall(tekst)]


def main(argv: list[str]) -> int:
    paden = sorted((ROOT / "docs" / "stresstest").glob("*.html"))
    if "--voorbeelden" in argv:
        paden = sorted((ROOT / "docs" / "examples").glob("voorbeeldrapport_*.html"))
    for pad in paden:
        regels = staten(pad) or ["(geen richtingkaarten)"]
        for r in regels:
            print(pad.stem + " | " + r)
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
```

- [ ] **Step 2: Nulmeting**

```bash
$PY scripts/stresstest_report.py
$PY generate_voorbeeldrapport.py exit && $PY generate_voorbeeldrapport.py retention && $PY generate_voorbeeldrapport.py onboarding
$PY scripts/richting_staten.py > /c/Users/larsh/AppData/Local/Temp/loep-vervolgronde/staten-voor.txt
$PY scripts/richting_staten.py --voorbeelden >> /c/Users/larsh/AppData/Local/Temp/loep-vervolgronde/staten-voor.txt
```
Daarna het vaste recept met `| tee /c/Users/larsh/AppData/Local/Temp/loep-vervolgronde/nulmeting.txt`. Verwacht: 24 bestanden, 3 met bevindingen (01/09/19). Zet de gegenereerde voorbeeldrapporten daarna terug: `git checkout -- docs/examples frontend/public/examples` (Taak 12 maakt ze definitief).

- [ ] **Step 3: Commit**

```bash
git add scripts/richting_staten.py docs/superpowers/plans/2026-10-07-vervolgronde-vertrekmaand.md docs/superpowers/plans/vervolgronde-backend-baseline-fails.txt docs/superpowers/plans/vervolgronde-vitest-baseline-fails.txt
git commit -m "chore(vervolgronde): plan, baselines en hulpscript richtingstaten" -- scripts/richting_staten.py docs/superpowers/plans/2026-10-07-vervolgronde-vertrekmaand.md docs/superpowers/plans/vervolgronde-backend-baseline-fails.txt docs/superpowers/plans/vervolgronde-vitest-baseline-fails.txt
```

---

### Task 1: Eén bron voor de vertrekmaand

**Files:**
- Create: `backend/exit_month.py`
- Modify: `backend/main.py` (`_normalize_exit_month`, rond regel 458)
- Modify: `backend/report_html.py` (`_EXIT_MONTH_RE` rond regel 92, `_MAANDEN_NL` rond regel 1269)
- Test: `tests/test_exit_month.py`

Waarom: de vertrekmaand komt nu van de respondent zelf. De keuzelijst, de servervalidatie en het rapport moeten dezelfde vorm en maandnamen gebruiken. `_normalize_exit_month` accepteert nu ook `2026-13` (alleen een lengtecheck); dat wordt streng.

- [ ] **Step 1: Schrijf de falende tests**

```python
from datetime import date

import pytest

from backend import exit_month as em


def test_maandlabel():
    assert em.maand_label("2026-03") == "maart 2026"


def test_keuzelijst_nieuwste_eerst_met_venster():
    opties = em.exit_month_options(date(2026, 10, 7))
    assert opties[0] == {"value": "2027-04", "label": "april 2027"}     # 6 vooruit
    assert opties[-1] == {"value": "2024-10", "label": "oktober 2024"}  # 24 terug
    assert len(opties) == em.EXIT_MONTH_FUTURE_MONTHS + em.EXIT_MONTH_PAST_MONTHS + 1
    assert {"value": "2026-10", "label": "oktober 2026"} in opties


def test_keuzelijst_over_de_jaargrens():
    opties = em.exit_month_options(date(2026, 1, 15))
    waarden = [o["value"] for o in opties]
    assert "2025-12" in waarden and "2026-07" in waarden and "2024-01" in waarden


@pytest.mark.parametrize("waarde", ["2026-10", "2024-10", "2027-04", "2024-09", "2027-05"])
def test_validatie_binnen_venster_met_een_maand_speling(waarde):
    assert em.validate_survey_exit_month(waarde, date(2026, 10, 7)) == waarde


@pytest.mark.parametrize("waarde", ["2024-08", "2027-06", "2026-13", "2026-00", "2026-1",
                                    "liever_niet", "", "2026/10", 202610, None])
def test_validatie_weigert(waarde):
    with pytest.raises(ValueError):
        em.validate_survey_exit_month(waarde, date(2026, 10, 7))


def test_normalisatie_import_is_streng():
    from backend.main import _normalize_exit_month
    assert _normalize_exit_month("2026/03") == "2026-03"
    assert _normalize_exit_month("2026-13") is None
    assert _normalize_exit_month("2026-00") is None
    assert _normalize_exit_month(date(2026, 3, 1)) == "2026-03"


def test_rapport_gebruikt_dezelfde_bron():
    from backend import report_html
    assert report_html._MAANDEN_NL is em.MAANDEN_NL
    assert report_html._EXIT_MONTH_RE is em.EXIT_MONTH_RE
```

- [ ] **Step 2: Draai, verwacht FAIL** (`ModuleNotFoundError: backend.exit_month`)

`$PY -m pytest tests/test_exit_month.py -q -p no:cacheprovider`

- [ ] **Step 3: Implementeer `backend/exit_month.py`**

```python
"""De vertrekmaand bij Loep Vertrek (spec 2026-10-07 par. 1 en 2).

Eén bron voor de vorm ("JJJJ-MM"), de Nederlandse maandnamen, het venster dat
de vragenlijst aanbiedt en de servervalidatie. De vertrekmaand is een
quasi-identificerend gegeven: hij staat alleen in respondents.exit_month (geen
kolomgrant voor klanten, migrations/2026_07_13_lock_individual_data_to_operator.sql)
en het rapport toont hem alleen als periode, met de randregel in
report_html._uitstroomperiode.
"""
from __future__ import annotations

import re
from datetime import date

MAANDEN_NL = ("januari", "februari", "maart", "april", "mei", "juni", "juli",
              "augustus", "september", "oktober", "november", "december")
EXIT_MONTH_RE = re.compile(r"^\d{4}-(0[1-9]|1[0-2])$")

# Het venster van de keuzelijst, gerekend vanaf de maand van vandaag (NL-tijd).
# Twee jaar terug dekt een terugblikkende meting; een half jaar vooruit dekt
# wie de vragenlijst invult vóór de laatste werkdag.
EXIT_MONTH_PAST_MONTHS = 24
EXIT_MONTH_FUTURE_MONTHS = 6
# Speling voor de servercontrole: de pagina kan vóór een maandwissel geladen
# zijn en erna verstuurd worden.
_SPELING_MAANDEN = 1


def _verschuif(jaar: int, maand: int, delta: int) -> tuple[int, int]:
    index = jaar * 12 + (maand - 1) + delta
    return index // 12, index % 12 + 1


def _sleutel(jaar: int, maand: int) -> str:
    return "%04d-%02d" % (jaar, maand)


def maand_label(sleutel: str) -> str:
    """"2025-03" -> "maart 2025"."""
    jaar, maand = sleutel.split("-")
    return MAANDEN_NL[int(maand) - 1] + " " + jaar


def exit_month_options(vandaag: date) -> list[dict[str, str]]:
    """De keuzelijst, nieuwste maand eerst."""
    sleutels = [_sleutel(*_verschuif(vandaag.year, vandaag.month, d))
                for d in range(EXIT_MONTH_FUTURE_MONTHS, -EXIT_MONTH_PAST_MONTHS - 1, -1)]
    return [{"value": s, "label": maand_label(s)} for s in sleutels]


def validate_survey_exit_month(waarde: object, vandaag: date) -> str:
    """De maand als hij geldig is, anders ValueError met een leesbare melding.

    "Zeg ik liever niet" komt hier nooit aan: de vragenlijst stuurt dan niets.
    Een andere waarde dan JJJJ-MM is dus een fout en wordt geweigerd, niet stil
    weggegooid.
    """
    if not isinstance(waarde, str) or not EXIT_MONTH_RE.match(waarde):
        raise ValueError("De vertrekmaand heeft geen geldige vorm.")
    oudste = _sleutel(*_verschuif(vandaag.year, vandaag.month,
                                  -EXIT_MONTH_PAST_MONTHS - _SPELING_MAANDEN))
    nieuwste = _sleutel(*_verschuif(vandaag.year, vandaag.month,
                                    EXIT_MONTH_FUTURE_MONTHS + _SPELING_MAANDEN))
    if not oudste <= waarde <= nieuwste:
        raise ValueError("De vertrekmaand valt buiten de maanden die de vragenlijst aanbiedt.")
    return waarde
```

In `backend/main.py`, `_normalize_exit_month`: importeer `EXIT_MONTH_RE` uit `backend.exit_month` en vervang

```python
    if len(raw) == 7 and raw[4] == "-":
        return raw
    return None
```
door
```python
    if EXIT_MONTH_RE.match(raw):
        return raw
    return None
```

In `backend/report_html.py`: vervang de definitie van `_EXIT_MONTH_RE` (houd het commentaar erboven) door `from backend.exit_month import EXIT_MONTH_RE as _EXIT_MONTH_RE` en de tuple `_MAANDEN_NL = (...)` door `from backend.exit_month import MAANDEN_NL as _MAANDEN_NL` (bij de andere imports bovenaan; laat de naam `_MAANDEN_NL` bestaan, die wordt elders gebruikt). `_maand_nl` blijft werken.

- [ ] **Step 4: Draai, verwacht PASS**; daarna de importtests: `$PY -m pytest tests/test_exit_month.py tests/test_api_flows.py tests/test_report_leesronde_fixes.py -q -p no:cacheprovider` (alleen fails die in de baseline staan).

- [ ] **Step 5: Commit**

```bash
git commit -m "feat(vertrekmaand): één bron voor vorm, venster en maandnamen; import streng" -- backend/exit_month.py backend/main.py backend/report_html.py tests/test_exit_month.py
```

---

### Task 2: Survey biedt de vertrekmaand aan en de server slaat hem op

**Files:**
- Modify: `backend/schemas.py` (`SurveySubmit`, na `exit_reason_code`)
- Modify: `backend/main.py` (`serve_survey` context rond regel 1369; `submit_survey` rond regel 1389)
- Test: `tests/test_exit_month_submit.py`

Regels:
- Alleen bij `scan_type == "exit"`. Een `exit_month` bij een andere scan geeft **422** "De vertrekmaand hoort alleen bij Loep Vertrek."
- Heeft de respondent al een `exit_month` (aangeleverd door HR bij een import), dan toont de survey de vraag niet (lege keuzelijst in de context) en geeft een meegestuurde waarde **422** "De vertrekmaand is voor deze uitnodiging al vastgelegd." De HR-waarde wordt nooit overschreven, ook niet met leeg.
- Ongeldige vorm of buiten het venster: **422** met de melding uit `validate_survey_exit_month`.
- `null` (overgeslagen of "Zeg ik liever niet") laat `respondents.exit_month` ongemoeid.
- Validatie vóór de scoring, dus een 422 slaat niets op.

- [ ] **Step 1: Schrijf de falende tests.** Volg het opzetpatroon van `tests/test_direction_submit_v2.py` of `tests/test_api_flows.py` (zoek met `grep -ln "survey/submit" tests/*.py` het bestand dat een exit-campagne plus respondent aanmaakt en een geldige exit-payload post; hergebruik die helpers, kopieer ze niet als ze importeerbaar zijn). Tests:

```python
from unittest.mock import patch
from datetime import date

def test_exit_submit_slaat_maand_op(client, db_session):
    respondent = _exit_respondent(db_session)               # zonder exit_month
    payload = _geldige_exit_payload(respondent.token)
    payload["exit_month"] = "2026-09"
    with patch("backend.main.today_amsterdam", return_value=date(2026, 10, 7)):
        r = client.post("/survey/submit", json=payload)
    assert r.status_code == 200
    db_session.refresh(respondent)
    assert respondent.exit_month == "2026-09"

def test_exit_submit_zonder_maand_laat_kolom_leeg(client, db_session): ...  # exit_month null -> 200, None

def test_ongeldige_maand_422_en_niets_opgeslagen(client, db_session):
    # "2026-13", "liever_niet", "2020-01" -> 422 elk; respondent.completed blijft False

def test_retention_met_maand_422(client, db_session): ...  # detail bevat "alleen bij Loep Vertrek"

def test_hr_maand_wordt_niet_overschreven(client, db_session):
    # respondent met exit_month="2026-05": post "2026-09" -> 422 "al vastgelegd"; post null -> 200 en blijft "2026-05"

```

(De template-test volgt in Taak 3.)

Schrijf elke test volledig uit (geen `...` in de echte testcode); de skeletten hierboven geven de asserts. Patch `today_amsterdam` op de plek waar `main.py` hem importeert. Als `main.py` hem nog niet importeert: voeg `today_amsterdam` toe aan de bestaande import uit `backend.survey_window`.

Pin ook de privacygrens in dezelfde file:

```python
def test_exit_month_niet_leesbaar_voor_klanten():
    from pathlib import Path
    import re
    sql = Path("migrations/2026_07_13_lock_individual_data_to_operator.sql").read_text(encoding="utf-8")
    grant = re.search(r"grant select \(([^)]*)\)\s*on public\.respondents to authenticated", sql)
    assert grant, "kolomgrant op respondents niet gevonden"
    assert "exit_month" not in grant.group(1)
```

- [ ] **Step 2: Draai, verwacht FAIL** (`exit_month` onbekend veld wordt door Pydantic genegeerd → asserts falen).

- [ ] **Step 3: Implementeer.**

`backend/schemas.py`, in `SurveySubmit` na `exit_reason_code`:
```python
    # Vertrekmaand (spec 2026-10-07 par. 1): alleen Loep Vertrek, optioneel.
    # De vorm en het venster controleert submit_survey (backend.exit_month),
    # met een leesbare 422 in plaats van een Pydantic-lijst.
    exit_month: Optional[str] = Field(None, max_length=20)
```

`backend/main.py`, `submit_survey`, direct na `scan_type = respondent.campaign.scan_type`:
```python
    # --- Vertrekmaand (spec 2026-10-07 par. 1): server valideert, weigert luid ---
    exit_month_clean: str | None = None
    if payload.exit_month is not None:
        if scan_type != "exit":
            raise HTTPException(status_code=422, detail="De vertrekmaand hoort alleen bij Loep Vertrek.")
        if respondent.exit_month:
            raise HTTPException(status_code=422, detail="De vertrekmaand is voor deze uitnodiging al vastgelegd.")
        try:
            exit_month_clean = validate_survey_exit_month(payload.exit_month, today_amsterdam())
        except ValueError as exc:
            raise HTTPException(status_code=422, detail=str(exc)) from None
```
en bij het persisten, naast `respondent.completed = True`:
```python
    if exit_month_clean:
        respondent.exit_month = exit_month_clean
```

`serve_survey`, in de context:
```python
            # Vertrekmaand: alleen bij Loep Vertrek en alleen als HR hem niet al aanleverde.
            "exit_month_options": (exit_month_options(today_amsterdam())
                                   if campaign.scan_type == "exit" and not respondent.exit_month
                                   else []),
```

- [ ] **Step 4: Draai, verwacht PASS**, plus de faalset-vergelijking van de volledige suite.

- [ ] **Step 5: Commit**

```bash
git commit -m "feat(vertrekmaand): submit valideert en bewaart de vertrekmaand, HR-waarde blijft leidend" -- backend/schemas.py backend/main.py tests/test_exit_month_submit.py
```

---

### Task 3: De vraag in de Vertrek-vragenlijst

**Files:**
- Modify: `templates/survey/exit-context.html` (na `qblock-tenure`)
- Modify: `templates/survey.html` (payload rond regel 1218)
- Test: `tests/test_exit_month_submit.py` (template-test uit Taak 2)

- [ ] **Step 1: Schrijf de falende template-test** (`test_survey_toont_vraag_alleen_bij_exit_zonder_hr_maand`): GET `/survey/{token}` voor (a) exit zonder maand: html bevat `name="exit_month"`, `In welke maand ben je vertrokken, of vertrek je?`, `Zeg ik liever niet`, en de eerste maandoptie uit `exit_month_options`; de select heeft **geen** `required`; (b) exit met HR-maand: geen `name="exit_month"`; (c) retention: geen `name="exit_month"`. Plus: geen em-dash of en-dash in het `qblock-exit-month`-blok (`"\u2013"`, `"\u2014"`).

- [ ] **Step 2: Draai, verwacht FAIL.**

- [ ] **Step 3: Implementeer.** In `exit-context.html`, direct na de afsluitende `</div>` van `qblock-tenure`:

```html
    {% if exit_month_options %}
    <div class="question-block" id="qblock-exit-month">
      <label class="field-label" for="exit_month">
        In welke maand ben je vertrokken, of vertrek je?
      </label>
      <p class="field-help">Niet verplicht. Je organisatie ziet je antwoord niet los: het rapport noemt alleen een periode, en alleen als genoeg mensen dezelfde maand kozen.</p>
      <select name="exit_month" id="exit_month">
        <option value="">Kies een maand</option>
        <option value="liever_niet">Zeg ik liever niet</option>
        {% for m in exit_month_options %}
        <option value="{{ m.value }}">{{ m.label }}</option>
        {% endfor %}
      </select>
    </div>
    {% endif %}
```
Controleer in `survey.html` welke hulptekstklasse bestaat (zoek naar de stijl van een uitleg onder een vraag, bijvoorbeeld bij de open tekst); gebruik die in plaats van `field-help` als die er is, anders voeg een kleine `.field-help`-regel toe naast de bestaande `.field-label` (zelfde kleur als `--muted`). Controleer dat `validateStep` een niet-`required` select niet afkeurt.

In `survey.html`, in `payload`:
```js
      exit_month:               data.exit_month && data.exit_month !== "liever_niet" ? data.exit_month : null,
```
Selects worden al door `saveToStorage`/`restoreFromStorage` bewaard (alle `select` met naam); controleer dat "Zeg ik liever niet" na een refresh terugkomt.

- [ ] **Step 4: Draai, verwacht PASS.** Draai ook `tests/test_survey*.py` en alles met `survey.html` in de naam.

- [ ] **Step 5: Commit**

```bash
git commit -m "feat(vertrekmaand): optionele vraag in de Vertrek-vragenlijst met 'Zeg ik liever niet'" -- templates/survey/exit-context.html templates/survey.html tests/test_exit_month_submit.py
```

---

### Task 4: Uitstroomperiode alleen met niet-herleidbare randmaanden

**Files:**
- Modify: `backend/report_html.py` (`_uitstroomperiode`, rond regel 1318)
- Test: `tests/test_uitstroomperiode.py` (nieuw; bestaande tests in `tests/test_report_leesronde_fixes.py` in lockstep)

Regel (spec par. 2): de periode verschijnt alleen als de vroegste én de laatste maand elk minstens `UITSTROOM_RAND_MIN = 2` personen hebben. Anders: geen periode, wel de reden, zonder aantallen per maand. De grens van vijf bekende maanden blijft daarbovenop. Woordkeuze: de vraag vraagt ook naar een geplande maand, dus "vertrek in/tussen" in plaats van "vertrokken in/tussen".

- [ ] **Step 1: Schrijf de falende tests**

```python
from backend.report_html import UITSTROOM_RAND_MIN, UITSTROOM_RAND_TE_KLEIN, _uitstroomperiode


def test_randen_van_twee_tonen_periode():
    maanden = ["2026-01", "2026-01", "2026-02", "2026-03", "2026-03"]
    regel, ontbreekt = _uitstroomperiode(maanden, 5)
    assert regel == "Uitstroomperiode: vertrek tussen januari 2026 en maart 2026."
    assert ontbreekt is None


def test_vroegste_maand_van_een_persoon_laat_periode_weg():
    maanden = ["2025-11", "2026-01", "2026-01", "2026-03", "2026-03", "2026-03"]
    regel, ontbreekt = _uitstroomperiode(maanden, 8)
    assert regel is None
    assert ontbreekt == UITSTROOM_RAND_TE_KLEIN


def test_laatste_maand_van_een_persoon_laat_periode_weg():
    maanden = ["2026-01"] * 4 + ["2026-04"]
    assert _uitstroomperiode(maanden, 5) == (None, UITSTROOM_RAND_TE_KLEIN)


def test_reden_noemt_geen_aantallen_of_maanden():
    assert not any(ch.isdigit() for ch in UITSTROOM_RAND_TE_KLEIN)
    for maand in ("januari", "februari", "maart", "april", "november", "december"):
        assert maand not in UITSTROOM_RAND_TE_KLEIN
    assert "\u2013" not in UITSTROOM_RAND_TE_KLEIN and "\u2014" not in UITSTROOM_RAND_TE_KLEIN


def test_een_maand_voor_iedereen():
    assert _uitstroomperiode(["2026-02"] * 5, 7)[0] == (
        "Uitstroomperiode: vertrek in februari 2026 (bij 5 van de 7 vastgelegd).")


def test_grens_van_vijf_blijft_eerst():
    regel, ontbreekt = _uitstroomperiode(["2026-01", "2026-01", "2026-02", "2026-02"], 9)
    assert regel is None and "bij 4 van de 9 vastgelegd" in ontbreekt


def test_randminimum_is_twee():
    assert UITSTROOM_RAND_MIN == 2
```

- [ ] **Step 2: Draai, verwacht FAIL** (ImportError op de nieuwe namen).

- [ ] **Step 3: Implementeer.** Boven `_uitstroomperiode`:

```python
# Spec 2026-10-07 par. 2 (besluit Lars): een periode noemt de vroegste en de
# laatste maand. HR kent die maanden en weet dus wie er in een randmaand
# vertrok; van één persoon is dat herleidbaar. Daarom pas een periode als
# beide randmaanden minstens twee personen hebben. De reden noemt bewust geen
# aantallen en geen maanden.
UITSTROOM_RAND_MIN = 2
UITSTROOM_RAND_TE_KLEIN = ("de periode van vertrek (de vroegste of de laatste opgegeven maand "
                           "is door te weinig mensen gekozen om die te noemen zonder dat "
                           "iemand herkenbaar wordt)")
```

In de functie, na de `bekend < MIN_SEGMENT_N`-tak:
```python
    per_maand = Counter(maanden)
    if per_maand[maanden[0]] < UITSTROOM_RAND_MIN or per_maand[maanden[-1]] < UITSTROOM_RAND_MIN:
        return None, UITSTROOM_RAND_TE_KLEIN
```
(`Counter` is al geïmporteerd in `report_html.py`; controleer dat.) Vervang `"Uitstroomperiode: vertrokken in "` en `"Uitstroomperiode: vertrokken tussen "` door `"Uitstroomperiode: vertrek in "` en `"Uitstroomperiode: vertrek tussen "`.

Herschrijf de docstring: de randregel beschermt nu wél de randen (HR kan een randmaand niet meer aan één persoon koppelen); de alinea "Privacy, eerlijk gezegd: die grens beschermt de randen NIET ... een keuze voor Lars" gaat weg en wordt een korte uitleg van de regel met verwijzing naar de spec. Noem eerlijk wat de regel niet doet: een maand binnen de periode kan nog steeds van één persoon zijn, maar die maand staat niet in het rapport.

- [ ] **Step 4: Draai** `tests/test_uitstroomperiode.py tests/test_report_leesronde_fixes.py`. Werk tests in `test_report_leesronde_fixes.py` die "vertrokken in/tussen" pinnen bij naar "vertrek in/tussen" en controleer dat hun data de randregel haalt (bijv. `["2025-03"] * 10 + ["2026-02"] * 10` haalt hem). Een test die door de randregel van uitkomst wisselt: pas de **data** aan zodat hij bedoelt wat hij testte, niet de regel.

- [ ] **Step 5: Commit**

```bash
git commit -m "feat(rapport): uitstroomperiode alleen als beide randmaanden minstens twee personen hebben" -- backend/report_html.py tests/test_uitstroomperiode.py tests/test_report_leesronde_fixes.py
```

---

### Task 5: Vertrekmaanden in de stresstest en het Vertrek-voorbeeld

**Files:**
- Modify: `scripts/stresstest_report.py` (`Scenario`, `SCENARIOS`, `run_scenario`)
- Modify: `generate_voorbeeldrapport.py` (respondenten van de exit-configuratie)
- Test: `tests/test_stresstest_exit_months.py` (nieuw)

Waarom: zonder vertrekmaanden in de data meet het productie-image de nieuwe regel op pagina twee nergens. Scenario 08 heeft de krapste pagina twee (27pt); twee nieuwe scenario's op hetzelfde profiel meten de regel met en zonder periode. **Bestaande scenario's veranderen niet** (geen extra `rng`-aanroep).

- [ ] **Step 1: Schrijf de falende test**

```python
import importlib.util
from pathlib import Path


def _harnas():
    spec = importlib.util.spec_from_file_location("stresstest_report", Path("scripts/stresstest_report.py"))
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod


def test_twee_nieuwe_vertrekscenarios_met_maanden():
    st = _harnas()
    per_key = {sc.key: sc for sc in st.SCENARIOS}
    met = per_key["21_exit_uitstroom"]
    rand = per_key["22_exit_uitstroom_rand"]
    assert len(met.exit_months) == met.n == 12 and len(rand.exit_months) == rand.n == 12
    for sc in (met, rand):
        assert sc.scan_type == "exit" and sc.factors == per_key["08_exit_n12"].factors


def test_bestaande_scenarios_zonder_maanden():
    st = _harnas()
    for sc in st.SCENARIOS:
        if not sc.key.startswith(("21_", "22_")):
            assert sc.exit_months == ()


def test_scenario_21_toont_periode_en_22_niet():
    st = _harnas()
    per_key = {sc.key: sc for sc in st.SCENARIOS}
    html21 = st.run_scenario(per_key["21_exit_uitstroom"])["html"]
    html22 = st.run_scenario(per_key["22_exit_uitstroom_rand"])["html"]
    assert "Uitstroomperiode: vertrek tussen januari 2026 en april 2026" in html21
    assert "Uitstroomperiode" not in html22
    assert "door te weinig mensen gekozen" in html22
```

Controleer eerst wat `run_scenario` teruggeeft (zoek de `return` aan het einde); pas de toegang tot de html aan als de sleutel anders heet. Als `run_scenario` naar schijf schrijft, test op het geschreven bestand in een `tmp_path` of lees het terug; schrijf nooit naar `frontend/public/examples`.

- [ ] **Step 2: Draai, verwacht FAIL.**

- [ ] **Step 3: Implementeer.** In `Scenario` een veld `exit_months: tuple[str | None, ...] = ()` (per respondent op volgorde; `None` = niet opgegeven). Twee scenario's direct na `08_exit_n12`, met precies dezelfde `factors`, `n=12`, `invited=19` en `depts` als 08:

```python
    Scenario("21_exit_uitstroom", "Vertrek, n=12, met vertrekmaanden",
             "Als 08, met vertrekmaanden: randmaanden van twee, dus de periode staat op pagina twee.",
             scan_type="exit", n=12, invited=19, factors=<zelfde dict als 08>,
             depts=<zelfde als 08>,
             exit_months=("2026-01", "2026-01", "2026-02", "2026-02", "2026-02", "2026-03",
                          "2026-03", "2026-03", "2026-04", "2026-04", None, None)),
    Scenario("22_exit_uitstroom_rand", "Vertrek, n=12, randmaand van één persoon",
             "Als 21, maar de vroegste maand is van één persoon: de periode valt weg.",
             scan_type="exit", n=12, invited=19, factors=<zelfde dict als 08>,
             depts=<zelfde als 08>,
             exit_months=("2025-11", "2026-01", "2026-01", "2026-02", "2026-02", "2026-02",
                          "2026-03", "2026-03", "2026-03", "2026-04", "2026-04", None)),
```
Haal het 08-profiel naar een module-constante (`VERTREK_12 = {...}`, `VERTREK_12_DEPTS = [...]`) zodat 08, 21 en 22 er alle drie naar verwijzen; 08 zelf verandert inhoudelijk niet. In `run_scenario`, bij `Respondent(...)`: `exit_month=(sc.exit_months[i] if i < len(sc.exit_months) else None)`. Geen `rng`-aanroep toevoegen.

In `generate_voorbeeldrapport.py`, bij het aanmaken van respondenten voor de exit-configuratie: geef een vaste, deterministische lijst vertrekmaanden mee op index (geen `random`-aanroep, zodat de rest van het voorbeeld niet verschuift), met beide randmaanden minstens twee keer en een paar keer `None` (overgeslagen of "Zeg ik liever niet"), in de maanden vóór de sluitdatum van de voorbeeldmeting. Controleer na het genereren dat de regel "Uitstroomperiode: vertrek tussen ..." in `docs/examples/voorbeeldrapport_loep.html` staat. Commit de gegenereerde voorbeelden nog niet (Taak 12).

- [ ] **Step 4: Draai** de nieuwe test en `$PY scripts/stresstest_report.py 08 21 22`; zet `docs/examples` en `frontend/public/examples` terug met `git checkout --` als ze gewijzigd zijn.

- [ ] **Step 5: Commit**

```bash
git commit -m "test(stresstest): vertrekmaanden in twee nieuwe scenario's en in het Vertrek-voorbeeld" -- scripts/stresstest_report.py generate_voorbeeldrapport.py tests/test_stresstest_exit_months.py
```

---

### Task 6: Richtingstaat op de inhoudelijke stemmen

**Files:**
- Modify: `backend/products/shared/deepening.py` (`direction_state`, rond regel 1173)
- Test: `tests/test_direction_state_inhoudelijk.py` (nieuw); bestaande richtingtests in lockstep

Regel (spec par. 3): "Niets, dit zit hier goed" telt niet mee bij het bepalen van een eenduidige richting. Nieuwe evaluatievolgorde:

1. `too_few`: `n < DIRECTION_MIN_N` (op alle beantwoorders, ongewijzigd).
2. `none_needed`: `none_n / n > 0.5` (ongewijzigd).
3. Geen veranderoptie gekozen → `divided` (ongewijzigd).
4. Grootste veranderoptie is `*_other` → `divided` (ongewijzigd).
5. `split_none` met de bestaande voorwaarde (score onder `DIRECTION_SPLIT_NONE_MAX_SCORE`, `none_n >= change_top - 1`) → **nu vóór** clear.
6. `clear`: `change_n >= DIRECTION_MIN_N`, `change_top / change_n >= 0.5` en `change_top - tweede_verandering >= TOP_CHOICE_MIN_LEAD`.
7. `plurality`: `change_top / change_n >= DIRECTION_PLURALITY_MIN_SHARE` en `change_top - tweede_verandering >= TOP_CHOICE_MIN_LEAD`.
8. Anders `divided`.

`change_n = n - none_n` (alle beantwoorders minus de niets-stemmen; een `answered`-rij zonder keuze telt zo als inhoudelijk mee in de noemer, wat de drempel alleen strenger maakt, dezelfde veilige kant als nu). `tweede_verandering` = de op één na grootste telling onder de veranderopties (incl. `*_other`), 0 als die er niet is.

Bewijsbare eigenschap: een staat kan alleen "omhoog": `divided → plurality`, `divided → clear`, `plurality → clear`, of gelijk blijven. `clear` van nu blijft `clear` (bij `top/n >= 0.5` met voorsprong 2 op alle opties, ook de niets-optie, is `none_n <= top - 2`, dus de split_none-voorwaarde kan niet gelden). Die eigenschap is de kern van de test.

Retourwaarde krijgt één extra sleutel `change_n`; `top_key`/`top_n`/`second_n` in `clear` en `plurality` verwijzen naar de veranderopties.

- [ ] **Step 1: Schrijf de falende tests**

```python
import itertools
import random

import pytest

from backend.products.shared import deepening as dp

FK = "growth"


def _oud(agg, factor_key, factor_score):
    """De staat zoals op main (91ecfd14), letterlijk overgenomen als referentie."""
    # Kopieer hier de body van direction_state van main, zonder logging.
    ...


def _agg(counts):
    return {"answered": sum(counts.values()), "counts": dict(counts)}


def _opties():
    texts = dp.direction_option_texts("retention", FK)
    none_key = next(k for k in texts if k.endswith("_none"))
    other_key = next(k for k in texts if k.endswith("_other"))
    gewoon = [k for k in texts if k not in (none_key, other_key)]
    return none_key, other_key, gewoon


def test_motiverend_geval_vertrek_voorbeeld():
    # 4 van de 5 die iets wilden kozen hetzelfde, 3 kozen niets: nu clear.
    none_key, _o, (a, b, *_r) = _opties()
    st = dp.direction_state(_agg({a: 4, b: 1, none_key: 3}), FK, 6.2)
    assert st["state"] == "clear" and st["top_key"] == a
    assert st["top_n"] == 4 and st["change_n"] == 5 and st["none_n"] == 3 and st["n"] == 8


def test_meerderheid_niets_blijft_none_needed():
    none_key, _o, (a, *_r) = _opties()
    assert dp.direction_state(_agg({none_key: 5, a: 4}), FK, 6.0)["state"] == "none_needed"


def test_split_none_gaat_voor_clear():
    none_key, _o, (a, *_r) = _opties()
    st = dp.direction_state(_agg({a: 4, none_key: 4}), FK, 4.5)
    assert st["state"] == "split_none"


def test_vloer_op_inhoudelijke_stemmen():
    none_key, _o, (a, *_r) = _opties()
    # n=4, none 2, a 2: change_n 2 < 3, dus geen clear
    assert dp.direction_state(_agg({a: 2, none_key: 2}), FK, 6.0)["state"] == "divided"


def test_plurality_op_inhoudelijke_stemmen():
    none_key, _o, (a, b, c, d, *_r) = _opties()
    # n=12, change_n=8, a 4/8 = 0,5 met voorsprong 2 op b: clear (oud: 4/12 = 0,33 -> divided)
    assert dp.direction_state(_agg({a: 4, b: 2, c: 2, none_key: 4}), FK, 6.5)["state"] == "clear"
    # n=13, change_n=10, a 4/10 = 0,4 (< 0,5, >= 0,35), voorsprong 2: plurality (oud: 4/13 -> divided)
    st = dp.direction_state(_agg({a: 4, b: 2, c: 2, d: 2, none_key: 3}), FK, 6.5)
    assert st["state"] == "plurality" and st["second_n"] == 2
    # n=12, change_n=9, a 4/9 = 0,44, voorsprong 1 op b: divided
    assert dp.direction_state(_agg({a: 4, b: 3, c: 2, none_key: 3}), FK, 6.5)["state"] == "divided"


_TOEGESTAAN = {("divided", "plurality"), ("divided", "clear"), ("plurality", "clear")}


def test_staten_gaan_alleen_omhoog():
    none_key, other_key, gewoon = _opties()
    sleutels = gewoon[:3] + [none_key, other_key]
    rng = random.Random(20261007)
    gezien = set()
    for _ in range(20000):
        counts = {k: rng.randint(0, 6) for k in sleutels}
        counts = {k: v for k, v in counts.items() if v}
        if not counts:
            continue
        score = rng.choice([None, 3.9, 4.9, 5.0, 6.4, 8.1])
        oud = _oud(_agg(counts), FK, score)["state"]
        nieuw = dp.direction_state(_agg(counts), FK, score)["state"]
        if oud != nieuw:
            assert (oud, nieuw) in _TOEGESTAAN, (counts, score, oud, nieuw)
            gezien.add((oud, nieuw))
    assert ("divided", "clear") in gezien
```

Vul `_oud` met de **letterlijke** body van `direction_state` zoals hij nu op main staat (kopieer hem uit `git show main:backend/products/shared/deepening.py`, verwijder alleen de `logger`-regels). Dit is de enige plek in het plan waar `...` staat: de inhoud is die bestaande functie. Reken elke verwachting met de hand na en zet de som als commentaar bij de assert.

- [ ] **Step 2: Draai, verwacht FAIL.**

- [ ] **Step 3: Implementeer** `direction_state` volgens de volgorde hierboven. Houd de `*_other`-logwaarschuwing (top van **alle** opties, zoals nu). Werk de docstring bij: noem de nieuwe volgorde, `change_n`, en de reden (besluit Lars 7-10, spec par. 3): wie niets wil, zegt dat er geen richting nodig is, en dat telt al in `none_needed` en `split_none`; de keuze tussen routes maken alleen de mensen die er een kozen. Pas het commentaar bij `DIRECTION_PLURALITY_MIN_SHARE` en bij de "Grootste groep zonder meerderheid"-tak aan: de voorsprong wordt nu tegen de andere **veranderopties** gemeten.

- [ ] **Step 4: Draai** de nieuwe test plus alles met richting: `$PY -m pytest tests -q -p no:cacheprovider -k "direction or richting or plurality or split_none"`. Elke bestaande test die nu een andere staat krijgt: controleer per test met de hand of de nieuwe staat volgt uit de regel. Zo ja: pas de verwachting aan en zet in de test een commentaar `# Spec 2026-10-07 par. 3: niets telt niet mee; was <oude staat>`. Zo nee: stop en meld het. **Wijzig nooit een drempel om een test groen te krijgen.** Noteer elke aangepaste test (naam, oud, nieuw) in je rapport aan de controller.

- [ ] **Step 5: Commit**

```bash
git commit -m "feat(richting): eenduidige richting bepaald op de stemmen van wie iets wil" -- backend/products/shared/deepening.py tests/test_direction_state_inhoudelijk.py <aangepaste testbestanden>
```

---

### Task 7: Niets-stemmen apart gemeld op de kaart, pagina twee en in de methodiek

**Files:**
- Modify: `backend/report_html.py` (`_direction_card_cell` rond regel 3235, `_direction_p02_line` rond regel 3964, `DIRECTION_HEAD_PLURALITY`, methodiekcel "Richtingvraag" rond regel 4549)
- Test: `tests/test_direction_niets_apart.py` (nieuw)

Sinds Taak 6 kan `clear` of `plurality` gelden terwijl een deel "niets" koos. De kaart moet dan zeggen op welke noemer de richting rust en hoeveel mensen niets kozen; anders leest "Volgens 4 van de 8" naast een tabel met 3 niets-stemmen als een rekenfout. Bij `none_n == 0` verandert er **niets** aan de bestaande zinnen.

Exacte copy (`{opt_niets}` = de niets-optietekst uit `direction_option_texts`, dus voor Loep Vertrek "Niets, dit zat hier goed"):

- Kaart `clear`, `none_n > 0`, bronregel:
  `Volgens {_telling(top_n, change_n)} die om verandering vroegen; {_tel(none_n, 'koos', 'kozen')} ‘{opt_niets}’. {_dir_noemer_zin(n, label)}`
  Voorbeeld: "Volgens 4 van de 5 die om verandering vroegen; 3 kozen ‘Niets, dit zat hier goed’. Die 8 zijn de mensen bij wie groeiperspectief het laagst scoorde en die de vraag beantwoordden."
- Kaart `plurality`, `none_n > 0`:
  kop `DIRECTION_HEAD_PLURALITY_VERANDERING = "Van wie om verandering vroeg, kiest de grootste groep ‘{opt}’, zonder meerderheid."`;
  bronregel `{_telling(top_n, change_n)} die om verandering vroegen, kozen die richting{tweede}; {_tel(none_n, 'koos', 'kozen')} ‘{opt_niets}’. {_dir_noemer_zin(n, label)} Wat er volgens de grootste groep moet gebeuren: {imperative}`
  waarbij `{tweede}` de grootste **andere veranderoptie** is (niet de niets-optie): `"; {_tel(c, 'koos', 'kozen')} ‘{opt}’"`, of leeg.
- Kaart `plurality`, `none_n == 0`: ongewijzigd, maar `{tweede}` komt voortaan ook uit de veranderopties (bij `none_n == 0` is dat dezelfde rij als nu).
- Pagina twee `clear`, `none_n > 0`:
  `Wat er moet gebeuren volgens {_telling(top_n, change_n)} die om verandering vroegen: {imperative} {_tel(none_n, 'vindt', 'vinden')} dat hier niets hoeft.`
- Pagina twee `plurality`, `none_n > 0`:
  `Wat er moet gebeuren volgens de grootste groep van wie om verandering vroeg, {_telling(top_n, change_n)}, zonder meerderheid: {imperative} {_tel(none_n, 'vindt', 'vinden')} dat hier niets hoeft.`
- Methodiekcel "Richtingvraag": voeg na "geen advies van Loep." in: `‘Niets, dit zit hier goed’ telt niet als richting: of er een eenduidige richting is, bepalen de mensen die om verandering vroegen; hoeveel mensen niets kozen, staat er apart bij.` Bij Loep Vertrek de verleden-tijdtekst van de niets-optie (haal hem uit `direction_option_texts`, niet hardcoden; neem de eerste factor als bron, de tekst is per scan gelijk; controleer dat met een assert in de test).

`imperative` eindigt al op een punt; controleer dat er nooit ".." of ". ." ontstaat.

- [ ] **Step 1: Schrijf de falende tests.** Bouw `agg`-dicts met de hand (zoals in Taak 6) en roep `_direction_card_cell("startpunt", label="Groeiperspectief", agg=..., scan_type=..., factor_key="growth", n_total=..., factor_score=6.2)` en `_direction_p02_line(...)` aan. Asserts: de exacte zinnen hierboven voor `retention` en `exit` (verleden tijd van de niets-optie), `none_n == 0` geeft de oude tekst byte voor byte (vergelijk met de uitvoer van de functie op main: zet de verwachte string letterlijk in de test), geen `..`, geen em/en-dash, en elk getal in de bronregel is terug te vinden in de verdelingstabel van dezelfde kaart (`change_n + none_n == n`). Test de methodiekcel via de functie die `cells_r4` bouwt (zoek de omsluitende functie).

- [ ] **Step 2: Draai, verwacht FAIL.**

- [ ] **Step 3: Implementeer** de takken. Lees `change_n` uit de staat (Taak 6). Laat de `divided`-, `split_none`-, `none_needed`- en `too_few`-takken ongemoeid.

- [ ] **Step 4: Draai** de nieuwe test, `tests/test_report_leesronde_fixes.py` en alle tests met `direction`/`richting`/`p02` in de naam; daarna de volledige suite en de faalset-vergelijking.

- [ ] **Step 5: Commit**

```bash
git commit -m "feat(rapport): richtingkaart en pagina twee melden de niets-stemmen apart" -- backend/report_html.py tests/test_direction_niets_apart.py <aangepaste testbestanden>
```

---

### Task 8: Geen "hierboven" meer na een mogelijke paginabreuk

**Files:**
- Modify: `backend/products/shared/deepening.py` (`WORK_QUESTION_VARIANTS["divided"]`, rond regel 815)
- Modify: `backend/report_html.py` (`_richtingen_weging`, rond regel 3499)
- Test: `tests/test_geen_hierboven.py` (nieuw); `tests/test_report_leesronde_fixes.py` regels 1020-1040 in lockstep

Vervang:
- `"de verdeling staat hierboven."` door `"de verdeling staat bij ‘Wat er moet gebeuren’."` (beide scans);
- `" op de kaart hierboven."` in `_richtingen_weging` door `" op de kaart bij ‘Wat er moet gebeuren’."`.

Gebruik dezelfde typografische aanhalingstekens (‘ en ’) als de rest van de copy.

Inventaris (verplicht, in je rapport aan de controller): zoek alle **klantzichtbare** strings (geen commentaar, geen docstring) met `boven` in `backend/report_html.py` en `backend/products/shared/deepening.py`:
```bash
grep -n "boven" backend/report_html.py backend/products/shared/deepening.py
```
Per treffer: vervangen, of laten staan met het bewijs dat verwijzing en doel op dezelfde pagina blijven (bijv. beide op pagina twee, die `p02-op-een-a4` in `check_pdf_report.py` op één A4 houdt; of beide in dezelfde ondeelbare tabelcel; controleer `break-inside` in `backend/report_css.py`). Bekende kandidaten: "Open met de gespreksopener hierboven." en "cijfers hierboven voor" (pagina twee), "de meetperiode hierboven" (`_uitstroomperiode`, pagina twee), "sluit daarom niet op de verdeling hierboven" (`_direction_chain`, zelfde kaartcel). "Afdelingen met ... boven de" e.d. zijn geen verwijzing.

- [ ] **Step 1: Schrijf de falende test**

```python
from backend.products.shared.deepening import WORK_QUESTION_VARIANTS


def test_verdeeld_zin_verwijst_naar_het_blok():
    for scan, zin in WORK_QUESTION_VARIANTS["divided"].items():
        assert "hierboven" not in zin
        assert "bij ‘Wat er moet gebeuren’" in zin


def test_weging_verwijst_naar_het_blok():
    # bouw een divided-staat met twee inhoudelijke routes en roep _richtingen_weging aan
    ...
    assert "hierboven" not in zin and "op de kaart bij ‘Wat er moet gebeuren’" in zin
```
Schrijf de tweede test volledig uit met een echte staat uit `direction_state`.

- [ ] **Step 2: FAIL.** **Step 3: Implementeer** en werk de vier asserts in `tests/test_report_leesronde_fixes.py` (rond 1020-1040) bij. Zoek ook naar content-guardtests die de verdeeld-zin letterlijk pinnen (`grep -rn "verdeling staat" tests`). **Step 4: PASS** plus volledige suite.

- [ ] **Step 5: Commit**

```bash
git commit -m "fix(rapport): verwijzingen naar de richtingkaart zonder 'hierboven'" -- backend/products/shared/deepening.py backend/report_html.py tests/test_geen_hierboven.py tests/test_report_leesronde_fixes.py
```

---

### Task 9: Omvanglabels zonder overlap

**Files:**
- Modify: `frontend/lib/pricing.ts` (`PRICING_ABOVE_LABEL`, regel 46)
- Modify: `frontend/public/llms.txt` (regel 31-32)
- Modify: `frontend/lib/lead-headcount.ts` (commentaar)
- Test: `frontend/lib/pricing.test.ts`, `frontend/lib/contact-size-options.test.ts`, `frontend/lib/lead-headcount.test.ts`, `frontend/lib/site-ronde-besluit-a.guard.test.ts`

Labels (spec par. 5): "Minder dan 150 medewerkers", "150 tot 400 medewerkers", "400 tot 1.000 medewerkers", "1.000 of meer medewerkers". Alleen het laatste verandert. Contactformulier, OfferCatalog-JSON-LD en de prijs-FAQ volgen vanzelf uit `pricing.ts`. Opgeslagen leads met "Boven 1.000 medewerkers" blijven vrije tekst en blijven leesbaar.

- [ ] **Step 1: Pas de tests aan (falend)**: `pricing.test.ts` verwacht `'1.000 of meer medewerkers'` en `'1.000 of meer medewerkers op aanvraag'`; `contact-size-options.test.ts` de nieuwe lijst; `site-ronde-besluit-a.guard.test.ts` verwacht in llms.txt `'1.000 of meer medewerkers op aanvraag'`; `lead-headcount.test.ts` krijgt `expect(estimateHeadcount('1.000 of meer medewerkers')).toBe(1000)` erbij en **houdt** de test op `'Boven 1.000 medewerkers'` (oude waarde blijft leesbaar). Voeg in `contact-size-options.test.ts` toe: geen label bevat "Boven" of "Tot " aan het begin, en elke grens (150, 400, 1.000) komt in precies één label als ondergrens voor ("150 tot", "400 tot", "1.000 of meer").

- [ ] **Step 2:** `cd frontend && npx vitest run lib/pricing.test.ts lib/contact-size-options.test.ts lib/lead-headcount.test.ts lib/site-ronde-besluit-a.guard.test.ts` → FAIL.

- [ ] **Step 3: Implementeer**: `PRICING_ABOVE_LABEL = '1.000 of meer medewerkers'`; llms.txt `boven 1.000 medewerkers op aanvraag` → `1.000 of meer medewerkers op aanvraag`; commentaar in `lead-headcount.ts` noemt beide vormen. Zoek daarna in `frontend/` (zonder `node_modules`, `.next`, `public/examples`) naar `Boven 1.000` en `boven 1.000` in gerenderde copy en werk ze bij.

- [ ] **Step 4: PASS**; daarna volledige `npx vitest run` met faalset-vergelijking tegen `docs/superpowers/plans/vervolgronde-vitest-baseline-fails.txt` (zelfde JSON-reporter-recept als de controller: `npx vitest run --reporter=json --outputFile=<tmp>.json`, dan per testnaam vergelijken) en `npx tsc --noEmit` (131).

- [ ] **Step 5: Commit**

```bash
git commit -m "feat(site): omvangvak '1.000 of meer medewerkers', geen overlap meer op 1.000" -- frontend/lib/pricing.ts frontend/public/llms.txt frontend/lib/lead-headcount.ts frontend/lib/pricing.test.ts frontend/lib/contact-size-options.test.ts frontend/lib/lead-headcount.test.ts frontend/lib/site-ronde-besluit-a.guard.test.ts
```

---

### Task 10: Besluitvelden begrensd op wat de PDF toont, met teller

**Files:**
- Modify: `frontend/lib/dashboard/campaign-decision.ts` (`DECISION_LIMITS`, regel 26; melding in `validateDecisionInput`)
- Modify: `frontend/components/dashboard/decision-block.tsx`
- Test: `frontend/lib/dashboard/campaign-decision.test.ts`, `frontend/components/dashboard/decision-block.guard.test.ts`, `tests/test_besluit_limiet_pin.py` (nieuw, backend)

Regel (spec par. 6): `action` en `text` naar 240 = `BESLUIT_TEKST_MAX`. `topic` en `owner` blijven 120 (de PDF kort die niet in; gemeten in de fixronde). Een zichtbare teller bij de vier lange velden (Wat precies, Wat precies bij het tweede punt, De terugkoppeling, Waaraan jullie zien dat het werkt). Bestaande langere besluiten: de database en de PDF blijven ongemoeid (de PDF toont ze zoals nu, met `BESLUIT_INGEKORT`); het dashboard toont de volledige tekst, de teller kleurt rood en zegt dat het te lang is, en opslaan weigert met een melding die de lengte noemt. **Nooit stil afkappen.**

- [ ] **Step 1: Schrijf de falende tests**

Backend pin (`tests/test_besluit_limiet_pin.py`):
```python
import re
from pathlib import Path

from backend.report_html import BESLUIT_TEKST_MAX


def test_dashboardlimiet_gelijk_aan_pdf():
    src = Path("frontend/lib/dashboard/campaign-decision.ts").read_text(encoding="utf-8")
    m = re.search(r"DECISION_LIMITS = \{ topic: (\d+), owner: (\d+), action: (\d+), text: (\d+) \}", src)
    assert m, "DECISION_LIMITS niet gevonden in de vaste vorm"
    assert int(m.group(3)) == BESLUIT_TEKST_MAX
    assert int(m.group(4)) == BESLUIT_TEKST_MAX
```

Frontend: in `campaign-decision.test.ts` de grenswaardetests laten lopen op de nieuwe waarden (ze gebruiken `DECISION_LIMITS` al); plus een test dat een veld van 600 tekens geweigerd wordt met `Wat precies is te lang voor het rapport (maximaal 240 tekens, nu 600).`. In `decision-block.guard.test.ts` (leest de bron): de vier lange velden hebben een tellerelement met `aria-live="polite"` en de tekst `/ ${DECISION_LIMITS...}`-vorm, en het component gebruikt geen `slice(0,` of `substring(0,` op een veldwaarde (geen stille afkap).

- [ ] **Step 2: FAIL** (backend én vitest).

- [ ] **Step 3: Implementeer**
  - `DECISION_LIMITS = { topic: 120, owner: 120, action: 240, text: 240 } as const` met commentaar: gelijk aan `BESLUIT_TEKST_MAX` in `backend/report_html.py`, gepind door `tests/test_besluit_limiet_pin.py`.
  - In `validateDecisionInput`: voor velden met `max === DECISION_LIMITS.action || max === DECISION_LIMITS.text` de melding `${label} is te lang voor het rapport (maximaal ${max} tekens, nu ${lengte}).`; voor `topic`/`owner` de bestaande melding. Werk de bestaande tests die de oude melding voor de lange velden pinnen bij.
  - In `decision-block.tsx`: een klein `CharCount`-component (in hetzelfde bestand) dat `lengte / max` toont, met `aria-live="polite"`, en bij `lengte > max` in de foutkleur van het dashboard `Te lang voor het rapport: kort in tot ${max} tekens.`. Houd de textarea's ongecontroleerd (`defaultValue`), volg de lengte met een `useState` per veld, beginwaarde uit `decision`, bijgewerkt in `onChange`. Laat `maxLength` op de textarea staan (voorkomt groei; een bestaande langere tekst blijft zichtbaar en inkortbaar). Koppel de teller via `aria-describedby` naast de bestaande hint-id.

- [ ] **Step 4: PASS**; volledige vitest-faalset, `tsc` 131, en `$PY -m pytest tests/test_besluit_limiet_pin.py tests/test_report_besluitpagina.py -q -p no:cacheprovider`. Controleer dat `scripts/render_besluit_max.py` de limieten nog uit `DECISION_LIMITS` leest en niet stukloopt (`$PY scripts/render_besluit_max.py --help` of de droge run die het script biedt).

- [ ] **Step 5: Commit**

```bash
git commit -m "feat(dashboard): besluitvelden op 240 tekens met teller, gelijk aan de PDF" -- frontend/lib/dashboard/campaign-decision.ts frontend/components/dashboard/decision-block.tsx frontend/lib/dashboard/campaign-decision.test.ts frontend/components/dashboard/decision-block.guard.test.ts tests/test_besluit_limiet_pin.py
```

---

### Task 11: Gebruiksgegevens zonder meting na twee jaar weg

**Files:**
- Modify: `backend/data_retention.py`
- Test: `tests/test_data_retention_gebruik.py` (nieuw)

Regel (spec par. 7): rijen in `suite_telemetry_events` en `case_proof_registry` met `campaign_id is null` worden verwijderd 24 maanden na `created_at` (NL-kalenderdag, dezelfde `_sluitdag`/`_plus_maanden`/`_termijn_verstreken` en `VOORUITBLIK_MAANDEN` als leads). Dezelfde regels als de rest:
- dry-run standaard (`_alleen_lezen` op Postgres);
- **eenheid = tabel**: per tabel één transactie die de verlopen id's selecteert (op Postgres `for update`) en ze verwijdert met in de `where` opnieuw `campaign_id is null` (hercontrole);
- tweede run doet niets;
- alleen in de periodieke run (niet bij `--campagne`/`--organisatie`), net als leads en dossiers;
- uitvoer alleen tabelnamen en aantallen;
- ontbrekende tabel: `LET OP` en overslaan (niet rood, zoals bij contacten); tabel zonder `id`, `campaign_id` of `created_at`: `LET OP`, overslaan, **rood**; een rij zonder `created_at`: niet geraakt, telt als `zonder datum`, **rood**; een fout: die tabel teruggedraaid, **rood**;
- de samenvatting van de metingen blijft de laatste regel (Deel C.3); de nieuwe samenvatting staat direct na die van leads en dossiers.

Uitvoerformaat:
```
GEBRUIK        tabel=suite_telemetry_events zonder meting: verlopen=3 binnen_termijn=10 zonder_datum=0 | dry-run: niets gewijzigd
SAMENVATTING GEBRUIKSGEGEVENS ZONDER METING (dry-run): suite_telemetry_events: 3 verlopen, 0 verwijderd, 10 binnen de termijn, 0 zonder datum; case_proof_registry: 0 verlopen, 0 verwijderd, 2 binnen de termijn, 0 zonder datum.
```
Met `--apply` wordt "dry-run: niets gewijzigd" → "verwijderd=3" en "(dry-run)" → "(opgeschoond)".

- [ ] **Step 1: Schrijf de falende tests.** Volg het opzetpatroon van `tests/test_data_retention.py` rond regel 689 (daar worden beide tabellen op SQLite aangemaakt met `create table ...`) en van `tests/test_data_retention_contacten.py` (sessiefabriek, `main([...], session_factory=..., vandaag=...)`, uitvoer via `capsys`). Maak de tabellen hier met kolommen `id`, `campaign_id`, `created_at` (plus wat de bestaande test gebruikt). Tests:
  1. dry-run: een rij zonder meting van 25 maanden oud wordt geteld als verlopen, niets verwijderd, exitcode 0;
  2. `--apply`: die rij weg, een rij van 23 maanden blijft, een rij **met** `campaign_id` van 30 maanden blijft (die hoort bij de meting en haar eigen termijn), exitcode 0;
  3. tweede `--apply`: 0 verlopen, 0 verwijderd;
  4. grens: `created_at` precies op de dag dat 24 maanden min `VOORUITBLIK_MAANDEN` verstrijkt, volgens dezelfde rekenregel als leads (leid de verwachte datum af met `_plus_maanden` en `_termijn_verstreken`, niet met een eigen som);
  5. een rij met `created_at` NULL: niet geraakt, `zonder_datum=1`, exitcode 1;
  6. tabel ontbreekt: `LET OP`-regel, exitcode 0, de andere tabel wordt wel opgeschoond;
  7. tabel zonder `created_at`-kolom: `LET OP`, exitcode 1;
  8. fout tijdens verwijderen (monkeypatch de delete zodat hij een exception gooit): die tabel teruggedraaid (rij staat er nog), andere tabel opgeschoond, exitcode 1, foutregel zonder rij-inhoud;
  9. `--campagne <uuid>`: geen GEBRUIK-regels;
  10. de laatste uitvoerregel begint nog steeds met `SAMENVATTING (`.

- [ ] **Step 2: FAIL.**

- [ ] **Step 3: Implementeer** met een dataclass `Gebruiksregel(tabel, status, verlopen=0, binnen_termijn=0, zonder_datum=0, verwijderd=0, fout="")`, een functie `opschonen_gebruik(session_factory, *, vandaag, apply) -> list[Gebruiksregel]`, `_gebruik_regel(r, apply)` en `_gebruik_samenvatting(regels, apply)`, en de aanroep in `main` direct na de contacten. Lees `created_at` met dezelfde typering als de leads (`_q`/`_tijden_kolommen`, zodat SQLite-tekst een datetime wordt); verwijder in blokken van 500 id's met een `expanding` bindparam (`bindparam("ids", expanding=True)`), zodat een grote tabel geen enorme SQL oplevert. Controleer in `migrations/2026_09_24_add_data_retention.sql` dat de `*_purged_guard_trg`-triggers op deze twee tabellen een DELETE van een rij zonder `campaign_id` niet tegenhouden, en schrijf je conclusie (met regelnummer) in je rapport; draai daarvoor niets tegen een echte database. Werk de docstringtabel bovenaan bij (twee rijen: "zonder meting: verwijderd 24 maanden na aanmaken") en de `--help`-beschrijving.

- [ ] **Step 4: PASS**; plus alle `tests/test_data_retention*.py` en de faalset-vergelijking. Lokale droge run op een lege wegwerp-SQLite: `DATABASE_URL=sqlite:////c/Users/larsh/AppData/Local/Temp/loep-vervolgronde/leeg.db $PY -m backend.data_retention` (verwacht exit 0, LET OP-regels voor ontbrekende tabellen). **Nooit** een andere `DATABASE_URL`.

- [ ] **Step 5: Commit**

```bash
git commit -m "feat(opschoning): telemetrie en bewijsregister zonder meting na twee jaar verwijderd" -- backend/data_retention.py tests/test_data_retention_gebruik.py
```

---

### Task 12: Eindmeting, browsercheck en verslag (controller, met één implementer voor de renders)

- [ ] **Step 1: Gates.** Volledige backend-suite met faalset-vergelijking (`GEEN_REGRESSIES` verwacht), `tests/test_python311_syntax_guard.py` groen, `npx tsc --noEmit` (131), `npx vitest run` met faalset-vergelijking, frontend-build met dummy's alleen in de shell:
```bash
cd frontend && RESEND_API_KEY=re_dummy_build_only NEXT_PUBLIC_SUPABASE_URL=https://dummy.supabase.co NEXT_PUBLIC_SUPABASE_ANON_KEY=dummy npm run build
```

- [ ] **Step 2: Richtingstaten na.**
```bash
$PY scripts/stresstest_report.py
$PY generate_voorbeeldrapport.py exit && $PY generate_voorbeeldrapport.py retention && $PY generate_voorbeeldrapport.py onboarding
$PY scripts/richting_staten.py > /c/Users/larsh/AppData/Local/Temp/loep-vervolgronde/staten-na.txt
$PY scripts/richting_staten.py --voorbeelden >> /c/Users/larsh/AppData/Local/Temp/loep-vervolgronde/staten-na.txt
diff /c/Users/larsh/AppData/Local/Temp/loep-vervolgronde/staten-voor.txt /c/Users/larsh/AppData/Local/Temp/loep-vervolgronde/staten-na.txt
```
Leg per gewisselde kaart uit waarom (de tellingen staan op de kaart in de HTML). Elke wissel moet een van de drie toegestane zijn (Taak 6).

- [ ] **Step 3: Renders** volgens het vaste recept, met `| tee .../eind.txt`. Verwacht: 26 bestanden (21 + 21_exit_uitstroom + 22_exit_uitstroom_rand + 3 voorbeelden; tel na), alleen de bekende drie bevindingen met dezelfde percentages, 0 warnings, 0 streepjes. Meet de ruimte op pagina twee van 21, 22, 08 en vb_loep. Paginatallen per bestand vergelijken met de nulmeting.

- [ ] **Step 4: Voorbeeldrapporten committen** (`docs/examples/*` en `frontend/public/examples/*`, html en pdf, zoals in de fixronde).

- [ ] **Step 5: Browsercheck Vertrek-vragenlijst** tegen een lokale backend op een wegwerp-SQLite in de tijdelijke map: org, exit-campagne en twee respondenten (één zonder, één met HR-maand) aanmaken met een klein script in de tijdelijke map (niet in de repo), backend starten op een vrije poort met `DATABASE_URL=sqlite:///...`, dan in de browser: (a) maand kiezen en versturen → in de database staat de maand; (b) overslaan en versturen → `exit_month` leeg; (c) "Zeg ik liever niet" → leeg; (d) refresh na kiezen → keuze blijft; (e) 375 px: geen horizontale scroll, de select past; (f) respondent met HR-maand ziet de vraag niet. Console zonder fouten.

- [ ] **Step 6: Browsercheck site**: `/producten` (tarieven en FAQ tonen "1.000 of meer medewerkers", OfferCatalog en FAQPage-JSON-LD parsen, FAQ-antwoord noemt het nieuwe label) en `/kennismaking` (omvangvakken). Desktop en 375 px.

- [ ] **Step 7: Verslag** `docs/superpowers/plans/2026-10-07-vervolgronde-vertrekmaand-uitvoering.md`: baselines voor/na, per taak wat de reviews vonden, faalset-vergelijking, renders, richtingstaatwissels per scenario met reden, browsercheck, afwijkingen, en "Wat Lars moet beslissen". Commit plan, verslag en voorbeelden.

---

## Wat al bekend is voor "Wat Lars moet beslissen"

- Venster van de keuzelijst: 24 maanden terug en 6 vooruit (`backend/exit_month.py`); keuze van de controller.
- De vraag staat niet bij een respondent wiens maand HR al aanleverde; een andere HR-maand wordt niet overschreven.
- "Zeg ik liever niet" en overslaan worden hetzelfde opgeslagen (leeg): er is geen kolom om ze te onderscheiden zonder migratie.
- `vertrekken` → `vertrek` in de uitstroomregel (de vraag noemt ook een geplande maand).
- Of "Tot betekent tot en zonder die grens" ergens op de site uitgelegd moet worden (nu niet: alleen de labels).

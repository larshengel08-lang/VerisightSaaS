# Klantsuite 2b: overzicht en schil (blok G + H, plus sluitdatum afdwingen) — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** De HR-manager vindt al haar metingen op één plek, leest overal dezelfde noemer en dezelfde statuslabels, heeft hulp en contact in de schil, ziet de naam van haar organisatie in de kop, komt via een activatiepagina in Loep-stijl met eerlijke self-service-copy binnen, kan de wizard op een telefoon bedienen, en de sluitdatum die zij in de wizard kiest wordt écht afgedwongen: in de uitnodiging staat tot wanneer invullen kan, en na die dag weigert de vragenlijst.

**Architecture:** Alles wat de spec blok G en H noemt zit in de Next.js-frontend (`frontend/`). Nieuwe pure modules dragen de logica en zijn los testbaar: `lib/dashboard/campaign-status.ts` (één statusvocabulaire voor de lijst op `/dashboard` en `/reports`, afgeleid met dezelfde primitieven als de resolver), `lib/dashboard/invited-denominator.ts` (één noemerregel, dezelfde als het rapport sinds stresstest ronde 2), `lib/dashboard/campaign-list.ts` (hoofdkaartkeuze en lijstitems), `lib/dashboard/account-heading.ts` (organisatienaam in de kop, fail-loud), `lib/dashboard/new-measurement-request.ts` (mailto), `lib/dashboard/self-link.ts` (geen knop die naar de eigen pagina linkt), `lib/dashboard/help-content.ts` (copy van `/help`). `resolveDashboardState` blijft de enige plek die uit data een kaartstaat afleidt; de lijst gebruikt hem niet per rij maar een lichte afgeleide die met een pariteitstest aan de resolver is vastgeklonken. Het amendement (sluitdatum afdwingen) raakt de FastAPI-backend: één helper `backend/survey_window.py` (Europe/Amsterdam-dag, `is_survey_open`) die de vier open-survey-endpoints naast `is_active` gebruiken, plus `closes_at` op het `Campaign`-model; de uitnodiging en herinnering noemen de datum vanuit één bron (`lib/self-send-comms.ts`). Geen schemawijziging (`campaigns.closes_at` bestaat sinds migratie 2026_06_17).

**Tech Stack:** Next.js (App Router, server components + server actions), TypeScript strict, Supabase (`@supabase/ssr`, RLS leidend), vitest (source-guard-tests met `readFileSync`, pure-functietests, gemockte Supabase via `vi.mock('@/lib/supabase/server')`; er is géén testing-library of jsdom). Backend: FastAPI + SQLAlchemy, pytest met de `client`/`db_session`-fixtures uit `tests/conftest.py` (SQLite in-memory). **Railway draait Python 3.11**: geen PEP 701-f-strings (geen backslash of hergebruikt aanhalingsteken in een f-string-expressie); `tests/test_python311_syntax_guard.py` bewaakt dat. Lokale venv: `.venv/Scripts/python.exe` (3.11).

**Spec:** `docs/superpowers/specs/2026-09-16-klantsuite-design.md`, blok G (par. 6, alle vijf subparagrafen) en blok H (par. 7), plus par. 8 t/m 10 waar van toepassing, plus het amendement hieronder (par. 4.3, besluit Lars 18-9). Blok D en E zijn gebouwd in plan 2a (`docs/superpowers/plans/2026-09-16-klantsuite-2a-uitvoering.md`) en worden hier niet opnieuw gedaan. Bron van de bevindingen: `docs/klantreis-walkthrough-2026-09-16.md`; de dekkingstabel staat in de zelfreview onderaan.

**Copyregels (klantzichtbaar):** Nederlands, je/jij, Loep als onderwerp (nooit "ik" of "wij" namens Loep), geen em-dashes (`—`) of en-dashes (`–`), geen HR-jargon ("campaign", "respondentimport", "surveylogica", "managementduiding"), eerlijkheid als verkoopargument. Fail Loud: geen stille fallbacks; een ontbrekende organisatienaam of noemer wordt zichtbaar benoemd, nooit uit een maildomein of respondentrijen verzonnen. Nooit RLS, policies, privacygates, staffels of drempels verzwakken om een test te laten slagen; de klant ziet nooit individuele antwoorden.

**Regelnummers:** verwijzen naar de stand op `main` (`66d73d82`, 18 september, met plan 2a gemerged). Taken raken deels dezelfde bestanden, dus na de eerste wijziging schuiven nummers op. Gebruik dan het geciteerde ankerfragment (de code die er nu staat), niet het nummer.

**Werkplek:** git worktree `C:\Users\larsh\Desktop\Business\Verisight\.worktrees\klantsuite-2b` op branch `feature/klantsuite-2b` (Task 0). Alle paden hieronder zijn relatief aan die worktree-root; alle `npx`-commando's draaien vanuit `frontend/` in de worktree; alle `pytest`-commando's vanuit de worktree-root met scope `tests` (altijd `pytest tests`, nooit kaal vanuit de repo-root). **Nooit `git stash` of `git stash pop`**: de stash-stapel is gedeeld tussen worktrees en sessies; gebruik een tijdelijke WIP-commit als je iets moet parkeren. Niet mergen, niet pushen; merge en push doet Lars of een afrondsessie.

**Omgevingsvalkuilen (bekend, niet oplossen in dit plan):**
- `frontend/.env.local` mist `RESEND_API_KEY`; zonder die sleutel breekt `npm run build` af en laden sommige server actions niet ("Verlengen mislukt"). Zet `RESEND_API_KEY=re_dummy_build_only` **in de omgeving van je shell**, nooit in een bestand.
- `.venv` mist `httpx`; `scripts/seed_test_tenant.py --reset` en `--login-link` breken daar af vóór er iets geschreven wordt. Gebruik daarvoor de systeem-Python (`python scripts/seed_test_tenant.py ...`); `--dry-run` werkt met beide.
- `.venv` mist ook `tzdata`, en Windows heeft geen systeem-zoneinfo; `ZoneInfo("Europe/Amsterdam")` faalt dan. Task 1 zet `tzdata` in `requirements.txt` en installeert het in de venv.
- Vercel Analytics laadt in dev `va.vercel-scripts.com/v1/script.debug.js` en de CSP blokkeert dat: bekende consolefout, negeren.
- `.env.local` komt niet mee in een worktree: kopiëren (Task 0). `npm run build 2>&1 | tail` maskeert de exitcode; lees de laatste regels of print `$?`.

**Baselines (main `66d73d82`):** `npx tsc --noEmit` = 133 fouten; `npx vitest run` = 60 falende tests; backend `pytest tests` = 25 falend. De gate is de **faalset per testnaam** (diff van namen), nooit alleen het aantal. Task 0 legt de faalsets vast, Task 11 vergelijkt. Verwacht groen door dit plan (regels met `<` in de diff): `app/(auth)/login/page.test.ts > auth release wording > keeps login and activation copy tied to dashboard and campaign release` (herschreven in Task 8).

**Werkwijze per taak:** subagent-driven-development met per taak een spec-review (klopt het met de spec, het amendement en de copyregels?) en een codekwaliteitsreview (fail-loud, geen stille fallback, geen verzwakte gate, types consistent). Elke bevinding gaat terug naar dezelfde implementer, daarna herreview. Verslag na afloop als `docs/superpowers/plans/2026-09-18-klantsuite-2b-uitvoering.md` in dezelfde vorm als het 2a-verslag (wat werkt, baselines voor/na met faalset-diff, commits per taak, afwijkingen, wat de reviews vonden, browsercheck met dag-na-seed, bewust niet gedaan, wat Lars moet weten).

> **Attributie:** de Co-Authored-By-regels in de commitblokken hieronder zijn voorbeelden; gebruik de regel uit je eigen sessie-instructies.

---

## Amendement op de spec (par. 4.3, besluit Lars 18-9)

De uitvoerder plakt dit blok in `docs/superpowers/specs/2026-09-16-klantsuite-design.md` direct onder par. 4.3, vóór "### 4.4 Herinneringskaart" (Task 1, Step 1). Het vervangt 2a-afwijking 8 (de verzachte toelichting bij de sluitdatum) en 2a-"bewust niet gedaan" punt 1.

```markdown
#### 4.3a Amendement (besluit Lars, 18 september 2026): de sluitdatum wordt afgedwongen, als één pakket met de deadline in de uitnodiging

- **Definitie.** `campaigns.closes_at` is een `date` (migratie `migrations/2026_06_17_add_closes_at.sql`). De deur gaat dicht ná het einde van die dag in Europe/Amsterdam: invullen is toegestaan zolang `vandaag in Amsterdam <= closes_at`. Null betekent geen deadline (bestaand gedrag; lopende metingen van vóór de wizard-sluitdatum blijven "Nog niet ingesteld" en krijgen geen knop om er alsnog een te zetten, geaccepteerd).
- **Backend.** De open survey-flow (`open_survey_intro`, `open_survey_start`, `serve_survey`, `submit_survey` in `backend/main.py`) weigert na de sluitdatum met dezelfde statuspagina die een gesloten meting al krijgt, met de tekst "Deze meting is gesloten. Bedankt voor je interesse." `submit_survey` geeft een 410 met dezelfde boodschap, zodat een respondent die de pagina al open had het ook hoort. `is_active` en de datumcheck zitten in één helper (`backend/survey_window.py`), zodat er één bron van waarheid is.
- **Verlengen** (`extendCampaignAction`, `closes_at` + 14) opent de deur automatisch weer; dit is met een test vastgepind.
- **Uitnodiging en herinnering** (één bron, `frontend/lib/self-send-comms.ts`) noemen de sluitdatum: "Invullen kan tot en met [datum in het Nederlands]." Zonder sluitdatum (oude metingen met `closes_at` null) blijft de regel weg; nooit "tot en met onbekend".
- **Dashboardcopy** bij de sluitdatum in stap 1 is weer waar en sterker: "Na deze datum kan niemand meer invullen. Sluiten of verlengen doe je hier in Loep."
- **Deploy.** Raakt backend én frontend: Railway-redeploy nodig, géén DB-migratie.
```

---

## Bestandsoverzicht

**Create (backend)**
- `backend/survey_window.py` — `AMSTERDAM`, `today_amsterdam`, `is_survey_open`, de gedeelde gesloten-copy.
- `tests/test_survey_window.py` — pure tests (daggrens Amsterdam, open/dicht-matrix).
- `tests/test_survey_closes_at.py` — API-tests op de vier endpoints, inclusief "verlengen opent de deur weer".

**Modify (backend)**
- `backend/models.py:150` — `closes_at: Mapped[date | None]` op `Campaign`.
- `backend/main.py:1128-1136, 1203-1211, 1333-1343, 1394-1395` — vier `is_active`-checks vervangen door één helper.
- `templates/survey-status.html:6` — `<title>` zonder em-dash.
- `requirements.txt` — `tzdata`.

**Create (frontend)**
- `frontend/lib/dashboard/invited-denominator.ts` (+ `.test.ts`) — `resolveInvitedDenominator`, `formatResponseBasis`.
- `frontend/lib/dashboard/campaign-status.ts` (+ `.test.ts`) — `CAMPAIGN_STATUS_LABELS`, `deriveCampaignStatus`, `deriveCampaignStatusFor`, `CampaignStatusContext`; pariteitstest met de resolver.
- `frontend/lib/dashboard/campaign-status-context.ts` (+ `.guard.test.ts`) — `loadCampaignStatusContext` (server, twee `.in()`-queries, fail-loud).
- `frontend/lib/dashboard/campaign-list.ts` (+ `.test.ts`) — `pickMainCampaign`, `buildCampaignListItems`.
- `frontend/components/dashboard/campaign-list-section.tsx` (+ `.test.ts`) — "Al je metingen".
- `frontend/lib/dashboard/self-link.ts` (+ `.test.ts`) — `withoutSelfLink`.
- `frontend/lib/dashboard/new-measurement-request.ts` (+ `.test.ts`) — `buildNewMeasurementMailto`.
- `frontend/components/dashboard/request-new-measurement.tsx` (+ `.test.ts`) — het vaste blok.
- `frontend/lib/dashboard/account-organization.ts` (+ `.guard.test.ts`) — `loadAccountOrganizations` (server).
- `frontend/lib/dashboard/account-heading.ts` (+ `.test.ts`) — `resolveAccountHeading`.
- `frontend/components/dashboard/dashboard-shell.guard.test.ts` — source-guard op de schil.
- `frontend/lib/dashboard/help-content.ts` (+ `.test.ts`) en `frontend/app/(dashboard)/help/page.tsx` (+ `page.test.ts`).
- `frontend/app/(auth)/complete-account/page.test.ts` — source-guard op de activatiepagina.
- `frontend/lib/dashboard/no-dashes.guard.test.ts` — grep-guard: geen em- of en-dash in `components/dashboard`, `app/(dashboard)`, `app/(auth)`.

**Modify (frontend)**
- `frontend/lib/self-send-comms.ts:247-254, 299-339` (+ test) — `closesAt` in `TemplateArgs`, regel "Invullen kan tot en met ...".
- `frontend/lib/dashboard/reminder-text.ts:21-31, 54-63` (+ test) — `closesAt` doorgeven.
- `frontend/components/dashboard/setup-wizard-card.tsx:77, 179-185, 303-309, 337-348, 417` (+ guard-test) — sluitdatum in de uitnodiging, tekst ververst na stap 1, nieuwe toelichting, responsive grid.
- `frontend/lib/dashboard/report-library.ts:68-118` (+ test) — `buildReportOverviewRows(campaigns, context)` met echte noemer en statuslabels.
- `frontend/app/(dashboard)/reports/page.tsx` (+ 3 tests) — klikbare rijen, geen dichtgeklapte `<details>`, grid-fix, context laden.
- `frontend/lib/dashboard/dashboard-state-resolver.ts:68-95, 103-122, 142-149` (+ test) — `campaignName` in de staat.
- `frontend/app/(dashboard)/dashboard/page.tsx` (+ test) — alle metingen, hoofdkaartkeuze, lijst, noemer-helper, `closesAt` naar de herinnering, "nieuwe meting aanvragen".
- `frontend/app/(dashboard)/campaigns/[id]/page.tsx` (+ tests) — "Alle metingen"-link, `withoutSelfLink`, noemer-helper, `closesAt`, blok bij de eindtoestand.
- `frontend/components/dashboard/dashboard-state-card.tsx`, `running-state-card.tsx`, `read-only-state-card.tsx` (+ tests) — campagnenaam, geen dubbel sluitlabel, mailto voor meelezers.
- `frontend/components/dashboard/welcome-gate.tsx:117` — "Je meting staat klaar."
- `frontend/app/(dashboard)/layout.tsx` en `frontend/components/dashboard/dashboard-shell.tsx` — organisatienaam in de kop, mobiel menu met account en uitloggen, footer, geen dubbele "Rapporten"-knop, "Afgesloten" met campagnenaam en sluitmaand.
- `frontend/lib/dashboard/shell-navigation.ts` (+ test) — `help`-module, `ClosedCampaignNavItem` met naam en sluitmaand.
- `frontend/lib/public-route-access.ts:33-40` (+ test) — `/help`.
- `frontend/app/(auth)/complete-account/page.tsx` en `frontend/app/(auth)/login/page.tsx` (+ test) — Loep-stijl, self-service-copy, melding bij verlopen activatielink.
- `frontend/components/dashboard/onboarding-panels.tsx:84-102` — `ActivationJourneyPanel` weg (enige importer was de activatiepagina).
- `frontend/app/(dashboard)/campaigns/[id]/pdf-download-button.tsx:47-60, 71-73` (+ test) — Nederlandse foutmelding met contact.
- 16 bestanden in de streepjes-sweep (Task 10, lijst staat daar).
- `docs/testklant.md` — checklist bijgewerkt.

**Bewust niet aangeraakt:** `frontend/components/dashboard/self-send-setup-panel.tsx` (operatorpaneel; bouwt de uitnodiging zonder `closesAt`, want zijn `endDate` komt uit `self_send_config` en niet uit `campaigns.closes_at`; twee bronnen mengen is erger dan de regel daar weglaten), `lib/dashboard/dashboard-state-resolver.ts` behalve het `campaignName`-veld (de resolver blijft de enige kaartlogica), `supabase/schema.sql` (mist `closes_at` al sinds de migratie; bijwerken is een los traject), `backend/main.py` `dispatch_reminders` (kijkt naar `self_send_config.endDate`, een ander veld; buiten het amendement), `lib/dashboard/reminder-due.ts`, `lib/campaign-audit.ts`, alle operatorknoppen met `confirm()`.

---

## Taakoverzicht

| Taak | Inhoud | Spec / bron |
|---|---|---|
| 0 | Worktree, dependencies, baselines (frontend én backend faalset) | par. 10 |
| 1 | Amendement in de spec; backend dwingt de sluitdatum af (`survey_window.py`, model, vier endpoints, tests, tzdata) | amendement |
| 2 | Sluitdatum in uitnodiging en herinnering; wizard ververst de tekst na stap 1; stap-1-toelichting waar en sterker | amendement |
| 3 | Eén noemer en één statusvocabulaire; `/reports` met echte noemer, klikbare rijen, open lijst, grid-fix | 6.2, walkthrough 6.1-6.5 |
| 4 | `/dashboard` toont alle metingen (hoofdkaart + "Al je metingen"); campagnenaam op de kaart; "Alle metingen"-link; dubbele rapportkaart weg; "Je meting staat klaar" | 6.1, 7 (dubbele kaart), walkthrough 1.1, 1.2, 3.1, 3.15, 5.2 |
| 5 | "Nieuwe meting aanvragen" (mailto) op `/dashboard` en op de eindtoestand; meelezer krijgt de mailknop; geen dubbel sluitlabel | 6.3, 4.5, 2a-punt 9 |
| 6 | Kop toont `organizations.name` (fail-loud), mobiel menu met account en uitloggen, footer met contact, "Afgesloten" met campagnenaam en sluitmaand, dubbele "Rapporten"-knop weg | 6.5, walkthrough 1.3, 1.7, 1.8, 1.9, 7.2 |
| 7 | `/help` in de ingelogde omgeving, "Hulp" in sidebar en mobiel menu, `/help` in `PROTECTED_APP_ROUTES` | 6.4, walkthrough 7.1 |
| 8 | Activatiepagina en inlogpagina in Loep-stijl met self-service-copy; melding bij verlopen activatielink | 7, walkthrough 0.1-0.4, 7.3 |
| 9 | Wizard responsive (één kolom onder `lg`), Nederlandse foutmelding bij de rapportdownload | 7, walkthrough 8.1, 5.3 |
| 10 | Streepjes-sweep over de ingelogde omgeving + grep-guardtest | 7, walkthrough 3.9 |
| 11 | Eindverificatie (tsc, faalset-diff frontend en backend, build), herhaalde walkthrough op de testklant, `docs/testklant.md`, uitvoeringsverslag | par. 1 (lat), par. 10 |

---

### Task 0: Worktree, dependencies en baselines vastleggen (frontend én backend)

**Files:** geen codewijziging.

- [ ] **Step 1: Worktree aanmaken vanaf main en `.env.local` kopiëren**

Run (vanuit de hoofdrepo):
```bash
cd /c/Users/larsh/Desktop/Business/Verisight
git status --short | grep -v '^??' ; echo "---"
git worktree add .worktrees/klantsuite-2b -b feature/klantsuite-2b main
git -C .worktrees/klantsuite-2b log --oneline -1
cp frontend/.env.local .worktrees/klantsuite-2b/frontend/.env.local
ls .worktrees/klantsuite-2b/frontend/.env.local
```
Expected: `git status` toont alleen `??`-regels (untracked docs), geen gewijzigde tracked bestanden; `git worktree add` meldt `Preparing worktree (new branch 'feature/klantsuite-2b')`; de log-regel toont `66d73d82`; `ls` toont het gekopieerde `.env.local` (gitignored, komt nooit in een commit). Staat er een tracked wijziging in de hoofdrepo, stop en meld het: die hoort niet in deze branch.

- [ ] **Step 2: Frontend-dependencies installeren in de worktree**

`npm ci` weigert door een bekende lockfile-mismatch; gebruik `npm install` en zet het lockfile daarna terug. Let op de gotcha uit ronde 1 (11 sep): nooit `rmdir /s /q` op een junction naar `node_modules`, dat leegt het doel.

Run:
```bash
cd /c/Users/larsh/Desktop/Business/Verisight/.worktrees/klantsuite-2b/frontend
npm install
git checkout -- package-lock.json
git status --short
```
Expected: `npm install` eindigt zonder `ERR!`; `git status --short` is leeg.

- [ ] **Step 3: `tzdata` in de venv (nodig vanaf Task 1; Windows heeft geen systeem-zoneinfo)**

Run:
```bash
cd /c/Users/larsh/Desktop/Business/Verisight
.venv/Scripts/python.exe -m pip install "tzdata>=2024.1"
.venv/Scripts/python.exe -c "from zoneinfo import ZoneInfo; print(ZoneInfo('Europe/Amsterdam'))"
```
Expected: de laatste regel print `Europe/Amsterdam`. Zonder deze stap faalt Task 1 lokaal met `ZoneInfoNotFoundError`.

- [ ] **Step 4: Frontend-baselines vastleggen (tsc en faalset per testnaam)**

Run:
```bash
cd /c/Users/larsh/Desktop/Business/Verisight/.worktrees/klantsuite-2b/frontend
mkdir -p /c/Users/larsh/AppData/Local/Temp/loep-klantsuite-2b
npx tsc --noEmit 2>&1 | grep -c "error TS"
npx vitest run --reporter=json --outputFile=/c/Users/larsh/AppData/Local/Temp/loep-klantsuite-2b/vitest-baseline.json >/dev/null 2>&1
node -e "const r=require('/c/Users/larsh/AppData/Local/Temp/loep-klantsuite-2b/vitest-baseline.json');const f=[];for(const s of r.testResults)for(const t of s.assertionResults)if(t.status==='failed')f.push(s.name.replace(/\\\\/g,'/').split('/frontend/')[1]+' > '+t.fullName);console.log(f.sort().join('\n'))" > /c/Users/larsh/AppData/Local/Temp/loep-klantsuite-2b/baseline-fails.txt
wc -l < /c/Users/larsh/AppData/Local/Temp/loep-klantsuite-2b/baseline-fails.txt
```
Expected: `133` (tsc) en `60` (falende tests). Wijkt het testgetal af (de suite is licht wisselvallig: `app/(dashboard)/beheer/health/page.test.ts` laadt af en toe niet), draai de vitest-regel opnieuw en vergelijk namen, niet het getal. Het bestand `baseline-fails.txt` is de gate voor Task 11.

- [ ] **Step 5: Backend-baseline vastleggen (faalset per testnaam)**

De venv staat in de hoofdrepo, niet in de worktree; gebruik het volledige pad. Altijd met scope `tests`.

Run:
```bash
cd /c/Users/larsh/Desktop/Business/Verisight/.worktrees/klantsuite-2b
/c/Users/larsh/Desktop/Business/Verisight/.venv/Scripts/python.exe -m pytest tests -q -p no:cacheprovider 2>&1 | grep -E "^(FAILED|ERROR) " | sed -E 's/ - .*$//' | sort > /c/Users/larsh/AppData/Local/Temp/loep-klantsuite-2b/pytest-baseline.txt || true
wc -l < /c/Users/larsh/AppData/Local/Temp/loep-klantsuite-2b/pytest-baseline.txt
```
Expected: `25`. De WeasyPrint-tests tonen `skipped` (geen GTK op Windows), dat is normaal.

---

### Task 1: Amendement in de spec; backend dwingt de sluitdatum af

**Files:**
- Modify: `docs/superpowers/specs/2026-09-16-klantsuite-design.md` (par. 4.3a invoegen, zie het blok "Amendement op de spec" bovenaan dit plan)
- Create: `backend/survey_window.py`
- Modify: `backend/models.py:150` (na `closed_at`)
- Modify: `backend/main.py:1128-1136, 1203-1211, 1333-1343, 1394-1395` (+ imports na regel 83, + helpers na `_render_survey_status`, regel 627-648)
- Modify: `templates/survey-status.html:6`
- Modify: `requirements.txt` (blok `# Utilities`)
- Test: `tests/test_survey_window.py`, `tests/test_survey_closes_at.py`

- [ ] **Step 1: Amendement in de spec plakken**

De spec is tracked op main (commit `bc39f878`) en staat dus al in de worktree; bewerk hem daar.

Run:
```bash
cd /c/Users/larsh/Desktop/Business/Verisight
grep -n "^### 4.4 Herinneringskaart" .worktrees/klantsuite-2b/docs/superpowers/specs/2026-09-16-klantsuite-design.md
```
Expected: `66:### 4.4 Herinneringskaart`. Voeg het volledige markdown-blok uit "Amendement op de spec (par. 4.3, besluit Lars 18-9)" bovenaan dit plan in **vóór** die regel (na regel 64 over `skipReminderAction` en de lege regel 65). Controleer:
```bash
grep -n "4.3a Amendement" .worktrees/klantsuite-2b/docs/superpowers/specs/2026-09-16-klantsuite-design.md
```
Expected: één treffer, regelnummer tussen 65 en 70.

- [ ] **Step 2: Falende pure tests voor `survey_window`**

Maak `tests/test_survey_window.py`:

```python
"""Sluitdatum afdwingen (amendement spec 2026-09-16 par. 4.3a, besluit Lars 18-9).

De deur gaat dicht na het einde van de sluitdag in Europe/Amsterdam. Deze tests
pinnen de daggrens (zomer- en wintertijd) en de open/dicht-matrix, los van
FastAPI en de database.
"""
from __future__ import annotations

from datetime import date, datetime, timezone

from backend.survey_window import (
    SURVEY_CLOSED_MESSAGE,
    is_survey_open,
    today_amsterdam,
)


def test_today_amsterdam_zomertijd_daggrens():
    # 30 september 2026 21:59:59 UTC is nog 30 september in Amsterdam (UTC+2).
    assert today_amsterdam(datetime(2026, 9, 30, 21, 59, 59, tzinfo=timezone.utc)) == date(2026, 9, 30)
    # 22:00 UTC is al 1 oktober in Amsterdam.
    assert today_amsterdam(datetime(2026, 9, 30, 22, 0, 0, tzinfo=timezone.utc)) == date(2026, 10, 1)


def test_today_amsterdam_wintertijd_daggrens():
    # 15 december 2026 22:59:59 UTC is nog 15 december in Amsterdam (UTC+1).
    assert today_amsterdam(datetime(2026, 12, 15, 22, 59, 59, tzinfo=timezone.utc)) == date(2026, 12, 15)
    assert today_amsterdam(datetime(2026, 12, 15, 23, 0, 0, tzinfo=timezone.utc)) == date(2026, 12, 16)


def test_today_amsterdam_behandelt_naive_als_utc():
    assert today_amsterdam(datetime(2026, 9, 30, 22, 0, 0)) == date(2026, 10, 1)


def test_open_zonder_sluitdatum_zolang_actief():
    assert is_survey_open(is_active=True, closes_at=None, today=date(2026, 9, 18)) is True
    assert is_survey_open(is_active=False, closes_at=None, today=date(2026, 9, 18)) is False


def test_open_tot_en_met_de_sluitdag_zelf():
    closes = date(2026, 10, 8)
    assert is_survey_open(is_active=True, closes_at=closes, today=date(2026, 10, 7)) is True
    assert is_survey_open(is_active=True, closes_at=closes, today=date(2026, 10, 8)) is True
    assert is_survey_open(is_active=True, closes_at=closes, today=date(2026, 10, 9)) is False


def test_inactief_wint_altijd_van_de_datum():
    assert is_survey_open(is_active=False, closes_at=date(2099, 1, 1), today=date(2026, 9, 18)) is False


def test_gesloten_copy_is_je_jij_zonder_streepjes():
    assert SURVEY_CLOSED_MESSAGE == "Deze meting is gesloten. Bedankt voor je interesse."
    assert "—" not in SURVEY_CLOSED_MESSAGE
    assert "–" not in SURVEY_CLOSED_MESSAGE
```

- [ ] **Step 3: Run de tests om te zien dat ze falen**

Run:
```bash
cd /c/Users/larsh/Desktop/Business/Verisight/.worktrees/klantsuite-2b
/c/Users/larsh/Desktop/Business/Verisight/.venv/Scripts/python.exe -m pytest tests/test_survey_window.py -q -p no:cacheprovider 2>&1 | tail -5
```
Expected: `ModuleNotFoundError: No module named 'backend.survey_window'`.

- [ ] **Step 4: `backend/survey_window.py` schrijven**

```python
"""Sluitdatum van een meting (amendement spec 2026-09-16 par. 4.3a, besluit Lars 18-9).

`campaigns.closes_at` is een date. De deur gaat dicht na het einde van die dag
in Europe/Amsterdam: invullen mag zolang today_amsterdam() <= closes_at.
Null betekent geen deadline (bestaand gedrag). `is_active` blijft de harde
schakelaar en wint altijd van de datum. Dit is de enige plek waar die twee
regels samen staan; de vier open-survey-endpoints in backend/main.py roepen
alleen `is_survey_open` aan.

Let op Railway (Python 3.11): geen PEP 701-f-strings hieronder.
"""
from __future__ import annotations

from datetime import date, datetime, timezone
from zoneinfo import ZoneInfo

AMSTERDAM = ZoneInfo("Europe/Amsterdam")

# Eén set copy voor de gesloten meting, voor de statuspagina (GET) en voor de
# 410 van /survey/submit (POST), zodat een respondent met een open tabblad
# hetzelfde leest als een respondent die de link nu pas opent.
SURVEY_CLOSED_TITLE = "Meting gesloten"
SURVEY_CLOSED_HEADING = "Deze meting is gesloten"
SURVEY_CLOSED_MESSAGE = "Deze meting is gesloten. Bedankt voor je interesse."
SURVEY_CLOSED_HINT = "Heb je vragen? Neem dan contact op met de HR-afdeling van je organisatie."


def today_amsterdam(now: datetime | None = None) -> date:
    """De kalenderdag in Nederland. Een naive datetime wordt als UTC gelezen."""
    moment = now or datetime.now(timezone.utc)
    if moment.tzinfo is None:
        moment = moment.replace(tzinfo=timezone.utc)
    return moment.astimezone(AMSTERDAM).date()


def is_survey_open(*, is_active: bool, closes_at: date | None, today: date | None = None) -> bool:
    """True zolang de meting actief is en de sluitdag nog niet voorbij is."""
    if not is_active:
        return False
    if closes_at is None:
        return True
    return (today or today_amsterdam()) <= closes_at
```

- [ ] **Step 5: Run de pure tests, nu groen**

Run:
```bash
cd /c/Users/larsh/Desktop/Business/Verisight/.worktrees/klantsuite-2b
/c/Users/larsh/Desktop/Business/Verisight/.venv/Scripts/python.exe -m pytest tests/test_survey_window.py -q -p no:cacheprovider 2>&1 | tail -3
```
Expected: `7 passed`.

- [ ] **Step 6: Falende API-tests voor de vier endpoints**

Maak `tests/test_survey_closes_at.py`. De payload-helpers komen uit `tests/test_deepening_submit.py` (een retention-inzending die de validatie haalt), de fixtures uit `tests/test_api_flows.py`.

```python
"""De open survey-flow weigert na de sluitdatum (amendement par. 4.3a).

Vier endpoints, één helper. Elke test zet closes_at direct op het model
(precies wat de wizard via Supabase doet) en spreekt de echte routes aan via
de TestClient uit tests/conftest.py.
"""
from __future__ import annotations

from datetime import timedelta

from sqlalchemy.orm import Session

from backend.models import Respondent
from backend.survey_window import SURVEY_CLOSED_MESSAGE, today_amsterdam
from tests.test_api_flows import _create_campaign, _create_org, _create_respondent
from tests.test_deepening_submit import _org_raw, _retention_payload


def _campaign(db: Session, *, closes_at, is_active: bool = True):
    org = _create_org(db, api_key="closes-at-key")
    campaign = _create_campaign(db, org, name="Behoud najaar", scan_type="retention")
    campaign.closes_at = closes_at
    campaign.is_active = is_active
    db.commit()
    db.refresh(campaign)
    return campaign


def _yesterday():
    return today_amsterdam() - timedelta(days=1)


# --- GET /survey/open/{token} (intro) ------------------------------------

def test_intro_weigert_na_de_sluitdatum_met_de_gesloten_copy(client, db_session):
    campaign = _campaign(db_session, closes_at=_yesterday())
    r = client.get(f"/survey/open/{campaign.public_survey_token}")
    assert r.status_code == 410
    assert SURVEY_CLOSED_MESSAGE in r.text
    assert "Deze meting is gesloten" in r.text


def test_intro_open_op_de_sluitdag_zelf(client, db_session):
    campaign = _campaign(db_session, closes_at=today_amsterdam())
    r = client.get(f"/survey/open/{campaign.public_survey_token}")
    assert r.status_code == 200


def test_intro_open_zonder_sluitdatum(client, db_session):
    campaign = _campaign(db_session, closes_at=None)
    r = client.get(f"/survey/open/{campaign.public_survey_token}")
    assert r.status_code == 200


def test_intro_inactief_geeft_dezelfde_gesloten_copy(client, db_session):
    campaign = _campaign(db_session, closes_at=None, is_active=False)
    r = client.get(f"/survey/open/{campaign.public_survey_token}")
    assert r.status_code == 410
    assert SURVEY_CLOSED_MESSAGE in r.text


# --- POST /survey/open/{token}/start --------------------------------------

def test_start_weigert_na_de_sluitdatum_en_maakt_geen_respondent(client, db_session):
    campaign = _campaign(db_session, closes_at=_yesterday())
    before = db_session.query(Respondent).filter(Respondent.campaign_id == campaign.id).count()
    r = client.post(f"/survey/open/{campaign.public_survey_token}/start", follow_redirects=False)
    after = db_session.query(Respondent).filter(Respondent.campaign_id == campaign.id).count()
    assert r.status_code == 410
    assert SURVEY_CLOSED_MESSAGE in r.text
    assert after == before


def test_start_werkt_op_de_sluitdag_zelf(client, db_session):
    campaign = _campaign(db_session, closes_at=today_amsterdam())
    r = client.post(f"/survey/open/{campaign.public_survey_token}/start", follow_redirects=False)
    assert r.status_code == 303


# --- GET /survey/{respondent_token} ---------------------------------------

def test_persoonlijke_link_weigert_na_de_sluitdatum(client, db_session):
    campaign = _campaign(db_session, closes_at=_yesterday())
    respondent = _create_respondent(db_session, campaign)
    r = client.get(f"/survey/{respondent.token}")
    assert r.status_code == 410
    assert SURVEY_CLOSED_MESSAGE in r.text


def test_persoonlijke_link_open_op_de_sluitdag_zelf(client, db_session):
    campaign = _campaign(db_session, closes_at=today_amsterdam())
    respondent = _create_respondent(db_session, campaign)
    r = client.get(f"/survey/{respondent.token}")
    assert r.status_code == 200


# --- POST /survey/submit --------------------------------------------------

def test_submit_weigert_na_de_sluitdatum_met_dezelfde_boodschap(client, db_session):
    campaign = _campaign(db_session, closes_at=_yesterday())
    respondent = _create_respondent(db_session, campaign)
    payload = _retention_payload(respondent.token, org_raw=_org_raw())
    r = client.post("/survey/submit", json=payload)
    assert r.status_code == 410
    assert r.json()["detail"] == SURVEY_CLOSED_MESSAGE


def test_submit_werkt_op_de_sluitdag_zelf(client, db_session):
    campaign = _campaign(db_session, closes_at=today_amsterdam())
    respondent = _create_respondent(db_session, campaign)
    payload = _retention_payload(respondent.token, org_raw=_org_raw())
    r = client.post("/survey/submit", json=payload)
    assert r.status_code == 200


# --- Verlengen opent de deur weer -----------------------------------------

def test_verlengen_opent_de_deur_weer(client, db_session):
    """extendCampaignAction (frontend) zet closes_at op max(vandaag, closes_at) + 14.
    De backend kent geen verlengactie; dit pint dat een vooruitgeschoven datum
    de meting weer opent zonder enige andere wijziging."""
    campaign = _campaign(db_session, closes_at=_yesterday())
    token = campaign.public_survey_token
    assert client.get(f"/survey/open/{token}").status_code == 410

    campaign.closes_at = today_amsterdam() + timedelta(days=14)
    db_session.commit()

    assert client.get(f"/survey/open/{token}").status_code == 200
    assert client.post(f"/survey/open/{token}/start", follow_redirects=False).status_code == 303
```

- [ ] **Step 7: Run de API-tests om te zien dat ze falen**

Run:
```bash
cd /c/Users/larsh/Desktop/Business/Verisight/.worktrees/klantsuite-2b
/c/Users/larsh/Desktop/Business/Verisight/.venv/Scripts/python.exe -m pytest tests/test_survey_closes_at.py -q -p no:cacheprovider 2>&1 | tail -15
```
Expected: alle tests met een sluitdatum in het verleden falen (`assert 200 == 410` bij de intro, `303 == 410` bij start, enzovoort). `campaign.closes_at = ...` geeft nog geen fout: SQLAlchemy zet een onbekend attribuut gewoon op het Python-object, maar slaat het niet op. De tests "op de sluitdag zelf" en "zonder sluitdatum" slagen al (huidig gedrag).

- [ ] **Step 8: `closes_at` op het `Campaign`-model**

In `backend/models.py`, direct na regel 150 (`closed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)`), toevoegen:

```python
    # Sluitdatum (date) uit de wizard (migratie migrations/2026_06_17_add_closes_at.sql).
    # Na deze dag (Europe/Amsterdam) weigert de survey-flow, zie backend/survey_window.py;
    # null betekent geen deadline.
    closes_at: Mapped[date | None] = mapped_column(Date, nullable=True)
```
`date` en `Date` zijn al geïmporteerd (regels 17 en 22).

- [ ] **Step 9: Eén helper in `backend/main.py` en vier checks vervangen**

Voeg bij de imports, na regel 83 (`from backend.scan_definitions import get_scan_definition`), toe:

```python
from backend.survey_window import (
    SURVEY_CLOSED_HEADING,
    SURVEY_CLOSED_HINT,
    SURVEY_CLOSED_MESSAGE,
    SURVEY_CLOSED_TITLE,
    is_survey_open,
)
```

Direct ná de functie `_render_survey_status` (die eindigt op regel 648 met `status_code=status_code,` en `)`), toevoegen:

```python
def _campaign_is_open(campaign: Campaign) -> bool:
    """Eén bron van waarheid voor 'mag deze meting nog ingevuld worden'
    (is_active én sluitdatum, amendement spec 2026-09-16 par. 4.3a)."""
    return is_survey_open(is_active=campaign.is_active, closes_at=campaign.closes_at)


def _survey_closed_response(request: Request) -> HTMLResponse:
    return _render_survey_status(
        request,
        status_code=410,
        title=SURVEY_CLOSED_TITLE,
        heading=SURVEY_CLOSED_HEADING,
        message=SURVEY_CLOSED_MESSAGE,
        hint=SURVEY_CLOSED_HINT,
        tone="info",
    )
```

Vervang in `open_survey_intro` (regels 1128-1136):
```python
    if not campaign.is_active:
        return _render_survey_status(
            request,
            status_code=410,
            title="Survey gesloten",
            heading="Deze survey is gesloten",
            message="De campagne accepteert geen nieuwe inzendingen meer.",
            tone="info",
        )
```
door:
```python
    if not _campaign_is_open(campaign):
        return _survey_closed_response(request)
```

Vervang in `open_survey_start` (regels 1203-1211) hetzelfde blok (identieke tekst) door dezelfde twee regels:
```python
    if not _campaign_is_open(campaign):
        return _survey_closed_response(request)
```

Vervang in `serve_survey` (regels 1333-1343):
```python
    campaign = respondent.campaign
    if not campaign.is_active:
        return _render_survey_status(
            request,
            status_code=410,
            title="Survey gesloten",
            heading="Deze survey is gesloten",
            message="Deze campagne accepteert geen nieuwe inzendingen meer. Eerder ingevulde antwoorden blijven wel meegenomen in de rapportage.",
            hint="Heb je vragen over de uitkomsten of verwerking van je gegevens, neem dan contact op met de HR-afdeling van je organisatie.",
            tone="info",
        )
```
door:
```python
    campaign = respondent.campaign
    if not _campaign_is_open(campaign):
        return _survey_closed_response(request)
```

Vervang in `submit_survey` (regels 1394-1395):
```python
    if not respondent.campaign.is_active:
        raise HTTPException(status_code=410, detail="Deze survey is gesloten en accepteert geen nieuwe inzendingen meer.")
```
door:
```python
    if not _campaign_is_open(respondent.campaign):
        raise HTTPException(status_code=410, detail=SURVEY_CLOSED_MESSAGE)
```

Controleer dat er geen `is_active`-check in de survey-flow over is:
```bash
cd /c/Users/larsh/Desktop/Business/Verisight/.worktrees/klantsuite-2b
grep -n "campaign.is_active" backend/main.py
```
Expected: alleen nog `"is_active": campaign.is_active,` (campagne-API, ~regel 2079) en `not campaign.is_active` in `dispatch_reminders` (~regel 2279, bewust ongewijzigd). Geen treffer tussen regel 1100 en 1400.

- [ ] **Step 10: `templates/survey-status.html` en `requirements.txt`**

In `templates/survey-status.html` regel 6:
```html
  <title>{{ title }} — Loep</title>
```
wordt:
```html
  <title>{{ title }} | Loep</title>
```

In `requirements.txt`, in het blok `# Utilities` na `python-dotenv>=1.0.0`, toevoegen:
```
# Tijdzone-database voor zoneinfo (Europe/Amsterdam): Windows en de Nix-build
# op Railway hebben geen systeem-zoneinfo waar Python op kan terugvallen.
tzdata>=2024.1
```

- [ ] **Step 11: Run de API-tests en de syntax-guard, nu groen**

Run:
```bash
cd /c/Users/larsh/Desktop/Business/Verisight/.worktrees/klantsuite-2b
/c/Users/larsh/Desktop/Business/Verisight/.venv/Scripts/python.exe -m pytest tests/test_survey_closes_at.py tests/test_survey_window.py tests/test_python311_syntax_guard.py tests/test_self_send.py tests/test_segment_flow.py -q -p no:cacheprovider 2>&1 | tail -5
```
Expected: alles `passed` (11 + 7 + de guard + de bestaande open-flow-tests), 0 failed.

- [ ] **Step 12: Volledige backend-suite tegen de baseline**

Run:
```bash
cd /c/Users/larsh/Desktop/Business/Verisight/.worktrees/klantsuite-2b
/c/Users/larsh/Desktop/Business/Verisight/.venv/Scripts/python.exe -m pytest tests -q -p no:cacheprovider 2>&1 | grep -E "^(FAILED|ERROR) " | sed -E 's/ - .*$//' | sort > /c/Users/larsh/AppData/Local/Temp/loep-klantsuite-2b/pytest-task1.txt || true
diff /c/Users/larsh/AppData/Local/Temp/loep-klantsuite-2b/pytest-baseline.txt /c/Users/larsh/AppData/Local/Temp/loep-klantsuite-2b/pytest-task1.txt && echo "faalset identiek"
```
Expected: `faalset identiek`. Elke `>`-regel is een nieuwe regressie; los die op vóór de commit.

- [ ] **Step 13: Commit**

```bash
cd /c/Users/larsh/Desktop/Business/Verisight/.worktrees/klantsuite-2b
git add docs/superpowers/specs/2026-09-16-klantsuite-design.md backend/survey_window.py backend/models.py backend/main.py templates/survey-status.html requirements.txt tests/test_survey_window.py tests/test_survey_closes_at.py
git commit -m "feat(survey): sluitdatum afgedwongen in de open survey-flow (amendement par. 4.3a)

Eén helper (backend/survey_window.py) beslist of een meting nog invulbaar is:
is_active én vandaag in Europe/Amsterdam <= closes_at. De vier endpoints
(intro, start, persoonlijke link, submit) weigeren met dezelfde Loep-copy;
verlengen (+14 dagen) opent de deur weer, vastgepind met een test.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

### Task 2: Sluitdatum in uitnodiging en herinnering; wizard ververst de tekst na stap 1; toelichting bij de sluitdatum weer waar en sterker

**Files:**
- Modify: `frontend/lib/self-send-comms.ts:1-6, 247-254, 263-272, 299-339`
- Modify: `frontend/lib/dashboard/reminder-text.ts:21-31, 54-63`
- Modify: `frontend/components/dashboard/setup-wizard-card.tsx:77, 179-185, 303-309, 337-348`
- Modify: `frontend/app/(dashboard)/dashboard/page.tsx:177-189`
- Modify: `frontend/app/(dashboard)/campaigns/[id]/page.tsx:152-164`
- Test: `frontend/lib/self-send-comms.test.ts` (nieuwe describe onderaan)
- Test: `frontend/lib/dashboard/reminder-text.test.ts:4-17` (+ nieuwe test)
- Test: `frontend/components/dashboard/setup-wizard-card.guard.test.ts:99-108`

- [ ] **Step 1: Falende tests voor de deadline-regel in de templates**

Zet onderaan `frontend/lib/self-send-comms.test.ts`:

```ts
describe('sluitdatum in uitnodiging en herinnering (amendement spec par. 4.3a)', () => {
  const base = {
    senderName: '',
    organizationName: 'Acme BV',
    scanType: 'retention' as const,
    surveyLink: 'https://www.getloep.nl/survey/open/tok-1',
  }

  it('noemt in de uitnodiging tot en met welke dag invullen kan, in het Nederlands', () => {
    const { body } = buildInviteTemplate({ ...base, closesAt: '2026-10-08' })
    expect(body).toContain('Invullen kan tot en met 8 oktober 2026.')
    // Na de link, vóór de afsluiting: de ontvanger leest eerst waar, dan tot wanneer.
    expect(body.indexOf('tok-1')).toBeLessThan(body.indexOf('Invullen kan tot en met'))
    expect(body.indexOf('Invullen kan tot en met')).toBeLessThan(body.indexOf('Alvast bedankt'))
  })

  it('noemt de sluitdatum ook in de herinnering', () => {
    const { body } = buildReminderTemplate({ ...base, closesAt: '2026-10-08' })
    expect(body).toContain('Invullen kan tot en met 8 oktober 2026.')
  })

  it('laat de regel weg zonder sluitdatum en zegt nooit "tot en met onbekend"', () => {
    for (const closesAt of [undefined, null, '', 'geen-datum']) {
      const invite = buildInviteTemplate({ ...base, closesAt })
      const reminder = buildReminderTemplate({ ...base, closesAt })
      expect(invite.body).not.toContain('tot en met')
      expect(reminder.body).not.toContain('tot en met')
      expect(invite.body).not.toContain('onbekend')
    }
  })

  it('zet bij afdelingslinks de deadline ná de laatste link', () => {
    const { body } = buildInviteTemplate({
      ...base,
      closesAt: '2026-10-08',
      departmentLinks: [
        { label: 'Zorg', url: 'https://www.getloep.nl/survey/open/tok-1?afd=zorg' },
        { label: 'Kantoor', url: 'https://www.getloep.nl/survey/open/tok-1?afd=kantoor' },
      ],
    })
    expect(body.indexOf('?afd=kantoor')).toBeLessThan(body.indexOf('Invullen kan tot en met'))
  })
})
```

Pas in `frontend/lib/dashboard/reminder-text.test.ts` de `input()`-helper aan (regels 4-17): voeg `closesAt: null,` toe na `launchDate: '2026-06-01',`. Voeg in de describe `buildReminderText` toe:

```ts
  it('geeft de sluitdatum door aan de herinnering (amendement par. 4.3a)', () => {
    expect(buildReminderText(input({ closesAt: '2026-10-08' }))).toContain('Invullen kan tot en met 8 oktober 2026.')
    expect(buildReminderText(input({ closesAt: null }))).not.toContain('tot en met')
  })
```

Vervang in `frontend/components/dashboard/setup-wizard-card.guard.test.ts` de test `geeft de toelichtingen uit de spec` (regels 99-108) door:

```ts
  it('geeft de toelichtingen uit de spec, met de sluitdatum-toelichting die sinds het amendement weer waar is', () => {
    expect(src).toContain('De dag waarop je de uitnodiging verstuurt.')
    // Amendement par. 4.3a (18-9): de backend dwingt de sluitdatum nu af, dus de belofte mag terug.
    expect(src).toContain('Na deze datum kan niemand meer invullen. Drie weken is gebruikelijk; sluiten of verlengen (twee weken per keer) doe je hier in Loep.')
    expect(src).not.toContain('Op deze datum vraagt Loep je de meting te sluiten of te verlengen')
    expect(src).toContain('Op die dag zet Loep de herinneringstekst voor je klaar; jij verstuurt hem vanuit je eigen mail.')
    expect(src).toContain('inclusief parttimers en oproepkrachten')
    expect(src).toContain('niet het hele personeelsbestand')
    expect(src).toContain('Alle nieuwe medewerkers die je in deze ronde uitnodigt.')
  })

  it('zet de sluitdatum in de uitnodiging en ververst de tekst na het opslaan van stap 1, in beide modi', () => {
    // Drie opbouwplekken (eerste render, segment-tak, niet-segment-tak) krijgen allemaal de sluitdatum mee.
    expect(src.match(/closesAt: closesAt \|\| null/g)?.length).toBe(3)
    // Beide takken verversen de conceptmail; vóór dit plan deed alleen de segment-tak dat,
    // waardoor een in stap 1 gekozen sluitdatum niet in de tekst van stap 2 belandde.
    expect(src.match(/refreshInviteDraft\(/g)?.length).toBe(2)
  })
```

- [ ] **Step 2: Run de tests om te zien dat ze falen**

Run:
```bash
cd /c/Users/larsh/Desktop/Business/Verisight/.worktrees/klantsuite-2b/frontend
npx vitest run lib/self-send-comms.test.ts lib/dashboard/reminder-text.test.ts components/dashboard/setup-wizard-card.guard.test.ts 2>&1 | tail -30
```
Expected: 4 + 1 + 2 nieuwe tests falen (`closesAt` is nog geen argument; de tekst bevat geen "tot en met"; de wizard-source mist de nieuwe toelichting en de derde `closesAt: closesAt || null`). De overige tests in die bestanden blijven groen.

- [ ] **Step 3: `lib/self-send-comms.ts`: deadline-regel uit één bron**

Voeg bij de imports (regels 4-6) toe:
```ts
import { formatDutchDate } from '@/lib/dashboard/format-dutch-date'
```

Vervang `interface TemplateArgs` (regels 247-254) door:

```ts
interface TemplateArgs {
  senderName: string
  organizationName: string
  scanType: ScanType
  surveyLink: string
  /** Bij afdelingsrapportage: één link per afdeling in plaats van de algemene link. */
  departmentLinks?: Array<{ label: string; url: string }>
  /**
   * campaigns.closes_at (YYYY-MM-DD). Sinds het amendement (spec par. 4.3a)
   * dwingt de backend deze dag af, dus de mail mag hem beloven. Null of
   * onleesbaar: de regel blijft weg; nooit "tot en met onbekend".
   */
  closesAt?: string | null
}
```

Voeg direct na `buildLinkLines` (regels 263-272) toe:

```ts
// Dezelfde dagdefinitie als backend/survey_window.py: tot en met de sluitdag zelf.
function buildDeadlineLines(args: TemplateArgs): string[] {
  const formatted = formatDutchDate(args.closesAt ?? null)
  if (!formatted) return []
  return ['', `Invullen kan tot en met ${formatted}.`]
}
```

Vervang in `buildInviteTemplate` de regels
```ts
      ...buildLinkLines(args),
      '',
      'Alvast bedankt voor je deelname.',
```
door:
```ts
      ...buildLinkLines(args),
      ...buildDeadlineLines(args),
      '',
      'Alvast bedankt voor je deelname.',
```

Vervang in `buildReminderTemplate` de regels
```ts
      ...buildLinkLines(args),
      '',
      'Heb je hem al ingevuld? Dan kun je deze mail negeren, en bedankt.',
```
door:
```ts
      ...buildLinkLines(args),
      ...buildDeadlineLines(args),
      '',
      'Heb je hem al ingevuld? Dan kun je deze mail negeren, en bedankt.',
```

- [ ] **Step 4: `lib/dashboard/reminder-text.ts`: sluitdatum doorgeven**

Voeg aan `ReminderTextInput` (regels 21-31), na `launchDate: string | null`, toe:
```ts
  /** campaigns.closes_at; null bij metingen zonder sluitdatum (dan geen deadline-regel). */
  closesAt: string | null
```

Vervang de aanroep `buildReminderTemplate({ ... })` (regels 54-63) door:
```ts
    const template = buildReminderTemplate({
      senderName: '',
      organizationName: input.organizationName,
      scanType: input.scanType,
      surveyLink: buildSurveyLink(input.frontendBaseUrl, input.publicSurveyToken),
      departmentLinks:
        departments && departments.length > 0
          ? buildSegmentSurveyLinks(input.frontendBaseUrl, input.publicSurveyToken, departments)
          : undefined,
      closesAt: input.closesAt,
    })
```

- [ ] **Step 5: De twee pagina's geven `closesAt` mee**

In `frontend/app/(dashboard)/dashboard/page.tsx`, in de aanroep `buildReminderText({ ... })` (regels 177-189), voeg na `launchDate: deliveryRecord?.launch_date ?? null,` toe:
```ts
    closesAt: campaign.closes_at ?? null,
```

In `frontend/app/(dashboard)/campaigns/[id]/page.tsx`, in de aanroep `buildReminderText({ ... })` (regels 152-164), voeg na `launchDate: deliveryRecord?.launch_date ?? null,` toe:
```ts
    closesAt: campaignMeta?.closes_at ?? null,
```

- [ ] **Step 6: Wizard: nieuwe toelichting, sluitdatum in de uitnodiging, tekst ververst in beide takken**

Vervang regel 77 van `frontend/components/dashboard/setup-wizard-card.tsx`:
```ts
const CLOSES_AT_HELP = 'Op deze datum vraagt Loep je de meting te sluiten of te verlengen. Drie weken is gebruikelijk; verlengen kan met twee weken per keer.'
```
door:
```ts
// Amendement spec par. 4.3a (18-9): de backend dwingt de sluitdatum af, dus dit is weer waar.
const CLOSES_AT_HELP = 'Na deze datum kan niemand meer invullen. Drie weken is gebruikelijk; sluiten of verlengen (twee weken per keer) doe je hier in Loep.'
```

Vervang de eerste opbouw (regels 179-185):
```ts
  const { subject: inviteSubject, body: inviteBody } = buildInviteTemplate({
    senderName: '',
    organizationName,
    scanType,
    surveyLink,
    departmentLinks: inviteDepartmentLinks,
  })
```
door:
```ts
  const { subject: inviteSubject, body: inviteBody } = buildInviteTemplate({
    senderName: '',
    organizationName,
    scanType,
    surveyLink,
    departmentLinks: inviteDepartmentLinks,
    closesAt: closesAt || null,
  })
```

Vervang in de segment-tak (regels 303-309) de opbouw binnen `refreshInviteDraft(...)`:
```ts
          buildInviteTemplate({
            senderName: '',
            organizationName,
            scanType,
            surveyLink,
            departmentLinks: buildSegmentSurveyLinks(frontendBaseUrl, publicSurveyToken, segResult.departments),
          }),
```
door:
```ts
          buildInviteTemplate({
            senderName: '',
            organizationName,
            scanType,
            surveyLink,
            departmentLinks: buildSegmentSurveyLinks(frontendBaseUrl, publicSurveyToken, segResult.departments),
            closesAt: closesAt || null,
          }),
```

Vervang de niet-segment-tak (regels 337-348):
```ts
    const invitedError = validateInvitedTotal(invitedCount)
    if (invitedError) { setStep1Error(invitedError); return }
    startTransition(async () => {
      const result = await saveLaunchSetupAction(campaignId, {
        launchDate,
        invitedCount: Number(invitedCount),
        closesAt,
        reminderChoice,
      })
      if (!result.ok) { setStep1Error(result.error ?? 'Er ging iets mis.'); return }
      setStep(2)
    })
```
door:
```ts
    const invitedError = validateInvitedTotal(invitedCount)
    if (invitedError) { setStep1Error(invitedError); return }
    startTransition(async () => {
      const result = await saveLaunchSetupAction(campaignId, {
        launchDate,
        invitedCount: Number(invitedCount),
        closesAt,
        reminderChoice,
      })
      if (!result.ok) { setStep1Error(result.error ?? 'Er ging iets mis.'); return }
      // De uitnodiging noemt de sluitdatum (amendement par. 4.3a). Die is in
      // stap 1 net gekozen of gewijzigd, dus de conceptmail wordt opnieuw
      // opgebouwd; eigen aanpassingen worden alleen vervangen als de tekst
      // echt veranderde, en dan met een melding (zelfde regel als de segment-tak).
      const refreshed = refreshInviteDraft(
        { generated: generatedInvite, subject: editableSubject, body: editableBody },
        buildInviteTemplate({
          senderName: '',
          organizationName,
          scanType,
          surveyLink,
          departmentLinks: inviteDepartmentLinks,
          closesAt: closesAt || null,
        }),
      )
      setGeneratedInvite(refreshed.generated)
      setEditableSubject(refreshed.subject)
      setEditableBody(refreshed.body)
      if (refreshed.replacedEdits) setInviteLinksReplacedEdits(true)
      setStep(2)
    })
```

De melding bij `inviteLinksReplacedEdits` (regel 712-714) zegt "bijgewerkt met de nieuwe afdelingslinks"; nu kan de oorzaak ook de sluitdatum zijn. Vervang die tekst:
```tsx
                  De uitnodiging is bijgewerkt met de nieuwe afdelingslinks. Je eigen aanpassingen aan de tekst zijn daarbij vervangen; voeg ze zo nodig opnieuw toe.
```
door:
```tsx
                  De uitnodiging is opnieuw opgebouwd met wat je in stap 1 hebt opgeslagen (sluitdatum of afdelingslinks). Je eigen aanpassingen aan de tekst zijn daarbij vervangen; voeg ze zo nodig opnieuw toe.
```
en in `setup-wizard-card.guard.test.ts` regel 38:
```ts
    expect(src).toContain('De uitnodiging is bijgewerkt met de nieuwe afdelingslinks.')
```
door:
```ts
    expect(src).toContain('De uitnodiging is opnieuw opgebouwd met wat je in stap 1 hebt opgeslagen (sluitdatum of afdelingslinks).')
```

- [ ] **Step 7: Run de tests, nu groen**

Run:
```bash
cd /c/Users/larsh/Desktop/Business/Verisight/.worktrees/klantsuite-2b/frontend
npx vitest run lib/self-send-comms.test.ts lib/dashboard/reminder-text.test.ts components/dashboard/setup-wizard-card.guard.test.ts lib/dashboard/dashboard-state-resolver.test.ts 2>&1 | tail -8
npx tsc --noEmit 2>&1 | grep -c "error TS"
```
Expected: alle vier de bestanden groen; tsc `133`. Een hoger tsc-getal betekent meestal een aanroeper van `buildReminderText` die `closesAt` mist (er zijn er twee: de dashboardpagina en de campagnepagina) of van `ReminderTextInput` in een test.

- [ ] **Step 8: Commit**

```bash
cd /c/Users/larsh/Desktop/Business/Verisight/.worktrees/klantsuite-2b
git add frontend/lib/self-send-comms.ts frontend/lib/self-send-comms.test.ts frontend/lib/dashboard/reminder-text.ts frontend/lib/dashboard/reminder-text.test.ts frontend/components/dashboard/setup-wizard-card.tsx frontend/components/dashboard/setup-wizard-card.guard.test.ts "frontend/app/(dashboard)/dashboard/page.tsx" "frontend/app/(dashboard)/campaigns/[id]/page.tsx"
git commit -m "feat(comms): uitnodiging en herinnering noemen tot en met welke dag invullen kan

Eén bron (self-send-comms.ts) zet 'Invullen kan tot en met [datum]' na de
link; zonder sluitdatum blijft de regel weg. De wizard bouwt de conceptmail
na stap 1 in beide modi opnieuw op, en de toelichting bij de sluitdatum
belooft weer wat de backend sinds het amendement afdwingt.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

### Task 3: Eén noemer en één statusvocabulaire; `/reports` met echte noemer, klikbare rijen, open lijst en grid-fix

**Files:**
- Create: `frontend/lib/dashboard/invited-denominator.ts`, `frontend/lib/dashboard/invited-denominator.test.ts`
- Create: `frontend/lib/dashboard/campaign-status.ts`, `frontend/lib/dashboard/campaign-status.test.ts`
- Create: `frontend/lib/dashboard/campaign-status-context.ts`, `frontend/lib/dashboard/campaign-status-context.guard.test.ts`
- Modify: `frontend/lib/dashboard/report-library.ts:1-27, 68-118` (+ test `lib/dashboard/report-library.test.ts:119-171`)
- Modify: `frontend/app/(dashboard)/reports/page.tsx` (+ test `page.self-service.test.ts`)
- Modify: `frontend/app/(dashboard)/dashboard/page.tsx:135-147` en `frontend/app/(dashboard)/campaigns/[id]/page.tsx:112-121` (noemer-helper)

- [ ] **Step 1: Falende tests voor de noemerregel**

Maak `frontend/lib/dashboard/invited-denominator.test.ts`:

```ts
import { describe, expect, it } from 'vitest'
import {
  DENOMINATOR_UNKNOWN_REASON,
  completionPct,
  formatResponseBasis,
  resolveInvitedDenominator,
} from './invited-denominator'

describe('resolveInvitedDenominator (spec 2026-09-16 par. 6.2; zelfde regel als het rapport sinds stresstest ronde 2)', () => {
  it('neemt invited_count uit het delivery record als noemer', () => {
    expect(resolveInvitedDenominator({ invitedCount: 30, respondentRows: 6 })).toEqual({
      known: true,
      value: 30,
      source: 'invited_count',
    })
  })

  it('valt alleen terug op respondentrijen als die er méér zijn dan het ingevulde aantal', () => {
    expect(resolveInvitedDenominator({ invitedCount: 30, respondentRows: 35 })).toEqual({
      known: true,
      value: 35,
      source: 'respondent_rows',
    })
    expect(resolveInvitedDenominator({ invitedCount: null, respondentRows: 18 })).toEqual({
      known: true,
      value: 18,
      source: 'respondent_rows',
    })
  })

  it('verzint nooit een noemer: zonder beide is er een reden, geen getal', () => {
    for (const invitedCount of [null, undefined, 0, -3, 2.5, Number.NaN]) {
      expect(resolveInvitedDenominator({ invitedCount, respondentRows: 0 })).toEqual({
        known: false,
        reason: DENOMINATOR_UNKNOWN_REASON,
      })
    }
    expect(DENOMINATOR_UNKNOWN_REASON).toBe('aantal uitgenodigden niet ingevuld')
  })

  it('formatteert X van Y met percentage, of X ingevuld met de reden', () => {
    expect(formatResponseBasis(6, resolveInvitedDenominator({ invitedCount: 30, respondentRows: 6 }))).toBe(
      '6 van 30 ingevuld (20%)',
    )
    expect(formatResponseBasis(12, resolveInvitedDenominator({ invitedCount: null, respondentRows: 0 }))).toBe(
      '12 ingevuld, aantal uitgenodigden niet ingevuld',
    )
  })

  it('geeft geen percentage zonder noemer', () => {
    expect(completionPct(6, resolveInvitedDenominator({ invitedCount: 30, respondentRows: 6 }))).toBe(20)
    expect(completionPct(6, resolveInvitedDenominator({ invitedCount: null, respondentRows: 0 }))).toBeNull()
  })

  it('bevat geen em- of en-dashes', () => {
    expect(formatResponseBasis(1, { known: false, reason: DENOMINATOR_UNKNOWN_REASON })).not.toMatch(/[—–]/)
  })
})
```

- [ ] **Step 2: Run de test om te zien dat hij faalt**

Run:
```bash
cd /c/Users/larsh/Desktop/Business/Verisight/.worktrees/klantsuite-2b/frontend
npx vitest run lib/dashboard/invited-denominator.test.ts 2>&1 | tail -5
```
Expected: `Failed to resolve import "./invited-denominator"`.

- [ ] **Step 3: `lib/dashboard/invited-denominator.ts`**

```ts
/**
 * Eén noemerregel voor "X van Y ingevuld" (spec 2026-09-16 par. 6.2), dezelfde
 * als het rapport sinds stresstest ronde 2 (backend build_report_data):
 *
 * 1. de noemer is campaign_delivery_records.invited_count, wat de klant in
 *    stap 1 invulde;
 * 2. alleen als er méér respondentrijen zijn dan dat aantal winnen de rijen
 *    (de klant onderschatte, of het is een oude managed-campagne waar de rijen
 *    vooraf zijn aangemaakt en invited_count leeg is);
 * 3. zonder beide is er geen noemer en dus geen percentage, maar een reden.
 *
 * Nooit een verzonnen noemer. Vóór dit plan las /reports campaign_stats.
 * total_invited (= gestarte respondenten), waardoor "18 van 18" 100% respons
 * suggereerde terwijl er 30 waren uitgenodigd.
 */
export type InvitedDenominator =
  | { known: true; value: number; source: 'invited_count' | 'respondent_rows' }
  | { known: false; reason: string }

export const DENOMINATOR_UNKNOWN_REASON = 'aantal uitgenodigden niet ingevuld'

function positiveInteger(value: number | null | undefined): number {
  return typeof value === 'number' && Number.isInteger(value) && value > 0 ? value : 0
}

export function resolveInvitedDenominator(args: {
  invitedCount: number | null | undefined
  respondentRows: number | null | undefined
}): InvitedDenominator {
  const invited = positiveInteger(args.invitedCount)
  const rows = positiveInteger(args.respondentRows)
  if (rows > invited) return { known: true, value: rows, source: 'respondent_rows' }
  if (invited > 0) return { known: true, value: invited, source: 'invited_count' }
  return { known: false, reason: DENOMINATOR_UNKNOWN_REASON }
}

export function completionPct(completed: number, denominator: InvitedDenominator): number | null {
  if (!denominator.known) return null
  return Math.round((completed / denominator.value) * 100)
}

export function formatResponseBasis(completed: number, denominator: InvitedDenominator): string {
  if (!denominator.known) return `${completed} ingevuld, ${denominator.reason}`
  return `${completed} van ${denominator.value} ingevuld (${completionPct(completed, denominator)}%)`
}
```

- [ ] **Step 4: Run de test, nu groen**

Run:
```bash
cd /c/Users/larsh/Desktop/Business/Verisight/.worktrees/klantsuite-2b/frontend
npx vitest run lib/dashboard/invited-denominator.test.ts 2>&1 | tail -3
```
Expected: `6 passed`.

- [ ] **Step 5: Falende tests voor de statusvocabulaire, met pariteit tegen de resolver**

Maak `frontend/lib/dashboard/campaign-status.test.ts`:

```ts
import { describe, expect, it } from 'vitest'
import { resolveDashboardState, type DashboardStateInput, type DashboardStateKind } from './dashboard-state-resolver'
import { isReportReleaseReady } from '@/lib/response-activation'
import {
  CAMPAIGN_STATUS_LABELS,
  deriveCampaignStatus,
  deriveCampaignStatusFor,
  type CampaignStatusContext,
  type CampaignStatusInput,
  type CampaignStatusKey,
} from './campaign-status'
import type { CampaignStats } from '@/lib/types'

function statusInput(overrides: Partial<CampaignStatusInput> = {}): CampaignStatusInput {
  return {
    isActive: true,
    scanType: 'retention',
    totalCompleted: 6,
    totalInvited: 30,
    launchConfirmedAt: '2026-09-13T09:00:00Z',
    launchDate: '2026-09-13',
    closesAt: '2026-10-04',
    reminderEnabled: true,
    reminderAfterDays: 5,
    reminderHandledAt: null,
    today: '2026-09-16',
    ...overrides,
  }
}

/** Dezelfde situatie als resolverinvoer, zodat beide uit één bron lezen. */
function resolverInput(s: CampaignStatusInput): DashboardStateInput {
  return {
    campaign: {
      id: 'c1',
      name: 'Meting',
      scanType: s.scanType,
      isActive: s.isActive,
      totalInvited: s.totalInvited,
      totalCompleted: s.totalCompleted,
      completionRatePct: s.totalInvited > 0 ? Math.round((s.totalCompleted / s.totalInvited) * 100) : 0,
      closedAt: s.isActive ? null : '2026-09-10T09:00:00Z',
    },
    launchConfirmedAt: s.launchConfirmedAt,
    launchDate: s.launchDate,
    closesAt: s.closesAt,
    reminderConfig: { enabled: s.reminderEnabled, firstReminderAfterDays: s.reminderAfterDays, maxReminderCount: 1 },
    reminderAlreadySentAt: s.reminderHandledAt,
    reminderSkipped: false,
    extensionCount: 0,
    reportReady: isReportReleaseReady(s.totalCompleted, { scanType: s.scanType }),
    today: s.today,
  }
}

const KIND_TO_STATUS: Record<DashboardStateKind, CampaignStatusKey | null> = {
  no_campaign: null,
  setup: 'setup',
  running: 'running',
  action: 'action',
  processing: 'closed_no_report',
  report_ready: 'report_ready',
}

describe('deriveCampaignStatus (spec 2026-09-16 par. 6.1)', () => {
  it('kent precies de vijf labels uit de spec, zonder streepjes', () => {
    expect(CAMPAIGN_STATUS_LABELS).toEqual({
      setup: 'Nog in te richten',
      running: 'Loopt',
      action: 'Actie nodig',
      closed_no_report: 'Gesloten, geen rapport',
      report_ready: 'Rapport beschikbaar',
    })
    for (const label of Object.values(CAMPAIGN_STATUS_LABELS)) expect(label).not.toMatch(/[—–]/)
  })

  const scenarios: Array<[string, Partial<CampaignStatusInput>, CampaignStatusKey]> = [
    ['niet gelanceerd', { launchConfirmedAt: null }, 'setup'],
    ['bevestigd maar zonder noemer', { totalInvited: 0 }, 'setup'],
    ['loopt, vóór de herinneringsdag', {}, 'running'],
    ['herinneringsdag', { today: '2026-09-18' }, 'action'],
    ['herinnering al afgehandeld', { today: '2026-09-18', reminderHandledAt: '2026-09-18T08:00:00Z' }, 'running'],
    ['sluitdatum bereikt', { today: '2026-10-04' }, 'action'],
    ['sluitdatum bereikt, herinnering uit', { today: '2026-10-04', reminderEnabled: false }, 'action'],
    ['genoeg respons, mag sluiten', { totalCompleted: 12 }, 'action'],
    ['gesloten met rapport', { isActive: false, totalCompleted: 14 }, 'report_ready'],
    ['gesloten zonder rapport', { isActive: false, totalCompleted: 7 }, 'closed_no_report'],
    ['culture_assessment gesloten onder de 30', { isActive: false, scanType: 'culture_assessment', totalCompleted: 20 }, 'closed_no_report'],
    ['geen sluitdatum, loopt', { closesAt: null }, 'running'],
  ]

  for (const [name, overrides, expected] of scenarios) {
    it(`${name} → ${expected}, en de resolver zegt hetzelfde`, () => {
      const input = statusInput(overrides)
      expect(deriveCampaignStatus(input)).toBe(expected)
      // Pariteit: de lijst mag nooit iets anders zeggen dan de kaart.
      const kind = resolveDashboardState(resolverInput(input)).kind
      expect(KIND_TO_STATUS[kind]).toBe(expected)
    })
  }
})

describe('deriveCampaignStatusFor: uit campaign_stats plus context', () => {
  function stats(overrides: Partial<CampaignStats> = {}): CampaignStats {
    return {
      campaign_id: 'c1',
      campaign_name: 'TEST Loep Behoud',
      scan_type: 'retention',
      organization_id: 'org-1',
      is_active: true,
      created_at: '2026-09-01T09:00:00Z',
      closed_at: null,
      closes_at: '2026-10-04',
      total_invited: 6,
      total_completed: 6,
      completion_rate_pct: 100,
      avg_risk_score: null,
      band_high: 0,
      band_medium: 0,
      band_low: 0,
      ...overrides,
    }
  }

  it('leest lancering, noemer en herinnering uit de context; zonder delivery record is het "Nog in te richten"', () => {
    const context: CampaignStatusContext = {
      deliveryByCampaign: new Map([
        ['c1', { launchConfirmedAt: '2026-09-13T09:00:00Z', launchDate: '2026-09-13', invitedCount: 30, reminderConfig: { enabled: true, firstReminderAfterDays: 5, maxReminderCount: 1 } }],
      ]),
      lastReminderEventAtByCampaign: new Map(),
      today: '2026-09-16',
    }
    expect(deriveCampaignStatusFor(stats(), context)).toBe('running')
    expect(deriveCampaignStatusFor(stats({ campaign_id: 'c2' }), context)).toBe('setup')
    expect(deriveCampaignStatusFor(stats(), { ...context, today: '2026-09-18' })).toBe('action')
    expect(
      deriveCampaignStatusFor(stats(), { ...context, today: '2026-09-18', lastReminderEventAtByCampaign: new Map([['c1', '2026-09-18T07:00:00Z']]) }),
    ).toBe('running')
  })

  it('gebruikt respondentrijen als noemer als invited_count ontbreekt (managed campagne)', () => {
    const context: CampaignStatusContext = {
      deliveryByCampaign: new Map([
        ['c1', { launchConfirmedAt: '2026-09-13T09:00:00Z', launchDate: '2026-09-13', invitedCount: null, reminderConfig: null }],
      ]),
      lastReminderEventAtByCampaign: new Map(),
      today: '2026-09-16',
    }
    expect(deriveCampaignStatusFor(stats({ total_invited: 40, total_completed: 3 }), context)).toBe('running')
  })
})
```

- [ ] **Step 6: Run de test om te zien dat hij faalt**

Run:
```bash
cd /c/Users/larsh/Desktop/Business/Verisight/.worktrees/klantsuite-2b/frontend
npx vitest run lib/dashboard/campaign-status.test.ts 2>&1 | tail -5
```
Expected: `Failed to resolve import "./campaign-status"`.

- [ ] **Step 7: `lib/dashboard/campaign-status.ts`**

```ts
import type { CampaignStats, ScanType } from '@/lib/types'
import { isReportReleaseReady } from '@/lib/response-activation'
import { isReminderDue } from '@/lib/dashboard/reminder-due'
import { normalizeReminderConfig } from '@/lib/launch-controls'
import { resolveInvitedDenominator } from '@/lib/dashboard/invited-denominator'

/**
 * Eén statusvocabulaire voor de lijst "Al je metingen" op /dashboard en de
 * rijen op /reports (spec 2026-09-16 par. 6.1 en 6.2). De kaart blijft het
 * domein van resolveDashboardState; deze afgeleide gebruikt dezelfde
 * primitieven (rapportdrempel, gelanceerd = bevestigd én noemer > 0,
 * sluitdatum bereikt, herinneringsdag) en is met een pariteitstest aan de
 * resolver vastgeklonken, zodat lijst en kaart nooit iets anders zeggen.
 */
export type CampaignStatusKey = 'setup' | 'running' | 'action' | 'closed_no_report' | 'report_ready'

export const CAMPAIGN_STATUS_LABELS: Record<CampaignStatusKey, string> = {
  setup: 'Nog in te richten',
  running: 'Loopt',
  action: 'Actie nodig',
  closed_no_report: 'Gesloten, geen rapport',
  report_ready: 'Rapport beschikbaar',
}

export interface CampaignStatusInput {
  isActive: boolean
  scanType: ScanType
  totalCompleted: number
  /** Effectieve noemer (resolveInvitedDenominator), 0 als onbekend. */
  totalInvited: number
  launchConfirmedAt: string | null
  launchDate: string | null
  closesAt: string | null
  reminderEnabled: boolean
  reminderAfterDays: number
  /** created_at van het laatste send_reminders-event (verstuurd of overgeslagen), of null. */
  reminderHandledAt: string | null
  /** YYYY-MM-DD, meegegeven zodat tests deterministisch zijn. */
  today: string
}

export function deriveCampaignStatus(input: CampaignStatusInput): CampaignStatusKey {
  const reportReady = isReportReleaseReady(input.totalCompleted, { scanType: input.scanType })
  if (!input.isActive) return reportReady ? 'report_ready' : 'closed_no_report'

  const launched = Boolean(input.launchConfirmedAt) && input.totalInvited > 0
  if (!launched) return 'setup'

  const expired = input.closesAt !== null && input.today.slice(0, 10) >= input.closesAt.slice(0, 10)
  if (expired) return 'action'

  const reminderDue =
    input.reminderEnabled &&
    isReminderDue({
      launchDate: input.launchDate,
      delayDays: input.reminderAfterDays,
      today: input.today,
      alreadySentAt: input.reminderHandledAt,
    })
  if (reminderDue) return 'action'

  if (reportReady) return 'action'
  return 'running'
}

export interface CampaignDeliveryLite {
  launchConfirmedAt: string | null
  launchDate: string | null
  invitedCount: number | null
  reminderConfig: unknown
}

export interface CampaignStatusContext {
  deliveryByCampaign: ReadonlyMap<string, CampaignDeliveryLite>
  /** created_at van het meest recente send_reminders-event (outcome completed) per campagne. */
  lastReminderEventAtByCampaign: ReadonlyMap<string, string>
  today: string
}

export function statusInputFor(campaign: CampaignStats, context: CampaignStatusContext): CampaignStatusInput {
  const delivery = context.deliveryByCampaign.get(campaign.campaign_id)
  const reminderConfig = normalizeReminderConfig(delivery?.reminderConfig ?? null)
  const denominator = resolveInvitedDenominator({
    invitedCount: delivery?.invitedCount ?? null,
    respondentRows: campaign.total_invited,
  })
  return {
    isActive: campaign.is_active,
    scanType: campaign.scan_type,
    totalCompleted: campaign.total_completed,
    totalInvited: denominator.known ? denominator.value : 0,
    launchConfirmedAt: delivery?.launchConfirmedAt ?? null,
    launchDate: delivery?.launchDate ?? null,
    closesAt: campaign.closes_at ?? null,
    reminderEnabled: reminderConfig.enabled,
    reminderAfterDays: reminderConfig.firstReminderAfterDays,
    reminderHandledAt: context.lastReminderEventAtByCampaign.get(campaign.campaign_id) ?? null,
    today: context.today,
  }
}

export function deriveCampaignStatusFor(campaign: CampaignStats, context: CampaignStatusContext): CampaignStatusKey {
  return deriveCampaignStatus(statusInputFor(campaign, context))
}
```

- [ ] **Step 8: Run de test, nu groen**

Run:
```bash
cd /c/Users/larsh/Desktop/Business/Verisight/.worktrees/klantsuite-2b/frontend
npx vitest run lib/dashboard/campaign-status.test.ts 2>&1 | tail -3
```
Expected: `15 passed` (1 labels + 12 scenario's + 2 context). Faalt een pariteitsregel, dan wijkt `deriveCampaignStatus` af van de resolver: pas de afgeleide aan, nooit de resolver.

- [ ] **Step 9: De contextlader (server) met source-guard**

Maak `frontend/lib/dashboard/campaign-status-context.guard.test.ts`:

```ts
import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

const src = readFileSync(new URL('./campaign-status-context.ts', import.meta.url), 'utf8')

describe('loadCampaignStatusContext (spec 2026-09-16 par. 6.2: één query met in(campaign_id, ...))', () => {
  it('haalt delivery records en herinneringsevents voor alle metingen tegelijk op', () => {
    expect(src.match(/\.in\('campaign_id', campaignIds\)/g)?.length).toBe(2)
    expect(src).toContain("select('campaign_id, launch_confirmed_at, launch_date, invited_count, reminder_config')")
    expect(src).toContain(".eq('action_key', 'send_reminders')")
    expect(src).toContain(".eq('outcome', 'completed')")
    expect(src).toContain("order('created_at', { ascending: false })")
  })

  it('faalt luid: een mislukte query wordt een fout, geen lege map', () => {
    expect(src).toContain('if (deliveryError) throw new Error(')
    expect(src).toContain('if (eventError) throw new Error(')
  })

  it('houdt per campagne alleen het nieuwste herinneringsevent', () => {
    expect(src).toContain('if (!lastReminderEventAtByCampaign.has(id))')
  })
})
```

Maak `frontend/lib/dashboard/campaign-status-context.ts`:

```ts
import type { SupabaseClient } from '@supabase/supabase-js'
import type { CampaignDeliveryLite, CampaignStatusContext } from '@/lib/dashboard/campaign-status'

/**
 * Laadt in twee queries (met .in()) wat deriveCampaignStatusFor per meting
 * nodig heeft: het delivery record (lancering, noemer, herinnering) en het
 * nieuwste send_reminders-event. Gebruikt door /dashboard (lijst) en /reports.
 *
 * Fail Loud: een mislukte query wordt een fout. Een lege map zou lezen als
 * "niets gelanceerd, geen noemer" en dat is een leugen, geen degradatie.
 */
export async function loadCampaignStatusContext(
  supabase: SupabaseClient,
  campaignIds: string[],
  today: string,
): Promise<CampaignStatusContext> {
  if (campaignIds.length === 0) {
    return { deliveryByCampaign: new Map(), lastReminderEventAtByCampaign: new Map(), today }
  }

  const [{ data: deliveries, error: deliveryError }, { data: events, error: eventError }] = await Promise.all([
    supabase
      .from('campaign_delivery_records')
      .select('campaign_id, launch_confirmed_at, launch_date, invited_count, reminder_config')
      .in('campaign_id', campaignIds),
    supabase
      .from('campaign_action_audit_events')
      .select('campaign_id, created_at')
      .in('campaign_id', campaignIds)
      .eq('action_key', 'send_reminders')
      .eq('outcome', 'completed')
      .order('created_at', { ascending: false }),
  ])

  if (deliveryError) throw new Error(`Kon de metinggegevens niet laden: ${deliveryError.message}`)
  if (eventError) throw new Error(`Kon de herinneringsgeschiedenis niet laden: ${eventError.message}`)

  const deliveryByCampaign = new Map<string, CampaignDeliveryLite>()
  for (const row of deliveries ?? []) {
    deliveryByCampaign.set(row.campaign_id as string, {
      launchConfirmedAt: (row.launch_confirmed_at as string | null) ?? null,
      launchDate: (row.launch_date as string | null) ?? null,
      invitedCount: (row.invited_count as number | null) ?? null,
      reminderConfig: row.reminder_config,
    })
  }

  // Nieuwste eerst (order desc): het eerste event per campagne is het laatste.
  const lastReminderEventAtByCampaign = new Map<string, string>()
  for (const row of events ?? []) {
    const id = row.campaign_id as string
    if (!lastReminderEventAtByCampaign.has(id)) lastReminderEventAtByCampaign.set(id, row.created_at as string)
  }

  return { deliveryByCampaign, lastReminderEventAtByCampaign, today }
}
```

Run:
```bash
cd /c/Users/larsh/Desktop/Business/Verisight/.worktrees/klantsuite-2b/frontend
npx vitest run lib/dashboard/campaign-status-context.guard.test.ts 2>&1 | tail -3
```
Expected: `3 passed`.

- [ ] **Step 10: Falende tests voor `buildReportOverviewRows` met context**

Vervang in `frontend/lib/dashboard/report-library.test.ts` de describe `buildReportOverviewRows (spec 2026-09-11 par. 4.3)` (regels 119-171) volledig door:

```ts
describe('buildReportOverviewRows (spec 2026-09-11 par. 4.3 en 2026-09-16 par. 6.2)', () => {
  function campaign(overrides: Partial<CampaignStats> = {}): CampaignStats {
    return {
      campaign_id: 'camp-1',
      campaign_name: 'Loep Behoud Voorjaar 2026',
      organization_id: 'org-1',
      scan_type: 'retention',
      is_active: false,
      total_invited: 0,
      total_completed: 12,
      completion_rate_pct: 0,
      created_at: '2026-04-02T10:00:00Z',
      closed_at: '2026-04-30T10:00:00Z',
      closes_at: null,
      ...overrides,
    } as CampaignStats
  }

  const launched = {
    launchConfirmedAt: '2026-04-02T10:00:00Z',
    launchDate: '2026-04-02',
    invitedCount: 30,
    reminderConfig: { enabled: true, firstReminderAfterDays: 5, maxReminderCount: 1 },
  }

  function context(overrides: Partial<CampaignStatusContext> = {}): CampaignStatusContext {
    return {
      deliveryByCampaign: new Map([['camp-1', launched]]),
      lastReminderEventAtByCampaign: new Map(),
      today: '2026-04-05',
      ...overrides,
    }
  }

  it('geeft een gesloten meting met tien of meer ingevuld vrij, met het label uit de statusvocabulaire', () => {
    const [row] = buildReportOverviewRows([campaign()], context())
    expect(row.isAvailable).toBe(true)
    expect(row.statusKey).toBe('report_ready')
    expect(row.status).toBe('Rapport beschikbaar')
    expect(row.periodLabel).toBe('Q2 2026')
  })

  it('geeft een lopende meting nooit vrij, ook niet met veel respons', () => {
    const [row] = buildReportOverviewRows([campaign({ is_active: true, total_completed: 40 })], context())
    expect(row.isAvailable).toBe(false)
    // 40 ingevuld boven de drempel: de kaart zegt "sluiten mag", de lijst zegt "Actie nodig".
    expect(row.status).toBe('Actie nodig')
  })

  it('noemt een gelanceerde meting onder de drempel "Loopt", en een niet-gelanceerde "Nog in te richten"', () => {
    const [running] = buildReportOverviewRows([campaign({ is_active: true, total_completed: 3 })], context())
    expect(running.status).toBe('Loopt')
    const [setup] = buildReportOverviewRows(
      [campaign({ is_active: true, total_completed: 0 })],
      context({ deliveryByCampaign: new Map() }),
    )
    expect(setup.status).toBe('Nog in te richten')
    expect(setup.status).not.toBe('Meting loopt')
  })

  it('noemt bij een gesloten meting onder de drempel het aantal en de drempel', () => {
    const [row] = buildReportOverviewRows([campaign({ total_completed: 7 })], context())
    expect(row.isAvailable).toBe(false)
    expect(row.statusKey).toBe('closed_no_report')
    expect(row.status).toContain('7')
    expect(row.status).toContain('10')
  })

  it('gebruikt invited_count uit het delivery record als noemer, niet de gestarte respondenten', () => {
    const [row] = buildReportOverviewRows([campaign({ total_invited: 12 })], context())
    expect(row.responseBasis).toBe('12 van 30 ingevuld (40%)')
  })

  it('valt terug op respondentrijen als die er méér zijn dan invited_count', () => {
    const [row] = buildReportOverviewRows([campaign({ total_invited: 35 })], context())
    expect(row.responseBasis).toBe('12 van 35 ingevuld (34%)')
  })

  it('verzint geen noemer: zonder invited_count en zonder rijen staat er een reden', () => {
    const [row] = buildReportOverviewRows([campaign()], context({ deliveryByCampaign: new Map() }))
    expect(row.responseBasis).toBe('12 ingevuld, aantal uitgenodigden niet ingevuld')
  })

  it('bevat geen em- of en-dashes', () => {
    for (const row of buildReportOverviewRows([campaign(), campaign({ campaign_id: 'x', is_active: true })], context())) {
      expect(row.status).not.toMatch(/[—–]/)
      expect(row.responseBasis).not.toMatch(/[—–]/)
    }
  })
})
```
en voeg bovenaan het testbestand de import toe:
```ts
import type { CampaignStatusContext } from './campaign-status'
```

- [ ] **Step 11: Run de test om te zien dat hij faalt**

Run:
```bash
cd /c/Users/larsh/Desktop/Business/Verisight/.worktrees/klantsuite-2b/frontend
npx vitest run lib/dashboard/report-library.test.ts 2>&1 | tail -12
```
Expected: de nieuwe describe faalt (`statusKey` undefined, "Beschikbaar nu" i.p.v. "Rapport beschikbaar", "12 ingevuld" i.p.v. de reden); de oude describe `report library` blijft groen.

- [ ] **Step 12: `lib/dashboard/report-library.ts` herschrijven op de context**

Vervang de imports (regels 1-6) door:
```ts
import { getResponseActivationThresholds, isDashboardReleaseReady } from '@/lib/response-activation'
import { SCAN_TYPE_LABELS, type CampaignStats, type ScanType } from '@/lib/types'
import {
  CAMPAIGN_STATUS_LABELS,
  deriveCampaignStatusFor,
  type CampaignStatusContext,
  type CampaignStatusKey,
} from '@/lib/dashboard/campaign-status'
import { formatResponseBasis, resolveInvitedDenominator } from '@/lib/dashboard/invited-denominator'
```

Voeg aan `HrReportDownloadRow` (regels 16-27) na `isAvailable: boolean` toe:
```ts
  /** Alleen gezet door buildReportOverviewRows; de legacy buildHrReportDownloadRows kent de vocabulaire niet. */
  statusKey?: CampaignStatusKey
```

Vervang het blok vanaf `// ─── Rapportenoverzicht` (regel 68) tot het einde van het bestand door:

```ts
// ─── Rapportenoverzicht ───────────────────────────────────────────────────────
// Gebruikt door reports/page.tsx (spec 2026-09-11 par. 4.3, 2026-09-16 par. 6.2).
// De oudere buildHrReportDownloadRows hierboven blijft ongemoeid: die hangt aan
// de dashboarddrempel en wordt alleen nog door dashboard/cockpit-index.ts gelezen.

/**
 * Een rapport bestaat pas als de meting gesloten is én de rapportdrempel is
 * gehaald; dat is precies de status 'report_ready' uit de gedeelde
 * vocabulaire. De noemer komt uit het delivery record (invited_count), nooit
 * uit campaign_stats.total_invited alleen (= gestarte respondenten, wat bij
 * self_send "18 van 18" opleverde terwijl er 30 waren uitgenodigd).
 */
export function buildReportOverviewRows(
  campaigns: CampaignStats[],
  context: CampaignStatusContext,
): HrReportDownloadRow[] {
  return campaigns
    .filter((campaign) => campaign.scan_type !== 'culture_assessment')
    .map((campaign) => {
      const thresholds = getResponseActivationThresholds(campaign.scan_type)
      const statusKey = deriveCampaignStatusFor(campaign, context)
      const isAvailable = statusKey === 'report_ready'
      const delivery = context.deliveryByCampaign.get(campaign.campaign_id)
      const denominator = resolveInvitedDenominator({
        invitedCount: delivery?.invitedCount ?? null,
        respondentRows: campaign.total_invited,
      })
      const date = new Date(campaign.created_at)
      const quarter = Math.floor(date.getUTCMonth() / 3) + 1

      // Gesloten zonder rapport houdt de uitleg met aantal en drempel: dat is
      // wat de klant hier wil weten. De andere vier gebruiken het gedeelde label.
      const status =
        statusKey === 'closed_no_report'
          ? `Gesloten met ${campaign.total_completed} ingevuld. Minimaal ${thresholds.insightMin} nodig voor een rapport.`
          : CAMPAIGN_STATUS_LABELS[statusKey]

      return {
        campaignId: campaign.campaign_id,
        campaignName: campaign.campaign_name,
        scanType: campaign.scan_type,
        scanName: SCAN_TYPE_LABELS[campaign.scan_type],
        periodLabel: `Q${quarter} ${date.getUTCFullYear()}`,
        createdAt: campaign.created_at,
        responseBasis: formatResponseBasis(campaign.total_completed, denominator),
        status,
        statusKey,
        isAvailable,
        extraDisambiguator: null,
      }
    })
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
}
```
(`isReportReleaseReady` wordt hier niet meer direct gebruikt; de afgeleide status beslist. `isDashboardReleaseReady` blijft voor de legacy functie.)

- [ ] **Step 13: Run de test, nu groen**

Run:
```bash
cd /c/Users/larsh/Desktop/Business/Verisight/.worktrees/klantsuite-2b/frontend
npx vitest run lib/dashboard/report-library.test.ts 2>&1 | tail -3
```
Expected: `9 passed`.

- [ ] **Step 14: Falende source-guards voor `/reports`**

Vervang `frontend/app/(dashboard)/reports/page.self-service.test.ts` door:

```ts
import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

const source = readFileSync(new URL('./page.tsx', import.meta.url), 'utf8')

describe('rapportenoverzicht (spec 2026-09-11 par. 4.3)', () => {
  it('bouwt de rijen met de rapportvrijgaveregel', () => {
    expect(source).toContain('buildReportOverviewRows')
    expect(source).not.toContain('buildHrReportDownloadRows')
  })

  it('plant hier geen bespreking meer', () => {
    expect(source).not.toContain('CALENDLY')
    expect(source).not.toContain('mailto:')
    expect(source).not.toContain('Plan bespreking')
    expect(source).not.toContain('Managementbespreking plannen')
  })

  it('faalt luid als het overzicht niet geladen kan worden', () => {
    expect(source).toContain('throw new Error')
  })
})

describe('rapportenoverzicht (spec 2026-09-16 par. 6.2, walkthrough 6.1 t/m 6.5)', () => {
  it('laadt de noemer en de status uit het delivery record, in één keer voor alle metingen', () => {
    expect(source).toContain('loadCampaignStatusContext')
    expect(source).toContain('buildReportOverviewRows(campaigns, statusContext)')
  })

  it('maakt elke rij klikbaar naar de meting (walkthrough 6.3)', () => {
    expect(source).toContain('href={`/campaigns/${row.campaignId}`}')
  })

  it('verstopt de lopende metingen niet meer in een dichtgeklapte details (walkthrough 6.4)', () => {
    expect(source).not.toContain('<details')
    expect(source).not.toContain('<summary')
    expect(source).toContain('Nog niet beschikbaar')
  })

  it('gebruikt geldige grid-tracks: underscores, geen komma\'s tussen kolommen (walkthrough 6.5)', () => {
    // Tailwind arbitrary values scheiden tracks met _, niet met een komma:
    // grid-cols-[a,b,c] levert ongeldige CSS op en de kolomkoppen stapelden.
    expect(source).toContain('lg:grid-cols-[minmax(0,1.45fr)_150px_190px_auto]')
    expect(source).not.toContain('1.45fr),150px')
  })

  it('bevat geen em- of en-dashes', () => {
    expect(source).not.toMatch(/[—–]/)
  })
})
```

Run:
```bash
cd /c/Users/larsh/Desktop/Business/Verisight/.worktrees/klantsuite-2b/frontend
npx vitest run "app/(dashboard)/reports/page.self-service.test.ts" 2>&1 | tail -8
```
Expected: de nieuwe describe faalt op alle vijf; de oude drie slagen.

- [ ] **Step 15: `/reports` herschrijven**

Vervang `frontend/app/(dashboard)/reports/page.tsx` volledig door:

```tsx
import type { ReactNode } from 'react'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { PdfDownloadButton } from '@/app/(dashboard)/campaigns/[id]/pdf-download-button'
import { SuiteAccessDenied } from '@/components/dashboard/suite-access-denied'
import { loadCampaignStatusContext } from '@/lib/dashboard/campaign-status-context'
import { buildReportOverviewRows } from '@/lib/dashboard/report-library'
import { createClient } from '@/lib/supabase/server'
import { loadSuiteAccessContext } from '@/lib/suite-access-server'
import type { CampaignStats } from '@/lib/types'
import { buildReportDownloadIndex, type ReportDownloadRow } from './report-download-index'

// Tailwind scheidt tracks in een arbitrary value met een underscore. Met
// komma's (de oude vorm) was de CSS ongeldig en stapelden de kolomkoppen.
const ROW_GRID = 'lg:grid-cols-[minmax(0,1.45fr)_150px_190px_auto]'

function todayIso(): string {
  return new Date().toISOString().slice(0, 10)
}

function ReportRow({ row, children }: { row: ReportDownloadRow; children: ReactNode }) {
  return (
    <article
      className={`grid gap-4 border-b border-slate-200 px-5 py-5 last:border-b-0 lg:items-center ${ROW_GRID}`}
    >
      <div className="min-w-0">
        <p className="text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-[color:var(--dashboard-muted)]">
          {row.scanName}
        </p>
        <Link
          href={`/campaigns/${row.campaignId}`}
          className="mt-2 block text-[1.02rem] font-semibold tracking-[-0.03em] text-[color:var(--dashboard-ink)] underline-offset-4 hover:underline"
        >
          {row.campaignName}
        </Link>
        {row.extraDisambiguator ? (
          <p className="mt-2 text-xs text-[color:var(--dashboard-muted)]">{row.extraDisambiguator}</p>
        ) : null}
      </div>
      <p className="text-sm text-[color:var(--dashboard-text)]">{row.periodLabel}</p>
      <p className="text-sm text-[color:var(--dashboard-text)]">{row.responseBasis}</p>
      <div className="flex justify-start lg:justify-end">{children}</div>
    </article>
  )
}

export default async function ReportsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { context } = await loadSuiteAccessContext(supabase, user.id)

  if (!context.canViewReports) {
    return (
      <SuiteAccessDenied
        title="Je ziet hier geen rapporten"
        description="Jouw login opent alleen Action Center. Campagnedetails en rapporten blijven zichtbaar voor HR en Loep."
      />
    )
  }

  const { data: stats, error } = await supabase
    .from('campaign_stats')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) throw new Error(`Kon het rapportenoverzicht niet laden: ${error.message}`)

  const campaigns = (stats ?? []) as CampaignStats[]
  const statusContext = await loadCampaignStatusContext(
    supabase,
    campaigns.map((campaign) => campaign.campaign_id),
    todayIso(),
  )
  const reportIndex = buildReportDownloadIndex(buildReportOverviewRows(campaigns, statusContext))

  return (
    <div className="space-y-8">
      <section className="space-y-3 border-b border-slate-200/80 pb-6">
        <div className="flex items-center gap-3">
          <span className="h-px w-10 bg-[#C36A29]" />
          <p className="text-[0.72rem] font-semibold uppercase tracking-[0.28em] text-[color:var(--dashboard-muted)]">
            Rapporten
          </p>
        </div>
        <h1 className="text-[2.4rem] font-semibold leading-none tracking-[-0.06em] text-[color:var(--dashboard-ink)] md:text-[3rem]">
          Je rapporten
        </h1>
        <p className="max-w-3xl text-sm leading-6 text-[color:var(--dashboard-text)]">
          Elke afgeronde meting staat hier als PDF. Het antwoord staat op pagina twee; de
          gespreksagenda achterin is de leidraad voor het gesprek met je managementteam. Lopende
          metingen zie je met hun status; klik op de naam om naar de meting te gaan.
        </p>
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-lg font-semibold tracking-[-0.02em] text-[color:var(--dashboard-ink)]">
            Beschikbaar nu
          </h2>
          <p className="text-[0.72rem] font-semibold uppercase tracking-[0.2em] text-[color:var(--dashboard-muted)]">
            {reportIndex.availableRows.length}{' '}
            {reportIndex.availableRows.length === 1 ? 'rapport' : 'rapporten'}
          </p>
        </div>

        {reportIndex.availableRows.length > 0 ? (
          <div className="overflow-hidden border border-slate-200 bg-white">
            <div
              className={`hidden border-b border-slate-200 bg-[color:var(--dashboard-soft)]/45 px-5 py-3 text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-[color:var(--dashboard-muted)] lg:grid lg:items-center ${ROW_GRID}`}
            >
              <span>Scan</span>
              <span>Periode</span>
              <span>Respons</span>
              <span className="text-right">Download PDF</span>
            </div>
            {reportIndex.availableRows.map((row) => (
              <ReportRow key={row.campaignId} row={row}>
                <PdfDownloadButton
                  campaignId={row.campaignId}
                  campaignName={row.campaignName}
                  scanType={row.scanType}
                  label="Download PDF"
                  align="end"
                />
              </ReportRow>
            ))}
          </div>
        ) : (
          <div className="border border-dashed border-slate-200 bg-white/80 px-5 py-8 text-sm leading-7 text-[color:var(--dashboard-text)]">
            Nog geen rapport beschikbaar. Zodra je een meting sluit met voldoende ingevulde
            vragenlijsten, staat de PDF hier klaar.
          </div>
        )}
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-lg font-semibold tracking-[-0.02em] text-[color:var(--dashboard-ink)]">
            Nog niet beschikbaar
          </h2>
          <p className="text-[0.72rem] font-semibold uppercase tracking-[0.2em] text-[color:var(--dashboard-muted)]">
            {reportIndex.unavailableRows.length}{' '}
            {reportIndex.unavailableRows.length === 1 ? 'meting' : 'metingen'}
          </p>
        </div>
        <div className="overflow-hidden border border-slate-200 bg-white">
          {reportIndex.unavailableRows.length > 0 ? (
            reportIndex.unavailableRows.map((row) => (
              <ReportRow key={row.campaignId} row={row}>
                <p className="text-xs font-semibold text-[color:var(--dashboard-muted)] lg:text-right">
                  {row.status}
                </p>
              </ReportRow>
            ))
          ) : (
            <div className="px-5 py-5 text-sm text-[color:var(--dashboard-text)]">
              Geen lopende metingen.
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
```

- [ ] **Step 16: Dashboard- en campagnepagina op dezelfde noemerregel**

In `frontend/app/(dashboard)/dashboard/page.tsx` de import toevoegen:
```ts
import { completionPct, resolveInvitedDenominator } from '@/lib/dashboard/invited-denominator'
```
en het blok (regels 135-147):
```ts
  const isSelfSend = campaignRow?.comms_mode === 'self_send'
  const manualInvitedCount = deliveryRecord?.invited_count ?? null
  const effectiveTotalInvited = isSelfSend && manualInvitedCount != null
    ? manualInvitedCount
    : campaign.total_invited
  // Herbereken het percentage uit dezelfde effectieve noemer als hierboven.
  // De rauwe view-waarde completion_rate_pct rekent op count(respondents)
  // (= gestart), wat bij self_send afwijkt van de handmatige invited_count en
  // een zichzelf-tegensprekend "X van Y (Z%)" opleverde. Gelijk aan de
  // campagnedetailpagina, zodat beide oppervlakken hetzelfde tonen.
  const effectiveCompletionRatePct = effectiveTotalInvited > 0
    ? Math.round((campaign.total_completed / effectiveTotalInvited) * 100)
    : (campaign.completion_rate_pct ?? 0)
```
vervangen door:
```ts
  // Eén noemer overal (spec 2026-09-16 par. 6.2, zelfde regel als /reports en
  // het rapport): invited_count uit het delivery record; respondentrijen alleen
  // als die er méér zijn; anders 0 en geen percentage. Nooit een verzonnen noemer.
  const denominator = resolveInvitedDenominator({
    invitedCount: deliveryRecord?.invited_count ?? null,
    respondentRows: campaign.total_invited,
  })
  const effectiveTotalInvited = denominator.known ? denominator.value : 0
  const effectiveCompletionRatePct = completionPct(campaign.total_completed, denominator) ?? 0
```

In `frontend/app/(dashboard)/campaigns/[id]/page.tsx` dezelfde import toevoegen en het blok (regels 112-121):
```ts
  // Bij self_send is total_invited in de stats view 0 (geen pre-aangemaakte respondenten).
  // Gebruik invited_count van het delivery record als noemer wanneer comms_mode = 'self_send'.
  const isSelfSend = campaignMeta?.comms_mode === 'self_send'
  const manualInvitedCount = deliveryRecord?.invited_count ?? null
  const effectiveTotalInvited = isSelfSend && manualInvitedCount != null
    ? manualInvitedCount
    : stats.total_invited
  const effectiveCompletionRatePct = effectiveTotalInvited > 0
    ? Math.round((stats.total_completed / effectiveTotalInvited) * 100)
    : (stats.completion_rate_pct ?? 0)
```
vervangen door:
```ts
  // Eén noemer overal (spec 2026-09-16 par. 6.2): zie dashboard/page.tsx.
  const denominator = resolveInvitedDenominator({
    invitedCount: deliveryRecord?.invited_count ?? null,
    respondentRows: stats.total_invited,
  })
  const effectiveTotalInvited = denominator.known ? denominator.value : 0
  const effectiveCompletionRatePct = completionPct(stats.total_completed, denominator) ?? 0
```

- [ ] **Step 17: Run alle geraakte tests, tsc**

Run:
```bash
cd /c/Users/larsh/Desktop/Business/Verisight/.worktrees/klantsuite-2b/frontend
npx vitest run lib/dashboard "app/(dashboard)/reports" "app/(dashboard)/dashboard" "app/(dashboard)/campaigns" 2>&1 | tail -8
npx tsc --noEmit 2>&1 | grep -c "error TS"
```
Expected: geen nieuwe falende tests ten opzichte van de baseline (de bekende falende tests in die mappen blijven gelijk); tsc `133`.

- [ ] **Step 18: Commit**

```bash
cd /c/Users/larsh/Desktop/Business/Verisight/.worktrees/klantsuite-2b
git add frontend/lib/dashboard/invited-denominator.ts frontend/lib/dashboard/invited-denominator.test.ts frontend/lib/dashboard/campaign-status.ts frontend/lib/dashboard/campaign-status.test.ts frontend/lib/dashboard/campaign-status-context.ts frontend/lib/dashboard/campaign-status-context.guard.test.ts frontend/lib/dashboard/report-library.ts frontend/lib/dashboard/report-library.test.ts "frontend/app/(dashboard)/reports/page.tsx" "frontend/app/(dashboard)/reports/page.self-service.test.ts" "frontend/app/(dashboard)/dashboard/page.tsx" "frontend/app/(dashboard)/campaigns/[id]/page.tsx"
git commit -m "feat(reports): één noemer en één statusvocabulaire; /reports met echte noemer en klikbare rijen

resolveInvitedDenominator (invited_count, respondentrijen alleen als méér,
anders een reden) en deriveCampaignStatus (vijf labels, pariteit met de
resolver) worden gedeeld door /reports, /dashboard en de campagnepagina.
/reports laadt delivery records en herinneringsevents in twee .in()-queries,
linkt elke rij naar de meting, toont de lopende metingen open, en de
grid-tracks zijn weer geldige CSS.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

### Task 4: `/dashboard` toont alle metingen; de kaart noemt de meting; "Alle metingen"-link; dubbele rapportkaart weg; "Je meting staat klaar"

**Files:**
- Create: `frontend/lib/dashboard/campaign-list.ts`, `frontend/lib/dashboard/campaign-list.test.ts`
- Create: `frontend/lib/dashboard/self-link.ts`, `frontend/lib/dashboard/self-link.test.ts`
- Create: `frontend/components/dashboard/campaign-list-section.tsx`, `frontend/components/dashboard/campaign-list-section.test.ts`
- Create: `frontend/components/dashboard/welcome-gate.test.ts`
- Modify: `frontend/lib/dashboard/dashboard-state-resolver.ts:68-95, 103-122, 142-149` (+ test)
- Modify: `frontend/components/dashboard/dashboard-state-card.tsx:27-32`, `running-state-card.tsx:20-25`, `read-only-state-card.tsx:13-17` (+ tests)
- Modify: `frontend/app/(dashboard)/dashboard/page.tsx` (+ `page.test.ts:17-21`)
- Modify: `frontend/app/(dashboard)/campaigns/[id]/page.tsx:130-150, 168-175, 186-212` (+ `page.standalone.test.ts`)
- Modify: `frontend/components/dashboard/welcome-gate.tsx:117`

- [ ] **Step 1: Falende tests voor hoofdkaartkeuze, lijstitems en zelf-link**

Maak `frontend/lib/dashboard/campaign-list.test.ts`:

```ts
import { describe, expect, it } from 'vitest'
import { buildCampaignListItems, pickMainCampaign } from './campaign-list'
import type { CampaignStatusContext } from './campaign-status'
import type { CampaignStats } from '@/lib/types'

function stats(overrides: Partial<CampaignStats>): CampaignStats {
  return {
    campaign_id: 'x',
    campaign_name: 'Meting',
    scan_type: 'retention',
    organization_id: 'org-1',
    is_active: true,
    created_at: '2026-09-01T09:00:00Z',
    closed_at: null,
    closes_at: null,
    total_invited: 0,
    total_completed: 0,
    completion_rate_pct: 0,
    avg_risk_score: null,
    band_high: 0,
    band_medium: 0,
    band_low: 0,
    ...overrides,
  }
}

// De testklant: A gesloten (juli), B lopend (sept, nieuwste), C in te richten.
const A = stats({ campaign_id: 'a', campaign_name: 'TEST Loep Behoud - gesloten met rapport', is_active: false, created_at: '2026-07-15T09:00:00Z', closed_at: '2026-08-27T09:00:00Z', total_completed: 18 })
const B = stats({ campaign_id: 'b', campaign_name: 'TEST Loep Behoud - lopend', created_at: '2026-09-13T09:00:00Z', total_completed: 6 })
const C = stats({ campaign_id: 'c', campaign_name: 'TEST Loep Vertrek - nog in te richten', scan_type: 'exit', created_at: '2026-09-10T09:00:00Z' })

const context: CampaignStatusContext = {
  deliveryByCampaign: new Map([
    ['b', { launchConfirmedAt: '2026-09-13T09:00:00Z', launchDate: '2026-09-13', invitedCount: 30, reminderConfig: { enabled: true, firstReminderAfterDays: 5, maxReminderCount: 1 } }],
    ['c', { launchConfirmedAt: null, launchDate: null, invitedCount: null, reminderConfig: null }],
  ]),
  lastReminderEventAtByCampaign: new Map(),
  today: '2026-09-16',
}

describe('pickMainCampaign (spec 2026-09-16 par. 6.1)', () => {
  it('kiest de nieuwste actieve meting, ongeacht de volgorde van de invoer', () => {
    expect(pickMainCampaign([A, C, B])?.campaign_id).toBe('b')
    expect(pickMainCampaign([B, C, A])?.campaign_id).toBe('b')
  })

  it('kiest de nieuwste als er geen actieve is', () => {
    const closedB = { ...B, is_active: false }
    const closedC = { ...C, is_active: false }
    expect(pickMainCampaign([A, closedC, closedB])?.campaign_id).toBe('b')
  })

  it('geeft null zonder metingen', () => {
    expect(pickMainCampaign([])).toBeNull()
  })
})

describe('buildCampaignListItems', () => {
  it('geeft elke meting een naam, scan, statuslabel en link, nieuwste eerst, en markeert de hoofdkaart', () => {
    const items = buildCampaignListItems([A, C, B], context, 'b')
    expect(items.map((i) => i.campaignId)).toEqual(['b', 'c', 'a'])
    expect(items[0]).toEqual({
      campaignId: 'b',
      name: 'TEST Loep Behoud - lopend',
      scanLabel: 'Loep Behoud',
      statusKey: 'running',
      statusLabel: 'Loopt',
      href: '/campaigns/b',
      isMain: true,
    })
    expect(items[1]).toMatchObject({ name: 'TEST Loep Vertrek - nog in te richten', scanLabel: 'Loep Vertrek', statusLabel: 'Nog in te richten', isMain: false })
    expect(items[2]).toMatchObject({ statusKey: 'report_ready', statusLabel: 'Rapport beschikbaar', href: '/campaigns/a' })
  })

  it('bevat geen em- of en-dashes in labels', () => {
    for (const item of buildCampaignListItems([A, B, C], context, null)) {
      expect(item.statusLabel).not.toMatch(/[—–]/)
      expect(item.scanLabel).not.toMatch(/[—–]/)
    }
  })
})
```

Maak `frontend/lib/dashboard/self-link.test.ts`:

```ts
import { describe, expect, it } from 'vitest'
import { resolveDashboardState } from './dashboard-state-resolver'
import { withoutSelfLink } from './self-link'

const reportReady = resolveDashboardState({
  campaign: {
    id: 'c1',
    name: 'Meting',
    scanType: 'retention',
    isActive: false,
    totalInvited: 30,
    totalCompleted: 18,
    completionRatePct: 60,
    closedAt: '2026-08-27T09:00:00Z',
  },
  launchConfirmedAt: '2026-07-15T09:00:00Z',
  launchDate: '2026-07-15',
  closesAt: null,
  reminderConfig: { enabled: true, firstReminderAfterDays: 5, maxReminderCount: 1 },
  reminderAlreadySentAt: null,
  reminderSkipped: false,
  extensionCount: 0,
  reportReady: true,
  today: '2026-09-16',
})

describe('withoutSelfLink (spec 2026-09-16 par. 7: dubbele rapportkaart, walkthrough 5.2)', () => {
  it('haalt een link-CTA weg die naar de pagina zelf wijst', () => {
    expect(reportReady.ctaHref).toBe('/campaigns/c1')
    const onOwnPage = withoutSelfLink(reportReady, '/campaigns/c1')
    expect(onOwnPage.ctaLabel).toBeNull()
    expect(onOwnPage.ctaHref).toBeNull()
    expect(onOwnPage.ctaKind).toBeNull()
    // De rest van de staat blijft staan.
    expect(onOwnPage.primaryMessage).toBe(reportReady.primaryMessage)
    expect(onOwnPage.kind).toBe('report_ready')
  })

  it('laat elke andere CTA met rust (dashboard, mailto, eilandacties)', () => {
    expect(withoutSelfLink(reportReady, '/dashboard')).toBe(reportReady)
    const mailto = { ...reportReady, ctaHref: 'mailto:hallo@getloep.nl', ctaLabel: 'Mail Loep' }
    expect(withoutSelfLink(mailto, '/campaigns/c1')).toBe(mailto)
    const island = { ...reportReady, ctaKind: 'close_campaign' as const, ctaHref: null }
    expect(withoutSelfLink(island, '/campaigns/c1')).toBe(island)
  })
})
```

- [ ] **Step 2: Run de tests om te zien dat ze falen**

Run:
```bash
cd /c/Users/larsh/Desktop/Business/Verisight/.worktrees/klantsuite-2b/frontend
npx vitest run lib/dashboard/campaign-list.test.ts lib/dashboard/self-link.test.ts 2>&1 | tail -6
```
Expected: beide bestanden falen op `Failed to resolve import`.

- [ ] **Step 3: `lib/dashboard/campaign-list.ts` en `lib/dashboard/self-link.ts`**

`frontend/lib/dashboard/campaign-list.ts`:
```ts
import { SCAN_TYPE_LABELS, type CampaignStats } from '@/lib/types'
import {
  CAMPAIGN_STATUS_LABELS,
  deriveCampaignStatusFor,
  type CampaignStatusContext,
  type CampaignStatusKey,
} from '@/lib/dashboard/campaign-status'

function newestFirst<T extends { created_at: string }>(campaigns: readonly T[]): T[] {
  return [...campaigns].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
}

/**
 * Hoofdkaart op /dashboard (spec 2026-09-16 par. 6.1): de nieuwste actieve
 * meting, of de nieuwste als er geen actieve is. Vóór dit plan koos de pagina
 * blind de nieuwste (limit 1), waardoor een meting die nog ingericht moest
 * worden nergens te vinden was (walkthrough 1.1).
 */
export function pickMainCampaign<T extends { is_active: boolean; created_at: string }>(
  campaigns: readonly T[],
): T | null {
  if (campaigns.length === 0) return null
  const sorted = newestFirst(campaigns)
  return sorted.find((campaign) => campaign.is_active) ?? sorted[0]
}

export interface CampaignListItem {
  campaignId: string
  name: string
  scanLabel: string
  statusKey: CampaignStatusKey
  statusLabel: string
  href: string
  /** Deze meting staat al als hoofdkaart bovenaan. */
  isMain: boolean
}

export function buildCampaignListItems(
  campaigns: readonly CampaignStats[],
  context: CampaignStatusContext,
  mainCampaignId: string | null,
): CampaignListItem[] {
  return newestFirst(campaigns).map((campaign) => {
    const statusKey = deriveCampaignStatusFor(campaign, context)
    return {
      campaignId: campaign.campaign_id,
      name: campaign.campaign_name,
      scanLabel: SCAN_TYPE_LABELS[campaign.scan_type] ?? campaign.scan_type,
      statusKey,
      statusLabel: CAMPAIGN_STATUS_LABELS[statusKey],
      href: `/campaigns/${campaign.campaign_id}`,
      isMain: campaign.campaign_id === mainCampaignId,
    }
  })
}
```

`frontend/lib/dashboard/self-link.ts`:
```ts
import type { DashboardState } from '@/lib/dashboard/dashboard-state-resolver'

/**
 * Een kaart op de campagnepagina mag geen knop tonen die naar die pagina
 * zelf linkt (walkthrough 5.2: "Open rapport" deed zichtbaar niets). De
 * resolver blijft pagina-onafhankelijk; de pagina haalt de zelf-link weg.
 */
export function withoutSelfLink(state: DashboardState, currentPath: string): DashboardState {
  if (state.ctaKind !== 'link' || state.ctaHref !== currentPath) return state
  return { ...state, ctaLabel: null, ctaHref: null, ctaKind: null }
}
```

Run:
```bash
cd /c/Users/larsh/Desktop/Business/Verisight/.worktrees/klantsuite-2b/frontend
npx vitest run lib/dashboard/campaign-list.test.ts lib/dashboard/self-link.test.ts 2>&1 | tail -3
```
Expected: `7 passed`.

- [ ] **Step 4: Resolver draagt de campagnenaam (walkthrough 1.2)**

Falende test: voeg in `frontend/lib/dashboard/dashboard-state-resolver.test.ts` onderaan de describe toe:

```ts
  it('draagt de naam van de meting in elke staat, zodat de kaart hem kan noemen (walkthrough 1.2)', () => {
    expect(resolveDashboardState(baseInput()).campaignName).toBe('Loep Vertrek Q2 2026')
    expect(resolveDashboardState(baseInput({ launchConfirmedAt: null })).campaignName).toBe('Loep Vertrek Q2 2026')
    expect(
      resolveDashboardState(baseInput({ campaign: withCampaign({ isActive: false, totalCompleted: 14 }), reportReady: true })).campaignName,
    ).toBe('Loep Vertrek Q2 2026')
    expect(resolveDashboardState(baseInput({ campaign: null })).campaignName).toBeNull()
  })
```

Run `npx vitest run lib/dashboard/dashboard-state-resolver.test.ts 2>&1 | tail -5`. Expected: die ene test faalt (`undefined` i.p.v. de naam).

In `frontend/lib/dashboard/dashboard-state-resolver.ts`:
- in `interface DashboardState` (regels 68-95), direct na `campaignId: string | null`, toevoegen:
  ```ts
    /** Naam van de meting; null in State 0. De kaart noemt hem, want met meer metingen is "Vandaag: stuur de herinnering" anders onbenoemd. */
    campaignName: string | null
  ```
- in `EMPTY_STATE` (regels 103-122), na `campaignId: null,` toevoegen: `campaignName: null,`
- in `const base = {` (regels 142-149), na `campaignId: campaign.id,` toevoegen: `campaignName: campaign.name,`

Run `npx vitest run lib/dashboard/dashboard-state-resolver.test.ts 2>&1 | tail -3`. Expected: alle tests groen.

- [ ] **Step 5: De drie kaarten noemen de meting**

Falende guards. In `frontend/components/dashboard/dashboard-state-actions.test.ts`, in de describe `dashboard state card` (regels 174-200), toevoegen:
```ts
  it('noemt de meting boven de kop (walkthrough 1.2)', () => {
    expect(card).toContain('state.campaignName')
  })
```
In `frontend/components/dashboard/running-state-card.test.ts` toevoegen:
```ts
  it('noemt de meting naast de scan (walkthrough 1.2)', () => {
    expect(src).toContain('state.campaignName')
  })
```
In `frontend/components/dashboard/read-only-state-card.test.ts` toevoegen:
```ts
  it('noemt de meting boven de kop (walkthrough 1.2)', () => {
    expect(source).toContain('state.campaignName')
  })
```

`frontend/components/dashboard/dashboard-state-card.tsx`: vervang
```tsx
    <section className={`rounded-[22px] border px-6 py-7 ${toneClasses(state.tone)}`}>
      <h1 className="font-serif text-[2rem] leading-[1.05] tracking-[-0.04em] text-[color:var(--dashboard-ink)] sm:text-[2.4rem]">
```
door:
```tsx
    <section className={`rounded-[22px] border px-6 py-7 ${toneClasses(state.tone)}`}>
      {state.campaignName ? (
        <p className="mb-1 text-xs font-semibold uppercase tracking-[0.12em] text-[#B07A10]">{state.campaignName}</p>
      ) : null}
      <h1 className="font-serif text-[2rem] leading-[1.05] tracking-[-0.04em] text-[color:var(--dashboard-ink)] sm:text-[2.4rem]">
```

`frontend/components/dashboard/running-state-card.tsx`: vervang
```tsx
      <p className="mb-1 text-xs font-semibold uppercase tracking-[0.12em] text-[#E8A020]">{scanLabel}</p>
```
door:
```tsx
      <p className="mb-1 text-xs font-semibold uppercase tracking-[0.12em] text-[#B07A10]">
        {scanLabel}
        {state.campaignName ? ` · ${state.campaignName}` : ''}
      </p>
```

`frontend/components/dashboard/read-only-state-card.tsx`: vervang
```tsx
    <section className="rounded-[22px] border border-[color:var(--dashboard-frame-border)] bg-white px-6 py-7">
      <h1 className="font-serif text-[2rem] leading-[1.05] tracking-[-0.04em] text-[color:var(--dashboard-ink)] sm:text-[2.4rem]">
```
door:
```tsx
    <section className="rounded-[22px] border border-[color:var(--dashboard-frame-border)] bg-white px-6 py-7">
      {state.campaignName ? (
        <p className="mb-1 text-xs font-semibold uppercase tracking-[0.12em] text-[#B07A10]">{state.campaignName}</p>
      ) : null}
      <h1 className="font-serif text-[2rem] leading-[1.05] tracking-[-0.04em] text-[color:var(--dashboard-ink)] sm:text-[2.4rem]">
```
(`#B07A10` is het donkere amber uit het rapport: merk-amber `#E8A020` haalt op een lichte kaart geen leesbaar contrast; de wizard op navy houdt `#E8A020`.)

Run:
```bash
cd /c/Users/larsh/Desktop/Business/Verisight/.worktrees/klantsuite-2b/frontend
npx vitest run components/dashboard/dashboard-state-actions.test.ts components/dashboard/running-state-card.test.ts components/dashboard/read-only-state-card.test.ts 2>&1 | tail -4
```
Expected: alles groen.

- [ ] **Step 6: Falende guard voor de lijst-component**

Maak `frontend/components/dashboard/campaign-list-section.test.ts`:

```ts
import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

const src = readFileSync(new URL('./campaign-list-section.tsx', import.meta.url), 'utf8')

describe('lijst "Al je metingen" (spec 2026-09-16 par. 6.1)', () => {
  it('is een servercomponent zonder hooks die naam, scan, status en link per meting toont', () => {
    expect(src).not.toContain("'use client'")
    expect(src).toContain('Al je metingen')
    expect(src).toContain('item.name')
    expect(src).toContain('item.scanLabel')
    expect(src).toContain('item.statusLabel')
    expect(src).toContain('href={item.href}')
  })

  it('markeert de meting die al als hoofdkaart staat', () => {
    expect(src).toContain('item.isMain')
    expect(src).toContain('Staat hierboven')
  })

  it('kleurt de status per sleutel, met "Actie nodig" als enige aandachtskleur', () => {
    expect(src).toContain("action:")
    expect(src).toContain("report_ready:")
  })

  it('bevat geen em- of en-dashes', () => {
    expect(src).not.toMatch(/[—–]/)
  })
})
```

`frontend/components/dashboard/campaign-list-section.tsx`:

```tsx
import Link from 'next/link'
import type { CampaignListItem } from '@/lib/dashboard/campaign-list'
import type { CampaignStatusKey } from '@/lib/dashboard/campaign-status'

const STATUS_PILL: Record<CampaignStatusKey, string> = {
  setup: 'border-dashed border-[color:var(--dashboard-frame-border)] text-[color:var(--dashboard-muted)]',
  running: 'border-[color:var(--dashboard-accent-soft-border)] bg-[color:var(--dashboard-accent-soft)] text-[color:var(--dashboard-accent-strong)]',
  action: 'border-[#e7d7af] bg-[#FBF4DF] text-[#7A5410]',
  closed_no_report: 'border-[color:var(--dashboard-frame-border)] text-[color:var(--dashboard-muted)]',
  report_ready: 'border-[color:var(--dashboard-ink)] bg-[color:var(--dashboard-ink)] text-white',
}

/**
 * Alle metingen van de organisatie (spec 2026-09-16 par. 6.1), onder de
 * hoofdkaart, zodra er meer dan één is. Servercomponent: geen hooks, alleen
 * links; de status komt uit dezelfde vocabulaire als /reports.
 */
export function CampaignListSection({ items }: { items: CampaignListItem[] }) {
  return (
    <section aria-labelledby="alle-metingen" className="rounded-[22px] border border-[color:var(--dashboard-frame-border)] bg-white px-6 py-6">
      <div className="flex items-baseline justify-between gap-4">
        <h2 id="alle-metingen" className="text-lg font-semibold tracking-[-0.02em] text-[color:var(--dashboard-ink)]">
          Al je metingen
        </h2>
        <p className="text-[0.72rem] font-semibold uppercase tracking-[0.2em] text-[color:var(--dashboard-muted)]">
          {items.length} {items.length === 1 ? 'meting' : 'metingen'}
        </p>
      </div>
      <ul className="mt-4 divide-y divide-[color:var(--dashboard-frame-border)]">
        {items.map((item) => (
          <li key={item.campaignId} className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 py-3">
            <div className="min-w-0">
              <Link
                href={item.href}
                className="block truncate text-sm font-semibold text-[color:var(--dashboard-ink)] underline-offset-4 hover:underline"
              >
                {item.name}
              </Link>
              <p className="mt-0.5 text-xs text-[color:var(--dashboard-muted)]">
                {item.scanLabel}
                {item.isMain ? ' · Staat hierboven' : ''}
              </p>
            </div>
            <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${STATUS_PILL[item.statusKey]}`}>
              {item.statusLabel}
            </span>
          </li>
        ))}
      </ul>
    </section>
  )
}
```

Run `npx vitest run components/dashboard/campaign-list-section.test.ts 2>&1 | tail -3`. Expected: `4 passed`.

- [ ] **Step 7: Dashboardpagina: alle metingen, hoofdkaartkeuze, lijst**

Falende guard eerst. Vervang in `frontend/app/(dashboard)/dashboard/page.test.ts` de test `selects the most recent campaign and derives report readiness from the report release rule` (regels 17-21) door:

```ts
  it('laadt alle metingen, kiest de nieuwste actieve als hoofdkaart en toont de rest in een lijst (spec 2026-09-16 par. 6.1)', () => {
    expect(source).toContain("order('created_at', { ascending: false })")
    expect(source).not.toContain('.limit(1)')
    expect(source).toContain('pickMainCampaign(campaigns)')
    expect(source).toContain('buildCampaignListItems(campaigns, statusContext, campaign.campaign_id)')
    expect(source).toContain('campaigns.length > 1 ? (')
    expect(source).toContain('CampaignListSection')
    expect(source).toContain('isReportReleaseReady')
    expect(source).not.toContain('isDashboardReleaseReady')
  })
```

Run `npx vitest run "app/(dashboard)/dashboard/page.test.ts" 2>&1 | tail -5`. Expected: die test faalt.

In `frontend/app/(dashboard)/dashboard/page.tsx`:

Imports toevoegen:
```ts
import { CampaignListSection } from '@/components/dashboard/campaign-list-section'
import { buildCampaignListItems, pickMainCampaign } from '@/lib/dashboard/campaign-list'
import { loadCampaignStatusContext } from '@/lib/dashboard/campaign-status-context'
```

Vervang (regels 30-37):
```ts
  const { data: stats, error: statsError } = await supabase
    .from('campaign_stats')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(1)
  if (statsError) throw new Error(`Kon campagne-overzicht niet laden: ${statsError.message}`)

  const campaign = (stats?.[0] as CampaignStats | undefined) ?? null
```
door:
```ts
  const { data: stats, error: statsError } = await supabase
    .from('campaign_stats')
    .select('*')
    .order('created_at', { ascending: false })
  if (statsError) throw new Error(`Kon campagne-overzicht niet laden: ${statsError.message}`)

  // Alle metingen (spec 2026-09-16 par. 6.1): de nieuwste actieve is de
  // hoofdkaart; de rest staat in de lijst eronder. Vóór dit plan koos limit(1)
  // blind de nieuwste en was een nog in te richten meting onvindbaar.
  const campaigns = (stats ?? []) as CampaignStats[]
  const campaign = pickMainCampaign(campaigns)
```

Na de regel `const reminderText = buildReminderText({ ... })` (het hele blok, eindigend op `})`), toevoegen:
```ts
  // De lijst gebruikt dezelfde statusvocabulaire als /reports en is met een
  // pariteitstest aan de resolver vastgeklonken; ze kan dus niet iets anders
  // zeggen dan de kaart hierboven.
  const statusContext =
    campaigns.length > 1
      ? await loadCampaignStatusContext(supabase, campaigns.map((c) => c.campaign_id), todayIso())
      : null
  const listItems = statusContext ? buildCampaignListItems(campaigns, statusContext, campaign.campaign_id) : []
```

Vervang de return (regels 191-221) door:
```tsx
  return (
    <div className="space-y-8">
      {!canManage ? (
        <ReadOnlyStateCard state={state} />
      ) : state.kind === 'setup' ? (
        <WelcomeGate
          campaignId={campaign.campaign_id}
          scanType={campaign.scan_type}
          organizationName={orgData?.name ?? 'je organisatie'}
          publicSurveyToken={(campaignRow as Record<string, unknown>)?.public_survey_token as string ?? ''}
          frontendBaseUrl={process.env.NEXT_PUBLIC_FRONTEND_URL ?? 'https://getloep.nl'}
          initialLaunchDate={deliveryRecord?.launch_date ?? null}
          initialInvitedCount={deliveryRecord?.invited_count ?? null}
          initialClosesAt={campaign.closes_at ?? null}
          initialReminderChoice={readReminderChoice(deliveryRecord?.reminder_config)}
          segmentDepartments={(campaignRow as Record<string, unknown>)?.segment_departments as
            | { label: string; slug: string; invited_count?: number }[]
            | null}
          departmentResponseCounts={departmentResponseCounts}
        />
      ) : state.kind === 'running' ? (
        <RunningStateCard
          state={state}
          reminderText={reminderText}
          scanLabel={SCAN_TYPE_LABELS[campaign.scan_type] ?? campaign.scan_type}
        />
      ) : (
        <DashboardStateCard state={state} reminderText={reminderText} />
      )}
      {campaigns.length > 1 ? (
        <CampaignListSection items={listItems} />
      ) : null}
    </div>
  )
```

Run `npx vitest run "app/(dashboard)/dashboard/page.test.ts" 2>&1 | tail -3`. Expected: groen.

- [ ] **Step 8: Campagnepagina: "Alle metingen", geen zelf-link**

Falende guard. Voeg aan `frontend/app/(dashboard)/campaigns/[id]/page.standalone.test.ts` toe:
```ts
  it('linkt terug naar alle metingen en toont geen knop die naar zichzelf wijst (spec 2026-09-16 par. 6.1 en 7)', () => {
    expect(source).toContain('Alle metingen')
    expect(source).not.toContain('Terug naar dashboard')
    expect(source).toContain('withoutSelfLink(state, `/campaigns/${id}`)')
    // De kaarten krijgen de gestripte staat, het rapportblok blijft op de originele kind.
    expect(source).toContain('state={pageState}')
    expect(source).not.toContain('<DashboardStateCard state={state}')
  })
```

In `frontend/app/(dashboard)/campaigns/[id]/page.tsx`:

Import toevoegen:
```ts
import { withoutSelfLink } from '@/lib/dashboard/self-link'
```

Na het `resolveDashboardState({ ... })`-blok (dat eindigt met `today: todayIso(),\n  })`), toevoegen:
```ts
  // Walkthrough 5.2: "Open rapport" linkte naar deze pagina zelf en deed
  // zichtbaar niets. Het rapportblok onderaan heeft de echte downloadknop.
  const pageState = withoutSelfLink(state, `/campaigns/${id}`)
```

Vervang de link (regels 170-175):
```tsx
      <Link
        href="/dashboard"
        className="inline-flex text-sm font-semibold text-[color:var(--dashboard-accent-strong)] transition-colors hover:text-[color:var(--dashboard-ink)]"
      >
        ← Terug naar dashboard
      </Link>
```
door:
```tsx
      <Link
        href="/dashboard"
        className="inline-flex text-sm font-semibold text-[color:var(--dashboard-accent-strong)] transition-colors hover:text-[color:var(--dashboard-ink)]"
      >
        ← Alle metingen
      </Link>
```

Vervang in het kaartenblok (regels 186-212) de drie `state={state}` door `state={pageState}`:
```tsx
      {!canManage ? (
        <ReadOnlyStateCard state={pageState} />
      ) : state.kind === 'setup' ? (
```
en
```tsx
        <RunningStateCard
          state={pageState}
          reminderText={reminderText}
          scanLabel={SCAN_TYPE_LABELS[stats.scan_type] ?? stats.scan_type}
        />
      ) : (
        <DashboardStateCard state={pageState} reminderText={reminderText} />
      )}
```
De `state.kind === 'setup'`, `state.kind === 'running'` en `state.kind === 'report_ready'` vergelijkingen blijven op `state` (dezelfde kind).

Run `npx vitest run "app/(dashboard)/campaigns/[id]" 2>&1 | tail -5`. Expected: geen nieuwe falende tests (de bekende uit de baseline blijven gelijk).

- [ ] **Step 9: "Je meting staat klaar." (walkthrough 3.1)**

Maak `frontend/components/dashboard/welcome-gate.test.ts`:
```ts
import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

const src = readFileSync(new URL('./welcome-gate.tsx', import.meta.url), 'utf8')

describe('welkomstscherm vóór de wizard (walkthrough 3.1)', () => {
  it('noemt de meting niet "je eerste scan": bij een vervolgmeting is dat onwaar', () => {
    expect(src).toContain('Je meting staat klaar.')
    expect(src).not.toContain('Je eerste scan')
  })
  it('bevat geen em- of en-dashes', () => {
    expect(src).not.toMatch(/[—–]/)
  })
})
```
In `frontend/components/dashboard/welcome-gate.tsx` regel 117: `Je eerste scan staat klaar.` wordt `Je meting staat klaar.`

Run `npx vitest run components/dashboard/welcome-gate.test.ts 2>&1 | tail -3`. Expected: `2 passed`.

- [ ] **Step 10: tsc en commit**

Run:
```bash
cd /c/Users/larsh/Desktop/Business/Verisight/.worktrees/klantsuite-2b/frontend
npx tsc --noEmit 2>&1 | grep -c "error TS"
```
Expected: `133`. Een hoger getal wijst meestal op een `DashboardState`-object dat in een test letterlijk wordt opgebouwd zonder `campaignName` (zoek met `grep -rn "closeDateLabel:" --include=*.test.ts`).

```bash
cd /c/Users/larsh/Desktop/Business/Verisight/.worktrees/klantsuite-2b
git add frontend/lib/dashboard/campaign-list.ts frontend/lib/dashboard/campaign-list.test.ts frontend/lib/dashboard/self-link.ts frontend/lib/dashboard/self-link.test.ts frontend/components/dashboard/campaign-list-section.tsx frontend/components/dashboard/campaign-list-section.test.ts frontend/components/dashboard/welcome-gate.tsx frontend/components/dashboard/welcome-gate.test.ts frontend/lib/dashboard/dashboard-state-resolver.ts frontend/lib/dashboard/dashboard-state-resolver.test.ts frontend/components/dashboard/dashboard-state-card.tsx frontend/components/dashboard/running-state-card.tsx frontend/components/dashboard/read-only-state-card.tsx frontend/components/dashboard/dashboard-state-actions.test.ts frontend/components/dashboard/running-state-card.test.ts frontend/components/dashboard/read-only-state-card.test.ts "frontend/app/(dashboard)/dashboard/page.tsx" "frontend/app/(dashboard)/dashboard/page.test.ts" "frontend/app/(dashboard)/campaigns/[id]/page.tsx" "frontend/app/(dashboard)/campaigns/[id]/page.standalone.test.ts"
git commit -m "feat(dashboard): alle metingen zichtbaar, de kaart noemt de meting, geen zelf-linkende rapportknop

De hoofdkaart is de nieuwste actieve meting; daaronder staat 'Al je metingen'
met naam, scan, status en link, uit dezelfde vocabulaire als /reports. De
campagnepagina linkt terug naar 'Alle metingen' en stript een CTA die naar
zichzelf wijst. Het welkomstscherm zegt niet meer 'je eerste scan'.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

### Task 5: "Nieuwe meting aanvragen" op `/dashboard` en op de eindtoestand; meelezer krijgt de mailknop; geen dubbel sluitlabel

**Files:**
- Create: `frontend/lib/dashboard/new-measurement-request.ts`, `frontend/lib/dashboard/new-measurement-request.test.ts`
- Create: `frontend/components/dashboard/request-new-measurement.tsx`, `frontend/components/dashboard/request-new-measurement.test.ts`
- Create: `frontend/lib/dashboard/account-organization.ts`, `frontend/lib/dashboard/account-organization.guard.test.ts`
- Modify: `frontend/app/(dashboard)/dashboard/page.tsx` (+ `page.test.ts`)
- Modify: `frontend/app/(dashboard)/campaigns/[id]/page.tsx` (+ `page.report-access.test.ts`)
- Modify: `frontend/components/dashboard/read-only-state-card.tsx` (+ test)
- Modify: `frontend/components/dashboard/running-state-card.tsx:44-47` (+ test)

- [ ] **Step 1: Falende tests voor de mailto en het blok**

Maak `frontend/lib/dashboard/new-measurement-request.test.ts`:

```ts
import { describe, expect, it } from 'vitest'
import { NEW_MEASUREMENT_PRICE_LABEL, buildNewMeasurementMailto } from './new-measurement-request'

function parse(href: string) {
  const [target, query] = href.split('?')
  const params = new URLSearchParams(query)
  return { target, subject: params.get('subject') ?? '', body: params.get('body') ?? '' }
}

describe('buildNewMeasurementMailto (spec 2026-09-16 par. 6.3)', () => {
  it('mailt naar hallo@getloep.nl met de organisatie in het onderwerp', () => {
    const { target, subject } = parse(buildNewMeasurementMailto('TEST Loep Testklant'))
    expect(target).toBe('mailto:hallo@getloep.nl')
    expect(subject).toBe('Nieuwe meting aanvragen: TEST Loep Testklant')
  })

  it('vult een korte tekst voor met wat Loep moet weten', () => {
    const { body } = parse(buildNewMeasurementMailto('TEST Loep Testklant'))
    expect(body).toContain('TEST Loep Testklant wil een nieuwe meting.')
    expect(body).toContain('Welke scan')
    expect(body).toContain('Gewenste startdatum')
    expect(body).toContain('Aantal deelnemers')
  })

  it('verzint geen organisatienaam: zonder naam staat er zichtbaar dat die niet bekend is', () => {
    for (const name of [null, undefined, '', '   ']) {
      const { subject } = parse(buildNewMeasurementMailto(name))
      expect(subject).toBe('Nieuwe meting aanvragen: organisatie niet bekend')
    }
  })

  it('noemt de prijs van de vervolgmeting zoals op de site (beslissing 2026-07-09)', () => {
    expect(NEW_MEASUREMENT_PRICE_LABEL).toBe('€1.250 excl. btw')
  })

  it('bevat geen em- of en-dashes', () => {
    const { subject, body } = parse(buildNewMeasurementMailto('Acme'))
    expect(subject + body).not.toMatch(/[—–]/)
  })
})
```

Maak `frontend/components/dashboard/request-new-measurement.test.ts`:

```ts
import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

const src = readFileSync(new URL('./request-new-measurement.tsx', import.meta.url), 'utf8')

describe('blok "nieuwe meting aanvragen" (spec 2026-09-16 par. 6.3)', () => {
  it('is een servercomponent met de spec-tekst, de prijs en de mailto', () => {
    expect(src).not.toContain("'use client'")
    expect(src).toContain('Klaar voor een vervolgmeting?')
    expect(src).toContain('NEW_MEASUREMENT_PRICE_LABEL')
    expect(src).toContain('buildNewMeasurementMailto(organizationName)')
    expect(src).toContain('Nieuwe meting aanvragen')
  })

  it('spreekt met Loep als onderwerp, niet als "wij"', () => {
    expect(src).toContain('dan zet Loep hem voor je klaar')
    expect(src).not.toMatch(/\b[Ww]ij\b|\b[Ww]e zetten\b/)
  })

  it('bevat geen em- of en-dashes', () => {
    expect(src).not.toMatch(/[—–]/)
  })
})
```

Run:
```bash
cd /c/Users/larsh/Desktop/Business/Verisight/.worktrees/klantsuite-2b/frontend
npx vitest run lib/dashboard/new-measurement-request.test.ts components/dashboard/request-new-measurement.test.ts 2>&1 | tail -6
```
Expected: beide falen op een ontbrekende module of bestand.

- [ ] **Step 2: `lib/dashboard/new-measurement-request.ts` en het blok**

`frontend/lib/dashboard/new-measurement-request.ts`:
```ts
import { LOEP_CONTACT_EMAIL } from '@/lib/loep-contact'

/** Prijs van de vervolgmeting zoals publiek op /producten (beslissing 2026-07-09). */
export const NEW_MEASUREMENT_PRICE_LABEL = '€1.250 excl. btw'

/**
 * Mailto voor "nieuwe meting aanvragen" (spec 2026-09-16 par. 6.3): geen
 * formulier, geen tabel. Onderwerp en tekst zijn voorgevuld zodat Lars in één
 * oogopslag ziet wie wat wil; de klant vult scan, datum en aantal aan.
 */
export function buildNewMeasurementMailto(organizationName: string | null | undefined): string {
  const org = organizationName?.trim() || 'organisatie niet bekend'
  const subject = `Nieuwe meting aanvragen: ${org}`
  const body = [
    'Hallo Loep,',
    '',
    `${org} wil een nieuwe meting. Kunnen jullie die klaarzetten?`,
    '',
    'Welke scan (Loep Behoud, Loep Vertrek of Loep Start): ',
    'Gewenste startdatum: ',
    'Aantal deelnemers, ongeveer: ',
    '',
    'Met vriendelijke groet,',
    '',
  ].join('\n')
  return `mailto:${LOEP_CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
}
```

`frontend/components/dashboard/request-new-measurement.tsx`:
```tsx
import { LOEP_CONTACT_EMAIL } from '@/lib/loep-contact'
import { NEW_MEASUREMENT_PRICE_LABEL, buildNewMeasurementMailto } from '@/lib/dashboard/new-measurement-request'

/**
 * Vast blok onderaan /dashboard en bij "gesloten zonder rapport" (spec
 * 2026-09-16 par. 6.3). Servercomponent; de mailto is de hele actie.
 */
export function RequestNewMeasurement({ organizationName }: { organizationName: string | null }) {
  return (
    <section
      aria-labelledby="nieuwe-meting"
      className="rounded-[22px] border border-dashed border-[color:var(--dashboard-frame-border)] bg-[color:var(--dashboard-surface)] px-6 py-6"
    >
      <h2 id="nieuwe-meting" className="text-lg font-semibold tracking-[-0.02em] text-[color:var(--dashboard-ink)]">
        Klaar voor een vervolgmeting?
      </h2>
      <p className="mt-2 max-w-2xl text-sm leading-6 text-[color:var(--dashboard-text)]">
        Dezelfde meting opnieuw kost {NEW_MEASUREMENT_PRICE_LABEL}, inclusief een compacte bespreking van de
        vergelijking met de vorige meting. Mail Loep, dan zet Loep hem voor je klaar.
      </p>
      <div className="mt-4 flex flex-wrap items-center gap-4">
        <a
          href={buildNewMeasurementMailto(organizationName)}
          className="inline-flex items-center justify-center rounded-lg bg-[color:var(--dashboard-ink)] px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#1B2E45]"
        >
          Nieuwe meting aanvragen
        </a>
        <p className="text-xs text-[color:var(--dashboard-muted)]">Of mail zelf naar {LOEP_CONTACT_EMAIL}.</p>
      </div>
    </section>
  )
}
```

Run dezelfde twee tests. Expected: `5 passed` en `3 passed`.

- [ ] **Step 3: Organisatienaam van het account laden (voor het blok zonder meting; Task 6 gebruikt dezelfde lader voor de kop)**

Maak `frontend/lib/dashboard/account-organization.guard.test.ts`:

```ts
import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

const src = readFileSync(new URL('./account-organization.ts', import.meta.url), 'utf8')

describe('loadAccountOrganizations (spec 2026-09-16 par. 6.5)', () => {
  it('leest de organisatienaam uit organizations via org_members, nooit uit het e-mailadres', () => {
    expect(src).toContain(".from('org_members')")
    expect(src).toContain(".from('organizations')")
    expect(src).toContain(".in('id', orgIds)")
    expect(src).not.toContain("split('@')")
  })

  it('geeft een fout terug in plaats van stil een lege lijst', () => {
    expect(src).toContain('error: membershipError.message')
    expect(src).toContain('error: orgError.message')
    expect(src).toContain('ontbreekt de naam')
  })
})
```

`frontend/lib/dashboard/account-organization.ts`:
```ts
import type { SupabaseClient } from '@supabase/supabase-js'

export interface AccountOrganizations {
  /** Namen van de organisaties waar de gebruiker lid van is. */
  names: string[]
  /** Reden als de namen niet (volledig) geladen konden worden; de schil toont dan een degraded label. */
  error: string | null
}

/**
 * De organisatie(s) van het account (spec 2026-09-16 par. 6.5). Vóór dit plan
 * stond in de kop het maildomein met een hoofdletter ("Hotmail"); dat was
 * nooit de organisatie. Geen throw: de schil moet blijven renderen, maar de
 * kop zegt dan zichtbaar dat de naam niet geladen is.
 */
export async function loadAccountOrganizations(
  supabase: SupabaseClient,
  userId: string,
): Promise<AccountOrganizations> {
  const { data: memberships, error: membershipError } = await supabase
    .from('org_members')
    .select('org_id')
    .eq('user_id', userId)
  if (membershipError) return { names: [], error: membershipError.message }

  const orgIds = Array.from(new Set((memberships ?? []).map((row) => row.org_id as string)))
  if (orgIds.length === 0) return { names: [], error: null }

  const { data: organizations, error: orgError } = await supabase
    .from('organizations')
    .select('id, name')
    .in('id', orgIds)
  if (orgError) return { names: [], error: orgError.message }

  const names = (organizations ?? [])
    .map((row) => (typeof row.name === 'string' ? row.name.trim() : ''))
    .filter((name) => name.length > 0)
  if (names.length < orgIds.length) {
    return { names, error: `Van ${orgIds.length - names.length} organisatie(s) ontbreekt de naam of de leesrechten.` }
  }
  return { names, error: null }
}
```

Run `npx vitest run lib/dashboard/account-organization.guard.test.ts 2>&1 | tail -3`. Expected: `2 passed`.

- [ ] **Step 4: Het blok op `/dashboard` (altijd) en op de eindtoestand van de campagnepagina**

Falende guards. Voeg aan `frontend/app/(dashboard)/dashboard/page.test.ts` toe:
```ts
  it('biedt onderaan altijd "nieuwe meting aanvragen" aan, ook zonder meting (spec 2026-09-16 par. 6.3)', () => {
    expect(source.match(/<RequestNewMeasurement organizationName=/g)?.length).toBe(2)
    expect(source).toContain('loadAccountOrganizations(supabase, user.id)')
  })
```
Voeg aan `frontend/app/(dashboard)/campaigns/[id]/page.report-access.test.ts` toe:
```ts
  it('biedt op "gesloten zonder rapport" de weg naar een nieuwe meting (spec 2026-09-16 par. 4.5 en 6.3)', () => {
    expect(source).toContain("state.processingVariant === 'insufficient_response'")
    expect(source).toContain('<RequestNewMeasurement organizationName={orgData?.name ?? null} />')
  })
```

In `frontend/app/(dashboard)/dashboard/page.tsx`:

Imports toevoegen:
```ts
import { RequestNewMeasurement } from '@/components/dashboard/request-new-measurement'
import { loadAccountOrganizations } from '@/lib/dashboard/account-organization'
```

Vervang de no-campaign-tak:
```tsx
  if (!campaign) {
    const state = resolveDashboardState({
      ...
    })
    return (
      <div className="space-y-8">
        <DashboardStateCard state={state} reminderText="" />
      </div>
    )
  }
```
door (alleen de return verandert; het `resolveDashboardState`-object blijft zoals het is):
```tsx
  if (!campaign) {
    const state = resolveDashboardState({
      campaign: null,
      launchConfirmedAt: null,
      launchDate: null,
      closesAt: null,
      reminderConfig: normalizeReminderConfig(null),
      reminderAlreadySentAt: null,
      reminderSkipped: false,
      extensionCount: 0,
      reportReady: false,
      today: todayIso(),
    })
    // Zonder meting is er geen campagne-organisatie; de naam komt dan van het account.
    const account = await loadAccountOrganizations(supabase, user.id)
    return (
      <div className="space-y-8">
        <DashboardStateCard state={state} reminderText="" />
        <RequestNewMeasurement organizationName={account.names[0] ?? null} />
      </div>
    )
  }
```

In de hoofd-return (uit Task 4), na het `{campaigns.length > 1 ? (<CampaignListSection ... />) : null}`-blok en vóór de sluitende `</div>`, toevoegen:
```tsx
      <RequestNewMeasurement organizationName={orgData?.name ?? null} />
```

In `frontend/app/(dashboard)/campaigns/[id]/page.tsx`: import toevoegen
```ts
import { RequestNewMeasurement } from '@/components/dashboard/request-new-measurement'
```
en na het `{state.kind === 'report_ready' ? ( ... ) : null}`-blok, vóór de sluitende `</div>`, toevoegen:
```tsx
      {state.processingVariant === 'insufficient_response' ? (
        <RequestNewMeasurement organizationName={orgData?.name ?? null} />
      ) : null}
```

Run:
```bash
cd /c/Users/larsh/Desktop/Business/Verisight/.worktrees/klantsuite-2b/frontend
npx vitest run "app/(dashboard)/dashboard/page.test.ts" "app/(dashboard)/campaigns/[id]/page.report-access.test.ts" 2>&1 | tail -4
```
Expected: beide groen.

- [ ] **Step 5: Meelezer ziet de mailknop; lopende kaart toont de sluitdatum één keer (2a-punt 9)**

Vervang in `frontend/components/dashboard/read-only-state-card.test.ts` de test `bevat geen enkele actie` door:
```ts
  it('bevat geen beheeractie; alleen een mailto-link (contact is geen beheer) mag blijven', () => {
    expect(source).not.toContain('DashboardStateActions')
    expect(source).not.toContain('<button')
    expect(source).not.toContain('secondaryActions')
    expect(source).toContain("startsWith('mailto:')")
  })
```
Voeg aan `frontend/components/dashboard/running-state-card.test.ts` toe:
```ts
  it('toont de sluitdatum één keer, in de tijdlijn (2a-uitvoeringsverslag, punt 9)', () => {
    expect(src).not.toContain('closeDateLabel')
  })
```

In `frontend/components/dashboard/read-only-state-card.tsx`, vóór de regel `<p className="mt-6 text-sm text-[color:var(--dashboard-muted)]">` toevoegen:
```tsx
      {state.ctaKind === 'link' && state.ctaLabel && state.ctaHref?.startsWith('mailto:') ? (
        <div className="mt-6">
          <a
            href={state.ctaHref}
            className="inline-flex items-center justify-center rounded-lg bg-[color:var(--dashboard-ink)] px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#1B2E45]"
          >
            {state.ctaLabel}
          </a>
        </div>
      ) : null}
```

In `frontend/components/dashboard/running-state-card.tsx` vervang:
```tsx
        <div className="mt-2 flex justify-between text-xs text-[color:var(--dashboard-muted)]">
          <span>{state.subtext}</span>
          <span>{state.closeDateLabel}</span>
        </div>
```
door:
```tsx
        <p className="mt-2 text-xs text-[color:var(--dashboard-muted)]">{state.subtext}</p>
```

Run:
```bash
cd /c/Users/larsh/Desktop/Business/Verisight/.worktrees/klantsuite-2b/frontend
npx vitest run components/dashboard/read-only-state-card.test.ts components/dashboard/running-state-card.test.ts 2>&1 | tail -4
npx tsc --noEmit 2>&1 | grep -c "error TS"
```
Expected: beide groen; tsc `133`.

- [ ] **Step 6: Commit**

```bash
cd /c/Users/larsh/Desktop/Business/Verisight/.worktrees/klantsuite-2b
git add frontend/lib/dashboard/new-measurement-request.ts frontend/lib/dashboard/new-measurement-request.test.ts frontend/components/dashboard/request-new-measurement.tsx frontend/components/dashboard/request-new-measurement.test.ts frontend/lib/dashboard/account-organization.ts frontend/lib/dashboard/account-organization.guard.test.ts "frontend/app/(dashboard)/dashboard/page.tsx" "frontend/app/(dashboard)/dashboard/page.test.ts" "frontend/app/(dashboard)/campaigns/[id]/page.tsx" "frontend/app/(dashboard)/campaigns/[id]/page.report-access.test.ts" frontend/components/dashboard/read-only-state-card.tsx frontend/components/dashboard/read-only-state-card.test.ts frontend/components/dashboard/running-state-card.tsx frontend/components/dashboard/running-state-card.test.ts
git commit -m "feat(dashboard): nieuwe meting aanvragen via mailto; meelezer krijgt de mailknop; sluitdatum één keer

Vast blok onderaan /dashboard en bij 'gesloten zonder rapport', met een
voorgevulde mail naar hallo@getloep.nl (geen formulier, geen tabel). De
organisatienaam komt uit organizations, nooit uit het e-mailadres.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

### Task 6: Kop toont de organisatienaam (fail-loud); mobiel menu met account en uitloggen; footer met contact; "Afgesloten" met campagnenaam en sluitmaand; dubbele "Rapporten"-knop weg

**Files:**
- Create: `frontend/lib/dashboard/account-heading.ts`, `frontend/lib/dashboard/account-heading.test.ts`
- Create: `frontend/components/dashboard/dashboard-shell.guard.test.ts`
- Modify: `frontend/lib/dashboard/shell-navigation.ts:37-40, 244-261` (+ test `shell-navigation.test.ts:13-56, 219-232`)
- Modify: `frontend/app/(dashboard)/layout.tsx`
- Modify: `frontend/components/dashboard/dashboard-shell.tsx`

- [ ] **Step 1: Falende test voor de kop**

Maak `frontend/lib/dashboard/account-heading.test.ts`:

```ts
import { describe, expect, it } from 'vitest'
import { resolveAccountHeading } from './account-heading'

describe('resolveAccountHeading (spec 2026-09-16 par. 6.5, walkthrough 1.3)', () => {
  it('toont de organisatienaam als er precies één is', () => {
    expect(resolveAccountHeading({ names: ['TEST Loep Testklant'], error: null, isAdmin: false })).toEqual({
      label: 'TEST Loep Testklant',
      degraded: false,
    })
  })

  it('telt bij meer organisaties in plaats van er één te kiezen', () => {
    expect(resolveAccountHeading({ names: ['A', 'B'], error: null, isAdmin: false })).toEqual({
      label: '2 organisaties',
      degraded: false,
    })
  })

  it('noemt de operator zonder lidmaatschap "Loep beheer"', () => {
    expect(resolveAccountHeading({ names: [], error: null, isAdmin: true })).toEqual({
      label: 'Loep beheer',
      degraded: false,
    })
  })

  it('faalt zichtbaar: laadfout of geen organisatie wordt een degraded label, nooit een maildomein', () => {
    expect(resolveAccountHeading({ names: [], error: 'permission denied', isAdmin: false })).toEqual({
      label: 'Organisatie niet geladen',
      degraded: true,
    })
    expect(resolveAccountHeading({ names: ['A'], error: 'Van 1 organisatie(s) ontbreekt de naam', isAdmin: false })).toEqual({
      label: 'Organisatie niet geladen',
      degraded: true,
    })
    expect(resolveAccountHeading({ names: [], error: null, isAdmin: false })).toEqual({
      label: 'Geen organisatie gekoppeld',
      degraded: true,
    })
  })

  it('bevat geen em- of en-dashes', () => {
    for (const args of [
      { names: [], error: 'x', isAdmin: false },
      { names: [], error: null, isAdmin: false },
      { names: ['A', 'B'], error: null, isAdmin: false },
    ]) {
      expect(resolveAccountHeading(args).label).not.toMatch(/[—–]/)
    }
  })
})
```

Run `npx vitest run lib/dashboard/account-heading.test.ts 2>&1 | tail -3`. Expected: `Failed to resolve import`.

- [ ] **Step 2: `lib/dashboard/account-heading.ts`**

```ts
export interface AccountHeading {
  label: string
  /** True als het label een storing benoemt in plaats van de organisatie. */
  degraded: boolean
}

/**
 * Wat er in de kop van de ingelogde omgeving staat (spec 2026-09-16 par. 6.5).
 * Vóór dit plan: het maildomein met een hoofdletter ("Hotmail"). Nu: de naam
 * uit organizations, en als die er niet is een zichtbaar degraded label.
 * Nooit iets afleiden uit het e-mailadres.
 */
export function resolveAccountHeading(args: {
  names: string[]
  error: string | null
  isAdmin: boolean
}): AccountHeading {
  if (args.error) return { label: 'Organisatie niet geladen', degraded: true }
  if (args.names.length === 1) return { label: args.names[0], degraded: false }
  if (args.names.length > 1) return { label: `${args.names.length} organisaties`, degraded: false }
  if (args.isAdmin) return { label: 'Loep beheer', degraded: false }
  return { label: 'Geen organisatie gekoppeld', degraded: true }
}
```

Run de test. Expected: `5 passed`.

- [ ] **Step 3: Falende tests voor de sidebar-lijst "Afgesloten" (walkthrough 1.7)**

In `frontend/lib/dashboard/shell-navigation.test.ts`:

Voeg aan elk van de zes objecten in de `campaigns`-fixture (regels 13-56) twee velden toe, direct na `campaign_id`: `campaign_name: '<id als naam>'` en na `created_at`: `closed_at: null`. Bijvoorbeeld het eerste object wordt:
```ts
    {
      campaign_id: 'exit-1',
      campaign_name: 'exit-1',
      scan_type: 'exit',
      is_active: true,
      created_at: '2026-04-20T10:00:00.000Z',
      closed_at: null,
      total_completed: 14,
    },
```
(en zo voor `retention-1`, `onboarding-1`, `pulse-1`, `leadership-1`, `culture-1`).

Vervang de describe `closed campaign sidebar list` (regels 219-232) door:
```ts
describe('closed campaign sidebar list (walkthrough 1.7: campagnenaam en sluitmaand, niet scanlabel en aanmaakmaand)', () => {
  const refs: DashboardShellCampaignRef[] = [
    { campaign_id: 'c1', campaign_name: 'Loep Vertrek voorjaar', scan_type: 'exit', is_active: false, created_at: '2026-05-01T00:00:00Z', closed_at: null, total_completed: 14 },
    { campaign_id: 'c2', campaign_name: 'Loep Behoud lopend', scan_type: 'retention', is_active: true, created_at: '2026-06-01T00:00:00Z', closed_at: null, total_completed: 8 },
    { campaign_id: 'c3', campaign_name: 'TEST Loep Behoud - gesloten met rapport', scan_type: 'exit', is_active: false, created_at: '2026-07-15T00:00:00Z', closed_at: '2026-08-27T09:00:00Z', total_completed: 20 },
  ]

  it('lists only closed campaigns, newest first, by name, with the month they closed', () => {
    const items = buildClosedCampaignNavItems(refs)
    expect(items.map((item) => item.campaignId)).toEqual(['c3', 'c1'])
    expect(items[0].href).toBe('/campaigns/c3')
    expect(items[0].name).toBe('TEST Loep Behoud - gesloten met rapport')
    expect(items[0].closedLabel).toBe('Gesloten aug 2026')
  })

  it('zegt eerlijk dat de sluitdatum onbekend is in plaats van de aanmaakmaand te tonen', () => {
    const items = buildClosedCampaignNavItems(refs)
    expect(items[1].closedLabel).toBe('Gesloten, datum onbekend')
    expect(items[1].closedLabel).not.toContain('mei')
  })
})
```

Run `npx vitest run lib/dashboard/shell-navigation.test.ts 2>&1 | tail -6`. Expected: de twee closed-list-tests falen (`name` en `closedLabel` bestaan niet).

- [ ] **Step 4: `shell-navigation.ts`: naam en sluitmaand**

Vervang (regels 37-40):
```ts
export type DashboardShellCampaignRef = Pick<
  CampaignStats,
  'campaign_id' | 'scan_type' | 'is_active' | 'created_at' | 'total_completed'
>
```
door:
```ts
export type DashboardShellCampaignRef = Pick<
  CampaignStats,
  'campaign_id' | 'campaign_name' | 'scan_type' | 'is_active' | 'created_at' | 'closed_at' | 'total_completed'
>
```

Vervang (regels 244-261):
```ts
export type ClosedCampaignNavItem = {
  campaignId: string
  href: string
  scanType: ScanType
  periodLabel: string
}

export function buildClosedCampaignNavItems(campaigns: DashboardShellCampaignRef[]): ClosedCampaignNavItem[] {
  return campaigns
    .filter((campaign) => !campaign.is_active)
    .sort((left, right) => new Date(right.created_at).getTime() - new Date(left.created_at).getTime())
    .map((campaign) => ({
      campaignId: campaign.campaign_id,
      href: `/campaigns/${campaign.campaign_id}`,
      scanType: campaign.scan_type,
      periodLabel: new Intl.DateTimeFormat('nl-NL', { month: 'short', year: 'numeric' }).format(new Date(campaign.created_at)),
    }))
}
```
door:
```ts
export type ClosedCampaignNavItem = {
  campaignId: string
  href: string
  scanType: ScanType
  /** De campagnenaam: met twee Behoud-metingen is het scanlabel niet te onderscheiden (walkthrough 1.7). */
  name: string
  /** "Gesloten aug 2026", of eerlijk "Gesloten, datum onbekend" als closed_at leeg is. */
  closedLabel: string
}

function closedMonthLabel(closedAt: string | null): string {
  if (!closedAt) return 'Gesloten, datum onbekend'
  const date = new Date(closedAt)
  if (Number.isNaN(date.getTime())) return 'Gesloten, datum onbekend'
  return `Gesloten ${new Intl.DateTimeFormat('nl-NL', { month: 'short', year: 'numeric', timeZone: 'Europe/Amsterdam' }).format(date)}`
}

export function buildClosedCampaignNavItems(campaigns: DashboardShellCampaignRef[]): ClosedCampaignNavItem[] {
  return campaigns
    .filter((campaign) => !campaign.is_active)
    .sort((left, right) => new Date(right.created_at).getTime() - new Date(left.created_at).getTime())
    .map((campaign) => ({
      campaignId: campaign.campaign_id,
      href: `/campaigns/${campaign.campaign_id}`,
      scanType: campaign.scan_type,
      name: campaign.campaign_name,
      closedLabel: closedMonthLabel(campaign.closed_at),
    }))
}
```

Run `npx vitest run lib/dashboard/shell-navigation.test.ts 2>&1 | tail -3`. Expected: alles groen. (`Intl` met `month: 'short'` geeft in nl-NL "aug" zonder punt; geeft jouw Node "aug." met punt, pas de verwachting in de test aan naar wat Node werkelijk geeft en noteer dat in het verslag.)

- [ ] **Step 5: Falende source-guard voor de schil**

Maak `frontend/components/dashboard/dashboard-shell.guard.test.ts`:

```ts
import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

const shell = readFileSync(new URL('./dashboard-shell.tsx', import.meta.url), 'utf8')
const layout = readFileSync(new URL('../../app/(dashboard)/layout.tsx', import.meta.url), 'utf8')

describe('schil van de ingelogde omgeving (spec 2026-09-16 par. 6.5, walkthrough 1.3, 1.7, 1.8, 1.9, 7.2)', () => {
  it('toont in de kop de organisatienaam uit de database, nooit het maildomein', () => {
    expect(shell).not.toContain("split('@')")
    expect(shell).toContain('accountHeading.label')
    expect(shell).toContain('accountHeading.degraded')
    expect(layout).toContain('loadAccountOrganizations(supabase, user.id)')
    expect(layout).toContain('resolveAccountHeading({')
    expect(layout).toContain('isAdmin: context.isVerisightAdmin')
  })

  it('zet het accountblok en uitloggen ook in het mobiele menu', () => {
    expect(shell).toMatch(/mobileNavOpen \? \([\s\S]*?<LogoutButton[\s\S]*?\) : null\}\s*<\/header>/)
    expect(shell.match(/<LogoutButton/g)?.length).toBe(2)
  })

  it('heeft één "Rapporten"-ingang (de sidebar), geen dubbele knop in de kop', () => {
    expect(shell).not.toContain('showReportsQuickLink')
  })

  it('noemt in de footer geen Action Center meer, wel het contactadres', () => {
    expect(shell).not.toContain('Action Center in één omgeving')
    expect(shell).toContain('LOEP_CONTACT_EMAIL')
  })

  it('toont afgesloten metingen met hun naam en sluitmaand', () => {
    expect(shell).toContain('{item.name}')
    expect(shell).toContain('{item.closedLabel}')
    expect(shell).not.toContain('item.periodLabel')
    expect(layout).toContain("select('campaign_id, campaign_name, scan_type, is_active, created_at, closed_at, total_invited, total_completed')")
  })

  it('bevat geen em- of en-dashes', () => {
    expect(shell).not.toMatch(/[—–]/)
    expect(layout).not.toMatch(/[—–]/)
  })
})
```

Run `npx vitest run components/dashboard/dashboard-shell.guard.test.ts 2>&1 | tail -8`. Expected: vijf van de zes falen.

- [ ] **Step 6: `app/(dashboard)/layout.tsx`**

Vervang het bestand volledig door:

```tsx
import { DashboardShellFrame } from '@/components/dashboard/dashboard-shell'
import { createClient } from '@/lib/supabase/server'
import { loadSuiteAccessContext } from '@/lib/suite-access-server'
import { syncPendingOrgInvitesForUser } from '@/lib/supabase/sync-org-invites'
import { buildClosedCampaignNavItems } from '@/lib/dashboard/shell-navigation'
import { loadAccountOrganizations } from '@/lib/dashboard/account-organization'
import { resolveAccountHeading } from '@/lib/dashboard/account-heading'
import { redirect } from 'next/navigation'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  // Eerst uitnodigingen accepteren: dat kan een lidmaatschap toevoegen dat de
  // organisatienaam en de campagnelijst hieronder nodig hebben.
  const { acceptedCount } = await syncPendingOrgInvitesForUser(supabase)
  const [{ context }, { data: stats }, accountOrganizations] = await Promise.all([
    loadSuiteAccessContext(supabase, user.id),
    supabase
      .from('campaign_stats')
      .select('campaign_id, campaign_name, scan_type, is_active, created_at, closed_at, total_invited, total_completed'),
    loadAccountOrganizations(supabase, user.id),
  ])

  const accountHeading = resolveAccountHeading({
    names: accountOrganizations.names,
    error: accountOrganizations.error,
    isAdmin: context.isVerisightAdmin,
  })

  const portfolioCounts = {
    ready: (stats ?? []).filter((campaign) => campaign.is_active && (campaign.total_completed ?? 0) >= 5).length,
    building: (stats ?? []).filter(
      (campaign) => campaign.is_active && (campaign.total_invited ?? 0) > 0 && (campaign.total_completed ?? 0) < 5,
    ).length,
    setup: (stats ?? []).filter((campaign) => campaign.is_active && (campaign.total_invited ?? 0) === 0).length,
    closed: (stats ?? []).filter((campaign) => !campaign.is_active).length,
  }
  const shellCampaigns = (stats ?? []).map((campaign) => ({
    campaign_id: campaign.campaign_id,
    campaign_name: campaign.campaign_name,
    scan_type: campaign.scan_type,
    is_active: campaign.is_active,
    created_at: campaign.created_at,
    closed_at: campaign.closed_at ?? null,
    total_completed: campaign.total_completed ?? 0,
  }))
  const closedCampaigns = buildClosedCampaignNavItems(shellCampaigns)

  return (
    <DashboardShellFrame
      isAdmin={context.isVerisightAdmin}
      canManageActionCenterAssignments={context.canManageActionCenterAssignments}
      shellMode={context.managerOnly ? 'action_center_only' : 'full'}
      userEmail={user.email ?? ''}
      accountHeading={accountHeading}
      acceptedCount={acceptedCount}
      portfolioCounts={portfolioCounts}
      campaigns={shellCampaigns}
      closedCampaigns={closedCampaigns}
    >
      {children}
    </DashboardShellFrame>
  )
}
```

- [ ] **Step 7: `components/dashboard/dashboard-shell.tsx`**

Wijzig in deze volgorde (ankerfragmenten uit de huidige code):

1. Imports: na `import { LogoutButton } from '@/components/ui/logout-button'` toevoegen:
   ```ts
   import type { AccountHeading } from '@/lib/dashboard/account-heading'
   import { LOEP_CONTACT_EMAIL } from '@/lib/loep-contact'
   ```
   en `SCAN_TYPE_LABELS` uit de import van `@/lib/types` verwijderen (wordt niet meer gebruikt); de hele regel `import { SCAN_TYPE_LABELS } from '@/lib/types'` vervalt.

2. Props: in de destructuring en het type van `DashboardShellFrame` na `userEmail` toevoegen (destructuring: `accountHeading,`; type: `accountHeading: AccountHeading`).

3. Vervang:
   ```ts
     const accountLabel = userEmail.split('@')[1]?.split('.')[0] ?? 'Loep'
     const accountName = accountLabel.charAt(0).toUpperCase() + accountLabel.slice(1)
     const mobileItems = isActionCenter ? ACTION_CENTER_NAV : [...navigation.modules, ...navigation.admin]
     const showReportsQuickLink = shellMode === 'full' && !isActionCenter
   ```
   door:
   ```ts
     const mobileItems = isActionCenter ? ACTION_CENTER_NAV : [...navigation.modules, ...navigation.admin]
   ```

4. Sidebar "Afgesloten": vervang
   ```tsx
                             <p className="font-medium">{SCAN_TYPE_LABELS[item.scanType]}</p>
                             <p className="mt-1 text-xs leading-5 text-[#8fa1b3]">{item.periodLabel}</p>
   ```
   door:
   ```tsx
                             <p className="truncate font-medium">{item.name}</p>
                             <p className="mt-1 text-xs leading-5 text-[#8fa1b3]">{item.closedLabel}</p>
   ```

5. Sidebar accountblok: vervang
   ```tsx
                 <p className="mt-1 text-xs leading-5 text-[#8fa1b3]">
                   {acceptedCount > 0 ? `${acceptedCount} gekoppelde organisatie${acceptedCount === 1 ? '' : 's'}` : accountName}
                 </p>
   ```
   door:
   ```tsx
                 <p className="mt-1 text-xs leading-5 text-[#8fa1b3]">{accountHeading.label}</p>
   ```

6. Kop: vervang
   ```tsx
                   <span className="text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-[color:var(--dashboard-muted)]">
                     Account
                   </span>
                   <span className="text-lg font-semibold tracking-[-0.03em] text-[color:var(--dashboard-ink)]">
                     {accountName}
                   </span>
   ```
   door:
   ```tsx
                   <span className="text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-[color:var(--dashboard-muted)]">
                     Organisatie
                   </span>
                   <span
                     className={`text-lg font-semibold tracking-[-0.03em] ${
                       accountHeading.degraded ? 'text-[#B9571F]' : 'text-[color:var(--dashboard-ink)]'
                     }`}
                     title={
                       accountHeading.degraded
                         ? `Loep kon de organisatienaam niet laden. Blijft dit zo, mail ${LOEP_CONTACT_EMAIL}.`
                         : undefined
                     }
                   >
                     {accountHeading.label}
                   </span>
   ```

7. Kop rechts: vervang het hele blok
   ```tsx
               <div className="hidden items-center gap-2 lg:flex">
                 {isActionCenter ? (
                   <Link
                     href="/action-center/acties/nieuw"
                     ...
                   >
                     Actie aanmaken
                   </Link>
                 ) : (
                   <>
                     {showReportsQuickLink ? (
                       <Link
                         href="/reports"
                         ...
                       >
                         Rapporten
                       </Link>
                     ) : null}
                   </>
                 )}
               </div>
   ```
   door:
   ```tsx
               {isActionCenter ? (
                 <div className="hidden items-center gap-2 lg:flex">
                   <Link
                     href="/action-center/acties/nieuw"
                     className="rounded-full border border-[color:var(--dashboard-ink)] bg-[color:var(--dashboard-ink)] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#1B2E45]"
                   >
                     Actie aanmaken
                   </Link>
                 </div>
               ) : null}
   ```

8. Mobiel menu: vervang het slot van het mobiele blok
   ```tsx
                     )
                   })}
                 </div>
               </div>
             ) : null}
           </header>
   ```
   door:
   ```tsx
                     )
                   })}
                   <div className="mt-3 border-t border-[color:var(--dashboard-frame-border)] pt-3">
                     <p className="text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-[color:var(--dashboard-muted)]">
                       Account
                     </p>
                     <p className="mt-1 truncate text-sm text-[color:var(--dashboard-ink)]">{userEmail}</p>
                     <p className="mt-0.5 text-xs text-[color:var(--dashboard-muted)]">{accountHeading.label}</p>
                     <div className="mt-3">
                       <LogoutButton className="w-full justify-center rounded-full border border-[color:var(--dashboard-frame-border)] bg-white px-4 py-2 text-sm font-semibold text-[color:var(--dashboard-ink)] transition-colors hover:bg-[color:var(--dashboard-soft)]" />
                     </div>
                   </div>
                 </div>
               </div>
             ) : null}
           </header>
   ```

9. Footer: vervang
   ```tsx
             {shellMode === 'action_center_only'
               ? 'Loep Action Center voor managers in dezelfde omgeving'
               : 'Loep dashboard, rapporten en Action Center in één omgeving'}
   ```
   door:
   ```tsx
             Loep. Vragen? Mail {LOEP_CONTACT_EMAIL}.
   ```

Run:
```bash
cd /c/Users/larsh/Desktop/Business/Verisight/.worktrees/klantsuite-2b/frontend
npx vitest run components/dashboard/dashboard-shell.guard.test.ts lib/dashboard/shell-navigation.test.ts lib/dashboard/account-heading.test.ts 2>&1 | tail -4
npx tsc --noEmit 2>&1 | grep -c "error TS"
```
Expected: alles groen; tsc `133`. Een hoger getal wijst op een andere aanroeper van `DashboardShellFrame` (er is er maar één: de layout) of op een testfixture met `DashboardShellCampaignRef` zonder `campaign_name`/`closed_at` (Step 3 dekt `shell-navigation.test.ts`; zoek verder met `grep -rn "DashboardShellCampaignRef" --include=*.ts`).

- [ ] **Step 8: Commit**

```bash
cd /c/Users/larsh/Desktop/Business/Verisight/.worktrees/klantsuite-2b
git add frontend/lib/dashboard/account-heading.ts frontend/lib/dashboard/account-heading.test.ts frontend/components/dashboard/dashboard-shell.guard.test.ts frontend/lib/dashboard/shell-navigation.ts frontend/lib/dashboard/shell-navigation.test.ts "frontend/app/(dashboard)/layout.tsx" frontend/components/dashboard/dashboard-shell.tsx
git commit -m "feat(shell): organisatienaam in de kop, account en uitloggen in het mobiele menu, contact in de footer

De kop toont organizations.name (of zichtbaar 'niet geladen'), nooit meer het
maildomein. Afgesloten metingen staan met hun naam en sluitmaand in de
sidebar. De dubbele 'Rapporten'-knop en de Action Center-footer zijn weg.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

### Task 7: `/help` in de ingelogde omgeving, "Hulp" in sidebar en mobiel menu, `/help` beschermd

**Files:**
- Create: `frontend/lib/dashboard/help-content.ts`, `frontend/lib/dashboard/help-content.test.ts`
- Create: `frontend/app/(dashboard)/help/page.tsx`, `frontend/app/(dashboard)/help/page.test.ts`
- Modify: `frontend/lib/dashboard/shell-navigation.ts:14-28, 87-105, 130-146, 179-192, 233-242` (+ test)
- Modify: `frontend/lib/public-route-access.ts:33-40` (+ test `lib/public-route-access.test.ts:60-70`)

- [ ] **Step 1: Falende tests voor de hulpcopy en de route**

Maak `frontend/lib/dashboard/help-content.test.ts`:

```ts
import { describe, expect, it } from 'vitest'
import { HELP_CONTACT, HELP_ROLES, HELP_STEPS, HELP_THRESHOLDS } from './help-content'
import { MIN_INVITED_PER_DEPARTMENT, MIN_INVITED_TOTAL } from '@/lib/response-activation'

describe('hulpcopy (spec 2026-09-16 par. 6.4)', () => {
  it('beschrijft de drie stappen in gewone taal', () => {
    expect(HELP_STEPS.map((step) => step.title)).toEqual([
      '1. Inrichten',
      '2. Uitnodigen en herinneren',
      '3. Sluiten en rapport',
    ])
    expect(HELP_STEPS[1].body).toContain('vanuit je eigen mail')
    expect(HELP_STEPS[1].body).toContain('geen mailadressen')
    expect(HELP_STEPS[2].body).toContain('Na de sluitdatum kan niemand meer invullen')
  })

  it('legt de drempels uit met de echte constanten en zegt waarom', () => {
    expect(HELP_THRESHOLDS.total).toBe(MIN_INVITED_TOTAL)
    expect(HELP_THRESHOLDS.perDepartment).toBe(MIN_INVITED_PER_DEPARTMENT)
    expect(HELP_THRESHOLDS.why).toContain('groepsniveau')
    expect(HELP_THRESHOLDS.why).toContain(`${MIN_INVITED_TOTAL}`)
    expect(HELP_THRESHOLDS.why).toContain(`${MIN_INVITED_PER_DEPARTMENT}`)
    expect(HELP_THRESHOLDS.why).toContain('Overige afdelingen')
  })

  it('scheidt wat jij doet van wat Loep doet, zonder wij', () => {
    expect(HELP_ROLES.you.length).toBeGreaterThanOrEqual(3)
    expect(HELP_ROLES.loep.length).toBeGreaterThanOrEqual(3)
    const all = [...HELP_STEPS.map((s) => s.body), HELP_THRESHOLDS.why, ...HELP_ROLES.you, ...HELP_ROLES.loep, HELP_CONTACT.promise].join(' ')
    expect(all).not.toMatch(/\b[Ww]ij\b|\b[Ii]k\b/)
    expect(all).not.toMatch(/\b(campaign|respondentimport|surveylogica|managementduiding)\b/)
  })

  it('heeft één contactblok met hallo@getloep.nl en reactie binnen één werkdag', () => {
    expect(HELP_CONTACT.email).toBe('hallo@getloep.nl')
    expect(HELP_CONTACT.promise).toBe('Loep reageert binnen één werkdag.')
  })

  it('bevat geen em- of en-dashes', () => {
    const all = JSON.stringify({ HELP_STEPS, HELP_THRESHOLDS, HELP_ROLES, HELP_CONTACT })
    expect(all).not.toMatch(/[—–]/)
  })
})
```

Maak `frontend/app/(dashboard)/help/page.test.ts`:

```ts
import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

const source = readFileSync(new URL('./page.tsx', import.meta.url), 'utf8')

describe('/help (spec 2026-09-16 par. 6.4)', () => {
  it('is een servercomponent die de gedeelde hulpcopy rendert', () => {
    expect(source).not.toContain("'use client'")
    expect(source).toContain('HELP_STEPS')
    expect(source).toContain('HELP_THRESHOLDS')
    expect(source).toContain('HELP_ROLES')
    expect(source).toContain('HELP_CONTACT')
    expect(source).toContain('mailto:${HELP_CONTACT.email}')
  })

  it('stuurt zonder sessie naar /login, zoals de andere app-pagina\'s', () => {
    expect(source).toContain("if (!user) redirect('/login')")
  })

  it('bevat geen em- of en-dashes', () => {
    expect(source).not.toMatch(/[—–]/)
  })
})
```

Voeg aan `frontend/lib/public-route-access.test.ts`, in de test `only guards the app areas ...` (regels 60-70), na `expect(isProtectedAppRoutePath('/action-center')).toBe(true)` toe:
```ts
    expect(isProtectedAppRoutePath('/help')).toBe(true)
```

In `frontend/lib/dashboard/shell-navigation.test.ts`: voeg in de drie `navigation.modules`-verwachtingen (de tests `maps product rail to only overview and reports entries` en `hides product rail items that do not have any campaign yet`) na het `reports`-object toe:
```ts
      {
        key: 'help',
        label: 'Hulp',
        href: '/help',
        disabled: false,
      },
```
en in de test `derives the active module from category filters and real campaign routes` toe:
```ts
    expect(getActiveModuleFromLocation('/help', null, [...campaigns])).toBe('help')
```

Run:
```bash
cd /c/Users/larsh/Desktop/Business/Verisight/.worktrees/klantsuite-2b/frontend
npx vitest run lib/dashboard/help-content.test.ts "app/(dashboard)/help/page.test.ts" lib/public-route-access.test.ts lib/dashboard/shell-navigation.test.ts 2>&1 | tail -12
```
Expected: help-content en help/page falen op ontbrekende bestanden; `public-route-access` faalt op `/help` (en zodra de map `app/(dashboard)/help` bestaat ook op de fail-open guard tot Step 4 klaar is); shell-navigation faalt op de drie module-lijsten en de actieve module.

- [ ] **Step 2: `lib/dashboard/help-content.ts`**

```ts
import { LOEP_CONTACT_EMAIL } from '@/lib/loep-contact'
import { MIN_INVITED_PER_DEPARTMENT, MIN_INVITED_TOTAL } from '@/lib/response-activation'
import { EXTENSION_DAYS, MAX_EXTENSIONS } from '@/lib/dashboard/campaign-extension'

/**
 * Copy van /help (spec 2026-09-16 par. 6.4), los van React zodat de tests
 * de tekst kunnen lezen. Gewone taal, je/jij, Loep als onderwerp; de
 * drempels komen uit dezelfde constanten als de wizard en het rapport.
 */
export const HELP_STEPS: ReadonlyArray<{ title: string; body: string }> = [
  {
    title: '1. Inrichten',
    body: 'Kies de startdatum, de sluitdatum en de herinneringsdag, en vul in hoeveel medewerkers je uitnodigt. Loep zet de uitnodigingstekst en de link voor je klaar. Tot je op "Ja, verstuurd" klikt kun je alles nog aanpassen.',
  },
  {
    title: '2. Uitnodigen en herinneren',
    body: 'Je verstuurt de uitnodiging zelf vanuit je eigen mail: Loep verstuurt niets en slaat geen mailadressen van je medewerkers op. Op de herinneringsdag staat de herinneringstekst klaar op je overzicht; ook die verstuur je zelf.',
  },
  {
    title: '3. Sluiten en rapport',
    body: `Na de sluitdatum kan niemand meer invullen. Op je overzicht sluit je de meting, of je verlengt met ${EXTENSION_DAYS} dagen (maximaal ${MAX_EXTENSIONS} keer). Zodra de meting gesloten is met minimaal ${MIN_INVITED_TOTAL} ingevulde vragenlijsten, staat het rapport direct klaar als PDF.`,
  },
]

export const HELP_THRESHOLDS = {
  total: MIN_INVITED_TOTAL,
  perDepartment: MIN_INVITED_PER_DEPARTMENT,
  why: `Loep rapporteert alleen op groepsniveau. Onder ${MIN_INVITED_TOTAL} ingevulde vragenlijsten is een patroon niet te onderscheiden van toeval, en onder ${MIN_INVITED_PER_DEPARTMENT} per afdeling zou een antwoord herleidbaar kunnen zijn. Daarom maakt Loep dan geen rapport en geen uitsplitsing per afdeling; kleinere afdelingen vallen onder "Overige afdelingen".`,
}

export const HELP_ROLES = {
  you: [
    'De meting inrichten: datums, aantal deelnemers, afdelingen.',
    'De uitnodiging en de herinnering versturen vanuit je eigen mail.',
    'De meting sluiten of verlengen, en het rapport downloaden.',
    'Het gesprek met je managementteam voeren; het rapport is daarvoor het script.',
  ],
  loep: [
    'Je organisatie en je meting aanmaken na de intake.',
    'De vragenlijst, de uitnodigingstekst en de herinneringstekst klaarzetten.',
    'Antwoorden verwerken tot een rapport op groepsniveau, nooit per persoon.',
    'Vragen beantwoorden en een nieuwe meting klaarzetten als je die aanvraagt.',
  ],
}

export const HELP_CONTACT = {
  email: LOEP_CONTACT_EMAIL,
  promise: 'Loep reageert binnen één werkdag.',
}
```
(`EXTENSION_DAYS = 14` en `MAX_EXTENSIONS = 3` staan op regel 4-5 van `lib/dashboard/campaign-extension.ts`, sinds plan 2a.)

- [ ] **Step 3: `app/(dashboard)/help/page.tsx`**

```tsx
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { HELP_CONTACT, HELP_ROLES, HELP_STEPS, HELP_THRESHOLDS } from '@/lib/dashboard/help-content'

export default async function HelpPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  return (
    <div className="space-y-8">
      <section className="space-y-3 border-b border-slate-200/80 pb-6">
        <div className="flex items-center gap-3">
          <span className="h-px w-10 bg-[#C36A29]" />
          <p className="text-[0.72rem] font-semibold uppercase tracking-[0.28em] text-[color:var(--dashboard-muted)]">
            Hulp
          </p>
        </div>
        <h1 className="text-[2.4rem] font-semibold leading-none tracking-[-0.06em] text-[color:var(--dashboard-ink)] md:text-[3rem]">
          Zo werkt een meting
        </h1>
        <p className="max-w-3xl text-sm leading-6 text-[color:var(--dashboard-text)]">
          Drie stappen, twee drempels en één adres voor vragen. Alles wat je hier leest staat ook op
          de plek waar je het nodig hebt, maar hier staat het bij elkaar.
        </p>
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        {HELP_STEPS.map((step) => (
          <article key={step.title} className="rounded-[22px] border border-[color:var(--dashboard-frame-border)] bg-white px-6 py-6">
            <h2 className="text-base font-semibold text-[color:var(--dashboard-ink)]">{step.title}</h2>
            <p className="mt-2 text-sm leading-6 text-[color:var(--dashboard-text)]">{step.body}</p>
          </article>
        ))}
      </section>

      <section className="rounded-[22px] border border-[color:var(--dashboard-frame-border)] bg-white px-6 py-6">
        <h2 className="text-base font-semibold text-[color:var(--dashboard-ink)]">
          Minimaal {HELP_THRESHOLDS.total} ingevulde vragenlijsten, en {HELP_THRESHOLDS.perDepartment} per afdeling
        </h2>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-[color:var(--dashboard-text)]">{HELP_THRESHOLDS.why}</p>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <article className="rounded-[22px] border border-[color:var(--dashboard-frame-border)] bg-white px-6 py-6">
          <h2 className="text-base font-semibold text-[color:var(--dashboard-ink)]">Wat jij doet</h2>
          <ul className="mt-3 space-y-2 text-sm leading-6 text-[color:var(--dashboard-text)]">
            {HELP_ROLES.you.map((item) => (
              <li key={item} className="flex gap-2">
                <span aria-hidden className="mt-[0.55rem] h-1.5 w-1.5 shrink-0 rounded-full bg-[#E8A020]" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </article>
        <article className="rounded-[22px] border border-[color:var(--dashboard-frame-border)] bg-white px-6 py-6">
          <h2 className="text-base font-semibold text-[color:var(--dashboard-ink)]">Wat Loep doet</h2>
          <ul className="mt-3 space-y-2 text-sm leading-6 text-[color:var(--dashboard-text)]">
            {HELP_ROLES.loep.map((item) => (
              <li key={item} className="flex gap-2">
                <span aria-hidden className="mt-[0.55rem] h-1.5 w-1.5 shrink-0 rounded-full bg-[#0D1B2A]" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </article>
      </section>

      <section className="rounded-[22px] bg-[#0D1B2A] px-6 py-6 text-white">
        <p className="text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-[#E8A020]">Vragen?</p>
        <p className="mt-2 text-sm leading-6 text-white/80">
          Mail naar{' '}
          <a href={`mailto:${HELP_CONTACT.email}`} className="font-semibold text-white underline underline-offset-4">
            {HELP_CONTACT.email}
          </a>
          . {HELP_CONTACT.promise}
        </p>
      </section>
    </div>
  )
}
```

- [ ] **Step 4: Route beschermen en in de navigatie zetten**

`frontend/lib/public-route-access.ts` (regels 33-40): voeg `'/help',` toe na `'/reports',`:
```ts
export const PROTECTED_APP_ROUTES = [
  '/dashboard',
  '/beheer',
  '/campaigns',
  '/reports',
  '/help',
  '/action-center',
  '/dev',
] as const
```

`frontend/lib/dashboard/shell-navigation.ts`:

1. `DashboardModuleKey` (regels 14-23): voeg `| 'help'` toe na `| 'reports'`.
2. `DashboardCategoryModuleKey` (regels 25-28): `Exclude<DashboardModuleKey, 'overview' | 'reports' | 'help' | 'action_center'>`.
3. In `getModuleKeyForScanType` (regels 92-95) het Record-type: `Exclude<DashboardModuleKey, 'overview' | 'reports' | 'help' | 'action_center'>`.
4. `getActiveModuleFromLocation` (regels 130-146): na `if (pathname.startsWith('/reports')) return 'reports'` toevoegen:
   ```ts
     if (pathname.startsWith('/help')) return 'help'
   ```
5. In `buildDashboardShellNavigation`, het `modules`-array (regels 179-192): na het `reports`-object toevoegen:
   ```ts
       {
         key: 'help',
         label: 'Hulp',
         href: '/help',
         disabled: false,
       },
   ```
6. `getDashboardShellCurrentLabel` (regels 233-242): na de `/reports`-regel toevoegen `if (pathname.startsWith('/help')) return 'Hulp'`.

Run:
```bash
cd /c/Users/larsh/Desktop/Business/Verisight/.worktrees/klantsuite-2b/frontend
npx vitest run lib/dashboard/help-content.test.ts "app/(dashboard)/help/page.test.ts" lib/public-route-access.test.ts lib/dashboard/shell-navigation.test.ts components/dashboard/dashboard-shell.guard.test.ts 2>&1 | tail -6
npx tsc --noEmit 2>&1 | grep -c "error TS"
```
Expected: alles groen (de fail-open guard in `public-route-access.test.ts` ziet de nieuwe map en vindt hem in de lijst); tsc `133`.

- [ ] **Step 5: Commit**

```bash
cd /c/Users/larsh/Desktop/Business/Verisight/.worktrees/klantsuite-2b
git add frontend/lib/dashboard/help-content.ts frontend/lib/dashboard/help-content.test.ts "frontend/app/(dashboard)/help/page.tsx" "frontend/app/(dashboard)/help/page.test.ts" frontend/lib/public-route-access.ts frontend/lib/public-route-access.test.ts frontend/lib/dashboard/shell-navigation.ts frontend/lib/dashboard/shell-navigation.test.ts
git commit -m "feat(help): hulp en contact in de ingelogde omgeving

/help legt de drie stappen, de drempels (10 en 5, met waarom) en de
rolverdeling uit in gewone taal, met één contactblok. 'Hulp' staat in de
sidebar en het mobiele menu; de route staat in PROTECTED_APP_ROUTES.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

### Task 8: Activatiepagina en inlogpagina in Loep-stijl met self-service-copy; melding bij een verlopen activatielink

**Files:**
- Modify: `frontend/app/(auth)/complete-account/page.tsx` (JSX en copy; de auth-logica van regels 9-118 blijft inhoudelijk gelijk)
- Modify: `frontend/app/(auth)/login/page.tsx`
- Modify: `frontend/components/dashboard/onboarding-panels.tsx:84-102` (`ActivationJourneyPanel` weg; enige importer was de activatiepagina)
- Test: `frontend/app/(auth)/login/page.test.ts` (herschreven), `frontend/app/(auth)/complete-account/page.test.ts` (nieuw)

- [ ] **Step 1: Falende guards (de oude login-test faalt al op main en wordt hier herschreven)**

Vervang `frontend/app/(auth)/login/page.test.ts` door:

```ts
import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

const login = readFileSync(new URL('./page.tsx', import.meta.url), 'utf8')

describe('inlogpagina (spec 2026-09-16 par. 7, walkthrough 7.3)', () => {
  it('is licht: inloggen bij Loep met e-mail en wachtwoord, en de contactregel', () => {
    expect(login).toContain('Log in bij Loep')
    expect(login).toContain('hallo@getloep.nl')
    expect(login).toContain('Wachtwoord vergeten')
  })

  it('zegt niets over managers, versies of vrijgave', () => {
    expect(login).not.toContain('v2.0')
    expect(login).not.toContain('Vertrouwelijk platform')
    expect(login).not.toContain('managers')
    expect(login).not.toContain('vrijgegeven')
    expect(login).not.toContain('beheerders')
  })

  it('legt een verlopen of gebruikte activatielink uit in plaats van stil op /login te landen', () => {
    // complete-account stuurt bij een mislukte verifyOtp naar /login?error=invite.
    expect(login).toContain("get('error') === 'invite'")
    expect(login).toContain('De activatielink is verlopen of al gebruikt.')
  })

  it('staat in het Loep-ontwerp, niet in het oude blauw', () => {
    expect(login).not.toContain('bg-blue-600')
    expect(login).not.toContain('text-blue-600')
    expect(login).toContain('#0D1B2A')
  })

  it('bevat geen em- of en-dashes', () => {
    expect(login).not.toMatch(/[—–]/)
  })
})
```

Maak `frontend/app/(auth)/complete-account/page.test.ts`:

```ts
import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

const page = readFileSync(new URL('./page.tsx', import.meta.url), 'utf8')
const panels = readFileSync(new URL('../../../components/dashboard/onboarding-panels.tsx', import.meta.url), 'utf8')

describe('activatiepagina (spec 2026-09-16 par. 7, walkthrough 0.1 t/m 0.4)', () => {
  it('vraagt een wachtwoord en belooft de self-service-flow in drie stappen', () => {
    expect(page).toContain('Kies een wachtwoord')
    expect(page).toContain('Startdatum en deelnemers')
    expect(page).toContain('Uitnodigen')
    expect(page).toContain('Volgen en afronden')
  })

  it('bevat geen managed-copy of jargon meer', () => {
    for (const forbidden of ['respondentimport', 'campaign', 'surveylogica', 'Begeleide inrichting', 'managementduiding', 'ActivationJourneyPanel', 'juiste dashboard']) {
      expect(page).not.toContain(forbidden)
    }
    expect(panels).not.toContain('ActivationJourneyPanel')
  })

  it('geeft beide wachtwoordvelden dezelfde placeholder', () => {
    expect(page.match(/placeholder="Minimaal 8 tekens"/g)?.length).toBe(2)
    expect(page).not.toContain('placeholder="••••••••"')
  })

  it('staat in het Loep-ontwerp', () => {
    expect(page).not.toContain('bg-blue-600')
    expect(page).not.toContain('text-blue-600')
    expect(page).toContain('#0D1B2A')
    expect(page).toContain('#E8A020')
  })

  it('houdt de token_hash-verificatie en de L5-opschoning van de URL', () => {
    expect(page).toContain('verifyOtp')
    expect(page).toContain("params.get('token_hash')")
    expect(page).toContain('window.history.replaceState')
    expect(page).toContain("router.replace('/login?error=invite')")
  })

  it('bevat geen em- of en-dashes, ook niet in commentaar', () => {
    expect(page).not.toMatch(/[—–]/)
  })
})
```

Run:
```bash
cd /c/Users/larsh/Desktop/Business/Verisight/.worktrees/klantsuite-2b/frontend
npx vitest run "app/(auth)" 2>&1 | tail -12
```
Expected: beide bestanden falen op de nieuwe verwachtingen.

- [ ] **Step 2: `app/(auth)/complete-account/page.tsx` herschrijven**

Vervang het bestand volledig door (de logica is die van main, met commentaar zonder streepjes en nieuwe copy en JSX):

```tsx
'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

const inputClass =
  'w-full rounded-lg border border-[#0D1B2A]/20 bg-white px-3 py-2.5 text-sm text-[#0D1B2A] placeholder:text-[#0D1B2A]/40 focus:border-[#E8A020] focus:outline-none focus:ring-2 focus:ring-[#E8A020]/40'

const NEXT_STEPS = ['Startdatum en deelnemers', 'Uitnodigen', 'Volgen en afronden']

export default function CompleteAccountPage() {
  const router = useRouter()
  const supabase = createClient()
  const [password, setPassword] = useState('')
  const [password2, setPassword2] = useState('')
  const [loading, setLoading] = useState(false)
  const [checking, setChecking] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [email, setEmail] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true

    const timeout = setTimeout(() => {
      if (mounted) router.replace('/login?error=invite')
    }, 5000)

    function applySession(userEmail: string | null | undefined) {
      if (!mounted) return
      clearTimeout(timeout)
      setEmail(userEmail ?? null)
      setChecking(false)
    }

    // @supabase/ssr's createBrowserClient forceert altijd flowType 'pkce'
    // (hardcoded in de library, niet via options te overschrijven); die
    // client herkent dus alleen een ?code=-param, nooit een #access_token-
    // hash. Een server-verstuurde activatielink (sendActivationLink) kan
    // echter geen geldige pkce-code leveren: de code_verifier hoort thuis in
    // dezelfde browser die de link verstuurt, en dat is nooit de browser van
    // de ontvanger. Daarom stuurt de activatiemail een token_hash mee
    // (Supabase-template aangepast) die hier expliciet met verifyOtp wordt
    // ingewisseld; dat werkt ongeacht flowType. Bestaat er geen token_hash
    // (bv. een teruggekeerde, al ingelogde gebruiker), dan valt dit terug op
    // de gewone getUser()-check.
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) applySession(session.user.email)
    })

    async function verifyFromTokenHash(): Promise<boolean> {
      const params = new URLSearchParams(window.location.search)
      const tokenHash = params.get('token_hash')
      const type = params.get('type')
      if (!tokenHash || !type) return false

      const { data, error } = await supabase.auth.verifyOtp({
        token_hash: tokenHash,
        type: type as 'magiclink' | 'invite' | 'recovery' | 'email' | 'signup' | 'email_change',
      })
      if (!mounted) return true
      if (error || !data.user) {
        router.replace('/login?error=invite')
        return true
      }
      // L5: strip het (nu verbruikte) token_hash uit de URL zodat het niet in de
      // browser-history/adresbalk blijft staan op een gedeeld apparaat.
      window.history.replaceState({}, '', window.location.pathname)
      applySession(data.user.email)
      return true
    }

    async function loadExistingSession() {
      const handledViaTokenHash = await verifyFromTokenHash()
      if (handledViaTokenHash) return

      const { data } = await supabase.auth.getUser()
      if (data.user) applySession(data.user.email)
    }
    void loadExistingSession()

    return () => {
      mounted = false
      clearTimeout(timeout)
      subscription.unsubscribe()
    }
  }, [router, supabase])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (password !== password2) {
      setError('De twee wachtwoorden zijn niet gelijk.')
      return
    }

    if (password.length < 8) {
      setError('Kies een wachtwoord van minimaal 8 tekens.')
      return
    }

    setLoading(true)
    const { error: updateError } = await supabase.auth.updateUser({ password })
    setLoading(false)

    if (updateError) {
      setError('Het wachtwoord kon niet worden opgeslagen. Probeer het opnieuw, of gebruik later Wachtwoord vergeten.')
      return
    }

    setSuccess('Wachtwoord opgeslagen. Loep opent je overzicht.')
    setTimeout(() => router.push('/dashboard'), 1200)
  }

  function handleSkip() {
    router.push('/dashboard')
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F4F1EA] p-4 text-[#0D1B2A]">
      <div className="w-full max-w-4xl">
        <div className="mb-8 text-center">
          <Link href="/" className="font-serif text-2xl tracking-[-0.03em] text-[#0D1B2A]">
            Loep <span className="text-[#E8A020]">&bull;</span>
          </Link>
          <p className="mt-1 text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-[#4A6070]">
            Scherper zien wat telt
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(280px,0.9fr)]">
          <div className="rounded-[22px] border border-[#0D1B2A]/15 bg-white p-8">
            {checking ? (
              <div className="text-center">
                <h1 className="mb-2 text-lg font-semibold">Activatielink controleren</h1>
                <p className="text-sm text-[#4A6070]">Even geduld. Loep controleert je link.</p>
              </div>
            ) : (
              <>
                <p className="text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-[#B07A10]">Welkom bij Loep</p>
                <h1 className="mt-2 font-serif text-[2rem] leading-[1.05] tracking-[-0.03em]">Kies een wachtwoord</h1>
                <p className="mb-6 mt-3 text-sm leading-6 text-[#4A6070]">
                  Je bent ingelogd via de activatiemail voor {email ?? 'jouw account'}. Kies nu een wachtwoord,
                  dan kun je later gewoon via de inlogpagina terugkomen.
                </p>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label htmlFor="password" className="mb-1 block text-sm font-medium">
                      Nieuw wachtwoord
                    </label>
                    <input
                      id="password"
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Minimaal 8 tekens"
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label htmlFor="password2" className="mb-1 block text-sm font-medium">
                      Herhaal het wachtwoord
                    </label>
                    <input
                      id="password2"
                      type="password"
                      required
                      value={password2}
                      onChange={(e) => setPassword2(e.target.value)}
                      placeholder="Minimaal 8 tekens"
                      className={inputClass}
                    />
                  </div>

                  {error ? (
                    <div role="alert" className="rounded-lg border border-[#C0392B]/30 bg-[#C0392B]/10 px-3 py-2 text-sm text-[#8E2A1F]">
                      {error}
                    </div>
                  ) : null}

                  {success ? (
                    <div role="status" className="rounded-lg border border-[#3C8D8A]/30 bg-[#3C8D8A]/10 px-3 py-2 text-sm text-[#2A6663]">
                      {success}
                    </div>
                  ) : null}

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full rounded-lg bg-[#0D1B2A] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#1B2E45] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {loading ? 'Opslaan...' : 'Wachtwoord instellen'}
                  </button>
                </form>

                <button
                  type="button"
                  onClick={handleSkip}
                  className="mt-3 w-full rounded-lg border border-[#0D1B2A]/20 px-4 py-2.5 text-sm font-semibold text-[#0D1B2A] hover:bg-[#F4F1EA]"
                >
                  Later, ga naar mijn overzicht
                </button>

                <p className="mt-4 text-xs text-[#4A6070]">
                  Liever later? Via{' '}
                  <Link href="/forgot-password" className="font-semibold text-[#0D1B2A] underline underline-offset-4">
                    Wachtwoord vergeten
                  </Link>{' '}
                  stel je altijd alsnog een wachtwoord in.
                </p>
              </>
            )}
          </div>

          <aside className="rounded-[22px] bg-[#0D1B2A] p-8 text-white">
            <p className="text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-[#E8A020]">Wat je hierna doet</p>
            <p className="mt-3 text-sm leading-6 text-white/80">
              Loep heeft je organisatie en je eerste meting al aangemaakt. Daarna richt je in drie stappen je eerste
              meting in:
            </p>
            <ol className="mt-4 space-y-3">
              {NEXT_STEPS.map((step, index) => (
                <li key={step} className="flex items-start gap-3">
                  <span className="mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#E8A020] text-xs font-bold text-[#0D1B2A]">
                    {index + 1}
                  </span>
                  <span className="text-sm font-semibold">{step}</span>
                </li>
              ))}
            </ol>
            <p className="mt-6 text-xs leading-5 text-white/60">
              Je verstuurt de uitnodiging zelf vanuit je eigen mail; Loep slaat geen mailadressen van je medewerkers op.
            </p>
          </aside>
        </div>
      </div>
    </div>
  )
}
```

Verwijder in `frontend/components/dashboard/onboarding-panels.tsx` de hele functie `ActivationJourneyPanel` (regels 84-102, van `export function ActivationJourneyPanel() {` tot en met de sluitende `}`). Controleer dat niets hem nog importeert:
```bash
cd /c/Users/larsh/Desktop/Business/Verisight/.worktrees/klantsuite-2b/frontend
grep -rn "ActivationJourneyPanel" --include=*.ts --include=*.tsx . | grep -v node_modules
```
Expected: alleen de regel in `complete-account/page.test.ts` (de guard die zijn afwezigheid pint).

- [ ] **Step 3: `app/(auth)/login/page.tsx` herschrijven**

```tsx
'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { LOEP_CONTACT_EMAIL } from '@/lib/loep-contact'

const inputClass =
  'w-full rounded-lg border border-[#0D1B2A]/20 bg-white px-3 py-2.5 text-sm text-[#0D1B2A] placeholder:text-[#0D1B2A]/40 focus:border-[#E8A020] focus:outline-none focus:ring-2 focus:ring-[#E8A020]/40'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [linkNotice, setLinkNotice] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  // complete-account stuurt hierheen met ?error=invite als de activatielink
  // niet meer geldig is. Zonder uitleg landde de klant stil op een kale
  // inlogpagina (walkthrough 0). window.location in plaats van
  // useSearchParams: die laatste vraagt een Suspense-grens in de App Router.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    if (params.get('error') === 'invite') {
      setLinkNotice(
        `De activatielink is verlopen of al gebruikt. Vraag via Wachtwoord vergeten een nieuwe link aan, of mail ${LOEP_CONTACT_EMAIL}.`,
      )
    }
  }, [])

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setError('Dit e-mailadres en wachtwoord horen niet bij elkaar. Probeer het opnieuw.')
      setLoading(false)
      return
    }

    router.push('/dashboard')
    router.refresh()
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F4F1EA] p-4 text-[#0D1B2A]">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <Link href="/" className="font-serif text-2xl tracking-[-0.03em] text-[#0D1B2A]">
            Loep <span className="text-[#E8A020]">&bull;</span>
          </Link>
          <p className="mt-1 text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-[#4A6070]">
            Scherper zien wat telt
          </p>
        </div>

        <div className="rounded-[22px] border border-[#0D1B2A]/15 bg-white p-8">
          <h1 className="mb-6 font-serif text-[1.75rem] leading-[1.05] tracking-[-0.03em]">Log in bij Loep</h1>

          {linkNotice ? (
            <div role="status" className="mb-4 rounded-lg border border-[#E8A020]/50 bg-[#E8A020]/15 px-3 py-2 text-sm text-[#7A5410]">
              {linkNotice}
            </div>
          ) : null}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label htmlFor="email" className="mb-1 block text-sm font-medium">
                E-mailadres
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="naam@organisatie.nl"
                className={inputClass}
              />
            </div>

            <div>
              <div className="mb-1 flex items-center justify-between">
                <label htmlFor="password" className="block text-sm font-medium">
                  Wachtwoord
                </label>
                <Link href="/forgot-password" className="text-xs font-semibold text-[#0D1B2A] underline underline-offset-4">
                  Wachtwoord vergeten?
                </Link>
              </div>
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Je wachtwoord"
                className={inputClass}
              />
            </div>

            {error ? (
              <div role="alert" className="rounded-lg border border-[#C0392B]/30 bg-[#C0392B]/10 px-3 py-2 text-sm text-[#8E2A1F]">
                {error}
              </div>
            ) : null}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-[#0D1B2A] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#1B2E45] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? 'Bezig met inloggen...' : 'Inloggen'}
            </button>
          </form>
        </div>

        <p className="mt-4 text-center text-xs text-[#4A6070]">
          Nog geen toegang, of moet je organisatie nog worden ingericht?{' '}
          <a href={`mailto:${LOEP_CONTACT_EMAIL}`} className="font-semibold text-[#0D1B2A] underline underline-offset-4">
            Mail {LOEP_CONTACT_EMAIL}
          </a>
        </p>
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Run de tests en tsc**

Run:
```bash
cd /c/Users/larsh/Desktop/Business/Verisight/.worktrees/klantsuite-2b/frontend
npx vitest run "app/(auth)" 2>&1 | tail -4
npx tsc --noEmit 2>&1 | grep -c "error TS"
```
Expected: beide bestanden groen; tsc `133`. Let op: `app/(auth)/login/page.test.ts` faalde op main (oude verwachting "eerste read"); dat is de verwachte `<`-regel in de faalset-diff van Task 11.

- [ ] **Step 5: Commit**

```bash
cd /c/Users/larsh/Desktop/Business/Verisight/.worktrees/klantsuite-2b
git add "frontend/app/(auth)/complete-account/page.tsx" "frontend/app/(auth)/complete-account/page.test.ts" "frontend/app/(auth)/login/page.tsx" "frontend/app/(auth)/login/page.test.ts" frontend/components/dashboard/onboarding-panels.tsx
git commit -m "feat(auth): activatie- en inlogpagina in Loep-stijl met self-service-copy

De activatiepagina belooft wat er komt (drie stappen, zelf uitnodigen) in
plaats van de oude managed-flow, beide wachtwoordvelden hebben dezelfde
placeholder, en een verlopen activatielink krijgt op /login een uitleg.
ActivationJourneyPanel is weg (enige importer was deze pagina).

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

### Task 9: Wizard responsive (één kolom onder `lg`); Nederlandse foutmelding met contact bij de rapportdownload

**Files:**
- Modify: `frontend/components/dashboard/setup-wizard-card.tsx:417` (+ guard-test)
- Modify: `frontend/app/(dashboard)/campaigns/[id]/pdf-download-button.tsx:1-5, 17-30, 47-60, 71-73, 103` (+ test)

- [ ] **Step 1: Falende guards**

Voeg aan `frontend/components/dashboard/setup-wizard-card.guard.test.ts` een nieuwe describe onderaan toe:

```ts
describe('setup-wizard responsive en invoervelden (spec 2026-09-16 par. 7, walkthrough 8.1 en 3.12)', () => {
  it('zet de drie stappen onder elkaar onder lg en naast elkaar vanaf lg', () => {
    expect(src).toContain('grid grid-cols-1 gap-3 lg:grid-cols-3')
    expect(src).not.toContain('grid grid-cols-3 gap-3')
  })

  it('houdt het onderwerp een eenregelig invoerveld dat niet afkapt', () => {
    expect(src).toMatch(/<input\s+id="invite-subject"/)
    expect(src).not.toMatch(/<textarea\s+id="invite-subject"/)
  })
})
```

Voeg aan `frontend/app/(dashboard)/campaigns/[id]/pdf-download-button.test.ts` toe:

```ts
  it('legt een mislukte download in het Nederlands uit, met contact, en houdt de technische melding apart (walkthrough 5.3)', () => {
    const source = readFileSync(new URL('./pdf-download-button.tsx', import.meta.url), 'utf8')

    expect(source).toContain("import { LOEP_CONTACT_EMAIL } from '@/lib/loep-contact'")
    expect(source).toContain('Het rapport kon niet worden opgehaald')
    expect(source).toContain('Technische melding:')
    expect(source).not.toContain('Controleer of de backend bereikbaar is')
    expect(source).not.toContain('Rapport kon niet worden gegenereerd')
    expect(source).not.toMatch(/[—–]/)
  })
```

Run:
```bash
cd /c/Users/larsh/Desktop/Business/Verisight/.worktrees/klantsuite-2b/frontend
npx vitest run components/dashboard/setup-wizard-card.guard.test.ts "app/(dashboard)/campaigns/[id]/pdf-download-button.test.ts" 2>&1 | tail -8
```
Expected: de nieuwe tests falen (`grid grid-cols-3 gap-3` staat er nog; de knop kent `LOEP_CONTACT_EMAIL` niet).

- [ ] **Step 2: Wizard-grid**

In `frontend/components/dashboard/setup-wizard-card.tsx` regel 417:
```tsx
      <div className="mt-6 grid grid-cols-3 gap-3">
```
wordt:
```tsx
      <div className="mt-6 grid grid-cols-1 gap-3 lg:grid-cols-3">
```
Niets anders in de wizard verandert: de velden hebben al `w-full`, de knop "Opslaan en verder" is `w-full` en past op één regel zodra de kolom de volle breedte krijgt. (De onderwerpregel is sinds plan 2a al een `<input>`; de guard pint dat alleen.)

- [ ] **Step 3: PDF-knop: Nederlandse melding met contact, technische melding apart**

In `frontend/app/(dashboard)/campaigns/[id]/pdf-download-button.tsx`:

Import toevoegen na regel 4:
```ts
import { LOEP_CONTACT_EMAIL } from '@/lib/loep-contact'
```

Vervang de state-declaratie (regel 30):
```ts
  const [error, setError] = useState<string | null>(null)
```
door:
```ts
  const [error, setError] = useState<{ message: string; technical: string | null } | null>(null)
```

Vervang in `handleDownload` het blok
```ts
    if (unsupportedMessage) {
      setError(unsupportedMessage)
      return
    }
```
door:
```ts
    if (unsupportedMessage) {
      setError({ message: unsupportedMessage, technical: null })
      return
    }
```

Vervang het foutblok (regels 47-60):
```ts
      if (!response.ok) {
        let detail = `Rapport kon niet worden gegenereerd (${response.status}). Probeer het opnieuw.`
        try {
          const payload = (await response.json()) as { detail?: string }
          if (typeof payload.detail === 'string' && payload.detail.trim()) {
            detail = payload.detail
          }
        } catch {
          // Keep the generic fallback when no JSON detail is available.
        }
        setError(detail)
        setLoadingFormat(null)
        return
      }
```
door:
```ts
      if (!response.ok) {
        // De klant leest een Nederlandse zin met een vervolgstap; de technische
        // melding van de backend (vaak Engels, zoals "Internal Server Error")
        // blijft zichtbaar maar apart, zodat Loep er iets mee kan (Fail Loud).
        let technical: string | null = null
        try {
          const payload = (await response.json()) as { detail?: string }
          if (typeof payload.detail === 'string' && payload.detail.trim()) technical = payload.detail.trim()
        } catch {
          // Geen JSON-detail (bijvoorbeeld een kale 500 van de proxy): alleen de statuscode.
        }
        setError({
          message: `Het rapport kon niet worden opgehaald (fout ${response.status}). Probeer het later opnieuw of mail ${LOEP_CONTACT_EMAIL}.`,
          technical,
        })
        setLoadingFormat(null)
        return
      }
```

Vervang de catch (regels 71-73):
```ts
    } catch {
      setError('Verbindingsfout. Controleer of de backend bereikbaar is.')
    } finally {
```
door:
```ts
    } catch {
      setError({ message: 'Verbindingsfout. Controleer je internetverbinding en probeer het opnieuw.', technical: null })
    } finally {
```

Vervang de weergave (regel 103):
```tsx
      {error ? <p className={`max-w-xs text-xs text-red-600 ${textAlign}`}>{error}</p> : null}
```
door:
```tsx
      {error ? (
        <p role="alert" className={`max-w-xs text-xs text-red-600 ${textAlign}`}>
          {error.message}
          {error.technical ? (
            <span className="mt-1 block text-[10px] text-red-600/70">Technische melding: {error.technical}</span>
          ) : null}
        </p>
      ) : null}
```

- [ ] **Step 4: Run de tests en tsc**

Run:
```bash
cd /c/Users/larsh/Desktop/Business/Verisight/.worktrees/klantsuite-2b/frontend
npx vitest run components/dashboard/setup-wizard-card.guard.test.ts "app/(dashboard)/campaigns/[id]/pdf-download-button.test.ts" 2>&1 | tail -4
npx tsc --noEmit 2>&1 | grep -c "error TS"
```
Expected: beide groen; tsc `133`.

- [ ] **Step 5: Commit**

```bash
cd /c/Users/larsh/Desktop/Business/Verisight/.worktrees/klantsuite-2b
git add frontend/components/dashboard/setup-wizard-card.tsx frontend/components/dashboard/setup-wizard-card.guard.test.ts "frontend/app/(dashboard)/campaigns/[id]/pdf-download-button.tsx" "frontend/app/(dashboard)/campaigns/[id]/pdf-download-button.test.ts"
git commit -m "fix(wizard): één kolom op een telefoon; rapportdownload legt een fout in het Nederlands uit

De drie stappen staan onder lg onder elkaar (walkthrough 8.1: op 375 px waren
de velden 30 px breed). Een mislukte download zegt wat de klant kan doen en
houdt de technische melding apart zichtbaar.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

### Task 10: Streepjes-sweep over de ingelogde omgeving, met grep-guardtest

**Files:**
- Create: `frontend/lib/dashboard/no-dashes.guard.test.ts`
- Modify: de 33 regels uit de tabel hieronder (16 bestanden; de twee regels in `complete-account/page.tsx` zijn in Task 8 al verdwenen)

- [ ] **Step 1: Falende guard die de hele ingelogde omgeving afloopt**

Maak `frontend/lib/dashboard/no-dashes.guard.test.ts`:

```ts
import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

/**
 * Spec 2026-09-16 par. 7: geen em- (U+2014) of en-dashes (U+2013) in de copy
 * van de ingelogde omgeving. De guard loopt alle niet-testbronnen af in
 * components/dashboard, app/(dashboard) en app/(auth), ook commentaar: één
 * regel is makkelijker te bewaken dan een uitzondering per regel.
 */
const ROOTS = ['components/dashboard', 'app/(dashboard)', 'app/(auth)']

function sourceFiles(dir: string, out: string[] = []): string[] {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) sourceFiles(full, out)
    else if (/\.tsx?$/.test(entry.name) && !/\.test\./.test(entry.name)) out.push(full)
  }
  return out
}

describe('geen em- of en-dashes in de ingelogde omgeving (spec 2026-09-16 par. 7)', () => {
  it('vindt geen enkele U+2014 of U+2013 in bronbestanden onder de drie mappen', () => {
    const hits: string[] = []
    for (const root of ROOTS) {
      for (const file of sourceFiles(path.join(process.cwd(), root))) {
        fs.readFileSync(file, 'utf8')
          .split('\n')
          .forEach((line, index) => {
            if (/[—–]/.test(line)) hits.push(`${path.relative(process.cwd(), file)}:${index + 1}`)
          })
      }
    }
    expect(hits, `streepjes gevonden in:\n${hits.join('\n')}`).toEqual([])
  })
})
```

Run:
```bash
cd /c/Users/larsh/Desktop/Business/Verisight/.worktrees/klantsuite-2b/frontend
npx vitest run lib/dashboard/no-dashes.guard.test.ts 2>&1 | tail -45
```
Expected: FAIL met een lijst van 33 `bestand:regel`-treffers (35 op main, min de twee uit `complete-account/page.tsx` die Task 8 al wegnam). Wijkt de lijst af, dan is de tabel hieronder leidend voor wat er op main stond; los alles op wat de guard nu meldt.

- [ ] **Step 2: De sweep, regel voor regel**

Regel: in klantcopy een dubbele punt, komma, puntkomma of haakjes; in lege-waarde-placeholders `n.b.`; in commentaar een dubbele punt of komma. Nooit een em-dash door een gewoon koppelteken vervangen in lopende tekst (dat leest als een afbreking).

| Bestand:regel | Was | Wordt |
|---|---|---|
| `components/dashboard/add-respondents-form.tsx:24` | `{ value: '', label: '— niet opgegeven —' },` | `{ value: '', label: 'niet opgegeven' },` |
| `add-respondents-form.tsx:309` | `{organizationById[campaign.organization_id] ?? 'Onbekende organisatie'} — {campaign.name} (` | `{organizationById[campaign.organization_id] ?? 'Onbekende organisatie'}: {campaign.name} (` |
| `add-respondents-form.tsx:311` | `{campaign.is_active ? '' : ' — gearchiveerd'}` | `{campaign.is_active ? '' : ' (gearchiveerd)'}` |
| `add-respondents-form.tsx:604` | `{row.department \|\| '—'}` | `{row.department \|\| 'n.b.'}` |
| `add-respondents-form.tsx:605` | `{row.role_level \|\| '—'}` | `{row.role_level \|\| 'n.b.'}` |
| `add-respondents-form.tsx:606` | `{row.exit_month \|\| '—'}` | `{row.exit_month \|\| 'n.b.'}` |
| `add-respondents-form.tsx:639` | `Rij {issue.row_number} — {issue.field}: {issue.message}` | `Rij {issue.row_number}, {issue.field}: {issue.message}` |
| `components/dashboard/customer-launch-control.tsx:122` | `{/* Blockers — only if any */}` | `{/* Blockers: only if any */}` |
| `components/dashboard/guided-self-serve-panel.tsx:685` | `/* STATE C: Live — response tracking + reminder management */` | `/* STATE C: Live, response tracking + reminder management */` |
| `guided-self-serve-panel.tsx:714` | `{/* Reminder settings — always editable */}` | `{/* Reminder settings, always editable */}` |
| `components/dashboard/preflight-checklist.tsx:97` | `` `${lead.name} — ${lead.organization} — ${getContactRouteLabel(lead.route_interest)} — ${getContactDesiredTimingLabel(lead.desired_timing)}` `` | `` `${lead.name} · ${lead.organization} · ${getContactRouteLabel(lead.route_interest)} · ${getContactDesiredTimingLabel(lead.desired_timing)}` `` |
| `components/dashboard/results-boardroom-visuals.tsx:145` | `` return row ? `${row.factor} — ${row.note}` : '' `` | `` return row ? `${row.factor}: ${row.note}` : '' `` |
| `components/dashboard/self-send-setup-panel.tsx:44` | `/* clipboard unavailable — no-op */` | `/* clipboard unavailable: no-op */` |
| `self-send-setup-panel.tsx:184` | `{/* Stap 0 — Scan context */}` | `{/* Stap 0: Scan context */}` |
| `self-send-setup-panel.tsx:195` | `{/* Stap 1 — Deelnemers */}` | `{/* Stap 1: Deelnemers */}` |
| `self-send-setup-panel.tsx:235` | `{/* Stap 2 — E-mailinstellingen */}` | `{/* Stap 2: E-mailinstellingen */}` |
| `self-send-setup-panel.tsx:324` | `{/* Stap 3 — Voorbeeld & kopieer */}` | `{/* Stap 3: Voorbeeld & kopieer */}` |
| `self-send-setup-panel.tsx:370` | `Deel per afdeling de eigen link — er is bewust geen algemene link.` | `Deel per afdeling de eigen link; er is bewust geen algemene link.` |
| `self-send-setup-panel.tsx:404` | `{/* Stap 4 — Bevestiging & lancering */}` | `{/* Stap 4: Bevestiging & lancering */}` |
| `self-send-setup-panel.tsx:431` | `{busy ? 'Bezig…' : 'Ik heb de uitnodiging verstuurd — zet live'}` | `{busy ? 'Bezig...' : 'Ik heb de uitnodiging verstuurd, zet live'}` |
| `app/(dashboard)/beheer/campagnes/page.tsx:195` | `{pct}% ({row.total_completed}/{row.total_invited ?? '—'})` | `{pct}% ({row.total_completed}/{row.total_invited ?? 'n.b.'})` |
| `beheer/campagnes/page.tsx:217` | `<span className="text-xs text-slate-300">—</span>` | `<span className="text-xs text-slate-300">n.b.</span>` |
| `app/(dashboard)/beheer/page.tsx:496` | `{org?.name ?? '—'}` | `{org?.name ?? 'n.b.'}` |
| `beheer/page.tsx:528` | `<span className="text-xs text-slate-300">—</span>` | `<span className="text-xs text-slate-300">n.b.</span>` |
| `app/(dashboard)/campaigns/[id]/actions.ts:30` | `* Data-toegang: bewaakt door RLS — alleen respondenten van eigen org zichtbaar.` | `* Data-toegang: bewaakt door RLS; alleen respondenten van eigen org zichtbaar.` |
| `campaigns/[id]/beheer/beheer-data.ts:838` | `// Afgeronde respondenten per afdeling — noemer voor de responsvoortgang per` | `// Afgeronde respondenten per afdeling, noemer voor de responsvoortgang per` |
| `campaigns/[id]/open-answers-view-model.ts:32` | `// beide lagen dezelfde PII-vormen dekken. Blijft best-effort — geen garantie tegen` | `// beide lagen dezelfde PII-vormen dekken. Blijft best-effort, geen garantie tegen` |
| `campaigns/[id]/page.tsx:52` | `// .single() returns PGRST116 when no row matches — that is a genuine 404, not a load failure.` | `// .single() returns PGRST116 when no row matches: that is a genuine 404, not a load failure.` |
| `campaigns/[id]/setup/page.tsx:59` | `// Al gelanceerd — wizard niet meer nodig` | `// Al gelanceerd: wizard niet meer nodig` |
| `campaigns/[id]/setup/segment-actions.ts:71` | `// wat de client beweert). Elke respondent-rij telt — ook niet-afgeronde:` | `// wat de client beweert). Elke respondent-rij telt, ook niet-afgeronde:` |
| `segment-actions.ts:100` | `// Campagne-totaal = som (spec §4) — bestaande weergaves blijven werken.` | `// Campagne-totaal = som (spec §4); bestaande weergaves blijven werken.` |
| `app/(dashboard)/dashboard/cockpit-index.ts:82` | `` responseValue: Number.isFinite(campaign.completion_rate_pct) ? `${campaign.completion_rate_pct}%` : '—', `` | `` responseValue: Number.isFinite(campaign.completion_rate_pct) ? `${campaign.completion_rate_pct}%` : 'n.b.', `` |
| `app/(dashboard)/dashboard/dashboard-actions.ts:226` | `//    sturen (Defect 2) — de operator-kopie telt hier niet mee.` | `//    sturen (Defect 2); de operator-kopie telt hier niet mee.` |

De regelnummers zijn die van main; Task 3, 4 en 5 hebben `campaigns/[id]/page.tsx` en `dashboard/page.tsx` al verschoven. Zoek op het "Was"-fragment.

Let op de bestaande tests die deze bestanden pinnen: `app/(dashboard)/beheer/new-campaign-form.guard.test.ts`, `components/dashboard/add-respondents-form.guard.test.ts`, `app/(dashboard)/dashboard/cockpit-index.test.ts`, `app/(dashboard)/dashboard/dashboard-actions.test.ts`. Geen daarvan pint een van de bovenstaande regels letterlijk (gecontroleerd op main met `grep`), maar draai ze mee in Step 3.

- [ ] **Step 3: Run de guard en de aangrenzende tests**

Run:
```bash
cd /c/Users/larsh/Desktop/Business/Verisight/.worktrees/klantsuite-2b/frontend
npx vitest run lib/dashboard/no-dashes.guard.test.ts components/dashboard/add-respondents-form.guard.test.ts "app/(dashboard)/dashboard/cockpit-index.test.ts" "app/(dashboard)/dashboard/dashboard-actions.test.ts" "app/(dashboard)/campaigns/[id]" 2>&1 | tail -6
npx tsc --noEmit 2>&1 | grep -c "error TS"
```
Expected: de guard groen; geen nieuwe falende tests in de aangrenzende bestanden (de bekende uit de baseline blijven gelijk); tsc `133`.

- [ ] **Step 4: Commit**

```bash
cd /c/Users/larsh/Desktop/Business/Verisight/.worktrees/klantsuite-2b
git add frontend/lib/dashboard/no-dashes.guard.test.ts frontend/components/dashboard/add-respondents-form.tsx frontend/components/dashboard/customer-launch-control.tsx frontend/components/dashboard/guided-self-serve-panel.tsx frontend/components/dashboard/preflight-checklist.tsx frontend/components/dashboard/results-boardroom-visuals.tsx frontend/components/dashboard/self-send-setup-panel.tsx "frontend/app/(dashboard)/beheer/campagnes/page.tsx" "frontend/app/(dashboard)/beheer/page.tsx" "frontend/app/(dashboard)/campaigns/[id]/actions.ts" "frontend/app/(dashboard)/campaigns/[id]/beheer/beheer-data.ts" "frontend/app/(dashboard)/campaigns/[id]/open-answers-view-model.ts" "frontend/app/(dashboard)/campaigns/[id]/page.tsx" "frontend/app/(dashboard)/campaigns/[id]/setup/page.tsx" "frontend/app/(dashboard)/campaigns/[id]/setup/segment-actions.ts" "frontend/app/(dashboard)/dashboard/cockpit-index.ts" "frontend/app/(dashboard)/dashboard/dashboard-actions.ts"
git commit -m "chore(copy): geen em- of en-dashes meer in de ingelogde omgeving, met grep-guard

33 regels in 16 bestanden (klantcopy, placeholders en commentaar); de guard
loopt components/dashboard, app/(dashboard) en app/(auth) af zodat het niet
terugkomt.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

### Task 11: Eindverificatie, herhaalde walkthrough op de testklant, `docs/testklant.md` en uitvoeringsverslag

**Files:**
- Modify: `docs/testklant.md` (checklist "Browsercheck na een klantzichtbare wijziging")
- Kopie naar de branch: `docs/superpowers/plans/2026-09-18-klantsuite-2b-overzicht-en-schil.md` (dit plan; untracked in de hoofdrepo)
- Create: `docs/superpowers/plans/2026-09-18-klantsuite-2b-uitvoering.md`

- [ ] **Step 1: Typecheck**

Run:
```bash
cd /c/Users/larsh/Desktop/Business/Verisight/.worktrees/klantsuite-2b/frontend
npx tsc --noEmit 2>&1 | grep -c "error TS"
```
Expected: exact de baseline uit Task 0 (`133`). Is het hoger, zoek de nieuwe fouten met `npx tsc --noEmit | grep "error TS"` en los ze op voordat je verdergaat.

- [ ] **Step 2: Frontend-faalset vergelijken, niet alleen tellen**

Run:
```bash
cd /c/Users/larsh/Desktop/Business/Verisight/.worktrees/klantsuite-2b/frontend
npx vitest run --reporter=json --outputFile=/c/Users/larsh/AppData/Local/Temp/loep-klantsuite-2b/vitest-na.json >/dev/null 2>&1
node -e "const r=require('/c/Users/larsh/AppData/Local/Temp/loep-klantsuite-2b/vitest-na.json');const f=[];for(const s of r.testResults)for(const t of s.assertionResults)if(t.status==='failed')f.push(s.name.replace(/\\\\/g,'/').split('/frontend/')[1]+' > '+t.fullName);console.log(f.sort().join('\n'))" > /c/Users/larsh/AppData/Local/Temp/loep-klantsuite-2b/na-fails.txt
diff /c/Users/larsh/AppData/Local/Temp/loep-klantsuite-2b/baseline-fails.txt /c/Users/larsh/AppData/Local/Temp/loep-klantsuite-2b/na-fails.txt
```
Expected: alleen regels met `<` (tests die op main faalden en nu slagen). Verwacht verdwenen: `app/(auth)/login/page.test.ts > auth release wording > keeps login and activation copy tied to dashboard and campaign release` (herschreven in Task 8). Geen enkele regel met `>`: elke `>`-regel is een nieuwe regressie en moet opgelost worden voordat deze taak af is. Verschijnt `app/(dashboard)/beheer/health/page.test.ts` als `>`, draai opnieuw (bekende wisselvalligheid) en vergelijk nogmaals.

- [ ] **Step 3: Backend-faalset vergelijken**

Run:
```bash
cd /c/Users/larsh/Desktop/Business/Verisight/.worktrees/klantsuite-2b
/c/Users/larsh/Desktop/Business/Verisight/.venv/Scripts/python.exe -m pytest tests -q -p no:cacheprovider 2>&1 | grep -E "^(FAILED|ERROR) " | sed -E 's/ - .*$//' | sort > /c/Users/larsh/AppData/Local/Temp/loep-klantsuite-2b/pytest-na.txt || true
diff /c/Users/larsh/AppData/Local/Temp/loep-klantsuite-2b/pytest-baseline.txt /c/Users/larsh/AppData/Local/Temp/loep-klantsuite-2b/pytest-na.txt && echo "faalset identiek"
```
Expected: `faalset identiek` (25 falend, dezelfde namen). De nieuwe tests uit Task 1 (18) tellen mee bij `passed`.

- [ ] **Step 4: Productiebuild**

Run (met de dummysleutel in de omgeving, nooit in een bestand):
```bash
cd /c/Users/larsh/Desktop/Business/Verisight/.worktrees/klantsuite-2b/frontend
RESEND_API_KEY=re_dummy_build_only npm run build > /c/Users/larsh/AppData/Local/Temp/loep-klantsuite-2b/build.log 2>&1; echo "exit=$?"
tail -25 /c/Users/larsh/AppData/Local/Temp/loep-klantsuite-2b/build.log
grep -n "/help" /c/Users/larsh/AppData/Local/Temp/loep-klantsuite-2b/build.log
```
Expected: `exit=0`, de routetabel in de log, en `/help` in die tabel. `exit=1` met `Missing API key` betekent dat de dummysleutel niet in de omgeving stond; ontbrekende Supabase-sleutels betekenen dat `.env.local` niet in de worktree staat (Task 0, Step 1).

- [ ] **Step 5: Testklant resetten en de walkthrough herhalen**

De testklant staat op productie; de nieuwe frontend niet. Draai de check tegen een lokale frontend die naar productie-Supabase wijst (`.env.local` uit Task 0) op poort 3100, ingelogd met een verse sessielink. De backend-afdwinging van de sluitdatum (Task 1) is met pytest gepind en is in de browser pas zichtbaar na de Railway-redeploy; de lokale frontend proxyt `/survey/...` naar het productie-backend, dus die bewust niet in deze check.

Run:
```bash
cd /c/Users/larsh/Desktop/Business/Verisight
.venv/Scripts/python.exe scripts/seed_test_tenant.py --dry-run
python scripts/seed_test_tenant.py --reset
python scripts/seed_test_tenant.py --login-link
cd .worktrees/klantsuite-2b/frontend
RESEND_API_KEY=re_dummy_build_only npm run dev -- --port 3100
```
Expected: dry-run en reset slagen ("11 tellingen van andere organisaties ongewijzigd"); de login-link print een URL naar `/complete-account?token_hash=...`; de dev-server luistert op `http://localhost:3100`. Open de login-link met de host vervangen door `localhost:3100`. (`--reset` en `--login-link` via de systeem-Python: de venv mist `httpx`.)

Doorloop de route van `docs/klantreis-walkthrough-2026-09-16.md` opnieuw, met dezelfde persona (Sanne, HR-manager, nooit eerder een Loep-dashboard gezien, niemand legt iets uit), desktop 1280 px én mobiel 375 px, console open. Noteer per stap zwaarte en soort zoals in die walkthrough. Noteer ook de dag na de seed-lancering (de seed lanceert B vier dagen vóór de reset; op dag 5 verschijnt de herinneringskaart).

1. **Activatie** (`/complete-account?token_hash=...`): Loep-ontwerp (chalk, navy knop, amber eyebrow), kop "Kies een wachtwoord", beide velden "Minimaal 8 tekens", rechts "Wat je hierna doet" met de drie stappen, geen "respondentimport" of "Begeleide inrichting". "Later, ga naar mijn overzicht" landt op `/dashboard`.
2. **Dashboard**: kop toont "TEST Loep Testklant" (niet "Hotmail"); sidebar toont Overzicht, Rapporten, Hulp en onder "Afgesloten" de naam van A met "Gesloten aug 2026"; de hoofdkaart is B, met de campagnenaam boven de kop en "6 van 30 ingevuld"; daaronder "Al je metingen" met B (Loopt, "Staat hierboven"), C (Nog in te richten) en A (Rapport beschikbaar), elk klikbaar; onderaan "Klaar voor een vervolgmeting?" met de knop "Nieuwe meting aanvragen" (mailto met onderwerp "Nieuwe meting aanvragen: TEST Loep Testklant"); footer noemt hallo@getloep.nl; geen "Rapporten"-knop in de kop.
3. **Campagne C via de lijst** → landingskaart "Je meting staat klaar." → wizard. Stap 1: toelichting bij Sluitdatum "Na deze datum kan niemand meer invullen. Drie weken is gebruikelijk; sluiten of verlengen (twee weken per keer) doe je hier in Loep." Vul vandaag en 30 in, opslaan. Stap 2: het bericht bevat "Invullen kan tot en met [start + 21 dagen]." na de link. "Terug naar stap 1", verander de sluitdatum, opslaan: de melding "De uitnodiging is opnieuw opgebouwd ..." verschijnt en de datum in het bericht is bijgewerkt. Lanceer niet (of lanceer en reset daarna; noteer wat je deed).
4. **375 px op de wizard**: de drie stappen staan onder elkaar, velden vullen de breedte, de knop "Opslaan en verder" is één regel, `document.documentElement.scrollWidth === 375`. Ook op `/dashboard`, `/campaigns/<B>`, `/reports` en `/help`: `scrollWidth === 375`.
5. **Campagne B**: "Campagne loopt" met de campagnenaam naast het scanlabel, tijdlijn, "Meting sluiten"; de sluitdatum staat één keer (in de tijdlijn). Link bovenaan heet "Alle metingen" en landt op `/dashboard`.
6. **Campagne A**: één rapportblok met "Rapport downloaden"; de statuskaart toont geen "Open rapport"-knop meer. Klik downloaden: werkt het (Railway op de nieuwe main), dan een PDF; anders een Nederlandse melding "Het rapport kon niet worden opgehaald (fout 500). Probeer het later opnieuw of mail hallo@getloep.nl." met daaronder "Technische melding: ...". Noteer welke van de twee.
7. **`/reports`**: A onder "Beschikbaar nu" met "18 van 30 ingevuld (60%)"; B en C onder "Nog niet beschikbaar" (open lijst, geen inklap) met "Loopt" en "Nog in te richten"; de kolomkoppen staan op desktop naast elkaar boven de rij; de namen zijn klikbaar en landen op de meting.
8. **`/help`**: drie stappen, de drempels 10 en 5 met de uitleg, "Wat jij doet" / "Wat Loep doet", contactblok met hallo@getloep.nl.
9. **Mobiel menu** (375 px, hamburger): Overzicht, Rapporten, Hulp, daaronder het accountblok met e-mail en "TEST Loep Testklant" en de knop "Uitloggen". Uitloggen landt op `/login`.
10. **Inlogpagina**: Loep-ontwerp, "Log in bij Loep", e-mail en wachtwoord, de contactregel; niets over managers of "v2.0". Open `/login?error=invite`: de melding over de verlopen activatielink staat boven het formulier.
11. **Console**: 0 errors op alle bezochte pagina's, behalve de bekende CSP-melding over `va.vercel-scripts.com/v1/script.debug.js`.

Tel na afloop: het aantal blokkerende en hinderlijke bevindingen. **De lat (spec par. 1): nul blokkerend, hoogstens vijf hinderlijk.** Haalt de walkthrough de lat niet, dan is dit plan niet af: los de bevindingen op (kleine fixes als extra commits op de branch; grotere als expliciete afwijking in het verslag met reden) en herhaal de betreffende stappen.

Sluit af met een reset zodat de testklant weer in de uitgangssituatie staat, en noteer dat een volgende check een verse login-link nodig heeft:
```bash
cd /c/Users/larsh/Desktop/Business/Verisight
python scripts/seed_test_tenant.py --reset
```

- [ ] **Step 6: `docs/testklant.md` bijwerken**

Vervang in de checklist "Browsercheck na een klantzichtbare wijziging" punt 2 t/m 5 door:

```markdown
2. `/dashboard` toont in de kop "TEST Loep Testklant" (niet het maildomein),
   campagne B als hoofdkaart met de campagnenaam en "6 van 30 ingevuld", de
   tijdlijn (start, herinnering, sluitdatum) en de knop "Meting sluiten". Tot
   vijf dagen na de seed-lancering heet de kaart "Campagne loopt" en staat er
   geen herinneringstekst; daarna "Vandaag: stuur de herinnering" met
   onderwerp en bericht apart kopieerbaar en "Geen herinnering versturen". B
   heeft na een reset geen sluitdatum ("Nog niet ingesteld"). Onder de kaart
   staat "Al je metingen" met B (Loopt), C (Nog in te richten) en A (Rapport
   beschikbaar), elk klikbaar, en daaronder "Klaar voor een vervolgmeting?"
   met een mailto naar hallo@getloep.nl.
3. `/campaigns/12b958fb-ce46-5efa-a947-d5b6e1e09126` toont "Je rapport is
   beschikbaar" en één knop "Rapport downloaden" (geen "Open rapport" die
   naar zichzelf linkt). De link bovenaan heet "Alle metingen".
4. `/reports` toont campagne A onder "Beschikbaar nu" met "18 van 30 ingevuld
   (60%)" en de andere twee onder "Nog niet beschikbaar" (open lijst) met
   "Loopt" en "Nog in te richten"; de namen linken naar de meting.
5. `/campaigns/d13634c5-115c-51ea-b337-e933dbf74f0f/setup` opent de wizard bij
   stap 1 met een lege startdatum, sluitdatum en herinnering (standaard 5
   dagen), een werkende survey-link en de toelichting bij "Aantal deelnemers".
   3 deelnemers wordt geweigerd met de melding over minimaal 10. De
   toelichting bij de sluitdatum belooft dat niemand daarna nog kan invullen
   (de backend dwingt dat af). Na opslaan eindigt de uitnodiging in stap 2 met
   "Invullen kan tot en met [sluitdatum]". Op 375 px staan de drie stappen
   onder elkaar en is `scrollWidth` 375.
```

en voeg na punt 7 toe:

```markdown
8. `/help` toont de drie stappen, de drempels (10 en 5) met de uitleg, en het
   contactblok met hallo@getloep.nl. "Hulp" staat in de sidebar en in het
   mobiele menu; dat menu toont ook het accountblok en "Uitloggen".
9. De activatiepagina (`--login-link`) en `/login` staan in het Loep-ontwerp:
   "Kies een wachtwoord" met de drie stappen ernaast, en "Log in bij Loep".
10. Na de Railway-redeploy: zet via `/beheer/campagnes` de sluitdatum van B
    op gisteren en open de survey-link van B; de statuspagina zegt "Deze
    meting is gesloten. Bedankt voor je interesse." Zet de datum daarna terug
    (of reset de testklant).
```

- [ ] **Step 7: Dit plan meenemen op de branch en het uitvoeringsverslag schrijven**

Run:
```bash
cd /c/Users/larsh/Desktop/Business/Verisight
cp docs/superpowers/plans/2026-09-18-klantsuite-2b-overzicht-en-schil.md .worktrees/klantsuite-2b/docs/superpowers/plans/
```

Maak in de worktree `docs/superpowers/plans/2026-09-18-klantsuite-2b-uitvoering.md` in dezelfde vorm als `docs/superpowers/plans/2026-09-16-klantsuite-2a-uitvoering.md`: kop met datum, branch en basis-commit; "Wat er nu werkt"; "Baselines" (tabel voor/na voor tsc, vitest falend en geslaagd, pytest falend en geslaagd, build; plus de letterlijke faalset-diffs); "Commits" per taak; "Afwijkingen van het plan" (genummerd, met reden); "Wat de reviews vonden" (per taak); "Browsercheck" met de dag na de seed-lancering en per stap de uitkomst; **"Walkthrough-score"**: de telling blokkerend/hinderlijk/cosmetisch tegenover 6/26/11 van 16 september, met per overgebleven bevinding het nummer uit de oude walkthrough of "nieuw"; "Bewust niet gedaan"; "Wat Lars moet weten" met minimaal: niets gemerged of gepusht; **Railway-redeploy nodig** (Task 1 raakt `backend/main.py`, `backend/models.py`, `backend/survey_window.py`, `requirements.txt` en `templates/survey-status.html`); géén DB-migratie; `tzdata` als nieuwe dependency; welke `<`-regels de faalset-diff toonde. Geen screenshots met inloggegevens.

Run:
```bash
cd /c/Users/larsh/Desktop/Business/Verisight/.worktrees/klantsuite-2b
git add docs/testklant.md docs/superpowers/plans/2026-09-18-klantsuite-2b-overzicht-en-schil.md docs/superpowers/plans/2026-09-18-klantsuite-2b-uitvoering.md
git commit -m "docs: plan en uitvoeringsverslag klantsuite 2b; testklant-checklist bijgewerkt

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

- [ ] **Step 8: Klaar voor review**

Run:
```bash
cd /c/Users/larsh/Desktop/Business/Verisight/.worktrees/klantsuite-2b
git log --oneline main..HEAD
git diff --stat main..HEAD
```
Expected: twaalf commits (Task 1 t/m 10 plus docs, plus eventuele fixcommits uit de reviews en de walkthrough), alleen bestanden uit het bestandsoverzicht en de sweep-tabel. Meld terug met de faalset-diffs (frontend en backend), het tsc-getal, de build-exitcode, de walkthrough-score en de afwijkingen; de merge naar main doet Lars (of een aparte afrondsessie met `superpowers:finishing-a-development-branch`), gevolgd door push en Railway-redeploy.

---

## Zelfreview van dit plan

**Spec-dekking (blok G par. 6, blok H par. 7, par. 8 t/m 10, amendement):**

| Spec | Taak |
|---|---|
| 6.1 alle metingen: nieuwste actieve als hoofdkaart, lijst "Al je metingen" met naam, scan, statuslabel (vijf labels) en link; "Alle metingen"-link op elke campagnepagina | Task 3 (labels), Task 4 |
| 6.2 `/reports` met noemer uit `campaign_delivery_records.invited_count` via één `in(campaign_id, ...)`; niet-gelanceerd heet niet "Meting loopt" | Task 3 |
| 6.3 "Nieuwe meting aanvragen": vast blok onderaan `/dashboard` en op de eindtoestand van 4.5, `mailto:hallo@getloep.nl` met onderwerp en voorgevulde tekst, adres uit `LOEP_CONTACT_EMAIL` | Task 5 |
| 6.4 `/help`: drie stappen, drempels 10 en 5 met waarom, wat de klant doet en wat Loep doet, één contactblok; "Hulp" in sidebar en mobiel menu; `/help` in `PROTECTED_APP_ROUTES` | Task 7 |
| 6.5 kop toont `organizations.name`; mobiel menu met "Uitloggen" en accountblok | Task 5 (lader), Task 6 |
| 7 wizard responsive (één kolom onder `lg`, controle op 375 px) | Task 9, Task 11 |
| 7 activatiepagina in Loep-ontwerp met self-service-copy, geen managed-jargon, gelijke placeholders | Task 8 |
| 7 dubbele rapportkaart: geen zelf-linkende knop op de campagnepagina | Task 4 |
| 7 validatiemeldingen in het Nederlands (wizard sinds 2a; download-, login- en activatiemeldingen hier) | Task 8, Task 9 |
| 7 em-dashes uit `components/dashboard/*` en `app/(dashboard)/*` met source-guard | Task 10 (guard dekt ook `app/(auth)`) |
| 7 onderwerpveld als eenregelig invoerveld | sinds 2a; gepind in Task 9 |
| 7 inlogpagina lichter ("Log in bij Loep", contactregel, niets over managers of v2.0) | Task 8 |
| 8 geen schemawijziging | overal; alleen `closes_at` op het ORM-model (kolom bestaat sinds migratie 2026_06_17) |
| 9 server actions `{ ok, error?, warning? }`, eigen dialogen, Nederlandse afwijzingen | ongewijzigd uit 2a; loaders in Task 3 en 5 falen luid of zichtbaar |
| 10 pure tests (`/reports`-noemer, statuslabels met pariteit, hoofdkaartkeuze, kop, mailto), source-guards (`/help` beschermd, geen em-dashes, activatie zonder managed-copy), baselines met faalset-diff, eindgate walkthrough | Task 0, 3-10, 11 |
| Amendement 4.3a: backend weigert na de sluitdag (Europe/Amsterdam) in vier endpoints via één helper; 410 op submit met dezelfde boodschap; verlengen opent de deur (test); uitnodiging en herinnering noemen de datum; dashboardcopy weer waar; Railway-redeploy | Task 1, Task 2, Task 11 |

**Dekking van de walkthrough (`docs/klantreis-walkthrough-2026-09-16.md`):**

| Bevinding | Waar |
|---|---|
| 0.1, 0.2, 0.3, 0.4 activatiepagina | Task 8 |
| 1.1 alleen de nieuwste meting zichtbaar; 3.15 dashboard bleef B tonen | Task 4 |
| 1.2 kaart noemt geen campagnenaam | Task 4 (resolver `campaignName`, drie kaarten) |
| 1.3 "Hotmail" in de kop | Task 6 |
| 1.4, 1.5, 1.6 herinnering overslaan, sluitdatum plannen, herinnering op dag één | plan 2a (gebouwd) |
| 1.7 sidebar "Afgesloten" met scanlabel en aanmaakmaand | Task 6 |
| 1.8 footer "Action Center" | Task 6 |
| 1.9 dubbele "Rapporten"-knop | Task 6 |
| 3.1 "Je eerste scan" | Task 4 |
| 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 3.8, 3.10, 3.11, 3.13, 3.14 wizard en tijdlijn | plan 2a (gebouwd) |
| 3.9 em-dashes in de wizard | Task 10 (guard; de wizard zelf was in 2a al schoon) |
| 3.12 onderwerpveld kapt af | plan 2a (input); gepind in Task 9 |
| 4.1, 4.2, 4.3, 4.4 sluiten/verlengen, tijdlijn op de herinneringskaart, apart kopiëren, overslaan | plan 2a (gebouwd) |
| 5.1 rapportdownload 500 (Railway) | **buiten 2b**: omgeving, geen code; Railway draait `4805e92d` en moet naar de nieuwe main. Task 11 stap 6 noteert de uitkomst; Task 9 maakt de melding Nederlands met contact (5.3) |
| 5.2 dubbele rapportkaart | Task 4 |
| 5.3 "Internal Server Error" in het Engels | Task 9 |
| 6.1 noemer "18 van 18" | Task 3 |
| 6.2 "Meting loopt" voor een niet-gelanceerde meting | Task 3 |
| 6.3 rijen niet klikbaar | Task 3 |
| 6.4 dichtgeklapte "Nog niet beschikbaar" | Task 3 |
| 6.5 gestapelde kolomkoppen | Task 3 (ongeldige grid-tracks met komma's) |
| 6.6 = 5.1 | zie 5.1 |
| 7.1 geen hulp of contact; blok "nieuwe meting" ontbreekt | Task 7, Task 5 |
| 7.2 mobiel menu zonder uitloggen | Task 6 |
| 7.3 inlogpagina zwaar | Task 8 |
| 8.1 wizard onbruikbaar op 375 px | Task 9 |

**Uit het 2a-verslag "Bewust niet gedaan":**

| Punt | Waar |
|---|---|
| 1 sluitdatum niet afgedwongen | Task 1 en 2 (amendement) |
| 2 lopende metingen zonder sluitdatum | besluit Lars 18-9: blijft "Nog niet ingesteld", geen knop; niet gebouwd |
| 9 `ReadOnlyStateCard` zonder mailknop; sluitdatum twee keer op de lopende kaart | Task 5 |
| 12 blok G en H | dit plan |
| 3 (self-send-config weigert 5-9 uitgenodigden), 4 (uitnodigingsdrempel 10 bij culture_assessment), 5 (rechtenmodel `member`), 6 (operator zonder lidmaatschap), 7 ("je organisatie" als stille terugval in de mailtemplates), 8 (UTC-"vandaag" in de frontend), 10 (`generating`-pad), 11 (alleen source-guards) | **buiten 2b**: geen van deze staat in blok G of H of in het amendement; 7 raakt de mails op vijf plekken en verdient een eigen kleine taak; 8 is bewust dezelfde UTC-dagdefinitie als de rest van de frontend (de backend-dagdefinitie uit Task 1 is Europe/Amsterdam; dat verschil is hoogstens twee uur rond middernacht en staat in het verslag als bekende grens) |

**Bewuste afwijkingen van de spec, met reden:**
1. De statuslabels op `/reports` zijn dezelfde vijf als op `/dashboard` (6.1); par. 6.2 noemde "Nog niet gestart" en "Meting loopt", maar twee vocabulaires op twee schermen was precies de klacht van walkthrough 6.1. "Gesloten zonder rapport" houdt op `/reports` de langere zin met aantal en drempel, want dat is de vraag die de klant daar heeft.
2. Het blok "nieuwe meting aanvragen" zegt "Mail Loep, dan zet Loep hem voor je klaar" in plaats van "en we zetten hem klaar" uit par. 6.3: de copyregel (Loep als onderwerp, nooit "wij") gaat voor. De prijs krijgt "excl. btw" erbij, zoals op `/producten`.
3. De toelichting bij de sluitdatum combineert de zin van Lars ("Sluiten of verlengen doe je hier in Loep") met de "drie weken"-hint uit spec par. 4.1, omdat die hint de klant een verstandige standaard geeft.
4. De grep-guard voor streepjes dekt ook `app/(auth)` en commentaarregels, niet alleen "UI-copy": één regel zonder uitzonderingen is te bewaken; een regel met uitzonderingen niet.
5. De organisatienaam in de mailto (6.3) komt op `/dashboard` mét meting uit de campagne-organisatie en zónder meting uit de accountorganisaties; zonder beide staat er zichtbaar "organisatie niet bekend" in het onderwerp, geen gok.
6. `dispatch_reminders` (backend) en het operatorpaneel `self-send-setup-panel.tsx` blijven op hun eigen `endDate` uit `self_send_config`; het amendement gaat over `campaigns.closes_at`. Twee bronnen mengen zou een tweede waarheid maken.
7. De pariteit tussen lijst en kaart is een aparte afgeleide met een tabeltest, niet `resolveDashboardState` per rij: de resolver vraagt per meting het verlengingsaantal, en een lijst die dat voor elke meting ophaalt alleen om een label te kiezen is onnodig, terwijl `extensionCount` de `kind` nooit verandert.

**Placeholder-scan:** geen "TBD", "TODO", "implement later", "similar to Task N"; elke codestap bevat de code; elke run-stap heeft een verwacht resultaat. De sweep in Task 10 geeft per regel de exacte voor- en na-tekst.

**Typeconsistentie, gecontroleerd tussen taken:**
- `is_survey_open(*, is_active: bool, closes_at: date | None, today: date | None = None) -> bool` (Task 1) wordt in `main.py` via `_campaign_is_open(campaign)` aangeroepen met `campaign.closes_at`, dat Task 1 als `Mapped[date | None]` op het model zet; `SURVEY_CLOSED_*` worden in `main.py` en beide testbestanden met dezelfde namen geïmporteerd.
- `TemplateArgs.closesAt?: string | null` (Task 2): de wizard geeft `closesAt: closesAt || null` (string state), `reminder-text.ts` geeft `input.closesAt` door uit `ReminderTextInput.closesAt: string | null`, en de twee pagina's leveren `campaign.closes_at ?? null` / `campaignMeta?.closes_at ?? null` (beide `string | null` uit `CampaignStats`/de `campaigns`-select).
- `resolveInvitedDenominator({ invitedCount, respondentRows }): InvitedDenominator` en `completionPct`/`formatResponseBasis` (Task 3) worden met dezelfde signatuur gebruikt in `campaign-status.ts`, `report-library.ts`, `dashboard/page.tsx` en `campaigns/[id]/page.tsx`.
- `CampaignStatusContext = { deliveryByCampaign: ReadonlyMap<string, CampaignDeliveryLite>; lastReminderEventAtByCampaign: ReadonlyMap<string, string>; today: string }` (Task 3) is wat `loadCampaignStatusContext` teruggeeft, wat `buildReportOverviewRows(campaigns, context)` en `buildCampaignListItems(campaigns, context, mainCampaignId)` verwachten, en wat de tests in Task 3 en 4 letterlijk opbouwen.
- `CampaignStatusKey` en `CAMPAIGN_STATUS_LABELS` (Task 3) worden gebruikt door `HrReportDownloadRow.statusKey?` (Task 3), `CampaignListItem.statusKey` en `STATUS_PILL` in de lijst-component (Task 4).
- `DashboardState.campaignName: string | null` (Task 4) wordt gezet in `EMPTY_STATE` en `base`; de drie kaarten lezen `state.campaignName`; `withoutSelfLink(state, currentPath)` spreidt de staat en behoudt het veld.
- `pickMainCampaign<T extends { is_active: boolean; created_at: string }>` (Task 4) krijgt `CampaignStats[]` en geeft `CampaignStats | null`; de pagina gebruikt daarna `campaign.campaign_id`, `campaign.closes_at`, `campaign.scan_type` zoals voorheen.
- `loadAccountOrganizations(supabase, userId): Promise<{ names: string[]; error: string | null }>` (Task 5) voedt `resolveAccountHeading({ names, error, isAdmin })` (Task 6) en `RequestNewMeasurement organizationName={account.names[0] ?? null}` (Task 5); `AccountHeading = { label: string; degraded: boolean }` is de prop `accountHeading` van `DashboardShellFrame` (Task 6).
- `DashboardShellCampaignRef` krijgt `campaign_name` en `closed_at` (Task 6); de layout selecteert exact die kolommen en vult `closed_at: campaign.closed_at ?? null`; `ClosedCampaignNavItem.name`/`closedLabel` worden in de shell gerenderd en in de test gepind.
- `DashboardModuleKey` krijgt `'help'` (Task 7); `DashboardCategoryModuleKey` en het Record in `getModuleKeyForScanType` sluiten `'help'` uit, anders eist TypeScript een `help`-scan.
- `HELP_STEPS`, `HELP_THRESHOLDS`, `HELP_ROLES`, `HELP_CONTACT` (Task 7) worden met dezelfde namen in de pagina en de test geïmporteerd; `EXTENSION_DAYS` en `MAX_EXTENSIONS` bestaan in `lib/dashboard/campaign-extension.ts` (regels 4-5).
- `PdfDownloadButton` houdt zijn props (`label?`, `align?`); alleen de interne `error`-state verandert van `string | null` naar `{ message; technical } | null` (Task 9), en de enige lezer is de eigen render.

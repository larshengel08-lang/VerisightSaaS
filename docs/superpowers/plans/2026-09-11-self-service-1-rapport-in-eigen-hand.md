# Self-service 1: rapport in eigen hand — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** De klant kan zelf het rapport downloaden (campagnedetail + `/reports`), krijgt bij sluiting de rapport-klaar-mail, ziet de juiste herinnerings- en uitnodigingstekst mét surveylink, en alleen de eigenaar (of de Loep-operator) ziet beheerknoppen.

**Architecture:** Alles zit in de Next.js-frontend (`frontend/`): één nieuwe pure vrijgaveregel `isReportReleaseReady` (10 ingevulde vragenlijsten, 30 voor culture_assessment) die beide dashboardpagina's, de rapportenpagina en de sluit-actie delen; één tekstbron `lib/self-send-comms.ts` voor uitnodiging en herinnering (wizard én dashboard); rolbepaling server-side per pagina (`canManage = isAdmin || role === 'owner'`) met een alleen-lezen kaart voor iedereen anders. Server actions geven `{ ok, error?, warning? }` terug; een mislukte mail na een gelukte sluiting is een zichtbare `warning` én auditmetadata, nooit stil. Geen schemawijziging, geen backend-wijziging (par. 4.6 van de spec is bewust buiten dit plan).

**Tech Stack:** Next.js (App Router, server components + server actions), TypeScript, Supabase (`@supabase/ssr`, RLS leidend), Resend via `lib/email.ts`, vitest (source-guard-tests met `readFileSync` en gemockte Supabase-client via `vi.mock('@/lib/supabase/server')`).

**Spec:** `docs/superpowers/specs/2026-09-11-self-service-onboarding-design.md`, blokken A (par. 4.1–4.5), B (par. 5), C (par. 6) en F (par. 9). Blokken D, E, G en par. 4.6 zitten NIET in dit plan.

**Copyregels (klantzichtbaar):** Nederlands, je/jij, Loep als onderwerp (nooit "ik"), geen em-dashes (`—`) of en-dashes (`–`) in nieuwe klantteksten, geen HR-jargon. Fail Loud: geen stille fallbacks.

**Regelnummers:** alle genoemde regelnummers verwijzen naar de stand op `main` van 11 september. Taken 1 tot en met 6 raken deels dezelfde bestanden, dus na de eerste wijziging schuiven ze op. Gebruik dan het geciteerde ankerfragment (de code die er nu staat), niet het nummer.

**Werkplek:** git worktree `C:\Users\larsh\Desktop\Business\Verisight\.worktrees\self-service-1` op branch `feature/self-service-1-rapport` (Task 0). Alle paden hieronder zijn relatief aan die worktree-root; alle `npx`-commando's draaien vanuit `frontend/` in de worktree.

**Baselines (main, 11 september):** `npx tsc --noEmit` = 133 fouten; `npx vitest run` = 65 falende tests. Vier van die 65 falen omdat de code nog niet doet wat de tests al verwachten en worden door dit plan groen: `app/(dashboard)/reports/page.test.ts` ("keeps the page focused on report download…"), `app/(dashboard)/reports/page.route-shell.test.ts` ("keeps report access tied to downloadable PDFs only"), en twee tests in `lib/dashboard/shell-navigation.test.ts` die het label `Rapporten` verwachten. Verder mogen er 0 nieuwe falende tests bijkomen (faalset per testnaam vergelijken, Task 7).

---

## Bestandsoverzicht

**Create**
- `frontend/lib/report-mail-recipients.ts` — pure ontvangerslijst (owners uit `org_invites` + `contact_email` + operator, ontdubbeld lowercase) en `getOperatorEmail()`.
- `frontend/lib/report-mail-recipients.test.ts`
- `frontend/lib/dashboard/reminder-text.ts` — één helper `buildReminderText` die per `comms_mode` de juiste herinneringstekst bouwt (self_send → `buildReminderTemplate` met link/afdelingslinks; managed → legacy preview).
- `frontend/lib/dashboard/reminder-text.test.ts`
- `frontend/lib/loep-contact.ts` — `LOEP_CONTACT_EMAIL` en `getOperatorEmail()`.
- `frontend/app/(dashboard)/campaigns/[id]/page.report-access.test.ts` — source-guard voor downloadknop en copy op campagnedetail.
- `frontend/app/(dashboard)/reports/page.self-service.test.ts` — source-guard: rapportenoverzicht zonder Calendly/mailto.
- `frontend/components/dashboard/read-only-state-card.tsx` — alleen-lezen kaart voor niet-eigenaren.
- `frontend/components/dashboard/read-only-state-card.test.ts`

**Modify**
- `frontend/lib/response-activation.ts` — `isReportReleaseReady` erbij.
- `frontend/lib/response-activation.test.ts`
- `frontend/lib/dashboard/dashboard-state-resolver.ts` — processing-drempel op 10, copy `sufficient_response`.
- `frontend/lib/dashboard/dashboard-state-resolver.test.ts`
- `frontend/app/(dashboard)/dashboard/page.tsx` — `isReportReleaseReady`, `buildReminderText`, `canManage`, `ReadOnlyStateCard`.
- `frontend/app/(dashboard)/dashboard/page.test.ts`
- `frontend/app/(dashboard)/campaigns/[id]/page.tsx` — downloadblok voor elke rol met `view_report`, Calendly weg, `buildReminderText`, `canManage`.
- `frontend/app/(dashboard)/campaigns/[id]/pdf-download-button.tsx` — dashboard-huisstijl, `label`/`align`-props.
- `frontend/app/(dashboard)/campaigns/[id]/pdf-download-button.test.ts`
- `frontend/app/(dashboard)/campaigns/[id]/setup/page.tsx` — redirect voor niet-eigenaren (sluit de directe URL naar de wizard).
- `frontend/app/(dashboard)/reports/page.tsx` — rapportenoverzicht.
- `frontend/lib/dashboard/report-library.ts` (+ bestaande `report-library.test.ts`) — `buildReportOverviewRows` erbij (`buildHrReportDownloadRows` blijft: nog gebruikt door `dashboard/cockpit-index.ts`).
- `frontend/lib/dashboard/shell-navigation.ts` — label "Bespreking" → "Rapporten" (2 plekken).
- `frontend/lib/dashboard/shell-navigation.test.ts`
- `frontend/lib/email-templates/rapport-gereed.ts` — Calendly weg, nieuwe copy.
- `frontend/lib/email-templates/rapport-gereed.test.ts`
- `frontend/app/(dashboard)/dashboard/dashboard-actions.ts` — `DashboardActionResult.warning`, `closeCampaignAction` met echte ontvangers, drempel, operator-kopie, auditmetadata.
- `frontend/app/(dashboard)/dashboard/dashboard-actions.test.ts`
- `frontend/components/dashboard/dashboard-state-actions.tsx` — toont `warning`.
- `frontend/components/dashboard/dashboard-state-actions.test.ts`
- `frontend/lib/campaign-setup.ts` — `SURVEY_DURATION_LABEL`.
- `frontend/lib/campaign-setup.test.ts`
- `frontend/lib/self-send-comms.ts` — `SCAN_WHY`, `scanType` in `TemplateArgs`, `departmentLinks` op de herinnering, invultijd uit `SURVEY_DURATION_LABEL`, em-/en-dashes weg.
- `frontend/lib/self-send-comms.test.ts`
- `frontend/components/dashboard/setup-wizard-card.tsx` — importeert `buildInviteTemplate`, eigen `buildInviteBody`/`SCAN_WHY` weg.
- `frontend/components/dashboard/setup-wizard-card.guard.test.ts`
- `frontend/components/dashboard/self-send-setup-panel.tsx` — geeft `scanType` door aan de templatebuilders (anders breekt tsc; admin-only paneel).

**Bewust niet aangeraakt:** `frontend/lib/email.ts` (stille `console.warn` zonder `RESEND_API_KEY` is bestaand gedrag, apart traject), `app/(dashboard)/reports/report-download-index.ts` (+ test; wordt na dit plan door niemand meer geïmporteerd, verify-before-delete is een los traject), `lib/customer-permissions.ts` (rechtenlogica blijft staan voor legacy leden, spec par. 9), `lib/campaign-audit.ts` (bestaande action keys volstaan; `metadata` is vrij), `lib/launch-controls.ts` (legacy managed-preview blijft ongewijzigd voor `comms_mode = 'managed'`).

---

### Task 0: Worktree, dependencies en baseline vastleggen

**Files:** geen codewijziging.

- [ ] **Step 1: Worktree aanmaken vanaf main**

Run (vanuit de hoofdrepo):
```bash
cd /c/Users/larsh/Desktop/Business/Verisight
git status --short | grep -v '^??' ; echo "---"
git worktree add .worktrees/self-service-1 -b feature/self-service-1-rapport main
git -C .worktrees/self-service-1 log --oneline -1
```
Expected: `git status` toont alleen `??`-regels (untracked docs), geen gewijzigde tracked bestanden; `git worktree add` meldt `Preparing worktree (new branch 'feature/self-service-1-rapport')`; de log-regel toont de huidige main-commit.

- [ ] **Step 2: Dependencies installeren in de worktree**

`npm ci` weigert door een bekende lockfile-mismatch; gebruik `npm install` en zet het lockfile daarna terug.

Run:
```bash
cd /c/Users/larsh/Desktop/Business/Verisight/.worktrees/self-service-1/frontend
npm install
git checkout -- package-lock.json
git status --short
```
Expected: `npm install` eindigt zonder `ERR!`; `git status --short` is leeg.

- [ ] **Step 3: Baselines vastleggen (tsc en faalset per testnaam)**

Run:
```bash
cd /c/Users/larsh/Desktop/Business/Verisight/.worktrees/self-service-1/frontend
mkdir -p /c/Users/larsh/AppData/Local/Temp/loep-self-service-1
npx tsc --noEmit 2>&1 | grep -c "error TS"
npx vitest run --reporter=json --outputFile=/c/Users/larsh/AppData/Local/Temp/loep-self-service-1/vitest-baseline.json >/dev/null 2>&1
node -e "const r=require('/c/Users/larsh/AppData/Local/Temp/loep-self-service-1/vitest-baseline.json');const f=[];for(const s of r.testResults)for(const t of s.assertionResults)if(t.status==='failed')f.push(s.name.replace(/\\\\/g,'/').split('/frontend/')[1]+' > '+t.fullName);console.log(f.sort().join('\n'))" > /c/Users/larsh/AppData/Local/Temp/loep-self-service-1/baseline-fails.txt
wc -l < /c/Users/larsh/AppData/Local/Temp/loep-self-service-1/baseline-fails.txt
```
Expected: `133` (tsc) en `65` (falende tests). Wijkt een getal af, dan is dat de nieuwe baseline voor Task 7; noteer het.

---

### Task 1: Vrijgaveregel `isReportReleaseReady` + gebruik in resolver en beide dashboardpagina's

**Files:**
- Modify: `frontend/lib/response-activation.ts:56-64` (na `isDashboardReleaseReady`)
- Modify: `frontend/lib/dashboard/dashboard-state-resolver.ts:44-45, 140-153, 228-245`
- Modify: `frontend/app/(dashboard)/dashboard/page.tsx:8, 106-109`
- Modify: `frontend/app/(dashboard)/campaigns/[id]/page.tsx:10, 95-101`
- Test: `frontend/lib/response-activation.test.ts`
- Test: `frontend/lib/dashboard/dashboard-state-resolver.test.ts:74-85, 110-121`
- Test: `frontend/app/(dashboard)/dashboard/page.test.ts:17-20`

- [ ] **Step 1: Falende test voor `isReportReleaseReady`**

Voeg toe aan `frontend/lib/response-activation.test.ts`: breid de import uit en zet onderaan een nieuw `describe`-blok.

```ts
import {
  CULTURE_ASSESSMENT_DASHBOARD_THRESHOLD,
  CULTURE_ASSESSMENT_INSIGHT_THRESHOLD,
  FIRST_DASHBOARD_THRESHOLD,
  FIRST_INSIGHT_THRESHOLD,
  buildResponseActivationState,
  isReportReleaseReady,
} from '@/lib/response-activation'
```

```ts
describe('isReportReleaseReady (spec 2026-09-11 par. 4.1)', () => {
  it('geeft het rapport pas vrij vanaf FIRST_INSIGHT_THRESHOLD ingevulde vragenlijsten', () => {
    expect(isReportReleaseReady(FIRST_INSIGHT_THRESHOLD - 1)).toBe(false)
    expect(isReportReleaseReady(FIRST_INSIGHT_THRESHOLD)).toBe(true)
    expect(isReportReleaseReady(FIRST_INSIGHT_THRESHOLD, { scanType: 'exit' })).toBe(true)
    expect(isReportReleaseReady(FIRST_INSIGHT_THRESHOLD, { scanType: 'retention' })).toBe(true)
    expect(isReportReleaseReady(FIRST_INSIGHT_THRESHOLD, { scanType: 'onboarding' })).toBe(true)
  })

  it('ligt boven de dashboarddrempel van 5: 5 t/m 9 is nog geen rapport', () => {
    expect(isReportReleaseReady(FIRST_DASHBOARD_THRESHOLD)).toBe(false)
    expect(isReportReleaseReady(9)).toBe(false)
  })

  it('houdt voor culture_assessment de bestaande 30-grens', () => {
    expect(isReportReleaseReady(CULTURE_ASSESSMENT_INSIGHT_THRESHOLD - 1, { scanType: 'culture_assessment' })).toBe(false)
    expect(isReportReleaseReady(CULTURE_ASSESSMENT_INSIGHT_THRESHOLD, { scanType: 'culture_assessment' })).toBe(true)
  })

  it('behandelt ongeldige invoer als nul', () => {
    expect(isReportReleaseReady(Number.NaN)).toBe(false)
    expect(isReportReleaseReady(-3)).toBe(false)
  })
})
```

- [ ] **Step 2: Run, verwacht falen**

Run: `npx vitest run lib/response-activation.test.ts`
Expected: FAIL met `isReportReleaseReady is not a function` (of een TypeScript-importfout op die naam).

- [ ] **Step 3: Implementatie in `response-activation.ts`**

Voeg direct ná `isDashboardReleaseReady` (regel 64) toe:

```ts
export interface ReportReleaseOptions {
  scanType?: ScanType
}

/**
 * Vrijgaveregel voor het rapport (spec 2026-09-11 par. 4.1): het rapport is er
 * pas vanaf FIRST_INSIGHT_THRESHOLD (10) ingevulde vragenlijsten; voor
 * culture_assessment blijft de 30-grens uit getResponseActivationThresholds
 * gelden. Of de campagne gesloten is, beslist de aanroeper (de resolver kijkt
 * eerst naar isActive). De dashboarddrempel van 5 (isDashboardReleaseReady)
 * blijft alleen bestaan als ondergrens voor het tonen van voortgang.
 */
export function isReportReleaseReady(totalCompleted: number, options: ReportReleaseOptions = {}) {
  const completed = Number.isFinite(totalCompleted) ? Math.max(0, Math.floor(totalCompleted)) : 0
  const thresholds = getResponseActivationThresholds(options.scanType)
  return completed >= thresholds.insightMin
}
```

- [ ] **Step 4: Run, verwacht groen**

Run: `npx vitest run lib/response-activation.test.ts`
Expected: PASS (alle tests in het bestand, inclusief de 4 nieuwe).

- [ ] **Step 5: Falende resolvertests (copy + processing-drempel)**

In `frontend/lib/dashboard/dashboard-state-resolver.test.ts` vervang je de test `'State 3 — sufficient response prompts close when min is reached'` (regel 74-85) door:

```ts
  it('State 3 — sufficient response: rapportdrempel gehaald, sluiten mag maar hoeft niet', () => {
    const state = resolveDashboardState(
      baseInput({
        campaign: { ...baseInput().campaign!, totalCompleted: 12, completionRatePct: 60 },
        reportReady: true,
        today: '2026-06-03',
      }),
    )
    expect(state.kind).toBe('action')
    expect(state.actionVariant).toBe('sufficient_response')
    expect(state.primaryMessage).toBe('Voldoende respons voor een rapport')
    expect(state.subtext).toContain('Je kunt de campagne sluiten of nog even open laten.')
    expect(state.subtext).toContain('12 van 20 ingevuld (60%)')
    expect(state.primaryMessage).not.toMatch(/[—–]/)
    expect(state.ctaLabel).toBe('Campagne sluiten')
  })
```

En voeg direct ná de test `'State 3b — processing/insufficient when closed below display threshold'` toe:

```ts
  it('State 3b — gesloten met 5 t/m 9 antwoorden is insufficient, niet generating (besluit 1, spec 2026-09-11)', () => {
    const state = resolveDashboardState(
      baseInput({
        campaign: { ...baseInput().campaign!, isActive: false, totalCompleted: 7, closedAt: '2026-06-10T09:00:00Z' },
        reportReady: false,
      }),
    )
    expect(state.kind).toBe('processing')
    expect(state.processingVariant).toBe('insufficient_response')
    expect(state.subtext).toContain('7 ingevulde reacties')
  })
```

- [ ] **Step 6: Run, verwacht falen**

Run: `npx vitest run lib/dashboard/dashboard-state-resolver.test.ts`
Expected: FAIL op de twee bovenstaande tests (`'Voldoende respons — sluit de campagne'` ≠ `'Voldoende respons voor een rapport'`; `'generating'` ≠ `'insufficient_response'`). NB: de test `'State 0 — no campaign'` faalt al op main (verwacht "voor u klaar", code zegt "voor je klaar") — dat is pre-existent en blijft zo.

- [ ] **Step 7: Resolver aanpassen**

In `frontend/lib/dashboard/dashboard-state-resolver.ts`:

(a) Regel 44-45, doc op `reportReady`:
```ts
  /** isReportReleaseReady(total_completed, { scanType }) — 10 ingevuld (30 bij culture_assessment). */
  reportReady: boolean
```

(b) Regel 140 (processing-tak): de "generating"-tak bestaat alleen als er genoeg is voor een rapport; alles onder de rapportdrempel is eerlijk `insufficient_response` (besluit 1: onder de tien geen rapport).
```ts
    const enough = campaign.totalCompleted >= thresholds.insightMin
```

(c) Regel 228-245 (sufficient_response-tak) wordt:
```ts
  // Priority 4b (within State 3) — rapportdrempel gehaald (indicator, sluiten optioneel)
  if (input.reportReady) {
    return {
      ...EMPTY_STATE,
      kind: 'action',
      actionVariant: 'sufficient_response',
      campaignId: campaign.id,
      primaryMessage: 'Voldoende respons voor een rapport',
      subtext: `Je kunt de campagne sluiten of nog even open laten. ${campaign.totalCompleted} van ${campaign.totalInvited} ingevuld (${progressPct}%) · ${close.label}`,
      tone: 'attention',
      ctaLabel: 'Campagne sluiten',
      ctaKind: 'close_campaign',
      showProgress: true,
      progressPct,
      closeDateLabel: close.label,
      degraded: close.degraded,
    }
  }
```

De `expired`-tak (regel 174-200) blijft ongewijzigd: die wordt in blok D (tweede plan) herschreven.

- [ ] **Step 8: Run, verwacht groen (op de pre-existente State 0-fail na)**

Run: `npx vitest run lib/dashboard/dashboard-state-resolver.test.ts`
Expected: alleen `'State 0 — no campaign'` faalt (pre-existent); alle andere tests PASS, inclusief de twee nieuwe/gewijzigde.

- [ ] **Step 9: Paginatest in lockstep**

In `frontend/app/(dashboard)/dashboard/page.test.ts` vervang je regel 17-20 door:

```ts
  it('selects the most recent campaign and derives report readiness from the report release rule', () => {
    expect(source).toContain("order('created_at', { ascending: false })")
    expect(source).toContain('isReportReleaseReady')
    expect(source).not.toContain('isDashboardReleaseReady')
  })
```

Run: `npx vitest run "app/(dashboard)/dashboard/page.test.ts"`
Expected: FAIL (`isReportReleaseReady` ontbreekt nog in de pagina).

- [ ] **Step 10: Beide pagina's op `isReportReleaseReady`**

`frontend/app/(dashboard)/dashboard/page.tsx`, regel 8:
```ts
import { isReportReleaseReady } from '@/lib/response-activation'
```
en regel 106-109:
```ts
  // Rapportvrijgave (spec 2026-09-11 par. 4.1): 10 ingevulde vragenlijsten
  // (30 bij culture_assessment). Of de campagne gesloten is, beslist de resolver.
  const reportReady = isReportReleaseReady(campaign.total_completed, {
    scanType: campaign.scan_type,
  })
```

`frontend/app/(dashboard)/campaigns/[id]/page.tsx`, regel 10:
```ts
import { isReportReleaseReady } from '@/lib/response-activation'
```
en regel 95-101 (inclusief de oude comment) wordt:
```ts
  // Rapportvrijgave (spec 2026-09-11 par. 4.1): 10 ingevulde vragenlijsten
  // (30 bij culture_assessment). Of de campagne gesloten is, beslist de resolver;
  // daardoor vuurt "Voldoende respons voor een rapport" ook voor culture_assessment.
  const reportReady = isReportReleaseReady(stats.total_completed, {
    scanType: stats.scan_type,
  })
```

- [ ] **Step 11: Run pagina-guards en tsc**

Run:
```bash
npx vitest run "app/(dashboard)/dashboard/page.test.ts" "app/(dashboard)/campaigns/[id]/page.standalone.test.ts"
npx tsc --noEmit 2>&1 | grep -c "error TS"
```
Expected: beide testbestanden PASS; tsc-telling gelijk aan de baseline (133).

- [ ] **Step 12: Commit**

```bash
cd /c/Users/larsh/Desktop/Business/Verisight/.worktrees/self-service-1
git add frontend/lib/response-activation.ts frontend/lib/response-activation.test.ts frontend/lib/dashboard/dashboard-state-resolver.ts frontend/lib/dashboard/dashboard-state-resolver.test.ts "frontend/app/(dashboard)/dashboard/page.tsx" "frontend/app/(dashboard)/dashboard/page.test.ts" "frontend/app/(dashboard)/campaigns/[id]/page.tsx"
git commit -m "feat(dashboard): rapportvrijgave vanaf 10 ingevulde vragenlijsten (isReportReleaseReady)

- nieuwe pure regel isReportReleaseReady naast isDashboardReleaseReady
- beide dashboardpagina's leiden reportReady hieruit af
- resolver: sufficient_response-copy zonder em-dash; gesloten met 5-9 is
  eerlijk insufficient_response i.p.v. een belofte van een rapport

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

### Task 2: Alleen de eigenaar beheert de meting (`canManage` + alleen-lezen kaart)

Spec par. 9. Vandaag ziet elk org-lid (ook een meelezende viewer) de WelcomeGate, de wizard en de knoppen "Kopieer herinneringstekst" en "Campagne sluiten"; pas bij het indrukken volgt "Niet gemachtigd". Deze taak zet de gate server-side.

**Files:**
- Create: `frontend/components/dashboard/read-only-state-card.tsx`
- Create: `frontend/components/dashboard/read-only-state-card.test.ts`
- Modify: `frontend/app/(dashboard)/dashboard/page.tsx:53-82, 139-163`
- Modify: `frontend/app/(dashboard)/campaigns/[id]/page.tsx:55-80, 151-173`
- Modify: `frontend/app/(dashboard)/campaigns/[id]/setup/page.tsx:34`
- Test: `frontend/app/(dashboard)/dashboard/page.test.ts`

- [ ] **Step 1: Falende test voor de alleen-lezen kaart**

Maak `frontend/components/dashboard/read-only-state-card.test.ts`:

```ts
import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

const source = readFileSync(new URL('./read-only-state-card.tsx', import.meta.url), 'utf8')

describe('alleen-lezen statuskaart (spec 2026-09-11 par. 9)', () => {
  it('toont status en voortgang uit dezelfde resolverstaat', () => {
    expect(source).toContain('state.primaryMessage')
    expect(source).toContain('state.subtext')
    expect(source).toContain('state.showProgress')
  })

  it('legt uit waarom er geen knoppen staan', () => {
    expect(source).toContain('Alleen de eigenaar van deze Loep-omgeving kan de meting beheren.')
  })

  it('bevat geen enkele actie', () => {
    expect(source).not.toContain('DashboardStateActions')
    expect(source).not.toContain('<button')
    expect(source).not.toContain('ctaLabel')
    expect(source).not.toContain('secondaryActions')
  })
})
```

- [ ] **Step 2: Run, verwacht falen**

Run: `npx vitest run components/dashboard/read-only-state-card.test.ts`
Expected: FAIL met `ENOENT` op `read-only-state-card.tsx`.

- [ ] **Step 3: Component schrijven**

Maak `frontend/components/dashboard/read-only-state-card.tsx`:

```tsx
import type { DashboardState } from '@/lib/dashboard/dashboard-state-resolver'

/**
 * Statusweergave voor iedereen die de meting niet beheert (spec 2026-09-11
 * par. 9): dezelfde resolverstaat als DashboardStateCard, maar zonder knoppen.
 * De server actions zouden die acties voor deze rol toch weigeren; knoppen
 * tonen en pas bij het indrukken weigeren is de valkuil die dit sluit.
 */
export function ReadOnlyStateCard({ state }: { state: DashboardState }) {
  const progressPct = Math.min(100, Math.max(0, state.progressPct))

  return (
    <section className="rounded-[22px] border border-[color:var(--dashboard-frame-border)] bg-white px-6 py-7">
      <h1 className="font-serif text-[2rem] leading-[1.05] tracking-[-0.04em] text-[color:var(--dashboard-ink)] sm:text-[2.4rem]">
        {state.primaryMessage}
      </h1>
      <p className="mt-3 max-w-2xl text-[0.98rem] leading-7 text-[color:var(--dashboard-text)]">
        {state.subtext}
      </p>

      {state.showProgress ? (
        <div className="mt-6 max-w-md">
          <div
            className="h-2 w-full overflow-hidden rounded-full bg-[color:var(--dashboard-soft)]"
            role="progressbar"
            aria-valuenow={progressPct}
            aria-valuemin={0}
            aria-valuemax={100}
          >
            <div
              className="h-full rounded-full bg-[color:var(--dashboard-accent-strong)]"
              style={{ width: `${progressPct}%` }}
            />
          </div>
          <p className="mt-2 text-xs font-semibold uppercase tracking-[0.16em] text-[color:var(--dashboard-muted)]">
            {state.progressPct}% ingevuld
          </p>
        </div>
      ) : null}

      <p className="mt-6 text-sm text-[color:var(--dashboard-muted)]">
        Alleen de eigenaar van deze Loep-omgeving kan de meting beheren.
      </p>
    </section>
  )
}
```

- [ ] **Step 4: Run, verwacht groen**

Run: `npx vitest run components/dashboard/read-only-state-card.test.ts`
Expected: PASS (3 tests).

- [ ] **Step 5: Falende paginatest voor de rolgate**

Voeg onderaan `frontend/app/(dashboard)/dashboard/page.test.ts` toe, binnen het bestaande `describe`:

```ts
  it('laat alleen de eigenaar en de operator de meting beheren', () => {
    expect(source).toContain("supabase.from('profiles')")
    expect(source).toContain("from('org_members')")
    expect(source).toContain('const canManage =')
    expect(source).toContain("membership?.role === 'owner'")
    expect(source).toContain('ReadOnlyStateCard')
  })
```

Run: `npx vitest run "app/(dashboard)/dashboard/page.test.ts"`
Expected: FAIL op de nieuwe test (`canManage` bestaat nog niet).

- [ ] **Step 6: `canManage` in `dashboard/page.tsx`**

Voeg onder de bestaande import van `DashboardStateCard` (regel 3) toe:

```ts
import { ReadOnlyStateCard } from '@/components/dashboard/read-only-state-card'
```

Vervang de destructuring van de `Promise.all` (regel 53) door zeven posities:

```ts
  const [
    { data: deliveryRecord },
    { data: reminderEvents },
    { data: campaignRow },
    { data: orgData },
    { data: respondentDepts },
    { data: profile },
    { data: membership },
  ] = await Promise.all([
```

Voeg in diezelfde `Promise.all` ná de `respondents`-query (regel 77-81) twee queries toe, en zet direct onder de sluitende `])` de rolbepaling:

```ts
    supabase.from('profiles').select('is_verisight_admin').eq('id', user.id).maybeSingle(),
    supabase
      .from('org_members')
      .select('role')
      .eq('org_id', campaign.organization_id)
      .eq('user_id', user.id)
      .maybeSingle(),
  ])

  // Beheer is voorbehouden aan de eigenaar van de klantomgeving en aan de
  // Loep-operator (spec 2026-09-11 par. 9). Andere leden lezen alleen mee:
  // hun schrijfacties worden server-side toch geweigerd, dus knoppen tonen
  // die altijd falen is misleidend.
  const canManage = profile?.is_verisight_admin === true || membership?.role === 'owner'
```

Vervang het render-blok (regel 139-163) door:

```tsx
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
```

- [ ] **Step 7: `canManage` in `campaigns/[id]/page.tsx`**

Voeg onder de import van `DashboardStateCard` (regel 3) toe:

```ts
import { ReadOnlyStateCard } from '@/components/dashboard/read-only-state-card'
```

Breid de `Promise.all` (regel 55-73) uit met een zevende query, direct ná de `respondents`-query:

```ts
    supabase
      .from('org_members')
      .select('role')
      .eq('org_id', stats.organization_id ?? '')
      .eq('user_id', user.id)
      .maybeSingle(),
```

en pas de destructuring (regel 55) aan naar:

```ts
  const [{ data: campaignMeta }, { data: deliveryRecord }, { data: reminderEvents }, { data: profile }, { data: orgData }, { data: respondentDepts }, { data: membership }] = await Promise.all([
```

Vervang regel 80 (`const isAdmin = profile?.is_verisight_admin === true`) door:

```ts
  const isAdmin = profile?.is_verisight_admin === true
  // Beheer is voorbehouden aan de eigenaar en aan de Loep-operator
  // (spec 2026-09-11 par. 9); meelezende leden zien de status zonder knoppen.
  const canManage = isAdmin || membership?.role === 'owner'
```

Vervang het render-blok (regel 151-173) door:

```tsx
      {!canManage ? (
        <ReadOnlyStateCard state={state} />
      ) : state.kind === 'setup' ? (
        <WelcomeGate
          campaignId={id}
          scanType={stats.scan_type}
          organizationName={orgData?.name ?? 'je organisatie'}
          publicSurveyToken={(campaignMeta as Record<string, unknown>)?.public_survey_token as string ?? ''}
          frontendBaseUrl={process.env.NEXT_PUBLIC_FRONTEND_URL ?? 'https://getloep.nl'}
          initialLaunchDate={deliveryRecord?.launch_date ?? null}
          initialInvitedCount={deliveryRecord?.invited_count ?? null}
          segmentDepartments={(campaignMeta as Record<string, unknown>)?.segment_departments as
            | { label: string; slug: string; invited_count?: number }[]
            | null}
          departmentResponseCounts={departmentResponseCounts}
        />
      ) : state.kind === 'running' ? (
        <RunningStateCard
          state={state}
          reminderText={reminderText}
          scanLabel={SCAN_TYPE_LABELS[stats.scan_type] ?? stats.scan_type}
        />
      ) : (
        <DashboardStateCard state={state} reminderText={reminderText} />
      )}
```

Het rapportblok eronder (`state.kind === 'report_ready'`) blijft bewust buiten deze gate: meelezen mag, en Task 3 geeft de download aan iedereen met leesrecht.

- [ ] **Step 8: Directe wizard-URL sluiten**

In `frontend/app/(dashboard)/campaigns/[id]/setup/page.tsx`, direct ná `if (!campaign) notFound()` (regel 34):

```ts
  // Dezelfde gate als op het dashboard (spec 2026-09-11 par. 9): zonder deze
  // check opent een meelezend lid de wizard via de directe URL en krijgt pas
  // bij opslaan een weigering.
  const [{ data: profile }, { data: membership }] = await Promise.all([
    supabase.from('profiles').select('is_verisight_admin').eq('id', user.id).maybeSingle(),
    supabase
      .from('org_members')
      .select('role')
      .eq('org_id', (campaign as Record<string, unknown>).organization_id as string)
      .eq('user_id', user.id)
      .maybeSingle(),
  ])
  if (profile?.is_verisight_admin !== true && membership?.role !== 'owner') {
    redirect(`/campaigns/${id}`)
  }
```

- [ ] **Step 9: Run tests en tsc**

Run:
```bash
npx vitest run "app/(dashboard)/dashboard/page.test.ts" "app/(dashboard)/campaigns/[id]/page.standalone.test.ts" "app/(dashboard)/campaigns/[id]/setup/page.test.ts" components/dashboard/read-only-state-card.test.ts
npx tsc --noEmit 2>&1 | grep -c "error TS"
```
Expected: alle vier PASS; tsc gelijk aan de baseline uit Task 0.

- [ ] **Step 10: Commit**

```bash
cd /c/Users/larsh/Desktop/Business/Verisight/.worktrees/self-service-1
git add "frontend/app/(dashboard)/dashboard/page.tsx" "frontend/app/(dashboard)/dashboard/page.test.ts" "frontend/app/(dashboard)/campaigns/[id]/page.tsx" "frontend/app/(dashboard)/campaigns/[id]/setup/page.tsx" frontend/components/dashboard/read-only-state-card.tsx frontend/components/dashboard/read-only-state-card.test.ts
git commit -m "feat(dashboard): alleen de eigenaar beheert de meting

- canManage (operator of owner) server-side op dashboard, campagnedetail
  en de directe wizard-URL
- meelezende leden krijgen ReadOnlyStateCard: status zonder knoppen die
  toch geweigerd zouden worden

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

### Task 3: Rapport in eigen hand op het campagnedetail

Spec par. 4.2. Vandaag ziet de klant "Je rapport is in voorbereiding. Loep neemt contact met je op" terwijl de API de download al toestaat voor elke rol met `view_report`.

**Files:**
- Modify: `frontend/app/(dashboard)/campaigns/[id]/page.tsx:174-209`
- Modify: `frontend/app/(dashboard)/campaigns/[id]/pdf-download-button.tsx:6-11, 17-22, 72-94`
- Create: `frontend/app/(dashboard)/campaigns/[id]/page.report-access.test.ts`
- Test: `frontend/app/(dashboard)/campaigns/[id]/pdf-download-button.test.ts`

- [ ] **Step 1: Falende tests**

Maak `frontend/app/(dashboard)/campaigns/[id]/page.report-access.test.ts`:

```ts
import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

const source = readFileSync(new URL('./page.tsx', import.meta.url), 'utf8')
const reportBlock = source.slice(source.indexOf("state.kind === 'report_ready'"))

describe('campagnedetail: rapport in eigen hand (spec 2026-09-11 par. 4.2)', () => {
  it('toont de downloadknop zonder adminvoorwaarde', () => {
    expect(reportBlock).toContain('PdfDownloadButton')
    expect(reportBlock).not.toContain('isAdmin')
  })

  it('belooft geen contact door Loep meer', () => {
    expect(source).not.toContain('Loep neemt contact met je op')
    expect(source).toContain('Je rapport staat klaar')
    expect(source).toContain('Het antwoord staat op pagina twee.')
  })

  it('plant geen bespreking meer vanaf het campagnedetail', () => {
    expect(source).not.toContain('NEXT_PUBLIC_CALENDLY_URL')
    expect(source).not.toContain('managementbespreking')
  })
})
```

Voeg toe aan `frontend/app/(dashboard)/campaigns/[id]/pdf-download-button.test.ts`, binnen het bestaande `describe`:

```ts
  it('gebruikt de dashboard-huisstijl in plaats van een losse blauwe knop', () => {
    const source = readFileSync(new URL('./pdf-download-button.tsx', import.meta.url), 'utf8')

    expect(source).toContain('bg-[color:var(--dashboard-ink)]')
    expect(source).not.toContain('bg-blue-600')
    expect(source).not.toContain('hover:bg-blue-700')
  })

  it('laat label en uitlijning van buiten bepalen', () => {
    const source = readFileSync(new URL('./pdf-download-button.tsx', import.meta.url), 'utf8')

    expect(source).toContain('label?: string')
    expect(source).toContain("align?: 'start' | 'end'")
  })
```

- [ ] **Step 2: Run, verwacht falen**

Run: `npx vitest run "app/(dashboard)/campaigns/[id]/page.report-access.test.ts" "app/(dashboard)/campaigns/[id]/pdf-download-button.test.ts"`
Expected: FAIL op alle vijf nieuwe tests.

- [ ] **Step 3: Rapportblok herschrijven**

Vervang in `frontend/app/(dashboard)/campaigns/[id]/page.tsx` het hele blok vanaf `{state.kind === 'report_ready' ? (` tot en met de bijbehorende afsluitende `) : null}` (regel 174-209, inclusief het Calendly-blok) door:

```tsx
      {state.kind === 'report_ready' ? (
        <div className="rounded-[22px] border border-[color:var(--dashboard-frame-border)] bg-white px-6 py-6">
          <p className="mb-1 text-sm font-semibold text-[color:var(--dashboard-ink)]">
            Je rapport staat klaar
          </p>
          <p className="mb-5 max-w-2xl text-sm leading-6 text-[color:var(--dashboard-text)]">
            Het antwoord staat op pagina twee. De gespreksagenda achterin is de leidraad voor het
            gesprek met je managementteam.
          </p>
          <PdfDownloadButton
            campaignId={stats.campaign_id}
            campaignName={stats.campaign_name}
            scanType={stats.scan_type}
          />
        </div>
      ) : null}
```

Het Calendly-blok verdwijnt hiermee ook voor de operator. Dat is bewust: de bespreking is geen productbelofte meer (strategisch besluit 2026-09-11) en dezelfde knop verdwijnt in Task 4 van `/reports`.

- [ ] **Step 4: `PdfDownloadButton` naar de dashboard-huisstijl**

Vervang het `Props`-interface (regel 6-11) door:

```tsx
interface Props {
  campaignId: string
  campaignName: string
  scanType?: string
  showSegmentSummaryExport?: boolean
  /** Tekst op de primaire knop. Standaard "Rapport downloaden". */
  label?: string
  /** 'end' lijnt knop en foutmelding rechts uit in een tabelrij. */
  align?: 'start' | 'end'
}
```

Vervang de signatuur (regel 17-22) door:

```tsx
export function PdfDownloadButton({
  campaignId,
  campaignName,
  scanType,
  showSegmentSummaryExport = false,
  label,
  align = 'start',
}: Props) {
```

Vervang het hele `return`-blok van de component (regel 72-94) door:

```tsx
  const primaryLabel = label ?? 'Rapport downloaden'
  const columnAlign = align === 'end' ? 'items-start sm:items-end' : 'items-start'
  const rowAlign = align === 'end' ? 'sm:justify-end' : ''

  return (
    <div className={`flex flex-col gap-1 ${columnAlign}`}>
      <div className={`flex flex-wrap items-center gap-2 ${rowAlign}`}>
        <button
          onClick={() => handleDownload('pdf')}
          disabled={loadingFormat !== null}
          className="inline-flex rounded-lg bg-[color:var(--dashboard-ink)] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#1B2E45] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loadingFormat === 'pdf' ? 'Rapport ophalen...' : primaryLabel}
        </button>
        {showSegmentSummaryExport ? (
          <button
            onClick={() => handleDownload('segment_summary')}
            disabled={loadingFormat !== null}
            className="inline-flex rounded-lg border border-[color:var(--dashboard-frame-border)] bg-white px-4 py-2.5 text-sm font-semibold text-[color:var(--dashboard-ink)] transition-colors hover:bg-[color:var(--dashboard-soft)] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loadingFormat === 'segment_summary' ? 'Export ophalen...' : 'Segmentexport downloaden'}
          </button>
        ) : null}
      </div>
      {error ? <p className="max-w-xs text-xs text-red-600">{error}</p> : null}
    </div>
  )
```

- [ ] **Step 5: Run, verwacht groen**

Run:
```bash
npx vitest run "app/(dashboard)/campaigns/[id]/page.report-access.test.ts" "app/(dashboard)/campaigns/[id]/pdf-download-button.test.ts" "app/(dashboard)/campaigns/[id]/page.standalone.test.ts"
npx tsc --noEmit 2>&1 | grep -c "error TS"
```
Expected: alle drie PASS; tsc gelijk aan de baseline.

- [ ] **Step 6: Commit**

```bash
cd /c/Users/larsh/Desktop/Business/Verisight/.worktrees/self-service-1
git add "frontend/app/(dashboard)/campaigns/[id]/page.tsx" "frontend/app/(dashboard)/campaigns/[id]/page.report-access.test.ts" "frontend/app/(dashboard)/campaigns/[id]/pdf-download-button.tsx" "frontend/app/(dashboard)/campaigns/[id]/pdf-download-button.test.ts"
git commit -m "feat(campagnedetail): klant downloadt het rapport zelf

- downloadknop voor elke rol met view_report; de API stond dit al toe
- 'Loep neemt contact met je op' en het Calendly-blok weg
- PdfDownloadButton in dashboard-huisstijl, met label- en align-prop

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

### Task 4: `/reports` wordt een rapportenoverzicht

Spec par. 4.3. De pagina heet nu "Managementbespreking plannen" en biedt alleen een Calendly- of mailto-knop. Twee bestaande guard-tests verwachten al een downloadpagina en falen daarom op main; die worden door deze taak groen.

**Files:**
- Modify: `frontend/lib/dashboard/report-library.ts:1-2` en onderaan
- Modify: `frontend/lib/dashboard/report-library.test.ts`
- Modify: `frontend/app/(dashboard)/reports/page.tsx` (volledige herschrijving)
- Create: `frontend/app/(dashboard)/reports/page.self-service.test.ts`
- Modify: `frontend/lib/dashboard/shell-navigation.ts:188, 234`

- [ ] **Step 1: Falende test voor `buildReportOverviewRows`**

Breid in `frontend/lib/dashboard/report-library.test.ts` de bestaande import uit met `buildReportOverviewRows` en voeg onderaan toe:

```ts
describe('buildReportOverviewRows (spec 2026-09-11 par. 4.3)', () => {
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
      ...overrides,
    } as CampaignStats
  }

  it('geeft een gesloten meting met tien of meer ingevuld vrij', () => {
    const [row] = buildReportOverviewRows([campaign()])
    expect(row.isAvailable).toBe(true)
    expect(row.status).toBe('Beschikbaar nu')
    expect(row.periodLabel).toBe('Q2 2026')
  })

  it('geeft een lopende meting nooit vrij, ook niet met veel respons', () => {
    const [row] = buildReportOverviewRows([campaign({ is_active: true, total_completed: 40 })])
    expect(row.isAvailable).toBe(false)
    expect(row.status).toBe('Meting loopt')
  })

  it('noemt bij een gesloten meting onder de drempel het aantal en de drempel', () => {
    const [row] = buildReportOverviewRows([campaign({ total_completed: 7 })])
    expect(row.isAvailable).toBe(false)
    expect(row.status).toContain('7')
    expect(row.status).toContain('10')
  })

  it('verzint geen noemer als er geen uitgenodigden bekend zijn (self_send)', () => {
    const [row] = buildReportOverviewRows([campaign()])
    expect(row.responseBasis).toBe('12 ingevuld')
  })

  it('toont de noemer wel als die er is', () => {
    const [row] = buildReportOverviewRows([campaign({ total_invited: 30 })])
    expect(row.responseBasis).toBe('12 van 30 ingevuld')
  })
})
```

Als het bestand `CampaignStats` nog niet importeert, voeg toe: `import type { CampaignStats } from '@/lib/types'`.

- [ ] **Step 2: Run, verwacht falen**

Run: `npx vitest run lib/dashboard/report-library.test.ts`
Expected: FAIL met `buildReportOverviewRows is not a function`.

- [ ] **Step 3: Builder toevoegen**

Vervang de eerste importregel van `frontend/lib/dashboard/report-library.ts` door:

```ts
import {
  getResponseActivationThresholds,
  isDashboardReleaseReady,
  isReportReleaseReady,
} from '@/lib/response-activation'
```

en zet onderaan het bestand:

```ts
// ─── Rapportenoverzicht ───────────────────────────────────────────────────────
// Gebruikt door reports/page.tsx (spec 2026-09-11 par. 4.3). De oudere
// buildHrReportDownloadRows hierboven blijft ongemoeid: die hangt aan de
// dashboarddrempel en wordt alleen nog door dashboard/cockpit-index.ts gelezen.

/**
 * Een rapport bestaat pas als de meting gesloten is én de rapportdrempel is
 * gehaald. Een lopende meting is dus nooit "beschikbaar", ook niet met veel
 * respons. Bij self_send maakt het platform geen respondenten vooraf aan, dus
 * staat total_invited in campaign_stats op 0; dan tonen we alleen het aantal
 * ingevulde vragenlijsten in plaats van een onjuiste noemer.
 */
export function buildReportOverviewRows(campaigns: CampaignStats[]): HrReportDownloadRow[] {
  return campaigns
    .filter((campaign) => campaign.scan_type !== 'culture_assessment')
    .map((campaign) => {
      const thresholds = getResponseActivationThresholds(campaign.scan_type)
      const isAvailable =
        !campaign.is_active &&
        isReportReleaseReady(campaign.total_completed, { scanType: campaign.scan_type })
      const date = new Date(campaign.created_at)
      const quarter = Math.floor(date.getUTCMonth() / 3) + 1
      const invited = campaign.total_invited ?? 0

      let status: string
      if (isAvailable) {
        status = 'Beschikbaar nu'
      } else if (campaign.is_active) {
        status = 'Meting loopt'
      } else {
        status = `Gesloten met ${campaign.total_completed} ingevuld. Minimaal ${thresholds.insightMin} nodig voor een rapport.`
      }

      return {
        campaignId: campaign.campaign_id,
        campaignName: campaign.campaign_name,
        scanType: campaign.scan_type,
        scanName: SCAN_TYPE_LABELS[campaign.scan_type],
        periodLabel: `Q${quarter} ${date.getUTCFullYear()}`,
        createdAt: campaign.created_at,
        responseBasis:
          invited > 0
            ? `${campaign.total_completed} van ${invited} ingevuld`
            : `${campaign.total_completed} ingevuld`,
        status,
        isAvailable,
        extraDisambiguator: null,
      }
    })
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
}
```

- [ ] **Step 4: Run, verwacht groen**

Run: `npx vitest run lib/dashboard/report-library.test.ts`
Expected: PASS (bestaande tests plus de vijf nieuwe).

- [ ] **Step 5: Falende guard voor de pagina**

Maak `frontend/app/(dashboard)/reports/page.self-service.test.ts`:

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
```

Run: `npx vitest run "app/(dashboard)/reports/page.self-service.test.ts"`
Expected: FAIL op alle drie.

- [ ] **Step 6: Pagina herschrijven**

Vervang de volledige inhoud van `frontend/app/(dashboard)/reports/page.tsx` door:

```tsx
import type { ReactNode } from 'react'
import { redirect } from 'next/navigation'
import { PdfDownloadButton } from '@/app/(dashboard)/campaigns/[id]/pdf-download-button'
import { SuiteAccessDenied } from '@/components/dashboard/suite-access-denied'
import { buildReportOverviewRows } from '@/lib/dashboard/report-library'
import { createClient } from '@/lib/supabase/server'
import { loadSuiteAccessContext } from '@/lib/suite-access-server'
import { buildReportDownloadIndex, type ReportDownloadRow } from './report-download-index'

const ROW_GRID = 'lg:grid-cols-[minmax(0,1.45fr),150px,190px,auto]'

function ReportRow({ row, children }: { row: ReportDownloadRow; children: ReactNode }) {
  return (
    <article
      className={`grid gap-4 border-b border-slate-200 px-5 py-5 last:border-b-0 lg:items-center ${ROW_GRID}`}
    >
      <div className="min-w-0">
        <p className="text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-[color:var(--dashboard-muted)]">
          {row.scanName}
        </p>
        <p className="mt-2 text-[1.02rem] font-semibold tracking-[-0.03em] text-[color:var(--dashboard-ink)]">
          {row.campaignName}
        </p>
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

  const reportIndex = buildReportDownloadIndex(buildReportOverviewRows(stats ?? []))

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
          metingen zie je met hun status.
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

      <details className="overflow-hidden border border-slate-200 bg-[color:var(--dashboard-soft)]/24">
        <summary className="cursor-pointer list-none px-5 py-4 text-sm font-semibold tracking-[-0.01em] text-[color:var(--dashboard-ink)]">
          Nog niet beschikbaar ({reportIndex.unavailableRows.length})
        </summary>
        <div className="border-t border-slate-200 bg-white">
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
      </details>
    </div>
  )
}
```

- [ ] **Step 7: Navigatielabel gelijktrekken**

In `frontend/lib/dashboard/shell-navigation.ts` regel 188: `label: 'Bespreking',` wordt `label: 'Rapporten',`.
In regel 234: `if (pathname.startsWith('/reports')) return 'Bespreking'` wordt `if (pathname.startsWith('/reports')) return 'Rapporten'`.

Beide plekken worden al door `lib/dashboard/shell-navigation.test.ts` (regel 80 en 168) op `'Rapporten'` getest; die tests falen op main en worden hierdoor groen.

- [ ] **Step 8: Run, verwacht groen**

Run:
```bash
npx vitest run "app/(dashboard)/reports" lib/dashboard/shell-navigation.test.ts lib/dashboard/report-library.test.ts
npx tsc --noEmit 2>&1 | grep -c "error TS"
```
Expected: alle testbestanden onder `app/(dashboard)/reports` PASS (inclusief `page.test.ts` en `page.route-shell.test.ts`, die op main faalden), `shell-navigation.test.ts` PASS, `report-library.test.ts` PASS; tsc gelijk aan de baseline.

- [ ] **Step 9: Commit**

```bash
cd /c/Users/larsh/Desktop/Business/Verisight/.worktrees/self-service-1
git add frontend/lib/dashboard/report-library.ts frontend/lib/dashboard/report-library.test.ts "frontend/app/(dashboard)/reports/page.tsx" "frontend/app/(dashboard)/reports/page.self-service.test.ts" frontend/lib/dashboard/shell-navigation.ts
git commit -m "feat(reports): rapportenoverzicht in plaats van besprekingsplanner

- buildReportOverviewRows: alleen gesloten metingen boven de rapportdrempel
- per rapport een downloadknop; geen Calendly of mailto meer
- self_send verzint geen noemer meer (total_invited is daar 0)
- navigatielabel Bespreking wordt Rapporten

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

### Task 5: De rapport-klaar-mail gaat echt de deur uit

Spec par. 5. Vandaag zoekt `closeCampaignAction` leden met de rollen `admin` en `hr_manager` (bestaan niet in de check-constraint) en leest daarna `profiles.email`, een kolom die in `supabase/schema.sql` en in geen enkele migratie voorkomt. Alles staat in een `try/catch` met een `console.error`, dus de mail is een stille no-op.

**Files:**
- Create: `frontend/lib/loep-contact.ts`
- Create: `frontend/lib/report-mail-recipients.ts`
- Create: `frontend/lib/report-mail-recipients.test.ts`
- Modify: `frontend/lib/email-templates/rapport-gereed.ts`
- Modify: `frontend/lib/email-templates/rapport-gereed.test.ts`
- Modify: `frontend/app/(dashboard)/dashboard/dashboard-actions.ts:17-20, 98-181`
- Modify: `frontend/app/(dashboard)/dashboard/dashboard-actions.test.ts`
- Modify: `frontend/components/dashboard/dashboard-state-actions.tsx:10-11, 37-49, 71-80`
- Modify: `frontend/components/dashboard/dashboard-state-actions.test.ts`

- [ ] **Step 1: Falende test voor de ontvangerslijst**

Maak `frontend/lib/report-mail-recipients.test.ts`:

```ts
import { describe, expect, it } from 'vitest'
import { buildReportMailRecipients } from '@/lib/report-mail-recipients'

describe('buildReportMailRecipients (spec 2026-09-11 par. 5)', () => {
  it('bundelt eigenaren, het organisatieadres en de operator', () => {
    expect(
      buildReportMailRecipients({
        ownerInviteEmails: ['hr@klant.nl'],
        organizationContactEmail: 'directie@klant.nl',
        operatorEmail: 'hallo@getloep.nl',
      }),
    ).toEqual(['hr@klant.nl', 'directie@klant.nl', 'hallo@getloep.nl'])
  })

  it('ontdubbelt op kleine letters', () => {
    expect(
      buildReportMailRecipients({
        ownerInviteEmails: ['HR@Klant.nl', ' hr@klant.nl '],
        organizationContactEmail: 'hr@klant.nl',
        operatorEmail: 'hallo@getloep.nl',
      }),
    ).toEqual(['hr@klant.nl', 'hallo@getloep.nl'])
  })

  it('negeert lege en onvolledige adressen', () => {
    expect(
      buildReportMailRecipients({
        ownerInviteEmails: [null, undefined, '', '  ', 'geen-adres'],
        organizationContactEmail: null,
        operatorEmail: 'hallo@getloep.nl',
      }),
    ).toEqual(['hallo@getloep.nl'])
  })
})
```

- [ ] **Step 2: Run, verwacht falen**

Run: `npx vitest run lib/report-mail-recipients.test.ts`
Expected: FAIL, module `@/lib/report-mail-recipients` bestaat niet.

- [ ] **Step 3: Contact- en ontvangershelpers**

Maak `frontend/lib/loep-contact.ts`:

```ts
/** Het enige publieke contactadres van Loep. */
export const LOEP_CONTACT_EMAIL = 'hallo@getloep.nl'

/**
 * Adres waarop de operator meeleest (spec 2026-09-11 par. 5), zodat Lars ziet
 * wanneer een klant een rapport heeft gekregen. Instelbaar via env voor het
 * geval dat ooit een apart postvak wordt.
 */
export function getOperatorEmail(): string {
  const configured = process.env.LOEP_OPERATOR_EMAIL?.trim()
  return configured && configured.length > 0 ? configured : LOEP_CONTACT_EMAIL
}
```

Maak `frontend/lib/report-mail-recipients.ts`:

```ts
export interface ReportMailRecipientsInput {
  /** E-mailadressen uit org_invites met rol owner en een geaccepteerde uitnodiging. */
  ownerInviteEmails: Array<string | null | undefined>
  /** organizations.contact_email; het adres uit de intake. */
  organizationContactEmail?: string | null
  /** Operator-kopie, zie getOperatorEmail(). */
  operatorEmail: string
}

/**
 * Pure ontvangerslijst voor de rapport-klaar-mail (spec 2026-09-11 par. 5).
 * Volgorde: eigenaren, dan het organisatieadres, dan de operator. Ontdubbeld
 * op kleine letters; adressen zonder apenstaartje worden overgeslagen in
 * plaats van blind aan Resend gegeven.
 */
export function buildReportMailRecipients(input: ReportMailRecipientsInput): string[] {
  const seen = new Set<string>()
  const recipients: string[] = []

  for (const raw of [...input.ownerInviteEmails, input.organizationContactEmail, input.operatorEmail]) {
    const email = (raw ?? '').trim().toLowerCase()
    if (!email || !email.includes('@')) continue
    if (seen.has(email)) continue
    seen.add(email)
    recipients.push(email)
  }

  return recipients
}
```

- [ ] **Step 4: Run, verwacht groen**

Run: `npx vitest run lib/report-mail-recipients.test.ts`
Expected: PASS (3 tests).

- [ ] **Step 5: Falende test voor de mailtemplate**

Vervang in `frontend/lib/email-templates/rapport-gereed.test.ts` de tweede test (`'bevat Calendly-link als opgegeven'`, regel 17-25) door:

```ts
  it('nodigt niet meer uit voor een bespreking', () => {
    const html = rapportGereedHtml({
      organizationName: 'Org',
      campaignName: 'Scan',
      dashboardUrl: 'https://www.getloep.nl/campaigns/x',
    })
    expect(html).not.toContain('calendly')
    expect(html).not.toContain('bespreking')
    expect(html).toContain('pagina twee')
  })
```

en verwijder in de eerste en derde test de regel `calendlyUrl: null,`.

Run: `npx vitest run lib/email-templates/rapport-gereed.test.ts`
Expected: FAIL (TypeScript klaagt over het ontbrekende `calendlyUrl`, of de assertie op "pagina twee" faalt).

- [ ] **Step 6: Template herschrijven**

Vervang de volledige inhoud van `frontend/lib/email-templates/rapport-gereed.ts` door:

```ts
export function rapportGereedHtml({
  organizationName,
  campaignName,
  dashboardUrl,
}: {
  organizationName: string
  campaignName: string
  dashboardUrl: string
}): string {
  return `
<!DOCTYPE html>
<html lang="nl">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="font-family:system-ui,sans-serif;color:#162238;max-width:560px;margin:40px auto;padding:0 20px">
  <p style="font-size:13px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;color:#78818a">Loep</p>
  <h1 style="font-size:24px;font-weight:700;margin:16px 0 8px">Je rapport staat klaar</h1>
  <p style="color:#4e5d6f;line-height:1.7">
    Het rapport voor <strong>${escHtml(campaignName)}</strong> (${escHtml(organizationName)}) staat
    klaar in je dashboard. Begin op pagina twee: daar staat waar het gesprek begint.
  </p>
  <a href="${escHtml(dashboardUrl)}"
     style="display:inline-block;margin:24px 0 16px;background:#b9571f;color:#fff;padding:14px 24px;
            text-decoration:none;font-weight:600;font-size:15px">
    Open je dashboard
  </a>
  <hr style="border:none;border-top:1px solid #e8ddd0;margin:24px 0">
  <p style="font-size:12px;color:#97a0ab">
    Loep · hallo@getloep.nl<br>
    Je ontvangt dit bericht omdat je de eigenaar bent van de Loep-omgeving van ${escHtml(organizationName)}.
  </p>
</body>
</html>`
}

function escHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}
```

Run: `npx vitest run lib/email-templates/rapport-gereed.test.ts`
Expected: PASS (3 tests).

- [ ] **Step 7: Falende guard op de server action**

Vervang in `frontend/app/(dashboard)/dashboard/dashboard-actions.test.ts` de derde test door:

```ts
  it('closeCampaignAction archives the campaign with a closed_at timestamp', () => {
    expect(source).toContain('export async function closeCampaignAction')
    expect(source).toContain('is_active: false')
    expect(source).toContain('closed_at')
  })

  it('mailt alleen als er echt een rapport is en naar bestaande kolommen', () => {
    expect(source).toContain('isReportReleaseReady')
    expect(source).toContain("from('org_invites')")
    expect(source).toContain("eq('role', 'owner')")
    expect(source).toContain('buildReportMailRecipients')
    expect(source).toContain('getOperatorEmail')
    // profiles.email bestaat niet in het schema; org_members kent geen
    // rollen admin/hr_manager. Beide waren de oorzaak van de stille no-op.
    expect(source).not.toContain("from('profiles')\n      .select('email')")
    expect(source).not.toContain("'hr_manager'")
  })

  it('meldt een mislukte mail in plaats van hem stil te slikken', () => {
    expect(source).toContain('warning')
    expect(source).toContain('report_mail')
  })
```

Run: `npx vitest run "app/(dashboard)/dashboard/dashboard-actions.test.ts"`
Expected: FAIL op de twee nieuwe tests.

- [ ] **Step 8: `closeCampaignAction` herschrijven**

Voeg bovenaan `frontend/app/(dashboard)/dashboard/dashboard-actions.ts` toe aan de imports:

```ts
import { isReportReleaseReady } from '@/lib/response-activation'
import { buildReportMailRecipients } from '@/lib/report-mail-recipients'
import { getOperatorEmail } from '@/lib/loep-contact'
import type { ScanType } from '@/lib/types'
```

Breid het resultaattype uit (regel 17-20):

```ts
export interface DashboardActionResult {
  ok: boolean
  error?: string
  /** De actie slaagde, maar een neveneffect (de mail) niet. Fail Loud in de UI. */
  warning?: string
}
```

Vervang alles vanaf de audit-insert tot en met de `return { ok: true }` aan het eind van `closeCampaignAction` (regel 128-180) door:

```ts
  // Rapport-klaar-mail (spec 2026-09-11 par. 5). Alleen versturen als er echt
  // een rapport is: onder de drempel krijgt de klant geen belofte die niet
  // waargemaakt wordt. Ontvangers komen uit org_invites (rol owner, uitnodiging
  // geaccepteerd) plus het organisatieadres; profiles.email bestaat niet.
  const [{ data: statsRow }, { data: ownerInvites }, { data: orgRow }] = await Promise.all([
    ctx.supabase
      .from('campaign_stats')
      .select('total_completed, scan_type')
      .eq('campaign_id', campaignId)
      .maybeSingle(),
    ctx.supabase
      .from('org_invites')
      .select('email')
      .eq('org_id', ctx.organizationId)
      .eq('role', 'owner')
      .not('accepted_at', 'is', null),
    ctx.supabase
      .from('organizations')
      .select('contact_email')
      .eq('id', ctx.organizationId)
      .maybeSingle(),
  ])

  const totalCompleted = (statsRow as { total_completed?: number } | null)?.total_completed ?? 0
  const scanType = (statsRow as { scan_type?: ScanType } | null)?.scan_type
  const reportAvailable = isReportReleaseReady(totalCompleted, { scanType })

  let mailSent = 0
  let mailFailed = 0

  if (reportAvailable) {
    const recipients = buildReportMailRecipients({
      ownerInviteEmails: (ownerInvites ?? []).map((row: { email: string | null }) => row.email),
      organizationContactEmail: (orgRow as { contact_email?: string | null } | null)?.contact_email ?? null,
      operatorEmail: getOperatorEmail(),
    })
    const dashboardUrl = `${process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.getloep.nl'}/campaigns/${campaignId}`

    for (const to of recipients) {
      try {
        await sendLoepEmail({
          to,
          subject: `Je rapport staat klaar: ${campaignName}`,
          html: rapportGereedHtml({ organizationName: orgName, campaignName, dashboardUrl }),
        })
        mailSent += 1
      } catch (err) {
        mailFailed += 1
        console.error('[closeCampaignAction] rapport-gereed mail mislukt:', err)
      }
    }
  }

  const { error: auditError } = await insertCampaignAuditEvent({
    supabase: ctx.supabase,
    organizationId: ctx.organizationId,
    campaignId,
    actorUserId: ctx.user.id,
    actorRole: ctx.actorRole,
    action: 'delivery_lifecycle_changed',
    outcome: 'completed',
    summary: 'Campagne gesloten vanuit het dashboard.',
    metadata: { report_mail: { available: reportAvailable, sent: mailSent, failed: mailFailed } },
  })
  if (auditError) return { ok: false, error: `Sluiten gelukt, maar loggen mislukt: ${auditError.message}` }

  if (mailFailed > 0) {
    return {
      ok: true,
      warning: `Campagne gesloten. De e-mail kon niet naar ${mailFailed} van de ${mailSent + mailFailed} adressen worden verstuurd. Het rapport staat wel klaar in je dashboard.`,
    }
  }

  return { ok: true }
```

- [ ] **Step 9: Waarschuwing tonen in de UI**

In `frontend/components/dashboard/dashboard-state-actions.tsx`: voeg naast `error` een tweede state toe (regel 11):

```tsx
  const [notice, setNotice] = useState<string | null>(null)
```

Vervang `handleClose` (regel 37-49) door:

```tsx
  async function handleClose() {
    setError(null)
    setNotice(null)
    const confirmed = confirm('Weet je zeker dat je deze campagne wilt sluiten?\n\nRespondenten kunnen daarna niet meer invullen. Resultaten en het rapport blijven beschikbaar.')
    if (!confirmed) return
    setPhase('busy')
    const result = await closeCampaignAction(state.campaignId!)
    if (!result.ok) {
      setError(result.error ?? 'Sluiten mislukt.')
      setPhase('idle')
      return
    }
    setNotice(result.warning ?? null)
    setPhase('idle')
    router.refresh()
  }
```

Vervang in de `close_campaign`-tak (regel 71-80) het foutregeltje door:

```tsx
        {error ? <p role="alert" className="text-xs text-red-600">{error}</p> : null}
        {notice ? (
          <p role="status" className="max-w-md text-xs text-[color:var(--dashboard-muted)]">
            {notice}
          </p>
        ) : null}
```

Voeg toe aan `frontend/components/dashboard/dashboard-state-actions.test.ts`, in het eerste `describe`:

```ts
  it('toont een waarschuwing als het sluiten lukte maar de mail niet', () => {
    expect(island).toContain('setNotice')
    expect(island).toContain('result.warning')
    expect(island).toContain('role="status"')
  })
```

- [ ] **Step 10: Run, verwacht groen**

Run:
```bash
npx vitest run "app/(dashboard)/dashboard/dashboard-actions.test.ts" components/dashboard/dashboard-state-actions.test.ts lib/report-mail-recipients.test.ts lib/email-templates/rapport-gereed.test.ts
npx tsc --noEmit 2>&1 | grep -c "error TS"
```
Expected: alle vier PASS; tsc gelijk aan de baseline.

- [ ] **Step 11: Commit**

```bash
cd /c/Users/larsh/Desktop/Business/Verisight/.worktrees/self-service-1
git add frontend/lib/loep-contact.ts frontend/lib/report-mail-recipients.ts frontend/lib/report-mail-recipients.test.ts frontend/lib/email-templates/rapport-gereed.ts frontend/lib/email-templates/rapport-gereed.test.ts "frontend/app/(dashboard)/dashboard/dashboard-actions.ts" "frontend/app/(dashboard)/dashboard/dashboard-actions.test.ts" frontend/components/dashboard/dashboard-state-actions.tsx frontend/components/dashboard/dashboard-state-actions.test.ts
git commit -m "fix(mail): rapport-klaar-mail werkt en faalt zichtbaar

- ontvangers uit org_invites (owner, geaccepteerd) plus contact_email en een
  operator-kopie; profiles.email en de rollen admin/hr_manager bestonden niet
- alleen mailen als de rapportdrempel gehaald is
- mislukte mail wordt een warning in de UI en telt mee in de auditmetadata
- template zonder Calendly, met de verwijzing naar pagina twee

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

### Task 6: Eén bron voor uitnodiging en herinnering

Spec par. 6. De tekst die de klant op het dashboard kopieert komt nu uit `buildParticipantCommunicationPreview` en zegt "Op {datum} opent Loep de vragenlijst ... je ontvangt dan een persoonlijke uitnodiging" plus "Loep verzorgt de uitnodiging, verzending en verwerking", zonder surveylink. Dat is de oude managed-modus; bij `self_send` verstuurt de klant zelf.

**Files:**
- Modify: `frontend/lib/campaign-setup.ts` (onderaan)
- Modify: `frontend/lib/campaign-setup.test.ts`
- Modify: `frontend/lib/self-send-comms.ts:231-274`
- Modify: `frontend/lib/self-send-comms.test.ts:67-89`
- Create: `frontend/lib/dashboard/reminder-text.ts`
- Create: `frontend/lib/dashboard/reminder-text.test.ts`
- Modify: `frontend/components/dashboard/setup-wizard-card.tsx:29-33, 41-66, 131-136`
- Modify: `frontend/components/dashboard/self-send-setup-panel.tsx:88-93`
- Modify: `frontend/app/(dashboard)/dashboard/page.tsx` (reminderText)
- Modify: `frontend/app/(dashboard)/campaigns/[id]/page.tsx` (reminderText)

- [ ] **Step 1: Falende test voor de invultijd**

Voeg onderaan `frontend/lib/campaign-setup.test.ts` toe (en breid de import uit met `SURVEY_DURATION_LABEL`):

```ts
describe('SURVEY_DURATION_LABEL', () => {
  it('volgt de invultijd die de vragenlijst zelf noemt', () => {
    expect(SURVEY_DURATION_LABEL.retention).toBe('ongeveer 6 minuten')
    expect(SURVEY_DURATION_LABEL.exit).toBe('ongeveer 8 minuten')
    expect(SURVEY_DURATION_LABEL.onboarding).toBe('ongeveer 3 minuten')
  })

  it('heeft voor elke scan een waarde', () => {
    for (const option of CAMPAIGN_SCAN_OPTIONS) {
      expect(SURVEY_DURATION_LABEL[option.value]).toBeTruthy()
    }
  })
})
```

Run: `npx vitest run lib/campaign-setup.test.ts`
Expected: FAIL, `SURVEY_DURATION_LABEL` bestaat niet.

- [ ] **Step 2: Invultijd toevoegen**

Zet onderaan `frontend/lib/campaign-setup.ts`:

```ts
/**
 * Invultijd zoals de vragenlijst hem zelf noemt in survey_intro
 * (backend/products/*/definition.py). De uitnodigings- en herinneringstekst
 * gebruiken deze waarde, zodat de klant niet iets anders belooft dan de
 * respondent leest. Scans zonder eigen tijdsindicatie krijgen een neutrale
 * formulering in plaats van een verzonnen getal.
 */
export const SURVEY_DURATION_LABEL: Record<ScanType, string> = {
  exit: 'ongeveer 8 minuten',
  retention: 'ongeveer 6 minuten',
  onboarding: 'ongeveer 3 minuten',
  culture_assessment: 'een paar minuten',
  pulse: 'een paar minuten',
  team: 'een paar minuten',
  leadership: 'een paar minuten',
}
```

Run: `npx vitest run lib/campaign-setup.test.ts`
Expected: PASS.

- [ ] **Step 3: Falende tests voor de templates**

Vervang in `frontend/lib/self-send-comms.test.ts` de twee templatetests (regel 67-89) door:

```ts
  it('bakes the survey link into the invitation template body', () => {
    const tpl = buildInviteTemplate({
      senderName: 'Sarah de Vries, HR',
      organizationName: 'Acme BV',
      scanLabel: 'Loep Vertrek',
      scanType: 'exit',
      surveyLink: 'https://www.getloep.nl/survey/open/tok-123',
    })
    expect(tpl.subject).toContain('Acme BV')
    expect(tpl.body).toContain('https://www.getloep.nl/survey/open/tok-123')
    expect(tpl.body).toContain('Sarah de Vries, HR')
    expect(tpl.body).toContain('ongeveer 8 minuten')
    expect(tpl.body).not.toMatch(/[—–]/)
  })

  it('reminder template references the same link and signals it is a reminder', () => {
    const tpl = buildReminderTemplate({
      senderName: 'Sarah',
      organizationName: 'Acme BV',
      scanLabel: 'Loep Behoud',
      scanType: 'retention',
      surveyLink: 'https://www.getloep.nl/survey/open/tok-123',
    })
    expect(tpl.subject.toLowerCase()).toContain('herinnering')
    expect(tpl.body).toContain('https://www.getloep.nl/survey/open/tok-123')
    expect(tpl.body).toContain('ongeveer 6 minuten')
  })

  it('zet bij afdelingsrapportage de links per afdeling in plaats van één algemene link', () => {
    const tpl = buildReminderTemplate({
      senderName: 'Sarah',
      organizationName: 'Acme BV',
      scanLabel: 'Loep Behoud',
      scanType: 'retention',
      surveyLink: 'https://www.getloep.nl/survey/open/tok-123',
      departmentLinks: [
        { label: 'Zorg', url: 'https://www.getloep.nl/survey/open/tok-123?afd=zorg' },
        { label: 'Kantoor', url: 'https://www.getloep.nl/survey/open/tok-123?afd=kantoor' },
      ],
    })
    expect(tpl.body).toContain('Zorg: https://www.getloep.nl/survey/open/tok-123?afd=zorg')
    expect(tpl.body).toContain('Kantoor: https://www.getloep.nl/survey/open/tok-123?afd=kantoor')
    expect(tpl.body).not.toContain('Vul de vragenlijst hier in')
  })
```

Run: `npx vitest run lib/self-send-comms.test.ts`
Expected: FAIL (onbekende property `scanType`, en de nieuwe asserties).

- [ ] **Step 4: Templates uit één bron**

Voeg bovenaan `frontend/lib/self-send-comms.ts` toe:

```ts
import { SURVEY_DURATION_LABEL } from '@/lib/campaign-setup'
import type { ScanType } from '@/lib/types'
```

Vervang het `TemplateArgs`-blok en beide builders (regel 231-274) door:

```ts
/**
 * Waarom deze scan de moeite waard is, in de stem van de organisatie. Stond
 * eerder alleen in de setup-wizard; hier staat hij één keer, zodat de
 * uitnodiging op het dashboard en in de wizard identiek zijn.
 */
export const SCAN_WHY: Partial<Record<ScanType, string>> = {
  retention: 'Jouw eerlijke inzicht helpt ons gericht te verbeteren wat jij en je collega\'s dagelijks ervaren.',
  exit: 'Jouw eerlijke inzicht helpt ons begrijpen wat er speelt bij vertrek, voor de mensen die blijven.',
  onboarding: 'Jouw ervaring helpt ons de eerste maanden beter vorm te geven voor nieuwe collega\'s.',
}

const DEFAULT_SCAN_WHY = 'Jouw inzicht helpt ons als organisatie verder.'

interface TemplateArgs {
  senderName: string
  organizationName: string
  scanLabel: string
  scanType: ScanType
  surveyLink: string
  /** Bij afdelingsrapportage: één link per afdeling in plaats van de algemene link. */
  departmentLinks?: Array<{ label: string; url: string }>
}

function buildLinkLines(args: TemplateArgs): string[] {
  const duration = SURVEY_DURATION_LABEL[args.scanType]
  if (args.departmentLinks && args.departmentLinks.length > 0) {
    return [
      `Gebruik de link van je eigen afdeling (invullen kost ${duration}):`,
      ...args.departmentLinks.map((link) => `${link.label}: ${link.url}`),
    ]
  }
  return [`Vul de vragenlijst hier in (${duration}): ${args.surveyLink}`]
}

export function buildInviteTemplate(args: TemplateArgs): EmailTemplate {
  const sender = args.senderName || 'HR'
  return {
    subject: `Uitnodiging: korte vragenlijst - ${args.organizationName}`,
    body: [
      'Beste collega,',
      '',
      `${args.organizationName} houdt een korte, anonieme vragenlijst (${args.scanLabel}).`,
      '',
      SCAN_WHY[args.scanType] ?? DEFAULT_SCAN_WHY,
      '',
      'Je antwoorden worden alleen op groepsniveau gerapporteerd en zijn niet naar jou herleidbaar.',
      '',
      ...buildLinkLines(args),
      '',
      'Alvast bedankt voor je deelname.',
      '',
      'Met vriendelijke groet,',
      sender,
    ].join('\n'),
  }
}

export function buildReminderTemplate(args: TemplateArgs): EmailTemplate {
  const sender = args.senderName || 'HR'
  return {
    subject: `Herinnering: korte vragenlijst - ${args.organizationName}`,
    body: [
      'Beste collega,',
      '',
      `Een korte herinnering: heb je de anonieme vragenlijst van ${args.organizationName} al ingevuld? Je antwoorden tellen alleen op groepsniveau mee.`,
      '',
      ...buildLinkLines(args),
      '',
      'Heb je hem al ingevuld? Dan kun je deze mail negeren, en bedankt.',
      '',
      'Met vriendelijke groet,',
      sender,
    ].join('\n'),
  }
}
```

Run: `npx vitest run lib/self-send-comms.test.ts`
Expected: PASS.

- [ ] **Step 5: Falende test voor de herinneringstekst op het dashboard**

Maak `frontend/lib/dashboard/reminder-text.test.ts`:

```ts
import { describe, expect, it } from 'vitest'
import { buildReminderText } from '@/lib/dashboard/reminder-text'

function input(overrides: Partial<Parameters<typeof buildReminderText>[0]> = {}) {
  return {
    commsMode: 'self_send',
    scanType: 'retention' as const,
    scanLabel: 'Loep Behoud',
    organizationName: 'Acme BV',
    publicSurveyToken: 'tok-123',
    frontendBaseUrl: 'https://www.getloep.nl',
    segmentDepartments: null,
    deliveryMode: 'baseline' as const,
    launchDate: '2026-06-01',
    participantCommsConfig: null,
    ...overrides,
  }
}

describe('buildReminderText (spec 2026-09-11 par. 6)', () => {
  it('geeft bij self_send de eigen-verzendtekst met surveylink', () => {
    const text = buildReminderText(input())
    expect(text).toContain('https://www.getloep.nl/survey/open/tok-123')
    expect(text).toContain('Herinnering')
    expect(text).not.toContain('Loep verzorgt de uitnodiging')
  })

  it('gebruikt bij afdelingsrapportage de links per afdeling', () => {
    const text = buildReminderText(
      input({
        segmentDepartments: [
          { label: 'Zorg', slug: 'zorg' },
          { label: 'Kantoor', slug: 'kantoor' },
        ],
      }),
    )
    expect(text).toContain('?afd=zorg')
    expect(text).toContain('?afd=kantoor')
  })

  it('houdt de oude managed-tekst voor bestaande managed-campagnes', () => {
    const text = buildReminderText(input({ commsMode: 'managed' }))
    expect(text).toContain('Loep verzorgt de uitnodiging')
  })
})
```

Run: `npx vitest run lib/dashboard/reminder-text.test.ts`
Expected: FAIL, module bestaat niet.

- [ ] **Step 6: Helper schrijven**

Maak `frontend/lib/dashboard/reminder-text.ts`:

```ts
import { buildParticipantCommunicationPreview } from '@/lib/launch-controls'
import {
  buildReminderTemplate,
  buildSegmentSurveyLinks,
  buildSurveyLink,
  type SegmentDepartmentStored,
} from '@/lib/self-send-comms'
import type { DeliveryMode, ScanType } from '@/lib/types'

export interface ReminderTextInput {
  commsMode: string | null | undefined
  scanType: ScanType
  scanLabel: string
  organizationName: string
  publicSurveyToken: string | null | undefined
  frontendBaseUrl: string
  segmentDepartments?: SegmentDepartmentStored[] | null
  deliveryMode: DeliveryMode | null | undefined
  launchDate: string | null
  participantCommsConfig: unknown
}

/**
 * Eén bron voor de herinneringstekst die de klant kopieert (spec 2026-09-11
 * par. 6). Bij self_send verstuurt de klant zelf, dus de tekst moet de
 * surveylink bevatten; de legacy managed-preview belooft juist dat Loep
 * verstuurt en blijft daarom alleen voor oude managed-campagnes.
 */
export function buildReminderText(input: ReminderTextInput): string {
  if (input.commsMode === 'self_send' && input.publicSurveyToken) {
    const departments = input.segmentDepartments ?? null
    const template = buildReminderTemplate({
      senderName: '',
      organizationName: input.organizationName,
      scanLabel: input.scanLabel,
      scanType: input.scanType,
      surveyLink: buildSurveyLink(input.frontendBaseUrl, input.publicSurveyToken),
      departmentLinks:
        departments && departments.length > 0
          ? buildSegmentSurveyLinks(input.frontendBaseUrl, input.publicSurveyToken, departments)
          : undefined,
    })
    return `${template.subject}\n\n${template.body}`
  }

  const preview = buildParticipantCommunicationPreview({
    scanType: input.scanType,
    deliveryMode: input.deliveryMode,
    launchDate: input.launchDate,
    participantCommsConfig: input.participantCommsConfig,
  })
  return `${preview.subject}\n\n${preview.body.join('\n\n')}`
}
```

Run: `npx vitest run lib/dashboard/reminder-text.test.ts`
Expected: PASS (3 tests).

- [ ] **Step 7: Beide dashboardpagina's op de helper**

In `frontend/app/(dashboard)/dashboard/page.tsx`: vervang de import van `buildParticipantCommunicationPreview` door

```ts
import { normalizeReminderConfig } from '@/lib/launch-controls'
import { buildReminderText } from '@/lib/dashboard/reminder-text'
```

en vervang het `reminderPreview`-blok (regel 131-137) door:

```ts
  const reminderText = buildReminderText({
    commsMode: campaignRow?.comms_mode ?? null,
    scanType: campaign.scan_type,
    scanLabel: SCAN_TYPE_LABELS[campaign.scan_type] ?? campaign.scan_type,
    organizationName: orgData?.name ?? 'je organisatie',
    publicSurveyToken: (campaignRow as Record<string, unknown>)?.public_survey_token as string | undefined,
    frontendBaseUrl: process.env.NEXT_PUBLIC_FRONTEND_URL ?? 'https://getloep.nl',
    segmentDepartments: (campaignRow as Record<string, unknown>)?.segment_departments as
      | { label: string; slug: string; invited_count?: number }[]
      | null,
    deliveryMode: campaignRow?.delivery_mode ?? null,
    launchDate: deliveryRecord?.launch_date ?? null,
    participantCommsConfig: deliveryRecord?.participant_comms_config ?? null,
  })
```

In `frontend/app/(dashboard)/campaigns/[id]/page.tsx`: dezelfde importwissel, en vervang het `reminderPreview`-blok (regel 123-129) door hetzelfde aanroepblok met `stats.scan_type`, `campaignMeta` in plaats van `campaignRow` en `orgData?.name ?? 'je organisatie'`.

- [ ] **Step 8: Wizard op dezelfde bron**

In `frontend/components/dashboard/setup-wizard-card.tsx`:

(a) Breid de import van `@/lib/self-send-comms` (regel 6) uit met `buildInviteTemplate`.
(b) Verwijder de lokale constante `SCAN_WHY` (regel 29-33) en de functie `buildInviteBody` (regel 41-66). `SCAN_TIP` blijft staan: dat is advies voor HR, geen respondentcopy.
(c) Vervang regel 131-136 door:

```ts
  const inviteDepartmentLinks =
    segmentDepartments && segmentDepartments.length > 0
      ? buildSegmentSurveyLinks(frontendBaseUrl, publicSurveyToken, segmentDepartments)
      : undefined
  const { subject: inviteSubject, body: inviteBody } = buildInviteTemplate({
    senderName: '',
    organizationName,
    scanLabel,
    scanType,
    surveyLink,
    departmentLinks: inviteDepartmentLinks,
  })
```

De tekst blijft de beginwaarde van `editableSubject`/`editableBody`; net als nu volgt hij geen latere wijziging aan de afdelingslijst zonder herladen. Dat gedrag is ongewijzigd.

- [ ] **Step 9: Adminpaneel meeverhuizen**

In `frontend/components/dashboard/self-send-setup-panel.tsx` roepen regel 88 en 92 de builders aan zonder `scanType`; voeg die toe (de variabele `scanType` staat al in scope, regel 73):

```tsx
    () => buildInviteTemplate({ senderName: config.senderName, organizationName, scanLabel, scanType, surveyLink }),
    [config.senderName, organizationName, scanLabel, scanType, surveyLink],
```

```tsx
    () => buildReminderTemplate({ senderName: config.senderName, organizationName, scanLabel, scanType, surveyLink }),
    [config.senderName, organizationName, scanLabel, scanType, surveyLink],
```

- [ ] **Step 10: Guard op de wizard**

Voeg toe aan `frontend/components/dashboard/setup-wizard-card.guard.test.ts`:

```ts
  it('gebruikt de gedeelde uitnodigingstekst in plaats van een eigen kopie', () => {
    const source = readFileSync(new URL('./setup-wizard-card.tsx', import.meta.url), 'utf8')

    expect(source).toContain('buildInviteTemplate')
    expect(source).not.toContain('function buildInviteBody')
    expect(source).not.toContain('const SCAN_WHY')
    expect(source).not.toContain('10-15 minuten')
  })
```

(Als het bestand `readFileSync` nog niet importeert, voeg `import { readFileSync } from 'node:fs'` bovenaan toe.)

- [ ] **Step 11: Run, verwacht groen**

Run:
```bash
npx vitest run lib/self-send-comms.test.ts lib/campaign-setup.test.ts lib/dashboard/reminder-text.test.ts components/dashboard/setup-wizard-card.guard.test.ts "app/(dashboard)/dashboard/page.test.ts"
npx tsc --noEmit 2>&1 | grep -c "error TS"
```
Expected: alle PASS; tsc gelijk aan de baseline. Meldt tsc een fout over `scanType` bij een andere aanroep van `buildInviteTemplate`/`buildReminderTemplate`, voeg die daar ook toe (grep: `grep -rn "buildInviteTemplate\|buildReminderTemplate" app components lib`).

- [ ] **Step 12: Commit**

```bash
cd /c/Users/larsh/Desktop/Business/Verisight/.worktrees/self-service-1
git add frontend/lib/campaign-setup.ts frontend/lib/campaign-setup.test.ts frontend/lib/self-send-comms.ts frontend/lib/self-send-comms.test.ts frontend/lib/dashboard/reminder-text.ts frontend/lib/dashboard/reminder-text.test.ts frontend/components/dashboard/setup-wizard-card.tsx frontend/components/dashboard/setup-wizard-card.guard.test.ts frontend/components/dashboard/self-send-setup-panel.tsx "frontend/app/(dashboard)/dashboard/page.tsx" "frontend/app/(dashboard)/campaigns/[id]/page.tsx"
git commit -m "fix(comms): uitnodiging en herinnering uit één bron, met surveylink

- de herinneringstekst op het dashboard kwam uit de managed-preview: geen
  link en de belofte dat Loep verstuurt, terwijl de klant zelf verstuurt
- buildReminderTemplate krijgt de afdelingslinks bij segmentrapportage
- invultijd volgt survey_intro per scan in plaats van '10-15 minuten'
- de wizard gebruikt dezelfde builder als het dashboard

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

### Task 7: Volledige verificatie en afronding

**Files:** geen codewijziging, behalve het meenemen van spec, inventaris en plan op de branch.

- [ ] **Step 1: Documenten meenemen op de branch**

De spec, de inventaris en dit plan staan untracked in de hoofdrepo en ontbreken dus in de worktree.

Run:
```bash
cd /c/Users/larsh/Desktop/Business/Verisight
cp docs/onboarding-flow-inventaris-2026-09-11.md .worktrees/self-service-1/docs/
cp docs/superpowers/specs/2026-09-11-self-service-onboarding-design.md .worktrees/self-service-1/docs/superpowers/specs/
cp docs/superpowers/plans/2026-09-11-self-service-1-rapport-in-eigen-hand.md .worktrees/self-service-1/docs/superpowers/plans/
cd .worktrees/self-service-1
git add docs/onboarding-flow-inventaris-2026-09-11.md docs/superpowers/specs/2026-09-11-self-service-onboarding-design.md docs/superpowers/plans/2026-09-11-self-service-1-rapport-in-eigen-hand.md
git commit -m "docs: spec, inventaris en plan voor self-service spoor 1

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

- [ ] **Step 2: Typecheck**

Run:
```bash
cd /c/Users/larsh/Desktop/Business/Verisight/.worktrees/self-service-1/frontend
npx tsc --noEmit 2>&1 | grep -c "error TS"
```
Expected: exact de baseline uit Task 0 (verwacht 133). Is het hoger, zoek de nieuwe fouten op met `npx tsc --noEmit | grep "error TS"` en los ze op voordat je verdergaat.

- [ ] **Step 3: Faalset vergelijken, niet alleen tellen**

Run:
```bash
cd /c/Users/larsh/Desktop/Business/Verisight/.worktrees/self-service-1/frontend
npx vitest run --reporter=json --outputFile=/c/Users/larsh/AppData/Local/Temp/loep-self-service-1/vitest-na.json >/dev/null 2>&1
node -e "const r=require('/c/Users/larsh/AppData/Local/Temp/loep-self-service-1/vitest-na.json');const f=[];for(const s of r.testResults)for(const t of s.assertionResults)if(t.status==='failed')f.push(s.name.replace(/\\\\/g,'/').split('/frontend/')[1]+' > '+t.fullName);console.log(f.sort().join('\n'))" > /c/Users/larsh/AppData/Local/Temp/loep-self-service-1/na-fails.txt
diff /c/Users/larsh/AppData/Local/Temp/loep-self-service-1/baseline-fails.txt /c/Users/larsh/AppData/Local/Temp/loep-self-service-1/na-fails.txt
```
Expected: alleen regels met `<` (tests die op main faalden en nu slagen). Verwacht verdwenen: de twee `reports`-guards en de twee `shell-navigation`-tests uit de baselinenotitie. Geen enkele regel met `>`: elke `>`-regel is een nieuwe regressie en moet opgelost worden voordat deze taak af is.

- [ ] **Step 4: Productiebuild**

Run:
```bash
cd /c/Users/larsh/Desktop/Business/Verisight/.worktrees/self-service-1/frontend
npm run build
```
Expected: build slaagt. Dit vangt fouten die `tsc --noEmit` mist, zoals een client component die per ongeluk vanuit een server component wordt geïmporteerd.

- [ ] **Step 5: Bevindingen en handmatige QA opschrijven**

Maak in de worktree `docs/superpowers/plans/2026-09-11-self-service-1-uitvoering.md` met: de eind-baselines (tsc, faalset-diff), elke plek waar je van het plan bent afgeweken en waarom, en deze checklist voor Lars (die de browsercontrole doet, want in de sessie zijn geen testcredentials beschikbaar):

```markdown
## Handmatige controle na deploy (Lars)

1. Log in als eigenaar van een testorganisatie met een gesloten meting met 10 of meer ingevulde vragenlijsten. Op het campagnedetail staat "Je rapport staat klaar" met een werkende downloadknop; de PDF opent.
2. `/reports` toont die meting onder "Beschikbaar nu" met een knop "Download PDF", en lopende metingen onder "Nog niet beschikbaar".
3. Sluit een meting met 10 of meer antwoorden. Controleer dat de rapport-klaar-mail aankomt op het eigenaarsadres, op het contactadres van de organisatie en op hallo@getloep.nl.
4. Sluit een meting met minder dan 10 antwoorden. Er komt geen mail; het dashboard zegt dat er te weinig antwoorden zijn voor een rapport.
5. Bekijk bij een lopende meting de herinneringstekst op het dashboard: die bevat de surveylink (of bij afdelingsrapportage de links per afdeling) en belooft nergens dat Loep verstuurt.
6. Log in met een account dat lid is maar geen eigenaar. Dat account ziet de status zonder knoppen en kan `/campaigns/<id>/setup` niet openen.
```

Commit dit bestand.

- [ ] **Step 6: Klaar voor review**

Run:
```bash
cd /c/Users/larsh/Desktop/Business/Verisight/.worktrees/self-service-1
git log --oneline main..HEAD
git diff --stat main..HEAD
```
Expected: zeven à acht commits, alleen bestanden uit het bestandsoverzicht. Meld terug met de faalset-diff, het tsc-getal en de afwijkingen; de merge naar main doet Lars (of een aparte afrondsessie met `superpowers:finishing-a-development-branch`).

---

## Zelfreview van dit plan

**Spec-dekking (blokken A, B, C, F):**

| Spec | Taak |
|---|---|
| 4.1 vrijgaveregel | Task 1 |
| 4.2 campagnedetail | Task 3 |
| 4.3 rapportenpagina | Task 4 |
| 4.4 report-route ongewijzigd | geen taak nodig, `canDownloadCampaignReport` staat pdf al toe voor `view_report` |
| 4.5 segmentexport buiten scope | geen taak; `showSegmentSummaryExport` blijft standaard uit |
| 5 rapport-klaar-mail | Task 5 |
| 6 één tekstbron | Task 6 |
| 9 rollen | Task 2 |

**Afwijkingen van de spec, bewust:**
1. De spec beschrijft `isReportReleaseReady` als nieuwe regel; de implementatie in Task 1 rekent zelf met `thresholds.insightMin` in plaats van `isInsightReleaseReady` te hergebruiken, omdat die functie een `isActive`-gate heeft die hier juist niet thuishoort (de resolver beslist over sluiting).
2. Task 1 verlaagt niet alleen de vrijgave maar past ook de `processing`-tak aan: zonder die aanpassing zou een meting die sluit met 7 antwoorden "Je ontvangt een e-mail zodra het rapport gereed is" tonen terwijl er geen mail en geen rapport komt.
3. Het Calendly-blok verdwijnt in Task 3 ook voor de operator, niet alleen voor de klant. De spec zegt "voor klanten", maar het blok was al admin-only; half laten staan terwijl dezelfde knop van `/reports` verdwijnt, levert twee waarheden op.
4. De spec plaatst `LOEP_CONTACT_EMAIL` in `lib/loep-contact.ts` als onderdeel van blok G; dat bestand wordt hier al aangemaakt omdat Task 5 het operator-adres nodig heeft. Blok G importeert het straks.
5. Task 2 sluit ook de directe URL `/campaigns/<id>/setup`; de spec noemt alleen de dashboardweergave. Zonder die redirect is de gate cosmetisch.
6. `buildHrReportDownloadRows` blijft bestaan naast de nieuwe `buildReportOverviewRows`, omdat `dashboard/cockpit-index.ts` en zijn test er nog aan hangen. Het opruimen van dat (vermoedelijk dode) pad is een los verify-before-delete-traject.

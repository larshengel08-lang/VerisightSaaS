# Klantsuite 2a: levenscyclus en drempels (blok D + E) — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** De meting heeft een begin, een einde en een herinnering die de klant zelf beheert (sluitdatum en herinneringsdag in de wizard; sluiten, verlengen en herinnering overslaan als echte knoppen met eigen dialogen), en de klant kan niets invullen dat stil een rapport onmogelijk maakt (10 deelnemers in totaal, 5 per afdeling, client én server, met uitleg).

**Architecture:** Alles zit in de Next.js-frontend (`frontend/`). Drie nieuwe pure modules dragen de logica en zijn los testbaar: `lib/campaign-schedule.ts` (sluitdatum- en herinneringsregels, één validator voor client en server), `lib/dashboard/campaign-timeline.ts` (de tijdlijn met datums die op elke kaart van een lopende meting staat) en `lib/dashboard/campaign-extension.ts` (verleng-datumlogica en de drie-keer-grens). De drempels wonen in `lib/response-activation.ts` en worden door wizard, server actions, self-send-config-route en beheerformulier gedeeld. De resolver (`dashboard-state-resolver.ts`) blijft de enige plek die uit data een dashboardstaat afleidt; hij krijgt de tijdlijn, de tellingen en de verleng-status als velden zodat het client-eiland (`dashboard-state-actions.tsx`) domme knoppen en één sluitdialoog rendert. Server actions geven `{ ok, error?, warning? }` terug, nooit een throw voor voorspelbare fouten. Geen schemawijziging: `campaigns.closes_at`, `campaign_delivery_records.reminder_config`/`invited_count`, `campaigns.segment_departments` en `campaign_action_audit_events` bestaan al.

**Tech Stack:** Next.js (App Router, server components + server actions), TypeScript strict, Supabase (`@supabase/ssr`, RLS leidend: `is_org_manager` = owner/member), vitest (source-guard-tests met `readFileSync`, pure-functietests, gemockte Supabase via `vi.mock('@/lib/supabase/server')`).

**Spec:** `docs/superpowers/specs/2026-09-16-klantsuite-design.md`, blok D (par. 4) en blok E (par. 5), plus par. 8 t/m 10 voor zover ze D en E raken. Blok G en H zitten in plan 2b en worden hier niet gebouwd.

**Copyregels (klantzichtbaar):** Nederlands, je/jij, Loep als onderwerp (nooit "ik"), geen em-dashes (`—`) of en-dashes (`–`), geen jargon ("campaign", "respondentimport", "surveylogica"). Fail Loud: geen stille fallbacks; een afgewezen invoer zegt wat er mis is en wat de klant kan doen.

**Regelnummers:** verwijzen naar de stand op `main` (`f28b0a7d`, 16 september). Taken raken deels dezelfde bestanden, dus na de eerste wijziging schuiven nummers op. Gebruik dan het geciteerde ankerfragment (de code die er nu staat), niet het nummer.

**Werkplek:** git worktree `C:\Users\larsh\Desktop\Business\Verisight\.worktrees\klantsuite-2a` op branch `feature/klantsuite-2a` (Task 0). Alle paden hieronder zijn relatief aan die worktree-root; alle `npx`-commando's draaien vanuit `frontend/` in de worktree. **Gotcha's uit plan 1:** `frontend/.env.local` komt niet mee in een worktree (build faalt dan op Resend/Supabase-sleutels), dus kopiëren; `npm run build 2>&1 | tail` maskeert de exitcode, lees de laatste regels; **nooit `git stash`** (de stash-stapel wordt gedeeld met andere worktrees).

**Baselines (main, 16 september):** `npx tsc --noEmit` = 133 fouten; `npx vitest run` = 61 falende tests. Er mogen 0 nieuwe falende tests bijkomen (faalset per testnaam vergelijken, Task 9). Eén test die op main faalt wordt door dit plan groen, omdat hij herschreven wordt: `lib/dashboard/dashboard-state-resolver.test.ts > State 0 — no campaign` (verwachtte nog "voor u klaar" terwijl de code al "voor je klaar" zegt).

> **Attributie:** gebruik in elke commit de Co-Authored-By-regel uit je eigen sessie-instructies; de regel in de commitblokken hieronder is alleen een voorbeeld.

---

## Bestandsoverzicht

**Create**
- `frontend/lib/campaign-schedule.ts` — sluitdatum (standaard +21, min +7, max +90), herinneringskeuze (3/5/7/geen), `validateSchedule` (client én server), `readReminderChoice` (opgeslagen `reminder_config` terug naar de wizardkeuze), `addDays`.
- `frontend/lib/campaign-schedule.test.ts`
- `frontend/lib/dashboard/format-dutch-date.ts` — `formatDutchDate` (verhuist uit de resolver, nu gedeeld).
- `frontend/lib/dashboard/format-dutch-date.test.ts`
- `frontend/lib/dashboard/campaign-timeline.ts` — `buildCampaignTimeline`: start, herinnering, sluit, met datums en status.
- `frontend/lib/dashboard/campaign-timeline.test.ts`
- `frontend/components/dashboard/campaign-timeline.tsx` — de tijdlijn als component (server-safe, geen hooks).
- `frontend/components/dashboard/running-state-card.test.ts` — source-guard: tijdlijn erin, herinneringstekst eruit.
- `frontend/components/dashboard/confirm-dialog.tsx` — eigen dialoog (`role="dialog"`, Escape sluit), vervangt `confirm()`.
- `frontend/components/dashboard/confirm-dialog.test.ts`
- `frontend/lib/dashboard/campaign-extension.ts` — `EXTENSION_DAYS`, `MAX_EXTENSIONS`, `computeExtendedClosesAt`, `canExtendCampaign`, `extensionsLeft`.
- `frontend/lib/dashboard/campaign-extension.test.ts`
- `frontend/app/(dashboard)/dashboard/dashboard-actions.lifecycle.test.ts` — gemockte Supabase-tests voor `extendCampaignAction` en `skipReminderAction`.

**Modify**
- `frontend/lib/response-activation.ts` (+ test) — `MIN_INVITED_TOTAL`, `MIN_INVITED_PER_DEPARTMENT`, `validateInvitedTotal`, `validateDepartmentInvitedCount`.
- `frontend/lib/self-send-comms.ts` (+ test) — `MIN_INVITED_COUNT` weg, drempels uit `response-activation`, ondertekening organisatienaam, scannaam uit de mail, `scanLabel` uit `TemplateArgs`.
- `frontend/app/api/campaigns/[id]/self-send-config/route.ts` — melding uit de gedeelde validator.
- `frontend/components/dashboard/self-send-setup-panel.tsx` — `MIN_INVITED_TOTAL`, geen `scanLabel` meer naar de templates (operatorpaneel; alleen zodat tsc groen blijft).
- `frontend/app/(dashboard)/campaigns/[id]/setup/launch-setup-actions.ts` (+ test) — nieuwe invoer `{ launchDate, invitedCount, closesAt, reminderChoice }`, schrijft `closes_at` en `reminder_config`, geen throw meer.
- `frontend/components/dashboard/setup-wizard-card.tsx` (+ guard-test) — stap 1 met sluitdatum en herinnering en toelichtingen, altijd opent op stap 1, "Terug naar stap 1", bevestigingsdialoog vóór "Ja, verstuurd", checkbox weg, stap 3 met tijdlijn.
- `frontend/components/dashboard/welcome-gate.tsx` — deelt de props-interface van de wizard.
- `frontend/app/(dashboard)/campaigns/[id]/setup/page.tsx` — leest `reminder_config`, geeft `initialClosesAt` en `initialReminderChoice` door.
- `frontend/app/(dashboard)/dashboard/page.tsx` (+ test) en `frontend/app/(dashboard)/campaigns/[id]/page.tsx` — nieuwe wizard-props, `metadata` van het herinneringsevent, telling van verlengingen.
- `frontend/lib/dashboard/dashboard-state-resolver.ts` (+ test) — `timeline`, tellingen, `reportThreshold`, `canExtend`/`extensionsLeft`, expired boven/onder de drempel, eindtoestand met mailto, "Meting sluiten" overal, herinneringskaart met "Geen herinnering versturen" als echte actie.
- `frontend/lib/dashboard/reminder-text.ts` (+ test) — `splitReminderText`; `scanLabel` uit de invoer.
- `frontend/app/(dashboard)/dashboard/dashboard-actions.ts` (+ bestaande source-guard-test) — `extendCampaignAction`, `skipReminderAction`.
- `frontend/components/dashboard/dashboard-state-actions.tsx` (+ test) — knoppen voor alle acties, sluitdialoog, herinnering met onderwerp en bericht apart.
- `frontend/components/dashboard/dashboard-state-card.tsx` — tijdlijn, mailto-CTA, geen dode secundaire spans.
- `frontend/components/dashboard/read-only-state-card.tsx` — tijdlijn (geen knoppen).
- `frontend/components/dashboard/running-state-card.tsx` — tijdlijn, sluitknop via het eiland, geen herinneringstekst op dag één.
- `frontend/components/dashboard/new-campaign-form.tsx` (+ guard-test in `components/dashboard/`) — aantal per afdeling, aantal in de doelgroep, opslag in `segment_departments[].invited_count` en `campaign_delivery_records.invited_count`.
- `docs/testklant.md` — checklist bijgewerkt op de nieuwe wizard en kaarten.

**Bewust niet aangeraakt:** `lib/dashboard/reminder-due.ts` (behandelt elk `send_reminders`-event op of na de vervaldatum al als afgehandeld; het overslaan schrijft precies zo'n event, dus de spec-eis is al waar en wordt in Task 5 alleen met een resolvertest gepind), `lib/campaign-audit.ts` (bestaande action keys volstaan; `metadata` is vrij), `lib/customer-permissions.ts`, `lib/launch-controls.ts` (legacy managed-preview en `normalizeReminderConfig` blijven), `app/(dashboard)/campaigns/[id]/campaign-actions.tsx` en `archive-org-button.tsx`/`delete-org-button.tsx` (operatorknoppen met `confirm()`; de spec-guard gaat over klantcomponenten), `app/(dashboard)/beheer/new-campaign-form.guard.test.ts` (faalt al op main op `Rapport-add-ons`; die secties blijven ongewijzigd), de dubbele rapportkaart, `/help`, organisatienaam in de kop, responsive wizard (blok G/H, plan 2b).

---

### Task 0: Worktree, dependencies en baseline vastleggen

**Files:** geen codewijziging.

- [ ] **Step 1: Worktree aanmaken vanaf main en `.env.local` kopiëren**

Run (vanuit de hoofdrepo):
```bash
cd /c/Users/larsh/Desktop/Business/Verisight
git status --short | grep -v '^??' ; echo "---"
git worktree add .worktrees/klantsuite-2a -b feature/klantsuite-2a main
git -C .worktrees/klantsuite-2a log --oneline -1
cp frontend/.env.local .worktrees/klantsuite-2a/frontend/.env.local
ls .worktrees/klantsuite-2a/frontend/.env.local
```
Expected: `git status` toont alleen `??`-regels (untracked docs), geen gewijzigde tracked bestanden; `git worktree add` meldt `Preparing worktree (new branch 'feature/klantsuite-2a')`; de log-regel toont `f28b0a7d`; `ls` toont het gekopieerde `.env.local` (gitignored, komt nooit in een commit).

- [ ] **Step 2: Dependencies installeren in de worktree**

`npm ci` weigert door een bekende lockfile-mismatch; gebruik `npm install` en zet het lockfile daarna terug.

Run:
```bash
cd /c/Users/larsh/Desktop/Business/Verisight/.worktrees/klantsuite-2a/frontend
npm install
git checkout -- package-lock.json
git status --short
```
Expected: `npm install` eindigt zonder `ERR!`; `git status --short` is leeg.

- [ ] **Step 3: Baselines vastleggen (tsc en faalset per testnaam)**

Run:
```bash
cd /c/Users/larsh/Desktop/Business/Verisight/.worktrees/klantsuite-2a/frontend
mkdir -p /c/Users/larsh/AppData/Local/Temp/loep-klantsuite-2a
npx tsc --noEmit 2>&1 | grep -c "error TS"
npx vitest run --reporter=json --outputFile=/c/Users/larsh/AppData/Local/Temp/loep-klantsuite-2a/vitest-baseline.json >/dev/null 2>&1
node -e "const r=require('/c/Users/larsh/AppData/Local/Temp/loep-klantsuite-2a/vitest-baseline.json');const f=[];for(const s of r.testResults)for(const t of s.assertionResults)if(t.status==='failed')f.push(s.name.replace(/\\\\/g,'/').split('/frontend/')[1]+' > '+t.fullName);console.log(f.sort().join('\n'))" > /c/Users/larsh/AppData/Local/Temp/loep-klantsuite-2a/baseline-fails.txt
wc -l < /c/Users/larsh/AppData/Local/Temp/loep-klantsuite-2a/baseline-fails.txt
```
Expected: `133` (tsc) en `61` (falende tests). Wijkt een getal af (de suite is licht wisselvallig: `app/(dashboard)/beheer/health/page.test.ts` laadt af en toe niet), draai de vitest-regel opnieuw en vergelijk namen, niet het getal. Het getal dat je vastlegt is de baseline voor Task 9.

---

### Task 1: Eén set drempels (10 totaal, 5 per afdeling) in wizard, server actions en self-send-config

**Files:**
- Modify: `frontend/lib/response-activation.ts:6` (na `export const CULTURE_ASSESSMENT_INSIGHT_THRESHOLD = 30`)
- Modify: `frontend/lib/self-send-comms.ts:4-7, 63-69, 154-189`
- Modify: `frontend/app/api/campaigns/[id]/self-send-config/route.ts:3-10, 92-97`
- Modify: `frontend/components/dashboard/self-send-setup-panel.tsx:6-19, 202, 209`
- Modify: `frontend/app/(dashboard)/campaigns/[id]/setup/launch-setup-actions.ts:3, 47`
- Modify: `frontend/components/dashboard/setup-wizard-card.tsx:5, 178`
- Test: `frontend/lib/response-activation.test.ts`
- Test: `frontend/lib/self-send-comms.test.ts:1-30, 195-201`
- Test: `frontend/app/(dashboard)/campaigns/[id]/setup/launch-setup-actions.test.ts:66-74`

- [ ] **Step 1: Falende tests voor de drempels en de validators**

Breid de import in `frontend/lib/response-activation.test.ts` (regels 2-9) uit tot:

```ts
import {
  CULTURE_ASSESSMENT_DASHBOARD_THRESHOLD,
  CULTURE_ASSESSMENT_INSIGHT_THRESHOLD,
  FIRST_DASHBOARD_THRESHOLD,
  FIRST_INSIGHT_THRESHOLD,
  MIN_INVITED_PER_DEPARTMENT,
  MIN_INVITED_TOTAL,
  buildResponseActivationState,
  isReportReleaseReady,
  validateDepartmentInvitedCount,
  validateInvitedTotal,
} from '@/lib/response-activation'
```

Zet onderaan het bestand:

```ts
describe('drempels voor uitgenodigden (spec 2026-09-16 par. 5.1)', () => {
  it('MIN_INVITED_TOTAL is de rapportdrempel en MIN_INVITED_PER_DEPARTMENT spiegelt MIN_SEGMENT_N', () => {
    expect(MIN_INVITED_TOTAL).toBe(FIRST_INSIGHT_THRESHOLD)
    expect(MIN_INVITED_TOTAL).toBe(10)
    expect(MIN_INVITED_PER_DEPARTMENT).toBe(5)
  })

  it('validateInvitedTotal wijst onder de 10 af met de klantmelding en accepteert 10', () => {
    expect(validateInvitedTotal(9)).toBe(
      'Vul minimaal 10 deelnemers in. Onder de 10 ingevulde vragenlijsten maakt Loep geen rapport.',
    )
    expect(validateInvitedTotal(3)).toContain('minimaal 10')
    expect(validateInvitedTotal(10)).toBeNull()
    expect(validateInvitedTotal(180)).toBeNull()
  })

  it('validateInvitedTotal wijst lege, niet-gehele en onbruikbare waarden af', () => {
    expect(validateInvitedTotal('')).not.toBeNull()
    expect(validateInvitedTotal(null)).not.toBeNull()
    expect(validateInvitedTotal(10.5)).not.toBeNull()
    expect(validateInvitedTotal(Number.NaN)).not.toBeNull()
    expect(validateInvitedTotal('12')).toBeNull()
  })

  it('validateDepartmentInvitedCount noemt de afdeling en de samenvoegregel', () => {
    expect(validateDepartmentInvitedCount('Zorg', 4)).toBe(
      "Afdeling Zorg: minimaal 5 deelnemers. Kleinere afdelingen voeg je samen; anders vallen ze in het rapport onder 'Overige afdelingen'.",
    )
    expect(validateDepartmentInvitedCount('Zorg', 5)).toBeNull()
    expect(validateDepartmentInvitedCount('  ', 0)).toContain('Afdeling zonder naam')
  })

  it('de meldingen bevatten geen em- of en-dashes', () => {
    expect(validateInvitedTotal(1)).not.toMatch(/[—–]/)
    expect(validateDepartmentInvitedCount('Zorg', 1)).not.toMatch(/[—–]/)
  })
})
```

Pas `frontend/lib/self-send-comms.test.ts` aan. Vervang de import (regels 1-17) door:

```ts
import { describe, expect, it } from 'vitest'
import { MIN_INVITED_TOTAL } from '@/lib/response-activation'
import * as comms from './self-send-comms'
import {
  buildSurveyLink,
  buildInviteTemplate,
  buildReminderTemplate,
  buildSegmentDepartments,
  buildSegmentSurveyLinks,
  computeResponseRatePct,
  createDefaultSelfSendConfig,
  formatDepartmentProgress,
  getDueReminders,
  normalizeSelfSendConfig,
  prepareSegmentDepartmentsUpdate,
  resolveReminderDate,
  validateInvitedCount,
} from './self-send-comms'
```

Vervang de test `rejects invited counts below the minimum` (regels 26-30) door:

```ts
  it('wijst uitgenodigde aantallen onder MIN_INVITED_TOTAL af met de klantmelding (spec 2026-09-16 par. 5.1)', () => {
    expect(validateInvitedCount(9)).toEqual([
      'Vul minimaal 10 deelnemers in. Onder de 10 ingevulde vragenlijsten maakt Loep geen rapport.',
    ])
    expect(validateInvitedCount(MIN_INVITED_TOTAL)).toHaveLength(0)
    expect(validateInvitedCount(34)).toHaveLength(0)
  })

  it('kent geen eigen MIN_INVITED_COUNT meer: de drempel woont in response-activation', () => {
    expect((comms as Record<string, unknown>).MIN_INVITED_COUNT).toBeUndefined()
  })
```

Vervang de test `eist een positief aantal per afdeling` (regels 195-201) door:

```ts
  it('eist minimaal 5 per afdeling en noemt de afdeling in de melding', () => {
    expect(() =>
      prepareSegmentDepartmentsUpdate(existing,
        [{ label: 'Sales', invited_count: 4 }, { label: 'Ops', invited_count: 5 }],
        new Set()),
    ).toThrow(/Afdeling Sales: minimaal 5 deelnemers/)
  })
```

Pas in `frontend/app/(dashboard)/campaigns/[id]/setup/launch-setup-actions.test.ts` de twee tests op regels 66-74 aan (nog met de bestaande signatuur van drie argumenten; Task 2 herschrijft dit bestand volledig):

```ts
  it('wijst een aantal onder MIN_INVITED_TOTAL af met de klantmelding', async () => {
    const result = await saveLaunchSetupAction('campaign-1', '2026-07-01', 0)
    expect(result).toEqual({
      ok: false,
      error: 'Vul minimaal 10 deelnemers in. Onder de 10 ingevulde vragenlijsten maakt Loep geen rapport.',
    })
  })

  it('wijst een negatief aantal af', async () => {
    const result = await saveLaunchSetupAction('campaign-1', '2026-07-01', -5)
    expect(result.ok).toBe(false)
    expect(result.error).toContain('minimaal 10')
  })
```

- [ ] **Step 2: Run de tests om te zien dat ze falen**

Run:
```bash
cd /c/Users/larsh/Desktop/Business/Verisight/.worktrees/klantsuite-2a/frontend
npx vitest run lib/response-activation.test.ts lib/self-send-comms.test.ts "app/(dashboard)/campaigns/[id]/setup/launch-setup-actions.test.ts" 2>&1 | tail -30
```
Expected: FAIL. `response-activation.test.ts` faalt bij het laden (`MIN_INVITED_TOTAL` is geen export), `self-send-comms.test.ts` faalt op de nieuwe melding en op `MIN_INVITED_COUNT` (bestaat nog), de launch-tests falen op `'Aantal deelnemers moet minimaal 1 zijn.'`.

- [ ] **Step 3: Drempels en validators in `response-activation.ts`**

Voeg in `frontend/lib/response-activation.ts` direct na regel 6 (`export const CULTURE_ASSESSMENT_INSIGHT_THRESHOLD = 30`) toe:

```ts

/**
 * Eén set drempels voor het aantal uitgenodigden (spec 2026-09-16 par. 5.1).
 * MIN_INVITED_TOTAL is gelijk aan de rapportdrempel: onder de 10 ingevulde
 * vragenlijsten maakt Loep geen rapport, dus minder dan 10 uitnodigen kan nooit
 * een rapport opleveren. MIN_INVITED_PER_DEPARTMENT spiegelt MIN_SEGMENT_N in
 * backend/scoring_config.py (regel 54); bij aanpassing beide kanten bijwerken.
 */
export const MIN_INVITED_TOTAL = FIRST_INSIGHT_THRESHOLD
export const MIN_INVITED_PER_DEPARTMENT = 5

function toInteger(value: unknown): number {
  const n = typeof value === 'number' ? value : Number(value)
  return Number.isInteger(n) ? n : Number.NaN
}

/** Null als het totaal voldoet; anders de melding voor de klant. */
export function validateInvitedTotal(value: unknown): string | null {
  const n = toInteger(value)
  if (Number.isNaN(n) || n < MIN_INVITED_TOTAL) {
    return `Vul minimaal ${MIN_INVITED_TOTAL} deelnemers in. Onder de ${MIN_INVITED_TOTAL} ingevulde vragenlijsten maakt Loep geen rapport.`
  }
  return null
}

/** Null als de afdeling voldoet; anders de melding voor de klant, met de afdelingsnaam erin. */
export function validateDepartmentInvitedCount(label: string, value: unknown): string | null {
  const n = toInteger(value)
  if (Number.isNaN(n) || n < MIN_INVITED_PER_DEPARTMENT) {
    const name = label.trim() || 'zonder naam'
    return `Afdeling ${name}: minimaal ${MIN_INVITED_PER_DEPARTMENT} deelnemers. Kleinere afdelingen voeg je samen; anders vallen ze in het rapport onder 'Overige afdelingen'.`
  }
  return null
}
```

- [ ] **Step 4: `self-send-comms.ts` gebruikt de gedeelde drempels**

Vervang regels 4-7 van `frontend/lib/self-send-comms.ts`:

```ts
import { SURVEY_DURATION_LABEL } from '@/lib/campaign-setup'
import type { ScanType } from '@/lib/types'

export const MIN_INVITED_COUNT = 5
```

door:

```ts
import { SURVEY_DURATION_LABEL } from '@/lib/campaign-setup'
import { validateDepartmentInvitedCount, validateInvitedTotal } from '@/lib/response-activation'
import type { ScanType } from '@/lib/types'
```

Vervang `validateInvitedCount` (regels 63-69):

```ts
export function validateInvitedCount(value: unknown): string[] {
  const n = typeof value === 'number' ? value : Number(value)
  if (!Number.isInteger(n) || n < MIN_INVITED_COUNT) {
    return [`Aantal uitgenodigde deelnemers moet minimaal ${MIN_INVITED_COUNT} zijn.`]
  }
  return []
}
```

door:

```ts
// Drempel en melding komen uit response-activation.ts (spec 2026-09-16 par. 5.1);
// deze wrapper blijft voor aanroepers die een lijst met fouten verwachten.
export function validateInvitedCount(value: unknown): string[] {
  const error = validateInvitedTotal(value)
  return error ? [error] : []
}
```

Vervang in `prepareSegmentDepartmentsUpdate` de lus (regels 160-164):

```ts
  for (const item of incoming) {
    if (!Number.isInteger(item.invited_count) || item.invited_count < 1) {
      throw new Error(`Vul een geldig aantal deelnemers in voor '${(item.label ?? '').trim() || '?'}' (minimaal 1).`)
    }
  }
```

door:

```ts
  for (const item of incoming) {
    const error = validateDepartmentInvitedCount(item.label ?? '', item.invited_count)
    if (error) throw new Error(error)
  }
```

en het slot (regels 185-188):

```ts
  return {
    departments,
    totalInvited: departments.reduce((sum, d) => sum + d.invited_count, 0),
  }
```

door:

```ts
  const totalInvited = departments.reduce((sum, d) => sum + d.invited_count, 0)
  // Met minimaal 2 afdelingen van elk minimaal 5 is dit vandaag altijd waar;
  // de check staat er zodat een toekomstige wijziging van één drempel de
  // andere niet stil ondergraaft.
  const totalError = validateInvitedTotal(totalInvited)
  if (totalError) throw new Error(totalError)
  return { departments, totalInvited }
```

- [ ] **Step 5: Self-send-config-route en operatorpaneel**

In `frontend/app/api/campaigns/[id]/self-send-config/route.ts` vervang de import (regels 3-10):

```ts
import {
  MIN_INVITED_COUNT,
  normalizeSelfSendConfig,
  normalizeSelfSendReminders,
  validateInvitedCount,
  type SelfSendConfig,
  type SelfSendReminder,
} from '@/lib/self-send-comms'
```

door:

```ts
import {
  normalizeSelfSendConfig,
  normalizeSelfSendReminders,
  validateInvitedCount,
  type SelfSendConfig,
  type SelfSendReminder,
} from '@/lib/self-send-comms'
```

en de else-tak (regels 92-97):

```ts
  } else if (nextInvitedCount !== null && validateInvitedCount(nextInvitedCount).length > 0) {
    return NextResponse.json(
      { detail: `Aantal uitgenodigde deelnemers moet minimaal ${MIN_INVITED_COUNT} zijn.` },
      { status: 400 },
    )
  }
```

door:

```ts
  } else if (nextInvitedCount !== null) {
    const errors = validateInvitedCount(nextInvitedCount)
    if (errors.length > 0) {
      return NextResponse.json({ detail: errors.join(' ') }, { status: 400 })
    }
  }
```

In `frontend/components/dashboard/self-send-setup-panel.tsx` haal `MIN_INVITED_COUNT,` uit de import van `@/lib/self-send-comms` (regel 7) en voeg direct onder die import toe:

```ts
import { MIN_INVITED_TOTAL } from '@/lib/response-activation'
```

Vervang op regel 202 `min={MIN_INVITED_COUNT}` door `min={MIN_INVITED_TOTAL}` en op regel 209 `Minimaal {MIN_INVITED_COUNT}.` door `Minimaal {MIN_INVITED_TOTAL}.`.

- [ ] **Step 6: Server action en wizard gebruiken `validateInvitedTotal`**

In `frontend/app/(dashboard)/campaigns/[id]/setup/launch-setup-actions.ts` voeg na regel 3 (`import { createClient } from '@/lib/supabase/server'`) toe:

```ts
import { validateInvitedTotal } from '@/lib/response-activation'
```

en vervang regel 47:

```ts
  if (!invitedCount || invitedCount < 1) return { ok: false, error: 'Aantal deelnemers moet minimaal 1 zijn.' }
```

door:

```ts
  const invitedError = validateInvitedTotal(invitedCount)
  if (invitedError) return { ok: false, error: invitedError }
```

In `frontend/components/dashboard/setup-wizard-card.tsx` voeg na regel 5 (`import { SCAN_TYPE_LABELS, type ScanType } from '@/lib/types'`) toe:

```ts
import { validateInvitedTotal } from '@/lib/response-activation'
```

en vervang regel 178:

```ts
    if (!invitedCount || Number(invitedCount) < 1) { setStep1Error('Vul het aantal deelnemers in (minimaal 1).'); return }
```

door:

```ts
    const invitedError = validateInvitedTotal(invitedCount)
    if (invitedError) { setStep1Error(invitedError); return }
```

- [ ] **Step 7: Run de tests en tsc**

Run:
```bash
cd /c/Users/larsh/Desktop/Business/Verisight/.worktrees/klantsuite-2a/frontend
npx vitest run lib/response-activation.test.ts lib/self-send-comms.test.ts "app/(dashboard)/campaigns/[id]/setup/launch-setup-actions.test.ts" 2>&1 | tail -15
npx tsc --noEmit 2>&1 | grep -c "error TS"
grep -rn "MIN_INVITED_COUNT" app components lib
```
Expected: alle drie de testbestanden PASS; tsc `133`; de grep geeft geen enkele regel.

- [ ] **Step 8: Commit**

```bash
cd /c/Users/larsh/Desktop/Business/Verisight/.worktrees/klantsuite-2a
git add frontend/lib/response-activation.ts frontend/lib/response-activation.test.ts frontend/lib/self-send-comms.ts frontend/lib/self-send-comms.test.ts "frontend/app/api/campaigns/[id]/self-send-config/route.ts" frontend/components/dashboard/self-send-setup-panel.tsx "frontend/app/(dashboard)/campaigns/[id]/setup/launch-setup-actions.ts" "frontend/app/(dashboard)/campaigns/[id]/setup/launch-setup-actions.test.ts" frontend/components/dashboard/setup-wizard-card.tsx
git commit -m "feat(drempels): 10 deelnemers totaal en 5 per afdeling, één bron voor wizard, actions en self-send-config

MIN_INVITED_COUNT (5) vervalt; MIN_INVITED_TOTAL = rapportdrempel (10) en
MIN_INVITED_PER_DEPARTMENT (5, spiegel van MIN_SEGMENT_N) wonen in
response-activation.ts met de klantmeldingen erbij.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

### Task 2: Wizard stap 1 krijgt sluitdatum en herinnering; `saveLaunchSetupAction` slaat ze op

**Files:**
- Create: `frontend/lib/dashboard/format-dutch-date.ts`
- Create: `frontend/lib/dashboard/format-dutch-date.test.ts`
- Create: `frontend/lib/campaign-schedule.ts`
- Create: `frontend/lib/campaign-schedule.test.ts`
- Modify: `frontend/app/(dashboard)/campaigns/[id]/setup/launch-setup-actions.ts` (volledig)
- Modify: `frontend/app/(dashboard)/campaigns/[id]/setup/launch-setup-actions.test.ts` (volledig)
- Modify: `frontend/components/dashboard/setup-wizard-card.tsx` (volledig)
- Modify: `frontend/components/dashboard/setup-wizard-card.guard.test.ts` (volledig)
- Modify: `frontend/components/dashboard/welcome-gate.tsx:1-18`
- Modify: `frontend/app/(dashboard)/campaigns/[id]/setup/page.tsx:1-3, 24, 75-87`
- Modify: `frontend/app/(dashboard)/dashboard/page.tsx:8, 175-187`
- Modify: `frontend/app/(dashboard)/campaigns/[id]/page.tsx:10, 171-183`

- [ ] **Step 1: Falende tests voor `formatDutchDate` en `campaign-schedule`**

Maak `frontend/lib/dashboard/format-dutch-date.test.ts`:

```ts
import { describe, expect, it } from 'vitest'
import { formatDutchDate } from './format-dutch-date'

describe('formatDutchDate', () => {
  it('formatteert een YYYY-MM-DD als Nederlandse datum', () => {
    expect(formatDutchDate('2026-09-21')).toBe('21 september 2026')
  })

  it('formatteert een volledige ISO-timestamp in Nederlandse tijd', () => {
    expect(formatDutchDate('2026-08-27T22:30:00Z')).toBe('28 augustus 2026')
  })

  it('geeft null bij lege of onleesbare invoer, nooit een lege string', () => {
    expect(formatDutchDate(null)).toBeNull()
    expect(formatDutchDate(undefined)).toBeNull()
    expect(formatDutchDate('')).toBeNull()
    expect(formatDutchDate('nooit')).toBeNull()
  })
})
```

Maak `frontend/lib/campaign-schedule.test.ts`:

```ts
import { describe, expect, it } from 'vitest'
import {
  CLOSE_DEFAULT_DAYS,
  CLOSE_MAX_DAYS,
  CLOSE_MIN_DAYS,
  DEFAULT_REMINDER_AFTER_DAYS,
  REMINDER_CHOICES,
  addDays,
  defaultClosesAt,
  isDateOnly,
  readReminderChoice,
  reminderConfigFromChoice,
  validateSchedule,
} from './campaign-schedule'

const TODAY = '2026-09-16'

describe('campaign-schedule constanten (spec 2026-09-16 par. 4.1)', () => {
  it('sluitdatum standaard +21, minimaal +7, maximaal +90; herinnering standaard 5', () => {
    expect(CLOSE_DEFAULT_DAYS).toBe(21)
    expect(CLOSE_MIN_DAYS).toBe(7)
    expect(CLOSE_MAX_DAYS).toBe(90)
    expect(DEFAULT_REMINDER_AFTER_DAYS).toBe(5)
    expect(REMINDER_CHOICES.map((c) => c.value)).toEqual([3, 5, 7, 'none'])
  })
})

describe('addDays / defaultClosesAt / isDateOnly', () => {
  it('telt dagen op over een maandgrens', () => {
    expect(addDays('2026-09-25', 7)).toBe('2026-10-02')
    expect(defaultClosesAt('2026-09-16')).toBe('2026-10-07')
  })

  it('herkent alleen echte datums', () => {
    expect(isDateOnly('2026-09-16')).toBe(true)
    expect(isDateOnly('2026-13-01')).toBe(false)
    expect(isDateOnly('2026-02-30')).toBe(false)
    expect(isDateOnly('16-09-2026')).toBe(false)
    expect(isDateOnly(null)).toBe(false)
  })
})

describe('validateSchedule', () => {
  const valid = { launchDate: '2026-09-20', closesAt: '2026-10-11', reminderChoice: 5 as const, today: TODAY }

  it('accepteert de standaardplanning en levert de reminder_config', () => {
    expect(validateSchedule(valid)).toEqual({
      ok: true,
      value: {
        launchDate: '2026-09-20',
        closesAt: '2026-10-11',
        reminderConfig: { enabled: true, firstReminderAfterDays: 5, maxReminderCount: 1 },
      },
    })
  })

  it('eist een startdatum vanaf vandaag, in het Nederlands', () => {
    expect(validateSchedule({ ...valid, launchDate: '' })).toEqual({ ok: false, error: 'Vul een startdatum in.' })
    expect(validateSchedule({ ...valid, launchDate: '2026-09-15' })).toEqual({ ok: false, error: 'Kies een startdatum vanaf vandaag.' })
    expect(validateSchedule({ ...valid, launchDate: TODAY, closesAt: '2026-10-07' }).ok).toBe(true)
    expect(validateSchedule({ ...valid, launchDate: 'gisteren' })).toEqual({ ok: false, error: 'De startdatum is geen geldige datum.' })
  })

  it('houdt de sluitdatum tussen start + 7 en start + 90 en noemt de grens als datum', () => {
    expect(validateSchedule({ ...valid, closesAt: '' })).toEqual({ ok: false, error: 'Vul een sluitdatum in.' })
    expect(validateSchedule({ ...valid, closesAt: '2026-09-26' })).toEqual({
      ok: false,
      error: 'Kies een sluitdatum van minimaal 7 dagen na de start, dus op of na 27 september 2026.',
    })
    expect(validateSchedule({ ...valid, closesAt: '2026-09-27', reminderChoice: 3 }).ok).toBe(true)
    expect(validateSchedule({ ...valid, closesAt: '2026-12-19' }).ok).toBe(true)
    expect(validateSchedule({ ...valid, closesAt: '2026-12-20' })).toEqual({
      ok: false,
      error: 'Kies een sluitdatum van uiterlijk 90 dagen na de start, dus op of voor 19 december 2026.',
    })
  })

  it('eist dat de herinnering voor de sluitdatum valt', () => {
    expect(validateSchedule({ ...valid, closesAt: '2026-09-27', reminderChoice: 7 })).toEqual({
      ok: false,
      error: 'De herinnering valt op of na de sluitdatum. Kies een eerdere herinnering of een latere sluitdatum.',
    })
    expect(validateSchedule({ ...valid, closesAt: '2026-09-27', reminderChoice: 'none' }).ok).toBe(true)
  })

  it('zet "geen herinnering" om naar enabled: false met de standaardvertraging', () => {
    const result = validateSchedule({ ...valid, reminderChoice: 'none' })
    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.value.reminderConfig).toEqual({ enabled: false, firstReminderAfterDays: 5, maxReminderCount: 1 })
    }
  })

  it('wijst een onbekende herinneringskeuze af (de server vertrouwt de client niet)', () => {
    const result = validateSchedule({ ...valid, reminderChoice: 4 as unknown as 5 })
    expect(result).toEqual({ ok: false, error: 'Kies een herinnering van 3, 5 of 7 dagen na de start, of geen herinnering.' })
  })

  it('bevat geen em- of en-dashes in de meldingen', () => {
    const results = [
      validateSchedule({ ...valid, closesAt: '2026-09-26' }),
      validateSchedule({ ...valid, closesAt: '2026-12-20' }),
      validateSchedule({ ...valid, closesAt: '2026-09-27', reminderChoice: 7 }),
    ]
    for (const r of results) {
      expect(r.ok).toBe(false)
      if (!r.ok) expect(r.error).not.toMatch(/[—–]/)
    }
  })
})

describe('readReminderChoice / reminderConfigFromChoice', () => {
  it('geeft null als er nooit iets is opgeslagen (kolomdefault {} of null)', () => {
    expect(readReminderChoice(null)).toBeNull()
    expect(readReminderChoice({})).toBeNull()
    expect(readReminderChoice('x')).toBeNull()
  })

  it('leest een opgeslagen keuze terug', () => {
    expect(readReminderChoice({ enabled: true, firstReminderAfterDays: 7, maxReminderCount: 1 })).toBe(7)
    expect(readReminderChoice({ enabled: false, firstReminderAfterDays: 5, maxReminderCount: 1 })).toBe('none')
    expect(readReminderChoice({ enabled: true, firstReminderAfterDays: 99 })).toBe(5)
  })

  it('is de inverse van reminderConfigFromChoice', () => {
    for (const choice of [3, 5, 7, 'none'] as const) {
      expect(readReminderChoice(reminderConfigFromChoice(choice))).toBe(choice)
    }
  })
})
```

- [ ] **Step 2: Run om te zien dat ze falen**

Run:
```bash
cd /c/Users/larsh/Desktop/Business/Verisight/.worktrees/klantsuite-2a/frontend
npx vitest run lib/dashboard/format-dutch-date.test.ts lib/campaign-schedule.test.ts 2>&1 | tail -8
```
Expected: FAIL, beide bestanden kunnen hun module niet vinden.

- [ ] **Step 3: `format-dutch-date.ts` en `campaign-schedule.ts`**

Maak `frontend/lib/dashboard/format-dutch-date.ts`:

```ts
/**
 * Datum zoals de klant hem leest: "21 september 2026". Accepteert YYYY-MM-DD
 * (kolom `campaigns.closes_at` is een date) en een volledige ISO-timestamp
 * (bijv. `closed_at`, auditevents). Null bij lege of onleesbare invoer, zodat
 * de aanroeper eerlijk "onbekend" kan tonen in plaats van een lege string.
 */
export function formatDutchDate(iso: string | null | undefined): string | null {
  if (!iso) return null
  const date = new Date(iso.length === 10 ? `${iso}T00:00:00Z` : iso)
  if (Number.isNaN(date.getTime())) return null
  return new Intl.DateTimeFormat('nl-NL', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'Europe/Amsterdam',
  }).format(date)
}
```

Maak `frontend/lib/campaign-schedule.ts`:

```ts
import {
  REMINDER_DELAY_PRESETS,
  type ReminderConfig,
  type ReminderDelayPreset,
} from '@/lib/launch-controls'
import { formatDutchDate } from '@/lib/dashboard/format-dutch-date'

/**
 * Planning van een meting zoals de klant die in stap 1 van de wizard instelt
 * (spec 2026-09-16 par. 4.1). Eén validator voor client en server: de wizard
 * geeft dezelfde melding als saveLaunchSetupAction, en de server vertrouwt
 * de client niet.
 */
export const CLOSE_DEFAULT_DAYS = 21
export const CLOSE_MIN_DAYS = 7
export const CLOSE_MAX_DAYS = 90
export const DEFAULT_REMINDER_AFTER_DAYS: ReminderDelayPreset = 5

/** Keuze in de wizard: 3, 5 of 7 dagen na de start, of geen herinnering. */
export type ReminderChoice = ReminderDelayPreset | 'none'

export const REMINDER_CHOICES: ReadonlyArray<{ value: ReminderChoice; label: string }> = [
  { value: 3, label: '3 dagen na de start' },
  { value: 5, label: '5 dagen na de start' },
  { value: 7, label: '7 dagen na de start' },
  { value: 'none', label: 'Geen herinnering' },
]

const DATE_ONLY = /^\d{4}-\d{2}-\d{2}$/

export function isDateOnly(value: unknown): value is string {
  if (typeof value !== 'string' || !DATE_ONLY.test(value)) return false
  const date = new Date(`${value}T00:00:00Z`)
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value
}

export function addDays(isoDate: string, days: number): string {
  const date = new Date(`${isoDate}T00:00:00Z`)
  date.setUTCDate(date.getUTCDate() + days)
  return date.toISOString().slice(0, 10)
}

export function defaultClosesAt(launchDate: string): string {
  return addDays(launchDate, CLOSE_DEFAULT_DAYS)
}

export function minClosesAt(launchDate: string): string {
  return addDays(launchDate, CLOSE_MIN_DAYS)
}

export function maxClosesAt(launchDate: string): string {
  return addDays(launchDate, CLOSE_MAX_DAYS)
}

export function isReminderChoice(value: unknown): value is ReminderChoice {
  return value === 'none' || REMINDER_DELAY_PRESETS.some((preset) => preset === value)
}

/** Opslagvorm in campaign_delivery_records.reminder_config (spec par. 4.1). */
export function reminderConfigFromChoice(choice: ReminderChoice): ReminderConfig {
  return {
    enabled: choice !== 'none',
    firstReminderAfterDays: choice === 'none' ? DEFAULT_REMINDER_AFTER_DAYS : choice,
    maxReminderCount: 1,
  }
}

/**
 * Leest een opgeslagen reminder_config terug naar de wizardkeuze. Null als er
 * nog nooit iets is opgeslagen (de kolom heeft '{}' als default), zodat de
 * wizard de standaard (5 dagen) voorstelt in plaats van te doen alsof de klant
 * al gekozen heeft.
 */
export function readReminderChoice(value: unknown): ReminderChoice | null {
  if (!value || typeof value !== 'object' || !('enabled' in value)) return null
  const config = value as Partial<ReminderConfig>
  if (config.enabled === false) return 'none'
  const preset = REMINDER_DELAY_PRESETS.find((p) => p === config.firstReminderAfterDays)
  return preset ?? DEFAULT_REMINDER_AFTER_DAYS
}

export interface ScheduleInput {
  launchDate: string
  closesAt: string
  reminderChoice: ReminderChoice
  /** YYYY-MM-DD; wordt meegegeven zodat tests deterministisch zijn. */
  today: string
}

export interface ValidSchedule {
  launchDate: string
  closesAt: string
  reminderConfig: ReminderConfig
}

export type ScheduleValidation = { ok: true; value: ValidSchedule } | { ok: false; error: string }

export function validateSchedule(input: ScheduleInput): ScheduleValidation {
  const fail = (error: string): ScheduleValidation => ({ ok: false, error })

  if (!input.launchDate) return fail('Vul een startdatum in.')
  if (!isDateOnly(input.launchDate)) return fail('De startdatum is geen geldige datum.')
  if (input.launchDate < input.today) return fail('Kies een startdatum vanaf vandaag.')

  if (!input.closesAt) return fail('Vul een sluitdatum in.')
  if (!isDateOnly(input.closesAt)) return fail('De sluitdatum is geen geldige datum.')
  const min = minClosesAt(input.launchDate)
  const max = maxClosesAt(input.launchDate)
  if (input.closesAt < min) {
    return fail(`Kies een sluitdatum van minimaal ${CLOSE_MIN_DAYS} dagen na de start, dus op of na ${formatDutchDate(min)}.`)
  }
  if (input.closesAt > max) {
    return fail(`Kies een sluitdatum van uiterlijk ${CLOSE_MAX_DAYS} dagen na de start, dus op of voor ${formatDutchDate(max)}.`)
  }

  if (!isReminderChoice(input.reminderChoice)) {
    return fail('Kies een herinnering van 3, 5 of 7 dagen na de start, of geen herinnering.')
  }
  if (input.reminderChoice !== 'none') {
    const reminderDate = addDays(input.launchDate, input.reminderChoice)
    if (reminderDate >= input.closesAt) {
      return fail('De herinnering valt op of na de sluitdatum. Kies een eerdere herinnering of een latere sluitdatum.')
    }
  }

  return {
    ok: true,
    value: {
      launchDate: input.launchDate,
      closesAt: input.closesAt,
      reminderConfig: reminderConfigFromChoice(input.reminderChoice),
    },
  }
}
```

- [ ] **Step 4: Run de pure tests**

Run:
```bash
cd /c/Users/larsh/Desktop/Business/Verisight/.worktrees/klantsuite-2a/frontend
npx vitest run lib/dashboard/format-dutch-date.test.ts lib/campaign-schedule.test.ts 2>&1 | tail -8
```
Expected: PASS (2 bestanden, 16 tests).

- [ ] **Step 5: Falende test voor `saveLaunchSetupAction` met de nieuwe invoer**

Vervang `frontend/app/(dashboard)/campaigns/[id]/setup/launch-setup-actions.test.ts` volledig door:

```ts
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { addDays } from '@/lib/campaign-schedule'

// Mock must be declared before importing the module under test
let orgMemberRole: string | null = 'owner'
let deliveryUpserts: Array<Record<string, unknown>> = []
let campaignUpdates: Array<Record<string, unknown>> = []
let deliveryUpsertError: { message: string } | null = null
let campaignUpdateError: { message: string } | null = null
let confirmCount = 1

vi.mock('@/lib/supabase/server', () => ({
  createClient: async () => ({
    auth: {
      getUser: async () => ({ data: { user: { id: 'user-1' } } }),
    },
    from: (table: string) => {
      if (table === 'campaigns') {
        return {
          select: () => ({
            eq: () => ({
              single: async () => ({ data: { organization_id: 'org-1' } }),
            }),
          }),
          update: (payload: Record<string, unknown>) => ({
            eq: async () => {
              campaignUpdates.push(payload)
              return { error: campaignUpdateError }
            },
          }),
        }
      }
      if (table === 'profiles') {
        return {
          select: () => ({
            eq: () => ({
              maybeSingle: async () => ({ data: { is_verisight_admin: false } }),
            }),
          }),
        }
      }
      if (table === 'org_members') {
        return {
          select: () => ({
            eq: () => ({
              eq: () => ({
                maybeSingle: async () => ({ data: orgMemberRole ? { role: orgMemberRole } : null }),
              }),
            }),
          }),
        }
      }
      if (table === 'campaign_delivery_records') {
        return {
          upsert: async (payload: Record<string, unknown>) => {
            deliveryUpserts.push(payload)
            return { error: deliveryUpsertError }
          },
          update: (_data: unknown, _opts?: unknown) => ({
            eq: async () => ({ error: null, count: confirmCount }),
          }),
        }
      }
      return {}
    },
  }),
}))

import { confirmLaunchAction, saveLaunchSetupAction, type LaunchSetupInput } from './launch-setup-actions'

const today = new Date().toISOString().slice(0, 10)
const launchDate = addDays(today, 2)

function input(overrides: Partial<LaunchSetupInput> = {}): LaunchSetupInput {
  return {
    launchDate,
    invitedCount: 25,
    closesAt: addDays(launchDate, 21),
    reminderChoice: 5,
    ...overrides,
  }
}

describe('saveLaunchSetupAction (spec 2026-09-16 par. 4.1 en 5.2)', () => {
  beforeEach(() => {
    deliveryUpserts = []
    campaignUpdates = []
    deliveryUpsertError = null
    campaignUpdateError = null
  })
  afterEach(() => {
    orgMemberRole = 'owner'
  })

  it('slaat startdatum, aantal en herinnering op het delivery record op en de sluitdatum op de campagne', async () => {
    const result = await saveLaunchSetupAction('campaign-1', input())
    expect(result).toEqual({ ok: true })
    expect(deliveryUpserts).toEqual([
      {
        campaign_id: 'campaign-1',
        organization_id: 'org-1',
        launch_date: launchDate,
        invited_count: 25,
        reminder_config: { enabled: true, firstReminderAfterDays: 5, maxReminderCount: 1 },
      },
    ])
    expect(campaignUpdates).toEqual([{ closes_at: addDays(launchDate, 21) }])
  })

  it('slaat "geen herinnering" op als enabled: false', async () => {
    await saveLaunchSetupAction('campaign-1', input({ reminderChoice: 'none' }))
    expect(deliveryUpserts[0]?.reminder_config).toEqual({ enabled: false, firstReminderAfterDays: 5, maxReminderCount: 1 })
  })

  it('geeft Nederlandse datumfouten terug in plaats van te gooien', async () => {
    expect(await saveLaunchSetupAction('campaign-1', input({ launchDate: '' }))).toEqual({ ok: false, error: 'Vul een startdatum in.' })
    expect(await saveLaunchSetupAction('campaign-1', input({ launchDate: addDays(today, -1), closesAt: addDays(today, 20) }))).toEqual({
      ok: false,
      error: 'Kies een startdatum vanaf vandaag.',
    })
    expect(await saveLaunchSetupAction('campaign-1', input({ launchDate: 'not-a-date' }))).toEqual({ ok: false, error: 'De startdatum is geen geldige datum.' })
    expect(await saveLaunchSetupAction('campaign-1', input({ closesAt: addDays(launchDate, 6) }))).toMatchObject({ ok: false })
    expect(await saveLaunchSetupAction('campaign-1', input({ closesAt: addDays(launchDate, 7), reminderChoice: 7 }))).toEqual({
      ok: false,
      error: 'De herinnering valt op of na de sluitdatum. Kies een eerdere herinnering of een latere sluitdatum.',
    })
    expect(deliveryUpserts).toHaveLength(0)
  })

  it('wijst minder dan 10 deelnemers af met de klantmelding', async () => {
    const result = await saveLaunchSetupAction('campaign-1', input({ invitedCount: 3 }))
    expect(result).toEqual({
      ok: false,
      error: 'Vul minimaal 10 deelnemers in. Onder de 10 ingevulde vragenlijsten maakt Loep geen rapport.',
    })
    expect(deliveryUpserts).toHaveLength(0)
  })

  it('geeft "Niet gemachtigd" terug voor een viewer i.p.v. te crashen op de RLS-afwijzing (2026-07-08 regressie)', async () => {
    orgMemberRole = 'viewer'
    const result = await saveLaunchSetupAction('campaign-1', input())
    expect(result).toEqual({ ok: false, error: 'Niet gemachtigd.' })
  })

  it('geeft "Niet gemachtigd" terug zonder org_members-record', async () => {
    orgMemberRole = null
    const result = await saveLaunchSetupAction('campaign-1', input())
    expect(result).toEqual({ ok: false, error: 'Niet gemachtigd.' })
  })

  it('meldt een databasefout als resultaat, niet als throw (Fail Loud, spec par. 9)', async () => {
    deliveryUpsertError = { message: 'permission denied' }
    const result = await saveLaunchSetupAction('campaign-1', input())
    expect(result).toEqual({ ok: false, error: 'Opslaan mislukt: permission denied' })
  })

  it('zegt eerlijk wat wel is opgeslagen als alleen de sluitdatum faalt', async () => {
    campaignUpdateError = { message: 'permission denied' }
    const result = await saveLaunchSetupAction('campaign-1', input())
    expect(result.ok).toBe(false)
    expect(result.error).toContain('Startdatum en deelnemers zijn opgeslagen, maar de sluitdatum niet')
  })
})

describe('confirmLaunchAction', () => {
  afterEach(() => {
    orgMemberRole = 'owner'
    confirmCount = 1
  })

  it('returns ok: true for authorized user', async () => {
    const result = await confirmLaunchAction('campaign-1')
    expect(result).toEqual({ ok: true })
  })

  it('geeft "Niet gemachtigd" terug voor een viewer i.p.v. te crashen op de RLS-afwijzing (2026-07-08 regressie)', async () => {
    orgMemberRole = 'viewer'
    const result = await confirmLaunchAction('campaign-1')
    expect(result).toEqual({ ok: false, error: 'Niet gemachtigd.' })
  })

  it('geeft een resultaat terug als er nog geen delivery record is, geen throw', async () => {
    confirmCount = 0
    const result = await confirmLaunchAction('campaign-1')
    expect(result).toEqual({ ok: false, error: 'Sla eerst stap 1 op; er is nog geen startdatum voor deze meting.' })
  })
})
```

- [ ] **Step 6: Run om te zien dat hij faalt**

Run:
```bash
cd /c/Users/larsh/Desktop/Business/Verisight/.worktrees/klantsuite-2a/frontend
npx vitest run "app/(dashboard)/campaigns/[id]/setup/launch-setup-actions.test.ts" 2>&1 | tail -20
```
Expected: FAIL: de actie accepteert nog `(campaignId, launchDate, invitedCount)`, dus `input()` als tweede argument levert `'Ongeldige datum.'` of een runtimefout.

- [ ] **Step 7: `launch-setup-actions.ts` volledig herschrijven**

Vervang `frontend/app/(dashboard)/campaigns/[id]/setup/launch-setup-actions.ts` door:

```ts
'use server'

import { createClient } from '@/lib/supabase/server'
import { validateInvitedTotal } from '@/lib/response-activation'
import { validateSchedule, type ReminderChoice } from '@/lib/campaign-schedule'

export interface ActionResult {
  ok: boolean
  error?: string
}

/** Stap 1 van de wizard (spec 2026-09-16 par. 4.1 en 5.2). */
export interface LaunchSetupInput {
  launchDate: string
  invitedCount: number
  closesAt: string
  reminderChoice: ReminderChoice
}

function todayIso(): string {
  return new Date().toISOString().slice(0, 10)
}

async function getAuthAndMembership(campaignId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { supabase, user: null, campaign: null, authorized: false }

  const { data: campaign } = await supabase
    .from('campaigns')
    .select('organization_id')
    .eq('id', campaignId)
    .single()

  if (!campaign) return { supabase, user, campaign: null, authorized: false }

  const [{ data: profile }, { data: membership }] = await Promise.all([
    supabase.from('profiles').select('is_verisight_admin').eq('id', user.id).maybeSingle(),
    supabase.from('org_members').select('role').eq('org_id', campaign.organization_id).eq('user_id', user.id).maybeSingle(),
  ])

  // Moet in sync blijven met is_org_manager() in schema.sql (owner/member,
  // geen viewer). Anders passeert een viewer deze check terwijl de RLS-
  // insert/update-policy op campaign_delivery_records 'm alsnog blokkeert,
  // wat hier als een onbehandelde 500 naar buiten komt i.p.v. een nette
  // 'Niet gemachtigd'.
  const isManager = membership?.role === 'owner' || membership?.role === 'member'
  const authorized = profile?.is_verisight_admin === true || isManager
  return { supabase, user, campaign, authorized }
}

/**
 * Slaat stap 1 op: startdatum, aantal en herinnering op het delivery record,
 * de sluitdatum op de campagne (RLS org_managers_can_update_campaigns staat
 * de eigenaar dit toe). Validatie spiegelt de wizard; elke voorspelbare fout
 * komt terug als { ok: false, error }, nooit als throw (spec par. 9).
 */
export async function saveLaunchSetupAction(
  campaignId: string,
  input: LaunchSetupInput,
): Promise<ActionResult> {
  const schedule = validateSchedule({
    launchDate: input.launchDate,
    closesAt: input.closesAt,
    reminderChoice: input.reminderChoice,
    today: todayIso(),
  })
  if (!schedule.ok) return { ok: false, error: schedule.error }

  const invitedError = validateInvitedTotal(input.invitedCount)
  if (invitedError) return { ok: false, error: invitedError }

  const { supabase, campaign, authorized } = await getAuthAndMembership(campaignId)
  if (!authorized || !campaign) return { ok: false, error: 'Niet gemachtigd.' }

  const { error: deliveryError } = await supabase
    .from('campaign_delivery_records')
    .upsert(
      {
        campaign_id: campaignId,
        organization_id: campaign.organization_id,
        launch_date: schedule.value.launchDate,
        invited_count: input.invitedCount,
        reminder_config: schedule.value.reminderConfig,
      },
      { onConflict: 'campaign_id' },
    )
  if (deliveryError) return { ok: false, error: `Opslaan mislukt: ${deliveryError.message}` }

  const { error: closesError } = await supabase
    .from('campaigns')
    .update({ closes_at: schedule.value.closesAt })
    .eq('id', campaignId)
  if (closesError) {
    return {
      ok: false,
      error: `Startdatum en deelnemers zijn opgeslagen, maar de sluitdatum niet: ${closesError.message}. Probeer opnieuw.`,
    }
  }

  return { ok: true }
}

export async function confirmLaunchAction(campaignId: string): Promise<ActionResult> {
  const { supabase, authorized } = await getAuthAndMembership(campaignId)
  if (!authorized) return { ok: false, error: 'Niet gemachtigd.' }

  const now = new Date().toISOString()
  const { error, count } = await supabase
    .from('campaign_delivery_records')
    .update({ launch_confirmed_at: now }, { count: 'exact' })
    .eq('campaign_id', campaignId)

  if (error) return { ok: false, error: `Bevestigen mislukt: ${error.message}` }
  if (count === 0) return { ok: false, error: 'Sla eerst stap 1 op; er is nog geen startdatum voor deze meting.' }
  return { ok: true }
}
```

- [ ] **Step 8: Run de action-tests**

Run:
```bash
cd /c/Users/larsh/Desktop/Business/Verisight/.worktrees/klantsuite-2a/frontend
npx vitest run "app/(dashboard)/campaigns/[id]/setup/launch-setup-actions.test.ts" 2>&1 | tail -8
```
Expected: PASS (11 tests). tsc faalt nu op de wizard (die roept de oude signatuur aan); dat lost Step 10 op.

- [ ] **Step 9: Guard-test voor de nieuwe wizard**

Vervang `frontend/components/dashboard/setup-wizard-card.guard.test.ts` volledig door:

```ts
import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

const src = readFileSync(new URL('./setup-wizard-card.tsx', import.meta.url), 'utf8')

describe('setup-wizard afdelingsblok', () => {
  it('toont in segment-modus een blok per afdeling met naam, aantal en kopieerlink', () => {
    expect(src).toContain('saveSegmentDepartmentsAction')
    expect(src).toContain('buildSegmentSurveyLinks')
  })
  it('vergrendelt de naam van afdelingen met responses', () => {
    expect(src).toContain('lockedDepartments')
    expect(src).toMatch(/naam vergrendeld|al responses/i)
  })
  it('toont het automatisch opgetelde totaal', () => {
    expect(src).toMatch(/Totaal deelnemers|totalInvited/)
  })
  it('managet de n>=5-verwachting expliciet (via de gedeelde constante)', () => {
    expect(src).toMatch(/minimaal \$\{MIN_INVITED_PER_DEPARTMENT\}|minimaal 5/)
  })
  it('vraagt het enkelvoudige aantal niet meer in segment-modus', () => {
    expect(src).toMatch(/hasSegments|segmentMode/)
  })
  it('gebruikt de gedeelde uitnodigingstekst in plaats van een eigen kopie', () => {
    expect(src).toContain('buildInviteTemplate')
    expect(src).not.toContain('function buildInviteBody')
    expect(src).not.toContain('const SCAN_WHY')
    expect(src).not.toContain('10-15 minuten')
  })
})

describe('setup-wizard stap 1: planning en drempels (spec 2026-09-16 par. 4.1 en 5.2)', () => {
  it('heeft een sluitdatum- en herinneringsveld en valideert via de gedeelde planningsregels', () => {
    expect(src).toContain('validateSchedule')
    expect(src).toContain('defaultClosesAt')
    expect(src).toContain('REMINDER_CHOICES')
    expect(src).toContain('Sluitdatum')
    expect(src).toContain('Herinnering')
  })

  it('geeft de toelichtingen uit de spec', () => {
    expect(src).toContain('De dag waarop je de uitnodiging verstuurt.')
    expect(src).toContain('Na deze datum kan niemand meer invullen. Drie weken is gebruikelijk; verlengen kan later met twee weken per keer.')
    expect(src).toContain('Op die dag zet Loep de herinneringstekst voor je klaar; jij verstuurt hem vanuit je eigen mail.')
    expect(src).toContain('inclusief parttimers en oproepkrachten')
    expect(src).toContain('niet het hele personeelsbestand')
    expect(src).toContain('Alle nieuwe medewerkers die je in deze ronde uitnodigt.')
  })

  it('dwingt de drempels client-side af met dezelfde helpers als de server', () => {
    expect(src).toContain('validateInvitedTotal')
    expect(src).toContain('validateDepartmentInvitedCount')
    expect(src).not.toContain('minimaal 1)')
  })

  it('laat het formulier de Nederlandse melding geven in plaats van de browsermelding', () => {
    expect(src).toContain('noValidate')
    expect(src).toContain('min={today}')
  })

  it('heeft geen "Link getest"-checkbox meer', () => {
    expect(src).not.toContain('Link getest')
    expect(src).not.toContain('linkTested')
  })

  it('opent altijd op stap 1 zodat de klant tot de lancering kan corrigeren', () => {
    expect(src).toContain('useState<WizardStep>(1)')
  })

  it('bevat geen em- of en-dashes in de UI-copy', () => {
    expect(src).not.toMatch(/[—–]/)
  })
})
```

- [ ] **Step 10: Wizard volledig herschrijven**

Vervang `frontend/components/dashboard/setup-wizard-card.tsx` door:

```tsx
'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { SCAN_TYPE_LABELS, type ScanType } from '@/lib/types'
import {
  MIN_INVITED_PER_DEPARTMENT,
  MIN_INVITED_TOTAL,
  validateDepartmentInvitedCount,
  validateInvitedTotal,
} from '@/lib/response-activation'
import {
  DEFAULT_REMINDER_AFTER_DAYS,
  REMINDER_CHOICES,
  addDays,
  defaultClosesAt,
  isReminderChoice,
  maxClosesAt,
  minClosesAt,
  validateSchedule,
  type ReminderChoice,
} from '@/lib/campaign-schedule'
import { formatDutchDate } from '@/lib/dashboard/format-dutch-date'
import {
  buildInviteTemplate,
  buildSegmentSurveyLinks,
  buildSurveyLink,
  slugify,
  type SegmentDepartmentStored,
} from '@/lib/self-send-comms'
import { saveLaunchSetupAction, confirmLaunchAction } from '@/app/(dashboard)/campaigns/[id]/setup/launch-setup-actions'
import { saveSegmentDepartmentsAction } from '@/app/(dashboard)/campaigns/[id]/setup/segment-actions'

export interface SetupWizardCardProps {
  campaignId: string
  scanType: ScanType
  organizationName: string
  publicSurveyToken: string
  frontendBaseUrl: string
  initialLaunchDate: string | null
  initialInvitedCount: number | null
  /** campaigns.closes_at (date), of null als er nog geen sluitdatum is ingesteld. */
  initialClosesAt: string | null
  /** Uit campaign_delivery_records.reminder_config; null als nog nooit opgeslagen. */
  initialReminderChoice: ReminderChoice | null
  segmentDepartments?: SegmentDepartmentStored[] | null
  departmentResponseCounts?: Record<string, number>
}

type WizardStep = 1 | 2

interface DeptRow {
  label: string
  invitedCount: number | ''
}

const SCAN_TIP: Partial<Record<ScanType, string>> = {
  retention:  'Informeer je team vooraf dat er een korte vragenlijst aankomt. Dat verhoogt de respons aanzienlijk.',
  exit:       'Stuur leidinggevenden vooraf een korte intro. Medewerkers die het verwachten vullen vaker in.',
  onboarding: 'Laat de direct leidinggevende weten dat nieuwe medewerkers een korte vragenlijst ontvangen.',
}

// Toelichting bij "Aantal deelnemers", per scan (spec 2026-09-16 par. 5.2).
const INVITED_COUNT_HELP: Partial<Record<ScanType, string>> = {
  retention:  'Iedereen die je uitnodigt, inclusief parttimers en oproepkrachten. Stagiairs alleen als ze de vragenlijst ook krijgen.',
  exit:       'Het aantal mensen dat in de meetperiode vertrekt en de vragenlijst krijgt, niet het hele personeelsbestand.',
  onboarding: 'Alle nieuwe medewerkers die je in deze ronde uitnodigt.',
}
const DEFAULT_INVITED_COUNT_HELP = 'Iedereen die de vragenlijst van je krijgt.'
const LAUNCH_DATE_HELP = 'De dag waarop je de uitnodiging verstuurt.'
const CLOSES_AT_HELP = 'Na deze datum kan niemand meer invullen. Drie weken is gebruikelijk; verlengen kan later met twee weken per keer.'
const REMINDER_HELP = 'Op die dag zet Loep de herinneringstekst voor je klaar; jij verstuurt hem vanuit je eigen mail.'
const DEPARTMENT_HELP = `Per afdeling zijn minimaal ${MIN_INVITED_PER_DEPARTMENT} ingevulde vragenlijsten nodig om apart in het rapport te verschijnen, en vanaf 10 zie je de spreiding.`

const fieldLabelClass = 'mb-1 block text-xs font-semibold text-white/50'
const helpClass = 'mt-1 text-[10px] leading-relaxed text-white/40'
const inputClass =
  'w-full rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-sm text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-[#E8A020]/50'

export function SetupWizardCard({
  campaignId,
  scanType,
  organizationName,
  publicSurveyToken,
  frontendBaseUrl,
  initialLaunchDate,
  initialInvitedCount,
  initialClosesAt,
  initialReminderChoice,
  segmentDepartments,
  departmentResponseCounts,
}: SetupWizardCardProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  // Segment-modus: de campagne heeft een (evt. lege) afdelingslijst (spec
  // 2026-07-12 par. 1/5). Een lege lijst betekent "modus aan, klant moet nog
  // vullen": geen algemene link wordt dan getoond, wel het afdelingenblok.
  const segmentMode = Boolean(segmentDepartments)

  // Altijd stap 1 (spec 2026-09-16 par. 5.2): tot de lancering kan de klant
  // corrigeren, ook na een herlaad. De opgeslagen waarden staan voorgevuld.
  const [step, setStep] = useState<WizardStep>(1)
  const [launchDate, setLaunchDate] = useState(initialLaunchDate ?? '')
  const [closesAt, setClosesAt] = useState(
    initialClosesAt ?? (initialLaunchDate ? defaultClosesAt(initialLaunchDate) : ''),
  )
  // Zolang de klant de sluitdatum niet zelf heeft aangeraakt, volgt hij de
  // startdatum (start + 21). Daarna blijft de eigen keuze staan.
  const [closesAtTouched, setClosesAtTouched] = useState(Boolean(initialClosesAt))
  const [reminderChoice, setReminderChoice] = useState<ReminderChoice>(
    initialReminderChoice ?? DEFAULT_REMINDER_AFTER_DAYS,
  )
  const [invitedCount, setInvitedCount] = useState<number | ''>(initialInvitedCount ?? '')
  const [step1Error, setStep1Error] = useState<string | null>(null)
  const [step2Error, setStep2Error] = useState<string | null>(null)
  const [copiedSubject, setCopiedSubject] = useState(false)
  const [copiedBody, setCopiedBody] = useState(false)
  const [everCopied, setEverCopied] = useState(false)
  const [copiedDeptSlug, setCopiedDeptSlug] = useState<string | null>(null)

  // Rijen voor het afdelingenblok. Startpunt: bestaande afdelingen, of (als
  // de lijst nog leeg is) twee lege rijen zodat de minimaal-2-eis meteen
  // zichtbaar is.
  const [deptRows, setDeptRows] = useState<DeptRow[]>(() => {
    if (segmentDepartments && segmentDepartments.length > 0) {
      return segmentDepartments.map((d) => ({
        label: d.label,
        invitedCount: d.invited_count ?? '',
      }))
    }
    return [{ label: '', invitedCount: '' }, { label: '', invitedCount: '' }]
  })

  // Afdelingen met >=1 respondent: naam-wijziging/verwijdering niet meer
  // toegestaan, de link is al in omloop (spec 2026-07-12 par. 3).
  const lockedDepartments = new Set(
    Object.keys(departmentResponseCounts ?? {}).filter(
      (label) => (departmentResponseCounts![label] ?? 0) > 0,
    ),
  )

  // Alleen rijen met een ingevulde naam tellen mee: een leeg-genaamde rij
  // wordt bij opslaan niet meegenomen in segment_departments, dus het getoonde
  // totaal moet daarmee overeenkomen.
  const totalInvited = deptRows
    .filter((row) => row.label.trim())
    .reduce((sum, row) => sum + (typeof row.invitedCount === 'number' ? row.invitedCount : 0), 0)

  const surveyLink = buildSurveyLink(frontendBaseUrl, publicSurveyToken)
  const scanLabel = SCAN_TYPE_LABELS[scanType] ?? scanType
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

  const [editableSubject, setEditableSubject] = useState(inviteSubject)
  const [editableBody, setEditableBody] = useState(inviteBody)

  const today = new Date().toISOString().slice(0, 10)
  const tip = SCAN_TIP[scanType]
  const invitedHelp = INVITED_COUNT_HELP[scanType] ?? DEFAULT_INVITED_COUNT_HELP
  const reminderDateLabel =
    reminderChoice !== 'none' && launchDate ? formatDutchDate(addDays(launchDate, reminderChoice)) : null

  function handleLaunchDateChange(value: string) {
    setLaunchDate(value)
    if (!closesAtTouched) setClosesAt(value ? defaultClosesAt(value) : '')
  }

  function handleReminderChange(raw: string) {
    const parsed: unknown = raw === 'none' ? 'none' : Number(raw)
    if (isReminderChoice(parsed)) setReminderChoice(parsed)
  }

  function updateDeptRow(index: number, patch: Partial<DeptRow>) {
    setDeptRows((prev) => prev.map((row, i) => (i === index ? { ...row, ...patch } : row)))
  }

  function addDeptRow() {
    setDeptRows((prev) => [...prev, { label: '', invitedCount: '' }])
  }

  function removeDeptRow(index: number) {
    setDeptRows((prev) => prev.filter((_, i) => i !== index))
  }

  async function handleCopyDeptLink(slug: string, url: string) {
    try {
      await navigator.clipboard.writeText(url)
      setEverCopied(true)
      setCopiedDeptSlug(slug)
      setTimeout(() => setCopiedDeptSlug(null), 2000)
    } catch { /* clipboard unavailable */ }
  }

  async function handleStep1Submit(e: React.FormEvent) {
    e.preventDefault()
    setStep1Error(null)

    // Dezelfde regels als saveLaunchSetupAction, zodat de klant de fout hier
    // al leest en de server alleen nog de tweede grens is.
    const schedule = validateSchedule({ launchDate, closesAt, reminderChoice, today })
    if (!schedule.ok) { setStep1Error(schedule.error); return }

    if (segmentMode) {
      const incoming = deptRows
        .filter((row) => row.label.trim())
        .map((row) => ({
          label: row.label.trim(),
          invited_count: typeof row.invitedCount === 'number' ? row.invitedCount : 0,
        }))
      if (incoming.length < 2) {
        setStep1Error('Vul minimaal 2 afdelingen in (naam + aantal deelnemers).')
        return
      }
      for (const row of incoming) {
        const deptError = validateDepartmentInvitedCount(row.label, row.invited_count)
        if (deptError) { setStep1Error(deptError); return }
      }
      const totalError = validateInvitedTotal(totalInvited)
      if (totalError) { setStep1Error(totalError); return }

      startTransition(async () => {
        const segResult = await saveSegmentDepartmentsAction(campaignId, incoming)
        if (!segResult.ok) { setStep1Error(segResult.error ?? 'Er ging iets mis.'); return }
        // totalInvited is afgeleid van dezelfde gefilterde rijen als `incoming`
        // en komt dus overeen met wat saveSegmentDepartmentsAction als som opsloeg.
        const launchResult = await saveLaunchSetupAction(campaignId, {
          launchDate,
          invitedCount: totalInvited,
          closesAt,
          reminderChoice,
        })
        if (!launchResult.ok) {
          setStep1Error(
            `Afdelingen zijn opgeslagen, maar de planning niet: ${launchResult.error ?? 'er ging iets mis.'} Probeer opnieuw.`,
          )
          return
        }
        setStep(2)
      })
      return
    }

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
  }

  async function handleCopy(text: string, which: 'subject' | 'body') {
    try {
      await navigator.clipboard.writeText(text)
      setEverCopied(true)
      if (which === 'subject') { setCopiedSubject(true); setTimeout(() => setCopiedSubject(false), 2000) }
      else { setCopiedBody(true); setTimeout(() => setCopiedBody(false), 2000) }
    } catch { /* clipboard unavailable */ }
  }

  async function handleConfirmLaunch() {
    setStep2Error(null)
    startTransition(async () => {
      const result = await confirmLaunchAction(campaignId)
      if (!result.ok) { setStep2Error(result.error ?? 'Er ging iets mis.'); return }
      router.refresh()
    })
  }

  return (
    <section className="rounded-[22px] border border-[color:var(--dashboard-frame-border)] bg-[color:var(--dashboard-surface)] px-6 py-7">
      <p className="mb-1 text-xs font-semibold uppercase tracking-[0.12em] text-[#E8A020]">
        {scanLabel}
      </p>
      <h1 className="font-serif text-[2rem] leading-[1.05] tracking-[-0.04em] text-[color:var(--dashboard-ink)]">
        Welkom {organizationName} bij Loep
      </h1>
      <p className="mt-2 text-[0.95rem] text-[color:var(--dashboard-text)]">
        Doorloop drie stappen om je meting te starten.
      </p>

      <div className="mt-6 grid grid-cols-3 gap-3">

        {/* Stap 1 */}
        <div className={`relative rounded-[18px] p-5 ${step === 1 ? 'bg-[#0D1B2A]' : 'border border-[color:var(--dashboard-frame-border)] bg-white opacity-45'}`}>
          <p className={`mb-3 text-xs font-semibold ${step === 1 ? 'text-[#E8A020]' : 'text-[color:var(--dashboard-muted)]'}`}>
            {step > 1 ? 'Stap 1: klaar' : 'Stap 1: nu'}
          </p>
          <p className={`mb-1 text-sm font-semibold ${step === 1 ? 'text-white' : 'text-[color:var(--dashboard-ink)]'}`}>
            Planning en deelnemers
          </p>
          <p className={`text-xs ${step === 1 ? 'text-white/50' : 'text-[color:var(--dashboard-muted)]'}`}>
            Wanneer start en sluit de meting, en naar hoeveel medewerkers gaat hij?
          </p>

          {step === 1 && (
            <form onSubmit={handleStep1Submit} noValidate className="mt-5 space-y-4">
              <div>
                <label htmlFor="launch-date" className={fieldLabelClass}>Startdatum</label>
                <input
                  id="launch-date"
                  type="date" min={today} value={launchDate}
                  onChange={(e) => handleLaunchDateChange(e.target.value)}
                  className={inputClass}
                />
                <p className={helpClass}>{LAUNCH_DATE_HELP}</p>
              </div>

              <div>
                <label htmlFor="closes-at" className={fieldLabelClass}>Sluitdatum</label>
                <input
                  id="closes-at"
                  type="date"
                  min={launchDate ? minClosesAt(launchDate) : today}
                  max={launchDate ? maxClosesAt(launchDate) : undefined}
                  value={closesAt}
                  onChange={(e) => { setClosesAtTouched(true); setClosesAt(e.target.value) }}
                  className={inputClass}
                />
                <p className={helpClass}>{CLOSES_AT_HELP}</p>
              </div>

              <div>
                <label htmlFor="reminder-choice" className={fieldLabelClass}>Herinnering</label>
                <select
                  id="reminder-choice"
                  value={String(reminderChoice)}
                  onChange={(e) => handleReminderChange(e.target.value)}
                  className={`${inputClass} appearance-none`}
                >
                  {REMINDER_CHOICES.map((choice) => (
                    <option key={String(choice.value)} value={String(choice.value)} className="text-[#0D1B2A]">
                      {choice.label}
                    </option>
                  ))}
                </select>
                <p className={helpClass}>
                  {REMINDER_HELP}
                  {reminderDateLabel ? ` Dat is op ${reminderDateLabel}.` : ''}
                </p>
              </div>

              {segmentMode ? (
                <div className="space-y-3">
                  <div>
                    <p className="text-xs font-semibold text-white/50">Afdelingen en links</p>
                    <p className={helpClass}>{DEPARTMENT_HELP}</p>
                    <p className={helpClass}>{invitedHelp}</p>
                  </div>

                  <div className="space-y-2">
                    {deptRows.map((row, index) => {
                      const isLocked = lockedDepartments.has(row.label)
                      const links = row.label.trim()
                        ? buildSegmentSurveyLinksSafe(frontendBaseUrl, publicSurveyToken, row.label)
                        : null
                      return (
                        <div key={index} className="rounded-lg border border-white/15 bg-white/5 p-3">
                          <div className="flex gap-2">
                            <input
                              type="text"
                              value={row.label}
                              disabled={isLocked}
                              placeholder="Afdelingsnaam"
                              onChange={(e) => updateDeptRow(index, { label: e.target.value })}
                              className="flex-1 rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-xs text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-[#E8A020]/50 disabled:opacity-50"
                            />
                            <input
                              type="number" min={MIN_INVITED_PER_DEPARTMENT}
                              value={row.invitedCount}
                              placeholder="aantal"
                              onChange={(e) =>
                                updateDeptRow(index, {
                                  invitedCount: e.target.value === '' ? '' : Number(e.target.value),
                                })
                              }
                              className="w-24 rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-xs text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-[#E8A020]/50"
                            />
                            {!isLocked && deptRows.length > 2 && (
                              <button
                                type="button"
                                onClick={() => removeDeptRow(index)}
                                className="rounded-lg border border-white/15 px-2 text-xs text-white/50 hover:bg-white/10"
                                aria-label="Verwijder afdeling"
                              >
                                ×
                              </button>
                            )}
                          </div>
                          {isLocked && (
                            <p className="mt-1.5 text-[10px] text-white/40">
                              Naam vergrendeld: er zijn al responses op deze link.
                            </p>
                          )}
                          {links && (
                            <div className="mt-2 flex items-center gap-2">
                              <code className="flex-1 truncate rounded border border-white/10 bg-white/5 px-2 py-1 text-[9px] text-white/50">
                                {links.url}
                              </code>
                              <button
                                type="button"
                                onClick={() => handleCopyDeptLink(links.slug, links.url)}
                                className="whitespace-nowrap rounded border border-white/20 px-2 py-1 text-[10px] font-semibold text-white/80 hover:bg-white/10"
                              >
                                {copiedDeptSlug === links.slug ? 'Gekopieerd ✓' : 'Kopieer link'}
                              </button>
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>

                  <button
                    type="button"
                    onClick={addDeptRow}
                    className="w-full rounded-lg border border-dashed border-white/30 px-3 py-2 text-xs text-white/70 hover:bg-white/5"
                  >
                    + Afdeling toevoegen
                  </button>

                  <div className="flex items-center justify-between border-t border-white/15 pt-2 text-xs text-white/70">
                    <span>Totaal deelnemers (minimaal {MIN_INVITED_TOTAL})</span>
                    <strong className="text-white">{totalInvited}</strong>
                  </div>
                </div>
              ) : (
                <>
                  <div>
                    <label htmlFor="invited-count" className={fieldLabelClass}>Aantal deelnemers</label>
                    <input
                      id="invited-count"
                      type="number" min={MIN_INVITED_TOTAL} value={invitedCount} placeholder="bijv. 40"
                      onChange={(e) => setInvitedCount(e.target.value === '' ? '' : Number(e.target.value))}
                      className={inputClass}
                    />
                    <p className={helpClass}>{invitedHelp}</p>
                  </div>

                  <div>
                    <p className="mb-1 text-xs font-semibold text-white/50">Vragenlijstlink</p>
                    <div className="flex items-center gap-2">
                      <code className="flex-1 truncate rounded-lg border border-white/15 bg-white/10 px-2 py-1.5 text-[10px] text-white/70">
                        {surveyLink}
                      </code>
                      <a href={surveyLink} target="_blank" rel="noopener noreferrer"
                        className="whitespace-nowrap rounded-lg border border-white/20 px-2.5 py-1.5 text-xs font-semibold text-white/80 hover:bg-white/10">
                        Test →
                      </a>
                    </div>
                    <p className={helpClass}>
                      Alleen openen om te controleren. Vul hem niet volledig in, anders tellen jouw antwoorden mee.
                    </p>
                  </div>
                </>
              )}

              {step1Error && (
                <p role="alert" className="rounded-lg bg-red-500/20 px-3 py-2 text-xs font-semibold text-red-300">{step1Error}</p>
              )}

              <button type="submit" disabled={isPending}
                className="w-full rounded-lg bg-[#E8A020] px-4 py-2.5 text-sm font-semibold text-[#0D1B2A] transition-opacity hover:opacity-90 disabled:opacity-50">
                {isPending ? 'Bezig...' : 'Opslaan en verder →'}
              </button>
            </form>
          )}
        </div>

        {/* Stap 2 */}
        <div className={`relative rounded-[18px] p-5 ${step === 2 ? 'bg-[#0D1B2A]' : 'border border-[color:var(--dashboard-frame-border)] bg-white opacity-45'}`}>
          {step < 2 && (
            <span className="absolute right-4 top-4 text-[color:var(--dashboard-muted)]">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
            </span>
          )}
          <p className={`mb-3 text-xs font-semibold ${step === 2 ? 'text-[#E8A020]' : 'text-[color:var(--dashboard-muted)]'}`}>
            {step === 2 ? 'Stap 2: nu' : 'Stap 2'}
          </p>
          <p className={`mb-1 text-sm font-semibold ${step === 2 ? 'text-white' : 'text-[color:var(--dashboard-ink)]'}`}>
            Uitnodiging versturen
          </p>
          <p className={`text-xs ${step === 2 ? 'text-white/50' : 'text-[color:var(--dashboard-muted)]'}`}>
            Pas de tekst aan en stuur vanuit je eigen e-mail.
          </p>

          {step === 2 && (
            <div className="mt-5 space-y-3">

              {tip && (
                <div className="rounded-xl bg-[#E8A020]/15 border border-[#E8A020]/30 px-3 py-2.5">
                  <p className="text-[10px] font-semibold text-[#E8A020] mb-0.5">Advies</p>
                  <p className="text-[11px] leading-relaxed text-white/70">{tip}</p>
                </div>
              )}

              {segmentMode && (
                <div className="rounded-xl bg-white/5 border border-white/10 px-3 py-2.5">
                  <p className="text-[10px] font-semibold text-white/50 mb-1">Deel per afdeling de eigen link</p>
                  <p className="text-[11px] leading-relaxed text-white/60">
                    Er is bewust geen algemene link. Gebruik de links uit stap 1 per afdeling.
                  </p>
                </div>
              )}

              {/* Onderwerp */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label htmlFor="invite-subject" className="text-[10px] font-semibold text-white/50 uppercase tracking-wide">Onderwerp</label>
                  <button type="button" onClick={() => handleCopy(editableSubject, 'subject')}
                    className="text-[10px] font-semibold text-[#E8A020] hover:opacity-80">
                    {copiedSubject ? 'Gekopieerd ✓' : 'Kopieer'}
                  </button>
                </div>
                <input
                  id="invite-subject"
                  type="text"
                  value={editableSubject}
                  onChange={(e) => setEditableSubject(e.target.value)}
                  className="w-full rounded-lg border border-white/15 bg-white/10 px-3 py-2 text-xs text-white/90 focus:outline-none focus:ring-1 focus:ring-[#E8A020]/50"
                />
              </div>

              {/* Bericht */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label htmlFor="invite-body" className="text-[10px] font-semibold text-white/50 uppercase tracking-wide">Bericht</label>
                  <button type="button" onClick={() => handleCopy(editableBody, 'body')}
                    className="text-[10px] font-semibold text-[#E8A020] hover:opacity-80">
                    {copiedBody ? 'Gekopieerd ✓' : 'Kopieer'}
                  </button>
                </div>
                <textarea
                  id="invite-body"
                  value={editableBody}
                  onChange={(e) => setEditableBody(e.target.value)}
                  rows={11}
                  className="w-full resize-none rounded-lg border border-white/15 bg-white/10 px-3 py-2 text-xs leading-relaxed text-white/90 focus:outline-none focus:ring-1 focus:ring-[#E8A020]/50"
                />
              </div>
              <p className="text-[10px] text-white/40">Je kunt de tekst aanpassen voor je kopieert. Vergeet niet je naam in te vullen bij &ldquo;Met vriendelijke groet&rdquo;.</p>

              <div className="border-t border-white/15 pt-3">
                {step2Error && (
                  <p role="alert" className="mb-2 rounded-lg bg-red-500/20 px-3 py-2 text-xs font-semibold text-red-300">{step2Error}</p>
                )}
                <button type="button" onClick={handleConfirmLaunch} disabled={isPending}
                  className="w-full rounded-lg bg-[#E8A020] px-4 py-2.5 text-sm font-semibold text-[#0D1B2A] transition-opacity hover:opacity-90 disabled:opacity-50">
                  {isPending ? 'Bezig...' : 'Ja, verstuurd →'}
                </button>
                {!everCopied && (
                  <p className="mt-1.5 text-center text-[10px] text-white/30">Tip: kopieer de tekst hierboven voor je verstuurt</p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Stap 3 */}
        <div className="relative rounded-[18px] border border-[color:var(--dashboard-frame-border)] bg-white p-5 opacity-45">
          <span className="absolute right-4 top-4 text-[color:var(--dashboard-muted)]">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
          </span>
          <p className="mb-3 text-xs font-semibold text-[color:var(--dashboard-muted)]">Stap 3</p>
          <p className="mb-1 text-sm font-semibold text-[color:var(--dashboard-ink)]">Volgen &amp; rapport</p>
          <p className="text-xs text-[color:var(--dashboard-muted)]">
            Respons monitoren · herinnering sturen · rapport via Loep.
          </p>
        </div>
      </div>
    </section>
  )
}

// Live link-preview tijdens het intypen: de naam is dan nog niet per se een
// geldige/unieke slug (leeg, dubbel met een andere rij). De echte validatie
// (incl. duplicaatcheck) gebeurt server-side bij opslaan via
// saveSegmentDepartmentsAction. Deze functie geeft alleen een voorlopige
// link, op basis van de gedeelde slugify() uit self-send-comms.ts.
function buildSegmentSurveyLinksSafe(
  frontendBaseUrl: string,
  publicSurveyToken: string,
  label: string,
): { slug: string; url: string } | null {
  const slug = slugify(label)
  if (!slug) return null
  const [dep] = buildSegmentSurveyLinks(frontendBaseUrl, publicSurveyToken, [{ label, slug }])
  return dep ? { slug, url: dep.url } : null
}
```

Stap 3 is hier nog de oude placeholder (met "rapport via Loep"); Task 4 vervangt dat blok door de tijdlijn. De uitnodiging heeft hier nog `scanLabel` in de aanroep; Task 7 haalt dat weg.

- [ ] **Step 11: `WelcomeGate` deelt de props-interface**

Vervang in `frontend/components/dashboard/welcome-gate.tsx` regels 1-18:

```tsx
'use client'

import { useState, useEffect } from 'react'
import { SetupWizardCard } from './setup-wizard-card'
import type { ScanType } from '@/lib/types'
import type { SegmentDepartmentStored } from '@/lib/self-send-comms'

interface Props {
  campaignId: string
  scanType: ScanType
  organizationName: string
  publicSurveyToken: string
  frontendBaseUrl: string
  initialLaunchDate: string | null
  initialInvitedCount: number | null
  segmentDepartments?: SegmentDepartmentStored[] | null
  departmentResponseCounts?: Record<string, number>
}
```

door:

```tsx
'use client'

import { useState, useEffect } from 'react'
import { SetupWizardCard, type SetupWizardCardProps } from './setup-wizard-card'

type Props = SetupWizardCardProps
```

De rest van het bestand (`export function WelcomeGate(props: Props)`) blijft ongewijzigd.

- [ ] **Step 12: Setup-pagina en beide dashboardpagina's geven de nieuwe props door**

In `frontend/app/(dashboard)/campaigns/[id]/setup/page.tsx` vervang regels 1-3:

```tsx
import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { SetupWizardCard } from '@/components/dashboard/setup-wizard-card'
```

door:

```tsx
import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { readReminderChoice } from '@/lib/campaign-schedule'
import { SetupWizardCard } from '@/components/dashboard/setup-wizard-card'
```

Vervang in dezelfde pagina de delivery-select (anker `.select('launch_date, invited_count, launch_confirmed_at')`, regel 24) door:

```tsx
      .select('launch_date, invited_count, launch_confirmed_at, reminder_config')
```

en voeg in de `<SetupWizardCard ... />`-aanroep (regels 75-87) direct na `initialInvitedCount={delivery?.invited_count ?? null}` toe:

```tsx
        initialClosesAt={((campaign as Record<string, unknown>).closes_at as string | null) ?? null}
        initialReminderChoice={readReminderChoice(delivery?.reminder_config)}
```

In `frontend/app/(dashboard)/dashboard/page.tsx` voeg na regel 8 (`import { normalizeReminderConfig } from '@/lib/launch-controls'`) toe:

```tsx
import { readReminderChoice } from '@/lib/campaign-schedule'
```

en voeg in de `<WelcomeGate ... />`-aanroep (regels 175-187) direct na `initialInvitedCount={deliveryRecord?.invited_count ?? null}` toe:

```tsx
          initialClosesAt={campaign.closes_at ?? null}
          initialReminderChoice={readReminderChoice(deliveryRecord?.reminder_config)}
```

In `frontend/app/(dashboard)/campaigns/[id]/page.tsx` voeg na regel 10 (`import { normalizeReminderConfig } from '@/lib/launch-controls'`) toe:

```tsx
import { readReminderChoice } from '@/lib/campaign-schedule'
```

en voeg in de `<WelcomeGate ... />`-aanroep (regels 171-183) direct na `initialInvitedCount={deliveryRecord?.invited_count ?? null}` toe:

```tsx
          initialClosesAt={campaignMeta?.closes_at ?? null}
          initialReminderChoice={readReminderChoice(deliveryRecord?.reminder_config)}
```

- [ ] **Step 13: Tests en tsc**

Run:
```bash
cd /c/Users/larsh/Desktop/Business/Verisight/.worktrees/klantsuite-2a/frontend
npx vitest run lib/campaign-schedule.test.ts lib/dashboard/format-dutch-date.test.ts "app/(dashboard)/campaigns/[id]/setup/launch-setup-actions.test.ts" components/dashboard/setup-wizard-card.guard.test.ts 2>&1 | tail -8
npx tsc --noEmit 2>&1 | grep -c "error TS"
```
Expected: alle vier PASS; tsc `133`.

- [ ] **Step 14: Commit**

```bash
cd /c/Users/larsh/Desktop/Business/Verisight/.worktrees/klantsuite-2a
git add frontend/lib/campaign-schedule.ts frontend/lib/campaign-schedule.test.ts frontend/lib/dashboard/format-dutch-date.ts frontend/lib/dashboard/format-dutch-date.test.ts "frontend/app/(dashboard)/campaigns/[id]/setup/launch-setup-actions.ts" "frontend/app/(dashboard)/campaigns/[id]/setup/launch-setup-actions.test.ts" frontend/components/dashboard/setup-wizard-card.tsx frontend/components/dashboard/setup-wizard-card.guard.test.ts frontend/components/dashboard/welcome-gate.tsx "frontend/app/(dashboard)/campaigns/[id]/setup/page.tsx" "frontend/app/(dashboard)/dashboard/page.tsx" "frontend/app/(dashboard)/campaigns/[id]/page.tsx"
git commit -m "feat(wizard): sluitdatum en herinnering in stap 1, toelichtingen per scan, Nederlandse validatie

Stap 1 slaat closes_at (campaigns) en reminder_config (delivery record) op via
saveLaunchSetupAction; één validator (lib/campaign-schedule.ts) voor client en
server. Checkbox 'Link getest' weg; wizard opent altijd op stap 1.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

### Task 3: Terug naar stap 1 en een eigen bevestigingsdialoog vóór "Ja, verstuurd"

**Files:**
- Create: `frontend/components/dashboard/confirm-dialog.tsx`
- Create: `frontend/components/dashboard/confirm-dialog.test.ts`
- Modify: `frontend/components/dashboard/setup-wizard-card.tsx` (stand na Task 2; ankers hieronder)
- Modify: `frontend/components/dashboard/setup-wizard-card.guard.test.ts`

- [ ] **Step 1: Falende guard-tests voor de dialoog en de wizard**

Maak `frontend/components/dashboard/confirm-dialog.test.ts`:

```ts
import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

const src = readFileSync(new URL('./confirm-dialog.tsx', import.meta.url), 'utf8')

describe('ConfirmDialog (spec 2026-09-16 par. 4.3 en 9: eigen dialoog, geen browser-confirm)', () => {
  it('is een client component met een toegankelijke dialoogrol', () => {
    expect(src).toContain("'use client'")
    expect(src).toContain('role="dialog"')
    expect(src).toContain('aria-modal="true"')
    expect(src).toContain('aria-labelledby')
  })

  it('sluit op Escape en op de achtergrond, zonder actie', () => {
    expect(src).toContain("event.key === 'Escape'")
    expect(src).toContain('onClick={onClose}')
  })

  it('rendert de knoppen in de volgorde die de aanroeper geeft, met een primaire variant', () => {
    expect(src).toContain('actions.map(')
    expect(src).toContain("action.variant === 'primary'")
  })

  it('gebruikt zelf geen browser-confirm en geen em- of en-dashes', () => {
    expect(src).not.toMatch(/(?<![A-Za-z_])confirm\(/)
    expect(src).not.toMatch(/[—–]/)
  })
})
```

Voeg aan `frontend/components/dashboard/setup-wizard-card.guard.test.ts` onderaan een derde `describe` toe:

```ts
describe('setup-wizard stap 2: terug en bevestigen (spec 2026-09-16 par. 5.2)', () => {
  it('biedt in stap 2 een weg terug naar stap 1', () => {
    expect(src).toContain('Terug naar stap 1')
    expect(src).toContain('setStep(1)')
  })

  it('vraagt bevestiging in een eigen dialoog voordat de meting als gestart telt', () => {
    expect(src).toContain('ConfirmDialog')
    expect(src).toContain('Heb je de uitnodiging naar je medewerkers gestuurd? Daarna telt de meting als gestart en kun je stap 1 niet meer wijzigen.')
    expect(src).toContain("'Ja, verstuurd'")
    expect(src).toContain("'Nog niet'")
    expect(src).not.toMatch(/(?<![A-Za-z_])confirm\(/)
  })

  it('zegt in de dialoog dat er nog niets gekopieerd is als dat zo is', () => {
    expect(src).toContain('Je hebt nog niets gekopieerd.')
    expect(src).toContain('!everCopied')
  })
})
```

- [ ] **Step 2: Run om te zien dat ze falen**

Run:
```bash
cd /c/Users/larsh/Desktop/Business/Verisight/.worktrees/klantsuite-2a/frontend
npx vitest run components/dashboard/confirm-dialog.test.ts components/dashboard/setup-wizard-card.guard.test.ts 2>&1 | tail -12
```
Expected: FAIL: `confirm-dialog.tsx` bestaat niet; de drie nieuwe wizardtests falen op `Terug naar stap 1`, `ConfirmDialog` en `Je hebt nog niets gekopieerd.`.

- [ ] **Step 3: `ConfirmDialog`**

Maak `frontend/components/dashboard/confirm-dialog.tsx`:

```tsx
'use client'

import { useEffect, useRef, type ReactNode } from 'react'

export interface ConfirmDialogAction {
  label: string
  onClick: () => void
  variant?: 'primary' | 'secondary'
  disabled?: boolean
}

interface Props {
  open: boolean
  title: string
  children: ReactNode
  /** In deze volgorde gerenderd; zet de primaire actie als laatste. De eerste knop krijgt focus. */
  actions: ConfirmDialogAction[]
  onClose: () => void
}

const primaryClass =
  'inline-flex items-center justify-center rounded-lg bg-[color:var(--dashboard-ink)] px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#1B2E45] disabled:opacity-50'
const secondaryClass =
  'inline-flex items-center justify-center rounded-lg border border-[color:var(--dashboard-frame-border)] bg-white px-5 py-3 text-sm font-semibold text-[color:var(--dashboard-ink)] transition-colors hover:bg-[color:var(--dashboard-surface)] disabled:opacity-50'

/**
 * Eigen bevestigingsdialoog in de app (spec 2026-09-16 par. 4.3 en 9): geen
 * browser-confirm(), zodat de tekst de gevolgen kan benoemen en de knoppen
 * zeggen wat ze doen. Escape en een klik op de achtergrond sluiten zonder
 * actie. De eerste knop (de veilige, niet de primaire) krijgt focus, zodat
 * een verdwaalde Enter niets onomkeerbaars doet.
 */
export function ConfirmDialog({ open, title, children, actions, onClose }: Props) {
  const firstButtonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!open) return
    firstButtonRef.current?.focus()
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [open, onClose])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-[#0D1B2A]/60 p-4 sm:items-center"
      onClick={onClose}
      role="presentation"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-dialog-title"
        onClick={(event) => event.stopPropagation()}
        className="w-full max-w-md rounded-[18px] bg-white p-6 shadow-xl"
      >
        <h2 id="confirm-dialog-title" className="text-lg font-semibold text-[#0D1B2A]">
          {title}
        </h2>
        <div className="mt-3 space-y-2 text-sm leading-6 text-[color:var(--dashboard-text)]">{children}</div>
        <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-end">
          {actions.map((action, index) => (
            <button
              key={action.label}
              ref={index === 0 ? firstButtonRef : undefined}
              type="button"
              onClick={action.onClick}
              disabled={action.disabled}
              className={action.variant === 'primary' ? primaryClass : secondaryClass}
            >
              {action.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Wizard: terug naar stap 1 en de lanceerdialoog**

Alle ankers verwijzen naar de wizard zoals Task 2 hem heeft achtergelaten.

(a) Voeg bij de imports, direct na de regel `import { formatDutchDate } from '@/lib/dashboard/format-dutch-date'`, toe:

```tsx
import { ConfirmDialog } from './confirm-dialog'
```

(b) Voeg direct na de regel `const [copiedDeptSlug, setCopiedDeptSlug] = useState<string | null>(null)` toe:

```tsx
  const [launchDialogOpen, setLaunchDialogOpen] = useState(false)
```

(c) Vervang de functie `handleConfirmLaunch`:

```tsx
  async function handleConfirmLaunch() {
    setStep2Error(null)
    startTransition(async () => {
      const result = await confirmLaunchAction(campaignId)
      if (!result.ok) { setStep2Error(result.error ?? 'Er ging iets mis.'); return }
      router.refresh()
    })
  }
```

door:

```tsx
  function openLaunchDialog() {
    setStep2Error(null)
    setLaunchDialogOpen(true)
  }

  function backToStep1() {
    setStep2Error(null)
    setStep(1)
  }

  // Onomkeerbaar (spec 2026-09-16 par. 5.2 en 9): pas na de eigen dialoog telt
  // de meting als gestart en is stap 1 niet meer te wijzigen.
  function handleConfirmLaunch() {
    setLaunchDialogOpen(false)
    startTransition(async () => {
      const result = await confirmLaunchAction(campaignId)
      if (!result.ok) { setStep2Error(result.error ?? 'Er ging iets mis.'); return }
      router.refresh()
    })
  }
```

(d) Vervang in stap 2 het begin van de inhoud (anker: `{step === 2 && (` gevolgd door `<div className="mt-5 space-y-3">`) zodat de terugknop bovenaan staat:

```tsx
          {step === 2 && (
            <div className="mt-5 space-y-3">

              {tip && (
```

door:

```tsx
          {step === 2 && (
            <div className="mt-5 space-y-3">

              <button
                type="button"
                onClick={backToStep1}
                className="text-[10px] font-semibold text-white/60 underline underline-offset-2 hover:text-white"
              >
                ← Terug naar stap 1
              </button>

              {tip && (
```

(e) Vervang de knop "Ja, verstuurd →":

```tsx
                <button type="button" onClick={handleConfirmLaunch} disabled={isPending}
                  className="w-full rounded-lg bg-[#E8A020] px-4 py-2.5 text-sm font-semibold text-[#0D1B2A] transition-opacity hover:opacity-90 disabled:opacity-50">
                  {isPending ? 'Bezig...' : 'Ja, verstuurd →'}
                </button>
```

door:

```tsx
                <button type="button" onClick={openLaunchDialog} disabled={isPending}
                  className="w-full rounded-lg bg-[#E8A020] px-4 py-2.5 text-sm font-semibold text-[#0D1B2A] transition-opacity hover:opacity-90 disabled:opacity-50">
                  {isPending ? 'Bezig...' : 'Ja, verstuurd →'}
                </button>
```

(f) Vervang het slot van de component, de regels

```tsx
      </div>
    </section>
  )
}
```

(de sluiting van `<div className="mt-6 grid grid-cols-3 gap-3">` en de `<section>`) door:

```tsx
      </div>

      <ConfirmDialog
        open={launchDialogOpen}
        title="Heb je de uitnodiging verstuurd?"
        onClose={() => setLaunchDialogOpen(false)}
        actions={[
          { label: 'Nog niet', onClick: () => setLaunchDialogOpen(false) },
          { label: 'Ja, verstuurd', onClick: handleConfirmLaunch, variant: 'primary', disabled: isPending },
        ]}
      >
        <p>Heb je de uitnodiging naar je medewerkers gestuurd? Daarna telt de meting als gestart en kun je stap 1 niet meer wijzigen.</p>
        {!everCopied ? (
          <p className="font-semibold text-[#B9571F]">
            Je hebt nog niets gekopieerd. Kopieer eerst het onderwerp en het bericht en verstuur ze vanuit je eigen mail.
          </p>
        ) : null}
      </ConfirmDialog>
    </section>
  )
}
```

- [ ] **Step 5: Run tests en tsc**

Run:
```bash
cd /c/Users/larsh/Desktop/Business/Verisight/.worktrees/klantsuite-2a/frontend
npx vitest run components/dashboard/confirm-dialog.test.ts components/dashboard/setup-wizard-card.guard.test.ts 2>&1 | tail -8
npx tsc --noEmit 2>&1 | grep -c "error TS"
```
Expected: beide PASS; tsc `133`.

- [ ] **Step 6: Commit**

```bash
cd /c/Users/larsh/Desktop/Business/Verisight/.worktrees/klantsuite-2a
git add frontend/components/dashboard/confirm-dialog.tsx frontend/components/dashboard/confirm-dialog.test.ts frontend/components/dashboard/setup-wizard-card.tsx frontend/components/dashboard/setup-wizard-card.guard.test.ts
git commit -m "feat(wizard): terug naar stap 1 en eigen bevestigingsdialoog vóór 'Ja, verstuurd'

Nieuwe ConfirmDialog (role=dialog, Escape sluit) vervangt de browser-confirm.
De dialoog benoemt dat de meting daarna als gestart telt en meldt als er nog
niets gekopieerd is.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

### Task 4: Stap 3 wordt echt: de tijdlijn met datums op de wizard en op elke kaart van een lopende meting

**Files:**
- Create: `frontend/lib/dashboard/campaign-timeline.ts`
- Create: `frontend/lib/dashboard/campaign-timeline.test.ts`
- Create: `frontend/components/dashboard/campaign-timeline.tsx`
- Create: `frontend/components/dashboard/running-state-card.test.ts`
- Modify: `frontend/lib/dashboard/dashboard-state-resolver.ts:1-4, 35-48, 57-75, 77-102, 156-172, 174-259`
- Modify: `frontend/lib/dashboard/dashboard-state-resolver.test.ts:5-26, 165-170`
- Modify: `frontend/components/dashboard/running-state-card.tsx` (volledig)
- Modify: `frontend/components/dashboard/dashboard-state-card.tsx:1-3, 43-44`
- Modify: `frontend/components/dashboard/read-only-state-card.tsx:1, 39-43`
- Modify: `frontend/components/dashboard/setup-wizard-card.tsx` (stap 3-blok; stand na Task 3)
- Modify: `frontend/components/dashboard/setup-wizard-card.guard.test.ts`
- Modify: `frontend/app/(dashboard)/dashboard/page.tsx:69-76, 135-153`
- Modify: `frontend/app/(dashboard)/campaigns/[id]/page.tsx:64-71, 113-131`

- [ ] **Step 1: Falende tests voor de tijdlijnbouwer**

Maak `frontend/lib/dashboard/campaign-timeline.test.ts`:

```ts
import { describe, expect, it } from 'vitest'
import { buildCampaignTimeline, TIMELINE_REPORT_NOTE } from './campaign-timeline'

const base = {
  launchDate: '2026-09-16',
  launchConfirmedAt: '2026-09-16T08:00:00Z',
  reminderEnabled: true,
  reminderAfterDays: 5,
  reminderHandledAt: null,
  reminderSkipped: false,
  closesAt: '2026-10-07',
}

describe('buildCampaignTimeline (spec 2026-09-16 par. 4.2)', () => {
  it('geeft start, herinnering en sluit met echte datums', () => {
    const timeline = buildCampaignTimeline(base)
    expect(timeline.items.map((i) => [i.key, i.label, i.value, i.done])).toEqual([
      ['start', 'Uitnodiging verstuurd', '16 september 2026', true],
      ['reminder', 'Herinnering', '21 september 2026', false],
      ['close', 'Meting sluit', '7 oktober 2026', false],
    ])
    expect(timeline.reportNote).toBe(TIMELINE_REPORT_NOTE)
    expect(TIMELINE_REPORT_NOTE).toBe(
      'Rapport downloaden zodra de meting gesloten is met minimaal 10 ingevulde vragenlijsten.',
    )
  })

  it('toont "geen" als de klant geen herinnering wil', () => {
    const timeline = buildCampaignTimeline({ ...base, reminderEnabled: false })
    expect(timeline.items[1]).toMatchObject({ value: 'Geen herinnering', done: false })
  })

  it('markeert een verstuurde herinnering met datum, en een overgeslagen herinnering als overgeslagen', () => {
    expect(buildCampaignTimeline({ ...base, reminderHandledAt: '2026-09-21T09:30:00Z' }).items[1]).toMatchObject({
      value: 'Verstuurd op 21 september 2026',
      done: true,
    })
    expect(buildCampaignTimeline({ ...base, reminderHandledAt: '2026-09-21T09:30:00Z', reminderSkipped: true }).items[1]).toMatchObject({
      value: 'Overgeslagen',
      done: true,
    })
  })

  it('degradeert eerlijk zonder sluitdatum of startdatum (metingen van voor de wizard-sluitdatum)', () => {
    const timeline = buildCampaignTimeline({ ...base, closesAt: null })
    expect(timeline.items[2]).toMatchObject({ value: 'Nog niet ingesteld' })
    const preview = buildCampaignTimeline({ ...base, launchDate: null, launchConfirmedAt: null, closesAt: null })
    expect(preview.items.map((i) => i.value)).toEqual(['Nog niet gepland', 'Nog niet gepland', 'Nog niet ingesteld'])
    expect(preview.items[0]).toMatchObject({ label: 'Start', done: false })
  })

  it('bevat geen em- of en-dashes', () => {
    const timeline = buildCampaignTimeline(base)
    for (const item of timeline.items) {
      expect(item.label).not.toMatch(/[—–]/)
      expect(item.value).not.toMatch(/[—–]/)
    }
    expect(timeline.reportNote).not.toMatch(/[—–]/)
  })
})
```

Maak `frontend/components/dashboard/running-state-card.test.ts`:

```ts
import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

const src = readFileSync(new URL('./running-state-card.tsx', import.meta.url), 'utf8')

describe('kaart "Campagne loopt" (spec 2026-09-16 par. 4.2 en 4.4)', () => {
  it('toont de gedeelde tijdlijn met datums', () => {
    expect(src).toContain('CampaignTimeline')
    expect(src).toContain('state.timeline')
    expect(src).not.toContain('function TimelineItem')
    expect(src).not.toContain('Nog niet gepland')
  })

  it('toont vóór de herinneringsdag geen herinneringstekst (die staat op de herinneringskaart)', () => {
    expect(src).not.toContain('Herinneringsmail')
    expect(src).not.toContain('navigator.clipboard')
  })

  it('rendert de acties via het gedeelde eiland', () => {
    expect(src).toContain('<DashboardStateActions state={state} reminderText={reminderText} />')
  })

  it('bevat geen em- of en-dashes', () => {
    expect(src).not.toMatch(/[—–]/)
  })
})
```

- [ ] **Step 2: Run om te zien dat ze falen**

Run:
```bash
cd /c/Users/larsh/Desktop/Business/Verisight/.worktrees/klantsuite-2a/frontend
npx vitest run lib/dashboard/campaign-timeline.test.ts components/dashboard/running-state-card.test.ts 2>&1 | tail -12
```
Expected: FAIL: de tijdlijnmodule bestaat niet; de running-card-test faalt op `CampaignTimeline`, `Herinneringsmail` en `function TimelineItem`.

- [ ] **Step 3: Tijdlijnbouwer en component**

Maak `frontend/lib/dashboard/campaign-timeline.ts`:

```ts
import { FIRST_INSIGHT_THRESHOLD } from '@/lib/response-activation'
import { formatDutchDate } from '@/lib/dashboard/format-dutch-date'
import { getReminderDueDate } from '@/lib/dashboard/reminder-due'

export interface CampaignTimelineItem {
  key: 'start' | 'reminder' | 'close'
  label: string
  value: string
  done: boolean
}

export interface CampaignTimeline {
  items: CampaignTimelineItem[]
  reportNote: string
}

export const TIMELINE_REPORT_NOTE = `Rapport downloaden zodra de meting gesloten is met minimaal ${FIRST_INSIGHT_THRESHOLD} ingevulde vragenlijsten.`

export interface CampaignTimelineInput {
  launchDate: string | null
  launchConfirmedAt: string | null
  reminderEnabled: boolean
  reminderAfterDays: number
  /** created_at van het meest recente send_reminders-event, of null. */
  reminderHandledAt: string | null
  /** Dat event had metadata.channel = 'skipped_by_customer'. */
  reminderSkipped: boolean
  closesAt: string | null
}

/**
 * De tijdlijn met datums die op elke kaart van een lopende meting staat en
 * als vooruitblik in stap 3 van de wizard (spec 2026-09-16 par. 4.2). Pure
 * functie; ontbrekende data wordt eerlijk benoemd ("Nog niet ingesteld"),
 * nooit ingevuld met een gok.
 */
export function buildCampaignTimeline(input: CampaignTimelineInput): CampaignTimeline {
  const launched = Boolean(input.launchConfirmedAt)
  const start: CampaignTimelineItem = {
    key: 'start',
    label: launched ? 'Uitnodiging verstuurd' : 'Start',
    value: formatDutchDate(input.launchDate) ?? 'Nog niet gepland',
    done: launched,
  }

  let reminder: CampaignTimelineItem
  if (!input.reminderEnabled) {
    reminder = { key: 'reminder', label: 'Herinnering', value: 'Geen herinnering', done: false }
  } else if (input.reminderHandledAt) {
    reminder = {
      key: 'reminder',
      label: 'Herinnering',
      value: input.reminderSkipped
        ? 'Overgeslagen'
        : `Verstuurd op ${formatDutchDate(input.reminderHandledAt) ?? 'onbekende datum'}`,
      done: true,
    }
  } else {
    const dueDate = getReminderDueDate(input.launchDate, input.reminderAfterDays)
    reminder = {
      key: 'reminder',
      label: 'Herinnering',
      value: formatDutchDate(dueDate) ?? 'Nog niet gepland',
      done: false,
    }
  }

  const close: CampaignTimelineItem = {
    key: 'close',
    label: 'Meting sluit',
    value: formatDutchDate(input.closesAt) ?? 'Nog niet ingesteld',
    done: false,
  }

  return { items: [start, reminder, close], reportNote: TIMELINE_REPORT_NOTE }
}
```

Maak `frontend/components/dashboard/campaign-timeline.tsx` (geen `'use client'`: geen hooks, bruikbaar vanuit server én client components):

```tsx
import type { CampaignTimeline as CampaignTimelineData } from '@/lib/dashboard/campaign-timeline'

interface Props {
  timeline: CampaignTimelineData
  /** Vooruitblik in de wizard: gedimd, want er is nog niets gebeurd. */
  dimmed?: boolean
}

export function CampaignTimeline({ timeline, dimmed = false }: Props) {
  return (
    <div className={dimmed ? 'opacity-60' : undefined}>
      <ol className="flex flex-col gap-4 sm:flex-row sm:gap-0">
        {timeline.items.map((item, index) => (
          <li key={item.key} className="relative flex-1 pl-4">
            <span
              className={`absolute left-0 top-[5px] h-2 w-2 rounded-full ${item.done ? 'bg-[#0D1B2A]' : 'bg-[color:var(--dashboard-soft)]'}`}
            />
            {index < timeline.items.length - 1 ? (
              <span className="absolute left-2 right-0 top-[8px] hidden h-px bg-[color:var(--dashboard-frame-border)] sm:block" />
            ) : null}
            <p className={`text-xs font-medium ${item.done ? 'text-[color:var(--dashboard-ink)]' : 'text-[color:var(--dashboard-muted)]'}`}>
              {item.label}
            </p>
            <p className="mt-0.5 text-[11px] text-[color:var(--dashboard-muted)]">{item.value}</p>
          </li>
        ))}
      </ol>
      <p className="mt-3 text-[11px] text-[color:var(--dashboard-muted)]">{timeline.reportNote}</p>
    </div>
  )
}
```

- [ ] **Step 4: Run de tijdlijntests**

Run:
```bash
cd /c/Users/larsh/Desktop/Business/Verisight/.worktrees/klantsuite-2a/frontend
npx vitest run lib/dashboard/campaign-timeline.test.ts 2>&1 | tail -6
```
Expected: PASS (5 tests).

- [ ] **Step 5: Resolver levert de tijdlijn**

In `frontend/lib/dashboard/dashboard-state-resolver.ts`:

(a) Vervang de imports (regels 1-4):

```ts
// frontend/lib/dashboard/dashboard-state-resolver.ts
import type { ScanType } from '@/lib/types'
import { getResponseActivationThresholds } from '@/lib/response-activation'
import { isReminderDue } from '@/lib/dashboard/reminder-due'
```

door:

```ts
// frontend/lib/dashboard/dashboard-state-resolver.ts
import type { ScanType } from '@/lib/types'
import { getResponseActivationThresholds } from '@/lib/response-activation'
import { isReminderDue } from '@/lib/dashboard/reminder-due'
import { formatDutchDate } from '@/lib/dashboard/format-dutch-date'
import { buildCampaignTimeline, type CampaignTimeline } from '@/lib/dashboard/campaign-timeline'
```

(b) Vervang in `DashboardStateInput` de regels 39-43:

```ts
  /** Not sourced yet (subsystem 2). Always null today → expired trigger disabled, close label degraded. */
  closesAt: string | null
  reminderConfig: DashboardReminderConfig
  /** Most recent manual reminder confirmation (from audit events), or null. */
  reminderAlreadySentAt: string | null
```

door:

```ts
  /** campaigns.closes_at (date). Null bij metingen van vóór de wizard-sluitdatum: dan geen expired-trigger en een eerlijk "nog niet ingesteld". */
  closesAt: string | null
  reminderConfig: DashboardReminderConfig
  /** created_at van het meest recente send_reminders-event (verstuurd of overgeslagen), of null. */
  reminderAlreadySentAt: string | null
  /** Dat event had metadata.channel = 'skipped_by_customer'. */
  reminderSkipped: boolean
```

(c) Voeg in `DashboardState` direct na `closeDateLabel: string` toe:

```ts
  /** Tijdlijn met datums (spec 2026-09-16 par. 4.2); alleen voor een gelanceerde, lopende meting. */
  timeline: CampaignTimeline | null
```

(d) Verwijder de private `formatDutchDate` (regels 77-82) en vervang `buildCloseDateLabel` plus `EMPTY_STATE` (regels 84-102) door:

```ts
function buildCloseDateLabel(closesAt: string | null): { label: string; degraded: boolean } {
  const formatted = formatDutchDate(closesAt)
  if (!formatted) return { label: 'Sluitdatum: nog niet ingesteld', degraded: true }
  return { label: `Sluit ${formatted}`, degraded: false }
}

const EMPTY_STATE: Omit<DashboardState, 'kind' | 'primaryMessage' | 'subtext' | 'tone'> = {
  actionVariant: null,
  processingVariant: null,
  campaignId: null,
  ctaLabel: null,
  ctaHref: null,
  ctaKind: null,
  secondaryActions: [],
  showProgress: false,
  progressPct: 0,
  closeDateLabel: 'Sluitdatum: nog niet ingesteld',
  timeline: null,
  degraded: false,
}
```

(e) Voeg direct na de setup-tak (anker: de sluitende `}` van `if (!launched) { ... }`, vóór het commentaar `// Priority 3 — expired`) toe:

```ts
  const timeline = buildCampaignTimeline({
    launchDate: input.launchDate,
    launchConfirmedAt: input.launchConfirmedAt,
    reminderEnabled: input.reminderConfig.enabled,
    reminderAfterDays: input.reminderConfig.firstReminderAfterDays,
    reminderHandledAt: input.reminderAlreadySentAt,
    reminderSkipped: input.reminderSkipped,
    closesAt: input.closesAt,
  })
```

(f) Voeg `timeline,` toe aan de vier returns die daarna komen (expired, reminder, sufficient_response, running), telkens direct na de regel `progressPct,`. In de running-tak vervang bovendien de subtext:

```ts
      subtext: `${campaign.totalCompleted} van ${campaign.totalInvited} ingevuld · ${close.label}`,
```

door:

```ts
      subtext: `${campaign.totalCompleted} van ${campaign.totalInvited} ingevuld`,
```

(de sluitdatum staat nu in de tijdlijn en in `closeDateLabel`).

- [ ] **Step 6: Resolvertest bijwerken**

In `frontend/lib/dashboard/dashboard-state-resolver.test.ts` voeg in `baseInput` (regels 5-26) direct na `reminderAlreadySentAt: null,` toe:

```ts
    reminderSkipped: false,
```

Vervang de laatste test (`degrades the close date label when no close date is known`, regels 165-170) door:

```ts
  it('degradeert het sluitlabel eerlijk als er geen sluitdatum is en zet dat ook in de tijdlijn', () => {
    const state = resolveDashboardState(baseInput({ campaign: { ...baseInput().campaign!, totalCompleted: 3 } }))
    expect(state.kind).toBe('running')
    expect(state.closeDateLabel).toBe('Sluitdatum: nog niet ingesteld')
    expect(state.timeline?.items.map((i) => i.value)).toEqual(['1 juni 2026', '6 juni 2026', 'Nog niet ingesteld'])
  })

  it('geeft een lopende meting een tijdlijn met de sluitdatum, en een niet-gelanceerde geen', () => {
    const running = resolveDashboardState(
      baseInput({ campaign: { ...baseInput().campaign!, totalCompleted: 3 }, closesAt: '2026-06-22' }),
    )
    expect(running.timeline?.items.map((i) => [i.label, i.value])).toEqual([
      ['Uitnodiging verstuurd', '1 juni 2026'],
      ['Herinnering', '6 juni 2026'],
      ['Meting sluit', '22 juni 2026'],
    ])
    expect(resolveDashboardState(baseInput({ launchConfirmedAt: null })).timeline).toBeNull()
  })
```

- [ ] **Step 7: Kaarten renderen de tijdlijn**

Vervang `frontend/components/dashboard/running-state-card.tsx` volledig door:

```tsx
import type { DashboardState } from '@/lib/dashboard/dashboard-state-resolver'
import { CampaignTimeline } from './campaign-timeline'
import { DashboardStateActions } from './dashboard-state-actions'

interface Props {
  state: DashboardState
  reminderText: string
  scanLabel: string
}

/**
 * Kaart voor een lopende meting zonder actie van vandaag. De herinneringstekst
 * staat hier bewust niet (spec 2026-09-16 par. 4.4): die verschijnt pas op de
 * herinneringsdag, op de herinneringskaart, zodat niemand op dag één een
 * herinnering stuurt. De tijdlijn zegt wanneer die dag is.
 */
export function RunningStateCard({ state, reminderText, scanLabel }: Props) {
  const pct = Math.min(100, Math.max(0, state.progressPct))

  return (
    <section className="rounded-[22px] border border-[color:var(--dashboard-frame-border)] bg-[color:var(--dashboard-surface)] px-6 py-7">
      <p className="mb-1 text-xs font-semibold uppercase tracking-[0.12em] text-[#E8A020]">{scanLabel}</p>
      <h1 className="font-serif text-[2rem] leading-[1.05] tracking-[-0.04em] text-[color:var(--dashboard-ink)]">
        Campagne loopt
      </h1>
      <p className="mt-2 text-[0.95rem] text-[color:var(--dashboard-text)]">
        De uitnodiging is verstuurd. Je volgt hier de respons; op de herinneringsdag staat de herinneringstekst hier klaar.
      </p>

      <div className="mt-6 max-w-sm">
        <div
          className="h-1.5 w-full overflow-hidden rounded-full bg-[color:var(--dashboard-soft)]"
          role="progressbar"
          aria-valuenow={pct}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <div
            className="h-full rounded-full bg-[#0D1B2A] transition-all duration-500"
            style={{ width: `${pct}%` }}
          />
        </div>
        <div className="mt-2 flex justify-between text-xs text-[color:var(--dashboard-muted)]">
          <span>{state.subtext}</span>
          <span>{state.closeDateLabel}</span>
        </div>
      </div>

      {state.timeline ? (
        <div className="mt-8">
          <CampaignTimeline timeline={state.timeline} />
        </div>
      ) : null}

      <DashboardStateActions state={state} reminderText={reminderText} />
    </section>
  )
}
```

In `frontend/components/dashboard/dashboard-state-card.tsx` vervang de imports (regels 1-3):

```tsx
import Link from 'next/link'
import type { DashboardState, DashboardStateTone } from '@/lib/dashboard/dashboard-state-resolver'
import { DashboardStateActions } from './dashboard-state-actions'
```

door:

```tsx
import Link from 'next/link'
import type { DashboardState, DashboardStateTone } from '@/lib/dashboard/dashboard-state-resolver'
import { CampaignTimeline } from './campaign-timeline'
import { DashboardStateActions } from './dashboard-state-actions'
```

en voeg direct na het progress-blok (anker: de regel `      ) : null}` die volgt op `{state.progressPct}% ingevuld`, regel 44) toe:

```tsx
      {state.timeline ? (
        <div className="mt-6">
          <CampaignTimeline timeline={state.timeline} />
        </div>
      ) : null}
```

In `frontend/components/dashboard/read-only-state-card.tsx` vervang regel 1:

```tsx
import type { DashboardState } from '@/lib/dashboard/dashboard-state-resolver'
```

door:

```tsx
import type { DashboardState } from '@/lib/dashboard/dashboard-state-resolver'
import { CampaignTimeline } from './campaign-timeline'
```

en voeg direct vóór de alinea `Alleen de eigenaar van deze Loep-omgeving kan de meting beheren.` (anker: `<p className="mt-6 text-sm text-[color:var(--dashboard-muted)]">`, regel 41) toe:

```tsx
      {state.timeline ? (
        <div className="mt-6">
          <CampaignTimeline timeline={state.timeline} />
        </div>
      ) : null}

```

- [ ] **Step 8: Wizard stap 3 toont de vooruitblik**

In `frontend/components/dashboard/setup-wizard-card.tsx` (stand na Task 3):

(a) Voeg bij de imports, direct na `import { ConfirmDialog } from './confirm-dialog'`, toe:

```tsx
import { CampaignTimeline } from './campaign-timeline'
import { buildCampaignTimeline } from '@/lib/dashboard/campaign-timeline'
```

(b) Voeg direct na de regel die `reminderDateLabel` berekent (anker: `reminderChoice !== 'none' && launchDate ? formatDutchDate(addDays(launchDate, reminderChoice)) : null`) toe:

```tsx
  // Vooruitblik voor stap 3 (spec 2026-09-16 par. 4.2): dezelfde tijdlijn als
  // op de kaart van een lopende meting, met wat de klant nu invult.
  const previewTimeline = buildCampaignTimeline({
    launchDate: launchDate || null,
    launchConfirmedAt: null,
    reminderEnabled: reminderChoice !== 'none',
    reminderAfterDays: reminderChoice === 'none' ? DEFAULT_REMINDER_AFTER_DAYS : reminderChoice,
    reminderHandledAt: null,
    reminderSkipped: false,
    closesAt: closesAt || null,
  })
```

(c) Vervang het hele stap 3-blok:

```tsx
        {/* Stap 3 */}
        <div className="relative rounded-[18px] border border-[color:var(--dashboard-frame-border)] bg-white p-5 opacity-45">
          <span className="absolute right-4 top-4 text-[color:var(--dashboard-muted)]">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
          </span>
          <p className="mb-3 text-xs font-semibold text-[color:var(--dashboard-muted)]">Stap 3</p>
          <p className="mb-1 text-sm font-semibold text-[color:var(--dashboard-ink)]">Volgen &amp; rapport</p>
          <p className="text-xs text-[color:var(--dashboard-muted)]">
            Respons monitoren · herinnering sturen · rapport via Loep.
          </p>
        </div>
```

door:

```tsx
        {/* Stap 3: vooruitblik. Na de lancering staat dezelfde tijdlijn op de kaart van de lopende meting. */}
        <div className="relative rounded-[18px] border border-[color:var(--dashboard-frame-border)] bg-white p-5">
          <span className="absolute right-4 top-4 text-[color:var(--dashboard-muted)]">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
          </span>
          <p className="mb-3 text-xs font-semibold text-[color:var(--dashboard-muted)]">Stap 3</p>
          <p className="mb-1 text-sm font-semibold text-[color:var(--dashboard-ink)]">Volgen en afronden</p>
          <p className="mb-4 text-xs text-[color:var(--dashboard-muted)]">
            Na de lancering volg je hier de respons en sluit je de meting.
          </p>
          <CampaignTimeline timeline={previewTimeline} dimmed />
        </div>
```

(d) Voeg aan `frontend/components/dashboard/setup-wizard-card.guard.test.ts` onderaan toe:

```ts
describe('setup-wizard stap 3 (spec 2026-09-16 par. 4.2)', () => {
  it('toont de tijdlijn als vooruitblik en belooft geen rapport via Loep', () => {
    expect(src).toContain('Volgen en afronden')
    expect(src).toContain('previewTimeline')
    expect(src).toContain('<CampaignTimeline timeline={previewTimeline} dimmed />')
    expect(src).not.toContain('rapport via Loep')
  })
})
```

- [ ] **Step 9: Pagina's leveren `reminderSkipped`**

In `frontend/app/(dashboard)/dashboard/page.tsx` vervang in de `Promise.all` de select van de herinneringsevents (regel 71):

```ts
      .select('created_at, action_key, outcome')
```

door:

```ts
      .select('created_at, action_key, outcome, metadata')
```

en voeg in de `resolveDashboardState({ ... })`-aanroep direct na `reminderAlreadySentAt: reminderEvents?.[0]?.created_at ?? null,` toe:

```ts
    reminderSkipped:
      ((reminderEvents?.[0] as { metadata?: { channel?: string } | null } | undefined)?.metadata?.channel ?? null) ===
      'skipped_by_customer',
```

In `frontend/app/(dashboard)/campaigns/[id]/page.tsx` doe hetzelfde: regel 66 `.select('created_at, action_key, outcome')` → `.select('created_at, action_key, outcome, metadata')`, en na `reminderAlreadySentAt: reminderEvents?.[0]?.created_at ?? null,` (regel 128) dezelfde `reminderSkipped:`-regels.

- [ ] **Step 10: Tests en tsc**

Run:
```bash
cd /c/Users/larsh/Desktop/Business/Verisight/.worktrees/klantsuite-2a/frontend
npx vitest run lib/dashboard components/dashboard 2>&1 | tail -15
npx tsc --noEmit 2>&1 | grep -c "error TS"
```
Expected: `campaign-timeline`, `running-state-card`, `setup-wizard-card.guard`, `read-only-state-card`, `dashboard-state-actions` PASS; in `dashboard-state-resolver.test.ts` faalt alleen nog `State 0 — no campaign` (stond al op de baseline; Task 5 herschrijft het bestand). tsc `133`.

- [ ] **Step 11: Commit**

```bash
cd /c/Users/larsh/Desktop/Business/Verisight/.worktrees/klantsuite-2a
git add frontend/lib/dashboard/campaign-timeline.ts frontend/lib/dashboard/campaign-timeline.test.ts frontend/components/dashboard/campaign-timeline.tsx frontend/components/dashboard/running-state-card.tsx frontend/components/dashboard/running-state-card.test.ts frontend/components/dashboard/dashboard-state-card.tsx frontend/components/dashboard/read-only-state-card.tsx frontend/components/dashboard/setup-wizard-card.tsx frontend/components/dashboard/setup-wizard-card.guard.test.ts frontend/lib/dashboard/dashboard-state-resolver.ts frontend/lib/dashboard/dashboard-state-resolver.test.ts "frontend/app/(dashboard)/dashboard/page.tsx" "frontend/app/(dashboard)/campaigns/[id]/page.tsx"
git commit -m "feat(dashboard): tijdlijn met datums op elke kaart van een lopende meting en als vooruitblik in stap 3

buildCampaignTimeline (start, herinnering, sluit) uit dezelfde data als de
resolver; 'rapport via Loep' weg; de lopende kaart toont vóór de
herinneringsdag geen herinneringstekst meer.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

### Task 5: Sluiten, verlengen en herinnering overslaan als echte knoppen; resolver met expired boven en onder de drempel en de eindtoestand

**Files:**
- Create: `frontend/lib/dashboard/campaign-extension.ts`
- Create: `frontend/lib/dashboard/campaign-extension.test.ts`
- Create: `frontend/app/(dashboard)/dashboard/dashboard-actions.lifecycle.test.ts`
- Modify: `frontend/app/(dashboard)/dashboard/dashboard-actions.ts:9-19` (imports) en onderaan (twee nieuwe acties)
- Modify: `frontend/app/(dashboard)/dashboard/dashboard-actions.test.ts` (extra `describe`)
- Modify: `frontend/lib/dashboard/dashboard-state-resolver.ts` (volledig)
- Modify: `frontend/lib/dashboard/dashboard-state-resolver.test.ts` (volledig)
- Modify: `frontend/components/dashboard/dashboard-state-actions.tsx` (volledig)
- Modify: `frontend/components/dashboard/dashboard-state-actions.test.ts` (volledig)
- Modify: `frontend/components/dashboard/dashboard-state-card.tsx` (volledig)
- Modify: `frontend/app/(dashboard)/dashboard/page.tsx` (extra query in `Promise.all`, `extensionCount`) en `page.test.ts`
- Modify: `frontend/app/(dashboard)/campaigns/[id]/page.tsx` (idem)

- [ ] **Step 1: Falende tests voor de verleng-logica**

Maak `frontend/lib/dashboard/campaign-extension.test.ts`:

```ts
import { describe, expect, it } from 'vitest'
import {
  EXTENSION_DAYS,
  MAX_EXTENSIONS,
  canExtendCampaign,
  computeExtendedClosesAt,
  extensionsLeft,
} from './campaign-extension'

describe('campaign-extension (spec 2026-09-16 par. 4.3)', () => {
  it('verlengt met twee weken, maximaal drie keer', () => {
    expect(EXTENSION_DAYS).toBe(14)
    expect(MAX_EXTENSIONS).toBe(3)
  })

  it('telt vanaf de sluitdatum als die nog in de toekomst ligt, anders vanaf vandaag', () => {
    expect(computeExtendedClosesAt('2026-10-07', '2026-09-20')).toBe('2026-10-21')
    expect(computeExtendedClosesAt('2026-09-10', '2026-09-20')).toBe('2026-10-04')
    expect(computeExtendedClosesAt('2026-09-20', '2026-09-20')).toBe('2026-10-04')
    expect(computeExtendedClosesAt(null, '2026-09-20')).toBe('2026-10-04')
  })

  it('accepteert een volledige ISO-timestamp als sluitdatum', () => {
    expect(computeExtendedClosesAt('2026-10-07T00:00:00Z', '2026-09-20')).toBe('2026-10-21')
  })

  it('staat verlengen toe tot en met de derde keer', () => {
    expect(canExtendCampaign(0)).toBe(true)
    expect(canExtendCampaign(2)).toBe(true)
    expect(canExtendCampaign(3)).toBe(false)
    expect(canExtendCampaign(7)).toBe(false)
    expect(canExtendCampaign(Number.NaN)).toBe(false)
    expect(extensionsLeft(0)).toBe(3)
    expect(extensionsLeft(2)).toBe(1)
    expect(extensionsLeft(3)).toBe(0)
    expect(extensionsLeft(Number.NaN)).toBe(0)
  })
})
```

- [ ] **Step 2: Run om te zien dat hij faalt**

Run:
```bash
cd /c/Users/larsh/Desktop/Business/Verisight/.worktrees/klantsuite-2a/frontend
npx vitest run lib/dashboard/campaign-extension.test.ts 2>&1 | tail -6
```
Expected: FAIL, module niet gevonden.

- [ ] **Step 3: `campaign-extension.ts`**

Maak `frontend/lib/dashboard/campaign-extension.ts`:

```ts
import { addDays } from '@/lib/campaign-schedule'

/** Verlengen (spec 2026-09-16 par. 4.3): twee weken per keer, maximaal drie keer per meting. */
export const EXTENSION_DAYS = 14
export const MAX_EXTENSIONS = 3

export function canExtendCampaign(extensionCount: number): boolean {
  return Number.isFinite(extensionCount) && extensionCount < MAX_EXTENSIONS
}

export function extensionsLeft(extensionCount: number): number {
  if (!Number.isFinite(extensionCount)) return 0
  return Math.max(0, MAX_EXTENSIONS - extensionCount)
}

/** closes_at = max(vandaag, closes_at) + EXTENSION_DAYS. Beide als YYYY-MM-DD. */
export function computeExtendedClosesAt(closesAt: string | null, today: string): string {
  const current = closesAt ? closesAt.slice(0, 10) : null
  const base = current && current > today ? current : today
  return addDays(base, EXTENSION_DAYS)
}
```

- [ ] **Step 4: Run de verleng-tests**

Run:
```bash
cd /c/Users/larsh/Desktop/Business/Verisight/.worktrees/klantsuite-2a/frontend
npx vitest run lib/dashboard/campaign-extension.test.ts 2>&1 | tail -6
```
Expected: PASS (4 tests).

- [ ] **Step 5: Falende tests voor `extendCampaignAction` en `skipReminderAction`**

Maak `frontend/app/(dashboard)/dashboard/dashboard-actions.lifecycle.test.ts`:

```ts
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { computeExtendedClosesAt } from '@/lib/dashboard/campaign-extension'

let orgMemberRole: string | null = 'owner'
let isAdmin = false
let closesAt: string | null = '2026-10-07'
let isActive = true
let extensionCount = 0
let campaignUpdates: Array<Record<string, unknown>> = []
let auditInserts: Array<Record<string, unknown>> = []
let auditInsertError: { message: string } | null = null

interface CountChain {
  eq: (...args: unknown[]) => CountChain
  contains: (...args: unknown[]) => Promise<{ count: number; error: null }>
}

function auditCountChain(): CountChain {
  const chain: CountChain = {
    eq: () => chain,
    contains: async () => ({ count: extensionCount, error: null }),
  }
  return chain
}

vi.mock('@/lib/email', () => ({ sendLoepEmail: async () => undefined }))

vi.mock('@/lib/supabase/server', () => ({
  createClient: async () => ({
    auth: { getUser: async () => ({ data: { user: { id: 'user-1' } } }) },
    from: (table: string) => {
      if (table === 'campaigns') {
        return {
          select: () => ({
            eq: () => ({
              single: async () => ({ data: { organization_id: 'org-1' } }),
              maybeSingle: async () => ({ data: { closes_at: closesAt, is_active: isActive }, error: null }),
            }),
          }),
          update: (payload: Record<string, unknown>) => ({
            eq: () => ({
              select: async () => {
                campaignUpdates.push(payload)
                return { data: [{ id: 'campaign-1' }], error: null }
              },
            }),
          }),
        }
      }
      if (table === 'profiles') {
        return {
          select: () => ({ eq: () => ({ maybeSingle: async () => ({ data: { is_verisight_admin: isAdmin } }) }) }),
        }
      }
      if (table === 'org_members') {
        return {
          select: () => ({
            eq: () => ({
              eq: () => ({ maybeSingle: async () => ({ data: orgMemberRole ? { role: orgMemberRole } : null }) }),
            }),
          }),
        }
      }
      if (table === 'campaign_action_audit_events') {
        return {
          select: () => auditCountChain(),
          insert: async (payload: Record<string, unknown>) => {
            auditInserts.push(payload)
            return { error: auditInsertError }
          },
        }
      }
      return {}
    },
  }),
}))

import { extendCampaignAction, skipReminderAction } from './dashboard-actions'

const today = new Date().toISOString().slice(0, 10)

beforeEach(() => {
  orgMemberRole = 'owner'
  isAdmin = false
  closesAt = '2026-10-07'
  isActive = true
  extensionCount = 0
  campaignUpdates = []
  auditInserts = []
  auditInsertError = null
})

describe('extendCampaignAction (spec 2026-09-16 par. 4.3)', () => {
  it('zet closes_at op max(vandaag, closes_at) + 14 dagen en logt de verlenging', async () => {
    closesAt = '2099-01-10'
    const result = await extendCampaignAction('campaign-1')
    expect(result).toEqual({ ok: true })
    expect(campaignUpdates).toEqual([{ closes_at: '2099-01-24' }])
    expect(auditInserts).toHaveLength(1)
    expect(auditInserts[0]).toMatchObject({
      action_key: 'delivery_lifecycle_changed',
      outcome: 'completed',
      metadata: { extension: true, previous_closes_at: '2099-01-10', new_closes_at: '2099-01-24', extension_number: 1 },
    })
    expect(String(auditInserts[0]?.summary)).toContain('Sluitdatum verlengd tot 24 januari 2099')
  })

  it('telt vanaf vandaag als de sluitdatum al voorbij is of ontbreekt', async () => {
    closesAt = null
    await extendCampaignAction('campaign-1')
    expect(campaignUpdates).toEqual([{ closes_at: computeExtendedClosesAt(null, today) }])
  })

  it('weigert na drie verlengingen met een duidelijke melding', async () => {
    extensionCount = 3
    const result = await extendCampaignAction('campaign-1')
    expect(result).toEqual({ ok: false, error: 'Deze meting is al 3 keer verlengd. Je kunt hem alleen nog sluiten.' })
    expect(campaignUpdates).toHaveLength(0)
  })

  it('weigert voor een gesloten meting', async () => {
    isActive = false
    const result = await extendCampaignAction('campaign-1')
    expect(result).toEqual({ ok: false, error: 'Deze meting is al gesloten en kan niet meer verlengd worden.' })
  })

  it('weigert voor een lid zonder eigenaarsrol', async () => {
    orgMemberRole = 'member'
    const result = await extendCampaignAction('campaign-1')
    expect(result.ok).toBe(false)
    expect(campaignUpdates).toHaveLength(0)
  })

  it('staat de operator toe', async () => {
    orgMemberRole = null
    isAdmin = true
    const result = await extendCampaignAction('campaign-1')
    expect(result).toEqual({ ok: true })
  })

  it('meldt het als de verlenging wel is opgeslagen maar niet gelogd (Fail Loud)', async () => {
    auditInsertError = { message: 'insert denied' }
    const result = await extendCampaignAction('campaign-1')
    expect(result.ok).toBe(true)
    expect(result.warning).toContain('kon dat niet vastleggen')
  })
})

describe('skipReminderAction (spec 2026-09-16 par. 4.3)', () => {
  it('logt een send_reminders-event met channel skipped_by_customer', async () => {
    const result = await skipReminderAction('campaign-1')
    expect(result).toEqual({ ok: true })
    expect(auditInserts).toHaveLength(1)
    expect(auditInserts[0]).toMatchObject({
      action_key: 'send_reminders',
      outcome: 'completed',
      summary: 'HR koos ervoor geen herinnering te versturen.',
      metadata: { channel: 'skipped_by_customer' },
    })
  })

  it('weigert voor een lid zonder eigenaarsrol', async () => {
    orgMemberRole = 'viewer'
    const result = await skipReminderAction('campaign-1')
    expect(result.ok).toBe(false)
    expect(auditInserts).toHaveLength(0)
  })

  it('geeft een fout terug als het loggen faalt', async () => {
    auditInsertError = { message: 'insert denied' }
    const result = await skipReminderAction('campaign-1')
    expect(result).toEqual({ ok: false, error: 'Overslaan mislukt: insert denied' })
  })
})
```

Voeg aan `frontend/app/(dashboard)/dashboard/dashboard-actions.test.ts` onderaan toe:

```ts
describe('levenscyclus-acties (spec 2026-09-16 par. 4.3)', () => {
  it('exporteert extendCampaignAction en skipReminderAction met de afgesproken auditvorm', () => {
    expect(source).toContain('export async function extendCampaignAction')
    expect(source).toContain('export async function skipReminderAction')
    expect(source).toContain("contains('metadata', { extension: true })")
    expect(source).toContain("channel: 'skipped_by_customer'")
    expect(source).toContain('computeExtendedClosesAt')
    expect(source).toContain('canExtendCampaign')
  })
})
```

- [ ] **Step 6: Run om te zien dat ze falen**

Run:
```bash
cd /c/Users/larsh/Desktop/Business/Verisight/.worktrees/klantsuite-2a/frontend
npx vitest run "app/(dashboard)/dashboard/dashboard-actions.lifecycle.test.ts" "app/(dashboard)/dashboard/dashboard-actions.test.ts" 2>&1 | tail -12
```
Expected: FAIL: `extendCampaignAction` en `skipReminderAction` bestaan niet.

- [ ] **Step 7: De twee acties**

In `frontend/app/(dashboard)/dashboard/dashboard-actions.ts` vervang regels 9-19 (de imports):

```ts
import { createClient } from '@/lib/supabase/server'
import { insertCampaignAuditEvent } from '@/lib/campaign-audit'
import type { CampaignAuditActorRole } from '@/lib/campaign-audit'
import { getCustomerActionPermission, getPermissionDeniedMessage } from '@/lib/customer-permissions'
import type { MemberRole } from '@/lib/types'
import { sendLoepEmail } from '@/lib/email'
import { rapportGereedHtml } from '@/lib/email-templates/rapport-gereed'
import { isReportReleaseReady } from '@/lib/response-activation'
import { buildReportMailRecipients, countCustomerRecipients } from '@/lib/report-mail-recipients'
import { getOperatorEmail, LOEP_CONTACT_EMAIL } from '@/lib/loep-contact'
import type { ScanType } from '@/lib/types'
```

door:

```ts
import { createClient } from '@/lib/supabase/server'
import { insertCampaignAuditEvent } from '@/lib/campaign-audit'
import type { CampaignAuditActorRole } from '@/lib/campaign-audit'
import { getCustomerActionPermission, getPermissionDeniedMessage } from '@/lib/customer-permissions'
import type { MemberRole } from '@/lib/types'
import { sendLoepEmail } from '@/lib/email'
import { rapportGereedHtml } from '@/lib/email-templates/rapport-gereed'
import { isReportReleaseReady } from '@/lib/response-activation'
import { buildReportMailRecipients, countCustomerRecipients } from '@/lib/report-mail-recipients'
import { getOperatorEmail, LOEP_CONTACT_EMAIL } from '@/lib/loep-contact'
import { formatDutchDate } from '@/lib/dashboard/format-dutch-date'
import { canExtendCampaign, computeExtendedClosesAt, MAX_EXTENSIONS } from '@/lib/dashboard/campaign-extension'
import type { ScanType } from '@/lib/types'
```

Voeg onderaan het bestand (na de sluitende `}` van `closeCampaignAction`) toe:

```ts

/**
 * Verlengen (spec 2026-09-16 par. 4.3): closes_at = max(vandaag, closes_at) + 14
 * dagen, maximaal MAX_EXTENSIONS keer per meting. De teller is het aantal
 * delivery_lifecycle_changed-events met metadata.extension = true; geen nieuwe
 * outcome-waarde, want de audittabel is live aangemaakt en een onbekende
 * check-constraint is een risico.
 */
export async function extendCampaignAction(campaignId: string): Promise<DashboardActionResult> {
  const ctx = await loadActorContext(campaignId)
  if (!ctx.ok) return { ok: false, error: ctx.error }

  const canManage = ctx.isAdmin || getCustomerActionPermission(ctx.role, 'review_launch')
  if (!canManage) return { ok: false, error: getPermissionDeniedMessage('review_launch') }

  const [{ data: campaignRow, error: campaignError }, { count: extensionCount, error: countError }] = await Promise.all([
    ctx.supabase.from('campaigns').select('closes_at, is_active').eq('id', campaignId).maybeSingle(),
    ctx.supabase
      .from('campaign_action_audit_events')
      .select('id', { count: 'exact', head: true })
      .eq('campaign_id', campaignId)
      .eq('action_key', 'delivery_lifecycle_changed')
      .eq('outcome', 'completed')
      .contains('metadata', { extension: true }),
  ])

  if (campaignError || !campaignRow) {
    return { ok: false, error: `Verlengen mislukt: ${campaignError?.message ?? 'campagne niet gevonden of geen rechten'}.` }
  }
  if (countError) {
    return {
      ok: false,
      error: `Verlengen mislukt: Loep kon niet vaststellen hoe vaak deze meting al verlengd is (${countError.message}).`,
    }
  }

  const row = campaignRow as { closes_at: string | null; is_active: boolean }
  if (!row.is_active) return { ok: false, error: 'Deze meting is al gesloten en kan niet meer verlengd worden.' }

  const used = extensionCount ?? 0
  if (!canExtendCampaign(used)) {
    return { ok: false, error: `Deze meting is al ${MAX_EXTENSIONS} keer verlengd. Je kunt hem alleen nog sluiten.` }
  }

  const today = new Date().toISOString().slice(0, 10)
  const nextClosesAt = computeExtendedClosesAt(row.closes_at, today)
  const nextClosesAtLabel = formatDutchDate(nextClosesAt) ?? nextClosesAt

  const { data: updated, error: updateError } = await ctx.supabase
    .from('campaigns')
    .update({ closes_at: nextClosesAt })
    .eq('id', campaignId)
    .select('id')
  if (updateError) return { ok: false, error: `Verlengen mislukt: ${updateError.message}` }
  if (!updated || updated.length === 0) {
    return { ok: false, error: 'Verlengen mislukt: campagne niet gevonden of geen rechten.' }
  }

  const { error: auditError } = await insertCampaignAuditEvent({
    supabase: ctx.supabase,
    organizationId: ctx.organizationId,
    campaignId,
    actorUserId: ctx.user.id,
    actorRole: ctx.actorRole,
    action: 'delivery_lifecycle_changed',
    outcome: 'completed',
    summary: `Sluitdatum verlengd tot ${nextClosesAtLabel}.`,
    metadata: {
      extension: true,
      previous_closes_at: row.closes_at,
      new_closes_at: nextClosesAt,
      extension_number: used + 1,
    },
  })
  if (auditError) {
    // De datum staat al; de teller mist deze keer. Zeggen, niet verzwijgen.
    return {
      ok: true,
      warning: `De sluitdatum is verlengd tot ${nextClosesAtLabel}, maar Loep kon dat niet vastleggen (${auditError.message}). Mail ${LOEP_CONTACT_EMAIL} als je nog een keer wilt verlengen.`,
    }
  }

  return { ok: true }
}

/**
 * Herinnering overslaan (spec 2026-09-16 par. 4.3): een send_reminders-event
 * met channel 'skipped_by_customer'. isReminderDue telt elk send_reminders-
 * event op of na de vervaldatum als afgehandeld, dus de herinneringskaart
 * verdwijnt daarna eerlijk.
 */
export async function skipReminderAction(campaignId: string): Promise<DashboardActionResult> {
  const ctx = await loadActorContext(campaignId)
  if (!ctx.ok) return { ok: false, error: ctx.error }

  const canSend = ctx.isAdmin || getCustomerActionPermission(ctx.role, 'send_reminders')
  if (!canSend) return { ok: false, error: getPermissionDeniedMessage('send_reminders') }

  const { error } = await insertCampaignAuditEvent({
    supabase: ctx.supabase,
    organizationId: ctx.organizationId,
    campaignId,
    actorUserId: ctx.user.id,
    actorRole: ctx.actorRole,
    action: 'send_reminders',
    outcome: 'completed',
    summary: 'HR koos ervoor geen herinnering te versturen.',
    metadata: { channel: 'skipped_by_customer' },
  })
  if (error) return { ok: false, error: `Overslaan mislukt: ${error.message}` }

  return { ok: true }
}
```

- [ ] **Step 8: Run de action-tests**

Run:
```bash
cd /c/Users/larsh/Desktop/Business/Verisight/.worktrees/klantsuite-2a/frontend
npx vitest run "app/(dashboard)/dashboard/dashboard-actions.lifecycle.test.ts" "app/(dashboard)/dashboard/dashboard-actions.test.ts" 2>&1 | tail -8
```
Expected: PASS (10 + 9 tests).

- [ ] **Step 9: Falende resolvertests (volledig nieuw bestand)**

Vervang `frontend/lib/dashboard/dashboard-state-resolver.test.ts` volledig door:

```ts
// frontend/lib/dashboard/dashboard-state-resolver.test.ts
import { describe, expect, it } from 'vitest'
import { resolveDashboardState, type DashboardStateInput } from './dashboard-state-resolver'

function baseInput(overrides: Partial<DashboardStateInput> = {}): DashboardStateInput {
  return {
    campaign: {
      id: 'camp-1',
      name: 'Loep Vertrek Q2 2026',
      scanType: 'exit',
      isActive: true,
      totalInvited: 20,
      totalCompleted: 0,
      completionRatePct: 0,
      closedAt: null,
    },
    launchConfirmedAt: '2026-06-01T09:00:00Z',
    launchDate: '2026-06-01',
    closesAt: null,
    reminderConfig: { enabled: true, firstReminderAfterDays: 5, maxReminderCount: 1 },
    reminderAlreadySentAt: null,
    reminderSkipped: false,
    extensionCount: 0,
    reportReady: false,
    today: '2026-06-03',
    ...overrides,
  }
}

function withCampaign(overrides: Partial<NonNullable<DashboardStateInput['campaign']>>) {
  return { ...baseInput().campaign!, ...overrides }
}

describe('resolveDashboardState', () => {
  it('State 0 — no campaign', () => {
    const state = resolveDashboardState(baseInput({ campaign: null }))
    expect(state.kind).toBe('no_campaign')
    expect(state.primaryMessage).toBe('Er staat momenteel geen scan voor je klaar')
    expect(state.ctaLabel).toBeNull()
    expect(state.timeline).toBeNull()
  })

  it('State 1 — setup when invites are not launched yet', () => {
    const state = resolveDashboardState(baseInput({ launchConfirmedAt: null }))
    expect(state.kind).toBe('setup')
    expect(state.primaryMessage).toBe('Stap 1: stel de startdatum in')
    expect(state.ctaLabel).toBe('Start de setup →')
    expect(state.ctaHref).toBe('/campaigns/camp-1/setup')
    expect(state.secondaryActions).toEqual([])
  })

  it('State 1 — setup when no respondents are imported yet (even if confirmed)', () => {
    const state = resolveDashboardState(baseInput({ campaign: withCampaign({ totalInvited: 0 }) }))
    expect(state.kind).toBe('setup')
  })

  it('State 2 — running: geen primaire actie, wel altijd "Meting sluiten" (spec 4.3)', () => {
    const state = resolveDashboardState(
      baseInput({ campaign: withCampaign({ totalCompleted: 3, completionRatePct: 15 }), closesAt: '2026-06-22' }),
    )
    expect(state.kind).toBe('running')
    expect(state.primaryMessage).toBe('Campagne loopt')
    expect(state.tone).toBe('positive')
    expect(state.ctaLabel).toBeNull()
    expect(state.progressPct).toBe(15)
    expect(state.subtext).toBe('3 van 20 ingevuld')
    expect(state.secondaryActions).toEqual([{ label: 'Meting sluiten', kind: 'close_campaign' }])
    expect(state.totalCompleted).toBe(3)
    expect(state.totalInvited).toBe(20)
    expect(state.reportReady).toBe(false)
    expect(state.reportThreshold).toBe(10)
    expect(state.canExtend).toBe(true)
    expect(state.extensionsLeft).toBe(3)
  })

  it('State 3 — reminder day takes priority over running and offers skip and close', () => {
    const state = resolveDashboardState(baseInput({ campaign: withCampaign({ totalCompleted: 3 }), today: '2026-06-06' }))
    expect(state.kind).toBe('action')
    expect(state.actionVariant).toBe('reminder')
    expect(state.primaryMessage).toBe('Vandaag: stuur de herinnering')
    expect(state.ctaKind).toBe('copy_reminder')
    expect(state.ctaLabel).toBe('Ik heb de herinnering verstuurd')
    expect(state.tone).toBe('attention')
    expect(state.secondaryActions).toEqual([
      { label: 'Geen herinnering versturen', kind: 'skip_reminder' },
      { label: 'Meting sluiten', kind: 'close_campaign' },
    ])
  })

  it('State 3 — vóór de herinneringsdag is de kaart gewoon "running" (spec 4.4)', () => {
    const state = resolveDashboardState(baseInput({ campaign: withCampaign({ totalCompleted: 3 }), today: '2026-06-05' }))
    expect(state.kind).toBe('running')
    expect(state.timeline?.items[1]).toMatchObject({ label: 'Herinnering', value: '6 juni 2026', done: false })
  })

  it('State 3 — een overgeslagen herinnering telt als afgehandeld en staat zo in de tijdlijn', () => {
    const state = resolveDashboardState(
      baseInput({
        campaign: withCampaign({ totalCompleted: 3 }),
        today: '2026-06-08',
        reminderAlreadySentAt: '2026-06-06T10:00:00Z',
        reminderSkipped: true,
      }),
    )
    expect(state.kind).toBe('running')
    expect(state.timeline?.items[1]).toMatchObject({ value: 'Overgeslagen', done: true })
  })

  it('State 3 — sufficient response: rapportdrempel gehaald, sluiten mag maar hoeft niet', () => {
    const state = resolveDashboardState(
      baseInput({ campaign: withCampaign({ totalCompleted: 12, completionRatePct: 60 }), reportReady: true }),
    )
    expect(state.kind).toBe('action')
    expect(state.actionVariant).toBe('sufficient_response')
    expect(state.primaryMessage).toBe('Voldoende respons voor een rapport')
    expect(state.subtext).toContain('Je kunt de meting sluiten of nog even open laten.')
    expect(state.subtext).toContain('12 van 20 ingevuld (60%)')
    expect(state.ctaLabel).toBe('Meting sluiten')
    expect(state.ctaKind).toBe('close_campaign')
    expect(state.reportReady).toBe(true)
  })

  it('State 3 — expired boven de drempel: sluiten primair, verlengen secundair (spec 4.3)', () => {
    const state = resolveDashboardState(
      baseInput({ campaign: withCampaign({ totalCompleted: 12, completionRatePct: 60 }), reportReady: true, closesAt: '2026-06-05', today: '2026-06-06' }),
    )
    expect(state.kind).toBe('action')
    expect(state.actionVariant).toBe('expired')
    expect(state.primaryMessage).toBe('De sluitdatum is bereikt')
    expect(state.ctaLabel).toBe('Meting sluiten')
    expect(state.ctaKind).toBe('close_campaign')
    expect(state.secondaryActions).toEqual([{ label: 'Twee weken verlengen', kind: 'extend' }])
    expect(state.subtext).toBe('12 van 20 ingevuld (60%). Sluit de meting, dan staat het rapport klaar.')
  })

  it('State 3 — expired onder de drempel: verlengen primair, toch sluiten secundair', () => {
    const state = resolveDashboardState(
      baseInput({ campaign: withCampaign({ totalCompleted: 6, completionRatePct: 30 }), closesAt: '2026-06-05', today: '2026-06-06' }),
    )
    expect(state.actionVariant).toBe('expired')
    expect(state.ctaLabel).toBe('Twee weken verlengen')
    expect(state.ctaKind).toBe('extend')
    expect(state.secondaryActions).toEqual([{ label: 'Toch sluiten', kind: 'close_campaign' }])
    expect(state.subtext).toBe(
      '6 van 20 ingevuld (30%). Voor een rapport zijn minimaal 10 antwoorden nodig. Verleng met twee weken of sluit zonder rapport.',
    )
  })

  it('State 3 — expired onder de drempel na drie verlengingen: alleen nog sluiten', () => {
    const state = resolveDashboardState(
      baseInput({ campaign: withCampaign({ totalCompleted: 6, completionRatePct: 30 }), closesAt: '2026-06-05', today: '2026-06-06', extensionCount: 3 }),
    )
    expect(state.actionVariant).toBe('expired')
    expect(state.ctaLabel).toBe('Meting sluiten')
    expect(state.ctaKind).toBe('close_campaign')
    expect(state.secondaryActions).toEqual([])
    expect(state.canExtend).toBe(false)
    expect(state.extensionsLeft).toBe(0)
    expect(state.subtext).toContain('al 3 keer verlengd')
  })

  it('State 3 — expired boven de drempel na drie verlengingen: geen verleng-optie meer', () => {
    const state = resolveDashboardState(
      baseInput({ campaign: withCampaign({ totalCompleted: 12 }), reportReady: true, closesAt: '2026-06-05', today: '2026-06-06', extensionCount: 3 }),
    )
    expect(state.ctaLabel).toBe('Meting sluiten')
    expect(state.secondaryActions).toEqual([])
  })

  it('State 3 — expired fires even when closesAt is a full ISO timestamp', () => {
    const state = resolveDashboardState(
      baseInput({ campaign: withCampaign({ totalCompleted: 12 }), closesAt: '2026-06-05T22:00:00Z', today: '2026-06-06' }),
    )
    expect(state.actionVariant).toBe('expired')
  })

  it('State 3b — processing/generating when closed and enough responses but report not yet ready', () => {
    const state = resolveDashboardState(
      baseInput({ campaign: withCampaign({ isActive: false, totalCompleted: 12, closedAt: '2026-06-10T09:00:00Z' }), reportReady: false }),
    )
    expect(state.kind).toBe('processing')
    expect(state.processingVariant).toBe('generating')
    expect(state.primaryMessage).toBe('Rapport wordt voorbereid')
  })

  it('State 3b — gesloten onder de drempel is een eindtoestand met contact (spec 4.5)', () => {
    const state = resolveDashboardState(
      baseInput({ campaign: withCampaign({ isActive: false, totalCompleted: 7, closedAt: '2026-06-10T09:00:00Z' }), reportReady: false }),
    )
    expect(state.kind).toBe('processing')
    expect(state.processingVariant).toBe('insufficient_response')
    expect(state.primaryMessage).toBe('Gesloten zonder rapport')
    expect(state.subtext).toBe(
      'Deze meting is gesloten met 7 ingevulde vragenlijsten. Voor een rapport zijn er minimaal 10 nodig. Wil je opnieuw meten? Mail Loep.',
    )
    expect(state.ctaKind).toBe('link')
    expect(state.ctaLabel).toBe('Mail Loep')
    expect(state.ctaHref).toBe('mailto:hallo@getloep.nl?subject=Opnieuw%20meten%3A%20Loep%20Vertrek%20Q2%202026')
    expect(state.subtext).not.toContain('e-mail')
    expect(state.timeline).toBeNull()
  })

  it('State 4 — report ready when closed and report is available', () => {
    const state = resolveDashboardState(
      baseInput({ campaign: withCampaign({ isActive: false, totalCompleted: 14, closedAt: '2026-06-10T09:00:00Z' }), reportReady: true }),
    )
    expect(state.kind).toBe('report_ready')
    expect(state.primaryMessage).toBe('Je rapport is beschikbaar')
    expect(state.ctaLabel).toBe('Open rapport')
    expect(state.ctaHref).toBe('/campaigns/camp-1')
  })

  it('houdt de culture_assessment-drempel van 30 als reportThreshold', () => {
    const state = resolveDashboardState(baseInput({ campaign: withCampaign({ scanType: 'culture_assessment', totalCompleted: 3 }) }))
    expect(state.reportThreshold).toBe(30)
  })

  it('degradeert het sluitlabel eerlijk als er geen sluitdatum is en zet dat ook in de tijdlijn', () => {
    const state = resolveDashboardState(baseInput({ campaign: withCampaign({ totalCompleted: 3 }) }))
    expect(state.kind).toBe('running')
    expect(state.closeDateLabel).toBe('Sluitdatum: nog niet ingesteld')
    expect(state.timeline?.items.map((i) => i.value)).toEqual(['1 juni 2026', '6 juni 2026', 'Nog niet ingesteld'])
  })

  it('geeft een lopende meting een tijdlijn met de sluitdatum, en een niet-gelanceerde geen', () => {
    const running = resolveDashboardState(baseInput({ campaign: withCampaign({ totalCompleted: 3 }), closesAt: '2026-06-22' }))
    expect(running.timeline?.items.map((i) => [i.label, i.value])).toEqual([
      ['Uitnodiging verstuurd', '1 juni 2026'],
      ['Herinnering', '6 juni 2026'],
      ['Meting sluit', '22 juni 2026'],
    ])
    expect(resolveDashboardState(baseInput({ launchConfirmedAt: null })).timeline).toBeNull()
  })

  it('bevat nergens em- of en-dashes in klantcopy', () => {
    const inputs = [
      baseInput({ campaign: null }),
      baseInput({ launchConfirmedAt: null }),
      baseInput({ campaign: withCampaign({ totalCompleted: 3 }) }),
      baseInput({ campaign: withCampaign({ totalCompleted: 3 }), today: '2026-06-06' }),
      baseInput({ campaign: withCampaign({ totalCompleted: 12 }), reportReady: true }),
      baseInput({ campaign: withCampaign({ totalCompleted: 6 }), closesAt: '2026-06-05', today: '2026-06-06' }),
      baseInput({ campaign: withCampaign({ totalCompleted: 12 }), reportReady: true, closesAt: '2026-06-05', today: '2026-06-06' }),
      baseInput({ campaign: withCampaign({ isActive: false, totalCompleted: 7 }) }),
      baseInput({ campaign: withCampaign({ isActive: false, totalCompleted: 14 }), reportReady: true }),
    ]
    for (const input of inputs) {
      const state = resolveDashboardState(input)
      expect(state.primaryMessage).not.toMatch(/[—–]/)
      expect(state.subtext).not.toMatch(/[—–]/)
      for (const action of state.secondaryActions) expect(action.label).not.toMatch(/[—–]/)
    }
  })
})
```

- [ ] **Step 10: Run om te zien dat ze falen**

Run:
```bash
cd /c/Users/larsh/Desktop/Business/Verisight/.worktrees/klantsuite-2a/frontend
npx vitest run lib/dashboard/dashboard-state-resolver.test.ts 2>&1 | tail -20
```
Expected: FAIL op o.a. `secondaryActions` van running, `Meting sluiten`, `De sluitdatum is bereikt`, `Gesloten zonder rapport`, `reportThreshold`.

- [ ] **Step 11: Resolver volledig herschrijven**

Vervang `frontend/lib/dashboard/dashboard-state-resolver.ts` door:

```ts
// frontend/lib/dashboard/dashboard-state-resolver.ts
import type { ScanType } from '@/lib/types'
import { getResponseActivationThresholds } from '@/lib/response-activation'
import { isReminderDue } from '@/lib/dashboard/reminder-due'
import { formatDutchDate } from '@/lib/dashboard/format-dutch-date'
import { buildCampaignTimeline, type CampaignTimeline } from '@/lib/dashboard/campaign-timeline'
import { canExtendCampaign, extensionsLeft, MAX_EXTENSIONS } from '@/lib/dashboard/campaign-extension'
import { LOEP_CONTACT_EMAIL } from '@/lib/loep-contact'

export type DashboardStateKind =
  | 'no_campaign'
  | 'setup'
  | 'running'
  | 'action'
  | 'processing'
  | 'report_ready'

export type DashboardActionVariant = 'reminder' | 'sufficient_response' | 'expired'
export type DashboardProcessingVariant = 'generating' | 'insufficient_response'
export type DashboardStateTone = 'neutral' | 'calm' | 'positive' | 'attention'

export interface DashboardStateCampaign {
  id: string
  name: string
  scanType: ScanType
  isActive: boolean
  totalInvited: number
  totalCompleted: number
  completionRatePct: number
  closedAt: string | null
}

export interface DashboardReminderConfig {
  enabled: boolean
  firstReminderAfterDays: number
  maxReminderCount: number
}

export interface DashboardStateInput {
  campaign: DashboardStateCampaign | null
  launchConfirmedAt: string | null
  launchDate: string | null
  /** campaigns.closes_at (date). Null bij metingen van vóór de wizard-sluitdatum: dan geen expired-trigger en een eerlijk "nog niet ingesteld". */
  closesAt: string | null
  reminderConfig: DashboardReminderConfig
  /** created_at van het meest recente send_reminders-event (verstuurd of overgeslagen), of null. */
  reminderAlreadySentAt: string | null
  /** Dat event had metadata.channel = 'skipped_by_customer'. */
  reminderSkipped: boolean
  /** Aantal delivery_lifecycle_changed-events met metadata.extension = true. */
  extensionCount: number
  /** isReportReleaseReady(total_completed, { scanType }): 10 ingevuld (30 bij culture_assessment). */
  reportReady: boolean
  /** Injected YYYY-MM-DD for deterministic tests. */
  today: string
}

export type DashboardCtaKind = 'link' | 'copy_reminder' | 'close_campaign' | 'extend'
export type DashboardSecondaryActionKind = 'link' | 'close_campaign' | 'extend' | 'skip_reminder'

export interface DashboardSecondaryAction {
  label: string
  /** 'link' renders an anchor; the others are handled by the client island. */
  kind: DashboardSecondaryActionKind
  href?: string
}

export interface DashboardState {
  kind: DashboardStateKind
  actionVariant: DashboardActionVariant | null
  processingVariant: DashboardProcessingVariant | null
  campaignId: string | null
  primaryMessage: string
  subtext: string
  tone: DashboardStateTone
  ctaLabel: string | null
  ctaHref: string | null
  /** copy_reminder, close_campaign en extend worden door het client-eiland afgehandeld. */
  ctaKind: DashboardCtaKind | null
  secondaryActions: DashboardSecondaryAction[]
  showProgress: boolean
  progressPct: number
  closeDateLabel: string
  /** Tijdlijn met datums (spec 2026-09-16 par. 4.2); alleen voor een gelanceerde, lopende meting. */
  timeline: CampaignTimeline | null
  /** Voor de sluitdialoog (spec par. 4.3): X van Y, en of er bij sluiting een rapport is. */
  totalCompleted: number
  totalInvited: number
  reportReady: boolean
  reportThreshold: number
  canExtend: boolean
  extensionsLeft: number
  /** Set true where a real backend field is missing and the value is derived/degraded. */
  degraded: boolean
}

function buildCloseDateLabel(closesAt: string | null): { label: string; degraded: boolean } {
  const formatted = formatDutchDate(closesAt)
  if (!formatted) return { label: 'Sluitdatum: nog niet ingesteld', degraded: true }
  return { label: `Sluit ${formatted}`, degraded: false }
}

const EMPTY_STATE: Omit<DashboardState, 'kind' | 'primaryMessage' | 'subtext' | 'tone'> = {
  actionVariant: null,
  processingVariant: null,
  campaignId: null,
  ctaLabel: null,
  ctaHref: null,
  ctaKind: null,
  secondaryActions: [],
  showProgress: false,
  progressPct: 0,
  closeDateLabel: 'Sluitdatum: nog niet ingesteld',
  timeline: null,
  totalCompleted: 0,
  totalInvited: 0,
  reportReady: false,
  reportThreshold: 0,
  canExtend: false,
  extensionsLeft: 0,
  degraded: false,
}

export function resolveDashboardState(input: DashboardStateInput): DashboardState {
  const { campaign } = input

  // State 0 — no campaign
  if (!campaign) {
    return {
      ...EMPTY_STATE,
      kind: 'no_campaign',
      primaryMessage: 'Er staat momenteel geen scan voor je klaar',
      subtext: 'Loep richt je campagne in. Je ontvangt een bericht wanneer je kunt beginnen.',
      tone: 'neutral',
    }
  }

  const close = buildCloseDateLabel(input.closesAt)
  const thresholds = getResponseActivationThresholds(campaign.scanType)
  const progressPct = Number.isFinite(campaign.completionRatePct) ? campaign.completionRatePct : 0
  const counts = `${campaign.totalCompleted} van ${campaign.totalInvited} ingevuld (${progressPct}%)`
  const base = {
    campaignId: campaign.id,
    totalCompleted: campaign.totalCompleted,
    totalInvited: campaign.totalInvited,
    reportReady: input.reportReady,
    reportThreshold: thresholds.insightMin,
    closeDateLabel: close.label,
  }

  // Priority 1 & 2 — closed campaign: report_ready beats processing
  if (!campaign.isActive) {
    if (input.reportReady) {
      return {
        ...EMPTY_STATE,
        ...base,
        kind: 'report_ready',
        primaryMessage: 'Je rapport is beschikbaar',
        subtext: `${campaign.totalCompleted} respondenten · Gesloten ${formatDutchDate(campaign.closedAt) ?? 'recent'}`,
        tone: 'neutral',
        ctaLabel: 'Open rapport',
        ctaHref: `/campaigns/${campaign.id}`,
        ctaKind: 'link',
        degraded: close.degraded,
      }
    }

    const enough = campaign.totalCompleted >= thresholds.insightMin
    if (enough) {
      return {
        ...EMPTY_STATE,
        ...base,
        kind: 'processing',
        processingVariant: 'generating',
        primaryMessage: 'Rapport wordt voorbereid',
        subtext: 'Je ontvangt een e-mail zodra het rapport gereed is. Dit duurt doorgaans minder dan een dag.',
        tone: 'neutral',
        degraded: true, // no async processing/failed signal exists yet
      }
    }

    // Eindtoestand (spec 2026-09-16 par. 4.5): geen belofte van een e-mail die
    // niet komt; wel de weg naar een nieuwe meting.
    const subject = encodeURIComponent(`Opnieuw meten: ${campaign.name}`)
    return {
      ...EMPTY_STATE,
      ...base,
      kind: 'processing',
      processingVariant: 'insufficient_response',
      primaryMessage: 'Gesloten zonder rapport',
      subtext: `Deze meting is gesloten met ${campaign.totalCompleted} ingevulde vragenlijsten. Voor een rapport zijn er minimaal ${thresholds.insightMin} nodig. Wil je opnieuw meten? Mail Loep.`,
      tone: 'neutral',
      ctaLabel: 'Mail Loep',
      ctaHref: `mailto:${LOEP_CONTACT_EMAIL}?subject=${subject}`,
      ctaKind: 'link',
      degraded: true,
    }
  }

  // Priority 6 (lowest) — setup: active but not launched
  const launched = Boolean(input.launchConfirmedAt) && campaign.totalInvited > 0
  if (!launched) {
    return {
      ...EMPTY_STATE,
      ...base,
      kind: 'setup',
      primaryMessage: 'Stap 1: stel de startdatum in',
      subtext: 'Vul de startdatum en het aantal deelnemers in, en kopieer de uitnodigingstekst.',
      tone: 'calm',
      ctaLabel: 'Start de setup →',
      ctaHref: `/campaigns/${campaign.id}/setup`,
      ctaKind: 'link',
      degraded: close.degraded,
    }
  }

  const timeline = buildCampaignTimeline({
    launchDate: input.launchDate,
    launchConfirmedAt: input.launchConfirmedAt,
    reminderEnabled: input.reminderConfig.enabled,
    reminderAfterDays: input.reminderConfig.firstReminderAfterDays,
    reminderHandledAt: input.reminderAlreadySentAt,
    reminderSkipped: input.reminderSkipped,
    closesAt: input.closesAt,
  })
  const canExtend = canExtendCampaign(input.extensionCount)
  const running = {
    ...base,
    timeline,
    canExtend,
    extensionsLeft: extensionsLeft(input.extensionCount),
    showProgress: true,
    progressPct,
    degraded: close.degraded,
  }
  const closeAction: DashboardSecondaryAction = { label: 'Meting sluiten', kind: 'close_campaign' }
  const extendAction: DashboardSecondaryAction = { label: 'Twee weken verlengen', kind: 'extend' }

  // Priority 3 — expired (close date reached). Disabled while closesAt is null.
  // Compare date-only portions so a full ISO closesAt timestamp still fires on the close day.
  const expired = input.closesAt !== null && input.today.slice(0, 10) >= input.closesAt.slice(0, 10)
  if (expired) {
    if (input.reportReady) {
      return {
        ...EMPTY_STATE,
        ...running,
        kind: 'action',
        actionVariant: 'expired',
        primaryMessage: 'De sluitdatum is bereikt',
        subtext: `${counts}. Sluit de meting, dan staat het rapport klaar.`,
        tone: 'attention',
        ctaLabel: 'Meting sluiten',
        ctaKind: 'close_campaign',
        secondaryActions: canExtend ? [extendAction] : [],
      }
    }
    if (canExtend) {
      return {
        ...EMPTY_STATE,
        ...running,
        kind: 'action',
        actionVariant: 'expired',
        primaryMessage: 'De sluitdatum is bereikt',
        subtext: `${counts}. Voor een rapport zijn minimaal ${thresholds.insightMin} antwoorden nodig. Verleng met twee weken of sluit zonder rapport.`,
        tone: 'attention',
        ctaLabel: 'Twee weken verlengen',
        ctaKind: 'extend',
        secondaryActions: [{ label: 'Toch sluiten', kind: 'close_campaign' }],
      }
    }
    return {
      ...EMPTY_STATE,
      ...running,
      kind: 'action',
      actionVariant: 'expired',
      primaryMessage: 'De sluitdatum is bereikt',
      subtext: `${counts}. Voor een rapport zijn minimaal ${thresholds.insightMin} antwoorden nodig. Je hebt de meting al ${MAX_EXTENSIONS} keer verlengd; je kunt hem alleen nog sluiten.`,
      tone: 'attention',
      ctaLabel: 'Meting sluiten',
      ctaKind: 'close_campaign',
      secondaryActions: [],
    }
  }

  // Priority 4 — reminder day (spec 4.4: de kaart verschijnt pas op die dag)
  const reminderDue = isReminderDue({
    launchDate: input.launchDate,
    delayDays: input.reminderConfig.firstReminderAfterDays,
    today: input.today,
    alreadySentAt: input.reminderAlreadySentAt,
  })
  if (input.reminderConfig.enabled && reminderDue) {
    return {
      ...EMPTY_STATE,
      ...running,
      kind: 'action',
      actionVariant: 'reminder',
      primaryMessage: 'Vandaag: stuur de herinnering',
      subtext: counts,
      tone: 'attention',
      ctaLabel: 'Ik heb de herinnering verstuurd',
      ctaKind: 'copy_reminder',
      secondaryActions: [{ label: 'Geen herinnering versturen', kind: 'skip_reminder' }, closeAction],
    }
  }

  // Priority 4b (within State 3) — rapportdrempel gehaald (indicator, sluiten optioneel)
  if (input.reportReady) {
    return {
      ...EMPTY_STATE,
      ...running,
      kind: 'action',
      actionVariant: 'sufficient_response',
      primaryMessage: 'Voldoende respons voor een rapport',
      subtext: `Je kunt de meting sluiten of nog even open laten. ${counts}`,
      tone: 'attention',
      ctaLabel: 'Meting sluiten',
      ctaKind: 'close_campaign',
      secondaryActions: [],
    }
  }

  // Priority 5 — running normally; sluiten blijft altijd bereikbaar (spec 4.3)
  return {
    ...EMPTY_STATE,
    ...running,
    kind: 'running',
    primaryMessage: 'Campagne loopt',
    subtext: `${campaign.totalCompleted} van ${campaign.totalInvited} ingevuld`,
    tone: 'positive',
    secondaryActions: [closeAction],
  }
}
```

- [ ] **Step 12: Run de resolvertests**

Run:
```bash
cd /c/Users/larsh/Desktop/Business/Verisight/.worktrees/klantsuite-2a/frontend
npx vitest run lib/dashboard/dashboard-state-resolver.test.ts 2>&1 | tail -6
```
Expected: PASS (20 tests). tsc faalt nu op de pagina's (`extensionCount` ontbreekt) en op de kaart/het eiland (`close_without_report`); Steps 13-16 lossen dat op.

- [ ] **Step 13: Falende test voor eiland en kaart (volledig nieuw bestand)**

Vervang `frontend/components/dashboard/dashboard-state-actions.test.ts` volledig door:

```ts
import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

const island = readFileSync(new URL('./dashboard-state-actions.tsx', import.meta.url), 'utf8')
const card = readFileSync(new URL('./dashboard-state-card.tsx', import.meta.url), 'utf8')

describe('dashboard state interaction island', () => {
  it('is a client component wired to all four dashboard server actions', () => {
    expect(island).toContain("'use client'")
    expect(island).toContain('confirmReminderSentAction')
    expect(island).toContain('closeCampaignAction')
    expect(island).toContain('extendCampaignAction')
    expect(island).toContain('skipReminderAction')
  })

  it('implements the copy → confirm reminder flow', () => {
    expect(island).toContain('navigator.clipboard.writeText')
    expect(island).toContain('Ik heb de herinnering verstuurd')
  })

  it('sluit via een eigen dialoog die de gevolgen benoemt, niet via browser-confirm (spec 2026-09-16 par. 4.3)', () => {
    expect(island).not.toMatch(/(?<![A-Za-z_])confirm\(/)
    expect(island).toContain('ConfirmDialog')
    expect(island).toContain('Daarna kan niemand meer invullen en staat het rapport klaar.')
    expect(island).toContain('die komen er dan niet.')
    expect(island).toContain('Wil je liever twee weken verlengen?')
    expect(island).toContain("'Twee weken verlengen'")
    expect(island).toContain("'Toch sluiten'")
    expect(island).toContain('state.reportThreshold')
    expect(island).toContain('state.canExtend')
  })

  it('rendert de secundaire acties als echte knoppen (verlengen, sluiten, herinnering overslaan)', () => {
    expect(island).toContain('state.secondaryActions')
    expect(island).toContain("case 'skip_reminder'")
    expect(island).toContain("case 'extend'")
    expect(island).toContain("case 'close_campaign'")
  })

  it('toont een waarschuwing als een actie lukte maar een neveneffect niet', () => {
    expect(island).toContain('setNotice')
    expect(island).toContain('result.warning')
    expect(island).toContain('role="status"')
  })

  it('defect 1 (2026-09-12): de notice wordt op één plek gebouwd en in de laatste return meegerenderd, ongeacht ctaKind', () => {
    const noticeBlockIdx = island.indexOf('const noticeBlock')
    const firstCtaKindCheckIdx = island.indexOf("state.ctaKind ===")
    expect(noticeBlockIdx).toBeGreaterThan(-1)
    expect(firstCtaKindCheckIdx).toBeGreaterThan(-1)
    expect(noticeBlockIdx).toBeLessThan(firstCtaKindCheckIdx)
    const roleStatusMatches = island.match(/role="status"/g) ?? []
    expect(roleStatusMatches.length).toBe(1)
    const mainReturn = island.slice(
      island.indexOf('const secondaryActions = state.secondaryActions'),
      island.indexOf('function buildCloseDialog'),
    )
    expect(mainReturn).toContain('{noticeBlock}')
  })

  it('defect 1: de vroege return (geen campaignId) gooit een openstaande notice niet weg', () => {
    const earlyReturnBlock = island.slice(island.indexOf('if (!campaignId)'), island.indexOf('const isBusy'))
    expect(earlyReturnBlock).toContain('noticeBlock')
  })

  it('bevat geen em- of en-dashes in klantcopy', () => {
    expect(island).not.toMatch(/[—–]/)
  })
})

describe('dashboard state card', () => {
  it('renders the resolved primary message and delegates interactive CTAs to the island', () => {
    expect(card).toContain('state.primaryMessage')
    expect(card).toContain('DashboardStateActions')
    expect(card).toContain('state.showProgress')
    expect(card).toContain('CampaignTimeline')
  })

  it('keeps no inline analysis (no charts/factor tables)', () => {
    expect(card).not.toContain('RiskCharts')
    expect(card).not.toContain('FactorTable')
  })

  it('defect 2 (source guard): mount van DashboardStateActions is niet gegated op ctaKind/islandCta', () => {
    expect(card).not.toContain('islandCta')
    expect(card).toMatch(/\n\s*<DashboardStateActions state=\{state\} reminderText=\{reminderText\} \/>\s*\n/)
  })

  it('rendert secundaire acties niet meer zelf als dode tekst; het eiland maakt er knoppen van', () => {
    expect(card).not.toContain('secondaryActions.map')
    expect(card).not.toContain('non-interactive')
  })

  it('rendert een mailto-CTA als gewone link (eindtoestand, spec 4.5)', () => {
    expect(card).toContain("startsWith('mailto:')")
  })
})
```

- [ ] **Step 14: Eiland volledig herschrijven**

Vervang `frontend/components/dashboard/dashboard-state-actions.tsx` door:

```tsx
'use client'

import { useState, type ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import {
  closeCampaignAction,
  confirmReminderSentAction,
  extendCampaignAction,
  skipReminderAction,
  type DashboardActionResult,
} from '@/app/(dashboard)/dashboard/dashboard-actions'
import type { DashboardSecondaryAction, DashboardState } from '@/lib/dashboard/dashboard-state-resolver'
import { ConfirmDialog, type ConfirmDialogAction } from './confirm-dialog'

type Busy = 'idle' | 'closing' | 'extending' | 'skipping' | 'confirming'

const primaryButtonClass =
  'inline-flex items-center justify-center rounded-lg bg-[color:var(--dashboard-ink)] px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#1B2E45] disabled:opacity-50'
const secondaryButtonClass =
  'text-sm font-semibold text-[color:var(--dashboard-accent-strong)] underline-offset-4 hover:underline disabled:opacity-50'

/**
 * Het enige interactieve stuk van de statuskaarten (spec 2026-09-16 par. 4.3
 * en 4.4). Alle knoppen komen uit de resolverstaat; dit eiland rendert ze en
 * roept de server actions aan. Sluiten gaat altijd via de eigen dialoog die
 * de gevolgen benoemt (boven én onder de rapportdrempel); verlengen en
 * herinnering overslaan zijn omkeerbaar genoeg om direct te doen.
 */
export function DashboardStateActions({ state, reminderText }: { state: DashboardState; reminderText: string }) {
  const router = useRouter()
  const [busy, setBusy] = useState<Busy>('idle')
  const [copied, setCopied] = useState(false)
  const [closeDialogOpen, setCloseDialogOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)

  const campaignId = state.campaignId

  // Eén plek voor de notice (Fail Loud): hij overleeft de state-overgang na
  // sluiten of verlengen omdat de kaart dit eiland altijd gemount houdt en
  // elke return-tak hieronder 'm meerendert.
  const noticeBlock = notice ? (
    <p role="status" className="max-w-md text-xs text-[color:var(--dashboard-muted)]">
      {notice}
    </p>
  ) : null
  const errorBlock = error ? (
    <p role="alert" className="text-xs text-red-600">
      {error}
    </p>
  ) : null

  async function run(kind: Busy, action: () => Promise<DashboardActionResult>, failLabel: string) {
    setError(null)
    setNotice(null)
    setBusy(kind)
    const result = await action()
    setBusy('idle')
    if (!result.ok) {
      setError(result.error ?? failLabel)
      return
    }
    setNotice(result.warning ?? null)
    router.refresh()
  }

  if (!campaignId) {
    return noticeBlock ? <div className="mt-6 flex flex-col items-start gap-2">{noticeBlock}</div> : null
  }

  const isBusy = busy !== 'idle'

  async function handleCopyReminder() {
    try {
      await navigator.clipboard.writeText(reminderText)
    } catch {
      // Clipboard can fail silently in some browsers; still advance so HR can confirm manual send.
    }
    setCopied(true)
  }

  function handleConfirmReminder() {
    return run('confirming', () => confirmReminderSentAction(campaignId!), 'Bevestigen mislukt.')
  }

  function handleClose() {
    setCloseDialogOpen(false)
    return run('closing', () => closeCampaignAction(campaignId!), 'Sluiten mislukt.')
  }

  function handleExtend() {
    setCloseDialogOpen(false)
    return run('extending', () => extendCampaignAction(campaignId!), 'Verlengen mislukt.')
  }

  function handleSkipReminder() {
    return run('skipping', () => skipReminderAction(campaignId!), 'Overslaan mislukt.')
  }

  function handleSecondary(action: DashboardSecondaryAction) {
    switch (action.kind) {
      case 'skip_reminder':
        return handleSkipReminder()
      case 'extend':
        return handleExtend()
      case 'close_campaign':
        setCloseDialogOpen(true)
        return
      case 'link':
      default:
        return
    }
  }

  const closeDialog = buildCloseDialog(state, {
    onClose: handleClose,
    onExtend: handleExtend,
    onCancel: () => setCloseDialogOpen(false),
  })

  const secondaryActions = state.secondaryActions.filter((action) => action.kind !== 'link')

  return (
    <div className="mt-6 flex flex-col items-start gap-3">
      {state.ctaKind === 'copy_reminder' ? (
        !copied ? (
          <button type="button" onClick={handleCopyReminder} className={primaryButtonClass}>
            Kopieer herinneringstekst
          </button>
        ) : (
          <button type="button" onClick={handleConfirmReminder} disabled={isBusy} className={primaryButtonClass}>
            {busy === 'confirming' ? 'Bevestigen...' : 'Ik heb de herinnering verstuurd'}
          </button>
        )
      ) : null}

      {state.ctaKind === 'close_campaign' ? (
        <button type="button" onClick={() => setCloseDialogOpen(true)} disabled={isBusy} className={primaryButtonClass}>
          {busy === 'closing' ? 'Sluiten...' : state.ctaLabel ?? 'Meting sluiten'}
        </button>
      ) : null}

      {state.ctaKind === 'extend' ? (
        <button type="button" onClick={handleExtend} disabled={isBusy} className={primaryButtonClass}>
          {busy === 'extending' ? 'Verlengen...' : state.ctaLabel ?? 'Twee weken verlengen'}
        </button>
      ) : null}

      {secondaryActions.length > 0 ? (
        <div className="flex flex-wrap gap-4">
          {secondaryActions.map((action) => (
            <button
              key={action.kind}
              type="button"
              onClick={() => handleSecondary(action)}
              disabled={isBusy}
              className={secondaryButtonClass}
            >
              {busy === 'skipping' && action.kind === 'skip_reminder'
                ? 'Overslaan...'
                : busy === 'extending' && action.kind === 'extend'
                  ? 'Verlengen...'
                  : action.label}
            </button>
          ))}
        </div>
      ) : null}

      {errorBlock}
      {noticeBlock}

      <ConfirmDialog
        open={closeDialogOpen}
        title="Meting sluiten"
        onClose={() => setCloseDialogOpen(false)}
        actions={closeDialog.actions}
      >
        {closeDialog.body}
      </ConfirmDialog>
    </div>
  )
}

/**
 * De sluitdialoog benoemt de gevolgen (spec 2026-09-16 par. 4.3). Onder de
 * drempel is verlengen de aangeraden weg zolang dat nog kan.
 */
function buildCloseDialog(
  state: DashboardState,
  handlers: { onClose: () => void; onExtend: () => void; onCancel: () => void },
): { body: ReactNode; actions: ConfirmDialogAction[] } {
  const counts = `Je sluit met ${state.totalCompleted} van ${state.totalInvited} ingevuld.`
  const cancel: ConfirmDialogAction = { label: 'Annuleren', onClick: handlers.onCancel }

  if (state.reportReady) {
    return {
      body: <p>{counts} Daarna kan niemand meer invullen en staat het rapport klaar.</p>,
      actions: [cancel, { label: 'Meting sluiten', onClick: handlers.onClose, variant: 'primary' }],
    }
  }

  const noReport = `Voor een rapport zijn minimaal ${state.reportThreshold} antwoorden nodig; die komen er dan niet.`
  if (state.canExtend) {
    return {
      body: (
        <p>
          {counts} {noReport} Wil je liever twee weken verlengen?
        </p>
      ),
      actions: [
        { label: 'Toch sluiten', onClick: handlers.onClose },
        { label: 'Twee weken verlengen', onClick: handlers.onExtend, variant: 'primary' },
      ],
    }
  }

  return {
    body: (
      <p>
        {counts} {noReport} Je hebt de meting al drie keer verlengd; verlengen kan niet meer.
      </p>
    ),
    actions: [cancel, { label: 'Toch sluiten', onClick: handlers.onClose, variant: 'primary' }],
  }
}
```

- [ ] **Step 15: Kaart volledig herschrijven**

Vervang `frontend/components/dashboard/dashboard-state-card.tsx` door:

```tsx
import Link from 'next/link'
import type { DashboardState, DashboardStateTone } from '@/lib/dashboard/dashboard-state-resolver'
import { CampaignTimeline } from './campaign-timeline'
import { DashboardStateActions } from './dashboard-state-actions'

function toneClasses(tone: DashboardStateTone) {
  switch (tone) {
    case 'attention':
      return 'border-[#e7d7af] bg-[#FBF4DF]'
    case 'positive':
      return 'border-[color:var(--dashboard-accent-soft-border)] bg-[color:var(--dashboard-accent-soft)]'
    case 'calm':
      return 'border-dashed border-[color:var(--dashboard-frame-border)] bg-[color:var(--dashboard-surface)]'
    case 'neutral':
    default:
      return 'border-[color:var(--dashboard-frame-border)] bg-white'
  }
}

const linkClass =
  'inline-flex items-center justify-center rounded-lg bg-[color:var(--dashboard-ink)] px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#1B2E45]'

export function DashboardStateCard({ state, reminderText }: { state: DashboardState; reminderText: string }) {
  const linkCta = state.ctaKind === 'link' && state.ctaLabel && state.ctaHref
  const progressPct = Math.min(100, Math.max(0, state.progressPct))

  return (
    <section className={`rounded-[22px] border px-6 py-7 ${toneClasses(state.tone)}`}>
      <h1 className="font-serif text-[2rem] leading-[1.05] tracking-[-0.04em] text-[color:var(--dashboard-ink)] sm:text-[2.4rem]">
        {state.primaryMessage}
      </h1>
      <p className="mt-3 max-w-2xl text-[0.98rem] leading-7 text-[color:var(--dashboard-text)]">{state.subtext}</p>

      {state.showProgress ? (
        <div className="mt-6 max-w-md">
          <div
            className="h-2 w-full overflow-hidden rounded-full bg-[color:var(--dashboard-soft)]"
            role="progressbar"
            aria-valuenow={progressPct}
            aria-valuemin={0}
            aria-valuemax={100}
          >
            <div className="h-full rounded-full bg-[color:var(--dashboard-accent-strong)]" style={{ width: `${progressPct}%` }} />
          </div>
          <p className="mt-2 text-xs font-semibold uppercase tracking-[0.16em] text-[color:var(--dashboard-muted)]">
            {state.progressPct}% ingevuld
          </p>
        </div>
      ) : null}

      {state.timeline ? (
        <div className="mt-6">
          <CampaignTimeline timeline={state.timeline} />
        </div>
      ) : null}

      {linkCta ? (
        <div className="mt-6">
          {state.ctaHref!.startsWith('mailto:') ? (
            <a href={state.ctaHref!} className={linkClass}>
              {state.ctaLabel}
            </a>
          ) : (
            <Link href={state.ctaHref!} className={linkClass}>
              {state.ctaLabel}
            </Link>
          )}
        </div>
      ) : null}

      {/*
        Altijd gemount (niet gegated op ctaKind): na sluiten of verlengen
        verandert de state, en een waarschuwing over een mislukt neveneffect
        moet die overgang overleven. Het eiland rendert zelf null als het niets
        te tonen heeft, dus dit voegt geen dode UI toe.
      */}
      <DashboardStateActions state={state} reminderText={reminderText} />
    </section>
  )
}
```

- [ ] **Step 16: Pagina's tellen de verlengingen**

In `frontend/app/(dashboard)/dashboard/page.tsx` vervang het begin van de `Promise.all`-destructuring (anker: `const [` gevolgd door `{ data: deliveryRecord },`, regels 55-63):

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

door:

```ts
  const [
    { data: deliveryRecord },
    { data: reminderEvents },
    { data: campaignRow },
    { data: orgData },
    { data: respondentDepts },
    { data: profile },
    { data: membership },
    { count: extensionCount },
  ] = await Promise.all([
```

en voeg als laatste element van de array (direct na de `org_members`-query, vóór `])`) toe:

```ts
    supabase
      .from('campaign_action_audit_events')
      .select('id', { count: 'exact', head: true })
      .eq('campaign_id', campaign.campaign_id)
      .eq('action_key', 'delivery_lifecycle_changed')
      .eq('outcome', 'completed')
      .contains('metadata', { extension: true }),
```

Voeg in de `resolveDashboardState({ ... })`-aanroep direct na de `reminderSkipped:`-regels (uit Task 4) toe:

```ts
    extensionCount: extensionCount ?? 0,
```

In `frontend/app/(dashboard)/campaigns/[id]/page.tsx` doe hetzelfde: breid de destructuring (regel 57, `const [{ data: campaignMeta }, ... { data: membership }] = await Promise.all([`) uit met `, { count: extensionCount }` als laatste element, voeg dezelfde query toe met `.eq('campaign_id', id)` als laatste array-element, en `extensionCount: extensionCount ?? 0,` na `reminderSkipped:` in de resolver-aanroep.

Voeg aan `frontend/app/(dashboard)/dashboard/page.test.ts` onderaan toe:

```ts
  it('telt de verlengingen uit de auditevents (spec 2026-09-16 par. 4.3)', () => {
    expect(source).toContain("contains('metadata', { extension: true })")
    expect(source).toContain('extensionCount: extensionCount ?? 0')
    expect(source).toContain("'skipped_by_customer'")
  })
```

(binnen het bestaande `describe('state-driven dashboard page'`).

- [ ] **Step 17: Tests, tsc en volledige suite**

Run:
```bash
cd /c/Users/larsh/Desktop/Business/Verisight/.worktrees/klantsuite-2a/frontend
npx vitest run lib/dashboard components/dashboard "app/(dashboard)/dashboard" 2>&1 | tail -15
npx tsc --noEmit 2>&1 | grep -c "error TS"
```
Expected: alle nieuwe en herschreven testbestanden PASS (`read-only-state-card.test.ts` blijft groen: geen `<button`, geen `secondaryActions` in die kaart); tsc `133`.

- [ ] **Step 18: Commit**

```bash
cd /c/Users/larsh/Desktop/Business/Verisight/.worktrees/klantsuite-2a
git add frontend/lib/dashboard/campaign-extension.ts frontend/lib/dashboard/campaign-extension.test.ts "frontend/app/(dashboard)/dashboard/dashboard-actions.ts" "frontend/app/(dashboard)/dashboard/dashboard-actions.test.ts" "frontend/app/(dashboard)/dashboard/dashboard-actions.lifecycle.test.ts" frontend/lib/dashboard/dashboard-state-resolver.ts frontend/lib/dashboard/dashboard-state-resolver.test.ts frontend/components/dashboard/dashboard-state-actions.tsx frontend/components/dashboard/dashboard-state-actions.test.ts frontend/components/dashboard/dashboard-state-card.tsx "frontend/app/(dashboard)/dashboard/page.tsx" "frontend/app/(dashboard)/dashboard/page.test.ts" "frontend/app/(dashboard)/campaigns/[id]/page.tsx"
git commit -m "feat(dashboard): meting sluiten, verlengen en herinnering overslaan als echte knoppen met eigen dialoog

extendCampaignAction (+14 dagen, max 3x via auditevents met metadata.extension)
en skipReminderAction (send_reminders, channel skipped_by_customer). Resolver:
'Meting sluiten' altijd bereikbaar, expired boven en onder de drempel, gesloten
zonder rapport als eindtoestand met mailto naar Loep.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

### Task 6: Herinneringskaart: onderwerp en bericht apart kopieerbaar, pas op de herinneringsdag

**Files:**
- Modify: `frontend/lib/dashboard/reminder-text.ts` (onderaan: `splitReminderText`)
- Modify: `frontend/lib/dashboard/reminder-text.test.ts` (extra `describe`)
- Modify: `frontend/components/dashboard/dashboard-state-actions.tsx` (stand na Task 5; ankers hieronder)
- Modify: `frontend/components/dashboard/dashboard-state-actions.test.ts` (extra tests)

De tijdlijn op de herinneringskaart en het "pas op de herinneringsdag"-gedrag zijn in Task 4 en 5 al geregeld (de resolver zet `timeline` op elke lopende staat, `DashboardStateCard` rendert hem, en de lopende kaart toont geen herinneringstekst meer). Deze taak maakt de kaart zelf af: onderwerp en bericht als twee bewerkbare velden met elk een eigen kopieerknop, en bevestigen pas nadat er iets gekopieerd is.

- [ ] **Step 1: Falende tests**

Voeg aan `frontend/lib/dashboard/reminder-text.test.ts` bovenaan bij de import `splitReminderText` toe:

```ts
import { buildReminderText, splitReminderText, type ReminderTextInput } from '@/lib/dashboard/reminder-text'
```

en onderaan:

```ts
describe('splitReminderText (spec 2026-09-16 par. 4.4)', () => {
  it('splitst de gebouwde tekst weer in onderwerp en bericht', () => {
    const text = buildReminderText(input())
    const parts = splitReminderText(text)
    expect(parts.subject).toBe('Herinnering: korte vragenlijst - Acme BV')
    expect(parts.body.startsWith('Beste collega,')).toBe(true)
    expect(parts.body).toContain('https://www.getloep.nl/survey/open/tok-123')
    expect(`${parts.subject}\n\n${parts.body}`).toBe(text)
  })

  it('geeft een tekst zonder lege regel volledig als onderwerp terug, met leeg bericht', () => {
    expect(splitReminderText('alleen een regel')).toEqual({ subject: 'alleen een regel', body: '' })
  })
})
```

Voeg aan `frontend/components/dashboard/dashboard-state-actions.test.ts` in het `describe('dashboard state interaction island'` toe:

```ts
  it('biedt op de herinneringsdag onderwerp en bericht apart, elk met een eigen kopieerknop (spec 2026-09-16 par. 4.4)', () => {
    expect(island).toContain('splitReminderText')
    expect(island).toContain('ReminderComposer')
    expect(island).toContain('>Onderwerp<')
    expect(island).toContain('>Bericht<')
    expect(island).not.toContain('Kopieer herinneringstekst')
  })

  it('laat pas bevestigen dat de herinnering is verstuurd nadat er iets gekopieerd is', () => {
    expect(island).toContain('disabled={!copied || isBusy}')
    expect(island).toContain('Kopieer eerst het onderwerp en het bericht')
  })
```

- [ ] **Step 2: Run om te zien dat ze falen**

Run:
```bash
cd /c/Users/larsh/Desktop/Business/Verisight/.worktrees/klantsuite-2a/frontend
npx vitest run lib/dashboard/reminder-text.test.ts components/dashboard/dashboard-state-actions.test.ts 2>&1 | tail -12
```
Expected: FAIL: `splitReminderText` is geen export; het eiland kent geen `ReminderComposer`.

- [ ] **Step 3: `splitReminderText`**

Voeg onderaan `frontend/lib/dashboard/reminder-text.ts` toe:

```ts

/**
 * Inverse van de `subject\n\nbody`-vorm die buildReminderText teruggeeft, zodat
 * de herinneringskaart onderwerp en bericht apart kan tonen en kopiëren (spec
 * 2026-09-16 par. 4.4). Zonder lege regel is alles onderwerp; de gedegradeerde
 * tekst (geen surveylink) komt dan als geheel in beeld, wat de bedoeling is.
 */
export function splitReminderText(text: string): { subject: string; body: string } {
  const firstBreak = text.indexOf('\n\n')
  if (firstBreak < 0) return { subject: text, body: '' }
  return { subject: text.slice(0, firstBreak), body: text.slice(firstBreak + 2) }
}
```

- [ ] **Step 4: Eiland: de herinneringscomposer**

In `frontend/components/dashboard/dashboard-state-actions.tsx` (stand na Task 5):

(a) Vervang de import van de resolver-types:

```tsx
import type { DashboardSecondaryAction, DashboardState } from '@/lib/dashboard/dashboard-state-resolver'
```

door:

```tsx
import type { DashboardSecondaryAction, DashboardState } from '@/lib/dashboard/dashboard-state-resolver'
import { splitReminderText } from '@/lib/dashboard/reminder-text'
```

(b) Verwijder de functie `handleCopyReminder` volledig:

```tsx
  async function handleCopyReminder() {
    try {
      await navigator.clipboard.writeText(reminderText)
    } catch {
      // Clipboard can fail silently in some browsers; still advance so HR can confirm manual send.
    }
    setCopied(true)
  }

```

(c) Vervang de `copy_reminder`-tak in de JSX:

```tsx
      {state.ctaKind === 'copy_reminder' ? (
        !copied ? (
          <button type="button" onClick={handleCopyReminder} className={primaryButtonClass}>
            Kopieer herinneringstekst
          </button>
        ) : (
          <button type="button" onClick={handleConfirmReminder} disabled={isBusy} className={primaryButtonClass}>
            {busy === 'confirming' ? 'Bevestigen...' : 'Ik heb de herinnering verstuurd'}
          </button>
        )
      ) : null}
```

door:

```tsx
      {state.ctaKind === 'copy_reminder' ? (
        <>
          <ReminderComposer reminderText={reminderText} onCopied={() => setCopied(true)} />
          <button type="button" onClick={handleConfirmReminder} disabled={!copied || isBusy} className={primaryButtonClass}>
            {busy === 'confirming' ? 'Bevestigen...' : 'Ik heb de herinnering verstuurd'}
          </button>
          {!copied ? (
            <p className="text-xs text-[color:var(--dashboard-muted)]">
              Kopieer eerst het onderwerp en het bericht; daarna bevestig je hier dat je de herinnering hebt verstuurd.
            </p>
          ) : null}
        </>
      ) : null}
```

(d) Voeg onderaan het bestand (na `buildCloseDialog`) toe:

```tsx

/**
 * Onderwerp en bericht van de herinnering, bewerkbaar en elk apart te
 * kopiëren (spec 2026-09-16 par. 4.4), zoals de wizard en de vroegere
 * "Campagne loopt"-kaart dat al deden. Eén blok kopiëren zette het onderwerp
 * in de mailtekst; dat is precies wat hier niet meer kan.
 */
function ReminderComposer({ reminderText, onCopied }: { reminderText: string; onCopied: () => void }) {
  const initial = splitReminderText(reminderText)
  const [subject, setSubject] = useState(initial.subject)
  const [body, setBody] = useState(initial.body)
  const [copiedField, setCopiedField] = useState<'subject' | 'body' | null>(null)

  async function copy(text: string, which: 'subject' | 'body') {
    try {
      await navigator.clipboard.writeText(text)
    } catch {
      // Clipboard can fail silently in some browsers; HR can still select and copy by hand.
    }
    setCopiedField(which)
    onCopied()
    setTimeout(() => setCopiedField(null), 2000)
  }

  return (
    <div className="w-full max-w-lg rounded-[16px] border border-[color:var(--dashboard-frame-border)] bg-white p-5">
      <p className="mb-4 text-xs font-semibold uppercase tracking-[0.1em] text-[color:var(--dashboard-muted)]">
        Herinneringsmail: pas aan en stuur vanuit je eigen e-mail
      </p>

      <div className="mb-3">
        <div className="mb-1 flex items-center justify-between">
          <label htmlFor="reminder-subject" className="text-[10px] font-semibold uppercase tracking-wide text-[color:var(--dashboard-muted)]">Onderwerp</label>
          <button type="button" onClick={() => copy(subject, 'subject')} className="text-[10px] font-semibold text-[#E8A020] hover:opacity-75">
            {copiedField === 'subject' ? 'Gekopieerd ✓' : 'Kopieer'}
          </button>
        </div>
        <input
          id="reminder-subject"
          type="text"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          className="w-full rounded-lg border border-[color:var(--dashboard-frame-border)] bg-[color:var(--dashboard-surface)] px-3 py-2 text-xs text-[color:var(--dashboard-ink)] focus:outline-none focus:ring-1 focus:ring-[#E8A020]/50"
        />
      </div>

      <div>
        <div className="mb-1 flex items-center justify-between">
          <label htmlFor="reminder-body" className="text-[10px] font-semibold uppercase tracking-wide text-[color:var(--dashboard-muted)]">Bericht</label>
          <button type="button" onClick={() => copy(body, 'body')} className="text-[10px] font-semibold text-[#E8A020] hover:opacity-75">
            {copiedField === 'body' ? 'Gekopieerd ✓' : 'Kopieer'}
          </button>
        </div>
        <textarea
          id="reminder-body"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={10}
          className="w-full resize-none rounded-lg border border-[color:var(--dashboard-frame-border)] bg-[color:var(--dashboard-surface)] px-3 py-2 text-xs leading-relaxed text-[color:var(--dashboard-ink)] focus:outline-none focus:ring-1 focus:ring-[#E8A020]/50"
        />
      </div>

      <p className="mt-2 text-[10px] text-[color:var(--dashboard-muted)]">
        Je kunt de tekst aanpassen voor je kopieert. Vergeet niet je naam in te vullen bij &ldquo;Met vriendelijke groet&rdquo;.
      </p>
    </div>
  )
}
```

- [ ] **Step 5: Tests en tsc**

Run:
```bash
cd /c/Users/larsh/Desktop/Business/Verisight/.worktrees/klantsuite-2a/frontend
npx vitest run lib/dashboard/reminder-text.test.ts components/dashboard/dashboard-state-actions.test.ts 2>&1 | tail -8
npx tsc --noEmit 2>&1 | grep -c "error TS"
```
Expected: beide PASS; tsc `133`.

- [ ] **Step 6: Commit**

```bash
cd /c/Users/larsh/Desktop/Business/Verisight/.worktrees/klantsuite-2a
git add frontend/lib/dashboard/reminder-text.ts frontend/lib/dashboard/reminder-text.test.ts frontend/components/dashboard/dashboard-state-actions.tsx frontend/components/dashboard/dashboard-state-actions.test.ts
git commit -m "feat(herinnering): onderwerp en bericht apart kopieerbaar op de herinneringskaart

Bevestigen kan pas nadat er iets gekopieerd is; de kaart zelf verschijnt al
alleen op de herinneringsdag (resolver) en draagt sinds Task 4 de tijdlijn.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

### Task 7: Uitnodiging ondertekend door de organisatie, zonder scannaam in de mail

**Files:**
- Modify: `frontend/lib/self-send-comms.ts` (`TemplateArgs`, `buildInviteTemplate`, `buildReminderTemplate`; stand na Task 1)
- Modify: `frontend/lib/self-send-comms.test.ts`
- Modify: `frontend/lib/dashboard/reminder-text.ts:10-21, 48-58` (stand na Task 6)
- Modify: `frontend/lib/dashboard/reminder-text.test.ts:4-18`
- Modify: `frontend/components/dashboard/setup-wizard-card.tsx` (aanroep `buildInviteTemplate`)
- Modify: `frontend/components/dashboard/self-send-setup-panel.tsx:88-93`
- Modify: `frontend/app/(dashboard)/dashboard/page.tsx` en `frontend/app/(dashboard)/campaigns/[id]/page.tsx` (aanroep `buildReminderText`)

- [ ] **Step 1: Falende tests**

In `frontend/lib/self-send-comms.test.ts`: verwijder in de vier bestaande template-aanroepen (`bakes the survey link into the invitation template body`, `reminder template references the same link...`, `zet bij afdelingsrapportage de links per afdeling...`) telkens de regel `scanLabel: 'Loep Vertrek',` of `scanLabel: 'Loep Behoud',` (anders faalt tsc straks op een overtollige eigenschap). Voeg daarna in `describe('self-send-comms'` toe:

```ts
  it('ondertekent met de organisatienaam als er geen afzendernaam is, en noemt Loep niet in de mail (spec 2026-09-16 par. 5.2)', () => {
    const invite = buildInviteTemplate({
      senderName: '',
      organizationName: 'Acme BV',
      scanType: 'exit',
      surveyLink: 'https://www.getloep.nl/survey/open/tok-123',
    })
    expect(invite.body.trimEnd().endsWith('Met vriendelijke groet,\nAcme BV')).toBe(true)
    expect(invite.body).toContain('Acme BV houdt een korte, anonieme vragenlijst.')
    expect(invite.body).not.toContain('Loep Vertrek')
    expect(invite.body).not.toContain('(Loep')
    expect(invite.body).not.toContain('\nHR')

    const reminder = buildReminderTemplate({
      senderName: '',
      organizationName: 'Acme BV',
      scanType: 'retention',
      surveyLink: 'https://www.getloep.nl/survey/open/tok-123',
    })
    expect(reminder.body.trimEnd().endsWith('Met vriendelijke groet,\nAcme BV')).toBe(true)
    expect(reminder.body).not.toContain('Loep Behoud')
  })

  it('houdt een ingevulde afzendernaam boven de organisatienaam', () => {
    const invite = buildInviteTemplate({
      senderName: 'Sanne de Vries',
      organizationName: 'Acme BV',
      scanType: 'retention',
      surveyLink: 'https://www.getloep.nl/survey/open/tok-123',
    })
    expect(invite.body.trimEnd().endsWith('Met vriendelijke groet,\nSanne de Vries')).toBe(true)
  })
```

In `frontend/lib/dashboard/reminder-text.test.ts` verwijder in de helper `input()` de regel `scanLabel: 'Loep Behoud',`.

- [ ] **Step 2: Run om te zien dat ze falen**

Run:
```bash
cd /c/Users/larsh/Desktop/Business/Verisight/.worktrees/klantsuite-2a/frontend
npx vitest run lib/self-send-comms.test.ts 2>&1 | tail -12
```
Expected: FAIL: de body eindigt op `HR` en bevat `(Loep Vertrek)`.

- [ ] **Step 3: Templates aanpassen**

In `frontend/lib/self-send-comms.ts` vervang `TemplateArgs`:

```ts
interface TemplateArgs {
  senderName: string
  organizationName: string
  scanLabel: string
  scanType: ScanType
  surveyLink: string
  /** Bij afdelingsrapportage: één link per afdeling in plaats van de algemene link. */
  departmentLinks?: Array<{ label: string; url: string }>
}
```

door:

```ts
interface TemplateArgs {
  senderName: string
  organizationName: string
  scanType: ScanType
  surveyLink: string
  /** Bij afdelingsrapportage: één link per afdeling in plaats van de algemene link. */
  departmentLinks?: Array<{ label: string; url: string }>
}

// Ondertekening (spec 2026-09-16 par. 5.2): de organisatie, niet "HR". De
// ontvanger kent Loep niet, dus de scannaam staat niet in de mail; de
// vragenlijstpagina zelf noemt Loep wel.
function signature(args: TemplateArgs): string {
  return args.senderName || args.organizationName
}
```

Vervang in `buildInviteTemplate`:

```ts
  const sender = args.senderName || 'HR'
  return {
    subject: `Uitnodiging: korte vragenlijst - ${args.organizationName}`,
    body: [
      'Beste collega,',
      '',
      `${args.organizationName} houdt een korte, anonieme vragenlijst (${args.scanLabel}).`,
```

door:

```ts
  const sender = signature(args)
  return {
    subject: `Uitnodiging: korte vragenlijst - ${args.organizationName}`,
    body: [
      'Beste collega,',
      '',
      `${args.organizationName} houdt een korte, anonieme vragenlijst.`,
```

en in `buildReminderTemplate`:

```ts
  const sender = args.senderName || 'HR'
```

door:

```ts
  const sender = signature(args)
```

- [ ] **Step 4: Aanroepers zonder `scanLabel`**

In `frontend/lib/dashboard/reminder-text.ts` verwijder in `ReminderTextInput` de regel `scanLabel: string` en in de `buildReminderTemplate({ ... })`-aanroep de regel `scanLabel: input.scanLabel,`.

In `frontend/components/dashboard/setup-wizard-card.tsx` verwijder in de `buildInviteTemplate({ ... })`-aanroep de regel `scanLabel,` (de variabele `scanLabel` blijft: die staat in de kop van de kaart).

In `frontend/components/dashboard/self-send-setup-panel.tsx` vervang regels 88-93:

```ts
    () => buildInviteTemplate({ senderName: config.senderName, organizationName, scanLabel, scanType, surveyLink }),
    [config.senderName, organizationName, scanLabel, scanType, surveyLink],
  )
  const reminderTpl = useMemo(
    () => buildReminderTemplate({ senderName: config.senderName, organizationName, scanLabel, scanType, surveyLink }),
    [config.senderName, organizationName, scanLabel, scanType, surveyLink],
```

door:

```ts
    () => buildInviteTemplate({ senderName: config.senderName, organizationName, scanType, surveyLink }),
    [config.senderName, organizationName, scanType, surveyLink],
  )
  const reminderTpl = useMemo(
    () => buildReminderTemplate({ senderName: config.senderName, organizationName, scanType, surveyLink }),
    [config.senderName, organizationName, scanType, surveyLink],
```

(`scanLabel` blijft daar in gebruik op regel 189, in de kop van het paneel.)

In `frontend/app/(dashboard)/dashboard/page.tsx` en `frontend/app/(dashboard)/campaigns/[id]/page.tsx` verwijder in de `buildReminderText({ ... })`-aanroep de regel die begint met `scanLabel: SCAN_TYPE_LABELS[`. (`SCAN_TYPE_LABELS` blijft geïmporteerd: de pagina's gebruiken hem nog voor `scanLabel` van `RunningStateCard`.)

- [ ] **Step 5: Tests en tsc**

Run:
```bash
cd /c/Users/larsh/Desktop/Business/Verisight/.worktrees/klantsuite-2a/frontend
npx vitest run lib/self-send-comms.test.ts lib/dashboard/reminder-text.test.ts components/dashboard/setup-wizard-card.guard.test.ts 2>&1 | tail -8
npx tsc --noEmit 2>&1 | grep -c "error TS"
grep -rn "scanLabel" lib/self-send-comms.ts lib/dashboard/reminder-text.ts
```
Expected: alle drie PASS; tsc `133`; de grep geeft geen regels.

- [ ] **Step 6: Commit**

```bash
cd /c/Users/larsh/Desktop/Business/Verisight/.worktrees/klantsuite-2a
git add frontend/lib/self-send-comms.ts frontend/lib/self-send-comms.test.ts frontend/lib/dashboard/reminder-text.ts frontend/lib/dashboard/reminder-text.test.ts frontend/components/dashboard/setup-wizard-card.tsx frontend/components/dashboard/self-send-setup-panel.tsx "frontend/app/(dashboard)/dashboard/page.tsx" "frontend/app/(dashboard)/campaigns/[id]/page.tsx"
git commit -m "feat(uitnodiging): ondertekening door de organisatie en geen scannaam in de mail

De ontvanger kent Loep niet; de vragenlijstpagina noemt Loep wel. scanLabel
verdwijnt uit TemplateArgs en uit alle aanroepers.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

### Task 8: Beheerformulier: Lars vult aantallen voor (per afdeling en voor de doelgroep)

**Files:**
- Modify: `frontend/components/dashboard/new-campaign-form.tsx` (volledig)
- Modify: `frontend/components/dashboard/new-campaign-form.guard.test.ts` (volledig)

De operator maakt de campagne aan na de intake (spec 2026-09-16 par. 5.3, spec 2026-09-11 par. 8.3). Per afdeling komt er een veld "aantal medewerkers"; zonder afdelingsrapportage een veld "aantal in de doelgroep". Validatie via dezelfde helpers als de wizard; opslag in `segment_departments[].invited_count` en `campaign_delivery_records.invited_count`. De trigger `on_campaign_created` (schema.sql) maakt het delivery record aan, dus de write is een upsert op `campaign_id` die ook werkt als de trigger ooit ontbreekt. Een lege afdelingslijst mag (de klant vult hem zelf in de wizard); een half ingevulde niet. `Rapport-add-ons` en `Surveymodules` blijven ongewijzigd (de guard-test in `app/(dashboard)/beheer/` faalt daar al op main; buiten scope).

- [ ] **Step 1: Falende guard-test**

Vervang `frontend/components/dashboard/new-campaign-form.guard.test.ts` volledig door:

```ts
import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

const source = readFileSync(new URL('./new-campaign-form.tsx', import.meta.url), 'utf8')

describe('new campaign form — segmentatie', () => {
  it('stuurt segment_departments mee bij aanmaak en biedt de suggestie-optie', () => {
    expect(source).toContain('segment_departments')
    expect(source).toContain('Geen afdeling / overig')
  })
})

describe('new campaign form — voorvullen door Loep (spec 2026-09-16 par. 5.3)', () => {
  it('vraagt per afdeling een aantal en valideert via dezelfde helper als de wizard', () => {
    expect(source).toContain('prepareSegmentDepartmentsUpdate')
    expect(source).toContain('Aantal medewerkers')
    expect(source).toContain('invited_count')
  })

  it('vraagt zonder afdelingsrapportage het aantal in de doelgroep met de gedeelde drempel', () => {
    expect(source).toContain('Aantal in de doelgroep')
    expect(source).toContain('validateInvitedTotal')
    expect(source).toContain('MIN_INVITED_TOTAL')
  })

  it('schrijft het totaal naar het delivery record en meldt het als dat mislukt', () => {
    expect(source).toContain(".from('campaign_delivery_records')")
    expect(source).toContain("onConflict: 'campaign_id'")
    expect(source).toContain('Campagne is aangemaakt, maar het aantal deelnemers kon niet worden opgeslagen')
  })

  it('bevat geen em- of en-dashes in nieuwe copy', () => {
    const newCopy = source.slice(source.indexOf('E-mail &amp; deelnemers'))
    expect(newCopy).not.toMatch(/[—–]/)
  })
})
```

- [ ] **Step 2: Run om te zien dat hij faalt**

Run:
```bash
cd /c/Users/larsh/Desktop/Business/Verisight/.worktrees/klantsuite-2a/frontend
npx vitest run components/dashboard/new-campaign-form.guard.test.ts 2>&1 | tail -10
```
Expected: FAIL op `prepareSegmentDepartmentsUpdate`, `Aantal in de doelgroep`, `campaign_delivery_records` en de em-dash in het segmentblok.

- [ ] **Step 3: Formulier volledig herschrijven**

Vervang `frontend/components/dashboard/new-campaign-form.tsx` door:

```tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  CAMPAIGN_SCAN_OPTIONS,
  getCampaignNamePlaceholder,
  getDefaultModulesForScanType,
  isBaselineOnlyScanType,
  supportsCampaignModuleSelection,
  supportsCampaignReportAddOns,
} from '@/lib/campaign-setup'
import { prepareSegmentDepartmentsUpdate } from '@/lib/self-send-comms'
import { MIN_INVITED_PER_DEPARTMENT, MIN_INVITED_TOTAL, validateInvitedTotal } from '@/lib/response-activation'
import { createClient } from '@/lib/supabase/client'
import type { CommsMode, DeliveryMode, Organization, ScanType } from '@/lib/types'
import { FACTOR_LABELS, REPORT_ADD_ON_LABELS } from '@/lib/types'

const ORG_FACTORS = ['leadership', 'culture', 'growth', 'compensation', 'workload', 'role_clarity']
const REPORT_ADD_ONS = ['segment_deep_dive'] as const
const OTHER_DEPARTMENT_LABEL = 'Geen afdeling / overig'

interface Props {
  orgs: Organization[]
}

interface DeptRow {
  label: string
  invitedCount: number | ''
}

export function NewCampaignForm({ orgs }: Props) {
  const [orgId, setOrgId] = useState(orgs[0]?.id ?? '')
  const [name, setName] = useState('')
  const [scanType, setScanType] = useState<ScanType>('exit')
  const [deliveryMode, setDeliveryMode] = useState<DeliveryMode>('baseline')
  // Alleen self_send: platform slaat bewust geen deelnemer-e-mailadressen op.
  // De platform-verzendkeuze is uit de aanmaakflow gehaald (2026-07-08); bestaande
  // campagnes met de oude modus blijven elders gewoon werken, dit is puur de keuze
  // bij het aanmaken van een nieuwe campagne.
  const commsMode: CommsMode = 'self_send'
  const [modules, setModules] = useState<string[]>([])
  const [useSegments, setUseSegments] = useState(false)
  const [deptRows, setDeptRows] = useState<DeptRow[]>([{ label: '', invitedCount: '' }, { label: '', invitedCount: '' }])
  const [targetCount, setTargetCount] = useState<number | ''>('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const hasSegmentDeepDive = modules.includes('segment_deep_dive')
  const campaignNamePlaceholder = getCampaignNamePlaceholder(scanType)

  function toggleModule(module: string) {
    setModules((prev) => (prev.includes(module) ? prev.filter((entry) => entry !== module) : [...prev, module]))
  }

  function handleScanTypeChange(nextScanType: ScanType) {
    setScanType(nextScanType)
    if (isBaselineOnlyScanType(nextScanType)) {
      setDeliveryMode('baseline')
    }
    setModules(getDefaultModulesForScanType(nextScanType))
  }

  function updateDeptRow(index: number, patch: Partial<DeptRow>) {
    setDeptRows((prev) => prev.map((row, i) => (i === index ? { ...row, ...patch } : row)))
  }

  function addDeptRow(label = '') {
    setDeptRows((prev) => [...prev, { label, invitedCount: '' }])
  }

  function removeDeptRow(index: number) {
    setDeptRows((prev) => prev.filter((_, i) => i !== index))
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    setLoading(true)
    setError(null)

    // Segment-modus mag met een lege lijst opgeslagen worden (spec 2026-07-12
    // par. 1): de klant vult de afdelingen zelf in via de setup-wizard. Zodra
    // er een rij is ingevuld, gelden dezelfde regels als in de wizard (min. 2,
    // geen dubbele/lege labels, minimaal 5 per afdeling, 10 in totaal). Een
    // half ingevulde lijst mag niet stil worden opgeslagen alsof die compleet is.
    let segmentDepartments: Array<{ label: string; slug: string; invited_count: number }> | null = null
    let invitedCount: number | null = null
    if (useSegments) {
      const filled = deptRows.filter((row) => row.label.trim() || row.invitedCount !== '')
      if (filled.length === 0) {
        segmentDepartments = []
      } else {
        try {
          const update = prepareSegmentDepartmentsUpdate(
            [],
            filled.map((row) => ({
              label: row.label.trim(),
              invited_count: typeof row.invitedCount === 'number' ? row.invitedCount : 0,
            })),
            new Set(),
          )
          segmentDepartments = update.departments
          invitedCount = update.totalInvited
        } catch (e) {
          setError(e instanceof Error ? e.message : 'Ongeldige afdelingslijst')
          setLoading(false)
          return
        }
      }
    } else if (targetCount !== '') {
      const targetError = validateInvitedTotal(targetCount)
      if (targetError) {
        setError(targetError)
        setLoading(false)
        return
      }
      invitedCount = targetCount
    }

    const { data: created, error: insertError } = await supabase
      .from('campaigns')
      .insert({
        organization_id: orgId,
        name,
        scan_type: scanType,
        delivery_mode: deliveryMode,
        comms_mode: commsMode,
        enabled_modules: modules.length > 0 ? modules : null,
        segment_departments: segmentDepartments,
      })
      .select('id')
      .single()

    if (insertError || !created) {
      setError(insertError?.message ?? 'Aanmaken mislukt.')
      setLoading(false)
      return
    }

    // Voorvullen (spec 2026-09-16 par. 5.3): het totaal op het delivery record,
    // dat de trigger on_campaign_created zojuist heeft aangemaakt. Upsert, zodat
    // dit ook werkt als dat record ontbreekt. Fail Loud: de campagne bestaat al,
    // dus zeg precies dat als deze tweede write faalt.
    if (invitedCount !== null) {
      const { error: deliveryError } = await supabase
        .from('campaign_delivery_records')
        .upsert(
          { campaign_id: created.id, organization_id: orgId, invited_count: invitedCount },
          { onConflict: 'campaign_id' },
        )
      if (deliveryError) {
        setError(
          `Campagne is aangemaakt, maar het aantal deelnemers kon niet worden opgeslagen: ${deliveryError.message}. Zet het alsnog via de campagnepagina of laat de klant het in stap 1 invullen.`,
        )
        setLoading(false)
        router.refresh()
        return
      }
    }

    setSuccess(true)
    setName('')
    setDeliveryMode('baseline')
    setDeptRows([{ label: '', invitedCount: '' }, { label: '', invitedCount: '' }])
    setTargetCount('')
    setTimeout(() => {
      setSuccess(false)
      router.refresh()
    }, 1500)
    setLoading(false)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Context</p>

      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700">Organisatie</label>
        <select value={orgId} onChange={(event) => setOrgId(event.target.value)} className={fieldClass}>
          {orgs.map((organization) => (
            <option key={organization.id} value={organization.id}>
              {organization.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700">Naam campaign</label>
        <input
          type="text"
          required
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder={campaignNamePlaceholder}
          className={fieldClass}
        />
      </div>

      <div className="border-t border-slate-200 pt-2">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Kies product</p>
      </div>

      <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-3">
        {CAMPAIGN_SCAN_OPTIONS.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => handleScanTypeChange(option.value)}
            className={`rounded-[22px] border p-4 text-left transition-colors ${
              scanType === option.value ? 'border-blue-600 bg-blue-600 text-white' : 'border-slate-200 bg-white text-slate-700 hover:border-blue-300'
            }`}
          >
            <p className="text-sm font-semibold">{option.title}</p>
            <p className={`mt-1 text-sm ${scanType === option.value ? 'text-blue-100' : 'text-slate-500'}`}>{option.short}</p>
          </button>
        ))}
      </div>

      <div className="border-t border-slate-200 pt-2">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Kies route</p>
      </div>

      <div className={`grid gap-2 ${isBaselineOnlyScanType(scanType) ? 'sm:grid-cols-1' : 'sm:grid-cols-2'}`}>
        {([
          {
            value: 'baseline',
            title: 'Baseline',
            body: 'Standaard eerste route.',
            disabled: false,
          },
          {
            value: 'live',
            title: 'Live / vervolgroute',
            body: 'Alleen voor vervolggebruik.',
            disabled: isBaselineOnlyScanType(scanType),
          },
        ] as const).map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => !option.disabled && setDeliveryMode(option.value)}
            disabled={option.disabled}
            className={`rounded-[22px] border p-4 text-left transition-colors ${
              deliveryMode === option.value ? 'border-blue-600 bg-blue-600 text-white' : 'border-slate-200 bg-white text-slate-700 hover:border-blue-300'
            } ${option.disabled ? 'cursor-not-allowed opacity-60' : ''}`}
          >
            <p className="text-sm font-semibold">{option.title}</p>
            <p className={`mt-1 text-sm ${deliveryMode === option.value ? 'text-blue-100' : 'text-slate-500'}`}>
              {option.disabled ? 'Nog niet beschikbaar voor dit product.' : option.body}
            </p>
          </button>
        ))}
      </div>

      <div
        className={`rounded-[22px] border p-3 text-sm ${
          deliveryMode === 'baseline'
            ? 'border-emerald-100 bg-emerald-50 text-emerald-950'
            : 'border-amber-100 bg-amber-50 text-amber-950'
        }`}
      >
        <p className="font-semibold">{deliveryMode === 'baseline' ? 'Baseline is de standaardroute.' : 'Live alleen na een stabiele baseline.'}</p>
      </div>

      <div className="border-t border-slate-200 pt-2">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">E-mail &amp; deelnemers</p>
      </div>
      <div className="rounded-[22px] border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
        <p className="font-semibold text-slate-900">HR verstuurt zelf</p>
        <p className="mt-2 text-xs leading-5 text-slate-600">
          Kopieer-sjablonen, één campagnelink, geen e-mailopslag op het platform.
        </p>
      </div>

      <div className="rounded-[22px] border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
        <label className="flex items-center gap-2 font-semibold text-slate-900">
          <input
            type="checkbox"
            checked={useSegments}
            onChange={(event) => setUseSegments(event.target.checked)}
            className="rounded"
          />
          Rapporteren op afdelingsniveau
        </label>
        <p className="mt-2 text-xs leading-5 text-slate-600">
          Elke afdeling krijgt een eigen variant van de campagnelink. Er is dan bewust geen
          algemene link: elke deelnemer komt binnen via de link van zijn afdeling.
        </p>
        {useSegments ? (
          <div className="mt-3 space-y-2">
            <p className="text-xs font-medium text-slate-700">
              Afdelingen uit de intake (minimaal 2, elk minimaal {MIN_INVITED_PER_DEPARTMENT} medewerkers), of alles leeg
              laten zodat de klant dit zelf invult bij de setup.
            </p>
            {deptRows.map((row, index) => (
              <div key={index} className="flex gap-2">
                <input
                  type="text"
                  value={row.label}
                  placeholder="Afdelingsnaam"
                  onChange={(event) => updateDeptRow(index, { label: event.target.value })}
                  className={`${fieldClass} flex-1`}
                />
                <input
                  type="number"
                  min={MIN_INVITED_PER_DEPARTMENT}
                  value={row.invitedCount}
                  placeholder="Aantal medewerkers"
                  aria-label="Aantal medewerkers"
                  onChange={(event) =>
                    updateDeptRow(index, { invitedCount: event.target.value === '' ? '' : Number(event.target.value) })
                  }
                  className={`${fieldClass} w-44`}
                />
                {deptRows.length > 2 ? (
                  <button
                    type="button"
                    onClick={() => removeDeptRow(index)}
                    aria-label="Verwijder afdeling"
                    className="rounded-2xl border border-slate-200 px-3 text-sm text-slate-500 hover:bg-white"
                  >
                    ×
                  </button>
                ) : null}
              </div>
            ))}
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => addDeptRow()}
                className="text-xs font-medium text-blue-700 underline underline-offset-2"
              >
                + Afdeling toevoegen
              </button>
              <button
                type="button"
                onClick={() => addDeptRow(OTHER_DEPARTMENT_LABEL)}
                className="text-xs font-medium text-blue-700 underline underline-offset-2"
              >
                Voeg &ldquo;Geen afdeling / overig&rdquo; toe
              </button>
            </div>
            <p className="text-xs leading-5 text-slate-500">
              Aanbevolen voor iedereen die nergens onder valt (bijv. directie); anders klikken
              zij mogelijk willekeurig een afdeling aan.
            </p>
          </div>
        ) : (
          <div className="mt-3">
            <label className="mb-1 block text-xs font-medium text-slate-700">
              Aantal in de doelgroep <span className="font-normal text-slate-400">(uit de intake; minimaal {MIN_INVITED_TOTAL}, of leeg laten)</span>
            </label>
            <input
              type="number"
              min={MIN_INVITED_TOTAL}
              value={targetCount}
              placeholder="bijv. 180"
              onChange={(event) => setTargetCount(event.target.value === '' ? '' : Number(event.target.value))}
              className={fieldClass}
            />
            <p className="mt-1 text-xs leading-5 text-slate-500">
              De klant ziet dit voorgevuld in stap 1 van de wizard en corrigeert het daar.
            </p>
          </div>
        )}
      </div>

      {supportsCampaignModuleSelection(scanType) ? (
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">
            Surveymodules <span className="text-xs font-normal text-slate-400">(leeg = volledige scan)</span>
          </label>
          <div className="grid gap-2 sm:grid-cols-2">
            {ORG_FACTORS.map((factor) => (
              <label key={factor} className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700">
                <input
                  type="checkbox"
                  checked={modules.includes(factor)}
                  onChange={() => toggleModule(factor)}
                  className="rounded"
                />
                {FACTOR_LABELS[factor]}
              </label>
            ))}
          </div>
          <p className="mt-2 text-xs leading-5 text-slate-500">
            Pas dit alleen aan wanneer je bewust een compactere subset wilt meten.
          </p>
        </div>
      ) : (
        <div className="rounded-[22px] border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
          <p className="font-semibold text-slate-900">Vaste instrumentroute</p>
          <p className="mt-2 text-xs leading-5 text-slate-600">Deze scan gebruikt een vaste baseline-opzet.</p>
        </div>
      )}

      {supportsCampaignReportAddOns(scanType) ? (
        <div className="rounded-[22px] border border-blue-100 bg-blue-50 p-4">
          <p className="text-sm font-semibold text-slate-900">Rapport-add-ons</p>
          <div className="mt-3 space-y-2">
            {REPORT_ADD_ONS.map((addOn) => (
              <label key={addOn} className="flex items-start gap-3 rounded-2xl border border-white/80 bg-white/70 p-3 text-sm text-slate-700">
                <input
                  type="checkbox"
                  checked={modules.includes(addOn)}
                  onChange={() => toggleModule(addOn)}
                  className="mt-1 rounded"
                />
                <span>
                  <span className="block font-medium text-slate-900">{REPORT_ADD_ON_LABELS[addOn]}</span>
                  <span className="block text-xs leading-5 text-slate-500">Gebruik alleen wanneer extra segmentdetail nodig is.</span>
                </span>
              </label>
            ))}
          </div>
          {hasSegmentDeepDive ? (
            <p className="mt-3 text-xs leading-5 text-blue-800">Segment deep dive gebruikt bestaande metadata in het rapport.</p>
          ) : null}
        </div>
      ) : null}

      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      {success ? <p className="text-sm text-green-600">Campaign aangemaakt.</p> : null}

      <button type="submit" disabled={loading} className={buttonClass}>
        {loading ? 'Bezig...' : '+ Aanmaken'}
      </button>
    </form>
  )
}

const fieldClass =
  'w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100'

const buttonClass =
  'w-full rounded-full bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-blue-700 disabled:opacity-50'
```

Let op de RLS-grens: het delivery record is voor `is_org_manager(organization_id)` schrijfbaar, en de operator is via `handle_new_org` lid van elke organisatie die via `/beheer` is aangemaakt. Is dat bij een oude organisatie niet zo, dan geeft de upsert een fout en toont het formulier die (de campagne bestaat dan wel; de klant vult het aantal alsnog in stap 1 in). Dat is bewust geen stille no-op.

- [ ] **Step 4: Tests en tsc**

Run:
```bash
cd /c/Users/larsh/Desktop/Business/Verisight/.worktrees/klantsuite-2a/frontend
npx vitest run components/dashboard/new-campaign-form.guard.test.ts "app/(dashboard)/beheer/new-campaign-form.guard.test.ts" 2>&1 | tail -12
npx tsc --noEmit 2>&1 | grep -c "error TS"
```
Expected: `components/dashboard/new-campaign-form.guard.test.ts` PASS; in `app/(dashboard)/beheer/new-campaign-form.guard.test.ts` slaagt de self_send-test en faalt `keeps the campaign step compact...` nog steeds (staat op de baseline: `Rapport-add-ons` en `segment_deep_dive` staan al op main in het bestand); tsc `133`.

- [ ] **Step 5: Commit**

```bash
cd /c/Users/larsh/Desktop/Business/Verisight/.worktrees/klantsuite-2a
git add frontend/components/dashboard/new-campaign-form.tsx frontend/components/dashboard/new-campaign-form.guard.test.ts
git commit -m "feat(beheer): aantallen per afdeling en aantal in de doelgroep voorvullen bij het aanmaken

Zelfde validatie als de wizard (prepareSegmentDepartmentsUpdate,
validateInvitedTotal); opslag in segment_departments[].invited_count en
campaign_delivery_records.invited_count (upsert op campaign_id).

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

### Task 9: Eindverificatie, documenten en browsercheck op de testklant

**Files:**
- Modify: `docs/testklant.md` (checklist, punten 2 en 5)
- Kopie naar de branch: `docs/superpowers/specs/2026-09-16-klantsuite-design.md`, `docs/klantreis-walkthrough-2026-09-16.md`, `docs/superpowers/plans/2026-09-16-klantsuite-2a-levenscyclus.md`
- Create: `docs/superpowers/plans/2026-09-16-klantsuite-2a-uitvoering.md`

- [ ] **Step 1: Typecheck**

Run:
```bash
cd /c/Users/larsh/Desktop/Business/Verisight/.worktrees/klantsuite-2a/frontend
npx tsc --noEmit 2>&1 | grep -c "error TS"
```
Expected: exact de baseline uit Task 0 (verwacht `133`). Is het hoger, zoek de nieuwe fouten op met `npx tsc --noEmit | grep "error TS"` en los ze op voordat je verdergaat.

- [ ] **Step 2: Faalset vergelijken, niet alleen tellen**

Run:
```bash
cd /c/Users/larsh/Desktop/Business/Verisight/.worktrees/klantsuite-2a/frontend
npx vitest run --reporter=json --outputFile=/c/Users/larsh/AppData/Local/Temp/loep-klantsuite-2a/vitest-na.json >/dev/null 2>&1
node -e "const r=require('/c/Users/larsh/AppData/Local/Temp/loep-klantsuite-2a/vitest-na.json');const f=[];for(const s of r.testResults)for(const t of s.assertionResults)if(t.status==='failed')f.push(s.name.replace(/\\\\/g,'/').split('/frontend/')[1]+' > '+t.fullName);console.log(f.sort().join('\n'))" > /c/Users/larsh/AppData/Local/Temp/loep-klantsuite-2a/na-fails.txt
diff /c/Users/larsh/AppData/Local/Temp/loep-klantsuite-2a/baseline-fails.txt /c/Users/larsh/AppData/Local/Temp/loep-klantsuite-2a/na-fails.txt
```
Expected: alleen regels met `<` (tests die op main faalden en nu slagen). Verwacht verdwenen: `lib/dashboard/dashboard-state-resolver.test.ts > resolveDashboardState > State 0 — no campaign` (herschreven in Task 5). Geen enkele regel met `>`: elke `>`-regel is een nieuwe regressie en moet opgelost worden voordat deze taak af is. Verschijnt `app/(dashboard)/beheer/health/page.test.ts` als `>`, draai opnieuw (bekende wisselvalligheid) en vergelijk nogmaals.

- [ ] **Step 3: Productiebuild**

Run:
```bash
cd /c/Users/larsh/Desktop/Business/Verisight/.worktrees/klantsuite-2a/frontend
npm run build > /c/Users/larsh/AppData/Local/Temp/loep-klantsuite-2a/build.log 2>&1; echo "exit=$?"
tail -25 /c/Users/larsh/AppData/Local/Temp/loep-klantsuite-2a/build.log
```
Expected: `exit=0` en de routetabel in de log. `exit=1` met `Missing API key` of ontbrekende Supabase-sleutels betekent dat `.env.local` niet in de worktree staat (Task 0, Step 1).

- [ ] **Step 4: Testklant resetten en browsercheck**

De testklant staat op productie; de nieuwe code nog niet. Draai de check daarom tegen een lokale frontend die naar productie-Supabase wijst (`.env.local` uit Task 0), met de bestaande dev-server-configuratie in `C:\Users\larsh\Desktop\Business\.claude\launch.json` maar dan vanuit de worktree. Log in met een verse sessielink.

Run:
```bash
cd /c/Users/larsh/Desktop/Business/Verisight
.venv/Scripts/python.exe scripts/seed_test_tenant.py --dry-run
.venv/Scripts/python.exe scripts/seed_test_tenant.py --reset
.venv/Scripts/python.exe scripts/seed_test_tenant.py --login-link
cd .worktrees/klantsuite-2a/frontend
npm run dev -- --port 3100
```
Expected: dry-run en reset slagen ("11 tellingen van andere organisaties ongewijzigd"); de login-link print een URL naar `/complete-account?token_hash=...`; de dev-server luistert op `http://localhost:3100`. Open de login-link met de host vervangen door `localhost:3100` (de link zelf wijst naar het productiedomein; het `token_hash` werkt tegen dezelfde Supabase).

Doorloop, met de browsertools van Claude Preview (desktop 1280 px en mobiel 375 px, console open):

1. `/dashboard` toont campagne B. Vóór dag 5 na de seed-lancering: "Campagne loopt", "6 van 30 ingevuld", tijdlijn met "Uitnodiging verstuurd" (datum), "Herinnering" (datum) en "Meting sluit: Nog niet ingesteld", knop "Meting sluiten", geen herinneringstekst. Vanaf dag 5: "Vandaag: stuur de herinnering" met onderwerp en bericht in twee velden met eigen "Kopieer"-knoppen, de bevestigknop uitgeschakeld tot je kopieert, en "Geen herinnering versturen".
2. Klik "Meting sluiten" op B. De dialoog zegt "Je sluit met 6 van 30 ingevuld. Voor een rapport zijn minimaal 10 antwoorden nodig; die komen er dan niet. Wil je liever twee weken verlengen?" met "Toch sluiten" en "Twee weken verlengen". Kies verlengen: de kaart ververst en de tijdlijn toont "Meting sluit" op vandaag + 14 dagen. Verleng nog twee keer; bij de vierde poging zegt de dialoog dat verlengen niet meer kan.
3. Klik op de herinneringskaart (of, vóór dag 5, sla dit over) "Geen herinnering versturen": de kaart wordt "Campagne loopt" en de tijdlijn toont "Herinnering: Overgeslagen".
4. `/campaigns/d13634c5-115c-51ea-b337-e933dbf74f0f/setup` (campagne C): stap 1 toont Startdatum (met toelichting "De dag waarop je de uitnodiging verstuurt."), Sluitdatum (springt naar start + 21 zodra je een startdatum kiest), Herinnering (standaard "5 dagen na de start" met de datum in de toelichting), Aantal deelnemers met de Loep Vertrek-toelichting, en geen checkbox "Link getest". Vul 3 in: de Nederlandse melding over minimaal 10 verschijnt, niets wordt opgeslagen. Vul een datum van gisteren in: "Kies een startdatum vanaf vandaag." Vul 30 in en sla op: stap 2 opent.
5. Stap 2: "Terug naar stap 1" brengt je terug met de waarden voorgevuld; herlaad de pagina: de wizard opent op stap 1 met dezelfde waarden. De uitnodiging eindigt op "Met vriendelijke groet, TEST Loep Testklant" en bevat geen "(Loep Vertrek)". Stap 3 toont de gedimde tijdlijn met de drie datums en de regel over minimaal 10 ingevulde vragenlijsten.
6. Klik "Ja, verstuurd" zonder te kopiëren: de dialoog meldt dat er nog niets gekopieerd is. "Nog niet" sluit hem. Kopieer het bericht, klik opnieuw, bevestig: de campagnepagina van C toont "Campagne loopt" met de tijdlijn (start vandaag, herinnering over 5 dagen, sluit over 21 dagen) en "Meting sluiten".
7. `/campaigns/12b958fb-ce46-5efa-a947-d5b6e1e09126` (campagne A) toont nog steeds "Je rapport is beschikbaar" en de downloadknop (blok A ongewijzigd).
8. Op 375 px: geen horizontale scroll op dashboard, campagne B en de herinneringskaart (`document.documentElement.scrollWidth === 375`); de sluitdialoog past in beeld. De wizard zelf is op 375 px nog drie kolommen (blok H, plan 2b) en hoort hier niet groen te zijn.
9. Console: 0 errors op alle bezochte pagina's.

Sluit af met een reset zodat de testklant weer in de uitgangssituatie staat, en noteer dat een volgende check een verse login-link nodig heeft:

```bash
cd /c/Users/larsh/Desktop/Business/Verisight
.venv/Scripts/python.exe scripts/seed_test_tenant.py --reset
```

- [ ] **Step 5: `docs/testklant.md` bijwerken**

Vervang in `docs/testklant.md` in de checklist "Browsercheck na een klantzichtbare wijziging" punt 2:

```markdown
2. `/dashboard` toont campagne B als "Campagne loopt", met "6 van 30 ingevuld"
   en een herinneringstekst waarin de surveylink staat.
```

door:

```markdown
2. `/dashboard` toont campagne B met "6 van 30 ingevuld", de tijdlijn (start,
   herinnering, sluitdatum) en de knop "Meting sluiten". Tot vijf dagen na de
   seed-lancering heet de kaart "Campagne loopt" en staat er geen
   herinneringstekst; daarna "Vandaag: stuur de herinnering" met onderwerp en
   bericht apart kopieerbaar (surveylink in het bericht) en "Geen herinnering
   versturen".
```

en punt 5:

```markdown
5. `/campaigns/d13634c5-115c-51ea-b337-e933dbf74f0f/setup` opent de wizard bij
   stap 1 met een lege startdatum en een werkende survey-link.
```

door:

```markdown
5. `/campaigns/d13634c5-115c-51ea-b337-e933dbf74f0f/setup` opent de wizard bij
   stap 1 met een lege startdatum, sluitdatum en herinnering (standaard 5
   dagen), een werkende survey-link en de toelichting bij "Aantal deelnemers".
   3 deelnemers wordt geweigerd met de melding over minimaal 10.
```

- [ ] **Step 6: Documenten meenemen op de branch en het uitvoeringsverslag schrijven**

De spec, de walkthrough en dit plan staan untracked in de hoofdrepo en ontbreken in de worktree.

Run:
```bash
cd /c/Users/larsh/Desktop/Business/Verisight
cp docs/superpowers/specs/2026-09-16-klantsuite-design.md .worktrees/klantsuite-2a/docs/superpowers/specs/
cp docs/klantreis-walkthrough-2026-09-16.md .worktrees/klantsuite-2a/docs/
cp docs/superpowers/plans/2026-09-16-klantsuite-2a-levenscyclus.md .worktrees/klantsuite-2a/docs/superpowers/plans/
```

Maak in de worktree `docs/superpowers/plans/2026-09-16-klantsuite-2a-uitvoering.md` met: de eind-baselines (tsc, faalset-diff, build), de uitkomst per punt van de browsercheck (met welke dag na de seed-lancering het was, want dat bepaalt of je de herinneringskaart zag), elke plek waar je van dit plan bent afgeweken en waarom, en wat je bewust hebt laten liggen. Geen screenshots met inloggegevens.

Run:
```bash
cd /c/Users/larsh/Desktop/Business/Verisight/.worktrees/klantsuite-2a
git add docs/testklant.md docs/superpowers/specs/2026-09-16-klantsuite-design.md docs/klantreis-walkthrough-2026-09-16.md docs/superpowers/plans/2026-09-16-klantsuite-2a-levenscyclus.md docs/superpowers/plans/2026-09-16-klantsuite-2a-uitvoering.md
git commit -m "docs: spec, walkthrough, plan en uitvoeringsverslag klantsuite 2a; testklant-checklist bijgewerkt

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

- [ ] **Step 7: Klaar voor review**

Run:
```bash
cd /c/Users/larsh/Desktop/Business/Verisight/.worktrees/klantsuite-2a
git log --oneline main..HEAD
git diff --stat main..HEAD
```
Expected: negen commits (Task 1 t/m 8 plus docs), alleen bestanden uit het bestandsoverzicht. Meld terug met de faalset-diff, het tsc-getal, de build-exitcode, de browsercheck-uitkomsten en de afwijkingen; de merge naar main doet Lars (of een aparte afrondsessie met `superpowers:finishing-a-development-branch`). Plan 2b (blok G en H) start op deze merge.

---

## Zelfreview van dit plan

**Spec-dekking (blok D en E, plus par. 8 t/m 10 waar ze D en E raken):**

| Spec | Taak |
|---|---|
| 4.1 sluitdatum en herinnering in stap 1, opslag in `closes_at` en `reminder_config`, servervalidatie, Nederlandse datumfouten, `min` op het datumveld | Task 2 |
| 4.2 stap 3 "Volgen en afronden" met tijdlijn en datums, "rapport via Loep" weg, gedimde vooruitblik vóór de lancering; tijdlijn op elke kaart van een lopende meting | Task 4 (wizard, `RunningStateCard`, `DashboardStateCard`, `ReadOnlyStateCard`) |
| 4.3 "Meting sluiten" altijd bereikbaar; eigen dialoog boven en onder de drempel; `extendCampaignAction` (+14, max 3× via auditevents `metadata.extension`); `expired` boven/onder de drempel; `skipReminderAction` (`send_reminders`, `channel: 'skipped_by_customer'`) | Task 5 |
| 4.4 herinneringskaart: tijdlijn, onderwerp en bericht apart, pas op de herinneringsdag | Task 4 (tijdlijn, lopende kaart zonder tekst) + Task 6 (composer) |
| 4.5 gesloten zonder rapport als eindtoestand met contact | Task 5 (resolver: mailto met `LOEP_CONTACT_EMAIL`) |
| 5.1 `MIN_INVITED_TOTAL`, `MIN_INVITED_PER_DEPARTMENT`, `MIN_INVITED_COUNT` weg | Task 1 |
| 5.2 drempels client en server met de spec-meldingen; toelichtingen per scan en bij startdatum; checkbox weg; terug naar stap 1; bevestiging vóór "Ja, verstuurd" incl. "niets gekopieerd"; ondertekening organisatienaam; scannaam uit de mail | Task 1 (drempels), Task 2 (toelichtingen, checkbox, stap 1), Task 3 (terug, dialoog), Task 7 (ondertekening, scannaam) |
| 5.3 beheerformulier met aantallen, zelfde helper, opslag in `segment_departments[].invited_count` en `campaign_delivery_records.invited_count` | Task 8 |
| 8 geen schemawijziging, bestaande outcome-waarden en `metadata` | overal; geen migratie in dit plan |
| 9 `{ ok, error?, warning? }`, geen throw, eigen dialogen voor lanceren en sluiten, Nederlandse afwijzingen | Task 2 (actions), Task 3 (lanceerdialoog), Task 5 (sluitdialoog, extend-warning) |
| 10 pure tests (resolver expired boven/onder, skip, eindtoestand; drempels; verleng-logica en drie-keer-grens), gemockte actions, source-guards (`confirm(`), baselines | Task 1, 2, 4, 5, 6, 9 |

**Bewuste afwijkingen van de spec, met reden:**
1. `close_without_report` als apart actiesoort vervalt; `close_campaign` opent één dialoog die zelf op `reportReady` en `canExtend` splitst. Dat is letterlijk wat par. 4.3 beschrijft ("dezelfde dialoogkeuzes als hoofdkaart") en voorkomt twee knoppen met twee waarheden.
2. De degraded-tekst "Sluitdatum: nog niet gepland" wordt "Sluitdatum: nog niet ingesteld" in plaats van te verdwijnen: campagne B van de testklant en elke meting van vóór dit plan heeft geen `closes_at`, en de spec wil geen gok. Voor nieuwe metingen komt de tekst niet meer voor.
3. De ondertekening met organisatienaam geldt ook voor de herinnering, niet alleen voor de uitnodiging: dezelfde "HR"-fout stond in beide templates (walkthrough 4).
4. De bevestigknop op de herinneringskaart is uitgeschakeld tot er iets gekopieerd is (par. 4.4 vraagt alleen aparte velden). Anders belooft "Ik heb de herinnering verstuurd" iets dat niet gebeurd kan zijn.
5. `isReminderDue` wordt niet aangeraakt: de spec-eis ("elk `send_reminders`-event op of na de vervaldatum telt als afgehandeld") is al waar en wordt in Task 5 met een resolvertest gepind.
6. Het `generating`-pad van `processing` blijft ongewijzigd (par. 4.5 gaat alleen over `insufficient_response`).

**Placeholder-scan:** geen "TBD", "TODO", "implement later", "similar to Task N"; elke codestap bevat de code; elke run-stap heeft een verwacht resultaat.

**Typeconsistentie, gecontroleerd tussen taken:**
- `validateInvitedTotal(value: unknown): string | null` en `validateDepartmentInvitedCount(label: string, value: unknown): string | null` (Task 1) worden zo gebruikt in Task 2 (wizard, action), Task 8 (formulier).
- `LaunchSetupInput = { launchDate, invitedCount, closesAt, reminderChoice: ReminderChoice }` (Task 2) is wat de wizard in Task 2 en 3 stuurt.
- `SetupWizardCardProps` (Task 2) heeft `initialClosesAt: string | null` en `initialReminderChoice: ReminderChoice | null`; `WelcomeGate` en de drie pagina's geven exact die door; `readReminderChoice(value: unknown): ReminderChoice | null`.
- `buildCampaignTimeline(input: CampaignTimelineInput): CampaignTimeline` (Task 4) wordt met dezelfde zeven velden aangeroepen in de resolver (Task 4 en 5) en de wizard (Task 4).
- `DashboardStateInput` krijgt `reminderSkipped` in Task 4 en `extensionCount` in Task 5; beide pagina's leveren ze in dezelfde taak; de resolvertest uit Task 5 vult beide in `baseInput`.
- `DashboardState` heeft na Task 5: `timeline`, `totalCompleted`, `totalInvited`, `reportReady`, `reportThreshold`, `canExtend`, `extensionsLeft`; het eiland (Task 5, 6) en `buildCloseDialog` lezen precies die velden.
- `DashboardSecondaryAction.kind` is `'link' | 'close_campaign' | 'extend' | 'skip_reminder'`; `ctaKind` is `'link' | 'copy_reminder' | 'close_campaign' | 'extend'`; de `switch` in het eiland dekt alle vier de secundaire soorten.
- `ConfirmDialogAction = { label, onClick, variant?, disabled? }` (Task 3) is wat de wizard (Task 3) en het eiland (Task 5) meegeven.
- `TemplateArgs` verliest `scanLabel` in Task 7; alle vijf aanroepers (wizard, `reminder-text.ts`, paneel ×2, en via `reminder-text` de twee pagina's) worden in dezelfde taak aangepast, plus de tests die de args letterlijk opbouwen.
- `extendCampaignAction`/`skipReminderAction` geven `DashboardActionResult` terug; `run()` in het eiland verwacht `{ ok, error?, warning? }`.

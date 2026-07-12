# Klant-selfservice afdelingsbeheer — implementatieplan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** De klant (owner/member) voert zelf de afdelingslijst in via de setup-wizard — per afdeling naam + aantal deelnemers + kopieerbare link, met rij-vergrendeling zodra responses bestaan — en dashboard + rapport tonen responspercentage per afdeling.

**Architecture:** Nieuwe server action (`segment-actions.ts`, zelfde `getAuthAndMembership`-patroon als `launch-setup-actions.ts`) valideert en schrijft `campaigns.segment_departments` (nu `[{label, slug, invited_count}]`) via de authed client — de bestaande RLS-policy `org_managers_can_update_campaigns` dekt owner/member. Campagne-totaal `invited_count` op het delivery record wordt de automatische som. De wizard (`setup-wizard-card.tsx`) krijgt in segment-modus een afdelingsblok i.p.v. het enkelvoudige aantal-veld; het setup-panel toont per afdeling "X van Y (Z%)"; het rapport-segmentblok krijgt een responskolom. Spec: `docs/superpowers/specs/2026-07-12-klant-afdelingsbeheer-design.md`.

**Tech Stack:** Next.js server actions + React (wizard/panel), vitest, Python/pytest (rapport), WeasyPrint-Docker voor PDF-validatie.

**Referentiefeiten (geverifieerd in code, 2026-07-12):**
- Server-action-patroon: `frontend/app/(dashboard)/campaigns/[id]/setup/launch-setup-actions.ts` — `getAuthAndMembership(campaignId)` (owner/member of verisight-admin; in sync met `is_org_manager()`), `ActionResult {ok, error?}`, authed `createClient()` uit `@/lib/supabase/server`.
- RLS: `supabase/schema.sql:1408` — `org_managers_can_update_campaigns` (update op `campaigns` voor owner/member). Geen service role nodig; de authed client mag `segment_departments` schrijven. **Geen migratie nodig** (JSONB-shape-uitbreiding).
- Slug/validatiehelpers frontend: `frontend/lib/self-send-comms.ts` — `SegmentDepartment {label, slug}`, `buildSegmentDepartments(labels)` (throws bij leeg/duplicaat), `buildSegmentSurveyLinks(baseUrl, token, departments)`, `buildSurveyLink`, `computeResponseRatePct(completed, invited)`.
- Wizard: `frontend/components/dashboard/setup-wizard-card.tsx` — stap 1 (lanceerdatum + `invitedCount`, submit → `saveLaunchSetupAction(campaignId, launchDate, Number(invitedCount))`), stap 2 (kopieersjablonen via `buildInviteBody` + `buildSurveyLink`). Props: `campaignId, scanType, organizationName, publicSurveyToken, frontendBaseUrl, initialLaunchDate, initialInvitedCount`. Callsites: `frontend/app/(dashboard)/campaigns/[id]/setup/page.tsx:48` en `frontend/components/dashboard/welcome-gate.tsx:45` (spread `{...props}` — props komen van de dashboard-pagina).
- Setup-panel: `frontend/components/dashboard/self-send-setup-panel.tsx` — heeft al `segmentDepartments`-prop + `segmentLinks` (vorige ronde), `invitedCount`-state, `computeResponseRatePct`, `totalCompleted`. Data via `frontend/app/(dashboard)/campaigns/[id]/beheer/beheer-data.ts` (select bevat al `segment_departments`, genormaliseerd via `normalizeSegmentDepartments`, regel ~34-44/770/1046) → `route-beheer-phase-sections.tsx` (2 panel-instanties, regels ~249/326).
- Rapport: `backend/report_html.py` — `_department_segment_rows(respondents)` (regel 945; rows `{department, n, avg, scores, is_pooled}`), `_segment_block(segment_rows)` (regel ~853, tabelkolommen naam/n/score/band/strip), `build_report_data` heeft `camp` (dus `camp.segment_departments`) in scope en bouwt `segment_rows` uit `completed`. **Noch generator noch rapport leest `segment_departments` vandaag.**
- Generator: `generate_voorbeeldrapport.py` — configs hebben `"invited"` (regel ~82/91/220); demo-campagne krijgt nog géén `segment_departments`.
- Baselines: backend **25 failed** (pytest), frontend **tsc 133**. Elke taak eindigt exact op die baselines. Python: `../../.venv/Scripts/python.exe` vanuit de worktree. Frontend-commando's vanuit `frontend/` (worktree heeft `npm install` nodig vóór de eerste frontend-taak). WeasyPrint via PowerShell (Git Bash breekt de Docker-mount).

---

### Task 1: pure update-logica + server action `saveSegmentDepartmentsAction`

**Files:**
- Modify: `frontend/lib/self-send-comms.ts` (pure merge/validatiehelper + shape-uitbreiding)
- Create: `frontend/app/(dashboard)/campaigns/[id]/setup/segment-actions.ts`
- Test: `frontend/lib/self-send-comms.test.ts` + `frontend/app/(dashboard)/campaigns/[id]/setup/segment-actions.guard.test.ts`

- [ ] **Step 1: Schrijf de falende tests (pure helper)**

```typescript
// toevoegen aan frontend/lib/self-send-comms.test.ts
import { prepareSegmentDepartmentsUpdate } from './self-send-comms'

describe('prepareSegmentDepartmentsUpdate', () => {
  const existing = [
    { label: 'Sales', slug: 'sales', invited_count: 10 },
    { label: 'Operations', slug: 'operations', invited_count: 14 },
  ]

  it('staat toevoegen en aantal-wijziging altijd toe', () => {
    const out = prepareSegmentDepartmentsUpdate(
      existing,
      [
        { label: 'Sales', invited_count: 12 },          // aantal gewijzigd: ok
        { label: 'Operations', invited_count: 14 },
        { label: 'Kantoor', invited_count: 8 },          // nieuw: ok
      ],
      new Set(['Sales', 'Operations']),                  // beide vergrendeld
    )
    expect(out.departments.map((d) => d.slug)).toEqual(['sales', 'operations', 'kantoor'])
    expect(out.departments[0].invited_count).toBe(12)
    expect(out.totalInvited).toBe(34)
  })

  it('weigert hernoemen/verwijderen van een vergrendelde afdeling', () => {
    // Sales (vergrendeld) ontbreekt in de nieuwe lijst -> verwijdering -> fout
    expect(() =>
      prepareSegmentDepartmentsUpdate(existing, [{ label: 'Operations', invited_count: 14 }],
        new Set(['Sales'])),
    ).toThrow(/Sales/)
  })

  it('staat hernoemen/verwijderen van een onvergrendelde afdeling toe', () => {
    const out = prepareSegmentDepartmentsUpdate(
      existing,
      [
        { label: 'Sales & Accountmanagement', invited_count: 10 }, // hernoemd
        { label: 'Operations', invited_count: 14 },
      ],
      new Set(['Operations']),                            // alleen Operations vergrendeld
    )
    expect(out.departments[0].slug).toBe('sales-accountmanagement')
  })

  it('eist minimaal 2 afdelingen', () => {
    expect(() =>
      prepareSegmentDepartmentsUpdate(existing, [{ label: 'Sales', invited_count: 10 }],
        new Set()),
    ).toThrow(/minimaal 2/)
  })

  it('eist een positief aantal per afdeling', () => {
    expect(() =>
      prepareSegmentDepartmentsUpdate(existing,
        [{ label: 'Sales', invited_count: 0 }, { label: 'Ops', invited_count: 5 }],
        new Set()),
    ).toThrow(/aantal/i)
  })
})
```

- [ ] **Step 2: Run — verwacht FAIL**

Run vanuit `frontend/`: `npx vitest run lib/self-send-comms.test.ts`
Expected: nieuwe tests falen op import.

- [ ] **Step 3: Implementeer de pure helper**

In `frontend/lib/self-send-comms.ts` — breid het interface uit en voeg de helper toe (onder `buildSegmentSurveyLinks`):

```typescript
export interface SegmentDepartmentInput {
  label: string
  invited_count: number
}

// Shape-uitbreiding (spec 2026-07-12): invited_count is optioneel op bestaande
// data (oude campagnes hebben alleen {label, slug}); nieuwe writes zetten hem altijd.
export interface SegmentDepartmentStored extends SegmentDepartment {
  invited_count?: number
}

export interface SegmentDepartmentsUpdate {
  departments: Array<{ label: string; slug: string; invited_count: number }>
  totalInvited: number
}

/**
 * Valideert een volledige nieuwe afdelingslijst tegen de vergrendelregels
 * (spec 2026-07-12 §3): toevoegen altijd; hernoemen/verwijderen alleen als
 * de afdeling niet vergrendeld is (lockedLabels = labels met >=1 respondent);
 * aantallen altijd aanpasbaar. Pure functie — de server action levert
 * lockedLabels uit de database en is de echte grens.
 */
export function prepareSegmentDepartmentsUpdate(
  existing: SegmentDepartmentStored[],
  incoming: SegmentDepartmentInput[],
  lockedLabels: Set<string>,
): SegmentDepartmentsUpdate {
  if (incoming.length < 2) throw new Error('Segmentrapportage vraagt minimaal 2 afdelingen.')
  for (const item of incoming) {
    if (!Number.isInteger(item.invited_count) || item.invited_count < 1) {
      throw new Error(`Vul een geldig aantal deelnemers in voor '${(item.label ?? '').trim() || '?'}' (minimaal 1).`)
    }
  }
  // Hergebruik de bestaande label/slug-validatie (leeg, duplicaat):
  const validated = buildSegmentDepartments(incoming.map((i) => i.label))
  const incomingLabels = new Set(validated.map((d) => d.label))
  // Vergrendelde afdelingen moeten ongewijzigd (zelfde label) terugkomen:
  for (const label of lockedLabels) {
    if (!incomingLabels.has(label)) {
      throw new Error(
        `Afdeling '${label}' heeft al responses en kan niet hernoemd of verwijderd worden.`,
      )
    }
  }
  const departments = validated.map((d, i) => ({
    ...d,
    invited_count: incoming[i].invited_count,
  }))
  return {
    departments,
    totalInvited: departments.reduce((sum, d) => sum + d.invited_count, 0),
  }
}
```

- [ ] **Step 4: Schrijf de guard-test voor de server action**

```typescript
// frontend/app/(dashboard)/campaigns/[id]/setup/segment-actions.guard.test.ts
import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

describe('saveSegmentDepartmentsAction — structurele garanties', () => {
  const src = readFileSync(join(__dirname, 'segment-actions.ts'), 'utf-8')

  it('gebruikt de membership-check (owner/member, geen viewer)', () => {
    expect(src).toContain('getAuthAndMembership')
  })
  it('valideert server-side via prepareSegmentDepartmentsUpdate', () => {
    expect(src).toContain('prepareSegmentDepartmentsUpdate')
  })
  it('bepaalt vergrendelde afdelingen uit de database, niet uit client-input', () => {
    expect(src).toContain("from('respondents')")
  })
  it('schrijft de som naar het delivery record (campagne-totaal = afgeleid)', () => {
    expect(src).toContain('totalInvited')
    expect(src).toContain('campaign_delivery_records')
  })
})
```

- [ ] **Step 5: Implementeer de server action**

```typescript
// frontend/app/(dashboard)/campaigns/[id]/setup/segment-actions.ts
'use server'

import { createClient } from '@/lib/supabase/server'
import {
  prepareSegmentDepartmentsUpdate,
  type SegmentDepartmentInput,
  type SegmentDepartmentStored,
} from '@/lib/self-send-comms'

export interface ActionResult {
  ok: boolean
  error?: string
}

// Zelfde patroon als launch-setup-actions.ts: owner/member of verisight-admin.
// Moet in sync blijven met is_org_manager() in schema.sql.
async function getAuthAndMembership(campaignId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { supabase, user: null, campaign: null, authorized: false }

  const { data: campaign } = await supabase
    .from('campaigns')
    .select('organization_id, segment_departments')
    .eq('id', campaignId)
    .single()

  if (!campaign) return { supabase, user, campaign: null, authorized: false }

  const [{ data: profile }, { data: membership }] = await Promise.all([
    supabase.from('profiles').select('is_verisight_admin').eq('id', user.id).maybeSingle(),
    supabase.from('org_members').select('role').eq('org_id', campaign.organization_id).eq('user_id', user.id).maybeSingle(),
  ])

  const isManager = membership?.role === 'owner' || membership?.role === 'member'
  const authorized = profile?.is_verisight_admin === true || isManager
  return { supabase, user, campaign, authorized }
}

export async function saveSegmentDepartmentsAction(
  campaignId: string,
  incoming: SegmentDepartmentInput[],
): Promise<ActionResult> {
  const { supabase, campaign, authorized } = await getAuthAndMembership(campaignId)
  if (!authorized || !campaign) return { ok: false, error: 'Niet gemachtigd.' }

  // Vergrendelde afdelingen uit de database (Fail Loud: onafhankelijk van
  // wat de client beweert). Elke respondent-rij telt — ook niet-afgeronde:
  // de link is dan al gebruikt.
  const { data: respondentDepts, error: deptError } = await supabase
    .from('respondents')
    .select('department')
    .eq('campaign_id', campaignId)
    .not('department', 'is', null)
  if (deptError) return { ok: false, error: `Controle mislukt: ${deptError.message}` }
  const lockedLabels = new Set(
    (respondentDepts ?? []).map((r) => r.department as string).filter(Boolean),
  )

  let update
  try {
    update = prepareSegmentDepartmentsUpdate(
      (campaign.segment_departments ?? []) as SegmentDepartmentStored[],
      incoming,
      lockedLabels,
    )
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'Ongeldige afdelingslijst.' }
  }

  const { error: campError } = await supabase
    .from('campaigns')
    .update({ segment_departments: update.departments })
    .eq('id', campaignId)
  if (campError) return { ok: false, error: `Opslaan mislukt: ${campError.message}` }

  // Campagne-totaal = som (spec §4) — bestaande weergaves blijven werken.
  const { error: deliveryError } = await supabase
    .from('campaign_delivery_records')
    .upsert(
      {
        campaign_id: campaignId,
        organization_id: campaign.organization_id,
        invited_count: update.totalInvited,
      },
      { onConflict: 'campaign_id' },
    )
  if (deliveryError) return { ok: false, error: `Totaal opslaan mislukt: ${deliveryError.message}` }

  return { ok: true }
}
```

- [ ] **Step 6: Run — verwacht PASS + tsc-baseline**

Run vanuit `frontend/`: `npx vitest run lib/self-send-comms.test.ts "app/(dashboard)/campaigns/[id]/setup/segment-actions.guard.test.ts" && npx tsc --noEmit 2>&1 | grep -c "error TS"`
Expected: alles groen; tsc **133**.

- [ ] **Step 7: Commit**

```bash
git add frontend/lib/self-send-comms.ts frontend/lib/self-send-comms.test.ts "frontend/app/(dashboard)/campaigns/[id]/setup/segment-actions.ts" "frontend/app/(dashboard)/campaigns/[id]/setup/segment-actions.guard.test.ts"
git commit -m "feat(afdelingen): saveSegmentDepartmentsAction - servervalidatie, vergrendelregels, som naar delivery record"
```

---

### Task 2: wizard — afdelingsblok in segment-modus

**Files:**
- Modify: `frontend/components/dashboard/setup-wizard-card.tsx`
- Modify: `frontend/app/(dashboard)/campaigns/[id]/setup/page.tsx` (props doorvoeren)
- Modify: `frontend/components/dashboard/welcome-gate.tsx` + zijn data-bron (volg hoe `publicSurveyToken` binnenkomt vanaf de dashboard-pagina en voer `segmentDepartments`/`departmentResponseCounts` op dezelfde route door)
- Test: `frontend/components/dashboard/setup-wizard-card.guard.test.ts`

- [ ] **Step 1: Schrijf de falende guard-tests**

```typescript
// frontend/components/dashboard/setup-wizard-card.guard.test.ts
import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

describe('setup-wizard afdelingsblok', () => {
  const src = readFileSync(join(__dirname, 'setup-wizard-card.tsx'), 'utf-8')

  it('toont in segment-modus een blok per afdeling met naam, aantal en kopieerlink', () => {
    expect(src).toContain('saveSegmentDepartmentsAction')
    expect(src).toContain('buildSegmentSurveyLinks')
  })
  it('vergrendelt de naam van afdelingen met responses', () => {
    expect(src).toContain('lockedDepartments')
    expect(src).toMatch(/naam vergrendeld|al responses/)
  })
  it('toont het automatisch opgetelde totaal', () => {
    expect(src).toMatch(/Totaal deelnemers|totalInvited/)
  })
  it('managet de n>=5-verwachting expliciet', () => {
    expect(src).toContain('minimaal 5')
  })
  it('vraagt het enkelvoudige aantal niet meer in segment-modus', () => {
    // het oude invitedCount-veld moet conditioneel zijn (alleen zonder segmenten)
    expect(src).toMatch(/hasSegments|segmentMode/)
  })
})
```

- [ ] **Step 2: Run — verwacht FAIL**

Run vanuit `frontend/`: `npx vitest run components/dashboard/setup-wizard-card.guard.test.ts`

- [ ] **Step 3: Implementeer het wizard-blok**

Nieuwe props op `SetupWizardCard`:

```typescript
  segmentDepartments?: Array<{ label: string; slug: string; invited_count?: number }> | null
  departmentResponseCounts?: Record<string, number>  // label -> aantal respondenten (elke rij telt)
```

Gedrag (gekozen ontwerp: alles in één stap, geen apart bevestigingsmoment):

- `const segmentMode = Boolean(segmentDepartments)` — segment-modus als de campagne (door Lars bij aanmaak) een lijst heeft, óók als die nog leeg is (lege lijst = klant moet 'm nog vullen). **Let op:** de bestaande admin-flow slaat `null` op voor niet-segment-campagnes en een gevulde lijst voor segment-campagnes; om "segment-modus aan, lijst nog leeg door klant te vullen" te ondersteunen slaat de admin-aanmaak voortaan `[]` op bij aangevinkte segmentcheckbox zonder ingevulde lijst — pas `new-campaign-form.tsx` daarop aan (de ≥2-validatie verhuist daar naar "alleen als er labels zijn ingevuld"; lege textarea + checkbox aan = `[]`).
- In segment-modus vervangt het afdelingsblok het `invitedCount`-veld in stap 1: rijen met naam-input + aantal-input + "Kopieer link"-knop (link via `buildSegmentSurveyLinks(frontendBaseUrl, publicSurveyToken, [dep])[0].url`, kopieer-interactie identiek aan de bestaande kopieerknoppen in stap 2), link-preview eronder, "+" voor een nieuwe rij, automatisch totaal onderaan.
- `const lockedDepartments = new Set(Object.keys(departmentResponseCounts ?? {}).filter((l) => (departmentResponseCounts![l] ?? 0) > 0))` — naam-input `disabled` + 🔒-regel "naam vergrendeld — er zijn al responses op deze link" voor vergrendelde rijen; verwijder-knop alleen op onvergrendelde rijen; aantal-input altijd actief.
- Eén verwachtingszin boven het blok: "Elke afdeling krijgt een eigen link. Minimaal 5 deelnemers per afdeling voor zichtbaarheid in het rapport."
- Submit stap 1 in segment-modus: eerst `saveLaunchSetupAction(campaignId, launchDate, totalInvited)`-equivalent — **niet dubbel**: roep `saveSegmentDepartmentsAction(campaignId, rows)` aan (die schrijft de som al naar het delivery record) en daarna `saveLaunchSetupAction(campaignId, launchDate, totalInvited)` voor de datum (die overschrijft invited_count met dezelfde som — idempotent). Toon action-errors in het bestaande `step1Error`-patroon.
- Buiten segment-modus: exact het bestaande gedrag, niets verandert.

Props doorvoeren op beide callsites: `setup/page.tsx` en de dashboard-pagina → `welcome-gate.tsx`. `departmentResponseCounts` komt uit een respondent-groepering per department — voeg die op aan de bestaande data-loaders van die pagina's (query: `respondents` select `department` where `campaign_id`, client-side gegroepeerd; volg hoe die pagina's nu al respondent-data laden en hergebruik dat patroon).

- [ ] **Step 4: Run — verwacht PASS + tsc-baseline + bestaande guard-tests**

Run vanuit `frontend/`: `npx vitest run components/dashboard/setup-wizard-card.guard.test.ts components/dashboard/new-campaign-form.guard.test.ts && npx tsc --noEmit 2>&1 | grep -c "error TS"`
Expected: groen; tsc **133**. NB: als de `new-campaign-form.guard.test.ts` een assert heeft die door de `[]`-wijziging raakt, werk die in lockstep bij (met motivatie in de commitbody).

- [ ] **Step 5: Commit**

```bash
git add frontend/components/dashboard/setup-wizard-card.tsx frontend/components/dashboard/setup-wizard-card.guard.test.ts frontend/components/dashboard/welcome-gate.tsx frontend/components/dashboard/new-campaign-form.tsx "frontend/app/(dashboard)/campaigns/[id]/setup/page.tsx"
git commit -m "feat(afdelingen): wizard-afdelingsblok - naam+aantal+link per rij, vergrendeling, auto-totaal"
```

(voeg de daadwerkelijk geraakte data-loader-bestanden toe aan de add — afhankelijk van waar de dashboard-pagina zijn wizard-props bouwt.)

---

### Task 3: setup-panel — responsvoortgang per afdeling

**Files:**
- Modify: `frontend/app/(dashboard)/campaigns/[id]/beheer/beheer-data.ts` (per-afdeling completed-counts)
- Modify: `frontend/app/(dashboard)/campaigns/[id]/beheer/route-beheer-phase-sections.tsx` (prop doorgeven)
- Modify: `frontend/components/dashboard/self-send-setup-panel.tsx` (weergave per linkrij)
- Test: `frontend/lib/self-send-comms.test.ts` (pure formatter) + bestaande `beheer-data.test.ts` in lockstep

- [ ] **Step 1: Schrijf de falende test (pure formatter)**

```typescript
// toevoegen aan frontend/lib/self-send-comms.test.ts
import { formatDepartmentProgress } from './self-send-comms'

describe('formatDepartmentProgress', () => {
  it('toont X van Y met percentage bij bekende noemer', () => {
    expect(formatDepartmentProgress(11, 14)).toBe('11 van 14 ingevuld (79%)')
  })
  it('degradeert eerlijk zonder noemer', () => {
    expect(formatDepartmentProgress(11, null)).toBe('11 ingevuld')
    expect(formatDepartmentProgress(11, undefined)).toBe('11 ingevuld')
  })
  it('cap op 100%', () => {
    expect(formatDepartmentProgress(16, 14)).toBe('16 van 14 ingevuld (100%)')
  })
})
```

- [ ] **Step 2: Run — verwacht FAIL, implementeer daarna**

```typescript
// toevoegen aan frontend/lib/self-send-comms.ts (onder computeResponseRatePct)
export function formatDepartmentProgress(completed: number, invited?: number | null): string {
  if (!invited || invited <= 0) return `${completed} ingevuld`
  const pct = computeResponseRatePct(completed, invited)
  return `${completed} van ${invited} ingevuld (${pct}%)`
}
```

- [ ] **Step 3: Data + weergave**

`beheer-data.ts`: voeg aan de bestaande respondent-load (of een nieuwe lichte query als er geen respondent-select is — check hoe `totalCompleted` nu tot stand komt en volg dat) een groepering toe: `departmentCompletedCounts: Record<string, number>` (alleen `completed=true`-rijen, gegroepeerd op `department`). Neem 'm op in `RouteBeheerPageData` en geef 'm door via `route-beheer-phase-sections.tsx` aan beide `<SelfSendSetupPanel>`-instanties.

`self-send-setup-panel.tsx`: in de bestaande per-afdeling linkrij (segmentmodus) naast elke rij `formatDepartmentProgress(departmentCompletedCounts[dep.label] ?? 0, dep.invited_count)` tonen (mono-stijl, zelfde toon als de bestaande "X ingevuld van Y"-regel onderin het panel).

- [ ] **Step 4: Run — verwacht PASS + tsc-baseline**

Run vanuit `frontend/`: `npx vitest run lib/self-send-comms.test.ts "app/(dashboard)/campaigns/[id]/beheer/beheer-data.test.ts" && npx tsc --noEmit 2>&1 | grep -c "error TS"`
Expected: groen (werk de beheer-data-fixture in lockstep bij als de select-string wijzigt); tsc **133**.

- [ ] **Step 5: Commit**

```bash
git add frontend/lib/self-send-comms.ts frontend/lib/self-send-comms.test.ts "frontend/app/(dashboard)/campaigns/[id]/beheer/beheer-data.ts" "frontend/app/(dashboard)/campaigns/[id]/beheer/beheer-data.test.ts" "frontend/app/(dashboard)/campaigns/[id]/beheer/route-beheer-phase-sections.tsx" frontend/components/dashboard/self-send-setup-panel.tsx
git commit -m "feat(afdelingen): responsvoortgang per afdeling in setup-panel (X van Y, eerlijke degradatie)"
```

---

### Task 4: rapport — responskolom per afdeling

**Files:**
- Modify: `backend/report_html.py` (`build_report_data` verrijkt `segment_rows` met `invited`; `_segment_block` rendert conditioneel)
- Test: `tests/test_segment_report.py`

- [ ] **Step 1: Schrijf de falende tests**

```python
# toevoegen aan tests/test_segment_report.py
from backend.report_html import _enrich_segment_rows_with_invited


def test_invited_gematcht_op_label():
    rows = [{"department": "Sales", "n": 5, "avg": 6.0, "scores": [6.0] * 5, "is_pooled": False}]
    out = _enrich_segment_rows_with_invited(rows, [
        {"label": "Sales", "slug": "sales", "invited_count": 8}])
    assert out[0]["invited"] == 8


def test_invited_ontbreekt_bij_oude_shape_of_pool():
    rows = [
        {"department": "Sales", "n": 5, "avg": 6.0, "scores": [6.0] * 5, "is_pooled": False},
        {"department": "Overige afdelingen", "n": 6, "avg": 5.0, "scores": [5.0] * 6, "is_pooled": True},
    ]
    out = _enrich_segment_rows_with_invited(rows, [
        {"label": "Sales", "slug": "sales"}])          # oude shape zonder invited_count
    assert out[0].get("invited") is None
    assert out[1].get("invited") is None               # pool krijgt geen noemer (v1)


def test_responskolom_gerenderd_bij_bekende_noemer():
    d = _min_retention_data()
    d["segment_rows"] = [
        {"department": "Operations", "n": 11, "avg": 4.1, "scores": [4.0] * 11,
         "is_pooled": False, "invited": 14},
        {"department": "Sales", "n": 5, "avg": 6.8, "scores": [6.8] * 5,
         "is_pooled": False, "invited": None},
    ]
    html = render_retention_report_html(d)
    assert "11/14" in html and "79%" in html            # bekende noemer
    # Sales zonder noemer: alleen n, geen percentage op die rij
```

(`_min_retention_data`/`render_retention_report_html` bestaan al in dit testbestand via de import uit `tests/test_report_distribution.py` — hergebruik.)

- [ ] **Step 2: Run — verwacht FAIL (`ImportError`)**

Run: `../../.venv/Scripts/python.exe -m pytest tests/test_segment_report.py -q -k "invited or responskolom"`

- [ ] **Step 3: Implementeer**

Nieuwe pure helper in `backend/report_html.py`, direct onder `_department_segment_rows`:

```python
def _enrich_segment_rows_with_invited(segment_rows: list[dict],
                                      segment_departments: list[dict] | None) -> list[dict]:
    """Voegt per rij de noemer (invited) toe via label-match op de campagnelijst
    (spec 2026-07-12 §6). Ontbrekende noemer of pooled rij -> invited=None
    (eerlijke degradatie: alleen n tonen, geen fake percentage)."""
    invited_by_label = {d.get("label"): d.get("invited_count")
                        for d in (segment_departments or [])}
    for row in segment_rows:
        row["invited"] = (None if row.get("is_pooled")
                          else invited_by_label.get(row["department"]))
    return segment_rows
```

In `build_report_data`, direct na de bestaande `segment_rows = _department_segment_rows(...)`:

```python
    segment_rows = _enrich_segment_rows_with_invited(
        segment_rows, camp.segment_departments)
```

In `_segment_block`: de `n`-cel wordt bij bekende noemer `11/14` met daaronder (of erachter, mono 8px) het percentage:

```python
        invited = row.get("invited")
        if invited:
            pct = min(100, round(n_ / invited * 100))
            n_cell = (f'{n_}/{invited}<br>'
                      f'<span style="font-family:\'JetBrains Mono\', monospace;font-size:8px;'
                      f'color:#4A6070;">{pct}%</span>')
        else:
            n_cell = str(n_)
```

en gebruik `{n_cell}` in de bestaande `<td style="width:6%;">` (verbreed die naar `width:9%;` — de naamkolom levert 3% in: `width:21%;`).

- [ ] **Step 4: Run — verwacht PASS + volledige regressie**

Run: `../../.venv/Scripts/python.exe -m pytest tests/ -q 2>&1 | tail -3`
Expected: **25 failed = baseline** (faalnamen vergelijken), rest groen.

- [ ] **Step 5: Commit**

```bash
git add backend/report_html.py tests/test_segment_report.py
git commit -m "feat(rapport): responskolom per afdeling in segmentblok (n/noemer + pct, eerlijke degradatie)"
```

---

### Task 5: samples + WeasyPrint-validatie

**Files:**
- Modify: `generate_voorbeeldrapport.py` (demo-campagne krijgt `segment_departments` met invited-counts)
- Modify: `docs/examples/*.{html,pdf}`, `frontend/public/examples/*.{html,pdf}`

- [ ] **Step 1: Seed de campagnelijst in de generator**

De generator zet `department=...` al per respondent maar de demo-campagne heeft geen `segment_departments`. Zoek waar de demo-`Campaign(...)` wordt aangemaakt en voeg toe (waarden passend bij de al-geseedde verdeling — lees eerst de daadwerkelijke per-afdeling-aantallen die de seeding oplevert en zet invited iets hoger dan completed, bijv. completed+3, zodat de percentages realistisch zijn):

```python
        segment_departments=[
            {"label": "Operations", "slug": "operations", "invited_count": 14},
            {"label": "Kantoor", "slug": "kantoor", "invited_count": 12},
            {"label": "Sales", "slug": "sales", "invited_count": 9},
            {"label": "HR", "slug": "hr", "invited_count": 4},
        ],
```

(pas labels/aantallen aan op de werkelijke DEPARTMENTS-verdeling in de generator — de test is: de responskolom toont in de sample minstens één `x/y`-noemer met percentage.)

- [ ] **Step 2: Regenereer + render (PowerShell voor Docker)**

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

Expected: 3× exit 0, **0 warnings**. Pagineringscheck via pypdf (paginatelling + eerste regel per pagina); controleer in de retention-PDF-tekst dat een `x/y`-noemer en percentage in het segmentblok staan.

- [ ] **Step 3: Kopieer, volledige suites, commit**

```bash
cp docs/examples/voorbeeldrapport_{loep,retentiescan,onboarding}.pdf frontend/public/examples/
../../.venv/Scripts/python.exe -m pytest tests/ -q 2>&1 | tail -3
```

Expected: **25 failed = baseline**.

```bash
git add generate_voorbeeldrapport.py docs/examples/ frontend/public/examples/
git commit -m "chore(samples): responspercentage per afdeling zichtbaar in voorbeeldrapporten (WeasyPrint, 0 warnings)"
```

---

## Na afronding (handmatig, buiten dit plan)

1. Push → Vercel deployt frontend + samples. **Railway-redeploy** (backend-Python gewijzigd in Task 4).
2. Geen Supabase-migratie nodig (JSONB-shape-uitbreiding).

## Zelfreview-notities (verwerkt)

- Task 2's dubbele schrijf van `invited_count` (segment-action schrijft som; `saveLaunchSetupAction` daarna nogmaals met dezelfde som) is bewust idempotent gehouden i.p.v. `saveLaunchSetupAction` te wijzigen — kleinste ingreep, bestaand contract intact. Als de implementer dit lelijk vindt: een `launchDate`-only variant mag, mits `saveLaunchSetupAction`'s bestaande gedrag ongewijzigd blijft.
- De `[]`-vs-`null`-semantiek van `segment_departments` ("segment-modus aan maar lijst leeg" vs. "geen segmenten") is een gedragswijziging in `new-campaign-form.tsx` — expliciet in Task 2 opgenomen zodat hij niet als bijvangst ongedocumenteerd landt. Backend-`has_segments([])` is False — dus een lege lijst gedraagt zich respondent-zijde identiek aan geen-segmenten (geen keuzescherm) tot de klant de lijst vult: correct, geen half-geconfigureerde keuzeschermen.
- Vergrendeling telt élke respondent-rij (ook niet-afgerond): de link is dan al gebruikt; hernoemen zou een link-in-omloop breken.
- `_enrich_segment_rows_with_invited` muteert de rijen in place en geeft ze terug — zelfde stijl als bestaande helpers in dit bestand; pool krijgt in v1 nooit een noemer (spec §6, bewuste versimpeling: som alleen bij complete data is uitgesteld).

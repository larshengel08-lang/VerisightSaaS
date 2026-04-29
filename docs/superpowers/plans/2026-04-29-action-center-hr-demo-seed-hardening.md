# Action Center HR Demo / Seed Hardening Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build one stable HR demo campaign and one stable active Action Center route that make the current route semantics convincingly visible across overview, reports, campaign detail, and Action Center detail.

**Architecture:** Keep the existing route contract and Action Center core semantics as the canonical truth path, but extend them in one narrow way: allow an active route to render a historical closeout signal from checkpoint-backed truth. Add one server-only demo artifact loader plus one shared surfacing helper so overview and reports can deterministically surface the seeded campaign without inventing local heuristics, then harden the seed script and e2e contract around that path.

**Tech Stack:** Next.js App Router, React 19, TypeScript, server-only filesystem helpers, existing Supabase-backed seed scripts, Vitest unit and route-shell tests, Playwright e2e browser QA.

---

## File Structure

### New files
- `frontend/lib/dashboard/hr-demo-pilot-artifact.ts`
  - Server-only loader and validator for `tests/e2e/.action-center-pilot.json`.
  - Defines one canonical artifact shape for campaign ID, route context, and QA URLs.
- `frontend/lib/dashboard/hr-demo-pilot-artifact.test.ts`
  - Unit tests for artifact parsing, invalid JSON handling, and deterministic campaign prioritization.
- `frontend/tests/e2e/action-center-hr-happy-path.spec.ts`
  - One canonical HR happy-path browser test that consumes the seeded pilot artifact and checks overview, reports, campaign detail, and Action Center detail.

### Existing files to modify
- `frontend/lib/action-center-core-semantics.ts`
  - Add a historical closeout signal field so the route can stay active while still rendering "how something closes" from checkpoint-backed truth.
- `frontend/lib/action-center-core-semantics.test.ts`
  - Add source-order and historical-closeout tests.
- `frontend/components/dashboard/action-center-preview.tsx`
  - Render a closeout panel when the active route carries a historical closeout signal.
- `frontend/scripts/seed-action-center-manager-pilot.mjs`
  - Enrich the pilot org's canonical campaign with real delivery truth, dossier truth, checkpoint truth, and explicit QA URLs in the artifact JSON.
- `frontend/tests/e2e/.action-center-pilot.json`
  - Regenerated artifact committed only if the repo already tracks it; otherwise leave generated locally and document the command in the PR notes.
- `frontend/lib/dashboard/report-library.ts`
  - Deterministically prioritize the seeded demo campaign in featured report selection.
- `frontend/app/(dashboard)/dashboard/page.tsx`
  - Deterministically prioritize the seeded demo campaign in the overview focus route without changing bridge semantics.
- `frontend/app/(dashboard)/dashboard/page.test.ts`
  - Guardrail for overview surfacing.
- `frontend/lib/dashboard/report-library.test.ts`
  - Guardrail for reports surfacing.
- `frontend/app/(dashboard)/action-center/page.route-shell.test.ts`
  - Guardrail that Action Center detail shows historical closeout for the active seeded route.

### Existing files to check, but not modify unless verification forces it
- `frontend/app/(dashboard)/reports/page.route-shell.test.ts`
- `frontend/app/(dashboard)/campaigns/[id]/page.test.ts`
- `frontend/lib/action-center-live.ts`
- `frontend/lib/action-center-route-contract.ts`

---

### Task 1: Extend core semantics with historical closeout truth for an active route

**Files:**
- Modify: `frontend/lib/action-center-core-semantics.ts`
- Modify: `frontend/lib/action-center-core-semantics.test.ts`
- Modify: `frontend/components/dashboard/action-center-preview.tsx`
- Test: `frontend/lib/action-center-core-semantics.test.ts`
- Test: `frontend/app/(dashboard)/action-center/page.route-shell.test.ts`

- [ ] **Step 1: Add the failing semantics tests for historical closeout on an active route**

Append to `frontend/lib/action-center-core-semantics.test.ts`:

```ts
it('keeps the route active while projecting a historical closeout summary from follow-up checkpoint truth', () => {
  const base = buildProjectionInput()

  const semantics = projectActionCenterCoreSemantics({
    ...base,
    route: {
      ...base.route,
      routeStatus: 'in-uitvoering',
      reviewOutcome: 'bijstellen',
    },
    learningCheckpoints: [
      ...base.learningCheckpoints,
      {
        id: 'cp-follow-up-review',
        dossier_id: 'dos-1',
        checkpoint_key: 'follow_up_review',
        owner_label: 'HR',
        status: 'bevestigd',
        objective_signal_notes: 'Drie werkafspraken zijn opnieuw bevestigd.',
        qualitative_notes: 'De eerdere cyclus kon worden afgerond; deze route bewaakt alleen de borging.',
        interpreted_observation: 'De eerste interventie heeft rust gebracht in het teamoverleg.',
        confirmed_lesson: 'De vorige stap is afgerond; borg nu of de afspraken in de komende twee weken standhouden.',
        lesson_strength: 'terugkerend_patroon',
        destination_areas: ['report'],
        created_at: '2026-04-20T09:00:00.000Z',
        updated_at: '2026-04-20T09:00:00.000Z',
      },
    ],
  })

  expect(semantics.closingSemantics.status).toBe('lopend')
  expect(semantics.closingSemantics.historicalSummary).toContain('vorige stap is afgerond')
})
```

- [ ] **Step 2: Add the failing route-shell test for the new closeout panel copy**

Append to `frontend/app/(dashboard)/action-center/page.route-shell.test.ts`:

```ts
it('renders historical closeout meaning on route detail without forcing the route into a closed status', () => {
  const source = readFileSync(
    new URL('../../../components/dashboard/action-center-preview.tsx', import.meta.url),
    'utf8',
  )

  expect(source).toContain('Eerder afgerond in deze route')
  expect(source).toContain('historicalSummary')
})
```

- [ ] **Step 3: Run the targeted tests and verify both fail**

Run:

```powershell
npm test -- "lib/action-center-core-semantics.test.ts" "app/(dashboard)/action-center/page.route-shell.test.ts"
```

Expected:

```text
FAIL  lib/action-center-core-semantics.test.ts
FAIL  app/(dashboard)/action-center/page.route-shell.test.ts
```

- [ ] **Step 4: Add one narrow historical-closeout field to the semantics projector**

Update `frontend/lib/action-center-core-semantics.ts`:

```ts
export interface ActionCenterCoreSemantics {
  route: ActionCenterRouteContract
  reviewSemantics: {
    reviewReason: string
    reviewQuestion: string
    reviewOutcomeRaw: ActionCenterReviewOutcome
    reviewOutcomeVisible: ActionCenterVisibleReviewOutcome
  }
  actionFrame: {
    whyNow: string
    firstStep: string
    owner: string
    expectedEffect: string
  }
  resultLoop: {
    whatWasTried: string | null
    whatWeObserved: string | null
    whatWasDecided: string | null
  }
  closingSemantics: {
    status: ActionCenterClosingStatus
    summary: string | null
    historicalSummary: string | null
  }
}

function getHistoricalCloseoutSummary(context: ActionCenterCoreSemanticsProjectionInput) {
  const followUpReview = getCheckpoint(context, 'follow_up_review')

  return pickFirst([
    followUpReview?.confirmed_lesson,
    followUpReview?.qualitative_notes,
    followUpReview?.interpreted_observation,
    context.learningDossier?.next_route,
    context.learningDossier?.stop_reason,
  ])
}
```

Then update the return shape:

```ts
    closingSemantics: {
      status: getClosingStatus(context, route),
      summary: getRouteSummary(route, context),
      historicalSummary:
        getClosingStatus(context, route) === 'lopend' ? getHistoricalCloseoutSummary(context) : null,
    },
```

- [ ] **Step 5: Render the historical closeout block in route detail**

Update `frontend/components/dashboard/action-center-preview.tsx` in the detail panel:

```tsx
const closing = selectedItem.coreSemantics.closingSemantics
const hasClosingPanel =
  closing.status !== 'lopend' || Boolean(closing.historicalSummary ?? closing.summary)
```

Render:

```tsx
{hasClosingPanel ? (
  <div className="rounded-[22px] border border-slate-200 bg-slate-50 px-4 py-4">
    <p className="text-sm font-semibold text-slate-950">
      {closing.status === 'lopend'
        ? 'Eerder afgerond in deze route'
        : closing.status === 'afgerond'
          ? 'Afgerond voor nu'
          : 'Bewust gestopt'}
    </p>
    <p className="mt-1 text-sm leading-6 text-slate-700">
      {closing.historicalSummary ?? closing.summary ?? 'Deze route draagt een expliciet afsluitsignaal.'}
    </p>
  </div>
) : null}
```

- [ ] **Step 6: Run the targeted tests and verify they pass**

Run:

```powershell
npm test -- "lib/action-center-core-semantics.test.ts" "app/(dashboard)/action-center/page.route-shell.test.ts"
```

Expected:

```text
PASS  lib/action-center-core-semantics.test.ts
PASS  app/(dashboard)/action-center/page.route-shell.test.ts
```

- [ ] **Step 7: Commit the historical closeout semantics slice**

```bash
git add frontend/lib/action-center-core-semantics.ts frontend/lib/action-center-core-semantics.test.ts frontend/components/dashboard/action-center-preview.tsx frontend/app/(dashboard)/action-center/page.route-shell.test.ts
git commit -m "feat: expose historical closeout on active action center routes"
```

---

### Task 2: Add one canonical HR demo artifact loader and prioritization helper

**Files:**
- Create: `frontend/lib/dashboard/hr-demo-pilot-artifact.ts`
- Create: `frontend/lib/dashboard/hr-demo-pilot-artifact.test.ts`
- Test: `frontend/lib/dashboard/hr-demo-pilot-artifact.test.ts`

- [ ] **Step 1: Write the failing unit tests for artifact parsing and deterministic prioritization**

Create `frontend/lib/dashboard/hr-demo-pilot-artifact.test.ts`:

```ts
import { describe, expect, it } from 'vitest'
import {
  loadHrDemoPilotArtifactFromSource,
  prioritizeHrDemoCampaigns,
} from '@/lib/dashboard/hr-demo-pilot-artifact'

describe('hr demo pilot artifact', () => {
  it('parses the canonical pilot artifact shape', () => {
    const artifact = loadHrDemoPilotArtifactFromSource(
      JSON.stringify({
        campaignId: 'cmp-demo',
        routeContext: {
          focusItemId: 'cmp-demo',
          overviewUrl: '/dashboard',
          reportsUrl: '/reports',
          campaignDetailUrl: '/campaigns/cmp-demo',
          actionCenterUrl: '/action-center',
          actionCenterFocusUrl: '/action-center?focus=cmp-demo',
        },
      }),
    )

    expect(artifact?.campaignId).toBe('cmp-demo')
    expect(artifact?.routeContext.actionCenterFocusUrl).toContain('focus=cmp-demo')
  })

  it('returns null for malformed artifact payloads', () => {
    expect(loadHrDemoPilotArtifactFromSource('{}')).toBeNull()
  })

  it('moves the demo campaign to the front without changing the order of the rest', () => {
    const ordered = prioritizeHrDemoCampaigns(
      [
        { campaignId: 'cmp-a', label: 'A' },
        { campaignId: 'cmp-demo', label: 'Demo' },
        { campaignId: 'cmp-b', label: 'B' },
      ],
      { campaignId: 'cmp-demo' } as never,
    )

    expect(ordered.map((entry) => entry.campaignId)).toEqual(['cmp-demo', 'cmp-a', 'cmp-b'])
  })
})
```

- [ ] **Step 2: Run the test file and verify it fails**

Run:

```powershell
npm test -- "lib/dashboard/hr-demo-pilot-artifact.test.ts"
```

Expected:

```text
FAIL  lib/dashboard/hr-demo-pilot-artifact.test.ts
Error: Cannot find module '@/lib/dashboard/hr-demo-pilot-artifact'
```

- [ ] **Step 3: Implement the artifact loader and prioritization helper**

Create `frontend/lib/dashboard/hr-demo-pilot-artifact.ts`:

```ts
import { existsSync, readFileSync } from 'node:fs'
import path from 'node:path'

export interface HrDemoPilotArtifact {
  campaignId: string
  routeContext: {
    focusItemId: string
    overviewUrl: string
    reportsUrl: string
    campaignDetailUrl: string
    actionCenterUrl: string
    actionCenterFocusUrl: string
  }
}

export function loadHrDemoPilotArtifactFromSource(source: string): HrDemoPilotArtifact | null {
  try {
    const parsed = JSON.parse(source) as Partial<HrDemoPilotArtifact>
    if (
      typeof parsed.campaignId !== 'string' ||
      typeof parsed.routeContext?.focusItemId !== 'string' ||
      typeof parsed.routeContext?.campaignDetailUrl !== 'string' ||
      typeof parsed.routeContext?.actionCenterFocusUrl !== 'string'
    ) {
      return null
    }

    return parsed as HrDemoPilotArtifact
  } catch {
    return null
  }
}

export function loadHrDemoPilotArtifact(rootDir = process.cwd()): HrDemoPilotArtifact | null {
  const artifactPath = path.join(rootDir, 'tests', 'e2e', '.action-center-pilot.json')
  if (!existsSync(artifactPath)) return null

  return loadHrDemoPilotArtifactFromSource(readFileSync(artifactPath, 'utf8'))
}

export function prioritizeHrDemoCampaigns<T extends { campaignId: string }>(
  entries: T[],
  artifact: Pick<HrDemoPilotArtifact, 'campaignId'> | null,
) {
  if (!artifact) return entries

  const demo = entries.find((entry) => entry.campaignId === artifact.campaignId)
  if (!demo) return entries

  return [demo, ...entries.filter((entry) => entry.campaignId !== artifact.campaignId)]
}
```

- [ ] **Step 4: Run the new tests and verify they pass**

Run:

```powershell
npm test -- "lib/dashboard/hr-demo-pilot-artifact.test.ts"
```

Expected:

```text
PASS  lib/dashboard/hr-demo-pilot-artifact.test.ts
3 passed
```

- [ ] **Step 5: Commit the artifact helper**

```bash
git add frontend/lib/dashboard/hr-demo-pilot-artifact.ts frontend/lib/dashboard/hr-demo-pilot-artifact.test.ts
git commit -m "feat: add hr demo pilot artifact helper"
```

---

### Task 3: Harden the pilot seed and make overview and reports deterministically surface the demo campaign

**Files:**
- Modify: `frontend/scripts/seed-action-center-manager-pilot.mjs`
- Modify: `frontend/tests/e2e/.action-center-pilot.json`
- Modify: `frontend/lib/dashboard/report-library.ts`
- Modify: `frontend/lib/dashboard/report-library.test.ts`
- Modify: `frontend/app/(dashboard)/dashboard/page.tsx`
- Modify: `frontend/app/(dashboard)/dashboard/page.test.ts`
- Test: `frontend/lib/dashboard/report-library.test.ts`
- Test: `frontend/app/(dashboard)/dashboard/page.test.ts`

- [ ] **Step 1: Add failing tests for demo-campaign prioritization in reports and overview**

Append to `frontend/lib/dashboard/report-library.test.ts`:

```ts
it('prioritizes the seeded HR demo campaign in featured report selection when an artifact is present', () => {
  const source = readFileSync(new URL('./report-library.ts', import.meta.url), 'utf8')

  expect(source).toContain('loadHrDemoPilotArtifact')
  expect(source).toContain('prioritizeHrDemoCampaigns')
})
```

Append to `frontend/app/(dashboard)/dashboard/page.test.ts`:

```ts
it('allows the seeded HR demo campaign to override the default overview focus route', () => {
  const source = readFileSync(new URL('./page.tsx', import.meta.url), 'utf8')

  expect(source).toContain('loadHrDemoPilotArtifact')
  expect(source).toContain('demoCampaign ??')
})
```

- [ ] **Step 2: Run the surfacing tests and verify they fail**

Run:

```powershell
npm test -- "lib/dashboard/report-library.test.ts" "app/(dashboard)/dashboard/page.test.ts"
```

Expected:

```text
FAIL  lib/dashboard/report-library.test.ts
FAIL  app/(dashboard)/dashboard/page.test.ts
```

- [ ] **Step 3: Enrich the pilot seed script with real active-route, review, result, and closeout truth**

Update `frontend/scripts/seed-action-center-manager-pilot.mjs` by adding these writes after `fallbackCampaign` is chosen:

```js
const firstManagementUseAt = new Date(Date.now() - 21 * 24 * 60 * 60 * 1000).toISOString()
const reviewMoment = new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString()

const { data: deliveryRecord, error: deliveryRecordError } = await admin
  .from('campaign_delivery_records')
  .upsert(
    {
      organization_id: pilotOrg.orgId,
      campaign_id: fallbackCampaign.id,
      lifecycle_stage: 'first_management_use',
      exception_status: 'none',
      operator_owner: 'Verisight',
      next_step: 'Volg de werkafspraken en toets ze opnieuw in de eerstvolgende review.',
      operator_notes: 'HR demo route voor Action Center.',
      customer_handoff_note: 'HR gebruikt deze campagne als vaste demo-route voor opvolging en review.',
      first_management_use_confirmed_at: firstManagementUseAt,
    },
    { onConflict: 'campaign_id' },
  )
  .select('id')
  .single()

if (deliveryRecordError || !deliveryRecord) throw deliveryRecordError ?? new Error('Kon delivery record niet opslaan.')

const { data: dossier, error: dossierError } = await admin
  .from('pilot_learning_dossiers')
  .upsert(
    {
      organization_id: pilotOrg.orgId,
      campaign_id: fallbackCampaign.id,
      title: `HR demo route - ${fallbackCampaign.name}`,
      route_interest: fallbackCampaign.scan_type === 'exit' ? 'exitscan' : fallbackCampaign.scan_type === 'retention' ? 'retentiescan' : 'nog-onzeker',
      scan_type: fallbackCampaign.scan_type,
      triage_status: 'bevestigd',
      expected_first_value: 'Binnen twee weken moet de rolduidelijkheid merkbaar toenemen in het teamoverleg.',
      first_management_value: 'We reviewen omdat HR wil toetsen of het eerste teamgesprek echt tot heldere werkafspraken leidde.',
      first_action_taken: 'Plan een teamsessie van 30 minuten en leg drie concrete werkafspraken vast.',
      review_moment: reviewMoment,
      adoption_outcome: 'De eerste reactie is positiever, maar borging in het teamritme is nog nodig.',
      management_action_outcome: 'bijstellen',
      next_route: 'Borg de afspraken in het volgende teamoverleg en bevestig opnieuw wie eigenaar blijft.',
      case_public_summary: 'De vorige stap is afgerond; deze actieve route bewaakt nu alleen de borging en bijsturing.',
    },
    { onConflict: 'campaign_id' },
  )
  .select('id')
  .single()

if (dossierError || !dossier) throw dossierError ?? new Error('Kon learning dossier niet opslaan.')

const checkpointRows = [
  {
    dossier_id: dossier.id,
    checkpoint_key: 'first_management_use',
    owner_label: 'HR',
    status: 'bevestigd',
    objective_signal_notes: 'Drie werkafspraken zijn expliciet gemaakt.',
    qualitative_notes: 'Het eerste gesprek gaf rust, maar opvolging moet nog worden geborgd.',
    interpreted_observation: 'Het teamoverleg werd concreter en minder diffuus.',
    confirmed_lesson: 'De eerste cyclus kon worden afgerond; de huidige route bewaakt of de afspraken blijven staan.',
    lesson_strength: 'direct_uitvoerbare_verbetering',
    destination_areas: ['report', 'operations'],
  },
  {
    dossier_id: dossier.id,
    checkpoint_key: 'follow_up_review',
    owner_label: 'HR',
    status: 'bevestigd',
    objective_signal_notes: 'Managers melden rustiger weekstarts en minder rolverwarring.',
    qualitative_notes: 'De eerste interventie lijkt te werken, maar borging in het vaste ritme is nodig.',
    interpreted_observation: 'De vorige stap is afgerond; nu toetsen we vooral of het effect standhoudt.',
    confirmed_lesson: 'De vorige stap is afgerond; deze actieve route kijkt nu alleen nog naar borging en eventuele bijsturing.',
    lesson_strength: 'terugkerend_patroon',
    destination_areas: ['report', 'product'],
  },
]

const { error: checkpointError } = await admin
  .from('pilot_learning_checkpoints')
  .upsert(checkpointRows, { onConflict: 'dossier_id,checkpoint_key' })

if (checkpointError) throw checkpointError
```

- [ ] **Step 4: Write the richer artifact contract with fixed URLs**

Replace the artifact object in `frontend/scripts/seed-action-center-manager-pilot.mjs` with:

```js
const artifact = {
  seededAt: new Date().toISOString(),
  orgId: pilotOrg.orgId,
  campaignId: fallbackCampaign.id,
  hrOwner: {
    email: HR_EMAIL,
    password: PILOT_PASSWORD,
  },
  routeContext: {
    focusItemId: fallbackCampaign.id,
    overviewUrl: '/dashboard',
    reportsUrl: '/reports',
    campaignDetailUrl: `/campaigns/${fallbackCampaign.id}`,
    actionCenterUrl: '/action-center',
    actionCenterFocusUrl: `/action-center?focus=${fallbackCampaign.id}`,
  },
  managers: managers.map((manager, index) => ({
    email: manager.email,
    password: PILOT_PASSWORD,
    scopeType: chosenDepartments[index] ? 'department' : 'item',
    scopeLabel: chosenDepartments[index] ?? fallbackCampaign.name,
    scopeValue: chosenDepartments[index]
      ? buildDepartmentScopeValue(pilotOrg.orgId, chosenDepartments[index])
      : `${pilotOrg.orgId}::campaign::${fallbackCampaign.id}`,
  })),
  departmentLabels: chosenDepartments,
}
```

- [ ] **Step 5: Use the shared artifact helper to prioritize reports and overview**

Update `frontend/lib/dashboard/report-library.ts`:

```ts
import {
  loadHrDemoPilotArtifact,
  prioritizeHrDemoCampaigns,
} from '@/lib/dashboard/hr-demo-pilot-artifact'

const demoArtifact = loadHrDemoPilotArtifact()
const prioritizedReadyCampaigns = prioritizeHrDemoCampaigns(
  [...readyCampaigns].filter((campaign) => campaign.total_completed >= 10).sort((left, right) => getPriority(right) - getPriority(left)),
  demoArtifact ? { campaignId: demoArtifact.campaignId } : null,
)

const featuredCandidate = prioritizedReadyCampaigns[0] ?? null
```

Update `frontend/app/(dashboard)/dashboard/page.tsx` near the overview-focus selection:

```ts
import { loadHrDemoPilotArtifact } from '@/lib/dashboard/hr-demo-pilot-artifact'

const hrDemoArtifact = loadHrDemoPilotArtifact()
const demoCampaign =
  hrDemoArtifact ? campaigns.find((campaign) => campaign.campaign_id === hrDemoArtifact.campaignId) ?? null : null

const primaryOverviewCampaign = demoCampaign ?? primaryFirstNextStepCampaign ?? primaryGuideCampaign
```

- [ ] **Step 6: Run the seed script locally, then rerun the surfacing tests**

Run:

```powershell
node .\scripts\seed-action-center-manager-pilot.mjs
npm test -- "lib/dashboard/report-library.test.ts" "app/(dashboard)/dashboard/page.test.ts"
```

Expected:

```text
PASS  lib/dashboard/report-library.test.ts
PASS  app/(dashboard)/dashboard/page.test.ts
```

- [ ] **Step 7: Commit the demo seed and surfacing slice**

```bash
git add frontend/scripts/seed-action-center-manager-pilot.mjs frontend/tests/e2e/.action-center-pilot.json frontend/lib/dashboard/report-library.ts frontend/lib/dashboard/report-library.test.ts frontend/app/(dashboard)/dashboard/page.tsx frontend/app/(dashboard)/dashboard/page.test.ts
git commit -m "feat: seed and surface canonical hr demo route"
```

---

### Task 4: Add one canonical HR happy-path browser test and finalize verification

**Files:**
- Create: `frontend/tests/e2e/action-center-hr-happy-path.spec.ts`
- Test: `frontend/tests/e2e/action-center-hr-happy-path.spec.ts`
- Test: `frontend/lib/action-center-core-semantics.test.ts`
- Test: `frontend/lib/dashboard/hr-demo-pilot-artifact.test.ts`
- Test: `frontend/lib/dashboard/report-library.test.ts`
- Test: `frontend/app/(dashboard)/dashboard/page.test.ts`
- Test: `frontend/app/(dashboard)/action-center/page.route-shell.test.ts`

- [ ] **Step 1: Write the failing HR happy-path e2e spec**

Create `frontend/tests/e2e/action-center-hr-happy-path.spec.ts`:

```ts
import { readFileSync } from 'node:fs'
import path from 'node:path'
import { expect, test } from '@playwright/test'

const artifact = JSON.parse(
  readFileSync(path.join(process.cwd(), 'tests', 'e2e', '.action-center-pilot.json'), 'utf8'),
)

test('HR happy path shows one rich demo route across the suite', async ({ page }) => {
  await page.goto('/login')
  await page.getByLabel('Werk e-mail').fill(artifact.hrOwner.email)
  await page.getByLabel('Wachtwoord').fill(artifact.hrOwner.password)
  await page.getByRole('button', { name: /inloggen/i }).click()

  await page.goto(artifact.routeContext.overviewUrl)
  await expect(page.getByText(/actieve opvolging/i)).toBeVisible()

  await page.goto(artifact.routeContext.reportsUrl)
  await expect(page.getByRole('link', { name: /open in action center/i })).toBeVisible()

  await page.goto(artifact.routeContext.campaignDetailUrl)
  await expect(page.getByRole('link', { name: /open in action center/i })).toBeVisible()

  await page.goto(artifact.routeContext.actionCenterFocusUrl)
  await expect(page.getByText(/waarom we opnieuw kijken/i)).toBeVisible()
  await expect(page.getByText(/wat we dan toetsen/i)).toBeVisible()
  await expect(page.getByText(/eerste stap/i)).toBeVisible()
  await expect(page.getByText(/wat is geprobeerd/i)).toBeVisible()
  await expect(page.getByText(/wat is besloten/i)).toBeVisible()
  await expect(page.getByText(/eerder afgerond in deze route|afgerond voor nu|bewust gestopt/i)).toBeVisible()
})
```

- [ ] **Step 2: Run the new e2e spec and verify it fails before the server-side pieces are in place**

Run:

```powershell
npx playwright test tests/e2e/action-center-hr-happy-path.spec.ts --project=chromium
```

Expected:

```text
FAIL  tests/e2e/action-center-hr-happy-path.spec.ts
```

- [ ] **Step 3: Re-run the seed script and targeted automated suite**

Run:

```powershell
node .\scripts\seed-action-center-manager-pilot.mjs
npm test -- "lib/action-center-core-semantics.test.ts" "lib/dashboard/hr-demo-pilot-artifact.test.ts" "lib/dashboard/report-library.test.ts" "app/(dashboard)/dashboard/page.test.ts" "app/(dashboard)/action-center/page.route-shell.test.ts"
```

Expected:

```text
PASS  lib/action-center-core-semantics.test.ts
PASS  lib/dashboard/hr-demo-pilot-artifact.test.ts
PASS  lib/dashboard/report-library.test.ts
PASS  app/(dashboard)/dashboard/page.test.ts
PASS  app/(dashboard)/action-center/page.route-shell.test.ts
```

- [ ] **Step 4: Run the e2e spec again and save a short QA summary**

Run:

```powershell
npx playwright test tests/e2e/action-center-hr-happy-path.spec.ts --project=chromium
```

Expected:

```text
PASS  tests/e2e/action-center-hr-happy-path.spec.ts
```

Then save:

```json
{
  "baseURL": "http://127.0.0.1:3008",
  "campaignId": "<artifact.campaignId>",
  "overviewVisible": true,
  "reportsVisible": true,
  "campaignDetailVisible": true,
  "actionCenterDetailVisible": true,
  "reviewMeaningVisible": true,
  "actionFrameVisible": true,
  "resultLoopVisible": true,
  "historicalCloseoutVisible": true
}
```

to:

```text
frontend/.tmp-visual-qa/2026-04-29-action-center-hr-demo-seed-hardening/summary.json
```

- [ ] **Step 5: Commit the QA contract work**

```bash
git add frontend/tests/e2e/action-center-hr-happy-path.spec.ts
git commit -m "test: add hr demo route happy path coverage"
```

---

## Self-Review

### Spec coverage
- One canonical active route plus historical closeout signal: covered by Task 1 projector and preview work.
- Fixed source order for review/action/result semantics: preserved by Task 1 because it extends the existing canonical projector instead of adding local UI copy.
- Deterministic surfacing in overview and reports: covered by Task 2 artifact helper and Task 3 wiring.
- Fixed HR login, fixed campaign ID, fixed route context, fixed URLs: covered by Task 3 artifact generation.
- Repeatable browser-QA path across overview, reports, campaign detail, and Action Center detail: covered by Task 4.

### Placeholder scan
- No `TODO`, `TBD`, or "similar to Task N" placeholders remain.
- All new code steps include concrete snippets.
- All verification steps include explicit commands and expected outcomes.

### Type consistency
- `HrDemoPilotArtifact` is defined once and reused consistently.
- The surfacing helpers only consume `campaignId`, so they stay decoupled from page-specific shapes.
- The new closeout field is consistently named `historicalSummary`.



# Admin `/beheer` Setup Hub Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn admin `/beheer` into a setup-first hub for new customer and campaign creation without removing existing admin setup capabilities.

**Architecture:** Keep the current server-page/data-loading model, but extract one explicit setup context (`selected organization` + `selected campaign`) and rebuild the page around a compact header, a four-step setup flow, a small workbench row, and a collapsed campaign overview. Remove the current cadence/delivery wall from the primary page and demote operational scanning to the collapsed control layer.

**Tech Stack:** Next.js App Router, React server components, Supabase server client, Vitest, ESLint

---

## File Map

- Modify: `C:/Users/larsh/Desktop/Business/Verisight/frontend/app/(dashboard)/beheer/page.tsx`
  - Rebuild the page layout around setup-first sections and explicit setup context.
- Modify: `C:/Users/larsh/Desktop/Business/Verisight/frontend/app/(dashboard)/beheer/get-beheer-page-data.ts`
  - Add selected organization/campaign derivation plus compact summary values needed by the new page.
- Create: `C:/Users/larsh/Desktop/Business/Verisight/frontend/app/(dashboard)/beheer/setup-context.ts`
  - Small helper for canonical setup target selection and locked-step state.
- Create: `C:/Users/larsh/Desktop/Business/Verisight/frontend/app/(dashboard)/beheer/setup-context.test.ts`
  - Unit tests for chosen organization/campaign rules.
- Modify: `C:/Users/larsh/Desktop/Business/Verisight/frontend/app/(dashboard)/beheer/page.test.ts`
  - Update file-level expectations to the new setup-hub copy and layout.
- Modify: `C:/Users/larsh/Desktop/Business/Verisight/frontend/app/(dashboard)/beheer/color-semantics.test.ts`
  - Keep color assertions aligned with the smaller setup-first page.

### Task 1: Add canonical setup context

**Files:**
- Create: `C:/Users/larsh/Desktop/Business/Verisight/frontend/app/(dashboard)/beheer/setup-context.ts`
- Create: `C:/Users/larsh/Desktop/Business/Verisight/frontend/app/(dashboard)/beheer/setup-context.test.ts`
- Modify: `C:/Users/larsh/Desktop/Business/Verisight/frontend/app/(dashboard)/beheer/get-beheer-page-data.ts`

- [ ] **Step 1: Write the failing setup-context tests**

```ts
import { describe, expect, it } from 'vitest'
import { resolveSetupContext } from './setup-context'

describe('resolveSetupContext', () => {
  it('keeps steps 3 and 4 locked when no active organization exists', () => {
    const context = resolveSetupContext({
      organizations: [],
      campaigns: [],
      selectedOrganizationId: null,
      selectedCampaignId: null,
    })

    expect(context.selectedOrganizationId).toBeNull()
    expect(context.selectedCampaignId).toBeNull()
    expect(context.respondentsLocked).toBe(true)
    expect(context.clientAccessLocked).toBe(true)
  })

  it('defaults to the newest active campaign inside the selected organization', () => {
    const context = resolveSetupContext({
      organizations: [
        { id: 'org-a', is_active: true, name: 'Alpha', slug: 'alpha' },
      ],
      campaigns: [
        { id: 'camp-old', organization_id: 'org-a', is_active: true, created_at: '2026-05-01T10:00:00.000Z', name: 'Old' },
        { id: 'camp-new', organization_id: 'org-a', is_active: true, created_at: '2026-05-10T10:00:00.000Z', name: 'New' },
      ],
      selectedOrganizationId: 'org-a',
      selectedCampaignId: null,
    })

    expect(context.selectedOrganizationId).toBe('org-a')
    expect(context.selectedCampaignId).toBe('camp-new')
    expect(context.respondentsLocked).toBe(false)
    expect(context.clientAccessLocked).toBe(false)
  })

  it('preserves an explicit campaign selection when it belongs to the selected organization', () => {
    const context = resolveSetupContext({
      organizations: [
        { id: 'org-a', is_active: true, name: 'Alpha', slug: 'alpha' },
      ],
      campaigns: [
        { id: 'camp-a', organization_id: 'org-a', is_active: true, created_at: '2026-05-01T10:00:00.000Z', name: 'A' },
        { id: 'camp-b', organization_id: 'org-a', is_active: true, created_at: '2026-05-10T10:00:00.000Z', name: 'B' },
      ],
      selectedOrganizationId: 'org-a',
      selectedCampaignId: 'camp-a',
    })

    expect(context.selectedCampaignId).toBe('camp-a')
  })
})
```

- [ ] **Step 2: Run the setup-context test to verify it fails**

Run:

```powershell
npm test -- "app/(dashboard)/beheer/setup-context.test.ts"
```

Expected: FAIL because `setup-context.ts` does not exist yet.

- [ ] **Step 3: Implement the setup-context helper**

```ts
import type { Campaign, Organization } from '@/lib/types'

type SetupContextInput = {
  organizations: Pick<Organization, 'id' | 'is_active' | 'name' | 'slug'>[]
  campaigns: Pick<Campaign, 'id' | 'organization_id' | 'is_active' | 'created_at' | 'name'>[]
  selectedOrganizationId: string | null
  selectedCampaignId: string | null
}

export function resolveSetupContext(input: SetupContextInput) {
  const activeOrganizations = input.organizations.filter((org) => org.is_active)
  const selectedOrganization =
    activeOrganizations.find((org) => org.id === input.selectedOrganizationId) ?? activeOrganizations[0] ?? null

  const campaignsForOrganization = selectedOrganization
    ? input.campaigns
        .filter((campaign) => campaign.organization_id === selectedOrganization.id)
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    : []

  const selectedCampaign =
    campaignsForOrganization.find((campaign) => campaign.id === input.selectedCampaignId) ??
    campaignsForOrganization.find((campaign) => campaign.is_active) ??
    campaignsForOrganization[0] ??
    null

  return {
    selectedOrganizationId: selectedOrganization?.id ?? null,
    selectedCampaignId: selectedCampaign?.id ?? null,
    selectedOrganization,
    selectedCampaign,
    respondentsLocked: !selectedCampaign,
    clientAccessLocked: !selectedCampaign,
  }
}
```

- [ ] **Step 4: Thread setup context into the data loader**

Add imports plus returned fields in `get-beheer-page-data.ts`:

```ts
import { resolveSetupContext } from './setup-context'
```

Return shape should include:

```ts
selectedOrganizationId: string | null
selectedCampaignId: string | null
selectedOrganization: Organization | null
selectedCampaign: Campaign | null
respondentsLocked: boolean
clientAccessLocked: boolean
activeCampaignCount: number
```

Use:

```ts
const setupContext = resolveSetupContext({
  organizations: activeOrgs,
  campaigns,
  selectedOrganizationId: null,
  selectedCampaignId: null,
})
```

and spread the relevant values into the return object.

- [ ] **Step 5: Run the tests to verify they pass**

Run:

```powershell
npm test -- "app/(dashboard)/beheer/setup-context.test.ts"
```

Expected: PASS.

- [ ] **Step 6: Commit the setup-context foundation**

```powershell
git add "frontend/app/(dashboard)/beheer/setup-context.ts" "frontend/app/(dashboard)/beheer/setup-context.test.ts" "frontend/app/(dashboard)/beheer/get-beheer-page-data.ts"
git commit -m "feat: add admin beheer setup context"
```

### Task 2: Rebuild `/beheer` as a setup-first page

**Files:**
- Modify: `C:/Users/larsh/Desktop/Business/Verisight/frontend/app/(dashboard)/beheer/page.tsx`

- [ ] **Step 1: Update the page-level alignment test first**

Replace the current text expectations in `page.test.ts` with the new setup-hub cues:

```ts
expect(source).toContain('Setuphub voor nieuwe klant en campaign')
expect(source).toContain('Primaire setupflow')
expect(source).toContain('Secundaire werkbanken')
expect(source).toContain('Campagne-overzicht')
expect(source).toContain('Organisatie')
expect(source).toContain('Respondenten')
expect(source).not.toContain('Open delivery- en activatiewerk')
expect(source).not.toContain('Werkvolgorde voor Verisight')
expect(source).not.toContain('Cadence')
expect(source).not.toContain('Open health review')
```

- [ ] **Step 2: Run the page-level test to verify it fails**

Run:

```powershell
npm test -- "app/(dashboard)/beheer/page.test.ts"
```

Expected: FAIL because the current page still renders the old ops-heavy content.

- [ ] **Step 3: Replace the hero + summary + cadence wall with a compact setup header**

In `page.tsx`, remove:

- the current `DashboardHero` actions to workbenches
- the `DashboardSummaryBar` anchors
- the entire `DashboardSection` with `id="cadence"`
- the `Werkvolgorde voor Verisight` details block

Replace the top of the page with:

```tsx
<DashboardHero
  surface="ops"
  tone="slate"
  eyebrow="Admin"
  title="Setuphub voor nieuwe klant en campaign"
  description="Zet hier organisaties, campaigns, respondentimport en klanttoegang op in een compacte vaste volgorde."
  meta={
    <>
      <DashboardChip surface="ops" label={`${activeOrgs.length} actieve organisaties`} />
      <DashboardChip surface="ops" label={`${activeCampaignCount} actieve campaigns`} tone="slate" />
      <DashboardChip surface="ops" label={`${pendingInviteCount} wacht op activatie`} tone={pendingInviteCount > 0 ? 'amber' : 'slate'} />
    </>
  }
/>

<DashboardSummaryBar
  surface="ops"
  items={[
    { label: 'Organisaties', value: `${activeOrgs.length}`, tone: activeOrgs.length > 0 ? 'emerald' : 'slate' },
    { label: 'Campaigns', value: `${activeCampaignCount}`, tone: activeCampaignCount > 0 ? 'emerald' : 'slate' },
    { label: 'Respondenten', value: `${liveRespondentCount}`, tone: liveRespondentCount > 0 ? 'emerald' : 'slate' },
    { label: 'Activaties', value: `${pendingInviteCount} wacht`, tone: pendingInviteCount > 0 ? 'amber' : 'slate' },
  ]}
/>
```

- [ ] **Step 4: Rebuild the setup flow around four steps**

In `page.tsx`, make `DashboardSection id="setup"` the dominant block and render:

- `Organisatie` open
- `Campaign` open
- `Respondenten` locked until `selectedCampaign`
- `Klanttoegang` locked until `selectedCampaign`

Use a compact context line above steps 3 and 4:

```tsx
<p className="text-xs text-slate-500">
  Actieve setupcontext: {selectedOrganization?.name ?? 'Geen organisatie'} / {selectedCampaign?.name ?? 'Geen campaign'}
</p>
```

For step 3, limit forms to the chosen campaign:

```tsx
<AddRespondentsForm
  campaigns={selectedCampaign ? [selectedCampaign] : []}
  organizations={selectedOrganization ? [selectedOrganization] : activeOrgs}
/>
```

For step 4, keep capability org-scoped but gated by chosen campaign:

```tsx
<InviteClientUserForm orgs={selectedOrganization ? [selectedOrganization] : activeOrgs} />
```

- [ ] **Step 5: Demote workbenches and campaign overview**

Render a smaller section below setup:

```tsx
<DashboardSection
  id="werkbanken"
  surface="ops"
  eyebrow="Secundair"
  title="Secundaire werkbanken"
  description="Open deze werkbanken alleen wanneer daar echt werk ligt."
>
```

Keep only compact `WorkbenchLinkCard`s for:

- `/beheer/contact-aanvragen`
- `/beheer/klantlearnings`
- `/beheer/health`
- `/beheer/billing`
- `/beheer/proof`

Then keep `DashboardSection id="campagnes"` but only as a collapsed `details` control layer.

- [ ] **Step 6: Run the page-level test to verify it passes**

Run:

```powershell
npm test -- "app/(dashboard)/beheer/page.test.ts"
```

Expected: PASS.

- [ ] **Step 7: Commit the page restructure**

```powershell
git add "frontend/app/(dashboard)/beheer/page.tsx" "frontend/app/(dashboard)/beheer/page.test.ts"
git commit -m "feat: restructure admin beheer into setup hub"
```

### Task 3: Tighten color/test guardrails for the new setup-first surface

**Files:**
- Modify: `C:/Users/larsh/Desktop/Business/Verisight/frontend/app/(dashboard)/beheer/color-semantics.test.ts`

- [ ] **Step 1: Update the color/test assertions to the new page**

Replace old string expectations that depend on the cadence wall with setup-hub expectations:

```ts
expect(beheerSource).toContain("title=\"Setuphub voor nieuwe klant en campaign\"")
expect(beheerSource).toContain("title=\"Secundaire werkbanken\"")
expect(beheerSource).toContain("title=\"Campagne-overzicht\"")
expect(beheerSource).not.toContain('Open delivery- en activatiewerk')
expect(beheerSource).not.toContain('Billing default')
expect(beheerSource).not.toContain('Health review default')
expect(beheerSource).not.toContain('Proof ladder default')
```

- [ ] **Step 2: Run the targeted tests to verify they fail/pass appropriately**

Run:

```powershell
npm test -- "app/(dashboard)/beheer/color-semantics.test.ts" "app/(dashboard)/beheer/page.test.ts"
```

Expected: PASS after the assertions and page copy match.

- [ ] **Step 3: Commit the updated guardrails**

```powershell
git add "frontend/app/(dashboard)/beheer/color-semantics.test.ts"
git commit -m "test: align admin beheer guardrails with setup hub"
```

### Task 4: Full verification and publish readiness

**Files:**
- Modify: `C:/Users/larsh/Desktop/Business/Verisight/frontend/app/(dashboard)/beheer/page.tsx`
- Modify: `C:/Users/larsh/Desktop/Business/Verisight/frontend/app/(dashboard)/beheer/get-beheer-page-data.ts`
- Modify: `C:/Users/larsh/Desktop/Business/Verisight/frontend/app/(dashboard)/beheer/page.test.ts`
- Modify: `C:/Users/larsh/Desktop/Business/Verisight/frontend/app/(dashboard)/beheer/color-semantics.test.ts`
- Create: `C:/Users/larsh/Desktop/Business/Verisight/frontend/app/(dashboard)/beheer/setup-context.ts`
- Create: `C:/Users/larsh/Desktop/Business/Verisight/frontend/app/(dashboard)/beheer/setup-context.test.ts`

- [ ] **Step 1: Run the focused beheer test suite**

```powershell
npm test -- "app/(dashboard)/beheer/setup-context.test.ts" "app/(dashboard)/beheer/page.test.ts" "app/(dashboard)/beheer/color-semantics.test.ts"
```

Expected: PASS.

- [ ] **Step 2: Run eslint on the beheer slice**

```powershell
npx eslint "app/(dashboard)/beheer/page.tsx" "app/(dashboard)/beheer/get-beheer-page-data.ts" "app/(dashboard)/beheer/setup-context.ts" "app/(dashboard)/beheer/page.test.ts" "app/(dashboard)/beheer/color-semantics.test.ts" "app/(dashboard)/beheer/setup-context.test.ts"
```

Expected: no lint errors.

- [ ] **Step 3: Run the production build**

```powershell
$env:NEXT_PUBLIC_SUPABASE_URL='https://example.supabase.co'; $env:NEXT_PUBLIC_SUPABASE_ANON_KEY='test-anon-key'; npm run build
```

Expected: build succeeds; only unrelated pre-existing warnings may remain.

- [ ] **Step 4: Commit the verified final state**

```powershell
git add "frontend/app/(dashboard)/beheer/page.tsx" "frontend/app/(dashboard)/beheer/get-beheer-page-data.ts" "frontend/app/(dashboard)/beheer/setup-context.ts" "frontend/app/(dashboard)/beheer/setup-context.test.ts" "frontend/app/(dashboard)/beheer/page.test.ts" "frontend/app/(dashboard)/beheer/color-semantics.test.ts"
git commit -m "feat: ship admin beheer setup hub"
```

- [ ] **Step 5: Prepare merge/publish flow**

After tests and build pass, use the finishing workflow:

```text
Announce: "I'm using the finishing-a-development-branch skill to complete this work."
```

Then:

- review the branch
- open a PR
- merge after review
- confirm deployment

## Self-Review

- Spec coverage:
  - setup-first IA: Task 2
  - explicit setup context: Task 1
  - org-scoped client access with flow gating: Task 1 + Task 2
  - cadence wall removal: Task 2
  - acceptance/guardrails: Task 3 + Task 4
- Placeholder scan: no TODO/TBD placeholders remain.
- Type consistency:
  - `selectedOrganizationId`, `selectedCampaignId`, `respondentsLocked`, and `clientAccessLocked` are defined in Task 1 and used with the same names later.


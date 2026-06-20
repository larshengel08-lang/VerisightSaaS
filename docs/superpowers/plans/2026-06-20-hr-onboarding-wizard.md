# HR Onboarding Wizard Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Vervang de abstracte Routefasen-pagina voor HR-klanten door een lineaire 3-stappen-wizard zodat een nieuwe klant van eerste login tot survey-uitstuur kan komen zonder hulp van Loep.

**Architecture:** De `setup` state in `resolveDashboardState` bestaat al — het `ctaHref` wijst naar `/campaigns/[id]/setup`, een huidige redirect-shell. We vervangen die shell door de echte wizard-pagina. De wizard laadt campagnedata server-side, stap 1 slaat op via een nieuwe server action, stap 2 toont het kopieerblok en bevestigt de lancering. Na bevestiging schakelt het dashboard automatisch over naar de normale flow (via de bestaande state-resolver).

**Tech Stack:** Next.js App Router (server components + server actions), Supabase client, TypeScript, Tailwind CSS, bestaande `self-send-comms.ts` helpers.

---

## File Map

| Actie | Pad | Verantwoordelijkheid |
|-------|-----|---------------------|
| Aanmaken | `frontend/app/(dashboard)/campaigns/[id]/setup/launch-setup-actions.ts` | Server actions: `saveLaunchSetupAction` + `confirmLaunchAction` |
| Aanmaken | `frontend/components/dashboard/setup-wizard-card.tsx` | Client component: 3-stap wizard UI |
| Wijzigen | `frontend/app/(dashboard)/campaigns/[id]/setup/page.tsx` | Redirect-shell → echte wizard-pagina |
| Wijzigen | `frontend/app/(dashboard)/campaigns/[id]/beheer/page.tsx` | Admin-check + redirect niet-admins |
| Wijzigen | `frontend/app/(dashboard)/campaigns/[id]/page.tsx` | `public_survey_token` toevoegen aan campaign query; rapport-CTA aanpassen voor self-send |

---

## Task 1: Beheer-redirect voor niet-admins

**Files:**
- Modify: `frontend/app/(dashboard)/campaigns/[id]/beheer/page.tsx`
- Test: `frontend/app/(dashboard)/campaigns/[id]/beheer/page.test.ts`

- [ ] **Stap 1: Kijk hoe de huidige test er uit ziet**

```bash
cd Verisight/frontend && npx jest app/\\(dashboard\\)/campaigns/\\[id\\]/beheer/page.test.ts --no-coverage 2>&1 | tail -20
```

- [ ] **Stap 2: Schrijf de falende test**

Open `frontend/app/(dashboard)/campaigns/[id]/beheer/page.test.ts` en voeg toe:

```typescript
it('redirects non-admin users to campaign detail page', async () => {
  // Mock loadSuiteAccessContext to return non-admin
  vi.mocked(loadSuiteAccessContext).mockResolvedValueOnce({
    context: { canViewInsights: true, isVerisightAdmin: false } as any,
    profile: { is_verisight_admin: false },
    orgMemberships: [],
    workspaceMemberships: [],
  })
  const { redirect } = await import('next/navigation')
  await import('./page').then(m => m.default({ params: Promise.resolve({ id: 'test-id' }), searchParams: undefined }))
  expect(redirect).toHaveBeenCalledWith('/campaigns/test-id')
})
```

- [ ] **Stap 3: Draai de test en verifieer dat hij faalt**

```bash
cd Verisight/frontend && npx jest app/\\(dashboard\\)/campaigns/\\[id\\]/beheer/page.test.ts --no-coverage 2>&1 | tail -10
```

Verwacht: FAIL — redirect wordt niet aangeroepen.

- [ ] **Stap 4: Implementeer de admin-check in beheer/page.tsx**

Zoek de plek na `loadSuiteAccessContext` in `frontend/app/(dashboard)/campaigns/[id]/beheer/page.tsx` (rond regel 44) en voeg toe:

```typescript
import { redirect } from 'next/navigation'

// Binnen RouteBeheerPage, direct na loadSuiteAccessContext:
const isVerisightAdmin = context.profile?.is_verisight_admin === true || false

// Na de canViewInsights check:
if (!context.isVerisightAdmin) {
  redirect(`/campaigns/${id}`)
}
```

Let op: `loadSuiteAccessContext` retourneert `{ context, profile, orgMemberships, workspaceMemberships }`. Check `profile?.is_verisight_admin === true` direct, of gebruik het `isVerisightAdmin` veld dat `buildSuiteAccessContext` berekent.

Kijk in `suite-access-server.ts` hoe `isVerisightAdmin` beschikbaar is:

```typescript
// In beheer/page.tsx, na loadSuiteAccessContext call:
const { context, profile } = await loadSuiteAccessContext(supabase, user.id)

if (!context.canViewInsights) { /* bestaande check */ }

// Nieuw: redirect niet-admins
if (profile?.is_verisight_admin !== true) {
  redirect(`/campaigns/${id}`)
}
```

- [ ] **Stap 5: Draai de test en verifieer dat hij slaagt**

```bash
cd Verisight/frontend && npx jest app/\\(dashboard\\)/campaigns/\\[id\\]/beheer/page.test.ts --no-coverage 2>&1 | tail -10
```

Verwacht: PASS

- [ ] **Stap 6: Commit**

```bash
git -C Verisight add frontend/app/\(dashboard\)/campaigns/\[id\]/beheer/page.tsx frontend/app/\(dashboard\)/campaigns/\[id\]/beheer/page.test.ts
git -C Verisight commit -m "feat(wizard): redirect niet-admins weg van beheer-pagina naar campagnedetail"
```

---

## Task 2: Server actions voor wizard (stap 1 + stap 2)

**Files:**
- Create: `frontend/app/(dashboard)/campaigns/[id]/setup/launch-setup-actions.ts`
- Test: `frontend/app/(dashboard)/campaigns/[id]/setup/launch-setup-actions.test.ts`

- [ ] **Stap 1: Schrijf de falende tests**

Maak nieuw bestand `frontend/app/(dashboard)/campaigns/[id]/setup/launch-setup-actions.test.ts`:

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(),
}))

import { createClient } from '@/lib/supabase/server'
import { saveLaunchSetupAction, confirmLaunchAction } from './launch-setup-actions'

function makeSupabase(overrides: Record<string, unknown> = {}) {
  const upsert = vi.fn().mockResolvedValue({ error: null })
  const update = vi.fn().mockResolvedValue({ error: null })
  const eq = vi.fn().mockReturnThis()
  const select = vi.fn().mockReturnThis()
  const single = vi.fn().mockResolvedValue({ data: { organization_id: 'org-1' }, error: null })
  const from = vi.fn((table: string) => {
    if (table === 'campaigns') return { select, eq: vi.fn().mockReturnValue({ single }) }
    if (table === 'profiles') return { select: vi.fn().mockReturnValue({ eq: vi.fn().mockReturnValue({ maybeSingle: vi.fn().mockResolvedValue({ data: { is_verisight_admin: false }, error: null }) }) }) }
    if (table === 'org_members') return { select: vi.fn().mockReturnValue({ eq: vi.fn().mockReturnValue({ eq: vi.fn().mockReturnValue({ maybeSingle: vi.fn().mockResolvedValue({ data: { role: 'member' }, error: null }) }) }) }) }
    return { upsert, update, eq, select }
  })
  return {
    auth: { getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'user-1' } } }) },
    from,
    ...overrides,
  }
}

describe('saveLaunchSetupAction', () => {
  beforeEach(() => { vi.mocked(createClient).mockResolvedValue(makeSupabase() as any) })

  it('returns success when valid inputs provided', async () => {
    const result = await saveLaunchSetupAction('campaign-1', '2026-07-01', 40)
    expect(result.ok).toBe(true)
  })

  it('returns error when invitedCount < 1', async () => {
    const result = await saveLaunchSetupAction('campaign-1', '2026-07-01', 0)
    expect(result.ok).toBe(false)
    expect(result.error).toMatch(/deelnemer/)
  })

  it('returns error when launchDate is empty', async () => {
    const result = await saveLaunchSetupAction('campaign-1', '', 10)
    expect(result.ok).toBe(false)
    expect(result.error).toMatch(/datum/)
  })
})

describe('confirmLaunchAction', () => {
  beforeEach(() => { vi.mocked(createClient).mockResolvedValue(makeSupabase() as any) })

  it('returns success on valid campaign', async () => {
    const result = await confirmLaunchAction('campaign-1')
    expect(result.ok).toBe(true)
  })
})
```

- [ ] **Stap 2: Draai de tests en verifieer dat ze falen**

```bash
cd Verisight/frontend && npx jest app/\\(dashboard\\)/campaigns/\\[id\\]/setup/launch-setup-actions.test.ts --no-coverage 2>&1 | tail -10
```

Verwacht: FAIL — module bestaat niet.

- [ ] **Stap 3: Implementeer de server actions**

Maak `frontend/app/(dashboard)/campaigns/[id]/setup/launch-setup-actions.ts`:

```typescript
'use server'

import { createClient } from '@/lib/supabase/server'

export interface ActionResult {
  ok: boolean
  error?: string
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

  const authorized = profile?.is_verisight_admin === true || membership !== null
  return { supabase, user, campaign, authorized }
}

export async function saveLaunchSetupAction(
  campaignId: string,
  launchDate: string,
  invitedCount: number,
): Promise<ActionResult> {
  if (!launchDate) return { ok: false, error: 'Startdatum is verplicht.' }
  if (!invitedCount || invitedCount < 1) return { ok: false, error: 'Aantal deelnemers moet minimaal 1 zijn.' }

  const { supabase, authorized } = await getAuthAndMembership(campaignId)
  if (!authorized) return { ok: false, error: 'Niet gemachtigd.' }

  const { error } = await supabase
    .from('campaign_delivery_records')
    .upsert(
      { campaign_id: campaignId, launch_date: launchDate, invited_count: invitedCount },
      { onConflict: 'campaign_id' },
    )

  if (error) throw new Error(`Opslaan mislukt: ${error.message}`)
  return { ok: true }
}

export async function confirmLaunchAction(campaignId: string): Promise<ActionResult> {
  const { supabase, authorized } = await getAuthAndMembership(campaignId)
  if (!authorized) return { ok: false, error: 'Niet gemachtigd.' }

  const now = new Date().toISOString()
  const { error } = await supabase
    .from('campaign_delivery_records')
    .update({ launch_confirmed_at: now })
    .eq('campaign_id', campaignId)

  if (error) throw new Error(`Bevestigen mislukt: ${error.message}`)
  return { ok: true }
}
```

- [ ] **Stap 4: Draai de tests en verifieer dat ze slagen**

```bash
cd Verisight/frontend && npx jest app/\\(dashboard\\)/campaigns/\\[id\\]/setup/launch-setup-actions.test.ts --no-coverage 2>&1 | tail -10
```

Verwacht: PASS (3 tests groen)

- [ ] **Stap 5: Commit**

```bash
git -C Verisight add frontend/app/\(dashboard\)/campaigns/\[id\]/setup/launch-setup-actions.ts frontend/app/\(dashboard\)/campaigns/\[id\]/setup/launch-setup-actions.test.ts
git -C Verisight commit -m "feat(wizard): server actions saveLaunchSetupAction + confirmLaunchAction"
```

---

## Task 3: SetupWizardCard component

**Files:**
- Create: `frontend/components/dashboard/setup-wizard-card.tsx`

Dit is een `'use client'` component. Geen aparte unit-tests — gedrag wordt gedekt door de wizardpagina (Task 4).

- [ ] **Stap 1: Maak het component**

Maak `frontend/components/dashboard/setup-wizard-card.tsx`:

```typescript
'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { SCAN_TYPE_LABELS, type ScanType } from '@/lib/types'
import { buildInviteTemplate, buildSurveyLink } from '@/lib/self-send-comms'
import { saveLaunchSetupAction, confirmLaunchAction } from '@/app/(dashboard)/campaigns/[id]/setup/launch-setup-actions'

interface Props {
  campaignId: string
  scanType: ScanType
  organizationName: string
  publicSurveyToken: string
  frontendBaseUrl: string
  initialLaunchDate: string | null
  initialInvitedCount: number | null
}

type WizardStep = 1 | 2

function StepBadge({ n, active, done }: { n: number; active: boolean; done: boolean }) {
  const bg = done ? 'bg-[color:var(--dashboard-accent-strong)]' : active ? 'bg-[#E8A020]' : 'bg-[color:var(--dashboard-soft)]'
  const text = done || active ? 'text-white' : 'text-[color:var(--dashboard-muted)]'
  return (
    <div className={`flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full text-sm font-semibold ${bg} ${text}`}>
      {done ? '✓' : n}
    </div>
  )
}

export function SetupWizardCard({
  campaignId,
  scanType,
  organizationName,
  publicSurveyToken,
  frontendBaseUrl,
  initialLaunchDate,
  initialInvitedCount,
}: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [step, setStep] = useState<WizardStep>(initialLaunchDate && initialInvitedCount ? 2 : 1)
  const [launchDate, setLaunchDate] = useState(initialLaunchDate ?? '')
  const [invitedCount, setInvitedCount] = useState<number | ''>(initialInvitedCount ?? '')
  const [linkTested, setLinkTested] = useState(false)
  const [step1Error, setStep1Error] = useState<string | null>(null)
  const [step2Error, setStep2Error] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  const surveyLink = buildSurveyLink(frontendBaseUrl, publicSurveyToken)
  const scanLabel = SCAN_TYPE_LABELS[scanType] ?? scanType
  const inviteTemplate = buildInviteTemplate({
    senderName: 'HR',
    organizationName,
    scanLabel,
    surveyLink,
  })
  const inviteText = `Onderwerp: ${inviteTemplate.subject}\n\n${inviteTemplate.body}`

  const today = new Date().toISOString().slice(0, 10)

  async function handleStep1Submit(e: React.FormEvent) {
    e.preventDefault()
    setStep1Error(null)
    if (!launchDate) { setStep1Error('Vul een startdatum in.'); return }
    if (!invitedCount || Number(invitedCount) < 1) { setStep1Error('Vul het aantal deelnemers in (minimaal 1).'); return }
    startTransition(async () => {
      const result = await saveLaunchSetupAction(campaignId, launchDate, Number(invitedCount))
      if (!result.ok) { setStep1Error(result.error ?? 'Er ging iets mis.'); return }
      setStep(2)
    })
  }

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(inviteText)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
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
    <section className="rounded-[22px] border border-dashed border-[color:var(--dashboard-frame-border)] bg-[color:var(--dashboard-surface)] px-6 py-7">
      <h1 className="font-serif text-[2rem] leading-[1.05] tracking-[-0.04em] text-[color:var(--dashboard-ink)]">
        Campagne klaarzetten
      </h1>
      <p className="mt-2 text-[0.95rem] text-[color:var(--dashboard-text)]">
        Drie stappen — klaar in ongeveer 5 minuten.
      </p>

      <div className="mt-6 space-y-4">
        {/* Stap 1 */}
        <div className={`rounded-[18px] border bg-white px-5 py-4 ${step === 1 ? 'border-[color:var(--dashboard-frame-border)]' : 'border-transparent opacity-60'}`}>
          <div className="flex items-center gap-3">
            <StepBadge n={1} active={step === 1} done={step > 1} />
            <div>
              <p className="text-sm font-semibold text-[color:var(--dashboard-ink)]">Startdatum instellen</p>
              <p className="text-xs text-[color:var(--dashboard-muted)]">Wanneer stuur je de uitnodiging? Naar hoeveel medewerkers?</p>
            </div>
            {step === 1 && <span className="ml-auto rounded-full bg-[#FAEEDA] px-2.5 py-0.5 text-xs font-semibold text-[#E8A020]">Nu doen</span>}
          </div>

          {step === 1 && (
            <form onSubmit={handleStep1Submit} className="mt-4 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs font-semibold text-[color:var(--dashboard-muted)]">Startdatum</label>
                  <input
                    type="date"
                    min={today}
                    value={launchDate}
                    onChange={e => setLaunchDate(e.target.value)}
                    required
                    className="w-full rounded-lg border border-[color:var(--dashboard-frame-border)] px-3 py-2 text-sm text-[color:var(--dashboard-ink)] focus:outline-none focus:ring-2 focus:ring-[color:var(--dashboard-accent-strong)]"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-[color:var(--dashboard-muted)]">Aantal deelnemers</label>
                  <input
                    type="number"
                    min={1}
                    value={invitedCount}
                    onChange={e => setInvitedCount(e.target.value === '' ? '' : Number(e.target.value))}
                    placeholder="bijv. 40"
                    required
                    className="w-full rounded-lg border border-[color:var(--dashboard-frame-border)] px-3 py-2 text-sm text-[color:var(--dashboard-ink)] focus:outline-none focus:ring-2 focus:ring-[color:var(--dashboard-accent-strong)]"
                  />
                </div>
              </div>

              <div>
                <p className="mb-1 text-xs font-semibold text-[color:var(--dashboard-muted)]">Survey-link</p>
                <div className="flex items-center gap-2">
                  <code className="flex-1 truncate rounded-lg border border-[color:var(--dashboard-frame-border)] bg-[color:var(--dashboard-soft)] px-3 py-2 text-xs text-[color:var(--dashboard-ink)]">
                    {surveyLink}
                  </code>
                  <a
                    href={surveyLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="whitespace-nowrap rounded-lg border border-[color:var(--dashboard-frame-border)] px-3 py-2 text-xs font-semibold text-[color:var(--dashboard-ink)] hover:bg-[color:var(--dashboard-soft)]"
                  >
                    Test link →
                  </a>
                </div>
                <label className="mt-2 flex cursor-pointer items-center gap-2 text-xs text-[color:var(--dashboard-muted)]">
                  <input type="checkbox" checked={linkTested} onChange={e => setLinkTested(e.target.checked)} className="h-4 w-4 rounded" />
                  Ik heb de link getest en hij werkt
                </label>
              </div>

              {step1Error && (
                <p className="rounded-lg bg-red-50 px-3 py-2 text-xs font-semibold text-red-700">{step1Error}</p>
              )}

              <button
                type="submit"
                disabled={isPending}
                className="inline-flex items-center rounded-lg bg-[color:var(--dashboard-ink)] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#1B2E45] disabled:opacity-60"
              >
                {isPending ? 'Bezig…' : 'Opslaan en verder →'}
              </button>
            </form>
          )}
        </div>

        {/* Stap 2 */}
        <div className={`rounded-[18px] border bg-white px-5 py-4 ${step === 2 ? 'border-[color:var(--dashboard-frame-border)]' : 'border-transparent opacity-40'}`}>
          <div className="flex items-center gap-3">
            <StepBadge n={2} active={step === 2} done={false} />
            <div>
              <p className="text-sm font-semibold text-[color:var(--dashboard-ink)]">Uitnodiging versturen</p>
              <p className="text-xs text-[color:var(--dashboard-muted)]">Kopieer de tekst en stuur vanuit je eigen e-mail</p>
            </div>
            {step === 2 && <span className="ml-auto rounded-full bg-[#FAEEDA] px-2.5 py-0.5 text-xs font-semibold text-[#E8A020]">Nu doen</span>}
          </div>

          {step === 2 && (
            <div className="mt-4 space-y-3">
              <pre className="whitespace-pre-wrap rounded-lg border border-[color:var(--dashboard-frame-border)] bg-[color:var(--dashboard-soft)] p-3 text-xs text-[color:var(--dashboard-ink)]">
                {inviteText}
              </pre>
              <button
                type="button"
                onClick={handleCopy}
                className="rounded-lg border border-[color:var(--dashboard-frame-border)] px-4 py-2 text-sm font-semibold text-[color:var(--dashboard-ink)] transition-colors hover:bg-[color:var(--dashboard-soft)]"
              >
                {copied ? 'Gekopieerd ✓' : 'Kopieer uitnodiging'}
              </button>

              <div className="border-t border-[color:var(--dashboard-frame-border)] pt-3">
                <p className="mb-2 text-xs text-[color:var(--dashboard-muted)]">
                  Heb je de uitnodiging verstuurd naar je medewerkers?
                </p>
                {step2Error && (
                  <p className="mb-2 rounded-lg bg-red-50 px-3 py-2 text-xs font-semibold text-red-700">{step2Error}</p>
                )}
                <button
                  type="button"
                  onClick={handleConfirmLaunch}
                  disabled={isPending}
                  className="inline-flex items-center rounded-lg bg-[color:var(--dashboard-ink)] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#1B2E45] disabled:opacity-60"
                >
                  {isPending ? 'Bezig…' : 'Ik heb de uitnodiging verstuurd →'}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Stap 3 (informatief) */}
        <div className="rounded-[18px] border border-transparent px-5 py-4 opacity-40">
          <div className="flex items-center gap-3">
            <StepBadge n={3} active={false} done={false} />
            <div>
              <p className="text-sm font-semibold text-[color:var(--dashboard-ink)]">Volgen & afronden</p>
              <p className="text-xs text-[color:var(--dashboard-muted)]">Respons monitoren · herinnering · rapport via Loep</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
```

- [ ] **Stap 2: Verifieer TypeScript**

```bash
cd Verisight/frontend && npx tsc --noEmit 2>&1 | grep setup-wizard-card
```

Verwacht: geen output (geen errors in dit bestand).

- [ ] **Stap 3: Commit**

```bash
git -C Verisight add frontend/components/dashboard/setup-wizard-card.tsx
git -C Verisight commit -m "feat(wizard): SetupWizardCard component (3-stap onboarding UI)"
```

---

## Task 4: Setup-pagina vervangen door echte wizard

**Files:**
- Modify: `frontend/app/(dashboard)/campaigns/[id]/setup/page.tsx`
- Test: `frontend/app/(dashboard)/campaigns/[id]/setup/page.test.ts`

- [ ] **Stap 1: Schrijf de falende test**

Overschrijf `frontend/app/(dashboard)/campaigns/[id]/setup/page.test.ts`:

```typescript
import { describe, it, expect, vi } from 'vitest'

vi.mock('@/lib/supabase/server', () => ({ createClient: vi.fn() }))
vi.mock('next/navigation', () => ({ notFound: vi.fn(() => { throw new Error('not-found') }), redirect: vi.fn() }))

import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'

function makeSupabase(campaign: Record<string, unknown> | null, delivery: Record<string, unknown> | null) {
  const user = { id: 'user-1', email: 'lars@verisight.nl' }
  const maybeSingle = vi.fn()
  const single = vi.fn()
  const eq = vi.fn().mockReturnThis()
  const select = vi.fn().mockReturnThis()
  const from = vi.fn((table: string) => {
    if (table === 'campaigns') return { select: vi.fn().mockReturnValue({ eq: vi.fn().mockReturnValue({ maybeSingle: vi.fn().mockResolvedValue({ data: campaign, error: campaign ? null : { code: 'PGRST116' } }) }) }) }
    if (table === 'campaign_delivery_records') return { select: vi.fn().mockReturnValue({ eq: vi.fn().mockReturnValue({ maybeSingle: vi.fn().mockResolvedValue({ data: delivery, error: null }) }) }) }
    if (table === 'profiles') return { select: vi.fn().mockReturnValue({ eq: vi.fn().mockReturnValue({ maybeSingle: vi.fn().mockResolvedValue({ data: { is_verisight_admin: false }, error: null }) }) }) }
    if (table === 'org_members') return { select: vi.fn().mockReturnValue({ eq: vi.fn().mockReturnValue({ eq: vi.fn().mockReturnValue({ maybeSingle: vi.fn().mockResolvedValue({ data: { role: 'member' }, error: null }) }) }) }) }
    return { select, eq, maybeSingle, single }
  })
  return {
    auth: { getUser: vi.fn().mockResolvedValue({ data: { user } }) },
    from,
  }
}

describe('CampaignSetupPage', () => {
  it('renders wizard when campaign has public_survey_token', async () => {
    vi.mocked(createClient).mockResolvedValue(makeSupabase(
      { id: 'c-1', public_survey_token: 'abc-token', closes_at: null, comms_mode: 'self_send', name: 'Test', scan_type: 'retention' },
      { launch_date: null, invited_count: null, launch_confirmed_at: null }
    ) as any)
    const { default: Page } = await import('./page')
    const result = await Page({ params: Promise.resolve({ id: 'c-1' }) })
    expect(result).toBeTruthy()
  })

  it('calls notFound when campaign missing', async () => {
    vi.mocked(createClient).mockResolvedValue(makeSupabase(null, null) as any)
    const { default: Page } = await import('./page')
    await expect(Page({ params: Promise.resolve({ id: 'missing' }) })).rejects.toThrow('not-found')
  })
})
```

- [ ] **Stap 2: Draai de test en verifieer dat hij faalt**

```bash
cd Verisight/frontend && npx jest app/\\(dashboard\\)/campaigns/\\[id\\]/setup/page.test.ts --no-coverage 2>&1 | tail -10
```

Verwacht: FAIL

- [ ] **Stap 3: Schrijf de pagina**

Overschrijf `frontend/app/(dashboard)/campaigns/[id]/setup/page.tsx`:

```typescript
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { SetupWizardCard } from '@/components/dashboard/setup-wizard-card'

interface Props {
  params: Promise<{ id: string }>
}

export default async function CampaignSetupPage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) notFound()

  const [{ data: campaign }, { data: delivery }, { data: orgData }] = await Promise.all([
    supabase
      .from('campaigns')
      .select('id, public_survey_token, scan_type, name, closes_at, comms_mode')
      .eq('id', id)
      .maybeSingle(),
    supabase
      .from('campaign_delivery_records')
      .select('launch_date, invited_count, launch_confirmed_at')
      .eq('campaign_id', id)
      .maybeSingle(),
    supabase
      .from('org_members')
      .select('organizations(name)')
      .eq('user_id', user.id)
      .maybeSingle(),
  ])

  if (!campaign) notFound()

  // Als de campagne al gelanceerd is, hoeft de wizard niet meer getoond.
  // Redirect terug naar campagnedetail zodat de normale state-view laadt.
  if (delivery?.launch_confirmed_at) {
    const { redirect } = await import('next/navigation')
    redirect(`/campaigns/${id}`)
  }

  const organizationName = (orgData as any)?.organizations?.name ?? 'je organisatie'
  const frontendBaseUrl = process.env.NEXT_PUBLIC_FRONTEND_URL ?? 'https://getloep.nl'

  return (
    <div className="space-y-6">
      <SetupWizardCard
        campaignId={id}
        scanType={campaign.scan_type}
        organizationName={organizationName}
        publicSurveyToken={campaign.public_survey_token}
        frontendBaseUrl={frontendBaseUrl}
        initialLaunchDate={delivery?.launch_date ?? null}
        initialInvitedCount={delivery?.invited_count ?? null}
      />
    </div>
  )
}
```

- [ ] **Stap 4: Draai de tests en verifieer dat ze slagen**

```bash
cd Verisight/frontend && npx jest app/\\(dashboard\\)/campaigns/\\[id\\]/setup/page.test.ts --no-coverage 2>&1 | tail -10
```

Verwacht: PASS

- [ ] **Stap 5: Verifieer TypeScript**

```bash
cd Verisight/frontend && npx tsc --noEmit 2>&1 | grep "setup/page"
```

Verwacht: geen output.

- [ ] **Stap 6: Commit**

```bash
git -C Verisight add frontend/app/\(dashboard\)/campaigns/\[id\]/setup/page.tsx frontend/app/\(dashboard\)/campaigns/\[id\]/setup/page.test.ts
git -C Verisight commit -m "feat(wizard): setup-pagina vervangt redirect-shell door echte 3-stappen-wizard"
```

---

## Task 5: Campagnedetail — public_survey_token + rapport-CTA voor self-send

**Files:**
- Modify: `frontend/app/(dashboard)/campaigns/[id]/page.tsx`

- [ ] **Stap 1: Voeg `public_survey_token` toe aan de campaign query**

In `frontend/app/(dashboard)/campaigns/[id]/page.tsx`, regel 53:

Wijzig:
```typescript
supabase.from('campaigns').select('closed_at, closes_at, delivery_mode, comms_mode').eq('id', id).maybeSingle(),
```

Naar:
```typescript
supabase.from('campaigns').select('closed_at, closes_at, delivery_mode, comms_mode, public_survey_token').eq('id', id).maybeSingle(),
```

- [ ] **Stap 2: Vervang PDF-downloadknop door "Loep neemt contact op" voor self-send klanten**

Zoek in `frontend/app/(dashboard)/campaigns/[id]/page.tsx` het blok dat `state.kind === 'report_ready'` en `PdfDownloadButton` rendert (rond regel 139–162).

Voeg boven `<PdfDownloadButton ...>` een check toe:

```typescript
// Laad of gebruiker admin is
const { data: profile } = await supabase
  .from('profiles')
  .select('is_verisight_admin')
  .eq('id', user.id)
  .maybeSingle()
const isAdmin = profile?.is_verisight_admin === true
```

Vervang dan het `report_ready`-blok:

```typescript
{state.kind === 'report_ready' ? (
  <>
    <div className="rounded-[22px] border border-[color:var(--dashboard-frame-border)] bg-white px-6 py-6">
      {isAdmin ? (
        <PdfDownloadButton campaignId={stats.campaign_id} campaignName={stats.campaign_name} scanType={stats.scan_type} />
      ) : (
        <div>
          <p className="mb-1 text-sm font-semibold text-[color:var(--dashboard-ink)]">
            Volgende stap
          </p>
          <p className="text-sm text-[color:var(--dashboard-text)]">
            Je rapport is in voorbereiding. Loep neemt contact met je op om de vervolgstap te bespreken.
          </p>
        </div>
      )}
    </div>
    {isAdmin && process.env.NEXT_PUBLIC_CALENDLY_URL ? (
      // bestaand Calendly-blok ongewijzigd
      <div className="rounded-[22px] border border-[color:var(--dashboard-frame-border)] bg-white px-6 py-6">
        <p className="mb-3 text-sm font-semibold text-[color:var(--dashboard-ink)]">
          Volgende stap: managementbespreking
        </p>
        <a
          href={process.env.NEXT_PUBLIC_CALENDLY_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-lg border border-[color:var(--dashboard-frame-border)] px-4 py-2.5 text-sm font-semibold text-[color:var(--dashboard-ink)] transition-colors hover:bg-[color:var(--dashboard-soft)]"
        >
          Plan de managementbespreking →
        </a>
        <p className="mt-2 text-xs text-[color:var(--dashboard-muted)]">
          Kies een moment dat uitkomt voor HR en management.
        </p>
      </div>
    ) : null}
  </>
) : null}
```

- [ ] **Stap 3: Verifieer TypeScript**

```bash
cd Verisight/frontend && npx tsc --noEmit 2>&1 | grep "campaigns/\[id\]/page"
```

Verwacht: geen nieuwe errors.

- [ ] **Stap 4: Draai de bestaande test suite**

```bash
cd Verisight/frontend && npx jest --no-coverage 2>&1 | tail -15
```

Verwacht: hetzelfde aantal falende tests als de baseline (geen nieuwe regressies).

- [ ] **Stap 5: Commit**

```bash
git -C Verisight add frontend/app/\(dashboard\)/campaigns/\[id\]/page.tsx
git -C Verisight commit -m "feat(wizard): rapport-CTA voor self-send klanten; public_survey_token in campaign query"
```

---

## Task 6: Push en handmatige verificatie

- [ ] **Stap 1: Push naar origin**

```bash
git -C Verisight push origin main
```

- [ ] **Stap 2: Wacht op Vercel-deploy**

Vercel deployt automatisch na push. Controleer Vercel dashboard of de build slaagt.

- [ ] **Stap 3: Handmatige verificatie als lars@verisight.nl (klant)**

1. Log in op getloep.nl als `lars@verisight.nl`
2. Ga naar de actieve Loep Behoud campagne
3. Klik op "Campagne klaarzetten →" — verifieer dat de wizard-pagina laadt (niet de Routefasen-pagina)
4. Vul startdatum en aantal deelnemers in → klik "Opslaan en verder" → stap 2 moet openen
5. Kopieer de uitnodigingstekst
6. Klik "Ik heb de uitnodiging verstuurd" → dashboard moet verversen naar normale state-view
7. Navigeer handmatig naar `/campaigns/[id]/beheer` → verifieer redirect naar campagnedetail

- [ ] **Stap 4: Verifieer als admin (larshengel08@hotmail.com)**

1. Log in als admin
2. Navigeer naar een campagne → `/campaigns/[id]/beheer` moet de Routefasen-pagina tonen (geen redirect)

---

## Zelf-review

**Spec coverage:**
- ✅ 3-stappen-wizard als `setup` state — Task 3 + 4
- ✅ Stap 1: startdatum + deelnemers + testlink + checkbox — Task 3
- ✅ Stap 2: kopieerblok + bevestigen — Task 3
- ✅ Stap 3: informatief label, normale view na bevestigen — Task 3 (router.refresh)
- ✅ Beheer-redirect voor niet-admins — Task 1
- ✅ Rapport-CTA "Loep neemt contact op" voor self-send klanten — Task 5
- ✅ `invited_count` validatie (min 1) — Task 2 server action + Task 3 client validatie
- ✅ Fail-loud: zichtbare foutmelding bij opslaan-fout — Task 3
- ✅ Browser gesloten: state herstelt uit DB (`initialLaunchDate` / `initialInvitedCount`) — Task 3 + 4
- ✅ `closes_at` niet ingevuld: stilzwijgend weggelaten — Task 4 (niet getoond)
- ✅ Admins verliezen geen functionaliteit — Task 1 (admin-check) + Task 5 (isAdmin PDF-knop)

**Placeholder scan:** Geen TBD's of onvolledige stappen gevonden.

**Type consistency:** `saveLaunchSetupAction(campaignId: string, launchDate: string, invitedCount: number)` consistent gebruikt in Task 2 (definitie) en Task 3 (aanroep). `confirmLaunchAction(campaignId: string)` consistent.

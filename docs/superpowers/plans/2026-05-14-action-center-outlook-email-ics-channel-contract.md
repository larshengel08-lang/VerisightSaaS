# Action Center Outlook / Email / ICS Channel Contract Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the first strong-hybrid review-invite contract for Action Center so ExitScan review moments can produce route-aware email + ICS invite artifacts without requiring native Microsoft tenant integration.

**Architecture:** Keep canonical follow-through state in Action Center and make the first channel layer artifact-driven. The implementation adds one shared review-invite draft contract, one ICS renderer, one bounded API route that returns preview JSON or a downloadable `.ics`, and one small review-detail CTA so HR can generate invite artifacts without pulling the broader triggered-mail layer into scope.

**Tech Stack:** Next.js App Router route handlers, TypeScript, React 19, Vitest, existing Action Center page-data loader, existing contextual Action Center entry helper, standards-based ICS output.

---

## Scope Check

This file is intentionally only **child plan 2** from [2026-05-14-action-center-strong-hybrid-upsell-design.md](/C:/Users/larsh/Desktop/Business/Verisight/.worktrees/spec-hr-routebeheer-structure/docs/superpowers/specs/2026-05-14-action-center-strong-hybrid-upsell-design.md):

- in scope here: route-aware review invite draft rules, email copy contract, ICS serialization, preview/download API, and a bounded review-detail CTA for manual artifact generation
- explicitly out of scope here: automatic reminder sending, assignment or missed-review trigger mail, HR rhythm configuration, recurring scheduling logic, Microsoft Graph integration, Teams/Slack, or off-platform canonical write actions

This child plan should land working, testable software on its own and become the bounded foundation for:

- `Triggered Follow-Through Mail Layer`
- `HR Rhythm Console`
- later optional native Microsoft integration

## Product Rules To Preserve

- Phase 1 delivery model is `email + ICS`; no tenant-wide Microsoft consent is required.
- Action Center remains canonical for review outcome, owner changes, closeout, reopen, and schedule edits.
- Off-platform phase 1 behavior is limited to awareness and RSVP hints.
- First serious rollout eligibility is **ExitScan only** in this child plan.
- A missing review date, missing manager email, or non-ExitScan route must block invite generation with an explicit reason.

## File Structure

| File | Responsibility |
| --- | --- |
| `frontend/lib/action-center-review-invite.ts` | Shared invite draft contract, eligibility rules, route-aware copy, and email payload generation |
| `frontend/lib/action-center-review-invite.test.ts` | Unit coverage for eligibility, route-aware links, and bounded write-policy fields |
| `frontend/lib/action-center-review-invite-ics.ts` | ICS serialization for `REQUEST` and `CANCEL`, stable UID/sequence handling, and local-date vs datetime formatting |
| `frontend/lib/action-center-review-invite-ics.test.ts` | Unit coverage for all-day ICS, timed ICS, cancel semantics, and RSVP-only metadata |
| `frontend/app/api/action-center-review-invites/invite-helpers.ts` | Server-side lookup of the selected review item, manager email, canonical origin, and API body/query normalization |
| `frontend/app/api/action-center-review-invites/route.ts` | Bounded route handler that returns preview JSON on `POST` and `.ics` download on `GET` |
| `frontend/app/api/action-center-review-invites/route.test.ts` | Route-level access, eligibility, preview JSON, and ICS response coverage |
| `frontend/components/dashboard/review-moment-detail-panel.tsx` | Small review-detail CTA for downloading the bounded `.ics` artifact |
| `frontend/components/dashboard/review-moment-detail-panel.test.ts` | Source and render contract for the new review invite CTA |

Do **not** touch:

- `frontend/components/dashboard/action-center-preview.tsx`
- `frontend/app/(dashboard)/action-center/page.tsx`
- `frontend/lib/action-center-route-contract.ts`
- `frontend/lib/action-center-live.ts`
- any triggered-notification or reminder route

---

### Task 1: Add the Shared Review Invite Draft Contract

**Files:**
- Create: `frontend/lib/action-center-review-invite.ts`
- Create: `frontend/lib/action-center-review-invite.test.ts`

- [ ] **Step 1: Write the failing contract tests**

```ts
// frontend/lib/action-center-review-invite.test.ts
import { describe, expect, it } from 'vitest'
import {
  buildActionCenterReviewInviteDraft,
  getActionCenterReviewInviteEligibility,
  type ActionCenterReviewInviteContext,
} from './action-center-review-invite'

const baseContext: ActionCenterReviewInviteContext = {
  reviewItemId: 'cmp-exit-1::org-1::department::operations',
  routeId: 'cmp-exit-1::org-1::department::operations',
  campaignId: 'cmp-exit-1',
  campaignName: 'ExitScan Q2',
  scanType: 'exit',
  organizationName: 'Northwind',
  scopeLabel: 'Operations',
  routeTitle: 'Begrens verloop in operations',
  managerName: 'Mila Jansen',
  managerEmail: 'mila@northwind.example',
  reviewDate: '2026-05-28',
  reviewReason: 'Toets of de eerste managementactie effect laat zien.',
  routeStatus: 'reviewbaar',
  actionCenterBaseUrl: 'https://app.verisight.nl',
  source: 'notification',
  organizerMode: 'verisight-mailbox',
}

describe('action center review invite contract', () => {
  it('accepts ExitScan review items with a manager email and review date', () => {
    expect(getActionCenterReviewInviteEligibility(baseContext)).toEqual({
      ok: true,
      reason: null,
    })
  })

  it('blocks non-exit routes in the first rollout shape', () => {
    expect(
      getActionCenterReviewInviteEligibility({
        ...baseContext,
        scanType: 'retention',
      }),
    ).toEqual({
      ok: false,
      reason: 'unsupported-scan-type',
    })
  })

  it('blocks invite generation when the manager email is missing', () => {
    expect(
      getActionCenterReviewInviteEligibility({
        ...baseContext,
        managerEmail: null,
      }),
    ).toEqual({
      ok: false,
      reason: 'missing-manager-email',
    })
  })

  it('builds a route-aware draft with bounded write-policy metadata', () => {
    const draft = buildActionCenterReviewInviteDraft(baseContext)

    expect(draft.subject).toBe('Reviewmoment ExitScan Q2 / Operations')
    expect(draft.actionCenterHref).toBe(
      'https://app.verisight.nl/action-center?focus=cmp-exit-1%3A%3Aorg-1%3A%3Adepartment%3A%3Aoperations&view=reviews&source=notification',
    )
    expect(draft.deliveryModel).toEqual({
      channel: 'email-ics',
      organizerMode: 'verisight-mailbox',
      nativeMicrosoftRequired: false,
    })
    expect(draft.writePolicy).toEqual({
      calendarRsvp: 'hint-only',
      canonicalReviewState: 'action-center-only',
    })
    expect(draft.emailText).toContain('Leg reviewuitkomst en vervolg alleen in Action Center vast.')
    expect(draft.emailHtml).toContain('Open review in Action Center')
  })
})
```

- [ ] **Step 2: Run the new contract test and verify it fails**

Run:

```bash
npx vitest run "lib/action-center-review-invite.test.ts"
```

Expected: FAIL because `frontend/lib/action-center-review-invite.ts` does not exist yet.

- [ ] **Step 3: Implement the shared review invite draft helper**

```ts
// frontend/lib/action-center-review-invite.ts
import { buildActionCenterEntryHref, type ActionCenterEntrySource } from '@/lib/action-center-entry'

export type ActionCenterReviewInviteEligibilityReason =
  | 'unsupported-scan-type'
  | 'missing-review-date'
  | 'missing-manager-email'
  | 'closed-route'

export interface ActionCenterReviewInviteContext {
  reviewItemId: string
  routeId: string
  campaignId: string
  campaignName: string
  scanType: string
  organizationName: string
  scopeLabel: string
  routeTitle: string
  managerName: string | null
  managerEmail: string | null
  reviewDate: string | null
  reviewReason: string | null
  routeStatus: 'open-verzoek' | 'te-bespreken' | 'reviewbaar' | 'in-uitvoering' | 'geblokkeerd' | 'afgerond' | 'gestopt'
  actionCenterBaseUrl: string
  source: Extract<ActionCenterEntrySource, 'notification'>
  organizerMode: 'verisight-mailbox' | 'hr-shared-mailbox'
}

export interface ActionCenterReviewInviteDraft {
  reviewItemId: string
  routeId: string
  campaignId: string
  recipientEmail: string
  recipientName: string | null
  subject: string
  actionCenterHref: string
  emailText: string
  emailHtml: string
  reviewDate: string
  deliveryModel: {
    channel: 'email-ics'
    organizerMode: 'verisight-mailbox' | 'hr-shared-mailbox'
    nativeMicrosoftRequired: false
  }
  writePolicy: {
    calendarRsvp: 'hint-only'
    canonicalReviewState: 'action-center-only'
  }
}

function isClosedRouteStatus(status: ActionCenterReviewInviteContext['routeStatus']) {
  return status === 'afgerond' || status === 'gestopt'
}

export function getActionCenterReviewInviteEligibility(context: ActionCenterReviewInviteContext) {
  if (context.scanType !== 'exit') {
    return { ok: false as const, reason: 'unsupported-scan-type' as const }
  }

  if (!context.reviewDate?.trim()) {
    return { ok: false as const, reason: 'missing-review-date' as const }
  }

  if (!context.managerEmail?.trim()) {
    return { ok: false as const, reason: 'missing-manager-email' as const }
  }

  if (isClosedRouteStatus(context.routeStatus)) {
    return { ok: false as const, reason: 'closed-route' as const }
  }

  return { ok: true as const, reason: null }
}

function buildAbsoluteActionCenterHref(context: ActionCenterReviewInviteContext) {
  return new URL(
    buildActionCenterEntryHref({
      focus: context.reviewItemId,
      view: 'reviews',
      source: context.source,
    }),
    context.actionCenterBaseUrl,
  ).toString()
}

export function buildActionCenterReviewInviteDraft(
  context: ActionCenterReviewInviteContext,
): ActionCenterReviewInviteDraft {
  const eligibility = getActionCenterReviewInviteEligibility(context)
  if (!eligibility.ok) {
    throw new Error(`Review invite is not eligible: ${eligibility.reason}`)
  }

  const actionCenterHref = buildAbsoluteActionCenterHref(context)
  const subject = `Reviewmoment ${context.campaignName} / ${context.scopeLabel}`
  const recipientName = context.managerName?.trim() || null
  const emailText = [
    recipientName ? `Hallo ${recipientName},` : 'Hallo,',
    '',
    `Voor ${context.organizationName} staat een reviewmoment klaar voor ${context.scopeLabel}.`,
    context.reviewReason?.trim() || 'Lees terug wat is afgesproken en bevestig de vervolgstap in Action Center.',
    '',
    `Open review in Action Center: ${actionCenterHref}`,
    'Leg reviewuitkomst en vervolg alleen in Action Center vast.',
  ].join('\n')
  const emailHtml = [
    `<p>${recipientName ? `Hallo ${recipientName},` : 'Hallo,'}</p>`,
    `<p>Voor <strong>${context.organizationName}</strong> staat een reviewmoment klaar voor <strong>${context.scopeLabel}</strong>.</p>`,
    `<p>${context.reviewReason?.trim() || 'Lees terug wat is afgesproken en bevestig de vervolgstap in Action Center.'}</p>`,
    `<p><a href="${actionCenterHref}">Open review in Action Center</a></p>`,
    '<p>Leg reviewuitkomst en vervolg alleen in Action Center vast.</p>',
  ].join('')

  return {
    reviewItemId: context.reviewItemId,
    routeId: context.routeId,
    campaignId: context.campaignId,
    recipientEmail: context.managerEmail!.trim().toLowerCase(),
    recipientName,
    subject,
    actionCenterHref,
    emailText,
    emailHtml,
    reviewDate: context.reviewDate!.trim(),
    deliveryModel: {
      channel: 'email-ics',
      organizerMode: context.organizerMode,
      nativeMicrosoftRequired: false,
    },
    writePolicy: {
      calendarRsvp: 'hint-only',
      canonicalReviewState: 'action-center-only',
    },
  }
}
```

- [ ] **Step 4: Run the contract tests again and verify they pass**

Run:

```bash
npx vitest run "lib/action-center-review-invite.test.ts"
```

Expected: PASS

- [ ] **Step 5: Commit the shared invite contract**

```bash
git add frontend/lib/action-center-review-invite.ts frontend/lib/action-center-review-invite.test.ts
git commit -m "feat(action-center): add review invite draft contract"
```

---

### Task 2: Add ICS Serialization for Request and Cancel Invite Artifacts

**Files:**
- Create: `frontend/lib/action-center-review-invite-ics.ts`
- Create: `frontend/lib/action-center-review-invite-ics.test.ts`

- [ ] **Step 1: Write the failing ICS tests**

```ts
// frontend/lib/action-center-review-invite-ics.test.ts
import { describe, expect, it } from 'vitest'
import { buildActionCenterReviewInviteDraft } from './action-center-review-invite'
import { renderActionCenterReviewInviteIcs } from './action-center-review-invite-ics'

const draft = buildActionCenterReviewInviteDraft({
  reviewItemId: 'cmp-exit-1::org-1::department::operations',
  routeId: 'cmp-exit-1::org-1::department::operations',
  campaignId: 'cmp-exit-1',
  campaignName: 'ExitScan Q2',
  scanType: 'exit',
  organizationName: 'Northwind',
  scopeLabel: 'Operations',
  routeTitle: 'Begrens verloop in operations',
  managerName: 'Mila Jansen',
  managerEmail: 'mila@northwind.example',
  reviewDate: '2026-05-28',
  reviewReason: 'Toets of de eerste managementactie effect laat zien.',
  routeStatus: 'reviewbaar',
  actionCenterBaseUrl: 'https://app.verisight.nl',
  source: 'notification',
  organizerMode: 'verisight-mailbox',
})

describe('action center review invite ics', () => {
  it('renders a REQUEST invite as an all-day local review event for date-only review dates', () => {
    const ics = renderActionCenterReviewInviteIcs({
      draft,
      method: 'REQUEST',
      revision: 2,
      organizerEmail: 'noreply@verisight.nl',
    })

    expect(ics).toContain('METHOD:REQUEST')
    expect(ics).toContain('UID:ac-review-cmp-exit-1::org-1::department::operations@verisight.nl')
    expect(ics).toContain('SEQUENCE:2')
    expect(ics).toContain('DTSTART;VALUE=DATE:20260528')
    expect(ics).toContain('DTEND;VALUE=DATE:20260529')
    expect(ics).toContain('ATTENDEE;CN=Mila Jansen:mailto:mila@northwind.example')
    expect(ics).toContain('Open review in Action Center')
  })

  it('renders a CANCEL invite with the same UID and a higher sequence', () => {
    const ics = renderActionCenterReviewInviteIcs({
      draft,
      method: 'CANCEL',
      revision: 3,
      organizerEmail: 'noreply@verisight.nl',
    })

    expect(ics).toContain('METHOD:CANCEL')
    expect(ics).toContain('STATUS:CANCELLED')
    expect(ics).toContain('SEQUENCE:3')
    expect(ics).toContain('UID:ac-review-cmp-exit-1::org-1::department::operations@verisight.nl')
  })
})
```

- [ ] **Step 2: Run the new ICS test and verify it fails**

Run:

```bash
npx vitest run "lib/action-center-review-invite-ics.test.ts"
```

Expected: FAIL because `frontend/lib/action-center-review-invite-ics.ts` does not exist yet.

- [ ] **Step 3: Implement the ICS serializer**

```ts
// frontend/lib/action-center-review-invite-ics.ts
import type { ActionCenterReviewInviteDraft } from './action-center-review-invite'

function escapeIcsText(value: string) {
  return value.replace(/\\/g, '\\\\').replace(/\n/g, '\\n').replace(/,/g, '\\,').replace(/;/g, '\\;')
}

function toIcsDateOnly(value: string) {
  return value.replace(/-/g, '')
}

function addOneDay(value: string) {
  const [year, month, day] = value.split('-').map(Number)
  const next = new Date(Date.UTC(year, month - 1, day + 1))
  return `${next.getUTCFullYear()}${String(next.getUTCMonth() + 1).padStart(2, '0')}${String(next.getUTCDate()).padStart(2, '0')}`
}

function buildReviewInviteUid(routeId: string) {
  return `ac-review-${routeId}@verisight.nl`
}

export function renderActionCenterReviewInviteIcs(args: {
  draft: ActionCenterReviewInviteDraft
  method: 'REQUEST' | 'CANCEL'
  revision: number
  organizerEmail: string
}) {
  const uid = buildReviewInviteUid(args.draft.routeId)
  const dtStamp = new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d{3}Z$/, 'Z')
  const startDate = toIcsDateOnly(args.draft.reviewDate)
  const endDate = addOneDay(args.draft.reviewDate)
  const description = escapeIcsText(`${args.draft.emailText}\n\nOpen review in Action Center: ${args.draft.actionCenterHref}`)

  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Verisight//Action Center//NL',
    `METHOD:${args.method}`,
    'BEGIN:VEVENT',
    `UID:${uid}`,
    `DTSTAMP:${dtStamp}`,
    `SEQUENCE:${args.revision}`,
    `SUMMARY:${escapeIcsText(args.draft.subject)}`,
    `DESCRIPTION:${description}`,
    `URL:${args.draft.actionCenterHref}`,
    `DTSTART;VALUE=DATE:${startDate}`,
    `DTEND;VALUE=DATE:${endDate}`,
    `ORGANIZER:mailto:${args.organizerEmail}`,
    `ATTENDEE;CN=${escapeIcsText(args.draft.recipientName ?? args.draft.recipientEmail)}:mailto:${args.draft.recipientEmail}`,
    args.method === 'CANCEL' ? 'STATUS:CANCELLED' : 'STATUS:CONFIRMED',
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n')
}
```

- [ ] **Step 4: Run the ICS tests again and verify they pass**

Run:

```bash
npx vitest run "lib/action-center-review-invite.test.ts" "lib/action-center-review-invite-ics.test.ts"
```

Expected: PASS

- [ ] **Step 5: Commit the ICS contract**

```bash
git add frontend/lib/action-center-review-invite-ics.ts frontend/lib/action-center-review-invite-ics.test.ts
git commit -m "feat(action-center): add review invite ics renderer"
```

---

### Task 3: Add the Bounded Review Invite Preview and Download API

**Files:**
- Create: `frontend/app/api/action-center-review-invites/invite-helpers.ts`
- Create: `frontend/app/api/action-center-review-invites/route.ts`
- Create: `frontend/app/api/action-center-review-invites/route.test.ts`

- [ ] **Step 1: Write the failing API tests**

```ts
// frontend/app/api/action-center-review-invites/route.test.ts
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { GET, POST } from './route'

const mockItem = {
  id: 'cmp-exit-1::org-1::department::operations',
  orgId: 'org-1',
  title: 'Begrens verloop in operations',
  teamLabel: 'Operations',
  reviewDate: '2026-05-28',
  reviewReason: 'Toets of de eerste managementactie effect laat zien.',
  status: 'reviewbaar',
  sourceLabel: 'ExitScan',
  coreSemantics: {
    route: {
      routeId: 'cmp-exit-1::org-1::department::operations',
      campaignId: 'cmp-exit-1',
    },
  },
} as const

const mockAccess = {
  context: {
    canViewActionCenter: true,
    canManageActionCenterAssignments: true,
    organizationIds: ['org-1'],
    workspaceOrgIds: ['org-1'],
  },
  orgMemberships: [{ org_id: 'org-1', role: 'owner' }],
  workspaceMemberships: [],
}

const mockState = {
  user: { id: 'user-1', email: 'hr@northwind.example' },
  managerEmail: 'mila@northwind.example',
  managerName: 'Mila Jansen',
}

vi.mock('@/lib/supabase/server', () => ({
  createClient: async () => ({
    auth: {
      getUser: async () => ({
        data: { user: mockState.user },
      }),
    },
  }),
}))

vi.mock('@/lib/suite-access-server', () => ({
  loadSuiteAccessContext: async () => mockAccess,
}))

vi.mock('@/lib/action-center-page-data', () => ({
  getActionCenterPageData: async () => ({
    items: [mockItem],
    summary: { productCount: 1 },
    ownerOptions: [],
    managerOptions: [],
    itemHrefs: {},
    organizationNames: ['Northwind'],
  }),
}))

vi.mock('@/lib/supabase/admin', () => ({
  createAdminClient: () => ({
    from: (table: string) => {
      if (table === 'campaigns') {
        return {
          select: () => ({
            eq: () => ({
              maybeSingle: async () => ({
                data: {
                  id: 'cmp-exit-1',
                  name: 'ExitScan Q2',
                  scan_type: 'exit',
                  organization_id: 'org-1',
                },
                error: null,
              }),
            }),
          }),
        }
      }

      if (table === 'organizations') {
        return {
          select: () => ({
            eq: () => ({
              maybeSingle: async () => ({
                data: {
                  id: 'org-1',
                  name: 'Northwind',
                },
                error: null,
              }),
            }),
          }),
        }
      }

      if (table === 'action_center_workspace_members') {
        return {
          select: () => ({
            eq: () => ({
              eq: () => ({
                eq: () => ({
                  maybeSingle: async () => ({
                    data: {
                      login_email: mockState.managerEmail,
                      display_name: mockState.managerName,
                    },
                    error: null,
                  }),
                }),
              }),
            }),
          }),
        }
      }

      throw new Error(`Unhandled table ${table}`)
    },
  }),
}))

describe('action center review invite route', () => {
  beforeEach(() => {
    mockState.user = { id: 'user-1', email: 'hr@northwind.example' }
    mockState.managerEmail = 'mila@northwind.example'
    mockState.managerName = 'Mila Jansen'
  })

  it('returns preview json with bounded delivery metadata', async () => {
    const response = await POST(
      new Request('https://app.verisight.nl/api/action-center-review-invites', {
        method: 'POST',
        body: JSON.stringify({
          reviewItemId: mockItem.id,
          revision: 2,
          organizerMode: 'verisight-mailbox',
        }),
      }),
    )

    expect(response.status).toBe(200)
    const payload = await response.json()
    expect(payload.subject).toBe('Reviewmoment ExitScan Q2 / Operations')
    expect(payload.deliveryModel.channel).toBe('email-ics')
    expect(payload.writePolicy.calendarRsvp).toBe('hint-only')
    expect(payload.actionCenterHref).toContain('/action-center?focus=')
  })

  it('returns a downloadable .ics artifact on GET', async () => {
    const response = await GET(
      new Request(
        `https://app.verisight.nl/api/action-center-review-invites?reviewItemId=${encodeURIComponent(mockItem.id)}&revision=3&mode=request&format=ics`,
      ),
    )

    expect(response.status).toBe(200)
    expect(response.headers.get('content-type')).toContain('text/calendar')
    expect(response.headers.get('content-disposition')).toContain('.ics')
    const body = await response.text()
    expect(body).toContain('METHOD:REQUEST')
    expect(body).toContain('SEQUENCE:3')
  })

  it('returns 409 when the selected review item has no manager email', async () => {
    mockState.managerEmail = ''

    const response = await POST(
      new Request('https://app.verisight.nl/api/action-center-review-invites', {
        method: 'POST',
        body: JSON.stringify({
          reviewItemId: mockItem.id,
        }),
      }),
    )

    expect(response.status).toBe(409)
    expect(await response.json()).toEqual({
      detail: 'Reviewuitnodiging kan nog niet worden opgebouwd: missing-manager-email.',
    })
  })
})
```

- [ ] **Step 2: Run the new API test and verify it fails**

Run:

```bash
npx vitest run "app/api/action-center-review-invites/route.test.ts"
```

Expected: FAIL because the route and helper files do not exist yet.

- [ ] **Step 3: Implement the lookup helper and bounded route handler**

```ts
// frontend/app/api/action-center-review-invites/invite-helpers.ts
import { headers } from 'next/headers'
import { createAdminClient } from '@/lib/supabase/admin'
import { getActionCenterPageData } from '@/lib/action-center-page-data'
import { type ActionCenterReviewInviteContext } from '@/lib/action-center-review-invite'
import { loadSuiteAccessContext } from '@/lib/suite-access-server'
import { createClient } from '@/lib/supabase/server'

function parseScopeValueFromRouteId(routeId: string, campaignId: string) {
  const prefix = `${campaignId}::`
  return routeId.startsWith(prefix) ? routeId.slice(prefix.length) : null
}

export async function getCanonicalInviteOrigin(request: Request) {
  const configured =
    process.env.FRONTEND_URL ??
    process.env.NEXT_PUBLIC_SITE_URL ??
    process.env.NEXT_PUBLIC_APP_URL

  if (configured) {
    return configured.replace(/\/+$/, '')
  }

  const headerStore = await headers()
  const forwardedHost = headerStore.get('x-forwarded-host')
  const forwardedProto = headerStore.get('x-forwarded-proto') ?? 'https'

  if (forwardedHost && !forwardedHost.includes('localhost')) {
    return `${forwardedProto}://${forwardedHost}`
  }

  return new URL(request.url).origin
}

export async function resolveReviewInviteContext(request: Request, reviewItemId: string, organizerMode: 'verisight-mailbox' | 'hr-shared-mailbox') {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: { status: 401, detail: 'Niet ingelogd.' } }
  }

  const suiteAccess = await loadSuiteAccessContext(supabase, user.id)
  if (!suiteAccess.context.canViewActionCenter) {
    return { error: { status: 403, detail: 'Geen toegang tot Action Center.' } }
  }

  const pageData = await getActionCenterPageData({
    context: suiteAccess.context,
    orgMemberships: suiteAccess.orgMemberships,
    currentUserWorkspaceMemberships: suiteAccess.workspaceMemberships,
  })

  const item = pageData.items.find((candidate) => candidate.id === reviewItemId)
  if (!item) {
    return { error: { status: 404, detail: 'Reviewmoment niet gevonden.' } }
  }

  const campaignId = item.coreSemantics.route.campaignId
  const routeId = item.coreSemantics.route.routeId
  const scopeValue = parseScopeValueFromRouteId(routeId, campaignId)
  if (!scopeValue || !item.orgId) {
    return { error: { status: 409, detail: 'Reviewuitnodiging kan nog niet worden opgebouwd: missing-route-scope.' } }
  }

  const admin = createAdminClient()
  const [{ data: campaign }, { data: organization }, { data: managerMembership }] = await Promise.all([
    admin.from('campaigns').select('id, name, scan_type, organization_id').eq('id', campaignId).maybeSingle(),
    admin.from('organizations').select('id, name').eq('id', item.orgId).maybeSingle(),
    admin
      .from('action_center_workspace_members')
      .select('login_email, display_name')
      .eq('org_id', item.orgId)
      .eq('access_role', 'manager_assignee')
      .eq('scope_value', scopeValue)
      .maybeSingle(),
  ])

  const context: ActionCenterReviewInviteContext = {
    reviewItemId: item.id,
    routeId,
    campaignId,
    campaignName: campaign?.name ?? item.sourceLabel,
    scanType: campaign?.scan_type ?? 'unknown',
    organizationName: organization?.name ?? 'Verisight organisatie',
    scopeLabel: item.teamLabel,
    routeTitle: item.title,
    managerName: managerMembership?.display_name ?? null,
    managerEmail: managerMembership?.login_email ?? null,
    reviewDate: item.reviewDate,
    reviewReason: item.reviewReason,
    routeStatus: item.status,
    actionCenterBaseUrl: await getCanonicalInviteOrigin(request),
    source: 'notification',
    organizerMode,
  }

  return { context }
}
```

```ts
// frontend/app/api/action-center-review-invites/route.ts
import { NextResponse } from 'next/server'
import { buildActionCenterReviewInviteDraft, getActionCenterReviewInviteEligibility } from '@/lib/action-center-review-invite'
import { renderActionCenterReviewInviteIcs } from '@/lib/action-center-review-invite-ics'
import { resolveReviewInviteContext } from './invite-helpers'

function getRevision(value: string | null) {
  const parsed = Number.parseInt(value ?? '0', 10)
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : 0
}

function getMode(value: string | null) {
  return value === 'cancel' ? 'CANCEL' : 'REQUEST'
}

export async function POST(request: Request) {
  const body = (await request.json()) as {
    reviewItemId?: string
    revision?: number
    organizerMode?: 'verisight-mailbox' | 'hr-shared-mailbox'
  }

  if (!body.reviewItemId?.trim()) {
    return NextResponse.json({ detail: 'reviewItemId is verplicht.' }, { status: 400 })
  }

  const resolved = await resolveReviewInviteContext(request, body.reviewItemId.trim(), body.organizerMode ?? 'verisight-mailbox')
  if ('error' in resolved) {
    return NextResponse.json({ detail: resolved.error.detail }, { status: resolved.error.status })
  }

  const eligibility = getActionCenterReviewInviteEligibility(resolved.context)
  if (!eligibility.ok) {
    return NextResponse.json(
      { detail: `Reviewuitnodiging kan nog niet worden opgebouwd: ${eligibility.reason}.` },
      { status: 409 },
    )
  }

  const draft = buildActionCenterReviewInviteDraft(resolved.context)
  return NextResponse.json({
    ...draft,
    revision: typeof body.revision === 'number' ? body.revision : 0,
  })
}

export async function GET(request: Request) {
  const url = new URL(request.url)
  const reviewItemId = url.searchParams.get('reviewItemId')

  if (!reviewItemId?.trim()) {
    return NextResponse.json({ detail: 'reviewItemId is verplicht.' }, { status: 400 })
  }

  const resolved = await resolveReviewInviteContext(request, reviewItemId.trim(), 'verisight-mailbox')
  if ('error' in resolved) {
    return NextResponse.json({ detail: resolved.error.detail }, { status: resolved.error.status })
  }

  const eligibility = getActionCenterReviewInviteEligibility(resolved.context)
  if (!eligibility.ok) {
    return NextResponse.json(
      { detail: `Reviewuitnodiging kan nog niet worden opgebouwd: ${eligibility.reason}.` },
      { status: 409 },
    )
  }

  const draft = buildActionCenterReviewInviteDraft(resolved.context)
  const revision = getRevision(url.searchParams.get('revision'))
  const method = getMode(url.searchParams.get('mode'))
  const format = url.searchParams.get('format')

  if (format !== 'ics') {
    return NextResponse.json({
      ...draft,
      revision,
      method,
    })
  }

  const ics = renderActionCenterReviewInviteIcs({
    draft,
    method,
    revision,
    organizerEmail: 'noreply@verisight.nl',
  })

  return new Response(ics, {
    status: 200,
    headers: {
      'content-type': 'text/calendar; charset=utf-8',
      'content-disposition': `attachment; filename=\"action-center-review-${draft.campaignId}.ics\"`,
    },
  })
}
```

- [ ] **Step 4: Re-run the API tests**

Run:

```bash
npx vitest run "app/api/action-center-review-invites/route.test.ts" "lib/action-center-review-invite.test.ts" "lib/action-center-review-invite-ics.test.ts"
```

Expected: PASS

- [ ] **Step 5: Commit the bounded preview/download route**

```bash
git add frontend/app/api/action-center-review-invites/invite-helpers.ts frontend/app/api/action-center-review-invites/route.ts frontend/app/api/action-center-review-invites/route.test.ts
git commit -m "feat(action-center): add review invite preview route"
```

---

### Task 4: Add the Review-Detail CTA for Invite Preview and ICS Download

**Files:**
- Modify: `frontend/components/dashboard/review-moment-detail-panel.tsx`
- Modify: `frontend/components/dashboard/review-moment-detail-panel.test.ts`

- [ ] **Step 1: Write the failing review-detail CTA tests**

```ts
// frontend/components/dashboard/review-moment-detail-panel.test.ts
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { ReviewMomentDetailPanel } from './review-moment-detail-panel'

describe('review moment detail panel invite CTA', () => {
  it('keeps the invite CTA bounded to the review-invite route', () => {
    const source = readFileSync(new URL('./review-moment-detail-panel.tsx', import.meta.url), 'utf8')

    expect(source).toContain('/api/action-center-review-invites?reviewItemId=')
    expect(source).toContain('Download .ics')
    expect(source).not.toContain('Verstuur uitnodiging')
  })

  it('renders the ics link only when a review date exists', () => {
    const markup = renderToStaticMarkup(
      createElement(ReviewMomentDetailPanel, {
        urgency: 'this-week',
        item: {
          id: 'cmp-exit-1::org-1::department::operations',
          code: 'AC-1',
          title: 'Begrens verloop in operations',
          summary: 'Compacte route',
          reason: 'Lees terug',
          sourceLabel: 'ExitScan',
          orgId: 'org-1',
          scopeType: 'department',
          teamId: 'operations',
          teamLabel: 'Operations',
          ownerId: 'manager-1',
          ownerName: 'Mila Jansen',
          ownerRole: 'Manager',
          ownerSubtitle: 'Operations',
          reviewOwnerName: 'Mila Jansen',
          priority: 'hoog',
          status: 'reviewbaar',
          reviewDate: '2026-05-28',
          expectedEffect: null,
          reviewReason: 'Toets effect',
          reviewOutcome: 'geen-uitkomst',
          reviewDateLabel: '28 mei',
          reviewRhythm: 'Tweewekelijks',
          signalLabel: 'Open review',
          signalBody: 'Open review',
          nextStep: 'Open review',
          peopleCount: 12,
          coreSemantics: {
            route: {
              routeId: 'cmp-exit-1::org-1::department::operations',
              campaignId: 'cmp-exit-1',
            },
          },
          openSignals: [],
          updates: [],
        },
      }),
    )

    expect(markup).toContain('Download .ics')
    expect(markup).toContain('reviewItemId=cmp-exit-1%3A%3Aorg-1%3A%3Adepartment%3A%3Aoperations')
  })
})
```

- [ ] **Step 2: Run the review-detail test and verify it fails**

Run:

```bash
npx vitest run "components/dashboard/review-moment-detail-panel.test.ts"
```

Expected: FAIL because the detail panel does not yet expose the download link for the invite artifact.

- [ ] **Step 3: Implement the bounded CTA**

```tsx
// frontend/components/dashboard/review-moment-detail-panel.tsx
function buildReviewInviteDownloadHref(reviewItemId: string) {
  return `/api/action-center-review-invites?reviewItemId=${encodeURIComponent(reviewItemId)}&mode=request&format=ics`
}

// ... inside ReviewMomentDetailPanel

      <div className="flex flex-wrap gap-2">
        <Link
          href={buildActionCenterEntryHref({
            focus: item.id,
            view: 'reviews',
            source: 'review-moments',
          })}
          className="rounded-full border border-[color:var(--dashboard-frame-border)] bg-white px-3 py-2 text-xs font-semibold text-[color:var(--dashboard-ink)] transition hover:bg-[color:var(--dashboard-muted-surface)]"
        >
          Bekijk gekoppelde opvolging
        </Link>
        {item.reviewDate ? (
          <Link
            href={buildReviewInviteDownloadHref(item.id)}
            className="rounded-full border border-[color:var(--dashboard-frame-border)] bg-white px-3 py-2 text-xs font-semibold text-[color:var(--dashboard-ink)] transition hover:bg-[color:var(--dashboard-muted-surface)]"
          >
            Download .ics
          </Link>
        ) : null}
      </div>
```

- [ ] **Step 4: Re-run the review-detail tests and the invite route regression**

Run:

```bash
npx vitest run "components/dashboard/review-moment-detail-panel.test.ts" "app/api/action-center-review-invites/route.test.ts" "lib/action-center-review-invite.test.ts" "lib/action-center-review-invite-ics.test.ts"
```

Expected: PASS

- [ ] **Step 5: Commit the review-detail CTA**

```bash
git add frontend/components/dashboard/review-moment-detail-panel.tsx frontend/components/dashboard/review-moment-detail-panel.test.ts
git commit -m "feat(action-center): add review invite download cta"
```

---

## Verification Checklist

- [ ] invite preview only works for ExitScan review items
- [ ] missing manager email blocks preview/download with explicit `409` reason
- [ ] missing review date blocks preview/download with explicit `409` reason
- [ ] preview JSON includes `deliveryModel` and `writePolicy`
- [ ] generated Action Center links use `view=reviews` and `source=notification`
- [ ] generated ICS uses stable UID plus incrementable `SEQUENCE`
- [ ] generated ICS supports `REQUEST` and `CANCEL`
- [ ] no route status, review outcome, closeout, or reopen is writable off-platform
- [ ] no tenant-specific Microsoft Graph dependency is introduced

## Suggested Follow-Up Plan

After this child plan is implemented and verified, the next child plan to write should be:

- `Triggered Follow-Through Mail Layer`

That plan can then safely assume:

- review-invite draft rules exist
- ICS serialization exists
- bounded preview/download API exists
- contextual landing already exists

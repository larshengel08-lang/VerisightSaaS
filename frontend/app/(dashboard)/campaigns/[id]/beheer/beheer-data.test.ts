import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { buildGuidedSelfServeState } from '@/lib/guided-self-serve'
import { buildDeliveryAutoSignals } from '@/lib/ops-delivery'
import {
  buildHrRouteBeheerNowDoing,
  buildRouteBeheerLifecycleSteps,
  fetchRouteBeheerData,
  formatLatestActivityLabel,
  formatRoutePeriodLabel,
  getLatestActivityTimestamp,
  mapGuidedPhaseToHrRoutePhase,
} from './beheer-data'

function createSupabaseMock() {
  const queryResults = new Map<string, unknown>([
    [
      'campaign_stats|*',
      {
        data: {
          campaign_id: 'campaign-1',
          organization_id: 'org-1',
          campaign_name: 'Exit Q3 2026',
          scan_type: 'exit',
          is_active: true,
          total_invited: 12,
          total_completed: 6,
          completion_rate_pct: 50,
          created_at: '2026-05-01T08:00:00.000Z',
        },
      },
    ],
    ['profiles|is_verisight_admin', { data: { is_verisight_admin: false } }],
    ['org_members|role', { data: { role: 'owner' } }],
    ['organizations|name', { data: { name: 'Acme HR' } }],
    ['campaigns|delivery_mode, created_at', { data: { delivery_mode: 'guided_self_serve', created_at: '2026-05-01T08:00:00.000Z' } }],
    ['org_members|id', { count: 4 }],
    ['org_invites|id', { count: 1 }],
    [
      'campaign_delivery_records|*',
      {
        data: {
          id: 'delivery-1',
          campaign_id: 'campaign-1',
          lifecycle_stage: 'first_value_reached',
          launch_date: '2026-05-10T08:00:00.000Z',
          launch_confirmed_at: '2026-05-10T08:00:00.000Z',
          updated_at: '2026-05-12T09:30:00.000Z',
          contact_request_id: 'contact-1',
        },
      },
    ],
    [
      'respondents|id, sent_at, completed, completed_at',
      {
        data: [
          { id: 'r1', sent_at: '2026-05-10T10:00:00.000Z', completed: true, completed_at: '2026-05-11T10:00:00.000Z' },
          { id: 'r2', sent_at: '2026-05-10T10:00:00.000Z', completed: true, completed_at: '2026-05-11T11:00:00.000Z' },
          { id: 'r3', sent_at: '2026-05-10T10:00:00.000Z', completed: true, completed_at: '2026-05-11T12:00:00.000Z' },
          { id: 'r4', sent_at: '2026-05-10T10:00:00.000Z', completed: true, completed_at: '2026-05-11T13:00:00.000Z' },
          { id: 'r5', sent_at: '2026-05-10T10:00:00.000Z', completed: true, completed_at: '2026-05-11T14:00:00.000Z' },
          { id: 'r6', sent_at: '2026-05-10T10:00:00.000Z', completed: true, completed_at: '2026-05-11T15:00:00.000Z' },
          { id: 'r7', sent_at: '2026-05-10T10:00:00.000Z', completed: false, completed_at: null },
          { id: 'r8', sent_at: '2026-05-10T10:00:00.000Z', completed: false, completed_at: null },
          { id: 'r9', sent_at: '2026-05-10T10:00:00.000Z', completed: false, completed_at: null },
          { id: 'r10', sent_at: '2026-05-10T10:00:00.000Z', completed: false, completed_at: null },
          { id: 'r11', sent_at: '2026-05-10T10:00:00.000Z', completed: false, completed_at: null },
          { id: 'r12', sent_at: '2026-05-10T10:00:00.000Z', completed: false, completed_at: null },
        ],
      },
    ],
    [
      'survey_responses|id, org_scores, sdt_scores, respondents!inner(campaign_id)',
      {
        data: Array.from({ length: 6 }, (_, index) => ({
          id: `response-${index + 1}`,
          org_scores: { engagement: 7.2 },
          sdt_scores: { autonomy: 6.9 },
        })),
      },
    ],
    [
      'campaign_action_audit_events|id, action_key, outcome, action_label, owner_label, actor_role, actor_label, summary, metadata, created_at',
      {
        data: [
          {
            id: 'audit-1',
            action_key: 'launch_invites',
            outcome: 'completed',
            action_label: 'Invites launched',
            owner_label: 'HR',
            actor_role: 'owner',
            actor_label: 'Alex',
            summary: 'Invites zijn verstuurd',
            metadata: {},
            created_at: '2026-05-12T08:00:00.000Z',
          },
        ],
      },
    ],
    [
      'campaign_delivery_checkpoints|*',
      {
        data: [
          {
            checkpoint_key: 'implementation_intake',
            manual_state: 'confirmed',
            auto_state: 'ready',
            created_at: '2026-05-02T09:00:00.000Z',
          },
          {
            checkpoint_key: 'import_qa',
            manual_state: 'confirmed',
            auto_state: 'ready',
            created_at: '2026-05-03T09:00:00.000Z',
          },
          {
            checkpoint_key: 'invite_readiness',
            manual_state: 'confirmed',
            auto_state: 'ready',
            created_at: '2026-05-04T09:00:00.000Z',
          },
        ],
      },
    ],
  ])

  function createQuery(table: string) {
    let selectClause = ''

    const resolveResult = () => {
      const key = `${table}|${selectClause}`
      if (!queryResults.has(key)) {
        throw new Error(`Missing mock result for ${key}`)
      }

      return queryResults.get(key)
    }

    const query = {
      select(value: string) {
        selectClause = value
        return query
      },
      eq() {
        return query
      },
      in() {
        return query
      },
      is() {
        return query
      },
      order() {
        return query
      },
      limit() {
        return query
      },
      maybeSingle() {
        return Promise.resolve(resolveResult())
      },
      single() {
        return Promise.resolve(resolveResult())
      },
      then(onFulfilled?: (value: unknown) => unknown, onRejected?: (reason: unknown) => unknown) {
        return Promise.resolve(resolveResult()).then(onFulfilled, onRejected)
      },
    }

    return query
  }

  return {
    from(table: string) {
      return createQuery(table)
    },
  }
}

describe('routebeheer data helpers', () => {
  it('copies the quarter label from the campaign name when available', () => {
    expect(formatRoutePeriodLabel('Exit Q3 2026', '2026-01-15T10:00:00.000Z')).toBe('Q3 2026')
  })

  it('prefers the newest timestamp between audit and delivery update', () => {
    expect(
      getLatestActivityTimestamp(
        [{ action_key: 'launch_invites', outcome: 'completed', action_label: 'x', owner_label: 'y', actor_role: null, actor_label: null, summary: 'done', metadata: {}, created_at: '2026-05-03T09:00:00.000Z' }],
        '2026-05-03T10:00:00.000Z',
      ),
    ).toBe('2026-05-03T10:00:00.000Z')
  })

  it('maps all delivery stages into the fixed six-step lifecycle', () => {
    const stages = [
      'setup_in_progress',
      'import_cleared',
      'invites_live',
      'client_activation_pending',
      'client_activation_confirmed',
      'first_value_reached',
      'first_management_use',
      'follow_up_decided',
      'learning_closed',
    ] as const

    const results = stages.map((stage) =>
      buildRouteBeheerLifecycleSteps({
        stage,
        isActive: true,
        hasMinDisplay: true,
        hasEnoughData: true,
      }),
    )

    expect(results[0][0]?.status).toBe('current')
    expect(results[1][1]?.status).toBe('current')
    expect(results[2][2]?.status).toBe('current')
    expect(results[3][2]?.status).toBe('current')
    expect(results[4][3]?.status).toBe('current')
    expect(results[5][3]?.status).toBe('current')
    expect(results[6][4]?.status).toBe('current')
    expect(results[7][4]?.status).toBe('current')
    expect(results[8][5]?.status).toBe('current')
  })

  it('formats latest activity in Dutch routebeheer copy', () => {
    expect(formatLatestActivityLabel('2026-05-01T08:00:00.000Z')).toContain('Laatste activiteit:')
  })

  it('keeps missing import readiness explicit instead of treating it as not ready', () => {
    const signals = buildDeliveryAutoSignals({
      scanType: 'exit',
      linkedLeadPresent: false,
      totalInvited: 0,
      totalCompleted: 0,
      invitesNotSent: 0,
      incompleteScores: 0,
      hasMinDisplay: false,
      hasEnoughData: false,
      activeClientAccessCount: 0,
      pendingClientInviteCount: 0,
      importReady: null,
    })

    expect(signals.import_qa.autoState).toBe('unknown')
    expect(signals.import_qa.summary).toContain('nog niet bekend')
  })

  it('maps guided self-serve phases deterministically into the five hr routebeheer phases', () => {
    expect(mapGuidedPhaseToHrRoutePhase('participant_data_required')).toBe('doelgroep')
    expect(mapGuidedPhaseToHrRoutePhase('import_validation_required')).toBe('doelgroep')
    expect(mapGuidedPhaseToHrRoutePhase('launch_date_required')).toBe('communicatie')
    expect(mapGuidedPhaseToHrRoutePhase('communication_ready')).toBe('communicatie')
    expect(mapGuidedPhaseToHrRoutePhase('ready_to_invite')).toBe('communicatie')
    expect(mapGuidedPhaseToHrRoutePhase('survey_running')).toBe('live')
    expect(mapGuidedPhaseToHrRoutePhase('dashboard_active')).toBe('output')
    expect(mapGuidedPhaseToHrRoutePhase('first_next_step_available')).toBe('output')
    expect(mapGuidedPhaseToHrRoutePhase('closed')).toBe('afronding')
  })

  it('keeps guided nextAction as the single source for the now-doing row', () => {
    const guidedState = buildGuidedSelfServeState({
      isActive: true,
      totalInvited: 12,
      totalCompleted: 0,
      invitesNotSent: 12,
      hasMinDisplay: false,
      hasEnoughData: false,
      importQaConfirmed: true,
      launchTimingConfirmed: true,
      communicationReady: false,
      importReady: true,
    })

    expect(buildHrRouteBeheerNowDoing(guidedState)).toEqual({
      phaseKey: 'communicatie',
      title: guidedState.nextAction.title,
      body: guidedState.nextAction.body,
    })
  })
})

describe('routebeheer source integration', () => {
  it('does not silently coerce unknown import readiness into a false auto-signal', () => {
    const source = readFileSync(new URL('./beheer-data.ts', import.meta.url), 'utf8')

    expect(source).not.toContain('importReady: importReady === true')
  })

  it('keeps a visible routebeheer entrypoint in the dashboard launcher for setup-heavy campaigns', () => {
    const launcherSource = readFileSync(
      new URL('../../../dashboard/home-launcher.ts', import.meta.url),
      'utf8',
    )

    expect(launcherSource).toContain('href: `/campaigns/${campaign.campaign_id}/beheer`')
  })

  it('keeps routebeheer restricted to HR-capable users instead of manager-only action center access', () => {
    const pageSource = readFileSync(new URL('./page.tsx', import.meta.url), 'utf8')

    expect(pageSource).toContain('if (!context.canViewInsights)')
    expect(pageSource).toContain('SuiteAccessDenied')
    expect(pageSource).toContain('Jouw login opent alleen Action Center voor toegewezen teams.')
  })

  it('keeps the operational route free from analytical or action-center detail imports', () => {
    const source = readFileSync(new URL('./route-beheer-components.tsx', import.meta.url), 'utf8')

    expect(source).toContain('Livegang')
    expect(source).toContain('Respons')
    expect(source).toContain('Dashboard leesbaarheid')
    expect(source).toContain('Eerstvolgende stap')
    expect(source).not.toContain('Frictiescore')
    expect(source).not.toContain('SDT')
    expect(source).not.toContain('buildExitNarratives')
    expect(source).not.toContain('buildRetentionNarratives')
    expect(source).not.toContain('ActionPlaybook')
  })

  it('keeps output summary compact while output detail remains owned by the output phase', async () => {
    const data = await fetchRouteBeheerData({
      campaignId: 'campaign-1',
      supabase: createSupabaseMock(),
      userId: 'user-1',
    })

    expect(data?.outputSummary).toEqual({
      dashboardReady: true,
      reportReady: true,
      dashboardHref: '/campaigns/campaign-1',
      reportHref: '/reports',
      label: 'Dashboard leesbaar / Rapport beschikbaar',
    })

    expect(data?.phaseSummaries.find((phase) => phase.key === 'output')).toMatchObject({
      key: 'output',
      status: 'current',
      body: 'Dashboard leesbaar / Rapport beschikbaar',
    })
    expect(data?.phaseDetails.find((phase) => phase.key === 'output')).toMatchObject({
      key: 'output',
      status: 'current',
      body: data?.readabilityBody,
    })
  })

  it('keeps route settings inside the communicatie phase instead of as a top-level standalone block', async () => {
    const data = await fetchRouteBeheerData({
      campaignId: 'campaign-1',
      supabase: createSupabaseMock(),
      userId: 'user-1',
    })

    expect(data?.phaseDetails.map((phase) => phase.key)).toEqual([
      'doelgroep',
      'communicatie',
      'live',
      'output',
      'afronding',
    ])
    expect(data?.phaseDetails.find((phase) => phase.key === 'communicatie')).toMatchObject({
      key: 'communicatie',
      items: [
        { label: 'Route', value: data?.routeSettingsLabel },
        { label: 'Startdatum', value: '10 mei 2026' },
      ],
    })
  })
})

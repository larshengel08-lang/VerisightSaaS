import { renderToString } from 'react-dom/server'
import { describe, expect, it, vi } from 'vitest'

vi.mock('@/lib/supabase/server', () => ({
  createClient: async () => ({
    auth: { getUser: async () => ({ data: { user: { id: 'user_1' } } }) },
    from: () => ({
      select: () => ({
        eq: () => ({
          single: async () => ({ data: { is_verisight_admin: true } }),
        }),
      }),
    }),
  }),
}))

vi.mock('@/lib/telemetry/store', () => ({
  listSuiteTelemetryEventRows: async () => [
    {
      id: 'evt_1',
      eventType: 'owner_access_confirmed',
      orgId: 'org_1',
      campaignId: null,
      actorId: 'user_1',
      payload: {},
      createdAt: '2026-04-27T10:00:00.000Z',
    },
    {
      id: 'evt_2',
      eventType: 'manager_denied_insights',
      orgId: 'org_1',
      campaignId: 'cmp_1',
      actorId: 'user_2',
      payload: {},
      createdAt: '2026-04-27T11:00:00.000Z',
    },
    {
      id: 'evt_3',
      eventType: 'action_center_route_opened',
      orgId: 'org_1',
      campaignId: 'cmp_1',
      actorId: 'user_2',
      payload: {},
      createdAt: '2026-04-27T11:30:00.000Z',
    },
    {
      id: 'evt_4',
      eventType: 'action_center_review_scheduled',
      orgId: 'org_1',
      campaignId: 'cmp_1',
      actorId: 'user_2',
      payload: {},
      createdAt: '2026-04-27T11:45:00.000Z',
    },
  ],
}))

import HealthPage from './page'

describe('beheer health page', () => {
  it('renders the suite health evidence surface', async () => {
    const html = renderToString(await HealthPage())
    expect(html).toContain('Suite health evidence')
    expect(html).toContain('Owner access confirmed')
    expect(html).toContain('Manager denied insights')
    expect(html).toContain('Action Center pilot-ops')
    expect(html).toContain('Kritieke flow coverage')
    expect(html).toContain('Route geopend, Review gepland zichtbaar in de huidige telemetryset.')
    expect(html).toContain('Recente evidence')
  })
})

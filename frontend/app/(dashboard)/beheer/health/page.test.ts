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

import HealthPage from './page'

describe('beheer health page', () => {
  it('renders the suite health evidence surface', async () => {
    const html = renderToString(await HealthPage())
    expect(html).toContain('Suite health evidence')
    expect(html).toContain('Owner access confirmed')
    expect(html).toContain('Manager denied insights')
  })
})

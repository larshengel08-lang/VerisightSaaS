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

import ProofPage from './page'

describe('beheer proof page', () => {
  it('renders the proof ladder and approval headings', async () => {
    const html = renderToString(await ProofPage())
    expect(html).toContain('Case proof registry')
    expect(html).toContain('sales_usable')
    expect(html).toContain('public_usable')
  })
})

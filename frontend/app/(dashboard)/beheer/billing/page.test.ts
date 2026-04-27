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

import BillingPage from './page'

describe('beheer billing page', () => {
  it('renders the manual billing registry framing', async () => {
    const html = renderToString(await BillingPage())
    expect(html).toContain('Billing registry')
    expect(html).toContain('Actief (handmatig)')
    expect(html).toContain('Geen Stripe of checkout in deze fase')
  })
})

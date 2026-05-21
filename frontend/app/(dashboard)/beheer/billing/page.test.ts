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

vi.mock('@/lib/billing-registry-server', () => ({
  listBillingRegistryRows: async () => [
    {
      orgId: 'org_1',
      organizationName: 'Verisight Demo Org',
      legalCustomerName: 'Verisight Demo Org B.V.',
      contractState: 'signed',
      billingState: 'active_manual',
      paymentMethodConfirmed: true,
    },
  ],
}))

import BillingPage from './page'

describe('beheer billing page', () => {
  it('renders the billing page as a transition registry', async () => {
    const html = renderToString(await BillingPage())
    expect(html).toContain('Billing transition registry')
    expect(html).toContain('Transition deep link')
    expect(html).toContain('Expert registry')
    expect(html).toContain('Actief (handmatig)')
    expect(html).toContain('launch-ready')
  })
})

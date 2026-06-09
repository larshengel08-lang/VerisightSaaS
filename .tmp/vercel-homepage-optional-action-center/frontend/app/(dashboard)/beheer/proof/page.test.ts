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

vi.mock('@/lib/proof-registry-server', () => ({
  listProofRegistryEntries: async () => [
    {
      id: 'proof_1',
      orgId: 'org_1',
      campaignId: 'cmp_1',
      route: 'ExitScan',
      proofState: 'public_usable',
      approvalState: 'approved',
      summary: 'ExitScan toonde een bounded eerste managementread plus reviewritme.',
      claimableObservation: null,
      supportingArtifacts: [],
      createdAt: '2026-04-27T10:00:00.000Z',
    },
  ],
}))

import ProofPage from './page'

describe('beheer proof page', () => {
  it('renders the proof ladder and approval headings', async () => {
    const html = renderToString(await ProofPage())
    expect(html).toContain('Case proof registry')
    expect(html).toContain('sales_usable')
    expect(html).toContain('Publiek bruikbaar')
  })
})

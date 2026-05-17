import { renderToString } from 'react-dom/server'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const proofRegistryMocks = vi.hoisted(() => ({
  getProofRegistrySummarySnapshot: vi.fn(),
  getLatestProofRegistryPreview: vi.fn(),
}))

vi.mock('next/navigation', () => ({
  redirect: vi.fn(),
}))

vi.mock('@/components/dashboard/action-center-preview', () => ({
  ActionCenterPreview: () => 'ActionCenterPreview',
}))

vi.mock('@/components/dashboard/pilot-learning-workbench', () => ({
  PilotLearningWorkbench: () => 'Dossierlog en bounded opvolging',
}))

vi.mock('@/lib/action-center-exit', () => ({
  buildExitActionCenterWorkspace: () => ({
    followUpSignals: [],
    assignments: [],
    reviewMoments: [],
  }),
  isExitActionCenterCandidate: () => false,
}))

vi.mock('@/lib/action-center-live', () => ({
  finalizeActionCenterPreviewItem: (item: unknown) => item,
}))

vi.mock('@/lib/action-center-core-semantics', () => ({
  projectActionCenterCoreSemantics: () => ({
    route: { reviewOutcome: 'geen-uitkomst' },
  }),
}))

vi.mock('@/lib/contact-requests', () => ({
  getContactRequestsForAdmin: async () => ({
    rows: [],
    configError: null,
    loadError: null,
  }),
}))

vi.mock('@/lib/proof-registry-server', () => ({
  getProofRegistrySummarySnapshot: proofRegistryMocks.getProofRegistrySummarySnapshot,
  getLatestProofRegistryPreview: proofRegistryMocks.getLatestProofRegistryPreview,
}))

vi.mock('@/lib/supabase/server', () => ({
  createClient: async () => ({
    auth: {
      getUser: async () => ({ data: { user: { id: 'user_1' } } }),
    },
    from: (table: string) => ({
      select: (query: string) => {
        const chain = {
          eq: () =>
            query === 'is_verisight_admin'
              ? {
                  single: async () => ({ data: { is_verisight_admin: true } }),
                  order: async () => ({ data: [] }),
                }
              : chain,
          in: () => chain,
          is: () => Promise.resolve({ data: [] }),
          order: async () => {
            if (table === 'org_members' && query === 'organizations(*)') {
              return {
                data: [
                  {
                    organizations: {
                      id: 'org_1',
                      name: 'Demo org',
                      is_active: true,
                    },
                  },
                ],
              }
            }

            return { data: [] }
          },
        }

        return chain
      },
    }),
  }),
}))

import KlantLearningsPage from './page'

describe('klantlearnings proof summary integration', () => {
  beforeEach(() => {
    proofRegistryMocks.getProofRegistrySummarySnapshot.mockReset()
    proofRegistryMocks.getLatestProofRegistryPreview.mockReset()
  })

  it('renders a lower-weight proof summary without replacing the dossier workbench', async () => {
    proofRegistryMocks.getProofRegistrySummarySnapshot.mockResolvedValue({
      total: 4,
      lessonOnlyCount: 2,
      salesUsableCount: 1,
      publicUsableCount: 1,
    })
    proofRegistryMocks.getLatestProofRegistryPreview.mockResolvedValue({
      proofState: 'public_usable',
      approvalState: 'approved',
      summary: 'Laatste case is publiek bruikbaar na volledige approval.',
    })

    const html = renderToString(await KlantLearningsPage({ searchParams: Promise.resolve({}) }))

    expect(html).toContain('Proofsamenvatting')
    expect(html).toContain('Proof state')
    expect(html).toContain('Approval state')
    expect(html).toContain('Summary')
    expect(html).toContain('Laatste case is publiek bruikbaar na volledige approval.')
    expect(html).toContain('/beheer/proof')
    expect(html).toContain('Dossierlog en bounded opvolging')
  })

  it('keeps the page renderable when proof loading fails', async () => {
    proofRegistryMocks.getProofRegistrySummarySnapshot.mockRejectedValue(new Error('proof unavailable'))
    proofRegistryMocks.getLatestProofRegistryPreview.mockResolvedValue(null)

    const html = renderToString(await KlantLearningsPage({ searchParams: Promise.resolve({}) }))

    expect(html).toContain('Proofsamenvatting')
    expect(html).toContain('Proofsamenvatting tijdelijk niet beschikbaar')
    expect(html).toContain('Dossierlog en bounded opvolging')
  })
})

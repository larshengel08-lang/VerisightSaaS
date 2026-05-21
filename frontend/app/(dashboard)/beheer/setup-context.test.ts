import { describe, expect, it } from 'vitest'
import { resolveSetupContext } from './setup-context'

describe('resolveSetupContext', () => {
  it('keeps respondents and client access locked when no active organization exists', () => {
    const context = resolveSetupContext({
      organizations: [],
      campaigns: [],
      selectedOrganizationId: null,
      selectedCampaignId: null,
    })

    expect(context.selectedOrganizationId).toBeNull()
    expect(context.selectedCampaignId).toBeNull()
    expect(context.respondentsLocked).toBe(true)
    expect(context.clientAccessLocked).toBe(true)
  })

  it('defaults to the newest active campaign inside the selected organization', () => {
    const context = resolveSetupContext({
      organizations: [{ id: 'org-a', is_active: true, name: 'Alpha', slug: 'alpha' }],
      campaigns: [
        { id: 'camp-old', organization_id: 'org-a', is_active: true, created_at: '2026-05-01T10:00:00.000Z', name: 'Old' },
        { id: 'camp-new', organization_id: 'org-a', is_active: true, created_at: '2026-05-10T10:00:00.000Z', name: 'New' },
      ],
      selectedOrganizationId: 'org-a',
      selectedCampaignId: null,
    })

    expect(context.selectedOrganizationId).toBe('org-a')
    expect(context.selectedCampaignId).toBe('camp-new')
    expect(context.respondentsLocked).toBe(false)
    expect(context.clientAccessLocked).toBe(false)
  })

  it('preserves an explicit campaign selection when it belongs to the selected organization', () => {
    const context = resolveSetupContext({
      organizations: [{ id: 'org-a', is_active: true, name: 'Alpha', slug: 'alpha' }],
      campaigns: [
        { id: 'camp-a', organization_id: 'org-a', is_active: true, created_at: '2026-05-01T10:00:00.000Z', name: 'A' },
        { id: 'camp-b', organization_id: 'org-a', is_active: true, created_at: '2026-05-10T10:00:00.000Z', name: 'B' },
      ],
      selectedOrganizationId: 'org-a',
      selectedCampaignId: 'camp-a',
    })

    expect(context.selectedCampaignId).toBe('camp-a')
  })
})

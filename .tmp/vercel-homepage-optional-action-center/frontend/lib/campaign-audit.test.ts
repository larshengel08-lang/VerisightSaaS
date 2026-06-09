import { describe, expect, it } from 'vitest'

import {
  CAMPAIGN_AUDIT_ACTIONS,
  buildCampaignAuditEvent,
  formatCampaignAuditHeadline,
} from './campaign-audit'

describe('campaign audit events', () => {
  it('keeps critical launch actions auditable with owner-safe labels', () => {
    expect(CAMPAIGN_AUDIT_ACTIONS.launch_invites.ownerLabel).toBe('Klant owner')
    expect(CAMPAIGN_AUDIT_ACTIONS.import_respondents.actionLabel).toBe('Deelnemersimport')
    expect(CAMPAIGN_AUDIT_ACTIONS.delivery_lifecycle_changed.actionLabel).toBe('Uitvoerstatus bijgewerkt')
    expect(CAMPAIGN_AUDIT_ACTIONS.delivery_lifecycle_changed.ownerLabel).toBe('Verisight')
  })

  it('builds a blocked audit event with clear customer-safe language', () => {
    const event = buildCampaignAuditEvent({
      action: 'launch_invites',
      outcome: 'blocked',
      actorRole: 'viewer',
      actorLabel: 'Viewer',
      summary: 'Uitnodigingen geblokkeerd omdat de rol geen uitvoerrecht heeft.',
    })

    expect(event.owner_label).toBe('Klant owner')
    expect(event.summary).toContain('uitvoerrecht')
    expect(formatCampaignAuditHeadline(event)).toBe('Geblokkeerd - Uitnodigingen gestart')
  })
})

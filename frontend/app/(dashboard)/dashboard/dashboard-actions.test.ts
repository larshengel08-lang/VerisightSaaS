import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

const source = readFileSync(new URL('./dashboard-actions.ts', import.meta.url), 'utf8')

describe('dashboard server actions', () => {
  it('runs server-side and verifies the session before mutating', () => {
    expect(source).toContain("'use server'")
    expect(source).toContain('await supabase.auth.getUser()')
  })

  it('confirmReminderSentAction records an audit event without calling the invite backend', () => {
    expect(source).toContain('export async function confirmReminderSentAction')
    expect(source).toContain('insertCampaignAuditEvent')
    expect(source).toContain("action: 'send_reminders'")
    expect(source).not.toContain('/send-invites')
  })

  it('closeCampaignAction archives the campaign with a closed_at timestamp', () => {
    expect(source).toContain('export async function closeCampaignAction')
    expect(source).toContain('is_active: false')
    expect(source).toContain('closed_at')
  })
})

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

  it('mailt alleen als er echt een rapport is en naar bestaande kolommen', () => {
    expect(source).toContain('isReportReleaseReady')
    expect(source).toContain("from('org_invites')")
    expect(source).toContain("eq('role', 'owner')")
    expect(source).toContain('buildReportMailRecipients')
    expect(source).toContain('getOperatorEmail')
    // profiles.email bestaat niet in het schema; org_members kent geen
    // rollen admin/hr_manager. Beide waren de oorzaak van de stille no-op.
    expect(source).not.toContain("from('profiles')\n      .select('email')")
    expect(source).not.toContain("'hr_manager'")
  })

  it('meldt een mislukte mail in plaats van hem stil te slikken', () => {
    expect(source).toContain('warning')
    expect(source).toContain('report_mail')
  })
})

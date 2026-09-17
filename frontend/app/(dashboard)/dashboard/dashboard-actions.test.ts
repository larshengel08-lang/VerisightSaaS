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

  it('defect 2: een operator-only send (geen klantadres) oogt niet als succes', () => {
    expect(source).toContain('countCustomerRecipients')
    expect(source).toContain('customerRecipientCount')
    expect(source).toContain('customer_recipients: customerRecipientCount')
    expect(source).toContain('customerRecipientCount === 0')
    expect(source).toContain('Er is geen e-mailadres van je organisatie bekend')
  })

  it('defect 3: een mislukte campaign_stats-query wordt niet stil gelezen als "0 responses"', () => {
    expect(source).toContain('error: statsError')
    expect(source).toContain('!statsError &&')
    expect(source).toContain('stats_error: statsError.message')
    expect(source).toContain('kon niet vaststellen of er genoeg antwoorden zijn')
  })

  it('geeft precedence aan de stats-fout boven een mailfout boven "geen klantadres", nooit samengevoegd', () => {
    const statsIdx = source.indexOf('if (statsError) {')
    const mailFailedIdx = source.indexOf('if (mailFailed > 0) {')
    const noRecipientsIdx = source.indexOf('if (reportAvailable && customerRecipientCount === 0) {')
    expect(statsIdx).toBeGreaterThan(-1)
    expect(mailFailedIdx).toBeGreaterThan(statsIdx)
    expect(noRecipientsIdx).toBeGreaterThan(mailFailedIdx)
  })
})

describe('levenscyclus-acties (spec 2026-09-16 par. 4.3)', () => {
  it('exporteert extendCampaignAction en skipReminderAction met de afgesproken auditvorm', () => {
    expect(source).toContain('export async function extendCampaignAction')
    expect(source).toContain('export async function skipReminderAction')
    expect(source).toContain("contains('metadata', { extension: true })")
    expect(source).toContain("channel: 'skipped_by_customer'")
    expect(source).toContain('computeExtendedClosesAt')
    expect(source).toContain('canExtendCampaign')
  })
})

// frontend/app/(dashboard)/dashboard/page.test.ts
import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

const source = readFileSync(new URL('./page.tsx', import.meta.url), 'utf8')

describe('state-driven dashboard page', () => {
  it('resolves and renders a single dashboard state', () => {
    expect(source).toContain('resolveDashboardState')
    expect(source).toContain('DashboardStateCard')
  })

  it('keeps the manager-only access guard', () => {
    expect(source).toContain("if (context.managerOnly) redirect('/action-center')")
  })

  it('laadt alle metingen, kiest de nieuwste actieve als hoofdkaart en toont de rest in een lijst (spec 2026-09-16 par. 6.1)', () => {
    expect(source).toContain("order('created_at', { ascending: false })")
    // Alleen de campaign_stats-query: de send_reminders-query mag wel limit(1) houden.
    const statsQuery = source.slice(source.indexOf(".from('campaign_stats')"), source.indexOf('if (statsError)'))
    expect(statsQuery).toContain("order('created_at', { ascending: false })")
    expect(statsQuery).not.toContain('.limit(')
    expect(source).toContain('pickMainCampaign(campaigns)')
    expect(source).toContain('buildCampaignListItems(campaigns, statusContext, campaign.campaign_id)')
    expect(source).toContain('campaigns.length > 1 ? (')
    expect(source).toContain('CampaignListSection')
    expect(source).toContain('isReportReleaseReady')
    expect(source).not.toContain('isDashboardReleaseReady')
  })

  it('drops the cockpit/triage/status-filter IA', () => {
    expect(source).not.toContain('Cockpit')
    expect(source).not.toContain('ACTIE NODIG')
    expect(source).not.toContain('Nu eerst')
    expect(source).not.toContain('Geblokkeerd / niet gestart')
    expect(source).not.toContain('Recente afgeronde routes')
    expect(source).not.toContain('STATUS_FILTERS')
    expect(source).not.toContain('normalizeDashboardStatusFilter')
    expect(source).not.toContain('buildCockpitCounters')
  })

  it('derives the manual reminder-sent signal from the send_reminders audit events', () => {
    expect(source).toContain("action_key")
    expect(source).toContain("'send_reminders'")
  })

  it('laat alleen de eigenaar en de operator de meting beheren', () => {
    expect(source).toContain("supabase.from('profiles')")
    expect(source).toContain("from('org_members')")
    expect(source).toContain('const canManage =')
    expect(source).toContain("membership?.role === 'owner'")
    expect(source).toContain('ReadOnlyStateCard')
  })

  it('telt de verlengingen uit de auditevents (spec 2026-09-16 par. 4.3)', () => {
    expect(source).toContain("contains('metadata', { extension: true })")
    expect(source).toContain('extensionCount: extensionCount ?? 0')
    expect(source).toContain('isSkippedReminderEvent(reminderEvents?.[0])')
  })

  it('telt de verlengingen binnen de eigen organisatie en faalt luid als de telling niet lukt', () => {
    expect(source).toContain("{ count: extensionCount, error: extensionCountError }")
    expect(source).toContain("eq('organization_id', campaign.organization_id)")
    expect(source).toContain('if (extensionCountError)')
    expect(source).toContain('throw new Error(`Kon het aantal verlengingen niet laden: ${extensionCountError.message}`)')
  })

  it('biedt onderaan altijd "nieuwe meting aanvragen" aan, ook zonder meting (spec 2026-09-16 par. 6.3)', () => {
    expect(source.match(/<RequestNewMeasurement\s/g)?.length).toBe(2)
    expect(source).toContain('loadAccountOrganizations(supabase, user.id)')
    // Zonder meting is er geen "zelfde meting opnieuw": neutrale variant.
    expect(source).toContain('<RequestNewMeasurement variant="first" organizationName={account.names[0] ?? null} />')
    expect(source).toContain('<RequestNewMeasurement variant="follow_up" organizationName={orgData?.name ?? null} />')
    // Een mislukte naamlading blijft niet stil (Task 6 toont hem in de kop).
    expect(source).toContain('if (account.error) console.warn(')
  })
})

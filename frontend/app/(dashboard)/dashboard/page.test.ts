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

  it('selects the most recent campaign and derives report readiness from the report release rule', () => {
    expect(source).toContain("order('created_at', { ascending: false })")
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
})

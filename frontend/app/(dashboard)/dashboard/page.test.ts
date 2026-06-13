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

  it('selects the most recent campaign and derives report readiness from existing data', () => {
    expect(source).toContain("order('created_at', { ascending: false })")
    expect(source).toContain('isDashboardReleaseReady')
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
})

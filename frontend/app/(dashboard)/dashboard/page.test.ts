import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

describe('dashboard home guided execution shell', () => {
  it('keeps the customer landing focused on guided execution before dashboard activation', () => {
    const source = readFileSync(new URL('./page.tsx', import.meta.url), 'utf8')

    expect(source).toContain('Jouw uitvoerstatus')
    expect(source).toContain('Open uitvoerflow')
    expect(source).toContain('Open deze campaign voor deelnemersimport, inviteflow, responsmonitoring')
    expect(source).toContain('Dashboard actief')
    expect(source).toContain("if (campaign.total_completed < 5) return 'building'")
    expect(source).toContain('primaryGuideInvitesNotSent')
    expect(source).toContain('getPrimaryGuideCampaign')
    expect(source).toContain('<DashboardChip label="Operations cockpit" tone="slate" />')
    expect(source).toContain("tone={item.status === 'done' ? 'emerald' : item.status === 'current' ? 'amber' : 'slate'}")
    expect(source).toContain("tone={group.key === 'ready' ? 'emerald' : group.key === 'closed' ? 'slate' : 'amber'}")
    expect(source).toContain("tone: 'emerald' as const")
  })
})

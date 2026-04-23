import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

describe('dashboard home guided execution shell', () => {
  it('keeps the customer landing focused on guided execution before dashboard activation', () => {
    const pageSource = readFileSync(new URL('./page.tsx', import.meta.url), 'utf8')
    const launchControlSource = readFileSync(
      new URL('../../../components/dashboard/customer-launch-control.tsx', import.meta.url),
      'utf8',
    )
    const stateSource = readFileSync(new URL('../../../lib/guided-self-serve.ts', import.meta.url), 'utf8')

    expect(pageSource).toContain('Jouw uitvoerstatus')
    expect(pageSource).toContain('CustomerLaunchControl')
    expect(pageSource).toContain('Open uitvoerflow')
    expect(pageSource).toContain('deriveGuidedSelfServeDiscipline')
    expect(pageSource).toContain('primaryGuideInvitesNotSent')
    expect(pageSource).toContain('getPrimaryGuideCampaign')
    expect(pageSource).toContain('getFirstNextStepGuidance')
    expect(pageSource).toContain('First-next-step')
    expect(pageSource).toContain('Mogelijke vervolgroutes')
    expect(pageSource).toContain('!showFirstNextStep')
    expect(pageSource).toContain("if (campaign.total_completed < 5) return 'building'")

    expect(launchControlSource).toContain('Product')
    expect(launchControlSource).toContain('Verisight doet nu')
    expect(launchControlSource).toContain('Jij doet nu')
    expect(launchControlSource).toContain('Open blokkades')
    expect(launchControlSource).toContain('Uitvoerstatus')
    expect(launchControlSource).toContain('Waar je staat')
    expect(launchControlSource).toContain('Dashboard actief')
    expect(stateSource).toContain('Eerste vervolgstap beschikbaar')
  })
})

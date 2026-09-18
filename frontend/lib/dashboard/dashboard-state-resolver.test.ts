// frontend/lib/dashboard/dashboard-state-resolver.test.ts
import { describe, expect, it } from 'vitest'
import { resolveDashboardState, type DashboardStateInput } from './dashboard-state-resolver'

function baseInput(overrides: Partial<DashboardStateInput> = {}): DashboardStateInput {
  return {
    campaign: {
      id: 'camp-1',
      name: 'Loep Vertrek Q2 2026',
      scanType: 'exit',
      isActive: true,
      totalInvited: 20,
      totalCompleted: 0,
      completionRatePct: 0,
      closedAt: null,
    },
    launchConfirmedAt: '2026-06-01T09:00:00Z',
    launchDate: '2026-06-01',
    closesAt: null,
    reminderConfig: { enabled: true, firstReminderAfterDays: 5, maxReminderCount: 1 },
    reminderAlreadySentAt: null,
    reminderSkipped: false,
    extensionCount: 0,
    reportReady: false,
    today: '2026-06-03',
    ...overrides,
  }
}

function withCampaign(overrides: Partial<NonNullable<DashboardStateInput['campaign']>>) {
  return { ...baseInput().campaign!, ...overrides }
}

describe('resolveDashboardState', () => {
  it('State 0 — no campaign', () => {
    const state = resolveDashboardState(baseInput({ campaign: null }))
    expect(state.kind).toBe('no_campaign')
    expect(state.primaryMessage).toBe('Er staat momenteel geen scan voor je klaar')
    expect(state.ctaLabel).toBeNull()
    expect(state.timeline).toBeNull()
  })

  it('State 1 — setup when invites are not launched yet', () => {
    const state = resolveDashboardState(baseInput({ launchConfirmedAt: null }))
    expect(state.kind).toBe('setup')
    expect(state.primaryMessage).toBe('Stap 1: stel de startdatum in')
    expect(state.ctaLabel).toBe('Start de setup →')
    expect(state.ctaHref).toBe('/campaigns/camp-1/setup')
    expect(state.secondaryActions).toEqual([])
  })

  it('State 1 — setup when no respondents are imported yet (even if confirmed)', () => {
    const state = resolveDashboardState(baseInput({ campaign: withCampaign({ totalInvited: 0 }) }))
    expect(state.kind).toBe('setup')
  })

  it('State 2 — running: geen primaire actie, wel altijd "Meting sluiten" (spec 4.3)', () => {
    const state = resolveDashboardState(
      baseInput({ campaign: withCampaign({ totalCompleted: 3, completionRatePct: 15 }), closesAt: '2026-06-22' }),
    )
    expect(state.kind).toBe('running')
    expect(state.primaryMessage).toBe('Campagne loopt')
    expect(state.tone).toBe('positive')
    expect(state.ctaLabel).toBeNull()
    expect(state.progressPct).toBe(15)
    expect(state.subtext).toBe('3 van 20 ingevuld')
    expect(state.secondaryActions).toEqual([{ label: 'Meting sluiten', kind: 'close_campaign' }])
    expect(state.totalCompleted).toBe(3)
    expect(state.totalInvited).toBe(20)
    expect(state.reportReady).toBe(false)
    expect(state.reportThreshold).toBe(10)
    expect(state.canExtend).toBe(true)
    expect(state.extensionsLeft).toBe(3)
  })

  it('State 3 — reminder day takes priority over running and offers skip and close', () => {
    const state = resolveDashboardState(baseInput({ campaign: withCampaign({ totalCompleted: 3 }), today: '2026-06-06' }))
    expect(state.kind).toBe('action')
    expect(state.actionVariant).toBe('reminder')
    expect(state.primaryMessage).toBe('Vandaag: stuur de herinnering')
    expect(state.ctaKind).toBe('copy_reminder')
    expect(state.ctaLabel).toBe('Ik heb de herinnering verstuurd')
    expect(state.tone).toBe('attention')
    expect(state.secondaryActions).toEqual([
      { label: 'Geen herinnering versturen', kind: 'skip_reminder' },
      { label: 'Meting sluiten', kind: 'close_campaign' },
    ])
  })

  it('State 3 — vóór de herinneringsdag is de kaart gewoon "running" (spec 4.4)', () => {
    const state = resolveDashboardState(baseInput({ campaign: withCampaign({ totalCompleted: 3 }), today: '2026-06-05' }))
    expect(state.kind).toBe('running')
    expect(state.timeline?.items[1]).toMatchObject({ label: 'Herinnering', value: '6 juni 2026', done: false })
  })

  it('State 3 — een overgeslagen herinnering telt als afgehandeld en staat zo in de tijdlijn', () => {
    const state = resolveDashboardState(
      baseInput({
        campaign: withCampaign({ totalCompleted: 3 }),
        today: '2026-06-08',
        reminderAlreadySentAt: '2026-06-06T10:00:00Z',
        reminderSkipped: true,
      }),
    )
    expect(state.kind).toBe('running')
    expect(state.timeline?.items[1]).toMatchObject({ value: 'Overgeslagen', done: true })
  })

  it('State 3 — sufficient response: rapportdrempel gehaald, sluiten mag maar hoeft niet', () => {
    const state = resolveDashboardState(
      baseInput({ campaign: withCampaign({ totalCompleted: 12, completionRatePct: 60 }), reportReady: true }),
    )
    expect(state.kind).toBe('action')
    expect(state.actionVariant).toBe('sufficient_response')
    expect(state.primaryMessage).toBe('Voldoende respons voor een rapport')
    expect(state.subtext).toContain('Je kunt de meting sluiten of nog even open laten.')
    expect(state.subtext).toContain('12 van 20 ingevuld (60%)')
    expect(state.ctaLabel).toBe('Meting sluiten')
    expect(state.ctaKind).toBe('close_campaign')
    expect(state.reportReady).toBe(true)
  })

  it('State 3 — expired boven de drempel: sluiten primair, verlengen secundair (spec 4.3)', () => {
    const state = resolveDashboardState(
      baseInput({ campaign: withCampaign({ totalCompleted: 12, completionRatePct: 60 }), reportReady: true, closesAt: '2026-06-05', today: '2026-06-06' }),
    )
    expect(state.kind).toBe('action')
    expect(state.actionVariant).toBe('expired')
    expect(state.primaryMessage).toBe('De sluitdatum is bereikt')
    expect(state.ctaLabel).toBe('Meting sluiten')
    expect(state.ctaKind).toBe('close_campaign')
    expect(state.secondaryActions).toEqual([{ label: 'Twee weken verlengen', kind: 'extend' }])
    expect(state.subtext).toBe('12 van 20 ingevuld (60%). Sluit de meting, dan staat het rapport klaar.')
  })

  it('State 3 — expired onder de drempel: verlengen primair, toch sluiten secundair', () => {
    const state = resolveDashboardState(
      baseInput({ campaign: withCampaign({ totalCompleted: 6, completionRatePct: 30 }), closesAt: '2026-06-05', today: '2026-06-06' }),
    )
    expect(state.actionVariant).toBe('expired')
    expect(state.ctaLabel).toBe('Twee weken verlengen')
    expect(state.ctaKind).toBe('extend')
    expect(state.secondaryActions).toEqual([{ label: 'Toch sluiten', kind: 'close_campaign' }])
    expect(state.subtext).toBe(
      '6 van 20 ingevuld (30%). Voor een rapport zijn minimaal 10 antwoorden nodig. Verleng met twee weken of sluit zonder rapport.',
    )
  })

  it('State 3 — expired onder de drempel na drie verlengingen: alleen nog sluiten', () => {
    const state = resolveDashboardState(
      baseInput({ campaign: withCampaign({ totalCompleted: 6, completionRatePct: 30 }), closesAt: '2026-06-05', today: '2026-06-06', extensionCount: 3 }),
    )
    expect(state.actionVariant).toBe('expired')
    expect(state.ctaLabel).toBe('Meting sluiten')
    expect(state.ctaKind).toBe('close_campaign')
    expect(state.secondaryActions).toEqual([])
    expect(state.canExtend).toBe(false)
    expect(state.extensionsLeft).toBe(0)
    expect(state.subtext).toContain('al 3 keer verlengd')
  })

  it('State 3 — expired boven de drempel na drie verlengingen: geen verleng-optie meer', () => {
    const state = resolveDashboardState(
      baseInput({ campaign: withCampaign({ totalCompleted: 12 }), reportReady: true, closesAt: '2026-06-05', today: '2026-06-06', extensionCount: 3 }),
    )
    expect(state.ctaLabel).toBe('Meting sluiten')
    expect(state.secondaryActions).toEqual([])
  })

  it('State 3 — expired fires even when closesAt is a full ISO timestamp', () => {
    const state = resolveDashboardState(
      baseInput({ campaign: withCampaign({ totalCompleted: 12 }), closesAt: '2026-06-05T22:00:00Z', today: '2026-06-06' }),
    )
    expect(state.actionVariant).toBe('expired')
  })

  it('State 3b — processing/generating when closed and enough responses but report not yet ready', () => {
    const state = resolveDashboardState(
      baseInput({ campaign: withCampaign({ isActive: false, totalCompleted: 12, closedAt: '2026-06-10T09:00:00Z' }), reportReady: false }),
    )
    expect(state.kind).toBe('processing')
    expect(state.processingVariant).toBe('generating')
    expect(state.primaryMessage).toBe('Rapport wordt voorbereid')
  })

  it('State 3b — gesloten onder de drempel is een eindtoestand met contact (spec 4.5)', () => {
    const state = resolveDashboardState(
      baseInput({ campaign: withCampaign({ isActive: false, totalCompleted: 7, closedAt: '2026-06-10T09:00:00Z' }), reportReady: false }),
    )
    expect(state.kind).toBe('processing')
    expect(state.processingVariant).toBe('insufficient_response')
    expect(state.primaryMessage).toBe('Gesloten zonder rapport')
    expect(state.subtext).toBe(
      'Deze meting is gesloten met 7 ingevulde vragenlijsten. Voor een rapport zijn er minimaal 10 nodig. Wil je opnieuw meten? Mail Loep.',
    )
    expect(state.ctaKind).toBe('link')
    expect(state.ctaLabel).toBe('Mail Loep')
    expect(state.ctaHref).toBe('mailto:hallo@getloep.nl?subject=Opnieuw%20meten%3A%20Loep%20Vertrek%20Q2%202026')
    expect(state.subtext).not.toContain('e-mail')
    expect(state.timeline).toBeNull()
  })

  it('State 4 — report ready when closed and report is available', () => {
    const state = resolveDashboardState(
      baseInput({ campaign: withCampaign({ isActive: false, totalCompleted: 14, closedAt: '2026-06-10T09:00:00Z' }), reportReady: true }),
    )
    expect(state.kind).toBe('report_ready')
    expect(state.primaryMessage).toBe('Je rapport is beschikbaar')
    expect(state.ctaLabel).toBe('Open rapport')
    expect(state.ctaHref).toBe('/campaigns/camp-1')
  })

  it('houdt de culture_assessment-drempel van 30 als reportThreshold', () => {
    const state = resolveDashboardState(baseInput({ campaign: withCampaign({ scanType: 'culture_assessment', totalCompleted: 3 }) }))
    expect(state.reportThreshold).toBe(30)
  })

  it('degradeert het sluitlabel eerlijk als er geen sluitdatum is en zet dat ook in de tijdlijn', () => {
    const state = resolveDashboardState(baseInput({ campaign: withCampaign({ totalCompleted: 3 }) }))
    expect(state.kind).toBe('running')
    expect(state.closeDateLabel).toBe('Sluitdatum: nog niet ingesteld')
    expect(state.timeline?.items.map((i) => i.value)).toEqual(['1 juni 2026', '6 juni 2026', 'Nog niet ingesteld'])
  })

  it('geeft een lopende meting een tijdlijn met de sluitdatum, en een niet-gelanceerde geen', () => {
    const running = resolveDashboardState(baseInput({ campaign: withCampaign({ totalCompleted: 3 }), closesAt: '2026-06-22' }))
    expect(running.timeline?.items.map((i) => [i.label, i.value])).toEqual([
      ['Uitnodiging verstuurd', '1 juni 2026'],
      ['Herinnering', '6 juni 2026'],
      ['Meting sluit', '22 juni 2026'],
    ])
    expect(resolveDashboardState(baseInput({ launchConfirmedAt: null })).timeline).toBeNull()
  })

  it('geeft de tijdlijn de scan en de datum van vandaag mee (rapportdrempel, geplande start)', () => {
    const culture = resolveDashboardState(
      baseInput({ campaign: withCampaign({ scanType: 'culture_assessment', totalCompleted: 3 }) }),
    )
    expect(culture.timeline?.reportNote).toContain('minimaal 30 ingevulde vragenlijsten')
    const planned = resolveDashboardState(
      baseInput({ campaign: withCampaign({ totalCompleted: 0 }), launchDate: '2026-06-05' }),
    )
    expect(planned.timeline?.items[0]).toMatchObject({ label: 'Uitnodiging gepland', value: '5 juni 2026', done: false })
  })

  it('bevat nergens em- of en-dashes in klantcopy', () => {
    const inputs = [
      baseInput({ campaign: null }),
      baseInput({ launchConfirmedAt: null }),
      baseInput({ campaign: withCampaign({ totalCompleted: 3 }) }),
      baseInput({ campaign: withCampaign({ totalCompleted: 3 }), today: '2026-06-06' }),
      baseInput({ campaign: withCampaign({ totalCompleted: 12 }), reportReady: true }),
      baseInput({ campaign: withCampaign({ totalCompleted: 6 }), closesAt: '2026-06-05', today: '2026-06-06' }),
      baseInput({ campaign: withCampaign({ totalCompleted: 12 }), reportReady: true, closesAt: '2026-06-05', today: '2026-06-06' }),
      baseInput({ campaign: withCampaign({ isActive: false, totalCompleted: 7 }) }),
      baseInput({ campaign: withCampaign({ isActive: false, totalCompleted: 14 }), reportReady: true }),
    ]
    for (const input of inputs) {
      const state = resolveDashboardState(input)
      expect(state.primaryMessage).not.toMatch(/[—–]/)
      expect(state.subtext).not.toMatch(/[—–]/)
      for (const action of state.secondaryActions) expect(action.label).not.toMatch(/[—–]/)
    }
  })
  it('draagt de naam van de meting in elke staat, zodat de kaart hem kan noemen (walkthrough 1.2)', () => {
    expect(resolveDashboardState(baseInput()).campaignName).toBe('Loep Vertrek Q2 2026')
    expect(resolveDashboardState(baseInput({ launchConfirmedAt: null })).campaignName).toBe('Loep Vertrek Q2 2026')
    expect(
      resolveDashboardState(baseInput({ campaign: withCampaign({ isActive: false, totalCompleted: 14 }), reportReady: true })).campaignName,
    ).toBe('Loep Vertrek Q2 2026')
    expect(resolveDashboardState(baseInput({ campaign: null })).campaignName).toBeNull()
  })
})

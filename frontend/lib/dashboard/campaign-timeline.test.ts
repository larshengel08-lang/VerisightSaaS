import { describe, expect, it } from 'vitest'
import { buildCampaignTimeline, TIMELINE_REPORT_NOTE } from './campaign-timeline'

const base = {
  launchDate: '2026-09-16',
  launchConfirmedAt: '2026-09-16T08:00:00Z',
  reminderEnabled: true,
  reminderAfterDays: 5,
  reminderHandledAt: null,
  reminderSkipped: false,
  closesAt: '2026-10-07',
}

describe('buildCampaignTimeline (spec 2026-09-16 par. 4.2)', () => {
  it('geeft start, herinnering en sluit met echte datums', () => {
    const timeline = buildCampaignTimeline(base)
    expect(timeline.items.map((i) => [i.key, i.label, i.value, i.done])).toEqual([
      ['start', 'Uitnodiging verstuurd', '16 september 2026', true],
      ['reminder', 'Herinnering', '21 september 2026', false],
      ['close', 'Meting sluit', '7 oktober 2026', false],
    ])
    expect(timeline.reportNote).toBe(TIMELINE_REPORT_NOTE)
    expect(TIMELINE_REPORT_NOTE).toBe(
      'Rapport downloaden zodra de meting gesloten is met minimaal 10 ingevulde vragenlijsten.',
    )
  })

  it('toont "geen" als de klant geen herinnering wil', () => {
    const timeline = buildCampaignTimeline({ ...base, reminderEnabled: false })
    expect(timeline.items[1]).toMatchObject({ value: 'Geen herinnering', done: false })
  })

  it('markeert een verstuurde herinnering met datum, en een overgeslagen herinnering als overgeslagen', () => {
    expect(buildCampaignTimeline({ ...base, reminderHandledAt: '2026-09-21T09:30:00Z' }).items[1]).toMatchObject({
      value: 'Verstuurd op 21 september 2026',
      done: true,
    })
    expect(buildCampaignTimeline({ ...base, reminderHandledAt: '2026-09-21T09:30:00Z', reminderSkipped: true }).items[1]).toMatchObject({
      value: 'Overgeslagen',
      done: true,
    })
  })

  it('degradeert eerlijk zonder sluitdatum of startdatum (metingen van voor de wizard-sluitdatum)', () => {
    const timeline = buildCampaignTimeline({ ...base, closesAt: null })
    expect(timeline.items[2]).toMatchObject({ value: 'Nog niet ingesteld' })
    const preview = buildCampaignTimeline({ ...base, launchDate: null, launchConfirmedAt: null, closesAt: null })
    expect(preview.items.map((i) => i.value)).toEqual(['Nog niet gepland', 'Nog niet gepland', 'Nog niet ingesteld'])
    expect(preview.items[0]).toMatchObject({ label: 'Start', done: false })
  })

  it('bevat geen em- of en-dashes', () => {
    const timeline = buildCampaignTimeline(base)
    for (const item of timeline.items) {
      expect(item.label).not.toMatch(/[—–]/)
      expect(item.value).not.toMatch(/[—–]/)
    }
    expect(timeline.reportNote).not.toMatch(/[—–]/)
  })
})

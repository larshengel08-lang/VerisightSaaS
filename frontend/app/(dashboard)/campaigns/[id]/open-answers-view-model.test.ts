import { describe, expect, it } from 'vitest'
import { buildOpenAnswerItems, buildOpenAnswersViewModel } from './open-answers-view-model'

describe('buildOpenAnswersViewModel', () => {
  it('groups answers by theme for navigation but keeps raw answers intact', () => {
    const model = buildOpenAnswersViewModel([
      { id: '1', theme: 'Werkdruk', text: 'De werkdruk liep te ver op.' },
      { id: '2', theme: 'Werkdruk', text: 'Te weinig herstelmomenten.' },
      { id: '3', theme: 'Leiderschap', text: 'Feedback kwam te laat.' },
    ])

    expect(model.themes.map((theme) => theme.title)).toEqual(['Werkdruk', 'Leiderschap'])
    expect(model.groups[0]?.answers).toHaveLength(2)
  })

  it('returns an empty state when no answers are released', () => {
    const model = buildOpenAnswersViewModel([])

    expect(model.themes).toEqual([])
    expect(model.groups).toEqual([])
    expect(model.isEmpty).toBe(true)
  })

  it('builds released answers from responses by sanitizing text, inferring themes and removing duplicates', () => {
    const items = buildOpenAnswerItems('retention', [
      {
        id: '1',
        respondent_id: 'resp-1',
        risk_score: 7.1,
        exit_reason_code: null,
        risk_band: 'HOOG',
        preventability: null,
        sdt_scores: {},
        org_scores: {
          workload: 2.9,
          growth: 7.2,
        },
        open_text_raw: 'Werkdruk bleef te hoog. Mail mij via test@example.com',
        open_text_analysis: null,
        full_result: {},
        submitted_at: '2026-05-01T08:00:00.000Z',
      },
      {
        id: '2',
        respondent_id: 'resp-2',
        risk_score: 6.4,
        exit_reason_code: null,
        risk_band: 'MIDDEN',
        preventability: null,
        sdt_scores: {},
        org_scores: {
          workload: 3.1,
        },
        open_text_raw: 'Werkdruk bleef te hoog. Mail mij via second@example.com',
        open_text_analysis: null,
        full_result: {},
        submitted_at: '2026-05-02T08:00:00.000Z',
      },
      {
        id: '3',
        respondent_id: 'resp-3',
        risk_score: 5.8,
        exit_reason_code: null,
        risk_band: 'MIDDEN',
        preventability: null,
        sdt_scores: {},
        org_scores: {
          leadership: 3.4,
        },
        open_text_raw: 'Feedback kwam te laat en verwachtingen waren onduidelijk.',
        open_text_analysis: null,
        full_result: {},
        submitted_at: '2026-05-03T08:00:00.000Z',
      },
    ])

    expect(items).toHaveLength(2)
    expect(items[0]).toMatchObject({
      theme: 'Werkbelasting',
      text: 'Werkdruk bleef te hoog. Mail mij via [verwijderd]',
    })
    expect(items[1]).toMatchObject({
      theme: 'Leiderschap',
    })
  })
})

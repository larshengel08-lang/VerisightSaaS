import { describe, expect, it } from 'vitest'
import { buildOpenAnswersViewModel } from './open-answers-view-model'

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
})

import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import type { CampaignItemScoresResponse } from '@/lib/types'
import { buildFactorItemLayerMap, truncateFactorItemLabel } from './factor-table'

describe('factor table item layer helpers', () => {
  it('merges visible and suppressed org items per factor without leaking non-factor items', () => {
    const payload: CampaignItemScoresResponse = {
      factors: [
        {
          factor_key: 'leadership',
          factor_label: 'Leiderschap',
          avg_score: 5.2,
          items: [
            {
              item_key: 'leadership_1',
              label: 'Mijn leidinggevende gaf richting die hielp om werk te prioriteren.',
              avg: 4.8,
              n: 12,
            },
            {
              item_key: 'leadership_3',
              label: 'Ik kreeg voldoende steun van mijn leidinggevende.',
              avg: 5.4,
              n: 12,
            },
          ],
        },
      ],
      sdt_dimensions: [],
      supplemental_sections: [],
      privacy_suppressed_items: ['leadership_2', 'B1'],
      suppressed_items: [
        {
          item_key: 'leadership_2',
          label: 'Mijn leidinggevende gaf regelmatig bruikbare feedback.',
          avg: null,
          n: 4,
        },
        {
          item_key: 'B1',
          label: 'Ik kon zelf bepalen hoe ik mijn werk uitvoerde.',
          avg: null,
          n: 4,
        },
      ],
    }

    expect(buildFactorItemLayerMap(payload)).toEqual({
      leadership: [
        {
          itemKey: 'leadership_1',
          label: 'Mijn leidinggevende gaf richting die hielp om werk te prioriteren.',
          avg: 4.8,
          n: 12,
          suppressed: false,
        },
        {
          itemKey: 'leadership_2',
          label: 'Mijn leidinggevende gaf regelmatig bruikbare feedback.',
          avg: null,
          n: 4,
          suppressed: true,
        },
        {
          itemKey: 'leadership_3',
          label: 'Ik kreeg voldoende steun van mijn leidinggevende.',
          avg: 5.4,
          n: 12,
          suppressed: false,
        },
      ],
    })
  })

  it('truncates long item labels to keep the subrows compact', () => {
    expect(
      truncateFactorItemLabel(
        'Dit is een extra lange vraagtekst die bewust langer is dan zestig tekens zodat we de truncatielogica raken.',
      ),
    ).toBe('Dit is een extra lange vraagtekst die bewust langer is da...')
  })

  it('keeps the privacy-suppressed messaging and toggle semantics in the component source', () => {
    const source = readFileSync(new URL('./factor-table.tsx', import.meta.url), 'utf8')

    expect(source).toContain('Niet zichtbaar (te weinig respondenten)')
    expect(source).toContain('aria-expanded')
    expect(source).toContain('Klap een factor open om de losse itemlaag te bekijken.')
  })
})

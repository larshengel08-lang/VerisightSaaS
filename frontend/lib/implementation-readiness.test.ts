import { describe, expect, it } from 'vitest'
import { getDeliveryModeDescription } from '@/lib/implementation-readiness'

describe('implementation readiness copy', () => {
  it('keeps mto baseline framed as internal assisted main-measurement prep', () => {
    const description = getDeliveryModeDescription('baseline', 'mto')

    expect(description).toContain('brede organisatiebrede hoofdmeting')
    expect(description).toContain('assisted')
  })

  it('keeps mto live closed until a later activation wave', () => {
    const description = getDeliveryModeDescription('live', 'mto')

    expect(description).toContain('latere wave')
    expect(description).toContain('publieke activatie')
  })
})

import { describe, expect, it } from 'vitest'
import { formatDutchDate } from './format-dutch-date'

describe('formatDutchDate', () => {
  it('formatteert een YYYY-MM-DD als Nederlandse datum', () => {
    expect(formatDutchDate('2026-09-21')).toBe('21 september 2026')
  })

  it('formatteert een volledige ISO-timestamp in Nederlandse tijd', () => {
    expect(formatDutchDate('2026-08-27T22:30:00Z')).toBe('28 augustus 2026')
  })

  it('geeft null bij lege of onleesbare invoer, nooit een lege string', () => {
    expect(formatDutchDate(null)).toBeNull()
    expect(formatDutchDate(undefined)).toBeNull()
    expect(formatDutchDate('')).toBeNull()
    expect(formatDutchDate('nooit')).toBeNull()
  })
})

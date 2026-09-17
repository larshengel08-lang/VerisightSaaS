import { describe, expect, it } from 'vitest'
import {
  EXTENSION_DAYS,
  MAX_EXTENSIONS,
  canExtendCampaign,
  computeExtendedClosesAt,
  extensionsLeft,
} from './campaign-extension'

describe('campaign-extension (spec 2026-09-16 par. 4.3)', () => {
  it('verlengt met twee weken, maximaal drie keer', () => {
    expect(EXTENSION_DAYS).toBe(14)
    expect(MAX_EXTENSIONS).toBe(3)
  })

  it('telt vanaf de sluitdatum als die nog in de toekomst ligt, anders vanaf vandaag', () => {
    expect(computeExtendedClosesAt('2026-10-07', '2026-09-20')).toBe('2026-10-21')
    expect(computeExtendedClosesAt('2026-09-10', '2026-09-20')).toBe('2026-10-04')
    expect(computeExtendedClosesAt('2026-09-20', '2026-09-20')).toBe('2026-10-04')
    expect(computeExtendedClosesAt(null, '2026-09-20')).toBe('2026-10-04')
  })

  it('accepteert een volledige ISO-timestamp als sluitdatum', () => {
    expect(computeExtendedClosesAt('2026-10-07T00:00:00Z', '2026-09-20')).toBe('2026-10-21')
  })

  it('staat verlengen toe tot en met de derde keer', () => {
    expect(canExtendCampaign(0)).toBe(true)
    expect(canExtendCampaign(2)).toBe(true)
    expect(canExtendCampaign(3)).toBe(false)
    expect(canExtendCampaign(7)).toBe(false)
    expect(canExtendCampaign(Number.NaN)).toBe(false)
    expect(extensionsLeft(0)).toBe(3)
    expect(extensionsLeft(2)).toBe(1)
    expect(extensionsLeft(3)).toBe(0)
    expect(extensionsLeft(Number.NaN)).toBe(0)
  })
})

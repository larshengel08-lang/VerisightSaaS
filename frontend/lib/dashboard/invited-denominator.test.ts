import { describe, expect, it } from 'vitest'
import {
  DENOMINATOR_UNKNOWN_REASON,
  completionPct,
  formatResponseBasis,
  resolveInvitedDenominator,
} from './invited-denominator'

describe('resolveInvitedDenominator (spec 2026-09-16 par. 6.2; zelfde regel als het rapport sinds stresstest ronde 2)', () => {
  it('neemt invited_count uit het delivery record als noemer', () => {
    expect(resolveInvitedDenominator({ invitedCount: 30, respondentRows: 6 })).toEqual({
      known: true,
      value: 30,
      source: 'invited_count',
    })
  })

  it('valt alleen terug op respondentrijen als die er méér zijn dan het ingevulde aantal', () => {
    expect(resolveInvitedDenominator({ invitedCount: 30, respondentRows: 35 })).toEqual({
      known: true,
      value: 35,
      source: 'respondent_rows',
    })
    expect(resolveInvitedDenominator({ invitedCount: null, respondentRows: 18 })).toEqual({
      known: true,
      value: 18,
      source: 'respondent_rows',
    })
  })

  it('verzint nooit een noemer: zonder beide is er een reden, geen getal', () => {
    for (const invitedCount of [null, undefined, 0, -3, 2.5, Number.NaN]) {
      expect(resolveInvitedDenominator({ invitedCount, respondentRows: 0 })).toEqual({
        known: false,
        reason: DENOMINATOR_UNKNOWN_REASON,
      })
    }
    expect(DENOMINATOR_UNKNOWN_REASON).toBe('aantal uitgenodigden niet ingevuld')
  })

  it('formatteert X van Y met percentage, of X ingevuld met de reden', () => {
    expect(formatResponseBasis(6, resolveInvitedDenominator({ invitedCount: 30, respondentRows: 6 }))).toBe(
      '6 van 30 ingevuld (20%)',
    )
    expect(formatResponseBasis(12, resolveInvitedDenominator({ invitedCount: null, respondentRows: 0 }))).toBe(
      '12 ingevuld, aantal uitgenodigden niet ingevuld',
    )
  })

  it('geeft geen percentage zonder noemer', () => {
    expect(completionPct(6, resolveInvitedDenominator({ invitedCount: 30, respondentRows: 6 }))).toBe(20)
    expect(completionPct(6, resolveInvitedDenominator({ invitedCount: null, respondentRows: 0 }))).toBeNull()
  })

  it('bevat geen em- of en-dashes', () => {
    expect(formatResponseBasis(1, { known: false, reason: DENOMINATOR_UNKNOWN_REASON })).not.toMatch(/[—–]/)
  })
})

import { describe, expect, it } from 'vitest'
import {
  getBillingReadinessCopy,
  getBillingRegistryStatusLabel,
  isBillingReadyForAssistedLaunch,
} from '@/lib/billing-registry'

describe('billing registry helpers', () => {
  it('keeps billing truth assisted and bounded', () => {
    expect(getBillingRegistryStatusLabel('draft')).toBe('Concept')
    expect(getBillingRegistryStatusLabel('active_manual')).toBe('Actief (handmatig)')
    expect(isBillingReadyForAssistedLaunch({ contractSigned: true, paymentMethodConfirmed: true })).toBe(true)
    expect(isBillingReadyForAssistedLaunch({ contractSigned: true, paymentMethodConfirmed: false })).toBe(false)
  })

  it('uses a customer-facing readiness signal instead of checkout language', () => {
    expect(getBillingReadinessCopy({ contractSigned: false, paymentMethodConfirmed: false })).toContain('assisted')
    expect(getBillingReadinessCopy({ contractSigned: true, paymentMethodConfirmed: true })).toContain('suite-activatie')
  })
})

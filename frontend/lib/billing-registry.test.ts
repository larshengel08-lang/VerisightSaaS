import { describe, expect, it } from 'vitest'
import {
  getBillingReadinessCopy,
  getBillingRegistryStatusLabel,
  getContractStateLabel,
  isBillingReadyForAssistedLaunch,
  summarizeBillingRegistry,
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

  it('summarizes live registry rows for admin surfaces', () => {
    expect(getContractStateLabel('signed')).toBe('Getekend')
    expect(
      summarizeBillingRegistry([
        {
          orgId: 'org_1',
          legalCustomerName: 'Org 1',
          contractState: 'signed',
          billingState: 'active_manual',
          paymentMethodConfirmed: true,
        },
        {
          orgId: 'org_2',
          legalCustomerName: 'Org 2',
          contractState: 'draft',
          billingState: 'draft',
          paymentMethodConfirmed: false,
        },
      ]),
    ).toEqual({
      total: 2,
      readyCount: 1,
      pendingCount: 1,
    })
  })
})

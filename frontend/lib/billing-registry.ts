export type ContractState = 'draft' | 'pending_signature' | 'signed'
export type BillingState = 'draft' | 'active_manual' | 'paused' | 'closed'

export interface BillingRegistryRow {
  orgId: string
  legalCustomerName: string
  contractState: ContractState
  billingState: BillingState
  paymentMethodConfirmed: boolean
}

export function getBillingRegistryStatusLabel(state: BillingState) {
  if (state === 'active_manual') return 'Actief (handmatig)'
  if (state === 'paused') return 'Gepauzeerd'
  if (state === 'closed') return 'Gesloten'
  return 'Concept'
}

export function isBillingReadyForAssistedLaunch(args: {
  contractSigned: boolean
  paymentMethodConfirmed: boolean
}) {
  return args.contractSigned && args.paymentMethodConfirmed
}

export function getBillingReadinessCopy(args: {
  contractSigned: boolean
  paymentMethodConfirmed: boolean
}) {
  return isBillingReadyForAssistedLaunch(args)
    ? 'Contract en betaalwijze zijn bevestigd; bounded suite-activatie kan assisted doorlopen.'
    : 'Billing en activatie blijven assisted: contract en betaalwijze worden eerst handmatig bevestigd.'
}

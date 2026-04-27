export type ContractState = 'draft' | 'pending_signature' | 'signed'
export type BillingState = 'draft' | 'active_manual' | 'paused' | 'closed'

export interface BillingRegistryRow {
  id?: string
  orgId: string
  organizationName?: string | null
  legalCustomerName: string
  contractState: ContractState
  billingState: BillingState
  paymentMethodConfirmed: boolean
  notes?: string | null
  createdAt?: string
  updatedAt?: string
}

export interface BillingRegistrySummary {
  total: number
  readyCount: number
  pendingCount: number
}

export function getBillingRegistryStatusLabel(state: BillingState) {
  if (state === 'active_manual') return 'Actief (handmatig)'
  if (state === 'paused') return 'Gepauzeerd'
  if (state === 'closed') return 'Gesloten'
  return 'Concept'
}

export function getContractStateLabel(state: ContractState) {
  if (state === 'signed') return 'Getekend'
  if (state === 'pending_signature') return 'Wacht op akkoord'
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

export function summarizeBillingRegistry(rows: BillingRegistryRow[]): BillingRegistrySummary {
  const readyCount = rows.filter((row) =>
    isBillingReadyForAssistedLaunch({
      contractSigned: row.contractState === 'signed',
      paymentMethodConfirmed: row.paymentMethodConfirmed,
    }),
  ).length

  return {
    total: rows.length,
    readyCount,
    pendingCount: rows.length - readyCount,
  }
}

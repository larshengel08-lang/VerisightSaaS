export type FutureActionCenterAdapterKey =
  | 'retention'
  | 'onboarding'
  | 'pulse'
  | 'leadership'

export type FutureActionCenterAdapterStatus = 'inactive'

export interface FutureActionCenterAdapter {
  key: FutureActionCenterAdapterKey
  label: string
  status: FutureActionCenterAdapterStatus
  liveEntryEnabled: false
}

const FUTURE_ADAPTERS: Record<FutureActionCenterAdapterKey, FutureActionCenterAdapter> = {
  retention: { key: 'retention', label: 'RetentieScan-adapter', status: 'inactive', liveEntryEnabled: false },
  onboarding: { key: 'onboarding', label: 'Onboarding-adapter', status: 'inactive', liveEntryEnabled: false },
  pulse: { key: 'pulse', label: 'Pulse-adapter', status: 'inactive', liveEntryEnabled: false },
  leadership: { key: 'leadership', label: 'Leadership-adapter', status: 'inactive', liveEntryEnabled: false },
}

export function getFutureActionCenterAdapter(key: FutureActionCenterAdapterKey) {
  return FUTURE_ADAPTERS[key]
}

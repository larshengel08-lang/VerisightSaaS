import { describe, expect, it } from 'vitest'
import {
  getCampaignStatusLabel,
  mapCheckpointToActionHref,
  mapExceptionToCategory,
  mapExceptionToImpactLabel,
} from './get-beheer-page-data'

describe('dashboard admin setup mappings', () => {
  it('maps setup checkpoints to the approved admin categories only', () => {
    expect(mapExceptionToCategory('implementation_intake')).toBe('CAMPAGNES')
    expect(mapExceptionToCategory('invite_readiness')).toBe('CAMPAGNES')
    expect(mapExceptionToCategory('import_qa')).toBe('DATA & IMPORT')
    expect(mapExceptionToCategory('client_activation')).toBe('TOEGANG & ROLLEN')
    expect(mapExceptionToCategory('first_value')).toBeNull()
    expect(mapExceptionToCategory('report_delivery')).toBeNull()
    expect(mapExceptionToCategory('first_management_use')).toBeNull()
  })

  it('maps setup checkpoints only to approved /beheer anchors', () => {
    expect(mapCheckpointToActionHref('implementation_intake')).toBe('/beheer#campagnes')
    expect(mapCheckpointToActionHref('invite_readiness')).toBe('/beheer#campagnes')
    expect(mapCheckpointToActionHref('import_qa')).toBe('/beheer#data-import')
    expect(mapCheckpointToActionHref('client_activation')).toBe('/beheer#toegang')
    expect(mapCheckpointToActionHref('first_value')).toBeNull()
  })

  it('maps exception statuses to the approved impact labels', () => {
    expect(mapExceptionToImpactLabel('blocked')).toBe('KAN NIET VERDER')
    expect(mapExceptionToImpactLabel('needs_operator_recovery')).toBe('OPERATOR INGREEP NODIG')
    expect(mapExceptionToImpactLabel('awaiting_client_input')).toBe('WACHT OP KLANTINPUT')
    expect(mapExceptionToImpactLabel('awaiting_external_delivery')).toBe('WACHT OP EXTERNE STAP')
    expect(mapExceptionToImpactLabel('none')).toBeNull()
  })

  it('uses the fixed three-state campaign status label', () => {
    expect(getCampaignStatusLabel([])).toBe('Geen campaigns')
    expect(getCampaignStatusLabel([{ is_active: false }, { is_active: false }])).toBe('Geen actieve campaigns')
    expect(getCampaignStatusLabel([{ is_active: true }, { is_active: false }])).toBe('Actief')
  })
})

import 'server-only'

import { randomUUID } from 'node:crypto'
import type { BillingRegistry } from '@/lib/types'
import type { BillingRegistryRow, BillingState, ContractState } from '@/lib/billing-registry'
import { isMissingSchemaError, readFallbackRegistryFile, writeFallbackRegistryFile } from '@/lib/runtime-registry-fallback'
import { createAdminClient } from '@/lib/supabase/admin'

type BillingRegistryDbRow = BillingRegistry
type OrganizationNameRow = { id: string; name: string }

function normalizeContractState(value: string): ContractState {
  return value === 'signed' || value === 'pending_signature' ? value : 'draft'
}

function normalizeBillingState(value: string): BillingState {
  return value === 'active_manual' || value === 'paused' || value === 'closed' ? value : 'draft'
}

export async function listBillingRegistryRows() {
  const admin = createAdminClient()
  const { data, error } = await admin
    .from('billing_registry')
    .select('id, org_id, legal_customer_name, contract_state, billing_state, payment_method_confirmed, notes, created_at, updated_at')
    .order('updated_at', { ascending: false })

  if (error) {
    if (isMissingSchemaError(error)) {
      return readFallbackRegistryFile<BillingRegistryRow[]>('billing-registry.json', [])
    }
    throw error
  }

  const registryRows = (data ?? []) as BillingRegistryDbRow[]
  const orgIds = [...new Set(registryRows.map((row) => row.org_id))]

  const { data: organizations, error: orgError } =
    orgIds.length > 0
      ? await admin.from('organizations').select('id, name').in('id', orgIds)
      : { data: [], error: null }

  if (orgError) throw orgError

  const organizationById = new Map(((organizations ?? []) as OrganizationNameRow[]).map((organization) => [organization.id, organization.name]))

  return registryRows.map(
    (row) =>
      ({
        id: row.id,
        orgId: row.org_id,
        organizationName: organizationById.get(row.org_id) ?? row.legal_customer_name,
        legalCustomerName: row.legal_customer_name,
        contractState: normalizeContractState(row.contract_state),
        billingState: normalizeBillingState(row.billing_state),
        paymentMethodConfirmed: row.payment_method_confirmed,
        notes: row.notes,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      }) satisfies BillingRegistryRow,
  )
}

export async function upsertBillingRegistryRow(input: {
  orgId: string
  legalCustomerName: string
  contractState: ContractState
  billingState: BillingState
  paymentMethodConfirmed: boolean
  notes?: string | null
}) {
  const admin = createAdminClient()
  const payload = {
    org_id: input.orgId,
    legal_customer_name: input.legalCustomerName,
    contract_state: input.contractState,
    billing_state: input.billingState,
    payment_method_confirmed: input.paymentMethodConfirmed,
    notes: input.notes ?? null,
  }

  const { error } = await admin.from('billing_registry').upsert(payload, { onConflict: 'org_id' })
  if (error) {
    if (isMissingSchemaError(error)) {
      const existing = await readFallbackRegistryFile<BillingRegistryRow[]>('billing-registry.json', [])
      const nextRow: BillingRegistryRow = {
        id: existing.find((row) => row.orgId === input.orgId)?.id ?? randomUUID(),
        orgId: input.orgId,
        organizationName: existing.find((row) => row.orgId === input.orgId)?.organizationName ?? input.legalCustomerName,
        legalCustomerName: input.legalCustomerName,
        contractState: input.contractState,
        billingState: input.billingState,
        paymentMethodConfirmed: input.paymentMethodConfirmed,
        notes: input.notes ?? null,
      }
      const next = [...existing.filter((row) => row.orgId !== input.orgId), nextRow]
      await writeFallbackRegistryFile('billing-registry.json', next)
      return next
    }
    throw error
  }

  return listBillingRegistryRows()
}

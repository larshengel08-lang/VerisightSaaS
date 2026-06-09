import 'server-only'

import { randomUUID } from 'node:crypto'
import type { EvidenceApprovalStatus } from '@/lib/case-proof-evidence'
import { createAdminClient } from '@/lib/supabase/admin'
import type { ProofRegistryEntry, ProofState } from '@/lib/proof-registry'
import { isMissingSchemaError, readFallbackRegistryFile, writeFallbackRegistryFile } from '@/lib/runtime-registry-fallback'

type ProofRegistryDbRow = {
  id: string
  org_id: string | null
  campaign_id: string | null
  route: string
  proof_state: string
  approval_state: string
  summary: string
  claimable_observation: string | null
  supporting_artifacts: unknown[] | null
  created_at: string
}

function normalizeProofState(value: string): ProofState {
  return value === 'internal_proof_only' || value === 'sales_usable' || value === 'public_usable' || value === 'rejected'
    ? value
    : 'lesson_only'
}

function normalizeApprovalState(value: string): EvidenceApprovalStatus | 'rejected' {
  return value === 'internal_review' ||
    value === 'claim_check' ||
    value === 'customer_permission' ||
    value === 'approved' ||
    value === 'rejected'
    ? value
    : 'draft'
}

export async function listProofRegistryEntries() {
  const admin = createAdminClient()
  const { data, error } = await admin
    .from('case_proof_registry')
    .select('id, org_id, campaign_id, route, proof_state, approval_state, summary, claimable_observation, supporting_artifacts, created_at')
    .order('created_at', { ascending: false })

  if (error) {
    if (isMissingSchemaError(error)) {
      return readFallbackRegistryFile<ProofRegistryEntry[]>('proof-registry.json', [])
    }
    throw error
  }

  return ((data ?? []) as ProofRegistryDbRow[]).map(
    (row) =>
      ({
        id: row.id,
        orgId: row.org_id,
        campaignId: row.campaign_id,
        route: row.route,
        proofState: normalizeProofState(row.proof_state),
        approvalState: normalizeApprovalState(row.approval_state),
        summary: row.summary,
        claimableObservation: row.claimable_observation,
        supportingArtifacts: Array.isArray(row.supporting_artifacts) ? row.supporting_artifacts : [],
        createdAt: row.created_at,
      }) satisfies ProofRegistryEntry,
  )
}

export async function upsertProofRegistryEntry(input: {
  id?: string
  orgId?: string | null
  campaignId?: string | null
  route: string
  proofState: ProofState
  approvalState: EvidenceApprovalStatus | 'rejected'
  summary: string
  claimableObservation?: string | null
  supportingArtifacts?: unknown[]
}) {
  const admin = createAdminClient()
  const payload = {
    ...(input.id ? { id: input.id } : {}),
    org_id: input.orgId ?? null,
    campaign_id: input.campaignId ?? null,
    route: input.route,
    proof_state: input.proofState,
    approval_state: input.approvalState,
    summary: input.summary,
    claimable_observation: input.claimableObservation ?? null,
    supporting_artifacts: input.supportingArtifacts ?? [],
  }

  const { error } = await admin.from('case_proof_registry').upsert(payload)
  if (error) {
    if (isMissingSchemaError(error)) {
      const existing = await readFallbackRegistryFile<ProofRegistryEntry[]>('proof-registry.json', [])
      const nextEntry: ProofRegistryEntry = {
        id: input.id ?? randomUUID(),
        orgId: input.orgId ?? null,
        campaignId: input.campaignId ?? null,
        route: input.route,
        proofState: input.proofState,
        approvalState: input.approvalState,
        summary: input.summary,
        claimableObservation: input.claimableObservation ?? null,
        supportingArtifacts: input.supportingArtifacts ?? [],
        createdAt: existing.find((entry) => entry.id === input.id)?.createdAt ?? new Date().toISOString(),
      }
      const next = [...existing.filter((entry) => entry.id !== nextEntry.id), nextEntry].sort((left, right) =>
        right.createdAt.localeCompare(left.createdAt),
      )
      await writeFallbackRegistryFile('proof-registry.json', next)
      return next
    }
    throw error
  }

  return listProofRegistryEntries()
}

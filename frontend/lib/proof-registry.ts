import type { EvidenceApprovalStatus, CaseEvidenceClosureStatus } from '@/lib/case-proof-evidence'

export type ProofState = Exclude<CaseEvidenceClosureStatus, 'rejected'> | 'rejected'

export interface ProofRegistryEntry {
  id: string
  orgId: string | null
  campaignId: string | null
  route: string
  proofState: ProofState
  approvalState: EvidenceApprovalStatus | 'rejected'
  summary: string
  claimableObservation: string | null
  supportingArtifacts: unknown[]
  createdAt: string
}

export interface ProofRegistrySummary {
  total: number
  lessonOnlyCount: number
  salesUsableCount: number
  publicUsableCount: number
}

export function getProofApprovalLabel(state: EvidenceApprovalStatus | 'rejected') {
  if (state === 'approved') return 'Goedgekeurd'
  if (state === 'rejected') return 'Afgewezen'
  if (state === 'internal_review') return 'Interne review'
  if (state === 'claim_check') return 'Claim check'
  if (state === 'customer_permission') return 'Klanttoestemming'
  return 'Concept'
}

export function getProofStateLabel(state: ProofState) {
  if (state === 'internal_proof_only') return 'Alleen intern'
  if (state === 'sales_usable') return 'Sales-usable'
  if (state === 'public_usable') return 'Publiek bruikbaar'
  if (state === 'rejected') return 'Afgewezen'
  return 'Lesson only'
}

export function summarizeProofRegistry(entries: ProofRegistryEntry[]): ProofRegistrySummary {
  return {
    total: entries.length,
    lessonOnlyCount: entries.filter((entry) => entry.proofState === 'lesson_only').length,
    salesUsableCount: entries.filter((entry) => entry.proofState === 'sales_usable').length,
    publicUsableCount: entries.filter((entry) => entry.proofState === 'public_usable').length,
  }
}

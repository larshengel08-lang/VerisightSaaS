import type { EvidenceApprovalStatus, CaseEvidenceClosureStatus } from '@/lib/case-proof-evidence'

export type ProofState = Exclude<CaseEvidenceClosureStatus, 'rejected'> | 'rejected'

export function getProofApprovalLabel(state: EvidenceApprovalStatus | 'rejected') {
  if (state === 'approved') return 'Goedgekeurd'
  if (state === 'rejected') return 'Afgewezen'
  if (state === 'internal_review') return 'Interne review'
  if (state === 'claim_check') return 'Claim check'
  if (state === 'customer_permission') return 'Klanttoestemming'
  return 'Concept'
}

export function canPublishProofCard(args: {
  proofState: 'lesson_only' | 'internal_proof_only' | 'sales_usable' | 'public_usable' | 'rejected'
  approvalState: 'draft' | 'internal_review' | 'claim_check' | 'customer_permission' | 'approved' | 'rejected'
}) {
  return args.proofState === 'public_usable' && args.approvalState === 'approved'
}

export function mapPublicProofCard(args: {
  route: string
  summary: string
  claimableObservation?: string | null
}) {
  return {
    title: `${args.route} in gebruik`,
    body: args.claimableObservation?.trim() || args.summary,
    approval: 'public_usable' as const,
  }
}

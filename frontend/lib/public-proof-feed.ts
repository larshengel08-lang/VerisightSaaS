export function canPublishProofCard(args: {
  proofState: 'lesson_only' | 'internal_proof_only' | 'sales_usable' | 'public_usable' | 'rejected'
  approvalState: 'draft' | 'internal_review' | 'claim_check' | 'customer_permission' | 'approved' | 'rejected'
}) {
  return args.proofState === 'public_usable' && args.approvalState === 'approved'
}

export type EvidenceTier =
  | 'deliverable_proof'
  | 'trust_proof'
  | 'validation_evidence'
  | 'case_candidate'
  | 'approved_case_proof'
  | 'reference_ready'

export type EvidenceApprovalStatus =
  | 'draft'
  | 'internal_review'
  | 'claim_check'
  | 'customer_permission'
  | 'approved'

export type CaseEvidenceClosureStatus =
  | 'lesson_only'
  | 'internal_proof_only'
  | 'sales_usable'
  | 'public_usable'
  | 'rejected'

export type CasePermissionStatus =
  | 'not_requested'
  | 'internal_only'
  | 'anonymous_case_only'
  | 'named_quote_allowed'
  | 'named_case_allowed'
  | 'reference_only'
  | 'declined'

export type CasePotential = 'laag' | 'middel' | 'hoog'

export type CaseOutcomeQuality = 'nog_onvoldoende' | 'indicatief' | 'stevig'

export type CaseOutcomeClass =
  | 'kwalitatieve_les'
  | 'operationele_uitkomst'
  | 'management_adoptie'
  | 'herhaalgebruik'
  | 'kwantitatieve_uitkomst'

export type EvidenceSurface = 'site' | 'sales' | 'demo' | 'pricing' | 'trust' | 'follow_up'

export const EVIDENCE_TIER_OPTIONS: Array<{ value: EvidenceTier; label: string }> = [
  { value: 'deliverable_proof', label: 'Deliverable-proof' },
  { value: 'trust_proof', label: 'Trustproof' },
  { value: 'validation_evidence', label: 'Validation evidence' },
  { value: 'case_candidate', label: 'Case candidate' },
  { value: 'approved_case_proof', label: 'Approved case-proof' },
  { value: 'reference_ready', label: 'Reference-ready' },
]

export const EVIDENCE_APPROVAL_STATUS_OPTIONS: Array<{ value: EvidenceApprovalStatus; label: string }> = [
  { value: 'draft', label: 'Draft' },
  { value: 'internal_review', label: 'Internal review' },
  { value: 'claim_check', label: 'Claim check' },
  { value: 'customer_permission', label: 'Customer permission' },
  { value: 'approved', label: 'Approved' },
]

export const CASE_EVIDENCE_CLOSURE_OPTIONS: Array<{ value: CaseEvidenceClosureStatus; label: string }> = [
  { value: 'lesson_only', label: 'Lesson only' },
  { value: 'internal_proof_only', label: 'Internal proof only' },
  { value: 'sales_usable', label: 'Sales-usable' },
  { value: 'public_usable', label: 'Public-usable' },
  { value: 'rejected', label: 'Rejected' },
]

export const CASE_PERMISSION_STATUS_OPTIONS: Array<{ value: CasePermissionStatus; label: string }> = [
  { value: 'not_requested', label: 'Nog niet gevraagd' },
  { value: 'internal_only', label: 'Alleen intern' },
  { value: 'anonymous_case_only', label: 'Alleen anonieme case' },
  { value: 'named_quote_allowed', label: 'Named quote toegestaan' },
  { value: 'named_case_allowed', label: 'Named case toegestaan' },
  { value: 'reference_only', label: 'Alleen reference' },
  { value: 'declined', label: 'Geweigerd' },
]

export const CASE_POTENTIAL_OPTIONS: Array<{ value: CasePotential; label: string }> = [
  { value: 'laag', label: 'Laag' },
  { value: 'middel', label: 'Middel' },
  { value: 'hoog', label: 'Hoog' },
]

export const CASE_OUTCOME_QUALITY_OPTIONS: Array<{ value: CaseOutcomeQuality; label: string }> = [
  { value: 'nog_onvoldoende', label: 'Nog onvoldoende' },
  { value: 'indicatief', label: 'Indicatief' },
  { value: 'stevig', label: 'Stevig' },
]

export const CASE_OUTCOME_CLASS_OPTIONS: Array<{ value: CaseOutcomeClass; label: string }> = [
  { value: 'kwalitatieve_les', label: 'Kwalitatieve les' },
  { value: 'operationele_uitkomst', label: 'Operationele uitkomst' },
  { value: 'management_adoptie', label: 'Managementadoptie' },
  { value: 'herhaalgebruik', label: 'Herhaalgebruik' },
  { value: 'kwantitatieve_uitkomst', label: 'Kwantitatieve uitkomst' },
]

export const EVIDENCE_SURFACE_MATRIX: Array<{
  surface: EvidenceSurface
  allowedTiers: EvidenceTier[]
  defaultTier: EvidenceTier
  blockedTiers: EvidenceTier[]
  note: string
}> = [
  {
    surface: 'site',
    allowedTiers: ['deliverable_proof', 'trust_proof', 'approved_case_proof'],
    defaultTier: 'deliverable_proof',
    blockedTiers: ['validation_evidence', 'case_candidate', 'reference_ready'],
    note: 'Site blijft sample-first totdat approved case-proof bestaat.',
  },
  {
    surface: 'sales',
    allowedTiers: ['deliverable_proof', 'trust_proof', 'validation_evidence', 'approved_case_proof', 'reference_ready'],
    defaultTier: 'deliverable_proof',
    blockedTiers: ['case_candidate'],
    note: 'Sales mag warm bewijs gebruiken, maar geen ruwe case-candidates.',
  },
  {
    surface: 'demo',
    allowedTiers: ['deliverable_proof', 'trust_proof'],
    defaultTier: 'deliverable_proof',
    blockedTiers: ['validation_evidence', 'case_candidate', 'approved_case_proof', 'reference_ready'],
    note: 'Demo en showcase blijven illustratief en geen klantbewijs.',
  },
  {
    surface: 'pricing',
    allowedTiers: ['deliverable_proof', 'trust_proof', 'approved_case_proof'],
    defaultTier: 'deliverable_proof',
    blockedTiers: ['validation_evidence', 'case_candidate', 'reference_ready'],
    note: 'Pricing gebruikt bewijs alleen ondersteunend aan het deliverable.',
  },
  {
    surface: 'trust',
    allowedTiers: ['deliverable_proof', 'trust_proof', 'approved_case_proof'],
    defaultTier: 'trust_proof',
    blockedTiers: ['validation_evidence', 'case_candidate', 'reference_ready'],
    note: 'Trust toont productgrenzen en mag geen verborgen outcome claim dragen.',
  },
  {
    surface: 'follow_up',
    allowedTiers: ['trust_proof', 'approved_case_proof', 'reference_ready'],
    defaultTier: 'approved_case_proof',
    blockedTiers: ['deliverable_proof', 'validation_evidence', 'case_candidate'],
    note: 'Follow-up mag gerichter bewijs inzetten om vervolgbeweging te ondersteunen.',
  },
]

export const CASE_PROOF_FORMATS: Array<{
  id: 'mini_case' | 'anonymous_case' | 'quote_card' | 'reference_note' | 'outcome_summary' | 'objection_proof_snippet'
  label: string
  minimumTier: EvidenceTier
  disclaimer: string
}> = [
  {
    id: 'mini_case',
    label: 'Mini-case',
    minimumTier: 'approved_case_proof',
    disclaimer: 'Gebruik alleen met expliciete claim boundary en zonder named claims zonder toestemming.',
  },
  {
    id: 'anonymous_case',
    label: 'Anonieme case',
    minimumTier: 'approved_case_proof',
    disclaimer: 'Standaard eerste publieke route wanneer named proof nog niet mag.',
  },
  {
    id: 'quote_card',
    label: 'Quote card',
    minimumTier: 'approved_case_proof',
    disclaimer: 'Named of herleidbare quote alleen na expliciete toestemming.',
  },
  {
    id: 'reference_note',
    label: 'Reference note',
    minimumTier: 'reference_ready',
    disclaimer: 'Alleen voor warme salescontext, niet voor generieke publieke inzet.',
  },
  {
    id: 'outcome_summary',
    label: 'Outcome summary',
    minimumTier: 'approved_case_proof',
    disclaimer: 'Gebruik alleen outcome claims die herleidbaar en zorgvuldig geclaimd zijn.',
  },
  {
    id: 'objection_proof_snippet',
    label: 'Objection-proof snippet',
    minimumTier: 'approved_case_proof',
    disclaimer: 'Kort bewijsblok voor salesvragen, nooit buiten de claim boundary.',
  },
]

export function getEvidenceTierLabel(value: EvidenceTier) {
  return EVIDENCE_TIER_OPTIONS.find((option) => option.value === value)?.label ?? 'Deliverable-proof'
}

export function getEvidenceApprovalLabel(value: EvidenceApprovalStatus) {
  return EVIDENCE_APPROVAL_STATUS_OPTIONS.find((option) => option.value === value)?.label ?? 'Draft'
}

export function getCaseClosureLabel(value: CaseEvidenceClosureStatus) {
  return CASE_EVIDENCE_CLOSURE_OPTIONS.find((option) => option.value === value)?.label ?? 'Lesson only'
}

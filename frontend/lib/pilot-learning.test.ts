import { describe, expect, it } from 'vitest'
import {
  buildLearningObjectiveSignals,
  CASE_APPROVAL_STATUS_OPTIONS,
  CASE_EVIDENCE_CLOSURE_OPTIONS,
  CASE_OUTCOME_CLASS_OPTIONS,
  CASE_OUTCOME_QUALITY_OPTIONS,
  CASE_PERMISSION_STATUS_OPTIONS,
  CASE_POTENTIAL_OPTIONS,
  createDefaultLearningCheckpoints,
  LEARNING_CHECKPOINT_DEFINITIONS,
  LEARNING_DESTINATION_OPTIONS,
  LEARNING_TRIAGE_STATUS_OPTIONS,
} from '@/lib/pilot-learning'

describe('pilot learning defaults', () => {
  it('keeps the canonical checkpoint order aligned with the lifecycle', () => {
    expect(LEARNING_CHECKPOINT_DEFINITIONS.map((definition) => definition.key)).toEqual([
      'lead_route_hypothesis',
      'implementation_intake',
      'launch_output',
      'first_management_use',
      'follow_up_review',
    ])
  })

  it('creates default checkpoints with neutral triage defaults', () => {
    expect(createDefaultLearningCheckpoints()).toEqual([
      expect.objectContaining({ checkpoint_key: 'lead_route_hypothesis', status: 'nieuw', lesson_strength: 'incidentele_observatie' }),
      expect.objectContaining({ checkpoint_key: 'implementation_intake', status: 'nieuw', lesson_strength: 'incidentele_observatie' }),
      expect.objectContaining({ checkpoint_key: 'launch_output', status: 'nieuw', lesson_strength: 'incidentele_observatie' }),
      expect.objectContaining({ checkpoint_key: 'first_management_use', status: 'nieuw', lesson_strength: 'incidentele_observatie' }),
      expect.objectContaining({ checkpoint_key: 'follow_up_review', status: 'nieuw', lesson_strength: 'incidentele_observatie' }),
    ])
    expect(LEARNING_TRIAGE_STATUS_OPTIONS.map((option) => option.value)).toEqual([
      'nieuw',
      'bevestigd',
      'geparkeerd',
      'uitgevoerd',
      'verworpen',
    ])
    expect(LEARNING_DESTINATION_OPTIONS.map((option) => option.value)).toEqual([
      'product',
      'report',
      'onboarding',
      'sales',
      'operations',
    ])
    expect(CASE_EVIDENCE_CLOSURE_OPTIONS.map((option) => option.value)).toEqual([
      'lesson_only',
      'internal_proof_only',
      'sales_usable',
      'public_usable',
      'rejected',
    ])
    expect(CASE_APPROVAL_STATUS_OPTIONS.map((option) => option.value)).toEqual([
      'draft',
      'internal_review',
      'claim_check',
      'customer_permission',
      'approved',
    ])
    expect(CASE_PERMISSION_STATUS_OPTIONS.map((option) => option.value)).toContain('anonymous_case_only')
    expect(CASE_POTENTIAL_OPTIONS.map((option) => option.value)).toEqual(['laag', 'middel', 'hoog'])
    expect(CASE_OUTCOME_QUALITY_OPTIONS.map((option) => option.value)).toEqual([
      'nog_onvoldoende',
      'indicatief',
      'stevig',
    ])
    expect(CASE_OUTCOME_CLASS_OPTIONS.map((option) => option.value)).toContain('management_adoptie')
  })

  it('builds route-aware objective signals from lead and campaign context', () => {
    const signals = buildLearningObjectiveSignals({
      checkpointKey: 'launch_output',
      dossier: {
        route_interest: 'exitscan',
        delivery_mode: 'baseline',
        scan_type: 'exit',
        expected_first_value: 'Eerste managementduiding op vertrekpatronen',
        first_management_value: null,
        first_action_taken: null,
        review_moment: null,
        next_route: null,
        stop_reason: null,
        management_action_outcome: null,
        adoption_outcome: null,
        trust_friction: null,
      },
      contactRequest: {
        id: 'lead-1',
        name: 'Lars',
        work_email: 'lars@example.com',
        organization: 'Verisight',
        employee_count: '50-100',
        route_interest: 'exitscan',
        cta_source: 'website_primary_cta',
        desired_timing: 'deze-maand',
        current_question: 'Waarom vertrekken mensen nu?',
        notification_sent: true,
        notification_error: null,
        ops_stage: 'lead_captured',
        ops_exception_status: 'none',
        ops_owner: null,
        ops_next_step: null,
        ops_handoff_note: null,
        qualification_status: 'not_reviewed',
        qualified_route: null,
        qualification_note: null,
        qualification_reviewed_by: null,
        qualification_reviewed_at: null,
        commercial_agreement_status: 'not_started',
        commercial_pricing_mode: null,
        commercial_start_readiness_status: 'not_ready',
        commercial_start_blocker: null,
        commercial_agreement_confirmed_by: null,
        commercial_agreement_confirmed_at: null,
        commercial_readiness_reviewed_by: null,
        commercial_readiness_reviewed_at: null,
        last_contacted_at: null,
        created_at: '2026-04-15T10:00:00Z',
      },
      campaignStats: {
        campaign_id: 'cmp-1',
        campaign_name: 'ExitScan Q2',
        scan_type: 'exit',
        organization_id: 'org-1',
        is_active: true,
        created_at: '2026-04-15T10:00:00Z',
        total_invited: 20,
        total_completed: 12,
        completion_rate_pct: 60,
        avg_risk_score: 6.2,
        band_high: 4,
        band_medium: 5,
        band_low: 3,
      },
      activeClientAccessCount: 1,
      pendingClientInviteCount: 2,
    })

    expect(signals.join(' ')).toContain('Respons: 12/20 (60%).')
    expect(signals.join(' ')).toContain('Pattern-level drempel bereikt')
    expect(signals.join(' ')).toContain('2 klantinvite(s) wachten nog op activatie.')
  })

  it('keeps follow-up review signals tied to management value before expansion', () => {
    const signals = buildLearningObjectiveSignals({
      checkpointKey: 'follow_up_review',
      dossier: {
        route_interest: 'exitscan',
        delivery_mode: 'baseline',
        scan_type: 'exit',
        expected_first_value: 'Eerste managementduiding op vertrekpatronen',
        first_management_value: 'MT ziet voor het eerst welke vertrekredenen bestuurlijk prioriteit vragen.',
        first_action_taken: 'Eerste handoff naar leidinggevenden ingepland.',
        review_moment: 'Review over 45 dagen.',
        next_route: 'RetentieScan Baseline',
        stop_reason: null,
        management_action_outcome: 'MT heeft eigenaar, eerste actie en reviewmoment vastgelegd.',
        adoption_outcome: 'Eerste managementsessie succesvol gevoerd.',
        trust_friction: null,
      },
    })

    expect(signals.join(' ')).toContain('Gekozen vervolgroute: RetentieScan Baseline.')
    expect(signals.join(' ')).toContain('Reviewmoment vastgelegd: Review over 45 dagen.')
    expect(signals.join(' ')).toContain('Adoptionuitkomst is expliciet vastgelegd.')
    expect(signals.join(' ')).toContain('eerste managementactie of reviewuitkomst')
    expect(signals.join(' ')).toContain('in plaats van een losse upsell')
  })

  it('frames first management use for mto as a broad main measurement with explicit action logging', () => {
    const signals = buildLearningObjectiveSignals({
      checkpointKey: 'first_management_use',
      dossier: {
        route_interest: 'combinatie',
        delivery_mode: 'baseline',
        scan_type: 'mto',
        expected_first_value: 'Eerste brede hoofdmeting en prioritering',
        first_management_value: 'MT ziet voor het eerst welke organisatiethema\'s prioriteit vragen.',
        first_action_taken: 'Eerste brede managementhuddle gepland.',
        review_moment: 'Review over 60 dagen.',
        next_route: null,
        stop_reason: null,
        management_action_outcome: 'Eerste eigenaar, actie en reviewmoment vastgelegd.',
        adoption_outcome: null,
        trust_friction: null,
      },
      campaignStats: {
        campaign_id: 'cmp-mto-1',
        campaign_name: 'MTO Najaar',
        scan_type: 'mto',
        organization_id: 'org-1',
        is_active: true,
        created_at: '2026-04-18T10:00:00Z',
        total_invited: 40,
        total_completed: 18,
        completion_rate_pct: 45,
        avg_risk_score: 6.8,
        band_high: 8,
        band_medium: 6,
        band_low: 4,
      },
      activeClientAccessCount: 1,
    })

    expect(signals.join(' ')).toContain('MTO heeft genoeg responses voor een stevige brede hoofdmeting.')
    expect(signals.join(' ')).toContain('managementactie-uitkomst')
    expect(signals.join(' ')).toContain('eerste managementwaarde')
  })
})

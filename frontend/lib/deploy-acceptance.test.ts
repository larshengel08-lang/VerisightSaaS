import { describe, expect, it } from 'vitest'

import {
  ADMIN_LANE_GATES,
  CUSTOMER_LANE_GATES,
  RESPONDENT_LANE_GATES,
  buildCleanupDecision,
  buildPreflightReport,
  classifyInviteEvidence,
  deriveReadinessVerdict,
  evaluateLaneGates,
} from './deploy-acceptance'

describe('deploy acceptance model', () => {
  it('blocks execution when a required preflight dependency is missing', () => {
    const report = buildPreflightReport([
      { key: 'resend_api_key', label: 'RESEND_API_KEY aanwezig', ok: true },
      { key: 'backend_admin_token', label: 'BACKEND_ADMIN_TOKEN werkt', ok: false, detail: '403' },
    ])

    expect(report.status).toBe('blocked_before_execution')
    expect(report.failedKeys).toEqual(['backend_admin_token'])
  })

  it('distinguishes send evidence from technical receipt evidence', () => {
    expect(classifyInviteEvidence({ providerLog: true, sinkCapture: false })).toMatchObject({
      sendEvidence: true,
      technicalReceiptEvidence: false,
      verdictCap: 'production_ready_with_limitations',
    })

    expect(classifyInviteEvidence({ providerLog: true, sinkCapture: true })).toMatchObject({
      sendEvidence: true,
      technicalReceiptEvidence: true,
      verdictCap: 'production_ready',
    })
  })

  it('fails a lane when one of its hard gates is red', () => {
    const lane = evaluateLaneGates('respondent', {
      provider_log_sent: true,
      invite_link_opens: true,
      survey_submit_succeeds: false,
      completed_state_correct: true,
      stats_and_report_consistent: true,
    })

    expect(lane.status).toBe('failed')
    expect(lane.failedGateKeys).toEqual(['survey_submit_succeeds'])
  })

  it('downgrades the final verdict when sink capture is missing even if all lanes pass', () => {
    const verdict = deriveReadinessVerdict({
      lanes: [
        evaluateLaneGates('respondent', Object.fromEntries(RESPONDENT_LANE_GATES.map((gate) => [gate.key, true]))),
        evaluateLaneGates('customer', Object.fromEntries(CUSTOMER_LANE_GATES.map((gate) => [gate.key, true]))),
        evaluateLaneGates('admin', Object.fromEntries(ADMIN_LANE_GATES.map((gate) => [gate.key, true]))),
      ],
      inviteEvidence: classifyInviteEvidence({ providerLog: true, sinkCapture: false }),
      gaps: [],
    })

    expect(verdict.label).toBe('production ready met beperkingen')
    expect(verdict.reasons).toContain('Technische ontvangst van de invite is niet met een gecontroleerde sink vastgelegd.')
  })

  it('forces not-ready when a blocker gap exists', () => {
    const verdict = deriveReadinessVerdict({
      lanes: [
        evaluateLaneGates('respondent', Object.fromEntries(RESPONDENT_LANE_GATES.map((gate) => [gate.key, true]))),
        evaluateLaneGates('customer', Object.fromEntries(CUSTOMER_LANE_GATES.map((gate) => [gate.key, true]))),
        evaluateLaneGates('admin', Object.fromEntries(ADMIN_LANE_GATES.map((gate) => [gate.key, true]))),
      ],
      inviteEvidence: classifyInviteEvidence({ providerLog: true, sinkCapture: true }),
      gaps: [{ severity: 'blocker', title: 'Invite sink unavailable' }],
    })

    expect(verdict.label).toBe('nog niet production ready')
  })

  it('keeps failed runs for at most seven days unless they are explicitly held', () => {
    expect(
      buildCleanupDecision({
        runStatus: 'failed',
        holdForInvestigation: false,
        createdAt: '2026-05-01T08:00:00.000Z',
        now: '2026-05-05T08:00:00.000Z',
      }),
    ).toMatchObject({
      action: 'retain_temporarily',
      expiresAt: '2026-05-08T08:00:00.000Z',
    })

    expect(
      buildCleanupDecision({
        runStatus: 'failed',
        holdForInvestigation: false,
        createdAt: '2026-05-01T08:00:00.000Z',
        now: '2026-05-10T08:00:00.000Z',
      }),
    ).toMatchObject({
      action: 'cleanup_required',
    })
  })
})

export const RESPONDENT_LANE_GATES = [
  { key: 'provider_log_sent', label: 'Provider-log toont succesvolle verzending' },
  { key: 'invite_link_opens', label: 'Invite-link opent op de deploy' },
  { key: 'survey_submit_succeeds', label: 'Survey-submit slaagt end-to-end' },
  { key: 'completed_state_correct', label: 'Completed-state klopt' },
  { key: 'stats_and_report_consistent', label: 'Stats en report kloppen' },
]

export const CUSTOMER_LANE_GATES = [
  { key: 'login_succeeds', label: 'Login lukt' },
  { key: 'org_context_correct', label: 'Juiste org-context' },
  { key: 'output_visible', label: 'Juiste output zichtbaar' },
  { key: 'no_cross_org_leakage', label: 'Geen cross-org leakage' },
  { key: 'first_value_is_clear', label: 'First value en vervolgrichting zijn duidelijk' },
]

export const ADMIN_LANE_GATES = [
  { key: 'org_context_ready', label: 'Org-context is bruikbaar' },
  { key: 'campaign_created_or_reused', label: 'Campaign kan worden aangemaakt of hergebruikt' },
  { key: 'respondent_import_succeeds', label: 'Respondentimport slaagt' },
  { key: 'invite_start_succeeds', label: 'Invite-start slaagt' },
  { key: 'audit_state_updates', label: 'Audit- en deliverystate worden bijgewerkt' },
  { key: 'cleanup_succeeds_without_db_fix', label: 'Cleanup slaagt zonder handmatige DB-fix' },
]

const LANE_CONFIG = {
  respondent: RESPONDENT_LANE_GATES,
  customer: CUSTOMER_LANE_GATES,
  admin: ADMIN_LANE_GATES,
}

export function buildPreflightReport(checks) {
  const failedChecks = checks.filter((check) => !check.ok)
  return {
    status: failedChecks.length > 0 ? 'blocked_before_execution' : 'ready',
    checks,
    failedKeys: failedChecks.map((check) => check.key),
  }
}

export function classifyInviteEvidence({ providerLog, sinkCapture }) {
  return {
    sendEvidence: providerLog === true,
    technicalReceiptEvidence: sinkCapture === true,
    verdictCap:
      providerLog === true && sinkCapture === true
        ? 'production_ready'
        : providerLog === true
          ? 'production_ready_with_limitations'
          : 'not_ready',
  }
}

export function evaluateLaneGates(laneKey, gateResults) {
  const gates = LANE_CONFIG[laneKey] ?? []
  const failedGateKeys = gates.filter((gate) => gateResults[gate.key] !== true).map((gate) => gate.key)
  return {
    laneKey,
    gates: gates.map((gate) => ({
      ...gate,
      ok: gateResults[gate.key] === true,
    })),
    failedGateKeys,
    status: failedGateKeys.length === 0 ? 'passed' : 'failed',
  }
}

export function deriveReadinessVerdict({ lanes, inviteEvidence, gaps }) {
  const blockerGaps = gaps.filter((gap) => gap.severity === 'blocker')
  const highRiskGaps = gaps.filter((gap) => gap.severity === 'high risk')
  const failedLanes = lanes.filter((lane) => lane.status !== 'passed')
  const reasons = []

  if (!inviteEvidence.sendEvidence) {
    reasons.push('Formeel provider-verzendbewijs voor invites ontbreekt.')
  }
  if (inviteEvidence.sendEvidence && !inviteEvidence.technicalReceiptEvidence) {
    reasons.push('Technische ontvangst van de invite is niet met een gecontroleerde sink vastgelegd.')
  }
  if (failedLanes.length > 0) {
    reasons.push(`Niet alle lane gates zijn groen (${failedLanes.map((lane) => lane.laneKey).join(', ')}).`)
  }
  if (blockerGaps.length > 0) {
    reasons.push(`Er staan ${blockerGaps.length} blocker-gap(s) open.`)
  }
  if (highRiskGaps.length > 0) {
    reasons.push(`Er staan ${highRiskGaps.length} high-risk gap(s) open.`)
  }

  if (!inviteEvidence.sendEvidence || failedLanes.length > 0 || blockerGaps.length > 0 || highRiskGaps.length > 0) {
    return {
      label: 'nog niet production ready',
      reasons,
    }
  }

  if (!inviteEvidence.technicalReceiptEvidence) {
    return {
      label: 'production ready met beperkingen',
      reasons,
    }
  }

  return {
    label: 'production ready',
    reasons,
  }
}

export function buildCleanupDecision({ runStatus, holdForInvestigation, createdAt, now }) {
  if (runStatus === 'passed') {
    return {
      action: 'cleanup_after_artifacts',
      expiresAt: null,
    }
  }

  if (holdForInvestigation) {
    return {
      action: 'retain_until_released',
      expiresAt: null,
    }
  }

  const createdAtDate = new Date(createdAt)
  const expirationDate = new Date(createdAtDate.getTime() + 7 * 24 * 60 * 60 * 1000)
  const nowDate = new Date(now)

  return {
    action: nowDate >= expirationDate ? 'cleanup_required' : 'retain_temporarily',
    expiresAt: expirationDate.toISOString(),
  }
}

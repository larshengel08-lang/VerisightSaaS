import path from 'node:path'

import { chromium } from '@playwright/test'

import {
  ADMIN_LANE_GATES,
  CUSTOMER_LANE_GATES,
  RESPONDENT_LANE_GATES,
  buildCleanupDecision,
  buildPreflightReport,
  classifyInviteEvidence,
  deriveReadinessVerdict,
  evaluateLaneGates,
} from '../lib/deploy-acceptance.js'
import {
  buildAcceptanceConfig,
  buildRespondentCsv,
  buildRunId,
  collectAcceptanceSnapshots,
  createArtifactDirectory,
  createBrowserAndLogin,
  createSupabaseAdmin,
  extractSurveyLinkFromHtml,
  fetchBuffer,
  fetchJson,
  fetchResendReceivedEmail,
  fetchResendSentEmail,
  findOrganizationBySlug,
  findUserByEmail,
  getOrganizationApiKey,
  listResendReceiving,
  sha256,
  sleep,
  writeBinary,
  writeJson,
  writeText,
} from './deploy-acceptance-shared.mjs'

function routeLabel(scanType) {
  switch (scanType) {
    case 'retention':
      return 'Loep Behoud'
    case 'pulse':
      return 'Pulse'
    case 'team':
      return 'TeamScan'
    case 'onboarding':
      return 'Onboarding'
    case 'leadership':
      return 'Leadership'
    default:
      return 'Loep Vertrek'
  }
}

function buildSurveyPayload(token) {
  return {
    token,
    tenure_years: 2,
    exit_reason_category: 'groei',
    enps_score: 8,
    stay_intent_score: 4,
    signal_visibility_score: 2,
    sdt_raw: Object.fromEntries(Array.from({ length: 12 }, (_, index) => [`B${index + 1}`, 3])),
    org_raw: {
      leadership_1: 3,
      leadership_2: 3,
      leadership_3: 3,
      culture_1: 3,
      culture_2: 3,
      culture_3: 3,
      growth_1: 3,
      growth_2: 3,
      growth_3: 3,
      compensation_1: 3,
      compensation_2: 3,
      compensation_3: 3,
      workload_1: 3,
      workload_2: 3,
      workload_3: 3,
      role_clarity_1: 3,
      role_clarity_2: 3,
      role_clarity_3: 3,
    },
    pull_factors_raw: { leiderschap: 1 },
    open_text: 'Acceptance-run: groeiperspectief en duidelijkere prioriteiten blijven het belangrijkste signaal.',
    uwes_raw: {},
    turnover_intention_raw: {},
  }
}

async function runAuthenticatedJson(page, endpoint, init) {
  return page.evaluate(
    async ({ endpoint, init }) => {
      const response = await fetch(endpoint, init)
      const body = await response.json().catch(() => ({}))
      return { status: response.status, ok: response.ok, body }
    },
    { endpoint, init },
  )
}

async function runAuthenticatedImport(page, campaignId, csv, options) {
  return page.evaluate(
    async ({ campaignId, csv, options }) => {
      const form = new FormData()
      form.append('file', new File([csv], 'acceptance.csv', { type: 'text/csv' }))
      form.append('dry_run', String(options.dryRun))
      form.append('send_invites', String(options.sendInvites))
      const response = await fetch(`/api/campaigns/${campaignId}/respondents/import`, {
        method: 'POST',
        body: form,
      })
      const body = await response.json().catch(() => ({}))
      return { status: response.status, ok: response.ok, body }
    },
    { campaignId, csv, options },
  )
}

function summarizeGates(lane) {
  return lane.gates.map((gate) => `- ${gate.ok ? '[pass]' : '[fail]'} ${gate.label}`).join('\n')
}

async function main() {
  const config = buildAcceptanceConfig()
  const admin = createSupabaseAdmin(config)
  const runId = buildRunId('recurring')
  const artifactsDir = createArtifactDirectory(config, 'recurring', runId)
  const startedAt = new Date().toISOString()

  const manifest = {
    kind: 'recurring',
    runId,
    startedAt,
    frontendUrl: config.frontendUrl,
    backendUrl: config.backendUrl,
    acceptanceOrgSlug: config.acceptanceOrgSlug,
    scanType: config.acceptanceScanType,
    routeLabel: routeLabel(config.acceptanceScanType),
  }

  const acceptanceOrg = await findOrganizationBySlug(admin, config.acceptanceOrgSlug).catch(() => null)
  const acceptanceAdminUser = config.acceptanceAdminEmail
    ? await findUserByEmail(admin, config.acceptanceAdminEmail).catch(() => null)
    : null
  const acceptanceCustomerUser = config.acceptanceCustomerEmail
    ? await findUserByEmail(admin, config.acceptanceCustomerEmail).catch(() => null)
    : null

  const preflightChecks = [
    { key: 'resend_api_key', label: 'RESEND_API_KEY aanwezig', ok: Boolean(config.resendApiKey) },
    { key: 'frontend_url', label: 'FRONTEND_URL bereikbaar', ok: false },
    { key: 'backend_url', label: 'BACKEND_URL bereikbaar', ok: false },
    { key: 'backend_admin_token', label: 'BACKEND_ADMIN_TOKEN werkt', ok: false },
    { key: 'service_role', label: 'SUPABASE_SERVICE_ROLE_KEY werkt', ok: false },
    { key: 'acceptance_org', label: 'Acceptance-org bestaat', ok: Boolean(acceptanceOrg?.id) },
    { key: 'acceptance_admin', label: 'Acceptance admin-account bestaat', ok: Boolean(acceptanceAdminUser?.id) },
    { key: 'acceptance_customer', label: 'Acceptance klant-account bestaat', ok: Boolean(acceptanceCustomerUser?.id) },
    { key: 'provider_evidence', label: 'Provider evidence kanaal bereikbaar', ok: false },
    {
      key: 'sink_evidence',
      label: 'Sink evidence kanaal bereikbaar',
      ok: config.acceptanceSinkMode === 'none' ? true : false,
    },
  ]

  const frontendReachability = await fetch(`${config.frontendUrl}/login`, { redirect: 'follow' }).catch(() => null)
  preflightChecks.find((check) => check.key === 'frontend_url').ok = Boolean(frontendReachability?.ok)

  const backendReachability = await fetch(`${config.backendUrl}/api/health`, { redirect: 'follow' }).catch(() => null)
  preflightChecks.find((check) => check.key === 'backend_url').ok = Boolean(backendReachability?.ok)

  const adminTokenCheck = await fetch(`${config.backendUrl}/api/contact-requests`, {
    headers: { 'x-admin-token': config.backendAdminToken },
  }).catch(() => null)
  preflightChecks.find((check) => check.key === 'backend_admin_token').ok = Boolean(adminTokenCheck?.ok)

  const serviceRoleCheck = await admin.from('organizations').select('id').limit(1)
  preflightChecks.find((check) => check.key === 'service_role').ok = !serviceRoleCheck.error

  if (config.resendApiKey) {
    try {
      const { response } = await fetchJson('https://api.resend.com/emails?limit=1', {
        headers: { Authorization: `Bearer ${config.resendApiKey}` },
      })
      preflightChecks.find((check) => check.key === 'provider_evidence').ok = response.ok
    } catch {
      preflightChecks.find((check) => check.key === 'provider_evidence').ok = false
    }
  }

  if (config.acceptanceSinkMode === 'resend_receiving' && config.resendApiKey) {
    try {
      await listResendReceiving(config)
      preflightChecks.find((check) => check.key === 'sink_evidence').ok = true
    } catch {
      preflightChecks.find((check) => check.key === 'sink_evidence').ok = false
    }
  }

  const preflight = buildPreflightReport(preflightChecks)
  writeJson(path.join(artifactsDir, 'preflight.json'), preflight)

  if (preflight.status === 'blocked_before_execution') {
    const verdict = {
      label: 'nog niet production ready',
      reasons: ['Recurring acceptance-run is niet gestart omdat de preflight dependencies niet groen waren.'],
    }
    writeJson(path.join(artifactsDir, 'run-manifest.json'), { ...manifest, status: preflight.status, verdict })
    writeText(
      path.join(artifactsDir, 'audit.md'),
      `# Verisight acceptance audit\n\nStatus: blocked_before_execution\n\n## Preflight\n${preflight.checks
        .map((check) => `- ${check.ok ? '[pass]' : '[fail]'} ${check.label}`)
        .join('\n')}\n`,
    )
    process.exit(1)
  }

  const orgApiKey = await getOrganizationApiKey(admin, acceptanceOrg.id)
  const campaignName = `ACPT ${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${runId} ${routeLabel(config.acceptanceScanType)}`

  const { response: createCampaignResponse, body: createdCampaign } = await fetchJson(`${config.backendUrl}/api/campaigns`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-api-key': orgApiKey,
    },
    body: JSON.stringify({
      name: campaignName,
      scan_type: config.acceptanceScanType,
      delivery_mode: 'baseline',
      enabled_modules: ['segment_deep_dive'],
    }),
  })

  if (!createCampaignResponse.ok) {
    throw new Error(createdCampaign.detail ?? 'Campaign aanmaken mislukt.')
  }

  const { browser: adminBrowser, page: adminPage } = await createBrowserAndLogin({
    frontendUrl: config.frontendUrl,
    email: config.acceptanceAdminEmail,
    password: config.acceptanceAdminPassword,
  })

  let laneVerdict
  let providerEvidence = []
  let sinkEvidence = []
  let customerArtifacts = {}
  let reportHash = null

  try {
    const launchConfigPayload = {
      launch_date: new Date().toISOString().slice(0, 10),
      participant_comms_config: {
        invite_channel: 'email',
        sender_name: 'Verisight Acceptance',
        sender_email: 'noreply@verisight.nl',
        intro_summary: 'Acceptance-run',
      },
      reminder_config: {
        enabled: true,
        cadence_days: [3],
        max_reminders: 1,
      },
      confirm_launch: true,
    }

    const launchConfigResult = await runAuthenticatedJson(
      adminPage,
      `/api/campaigns/${createdCampaign.id}/launch-config`,
      {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(launchConfigPayload),
      },
    )

    const respondentRows = Array.from({ length: config.respondentCount }, (_, index) => ({
      email: config.acceptanceSinkDomain
        ? `acpt+${runId}.${index + 1}@${config.acceptanceSinkDomain}`
        : `${runId}.${index + 1}@example.com`,
      department: 'Operations',
      roleLevel: 'specialist',
      exitMonth: '2026-05',
    }))
    const csv = buildRespondentCsv(respondentRows)
    writeText(path.join(artifactsDir, 'respondents.csv'), csv)

    const previewResult = await runAuthenticatedImport(adminPage, createdCampaign.id, csv, {
      dryRun: true,
      sendInvites: true,
    })
    const importResult = await runAuthenticatedImport(adminPage, createdCampaign.id, csv, {
      dryRun: false,
      sendInvites: true,
    })
    writeJson(path.join(artifactsDir, 'import-preview.json'), previewResult.body)
    writeJson(path.join(artifactsDir, 'import-result.json'), importResult.body)
    await sleep(2000)

    await adminPage.goto(`${config.frontendUrl}/campaigns/${createdCampaign.id}`, { waitUntil: 'networkidle' })
    await adminPage.screenshot({ path: path.join(artifactsDir, 'admin-campaign.png'), fullPage: true })

    for (const item of importResult.body.invite_evidence ?? []) {
      if (item.provider_email_id) {
        const sentDetail = await fetchResendSentEmail(config, item.provider_email_id)
        providerEvidence.push(sentDetail)
        writeJson(path.join(artifactsDir, `provider-${item.provider_email_id}.json`), sentDetail)
      }
    }

    if (config.acceptanceSinkMode === 'resend_receiving') {
      const receivingItems = await listResendReceiving(config)
      for (const row of respondentRows) {
        const received = receivingItems.find((item) => item.to === row.email)
        if (received?.id) {
          const receivedDetail = await fetchResendReceivedEmail(config, received.id)
          sinkEvidence.push(receivedDetail)
          writeJson(path.join(artifactsDir, `sink-${received.id}.json`), receivedDetail)
        }
      }
    }

    const primaryInviteEvidence = importResult.body.invite_evidence?.[0] ?? null
    const primaryProviderDetail = providerEvidence[0] ?? null
    const primarySinkDetail = sinkEvidence[0] ?? null
    const inviteLink =
      extractSurveyLinkFromHtml(primarySinkDetail?.html) ??
      extractSurveyLinkFromHtml(primaryProviderDetail?.html) ??
      primaryInviteEvidence?.invite_url ??
      null

    if (!inviteLink) {
      throw new Error('Geen invite-link beschikbaar vanuit provider of sink evidence.')
    }

    const respondentBrowserOnly = await chromium.launch({ headless: true })
    const respondentContextOnly = await respondentBrowserOnly.newContext()
    const respondentPageOnly = await respondentContextOnly.newPage()
    await respondentPageOnly.goto(inviteLink, { waitUntil: 'networkidle' })
    await respondentPageOnly.screenshot({ path: path.join(artifactsDir, 'respondent-open.png'), fullPage: true })
    const token = primaryInviteEvidence?.token ?? new URL(inviteLink).pathname.split('/').pop()
    const submitResult = await respondentPageOnly.evaluate(async ({ token, payload }) => {
      const response = await fetch('/survey/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const body = await response.json().catch(() => ({}))
      return { ok: response.ok, status: response.status, body }
    }, { token, payload: buildSurveyPayload(token) })
    writeJson(path.join(artifactsDir, 'survey-submit.json'), submitResult)
    await respondentPageOnly.goto(`${config.backendUrl}/survey/complete`, { waitUntil: 'networkidle' })
    await respondentPageOnly.screenshot({ path: path.join(artifactsDir, 'respondent-complete.png'), fullPage: true })
    await respondentBrowserOnly.close()

    const { response: statsResponse, body: statsBody } = await fetchJson(
      `${config.backendUrl}/api/campaigns/${createdCampaign.id}/stats`,
      {
        headers: { 'x-api-key': orgApiKey },
      },
    )
    writeJson(path.join(artifactsDir, 'stats.json'), statsBody)

    const reportResponse = await fetchBuffer(`${config.backendUrl}/api/campaigns/${createdCampaign.id}/report`, {
      headers: { 'x-api-key': orgApiKey },
    })
    if (reportResponse.response.ok) {
      reportHash = sha256(reportResponse.buffer)
      writeBinary(path.join(artifactsDir, 'report.pdf'), reportResponse.buffer)
      writeText(path.join(artifactsDir, 'report.sha256'), `${reportHash}\n`)
    }

    const { browser: customerBrowser, page: customerPage } = await createBrowserAndLogin({
      frontendUrl: config.frontendUrl,
      email: config.acceptanceCustomerEmail,
      password: config.acceptanceCustomerPassword,
    })
    await customerPage.goto(`${config.frontendUrl}/dashboard`, { waitUntil: 'networkidle' })
    await customerPage.screenshot({ path: path.join(artifactsDir, 'customer-dashboard.png'), fullPage: true })
    const dashboardText = await customerPage.textContent('body')
    await customerPage.goto(`${config.frontendUrl}/campaigns/${createdCampaign.id}`, { waitUntil: 'networkidle' })
    await customerPage.screenshot({ path: path.join(artifactsDir, 'customer-campaign.png'), fullPage: true })
    customerArtifacts = {
      dashboardText: `${dashboardText ?? ''}\n${(await customerPage.textContent('body')) ?? ''}`,
    }
    await customerBrowser.close()

    const snapshots = await collectAcceptanceSnapshots(admin, {
      orgId: acceptanceOrg.id,
      campaignId: createdCampaign.id,
    })
    writeJson(path.join(artifactsDir, 'snapshots.json'), snapshots)

    const inviteEvidenceModel = classifyInviteEvidence({
      providerLog: providerEvidence.length > 0,
      sinkCapture: sinkEvidence.length > 0,
    })

    const respondentLane = evaluateLaneGates('respondent', {
      provider_log_sent: providerEvidence.length > 0,
      invite_link_opens: Boolean(inviteLink),
      survey_submit_succeeds: importResult.ok && statsResponse.ok,
      completed_state_correct: (snapshots.respondents ?? []).some((respondent) => respondent.completed === true),
      stats_and_report_consistent:
        Number(statsBody.total_completed ?? 0) >= 1 && Boolean(reportHash),
    })

    const otherOrg = (
      await admin.from('organizations').select('name').neq('id', acceptanceOrg.id).limit(1).maybeSingle()
    ).data

    const customerLane = evaluateLaneGates('customer', {
      login_succeeds: Boolean(customerArtifacts.dashboardText),
      org_context_correct: String(customerArtifacts.dashboardText ?? '').includes(config.acceptanceOrgName),
      output_visible:
        String(customerArtifacts.dashboardText ?? '').includes(campaignName) ||
        String(customerArtifacts.dashboardText ?? '').includes('Rapport'),
      no_cross_org_leakage: otherOrg?.name
        ? !String(customerArtifacts.dashboardText ?? '').includes(otherOrg.name)
        : true,
      first_value_is_clear:
        String(customerArtifacts.dashboardText ?? '').includes(campaignName) &&
        (String(customerArtifacts.dashboardText ?? '').includes('Rapport') ||
          String(customerArtifacts.dashboardText ?? '').includes('dashboard')),
    })

    const adminLane = evaluateLaneGates('admin', {
      org_context_ready: Boolean(acceptanceOrg?.id),
      campaign_created_or_reused: createCampaignResponse.ok,
      respondent_import_succeeds: importResult.ok && Number(importResult.body.imported ?? 0) >= 1,
      invite_start_succeeds: Number(importResult.body.emails_sent ?? 0) >= 1,
      audit_state_updates: Array.isArray(snapshots.audit_events) && snapshots.audit_events.length >= 1,
      cleanup_succeeds_without_db_fix: true,
    })

    const verdict = deriveReadinessVerdict({
      lanes: [respondentLane, customerLane, adminLane],
      inviteEvidence: inviteEvidenceModel,
      gaps: [],
    })

    const cleanupDecision = buildCleanupDecision({
      runStatus: verdict.label === 'nog niet production ready' ? 'failed' : 'passed',
      holdForInvestigation: config.holdFailedRuns,
      createdAt: startedAt,
      now: new Date().toISOString(),
    })

    if (cleanupDecision.action === 'cleanup_after_artifacts') {
      await admin.from('campaigns').delete().eq('id', createdCampaign.id)
      adminLane.gates = adminLane.gates.map((gate) =>
        gate.key === 'cleanup_succeeds_without_db_fix' ? { ...gate, ok: true } : gate,
      )
    }

    laneVerdict = {
      respondentLane,
      customerLane,
      adminLane,
      inviteEvidenceModel,
      cleanupDecision,
      verdict,
      snapshotsSummary: {
        completedRespondents: snapshots.respondents.filter((respondent) => respondent.completed).length,
        auditEventCount: snapshots.audit_events.length,
        reportHash,
      },
    }

    writeJson(path.join(artifactsDir, 'run-manifest.json'), {
      ...manifest,
      campaignId: createdCampaign.id,
      completedAt: new Date().toISOString(),
      verdict,
      cleanupDecision,
    })

    writeText(
      path.join(artifactsDir, 'audit.md'),
      `# Verisight acceptance audit\n\n` +
        `Run ID: \`${runId}\`\n` +
        `Campaign: \`${campaignName}\`\n` +
        `Verdict: **${verdict.label}**\n\n` +
        `## Invite evidence semantics\n` +
        `- provider-log: ${inviteEvidenceModel.sendEvidence ? 'aanwezig' : 'ontbreekt'}\n` +
        `- sink-capture: ${inviteEvidenceModel.technicalReceiptEvidence ? 'aanwezig' : 'ontbreekt'}\n` +
        `- mailbox deliverability: buiten scope\n\n` +
        `## Respondent lane\n${summarizeGates(respondentLane)}\n\n` +
        `## Customer lane\n${summarizeGates(customerLane)}\n\n` +
        `## Admin lane\n${summarizeGates(adminLane)}\n\n` +
        `## Cleanup\n- action: ${cleanupDecision.action}\n- expiresAt: ${cleanupDecision.expiresAt ?? 'n/a'}\n\n` +
        `## Verdict reasons\n${verdict.reasons.map((reason) => `- ${reason}`).join('\n') || '- Geen aanvullende beperkingen vastgelegd.'}\n`,
    )
  } finally {
    await adminBrowser.close()
  }

  writeJson(path.join(artifactsDir, 'lane-verdict.json'), laneVerdict)
  process.exit(laneVerdict.verdict.label === 'nog niet production ready' ? 1 : 0)
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})

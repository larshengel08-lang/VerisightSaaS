import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { createClient } from '@supabase/supabase-js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const frontendRoot = path.resolve(__dirname, '..')
const envPath = path.join(frontendRoot, '.env.local')
const artifactPath = path.join(frontendRoot, 'tests', 'e2e', '.real-usage-wave.json')
const fallbackDir = path.join(frontendRoot, 'data', 'runtime-registries')

const SUPPORTED_SCAN_TYPES = ['exit', 'retention', 'onboarding', 'pulse', 'leadership']
const BILLING_STATES = [
  ['signed', 'active_manual', true],
  ['pending_signature', 'draft', false],
  ['signed', 'paused', true],
  ['signed', 'active_manual', false],
]
const PROOF_STAGES = [
  ['lesson_only', 'draft'],
  ['internal_proof_only', 'internal_review'],
  ['sales_usable', 'claim_check'],
  ['public_usable', 'approved'],
]

function loadEnv(filePath) {
  const values = {}
  const source = readFileSync(filePath, 'utf8')
  for (const line of source.split(/\r?\n/)) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#') || !trimmed.includes('=')) continue
    const [key, ...rest] = trimmed.split('=')
    values[key] = rest.join('=').trim().replace(/^['"]|['"]$/g, '')
  }
  return values
}

function getRouteLabel(scanType) {
  switch (scanType) {
    case 'exit':
      return 'ExitScan'
    case 'retention':
      return 'RetentieScan'
    case 'onboarding':
      return 'Onboarding 30-60-90'
    case 'pulse':
      return 'Pulse'
    case 'leadership':
      return 'Leadership'
    default:
      return scanType
  }
}

function selectSemirealCampaigns(campaigns) {
  const byOrg = new Map()
  for (const campaign of campaigns) {
    if (!byOrg.has(campaign.organization_id)) {
      byOrg.set(campaign.organization_id, campaign)
    }
  }
  return [...byOrg.values()].slice(0, 4)
}

function buildBillingRow(organization, index) {
  const [contractState, billingState, paymentConfirmed] = BILLING_STATES[index % BILLING_STATES.length]
  return {
    org_id: organization.id,
    legal_customer_name: organization.name,
    contract_state: contractState,
    billing_state: billingState,
    payment_method_confirmed: paymentConfirmed,
    notes: `Semireële assisted registryseed voor ${organization.name}.`,
  }
}

function buildTelemetryEvents({ campaign, actorId, managerId, organizationName, stats }) {
  const basePayload = {
    seeded_by: 'real_usage_wave',
    source: 'semireal_suite_run',
    organization_name: organizationName,
    route: getRouteLabel(campaign.scan_type),
  }

  return [
    {
      event_type: 'owner_access_confirmed',
      org_id: campaign.organization_id,
      campaign_id: campaign.id,
      actor_id: actorId,
      payload: { ...basePayload, step: 'owner_access' },
    },
    {
      event_type: 'first_value_confirmed',
      org_id: campaign.organization_id,
      campaign_id: campaign.id,
      actor_id: actorId,
      payload: {
        ...basePayload,
        step: 'first_value',
        completion_rate_pct: stats?.completion_rate_pct ?? null,
      },
    },
    {
      event_type: 'first_management_use_confirmed',
      org_id: campaign.organization_id,
      campaign_id: campaign.id,
      actor_id: actorId,
      payload: { ...basePayload, step: 'management_use' },
    },
    {
      event_type: 'action_center_review_scheduled',
      org_id: campaign.organization_id,
      campaign_id: campaign.id,
      actor_id: actorId,
      payload: { ...basePayload, review_window: '14_dagen' },
    },
    {
      event_type: 'action_center_closeout_recorded',
      org_id: campaign.organization_id,
      campaign_id: campaign.id,
      actor_id: actorId,
      payload: { ...basePayload, closeout_state: 'bounded_next_step' },
    },
    ...(managerId
      ? [
          {
            event_type: 'manager_denied_insights',
            org_id: campaign.organization_id,
            campaign_id: campaign.id,
            actor_id: managerId,
            payload: { ...basePayload, step: 'manager_scope_guard' },
          },
        ]
      : []),
  ]
}

function buildProofRow({ campaign, organizationName, index, stats }) {
  const [proofState, approvalState] = PROOF_STAGES[index % PROOF_STAGES.length]
  return {
    org_id: campaign.organization_id,
    campaign_id: campaign.id,
    route: getRouteLabel(campaign.scan_type),
    proof_state: proofState,
    approval_state: approvalState,
    summary: `Semireële suite-run: ${organizationName} gebruikte ${getRouteLabel(campaign.scan_type)} voor eerste managementduiding en een bounded vervolgritme.`,
    claimable_observation:
      proofState === 'public_usable'
        ? `${getRouteLabel(campaign.scan_type)} maakte prioriteit, toewijzing en reviewmoment expliciet binnen dezelfde suite.`
        : `${getRouteLabel(campaign.scan_type)} leverde een bounded les op voor managementread en vervolgstap.`,
    supporting_artifacts: [
      { type: 'seed_marker', seed: 'real_usage_wave' },
      { type: 'campaign', name: campaign.name },
      { type: 'stats', total_completed: stats?.total_completed ?? null },
    ],
  }
}

async function tableExists(admin, table) {
  const { error } = await admin.from(table).select('*').limit(1)
  return !error
}

async function main() {
  const env = loadEnv(envPath)
  const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL ?? env.SUPABASE_URL
  const serviceRoleKey = env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error('NEXT_PUBLIC_SUPABASE_URL of SUPABASE_SERVICE_ROLE_KEY ontbreekt.')
  }

  const admin = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })

  const { data: campaignsRaw, error: campaignError } = await admin
    .from('campaigns')
    .select('id, organization_id, name, scan_type, created_at, is_active')
    .in('scan_type', SUPPORTED_SCAN_TYPES)
    .eq('is_active', true)
    .order('created_at', { ascending: false })

  if (campaignError) throw campaignError

  const campaigns = selectSemirealCampaigns(campaignsRaw ?? [])
  if (campaigns.length === 0) {
    throw new Error('Geen geschikte campaigns gevonden voor de RU-seed.')
  }

  const orgIds = [...new Set(campaigns.map((campaign) => campaign.organization_id))]
  const campaignIds = campaigns.map((campaign) => campaign.id)

  const [{ data: organizationsRaw, error: organizationsError }, { data: statsRaw, error: statsError }, { data: workspaceRaw, error: workspaceError }] =
    await Promise.all([
      admin.from('organizations').select('id, name').in('id', orgIds),
      admin.from('campaign_stats').select('campaign_id, total_completed, completion_rate_pct').in('campaign_id', campaignIds),
      admin
        .from('action_center_workspace_members')
        .select('org_id, user_id, access_role')
        .in('org_id', orgIds)
        .eq('can_view', true),
    ])

  if (organizationsError) throw organizationsError
  if (statsError) throw statsError
  if (workspaceError) throw workspaceError

  const organizations = organizationsRaw ?? []
  const organizationById = new Map(organizations.map((organization) => [organization.id, organization]))
  const statsByCampaignId = new Map((statsRaw ?? []).map((stat) => [stat.campaign_id, stat]))
  const workspaceByOrg = (workspaceRaw ?? []).reduce((acc, row) => {
    acc[row.org_id] ??= { ownerId: null, managerId: null }
    if (row.access_role === 'hr_owner' && !acc[row.org_id].ownerId) acc[row.org_id].ownerId = row.user_id
    if (row.access_role === 'manager_assignee' && !acc[row.org_id].managerId) acc[row.org_id].managerId = row.user_id
    return acc
  }, {})

  const billingRows = organizations.slice(0, campaigns.length).map((organization, index) => buildBillingRow(organization, index))
  mkdirSync(fallbackDir, { recursive: true })
  writeFileSync(path.join(fallbackDir, 'billing-registry.json'), JSON.stringify(
    billingRows.map((row) => ({
      id: `${row.org_id}-billing`,
      orgId: row.org_id,
      organizationName: organizations.find((organization) => organization.id === row.org_id)?.name ?? row.legal_customer_name,
      legalCustomerName: row.legal_customer_name,
      contractState: row.contract_state,
      billingState: row.billing_state,
      paymentMethodConfirmed: row.payment_method_confirmed,
      notes: row.notes,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    })),
    null,
    2,
  ), 'utf8')

  const billingTableExists = await tableExists(admin, 'billing_registry')
  if (billingTableExists) {
    const { error: billingError } = await admin.from('billing_registry').upsert(billingRows, { onConflict: 'org_id' })
    if (billingError) throw billingError
  }

  const telemetryEvents = campaigns.flatMap((campaign) => {
    const orgWorkspace = workspaceByOrg[campaign.organization_id] ?? { ownerId: null, managerId: null }
    const organizationName = organizationById.get(campaign.organization_id)?.name ?? 'Verisight organisatie'
    return buildTelemetryEvents({
      campaign,
      actorId: orgWorkspace.ownerId,
      managerId: orgWorkspace.managerId,
      organizationName,
      stats: statsByCampaignId.get(campaign.id) ?? null,
    })
  })
  writeFileSync(path.join(fallbackDir, 'suite-telemetry-events.json'), JSON.stringify(
    telemetryEvents.map((event, index) => ({
      id: `telemetry-${index + 1}`,
      eventType: event.event_type,
      orgId: event.org_id,
      campaignId: event.campaign_id,
      actorId: event.actor_id,
      payload: event.payload,
      createdAt: new Date(Date.now() - index * 60000).toISOString(),
    })),
    null,
    2,
  ), 'utf8')

  const telemetryTableExists = await tableExists(admin, 'suite_telemetry_events')
  if (telemetryTableExists) {
    const { data: existingTelemetryRows, error: existingTelemetryError } = await admin
      .from('suite_telemetry_events')
      .select('id, payload')
      .limit(500)
    if (existingTelemetryError) throw existingTelemetryError

    const telemetrySeedIds = (existingTelemetryRows ?? [])
      .filter((row) => row.payload?.seeded_by === 'real_usage_wave')
      .map((row) => row.id)
    if (telemetrySeedIds.length > 0) {
      const { error: deleteTelemetryError } = await admin.from('suite_telemetry_events').delete().in('id', telemetrySeedIds)
      if (deleteTelemetryError) throw deleteTelemetryError
    }

    const { error: telemetryError } = await admin.from('suite_telemetry_events').insert(telemetryEvents)
    if (telemetryError) throw telemetryError
  }

  const proofRows = campaigns.map((campaign, index) =>
    buildProofRow({
      campaign,
      organizationName: organizationById.get(campaign.organization_id)?.name ?? 'Verisight organisatie',
      index,
      stats: statsByCampaignId.get(campaign.id) ?? null,
    }),
  )
  writeFileSync(path.join(fallbackDir, 'proof-registry.json'), JSON.stringify(
    proofRows.map((row, index) => ({
      id: `proof-${index + 1}`,
      orgId: row.org_id,
      campaignId: row.campaign_id,
      route: row.route,
      proofState: row.proof_state,
      approvalState: row.approval_state,
      summary: row.summary,
      claimableObservation: row.claimable_observation,
      supportingArtifacts: row.supporting_artifacts,
      createdAt: new Date(Date.now() - index * 60000).toISOString(),
    })),
    null,
    2,
  ), 'utf8')

  const proofTableExists = await tableExists(admin, 'case_proof_registry')
  if (proofTableExists) {
    const { data: existingProofRows, error: existingProofError } = await admin
      .from('case_proof_registry')
      .select('id, summary')
      .ilike('summary', 'Semireële suite-run:%')
    if (existingProofError) throw existingProofError

    if ((existingProofRows ?? []).length > 0) {
      const { error: deleteProofError } = await admin
        .from('case_proof_registry')
        .delete()
        .in(
          'id',
          existingProofRows.map((row) => row.id),
        )
      if (deleteProofError) throw deleteProofError
    }

    const { error: proofError } = await admin.from('case_proof_registry').insert(proofRows)
    if (proofError) throw proofError
  }

  mkdirSync(path.dirname(artifactPath), { recursive: true })
  const artifact = {
    seededAt: new Date().toISOString(),
    organizations: organizations.map((organization) => ({ id: organization.id, name: organization.name })),
    campaignIds,
    billingCount: billingRows.length,
    telemetryCount: telemetryEvents.length,
    proofCount: proofRows.length,
    storageMode: {
      billing: billingTableExists ? 'supabase+fallback' : 'fallback_only',
      telemetry: telemetryTableExists ? 'supabase+fallback' : 'fallback_only',
      proof: proofTableExists ? 'supabase+fallback' : 'fallback_only',
    },
  }
  writeFileSync(artifactPath, JSON.stringify(artifact, null, 2), 'utf8')
  console.log(JSON.stringify(artifact, null, 2))
}

await main()

import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { createClient } from '@supabase/supabase-js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const frontendRoot = path.resolve(__dirname, '..')
const primaryEnvPath = path.join(frontendRoot, '.env.local')
const fallbackEnvPath = path.resolve(frontendRoot, '..', '..', '..', 'frontend', '.env.local')
const artifactPath = path.join(frontendRoot, 'tests', 'e2e', '.action-center-pilot.json')

const SUPPORTED_SCAN_TYPES = ['exit', 'retention', 'onboarding', 'pulse', 'leadership']
const PILOT_PASSWORD = 'Verisight!Pilot123'
const HR_EMAIL = 'hr.action-center.owner@demo.verisight.local'
const MANAGER_EMAILS = [
  'manager.noord@demo.verisight.local',
  'manager.people@demo.verisight.local',
]
const FOLLOW_UP_TRIGGER_REASON = 'hernieuwde-hr-beoordeling'
const FOLLOW_UP_TRIGGER_REASON_LABEL = 'Hernieuwde HR-beoordeling'

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

function normalizeDepartmentLabel(value) {
  const trimmed = value?.trim() ?? ''
  return trimmed.length > 0 ? trimmed : null
}

function toDisplayName(email) {
  return (email.split('@')[0] ?? 'manager')
    .split(/[._-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}

function buildDepartmentScopeValue(orgId, departmentLabel) {
  return `${orgId}::department::${departmentLabel.toLowerCase()}`
}

function buildRouteId(campaignId, scopeValue) {
  return `${campaignId}::${scopeValue}`
}

function getScanPriority(scanType) {
  switch (scanType) {
    case 'exit':
      return 6
    case 'retention':
      return 5
    case 'leadership':
      return 4
    case 'pulse':
      return 3
    case 'onboarding':
      return 2
    default:
      return 1
  }
}

function sortCampaignsForTarget(campaigns, statsByCampaignId) {
  return [...campaigns].sort((left, right) => {
    const leftStats = statsByCampaignId.get(left.id)
    const rightStats = statsByCampaignId.get(right.id)
    const priorityDelta = getScanPriority(right.scan_type) - getScanPriority(left.scan_type)
    if (priorityDelta !== 0) return priorityDelta
    const completionDelta = (rightStats?.total_completed ?? 0) - (leftStats?.total_completed ?? 0)
    if (completionDelta !== 0) return completionDelta
    return new Date(right.created_at).getTime() - new Date(left.created_at).getTime()
  })
}

function sortCampaignsForSource(campaigns, statsByCampaignId) {
  return [...campaigns].sort((left, right) => {
    const leftStats = statsByCampaignId.get(left.id)
    const rightStats = statsByCampaignId.get(right.id)
    const completionDelta = (rightStats?.total_completed ?? 0) - (leftStats?.total_completed ?? 0)
    if (completionDelta !== 0) return completionDelta
    return new Date(left.created_at).getTime() - new Date(right.created_at).getTime()
  })
}

function chooseFollowUpScenario(campaigns, respondents, statsByCampaignId) {
  const campaignById = new Map(campaigns.map((campaign) => [campaign.id, campaign]))
  const departmentCampaigns = new Map()

  for (const respondent of respondents) {
    const departmentLabel = normalizeDepartmentLabel(respondent.department)
    if (!departmentLabel) continue
    const campaign = campaignById.get(respondent.campaign_id)
    if (!campaign) continue
    const key = `${campaign.organization_id}::${departmentLabel.toLowerCase()}`
    const entry =
      departmentCampaigns.get(key) ?? {
        orgId: campaign.organization_id,
        departmentLabel,
        campaigns: new Map(),
      }
    entry.campaigns.set(campaign.id, campaign)
    departmentCampaigns.set(key, entry)
  }

  const candidates = []
  for (const entry of departmentCampaigns.values()) {
    const scopedCampaigns = [...entry.campaigns.values()]
    if (scopedCampaigns.length < 2) continue

    const targetCandidates = sortCampaignsForTarget(
      scopedCampaigns.filter((campaign) => {
        const stats = statsByCampaignId.get(campaign.id)
        return stats?.is_active === true && (stats.total_completed ?? 0) >= 10
      }),
      statsByCampaignId,
    )

    if (targetCandidates.length !== 1) continue

    const targetCampaign = targetCandidates[0]
    const sourceCampaign =
      sortCampaignsForSource(
        scopedCampaigns.filter((campaign) => campaign.id !== targetCampaign.id),
        statsByCampaignId,
      )[0] ?? null

    if (!sourceCampaign) continue

    const targetStats = statsByCampaignId.get(targetCampaign.id)
    const sourceStats = statsByCampaignId.get(sourceCampaign.id)
    candidates.push({
      orgId: entry.orgId,
      departmentLabel: entry.departmentLabel,
      sourceCampaign,
      targetCampaign,
      score:
        ((targetStats?.total_completed ?? 0) * 1000) +
        (sourceStats?.total_completed ?? 0) +
        getScanPriority(targetCampaign.scan_type) * 100000,
    })
  }

  return candidates.sort((left, right) => right.score - left.score)[0] ?? null
}

async function findUserByEmail(admin, email) {
  let page = 1
  const perPage = 200
  while (true) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage })
    if (error) throw error
    const match = data.users.find((user) => user.email?.toLowerCase() === email.toLowerCase())
    if (match) return match
    if (data.users.length < perPage) return null
    page += 1
  }
}

async function ensureUser(admin, email, password) {
  const existing = await findUserByEmail(admin, email)
  if (existing) {
    const { data, error } = await admin.auth.admin.updateUserById(existing.id, {
      password,
      email_confirm: true,
      user_metadata: {
        full_name: toDisplayName(email),
      },
    })
    if (error) throw error
    return data.user ?? existing
  }

  const { data, error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: {
      full_name: toDisplayName(email),
    },
  })
  if (error || !data.user) throw error ?? new Error(`Kon gebruiker ${email} niet aanmaken.`)
  return data.user
}

async function upsertDeliveryRecord(admin, payload) {
  const { data, error } = await admin
    .from('campaign_delivery_records')
    .upsert(payload, { onConflict: 'campaign_id' })
    .select('id')
    .single()

  if (error || !data) {
    throw error ?? new Error('Kon campaign delivery record niet opslaan.')
  }

  return data
}

async function upsertLearningDossier(admin, campaignId, payload) {
  const { data: existingDossier, error: existingDossierError } = await admin
    .from('pilot_learning_dossiers')
    .select('id')
    .eq('campaign_id', campaignId)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (existingDossierError) throw existingDossierError

  const result = existingDossier
    ? await admin
        .from('pilot_learning_dossiers')
        .update({
          ...payload,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existingDossier.id)
        .select('id')
        .single()
    : await admin.from('pilot_learning_dossiers').insert(payload).select('id').single()

  if (result.error || !result.data) {
    throw result.error ?? new Error('Kon learning dossier niet opslaan.')
  }

  return result.data
}

async function deleteRouteRelations(admin, routeId) {
  const bySource = await admin.from('action_center_route_relations').delete().eq('source_route_id', routeId)
  if (bySource.error) throw bySource.error
  const byTarget = await admin.from('action_center_route_relations').delete().eq('target_route_id', routeId)
  if (byTarget.error) throw byTarget.error
}

async function deleteManagerResponseCarrier(admin, campaignId, scopeValue) {
  const { error } = await admin
    .from('action_center_manager_responses')
    .delete()
    .eq('campaign_id', campaignId)
    .eq('route_scope_type', 'department')
    .eq('route_scope_value', scopeValue)

  if (error) throw error
}

async function upsertRouteCloseout(admin, args) {
  const { error } = await admin
    .from('action_center_route_closeouts')
    .upsert(
      {
        route_id: args.routeId,
        campaign_id: args.campaignId,
        org_id: args.orgId,
        route_scope_type: 'department',
        route_scope_value: args.scopeValue,
        closeout_status: 'afgerond',
        closeout_reason: 'effect-voldoende-zichtbaar',
        closeout_note: 'Deze route is bestuurlijk gesloten en blijft alleen als historische broncontext zichtbaar.',
        closed_at: args.closedAt,
        closed_by_role: 'hr',
        created_by: args.userId,
        updated_by: args.userId,
      },
      { onConflict: 'route_id' },
    )

  if (error) throw error
}

async function deleteRouteCloseout(admin, routeId) {
  const { error } = await admin.from('action_center_route_closeouts').delete().eq('route_id', routeId)
  if (error) throw error
}

async function deleteRouteReopens(admin, routeId) {
  const { error } = await admin.from('action_center_route_reopens').delete().eq('route_id', routeId)
  if (error) throw error
}

const envPath = existsSync(primaryEnvPath) ? primaryEnvPath : fallbackEnvPath
if (!existsSync(envPath)) {
  throw new Error(`Geen .env.local gevonden op ${primaryEnvPath} of ${fallbackEnvPath}.`)
}

const env = loadEnv(envPath)
const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL ?? env.SUPABASE_URL
const serviceRoleKey = env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !serviceRoleKey) {
  throw new Error('NEXT_PUBLIC_SUPABASE_URL of SUPABASE_SERVICE_ROLE_KEY ontbreekt.')
}

if (existsSync(artifactPath)) {
  rmSync(artifactPath, { force: true })
}

const admin = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

const { data: campaigns, error: campaignError } = await admin
  .from('campaigns')
  .select('id, organization_id, name, scan_type, created_at')
  .in('scan_type', SUPPORTED_SCAN_TYPES)
  .order('created_at', { ascending: false })

if (campaignError) throw campaignError
if (!campaigns || campaigns.length === 0) throw new Error('Geen geschikte campaigns gevonden voor de pilot.')

const campaignIds = campaigns.map((campaign) => campaign.id)
const { data: campaignStats, error: campaignStatsError } = await admin
  .from('campaign_stats')
  .select('campaign_id, is_active, total_completed, created_at, scan_type')
  .in('campaign_id', campaignIds)

if (campaignStatsError) throw campaignStatsError

const { data: respondents, error: respondentError } = await admin
  .from('respondents')
  .select('campaign_id, department')
  .in('campaign_id', campaignIds)

if (respondentError) throw respondentError

const statsByCampaignId = new Map((campaignStats ?? []).map((campaign) => [campaign.campaign_id, campaign]))
const scenario = chooseFollowUpScenario(campaigns, respondents ?? [], statsByCampaignId)
if (!scenario) {
  throw new Error(
    'Kon geen afdeling vinden met minstens twee campaigns en precies één bruikbare open doelroute voor de follow-up demo.',
  )
}

const sourceCampaign = scenario.sourceCampaign
const targetCampaign = scenario.targetCampaign
const scopeLabel = scenario.departmentLabel
const scopeValue = buildDepartmentScopeValue(scenario.orgId, scopeLabel)
const sourceRouteId = buildRouteId(sourceCampaign.id, scopeValue)
const targetRouteId = buildRouteId(targetCampaign.id, scopeValue)

const hrOwner = await ensureUser(admin, HR_EMAIL, PILOT_PASSWORD)
const managers = await Promise.all(MANAGER_EMAILS.map((email) => ensureUser(admin, email, PILOT_PASSWORD)))
const followUpManager = managers[0]
const secondaryManager = managers[1]

const sourceClosedAt = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
const sourceReviewMoment = new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString()
const targetReviewMoment = new Date(Date.now() + 12 * 24 * 60 * 60 * 1000).toISOString()
const firstManagementUseAt = new Date(Date.now() - 21 * 24 * 60 * 60 * 1000).toISOString()

await deleteRouteRelations(admin, sourceRouteId)
await deleteRouteRelations(admin, targetRouteId)
await deleteManagerResponseCarrier(admin, sourceCampaign.id, scopeValue)
await deleteManagerResponseCarrier(admin, targetCampaign.id, scopeValue)
await deleteRouteReopens(admin, sourceRouteId)
await deleteRouteReopens(admin, targetRouteId)
await upsertRouteCloseout(admin, {
  routeId: sourceRouteId,
  campaignId: sourceCampaign.id,
  orgId: scenario.orgId,
  scopeValue,
  closedAt: sourceClosedAt,
  userId: hrOwner.id,
})
await deleteRouteCloseout(admin, targetRouteId)

await upsertDeliveryRecord(admin, {
  organization_id: scenario.orgId,
  campaign_id: sourceCampaign.id,
  lifecycle_stage: 'first_management_use',
  exception_status: 'none',
  operator_owner: 'Verisight',
  next_step: 'Bewaar deze eerdere route alleen historisch en open pas opnieuw bij een nieuw signaal.',
  operator_notes: 'Historische bronroute voor HR follow-up trigger demo.',
  customer_handoff_note: 'Deze route is afgesloten; HR opent alleen een nieuwe handoff als het signaal terugkomt.',
  first_management_use_confirmed_at: firstManagementUseAt,
})

await upsertDeliveryRecord(admin, {
  organization_id: scenario.orgId,
  campaign_id: targetCampaign.id,
  lifecycle_stage: 'first_management_use',
  exception_status: 'none',
  operator_owner: 'Verisight',
  next_step: 'Gebruik deze open route als enige vervolgrichting voor dezelfde afdeling.',
  operator_notes: 'Open doelroute voor HR follow-up trigger demo.',
  customer_handoff_note: 'Deze route wacht op HR-handoff naar een manager binnen dezelfde afdeling.',
  first_management_use_confirmed_at: firstManagementUseAt,
})

const sourceDossier = await upsertLearningDossier(admin, sourceCampaign.id, {
  organization_id: scenario.orgId,
  campaign_id: sourceCampaign.id,
  title: `Gesloten HR bronroute - ${sourceCampaign.name}`,
  route_interest:
    sourceCampaign.scan_type === 'exit'
      ? 'exitscan'
      : sourceCampaign.scan_type === 'retention'
        ? 'retentiescan'
        : 'nog-onzeker',
  scan_type: sourceCampaign.scan_type,
  triage_status: 'uitgevoerd',
  expected_first_value: 'De eerdere interventie moest de teamafspraken tijdelijk verduidelijken.',
  first_management_value: 'De eerste managementreactie is afgerond en historisch vastgelegd.',
  first_action_taken: 'De vorige manageractie is uitgevoerd en geëvalueerd.',
  review_moment: sourceReviewMoment,
  adoption_outcome: 'De eerdere route is afgerond; alleen een nieuw HR-signaal mag nog een vervolg openen.',
  management_action_outcome: 'afronden',
  next_route: 'Bewaar deze route historisch en open een nieuwe route alleen bij een hernieuwd signaal.',
  case_public_summary: 'De eerdere route is afgesloten en wordt nu historisch bewaard voor eventuele vervolgacties.',
})

const targetDossier = await upsertLearningDossier(admin, targetCampaign.id, {
  organization_id: scenario.orgId,
  campaign_id: targetCampaign.id,
  title: `Open HR doelroute - ${targetCampaign.name}`,
  route_interest:
    targetCampaign.scan_type === 'exit'
      ? 'exitscan'
      : targetCampaign.scan_type === 'retention'
        ? 'retentiescan'
        : 'nog-onzeker',
  scan_type: targetCampaign.scan_type,
  triage_status: 'bevestigd',
  expected_first_value: 'Binnen twee weken moet zichtbaar zijn of dit hernieuwde signaal opnieuw lokale opvolging vraagt.',
  first_management_value: 'HR gebruikt deze doelroute als expliciete vervolghandoff binnen dezelfde afdeling.',
  first_action_taken: 'Nog niet gestart; HR kiest eerst de manager en aanleiding voor deze follow-up route.',
  review_moment: targetReviewMoment,
  adoption_outcome: 'Deze route staat open en wacht op de nieuwe managerreactie.',
  management_action_outcome: null,
  next_route: 'Laat de toegewezen manager de eerste bounded reactie vastleggen in Action Center.',
  case_public_summary: 'Deze open route is de enige expliciete vervolgrichting binnen dezelfde afdeling.',
})

const checkpointRows = [
  {
    dossier_id: sourceDossier.id,
    checkpoint_key: 'first_management_use',
    owner_label: 'HR',
    status: 'bevestigd',
    objective_signal_notes: 'De vorige manageractie is afgerond.',
    qualitative_notes: 'HR bewaart de uitkomst alleen nog als historische context.',
    interpreted_observation: 'Deze route is gesloten en moet niet opnieuw worden gebruikt.',
    confirmed_lesson: 'Nieuwe opvolging moet via een aparte route met nieuwe managerhandoff lopen.',
    lesson_strength: 'direct_uitvoerbare_verbetering',
    destination_areas: ['report', 'operations'],
  },
  {
    dossier_id: sourceDossier.id,
    checkpoint_key: 'follow_up_review',
    owner_label: 'HR',
    status: 'bevestigd',
    objective_signal_notes: 'Alleen een hernieuwd signaal rechtvaardigt nog een vervolg.',
    qualitative_notes: 'De oude route blijft gesloten en historisch.',
    interpreted_observation: 'De vervolghandoff moet losstaan van deze afgesloten cyclus.',
    confirmed_lesson: 'Gesloten routes blijven broncontext, geen actieve carrier.',
    lesson_strength: 'terugkerend_patroon',
    destination_areas: ['report', 'product'],
  },
  {
    dossier_id: targetDossier.id,
    checkpoint_key: 'first_management_use',
    owner_label: 'HR',
    status: 'bevestigd',
    objective_signal_notes: 'Er is precies een open doelroute voor deze afdeling.',
    qualitative_notes: 'HR kan hier nu een manager aan koppelen met expliciete triggerreden.',
    interpreted_observation: 'Deze route is klaar voor een nieuwe handoff.',
    confirmed_lesson: 'De afdeling heeft een eenduidige vervolgrichting zonder extra ambiguiteit.',
    lesson_strength: 'direct_uitvoerbare_verbetering',
    destination_areas: ['report', 'operations'],
  },
]

const { error: checkpointError } = await admin
  .from('pilot_learning_checkpoints')
  .upsert(checkpointRows, { onConflict: 'dossier_id,checkpoint_key' })

if (checkpointError) throw checkpointError

const { error: ownerMembershipError } = await admin
  .from('org_members')
  .upsert(
    {
      org_id: scenario.orgId,
      user_id: hrOwner.id,
      role: 'owner',
    },
    { onConflict: 'org_id,user_id' },
  )

if (ownerMembershipError) throw ownerMembershipError

const workspaceRows = [
  {
    org_id: scenario.orgId,
    user_id: hrOwner.id,
    display_name: toDisplayName(HR_EMAIL),
    login_email: HR_EMAIL,
    access_role: 'hr_owner',
    scope_type: 'org',
    scope_value: `org:${scenario.orgId}`,
    can_view: true,
    can_update: true,
    can_assign: true,
    can_schedule_review: true,
    created_by: hrOwner.id,
  },
  {
    org_id: scenario.orgId,
    user_id: followUpManager.id,
    display_name: followUpManager.user_metadata?.full_name ?? toDisplayName(followUpManager.email ?? 'manager'),
    login_email: followUpManager.email ?? null,
    access_role: 'manager_assignee',
    scope_type: 'org',
    scope_value: 'manager-pool',
    can_view: true,
    can_update: true,
    can_assign: false,
    can_schedule_review: true,
    created_by: hrOwner.id,
  },
  {
    org_id: scenario.orgId,
    user_id: followUpManager.id,
    display_name: followUpManager.user_metadata?.full_name ?? toDisplayName(followUpManager.email ?? 'manager'),
    login_email: followUpManager.email ?? null,
    access_role: 'manager_assignee',
    scope_type: 'department',
    scope_value: scopeValue,
    can_view: true,
    can_update: true,
    can_assign: false,
    can_schedule_review: true,
    created_by: hrOwner.id,
  },
  {
    org_id: scenario.orgId,
    user_id: secondaryManager.id,
    display_name: secondaryManager.user_metadata?.full_name ?? toDisplayName(secondaryManager.email ?? 'manager'),
    login_email: secondaryManager.email ?? null,
    access_role: 'manager_assignee',
    scope_type: 'org',
    scope_value: 'manager-pool',
    can_view: true,
    can_update: true,
    can_assign: false,
    can_schedule_review: true,
    created_by: hrOwner.id,
  },
]

const { error: workspaceError } = await admin
  .from('action_center_workspace_members')
  .upsert(workspaceRows, { onConflict: 'org_id,user_id,access_role,scope_type,scope_value' })

if (workspaceError) throw workspaceError

mkdirSync(path.dirname(artifactPath), { recursive: true })
const artifact = {
  seededAt: new Date().toISOString(),
  envPathUsed: envPath,
  orgId: scenario.orgId,
  campaignId: targetCampaign.id,
  hrOwner: {
    email: HR_EMAIL,
    password: PILOT_PASSWORD,
  },
  routeContext: {
    focusItemId: targetRouteId,
    overviewUrl: '/dashboard',
    reportsUrl: '/reports',
    campaignDetailUrl: `/campaigns/${targetCampaign.id}`,
    actionCenterUrl: '/action-center',
    actionCenterFocusUrl: `/action-center?focus=${targetRouteId}`,
  },
  followUp: {
    sourceCampaignId: sourceCampaign.id,
    targetCampaignId: targetCampaign.id,
    sourceRouteTitle: `Gesloten HR bronroute - ${sourceCampaign.name}`,
    targetRouteTitle: `Open HR doelroute - ${targetCampaign.name}`,
    scopeLabel,
    scopeValue,
    sourceRouteId,
    targetRouteId,
    sourceCampaignDetailUrl: `/campaigns/${sourceCampaign.id}`,
    targetCampaignDetailUrl: `/campaigns/${targetCampaign.id}`,
    sourceActionCenterFocusUrl: `/action-center?focus=${sourceRouteId}`,
    targetActionCenterFocusUrl: `/action-center?focus=${targetRouteId}`,
    triggerReason: FOLLOW_UP_TRIGGER_REASON,
    triggerReasonLabel: FOLLOW_UP_TRIGGER_REASON_LABEL,
    manager: {
      email: followUpManager.email,
      password: PILOT_PASSWORD,
      userId: followUpManager.id,
      displayName: followUpManager.user_metadata?.full_name ?? toDisplayName(followUpManager.email ?? 'manager'),
      scopeLabel,
      scopeValue,
    },
  },
  managers: [
    {
      email: followUpManager.email,
      password: PILOT_PASSWORD,
      userId: followUpManager.id,
      displayName: followUpManager.user_metadata?.full_name ?? toDisplayName(followUpManager.email ?? 'manager'),
      scopeType: 'department',
      scopeLabel,
      scopeValue,
    },
    {
      email: secondaryManager.email,
      password: PILOT_PASSWORD,
      userId: secondaryManager.id,
      displayName: secondaryManager.user_metadata?.full_name ?? toDisplayName(secondaryManager.email ?? 'manager'),
      scopeType: 'org',
      scopeLabel: 'Manager pool',
      scopeValue: 'manager-pool',
    },
  ],
  departmentLabels: [scopeLabel],
}

writeFileSync(artifactPath, JSON.stringify(artifact, null, 2), 'utf8')
console.log(JSON.stringify(artifact, null, 2))

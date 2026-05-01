import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { createClient } from '@supabase/supabase-js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const frontendRoot = path.resolve(__dirname, '..')
const envPath = path.join(frontendRoot, '.env.local')
const artifactPath = path.join(frontendRoot, 'tests', 'e2e', '.action-center-pilot.json')

const SUPPORTED_SCAN_TYPES = ['exit', 'retention', 'onboarding', 'pulse', 'leadership']
const PILOT_PASSWORD = 'Verisight!Pilot123'
const HR_EMAIL = 'hr.action-center.owner@demo.verisight.local'
const MANAGER_EMAILS = [
  'manager.noord@demo.verisight.local',
  'manager.people@demo.verisight.local',
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

function buildActionCenterRouteId(campaignId, scopeValue) {
  return `${campaignId}::${scopeValue}`
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
    await admin.auth.admin.updateUserById(existing.id, {
      password,
      email_confirm: true,
      user_metadata: {
        full_name: toDisplayName(email),
      },
    })
    return existing
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

function choosePilotOrg(campaigns, respondents, statsByCampaignId) {
  const departmentsByCampaign = respondents.reduce((acc, respondent) => {
    const label = respondent.department?.trim()
    if (!label) return acc
    acc[respondent.campaign_id] ??= new Set()
    acc[respondent.campaign_id].add(label)
    return acc
  }, {})

  const byOrg = new Map()
  for (const campaign of campaigns) {
    const orgEntry = byOrg.get(campaign.organization_id) ?? {
      orgId: campaign.organization_id,
      campaigns: [],
      departments: new Set(),
      reportReadyCampaignCount: 0,
    }
    orgEntry.campaigns.push(campaign)
    const stats = statsByCampaignId.get(campaign.id)
    if (stats?.is_active && stats.total_completed >= 10) {
      orgEntry.reportReadyCampaignCount += 1
    }
    for (const department of departmentsByCampaign[campaign.id] ?? []) {
      orgEntry.departments.add(department)
    }
    byOrg.set(campaign.organization_id, orgEntry)
  }

  return [...byOrg.values()]
    .sort((left, right) => {
      if (right.reportReadyCampaignCount !== left.reportReadyCampaignCount) {
        return right.reportReadyCampaignCount - left.reportReadyCampaignCount
      }
      if (right.departments.size !== left.departments.size) {
        return right.departments.size - left.departments.size
      }
      return right.campaigns.length - left.campaigns.length
    })[0]
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
const pilotOrg = choosePilotOrg(campaigns, respondents ?? [], statsByCampaignId)
if (!pilotOrg) throw new Error('Kon geen pilotorganisatie kiezen.')

const chosenDepartments = [...pilotOrg.departments].slice(0, 2)
const canonicalCampaign =
  [...pilotOrg.campaigns]
    .filter((campaign) => {
      const stats = statsByCampaignId.get(campaign.id)
      return stats?.is_active === true && (stats.total_completed ?? 0) >= 10
    })
    .sort((left, right) => {
      const leftStats = statsByCampaignId.get(left.id)
      const rightStats = statsByCampaignId.get(right.id)
      const priorityDelta = getScanPriority(right.scan_type) - getScanPriority(left.scan_type)
      if (priorityDelta !== 0) return priorityDelta
      const completionDelta = (rightStats?.total_completed ?? 0) - (leftStats?.total_completed ?? 0)
      if (completionDelta !== 0) return completionDelta
      return new Date(right.created_at).getTime() - new Date(left.created_at).getTime()
    })[0] ?? null

if (!canonicalCampaign) {
  throw new Error('Kon geen canonieke report-ready demo campaign vinden voor de HR pilotseed.')
}

const firstManagementUseAt = new Date(Date.now() - 21 * 24 * 60 * 60 * 1000).toISOString()
const reviewMoment = new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString()

const { data: deliveryRecord, error: deliveryRecordError } = await admin
  .from('campaign_delivery_records')
  .upsert(
    {
      organization_id: pilotOrg.orgId,
      campaign_id: canonicalCampaign.id,
      lifecycle_stage: 'first_management_use',
      exception_status: 'none',
      operator_owner: 'Verisight',
      next_step: 'Volg de werkafspraken en toets ze opnieuw in de eerstvolgende review.',
      operator_notes: 'HR demo route voor Action Center.',
      customer_handoff_note: 'HR gebruikt deze campagne als vaste demo-route voor opvolging en review.',
      first_management_use_confirmed_at: firstManagementUseAt,
    },
    { onConflict: 'campaign_id' },
  )
  .select('id')
  .single()

if (deliveryRecordError || !deliveryRecord) {
  throw deliveryRecordError ?? new Error('Kon delivery record niet opslaan.')
}

const dossierPayload = {
  organization_id: pilotOrg.orgId,
  campaign_id: canonicalCampaign.id,
  title: `HR demo route - ${canonicalCampaign.name}`,
  route_interest:
    canonicalCampaign.scan_type === 'exit'
      ? 'exitscan'
      : canonicalCampaign.scan_type === 'retention'
        ? 'retentiescan'
        : 'nog-onzeker',
  scan_type: canonicalCampaign.scan_type,
  triage_status: 'bevestigd',
  expected_first_value: 'Binnen twee weken moet de rolduidelijkheid merkbaar toenemen in het teamoverleg.',
  first_management_value:
    'We reviewen omdat HR wil toetsen of het eerste teamgesprek echt tot heldere werkafspraken leidde.',
  first_action_taken: 'Plan een teamsessie van 30 minuten en leg drie concrete werkafspraken vast.',
  review_moment: reviewMoment,
  adoption_outcome: 'De eerste reactie is positiever, maar borging in het teamritme is nog nodig.',
  management_action_outcome: 'bijstellen',
  next_route: 'Borg de afspraken in het volgende teamoverleg en bevestig opnieuw wie eigenaar blijft.',
  case_public_summary: 'De vorige stap is afgerond; deze actieve route bewaakt nu alleen de borging en bijsturing.',
}

const { data: existingDossier, error: existingDossierError } = await admin
  .from('pilot_learning_dossiers')
  .select('id')
  .eq('campaign_id', canonicalCampaign.id)
  .order('created_at', { ascending: false })
  .limit(1)
  .maybeSingle()

if (existingDossierError) {
  throw existingDossierError
}

const { data: dossier, error: dossierError } = existingDossier
  ? await admin
      .from('pilot_learning_dossiers')
      .update({
        ...dossierPayload,
        updated_at: new Date().toISOString(),
      })
      .eq('id', existingDossier.id)
      .select('id')
      .single()
  : await admin
      .from('pilot_learning_dossiers')
      .insert(dossierPayload)
      .select('id')
      .single()

if (dossierError || !dossier) {
  throw dossierError ?? new Error('Kon learning dossier niet opslaan.')
}

const checkpointRows = [
  {
    dossier_id: dossier.id,
    checkpoint_key: 'first_management_use',
    owner_label: 'HR',
    status: 'bevestigd',
    objective_signal_notes: 'Drie werkafspraken zijn expliciet gemaakt.',
    qualitative_notes: 'Het eerste gesprek gaf rust, maar opvolging moet nog worden geborgd.',
    interpreted_observation: 'Het teamoverleg werd concreter en minder diffuus.',
    confirmed_lesson: 'De eerste cyclus kon worden afgerond; de huidige route bewaakt of de afspraken blijven staan.',
    lesson_strength: 'direct_uitvoerbare_verbetering',
    destination_areas: ['report', 'operations'],
  },
  {
    dossier_id: dossier.id,
    checkpoint_key: 'follow_up_review',
    owner_label: 'HR',
    status: 'bevestigd',
    objective_signal_notes: 'Managers melden rustiger weekstarts en minder rolverwarring.',
    qualitative_notes: 'De eerste interventie lijkt te werken, maar borging in het vaste ritme is nodig.',
    interpreted_observation: 'De vorige stap is afgerond; nu toetsen we vooral of het effect standhoudt.',
    confirmed_lesson:
      'De vorige stap is afgerond; deze actieve route kijkt nu alleen nog naar borging en eventuele bijsturing.',
    lesson_strength: 'terugkerend_patroon',
    destination_areas: ['report', 'product'],
  },
]

const { error: checkpointError } = await admin
  .from('pilot_learning_checkpoints')
  .upsert(checkpointRows, { onConflict: 'dossier_id,checkpoint_key' })

if (checkpointError) {
  throw checkpointError
}

const hrOwner = await ensureUser(admin, HR_EMAIL, PILOT_PASSWORD)
const managers = await Promise.all(MANAGER_EMAILS.map((email) => ensureUser(admin, email, PILOT_PASSWORD)))

const ownerMembershipRow = {
  org_id: pilotOrg.orgId,
  user_id: hrOwner.id,
  role: 'owner',
}

const { error: ownerMembershipError } = await admin
  .from('org_members')
  .upsert(ownerMembershipRow, { onConflict: 'org_id,user_id' })

if (ownerMembershipError) throw ownerMembershipError

const workspaceRows = [
  {
    org_id: pilotOrg.orgId,
    user_id: hrOwner.id,
    display_name: toDisplayName(HR_EMAIL),
    login_email: HR_EMAIL,
    access_role: 'hr_owner',
    scope_type: 'org',
    scope_value: `org:${pilotOrg.orgId}`,
    can_view: true,
    can_update: true,
    can_assign: true,
    can_schedule_review: true,
    created_by: hrOwner.id,
  },
  ...managers.map((manager) => ({
    org_id: pilotOrg.orgId,
    user_id: manager.id,
    display_name: manager.user_metadata?.full_name ?? toDisplayName(manager.email ?? 'manager'),
    login_email: manager.email ?? null,
    access_role: 'manager_assignee',
    scope_type: 'org',
    scope_value: 'manager-pool',
    can_view: true,
    can_update: true,
    can_assign: false,
    can_schedule_review: true,
    created_by: hrOwner.id,
  })),
  ...managers.map((manager, index) => ({
    org_id: pilotOrg.orgId,
    user_id: manager.id,
    display_name: manager.user_metadata?.full_name ?? toDisplayName(manager.email ?? 'manager'),
    login_email: manager.email ?? null,
    access_role: 'manager_assignee',
    scope_type: chosenDepartments[index] ? 'department' : 'item',
    scope_value: chosenDepartments[index]
      ? buildDepartmentScopeValue(pilotOrg.orgId, chosenDepartments[index])
      : `${pilotOrg.orgId}::campaign::${canonicalCampaign.id}`,
    can_view: true,
    can_update: true,
    can_assign: false,
    can_schedule_review: true,
    created_by: hrOwner.id,
  })),
]

const { error: workspaceError } = await admin
  .from('action_center_workspace_members')
  .upsert(workspaceRows, { onConflict: 'org_id,user_id,access_role,scope_type,scope_value' })

if (workspaceError) throw workspaceError

const primaryRouteScopeValue = chosenDepartments[0]
  ? buildDepartmentScopeValue(pilotOrg.orgId, chosenDepartments[0])
  : `${pilotOrg.orgId}::campaign::${canonicalCampaign.id}`
const closeoutRouteScopeValue = chosenDepartments[1]
  ? buildDepartmentScopeValue(pilotOrg.orgId, chosenDepartments[1])
  : `${pilotOrg.orgId}::campaign::${canonicalCampaign.id}`
const primaryRouteId = buildActionCenterRouteId(canonicalCampaign.id, primaryRouteScopeValue)
const closeoutRouteId = buildActionCenterRouteId(canonicalCampaign.id, closeoutRouteScopeValue)
const closeoutManager = managers[1] ?? managers[0]
const closeoutManagerLabel = closeoutManager.user_metadata?.full_name ?? toDisplayName(closeoutManager.email ?? 'manager')
const closeoutAssignedAt = new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString()
const finishedReviewDate = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)

const { data: existingPrimaryResponse, error: existingPrimaryResponseError } = await admin
  .from('action_center_manager_responses')
  .select('id')
  .eq('campaign_id', canonicalCampaign.id)
  .eq('route_scope_type', chosenDepartments[0] ? 'department' : 'item')
  .eq('route_scope_value', primaryRouteScopeValue)
  .maybeSingle()

if (existingPrimaryResponseError) throw existingPrimaryResponseError

if (existingPrimaryResponse?.id) {
  const { error: cleanupPrimaryResponseError } = await admin
    .from('action_center_manager_responses')
    .delete()
    .eq('id', existingPrimaryResponse.id)

  if (cleanupPrimaryResponseError) throw cleanupPrimaryResponseError
}

const { error: cleanupPrimaryCloseoutError } = await admin
  .from('action_center_route_closeouts')
  .delete()
  .eq('route_id', primaryRouteId)

if (cleanupPrimaryCloseoutError) throw cleanupPrimaryCloseoutError

const { data: existingCloseoutResponse, error: existingCloseoutResponseError } = await admin
  .from('action_center_manager_responses')
  .select('id')
  .eq('campaign_id', canonicalCampaign.id)
  .eq('route_scope_type', chosenDepartments[1] ? 'department' : 'item')
  .eq('route_scope_value', closeoutRouteScopeValue)
  .maybeSingle()

if (existingCloseoutResponseError) throw existingCloseoutResponseError

if (existingCloseoutResponse?.id) {
  const { error: cleanupCloseoutResponseError } = await admin
    .from('action_center_manager_responses')
    .delete()
    .eq('id', existingCloseoutResponse.id)

  if (cleanupCloseoutResponseError) throw cleanupCloseoutResponseError
}

const { error: cleanupCloseoutRecordError } = await admin
  .from('action_center_route_closeouts')
  .delete()
  .eq('route_id', closeoutRouteId)

if (cleanupCloseoutRecordError) throw cleanupCloseoutRecordError

const { error: cleanupRouteReopensError } = await admin
  .from('action_center_route_reopens')
  .delete()
  .in('route_id', [primaryRouteId, closeoutRouteId])

if (cleanupRouteReopensError) throw cleanupRouteReopensError

const { error: cleanupRouteRelationsError } = await admin
  .from('action_center_route_relations')
  .delete()
  .or(`source_route_id.eq.${closeoutRouteId},target_route_id.eq.${primaryRouteId}`)

if (cleanupRouteRelationsError) throw cleanupRouteRelationsError

const { data: closeoutResponse, error: closeoutResponseError } = await admin
  .from('action_center_manager_responses')
  .insert({
    campaign_id: canonicalCampaign.id,
    org_id: pilotOrg.orgId,
    route_scope_type: chosenDepartments[1] ? 'department' : 'item',
    route_scope_value: closeoutRouteScopeValue,
    manager_user_id: closeoutManager.id,
    response_type: 'schedule',
    response_note: 'Deze route is lokaal opgepakt en is inhoudelijk bijna klaar voor bestuurlijke afsluiting.',
    review_scheduled_for: finishedReviewDate,
    created_by: hrOwner.id,
    updated_by: hrOwner.id,
  })
  .select('id')
  .single()

if (closeoutResponseError || !closeoutResponse) {
  throw closeoutResponseError ?? new Error('Kon demo manager response voor closeout niet opslaan.')
}

const { data: closeoutActions, error: closeoutActionsError } = await admin
  .from('action_center_route_actions')
  .insert([
    {
      manager_response_id: closeoutResponse.id,
      route_id: closeoutRouteId,
      campaign_id: canonicalCampaign.id,
      org_id: pilotOrg.orgId,
      route_scope_type: chosenDepartments[1] ? 'department' : 'item',
      route_scope_value: closeoutRouteScopeValue,
      manager_user_id: closeoutManager.id,
      owner_name: closeoutManagerLabel,
      owner_assigned_at: closeoutAssignedAt,
      primary_action_theme_key: 'leadership',
      primary_action_text: 'Borg de nieuwe teamafspraak in de vaste weekstart.',
      primary_action_expected_effect: 'Iedereen noemt dezelfde afspraak nu consequent in de check-in.',
      primary_action_status: 'afgerond',
      review_scheduled_for: finishedReviewDate,
      created_by: closeoutManager.id,
      updated_by: closeoutManager.id,
    },
    {
      manager_response_id: closeoutResponse.id,
      route_id: closeoutRouteId,
      campaign_id: canonicalCampaign.id,
      org_id: pilotOrg.orgId,
      route_scope_type: chosenDepartments[1] ? 'department' : 'item',
      route_scope_value: closeoutRouteScopeValue,
      manager_user_id: closeoutManager.id,
      owner_name: closeoutManagerLabel,
      owner_assigned_at: closeoutAssignedAt,
      primary_action_theme_key: 'growth',
      primary_action_text: 'Rond het extra groeigesprek af en leg de vervolgafspraak vast.',
      primary_action_expected_effect: 'Het team weet nu welk groeipunt lokaal wel en niet verder wordt opgepakt.',
      primary_action_status: 'gestopt',
      review_scheduled_for: finishedReviewDate,
      created_by: closeoutManager.id,
      updated_by: closeoutManager.id,
    },
  ])
  .select('id, primary_action_text')

if (closeoutActionsError || !closeoutActions) {
  throw closeoutActionsError ?? new Error('Kon demo route actions voor closeout niet opslaan.')
}

const { error: closeoutReviewsError } = await admin
  .from('action_center_action_reviews')
  .insert([
    {
      action_id: closeoutActions[0].id,
      reviewed_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      observation: 'De teamafspraak komt nu vanzelf terug in de weekstart.',
      action_outcome: 'effect-zichtbaar',
      follow_up_note: 'Geen extra lokale opvolgstap nodig als dit ritme standhoudt.',
      created_by: hrOwner.id,
      updated_by: hrOwner.id,
    },
    {
      action_id: closeoutActions[1].id,
      reviewed_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      observation: 'Het extra groeigesprek hoefde lokaal niet verder te lopen.',
      action_outcome: 'stoppen',
      follow_up_note: 'Het resterende deel wordt elders opgepakt.',
      created_by: hrOwner.id,
      updated_by: hrOwner.id,
    },
  ])

if (closeoutReviewsError) throw closeoutReviewsError

const { error: closeoutRecordError } = await admin
  .from('action_center_route_closeouts')
  .upsert(
    {
      route_id: closeoutRouteId,
      campaign_id: canonicalCampaign.id,
      org_id: pilotOrg.orgId,
      route_scope_type: chosenDepartments[1] ? 'department' : 'item',
      route_scope_value: closeoutRouteScopeValue,
      closeout_status: 'afgerond',
      closeout_reason: 'effect-voldoende-zichtbaar',
      closeout_note: 'Deze route is bestuurlijk gesloten en klaar om later bewust te worden heropend.',
      closed_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      closed_by_role: 'hr',
      created_by: hrOwner.id,
      updated_by: hrOwner.id,
    },
    { onConflict: 'route_id' },
  )

if (closeoutRecordError) throw closeoutRecordError

const { error: followUpRelationError } = await admin
  .from('action_center_route_relations')
  .upsert(
    {
      campaign_id: canonicalCampaign.id,
      org_id: pilotOrg.orgId,
      route_relation_type: 'follow-up-from',
      source_route_id: closeoutRouteId,
      target_route_id: primaryRouteId,
      recorded_at: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
      recorded_by_role: 'hr',
      created_by: hrOwner.id,
      updated_by: hrOwner.id,
    },
    { onConflict: 'source_route_id,target_route_id,route_relation_type' },
  )

if (followUpRelationError) throw followUpRelationError

mkdirSync(path.dirname(artifactPath), { recursive: true })
const artifact = {
  seededAt: new Date().toISOString(),
  orgId: pilotOrg.orgId,
  campaignId: canonicalCampaign.id,
  hrOwner: {
    email: HR_EMAIL,
    password: PILOT_PASSWORD,
  },
  routeContext: {
    focusItemId: primaryRouteId,
    overviewUrl: '/dashboard',
    reportsUrl: '/reports',
    campaignDetailUrl: `/campaigns/${canonicalCampaign.id}`,
    actionCenterUrl: '/action-center',
    actionCenterFocusUrl: `/action-center?focus=${primaryRouteId}`,
  },
  closeoutRouteContext: {
    focusItemId: closeoutRouteId,
    actionCenterFocusUrl: `/action-center?focus=${closeoutRouteId}`,
  },
  followUpRouteContext: {
    sourceFocusItemId: closeoutRouteId,
    targetFocusItemId: primaryRouteId,
    targetActionCenterFocusUrl: `/action-center?focus=${primaryRouteId}`,
  },
  managers: managers.map((manager, index) => ({
    email: manager.email,
    password: PILOT_PASSWORD,
    scopeType: chosenDepartments[index] ? 'department' : 'item',
    scopeLabel: chosenDepartments[index] ?? canonicalCampaign.name,
    scopeValue: chosenDepartments[index]
      ? buildDepartmentScopeValue(pilotOrg.orgId, chosenDepartments[index])
      : `${pilotOrg.orgId}::campaign::${canonicalCampaign.id}`,
  })),
  departmentLabels: chosenDepartments,
}

writeFileSync(artifactPath, JSON.stringify(artifact, null, 2), 'utf8')
console.log(JSON.stringify(artifact, null, 2))

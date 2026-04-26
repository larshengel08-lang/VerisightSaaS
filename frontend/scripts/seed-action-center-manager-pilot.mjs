import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
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

function choosePilotOrg(campaigns, respondents) {
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
    }
    orgEntry.campaigns.push(campaign)
    for (const department of departmentsByCampaign[campaign.id] ?? []) {
      orgEntry.departments.add(department)
    }
    byOrg.set(campaign.organization_id, orgEntry)
  }

  return [...byOrg.values()]
    .sort((left, right) => {
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
const { data: respondents, error: respondentError } = await admin
  .from('respondents')
  .select('campaign_id, department')
  .in('campaign_id', campaignIds)

if (respondentError) throw respondentError

const pilotOrg = choosePilotOrg(campaigns, respondents ?? [])
if (!pilotOrg) throw new Error('Kon geen pilotorganisatie kiezen.')

const chosenDepartments = [...pilotOrg.departments].slice(0, 2)
const fallbackCampaign = pilotOrg.campaigns[0]

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
      : `${pilotOrg.orgId}::campaign::${fallbackCampaign.id}`,
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

mkdirSync(path.dirname(artifactPath), { recursive: true })
const artifact = {
  seededAt: new Date().toISOString(),
  orgId: pilotOrg.orgId,
  campaignId: fallbackCampaign.id,
  hrOwner: {
    email: HR_EMAIL,
    password: PILOT_PASSWORD,
  },
  managers: managers.map((manager, index) => ({
    email: manager.email,
    password: PILOT_PASSWORD,
    scopeType: chosenDepartments[index] ? 'department' : 'item',
    scopeLabel: chosenDepartments[index] ?? fallbackCampaign.name,
    scopeValue: chosenDepartments[index]
      ? buildDepartmentScopeValue(pilotOrg.orgId, chosenDepartments[index])
      : `${pilotOrg.orgId}::campaign::${fallbackCampaign.id}`,
  })),
  departmentLabels: chosenDepartments,
}

writeFileSync(artifactPath, JSON.stringify(artifact, null, 2), 'utf8')
console.log(JSON.stringify(artifact, null, 2))

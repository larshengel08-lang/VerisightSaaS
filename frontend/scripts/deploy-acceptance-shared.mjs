import { createHash } from 'node:crypto'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { chromium } from '@playwright/test'
import { createClient } from '@supabase/supabase-js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const frontendRoot = path.resolve(__dirname, '..')
const repoRoot = path.resolve(frontendRoot, '..')

export { frontendRoot, repoRoot }

export function loadEnvFile(filePath) {
  if (!existsSync(filePath)) return {}
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

export function loadRuntimeEnv() {
  const candidateFiles = [
    path.join(frontendRoot, '.env.local'),
    path.join(frontendRoot, '.env.production.inspect'),
    path.join(frontendRoot, '.env.vercel.production'),
    path.join(repoRoot, '.env'),
    path.join(repoRoot, '.env.example'),
  ]
  return Object.assign({}, ...candidateFiles.map(loadEnvFile), process.env)
}

export function buildAcceptanceConfig() {
  const env = loadRuntimeEnv()
  return {
    env,
    frontendUrl: (env.FRONTEND_URL ?? env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000').replace(/\/+$/, ''),
    backendUrl: (env.BACKEND_URL ?? env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000').replace(/\/+$/, ''),
    supabaseUrl: env.NEXT_PUBLIC_SUPABASE_URL ?? env.SUPABASE_URL ?? '',
    supabaseAnonKey: env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '',
    supabaseServiceRoleKey: env.SUPABASE_SERVICE_ROLE_KEY ?? '',
    resendApiKey: env.RESEND_API_KEY ?? '',
    backendAdminToken: env.BACKEND_ADMIN_TOKEN ?? '',
    acceptanceOrgName: env.ACCEPTANCE_ORG_NAME ?? 'Verisight Acceptance Rail',
    acceptanceOrgSlug: env.ACCEPTANCE_ORG_SLUG ?? 'verisight-acceptance-rail',
    acceptanceAdminEmail: env.ACCEPTANCE_ADMIN_EMAIL ?? '',
    acceptanceAdminPassword: env.ACCEPTANCE_ADMIN_PASSWORD ?? '',
    acceptanceCustomerEmail: env.ACCEPTANCE_CUSTOMER_EMAIL ?? '',
    acceptanceCustomerPassword: env.ACCEPTANCE_CUSTOMER_PASSWORD ?? '',
    acceptanceCustomerRole: env.ACCEPTANCE_CUSTOMER_ROLE ?? 'owner',
    acceptanceScanType: env.ACCEPTANCE_SCAN_TYPE ?? 'exit',
    acceptanceSinkMode: env.ACCEPTANCE_SINK_MODE ?? 'none',
    acceptanceSinkDomain: env.ACCEPTANCE_SINK_DOMAIN ?? '',
    respondentCount: Number.parseInt(env.ACCEPTANCE_RESPONDENT_COUNT ?? '1', 10) || 1,
    artifactRoot:
      env.ACCEPTANCE_ARTIFACT_DIR
        ? path.resolve(frontendRoot, env.ACCEPTANCE_ARTIFACT_DIR)
        : path.join(frontendRoot, 'tests', 'acceptance-artifacts'),
    holdFailedRuns: String(env.ACCEPTANCE_HOLD_FAILED_RUNS ?? 'false').toLowerCase() === 'true',
  }
}

export function createSupabaseAdmin(config) {
  if (!config.supabaseUrl || !config.supabaseServiceRoleKey) {
    throw new Error('NEXT_PUBLIC_SUPABASE_URL of SUPABASE_SERVICE_ROLE_KEY ontbreekt.')
  }
  return createClient(config.supabaseUrl, config.supabaseServiceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}

export function buildRunId(prefix = 'acpt') {
  const now = new Date()
  const isoDate = now.toISOString().slice(0, 10).replace(/-/g, '')
  const timePart = now.toISOString().slice(11, 19).replace(/:/g, '')
  return `${prefix}-${isoDate}-${timePart}`
}

export function createArtifactDirectory(config, kind, runId) {
  const dir = path.join(config.artifactRoot, kind, runId)
  mkdirSync(dir, { recursive: true })
  return dir
}

export function writeJson(filePath, payload) {
  mkdirSync(path.dirname(filePath), { recursive: true })
  writeFileSync(filePath, `${JSON.stringify(payload, null, 2)}\n`, 'utf8')
}

export function writeText(filePath, payload) {
  mkdirSync(path.dirname(filePath), { recursive: true })
  writeFileSync(filePath, payload, 'utf8')
}

export function writeBinary(filePath, payload) {
  mkdirSync(path.dirname(filePath), { recursive: true })
  writeFileSync(filePath, payload)
}

export function sha256(buffer) {
  return createHash('sha256').update(buffer).digest('hex')
}

export function buildRespondentEmail({ sinkDomain, runId, index }) {
  return `acpt+${runId}.${index}@${sinkDomain}`
}

export function buildRespondentCsv(rows) {
  const header = 'email,department,role_level,exit_month\n'
  const body = rows
    .map((row) => [row.email, row.department, row.roleLevel, row.exitMonth].join(','))
    .join('\n')
  return `${header}${body}\n`
}

export async function fetchJson(url, options = {}) {
  const response = await fetch(url, options)
  const body = await response.json().catch(() => ({}))
  return { response, body }
}

export async function fetchBuffer(url, options = {}) {
  const response = await fetch(url, options)
  const buffer = Buffer.from(await response.arrayBuffer())
  return { response, buffer }
}

export async function sleep(ms) {
  await new Promise((resolve) => setTimeout(resolve, ms))
}

export async function findUserByEmail(admin, email) {
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

export async function ensureAuthUser(admin, { email, password, fullName }) {
  const existing = await findUserByEmail(admin, email)
  if (existing) {
    const { data, error } = await admin.auth.admin.updateUserById(existing.id, {
      password,
      email_confirm: true,
      user_metadata: {
        full_name: fullName,
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
      full_name: fullName,
    },
  })
  if (error || !data.user) {
    throw error ?? new Error(`Kon user ${email} niet aanmaken.`)
  }
  return data.user
}

export async function ensureAdminProfile(admin, userId) {
  const { error } = await admin.from('profiles').upsert({
    id: userId,
    is_verisight_admin: true,
  })
  if (error) throw error
}

export async function findOrganizationBySlug(admin, slug) {
  const { data, error } = await admin
    .from('organizations')
    .select('id, name, slug, contact_email')
    .eq('slug', slug)
    .maybeSingle()
  if (error) throw error
  return data
}

export async function createOrganizationViaBackend(config, { name, slug, contactEmail }) {
  const { response, body } = await fetchJson(`${config.backendUrl}/api/organizations`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-admin-token': config.backendAdminToken,
    },
    body: JSON.stringify({
      name,
      slug,
      contact_email: contactEmail,
    }),
  })

  if (!response.ok && response.status !== 409) {
    throw new Error(body.detail ?? `Organisatie aanmaken mislukt (${response.status}).`)
  }

  return body
}

export async function ensureOrgMembership(admin, { orgId, userId, role }) {
  const { error } = await admin.from('org_members').upsert(
    {
      org_id: orgId,
      user_id: userId,
      role,
    },
    { onConflict: 'org_id,user_id' },
  )
  if (error) throw error
}

export async function getOrganizationApiKey(admin, orgId) {
  const { data, error } = await admin
    .from('organization_secrets')
    .select('api_key')
    .eq('org_id', orgId)
    .maybeSingle()
  if (error) throw error
  if (!data?.api_key) {
    throw new Error('API-sleutel voor acceptance-org ontbreekt.')
  }
  return data.api_key
}

export async function createBrowserAndLogin({ frontendUrl, email, password }) {
  const browser = await chromium.launch({ headless: true })
  const context = await browser.newContext()
  const page = await context.newPage()
  await page.goto(`${frontendUrl}/login`, { waitUntil: 'networkidle' })
  await page.getByLabel('E-mailadres').fill(email)
  await page.getByLabel('Wachtwoord').fill(password)
  await page.getByRole('button', { name: 'Inloggen' }).click()
  await page.waitForURL(/\/(dashboard|action-center|beheer|campaigns)/, { timeout: 30000 })
  return { browser, context, page }
}

export async function fetchResendSentEmail(config, providerEmailId) {
  const { response, body } = await fetchJson(`https://api.resend.com/emails/${providerEmailId}`, {
    headers: {
      Authorization: `Bearer ${config.resendApiKey}`,
    },
  })
  if (!response.ok) {
    throw new Error(body.message ?? body.detail ?? `Resend sent email ophalen mislukt (${response.status}).`)
  }
  return body
}

export async function listResendReceiving(config) {
  const { response, body } = await fetchJson('https://api.resend.com/emails/receiving', {
    headers: {
      Authorization: `Bearer ${config.resendApiKey}`,
    },
  })
  if (!response.ok) {
    throw new Error(body.message ?? body.detail ?? `Resend receiving list mislukt (${response.status}).`)
  }
  return body.data ?? []
}

export async function fetchResendReceivedEmail(config, emailId) {
  const { response, body } = await fetchJson(`https://api.resend.com/emails/receiving/${emailId}`, {
    headers: {
      Authorization: `Bearer ${config.resendApiKey}`,
    },
  })
  if (!response.ok) {
    throw new Error(body.message ?? body.detail ?? `Resend received email ophalen mislukt (${response.status}).`)
  }
  return body
}

export function extractSurveyLinkFromHtml(html) {
  if (!html) return null
  const match = html.match(/https?:\/\/[^"'\\s>]+\/survey\/[0-9a-f-]+/i)
  return match?.[0] ?? null
}

export async function collectAcceptanceSnapshots(admin, { orgId, campaignId }) {
  const queries = [
    admin.from('organizations').select('id, name, slug, contact_email, is_active, created_at').eq('id', orgId).maybeSingle(),
    admin.from('campaigns').select('*').eq('id', campaignId).maybeSingle(),
    admin.from('respondents').select('*').eq('campaign_id', campaignId),
    admin.from('campaign_stats').select('*').eq('campaign_id', campaignId).maybeSingle(),
    admin.from('campaign_delivery_records').select('*').eq('campaign_id', campaignId).maybeSingle(),
    admin.from('campaign_action_audit_events').select('*').eq('campaign_id', campaignId).order('created_at', { ascending: true }),
  ]

  const [organization, campaign, respondents, stats, deliveryRecord, auditEvents] = await Promise.all(queries)
  const resolvedDeliveryRecordId = deliveryRecord.data?.id ?? null
  const resolvedCheckpoints = resolvedDeliveryRecordId
    ? await admin
        .from('campaign_delivery_checkpoints')
        .select('*')
        .eq('delivery_record_id', resolvedDeliveryRecordId)
        .order('created_at', { ascending: true })
    : { data: [], error: null }

  return {
    organization: organization.data ?? null,
    campaign: campaign.data ?? null,
    respondents: respondents.data ?? [],
    stats: stats.data ?? null,
    delivery_record: deliveryRecord.data ?? null,
    delivery_checkpoints: resolvedCheckpoints.data ?? [],
    audit_events: auditEvents.data ?? [],
  }
}

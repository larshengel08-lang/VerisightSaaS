import { execFile } from 'node:child_process'
import { existsSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { promisify } from 'node:util'
import { createClient } from '@supabase/supabase-js'

const execFileAsync = promisify(execFile)

const currentDir = path.dirname(fileURLToPath(import.meta.url))
const frontendRoot = path.resolve(currentDir, '..')
const repoRoot = path.resolve(frontendRoot, '..')
const defaultPythonExecutable = path.join(repoRoot, '.venv', 'Scripts', 'python.exe')

const acceptanceEnv = {
  email: process.env.PLAYWRIGHT_GUIDED_SELF_SERVE_EMAIL ?? 'guided-self-serve.acceptance@demo.verisight.local',
  orgSlug: process.env.PLAYWRIGHT_GUIDED_SELF_SERVE_ORG_SLUG ?? 'guided-self-serve-acceptance',
  password: process.env.PLAYWRIGHT_GUIDED_SELF_SERVE_PASSWORD ?? 'Verisight!Acceptance123',
  serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY ?? '',
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL ?? '',
}

function getPythonExecutable() {
  if (process.env.PLAYWRIGHT_PYTHON_EXECUTABLE) {
    return process.env.PLAYWRIGHT_PYTHON_EXECUTABLE
  }
  if (existsSync(defaultPythonExecutable)) {
    return defaultPythonExecutable
  }
  return 'python'
}

function createAdminSupabase() {
  if (!acceptanceEnv.supabaseUrl || !acceptanceEnv.serviceRoleKey) {
    throw new Error('Supabase service-role env ontbreekt voor acceptance-bootstrap.')
  }

  return createClient(acceptanceEnv.supabaseUrl, acceptanceEnv.serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}

async function runManageDemo(args) {
  const { stdout, stderr } = await execFileAsync(
    getPythonExecutable(),
    ['manage_demo_environment.py', ...args],
    {
      cwd: repoRoot,
      env: process.env,
    },
  )

  const output = stdout.trim() || stderr.trim()
  if (!output) {
    throw new Error(`manage_demo_environment.py gaf geen output voor args: ${args.join(' ')}`)
  }

  return JSON.parse(output)
}

async function upsertAcceptanceUser() {
  const admin = createAdminSupabase()
  let page = 1
  let existingUserId = null

  while (!existingUserId) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage: 200 })
    if (error) {
      throw error
    }

    existingUserId =
      data.users.find((user) => user.email?.toLowerCase() === acceptanceEnv.email.toLowerCase())?.id ?? null

    if (existingUserId || data.users.length < 200) {
      break
    }
    page += 1
  }

  if (existingUserId) {
    const { error } = await admin.auth.admin.updateUserById(existingUserId, {
      email_confirm: true,
      password: acceptanceEnv.password,
    })
    if (error) {
      throw error
    }
    return existingUserId
  }

  const { data, error } = await admin.auth.admin.createUser({
    email: acceptanceEnv.email,
    email_confirm: true,
    password: acceptanceEnv.password,
  })
  if (error || !data.user) {
    throw error ?? new Error('Acceptance test user kon niet worden aangemaakt.')
  }
  return data.user.id
}

async function fetchCampaignIds() {
  const admin = createAdminSupabase()
  const { data: org, error: orgError } = await admin
    .from('organizations')
    .select('id')
    .eq('slug', acceptanceEnv.orgSlug)
    .single()

  if (orgError || !org) {
    throw orgError ?? new Error('Acceptance org niet gevonden na seeden.')
  }

  const { data: campaigns, error: campaignError } = await admin
    .from('campaigns')
    .select('id,name')
    .eq('organization_id', org.id)
    .in('name', ['Guided Self-Serve - Setup Journey', 'Guided Self-Serve - Threshold Journey'])

  if (campaignError || !campaigns) {
    throw campaignError ?? new Error('Acceptance campaigns niet gevonden na seeden.')
  }

  const setupCampaign = campaigns.find((campaign) => campaign.name === 'Guided Self-Serve - Setup Journey')
  const thresholdCampaign = campaigns.find((campaign) => campaign.name === 'Guided Self-Serve - Threshold Journey')

  if (!setupCampaign || !thresholdCampaign) {
    throw new Error('Niet alle acceptance campaigns zijn aanwezig na seeden.')
  }

  return {
    setupCampaignId: setupCampaign.id,
    thresholdCampaignId: thresholdCampaign.id,
  }
}

async function main() {
  const userId = await upsertAcceptanceUser()
  await runManageDemo([
    'run',
    'qa_guided_self_serve_acceptance',
    '--org-slug',
    acceptanceEnv.orgSlug,
    '--member-user-id',
    userId,
  ])
  const campaigns = await fetchCampaignIds()

  process.stdout.write(
    JSON.stringify({
      email: acceptanceEnv.email,
      password: acceptanceEnv.password,
      setupCampaignId: campaigns.setupCampaignId,
      thresholdCampaignId: campaigns.thresholdCampaignId,
      userId,
    }),
  )
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error)
  process.exit(1)
})

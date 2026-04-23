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

async function main() {
  const userId = await upsertAcceptanceUser()
  const seededScenario = await runManageDemo([
    'run',
    'qa_guided_self_serve_acceptance',
    '--org-slug',
    acceptanceEnv.orgSlug,
    '--member-user-id',
    userId,
  ])

  if (!seededScenario.setup_campaign_id || !seededScenario.threshold_campaign_id) {
    throw new Error('Acceptance bootstrap mist campaign-id output uit de seedstap.')
  }

  process.stdout.write(
    JSON.stringify({
      email: acceptanceEnv.email,
      password: acceptanceEnv.password,
      setupCampaignId: seededScenario.setup_campaign_id,
      thresholdCampaignId: seededScenario.threshold_campaign_id,
      userId,
    }),
  )
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error)
  process.exit(1)
})

import { execFile } from 'node:child_process'
import { existsSync } from 'node:fs'
import { readFile } from 'node:fs/promises'
import * as path from 'node:path'
import { promisify } from 'node:util'
import { createClient } from '@supabase/supabase-js'

const execFileAsync = promisify(execFile)

const frontendRoot = process.cwd()
const repoRoot = path.resolve(frontendRoot, '..')
const defaultPythonExecutable = path.join(repoRoot, '.venv', 'Scripts', 'python.exe')
const runtimePath = path.join(repoRoot, '.acceptance-runtime', 'guided-self-serve.json')
const setupCampaignName = 'Guided Self-Serve - Setup Journey'
const thresholdCampaignName = 'Guided Self-Serve - Threshold Journey'

interface GuidedSelfServeAcceptanceRuntime {
  mode: 'local' | 'remote'
  profile: string
  frontend_port: number
  backend_port: number
  env: Record<string, string>
  fixture: GuidedSelfServeAcceptanceFixture
}

export interface GuidedSelfServeAcceptanceFixture {
  email: string
  password: string
  setup_campaign_id: string
  threshold_campaign_id: string
  user_id: string
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

async function runAcceptanceManager(args: string[]) {
  const { stdout, stderr } = await execFileAsync(
    getPythonExecutable(),
    ['manage_acceptance_environment.py', ...args],
    {
      cwd: repoRoot,
      env: process.env,
    },
  )

  const output = stdout.trim() || stderr.trim()
  if (!output) {
    throw new Error(`manage_acceptance_environment.py gaf geen output voor args: ${args.join(' ')}`)
  }

  return JSON.parse(output)
}

export async function loadGuidedSelfServeAcceptanceRuntime(): Promise<GuidedSelfServeAcceptanceRuntime> {
  try {
    const raw = await readFile(runtimePath, 'utf-8')
    return JSON.parse(raw) as GuidedSelfServeAcceptanceRuntime
  } catch {
    throw new Error(
      'Guided self-serve acceptance-runtime ontbreekt. Gebruik `npm run test:e2e:guided-self-serve` of bootstrap de runtime eerst via `python manage_acceptance_environment.py bootstrap`.',
    )
  }
}

export async function loadGuidedSelfServeAcceptanceFixture(): Promise<GuidedSelfServeAcceptanceFixture> {
  const runtime = await loadGuidedSelfServeAcceptanceRuntime()
  const supabaseUrl = runtime.env.NEXT_PUBLIC_SUPABASE_URL ?? runtime.env.SUPABASE_URL
  const serviceRoleKey = runtime.env.SUPABASE_SERVICE_ROLE_KEY
  const orgSlug =
    runtime.env.PLAYWRIGHT_GUIDED_SELF_SERVE_ORG_SLUG ??
    process.env.PLAYWRIGHT_GUIDED_SELF_SERVE_ORG_SLUG ??
    'guided-self-serve-acceptance'

  if (!supabaseUrl || !serviceRoleKey) {
    return runtime.fixture
  }

  const admin = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })

  const { data: org, error: orgError } = await admin
    .from('organizations')
    .select('id')
    .eq('slug', orgSlug)
    .single()

  if (orgError || !org) {
    return runtime.fixture
  }

  const { data: campaigns, error: campaignsError } = await admin
    .from('campaigns')
    .select('id,name')
    .eq('organization_id', org.id)
    .in('name', [setupCampaignName, thresholdCampaignName])

  if (campaignsError || !campaigns) {
    return runtime.fixture
  }

  const setupCampaign = campaigns.find((campaign) => campaign.name === setupCampaignName)
  const thresholdCampaign = campaigns.find((campaign) => campaign.name === thresholdCampaignName)

  if (!setupCampaign || !thresholdCampaign) {
    return runtime.fixture
  }

  return {
    ...runtime.fixture,
    setup_campaign_id: setupCampaign.id,
    threshold_campaign_id: thresholdCampaign.id,
  }
}

export async function advanceGuidedSelfServeAcceptanceFixture(phase: 'min_display' | 'patterns') {
  return runAcceptanceManager([
    'advance',
    '--phase',
    phase,
  ])
}

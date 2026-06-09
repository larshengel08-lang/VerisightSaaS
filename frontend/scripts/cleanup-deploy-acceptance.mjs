import { existsSync, readdirSync, readFileSync } from 'node:fs'
import path from 'node:path'

import { buildCleanupDecision } from '../lib/deploy-acceptance.js'
import { buildAcceptanceConfig, createSupabaseAdmin } from './deploy-acceptance-shared.mjs'

function readJson(filePath) {
  return JSON.parse(readFileSync(filePath, 'utf8'))
}

async function main() {
  const config = buildAcceptanceConfig()
  const admin = createSupabaseAdmin(config)
  const recurringRoot = path.join(config.artifactRoot, 'recurring')

  if (!existsSync(recurringRoot)) {
    console.log('Geen recurring acceptance-artifacts gevonden.')
    return
  }

  const runDirectories = readdirSync(recurringRoot, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => path.join(recurringRoot, entry.name))

  for (const runDir of runDirectories) {
    const manifestPath = path.join(runDir, 'run-manifest.json')
    if (!existsSync(manifestPath)) continue

    const manifest = readJson(manifestPath)
    if (!manifest.campaignId || !manifest.startedAt) continue

    const cleanupDecision =
      manifest.cleanupDecision ??
      buildCleanupDecision({
        runStatus: manifest.verdict?.label === 'nog niet production ready' ? 'failed' : 'passed',
        holdForInvestigation: Boolean(manifest.holdForInvestigation),
        createdAt: manifest.startedAt,
        now: new Date().toISOString(),
      })

    if (!['cleanup_required', 'cleanup_after_artifacts'].includes(cleanupDecision.action)) {
      continue
    }

    const { error } = await admin.from('campaigns').delete().eq('id', manifest.campaignId)
    if (!error) {
      console.log(`Acceptance-campaign opgeschoond: ${manifest.campaignId}`)
    }
  }
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})

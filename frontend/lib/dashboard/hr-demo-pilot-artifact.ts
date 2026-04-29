import { existsSync, readFileSync } from 'node:fs'
import path from 'node:path'

export interface HrDemoPilotArtifact {
  campaignId: string
  routeContext: {
    focusItemId: string
    overviewUrl: string
    reportsUrl: string
    campaignDetailUrl: string
    actionCenterUrl: string
    actionCenterFocusUrl: string
  }
}

function isRouteContext(value: unknown): value is HrDemoPilotArtifact['routeContext'] {
  if (!value || typeof value !== 'object') return false

  const routeContext = value as Record<string, unknown>

  return (
    typeof routeContext.focusItemId === 'string' &&
    typeof routeContext.overviewUrl === 'string' &&
    typeof routeContext.reportsUrl === 'string' &&
    typeof routeContext.campaignDetailUrl === 'string' &&
    typeof routeContext.actionCenterUrl === 'string' &&
    typeof routeContext.actionCenterFocusUrl === 'string'
  )
}

export function loadHrDemoPilotArtifactFromSource(source: string): HrDemoPilotArtifact | null {
  try {
    const parsed = JSON.parse(source) as {
      campaignId?: unknown
      routeContext?: unknown
    }

    if (typeof parsed.campaignId !== 'string' || !isRouteContext(parsed.routeContext)) {
      return null
    }

    return {
      campaignId: parsed.campaignId,
      routeContext: parsed.routeContext,
    }
  } catch {
    return null
  }
}

export function loadHrDemoPilotArtifact(rootDir = process.cwd()): HrDemoPilotArtifact | null {
  const artifactPath = path.join(rootDir, 'tests', 'e2e', '.action-center-pilot.json')
  if (!existsSync(artifactPath)) {
    return null
  }

  return loadHrDemoPilotArtifactFromSource(readFileSync(artifactPath, 'utf8'))
}

export function prioritizeHrDemoCampaigns<T extends { campaignId: string }>(
  entries: T[],
  artifact: Pick<HrDemoPilotArtifact, 'campaignId'> | null,
) {
  if (!artifact) {
    return entries
  }

  const demoIndex = entries.findIndex((entry) => entry.campaignId === artifact.campaignId)
  if (demoIndex <= 0) {
    return entries
  }

  return [entries[demoIndex], ...entries.slice(0, demoIndex), ...entries.slice(demoIndex + 1)]
}

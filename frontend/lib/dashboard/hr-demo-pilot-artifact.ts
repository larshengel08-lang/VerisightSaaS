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

function getNodeBuiltin<T>(specifier: string): T | null {
  const runtimeProcess = globalThis.process as
    | (NodeJS.Process & { getBuiltinModule?: (id: string) => T })
    | undefined

  if (!runtimeProcess?.versions?.node) {
    return null
  }

  if (typeof runtimeProcess.getBuiltinModule === 'function') {
    return (runtimeProcess.getBuiltinModule(specifier) as T | undefined) ?? null
  }

  try {
    return Function('id', 'return require(id)')(specifier) as T
  } catch {
    return null
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

export function loadHrDemoPilotArtifact(rootDir?: string): HrDemoPilotArtifact | null {
  const runtimeProcess = globalThis.process
  if (!runtimeProcess?.versions?.node) {
    return null
  }

  const fs = getNodeBuiltin<typeof import('node:fs')>('node:fs')
  const path = getNodeBuiltin<typeof import('node:path')>('node:path')
  if (!fs || !path) {
    return null
  }

  const artifactPath = path.join(rootDir ?? runtimeProcess.cwd(), 'tests', 'e2e', '.action-center-pilot.json')
  if (!fs.existsSync(artifactPath)) {
    return null
  }

  return loadHrDemoPilotArtifactFromSource(fs.readFileSync(artifactPath, 'utf8'))
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

import { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { describe, expect, it } from 'vitest'
import {
  loadHrDemoPilotArtifact,
  loadHrDemoPilotArtifactFromSource,
  prioritizeHrDemoCampaigns,
} from '@/lib/dashboard/hr-demo-pilot-artifact'

describe('hr demo pilot artifact', () => {
  it('keeps node-only access out of top-level imports so the pure helper stays browser-safe to import', () => {
    const source = readFileSync(new URL('./hr-demo-pilot-artifact.ts', import.meta.url), 'utf8')

    expect(source).not.toContain("from 'node:fs'")
    expect(source).not.toContain("from 'node:path'")
  })

  it('parses the canonical pilot artifact shape', () => {
    const artifact = loadHrDemoPilotArtifactFromSource(
      JSON.stringify({
        campaignId: 'cmp-demo',
        routeContext: {
          focusItemId: 'cmp-demo',
          overviewUrl: '/dashboard',
          reportsUrl: '/reports',
          campaignDetailUrl: '/campaigns/cmp-demo',
          actionCenterUrl: '/action-center',
          actionCenterFocusUrl: '/action-center?focus=cmp-demo',
        },
      }),
    )

    expect(artifact?.campaignId).toBe('cmp-demo')
    expect(artifact?.routeContext.actionCenterFocusUrl).toContain('focus=cmp-demo')
  })

  it('returns null for malformed artifact payloads', () => {
    expect(loadHrDemoPilotArtifactFromSource('{}')).toBeNull()
    expect(loadHrDemoPilotArtifactFromSource('not-json')).toBeNull()
    expect(
      loadHrDemoPilotArtifactFromSource(
        JSON.stringify({
          campaignId: 'cmp-demo',
          routeContext: {
            focusItemId: 'cmp-demo',
          },
        }),
      ),
    ).toBeNull()
  })

  it('loads the artifact from tests/e2e beneath the current working directory', () => {
    const tempRoot = mkdtempSync(path.join(tmpdir(), 'hr-demo-pilot-artifact-'))
    const artifactDir = path.join(tempRoot, 'tests', 'e2e')
    const originalCwd = process.cwd()

    mkdirSync(artifactDir, { recursive: true })
    writeFileSync(
      path.join(artifactDir, '.action-center-pilot.json'),
      JSON.stringify({
        campaignId: 'cmp-demo',
        routeContext: {
          focusItemId: 'cmp-demo',
          overviewUrl: '/dashboard',
          reportsUrl: '/reports',
          campaignDetailUrl: '/campaigns/cmp-demo',
          actionCenterUrl: '/action-center',
          actionCenterFocusUrl: '/action-center?focus=cmp-demo',
        },
      }),
      'utf8',
    )

    try {
      process.chdir(tempRoot)

      expect(loadHrDemoPilotArtifact()).toMatchObject({
        campaignId: 'cmp-demo',
        routeContext: {
          actionCenterFocusUrl: '/action-center?focus=cmp-demo',
        },
      })
    } finally {
      process.chdir(originalCwd)
      rmSync(tempRoot, { recursive: true, force: true })
    }
  })

  it('moves the demo campaign to the front without changing the order of the rest', () => {
    const ordered = prioritizeHrDemoCampaigns(
      [
        { campaignId: 'cmp-a', label: 'A' },
        { campaignId: 'cmp-demo', label: 'Demo' },
        { campaignId: 'cmp-b', label: 'B' },
      ],
      { campaignId: 'cmp-demo' } as never,
    )

    expect(ordered.map((entry) => entry.campaignId)).toEqual(['cmp-demo', 'cmp-a', 'cmp-b'])
  })
})

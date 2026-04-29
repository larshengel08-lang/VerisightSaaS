import { describe, expect, it } from 'vitest'
import {
  loadHrDemoPilotArtifactFromSource,
  prioritizeHrDemoCampaigns,
} from '@/lib/dashboard/hr-demo-pilot-artifact'

describe('hr demo pilot artifact', () => {
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

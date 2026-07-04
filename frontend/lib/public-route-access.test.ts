import { describe, expect, it } from 'vitest'
import {
  PUBLIC_STATIC_ASSET_EXTENSIONS,
  isProtectedAppRoutePath,
  isPublicApiRoutePath,
  isPublicRoutePath,
  isPublicStaticAssetPath,
} from '@/lib/public-route-access'

describe('public route access', () => {
  it('treats the showcase pdf assets as public static files', () => {
    expect(isPublicStaticAssetPath('/examples/voorbeeldrapport_verisight.pdf')).toBe(true)
    expect(isPublicStaticAssetPath('/examples/voorbeeldrapport_retentiescan.pdf')).toBe(true)
    expect(isPublicStaticAssetPath('/dashboard')).toBe(false)
  })

  it('keeps the examples area and contact endpoint public', () => {
    expect(isPublicRoutePath('/examples')).toBe(true)
    expect(isPublicRoutePath('/examples/voorbeeldrapport_verisight.pdf')).toBe(true)
    expect(isPublicRoutePath('/oplossingen/verloop-analyse')).toBe(true)
    expect(isPublicRoutePath('/inzichten')).toBe(true)
    expect(isPublicRoutePath('/inzichten/effectief-luisteren-als-sleutel-tot-beter-leiderschap')).toBe(true)
    expect(isPublicApiRoutePath('/api/contact')).toBe(true)
    expect(isPublicApiRoutePath('/api/contact/submit')).toBe(true)
    expect(isPublicRoutePath('/dashboard')).toBe(false)
  })

  it('keeps pdf in the allowed public static asset list', () => {
    expect(PUBLIC_STATIC_ASSET_EXTENSIONS).toContain('pdf')
  })

  it('only guards the app areas so unknown paths can 404 instead of redirecting to login', () => {
    expect(isProtectedAppRoutePath('/dashboard')).toBe(true)
    expect(isProtectedAppRoutePath('/beheer/instellingen')).toBe(true)
    expect(isProtectedAppRoutePath('/campaigns/123')).toBe(true)
    expect(isProtectedAppRoutePath('/reports')).toBe(true)
    expect(isProtectedAppRoutePath('/action-center')).toBe(true)
    // Metadata-routes en onbekende paden mogen nooit richting /login.
    expect(isProtectedAppRoutePath('/opengraph-image')).toBe(false)
    expect(isProtectedAppRoutePath('/deze-pagina-bestaat-niet')).toBe(false)
    expect(isProtectedAppRoutePath('/kennismaking')).toBe(false)
  })
})

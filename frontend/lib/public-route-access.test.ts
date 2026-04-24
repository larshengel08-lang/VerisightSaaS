import { describe, expect, it } from 'vitest'
import {
  PUBLIC_STATIC_ASSET_EXTENSIONS,
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
    expect(isPublicRoutePath('/inzichten')).toBe(true)
    expect(isPublicRoutePath('/inzichten/waarom-medewerkers-vertrekken')).toBe(true)
    expect(isPublicRoutePath('/oplossingen/verloop-analyse')).toBe(true)
    expect(isPublicApiRoutePath('/api/contact')).toBe(true)
    expect(isPublicApiRoutePath('/api/contact/submit')).toBe(true)
    expect(isPublicRoutePath('/dashboard')).toBe(false)
  })

  it('keeps pdf in the allowed public static asset list', () => {
    expect(PUBLIC_STATIC_ASSET_EXTENSIONS).toContain('pdf')
  })
})

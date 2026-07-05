import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'
import {
  PUBLIC_STATIC_ASSET_EXTENSIONS,
  isProtectedAppRoutePath,
  isPublicApiRoutePath,
  isPublicRoutePath,
  isPublicStaticAssetPath,
} from '@/lib/public-route-access'

function routeDirsIn(groupDir: string): string[] {
  return fs
    .readdirSync(path.join(process.cwd(), 'app', groupDir), { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
}

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

  it('covers every (dashboard) route dir in the protected list — fail-open guard', () => {
    // De middleware beschermt alleen wat in PROTECTED_APP_ROUTES staat
    // (fail-open voor onbekende paden, zodat 404 en /opengraph-image werken).
    // Deze test dwingt af dat een NIEUWE map onder app/(dashboard)/ niet
    // stilzwijgend onbeschermd live gaat: voeg hem toe aan PROTECTED_APP_ROUTES
    // in lib/public-route-access.ts als deze test faalt.
    for (const dir of routeDirsIn('(dashboard)')) {
      expect(isProtectedAppRoutePath(`/${dir}`), `app/(dashboard)/${dir} mist in PROTECTED_APP_ROUTES`).toBe(true)
    }
  })

  it('keeps every (auth) route dir publicly reachable', () => {
    // Auth-schermen moeten bereikbaar blijven voor niet-ingelogde gebruikers;
    // een nieuwe (auth)-route hoort in PUBLIC_ROUTES.
    for (const dir of routeDirsIn('(auth)')) {
      expect(isPublicRoutePath(`/${dir}`), `app/(auth)/${dir} mist in PUBLIC_ROUTES`).toBe(true)
    }
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

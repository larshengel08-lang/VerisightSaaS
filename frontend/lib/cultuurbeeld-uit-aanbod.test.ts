import fs from 'node:fs'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import {
  CONTACT_ROUTE_OPTIONS,
  getContactQualificationGuidance,
  getContactRouteLabel,
  normalizeContactRouteInterest,
} from '@/lib/contact-funnel'

const ROOT = fileURLToPath(new URL('..', import.meta.url))

describe('Cultuurbeeld uit het aanbod (spec 2026-10-11, par. 7)', () => {
  it('een bezoeker kan Cultuurbeeld niet meer kiezen', () => {
    expect(CONTACT_ROUTE_OPTIONS.map((o) => o.value)).not.toContain('culture_assessment')
  })

  it('een oude lead met de Cultuurbeeld-sleutel blijft geldig en leesbaar', () => {
    expect(normalizeContactRouteInterest('culture_assessment')).toBe('culture_assessment')
    expect(getContactRouteLabel('culture_assessment')).toBe('Loep Cultuurbeeld')
  })

  it('de leadmail toont een leesbaar label, geen ruwe sleutel', () => {
    const bron = fs.readFileSync(`${ROOT}app/api/contact/route.ts`, 'utf8')
    expect(bron).toMatch(/culture_assessment:\s*'Loep Cultuurbeeld'/)
  })

  it('het beheer-leadoverzicht toont een leesbaar label', () => {
    const bron = fs.readFileSync(`${ROOT}components/dashboard/lead-ops-table.tsx`, 'utf8')
    expect(bron).toMatch(/value:\s*'culture_assessment',\s*label:\s*'Loep Cultuurbeeld'/)
  })

  it('een brede vraag over betrokkenheid landt op Loep Behoud', () => {
    const guidance = getContactQualificationGuidance({
      routeInterest: 'nog-onzeker',
      desiredTiming: 'dit-kwartaal',
      currentQuestion: 'We willen een medewerkersonderzoek naar tevredenheid, betrokkenheid en werkbeleving.',
    })
    expect(guidance.recommendedCoreRoute).toBe('retentiescan')
  })

  it('een oude lead die expliciet Cultuurbeeld koos, houdt die route', () => {
    const guidance = getContactQualificationGuidance({
      routeInterest: 'culture_assessment',
      desiredTiming: 'dit-kwartaal',
      currentQuestion: 'Brede cultuur- en engagementbaseline.',
    })
    expect(guidance.recommendedCoreRoute).toBe('culture_assessment')
  })
})

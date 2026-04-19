import { describe, expect, it } from 'vitest'
import { EXIT_ACTION_PLAYBOOKS } from '@/lib/products/exit/action-playbooks'
import { EXIT_FOCUS_QUESTIONS } from '@/lib/products/exit/focus-questions'
import { RETENTION_ACTION_PLAYBOOKS } from '@/lib/products/retention/action-playbooks'
import { RETENTION_FOCUS_QUESTIONS } from '@/lib/products/retention/focus-questions'
import { buildDashboardInsightToAction } from '@/lib/products/shared/insight-to-action'

describe('buildDashboardInsightToAction', () => {
  it('builds a bounded exit management package from existing route, questions and playbooks', () => {
    const result = buildDashboardInsightToAction({
      scanType: 'exit',
      factorAverages: {
        leadership: 4.2,
        culture: 5.1,
        growth: 4.4,
        compensation: 5.8,
        workload: 3.4,
        role_clarity: 5.2,
      },
      hasEnoughData: true,
      followThroughCards: [
        { title: 'Prioriteit nu', body: 'Werkbelasting is nu het eerste vertrekspoor om bestuurlijk te wegen.', tone: 'blue' },
        { title: 'Eerste eigenaar', body: 'HR business partner met betrokken leidinggevende', tone: 'emerald' },
        { title: 'Eerste actie', body: 'Voer binnen 2 weken een werklastreview uit in de meest afwijkende teams.', tone: 'amber' },
        { title: 'Reviewmoment', body: 'Plan binnen 60-90 dagen een review op gekozen spoor en eerste actie.', tone: 'emerald' },
      ],
      nextStep: {
        title: 'Eerst valideren, dan verbeteren',
        body: 'Gebruik werkbelasting als eerste gespreksspoor, beleg de eerste eigenaar en kies daarna direct welke 30-90 dagenactie eerst telt.',
        tone: 'amber',
      },
      focusQuestions: EXIT_FOCUS_QUESTIONS,
      actionPlaybooks: EXIT_ACTION_PLAYBOOKS,
    })

    expect(result?.managementPriorities).toHaveLength(3)
    expect(result?.verificationQuestions).toHaveLength(5)
    expect(result?.possibleFirstActions).toHaveLength(3)
    expect(result?.followUp30_60_90.map((item) => item.window)).toEqual(['30 dagen', '60 dagen', '90 dagen'])
    expect(result?.guardrailNote.toLowerCase()).toContain('geen diagnose')
  })

  it('keeps retention output verification-first when data is still indicative', () => {
    const result = buildDashboardInsightToAction({
      scanType: 'retention',
      factorAverages: {
        leadership: 4.8,
        culture: 4.1,
        growth: 5.6,
        compensation: 5.2,
        workload: 3.6,
        role_clarity: 5.1,
      },
      hasEnoughData: false,
      followThroughCards: [
        { title: 'Prioriteit nu', body: 'Werkbelasting is nu het eerste behoudsspoor om te verifieren en te prioriteren.', tone: 'blue' },
        { title: 'Eerste eigenaar', body: 'HR lead met betrokken leidinggevende', tone: 'emerald' },
        { title: 'Eerste actie', body: 'Toets binnen 30 dagen waar werkdruk, planning of herstelruimte eerst bijsturing vraagt.', tone: 'amber' },
        { title: 'Reviewmoment', body: 'Plan binnen 45-90 dagen een review of vervolgmeting.', tone: 'emerald' },
      ],
      nextStep: {
        title: 'Eerst valideren, daarna opvolgen',
        body: 'Gebruik werkbelasting als eerste validatiespoor, beleg de eerste eigenaar en vertaal dat daarna naar een concrete actie.',
        tone: 'emerald',
      },
      focusQuestions: RETENTION_FOCUS_QUESTIONS,
      actionPlaybooks: RETENTION_ACTION_PLAYBOOKS,
    })

    expect(result?.managementPriorities).toHaveLength(3)
    expect(result?.verificationQuestions).toHaveLength(5)
    expect(result?.possibleFirstActions).toHaveLength(3)
    expect(result?.guardrailNote.toLowerCase()).toContain('individuele predictor')
    expect(result?.managementPriorities.some((item) => item.body.toLowerCase().includes('verificatie'))).toBe(true)
  })

  it('dedupes and softens harder language before rendering', () => {
    const result = buildDashboardInsightToAction({
      scanType: 'exit',
      factorAverages: {
        leadership: 4.8,
        culture: 5.6,
        growth: 5.4,
        compensation: 5.9,
        workload: 3.4,
        role_clarity: 5.2,
      },
      hasEnoughData: false,
      followThroughCards: [
        { title: 'Prioriteit nu', body: 'Werkbelasting is de echte oorzaak die we moeten bewijzen.', tone: 'blue' },
        { title: 'Eerste eigenaar', body: 'HR business partner', tone: 'emerald' },
        { title: 'Eerste actie', body: 'Dit oplossen zal leiden tot bewijs van de echte oorzaak.', tone: 'amber' },
        { title: 'Reviewmoment', body: 'Plan binnen 60-90 dagen een review op gekozen spoor en eerste actie.', tone: 'emerald' },
      ],
      nextStep: {
        title: 'Eerst valideren, dan verbeteren',
        body: 'Welke oorzaak moeten we hier eerst bewijzen?',
        tone: 'amber',
      },
      focusQuestions: {
        workload: {
          HOOG: ['Welke oorzaak moeten we hier eerst bewijzen?', 'Welke oorzaak moeten we hier eerst bewijzen?'],
        },
      },
      actionPlaybooks: {
        workload: {
          HOOG: {
            title: 'Werkdruk',
            decision: 'Beslis welk spoor eerst telt.',
            validate: 'Toets waar werkdruk zichtbaar is.',
            owner: 'HR business partner',
            actions: ['Dit oplossen zal leiden tot bewijs van de echte oorzaak.', 'Dit oplossen zal leiden tot bewijs van de echte oorzaak.'],
            caution: 'Maak dit niet groter dan nodig.',
          },
        },
      },
    })

    expect(result?.verificationQuestions).toHaveLength(5)
    expect(result?.possibleFirstActions).toHaveLength(3)
    expect(result?.verificationQuestions.every((question) => !question.toLowerCase().includes('oorzaak'))).toBe(true)
    expect(result?.possibleFirstActions.every((item) => !item.body.toLowerCase().includes('oplossen'))).toBe(true)
    expect(result?.possibleFirstActions.every((item) => !item.body.toLowerCase().includes('bewijs'))).toBe(true)
  })
})

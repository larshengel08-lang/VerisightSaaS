import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { ActionCenterPreview } from '@/components/dashboard/action-center-preview'
import { finalizeActionCenterPreviewItem } from '@/lib/action-center-live'

describe('action center preview route fields render', () => {
  it('renders expected effect, review reason, and review outcome in the detail experience', () => {
    const item = finalizeActionCenterPreviewItem({
      id: 'route-1',
      code: 'ACT-1001',
      title: 'Exit follow-through voorjaar',
      summary: 'Vertrekduiding is nu scherp genoeg voor een eerste MT-read.',
      reason: 'Welke vertrekduiding vraagt nu als eerste managementeigenaarschap?',
      sourceLabel: 'ExitScan',
      orgId: 'org-1',
      scopeType: 'department',
      teamId: 'operations',
      teamLabel: 'Operations',
      ownerId: 'manager-1',
      ownerName: 'Manager Operations',
      ownerRole: 'Manager - Operations',
      ownerSubtitle: 'Operations',
      reviewOwnerName: 'HR lead',
      priority: 'hoog',
      status: 'in-uitvoering',
      reviewDate: '2026-05-12',
      expectedEffect: 'Binnen twee weken moet het eerste teamgesprek zijn gevoerd.',
      reviewReason: 'Toets of het eerste gesprek is gevoerd en of het knelpunt specifieker is geworden.',
      reviewOutcome: 'bijstellen',
      reviewDateLabel: '12 mei',
      reviewRhythm: 'Maandelijks',
      signalLabel: 'ExitScan - Exit voorjaar',
      signalBody: 'MT kiest een eerste leiderschapsspoor.',
      nextStep: 'Leg eigenaar en eerste correctie in het MT-overleg vast.',
      peopleCount: 38,
      updates: [
        {
          id: 'update-1',
          author: 'HR lead',
          dateLabel: '24 apr',
          note: 'MT kiest een eerste leiderschapsspoor.',
        },
      ],
    })

    const html = renderToStaticMarkup(
      React.createElement(ActionCenterPreview, {
        initialItems: [item],
        initialView: 'actions',
        fallbackOwnerName: 'Verisight gebruiker',
        ownerOptions: ['Manager Operations'],
        workbenchHref: '/dashboard',
        readOnly: true,
      }),
    )

    expect(html).toContain('Verwacht effect')
    expect(html).toContain('Binnen twee weken moet het eerste teamgesprek zijn gevoerd.')
    expect(html).toContain('Waarom we opnieuw kijken')
    expect(html).toContain('Toets of het eerste gesprek is gevoerd en of het knelpunt specifieker is geworden.')
    expect(html).toContain('Laatste reviewuitkomst')
    expect(html).toContain('Bijstellen')
  })
})

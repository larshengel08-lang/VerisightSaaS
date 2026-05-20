import type { ActionPlaybook } from '@/lib/products/shared/types'

export const CULTURE_ASSESSMENT_ACTION_PLAYBOOKS: Record<string, Record<string, ActionPlaybook>> = {
  engagement_involvement: {
    HOOG: {
      title: 'Betrokkenheid vraagt een expliciete board-read',
      decision: 'Bepaal eerst of het patroon breed organisatiebreed speelt of vooral geconcentreerd is in een paar onderdelen.',
      validate: 'Leg index, domeinbeeld en segmentcontrasten naast elkaar voordat je een vervolgritme kiest.',
      owner: 'Board sponsor met HR',
      actions: [
        'Open de board-read met responsbasis, index en de eerste twee opvallende domeinen.',
        'Beperk vervolgkeuzes eerst tot organisatiebrede prioritering of governed lokale verificatie.',
      ],
      caution: 'Maak van een breed betrokkenheidssignaal geen versimpelde tevredenheidsclaim of directe causaliteitsuitleg.',
      review: 'Toets pas na de board-read of een bounded Pulse-ritme logisch is als vervolg.',
    },
  },
  trust_psychological_safety: {
    HOOG: {
      title: 'Vertrouwen en veiligheid vragen patroonlezing',
      decision: 'Bepaal waar spanningen breed zichtbaar zijn en waar verschillen tussen onderdelen het scherpst terugkomen.',
      validate: 'Gebruik alleen veilige aggregatielagen en laat named manager detail gesloten.',
      owner: 'HR partner met board sponsor',
      actions: [
        'Bespreek eerst welke delen van de organisatie de grootste spreiding laten zien.',
        'Kies daarna of een lokale verdieping of een bredere bestuursreactie als eerste logisch is.',
      ],
      caution: 'Gebruik deze laag niet voor manager ranking of individuele duiding.',
    },
  },
  leadership_direction: {
    HOOG: {
      title: 'Leiderschap vraagt een bounded bestuursvraag',
      decision: 'Kies of de eerste read draait om richting, voorspelbaarheid van sturing of zichtbare beschikbaarheid van leiderschap.',
      validate: 'Houd de taal descriptief: waar is verschil zichtbaar en waar niet.',
      owner: 'Board sponsor',
      actions: [
        'Lees leiderschap altijd samen met trust en collaboration.',
        'Bepaal of vervolg via board-read, Leadership Scan of lokale verificatie logisch is.',
      ],
      caution: 'Noem geen individuele leiders of managers als probleemdrager in deze baseline.',
    },
  },
}

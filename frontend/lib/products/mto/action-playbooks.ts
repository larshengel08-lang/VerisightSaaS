import { FACTOR_LABELS } from '@/lib/types'
import type { ActionPlaybook } from '@/lib/products/shared/types'

type Band = 'HOOG' | 'MIDDEN' | 'LAAG'

function buildPlaybook(factorLabel: string, band: Band): ActionPlaybook {
  if (band === 'HOOG') {
    return {
      title: `${factorLabel} vraagt een eerste brede prioriteitsroute`,
      decision: `Beslis of ${factorLabel.toLowerCase()} nu het eerste organisatiethema is dat brede managementduiding en een beperkte eerste stap vraagt.`,
      validate: `Toets of ${factorLabel.toLowerCase()} nu breed genoeg speelt om als eerste organisatieread te openen.`,
      owner: 'HR lead met MT-sponsor',
      actions: [
        `Plan binnen 2 weken een eerste managementhuddle over ${factorLabel.toLowerCase()}.`,
        'Leg direct een eerste begrensde organisatiestap en reviewmoment vast.',
      ],
      caution: 'Open in deze wave nog geen formele rapport- of actionlaag; houd de eerste stap bounded en duidelijk.',
      review: 'Gebruik een volgende review om te toetsen of dit thema inderdaad het eerste brede organisatiespoor blijft.',
    }
  }

  if (band === 'MIDDEN') {
    return {
      title: `${factorLabel} blijft een actief breed aandachtsspoor`,
      decision: `Kies of ${factorLabel.toLowerCase()} nu al een beperkte correctie vraagt of eerst extra verificatie in de managementread.`,
      validate: `Controleer waar ${factorLabel.toLowerCase()} in de brede organisatieread het meest zichtbaar onder druk staat.`,
      owner: 'HR lead',
      actions: [
        `Maak ${factorLabel.toLowerCase()} expliciet onderwerp van de eerstvolgende managementread.`,
        'Leg vast welke extra vraag op de eerstvolgende review terug moet komen.',
      ],
      caution: 'Maak van een middensignaal nog geen volledige rapport- of projectroute.',
      review: 'Gebruik een bounded review nadat de eerste verificatie expliciet is belegd.',
    }
  }

  return {
    title: `${factorLabel} is nu vooral een borgspoor`,
    decision: `Beslis wat rond ${factorLabel.toLowerCase()} nu bewust behouden moet blijven in de brede organisatieread.`,
    validate: `Toets welke werkende praktijk rond ${factorLabel.toLowerCase()} deze stabiele basis nu het meest ondersteunt.`,
    owner: 'HR lead met business owner',
    actions: [
      `Leg vast wat rond ${factorLabel.toLowerCase()} bewust behouden moet blijven.`,
      'Bevestig een licht reviewmoment zodat deze stabiele basis zichtbaar bewaakt blijft.',
    ],
    caution: 'Gebruik stabiliteit niet als reden om de brede read helemaal los te laten; borg juist wat werkt.',
    review: 'Toets op het volgende reviewmoment of dezelfde stabiele basis overeind blijft.',
  }
}

export const MTO_ACTION_PLAYBOOKS = Object.fromEntries(
  Object.entries(FACTOR_LABELS).map(([factorKey, factorLabel]) => [
    factorKey,
    {
      HOOG: buildPlaybook(factorLabel, 'HOOG'),
      MIDDEN: buildPlaybook(factorLabel, 'MIDDEN'),
      LAAG: buildPlaybook(factorLabel, 'LAAG'),
    },
  ]),
) as Record<string, Record<Band, ActionPlaybook>>

import type { ScanType } from '@/lib/types'

type ResultsProductCopy = {
  readLabel: string
  focusLabel: string
  firstDiscussionLabel: string
  segmentFallback: string
}

export const RESULTS_FORBIDDEN_INTERNAL_TERMS = [
  'kleurt het vertrekbeeld',
  'eerste bestuurlijke spoor',
  'terugkijkende managementread',
  'leesdiscipline',
  'suppressieregels',
  'hoofdlaag',
  'meelezende context',
  'workflowproduct',
  'boardroom-read',
]

const RESULTS_COPY_MAP: Record<ScanType, ResultsProductCopy> = {
  exit: {
    readLabel: 'terugblik op vertrekredenen',
    focusLabel: 'wat valt het meest op in de resultaten',
    firstDiscussionLabel: 'eerste onderwerp om te bespreken',
    segmentFallback: 'Segmentduiding niet getoond: minimale groepsgrootte niet gehaald.',
  },
  retention: {
    readLabel: 'behoudsbeeld',
    focusLabel: 'waar aandacht voor behoud nodig is',
    firstDiscussionLabel: 'eerste onderwerp om te bespreken',
    segmentFallback: 'Segmentduiding niet getoond: minimale groepsgrootte niet gehaald.',
  },
  pulse: {
    readLabel: 'korte momentopname',
    focusLabel: 'wat nu het meeste aandacht vraagt',
    firstDiscussionLabel: 'eerste onderwerp om te bespreken',
    segmentFallback: 'Segmentduiding niet getoond: minimale groepsgrootte niet gehaald.',
  },
  team: {
    readLabel: 'lokale teamduiding',
    focusLabel: 'wat binnen dit team het meest opvalt',
    firstDiscussionLabel: 'eerste onderwerp om te bespreken',
    segmentFallback: 'Segmentduiding niet getoond: minimale groepsgrootte niet gehaald.',
  },
  onboarding: {
    readLabel: 'eerste indruk van de startfase',
    focusLabel: 'wat in deze startfase het meest opvalt',
    firstDiscussionLabel: 'eerste onderwerp om te bespreken',
    segmentFallback: 'Segmentduiding niet getoond: minimale groepsgrootte niet gehaald.',
  },
  leadership: {
    readLabel: 'beeld van ervaren leiding en richting',
    focusLabel: 'wat in de ervaren leiding het meest opvalt',
    firstDiscussionLabel: 'eerste onderwerp om te bespreken',
    segmentFallback: 'Segmentduiding niet getoond: minimale groepsgrootte niet gehaald.',
  },
  culture_assessment: {
    readLabel: 'organisatiebreed cultuurbeeld',
    focusLabel: 'wat in de cultuurresultaten het meest opvalt',
    firstDiscussionLabel: 'eerste onderwerp om te bespreken',
    segmentFallback: 'Segmentduiding niet getoond: minimale groepsgrootte niet gehaald.',
  },
}

export function getResultsProductCopy(scanType: ScanType): ResultsProductCopy {
  return RESULTS_COPY_MAP[scanType]
}

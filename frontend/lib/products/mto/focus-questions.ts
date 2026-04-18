import { FACTOR_LABELS } from '@/lib/types'

type Band = 'HOOG' | 'MIDDEN' | 'LAAG'

function buildBandQuestions(factorLabel: string, band: Band) {
  if (band === 'HOOG') {
    return [
      `Waar raakt ${factorLabel.toLowerCase()} nu het breedste organisatiethema dat als eerste duiding vraagt?`,
      `Welke brede managementvraag over ${factorLabel.toLowerCase()} moet nu eerst expliciet worden beantwoord?`,
    ]
  }

  if (band === 'MIDDEN') {
    return [
      `Gaat ${factorLabel.toLowerCase()} nu vooral om een eerste verificatie of al om een beperkte correctie?`,
      `Welke brede managementhuddle helpt het snelst om ${factorLabel.toLowerCase()} scherper te duiden?`,
    ]
  }

  return [
    `Welke stabiele praktijk rond ${factorLabel.toLowerCase()} moet nu expliciet behouden blijven?`,
    `Wat moet zichtbaar overeind blijven zodat dit thema niet alsnog een later organisatiesignaal wordt?`,
  ]
}

export const MTO_FOCUS_QUESTIONS = Object.fromEntries(
  Object.entries(FACTOR_LABELS).map(([factorKey, factorLabel]) => [
    factorKey,
    {
      HOOG: buildBandQuestions(factorLabel, 'HOOG'),
      MIDDEN: buildBandQuestions(factorLabel, 'MIDDEN'),
      LAAG: buildBandQuestions(factorLabel, 'LAAG'),
    },
  ]),
) as Record<string, Record<Band, string[]>>

import { FACTOR_LABELS } from '@/lib/types'

type Band = 'HOOG' | 'MIDDEN' | 'LAAG'

export interface FocusQuestionOption {
  key: string
  label: string
}

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

function buildBandQuestionOptions(factorKey: string, factorLabel: string, band: Band): FocusQuestionOption[] {
  return buildBandQuestions(factorLabel, band).map((label, index) => ({
    key: `${factorKey}.q${index + 1}`,
    label,
  }))
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

export const MTO_FOCUS_QUESTION_OPTIONS = Object.fromEntries(
  Object.entries(FACTOR_LABELS).map(([factorKey, factorLabel]) => [
    factorKey,
    {
      HOOG: buildBandQuestionOptions(factorKey, factorLabel, 'HOOG'),
      MIDDEN: buildBandQuestionOptions(factorKey, factorLabel, 'MIDDEN'),
      LAAG: buildBandQuestionOptions(factorKey, factorLabel, 'LAAG'),
    },
  ]),
) as Record<string, Record<Band, FocusQuestionOption[]>>

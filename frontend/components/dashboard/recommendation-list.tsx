import { FACTOR_LABELS } from '@/lib/types'

const FOCUS_QUESTIONS: Record<string, Record<string, string[]>> = {
  leadership: {
    HOOG: [
      'Wat vertellen vertrekkers over de relatie met hun leidinggevende?',
      'In welke teams lijkt dit het sterkst te spelen?',
    ],
    MIDDEN: [
      'Worden feedback en ontwikkeling voldoende concreet besproken?',
    ],
  },
  culture: {
    HOOG: [
      'Voelen medewerkers zich vrij om problemen of afwijkende meningen te delen?',
      'Zijn er teams waar dit patroon duidelijk sterker terugkomt?',
    ],
    MIDDEN: ['Welke situaties lijken de psychologische veiligheid onder druk te zetten?'],
  },
  growth: {
    HOOG: [
      'Weten medewerkers welke volgende stap binnen de organisatie realistisch is?',
      'Waar zit de grootste kloof tussen verwachting en ervaren perspectief?',
    ],
    MIDDEN: ['Hoe zichtbaar en bespreekbaar zijn groeipaden nu echt?'],
  },
  compensation: {
    HOOG: [
      'Hoe wordt beloning intern ervaren ten opzichte van vergelijkbare functies?',
    ],
    MIDDEN: ['Speelt vooral de hoogte van beloning, of ook de uitleg en transparantie?'],
  },
  workload: {
    HOOG: [
      'Is de werkbelasting structureel of vooral piekgebonden?',
      'Waar lijkt onvoldoende herstelruimte mee te spelen?',
    ],
    MIDDEN: ['Welke teams ervaren de hoogste druk en waardoor komt dat?'],
  },
  role_clarity: {
    HOOG: [
      'Waar zijn verwachtingen, verantwoordelijkheden of prioriteiten onvoldoende helder?',
    ],
    MIDDEN: ['Welke rolonduidelijkheid komt het vaakst terug in gesprekken of feedback?'],
  },
}

const ORG_FACTORS = ['leadership', 'culture', 'growth', 'compensation', 'workload', 'role_clarity']

interface Props {
  factorAverages: Record<string, number>
}

export function RecommendationList({ factorAverages }: Props) {
  const items = ORG_FACTORS
    .filter(f => f in factorAverages)
    .map(f => {
      const score = factorAverages[f]
      const signalValue = 11 - score
      const band = signalValue >= 7 ? 'HOOG' : signalValue >= 4.5 ? 'MIDDEN' : 'LAAG'
      return { factor: f, score, signalValue, band, questions: FOCUS_QUESTIONS[f]?.[band] ?? [] }
    })
    .sort((a, b) => b.signalValue - a.signalValue)
    .filter(item => item.questions.length > 0)

  const bandStyle: Record<string, { wrapper: string; badge: string }> = {
    HOOG: { wrapper: 'border-red-200 bg-red-50', badge: 'bg-red-100 text-red-700' },
    MIDDEN: { wrapper: 'border-amber-200 bg-amber-50', badge: 'bg-amber-100 text-amber-700' },
    LAAG: { wrapper: 'border-green-200 bg-green-50', badge: 'bg-green-100 text-green-700' },
  }

  return (
    <div className="space-y-3">
      {items.map(item => (
        <div key={item.factor} className={`rounded-lg border p-4 ${bandStyle[item.band].wrapper}`}>
          <div className="mb-2 flex items-center justify-between">
            <span className="text-sm font-semibold text-gray-800">{FACTOR_LABELS[item.factor]}</span>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500">signaal {item.signalValue.toFixed(1)}/10</span>
              <span className={`rounded px-1.5 py-0.5 text-xs font-bold ${bandStyle[item.band].badge}`}>
                {item.band === 'HOOG' ? 'URGENT' : item.band === 'MIDDEN' ? 'AANDACHT' : 'OK'}
              </span>
            </div>
          </div>
          <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">Focusvragen</div>
          <ul className="space-y-1">
            {item.questions.map((question, i) => (
              <li key={i} className="flex gap-2 text-sm text-gray-700">
                <span className="flex-shrink-0 text-gray-400">•</span>
                <span>{question}</span>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  )
}

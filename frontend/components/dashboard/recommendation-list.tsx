import { FACTOR_LABELS } from '@/lib/types'

// Aanbevelingen gespiegeld van backend/scoring.py
const RECOMMENDATIONS: Record<string, Record<string, string[]>> = {
  leadership: {
    HOOG: [
      'Implementeer direct een 1:1 check-in structuur (wekelijks, 30 min).',
      'Start leiderschapstraject gericht op coachend management (SDT-based).',
      'Overweeg 360°-feedback voor direct leidinggevenden binnen 30 dagen.',
    ],
    MIDDEN: [
      'Plan kwartaalgesprekken over ontwikkeling en werkbeleving.',
      'Introduceer concrete feedbackmomenten in bestaande teamoverleggen.',
    ],
    LAAG: ['Leiderschapskwaliteit scoort goed — periodiek monitoren volstaat.'],
  },
  culture: {
    HOOG: [
      'Voer cultuuraudit uit (psychologische veiligheid — Edmondson-instrument).',
      'Stel actieplan op voor inclusie en respect op de werkplek.',
    ],
    MIDDEN: ['Organiseer team-sessies rondom waarden en gedragsnormen.'],
    LAAG:   ['Cultuurscores positief — bewaken bij organisatieveranderingen.'],
  },
  growth: {
    HOOG: [
      'Stel binnen 30 dagen persoonlijk ontwikkelplan op voor iedere medewerker.',
      'Introduceer mentoring- en interne mobiliteitsprogramma.',
      'Maak loopbaanpaden zichtbaar en bespreekbaar.',
    ],
    MIDDEN: ['Evalueer of L&D-budget effectief wordt ingezet.'],
    LAAG:   ['Groeimogelijkheden worden gewaardeerd — behoud huidige aanpak.'],
  },
  compensation: {
    HOOG: [
      'Voer marktconforme beloningsscan uit (benchmark extern).',
      'Communiceer transparant over beloningsstructuur en groeipaden.',
    ],
    MIDDEN: ['Evalueer arbeidsvoorwaarden bij volgende CAO-ronde of budgetcyclus.'],
    LAAG:   ['Beloning wordt als marktconform ervaren — geen directe actie vereist.'],
  },
  workload: {
    HOOG: [
      'Urgent: analyseer werklastklachten en stel capaciteitsmaatregelen in.',
      'Voer JD-R resources-scan uit — zijn er voldoende taakhulpbronnen?',
    ],
    MIDDEN: ['Monitor werklastbeleving maandelijks via korte pulse-meting.'],
    LAAG:   ['Werkbelasting in balans — handhaven huidige aanpak.'],
  },
  role_clarity: {
    HOOG: [
      'Herschrijf functiebeschrijvingen en bespreek deze individueel.',
      'Introduceer RACI-model voor cruciale processen.',
    ],
    MIDDEN: ['Verhelder taken en verantwoordelijkheden in teamoverleg.'],
    LAAG:   ['Rolhelderheid goed — geen actie vereist.'],
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
      const score   = factorAverages[f]
      const riskVal = f === 'workload' ? score : 11 - score
      const band    = riskVal >= 7 ? 'HOOG' : riskVal >= 4.5 ? 'MIDDEN' : 'LAAG'
      return { factor: f, score, riskVal, band, recs: RECOMMENDATIONS[f]?.[band] ?? [] }
    })
    .sort((a, b) => b.riskVal - a.riskVal)
    .filter(item => item.recs.length > 0)

  const bandStyle: Record<string, { wrapper: string; badge: string }> = {
    HOOG:   { wrapper: 'border-red-200 bg-red-50',     badge: 'bg-red-100 text-red-700' },
    MIDDEN: { wrapper: 'border-amber-200 bg-amber-50', badge: 'bg-amber-100 text-amber-700' },
    LAAG:   { wrapper: 'border-green-200 bg-green-50', badge: 'bg-green-100 text-green-700' },
  }

  return (
    <div className="space-y-3">
      {items.map(item => (
        <div
          key={item.factor}
          className={`rounded-lg border p-4 ${bandStyle[item.band].wrapper}`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold text-gray-800">
              {FACTOR_LABELS[item.factor]}
            </span>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500">
                risico {item.riskVal.toFixed(1)}/10
              </span>
              <span className={`text-xs font-bold px-1.5 py-0.5 rounded ${bandStyle[item.band].badge}`}>
                {item.band === 'HOOG' ? 'URGENT' : item.band === 'MIDDEN' ? 'AANDACHT' : 'OK'}
              </span>
            </div>
          </div>
          <ul className="space-y-1">
            {item.recs.map((rec, i) => (
              <li key={i} className="text-sm text-gray-700 flex gap-2">
                <span className="text-gray-400 flex-shrink-0">•</span>
                <span>{rec}</span>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  )
}

'use client'

import { useState } from 'react'

const SLIDES = ['Dashboard', 'Factoranalyse', 'Werkhypothesen'] as const

function DashboardSlide() {
  return (
    <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
      <div className="rounded-3xl border border-slate-200 bg-slate-950 p-5 text-white">
        <div className="mb-5 flex items-center gap-2">
          <span className="h-3 w-3 rounded-full bg-red-400" />
          <span className="h-3 w-3 rounded-full bg-amber-300" />
          <span className="h-3 w-3 rounded-full bg-emerald-400" />
          <span className="ml-3 rounded-full bg-white/10 px-3 py-1 text-xs text-slate-300">dashboard.verisight.nl</span>
        </div>
        <div className="grid gap-4 sm:grid-cols-4">
          {[
            ['Responses', '14 van 18', '78% respons'],
            ['Gem. frictiescore', '5,8 op 10', 'Middelhoog signaal'],
            ['Werkfactorsignaal', '61%', 'Indicatieve duiding'],
            ['Gem. diensttijd', '2,4 jaar', 'Bij vertrek'],
          ].map(([label, value, detail]) => (
            <div key={label} className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">{label}</p>
              <p className="mt-2 text-lg font-bold text-white">{value}</p>
              <p className="mt-1 text-xs text-slate-400">{detail}</p>
            </div>
          ))}
        </div>
        <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Waar zitten de sterkste aandachtssignalen?</p>
          <div className="mt-4 space-y-3">
            {[
              ['Leiderschap', '6,3', 'Urgent', '63%', 'bg-red-400'],
              ['Groeiperspectief', '6,1', 'Urgent', '61%', 'bg-red-400'],
              ['Beloning & voorwaarden', '4,9', 'Aandacht', '49%', 'bg-amber-400'],
              ['Werkbelasting', '4,6', 'Aandacht', '46%', 'bg-amber-400'],
            ].map(([label, value, band, width, color]) => (
              <div key={label} className="grid grid-cols-[minmax(0,10rem)_1fr_auto_auto] items-center gap-3">
                <span className="text-sm text-slate-200">{label}</span>
                <div className="h-2 overflow-hidden rounded-full bg-white/10">
                  <div className={`h-full rounded-full ${color}`} style={{ width }} />
                </div>
                <span className="text-sm font-semibold text-white">{value}</span>
                <span className="text-xs font-semibold uppercase tracking-wide text-slate-300">{band}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="flex flex-col justify-between gap-4 rounded-3xl border border-slate-200 bg-slate-50 p-5">
        <div>
          <p className="text-sm font-semibold text-slate-900">Wat een HR-team hier concreet mee kan</p>
          <ul className="mt-4 space-y-3 text-sm leading-6 text-slate-700">
            <li>Je ziet welke vertrekpatronen terugkeren, niet alleen losse signalen per exit.</li>
            <li>Je krijgt een indicatie waar werkfactoren waarschijnlijk het meeste aandacht vragen.</li>
            <li>Je kunt management in gewone taal meenemen in wat eerst moet worden gevalideerd.</li>
          </ul>
        </div>
        <div className="rounded-2xl border border-blue-200 bg-blue-50 p-4">
          <p className="text-sm font-semibold text-blue-900">Belangrijke nuance</p>
          <p className="mt-2 text-sm leading-6 text-blue-950">
            Verisight vat signalen samen en helpt prioriteren. Het rapport doet geen individueel oordeel en geen harde voorspelling van toekomstig verloop.
          </p>
        </div>
      </div>
    </div>
  )
}

const FACTORS = [
  { label: 'Leiderschap', score: 4.7, signal: 6.3, band: 'URGENT', color: 'bg-red-500', text: 'text-red-700', border: 'border-red-200', bg: 'bg-red-50' },
  { label: 'Groeiperspectief', score: 4.9, signal: 6.1, band: 'URGENT', color: 'bg-red-500', text: 'text-red-700', border: 'border-red-200', bg: 'bg-red-50' },
  { label: 'Psychologische veiligheid', score: 5.6, signal: 5.4, band: 'AANDACHT', color: 'bg-amber-400', text: 'text-amber-700', border: 'border-amber-200', bg: 'bg-amber-50' },
  { label: 'Beloning & voorwaarden', score: 6.1, signal: 4.9, band: 'AANDACHT', color: 'bg-amber-400', text: 'text-amber-700', border: 'border-amber-200', bg: 'bg-amber-50' },
  { label: 'Werkbelasting', score: 6.4, signal: 4.6, band: 'AANDACHT', color: 'bg-amber-400', text: 'text-amber-700', border: 'border-amber-200', bg: 'bg-amber-50' },
  { label: 'Rolhelderheid', score: 7.1, signal: 3.9, band: 'OK', color: 'bg-emerald-500', text: 'text-emerald-700', border: 'border-emerald-200', bg: 'bg-emerald-50' },
] as const

function FactorSlide() {
  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-slate-100 bg-slate-50 px-5 py-3">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Uit het managementrapport - Organisatiefactoren</p>
        <p className="mt-1 text-sm text-slate-700">
          Per factor zie je de ervaren belevingsscore en de signaalwaarde. Die signaalwaarde helpt bepalen waar een gesprek of verdieping het meeste oplevert.
        </p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {FACTORS.map(({ label, score, signal, band, color, text, border, bg }) => (
          <div key={label} className={`rounded-2xl border p-4 ${border} ${bg}`}>
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-slate-900">{label}</p>
              <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${text} border ${border}`}>{band}</span>
            </div>
            <div className="mt-3 flex items-end justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-wide text-slate-500">Belevingsscore</p>
                <span className="text-3xl font-bold text-slate-950">{score}</span>
              </div>
              <div className="text-right">
                <p className="text-xs uppercase tracking-wide text-slate-500">Signaalwaarde</p>
                <p className={`text-lg font-bold ${text}`}>{signal}</p>
              </div>
            </div>
            <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-white/70">
              <div className={`h-full rounded-full ${color}`} style={{ width: `${signal * 10}%` }} />
            </div>
          </div>
        ))}
      </div>
      <div className="rounded-2xl border border-slate-200 bg-white p-4">
        <p className="text-xs font-semibold text-slate-500">Wat dit toevoegt aan een standaard dashboard</p>
        <p className="mt-2 text-sm leading-6 text-slate-700">
          Niet alleen een top-3, maar ook nuance: factoren die dicht bij elkaar liggen worden als cluster gelezen, en de output benoemt expliciet dat dit aandachtssignalen zijn en geen harde diagnose.
        </p>
      </div>
    </div>
  )
}

function HypothesisSlide() {
  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-slate-100 bg-slate-50 px-5 py-3">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Uit het managementrapport - Werkhypothesen</p>
        <p className="mt-1 text-sm text-slate-700">
          Verisight vertaalt de uitkomsten niet direct naar harde conclusies, maar naar hypothesen en focusvragen die HR of MT eerst kan toetsen.
        </p>
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        {[
          {
            title: 'Hypothese: leiderschap vraagt verdiepende validatie',
            body: 'Leiderschap komt terug als sterk aandachtssignaal en sluit aan op meerdere vertrekredenen. Dit wijst op een patroon dat eerst in gesprek moet worden gevalideerd.',
            question: 'Herkennen leidinggevenden dit beeld, en in welke teams lijkt het het sterkst te spelen?',
          },
          {
            title: 'Hypothese: groeiperspectief speelt structureel mee',
            body: 'Beperkt perspectief komt terug in zowel hoofdredenen als meespelende factoren. Dat maakt het een logisch thema om verder uit te diepen.',
            question: 'Weten medewerkers concreet wat hun volgende stap kan zijn binnen de organisatie?',
          },
        ].map(({ title, body, question }) => (
          <div key={title} className="rounded-2xl border border-blue-200 bg-blue-50 p-5">
            <p className="text-sm font-bold text-slate-950">{title}</p>
            <p className="mt-3 text-sm leading-6 text-slate-700">{body}</p>
            <div className="mt-4 rounded-xl border border-white/70 bg-white/80 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-blue-700">Te toetsen vraag</p>
              <p className="mt-2 text-sm leading-6 text-slate-800">{question}</p>
            </div>
          </div>
        ))}
      </div>
      <div className="rounded-2xl border border-blue-200 bg-blue-50 p-4">
        <p className="text-sm font-semibold text-blue-900">Vervolgstappen inbegrepen</p>
        <p className="mt-2 text-sm leading-6 text-blue-950">
          Het rapport eindigt met een gespreksagenda, beperkte set vervolgacties en duidelijke methodische nuance, zodat de output bruikbaar blijft zonder te overclaimen.
        </p>
      </div>
    </div>
  )
}

export function PreviewSlider() {
  const [current, setCurrent] = useState(0)
  const slides = [DashboardSlide, FactorSlide, HypothesisSlide]
  const SlideComponent = slides[current]

  return (
    <div>
      <div className="mb-6 flex flex-wrap gap-2">
        {SLIDES.map((label, i) => (
          <button
            key={label}
            onClick={() => setCurrent(i)}
            className={`rounded-full px-4 py-1.5 text-sm font-semibold transition-colors ${
              i === current
                ? 'bg-blue-700 text-white'
                : 'border border-slate-200 bg-white text-slate-600 hover:border-blue-200 hover:text-blue-700'
            }`}
          >
            {label}
          </button>
        ))}
      </div>
      <SlideComponent />
    </div>
  )
}

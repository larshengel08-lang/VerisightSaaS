'use client'

import { useState } from 'react'

const SLIDES = ['Dashboard', 'Factoranalyse', 'Wat nu?'] as const

// ── Slide 1: Management dashboard ───────────────────────────────────────────

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
            ['Gemiddeld risico', '7,2 op 10', 'Meerdere aandachtspunten'],
            ['Waarschijnlijk beinvloedbaar', '68%', 'Indicatieve inschatting'],
            ['Gemiddelde diensttijd', '2,4 jaar', 'Bij vertrek'],
          ].map(([label, value, detail]) => (
            <div key={label} className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">{label}</p>
              <p className="mt-2 text-lg font-bold text-white">{value}</p>
              <p className="mt-1 text-xs text-slate-400">{detail}</p>
            </div>
          ))}
        </div>
        <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Welke thema&apos;s vragen de meeste aandacht?</p>
          <div className="mt-4 space-y-3">
            {[
              ['Leiderschap', '8,1', 'Hoog', '81%', 'bg-red-400'],
              ['Groei en ontwikkeling', '6,4', 'Midden', '64%', 'bg-amber-400'],
              ['Cultuur', '5,9', 'Midden', '59%', 'bg-amber-400'],
              ['Werkbelasting', '3,1', 'Laag', '31%', 'bg-emerald-400'],
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
            <li>Je ziet welke vertrekredenen blijven terugkomen, niet alleen losse signalen per exit.</li>
            <li>Je krijgt een eerste indicatie waar HR of management waarschijnlijk kan bijsturen.</li>
            <li>Je kunt management in gewone taal uitleggen welke thema&apos;s nu prioriteit vragen.</li>
          </ul>
        </div>
        <div className="rounded-2xl border border-blue-200 bg-blue-50 p-4">
          <p className="text-sm font-semibold text-blue-900">Typische eerste opbrengst</p>
          <p className="mt-2 text-sm leading-6 text-blue-950">
            Bijvoorbeeld: HR ziet dat vertrek niet vooral om salaris draait, maar vaker samenhangt met leiderschap en beperkte groeiperspectieven. Dat maakt vervolgstappen veel gerichter.
          </p>
        </div>
      </div>
    </div>
  )
}

// ── Slide 2: Factoranalyse ───────────────────────────────────────────────────

const FACTORS = [
  { label: 'Leiderschap',          score: 8.1, band: 'URGENT',   color: 'bg-red-500',     text: 'text-red-700',     border: 'border-red-200',     bg: 'bg-red-50'     },
  { label: 'Groei & ontwikkeling', score: 6.4, band: 'AANDACHT', color: 'bg-amber-400',   text: 'text-amber-700',   border: 'border-amber-200',   bg: 'bg-amber-50'   },
  { label: 'Cultuur',              score: 5.9, band: 'AANDACHT', color: 'bg-amber-400',   text: 'text-amber-700',   border: 'border-amber-200',   bg: 'bg-amber-50'   },
  { label: 'Compensatie',          score: 4.2, band: 'NEUTRAAL', color: 'bg-blue-400',    text: 'text-blue-700',    border: 'border-blue-200',    bg: 'bg-blue-50'    },
  { label: 'Werkbelasting',        score: 3.1, band: 'STERK',    color: 'bg-emerald-500', text: 'text-emerald-700', border: 'border-emerald-200', bg: 'bg-emerald-50' },
  { label: 'Rolhelderheid',        score: 4.6, band: 'NEUTRAAL', color: 'bg-blue-400',    text: 'text-blue-700',    border: 'border-blue-200',    bg: 'bg-blue-50'    },
] as const

function FactorSlide() {
  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-slate-100 bg-slate-50 px-5 py-3">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Uit het managementrapport — Organisatiefactoren</p>
        <p className="mt-1 text-sm text-slate-700">Scores op schaal 1–10. Een hogere score wijst op een sterkere bijdrage aan vertrekrisico.</p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {FACTORS.map(({ label, score, band, color, text, border, bg }) => (
          <div key={label} className={`rounded-2xl border p-4 ${border} ${bg}`}>
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-slate-900">{label}</p>
              <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${text} border ${border}`}>{band}</span>
            </div>
            <div className="mt-3 flex items-end gap-3">
              <span className="text-3xl font-bold text-slate-950">{score}</span>
              <div className="mb-1 flex-1">
                <div className="h-2 w-full overflow-hidden rounded-full bg-white/60">
                  <div className={`h-full rounded-full ${color}`} style={{ width: `${score * 10}%` }} />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="rounded-2xl border border-slate-200 bg-white p-4">
        <p className="text-xs font-semibold text-slate-500">Wat dit rapport toevoegt aan alleen een dashboard</p>
        <p className="mt-2 text-sm leading-6 text-slate-700">
          Per factor zie je de gemiddelde score, de risicoclassificatie en — waar relevant — een gerichte focusvraag voor het gesprek met leidinggevenden of het MT.
        </p>
      </div>
    </div>
  )
}

// ── Slide 3: Gespreksagenda (Wat nu?) ────────────────────────────────────────

function AgendaSlide() {
  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-slate-100 bg-slate-50 px-5 py-3">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Uit het managementrapport — Wat nu?</p>
        <p className="mt-1 text-sm text-slate-700">Op basis van de twee hoogste risicofactoren stelt Verisight een gespreksagenda op voor het MT of HR.</p>
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        {[
          {
            factor: 'Leiderschap',
            band: 'URGENT',
            border: 'border-red-200',
            bg: 'bg-red-50',
            tag: 'text-red-700',
            questions: [
              'Herkennen leidinggevenden het beeld dat uit de scores naar voren komt?',
              'In welke teams speelt dit het sterkst, en wat maakt dat zo?',
              'Wat hebben medewerkers nodig van hun leidinggevende dat nu ontbreekt?',
            ],
          },
          {
            factor: 'Groei & ontwikkeling',
            band: 'AANDACHT',
            border: 'border-amber-200',
            bg: 'bg-amber-50',
            tag: 'text-amber-700',
            questions: [
              'Zijn groeipaden concreet en bespreekbaar in functioneringsgesprekken?',
              'Welke medewerkers ervaren het vaakst gebrek aan perspectief?',
              'Wat is haalbaar binnen de huidige organisatiestructuur?',
            ],
          },
        ].map(({ factor, band, border, bg, tag, questions }) => (
          <div key={factor} className={`rounded-2xl border p-5 ${border} ${bg}`}>
            <div className="flex items-center gap-3">
              <p className="text-sm font-bold text-slate-950">{factor}</p>
              <span className={`rounded-full border px-2 py-0.5 text-xs font-bold ${tag} ${border}`}>{band}</span>
            </div>
            <ul className="mt-4 space-y-2">
              {questions.map((q) => (
                <li key={q} className="flex gap-2 text-sm leading-6 text-slate-700">
                  <span className="mt-1 shrink-0 text-slate-400">—</span>
                  {q}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="rounded-2xl border border-blue-200 bg-blue-50 p-4">
        <p className="text-sm font-semibold text-blue-900">Vervolgstappen inbegrepen</p>
        <p className="mt-2 text-sm leading-6 text-blue-950">
          Het rapport sluit af met concrete actiestappen en een persoonlijke toelichting op de uitkomsten door Verisight.
        </p>
      </div>
    </div>
  )
}

// ── Main export ──────────────────────────────────────────────────────────────

export function PreviewSlider() {
  const [current, setCurrent] = useState(0)
  const slides = [DashboardSlide, FactorSlide, AgendaSlide]
  const SlideComponent = slides[current]

  return (
    <div>
      <div className="mb-6 flex gap-2">
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

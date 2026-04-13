'use client'

import Image from 'next/image'
import { useState } from 'react'

type PreviewVariant = 'portfolio' | 'exit' | 'retention'

interface PreviewSliderProps {
  variant?: PreviewVariant
}

const SLIDES = ['Dashboard', 'Factoranalyse', 'Managementduiding'] as const

const COPY = {
  portfolio: {
    label: 'Portfolio-overzicht',
    intro:
      'Verisight vertaalt scans naar een compact managementbeeld: wanneer kijk je terug op vertrek en wanneer stuur je eerder op behoud?',
    kpis: [
      ['Actieve campagnes', '2 scans actief', 'ExitScan en RetentieScan'],
      ['Gemiddeld hoofdsignaal', '5,4 op 10', 'Bespreek met HR en MT'],
      ['Belangrijkste aandachtspunt', 'Groei', 'Hier is het meeste te winnen'],
      ['Stuurvraag', 'Vertrek of behoud?', 'Kies de juiste scanvorm'],
    ],
    focusTitle: 'Waar valt de meeste managementactie te halen?',
    nuance:
      'De output helpt kiezen waar gesprek of actie het meeste oplevert. Verisight claimt geen individuele voorspelling of diagnose.',
    factorLead:
      'Per factor zie je de belevingsscore en de signaalwaarde. Zo kun je dezelfde managementtaal gebruiken voor vertrekduiding en vroegsignalering.',
    hypothesisLead:
      'Verisight vertaalt uitkomsten niet naar absolute conclusies, maar naar een managementgesprek dat scherper en beter begrensd wordt.',
    hypotheses: [
      {
        title: 'Kies eerst de juiste vraag',
        body: 'Soms is het probleem vooral achteraf duiden waarom mensen gingen. Soms wil je eerder weten waar behoud onder druk staat. De scanvorm moet daarop aansluiten.',
        question: 'Willen we nu vooral leren van vertrek, of eerder sturen op behoud?',
      },
      {
        title: 'Werkfactoren vragen vaak dezelfde taal, niet dezelfde duiding',
        body: 'Leiderschap, groei, cultuur en werkbelasting spelen in beide scans een rol. Het verschil zit in de managementvraag en de manier waarop je de uitkomst gebruikt.',
        question: 'Lezen we deze signalen als vertrekduiding of als vroegsignaal op behoud?',
      },
    ],
    proofNotes: [
      ['Dashboard en rapport', 'Dezelfde managementtaal in twee productroutes'],
      ['Segment deep dive', 'Geschikt voor afdelingen en functieniveaus bij voldoende n'],
      ['Begeleide output', 'Geen losse survey-export of self-serve tool'],
    ],
  },
  exit: {
    label: 'ExitScan-voorbeeld',
    intro:
      'ExitScan bundelt vertrekinput tot een vergelijkbaar organisatiebeeld, zodat HR, MT en directie sneller zien waar terugkerende werkfrictie aandacht vraagt.',
    kpis: [
      ['Reacties', '14 van 18', '78% respons'],
      ['Gemiddelde frictiescore', '5,8 op 10', 'Vergt nadere duiding'],
      ['Belangrijkste aandachtspunt', 'Groei', 'Hier is het meeste te winnen'],
      ['Gemiddelde diensttijd', '2,4 jaar', 'Van vertrekkende medewerkers'],
    ],
    focusTitle: 'Waar valt de meeste verbetering te halen?',
    nuance:
      'ExitScan maakt patronen zichtbaar en helpt bepalen waar vervolgactie het meeste oplevert. Het blijft groepsduiding, geen individueel oordeel of harde voorspelling.',
    factorLead:
      'Per factor zie je de ervaren belevingsscore en de signaalwaarde. Die signaalwaarde helpt bepalen waar een gesprek of verdieping het meeste oplevert.',
    hypothesisLead:
      'Verisight vertaalt de uitkomsten niet direct naar harde conclusies, maar naar hypothesen en focusvragen die HR of MT eerst kan toetsen.',
    hypotheses: [
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
    ],
    proofNotes: [
      ['Rapportfocus', 'Vertrekduiding, frictiescore en prioritaire werkfactoren'],
      ['Geschikt voor HR en MT', 'Sterk als nulmeting of periodieke exit review'],
      ['Methodische nuance', 'Signalen en hypothesen, geen absolute waarheid'],
    ],
  },
  retention: {
    label: 'RetentieScan-voorbeeld',
    intro:
      'RetentieScan laat eerder zien waar behoud onder druk staat, met retentiesignaal, bevlogenheid, vertrekintentie en de werkfactoren die het gesprek het scherpst maken.',
    kpis: [
      ['Reacties', '63 van 92', '68% respons'],
      ['Gemiddeld retentiesignaal', '5,6 op 10', 'Breed aandachtssignaal'],
      ['Gemiddelde bevlogenheid', '6,8 op 10', 'Niet laag, wel ongelijk verdeeld'],
      ['Gemiddelde vertrekintentie', '4,7 op 10', 'Vraagt gerichte opvolging'],
    ],
    focusTitle: 'Waar vraagt behoud nu het meeste aandacht?',
    nuance:
      'RetentieScan is bedoeld voor groeps- en segmentduiding. De output is nadrukkelijk geen individuele voorspeller of performance-instrument.',
    factorLead:
      'De factoranalyse laat zien waar behoudssignalen samenhangen met beïnvloedbare werkfactoren zoals leiderschap, groei en werkbelasting.',
    hypothesisLead:
      'De rapportage helpt management niet alleen zien wat spannend is, maar ook hoe je daar zorgvuldig over spreekt zonder te overclaimen.',
    hypotheses: [
      {
        title: 'Hypothese: werkdruk zet behoud in delen van de organisatie onder druk',
        body: 'Werkbelasting en hersteltijd laten een gemengd maar terugkerend signaal zien. In combinatie met hogere vertrekintentie is dit een logisch eerste gespreksthema.',
        question: 'Welke teams hebben structureel te weinig herstelruimte of voorspelbaarheid in planning?',
      },
      {
        title: 'Hypothese: groei en leidinggevend gedrag bepalen het verschil tussen teams',
        body: 'Het totaalbeeld is niet overal even zorgelijk, maar teams met zwakker groeiperspectief en minder steun van leidinggevenden wijken duidelijker af.',
        question: 'Waar ontbreekt nu het geloofwaardige groeiverhaal of de dagelijkse ondersteuning die medewerkers nodig hebben?',
      },
    ],
    proofNotes: [
      ['Groepsniveau', 'Geen individuele retention-scores naar management'],
      ['Signaalmix', 'Retentiesignaal, bevlogenheid en vertrekintentie in één beeld'],
      ['Actielogica', 'Topfactoren en vervolgvragen voor 30-90 dagen'],
    ],
  },
} as const

const FACTORS = [
  {
    label: 'Leiderschap',
    score: 4.7,
    signal: 6.3,
    band: 'NU BESPREKEN',
    color: 'bg-red-500',
    text: 'text-red-700',
    border: 'border-red-200',
    bg: 'bg-red-50',
  },
  {
    label: 'Groei',
    score: 4.9,
    signal: 6.1,
    band: 'NU BESPREKEN',
    color: 'bg-red-500',
    text: 'text-red-700',
    border: 'border-red-200',
    bg: 'bg-red-50',
  },
  {
    label: 'Psychologische veiligheid',
    score: 5.6,
    signal: 5.4,
    band: 'VERDER BEKIJKEN',
    color: 'bg-amber-400',
    text: 'text-amber-700',
    border: 'border-amber-200',
    bg: 'bg-amber-50',
  },
  {
    label: 'Beloning & voorwaarden',
    score: 6.1,
    signal: 4.9,
    band: 'VERDER BEKIJKEN',
    color: 'bg-amber-400',
    text: 'text-amber-700',
    border: 'border-amber-200',
    bg: 'bg-amber-50',
  },
  {
    label: 'Werkbelasting',
    score: 6.4,
    signal: 4.6,
    band: 'VERDER BEKIJKEN',
    color: 'bg-amber-400',
    text: 'text-amber-700',
    border: 'border-amber-200',
    bg: 'bg-amber-50',
  },
  {
    label: 'Rolhelderheid',
    score: 7.1,
    signal: 3.9,
    band: 'OK',
    color: 'bg-emerald-500',
    text: 'text-emerald-700',
    border: 'border-emerald-200',
    bg: 'bg-emerald-50',
  },
] as const

function ProofRail({ variant }: { variant: PreviewVariant }) {
  const copy = COPY[variant]

  return (
    <div className="grid gap-4 lg:grid-cols-[0.88fr_1.12fr]">
      <div className="rounded-2xl border border-slate-200 bg-white p-4">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Rapportexcerpt</p>
        <div className="mt-4 space-y-3">
          {copy.proofNotes.map(([title, body]) => (
            <div key={title} className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
              <p className="text-sm font-semibold text-slate-950">{title}</p>
              <p className="mt-1 text-sm leading-6 text-slate-600">{body}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-4 py-3">
          <div>
            <p className="text-sm font-semibold text-slate-950">Segment deep dive preview</p>
            <p className="mt-1 text-xs leading-5 text-slate-500">Voorbeeld van dezelfde visuele outputtaal in rapport en dashboard.</p>
          </div>
          <span className="rounded-full bg-blue-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-blue-700">
            Proof
          </span>
        </div>
        <Image
          src="/segment-deep-dive-preview.png"
          alt="Voorbeeld van een Verisight segment deep dive"
          width={1600}
          height={960}
          className="h-full w-full object-cover"
        />
      </div>
    </div>
  )
}

function DashboardSlide({ variant }: { variant: PreviewVariant }) {
  const copy = COPY[variant]

  return (
    <div className="space-y-4">
      <div className="grid gap-6 lg:grid-cols-[1.12fr_0.88fr]">
        <div className="rounded-3xl border border-slate-200 bg-slate-950 p-5 text-white">
          <div className="mb-5 flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-red-400" />
            <span className="h-3 w-3 rounded-full bg-amber-300" />
            <span className="h-3 w-3 rounded-full bg-emerald-400" />
            <span className="ml-3 rounded-full bg-white/10 px-3 py-1 text-xs text-slate-300">dashboard.verisight.nl</span>
          </div>
          <div className="grid gap-4 sm:grid-cols-4">
            {copy.kpis.map(([label, value, detail]) => (
              <div key={label} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">{label}</p>
                <p className="mt-2 text-lg font-bold text-white">{value}</p>
                <p className="mt-1 text-xs text-slate-400">{detail}</p>
              </div>
            ))}
          </div>
          <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">{copy.focusTitle}</p>
            <div className="mt-4 space-y-3">
              {[
                ['Leiderschap', '6,3', 'Nu bespreken', '63%', 'bg-red-400'],
                ['Groei', '6,1', 'Nu bespreken', '61%', 'bg-red-400'],
                ['Beloning & voorwaarden', '4,9', 'Verder bekijken', '49%', 'bg-amber-400'],
                ['Werkbelasting', '4,6', 'Verder bekijken', '46%', 'bg-amber-400'],
              ].map(([label, value, band, width, color]) => (
                <div key={label} className="grid grid-cols-[minmax(0,10rem)_1fr_auto_auto] items-center gap-3">
                  <span className="text-sm text-slate-200">{label}</span>
                  <div className="h-2 overflow-hidden rounded-full bg-white/10">
                    <div className={color} style={{ width, height: '100%', borderRadius: 9999 }} />
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
            <p className="text-sm font-semibold text-slate-900">{copy.label}</p>
            <p className="mt-4 text-sm leading-6 text-slate-700">{copy.intro}</p>
          </div>
          <div className="rounded-2xl border border-blue-200 bg-blue-50 p-4">
            <p className="text-sm font-semibold text-blue-900">Belangrijke nuance</p>
            <p className="mt-2 text-sm leading-6 text-blue-950">{copy.nuance}</p>
          </div>
        </div>
      </div>

      <ProofRail variant={variant} />
    </div>
  )
}

function FactorSlide({ variant }: { variant: PreviewVariant }) {
  const copy = COPY[variant]

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-slate-100 bg-slate-50 px-5 py-3">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
          Uit het managementrapport - Organisatiefactoren
        </p>
        <p className="mt-1 text-sm text-slate-700">{copy.factorLead}</p>
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
              <div className={color} style={{ width: `${signal * 10}%`, height: '100%', borderRadius: 9999 }} />
            </div>
          </div>
        ))}
      </div>
      <ProofRail variant={variant} />
    </div>
  )
}

function HypothesisSlide({ variant }: { variant: PreviewVariant }) {
  const copy = COPY[variant]

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-slate-100 bg-slate-50 px-5 py-3">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
          Uit het managementrapport - Duiding en vervolgstappen
        </p>
        <p className="mt-1 text-sm text-slate-700">{copy.hypothesisLead}</p>
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        {copy.hypotheses.map(({ title, body, question }) => (
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
      <ProofRail variant={variant} />
    </div>
  )
}

export function PreviewSlider({ variant = 'portfolio' }: PreviewSliderProps) {
  const [current, setCurrent] = useState(0)

  return (
    <div>
      <div className="mb-6 flex flex-wrap gap-2">
        {SLIDES.map((label, index) => (
          <button
            key={label}
            onClick={() => setCurrent(index)}
            className={`rounded-full px-4 py-1.5 text-sm font-semibold transition-colors ${
              index === current
                ? 'bg-blue-700 text-white'
                : 'border border-slate-200 bg-white text-slate-600 hover:border-blue-200 hover:text-blue-700'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {current === 0 ? <DashboardSlide variant={variant} /> : null}
      {current === 1 ? <FactorSlide variant={variant} /> : null}
      {current === 2 ? <HypothesisSlide variant={variant} /> : null}
    </div>
  )
}

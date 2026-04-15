'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'
import {
  REPORT_PREVIEW_COPY,
  type ReportPreviewFactorCard,
  type ReportPreviewVariant,
} from '@/lib/report-preview-copy'

interface PreviewSliderProps {
  variant?: ReportPreviewVariant
}

const SLIDES = ['Dashboardbeeld', 'Factorbeeld', 'Bestuurlijke duiding'] as const
const COPY = REPORT_PREVIEW_COPY

const toneStyles = {
  red: {
    bar: 'bg-red-400',
    text: 'text-red-700',
    border: 'border-red-200',
    bg: 'bg-red-50',
  },
  amber: {
    bar: 'bg-amber-400',
    text: 'text-amber-700',
    border: 'border-amber-200',
    bg: 'bg-amber-50',
  },
  emerald: {
    bar: 'bg-emerald-500',
    text: 'text-emerald-700',
    border: 'border-emerald-200',
    bg: 'bg-emerald-50',
  },
} as const

function SampleReportCard({ variant }: { variant: ReportPreviewVariant }) {
  const copy = COPY[variant]
  if (!copy.sampleReportHref || !copy.sampleReportLabel || !copy.sampleReportTitle || !copy.sampleReportBody) {
    return null
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">{copy.sampleReportTitle}</p>
      <p className="mt-3 text-sm leading-6 text-slate-700">{copy.sampleReportBody}</p>
      <div className="mt-4">
        <Link
          href={copy.sampleReportHref}
          className="inline-flex rounded-full border border-slate-300 bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-700 transition-colors hover:border-slate-400 hover:bg-white hover:text-slate-950"
        >
          {copy.sampleReportLabel}
        </Link>
      </div>
    </div>
  )
}

function ProofRail({ variant }: { variant: ReportPreviewVariant }) {
  const copy = COPY[variant]

  return (
    <div className="grid gap-4 lg:grid-cols-[0.88fr_1.12fr]">
      <div className="space-y-4">
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-700">{copy.boardroomTitle}</p>
          <p className="mt-3 text-sm leading-6 text-slate-700">{copy.boardroomIntro}</p>
          <div className="mt-4 space-y-3">
            {copy.boardroomPoints.map(([title, body]) => (
              <div key={title} className="rounded-xl border border-white/70 bg-white/90 px-4 py-3">
                <p className="text-sm font-semibold text-slate-950">{title}</p>
                <p className="mt-1 text-sm leading-6 text-slate-600">{body}</p>
              </div>
            ))}
          </div>
        </div>

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

        <SampleReportCard variant={variant} />

        <div className="rounded-2xl border border-blue-200 bg-blue-50 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-700">{copy.trustTitle}</p>
          <p className="mt-3 text-sm leading-6 text-slate-700">{copy.trustIntro}</p>
          <div className="mt-4 space-y-3">
            {copy.trustPoints.map(([title, body]) => (
              <div key={title} className="rounded-xl border border-white/70 bg-white/90 px-4 py-3">
                <p className="text-sm font-semibold text-slate-950">{title}</p>
                <p className="mt-1 text-sm leading-6 text-slate-600">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-4 py-3">
          <div>
            <p className="text-sm font-semibold text-slate-950">{copy.supportVisualTitle}</p>
            <p className="mt-1 text-xs leading-5 text-slate-500">{copy.demoBody}</p>
          </div>
          <span className="rounded-full bg-blue-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-blue-700">
            {copy.demoLabel}
          </span>
        </div>
        <Image
          src="/segment-deep-dive-preview.png"
          alt={copy.supportVisualAlt}
          width={1600}
          height={960}
          className="h-full w-full object-cover"
        />
      </div>
    </div>
  )
}

function DashboardSlide({ variant }: { variant: ReportPreviewVariant }) {
  const copy = COPY[variant]

  return (
    <div className="space-y-4">
      <div className="grid gap-6 lg:grid-cols-[1.12fr_0.88fr]">
        <div className="rounded-3xl border border-slate-200 bg-slate-950 p-5 text-white">
          <div className="mb-5 flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-red-400" />
            <span className="h-3 w-3 rounded-full bg-amber-300" />
            <span className="h-3 w-3 rounded-full bg-emerald-400" />
            <span className="ml-3 rounded-full bg-white/10 px-3 py-1 text-xs text-slate-300">verisight.nl/dashboard</span>
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
              {copy.dashboardRows.map((row) => {
                const tone = toneStyles[row.tone]
                return (
                  <div key={row.label} className="grid grid-cols-[minmax(0,10rem)_1fr_auto_auto] items-center gap-3">
                    <span className="text-sm text-slate-200">{row.label}</span>
                    <div className="h-2 overflow-hidden rounded-full bg-white/10">
                      <div className={tone.bar} style={{ width: row.width, height: '100%', borderRadius: 9999 }} />
                    </div>
                    <span className="text-sm font-semibold text-white">{row.value}</span>
                    <span className="text-xs font-semibold uppercase tracking-wide text-slate-300">{row.band}</span>
                  </div>
                )
              })}
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
          <div className="rounded-2xl border border-slate-200 bg-white p-4">
            <p className="text-sm font-semibold text-slate-950">Wat deze preview laat zien</p>
            <p className="mt-2 text-sm leading-6 text-slate-600">{copy.trustPoints[1]?.[1]}</p>
          </div>
        </div>
      </div>

      <ProofRail variant={variant} />
    </div>
  )
}

function FactorCard({ card }: { card: ReportPreviewFactorCard }) {
  const tone = toneStyles[card.tone]

  return (
    <div className={`rounded-2xl border p-4 ${tone.border} ${tone.bg}`}>
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-slate-900">{card.label}</p>
        <span className={`rounded-full border px-2.5 py-0.5 text-xs font-bold ${tone.text} ${tone.border}`}>
          {card.band}
        </span>
      </div>
      <div className="mt-3 flex items-end justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-wide text-slate-500">Belevingsscore</p>
          <span className="text-3xl font-bold text-slate-950">{card.score}</span>
        </div>
        <div className="text-right">
          <p className="text-xs uppercase tracking-wide text-slate-500">Signaalwaarde</p>
          <p className={`text-lg font-bold ${tone.text}`}>{card.signal}</p>
        </div>
      </div>
      <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-white/70">
        <div className={tone.bar} style={{ width: `${Number(card.signal.replace(',', '.')) * 10}%`, height: '100%', borderRadius: 9999 }} />
      </div>
    </div>
  )
}

function FactorSlide({ variant }: { variant: ReportPreviewVariant }) {
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
        {copy.factorCards.map((card) => (
          <FactorCard key={card.label} card={card} />
        ))}
      </div>
      <ProofRail variant={variant} />
    </div>
  )
}

function HypothesisSlide({ variant }: { variant: ReportPreviewVariant }) {
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
            type="button"
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

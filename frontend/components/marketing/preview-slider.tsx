'use client'

import Image from 'next/image'
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
    badge: 'border-red-200 bg-red-50 text-red-700',
    surface: 'border-red-200 bg-red-50',
  },
  amber: {
    bar: 'bg-amber-400',
    badge: 'border-amber-200 bg-amber-50 text-amber-700',
    surface: 'border-amber-200 bg-amber-50',
  },
  emerald: {
    bar: 'bg-emerald-500',
    badge: 'border-emerald-200 bg-emerald-50 text-emerald-700',
    surface: 'border-emerald-200 bg-emerald-50',
  },
} as const

function DashboardCanvas({ variant }: { variant: ReportPreviewVariant }) {
  const copy = COPY[variant]

  return (
    <div className="rounded-[1.9rem] border border-slate-200 bg-slate-950 p-5 text-white">
      <div className="mb-5 flex items-center gap-2">
        <span className="h-3 w-3 rounded-full bg-red-400" />
        <span className="h-3 w-3 rounded-full bg-amber-300" />
        <span className="h-3 w-3 rounded-full bg-emerald-400" />
        <span className="ml-3 rounded-full bg-white/10 px-3 py-1 text-xs text-slate-300">verisight.nl/dashboard</span>
      </div>
      <div className="grid gap-3 sm:grid-cols-4">
        {copy.kpis.map(([label, value, detail]) => (
          <div key={label} className="rounded-[1.4rem] border border-white/10 bg-white/5 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">{label}</p>
            <p className="mt-2 text-lg font-bold text-white">{value}</p>
            <p className="mt-1 text-xs text-slate-400">{detail}</p>
          </div>
        ))}
      </div>
      <div className="mt-5 rounded-[1.4rem] border border-white/10 bg-white/5 p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">{copy.focusTitle}</p>
        <div className="mt-4 space-y-3">
          {copy.dashboardRows.map((row) => {
            const tone = toneStyles[row.tone]

            return (
              <div key={row.label} className="grid grid-cols-[minmax(0,8.5rem)_1fr_auto] items-center gap-3">
                <span className="text-sm text-slate-200">{row.label}</span>
                <div className="h-2 overflow-hidden rounded-full bg-white/10">
                  <div className={tone.bar} style={{ width: row.width, height: '100%', borderRadius: 9999 }} />
                </div>
                <span className="text-xs font-semibold uppercase tracking-wide text-slate-300">{row.band}</span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

function FactorCard({ card }: { card: ReportPreviewFactorCard }) {
  const tone = toneStyles[card.tone]

  return (
    <div className={`rounded-[1.35rem] border p-4 ${tone.surface}`}>
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-semibold text-slate-900">{card.label}</p>
        <span className={`rounded-full border px-2.5 py-0.5 text-xs font-bold ${tone.badge}`}>{card.band}</span>
      </div>
      <div className="mt-3 flex items-end justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-wide text-slate-500">Belevingsscore</p>
          <span className="text-3xl font-bold text-slate-950">{card.score}</span>
        </div>
        <div className="text-right">
          <p className="text-xs uppercase tracking-wide text-slate-500">Signaalwaarde</p>
          <p className="text-lg font-bold text-slate-900">{card.signal}</p>
        </div>
      </div>
      <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-white/70">
        <div
          className={tone.bar}
          style={{ width: `${Number(card.signal.replace(',', '.')) * 10}%`, height: '100%', borderRadius: 9999 }}
        />
      </div>
    </div>
  )
}

function FactorCanvas({ variant }: { variant: ReportPreviewVariant }) {
  const copy = COPY[variant]

  return (
    <div className="space-y-4">
      <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50 px-5 py-4">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
          Uit het managementrapport - Organisatiefactoren
        </p>
        <p className="mt-2 text-sm leading-6 text-slate-700">{copy.factorLead}</p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {copy.factorCards.map((card) => (
          <FactorCard key={card.label} card={card} />
        ))}
      </div>
    </div>
  )
}

function HypothesisCanvas({ variant }: { variant: ReportPreviewVariant }) {
  const copy = COPY[variant]

  return (
    <div className="space-y-4">
      <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50 px-5 py-4">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
          Uit het managementrapport - Duiding en vervolgstappen
        </p>
        <p className="mt-2 text-sm leading-6 text-slate-700">{copy.hypothesisLead}</p>
      </div>
      <div className="grid gap-4 xl:grid-cols-2">
        {copy.hypotheses.map(({ title, body, question }) => (
          <div key={title} className="rounded-[1.5rem] border border-[#DCEFEA] bg-[#F4FAF8] p-5">
            <p className="text-sm font-bold text-slate-950">{title}</p>
            <p className="mt-3 text-sm leading-6 text-slate-700">{body}</p>
            <div className="mt-4 rounded-[1.15rem] border border-white/80 bg-white/90 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-[#3C8D8A]">Te toetsen vraag</p>
              <p className="mt-2 text-sm leading-6 text-slate-800">{question}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function PreviewCanvas({ variant, current }: { variant: ReportPreviewVariant; current: number }) {
  if (current === 0) return <DashboardCanvas variant={variant} />
  if (current === 1) return <FactorCanvas variant={variant} />
  return <HypothesisCanvas variant={variant} />
}

export function PreviewSlider({ variant = 'portfolio' }: PreviewSliderProps) {
  const [current, setCurrent] = useState(0)
  const copy = COPY[variant]

  return (
    <div className="marketing-preview-shell">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#3C8D8A]">{copy.label}</p>
          <p className="mt-2 max-w-2xl text-sm leading-7 text-slate-600">{copy.intro}</p>
        </div>
        <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
          {copy.demoLabel}
        </span>
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        {SLIDES.map((label, index) => (
          <button
            key={label}
            type="button"
            onClick={() => setCurrent(index)}
            className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
              index === current
                ? 'bg-[#234B57] text-white'
                : 'border border-[#E5E0D6] bg-white text-slate-600 hover:border-[#3C8D8A] hover:text-[#234B57]'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1.12fr)_minmax(18rem,0.88fr)]">
        <div className="min-w-0">
          <PreviewCanvas variant={variant} current={current} />
        </div>

        <div className="grid gap-4 self-start">
          <div className="rounded-[1.6rem] border border-slate-200 bg-white p-5">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">Wat deze preview laat zien</p>
            <div className="mt-4 space-y-3">
              {copy.proofNotes.slice(0, 3).map(([title, body]) => (
                <div key={title} className="rounded-[1.15rem] border border-slate-200 bg-slate-50 px-4 py-3">
                  <p className="text-sm font-semibold text-slate-950">{title}</p>
                  <p className="mt-1 text-sm leading-6 text-slate-600">{body}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[1.6rem] border border-[#DCEFEA] bg-[#F4FAF8] p-5">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#3C8D8A]">Belangrijke nuance</p>
            <p className="mt-3 text-sm leading-7 text-slate-700">{copy.nuance}</p>
          </div>

          <div className="overflow-hidden rounded-[1.6rem] border border-slate-200 bg-white">
            <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-4 py-3">
              <div>
                <p className="text-sm font-semibold text-slate-950">{copy.supportVisualTitle}</p>
                <p className="mt-1 text-xs leading-5 text-slate-500">{copy.demoBody}</p>
              </div>
            </div>
            <Image
              src="/segment-deep-dive-preview.png"
              alt={copy.supportVisualAlt}
              width={1600}
              height={960}
              className="max-h-[26rem] w-full object-cover"
            />
          </div>
        </div>
      </div>
    </div>
  )
}

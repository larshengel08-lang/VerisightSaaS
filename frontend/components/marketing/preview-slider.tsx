'use client'

import { useState } from 'react'
import {
  REPORT_PREVIEW_COPY,
  type ReportPreviewFactorCard,
  type ReportPreviewVariant,
} from '@/lib/report-preview-copy'
import { SegmentDeepDiveVisual } from '@/components/marketing/report-visuals'

interface PreviewSliderProps {
  variant?: ReportPreviewVariant
}

const SLIDES = ['Dashboard', 'Samenvatting', 'Wat valt op', 'Volgende stap'] as const
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
    <div className="rounded-[1.08rem] border border-slate-200 bg-slate-950 p-5 text-white">
      <div className="mb-5 flex items-center gap-2">
        <span className="h-3 w-3 rounded-full bg-red-400" />
        <span className="h-3 w-3 rounded-full bg-amber-300" />
        <span className="h-3 w-3 rounded-full bg-emerald-400" />
        <span className="ml-3 rounded-full bg-white/10 px-3 py-1 text-xs text-slate-300">verisight.nl/dashboard</span>
      </div>
      <div className="grid gap-3 sm:grid-cols-4">
        {copy.kpis.map(([label, value, detail]) => (
          <div key={label} className="rounded-[0.95rem] border border-white/10 bg-white/5 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">{label}</p>
            <p className="mt-2 text-lg font-bold text-white">{value}</p>
            <p className="mt-1 text-xs text-slate-400">{detail}</p>
          </div>
        ))}
      </div>
      <div className="mt-5 rounded-[0.95rem] border border-white/10 bg-white/5 p-4">
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
  const signalWidth = card.signalDisplay ? `${Number(card.signalDisplay.replace('/10', '').replace(',', '.')) * 10}%` : '0%'

  return (
    <div className={`rounded-[0.95rem] border p-4 ${tone.surface}`}>
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-semibold text-slate-900">{card.label}</p>
        <span className={`rounded-full border px-2.5 py-0.5 text-xs font-bold ${tone.badge}`}>{card.band}</span>
      </div>
      <div className="mt-3 flex items-end justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-wide text-slate-500">Ervaren score</p>
          <span className="text-3xl font-bold text-slate-950">{card.scoreDisplay}</span>
        </div>
      </div>
      {card.showSignal && card.signalDisplay ? (
        <>
          <div className="mt-3 rounded-[0.8rem] border border-white/70 bg-white/80 px-3 py-2">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Verdieping</p>
            <p className="mt-1 text-sm font-semibold text-slate-900">Signaalsterkte {card.signalDisplay}</p>
          </div>
          <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-white/70">
            <div
              className={tone.bar}
              style={{ width: signalWidth, height: '100%', borderRadius: 9999 }}
            />
          </div>
        </>
      ) : null}
    </div>
  )
}

function FactorCanvas({ variant }: { variant: ReportPreviewVariant }) {
  const copy = COPY[variant]

  return (
    <div className="space-y-4">
      <div className="rounded-[0.95rem] border border-slate-200 bg-slate-50 px-5 py-4">
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

function SummaryCanvas({ variant }: { variant: ReportPreviewVariant }) {
  const copy = COPY[variant]

  return (
    <div className="space-y-4">
      <div className="rounded-[0.95rem] border border-slate-200 bg-slate-50 px-5 py-4">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Samenvatting</p>
        <p className="mt-2 text-sm leading-6 text-slate-700">{copy.boardroomIntro}</p>
      </div>
      <div className="grid gap-4 xl:grid-cols-3">
        {copy.boardroomPoints.map(([title, body]) => (
          <div key={title} className="rounded-[0.95rem] border border-slate-200 bg-white px-5 py-5">
            <p className="text-sm font-semibold text-slate-950">{title}</p>
            <p className="mt-3 text-sm leading-6 text-slate-600">{body}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

function NextStepCanvas({ variant }: { variant: ReportPreviewVariant }) {
  const copy = COPY[variant]

  return (
    <div className="space-y-4">
      <div className="rounded-[0.95rem] border border-[#DCEFEA] bg-[#F4FAF8] px-5 py-4">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#3C8D8A]">Volgende stap</p>
        <p className="mt-2 text-sm leading-6 text-slate-700">{copy.nuance}</p>
      </div>
      <div className="grid gap-4 xl:grid-cols-2">
        {copy.hypotheses.map(({ title, question }) => (
          <div key={title} className="rounded-[0.95rem] border border-slate-200 bg-white px-5 py-5">
            <p className="text-sm font-semibold text-slate-950">{title}</p>
            <p className="mt-3 text-sm leading-6 text-slate-600">{question}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

function PreviewCanvas({ variant, current }: { variant: ReportPreviewVariant; current: number }) {
  if (current === 0) return <DashboardCanvas variant={variant} />
  if (current === 1) return <SummaryCanvas variant={variant} />
  if (current === 2) return <FactorCanvas variant={variant} />
  return <NextStepCanvas variant={variant} />
}

export function PreviewSlider({ variant = 'portfolio' }: PreviewSliderProps) {
  const [current, setCurrent] = useState(0)
  const copy = COPY[variant]
  const compactIntro =
    variant === 'portfolio'
      ? 'Blader door dashboard, samenvatting, aandachtspunten en volgende stap in dezelfde managementlijn.'
      : copy.intro

  return (
    <div className="marketing-preview-shell">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#3C8D8A]">{copy.label}</p>
          <p className="mt-2 max-w-[42rem] text-[0.94rem] leading-6 text-slate-600">{compactIntro}</p>
        </div>
        <span className="rounded-[0.58rem] border border-slate-200 bg-slate-50 px-3 py-1 text-[10.5px] font-semibold uppercase tracking-[0.16em] text-slate-500">
          {copy.demoLabel}
        </span>
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        {SLIDES.map((label, index) => (
          <button
            key={label}
            type="button"
            onClick={() => setCurrent(index)}
            className={`rounded-[0.72rem] px-4 py-2.5 text-sm font-semibold transition-all ${
              index === current
                ? 'border border-[#17343C] bg-[#17343C] text-white shadow-[0_16px_34px_-20px_rgba(23,52,60,0.72)] ring-1 ring-[#17343C]/20'
                : 'border border-[#E5E0D6] bg-white text-slate-600 hover:border-[#3C8D8A] hover:text-[#234B57]'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="mt-6 space-y-6">
        <div className="min-w-0">
          <PreviewCanvas variant={variant} current={current} />
        </div>

        <div className="overflow-hidden rounded-[1.08rem] border border-slate-200 bg-white">
          <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-4 py-3">
            <div>
              <p className="text-sm font-semibold text-slate-950">{copy.supportVisualTitle}</p>
              <p className="mt-1 text-xs leading-5 text-slate-500">{copy.demoBody}</p>
            </div>
          </div>
          <div className="p-0">
            <SegmentDeepDiveVisual />
          </div>
        </div>
      </div>
    </div>
  )
}

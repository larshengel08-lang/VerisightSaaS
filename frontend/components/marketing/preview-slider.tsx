'use client'

import Image from 'next/image'
import { useMemo, useState } from 'react'
import {
  REPORT_PREVIEW_COPY,
  type ReportPreviewFactorCard,
  type ReportPreviewVariant,
} from '@/lib/report-preview-copy'

interface PreviewSliderProps {
  variant?: ReportPreviewVariant
}

const TABS = ['Dashboard', 'Bestuurlijke handoff', 'Prioriteiten', 'Methodiek & begrenzing'] as const
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
    <div className="rounded-[1.7rem] border border-slate-200 bg-slate-950 p-4 text-white shadow-[0_26px_70px_rgba(2,6,23,0.32)] sm:rounded-[2rem] sm:p-5">
      <div className="mb-4 flex items-center gap-2 sm:mb-5">
        <span className="h-2.5 w-2.5 rounded-full bg-red-400 sm:h-3 sm:w-3" />
        <span className="h-2.5 w-2.5 rounded-full bg-amber-300 sm:h-3 sm:w-3" />
        <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 sm:h-3 sm:w-3" />
        <span className="ml-2 rounded-full bg-white/10 px-2.5 py-1 text-[11px] text-slate-300 sm:ml-3 sm:px-3 sm:text-xs">
          verisight.nl/dashboard
        </span>
      </div>
      <div className="grid grid-cols-2 gap-2.5 md:grid-cols-2 xl:grid-cols-4">
        {copy.kpis.map(([label, value, detail]) => (
          <div key={label} className="rounded-[1.15rem] border border-white/10 bg-white/5 p-3 sm:rounded-[1.4rem] sm:p-4">
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400 sm:text-xs">{label}</p>
            <p className="mt-2 text-base font-semibold text-white sm:mt-3 sm:text-lg">{value}</p>
            <p className="mt-1 text-[10px] leading-4 text-slate-400 sm:text-xs sm:leading-5">{detail}</p>
          </div>
        ))}
      </div>
      <div className="mt-4 rounded-[1.25rem] border border-white/10 bg-white/5 p-3.5 sm:mt-5 sm:rounded-[1.5rem] sm:p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400 sm:text-xs">{copy.focusTitle}</p>
          <span className="rounded-full border border-white/10 bg-white/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-200 sm:px-3 sm:text-[11px]">
            Samenvatting
          </span>
        </div>
        <div className="mt-4 space-y-2.5 sm:space-y-3">
          {copy.dashboardRows.map((row) => {
            const tone = toneStyles[row.tone]

            return (
              <div key={row.label} className="grid grid-cols-[minmax(0,5.6rem)_1fr_auto] items-center gap-2.5 sm:grid-cols-[minmax(0,9rem)_1fr_auto] sm:gap-3">
                <span className="text-xs text-slate-200 sm:text-sm">{row.label}</span>
                <div className="h-2 overflow-hidden rounded-full bg-white/10">
                  <div className={tone.bar} style={{ width: row.width, height: '100%', borderRadius: 9999 }} />
                </div>
                <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-300 sm:text-[11px]">{row.band}</span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

function BoardroomCanvas({ variant }: { variant: ReportPreviewVariant }) {
  const copy = COPY[variant]

  return (
    <div className="space-y-4">
      <div className="rounded-[1.55rem] border border-[#DCEFEA] bg-[#F3FAF7] px-5 py-4">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#3C8D8A]">{copy.boardroomTitle}</p>
        <p className="mt-3 text-sm leading-7 text-slate-700">{copy.boardroomIntro}</p>
      </div>
      <div className="grid gap-4 xl:grid-cols-3">
        {copy.boardroomPoints.map(([title, body], index) => (
          <div key={title} className="rounded-[1.55rem] border border-slate-200 bg-white p-5 shadow-[0_16px_34px_rgba(15,23,42,0.06)]">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-semibold text-slate-950">{title}</p>
              <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                Stap {index + 1}
              </span>
            </div>
            <p className="mt-3 text-sm leading-7 text-slate-600">{body}</p>
          </div>
        ))}
      </div>
      <div className="rounded-[1.6rem] border border-slate-200 bg-slate-50 px-5 py-4">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Wat dit laat zien</p>
        <p className="mt-2 text-sm leading-7 text-slate-700">
          Hier wordt zichtbaar hoe dashboard, rapport en gesprek samenkomen in een rustige executive lijn.
        </p>
      </div>
    </div>
  )
}

function FactorCard({ card }: { card: ReportPreviewFactorCard }) {
  const tone = toneStyles[card.tone]
  const signalWidth = card.signalDisplay ? `${Number(card.signalDisplay.replace('/10', '').replace(',', '.')) * 10}%` : '0%'

  return (
    <div className={`rounded-[1.35rem] border p-4 ${tone.surface}`}>
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-semibold text-slate-900">{card.label}</p>
        <span className={`rounded-full border px-2.5 py-0.5 text-xs font-bold ${tone.badge}`}>{card.band}</span>
      </div>
      <div className="mt-3">
        <p className="text-[11px] uppercase tracking-wide text-slate-500">Ervaren score</p>
        <span className="text-3xl font-bold text-slate-950">{card.scoreDisplay}</span>
      </div>
      {card.showSignal && card.signalDisplay ? (
        <>
          <div className="mt-3 rounded-[1rem] border border-white/70 bg-white/80 px-3 py-2">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Verdieping</p>
            <p className="mt-1 text-sm font-semibold text-slate-900">Signaalsterkte {card.signalDisplay}</p>
          </div>
          <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-white/70">
            <div className={tone.bar} style={{ width: signalWidth, height: '100%', borderRadius: 9999 }} />
          </div>
        </>
      ) : null}
    </div>
  )
}

function PrioritiesCanvas({ variant }: { variant: ReportPreviewVariant }) {
  const copy = COPY[variant]

  return (
    <div className="space-y-4">
      <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50 px-5 py-4">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Uit het rapport - prioriteiten</p>
        <p className="mt-2 text-sm leading-7 text-slate-700">{copy.factorLead}</p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {copy.factorCards.map((card) => (
          <FactorCard key={card.label} card={card} />
        ))}
      </div>
    </div>
  )
}

function MethodCanvas({ variant }: { variant: ReportPreviewVariant }) {
  const copy = COPY[variant]

  return (
    <div className="grid gap-4 xl:grid-cols-[minmax(0,1.02fr)_minmax(19rem,0.98fr)]">
      <div className="space-y-4">
        <div className="rounded-[1.55rem] border border-slate-200 bg-white p-5 shadow-[0_16px_34px_rgba(15,23,42,0.05)]">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#3C8D8A]">{copy.trustTitle}</p>
          <p className="mt-3 text-sm leading-7 text-slate-700">{copy.trustIntro}</p>
          <div className="mt-4 space-y-3">
            {copy.trustPoints.map(([title, body]) => (
              <div key={title} className="rounded-[1.1rem] border border-slate-200 bg-slate-50 px-4 py-3">
                <p className="text-sm font-semibold text-slate-950">{title}</p>
                <p className="mt-1 text-sm leading-6 text-slate-600">{body}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-[1.55rem] border border-[#DCEFEA] bg-[#F3FAF7] px-5 py-4">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#3C8D8A]">Leesgrens</p>
          <p className="mt-2 text-sm leading-7 text-slate-700">{copy.nuance}</p>
        </div>
      </div>

      <div className="overflow-hidden rounded-[1.6rem] border border-slate-200 bg-white shadow-[0_18px_40px_rgba(15,23,42,0.06)]">
        <div className="border-b border-slate-200 bg-slate-50 px-4 py-3">
          <p className="text-sm font-semibold text-slate-950">{copy.supportVisualTitle}</p>
          <p className="mt-1 text-xs leading-5 text-slate-500">{copy.demoBody}</p>
        </div>
        <Image
          src="/segment-deep-dive-preview.png"
          alt={copy.supportVisualAlt}
          width={1600}
          height={960}
          className="max-h-[19rem] w-full object-cover sm:max-h-[26rem]"
        />
        <div className="border-t border-slate-200 px-4 py-4">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Methodiek & begrenzing</p>
          <div className="mt-3 space-y-2">
            {copy.proofNotes.slice(0, 3).map(([title, body]) => (
              <div key={title} className="rounded-[1rem] border border-slate-200 bg-slate-50 px-3 py-3">
                <p className="text-sm font-semibold text-slate-950">{title}</p>
                <p className="mt-1 text-sm leading-6 text-slate-600">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function PreviewCanvas({ variant, current }: { variant: ReportPreviewVariant; current: number }) {
  if (current === 0) return <DashboardCanvas variant={variant} />
  if (current === 1) return <BoardroomCanvas variant={variant} />
  if (current === 2) return <PrioritiesCanvas variant={variant} />
  return <MethodCanvas variant={variant} />
}

export function PreviewSlider({ variant = 'portfolio' }: PreviewSliderProps) {
  const [current, setCurrent] = useState(0)
  const copy = COPY[variant]
  const tabExplainers = useMemo(
    () => [
      {
        title: 'Dashboard',
        body: 'Een helder overzicht met kerncijfers, opvallende punten en het eerste beeld van de situatie.',
      },
      {
        title: 'Bestuurlijke handoff',
        body: 'Een korte samenvatting die helpt om de uitkomst snel met elkaar te bespreken.',
      },
      {
        title: 'Prioriteiten',
        body: 'Belangrijkste aandachtspunten die helpen kiezen wat eerst besproken en getoetst moet worden.',
      },
      {
        title: 'Methodiek & begrenzing',
        body: 'De trustlaag die laat zien wat de output ondersteunt en bewust niet pretendeert.',
      },
    ],
    [],
  )

  return (
    <div className="marketing-preview-shell">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="max-w-3xl">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#3C8D8A]">{copy.label}</p>
          <p className="mt-3 text-sm leading-7 text-slate-600">{copy.intro}</p>
        </div>
        <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
          {copy.demoLabel}
        </span>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
        {TABS.map((label, index) => (
          <button
            key={label}
            type="button"
            onClick={() => setCurrent(index)}
            className={`inline-flex w-full items-center justify-center rounded-[1rem] px-3 py-2.5 text-[13px] font-semibold transition-all sm:w-auto sm:rounded-full sm:px-4 sm:py-2 sm:text-sm ${
              index === current
                ? 'border border-[#183142] bg-[#183142] text-white shadow-[0_14px_30px_rgba(24,49,66,0.28)]'
                : 'border border-[#D9E0DE] bg-[#FCFCFB] text-slate-700 hover:-translate-y-0.5 hover:border-[#3C8D8A] hover:text-[#234B57]'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="mt-5 rounded-[1.35rem] border border-[#DCEFEA] bg-[#F3FAF7] px-4 py-4 sm:rounded-[1.5rem] sm:px-5">
        <div className="flex flex-wrap items-start justify-between gap-3 sm:items-center">
          <p className="text-sm font-semibold text-slate-950">{tabExplainers[current]?.title}</p>
          <span className="rounded-full border border-white/70 bg-white/80 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#3C8D8A]">
            Voorbeeldoutput
          </span>
        </div>
        <p className="mt-2 text-sm leading-7 text-slate-700">{tabExplainers[current]?.body}</p>
      </div>

      <div className="mt-6">
        <PreviewCanvas variant={variant} current={current} />
      </div>
    </div>
  )
}

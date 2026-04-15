import Link from 'next/link'
import { REPORT_PREVIEW_COPY, type ReportPreviewVariant } from '@/lib/report-preview-copy'

interface PreviewEvidenceRailProps {
  variant?: ReportPreviewVariant
  className?: string
  tone?: 'light' | 'dark'
}

const toneMap = {
  light: {
    card: 'border-slate-200 bg-white',
    title: 'text-slate-950',
    body: 'text-slate-600',
    accent: 'text-blue-700',
    subcard: 'border-slate-200 bg-slate-50',
    link:
      'border-slate-300 bg-slate-50 text-slate-700 hover:border-slate-400 hover:bg-white hover:text-slate-950',
  },
  dark: {
    card: 'border-white/10 bg-white/5',
    title: 'text-white',
    body: 'text-slate-300',
    accent: 'text-blue-300',
    subcard: 'border-white/10 bg-white/10',
    link: 'border-white/15 bg-white text-slate-900 hover:bg-slate-100 hover:text-slate-950',
  },
} as const

export function PreviewEvidenceRail({
  variant = 'portfolio',
  className = '',
  tone = 'light',
}: PreviewEvidenceRailProps) {
  const copy = REPORT_PREVIEW_COPY[variant]
  const palette = toneMap[tone]

  return (
    <div className={`grid gap-4 xl:grid-cols-3 ${className}`.trim()}>
      <div className={`min-w-0 rounded-[1.6rem] border p-5 ${palette.card}`}>
        <p className={`text-xs font-bold uppercase tracking-[0.18em] ${palette.accent}`}>{copy.boardroomTitle}</p>
        <p className={`mt-3 text-sm leading-7 ${palette.body}`}>{copy.boardroomIntro}</p>
        <div className="mt-4 space-y-3">
          {copy.boardroomPoints.map(([title, body]) => (
            <div key={title} className={`rounded-[1.15rem] border px-4 py-3 ${palette.subcard}`}>
              <p className={`text-sm font-semibold ${palette.title}`}>{title}</p>
              <p className={`mt-1 text-sm leading-6 ${palette.body}`}>{body}</p>
            </div>
          ))}
        </div>
      </div>

      <div className={`min-w-0 rounded-[1.6rem] border p-5 ${palette.card}`}>
        <p className={`text-xs font-bold uppercase tracking-[0.18em] ${palette.accent}`}>Rapportexcerpt</p>
        <div className="mt-4 space-y-3">
          {copy.proofNotes.map(([title, body]) => (
            <div key={title} className={`rounded-[1.15rem] border px-4 py-3 ${palette.subcard}`}>
              <p className={`text-sm font-semibold ${palette.title}`}>{title}</p>
              <p className={`mt-1 text-sm leading-6 ${palette.body}`}>{body}</p>
            </div>
          ))}
        </div>
      </div>

      <div className={`min-w-0 rounded-[1.6rem] border p-5 ${palette.card}`}>
        <p className={`text-xs font-bold uppercase tracking-[0.18em] ${palette.accent}`}>{copy.trustTitle}</p>
        <p className={`mt-3 text-sm leading-7 ${palette.body}`}>{copy.trustIntro}</p>
        <div className="mt-4 space-y-3">
          {copy.trustPoints.map(([title, body]) => (
            <div key={title} className={`rounded-[1.15rem] border px-4 py-3 ${palette.subcard}`}>
              <p className={`text-sm font-semibold ${palette.title}`}>{title}</p>
              <p className={`mt-1 text-sm leading-6 ${palette.body}`}>{body}</p>
            </div>
          ))}
        </div>
        {copy.sampleReportHref && copy.sampleReportLabel ? (
          <div className="mt-5">
            <Link
              href={copy.sampleReportHref}
              className={`inline-flex rounded-full border px-4 py-2.5 text-sm font-semibold transition-colors ${palette.link}`}
            >
              {copy.sampleReportLabel}
            </Link>
          </div>
        ) : null}
      </div>
    </div>
  )
}

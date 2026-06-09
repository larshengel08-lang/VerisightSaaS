import type { SampleShowcaseAsset } from '@/lib/sample-showcase-assets'
import { getEvidenceTierLabel } from '@/lib/case-proof-evidence'

interface SampleShowcaseCardProps {
  eyebrow: string
  title: string
  body: string
  asset: SampleShowcaseAsset
  linkLabel?: string
  tone?: 'light' | 'dark'
}

const toneClasses = {
  light: {
    card: 'border-slate-200 bg-white',
    eyebrow: 'text-[#C96A4B]',
    title: 'text-slate-950',
    body: 'text-slate-600',
    note: 'border-slate-200 bg-slate-50 text-slate-700',
    button:
      'border-[#E5E0D6] bg-[#F7F5F1] text-[#4A5563] hover:border-[#C96A4B] hover:bg-white hover:text-[#132033]',
  },
  dark: {
    card: 'border-white/10 bg-white/5',
    eyebrow: 'text-[#DCEFEA]',
    title: 'text-white',
    body: 'text-slate-300',
    note: 'border-white/10 bg-white/10 text-slate-200',
    button:
      'border-white/15 bg-white text-slate-900 hover:border-white/30 hover:bg-slate-100 hover:text-slate-950',
  },
} as const

export function SampleShowcaseCard({
  eyebrow,
  title,
  body,
  asset,
  linkLabel = 'Open voorbeeldrapport',
  tone = 'light',
}: SampleShowcaseCardProps) {
  const palette = toneClasses[tone]

  return (
    <div className={`min-w-0 rounded-[1.75rem] border p-6 shadow-sm ${palette.card}`}>
      <p className={`text-xs font-bold uppercase tracking-[0.22em] ${palette.eyebrow}`}>{eyebrow}</p>
      <h3 className={`mt-4 text-2xl font-semibold ${palette.title}`}>{title}</h3>
      <p className={`mt-4 text-sm leading-7 ${palette.body}`}>{body}</p>
      <div className={`mt-5 rounded-2xl border px-4 py-4 text-sm leading-7 ${palette.note}`}>
        <p className="font-semibold">{asset.label}</p>
        <p className="mt-2 text-xs font-semibold uppercase tracking-[0.16em] opacity-75">
          {getEvidenceTierLabel(asset.evidenceTier)} - {asset.buyerUse}
        </p>
        <p className="mt-2">{asset.claimBoundary}</p>
        <p className="mt-2 text-xs leading-6 opacity-80">{asset.trustFrame}</p>
      </div>
      {asset.publicHref ? (
        <div className="mt-5">
          <a
            href={asset.publicHref}
            target="_blank"
            rel="noreferrer"
            className={`inline-flex rounded-full border px-5 py-2.5 text-sm font-semibold transition-colors ${palette.button}`}
          >
            {linkLabel}
          </a>
        </div>
      ) : null}
    </div>
  )
}

import Link from 'next/link'

interface MarketingCalloutBandProps {
  eyebrow: string
  title: string
  body: string
  primaryHref: string
  primaryLabel: string
  secondaryHref?: string
  secondaryLabel?: string
  className?: string
}

export function MarketingCalloutBand({
  eyebrow,
  title,
  body,
  primaryHref,
  primaryLabel,
  secondaryHref,
  secondaryLabel,
  className = '',
}: MarketingCalloutBandProps) {
  return (
    <div className={`marketing-panel-soft p-8 md:p-10 ${className}`.trim()}>
      <p className="text-xs font-bold uppercase tracking-[0.22em] text-blue-700">{eyebrow}</p>
      <h2 className="mt-4 text-3xl font-semibold text-slate-950">{title}</h2>
      <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-700">{body}</p>
      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <Link
          href={primaryHref}
          className="inline-flex rounded-full bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-[0_16px_40px_rgba(37,99,235,0.18)] transition-all hover:-translate-y-0.5 hover:bg-blue-700"
        >
          {primaryLabel}
        </Link>
        {secondaryHref && secondaryLabel ? (
          <Link
            href={secondaryHref}
            className="inline-flex rounded-full border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition-colors hover:border-slate-400 hover:text-slate-950"
          >
            {secondaryLabel}
          </Link>
        ) : null}
      </div>
    </div>
  )
}

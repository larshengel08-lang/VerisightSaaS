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
    <div
      className={`marketing-panel-soft overflow-hidden rounded-[2rem] border border-[var(--border)] bg-[linear-gradient(135deg,rgba(220,239,234,0.38),rgba(247,245,241,0.96)_34%,#ffffff_100%)] p-7 md:p-9 ${className}`.trim()}
    >
      <p className="text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-[var(--teal)]">{eyebrow}</p>
      <h2 className="mt-4 max-w-[24ch] text-[clamp(1.9rem,3vw,2.9rem)] font-light leading-[1.06] tracking-[-0.03em] text-[var(--ink)]">
        {title}
      </h2>
      <p className="mt-5 max-w-3xl text-[1rem] leading-8 text-[var(--text)]">{body}</p>
      <div className="marketing-hero-cta-row mt-6">
        <Link
          href={primaryHref}
          className="inline-flex items-center justify-center rounded-full bg-[var(--teal)] px-5 py-3 text-sm font-semibold text-white shadow-[0_16px_40px_rgba(60,141,138,0.18)] transition-all hover:-translate-y-0.5 hover:bg-[#2d6e6b]"
        >
          {primaryLabel}
        </Link>
        {secondaryHref && secondaryLabel ? (
          <Link
            href={secondaryHref}
            className="inline-flex items-center justify-center rounded-full border border-[var(--border)] bg-[var(--surface)] px-5 py-3 text-sm font-semibold text-[var(--text)] transition-colors hover:border-[var(--teal)] hover:text-[var(--ink)]"
          >
            {secondaryLabel}
          </Link>
        ) : null}
      </div>
    </div>
  )
}

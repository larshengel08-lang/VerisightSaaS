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
      className={`marketing-panel-soft overflow-hidden rounded-[1.08rem] border border-[var(--border)] bg-[rgba(255,252,247,0.96)] p-7 md:p-9 ${className}`.trim()}
    >
      <p className="text-[0.84rem] font-medium uppercase tracking-[0.18em] text-[var(--petrol)]">{eyebrow}</p>
      <h2 className="mt-3 max-w-none text-[clamp(2rem,3vw,3rem)] font-light leading-[1.03] tracking-[-0.04em] text-[var(--ink)]">
        {title}
      </h2>
      <p className="mt-4 max-w-[52rem] text-[1rem] leading-8 text-[var(--text)]">{body}</p>
      <div className="marketing-hero-cta-row mt-7">
        <Link href={primaryHref} className="marketing-button-primary">
          {primaryLabel}
        </Link>
        {secondaryHref && secondaryLabel ? (
          <Link href={secondaryHref} className="marketing-button-secondary">
            {secondaryLabel}
          </Link>
        ) : null}
      </div>
    </div>
  )
}

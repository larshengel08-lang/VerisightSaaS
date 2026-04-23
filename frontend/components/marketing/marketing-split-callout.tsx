import Link from 'next/link'

interface MarketingSplitCalloutProps {
  title: string
  body: string
  primaryHref: string
  primaryLabel: string
  secondaryHref: string
  secondaryLabel: string
}

export function MarketingSplitCallout({
  title,
  body,
  primaryHref,
  primaryLabel,
  secondaryHref,
  secondaryLabel,
}: MarketingSplitCalloutProps) {
  return (
    <div className="overflow-hidden rounded-[1.35rem] border border-[rgba(221,215,203,0.8)] bg-[rgba(255,252,247,0.96)] px-7 py-8 shadow-[0_20px_48px_rgba(19,32,51,0.06)] md:px-9 md:py-10">
      <div className="flex flex-col gap-8">
        <div className="min-w-0">
          <h2 className="max-w-none text-[clamp(2rem,4vw,3.4rem)] font-light leading-[1.03] tracking-[-0.045em] text-[#132033]">
            {title}
          </h2>
          <p className="mt-5 w-full max-w-none text-[1rem] leading-8 text-[#4A5563]">{body}</p>
        </div>

        <div className="flex flex-col items-start gap-4 sm:flex-row sm:flex-wrap sm:items-center">
          <Link href={primaryHref} className="marketing-button-primary min-w-[15rem] justify-center">
            {primaryLabel}
          </Link>
          <Link href={secondaryHref} className="inline-flex items-center text-[1rem] font-semibold text-[#3C8D8A] transition-colors hover:text-[#2d6e6b]">
            {secondaryLabel}
          </Link>
        </div>
      </div>
    </div>
  )
}

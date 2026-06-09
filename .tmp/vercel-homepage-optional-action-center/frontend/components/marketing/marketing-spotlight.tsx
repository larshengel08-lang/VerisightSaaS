import type { ReactNode } from 'react'

interface MarketingSpotlightProps {
  eyebrow: string
  title: string
  body: string
  aside: ReactNode
  className?: string
}

export function MarketingSpotlight({
  eyebrow,
  title,
  body,
  aside,
  className = '',
}: MarketingSpotlightProps) {
  return (
    <div className={`grid gap-6 lg:grid-cols-[0.92fr_1.08fr] ${className}`.trim()}>
      <div className="marketing-panel-soft p-7 md:p-8">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">{eyebrow}</p>
        <h2 className="mt-4 max-w-xl text-3xl font-semibold text-slate-950">{title}</h2>
        <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-600">{body}</p>
      </div>
      <div>{aside}</div>
    </div>
  )
}

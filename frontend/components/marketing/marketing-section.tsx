import type { ReactNode } from 'react'

type MarketingSectionTone = 'plain' | 'surface' | 'tint' | 'dark'

interface MarketingSectionProps {
  children: ReactNode
  tone?: MarketingSectionTone
  className?: string
  containerClassName?: string
}

const toneClassMap: Record<MarketingSectionTone, string> = {
  plain: 'bg-[#FFFCF8]',
  surface: 'marketing-section-surface',
  tint: 'marketing-section-tint',
  dark: 'marketing-section-dark',
}

export function MarketingSection({
  children,
  tone = 'plain',
  className = '',
  containerClassName = '',
}: MarketingSectionProps) {
  return (
    <section className={`marketing-section ${toneClassMap[tone]} ${className}`.trim()}>
      <div className={`marketing-shell ${containerClassName}`.trim()}>{children}</div>
    </section>
  )
}

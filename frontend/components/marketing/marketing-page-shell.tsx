import type { ReactNode } from 'react'
import { PublicFooter } from '@/components/marketing/public-footer'
import { PublicHeader } from '@/components/marketing/public-header'

type MarketingPageTheme = 'neutral' | 'exit' | 'retention' | 'combination' | 'support'
type MarketingPageType = 'home' | 'overview' | 'product' | 'pricing' | 'approach' | 'support'

interface MarketingPageShellProps {
  children: ReactNode
  heroIntro: ReactNode
  heroStage?: ReactNode
  heroSupport?: ReactNode
  theme?: MarketingPageTheme
  pageType?: MarketingPageType
  ctaHref?: string
  ctaLabel?: string
}

const themeMap: Record<MarketingPageTheme, string> = {
  neutral: 'bg-[#F7F5F1]',
  exit: 'bg-[#F7F5F1]',
  retention: 'bg-[#F7F5F1]',
  combination: 'bg-[#F7F5F1]',
  support: 'bg-[#F7F5F1]',
}

export function MarketingPageShell({
  children,
  heroIntro,
  heroStage,
  heroSupport,
  theme = 'neutral',
  pageType = 'support',
  ctaHref,
  ctaLabel,
}: MarketingPageShellProps) {
  const showStage = Boolean(heroStage)
  const showSupport = Boolean(heroSupport)

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--ink)]">
      <PublicHeader ctaHref={ctaHref} ctaLabel={ctaLabel} />
      <main>
        <section
          className={`marketing-hero-shell marketing-hero-shell-${pageType} overflow-hidden border-b border-[var(--border)] ${themeMap[theme]}`}
        >
          <div className={`marketing-shell marketing-hero-grid marketing-hero-grid-${pageType}`}>
            <div className="marketing-hero-region-intro">{heroIntro}</div>
            {showStage ? <div className="marketing-hero-region-stage">{heroStage}</div> : null}
            {showSupport ? <div className="marketing-hero-region-support">{heroSupport}</div> : null}
          </div>
        </section>

        {children}
      </main>
      <PublicFooter />
    </div>
  )
}

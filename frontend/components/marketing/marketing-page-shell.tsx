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
  neutral:
    'bg-[linear-gradient(180deg,#f5f2ea_0%,#f7f5f1_42%,#fffcf7_100%)]',
  exit:
    'bg-[linear-gradient(180deg,#f5f2ea_0%,#f4f7f5_44%,#fffcf7_100%)]',
  retention:
    'bg-[linear-gradient(180deg,#f5f2ea_0%,#f1f7f4_44%,#fffcf7_100%)]',
  combination:
    'bg-[linear-gradient(180deg,#f5f2ea_0%,#f4f6f4_44%,#fffcf7_100%)]',
  support:
    'bg-[linear-gradient(180deg,#f5f2ea_0%,#f7f5f1_44%,#fffcf7_100%)]',
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
    <div className="min-h-screen bg-[var(--surface)] text-[var(--ink)]">
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

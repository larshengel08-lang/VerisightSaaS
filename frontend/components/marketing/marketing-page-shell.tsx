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
    'bg-[radial-gradient(circle_at_top_left,rgba(220,239,234,0.85)_0%,transparent_24%),radial-gradient(circle_at_bottom_right,rgba(27,46,69,0.08)_0%,transparent_28%),linear-gradient(180deg,#f7f5f1_0%,#f7f5f1_38%,#ffffff_100%)]',
  exit:
    'bg-[radial-gradient(circle_at_top_left,rgba(60,141,138,0.14)_0%,transparent_24%),radial-gradient(circle_at_bottom_right,rgba(27,46,69,0.08)_0%,transparent_26%),linear-gradient(180deg,#f7f5f1_0%,#f4f7f6_42%,#ffffff_100%)]',
  retention:
    'bg-[radial-gradient(circle_at_top_left,rgba(220,239,234,0.95)_0%,transparent_24%),radial-gradient(circle_at_bottom_right,rgba(35,75,87,0.08)_0%,transparent_26%),linear-gradient(180deg,#f7f5f1_0%,#f2f8f6_42%,#ffffff_100%)]',
  combination:
    'bg-[radial-gradient(circle_at_top_left,rgba(220,239,234,0.9)_0%,transparent_24%),radial-gradient(circle_at_bottom_right,rgba(27,46,69,0.08)_0%,transparent_26%),linear-gradient(180deg,#f7f5f1_0%,#f4f7f6_42%,#ffffff_100%)]',
  support:
    'bg-[radial-gradient(circle_at_top_left,rgba(220,239,234,0.45)_0%,transparent_24%),radial-gradient(circle_at_bottom_right,rgba(27,46,69,0.05)_0%,transparent_26%),linear-gradient(180deg,#f7f5f1_0%,#f6f5f2_44%,#ffffff_100%)]',
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

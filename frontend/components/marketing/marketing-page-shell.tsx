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
    'bg-[radial-gradient(circle_at_top_left,#dbeafe_0%,transparent_22%),radial-gradient(circle_at_bottom_right,#dcfce7_0%,transparent_24%),linear-gradient(180deg,#f9fbff_0%,#eef5ff_38%,#ffffff_100%)]',
  exit:
    'bg-[radial-gradient(circle_at_top_left,#dbeafe_0%,transparent_22%),radial-gradient(circle_at_bottom_right,#e2e8f0_0%,transparent_26%),linear-gradient(180deg,#f8fbff_0%,#eff6ff_42%,#ffffff_100%)]',
  retention:
    'bg-[radial-gradient(circle_at_top_left,#d1fae5_0%,transparent_22%),radial-gradient(circle_at_bottom_right,#dbeafe_0%,transparent_24%),linear-gradient(180deg,#f6fefb_0%,#ecfdf5_42%,#ffffff_100%)]',
  combination:
    'bg-[radial-gradient(circle_at_top_left,#dbeafe_0%,transparent_22%),radial-gradient(circle_at_bottom_right,#dcfce7_0%,transparent_24%),linear-gradient(180deg,#f8fbff_0%,#f0fdf4_42%,#ffffff_100%)]',
  support:
    'bg-[radial-gradient(circle_at_top_left,#e2e8f0_0%,transparent_24%),linear-gradient(180deg,#f8fafc_0%,#f1f5f9_44%,#ffffff_100%)]',
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
    <div className="min-h-screen bg-white text-slate-900">
      <PublicHeader ctaHref={ctaHref} ctaLabel={ctaLabel} />
      <main>
        <section
          className={`marketing-hero-shell marketing-hero-shell-${pageType} overflow-hidden border-b border-slate-200 ${themeMap[theme]}`}
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

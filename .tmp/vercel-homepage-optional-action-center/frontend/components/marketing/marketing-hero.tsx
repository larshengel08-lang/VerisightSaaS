import type { ReactNode } from 'react'

interface MarketingHeroRegionProps {
  children: ReactNode
  className?: string
}

interface MarketingHeroStageProps extends MarketingHeroRegionProps {
  surface?: 'dark' | 'light'
  surfaceClassName?: string
}

export function MarketingHeroIntro({ children, className = '' }: MarketingHeroRegionProps) {
  return <div className={`marketing-hero-intro ${className}`.trim()}>{children}</div>
}

export function MarketingHeroStage({
  children,
  className = '',
  surface = 'dark',
  surfaceClassName = '',
}: MarketingHeroStageProps) {
  const surfaceClass = surface === 'dark' ? 'marketing-stage' : 'marketing-panel-soft'

  return (
    <div className={`marketing-hero-stage-block ${className}`.trim()}>
      <div className={`${surfaceClass} marketing-hero-stage-surface ${surfaceClassName}`.trim()}>{children}</div>
    </div>
  )
}

export function MarketingHeroSupport({ children, className = '' }: MarketingHeroRegionProps) {
  return <div className={`marketing-hero-support-block ${className}`.trim()}>{children}</div>
}

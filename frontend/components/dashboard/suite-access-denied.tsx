import Link from 'next/link'
import { DashboardChip, DashboardHero } from '@/components/dashboard/dashboard-primitives'

export function SuiteAccessDenied({
  title,
  description,
  ctaHref = '/action-center',
  ctaLabel = 'Open Action Center',
}: {
  title: string
  description: string
  ctaHref?: string
  ctaLabel?: string
}) {
  return (
    <DashboardHero
      eyebrow="Beperkte toegang"
      title={title}
      description={description}
      tone="slate"
      meta={
        <>
          <DashboardChip label="Alleen Action Center" tone="amber" />
          <DashboardChip label="Rapporten en inzichten gesloten" tone="slate" />
        </>
      }
      actions={
        <Link
          href={ctaHref}
          className="inline-flex rounded-full border border-[color:var(--dashboard-ink)] bg-[color:var(--dashboard-ink)] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#1B2E45]"
        >
          {ctaLabel}
        </Link>
      }
      aside={
        <div className="space-y-3">
          <p className="text-sm font-semibold text-[color:var(--dashboard-ink)]">Waarom je dit ziet</p>
          <p className="text-sm leading-6 text-[color:var(--dashboard-text)]">
            Managers gebruiken dezelfde login, maar werken alleen in Action Center. Rapporten,
            campagnedetails en survey-inzichten blijven daarom gesloten.
          </p>
        </div>
      }
    />
  )
}

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
      eyebrow="Toegang begrensd"
      title={title}
      description={description}
      tone="slate"
      meta={
        <>
          <DashboardChip label="Manager-only scope" tone="amber" />
          <DashboardChip label="Insights bewust gesloten" tone="slate" />
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
            Managers gebruiken dezelfde suite-login, maar alleen binnen de follow-through laag. Survey-inzichten,
            campaigndetail en rapportage blijven bewust gesloten voor manager-only toegang.
          </p>
        </div>
      }
    />
  )
}

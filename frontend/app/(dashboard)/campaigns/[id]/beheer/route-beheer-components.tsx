import Link from 'next/link'
import { DashboardChip, DashboardSection } from '@/components/dashboard/dashboard-primitives'
import { formatLatestActivityLabel, type HrRouteBeheerPhaseKey, type RouteBeheerPageData } from './beheer-data'
import {
  RouteBeheerLogbookSummary,
  RouteBeheerNowDoingRow,
  RouteBeheerOutputSummary,
  RouteBeheerPhaseWorkspace,
} from './route-beheer-phase-sections'

function sectionButtonClass() {
  return 'inline-flex items-center justify-center rounded-full border border-[color:var(--border)] bg-white px-4 py-2 text-sm font-semibold text-[color:var(--text)] transition hover:border-[color:var(--teal)] hover:text-[color:var(--ink)]'
}

export function RouteBeheerHeader({ data }: { data: RouteBeheerPageData }) {
  return (
    <section
      id="route-meta"
      className="rounded-lg border border-[color:var(--border)] bg-white p-5 shadow-[0_1px_4px_rgba(10,25,47,0.04)] sm:p-6"
    >
      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[color:var(--muted)]">
            Routebeheer
          </p>
          <h1 className="mt-2 text-[1.8rem] font-bold tracking-tight text-[color:var(--ink)] sm:text-[2.05rem]">
            {data.campaignName}
          </h1>
          <div className="mt-4 flex flex-wrap items-center gap-2.5 text-sm text-[color:var(--text)]">
            <span>{data.organizationName ?? 'Niet beschikbaar'}</span>
            <span aria-hidden="true">&middot;</span>
            <span>
              {data.scanTypeLabel}
              {data.deliveryModeLabel ? ` ${data.deliveryModeLabel}` : ''}
            </span>
            <span aria-hidden="true">&middot;</span>
            <span>{data.routePeriodLabel}</span>
          </div>
        </div>

        <div className="flex flex-col items-start gap-3 lg:items-end">
          <DashboardChip label={data.statusBadgeLabel} tone={data.statusBadgeTone} surface="ops" />
          <p className="text-sm text-[color:var(--text)]">{formatLatestActivityLabel(data.lastActivityAt)}</p>
          <div className="flex flex-wrap gap-2">
            <Link href={`/campaigns/${data.campaignId}`} className={sectionButtonClass()}>
              Open dashboard
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}

export function RouteBeheerStructuredBody(args: {
  data: RouteBeheerPageData
  initialSelectedPhaseKey: HrRouteBeheerPhaseKey | null
}) {
  const { data, initialSelectedPhaseKey } = args

  return (
    <div className="space-y-5">
      <RouteBeheerNowDoingRow nowDoing={data.nowDoing} />

      <DashboardSection
        id="route-fasen"
        title="Routefasen"
        description="Bekijk per fase wat klaar is en wat nog aandacht vraagt."
        eyebrow="Fasen"
        surface="ops"
        tone="slate"
      >
        <RouteBeheerPhaseWorkspace
          data={data}
          initialSelectedPhaseKey={initialSelectedPhaseKey}
        />
      </DashboardSection>

      <RouteBeheerOutputSummary summary={data.outputSummary} />

      <RouteBeheerLogbookSummary
        href={`/campaigns/${data.campaignId}#operatie`}
        latestAuditSummary={data.latestAuditSummary}
      />
    </div>
  )
}

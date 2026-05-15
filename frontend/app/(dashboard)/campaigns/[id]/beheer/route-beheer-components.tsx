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
  return 'inline-flex items-center justify-center rounded-full border border-slate-950 bg-slate-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800'
}

export function RouteBeheerHeader({ data }: { data: RouteBeheerPageData }) {
  return (
    <section
      id="route-meta"
      className="border border-slate-200 bg-white px-5 py-5 sm:px-7 sm:py-6"
    >
      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <div className="flex items-center gap-3">
            <span className="h-px w-10 bg-[#C36A29]" />
            <p className="text-[0.72rem] font-semibold uppercase tracking-[0.28em] text-slate-500">
              Routebeheer
            </p>
          </div>
          <p className="mt-4 text-xs font-semibold uppercase tracking-[0.22em] text-[color:var(--muted)]">
            {data.scanTypeLabel}
          </p>
          <h1 className="mt-2 text-[2rem] font-bold tracking-[-0.05em] text-[color:var(--ink)] sm:text-[2.5rem]">
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
          <p className="text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-slate-400">
            Laatste activiteit
          </p>
          <p className="-mt-2 text-sm text-[color:var(--text)]">{formatLatestActivityLabel(data.lastActivityAt)}</p>
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
        description="Kies een fase voor details en uitvoering."
        eyebrow="Fasen"
        surface="ops"
        tone="slate"
      >
        <RouteBeheerPhaseWorkspace
          data={data}
          initialSelectedPhaseKey={initialSelectedPhaseKey}
        />
      </DashboardSection>

      <RouteBeheerOutputSummary data={data} />

      <RouteBeheerLogbookSummary
        href={`/campaigns/${data.campaignId}/beheer?fase=afronding#status-en-logboek`}
        latestAuditSummary={data.latestAuditSummary}
      />
    </div>
  )
}

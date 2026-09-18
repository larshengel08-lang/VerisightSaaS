import type { ReactNode } from 'react'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { PdfDownloadButton } from '@/app/(dashboard)/campaigns/[id]/pdf-download-button'
import { SuiteAccessDenied } from '@/components/dashboard/suite-access-denied'
import { loadCampaignStatusContext } from '@/lib/dashboard/campaign-status-context'
import { buildReportOverviewRows } from '@/lib/dashboard/report-library'
import { createClient } from '@/lib/supabase/server'
import { loadSuiteAccessContext } from '@/lib/suite-access-server'
import type { CampaignStats } from '@/lib/types'
import { buildReportDownloadIndex, type ReportDownloadRow } from './report-download-index'

// Tailwind scheidt tracks in een arbitrary value met een underscore. Met
// komma's (de oude vorm) was de CSS ongeldig en stapelden de kolomkoppen.
const ROW_GRID = 'lg:grid-cols-[minmax(0,1.45fr)_150px_190px_auto]'

function todayIso(): string {
  return new Date().toISOString().slice(0, 10)
}

function ReportRow({ row, children }: { row: ReportDownloadRow; children: ReactNode }) {
  return (
    <article
      className={`grid gap-4 border-b border-slate-200 px-5 py-5 last:border-b-0 lg:items-center ${ROW_GRID}`}
    >
      <div className="min-w-0">
        <p className="text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-[color:var(--dashboard-muted)]">
          {row.scanName}
        </p>
        <Link
          href={`/campaigns/${row.campaignId}`}
          className="mt-2 block text-[1.02rem] font-semibold tracking-[-0.03em] text-[color:var(--dashboard-ink)] underline-offset-4 hover:underline"
        >
          {row.campaignName}
        </Link>
        {row.extraDisambiguator ? (
          <p className="mt-2 text-xs text-[color:var(--dashboard-muted)]">{row.extraDisambiguator}</p>
        ) : null}
      </div>
      <p className="text-sm text-[color:var(--dashboard-text)]">{row.periodLabel}</p>
      <p className="text-sm text-[color:var(--dashboard-text)]">{row.responseBasis}</p>
      <div className="flex justify-start lg:justify-end">{children}</div>
    </article>
  )
}

export default async function ReportsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { context } = await loadSuiteAccessContext(supabase, user.id)

  if (!context.canViewReports) {
    return (
      <SuiteAccessDenied
        title="Je ziet hier geen rapporten"
        description="Jouw login opent alleen Action Center. Campagnedetails en rapporten blijven zichtbaar voor HR en Loep."
      />
    )
  }

  const { data: stats, error } = await supabase
    .from('campaign_stats')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) throw new Error(`Kon het rapportenoverzicht niet laden: ${error.message}`)

  const campaigns = (stats ?? []) as CampaignStats[]
  const statusContext = await loadCampaignStatusContext(
    supabase,
    campaigns.map((campaign) => campaign.campaign_id),
    todayIso(),
  )
  const reportIndex = buildReportDownloadIndex(buildReportOverviewRows(campaigns, statusContext))

  return (
    <div className="space-y-8">
      <section className="space-y-3 border-b border-slate-200/80 pb-6">
        <div className="flex items-center gap-3">
          <span className="h-px w-10 bg-[#C36A29]" />
          <p className="text-[0.72rem] font-semibold uppercase tracking-[0.28em] text-[color:var(--dashboard-muted)]">
            Rapporten
          </p>
        </div>
        <h1 className="text-[2.4rem] font-semibold leading-none tracking-[-0.06em] text-[color:var(--dashboard-ink)] md:text-[3rem]">
          Je rapporten
        </h1>
        <p className="max-w-3xl text-sm leading-6 text-[color:var(--dashboard-text)]">
          Elke afgeronde meting staat hier als PDF. Het antwoord staat op pagina twee; de
          gespreksagenda achterin is de leidraad voor het gesprek met je managementteam. Lopende
          metingen zie je met hun status; klik op de naam om naar de meting te gaan.
        </p>
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-lg font-semibold tracking-[-0.02em] text-[color:var(--dashboard-ink)]">
            Beschikbaar nu
          </h2>
          <p className="text-[0.72rem] font-semibold uppercase tracking-[0.2em] text-[color:var(--dashboard-muted)]">
            {reportIndex.availableRows.length}{' '}
            {reportIndex.availableRows.length === 1 ? 'rapport' : 'rapporten'}
          </p>
        </div>

        {reportIndex.availableRows.length > 0 ? (
          <div className="overflow-hidden border border-slate-200 bg-white">
            <div
              className={`hidden border-b border-slate-200 bg-[color:var(--dashboard-soft)]/45 px-5 py-3 text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-[color:var(--dashboard-muted)] lg:grid lg:items-center ${ROW_GRID}`}
            >
              <span>Scan</span>
              <span>Periode</span>
              <span>Respons</span>
              <span className="text-right">Download PDF</span>
            </div>
            {reportIndex.availableRows.map((row) => (
              <ReportRow key={row.campaignId} row={row}>
                <PdfDownloadButton
                  campaignId={row.campaignId}
                  campaignName={row.campaignName}
                  scanType={row.scanType}
                  label="Download PDF"
                  align="end"
                />
              </ReportRow>
            ))}
          </div>
        ) : (
          <div className="border border-dashed border-slate-200 bg-white/80 px-5 py-8 text-sm leading-7 text-[color:var(--dashboard-text)]">
            Nog geen rapport beschikbaar. Zodra je een meting sluit met voldoende ingevulde
            vragenlijsten, staat de PDF hier klaar.
          </div>
        )}
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-lg font-semibold tracking-[-0.02em] text-[color:var(--dashboard-ink)]">
            Nog niet beschikbaar
          </h2>
          <p className="text-[0.72rem] font-semibold uppercase tracking-[0.2em] text-[color:var(--dashboard-muted)]">
            {reportIndex.unavailableRows.length}{' '}
            {reportIndex.unavailableRows.length === 1 ? 'meting' : 'metingen'}
          </p>
        </div>
        <div className="overflow-hidden border border-slate-200 bg-white">
          {reportIndex.unavailableRows.length > 0 ? (
            reportIndex.unavailableRows.map((row) => (
              <ReportRow key={row.campaignId} row={row}>
                <p className="text-xs font-semibold text-[color:var(--dashboard-muted)] lg:text-right">
                  {row.status}
                </p>
              </ReportRow>
            ))
          ) : (
            <div className="px-5 py-5 text-sm text-[color:var(--dashboard-text)]">
              Geen lopende metingen.
            </div>
          )}
        </div>
      </section>
    </div>
  )
}

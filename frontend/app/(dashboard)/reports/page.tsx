import { redirect } from 'next/navigation'
import { PdfDownloadButton } from '@/app/(dashboard)/campaigns/[id]/pdf-download-button'
import { SuiteAccessDenied } from '@/components/dashboard/suite-access-denied'
import { buildHrReportDownloadRows } from '@/lib/dashboard/report-library'
import { createClient } from '@/lib/supabase/server'
import { loadSuiteAccessContext } from '@/lib/suite-access-server'
import { buildReportDownloadIndex } from './report-download-index'

function ReportRow({
  campaignId,
  campaignName,
  scanType,
  scanName,
  periodLabel,
  responseBasis,
  status,
  extraDisambiguator,
}: {
  campaignId: string
  campaignName: string
  scanType: string
  scanName: string
  periodLabel: string
  responseBasis: string
  status: string
  extraDisambiguator?: string | null
}) {
  return (
    <article className="grid gap-4 border-b border-[color:var(--dashboard-frame-border)] px-5 py-4 last:border-b-0 lg:grid-cols-[minmax(0,1.25fr),150px,170px,140px,auto] lg:items-start">
      <div className="min-w-0">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--dashboard-muted)]">
          {scanName}
        </p>
        <p className="mt-2 text-base font-semibold text-[color:var(--dashboard-ink)]">{campaignName}</p>
        {extraDisambiguator ? (
          <p className="mt-1 text-xs text-[color:var(--dashboard-muted)]">{extraDisambiguator}</p>
        ) : null}
      </div>
      <p className="text-sm text-[color:var(--dashboard-text)]">{periodLabel}</p>
      <p className="text-sm text-[color:var(--dashboard-text)]">{responseBasis}</p>
      <p className="text-sm font-medium text-[color:var(--dashboard-ink)]">{status}</p>
      <div className="flex justify-start lg:justify-end">
        <PdfDownloadButton campaignId={campaignId} campaignName={campaignName} scanType={scanType} />
      </div>
    </article>
  )
}

function UnavailableReportRow({
  scanName,
  campaignName,
  periodLabel,
  responseBasis,
  status,
  extraDisambiguator,
}: {
  scanName: string
  campaignName: string
  periodLabel: string
  responseBasis: string
  status: string
  extraDisambiguator?: string | null
}) {
  return (
    <article className="grid gap-4 border-b border-[color:var(--dashboard-frame-border)] px-5 py-4 last:border-b-0 lg:grid-cols-[minmax(0,1.25fr),150px,170px,1fr] lg:items-start">
      <div className="min-w-0">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--dashboard-muted)]">
          {scanName}
        </p>
        <p className="mt-2 text-base font-semibold text-[color:var(--dashboard-ink)]">{campaignName}</p>
        {extraDisambiguator ? (
          <p className="mt-1 text-xs text-[color:var(--dashboard-muted)]">{extraDisambiguator}</p>
        ) : null}
      </div>
      <p className="text-sm text-[color:var(--dashboard-text)]">{periodLabel}</p>
      <p className="text-sm text-[color:var(--dashboard-text)]">{responseBasis}</p>
      <p className="text-sm font-medium text-[color:var(--dashboard-muted)]">{status}</p>
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
        description="Jouw login opent alleen Action Center. Rapporten, survey-inzichten en campagnedetails blijven zichtbaar voor HR en Loep."
      />
    )
  }

  const { data: stats } = await supabase.from('campaign_stats').select('*').order('created_at', { ascending: false })
  const campaigns = stats ?? []
  const rowFeed = buildHrReportDownloadRows(campaigns)
  const reportIndex = buildReportDownloadIndex([...rowFeed.availableRows, ...rowFeed.unavailableRows])

  return (
    <div className="space-y-8">
      <section className="space-y-2">
        <p className="text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-[color:var(--dashboard-muted)]">
          Rapporten
        </p>
        <h1 className="text-[2rem] font-semibold tracking-[-0.04em] text-[color:var(--dashboard-ink)]">
          Download scanrapporten
        </h1>
        <p className="max-w-3xl text-sm leading-6 text-[color:var(--dashboard-text)]">
          Download per scan het beschikbare PDF-rapport. Resultaten lezen en routebeheer gebeuren op andere plekken.
        </p>
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-lg font-semibold text-[color:var(--dashboard-ink)]">Beschikbaar nu</h2>
          <p className="text-sm text-[color:var(--dashboard-muted)]">
            {reportIndex.availableRows.length} rapport{reportIndex.availableRows.length === 1 ? '' : 'en'}
          </p>
        </div>

        {reportIndex.availableRows.length > 0 ? (
          <div className="overflow-hidden rounded-xl border border-[color:var(--dashboard-frame-border)] bg-white">
            <div className="hidden border-b border-[color:var(--dashboard-frame-border)] bg-[color:var(--dashboard-soft)]/45 px-5 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--dashboard-muted)] lg:grid lg:grid-cols-[minmax(0,1.25fr),150px,170px,140px,auto] lg:items-center">
              <span>Scan</span>
              <span>Periode</span>
              <span>Responsbasis</span>
              <span>Status</span>
              <span className="text-right">Download PDF</span>
            </div>
            {reportIndex.availableRows.map((row) => (
              <ReportRow
                key={row.campaignId}
                campaignId={row.campaignId}
                campaignName={row.campaignName}
                scanType={row.scanType}
                scanName={row.scanName}
                periodLabel={row.periodLabel}
                responseBasis={row.responseBasis}
                status={row.status}
                extraDisambiguator={row.extraDisambiguator}
              />
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-[color:var(--dashboard-frame-border)] bg-white/80 px-5 py-8 text-sm leading-7 text-[color:var(--dashboard-text)]">
            Er zijn nu nog geen downloadbare scanrapporten.
          </div>
        )}
      </section>

      <details className="overflow-hidden rounded-xl border border-[color:var(--dashboard-frame-border)] bg-[color:var(--dashboard-soft)]/40">
        <summary className="cursor-pointer list-none px-5 py-4 text-sm font-semibold text-[color:var(--dashboard-ink)]">
          Nog niet beschikbaar ({reportIndex.unavailableRows.length})
        </summary>
        <div className="border-t border-[color:var(--dashboard-frame-border)] bg-white">
          {reportIndex.unavailableRows.length > 0 ? (
            reportIndex.unavailableRows.map((row) => (
              <UnavailableReportRow
                key={row.campaignId}
                scanName={row.scanName}
                campaignName={row.campaignName}
                periodLabel={row.periodLabel}
                responseBasis={row.responseBasis}
                status={row.status}
                extraDisambiguator={row.extraDisambiguator}
              />
            ))
          ) : (
            <div className="px-5 py-5 text-sm text-[color:var(--dashboard-text)]">Er staan nu geen wachtende rapporten open.</div>
          )}
        </div>
      </details>
    </div>
  )
}

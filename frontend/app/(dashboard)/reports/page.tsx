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
    <article className="grid gap-4 border-b border-slate-200 px-5 py-5 last:border-b-0 lg:grid-cols-[minmax(0,1.45fr),170px,170px,140px,auto] lg:items-start">
      <div className="min-w-0">
        <p className="text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-[color:var(--dashboard-muted)]">
          {scanName}
        </p>
        <p className="mt-2 text-[1.02rem] font-semibold tracking-[-0.03em] text-[color:var(--dashboard-ink)]">
          {campaignName}
        </p>
        {extraDisambiguator ? (
          <p className="mt-2 text-xs text-[color:var(--dashboard-muted)]">{extraDisambiguator}</p>
        ) : null}
      </div>
      <p className="text-sm text-[color:var(--dashboard-text)]">{periodLabel}</p>
      <p className="text-sm text-[color:var(--dashboard-text)]">{responseBasis}</p>
      <p className="inline-flex w-fit rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-emerald-700">
        {status}
      </p>
      <div className="flex justify-start lg:justify-end">
        <PdfDownloadButton
          campaignId={campaignId}
          campaignName={campaignName}
          scanType={scanType}
          label="Download PDF"
          loadingLabel="PDF ophalen..."
          buttonClassName="inline-flex items-center justify-center rounded-full bg-[#C36A29] px-4 py-2 text-sm font-semibold text-white transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-60"
          containerClassName="flex flex-col items-start gap-1 lg:items-end"
          errorClassName="max-w-48 text-xs text-red-600 lg:text-right"
        />
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
    <article className="grid gap-4 border-b border-slate-200 bg-[color:var(--dashboard-soft)]/24 px-5 py-5 last:border-b-0 lg:grid-cols-[minmax(0,1.45fr),170px,170px,1fr] lg:items-start">
      <div className="min-w-0">
        <p className="text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-[color:var(--dashboard-muted)]">
          {scanName}
        </p>
        <p className="mt-2 text-[1.02rem] font-semibold tracking-[-0.03em] text-[color:var(--dashboard-ink)]">
          {campaignName}
        </p>
        {extraDisambiguator ? (
          <p className="mt-2 text-xs text-[color:var(--dashboard-muted)]">{extraDisambiguator}</p>
        ) : null}
      </div>
      <p className="text-sm text-[color:var(--dashboard-text)]">{periodLabel}</p>
      <p className="text-sm text-[color:var(--dashboard-text)]">{responseBasis}</p>
      <p className="inline-flex w-fit rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-[color:var(--dashboard-muted)]">
        {status}
      </p>
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
      <section className="space-y-3 border-b border-slate-200/80 pb-6">
        <div className="flex items-center gap-3">
          <span className="h-px w-10 bg-[#C36A29]" />
          <p className="text-[0.72rem] font-semibold uppercase tracking-[0.28em] text-[color:var(--dashboard-muted)]">
            Rapporten
          </p>
        </div>
        <h1 className="text-[2.4rem] font-semibold leading-none tracking-[-0.06em] text-[color:var(--dashboard-ink)] md:text-[3rem]">
          Download scanrapporten
        </h1>
        <p className="max-w-3xl text-sm leading-6 text-[color:var(--dashboard-text)]">
          Download per scan het beschikbare PDF-rapport. Resultaten lezen en routebeheer gebeuren op andere plekken.
        </p>
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-lg font-semibold tracking-[-0.02em] text-[color:var(--dashboard-ink)]">Beschikbaar nu</h2>
          <p className="text-[0.72rem] font-semibold uppercase tracking-[0.2em] text-[color:var(--dashboard-muted)]">
            {reportIndex.availableRows.length} rapport{reportIndex.availableRows.length === 1 ? '' : 'en'}
          </p>
        </div>

        {reportIndex.availableRows.length > 0 ? (
          <div className="overflow-hidden border border-slate-200 bg-white">
            <div className="hidden border-b border-slate-200 bg-[color:var(--dashboard-soft)]/45 px-5 py-3 text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-[color:var(--dashboard-muted)] lg:grid lg:grid-cols-[minmax(0,1.45fr),170px,170px,140px,auto] lg:items-center">
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
          <div className="border border-dashed border-slate-200 bg-white/80 px-5 py-8 text-sm leading-7 text-[color:var(--dashboard-text)]">
            Er zijn nu nog geen downloadbare scanrapporten.
          </div>
        )}
      </section>

      <details className="overflow-hidden border border-slate-200 bg-[color:var(--dashboard-soft)]/24">
        <summary className="cursor-pointer list-none px-5 py-4 text-sm font-semibold tracking-[-0.01em] text-[color:var(--dashboard-ink)]">
          Nog niet beschikbaar ({reportIndex.unavailableRows.length})
        </summary>
        <div className="border-t border-slate-200 bg-white">
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

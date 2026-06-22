import { redirect } from 'next/navigation'
import { SuiteAccessDenied } from '@/components/dashboard/suite-access-denied'
import { buildHrReportDownloadRows } from '@/lib/dashboard/report-library'
import { createClient } from '@/lib/supabase/server'
import { loadSuiteAccessContext } from '@/lib/suite-access-server'
import { buildReportDownloadIndex } from './report-download-index'

const CONTACT_EMAIL = 'hallo@verisight.nl'

function BesprekingRow({
  campaignName,
  scanName,
  periodLabel,
  responseBasis,
  extraDisambiguator,
}: {
  campaignName: string
  scanName: string
  periodLabel: string
  responseBasis: string
  extraDisambiguator?: string | null
}) {
  const calendlyUrl = process.env.NEXT_PUBLIC_CALENDLY_URL ?? null
  const href =
    calendlyUrl ??
    `mailto:${CONTACT_EMAIL}?subject=Managementbespreking%20${encodeURIComponent(campaignName)}`
  return (
    <article className="grid gap-4 border-b border-slate-200 px-5 py-5 last:border-b-0 lg:grid-cols-[minmax(0,1.45fr),170px,170px,auto] lg:items-center">
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
      <div className="flex justify-start lg:justify-end">
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-sm border border-[#C36A29] bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-[#C36A29] transition-colors hover:bg-[#C36A29] hover:text-white"
        >
          Plan bespreking
        </a>
      </div>
    </article>
  )
}

function PendingRow({
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
        title="Je ziet hier geen besprekingen"
        description="Jouw login opent alleen Action Center. Campagnedetails en besprekingen blijven zichtbaar voor HR en Loep."
      />
    )
  }

  const { data: stats } = await supabase
    .from('campaign_stats')
    .select('*')
    .order('created_at', { ascending: false })
  const campaigns = stats ?? []
  const rowFeed = buildHrReportDownloadRows(campaigns)
  const reportIndex = buildReportDownloadIndex([...rowFeed.availableRows, ...rowFeed.unavailableRows])

  return (
    <div className="space-y-8">
      <section className="space-y-3 border-b border-slate-200/80 pb-6">
        <div className="flex items-center gap-3">
          <span className="h-px w-10 bg-[#C36A29]" />
          <p className="text-[0.72rem] font-semibold uppercase tracking-[0.28em] text-[color:var(--dashboard-muted)]">
            Bespreking
          </p>
        </div>
        <h1 className="text-[2.4rem] font-semibold leading-none tracking-[-0.06em] text-[color:var(--dashboard-ink)] md:text-[3rem]">
          Managementbespreking plannen
        </h1>
        <p className="max-w-3xl text-sm leading-6 text-[color:var(--dashboard-text)]">
          Zodra de respons binnen is, bespreek je de uitkomsten samen met Loep. De resultaten
          zijn alvast zichtbaar in het dashboard.
        </p>
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-lg font-semibold tracking-[-0.02em] text-[color:var(--dashboard-ink)]">
            Klaar voor bespreking
          </h2>
          <p className="text-[0.72rem] font-semibold uppercase tracking-[0.2em] text-[color:var(--dashboard-muted)]">
            {reportIndex.availableRows.length}{' '}
            {reportIndex.availableRows.length === 1 ? 'scan' : 'scans'}
          </p>
        </div>

        {reportIndex.availableRows.length > 0 ? (
          <div className="overflow-hidden border border-slate-200 bg-white">
            <div className="hidden border-b border-slate-200 bg-[color:var(--dashboard-soft)]/45 px-5 py-3 text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-[color:var(--dashboard-muted)] lg:grid lg:grid-cols-[minmax(0,1.45fr),170px,170px,auto] lg:items-center">
              <span>Scan</span>
              <span>Periode</span>
              <span>Responsbasis</span>
              <span className="text-right">Actie</span>
            </div>
            {reportIndex.availableRows.map((row) => (
              <BesprekingRow
                key={row.campaignId}
                campaignName={row.campaignName}
                scanName={row.scanName}
                periodLabel={row.periodLabel}
                responseBasis={row.responseBasis}
                extraDisambiguator={row.extraDisambiguator}
              />
            ))}
          </div>
        ) : (
          <div className="border border-dashed border-slate-200 bg-white/80 px-5 py-8 text-sm leading-7 text-[color:var(--dashboard-text)]">
            Nog geen scans klaar voor bespreking. Zodra de respons voldoende is, verschijnt je
            scan hier.
          </div>
        )}
      </section>

      <details className="overflow-hidden border border-slate-200 bg-[color:var(--dashboard-soft)]/24">
        <summary className="cursor-pointer list-none px-5 py-4 text-sm font-semibold tracking-[-0.01em] text-[color:var(--dashboard-ink)]">
          Nog lopend ({reportIndex.unavailableRows.length})
        </summary>
        <div className="border-t border-slate-200 bg-white">
          {reportIndex.unavailableRows.length > 0 ? (
            reportIndex.unavailableRows.map((row) => (
              <PendingRow
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
            <div className="px-5 py-5 text-sm text-[color:var(--dashboard-text)]">
              Geen lopende scans.
            </div>
          )}
        </div>
      </details>
    </div>
  )
}

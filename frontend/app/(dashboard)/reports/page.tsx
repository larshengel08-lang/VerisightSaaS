import Link from 'next/link'
import { redirect } from 'next/navigation'
import { PdfDownloadButton } from '@/app/(dashboard)/campaigns/[id]/pdf-download-button'
import {
  DashboardChip,
  DashboardHero,
  DashboardSection,
} from '@/components/dashboard/dashboard-primitives'
import {
  buildReportLibraryEntries,
  filterReportLibraryEntries,
  type ReportLibraryCategory,
} from '@/lib/dashboard/report-library'
import { SuiteAccessDenied } from '@/components/dashboard/suite-access-denied'
import { createClient } from '@/lib/supabase/server'
import { loadSuiteAccessContext } from '@/lib/suite-access-server'
import { getCampaignAverageSignalScore } from '@/lib/types'

const CATEGORY_OPTIONS: Array<{ key: ReportLibraryCategory; label: string }> = [
  { key: 'all', label: 'Alle' },
  { key: 'management', label: 'Management' },
  { key: 'module', label: 'Module' },
  { key: 'cohort', label: 'Cohort' },
]

function normalizeCategory(value: string | string[] | undefined): ReportLibraryCategory {
  return typeof value === 'string' && CATEGORY_OPTIONS.some((option) => option.key === value)
    ? (value as ReportLibraryCategory)
    : 'all'
}

export default async function ReportsPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>
}) {
  const resolvedSearchParams = searchParams ? await searchParams : undefined
  const category = normalizeCategory(resolvedSearchParams?.kind)
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
        title="Rapporten blijven bij HR en klant"
        description="Jouw manager-login opent alleen het Action Center. Rapporten, survey-inzichten en scanoverzichten blijven bewust bij HR, klant owner en Verisight."
      />
    )
  }

  const { data: stats } = await supabase.from('campaign_stats').select('*').order('created_at', { ascending: false })
  const campaigns = stats ?? []
  const reportModel = buildReportLibraryEntries(campaigns)
  const filteredEntries = filterReportLibraryEntries(reportModel.entries, category)
  const coreEntries = filteredEntries.filter((entry) => entry.scanType === 'exit' || entry.scanType === 'retention')
  const boundedEntries = filteredEntries.filter((entry) => entry.scanType !== 'exit' && entry.scanType !== 'retention')
  const averageSignal =
    reportModel.entries.length > 0
      ? (
          reportModel.entries.reduce((sum, entry) => {
            const source = campaigns.find((campaign) => campaign.campaign_id === entry.campaignId)
            return sum + (source ? (getCampaignAverageSignalScore(source) ?? 0) : 0)
          }, 0) / reportModel.entries.length
        ).toFixed(1)
      : null

  return (
    <div className="space-y-6">
      <DashboardHero
        eyebrow="Rapporten"
        title="Rapporten die klaarstaan."
        description="Gebruik dit scherm eerst als bibliotheek: welk document hoort bij welke route, en wat kun je nu openen."
        tone="slate"
        meta={
          <>
            <DashboardChip label={`${reportModel.entries.length} rapport${reportModel.entries.length === 1 ? '' : 'en'} beschikbaar`} tone="emerald" />
            <DashboardChip label={averageSignal ? `${averageSignal}/10 gemiddeld signaal` : 'Respons bepaalt beschikbaarheid'} tone={averageSignal ? 'blue' : 'slate'} />
                <DashboardChip label={reportModel.featured ? 'Rapport beschikbaar' : 'Nog geen rapport beschikbaar'} tone={reportModel.featured ? 'emerald' : 'amber'} />
          </>
        }
        actions={
          reportModel.featured ? (
            <>
              <PdfDownloadButton
                campaignId={reportModel.featured.campaignId}
                campaignName={reportModel.featured.campaignName}
                scanType={reportModel.featured.scanType}
              />
              <Link
                href={`/campaigns/${reportModel.featured.campaignId}`}
                className="inline-flex rounded-full border border-[color:var(--dashboard-frame-border)] bg-[color:var(--dashboard-ink)] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#1B2E45]"
              >
                Open rapport
              </Link>
            </>
          ) : (
            <DashboardChip label="Nog geen rapportready campaign" tone="amber" />
          )
        }
        aside={
          reportModel.featured ? (
            <div className="space-y-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--dashboard-accent-strong)]">
                  Aanbevolen rapport
                </p>
                <p className="mt-2 text-[1.45rem] font-semibold tracking-[-0.04em] text-[color:var(--dashboard-ink)]">
                  {reportModel.featured.title}
                </p>
                <p className="mt-2 text-sm text-[color:var(--dashboard-text)]">{reportModel.featured.description}</p>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {reportModel.featured.stats.map((stat) => (
                  <div
                    key={stat.label}
                    className="rounded-[20px] border border-[color:var(--dashboard-frame-border)] bg-[color:var(--dashboard-blue-soft)] px-3 py-3"
                  >
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--dashboard-muted)]">{stat.label}</p>
                    <p className="mt-2 text-lg font-semibold text-[color:var(--dashboard-ink)]">{stat.value}</p>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-sm font-semibold text-[color:var(--dashboard-ink)]">Wanneer rapporten zichtbaar worden</p>
              <p className="text-sm leading-6 text-[color:var(--dashboard-text)]">
                Rapporten verschijnen pas zodra een scan genoeg respons heeft voor een leesbare managementsamenvatting.
              </p>
            </div>
          )
        }
      />

      <DashboardSection
        eyebrow="Kernoutput eerst"
        title="ExitScan en RetentieScan"
        description="De kernrapporten en managementsamenvattingen staan hier eerst. Bounded reads blijven secundair."
        aside={
          <div className="flex flex-wrap justify-start gap-2 lg:justify-end">
            {CATEGORY_OPTIONS.map((option) => {
              const active = option.key === category
              return (
                <Link
                  key={option.key}
                  href={option.key === 'all' ? '/reports' : `/reports?kind=${option.key}`}
                  className={`inline-flex rounded-full border px-4 py-2 text-sm font-semibold transition-colors ${
                    active
                      ? 'border-[color:var(--dashboard-ink)] bg-[color:var(--dashboard-ink)] text-white'
                      : 'border-[color:var(--dashboard-frame-border)] bg-[color:var(--dashboard-surface)] text-[color:var(--dashboard-ink)] hover:border-[#d6e4e8] hover:text-[#234B57]'
                  }`}
                >
                  {option.label}
                </Link>
              )
            })}
          </div>
        }
      >
        {coreEntries.length > 0 ? (
          <div className="grid gap-4 xl:grid-cols-2">
            {coreEntries.map((entry) => (
              <div
                key={entry.campaignId}
                className={`relative overflow-hidden rounded-[28px] border px-4 py-4 shadow-[0_18px_40px_rgba(17,24,39,0.07)] before:pointer-events-none before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-white/72 sm:px-5 sm:py-5 ${
                  entry.recommended
                    ? 'border-[color:var(--dashboard-accent-soft-border)] bg-[color:var(--dashboard-accent-soft)]'
                    : 'border-[color:var(--dashboard-frame-border)] bg-[color:var(--dashboard-surface)]'
                }`}
              >
                <div className="space-y-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--dashboard-muted)]">
                        {entry.categoryLabel}
                      </p>
                      <h3 className="mt-2 text-[1.45rem] font-semibold tracking-[-0.04em] text-[color:var(--dashboard-ink)]">
                        {entry.title}
                      </h3>
                    </div>
                    {entry.recommended ? <DashboardChip label="Aanbevolen" tone="emerald" /> : null}
                  </div>

                  <p className="text-sm leading-7 text-[color:var(--dashboard-text)]">{entry.summary}</p>

                  <div className="grid grid-cols-2 gap-3 border-t border-[color:var(--dashboard-frame-border)] pt-4 text-sm text-[color:var(--dashboard-text)]">
                    <div>{entry.metaLeft}</div>
                    <div className="text-right">{entry.metaRight}</div>
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    <Link
                      href={`/campaigns/${entry.campaignId}`}
                      className="inline-flex rounded-full border border-[color:var(--dashboard-frame-border)] px-4 py-2 text-sm font-semibold text-[color:var(--dashboard-accent-strong)] transition-colors hover:border-[#d6e4e8] hover:bg-white"
                    >
                      Open rapport
                    </Link>
                    <PdfDownloadButton campaignId={entry.campaignId} campaignName={entry.campaignName} scanType={entry.scanType} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-[24px] border border-dashed border-[color:var(--dashboard-frame-border)] bg-[color:var(--dashboard-surface)] px-5 py-8 text-sm leading-7 text-[color:var(--dashboard-text)]">
            Er zijn in deze selectie nog geen ExitScan- of RetentieScan-rapporten met voldoende respons en duiding.
          </div>
        )}
      </DashboardSection>

      <DashboardSection
        eyebrow="Bounded reads secundair"
        title="Onboarding, Pulse en Leadership"
        description="Deze documenten blijven kleiner en lichter in beeld, omdat ze geen kernrapportdragers zijn."
        tone="blue"
      >
        {boundedEntries.length > 0 ? (
          <div className="grid gap-4 xl:grid-cols-2">
            {boundedEntries.map((entry) => (
            <div
              key={entry.campaignId}
              className="relative overflow-hidden rounded-[28px] border border-[#c8d7df] bg-[color:var(--dashboard-blue-soft)] px-4 py-4 shadow-[0_18px_40px_rgba(17,24,39,0.07)] before:pointer-events-none before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-white/72 sm:px-5 sm:py-5"
            >
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--dashboard-muted)]">
                {entry.categoryLabel}
              </p>
              <p className="mt-2 text-[1.1rem] font-semibold tracking-[-0.03em] text-[color:var(--dashboard-ink)]">
                {entry.title}
              </p>
              <p className="mt-3 text-sm leading-7 text-[color:var(--dashboard-text)]">{entry.summary}</p>
              <div className="mt-4 flex flex-wrap items-center gap-3">
                <Link
                  href={`/campaigns/${entry.campaignId}`}
                  className="inline-flex rounded-full border border-[color:var(--dashboard-frame-border)] bg-white px-4 py-2 text-sm font-semibold text-[color:var(--dashboard-ink)] transition-colors hover:border-[#d6e4e8] hover:text-[#234B57]"
                >
                  Open
                </Link>
                <PdfDownloadButton campaignId={entry.campaignId} campaignName={entry.campaignName} scanType={entry.scanType} />
              </div>
            </div>
            ))}
          </div>
        ) : (
          <div className="rounded-[24px] border border-dashed border-[#c8d7df] bg-[color:var(--dashboard-blue-soft)] px-5 py-8 text-sm leading-7 text-[color:var(--dashboard-text)]">
            In deze selectie staan nog geen bounded reads klaar.
          </div>
        )}
      </DashboardSection>

      <DashboardSection
        eyebrow="Bibliotheeklijst"
        title="Alle documenten"
        description="Dichte lijst voor openen en downloaden, zonder showroomopzet."
      >
        {filteredEntries.length > 0 ? (
          <div className="overflow-hidden rounded-[24px] border border-[color:var(--dashboard-frame-border)] bg-[color:var(--dashboard-surface)]">
            <div className="grid grid-cols-[minmax(0,2.2fr)_1fr_1fr_1fr_auto] gap-3 border-b border-[color:var(--dashboard-frame-border)] px-4 py-3 text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-[color:var(--dashboard-muted)]">
              <span>Naam</span>
              <span>Route</span>
              <span>Type</span>
              <span>Datum</span>
              <span>Actie</span>
            </div>
            {filteredEntries.map((entry) => (
              <div
                key={`${entry.campaignId}-dense`}
                className="grid grid-cols-[minmax(0,2.2fr)_1fr_1fr_1fr_auto] items-center gap-3 border-b border-[color:var(--dashboard-frame-border)] px-4 py-3 last:border-b-0"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-[color:var(--dashboard-ink)]">{entry.title}</p>
                  <p className="truncate text-xs text-[color:var(--dashboard-muted)]">{entry.summary}</p>
                </div>
                <span className="text-sm text-[color:var(--dashboard-text)]">{entry.scanType === 'exit' ? 'ExitScan' : entry.scanType === 'retention' ? 'RetentieScan' : entry.scanType === 'onboarding' ? 'Onboarding' : entry.scanType === 'leadership' ? 'Leadership' : 'Pulse'}</span>
                <span className="text-sm text-[color:var(--dashboard-text)]">{entry.categoryLabel}</span>
                <span className="text-sm text-[color:var(--dashboard-text)]">{entry.metaRight}</span>
                <div className="flex items-center gap-2">
                  <Link
                    href={`/campaigns/${entry.campaignId}`}
                    className="inline-flex rounded-full border border-[color:var(--dashboard-frame-border)] px-3 py-1.5 text-sm font-semibold text-[color:var(--dashboard-ink)] transition-colors hover:border-[#d6e4e8] hover:text-[#234B57]"
                  >
                    Open
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-[24px] border border-dashed border-[color:var(--dashboard-frame-border)] bg-[color:var(--dashboard-surface)] px-5 py-8 text-sm leading-7 text-[color:var(--dashboard-text)]">
            Er zijn nog geen documenten beschikbaar in deze selectie.
          </div>
        )}
      </DashboardSection>
    </div>
  )
}

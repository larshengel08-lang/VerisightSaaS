import Link from 'next/link'
import { redirect } from 'next/navigation'
import { PdfDownloadButton } from '@/app/(dashboard)/campaigns/[id]/pdf-download-button'
import { DashboardSection } from '@/components/dashboard/dashboard-primitives'
import {
  getDashboardModuleKeyForScanType,
  getDashboardModuleLabel,
  getScanTypeForDashboardModule,
  normalizeDashboardModuleFilter,
  type DashboardCategoryModuleKey,
} from '@/lib/dashboard/shell-navigation'
import { loadSuiteAccessContext } from '@/lib/suite-access-server'
import { createClient } from '@/lib/supabase/server'
import type { CampaignStats } from '@/lib/types'
import { buildCockpitIndexRows, buildCockpitSummary, type CockpitAction, type CockpitRow } from './cockpit-index'

const MODULE_ORDER: DashboardCategoryModuleKey[] = ['exit', 'retention', 'onboarding', 'pulse', 'leadership']

export default async function DashboardHomePage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>
}) {
  const resolvedSearchParams = searchParams ? await searchParams : undefined
  const requestedModuleFilter = normalizeDashboardModuleFilter(
    typeof resolvedSearchParams?.module === 'string' ? resolvedSearchParams.module : undefined,
  )
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { context, profile } = await loadSuiteAccessContext(supabase, user.id)
  if (context.managerOnly) redirect('/action-center')

  const isAdmin = profile?.is_verisight_admin === true
  const { data: stats } = await supabase.from('campaign_stats').select('*').order('created_at', { ascending: false })

  const allCampaigns = (stats ?? []) as CampaignStats[]
  const campaigns = requestedModuleFilter
    ? allCampaigns.filter((campaign) => campaign.scan_type === getScanTypeForDashboardModule(requestedModuleFilter))
    : allCampaigns
  const productFilters = buildAvailableModuleFilters(allCampaigns)
  const campaignIds = campaigns.map((campaign) => campaign.campaign_id)
  const { data: respondentStateRowsRaw } =
    campaignIds.length > 0
      ? await supabase
          .from('respondents')
          .select('campaign_id, sent_at, completed')
          .in('campaign_id', campaignIds)
      : { data: [] }
  const respondentStateRows = (respondentStateRowsRaw ?? []) as Array<{
    campaign_id: string
    sent_at: string | null
    completed: boolean
  }>
  const invitesNotSentByCampaign = buildInvitesNotSentByCampaign(campaigns, respondentStateRows)
  const rows = buildCockpitIndexRows({ campaigns, invitesNotSentByCampaign })
  const summary = buildCockpitSummary(rows)
  const contextLabel = requestedModuleFilter ? getDashboardModuleLabel(requestedModuleFilter) : 'Alle routes'

  return (
    <div className="space-y-8">
      {campaigns.length === 0 && isAdmin ? (
        <AdminEmptyState />
      ) : campaigns.length === 0 ? (
        requestedModuleFilter ? (
          <DashboardSection
            eyebrow={contextLabel}
            title="Nog geen campagnes voor deze route"
            description="Zodra deze route live staat, verschijnt hier automatisch het volledige overzicht."
          >
            <div className="pt-1">
              <Link
                href="/dashboard"
                className="inline-flex rounded-full border border-[color:var(--dashboard-frame-border)] bg-[color:var(--dashboard-surface)] px-4 py-2 text-sm font-semibold text-[color:var(--dashboard-ink)] transition-colors hover:border-[color:var(--dashboard-accent-soft-border)] hover:text-[color:var(--dashboard-accent-strong)]"
              >
                Terug naar alle routes
              </Link>
            </div>
          </DashboardSection>
        ) : (
          <ViewerEmptyState />
        )
      ) : (
        <>
          <header className="space-y-5 border-b border-[color:var(--dashboard-frame-border)] pb-6">
            {requestedModuleFilter ? (
              <Link
                href="/dashboard"
                className="inline-flex text-sm font-semibold text-[color:var(--dashboard-accent-strong)] transition-colors hover:text-[color:var(--dashboard-ink)]"
              >
                Terug naar alle routes
              </Link>
            ) : null}
            <div className="space-y-5">
              <div className="space-y-3">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="inline-flex rounded-full bg-[color:var(--dashboard-accent-soft)] px-3 py-1 text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-[color:var(--dashboard-accent-strong)]">
                    Cockpit
                  </span>
                  <span className="text-sm font-medium text-[color:var(--dashboard-muted)]">{contextLabel}</span>
                </div>
                <h1 className="font-serif text-[2.25rem] leading-[0.95] tracking-[-0.05em] text-[color:var(--dashboard-ink)] sm:text-[2.8rem]">
                  Dashboard overview
                </h1>
                <p className="max-w-3xl text-[0.98rem] leading-7 text-[color:var(--dashboard-text)]">
                  Open scans, download rapporten en beheer instellingen vanuit een overzicht.
                </p>
              </div>
              <div className="grid gap-4 lg:grid-cols-[minmax(0,1.35fr),minmax(0,1fr)]">
                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                  <SummaryCard label="Scans" value={summary.total} />
                  <SummaryCard label="Resultaten" value={summary.resultsAvailable} />
                  <SummaryCard label="PDF" value={summary.pdfAvailable} />
                  <SummaryCard label="Aandacht" value={summary.attentionNeeded} />
                </div>
                <div className="rounded-[20px] border border-[color:var(--dashboard-frame-border)] bg-[color:var(--dashboard-surface)] px-4 py-4 shadow-[0_1px_3px_rgba(15,23,42,0.03)] sm:px-5">
                  <div className="space-y-2">
                    <p className="text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-[color:var(--dashboard-muted)]">
                      Product
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <FilterPill href="/dashboard" active={requestedModuleFilter === null} label="Alle routes" />
                      {productFilters.map((filterKey) => (
                        <FilterPill
                          key={filterKey}
                          href={buildDashboardOverviewHref(filterKey)}
                          active={requestedModuleFilter === filterKey}
                          label={getDashboardModuleLabel(filterKey)}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </header>

          <section className="space-y-3">
            {rows.map((row) => (
              <CockpitScanRow key={row.campaign.campaign_id} row={row} />
            ))}
          </section>
        </>
      )}
    </div>
  )
}

function buildDashboardOverviewHref(moduleFilter: DashboardCategoryModuleKey) {
  const params = new URLSearchParams()
  params.set('module', moduleFilter)
  return `/dashboard?${params.toString()}`
}

function buildAvailableModuleFilters(campaigns: CampaignStats[]) {
  const availableKeys = new Set<DashboardCategoryModuleKey>()

  for (const campaign of campaigns) {
    if (campaign.scan_type === 'team') continue
    availableKeys.add(getDashboardModuleKeyForScanType(campaign.scan_type))
  }

  return MODULE_ORDER.filter((key) => availableKeys.has(key))
}

function buildInvitesNotSentByCampaign(
  campaigns: CampaignStats[],
  respondents: Array<{ campaign_id: string; sent_at: string | null; completed: boolean }>,
) {
  const counts = new Map<string, number>()

  for (const respondent of respondents) {
    if (!respondent.sent_at && !respondent.completed) {
      counts.set(respondent.campaign_id, (counts.get(respondent.campaign_id) ?? 0) + 1)
    }
  }

  for (const campaign of campaigns) {
    if (!counts.has(campaign.campaign_id)) {
      counts.set(campaign.campaign_id, campaign.total_invited === 0 ? 0 : campaign.total_completed >= 5 ? 0 : 1)
    }
  }

  return counts
}

function FilterPill({
  href,
  active,
  label,
}: {
  href: string
  active: boolean
  label: string
}) {
  return (
    <Link
      href={href}
      className={`inline-flex rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors ${
        active
          ? 'border-[color:var(--dashboard-accent-soft-border)] bg-[color:var(--dashboard-accent-soft)] text-[color:var(--dashboard-accent-strong)]'
          : 'border-[color:var(--dashboard-frame-border)] bg-[color:var(--dashboard-surface)] text-[color:var(--dashboard-text)] hover:border-[color:var(--dashboard-accent-soft-border)] hover:text-[color:var(--dashboard-ink)]'
      }`}
    >
      {label}
    </Link>
  )
}

function SummaryCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-[18px] border border-[color:var(--dashboard-frame-border)] bg-white px-4 py-3.5">
      <p className="text-[0.64rem] font-semibold uppercase tracking-[0.22em] text-[color:var(--dashboard-muted)]">
        {label}
      </p>
      <p className="dash-number mt-2 text-[1.65rem] leading-none text-[color:var(--dashboard-ink)]">{value}</p>
    </div>
  )
}

function CockpitScanRow({ row }: { row: CockpitRow }) {
  return (
    <article className="rounded-[18px] border border-[color:var(--dashboard-frame-border)] bg-white px-5 py-5 shadow-[0_1px_3px_rgba(17,24,39,0.04)] transition-shadow hover:shadow-[0_12px_24px_rgba(17,24,39,0.08)]">
      <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
        <div className="min-w-0 flex-1 space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[0.72rem] font-semibold uppercase tracking-[0.2em] text-[color:var(--dashboard-muted)]">
              {row.periodLabel} - {row.productLabel}
            </span>
            <span className="inline-flex rounded-full border border-[color:var(--dashboard-frame-border)] bg-[color:var(--dashboard-soft)] px-3 py-1 text-[0.78rem] font-semibold text-[color:var(--dashboard-text)]">
              {row.statusLabel}
            </span>
          </div>
          <h2 className="text-[1.08rem] font-semibold tracking-[-0.03em] text-[color:var(--dashboard-ink)]">
            {row.campaign.campaign_name}
          </h2>
          <div className="flex flex-wrap items-center gap-4 text-sm text-[color:var(--dashboard-text)]">
            <span>Respons {row.responseValue}</span>
            <span>{row.factualLine}</span>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2 xl:justify-end">
          <CockpitActionButton
            action={row.primaryAction}
            campaignId={row.campaign.campaign_id}
            campaignName={row.campaign.campaign_name}
            scanType={row.campaign.scan_type}
            primary
          />
          {row.secondaryActions.map((action) => (
            <CockpitActionButton
              key={`${row.campaign.campaign_id}-${action.kind}`}
              action={action}
              campaignId={row.campaign.campaign_id}
              campaignName={row.campaign.campaign_name}
              scanType={row.campaign.scan_type}
            />
          ))}
        </div>
      </div>
    </article>
  )
}

function CockpitActionButton({
  action,
  campaignId,
  campaignName,
  scanType,
  primary = false,
}: {
  action: CockpitAction
  campaignId: string
  campaignName: string
  scanType: CampaignStats['scan_type']
  primary?: boolean
}) {
  if (action.kind === 'pdf') {
    return (
      <PdfDownloadButton
        campaignId={campaignId}
        campaignName={campaignName}
        scanType={scanType}
        label="Download PDF"
        loadingLabel="PDF ophalen..."
        containerClassName="flex flex-col items-start gap-1"
        errorClassName="max-w-48 text-xs text-red-600"
        buttonClassName={
          primary
            ? 'inline-flex rounded-lg bg-[color:var(--dashboard-accent-strong)] px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#00584f] disabled:cursor-not-allowed disabled:opacity-60'
            : 'inline-flex rounded-lg border border-[color:var(--dashboard-frame-border)] bg-white px-4 py-3 text-sm font-semibold text-[color:var(--dashboard-ink)] transition-colors hover:border-[color:var(--dashboard-accent-soft-border)] hover:text-[color:var(--dashboard-accent-strong)] disabled:cursor-not-allowed disabled:opacity-60'
        }
      />
    )
  }

  return (
    <Link
      href={action.href}
      className={
        primary
          ? 'inline-flex rounded-lg bg-[color:var(--dashboard-accent-strong)] px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#00584f]'
          : 'inline-flex rounded-lg border border-[color:var(--dashboard-frame-border)] bg-white px-4 py-3 text-sm font-semibold text-[color:var(--dashboard-ink)] transition-colors hover:border-[color:var(--dashboard-accent-soft-border)] hover:text-[color:var(--dashboard-accent-strong)]'
      }
    >
      {action.label}
    </Link>
  )
}

function AdminEmptyState() {
  return (
    <DashboardSection
      eyebrow="Setup"
      title="Nog geen campagnes beschikbaar"
      description="Dit overzicht wordt vanzelf gevuld zodra je een organisatie, campagne en respondentbestand hebt toegevoegd."
    >
      <div className="grid gap-3 md:grid-cols-3">
        {[
          { step: '1', title: 'Organisatie', body: 'Maak eerst de klantorganisatie aan en leg het contactpunt vast.' },
          {
            step: '2',
            title: 'Campagne',
            body: 'Kies ExitScan of RetentieScan en zet de campagne op met de juiste metadata.',
          },
          {
            step: '3',
            title: 'Respondenten',
            body: 'Importeer respondenten en stuur uitnodigingen, zodat dit overzicht vanzelf in monitoring overgaat.',
          },
        ].map(({ step, title, body }) => (
          <div
            key={step}
            className="rounded-[var(--dashboard-radius-card)] px-4 py-4"
            style={{ background: 'var(--dashboard-surface)', border: '1px solid var(--dashboard-frame-border)' }}
          >
            <p
              className="text-[0.65rem] font-medium uppercase"
              style={{ color: 'var(--dashboard-muted)', letterSpacing: '0.18em' }}
            >
              Stap {step}
            </p>
            <p className="mt-2 text-sm font-semibold" style={{ color: 'var(--dashboard-ink)' }}>
              {title}
            </p>
            <p className="mt-1.5 text-sm leading-[1.65]" style={{ color: 'var(--dashboard-text)' }}>
              {body}
            </p>
          </div>
        ))}
      </div>
      <div className="mt-5">
        <Link
          href="/beheer"
          className="inline-flex rounded-full bg-[color:var(--ink)] px-4 py-2 text-sm font-semibold text-[color:var(--bg)] transition-colors hover:bg-[#1B2E45]"
        >
          Naar setup
        </Link>
      </div>
    </DashboardSection>
  )
}

function ViewerEmptyState() {
  return (
    <DashboardSection
      eyebrow="Wachten op livegang"
      title="Jouw dashboard wordt voorbereid"
      description="Loep zet de campaign op, controleert de import en activeert daarna automatisch dit overzicht."
    >
      <div className="space-y-4">
        <div className="rounded-[22px] border border-[color:var(--border)] bg-[color:var(--bg)] px-4 py-5 text-sm leading-6 text-[color:var(--text)]">
          Zodra de eerste responses binnenkomen, verschijnen hier automatisch je campagnes, status en rapportacties.
        </div>
        <div className="grid gap-3 md:grid-cols-3">
          {[
            'Loep beheert organisatie, campagne en respondentimport.',
            'Jij krijgt daarna toegang tot het juiste dashboard en rapport.',
            'De eerste managementwaarde zit in lezen, duiden en prioriteren, niet in technische setup.',
          ].map((item, index) => (
            <div
              key={item}
              className="rounded-2xl border border-[color:var(--border)] bg-white px-4 py-4 text-sm leading-6 text-[color:var(--text)]"
            >
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--muted)]">
                Stap {index + 1}
              </p>
              <p className="mt-2">{item}</p>
            </div>
          ))}
        </div>
      </div>
    </DashboardSection>
  )
}

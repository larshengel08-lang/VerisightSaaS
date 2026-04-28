import Link from 'next/link'
import { redirect } from 'next/navigation'
import { PdfDownloadButton } from '@/app/(dashboard)/campaigns/[id]/pdf-download-button'
import { projectActionCenterRoute } from '@/lib/action-center-route-contract'
import {
  DashboardChip,
  DashboardHero,
  DashboardSection,
} from '@/components/dashboard/dashboard-primitives'
import { getActionCenterEntryState } from '@/lib/dashboard/action-center-entry-state'
import {
  buildReportLibraryEntries,
  filterReportLibraryEntries,
  type ReportLibraryCategory,
} from '@/lib/dashboard/report-library'
import type { CampaignDeliveryRecord } from '@/lib/ops-delivery'
import type { PilotLearningDossier } from '@/lib/pilot-learning'
import { SuiteAccessDenied } from '@/components/dashboard/suite-access-denied'
import { createClient } from '@/lib/supabase/server'
import { loadSuiteAccessContext } from '@/lib/suite-access-server'
import { getCampaignAverageSignalScore, type CampaignStats } from '@/lib/types'

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

function buildActionCenterStateByCampaignId(args: {
  campaigns: CampaignStats[]
  deliveryRecords: CampaignDeliveryRecord[]
  learningDossiers: PilotLearningDossier[]
}) {
  const deliveryRecordByCampaignId = new Map(args.deliveryRecords.map((record) => [record.campaign_id, record]))
  const learningDossierByCampaignId = new Map<string, PilotLearningDossier>()

  for (const dossier of args.learningDossiers) {
    if (dossier.campaign_id && !learningDossierByCampaignId.has(dossier.campaign_id)) {
      learningDossierByCampaignId.set(dossier.campaign_id, dossier)
    }
  }

  return new Map(
    args.campaigns.map((campaign) => {
      const route = projectActionCenterRoute({
        campaign: {
          id: campaign.campaign_id,
          organization_id: campaign.organization_id,
          name: campaign.campaign_name,
          scan_type: campaign.scan_type,
          delivery_mode: 'live',
          is_active: campaign.is_active,
          enabled_modules: null,
          created_at: campaign.created_at,
          closed_at: null,
        },
        stats: campaign,
        organizationName: '',
        memberRole: null,
        scopeType: 'item',
        scopeValue: campaign.campaign_id,
        scopeLabel: campaign.campaign_name,
        peopleCount: campaign.total_completed || campaign.total_invited || 0,
        assignedManager: null,
        deliveryRecord: deliveryRecordByCampaignId.get(campaign.campaign_id) ?? null,
        deliveryCheckpoints: [],
        learningDossier: learningDossierByCampaignId.get(campaign.campaign_id) ?? null,
        learningCheckpoints: [],
      })

      return [campaign.campaign_id, getActionCenterEntryState(route)] as const
    }),
  )
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
        description="Jouw manager-login opent alleen het Action Center. Rapporten, survey-inzichten en campaignreads blijven bewust bij HR, klant owner en Verisight."
      />
    )
  }

  const { data: stats } = await supabase.from('campaign_stats').select('*').order('created_at', { ascending: false })
  const campaigns = (stats ?? []) as CampaignStats[]
  const campaignIds = campaigns.map((campaign) => campaign.campaign_id)
  const [{ data: deliveryRecordsRaw }, { data: learningDossiersRaw }] = await Promise.all([
    campaignIds.length > 0
      ? supabase.from('campaign_delivery_records').select('*').in('campaign_id', campaignIds)
      : Promise.resolve({ data: [] }),
    campaignIds.length > 0
      ? supabase
          .from('pilot_learning_dossiers')
          .select('*')
          .in('campaign_id', campaignIds)
          .order('updated_at', { ascending: false })
      : Promise.resolve({ data: [] }),
  ])
  const actionCenterStateByCampaignId = buildActionCenterStateByCampaignId({
    campaigns,
    deliveryRecords: (deliveryRecordsRaw ?? []) as CampaignDeliveryRecord[],
    learningDossiers: (learningDossiersRaw ?? []) as PilotLearningDossier[],
  })
  const reportModel = buildReportLibraryEntries(campaigns)
  const filteredEntries = filterReportLibraryEntries(reportModel.entries, category).map((entry) => ({
    ...entry,
    actionCenterState:
      actionCenterStateByCampaignId.get(entry.campaignId) ??
      getActionCenterEntryState({ entryStage: 'attention', routeStatus: null }),
  }))
  const featuredActionCenterState = reportModel.featured
    ? actionCenterStateByCampaignId.get(reportModel.featured.campaignId) ??
      getActionCenterEntryState({ entryStage: 'attention', routeStatus: null })
    : null
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
        eyebrow="Reports & Exports"
        title="Klaar voor het overleg."
        description="Gebruik de rapportlaag als compacte managementread en handofflaag: eerst wat nu telt, daarna welke verificatie, eigenaar en opvolging logisch zijn. Geen ruwe data-dump, wel bestuurlijke output in dezelfde familie als dashboard en Action Center."
        tone="slate"
        meta={
          <>
            <DashboardChip label={`${reportModel.entries.length} rapport${reportModel.entries.length === 1 ? '' : 'en'} beschikbaar`} tone="emerald" />
            <DashboardChip label={averageSignal ? `${averageSignal}/10 gemiddeld signaal` : 'Respons bepaalt beschikbaarheid'} tone={averageSignal ? 'blue' : 'slate'} />
            <DashboardChip label={reportModel.featured ? 'Boardroom-ready' : 'Nog geen MT-ready rapport'} tone={reportModel.featured ? 'emerald' : 'amber'} />
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
                Open in viewer
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
                  Aanbevolen voor MT
                </p>
                <p className="mt-2 text-[1.45rem] font-semibold tracking-[-0.04em] text-[color:var(--dashboard-ink)]">
                  {reportModel.featured.title}
                </p>
                <p className="mt-2 text-sm text-[color:var(--dashboard-text)]">{reportModel.featured.description}</p>
                {featuredActionCenterState ? (
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <DashboardChip label={featuredActionCenterState.label} tone={featuredActionCenterState.tone} />
                    <p className="text-sm text-[color:var(--dashboard-text)]">{featuredActionCenterState.body}</p>
                  </div>
                ) : null}
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
              <p className="text-sm font-semibold text-[color:var(--dashboard-ink)]">Wanneer de rapportlaag opent</p>
              <p className="text-sm leading-6 text-[color:var(--dashboard-text)]">
                Rapporten verschijnen pas als een campaign genoeg respons en managementduiding heeft om een bounded handoff te dragen.
              </p>
            </div>
          )
        }
      />

      <DashboardSection
        eyebrow="Bibliotheek"
        title="Beschikbare rapporten"
        description="Open alleen rapporten die al een echte managementread dragen. De rapportlaag blijft gekoppeld aan echte campaigns en volgt dezelfde bounded taal als dashboard en Action Center."
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
        {filteredEntries.length > 0 ? (
          <div className="grid gap-4 xl:grid-cols-2">
            {filteredEntries.map((entry) => (
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
                      <div className="flex flex-col items-end gap-2">
                        {entry.recommended ? <DashboardChip label="Aanbevolen" tone="emerald" /> : null}
                        <DashboardChip label={entry.actionCenterState.label} tone={entry.actionCenterState.tone} />
                      </div>
                    </div>

                  <p className="text-sm leading-7 text-[color:var(--dashboard-text)]">{entry.summary}</p>
                  <p className="text-sm leading-6 text-[color:var(--dashboard-text)]">{entry.actionCenterState.body}</p>

                  <div className="grid grid-cols-2 gap-3 border-t border-[color:var(--dashboard-frame-border)] pt-4 text-sm text-[color:var(--dashboard-text)]">
                    <div>{entry.metaLeft}</div>
                    <div className="text-right">{entry.metaRight}</div>
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    <Link
                      href={`/campaigns/${entry.campaignId}`}
                      className="inline-flex rounded-full border border-[color:var(--dashboard-frame-border)] px-4 py-2 text-sm font-semibold text-[color:var(--dashboard-accent-strong)] transition-colors hover:border-[#d6e4e8] hover:bg-white"
                    >
                      Open ↗
                    </Link>
                    <PdfDownloadButton campaignId={entry.campaignId} campaignName={entry.campaignName} scanType={entry.scanType} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-[24px] border border-dashed border-[color:var(--dashboard-frame-border)] bg-[color:var(--dashboard-surface)] px-5 py-8 text-sm leading-7 text-[color:var(--dashboard-text)]">
            Er zijn in deze categorie nog geen rapporten met voldoende respons en managementduiding. Gebruik eerst dashboard en campaignroute om de eerste read te laten landen.
          </div>
        )}
      </DashboardSection>

      <DashboardSection
        eyebrow="Handoff"
        title="Van rapport naar opvolging"
        description="De rapportlaag is geen eindpunt. Gebruik hem om managementduiding te bundelen en leg daarna in Action Center expliciet vast wie de eigenaar is, wat de eerste stap is en wanneer het reviewmoment terugkomt."
        tone="blue"
      >
        <div className="grid gap-4 lg:grid-cols-3">
          {[
            ['1. Managementread', 'Gebruik dashboard en rapport samen om te bepalen welk patroon nu bestuurlijk telt en welke claim bewust nog niet hoort.'],
            ['2. Eerste stap', 'Leg de eerste eigenaar en eerste stap vast zodra het rapport een echt managementgesprek opent. Zo blijft de output niet hangen in alleen inzicht.'],
            ['3. Reviewmoment', 'Koppel het rapport altijd aan een reviewmoment in Action Center. Dan wordt opvolging zichtbaar, bounded en controleerbaar.'],
          ].map(([title, body]) => (
            <div
              key={title}
              className="relative overflow-hidden rounded-[28px] border border-[#c8d7df] bg-[color:var(--dashboard-blue-soft)] px-4 py-4 shadow-[0_18px_40px_rgba(17,24,39,0.07)] before:pointer-events-none before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-white/72 sm:px-5 sm:py-5"
            >
              <p className="text-sm font-semibold text-[color:var(--dashboard-ink)]">{title}</p>
              <p className="mt-3 text-sm leading-7 text-[color:var(--dashboard-text)]">{body}</p>
            </div>
          ))}
        </div>
      </DashboardSection>
    </div>
  )
}

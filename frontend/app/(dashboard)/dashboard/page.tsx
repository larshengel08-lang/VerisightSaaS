import Link from 'next/link'
import { redirect } from 'next/navigation'
import { CustomerLaunchControl } from '@/components/dashboard/customer-launch-control'
import { OnboardingBalloon } from '@/components/dashboard/onboarding-balloon'
import { ManagementReadGuide } from '@/components/dashboard/onboarding-panels'
import {
  DashboardChip,
  DashboardHero,
  DashboardPanel,
  DashboardSection,
  InfoTooltip,
} from '@/components/dashboard/dashboard-primitives'
import { DashboardTabs } from '@/components/dashboard/dashboard-tabs'
import { PdfDownloadButton } from '@/app/(dashboard)/campaigns/[id]/pdf-download-button'
import {
  getCampaignCompositionState,
  HOME_STATE_ORDER,
  type CampaignCompositionState,
} from '@/lib/dashboard/dashboard-state-composition'
import {
  normalizeDashboardPortfolioView,
  type DashboardPortfolioView,
} from '@/lib/dashboard/shell-navigation'
import { createClient } from '@/lib/supabase/server'
import { getFirstNextStepGuidance } from '@/lib/client-onboarding'
import { buildGuidedSelfServeState, deriveGuidedSelfServeDiscipline } from '@/lib/guided-self-serve'
import { FIRST_INSIGHT_THRESHOLD } from '@/lib/response-activation'
import { getScanDefinition } from '@/lib/scan-definitions'
import type { CampaignStats } from '@/lib/types'

type CampaignHomeEntry = {
  campaign: CampaignStats
  state: CampaignCompositionState
  invitesNotSent: number
}

type CampaignGroup = {
  key: CampaignCompositionState
  title: string
  description: string
  entries: CampaignHomeEntry[]
}

type PortfolioBucket = {
  key: DashboardPortfolioView
  label: string
  groups: CampaignGroup[]
  entries: CampaignHomeEntry[]
}

export default async function DashboardHomePage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>
}) {
  const resolvedSearchParams = searchParams ? await searchParams : undefined
  const requestedPortfolioView = normalizeDashboardPortfolioView(
    typeof resolvedSearchParams?.view === 'string' ? resolvedSearchParams.view : undefined,
  )
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('is_verisight_admin')
    .eq('id', user.id)
    .single()

  const isAdmin = profile?.is_verisight_admin === true

  const { data: stats } = await supabase.from('campaign_stats').select('*').order('created_at', { ascending: false })

  const campaigns = (stats ?? []) as CampaignStats[]
  const activeCampaigns = campaigns.filter((campaign) => campaign.is_active)
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
  const campaignEntries = campaigns.map((campaign) => ({
    campaign,
    invitesNotSent: invitesNotSentByCampaign.get(campaign.campaign_id) ?? 0,
    state: getCampaignCompositionState({
      isActive: campaign.is_active,
      totalInvited: campaign.total_invited,
      totalCompleted: campaign.total_completed,
      invitesNotSent: invitesNotSentByCampaign.get(campaign.campaign_id) ?? 0,
      incompleteScores: 0,
      hasMinDisplay: campaign.total_completed >= 5,
      hasEnoughData: campaign.total_completed >= 10,
    }),
  }))
  const groups = groupCampaigns(campaignEntries)
  const portfolioBuckets = buildPortfolioBuckets(groups)
  const primaryGuideEntry = getPrimaryGuideCampaign(campaignEntries)
  const primaryGuideCampaign = primaryGuideEntry?.campaign ?? null
  const primaryGuideInvitesNotSent = primaryGuideEntry?.invitesNotSent ?? 0
  const primaryGuideStateMeta = primaryGuideEntry ? getHomeStateMeta(primaryGuideEntry.state) : null
  const primaryFirstNextStepCampaign = getPrimaryFirstNextStepCampaign(activeCampaigns, campaigns)
  const { data: primaryGuideDeliveryRecord } = primaryGuideCampaign
    ? await supabase
        .from('campaign_delivery_records')
        .select('id')
        .eq('campaign_id', primaryGuideCampaign.campaign_id)
        .maybeSingle()
    : { data: null }
  const { data: primaryGuideCheckpointsRaw } = primaryGuideDeliveryRecord
    ? await supabase
        .from('campaign_delivery_checkpoints')
        .select('checkpoint_key, manual_state')
        .eq('delivery_record_id', primaryGuideDeliveryRecord.id)
    : { data: [] }
  const primaryGuideSetupDiscipline = deriveGuidedSelfServeDiscipline(
    ((primaryGuideCheckpointsRaw ?? []) as Array<{
      checkpoint_key: 'implementation_intake' | 'import_qa' | 'invite_readiness'
      manual_state: 'pending' | 'confirmed' | 'not_applicable'
    }>).map((checkpoint) => ({
      checkpointKey: checkpoint.checkpoint_key,
      manualState: checkpoint.manual_state,
    })),
  )
  const avgResponse =
    campaigns.length > 0
      ? Math.round(campaigns.reduce((sum, campaign) => sum + (campaign.completion_rate_pct ?? 0), 0) / campaigns.length)
      : 0
  const campaignsWithSignal = campaigns.filter((campaign) => campaign.avg_risk_score !== null)
  const avgSignal =
    campaignsWithSignal.length > 0
      ? (
          campaignsWithSignal.reduce((sum, campaign) => sum + (campaign.avg_risk_score ?? 0), 0) /
          campaignsWithSignal.length
        ).toFixed(1)
      : null
  const fullCount = campaignEntries.filter((entry) => entry.state === 'full').length
  const partialCount = campaignEntries.filter((entry) => entry.state === 'partial').length
  const setupCount = campaignEntries.filter((entry) => entry.state === 'setup').length
  const activeExecutionCount = campaignEntries.filter((entry) =>
    ['setup', 'ready_to_launch', 'running', 'sparse'].includes(entry.state),
  ).length
  const closedCount = campaignEntries.filter((entry) => entry.state === 'closed').length
  const managementReadyCount = fullCount + partialCount
  const primaryExecutionState = primaryGuideCampaign
    ? buildGuidedSelfServeState({
        isActive: primaryGuideCampaign.is_active,
        totalInvited: primaryGuideCampaign.total_invited,
        totalCompleted: primaryGuideCampaign.total_completed,
        invitesNotSent: primaryGuideInvitesNotSent,
        hasMinDisplay: primaryGuideCampaign.total_completed >= 5,
        hasEnoughData: primaryGuideCampaign.total_completed >= 10,
        importQaConfirmed: primaryGuideSetupDiscipline.importQaConfirmed,
        launchTimingConfirmed: primaryGuideSetupDiscipline.launchTimingConfirmed,
        communicationReady: primaryGuideSetupDiscipline.communicationReady,
      })
    : null
  const showFirstNextStep = !isAdmin && Boolean(primaryFirstNextStepCampaign)
  const primaryFirstNextStepGuidance = primaryFirstNextStepCampaign
    ? getFirstNextStepGuidance(primaryFirstNextStepCampaign.scan_type)
    : null
  const primaryGuideScanDefinition = primaryGuideCampaign ? getScanDefinition(primaryGuideCampaign.scan_type) : null
  const primaryFirstNextStepScanDefinition = primaryFirstNextStepCampaign
    ? getScanDefinition(primaryFirstNextStepCampaign.scan_type)
    : null
  const primaryOverviewCampaign = primaryFirstNextStepCampaign ?? primaryGuideCampaign
  const primaryOverviewDefinition = primaryOverviewCampaign ? getScanDefinition(primaryOverviewCampaign.scan_type) : null
  const portfolioTabs = portfolioBuckets
    .filter((bucket) => bucket.entries.length > 0)
    .map((bucket) => {
      const firstEntryId = bucket.entries[0]?.campaign.campaign_id

      return {
        id: bucket.key,
        label: bucket.label,
        content: (
          <div className="space-y-4">
            {bucket.groups.map((group) => (
              <section key={group.key} className="space-y-3">
                {bucket.groups.length > 1 ? (
                  <div className="rounded-[22px] border border-[color:var(--border)] bg-[color:var(--bg)] px-4 py-4">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-[color:var(--ink)]">{group.title}</p>
                        <p className="mt-2 text-sm leading-6 text-[color:var(--text)]">{group.description}</p>
                      </div>
                      <DashboardChip label={getHomeStateMeta(group.key).label} tone={getHomeStateMeta(group.key).tone} />
                    </div>
                  </div>
                ) : null}
                <div className="space-y-3">
                  {group.entries.map((entry) => (
                    <CampaignRow
                      key={entry.campaign.campaign_id}
                      entry={entry}
                      showOnboarding={!isAdmin && bucket.key === 'ready' && entry.campaign.campaign_id === firstEntryId}
                      isAdmin={isAdmin}
                    />
                  ))}
                </div>
              </section>
            ))}
          </div>
        ),
      }
    })
  const portfolioView = portfolioTabs.some((tab) => tab.id === requestedPortfolioView)
    ? requestedPortfolioView
    : portfolioTabs[0]?.id ?? 'ready'

  return (
    <div className="space-y-6">
      <DashboardHero
        eyebrow="Overview"
        title={isAdmin ? 'Campagneoverzicht' : 'Eerste managementoverview'}
        description={
          isAdmin
            ? 'Zie eerst de kerncijfers, het portfoliobeeld en waar operations of managementread nu het eerst aandacht vraagt. Verdiep daarna pas via beheer of campaignroutes.'
            : 'Zie eerst de kerncijfers, het hoofdsignaal en waar je als buyer het eerst moet kijken. Verdiep daarna via portfolio en campagne, niet via een lange stacked home.'
        }
        meta={
          <>
            <DashboardChip label={`${fullCount} managementduiding gereed`} tone="emerald" />
            <DashboardChip label={`${partialCount} deels zichtbaar`} tone={partialCount > 0 ? 'amber' : 'slate'} />
            <DashboardChip label={`${activeExecutionCount} uitvoering actief`} tone={activeExecutionCount > 0 ? 'amber' : 'slate'} />
            <DashboardChip
              label={avgSignal ? `${avgSignal}/10 gemiddeld signaal` : `${closedCount} rapport eerst`}
              tone={avgSignal ? 'emerald' : 'slate'}
            />
          </>
        }
        actions={
          isAdmin ? (
            <div className="flex flex-wrap items-center gap-2">
              <DashboardChip label="Beheeroverzicht" tone="slate" />
              <Link
                href="/beheer"
                className="inline-flex rounded-full border border-[color:var(--dashboard-frame-border)] bg-[color:var(--dashboard-ink)] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#1B2E45]"
              >
                Nieuwe campaign
              </Link>
            </div>
          ) : (
            <>
              <DashboardChip label="Klantdashboard" tone="slate" />
              {primaryOverviewCampaign ? (
                <Link
                  href={`/campaigns/${primaryOverviewCampaign.campaign_id}`}
                  className="inline-flex rounded-full border border-[color:var(--dashboard-accent-soft-border)] bg-[color:var(--dashboard-accent-soft)] px-4 py-2 text-sm font-semibold text-[color:var(--dashboard-accent-strong)] transition-colors hover:brightness-[0.98]"
                >
                  Open belangrijkste campaign
                </Link>
              ) : null}
            </>
          )
        }
        aside={
          <div className="space-y-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--muted)]">Hoofdsignaal</p>
              <p className="mt-2 text-base font-semibold text-[color:var(--ink)]">
                {primaryOverviewDefinition ? primaryOverviewDefinition.productName : 'Nog geen actieve campaign'}
              </p>
              <p className="mt-2 text-sm leading-6 text-[color:var(--text)]">
                {primaryOverviewCampaign
                  ? getOverviewHeadline({
                      campaign: primaryOverviewCampaign,
                      stateMeta: primaryGuideStateMeta,
                      isAdmin,
                      avgSignal,
                    })
                  : 'Zodra de eerste campaign live of leesbaar wordt, verschijnt hier automatisch de eerste buyer- of operationsread.'}
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
              <StatCell label="Management-ready" value={`${managementReadyCount}`} />
              <StatCell label="Setup of launch" value={`${setupCount}`} />
            </div>
          </div>
        }
      />

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.15fr),minmax(340px,0.85fr)]">
        <section className="rounded-[24px] border border-[color:var(--border)] bg-white p-5 shadow-[0_8px_24px_rgba(19,32,51,0.04)]">
          <div className="flex flex-col gap-3 border-b border-[color:var(--border)]/80 pb-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--muted)]">Trend in portfolio</p>
              <h2 className="mt-2 text-lg font-semibold text-[color:var(--ink)]">Waar veranderde de aandacht in de portfolio?</h2>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-[color:var(--text)]">
                Lees eerst wat al managementduiding draagt, wat nog slechts deels zichtbaar is en waar uitvoering of rapportdiscipline nog leidend blijft.
              </p>
            </div>
            <DashboardChip label="Compact trendbeeld" tone="slate" />
          </div>
          <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <DashboardPanel
              eyebrow="Managementduiding gereed"
              title={`${fullCount}`}
              body="Campagnes met genoeg respons en zichtbaarheid om dashboard, aanbevelingen en rapport echt als managementinstrument te gebruiken."
              tone="emerald"
            />
            <DashboardPanel
              eyebrow="Deels zichtbaar"
              title={`${partialCount}`}
              body="Campagnes waar de eerste veilige read open is, maar waar drivers of diepere patroonduiding nog bewust begrensd blijven."
              tone={partialCount > 0 ? 'amber' : 'slate'}
            />
            <DashboardPanel
              eyebrow="Uitvoering actief"
              title={`${activeExecutionCount}`}
              body="Campagnes in setup, launch, running of sparse responsopbouw. Hier ligt de nadruk nog op uitvoerdiscipline."
              tone={activeExecutionCount > 0 ? 'amber' : 'slate'}
            />
            <DashboardPanel
              eyebrow="Gesloten / rapport eerst"
              title={avgSignal ? `${avgSignal}/10` : closedCount > 0 ? `${closedCount}` : 'Nog leeg'}
              body={
                avgSignal
                  ? `Gemiddeld groepssignaal over campagnes met leesbare output. Gesloten campagnes: ${closedCount}. Gemiddelde respons: ${avgResponse}%.`
                  : campaigns.length === 0
                    ? 'Nog geen leesbare campaign in de omgeving.'
                    : `Campagnes waar rapport nu voorop staat: ${closedCount}. Gemiddelde respons: ${avgResponse}%.`
              }
              tone={avgSignal ? 'emerald' : 'slate'}
            />
          </div>
        </section>

        <section className="rounded-[24px] border border-[color:var(--border)] bg-[color:var(--surface)] p-5 shadow-[0_8px_24px_rgba(19,32,51,0.04)]">
          <div className="flex flex-col gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--muted)]">Waar eerst kijken</p>
              <h2 className="mt-2 text-lg font-semibold text-[color:var(--ink)]">Kies eerst de hoofdread, pas daarna de verdieping</h2>
              <p className="mt-2 text-sm leading-6 text-[color:var(--text)]">
                Home blijft compact: eerst signaleren wat nu telt, daarna openen via menu, tabs of campaignroute.
              </p>
            </div>

            {!isAdmin && primaryGuideCampaign && primaryExecutionState && primaryGuideScanDefinition ? (
              <div className="rounded-[22px] border border-[color:var(--border)] bg-[color:var(--bg)] p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--muted)]">Jouw uitvoerstatus</p>
                    <p className="mt-2 text-base font-semibold text-[color:var(--ink)]">{primaryExecutionState.currentStateLabel}</p>
                  </div>
                  <DashboardChip
                    label={primaryGuideStateMeta?.label ?? primaryExecutionState.currentStateLabel}
                    tone={primaryGuideStateMeta?.tone ?? (primaryExecutionState.dashboardVisible ? 'emerald' : 'amber')}
                  />
                </div>
                <div className="mt-4">
                  <CustomerLaunchControl
                    campaignName={primaryGuideCampaign.campaign_name}
                    campaignHref={`/campaigns/${primaryGuideCampaign.campaign_id}`}
                    campaignCtaLabel={primaryExecutionState.dashboardVisible ? 'Open campagne en dashboard' : 'Open uitvoerflow'}
                    productName={primaryGuideScanDefinition.productName}
                    productContext={primaryGuideScanDefinition.whatItIsText}
                    state={primaryExecutionState}
                  />
                </div>
              </div>
            ) : null}

            {showFirstNextStep && primaryFirstNextStepGuidance && primaryFirstNextStepScanDefinition ? (
              <div className="rounded-[22px] border border-[color:var(--border)] bg-[color:var(--bg)] p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--muted)]">First-next-step</p>
                    <p className="mt-2 text-base font-semibold text-[color:var(--ink)]">
                      {primaryFirstNextStepScanDefinition.productName}
                    </p>
                  </div>
                  <DashboardChip label={primaryFirstNextStepScanDefinition.productName} tone="slate" />
                </div>
                <div className="mt-4 grid gap-3">
                  {primaryFirstNextStepGuidance.cards.map((card) => (
                    <DashboardPanel
                      key={card.key}
                      eyebrow={
                        card.key === 'insight'
                          ? 'Inzicht'
                          : card.key === 'action'
                            ? 'Actie'
                            : 'Vervolg alleen indien nodig'
                      }
                      title={card.title}
                      body={card.body}
                      tone="slate"
                    />
                  ))}
                </div>
                <div className="mt-4 rounded-2xl border border-[color:var(--border)] bg-white px-4 py-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--muted)]">
                    Mogelijke vervolgroutes
                  </p>
                  <div className="mt-3 space-y-3">
                    {primaryFirstNextStepGuidance.followOnSuggestions.map((suggestion) => (
                      <div
                        key={suggestion.productLabel}
                        className="border-b border-[color:var(--border)]/70 pb-3 last:border-b-0 last:pb-0"
                      >
                        <p className="text-sm font-semibold text-[color:var(--ink)]">{suggestion.productLabel}</p>
                        <p className="mt-1 text-sm leading-6 text-[color:var(--text)]">{suggestion.when}</p>
                        <p className="mt-2 text-xs leading-5 text-[color:var(--muted)]">{suggestion.boundary}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : !showFirstNextStep && !isAdmin ? (
              <div className="rounded-[22px] border border-[color:var(--border)] bg-[color:var(--bg)] p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--muted)]">Eerste route</p>
                <div className="mt-4">
                  <ManagementReadGuide
                    scanType={primaryGuideCampaign?.scan_type ?? 'exit'}
                    hasMinDisplay={(primaryGuideCampaign?.total_completed ?? 0) >= 5}
                    hasEnoughData={(primaryGuideCampaign?.total_completed ?? 0) >= 10}
                  />
                </div>
              </div>
            ) : null}
          </div>
        </section>
      </div>

      {campaigns.length === 0 ? (
        isAdmin ? <AdminEmptyState /> : <ViewerEmptyState />
      ) : (
        <DashboardSection
          id="portfolio"
          eyebrow="Portfolio-navigatie"
          title="Verdiep daarna via portfolio en campagne"
          description="Home blijft overzicht-first. Gebruik daarna de tabs om alleen de relevante campagnelaag te openen, in plaats van alle statusgroepen onder elkaar te stapelen."
          aside={<DashboardChip label={`${campaigns.length} campagne${campaigns.length === 1 ? '' : 's'}`} tone="slate" />}
        >
          <DashboardTabs tabs={portfolioTabs} defaultTabId={portfolioView} />
        </DashboardSection>
      )}

      <DashboardSection
        eyebrow="Utilitylaag"
        title={isAdmin ? 'Operations en support' : 'Ondersteuning en rapportgebruik'}
        description={
          isAdmin
            ? 'Snelle routes voor setup, handoff en deliverybeheer. Deze laag ondersteunt de overview zonder de managementprioriteit erboven te verstoren.'
            : 'Gebruik deze laag voor ondersteuning, rapporttoegang en afstemming met Verisight. De primaire managementleesroute blijft hierboven.'
        }
        aside={<DashboardChip label={isAdmin ? 'Ops-tools' : 'Supportlaag'} tone="slate" />}
      >
        <div className="grid gap-4 lg:grid-cols-3">
          {isAdmin ? (
            <>
              <UtilityCard
                eyebrow="Setup"
                title="Beheer en campaignconfiguratie"
                body="Ga naar beheer voor nieuwe campagnes, respondentimport, klanttoegang en campaignsetup."
                href="/beheer"
                cta="Open beheer"
              />
              <UtilityCard
                eyebrow="Handoff"
                title="Contactaanvragen en leadcontext"
                body="Gebruik de leadlijst voor sales-to-delivery handoff, contactcontext en follow-up."
                href="/beheer/contact-aanvragen"
                cta="Open leadlijst"
              />
              <UtilityCard
                eyebrow="Action Center"
                title="ExitScan follow-through en dossiers"
                body="Open de shared Action Center-laag voor ExitScan om reviewdruk, expliciet eigenaarschap en dossier-first follow-through vanuit een bounded live consumer te beheren."
                href="/beheer/klantlearnings"
                cta="Open Action Center"
              />
            </>
          ) : (
            <>
              <DashboardPanel
                eyebrow="Rapportgebruik"
                title="Dashboard eerst, rapport als verdieping"
                body="Open eerst het dashboard voor de hoofdlijn. Gebruik daarna het rapport als boardroom-waardige samenvatting en vervolgdocument."
                tone="slate"
              />
              <DashboardPanel
                eyebrow="Support"
                title="Verisight beheert setup en reminders"
                body="Respondentimport, uitnodigingen en deliverycontrole blijven bewust in beheer. Jij gebruikt vooral de output voor managementduiding."
                tone="slate"
              />
              <DashboardPanel
                eyebrow="Volgende stap"
                title={primaryGuideCampaign ? 'Open je meest relevante campaign' : 'Wachten op livegang'}
                body={
                  primaryGuideCampaign
                    ? 'Gebruik overview en portfolio hierboven om direct naar de campaign te gaan die nu het meeste managementwaarde oplevert.'
                    : 'Zodra de eerste campagne live staat, verschijnen hier automatisch dashboard- en rapportacties.'
                }
                tone="slate"
              />
            </>
          )}
        </div>
      </DashboardSection>
    </div>
  )
}

function CampaignRow({
  entry,
  showOnboarding,
  isAdmin,
}: {
  entry: CampaignHomeEntry
  showOnboarding: boolean
  isAdmin: boolean
}) {
  const { campaign, state } = entry
  const scanDefinition = getScanDefinition(campaign.scan_type)
  const stateMeta = getHomeStateMeta(state)
  const ctaLabel = isAdmin && state === 'setup' ? 'Naar setup' : stateMeta.viewerCta

  return (
    <div className="rounded-[28px] border border-[color:var(--dashboard-frame-border)] bg-[color:var(--dashboard-surface)] px-4 py-4 shadow-[0_18px_40px_rgba(17,24,39,0.07)]">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between xl:gap-6">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <DashboardChip label={scanDefinition.productName} tone="slate" />
            <DashboardChip label={campaign.is_active ? 'Actief' : 'Gesloten'} tone={campaign.is_active ? 'emerald' : 'slate'} />
            <DashboardChip label={stateMeta.label} tone={stateMeta.tone} />
          </div>
          <h2 className="mt-3 text-lg font-semibold text-[color:var(--ink)]">{campaign.campaign_name}</h2>
          <p className="mt-2 text-sm leading-6 text-[color:var(--text)]">{stateMeta.body}</p>
          <p className="mt-2 text-sm leading-6 text-[color:var(--muted)]">{stateMeta.trust}</p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 xl:min-w-[420px] xl:grid-cols-2 2xl:min-w-[560px] 2xl:grid-cols-4">
          <StatCell label="Respons" value={`${campaign.completion_rate_pct ?? 0}%`} />
          <StatCell label="Ingevuld" value={`${campaign.total_completed}`} />
          <StatCell label="Uitgenodigd" value={`${campaign.total_invited}`} />
          <StatCell
            label={`Gem. ${scanDefinition.signalLabelLower}`}
            value={campaign.avg_risk_score !== null ? `${campaign.avg_risk_score.toFixed(1)}/10` : '-'}
          />
        </div>
      </div>

      <div className="mt-4 flex flex-col gap-3 border-t border-[color:var(--border)]/80 pt-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap items-center gap-2 text-sm">
          <span className="rounded-full bg-[color:var(--dashboard-soft)] px-3 py-1 font-medium text-[color:var(--dashboard-text)]">
            {stateMeta.nextStepLabel}
          </span>
          <span className="text-[color:var(--muted)]">•</span>
          <span className="text-[color:var(--text)]">
            Uitnodigingen {campaign.total_invited} • Banden hoog/midden/laag: {campaign.band_high}/{campaign.band_medium}/{campaign.band_low}
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {isAdmin && state === 'setup' ? (
            <Link
              href="/beheer"
              className="inline-flex rounded-full border border-[color:var(--dashboard-frame-border)] bg-[color:var(--dashboard-soft)] px-4 py-2 text-sm font-semibold text-[color:var(--dashboard-ink)] transition-colors hover:border-[color:var(--dashboard-accent-soft-border)] hover:text-[color:var(--dashboard-accent-strong)]"
            >
              Naar setup
            </Link>
          ) : null}
          <div className="relative">
            {showOnboarding ? <OnboardingBalloon step={1} label="Open je campagne" align="left" /> : null}
            <Link
              href={`/campaigns/${campaign.campaign_id}`}
              className="inline-flex rounded-full border border-[color:var(--dashboard-accent-soft-border)] bg-[color:var(--dashboard-accent-soft)] px-4 py-2 text-sm font-semibold text-[color:var(--dashboard-accent-strong)] transition-colors hover:brightness-[0.98]"
            >
              {ctaLabel}
            </Link>
          </div>
          {isAdmin || state === 'full' || state === 'closed' ? (
            <PdfDownloadButton campaignId={campaign.campaign_id} campaignName={campaign.campaign_name} />
          ) : null}
        </div>
      </div>
    </div>
  )
}

function UtilityCard({
  eyebrow,
  title,
  body,
  href,
  cta,
}: {
  eyebrow: string
  title: string
  body: string
  href: string
  cta: string
}) {
  return (
    <div className="rounded-[28px] border border-[color:var(--dashboard-frame-border)] bg-[color:var(--dashboard-surface)] p-5 shadow-[0_18px_40px_rgba(17,24,39,0.07)]">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--muted)]">{eyebrow}</p>
      <p className="mt-2 text-base font-semibold text-[color:var(--ink)]">{title}</p>
      <p className="mt-3 text-sm leading-6 text-[color:var(--text)]">{body}</p>
      <Link
        href={href}
        className="mt-4 inline-flex rounded-full border border-[color:var(--dashboard-frame-border)] bg-[color:var(--dashboard-soft)] px-4 py-2 text-sm font-semibold text-[color:var(--dashboard-ink)] transition-colors hover:border-[color:var(--dashboard-accent-soft-border)] hover:text-[color:var(--dashboard-accent-strong)]"
      >
        {cta}
      </Link>
    </div>
  )
}

function StatCell({ label, value }: { label: string; value: string }) {
  const helpText =
    label.startsWith('Gem.')
      ? 'Dit is het gemiddelde groepssignaal op een schaal van 1-10. Beweeg met je muis over het informatie-icoon om te zien hoe je deze score moet lezen.'
      : label === 'Respons'
        ? 'Het percentage uitgenodigde respondenten dat de survey volledig heeft ingevuld.'
        : label === 'Ingevuld'
          ? 'Het aantal respondenten dat de survey volledig heeft afgerond.'
          : label === 'Uitgenodigd'
            ? 'Het totale aantal respondenten dat aan deze campaign is gekoppeld.'
            : null

  return (
    <div className="rounded-[22px] border border-[color:var(--dashboard-frame-border)] bg-[color:var(--dashboard-soft)] px-4 py-3">
      <div className="flex items-center gap-1.5">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--muted)]">{label}</p>
        {helpText ? <InfoTooltip text={helpText} /> : null}
      </div>
      <p className="mt-2 text-lg font-semibold text-[color:var(--ink)]">{value}</p>
    </div>
  )
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
      counts.set(
        campaign.campaign_id,
        campaign.total_invited === 0 ? 0 : campaign.total_completed >= 5 ? 0 : 1,
      )
    }
  }

  return counts
}

function getPrimaryGuideCampaign(entries: CampaignHomeEntry[]): CampaignHomeEntry | null {
  if (entries.length === 0) return null

  const priority: Record<CampaignCompositionState, number> = {
    setup: 0,
    ready_to_launch: 1,
    running: 2,
    sparse: 3,
    partial: 4,
    full: 5,
    closed: 6,
  }

  return [...entries].sort((left, right) => {
    const priorityDelta = priority[left.state] - priority[right.state]
    if (priorityDelta !== 0) return priorityDelta
    return new Date(right.campaign.created_at).getTime() - new Date(left.campaign.created_at).getTime()
  })[0] ?? null
}

function getPrimaryFirstNextStepCampaign(
  activeCampaigns: CampaignStats[],
  allCampaigns: CampaignStats[],
): CampaignStats | null {
  const candidatePool = activeCampaigns.length > 0 ? activeCampaigns : allCampaigns
  const eligibleCampaigns = candidatePool.filter(
    (campaign) => campaign.total_completed >= FIRST_INSIGHT_THRESHOLD,
  )

  if (eligibleCampaigns.length === 0) return null

  return [...eligibleCampaigns].sort((left, right) => {
    if (left.is_active !== right.is_active) {
      return left.is_active ? -1 : 1
    }

    return new Date(right.created_at).getTime() - new Date(left.created_at).getTime()
  })[0] ?? null
}

function groupCampaigns(entries: CampaignHomeEntry[]): CampaignGroup[] {
  return HOME_STATE_ORDER.map((state) => {
    const meta = getHomeStateMeta(state)
    return {
      key: state,
      title: meta.sectionTitle,
      description: meta.sectionDescription,
      entries: entries.filter((entry) => entry.state === state),
    }
  })
}

function buildPortfolioBuckets(groups: CampaignGroup[]): PortfolioBucket[] {
  const definitions: Array<{ key: DashboardPortfolioView; label: string; states: CampaignCompositionState[] }> = [
    { key: 'ready', label: 'Management-ready', states: ['full', 'partial'] },
    { key: 'building', label: 'In opbouw', states: ['sparse', 'running', 'ready_to_launch'] },
    { key: 'setup', label: 'Setup of launch', states: ['setup'] },
    { key: 'closed', label: 'Afgerond', states: ['closed'] },
  ]

  return definitions.map((definition) => {
    const bucketGroups = groups.filter((group) => definition.states.includes(group.key))
    return {
      key: definition.key,
      label: definition.label,
      groups: bucketGroups.filter((group) => group.entries.length > 0),
      entries: bucketGroups.flatMap((group) => group.entries),
    }
  })
}

function getHomeStateMeta(state: CampaignCompositionState) {
  const meta = {
    setup: {
      label: 'Nog niet live',
      tone: 'amber' as const,
      nextStepLabel: 'Setup eerst',
      viewerCta: 'Open uitvoerflow',
      sectionTitle: 'Setup / nog niet live',
      sectionDescription:
        'Campagnes zonder live uitnodigingen of zonder echte respondentlaag. Hier hoort eerst setupdiscipline te landen.',
      body: 'Deze campaign vraagt eerst respondentimport of launchcontrole voordat er eerlijke output kan ontstaan.',
      trust:
        'Laat deze status operationeel voelen. Dashboard en rapport horen hier nog geen managementgewicht te suggereren.',
    },
    ready_to_launch: {
      label: 'Launch klaar',
      tone: 'amber' as const,
      nextStepLabel: 'Invites versturen',
      viewerCta: 'Open uitvoerflow',
      sectionTitle: 'Ready to launch',
      sectionDescription:
        'Campagnes waar de respondentlaag klaarstaat, maar waar uitnodigingen nog niet volledig live zijn gezet.',
      body: 'Respondenten staan klaar, maar de inviteflow is nog niet volledig gestart.',
      trust:
        'Dashboard en rapport blijven bewust dicht tot de uitnodigingen echt live zijn en de eerste veilige responsgrens dichterbij komt.',
    },
    running: {
      label: 'Invites live',
      tone: 'amber' as const,
      nextStepLabel: 'Respons volgen',
      viewerCta: 'Open uitvoerflow',
      sectionTitle: 'Invites live / running',
      sectionDescription:
        'Campagnes waar uitnodigingen lopen, maar waar nog geen eerste veilige responslaag zichtbaar hoort te worden.',
      body: 'De inviteflow loopt, maar er is nog geen eerste veilige responslaag om inhoudelijk op te lezen.',
      trust:
        'Toon hier alleen uitvoerstatus en responsopbouw. Dit is nog geen managementduiding.',
    },
    sparse: {
      label: 'Indicatief, nog dun',
      tone: 'amber' as const,
      nextStepLabel: 'Meer respons nodig',
      viewerCta: 'Open uitvoerflow',
      sectionTitle: 'Sparse / indicatief',
      sectionDescription:
        'Campagnes met eerste responses, maar nog onder de veilige dashboarddrempel voor een eerlijke managementduiding.',
      body: 'Er zijn eerste responses binnen, maar het beeld is nog te dun voor een veilige dashboardlaag.',
      trust:
        'Gebruik dit als signaal dat uitvoering loopt, niet als inhoudelijke conclusie of pseudo-insight.',
    },
    partial: {
      label: 'Deels zichtbaar',
      tone: 'amber' as const,
      nextStepLabel: 'Compacte read',
      viewerCta: 'Open compacte read',
      sectionTitle: 'Deels zichtbaar',
      sectionDescription:
        'Campagnes waar de eerste veilige dashboardread open is, maar waar thresholds of privacy de verdiepingslaag nog begrenzen.',
      body: 'De eerste dashboardread is zichtbaar, maar aanbevelingen en patroonduiding blijven nog bewust compact.',
      trust:
        'Privacy- en thresholdgrenzen houden drivers, aanbevelingen en diepere claims nog deels dicht.',
    },
    full: {
      label: 'Managementduiding gereed',
      tone: 'emerald' as const,
      nextStepLabel: 'Open dashboard',
      viewerCta: 'Open dashboard',
      sectionTitle: 'Volledig / managementduiding gereed',
      sectionDescription:
        'Campagnes met genoeg respons en voldoende zichtbaarheid om dashboard, aanbevelingen en rapport als managementinstrument te gebruiken.',
      body: 'Dashboard en rapport zijn nu stevig genoeg voor managementduiding, prioritering en eerste vervolgactie.',
      trust:
        'Aanbevelingen en vervolgrails mogen nu zichtbaar worden binnen de bestaande productgrenzen en shared grammar.',
    },
    closed: {
      label: 'Rapport eerst',
      tone: 'slate' as const,
      nextStepLabel: 'Rapport eerst',
      viewerCta: 'Open rapport en dashboard',
      sectionTitle: 'Gesloten / rapport eerst',
      sectionDescription:
        'Gesloten campagnes waar de nadruk nu op rapportage, terugblik en bestuurlijke opvolging hoort te liggen.',
      body: 'Deze campaign is gesloten. Gebruik dashboard en rapport nu voor terugblik, follow-up en het vervolggesprek.',
      trust:
        'Geen live uitvoersignalen meer: de waarde zit nu in rapportage, context en de gekozen vervolgrichting.',
    },
  } satisfies Record<
    CampaignCompositionState,
    {
      label: string
      tone: 'slate' | 'blue' | 'emerald' | 'amber'
      nextStepLabel: string
      viewerCta: string
      sectionTitle: string
      sectionDescription: string
      body: string
      trust: string
    }
  >

  return meta[state]
}

function getOverviewHeadline({
  campaign,
  stateMeta,
  isAdmin,
  avgSignal,
}: {
  campaign: CampaignStats
  stateMeta: ReturnType<typeof getHomeStateMeta> | null
  isAdmin: boolean
  avgSignal: string | null
}) {
  if (!campaign.is_active) {
    return 'De hoofdread zit nu in rapportage, bestuurlijke follow-up en het voorbereiden van het vervolggesprek.'
  }

  if (campaign.total_invited === 0) {
    return isAdmin
      ? 'De eerstvolgende stap ligt nog in setup of launchdiscipline voordat managementwaarde zichtbaar wordt.'
      : 'De eerstvolgende stap ligt nog in bounded uitvoering voordat dashboard of rapport de hoofdroute wordt.'
  }

  if (stateMeta?.label === 'Deels zichtbaar') {
    return 'Er ligt al een eerste dashboardread, maar de verdiepingslaag blijft nog bewust compact tot thresholds en patroonsterkte verder zijn opgebouwd.'
  }

  if (campaign.total_completed < 5) {
    return avgSignal
      ? `Het portfolio bouwt nog respons op. Het leesbare gemiddelde staat nu op ${avgSignal}/10, maar de managementread blijft nog bewust voorzichtig.`
      : 'De portfolio bouwt nog respons op. Lees dus eerst richting en voortgang, nog niet te zwaar de duiding.'
  }

  return avgSignal
    ? `Er ligt nu een leesbare managementread. Het gemiddelde groepssignaal in het portfolio staat op ${avgSignal}/10.`
    : 'Er ligt nu een leesbare managementread. Gebruik home voor de hoofdlijn en open daarna de campagne voor verdieping.'
}

function AdminEmptyState() {
  return (
    <DashboardSection
      eyebrow="Setup"
      title="Nog geen campagnes beschikbaar"
      description="De cockpit wordt vanzelf gevuld zodra je een organisatie, campaign en respondentbestand hebt toegevoegd."
    >
      <div className="grid gap-4 md:grid-cols-3">
        <DashboardPanel
          eyebrow="Stap 1"
          title="Organisatie"
          body="Maak eerst de klantorganisatie aan en leg het contactpunt vast."
          tone="slate"
        />
        <DashboardPanel
          eyebrow="Stap 2"
          title="Campaign"
          body="Kies ExitScan of RetentieScan en zet de campaign op met de juiste metadata."
          tone="slate"
        />
        <DashboardPanel
          eyebrow="Stap 3"
          title="Respondenten"
          body="Importeer respondenten en stuur uitnodigingen, zodat de cockpit vanzelf in monitoring overgaat."
          tone="slate"
        />
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
      description="Verisight zet de campaign op, controleert de import en activeert daarna automatisch dit overzicht."
    >
      <div className="space-y-4">
        <div className="rounded-[22px] border border-[color:var(--border)] bg-[color:var(--bg)] px-4 py-5 text-sm leading-6 text-[color:var(--text)]">
          Zodra de eerste responses binnenkomen, verschijnen hier automatisch je campagnes, status en rapportacties.
        </div>
        <div className="grid gap-3 md:grid-cols-3">
          {[
            'Verisight beheert organisatie, campaign en respondentimport.',
            'Jij krijgt daarna toegang tot het juiste dashboard en rapport.',
            'De eerste managementwaarde zit in lezen, duiden en prioriteren, niet in technische setup.',
          ].map((item, index) => (
            <div
              key={item}
              className="rounded-2xl border border-[color:var(--border)] bg-white px-4 py-4 text-sm leading-6 text-[color:var(--text)]"
            >
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--muted)]">Stap {index + 1}</p>
              <p className="mt-2">{item}</p>
            </div>
          ))}
        </div>
      </div>
    </DashboardSection>
  )
}

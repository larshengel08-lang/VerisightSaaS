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
import { normalizeDashboardPortfolioView } from '@/lib/dashboard/shell-navigation'
import { createClient } from '@/lib/supabase/server'
import { getFirstNextStepGuidance } from '@/lib/client-onboarding'
import { buildGuidedSelfServeState, deriveGuidedSelfServeDiscipline } from '@/lib/guided-self-serve'
import { FIRST_INSIGHT_THRESHOLD } from '@/lib/response-activation'
import { getScanDefinition } from '@/lib/scan-definitions'
import type { CampaignStats } from '@/lib/types'

type CampaignGroup = {
  key: CampaignBucket
  title: string
  description: string
  campaigns: CampaignStats[]
}

type CampaignBucket = 'ready' | 'building' | 'setup' | 'closed'

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
  const groups = groupCampaigns(campaigns)
  const activeCampaigns = campaigns.filter((campaign) => campaign.is_active)
  const primaryGuideCampaign = getPrimaryGuideCampaign(activeCampaigns, campaigns)
  const primaryFirstNextStepCampaign = getPrimaryFirstNextStepCampaign(activeCampaigns, campaigns)
  const { data: primaryGuideRespondentsRaw } = primaryGuideCampaign
    ? await supabase
        .from('respondents')
        .select('sent_at, completed')
        .eq('campaign_id', primaryGuideCampaign.campaign_id)
    : { data: [] }
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
  const primaryGuideRespondents = (primaryGuideRespondentsRaw ?? []) as Array<{
    sent_at: string | null
    completed: boolean
  }>
  const primaryGuideSetupDiscipline = deriveGuidedSelfServeDiscipline(
    ((primaryGuideCheckpointsRaw ?? []) as Array<{
      checkpoint_key: 'implementation_intake' | 'import_qa' | 'invite_readiness'
      manual_state: 'pending' | 'confirmed' | 'not_applicable'
    }>).map((checkpoint) => ({
      checkpointKey: checkpoint.checkpoint_key,
      manualState: checkpoint.manual_state,
    })),
  )
  const primaryGuideInvitesNotSent = primaryGuideRespondents.filter(
    (respondent) => !respondent.sent_at && !respondent.completed,
  ).length
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
  const readyCount = campaigns.filter((campaign) => getCampaignBucket(campaign) === 'ready').length
  const buildingCount = campaigns.filter((campaign) => getCampaignBucket(campaign) === 'building').length
  const setupCount = campaigns.filter((campaign) => getCampaignBucket(campaign) === 'setup').length
  const closedCount = campaigns.filter((campaign) => getCampaignBucket(campaign) === 'closed').length
  const primaryExecutionState = primaryGuideCampaign
    ? buildGuidedSelfServeState({
        isActive: primaryGuideCampaign.is_active,
        totalInvited: primaryGuideCampaign.total_invited,
        totalCompleted: primaryGuideCampaign.total_completed,
        invitesNotSent:
          primaryGuideRespondents.length > 0
            ? primaryGuideInvitesNotSent
            : primaryGuideCampaign.total_invited === 0
              ? 0
              : primaryGuideCampaign.total_completed >= 5
                ? 0
                : 1,
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
  const portfolioTabs = groups
    .filter((group) => group.campaigns.length > 0)
    .map((group) => ({
      id: group.key,
      label: getPortfolioTabLabel(group.key),
      content: (
        <div className="space-y-3">
          {group.campaigns.map((campaign, index) => (
            <CampaignRow
              key={campaign.campaign_id}
              campaign={campaign}
              showOnboarding={!isAdmin && group.key === 'ready' && index === 0}
              isAdmin={isAdmin}
            />
          ))}
        </div>
      ),
    }))
  const portfolioView = portfolioTabs.some((tab) => tab.id === requestedPortfolioView)
    ? requestedPortfolioView
    : (portfolioTabs[0]?.id as CampaignBucket | undefined) ?? 'ready'

  return (
    <div className="space-y-6">
      <DashboardHero
        eyebrow="Overview"
        title={isAdmin ? 'Campaign overview' : 'Eerste managementoverview'}
        description={
          isAdmin
            ? 'Zie eerst de kerncijfers, het portfoliobeeld en waar operations of managementread nu het eerst aandacht vraagt. Verdiep daarna pas via beheer of campaignroutes.'
            : 'Zie eerst de kerncijfers, het hoofdsignaal en waar je als buyer het eerst moet kijken. Verdiep daarna via portfolio en campagne, niet via een lange stacked home.'
        }
        meta={
          <>
            <DashboardChip label={`${readyCount} management-ready`} tone="blue" />
            <DashboardChip label={`${buildingCount} in opbouw`} tone={buildingCount > 0 ? 'amber' : 'slate'} />
            <DashboardChip label={`${avgResponse}% gemiddelde respons`} tone="slate" />
            <DashboardChip
              label={avgSignal ? `${avgSignal}/10 gemiddeld signaal` : `${closedCount} afgerond`}
              tone={avgSignal ? 'emerald' : 'slate'}
            />
          </>
        }
        actions={
          isAdmin ? (
            <div className="flex flex-wrap items-center gap-2">
              <DashboardChip label="Operations cockpit" tone="blue" />
              <Link
                href="/beheer"
                className="inline-flex rounded-full bg-[color:var(--ink)] px-4 py-2 text-sm font-semibold text-[color:var(--bg)] transition-colors hover:bg-[#1B2E45]"
              >
                Nieuwe campaign
              </Link>
            </div>
          ) : (
            <>
              <DashboardChip label="Klantdashboard" tone="emerald" />
              {primaryOverviewCampaign ? (
                <Link
                  href={`/campaigns/${primaryOverviewCampaign.campaign_id}`}
                  className="inline-flex rounded-full border border-[#d6e4e8] bg-[#f3f8f8] px-4 py-2 text-sm font-semibold text-[#234B57] transition-colors hover:border-[#bfd3d8] hover:bg-[#e9f2f3]"
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
                      isAdmin,
                      avgSignal,
                    })
                  : 'Zodra de eerste campaign live of leesbaar wordt, verschijnt hier automatisch de eerste buyer- of operationsread.'}
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
              <StatCell label="Management-ready" value={`${readyCount}`} />
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
                Lees eerst hoeveel campagnes al managementwaardig zijn, welke nog in opbouw zijn en waar setup of bounded uitvoering nog voorrang heeft.
              </p>
            </div>
            <DashboardChip label="Compact trendbeeld" tone="slate" />
          </div>
          <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <DashboardPanel
              eyebrow="Management-ready"
              title={`${readyCount}`}
              body="Campagnes met genoeg respons om dashboard en rapport bestuurlijk te gebruiken."
              tone="blue"
            />
            <DashboardPanel
              eyebrow="In opbouw"
              title={`${buildingCount}`}
              body="Responses lopen al, maar de managementread blijft nog voorzichtig en indicatief."
              tone={buildingCount > 0 ? 'amber' : 'slate'}
            />
            <DashboardPanel
              eyebrow="Setup"
              title={`${setupCount}`}
              body="Hier ligt de eerstvolgende delivery- of launchstap nog vóór de managementread."
              tone={setupCount > 0 ? 'amber' : 'slate'}
            />
            <DashboardPanel
              eyebrow="Portfolio"
              title={avgSignal ? `${avgSignal}/10` : closedCount > 0 ? `${closedCount}` : 'Nog leeg'}
              body={
                avgSignal
                  ? `Gemiddeld groepssignaal over leesbare campagnes. Gemiddelde respons: ${avgResponse}%.`
                  : campaigns.length === 0
                    ? 'Nog geen leesbare campaign in de omgeving.'
                    : `Gesloten of nog niet leesbare campagnes in portfolio: ${closedCount}. Gemiddelde respons: ${avgResponse}%.`
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
                  <DashboardChip label={primaryGuideScanDefinition.productName} tone="blue" />
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
              <div className="rounded-[22px] border border-[#d6e4e8] bg-[#f3f8f8] p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#234B57]">First-next-step</p>
                    <p className="mt-2 text-base font-semibold text-[color:var(--ink)]">
                      {primaryFirstNextStepScanDefinition.productName}
                    </p>
                  </div>
                  <DashboardChip label="Bounded portfolio" tone="slate" />
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
                      tone={card.key === 'insight' ? 'blue' : card.key === 'action' ? 'emerald' : 'amber'}
                    />
                  ))}
                </div>
                <div className="mt-4 rounded-2xl border border-white/80 bg-white px-4 py-4">
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
                eyebrow="Learning"
                title="Klantlearnings en workbench"
                body="Leg buyer-signalen, implementationlessen en vervolgkeuzes vast zodra een campagne leerwaarde oplevert."
                href="/beheer/klantlearnings"
                cta="Open learning-workbench"
              />
            </>
          ) : (
            <>
              <DashboardPanel
                eyebrow="Rapportgebruik"
                title="Dashboard eerst, rapport als verdieping"
                body="Open eerst het dashboard voor de hoofdlijn. Gebruik daarna het rapport als boardroom-waardige samenvatting en vervolgdocument."
                tone="blue"
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
                tone="emerald"
              />
            </>
          )}
        </div>
      </DashboardSection>
    </div>
  )
}

function CampaignRow({
  campaign,
  showOnboarding,
  isAdmin,
}: {
  campaign: CampaignStats
  showOnboarding: boolean
  isAdmin: boolean
}) {
  const scanDefinition = getScanDefinition(campaign.scan_type)
  const nextAction = getNextAction(campaign)
  const readiness = getCampaignReadiness(campaign)

  return (
    <div className="rounded-[22px] border border-[color:var(--border)] bg-white px-4 py-4 shadow-[0_6px_18px_rgba(19,32,51,0.04)]">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <DashboardChip label={scanDefinition.productName} tone={campaign.scan_type === 'retention' ? 'emerald' : 'blue'} />
            <DashboardChip label={campaign.is_active ? 'Actief' : 'Gesloten'} tone={campaign.is_active ? 'emerald' : 'slate'} />
            <DashboardChip label={readiness.label} tone={readiness.tone} />
          </div>
          <h2 className="mt-3 text-lg font-semibold text-[color:var(--ink)]">{campaign.campaign_name}</h2>
          <p className="mt-2 text-sm leading-6 text-[color:var(--text)]">{readiness.body}</p>
          <p className="mt-2 text-sm leading-6 text-[color:var(--text)]">{nextAction.body}</p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 xl:min-w-[420px] xl:grid-cols-4">
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
          <span className="rounded-full border border-[color:var(--border)] bg-[color:var(--bg)] px-3 py-1 font-medium text-[color:var(--text)]">
            {nextAction.label}
          </span>
          <span className="text-[color:var(--muted)]">•</span>
          <span className="text-[color:var(--text)]">
            Uitnodigingen {campaign.total_invited} • Banden hoog/midden/laag: {campaign.band_high}/{campaign.band_medium}/{campaign.band_low}
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {isAdmin && getCampaignBucket(campaign) === 'setup' ? (
            <Link
              href="/beheer"
              className="inline-flex rounded-full border border-[color:var(--border)] bg-[color:var(--bg)] px-4 py-2 text-sm font-semibold text-[color:var(--ink)] transition-colors hover:border-[#d6e4e8] hover:text-[#234B57]"
            >
              Naar setup
            </Link>
          ) : null}
          <div className="relative">
            {showOnboarding ? <OnboardingBalloon step={1} label="Open je campagne" align="left" /> : null}
            <Link
              href={`/campaigns/${campaign.campaign_id}`}
              className="inline-flex rounded-full border border-[#d6e4e8] bg-[#f3f8f8] px-4 py-2 text-sm font-semibold text-[#234B57] transition-colors hover:border-[#bfd3d8] hover:bg-[#e9f2f3]"
            >
              {!isAdmin && getCampaignBucket(campaign) !== 'ready' ? 'Open uitvoerflow' : 'Open dashboard'}
            </Link>
          </div>
          {isAdmin || getCampaignBucket(campaign) === 'ready' || getCampaignBucket(campaign) === 'closed' ? (
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
    <div className="rounded-[22px] border border-[color:var(--border)] bg-white p-4 shadow-[0_6px_18px_rgba(19,32,51,0.04)]">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--muted)]">{eyebrow}</p>
      <p className="mt-2 text-base font-semibold text-[color:var(--ink)]">{title}</p>
      <p className="mt-3 text-sm leading-6 text-[color:var(--text)]">{body}</p>
      <Link
        href={href}
        className="mt-4 inline-flex rounded-full border border-[color:var(--border)] bg-[color:var(--bg)] px-4 py-2 text-sm font-semibold text-[color:var(--ink)] transition-colors hover:border-[#d6e4e8] hover:text-[#234B57]"
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
    <div className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--bg)] px-4 py-3">
      <div className="flex items-center gap-1.5">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--muted)]">{label}</p>
        {helpText ? <InfoTooltip text={helpText} /> : null}
      </div>
      <p className="mt-2 text-lg font-semibold text-[color:var(--ink)]">{value}</p>
    </div>
  )
}

function getNextAction(campaign: CampaignStats) {
  if (!campaign.is_active) {
    return {
      label: 'Rapport beschikbaar',
      body: 'Deze campagne is gesloten. Gebruik dashboard en rapport nu vooral voor terugblik, bestuurlijke follow-up en het voorbereiden van het vervolggesprek.',
    }
  }

  if (campaign.total_invited === 0) {
    return {
      label: 'Respondenten toevoegen',
      body: 'De campaign bestaat al, maar zonder respondenten blijft de cockpit leeg. Dit is nu de eerstvolgende operationele stap.',
    }
  }

  if ((campaign.completion_rate_pct ?? 0) < 20) {
    return {
      label: 'Respons opbouwen',
      body: 'De response is nog laag. Focus nu op uitnodigingen, reminders en genoeg basis voor een veilige eerste lezing.',
    }
  }

  if (campaign.total_completed < 10) {
    return {
      label: 'Nog indicatief',
      body: 'Er zijn al responses binnen, maar nog niet genoeg voor een stevig patroonbeeld. Gebruik de output nu vooral om richting vast te houden.',
    }
  }

  return {
    label: 'Klaar voor verdieping',
    body: 'De campaign heeft genoeg respons om actief te sturen op managementduiding, prioritering en rapportage.',
  }
}

function getCampaignBucket(campaign: CampaignStats): CampaignBucket {
  if (!campaign.is_active) return 'closed'
  if (campaign.total_invited === 0) return 'setup'
  if (campaign.total_completed < 5) return 'building'
  return 'ready'
}

function getPrimaryGuideCampaign(activeCampaigns: CampaignStats[], allCampaigns: CampaignStats[]): CampaignStats | null {
  const candidatePool = activeCampaigns.length > 0 ? activeCampaigns : allCampaigns
  if (candidatePool.length === 0) return null

  return [...candidatePool].sort((left, right) => {
    const priorityDelta = getExecutionPriority(left) - getExecutionPriority(right)
    if (priorityDelta !== 0) return priorityDelta
    return new Date(right.created_at).getTime() - new Date(left.created_at).getTime()
  })[0] ?? null
}

function getPrimaryFirstNextStepCampaign(
  activeCampaigns: CampaignStats[],
  allCampaigns: CampaignStats[],
): CampaignStats | null {
  const candidatePool = activeCampaigns.length > 0 ? activeCampaigns : allCampaigns
  const eligibleCampaigns = candidatePool.filter((campaign) => campaign.total_completed >= FIRST_INSIGHT_THRESHOLD)

  if (eligibleCampaigns.length === 0) return null

  return [...eligibleCampaigns].sort((left, right) => {
    if (left.is_active !== right.is_active) {
      return left.is_active ? -1 : 1
    }

    return new Date(right.created_at).getTime() - new Date(left.created_at).getTime()
  })[0] ?? null
}

function getExecutionPriority(campaign: CampaignStats) {
  const bucket = getCampaignBucket(campaign)
  if (bucket === 'setup') return 0
  if (bucket === 'building') return 1
  if (bucket === 'ready') return 2
  return 3
}

function getCampaignReadiness(campaign: CampaignStats) {
  const bucket = getCampaignBucket(campaign)

  if (bucket === 'closed') {
    return {
      label: 'Gesloten campaign',
      body: 'De primaire waarde zit nu in rapportage, managementfollow-up en het expliciet vastleggen van de vervolgrichting.',
      tone: 'slate' as const,
    }
  }

  if (bucket === 'setup') {
    return {
      label: 'Nog niet live',
      body: 'Deze campaign vraagt eerst setup, respondentimport of launchcontrole voordat de cockpit richting managementwaarde kan bewegen.',
      tone: 'amber' as const,
    }
  }

  if (bucket === 'building') {
    return {
      label: 'Respons bouwt nog op',
      body: 'De campaign leeft al, maar het patroonbeeld is nog in ontwikkeling. Houd de route scherp zonder al te zwaar te concluderen.',
      tone: 'amber' as const,
    }
  }

  return {
    label: 'Klaar voor managementread',
    body: 'De campaign heeft genoeg basis om dashboard en rapport echt als managementinstrument te gebruiken.',
    tone: 'blue' as const,
  }
}

function groupCampaigns(campaigns: CampaignStats[]): CampaignGroup[] {
  return [
    {
      key: 'ready',
      title: 'Klaar voor managementread',
      description: 'Campagnes met genoeg respons om dashboard en rapport actief te gebruiken voor duiding, prioritering en follow-up.',
      campaigns: campaigns.filter((campaign) => getCampaignBucket(campaign) === 'ready'),
    },
    {
      key: 'building',
      title: 'Nog in opbouw',
      description: 'Campagnes waar al responses binnenkomen, maar waar het patroonbeeld nog eerst steviger moet worden.',
      campaigns: campaigns.filter((campaign) => getCampaignBucket(campaign) === 'building'),
    },
    {
      key: 'setup',
      title: 'Setup of launch nodig',
      description: 'Campagnes die nog eerst respondentimport, uitnodiging of launchcontrole nodig hebben voordat managementwaarde zichtbaar wordt.',
      campaigns: campaigns.filter((campaign) => getCampaignBucket(campaign) === 'setup'),
    },
    {
      key: 'closed',
      title: 'Afgerond en gesloten',
      description: 'Gesloten campagnes die nu vooral waarde leveren voor rapportage, terugblik en vervolgbesluiten.',
      campaigns: campaigns.filter((campaign) => getCampaignBucket(campaign) === 'closed'),
    },
  ]
}

function getPortfolioTabLabel(key: CampaignBucket) {
  if (key === 'ready') return 'Management-ready'
  if (key === 'building') return 'In opbouw'
  if (key === 'setup') return 'Setup of launch'
  return 'Afgerond'
}

function getOverviewHeadline({
  campaign,
  isAdmin,
  avgSignal,
}: {
  campaign: CampaignStats
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
          tone="blue"
        />
        <DashboardPanel
          eyebrow="Stap 2"
          title="Campaign"
          body="Kies ExitScan of RetentieScan en zet de campaign op met de juiste metadata."
          tone="blue"
        />
        <DashboardPanel
          eyebrow="Stap 3"
          title="Respondenten"
          body="Importeer respondenten en stuur uitnodigingen, zodat de cockpit vanzelf in monitoring overgaat."
          tone="emerald"
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
            <div key={item} className="rounded-2xl border border-[color:var(--border)] bg-white px-4 py-4 text-sm leading-6 text-[color:var(--text)]">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--muted)]">Stap {index + 1}</p>
              <p className="mt-2">{item}</p>
            </div>
          ))}
        </div>
      </div>
    </DashboardSection>
  )
}

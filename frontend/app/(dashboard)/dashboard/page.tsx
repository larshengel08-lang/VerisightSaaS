import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { OnboardingBalloon } from '@/components/dashboard/onboarding-balloon'
import { CustomerLaunchControl } from '@/components/dashboard/customer-launch-control'
import {
  DashboardChip,
  DashboardPanel,
  DashboardSection,
  InfoTooltip,
} from '@/components/dashboard/dashboard-primitives'
import { ManagementReadGuide } from '@/components/dashboard/onboarding-panels'
import { PdfDownloadButton } from '@/app/(dashboard)/campaigns/[id]/pdf-download-button'
import { getFirstNextStepGuidance } from '@/lib/client-onboarding'
import { buildGuidedSelfServeState, deriveGuidedSelfServeDiscipline } from '@/lib/guided-self-serve'
import { FIRST_INSIGHT_THRESHOLD } from '@/lib/response-activation'
import {
  getCampaignCompositionState,
  HOME_STATE_ORDER,
  type CampaignCompositionState,
} from '@/lib/dashboard/dashboard-state-composition'
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

export default async function DashboardHomePage() {
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

  const { data: stats } = await supabase
    .from('campaign_stats')
    .select('*')
    .order('created_at', { ascending: false })

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
  const activeExecutionCount = campaignEntries.filter((entry) =>
    ['setup', 'ready_to_launch', 'running', 'sparse'].includes(entry.state),
  ).length
  const closedCount = campaignEntries.filter((entry) => entry.state === 'closed').length
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
  const showFirstNextStep =
    !isAdmin && primaryFirstNextStepCampaign
  const primaryFirstNextStepGuidance = primaryFirstNextStepCampaign
    ? getFirstNextStepGuidance(primaryFirstNextStepCampaign.scan_type)
    : null
  const primaryGuideScanDefinition = primaryGuideCampaign ? getScanDefinition(primaryGuideCampaign.scan_type) : null
  const primaryFirstNextStepScanDefinition = primaryFirstNextStepCampaign
    ? getScanDefinition(primaryFirstNextStepCampaign.scan_type)
    : null

  return (
    <div className="space-y-6">
      {!isAdmin && primaryGuideCampaign && primaryExecutionState && primaryGuideScanDefinition ? (
        <DashboardSection
          eyebrow="Jouw uitvoerstatus"
          title="Jouw uitvoerstatus"
          description="Na login zie je direct welk product actief is, waar de campagne staat, wat nog ontbreekt en wat de eerstvolgende veilige stap is."
          aside={<DashboardChip label={primaryExecutionState.currentStateLabel} tone="blue" />}
        >
          <CustomerLaunchControl
            campaignName={primaryGuideCampaign.campaign_name}
            campaignHref={`/campaigns/${primaryGuideCampaign.campaign_id}`}
            campaignCtaLabel={primaryExecutionState.dashboardVisible ? 'Open campagne en dashboard' : 'Open uitvoerflow'}
            productName={primaryGuideScanDefinition.productName}
            productContext={primaryGuideScanDefinition.whatItIsText}
            state={primaryExecutionState}
          />
        </DashboardSection>
      ) : null}

      <DashboardSection
        eyebrow="Cockpit"
        title="Campaign cockpit"
        description={
          isAdmin
            ? 'Zie direct welke campagnes klaar zijn voor managementduiding, welke nog operationele aandacht vragen en waar de eerstvolgende deliveryactie ligt.'
            : 'Zie direct welke campagnes klaar zijn voor managementread, welke nog in opbouw zijn en waar rapport of dashboard nu de logische eerste stap is.'
        }
        aside={
          isAdmin ? (
            <div className="flex flex-wrap items-center gap-2">
              <DashboardChip label="Operations cockpit" tone="blue" />
              <Link
                href="/beheer"
                className="inline-flex rounded-full border border-[color:var(--dashboard-frame-border)] bg-[color:var(--dashboard-ink)] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#1B2E45]"
              >
                Nieuwe campaign
              </Link>
            </div>
          ) : (
            <DashboardChip label="Klantdashboard" tone="emerald" />
          )
        }
      >
        <div className="grid gap-4 lg:grid-cols-4">
          <DashboardPanel
            eyebrow="Full / management ready"
            title={`${fullCount}`}
            body="Campagnes met genoeg respons en zichtbaarheid om dashboard, aanbevelingen en rapport echt als managementinstrument te gebruiken."
            tone="blue"
          />
          <DashboardPanel
            eyebrow="Partial / deels zichtbaar"
            title={`${partialCount}`}
            body="Campagnes waar de eerste veilige read open is, maar waar drivers, aanbevelingen of diepere patroonduiding bewust nog begrensd blijven."
            tone={partialCount > 0 ? 'amber' : 'slate'}
          />
          <DashboardPanel
            eyebrow="Uitvoering actief"
            title={`${activeExecutionCount}`}
            body="Campagnes in setup, launch, running of sparse responsopbouw. Hier hoort de nadruk op uitvoerdiscipline te liggen, niet op managementduiding."
            tone={activeExecutionCount > 0 ? 'amber' : 'slate'}
          />
          <DashboardPanel
            eyebrow="Closed / report-first"
            title={avgSignal ? `${avgSignal}/10` : closedCount > 0 ? `${closedCount}` : 'Nog leeg'}
            body={
              avgSignal
                ? `Gemiddeld groepssignaal over campagnes met leesbare output. Gesloten campagnes: ${closedCount}. Gemiddelde respons: ${avgResponse}%.`
                : campaigns.length === 0
                  ? 'Maak eerst een organisatie en campaign aan. Daarna verschijnt hier automatisch de cockpit.'
                  : `Campagnes in report-first status: ${closedCount}. Gemiddelde respons: ${avgResponse}%.`
            }
            tone={avgSignal ? 'emerald' : 'slate'}
          />
        </div>
      </DashboardSection>

      {!isAdmin && primaryFirstNextStepCampaign && primaryFirstNextStepGuidance && primaryFirstNextStepScanDefinition ? (
        <DashboardSection
          eyebrow="First-next-step"
          title="Van activatie naar eerste managementstap"
          description="Deze laag scheidt bewust wat het actuele inzicht nu zegt, welke eerste managementactie logisch is en welke vervolgroutes eventueel passen zonder het portfolio breder te maken dan de vraag draagt."
          aside={<DashboardChip label={primaryFirstNextStepScanDefinition.productName} tone="blue" />}
        >
          <div className="space-y-4">
            <div className="grid gap-4 lg:grid-cols-3">
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

            <div className="rounded-[22px] border border-[color:var(--border)] bg-[color:var(--bg)] p-4 sm:p-5">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--muted)]">
                    Mogelijke vervolgroutes
                  </p>
                  <p className="mt-2 max-w-3xl text-sm leading-6 text-[color:var(--text)]">
                    Deze routes openen pas zodra de eerste managementstap expliciet is gemaakt. Het zijn dus geen standaard vervolgaanbiedingen, maar voorwaardelijke routekeuzes binnen de bestaande suite-canon.
                  </p>
                </div>
                <DashboardChip label="Bounded portfolio" tone="slate" />
              </div>

              <div className="mt-4 grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
                {primaryFirstNextStepGuidance.followOnSuggestions.map((suggestion) => (
                  <div
                    key={suggestion.productLabel}
                    className="rounded-2xl border border-white/80 bg-white px-4 py-4 shadow-sm"
                  >
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--muted)]">
                      Alleen als
                    </p>
                    <p className="mt-2 text-sm font-semibold text-[color:var(--ink)]">{suggestion.productLabel}</p>
                    <p className="mt-2 text-sm leading-6 text-[color:var(--text)]">{suggestion.when}</p>
                    <p className="mt-3 text-xs leading-5 text-[color:var(--muted)]">{suggestion.boundary}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </DashboardSection>
      ) : null}

      {!isAdmin && !showFirstNextStep ? (
        <DashboardSection
          eyebrow="Eerste route"
          title="Van eerste login naar eerste managementread"
          description="Deze laag maakt expliciet hoe je dashboard en rapport als eerste managementinstrument gebruikt, zonder setupverantwoordelijkheid of self-service verwachtingen."
          aside={<DashboardChip label="Assisted onboarding" tone="blue" />}
        >
          <ManagementReadGuide
            scanType={primaryGuideCampaign?.scan_type ?? 'exit'}
            hasMinDisplay={(primaryGuideCampaign?.total_completed ?? 0) >= 5}
            hasEnoughData={(primaryGuideCampaign?.total_completed ?? 0) >= 10}
          />
        </DashboardSection>
      ) : null}

      {campaigns.length === 0 ? (
        isAdmin ? <AdminEmptyState /> : <ViewerEmptyState />
      ) : (
        <div className="space-y-5">
          {groups.map((group) =>
            group.entries.length > 0 ? (
              <DashboardSection
                key={group.key}
                eyebrow="Campagnestatus"
                title={group.title}
                description={group.description}
                aside={
                  <DashboardChip
                    label={`${group.entries.length} campagne${group.entries.length === 1 ? '' : 's'}`}
                    tone={getHomeStateMeta(group.key).tone}
                  />
                }
                tone={getHomeStateMeta(group.key).tone}
              >
                <div className="space-y-3">
                  {group.entries.map((entry, index) => (
                    <CampaignRow
                      key={entry.campaign.campaign_id}
                      entry={entry}
                      showOnboarding={!isAdmin && group.key === 'full' && index === 0}
                      isAdmin={isAdmin}
                    />
                  ))}
                </div>
              </DashboardSection>
            ) : null,
          )}
        </div>
      )}

      <DashboardSection
        eyebrow="Utilitylaag"
        title={isAdmin ? 'Operations en support' : 'Ondersteuning en rapportgebruik'}
        description={
          isAdmin
            ? 'Snelle routes voor setup, handoff en deliverybeheer. Deze laag ondersteunt de cockpit zonder de managementprioriteit erboven te verstoren.'
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
                    ? 'Gebruik de cockpit hierboven om direct naar de campaign te gaan die nu het meeste managementwaarde oplevert.'
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
            <DashboardChip label={scanDefinition.productName} tone={campaign.scan_type === 'retention' ? 'emerald' : 'blue'} />
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
        'Toon hier alleen uitvoerstatus en responsopbouw. Dit is nog geen managementread.',
    },
    sparse: {
      label: 'Indicatief, nog dun',
      tone: 'amber' as const,
      nextStepLabel: 'Meer respons nodig',
      viewerCta: 'Open uitvoerflow',
      sectionTitle: 'Sparse / indicatief',
      sectionDescription:
        'Campagnes met eerste responses, maar nog onder de veilige dashboarddrempel voor een eerlijke managementread.',
      body: 'Er zijn eerste responses binnen, maar het beeld is nog te dun voor een veilige dashboardlaag.',
      trust:
        'Gebruik dit als signaal dat uitvoering loopt, niet als inhoudelijke conclusie of pseudo-insight.',
    },
    partial: {
      label: 'Deels zichtbaar',
      tone: 'amber' as const,
      nextStepLabel: 'Compacte read',
      viewerCta: 'Open compacte read',
      sectionTitle: 'Partial / deels zichtbaar',
      sectionDescription:
        'Campagnes waar de eerste veilige dashboardread open is, maar waar thresholds of privacy de verdiepingslaag nog begrenzen.',
      body: 'De eerste dashboardread is zichtbaar, maar aanbevelingen en patroonduiding blijven nog bewust compact.',
      trust:
        'Privacy- en thresholdgrenzen houden drivers, aanbevelingen en diepere claims nog deels dicht.',
    },
    full: {
      label: 'Management ready',
      tone: 'blue' as const,
      nextStepLabel: 'Open dashboard',
      viewerCta: 'Open dashboard',
      sectionTitle: 'Full / management ready',
      sectionDescription:
        'Campagnes met genoeg respons en voldoende zichtbaarheid om dashboard, aanbevelingen en rapport als managementinstrument te gebruiken.',
      body: 'Dashboard en rapport zijn nu stevig genoeg voor managementduiding, prioritering en eerste vervolgactie.',
      trust:
        'Aanbevelingen en vervolgrails mogen nu zichtbaar worden binnen de bestaande productgrenzen en shared grammar.',
    },
    closed: {
      label: 'Rapport eerst',
      tone: 'slate' as const,
      nextStepLabel: 'Rapport-first',
      viewerCta: 'Open rapport en dashboard',
      sectionTitle: 'Closed / report-first',
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

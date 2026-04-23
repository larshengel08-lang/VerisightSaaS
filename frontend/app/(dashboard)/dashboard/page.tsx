import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { OnboardingBalloon } from '@/components/dashboard/onboarding-balloon'
import {
  DashboardChip,
  DashboardPanel,
  DashboardSection,
  InfoTooltip,
} from '@/components/dashboard/dashboard-primitives'
import { ManagementReadGuide } from '@/components/dashboard/onboarding-panels'
import { PdfDownloadButton } from '@/app/(dashboard)/campaigns/[id]/pdf-download-button'
import { buildGuidedSelfServeState } from '@/lib/guided-self-serve'
import { getScanDefinition } from '@/lib/scan-definitions'
import type { CampaignStats } from '@/lib/types'

type CampaignGroup = {
  key: string
  title: string
  description: string
  campaigns: CampaignStats[]
}

type CampaignBucket = 'ready' | 'building' | 'setup' | 'closed'

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
  const groups = groupCampaigns(campaigns)
  const activeCampaigns = campaigns.filter((campaign) => campaign.is_active)
  const primaryGuideCampaign = activeCampaigns[0] ?? campaigns[0] ?? null
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
        invitesNotSent: Math.max(primaryGuideCampaign.total_invited - primaryGuideCampaign.total_completed, 0),
        hasMinDisplay: primaryGuideCampaign.total_completed >= 5,
        hasEnoughData: primaryGuideCampaign.total_completed >= 10,
      })
    : null

  return (
    <div className="space-y-6">
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
                className="inline-flex rounded-full bg-[color:var(--ink)] px-4 py-2 text-sm font-semibold text-[color:var(--bg)] transition-colors hover:bg-[#1B2E45]"
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
            eyebrow="Management-ready"
            title={`${readyCount}`}
            body="Campagnes met genoeg respons om actief te sturen op duiding, prioritering en rapportage."
            tone="blue"
          />
          <DashboardPanel
            eyebrow="Nog in opbouw"
            title={`${buildingCount}`}
            body="Campagnes waar de response al loopt, maar waar het patroonbeeld nog eerst steviger moet worden."
            tone={buildingCount > 0 ? 'amber' : 'slate'}
          />
          <DashboardPanel
            eyebrow="Setup of launch"
            title={`${setupCount}`}
            body="Campagnes waar eerst nog respondentimport, uitnodiging of launchcontrole nodig is."
            tone={setupCount > 0 ? 'amber' : 'slate'}
          />
          <DashboardPanel
            eyebrow="Portfolio"
            title={avgSignal ? `${avgSignal}/10` : closedCount > 0 ? `${closedCount}` : 'Nog leeg'}
            body={
              avgSignal
                ? `Gemiddeld groepssignaal over campagnes met leesbare output. Gemiddelde respons: ${avgResponse}%.`
                : campaigns.length === 0
                  ? 'Maak eerst een organisatie en campaign aan. Daarna verschijnt hier automatisch de cockpit.'
                  : `Gesloten of nog niet leesbare campagnes in portfolio: ${closedCount}. Gemiddelde respons: ${avgResponse}%.`
            }
            tone={avgSignal ? 'emerald' : 'slate'}
          />
        </div>
      </DashboardSection>

      {!isAdmin ? (
        primaryGuideCampaign && primaryExecutionState ? (
          <DashboardSection
            eyebrow="Jouw uitvoerstatus"
            title={primaryExecutionState.headline}
            description={primaryExecutionState.detail}
            aside={<DashboardChip label={primaryExecutionState.dashboardVisible ? 'Dashboard actief' : 'Uitvoer loopt'} tone={primaryExecutionState.dashboardVisible ? 'emerald' : 'amber'} />}
          >
            <div className="grid gap-4 xl:grid-cols-[minmax(0,1.4fr),minmax(320px,0.6fr)]">
              <div className="rounded-[22px] border border-[color:var(--border)] bg-white p-4 shadow-[0_10px_30px_rgba(19,32,51,0.05)]">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--muted)]">
                  Eerstvolgende stap
                </p>
                <p className="mt-2 text-lg font-semibold text-[color:var(--ink)]">
                  {primaryExecutionState.nextAction.title}
                </p>
                <p className="mt-2 text-sm leading-6 text-[color:var(--text)]">
                  {primaryExecutionState.nextAction.body}
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {primaryExecutionState.statusBlocks.map((item) => (
                    <DashboardChip
                      key={item.key}
                      label={item.label}
                      tone={item.status === 'done' ? 'emerald' : item.status === 'current' ? 'blue' : 'slate'}
                    />
                  ))}
                </div>
              </div>
              <div className="rounded-[22px] border border-[color:var(--border)] bg-[color:var(--bg)] p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--muted)]">
                  Jouw campagne nu
                </p>
                <p className="mt-2 text-base font-semibold text-[color:var(--ink)]">
                  {primaryGuideCampaign.campaign_name}
                </p>
                <p className="mt-2 text-sm leading-6 text-[color:var(--text)]">
                  Open deze campaign voor deelnemersimport, inviteflow, responsmonitoring en pas daarna dashboardgebruik.
                </p>
                <Link
                  href={`/campaigns/${primaryGuideCampaign.campaign_id}`}
                  className="mt-4 inline-flex rounded-full border border-[#d6e4e8] bg-[#f3f8f8] px-4 py-2 text-sm font-semibold text-[#234B57] transition-colors hover:border-[#bfd3d8] hover:bg-[#e9f2f3]"
                >
                  {primaryExecutionState.dashboardVisible ? 'Open campaign en dashboard' : 'Open uitvoerflow'}
                </Link>
              </div>
            </div>
          </DashboardSection>
        ) : null
      ) : null}

      {!isAdmin ? (
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
            group.campaigns.length > 0 ? (
              <DashboardSection
                key={group.key}
                eyebrow="Campagnestatus"
                title={group.title}
                description={group.description}
                aside={
                  <DashboardChip
                    label={`${group.campaigns.length} campagne${group.campaigns.length === 1 ? '' : 's'}`}
                    tone={group.key === 'ready' ? 'blue' : group.key === 'closed' ? 'slate' : 'amber'}
                  />
                }
                tone={group.key === 'ready' ? 'blue' : group.key === 'closed' ? 'slate' : 'amber'}
              >
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
    <div className="rounded-[24px] border border-[color:var(--border)] bg-white px-4 py-4 shadow-[0_10px_30px_rgba(19,32,51,0.05)]">
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
          <span className="rounded-full bg-[color:var(--bg)] px-3 py-1 font-medium text-[color:var(--text)]">
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
    <div className="rounded-[22px] border border-[color:var(--border)] bg-white p-4 shadow-[0_10px_30px_rgba(19,32,51,0.05)]">
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
  if (campaign.total_completed < 10) return 'building'
  return 'ready'
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

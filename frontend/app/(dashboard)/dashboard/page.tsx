import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { OnboardingBalloon } from '@/components/dashboard/onboarding-balloon'
import {
  DashboardChip,
  DashboardPanel,
  DashboardSection,
} from '@/components/dashboard/dashboard-primitives'
import { PdfDownloadButton } from '@/app/(dashboard)/campaigns/[id]/pdf-download-button'
import { getScanDefinition } from '@/lib/scan-definitions'
import type { CampaignStats } from '@/lib/types'

type CampaignGroup = {
  key: string
  title: string
  description: string
  campaigns: CampaignStats[]
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
  const groups = groupCampaigns(campaigns)
  const activeCampaigns = campaigns.filter((campaign) => campaign.is_active)
  const avgResponse =
    campaigns.length > 0
      ? Math.round(campaigns.reduce((sum, campaign) => sum + (campaign.completion_rate_pct ?? 0), 0) / campaigns.length)
      : 0

  return (
    <div className="space-y-6">
      <DashboardSection
        eyebrow="Overzicht"
        title="Campaign cockpit"
        description={
          isAdmin
            ? 'Gebruik dit overzicht om per campagne te zien wat de volgende operationele stap is: opzetten, monitoren, rapporteren of afsluiten.'
            : 'Gebruik dit overzicht om te zien welke campagnes live zijn, waar resultaten klaarstaan en welke scans nog in opbouw zijn.'
        }
        aside={
          isAdmin ? (
            <Link
              href="/beheer"
              className="inline-flex rounded-full bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
            >
              Nieuwe campaign
            </Link>
          ) : (
            <DashboardChip label="Klantdashboard" tone="emerald" />
          )
        }
      >
        <div className="grid gap-4 lg:grid-cols-3">
          <DashboardPanel
            eyebrow="Actief"
            title={`${activeCampaigns.length}`}
            body="Aantal actieve campagnes dat nu monitoring, reminders of rapportage vraagt."
            tone="blue"
          />
          <DashboardPanel
            eyebrow="Gemiddelde respons"
            title={`${avgResponse}%`}
            body="Snelle thermometer voor hoe ver campagnes gemiddeld in hun response- en analysecirkel zitten."
            tone={avgResponse >= 60 ? 'emerald' : avgResponse >= 30 ? 'amber' : 'blue'}
          />
          <DashboardPanel
            eyebrow="Status"
            title={campaigns.length === 0 ? 'Nog leeg' : 'Operationeel overzicht'}
            body={
              campaigns.length === 0
                ? 'Maak eerst een organisatie en campaign aan. Daarna verschijnt hier automatisch de cockpit.'
                : 'Elke campagne is gegroepeerd op eerstvolgende actie, zodat je niet handmatig door kaarten hoeft te zoeken.'
            }
            tone="slate"
          />
        </div>
      </DashboardSection>

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
                aside={<DashboardChip label={`${group.campaigns.length} campagne${group.campaigns.length === 1 ? '' : 's'}`} tone="slate" />}
              >
                <div className="space-y-3">
                  {group.campaigns.map((campaign, index) => (
                    <CampaignRow
                      key={campaign.campaign_id}
                      campaign={campaign}
                      showOnboarding={!isAdmin && group.key === 'active' && index === 0}
                    />
                  ))}
                </div>
              </DashboardSection>
            ) : null,
          )}
        </div>
      )}
    </div>
  )
}

function CampaignRow({
  campaign,
  showOnboarding,
}: {
  campaign: CampaignStats
  showOnboarding: boolean
}) {
  const scanDefinition = getScanDefinition(campaign.scan_type)
  const nextAction = getNextAction(campaign)

  return (
    <div className="rounded-[22px] border border-slate-200 bg-white px-4 py-4 shadow-sm">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <DashboardChip label={scanDefinition.productName} tone={campaign.scan_type === 'retention' ? 'emerald' : 'blue'} />
            <DashboardChip label={campaign.is_active ? 'Actief' : 'Gesloten'} tone={campaign.is_active ? 'emerald' : 'slate'} />
          </div>
          <h2 className="mt-3 text-lg font-semibold text-slate-950">{campaign.campaign_name}</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">{nextAction.body}</p>
        </div>

        <div className="grid gap-3 sm:grid-cols-3 xl:min-w-[360px]">
          <StatCell label="Respons" value={`${campaign.completion_rate_pct ?? 0}%`} />
          <StatCell label="Ingevuld" value={`${campaign.total_completed}`} />
          <StatCell
            label={`Gem. ${scanDefinition.signalLabelLower}`}
            value={campaign.avg_risk_score !== null ? `${campaign.avg_risk_score.toFixed(1)}/10` : '–'}
          />
        </div>
      </div>

      <div className="mt-4 flex flex-col gap-3 border-t border-slate-100 pt-4 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-wrap items-center gap-2 text-sm">
          <span className="rounded-full bg-slate-100 px-3 py-1 font-medium text-slate-600">{nextAction.label}</span>
          <span className="text-slate-400">·</span>
          <span className="text-slate-500">
            Uitgenodigd {campaign.total_invited} · Banden hoog/midden/laag: {campaign.band_high}/{campaign.band_medium}/{campaign.band_low}
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            {showOnboarding ? <OnboardingBalloon step={1} label="Open je campagne" align="left" /> : null}
            <Link
              href={`/campaigns/${campaign.campaign_id}`}
              className="inline-flex rounded-full border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-700 transition-colors hover:border-blue-300 hover:bg-blue-100"
            >
              Open dashboard
            </Link>
          </div>
          <PdfDownloadButton campaignId={campaign.campaign_id} campaignName={campaign.campaign_name} />
        </div>
      </div>
    </div>
  )
}

function StatCell({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">{label}</p>
      <p className="mt-2 text-lg font-semibold text-slate-950">{value}</p>
    </div>
  )
}

function getNextAction(campaign: CampaignStats) {
  if (!campaign.is_active) {
    return {
      label: 'Rapport beschikbaar',
      body: 'Deze campagne is gesloten. Gebruik het dashboard vooral voor rapportage, terugblik en het voorbereiden van het vervolggesprek.',
    }
  }

  if (campaign.total_invited === 0) {
    return {
      label: 'Respondenten toevoegen',
      body: 'De campagne bestaat, maar er zijn nog geen respondenten gekoppeld. Dit is nu de eerstvolgende operationele stap.',
    }
  }

  if ((campaign.completion_rate_pct ?? 0) < 20) {
    return {
      label: 'Respons opbouwen',
      body: 'De response is nog laag. Focus nu op uitnodigingen, reminders en het zorgen voor genoeg basis om later veilig te kunnen analyseren.',
    }
  }

  if (campaign.total_completed < 10) {
    return {
      label: 'Nog indicatief',
      body: 'Er zijn al responses binnen, maar nog niet genoeg voor een stevig patroonbeeld. Gebruik dit dashboard voorlopig vooral om richting te houden.',
    }
  }

  return {
    label: 'Klaar voor verdieping',
    body: 'De campagne heeft genoeg respons om actief te sturen op analyse, managementduiding en rapportage.',
  }
}

function groupCampaigns(campaigns: CampaignStats[]): CampaignGroup[] {
  return [
    {
      key: 'active',
      title: 'Actieve campagnes',
      description: 'Campagnes die nog live lopen en direct monitoring of actie vragen.',
      campaigns: campaigns.filter((campaign) => campaign.is_active && campaign.total_completed >= 10),
    },
    {
      key: 'building',
      title: 'Nog in opbouw',
      description: 'Campagnes waar response of setup nog eerst aandacht nodig heeft voordat verdieping zinvol wordt.',
      campaigns: campaigns.filter((campaign) => campaign.is_active && campaign.total_completed < 10),
    },
    {
      key: 'closed',
      title: 'Afgerond en gesloten',
      description: 'Gesloten campagnes die vooral nog voor rapportage, terugblik en follow-up gebruikt worden.',
      campaigns: campaigns.filter((campaign) => !campaign.is_active),
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
          body="Kies ExitScan of RetentieScan en zet de campagne op met de juiste metadata."
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
          className="inline-flex rounded-full bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
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
      description="Verisight zet de campagne op, controleert de import en activeert daarna automatisch dit overzicht."
    >
      <div className="rounded-[22px] border border-slate-200 bg-slate-50 px-4 py-5 text-sm leading-6 text-slate-700">
        Zodra de eerste responses binnenkomen, verschijnen hier automatisch je campagnes, status en rapportacties.
      </div>
    </DashboardSection>
  )
}

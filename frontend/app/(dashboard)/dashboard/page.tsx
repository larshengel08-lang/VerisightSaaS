import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { PdfDownloadButton } from '@/app/(dashboard)/campaigns/[id]/pdf-download-button'
import {
  DashboardChip,
  DashboardContextHeader,
  DashboardDisclosure,
  DashboardHero,
  DashboardKeyValue,
  DashboardPanel,
  DashboardSection,
} from '@/components/dashboard/dashboard-primitives'
import { ManagementReadGuide } from '@/components/dashboard/onboarding-panels'
import { getScanDefinition } from '@/lib/scan-definitions'
import type { CampaignStats } from '@/lib/types'
import {
  buildDashboardHomeModel,
  type HomeActionModel,
  type HomeCampaignCardModel,
  type HomeGroupModel,
} from './home-launcher'

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
  const home = buildDashboardHomeModel({
    campaigns,
    isAdmin,
  })

  if (home.emptyState === 'no_campaigns') {
    return (
      <div className="space-y-6">
        <DashboardContextHeader
          eyebrow="Campaign launcher"
          title={isAdmin ? 'Nog geen campaigns om te kiezen' : 'Je eerste campaign wordt voorbereid'}
          description={
            isAdmin
              ? 'Deze homepage wordt pas een decision-first launcher zodra er campaigns zijn om tussen te kiezen.'
              : 'Zodra de eerste campaign live staat, zie je hier direct welke route je nu moet openen en of dashboard of PDF de juiste volgende stap is.'
          }
          meta={
            <>
              <DashboardChip label={isAdmin ? 'Launcher wacht op setup' : 'Launcher wacht op livegang'} tone="slate" />
              <DashboardChip label="Support blijft secundair" tone="slate" />
            </>
          }
          aside={
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
              <DashboardKeyValue label="Nu openen" value="0" />
              <DashboardKeyValue label="Nog in opbouw" value="0" />
              <DashboardKeyValue label="Rapport beschikbaar" value="0" />
              <DashboardKeyValue label="Archief" value="0" />
            </div>
          }
        />

        {isAdmin ? <AdminEmptyState /> : <ViewerEmptyState />}
      </div>
    )
  }

  const recommendation = home.recommendation

  return (
    <div className="space-y-6">
      <DashboardContextHeader
        eyebrow="Campaign launcher"
        title={isAdmin ? 'Kies eerst welke campaign nu aandacht vraagt' : 'Open eerst de campaign die nu het meest telt'}
        description={
          isAdmin
            ? 'Kies eerst de juiste campaign of setupstap. Beheer, dashboard en rapport volgen daarna.'
            : 'Kies hier eerst welke campaign nu open moet en of dashboard of PDF de juiste volgende stap is.'
        }
        meta={
          <>
            <DashboardChip label="Decision-first" tone="blue" />
            <DashboardChip label="Portfolio tweede laag" tone="slate" />
            {isAdmin ? <DashboardChip label="Support lager in de hierarchie" tone="slate" /> : null}
          </>
        }
        actions={
          isAdmin ? (
            <Link
              href="/beheer"
              className="inline-flex rounded-full border border-[color:var(--ink)] bg-[color:var(--ink)] px-4 py-2 text-sm font-semibold text-[color:var(--bg)] transition-colors hover:bg-slate-900"
            >
              Open beheer
            </Link>
          ) : null
        }
        aside={
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
            <DashboardKeyValue label="Nu openen" value={`${home.counts.open_now}`} />
            <DashboardKeyValue label="Nog in opbouw" value={`${home.counts.building}`} />
            <DashboardKeyValue label="Rapport beschikbaar" value={`${home.counts.closed}`} />
            <DashboardKeyValue label="Archief" value={`${home.counts.archive}`} />
          </div>
        }
      />

      {recommendation ? (
        <DashboardHero
          eyebrow="Aanbevolen volgende stap"
          title={`${recommendation.title}: ${recommendation.campaign.campaign_name}`}
          description={recommendation.reason}
          tone={recommendation.primaryAction.kind === 'pdf' ? 'emerald' : 'blue'}
          meta={
            <>
              <DashboardChip
                label={getScanDefinition(recommendation.campaign.scan_type).productName}
                tone={recommendation.campaign.scan_type === 'retention' ? 'emerald' : 'blue'}
              />
              <DashboardChip
                label={recommendation.campaign.is_active ? 'Actieve campaign' : 'Gesloten campaign'}
                tone={recommendation.campaign.is_active ? 'blue' : 'slate'}
              />
              <DashboardChip label={home.groups.find((group) => group.campaigns.some((campaign) => campaign.campaign.campaign_id === recommendation.campaign.campaign_id))?.title ?? 'Campaigngroep'} tone="slate" />
            </>
          }
          actions={
            <div className="flex flex-wrap items-center gap-3">
              <PrimaryLauncherAction
                campaign={recommendation.campaign}
                action={recommendation.primaryAction}
              />
              {recommendation.secondaryAction ? (
                <SecondaryLauncherAction
                  campaign={recommendation.campaign}
                  action={recommendation.secondaryAction}
                />
              ) : null}
            </div>
          }
          aside={
            <div className="space-y-3">
              <div className="grid gap-2 sm:grid-cols-2">
                <CompactMetric
                  label="Periode"
                  value={new Intl.DateTimeFormat('nl-NL', { month: 'short', year: 'numeric' }).format(
                    new Date(recommendation.campaign.created_at),
                  )}
                />
                <CompactMetric
                  label="Respons"
                  value={`${recommendation.campaign.completion_rate_pct ?? 0}%`}
                />
                <CompactMetric
                  label="Status"
                  value={recommendation.campaign.is_active ? 'Nu lezen' : 'Rapportklaar'}
                />
                <CompactMetric
                  label={getScanDefinition(recommendation.campaign.scan_type).signalLabel}
                  value={
                    recommendation.campaign.avg_risk_score !== null
                      ? `${recommendation.campaign.avg_risk_score.toFixed(1)}/10`
                      : '-'
                  }
                />
              </div>
              <div className="rounded-[20px] border border-slate-200 bg-slate-50 px-4 py-3">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">Waarom nu</p>
                <p className="mt-2 text-sm leading-6 text-slate-700">
                  {getRecommendationWhyNow(recommendation.campaign)}
                </p>
              </div>
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
                <ActionChoiceCard
                  title="Dashboard"
                  description={recommendation.dashboardChoiceDescription}
                  tone="blue"
                />
                <ActionChoiceCard
                  title="PDF"
                  description={recommendation.pdfChoiceDescription}
                  tone="emerald"
                />
              </div>
            </div>
          }
        />
      ) : null}

      <DashboardSection
        eyebrow="Campaigngroepen"
        title="Kies per campaign wat nu de logische volgende stap is"
        description="Eerst keuze, daarna pas portfolio-overzicht. Zo blijft direct zichtbaar wat nu open moet, wat nog opbouwt en wat vooral naslag is."
        aside={<DashboardChip label="Launcher view" tone="blue" />}
      >
        <div className="space-y-4">
          {home.groups.map((group) => (
            <CampaignGroupDisclosure key={group.bucket} group={group} />
          ))}
        </div>
      </DashboardSection>

      <DashboardSection
        eyebrow="Support en routehulp"
        title={isAdmin ? 'Beheer, routehulp en support blijven bewust secundair' : 'Dashboard versus PDF en support blijven bewust secundair'}
        description={
          isAdmin
            ? 'Gebruik deze laag pas nadat de juiste campaignkeuze is gemaakt. Support, setup en admin mogen de launcher erboven niet verdringen.'
            : 'Gebruik deze laag alleen wanneer je extra hulp nodig hebt bij rapportgebruik, leesvolgorde of afstemming met Verisight.'
        }
        aside={<DashboardChip label="Tertiaire laag" tone="slate" />}
      >
        <div className="space-y-4">
          <DashboardDisclosure
            title="Wanneer open je dashboard en wanneer PDF?"
            description="Compact leeskader voor de keuze tussen interactieve route en deelbaar rapport."
            defaultOpen={false}
            badge={<DashboardChip label="Choice aid" tone="slate" />}
          >
            <div className="grid gap-4 lg:grid-cols-2">
              <DashboardPanel
                eyebrow="Dashboard eerst"
                title="Interactief lezen en prioriteren"
                body="Open eerst het dashboard als je wilt duiden, prioriteren, vergelijken of de eerste vervolgroute wilt bepalen."
                tone="blue"
              />
              <DashboardPanel
                eyebrow="PDF daarna"
                title="Delen, bespreken en meenemen"
                body="Gebruik de PDF als boardroom-ready samenvatting, deelstuk of follow-updocument zodra de campaign rapportklaar is."
                tone="emerald"
              />
            </div>
          </DashboardDisclosure>

          <DashboardDisclosure
            title={isAdmin ? 'Beheer en operations' : 'Rapportgebruik en supportverwachting'}
            description={
              isAdmin
                ? 'Admin- en supporttaken leven hier, niet in de primaire campaignkeuze.'
                : 'Setup, reminders en deliverycontrole blijven bij Verisight en concurreren dus niet met je campaignkeuze.'
            }
            defaultOpen={false}
            badge={<DashboardChip label={isAdmin ? 'Ops-tools' : 'Supportlaag'} tone="slate" />}
          >
            {isAdmin ? (
              <div className="grid gap-4 lg:grid-cols-3">
                <UtilityCard
                  eyebrow="Setup"
                  title="Campaignconfiguratie"
                  body="Gebruik beheer voor respondentimport, launchcontrole en customer access zonder de launcher te verstoren."
                  href="/beheer"
                  cta="Open beheer"
                />
                <UtilityCard
                  eyebrow="Handoff"
                  title="Contactaanvragen"
                  body="Lead- en handofftaken blijven lager in de hierarchie zodat de campaignkeuze bovenaan scherp blijft."
                  href="/beheer/contact-aanvragen"
                  cta="Open leadlijst"
                />
                <UtilityCard
                  eyebrow="Learning"
                  title="Klantlearnings"
                  body="Gebruik de learning-workbench pas na de campaignkeuze om lessen en vervolgacties vast te leggen."
                  href="/beheer/klantlearnings"
                  cta="Open learning-workbench"
                />
              </div>
            ) : (
              <div className="grid gap-4 lg:grid-cols-3">
                <DashboardPanel
                  eyebrow="Support"
                  title="Verisight beheert setup en reminders"
                  body="Respondentimport, uitnodigingen en deliverycontrole blijven bewust buiten jouw primaire homepage-keuze."
                  tone="slate"
                />
                <DashboardPanel
                  eyebrow="Rapportgebruik"
                  title="Gebruik PDF als deelbaar tweede document"
                  body="De homepage maakt de keuze duidelijk, maar het rapport blijft bewust een ondersteunende stap naast het dashboard."
                  tone="blue"
                />
                <DashboardDisclosure
                  title="Leeskader"
                  description="Alleen openklappen als je de managementleeslaag opnieuw nodig hebt."
                  defaultOpen={false}
                  badge={<DashboardChip label="Secondary" tone="slate" />}
                >
                  <ManagementReadGuide
                    scanType={recommendation?.campaign.scan_type ?? 'exit'}
                    hasMinDisplay={(recommendation?.campaign.total_completed ?? 0) >= 5}
                    hasEnoughData={(recommendation?.campaign.total_completed ?? 0) >= 10}
                  />
                </DashboardDisclosure>
              </div>
            )}
          </DashboardDisclosure>
        </div>
      </DashboardSection>
    </div>
  )
}

function CampaignGroupDisclosure({ group }: { group: HomeGroupModel }) {
  const groupAccent =
    group.bucket === 'open_now'
      ? 'Open eerst'
      : group.bucket === 'building'
        ? 'Volg actief'
        : group.bucket === 'closed'
          ? 'Nog steeds actiegericht'
          : 'Lagere prioriteit'

  return (
    <DashboardDisclosure
      title={group.title}
      description={group.description}
      defaultOpen={group.defaultOpen}
      badge={
        <div className="flex items-center gap-2">
          <DashboardChip
            label={groupAccent}
            tone={group.bucket === 'open_now' ? 'blue' : group.bucket === 'closed' ? 'emerald' : 'slate'}
          />
          <DashboardChip
            label={`${group.campaigns.length} campaign${group.campaigns.length === 1 ? '' : 's'}`}
            tone="slate"
          />
        </div>
      }
    >
      <div className="space-y-3">
        <div
          className={`rounded-[18px] border px-4 py-3 text-sm leading-6 ${
            group.bucket === 'open_now'
              ? 'border-[#d6e4e8] bg-[#f3f8f8] text-[#234B57]'
              : group.bucket === 'closed'
                ? 'border-[#d2e6e0] bg-[#eef7f4] text-[#245853]'
                : group.bucket === 'archive'
                  ? 'border-[color:var(--border)] bg-[color:var(--bg)] text-[color:var(--text)]'
                  : 'border-[#eadfbe] bg-[#faf6ea] text-[#6f5820]'
          }`}
        >
          {group.bucket === 'open_now'
            ? 'Start hier wanneer je nu een managementbesluit of eerste vervolgroute moet kiezen.'
            : group.bucket === 'building'
              ? 'Houd hier vooral voortgang en leesdiscipline scherp; nog niet elk beeld is al besluitklaar.'
              : group.bucket === 'closed'
                ? 'Gebruik deze groep voor rapportbespreking, terugblik en het kiezen van vervolg of follow-up.'
                : 'Laat archiefcampagnes bewust onderaan staan tenzij je echt een oudere campaign terug moet halen.'}
        </div>
        {group.campaigns.map((campaign) => (
          <CampaignLauncherCard key={campaign.campaign.campaign_id} campaign={campaign} />
        ))}
      </div>
    </DashboardDisclosure>
  )
}

function CampaignLauncherCard({ campaign }: { campaign: HomeCampaignCardModel }) {
  const scanDefinition = getScanDefinition(campaign.campaign.scan_type)
  const cardTone =
    campaign.bucket === 'open_now'
      ? 'border-[#d6e4e8] bg-[linear-gradient(180deg,rgba(243,248,248,0.68),rgba(255,255,255,0.98))]'
      : campaign.bucket === 'closed'
        ? 'border-[#d2e6e0] bg-[linear-gradient(180deg,rgba(238,247,244,0.74),rgba(255,255,255,0.98))]'
        : campaign.bucket === 'archive'
          ? 'border-[color:var(--border)] bg-[linear-gradient(180deg,rgba(248,249,250,0.94),rgba(255,255,255,0.98))]'
          : 'border-[#eadfbe] bg-[linear-gradient(180deg,rgba(250,246,234,0.76),rgba(255,255,255,0.98))]'

  return (
    <article className={`rounded-[24px] border px-4 py-4 shadow-[0_10px_30px_rgba(19,32,51,0.05)] sm:px-5 ${cardTone}`}>
      <div className="flex flex-col gap-3 xl:flex-row xl:items-start xl:justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <DashboardChip
              label={scanDefinition.productName}
              tone={campaign.campaign.scan_type === 'retention' ? 'emerald' : 'blue'}
            />
            <DashboardChip label={campaign.statusLabel} tone={campaign.statusTone} />
            <DashboardChip label={campaign.periodLabel} tone="slate" />
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <h2 className="text-lg font-semibold text-[color:var(--ink)]">{campaign.title}</h2>
            <span
              className={`rounded-full px-3 py-1 text-[11px] font-semibold ${
                campaign.primaryAction.available
                  ? campaign.primaryAction.kind === 'pdf'
                    ? 'bg-[#eef7f4] text-[#245853]'
                    : 'bg-[#f3f8f8] text-[#234B57]'
                  : 'bg-[color:var(--bg)] text-[color:var(--muted)]'
              }`}
            >
              {campaign.primaryAction.kind === 'pdf'
                ? 'PDF eerst'
                : campaign.primaryAction.kind === 'setup'
                  ? 'Setup eerst'
                  : campaign.primaryAction.available
                    ? 'Dashboard eerst'
                    : 'Nog niet openen'}
            </span>
          </div>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-[color:var(--text)]">{campaign.managementSummary}</p>
        </div>

        <div className="grid gap-2 sm:grid-cols-2 xl:min-w-[360px] xl:grid-cols-4">
          {campaign.metrics.map((metric) => (
            <CompactMetric key={metric.label} label={metric.label} value={metric.value} />
          ))}
        </div>
      </div>

      <div className="mt-3 flex flex-col gap-3 border-t border-[color:var(--border)]/80 pt-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0 pr-2">
          <p className="text-sm leading-6 text-[color:var(--text)]">{campaign.actionSummary}</p>
        </div>
        <div className="flex flex-wrap items-start gap-2">
          <PrimaryLauncherAction campaign={campaign.campaign} action={campaign.primaryAction} compact />
          {campaign.secondaryAction ? (
            <SecondaryLauncherAction campaign={campaign.campaign} action={campaign.secondaryAction} compact />
          ) : null}
        </div>
      </div>
    </article>
  )
}

function PrimaryLauncherAction({
  campaign,
  action,
  compact = false,
}: {
  campaign: CampaignStats
  action: HomeActionModel
  compact?: boolean
}) {
  return <LauncherAction campaign={campaign} action={action} compact={compact} primary />
}

function SecondaryLauncherAction({
  campaign,
  action,
  compact = false,
}: {
  campaign: CampaignStats
  action: HomeActionModel
  compact?: boolean
}) {
  return <LauncherAction campaign={campaign} action={action} compact={compact} primary={false} />
}

function LauncherAction({
  campaign,
  action,
  compact,
  primary,
}: {
  campaign: CampaignStats
  action: HomeActionModel
  compact: boolean
  primary: boolean
}) {
  const wrapperClassName = compact
    ? 'flex max-w-[250px] flex-col items-start gap-1'
    : 'flex max-w-[280px] flex-col items-start gap-1'

  if (action.kind === 'pdf' && action.available) {
    return (
      <div className={wrapperClassName}>
        <PdfDownloadButton
          campaignId={campaign.campaign_id}
          campaignName={campaign.campaign_name}
          scanType={campaign.scan_type}
        />
        <p className="text-[11px] leading-5 text-[color:var(--muted)]">{action.description}</p>
      </div>
    )
  }

  if (action.available && action.href) {
    return (
      <div className={wrapperClassName}>
        <Link
          href={action.href}
          className={`inline-flex rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
            primary
              ? 'border border-[color:var(--ink)] bg-[color:var(--ink)] text-[color:var(--bg)] hover:bg-slate-900'
              : 'border border-[#d6e4e8] bg-[#f3f8f8] text-[#234B57] hover:border-[#bfd3d8] hover:bg-[#e9f2f3]'
          }`}
        >
          {action.label}
        </Link>
        <p className="text-[11px] leading-5 text-[color:var(--muted)]">{action.description}</p>
      </div>
    )
  }

  return (
    <div className={wrapperClassName}>
      <span className="inline-flex rounded-full border border-[color:var(--border)] bg-[color:var(--bg)] px-4 py-2 text-sm font-semibold text-[color:var(--muted)]">
        {action.label}
      </span>
      <p className="text-[11px] leading-5 text-[color:var(--muted)]">{action.reason ?? action.description}</p>
    </div>
  )
}

function ActionChoiceCard({
  title,
  description,
  tone,
}: {
  title: string
  description: string
  tone: 'blue' | 'emerald'
}) {
  return (
    <div
      className={`rounded-[18px] border px-4 py-3 ${
        tone === 'emerald' ? 'border-[#d2e6e0] bg-[#eef7f4]' : 'border-[#d6e4e8] bg-[#f3f8f8]'
      }`}
    >
      <p
        className={`text-[10px] font-semibold uppercase tracking-[0.18em] ${
          tone === 'emerald' ? 'text-[#245853]' : 'text-[#234B57]'
        }`}
      >
        {title}
      </p>
      <p className="mt-1 text-sm leading-6 text-[color:var(--ink)]">{description}</p>
    </div>
  )
}

function CompactMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[18px] border border-[color:var(--border)]/90 bg-white/90 px-3 py-2">
      <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[color:var(--muted)]">{label}</p>
      <p className="mt-1 text-sm font-semibold text-[color:var(--ink)]">{value}</p>
    </div>
  )
}

function getRecommendationWhyNow(campaign: CampaignStats) {
  if (!campaign.is_active) {
    return 'Deze campaign is gesloten en daardoor vooral sterk als deelbaar rapport, terugblik en vervolggesprek.'
  }

  if (campaign.total_invited === 0) {
    return 'De eerstvolgende waarde zit nu in setup en livegang, niet in inhoudelijke lezing.'
  }

  if (campaign.total_completed < 10) {
    return 'Deze campaign bouwt op, maar heeft nog geen volledig patroonbeeld. Het dashboard is hier vooral een voortgangsread.'
  }

  return 'Deze campaign heeft genoeg respons om direct als managementinstrument te gebruiken voor prioritering en vervolg.'
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

function AdminEmptyState() {
  return (
    <DashboardSection
      eyebrow="Setup"
      title="Nog geen campaigns om te lanceren"
      description="Voeg eerst organisatie, campaign en respondentbestand toe. Daarna verandert deze homepage vanzelf in een decision-first launcher."
      aside={<DashboardChip label="Setup eerst" tone="amber" />}
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
          body="Kies de juiste scan en zet de campaign klaar met de benodigde metadata."
          tone="blue"
        />
        <DashboardPanel
          eyebrow="Stap 3"
          title="Respondenten"
          body="Importeer respondenten zodat deze homepage daarna echte keuze in plaats van uitleg kan tonen."
          tone="emerald"
        />
      </div>
      <div className="mt-5">
        <Link
          href="/beheer"
          className="inline-flex rounded-full bg-[color:var(--ink)] px-4 py-2 text-sm font-semibold text-[color:var(--bg)] transition-colors hover:bg-slate-900"
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
      title="Er is nog geen campaign om te openen"
      description="Verisight zet eerst de campaign op. Zodra er iets te kiezen valt, wordt deze homepage automatisch een launcher met een duidelijke aanbevolen volgende stap."
      aside={<DashboardChip label="Nog geen keuze nodig" tone="slate" />}
    >
      <div className="grid gap-4 md:grid-cols-3">
        <DashboardPanel
          eyebrow="Nu nog niet"
          title="Geen cockpitgedrag"
          body="Deze homepage blijft bewust rustig totdat er een echte campaignkeuze is om te maken."
          tone="slate"
        />
        <DashboardPanel
          eyebrow="Daarna"
          title="Dashboard of PDF wordt vanzelf duidelijk"
          body="Zodra de eerste campaign live staat, zie je direct welke route je opent en welk document eventueel al mee kan."
          tone="blue"
        />
        <DashboardPanel
          eyebrow="Support"
          title="Verisight beheert de setup"
          body="Respondentimport, uitnodigingen en livegang blijven bewust buiten jouw primaire startscherm."
          tone="emerald"
        />
      </div>
    </DashboardSection>
  )
}

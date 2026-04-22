import Link from 'next/link'
import { MarketingCalloutBand } from '@/components/marketing/marketing-callout-band'
import {
  MarketingHeroIntro,
  MarketingHeroStage,
  MarketingHeroSupport,
} from '@/components/marketing/marketing-hero'
import { MarketingInlineContactPanel } from '@/components/marketing/marketing-inline-contact-panel'
import { MarketingComparisonTable } from '@/components/marketing/marketing-comparison-table'
import { MarketingPageShell } from '@/components/marketing/marketing-page-shell'
import { MarketingProofStrip } from '@/components/marketing/marketing-proof-strip'
import { MarketingSection } from '@/components/marketing/marketing-section'
import { SectionHeading } from '@/components/marketing/section-heading'
import { buildContactHref } from '@/lib/contact-funnel'

const routeFitCards = [
  'Wanneer een breder organisatie- of groepssignaal al zichtbaar is en de volgende vraag lokaal scherper moet worden.',
  'Wanneer team- of afdelingscontext nu de echte vervolgvraag is, niet alleen monitoring of ritme.',
  'Wanneer management een specialistische lokale read nodig heeft om eerste gesprek, verificatie en eigenaar te bepalen.',
] as const

const visibilityCards = [
  {
    title: 'Waar lokaal eerst verificatie nodig is',
    body: 'TeamScan maakt zichtbaar welke afdelings- of teamcontext nu als eerste bounded verificatie en gesprek vraagt.',
  },
  {
    title: 'Waar leidingcontext meespeelt',
    body: 'De route laat zien waar teamdynamiek, leiding en werkcontext lokaal frictie of ontlasting veroorzaken zonder manager ranking te openen.',
  },
  {
    title: 'Waar lokale handoff logisch wordt',
    body: 'TeamScan helpt bepalen welke owner, eerste actie en reviewgrens passen bij een specialistische lokale vervolgstap.',
  },
] as const

const includedItems = [
  'Een lokale managementread na een bestaand breder signaal of managementbeeld.',
  'Suppressie-aware uitsplitsing op team- of afdelingscontext waar dat veilig en bestuurlijk bruikbaar is.',
  'Een eerste lokale owner, eerste actie en expliciete reviewgrens voor de vervolgstap.',
  'Duidelijke grens tussen TeamScan, Segment Deep Dive en een bredere kernroute.',
] as const

const trustCards = [
  {
    title: 'Wel specialistische support-route, geen extra hoofdroute',
    body: 'TeamScan ondersteunt de bestaande architectuur en opent geen nieuwe publieke hoofdwedge naast ExitScan of RetentieScan.',
  },
  {
    title: 'Wel specialistische lokale read, geen simpele bounded utility',
    body: 'De route is inhoudelijk zwaarder dan een lichte hercheck: TeamScan vernauwt een bestaand signaal naar lokale context en managementhuddle.',
  },
  {
    title: 'Wel lokale context, geen brede teamscan',
    body: 'De output blijft begrensd en managementgericht, zonder brede teamsuite, manager ranking of causale teambewijslijn.',
  },
] as const

export function TeamScanSpecialistPage() {
  return (
    <MarketingPageShell
      theme="support"
      pageType="product"
      ctaHref={buildContactHref({ routeInterest: 'nog-onzeker', ctaSource: 'product_team_primary_cta' })}
      ctaLabel="Bespreek TeamScan"
      heroIntro={
        <MarketingHeroIntro>
          <p className="marketing-hero-eyebrow text-slate-700">TeamScan</p>
          <h1 className="marketing-hero-title marketing-hero-title-detail font-display text-[var(--ink)]">
            Gebruik TeamScan wanneer een breder signaal lokaal eerst verificatie vraagt.
          </h1>
          <p className="marketing-hero-copy text-[var(--text)]">
            TeamScan is een specialistische support-route voor lokale team- en leidingcontext. De pagina helpt bepalen
            wanneer een bestaand signaal vernauwd moet worden naar afdelings- of teamniveau, zonder dat TeamScan als
            core route of als simpele bounded utility gaat lezen.
          </p>
        </MarketingHeroIntro>
      }
      heroStage={
        <MarketingHeroStage className="h-full">
          <div className="space-y-5">
            <span className="marketing-stage-tag border border-white/12 bg-white/6 text-[#DCEFEA]">Specialistische support-route</span>
            <h2 className="marketing-stage-title font-display text-white">
              Voor lokale verificatie, teamcontext en een eerste gerichte managementhuddle.
            </h2>
            <p className="marketing-stage-copy text-slate-300">
              De route is smaller dan een core product, maar zwaarder dan een lichte follow-on utility: TeamScan
              specialiseert een bestaand signaal naar lokale context, owner en eerste actie.
            </p>
            <div className="space-y-3">
              {[
                'Werk vanuit een bestaand breder signaal of eerdere route.',
                'Vernauw daarna naar team- of afdelingscontext waar lokale verificatie nodig is.',
                'Sluit af met managementhuddle, owner en expliciete reviewgrens.',
              ].map((item) => (
                <div
                  key={item}
                  className="rounded-[1.15rem] border border-white/10 bg-white/5 px-4 py-3 text-sm leading-7 text-slate-200"
                >
                  {item}
                </div>
              ))}
            </div>
          </div>
        </MarketingHeroStage>
      }
      heroSupport={
        <MarketingHeroSupport>
          <div className="marketing-support-note">
            <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">Portfolio-rol</p>
            <p className="mt-2 text-sm leading-7 text-[var(--text)]">
              TeamScan is een specialistische support-route en geen extra hoofdroute.
            </p>
          </div>
          <div className="marketing-support-note">
            <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">Heldere grens</p>
            <p className="mt-2 text-sm leading-7 text-[var(--text)]">
              Geen brede teamscan, geen manager ranking en geen simpele bounded utility.
            </p>
          </div>
          <div className="marketing-link-grid">
            <Link
              href="/producten/retentiescan"
              className="marketing-link-card text-sm font-medium text-slate-700 transition-colors hover:border-slate-300 hover:text-slate-950"
            >
              Bekijk RetentieScan
            </Link>
            <Link
              href="/vertrouwen"
              className="marketing-link-card text-sm font-medium text-slate-700 transition-colors hover:border-slate-300 hover:text-slate-950"
            >
              Bekijk trustgrenzen
            </Link>
          </div>
        </MarketingHeroSupport>
      }
    >
      <MarketingSection tone="surface">
        <SectionHeading
          eyebrow="Routefit"
          title="Kies TeamScan wanneer lokale team- of leidingcontext nu de echte vervolgvraag is."
          description="Deze route wordt logisch nadat een breder signaal al bestaat en management vooral wil weten waar lokale verificatie, gesprek en eerste actie nu het meest nodig zijn."
        />
        <div className="mt-10 grid gap-8 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="grid gap-4">
            {routeFitCards.map((item) => (
              <div key={item} className="marketing-feature-card">
                <p className="text-sm leading-7 text-[var(--text)]">{item}</p>
              </div>
            ))}
            <div className="marketing-feature-card border-[#DCEFEA] bg-[#F7F5F1]">
              <p className="text-sm font-semibold text-[var(--ink)]">Wanneer TeamScan niet logisch is</p>
              <p className="mt-3 text-sm leading-7 text-[var(--text)]">
                Als er nog geen breder patroonbeeld ligt of als de vraag juist om een compacte reviewlaag vraagt, blijft een andere route logischer.
              </p>
            </div>
          </div>
          <div className="min-w-0">
            <MarketingComparisonTable
              columns={['Situatie', 'Route die eerst past', 'Waarom TeamScan daarna anders is']}
              rows={[
                [
                  'Er is een breed signaal, maar lokale context is nog onduidelijk.',
                  'TeamScan.',
                  'De route vernauwt het bestaande beeld naar afdelings- of teamcontext met specialistische verificatie-logica.',
                ],
                [
                  'Er is vooral een compact reviewmoment nodig na een eerdere read.',
                  'Pulse.',
                  'Pulse blijft lichter; TeamScan is specialistischer en lokaler dan een gewone bounded utility.',
                ],
                [
                  'Er is alleen beschrijvende segmentverdieping nodig binnen een bestaande scan.',
                  'Segment Deep Dive.',
                  'TeamScan voegt een eigen managementhandoff en lokale actielogica toe in plaats van alleen beschrijvende verdieping.',
                ],
              ]}
            />
          </div>
        </div>
      </MarketingSection>

      <MarketingSection tone="plain">
        <SectionHeading
          eyebrow="Lokale context"
          title="De route vernauwt een bestaand signaal naar team- of afdelingscontext zonder een brede teamsuite te openen."
          description="TeamScan specialiseert een bestaand patroon naar lokale context. Daardoor blijft de route duidelijk achter de core architectuur, maar inhoudelijk zwaarder dan een lichte follow-on utility."
        />
        <div className="mt-10 grid gap-5 lg:grid-cols-2">
          <div className="marketing-feature-card">
            <p className="text-base font-semibold text-[var(--ink)]">Lokale team- en leidingcontext</p>
            <p className="mt-3 text-sm leading-7 text-[var(--text)]">
              De route helpt bepalen waar afdelingscontext, teamdynamiek en leiding nu eerst verduidelijking of gesprek vragen.
            </p>
          </div>
          <div className="marketing-feature-card">
            <p className="text-base font-semibold text-[var(--ink)]">Geen nieuwe routehiërarchie</p>
            <p className="mt-3 text-sm leading-7 text-[var(--text)]">
              TeamScan blijft ondersteunend aan het bestaande portfolio en opent geen extra hoofdwedge naast de dual-core routes.
            </p>
          </div>
        </div>
      </MarketingSection>

      <MarketingSection tone="tint">
        <SectionHeading
          eyebrow="Wat zichtbaar wordt"
          title="Zie waar team- of afdelingscontext nu eerst verificatie vraagt."
          description="De route maakt zichtbaar waar een bestaand people-signaal lokaal verder moet worden gelezen om eerste eigenaar, gesprek en begrensde actie te bepalen."
        />
        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {visibilityCards.map((card) => (
            <div key={card.title} className="marketing-feature-card">
              <p className="text-base font-semibold text-[var(--ink)]">{card.title}</p>
              <p className="mt-3 text-sm leading-7 text-[var(--text)]">{card.body}</p>
            </div>
          ))}
        </div>
      </MarketingSection>

      <MarketingSection tone="surface">
        <SectionHeading
          eyebrow="Deliverable en handoff"
          title="U ontvangt een lokale managementread met eerste eigenaar, actie en reviewgrens."
          description="De deliverable is specialistischer dan een lichte vervolgroute: TeamScan levert lokale managementduiding en een expliciete handoff voor de eerstvolgende contextgebonden stap."
        />
        <div className="mt-10 grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
          <MarketingProofStrip
            items={[
              {
                title: 'Bestaand signaal eerst',
                body: 'TeamScan start pas nadat een breder organisatie- of groepssignaal al bestuurlijk zichtbaar is.',
              },
              {
                title: 'Lokale managementread',
                body: 'De route laat zien waar lokale verificatie, gesprek en eigenaar het eerst nodig zijn in team- of afdelingscontext.',
              },
              {
                title: 'Begrensde handoff',
                body: 'De output eindigt bij owner, eerste lokale actie en duidelijke reviewgrens voor de vervolgstap.',
              },
            ]}
          />
          <div className="marketing-feature-card">
            <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-[#3C8D8A]">Wat u ontvangt</p>
            <ul className="mt-4 space-y-3">
              {includedItems.map((item) => (
                <li key={item} className="flex items-start gap-3 text-sm leading-7 text-[var(--text)]">
                  <span className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-[#3C8D8A]" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </MarketingSection>

      <MarketingSection tone="tint">
        <SectionHeading
          eyebrow="Scope en grenzen"
          title="TeamScan blijft begrensd: geen brede teamscan, geen manager ranking."
          description="De route blijft specialistisch en contextgebonden. TeamScan opent geen brede teamsuite, geen managerbeoordeling en geen causale lokale bewijsclaim."
        />
        <div className="mt-10 grid gap-8 lg:grid-cols-[1.02fr_0.98fr]">
          <div className="marketing-feature-card">
            <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-[#3C8D8A]">Waar de route voor dient</p>
            <p className="mt-4 text-sm leading-7 text-[var(--text)]">
              Gebruik TeamScan voor specialistische lokale verificatie nadat een breder signaal al staat en management vooral wil weten waar team- of afdelingscontext nu eerst aandacht vraagt.
            </p>
          </div>
          <div className="marketing-route-card-dark bg-[linear-gradient(180deg,#1b2e45_0%,#132033_100%)]">
            <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-[#DCEFEA]">Wat deze route niet is</p>
            <h2 className="mt-4 text-[clamp(1.8rem,3vw,2.7rem)] font-light leading-[1.08] tracking-[-0.03em] text-[#F7F5F1]">
              Geen brede teamscan of simpele bounded utility.
            </h2>
            <p className="mt-4 text-sm leading-7 text-[rgba(247,245,241,0.72)]">
              TeamScan is te specialistisch om als lichte utility te lezen en te begrensd om als nieuwe core route te openen.
            </p>
            <div className="mt-6 rounded-[1.15rem] border border-white/10 bg-white/5 px-4 py-4 text-sm leading-7 text-[rgba(247,245,241,0.82)]">
              Lokale verificatie en managementcontext blijven het werkgebied van TeamScan.
            </div>
          </div>
        </div>
      </MarketingSection>

      <MarketingSection tone="surface">
        <SectionHeading
          eyebrow="Trust en guardrails"
          title="TeamScan is een specialistische support-route, geen extra hoofdroute."
          description="De trustlaag bevestigt dat TeamScan inhoudelijk serieus is, maar zichtbaar ondersteunend blijft aan de bestaande dual-core architectuur."
        />
        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {trustCards.map((card) => (
            <div key={card.title} className="marketing-feature-card">
              <p className="text-base font-semibold text-[var(--ink)]">{card.title}</p>
              <p className="mt-3 text-sm leading-7 text-[var(--text)]">{card.body}</p>
            </div>
          ))}
        </div>
      </MarketingSection>

      <MarketingSection tone="plain">
        <MarketingCalloutBand
          eyebrow="Volgende stap"
          title="Wilt u toetsen of TeamScan nu de juiste specialistische vervolgstap is?"
          body="Beschrijf kort welk bredere signaal al zichtbaar is en waar de lokale onzekerheid nu zit. Dan bepalen we of TeamScan past of dat een andere route logischer blijft."
          primaryHref={buildContactHref({ routeInterest: 'nog-onzeker', ctaSource: 'product_team_closing_cta' })}
          primaryLabel="Plan kennismaking"
          secondaryHref="/producten"
          secondaryLabel="Bekijk producten"
        />
      </MarketingSection>

      <MarketingSection tone="surface">
        <div id="kennismaking">
          <MarketingInlineContactPanel
            eyebrow="Kennismaking"
            title="Bespreek of TeamScan nu past"
            body="Beschrijf kort welk bredere signaal al speelt en waar de lokale team- of leidingcontext nu het eerst verduidelijking vraagt. Dan toetsen we of TeamScan logisch is."
            defaultRouteInterest="nog-onzeker"
            defaultCtaSource="product_team_form"
          />
        </div>
      </MarketingSection>
    </MarketingPageShell>
  )
}

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
import { PreviewEvidenceRail } from '@/components/marketing/preview-evidence-rail'
import { PreviewSlider } from '@/components/marketing/preview-slider'
import { MarketingSection } from '@/components/marketing/marketing-section'
import { SectionHeading } from '@/components/marketing/section-heading'
import { buildContactHref } from '@/lib/contact-funnel'

const routeFitCards = [
  'Wanneer de managementvraag specifiek gaat over vroege landing van nieuwe medewerkers in een lifecycle-checkpoint.',
  'Wanneer de vraag breder en zelfstandiger is dan een gewone support-check, maar smaller dan een complete employee journey-suite.',
  'Wanneer rol, leiding, team en werkcontext vroeg moeten worden gelezen om eerste borging of correctie te bepalen.',
] as const

const visibilityCards = [
  {
    title: 'Landing in rol en verwachtingen',
    body: 'U ziet of nieuwe medewerkers vroeg voldoende helderheid, richting en startzekerheid ervaren in hun rol.',
  },
  {
    title: 'Landing in leiding en teamcontext',
    body: 'De route maakt zichtbaar waar leiding, teamopname en dagelijkse werkcontext vroeg steun of correctie vragen.',
  },
  {
    title: 'Landing in eerste borging',
    body: 'Onboarding 30-60-90 helpt bepalen welke owner, eerste actie en reviewgrens nu logisch zijn voor de volgende checkpoint-read.',
  },
] as const

const includedItems = [
  'Een lifecycle-checkpoint read op groepsniveau voor nieuwe medewerkers in deze fase.',
  'Een managementread rond rol, leiding, team en werkcontext in dezelfde leeslijn.',
  'Een eerste owner, eerste actie en expliciete reviewgrens voor de volgende stap.',
  'Duidelijke grens tussen deze route, bredere retentievragen en client onboarding.',
] as const

const trustCards = [
  {
    title: 'Wel peer product, geen suite-oversell',
    body: 'Onboarding 30-60-90 opent een eigen managementvraag rond vroege landing en eerste handoff, zonder zich voor te doen als brede lifecycle-suite.',
  },
  {
    title: 'Wel lifecycle-read, geen journey-suite',
    body: 'De route verkoopt geen brede lifecycle-automatisering, geen multi-checkpoint orchestration en geen algemene onboardingmachine.',
  },
  {
    title: 'Wel groepsduiding, geen individueel oordeel',
    body: 'Output blijft managementgericht en groepsgewijs, zonder individuele onboardingbeoordeling, manageroordeel of retentieclaim.',
  },
] as const

export function OnboardingPeerPage() {
  return (
    <MarketingPageShell
      theme="neutral"
      pageType="product"
      ctaHref={buildContactHref({ routeInterest: 'onboarding', ctaSource: 'product_onboarding_primary_cta' })}
      ctaLabel="Bespreek onboarding"
      heroIntro={
        <MarketingHeroIntro>
          <p className="marketing-hero-eyebrow text-amber-700">Onboarding 30-60-90</p>
          <h1 className="marketing-hero-title marketing-hero-title-detail font-display text-[var(--ink)]">
            Gebruik Onboarding 30-60-90 wanneer u vroeg wilt zien hoe nieuwe medewerkers nu landen.
          </h1>
          <p className="marketing-hero-copy text-[var(--text)]">
            Onboarding 30-60-90 is een lifecycle-checkpoint route met een eigen managementvraag. De pagina maakt zichtbaar
            wanneer vroege landing, eerste frictie, owner en eerste handoff nu centraal staan, zonder journey-engine,
            automation-claim of brede lifecycle-suite.
          </p>
        </MarketingHeroIntro>
      }
      heroStage={
        <MarketingHeroStage className="h-full">
          <div className="space-y-5">
            <span className="marketing-stage-tag border border-white/12 bg-white/6 text-amber-100">Peer product voor vroege landing</span>
            <h2 className="marketing-stage-title font-display text-white">
              Een volwassen managementread voor vroege landing, eerste eigenaar en bounded review.
            </h2>
            <p className="marketing-stage-copy text-slate-300">
              Deze route is sterk genoeg om zelfstandig te openen wanneer de first-90-days vraag zelf centraal staat,
              maar blijft begrensd genoeg om geen journey-suite of pseudo-SaaS-sprong te claimen.
            </p>
            <div className="space-y-3">
              {[
                'Open de route wanneer de lifecycle-vraag zelf nu centraal staat.',
                'Lees vroege landingssignalen in rol, leiding, team en werkcontext.',
                'Sluit af met owner, eerste actie en een heldere reviewgrens.',
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
              Onboarding 30-60-90 is een eigen peer-context voor vroege landing, eerste handoff en eerste managementinterventie.
            </p>
          </div>
          <div className="marketing-support-note">
            <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">Heldere grens</p>
            <p className="mt-2 text-sm leading-7 text-[var(--text)]">
              Geen client onboarding-tool, geen brede journey-suite en geen vervanging van RetentieScan wanneer brede behoudsdruk centraal staat.
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
          title="Kies Onboarding 30-60-90 wanneer de lifecycle-vraag zelf nu centraal staat."
          description="Deze route wordt logisch wanneer de vraag specifiek gaat over vroege landing van nieuwe medewerkers en niet vooral over uitstroom, behoudsdruk of een kleine lokale support-check."
        />
        <div className="mt-10 grid gap-8 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="grid gap-4">
            {routeFitCards.map((item) => (
              <div key={item} className="marketing-feature-card">
                <p className="text-sm leading-7 text-[var(--text)]">{item}</p>
              </div>
            ))}
            <div className="marketing-feature-card border-[#F2E3C2] bg-[#FFF8EC]">
              <p className="text-sm font-semibold text-[var(--ink)]">Wanneer deze route niet logisch is</p>
              <p className="mt-3 text-sm leading-7 text-[var(--text)]">
                Als de vraag vooral draait om actieve behoudsdruk, terugkijkende uitstroom of een kleine verificatie na een bestaand signaal, is een andere route logischer.
              </p>
            </div>
          </div>
          <div className="min-w-0">
            <MarketingComparisonTable
              columns={['Vraag', 'Route die eerst past', 'Waarom onboarding hier anders is']}
              rows={[
                [
                  'We willen vroeg zien hoe nieuwe medewerkers in deze fase landen.',
                  'Onboarding 30-60-90.',
                  'De lifecycle-checkpoint vraag staat zelf centraal en vraagt een eigen managementread.',
                ],
                [
                  'We willen eerder zien waar behoud in de brede populatie onder druk staat.',
                  'RetentieScan.',
                  'Dat is een behoudsvraag op groepsniveau, niet een specifieke onboarding-checkpoint vraag.',
                ],
                [
                  'We willen technisch of operationeel klanten goed live laten gaan.',
                  'Client onboarding buiten deze productroute.',
                  'Deze pagina gaat over medewerkerservaring en vroege lifecycle-duiding, niet over delivery onboarding.',
                ],
              ]}
            />
          </div>
        </div>
      </MarketingSection>

      <MarketingSection tone="plain">
        <SectionHeading
          eyebrow="Lifecycle-context"
          title="De route opent een eigen lifecycle-checkpoint zonder de dual-core architectuur over te nemen."
          description="Onboarding 30-60-90 is een serieuze route met eigen context, maar claimt geen hoofdarchitectuur boven ExitScan en RetentieScan."
        />
        <div className="mt-10 grid gap-5 lg:grid-cols-2">
          <div className="marketing-feature-card">
            <p className="text-base font-semibold text-[var(--ink)]">Eigen lifecycle-vraag</p>
            <p className="mt-3 text-sm leading-7 text-[var(--text)]">
              De route staat open zodra management vroeg wil begrijpen hoe nieuwe medewerkers nu landen in rol, leiding, team en werkcontext.
            </p>
          </div>
          <div className="marketing-feature-card">
            <p className="text-base font-semibold text-[var(--ink)]">Geen route-dominantie</p>
            <p className="mt-3 text-sm leading-7 text-[var(--text)]">
              Onboarding 30-60-90 wordt publiek niet opgevoerd als vervanger van de dual-core routes, maar als aparte peer-context binnen het portfolio.
            </p>
          </div>
        </div>
      </MarketingSection>

      <MarketingSection tone="tint">
        <SectionHeading
          eyebrow="Wat zichtbaar wordt"
          title="Zie hoe nieuwe medewerkers nu landen in rol, leiding, team en werkcontext."
          description="De route maakt vroeg zichtbaar waar onboarding in deze fase steun, borging of kleine correctie vraagt in plaats van brede suite-logica op te roepen."
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
          title="U ontvangt een checkpoint-read met owner, eerste actie en reviewgrens."
          description="De deliverable is concreet genoeg om als echte route te lezen, maar blijft begrensd rond één lifecycle-checkpoint en een eerste managementhuddle."
        />
        <div className="mt-10 grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
          <MarketingProofStrip
            items={[
              {
                title: 'Checkpoint-read',
                body: 'De route opent één lifecycle-meting op groepsniveau voor nieuwe medewerkers in deze fase.',
              },
              {
                title: 'Owner en eerste actie',
                body: 'De output eindigt bij een eerste owner, kleine correctie of borging en een heldere vervolgvraag.',
              },
              {
                title: 'Reviewgrens',
                body: 'De route sluit af met een expliciete reviewgrens zodat onboarding niet ongemerkt in een open suite verandert.',
              },
            ]}
          />
          <div className="marketing-feature-card">
            <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-amber-700">Wat u ontvangt</p>
            <ul className="mt-4 space-y-3">
              {includedItems.map((item) => (
                <li key={item} className="flex items-start gap-3 text-sm leading-7 text-[var(--text)]">
                  <span className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-amber-600" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </MarketingSection>

      <MarketingSection tone="plain">
        <div id="preview">
          <SectionHeading
            eyebrow="Preview"
            title="Zie hoe Onboarding 30-60-90 als managementinstrument leest."
            description="Deze preview laat dezelfde executive leeslijn zien als de live output: managementsamenvatting, bestuurlijke handoff, eerste werkspoor, owner, eerste stap en bounded reviewgrens."
          />
          <div className="mt-10 space-y-6">
            <PreviewSlider variant="onboarding" />
            <PreviewEvidenceRail className="mt-6" variant="onboarding" />
          </div>
        </div>
      </MarketingSection>

      <MarketingSection tone="tint">
        <SectionHeading
          eyebrow="Scope en grenzen"
          title="De route blijft begrensd: geen journey-suite, geen client onboardinglaag."
          description="Onboarding 30-60-90 is een lifecycle-checkpoint route, niet een brede employee journey-engine of technische client onboardinglaag."
        />
        <div className="mt-10 grid gap-8 lg:grid-cols-[1.02fr_0.98fr]">
          <div className="marketing-feature-card">
            <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-amber-700">Waar de route voor dient</p>
            <p className="mt-4 text-sm leading-7 text-[var(--text)]">
              Gebruik de route voor een vroege lifecycle-checkpoint read wanneer nieuwe medewerkers nu landen en management een eerste borgings- of correctiestap wil bepalen.
            </p>
          </div>
          <div className="marketing-route-card-dark bg-[linear-gradient(180deg,#3f2b08_0%,#241507_100%)]">
            <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-[#F6E7C1]">Wat deze route niet is</p>
            <h2 className="mt-4 text-[clamp(1.8rem,3vw,2.7rem)] font-light leading-[1.08] tracking-[-0.03em] text-[#FFF8EC]">
              Geen journey-suite of client onboardinglaag.
            </h2>
            <p className="mt-4 text-sm leading-7 text-[rgba(255,248,236,0.76)]">
              De route claimt geen multi-checkpoint orchestration, geen brede employee lifecycle-suite en geen technische onboardingdienst voor klanten.
            </p>
            <div className="mt-6 rounded-[1.15rem] border border-white/10 bg-white/5 px-4 py-4 text-sm leading-7 text-[rgba(255,248,236,0.84)]">
              Lifecycle-fit blijft de kern, niet portfolio-dominantie.
            </div>
          </div>
        </div>
      </MarketingSection>

      <MarketingSection tone="surface">
        <SectionHeading
          eyebrow="Trust en guardrails"
          title="Onboarding 30-60-90 is een serieuze route, maar geen nieuwe dominante hoofdwedge."
          description="De trustlaag maakt zichtbaar dat de route zelfstandig genoeg is om serieus genomen te worden, maar niet zo breed dat zij de publieke hoofdarchitectuur overschrijft."
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
          title="Wilt u toetsen of Onboarding 30-60-90 nu de juiste route is?"
          body="Beschrijf kort welke lifecycle-vraag nu speelt, of het om nieuwe medewerkers gaat en waar borging of correctie het eerst nodig lijkt. Dan bepalen we of deze route past of dat een andere route logischer is."
          primaryHref={buildContactHref({ routeInterest: 'onboarding', ctaSource: 'product_onboarding_closing_cta' })}
          primaryLabel="Plan kennismaking"
          secondaryHref="/producten"
          secondaryLabel="Bekijk producten"
        />
      </MarketingSection>

      <MarketingSection tone="surface">
        <div id="kennismaking">
          <MarketingInlineContactPanel
            eyebrow="Kennismaking"
            title="Bespreek of Onboarding 30-60-90 nu past"
            body="Beschrijf kort welke lifecycle-vraag rond nieuwe medewerkers nu speelt en of het gaat om een vroeg checkpoint, een bredere behoudsvraag of juist client onboarding. Dan toetsen we welke route logisch is."
            defaultRouteInterest="onboarding"
            defaultCtaSource="product_onboarding_form"
          />
        </div>
      </MarketingSection>
    </MarketingPageShell>
  )
}

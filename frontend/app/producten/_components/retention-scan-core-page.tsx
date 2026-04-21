import { MarketingCalloutBand } from '@/components/marketing/marketing-callout-band'
import {
  MarketingHeroIntro,
  MarketingHeroStage,
  MarketingHeroSupport,
} from '@/components/marketing/marketing-hero'
import { MarketingInlineContactPanel } from '@/components/marketing/marketing-inline-contact-panel'
import { MarketingComparisonTable } from '@/components/marketing/marketing-comparison-table'
import { MarketingPageShell } from '@/components/marketing/marketing-page-shell'
import { PreviewEvidenceRail } from '@/components/marketing/preview-evidence-rail'
import { SampleShowcaseCard } from '@/components/marketing/sample-showcase-card'
import { MarketingSection } from '@/components/marketing/marketing-section'
import { SectionHeading } from '@/components/marketing/section-heading'
import { buildContactHref } from '@/lib/contact-funnel'
import { getPrimarySampleShowcaseAsset } from '@/lib/sample-showcase-assets'

const retentionSampleAsset = getPrimarySampleShowcaseAsset('retention')

const routeFitCards = [
  'Wanneer u eerder wilt zien waar behoud nu onder druk staat in de actieve populatie.',
  'Wanneer HR, sponsor, MT of directie een groepsbeeld nodig heeft voordat uitstroom zich verder opstapelt.',
  'Wanneer de actieve behoudsvraag nu voorrang heeft boven terugkijkende vertrekduiding.',
] as const

const visibilityCards = [
  {
    title: 'Waar Retentiesignaal en aanvullende signalen verschuiven',
    body: 'U ziet waar behoud op groepsniveau onder druk staat via Retentiesignaal, aanvullende signalen en vertrekdruk in dezelfde managementleeslijn.',
  },
  {
    title: 'Welke werkfactoren nu het verschil maken',
    body: 'Leiderschap, werkbelasting, groei, rolhelderheid en teamcontext worden zichtbaar als beinvloedbare factoren achter behoudsdruk.',
  },
  {
    title: 'Waar eerste opvolging logisch wordt',
    body: 'De managementread helpt prioriteren welke groepen, factoren of acties eerst verificatie en opvolging vragen.',
  },
] as const

const includedItems = [
  'Een RetentieScan Baseline als compacte eerste route voor vroegsignalering op behoud.',
  'Dashboard met Retentiesignaal, aanvullende signalen, vertrekdruk en managementread in dezelfde leesvolgorde.',
  'Managementrapport voor HR, MT en directie met bestuurlijke handoff.',
  'Eerste managementsessie om prioriteiten, verificatiespoor en eerste actie te bepalen.',
  'Privacy-, claims- en interpretatiekaders in gewone taal, zonder individuele signalen naar management.',
] as const

const trustCards = [
  {
    title: 'Wel groepssignalen, geen individuele voorspelling',
    body: 'RetentieScan ondersteunt groepsduiding en prioritering, maar verkoopt geen individuele voorspelling of persoonsgerichte actieroute.',
  },
  {
    title: 'Wel prioriteiten, geen diagnose',
    body: 'De route laat Retentiesignaal, aanvullende signalen en werkfactoren zien als managementsignalen, niet als diagnostische waarheid of gegarandeerde voorspeller.',
  },
  {
    title: 'Wel routefit, geen universele eerste stap',
    body: 'RetentieScan is sterk wanneer actieve behoudsdruk nu centraal staat. Als de vraag eerst terugkijkt op uitstroom, is ExitScan logischer.',
  },
] as const

export function RetentionScanCorePage() {
  return (
    <MarketingPageShell
      theme="retention"
      pageType="product"
      ctaHref={buildContactHref({ routeInterest: 'retentiescan', ctaSource: 'product_retention_primary_cta' })}
      ctaLabel="Plan kennismaking"
      heroIntro={
        <MarketingHeroIntro>
          <p className="marketing-hero-eyebrow text-[#3C8D8A]">RetentieScan</p>
          <h1 className="marketing-hero-title marketing-hero-title-detail font-display text-[var(--ink)]">
            Gebruik RetentieScan wanneer u eerder wilt zien waar behoud onder druk staat.
          </h1>
          <p className="marketing-hero-copy text-[var(--text)]">
            RetentieScan is de core route voor vroegsignalering op behoud op groepsniveau. De pagina helpt vooral toetsen
            of actieve behoudsdruk nu de open managementvraag is; als de vraag eerst terugkijkt op uitstroom, is ExitScan
            logischer.
          </p>
        </MarketingHeroIntro>
      }
      heroStage={
        <MarketingHeroStage className="h-full">
          <div className="space-y-5">
            <span className="marketing-stage-tag border border-white/12 bg-white/6 text-[#DCEFEA]">Core route</span>
            <h2 className="marketing-stage-title font-display text-white">
              Voor Retentiesignaal, aanvullende signalen en een eerste bestuurlijke handoff.
            </h2>
            <p className="marketing-stage-copy text-slate-300">
              De eerste route blijft compact: baseline eerst, ritme alleen wanneer opvolging, reviewmoment en eigenaar
              later al staan.
            </p>
            <div className="space-y-3">
              {[
                'Maak behoudsdruk zichtbaar voordat uitstroom verder oploopt.',
                'Verbind Retentiesignaal, aanvullende signalen en werkfactoren in dezelfde managementtaal.',
                'Lever dashboard, rapport en eerste managementsessie in een vaste leeslijn.',
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
            <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">Routefit</p>
            <p className="mt-2 text-sm leading-7 text-[var(--text)]">
              RetentieScan is sterk wanneer de organisatie eerder wil zien waar behoud nu onder druk staat.
            </p>
          </div>
          <div className="marketing-support-note">
            <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
              Dual-core guardrail
            </p>
            <p className="mt-2 text-sm leading-7 text-[var(--text)]">
              Als de vraag eerst terugkijkt op vertrek in plaats van actieve behoudsdruk, is ExitScan logischer.
            </p>
          </div>
        </MarketingHeroSupport>
      }
    >
      <MarketingSection tone="surface">
        <SectionHeading
          eyebrow="Routefit"
          title="Kies RetentieScan wanneer actieve behoudsdruk nu de open managementvraag is."
          description="Deze core page verkoopt een route voor een specifieke vraag. RetentieScan is niet automatisch de eerste stap voor iedere buyer; de route past vooral wanneer de actieve populatie nu om vroegsignalering vraagt."
        />
        <div className="mt-10 grid gap-8 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="grid gap-4">
            {routeFitCards.map((item) => (
              <div key={item} className="marketing-feature-card">
                <p className="text-sm leading-7 text-[var(--text)]">{item}</p>
              </div>
            ))}
            <div className="marketing-feature-card border-[#DCEFEA] bg-[#F7F5F1]">
              <p className="text-sm font-semibold text-[var(--ink)]">Wanneer RetentieScan niet eerst is</p>
              <p className="mt-3 text-sm leading-7 text-[var(--text)]">
                Als de vraag eerst wil begrijpen waarom mensen al zijn vertrokken en welke vertrekpatronen terugkeren,
                is ExitScan logischer.
              </p>
            </div>
          </div>
          <div className="min-w-0">
            <MarketingComparisonTable
              columns={['Routevorm', 'Wanneer logisch', 'Wat het doet']}
              rows={[
                [
                  'RetentieScan Baseline',
                  'Wanneer u eerst een bestuurlijke read op actieve behoudsdruk nodig heeft.',
                  'Levert een eerste managementbeeld met Retentiesignaal, topfactoren en handoff.',
                ],
                [
                  'RetentieScan ritmeroute',
                  'Pas nadat baseline, opvolging en reviewmoment al staan.',
                  'Houdt verschuiving in Retentiesignaal en topfactoren bij zonder de eerste koop te vervangen.',
                ],
                [
                  'ExitScan',
                  'Wanneer terugkijkende vertrekduiding nu de primaire vraag is.',
                  'Opent een andere core route voor patroonduiding op uitstroom.',
                ],
              ]}
            />
          </div>
        </div>
      </MarketingSection>

      <MarketingSection tone="tint">
        <SectionHeading
          eyebrow="Wat zichtbaar wordt"
          title="Zie waar Retentiesignaal, aanvullende signalen en vertrekdruk nu samenkomen."
          description="RetentieScan vertaalt signalen uit de actieve populatie naar bestuurlijke taal: waar staat behoud onder druk, welke factoren wegen zwaar en waar hoort eerste opvolging te beginnen."
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
          eyebrow="Deliverable en proof"
          title="U ontvangt een bestuurlijke read, rapport en voorbeeldbare deliverable."
          description="Proof moet op de core page laten zien wat management echt krijgt. Daarom staan voorbeeldrapport, preview en evidence in dezelfde route-specifieke leeslijn."
        />
        <div className="mt-10 grid gap-8 xl:grid-cols-[minmax(0,1.02fr)_minmax(0,0.98fr)]">
          <div>
            <div className="marketing-panel p-8">
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#3C8D8A]">Wat management ontvangt</p>
              <h3 className="mt-4 text-3xl font-semibold text-slate-950">
                Een leesbare managementstructuur van cover tot eerste vervolgstap.
              </h3>
              <p className="mt-4 text-sm leading-7 text-slate-600">
                De deliverable blijft compact en bestuurlijk: cover, bestuurlijke read, eerste managementsessie,
                verificatiespoor en pas daarna de eerste logische vervolgstap.
              </p>
            </div>
            <PreviewEvidenceRail className="mt-6" variant="retention" />
          </div>

          <div className="grid gap-5">
            {retentionSampleAsset ? (
              <SampleShowcaseCard
                eyebrow="RetentieScan-proof"
                title="Gebruik het voorbeeldrapport als deliverable-proof, niet als predictorclaim."
                body="Dit buyer-facing voorbeeld laat dezelfde managementstructuur zien als de echte RetentieScan-output. Daarmee blijft proof verbonden aan de route in plaats van aan losse beloftes."
                asset={retentionSampleAsset}
                linkLabel="Open RetentieScan-voorbeeldrapport"
              />
            ) : null}
          </div>
        </div>
      </MarketingSection>

      <MarketingSection tone="tint">
        <SectionHeading
          eyebrow="Scope en inbegrepen"
          title="De route blijft compact: baseline eerst, ritme alleen bewust."
          description="RetentieScan verkoopt een afgebakende eerste route. Herhaalvorm kan later logisch worden, maar bepaalt niet de kern van deze page family."
        />
        <div className="mt-10 grid gap-8 lg:grid-cols-[1.02fr_0.98fr]">
          <div className="marketing-feature-card">
            <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-[#3C8D8A]">Altijd inbegrepen</p>
            <ul className="mt-4 space-y-3">
              {includedItems.map((item) => (
                <li key={item} className="flex items-start gap-3 text-sm leading-7 text-[var(--text)]">
                  <span className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-[#3C8D8A]" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div className="marketing-route-card-dark bg-[linear-gradient(180deg,#1b2e45_0%,#132033_100%)]">
            <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-[#DCEFEA]">Bewuste vervolgstap</p>
            <h2 className="mt-4 text-[clamp(1.8rem,3vw,2.7rem)] font-light leading-[1.08] tracking-[-0.03em] text-[#F7F5F1]">
              Compacte vervolgmeting blijft een lichtere vervolgcomponent.
            </h2>
            <p className="mt-4 text-sm leading-7 text-[rgba(247,245,241,0.72)]">
              Een ritmeroute of compacte vervolgmeting komt pas in beeld wanneer baseline, eerste opvolging en reviewmoment
              al staan. Zo blijft de eerste koop scherp en verandert de page niet in een platte catalogus.
            </p>
            <div className="mt-6 rounded-[1.15rem] border border-white/10 bg-white/5 px-4 py-4 text-sm leading-7 text-[rgba(247,245,241,0.82)]">
              Geen brede MTO, geen parallel hoofdpackage en geen verborgen derde route in deze core page.
            </div>
          </div>
        </div>
      </MarketingSection>

      <MarketingSection tone="surface">
        <SectionHeading
          eyebrow="Trust en grenzen"
          title="RetentieScan geeft groepssignalen en prioriteiten, geen individuele voorspelling."
          description="De trustlaag moet precies bevestigen wat deze core route wel en niet belooft: bruikbare groepsduiding, zonder individuele signalen naar management, predictorclaim of schijnzekerheid."
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
          title="Wilt u toetsen of RetentieScan nu de juiste eerste route is?"
          body="Beschrijf kort waar behoud nu onder druk staat. Dan toetsen we of RetentieScan de juiste core route is, hoe de deliverable eruitziet en welke vervolgstap bewust later moet blijven."
          primaryHref={buildContactHref({ routeInterest: 'retentiescan', ctaSource: 'product_retention_closing_cta' })}
          primaryLabel="Plan een kennismaking"
          secondaryHref="/vertrouwen"
          secondaryLabel="Lees trust en privacy"
        />
      </MarketingSection>

      <MarketingSection tone="surface">
        <div id="kennismaking">
          <MarketingInlineContactPanel
            eyebrow="Kennismaking"
            title="Plan een gesprek over RetentieScan"
            body="Beschrijf kort waar behoud nu onder druk staat. Dan toetsen we of RetentieScan de juiste eerste stap is en hoe de aanpak eruitziet."
            defaultRouteInterest="retentiescan"
            defaultCtaSource="product_retention_form"
          />
        </div>
      </MarketingSection>
    </MarketingPageShell>
  )
}

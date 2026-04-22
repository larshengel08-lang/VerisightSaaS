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

const exitSampleAsset = getPrimarySampleShowcaseAsset('exit')

const routeFitCards = [
  'Wanneer u uitstroom achteraf bestuurlijk wilt duiden.',
  'Wanneer HR, sponsor, MT of directie eerst een leesbaar patroonbeeld nodig heeft.',
  'Wanneer losse exitinput nog geen consistente managementread oplevert.',
] as const

const visibilityCards = [
  {
    title: 'Welke vertrekpatronen terugkeren',
    body: 'U ziet welke thema’s zich herhalen over vertrekredenen, werkfrictie en werkomstandigheden in dezelfde bestuurlijke leeslijn.',
  },
  {
    title: 'Welke werkfactoren het zwaarst wegen',
    body: 'Leiderschap, werkbelasting, rolhelderheid, groei of teamcontext worden zichtbaar als terugkerende werkfactoren in plaats van losse vermoedens.',
  },
  {
    title: 'Waar eerste actie logisch wordt',
    body: 'De managementread helpt prioriteren welke vraag eerst geverifieerd, besproken of opgepakt moet worden.',
  },
] as const

const includedItems = [
  'Een ExitScan Baseline als compacte eerste route voor vertrekduiding.',
  'Dashboard met prioriteiten, factoranalyse en managementread in dezelfde leesvolgorde.',
  'Managementrapport voor HR, MT en directie met bestuurlijke handoff.',
  'Eerste managementsessie om prioriteiten, verificatiespoor en eerste actie te bepalen.',
  'Privacy-, claims- en interpretatiekaders in gewone taal.',
] as const

const trustCards = [
  {
    title: 'Wel groepsduiding, geen individuele beoordeling',
    body: 'ExitScan ondersteunt managementduiding op groepsniveau en verkoopt geen individuele beoordeling of causale zekerheid.',
  },
  {
    title: 'Wel signalen, geen diagnose',
    body: 'De route laat terugkerende patronen en werkfactoren zien, maar pretendeert geen diagnostisch oordeel of gegarandeerde oorzaak-gevolgread.',
  },
  {
    title: 'Wel routefit, geen universele eerste stap',
    body: 'ExitScan is sterk wanneer vertrekduiding nu centraal staat. Als de actieve behoudsvraag nu voorop staat, is RetentieScan logischer.',
  },
] as const

export function ExitScanCorePage() {
  return (
    <MarketingPageShell
      theme="exit"
      pageType="product"
      ctaHref={buildContactHref({ routeInterest: 'exitscan', ctaSource: 'product_exit_primary_cta' })}
      ctaLabel="Plan kennismaking"
      heroIntro={
        <MarketingHeroIntro>
          <p className="marketing-hero-eyebrow text-[#3C8D8A]">ExitScan</p>
          <h1 className="marketing-hero-title marketing-hero-title-detail font-display text-[var(--ink)]">
            Gebruik ExitScan wanneer u vertrek eerst bestuurlijk wilt duiden.
          </h1>
          <p className="marketing-hero-copy text-[var(--text)]">
            ExitScan is de core route voor terugkijkende vertrekduiding op groepsniveau. De pagina helpt vooral toetsen
            of uitstroom nu de open managementvraag is en opent met Frictiescore als eerste managementsamenvatting; als
            actieve behoudsdruk nu primair is, is RetentieScan logischer.
          </p>
        </MarketingHeroIntro>
      }
      heroStage={
        <MarketingHeroStage className="h-full">
          <div className="space-y-5">
            <span className="marketing-stage-tag border border-white/12 bg-white/6 text-[#DCEFEA]">Core route</span>
            <h2 className="marketing-stage-title font-display text-white">
              Voor Frictiescore, werkfrictie en een eerste bestuurlijke handoff.
            </h2>
            <p className="marketing-stage-copy text-slate-300">
              De eerste route blijft compact: baseline eerst, ritme alleen wanneer proces, eigenaar en volume later al
              staan.
            </p>
            <div className="space-y-3">
              {[
                'Open met Frictiescore en duid terugkerende uitstroompatronen in dezelfde managementtaal.',
                'Maak werkfactoren en eerste verificatievragen bestuurlijk leesbaar.',
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
              ExitScan is sterk wanneer de organisatie eerst wil begrijpen wat uitstroom werkelijk vertelt.
            </p>
          </div>
          <div className="marketing-support-note">
            <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
              Dual-core guardrail
            </p>
            <p className="mt-2 text-sm leading-7 text-[var(--text)]">
              Als de actieve behoudsvraag nu voorop staat en niet de terugblik op vertrek, is RetentieScan logischer.
            </p>
          </div>
        </MarketingHeroSupport>
      }
    >
      <MarketingSection tone="surface">
        <SectionHeading
          eyebrow="Routefit"
          title="Kies ExitScan wanneer vertrekduiding nu de open managementvraag is."
          description="Deze core page verkoopt één route voor één type vraag. ExitScan is niet automatisch de eerste stap voor iedere buyer; de route past vooral wanneer terugkijkende uitstroomduiding nu voorrang heeft."
        />
        <div className="mt-10 grid gap-8 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="grid gap-4">
            {routeFitCards.map((item) => (
              <div key={item} className="marketing-feature-card">
                <p className="text-sm leading-7 text-[var(--text)]">{item}</p>
              </div>
            ))}
            <div className="marketing-feature-card border-[#DCEFEA] bg-[#F7F5F1]">
              <p className="text-sm font-semibold text-[var(--ink)]">Wanneer ExitScan niet eerst is</p>
              <p className="mt-3 text-sm leading-7 text-[var(--text)]">
                Als de vraag niet terugkijkt op uitstroom maar juist wil zien waar behoud nu onder druk staat in de
                actieve populatie, is RetentieScan logischer.
              </p>
            </div>
          </div>
          <div className="min-w-0">
            <MarketingComparisonTable
              columns={['Routevorm', 'Wanneer logisch', 'Wat het doet']}
              rows={[
                [
                  'ExitScan Baseline',
                  'Wanneer u eerst een bestuurlijke read op recent vertrek nodig heeft.',
                  'Levert een eerste managementbeeld met Frictiescore, factoranalyse en handoff.',
                ],
                [
                  'ExitScan ritmeroute',
                  'Pas nadat baseline, eigenaar en proces al staan.',
                  'Houdt actuele uitstroomsignalen bij in dezelfde leeslijn, zonder de eerste koop te vervangen.',
                ],
                [
                  'RetentieScan',
                  'Wanneer actieve behoudsdruk nu de primaire vraag is.',
                  'Opent een andere core route voor vroegsignalering in de actieve populatie.',
                ],
              ]}
            />
          </div>
        </div>
      </MarketingSection>

      <MarketingSection tone="tint">
        <SectionHeading
          eyebrow="Wat zichtbaar wordt"
          title="Zie hoe Frictiescore, vertrekpatronen en werkfrictie samenkomen."
          description="ExitScan vertaalt Frictiescore en vertrekinput naar bestuurlijke taal: wat herhaalt zich, welke factoren wegen het zwaarst en waar hoort eerste verificatie of actie te beginnen."
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
                De deliverable blijft compact en bestuurlijk: cover, responslaag, bestuurlijke handoff, eerste
                managementvraag, eerste verificatiespoor en pas daarna de eerste logische vervolgstap.
              </p>
            </div>
            <PreviewEvidenceRail className="mt-6" variant="exit" />
          </div>

          <div className="grid gap-5">
            {exitSampleAsset ? (
              <SampleShowcaseCard
                eyebrow="ExitScan-proof"
                title="Gebruik het voorbeeldrapport als deliverable-proof, niet als effectclaim."
                body="Dit buyer-facing voorbeeld laat dezelfde managementstructuur zien als de echte ExitScan-output. Daarmee blijft proof verbonden aan de route in plaats van aan losse productclaims."
                asset={exitSampleAsset}
                linkLabel="Open ExitScan-voorbeeldrapport"
              />
            ) : null}
          </div>
        </div>
      </MarketingSection>

      <MarketingSection tone="tint">
        <SectionHeading
          eyebrow="Scope en inbegrepen"
          title="De route blijft compact: baseline eerst, verdieping alleen bewust."
          description="ExitScan verkoopt een afgebakende eerste route. Verdieping kan later logisch worden, maar bepaalt niet de kern van deze page family."
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
            <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-[#DCEFEA]">Bewuste verdieping</p>
            <h2 className="mt-4 text-[clamp(1.8rem,3vw,2.7rem)] font-light leading-[1.08] tracking-[-0.03em] text-[#F7F5F1]">
              Segment Deep Dive blijft optionele verdieping.
            </h2>
            <p className="mt-4 text-sm leading-7 text-[rgba(247,245,241,0.72)]">
              Segment Deep Dive is geen verborgen derde route en geen standaard inbegrepen laag. Deze verdieping komt
              pas in beeld wanneer metadata, aantallen en managementvraag daar echt om vragen.
            </p>
            <div className="mt-6 rounded-[1.15rem] border border-white/10 bg-white/5 px-4 py-4 text-sm leading-7 text-[rgba(247,245,241,0.82)]">
              Baseline blijft de primaire eerste koop. Ritmeroute of add-on volgen alleen wanneer de eerste managementread
              al staat.
            </div>
          </div>
        </div>
      </MarketingSection>

      <MarketingSection tone="surface">
        <SectionHeading
          eyebrow="Trust en grenzen"
          title="ExitScan geeft signalen en managementduiding, geen diagnose."
          description="De trustlaag moet precies bevestigen wat deze core route wel en niet belooft: bruikbare groepsduiding, zonder individuele beoordeling, causaliteitsclaim of schijnzekerheid."
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
          title="Wilt u toetsen of ExitScan nu de juiste eerste route is?"
          body="Beschrijf kort welke vertrekvraag nu bestuurlijk aandacht vraagt. Dan toetsen we of ExitScan de juiste core route is, hoe de deliverable eruitziet en welke vervolgstap bewust later moet blijven."
          primaryHref={buildContactHref({ routeInterest: 'exitscan', ctaSource: 'product_exit_closing_cta' })}
          primaryLabel="Plan een kennismaking"
          secondaryHref="/vertrouwen"
          secondaryLabel="Lees trust en privacy"
        />
      </MarketingSection>

      <MarketingSection tone="surface">
        <div id="kennismaking">
          <MarketingInlineContactPanel
            eyebrow="Kennismaking"
            title="Plan een gesprek over ExitScan"
            body="Beschrijf kort welke vertrekvraag nu bestuurlijk aandacht vraagt. Dan toetsen we of ExitScan de juiste eerste stap is en hoe de aanpak eruitziet."
            defaultRouteInterest="exitscan"
            defaultCtaSource="product_exit_form"
          />
        </div>
      </MarketingSection>
    </MarketingPageShell>
  )
}

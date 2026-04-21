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
  'Wanneer een bestaand people-signaal nu vernauwt naar managementcontext in plaats van team- of afdelingscontext.',
  'Wanneer de vraag vooral gaat over sturing, leidingomgeving en eerste managementverificatie op groepsniveau.',
  'Wanneer u een specialistische managementread nodig heeft zonder named leaders, 360-logica of performanceframing te openen.',
] as const

const visibilityCards = [
  {
    title: 'Waar managementcontext eerst duiding vraagt',
    body: 'Leadership Scan maakt zichtbaar waar leidingomgeving, sturing en managementcontext het bestaande signaal nu verder moeten verklaren.',
  },
  {
    title: 'Waar managementomgeving het signaal versterkt of dempt',
    body: 'De route laat zien waar context rond aansturing, verwachtingen en managementwerking extra verificatie vraagt op groepsniveau.',
  },
  {
    title: 'Waar een eerste managementcheck logisch wordt',
    body: 'Leadership Scan helpt bepalen welke owner, verificatievraag en reviewgrens passen bij de eerstvolgende managementstap.',
  },
] as const

const includedItems = [
  'Een groepsniveau-managementread na een bestaand people-signaal of eerdere route.',
  'Een eerste verificatievraag rond leidingcontext, managementomgeving en sturing in dezelfde leeslijn.',
  'Een owner, eerste managementcheck en expliciete reviewgrens voor de vervolgstap.',
  'Duidelijke grens tussen Leadership Scan, TeamScan en brede leadership- of performance-instrumenten.',
] as const

const trustCards = [
  {
    title: 'Wel specialistische managementroute, geen extra hoofdroute',
    body: 'Leadership Scan ondersteunt de bestaande architectuur en opent geen nieuwe commerciële hoofdwedge naast de dual-core routes.',
  },
  {
    title: 'Wel managementcontext, geen generieke supportpagina',
    body: 'De route is specialistischer dan een algemene supportlaag: ze focust bewust op managementcontext als eigen verificatievraag.',
  },
  {
    title: 'Wel group-level only, geen 360-tool',
    body: 'Output blijft geaggregeerd en managementgericht, zonder named leader readouts, hiërarchiemodel of performanceframing.',
  },
] as const

export function LeadershipSpecialistPage() {
  return (
    <MarketingPageShell
      theme="support"
      pageType="product"
      ctaHref={buildContactHref({ routeInterest: 'leadership', ctaSource: 'product_leadership_primary_cta' })}
      ctaLabel="Bespreek Leadership Scan"
      heroIntro={
        <MarketingHeroIntro>
          <p className="marketing-hero-eyebrow text-slate-700">Leadership Scan</p>
          <h1 className="marketing-hero-title marketing-hero-title-detail font-display text-[var(--ink)]">
            Gebruik Leadership Scan wanneer managementcontext zelf eerst duiding vraagt.
          </h1>
          <p className="marketing-hero-copy text-[var(--text)]">
            Leadership Scan is een specialistische managementroute na een bestaand people-signaal. De pagina helpt
            bepalen wanneer de vervolgvraag niet meer lokaal of breed is, maar specifiek gaat over leidingcontext,
            managementomgeving en eerste verificatie op groepsniveau.
          </p>
        </MarketingHeroIntro>
      }
      heroStage={
        <MarketingHeroStage className="h-full">
          <div className="space-y-5">
            <span className="marketing-stage-tag border border-white/12 bg-white/6 text-[#DCEFEA]">Specialistische managementroute</span>
            <h2 className="marketing-stage-title font-display text-white">
              Voor managementcontext, eerste verificatievraag en een begrensde managementcheck.
            </h2>
            <p className="marketing-stage-copy text-slate-300">
              Leadership Scan leest smaller en managementspecifieker dan TeamScan: niet de lokale teamcontext staat voorop,
              maar de managementomgeving als volgende verklaringslaag.
            </p>
            <div className="space-y-3">
              {[
                'Werk vanuit een bestaand people-signaal of eerdere route.',
                'Vernauw daarna naar managementcontext waar de volgende duiding nodig is.',
                'Sluit af met verificatievraag, owner en reviewgrens op groepsniveau.',
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
              Leadership Scan is een specialistische managementroute en geen extra hoofdroute.
            </p>
          </div>
          <div className="marketing-support-note">
            <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">Heldere grens</p>
            <p className="mt-2 text-sm leading-7 text-[var(--text)]">
              Group-level only, geen 360-tool, geen named leader readout en geen generieke supportpagina.
            </p>
          </div>
          <div className="marketing-link-grid">
            <Link
              href="/producten/teamscan"
              className="marketing-link-card text-sm font-medium text-slate-700 transition-colors hover:border-slate-300 hover:text-slate-950"
            >
              Bekijk TeamScan
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
          title="Kies Leadership Scan wanneer een bestaand signaal nu vernauwt naar leidingcontext."
          description="Deze route wordt logisch wanneer de vervolgvraag niet vooral lokaal, breed of operationeel is, maar specifiek draait om managementomgeving en eerste managementverificatie."
        />
        <div className="mt-10 grid gap-8 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="grid gap-4">
            {routeFitCards.map((item) => (
              <div key={item} className="marketing-feature-card">
                <p className="text-sm leading-7 text-[var(--text)]">{item}</p>
              </div>
            ))}
            <div className="marketing-feature-card border-[#DCEFEA] bg-[#F7F5F1]">
              <p className="text-sm font-semibold text-[var(--ink)]">Wanneer Leadership Scan niet logisch is</p>
              <p className="mt-3 text-sm leading-7 text-[var(--text)]">
                Als de vraag nog breed, lokaal of puur operationeel is, blijft een andere route logischer dan deze managementcontext-verdieping.
              </p>
            </div>
          </div>
          <div className="min-w-0">
            <MarketingComparisonTable
              columns={['Situatie', 'Route die eerst past', 'Waarom Leadership Scan daarna anders is']}
              rows={[
                [
                  'Het signaal moet vooral naar team- of afdelingscontext vernauwen.',
                  'TeamScan.',
                  'TeamScan blijft lokaler; Leadership Scan specialiseert juist naar managementcontext op groepsniveau.',
                ],
                [
                  'De vraag verschuift naar sturing, leidingomgeving en managementwerking.',
                  'Leadership Scan.',
                  'De route opent een specifiekere managementcontext-read zonder named leaders of 360-logica.',
                ],
                [
                  'Er is vooral een compact reviewmoment nodig zonder contextverdieping.',
                  'Pulse.',
                  'Pulse blijft lichter; Leadership Scan is specialistischer en duidender dan een bounded utility.',
                ],
              ]}
            />
          </div>
        </div>
      </MarketingSection>

      <MarketingSection tone="plain">
        <SectionHeading
          eyebrow="Managementcontext"
          title="De route specialiseert naar managementcontext zonder een generieke leadershippage te worden."
          description="Leadership Scan is geen thought-leadership laag, geen performance-instrument en geen brede leiderschapspagina. De route blijft specialistisch en contextgebonden."
        />
        <div className="mt-10 grid gap-5 lg:grid-cols-2">
          <div className="marketing-feature-card">
            <p className="text-base font-semibold text-[var(--ink)]">Managementomgeving als verklaringslaag</p>
            <p className="mt-3 text-sm leading-7 text-[var(--text)]">
              De route helpt bepalen waar sturing, leidingcontext en managementomgeving het bestaande signaal verder moeten verduidelijken.
            </p>
          </div>
          <div className="marketing-feature-card">
            <p className="text-base font-semibold text-[var(--ink)]">Geen generieke leadershippagina</p>
            <p className="mt-3 text-sm leading-7 text-[var(--text)]">
              Leadership Scan blijft een route met een concrete vervolgvraag en geen algemene management- of leiderschapspositie in de hoofdarchitectuur.
            </p>
          </div>
        </div>
      </MarketingSection>

      <MarketingSection tone="tint">
        <SectionHeading
          eyebrow="Wat zichtbaar wordt"
          title="Zie waar leidingcontext, sturing en managementomgeving nu eerst verificatie vragen."
          description="De route maakt zichtbaar waar managementcontext het bestaande signaal beïnvloedt en waar eerste verificatie of gesprek bestuurlijk het meest logisch is."
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
          title="U ontvangt een managementread met eerste verificatievraag, owner en reviewgrens."
          description="De deliverable blijft specialistisch en bestuurlijk: geaggregeerde managementduiding, een eerste verificatievraag en een begrensde volgende stap."
        />
        <div className="mt-10 grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
          <MarketingProofStrip
            items={[
              {
                title: 'Managementcontext eerst',
                body: 'De route helpt bepalen waar leidingcontext en managementomgeving als eerste bounded verificatie vragen.',
              },
              {
                title: 'Groepsniveau blijft leidend',
                body: 'Output blijft geaggregeerd, suppressie-aware en zonder named leader readouts.',
              },
              {
                title: 'Begrensde managementcheck',
                body: 'De eerste uitkomst is een owner, verificatievraag en reviewgrens, niet een brede leadership-suite.',
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
          title="Leadership Scan blijft begrensd: geen 360-tool, geen named leader readout."
          description="De route blijft managementgericht en group-level only. Leadership Scan opent geen hiërarchiemodel, performance-instrument of generieke leadershiptool."
        />
        <div className="mt-10 grid gap-8 lg:grid-cols-[1.02fr_0.98fr]">
          <div className="marketing-feature-card">
            <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-[#3C8D8A]">Waar de route voor dient</p>
            <p className="mt-4 text-sm leading-7 text-[var(--text)]">
              Gebruik Leadership Scan wanneer een bestaand signaal vooral verdere duiding vraagt op managementcontext, leidingomgeving en eerste bestuurlijke verificatie.
            </p>
          </div>
          <div className="marketing-route-card-dark bg-[linear-gradient(180deg,#1b2e45_0%,#132033_100%)]">
            <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-[#DCEFEA]">Wat deze route niet is</p>
            <h2 className="mt-4 text-[clamp(1.8rem,3vw,2.7rem)] font-light leading-[1.08] tracking-[-0.03em] text-[#F7F5F1]">
              Geen 360-tool of generieke managementpagina.
            </h2>
            <p className="mt-4 text-sm leading-7 text-[rgba(247,245,241,0.72)]">
              Leadership Scan is te specialistisch om als generieke supportpagina te lezen en te begrensd om als nieuwe core route te openen.
            </p>
            <div className="mt-6 rounded-[1.15rem] border border-white/10 bg-white/5 px-4 py-4 text-sm leading-7 text-[rgba(247,245,241,0.82)]">
              Group-level only en managementcontext blijven de harde grenzen van deze route.
            </div>
          </div>
        </div>
      </MarketingSection>

      <MarketingSection tone="surface">
        <SectionHeading
          eyebrow="Trust en guardrails"
          title="Leadership Scan is een specialistische managementroute, geen extra hoofdroute."
          description="De trustlaag bevestigt dat Leadership Scan smaller en managementcontext-specifieker is dan TeamScan, zonder weg te glijden naar thought leadership of een extra productwedge."
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
          title="Wilt u toetsen of Leadership Scan nu de juiste managementcontext-route is?"
          body="Beschrijf kort welk bestaande signaal nu speelt en waarom de vraag verschuift naar managementcontext. Dan bepalen we of Leadership Scan logisch is of dat een andere route beter past."
          primaryHref={buildContactHref({ routeInterest: 'leadership', ctaSource: 'product_leadership_closing_cta' })}
          primaryLabel="Plan kennismaking"
          secondaryHref="/producten"
          secondaryLabel="Bekijk producten"
        />
      </MarketingSection>

      <MarketingSection tone="surface">
        <div id="kennismaking">
          <MarketingInlineContactPanel
            eyebrow="Kennismaking"
            title="Bespreek of Leadership Scan nu past"
            body="Beschrijf kort welk bestaand signaal nu speelt en waarom de vraag verschuift naar managementcontext. Dan toetsen we of Leadership Scan de logische specialistische vervolgstap is."
            defaultRouteInterest="leadership"
            defaultCtaSource="product_leadership_form"
          />
        </div>
      </MarketingSection>
    </MarketingPageShell>
  )
}

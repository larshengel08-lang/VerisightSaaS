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
import { MarketingSection } from '@/components/marketing/marketing-section'
import { SectionHeading } from '@/components/marketing/section-heading'
import { buildContactHref } from '@/lib/contact-funnel'

const routeFitCards = [
  'Wanneer een bestaand people-signaal nu vernauwt naar managementcontext in plaats van team- of afdelingscontext.',
  'Wanneer de vraag vooral gaat over leiding, prioritering en werkcontext als volgende verklaringslaag.',
  'Wanneer een kleine, group-level managementcheck logischer is dan een bredere route of een lokale deep dive.',
] as const

const visibilityCards = [
  {
    title: 'Welke managementcontext nu mee kleurt',
    body: 'Leadership Scan maakt zichtbaar waar leidingomgeving, sturing en werkcontext het bestaande signaal nu mede verklaren.',
  },
  {
    title: 'Welke eerstvolgende check volstaat',
    body: 'De route helpt bepalen welke kleine managementcheck nu logisch is zonder named leaders, 360-logica of performanceframing te openen.',
  },
  {
    title: 'Waar de stopgrens moet blijven',
    body: 'Leadership Scan houdt expliciet zichtbaar wanneer group-level duiding genoeg is en wanneer bredere duiding elders hoort.',
  },
] as const

const boundaryCards = [
  {
    title: 'Wel bounded support-route',
    body: 'Leadership Scan ondersteunt een bestaand people-signaal en opent geen extra hoofdroute naast ExitScan of RetentieScan.',
  },
  {
    title: 'Wel managementcontext, geen verborgen peer-product',
    body: 'De route blijft kleiner dan een vol managementinstrument en wordt niet gepositioneerd als een alternatieve peer-suite.',
  },
  {
    title: 'Wel group-level only, geen 360-tool',
    body: 'Output blijft geaggregeerd en managementgericht, zonder named leader readouts, hierarchylogica of performanceoordelen.',
  },
] as const

const includedItems = [
  'Een group-level managementread bovenop een al zichtbaar people-signaal.',
  'Een eerstvolgende managementcheck die past bij leiding, prioritering en werkcontext.',
  'Een reviewgrens die expliciet voorkomt dat Leadership alsnog als quasi-peer rapport gaat lezen.',
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
            Leadership Scan is een bounded support-route na een bestaand people-signaal. De pagina helpt bepalen
            wanneer de vervolgvraag niet meer lokaal of breed is, maar specifiek draait om managementcontext,
            leidingomgeving en een kleine group-level check.
          </p>
        </MarketingHeroIntro>
      }
      heroStage={
        <MarketingHeroStage className="h-full">
          <div className="space-y-5">
            <span className="marketing-stage-tag border border-white/12 bg-white/6 text-[#DCEFEA]">
              Bounded support-route
            </span>
            <h2 className="marketing-stage-title font-display text-white">
              Voor managementcontext, begrensde check en een duidelijke stopgrens.
            </h2>
            <p className="marketing-stage-copy text-slate-300">
              Leadership Scan leest smaller dan TeamScan en lichter dan een vol managementinstrument: niet de lokale
              teamcontext staat voorop, maar de managementomgeving als volgende verklaringslaag.
            </p>
            <div className="space-y-3">
              {[
                'Werk vanuit een bestaand people-signaal of een eerdere route.',
                'Vernauw daarna naar managementcontext waar de volgende duiding nodig is.',
                'Sluit af met een kleine check, reviewgrens en expliciete stop op group-level only.',
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
            <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
              Portfolio-rol
            </p>
            <p className="mt-2 text-sm leading-7 text-[var(--text)]">
              Leadership Scan is een bounded support-route en geen extra hoofdroute.
            </p>
          </div>
          <div className="marketing-support-note">
            <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
              Heldere grens
            </p>
            <p className="mt-2 text-sm leading-7 text-[var(--text)]">
              Group-level only, geen 360-tool, geen named leader readout en geen verborgen peer-product.
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
          title="Kies Leadership Scan wanneer een bestaand signaal nu vernauwt naar managementcontext."
          description="Deze route wordt logisch wanneer de vervolgvraag niet vooral lokaal, breed of operationeel is, maar specifiek draait om managementomgeving en een begrensde managementcheck."
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
                Als de vraag nog breed, lokaal of puur operationeel is, blijft een andere route logischer dan deze
                bounded managementcontext-read.
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
                  'TeamScan blijft lokaler; Leadership Scan houdt het op group-level managementcontext.',
                ],
                [
                  'De vraag verschuift naar sturing, leidingomgeving en managementwerking.',
                  'Leadership Scan.',
                  'De route opent een specifiekere bounded support-read zonder named leaders of 360-logica.',
                ],
                [
                  'Er is vooral een compact reviewmoment nodig zonder extra contextverdieping.',
                  'Pulse.',
                  'Pulse blijft lichter; Leadership Scan leest nog steeds als contextspecifieke duiding bovenop een bestaand signaal.',
                ],
              ]}
            />
          </div>
        </div>
      </MarketingSection>

      <MarketingSection tone="plain">
        <SectionHeading
          eyebrow="Managementvraag"
          title="De managementvraag blijft begrensd en contextspecifiek."
          description="Leadership Scan is geen thought-leadership pagina, geen performance-instrument en geen verborgen peer-route. De route blijft klein genoeg om support-grade te lezen."
        />
        <div className="mt-10 grid gap-5 lg:grid-cols-2">
          <div className="marketing-feature-card">
            <p className="text-base font-semibold text-[var(--ink)]">Wat de route wel doet</p>
            <p className="mt-3 text-sm leading-7 text-[var(--text)]">
              De route helpt bepalen welke managementcontext het bestaande people-signaal nu mede verklaart en welke
              kleine check daar logisch bij hoort.
            </p>
          </div>
          <div className="marketing-feature-card">
            <p className="text-base font-semibold text-[var(--ink)]">Wat de route niet doet</p>
            <p className="mt-3 text-sm leading-7 text-[var(--text)]">
              Leadership Scan opent geen named leader model, geen 360-tool en geen alternatief hoofdrapport naast de
              kernroutes.
            </p>
          </div>
        </div>
      </MarketingSection>

      <MarketingSection tone="tint">
        <SectionHeading
          eyebrow="Wat zichtbaar wordt"
          title="Zie welke managementcontext het bestaande people-signaal nu kleurt."
          description="De route maakt zichtbaar waar managementcontext het bestaande signaal mee helpt verklaren en waar een eerstvolgende begrensde check bestuurlijk het meest logisch is."
        />
        <div className="mt-10 grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="grid gap-5 md:grid-cols-3">
            {visibilityCards.map((card) => (
              <div key={card.title} className="marketing-feature-card">
                <p className="text-base font-semibold text-[var(--ink)]">{card.title}</p>
                <p className="mt-3 text-sm leading-7 text-[var(--text)]">{card.body}</p>
              </div>
            ))}
          </div>
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

      <MarketingSection tone="surface">
        <SectionHeading
          eyebrow="Scope en grenzen"
          title="Leadership Scan blijft een bounded support-route, geen verborgen peer-product."
          description="De route blijft managementgericht en group-level only. Leadership Scan opent geen hierarchylaag, geen 360-tool en geen quasi-peer rapport met andere labels."
        />
        <div className="mt-10 grid gap-8 lg:grid-cols-[1.02fr_0.98fr]">
          <div className="grid gap-4 md:grid-cols-3">
            {boundaryCards.map((card) => (
              <div key={card.title} className="marketing-feature-card">
                <p className="text-base font-semibold text-[var(--ink)]">{card.title}</p>
                <p className="mt-3 text-sm leading-7 text-[var(--text)]">{card.body}</p>
              </div>
            ))}
          </div>
          <div className="marketing-route-card-dark bg-[linear-gradient(180deg,#1b2e45_0%,#132033_100%)]">
            <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-[#DCEFEA]">
              Wat deze route niet is
            </p>
            <h2 className="mt-4 text-[clamp(1.8rem,3vw,2.7rem)] font-light leading-[1.08] tracking-[-0.03em] text-[#F7F5F1]">
              Geen 360-tool of verborgen peer-product.
            </h2>
            <p className="mt-4 text-sm leading-7 text-[rgba(247,245,241,0.72)]">
              Leadership Scan blijft te begrensd om als nieuwe hoofdroute te lezen en te klein om als named leader of
              quasi-peer rapport te worden verkocht.
            </p>
            <div className="mt-6 rounded-[1.15rem] border border-white/10 bg-white/5 px-4 py-4 text-sm leading-7 text-[rgba(247,245,241,0.82)]">
              Group-level only en managementcontext blijven de harde grenzen van deze bounded support-route.
            </div>
          </div>
        </div>
      </MarketingSection>

      <MarketingSection tone="plain">
        <MarketingCalloutBand
          eyebrow="Volgende stap"
          title="Wilt u toetsen of Leadership Scan nu past?"
          body="Beschrijf kort welk bestaand signaal nu speelt en waarom de vraag verschuift naar managementcontext. Dan bepalen we of Leadership Scan logisch is of dat een andere route beter past."
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
            body="Beschrijf kort welk bestaand signaal nu speelt en waarom de vraag verschuift naar managementcontext. Dan toetsen we of Leadership Scan de logische bounded support-route is."
            defaultRouteInterest="leadership"
            defaultCtaSource="product_leadership_form"
          />
        </div>
      </MarketingSection>
    </MarketingPageShell>
  )
}

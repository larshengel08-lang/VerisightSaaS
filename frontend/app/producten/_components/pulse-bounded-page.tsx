import Link from 'next/link'
import { MarketingCalloutBand } from '@/components/marketing/marketing-callout-band'
import {
  MarketingHeroIntro,
  MarketingHeroStage,
  MarketingHeroSupport,
} from '@/components/marketing/marketing-hero'
import { MarketingInlineContactPanel } from '@/components/marketing/marketing-inline-contact-panel'
import { MarketingPageShell } from '@/components/marketing/marketing-page-shell'
import { MarketingSection } from '@/components/marketing/marketing-section'
import { SectionHeading } from '@/components/marketing/section-heading'
import { buildContactHref } from '@/lib/contact-funnel'

const routeFitCards = [
  'Wanneer een eerdere route of managementread al bestuurlijke taal heeft gegeven.',
  'Wanneer de volgende stap vooral gaat over een compacte herijking in plaats van een brede nieuwe ronde.',
  'Wanneer u één direct reviewspoor, één eigenaar en één checkmoment wilt aanscherpen.',
] as const

const reviewCards = [
  {
    title: 'Eerste reviewspoor',
    body: 'Pulse maakt zichtbaar welke actieve pulsefactor nu als eerste compacte reviewvraag geopend moet worden.',
  },
  {
    title: 'Eerste eigenaar',
    body: 'De route stuurt direct op HR met betrokken leidinggevende als eerste eigenaar, zonder brede sponsorlaag als default.',
  },
  {
    title: 'Bounded hercheck',
    body: 'Pulse eindigt bij een expliciet checkmoment en niet bij een brede vervolgarchitectuur of extra analysetrap.',
  },
] as const

const includedItems = [
  'Een compacte managementhandoff op groepsniveau.',
  'Een eerste reviewspoor met actieve pulsefactoren en een begrensde vergelijking met de vorige vergelijkbare Pulse.',
  'Een expliciet reviewmoment voor bounded hercheck en opvolging.',
] as const

const trustCards = [
  {
    title: 'Wel vervolgroute, geen extra hoofdroute',
    body: 'Pulse ondersteunt een bestaand beeld en wordt niet verkocht als nieuwe eerste koop of parallelle kernroute.',
  },
  {
    title: 'Wel vergelijking, geen brede trendclaim',
    body: 'Pulse gebruikt de vorige vergelijkbare Pulse alleen als bounded vergelijking en niet als brede trendmachine of effectbewijs.',
  },
  {
    title: 'Wel herijking, geen mini-RetentieScan',
    body: 'Pulse blijft compact, review-first en bounded. Zonder eerder beeld blijft een kernroute of portfoliokeuze logischer.',
  },
] as const

export function PulseBoundedPage() {
  return (
    <MarketingPageShell
      theme="support"
      pageType="product"
      ctaHref={buildContactHref({ routeInterest: 'nog-onzeker', ctaSource: 'product_pulse_primary_cta' })}
      ctaLabel="Bespreek Pulse"
      heroIntro={
        <MarketingHeroIntro>
          <p className="marketing-hero-eyebrow text-amber-700">Pulse</p>
          <h1 className="marketing-hero-title marketing-hero-title-detail font-display text-[var(--ink)]">
            Gebruik Pulse om compact te herijken wat nu direct aandacht vraagt.
          </h1>
          <p className="marketing-hero-copy text-[var(--text)]">
            Pulse is een bounded vervolgroute na een eerdere managementread of eerste actie. De waarde zit in een
            compacte reviewroute die direct laat zien welk spoor nu herijking vraagt, zonder van Pulse een nieuwe
            hoofdroute te maken.
          </p>
        </MarketingHeroIntro>
      }
      heroStage={
        <MarketingHeroStage className="h-full">
          <div className="space-y-5">
            <span className="marketing-stage-tag border border-white/12 bg-white/6 text-amber-100">Bounded vervolgroute</span>
            <h2 className="marketing-stage-title font-display text-white">
              Compact herijken na een eerdere managementread.
            </h2>
            <p className="marketing-stage-copy text-slate-300">
              Pulse opent geen nieuwe eerste route. De route maakt klein en bestuurlijk leesbaar welke compacte
              reviewvraag nu direct aandacht vraagt en wanneer een bounded hercheck logisch is.
            </p>
            <div className="grid gap-3 sm:grid-cols-3">
              {['Eerste reviewspoor', 'Eerste eigenaar', 'Bounded hercheck'].map((item) => (
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
            <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">Niet als hoofdroute</p>
            <p className="mt-2 text-sm leading-7 text-[var(--text)]">
              Pulse is een bounded vervolgroute en geen nieuwe eerste koop.
            </p>
          </div>
          <div className="marketing-support-note">
            <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">Portfolio-grens</p>
            <p className="mt-2 text-sm leading-7 text-[var(--text)]">
              Als de vraag breder wordt dan een compacte reviewroute, blijft een kernroute of portfoliokeuze logischer.
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
              href="/producten"
              className="marketing-link-card text-sm font-medium text-slate-700 transition-colors hover:border-slate-300 hover:text-slate-950"
            >
              Bekijk producten
            </Link>
          </div>
        </MarketingHeroSupport>
      }
    >
      <MarketingSection tone="surface">
        <SectionHeading
          eyebrow="Wanneer Pulse past"
          title="Gebruik Pulse pas na een eerdere managementread."
          description="Pulse wordt logisch wanneer de eerste vraag al bestuurlijk leesbaar is en de volgende stap vooral gaat over een compacte herijking."
        />
        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {routeFitCards.map((item) => (
            <div key={item} className="marketing-feature-card">
              <p className="text-sm leading-7 text-[var(--text)]">{item}</p>
            </div>
          ))}
        </div>
      </MarketingSection>

      <MarketingSection tone="plain">
        <SectionHeading
          eyebrow="Leidende vraag"
          title="Welke compacte reviewvraag vraagt nu direct aandacht?"
          description="Pulse opent niet breed. De route moet direct leesbaar maken welk spoor nu herijking vraagt, wie het trekt en wanneer u opnieuw kijkt."
        />
        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {reviewCards.map((card) => (
            <div key={card.title} className="marketing-feature-card">
              <p className="text-base font-semibold text-[var(--ink)]">{card.title}</p>
              <p className="mt-3 text-sm leading-7 text-[var(--text)]">{card.body}</p>
            </div>
          ))}
        </div>
      </MarketingSection>

      <MarketingSection tone="surface">
        <SectionHeading
          eyebrow="Output"
          title="Wat u ontvangt is een compacte managementhandoff."
          description="De output blijft bewust klein: één bestuurlijke read, één eerste reviewspoor en één expliciet checkmoment."
        />
        <div className="mt-10 grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
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
          <div className="marketing-feature-card">
            <p className="text-base font-semibold text-[var(--ink)]">Begrensde vergelijking</p>
            <p className="mt-3 text-sm leading-7 text-[var(--text)]">
              Pulse gebruikt de vorige vergelijkbare Pulse alleen als bounded vergelijking bij voldoende data en niet als
              brede trendlaag.
            </p>
          </div>
        </div>
      </MarketingSection>

      <MarketingSection tone="plain">
        <SectionHeading
          eyebrow="Bounded route"
          title="Pulse blijft een bounded vervolgroute."
          description="Pulse blijft klein in belofte, metricdiepte en vervolgstap. Daardoor voelt de route als compacte supportread en niet als mini-RetentieScan."
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
          title="Wilt u toetsen of Pulse nu de logische vervolgstap is?"
          body="Beschrijf kort welke eerdere managementread of eerste actie al staat. Dan bepalen we of Pulse nu de logische compacte herijking is."
          primaryHref={buildContactHref({ routeInterest: 'nog-onzeker', ctaSource: 'product_pulse_closing_cta' })}
          primaryLabel="Plan kennismaking"
          secondaryHref="/producten/retentiescan"
          secondaryLabel="Bekijk RetentieScan"
        />
      </MarketingSection>

      <MarketingSection tone="surface">
        <div id="kennismaking">
          <MarketingInlineContactPanel
            eyebrow="Kennismaking"
            title="Bespreek of Pulse nu past"
            body="Beschrijf kort welke managementread of eerste actie al loopt en welke compacte herijking u nu wilt toetsen. Dan bepalen we of Pulse logisch is of dat een bredere vervolgstap beter past."
            defaultRouteInterest="nog-onzeker"
            defaultCtaSource="product_pulse_form"
          />
        </div>
      </MarketingSection>
    </MarketingPageShell>
  )
}

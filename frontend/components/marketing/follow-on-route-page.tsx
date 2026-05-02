import Link from 'next/link'
import { MarketingCalloutBand } from '@/components/marketing/marketing-callout-band'
import {
  MarketingHeroIntro,
  MarketingHeroStage,
  MarketingHeroSupport,
} from '@/components/marketing/marketing-hero'
import { MarketingPageShell } from '@/components/marketing/marketing-page-shell'
import { MarketingSection } from '@/components/marketing/marketing-section'
import { SectionHeading } from '@/components/marketing/section-heading'
import { buildContactHref } from '@/lib/contact-funnel'
import type { FollowOnRouteContent } from '@/lib/follow-on-route-content'

interface FollowOnRoutePageProps {
  route: FollowOnRouteContent
}

export function FollowOnRoutePage({ route }: FollowOnRoutePageProps) {
  const isCombination = route.slug === 'combinatie'

  return (
    <MarketingPageShell
      theme={isCombination ? 'combination' : 'support'}
      pageType="product"
      ctaHref={buildContactHref({
        routeInterest: route.routeInterest,
        ctaSource: `product_${route.slug}_primary_cta`,
      })}
      ctaLabel="Plan een kennismaking"
      heroIntro={
        <MarketingHeroIntro>
          <p className={`marketing-hero-eyebrow ${isCombination ? 'text-[#3C8D8A]' : 'text-[#8A6B2F]'}`}>{route.title}</p>
          <h1 className="marketing-hero-title marketing-hero-title-detail font-display text-[var(--ink)]">
            {route.heroTitle}
          </h1>
          <p className="marketing-hero-copy text-[var(--text)]">{route.heroBody}</p>
        </MarketingHeroIntro>
      }
      heroStage={
        <MarketingHeroStage className="h-full">
          <div className="space-y-5">
            <span className="marketing-stage-tag border border-white/12 bg-white/6 text-[#DCEFEA]">Begrensde vervolgronde</span>
            <div className="rounded-[1.25rem] border border-white/10 bg-white/5 px-5 py-5">
              <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-[#DCEFEA]">Korte positionering</p>
              <p className="mt-3 text-sm leading-7 text-slate-200">{route.positioning}</p>
            </div>
            <div className="space-y-3">
              {route.whenLogical.map((item) => (
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
            <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">Wat u krijgt</p>
            <p className="mt-2 text-sm leading-7 text-[var(--text)]">{route.whatYouGet[0]}</p>
          </div>
          <div className="marketing-support-note">
            <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">Waarom later</p>
            <p className="mt-2 text-sm leading-7 text-[var(--text)]">{route.whyLater}</p>
          </div>
          <div className="marketing-link-grid">
            <Link
              href={route.relatedRouteHref}
              className="marketing-link-card text-sm font-medium text-slate-700 transition-colors hover:border-slate-300 hover:text-slate-950"
            >
              {route.relatedRouteLabel}
            </Link>
            <Link
              href="/producten"
              className="marketing-link-card text-sm font-medium text-slate-700 transition-colors hover:border-slate-300 hover:text-slate-950"
            >
              Bekijk alle routes
            </Link>
          </div>
        </MarketingHeroSupport>
      }
    >
      <MarketingSection tone="surface">
        <SectionHeading
          eyebrow="Wanneer logisch"
          title={`Gebruik ${route.title} pas wanneer de volgende vraag echt smaller en gerichter is.`}
          description={route.positioning}
        />
        <div className="mt-10 grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="marketing-panel p-7 md:p-8">
            <ul className="space-y-4">
              {route.whenLogical.map((item) => (
                <li key={item} className="flex items-start gap-3 text-sm leading-7 text-[var(--text)]">
                  <span className={`mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full ${isCombination ? 'bg-[#3C8D8A]' : 'bg-[#8A6B2F]'}`} />
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div
            className={`marketing-route-card-dark ${
              isCombination
                ? 'bg-[linear-gradient(180deg,#1b2e45_0%,#132033_100%)]'
                : 'bg-[linear-gradient(180deg,#3F2B08_0%,#241507_100%)]'
            }`}
          >
            <p className={`text-[0.68rem] font-semibold uppercase tracking-[0.18em] ${isCombination ? 'text-[#DCEFEA]' : 'text-[#F6E7C1]'}`}>
              Waarom later
            </p>
            <h2 className="mt-4 text-[clamp(1.7rem,2.7vw,2.4rem)] font-light leading-[1.08] tracking-[-0.03em] text-[#F7F5F1]">
              Geen eerste kernroute.
            </h2>
            <p className="mt-4 text-sm leading-7 text-[rgba(247,245,241,0.76)]">{route.whyLater}</p>
            <div className="mt-6 rounded-[1.15rem] border border-white/10 bg-white/5 px-4 py-4 text-sm leading-7 text-[rgba(247,245,241,0.84)]">
              Start dus eerst scherper met ExitScan of RetentieScan wanneer die kernvraag nog niet helder is.
            </div>
          </div>
        </div>
      </MarketingSection>

      <MarketingSection tone="tint">
        <SectionHeading eyebrow="Wat u ontvangt" title={`Wat ${route.title} concreet oplevert.`} description={route.receiveIntro} />
        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {route.whatYouGet.map((item) => (
            <div key={item} className="marketing-feature-card">
              <p className="text-sm leading-7 text-[var(--text)]">{item}</p>
            </div>
          ))}
        </div>
      </MarketingSection>

      <MarketingSection tone="plain">
        <div className="marketing-panel-soft rounded-[1.5rem] border border-[var(--border)] bg-white/80 p-7 md:p-8">
          <p className="text-[0.84rem] font-medium uppercase tracking-[0.18em] text-[var(--petrol)]">Bounded vervolg</p>
          <h2 className="mt-3 text-[clamp(2rem,3vw,3rem)] font-light leading-[1.03] tracking-[-0.04em] text-[var(--ink)]">
            Deze route komt pas in beeld nadat een eerste managementvraag al richting heeft gekregen.
          </h2>
          <p className="mt-4 max-w-[60rem] text-[1rem] leading-8 text-[var(--text)]">{route.whyLater}</p>
        </div>
      </MarketingSection>

      <MarketingSection tone="surface">
        <MarketingCalloutBand
          eyebrow="Volgende stap"
          title={`Toets of ${route.title} nu de volgende logische route is.`}
          body={route.ctaBody}
          primaryHref={buildContactHref({
            routeInterest: route.routeInterest,
            ctaSource: `product_${route.slug}_closing_cta`,
          })}
          primaryLabel="Plan een kennismaking"
          secondaryHref="/producten"
          secondaryLabel="Bekijk alle routes"
        />
      </MarketingSection>
    </MarketingPageShell>
  )
}

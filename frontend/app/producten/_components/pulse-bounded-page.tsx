import Link from 'next/link'
import { MarketingCalloutBand } from '@/components/marketing/marketing-callout-band'
import {
  MarketingHeroIntro,
  MarketingHeroStage,
  MarketingHeroSupport,
} from '@/components/marketing/marketing-hero'
import { MarketingComparisonTable } from '@/components/marketing/marketing-comparison-table'
import { MarketingPageShell } from '@/components/marketing/marketing-page-shell'
import { MarketingProofStrip } from '@/components/marketing/marketing-proof-strip'
import { MarketingSection } from '@/components/marketing/marketing-section'
import { SectionHeading } from '@/components/marketing/section-heading'
import { buildContactHref } from '@/lib/contact-funnel'

const routeFitCards = [
  'Wanneer een eerste route of managementread al een bruikbaar patroonbeeld heeft gegeven.',
  'Wanneer de volgende vraag vooral gaat over monitoring, opvolging of een beperkt reviewmoment.',
  'Wanneer u wilt zien wat nu verschuift zonder opnieuw een brede baseline of nieuwe hoofdroute te openen.',
] as const

const visibilityCards = [
  {
    title: 'Wat nu aantoonbaar beweegt',
    body: 'Pulse laat zien welke prioriteitsfactoren, signalen of werkdruk sinds de vorige bestuurlijke read merkbaar verschuiven.',
  },
  {
    title: 'Waar een korte hercheck genoeg is',
    body: 'De route helpt bepalen waar een compacte reviewlaag volstaat en waar een bredere vervolgronde pas later logisch wordt.',
  },
  {
    title: 'Welk ritme nu past',
    body: 'Pulse maakt zichtbaar wanneer een volgend checkpoint, eigenaarschap of beperkt vervolg logisch is zonder trendtheater.',
  },
] as const

const includedItems = [
  'Een compacte groepssnapshot na een eerder patroonbeeld, baseline of managementread.',
  'Managementreview met prioriteitsfactoren, korte vergelijking en eerste vervolgafspraak in dezelfde leeslijn.',
  'Een expliciet hercheckmoment voor monitoring, opvolging en ritme.',
  'Heldere grens tussen compacte reviewlaag en bredere ritmeroute of nieuwe baseline.',
] as const

const trustCards = [
  {
    title: 'Wel vervolgroute, geen nieuwe start',
    body: 'Pulse ondersteunt een bestaand beeld en wordt niet verkocht als nieuwe eerste koop of parallelle hoofdroute.',
  },
  {
    title: 'Wel monitoring, geen brede trendclaim',
    body: 'De route helpt reviewen wat nu verschuift, maar claimt geen brede trendmachine, effectbewijs of nieuwe baseline over meerdere lagen.',
  },
  {
    title: 'Wel ritme, geen automatische upsell',
    body: 'Pulse wordt alleen logisch wanneer er al een eerder patroonbeeld ligt. Zonder dat beeld blijft een kernroute of portfolio-keuze logischer.',
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
            Gebruik Pulse wanneer u na een eerste route kort wilt toetsen wat nu verschuift.
          </h1>
          <p className="marketing-hero-copy text-[var(--text)]">
            Pulse is een bounded vervolgroute na een eerder patroonbeeld, baseline of managementread. De pagina helpt
            vooral toetsen wanneer een compacte reviewlaag logisch is, zonder van Pulse een nieuwe hoofdroute of extra
            eerste koop te maken.
          </p>
        </MarketingHeroIntro>
      }
      heroStage={
        <MarketingHeroStage className="h-full">
          <div className="space-y-5">
            <span className="marketing-stage-tag border border-white/12 bg-white/6 text-amber-100">Bounded vervolgroute</span>
            <h2 className="marketing-stage-title font-display text-white">
              Review, hercheck en ritme na een eerder managementbeeld.
            </h2>
            <p className="marketing-stage-copy text-slate-300">
              Pulse opent geen nieuwe eerste route. De waarde zit juist in een kleinere herleeslaag na een eerder
              managementbeeld, zodat monitoring en opvolging strak blijven.
            </p>
            <div className="space-y-3">
              {[
                'Stap 1: werk eerst vanuit een bestaand patroonbeeld of eerdere route.',
                'Stap 2: gebruik Pulse om compact te zien wat nu verschuift.',
                'Stap 3: bepaal daarna of review, ritme of een bredere vervolgronde logisch is.',
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
            <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">Niet als hoofdroute</p>
            <p className="mt-2 text-sm leading-7 text-[var(--text)]">
              Pulse is een bounded vervolgroute en geen nieuwe eerste koop.
            </p>
          </div>
          <div className="marketing-support-note">
            <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">Portfolio-grens</p>
            <p className="mt-2 text-sm leading-7 text-[var(--text)]">
              RetentieScan ritmeroute blijft breder wanneer structurelere opvolging nodig is dan een compacte reviewlaag.
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
          eyebrow="Bounded routefit"
          title="Kies Pulse pas nadat een eerste route of patroonbeeld al managementtaal heeft gegeven."
          description="Pulse wordt logisch wanneer de eerste vraag al is geopend en de volgende stap vooral gaat over monitoring, opvolging en een begrensd reviewmoment."
        />
        <div className="mt-10 grid gap-8 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="grid gap-4">
            {routeFitCards.map((item) => (
              <div key={item} className="marketing-feature-card">
                <p className="text-sm leading-7 text-[var(--text)]">{item}</p>
              </div>
            ))}
            <div className="marketing-feature-card border-[#F2E3C2] bg-[#FFF8EC]">
              <p className="text-sm font-semibold text-[var(--ink)]">Wanneer Pulse niet logisch is</p>
              <p className="mt-3 text-sm leading-7 text-[var(--text)]">
                Als er nog geen eerste patroonbeeld of route staat, blijft een kernroute of bewuste portfolio-keuze logischer dan een compacte vervolglaag.
              </p>
            </div>
          </div>
          <div className="min-w-0">
            <MarketingComparisonTable
              columns={['Situatie', 'Kernroute of bestaand beeld', 'Waarom Pulse daarna logisch wordt']}
              rows={[
                [
                  'Na ExitScan ontstaat een eerste managementvraag over opvolging.',
                  'ExitScan geeft vertrekduiding en eerste prioriteiten.',
                  'Pulse helpt kort toetsen wat sinds die read verschuift zonder meteen opnieuw breed te meten.',
                ],
                [
                  'Na RetentieScan Baseline is een compact checkpoint voldoende.',
                  'RetentieScan geeft het eerste behoudsbeeld.',
                  'Pulse ondersteunt een kleiner reviewmoment wanneer ritmeroute nog te breed is.',
                ],
                [
                  'Na een eerder patroonbeeld moet alleen een beperkte hercheck plaatsvinden.',
                  'Er is al bestuurlijke taal, eigenaarschap en eerste actie.',
                  'Pulse maakt monitoring, opvolging en ritme concreet zonder extra hoofdroute te openen.',
                ],
              ]}
            />
          </div>
        </div>
      </MarketingSection>

      <MarketingSection tone="plain">
        <SectionHeading
          eyebrow="Relatie tot eerdere routes"
          title="Pulse volgt op een eerder beeld en opent geen nieuwe hoofdroute."
          description="De route hoort achter een bestaande managementread. Daardoor blijft Pulse ondersteunend aan de dual-core architectuur in plaats van een extra instap naast de kernroutes."
        />
        <div className="mt-10 grid gap-5 lg:grid-cols-2">
          <div className="marketing-feature-card">
            <p className="text-base font-semibold text-[var(--ink)]">Na een kernroute of portfolio-read</p>
            <p className="mt-3 text-sm leading-7 text-[var(--text)]">
              Gebruik Pulse pas nadat ExitScan, RetentieScan of een eerder patroonbeeld al richting heeft gegeven aan de managementvraag.
            </p>
          </div>
          <div className="marketing-feature-card">
            <p className="text-base font-semibold text-[var(--ink)]">Niet als vervanging van bredere opvolging</p>
            <p className="mt-3 text-sm leading-7 text-[var(--text)]">
              Wanneer structurelere opvolging nodig is, blijft een bredere ritmeroute logischer dan Pulse als compacte reviewlaag.
            </p>
          </div>
        </div>
      </MarketingSection>

      <MarketingSection tone="tint">
        <SectionHeading
          eyebrow="Wat zichtbaar wordt"
          title="Zie wat nu verschuift sinds de vorige bestuurlijke read."
          description="Pulse helpt management zien wat sinds het eerdere beeld beweegt, wat review vraagt en welk volgend checkpoint logisch is."
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
          title="U ontvangt een compacte reviewlaag voor monitoring, opvolging en ritme."
          description="De deliverable blijft bewust kleiner dan een eerste baseline: een bounded managementread die helpt om te volgen, te toetsen en het volgende checkmoment scherp te zetten."
        />
        <div className="mt-10 grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
          <MarketingProofStrip
            items={[
              {
                title: 'Compacte snapshot',
                body: 'Pulse laat op groepsniveau zien hoe de huidige werkbeleving en prioriteitsfactoren er nu voor staan.',
              },
              {
                title: 'Begrensde vergelijking',
                body: 'Vergelijking blijft beperkt tot de vorige vergelijkbare read met voldoende data en een duidelijk reviewdoel.',
              },
              {
                title: 'Managementhandoff',
                body: 'De output eindigt bij review, opvolging, eigenaar en expliciet hercheckmoment in plaats van brede trendclaims.',
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

      <MarketingSection tone="tint">
        <SectionHeading
          eyebrow="Scope en inbegrepen"
          title="Pulse blijft bounded: review, hercheck en ritme zonder nieuwe baselineclaim."
          description="Deze route blijft klein en doelgericht. Pulse vervangt geen baseline, nieuwe hoofdroute of brede ritmeronde."
        />
        <div className="mt-10 grid gap-8 lg:grid-cols-[1.02fr_0.98fr]">
          <div className="marketing-feature-card">
            <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-amber-700">Waar Pulse voor dient</p>
            <p className="mt-4 text-sm leading-7 text-[var(--text)]">
              Gebruik Pulse voor review, hercheck en ritme nadat een eerste managementbeeld al bestaat. Daardoor blijft de
              route smaller dan een baseline of bredere ritmeronde.
            </p>
          </div>
          <div className="marketing-route-card-dark bg-[linear-gradient(180deg,#3f2b08_0%,#241507_100%)]">
            <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-[#F6E7C1]">Wat deze route niet is</p>
            <h2 className="mt-4 text-[clamp(1.8rem,3vw,2.7rem)] font-light leading-[1.08] tracking-[-0.03em] text-[#FFF8EC]">
              Geen nieuwe baseline of extra hoofdroute.
            </h2>
            <p className="mt-4 text-sm leading-7 text-[rgba(255,248,236,0.76)]">
              Pulse is geen brede eerste scan, geen parallel kernproduct en geen vervanging van structurelere opvolging wanneer die al nodig is.
            </p>
            <div className="mt-6 rounded-[1.15rem] border border-white/10 bg-white/5 px-4 py-4 text-sm leading-7 text-[rgba(255,248,236,0.84)]">
              Review, hercheck en ritme blijven het werkgebied van Pulse.
            </div>
          </div>
        </div>
      </MarketingSection>

      <MarketingSection tone="surface">
        <SectionHeading
          eyebrow="Trust en grenzen"
          title="Pulse is een vervolgroute, geen nieuwe eerste koop."
          description="De trustlaag bevestigt dat Pulse alleen logisch wordt als bounded vervolgstap na een eerder beeld en nooit als extra hoofdinstap."
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
          body="Beschrijf kort welk eerdere patroonbeeld, welke managementread of welke eerste actie al bestaat. Dan bepalen we of Pulse nu past of dat een bredere vervolgronde logischer is."
          primaryHref={buildContactHref({ routeInterest: 'nog-onzeker', ctaSource: 'product_pulse_closing_cta' })}
          primaryLabel="Plan kennismaking"
          secondaryHref="/producten/retentiescan"
          secondaryLabel="Bekijk RetentieScan"
        />
      </MarketingSection>
    </MarketingPageShell>
  )
}

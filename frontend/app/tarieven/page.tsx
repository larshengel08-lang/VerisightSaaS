import type { Metadata } from 'next'
import { MarketingCalloutBand } from '@/components/marketing/marketing-callout-band'
import { MarketingHeroIntro } from '@/components/marketing/marketing-hero'
import { MarketingPageShell } from '@/components/marketing/marketing-page-shell'
import { MarketingSection } from '@/components/marketing/marketing-section'
import { SectionHeading } from '@/components/marketing/section-heading'
import { buildContactHref } from '@/lib/contact-funnel'

export const metadata: Metadata = {
  title: 'Tarieven',
  description:
    'Prijsankers voor hoofdproducten, compacte add-ons en de portfolioroute zodra beide managementvragen tegelijk spelen.',
  alternates: { canonical: '/tarieven' },
}

const mainRoutes = [
  {
    name: 'ExitScan',
    price: 'Vanaf EUR 2.950',
    note: 'eerste traject',
    body: 'Vaak de eerste entree wanneer de vraag begint bij uitstroom en terugkijkende vertrekduiding.',
  },
  {
    name: 'RetentieScan',
    price: 'Vanaf EUR 2.950',
    note: 'eerste traject',
    body: 'Complementaire hoofdroute wanneer behoudsdruk en vroegsignalering de eerste managementvraag vormen.',
  },
  {
    name: 'TeamScan',
    price: 'Op aanvraag',
    note: 'gerichte hoofdroute',
    body: 'Een peer product met smallere scope: lokale verificatie als eerste route wanneer de vraag team- of afdelingsgericht is.',
  },
  {
    name: 'Onboarding 30-60-90',
    price: 'Op aanvraag',
    note: 'lifecycle-hoofdroute',
    body: 'Een eigen lifecycle-route voor vroege checkpoint-duiding rond nieuwe medewerkers.',
  },
] as const

const lowerRoutes = [
  ['Pulse', 'Compacte reviewroute na eerste diagnose of actie. Geen hoofdproduct, wel een kleinere vervolgstap.'],
  ['Leadership Scan', 'Add-on voor managementcontext na een bestaand signaal. Geen eerste entree.'],
  ['Combinatie', 'Portfolioroute wanneer twee echte managementvragen naast elkaar bestaan. Geen standaardbundel.'],
] as const

const faqItems = [
  {
    q: 'Is dit een licentie of seatmodel?',
    a: 'Nee. Verisight blijft een begeleid productaanbod met vaste routes en prijsankers, niet een self-service licentie.',
  },
  {
    q: 'Waarom staan TeamScan en Onboarding op aanvraag?',
    a: 'Die routes zijn wel peer producten, maar hebben vaker scopes die afhangen van teamgrenzen, lifecycle-opzet of context in de organisatie.',
  },
  {
    q: 'Wanneer wordt Combinatie commercieel logisch?',
    a: 'Pas wanneer vertrekduiding en behoud tegelijk bestuurlijke aandacht vragen. Niet als standaard instap en niet als bundel om alles ineens mee te nemen.',
  },
  {
    q: 'Waar vallen Pulse en Leadership onder?',
    a: 'Dat blijven add-ons: compactere vervolgvragen na een bestaande route, niet de eerste koop.',
  },
] as const

export default function TarievenPage() {
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.verisight.nl/' },
      { '@type': 'ListItem', position: 2, name: 'Tarieven', item: 'https://www.verisight.nl/tarieven' },
    ],
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />

      <MarketingPageShell
        theme="support"
        pageType="pricing"
        ctaHref={buildContactHref({ routeInterest: 'exitscan', ctaSource: 'pricing_primary_cta' })}
        ctaLabel="Plan een kennismaking"
        heroIntro={
          <MarketingHeroIntro>
            <p className="marketing-hero-eyebrow text-[#3C8D8A]">Tarieven</p>
            <h1 className="marketing-hero-title marketing-hero-title-page font-display text-[#132033]">
              Heldere prijsankers per productlaag.
            </h1>
            <p className="marketing-hero-copy text-[#4A5563]">
              Vier routes kunnen zelfstandig starten. Twee routes blijven add-ons. Combinatie is een portfolioroute,
              geen standaardbundel. Zo blijft de prijslogica net zo scherp als de productlogica.
            </p>
          </MarketingHeroIntro>
        }
      >
        <MarketingSection tone="tint">
          <SectionHeading
            eyebrow="Hoofdproducten"
            title="Prijsankers voor de vier routes die zelfstandig kunnen openen."
            description="ExitScan en RetentieScan starten het vaakst. TeamScan en Onboarding blijven peer producten, maar met smallere commerciële scope."
          />
          <div className="mt-12 grid gap-px overflow-hidden rounded-[1.08rem] border border-[#E5E0D6] bg-[#E5E0D6] md:grid-cols-2 xl:grid-cols-4">
            {mainRoutes.map((route) => (
              <div key={route.name} className="bg-[#FFFCF7] p-7">
                <p className="text-[14px] font-medium text-[#132033]">{route.name}</p>
                <p className="mt-4 text-[2rem] font-medium text-[#132033]">{route.price}</p>
                <p className="mt-1 text-[12.5px] uppercase tracking-[0.14em] text-[#667085]">{route.note}</p>
                <p className="mt-5 text-[14px] leading-7 text-[#4A5563]">{route.body}</p>
              </div>
            ))}
          </div>
        </MarketingSection>

        <MarketingSection tone="plain">
          <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="marketing-panel p-8 md:p-9">
              <SectionHeading
                eyebrow="Add-ons en combinatie"
                title="Kleiner of later, maar niet onduidelijk."
                description="Pulse en Leadership blijven commerciële vervolgstappen. Combinatie opent pas als twee echte vragen tegelijk op tafel liggen."
              />
              <div className="mt-8 grid gap-px overflow-hidden rounded-[1rem] border border-[#E5E0D6] bg-[#E5E0D6]">
                {lowerRoutes.map(([title, body]) => (
                  <div key={title} className="bg-[#FFFCF7] px-6 py-5">
                    <p className="text-[15px] font-medium text-[#132033]">{title}</p>
                    <p className="mt-2 text-[14px] leading-7 text-[#4A5563]">{body}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="marketing-panel-dark p-8 md:p-9">
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#9FD1CB]">Commerciële lijn</p>
              <h2 className="mt-4 font-display text-[clamp(2rem,3vw,3rem)] text-white">
                Eerst een gerichte route. Daarna pas verbreden of combineren.
              </h2>
              <p className="mt-5 text-base leading-8 text-slate-300">
                De prijsstructuur voorkomt dat Verisight als brede surveytool of bundel gaat voelen. U koopt eerst
                één scherpe route. Add-ons en de portfolioroute volgen pas wanneer de vraag dat echt vraagt.
              </p>
            </div>
          </div>
        </MarketingSection>

        <MarketingSection tone="plain">
          <SectionHeading eyebrow="Veelgestelde vragen" title="Wat klanten vooraf willen weten." />
          <div className="mt-10 grid gap-px overflow-hidden rounded-[1.08rem] border border-[#E5E0D6] bg-[#E5E0D6] md:grid-cols-2">
            {faqItems.map((item) => (
              <div key={item.q} className="bg-[#FFFCF7] p-7">
                <p className="text-[15.5px] font-medium text-[#132033]">{item.q}</p>
                <p className="mt-2 text-[14.5px] leading-relaxed text-[#4A5563]">{item.a}</p>
              </div>
            ))}
          </div>
        </MarketingSection>

        <MarketingSection tone="plain">
          <MarketingCalloutBand
            eyebrow="Kennismaking"
            title="Wilt u weten welke route nu commercieel het meest logisch is?"
            body="In een kort gesprek maken we snel duidelijk welk hoofdproduct nu past, welke add-ons u beter nog laat wachten en wanneer Combinatie pas echt logisch wordt."
            primaryHref={buildContactHref({ routeInterest: 'exitscan', ctaSource: 'pricing_closing_cta' })}
            primaryLabel="Plan een kennismaking"
            secondaryHref="/producten"
            secondaryLabel="Bekijk producten"
          />
        </MarketingSection>
      </MarketingPageShell>
    </>
  )
}

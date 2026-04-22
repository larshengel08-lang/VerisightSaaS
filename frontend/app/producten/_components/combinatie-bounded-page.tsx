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
import { PreviewEvidenceRail } from '@/components/marketing/preview-evidence-rail'
import { PreviewSlider } from '@/components/marketing/preview-slider'
import { SampleShowcaseCard } from '@/components/marketing/sample-showcase-card'
import { MarketingSection } from '@/components/marketing/marketing-section'
import { SectionHeading } from '@/components/marketing/section-heading'
import { buildContactHref } from '@/lib/contact-funnel'
import { getPrimarySampleShowcaseAsset } from '@/lib/sample-showcase-assets'

const exitSampleAsset = getPrimarySampleShowcaseAsset('exit')
const retentionSampleAsset = getPrimarySampleShowcaseAsset('retention')

const routeFitCards = [
  'Wanneer ExitScan en RetentieScan allebei echt relevant zijn voor dezelfde managementlijn.',
  'Wanneer een eerste kernroute al scherp staat en de tweede route niet als losse upsell voelt.',
  'Wanneer de organisatie zowel terugkijkende vertrekduiding als vroegsignalering op behoud bestuurlijk wil verbinden.',
] as const

const combinedVisibilityCards = [
  {
    title: 'Wat vertrek achteraf vertelt',
    body: 'U houdt ExitScan als bron voor patroonduiding op uitstroom en werkfactoren die al in vertrek zichtbaar werden.',
  },
  {
    title: 'Wat behoud nu vooruit laat zien',
    body: "U voegt RetentieScan toe om eerder te zien waar dezelfde thema's nog doorwerken in de actieve populatie.",
  },
  {
    title: 'Waar een managementlijn ontstaat',
    body: 'De combinatie verbindt beide routes in een gedeelde leeslijn voor prioritering, opvolging en reviewmoment.',
  },
] as const

const includedItems = [
  'Een gedeelde managementstructuur boven op ExitScan en RetentieScan als twee gerichte routes.',
  'Preview en deliverable-proof via de bestaande voorbeeldstructuren van beide kernroutes.',
  'Een gecombineerde managementlijn voor prioriteiten, eerste verificatiespoor en logische vervolgstappen.',
  'Heldere grens tussen kernroutes, portfolioroute en latere bounded vervolglogica.',
] as const

const trustCards = [
  {
    title: 'Wel portfolioroute, geen derde kernproduct',
    body: 'Combinatie bestaat om twee kernroutes bewust te verbinden. Het wordt niet verkocht als derde kernwedge of zelfstandige hoofdinstap.',
  },
  {
    title: 'Wel extra samenhang, geen bundeltheater',
    body: 'De route voegt vooral bestuurlijke samenhang toe boven op twee bestaande producten, niet een bundel met vlakke productpariteit.',
  },
  {
    title: 'Wel keuzehulp, geen vervanging van routefit',
    body: 'De pagina helpt toetsen of beide vragen nu echt samen horen. Als slechts een vraag openligt, blijft een kernroute logischer.',
  },
] as const

export function CombinatieBoundedPage() {
  return (
    <MarketingPageShell
      theme="combination"
      pageType="product"
      ctaHref={buildContactHref({ routeInterest: 'combinatie', ctaSource: 'product_combination_primary_cta' })}
      ctaLabel="Plan kennismaking"
      heroIntro={
        <MarketingHeroIntro>
          <p className="marketing-hero-eyebrow text-[#3C8D8A]">Combinatie</p>
          <h1 className="marketing-hero-title marketing-hero-title-detail font-display text-[var(--ink)]">
            Gebruik Combinatie wanneer beide managementvragen echt naast elkaar zijn komen te liggen.
          </h1>
          <p className="marketing-hero-copy text-[var(--text)]">
            Combinatie is een bounded portfolioroute tussen ExitScan en RetentieScan. De pagina helpt toetsen wanneer
            beide kernroutes samen logisch worden, zonder van Combinatie een derde kernproduct of gelijke hoofdinstap te maken.
          </p>
        </MarketingHeroIntro>
      }
      heroStage={
        <MarketingHeroStage className="h-full">
          <div className="space-y-5">
            <span className="marketing-stage-tag border border-white/12 bg-white/6 text-[#DCEFEA]">Bounded portfolioroute</span>
            <h2 className="marketing-stage-title font-display text-white">
              Verbind ExitScan en RetentieScan pas wanneer beide vragen bestuurlijk echt bestaan.
            </h2>
            <p className="marketing-stage-copy text-slate-300">
              De route werkt pas goed nadat minstens een kernroute scherp staat. Daardoor blijft Combinatie ondersteunend
              aan de dual-core architectuur in plaats van een derde hoofdwedge.
            </p>
            <div className="space-y-3">
              {[
                'Stap 1: bepaal welke kernroute nu eerst telt.',
                'Stap 2: voeg de tweede route toe wanneer de volgende managementvraag echt openligt.',
                'Stap 3: stuur beide routes in een gedeelde managementlijn.',
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
            <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">Niet als kernroute</p>
            <p className="mt-2 text-sm leading-7 text-[var(--text)]">
              Combinatie is geen derde kernproduct en hoort niet te lezen als verplichte of gelijke hoofdinstap.
            </p>
          </div>
          <div className="marketing-link-grid">
            <Link
              href="/producten/exitscan"
              className="marketing-link-card text-sm font-medium text-slate-700 transition-colors hover:border-slate-300 hover:text-slate-950"
            >
              Bekijk ExitScan
            </Link>
            <Link
              href="/producten/retentiescan"
              className="marketing-link-card text-sm font-medium text-slate-700 transition-colors hover:border-slate-300 hover:text-slate-950"
            >
              Bekijk RetentieScan
            </Link>
          </div>
        </MarketingHeroSupport>
      }
    >
      <MarketingSection tone="surface">
        <SectionHeading
          eyebrow="Bounded routefit"
          title="Kies Combinatie pas nadat ExitScan of RetentieScan al scherp staat."
          description="Deze bounded page helpt toetsen wanneer een gecombineerde route zinvol is. Combinatie wordt pas logisch zodra beide kernroutes echt relevant zijn voor dezelfde bestuurlijke lijn."
        />
        <div className="mt-10 grid gap-8 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="grid gap-4">
            {routeFitCards.map((item) => (
              <div key={item} className="marketing-feature-card">
                <p className="text-sm leading-7 text-[var(--text)]">{item}</p>
              </div>
            ))}
            <div className="marketing-feature-card border-[#DCEFEA] bg-[#F7F5F1]">
              <p className="text-sm font-semibold text-[var(--ink)]">Wanneer Combinatie niet logisch is</p>
              <p className="mt-3 text-sm leading-7 text-[var(--text)]">
                Als slechts een managementvraag nu echt openligt, blijft een kernroute logischer dan een gecombineerde portfoliostap.
              </p>
            </div>
          </div>
          <div className="min-w-0">
            <MarketingComparisonTable
              columns={['Routevraag', 'Kernroute eerst', 'Wanneer combinatie logisch wordt']}
              rows={[
                [
                  'We willen eerst begrijpen waarom mensen zijn vertrokken.',
                  'Start met ExitScan.',
                  "Voeg RetentieScan pas toe als dezelfde thema's ook vroeg in de actieve populatie moeten worden gevolgd.",
                ],
                [
                  'We willen eerder zien waar behoud nu onder druk staat.',
                  'Start met RetentieScan.',
                  'Voeg ExitScan pas toe als retrospectieve vertrekduiding nodig blijkt om dezelfde lijn te verdiepen.',
                ],
                [
                  'Beide vragen zijn bestuurlijk tegelijk urgent.',
                  'Kies eerst de scherpste kernroute als anker.',
                  'Gebruik Combinatie om beide routes in een gedeelde managementstructuur te verbinden.',
                ],
              ]}
            />
          </div>
        </div>
      </MarketingSection>

      <MarketingSection tone="plain">
        <SectionHeading
          eyebrow="Relatie tot de kernroutes"
          title="De route verbindt ExitScan en RetentieScan zonder derde hoofdwedge te worden."
          description="Combinatie voegt vooral samenhang toe: dezelfde managementtaal, een leesrichting en een heldere grens tussen eerste routekeuze en gecombineerde opvolging."
        />
        <div className="mt-10 grid gap-5 lg:grid-cols-2">
          <div className="marketing-feature-card">
            <p className="text-base font-semibold text-[var(--ink)]">ExitScan blijft een kernroute</p>
            <p className="mt-3 text-sm leading-7 text-[var(--text)]">
              ExitScan blijft de route voor terugkijkende vertrekduiding. Combinatie vervangt die route niet, maar gebruikt
              haar als eerste helft van een bredere managementlijn wanneer dat echt nodig is.
            </p>
          </div>
          <div className="marketing-feature-card">
            <p className="text-base font-semibold text-[var(--ink)]">RetentieScan blijft een kernroute</p>
            <p className="mt-3 text-sm leading-7 text-[var(--text)]">
              RetentieScan blijft de route voor vroegsignalering op behoud. Combinatie voegt vooral de bestuurlijke
              verbinding toe wanneer behoudsvraag en vertrekduiding niet los van elkaar kunnen worden gelezen.
            </p>
          </div>
        </div>
      </MarketingSection>

      <MarketingSection tone="tint">
        <SectionHeading
          eyebrow="Wat zichtbaar wordt"
          title="Zie hoe vertrekduiding en vroegsignalering samen een gedeelde managementlijn vormen."
          description="Combinatie maakt zichtbaar hoe beide kernroutes elkaar aanvullen: wat vertrek al heeft laten zien, wat behoud nu nog laat doorsijpelen en hoe dat samen bestuurlijk gelezen moet worden."
        />
        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {combinedVisibilityCards.map((card) => (
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
          title="U ontvangt een gedeelde managementstructuur boven op twee gerichte routes."
          description="Deze page gebruikt proof van beide kernroutes om de portfolioroute geloofwaardig te maken. Daardoor blijft de deliverable-portefeuille duidelijk zonder Combinatie als derde kernproduct te verkopen."
        />
        <div className="mt-10 grid gap-8 xl:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">
          <div>
            <div className="marketing-panel p-8">
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#3C8D8A]">Portfolio-proof</p>
              <h3 className="mt-4 text-3xl font-semibold text-slate-950">
                Laat de gedeelde managementweergave pas na de keuze zien.
              </h3>
              <p className="mt-4 text-sm leading-7 text-slate-600">
                De combinatie gebruikt een gedeelde managementstructuur, maar de concrete voorbeeld-output blijft publiek
                verifieerbaar via ExitScan en RetentieScan als twee kernroutes.
              </p>
              <div className="mt-6 rounded-[1.5rem] border border-slate-200 bg-slate-50 p-5">
                <PreviewSlider variant="portfolio" />
              </div>
            </div>
            <PreviewEvidenceRail className="mt-6" variant="portfolio" />
          </div>

          <div className="grid gap-5">
            {exitSampleAsset ? (
              <SampleShowcaseCard
                eyebrow="ExitScan-proof"
                title="ExitScan blijft de eerste sample-anchor."
                body="Gebruik de ExitScan-showcase om de eerste kernroute te bewijzen voordat de portfolio-aanpak in beeld komt."
                asset={exitSampleAsset}
                linkLabel="Open ExitScan-voorbeeldrapport"
              />
            ) : null}
            {retentionSampleAsset ? (
              <SampleShowcaseCard
                eyebrow="RetentieScan-proof"
                title="RetentieScan bevestigt de tweede kernroute."
                body="Gebruik de RetentieScan-showcase om te laten zien hoe vroegsignalering op behoud logisch aansluit zodra die tweede vraag echt bestaat."
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
          title="De route blijft bounded: geen bundel, geen standaardpakket."
          description="Combinatie voegt geen derde productlaag toe. De route blijft een begrensde portfoliostap boven op twee kernroutes en wordt niet verkocht als bundel of standaardpakket."
        />
        <div className="mt-10 grid gap-8 lg:grid-cols-[1.02fr_0.98fr]">
          <div className="marketing-feature-card">
            <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-[#3C8D8A]">Wat inbegrepen is</p>
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
            <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-[#DCEFEA]">Wat deze route niet is</p>
            <h2 className="mt-4 text-[clamp(1.8rem,3vw,2.7rem)] font-light leading-[1.08] tracking-[-0.03em] text-[#F7F5F1]">
              Niet als bundel of standaardpakket.
            </h2>
            <p className="mt-4 text-sm leading-7 text-[rgba(247,245,241,0.72)]">
              Combinatie is geen all-in route, geen algemene surveylaag en geen shortcut om de eerste routekeuze over te slaan.
              Daardoor blijft de dual-core architectuur leidend.
            </p>
            <div className="mt-6 rounded-[1.15rem] border border-white/10 bg-white/5 px-4 py-4 text-sm leading-7 text-[rgba(247,245,241,0.82)]">
              Gebruik Combinatie alleen wanneer beide vragen echt samen bestuurd moeten worden, niet als verborgen derde hoofdroute.
            </div>
          </div>
        </div>
      </MarketingSection>

      <MarketingSection tone="surface">
        <SectionHeading
          eyebrow="Trust en grenzen"
          title="Combinatie is een portfolioroute, geen derde kernproduct."
          description="De trustlaag moet precies bevestigen wat deze route wel en niet belooft: meer samenhang tussen twee kernroutes, zonder productinflatie, bundeltheater of vervlakking van de dual-core architectuur."
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
          title="Wilt u toetsen of Combinatie nu echt logisch is?"
          body="Beschrijf kort of beide managementvragen nu tegelijk bestaan of dat eerst een kernroute scherper moet landen. Dan bepalen we of Combinatie echt de juiste bounded portfoliostap is."
          primaryHref={buildContactHref({ routeInterest: 'combinatie', ctaSource: 'product_combination_closing_cta' })}
          primaryLabel="Plan een kennismaking"
          secondaryHref="/producten"
          secondaryLabel="Bekijk de kernroutes"
        />
      </MarketingSection>

      <MarketingSection tone="surface">
        <div id="kennismaking">
          <MarketingInlineContactPanel
            eyebrow="Kennismaking"
            title="Plan een gesprek over Combinatie"
            body="Beschrijf kort of beide managementvragen nu al samen spelen of dat een kernroute eerst helderder moet worden. Dan toetsen we of Combinatie echt logisch is."
            defaultRouteInterest="combinatie"
            defaultCtaSource="product_combination_form"
          />
        </div>
      </MarketingSection>
    </MarketingPageShell>
  )
}

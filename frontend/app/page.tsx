import type { Metadata } from 'next'
import Link from 'next/link'
import { MarketingHeroIntro, MarketingHeroStage } from '@/components/marketing/marketing-hero'
import { MarketingInlineContactPanel } from '@/components/marketing/marketing-inline-contact-panel'
import { MarketingPageShell } from '@/components/marketing/marketing-page-shell'
import { MarketingSection } from '@/components/marketing/marketing-section'
import { PreviewSlider } from '@/components/marketing/preview-slider'
import { SectionHeading } from '@/components/marketing/section-heading'
import { faqSchema } from '@/components/marketing/site-content'
import { buildContactHref } from '@/lib/contact-funnel'

export const metadata: Metadata = {
  title: 'Verisight',
  description:
    'Verisight laat zien wat er achter verloop speelt en waar behoud onder druk staat - met dashboard, samenvatting en rapport voor HR, MT en directie.',
  alternates: { canonical: '/' },
}

const heroSignals = [
  'Dashboard',
  'Samenvatting',
  'Rapport',
] as const

function ShieldIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3l7 3.5V12c0 4.2-2.8 7.4-7 9-4.2-1.6-7-4.8-7-9V6.5L12 3Z" />
      <path d="m9.5 12 1.7 1.7 3.3-3.4" />
    </svg>
  )
}

function SparklesIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3l1.7 4.3L18 9l-4.3 1.7L12 15l-1.7-4.3L6 9l4.3-1.7L12 3Z" />
      <path d="M19 15l.9 2.1L22 18l-2.1.9L19 21l-.9-2.1L16 18l2.1-.9L19 15Z" />
      <path d="M5 14l.7 1.6L7.3 16l-1.6.7L5 18.3l-.7-1.6L2.7 16l1.6-.7L5 14Z" />
    </svg>
  )
}

function ChartIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 19h16" />
      <path d="M6 16V9" />
      <path d="M12 16V5" />
      <path d="M18 16v-6" />
      <path d="m5.5 10.5 5-4 3.5 2 4.5-3" />
    </svg>
  )
}

function GroupIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="8" cy="9" r="2.5" />
      <circle cx="16" cy="8" r="2" />
      <path d="M4.5 18c.6-2.5 2.4-4 5-4s4.4 1.5 5 4" />
      <path d="M14 18c.3-1.9 1.6-3 3.5-3 1.2 0 2.1.3 3 .9" />
    </svg>
  )
}

const trustPoints = [
  {
    title: 'Privacy by design',
    body: 'Antwoorden zijn altijd herleidbaar tot groep, nooit tot persoon. Drempels op kleine teams.',
    icon: ShieldIcon,
  },
  {
    title: 'Alleen groepsniveau',
    body: 'Management ziet patronen per groep of segment, niet per persoon of individueel profiel.',
    icon: GroupIcon,
  },
  {
    title: 'Methodologisch onderbouwd',
    body: 'Vragen en weging zijn gebaseerd op gevalideerd onderzoek naar vertrek en behoud.',
    icon: ChartIcon,
  },
  {
    title: 'Geen individuele voorspellingen',
    body: 'Verisight ondersteunt prioritering en gesprek, niet diagnose of voorspelling op persoonsniveau.',
    icon: SparklesIcon,
  },
] as const

const homepageRoutes = [
  {
    name: 'ExitScan',
    chip: 'Hoofdroute',
    when: 'Wanneer logisch: als u wilt begrijpen waarom mensen vertrekken en welke patronen terugkomen.',
    gets: 'U krijgt een dashboard, samenvatting en rapport met wat opvalt en wat eerst aandacht vraagt.',
    href: '/producten/exitscan',
  },
  {
    name: 'RetentieScan',
    chip: 'Hoofdroute',
    when: 'Wanneer logisch: als u eerder wilt zien waar behoud in actieve teams onder druk staat.',
    gets: 'U krijgt een dashboard, samenvatting en rapport dat laat zien waar prioriteit en vervolgduiding nodig zijn.',
    href: '/producten/retentiescan',
  },
  {
    name: 'Onboarding 30-60-90',
    chip: 'Hoofdroute',
    when: 'Wanneer logisch: als de eerste managementvraag draait om hoe nieuwe medewerkers landen in hun eerste fase.',
    gets: 'U krijgt een dashboard, samenvatting en rapport dat zichtbaar maakt waar onboarding frictie of uitvalrisico opbouwt.',
    href: '/producten/onboarding-30-60-90',
  },
] as const

const homepageSupportRoutes = [
  {
    name: 'Pulse',
    body: 'Compacte reviewroute na een eerste diagnose of actie.',
    href: '/producten/pulse',
  },
  {
    name: 'Leadership Scan',
    body: 'Verdieping op managementcontext na een bestaand signaal.',
    href: '/producten/leadership-scan',
  },
] as const

const recognitionItems = [
  {
    key: 'exit',
    title: 'Mensen vertrekken en de redenen blijven onduidelijk',
    body: 'Exitgesprekken zijn fragmentarisch, en de echte oorzaken bereiken het MT zelden in bruikbare vorm.',
  },
  {
    key: 'retention',
    title: 'Behoud staat onder druk, maar niet zichtbaar genoeg',
    body: 'Engagement-cijfers zijn er wel, maar zeggen niet waar urgentie zit en wie als eerste in beweging moet.',
  },
  {
    key: 'signal',
    title: 'Veel signaal, weinig richting',
    body: 'Pulse-data, surveys en losse interviews stapelen zich op zonder dat het tot een managementagenda leidt.',
  },
] as const

function RecognitionVisual({ type }: { type: (typeof recognitionItems)[number]['key'] }) {
  return (
    <div className="mb-8 overflow-hidden rounded-[1rem] border border-[#DDD5C7] bg-[#FFFCF7]">
      <div className="flex min-h-[7rem] items-center justify-center px-6 py-5">
        {type === 'exit' ? <RecognitionExitVisual /> : null}
        {type === 'retention' ? <RecognitionRetentionVisual /> : null}
        {type === 'signal' ? <RecognitionSignalVisual /> : null}
      </div>
    </div>
  )
}

function RecognitionExitVisual() {
  const darkStroke = '#21324B'
  const lightStroke = '#C9C4BA'
  const accent = '#4E9A95'

  return (
    <svg viewBox="0 0 320 92" className="h-[5.7rem] w-full max-w-[19rem]" aria-hidden="true">
      {[0, 1, 2, 3].map((index) => {
        const color = index < 3 ? darkStroke : lightStroke
        const x = 28 + index * 28
        return <circle key={`top-${index}`} cx={x} cy="22" r="6" fill="none" stroke={color} strokeWidth="2" />
      })}
      {[0, 1, 2, 3].map((index) => {
        const color = index < 3 ? darkStroke : lightStroke
        const x = 20 + index * 28
        return (
          <path
            key={`bottom-${index}`}
            d={`M${x} 58 L${x + 8} 48 L${x + 16} 58 L${x + 16} 68 L${x} 68 Z`}
            fill="none"
            stroke={color}
            strokeWidth="2"
            strokeLinejoin="round"
          />
        )
      })}
      <circle cx="194" cy="22" r="6" fill="none" stroke={accent} strokeWidth="2" />
      <path
        d="M186 58 L194 48 L202 58 L202 68 L186 68 Z"
        fill="none"
        stroke={accent}
        strokeWidth="2"
        strokeLinejoin="round"
      />
      {[0, 1, 2, 3, 4].map((index) => (
        <circle key={`dot-${index}`} cx={222 + index * 9} cy="41" r="1.7" fill={accent} />
      ))}
      <path d="M266 41 H298" fill="none" stroke={accent} strokeWidth="2" strokeLinecap="round" />
      <path d="M288 33 L298 41 L288 49" fill="none" stroke={accent} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function RecognitionRetentionVisual() {
  const line = '#21324B'
  const accent = '#4E9A95'

  return (
    <svg viewBox="0 0 320 92" className="h-[5.7rem] w-full max-w-[19rem]" aria-hidden="true">
      <defs>
        <linearGradient id="recognition-retention-fill" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="#DFF2ED" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#DFF2ED" stopOpacity="0.05" />
        </linearGradient>
      </defs>
      <rect x="34" y="8" width="250" height="58" fill="url(#recognition-retention-fill)" />
      {[0, 1, 2, 3].map((index) => (
        <line key={index} x1={34 + index * 62.5} y1="8" x2={34 + index * 62.5} y2="80" stroke="#E1DBD0" strokeWidth="1.5" />
      ))}
      <path
        d="M34 28 C74 28 98 34 128 38 C158 42 188 48 222 53 C244 57 265 61 284 63"
        fill="none"
        stroke={line}
        strokeWidth="2.4"
        strokeLinecap="round"
      />
      <circle cx="204" cy="50" r="7" fill="#FFFCF7" stroke={accent} strokeWidth="2.4" />
    </svg>
  )
}

function RecognitionSignalVisual() {
  const line = '#21324B'
  const accent = '#4E9A95'

  const points = [
    [42, 30], [58, 22], [74, 36], [91, 20], [107, 34], [124, 27],
    [48, 53], [66, 46], [83, 58], [100, 44], [117, 55], [134, 48],
  ] as const

  return (
    <svg viewBox="0 0 320 92" className="h-[5.7rem] w-full max-w-[19rem]" aria-hidden="true">
      {points.map(([x, y], index) => (
        <circle key={index} cx={x} cy={y} r="2.1" fill={index % 3 === 0 ? line : '#8E99A8'} />
      ))}
      <path d="M190 18 L206 46 L190 74" fill="none" stroke={accent} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M206 46 H298" fill="none" stroke={line} strokeWidth="2.4" strokeLinecap="round" />
      <path d="M286 36 L298 46 L286 56" fill="none" stroke={line} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function HeroDashboardVisual() {
  return (
    <div className="relative w-full">
      <div className="absolute -inset-6 -z-10 rounded-[2.2rem] bg-[radial-gradient(circle_at_top_left,rgba(215,239,233,0.85)_0%,rgba(255,252,247,0.2)_45%,transparent_72%)] blur-2xl" />
      <div className="overflow-hidden rounded-[2rem] border border-[var(--border)] bg-[var(--surface)] shadow-[0_30px_60px_-30px_rgba(16,24,32,0.2)]">
        <div className="flex items-center justify-between border-b border-[var(--border)] bg-[rgba(245,242,234,0.72)] px-5 py-3">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-[var(--border)]" />
            <span className="h-2 w-2 rounded-full bg-[var(--border)]" />
            <span className="h-2 w-2 rounded-full bg-[var(--border)]" />
          </div>
          <p className="text-[11px] tracking-wide text-[var(--muted)]">Voorbeeldoutput - Q2 rapport</p>
          <p className="text-[11px] text-[var(--muted)]">Verisight</p>
        </div>

        <div className="grid gap-8 p-6 md:grid-cols-[minmax(0,0.82fr)_minmax(0,1.18fr)] md:gap-10 md:p-10">
          <div className="space-y-6">
            <p className="text-[0.62rem] font-semibold uppercase tracking-[0.18em] text-[#4A5563]">Top prioriteiten</p>
            <ul className="mt-3 space-y-3">
              {(
                [
                  ['Groei en ontwikkeling', 'Hoog', 'bg-[#101820] text-white'],
                  ['Werkdruk in operatie', 'Verhoogd', 'bg-[#3C8D8A] text-white'],
                  ['Loopbaanperspectief', 'Aandacht', 'bg-[#D7EFE9] text-[#101820]'],
                ] as const
              ).map(([label, status, style]) => (
                <li
                  key={label}
                  className="flex items-center justify-between rounded-[0.9rem] border border-[var(--border)] bg-[var(--surface)] px-3 py-2.5"
                >
                  <span className="text-[13px] text-[#132033]">{label}</span>
                  <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${style}`}>{status}</span>
                </li>
              ))}
            </ul>

            <div className="rounded-[1rem] border border-[rgba(221,215,203,0.82)] bg-[rgba(245,242,234,0.42)] px-4 py-4">
              <p className="text-[0.62rem] font-semibold uppercase tracking-[0.18em] text-[#4A5563]">Eerste bespreking</p>
              <p className="mt-2 text-[13px] leading-relaxed text-[#4A5563]">
                Bespreek eerst groei en werkdruk, zodat prioriteit en eigenaar meteen helder zijn.
              </p>
            </div>
          </div>

          <div>
            <div className="flex flex-wrap items-baseline justify-between gap-3">
              <div>
                <p className="text-[0.62rem] font-semibold uppercase tracking-[0.18em] text-[#4A5563]">Behoudssignaal</p>
                <p className="mt-1 text-[1.75rem] font-medium tracking-[-0.04em] text-[#132033]">+3,1 pt</p>
              </div>
              <p className="text-[11px] text-[var(--muted)]">Trend afgelopen 4 kwartalen</p>
            </div>

            <div className="mt-4 rounded-[1.1rem] border border-[var(--border)] bg-[rgba(245,242,234,0.45)] p-5">
              <svg viewBox="0 0 420 156" className="h-40 w-full md:h-48">
                <defs>
                  <linearGradient id="heroTrend" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="rgba(60,141,138,0.32)" />
                    <stop offset="100%" stopColor="rgba(60,141,138,0)" />
                  </linearGradient>
                </defs>
                <path
                  d="M0,108 C44,102 82,113 122,88 C164,62 206,86 247,61 C290,37 334,50 374,28 C393,19 407,17 420,14"
                  fill="none"
                  stroke="#3C8D8A"
                  strokeWidth="2.4"
                />
                <path
                  d="M0,108 C44,102 82,113 122,88 C164,62 206,86 247,61 C290,37 334,50 374,28 C393,19 407,17 420,14 L420,156 L0,156 Z"
                  fill="url(#heroTrend)"
                />
                {[0, 105, 210, 315, 420].map((x) => (
                  <line key={x} x1={x} y1="0" x2={x} y2="156" stroke="rgba(221,215,203,0.9)" strokeWidth="1" />
                ))}
              </svg>
              <div className="mt-2 flex justify-between text-[10.5px] text-[var(--muted)]">
                <span>Q2</span>
                <span>Q3</span>
                <span>Q4</span>
                <span>Q1</span>
                <span>Q2</span>
              </div>
            </div>

            <div className="mt-4 rounded-[0.95rem] border border-[rgba(221,215,203,0.82)] bg-[rgba(255,252,247,0.82)] px-4 py-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="max-w-[28rem]">
                  <p className="text-[10.5px] font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">Samenvatting</p>
                  <p className="mt-2 text-[13px] leading-relaxed text-[#4A5563]">
                    Groei, werkdruk en loopbaanperspectief vragen nu eerst een gezamenlijke managementreactie.
                  </p>
                </div>
                <div className="min-w-[11rem] text-left md:text-right">
                  <p className="text-[10.5px] font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">Status</p>
                  <p className="mt-2 text-[13px] leading-relaxed text-[#132033]">Prioriteit vastleggen</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function LandingPage() {
  const homepageSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: 'Verisight',
    description:
      'Verisight laat zien wat er achter verloop speelt en waar behoud onder druk staat - met dashboard, samenvatting en rapport voor HR, MT en directie.',
    url: 'https://www.verisight.nl/',
    inLanguage: 'nl-NL',
        mainEntity: {
      '@type': 'ItemList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'ExitScan', url: 'https://www.verisight.nl/producten/exitscan' },
        { '@type': 'ListItem', position: 2, name: 'RetentieScan', url: 'https://www.verisight.nl/producten/retentiescan' },
        {
          '@type': 'ListItem',
          position: 3,
          name: 'Onboarding 30-60-90',
          url: 'https://www.verisight.nl/producten/onboarding-30-60-90',
        },
      ],
    },
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(homepageSchema) }} />

      <a
        href="#hoofdinhoud"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[60] focus:rounded-lg focus:bg-[#132033] focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-white"
      >
        Ga naar de inhoud
      </a>

      <MarketingPageShell
        theme="neutral"
        pageType="home"
        ctaHref={buildContactHref({ routeInterest: 'exitscan', ctaSource: 'homepage_primary_cta' })}
        ctaLabel="Plan een kennismaking"
        heroIntro={
          <MarketingHeroIntro className="gap-0">
            <div className="max-w-none">
              <p className="marketing-hero-eyebrow text-[#3C8D8A]">People-insight voor HR &amp; management</p>
              <h1 className="marketing-hero-title marketing-hero-title-home font-display text-[#132033]">
                Begrijp waarom mensen vertrekken. Zie eerder waar behoud onder druk staat.
              </h1>
              <p className="marketing-hero-copy mt-6 max-w-[68rem] text-[#4A5563]">
                U krijgt binnen enkele weken een dashboard, een korte samenvatting en een rapport waarmee HR en
                directie sneller zien wat eerst aandacht vraagt. Geen losse survey, maar concrete stuurinformatie om
                te bespreken en te prioriteren.
              </p>

              <div className="marketing-hero-cta-row marketing-hero-actions mt-7">
                <Link
                  href={buildContactHref({ routeInterest: 'exitscan', ctaSource: 'homepage_hero_primary' })}
                  className="marketing-button-primary"
                >
                  Plan een kennismaking
                </Link>
                <Link href="#voorbeeldoutput" className="marketing-button-secondary">
                  Bekijk voorbeeldoutput
                </Link>
              </div>

              <div className="mt-8 flex flex-wrap items-center gap-x-8 gap-y-3 text-[13px] text-[#4A5563]">
                {heroSignals.map((signal) => (
                  <span key={signal} className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#3C8D8A]" />
                    {signal}
                  </span>
                ))}
              </div>
            </div>
          </MarketingHeroIntro>
        }
        heroStage={
          <MarketingHeroStage surface="light" className="homepage-hero-stage" surfaceClassName="border-0 bg-transparent p-0 shadow-none">
            <HeroDashboardVisual />
          </MarketingHeroStage>
        }
      >
        <div id="hoofdinhoud">
          <MarketingSection tone="plain">
            <SectionHeading
              eyebrow="Herkenbaar?"
              title="Veel data over medewerkers. Weinig houvast voor het management."
              description="Verisight vertaalt vertrek- en behoudssignalen naar prioriteiten waar HR en directie echt mee verder kunnen."
            />

            <div className="mt-10 overflow-hidden rounded-[1.2rem] border border-[#E5E0D6] bg-[rgba(255,252,247,0.96)] md:grid md:grid-cols-3">
              {recognitionItems.map((item, index) => (
                <div
                  key={item.title}
                  className={`px-7 py-8 ${index < recognitionItems.length - 1 ? 'border-b border-[#E5E0D6] md:border-b-0 md:border-r' : ''}`}
                >
                  <RecognitionVisual type={item.key} />
                  <h2 className="max-w-none text-[1rem] font-semibold leading-[1.45] text-[#132033] md:text-[1.05rem]">
                    {item.title}
                  </h2>
                  <p className="mt-4 text-[0.98rem] leading-8 text-[#4A5563]">{item.body}</p>
                </div>
              ))}
            </div>
          </MarketingSection>

          <MarketingSection tone="surface">
            <div id="voorbeeldoutput" className="scroll-mt-20">
              <SectionHeading
                eyebrow="Voorbeeldrapport"
                title="Een rapport dat HR en MT snel begrijpen."
                description="Dit is het soort output waarmee HR en directie sneller zien wat opvalt en wat eerst besproken moet worden."
              />

              <div className="marketing-proof-frame mt-8 p-5 md:p-8">
                <PreviewSlider variant="portfolio" />
              </div>
            </div>
          </MarketingSection>

          <MarketingSection tone="plain">
            <SectionHeading
              eyebrow="Routes"
              title="Kies de eerste route die nu past."
              description="Begin met de route die nu het duidelijkst past. Pulse en Leadership blijven bewust lichtere vervolgroutes."
            />

            <div className="mt-8 grid gap-4 xl:grid-cols-3">
              {homepageRoutes.map((route) => (
                <div key={route.name} className="marketing-route-card flex h-full flex-col">
                  <span className="marketing-chip self-start border-[#D7D2C6] bg-white text-[#4A5563]">{route.chip}</span>
                  <h2 className="mt-4 text-[1.26rem] font-semibold tracking-[-0.03em] text-[#132033]">{route.name}</h2>
                  <p className="mt-4 text-sm leading-7 text-[#132033]">{route.when}</p>
                  <p className="mt-3 flex-1 text-sm leading-7 text-[#4A5563]">{route.gets}</p>
                  <Link
                    href={route.href}
                    className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-[#3C8D8A] transition-colors hover:text-[#2d6e6b]"
                  >
                    Meer over {route.name} <span aria-hidden>{'->'}</span>
                  </Link>
                </div>
              ))}
            </div>

            <div className="mt-5 rounded-[1rem] border border-[#E5E0D6] bg-[rgba(247,245,241,0.9)] px-5 py-4">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex flex-col gap-3 lg:flex-row lg:flex-wrap lg:items-center">
                  {homepageSupportRoutes.map((route) => (
                    <div key={route.name} className="text-sm leading-7 text-[#4A5563]">
                      <Link href={route.href} className="font-medium text-[#132033] hover:underline">
                        {route.name}
                      </Link>
                      <span>{` — ${route.body}`}</span>
                    </div>
                  ))}
                </div>
                <Link href="/producten" className="inline-flex shrink-0 items-center gap-1.5 text-sm font-medium text-[#132033] hover:underline">
                  Bekijk alle producten <span aria-hidden>{'->'}</span>
                </Link>
              </div>
              <p className="mt-3 text-sm leading-7 text-[#4A5563]">
                Combinatie blijft een portfolioroute zodra twee echte managementvragen naast elkaar bestaan.
              </p>
            </div>
          </MarketingSection>

          <MarketingSection tone="dark">
            <div className="max-w-[38rem]">
              <p className="text-[0.72rem] font-medium uppercase tracking-[0.16em] text-[#A8D9D3]">Vertrouwen en privacy</p>
              <h2 className="mt-3 font-display text-[clamp(1.85rem,3.4vw,2.7rem)] font-light leading-[1.08] tracking-[-0.035em] text-[#F7F5F1]">
                Compact, zorgvuldig en helder begrensd.
              </h2>
              <p className="mt-4 max-w-[56ch] text-[0.95rem] leading-8 text-[rgba(247,245,241,0.72)]">
                Verisight laat op de homepage kort zien hoe privacy, methodiek en claims zijn ingericht, zonder de flow te vertragen.
              </p>
            </div>

            <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
              {trustPoints.map((point) => {
                const Icon = point.icon
                return (
                  <div key={point.title} className="rounded-[0.95rem] border border-white/10 bg-white/4 px-5 py-5">
                    <div className="inline-flex h-10 w-10 items-center justify-center rounded-[0.8rem] bg-white/8 text-[#F7F5F1]">
                      <Icon />
                    </div>
                    <p className="mt-4 text-[16px] font-medium text-[#F7F5F1]">{point.title}</p>
                    <p className="mt-2 text-sm leading-7 text-[rgba(247,245,241,0.76)]">{point.body}</p>
                  </div>
                )
              })}
            </div>

            <div className="mt-7">
              <Link
                href="/vertrouwen"
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#DCEFEA] transition-colors hover:text-white"
              >
                Bekijk hoe dit is ingericht <span aria-hidden>{'->'}</span>
              </Link>
            </div>
          </MarketingSection>

          <MarketingSection tone="plain">
            <div className="space-y-6">
              <MarketingInlineContactPanel
                eyebrow="Kennismaking"
                title="Plan een kennismaking"
                body="We reageren meestal binnen 1 werkdag."
                minimal
                badge="Vrijblijvend"
                defaultRouteInterest="exitscan"
                defaultCtaSource="homepage_form"
              />
            </div>
          </MarketingSection>
        </div>
      </MarketingPageShell>
    </>
  )
}

import type { Metadata } from 'next'
import Link from 'next/link'
import { MarketingHeroIntro, MarketingHeroStage } from '@/components/marketing/marketing-hero'
import { HeroMotionDashboard } from '@/components/marketing/hero-motion-dashboard'
import { MarketingPageShell } from '@/components/marketing/marketing-page-shell'
import { MarketingSection } from '@/components/marketing/marketing-section'
import { MarketingSplitCallout } from '@/components/marketing/marketing-split-callout'
import { PreviewSlider } from '@/components/marketing/preview-slider'
import { SectionHeading } from '@/components/marketing/section-heading'
import { faqSchema } from '@/components/marketing/site-content'
import { buildContactHref } from '@/lib/contact-funnel'

export const metadata: Metadata = {
  title: 'Verisight',
  description:
    'Verisight helpt organisaties begrijpen waarom mensen vertrekken en waar behoud aandacht vraagt, met dashboard en rapport voor gerichte prioriteiten.',
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

function SparklesIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3l1.7 4.3L18 9l-4.3 1.7L12 15l-1.7-4.3L6 9l4.3-1.7L12 3Z" />
      <path d="M19 15l.9 2.1L22 18l-2.1.9L19 21l-.9-2.1L16 18l2.1-.9L19 15Z" />
      <path d="M5 14l.7 1.6L7.3 16l-1.6.7L5 18.3l-.7-1.6L2.7 16l1.6-.7L5 14Z" />
    </svg>
  )
}

const trustPoints = [
  {
    title: 'Groepsniveau',
    body: 'Uitkomsten blijven bedoeld voor teams en groepen, niet voor personen.',
    icon: ShieldIcon,
  },
  {
    title: 'Geen individuele voorspellingen',
    body: 'Verisight ondersteunt prioritering en gesprek, niet diagnose op persoonsniveau.',
    icon: GroupIcon,
  },
  {
    title: 'AVG-conform',
    body: 'Drempels en zorgvuldige verwerking zijn standaard ingebouwd.',
    icon: ChartIcon,
  },
  {
    title: 'Vertrouwelijk',
    body: 'Open antwoorden en aanvullende context worden compact en zorgvuldig behandeld.',
    icon: SparklesIcon,
  },
] as const

const homepageRoutes = [
  {
    name: 'ExitScan',
    chip: 'VERTREK & UITSTROOM',
    intro: 'Begrijp waarom medewerkers vertrekken en welke patronen terugkomen.',
    bullets: ['Vertrekredenen op themaniveau', 'Patronen per team of afdeling', 'Duidelijke eerste verbeterpunten'],
    href: '/producten/exitscan',
  },
  {
    name: 'RetentieScan',
    chip: 'BEHOUD & VROEGSIGNALERING',
    intro: 'Zie waar behoud onder druk staat en waar eerst vervolg nodig is.',
    bullets: ['Risicozones per team', 'Drijfveren voor blijven', 'Prioriteiten voor HR en MT'],
    href: '/producten/retentiescan',
  },
  {
    name: 'Onboarding 30-60-90',
    chip: 'ONBOARDING & VROEGE LANDING',
    intro: 'Zie vroeg waar nieuwe medewerkers goed landen en waar extra aandacht nodig is.',
    bullets: [
      'Eerste signalen in 30, 60 en 90 dagen',
      'Inzicht per team of instroomgroep',
      'Duidelijke aandachtspunten voor HR en leidinggevenden',
    ],
    href: '/producten/onboarding-30-60-90',
  },
] as const

const homepageSecondaryRoutes = [
  {
    name: 'Pulse',
    body: 'Korte hercheck na een eerste traject of na een eerste actie.',
    href: '/producten/pulse',
  },
  {
    name: 'Leadership Scan',
    body: 'Extra duiding op managementcontext zodra een eerste beeld al op tafel ligt.',
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
    title: 'Veel signalen, nog geen helder beeld',
    body: 'Pulse-data, surveys en losse interviews stapelen zich op zonder dat snel duidelijk wordt waar u begint.',
  },
] as const

function RecognitionVisual({ type }: { type: (typeof recognitionItems)[number]['key'] }) {
  return (
    <div className="overflow-hidden rounded-[0.85rem] border border-[#DDD5C7] bg-[#FFFCF7]">
      <div className="flex min-h-[4.7rem] items-center justify-center px-3 py-2.5">
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
    <svg viewBox="0 0 320 92" className="h-[3.1rem] w-full max-w-[10rem]" aria-hidden="true">
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
    <svg viewBox="0 0 320 92" className="h-[3.1rem] w-full max-w-[10rem]" aria-hidden="true">
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
    <svg viewBox="0 0 320 92" className="h-[3.1rem] w-full max-w-[10rem]" aria-hidden="true">
      {points.map(([x, y], index) => (
        <circle key={index} cx={x} cy={y} r="2.1" fill={index % 3 === 0 ? line : '#8E99A8'} />
      ))}
      <path d="M190 18 L206 46 L190 74" fill="none" stroke={accent} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M206 46 H298" fill="none" stroke={line} strokeWidth="2.4" strokeLinecap="round" />
      <path d="M286 36 L298 46 L286 56" fill="none" stroke={line} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

// Legacy static reference kept during the motion spike for quick rollback if needed.
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function HeroDashboardVisual() {
  return (
    <div className="relative w-full">
      <div className="absolute -inset-8 -z-10 rounded-[2.4rem] bg-[radial-gradient(circle_at_top_left,rgba(215,239,233,0.95)_0%,rgba(255,252,247,0.34)_42%,transparent_72%)] blur-3xl" />
      <div className="overflow-hidden rounded-[2.25rem] border border-[rgba(221,215,203,0.82)] bg-[var(--surface)] shadow-[0_42px_110px_-46px_rgba(16,24,32,0.34)]">
        <div className="flex items-center justify-between border-b border-[rgba(221,215,203,0.82)] bg-[rgba(245,242,234,0.66)] px-5 py-2.5">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-[var(--border)]" />
            <span className="h-2 w-2 rounded-full bg-[var(--border)]" />
            <span className="h-2 w-2 rounded-full bg-[var(--border)]" />
          </div>
          <p className="text-[11px] tracking-wide text-[var(--muted)]">Voorbeeldoutput - Q2 rapport</p>
          <p className="text-[11px] text-[var(--muted)]">Verisight</p>
        </div>

        <div className="relative overflow-hidden bg-[#091015] px-5 py-5 text-[#F7F5F1] md:px-6 md:py-6">
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.035)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:72px_72px] opacity-50" />
          <div className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-[radial-gradient(circle_at_top,rgba(60,141,138,0.28),transparent_68%)]" />

          <div className="relative grid gap-7 md:grid-cols-[minmax(0,0.56fr)_minmax(0,1.44fr)] md:gap-8">
            <div className="space-y-6">
              <div>
                <p className="text-[0.66rem] font-semibold uppercase tracking-[0.2em] text-[#A5B7C7]">Dashboard</p>
                <p className="mt-3 max-w-[22rem] text-[1.04rem] leading-7 text-[#F7F5F1]">
                  Managementsamenvatting. Topprioriteiten, trend en eerste actie in Ã©Ã©n oogopslag.
                </p>
              </div>

              <div>
                <p className="text-[0.66rem] font-semibold uppercase tracking-[0.2em] text-[#A5B7C7]">Top prioriteiten</p>
                <ul className="mt-4 space-y-2.5">
                  {(
                    [
                      ['Groei en ontwikkeling', 'Hoog', 'bg-[#F7F5F1] text-[#101820]'],
                      ['Werkdruk in operatie', 'Verhoogd', 'bg-[#3C8D8A] text-white'],
                      ['Loopbaanperspectief', 'Aandacht', 'bg-[#D7EFE9] text-[#101820]'],
                    ] as const
                  ).map(([label, status, style]) => (
                    <li key={label} className="flex items-center justify-between gap-3 border-b border-white/10 pb-2.5 last:border-b-0 last:pb-0">
                      <span className="text-[14px] text-[#F7F5F1]">{label}</span>
                      <span className={`rounded-full px-2.5 py-1 text-[10.5px] font-medium ${style}`}>{status}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <p className="text-[0.66rem] font-semibold uppercase tracking-[0.2em] text-[#A5B7C7]">Eerste actie</p>
                <p className="mt-3 max-w-[22rem] text-[13px] leading-6 text-[rgba(247,245,241,0.76)]">
                  Plan een managementgesprek over groei, werkdruk en opvolging. Leg prioriteit en eigenaar direct vast.
                </p>
              </div>
              </div>

            <div className="relative">
              <div className="grid gap-3 sm:grid-cols-3">
                {(
                  [
                    ['Vertrekrisico', '12%'],
                    ['Engagement', '7.4'],
                    ['Onboarding', '8.1'],
                  ] as const
                ).map(([label, value]) => (
                  <div key={label} className="rounded-[1.05rem] border border-white/10 bg-white/[0.06] px-4 py-4 md:px-5 md:py-[1.15rem] backdrop-blur-[2px]">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#B8C6D2]">{label}</p>
                    <p className="mt-2 text-[2.15rem] font-medium tracking-[-0.06em] text-white">{value}</p>
                  </div>
                ))}
              </div>

              <div className="relative mt-4 overflow-hidden rounded-[1.55rem] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.028),rgba(255,255,255,0.012))] px-4 py-4 md:px-5 md:py-5">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="text-[0.66rem] font-semibold uppercase tracking-[0.2em] text-[#A5B7C7]">Behoudssignaal Â· 12 mnd</p>
                    <p className="mt-2 text-[2.55rem] font-medium tracking-[-0.06em] text-white">+3,1 pt</p>
                  </div>
                  <p className="pt-1 text-[11px] text-[rgba(247,245,241,0.55)]">Trend afgelopen 4 kwartalen</p>
                </div>

                <svg viewBox="0 0 560 248" className="mt-4 h-[20rem] w-full md:h-[29rem]">
                  <defs>
                    <linearGradient id="heroTrend" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="rgba(60,141,138,0.55)" />
                      <stop offset="100%" stopColor="rgba(60,141,138,0)" />
                    </linearGradient>
                  </defs>
                  {[0, 112, 224, 336, 448, 560].map((x) => (
                    <line key={x} x1={x} y1="0" x2={x} y2="248" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
                  ))}
                  {[28, 94, 160, 226].map((y) => (
                    <line key={y} x1="0" y1={y} x2="560" y2={y} stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
                  ))}
                  <path
                    d="M0,184 C48,186 84,194 120,172 C158,148 194,154 228,137 C264,119 304,130 344,103 C388,74 428,82 466,57 C500,34 530,28 560,22"
                    fill="none"
                    stroke="#67C3BD"
                    strokeWidth="3.6"
                    strokeLinecap="round"
                  />
                  <path
                    d="M0,184 C48,186 84,194 120,172 C158,148 194,154 228,137 C264,119 304,130 344,103 C388,74 428,82 466,57 C500,34 530,28 560,22 L560,248 L0,248 Z"
                    fill="url(#heroTrend)"
                  />
                  <circle cx="466" cy="57" r="8.5" fill="#0B1217" stroke="#67C3BD" strokeWidth="3" />
                </svg>

                <div className="mt-2.5 flex justify-between text-[11px] text-[rgba(247,245,241,0.55)]">
                  <span>Q2 &apos;24</span>
                  <span>Q3</span>
                  <span>Q4</span>
                  <span>Q1 &apos;25</span>
                  <span>Q2</span>
                </div>

                <div className="mt-4 md:absolute md:bottom-5 md:right-5 md:mt-0 md:w-[19rem]">
                  <div className="rounded-[1.15rem] border border-[rgba(221,215,203,0.88)] bg-[rgba(255,252,247,0.97)] px-5 py-5 text-[#132033] shadow-[0_24px_60px_-32px_rgba(0,0,0,0.48)]">
                    <p className="text-[10.5px] font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">Samenvatting</p>
                    <p className="mt-2 text-[14px] leading-6 text-[#4A5563]">
                      Wat nu telt. Groei, werkdruk en loopbaanperspectief vragen nu Ã©Ã©n duidelijke eerste managementroute.
                    </p>
                  </div>
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
      'Verisight helpt organisaties begrijpen waarom mensen vertrekken en waar behoud aandacht vraagt, met dashboard en rapport voor gerichte prioriteiten.',
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
                Begrijp waarom mensen vertrekken en waar behoud aandacht vraagt.
              </h1>
              <p className="marketing-hero-copy mt-6 max-w-[68rem] text-[#4A5563]">
                Voor organisaties die van losse signalen naar gerichte prioriteiten willen. U ontvangt binnen enkele
                weken een dashboard en rapport waarmee snel zichtbaar wordt wat nu het eerst telt.
              </p>

              <div className="marketing-hero-cta-row marketing-hero-actions mt-7">
                <Link
                  href={buildContactHref({ routeInterest: 'exitscan', ctaSource: 'homepage_hero_primary' })}
                  className="marketing-button-primary"
                >
                  Plan een kennismaking
                </Link>
                <Link href="#voorbeeldoutput" className="marketing-button-secondary">
                  Bekijk voorbeeld
                </Link>
              </div>

              <div className="mt-7 flex flex-wrap items-center gap-x-6 gap-y-2.5 text-[11px] font-medium uppercase tracking-[0.16em] text-[#708091]">
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
          <MarketingHeroStage
            surface="light"
            className="homepage-hero-stage"
            surfaceClassName="border-0 bg-transparent p-0 shadow-none"
          >
            <HeroMotionDashboard />
          </MarketingHeroStage>
        }
      >
        <div id="hoofdinhoud">
          <MarketingSection tone="plain">
            <SectionHeading
              eyebrow="Eerste keuze"
              title="Kies de route die past bij uw vraagstuk"
              description="Start met de productroute die het snelst duidelijk maakt waar actie nodig is."
            />

            <div className="mt-6 grid gap-5 xl:grid-cols-3">
              {homepageRoutes.map((route) => (
                <div key={route.name} className="marketing-route-card flex h-full min-h-[18.25rem] flex-col px-7 py-6">
                  <span className="text-[0.64rem] font-semibold uppercase tracking-[0.16em] text-[#708091]">{route.chip}</span>
                  <h2 className="mt-3.5 text-[1.56rem] font-semibold leading-[1.08] tracking-[-0.035em] text-[#132033]">{route.name}</h2>
                  <p className="mt-3 max-w-[28rem] text-[0.94rem] leading-6 text-[#4A5563]">{route.intro}</p>
                  <ul className="mt-5 flex-1 space-y-3 border-t border-[rgba(221,215,203,0.72)] pt-5">
                    {route.bullets.map((bullet) => (
                      <li key={bullet} className="flex items-start gap-3 text-[0.9rem] leading-[1.55] text-[#233547]">
                        <span className="mt-[0.55rem] h-1.5 w-1.5 shrink-0 rounded-full bg-[#3C8D8A]" />
                        <span>{bullet}</span>
                      </li>
                    ))}
                  </ul>
                  <Link
                    href={route.href}
                    className="mt-5 inline-flex items-center text-sm font-semibold text-[#3C8D8A] transition-colors hover:text-[#2d6e6b]"
                  >
                    Bekijk {route.name}
                  </Link>
                </div>
              ))}
            </div>
          </MarketingSection>

          <MarketingSection tone="surface">
            <div id="voorbeeldoutput" className="scroll-mt-20">
              <SectionHeading
                eyebrow=""
                title="Van signalen naar eerste prioriteiten"
                description="De output is gemaakt om sneller te prioriteren, niet om alleen te rapporteren"
              />

              <div className="marketing-proof-frame mt-6 p-4 md:p-12">
                <PreviewSlider variant="portfolio" />
              </div>
            </div>
          </MarketingSection>

          <MarketingSection tone="plain">
            <SectionHeading
              eyebrow="Herkenbaar?"
              title="Veel signalen, nog geen helder beeld."
              description="Verisight helpt om sneller te zien waar gesprek en actie logisch beginnen."
            />

            <div className="mt-6 overflow-hidden rounded-[0.95rem] border border-[rgba(221,215,203,0.72)] bg-[rgba(255,252,247,0.82)] md:grid md:grid-cols-3">
              {recognitionItems.map((item, index) => (
                <div
                  key={item.title}
                  className={`px-4 py-3 ${index < recognitionItems.length - 1 ? 'border-b border-[rgba(221,215,203,0.58)] md:border-b-0 md:border-r' : ''}`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-[4.4rem] shrink-0 opacity-90">
                      <RecognitionVisual type={item.key} />
                    </div>
                    <div className="min-w-0">
                      <h2 className="max-w-none text-[0.92rem] font-semibold leading-[1.35] text-[#132033]">
                        {item.title}
                      </h2>
                      <p className="mt-1 text-[0.84rem] leading-5 text-[#4A5563]">{item.body}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8">
              <SectionHeading
                eyebrow="Andere routes"
                title="Andere vragen kunnen later aansluiten."
                description="Onboarding is een volwaardige start als de vraag draait om de eerste fase. Pulse en Leadership blijven lichte vervolgstappen."
              />
            </div>

            <div className="mt-6 grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
              <div className="marketing-route-card flex min-h-[15rem] flex-col px-7 py-7">
                <span className="marketing-chip self-start border-[#D7D2C6] bg-white text-[#4A5563]">Onboardingvraag</span>
                <h2 className="mt-4 text-[1.28rem] font-semibold tracking-[-0.03em] text-[#132033]">Onboarding 30-60-90</h2>
                <p className="mt-4 text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-[#7A8698]">Wanneer past dit</p>
                <p className="mt-2 text-sm leading-7 text-[#132033]">
                  Als de eerste vraag draait om hoe nieuwe medewerkers landen in hun eerste weken en maanden.
                </p>
                <p className="mt-4 text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-[#7A8698]">Wat krijgt u</p>
                <p className="mt-2 flex-1 text-sm leading-7 text-[#4A5563]">
                  Een dashboard, samenvatting en rapport die laten zien waar de start goed loopt en waar frictie ontstaat.
                </p>
                <Link
                  href="/producten/onboarding-30-60-90"
                  className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-[#3C8D8A] transition-colors hover:text-[#2d6e6b]"
                >
                  Bekijk Onboarding 30-60-90
                </Link>
              </div>

              <div className="rounded-[0.95rem] border border-[rgba(221,215,203,0.72)] bg-[rgba(247,245,241,0.42)] px-5 py-4">
                <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-[#7A8698]">Vervolgstappen</p>
                <div className="mt-3 space-y-3">
                  
                  {homepageSecondaryRoutes.map((route) => (
                    <div key={route.name} className="text-[12.5px] leading-6 text-[#7A8593]">
                      <Link href={route.href} className="font-medium text-[#233547] hover:underline">
                        {route.name}
                      </Link>
                      <span>{` â€” ${route.body}`}</span>
                    </div>
                  ))}
                </div>
                <Link
                  href="/producten"
                  className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-[#3C8D8A] transition-colors hover:text-[#2d6e6b]"
                >
                  Bekijk alle routes
                </Link>
                <p className="mt-3 text-[0.88rem] leading-6 text-[#5D6977]">
                  Combinatie wordt pas logisch als vertrek en behoud tegelijk een duidelijke vraag zijn.
                </p>
              </div>
            </div>
          </MarketingSection>

          <MarketingSection tone="surface">
            <div className="max-w-none border-b border-[rgba(221,215,203,0.72)] pb-7">
              <p className="text-[0.72rem] font-medium uppercase tracking-[0.16em] text-[#3C8D8A]">Vertrouwen en privacy</p>
              <h2 className="mt-3 font-display text-[clamp(1.65rem,3.1vw,2.3rem)] font-light leading-[1.08] tracking-[-0.035em] text-[#132033]">
                Kort, controleerbaar en zonder ruis.
              </h2>
              <p className="mt-4 w-full max-w-none text-[0.98rem] leading-8 text-[#4A5563]">
                Verisight laat op de homepage alleen de basis zien die nodig is om zorgvuldig verder te gaan.
              </p>
            </div>

            <div className="mt-7 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
              {trustPoints.map((point) => {
                const Icon = point.icon
                return (
                  <div key={point.title} className="rounded-[0.88rem] border border-[rgba(221,215,203,0.78)] bg-white px-4 py-3.5">
                    <div className="inline-flex h-8 w-8 items-center justify-center rounded-[0.72rem] bg-[#F4FAF8] text-[#234B57]">
                      <Icon />
                    </div>
                    <p className="mt-3 text-[14px] font-medium text-[#132033]">{point.title}</p>
                    <p className="mt-1.5 text-[0.84rem] leading-5 text-[#4A5563]">{point.body}</p>
                  </div>
                )
              })}
            </div>

            <div className="mt-4">
              <Link
                href="/vertrouwen"
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#3C8D8A] transition-colors hover:text-[#2d6e6b]"
              >
                Bekijk hoe dit is ingericht
              </Link>
            </div>
          </MarketingSection>

          <MarketingSection tone="plain">
            <MarketingSplitCallout
              title="Plan een kennismaking en ontdek welke route nu het best past."
              body="In 30 minuten krijgt u scherp welke eerste stap logisch is: exit, behoud, team of onboarding."
              primaryHref={buildContactHref({ routeInterest: 'nog-onzeker', ctaSource: 'homepage_closing_cta' })}
              primaryLabel="Plan een kennismaking"
              secondaryHref="/producten"
              secondaryLabel="Bekijk de routes"
            />
          </MarketingSection>
        </div>
      </MarketingPageShell>
    </>
  )
}


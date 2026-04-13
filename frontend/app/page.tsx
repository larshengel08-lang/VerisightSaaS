import Link from 'next/link'
import { ContactForm } from '@/components/marketing/contact-form'
import { PreviewSlider } from '@/components/marketing/preview-slider'
import { PublicFooter } from '@/components/marketing/public-footer'
import { PublicHeader } from '@/components/marketing/public-header'
import { SectionHeading } from '@/components/marketing/section-heading'
import { TrustStrip } from '@/components/marketing/trust-strip'
import { faqSchema, processHighlights, statCards, trustItems } from '@/components/marketing/site-content'

const heroBullets = [
  'ExitScan voor vertrekduiding',
  'RetentieScan voor vroegsignalering op behoud',
  'Een combinatie voor organisaties die beide sporen tegelijk willen gebruiken',
] as const

const routeCards = [
  {
    eyebrow: 'ExitScan',
    title: 'Begrijp waarom mensen gingen',
    description:
      'Gebruik ExitScan als je terug wilt kijken naar vertrek, patronen in werkfactoren wilt zien en management meer wilt geven dan losse exitgesprekken.',
    href: '/producten/exitscan',
    cta: 'Bekijk ExitScan',
    accent: 'border-blue-200 bg-white',
  },
  {
    eyebrow: 'RetentieScan',
    title: 'Zie eerder waar behoud schuift',
    description:
      'Gebruik RetentieScan als je eerder wilt zien waar behoud onder druk staat, met retentiesignalen, bevlogenheid en werkfactoren in een managementbeeld.',
    href: '/producten/retentiescan',
    cta: 'Bekijk RetentieScan',
    accent: 'border-emerald-200 bg-white',
  },
] as const

const decisionRows = [
  ['Je kijkt terug op uitstroom', 'ExitScan'],
  ['Je wilt eerder signaleren in actieve teams', 'RetentieScan'],
  ['Je wilt vertrek en behoud in een lijn bespreken', 'Combinatie'],
] as const

const proofCards = [
  {
    title: 'Geen losse survey-export',
    text: 'De output is opgebouwd voor HR, MT en directie: dashboard, rapport en duidelijke vervolgvraag in dezelfde taal.',
  },
  {
    title: 'Productkeuze eerst, analyse daarna',
    text: 'De site helpt eerst kiezen welke scan nu past, zodat ExitScan en RetentieScan inhoudelijk niet door elkaar gaan lopen.',
  },
  {
    title: 'Klaar voor meer producten',
    text: 'De nieuwe structuur schaalt door naar extra producten zonder dat de live propositie onduidelijk wordt.',
  },
] as const

const utilityLinks = [
  {
    href: '/producten',
    title: 'Alle producten',
    body: 'Bekijk het overzicht van live producten en gereserveerde productroutes.',
  },
  {
    href: '/aanpak',
    title: 'Aanpak',
    body: 'Zie hoe baseline, deep dive en periodieke opvolging logisch op elkaar aansluiten.',
  },
  {
    href: '/tarieven',
    title: 'Tarieven',
    body: 'Bekijk pricing, package-opbouw en wanneer een combinatie commercieel logisch wordt.',
  },
] as const

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white text-slate-900">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />

      <a
        href="#hoofdinhoud"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[60] focus:rounded-lg focus:bg-slate-900 focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-white"
      >
        Ga naar de inhoud
      </a>

      <PublicHeader />

      <main id="hoofdinhoud">
        <section className="overflow-hidden border-b border-slate-200 bg-[radial-gradient(circle_at_top_left,#dbeafe_0%,transparent_30%),linear-gradient(180deg,#f8fbff_0%,#eef4ff_48%,#ffffff_100%)] pt-16 md:pt-24">
          <div className="mx-auto max-w-6xl px-6 pb-20">
            <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
              <div className="max-w-2xl">
                <p className="text-xs font-bold uppercase tracking-[0.22em] text-blue-600">Verisight portfolio</p>
                <h1 className="font-display mt-5 text-balance text-[3rem] leading-[1.02] text-slate-950 md:text-[4.8rem]">
                  Maak scherp zichtbaar of je vraag gaat over vertrek, behoud of allebei.
                </h1>
                <p className="mt-6 max-w-xl text-lg leading-8 text-slate-600">
                  Verisight is geen losse surveytool. Je kiest een duidelijke productvorm, krijgt een professioneel dashboard en rapport, en houdt ExitScan en RetentieScan inhoudelijk uit elkaar.
                </p>

                <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                  <a
                    href="#kennismaking"
                    className="inline-flex items-center justify-center rounded-full bg-blue-600 px-7 py-3.5 text-sm font-semibold text-white shadow-[0_16px_40px_rgba(37,99,235,0.2)] transition-all hover:-translate-y-0.5 hover:bg-blue-700"
                  >
                    Plan mijn gesprek
                  </a>
                  <Link
                    href="/producten"
                    className="inline-flex items-center justify-center rounded-full border border-slate-300 bg-white px-7 py-3.5 text-sm font-semibold text-slate-700 transition-colors hover:border-slate-400 hover:text-slate-950"
                  >
                    Bekijk alle producten
                  </Link>
                </div>

                <div className="mt-8 space-y-3">
                  {heroBullets.map((bullet) => (
                    <div key={bullet} className="flex items-center gap-3 text-sm text-slate-700">
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-100 text-[10px] font-bold text-blue-700">
                        +
                      </span>
                      <span>{bullet}</span>
                    </div>
                  ))}
                </div>

                <div className="mt-10">
                  <TrustStrip items={trustItems} />
                </div>
              </div>

              <div className="grid gap-5">
                <div className="grid gap-5 xl:grid-cols-[0.82fr_1.18fr]">
                  <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-[0_24px_60px_rgba(15,23,42,0.08)]">
                    <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">Snelle keuzehulp</p>
                    <h2 className="mt-3 text-2xl font-semibold text-slate-950">Welke route past nu?</h2>
                    <div className="mt-5 space-y-3">
                      {decisionRows.map(([question, answer]) => (
                        <div key={question} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
                          <p className="text-sm font-medium text-slate-700">{question}</p>
                          <p className="mt-2 text-sm font-semibold text-blue-700">{answer}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-[0_36px_90px_rgba(15,23,42,0.12)]">
                    <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
                      <div>
                        <p className="text-sm font-semibold text-slate-900">Voorbeeld van de managementweergave</p>
                        <p className="mt-0.5 text-xs text-slate-500">
                          Fictieve data in dezelfde portfolio-opzet als echte klantoutput.
                        </p>
                      </div>
                      <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                        Portfolio
                      </span>
                    </div>
                    <div className="p-6">
                      <PreviewSlider variant="portfolio" />
                    </div>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                  {statCards.map(({ value, label, detail }) => (
                    <div key={label} className="rounded-2xl border border-slate-200 bg-white px-5 py-5 shadow-sm">
                      <p className="text-3xl font-bold text-slate-950">{value}</p>
                      <p className="mt-2 text-sm font-semibold text-slate-900">{label}</p>
                      <p className="mt-2 text-sm leading-6 text-slate-600">{detail}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-white py-24">
          <div className="mx-auto max-w-6xl px-6">
            <SectionHeading
              eyebrow="Kies je product"
              title="Twee live producten en een duidelijke combinatieroute."
              description="De homepage helpt eerst kiezen welke managementvraag je wilt beantwoorden. Dat voorkomt overlap en maakt het portfolio meteen beter schaalbaar."
              align="center"
            />

            <div className="mt-14 grid gap-5 lg:grid-cols-[1fr_1fr]">
              {routeCards.map(({ eyebrow, title, description, href, cta, accent }) => (
                <div key={title} className={`rounded-[2rem] border p-8 shadow-sm ${accent}`}>
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-600">{eyebrow}</p>
                  <h3 className="mt-4 text-3xl font-semibold text-slate-950">{title}</h3>
                  <p className="mt-4 max-w-xl text-sm leading-7 text-slate-600">{description}</p>
                  <Link
                    href={href}
                    className="mt-8 inline-flex rounded-full border border-slate-300 bg-slate-50 px-5 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:border-slate-400 hover:bg-white hover:text-slate-950"
                  >
                    {cta}
                  </Link>
                </div>
              ))}
            </div>

            <div className="mt-5 rounded-[2rem] border border-slate-200 bg-[#0d1b2e] p-8 text-white shadow-[0_28px_70px_rgba(15,23,42,0.16)]">
              <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-300">Combinatie</p>
                  <h3 className="mt-4 text-3xl font-semibold text-white">Kijk terug en vooruit in dezelfde managementtaal.</h3>
                  <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-300">
                    Start met ExitScan als je eerst vertrek wilt duiden, met RetentieScan als je eerder wilt signaleren op behoud, of zet beide bewust naast elkaar als de organisatie beide vragen tegelijk heeft.
                  </p>
                </div>
                <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
                  {decisionRows.map(([question, answer]) => (
                    <div key={question} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-4">
                      <p className="text-xs uppercase tracking-wide text-slate-400">{question}</p>
                      <p className="mt-2 text-sm font-semibold text-white">{answer}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="mt-8">
                <Link
                  href="/producten/combinatie"
                  className="inline-flex rounded-full bg-white px-5 py-3 text-sm font-semibold text-slate-900 transition-colors hover:bg-slate-100"
                >
                  Bekijk de combinatie
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-[linear-gradient(180deg,#ffffff_0%,#f8fafc_100%)] py-24">
          <div className="mx-auto max-w-6xl px-6">
            <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
              <div>
                <SectionHeading
                  eyebrow="Wanneer welke scan"
                  title="Lees de productkeuze in een minuut."
                  description="In plaats van lange, herhalende uitleg helpt deze vergelijking sneller bepalen welke route commercieel en inhoudelijk het best past."
                />
                <div className="mt-8 space-y-4">
                  {proofCards.map(({ title, text }) => (
                    <div key={title} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                      <p className="text-base font-semibold text-slate-950">{title}</p>
                      <p className="mt-2 text-sm leading-7 text-slate-600">{text}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm">
                <div className="grid border-b border-slate-200 bg-slate-50 text-sm font-semibold text-slate-600 md:grid-cols-[1.2fr_0.9fr_0.9fr]">
                  <div className="px-6 py-4">Situatie</div>
                  <div className="px-6 py-4">Beste route</div>
                  <div className="px-6 py-4">Wat je krijgt</div>
                </div>
                {[
                  [
                    'Je wilt leren van vertrek dat al heeft plaatsgevonden',
                    'ExitScan',
                    'Vertrekduiding, werkfactoren en managementrapportage',
                  ],
                  [
                    'Je wilt eerder zien waar behoud onder druk staat',
                    'RetentieScan',
                    'Retentiesignaal, bevlogenheid, vertrekintentie en duiding',
                  ],
                  [
                    'Je wilt terugkijken en tegelijk eerder kunnen bijsturen',
                    'Combinatie',
                    'Twee gerichte scans in een gedeeld portfolio',
                  ],
                ].map(([situation, route, output]) => (
                  <div
                    key={situation}
                    className="grid border-b border-slate-200 last:border-b-0 md:grid-cols-[1.2fr_0.9fr_0.9fr]"
                  >
                    <div className="px-6 py-5 text-sm leading-7 text-slate-700">{situation}</div>
                    <div className="px-6 py-5 text-sm font-semibold text-slate-950">{route}</div>
                    <div className="px-6 py-5 text-sm leading-7 text-slate-600">{output}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="bg-[#0d1b2e] py-24 text-white">
          <div className="mx-auto max-w-6xl px-6">
            <SectionHeading
              eyebrow="Wat management krijgt"
              title="Geen losse antwoorden, maar een bruikbaar managementbeeld."
              description="Het platform is gebouwd om sneller te kiezen, prioriteren en opvolgen. Niet om HR nog een losse tool of losse rapportexport te geven."
              light
              align="center"
            />

            <div className="mt-14 grid gap-5 md:grid-cols-3">
              {processHighlights.map(({ title, text }) => (
                <div key={title} className="rounded-[1.75rem] border border-white/10 bg-white/5 p-7">
                  <p className="text-sm font-bold uppercase tracking-[0.18em] text-blue-300">{title}</p>
                  <p className="mt-4 text-base leading-8 text-slate-200">{text}</p>
                </div>
              ))}
            </div>

            <div className="mt-10 grid gap-4 lg:grid-cols-3">
              {utilityLinks.map(({ href, title, body }) => (
                <Link
                  key={href}
                  href={href}
                  className="rounded-2xl border border-white/10 bg-white/5 p-5 transition-colors hover:bg-white/10"
                >
                  <p className="text-base font-semibold text-white">{title}</p>
                  <p className="mt-2 text-sm leading-7 text-slate-300">{body}</p>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-[#0d1b2e] py-24 text-white" id="kennismaking">
          <div className="mx-auto grid max-w-6xl gap-12 px-6 lg:grid-cols-[0.95fr_1.05fr]">
            <div>
              <SectionHeading
                eyebrow="Kennismaking"
                title="Binnen een kort gesprek weet je welke scan nu het best past."
                description="Deel kort je organisatieomvang en of je nu vooral vertrek wilt duiden, behoud eerder wilt signaleren of beide wilt combineren. Daarna weet je snel welke productvorm logisch is."
                light
              />
              <div className="mt-8 space-y-3">
                {[
                  'Kort verkennend gesprek van circa 20 minuten',
                  'Snel zicht op ExitScan, RetentieScan of de combinatie',
                  'Helderheid over aanpak, timing, privacy en prijs',
                ].map((item) => (
                  <div
                    key={item}
                    className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-200"
                  >
                    <span className="h-2 w-2 shrink-0 rounded-full bg-blue-300" />
                    {item}
                  </div>
                ))}
              </div>
            </div>
            <div>
              <ContactForm surface="light" />
            </div>
          </div>
        </section>
      </main>

      <PublicFooter />
    </div>
  )
}

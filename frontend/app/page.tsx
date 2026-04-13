import Link from 'next/link'
import { ContactForm } from '@/components/marketing/contact-form'
import { PreviewSlider } from '@/components/marketing/preview-slider'
import { PublicFooter } from '@/components/marketing/public-footer'
import { PublicHeader } from '@/components/marketing/public-header'
import { SectionHeading } from '@/components/marketing/section-heading'
import { TrustStrip } from '@/components/marketing/trust-strip'
import { faqSchema, processHighlights, trustItems } from '@/components/marketing/site-content'

const productRoutes = [
  {
    name: 'ExitScan',
    title: 'Begrijp waarom mensen gingen',
    body: 'Voor organisaties die terugkijkend willen leren van uitstroom en daar meer uit willen halen dan losse exitgesprekken.',
    href: '/producten/exitscan',
    accent: 'border-blue-200 bg-blue-50',
    chip: 'Terugkijkend',
  },
  {
    name: 'RetentieScan',
    title: 'Zie eerder waar behoud schuift',
    body: 'Voor organisaties die eerder willen zien waar behoud onder druk staat in actieve teams, zonder individuele voorspeller te worden.',
    href: '/producten/retentiescan',
    accent: 'border-emerald-200 bg-emerald-50',
    chip: 'Vroegsignalering',
  },
  {
    name: 'Combinatie',
    title: 'Kijk terug en vooruit in een lijn',
    body: 'Voor organisaties die uitstroom willen duiden en tegelijk eerder willen bijsturen op behoud.',
    href: '/producten/combinatie',
    accent: 'border-sky-200 bg-sky-50',
    chip: 'Portfolio',
  },
] as const

const comparisonRows = [
  [
    'Je kijkt terug op uitstroom',
    'ExitScan',
    'Vertrekduiding, werkfactoren en managementrapport',
  ],
  [
    'Je wilt eerder signaleren in actieve teams',
    'RetentieScan',
    'Retentiesignaal, bevlogenheid en vertrekintentie',
  ],
  [
    'Je wilt beide sporen naast elkaar gebruiken',
    'Combinatie',
    'Een portfolio-aanpak met twee gerichte producten',
  ],
] as const

const proofSignals = [
  'Productkeuze voor de analyse begint',
  'Dashboard en rapport in dezelfde managementtaal',
  'ExitScan en RetentieScan blijven inhoudelijk gescheiden',
] as const

const utilityLinks = [
  {
    href: '/producten',
    title: 'Alle producten',
    body: 'Bekijk live producten, combinatie en toekomstige productroutes in een schaalbare structuur.',
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
        <section className="overflow-hidden border-b border-slate-200 bg-[radial-gradient(circle_at_top_left,#dbeafe_0%,transparent_24%),radial-gradient(circle_at_bottom_right,#dcfce7_0%,transparent_28%),linear-gradient(180deg,#f8fbff_0%,#eef6ff_40%,#ffffff_100%)] pt-16 md:pt-24">
          <div className="mx-auto max-w-6xl px-6 pb-20">
            <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
              <div className="max-w-2xl">
                <p className="text-xs font-bold uppercase tracking-[0.22em] text-blue-600">Verisight productportfolio</p>
                <h1 className="font-display mt-5 text-balance text-[3rem] leading-[1.02] text-slate-950 md:text-[5rem]">
                  Begrijp waarom mensen gingen. Zie eerder waar behoud onder druk staat.
                </h1>
                <p className="mt-6 max-w-xl text-lg leading-8 text-slate-600">
                  Verisight is geen losse surveytool. Je kiest eerst de juiste productvorm en krijgt daarna een professioneel dashboard en rapport waarmee HR, MT en directie sneller kunnen kiezen wat aandacht vraagt.
                </p>

                <div className="mt-8 flex flex-wrap gap-3">
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

                <div className="mt-8 flex flex-wrap gap-2">
                  {proofSignals.map((signal) => (
                    <span
                      key={signal}
                      className="rounded-full bg-white/80 px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-700 ring-1 ring-slate-200"
                    >
                      {signal}
                    </span>
                  ))}
                </div>

                <div className="mt-10">
                  <TrustStrip items={trustItems} />
                </div>
              </div>

              <div className="grid gap-5">
                <div className="grid gap-5 xl:grid-cols-[0.88fr_1.12fr]">
                  <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-[0_24px_60px_rgba(15,23,42,0.08)]">
                    <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">Snelle keuzehulp</p>
                    <h2 className="mt-3 text-2xl font-semibold text-slate-950">Welke route past nu?</h2>
                    <div className="mt-5 space-y-3">
                      {comparisonRows.map(([question, route]) => (
                        <div key={question} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
                          <p className="text-sm font-medium text-slate-700">{question}</p>
                          <p className="mt-2 text-sm font-semibold text-blue-700">{route}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-[0_36px_90px_rgba(15,23,42,0.12)]">
                    <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
                      <div>
                        <p className="text-sm font-semibold text-slate-900">Voorbeeld van de managementweergave</p>
                        <p className="mt-0.5 text-xs text-slate-500">Fictieve data in dezelfde portfolio-opzet als echte klantoutput.</p>
                      </div>
                      <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">Portfolio</span>
                    </div>
                    <div className="p-6">
                      <PreviewSlider variant="portfolio" />
                    </div>
                  </div>
                </div>

                <div className="rounded-[2rem] border border-slate-200 bg-slate-950 p-6 text-white shadow-[0_28px_70px_rgba(15,23,42,0.16)]">
                  <div className="grid gap-4 md:grid-cols-3">
                    {[
                      ['2 live producten', 'met een eigen managementbelofte'],
                      ['1 combinatiepad', 'voor organisaties met beide vragen'],
                      ['1 platform', 'voor dashboard, rapport en opvolging'],
                    ].map(([value, detail]) => (
                      <div key={value} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                        <p className="text-lg font-semibold text-white">{value}</p>
                        <p className="mt-2 text-sm leading-6 text-slate-300">{detail}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-white py-24">
          <div className="mx-auto max-w-6xl px-6">
            <SectionHeading
              eyebrow="Kies je product"
              title="Drie duidelijke routes in plaats van een generieke HR-survey."
              description="Elke route heeft een eigen belofte, een eigen leesrichting en een eigen managementgesprek."
              align="center"
            />

            <div className="mt-14 grid gap-5 lg:grid-cols-3">
              {productRoutes.map(({ name, title, body, href, accent, chip }) => (
                <div key={name} className={`rounded-[2rem] border p-8 shadow-sm ${accent}`}>
                  <span className="inline-flex rounded-full bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-slate-700 ring-1 ring-slate-200">
                    {chip}
                  </span>
                  <h2 className="mt-5 text-3xl font-semibold text-slate-950">{title}</h2>
                  <p className="mt-4 text-sm leading-7 text-slate-600">{body}</p>
                  <div className="mt-8">
                    <Link
                      href={href}
                      className="inline-flex rounded-full border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:border-slate-400 hover:text-slate-950"
                    >
                      Bekijk {name}
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-[linear-gradient(180deg,#ffffff_0%,#f8fafc_100%)] py-24">
          <div className="mx-auto max-w-6xl px-6">
            <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
              <div>
                <SectionHeading
                  eyebrow="Vergelijking"
                  title="Lees de productkeuze in een minuut."
                  description="In plaats van drie bijna gelijke tekstblokken laat deze matrix zien wanneer welk product commercieel en inhoudelijk logisch is."
                />
                <div className="mt-8 space-y-4">
                  {[
                    {
                      title: 'Geen losse survey-export',
                      text: 'De output is opgebouwd voor HR, MT en directie: dashboard, rapport en duidelijke vervolgvraag in dezelfde taal.',
                    },
                    {
                      title: 'Eerst kiezen, dan analyseren',
                      text: 'De site helpt eerst kiezen welke scan nu past, zodat ExitScan en RetentieScan inhoudelijk niet door elkaar gaan lopen.',
                    },
                    {
                      title: 'Klaar voor meer producten',
                      text: 'De nieuwe structuur schaalt door naar extra producten zonder dat de live propositie onduidelijk wordt.',
                    },
                  ].map(({ title, text }) => (
                    <div key={title} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                      <p className="text-base font-semibold text-slate-950">{title}</p>
                      <p className="mt-2 text-sm leading-7 text-slate-600">{text}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm">
                <div className="grid border-b border-slate-200 bg-slate-50 text-sm font-semibold text-slate-600 md:grid-cols-[1.1fr_0.8fr_1.1fr]">
                  <div className="px-6 py-4">Situatie</div>
                  <div className="px-6 py-4">Beste route</div>
                  <div className="px-6 py-4">Wat je krijgt</div>
                </div>
                {comparisonRows.map(([situation, route, output]) => (
                  <div key={situation} className="grid border-b border-slate-200 last:border-b-0 md:grid-cols-[1.1fr_0.8fr_1.1fr]">
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
              description="Het platform is gebouwd om sneller te kiezen, prioriteren en opvolgen. Niet om HR nog een losse tool of rapportexport te geven."
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
                <Link key={href} href={href} className="rounded-2xl border border-white/10 bg-white/5 p-5 transition-colors hover:bg-white/10">
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

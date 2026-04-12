import Link from 'next/link'
import { ContactForm } from '@/components/marketing/contact-form'
import { PreviewSlider } from '@/components/marketing/preview-slider'
import { PublicFooter } from '@/components/marketing/public-footer'
import { PublicHeader } from '@/components/marketing/public-header'
import { faqSchema } from '@/components/marketing/site-content'

const problemCards = [
  {
    title: 'Losse exitgesprekken blijven versnipperd',
    description:
      'Informatie is er vaak wel, maar niet in een vorm die je betrouwbaar kunt vergelijken over afdelingen, perioden of groepen heen.',
  },
  {
    title: 'De rode draad blijft te lang onzichtbaar',
    description:
      'Tegen de tijd dat patronen duidelijk worden, zijn werving, inwerken en productiviteitsverlies vaak al meerdere keren gemaakt.',
  },
  {
    title: 'Management wil keuzes, HR mist een stevig beeld',
    description:
      'Zonder structuur blijft het gesprek hangen in indrukken, terwijl je juist richting wilt geven aan leiderschap, groei of werkbelasting.',
  },
] as const

const valueBullets = [
  'Dashboard en managementrapport in één traject',
  'Begeleide uitvoering, dus geen extra surveytool voor HR',
  'Snel zien waar gerichte actie het meeste oplevert',
] as const

const summaryCards = [
  {
    eyebrow: 'Probleem',
    title: 'Van losse exits naar een gedeeld organisatiebeeld',
    description:
      'Je ziet welke vertrekpatronen terugkeren en waar dezelfde frictie vaker opduikt.',
  },
  {
    eyebrow: 'Aanpak',
    title: 'Begeleid traject zonder extra toolbeheer',
    description:
      'Verisight richt de exitscan in, begeleidt de uitvoering en levert direct bruikbare output op.',
  },
  {
    eyebrow: 'Oplossing',
    title: 'Dashboard en rapport waarmee je sneller prioriteert',
    description:
      'HR, MT en directie zien sneller waar verdiepend gesprek of gerichte actie het meeste oplevert.',
  },
] as const

const infoCards = [
  {
    href: '/product',
    eyebrow: 'Product',
    title: 'Wat maakt Verisight anders?',
    description:
      'Bekijk hoe Verisight zich verhoudt tot losse exitgesprekken, surveytools en consultancy.',
    cta: 'Bekijk product',
  },
  {
    href: '/aanpak',
    eyebrow: 'Aanpak',
    title: 'Hoe werkt een exitscan in de praktijk?',
    description:
      'Zie het verschil tussen ExitScan Baseline en ExitScan Live, en wat je als organisatie aanlevert.',
    cta: 'Bekijk aanpak',
  },
  {
    href: '/tarieven',
    eyebrow: 'Tarieven',
    title: 'Wat koop je precies en wat kost het?',
    description:
      'Bekijk de launchprijs, de optionele add-on en wanneer segmentverdieping logisch is.',
    cta: 'Bekijk tarieven',
  },
] as const

function SectionLabel({
  children,
  light = false,
}: {
  children: React.ReactNode
  light?: boolean
}) {
  return (
    <p className={`text-xs font-bold uppercase tracking-widest ${light ? 'text-blue-300' : 'text-blue-600'}`}>
      {children}
    </p>
  )
}

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white text-slate-900">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      <a
        href="#hoofdinhoud"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[60] focus:rounded-lg focus:bg-slate-900 focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-white"
      >
        Ga naar de inhoud
      </a>

      <PublicHeader />

      <main id="hoofdinhoud">
        <section className="bg-[#f8f9fb] pt-20 md:pt-28">
          <div className="mx-auto max-w-6xl px-6 pb-18">
            <div className="mx-auto max-w-3xl text-center">
              <h1 className="font-display text-balance text-[2.9rem] leading-[1.12] text-slate-950 md:text-[4rem]">
                Maak uitstroompatronen zichtbaar. Zie waar gerichte actie het meeste oplevert.
              </h1>
              <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-slate-600">
                Verisight bundelt exitgegevens tot één vergelijkbaar organisatiebeeld, met dashboard,
                managementrapport en duidelijke prioriteiten voor HR, MT en directie.
              </p>
              <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
                <a
                  href="#kennismaking"
                  className="inline-flex rounded-xl bg-blue-600 px-7 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
                >
                  Plan mijn gesprek
                </a>
                <Link
                  href="/product"
                  className="inline-flex rounded-xl border border-slate-300 px-7 py-3.5 text-sm font-semibold text-slate-700 transition-colors hover:border-slate-400 hover:text-slate-950"
                >
                  Bekijk product
                </Link>
              </div>
              <div className="mt-6 flex flex-col items-center gap-2 text-sm text-slate-600">
                {valueBullets.map((bullet) => (
                  <div key={bullet} className="flex items-center gap-3">
                    <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                    <span>{bullet}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="bg-white py-20">
          <div className="mx-auto max-w-6xl px-6">
            <div className="mx-auto max-w-3xl text-center">
              <SectionLabel>Waarom organisaties starten</SectionLabel>
              <h2 className="font-display mt-4 text-4xl text-slate-950 md:text-5xl">
                Uitstroom is vaak zichtbaar per gesprek, maar niet als patroon.
              </h2>
              <p className="mt-5 text-lg leading-8 text-slate-600">
                Verisight helpt om terugkerende frictie zichtbaar te maken, zodat HR en management
                sneller zien waar verdiepend gesprek of gerichte actie het meeste oplevert.
              </p>
            </div>

            <div className="mt-12 grid gap-5 md:grid-cols-3">
              {problemCards.map(({ title, description }) => (
                <div key={title} className="rounded-2xl border border-slate-200 bg-slate-50 p-6">
                  <h3 className="text-lg font-semibold leading-7 text-slate-950">{title}</h3>
                  <p className="mt-3 text-sm leading-7 text-slate-600">{description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-[#f8f9fb] py-20">
          <div className="mx-auto max-w-6xl px-6">
            <div className="mx-auto max-w-5xl rounded-3xl border border-slate-200 bg-white shadow-sm">
              <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
                <div>
                  <p className="text-sm font-semibold text-slate-900">Voorbeeld van de managementweergave</p>
                  <p className="mt-0.5 text-xs text-slate-500">
                    Voorbeeldweergave met fictieve data in dezelfde rapportstijl als echte klantoutput.
                  </p>
                </div>
                <span className="shrink-0 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-600">
                  exitscan
                </span>
              </div>
              <div className="relative p-6">
                <span className="absolute left-10 top-10 z-10 rounded-full bg-slate-950/85 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.2em] text-white">
                  Voorbeeld
                </span>
                <PreviewSlider />
              </div>
            </div>

            <div className="mx-auto mt-10 grid max-w-5xl gap-5 md:grid-cols-3">
              {summaryCards.map(({ eyebrow, title, description }) => (
                <div key={eyebrow} className="rounded-2xl border border-slate-200 bg-white p-6">
                  <p className="text-sm font-bold uppercase tracking-widest text-blue-600">{eyebrow}</p>
                  <p className="mt-3 text-xl font-semibold text-slate-950">{title}</p>
                  <p className="mt-3 text-sm leading-7 text-slate-600">{description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-white py-20">
          <div className="mx-auto max-w-6xl px-6">
            <div className="mx-auto max-w-3xl text-center">
              <SectionLabel>Meer over Verisight</SectionLabel>
              <h2 className="font-display mt-4 text-4xl text-slate-950 md:text-5xl">
                Bekijk product, aanpak en tarieven op aparte pagina’s.
              </h2>
              <p className="mt-5 text-lg leading-8 text-slate-600">
                Zo kun je sneller zien wat Verisight is, hoe een exitscan werkt en welke vorm het
                best past bij jullie situatie.
              </p>
            </div>

            <div className="mt-12 grid gap-5 lg:grid-cols-3">
              {infoCards.map(({ href, eyebrow, title, description, cta }) => (
                <div key={href} className="rounded-2xl border border-slate-200 bg-slate-50 p-6">
                  <p className="text-xs font-bold uppercase tracking-widest text-blue-600">{eyebrow}</p>
                  <h3 className="mt-3 text-xl font-semibold text-slate-950">{title}</h3>
                  <p className="mt-3 text-sm leading-7 text-slate-600">{description}</p>
                  <Link
                    href={href}
                    className="mt-6 inline-flex rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:border-slate-400 hover:text-slate-950"
                  >
                    {cta}
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-[#0d1b2e] py-20 text-white" id="kennismaking">
          <div className="mx-auto grid max-w-6xl gap-12 px-6 lg:grid-cols-2">
            <div>
              <SectionLabel light>Kennismaking</SectionLabel>
              <h2 className="font-display mt-4 text-4xl text-white md:text-5xl">
                Binnen een kort gesprek weet je of exitscan nu voor jullie zinvol is.
              </h2>
              <p className="mt-4 text-lg leading-8 text-slate-400">
                Deel kort je organisatieomvang en wat je vooral wilt begrijpen van uitstroom. Daarna
                weet je snel of dit traject past en welke aanpak logisch is.
              </p>
              <div className="mt-8 space-y-3">
                {[
                  'Kort verkennend gesprek van circa 20 minuten',
                  'Snel zicht op of Baseline of Live beter past',
                  'Helderheid over aanpak, timing en prijs',
                ].map((item) => (
                  <div
                    key={item}
                    className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-300"
                  >
                    <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-blue-400" />
                    {item}
                  </div>
                ))}
              </div>
            </div>
            <div>
              <ContactForm />
            </div>
          </div>
        </section>
      </main>

      <PublicFooter />
    </div>
  )
}

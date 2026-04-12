import Link from 'next/link'
import { ContactForm } from '@/components/marketing/contact-form'
import { PreviewSlider } from '@/components/marketing/preview-slider'
import { PublicFooter } from '@/components/marketing/public-footer'
import { PublicHeader } from '@/components/marketing/public-header'
import { SectionHeading } from '@/components/marketing/section-heading'
import { TrustStrip } from '@/components/marketing/trust-strip'
import { faqSchema, processHighlights, statCards, trustItems } from '@/components/marketing/site-content'

const problemCards = [
  {
    title: 'Losse exitinformatie blijft versnipperd',
    description:
      'De signalen zijn er vaak wel, maar niet in een vorm die je betrouwbaar kunt vergelijken over afdelingen en perioden.',
  },
  {
    title: 'De rode draad blijft te lang onzichtbaar',
    description:
      'Tegen de tijd dat patronen duidelijk worden, zijn werving, inwerken en productiviteitsverlies vaak al meerdere keren gemaakt.',
  },
  {
    title: 'Management wil keuzes, HR mist een stevig beeld',
    description:
      'Zonder structuur blijft het gesprek hangen in indrukken, terwijl je juist richting wilt geven aan groei, leiderschap of werkbelasting.',
  },
] as const

const heroBullets = [
  'Dashboard en managementrapport in één traject',
  'Begeleide uitvoering, dus geen extra toolbeheer voor HR',
  'Snel zien waar gerichte actie het meeste oplevert',
] as const

const infoCards = [
  {
    href: '/product',
    eyebrow: 'Product',
    title: 'Waarom Verisight anders is',
    description:
      'Bekijk hoe Verisight zich verhoudt tot losse exitgesprekken, surveytools en consultancy.',
    cta: 'Bekijk product',
  },
  {
    href: '/aanpak',
    eyebrow: 'Aanpak',
    title: 'Hoe een exitscan werkt',
    description:
      'Zie het verschil tussen ExitScan Baseline en ExitScan Live, en wat je als organisatie aanlevert.',
    cta: 'Bekijk aanpak',
  },
  {
    href: '/tarieven',
    eyebrow: 'Tarieven',
    title: 'Wat je koopt en wat het kost',
    description:
      'Bekijk de launchprijs, de add-on en wanneer segmentverdieping logisch is.',
    cta: 'Bekijk tarieven',
  },
] as const

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
        <section className="overflow-hidden border-b border-slate-200 bg-[linear-gradient(180deg,#f6f8fb_0%,#edf4ff_50%,#ffffff_100%)] pt-16 md:pt-24">
          <div className="mx-auto max-w-6xl px-6 pb-20">
            <div className="grid items-center gap-12 lg:grid-cols-[0.92fr_1.08fr]">
              <div className="max-w-2xl">
                <p className="text-xs font-bold uppercase tracking-[0.22em] text-blue-600">Begeleide ExitScan</p>
                <h1 className="font-display mt-5 text-balance text-[3rem] leading-[1.05] text-slate-950 md:text-[4.8rem]">
                  Maak uitstroompatronen zichtbaar.
                  <span className="block text-blue-700">Zie waar gerichte actie het meeste oplevert.</span>
                </h1>
                <p className="mt-6 max-w-xl text-lg leading-8 text-slate-600">
                  Verisight bundelt exitgegevens tot één vergelijkbaar organisatiebeeld, met dashboard, managementrapport en duidelijke prioriteiten voor HR, MT en directie.
                </p>

                <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                  <a
                    href="#kennismaking"
                    className="inline-flex items-center justify-center rounded-full bg-blue-600 px-7 py-3.5 text-sm font-semibold text-white shadow-[0_16px_40px_rgba(37,99,235,0.2)] transition-all hover:-translate-y-0.5 hover:bg-blue-700"
                  >
                    Plan mijn gesprek
                  </a>
                  <Link
                    href="/product"
                    className="inline-flex items-center justify-center rounded-full border border-slate-300 bg-white px-7 py-3.5 text-sm font-semibold text-slate-700 transition-colors hover:border-slate-400 hover:text-slate-950"
                  >
                    Bekijk product
                  </Link>
                </div>

                <div className="mt-8 space-y-3">
                  {heroBullets.map((bullet) => (
                    <div key={bullet} className="flex items-center gap-3 text-sm text-slate-700">
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-100 text-[10px] font-bold text-blue-700">
                        ✓
                      </span>
                      <span>{bullet}</span>
                    </div>
                  ))}
                </div>

                <div className="mt-10">
                  <TrustStrip items={trustItems} />
                </div>
              </div>

              <div className="relative">
                <div className="absolute -left-8 top-8 hidden h-36 w-36 rounded-full bg-blue-200/30 blur-3xl lg:block" />
                <div className="absolute -right-8 bottom-10 hidden h-44 w-44 rounded-full bg-slate-300/30 blur-3xl lg:block" />
                <div className="relative overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-[0_40px_90px_rgba(15,23,42,0.12)]">
                  <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
                    <div>
                      <p className="text-sm font-semibold text-slate-900">Voorbeeld van de managementweergave</p>
                      <p className="mt-0.5 text-xs text-slate-500">
                        Voorbeeldweergave met fictieve data in dezelfde rapportstijl als echte klantoutput.
                      </p>
                    </div>
                    <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                      ExitScan
                    </span>
                  </div>
                  <div className="relative p-6">
                    <span className="absolute left-10 top-10 z-10 rounded-full bg-slate-950/85 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.2em] text-white">
                      Voorbeeld
                    </span>
                    <PreviewSlider />
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-12 grid gap-4 md:grid-cols-3">
              {statCards.map(({ value, label, detail }) => (
                <div key={label} className="rounded-2xl border border-slate-200 bg-white/80 px-5 py-5 backdrop-blur">
                  <p className="text-3xl font-bold text-slate-950">{value}</p>
                  <p className="mt-2 text-sm font-semibold text-slate-900">{label}</p>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{detail}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-white py-24">
          <div className="mx-auto max-w-6xl px-6">
            <SectionHeading
              eyebrow="Waarom organisaties starten"
              title="Uitstroom is vaak zichtbaar per gesprek, maar niet als patroon."
              description="Verisight helpt om terugkerende frictie zichtbaar te maken, zodat HR en management sneller zien waar gesprek, validatie of gerichte actie het meeste oplevert."
              align="center"
            />

            <div className="mt-14 grid gap-5 md:grid-cols-3">
              {problemCards.map(({ title, description }) => (
                <div key={title} className="rounded-[1.75rem] border border-slate-200 bg-slate-50 p-7">
                  <h3 className="text-xl font-semibold leading-8 text-slate-950">{title}</h3>
                  <p className="mt-4 text-sm leading-7 text-slate-600">{description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-[#0d1b2e] py-24 text-white">
          <div className="mx-auto max-w-6xl px-6">
            <SectionHeading
              eyebrow="Wat dit oplevert"
              title="Geen losse notities, maar een bruikbare basis voor HR, MT en directie."
              description="Verisight vertaalt vertrekinput naar een gedeeld managementbeeld dat helpt prioriteren, bespreken en gerichter beslissen."
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
          </div>
        </section>

        <section className="bg-[linear-gradient(180deg,#ffffff_0%,#f8fafc_100%)] py-24">
          <div className="mx-auto max-w-6xl px-6">
            <SectionHeading
              eyebrow="Zo is de site opgebouwd"
              title="Bekijk product, aanpak en tarieven op aparte pagina’s."
              description="Zo kun je sneller zien wat Verisight is, hoe een exitscan werkt en welke vorm het best past bij jullie situatie."
              align="center"
            />

            <div className="mt-14 grid gap-5 lg:grid-cols-3">
              {infoCards.map(({ href, eyebrow, title, description, cta }) => (
                <div key={href} className="rounded-[1.75rem] border border-slate-200 bg-white p-7 shadow-sm">
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-600">{eyebrow}</p>
                  <h3 className="mt-4 text-2xl font-semibold text-slate-950">{title}</h3>
                  <p className="mt-4 text-sm leading-7 text-slate-600">{description}</p>
                  <Link
                    href={href}
                    className="mt-8 inline-flex rounded-full border border-slate-300 bg-slate-50 px-5 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:border-slate-400 hover:bg-white hover:text-slate-950"
                  >
                    {cta}
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-[#0d1b2e] py-24 text-white" id="kennismaking">
          <div className="mx-auto grid max-w-6xl gap-12 px-6 lg:grid-cols-[0.95fr_1.05fr]">
            <div>
              <SectionHeading
                eyebrow="Kennismaking"
                title="Binnen een kort gesprek weet je of ExitScan nu voor jullie zinvol is."
                description="Deel kort je organisatieomvang en wat je vooral wilt begrijpen van uitstroom. Daarna weet je snel of dit traject past en welke aanpak logisch is."
                light
              />
              <div className="mt-8 space-y-3">
                {[
                  'Kort verkennend gesprek van circa 20 minuten',
                  'Snel zicht op of Baseline of Live beter past',
                  'Helderheid over aanpak, timing en prijs',
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
            <div className="rounded-[2rem] border border-white/10 bg-white/5 p-3 backdrop-blur-sm">
              <div className="rounded-[1.6rem] bg-white p-1">
                <ContactForm />
              </div>
            </div>
          </div>
        </section>
      </main>

      <PublicFooter />
    </div>
  )
}

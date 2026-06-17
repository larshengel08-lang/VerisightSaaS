'use client'

import Link from 'next/link'
import { AC, Arrow, FF, Reveal, SHELL, T } from '@/components/marketing/design-tokens'
import { MarketingClosingCta } from '@/components/marketing/marketing-closing-cta'
import { buildContactHref } from '@/lib/contact-funnel'
import { pricingCards } from '@/components/marketing/site-content'

const TEAL = 'oklch(0.50 0.12 188)'
const TEAL_SOFT = 'oklch(0.972 0.018 185)'
const AMBER = '#9b5f1e'
const AMBER_SOFT = 'oklch(0.97 0.03 70)'

// Gedeelde levering: identiek voor elke scan, daarom hier één keer i.p.v. per scan herhaald.
const sharedDelivery = [
  'Intake en scopebepaling',
  'Survey klaarzetten en launchpakket leveren (uitnodigingslink + tekst)',
  'Respons monitoren op campagneniveau',
  'Managementrapport met patronen en prioriteiten',
  'Begeleide managementbespreking (60–90 min)',
  'Eerste vervolgrichting vastgelegd',
] as const

const scans = [
  {
    id: 'loep-vertrek',
    index: '01',
    eyebrow: 'Vertrek begrijpen',
    title: 'Loep Vertrek',
    lead: 'Wij brengen vertrekpatronen scherp in beeld en begeleiden je naar één eerste managementkeuze.',
    when: [
      'Vertrek is zichtbaar maar de reden is onduidelijk',
      'Management vraagt om een onderbouwd beeld',
      'Je wilt van losse exitgesprekken naar een structureel patroon',
      'Je wilt een eerste keuze, geen breed onderzoeksproject',
    ],
    output: 'Managementrapport met vertrekduiding, factoranalyse en prioriteiten.',
    contactRoute: 'exitscan',
    accent: AC.deep,
    accentSoft: AC.faint,
  },
  {
    id: 'loep-behoud',
    index: '02',
    eyebrow: 'Behoud versterken',
    title: 'Loep Behoud',
    lead: 'Wij laten zien waar behoud onder druk staat, vóór uitstroom zichtbaar wordt.',
    when: [
      'Verloop loopt op maar de oorzaak is onduidelijk',
      'Je wilt bijsturen vóór mensen vertrekbesluiten hebben genomen',
      'Management wil weten waar het risico zit, niet alleen een gevoel',
      'Je wilt een eerste keuze, geen breed MTO-project',
    ],
    output: 'Managementrapport met retentiesignaal, stay-intent en prioriteiten op groepsniveau.',
    contactRoute: 'retentiescan',
    accent: TEAL,
    accentSoft: TEAL_SOFT,
  },
  {
    id: 'loep-start',
    index: '03',
    eyebrow: 'Goed landen',
    title: 'Loep Start',
    lead: 'Wij meten vroeg hoe nieuwe medewerkers landen en leveren een helder groepsbeeld met een eerste vervolgrichting.',
    when: [
      'Nieuwe medewerkers landen ongelijk of haken vroeg af',
      'Je wilt vroeg toetsen hoe rol, leiding en team nu landen',
      'Management wil een eerste beeld zonder brede retentiescan',
      'Je wilt eerst een kleine borg- of correctiestap bepalen',
    ],
    output: 'Rapport met de vroege landing in rol, leiding en team op groepsniveau.',
    contactRoute: 'onboarding',
    accent: AMBER,
    accentSoft: AMBER_SOFT,
  },
] as const

const primaryPricingCards = pricingCards.filter(
  (item) =>
    item.eyebrow === 'Loep Vertrek Baseline' ||
    item.eyebrow === 'Loep Behoud Baseline' ||
    item.eyebrow === 'Loep Start Baseline',
)

function HeroSection() {
  const primaryHref = buildContactHref({ routeInterest: 'nog-onzeker', ctaSource: 'products_hero_primary' })

  return (
    <section
      style={{
        background: T.white,
        borderBottom: `1px solid ${T.rule}`,
        overflow: 'hidden',
        padding: 'clamp(52px,6.5vw,80px) 0 clamp(44px,5.5vw,68px)',
        position: 'relative',
      }}
    >
      <div
        style={{
          backgroundImage: `linear-gradient(${T.rule}55 1px,transparent 1px),linear-gradient(90deg,${T.rule}55 1px,transparent 1px)`,
          backgroundSize: '72px 72px',
          inset: 0,
          opacity: 0.32,
          pointerEvents: 'none',
          position: 'absolute',
        }}
      />
      <div
        style={{
          background: `radial-gradient(circle, ${AC.soft} 0%, transparent 65%)`,
          height: 480,
          pointerEvents: 'none',
          position: 'absolute',
          right: -40,
          top: -90,
          width: 480,
        }}
      />
      <div style={{ ...SHELL, position: 'relative' }}>
        <div style={{ maxWidth: '70ch', margin: '0 auto', textAlign: 'center' }}>
          <p style={{ color: AC.deep, fontSize: 11, fontWeight: 700, letterSpacing: '.18em', marginBottom: 18, textTransform: 'uppercase' }}>
            Producten
          </p>
          <h1 style={{ color: T.ink, fontFamily: FF, fontSize: 'clamp(42px,5.5vw,76px)', fontWeight: 800, letterSpacing: '-.032em', lineHeight: 0.97, maxWidth: '12ch', margin: '0 auto' }}>
            Welke vraag speelt nu het sterkst?
          </h1>
          <p style={{ color: T.inkSoft, fontSize: 16.5, lineHeight: 1.72, margin: '26px auto 36px', maxWidth: '58ch' }}>
            Drie gelijkwaardige scans, elk met een begeleide uitvoering, een scherp managementrapport en een
            managementbespreking. Loep Vertrek als vertrek de vraag is, Loep Behoud als behoud eerder zichtbaar moet
            zijn, Loep Start als de vroege landing aandacht vraagt.
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 18, justifyContent: 'center' }}>
            {scans.map((scan) => (
              <a
                key={scan.id}
                href={`#${scan.id}`}
                style={{ alignItems: 'center', color: scan.accent, display: 'inline-flex', fontSize: 13.5, fontWeight: 600, gap: 6, textDecoration: 'none' }}
              >
                {scan.title} <Arrow />
              </a>
            ))}
          </div>
          <div style={{ marginTop: 30 }}>
            <Link
              href={primaryHref}
              style={{ alignItems: 'center', background: T.ink, color: '#fff', display: 'inline-flex', fontSize: 14.5, fontWeight: 600, gap: 8, padding: '12px 28px', textDecoration: 'none' }}
            >
              Bespreek je vraagstuk <Arrow />
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}

function SharedDeliverySection() {
  return (
    <section style={{ background: T.white, borderBottom: `1px solid ${T.rule}`, padding: 'clamp(48px,5.5vw,72px) 0' }}>
      <div style={SHELL}>
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[0.8fr_1.2fr]">
          <Reveal>
            <div>
              <div style={{ color: AC.deep, fontSize: 10, fontWeight: 700, letterSpacing: '.16em', marginBottom: 14, textTransform: 'uppercase' }}>
                Zo werkt elke scan
              </div>
              <h2 style={{ color: T.ink, fontFamily: FF, fontSize: 'clamp(26px,3vw,38px)', fontWeight: 700, letterSpacing: '-.026em', lineHeight: 1.06, maxWidth: '15ch' }}>
                Eén begeleide route, ongeacht de scan.
              </h2>
              <p style={{ color: T.inkSoft, fontSize: 15, lineHeight: 1.72, marginTop: 16, maxWidth: '46ch' }}>
                De drie scans verschillen in vraag en uitkomst, maar de uitvoering is hetzelfde. Loep voert uit, jij
                beheert geen tool.
              </p>
            </div>
          </Reveal>
          <Reveal delay={0.08} from="right">
            <div style={{ display: 'grid', gap: 8, gridTemplateColumns: 'repeat(2, minmax(0, 1fr))' }}>
              {sharedDelivery.map((step, index) => (
                <div key={step} style={{ alignItems: 'flex-start', background: T.white, border: `1px solid ${T.rule}`, display: 'flex', gap: 12, padding: '14px 16px' }}>
                  <span style={{ color: AC.deep, fontFamily: FF, fontSize: 12, fontWeight: 600 }}>{String(index + 1).padStart(2, '0')}</span>
                  <span style={{ color: T.inkSoft, fontSize: 13, lineHeight: 1.5 }}>{step}</span>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  )
}

function ScanSection({ scan, alt }: { scan: (typeof scans)[number]; alt: boolean }) {
  return (
    <section
      id={scan.id}
      style={{ background: alt ? T.paperSoft : T.white, borderBottom: `1px solid ${T.rule}`, padding: 'clamp(52px,6vw,82px) 0', scrollMarginTop: 80 }}
    >
      <div style={SHELL}>
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1fr_1fr] lg:gap-16 items-start">
          <Reveal>
            <div style={{ borderLeft: `3px solid ${scan.accent}`, paddingLeft: 22 }}>
              <div style={{ alignItems: 'center', color: scan.accent, display: 'flex', fontSize: 10, fontWeight: 700, gap: 10, letterSpacing: '.16em', marginBottom: 16, textTransform: 'uppercase' }}>
                <span style={{ color: T.inkMuted }}>{scan.index}</span>
                {scan.eyebrow}
              </div>
              <h2 style={{ color: T.ink, fontFamily: FF, fontSize: 'clamp(32px,4vw,52px)', fontWeight: 800, letterSpacing: '-.03em', lineHeight: 1.0, marginBottom: 16 }}>
                {scan.title}
              </h2>
              <p style={{ color: T.inkSoft, fontSize: 16, lineHeight: 1.7, marginBottom: 24, maxWidth: '40ch' }}>{scan.lead}</p>
              <div style={{ color: T.ink, fontFamily: FF, fontSize: 22, fontWeight: 600, letterSpacing: '-.02em', marginBottom: 22 }}>
                Vanaf €4.500
              </div>
              <Link
                href={buildContactHref({ routeInterest: scan.contactRoute, ctaSource: `products_scan_${scan.contactRoute}` })}
                style={{ alignItems: 'center', background: T.ink, color: '#fff', display: 'inline-flex', fontSize: 13.5, fontWeight: 600, gap: 6, padding: '12px 24px', textDecoration: 'none' }}
              >
                Bespreek of {scan.title} past <Arrow />
              </Link>
            </div>
          </Reveal>
          <Reveal delay={0.08} from="right">
            <div>
              <div style={{ color: scan.accent, fontSize: 10, fontWeight: 700, letterSpacing: '.16em', marginBottom: 14, textTransform: 'uppercase' }}>
                Wanneer logisch
              </div>
              <div style={{ borderTop: `1px solid ${T.rule}`, display: 'grid', gap: 0, marginBottom: 22 }}>
                {scan.when.map((item) => (
                  <div key={item} style={{ alignItems: 'flex-start', borderBottom: `1px solid ${T.rule}`, display: 'grid', gap: 12, gridTemplateColumns: '16px 1fr', padding: '14px 0' }}>
                    <span aria-hidden style={{ background: scan.accent, borderRadius: '50%', height: 6, marginTop: 8, width: 6 }} />
                    <p style={{ color: T.inkSoft, fontSize: 14.5, lineHeight: 1.6 }}>{item}</p>
                  </div>
                ))}
              </div>
              <div style={{ background: T.white, border: `1px solid ${T.rule}`, padding: '16px 18px' }}>
                <div style={{ color: T.inkMuted, fontSize: 10, fontWeight: 700, letterSpacing: '.16em', marginBottom: 8, textTransform: 'uppercase' }}>
                  Wat je terugkrijgt
                </div>
                <p style={{ color: T.inkSoft, fontSize: 14, lineHeight: 1.6 }}>{scan.output}</p>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  )
}

function TrustSection() {
  const points = [
    'Rapportage alleen op groepsniveau, geen individuele data',
    'Minimum aantal respondenten vereist voor veilige rapportage',
    'Geen individuele voorspellingen of profielen',
    'AVG-conforme dataverwerking',
  ]
  return (
    <section style={{ background: T.paperSoft, borderBottom: `1px solid ${T.rule}`, padding: 'clamp(48px,5.5vw,72px) 0' }}>
      <div style={SHELL}>
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[0.9fr_1.1fr]">
          <Reveal>
            <h2 style={{ color: T.ink, fontFamily: FF, fontSize: 'clamp(26px,3vw,40px)', fontWeight: 700, letterSpacing: '-.03em', lineHeight: 1.0, maxWidth: '14ch' }}>
              Veilig op groepsniveau. Niets op de persoon.
            </h2>
          </Reveal>
          <Reveal delay={0.08} from="right">
            <div>
              <div style={{ borderTop: `1px solid ${T.rule}`, display: 'grid', gap: 0 }}>
                {points.map((point) => (
                  <div key={point} style={{ alignItems: 'flex-start', borderBottom: `1px solid ${T.rule}`, display: 'grid', gap: 14, gridTemplateColumns: '18px 1fr', padding: '16px 0' }}>
                    <span aria-hidden style={{ background: TEAL, borderRadius: '50%', height: 8, marginTop: 7, width: 8 }} />
                    <p style={{ color: T.ink, fontSize: 15.5, lineHeight: 1.6 }}>{point}</p>
                  </div>
                ))}
              </div>
              <div style={{ background: T.paperSoft, border: `1px solid ${T.rule}`, marginTop: 22, padding: '16px 20px' }}>
                <div style={{ color: T.inkMuted, fontSize: 10, fontWeight: 700, letterSpacing: '.16em', marginBottom: 8, textTransform: 'uppercase' }}>Methode</div>
                <p style={{ color: T.inkSoft, fontSize: 14.5, lineHeight: 1.7 }}>
                  Loep gebruikt gevalideerde vragenlijsten, geduid door HR-specialisten, geen geautomatiseerde
                  software-output. Elke rapportage is contextgebonden en wordt begeleid met een managementbespreking.
                </p>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  )
}

function PricingSection() {
  return (
    <section id="tarieven" style={{ background: T.white, borderBottom: `1px solid ${T.rule}`, padding: 'clamp(52px,6vw,82px) 0', scrollMarginTop: 80 }}>
      <div style={SHELL}>
        <Reveal>
          <div style={{ marginBottom: 34, maxWidth: '60ch' }}>
            <div style={{ color: AC.deep, fontSize: 10, fontWeight: 700, letterSpacing: '.16em', marginBottom: 12, textTransform: 'uppercase' }}>Tarieven</div>
            <h2 style={{ color: T.ink, fontFamily: FF, fontSize: 'clamp(28px,3.5vw,42px)', fontWeight: 700, letterSpacing: '-.026em', lineHeight: 1.06, marginBottom: 14 }}>
              Transparante prijs. Heldere eerste stap.
            </h2>
            <p style={{ color: T.inkSoft, fontSize: 15, lineHeight: 1.7 }}>
              Je koopt geen licentie, maar een uitgevoerde scan, een scherp managementrapport met prioriteiten en een
              begeleide managementbespreking. Maatwerk op aanvraag.
            </p>
          </div>
        </Reveal>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {primaryPricingCards.map((item, index) => (
            <Reveal key={item.eyebrow} delay={index * 0.06}>
              <article style={{ background: T.white, border: `1px solid ${T.rule}`, borderTop: `3px solid ${AC.deep}`, padding: '34px' }}>
                <div style={{ color: AC.deep, fontSize: 10, fontWeight: 700, letterSpacing: '.16em', marginBottom: 12, textTransform: 'uppercase' }}>{item.eyebrow}</div>
                <div style={{ color: T.ink, fontFamily: FF, fontSize: 'clamp(2rem,4vw,3rem)', fontWeight: 400, letterSpacing: '-.03em', lineHeight: 1, marginBottom: 14 }}>{item.price}</div>
                <p style={{ color: T.inkSoft, fontSize: 13.5, lineHeight: 1.7, marginBottom: 24 }}>{item.description}</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {item.bullets.map((bullet) => (
                    <div key={bullet} style={{ alignItems: 'flex-start', background: T.paperSoft, color: T.inkSoft, display: 'flex', fontSize: 13, gap: 10, padding: '10px 14px' }}>
                      <div style={{ background: AC.deep, flexShrink: 0, height: 4, marginTop: 5, width: 4 }} />
                      {bullet}
                    </div>
                  ))}
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}

function ContactSection() {
  const href = buildContactHref({ routeInterest: 'nog-onzeker', ctaSource: 'products_closing_cta' })

  return (
    <MarketingClosingCta
      href={href}
      accentTitle="scan nu past?"
      backdropNumber={null}
      body="In een eerste kennismaking toetsen we welke scan nu de juiste eerste stap is en wat je als eerste terugkrijgt."
      buttonLabel="Bespreek je vraagstuk"
      sectionIndex=""
      sectionLabel=""
      showSectionMark={false}
      title="Twijfel je welke"
    />
  )
}

export function ProductenContent() {
  return (
    <div style={{ background: T.paper, color: T.ink, overflowX: 'hidden' }}>
      <HeroSection />
      {scans.map((scan, index) => (
        <ScanSection key={scan.id} scan={scan} alt={index % 2 === 0} />
      ))}
      <SharedDeliverySection />
      <TrustSection />
      <PricingSection />
      <ContactSection />
    </div>
  )
}

'use client'

import Link from 'next/link'
import { AC, Arrow, FF, Reveal, SHELL, T } from '@/components/marketing/design-tokens'
import { MarketingClosingCta } from '@/components/marketing/marketing-closing-cta'
import { buildContactHref } from '@/lib/contact-funnel'
import { approachSteps, included } from '@/components/marketing/site-content'

const normalizedApproachSteps = approachSteps

function HeroSection() {
  const ctaHref = buildContactHref({ routeInterest: 'nog-onzeker', ctaSource: 'approach_hero_primary' })

  return (
    <section
      style={{
        background: T.white,
        padding: 'clamp(52px,6.5vw,80px) 0 clamp(48px,6vw,72px)',
        borderBottom: `1px solid ${T.rule}`,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          backgroundImage: `linear-gradient(${T.rule}60 1px,transparent 1px),linear-gradient(90deg,${T.rule}60 1px,transparent 1px)`,
          backgroundSize: '72px 72px',
          opacity: 0.35,
        }}
      />
      <div
        style={{
          position: 'absolute',
          top: -80,
          right: -60,
          width: 500,
          height: 500,
          background: `radial-gradient(circle,${AC.soft} 0%,transparent 65%)`,
          pointerEvents: 'none',
        }}
      />
      <div style={{ ...SHELL, position: 'relative' }}>
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1fr_390px] lg:gap-20 items-start">
          <Reveal>
            <div>
            <p
              style={{
                color: AC.deep,
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: '.18em',
                marginBottom: 18,
                textTransform: 'uppercase',
              }}
            >
              Aanpak
            </p>
            <h1
              style={{
                fontFamily: FF,
                fontWeight: 800,
                fontSize: 'clamp(42px,5.5vw,76px)',
                lineHeight: 0.97,
                letterSpacing: '-.032em',
                color: T.ink,
              }}
            >
              Wij doen het werk.
              <br />
              <em className="shimmer-text" style={{ fontStyle: 'italic' }}>
                U maakt de keuze.
              </em>
            </h1>
            <p style={{ fontSize: 16.5, lineHeight: 1.72, color: T.inkSoft, maxWidth: '48ch', margin: '28px 0 36px' }}>
              Loep voert de scan uit, analyseert de uitkomsten en begeleidt u naar één eerste managementkeuze.
              U hoeft geen tool in te richten of te beheren.
            </p>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <Link
                href={ctaHref}
                style={{
                  textDecoration: 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 7,
                  fontSize: 14.5,
                  fontWeight: 600,
                  padding: '12px 28px',
                  color: '#fff',
                  background: AC.deep,
                }}
              >
                Toets uw eerste route <Arrow />
              </Link>
              <Link
                href="/producten"
                style={{
                  textDecoration: 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 7,
                  fontSize: 14.5,
                  fontWeight: 500,
                  padding: '11px 27px',
                  color: T.inkSoft,
                  border: `1px solid ${T.rule}`,
                }}
              >
                Bekijk producten
              </Link>
            </div>
            </div>
          </Reveal>

          <Reveal delay={0.08} from="right">
            <div>
              <div style={{ padding: '28px', background: T.paperSoft, border: `1px solid ${T.rule}` }}>
              <div
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  letterSpacing: '.16em',
                  textTransform: 'uppercase',
                  color: T.inkMuted,
                  marginBottom: 18,
                }}
              >
                Wat u als eerste ontvangt
              </div>
              {[
                { step: 'Stap 1', label: 'Juiste route kiezen' },
                { step: 'Stap 2', label: 'Eerste signalen zichtbaar' },
                { step: 'Stap 3', label: 'Rapport en managementbespreking' },
              ].map((item, index) => (
                <div
                  key={item.step}
                  style={{
                    padding: '14px 0',
                    borderBottom: index < 2 ? `1px solid ${T.rule}` : 'none',
                    display: 'flex',
                    gap: 16,
                    alignItems: 'baseline',
                  }}
                >
                  <span style={{ fontFamily: FF, fontSize: 11, color: T.inkFaint, minWidth: 52 }}>{item.step}</span>
                  <span style={{ fontSize: 13.5, fontWeight: 600, color: T.ink }}>{item.label}</span>
                </div>
              ))}
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  )
}

function ProcessSection() {
  return (
    <section style={{ background: T.white, padding: 'clamp(56px,7vw,88px) 0', borderBottom: `1px solid ${T.rule}` }}>
      <div style={SHELL}>
        <Reveal>
          <div style={{ marginBottom: 32 }}>
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '.16em', textTransform: 'uppercase', color: T.inkMuted, marginBottom: 12 }}>
            Procesroute
          </div>
          <h2
            style={{
              fontFamily: FF,
              fontSize: 'clamp(28px,3.5vw,42px)',
              fontWeight: 700,
              letterSpacing: '-.026em',
              color: T.ink,
              marginBottom: 14,
              lineHeight: 1.06,
            }}
          >
            Zo loopt de route baseline-first.
          </h2>
          <p style={{ fontSize: 15, lineHeight: 1.7, color: T.inkSoft, maxWidth: '52ch' }}>
            U kiest eerst de juiste route. Daarna voert Loep de scan uit en levert een rapport met prioriteiten en een begeleide
            managementbespreking.
          </p>
          </div>
        </Reveal>

        <div className="grid grid-cols-1 gap-0 md:grid-cols-2 xl:grid-cols-3">
          {normalizedApproachSteps.map((step, index) => (
            <Reveal key={step.title} delay={index * 0.06}>
              <div
                style={{
                  padding: '28px',
                  borderTop: `1px solid ${T.rule}`,
                  borderLeft: index % 3 > 0 ? `1px solid ${T.rule}` : 'none',
                  background: index === 1 || index === 4 ? AC.faint : 'transparent',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 16 }}>
                  <span style={{ fontFamily: FF, fontSize: 13, color: index === 1 || index === 4 ? AC.deep : T.inkFaint }}>
                    {`0${index + 1}`}
                  </span>
                  <span style={{ width: 28, height: '1px', background: index === 1 || index === 4 ? AC.mid : T.rule, flexShrink: 0 }} />
                </div>
                <div style={{ fontSize: 13.5, fontWeight: 600, color: T.ink, marginBottom: 8 }}>
                  {step.title.replace(/^\d+\.\s*/, '')}
                </div>
                <p style={{ fontSize: 13, lineHeight: 1.65, color: T.inkSoft }}>{step.body}</p>
              </div>
            </Reveal>
          ))}
        </div>
        <div style={{ borderTop: `1px solid ${T.rule}` }} />
      </div>
    </section>
  )
}

function RolesSection() {
  return (
    <section style={{ background: T.white, padding: 'clamp(52px,6vw,80px) 0', borderBottom: `1px solid ${T.rule}` }}>
      <div style={SHELL}>
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:gap-16 items-start">
          <Reveal>
            <div>
            <h2
              style={{
                fontFamily: FF,
                fontSize: 'clamp(26px,3vw,38px)',
                fontWeight: 700,
                letterSpacing: '-.022em',
                color: T.ink,
                lineHeight: 1.1,
                marginBottom: 18,
              }}
            >
              Uw rol blijft compact.
            </h2>
            <p style={{ fontSize: 14, lineHeight: 1.72, color: T.inkSoft, marginBottom: 28 }}>
              U bevestigt route en timing, levert de respondentbasis aan en neemt deel aan de managementbespreking. Loep houdt de
              uitvoering compact en bewaakt de kwaliteit.
            </p>

            {[
              {
                title: 'Route en timing bevestigen',
                body: 'U bevestigt welke stap nu loopt, voor welke groepen en wanneer de eerste lezing wordt opgebouwd.',
              },
              {
                title: 'Benodigde input aanleveren',
                body: 'U levert de respondentbasis aan. Loep houdt daarna de opzet compact en zorgvuldig.',
              },
              {
                title: 'Rapport ontvangen en keuze maken',
                body: 'U ontvangt het rapport en neemt deel aan de managementbespreking. Samen bepalen we de eerste keuze.',
              },
            ].map((item, index) => (
              <div key={item.title} style={{ display: 'flex', gap: 18, padding: '20px 0', borderTop: `1px solid ${T.rule}` }}>
                <span style={{ fontFamily: FF, fontSize: 12, color: T.inkFaint, minWidth: 24, paddingTop: 2, flexShrink: 0 }}>
                  {`0${index + 1}`}
                </span>
                <div>
                  <div style={{ fontSize: 13.5, fontWeight: 600, color: T.ink, marginBottom: 5 }}>{item.title}</div>
                  <p style={{ fontSize: 13, color: T.inkSoft, lineHeight: 1.62 }}>{item.body}</p>
                </div>
              </div>
            ))}
            <div style={{ borderTop: `1px solid ${T.rule}` }} />
            </div>
          </Reveal>

          <Reveal delay={0.08} from="right">
            <div style={{ background: T.paperSoft, border: `1px solid ${T.rule}`, padding: '32px' }}>
            <div
              style={{
                fontSize: 10,
                fontWeight: 700,
                letterSpacing: '.16em',
                textTransform: 'uppercase',
                color: T.inkMuted,
                marginBottom: 22,
              }}
            >
              Altijd inbegrepen
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {included.map((item) => (
                <div
                  key={item}
                  style={{ display: 'flex', alignItems: 'flex-start', gap: 10, fontSize: 13, color: T.inkSoft, lineHeight: 1.5 }}
                >
                  <div style={{ width: 4, height: 4, background: AC.mid, flexShrink: 0, marginTop: 6 }} />
                  {item}
                </div>
              ))}
            </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  )
}

function FirstValueSection() {
  const items = [
    {
      threshold: 'Scan loopt',
      text: 'De vragenlijst is verstuurd. Wij bewaken de respons en houden u op de hoogte zonder dat u iets hoeft te monitoren.',
    },
    {
      threshold: 'Beeld bouwt op',
      text: 'Zodra voldoende respons binnen is, worden de eerste patronen zichtbaar. We wachten op een stabiel beeld voordat we het rapport opleveren.',
    },
    {
      threshold: 'Rapport en bespreking',
      text: 'U ontvangt het managementrapport. Daarna volgt de begeleide managementbespreking: samen bepalen we de eerste keuze.',
    },
  ]

  return (
    <section style={{ background: T.white, padding: 'clamp(52px,6vw,80px) 0', borderBottom: `1px solid ${T.rule}` }}>
      <div style={SHELL}>
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-[280px_1fr] lg:gap-20 items-start">
          <Reveal>
            <div>
            <h2
              style={{
                fontFamily: FF,
                fontSize: 'clamp(24px,2.8vw,34px)',
                fontWeight: 700,
                letterSpacing: '-.022em',
                color: T.ink,
                lineHeight: 1.15,
                marginBottom: 16,
              }}
            >
              Eerste keuze
              <br />
              <em className="shimmer-text" style={{ fontStyle: 'italic' }}>
                in weken, niet maanden.
              </em>
            </h2>
            <p style={{ fontSize: 13.5, lineHeight: 1.7, color: T.inkSoft }}>
              Loep levert snel een bruikbaar beeld. Verdieping of vervolgmeting komen pas als de volgende vraag echt speelt — niet eerder.
            </p>
            </div>
          </Reveal>

          <div>
            {items.map((item, index) => (
              <Reveal key={item.threshold} delay={index * 0.06}>
                <div style={{ display: 'flex', gap: 20, padding: '22px 0', borderTop: `1px solid ${T.rule}`, alignItems: 'flex-start' }}>
                  <div style={{ minWidth: 136, flexShrink: 0 }}>
                    <span
                      style={{
                        fontSize: 11,
                        fontWeight: 700,
                        letterSpacing: '.06em',
                        padding: '4px 10px',
                        background: index === 2 ? AC.faint : T.paperSoft,
                        color: index === 2 ? AC.deep : T.inkMuted,
                        border: `1px solid ${index === 2 ? AC.soft : T.rule}`,
                        display: 'inline-block',
                      }}
                    >
                      {item.threshold}
                    </span>
                  </div>
                  <p style={{ fontSize: 13.5, color: T.inkSoft, lineHeight: 1.65, paddingTop: 3 }}>{item.text}</p>
                </div>
              </Reveal>
            ))}
            <div style={{ borderTop: `1px solid ${T.rule}` }} />
          </div>
        </div>
      </div>
    </section>
  )
}

function ContactSection() {
  const kennismakingHref = buildContactHref({ routeInterest: 'nog-onzeker', ctaSource: 'approach_closing_cta' })

  return (
    <MarketingClosingCta
      href={kennismakingHref}
      sectionIndex=""
      sectionLabel=""
      backdropNumber={null}
      showSectionMark={false}
      title="Toets welke eerste route"
      accentTitle="nu het meeste duidelijkheid geeft."
      body="In een korte kennismaking toetsen we welke stap past, welke eerste uitkomst u krijgt en wanneer vervolg logisch wordt."
      buttonLabel="Plan een eerste route-inschatting"
    />
  )
}

export function AanpakContent() {
  return (
    <div style={{ background: T.white, color: T.ink, overflowX: 'hidden' }}>
      <HeroSection />
      <ProcessSection />
      <RolesSection />
      <FirstValueSection />
      <ContactSection />
    </div>
  )
}


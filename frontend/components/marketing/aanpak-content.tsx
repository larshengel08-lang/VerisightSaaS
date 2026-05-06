'use client'

import Link from 'next/link'
import { AC, Arrow, FF, SHELL, T } from '@/components/marketing/design-tokens'
import { MarketingClosingCta } from '@/components/marketing/marketing-closing-cta'
import { buildContactHref } from '@/lib/contact-funnel'
import { approachSteps, included } from '@/components/marketing/site-content'

const normalizedApproachSteps = approachSteps.map((step, index) =>
  index === 5
    ? {
        ...step,
        body: 'Pas daarna worden reviewcadans, Live Start of een latere vervolgronde logisch als dezelfde vraag opnieuw gevolgd moet worden.',
      }
    : step,
)

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
                fontWeight: 400,
                fontSize: 'clamp(42px,5.5vw,76px)',
                lineHeight: 0.97,
                letterSpacing: '-.032em',
                color: T.ink,
              }}
            >
              Van routekeuze naar
              <br />
              <em className="shimmer-text" style={{ fontStyle: 'italic' }}>
                baseline, review en opvolging.
              </em>
            </h1>
            <p style={{ fontSize: 16.5, lineHeight: 1.72, color: T.inkSoft, maxWidth: '48ch', margin: '28px 0 36px' }}>
              Verisight helpt eerst bepalen welke route nu het meeste duidelijkheid geeft. Daarna volgt normaal een
              baseline naar dashboard, managementrapport en review. Pas als de gekozen opvolging zichtbaar geborgd
              moet worden, komt Action Center Start erbij.
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
                Baseline-first routeflow
              </div>
              {[
                { step: 'Stap 1', label: 'Juiste route kiezen' },
                { step: 'Stap 2', label: 'Baseline, dashboard en managementrapport' },
                { step: 'Stap 3', label: 'Review en optionele opvolging' },
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
        </div>
      </div>
    </section>
  )
}

function ProcessSection() {
  return (
    <section style={{ background: T.white, padding: 'clamp(56px,7vw,88px) 0', borderBottom: `1px solid ${T.rule}` }}>
      <div style={SHELL}>
        <div style={{ marginBottom: 32 }}>
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '.16em', textTransform: 'uppercase', color: T.inkMuted, marginBottom: 12 }}>
            Procesroute
          </div>
          <h2
            style={{
              fontFamily: FF,
              fontSize: 'clamp(28px,3.5vw,42px)',
              fontWeight: 400,
              letterSpacing: '-.026em',
              color: T.ink,
              marginBottom: 14,
              lineHeight: 1.06,
            }}
          >
            Zo loopt de route baseline-first.
          </h2>
          <p style={{ fontSize: 15, lineHeight: 1.7, color: T.inkSoft, maxWidth: '52ch' }}>
            De route begint met de juiste keuze en een baseline. Daarna volgen dashboard, managementrapport en review.
            Action Center Start komt alleen in beeld als opvolging bewust zichtbaar geborgd moet worden.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-0 md:grid-cols-2 xl:grid-cols-3">
          {normalizedApproachSteps.map((step, index) => (
            <div
              key={step.title}
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
          <div>
            <h2
              style={{
                fontFamily: FF,
                fontSize: 'clamp(26px,3vw,38px)',
                fontWeight: 400,
                letterSpacing: '-.022em',
                color: T.ink,
                lineHeight: 1.1,
                marginBottom: 18,
              }}
            >
              Uw rol blijft compact.
            </h2>
            <p style={{ fontSize: 14, lineHeight: 1.72, color: T.inkSoft, marginBottom: 28 }}>
              U bevestigt route en timing, levert de benodigde input aan en gebruikt dashboard, managementrapport en
              review als compacte leeslijn. Alleen waar relevant komt daar Action Center Start bij als zichtbare
              opvolglaag.
            </p>

            {[
              {
                title: 'Route en timing bevestigen',
                body: 'U bevestigt welke route nu loopt, voor welke groepen en met welke baseline de eerste vraag geopend wordt.',
              },
              {
                title: 'Benodigde input aanleveren',
                body: 'U levert de input aan die nodig is om de baseline zorgvuldig en compact te laten lopen.',
              },
              {
                title: 'Output en review gebruiken',
                body: 'U gebruikt dashboard, managementrapport en review om te zien wat opvalt, wat eerst telt en of zichtbare opvolging nu nodig is.',
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
        </div>
      </div>
    </section>
  )
}

function FirstValueSection() {
  const items = [
    {
      threshold: 'Baseline',
      text: 'De eerste waarde zit in een scherpe eerste lezing van wat nu speelt, zonder de route meteen breder of zwaarder te maken.',
    },
    {
      threshold: 'Dashboard en rapport',
      text: 'De eerste bruikbare weergave wordt zichtbaar in dashboard en managementrapport, met wat opvalt en wat eerst telt.',
    },
    {
      threshold: 'Review',
      text: 'In review bepaalt u of de eerste vervolgrichting genoeg is, of dat Action Center Start of later ritme echt logisch wordt.',
    },
  ]

  return (
    <section style={{ background: T.white, padding: 'clamp(52px,6vw,80px) 0', borderBottom: `1px solid ${T.rule}` }}>
      <div style={SHELL}>
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-[280px_1fr] lg:gap-20 items-start">
          <div>
            <h2
              style={{
                fontFamily: FF,
                fontSize: 'clamp(24px,2.8vw,34px)',
                fontWeight: 400,
                letterSpacing: '-.022em',
                color: T.ink,
                lineHeight: 1.15,
                marginBottom: 16,
              }}
            >
              Eerste waarde
              <br />
              <em className="shimmer-text" style={{ fontStyle: 'italic' }}>
                zonder brede uitrol.
              </em>
            </h2>
            <p style={{ fontSize: 13.5, lineHeight: 1.7, color: T.inkSoft }}>
              De eerste waarde zit in baseline, dashboard, managementrapport en review. Pas als de volgende vraag
              echt speelt, wordt extra opvolging of ritme breder nodig.
            </p>
          </div>

          <div>
            {items.map((item, index) => (
              <div key={item.threshold} style={{ display: 'flex', gap: 20, padding: '22px 0', borderTop: `1px solid ${T.rule}`, alignItems: 'flex-start' }}>
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
      body="In een korte kennismaking toetsen we welke baseline past, wat u als eerste terugkrijgt en of Action Center Start of later ritme pas daarna logisch wordt."
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

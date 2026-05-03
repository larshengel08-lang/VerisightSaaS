'use client'

import Link from 'next/link'
import { T, FF, SHELL, useInView, Reveal, Arrow, SectionMark } from '@/components/marketing/design-tokens'
import { MarketingClosingCta } from '@/components/marketing/marketing-closing-cta'
import { buildContactHref } from '@/lib/contact-funnel'
import {
  trustItems,
  trustVerificationCards,
  trustHubAnswerCards,
  trustSupportCards,
  trustReadingRows,
} from '@/components/marketing/site-content'

function HeroSection() {
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
          background: `radial-gradient(circle,${T.tealFaint} 0%,transparent 65%)`,
          pointerEvents: 'none',
        }}
      />
      <div style={{ ...SHELL, position: 'relative' }}>
        <div style={{ animation: 'slideDownFade .55s cubic-bezier(.16,1,.3,1) .05s both' }}>
          <SectionMark num="01" label="Vertrouwen" inView />
        </div>
        <div className="grid grid-cols-1 items-start gap-10 lg:grid-cols-[1fr_360px] lg:gap-16">
          <div>
            <div style={{ animation: 'slideUpFade .9s cubic-bezier(.16,1,.3,1) .15s both' }}>
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
                Wat u publiek kunt toetsen
                <br />
                <em style={{ fontStyle: 'italic', color: T.teal }}>voordat u start.</em>
              </h1>
            </div>
            <div style={{ animation: 'slideUpFade .8s cubic-bezier(.16,1,.3,1) .3s both' }}>
              <p
                style={{
                  fontSize: 16.5,
                  lineHeight: 1.72,
                  color: T.inkSoft,
                  maxWidth: '46ch',
                  margin: '28px 0 0',
                }}
              >
                Verisight laat publiek zien hoe privacy, rapportlezing en productgrenzen zijn ingericht, zodat u de basis
                kunt toetsen voordat een traject start.
              </p>
            </div>
          </div>
          <div style={{ animation: 'slideRightFade .8s cubic-bezier(.16,1,.3,1) .28s both' }}>
            <div style={{ padding: '28px', background: T.tealFaint, border: `1px solid ${T.tealSoft}` }}>
              <div
                style={{
                  fontSize: 9.5,
                  fontWeight: 600,
                  letterSpacing: '.14em',
                  textTransform: 'uppercase',
                  color: T.teal,
                  marginBottom: 16,
                }}
              >
                Publieke basis
              </div>
              {trustItems.slice(0, 4).map((item, i) => (
                <div
                  key={i}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 10,
                    padding: '10px 0',
                    borderTop: i > 0 ? `1px solid ${T.tealSoft}` : 'none',
                    fontSize: 13,
                    color: T.inkSoft,
                    lineHeight: 1.5,
                  }}
                >
                  <div style={{ width: 4, height: 4, background: T.teal, flexShrink: 0, marginTop: 5 }} />
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

function VerificationSection() {
  const [sRef] = useInView(0.08)

  return (
    <section
      style={{
        background: T.white,
        padding: 'clamp(56px,7vw,88px) 0',
        borderBottom: `1px solid ${T.rule}`,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <div ref={sRef} style={{ ...SHELL, position: 'relative' }}>
        <Reveal delay={0.05}>
          <h2
            style={{
              fontFamily: FF,
              fontSize: 'clamp(28px,3.5vw,42px)',
              fontWeight: 400,
              letterSpacing: '-.026em',
              color: T.ink,
              marginBottom: 32,
              lineHeight: 1.06,
            }}
          >
            Wat u publiek kunt verifiëren
          </h2>
        </Reveal>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {trustVerificationCards.map((card, i) => (
            <Reveal key={i} delay={0.08 + i * 0.06}>
              <div style={{ padding: '24px 24px 22px', border: `1px solid ${T.rule}`, background: T.white }}>
                <div style={{ fontSize: 13.5, fontWeight: 600, color: T.ink, marginBottom: 8 }}>{card.title}</div>
                <p style={{ fontSize: 13, color: T.inkSoft, lineHeight: 1.65 }}>{card.body}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}

function ReadingGuideSection() {
  const [sRef] = useInView(0.08)

  return (
    <section
      style={{
        background: T.white,
        padding: 'clamp(52px,6vw,80px) 0',
        borderBottom: `1px solid ${T.rule}`,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <div ref={sRef} style={{ ...SHELL, position: 'relative' }}>
        <Reveal delay={0.05}>
          <h2
            style={{
              fontFamily: FF,
              fontSize: 'clamp(26px,3vw,38px)',
              fontWeight: 400,
              letterSpacing: '-.022em',
              color: T.ink,
              marginBottom: 14,
              lineHeight: 1.1,
            }}
          >
            Gebruik Verisight als gespreksinput,
            <br />
            <em style={{ fontStyle: 'italic', color: T.teal }}>niet als diagnose.</em>
          </h2>
          <p style={{ fontSize: 15, lineHeight: 1.7, color: T.inkSoft, marginBottom: 36, maxWidth: '50ch' }}>
            Deze pagina laat dezelfde interpretatiegrenzen zien als rapport en dashboard.
          </p>
        </Reveal>
        <Reveal delay={0.1}>
          <div style={{ border: `1px solid ${T.rule}`, overflow: 'hidden' }}>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '160px 1fr 1fr',
                background: T.paperSoft,
                borderBottom: `1px solid ${T.rule}`,
              }}
            >
              {['Thema', 'Wat u wel ziet', 'Wat u er niet van moet maken'].map((h, i) => (
                <div
                  key={i}
                  style={{
                    padding: '12px 18px',
                    fontSize: 10,
                    fontWeight: 600,
                    letterSpacing: '.14em',
                    textTransform: 'uppercase',
                    color: T.inkMuted,
                  }}
                >
                  {h}
                </div>
              ))}
            </div>
            {trustReadingRows.map(([theme, yes, no], i) => (
              <div
                key={i}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '160px 1fr 1fr',
                  borderTop: i > 0 ? `1px solid ${T.ruleLight}` : 'none',
                }}
              >
                <div style={{ padding: '14px 18px', fontSize: 13, fontWeight: 600, color: T.ink }}>{theme}</div>
                <div style={{ padding: '14px 18px', fontSize: 13, color: T.inkSoft, lineHeight: 1.6 }}>{yes}</div>
                <div style={{ padding: '14px 18px', fontSize: 13, color: T.inkMuted, lineHeight: 1.6, fontStyle: 'italic' }}>
                  {no}
                </div>
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  )
}

function PrivacySection() {
  const [sRef] = useInView(0.08)

  return (
    <section
      style={{
        background: T.white,
        padding: 'clamp(52px,6vw,80px) 0',
        borderBottom: `1px solid ${T.rule}`,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <div ref={sRef} style={{ ...SHELL, position: 'relative' }}>
        <Reveal delay={0.05}>
          <h2
            style={{
              fontFamily: FF,
              fontSize: 'clamp(26px,3vw,38px)',
              fontWeight: 400,
              letterSpacing: '-.022em',
              color: T.ink,
              marginBottom: 14,
              lineHeight: 1.1,
            }}
          >
            Snelle antwoorden op
            <br />
            <em style={{ fontStyle: 'italic', color: T.teal }}>voorspelbare vragen.</em>
          </h2>
          <p style={{ fontSize: 15, lineHeight: 1.7, color: T.inkSoft, marginBottom: 32, maxWidth: '50ch' }}>
            Zo kunt u de basis toetsen voordat er een gesprek plaatsvindt.
          </p>
        </Reveal>
        <div className="grid grid-cols-1 gap-0 md:grid-cols-2 xl:grid-cols-3">
          {trustHubAnswerCards.map((card, i) => (
            <Reveal key={i} delay={0.06 + i * 0.05}>
              <div style={{ padding: '22px 24px', borderTop: `1px solid ${T.rule}`, borderLeft: i % 3 > 0 ? `1px solid ${T.rule}` : 'none' }}>
                <div style={{ fontSize: 13.5, fontWeight: 600, color: T.ink, marginBottom: 8 }}>{card.title}</div>
                <p style={{ fontSize: 13, lineHeight: 1.65, color: T.inkSoft }}>{card.body}</p>
              </div>
            </Reveal>
          ))}
        </div>
        <div style={{ borderTop: `1px solid ${T.rule}` }} />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2" style={{ marginTop: 24 }}>
          {trustSupportCards.map((card, i) => (
            <Reveal key={i} delay={0.08 + i * 0.05}>
              <Link
                href={card.href}
                style={{
                  textDecoration: 'none',
                  display: 'block',
                  padding: '18px 22px',
                  border: `1px solid ${T.rule}`,
                  background: T.white,
                  transition: 'all .18s',
                }}
                onMouseEnter={e => {
                  ;(e.currentTarget as HTMLElement).style.borderColor = T.teal
                  ;(e.currentTarget as HTMLElement).style.background = T.tealFaint
                }}
                onMouseLeave={e => {
                  ;(e.currentTarget as HTMLElement).style.borderColor = T.rule
                  ;(e.currentTarget as HTMLElement).style.background = T.white
                }}
              >
                <div style={{ fontSize: 13.5, fontWeight: 600, color: T.ink, marginBottom: 4 }}>{card.title}</div>
                <p style={{ fontSize: 12.5, lineHeight: 1.55, color: T.inkSoft, marginBottom: 10 }}>{card.body}</p>
                <span style={{ fontSize: 12, fontWeight: 600, color: T.teal, display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                  Bekijken <Arrow />
                </span>
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}

function ContactSection() {
  const kennismakingHref = buildContactHref({ routeInterest: 'exitscan', ctaSource: 'trust_closing_cta' })

  return (
    <MarketingClosingCta
      href={kennismakingHref}
      sectionIndex="05"
      sectionLabel="Eerste route-inschatting"
      backdropNumber={null}
      title="Toets of Verisight"
      accentTitle="nu past."
      body="In een kort gesprek toetsen we productkeuze, privacy, timing en wat u als eerste terugkrijgt."
      buttonLabel="Plan een eerste route-inschatting"
      showSectionMark={false}
    />
  )
}

export function VertrouwenContent() {
  return (
    <div style={{ background: T.paper, color: T.ink, overflowX: 'hidden' }}>
      <HeroSection />
      <VerificationSection />
      <ReadingGuideSection />
      <PrivacySection />
      <ContactSection />
    </div>
  )
}

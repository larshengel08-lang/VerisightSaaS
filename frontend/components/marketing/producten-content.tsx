'use client'

import Link from 'next/link'
import { T, AC, FF, SHELL, useInView, Reveal, Arrow, SectionMark } from '@/components/marketing/design-tokens'
import { MarketingInlineContactPanel } from '@/components/marketing/marketing-inline-contact-panel'
import { buildContactHref } from '@/lib/contact-funnel'

const mainRoutes = [
  {
    num: '01',
    tag: 'Vertrek & uitstroom',
    title: 'ExitScan',
    accent: AC.deep,
    accentMid: AC.mid,
    accentFaint: AC.faint,
    desc: 'Begrijp waarom medewerkers vertrekken en waar gerichte actie het meeste effect heeft. Terugkijkende vertrekduiding op groepsniveau.',
    bullets: ['Vertrekredenen op themaniveau', 'Patronen per team of afdeling', 'Bestuurlijke handoff inbegrepen'],
    href: '/producten/exitscan',
    chip: 'Kernroute',
  },
  {
    num: '02',
    tag: 'Behoud & vroegsignalering',
    title: 'RetentieScan',
    accent: 'oklch(0.50 0.12 188)' as string,
    accentMid: 'oklch(0.62 0.10 185)' as string,
    accentFaint: 'oklch(0.972 0.018 185)' as string,
    desc: 'Zie eerder waar behoud onder druk staat en welke signalen nu aandacht vragen. Vroegsignalering op groeps- en segmentniveau.',
    bullets: ['Risicozones per team', 'Stay-intent en vertrekintentie', 'Geen individuele signalen'],
    href: '/producten/retentiescan',
    chip: 'Kernroute',
  },
  {
    num: '03',
    tag: 'Portfolioroute',
    title: 'Combinatie',
    accent: 'oklch(0.46 0.12 220)' as string,
    accentMid: 'oklch(0.62 0.10 220)' as string,
    accentFaint: 'oklch(0.972 0.012 220)' as string,
    desc: 'Verbind vertrekduiding en vroegsignalering in een gedeelde managementtaal. Voor organisaties met beide vraagstukken.',
    bullets: ['ExitScan + RetentieScan', 'Gedeelde managementlijn', 'Geen derde kernproduct'],
    href: '/producten/combinatie',
    chip: 'Portfolioroute',
  },
] as const

const boundedPeerRoute = {
  title: 'Onboarding 30-60-90',
  label: 'Bounded peer',
  desc: 'Vroege checkpoint-read voor nieuwe medewerkers op 30, 60 en 90 dagen. Kleiner dan een hoofdproduct, maar ook niet zomaar een gewone vervolgronde.',
  href: '/producten/onboarding-30-60-90',
  color: 'oklch(.46 .14 72)',
} as const

const followOnRoutes = [
  {
    title: 'Pulse',
    label: 'Vervolgroute',
    desc: 'Compacte reviewlaag na een eerste baseline. Kort en gericht zicht op wat nu verschuift.',
    href: '/producten/pulse',
    color: AC.mid,
  },
  {
    title: 'Leadership Scan',
    label: 'Managementcontext',
    desc: 'Begrensde managementread nadat een bestaand people-signaal duiding vraagt.',
    href: '/producten/leadership-scan',
    color: 'oklch(.42 .12 290)',
  },
] as const

function HeroSection() {
  const ctaHref = buildContactHref({ routeInterest: 'exitscan', ctaSource: 'products_hero_primary' })
  return (
    <section style={{ background: T.white, padding: 'clamp(52px,6.5vw,80px) 0 clamp(48px,6vw,72px)', borderBottom: `1px solid ${T.rule}`, position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', backgroundImage: `linear-gradient(${T.rule}60 1px,transparent 1px),linear-gradient(90deg,${T.rule}60 1px,transparent 1px)`, backgroundSize: '72px 72px', opacity: .35 }} />
      <div style={{ position: 'absolute', top: -80, right: -60, width: 500, height: 500, background: `radial-gradient(circle,${AC.soft} 0%,transparent 65%)`, pointerEvents: 'none' }} />
      <div style={{ ...SHELL, position: 'relative' }}>
        <div style={{ animation: 'slideDownFade .55s cubic-bezier(.16,1,.3,1) .05s both' }}>
          <SectionMark num="--" label="Twee kernproducten · bounded peer · bewuste vervolgroutes" inView />
        </div>
        <div style={{ maxWidth: '68ch' }}>
          <div style={{ animation: 'slideUpFade .9s cubic-bezier(.16,1,.3,1) .15s both' }}>
            <h1 style={{ fontFamily: FF, fontWeight: 400, fontSize: 'clamp(42px,5.5vw,76px)', lineHeight: .97, letterSpacing: '-.032em', color: T.ink }}>
              Kies de route die past<br />
              <em className="shimmer-text" style={{ fontStyle: 'italic' }}>bij de managementvraag.</em>
            </h1>
          </div>
          <div style={{ animation: 'slideUpFade .8s cubic-bezier(.16,1,.3,1) .3s both' }}>
            <p style={{ fontSize: 16.5, lineHeight: 1.72, color: T.inkSoft, margin: '28px 0 36px' }}>
              ExitScan helpt vertrek achteraf begrijpen. RetentieScan helpt eerder signaleren waar behoud onder druk staat. Combinatie blijft een kleinere portfolioroute, onboarding een bounded peer en Pulse plus Leadership Scan blijven bewust vervolg.
            </p>
          </div>
          <div style={{ animation: 'slideUpFade .7s cubic-bezier(.16,1,.3,1) .44s both', display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <Link href={ctaHref} style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 7, fontSize: 14.5, fontWeight: 600, padding: '12px 28px', color: '#fff', background: T.ink, transition: 'all .18s cubic-bezier(.4,0,0,1)' }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)'; (e.currentTarget as HTMLElement).style.background = AC.deep }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = 'none'; (e.currentTarget as HTMLElement).style.background = T.ink }}>
              Plan een kennismaking <Arrow />
            </Link>
            <Link href="/tarieven" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 7, fontSize: 14.5, fontWeight: 500, padding: '11px 27px', color: T.inkSoft, border: `1px solid ${T.rule}`, transition: 'all .18s' }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = T.inkMuted }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = T.rule }}>
              Bekijk de prijsankers
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}

function CoreRoutesSection() {
  const [sRef, sInView] = useInView(.06)
  return (
    <section style={{ background: T.paperSoft, padding: 'clamp(56px,7vw,88px) 0', borderBottom: `1px solid ${T.rule}`, position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', right: -20, top: '50%', transform: 'translateY(-50%)', fontFamily: FF, fontSize: 260, fontWeight: 400, color: T.rule, lineHeight: 1, pointerEvents: 'none', userSelect: 'none', opacity: .4 }}>02</div>
      <div ref={sRef} style={{ ...SHELL, position: 'relative' }}>
        <SectionMark num="02" label="Kernproducten" inView={sInView} />
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 lg:gap-0" style={{ borderBottom: `1px solid ${T.rule}` }}>
          {mainRoutes.map((route, i) => (
            <Reveal key={i} delay={.06 + i * .09}>
              <div style={{ padding: 'clamp(20px,3vw,40px)', paddingBottom: 36, borderLeft: i > 0 ? `1px solid ${T.rule}` : 'none', position: 'relative' }}>
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: route.accent }} />
                <div style={{ marginTop: 12, marginBottom: 20 }}>
                  <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: '.18em', textTransform: 'uppercase', padding: '3px 9px', background: route.accentFaint, color: route.accent }}>{route.chip}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 14 }}>
                  <span style={{ fontFamily: FF, fontSize: 11, color: T.inkFaint }}>{route.num}</span>
                  <span style={{ fontSize: 10, fontWeight: 600, letterSpacing: '.14em', textTransform: 'uppercase', color: route.accent }}>{route.tag}</span>
                </div>
                <div style={{ fontFamily: FF, fontSize: 'clamp(28px,3vw,36px)', fontWeight: 400, color: T.ink, letterSpacing: '-.02em', lineHeight: 1.1, marginBottom: 14 }}>{route.title}</div>
                <p style={{ fontSize: 13.5, lineHeight: 1.7, color: T.inkSoft, marginBottom: 20 }}>{route.desc}</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 24 }}>
                  {route.bullets.map((bullet, index) => (
                    <div key={index} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, color: T.inkSoft }}>
                      <div style={{ width: 4, height: 4, background: route.accent, flexShrink: 0 }} />
                      {bullet}
                    </div>
                  ))}
                </div>
                <Link href={route.href} style={{ fontSize: 13, fontWeight: 600, color: route.accent, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 6, borderBottom: '1px solid transparent', transition: 'border-color .2s' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderBottomColor = route.accent }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderBottomColor = 'transparent' }}>
                  Bekijk {route.title} <Arrow />
                </Link>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}

function FollowOnSection() {
  const [sRef, sInView] = useInView(.08)
  return (
    <section style={{ background: T.white, padding: 'clamp(52px,6vw,80px) 0', borderBottom: `1px solid ${T.rule}`, position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', left: -20, top: '50%', transform: 'translateY(-50%)', fontFamily: FF, fontSize: 260, fontWeight: 400, color: T.rule, lineHeight: 1, pointerEvents: 'none', userSelect: 'none', opacity: .4 }}>03</div>
      <div ref={sRef} style={{ ...SHELL, position: 'relative' }}>
        <SectionMark num="03" label="Bounded peer en vervolg" inView={sInView} />
        <Reveal delay={.05}>
          <h2 style={{ fontFamily: FF, fontSize: 'clamp(26px,3vw,38px)', fontWeight: 400, letterSpacing: '-.022em', color: T.ink, marginBottom: 14, lineHeight: 1.1 }}>
            Eerst een bounded peer, daarna pas kleiner vervolg.
          </h2>
          <p style={{ fontSize: 15, lineHeight: 1.7, color: T.inkSoft, marginBottom: 40, maxWidth: '52ch' }}>
            Onboarding 30-60-90 staat buyer-facing naast de kernroutes als bounded peer. Pulse en Leadership Scan blijven daarna bewust kleiner als vervolgroutes.
          </p>
        </Reveal>
        <Reveal delay={.08}>
          <div style={{ padding: '24px 26px', borderTop: `1px solid ${T.rule}`, borderBottom: `1px solid ${T.rule}`, background: T.paperSoft }}>
            <div style={{ fontSize: 9, fontWeight: 600, letterSpacing: '.16em', textTransform: 'uppercase', color: boundedPeerRoute.color, marginBottom: 8 }}>{boundedPeerRoute.label}</div>
            <div style={{ fontFamily: FF, fontSize: 22, fontWeight: 400, color: T.ink, marginBottom: 8 }}>{boundedPeerRoute.title}</div>
            <p style={{ fontSize: 13, lineHeight: 1.65, color: T.inkMuted, marginBottom: 14, maxWidth: '58ch' }}>{boundedPeerRoute.desc}</p>
            <Link href={boundedPeerRoute.href} style={{ fontSize: 12.5, fontWeight: 600, color: boundedPeerRoute.color, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 5 }}>
              Meer informatie <Arrow />
            </Link>
          </div>
        </Reveal>
        <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 0 }}>
          <div style={{ flex: 1, height: '1px', background: T.rule }} />
          <span style={{ fontSize: 10, fontWeight: 600, letterSpacing: '.16em', textTransform: 'uppercase', color: T.inkFaint, whiteSpace: 'nowrap', padding: '0 4px' }}>Vervolgroutes</span>
          <div style={{ flex: 1, height: '1px', background: T.rule }} />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2">
          {followOnRoutes.map((route, index) => (
            <Reveal key={index} delay={.08 + index * .07}>
              <div style={{ padding: '22px 26px', borderTop: `1px solid ${T.rule}`, borderRight: index % 2 === 0 ? `1px solid ${T.rule}` : 'none', transition: 'background .15s' }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = T.paperSoft }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent' }}>
                <div style={{ fontSize: 9, fontWeight: 600, letterSpacing: '.16em', textTransform: 'uppercase', color: T.inkFaint, marginBottom: 8 }}>{route.label}</div>
                <div style={{ fontFamily: FF, fontSize: 20, fontWeight: 400, color: T.ink, marginBottom: 8 }}>{route.title}</div>
                <p style={{ fontSize: 13, lineHeight: 1.62, color: T.inkMuted, marginBottom: 14 }}>{route.desc}</p>
                <Link href={route.href} style={{ fontSize: 12.5, fontWeight: 600, color: route.color, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                  Meer informatie <Arrow />
                </Link>
              </div>
            </Reveal>
          ))}
        </div>
        <div style={{ borderTop: `1px solid ${T.rule}`, borderBottom: `1px solid ${T.rule}`, padding: '20px 0', marginTop: 0 }}>
          <Reveal delay={.1}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 24, flexWrap: 'wrap' }}>
              <p style={{ fontSize: 13.5, color: T.inkSoft, lineHeight: 1.6 }}>
                Buyer-facing blijft Verisight draaien om twee kernproducten, een kleine portfolioroute en een scherp begrensde vervolglaag.
              </p>
              <Link href="/vertrouwen" style={{ fontSize: 13, fontWeight: 600, color: T.teal, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 5, flexShrink: 0 }}>
                Meer over trust en privacy <Arrow />
              </Link>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  )
}

function ContactSection() {
  return (
    <section id="kennismaking" style={{ background: T.paperSoft, padding: 'clamp(52px,6vw,80px) 0' }}>
      <div style={{ ...SHELL, maxWidth: 820 }}>
        <MarketingInlineContactPanel
          eyebrow="Plan kennismaking"
          title="Twijfelt u tussen ExitScan, RetentieScan, onboarding of een vervolgronde?"
          body="In een eerste gesprek bepalen we welke route nu echt logisch is, of onboarding een bounded peer blijft en welke vervolgstap bewust kleiner moet blijven."
          defaultRouteInterest="exitscan"
          defaultCtaSource="products_form"
        />
      </div>
    </section>
  )
}

export function ProductenContent() {
  return (
    <div style={{ background: T.paper, color: T.ink, overflowX: 'hidden' }}>
      <HeroSection />
      <CoreRoutesSection />
      <FollowOnSection />
      <ContactSection />
    </div>
  )
}

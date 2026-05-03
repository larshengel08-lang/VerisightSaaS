'use client'

import Link from 'next/link'
import { T, AC, FF, SHELL, useInView, Reveal, Arrow, SectionMark } from '@/components/marketing/design-tokens'
import { buildContactHref } from '@/lib/contact-funnel'

const corePricing = [
  {
    label: 'ExitScan baseline',
    price: 'EUR 2.950',
    accent: AC.deep,
    accentFaint: AC.faint,
    body: 'De standaard eerste instap voor terugkijkende vertrekduiding en een professioneel managementrapport over uitstroom.',
    bullets: [
      'Inrichting exit-campagne en respondentflow',
      'Dashboard en managementrapport',
      'Toelichting op de uitkomsten',
      'Bestuurlijke handoff inbegrepen',
    ],
    href: '/producten/exitscan',
  },
  {
    label: 'RetentieScan baseline',
    price: 'EUR 3.450',
    accent: T.teal,
    accentFaint: T.tealFaint,
    body: 'Gerichte baseline om behoudsdruk eerder zichtbaar te maken, met extra nadruk op privacy en groepsduiding.',
    bullets: [
      'Retentiesignaal, stay-intent en vertrekintentie',
      'Dashboard en managementrapport',
      'Gerichte managementduiding',
      'Geen individuele signalen naar management',
    ],
    href: '/producten/retentiescan',
  },
] as const

const followOnRows = [
  ['ExitScan ritmeroute', 'Op aanvraag', 'Logisch vervolg na eerste baseline wanneer proces, volume en eigenaarschap al staan.'],
  ['RetentieScan ritmeroute', 'Op aanvraag', 'Doorlopende vervolgvorm wanneer vroegsignalering structureel onderdeel van de managementcyclus wordt.'],
  ['Pulse', 'Op aanvraag', 'Compacte reviewlaag na een eerste kernroute of baseline, geen nieuwe eerste instap.'],
  ['Onboarding 30-60-90', 'Op aanvraag', 'Gerichte lifecycle-check wanneer vroege landing van nieuwe medewerkers centraal staat.'],
  ['Leadership Scan', 'Op aanvraag', 'Begrensde managementread nadat een bestaand people-signaal eerst duiding of verificatie vraagt.'],
] as const

// ── ① Hero ────────────────────────────────────────────────────────
function HeroSection() {
  return (
    <section style={{ background: T.white, padding: 'clamp(52px,6.5vw,80px) 0 clamp(48px,6vw,72px)', borderBottom: `1px solid ${T.rule}`, position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', backgroundImage: `linear-gradient(${T.rule}60 1px,transparent 1px),linear-gradient(90deg,${T.rule}60 1px,transparent 1px)`, backgroundSize: '72px 72px', opacity: .35 }} />
      <div style={{ position: 'absolute', top: -80, right: -60, width: 500, height: 500, background: `radial-gradient(circle,${AC.soft} 0%,transparent 65%)`, pointerEvents: 'none' }} />
      <div style={{ ...SHELL, position: 'relative' }}>
        <div style={{ animation: 'slideDownFade .55s cubic-bezier(.16,1,.3,1) .05s both' }}>
          <SectionMark num="——" label="Tarieven" inView />
        </div>
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1fr_360px] lg:gap-16 items-start">
          <div>
            <div style={{ animation: 'slideUpFade .9s cubic-bezier(.16,1,.3,1) .15s both' }}>
              <h1 style={{ fontFamily: FF, fontWeight: 400, fontSize: 'clamp(42px,5.5vw,76px)', lineHeight: .97, letterSpacing: '-.032em', color: T.ink }}>
                Transparante prijs.<br />
                <em className="shimmer-text" style={{ fontStyle: 'italic' }}>Heldere scope.</em>
              </h1>
            </div>
            <div style={{ animation: 'slideUpFade .8s cubic-bezier(.16,1,.3,1) .3s both' }}>
              <p style={{ fontSize: 16.5, lineHeight: 1.72, color: T.inkSoft, maxWidth: '46ch', margin: '28px 0 0' }}>
                U koopt een gerichte route met vaste output, geen licentie. ExitScan en RetentieScan vormen de twee kerninstappen.
              </p>
            </div>
          </div>
          <div style={{ animation: 'slideRightFade .8s cubic-bezier(.16,1,.3,1) .28s both' }}>
            <div style={{ display: 'grid', gap: 10 }}>
              {corePricing.map((item, i) => (
                <div key={i} style={{ padding: '18px 20px', background: T.paperSoft, border: `1px solid ${T.rule}` }}>
                  <div style={{ fontSize: 9.5, fontWeight: 600, letterSpacing: '.12em', textTransform: 'uppercase', color: item.accent, marginBottom: 6 }}>{item.label}</div>
                  <div style={{ fontFamily: FF, fontSize: 28, fontWeight: 400, color: T.ink, letterSpacing: '-.02em' }}>{item.price}</div>
                </div>
              ))}
            </div>
            <div style={{ marginTop: 14, fontSize: 11, color: T.inkMuted, fontStyle: 'italic' }}>Per traject, geen licenties. Vervolgroutes bewust kleiner.</div>
          </div>
        </div>
      </div>
    </section>
  )
}

// ── ② Core products ────────────────────────────────────────────────
function CorePricingSection() {
  const [sRef, sInView] = useInView(.08)
  return (
    <section style={{ background: T.white, padding: 'clamp(56px,7vw,88px) 0', borderBottom: `1px solid ${T.rule}`, position: 'relative', overflow: 'hidden' }}>
      <div ref={sRef} style={{ ...SHELL, position: 'relative' }}>
        <SectionMark num="02" label="Kernproducten" inView={sInView} />
        <Reveal delay={.05}>
          <h2 style={{ fontFamily: FF, fontSize: 'clamp(28px,3.5vw,42px)', fontWeight: 400, letterSpacing: '-.026em', color: T.ink, marginBottom: 14, lineHeight: 1.06 }}>
            De eerste koop blijft helder.
          </h2>
          <p style={{ fontSize: 15, lineHeight: 1.7, color: T.inkSoft, marginBottom: 44, maxWidth: '50ch' }}>
            ExitScan en RetentieScan zijn de twee buyer-facing kernproducten. De prijsopbouw is bedoeld om de eerste route duidelijk te houden.
          </p>
        </Reveal>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {corePricing.map((item, i) => (
            <Reveal key={i} delay={.08 + i * .1}>
              <div style={{ background: T.white, border: `1px solid ${T.rule}`, padding: '36px', boxShadow: `0 2px 8px rgba(0,0,0,.04), 0 0 0 1px ${item.accentFaint}`, position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: item.accent }} />
                <div style={{ fontSize: 9.5, fontWeight: 600, letterSpacing: '.16em', textTransform: 'uppercase', color: item.accent, marginBottom: 12 }}>{item.label}</div>
                <div style={{ fontFamily: FF, fontSize: 'clamp(2rem,4vw,3rem)', fontWeight: 400, letterSpacing: '-.03em', color: T.ink, marginBottom: 14, lineHeight: 1 }}>{item.price}</div>
                <p style={{ fontSize: 13.5, lineHeight: 1.7, color: T.inkSoft, marginBottom: 24 }}>{item.body}</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 24 }}>
                  {item.bullets.map((b, j) => (
                    <div key={j} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, fontSize: 13, color: T.inkSoft, padding: '10px 14px', background: T.paperSoft }}>
                      <div style={{ width: 4, height: 4, background: item.accent, flexShrink: 0, marginTop: 5 }} />
                      {b}
                    </div>
                  ))}
                </div>
                <Link href={item.href} style={{ fontSize: 13, fontWeight: 600, color: item.accent, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 6, borderBottom: `1px solid transparent`, transition: 'border-color .2s' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderBottomColor = item.accent }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderBottomColor = 'transparent' }}>
                  Meer over deze route <Arrow />
                </Link>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}

// ── ③ Follow-on table ──────────────────────────────────────────────
function FollowOnSection() {
  const [sRef, sInView] = useInView(.08)
  return (
    <section style={{ background: T.white, padding: 'clamp(52px,6vw,80px) 0', borderBottom: `1px solid ${T.rule}`, position: 'relative', overflow: 'hidden' }}>
      <div ref={sRef} style={{ ...SHELL, position: 'relative' }}>
        <SectionMark num="03" label="Vervolg en add-ons" inView={sInView} />
        <Reveal delay={.05}>
          <h2 style={{ fontFamily: FF, fontSize: 'clamp(26px,3vw,38px)', fontWeight: 400, letterSpacing: '-.022em', color: T.ink, marginBottom: 14, lineHeight: 1.1 }}>
            Kleinere routes na de eerste kernroute.
          </h2>
          <p style={{ fontSize: 15, lineHeight: 1.7, color: T.inkSoft, marginBottom: 40, maxWidth: '52ch' }}>
            De vervolglaag blijft bewust bounded. Vervolgprijzen blijven logisch in verhouding tot de eerste managementvraag.
          </p>
        </Reveal>
        <Reveal delay={.1}>
          <div style={{ border: `1px solid ${T.rule}`, overflow: 'hidden' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '220px 120px 1fr', background: T.paperSoft, borderBottom: `1px solid ${T.rule}` }}>
              {['Route', 'Prijsanker', 'Wanneer logisch'].map((h, i) => (
                <div key={i} style={{ padding: '12px 18px', fontSize: 10, fontWeight: 600, letterSpacing: '.14em', textTransform: 'uppercase', color: T.inkMuted }}>{h}</div>
              ))}
            </div>
            {followOnRows.map(([route, price, when], i) => (
              <div key={i} style={{ display: 'grid', gridTemplateColumns: '220px 120px 1fr', borderTop: i > 0 ? `1px solid ${T.ruleLight}` : 'none', transition: 'background .15s' }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = AC.faint }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent' }}>
                <div style={{ padding: '14px 18px', fontSize: 13.5, fontWeight: 600, color: T.ink }}>{route}</div>
                <div style={{ padding: '14px 18px', fontSize: 13, color: T.inkMuted, fontVariantNumeric: 'tabular-nums' }}>{price}</div>
                <div style={{ padding: '14px 18px', fontSize: 13, color: T.inkSoft, lineHeight: 1.6 }}>{when}</div>
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  )
}

// ── ④ CTA ─────────────────────────────────────────────────────────
function CtaBand() {
  const ctaHref = buildContactHref({ routeInterest: 'exitscan', ctaSource: 'pricing_closing_cta' })
  return (
    <section style={{ background: T.white, padding: 'clamp(48px,5vw,72px) 0', borderBottom: `1px solid ${T.rule}` }}>
      <div style={{ ...SHELL }}>
        <Reveal delay={.05}>
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_auto] items-center">
            <div>
              <div style={{ fontSize: 9.5, fontWeight: 600, letterSpacing: '.16em', textTransform: 'uppercase', color: T.inkMuted, marginBottom: 12 }}>Prijs in context</div>
              <h2 style={{ fontFamily: FF, fontSize: 'clamp(22px,2.8vw,32px)', fontWeight: 400, letterSpacing: '-.02em', color: T.ink, lineHeight: 1.15, marginBottom: 12 }}>
                Twijfelt u welke eerste route commercieel en inhoudelijk het best past?
              </h2>
              <p style={{ fontSize: 14, lineHeight: 1.7, color: T.inkSoft, maxWidth: '52ch' }}>
                Gebruik het kennismakingsgesprek om eerst de kernroute, timing en privacygrenzen logisch te bepalen. Zo blijft de offerte kleiner, helderder en beter verdedigbaar.
              </p>
            </div>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <Link href={ctaHref} style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 7, fontSize: 14, fontWeight: 600, padding: '12px 26px', color: '#fff', background: T.ink, transition: 'all .18s' }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = AC.deep }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = T.ink }}>
                Plan een kennismaking <Arrow />
              </Link>
              <Link href="/aanpak" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 7, fontSize: 14, fontWeight: 500, padding: '11px 24px', color: T.inkSoft, border: `1px solid ${T.rule}`, transition: 'all .18s' }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = T.inkMuted }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = T.rule }}>
                Bekijk de aanpak
              </Link>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  )
}

// ── ⑤ Contact ─────────────────────────────────────────────────────
export function TarievenContent() {
  return (
    <div style={{ background: T.white, color: T.ink, overflowX: 'hidden' }}>
      <HeroSection />
      <CorePricingSection />
      <FollowOnSection />
      <CtaBand />
    </div>
  )
}

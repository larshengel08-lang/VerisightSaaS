'use client'

import Link from 'next/link'
import { T, FF, SHELL, useInView, Reveal, Arrow, SectionMark } from '@/components/marketing/design-tokens'
import { MarketingInlineContactPanel } from '@/components/marketing/marketing-inline-contact-panel'
import {
  trustItems,
  trustSignalHighlights,
  trustVerificationCards,
  trustHubAnswerCards,
  trustSupportCards,
} from '@/components/marketing/site-content'

// ── ① Hero ────────────────────────────────────────────────────────
function HeroSection() {
  return (
    <section style={{ background: T.white, padding: 'clamp(52px,6.5vw,80px) 0 clamp(48px,6vw,72px)', borderBottom: `1px solid ${T.rule}`, position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', backgroundImage: `linear-gradient(${T.rule}60 1px,transparent 1px),linear-gradient(90deg,${T.rule}60 1px,transparent 1px)`, backgroundSize: '72px 72px', opacity: .35 }} />
      <div style={{ position: 'absolute', top: -80, right: -60, width: 500, height: 500, background: `radial-gradient(circle,${T.tealFaint} 0%,transparent 65%)`, pointerEvents: 'none' }} />
      <div style={{ ...SHELL, position: 'relative' }}>
        <div style={{ animation: 'slideDownFade .55s cubic-bezier(.16,1,.3,1) .05s both' }}>
          <SectionMark num="——" label="Vertrouwen" inView />
        </div>
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1fr_360px] lg:gap-16 items-start">
          <div>
            <div style={{ animation: 'slideUpFade .9s cubic-bezier(.16,1,.3,1) .15s both' }}>
              <h1 style={{ fontFamily: FF, fontWeight: 400, fontSize: 'clamp(42px,5.5vw,76px)', lineHeight: .97, letterSpacing: '-.032em', color: T.ink }}>
                Methodiek, privacy<br />
                <em style={{ fontStyle: 'italic', color: T.teal }}>en suitegrenzen.</em>
              </h1>
            </div>
            <div style={{ animation: 'slideUpFade .8s cubic-bezier(.16,1,.3,1) .3s both' }}>
              <p style={{ fontSize: 16.5, lineHeight: 1.72, color: T.inkSoft, maxWidth: '46ch', margin: '28px 0 0' }}>
                Verisight laat publiek zien hoe methodiek, privacy, dashboard, rapport en Action Center samenhangen — en waar die suite-output bewust begrensd blijft voordat een traject start.
              </p>
            </div>
          </div>
          <div style={{ animation: 'slideRightFade .8s cubic-bezier(.16,1,.3,1) .28s both' }}>
            <div style={{ padding: '28px', background: T.tealFaint, border: `1px solid ${T.tealSoft}` }}>
              <div style={{ fontSize: 9.5, fontWeight: 600, letterSpacing: '.14em', textTransform: 'uppercase', color: T.teal, marginBottom: 16 }}>Heldere grenzen</div>
              {trustItems.slice(0, 4).map((item, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '10px 0', borderTop: i > 0 ? `1px solid ${T.tealSoft}` : 'none', fontSize: 13, color: T.inkSoft, lineHeight: 1.5 }}>
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

// ── ② Trust signals ────────────────────────────────────────────────
function TrustSignalsSection() {
  const [sRef, sInView] = useInView(.08)
  return (
    <section style={{ background: T.paperSoft, padding: 'clamp(56px,7vw,88px) 0', borderBottom: `1px solid ${T.rule}`, position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', right: -20, top: '50%', transform: 'translateY(-50%)', fontFamily: FF, fontSize: 260, fontWeight: 400, color: T.rule, lineHeight: 1, pointerEvents: 'none', userSelect: 'none', opacity: .4 }}>02</div>
      <div ref={sRef} style={{ ...SHELL, position: 'relative' }}>
        <SectionMark num="02" label="Waar vertrouwen vandaan komt" inView={sInView} />
        <Reveal delay={.05}>
          <h2 style={{ fontFamily: FF, fontSize: 'clamp(28px,3.5vw,42px)', fontWeight: 400, letterSpacing: '-.026em', color: T.ink, marginBottom: 14, lineHeight: 1.06 }}>
            De trustlaag moet hetzelfde vertellen<br />
            <em style={{ fontStyle: 'italic', color: T.teal }}>als het product werkelijk levert.</em>
          </h2>
          <p style={{ fontSize: 15, lineHeight: 1.7, color: T.inkSoft, marginBottom: 44, maxWidth: '50ch' }}>
            Deze pagina maakt expliciet wat Verisight wel en niet claimt, hoe privacy is ingebouwd en hoe management dashboard, rapport en Action Center in dezelfde bounded leeslijn moet lezen.
          </p>
        </Reveal>
        <div className="grid grid-cols-1 gap-0 md:grid-cols-2 xl:grid-cols-3">
          {trustSignalHighlights.map((item, i) => (
            <Reveal key={i} delay={.06 + i * .07}>
              <div style={{ padding: '28px', borderTop: `1px solid ${T.rule}`, borderLeft: i % 3 > 0 ? `1px solid ${T.rule}` : 'none' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                  <div style={{ width: 5, height: 5, borderRadius: '50%', background: T.tealMid, flexShrink: 0 }} />
                  <div style={{ fontSize: 13.5, fontWeight: 600, color: T.ink }}>{item.title}</div>
                </div>
                <p style={{ fontSize: 13, lineHeight: 1.65, color: T.inkSoft }}>{item.body}</p>
              </div>
            </Reveal>
          ))}
        </div>
        <div style={{ borderTop: `1px solid ${T.rule}` }} />
      </div>
    </section>
  )
}

// ── ③ Verification + Methodology ──────────────────────────────────
function VerificationSection() {
  const [sRef, sInView] = useInView(.08)
  return (
    <section style={{ background: T.white, padding: 'clamp(52px,6vw,80px) 0', borderBottom: `1px solid ${T.rule}`, position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', left: -20, top: '50%', transform: 'translateY(-50%)', fontFamily: FF, fontSize: 260, fontWeight: 400, color: T.rule, lineHeight: 1, pointerEvents: 'none', userSelect: 'none', opacity: .4 }}>03</div>
      <div ref={sRef} style={{ ...SHELL, position: 'relative' }}>
        <SectionMark num="03" label="Wat u publiek kunt verifiëren" inView={sInView} />
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-2 lg:gap-12 items-start">
          <div>
            {trustVerificationCards.map((card, i) => (
              <Reveal key={i} delay={.08 + i * .09}>
                <div style={{ display: 'flex', gap: 18, padding: '22px 0', borderTop: `1px solid ${T.rule}` }}>
                  <span style={{ fontFamily: FF, fontSize: 12, color: T.inkFaint, fontWeight: 400, minWidth: 24, paddingTop: 2, flexShrink: 0 }}>{`0${i + 1}`}</span>
                  <div>
                    <div style={{ fontSize: 13.5, fontWeight: 600, color: T.ink, marginBottom: 6 }}>{card.title}</div>
                    <p style={{ fontSize: 13, color: T.inkSoft, lineHeight: 1.65 }}>{card.body}</p>
                  </div>
                </div>
              </Reveal>
            ))}
            <div style={{ borderTop: `1px solid ${T.rule}` }} />
          </div>
          <Reveal delay={.12} from="right">
            <div style={{ background: T.navy, padding: '36px', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: -60, right: -60, width: 280, height: 280, background: `radial-gradient(circle,${T.teal}22 0%,transparent 65%)`, pointerEvents: 'none' }} />
              <div style={{ fontSize: 9.5, fontWeight: 600, letterSpacing: '.16em', textTransform: 'uppercase', color: T.teal, marginBottom: 20 }}>Methodiek en vertrouwen</div>
              <h3 style={{ fontFamily: FF, fontSize: 'clamp(20px,2.5vw,28px)', fontWeight: 400, color: '#fff', lineHeight: 1.15, marginBottom: 16, letterSpacing: '-.018em' }}>
                Bruikbare inzichten,<br />
                <em style={{ fontStyle: 'italic', fontWeight: 300, color: 'oklch(.62 .10 185)' }}>zonder schijnzekerheid.</em>
              </h3>
              <p style={{ fontSize: 13, lineHeight: 1.7, color: 'rgba(247,245,241,.65)', marginBottom: 24 }}>
                Verisight werkt met geaggregeerde uitkomsten en benoemt bewust wat wel en niet geconcludeerd kan worden, ook wanneer follow-through via Action Center wordt toegevoegd.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {trustItems.map((item, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '10px 14px', background: 'rgba(255,255,255,.05)', fontSize: 12.5, color: 'rgba(247,245,241,.8)', lineHeight: 1.5 }}>
                    <div style={{ width: 4, height: 4, background: T.teal, flexShrink: 0, marginTop: 5 }} />
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

// ── ④ Reading guide ────────────────────────────────────────────────
function ReadingGuideSection() {
  const [sRef, sInView] = useInView(.08)
  const rows = [
    ['Intended use', 'Managementduiding, prioritering en gesprek op groepsniveau', 'Niet als diagnose, individuele voorspelling of performance-oordeel'],
    ['Wat management ziet', 'Dashboard, bestuurlijke read, handoff, topfactoren, hypotheses en vervolgstappen', 'Niet elk signaal heeft dezelfde betrouwbaarheid of causaliteitswaarde'],
    ['Privacygrens', 'Minimale n-grenzen, segmentonderdrukking en geanonimiseerde open tekst', 'Niet doen alsof kleine groepen of open tekst zonder terughoudendheid veilig te lezen zijn'],
    ['Bewijsstatus', 'Methodisch onderbouwd, intern consistent en testmatig beschermd', 'Niet verkopen als extern gevalideerd diagnostisch instrument of bewezen predictor'],
  ] as const
  return (
    <section style={{ background: T.paperSoft, padding: 'clamp(52px,6vw,80px) 0', borderBottom: `1px solid ${T.rule}`, position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', right: -20, top: '50%', transform: 'translateY(-50%)', fontFamily: FF, fontSize: 260, fontWeight: 400, color: T.rule, lineHeight: 1, pointerEvents: 'none', userSelect: 'none', opacity: .4 }}>04</div>
      <div ref={sRef} style={{ ...SHELL, position: 'relative' }}>
        <SectionMark num="04" label="Hoe u de output leest" inView={sInView} />
        <Reveal delay={.05}>
          <h2 style={{ fontFamily: FF, fontSize: 'clamp(26px,3vw,38px)', fontWeight: 400, letterSpacing: '-.022em', color: T.ink, marginBottom: 14, lineHeight: 1.1 }}>
            Gebruik Verisight als gespreksinput,<br />
            <em style={{ fontStyle: 'italic', color: T.teal }}>niet als diagnose.</em>
          </h2>
          <p style={{ fontSize: 15, lineHeight: 1.7, color: T.inkSoft, marginBottom: 36, maxWidth: '50ch' }}>
            De publieke reading guide moet dezelfde interpretatiegrenzen laten zien als dashboard, rapport en Action Center.
          </p>
        </Reveal>
        <Reveal delay={.1}>
          <div style={{ border: `1px solid ${T.rule}`, overflow: 'hidden' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '160px 1fr 1fr', background: T.paperSoft, borderBottom: `1px solid ${T.rule}` }}>
              {['Thema', 'Wat u wel ziet', 'Wat u er niet van moet maken'].map((h, i) => (
                <div key={i} style={{ padding: '12px 18px', fontSize: 10, fontWeight: 600, letterSpacing: '.14em', textTransform: 'uppercase', color: T.inkMuted }}>{h}</div>
              ))}
            </div>
            {rows.map(([theme, yes, no], i) => (
              <div key={i} style={{ display: 'grid', gridTemplateColumns: '160px 1fr 1fr', borderTop: i > 0 ? `1px solid ${T.ruleLight}` : 'none', transition: 'background .15s' }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = T.tealFaint }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent' }}>
                <div style={{ padding: '14px 18px', fontSize: 13, fontWeight: 600, color: T.ink }}>{theme}</div>
                <div style={{ padding: '14px 18px', fontSize: 13, color: T.inkSoft, lineHeight: 1.6 }}>{yes}</div>
                <div style={{ padding: '14px 18px', fontSize: 13, color: T.inkMuted, lineHeight: 1.6, fontStyle: 'italic' }}>{no}</div>
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  )
}

// ── ⑤ Privacy answers ─────────────────────────────────────────────
function PrivacySection() {
  const [sRef, sInView] = useInView(.08)
  return (
    <section style={{ background: T.white, padding: 'clamp(52px,6vw,80px) 0', borderBottom: `1px solid ${T.rule}`, position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', left: -20, top: '50%', transform: 'translateY(-50%)', fontFamily: FF, fontSize: 260, fontWeight: 400, color: T.rule, lineHeight: 1, pointerEvents: 'none', userSelect: 'none', opacity: .4 }}>05</div>
      <div ref={sRef} style={{ ...SHELL, position: 'relative' }}>
        <SectionMark num="05" label="Privacy en due diligence" inView={sInView} />
        <Reveal delay={.05}>
          <h2 style={{ fontFamily: FF, fontSize: 'clamp(26px,3vw,38px)', fontWeight: 400, letterSpacing: '-.022em', color: T.ink, marginBottom: 14, lineHeight: 1.1 }}>
            Snelle antwoorden op<br />
            <em style={{ fontStyle: 'italic', color: T.teal }}>voorspelbare vragen.</em>
          </h2>
          <p style={{ fontSize: 15, lineHeight: 1.7, color: T.inkSoft, marginBottom: 40, maxWidth: '50ch' }}>
            Zo kan een buyer de basis toetsen voordat er een gesprek plaatsvindt.
          </p>
        </Reveal>
        <div className="grid grid-cols-1 gap-0 md:grid-cols-2 xl:grid-cols-3">
          {trustHubAnswerCards.map((card, i) => (
            <Reveal key={i} delay={.06 + i * .06}>
              <div style={{ padding: '24px 28px', borderTop: `1px solid ${T.rule}`, borderLeft: i % 3 > 0 ? `1px solid ${T.rule}` : 'none' }}>
                <div style={{ fontSize: 13.5, fontWeight: 600, color: T.ink, marginBottom: 8 }}>{card.title}</div>
                <p style={{ fontSize: 13, lineHeight: 1.65, color: T.inkSoft }}>{card.body}</p>
              </div>
            </Reveal>
          ))}
        </div>
        <div style={{ borderTop: `1px solid ${T.rule}`, marginTop: 0 }} />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4" style={{ marginTop: 24 }}>
          {trustSupportCards.map((card, i) => (
            <Reveal key={i} delay={.08 + i * .06}>
              <Link href={card.href} style={{ textDecoration: 'none', display: 'block', padding: '20px 24px', border: `1px solid ${T.rule}`, background: T.paperSoft, transition: 'all .18s' }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = T.teal; (e.currentTarget as HTMLElement).style.background = T.tealFaint }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = T.rule; (e.currentTarget as HTMLElement).style.background = T.paperSoft }}>
                <div style={{ fontSize: 13.5, fontWeight: 600, color: T.ink, marginBottom: 6 }}>{card.title}</div>
                <p style={{ fontSize: 12.5, lineHeight: 1.62, color: T.inkSoft, marginBottom: 12 }}>{card.body}</p>
                <span style={{ fontSize: 12, fontWeight: 600, color: T.teal, display: 'inline-flex', alignItems: 'center', gap: 5 }}>Bekijken <Arrow /></span>
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}

// ── ⑥ Contact ─────────────────────────────────────────────────────
function ContactSection() {
  return (
    <section id="kennismaking" style={{ background: T.paperSoft, padding: 'clamp(52px,6vw,80px) 0' }}>
      <div style={{ ...SHELL, maxWidth: 1180 }}>
        <MarketingInlineContactPanel
          eyebrow="Plan een eerste route-inschatting"
          title="Vertel kort welke managementvraag nu speelt."
          body="In circa 20 minuten krijgt u helderheid over productkeuze, aanpak, timing, privacy, prijs en hoe dashboard, rapport en Action Center bounded samenhangen."
          defaultRouteInterest="exitscan"
          defaultCtaSource="trust_form"
        />
      </div>
    </section>
  )
}

export function VertrouwenContent() {
  return (
    <div style={{ background: T.paper, color: T.ink, overflowX: 'hidden' }}>
      <HeroSection />
      <TrustSignalsSection />
      <VerificationSection />
      <ReadingGuideSection />
      <PrivacySection />
      <ContactSection />
    </div>
  )
}

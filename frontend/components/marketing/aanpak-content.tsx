'use client'

import Link from 'next/link'
import { T, AC, FF, SHELL, Arrow, Reveal, SectionMark } from '@/components/marketing/design-tokens'
import { MarketingInlineContactPanel } from '@/components/marketing/marketing-inline-contact-panel'
import { buildContactHref } from '@/lib/contact-funnel'
import { approachSteps, included } from '@/components/marketing/site-content'

// ── ① Hero ────────────────────────────────────────────────────────
function HeroSection() {
  const ctaHref = buildContactHref({ routeInterest: 'exitscan', ctaSource: 'approach_hero_primary' })
  return (
    <section style={{ background: T.white, padding: 'clamp(52px,6.5vw,80px) 0 clamp(48px,6vw,72px)', borderBottom: `1px solid ${T.rule}`, position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', backgroundImage: `linear-gradient(${T.rule}60 1px,transparent 1px),linear-gradient(90deg,${T.rule}60 1px,transparent 1px)`, backgroundSize: '72px 72px', opacity: .35 }} />
      <div style={{ position: 'absolute', top: -80, right: -60, width: 500, height: 500, background: `radial-gradient(circle,${AC.soft} 0%,transparent 65%)`, pointerEvents: 'none' }} />
      <div style={{ ...SHELL, position: 'relative' }}>
        <SectionMark num="--" label="Aanpak" inView />
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1fr_380px] lg:gap-20 items-start">
          <div>
            <h1 style={{ fontFamily: FF, fontWeight: 400, fontSize: 'clamp(42px,5.5vw,76px)', lineHeight: .97, letterSpacing: '-.032em', color: T.ink, marginBottom: 0 }}>
              Van eerste contact<br />
              <em className="shimmer-text" style={{ fontStyle: 'italic' }}>tot managementinzicht.</em>
            </h1>
            <p style={{ fontSize: 16.5, lineHeight: 1.72, color: T.inkSoft, maxWidth: '46ch', margin: '28px 0 36px' }}>
              Verisight begeleidt het traject van intake en uitvoering naar dashboard, rapport, bestuurlijke handoff en
              een eerste Action Center-opvolgafspraak, zonder losse eindes.
            </p>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <Link href={ctaHref} style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 7, fontSize: 14.5, fontWeight: 600, padding: '12px 28px', color: '#fff', background: T.ink, transition: 'all .18s cubic-bezier(.4,0,0,1)' }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)'; (e.currentTarget as HTMLElement).style.background = AC.deep }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = 'none'; (e.currentTarget as HTMLElement).style.background = T.ink }}>
              Plan een eerste route-inschatting <Arrow />
              </Link>
              <Link href="/tarieven" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 7, fontSize: 14.5, fontWeight: 500, padding: '11px 27px', color: T.inkSoft, border: `1px solid ${T.rule}`, transition: 'all .18s' }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = T.inkMuted; (e.currentTarget as HTMLElement).style.color = T.ink }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = T.rule; (e.currentTarget as HTMLElement).style.color = T.inkSoft }}>
                Bekijk tarieven
              </Link>
            </div>
          </div>
          <div>
            <div style={{ padding: '28px', background: T.paperSoft, border: `1px solid ${T.rule}` }}>
              <div style={{ fontSize: 9.5, fontWeight: 600, letterSpacing: '.16em', textTransform: 'uppercase', color: T.inkMuted, marginBottom: 18 }}>Begeleide productvorm</div>
              {[
                { week: 'Week 1', label: 'Routekeuze, intake en setup' },
                { week: 'Week 2', label: 'Uitnodiging, responses en opbouw' },
                { week: 'Week 3', label: 'Dashboard, rapport en eerste read' },
              ].map((item, i) => (
                <div key={i} style={{ padding: '14px 0', borderBottom: i < 2 ? `1px solid ${T.rule}` : 'none', display: 'flex', gap: 16, alignItems: 'baseline' }}>
                  <span style={{ fontFamily: FF, fontSize: 11, color: T.inkFaint, minWidth: 52 }}>{item.week}</span>
                  <span style={{ fontSize: 13.5, fontWeight: 600, color: T.ink }}>{item.label}</span>
                </div>
              ))}
              <div style={{ marginTop: 18, fontSize: 11.5, color: T.inkMuted, fontStyle: 'italic' }}>Gemiddeld 3 weken van eerste gesprek tot eerste read.</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

// ── ② Process steps ────────────────────────────────────────────────
function ProcessSection() {
  return (
    <section style={{ background: T.paperSoft, padding: 'clamp(56px,7vw,88px) 0', borderBottom: `1px solid ${T.rule}`, position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', right: -20, top: '50%', transform: 'translateY(-50%)', fontFamily: FF, fontSize: 260, fontWeight: 400, color: T.rule, lineHeight: 1, pointerEvents: 'none', userSelect: 'none', opacity: .4 }}>02</div>
      <div style={{ ...SHELL, position: 'relative' }}>
        <SectionMark num="02" label="Procesroute" inView />
        <Reveal delay={.05}>
          <h2 style={{ fontFamily: FF, fontSize: 'clamp(28px,3.5vw,42px)', fontWeight: 400, letterSpacing: '-.026em', color: T.ink, marginBottom: 14, lineHeight: 1.06 }}>
            Hoe een traject verloopt.
          </h2>
          <p style={{ fontSize: 15, lineHeight: 1.7, color: T.inkSoft, marginBottom: 44, maxWidth: '48ch' }}>
            Van eerste gesprek naar een bruikbare eerste managementsamenvatting, in een ritme dat snel genoeg is voor vaart en rustig genoeg voor goede besluitvorming.
          </p>
        </Reveal>
        <div className="grid grid-cols-1 gap-0 md:grid-cols-2 xl:grid-cols-3">
          {approachSteps.map((step, i) => (
            <Reveal key={i} delay={.06 + i * .07}>
              <div style={{
                padding: '28px 28px', borderTop: `1px solid ${T.rule}`,
                borderLeft: i % 3 > 0 ? `1px solid ${T.rule}` : 'none',
                background: i === 0 ? AC.faint : 'transparent',
              }}>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 16 }}>
                  <span style={{ fontFamily: FF, fontSize: 13, color: i === 0 ? AC.deep : T.inkFaint, fontWeight: 400 }}>{`0${i + 1}`}</span>
                  <span style={{ width: 28, height: '1px', background: i === 0 ? AC.mid : T.rule, flexShrink: 0 }} />
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

// ── ③ Roles ────────────────────────────────────────────────────────
function RolesSection() {
  return (
    <section style={{ background: T.white, padding: 'clamp(52px,6vw,80px) 0', borderBottom: `1px solid ${T.rule}`, position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', left: -20, top: '50%', transform: 'translateY(-50%)', fontFamily: FF, fontSize: 260, fontWeight: 400, color: T.rule, lineHeight: 1, pointerEvents: 'none', userSelect: 'none', opacity: .4 }}>03</div>
      <div style={{ ...SHELL, position: 'relative' }}>
        <SectionMark num="03" label="Wat u zelf doet" inView />
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:gap-16 items-start">
          <div>
            <Reveal delay={.05}>
              <h2 style={{ fontFamily: FF, fontSize: 'clamp(26px,3vw,38px)', fontWeight: 400, letterSpacing: '-.022em', color: T.ink, lineHeight: 1.1, marginBottom: 18 }}>
                Uw rol is beperkt.<br />
                <em className="shimmer-text" style={{ fontStyle: 'italic' }}>Verisight regelt de uitvoering.</em>
              </h2>
              <p style={{ fontSize: 14, lineHeight: 1.72, color: T.inkSoft, marginBottom: 28 }}>
                U bevestigt route en timing, levert het respondentbestand aan en ontvangt dashboard, rapport, toelichting
                en de eerste bounded opvolglaag in Action Center.
              </p>
            </Reveal>
            <div>
              {[
                { title: 'Route bevestigen', body: 'U bevestigt scan, variant, timing, doelgroep en contactpersoon na akkoord.' },
                { title: 'Respondentbestand aanleveren', body: 'U levert het bestand aan; Verisight controleert de import en zet uitnodigingen klaar.' },
                { title: 'Dashboard en rapport ontvangen', body: 'U ontvangt dashboard, managementrapport en toelichting in dezelfde leeslijn.' },
              ].map((item, i) => (
                <Reveal key={i} delay={.1 + i * .08}>
                  <div style={{ display: 'flex', gap: 18, padding: '20px 0', borderTop: `1px solid ${T.rule}` }}>
                    <span style={{ fontFamily: FF, fontSize: 12, color: T.inkFaint, fontWeight: 400, minWidth: 24, paddingTop: 2, flexShrink: 0 }}>{`0${i + 1}`}</span>
                    <div>
                      <div style={{ fontSize: 13.5, fontWeight: 600, color: T.ink, marginBottom: 5 }}>{item.title}</div>
                      <p style={{ fontSize: 13, color: T.inkSoft, lineHeight: 1.62 }}>{item.body}</p>
                    </div>
                  </div>
                </Reveal>
              ))}
              <div style={{ borderTop: `1px solid ${T.rule}` }} />
            </div>
          </div>
          <Reveal delay={.12} from="right">
            <div style={{ background: T.paperSoft, border: `1px solid ${T.rule}`, padding: '32px', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: -40, right: -40, width: 200, height: 200, background: `radial-gradient(circle,${AC.soft} 0%,transparent 65%)`, pointerEvents: 'none' }} />
              <div style={{ fontSize: 9.5, fontWeight: 600, letterSpacing: '.16em', textTransform: 'uppercase', color: T.inkMuted, marginBottom: 22 }}>Altijd inbegrepen</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {included.map((item, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, fontSize: 13, color: T.inkSoft, lineHeight: 1.5 }}>
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

// ── ④ First value ──────────────────────────────────────────────────
function FirstValueSection() {
  const items = [
    { threshold: 'Eerste responses', text: 'De campagne is zichtbaar op gang, maar we trekken nog geen grote conclusies.' },
    { threshold: '≥ 5 responses', text: 'De eerste bruikbare weergave wordt zichtbaar in dashboard en rapport.' },
    { threshold: '≥ 10 responses', text: 'Het patroon wordt stevig genoeg om prioriteiten te kiezen en een eerste managementrichting te bepalen.' },
  ]
  return (
    <section style={{ background: T.paperBlush, padding: 'clamp(52px,6vw,80px) 0', borderBottom: `1px solid ${T.rule}`, position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', right: -20, top: '50%', transform: 'translateY(-50%)', fontFamily: FF, fontSize: 260, fontWeight: 400, color: T.rule, lineHeight: 1, pointerEvents: 'none', userSelect: 'none', opacity: .35 }}>04</div>
      <div style={{ ...SHELL, position: 'relative' }}>
        <SectionMark num="04" label="Eerste waarde" inView />
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-[280px_1fr] lg:gap-20 items-start">
          <Reveal delay={.05}>
            <div>
              <h2 style={{ fontFamily: FF, fontSize: 'clamp(24px,2.8vw,34px)', fontWeight: 400, letterSpacing: '-.022em', color: T.ink, lineHeight: 1.15, marginBottom: 16 }}>
                Tempo met<br />
                <em className="shimmer-text" style={{ fontStyle: 'italic' }}>grenzen.</em>
              </h2>
              <p style={{ fontSize: 13.5, lineHeight: 1.7, color: T.inkSoft }}>
                De eerste waarde komt snel, maar nooit sneller dan de responsbasis toelaat. Het traject stopt niet bij een rapport, maar bij een eerste concreet vervolggesprek.
              </p>
            </div>
          </Reveal>
          <div>
            {items.map((item, i) => (
              <Reveal key={i} delay={.1 + i * .09}>
                <div style={{ display: 'flex', gap: 20, padding: '22px 0', borderTop: `1px solid ${T.rule}`, alignItems: 'flex-start' }}>
                  <div style={{ minWidth: 100, flexShrink: 0 }}>
                    <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.06em', padding: '4px 10px', background: i === 2 ? AC.faint : T.paperSoft, color: i === 2 ? AC.deep : T.inkMuted, border: `1px solid ${i === 2 ? AC.soft : T.rule}`, display: 'inline-block' }}>{item.threshold}</span>
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

// ── ⑤ Contact ─────────────────────────────────────────────────────
function ContactSection() {
  return (
    <section id="kennismaking" style={{ background: T.paperSoft, padding: 'clamp(52px,6vw,80px) 0' }}>
      <div style={{ ...SHELL, maxWidth: 1180 }}>
        <MarketingInlineContactPanel
          eyebrow="Plan een eerste route-inschatting"
          title="Vertel kort welke managementvraag nu speelt."
          body="In circa 20 minuten krijgt u helderheid over productkeuze, aanpak, timing, privacy, prijs en hoe een eerste route-inschatting naar een bounded eerste route leidt."
          defaultRouteInterest="exitscan"
          defaultCtaSource="approach_form"
        />
      </div>
    </section>
  )
}

export function AanpakContent() {
  return (
    <div style={{ background: T.paper, color: T.ink, overflowX: 'hidden' }}>
      <HeroSection />
      <ProcessSection />
      <RolesSection />
      <FirstValueSection />
      <ContactSection />
    </div>
  )
}

import type { Metadata } from 'next'
import { MarketingClosingCta } from '@/components/marketing/marketing-closing-cta'
import { PublicFooter } from '@/components/marketing/public-footer'
import { PublicHeader } from '@/components/marketing/public-header'
import { buildContactHref } from '@/lib/contact-funnel'

// Link-only landingspagina: bewust niet in nav en niet in sitemap, en noindex.
// Bedoeld om 1-op-1 met warme contacten te delen, zodat het de €4.500-positionering
// niet ondergraaft.
export const metadata: Metadata = {
  title: 'Founding pilot',
  description:
    'Een beperkt aantal founding pilots: een volwaardig Loep-traject in ruil voor actieve feedback.',
  robots: { index: false, follow: false },
}

const T = {
  paper: 'oklch(0.978 0.010 62)',
  paperSoft: 'oklch(0.956 0.018 60)',
  white: '#FFFCF8',
  ink: 'oklch(0.16 0.012 250)',
  inkSoft: 'oklch(0.32 0.010 250)',
  inkMuted: 'oklch(0.52 0.008 250)',
  inkFaint: 'oklch(0.70 0.006 250)',
  rule: 'oklch(0.875 0.012 62)',
}
const AC = { deep: 'oklch(0.45 0.18 50)', mid: 'oklch(0.76 0.14 53)', soft: 'oklch(0.95 0.045 50)' }
const FF = "var(--font-inter), -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
const SH = { maxWidth: 1200, margin: '0 auto', padding: '0 clamp(20px,4vw,48px)' }
const eyebrow = {
  color: AC.deep,
  fontSize: 9.5,
  fontWeight: 600,
  letterSpacing: '.16em',
  marginBottom: 16,
  textTransform: 'uppercase' as const,
}

export default function PilotPage() {
  const ctaHref = buildContactHref({ routeInterest: 'nog-onzeker', ctaSource: 'pilot' })

  return (
    <div style={{ background: T.paper, color: T.ink, overflowX: 'hidden' }}>
      <PublicHeader ctaHref={ctaHref} ctaLabel="Bespreek een pilotplek" />
      <main>
        {/* ── Hero ── */}
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
          <div style={{ ...SH, position: 'relative' }}>
            <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1fr_368px] items-start">
              <div>
                <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '.18em', textTransform: 'uppercase', color: AC.deep, marginBottom: 18 }}>
                  Founding pilot · 1–2 plekken
                </div>
                <h1 style={{ fontFamily: FF, fontWeight: 800, fontSize: 'clamp(40px,5.2vw,72px)', lineHeight: 0.98, letterSpacing: '-.032em', color: T.ink, maxWidth: '15ch' }}>
                  Word een van de eerste organisaties die met Loep werkt.
                </h1>
                <p style={{ fontSize: 16.5, lineHeight: 1.72, color: T.inkSoft, maxWidth: '52ch', margin: '24px 0 32px' }}>
                  Voor MKB-organisaties met een concreet vraagstuk rond behoud, vertrek of onboarding. Je krijgt een
                  volwaardig Loep-traject; wij gebruiken de pilot om de output, begeleiding en klantreis aan te scherpen.
                </p>
                <a
                  href={ctaHref}
                  style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 7, fontSize: 14.5, fontWeight: 600, padding: '13px 28px', color: '#fff', background: T.ink }}
                >
                  Bespreek een pilotplek
                </a>
              </div>
              <div>
                <div style={{ padding: '28px', background: T.paperSoft, border: `1px solid ${T.rule}` }}>
                  <div style={{ fontSize: 9.5, fontWeight: 600, letterSpacing: '.14em', textTransform: 'uppercase', color: AC.deep, marginBottom: 16 }}>
                    Founding pilot · kosteloos
                  </div>
                  {[
                    'Een begeleide Loep-scan',
                    'Campagne- en responsregie',
                    'Managementrapport met prioriteiten',
                    'Begeleide managementbespreking (60–90 min)',
                    'Eerste managementvraag en vervolgstap',
                  ].map((item, i) => (
                    <div key={item} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '9px 0', borderTop: i > 0 ? `1px solid ${T.rule}` : 'none', fontSize: 13, color: T.inkSoft }}>
                      <div style={{ width: 4, height: 4, background: AC.mid, flexShrink: 0, marginTop: 5 }} />
                      {item}
                    </div>
                  ))}
                  <p style={{ marginTop: 14, fontSize: 12.5, color: T.inkMuted, lineHeight: 1.6 }}>
                    Een volwaardig traject binnen een duidelijke scope, geen uitgeklede versie.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Wat we samen afspreken ── */}
        <section style={{ background: T.paperSoft, padding: 'clamp(48px,5.5vw,72px) 0', borderBottom: `1px solid ${T.rule}` }}>
          <div style={SH}>
            <div style={{ maxWidth: '60ch', marginBottom: 28 }}>
              <div style={eyebrow}>Wat we samen afspreken</div>
              <p style={{ fontSize: 15, lineHeight: 1.72, color: T.inkSoft }}>
                In ruil voor een volwaardig traject vragen we vooral je eerlijke blik. De rest is voorwaardelijk en altijd
                met jouw expliciete goedkeuring.
              </p>
            </div>
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              {[
                'Een eerlijk evaluatiegesprek na afloop.',
                'Gerichte feedback op proces, rapport en de managementbespreking.',
                'Toestemming om leerpunten geanonimiseerd te gebruiken voor verbetering.',
                'Bij een positieve ervaring: toestemming voor een korte quote of geanonimiseerde case, altijd pas na expliciete goedkeuring.',
              ].map((text) => (
                <div key={text} style={{ alignItems: 'flex-start', background: T.white, border: `1px solid ${T.rule}`, display: 'flex', gap: 12, padding: '18px 20px' }}>
                  <div style={{ width: 6, height: 6, background: AC.deep, borderRadius: '50%', flexShrink: 0, marginTop: 8 }} />
                  <p style={{ fontSize: 14, lineHeight: 1.65, color: T.inkSoft }}>{text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Voor wie wel / niet ── */}
        <section style={{ background: T.white, padding: 'clamp(48px,5.5vw,72px) 0', borderBottom: `1px solid ${T.rule}` }}>
          <div style={SH}>
            <div style={{ marginBottom: 28 }}>
              <div style={eyebrow}>Voor wie deze pilot past</div>
            </div>
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <div style={{ padding: '28px', background: T.paperSoft, border: `1px solid ${T.rule}`, borderTop: `3px solid ${AC.mid}` }}>
                <div style={{ fontSize: 13.5, fontWeight: 600, color: T.ink, marginBottom: 16 }}>Past wel</div>
                {[
                  'Een concreet vraagstuk rond behoud, vertrek of onboarding',
                  'Een interne sponsor in HR of directie',
                  'Voldoende medewerkers voor groepsrapportage',
                  'Management beschikbaar voor de bespreking',
                  'Bereidheid om scherpe feedback te geven',
                ].map((text) => (
                  <div key={text} style={{ display: 'flex', gap: 10, fontSize: 13.5, color: T.inkSoft, lineHeight: 1.6, padding: '7px 0' }}>
                    <div style={{ width: 4, height: 4, background: AC.mid, flexShrink: 0, marginTop: 7 }} />
                    {text}
                  </div>
                ))}
              </div>
              <div style={{ padding: '28px', background: T.paperSoft, border: `1px solid ${T.rule}`, borderTop: `3px solid ${T.inkFaint}` }}>
                <div style={{ fontSize: 13.5, fontWeight: 600, color: T.ink, marginBottom: 16 }}>Past niet</div>
                {[
                  'Je zoekt vooral een gratis MTO',
                  'Je wilt individuele medewerkers beoordelen',
                  'Acute conflictsituaties of individuele casuïstiek',
                  'Geen interne sponsor of opvolging',
                  'Geen bereidheid tot feedback of referentiegesprek',
                ].map((text) => (
                  <div key={text} style={{ display: 'flex', gap: 10, fontSize: 13.5, color: T.inkMuted, lineHeight: 1.6, padding: '7px 0' }}>
                    <div style={{ width: 4, height: 4, background: T.inkFaint, flexShrink: 0, marginTop: 7 }} />
                    {text}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── Scope & privacy ── */}
        <section style={{ background: T.paperSoft, padding: 'clamp(48px,5.5vw,72px) 0', borderBottom: `1px solid ${T.rule}` }}>
          <div style={SH}>
            <div style={{ maxWidth: '64ch', marginBottom: 22 }}>
              <div style={eyebrow}>Scope en spelregels</div>
              <p style={{ fontSize: 15, lineHeight: 1.72, color: T.inkSoft }}>
                Een duidelijke afbakening houdt de pilot scherp voor ons allebei: één scan, geen open consultancytraject.
              </p>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 22 }}>
              {[
                'Eén scan',
                'Eén doelgroep / campagne',
                'Eén managementrapport',
                'Eén managementbespreking',
                'Eén evaluatiegesprek',
                'Geen individueel risicomodel',
                'Geen brede maatwerk-consultancy',
                'Geen garantie op een specifieke uitkomst',
              ].map((text) => (
                <span key={text} style={{ background: T.white, border: `1px solid ${T.rule}`, color: T.inkSoft, fontSize: 13, padding: '8px 14px' }}>
                  {text}
                </span>
              ))}
            </div>
            <div style={{ background: T.white, border: `1px solid ${T.rule}`, padding: '18px 20px', maxWidth: '70ch' }}>
              <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '.16em', textTransform: 'uppercase', color: T.inkFaint, marginBottom: 8 }}>Privacy</div>
              <p style={{ fontSize: 13.5, color: T.inkMuted, lineHeight: 1.65 }}>
                Rapportage blijft op groepsniveau. Voorbeeldcases of citaten gebruiken we alleen volledig geanonimiseerd of
                gesynthetiseerd, en pas na jouw expliciete goedkeuring.
              </p>
            </div>
          </div>
        </section>

        {/* ── Waarom kosteloos + CTA ── */}
        <MarketingClosingCta
          href={ctaHref}
          id="pilot-cta"
          showSectionMark={false}
          backdropNumber={null}
          title="Loep is klaar voor"
          accentTitle="praktijkvalidatie."
          body="Daarom stellen we tijdelijk 1–2 founding pilots beschikbaar. Jij krijgt een volwaardig traject; wij krijgen scherpe feedback, praktijkbewijs en, alleen bij tevredenheid, toestemming voor een referentie."
          buttonLabel="Bespreek een pilotplek"
          note="Beperkt aantal plekken. We bekijken eerst samen of de pilot past."
        />
      </main>
      <PublicFooter />
    </div>
  )
}

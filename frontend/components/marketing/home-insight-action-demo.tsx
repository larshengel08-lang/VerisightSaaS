'use client'

import { Fragment, startTransition, useState } from 'react'
import { useInView } from '@/components/marketing/design-tokens'

// ─── Design tokens ────────────────────────────────────────────────────────────
const C = {
  ink:       '#132033',
  inkSoft:   '#1C2A3D',
  paper:     '#FFFFFF',
  paperWarm: '#F7F5F1',
  rule:      '#E5E0D6',
  ruleSoft:  '#F0EBE2',
  text:      '#4A5563',
  muted:     '#6B7280',
  amber:     '#C96A4B',
  amberDeep: '#B85D41',
  amberSoft: '#F3E4DA',
  amberLine: '#E8B7A6',
  teal:      '#C96A4B',
  tealDeep:  '#B85D41',
  tealSoft:  '#F3E4DA',
  tealLine:  '#E8B7A6',
} as const

const FF  = 'var(--font-playfair), Georgia, serif'
const FN  = 'var(--font-plus-jakarta), system-ui, sans-serif'
const SH  = { margin: '0 auto', maxWidth: 1240, padding: '0 clamp(20px, 4vw, 48px)' } as const

const CARD_RADIUS  = 20
const INSET_RADIUS = 12
const PAD          = 'clamp(22px, 3.5vw, 32px)'
const CTA_PAD      = '12px 22px'
const CTA_FONT     = 12.5
const HEADER_PAD   = '13px clamp(22px, 3.5vw, 32px)'
// All 4 card states share this minimum height so they stay visually identical
const CARD_MIN_H   = 420

export const SHOW_HOME_INSIGHT_ACTION_DEMO = true

type DemoView = 'dashboard-overview' | 'dashboard-detail' | 'action-overview' | 'action-detail'

const STEPS: { view: DemoView; n: number; label: string; mod: 'db' | 'ac' }[] = [
  { view: 'dashboard-overview', n: 1, label: 'Zien',        mod: 'db' },
  { view: 'dashboard-detail',   n: 2, label: 'Prioriteren', mod: 'db' },
  { view: 'action-overview',    n: 3, label: 'Handelen',    mod: 'ac' },
  { view: 'action-detail',      n: 4, label: 'Review',      mod: 'ac' },
]

// ─── Shared primitives ────────────────────────────────────────────────────────
function Arrow() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
      <path d="M2.5 7h9M7.5 3.5L11 7l-3.5 3.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function Label({ children, dark = false }: { children: React.ReactNode; dark?: boolean }) {
  return (
    <p style={{
      color: dark ? 'rgba(255,252,248,.42)' : C.muted,
      fontFamily: FN, fontSize: 10, fontWeight: 700,
      letterSpacing: '.18em', margin: 0, textTransform: 'uppercase',
    }}>
      {children}
    </p>
  )
}

function Badge({ children, tone = 'amber' }: { children: React.ReactNode; tone?: 'amber' | 'teal' }) {
  const map = {
    amber: { bg: C.amberSoft, border: C.amberLine, color: C.amberDeep },
    teal:  { bg: C.tealSoft,  border: C.tealLine,  color: C.teal      },
  }
  const s = map[tone]
  return (
    <span style={{
      background: s.bg, border: `1px solid ${s.border}`, borderRadius: 999,
      color: s.color, display: 'inline-flex', fontFamily: FN,
      fontSize: 10, fontWeight: 700, letterSpacing: '.12em',
      padding: '5px 10px', textTransform: 'uppercase', whiteSpace: 'nowrap',
    }}>
      {children}
    </span>
  )
}

function CtaButton({
  children, onClick, accent = 'amber', secondary = false,
}: {
  children: React.ReactNode
  onClick: () => void
  accent?: 'amber' | 'teal'
  secondary?: boolean
}) {
  const bg      = secondary ? 'transparent'         : accent === 'teal' ? C.teal     : C.amber
  const bgHover = secondary ? C.ruleSoft            : accent === 'teal' ? C.tealDeep : C.amberDeep
  const bdr     = secondary ? `1px solid ${C.rule}` : 'none'
  const clr     = secondary ? C.text                : '#fff'
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        alignItems: 'center', background: bg, border: bdr,
        borderRadius: 999, color: clr, cursor: 'pointer',
        display: 'inline-flex', flexShrink: 0,
        fontFamily: FN, fontSize: CTA_FONT, fontWeight: 700,
        gap: 9, letterSpacing: '.10em',
        padding: CTA_PAD, textTransform: 'uppercase',
        transition: 'background .18s ease, transform .15s ease',
      }}
      onMouseEnter={e => {
        const el = e.currentTarget as HTMLElement
        el.style.background = bgHover
        el.style.transform = 'translateY(-1px)'
      }}
      onMouseLeave={e => {
        const el = e.currentTarget as HTMLElement
        el.style.background = bg
        el.style.transform = 'none'
      }}
    >
      {children}
    </button>
  )
}

// ─── Pipeline nav — connectors between buttons for equal spacing ──────────────
function PipelineNav({ view, goTo }: { view: DemoView; goTo: (v: DemoView) => void }) {
  const current = STEPS.findIndex(s => s.view === view)
  return (
    <div style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
      {STEPS.map((step, i) => {
        const active     = i === current
        const done       = i < current
        const accent     = step.mod === 'db' ? C.amber : C.teal
        const prevDone   = i > 0 && (i - 1) < current
        const prevAccent = i > 0 ? (STEPS[i - 1].mod === 'db' ? C.amber : C.teal) : C.amber
        return (
          <Fragment key={step.view}>
            {/* Connector before each step except the first */}
            {i > 0 && (
              <div style={{
                flex: 1, height: 1.5, minWidth: 8,
                background: prevDone ? prevAccent : C.rule,
                transition: 'background .35s ease',
              }} />
            )}
            <button
              type="button"
              onClick={() => goTo(step.view)}
              style={{
                alignItems: 'center',
                background: active ? accent : 'transparent',
                border: `1.5px solid ${active || done ? accent : C.rule}`,
                borderRadius: 999,
                color: active ? '#fff' : done ? accent : C.muted,
                cursor: 'pointer',
                display: 'inline-flex',
                flexShrink: 0,
                fontFamily: FN, fontSize: 11, fontWeight: 700,
                gap: 6, padding: '6px 12px',
                transition: 'all .2s ease',
                whiteSpace: 'nowrap',
              }}
              onMouseEnter={e => { if (!active) (e.currentTarget as HTMLElement).style.borderColor = accent }}
              onMouseLeave={e => { if (!active) (e.currentTarget as HTMLElement).style.borderColor = active || done ? accent : C.rule }}
            >
              <span style={{
                alignItems: 'center',
                background: active ? 'rgba(255,255,255,.2)' : done ? `${accent}22` : 'transparent',
                borderRadius: '50%', display: 'inline-flex',
                fontSize: 9, fontWeight: 800,
                height: 18, justifyContent: 'center', width: 18, flexShrink: 0,
              }}>{step.n}</span>
              <span className="hidden sm:inline">{step.label}</span>
            </button>
          </Fragment>
        )
      })}
    </div>
  )
}

// ─── Shared module header strip ───────────────────────────────────────────────
function ModuleHeader({
  module, sub, status, tone = 'amber',
}: {
  module: string; sub: string; status: string; tone?: 'amber' | 'teal'
}) {
  return (
    <div style={{
      alignItems: 'center',
      background: tone === 'teal' ? C.tealSoft  : C.amberSoft,
      borderBottom: `1px solid ${tone === 'teal' ? C.tealLine : C.amberLine}`,
      display: 'flex', gap: 12, justifyContent: 'space-between',
      padding: HEADER_PAD,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <Badge tone={tone}>{module}</Badge>
        <span style={{ color: C.muted, fontFamily: FN, fontSize: 11 }}>{sub}</span>
      </div>
      <Badge tone={tone}>{status}</Badge>
    </div>
  )
}

// ─── State 1: Zien — Overview dashboard ──────────────────────────────────────
function State1({ goTo }: { goTo: (v: DemoView) => void }) {
  const kpis = [
    { label: 'Respons',              value: '45',  total: '70' },
    { label: 'Leiderschap',          value: '8.0', total: '10' },
    { label: 'Groei & Ontwikkeling', value: '7.2', total: '10' },
  ]
  type FactorStatus = 'aandacht' | 'verhoogd' | 'stabiel'
  const factors: { label: string; status: FactorStatus }[] = [
    { label: 'Groei en ontwikkeling', status: 'aandacht' },
    { label: 'Werkdruk in operatie',  status: 'verhoogd' },
    { label: 'Loopbaanperspectief',   status: 'stabiel'  },
    { label: 'Onboarding kwaliteit',  status: 'stabiel'  },
  ]
  const statusMap: Record<FactorStatus, { dot: string; bg: string; border: string; color: string; label: string }> = {
    aandacht: { dot: C.amber, bg: C.amberSoft, border: C.amberLine, color: C.amberDeep, label: 'Aandacht' },
    verhoogd: { dot: C.amber, bg: C.amberSoft, border: C.amberLine, color: C.amberDeep, label: 'Verhoogd' },
    stabiel:  { dot: C.teal,  bg: C.tealSoft,  border: C.tealLine,  color: C.teal,      label: 'Stabiel'  },
  }
  return (
    <div style={{ animation: 'slideUpFade 250ms cubic-bezier(.16,1,.3,1)' }}>
      <div style={{
        background: C.paper,
        border: `1px solid ${C.rule}`,
        borderLeft: `6px solid ${C.amber}`,
        borderRadius: CARD_RADIUS,
        minHeight: CARD_MIN_H,
        overflow: 'hidden',
      }}>
        <ModuleHeader module="Dashboard" sub="ExitScan · Q2 2025" status="Nu eerst" tone="amber" />

        <div style={{ padding: PAD }}>

          {/* KPI row */}
          <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>
            {kpis.map(kpi => (
              <div key={kpi.label} style={{
                background: C.amberSoft,
                border: `1px solid ${C.amberLine}`,
                borderRadius: INSET_RADIUS,
                flex: '1 1 80px',
                padding: '10px 14px',
              }}>
                <Label>{kpi.label}</Label>
                <div style={{ alignItems: 'baseline', display: 'flex', gap: 3, marginTop: 5 }}>
                  <span style={{
                    color: C.ink, fontFamily: FF, fontSize: '1.6rem',
                    fontWeight: 400, letterSpacing: '-.04em', lineHeight: 1,
                  }}>{kpi.value}</span>
                  <span style={{ color: C.muted, fontFamily: FN, fontSize: 11, fontWeight: 600 }}>/ {kpi.total}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Factor overview */}
          <div style={{ marginBottom: 20 }}>
            <Label>Factor-overzicht</Label>
            <div style={{ marginTop: 10 }}>
              {factors.map((f, i) => {
                const s = statusMap[f.status]
                const isFlag = f.status !== 'stabiel'
                return (
                  <div key={f.label} style={{
                    alignItems: 'center',
                    borderBottom: i < factors.length - 1 ? `1px solid ${C.ruleSoft}` : 'none',
                    display: 'flex', gap: 10,
                    padding: '9px 0',
                  }}>
                    <div style={{
                      background: s.dot, borderRadius: '50%', flexShrink: 0,
                      height: 7, width: 7, opacity: isFlag ? 1 : .35,
                    }} />
                    <span style={{
                      color: isFlag ? C.ink : C.muted,
                      flex: 1, fontFamily: FN, fontSize: 13,
                      fontWeight: isFlag ? 600 : 400,
                    }}>{f.label}</span>
                    <span style={{
                      background: s.bg, border: `1px solid ${s.border}`, borderRadius: 999,
                      color: s.color, fontFamily: FN, fontSize: 9, fontWeight: 700,
                      letterSpacing: '.1em', padding: '3px 8px',
                      textTransform: 'uppercase', whiteSpace: 'nowrap',
                    }}>{s.label}</span>
                  </div>
                )
              })}
            </div>
          </div>

          <CtaButton onClick={() => goTo('dashboard-detail')} accent="amber">
            Open ExitScan <Arrow />
          </CtaButton>

        </div>
      </div>
    </div>
  )
}

// ─── State 2: Prioriteren — Factor deep-dive ─────────────────────────────────
function State2({ goTo }: { goTo: (v: DemoView) => void }) {
  const factors = [
    { label: 'Groei en ontwikkeling', pct: 72, tone: 'green' as const },
    { label: 'Werkdruk',              pct: 48, tone: 'risk'  as const },
    { label: 'Loopbaanperspectief',   pct: 34, tone: 'risk'  as const },
    { label: 'Rolhelderheid',         pct: 81, tone: 'green' as const },
  ]
  return (
    <div style={{ animation: 'slideRightFade 250ms cubic-bezier(.16,1,.3,1)' }}>
      <div style={{
        background: C.paper,
        border: `1px solid ${C.rule}`,
        borderLeft: `6px solid ${C.amber}`,
        borderRadius: CARD_RADIUS,
        display: 'flex',
        flexDirection: 'column',
        minHeight: CARD_MIN_H,
        overflow: 'hidden',
      }}>
        <ModuleHeader module="Dashboard" sub="Topfactor · ExitScan Operations" status="Route open" tone="amber" />

        <div style={{ flex: 1, padding: PAD }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {factors.map((f, i) => {
              const isGreen = f.tone === 'green'
              return (
                <div key={f.label}>
                  <div style={{ alignItems: 'center', display: 'flex', justifyContent: 'space-between', marginBottom: 7 }}>
                    <span style={{
                      color: C.ink, fontFamily: FN,
                      fontSize: 14, fontWeight: 600,
                    }}>{f.label}</span>
                    <span style={{
                      color: isGreen ? C.teal : C.amber,
                      fontFamily: FN, fontSize: 11, fontWeight: 700,
                      fontVariantNumeric: 'tabular-nums',
                    }}>{f.pct}%</span>
                  </div>
                  <div style={{ background: C.ruleSoft, borderRadius: 99, height: 6, overflow: 'hidden' }}>
                    <div style={{
                      background: isGreen
                        ? `linear-gradient(90deg, ${C.tealDeep} 0%, ${C.teal} 100%)`
                        : `linear-gradient(90deg, ${C.amberDeep} 0%, ${C.amber} 100%)`,
                      borderRadius: 99, height: '100%', width: `${f.pct}%`,
                      animation: `scaleXIn .85s cubic-bezier(.4,0,0,1) ${i * .08}s both`,
                      transformOrigin: 'left',
                    }} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Handoff strip — light, matching card background */}
        <div style={{
          alignItems: 'center',
          borderTop: `1px solid ${C.rule}`,
          display: 'flex', flexWrap: 'wrap', gap: 14,
          justifyContent: 'space-between',
          padding: `17px ${PAD}`,
        }}>
          <div>
            <Label>Doorleggen</Label>
            <p style={{ color: C.ink, fontFamily: FN, fontSize: 14, fontWeight: 600, margin: '4px 0 0' }}>
              Zet door naar Action Center
            </p>
          </div>
          <CtaButton onClick={() => goTo('action-overview')} accent="amber">
            Naar Action Center <Arrow />
          </CtaButton>
        </div>
      </div>
    </div>
  )
}

// ─── State 3: Handelen — Action Center opvolging ──────────────────────────────
function State3({ goTo }: { goTo: (v: DemoView) => void }) {
  const rows: [string, string][] = [
    ['Status',   'Voor review'],
    ['Eigenaar', 'Suzanne Meijer, HRBP Operations'],
    ['Review',   'Do 09:30 — MT Operations'],
    ['Bron',     'ExitScan Q2 · Dashboard detail'],
  ]
  return (
    <div style={{ animation: 'slideDownFade 250ms cubic-bezier(.16,1,.3,1)' }}>
      <div style={{
        background: C.paper,
        border: `1px solid ${C.rule}`,
        borderLeft: `6px solid ${C.teal}`,
        borderRadius: CARD_RADIUS,
        minHeight: CARD_MIN_H,
        overflow: 'hidden',
      }}>
        <ModuleHeader module="Action Center" sub="Opvolging gestart" status="1 actief" tone="teal" />

        <div style={{ padding: PAD }}>
          <h3 style={{
            color: C.ink, fontFamily: FF, fontWeight: 400,
            fontSize: 'clamp(1.9rem, 3vw, 2.7rem)',
            letterSpacing: '-.05em', lineHeight: .93,
            margin: '0 0 20px',
          }}>
            Review groeipad Operations.
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {rows.map(([k, v], i) => (
              <div key={k} style={{
                alignItems: 'baseline',
                borderBottom: i < rows.length - 1 ? `1px solid ${C.rule}` : 'none',
                display: 'grid', gap: 12,
                gridTemplateColumns: '88px minmax(0,1fr)',
                padding: '11px 0',
              }}>
                <span style={{ color: C.muted, fontFamily: FN, fontSize: 10, fontWeight: 700, letterSpacing: '.14em', textTransform: 'uppercase' }}>{k}</span>
                <span style={{ color: C.ink, fontFamily: FN, fontSize: 13.5, fontWeight: 600, lineHeight: 1.4 }}>{v}</span>
              </div>
            ))}
          </div>

          <div style={{ marginTop: 22 }}>
            <CtaButton onClick={() => goTo('action-detail')} accent="teal">
              Open review <Arrow />
            </CtaButton>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── State 4: Review — dashboard review-actie checklist ──────────────────────
function State4({ goTo }: { goTo: (v: DemoView) => void }) {
  const items: { done: boolean; title: string; body: string }[] = [
    { done: true,  title: 'Exitdata geanalyseerd',       body: 'Patroon na maand zes bevestigd in Q2-data Operations.' },
    { done: true,  title: 'Gesprekken beoordeeld',        body: 'Drie vertrekcases sluiten aan op bevinding groeipad.' },
    { done: true,  title: 'MT-toelichting voorbereid',    body: 'Suzanne Meijer — bespreking Do 09:30 MT Operations.' },
    { done: false, title: 'Besluit vastleggen',           body: 'Vervolgstap bepalen en toewijzen aan eigenaar.' },
  ]
  const doneCount = items.filter(i => i.done).length

  return (
    <div style={{ animation: 'scaleIn 250ms cubic-bezier(.16,1,.3,1)' }}>
      <div style={{
        background: C.paper,
        border: `1px solid ${C.rule}`,
        borderLeft: `6px solid ${C.teal}`,
        borderRadius: CARD_RADIUS,
        minHeight: CARD_MIN_H,
        overflow: 'hidden',
      }}>
        {/* Module header */}
        <div style={{
          alignItems: 'center',
          background: C.tealSoft,
          borderBottom: `1px solid ${C.tealLine}`,
          display: 'flex', gap: 12, justifyContent: 'space-between',
          padding: HEADER_PAD,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Badge tone="teal">Action Center</Badge>
            <span style={{ color: C.teal, fontFamily: FN, fontSize: 11, fontWeight: 600 }}>
              Review groeipad Operations
            </span>
          </div>
          <span style={{ color: C.muted, fontFamily: FN, fontSize: 11 }}>
            Suzanne Meijer · Do 09:30
          </span>
        </div>

        <div style={{ padding: PAD }}>

          {/* Progress bar */}
          <div style={{ marginBottom: 20 }}>
            <div style={{ alignItems: 'center', display: 'flex', justifyContent: 'space-between', marginBottom: 7 }}>
              <Label>Voortgang review</Label>
              <span style={{ color: C.teal, fontFamily: FN, fontSize: 11, fontWeight: 700 }}>
                {doneCount}/{items.length} stappen
              </span>
            </div>
            <div style={{ background: C.ruleSoft, borderRadius: 99, height: 6, overflow: 'hidden' }}>
              <div style={{
                background: `linear-gradient(90deg, ${C.tealDeep} 0%, ${C.teal} 100%)`,
                borderRadius: 99, height: '100%',
                width: `${(doneCount / items.length) * 100}%`,
                animation: 'scaleXIn .85s cubic-bezier(.4,0,0,1) both',
                transformOrigin: 'left',
              }} />
            </div>
          </div>

          {/* Checklist */}
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {items.map((item, i) => {
              const isOpen = !item.done
              return (
                <div key={item.title} style={{
                  alignItems: 'flex-start',
                  background: isOpen ? C.tealSoft : 'transparent',
                  border: isOpen ? `1px solid ${C.tealLine}` : 'none',
                  borderBottom: !isOpen && i < items.length - 1 ? `1px solid ${C.ruleSoft}` : undefined,
                  borderRadius: isOpen ? INSET_RADIUS : 0,
                  display: 'flex', gap: 12,
                  marginBottom: isOpen ? 0 : undefined,
                  marginTop: isOpen ? 4 : 0,
                  padding: isOpen ? '12px 14px' : '10px 0',
                }}>
                  {/* Checkbox */}
                  <div style={{
                    alignItems: 'center',
                    background: item.done ? C.teal : 'transparent',
                    border: `2px solid ${item.done ? C.teal : C.rule}`,
                    borderRadius: 5, display: 'flex', flexShrink: 0,
                    height: 18, justifyContent: 'center',
                    marginTop: 1, width: 18,
                  }}>
                    {item.done && (
                      <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden>
                        <path d="M1.5 5l2.5 2.5 4.5-4.5" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </div>
                  {/* Text */}
                  <div style={{ minWidth: 0 }}>
                    <p style={{
                      color: item.done ? C.muted : C.ink,
                      fontFamily: FN, fontSize: 13.5, fontWeight: item.done ? 400 : 700,
                      lineHeight: 1.3, margin: '0 0 3px',
                      textDecoration: item.done ? 'line-through' : 'none',
                      textDecorationColor: C.rule,
                    }}>{item.title}</p>
                    <p style={{
                      color: item.done ? C.muted : C.text,
                      fontFamily: FN, fontSize: 12.5, lineHeight: 1.55, margin: 0,
                    }}>{item.body}</p>
                  </div>
                </div>
              )
            })}
          </div>

        </div>
      </div>
    </div>
  )
}

// ─── Root ─────────────────────────────────────────────────────────────────────
export function HomeInsightActionDemo() {
  const [view, setView] = useState<DemoView>('dashboard-overview')
  const isAction = view === 'action-overview' || view === 'action-detail'
  const goTo = (next: DemoView) => startTransition(() => setView(next))
  const [revealRef, inView] = useInView(0.08)

  return (
    <section
      id="suite"
      style={{
        background: `linear-gradient(180deg, #f8f0e8 0%, #fdf8f3 100%)`,
        borderTop: `1px solid ${C.rule}`,
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      {/* Ambient glow — static */}
      <div aria-hidden style={{
        background: 'radial-gradient(ellipse at top right, rgba(228,154,99,.12) 0%, transparent 54%)',
        inset: 0, pointerEvents: 'none', position: 'absolute',
      }} />

      {/* Watermark */}
      <div aria-hidden style={{
        color: 'rgba(196,102,31,.07)',
        fontFamily: FF,
        fontSize: 'clamp(12rem, 20vw, 20rem)',
        fontWeight: 300, letterSpacing: '-.08em', lineHeight: .8,
        pointerEvents: 'none', position: 'absolute',
        right: '-1vw', top: '5%', userSelect: 'none',
      }}>
        {isAction ? 'AC' : '01'}
      </div>

      <div
        ref={revealRef}
        style={{
          ...SH,
          paddingBottom: 'clamp(48px,7vw,72px)',
          paddingTop: 'clamp(28px,4vw,48px)',
          position: 'relative',
          opacity: inView ? 1 : 0,
          transform: inView ? 'none' : 'translateY(24px)',
          transition: 'opacity .75s ease, transform .75s cubic-bezier(.16,1,.3,1)',
        }}
      >

        {/* Header row */}
        <div style={{
          alignItems: 'flex-start',
          display: 'flex', flexWrap: 'wrap',
          gap: 16, justifyContent: 'space-between',
          marginBottom: 28,
        }}>
          <div style={{ minHeight: 52 }}>
            <Label>
              {isAction ? 'Action Center' : 'Dashboard'} · Verisight suite
            </Label>
            <p style={{
              color: C.ink,
              fontFamily: FN, fontSize: 13.5, fontWeight: 600,
              lineHeight: 1.44, margin: '7px 0 0', maxWidth: '34ch',
            }}>
              {isAction
                ? 'Het signaal staat klaar om opgepakt te worden.'
                : 'Van eerste signaal naar concrete opvolging.'}
            </p>
          </div>

          <div style={{ flexShrink: 0, minWidth: 0, maxWidth: '100%' }}>
            <PipelineNav view={view} goTo={goTo} />
          </div>
        </div>

        {/* State canvas */}
        <div key={view}>
          {view === 'dashboard-overview' && <State1 goTo={goTo} />}
          {view === 'dashboard-detail'   && <State2 goTo={goTo} />}
          {view === 'action-overview'    && <State3 goTo={goTo} />}
          {view === 'action-detail'      && <State4 goTo={goTo} />}
        </div>

      </div>
    </section>
  )
}

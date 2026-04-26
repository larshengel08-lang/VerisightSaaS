'use client'

import { useState, useEffect, useRef } from 'react'

// ── Design tokens ─────────────────────────────────────────────────
export const T = {
  paper:      'oklch(0.978 0.010 62)',
  paperSoft:  'oklch(0.956 0.018 60)',
  paperBlush: 'oklch(0.962 0.025 32)',
  white:      '#FFFCF8',
  navy:       'oklch(0.13 0.032 250)',
  ink:        'oklch(0.16 0.012 250)',
  inkSoft:    'oklch(0.32 0.010 250)',
  inkMuted:   'oklch(0.52 0.008 250)',
  inkFaint:   'oklch(0.70 0.006 250)',
  rule:       'oklch(0.875 0.012 62)',
  ruleLight:  'oklch(0.918 0.008 62)',
  teal:       'oklch(0.50 0.12 188)',
  tealMid:    'oklch(0.62 0.10 185)',
  tealSoft:   'oklch(0.94 0.04 185)',
  tealFaint:  'oklch(0.972 0.018 185)',
} as const

export const AC = {
  deep:  'oklch(0.45 0.18 50)',
  mid:   'oklch(0.76 0.14 53)',
  light: 'oklch(0.86 0.10 55)',
  soft:  'oklch(0.95 0.045 50)',
  faint: 'oklch(0.976 0.018 50)',
} as const

export const FF = 'var(--font-fraunces), serif'
export const SHELL = { maxWidth: 1200, margin: '0 auto', padding: '0 clamp(20px,4vw,48px)' } as const

// ── Hooks ─────────────────────────────────────────────────────────
export function useInView(threshold = 0.12) {
  const ref = useRef<HTMLDivElement>(null)
  const [inView, setInView] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setInView(true); obs.disconnect() } },
      { threshold }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [threshold])
  return [ref, inView] as const
}

// ── Shared components ─────────────────────────────────────────────
export function Reveal({
  children, delay = 0, from = 'up' as 'up' | 'right' | 'none', threshold = 0.1,
}: {
  children: React.ReactNode; delay?: number; from?: 'up' | 'right' | 'none'; threshold?: number
}) {
  const [ref, inView] = useInView(threshold)
  const tr = { up: 'translateY(22px)', right: 'translateX(24px)', none: 'none' }
  return (
    <div ref={ref} style={{
      opacity: inView ? 1 : 0,
      transform: inView ? 'none' : tr[from],
      transition: `opacity .75s ease ${delay}s, transform .75s cubic-bezier(.16,1,.3,1) ${delay}s`,
    }}>
      {children}
    </div>
  )
}

export function Arrow() {
  return (
    <svg width="13" height="13" viewBox="0 0 14 14" fill="none" aria-hidden>
      <path d="M2.5 7h9M7.5 3.5L11 7l-3.5 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function SectionMark({ num, label, inView = true }: { num: string; label: string; inView?: boolean }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 52 }}>
      <span style={{ fontFamily: FF, fontSize: 11, fontWeight: 400, color: T.inkFaint, letterSpacing: '.03em', minWidth: 18 }}>{num}</span>
      <span style={{ fontSize: 10, fontWeight: 600, letterSpacing: '.18em', textTransform: 'uppercase', color: T.inkMuted, whiteSpace: 'nowrap' }}>{label}</span>
      <div style={{
        flex: 1, height: '1px', background: T.rule, transformOrigin: 'left',
        transform: inView ? 'scaleX(1)' : 'scaleX(0)',
        opacity: inView ? 1 : 0,
        transition: 'transform .9s cubic-bezier(.4,0,0,1) .1s, opacity .4s ease .1s',
      }} />
    </div>
  )
}

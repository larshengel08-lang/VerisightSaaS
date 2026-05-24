'use client'

import { useState, useEffect, useRef } from 'react'

// ── Design tokens ─────────────────────────────────────────────────
export const T = {
  paper:      '#F4F1EA',
  paperSoft:  '#EEE8DE',
  paperBlush: '#F2EBE1',
  white:      '#FFFFFF',
  navy:       '#0D1B2A',
  ink:        '#0D1B2A',
  inkSoft:    '#4A6070',
  inkMuted:   '#6A7783',
  inkFaint:   '#8B95A0',
  rule:       'rgba(13,27,42,0.15)',
  ruleLight:  'rgba(13,27,42,0.10)',
  teal:       '#E8A020',
  tealMid:    '#D3921D',
  tealSoft:   'rgba(232,160,32,0.12)',
  tealFaint:  'rgba(232,160,32,0.08)',
} as const

export const AC = {
  deep:  '#B07A10',
  mid:   '#E8A020',
  light: '#F2C76F',
  soft:  'rgba(232,160,32,0.12)',
  faint: 'rgba(232,160,32,0.08)',
} as const

export const FF = 'var(--font-inter-tight), Inter, sans-serif'
export const SHELL = { maxWidth: 1280, margin: '0 auto', padding: '0 clamp(16px,3.5vw,48px)' } as const

// ── Hooks ─────────────────────────────────────────────────────────
export function useInView(threshold = 0.12) {
  const ref = useRef<HTMLDivElement>(null)
  const [inView, setInView] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return

    // If the page restores scroll position or the block is already close to the
    // viewport on first paint, reveal immediately instead of waiting on the
    // observer tick.
    const rect = el.getBoundingClientRect()
    const vh = window.innerHeight || document.documentElement.clientHeight
    const alreadyNearViewport = rect.top < vh * 0.96 && rect.bottom > vh * 0.04
    if (alreadyNearViewport) {
      setInView(true)
      return
    }

    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setInView(true); obs.disconnect() } },
      { threshold, rootMargin: '0px 0px -6% 0px' }
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
  children?: React.ReactNode; delay?: number; from?: 'up' | 'right' | 'none'; threshold?: number
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
  void num
  void label
  void inView
  return null
}

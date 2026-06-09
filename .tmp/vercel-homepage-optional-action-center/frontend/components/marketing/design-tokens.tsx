'use client'

import { useState, useEffect, useRef } from 'react'

// ── Design tokens ─────────────────────────────────────────────────
export const T = {
  paper:      '#F7F5F1',
  paperSoft:  '#FAF8F4',
  paperBlush: '#F3E4DA',
  white:      '#FFFFFF',
  navy:       '#132033',
  ink:        '#132033',
  inkSoft:    '#4A5563',
  inkMuted:   '#6B7280',
  inkFaint:   '#9AA3AE',
  rule:       '#E5E0D6',
  ruleLight:  '#F0EBE2',
  teal:       '#7A908B',
  tealMid:    '#90A29F',
  tealSoft:   '#E8F0EE',
  tealFaint:  '#F4F8F7',
} as const

export const AC = {
  deep:  '#C96A4B',
  mid:   '#D9886E',
  light: '#E8B7A6',
  soft:  '#F3E4DA',
  faint: '#FAF1EC',
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

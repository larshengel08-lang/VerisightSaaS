'use client'

import { useEffect, useRef, useState } from 'react'

const KPI_CARDS = [
  ['Vertrekrisico', '12%', '1.05s'],
  ['Engagement', '7.4', '1.35s'],
  ['Onboarding', '8.1', '1.65s'],
] as const

const PRIORITIES = [
  ['Groei en ontwikkeling', 'Hoog', 'bg-[#F7F5F1] text-[#101820]', '0.48s'],
  ['Werkdruk in operatie', 'Verhoogd', 'bg-[#3C8D8A] text-white', '0.68s'],
  ['Loopbaanperspectief', 'Aandacht', 'bg-[#D7EFE9] text-[#101820]', '0.88s'],
] as const

function usePlayOnceInView() {
  const ref = useRef<HTMLDivElement | null>(null)
  const [motionState, setMotionState] = useState<'static' | 'pending' | 'play'>('static')

  useEffect(() => {
    if (typeof window === 'undefined') return

    const desktopOnly = window.matchMedia('(min-width: 768px)').matches
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    if (!desktopOnly || reduceMotion) {
      setMotionState('static')
      return
    }

    setMotionState('pending')

    const node = ref.current
    if (!node) return

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries
        if (!entry?.isIntersecting) return

        setMotionState('play')
        observer.disconnect()
      },
      { threshold: 0.45 },
    )

    observer.observe(node)

    return () => observer.disconnect()
  }, [])

  return { ref, motionState }
}

export function HeroMotionDashboard() {
  const { ref, motionState } = usePlayOnceInView()

  return (
    <div ref={ref} data-motion-state={motionState} className="hero-motion-dashboard relative w-full">
      <div className="absolute -inset-8 -z-10 rounded-[2.4rem] bg-[radial-gradient(circle_at_top_left,rgba(215,239,233,0.95)_0%,rgba(255,252,247,0.34)_42%,transparent_72%)] blur-3xl" />
      <div className="overflow-hidden rounded-[2.25rem] border border-[rgba(221,215,203,0.82)] bg-[var(--surface)] shadow-[0_42px_110px_-46px_rgba(16,24,32,0.34)]">
        <div className="flex items-center justify-between border-b border-[rgba(221,215,203,0.82)] bg-[rgba(245,242,234,0.66)] px-5 py-2.5">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-[var(--border)]" />
            <span className="h-2 w-2 rounded-full bg-[var(--border)]" />
            <span className="h-2 w-2 rounded-full bg-[var(--border)]" />
          </div>
          <p className="text-[11px] tracking-wide text-[var(--muted)]">Voorbeeldoutput - Q2 rapport</p>
          <p className="text-[11px] text-[var(--muted)]">Verisight</p>
        </div>

        <div className="relative overflow-hidden bg-[#091015] px-5 py-5 text-[#F7F5F1] md:px-6 md:py-6">
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.035)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:72px_72px] opacity-50" />
          <div className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-[radial-gradient(circle_at_top,rgba(60,141,138,0.28),transparent_68%)]" />

          <div className="relative grid gap-7 md:grid-cols-[minmax(0,0.56fr)_minmax(0,1.44fr)] md:gap-8">
            <div className="space-y-6">
              <div className="motion-copy-block" style={{ ['--motion-delay' as string]: '0.08s' }}>
                <p className="text-[0.66rem] font-semibold uppercase tracking-[0.2em] text-[#A5B7C7]">Dashboard</p>
                <p className="mt-3 max-w-[22rem] text-[1.04rem] leading-7 text-[#F7F5F1]">
                  Managementsamenvatting. Topprioriteiten, trend en eerste actie in één oogopslag.
                </p>
              </div>

              <div>
                <p className="motion-copy-block text-[0.66rem] font-semibold uppercase tracking-[0.2em] text-[#A5B7C7]" style={{ ['--motion-delay' as string]: '0.24s' }}>
                  Top prioriteiten
                </p>
                <ul className="mt-4 space-y-2.5">
                  {PRIORITIES.map(([label, status, style, delay]) => (
                    <li
                      key={label}
                      className="motion-priority-row flex items-center justify-between gap-3 border-b border-white/10 pb-2.5 last:border-b-0 last:pb-0"
                      style={{ ['--motion-delay' as string]: delay }}
                    >
                      <span className="text-[14px] text-[#F7F5F1]">{label}</span>
                      <span className={`rounded-full px-2.5 py-1 text-[10.5px] font-medium ${style}`}>{status}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="motion-copy-block" style={{ ['--motion-delay' as string]: '2.75s' }}>
                <p className="text-[0.66rem] font-semibold uppercase tracking-[0.2em] text-[#A5B7C7]">Eerste actie</p>
                <p className="mt-3 max-w-[22rem] text-[13px] leading-6 text-[rgba(247,245,241,0.76)]">
                  Plan een managementgesprek over groei, werkdruk en opvolging. Leg prioriteit en eigenaar direct vast.
                </p>
              </div>
            </div>

            <div className="relative">
              <div className="grid gap-3 sm:grid-cols-3">
                {KPI_CARDS.map(([label, value, delay]) => (
                  <div
                    key={label}
                    className="motion-kpi-card rounded-[1.05rem] border border-white/10 bg-white/[0.06] px-4 py-4 backdrop-blur-[2px] md:px-5 md:py-[1.15rem]"
                    style={{ ['--motion-delay' as string]: delay }}
                  >
                    <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#B8C6D2]">{label}</p>
                    <p className="mt-2 text-[2.15rem] font-medium tracking-[-0.06em] text-white">{value}</p>
                  </div>
                ))}
              </div>

              <div className="relative mt-4 overflow-hidden rounded-[1.55rem] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.028),rgba(255,255,255,0.012))] px-4 py-4 md:px-5 md:py-5">
                <div className="motion-chart-header flex flex-wrap items-start justify-between gap-4" style={{ ['--motion-delay' as string]: '1.95s' }}>
                  <div>
                    <p className="text-[0.66rem] font-semibold uppercase tracking-[0.2em] text-[#A5B7C7]">Behoudssignaal · 12 mnd</p>
                    <p className="mt-2 text-[2.55rem] font-medium tracking-[-0.06em] text-white">+3,1 pt</p>
                  </div>
                  <p className="pt-1 text-[11px] text-[rgba(247,245,241,0.55)]">Trend afgelopen 4 kwartalen</p>
                </div>

                <svg viewBox="0 0 560 248" className="mt-4 h-[20rem] w-full md:h-[29rem]">
                  <defs>
                    <linearGradient id="heroTrendAnimated" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="rgba(60,141,138,0.55)" />
                      <stop offset="100%" stopColor="rgba(60,141,138,0)" />
                    </linearGradient>
                  </defs>
                  {[0, 112, 224, 336, 448, 560].map((x) => (
                    <line key={x} x1={x} y1="0" x2={x} y2="248" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
                  ))}
                  {[28, 94, 160, 226].map((y) => (
                    <line key={y} x1="0" y1={y} x2="560" y2={y} stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
                  ))}
                  <path
                    className="motion-chart-area"
                    d="M0,184 C48,186 84,194 120,172 C158,148 194,154 228,137 C264,119 304,130 344,103 C388,74 428,82 466,57 C500,34 530,28 560,22 L560,248 L0,248 Z"
                    fill="url(#heroTrendAnimated)"
                    style={{ ['--motion-delay' as string]: '2.18s' }}
                  />
                  <path
                    className="motion-chart-line"
                    pathLength="1"
                    d="M0,184 C48,186 84,194 120,172 C158,148 194,154 228,137 C264,119 304,130 344,103 C388,74 428,82 466,57 C500,34 530,28 560,22"
                    fill="none"
                    stroke="#67C3BD"
                    strokeWidth="3.6"
                    strokeLinecap="round"
                    style={{ ['--motion-delay' as string]: '2.22s' }}
                  />
                  <circle
                    className="motion-chart-dot"
                    cx="466"
                    cy="57"
                    r="8.5"
                    fill="#0B1217"
                    stroke="#67C3BD"
                    strokeWidth="3"
                    style={{ ['--motion-delay' as string]: '3.22s' }}
                  />
                </svg>

                <div className="motion-axis mt-2.5 flex justify-between text-[11px] text-[rgba(247,245,241,0.55)]" style={{ ['--motion-delay' as string]: '3.02s' }}>
                  <span>Q2 &apos;24</span>
                  <span>Q3</span>
                  <span>Q4</span>
                  <span>Q1 &apos;25</span>
                  <span>Q2</span>
                </div>

                <div className="mt-4 md:absolute md:bottom-5 md:right-5 md:mt-0 md:w-[19rem]">
                  <div
                    className="motion-summary-card rounded-[1.15rem] border border-[rgba(221,215,203,0.88)] bg-[rgba(255,252,247,0.97)] px-5 py-5 text-[#132033] shadow-[0_24px_60px_-32px_rgba(0,0,0,0.48)]"
                    style={{ ['--motion-delay' as string]: '3.38s' }}
                  >
                    <p className="text-[10.5px] font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">Samenvatting</p>
                    <p className="mt-2 text-[14px] leading-6 text-[#4A5563]">
                      Wat nu telt. Groei, werkdruk en loopbaanperspectief vragen nu één duidelijke eerste managementroute.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .hero-motion-dashboard[data-motion-state='pending'] .motion-copy-block,
        .hero-motion-dashboard[data-motion-state='pending'] .motion-priority-row,
        .hero-motion-dashboard[data-motion-state='pending'] .motion-kpi-card,
        .hero-motion-dashboard[data-motion-state='pending'] .motion-chart-header,
        .hero-motion-dashboard[data-motion-state='pending'] .motion-axis,
        .hero-motion-dashboard[data-motion-state='pending'] .motion-summary-card {
          opacity: 0;
        }

        .hero-motion-dashboard[data-motion-state='pending'] .motion-copy-block {
          transform: translateY(18px);
        }

        .hero-motion-dashboard[data-motion-state='pending'] .motion-priority-row {
          transform: translateX(-18px);
        }

        .hero-motion-dashboard[data-motion-state='pending'] .motion-kpi-card,
        .hero-motion-dashboard[data-motion-state='pending'] .motion-summary-card {
          transform: translateY(18px) scale(0.985);
        }

        .hero-motion-dashboard[data-motion-state='pending'] .motion-chart-header,
        .hero-motion-dashboard[data-motion-state='pending'] .motion-axis {
          transform: translateY(14px);
        }

        .hero-motion-dashboard[data-motion-state='pending'] .motion-chart-area {
          opacity: 0;
          transform: scaleY(0.7);
          transform-origin: bottom;
        }

        .hero-motion-dashboard[data-motion-state='pending'] .motion-chart-line {
          stroke-dasharray: 1.02;
          stroke-dashoffset: 1.02;
        }

        .hero-motion-dashboard[data-motion-state='pending'] .motion-chart-dot {
          opacity: 0;
          transform: scale(0.65);
          transform-origin: center;
        }

        .hero-motion-dashboard[data-motion-state='play'] .motion-copy-block,
        .hero-motion-dashboard[data-motion-state='play'] .motion-priority-row,
        .hero-motion-dashboard[data-motion-state='play'] .motion-kpi-card,
        .hero-motion-dashboard[data-motion-state='play'] .motion-chart-header,
        .hero-motion-dashboard[data-motion-state='play'] .motion-axis,
        .hero-motion-dashboard[data-motion-state='play'] .motion-summary-card {
          opacity: 0;
          animation: heroFadeUp 0.48s cubic-bezier(0.2, 0.8, 0.2, 1) var(--motion-delay) forwards;
        }

        .hero-motion-dashboard[data-motion-state='play'] .motion-priority-row {
          animation-name: heroSlideRight;
        }

        .hero-motion-dashboard[data-motion-state='play'] .motion-kpi-card,
        .hero-motion-dashboard[data-motion-state='play'] .motion-summary-card {
          animation-name: heroCardLift;
        }

        .hero-motion-dashboard[data-motion-state='play'] .motion-chart-area {
          opacity: 0;
          transform-origin: bottom;
          animation: heroAreaReveal 0.72s cubic-bezier(0.2, 0.8, 0.2, 1) var(--motion-delay) forwards;
        }

        .hero-motion-dashboard[data-motion-state='play'] .motion-chart-line {
          stroke-dasharray: 1.02;
          stroke-dashoffset: 1.02;
          animation: heroLineDraw 1.05s cubic-bezier(0.24, 0.76, 0.2, 1) var(--motion-delay) forwards;
        }

        .hero-motion-dashboard[data-motion-state='play'] .motion-chart-dot {
          opacity: 0;
          transform-origin: center;
          animation: heroDotReveal 0.34s cubic-bezier(0.24, 0.76, 0.2, 1) var(--motion-delay) forwards;
        }

        @keyframes heroFadeUp {
          from {
            opacity: 0;
            transform: translateY(18px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes heroSlideRight {
          from {
            opacity: 0;
            transform: translateX(-18px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes heroCardLift {
          from {
            opacity: 0;
            transform: translateY(18px) scale(0.985);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        @keyframes heroAreaReveal {
          from {
            opacity: 0;
            transform: scaleY(0.7);
          }
          to {
            opacity: 1;
            transform: scaleY(1);
          }
        }

        @keyframes heroLineDraw {
          from {
            stroke-dashoffset: 1.02;
          }
          to {
            stroke-dashoffset: 0;
          }
        }

        @keyframes heroDotReveal {
          from {
            opacity: 0;
            transform: scale(0.65);
          }
          70% {
            opacity: 1;
            transform: scale(1.06);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
      `}</style>
    </div>
  )
}

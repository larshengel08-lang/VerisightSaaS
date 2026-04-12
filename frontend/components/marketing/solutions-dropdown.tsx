'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'

const solutions = [
  {
    href: '/',
    label: 'ExitScan',
    description: 'Uitstroompatronen zichtbaar maken',
    available: true,
  },
  {
    href: '/oplossingen/retentiescan',
    label: 'Retentiescan',
    description: 'Vertrekrisico per medewerker inzichtelijk',
    available: false,
  },
  {
    href: '/oplossingen/mto',
    label: 'Medewerkerstevredenheidsonderzoek',
    description: 'Brede tevredenheidsmeting voor je team',
    available: false,
  },
  {
    href: '/oplossingen/pulse',
    label: 'Pulse',
    description: 'Korte, frequente peilingen tussen teams',
    available: false,
  },
  {
    href: '/oplossingen/teamscan',
    label: 'Teamscan',
    description: 'Samenwerking en dynamiek per team meten',
    available: false,
  },
  {
    href: '/oplossingen/leadership-scan',
    label: 'Leadership scan',
    description: 'Leiderschapsstijl en -effectiviteit in beeld',
    available: false,
  },
  {
    href: '/oplossingen/customer-feedback',
    label: 'Customer feedback',
    description: 'Klantfeedback structureel verzamelen',
    available: false,
  },
]

export function SolutionsDropdown() {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  // Close on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        onMouseEnter={() => setOpen(true)}
        className="flex items-center gap-1 text-sm font-medium text-slate-600 transition-colors hover:text-slate-950"
        aria-expanded={open}
        aria-haspopup="true"
      >
        Oplossingen
        <svg
          className={`h-3.5 w-3.5 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
          viewBox="0 0 16 16"
          fill="currentColor"
          aria-hidden="true"
        >
          <path d="M4.22 6.22a.75.75 0 0 1 1.06 0L8 8.94l2.72-2.72a.75.75 0 1 1 1.06 1.06l-3.25 3.25a.75.75 0 0 1-1.06 0L4.22 7.28a.75.75 0 0 1 0-1.06Z" />
        </svg>
      </button>

      {open && (
        <div
          onMouseLeave={() => setOpen(false)}
          className="absolute left-1/2 top-full z-50 mt-3 w-72 -translate-x-1/2 rounded-2xl border border-slate-200 bg-white shadow-lg ring-1 ring-black/5"
        >
          {/* Arrow */}
          <div className="absolute -top-1.5 left-1/2 h-3 w-3 -translate-x-1/2 rotate-45 rounded-sm border-l border-t border-slate-200 bg-white" />

          <div className="p-2">
            {solutions.map((s) => (
              <Link
                key={s.href}
                href={s.href}
                onClick={() => setOpen(false)}
                className="group flex items-start gap-3 rounded-xl px-3 py-2.5 transition-colors hover:bg-slate-50"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-slate-900 group-hover:text-blue-600 transition-colors">
                      {s.label}
                    </span>
                    {s.available ? (
                      <span className="inline-flex items-center rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
                        Beschikbaar
                      </span>
                    ) : (
                      <span className="inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-500">
                        Binnenkort
                      </span>
                    )}
                  </div>
                  <p className="mt-0.5 text-xs text-slate-500 leading-snug">{s.description}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

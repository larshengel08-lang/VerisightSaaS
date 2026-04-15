'use client'

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { CORE_MARKETING_PRODUCTS, PORTFOLIO_ROUTE_MARKETING_PRODUCTS } from '@/lib/marketing-products'

export function SolutionsDropdown() {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClick(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        onMouseEnter={() => setOpen(true)}
        className="flex items-center gap-1 text-sm font-medium text-slate-600 transition-colors hover:text-slate-950"
        aria-expanded={open}
        aria-haspopup="true"
      >
        Producten
        <svg
          className={`h-3.5 w-3.5 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
          viewBox="0 0 16 16"
          fill="currentColor"
          aria-hidden="true"
        >
          <path d="M4.22 6.22a.75.75 0 0 1 1.06 0L8 8.94l2.72-2.72a.75.75 0 1 1 1.06 1.06l-3.25 3.25a.75.75 0 0 1-1.06 0L4.22 7.28a.75.75 0 0 1 0-1.06Z" />
        </svg>
      </button>

      {open ? (
        <div
          onMouseLeave={() => setOpen(false)}
          className="absolute left-1/2 top-full z-50 mt-3 w-[21rem] -translate-x-1/2 rounded-2xl border border-slate-200 bg-white shadow-lg ring-1 ring-black/5"
        >
          <div className="absolute -top-1.5 left-1/2 h-3 w-3 -translate-x-1/2 rotate-45 rounded-sm border-l border-t border-slate-200 bg-white" />

          <div className="p-2">
            <div className="px-3 pb-2 pt-1">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">Kernproducten</p>
            </div>
            {CORE_MARKETING_PRODUCTS.map((product) => (
              <Link
                key={product.href}
                href={product.href}
                onClick={() => setOpen(false)}
                className="group flex items-start gap-3 rounded-xl px-3 py-2.5 transition-colors hover:bg-slate-50"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-slate-900 transition-colors group-hover:text-blue-600">
                      {product.label}
                    </span>
                    <span className="inline-flex items-center rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
                      Kern
                    </span>
                  </div>
                  <p className="mt-0.5 text-xs leading-snug text-slate-500">{product.description}</p>
                </div>
              </Link>
            ))}

            <div className="px-3 pb-2 pt-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">Portfolioroute</p>
            </div>
            {PORTFOLIO_ROUTE_MARKETING_PRODUCTS.map((product) => (
              <Link
                key={product.href}
                href={product.href}
                onClick={() => setOpen(false)}
                className="group flex items-start gap-3 rounded-xl px-3 py-2.5 transition-colors hover:bg-slate-50"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-slate-900 transition-colors group-hover:text-blue-600">
                      {product.label}
                    </span>
                    <span className="inline-flex items-center rounded-full bg-sky-50 px-2 py-0.5 text-[10px] font-semibold text-sky-700">
                      Route
                    </span>
                  </div>
                  <p className="mt-0.5 text-xs leading-snug text-slate-500">{product.description}</p>
                </div>
              </Link>
            ))}

            <div className="mx-2 mt-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-3">
              <Link
                href="/producten"
                onClick={() => setOpen(false)}
                className="text-sm font-semibold text-slate-900 transition-colors hover:text-blue-600"
              >
                Bekijk de kernproducten en portfolioroute -&gt;
              </Link>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}

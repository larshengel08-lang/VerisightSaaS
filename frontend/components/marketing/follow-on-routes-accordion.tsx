'use client'

import Link from 'next/link'
import { useState } from 'react'
import type { FollowOnRouteContent } from '@/lib/follow-on-route-content'

interface FollowOnRoutesAccordionProps {
  routes: readonly FollowOnRouteContent[]
}

export function FollowOnRoutesAccordion({ routes }: FollowOnRoutesAccordionProps) {
  const [openSlug, setOpenSlug] = useState<string | null>(null)

  return (
    <div className="rounded-[1.5rem] border border-[var(--border)] bg-white/78">
      {routes.map((route, index) => {
        const isOpen = openSlug === route.slug
        const panelId = `follow-on-route-panel-${route.slug}`

        return (
          <div key={route.slug} className={index > 0 ? 'border-t border-[var(--border)]' : ''}>
            <div className="grid gap-4 px-6 py-5 md:grid-cols-[minmax(0,16rem)_minmax(0,1fr)_auto] md:items-center md:px-8">
              <button
                type="button"
                aria-expanded={isOpen}
                aria-controls={panelId}
                onClick={() => setOpenSlug((current) => (current === route.slug ? null : route.slug))}
                className="group grid gap-2 text-left md:col-span-2 md:grid-cols-[minmax(0,16rem)_minmax(0,1fr)] md:items-center md:gap-6"
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`inline-flex h-8 w-8 items-center justify-center rounded-full border border-[var(--border)] text-xs font-semibold text-[var(--petrol)] transition-transform ${
                      isOpen ? 'rotate-45' : ''
                    }`}
                  >
                    +
                  </span>
                  <span className="text-lg font-semibold text-[var(--ink)] transition-colors group-hover:text-[var(--petrol)]">
                    {route.title}
                  </span>
                </div>
                <span className="text-sm leading-7 text-[var(--text)]">{route.rowSummary}</span>
              </button>

              <div className="flex items-center justify-between gap-4 md:justify-end">
                <button
                  type="button"
                  onClick={() => setOpenSlug((current) => (current === route.slug ? null : route.slug))}
                  className="text-sm font-semibold text-[var(--petrol)] transition-colors hover:text-[var(--ink)]"
                >
                  {isOpen ? 'Verberg samenvatting' : 'Lees samenvatting'}
                </button>
                <Link
                  href={route.detailHref}
                  className="text-sm font-semibold text-[var(--ink)] transition-colors hover:text-[var(--petrol)]"
                >
                  Bekijk route
                </Link>
              </div>
            </div>

            {isOpen ? (
              <div id={panelId} className="border-t border-[var(--border)] bg-[rgba(255,255,255,0.52)] px-6 py-4 md:px-8 md:py-5">
                <div className="grid gap-5 xl:grid-cols-[minmax(0,0.95fr)_minmax(0,1.1fr)] xl:gap-8">
                  <p className="text-sm leading-7 text-[var(--text)]">{route.positioning}</p>

                  <div>
                    <p className="text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-[var(--petrol)]">
                      Wanneer logisch
                    </p>
                    <ul className="mt-3 space-y-2.5">
                      {route.whenLogical.map((item) => (
                        <li key={item} className="flex items-start gap-3 text-sm leading-7 text-[var(--text)]">
                          <span className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-[var(--petrol)]" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        )
      })}
    </div>
  )
}

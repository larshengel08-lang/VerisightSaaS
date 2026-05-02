'use client'

import Link from 'next/link'
import { useState } from 'react'
import { buildContactHref } from '@/lib/contact-funnel'
import type { FollowOnRouteContent } from '@/lib/follow-on-route-content'

interface FollowOnRoutesAccordionProps {
  routes: readonly FollowOnRouteContent[]
}

export function FollowOnRoutesAccordion({ routes }: FollowOnRoutesAccordionProps) {
  const [openSlug, setOpenSlug] = useState<string | null>(routes[0]?.slug ?? null)

  return (
    <div className="rounded-[1.7rem] border border-[var(--border)] bg-white/84">
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
              <div id={panelId} className="border-t border-[var(--border)] px-6 py-6 md:px-8">
                <div className="grid gap-6 xl:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(15rem,0.9fr)]">
                  <div className="space-y-4">
                    <div>
                      <p className="text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-[var(--petrol)]">
                        Korte positionering
                      </p>
                      <p className="mt-3 text-sm leading-7 text-[var(--text)]">{route.positioning}</p>
                    </div>
                    <div className="rounded-[1.15rem] border border-[var(--border)] bg-[rgba(247,245,241,0.78)] px-4 py-4">
                      <p className="text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-[var(--petrol)]">
                        Waarom later
                      </p>
                      <p className="mt-3 text-sm leading-7 text-[var(--text)]">{route.whyLater}</p>
                    </div>
                  </div>

                  <div>
                    <p className="text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-[var(--petrol)]">
                      Wanneer logisch
                    </p>
                    <ul className="mt-3 space-y-3">
                      {route.whenLogical.map((item) => (
                        <li key={item} className="flex items-start gap-3 text-sm leading-7 text-[var(--text)]">
                          <span className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-[var(--petrol)]" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <p className="text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-[var(--petrol)]">
                      Wat u krijgt
                    </p>
                    <ul className="mt-3 space-y-3">
                      {route.whatYouGet.map((item) => (
                        <li key={item} className="flex items-start gap-3 text-sm leading-7 text-[var(--text)]">
                          <span className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-[var(--petrol)]" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="flex h-full flex-col rounded-[1.15rem] border border-[var(--border)] bg-white px-5 py-5">
                    <p className="text-sm leading-7 text-[var(--text)]">
                      Toets eerst of deze bounded route nu echt de volgende logische stap is.
                    </p>
                    <div className="mt-5 space-y-3">
                      <Link
                        href={buildContactHref({
                          routeInterest: route.routeInterest,
                          ctaSource: route.ctaSource,
                        })}
                        className="inline-flex w-full items-center justify-center rounded-full bg-[#3C8D8A] px-5 py-3 text-sm font-semibold text-white shadow-[0_14px_34px_rgba(60,141,138,0.16)] transition-all hover:-translate-y-0.5 hover:bg-[#2d6e6b]"
                      >
                        Toets of dit de volgende logische route is
                      </Link>
                      <Link
                        href={route.detailHref}
                        className="inline-flex w-full items-center justify-center rounded-full border border-[var(--border)] bg-white px-5 py-3 text-sm font-semibold text-[var(--ink)] transition-colors hover:border-[var(--petrol)] hover:text-[var(--petrol)]"
                      >
                        Bekijk route
                      </Link>
                    </div>
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

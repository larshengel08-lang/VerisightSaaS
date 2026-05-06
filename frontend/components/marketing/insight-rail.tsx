import React from 'react'
import Link from 'next/link'
import type { InsightPost } from '@/lib/insights'
import { InsightCard } from './insight-card'

type InsightRailProps = {
  posts: InsightPost[]
  title: string
  eyebrow?: string
  intro?: string
  viewAllHref?: string
  viewAllLabel?: string
}

export function InsightRail({
  posts,
  title,
  eyebrow = 'Inzichten',
  intro,
  viewAllHref,
  viewAllLabel,
}: InsightRailProps) {
  if (posts.length === 0) {
    return null
  }

  return (
    <section className="border-y border-[var(--border)] bg-[#F7F5F1]">
      <div className="marketing-shell py-16 md:py-20">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div className="max-w-3xl">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">{eyebrow}</p>
            <h2 className="mt-4 text-[clamp(2.2rem,4vw,3.5rem)] leading-[0.98] text-[var(--ink)]">{title}</h2>
            {intro ? <p className="mt-4 max-w-2xl text-base leading-8 text-[var(--text)]">{intro}</p> : null}
          </div>

          {viewAllHref && viewAllLabel ? (
            <Link
              href={viewAllHref}
              className="inline-flex items-center rounded-full border border-[var(--border)] bg-white px-5 py-3 text-sm font-semibold text-[var(--ink)] transition-colors hover:border-[var(--ink)]"
            >
              {viewAllLabel}
            </Link>
          ) : null}
        </div>

        <div className="mt-10 grid gap-5 lg:grid-cols-3">
          {posts.map((post) => (
            <InsightCard key={post.slug} post={post} />
          ))}
        </div>
      </div>
    </section>
  )
}

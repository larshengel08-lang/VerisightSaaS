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
    <section className="border-y border-[var(--border)] bg-[var(--bg-alt)]">
      <div className="marketing-shell py-16 md:py-20">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div className="max-w-3xl">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--meta)]">{eyebrow}</p>
            <h2 className="mt-4 font-display text-[clamp(2.15rem,3.8vw,3.4rem)] leading-[1.02] text-[var(--ink)]">
              {title}
            </h2>
            {intro ? <p className="mt-4 max-w-2xl text-base leading-[1.75] text-[var(--muted)]">{intro}</p> : null}
          </div>

          {viewAllHref && viewAllLabel ? (
            <Link
              href={viewAllHref}
              className="marketing-button-secondary"
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

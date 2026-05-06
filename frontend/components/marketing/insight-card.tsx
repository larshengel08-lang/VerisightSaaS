import React from 'react'
import Link from 'next/link'
import type { InsightPost } from '@/lib/insights'

export function toStableInsightDate(date: string) {
  const dateOnlyMatch = /^(\d{4})-(\d{2})-(\d{2})$/.exec(date)
  if (dateOnlyMatch) {
    const [, year, month, day] = dateOnlyMatch
    return new Date(Date.UTC(Number(year), Number(month) - 1, Number(day)))
  }

  return new Date(date)
}

export function formatInsightDateLabel(date: string) {
  return new Intl.DateTimeFormat('nl-NL', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(toStableInsightDate(date))
}

export function InsightCard({ post }: { post: InsightPost }) {
  const publishedLabel = formatInsightDateLabel(post.publishedAt ?? post.generatedAt)

  return (
    <article className="flex h-full flex-col rounded-[28px] border border-[var(--border)] bg-white p-6 shadow-[0_18px_40px_rgba(19,32,51,0.05)]">
      <div className="flex items-center justify-between gap-4 text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
        <span>{post.category}</span>
        <span>{post.readingMinutes} min leestijd</span>
      </div>

      <h3 className="mt-5 text-[clamp(1.5rem,2vw,1.9rem)] leading-[1.05] text-[var(--ink)]">
        {post.title}
      </h3>

      <p className="mt-4 flex-1 text-sm leading-7 text-[var(--text)]">{post.metaDescription}</p>

      <div className="mt-6 flex items-center justify-between gap-4 border-t border-[var(--border)] pt-4">
        <span className="text-sm text-[var(--muted)]">{publishedLabel}</span>
        <Link
          href={`/inzichten/${post.slug}`}
          className="inline-flex items-center rounded-full border border-[var(--border)] px-4 py-2 text-sm font-semibold text-[var(--ink)] transition-colors hover:border-[var(--ink)]"
        >
          Lees inzicht
        </Link>
      </div>
    </article>
  )
}

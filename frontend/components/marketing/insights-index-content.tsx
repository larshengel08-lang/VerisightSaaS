import React from 'react'
import Link from 'next/link'
import type { InsightPost } from '@/lib/insights'
import { formatInsightDateLabel } from './insight-card'
import { InsightRail } from './insight-rail'

export function InsightsIndexContent({ posts }: { posts: InsightPost[] }) {
  const [featured, ...rest] = posts

  if (!featured) {
    return (
      <section className="border-b border-[var(--border)] bg-white">
        <div className="marketing-shell py-16 md:py-20">
          <div className="max-w-3xl rounded-[32px] border border-[var(--border)] bg-[#F7F5F1] p-8 md:p-10">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">Inzichten</p>
            <h2 className="mt-4 text-[clamp(2.1rem,4vw,3.2rem)] leading-[0.98] text-[var(--ink)]">
              Nog geen inzichten gepubliceerd.
            </h2>
            <p className="mt-5 max-w-2xl text-base leading-8 text-[var(--text)]">
              Deze plek wordt de publieke hub voor praktische artikelen over onboarding, behoud, uitstroom en de
              managementvragen die daarachter zitten.
            </p>
          </div>
        </div>
      </section>
    )
  }

  const featuredDate = formatInsightDateLabel(featured.publishedAt ?? featured.generatedAt)

  return (
    <>
      <section className="border-b border-[var(--border)] bg-white">
        <div className="marketing-shell py-16 md:py-20">
          <div className="grid gap-10 xl:grid-cols-[minmax(0,1.08fr)_minmax(0,0.92fr)] xl:items-start">
            <article className="rounded-[36px] border border-[var(--border)] bg-[#F7F5F1] p-8 md:p-10">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
                Uitgelicht inzicht
              </p>
              <h2 className="mt-5 text-[clamp(2.4rem,4.2vw,4.25rem)] leading-[0.95] text-[var(--ink)]">
                {featured.title}
              </h2>
              <p className="mt-5 max-w-2xl text-base leading-8 text-[var(--text)]">{featured.metaDescription}</p>
              <div className="mt-8 flex flex-wrap items-center gap-4 text-sm text-[var(--muted)]">
                <span>{featured.category}</span>
                <span>{featuredDate}</span>
                <span>{featured.readingMinutes} min leestijd</span>
              </div>
              <div className="mt-8 flex flex-wrap gap-4">
                <Link
                  href={`/inzichten/${featured.slug}`}
                  className="inline-flex items-center rounded-full bg-[#132033] px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#1c2a3d]"
                >
                  Lees dit inzicht
                </Link>
                <Link
                  href={featured.ctaTarget}
                  className="inline-flex items-center rounded-full border border-[var(--border)] bg-white px-6 py-3 text-sm font-semibold text-[var(--ink)] transition-colors hover:border-[var(--ink)]"
                >
                  {featured.ctaLabel}
                </Link>
              </div>
            </article>

            <div className="grid gap-5">
              <div className="rounded-[30px] border border-[var(--border)] bg-white p-7">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
                  Waarom deze hub
                </p>
                <p className="mt-4 text-base leading-8 text-[var(--text)]">
                  Geen newsroom of contentbibliotheek, maar een compacte publieke plek voor artikelen die HR en
                  management helpen begrijpen wat eerst telt en waar Verisight ondersteunend relevant wordt.
                </p>
              </div>
              <div className="rounded-[30px] border border-[var(--border)] bg-white p-7">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
                  Typische thema&apos;s
                </p>
                <div className="mt-4 flex flex-wrap gap-3">
                  {['Onboarding', 'Behoud', 'Uitstroom', 'Prioritering'].map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full border border-[var(--border)] bg-[#F7F5F1] px-4 py-2 text-sm text-[var(--ink)]"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {rest.length > 0 ? (
        <InsightRail
          posts={rest}
          title="Laatste inzichten"
          intro="Nieuwe artikelen blijven bewust dicht op de commerciele kern: concrete managementvragen, heldere duiding en een zachte route naar vervolg."
        />
      ) : null}
    </>
  )
}

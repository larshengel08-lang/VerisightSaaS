import React from 'react'
import Link from 'next/link'
import type { InsightPost } from '@/lib/insights'
import { formatInsightDateLabel } from './insight-card'

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
          <div className="grid gap-8 xl:grid-cols-[minmax(0,1.18fr)_minmax(0,0.82fr)] xl:items-start">
            <article className="rounded-[36px] border border-[var(--border)] bg-[#F7F5F1] p-8 md:p-10">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
                Uitgelicht inzicht
              </p>
              <h2 className="mt-5 max-w-4xl text-[clamp(2.4rem,4.2vw,4.25rem)] leading-[0.95] text-[var(--ink)]">
                {featured.title}
              </h2>
              <p className="mt-5 max-w-2xl text-base leading-8 text-[var(--text)]">{featured.metaDescription}</p>
              <div className="mt-8 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-[var(--muted)]">
                <span className="text-[11px] font-semibold uppercase tracking-[0.16em]">{featured.category}</span>
                <span>{featuredDate}</span>
                <span>{featured.readingMinutes} min leestijd</span>
              </div>
              <div className="mt-8 flex flex-wrap gap-4">
                <Link
                  href={`/inzichten/${featured.slug}`}
                  className="inline-flex items-center rounded-full bg-[#C96A4B] px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#B85D41]"
                >
                  Lees artikel
                </Link>
                <Link
                  href={featured.ctaTarget}
                  className="inline-flex items-center rounded-full border border-[var(--border)] bg-white px-6 py-3 text-sm font-semibold text-[var(--ink)] transition-colors hover:border-[var(--ink)]"
                >
                  {featured.ctaLabel}
                </Link>
              </div>
            </article>

            <div className="rounded-[30px] border border-[var(--border)] bg-white p-7">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
                Waarom deze pagina er is
              </p>
              <div className="mt-4 space-y-4 text-sm leading-7 text-[var(--text)]">
                <p>
                  Deze inzichtenbibliotheek is bedoeld voor scherpere duiding, niet als los kenniscentrum met een eigen
                  stijl of agenda.
                </p>
                <p>
                  U leest hier compacte artikelen die helpen vragen rond vertrek, behoud, prioriteiten en opvolging
                  helderder te maken.
                </p>
                <p>
                  Daardoor blijft ook deze pagina dicht bij dezelfde Verisight-wereld: eerst begrijpen wat speelt,
                  daarna bepalen wat eerst telt.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {rest.length > 0 ? (
        <section className="border-b border-[var(--border)] bg-[#F7F5F1]">
          <div className="marketing-shell py-16 md:py-20">
            <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
              <div className="max-w-3xl">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
                  Meer inzichten
                </p>
                <h2 className="mt-4 text-[clamp(2.1rem,3.6vw,3.2rem)] leading-[0.98] text-[var(--ink)]">
                  Verdere duiding, rustiger geordend
                </h2>
                <p className="mt-4 max-w-2xl text-base leading-8 text-[var(--text)]">
                  De overige artikelen volgen ondersteunend. Compact, inhoudelijk en duidelijk verbonden aan dezelfde
                  vragen rond vertrek, behoud, prioritering en eerste opvolging.
                </p>
              </div>

              <Link
                href="/aanpak"
                className="inline-flex items-center rounded-full border border-[var(--border)] bg-white px-5 py-3 text-sm font-semibold text-[var(--ink)] transition-colors hover:border-[var(--ink)]"
              >
                Bekijk hoe Verisight werkt
              </Link>
            </div>

            <div className="mt-10 overflow-hidden rounded-[32px] border border-[var(--border)] bg-white">
              {rest.map((post, index) => {
                const publishedLabel = formatInsightDateLabel(post.publishedAt ?? post.generatedAt)

                return (
                  <article
                    key={post.slug}
                    className={`grid gap-5 px-6 py-6 md:grid-cols-[minmax(0,1fr)_auto] md:items-center md:px-8 ${
                      index > 0 ? 'border-t border-[var(--border)]' : ''
                    }`}
                  >
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">
                        <span>{post.category}</span>
                        <span className="normal-case tracking-normal text-sm font-normal">{publishedLabel}</span>
                        <span className="normal-case tracking-normal text-sm font-normal">
                          {post.readingMinutes} min leestijd
                        </span>
                      </div>
                      <h3 className="mt-3 text-[clamp(1.45rem,2vw,1.95rem)] leading-[1.08] text-[var(--ink)]">
                        {post.title}
                      </h3>
                      <p className="mt-3 max-w-3xl text-sm leading-7 text-[var(--text)]">{post.metaDescription}</p>
                    </div>

                    <div className="flex flex-wrap gap-3 md:justify-end">
                      <Link
                        href={`/inzichten/${post.slug}`}
                        className="inline-flex items-center rounded-full border border-[var(--border)] bg-[#F7F5F1] px-5 py-3 text-sm font-semibold text-[var(--ink)] transition-colors hover:border-[var(--ink)]"
                      >
                        Lees artikel
                      </Link>
                    </div>
                  </article>
                )
              })}
            </div>
          </div>
        </section>
      ) : null}
    </>
  )
}

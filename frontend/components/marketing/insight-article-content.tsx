import Link from 'next/link'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import type { InsightPost } from '@/lib/insights'
import { InsightRail } from './insight-rail'

type InsightArticleContentProps = {
  post: InsightPost
  relatedPosts: InsightPost[]
}

export function InsightArticleContent({ post, relatedPosts }: InsightArticleContentProps) {
  const relatedSolutionHref = `/oplossingen/${post.relatedSolutionSlug}`

  return (
    <>
      <section className="border-b border-[var(--border)] bg-white">
        <div className="marketing-shell py-16 md:py-20">
          <div className="grid gap-10 xl:grid-cols-[minmax(0,1fr)_300px] xl:items-start">
            <article className="min-w-0 rounded-[8px] border border-[var(--border)] bg-white p-7 md:p-10">
              <div className="mx-auto max-w-[42rem]">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    h1: ({ ...props }) => (
                      <h1 className="mt-10 font-display text-[clamp(2.2rem,4vw,3.5rem)] leading-[1.02] text-[var(--ink)] first:mt-0" {...props} />
                    ),
                    h2: ({ ...props }) => (
                      <h2 className="mt-12 font-display text-[clamp(1.9rem,3vw,2.7rem)] leading-[1.08] text-[var(--ink)]" {...props} />
                    ),
                    h3: ({ ...props }) => (
                      <h3 className="mt-8 font-display text-[clamp(1.4rem,2.1vw,1.85rem)] leading-[1.12] text-[var(--ink)]" {...props} />
                    ),
                    p: ({ ...props }) => <p className="mt-5 text-[1.02rem] leading-[1.85] text-[var(--text)]" {...props} />,
                    ul: ({ ...props }) => <ul className="mt-5 space-y-3 pl-5 text-[1.02rem] leading-[1.85] text-[var(--text)]" {...props} />,
                    ol: ({ ...props }) => <ol className="mt-5 space-y-3 pl-5 text-[1.02rem] leading-[1.85] text-[var(--text)]" {...props} />,
                    li: ({ ...props }) => <li className="pl-1" {...props} />,
                    blockquote: ({ ...props }) => (
                      <blockquote
                        className="mt-8 border-l-2 border-[var(--accent)] pl-5 font-display text-[1.18rem] italic leading-[1.65] text-[var(--ink)]"
                        {...props}
                      />
                    ),
                    a: ({ ...props }) => (
                      <a className="font-semibold text-[var(--ink)] underline decoration-[var(--border)] underline-offset-4 transition-colors hover:text-[var(--accent)]" {...props} />
                    ),
                    strong: ({ ...props }) => <strong className="font-semibold text-[var(--ink)]" {...props} />,
                  }}
                >
                  {post.bodyMarkdown}
                </ReactMarkdown>
              </div>
            </article>

            <aside className="space-y-5 xl:sticky xl:top-8">
              <div className="rounded-[8px] border border-[var(--border)] bg-[var(--surface-low)] p-6">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--meta)]">
                  Vervolgroute
                </p>
                <p className="mt-4 text-base leading-[1.75] text-[var(--muted)]">
                  {post.ctaType === 'knowledge'
                    ? 'Lees verder in de bredere route die bij dit onderwerp past.'
                    : 'Gebruik dit inzicht als startpunt voor een concreet vervolggesprek.'}
                </p>
                <Link
                  href={post.ctaTarget}
                  className="marketing-button-primary mt-6"
                >
                  {post.ctaLabel}
                </Link>
              </div>

              <div className="rounded-[8px] border border-[var(--border)] bg-white p-6">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--meta)]">
                  Gerelateerde oplossingspagina
                </p>
                <p className="mt-4 text-base leading-[1.75] text-[var(--muted)]">
                  Wilt u dit onderwerp vertalen naar een concretere managementvraag? Bekijk dan de bijpassende
                  oplossingsroute.
                </p>
                <Link
                  href={relatedSolutionHref}
                  className="marketing-button-secondary mt-6"
                >
                  Bekijk de oplossingsroute
                </Link>
              </div>

              <div className="rounded-[8px] border border-[var(--border)] bg-white p-6">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--meta)]">
                  Terug naar overzicht
                </p>
                <Link
                  href="/inzichten"
                  className="marketing-button-secondary mt-4"
                >
                  Bekijk alle inzichten
                </Link>
              </div>
            </aside>
          </div>
        </div>
      </section>

      <InsightRail
        posts={relatedPosts}
        title="Meer inzichten"
        intro="Lees verder in dezelfde marketinghub met artikelen die aangrenzende HR- en managementvragen verdiepen."
        viewAllHref="/inzichten"
        viewAllLabel="Naar het overzicht"
      />
    </>
  )
}

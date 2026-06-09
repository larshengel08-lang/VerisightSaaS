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
          <div className="grid gap-10 xl:grid-cols-[minmax(0,1fr)_320px] xl:items-start">
            <article className="min-w-0 rounded-[32px] border border-[var(--border)] bg-[#fffdf9] p-7 md:p-10">
              <div className="max-w-none">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    h1: ({ ...props }) => (
                      <h1 className="mt-10 text-[clamp(2.2rem,4vw,3.5rem)] leading-[0.98] text-[var(--ink)] first:mt-0" {...props} />
                    ),
                    h2: ({ ...props }) => (
                      <h2 className="mt-10 text-[clamp(1.9rem,3vw,2.7rem)] leading-[1.02] text-[var(--ink)]" {...props} />
                    ),
                    h3: ({ ...props }) => (
                      <h3 className="mt-8 text-[clamp(1.45rem,2.2vw,1.9rem)] leading-[1.08] text-[var(--ink)]" {...props} />
                    ),
                    p: ({ ...props }) => <p className="mt-5 text-base leading-8 text-[var(--text)]" {...props} />,
                    ul: ({ ...props }) => <ul className="mt-5 space-y-3 pl-5 text-base leading-8 text-[var(--text)]" {...props} />,
                    ol: ({ ...props }) => <ol className="mt-5 space-y-3 pl-5 text-base leading-8 text-[var(--text)]" {...props} />,
                    li: ({ ...props }) => <li className="pl-1" {...props} />,
                    blockquote: ({ ...props }) => (
                      <blockquote
                        className="mt-6 border-l-2 border-[var(--border)] pl-5 text-base italic leading-8 text-[var(--text)]"
                        {...props}
                      />
                    ),
                    a: ({ ...props }) => (
                      <a className="font-semibold text-[var(--ink)] underline decoration-[var(--border)] underline-offset-4" {...props} />
                    ),
                    strong: ({ ...props }) => <strong className="font-semibold text-[var(--ink)]" {...props} />,
                  }}
                >
                  {post.bodyMarkdown}
                </ReactMarkdown>
              </div>
            </article>

            <aside className="space-y-5 xl:sticky xl:top-8">
              <div className="rounded-[30px] border border-[var(--border)] bg-[#F7F5F1] p-6">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
                  Vervolgroute
                </p>
                <p className="mt-4 text-base leading-8 text-[var(--text)]">
                  {post.ctaType === 'knowledge'
                    ? 'Lees verder in de bredere route die bij dit onderwerp past.'
                    : 'Gebruik dit inzicht als startpunt voor een concreet vervolggesprek.'}
                </p>
                <Link
                  href={post.ctaTarget}
                  className="mt-6 inline-flex items-center rounded-full bg-[#132033] px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#1c2a3d]"
                >
                  {post.ctaLabel}
                </Link>
              </div>

              <div className="rounded-[30px] border border-[var(--border)] bg-white p-6">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
                  Gerelateerde oplossingspagina
                </p>
                <p className="mt-4 text-base leading-8 text-[var(--text)]">
                  Wilt u dit onderwerp vertalen naar een concretere managementvraag? Bekijk dan de bijpassende
                  oplossingsroute.
                </p>
                <Link
                  href={relatedSolutionHref}
                  className="mt-6 inline-flex items-center rounded-full border border-[var(--border)] px-5 py-3 text-sm font-semibold text-[var(--ink)] transition-colors hover:border-[var(--ink)]"
                >
                  Bekijk de oplossingsroute
                </Link>
              </div>

              <div className="rounded-[30px] border border-[var(--border)] bg-white p-6">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
                  Terug naar overzicht
                </p>
                <Link
                  href="/inzichten"
                  className="mt-4 inline-flex items-center rounded-full border border-[var(--border)] px-5 py-3 text-sm font-semibold text-[var(--ink)] transition-colors hover:border-[var(--ink)]"
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

import React from 'react'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { InsightArticleContent } from '@/components/marketing/insight-article-content'
import { formatInsightDateLabel } from '@/components/marketing/insight-card'
import { MarketingPageShell } from '@/components/marketing/marketing-page-shell'
import { marketingPrimaryCta } from '@/components/marketing/site-content'
import { getAllInsights, getInsightBySlug } from '@/lib/insights'

type Props = { params: Promise<{ slug: string }> }

export async function generateStaticParams() {
  return getAllInsights().map((post) => ({ slug: post.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const post = getInsightBySlug(slug)

  if (!post) {
    return {}
  }

  const title = `${post.title} | Inzichten`
  const description = post.metaDescription
  const canonical = `/inzichten/${post.slug}`

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      type: 'article',
      title,
      description,
      url: `https://www.verisight.nl${canonical}`,
      images: ['/opengraph-image'],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: ['/opengraph-image'],
    },
  }
}

export default async function InsightArticlePage({ params }: Props) {
  const { slug } = await params
  const post = getInsightBySlug(slug)

  if (!post) notFound()

  const relatedPosts = getAllInsights()
    .filter((candidate) => candidate.slug !== post.slug)
    .slice(0, 3)

  const publishedLabel = formatInsightDateLabel(post.publishedAt ?? post.generatedAt)
  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.metaDescription,
    datePublished: post.publishedAt ?? post.generatedAt,
    dateModified: post.publishedAt ?? post.generatedAt,
    mainEntityOfPage: `https://www.verisight.nl/inzichten/${post.slug}`,
    author: {
      '@type': 'Organization',
      name: 'Loep',
    },
    publisher: {
      '@type': 'Organization',
      name: 'Loep',
    },
    articleSection: post.category,
    keywords: [post.focusKeyword, post.category],
    inLanguage: 'nl-NL',
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }} />
      <MarketingPageShell
        pageType="overview"
        ctaHref={marketingPrimaryCta.href}
        ctaLabel={marketingPrimaryCta.label}
        heroIntro={
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--meta)]">Inzichten</p>
            <h1 className="mt-4 max-w-[12ch] text-balance font-display text-[clamp(2.35rem,8.8vw,4.8rem)] leading-[1.03] text-[var(--ink)]">
              {post.title}
            </h1>
            <p className="mt-6 max-w-3xl text-lg leading-[1.8] text-[var(--muted)]">{post.metaDescription}</p>
          </div>
        }
        heroSupport={
          <div className="space-y-4 rounded-[8px] border border-[var(--border)] bg-[var(--surface-low)] p-6">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--meta)]">Artikelcontext</p>
            <div className="space-y-3 text-sm leading-[1.75] text-[var(--muted)]">
              <p>{post.category}</p>
              <p>{publishedLabel}</p>
              <p>{post.readingMinutes} min leestijd</p>
            </div>
            <a
              href={post.ctaTarget}
              className="marketing-button-secondary"
            >
              {post.ctaLabel}
            </a>
          </div>
        }
      >
        <InsightArticleContent post={post} relatedPosts={relatedPosts} />
      </MarketingPageShell>
    </>
  )
}


import fs from 'node:fs'
import path from 'node:path'
import matter from 'gray-matter'

export const INSIGHTS_DIR = path.join(process.cwd(), 'content', 'insights')

export type InsightCtaType = 'conversation' | 'knowledge' | 'soft_product' | 'diagnostic'

type InsightFrontmatter = {
  title: string
  slug: string
  metaDescription: string
  focusKeyword: string
  category: string
  ctaType: InsightCtaType
  ctaLabel: string
  ctaTarget: string
  relatedSolutionSlug: string
  generatedAt: string
  publishedAt?: string
}

export type InsightPost = InsightFrontmatter & {
  bodyMarkdown: string
  readingMinutes: number
}

const insightCtaTypes = new Set<InsightCtaType>(['conversation', 'knowledge', 'soft_product', 'diagnostic'])

function readRequiredString(data: Record<string, unknown>, key: keyof InsightFrontmatter) {
  const value = data[key]
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new Error(`Insight frontmatter field "${key}" is required.`)
  }

  return value.trim()
}

function readOptionalString(data: Record<string, unknown>, key: keyof InsightFrontmatter) {
  const value = data[key]
  if (value === undefined) {
    return undefined
  }

  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new Error(`Insight frontmatter field "${key}" must be a non-empty string when present.`)
  }

  return value.trim()
}

function validateDateString(key: 'generatedAt' | 'publishedAt', value: string) {
  const match = /^(\d{4})-(\d{2})-(\d{2})(?:T\d{2}:\d{2}(?::\d{2}(?:\.\d{1,3})?)?(?:Z|[+\-]\d{2}:\d{2})?)?$/.exec(
    value,
  )
  if (!match) {
    throw new Error(`Insight frontmatter field "${key}" must be a valid date string.`)
  }

  const [, yearPart, monthPart, dayPart] = match
  const year = Number(yearPart)
  const month = Number(monthPart)
  const day = Number(dayPart)
  const dateOnly = new Date(Date.UTC(year, month - 1, day))

  if (
    dateOnly.getUTCFullYear() !== year ||
    dateOnly.getUTCMonth() !== month - 1 ||
    dateOnly.getUTCDate() !== day
  ) {
    throw new Error(`Insight frontmatter field "${key}" must be a real calendar date.`)
  }

  if (Number.isNaN(new Date(value).getTime())) {
    throw new Error(`Insight frontmatter field "${key}" must be a valid date string.`)
  }

  return value
}

function parseInsightFrontmatter(data: Record<string, unknown>): InsightFrontmatter {
  const ctaType = readRequiredString(data, 'ctaType')
  const generatedAt = validateDateString('generatedAt', readRequiredString(data, 'generatedAt'))
  const publishedAt = readOptionalString(data, 'publishedAt')
  if (!insightCtaTypes.has(ctaType as InsightCtaType)) {
    throw new Error(`Insight frontmatter field "ctaType" must be one of: ${Array.from(insightCtaTypes).join(', ')}.`)
  }

  return {
    title: readRequiredString(data, 'title'),
    slug: readRequiredString(data, 'slug'),
    metaDescription: readRequiredString(data, 'metaDescription'),
    focusKeyword: readRequiredString(data, 'focusKeyword'),
    category: readRequiredString(data, 'category'),
    ctaType: ctaType as InsightCtaType,
    ctaLabel: readRequiredString(data, 'ctaLabel'),
    ctaTarget: readRequiredString(data, 'ctaTarget'),
    relatedSolutionSlug: readRequiredString(data, 'relatedSolutionSlug'),
    generatedAt,
    publishedAt: publishedAt ? validateDateString('publishedAt', publishedAt) : undefined,
  }
}

function getInsightSortDate(post: Pick<InsightFrontmatter, 'generatedAt' | 'publishedAt'>) {
  return Date.parse(post.publishedAt ?? post.generatedAt)
}

function resolveInsightFilePath(slug: string, directory: string) {
  if (!slug || slug.includes('/') || slug.includes('\\') || slug.includes('..') || path.isAbsolute(slug)) {
    throw new Error('Insight slug must be a safe relative slug.')
  }

  const root = path.resolve(directory)
  const filePath = path.resolve(root, `${slug}.md`)
  const relativePath = path.relative(root, filePath)

  if (relativePath.startsWith('..') || path.isAbsolute(relativePath)) {
    throw new Error('Insight slug must stay within the insights directory.')
  }

  return filePath
}

export function estimateReadingMinutes(markdown: string) {
  const wordCount = markdown.trim().split(/\s+/).filter(Boolean).length
  return Math.max(1, Math.ceil(wordCount / 180))
}

export function parseInsightDocument(source: string): InsightPost {
  const parsed = matter(source)
  const frontmatter = parseInsightFrontmatter(parsed.data as Record<string, unknown>)
  const bodyMarkdown = parsed.content.trim()

  return {
    ...frontmatter,
    bodyMarkdown,
    readingMinutes: estimateReadingMinutes(bodyMarkdown),
  }
}

export function loadInsightsFromDirectory(directory = INSIGHTS_DIR): InsightPost[] {
  if (!fs.existsSync(directory)) {
    return []
  }

  return listInsightSlugs(directory)
    .map((slug) => {
      const filePath = path.join(directory, `${slug}.md`)
      return parseInsightDocument(fs.readFileSync(filePath, 'utf8'))
    })
    .sort((left, right) => getInsightSortDate(right) - getInsightSortDate(left))
}

export function listInsightSlugs(directory = INSIGHTS_DIR) {
  if (!fs.existsSync(directory)) {
    return []
  }

  return fs
    .readdirSync(directory, { withFileTypes: true })
    .filter((entry) => entry.isFile() && entry.name.endsWith('.md'))
    .map((entry) => entry.name.slice(0, -3))
    .sort((left, right) => left.localeCompare(right))
}

export function getAllInsights(directory = INSIGHTS_DIR) {
  return loadInsightsFromDirectory(directory)
}

export function getInsightBySlug(slug: string, directory = INSIGHTS_DIR) {
  const filePath = resolveInsightFilePath(slug, directory)
  if (!fs.existsSync(filePath)) {
    return null
  }

  return parseInsightDocument(fs.readFileSync(filePath, 'utf8'))
}

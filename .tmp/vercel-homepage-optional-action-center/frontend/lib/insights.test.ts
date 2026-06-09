import { mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { afterEach, describe, expect, it } from 'vitest'
import {
  estimateReadingMinutes,
  getInsightBySlug,
  listInsightSlugs,
  loadInsightsFromDirectory,
  parseInsightDocument,
} from './insights'

const tempDirectories: string[] = []

function createTempDirectory() {
  const directory = mkdtempSync(path.join(os.tmpdir(), 'verisight-insights-'))
  tempDirectories.push(directory)
  return directory
}

function buildInsightSource(overrides?: Partial<Record<string, string>>, bodyMarkdown = '## Intro\n\nBody') {
  const fields = {
    title: 'Titel',
    slug: 'titel',
    metaDescription: 'Meta',
    focusKeyword: 'keyword',
    category: 'Onboarding',
    ctaType: 'soft_product',
    ctaLabel: 'Bekijk',
    ctaTarget: '/producten/onboarding-30-60-90',
    relatedSolutionSlug: 'medewerkersbehoud-analyse',
    generatedAt: '2026-05-06',
    publishedAt: '2026-05-06',
    ...overrides,
  }

  const frontmatterLines = [
    '---',
    `title: "${fields.title}"`,
    `slug: "${fields.slug}"`,
    `metaDescription: "${fields.metaDescription}"`,
    `focusKeyword: "${fields.focusKeyword}"`,
    `category: "${fields.category}"`,
    `ctaType: "${fields.ctaType}"`,
    `ctaLabel: "${fields.ctaLabel}"`,
    `ctaTarget: "${fields.ctaTarget}"`,
    `relatedSolutionSlug: "${fields.relatedSolutionSlug}"`,
    `generatedAt: "${fields.generatedAt}"`,
  ]

  if (fields.publishedAt !== undefined) {
    frontmatterLines.push(`publishedAt: "${fields.publishedAt}"`)
  }

  return [...frontmatterLines, '---', '', bodyMarkdown].join('\n')
}

afterEach(() => {
  for (const directory of tempDirectories.splice(0)) {
    rmSync(directory, { recursive: true, force: true })
  }
})

describe('insight content parsing', () => {
  it('parses frontmatter and markdown body', () => {
    const result = parseInsightDocument(buildInsightSource())

    expect(result.slug).toBe('titel')
    expect(result.title).toBe('Titel')
    expect(result.bodyMarkdown).toContain('## Intro')
    expect(result.readingMinutes).toBe(1)
  })

  it('estimates reading time from word count', () => {
    expect(estimateReadingMinutes('woord '.repeat(180))).toBe(1)
    expect(estimateReadingMinutes('woord '.repeat(181))).toBe(2)
    expect(estimateReadingMinutes('')).toBe(1)
  })

  it('parses insight documents without publishedAt', () => {
    const result = parseInsightDocument(buildInsightSource({ publishedAt: undefined }))

    expect(result.publishedAt).toBeUndefined()
    expect(result.generatedAt).toBe('2026-05-06')
  })

  it('accepts generatedAt timestamps with microseconds', () => {
    const result = parseInsightDocument(
      buildInsightSource({ generatedAt: '2026-05-08T09:43:38.085818' }),
    )

    expect(result.generatedAt).toBe('2026-05-08T09:43:38.085818')
  })

  it('loads markdown insight files from a directory and sorts newest first', () => {
    const directory = createTempDirectory()

    writeFileSync(path.join(directory, '.gitkeep'), '', 'utf8')
    writeFileSync(
      path.join(directory, 'older.md'),
      buildInsightSource({ title: 'Ouder', slug: 'ouder', publishedAt: '2026-05-05' }),
      'utf8',
    )
    writeFileSync(
      path.join(directory, 'newer.md'),
      buildInsightSource({ title: 'Nieuwer', slug: 'nieuwer', publishedAt: '2026-05-06' }),
      'utf8',
    )

    const result = loadInsightsFromDirectory(directory)

    expect(result).toHaveLength(2)
    expect(result.map((post) => post.slug)).toEqual(['nieuwer', 'ouder'])
  })

  it('sorts by publishedAt when present and falls back to generatedAt otherwise', () => {
    const directory = createTempDirectory()

    writeFileSync(
      path.join(directory, 'generated-later.md'),
      buildInsightSource({
        title: 'Later gegenereerd',
        slug: 'generated-later',
        generatedAt: '2026-05-07',
        publishedAt: undefined,
      }),
      'utf8',
    )
    writeFileSync(
      path.join(directory, 'published-earlier.md'),
      buildInsightSource({
        title: 'Eerder gepubliceerd',
        slug: 'published-earlier',
        generatedAt: '2026-05-01',
        publishedAt: '2026-05-06',
      }),
      'utf8',
    )

    const result = loadInsightsFromDirectory(directory)

    expect(result.map((post) => post.slug)).toEqual(['generated-later', 'published-earlier'])
  })

  it('fails fast when generatedAt is not a valid date', () => {
    expect(() => parseInsightDocument(buildInsightSource({ generatedAt: 'not-a-date' }))).toThrow(
      /generatedAt/,
    )
  })

  it('fails fast when generatedAt is an impossible calendar date', () => {
    expect(() => parseInsightDocument(buildInsightSource({ generatedAt: '2026-02-31' }))).toThrow(
      /generatedAt/,
    )
  })

  it('fails fast when publishedAt is present but not a valid date', () => {
    expect(() => parseInsightDocument(buildInsightSource({ publishedAt: 'still-not-a-date' }))).toThrow(
      /publishedAt/,
    )
  })

  it('fails fast when publishedAt is an impossible calendar date', () => {
    expect(() => parseInsightDocument(buildInsightSource({ publishedAt: '2026-02-31' }))).toThrow(
      /publishedAt/,
    )
  })

  it('gets an insight by slug and returns null when it does not exist', () => {
    const directory = createTempDirectory()

    writeFileSync(path.join(directory, 'titel.md'), buildInsightSource(), 'utf8')

    expect(getInsightBySlug('titel', directory)?.title).toBe('Titel')
    expect(getInsightBySlug('missing', directory)).toBeNull()
  })

  it('rejects slug lookups that try to escape the insights directory', () => {
    const directory = createTempDirectory()

    expect(() => getInsightBySlug('../escape', directory)).toThrow(/slug/i)
    expect(() => getInsightBySlug('..\\escape', directory)).toThrow(/slug/i)
  })

  it('lists insight slugs from markdown files only', () => {
    const directory = createTempDirectory()

    writeFileSync(path.join(directory, '.gitkeep'), '', 'utf8')
    writeFileSync(path.join(directory, 'alpha.md'), buildInsightSource({ slug: 'alpha' }), 'utf8')
    writeFileSync(path.join(directory, 'beta.md'), buildInsightSource({ slug: 'beta' }), 'utf8')
    writeFileSync(path.join(directory, 'notes.txt'), 'ignore me', 'utf8')

    expect(listInsightSlugs(directory)).toEqual(['alpha', 'beta'])
  })
})

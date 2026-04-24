import { MetadataRoute } from 'next'
import { INSIGHT_PAGES } from '@/lib/insights-pages'

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: 'https://www.verisight.nl',
      lastModified: new Date('2026-04-11'),
      changeFrequency: 'monthly',
      priority: 1,
    },
    {
      url: 'https://www.verisight.nl/producten',
      lastModified: new Date('2026-04-12'),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: 'https://www.verisight.nl/producten/exitscan',
      lastModified: new Date('2026-04-13'),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: 'https://www.verisight.nl/producten/retentiescan',
      lastModified: new Date('2026-04-13'),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: 'https://www.verisight.nl/producten/combinatie',
      lastModified: new Date('2026-04-13'),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: 'https://www.verisight.nl/producten/pulse',
      lastModified: new Date('2026-04-17'),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: 'https://www.verisight.nl/producten/teamscan',
      lastModified: new Date('2026-04-17'),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: 'https://www.verisight.nl/producten/onboarding-30-60-90',
      lastModified: new Date('2026-04-17'),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: 'https://www.verisight.nl/producten/leadership-scan',
      lastModified: new Date('2026-04-17'),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: 'https://www.verisight.nl/aanpak',
      lastModified: new Date('2026-04-12'),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: 'https://www.verisight.nl/tarieven',
      lastModified: new Date('2026-04-12'),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: 'https://www.verisight.nl/vertrouwen',
      lastModified: new Date('2026-04-15'),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: 'https://www.verisight.nl/oplossingen/verloop-analyse',
      lastModified: new Date('2026-04-15'),
      changeFrequency: 'monthly',
      priority: 0.75,
    },
    {
      url: 'https://www.verisight.nl/oplossingen/exitgesprekken-analyse',
      lastModified: new Date('2026-04-15'),
      changeFrequency: 'monthly',
      priority: 0.75,
    },
    {
      url: 'https://www.verisight.nl/oplossingen/medewerkersbehoud-analyse',
      lastModified: new Date('2026-04-15'),
      changeFrequency: 'monthly',
      priority: 0.72,
    },
    {
      url: 'https://www.verisight.nl/inzichten',
      lastModified: new Date('2026-04-18'),
      changeFrequency: 'monthly',
      priority: 0.68,
    },
    ...INSIGHT_PAGES.map((page) => ({
      url: `https://www.verisight.nl${page.canonical}`,
      lastModified: new Date(page.publishedAt),
      changeFrequency: 'monthly' as const,
      priority: 0.64,
    })),
    {
      url: 'https://www.verisight.nl/privacy',
      lastModified: new Date('2026-04-11'),
      changeFrequency: 'yearly',
      priority: 0.4,
    },
    {
      url: 'https://www.verisight.nl/voorwaarden',
      lastModified: new Date('2026-04-11'),
      changeFrequency: 'yearly',
      priority: 0.4,
    },
    {
      url: 'https://www.verisight.nl/dpa',
      lastModified: new Date('2026-04-11'),
      changeFrequency: 'yearly',
      priority: 0.4,
    },
  ]
}

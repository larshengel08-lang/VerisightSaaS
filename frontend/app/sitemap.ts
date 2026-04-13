import { MetadataRoute } from 'next'

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

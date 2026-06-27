import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: 'https://www.getloep.nl', lastModified: new Date('2026-04-11'), changeFrequency: 'monthly', priority: 1 },
    { url: 'https://www.getloep.nl/producten', lastModified: new Date('2026-06-17'), changeFrequency: 'monthly', priority: 0.9 },
    { url: 'https://www.getloep.nl/aanpak', lastModified: new Date('2026-04-12'), changeFrequency: 'monthly', priority: 0.8 },
    { url: 'https://www.getloep.nl/vertrouwen', lastModified: new Date('2026-04-15'), changeFrequency: 'monthly', priority: 0.7 },
    { url: 'https://www.getloep.nl/privacy', lastModified: new Date('2026-04-11'), changeFrequency: 'yearly', priority: 0.4 },
    { url: 'https://www.getloep.nl/voorwaarden', lastModified: new Date('2026-04-11'), changeFrequency: 'yearly', priority: 0.4 },
    { url: 'https://www.getloep.nl/dpa', lastModified: new Date('2026-04-11'), changeFrequency: 'yearly', priority: 0.4 },
  ]
}

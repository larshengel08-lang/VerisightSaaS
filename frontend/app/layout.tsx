import type { Metadata } from 'next'
import { IBM_Plex_Sans, Inter } from 'next/font/google'
import { SiteAnalytics } from '@/components/marketing/site-analytics'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  display: 'swap',
  variable: '--font-inter',
})

const ibmPlexSans = IBM_Plex_Sans({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  display: 'swap',
  variable: '--font-ibm-plex-sans',
})

const googleSiteVerification = process.env.GOOGLE_SITE_VERIFICATION

export const metadata: Metadata = {
  title: {
    default: 'Loep | Begeleide analyse van behoud, vertrek en onboarding',
    template: '%s | Loep',
  },
  icons: {
    icon: [{ url: '/icon.png', type: 'image/png' }],
    shortcut: [{ url: '/icon.png', type: 'image/png' }],
  },
  description:
    'Loep helpt HR-teams bij organisaties met 100 tot 1.000 medewerkers zien waar behoud onder druk staat, waarom mensen vertrekken en hoe nieuwe medewerkers landen. Met Loep Behoud, Loep Vertrek en Loep Start: rapport en managementbespreking inbegrepen.',
  metadataBase: new URL('https://www.getloep.nl'),
  openGraph: {
    type: 'website',
    locale: 'nl_NL',
    url: 'https://www.getloep.nl',
    siteName: 'Loep',
    title: 'Loep | Begeleide analyse van behoud, vertrek en onboarding',
    description:
      'Zie eerder waar behoud onder druk staat, begrijp waarom medewerkers vertrekken en volg hoe nieuwe mensen landen. Begeleide analyse met rapport en managementbespreking.',
    images: [
      {
        url: '/opengraph-image',
        width: 1200,
        height: 630,
        alt: 'Loep productportfolio met Loep Behoud, Loep Vertrek en Loep Start',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Loep | Begeleide analyse van behoud, vertrek en onboarding',
    description:
      'Zie eerder waar behoud onder druk staat, begrijp waarom medewerkers vertrekken en volg hoe nieuwe mensen landen. Begeleide analyse met rapport en managementbespreking.',
    images: ['/opengraph-image'],
  },
  robots: {
    index: true,
    follow: true,
  },
  verification: googleSiteVerification
    ? {
        google: googleSiteVerification,
      }
    : undefined,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Loep',
    url: 'https://www.getloep.nl',
    logo: 'https://www.getloep.nl/icon.png',
    description:
      'Loep helpt HR-teams bij organisaties met 100 tot 1.000 medewerkers zien waar behoud onder druk staat, waarom mensen vertrekken en hoe nieuwe medewerkers landen.',
    areaServed: {
      '@type': 'Country',
      name: 'Nederland',
    },
    inLanguage: 'nl-NL',
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'sales',
      email: 'hallo@getloep.nl',
      availableLanguage: 'Dutch',
      url: 'https://www.getloep.nl/#kennismaking',
    },
  }

  return (
    <html lang="nl">
      <body
        className={`${inter.variable} ${ibmPlexSans.variable} font-[family-name:var(--font-ibm-plex-sans)] bg-[--bg] antialiased`}
      >
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
        {children}
        <SiteAnalytics />
      </body>
    </html>
  )
}

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
    default: 'Loep',
    template: '%s | Loep',
  },
  icons: {
    icon: [{ url: '/icon.png', type: 'image/png' }],
    shortcut: [{ url: '/icon.png', type: 'image/png' }],
  },
  description:
    'Loep helpt HR-teams bij organisaties met 200 tot 1.000 medewerkers om vertrek te duiden met Loep Vertrek en behoud eerder zichtbaar te maken met Loep Behoud.',
  metadataBase: new URL('https://www.getloep.nl'),
  openGraph: {
    type: 'website',
    locale: 'nl_NL',
    url: 'https://www.getloep.nl',
    siteName: 'Loep',
    title: 'Loep',
    description:
      'Begrijp waarom medewerkers vertrekken en zie eerder waar behoud onder druk staat. Loep levert Loep Vertrek en Loep Behoud in een begeleide productvorm.',
    images: [
      {
        url: '/opengraph-image',
        width: 1200,
        height: 630,
        alt: 'Loep productportfolio met Loep Vertrek en Loep Behoud',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Loep',
    description:
      'Begrijp waarom medewerkers vertrekken en zie eerder waar behoud onder druk staat. Loep levert Loep Vertrek en Loep Behoud in een begeleide productvorm.',
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
      'Loep helpt HR-teams bij organisaties met 200 tot 1.000 medewerkers om vertrek te duiden met Loep Vertrek en behoud eerder zichtbaar te maken met Loep Behoud.',
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

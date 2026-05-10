import type { Metadata } from 'next'
import { Playfair_Display, Plus_Jakarta_Sans } from 'next/font/google'
import { SiteAnalytics } from '@/components/marketing/site-analytics'
import './globals.css'

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
  variable: '--font-plus-jakarta',
})

const playfairDisplay = Playfair_Display({
  subsets: ['latin'],
  weight: ['600', '700'],
  style: ['normal', 'italic'],
  display: 'swap',
  variable: '--font-playfair',
})

const googleSiteVerification = process.env.GOOGLE_SITE_VERIFICATION

export const metadata: Metadata = {
  title: {
    default: 'Verisight',
    template: '%s | Verisight',
  },
  description:
    'Verisight helpt HR-teams bij organisaties met 200 tot 1.000 medewerkers om vertrek te duiden met ExitScan en behoud eerder zichtbaar te maken met RetentieScan.',
  metadataBase: new URL('https://www.verisight.nl'),
  openGraph: {
    type: 'website',
    locale: 'nl_NL',
    url: 'https://www.verisight.nl',
    siteName: 'Verisight',
    title: 'Verisight',
    description:
      'Begrijp waarom medewerkers vertrekken en zie eerder waar behoud onder druk staat. Verisight levert ExitScan en RetentieScan in een begeleide productvorm.',
    images: [
      {
        url: '/opengraph-image',
        width: 1200,
        height: 630,
        alt: 'Verisight productportfolio met ExitScan en RetentieScan',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Verisight',
    description:
      'Begrijp waarom medewerkers vertrekken en zie eerder waar behoud onder druk staat. Verisight levert ExitScan en RetentieScan in een begeleide productvorm.',
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
    name: 'Verisight',
    url: 'https://www.verisight.nl',
    logo: 'https://www.verisight.nl/verisight-wordmark.svg',
    description:
      'Verisight helpt HR-teams bij organisaties met 200 tot 1.000 medewerkers om vertrek te duiden met ExitScan en behoud eerder zichtbaar te maken met RetentieScan.',
    areaServed: {
      '@type': 'Country',
      name: 'Nederland',
    },
    inLanguage: 'nl-NL',
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'sales',
      email: 'hallo@verisight.nl',
      availableLanguage: 'Dutch',
      url: 'https://www.verisight.nl/#kennismaking',
    },
  }

  return (
    <html lang="nl">
      <body className={`${plusJakartaSans.variable} ${playfairDisplay.variable} font-[family-name:var(--font-plus-jakarta)] bg-[--bg] antialiased`}>
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

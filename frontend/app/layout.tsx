import type { Metadata } from 'next'
import { Inter, Sora } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'], display: 'swap', variable: '--font-inter' })
const sora = Sora({ subsets: ['latin'], display: 'swap', variable: '--font-display' })

export const metadata: Metadata = {
  title: {
    default: 'Verisight | ExitScan en RetentieScan voor HR-teams',
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
    title: 'Verisight | ExitScan en RetentieScan voor HR-teams',
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
    title: 'Verisight | ExitScan en RetentieScan voor HR-teams',
    description:
      'Begrijp waarom medewerkers vertrekken en zie eerder waar behoud onder druk staat. Verisight levert ExitScan en RetentieScan in een begeleide productvorm.',
    images: ['/opengraph-image'],
  },
  robots: {
    index: true,
    follow: true,
  },
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
      <body className={`${inter.variable} ${sora.variable} font-[family-name:var(--font-inter)] bg-white antialiased`}>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
        {children}
      </body>
    </html>
  )
}

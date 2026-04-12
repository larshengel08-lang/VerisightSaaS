import type { Metadata } from 'next'
import { Inter, DM_Serif_Display } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'], display: 'swap', variable: '--font-inter' })
const dmSerif = DM_Serif_Display({ subsets: ['latin'], weight: '400', display: 'swap', variable: '--font-display' })

export const metadata: Metadata = {
  title: {
    default: 'Verisight | Begeleide ExitScan voor HR-teams',
    template: '%s | Verisight',
  },
  description:
    'Verisight helpt HR-teams bij organisaties met 200 tot 1.000 medewerkers om vertrekredenen te begrijpen via een begeleide ExitScan met dashboard, rapport en persoonlijke toelichting.',
  metadataBase: new URL('https://www.verisight.nl'),
  openGraph: {
    type: 'website',
    locale: 'nl_NL',
    url: 'https://www.verisight.nl',
    siteName: 'Verisight',
    title: 'Verisight | Begeleide ExitScan voor HR-teams',
    description:
      'Begrijp waarom medewerkers vertrekken. Verisight levert een begeleide ExitScan voor HR-teams met dashboard, rapport en persoonlijke toelichting.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Verisight ExitScan',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Verisight | Begeleide ExitScan voor HR-teams',
    description:
      'Begrijp waarom medewerkers vertrekken. Verisight levert een begeleide ExitScan voor HR-teams met dashboard, rapport en persoonlijke toelichting.',
    images: ['/og-image.png'],
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
      'Verisight helpt HR-teams bij organisaties met 200 tot 1.000 medewerkers om vertrekredenen te begrijpen via een begeleide ExitScan met dashboard en rapportage.',
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
      <body className={`${inter.variable} ${dmSerif.variable} font-[family-name:var(--font-inter)] bg-white antialiased`}>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
        {children}
      </body>
    </html>
  )
}

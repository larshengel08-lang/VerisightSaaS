import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'RetentionPulse',
  description: 'HR verloopanalyse platform',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="nl">
      <body className={`${inter.className} antialiased bg-gray-50`}>
        {children}
      </body>
    </html>
  )
}

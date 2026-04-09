import type { ReactNode } from 'react'
import Link from 'next/link'
import { PublicFooter } from '@/components/marketing/public-footer'

interface LegalPageShellProps {
  title: string
  description: string
  lastUpdated: string
  children: ReactNode
}

export function LegalPageShell({
  title,
  description,
  lastUpdated,
  children,
}: LegalPageShellProps) {
  return (
    <div className="min-h-screen bg-white text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-4 sm:px-6">
          <Link href="/" className="text-lg font-bold tracking-tight text-blue-700">
            Verisight
          </Link>
          <div className="flex items-center gap-4 text-sm font-medium text-slate-600">
            <Link href="/" className="transition-colors hover:text-slate-950">
              Home
            </Link>
            <Link href="/login" className="transition-colors hover:text-slate-950">
              Voor klanten: inloggen
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-5 py-14 sm:px-6 md:py-16">
        <div className="rounded-3xl border border-slate-200 bg-slate-50 p-8 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-700">Publieke informatie</p>
          <h1 className="mt-3 text-4xl font-bold tracking-tight text-slate-950">{title}</h1>
          <p className="mt-4 max-w-2xl text-base leading-8 text-slate-600">{description}</p>
          <p className="mt-4 text-sm text-slate-500">Laatst bijgewerkt: {lastUpdated}</p>
        </div>

        <div className="mt-10 space-y-10 text-base leading-8 text-slate-700 [&_h2]:scroll-mt-24 [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:text-slate-950 [&_h2]:mb-4 [&_p]:mt-3 [&_ul]:mt-4 [&_ul]:space-y-2 [&_ul]:pl-5 [&_ul]:list-disc [&_li]:pl-1 [&_strong]:text-slate-950 [&_a]:text-blue-700 [&_a]:underline">
          {children}
        </div>
      </main>

      <PublicFooter />
    </div>
  )
}

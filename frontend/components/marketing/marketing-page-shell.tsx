import type { ReactNode } from 'react'
import { PublicFooter } from '@/components/marketing/public-footer'
import { PublicHeader } from '@/components/marketing/public-header'
import { TrustStrip } from '@/components/marketing/trust-strip'
import { trustItems } from '@/components/marketing/site-content'

interface MarketingPageShellProps {
  eyebrow: string
  title: string
  description: string
  children: ReactNode
  trustTone?: 'light' | 'dark'
}

export function MarketingPageShell({
  eyebrow,
  title,
  description,
  children,
  trustTone = 'light',
}: MarketingPageShellProps) {
  return (
    <div className="min-h-screen bg-white text-slate-900">
      <PublicHeader />
      <main>
        <section className="border-b border-slate-200 bg-[linear-gradient(180deg,#f6f8fb_0%,#eef4ff_100%)] py-20 md:py-24">
          <div className="mx-auto max-w-5xl px-6 text-center">
            <p className="text-xs font-bold uppercase tracking-widest text-blue-600">{eyebrow}</p>
            <h1 className="font-display mt-4 text-balance text-4xl text-slate-950 md:text-5xl">
              {title}
            </h1>
            <p className="mx-auto mt-5 max-w-3xl text-lg leading-8 text-slate-600">
              {description}
            </p>
            <div className="mt-10">
              <TrustStrip items={trustItems} tone={trustTone} />
            </div>
          </div>
        </section>
        <section className="py-16 md:py-20">
          <div className="mx-auto max-w-6xl px-6">{children}</div>
        </section>
      </main>
      <PublicFooter />
    </div>
  )
}

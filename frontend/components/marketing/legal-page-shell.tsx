import type { ReactNode } from 'react'
import Link from 'next/link'
import { PublicFooter } from '@/components/marketing/public-footer'
import { PublicHeader } from '@/components/marketing/public-header'

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
    <div className="min-h-screen bg-[var(--bg)] text-[var(--ink)]">
      <PublicHeader />

      <main>
        <section className="relative overflow-hidden border-b border-[var(--border)] bg-[var(--surface)]">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-35"
            style={{
              backgroundImage:
                'linear-gradient(rgba(222,214,202,0.48) 1px, transparent 1px), linear-gradient(90deg, rgba(222,214,202,0.48) 1px, transparent 1px)',
              backgroundSize: '72px 72px',
            }}
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -right-16 top-[-5rem] h-[30rem] w-[30rem]"
            style={{
              background: 'radial-gradient(circle, rgba(201,106,75,0.10) 0%, transparent 65%)',
            }}
          />

          <div className="marketing-shell relative py-[clamp(3.5rem,5.6vw,5rem)]">
            <div className="max-w-4xl">
              <p className="text-[0.68rem] font-bold uppercase tracking-[0.22em] text-[var(--teal)]">
                Publieke informatie
              </p>
              <h1 className="font-display mt-4 max-w-[14ch] text-[clamp(2.3rem,6vw,4.35rem)] leading-[0.94] tracking-[-0.04em] text-[var(--ink)]">
                {title}
              </h1>
              <p className="mt-6 max-w-[44rem] text-[1rem] leading-[1.9] text-[var(--text)]">
                {description}
              </p>
              <div className="mt-8 flex flex-wrap items-center gap-x-4 gap-y-3 text-sm text-[var(--muted)]">
                <span>Laatst bijgewerkt: {lastUpdated}</span>
                <span className="hidden h-1 w-1 rounded-full bg-[rgba(19,32,51,0.22)] sm:block" />
                <Link
                  href="/vertrouwen"
                  className="inline-flex items-center gap-2 font-medium text-[var(--teal)] transition-colors hover:text-[var(--ink)]"
                >
                  Trust &amp; privacy bekijken
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className="marketing-section">
          <div className="marketing-shell">
            <div className="mx-auto max-w-4xl rounded-[1.75rem] border border-[var(--border)] bg-[var(--surface)] p-6 shadow-[var(--marketing-shadow-soft)] sm:p-8 lg:p-10">
              <div
                className="
                  space-y-10 text-[0.98rem] leading-[1.9] text-[var(--text)]
                  [&_section]:space-y-4
                  [&_h2]:font-display [&_h2]:text-[clamp(1.65rem,3vw,2.25rem)] [&_h2]:font-normal [&_h2]:leading-[1.04] [&_h2]:tracking-[-0.03em] [&_h2]:text-[var(--ink)]
                  [&_p]:m-0
                  [&_ul]:m-0 [&_ul]:list-disc [&_ul]:space-y-3 [&_ul]:pl-5
                  [&_li]:pl-1
                  [&_strong]:font-semibold [&_strong]:text-[var(--ink)]
                  [&_a]:text-[var(--teal)] [&_a]:underline [&_a]:underline-offset-4 hover:[&_a]:text-[var(--ink)]
                  [&_code]:rounded-[0.45rem] [&_code]:bg-[var(--bg)] [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:text-[0.86em] [&_code]:text-[var(--ink)]
                "
              >
                {children}
              </div>
            </div>
          </div>
        </section>
      </main>

      <PublicFooter />
    </div>
  )
}

import { Suspense } from 'react'
import { ContactForm } from '@/components/marketing/contact-form'
import type { ContactRouteInterest } from '@/lib/contact-funnel'

interface MarketingInlineContactPanelProps {
  eyebrow: string
  title: string
  body: string
  defaultRouteInterest: ContactRouteInterest
  defaultCtaSource: string
  id?: string
}

export function MarketingInlineContactPanel({
  eyebrow,
  title,
  body,
  defaultRouteInterest,
  defaultCtaSource,
  id = 'kennismaking',
}: MarketingInlineContactPanelProps) {
  return (
    <div
      id={id}
      className="marketing-panel overflow-hidden rounded-[2rem] border border-[var(--border)] bg-[linear-gradient(180deg,#ffffff_0%,#fbfaf8_100%)] p-7 md:p-10"
    >
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-[var(--border)] pb-5">
        <div>
          <p className="text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-[var(--teal)]">{eyebrow}</p>
          <h2 className="mt-3 text-[clamp(1.8rem,3vw,2.8rem)] font-light leading-[1.06] tracking-[-0.03em] text-[var(--ink)]">
            {title}
          </h2>
        </div>
        <div className="rounded-full border border-[var(--border)] bg-[var(--surface)] px-4 py-2 text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
          Eerste route-inschatting
        </div>
      </div>
      <p className="text-[1.02rem] leading-8 text-[var(--text)]">{body}</p>
      <div className="mt-8">
        <Suspense
          fallback={
            <div className="rounded-[1.6rem] border border-[var(--border)] bg-[var(--surface)] p-6 text-sm leading-7 text-[var(--text)]">
              Het kennismakingsformulier wordt geladen.
            </div>
          }
        >
          <ContactForm
            surface="light"
            defaultRouteInterest={defaultRouteInterest}
            defaultCtaSource={defaultCtaSource}
          />
        </Suspense>
      </div>
    </div>
  )
}

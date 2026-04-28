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
  badge?: string | null
  contactQuestionPlaceholder?: string
}

export function MarketingInlineContactPanel({
  eyebrow,
  title,
  body,
  defaultRouteInterest,
  defaultCtaSource,
  id = 'kennismaking',
  badge = 'Vrijblijvende suite-demo',
  contactQuestionPlaceholder,
}: MarketingInlineContactPanelProps) {
  return (
    <div
      id={id}
      className="marketing-panel overflow-hidden rounded-[1.5rem] border border-[var(--border)] bg-[linear-gradient(180deg,#fffdf9_0%,#fbfaf8_100%)] p-7 md:p-10"
    >
      <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] xl:items-start xl:gap-12">
        <div className="xl:pr-2">
          <div className="mb-6 border-b border-[var(--border)] pb-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-[var(--teal)]">{eyebrow}</p>
              {badge != null && (
                <div className="rounded-full border border-[var(--border)] bg-[var(--surface)] px-4 py-2 text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
                  {badge}
                </div>
              )}
            </div>
            <h2 className="mt-4 text-[clamp(2rem,3vw,3rem)] font-light leading-[1.04] tracking-[-0.03em] text-[var(--ink)]">
                {title}
            </h2>
          </div>
          <p className="max-w-[34rem] text-[1.02rem] leading-8 text-[var(--text)]">{body}</p>
        </div>
        <div className="xl:pl-2">
          <Suspense
            fallback={
              <div className="rounded-[1.6rem] border border-[var(--border)] bg-[var(--surface)] p-6 text-sm leading-7 text-[var(--text)]">
                Het suite-demoformulier wordt geladen.
              </div>
            }
          >
            <ContactForm
              surface="light"
              defaultRouteInterest={defaultRouteInterest}
              defaultCtaSource={defaultCtaSource}
              questionPlaceholder={contactQuestionPlaceholder}
            />
          </Suspense>
        </div>
      </div>
    </div>
  )
}

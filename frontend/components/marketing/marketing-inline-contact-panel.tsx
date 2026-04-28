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
  badge = null,
  contactQuestionPlaceholder,
}: MarketingInlineContactPanelProps) {
  return (
    <div
      id={id}
      className="marketing-panel overflow-hidden rounded-[1.5rem] border border-[var(--border)] bg-[linear-gradient(180deg,#fffdf9_0%,#fbfaf8_100%)] p-7 md:p-10"
    >
      <div className="mx-auto max-w-[980px]">
        <div className="mb-8 max-w-[42rem] border-b border-[var(--border)] pb-5">
          <div className="flex flex-wrap items-center gap-3">
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
          <p className="mt-4 max-w-[38rem] text-[1rem] leading-7 text-[var(--text)]">{body}</p>
        </div>
        <div className="rounded-[1.7rem] border border-[var(--border)] bg-white p-5 shadow-[0_24px_60px_rgba(22,34,56,0.08)] sm:p-7 md:p-8">
          <Suspense
            fallback={
              <div className="rounded-[1.6rem] border border-[var(--border)] bg-[var(--surface)] p-6 text-sm leading-7 text-[var(--text)]">
                Het intakeformulier wordt geladen.
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

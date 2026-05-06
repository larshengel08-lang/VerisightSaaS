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
      className="marketing-panel overflow-hidden rounded-[1.5rem] border border-[var(--border)] bg-[var(--bg)] p-6 md:p-8"
    >
      <div className="mx-auto max-w-[980px]">
        <div className="mb-6 max-w-[40rem] pb-1">
          <div className="flex flex-wrap items-center gap-3">
            <p className="text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-[var(--brand-accent-deep)]">{eyebrow}</p>
            {badge != null && (
              <div className="rounded-full border border-[var(--border)] bg-[var(--surface)] px-4 py-2 text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
                {badge}
              </div>
            )}
          </div>
          <h2 className="mt-3 text-[clamp(1.85rem,2.6vw,2.65rem)] font-light leading-[1.04] tracking-[-0.03em] text-[var(--ink)]">
            {title}
          </h2>
          <p className="mt-3 max-w-[36rem] text-[0.95rem] leading-7 text-[var(--text)]">{body}</p>
        </div>
        <div className="rounded-[1.45rem] border border-[var(--border)] bg-white p-5 shadow-[0_14px_30px_rgba(19,32,51,0.04)] sm:p-6 md:p-7">
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
              variant="simplified"
              questionPlaceholder={contactQuestionPlaceholder}
            />
          </Suspense>
        </div>
      </div>
    </div>
  )
}

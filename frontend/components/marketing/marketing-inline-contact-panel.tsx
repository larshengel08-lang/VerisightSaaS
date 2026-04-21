import { Suspense } from 'react'
import { ContactForm } from '@/components/marketing/contact-form'
import type { ContactRouteInterest } from '@/lib/contact-funnel'

interface MarketingInlineContactPanelProps {
  eyebrow?: string
  title?: string
  body?: string
  defaultRouteInterest: ContactRouteInterest
  defaultCtaSource: string
  id?: string
  badge?: string | null
  minimal?: boolean
}

export function MarketingInlineContactPanel({
  eyebrow,
  title,
  body,
  defaultRouteInterest,
  defaultCtaSource,
  id = 'kennismaking',
  badge = 'Vrijblijvend gesprek',
  minimal = false,
}: MarketingInlineContactPanelProps) {
  const hasHeading = Boolean(eyebrow || title)
  const hasBody = Boolean(body)
  return (
    <div
      id={id}
      className="overflow-hidden rounded-[1.35rem] border border-[var(--border)] bg-[rgba(255,252,247,0.96)] p-7 md:p-9"
    >
      {(hasHeading || badge != null) && (
        <div className={`mb-6 flex flex-wrap items-center justify-between gap-3 ${minimal ? '' : 'border-b border-[var(--border)]/80 pb-5'}`}>
          {hasHeading ? (
            <div>
              {eyebrow ? (
                <p className="text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-[var(--teal)]">{eyebrow}</p>
              ) : null}
              {title ? (
                <h2 className="mt-3 text-[clamp(1.7rem,3vw,2.45rem)] font-light leading-[1.06] tracking-[-0.03em] text-[var(--ink)]">
                  {title}
                </h2>
              ) : null}
            </div>
          ) : (
            <div />
          )}
          {badge != null && (
            <div className="rounded-full border border-[var(--border)] bg-[rgba(255,255,255,0.7)] px-4 py-2 text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
              {badge}
            </div>
          )}
        </div>
      )}
      {hasBody ? <p className="max-w-[42rem] text-[0.98rem] leading-8 text-[var(--text)]">{body}</p> : null}
      <div className={hasBody ? 'mt-8' : ''}>
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
            minimal={minimal}
          />
        </Suspense>
      </div>
    </div>
  )
}

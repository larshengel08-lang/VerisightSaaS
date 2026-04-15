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
    <div id={id} className="marketing-panel p-7 md:p-8">
      <p className="text-xs font-bold uppercase tracking-[0.22em] text-blue-600">{eyebrow}</p>
      <h2 className="mt-4 text-3xl font-semibold text-slate-950">{title}</h2>
      <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-600">{body}</p>
      <div className="mt-6">
        <Suspense
          fallback={
            <div className="rounded-[2rem] border border-slate-200 bg-white p-6 text-sm leading-7 text-slate-600 shadow-[0_18px_50px_rgba(15,23,42,0.10)]">
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

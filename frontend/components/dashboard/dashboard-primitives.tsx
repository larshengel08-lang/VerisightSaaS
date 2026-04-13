import type { ReactNode } from 'react'

type Tone = 'slate' | 'blue' | 'emerald' | 'amber'

const TONE_STYLES: Record<Tone, string> = {
  slate: 'border-slate-200 bg-white',
  blue: 'border-blue-100 bg-blue-50/70',
  emerald: 'border-emerald-100 bg-emerald-50/70',
  amber: 'border-amber-100 bg-amber-50/70',
}

const TONE_ACCENTS: Record<Tone, string> = {
  slate: 'text-slate-500',
  blue: 'text-blue-700',
  emerald: 'text-emerald-700',
  amber: 'text-amber-700',
}

export function DashboardHero({
  eyebrow,
  title,
  description,
  meta,
  actions,
  aside,
  tone = 'slate',
}: {
  eyebrow: string
  title: string
  description: string
  meta?: ReactNode
  actions?: ReactNode
  aside?: ReactNode
  tone?: Tone
}) {
  return (
    <section className={`overflow-hidden rounded-[28px] border p-6 shadow-sm ${TONE_STYLES[tone]}`}>
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.5fr),minmax(320px,0.9fr)]">
        <div>
          <p className={`text-xs font-semibold uppercase tracking-[0.22em] ${TONE_ACCENTS[tone]}`}>{eyebrow}</p>
          <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-950">{title}</h1>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-700">{description}</p>
          {meta ? <div className="mt-5 flex flex-wrap gap-2">{meta}</div> : null}
          {actions ? <div className="mt-5 flex flex-wrap items-center gap-3">{actions}</div> : null}
        </div>
        {aside ? (
          <div className="rounded-3xl border border-white/80 bg-white/80 p-5 shadow-sm">
            {aside}
          </div>
        ) : null}
      </div>
    </section>
  )
}

export function DashboardSection({
  title,
  description,
  eyebrow,
  aside,
  children,
}: {
  title: string
  description?: string
  eyebrow?: string
  aside?: ReactNode
  children: ReactNode
}) {
  return (
    <section className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="flex flex-col gap-4 border-b border-slate-100 pb-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          {eyebrow ? (
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">{eyebrow}</p>
          ) : null}
          <h2 className="mt-1 text-lg font-semibold text-slate-950">{title}</h2>
          {description ? <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">{description}</p> : null}
        </div>
        {aside ? <div className="sm:text-right">{aside}</div> : null}
      </div>
      <div className="mt-5">{children}</div>
    </section>
  )
}

export function DashboardDisclosure({
  title,
  description,
  children,
  defaultOpen = false,
  badge,
}: {
  title: string
  description?: string
  children: ReactNode
  defaultOpen?: boolean
  badge?: ReactNode
}) {
  return (
    <details
      open={defaultOpen}
      className="group rounded-[24px] border border-slate-200 bg-white shadow-sm"
    >
      <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 sm:px-6">
        <div>
          <p className="text-base font-semibold text-slate-950">{title}</p>
          {description ? <p className="mt-1 text-sm leading-6 text-slate-600">{description}</p> : null}
        </div>
        <div className="flex items-center gap-3">
          {badge}
          <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-500">
            <span className="group-open:hidden">Toon</span>
            <span className="hidden group-open:inline">Verberg</span>
            {' '}detail
          </span>
        </div>
      </summary>
      <div className="border-t border-slate-100 px-5 py-5 sm:px-6">{children}</div>
    </details>
  )
}

export function DashboardPanel({
  title,
  value,
  body,
  tone = 'slate',
  eyebrow,
}: {
  title: string
  value?: string
  body: string
  tone?: Tone
  eyebrow?: string
}) {
  return (
    <div className={`rounded-[22px] border p-4 sm:p-5 ${TONE_STYLES[tone]}`}>
      {eyebrow ? <p className={`text-xs font-semibold uppercase tracking-[0.18em] ${TONE_ACCENTS[tone]}`}>{eyebrow}</p> : null}
      <p className="mt-1 text-sm font-semibold text-slate-950">{title}</p>
      {value ? <p className="mt-3 text-3xl font-bold tracking-tight text-slate-950">{value}</p> : null}
      <p className="mt-3 text-sm leading-6 text-slate-700">{body}</p>
    </div>
  )
}

export function DashboardChip({
  label,
  tone = 'slate',
}: {
  label: string
  tone?: Tone
}) {
  return (
    <span className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${TONE_STYLES[tone]} ${TONE_ACCENTS[tone]}`}>
      {label}
    </span>
  )
}

export function DashboardKeyValue({
  label,
  value,
  accent,
}: {
  label: string
  value: string
  accent?: string
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">{label}</p>
      <p className={`mt-2 text-lg font-semibold text-slate-950 ${accent ?? ''}`}>{value}</p>
    </div>
  )
}

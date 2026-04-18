import Link from 'next/link'
import type { ReactNode } from 'react'

type Tone = 'slate' | 'blue' | 'emerald' | 'amber'

const TONE_STYLES: Record<Tone, string> = {
  slate: 'border-[color:var(--border)] bg-white',
  blue: 'border-[#d6e4e8] bg-[#f3f8f8]',
  emerald: 'border-[#d2e6e0] bg-[#eef7f4]',
  amber: 'border-[#eadfbe] bg-[#faf6ea]',
}

const TONE_ACCENTS: Record<Tone, string> = {
  slate: 'text-[color:var(--text)]',
  blue: 'text-[#234B57]',
  emerald: 'text-[#3C8D8A]',
  amber: 'text-[#8C6B1F]',
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
    <section className={`overflow-visible rounded-[30px] border p-6 shadow-[0_18px_48px_rgba(19,32,51,0.08)] ${TONE_STYLES[tone]}`}>
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.5fr),minmax(320px,0.9fr)]">
        <div>
          <p className={`text-xs font-semibold uppercase tracking-[0.22em] ${TONE_ACCENTS[tone]}`}>{eyebrow}</p>
          <h1 className="mt-3 text-3xl font-bold tracking-tight text-[color:var(--ink)]">{title}</h1>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-[color:var(--text)]">{description}</p>
          {meta ? <div className="mt-5 flex flex-wrap gap-2">{meta}</div> : null}
          {actions ? <div className="mt-5 flex flex-wrap items-center gap-3">{actions}</div> : null}
        </div>
        {aside ? (
          <div className="rounded-3xl border border-white/80 bg-white/90 p-5 shadow-[0_16px_40px_rgba(19,32,51,0.06)]">
            {aside}
          </div>
        ) : null}
      </div>
    </section>
  )
}

export function DashboardContextHeader({
  eyebrow,
  title,
  description,
  meta,
  actions,
  aside,
}: {
  eyebrow: string
  title: string
  description?: string
  meta?: ReactNode
  actions?: ReactNode
  aside?: ReactNode
}) {
  return (
    <section className="rounded-[30px] border border-[color:var(--border)] bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(246,248,250,0.92))] p-5 shadow-[0_12px_32px_rgba(19,32,51,0.05)] sm:p-6">
      <div className="grid gap-5 xl:grid-cols-[minmax(0,1.35fr),minmax(280px,0.65fr)]">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.26em] text-[color:var(--muted)]">
            {eyebrow}
          </p>
          <h1 className="mt-3 text-2xl font-semibold tracking-[-0.03em] text-[color:var(--ink)] sm:text-[2rem]">
            {title}
          </h1>
          {description ? (
            <p className="mt-3 max-w-3xl text-sm leading-7 text-[color:var(--text)]">{description}</p>
          ) : null}
          {meta ? <div className="mt-4 flex flex-wrap gap-2">{meta}</div> : null}
          {actions ? <div className="mt-4 flex flex-wrap items-center gap-3">{actions}</div> : null}
        </div>
        {aside ? (
          <div className="rounded-[24px] border border-white/80 bg-white/88 p-4 shadow-[0_10px_24px_rgba(19,32,51,0.04)] sm:p-5">
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
  id,
  tone = 'slate',
}: {
  title: string
  description?: string
  eyebrow?: string
  aside?: ReactNode
  children: ReactNode
  id?: string
  tone?: Tone
}) {
  return (
    <section id={id} className={`scroll-mt-36 rounded-[28px] border p-5 shadow-[0_16px_42px_rgba(19,32,51,0.06)] sm:p-6 ${TONE_STYLES[tone]}`}>
      <div className="flex flex-col gap-4 border-b border-[color:var(--border)]/80 pb-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          {eyebrow ? (
            <p className={`text-xs font-semibold uppercase tracking-[0.22em] ${TONE_ACCENTS[tone]}`}>{eyebrow}</p>
          ) : null}
          <h2 className="mt-1 text-lg font-semibold text-[color:var(--ink)]">{title}</h2>
          {description ? <p className="mt-2 max-w-3xl text-sm leading-6 text-[color:var(--text)]">{description}</p> : null}
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
      className="group scroll-mt-36 rounded-[24px] border border-[color:var(--border)] bg-white shadow-[0_14px_36px_rgba(19,32,51,0.05)]"
    >
      <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 sm:px-6">
        <div>
          <p className="text-base font-semibold text-[color:var(--ink)]">{title}</p>
          {description ? <p className="mt-1 text-sm leading-6 text-[color:var(--text)]">{description}</p> : null}
        </div>
        <div className="flex items-center gap-3">
          {badge}
          <span className="rounded-full border border-[color:var(--border)] bg-[color:var(--bg)] px-3 py-1 text-xs font-medium text-[color:var(--text)]">
            <span className="group-open:hidden">Toon</span>
            <span className="hidden group-open:inline">Verberg</span>
            {' '}detail
          </span>
        </div>
      </summary>
      <div className="border-t border-[color:var(--border)]/80 px-5 py-5 sm:px-6">{children}</div>
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
    <div className={`rounded-[24px] border p-4 shadow-[0_8px_24px_rgba(19,32,51,0.04)] sm:p-5 ${TONE_STYLES[tone]}`}>
      {eyebrow ? <p className={`text-xs font-semibold uppercase tracking-[0.18em] ${TONE_ACCENTS[tone]}`}>{eyebrow}</p> : null}
      <p className="mt-1 text-sm font-semibold text-[color:var(--ink)]">{title}</p>
      {value ? <p className="mt-3 text-3xl font-bold tracking-tight text-[color:var(--ink)]">{value}</p> : null}
      <p className="mt-3 text-sm leading-6 text-[color:var(--text)]">{body}</p>
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
  helpText,
}: {
  label: string
  value: string
  accent?: string
  helpText?: string
}) {
  return (
    <div className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--bg)] px-4 py-3">
      <div className="flex items-center gap-1.5">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[color:var(--muted)]">{label}</p>
        {helpText ? <InfoTooltip text={helpText} /> : null}
      </div>
      <p className={`mt-2 text-lg font-semibold text-[color:var(--ink)] ${accent ?? ''}`}>{value}</p>
    </div>
  )
}

export function DashboardSummaryBar({
  items,
  anchors,
  actions,
}: {
  items: Array<{ label: string; value: string; tone?: Tone }>
  anchors: Array<{ id: string; label: string }>
  actions?: ReactNode
}) {
  return (
    <div className="sticky top-[4.35rem] z-30 space-y-3">
      <div className="rounded-[24px] border border-[color:var(--border)] bg-[color:var(--surface)]/95 p-3 shadow-[0_18px_44px_rgba(19,32,51,0.10)] backdrop-blur">
        <div className="grid gap-3 xl:grid-cols-[minmax(0,1fr),auto] xl:items-start">
          <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-4">
            {items.map((item) => (
              <div
                key={item.label}
                className={`rounded-2xl border px-4 py-3 ${TONE_STYLES[item.tone ?? 'slate']}`}
              >
                <p className={`text-[11px] font-semibold uppercase tracking-[0.18em] ${TONE_ACCENTS[item.tone ?? 'slate']}`}>
                  {item.label}
                </p>
                <p className="mt-2 text-sm font-semibold text-[color:var(--ink)]">{item.value}</p>
              </div>
            ))}
          </div>
          {actions ? <div className="flex flex-wrap items-center gap-2 xl:justify-end">{actions}</div> : null}
        </div>
      </div>
      <nav className="rounded-[22px] border border-[color:var(--border)] bg-[color:var(--surface)]/95 px-3 py-2 shadow-[0_12px_28px_rgba(19,32,51,0.08)] backdrop-blur">
        <div className="flex flex-wrap gap-2">
          {anchors.map((anchor) => (
            <a
              key={anchor.id}
              href={`#${anchor.id}`}
              className="rounded-full border border-[color:var(--border)] bg-[color:var(--bg)] px-3 py-2 text-xs font-semibold text-[color:var(--text)] transition-colors hover:border-[color:var(--teal)] hover:text-[color:var(--ink)]"
            >
              {anchor.label}
            </a>
          ))}
        </div>
      </nav>
    </div>
  )
}

export function DashboardPrimaryNav({
  items,
}: {
  items: Array<{ href: string; label: string; active?: boolean }>
}) {
  return (
    <nav className="sticky top-[4.35rem] z-20 rounded-[24px] border border-[color:var(--border)] bg-[color:var(--surface)]/95 px-3 py-3 shadow-[0_14px_36px_rgba(19,32,51,0.08)] backdrop-blur">
      <div className="flex flex-wrap gap-2">
        {items.map((item) => (
          <Link
            key={item.label}
            href={item.href}
            className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
              item.active
                ? 'border border-[color:var(--ink)] bg-[color:var(--ink)] text-[color:var(--bg)]'
                : 'border border-[color:var(--border)] bg-white text-[color:var(--text)] hover:border-[color:var(--teal)] hover:text-[color:var(--ink)]'
            }`}
          >
            {item.label}
          </Link>
        ))}
      </div>
    </nav>
  )
}

export function DashboardTimeline({
  items,
  title,
  description,
}: {
  title?: string
  description?: string
  items: Array<{ title: string; body: string; tone?: Tone }>
}) {
  return (
    <div className="rounded-[24px] border border-[color:var(--border)] bg-[color:var(--bg)] p-4 sm:p-5">
      {title ? <h3 className="text-sm font-semibold text-[color:var(--ink)]">{title}</h3> : null}
      {description ? <p className="mt-1 text-sm leading-6 text-[color:var(--text)]">{description}</p> : null}
      <div className="mt-4 space-y-4">
        {items.map((item, index) => (
          <div key={`${item.title}-${index}`} className="grid gap-4 md:grid-cols-[84px,minmax(0,1fr)]">
            <div className="flex items-start gap-3 md:flex-col md:gap-2">
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-[color:var(--ink)] text-sm font-semibold text-[color:var(--bg)]">
                {index + 1}
              </span>
              <div className="hidden h-full w-px bg-[color:var(--border)] md:block" />
            </div>
            <div className={`rounded-[22px] border p-4 ${TONE_STYLES[item.tone ?? 'slate']}`}>
              <p className={`text-xs font-semibold uppercase tracking-[0.18em] ${TONE_ACCENTS[item.tone ?? 'slate']}`}>
                Fase {index + 1}
              </p>
              <p className="mt-2 text-sm font-semibold text-[color:var(--ink)]">{item.title}</p>
              <p className="mt-2 text-sm leading-6 text-[color:var(--text)]">{item.body}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export function InfoTooltip({ text }: { text: string }) {
  return (
    <span className="group relative inline-flex items-center">
      <button
        type="button"
        aria-label="Meer informatie"
        className="inline-flex h-4 w-4 items-center justify-center rounded-full border border-[color:var(--border)] bg-white text-[10px] font-semibold leading-none text-[color:var(--muted)] transition-colors hover:border-[color:var(--text)] hover:text-[color:var(--ink)] focus:border-[color:var(--teal)] focus:text-[color:var(--teal)] focus:outline-none focus:ring-2 focus:ring-[color:var(--teal-light)]"
      >
        i
      </button>
      <span className="pointer-events-none absolute bottom-full left-1/2 z-30 mb-2 hidden w-64 -translate-x-1/2 rounded-xl bg-[color:var(--ink)] px-3 py-2 text-xs font-medium leading-5 text-white shadow-xl group-hover:block group-focus-within:block">
        {text}
      </span>
    </span>
  )
}

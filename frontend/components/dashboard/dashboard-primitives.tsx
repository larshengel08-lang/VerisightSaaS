import React, { type ReactNode } from 'react'

type Tone = 'slate' | 'blue' | 'emerald' | 'amber'

const TONE_SURFACES: Record<Tone, string> = {
  slate: 'border-[color:var(--dashboard-frame-border)] bg-[color:var(--dashboard-surface)]',
  blue: 'border-[#c8d7df] bg-[color:var(--dashboard-blue-soft)]',
  emerald: 'border-[color:var(--dashboard-accent-soft-border)] bg-[color:var(--dashboard-accent-soft)]',
  amber: 'border-[#e6d6af] bg-[color:var(--dashboard-amber-soft)]',
}

const TONE_LABELS: Record<Tone, string> = {
  slate: 'text-[color:var(--dashboard-text)]',
  blue: 'text-[#204655]',
  emerald: 'text-[color:var(--dashboard-accent-strong)]',
  amber: 'text-[#7a5b18]',
}

const CARD_SHADOW = 'shadow-[0_18px_40px_rgba(17,24,39,0.07)]'
const PANEL_GLOW = 'before:pointer-events-none before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-white/72'

function joinClasses(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(' ')
}

function DashboardSectionHeader({
  eyebrow,
  title,
  description,
  aside,
  tone,
}: {
  eyebrow?: string
  title: string
  description?: string
  aside?: ReactNode
  tone: Tone
}) {
  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
      <div className="min-w-0">
        {eyebrow ? (
          <p className={joinClasses('text-[11px] font-semibold uppercase tracking-[0.24em]', TONE_LABELS[tone])}>
            {eyebrow}
          </p>
        ) : null}
        <h2 className="mt-2 max-w-4xl text-[1.65rem] font-semibold tracking-[-0.04em] text-[color:var(--dashboard-ink)] sm:text-[1.85rem]">
          {title}
        </h2>
        {description ? (
          <p className="mt-3 max-w-4xl text-sm leading-7 text-[color:var(--dashboard-text)] sm:text-[0.95rem]">
            {description}
          </p>
        ) : null}
      </div>
      {aside ? <div className="shrink-0 lg:max-w-[340px] lg:text-right">{aside}</div> : null}
    </div>
  )
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
    <section
      data-dashboard-primitive="hero"
      className={joinClasses(
        'relative overflow-hidden rounded-[34px] border px-6 py-6 sm:px-7 sm:py-7',
        CARD_SHADOW,
        PANEL_GLOW,
        TONE_SURFACES[tone],
      )}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.86),transparent_36%)]" />
      <div className="relative grid gap-5 xl:grid-cols-[minmax(0,1.4fr),minmax(280px,0.6fr)] xl:items-start">
        <div className="min-w-0">
          <p className={joinClasses('text-[11px] font-semibold uppercase tracking-[0.24em]', TONE_LABELS[tone])}>
            {eyebrow}
          </p>
          <h1 className="mt-3 max-w-4xl text-[2rem] font-semibold tracking-[-0.05em] text-[color:var(--dashboard-ink)] sm:text-[2.45rem]">
            {title}
          </h1>
          <p className="mt-4 max-w-4xl text-sm leading-7 text-[color:var(--dashboard-text)] sm:text-[0.97rem]">
            {description}
          </p>
          {meta ? <div className="mt-5 flex flex-wrap gap-2">{meta}</div> : null}
          {actions ? <div className="mt-6 flex flex-wrap items-center gap-3">{actions}</div> : null}
        </div>
        {aside ? (
          <div className="rounded-[28px] border border-white/75 bg-white/84 p-5 shadow-[0_20px_40px_rgba(17,24,39,0.07)] backdrop-blur">
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
    <section
      id={id}
      data-dashboard-primitive="section"
      className={joinClasses(
        'relative scroll-mt-40 overflow-hidden rounded-[32px] border px-5 py-5 sm:px-6 sm:py-6',
        CARD_SHADOW,
        PANEL_GLOW,
        TONE_SURFACES[tone],
      )}
    >
      <DashboardSectionHeader
        eyebrow={eyebrow}
        title={title}
        description={description}
        aside={aside}
        tone={tone}
      />
      <div className="mt-5 border-t border-white/72 pt-5">{children}</div>
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
      className={joinClasses(
        'group scroll-mt-40 overflow-hidden rounded-[30px] border border-[color:var(--dashboard-frame-border)] bg-[color:var(--dashboard-surface)]',
        CARD_SHADOW,
      )}
    >
      <summary className="flex cursor-pointer list-none flex-col gap-4 px-5 py-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0">
          <p className="text-base font-semibold text-[color:var(--dashboard-ink)]">{title}</p>
          {description ? (
            <p className="mt-2 max-w-3xl text-sm leading-6 text-[color:var(--dashboard-text)]">{description}</p>
          ) : null}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {badge}
          <span className="rounded-full border border-[color:var(--dashboard-frame-border)] bg-[color:var(--dashboard-soft)] px-3 py-1.5 text-xs font-semibold text-[color:var(--dashboard-text)]">
            <span className="group-open:hidden">Toon detail</span>
            <span className="hidden group-open:inline">Verberg detail</span>
          </span>
        </div>
      </summary>
      <div className="border-t border-[color:var(--dashboard-frame-border)] px-5 py-5 sm:px-6">{children}</div>
    </details>
  )
}

export function DashboardStatCard({
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
    <div
      data-dashboard-primitive="stat-card"
      className={joinClasses(
        'relative overflow-hidden rounded-[28px] border px-4 py-4 sm:px-5 sm:py-5',
        CARD_SHADOW,
        PANEL_GLOW,
        TONE_SURFACES[tone],
      )}
    >
      {eyebrow ? (
        <p className={joinClasses('text-[11px] font-semibold uppercase tracking-[0.22em]', TONE_LABELS[tone])}>
          {eyebrow}
        </p>
      ) : null}
      <p className="mt-2 text-sm font-semibold text-[color:var(--dashboard-ink)]">{title}</p>
      {value ? (
        <p className="mt-4 text-[2.15rem] font-semibold tracking-[-0.06em] text-[color:var(--dashboard-ink)]">
          {value}
        </p>
      ) : null}
      <p className="mt-3 text-sm leading-6 text-[color:var(--dashboard-text)]">{body}</p>
    </div>
  )
}

export const DashboardPanel = DashboardStatCard

export function DashboardChartPanel({
  eyebrow,
  title,
  description,
  aside,
  children,
  tone = 'slate',
}: {
  eyebrow?: string
  title: string
  description?: string
  aside?: ReactNode
  children: ReactNode
  tone?: Tone
}) {
  return (
    <div
      data-dashboard-primitive="chart-panel"
      className={joinClasses(
        'relative overflow-hidden rounded-[28px] border px-4 py-4 sm:px-5 sm:py-5',
        CARD_SHADOW,
        PANEL_GLOW,
        TONE_SURFACES[tone],
      )}
    >
      <DashboardSectionHeader
        eyebrow={eyebrow}
        title={title}
        description={description}
        aside={aside}
        tone={tone}
      />
      <div className="mt-5 border-t border-white/70 pt-5">{children}</div>
    </div>
  )
}

export function DashboardRecommendationRail({
  eyebrow,
  title,
  description,
  aside,
  children,
  tone = 'blue',
}: {
  eyebrow?: string
  title: string
  description?: string
  aside?: ReactNode
  children: ReactNode
  tone?: Tone
}) {
  return (
    <section
      data-dashboard-primitive="recommendation-rail"
      className={joinClasses(
        'relative overflow-hidden rounded-[30px] border px-4 py-4 sm:px-5 sm:py-5',
        CARD_SHADOW,
        PANEL_GLOW,
        TONE_SURFACES[tone],
      )}
    >
      <div className="grid gap-5 xl:grid-cols-[minmax(220px,0.34fr),minmax(0,0.66fr)] xl:items-start">
        <div className="rounded-[24px] border border-white/70 bg-white/78 px-4 py-4">
          {eyebrow ? (
            <p className={joinClasses('text-[11px] font-semibold uppercase tracking-[0.24em]', TONE_LABELS[tone])}>
              {eyebrow}
            </p>
          ) : null}
          <h3 className="mt-3 text-[1.35rem] font-semibold tracking-[-0.04em] text-[color:var(--dashboard-ink)]">
            {title}
          </h3>
          {description ? (
            <p className="mt-3 text-sm leading-7 text-[color:var(--dashboard-text)]">{description}</p>
          ) : null}
          {aside ? <div className="mt-4">{aside}</div> : null}
        </div>
        <div className="min-w-0">{children}</div>
      </div>
    </section>
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
    <span
      className={joinClasses(
        'inline-flex items-center rounded-full border px-3 py-1.5 text-xs font-semibold',
        TONE_SURFACES[tone],
        TONE_LABELS[tone],
      )}
    >
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
    <div className="rounded-[24px] border border-[color:var(--dashboard-frame-border)] bg-[color:var(--dashboard-soft)] px-4 py-3">
      <div className="flex items-center gap-1.5">
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[color:var(--dashboard-muted)]">
          {label}
        </p>
        {helpText ? <InfoTooltip text={helpText} /> : null}
      </div>
      <p className={joinClasses('mt-2 text-lg font-semibold text-[color:var(--dashboard-ink)]', accent)}>{value}</p>
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
    <div className="sticky top-[5.85rem] z-30 space-y-3">
      <div className="rounded-[28px] border border-[color:var(--dashboard-frame-border)] bg-[color:var(--dashboard-topbar-strong)] p-3 shadow-[0_24px_52px_rgba(17,24,39,0.10)] backdrop-blur-xl">
        <div className="grid gap-3 xl:grid-cols-[minmax(0,1fr),auto] xl:items-start">
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            {items.map((item) => (
              <div
                key={item.label}
                className={joinClasses(
                  'rounded-[22px] border px-4 py-3',
                  TONE_SURFACES[item.tone ?? 'slate'],
                  TONE_LABELS[item.tone ?? 'slate'],
                )}
              >
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em]">{item.label}</p>
                <p className="mt-2 text-sm font-semibold text-[color:var(--dashboard-ink)]">{item.value}</p>
              </div>
            ))}
          </div>
          {actions ? <div className="flex flex-wrap items-center gap-2 xl:justify-end">{actions}</div> : null}
        </div>
      </div>

      <nav className="rounded-[24px] border border-[color:var(--dashboard-frame-border)] bg-[color:var(--dashboard-topbar-strong)] px-3 py-2 shadow-[0_16px_34px_rgba(17,24,39,0.07)] backdrop-blur-xl">
        <div className="flex flex-wrap gap-2">
          {anchors.map((anchor) => (
            <a
              key={anchor.id}
              href={`#${anchor.id}`}
              className="rounded-full border border-[color:var(--dashboard-frame-border)] bg-[color:var(--dashboard-surface)] px-3 py-2 text-xs font-semibold text-[color:var(--dashboard-text)] transition-colors hover:border-[color:var(--dashboard-accent-soft-border)] hover:text-[color:var(--dashboard-accent-strong)]"
            >
              {anchor.label}
            </a>
          ))}
        </div>
      </nav>
    </div>
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
    <div className="rounded-[28px] border border-[color:var(--dashboard-frame-border)] bg-[color:var(--dashboard-soft)] p-4 sm:p-5">
      {title ? <h3 className="text-sm font-semibold text-[color:var(--dashboard-ink)]">{title}</h3> : null}
      {description ? <p className="mt-2 text-sm leading-6 text-[color:var(--dashboard-text)]">{description}</p> : null}
      <div className="mt-5 space-y-4">
        {items.map((item, index) => (
          <div key={`${item.title}-${index}`} className="grid gap-4 md:grid-cols-[88px,minmax(0,1fr)]">
            <div className="flex items-start gap-3 md:flex-col md:gap-2">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[color:var(--dashboard-ink)] text-sm font-semibold text-white">
                {index + 1}
              </span>
              <div className="hidden h-full w-px bg-[color:var(--dashboard-frame-border)] md:block" />
            </div>
            <div
              className={joinClasses(
                'rounded-[24px] border px-4 py-4',
                TONE_SURFACES[item.tone ?? 'slate'],
                CARD_SHADOW,
              )}
            >
              <p className={joinClasses('text-[11px] font-semibold uppercase tracking-[0.18em]', TONE_LABELS[item.tone ?? 'slate'])}>
                Fase {index + 1}
              </p>
              <p className="mt-2 text-sm font-semibold text-[color:var(--dashboard-ink)]">{item.title}</p>
              <p className="mt-2 text-sm leading-6 text-[color:var(--dashboard-text)]">{item.body}</p>
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
        className="inline-flex h-4 w-4 items-center justify-center rounded-full border border-[color:var(--dashboard-frame-border)] bg-white text-[10px] font-semibold leading-none text-[color:var(--dashboard-muted)] transition-colors hover:border-[color:var(--dashboard-accent-soft-border)] hover:text-[color:var(--dashboard-accent-strong)] focus:border-[color:var(--dashboard-accent-soft-border)] focus:text-[color:var(--dashboard-accent-strong)] focus:outline-none focus:ring-2 focus:ring-[color:var(--dashboard-accent-soft)]"
      >
        i
      </button>
      <span className="pointer-events-none absolute bottom-full left-1/2 z-30 mb-2 hidden w-64 -translate-x-1/2 rounded-2xl bg-[color:var(--dashboard-ink)] px-3 py-2 text-xs font-medium leading-5 text-white shadow-xl group-hover:block group-focus-within:block">
        {text}
      </span>
    </span>
  )
}

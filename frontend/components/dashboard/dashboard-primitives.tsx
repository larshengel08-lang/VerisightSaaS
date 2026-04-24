import React, { type ReactNode } from 'react'

type Tone = 'slate' | 'blue' | 'emerald' | 'amber'
type Surface = 'default' | 'ops'

const TONE_SURFACES: Record<Tone, string> = {
  slate: 'border-[color:var(--dashboard-frame-border)] bg-[color:var(--dashboard-surface)]',
  blue: 'border-[#c8d7df] bg-[color:var(--dashboard-blue-soft)]',
  emerald: 'border-[color:var(--dashboard-accent-soft-border)] bg-[color:var(--dashboard-accent-soft)]',
  amber: 'border-[#e6d6af] bg-[color:var(--dashboard-amber-soft)]',
}

const OPS_TONE_SURFACES: Record<Tone, string> = {
  slate: 'border-[color:var(--border)] bg-white',
  blue: 'border-[#dfe6ea] bg-[#fbfcfd]',
  emerald: 'border-[#d8e4df] bg-[#f8fbf9]',
  amber: 'border-[#e7e0d1] bg-[#fcfbf7]',
}

const TONE_LABELS: Record<Tone, string> = {
  slate: 'text-[color:var(--dashboard-text)]',
  blue: 'text-[#204655]',
  emerald: 'text-[color:var(--dashboard-accent-strong)]',
  amber: 'text-[#7a5b18]',
}

const OPS_TONE_LABELS: Record<Tone, string> = {
  slate: 'text-[color:var(--text)]',
  blue: 'text-[color:var(--text)]',
  emerald: 'text-[#3C8D8A]',
  amber: 'text-[#8C6B1F]',
}

const CARD_SHADOW = 'shadow-[0_18px_40px_rgba(17,24,39,0.07)]'
const PANEL_GLOW = 'before:pointer-events-none before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-white/72'

function joinClasses(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(' ')
}

function getToneSurface(tone: Tone, surface: Surface) {
  return surface === 'ops' ? OPS_TONE_SURFACES[tone] : TONE_SURFACES[tone]
}

function getToneLabel(tone: Tone, surface: Surface) {
  return surface === 'ops' ? OPS_TONE_LABELS[tone] : TONE_LABELS[tone]
}

function DashboardSectionHeader({
  eyebrow,
  title,
  description,
  aside,
  tone,
  surface,
}: {
  eyebrow?: string
  title: string
  description?: string
  aside?: ReactNode
  tone: Tone
  surface: Surface
}) {
  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
      <div className="min-w-0">
        {eyebrow ? (
          <p
            className={joinClasses(
              surface === 'ops' ? 'text-xs tracking-[0.22em]' : 'text-[11px] tracking-[0.24em]',
              'font-semibold uppercase',
              getToneLabel(tone, surface),
            )}
          >
            {eyebrow}
          </p>
        ) : null}
        <h2
          className={joinClasses(
            surface === 'ops'
              ? 'mt-1 text-lg text-[color:var(--ink)]'
              : 'mt-2 max-w-4xl text-[1.65rem] text-[color:var(--dashboard-ink)] sm:text-[1.85rem]',
            'font-semibold tracking-[-0.04em]',
          )}
        >
          {title}
        </h2>
        {description ? (
          <p
            className={joinClasses(
              surface === 'ops'
                ? 'mt-2 max-w-3xl text-sm leading-6 text-[color:var(--text)]'
                : 'mt-3 max-w-4xl text-sm leading-7 text-[color:var(--dashboard-text)] sm:text-[0.95rem]',
            )}
          >
            {description}
          </p>
        ) : null}
      </div>
      {aside ? <div className={surface === 'ops' ? 'sm:text-right' : 'shrink-0 lg:max-w-[340px] lg:text-right'}>{aside}</div> : null}
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
  surface = 'default',
}: {
  eyebrow: string
  title: string
  description: string
  meta?: ReactNode
  actions?: ReactNode
  aside?: ReactNode
  tone?: Tone
  surface?: Surface
}) {
  const toneSurface = getToneSurface(tone, surface)

  return (
    <section
      data-dashboard-primitive="hero"
      className={joinClasses(
        surface === 'ops'
          ? 'overflow-visible rounded-[24px] border p-5 shadow-[0_10px_28px_rgba(19,32,51,0.05)] sm:p-6'
          : 'relative overflow-hidden rounded-[34px] border px-6 py-6 sm:px-7 sm:py-7',
        surface === 'default' && CARD_SHADOW,
        surface === 'default' && PANEL_GLOW,
        toneSurface,
      )}
    >
      {surface === 'default' ? (
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.86),transparent_36%)]" />
      ) : null}
      <div
        className={joinClasses(
          surface === 'ops'
            ? 'grid gap-6 xl:grid-cols-[minmax(0,1.5fr),minmax(320px,0.9fr)]'
            : 'relative grid gap-5 xl:grid-cols-[minmax(0,1.4fr),minmax(280px,0.6fr)] xl:items-start',
        )}
      >
        <div className={surface === 'default' ? 'min-w-0' : undefined}>
          <p
            className={joinClasses(
              surface === 'ops' ? 'text-xs tracking-[0.22em]' : 'text-[11px] tracking-[0.24em]',
              'font-semibold uppercase',
              getToneLabel(tone, surface),
            )}
          >
            {eyebrow}
          </p>
          <h1
            className={joinClasses(
              surface === 'ops'
                ? 'mt-3 text-[1.75rem] font-bold tracking-tight text-[color:var(--ink)] sm:text-[2rem]'
                : 'mt-3 max-w-4xl text-[2rem] font-semibold tracking-[-0.05em] text-[color:var(--dashboard-ink)] sm:text-[2.45rem]',
            )}
          >
            {title}
          </h1>
          <p
            className={joinClasses(
              surface === 'ops'
                ? 'mt-3 max-w-3xl text-sm leading-6 text-[color:var(--text)]'
                : 'mt-4 max-w-4xl text-sm leading-7 text-[color:var(--dashboard-text)] sm:text-[0.97rem]',
            )}
          >
            {description}
          </p>
          {meta ? <div className="mt-5 flex flex-wrap gap-2">{meta}</div> : null}
          {actions ? <div className={surface === 'ops' ? 'mt-5 flex flex-wrap items-center gap-3' : 'mt-6 flex flex-wrap items-center gap-3'}>{actions}</div> : null}
        </div>
        {aside ? (
          <div
            className={joinClasses(
              surface === 'ops'
                ? 'rounded-[22px] border border-slate-200 bg-white p-4 shadow-[0_8px_24px_rgba(19,32,51,0.04)]'
                : 'rounded-[28px] border border-white/75 bg-white/84 p-5 shadow-[0_20px_40px_rgba(17,24,39,0.07)] backdrop-blur',
            )}
          >
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
  surface = 'default',
}: {
  title: string
  description?: string
  eyebrow?: string
  aside?: ReactNode
  children: ReactNode
  id?: string
  tone?: Tone
  surface?: Surface
}) {
  return (
    <section
      id={id}
      data-dashboard-primitive="section"
      className={joinClasses(
        surface === 'ops'
          ? 'scroll-mt-36 rounded-[24px] border p-5 shadow-[0_10px_28px_rgba(19,32,51,0.05)]'
          : 'relative scroll-mt-40 overflow-hidden rounded-[32px] border px-5 py-5 sm:px-6 sm:py-6',
        surface === 'default' && CARD_SHADOW,
        surface === 'default' && PANEL_GLOW,
        getToneSurface(tone, surface),
      )}
    >
      <DashboardSectionHeader
        eyebrow={eyebrow}
        title={title}
        description={description}
        aside={aside}
        tone={tone}
        surface={surface}
      />
      <div
        className={joinClasses(
          surface === 'ops'
            ? 'mt-5 border-t border-[color:var(--border)]/80 pt-5'
            : 'mt-5 border-t border-white/72 pt-5',
        )}
      >
        {children}
      </div>
    </section>
  )
}

export function DashboardDisclosure({
  title,
  description,
  children,
  defaultOpen = false,
  badge,
  surface = 'default',
}: {
  title: string
  description?: string
  children: ReactNode
  defaultOpen?: boolean
  badge?: ReactNode
  surface?: Surface
}) {
  return (
    <details
      open={defaultOpen}
      className={joinClasses(
        surface === 'ops'
          ? 'group scroll-mt-36 rounded-[20px] border border-[color:var(--border)] bg-white shadow-[0_8px_24px_rgba(19,32,51,0.04)]'
          : 'group scroll-mt-40 overflow-hidden rounded-[30px] border border-[color:var(--dashboard-frame-border)] bg-[color:var(--dashboard-surface)]',
        surface === 'default' && CARD_SHADOW,
      )}
    >
      <summary className="flex cursor-pointer list-none flex-col gap-4 px-5 py-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0">
          <p className={joinClasses('text-base font-semibold', surface === 'ops' ? 'text-[color:var(--ink)]' : 'text-[color:var(--dashboard-ink)]')}>{title}</p>
          {description ? (
            <p
              className={joinClasses(
                surface === 'ops'
                  ? 'mt-1 text-sm leading-6 text-[color:var(--text)]'
                  : 'mt-2 max-w-3xl text-sm leading-6 text-[color:var(--dashboard-text)]',
              )}
            >
              {description}
            </p>
          ) : null}
        </div>
        <div className={surface === 'ops' ? 'flex items-center gap-3' : 'flex flex-wrap items-center gap-2'}>
          {badge}
          <span
            className={joinClasses(
              surface === 'ops'
                ? 'rounded-full border border-[color:var(--border)] bg-[color:var(--bg)] px-3 py-1 text-xs font-medium text-[color:var(--text)]'
                : 'rounded-full border border-[color:var(--dashboard-frame-border)] bg-[color:var(--dashboard-soft)] px-3 py-1.5 text-xs font-semibold text-[color:var(--dashboard-text)]',
            )}
          >
            <span className="group-open:hidden">{surface === 'ops' ? 'Toon' : 'Toon detail'}</span>
            <span className="hidden group-open:inline">{surface === 'ops' ? 'Verberg' : 'Verberg detail'}</span>
            {surface === 'ops' ? ' detail' : null}
          </span>
        </div>
      </summary>
      <div
        className={joinClasses(
          surface === 'ops'
            ? 'border-t border-[color:var(--border)]/80 px-5 py-5 sm:px-6'
            : 'border-t border-[color:var(--dashboard-frame-border)] px-5 py-5 sm:px-6',
        )}
      >
        {children}
      </div>
    </details>
  )
}

export function DashboardStatCard({
  title,
  value,
  body,
  tone = 'slate',
  eyebrow,
  surface = 'default',
}: {
  title: string
  value?: string
  body: string
  tone?: Tone
  eyebrow?: string
  surface?: Surface
}) {
  return (
    <div
      data-dashboard-primitive="stat-card"
      className={joinClasses(
        surface === 'ops'
          ? 'rounded-[20px] border p-4 shadow-[0_6px_18px_rgba(19,32,51,0.035)] sm:p-5'
          : 'relative overflow-hidden rounded-[28px] border px-4 py-4 sm:px-5 sm:py-5',
        surface === 'default' && CARD_SHADOW,
        surface === 'default' && PANEL_GLOW,
        getToneSurface(tone, surface),
      )}
    >
      {eyebrow ? (
        <p
          className={joinClasses(
            surface === 'ops' ? 'text-xs tracking-[0.18em]' : 'text-[11px] tracking-[0.22em]',
            'font-semibold uppercase',
            getToneLabel(tone, surface),
          )}
        >
          {eyebrow}
        </p>
      ) : null}
      <p className={joinClasses(surface === 'ops' ? 'mt-1 text-[color:var(--ink)]' : 'mt-2 text-[color:var(--dashboard-ink)]', 'text-sm font-semibold')}>{title}</p>
      {value ? (
        <p
          className={joinClasses(
            surface === 'ops'
              ? 'mt-3 text-[1.7rem] font-bold tracking-tight text-[color:var(--ink)]'
              : 'mt-4 text-[2.15rem] font-semibold tracking-[-0.06em] text-[color:var(--dashboard-ink)]',
          )}
        >
          {value}
        </p>
      ) : null}
      <p className={joinClasses(surface === 'ops' ? 'text-[color:var(--text)]' : 'text-[color:var(--dashboard-text)]', 'mt-3 text-sm leading-6')}>{body}</p>
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
        surface="default"
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
  surface = 'default',
}: {
  label: string
  tone?: Tone
  surface?: Surface
}) {
  return (
    <span
      className={joinClasses(
        surface === 'ops' ? 'px-3 py-1 text-xs' : 'px-3 py-1.5 text-xs',
        'inline-flex items-center rounded-full border font-semibold',
        getToneSurface(tone, surface),
        getToneLabel(tone, surface),
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
  surface = 'default',
}: {
  label: string
  value: string
  accent?: string
  helpText?: string
  surface?: Surface
}) {
  return (
    <div
      className={joinClasses(
        surface === 'ops'
          ? 'rounded-[18px] border border-[color:var(--border)] bg-[color:var(--bg)] px-4 py-3'
          : 'rounded-[24px] border border-[color:var(--dashboard-frame-border)] bg-[color:var(--dashboard-soft)] px-4 py-3',
      )}
    >
      <div className="flex items-center gap-1.5">
        <p
          className={joinClasses(
            surface === 'ops' ? 'text-[color:var(--muted)]' : 'text-[color:var(--dashboard-muted)]',
            'text-[11px] font-semibold uppercase tracking-[0.22em]',
          )}
        >
          {label}
        </p>
        {helpText ? <InfoTooltip text={helpText} /> : null}
      </div>
      <p
        className={joinClasses(
          surface === 'ops' ? 'text-[color:var(--ink)]' : 'text-[color:var(--dashboard-ink)]',
          'mt-2 text-lg font-semibold',
          accent,
        )}
      >
        {value}
      </p>
    </div>
  )
}

export function DashboardSummaryBar({
  items,
  anchors,
  actions,
  surface = 'default',
}: {
  items: Array<{ label: string; value: string; tone?: Tone }>
  anchors: Array<{ id: string; label: string }>
  actions?: ReactNode
  surface?: Surface
}) {
  return (
    <div className={joinClasses(surface === 'ops' ? 'sticky top-[4.35rem] z-30 space-y-3' : 'sticky top-[5.85rem] z-30 space-y-3')}>
      <div
        className={joinClasses(
          surface === 'ops'
            ? 'rounded-[20px] border border-[color:var(--border)] bg-[color:var(--surface)]/95 p-3 shadow-[0_10px_24px_rgba(19,32,51,0.08)] backdrop-blur'
            : 'rounded-[28px] border border-[color:var(--dashboard-frame-border)] bg-[color:var(--dashboard-topbar-strong)] p-3 shadow-[0_24px_52px_rgba(17,24,39,0.10)] backdrop-blur-xl',
        )}
      >
        <div className="grid gap-3 xl:grid-cols-[minmax(0,1fr),auto] xl:items-start">
          <div className={joinClasses(surface === 'ops' ? 'grid gap-2 md:grid-cols-2 xl:grid-cols-4' : 'grid gap-3 md:grid-cols-2 xl:grid-cols-4')}>
            {items.map((item) => (
              <div
                key={item.label}
                className={joinClasses(
                  surface === 'ops' ? 'rounded-2xl border px-4 py-3' : 'rounded-[22px] border px-4 py-3',
                  getToneSurface(item.tone ?? 'slate', surface),
                  surface === 'default' && getToneLabel(item.tone ?? 'slate', surface),
                )}
              >
                <p
                  className={joinClasses(
                    'text-[11px] font-semibold uppercase tracking-[0.18em]',
                    surface === 'ops' && getToneLabel(item.tone ?? 'slate', surface),
                  )}
                >
                  {item.label}
                </p>
                <p className={joinClasses(surface === 'ops' ? 'text-[color:var(--ink)]' : 'text-[color:var(--dashboard-ink)]', 'mt-2 text-sm font-semibold')}>
                  {item.value}
                </p>
              </div>
            ))}
          </div>
          {actions ? <div className="flex flex-wrap items-center gap-2 xl:justify-end">{actions}</div> : null}
        </div>
      </div>

      <nav
        className={joinClasses(
          surface === 'ops'
            ? 'rounded-[18px] border border-[color:var(--border)] bg-[color:var(--surface)]/95 px-3 py-2 shadow-[0_12px_28px_rgba(19,32,51,0.08)] backdrop-blur'
            : 'rounded-[24px] border border-[color:var(--dashboard-frame-border)] bg-[color:var(--dashboard-topbar-strong)] px-3 py-2 shadow-[0_16px_34px_rgba(17,24,39,0.07)] backdrop-blur-xl',
        )}
      >
        <div className="flex flex-wrap gap-2">
          {anchors.map((anchor) => (
            <a
              key={anchor.id}
              href={`#${anchor.id}`}
              className={joinClasses(
                surface === 'ops'
                  ? 'rounded-full border border-[color:var(--border)] bg-[color:var(--bg)] px-3 py-2 text-xs font-semibold text-[color:var(--text)] transition-colors hover:border-[color:var(--teal)] hover:text-[color:var(--ink)]'
                  : 'rounded-full border border-[color:var(--dashboard-frame-border)] bg-[color:var(--dashboard-surface)] px-3 py-2 text-xs font-semibold text-[color:var(--dashboard-text)] transition-colors hover:border-[color:var(--dashboard-accent-soft-border)] hover:text-[color:var(--dashboard-accent-strong)]',
              )}
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
  surface = 'default',
}: {
  title?: string
  description?: string
  items: Array<{ title: string; body: string; tone?: Tone }>
  surface?: Surface
}) {
  return (
    <div
      className={joinClasses(
        surface === 'ops'
          ? 'rounded-[20px] border border-[color:var(--border)] bg-[color:var(--bg)] p-4 sm:p-5'
          : 'rounded-[28px] border border-[color:var(--dashboard-frame-border)] bg-[color:var(--dashboard-soft)] p-4 sm:p-5',
      )}
    >
      {title ? (
        <h3 className={joinClasses(surface === 'ops' ? 'text-[color:var(--ink)]' : 'text-[color:var(--dashboard-ink)]', 'text-sm font-semibold')}>
          {title}
        </h3>
      ) : null}
      {description ? (
        <p className={joinClasses(surface === 'ops' ? 'mt-1 text-[color:var(--text)]' : 'mt-2 text-[color:var(--dashboard-text)]', 'text-sm leading-6')}>
          {description}
        </p>
      ) : null}
      <div className={joinClasses(surface === 'ops' ? 'mt-4 space-y-4' : 'mt-5 space-y-4')}>
        {items.map((item, index) => (
          <div key={`${item.title}-${index}`} className="grid gap-4 md:grid-cols-[88px,minmax(0,1fr)]">
            <div className="flex items-start gap-3 md:flex-col md:gap-2">
              <span
                className={joinClasses(
                  surface === 'ops'
                    ? 'h-9 w-9 bg-[color:var(--ink)] text-[color:var(--bg)]'
                    : 'h-10 w-10 bg-[color:var(--dashboard-ink)] text-white',
                  'inline-flex items-center justify-center rounded-full text-sm font-semibold',
                )}
              >
                {index + 1}
              </span>
              <div
                className={joinClasses(
                  surface === 'ops' ? 'bg-[color:var(--border)]' : 'bg-[color:var(--dashboard-frame-border)]',
                  'hidden h-full w-px md:block',
                )}
              />
            </div>
            <div
              className={joinClasses(
                surface === 'ops' ? 'rounded-[18px] border p-4' : 'rounded-[24px] border px-4 py-4',
                surface === 'default' && CARD_SHADOW,
                getToneSurface(item.tone ?? 'slate', surface),
              )}
            >
              <p
                className={joinClasses(
                  surface === 'ops' ? 'text-xs' : 'text-[11px]',
                  'font-semibold uppercase tracking-[0.18em]',
                  getToneLabel(item.tone ?? 'slate', surface),
                )}
              >
                Fase {index + 1}
              </p>
              <p className={joinClasses(surface === 'ops' ? 'text-[color:var(--ink)]' : 'text-[color:var(--dashboard-ink)]', 'mt-2 text-sm font-semibold')}>
                {item.title}
              </p>
              <p className={joinClasses(surface === 'ops' ? 'text-[color:var(--text)]' : 'text-[color:var(--dashboard-text)]', 'mt-2 text-sm leading-6')}>
                {item.body}
              </p>
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

import React, { type ReactNode } from 'react'

type Tone = 'slate' | 'blue' | 'emerald' | 'amber'
type Surface = 'default' | 'ops'

const TONE_SURFACES: Record<Tone, string> = {
  slate:   'border-[color:var(--dashboard-frame-border)] bg-[color:var(--dashboard-surface)]',
  blue:    'border-[#c4d4dc] bg-[color:var(--dashboard-blue-soft)]',
  emerald: 'border-[color:var(--dashboard-accent-soft-border)] bg-[color:var(--dashboard-accent-soft)]',
  amber:   'border-[#e2d3a8] bg-[color:var(--dashboard-amber-soft)]',
}

const OPS_TONE_SURFACES: Record<Tone, string> = {
  slate:   'border-[color:var(--dashboard-frame-border)] bg-white',
  blue:    'border-[#d8e4ea] bg-[#f8fbfd]',
  emerald: 'border-[color:var(--dashboard-accent-soft-border)] bg-[color:var(--dashboard-accent-soft)]',
  amber:   'border-[#e5dcc8] bg-[#fdfaf4]',
}

const TONE_LABELS: Record<Tone, string> = {
  slate:   'text-[color:var(--dashboard-muted)]',
  blue:    'text-[#1f4455]',
  emerald: 'text-[color:var(--dashboard-accent-strong)]',
  amber:   'text-[#7a5918]',
}

const OPS_TONE_LABELS: Record<Tone, string> = {
  slate:   'text-[color:var(--dashboard-muted)]',
  blue:    'text-[color:var(--dashboard-text)]',
  emerald: 'text-[color:var(--dashboard-accent-strong)]',
  amber:   'text-[#8a651c]',
}

const CARD_SHADOW = 'shadow-[var(--dashboard-shadow-soft)]'
const PANEL_GLOW = 'before:pointer-events-none before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-white/60'

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
              'text-[11px] font-semibold uppercase tracking-[0.2em]',
              getToneLabel(tone, surface),
            )}
          >
            {eyebrow}
          </p>
        ) : null}
        <h2
          className={joinClasses(
            surface === 'ops'
              ? 'mt-1.5 text-[1.1rem] text-[color:var(--ink)]'
              : 'mt-2 max-w-4xl text-[1.5rem] text-[color:var(--dashboard-ink)] sm:text-[1.65rem]',
            'font-semibold tracking-[-0.035em]',
          )}
        >
          {title}
        </h2>
        {description ? (
          <p
            className={joinClasses(
              surface === 'ops'
                ? 'mt-2 max-w-3xl text-sm leading-6 text-[color:var(--dashboard-text)]'
                : 'mt-2.5 max-w-3xl text-sm leading-[1.7] text-[color:var(--dashboard-text)]',
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
          ? 'overflow-visible rounded-[var(--dashboard-radius-card)] border p-5 shadow-[var(--dashboard-shadow-card)] sm:p-6'
          : 'relative overflow-hidden rounded-[var(--dashboard-radius-hero)] border px-6 py-6 sm:px-7 sm:py-7',
        surface === 'default' && CARD_SHADOW,
        surface === 'default' && PANEL_GLOW,
        toneSurface,
      )}
    >
      {surface === 'default' ? (
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_-10%,rgba(255,255,255,0.9),transparent_48%)]" />
      ) : null}
      <div
        className={joinClasses(
          surface === 'ops'
            ? 'grid gap-6 xl:grid-cols-[minmax(0,1.5fr),minmax(300px,0.85fr)]'
            : 'relative grid gap-5 xl:grid-cols-[minmax(0,1.4fr),minmax(260px,0.6fr)] xl:items-start',
        )}
      >
        <div className={surface === 'default' ? 'min-w-0' : undefined}>
          <p
            className={joinClasses(
              'text-[11px] font-semibold uppercase tracking-[0.22em]',
              getToneLabel(tone, surface),
            )}
          >
            {eyebrow}
          </p>
          <h1
            className={joinClasses(
              surface === 'ops'
                ? 'mt-2.5 text-[1.65rem] font-semibold tracking-[-0.03em] text-[color:var(--ink)] sm:text-[1.85rem]'
                : 'mt-2.5 max-w-4xl text-[1.9rem] font-semibold tracking-[-0.04em] text-[color:var(--dashboard-ink)] sm:text-[2.25rem]',
            )}
          >
            {title}
          </h1>
          <p
            className={joinClasses(
              surface === 'ops'
                ? 'mt-3 max-w-3xl text-sm leading-6 text-[color:var(--dashboard-text)]'
                : 'mt-3 max-w-3xl text-sm leading-7 text-[color:var(--dashboard-text)] sm:text-[0.95rem]',
            )}
          >
            {description}
          </p>
          {meta ? <div className="mt-4 flex flex-wrap gap-2">{meta}</div> : null}
          {actions ? <div className="mt-5 flex flex-wrap items-center gap-2.5">{actions}</div> : null}
        </div>
        {aside ? (
          <div
            className={joinClasses(
              surface === 'ops'
                ? 'rounded-[var(--dashboard-radius-card)] border border-[color:var(--dashboard-frame-border)] bg-white p-4 shadow-[var(--dashboard-shadow-card)]'
                : 'rounded-[var(--dashboard-radius-card)] border border-white/70 bg-white/88 p-5 shadow-[var(--dashboard-shadow-card)] backdrop-blur',
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
          ? 'scroll-mt-36 rounded-[var(--dashboard-radius-card)] border p-5 shadow-[var(--dashboard-shadow-card)]'
          : 'relative scroll-mt-40 overflow-hidden rounded-[var(--dashboard-radius-hero)] border px-5 py-5 sm:px-6 sm:py-6',
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
            ? 'mt-5 border-t border-[color:var(--dashboard-frame-border)]/70 pt-5'
            : 'mt-5 border-t border-[color:var(--dashboard-frame-border)]/60 pt-5',
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
          ? 'rounded-[var(--dashboard-radius-card)] border p-4 shadow-[var(--dashboard-shadow-card)] sm:p-5'
          : 'relative overflow-hidden rounded-[var(--dashboard-radius-card)] border px-4 py-4 sm:px-5 sm:py-5',
        surface === 'default' && CARD_SHADOW,
        surface === 'default' && PANEL_GLOW,
        getToneSurface(tone, surface),
      )}
    >
      {eyebrow ? (
        <p
          className={joinClasses(
            'text-[11px] font-semibold uppercase tracking-[0.2em]',
            getToneLabel(tone, surface),
          )}
        >
          {eyebrow}
        </p>
      ) : null}
      <p className={joinClasses(
        surface === 'ops' ? 'text-[color:var(--ink)]' : 'text-[color:var(--dashboard-ink)]',
        eyebrow ? 'mt-1.5' : 'mt-0',
        'text-sm font-semibold',
      )}>
        {title}
      </p>
      {value ? (
        <p
          className={joinClasses(
            'dash-number',
            surface === 'ops'
              ? 'mt-3 text-[1.9rem] text-[color:var(--ink)]'
              : 'mt-3 text-[2.2rem] text-[color:var(--dashboard-ink)]',
          )}
        >
          {value}
        </p>
      ) : null}
      <p className={joinClasses(
        surface === 'ops' ? 'text-[color:var(--dashboard-text)]' : 'text-[color:var(--dashboard-text)]',
        'mt-3 text-sm leading-[1.65]',
      )}>
        {body}
      </p>
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
        'inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-semibold tracking-[0.01em]',
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
        'rounded-[var(--dashboard-radius-card)] border px-4 py-3',
        surface === 'ops'
          ? 'border-[color:var(--border)] bg-[color:var(--bg)]'
          : 'border-[color:var(--dashboard-frame-border)] bg-[color:var(--dashboard-soft)]',
      )}
    >
      <div className="flex items-center gap-1.5">
        <p
          className={joinClasses(
            'text-[11px] font-semibold uppercase tracking-[0.2em]',
            surface === 'ops' ? 'text-[color:var(--muted)]' : 'text-[color:var(--dashboard-muted)]',
          )}
        >
          {label}
        </p>
        {helpText ? <InfoTooltip text={helpText} /> : null}
      </div>
      <p
        className={joinClasses(
          'mt-2 dash-number text-[1.5rem]',
          surface === 'ops' ? 'text-[color:var(--ink)]' : 'text-[color:var(--dashboard-ink)]',
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

export type RiskBand = 'HOOG' | 'MIDDEN' | 'LAAG'

const RISK_ACCENT_COLORS: Record<RiskBand, string> = {
  HOOG: '#C65B52',
  MIDDEN: '#C88C20',
  LAAG: '#2E7C6D',
}

export function SignalStatCard({
  label,
  value,
  subline,
  band,
}: {
  label: string
  value: string
  subline?: string
  band?: RiskBand | 'neutral'
}) {
  const accentColor = band && band !== 'neutral' ? RISK_ACCENT_COLORS[band] : '#8A7D6E'

  return (
    <div
      className="relative flex overflow-hidden rounded-[18px]"
      style={{
        background: 'var(--dashboard-surface)',
        border: '1px solid var(--dashboard-frame-border)',
        boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
        padding: '20px 20px 18px',
      }}
    >
      {/* Inset left accent bar */}
      <div
        className="absolute left-0 top-[6px] bottom-[6px] w-[3px] rounded-r-full"
        style={{ backgroundColor: accentColor }}
      />
      <div className="min-w-0 pl-4">
        <p
          className="text-[0.65rem] font-medium uppercase"
          style={{ color: 'var(--dashboard-muted)', letterSpacing: '0.18em' }}
        >
          {label}
        </p>
        <p
          className="mt-2 font-medium leading-none"
          style={{ fontSize: '2.0rem', color: 'var(--dashboard-ink)' }}
        >
          {value}
        </p>
        {subline && (
          <p className="mt-2 text-[0.80rem]" style={{ color: 'var(--dashboard-muted)' }}>
            {subline}
          </p>
        )}
      </div>
    </div>
  )
}

export function InsightStatCard({
  label,
  value,
  subline,
}: {
  label: string
  value: string
  subline?: string
}) {
  return (
    <div
      className="relative flex overflow-hidden rounded-[18px]"
      style={{
        background: 'var(--dashboard-surface)',
        border: '1px solid var(--dashboard-frame-border)',
        boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
        padding: '20px 20px 18px',
      }}
    >
      {/* Neutral inset bar */}
      <div
        className="absolute left-0 top-[6px] bottom-[6px] w-[3px] rounded-r-full"
        style={{ backgroundColor: '#8A7D6E' }}
      />
      <div className="min-w-0 pl-4">
        <p
          className="text-[0.65rem] font-medium uppercase"
          style={{ color: 'var(--dashboard-muted)', letterSpacing: '0.18em' }}
        >
          {label}
        </p>
        <p
          className="mt-2 font-semibold leading-snug"
          style={{ fontSize: '1.25rem', color: 'var(--dashboard-ink)', letterSpacing: '-0.01em' }}
        >
          {value}
        </p>
        {subline && (
          <p className="mt-2 text-[0.80rem]" style={{ color: 'var(--dashboard-muted)' }}>
            {subline}
          </p>
        )}
      </div>
    </div>
  )
}

export function FocusPanel({
  items,
}: {
  items: Array<{ text: string; moduleLabel?: string }>
}) {
  return (
    <aside
      className="hidden w-[300px] shrink-0 rounded-[18px] xl:block"
      style={{
        background: '#132033',
        padding: '24px',
        alignSelf: 'start',
        position: 'sticky',
        top: '80px',
      }}
    >
      {/* Eyebrow */}
      <div className="flex items-center gap-2 mb-4">
        <div className="h-4 w-[2px] rounded-full" style={{ backgroundColor: '#2E7C6D' }} />
        <p
          className="text-[0.65rem] font-medium uppercase"
          style={{ color: 'rgba(246,241,233,0.55)', letterSpacing: '0.18em' }}
        >
          Aanbevolen Focus
        </p>
      </div>

      {/* Heading */}
      <p
        className="font-semibold leading-snug text-white mb-5"
        style={{ fontSize: '1.2rem' }}
      >
        Waar nu aandacht naartoe
      </p>

      {/* Items */}
      <ol className="space-y-4">
        {items.map((item, i) => (
          <li key={i} className="flex gap-3">
            <span
              className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[0.65rem] font-semibold"
              style={{ background: 'rgba(255,255,255,0.08)', color: 'rgba(246,241,233,0.70)' }}
            >
              {i + 1}
            </span>
            <div className="min-w-0">
              <p className="text-[0.875rem] leading-snug" style={{ color: 'rgba(246,241,233,0.85)' }}>
                {item.text}
              </p>
              {item.moduleLabel && (
                <span
                  className="mt-1.5 inline-block rounded-full px-2 py-0.5 text-[0.60rem] font-medium uppercase"
                  style={{
                    background: 'rgba(255,255,255,0.07)',
                    color: 'rgba(246,241,233,0.50)',
                    letterSpacing: '0.12em',
                  }}
                >
                  {item.moduleLabel}
                </span>
              )}
            </div>
          </li>
        ))}
      </ol>
    </aside>
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

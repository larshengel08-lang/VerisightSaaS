import type { ReactNode } from 'react'

type AccentTone = 'exit' | 'retention'

function cx(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(' ')
}

function getAccentClasses(tone: AccentTone) {
  if (tone === 'retention') {
    return {
      soft: 'bg-[#E8F3EF] text-[#2E756E] border-[#CFE4DC]',
      ink: 'text-[#2E756E]',
      fill: 'bg-[#3C8D8A]',
      softBg: 'bg-[#F4F8F6]',
    }
  }

  return {
    soft: 'bg-[#FBF0E4] text-[#A96026] border-[#E9D1B7]',
    ink: 'text-[#A96026]',
    fill: 'bg-[#C36A29]',
    softBg: 'bg-[#FBF7F1]',
  }
}

export function ManagementReadHeader({
  tone,
  productLabel,
  title,
  orgLabel,
  periodLabel,
  scopeLabel,
  statusLabel,
  contextLine,
  actions,
}: {
  tone: AccentTone
  productLabel: string
  title: string
  orgLabel: string
  periodLabel: string
  scopeLabel: string
  statusLabel: string
  contextLine: string
  actions?: ReactNode
}) {
  const accent = getAccentClasses(tone)

  return (
    <section className="rounded-[28px] border border-[color:var(--dashboard-frame-border)] bg-[linear-gradient(180deg,rgba(252,250,247,0.98),rgba(245,241,235,0.9))] px-6 py-6 shadow-[0_10px_30px_rgba(15,23,42,0.045)] sm:px-7">
      <div className="flex flex-wrap items-center gap-2.5">
        <span className="inline-flex rounded-full border border-[color:var(--dashboard-frame-border)] bg-white/80 px-3 py-1 text-[0.76rem] font-semibold text-[color:var(--dashboard-text)]">
          {productLabel}
        </span>
        <span className={cx('inline-flex rounded-full border px-3 py-1 text-[0.76rem] font-semibold', accent.soft)}>
          {statusLabel}
        </span>
      </div>

      <h1 className="mt-4 font-serif text-[2.3rem] leading-[0.96] tracking-[-0.055em] text-[color:var(--dashboard-ink)] sm:text-[3rem]">
        {title}
      </h1>

      <div className="mt-5 flex flex-wrap gap-5 text-sm text-[color:var(--dashboard-muted)]">
        <span>{orgLabel}</span>
        <span>{periodLabel}</span>
        <span>{scopeLabel}</span>
      </div>

      <p className="mt-5 max-w-4xl text-[1rem] leading-7 text-[color:var(--dashboard-text)]">
        {contextLine}
      </p>

      {actions ? <div className="mt-6 flex flex-wrap items-center gap-3">{actions}</div> : null}
    </section>
  )
}

export function ManagementReadSection({
  eyebrow,
  title,
  children,
  note,
}: {
  eyebrow: string
  title: string
  children: ReactNode
  note?: ReactNode
}) {
  return (
    <section className="space-y-4">
      <div className="space-y-1.5">
        <p className="text-[0.7rem] font-semibold uppercase tracking-[0.22em] text-[color:var(--dashboard-muted)]">
          {eyebrow}
        </p>
        <h2 className="font-serif text-[1.95rem] leading-[1.02] tracking-[-0.045em] text-[color:var(--dashboard-ink)]">
          {title}
        </h2>
      </div>
      <div className="rounded-[26px] border border-[color:var(--dashboard-frame-border)] bg-[color:var(--dashboard-surface)] px-5 py-5 shadow-[0_2px_8px_rgba(17,24,39,0.03)] sm:px-6">
        {children}
      </div>
      {note ? <div className="px-1 text-sm leading-6 text-[color:var(--dashboard-muted)]">{note}</div> : null}
    </section>
  )
}

export function ManagementReadInfoGrid({
  items,
}: {
  items: Array<{ label: string; value: string }>
}) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {items.map((item) => (
        <div
          key={item.label}
          className="rounded-[18px] border border-[color:var(--dashboard-frame-border)] bg-white/75 px-4 py-4"
        >
          <p className="text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-[color:var(--dashboard-muted)]">
            {item.label}
          </p>
          <p className="mt-3 text-base font-semibold tracking-[-0.02em] text-[color:var(--dashboard-ink)]">
            {item.value}
          </p>
        </div>
      ))}
    </div>
  )
}

export function ManagementReadStrip({
  items,
  note,
}: {
  items: Array<{ label: string; value: string }>
  note?: string
}) {
  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-3">
        {items.map((item) => (
          <div
            key={item.label}
            className="rounded-[18px] border border-[color:var(--dashboard-frame-border)] bg-white/80 px-4 py-4"
          >
            <p className="text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-[color:var(--dashboard-muted)]">
              {item.label}
            </p>
            <p className="dash-number mt-3 text-[1.55rem] leading-none text-[color:var(--dashboard-ink)]">
              {item.value}
            </p>
          </div>
        ))}
      </div>
      {note ? <p className="text-sm leading-6 text-[color:var(--dashboard-text)]">{note}</p> : null}
    </div>
  )
}

export function ManagementReadDistribution({
  tone,
  label,
  value,
  narrative,
  segments,
}: {
  tone: AccentTone
  label: string
  value: string
  narrative: string
  segments: Array<{ label: string; value: string; percent: number }>
}) {
  const accent = getAccentClasses(tone)

  return (
    <div className="rounded-[20px] border border-[color:var(--dashboard-frame-border)] bg-white/78 px-4 py-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-[color:var(--dashboard-muted)]">
            {label}
          </p>
          <p className="dash-number mt-3 text-[2rem] leading-none text-[color:var(--dashboard-ink)]">
            {value}
          </p>
        </div>
      </div>
      <div className="mt-5 space-y-3">
        {segments.map((segment) => (
          <div key={segment.label} className="space-y-1.5">
            <div className="flex items-center justify-between gap-3 text-sm">
              <span className="text-[color:var(--dashboard-text)]">{segment.label}</span>
              <span className="font-semibold text-[color:var(--dashboard-ink)]">{segment.value}</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-[color:var(--dashboard-soft)]">
              <div
                className={cx('h-full rounded-full', accent.fill)}
                style={{ width: `${Math.max(0, Math.min(100, segment.percent))}%` }}
              />
            </div>
          </div>
        ))}
      </div>
      <p className="mt-5 border-t border-[color:var(--dashboard-frame-border)] pt-4 text-sm leading-6 text-[color:var(--dashboard-text)]">
        {narrative}
      </p>
    </div>
  )
}

export function ManagementReadNarratives({
  items,
}: {
  items: Array<{ title: string; body: string; tag?: string }>
}) {
  return (
    <div className="grid gap-3 lg:grid-cols-3">
      {items.map((item) => (
        <div
          key={item.title}
          className="rounded-[18px] border border-[color:var(--dashboard-frame-border)] bg-white/75 px-4 py-4"
        >
          {item.tag ? (
            <p className="text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-[color:var(--dashboard-muted)]">
              {item.tag}
            </p>
          ) : null}
          <h3 className="mt-2 text-[1.02rem] font-semibold tracking-[-0.03em] text-[color:var(--dashboard-ink)]">
            {item.title}
          </h3>
          <p className="mt-3 text-sm leading-6 text-[color:var(--dashboard-text)]">{item.body}</p>
        </div>
      ))}
    </div>
  )
}

export function ManagementReadFactorTable({
  rows,
}: {
  rows: Array<{
    factor: string
    score: string
    signal?: string
    band: string
    note: string
  }>
}) {
  return (
    <div className="overflow-hidden rounded-[20px] border border-[color:var(--dashboard-frame-border)] bg-white/78">
      <div className="hidden gap-4 border-b border-[color:var(--dashboard-frame-border)] bg-[color:var(--dashboard-soft)]/72 px-5 py-3 text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-[color:var(--dashboard-muted)] lg:grid lg:grid-cols-[minmax(0,1.2fr)_108px_128px_152px_minmax(0,1.4fr)]">
        <span>Factor</span>
        <span>Score</span>
        <span>Signaal</span>
        <span>Band</span>
        <span>Managementlezing</span>
      </div>
      <div className="divide-y divide-[color:var(--dashboard-frame-border)]/80">
        {rows.map((row) => (
          <div
            key={row.factor}
            className="grid gap-3 px-5 py-4 lg:grid-cols-[minmax(0,1.2fr)_108px_128px_152px_minmax(0,1.4fr)] lg:items-start lg:gap-4"
          >
            <div>
              <p className="text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-[color:var(--dashboard-muted)] lg:hidden">
                Factor
              </p>
              <p className="text-sm font-semibold tracking-[-0.02em] text-[color:var(--dashboard-ink)]">{row.factor}</p>
            </div>
            <ReadCell mobileLabel="Score" value={row.score} />
            <ReadCell mobileLabel="Signaal" value={row.signal ?? '—'} />
            <ReadCell mobileLabel="Band" value={row.band} />
            <div>
              <p className="text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-[color:var(--dashboard-muted)] lg:hidden">
                Managementlezing
              </p>
                <p className="text-sm leading-6 text-[color:var(--dashboard-text)] lg:leading-[1.55]">{row.note}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function ReadCell({ mobileLabel, value }: { mobileLabel: string; value: string }) {
  return (
    <div>
      <p className="text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-[color:var(--dashboard-muted)] lg:hidden">
        {mobileLabel}
      </p>
        <p className="text-sm font-semibold tabular-nums text-[color:var(--dashboard-ink)]">{value}</p>
    </div>
  )
}

export function ManagementReadBridge({
  tone,
  title,
  body,
  action,
}: {
  tone: AccentTone
  title: string
  body: string
  action?: ReactNode
}) {
  const accent = getAccentClasses(tone)

  return (
    <section className={cx('rounded-[24px] border px-5 py-5 shadow-[0_2px_8px_rgba(17,24,39,0.03)] sm:px-6', accent.softBg, accent.soft)}>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-3xl">
          <p className="text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-[color:var(--dashboard-muted)]">
            Lichte bridge
          </p>
          <h2 className="mt-2 font-serif text-[1.7rem] leading-[1.03] tracking-[-0.04em] text-[color:var(--dashboard-ink)]">
            {title}
          </h2>
          <p className="mt-3 text-sm leading-6 text-[color:var(--dashboard-text)]">{body}</p>
        </div>
        {action ? <div className="shrink-0">{action}</div> : null}
      </div>
    </section>
  )
}

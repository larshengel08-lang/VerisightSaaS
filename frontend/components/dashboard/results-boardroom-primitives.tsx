import type { ReactNode } from 'react'
import Link from 'next/link'

function joinClasses(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(' ')
}

export function ResultsBoardroomHeader({
  moduleHref,
  moduleLabel,
  moduleBackLinkLabel,
  campaignName,
  organizationName,
  routePeriodLabel,
  scopeLabel,
  productLabel,
  statusLabel,
  actions,
}: {
  moduleHref: string
  moduleLabel: string
  moduleBackLinkLabel: string
  campaignName: string
  organizationName: string
  routePeriodLabel: string
  scopeLabel: string
  productLabel: string
  statusLabel: string
  actions?: ReactNode
}) {
  return (
    <header className="space-y-5 border-b border-[rgba(13,27,42,0.15)] pb-6">
      <p className="font-mono text-[0.72rem] font-semibold uppercase tracking-[0.24em] text-[#44505C]">
        <Link href="/dashboard" className="transition-colors hover:text-[#132033]">
          Overzicht
        </Link>{' '}
        /{' '}
        <Link href={moduleHref} className="transition-colors hover:text-[#132033]">
          {moduleLabel}
        </Link>{' '}
        / <span className="text-[#132033]">{campaignName}</span>
      </p>
      <Link
        href={moduleHref}
        className="inline-flex items-center gap-2 text-sm font-medium text-[#44505C] transition-colors hover:text-[#132033]"
      >
        <span aria-hidden="true">&larr;</span> {moduleBackLinkLabel}
      </Link>
      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr),auto] xl:items-end">
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <span className="border border-[rgba(13,27,42,0.15)] bg-[#ffffff] px-3 py-1.5 font-mono text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-[#132033]">
              {productLabel}
            </span>
            <span className="border border-[rgba(13,27,42,0.15)] bg-[#F4F1EA] px-3 py-1.5 font-mono text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-[#44505C]">
              {statusLabel}
            </span>
          </div>
          <h1 className="font-display text-[clamp(2.7rem,7vw,5rem)] leading-[0.9] tracking-[-0.06em] text-[#132033]">
            {campaignName}
          </h1>
          <p className="text-sm leading-6 text-[#44505C]">
            {organizationName} <span aria-hidden="true">&middot;</span> {routePeriodLabel}{' '}
            <span aria-hidden="true">&middot;</span> {scopeLabel}
          </p>
        </div>
        {actions ? <div className="flex flex-wrap items-center gap-3">{actions}</div> : null}
      </div>
    </header>
  )
}

export function ResultsBoardroomSection({
  eyebrow,
  title,
  description,
  aside,
  children,
  tone = 'white',
  className,
}: {
  eyebrow: string
  title: string
  description?: ReactNode
  aside?: ReactNode
  children: ReactNode
  tone?: 'white' | 'chalk' | 'ink'
  className?: string
}) {
  const toneClasses = {
    white: 'bg-white text-[#132033]',
    chalk: 'bg-[#F4F1EA] text-[#132033]',
    ink: 'bg-[#132033] text-white',
  } as const

  return (
    <section
      className={joinClasses(
        'space-y-5 border border-[rgba(13,27,42,0.15)] p-5 sm:p-6',
        toneClasses[tone],
        className,
      )}
    >
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr),auto] lg:items-start">
        <div className="space-y-3">
          <p
            className={joinClasses(
              'font-mono text-[0.72rem] font-semibold uppercase tracking-[0.24em]',
              tone === 'ink' ? 'text-[#F8D284]' : 'text-[#44505C]',
            )}
          >
            {eyebrow}
          </p>
          <h2
            className={joinClasses(
              'font-display text-[clamp(2rem,4vw,3rem)] leading-[0.94] tracking-[-0.055em]',
              tone === 'ink' ? 'text-white' : 'text-[#132033]',
            )}
          >
            {title}
          </h2>
          {description ? (
            <div
              className={joinClasses(
                'max-w-4xl text-sm leading-7',
                tone === 'ink' ? 'text-[#E8EDF2]' : 'text-[#44505C]',
              )}
            >
              {description}
            </div>
          ) : null}
        </div>
        {aside ? <div className="shrink-0">{aside}</div> : null}
      </div>
      {children}
    </section>
  )
}

export function BoardroomMetricTile({
  label,
  value,
  note,
  tone = 'white',
  prominent = false,
}: {
  label: string
  value: string
  note?: string
  tone?: 'white' | 'chalk' | 'amber' | 'ink'
  prominent?: boolean
}) {
  const toneClasses = {
    white: 'border-[rgba(13,27,42,0.15)] bg-white text-[#132033]',
    chalk: 'border-[rgba(13,27,42,0.15)] bg-[#F4F1EA] text-[#132033]',
    amber: 'border-[#D7A74E] bg-[#FEB234] text-[#132033]',
    ink: 'border-[#2B3A4E] bg-[#132033] text-white',
  } as const

  return (
    <div className={joinClasses('space-y-3 border px-4 py-4', toneClasses[tone])}>
      <p
        className={joinClasses(
          'font-mono text-[0.68rem] font-semibold uppercase tracking-[0.22em]',
          tone === 'ink' ? 'text-[#F8D284]' : 'text-[#44505C]',
        )}
      >
        {label}
      </p>
      <p
        className={joinClasses(
          prominent
            ? 'dash-number text-[clamp(2.2rem,5vw,4rem)] leading-none tracking-[-0.06em]'
            : 'dash-number text-[1.5rem] leading-none tracking-[-0.05em]',
        )}
      >
        {value}
      </p>
      {note ? (
        <p className={joinClasses('text-sm leading-6', tone === 'ink' ? 'text-[#E8EDF2]' : 'text-[#44505C]')}>
          {note}
        </p>
      ) : null}
    </div>
  )
}

export function BoardroomEmptyState({
  title,
  body,
}: {
  title: string
  body: string
}) {
  return (
    <div className="border border-dashed border-[rgba(13,27,42,0.18)] bg-[#F4F1EA] px-5 py-5">
      <p className="font-semibold text-[#132033]">{title}</p>
      <p className="mt-2 text-sm leading-6 text-[#44505C]">{body}</p>
    </div>
  )
}

export function BoardroomKeyValueList({
  items,
  tone = 'white',
}: {
  items: Array<{ label: string; value: string }>
  tone?: 'white' | 'chalk' | 'ink'
}) {
  return (
    <dl className="grid gap-px border border-[rgba(13,27,42,0.15)] bg-[rgba(13,27,42,0.15)] sm:grid-cols-2 xl:grid-cols-4">
      {items.map((item) => (
        <div
          key={item.label}
          className={joinClasses(
            'space-y-2 bg-white px-4 py-4',
            tone === 'chalk' && 'bg-[#F4F1EA]',
            tone === 'ink' && 'bg-[#132033] text-white',
          )}
        >
          <dt
            className={joinClasses(
              'font-mono text-[0.68rem] font-semibold uppercase tracking-[0.22em]',
              tone === 'ink' ? 'text-[#F8D284]' : 'text-[#44505C]',
            )}
          >
            {item.label}
          </dt>
          <dd className="dash-number text-[1.45rem] leading-none tracking-[-0.05em]">
            {item.value}
          </dd>
        </div>
      ))}
    </dl>
  )
}

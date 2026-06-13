import Link from 'next/link'
import type { DashboardState, DashboardStateTone } from '@/lib/dashboard/dashboard-state-resolver'
import { DashboardStateActions } from './dashboard-state-actions'

function toneClasses(tone: DashboardStateTone) {
  switch (tone) {
    case 'attention':
      return 'border-[#e7d7af] bg-[#FBF4DF]'
    case 'positive':
      return 'border-[color:var(--dashboard-accent-soft-border)] bg-[color:var(--dashboard-accent-soft)]'
    case 'calm':
      return 'border-dashed border-[color:var(--dashboard-frame-border)] bg-[color:var(--dashboard-surface)]'
    case 'neutral':
    default:
      return 'border-[color:var(--dashboard-frame-border)] bg-white'
  }
}

export function DashboardStateCard({ state, reminderText }: { state: DashboardState; reminderText: string }) {
  const linkCta = state.ctaKind === 'link' && state.ctaLabel && state.ctaHref
  const islandCta = state.ctaKind === 'copy_reminder' || state.ctaKind === 'close_campaign'

  return (
    <section className={`rounded-[22px] border px-6 py-7 ${toneClasses(state.tone)}`}>
      <h1 className="font-serif text-[2rem] leading-[1.05] tracking-[-0.04em] text-[color:var(--dashboard-ink)] sm:text-[2.4rem]">
        {state.primaryMessage}
      </h1>
      <p className="mt-3 max-w-2xl text-[0.98rem] leading-7 text-[color:var(--dashboard-text)]">{state.subtext}</p>

      {state.showProgress ? (
        <div className="mt-6 max-w-md">
          <div className="h-2 w-full overflow-hidden rounded-full bg-[color:var(--dashboard-soft)]">
            <div className="h-full rounded-full bg-[color:var(--dashboard-accent-strong)]" style={{ width: `${Math.min(100, Math.max(0, state.progressPct))}%` }} />
          </div>
          <p className="mt-2 text-xs font-semibold uppercase tracking-[0.16em] text-[color:var(--dashboard-muted)]">
            {state.progressPct}% ingevuld
          </p>
        </div>
      ) : null}

      {linkCta ? (
        <div className="mt-6">
          <Link
            href={state.ctaHref!}
            className="inline-flex items-center justify-center rounded-lg bg-[color:var(--dashboard-ink)] px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#1B2E45]"
          >
            {state.ctaLabel}
          </Link>
        </div>
      ) : null}

      {islandCta ? (
        <div className="mt-6">
          <DashboardStateActions state={state} reminderText={reminderText} />
        </div>
      ) : null}

      {state.secondaryActions.length > 0 ? (
        <div className="mt-4 flex flex-wrap gap-4">
          {state.secondaryActions.map((action) => (
            // Secondary actions (extend / close-without-report / skip-reminder) are shown per spec but
            // intentionally non-interactive: they have no backing field yet (degraded). Do not fake their effect.
            <span key={action.label} className="text-sm font-semibold text-[color:var(--dashboard-accent-strong)]">
              {action.label}
            </span>
          ))}
        </div>
      ) : null}
    </section>
  )
}

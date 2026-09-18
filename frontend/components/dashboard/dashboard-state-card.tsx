import Link from 'next/link'
import type { DashboardState, DashboardStateTone } from '@/lib/dashboard/dashboard-state-resolver'
import { CampaignTimeline } from './campaign-timeline'
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

const linkClass =
  'inline-flex items-center justify-center rounded-lg bg-[color:var(--dashboard-ink)] px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#1B2E45]'

export function DashboardStateCard({ state, reminderText }: { state: DashboardState; reminderText: string }) {
  const linkCta = state.ctaKind === 'link' && state.ctaLabel && state.ctaHref
  const progressPct = Math.min(100, Math.max(0, state.progressPct))

  return (
    <section className={`rounded-[22px] border px-6 py-7 ${toneClasses(state.tone)}`}>
      <h1 className="font-serif text-[2rem] leading-[1.05] tracking-[-0.04em] text-[color:var(--dashboard-ink)] sm:text-[2.4rem]">
        {state.primaryMessage}
      </h1>
      <p className="mt-3 max-w-2xl text-[0.98rem] leading-7 text-[color:var(--dashboard-text)]">{state.subtext}</p>

      {state.showProgress ? (
        <div className="mt-6 max-w-md">
          <div
            className="h-2 w-full overflow-hidden rounded-full bg-[color:var(--dashboard-soft)]"
            role="progressbar"
            aria-valuenow={progressPct}
            aria-valuemin={0}
            aria-valuemax={100}
          >
            <div className="h-full rounded-full bg-[color:var(--dashboard-accent-strong)]" style={{ width: `${progressPct}%` }} />
          </div>
          <p className="mt-2 text-xs font-semibold uppercase tracking-[0.16em] text-[color:var(--dashboard-muted)]">
            {state.progressPct}% ingevuld
          </p>
        </div>
      ) : null}

      {state.timeline ? (
        <div className="mt-6">
          <CampaignTimeline timeline={state.timeline} />
        </div>
      ) : null}

      {linkCta ? (
        <div className="mt-6">
          {state.ctaHref!.startsWith('mailto:') ? (
            <a href={state.ctaHref!} className={linkClass}>
              {state.ctaLabel}
            </a>
          ) : (
            <Link href={state.ctaHref!} className={linkClass}>
              {state.ctaLabel}
            </Link>
          )}
        </div>
      ) : null}

      {/*
        Altijd gemount (niet gegated op ctaKind): na sluiten of verlengen
        verandert de state, en een waarschuwing over een mislukt neveneffect
        moet die overgang overleven. Het eiland rendert zelf null als het niets
        te tonen heeft, dus dit voegt geen dode UI toe.
      */}
      <DashboardStateActions state={state} reminderText={reminderText} />
    </section>
  )
}

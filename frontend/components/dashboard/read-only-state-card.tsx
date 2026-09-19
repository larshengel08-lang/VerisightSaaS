import type { DashboardState } from '@/lib/dashboard/dashboard-state-resolver'
import { CampaignTimeline } from './campaign-timeline'

/**
 * Statusweergave voor iedereen die de meting niet beheert (spec 2026-09-11
 * par. 9): dezelfde resolverstaat als DashboardStateCard, maar zonder knoppen.
 * De server actions zouden die acties voor deze rol toch weigeren; knoppen
 * tonen en pas bij het indrukken weigeren is de valkuil die dit sluit.
 */
export function ReadOnlyStateCard({ state }: { state: DashboardState }) {
  const progressPct = Math.min(100, Math.max(0, state.progressPct))

  return (
    <section className="rounded-[22px] border border-[color:var(--dashboard-frame-border)] bg-white px-6 py-7">
      {state.campaignName ? (
        <p className="mb-1 text-xs font-semibold uppercase tracking-[0.12em] text-[#B07A10]">{state.campaignName}</p>
      ) : null}
      <h1 className="font-serif text-[2rem] leading-[1.05] tracking-[-0.04em] text-[color:var(--dashboard-ink)] sm:text-[2.4rem]">
        {state.primaryMessage}
      </h1>
      <p className="mt-3 max-w-2xl text-[0.98rem] leading-7 text-[color:var(--dashboard-text)]">
        {state.subtext}
      </p>

      {state.showProgress ? (
        <div className="mt-6 max-w-md">
          <div
            className="h-2 w-full overflow-hidden rounded-full bg-[color:var(--dashboard-soft)]"
            role="progressbar"
            aria-valuenow={progressPct}
            aria-valuemin={0}
            aria-valuemax={100}
          >
            <div
              className="h-full rounded-full bg-[color:var(--dashboard-accent-strong)]"
              style={{ width: `${progressPct}%` }}
            />
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

      {state.ctaKind === 'link' && state.ctaLabel && state.ctaHref?.startsWith('mailto:') ? (
        <div className="mt-6">
          <a
            href={state.ctaHref}
            className="inline-flex items-center justify-center rounded-lg bg-[color:var(--dashboard-ink)] px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#1B2E45]"
          >
            {state.ctaLabel}
          </a>
        </div>
      ) : null}

      <p className="mt-6 text-sm text-[color:var(--dashboard-muted)]">
        Alleen de eigenaar van deze Loep-omgeving kan de meting beheren.
      </p>
    </section>
  )
}

import type { DashboardState } from '@/lib/dashboard/dashboard-state-resolver'
import { CampaignTimeline } from './campaign-timeline'
import { DashboardStateActions } from './dashboard-state-actions'

interface Props {
  state: DashboardState
  reminderText: string
  scanLabel: string
}

/**
 * Kaart voor een lopende meting zonder actie van vandaag. De herinneringstekst
 * staat hier bewust niet (spec 2026-09-16 par. 4.4): die verschijnt pas op de
 * herinneringsdag, op de herinneringskaart, zodat niemand op dag één een
 * herinnering stuurt. De tijdlijn zegt wanneer die dag is.
 */
export function RunningStateCard({ state, reminderText, scanLabel }: Props) {
  const pct = Math.min(100, Math.max(0, state.progressPct))

  return (
    <section className="rounded-[22px] border border-[color:var(--dashboard-frame-border)] bg-[color:var(--dashboard-surface)] px-6 py-7">
      <p className="mb-1 text-xs font-semibold uppercase tracking-[0.12em] text-[#B07A10]">
        {scanLabel}
        {state.campaignName ? ` · ${state.campaignName}` : ''}
      </p>
      <h1 className="font-serif text-[2rem] leading-[1.05] tracking-[-0.04em] text-[color:var(--dashboard-ink)]">
        Campagne loopt
      </h1>
      <p className="mt-2 text-[0.95rem] text-[color:var(--dashboard-text)]">
        De uitnodiging is verstuurd. Je volgt hier de respons; op de herinneringsdag staat de herinneringstekst hier klaar.
      </p>

      <div className="mt-6 max-w-sm">
        <div
          className="h-1.5 w-full overflow-hidden rounded-full bg-[color:var(--dashboard-soft)]"
          role="progressbar"
          aria-valuenow={pct}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <div
            className="h-full rounded-full bg-[#0D1B2A] transition-all duration-500"
            style={{ width: `${pct}%` }}
          />
        </div>
        <p className="mt-2 text-xs text-[color:var(--dashboard-muted)]">{state.subtext}</p>
      </div>

      {state.timeline ? (
        <div className="mt-8">
          <CampaignTimeline timeline={state.timeline} />
        </div>
      ) : null}

      <DashboardStateActions state={state} reminderText={reminderText} />
    </section>
  )
}

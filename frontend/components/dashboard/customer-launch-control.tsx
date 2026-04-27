import Link from 'next/link'
import { DashboardChip } from '@/components/dashboard/dashboard-primitives'
import type {
  GuidedBlocker,
  GuidedSelfServeState,
  GuidedStatusBlock,
} from '@/lib/guided-self-serve'

interface Props {
  campaignName: string
  campaignHref?: string
  campaignCtaLabel?: string
  productName: string
  productContext: string
  state: GuidedSelfServeState
}

function getStatusTone(status: GuidedStatusBlock['status']) {
  if (status === 'done') return 'emerald' as const
  if (status === 'current') return 'blue' as const
  return 'slate' as const
}

function getBlockerTone(actor: GuidedBlocker['actor']) {
  if (actor === 'customer') return 'amber' as const
  if (actor === 'verisight') return 'blue' as const
  return 'slate' as const
}

export function CustomerLaunchControl({
  campaignName,
  campaignHref,
  campaignCtaLabel,
  productName,
  productContext,
  state,
}: Props) {
  return (
    <div className="space-y-5">
      {/* Headline + status */}
      <div>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-[0.65rem] font-medium uppercase" style={{ color: 'var(--dashboard-muted)', letterSpacing: '0.18em' }}>
              Uitvoerstatus
            </p>
            <h2 className="mt-1 text-base font-semibold tracking-[-0.02em]" style={{ color: 'var(--dashboard-ink)' }}>
              {state.headline}
            </h2>
          </div>
          <div className="flex flex-wrap gap-2">
            <DashboardChip label={state.currentStateLabel} tone="blue" />
            <DashboardChip
              label={state.dashboardVisible ? 'Dashboard actief' : 'Dashboard nog niet actief'}
              tone={state.dashboardVisible ? 'emerald' : 'amber'}
            />
          </div>
        </div>
        <p className="mt-2 text-sm leading-[1.7]" style={{ color: 'var(--dashboard-text)' }}>
          {state.detail}
        </p>
      </div>

      {/* Product + next action — two flat columns */}
      <div className="grid gap-4 lg:grid-cols-2">
        <div>
          <p className="text-[0.65rem] font-medium uppercase" style={{ color: 'var(--dashboard-muted)', letterSpacing: '0.18em' }}>
            Product · {productName}
          </p>
          <p className="mt-1.5 text-sm font-semibold" style={{ color: 'var(--dashboard-ink)' }}>{campaignName}</p>
          <p className="mt-1.5 text-sm leading-[1.65]" style={{ color: 'var(--dashboard-text)' }}>{productContext}</p>
        </div>
        <div>
          <p className="text-[0.65rem] font-medium uppercase" style={{ color: 'var(--dashboard-muted)', letterSpacing: '0.18em' }}>
            Eerstvolgende stap
          </p>
          <p className="mt-1.5 text-sm font-semibold" style={{ color: 'var(--dashboard-ink)' }}>{state.nextAction.title}</p>
          <p className="mt-1.5 text-sm leading-[1.65]" style={{ color: 'var(--dashboard-text)' }}>{state.nextAction.body}</p>
          {campaignHref && campaignCtaLabel ? (
            <Link
              href={campaignHref}
              className="mt-3 inline-flex rounded-full px-4 py-1.5 text-sm font-semibold transition-colors"
              style={{
                background: 'var(--dashboard-accent-soft)',
                border: '1px solid var(--dashboard-accent-soft-border)',
                color: 'var(--dashboard-accent-strong)',
              }}
            >
              {campaignCtaLabel}
            </Link>
          ) : null}
        </div>
      </div>

      {/* Stepper — flat list, no card per step */}
      <div>
        <p className="mb-3 text-[0.65rem] font-medium uppercase" style={{ color: 'var(--dashboard-muted)', letterSpacing: '0.18em' }}>
          Uitvoerstappen
        </p>
        <ol className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
          {state.statusBlocks.map((item, index) => (
            <li
              key={item.key}
              className="flex items-center justify-between rounded-[10px] px-3 py-2.5"
              style={{
                background: item.status === 'current' ? 'var(--dashboard-accent-soft)' : 'var(--dashboard-soft)',
                border: `1px solid ${item.status === 'current' ? 'var(--dashboard-accent-soft-border)' : 'var(--dashboard-frame-border)'}`,
              }}
            >
              <p className="text-sm" style={{ color: 'var(--dashboard-ink)' }}>
                {index + 1}. {item.label}
              </p>
              <DashboardChip
                label={item.status === 'done' ? 'Rond' : item.status === 'current' ? 'Nu actief' : 'Geblokkeerd'}
                tone={getStatusTone(item.status)}
              />
            </li>
          ))}
        </ol>
      </div>

      {/* Blockers — only if any */}
      {state.blockers.length > 0 && (
        <div>
          <p className="mb-3 text-[0.65rem] font-medium uppercase" style={{ color: 'var(--dashboard-muted)', letterSpacing: '0.18em' }}>
            Open blokkades
          </p>
          <div className="space-y-2">
            {state.blockers.map((blocker) => (
              <div
                key={`${blocker.title}-${blocker.recovery}`}
                className="flex flex-wrap items-start justify-between gap-3 rounded-[10px] px-3 py-3"
                style={{ background: 'var(--dashboard-soft)', border: '1px solid var(--dashboard-frame-border)' }}
              >
                <div>
                  <p className="text-sm font-semibold" style={{ color: 'var(--dashboard-ink)' }}>{blocker.title}</p>
                  <p className="mt-1 text-sm" style={{ color: 'var(--dashboard-text)' }}>{blocker.detail}</p>
                  <p className="mt-1 text-sm font-medium" style={{ color: 'var(--dashboard-ink)' }}>Herstel: {blocker.recovery}</p>
                </div>
                <DashboardChip
                  label={blocker.actor === 'customer' ? 'Jij' : blocker.actor === 'verisight' ? 'Verisight' : 'Samen'}
                  tone={getBlockerTone(blocker.actor)}
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

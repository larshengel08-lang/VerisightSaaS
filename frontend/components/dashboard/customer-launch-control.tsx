import Link from 'next/link'
import {
  DashboardChip,
} from '@/components/dashboard/dashboard-primitives'
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
    <div className="grid gap-4 xl:grid-cols-[minmax(0,1.35fr),minmax(320px,0.65fr)]">
      <div className="rounded-[26px] border border-[color:var(--border)] bg-white p-5 shadow-[0_10px_30px_rgba(19,32,51,0.05)]">
        <div className="flex flex-col gap-3 border-b border-[color:var(--border)]/80 pb-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--muted)]">
              Uitvoerstatus
            </p>
            <h2 className="mt-2 text-xl font-semibold text-[color:var(--ink)]">{state.headline}</h2>
            <p className="mt-2 text-sm leading-6 text-[color:var(--text)]">{state.detail}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <DashboardChip label={state.currentStateLabel} tone="blue" />
            <DashboardChip
              label={state.dashboardVisible ? 'Dashboard actief' : 'Dashboard nog niet actief'}
              tone={state.dashboardVisible ? 'emerald' : 'amber'}
            />
          </div>
        </div>

        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          <div className="rounded-[22px] border border-[color:var(--border)] bg-[color:var(--bg)] p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--muted)]">
              Product
            </p>
            <p className="mt-2 text-base font-semibold text-[color:var(--ink)]">{productName}</p>
            <p className="mt-2 text-sm leading-6 text-[color:var(--text)]">{productContext}</p>
            <p className="mt-3 text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--muted)]">
              Campagne
            </p>
            <p className="mt-2 text-sm font-medium text-[color:var(--ink)]">{campaignName}</p>
          </div>

          <div className="rounded-[22px] border border-[color:var(--border)] bg-[color:var(--bg)] p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--muted)]">
              Waar je staat
            </p>
            <p className="mt-2 text-base font-semibold text-[color:var(--ink)]">{state.currentStateLabel}</p>
            <p className="mt-2 text-sm leading-6 text-[color:var(--text)]">{state.nextAction.body}</p>
            <p className="mt-4 text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--muted)]">
              Eerstvolgende stap
            </p>
            <p className="mt-2 text-sm font-medium text-[color:var(--ink)]">{state.nextAction.title}</p>
          </div>
        </div>

        <div className="mt-4 rounded-[22px] border border-[color:var(--border)] bg-[color:var(--bg)] p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--muted)]">
                Launchstates
              </p>
              <p className="mt-2 text-sm leading-6 text-[color:var(--text)]">
                Een vaste stepper laat zien wat al rond is, wat nu actief is en wat nog geblokkeerd blijft.
              </p>
            </div>
          </div>
          <ol className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {state.statusBlocks.map((item, index) => (
              <li
                key={item.key}
                className="rounded-2xl border border-white bg-white px-4 py-3"
              >
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold text-[color:var(--ink)]">
                    {index + 1}. {item.label}
                  </p>
                  <DashboardChip label={item.status === 'done' ? 'Rond' : item.status === 'current' ? 'Nu actief' : 'Geblokkeerd'} tone={getStatusTone(item.status)} />
                </div>
              </li>
            ))}
          </ol>
        </div>

        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          <div className="rounded-[22px] border border-[color:var(--border)] bg-white p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--muted)]">
              Verisight doet nu
            </p>
            <p className="mt-2 text-sm leading-6 text-[color:var(--text)]">{state.verisightNow}</p>
          </div>
          <div className="rounded-[22px] border border-[color:var(--border)] bg-white p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--muted)]">
              Jij doet nu
            </p>
            <p className="mt-2 text-sm leading-6 text-[color:var(--text)]">{state.customerNow}</p>
          </div>
        </div>

        <div className="mt-4 rounded-[22px] border border-[color:var(--border)] bg-white p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--muted)]">
            Open blokkades
          </p>
          {state.blockers.length === 0 ? (
            <p className="mt-2 text-sm leading-6 text-[color:var(--text)]">
              Er zijn geen open blokkades in deze fase. De route kan nu door naar de eerstvolgende productstap.
            </p>
          ) : (
            <div className="mt-4 space-y-3">
              {state.blockers.map((blocker) => (
                <div key={`${blocker.title}-${blocker.recovery}`} className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--bg)] px-4 py-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-semibold text-[color:var(--ink)]">{blocker.title}</p>
                    <DashboardChip
                      label={blocker.actor === 'customer' ? 'Jij' : blocker.actor === 'verisight' ? 'Verisight' : 'Samen'}
                      tone={getBlockerTone(blocker.actor)}
                    />
                  </div>
                  <p className="mt-2 text-sm leading-6 text-[color:var(--text)]">{blocker.detail}</p>
                  <p className="mt-2 text-sm font-medium leading-6 text-[color:var(--ink)]">
                    Herstel: {blocker.recovery}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="space-y-4">
        <div className="rounded-[26px] border border-[color:var(--border)] bg-[color:var(--bg)] p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--muted)]">
            Volgende stap
          </p>
          <p className="mt-2 text-lg font-semibold text-[color:var(--ink)]">{state.nextAction.title}</p>
          <p className="mt-2 text-sm leading-6 text-[color:var(--text)]">{state.nextAction.body}</p>
          {campaignHref && campaignCtaLabel ? (
            <Link
              href={campaignHref}
              className="mt-4 inline-flex rounded-full border border-[#d6e4e8] bg-[#f3f8f8] px-4 py-2 text-sm font-semibold text-[#234B57] transition-colors hover:border-[#bfd3d8] hover:bg-[#e9f2f3]"
            >
              {campaignCtaLabel}
            </Link>
          ) : null}
        </div>

        <div className="rounded-[26px] border border-[color:var(--border)] bg-white p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--muted)]">
            Productgrenzen
          </p>
          <p className="mt-2 text-sm leading-6 text-[color:var(--text)]">
            Verisight houdt billing, signup, surveyarchitectuur en productscope bewust buiten deze flow. Je ziet alleen de
            actieve campagne, de huidige status en de eerstvolgende toegestane stap.
          </p>
        </div>
      </div>
    </div>
  )
}

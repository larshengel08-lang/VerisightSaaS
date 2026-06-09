import type { ReactNode } from 'react'
import Link from 'next/link'
import { DashboardChip } from '@/components/dashboard/dashboard-primitives'
import { ManagementReadFactorTable } from '@/components/dashboard/management-read-primitives'
import {
  ExitDriversPriorityChart,
  ExitOrgFactorsChart,
  ExitSdtNeedsChart,
} from '@/components/dashboard/exit-dashboard-visuals'

type FactorRow = {
  factor: string
  score: string
  scoreValue: number
  signal?: string
  signalValue: number
  band: string
  note: string
}

type SdtRow = {
  factor: string
  score: string
  scoreValue: number
  signal: string
  band: string
  note: string
}

type NarrativeItem = {
  title: string
  tag: string
  body: string
}

type DistributionSegment = {
  label: string
  value: string
  percent: number
}

type ContributingItem = {
  label: string
  value: string
  body: string
}

interface ExitProductDashboardProps {
  moduleHref: string
  moduleLabel: string
  moduleBackLinkLabel: string
  campaignName: string
  organizationName: string
  routePeriodLabel: string
  scopeLabel: string
  statusLabel: string
  headerActions: ReactNode
  averageSignalScoreLabel: string
  strongestFactorLabel: string
  strongWorkSignalLabel: string
  primaryReasonTitle: string
  primaryReasonBody: string
  whyItMattersItems: NarrativeItem[]
  contributingItems: ContributingItem[]
  totalInvited: string
  totalCompleted: string
  responseRate: string
  responseContextNote: string
  topFactors: FactorRow[]
  distributionSegments: DistributionSegment[]
  factorRows: FactorRow[]
  sdtRows: SdtRow[]
  methodologyContent: ReactNode
}

function SectionShell({
  id,
  eyebrow,
  title,
  children,
}: {
  id: string
  eyebrow: string
  title: string
  children: ReactNode
}) {
  return (
    <section id={id} className="space-y-4 border-t border-slate-200/80 pt-6">
      <div className="space-y-2">
        <p className="text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-[color:var(--dashboard-muted)]">
          {eyebrow}
        </p>
        <h2 className="font-serif text-[1.95rem] leading-[1.02] tracking-[-0.045em] text-[color:var(--dashboard-ink)]">
          {title}
        </h2>
      </div>
      {children}
    </section>
  )
}

function DataGapCard({
  title = 'Onvoldoende data',
  body = 'Nog niet beschikbaar voor een eerlijke analytische weergave.',
}: {
  title?: string
  body?: string
}) {
  return (
    <div className="rounded-[20px] border border-dashed border-slate-200 bg-slate-50 px-5 py-5">
      <p className="text-sm font-semibold text-[color:var(--dashboard-ink)]">{title}</p>
      <p className="mt-2 text-sm leading-6 text-[color:var(--dashboard-text)]">{body}</p>
    </div>
  )
}

export function ExitProductDashboard({
  moduleHref,
  moduleLabel,
  moduleBackLinkLabel,
  campaignName,
  organizationName,
  routePeriodLabel,
  scopeLabel,
  statusLabel,
  headerActions,
  averageSignalScoreLabel,
  strongestFactorLabel,
  strongWorkSignalLabel,
  primaryReasonTitle,
  primaryReasonBody,
  whyItMattersItems,
  contributingItems,
  totalInvited,
  totalCompleted,
  responseRate,
  responseContextNote,
  topFactors,
  distributionSegments,
  factorRows,
  sdtRows,
  methodologyContent,
}: ExitProductDashboardProps) {
  const topFactorCards = topFactors.slice(0, 4)

  return (
    <div className="space-y-10">
      <div className="space-y-4 border-b border-slate-200/80 pb-5">
        <p className="text-[0.78rem] font-medium tracking-[0.01em] text-slate-500">
          <Link href="/dashboard" className="transition-colors hover:text-slate-700">
            Overzicht
          </Link>{' '}
          /{' '}
          <Link href={moduleHref} className="transition-colors hover:text-slate-700">
            {moduleLabel}
          </Link>{' '}
          / <span className="text-slate-700">{campaignName}</span>
        </p>
        <Link
          href={moduleHref}
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition-colors hover:text-slate-700"
        >
          <span aria-hidden="true">&larr;</span> {moduleBackLinkLabel}
        </Link>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2.5">
              <DashboardChip label="ExitScan" tone="amber" />
              <DashboardChip label={statusLabel} tone="slate" />
            </div>
            <h1 className="font-serif text-[2.6rem] leading-[0.96] tracking-[-0.055em] text-[color:var(--dashboard-ink)] sm:text-[3.15rem]">
              {campaignName}
            </h1>
            <p className="text-sm leading-6 text-slate-600">
              {organizationName} <span aria-hidden="true">&middot;</span> {routePeriodLabel}{' '}
              <span aria-hidden="true">&middot;</span> {scopeLabel}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">{headerActions}</div>
        </div>
      </div>

      <SectionShell id="sterkste-signaal" eyebrow="1. Kernsignaal" title="Sterkste signaal">
        <div className="grid gap-4 xl:grid-cols-[minmax(0,1.05fr),minmax(280px,0.95fr)]">
          <div className="rounded-[30px] bg-[linear-gradient(180deg,rgba(255,250,245,0.98),rgba(249,242,235,0.94))] px-6 py-6 shadow-[0_18px_40px_rgba(17,24,39,0.06)] sm:px-7 sm:py-7">
            <p className="text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-[#A96026]">
              Gemiddelde signaalscore
            </p>
            <p className="dash-number mt-3 text-[2.6rem] leading-none text-[color:var(--dashboard-ink)]">
              {averageSignalScoreLabel}
            </p>
            <p className="mt-3 text-sm leading-6 text-[color:var(--dashboard-text)]">
              Dit is het sterkste analytische openingssignaal van deze ExitScan. Het laat zien
              hoe zwaar het gemeten signaal gemiddeld terugkomt in de leesbare responses.
            </p>
          </div>
          <div className="grid gap-4">
            <div className="rounded-[22px] border border-slate-200 bg-white/88 px-5 py-5">
              <p className="text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-slate-500">
                Sterkste factor
              </p>
              <p className="mt-3 text-lg font-semibold tracking-[-0.03em] text-[color:var(--dashboard-ink)]">
                {strongestFactorLabel}
              </p>
            </div>
            <div className="rounded-[22px] border border-slate-200 bg-white/88 px-5 py-5">
              <p className="text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-slate-500">
                Sterk werksignaal
              </p>
              <p className="mt-3 text-lg font-semibold tracking-[-0.03em] text-[color:var(--dashboard-ink)]">
                {strongWorkSignalLabel}
              </p>
            </div>
          </div>
        </div>
      </SectionShell>

      <SectionShell id="waarom-dit-telt" eyebrow="2. Uitleg" title="Waarom dit telt">
        {whyItMattersItems.length > 0 ? (
          <div className="grid gap-4 xl:grid-cols-3">
            {whyItMattersItems.map((item) => (
              <div
                key={`${item.tag}-${item.title}`}
                className="rounded-[20px] bg-[color:var(--dashboard-soft)]/52 px-5 py-5"
              >
                <p className="text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-[color:var(--dashboard-muted)]">
                  {item.tag}
                </p>
                <h3 className="mt-3 text-[1.08rem] font-semibold tracking-[-0.03em] text-[color:var(--dashboard-ink)]">
                  {item.title}
                </h3>
                <p className="mt-3 text-sm leading-6 text-[color:var(--dashboard-text)]">
                  {item.body}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <DataGapCard />
        )}
      </SectionShell>

      <SectionShell
        id="hoofdreden-vertrekbeeld"
        eyebrow="3. Hoofdreden"
        title="Hoofdreden van vertrekbeeld"
      >
        <div className="rounded-[22px] border border-slate-200 bg-white px-5 py-5 shadow-[0_12px_28px_rgba(19,32,51,0.05)]">
          <p className="text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-slate-500">
            Dominante lezing
          </p>
          <h3 className="mt-3 text-[1.3rem] font-semibold tracking-[-0.03em] text-[color:var(--dashboard-ink)]">
            {primaryReasonTitle}
          </h3>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-[color:var(--dashboard-text)]">
            {primaryReasonBody}
          </p>
        </div>
      </SectionShell>

      <SectionShell
        id="meespelende-factoren"
        eyebrow="4. Samenhang"
        title="Meespelende factoren"
      >
        {contributingItems.length > 0 ? (
          <div className="grid gap-4 xl:grid-cols-2">
            {contributingItems.map((item) => (
              <div
                key={item.label}
                className="rounded-[20px] bg-[color:var(--dashboard-soft)]/52 px-5 py-5"
              >
                <p className="text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-[color:var(--dashboard-muted)]">
                  {item.label}
                </p>
                <h3 className="mt-3 text-[1.08rem] font-semibold tracking-[-0.03em] text-[color:var(--dashboard-ink)]">
                  {item.value}
                </h3>
                <p className="mt-3 text-sm leading-6 text-[color:var(--dashboard-text)]">
                  {item.body}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <DataGapCard body="Nog niet beschikbaar voor een tweede analytische laag." />
        )}
      </SectionShell>

      <SectionShell id="responscontext" eyebrow="5. Respons" title="Responscontext">
        <div className="grid gap-4 lg:grid-cols-[minmax(0,0.95fr),minmax(0,1.05fr)] lg:items-start">
          <div className="grid gap-3 sm:grid-cols-3">
            {[
              { label: 'Respons', value: responseRate },
              { label: 'Uitgenodigd', value: totalInvited },
              { label: 'Ingevuld', value: totalCompleted },
            ].map((item) => (
              <div
                key={item.label}
                className="rounded-[18px] bg-[color:var(--dashboard-soft)]/62 px-4 py-4"
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
          <div className="rounded-[20px] bg-[color:var(--dashboard-soft)]/62 px-5 py-4 text-sm leading-6 text-[color:var(--dashboard-text)]">
            {responseContextNote}
          </div>
        </div>
      </SectionShell>

      <SectionShell id="topfactoren" eyebrow="6. Factoren" title="Topfactoren">
        {topFactorCards.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {topFactorCards.map((row) => (
              <div
                key={row.factor}
                className="rounded-[22px] border border-slate-200 bg-white px-5 py-5"
              >
                <p className="text-sm font-semibold text-[color:var(--dashboard-ink)]">
                  {row.factor}
                </p>
                <div className="mt-4 space-y-3 text-sm text-[color:var(--dashboard-text)]">
                  <div className="flex items-center justify-between gap-3">
                    <span>Beleving</span>
                    <span className="font-semibold text-[color:var(--dashboard-ink)]">
                      {row.score}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <span>Signaalsterkte</span>
                    <span className="font-semibold text-[color:var(--dashboard-ink)]">
                      {row.signal ?? 'Nog niet beschikbaar'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <span>Managementband</span>
                    <span className="font-semibold text-[color:var(--dashboard-ink)]">
                      {row.band}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <DataGapCard />
        )}
      </SectionShell>

      <SectionShell
        id="verdeling-vertrekbeeld"
        eyebrow="7. Verdeling"
        title="Verdeling van het vertrekbeeld"
      >
        {distributionSegments.length > 0 ? (
          <div className="grid gap-4 xl:grid-cols-[minmax(0,0.92fr),minmax(0,1.08fr)]">
            <div className="rounded-[20px] bg-[color:var(--dashboard-soft)]/52 px-5 py-5">
              <p className="text-sm leading-6 text-[color:var(--dashboard-text)]">
                Zo verdeelt het leesbare vertrekbeeld zich over werkfrictie, trekfactoren en
                situationele context.
              </p>
              <div className="mt-4 flex h-3 overflow-hidden rounded-full bg-white/85">
                {distributionSegments.map((segment, index) => {
                  const fillTone =
                    index === 0 ? 'bg-[#C36A29]' : index === 1 ? 'bg-[#D7A16B]' : 'bg-[#D9D3CA]'

                  return (
                    <div
                      key={`stack-${segment.label}`}
                      className={fillTone}
                      style={{ width: `${Math.max(0, Math.min(100, segment.percent))}%` }}
                    />
                  )
                })}
              </div>
            </div>
            <div className="space-y-3">
              {distributionSegments.map((segment, index) => {
                const fillTone =
                  index === 0 ? 'bg-[#C36A29]' : index === 1 ? 'bg-[#D7A16B]' : 'bg-[#D9D3CA]'

                return (
                  <div
                    key={segment.label}
                    className="rounded-[20px] bg-[color:var(--dashboard-soft)]/52 px-5 py-4"
                  >
                    <div className="flex items-center justify-between gap-3 text-sm text-slate-700">
                      <span>{segment.label}</span>
                      <span className="font-semibold text-[color:var(--dashboard-ink)]">
                        {segment.value}
                      </span>
                    </div>
                    <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-white/85">
                      <div
                        className={`h-full rounded-full ${fillTone}`}
                        style={{ width: `${Math.max(0, Math.min(100, segment.percent))}%` }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        ) : (
          <DataGapCard />
        )}
      </SectionShell>

      <SectionShell id="driverlaag" eyebrow="8. Drivers" title="Diepere driverlaag">
        {factorRows.length > 0 ? <ExitDriversPriorityChart rows={factorRows} /> : <DataGapCard />}
      </SectionShell>

      {sdtRows.length > 0 ? (
        <SectionShell id="sdt-laag" eyebrow="9. SDT" title="SDT-laag">
          <ExitSdtNeedsChart rows={sdtRows} />
        </SectionShell>
      ) : null}

      <SectionShell id="factorlaag" eyebrow="10. Factoren" title="Uitgebreide factorlaag">
        {factorRows.length > 0 ? (
          <div className="space-y-5">
            <ExitOrgFactorsChart rows={factorRows} />
            <ManagementReadFactorTable rows={factorRows} />
          </div>
        ) : (
          <DataGapCard />
        )}
      </SectionShell>

      <SectionShell
        id="methodische-leesgrenzen"
        eyebrow="11. Methode"
        title="Methodische leesgrenzen"
      >
        {methodologyContent}
      </SectionShell>
    </div>
  )
}

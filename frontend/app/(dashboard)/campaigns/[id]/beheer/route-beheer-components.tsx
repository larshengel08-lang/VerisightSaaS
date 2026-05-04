import Link from 'next/link'
import { DashboardChip, DashboardPanel, DashboardSection } from '@/components/dashboard/dashboard-primitives'
import { CampaignActions } from '../campaign-actions'
import { PdfDownloadButton } from '../pdf-download-button'
import {
  formatLatestActivityLabel,
  getLaunchCardValue,
  type RouteBeheerLifecycleStep,
  type RouteBeheerPageData,
} from './beheer-data'

function joinClasses(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(' ')
}

function sectionButtonClass(kind: 'primary' | 'secondary') {
  return kind === 'primary'
    ? 'inline-flex items-center justify-center rounded-full bg-[color:var(--teal)] px-4 py-2 text-sm font-semibold text-white transition hover:brightness-95'
    : 'inline-flex items-center justify-center rounded-full border border-[color:var(--border)] bg-white px-4 py-2 text-sm font-semibold text-[color:var(--text)] transition hover:border-[color:var(--teal)] hover:text-[color:var(--ink)]'
}

function MetricRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[16px] border border-[color:var(--border)] bg-[color:var(--bg)] px-4 py-3">
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[color:var(--muted)]">
        {label}
      </p>
      <p className="mt-2 text-sm font-semibold text-[color:var(--ink)]">{value}</p>
    </div>
  )
}

export function RouteBeheerHeader({ data }: { data: RouteBeheerPageData }) {
  return (
    <section
      id="route-meta"
      className="rounded-lg border border-[color:var(--border)] bg-white p-5 shadow-[0_1px_4px_rgba(10,25,47,0.04)] sm:p-6"
    >
      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[color:var(--muted)]">
            Routebeheer
          </p>
          <h1 className="mt-3 text-[1.9rem] font-bold tracking-tight text-[color:var(--ink)] sm:text-[2.15rem]">
            Routebeheer
          </h1>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-[color:var(--text)]">
            Beheer livegang, respons en output-readiness voor deze route.
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-2.5 text-sm text-[color:var(--text)]">
            <span>{data.organizationName ?? 'Niet beschikbaar'}</span>
            <span aria-hidden="true">&middot;</span>
            <span>
              {data.scanTypeLabel}
              {data.deliveryModeLabel ? ` ${data.deliveryModeLabel}` : ''}
            </span>
            <span aria-hidden="true">&middot;</span>
            <span>{data.routePeriodLabel}</span>
          </div>
        </div>

        <div className="flex flex-col items-start gap-3 lg:items-end">
          <DashboardChip label={data.statusBadgeLabel} tone={data.statusBadgeTone} surface="ops" />
          <p className="text-sm text-[color:var(--text)]">{formatLatestActivityLabel(data.lastActivityAt)}</p>
          <div className="flex flex-wrap gap-2">
            <Link href={`/campaigns/${data.campaignId}`} className={sectionButtonClass('secondary')}>
              Open dashboard
            </Link>
            {data.reportAvailable ? (
              <PdfDownloadButton
                campaignId={data.campaignId}
                campaignName={data.campaignName}
                scanType={data.scanType}
              />
            ) : null}
          </div>
        </div>
      </div>
    </section>
  )
}

export function RouteBeheerStatusCards({ data }: { data: RouteBeheerPageData }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <DashboardPanel
        title="Livegang"
        value={getLaunchCardValue(data)}
        body={
          data.isActive
            ? 'Laat zien of de route live staat en welk operationeel startmoment nu geldt.'
            : 'Deze route is gesloten; livegang is niet meer actief.'
        }
        tone={data.isActive ? 'emerald' : 'slate'}
        surface="ops"
      />
      <DashboardPanel
        title="Respons"
        value={`${data.totalCompleted}/${data.totalInvited} ingevuld`}
        body={
          data.pendingCount > 0
            ? `${data.pendingCount} openstaand / ${data.completionRatePct != null ? `${data.completionRatePct}% afgerond` : 'Niet beschikbaar'}`
            : 'Alle uitgenodigde respondenten hebben afgerond.'
        }
        tone={data.totalCompleted > 0 ? 'blue' : 'slate'}
        surface="ops"
      />
      <DashboardPanel
        title="Dashboard leesbaarheid"
        value={data.readabilityLabel}
        body={data.readabilityBody}
        tone={data.hasEnoughData ? 'emerald' : data.hasMinDisplay ? 'amber' : 'slate'}
        surface="ops"
      />
      <div className="rounded-lg border border-[color:var(--border)] border-l-4 border-l-[color:var(--teal)] bg-white p-4 shadow-[0_1px_4px_rgba(10,25,47,0.04)] sm:p-5">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[color:var(--muted)]">
          Eerstvolgende stap
        </p>
        <p className="mt-3 text-lg font-semibold text-[color:var(--ink)]">
          {data.nextActionTitle ?? 'Niet beschikbaar'}
        </p>
        <p className="mt-2 text-sm leading-6 text-[color:var(--text)]">
          {data.nextActionBody ?? 'Niet beschikbaar'}
        </p>
        <div className="mt-4">
          <a href="#beheer-onderdelen" className={sectionButtonClass('primary')}>
            Ga naar beheeronderdelen
          </a>
        </div>
      </div>
    </div>
  )
}

export function RouteBeheerBlockerPanel({ blockers }: { blockers: string[] }) {
  if (blockers.length === 0) {
    return null
  }

  return (
    <section className="rounded-lg border border-amber-200 bg-amber-50 p-5 shadow-[0_1px_4px_rgba(10,25,47,0.04)]">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-amber-900">
            Actie nodig
          </p>
          <h2 className="mt-2 text-lg font-semibold text-amber-950">Route vraagt nu operationele aandacht</h2>
          <ul className="mt-3 space-y-2 text-sm leading-6 text-amber-900">
            {blockers.map((blocker) => (
              <li key={blocker} className="flex gap-2">
                <span aria-hidden="true">&bull;</span>
                <span>{blocker}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="flex flex-wrap gap-2">
          <a
            href="#beheer-onderdelen"
            className="inline-flex items-center justify-center rounded-full bg-amber-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-amber-950"
          >
            Ga naar beheeronderdelen
          </a>
          <Link href="#route-meta" className="inline-flex items-center justify-center rounded-full px-3 py-2 text-sm font-semibold text-amber-900 underline underline-offset-4">
            Bekijk routestatus
          </Link>
        </div>
      </div>
    </section>
  )
}

export function RouteBeheerLifecycleBar({ steps }: { steps: RouteBeheerLifecycleStep[] }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-6">
      {steps.map((step, index) => {
        const dotClass =
          step.status === 'done'
            ? 'border-[#3C8D8A] bg-[#3C8D8A] text-white'
            : step.status === 'current'
              ? 'border-[color:var(--teal)] bg-[color:var(--teal)] text-white'
              : 'border-[color:var(--border)] bg-[color:var(--bg)] text-[color:var(--muted)]'

        return (
          <div
            key={step.key}
            className="rounded-[18px] border border-[color:var(--border)] bg-[color:var(--bg)] px-4 py-4"
          >
            <div className="flex items-center gap-3">
              <span
                className={joinClasses(
                  'inline-flex h-9 w-9 items-center justify-center rounded-full border text-sm font-semibold',
                  dotClass,
                )}
              >
                {index + 1}
              </span>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[color:var(--muted)]">
                  {step.label}
                </p>
                <p className="mt-1 text-sm font-semibold text-[color:var(--ink)]">{step.sublabel}</p>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

export function RouteBeheerSectionCards({ data }: { data: RouteBeheerPageData }) {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <div className="rounded-lg border border-[color:var(--border)] bg-white p-5 shadow-[0_1px_4px_rgba(10,25,47,0.04)]">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[color:var(--muted)]">
          Doelgroep controleren
        </p>
        <p className="mt-2 text-lg font-semibold text-[color:var(--ink)]">
          Bekijk importstatus en geimporteerde deelnemers.
        </p>
        <p className="mt-2 text-sm leading-6 text-[color:var(--text)]">
          {data.respondentCount} deelnemers geimporteerd
        </p>
        <div className="mt-4">
          <Link href={`/campaigns/${data.campaignId}#operatie`} className={sectionButtonClass('secondary')}>
            Open doelgroep
          </Link>
        </div>
      </div>

      <div className="rounded-lg border border-[color:var(--border)] bg-white p-5 shadow-[0_1px_4px_rgba(10,25,47,0.04)]">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[color:var(--muted)]">
          Uitnodigingen beheren
        </p>
        <p className="mt-2 text-lg font-semibold text-[color:var(--ink)]">Stuur uitnodigingen of herinnering naar deelnemers.</p>
        <p className="mt-2 text-sm leading-6 text-[color:var(--text)]">
          {data.totalCompleted} ingevuld / {data.pendingCount} openstaand
        </p>
        <div className="mt-4">
          {data.canManageCampaign || data.canExecuteCampaign ? (
            <CampaignActions
              campaignId={data.campaignId}
              isActive={data.isActive}
              pendingCount={data.pendingCount}
              canResendInvites={data.canExecuteCampaign}
              canArchiveCampaign={data.canManageCampaign}
            />
          ) : (
            <p className="text-sm leading-6 text-[color:var(--text)]">
              Alleen de klant owner of Verisight kan uitnodigingen en herinneringen hier verder uitvoeren.
            </p>
          )}
        </div>
      </div>

      <div
        id="route-instellingen"
        className="rounded-lg border border-[color:var(--border)] bg-white p-5 shadow-[0_1px_4px_rgba(10,25,47,0.04)]"
      >
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[color:var(--muted)]">
          Route-instellingen
        </p>
        <p className="mt-2 text-lg font-semibold text-[color:var(--ink)]">Bekijk startdatum, scantype en uitvoermodus.</p>
        <div className="mt-3 space-y-3">
          <MetricRow label="Route" value={data.routeSettingsLabel} />
          <MetricRow label="Startdatum" value={data.routeSettingsBody.replace('Startdatum: ', '')} />
        </div>
        <div className="mt-4">
          <a href="#route-meta" className={sectionButtonClass('secondary')}>
            Bekijk instellingen
          </a>
        </div>
      </div>

      <div className="rounded-lg border border-[color:var(--border)] bg-white p-5 shadow-[0_1px_4px_rgba(10,25,47,0.04)]">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[color:var(--muted)]">
          Output openen
        </p>
        <p className="mt-2 text-lg font-semibold text-[color:var(--ink)]">Ga naar dashboard of download het rapport.</p>
        <p className="mt-2 text-sm leading-6 text-[color:var(--text)]">{data.outputStatusLabel}</p>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <Link href={`/campaigns/${data.campaignId}`} className={sectionButtonClass('secondary')}>
            Open dashboard
          </Link>
          {data.reportAvailable ? (
            <PdfDownloadButton
              campaignId={data.campaignId}
              campaignName={data.campaignName}
              scanType={data.scanType}
            />
          ) : (
            <span className="text-sm text-[color:var(--text)]">Open rapport zodra de eerste dashboardread beschikbaar is.</span>
          )}
        </div>
      </div>

      <div className="rounded-lg border border-[color:var(--border)] bg-white p-5 shadow-[0_1px_4px_rgba(10,25,47,0.04)] lg:col-span-2">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[color:var(--muted)]">
          Logboek bekijken
        </p>
        <p className="mt-2 text-lg font-semibold text-[color:var(--ink)]">Bekijk imports, uitnodigingen en lifecycle-mutaties.</p>
        <p className="mt-2 text-sm leading-6 text-[color:var(--text)]">
          {data.latestAuditSummary ?? 'Geen activiteit'}
        </p>
        <div className="mt-4">
          <Link href={`/campaigns/${data.campaignId}#operatie`} className={sectionButtonClass('secondary')}>
            Bekijk logboek
          </Link>
        </div>
      </div>
    </div>
  )
}

export function RouteBeheerEmptyState({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-lg border border-dashed border-[color:var(--border)] bg-[color:var(--bg)] px-5 py-5 text-sm leading-6 text-[color:var(--text)]">
      <p className="font-semibold text-[color:var(--ink)]">{title}</p>
      <p className="mt-2">{body}</p>
    </div>
  )
}

export function RouteBeheerLifecycleSection({ data }: { data: RouteBeheerPageData }) {
  return (
    <DashboardSection
      title="Lifecycle voortgang"
      description="Volg waar de route staat tussen setup, doelgroep, uitnodigingen, respons, output en afronding."
      eyebrow="Lifecycle"
      surface="ops"
      tone="slate"
    >
      <RouteBeheerLifecycleBar steps={data.lifecycleSteps} />
    </DashboardSection>
  )
}

export function RouteBeheerSectionsWrapper({ data }: { data: RouteBeheerPageData }) {
  return (
    <DashboardSection
      id="beheer-onderdelen"
      title="Beheer onderdelen"
      description="Gebruik deze laag voor doelgroep, uitnodigingen, route-instellingen, output en logboek."
      eyebrow="Onderdelen"
      surface="ops"
      tone="slate"
    >
      <RouteBeheerSectionCards data={data} />
    </DashboardSection>
  )
}

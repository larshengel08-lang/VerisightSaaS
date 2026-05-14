import Link from 'next/link'
import { notFound } from 'next/navigation'
import { SuiteAccessDenied } from '@/components/dashboard/suite-access-denied'
import { getScanDefinition } from '@/lib/scan-definitions'
import {
  getDashboardModuleHref,
  getDashboardModuleKeyForScanType,
  getDashboardModuleLabel,
} from '@/lib/dashboard/shell-navigation'
import { loadSuiteAccessContext } from '@/lib/suite-access-server'
import { createClient } from '@/lib/supabase/server'
import type { CampaignStats, Respondent, SurveyResponse } from '@/lib/types'
import {
  buildOpenAnswerItems,
  buildOpenAnswersViewModel,
} from '../open-answers-view-model'
import { MIN_N_DISPLAY, MIN_N_PATTERNS } from '../page-helpers'
import { buildResultsViewModel } from '../results-view-model'

interface Props {
  params: Promise<{ id: string }>
}

function formatRoutePeriodLabel(campaignName: string, createdAt: string) {
  const quarterMatch = campaignName.match(/Q[1-4]\s?\d{4}/i)
  if (quarterMatch) return quarterMatch[0].replace(/\s+/, ' ')

  return new Intl.DateTimeFormat('nl-NL', {
    month: 'long',
    year: 'numeric',
  }).format(new Date(createdAt))
}

function deriveScopeLabel(respondents: Respondent[]) {
  const departments = Array.from(
    new Set(respondents.map((respondent) => respondent.department).filter(Boolean)),
  ) as string[]

  if (departments.length === 0) return 'Scope binnen deze route'
  if (departments.length === 1) return departments[0]
  if (departments.length === 2) return `${departments[0]} & ${departments[1]}`
  return `${departments[0]}, ${departments[1]} + ${departments.length - 2} meer`
}

function getResultsStatusLabel(readState: ReturnType<typeof buildResultsViewModel>['readState']) {
  if (readState === 'readable') return 'Leesbaar'
  if (readState === 'early-read') return 'Eerste read'
  return 'Nog aan het opbouwen'
}

export default async function OpenAnswersPage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    notFound()
  }

  const { context } = await loadSuiteAccessContext(supabase, user.id)

  if (!context.canViewInsights) {
    return (
      <SuiteAccessDenied
        title="Je ziet hier geen open antwoorden"
        description="Jouw login opent alleen Action Center voor toegewezen teams. Surveyresultaten, campagnedetails en open antwoorden blijven zichtbaar voor HR en Loep."
      />
    )
  }

  const { data: statsRow } = await supabase
    .from('campaign_stats')
    .select('*')
    .eq('campaign_id', id)
    .single()

  if (!statsRow) notFound()
  const stats = statsRow as CampaignStats

  const [{ data: organization }, { data: respondentsRaw }, { data: responsesRaw }] = await Promise.all([
    supabase.from('organizations').select('name').eq('id', stats.organization_id).maybeSingle(),
    supabase
      .from('respondents')
      .select('*')
      .eq('campaign_id', id)
      .order('completed_at', { ascending: false, nullsFirst: false }),
    supabase
      .from('survey_responses')
      .select(
        `
        id,
        respondent_id,
        risk_score,
        signal_score,
        risk_band,
        preventability,
        stay_intent_score,
        direction_signal_score,
        uwes_score,
        turnover_intention_score,
        exit_reason_code,
        sdt_scores,
        org_scores,
        open_text_raw,
        open_text_analysis,
        full_result,
        submitted_at,
        respondents!inner(id, campaign_id)
      `,
      )
      .eq('respondents.campaign_id', id),
  ])

  const respondents = (respondentsRaw ?? []) as Respondent[]
  const responses = (responsesRaw ?? []) as unknown as SurveyResponse[]
  const hasMinDisplay = responses.length >= MIN_N_DISPLAY
  const releasedItems = hasMinDisplay ? buildOpenAnswerItems(stats.scan_type, responses) : []
  const viewModel = buildOpenAnswersViewModel(releasedItems)
  const resultsViewModel = buildResultsViewModel({
    scanType: stats.scan_type,
    respondentsCount: respondents.length,
    hasMinDisplay,
    hasEnoughData: responses.length >= MIN_N_PATTERNS,
    hasOpenAnswers: releasedItems.length > 0,
  })

  const scanDefinition = getScanDefinition(stats.scan_type)
  const moduleKey =
    stats.scan_type === 'team' ? null : getDashboardModuleKeyForScanType(stats.scan_type)
  const moduleLabel = moduleKey ? getDashboardModuleLabel(moduleKey) : scanDefinition.productName
  const moduleHref = moduleKey ? getDashboardModuleHref(moduleKey) : '/dashboard'
  const organizationName = organization?.name ?? 'Organisatie'
  const routePeriodLabel = formatRoutePeriodLabel(stats.campaign_name, stats.created_at)
  const scopeLabel = deriveScopeLabel(respondents)

  return (
    <div className="space-y-8">
      <section className="space-y-4 border-b border-slate-200/80 pb-5">
        <p className="text-[0.78rem] font-medium tracking-[0.01em] text-slate-500">
          <Link href="/dashboard" className="transition-colors hover:text-slate-700">
            Overzicht
          </Link>{' '}
          /{' '}
          <Link href={moduleHref} className="transition-colors hover:text-slate-700">
            {moduleLabel}
          </Link>{' '}
          /{' '}
          <Link href={`/campaigns/${id}`} className="transition-colors hover:text-slate-700">
            {stats.campaign_name}
          </Link>{' '}
          / <span className="text-slate-700">Open antwoorden</span>
        </p>
        <Link
          href={`/campaigns/${id}#survey-stemmen`}
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition-colors hover:text-slate-700"
        >
          <span aria-hidden="true">&larr;</span> Terug naar survey-stemmen
        </Link>
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="inline-flex rounded-full border border-slate-200 bg-white px-3 py-1 text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-slate-600">
              {getResultsStatusLabel(resultsViewModel.readState)}
            </span>
          </div>
          <p className="text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-[color:var(--dashboard-muted)]">
            Resultaten
          </p>
          <h1 className="font-serif text-[2.2rem] leading-[1.02] tracking-[-0.045em] text-[color:var(--dashboard-ink)]">
            Alle open antwoorden
          </h1>
          <p className="max-w-3xl text-sm leading-6 text-[color:var(--dashboard-text)]">
            Geanonimiseerde open antwoorden, gegroepeerd per zichtbaar thema. Deze subpagina gebruikt dezelfde vrijgavegrens als de survey-stemmen op de hoofdpagina.
          </p>
          <p className="text-sm leading-6 text-slate-600">
            {organizationName} <span aria-hidden="true">&middot;</span> {routePeriodLabel}{' '}
            <span aria-hidden="true">&middot;</span> {scopeLabel}
          </p>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-[color:var(--dashboard-ink)]">Thematische clusters</h2>
        {viewModel.isEmpty ? (
          <div className="rounded-[24px] border border-dashed border-slate-200 bg-slate-50 px-5 py-5">
            <p className="text-sm font-semibold text-[color:var(--dashboard-ink)]">
              Nog geen vrijgegeven open antwoorden
            </p>
            <p className="mt-2 text-sm leading-6 text-[color:var(--dashboard-text)]">
              {hasMinDisplay
                ? 'Er zijn nog geen geanonimiseerde open antwoorden beschikbaar om te groeperen.'
                : `Open antwoorden openen pas vanaf ${MIN_N_DISPLAY} leesbare responses.`}
            </p>
          </div>
        ) : (
          <>
            <div className="flex flex-wrap gap-2">
              {viewModel.themes.map((theme) => (
                <a
                  key={theme.anchorId}
                  href={`#${theme.anchorId}`}
                  className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-600 transition-colors hover:text-slate-950"
                >
                  {theme.title} · {theme.count}
                </a>
              ))}
            </div>

            <div className="space-y-6">
              {viewModel.groups.map((group) => (
                <section key={group.anchorId} id={group.anchorId} className="space-y-4">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                      <p className="text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-[color:var(--dashboard-muted)]">
                        Thema
                      </p>
                      <h3 className="mt-2 text-xl font-semibold tracking-[-0.03em] text-[color:var(--dashboard-ink)]">
                        {group.title}
                      </h3>
                    </div>
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                      {group.count} antwoord{group.count === 1 ? '' : 'en'}
                    </span>
                  </div>

                  <div className="grid gap-4">
                    {group.answers.map((answer) => (
                      <article
                        key={answer.id}
                        className="rounded-[20px] bg-[color:var(--dashboard-soft)]/52 px-5 py-5"
                      >
                        <p className="text-sm leading-7 text-[color:var(--dashboard-text)]">{answer.text}</p>
                      </article>
                    ))}
                  </div>
                </section>
              ))}
            </div>
          </>
        )}
      </section>
    </div>
  )
}

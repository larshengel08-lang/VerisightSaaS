'use client'

import Link from 'next/link'
import {
  DashboardChip,
  DashboardHero,
  DashboardKeyValue,
  DashboardPanel,
  DashboardSection,
  DashboardSummaryBar,
} from '@/components/dashboard/dashboard-primitives'
import type { ManagerRegistryRow, ManagersPageData } from '@/lib/managers-page-data'

function formatDateLabel(value: string | null) {
  if (!value) {
    return 'Niet beschikbaar'
  }

  return new Date(value).toLocaleDateString('nl-NL', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

function getStatusTone(status: ManagerRegistryRow['status']) {
  switch (status) {
    case 'gekoppeld':
      return 'emerald' as const
    case 'scopeconflict':
      return 'amber' as const
    default:
      return 'slate' as const
  }
}

export function ManagersPageView({
  data,
  selectedManagerId,
}: {
  data: ManagersPageData
  selectedManagerId: string | null
}) {
  const selectedManager =
    data.managers.find((manager) => manager.userId === selectedManagerId) ?? data.managers[0] ?? null

  return (
    <div className="space-y-6">
      <DashboardHero
        surface="ops"
        tone="slate"
        eyebrow="Action Center beheer"
        title="Managers"
        description="Beheer welke managers aan welke scope zijn gekoppeld en welke Action Center-toegang daaruit volgt."
        meta={
          <>
            <DashboardChip
              surface="ops"
              label={`${data.organizationCount} organisatie${data.organizationCount === 1 ? '' : 's'}`}
            />
            <DashboardChip
              surface="ops"
              label={
                data.lastUpdatedAt
                  ? `Laatst gewijzigd ${formatDateLabel(data.lastUpdatedAt)}`
                  : 'Nog geen assignmentupdates'
              }
              tone="slate"
            />
          </>
        }
        aside={
          <div className="space-y-3 text-sm text-slate-700">
            <p className="font-semibold text-slate-950">Beheerkader</p>
            <p>Deze pagina regelt manager assignment en toegang. Geen dashboard, rapport of opvolgingsdetail.</p>
          </div>
        }
      />

      <DashboardSummaryBar
        surface="ops"
        items={[
          {
            label: 'Managers gekoppeld',
            value: `${data.managerCount}`,
            tone: data.managerCount > 0 ? 'emerald' : 'slate',
          },
          {
            label: 'Scopes zonder manager',
            value: data.uncoveredScopeCount === null ? 'Niet beschikbaar' : `${data.uncoveredScopeCount}`,
            tone: data.uncoveredScopeCount && data.uncoveredScopeCount > 0 ? 'amber' : 'slate',
          },
          {
            label: 'Scopeconflicten',
            value: `${data.scopeConflictCount}`,
            tone: data.scopeConflictCount > 0 ? 'amber' : 'slate',
          },
          {
            label: 'Managers met scopegebonden AC-toegang',
            value: `${data.scopedAccessCount}`,
            tone: data.scopedAccessCount > 0 ? 'emerald' : 'slate',
          },
        ]}
        anchors={[
          { id: 'manager-register', label: 'Managerregister' },
          { id: 'manager-detail', label: 'Scope en toegang' },
          { id: 'scopes-zonder-manager', label: 'Ongekoppelde scopes' },
          { id: 'governance', label: 'Governance' },
        ]}
      />

      <DashboardSection
        id="manager-register"
        surface="ops"
        eyebrow="Register"
        title="Managerregister"
        description="Bekijk per manager welke scope is gekoppeld, welk type scope dat is en welke bounded Action Center-toegang daaruit volgt."
        aside={
          <DashboardChip
            surface="ops"
            label={`${data.managers.length} manager${data.managers.length === 1 ? '' : 's'}`}
          />
        }
      >
        {data.managers.length === 0 ? (
          <DashboardPanel
            surface="ops"
            eyebrow="Leeg"
            title="Geen managers gekoppeld"
            body="Zodra manager-assignmentrecords bestaan, verschijnt hier het register met scope en toegang."
            tone="slate"
          />
        ) : (
          <div className="grid gap-5 xl:grid-cols-[minmax(0,1.35fr),minmax(320px,0.65fr)]">
            <div className="overflow-x-auto rounded-[18px] border border-slate-200 bg-white">
              <table className="min-w-[960px] w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                    <th className="px-4 py-3 text-left">Manager</th>
                    <th className="px-4 py-3 text-left">Scopes</th>
                    <th className="px-4 py-3 text-left">Scope type</th>
                    <th className="px-4 py-3 text-left">Toegang</th>
                    <th className="px-4 py-3 text-left">Status</th>
                    <th className="px-4 py-3 text-left">Actie</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {data.managers.map((manager) => (
                    <tr key={manager.userId} className="align-top hover:bg-slate-50/70">
                      <td className="px-4 py-4">
                        <p className="font-semibold text-slate-950">{manager.displayName}</p>
                        <p className="mt-1 text-xs text-slate-500">
                          {manager.loginEmail ?? 'Geen e-mailadres bekend'}
                        </p>
                      </td>
                      <td className="px-4 py-4 text-slate-700">
                        <p>
                          {manager.scopes.length === 0
                            ? 'Nog geen scope gekoppeld'
                            : `${manager.scopes.length} scope${manager.scopes.length === 1 ? '' : 's'}`}
                        </p>
                        {manager.scopes[0] ? (
                          <p className="mt-1 text-xs text-slate-500">{manager.scopes[0].scopeLabel}</p>
                        ) : null}
                      </td>
                      <td className="px-4 py-4 text-slate-700">{manager.scopeTypeLabel}</td>
                      <td className="px-4 py-4 text-slate-700">{manager.accessLabel}</td>
                      <td className="px-4 py-4">
                        <DashboardChip
                          surface="ops"
                          tone={getStatusTone(manager.status)}
                          label={manager.statusLabel}
                        />
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex flex-wrap gap-2">
                          <Link
                            href={`/beheer/managers?manager=${manager.userId}`}
                            className="rounded-full border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-slate-50"
                          >
                            Open manager
                          </Link>
                          <a
                            href="#manager-detail"
                            className="rounded-full border border-slate-300 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-slate-100"
                          >
                            Bekijk scope en toegang
                          </a>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div id="manager-detail" className="xl:sticky xl:top-[8rem] xl:self-start">
              {selectedManager ? (
                <div className="space-y-4 rounded-[22px] border border-slate-200 bg-white p-5 shadow-[0_10px_24px_rgba(19,32,51,0.05)]">
                  <div className="flex flex-wrap items-center gap-2">
                    <DashboardChip
                      surface="ops"
                      label={selectedManager.statusLabel}
                      tone={getStatusTone(selectedManager.status)}
                    />
                    <DashboardChip surface="ops" label={selectedManager.scopeTypeLabel} tone="slate" />
                  </div>
                  <div>
                    <p className="text-lg font-semibold text-slate-950">{selectedManager.displayName}</p>
                    <p className="mt-1 text-sm text-slate-500">
                      {selectedManager.loginEmail ?? 'Geen e-mailadres bekend'}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <a
                      href="#manager-detail"
                      className="rounded-full border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-slate-50"
                    >
                      Bekijk gekoppelde scopes
                    </a>
                    <a
                      href="#scopes-zonder-manager"
                      className="rounded-full border border-slate-300 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-slate-100"
                    >
                      Koppel manager aan scope
                    </a>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <DashboardKeyValue
                      surface="ops"
                      label="Aangemaakt"
                      value={formatDateLabel(selectedManager.createdAt)}
                    />
                    <DashboardKeyValue
                      surface="ops"
                      label="Laatst gewijzigd"
                      value={formatDateLabel(selectedManager.updatedAt)}
                    />
                  </div>

                  <div className="space-y-2 rounded-[18px] border border-slate-200 bg-slate-50 px-4 py-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Toegang</p>
                    <ul className="space-y-2 text-sm text-slate-700">
                      {selectedManager.permissions.map((permission) => (
                        <li key={permission}>{permission}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="space-y-3">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                      Gekoppelde scopes
                    </p>
                    {selectedManager.scopes.length === 0 ? (
                      <div className="rounded-[18px] border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
                        Nog geen scope gekoppeld.
                      </div>
                    ) : (
                      selectedManager.scopes.map((scope) => (
                        <div
                          key={`${scope.orgId}-${scope.scopeValue}`}
                          className="rounded-[18px] border border-slate-200 bg-slate-50 px-4 py-4 text-sm text-slate-700"
                        >
                          <div className="flex flex-wrap items-center gap-2">
                            <DashboardChip surface="ops" label={scope.scopeTypeLabel} tone="slate" />
                            <span className="text-xs text-slate-500">{scope.orgName}</span>
                          </div>
                          <p className="mt-3 font-semibold text-slate-950">{scope.scopeLabel}</p>
                          <p className="mt-1 text-xs text-slate-500">
                            Aangemaakt {formatDateLabel(scope.createdAt)} {' · '}Gewijzigd{' '}
                            {formatDateLabel(scope.updatedAt)}
                          </p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              ) : (
                <DashboardPanel
                  surface="ops"
                  eyebrow="Detail"
                  title="Nog geen managerdetail"
                  body="Zodra een managerrecord zichtbaar is, verschijnt hier de scope- en toegangsdetaillaag."
                  tone="slate"
                />
              )}
            </div>
          </div>
        )}
      </DashboardSection>

      <DashboardSection
        id="scopes-zonder-manager"
        surface="ops"
        eyebrow="Scopebasis"
        title="Scopes zonder manager"
        description="Alleen scopes uit actieve campaigns en respondent-context tellen mee. Er wordt geen extra masterdata of lifecyclelaag verondersteld."
        aside={
          <DashboardChip
            surface="ops"
            label={data.uncoveredScopeCount === null ? 'Niet beschikbaar' : `${data.uncoveredScopeCount} open`}
            tone={data.uncoveredScopeCount && data.uncoveredScopeCount > 0 ? 'amber' : 'slate'}
          />
        }
      >
        {!data.uncoveredScopesAvailable ? (
          <DashboardPanel
            surface="ops"
            eyebrow="Databasis"
            title="Niet beschikbaar"
            body="Er is nog geen bruikbare departmentbasis uit actieve campaigns en respondenten om ongekoppelde scopes te tellen."
            tone="slate"
          />
        ) : data.uncoveredScopes.length === 0 ? (
          <DashboardPanel
            surface="ops"
            eyebrow="Dekking"
            title="Alle zichtbare scopes zijn gekoppeld"
            body="Voor de huidige actieve campaign- en respondentcontext is er geen open afdeling zonder managerassignment."
            tone="emerald"
          />
        ) : (
          <div className="grid gap-3 lg:grid-cols-2">
            {data.uncoveredScopes.map((scope) => (
              <div
                key={`${scope.orgId}-${scope.scopeValue}`}
                className="rounded-[18px] border border-amber-200 bg-amber-50 px-4 py-4 text-sm text-amber-950"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <DashboardChip surface="ops" label="Nog niet gekoppeld" tone="amber" />
                  <span className="text-xs text-amber-800">{scope.orgName}</span>
                </div>
                <p className="mt-3 font-semibold">{scope.scopeLabel}</p>
                <p className="mt-2 text-xs leading-5 text-amber-900">
                  Gebruik deze scope als volgende assignmentkandidaat wanneer je een manager wilt koppelen.
                </p>
              </div>
            ))}
          </div>
        )}
      </DashboardSection>

      <DashboardSection
        id="governance"
        surface="ops"
        eyebrow="Governance"
        title="Scope en toegang blijven bounded"
        description="Deze beheerpagina blijft bewust beperkt tot assignment en scope. Managergebruikers krijgen hier geen dashboard-, rapport- of bredere gebruikersbeheerlaag."
      >
        <div className="grid gap-4 lg:grid-cols-3">
          <DashboardPanel
            surface="ops"
            eyebrow="Assignment"
            title="Statusmodel"
            body="Gekoppeld, Nog niet gekoppeld en Scopeconflict zijn de enige toegestane assignmentstatussen in v1."
            tone="slate"
          />
          <DashboardPanel
            surface="ops"
            eyebrow="Toegang"
            title="Scopegebonden Action Center"
            body="De permissiematrix blijft beperkt tot scope, opvolgen en review plannen. Dashboard en rapport blijven expliciet uit."
            tone="slate"
          />
          <DashboardPanel
            surface="ops"
            eyebrow="Guardrail"
            title="Geen lifecyclelaag"
            body="De pagina blijft bij assignment en scope, zonder extra gebruikerslevenscyclus of onboardingstatus."
            tone="slate"
          />
        </div>
      </DashboardSection>
    </div>
  )
}

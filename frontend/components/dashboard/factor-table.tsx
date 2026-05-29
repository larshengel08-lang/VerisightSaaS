'use client'

import { useState } from 'react'
import { buildFactorPresentation, getRiskBandFromScore, RISK_BG_COLORS, RISK_COLORS } from '@/lib/management-language'
import { FACTOR_LABELS } from '@/lib/types'
import type { CampaignItemScoresResponse, ItemScoreDetail, ScanType } from '@/lib/types'

const ORG_FACTORS = ['leadership', 'culture', 'growth', 'compensation', 'workload', 'role_clarity'] as const
type OrgFactorKey = typeof ORG_FACTORS[number]

export type FactorItemRow = {
  itemKey: string
  label: string
  avg: number | null
  n: number
  suppressed: boolean
}

interface Props {
  factorAverages: Record<string, number>
  scanType: ScanType
  itemScores?: CampaignItemScoresResponse | null
  showIntro?: boolean
}

function isOrgFactorKey(value: string): value is OrgFactorKey {
  return ORG_FACTORS.includes(value as OrgFactorKey)
}

function getOrgFactorKeyFromItemKey(itemKey: string): OrgFactorKey | null {
  const match = itemKey.match(/^(.*)_(\d+)$/)
  if (!match) return null

  const factorKey = match[1]
  return isOrgFactorKey(factorKey) ? factorKey : null
}

function getItemSortOrder(itemKey: string) {
  const match = itemKey.match(/_(\d+)$/)
  if (!match) return Number.MAX_SAFE_INTEGER
  return Number(match[1])
}

export function truncateFactorItemLabel(value: string, limit = 60) {
  return value.length > limit ? `${value.slice(0, limit - 3).trimEnd()}...` : value
}

export function buildFactorItemLayerMap(itemScores?: CampaignItemScoresResponse | null) {
  if (!itemScores) {
    return {} as Record<string, FactorItemRow[]>
  }

  const rowsByFactor: Record<string, FactorItemRow[]> = {}

  for (const group of itemScores.factors) {
    const visibleRows = group.items.map((item) => ({
      itemKey: item.item_key,
      label: item.label,
      avg: item.avg,
      n: item.n,
      suppressed: false,
    }))
    const visibleKeys = new Set(visibleRows.map((item) => item.itemKey))
    const suppressedRows = itemScores.suppressed_items
      .filter((item) => getOrgFactorKeyFromItemKey(item.item_key) === group.factor_key)
      .filter((item) => !visibleKeys.has(item.item_key))
      .map((item) => ({
        itemKey: item.item_key,
        label: item.label,
        avg: item.avg,
        n: item.n,
        suppressed: true,
      }))

    rowsByFactor[group.factor_key] = [...visibleRows, ...suppressedRows].sort((left, right) => {
      return getItemSortOrder(left.itemKey) - getItemSortOrder(right.itemKey)
    })
  }

  return rowsByFactor
}

function buildSuppressedMessage(item: ItemScoreDetail | FactorItemRow) {
  return item.n > 0
    ? `Niet zichtbaar (te weinig respondenten, n=${item.n})`
    : 'Niet zichtbaar (te weinig respondenten)'
}

export function FactorTable({ factorAverages, scanType, itemScores, showIntro = true }: Props) {
  const rows = ORG_FACTORS
    .filter((factor) => factor in factorAverages)
    .map((factor) => {
      const score = factorAverages[factor]
      const riskVal = 11 - score
      const band = getRiskBandFromScore(riskVal)
      const presentation = buildFactorPresentation({ score, signalScore: riskVal })
      return { factor, score, riskVal, band, presentation }
    })
    .sort((left, right) => right.riskVal - left.riskVal)

  const introText =
    scanType === 'exit'
      ? 'De belevingsscore laat zien hoe vertrekkers een thema gemiddeld ervoeren. Het managementlabel vertaalt dat naar wat dit bestuurlijk nu vraagt.'
      : scanType === 'team'
        ? 'De belevingsscore laat zien hoe medewerkers hun directe werkcontext gemiddeld ervaren. Het managementlabel vertaalt dat naar wat dit lokaal bestuurlijk vraagt.'
        : scanType === 'onboarding'
          ? 'De belevingsscore laat zien hoe nieuwe medewerkers dit checkpoint gemiddeld ervaren. Het managementlabel vertaalt dat naar wat dit in de vroege managementread vraagt.'
          : 'De belevingsscore laat zien hoe medewerkers een thema gemiddeld ervaren. Het managementlabel vertaalt dat naar wat dit bestuurlijk vraagt voor behoud.'

  const bandLabels = { HOOG: 'Direct prioriteren', MIDDEN: 'Eerst toetsen', LAAG: 'Volgen' }
  const itemLayerMap = buildFactorItemLayerMap(itemScores)
  const [expandedFactors, setExpandedFactors] = useState<Record<string, boolean>>({})

  return (
    <div className="space-y-1">
      {showIntro ? (
        <p className="mb-4 text-[0.85rem] leading-6 text-[color:var(--dashboard-muted)]">
          {introText} Klap een factor open om de losse itemlaag te bekijken.
        </p>
      ) : null}
      {rows.map((row, index) => {
        const factorItems = itemLayerMap[row.factor] ?? []
        const canExpand = factorItems.length > 0

        return (
          <div
            key={row.factor}
            className="py-3"
            style={{
              borderBottom: index < rows.length - 1 ? '1px solid rgba(19,32,51,0.06)' : undefined,
            }}
          >
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
              <div className="flex min-w-0 items-center gap-3 sm:w-56 sm:shrink-0">
                {canExpand ? (
                  <button
                    type="button"
                    className="inline-flex size-8 shrink-0 items-center justify-center rounded-full border border-[rgba(19,32,51,0.12)] text-[0.9rem] font-medium text-[color:var(--dashboard-ink)] transition-colors hover:bg-[color:var(--dashboard-soft)]"
                    aria-expanded={expandedFactors[row.factor] ?? false}
                    aria-controls={`factor-items-${row.factor}`}
                    aria-label={`${expandedFactors[row.factor] ? 'Verberg' : 'Toon'} items voor ${FACTOR_LABELS[row.factor]}`}
                    onClick={() =>
                      setExpandedFactors((current) => ({
                        ...current,
                        [row.factor]: !current[row.factor],
                      }))
                    }
                  >
                    {expandedFactors[row.factor] ? '-' : '+'}
                  </button>
                ) : (
                  <span className="inline-flex size-8 shrink-0" aria-hidden="true" />
                )}
                <span className="min-w-0 text-[0.875rem] text-[color:var(--dashboard-ink)]">
                  {FACTOR_LABELS[row.factor]}
                </span>
              </div>

              <div className="h-[6px] flex-1 overflow-hidden rounded-[3px] bg-[rgba(19,32,51,0.08)]">
                <div
                  className="h-full rounded-[3px]"
                  style={{
                    width: `${((row.score - 1) / 9) * 100}%`,
                    backgroundColor: RISK_COLORS[row.band],
                  }}
                />
              </div>

              <span className="w-16 shrink-0 text-right text-[0.875rem] font-medium text-[color:var(--dashboard-ink)]">
                {row.presentation.scoreDisplay}
              </span>

              <span
                className="min-w-[7rem] shrink-0 rounded-full px-2.5 py-0.5 text-center text-[0.65rem] font-medium uppercase tracking-[0.04em]"
                style={{
                  background: RISK_BG_COLORS[row.band],
                  color: RISK_COLORS[row.band],
                }}
              >
                {bandLabels[row.band]}
              </span>
            </div>

            {(expandedFactors[row.factor] ?? false) ? (
              <div
                id={`factor-items-${row.factor}`}
                className="space-y-3 pl-11 pt-3"
              >
                {factorItems.length > 0 ? (
                  factorItems.map((item) => {
                    if (item.suppressed) {
                      return (
                        <div
                          key={item.itemKey}
                          className="rounded-[16px] border border-[rgba(19,32,51,0.08)] bg-[rgba(19,32,51,0.02)] px-4 py-3"
                        >
                          <div className="flex flex-col gap-1.5 sm:flex-row sm:items-center sm:justify-between">
                            <span
                              className="text-[0.82rem] leading-6 text-[color:var(--dashboard-text)]"
                              title={item.label}
                            >
                              {truncateFactorItemLabel(item.label)}
                            </span>
                            <span className="text-[0.78rem] font-medium text-[color:var(--dashboard-muted)]">
                              {buildSuppressedMessage(item)}
                            </span>
                          </div>
                        </div>
                      )
                    }

                    if (item.avg === null) {
                      return null
                    }

                    const itemBand = getRiskBandFromScore(11 - item.avg)

                    return (
                      <div
                        key={item.itemKey}
                        className="rounded-[16px] border border-[rgba(19,32,51,0.08)] bg-white/90 px-4 py-3"
                      >
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
                          <span
                            className="min-w-0 flex-1 text-[0.82rem] leading-6 text-[color:var(--dashboard-text)]"
                            title={item.label}
                          >
                            {truncateFactorItemLabel(item.label)}
                          </span>
                          <div className="h-[4px] flex-1 overflow-hidden rounded-[3px] bg-[rgba(19,32,51,0.08)]">
                            <div
                              className="h-full rounded-[3px]"
                              style={{
                                width: `${((item.avg - 1) / 9) * 100}%`,
                                backgroundColor: RISK_COLORS[itemBand],
                              }}
                            />
                          </div>
                          <span className="w-12 shrink-0 text-right text-[0.82rem] font-semibold text-[color:var(--dashboard-ink)]">
                            {item.avg.toFixed(1)}
                          </span>
                        </div>
                      </div>
                    )
                  })
                ) : (
                  <div className="rounded-[16px] border border-[rgba(19,32,51,0.08)] bg-[rgba(19,32,51,0.02)] px-4 py-3 text-[0.82rem] text-[color:var(--dashboard-muted)]">
                    Nog geen itemlaag zichtbaar voor deze factor.
                  </div>
                )}
              </div>
            ) : null}
          </div>
        )
      })}
    </div>
  )
}

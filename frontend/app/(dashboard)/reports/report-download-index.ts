import type { ScanType } from '@/lib/types'

export type ReportDownloadRow = {
  campaignId: string
  campaignName: string
  scanType: ScanType
  scanName: string
  periodLabel: string
  createdAt: string
  responseBasis: string
  status: string
  isAvailable: boolean
  extraDisambiguator?: string | null
}

export type ReportDownloadIndex = {
  availableRows: ReportDownloadRow[]
  unavailableRows: ReportDownloadRow[]
}

function getPeriodSortKey(periodLabel: string, createdAt: string) {
  const quarterMatch = /^Q([1-4]) (\d{4})$/.exec(periodLabel.trim())
  if (quarterMatch) {
    const [, quarter, year] = quarterMatch
    return Number(year) * 10 + Number(quarter)
  }

  const created = new Date(createdAt).getTime()
  if (Number.isNaN(created)) return 0
  const date = new Date(created)
  const quarter = Math.floor(date.getUTCMonth() / 3) + 1
  return date.getUTCFullYear() * 10 + quarter
}

function compareRows(left: ReportDownloadRow, right: ReportDownloadRow) {
  const periodDiff =
    getPeriodSortKey(right.periodLabel, right.createdAt) -
    getPeriodSortKey(left.periodLabel, left.createdAt)
  if (periodDiff !== 0) return periodDiff

  const createdDiff = new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime()
  if (createdDiff !== 0) return createdDiff

  const campaignDiff = left.campaignName.localeCompare(right.campaignName, 'nl')
  if (campaignDiff !== 0) return campaignDiff

  return left.scanName.localeCompare(right.scanName, 'nl')
}

function addDisambiguators(rows: ReportDownloadRow[]) {
  return rows.map((row, _, allRows) => {
    const similarRows = allRows.filter(
      (candidate) =>
        candidate.scanName === row.scanName &&
        candidate.campaignName === row.campaignName &&
        candidate.periodLabel === row.periodLabel,
    )

    if (similarRows.length < 2) {
      return row
    }

    return {
      ...row,
      extraDisambiguator: new Intl.DateTimeFormat('nl-NL', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      }).format(new Date(row.createdAt)),
    }
  })
}

export function buildReportDownloadIndex(rows: ReportDownloadRow[]): ReportDownloadIndex {
  const availableRows = rows.filter((row) => row.isAvailable).sort(compareRows)
  const unavailableRows = rows.filter((row) => !row.isAvailable).sort(compareRows)

  return {
    availableRows: addDisambiguators(availableRows),
    unavailableRows: addDisambiguators(unavailableRows),
  }
}

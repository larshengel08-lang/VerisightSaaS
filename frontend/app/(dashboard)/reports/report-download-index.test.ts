import { describe, expect, it } from 'vitest'
import { buildReportDownloadIndex } from './report-download-index'

const reports = [
  {
    campaignId: 'ret-2',
    campaignName: 'Retentie Q2',
    scanType: 'retention' as const,
    scanName: 'RetentieScan',
    periodLabel: 'Q2 2026',
    createdAt: '2026-05-11T09:00:00Z',
    responseBasis: '24 responses',
    status: 'Klaar',
    isAvailable: true,
  },
  {
    campaignId: 'ret-1',
    campaignName: 'Retentie Q1',
    scanType: 'retention' as const,
    scanName: 'RetentieScan',
    periodLabel: 'Q1 2026',
    createdAt: '2026-04-01T09:00:00Z',
    responseBasis: '18 responses',
    status: 'Klaar',
    isAvailable: true,
  },
  {
    campaignId: 'exit-1',
    campaignName: 'Exit april',
    scanType: 'exit' as const,
    scanName: 'ExitScan',
    periodLabel: 'Q2 2026',
    createdAt: '2026-05-09T09:00:00Z',
    responseBasis: '4 responses',
    status: 'Nog onvoldoende respons',
    isAvailable: false,
  },
]

describe('buildReportDownloadIndex', () => {
  it('splits rows into available and unavailable sections', () => {
    const model = buildReportDownloadIndex(reports)

    expect(model.availableRows.map((row) => row.campaignId)).toEqual(['ret-2', 'ret-1'])
    expect(model.unavailableRows.map((row) => row.campaignId)).toEqual(['exit-1'])
  })

  it('sorts available rows by period, then date, then name', () => {
    const model = buildReportDownloadIndex(reports)

    expect(model.availableRows[0]).toMatchObject({
      campaignId: 'ret-2',
      periodLabel: 'Q2 2026',
    })
  })

  it('requires enough identifying metadata to disambiguate similar reports', () => {
    const model = buildReportDownloadIndex(reports)

    expect(model.availableRows[0]).toMatchObject({
      scanName: 'RetentieScan',
      campaignName: 'Retentie Q2',
      periodLabel: 'Q2 2026',
      responseBasis: '24 responses',
      status: 'Klaar',
    })
  })

  it('adds an extra disambiguator when two rows would otherwise look too similar', () => {
    const model = buildReportDownloadIndex([
      {
        campaignId: 'a',
        campaignName: 'Retentie',
        scanType: 'retention' as const,
        scanName: 'RetentieScan',
        periodLabel: 'Q2 2026',
        createdAt: '2026-05-12T09:00:00Z',
        responseBasis: '20 responses',
        status: 'Klaar',
        isAvailable: true,
      },
      {
        campaignId: 'b',
        campaignName: 'Retentie',
        scanType: 'retention' as const,
        scanName: 'RetentieScan',
        periodLabel: 'Q2 2026',
        createdAt: '2026-05-10T09:00:00Z',
        responseBasis: '19 responses',
        status: 'Klaar',
        isAvailable: true,
      },
    ])

    expect(model.availableRows[0]?.extraDisambiguator).toBeTruthy()
    expect(model.availableRows[1]?.extraDisambiguator).toBeTruthy()
  })
})

import type { ScanType } from '@/lib/types'

export type ResultsReadState = 'pre-read' | 'early-read' | 'readable'
export type ResultsBlockKey = 'response' | 'signal' | 'synthesis' | 'drivers' | 'depth' | 'voices'
export type ResultsBlockVisibility = 'visible' | 'limited'

export type ResultsViewModel = {
  readState: ResultsReadState
  blocks: Array<{
    key: ResultsBlockKey
    visibility: ResultsBlockVisibility
  }>
}

type Args = {
  scanType: ScanType
  respondentsCount: number
  hasMinDisplay: boolean
  hasEnoughData: boolean
  hasOpenAnswers: boolean
}

function getReadState(args: Pick<Args, 'hasMinDisplay' | 'hasEnoughData'>): ResultsReadState {
  if (args.hasEnoughData) return 'readable'
  if (args.hasMinDisplay) return 'early-read'
  return 'pre-read'
}

export function buildResultsViewModel(args: Args): ResultsViewModel {
  const readState = getReadState(args)
  const answersReleased = args.hasMinDisplay && args.hasOpenAnswers

  return {
    readState,
    blocks: [
      { key: 'response', visibility: 'visible' },
      { key: 'signal', visibility: args.hasMinDisplay ? 'visible' : 'limited' },
      { key: 'synthesis', visibility: args.hasMinDisplay ? 'visible' : 'limited' },
      { key: 'drivers', visibility: args.hasEnoughData ? 'visible' : 'limited' },
      { key: 'depth', visibility: args.hasMinDisplay ? 'visible' : 'limited' },
      { key: 'voices', visibility: answersReleased ? 'visible' : 'limited' },
    ],
  }
}

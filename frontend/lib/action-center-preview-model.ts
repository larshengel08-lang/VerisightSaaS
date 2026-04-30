import type { ActionCenterReviewOutcome } from '@/lib/action-center-route-contract'
import type { ActionCenterCoreSemantics } from '@/lib/action-center-core-semantics'
import type { ActionCenterManagerResponse } from '@/lib/pilot-learning'

export type ActionCenterPreviewView = 'overview' | 'actions' | 'reviews' | 'managers' | 'teams'
export type ActionCenterPreviewStatus =
  | 'open-verzoek'
  | 'te-bespreken'
  | 'reviewbaar'
  | 'in-uitvoering'
  | 'geblokkeerd'
  | 'afgerond'
  | 'gestopt'
export type ActionCenterPreviewPriority = 'hoog' | 'midden' | 'laag'

export interface ActionCenterPreviewUpdate {
  id: string
  author: string
  dateLabel: string
  note: string
}

export interface ActionCenterPreviewItem {
  id: string
  code: string
  title: string
  summary: string
  reason: string
  sourceLabel: string
  orgId?: string | null
  scopeType?: 'department' | 'item' | 'org'
  teamId: string
  teamLabel: string
  ownerId?: string | null
  ownerName: string | null
  ownerRole: string
  ownerSubtitle: string
  reviewOwnerName: string | null
  priority: ActionCenterPreviewPriority
  status: ActionCenterPreviewStatus
  reviewDate: string | null
  expectedEffect: string | null
  reviewReason: string | null
  reviewOutcome: ActionCenterReviewOutcome
  managerResponse?: ActionCenterManagerResponse | null
  reviewDateLabel: string
  reviewRhythm: string
  signalLabel: string
  signalBody: string
  nextStep: string
  peopleCount: number
  coreSemantics: ActionCenterCoreSemantics
  openSignals: string[]
  updates: ActionCenterPreviewUpdate[]
}

export interface ActionCenterPreviewManagerOption {
  value: string
  label: string
}

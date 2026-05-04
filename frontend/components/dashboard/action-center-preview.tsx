'use client'

import Link from 'next/link'
import type {
  ActionCenterDecision,
  ActionCenterDecisionRecord,
  ActionCenterReviewOutcome,
  ActionCenterRouteContract,
  ActionCenterRouteStatus,
} from '@/lib/action-center-route-contract'
import {
  ACTION_CENTER_MANAGER_RESPONSE_THEME_OPTIONS,
  getActionCenterManagerResponseLabel,
  hasPrimaryManagerAction,
} from '@/lib/action-center-manager-responses'
import type {
  ActionCenterRouteCloseoutReason,
  ActionCenterRouteCloseoutStatus,
} from '@/lib/action-center-route-closeout'
import {
  getActionCenterFollowUpTriggerReasonLabel,
  type ActionCenterRouteFollowUpTriggerReason,
} from '@/lib/action-center-route-reopen'
import {
  finalizeActionCenterPreviewItem,
  getLiveActionCenterSummary,
  type ActionCenterWorkspaceReadbackSummary,
} from '@/lib/action-center-live'
import { buildActionCenterTeamRows } from '@/lib/action-center-teams-view'
import type {
  ActionCenterPreviewItem,
  ActionCenterPreviewManagerOption,
  ActionCenterPreviewPriority,
  ActionCenterPreviewStatus,
  ActionCenterPreviewView,
} from '@/lib/action-center-preview-model'
import { ActionCenterTeamsView } from '@/components/dashboard/action-center-teams-view'
import type {
  ActionCenterManagerActionThemeKey,
  ActionCenterManagerResponse,
  ActionCenterManagerResponseType,
} from '@/lib/pilot-learning'
import React, { useDeferredValue, useEffect, useMemo, useState } from 'react'

export type {
  ActionCenterPreviewItem,
  ActionCenterPreviewManagerOption,
  ActionCenterPreviewPriority,
  ActionCenterPreviewStatus,
  ActionCenterPreviewUpdate,
  ActionCenterPreviewView,
} from '@/lib/action-center-preview-model'

interface Props {
  initialItems: ActionCenterPreviewItem[]
  initialSelectedItemId?: string | null
  initialView?: ActionCenterPreviewView
  fallbackOwnerName: string
  ownerOptions: string[]
  managerOptions?: ActionCenterPreviewManagerOption[]
  canAssignManagers?: boolean
  managerAssignmentEndpoint?: string
  canRespondToRequests?: boolean
  managerResponseEndpoint?: string
  canCloseRoutes?: boolean
  routeCloseoutEndpoint?: string
  routeFollowUpEndpoint?: string
  currentUserId?: string | null
  workbenchHref: string
  workbenchLabel?: string
  workspaceName?: string
  workspaceSubtitle?: string
  readOnly?: boolean
  itemHrefs?: Record<string, string>
  hideSidebar?: boolean
  boundedOverviewOnly?: boolean
}

interface CreateActionFormState {
  title: string
  summary: string
  sourceLabel: string
  teamId: string
  ownerName: string
  priority: ActionCenterPreviewPriority
  reviewDate: string
  reviewRhythm: string
}

interface ManagerResponseFormState {
  responseType: ActionCenterManagerResponseType
  responseNote: string
  reviewScheduledFor: string
  includePrimaryAction: boolean
  primaryActionThemeKey: ActionCenterManagerActionThemeKey | ''
  primaryActionText: string
  primaryActionExpectedEffect: string
}

interface FollowUpRouteFormState {
  managerUserId: string
  triggerReason: ActionCenterRouteFollowUpTriggerReason
}

interface RouteCloseoutFormState {
  closeoutStatus: ActionCenterRouteCloseoutStatus
  closeoutReason: ActionCenterRouteCloseoutReason
  closeoutNote: string
}

type ManagerActionPhase =
  | 'awaiting-first-move'
  | 'bounded-response'
  | 'first-concrete-action'
  | 'action-cards'

type FollowUpRouteBlockReason =
  | 'already-has-direct-active-successor'
  | 'no-same-scope-target'
  | 'ambiguous-same-scope-target'

const SIDEBAR_ITEMS: Array<{ key: ActionCenterPreviewView; label: string }> = [
  { key: 'overview', label: 'Overzicht' },
  { key: 'actions', label: 'Acties' },
  { key: 'reviews', label: 'Reviewmomenten' },
  { key: 'managers', label: 'Managers' },
  { key: 'teams', label: 'Mijn teams' },
]

const REVIEW_RHYTHM_OPTIONS = ['Wekelijks', 'Tweewekelijks', 'Maandelijks', 'Per kwartaal']
const FOLLOW_UP_TRIGGER_REASON_OPTIONS: ActionCenterRouteFollowUpTriggerReason[] = [
  'nieuw-campaign-signaal',
  'nieuw-segment-signaal',
  'hernieuwde-hr-beoordeling',
]
const ROUTE_CLOSEOUT_STATUS_OPTIONS: ActionCenterRouteCloseoutStatus[] = ['afgerond', 'gestopt']
const ROUTE_CLOSEOUT_REASON_OPTIONS: ActionCenterRouteCloseoutReason[] = [
  'voldoende-opgepakt',
  'effect-voldoende-zichtbaar',
  'geen-verdere-opvolging-nodig',
  'geen-lokale-vervolgstap-nodig',
  'bewust-niet-voortzetten',
  'elders-opgepakt',
]

const DUTCH_SHORT_DATE = new Intl.DateTimeFormat('nl-NL', {
  day: 'numeric',
  month: 'short',
})

const DUTCH_LONG_DATE = new Intl.DateTimeFormat('nl-NL', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
})

const UNASSIGNED_OWNER_LABEL = 'Nog niet toegewezen'

function formatShortDate(value: string | null) {
  if (!value) return 'Nog niet gepland'

  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return value
  return DUTCH_SHORT_DATE.format(parsed).replace('.', '')
}

function formatLongDate(value: string | null) {
  if (!value) return 'Nog plannen'

  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return value
  return DUTCH_LONG_DATE.format(parsed)
}

function formatCountLabel(count: number, singular: string, plural = `${singular}s`) {
  return `${count} ${count === 1 ? singular : plural}`
}

function getWorkspaceRouteImageSummary(summary: ActionCenterWorkspaceReadbackSummary) {
  if (summary.routeCount === 0) {
    return 'Nog geen zichtbare routes in deze workspace.'
  }

  return `${formatCountLabel(summary.activeRouteCount, 'open route')} en ${formatCountLabel(summary.closedRouteCount, 'gesloten route')} van ${formatCountLabel(summary.routeCount, 'zichtbare route')}.`
}

function getWorkspaceDecisionTrailSummary(summary: ActionCenterWorkspaceReadbackSummary) {
  if (summary.decisionRouteCount === 0) {
    return 'Nog geen routes met expliciet besluitspoor zichtbaar.'
  }

  return `${formatCountLabel(summary.decisionRouteCount, 'route')} met expliciet besluitspoor in de huidige selectie.`
}

function getWorkspaceContinuationSummary(summary: ActionCenterWorkspaceReadbackSummary) {
  if (summary.continuationVisibleRouteCount === 0) {
    return 'Nog geen heropening of vervolg over tijd zichtbaar.'
  }

  return `${formatCountLabel(summary.reopenedRouteCount, 'heropende route')} en ${formatCountLabel(summary.followUpVisibleRouteCount, 'route')} met vervolgcontext zichtbaar.`
}

function getWorkspaceReviewPressureSummary(summary: ActionCenterWorkspaceReadbackSummary) {
  if (summary.reviewCount === 0 || !summary.nextReviewDate) {
    return 'Nog geen reviewmomenten zichtbaar in deze selectie.'
  }

  return `${formatCountLabel(summary.reviewCount, 'route')} met review in beeld, eerstvolgend ${formatShortDate(summary.nextReviewDate)}.`
}

function getInitials(name: string | null) {
  if (!name) return 'VS'
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('')
}

export function getOwnerDisplayName(ownerName: string | null) {
  return ownerName ?? UNASSIGNED_OWNER_LABEL
}

export function getReviewOwnerDisplayName(reviewOwnerName: string | null) {
  return reviewOwnerName ?? UNASSIGNED_OWNER_LABEL
}

export function getTeamManagerDisplayName(managerName: string | null) {
  return managerName ?? UNASSIGNED_OWNER_LABEL
}

function getPriorityMeta(priority: ActionCenterPreviewPriority) {
  if (priority === 'hoog') {
    return {
      label: 'Hoog',
      pillClass: 'border-[#ffd9c4] bg-[#fff0e7] text-[#b35a1d]',
      dotClass: 'bg-[#ff9b4a]',
    }
  }

  if (priority === 'midden') {
    return {
      label: 'Midden',
      pillClass: 'border-[#d7ece8] bg-[#eef9f6] text-[#28776f]',
      dotClass: 'bg-[#70b7aa]',
    }
  }

  return {
    label: 'Laag',
    pillClass: 'border-[#e7e0d4] bg-[#fbf8f2] text-[#605748]',
    dotClass: 'bg-[#9f998f]',
  }
}

function getStatusMeta(status: ActionCenterPreviewStatus) {
  switch (status) {
    case 'open-verzoek':
      return {
        label: 'Open verzoek',
        pillClass: 'border-[#d5e6fb] bg-[#edf5ff] text-[#335f9c]',
      }
    case 'in-uitvoering':
      return {
        label: 'In uitvoering',
        pillClass: 'border-[#ffd7b8] bg-[#fff0df] text-[#bd6a16]',
      }
    case 'geblokkeerd':
      return {
        label: 'Geblokkeerd',
        pillClass: 'border-[#ffd7d1] bg-[#fff1ef] text-[#d2574b]',
      }
    case 'afgerond':
      return {
        label: 'Afgerond',
        pillClass: 'border-[#d5ebdb] bg-[#edf8f0] text-[#2f8454]',
      }
    case 'gestopt':
      return {
        label: 'Gestopt',
        pillClass: 'border-[#e6dfd3] bg-[#f7f2ea] text-[#6d6559]',
      }
    default:
      return {
        label: 'Te bespreken',
        pillClass: 'border-[#caece8] bg-[#dff7f4] text-[#0d6a7c]',
      }
  }
}

function getReviewOutcomeMeta(outcome: ActionCenterReviewOutcome) {
  switch (outcome) {
    case 'doorgaan':
      return {
        label: 'Doorgaan',
        className: 'border-[#d7ece8] bg-[#eef9f6] text-[#28776f]',
      }
    case 'bijstellen':
      return {
        label: 'Bijstellen',
        className: 'border-[#ffe1c7] bg-[#fff3e8] text-[#bb6b1f]',
      }
    case 'opschalen':
      return {
        label: 'Opschalen',
        className: 'border-[#d7e3f7] bg-[#edf3ff] text-[#3c5f9b]',
      }
    case 'afronden':
      return {
        label: 'Afronden',
        className: 'border-[#d5ebdb] bg-[#edf8f0] text-[#2f8454]',
      }
    case 'stoppen':
      return {
        label: 'Stoppen',
        className: 'border-[#f0d9d4] bg-[#fff1ef] text-[#c4584d]',
      }
    default:
      return {
        label: 'Nog geen uitkomst',
        className: 'border-[#e3d8ca] bg-[#fbf7f1] text-[#6b6257]',
      }
  }
}

function getDecisionLabel(decision: ActionCenterDecision) {
  switch (decision) {
    case 'doorgaan':
      return 'Doorgaan'
    case 'bijstellen':
      return 'Bijstellen'
    case 'afronden':
      return 'Afronden'
    case 'stoppen':
      return 'Stoppen'
    default:
      return decision
  }
}

function getHistoricalRouteLabel(item: ActionCenterPreviewItem) {
  const closingStatus = item.coreSemantics.closingSemantics.status

  if (closingStatus === 'gestopt' || item.status === 'gestopt') {
    return 'Bewust gestopt'
  }

  return 'Afgerond voor nu'
}

function getRouteCloseoutStatusLabel(status: ActionCenterRouteCloseoutStatus) {
  return status === 'gestopt' ? 'Bewust gestopt' : 'Afgerond voor nu'
}

function getRouteCloseoutReasonLabel(reason: ActionCenterRouteCloseoutReason) {
  switch (reason) {
    case 'voldoende-opgepakt':
      return 'Voldoende opgepakt'
    case 'effect-voldoende-zichtbaar':
      return 'Effect voldoende zichtbaar'
    case 'geen-verdere-opvolging-nodig':
      return 'Geen verdere opvolging nodig'
    case 'geen-lokale-vervolgstap-nodig':
      return 'Geen lokale vervolgstap nodig'
    case 'bewust-niet-voortzetten':
      return 'Bewust niet voortzetten'
    case 'elders-opgepakt':
      return 'Elders opgepakt'
    default:
      return reason
  }
}

function buildRouteCloseoutDefaults(): RouteCloseoutFormState {
  return {
    closeoutStatus: 'afgerond',
    closeoutReason: 'effect-voldoende-zichtbaar',
    closeoutNote: '',
  }
}

function compareReviewDate(left: string | null, right: string | null) {
  if (!left && !right) return 0
  if (!left) return 1
  if (!right) return -1

  return new Date(left).getTime() - new Date(right).getTime()
}

function getReviewBucket(dateValue: string | null, now: Date) {
  if (!dateValue) return 'later'

  const reviewDate = new Date(dateValue)
  if (Number.isNaN(reviewDate.getTime())) return 'later'

  const startOfToday = new Date(now)
  startOfToday.setHours(0, 0, 0, 0)

  const diffDays = Math.floor((reviewDate.getTime() - startOfToday.getTime()) / 86400000)

  if (diffDays < 0) return 'achterstallig'
  if (diffDays <= 6) return 'deze-week'
  if (diffDays <= 13) return 'volgende-week'
  return 'kwartaal'
}

function getCreateDefaults(items: ActionCenterPreviewItem[]) {
  const firstItem = items[0]

  return {
    title: '',
    summary: '',
    sourceLabel: firstItem?.sourceLabel ?? 'ExitScan',
    teamId: firstItem?.teamId ?? '',
    ownerName: firstItem?.ownerName ?? '',
    priority: 'hoog' as ActionCenterPreviewPriority,
    reviewDate: '',
    reviewRhythm: 'Tweewekelijks',
  }
}

function buildManagerResponseDefaults(item: ActionCenterPreviewItem | null): ManagerResponseFormState {
  const response = item?.managerResponse ?? null
  const hasPrimaryAction = Boolean(
    response?.primary_action_theme_key &&
      response.primary_action_text &&
      response.primary_action_expected_effect,
  )

  return {
    responseType: response?.response_type ?? 'confirm',
    responseNote:
      response?.response_note ??
      (item?.status === 'open-verzoek'
        ? 'We pakken dit eerst klein op in het team en toetsen daarna of een concretere stap nodig is.'
        : ''),
    reviewScheduledFor: response?.review_scheduled_for ?? item?.reviewDate ?? '',
    includePrimaryAction: hasPrimaryAction,
    primaryActionThemeKey: response?.primary_action_theme_key ?? '',
    primaryActionText: response?.primary_action_text ?? '',
    primaryActionExpectedEffect: response?.primary_action_expected_effect ?? '',
  }
}

function supportsManagerResponseFlow(item: ActionCenterPreviewItem | null) {
  return item?.scopeType === 'department' || item?.scopeType === 'item'
}

function isClosedRouteStatus(status: ActionCenterPreviewStatus) {
  return status === 'afgerond' || status === 'gestopt'
}

function isOpenAttentionStatus(status: ActionCenterPreviewStatus) {
  return status === 'open-verzoek' || status === 'te-bespreken' || status === 'geblokkeerd'
}

function getManagerResponseProjectedStatus(
  currentStatus: ActionCenterPreviewStatus,
  response: ActionCenterManagerResponse,
): ActionCenterRouteStatus {
  if (currentStatus === 'afgerond' || currentStatus === 'gestopt' || currentStatus === 'geblokkeerd') {
    return currentStatus
  }

  return hasPrimaryManagerAction(response) ? 'in-uitvoering' : 'te-bespreken'
}

function getManagerActionPhase(item: ActionCenterPreviewItem | null): ManagerActionPhase {
  if (!item) return 'awaiting-first-move'
  if ((item.coreSemantics.routeActionCards?.length ?? 0) > 0) return 'action-cards'
  if (hasPrimaryManagerAction(item.managerResponse)) return 'first-concrete-action'
  if (item.managerResponse) return 'bounded-response'
  return 'awaiting-first-move'
}

function getManagerActionSurfaceCopy(item: ActionCenterPreviewItem | null) {
  const phase = getManagerActionPhase(item)
  const actionCardCount = item?.coreSemantics.routeActionCards?.length ?? 0

  switch (phase) {
    case 'action-cards':
      return {
        eyebrow: 'Actieroute',
        title: 'Actieroute is gestart',
        description:
          actionCardCount === 1
            ? 'Deze route draagt nu een expliciete actiekaart. De eerste managerstap blijft zichtbaar als startcontext; uitvoering en review lopen nu primair via die actie.'
            : `Deze route draagt nu ${actionCardCount} expliciete actiekaarten. De eerste managerstap blijft zichtbaar als startcontext; uitvoering en review lopen nu primair via die acties.`,
        saveLabel: 'Managerstap bijwerken',
        emptyText:
          'Deze route wacht nog op een eerste lichte managerreactie. Tot die er is, blijft hij bewust klein en bestuurlijk leesbaar.',
        primaryActionToggle:
          'Gebruik dit alleen zolang één eerste concrete stap genoeg is. Zodra aparte actiekaarten bestaan, wordt die actielaag leidend.',
        readOnlyHint:
          'Uitvoering loopt nu via de actiekaarten in deze route. Deze eerste managerstap blijft alleen zichtbaar als startcontext.',
      }
    case 'first-concrete-action':
      return {
        eyebrow: 'Managerstap',
        title: 'Eerste concrete managerstap',
        description:
          'Deze route heeft al een eerste concrete managerstap. Pas als er daarna extra parallelle follow-through nodig is, groeit dit door naar expliciete actiekaarten.',
        saveLabel: 'Managerstap bijwerken',
        emptyText:
          'Deze route wacht nog op een eerste lichte managerreactie. Tot die er is, blijft hij bewust klein en bestuurlijk leesbaar.',
        primaryActionToggle:
          'Gebruik dit alleen als één eerste concrete stap nu echt helpt. De route hoeft niet meteen rijker te worden dan dit.',
        readOnlyHint:
          'De route heeft al een eerste concrete managerstap, maar blijft nog bewust kleiner dan een rijkere actieroute.',
      }
    case 'bounded-response':
      return {
        eyebrow: 'Managerstap',
        title: 'Eerste managerstap staat vast',
        description:
          'Deze route heeft al een eerste managerstap en reviewafspraak. Houd de route bewust klein totdat een aparte concrete actie echt helpt.',
        saveLabel: 'Managerstap bijwerken',
        emptyText:
          'Deze route wacht nog op een eerste lichte managerreactie. Tot die er is, blijft hij bewust klein en bestuurlijk leesbaar.',
        primaryActionToggle:
          'Leg alleen als dit meteen helpt één eerste concrete stap vast. Zonder die stap blijft de route bewust klein en reviewbaar.',
        readOnlyHint:
          'Nog geen aparte concrete actie vastgelegd; deze route blijft bewust klein tot een expliciete actielaag echt helpt.',
      }
    case 'awaiting-first-move':
    default:
      return {
        eyebrow: 'Open verzoek',
        title: 'Eerste managerstap',
        description:
          'HR heeft deze route lokaal geopend. De manager reageert eerst klein: erken wat nu moet gebeuren, leg de eerste bounded stap vast en plan meteen het eerste reviewmoment.',
        saveLabel: 'Eerste managerstap opslaan',
        emptyText:
          'Deze route wacht nog op een eerste lichte managerreactie. Tot die er is, blijft hij bewust klein en bestuurlijk leesbaar.',
        primaryActionToggle:
          'Leg alleen als dit meteen helpt één eerste concrete stap vast. Zonder die stap blijft de route bewust klein en reviewbaar.',
        readOnlyHint: null,
      }
  }
}

function getRouteSummaryDisplay(item: ActionCenterPreviewItem) {
  return (
    item.coreSemantics.routeSummary ?? {
      stateLabel: isClosedRouteStatus(item.status) ? getHistoricalRouteLabel(item) : getStatusMeta(item.status).label,
      overviewSummary: item.summary || item.reason || 'Nog geen route-read beschikbaar.',
      routeAsk:
        item.reviewReason ||
        item.reason ||
        'Bepaal welke eerste bounded vervolgstap deze route nu echt vraagt.',
      progressSummary:
        item.nextStep ||
        item.expectedEffect ||
        (isClosedRouteStatus(item.status)
          ? 'Deze route is historisch gesloten; extra voortgang is hier niet meer nodig.'
          : 'Nog geen compacte voortgangssamenvatting zichtbaar.'),
    }
  )
}

function applyManagerResponseToItem(
  item: ActionCenterPreviewItem,
  response: ActionCenterManagerResponse,
): ActionCenterPreviewItem {
  const nextStatus = getManagerResponseProjectedStatus(item.status, response)
  const followThroughMode = hasPrimaryManagerAction(response) ? 'primary_action' : 'bounded_response'
  const nextRoute: ActionCenterRouteContract = {
    ...item.coreSemantics.route,
    routeStatus: nextStatus,
    intervention: response.primary_action_text ?? null,
    expectedEffect: response.primary_action_expected_effect ?? null,
    reviewScheduledFor: response.review_scheduled_for,
    managerResponseType: response.response_type,
    managerResponseNote: response.response_note,
    primaryActionThemeKey: response.primary_action_theme_key ?? null,
    followThroughMode,
  }

  return {
    ...item,
    status: nextStatus,
    reviewDate: response.review_scheduled_for,
    reviewDateLabel: formatShortDate(response.review_scheduled_for),
    managerResponse: response,
    coreSemantics: {
      ...item.coreSemantics,
      route: nextRoute,
    },
  }
}

function getViewCopy(view: ActionCenterPreviewView, selectedTitle: string | null) {
  switch (view) {
    case 'actions':
      return {
        eyebrow: 'Action Center',
        title: 'Acties',
        description: 'Open verzoeken, bounded reacties en waar nodig een eerste concrete lokale stap, steeds gekoppeld aan echte dossiers.',
      }
    case 'reviews':
      return {
        eyebrow: 'Action Center',
        title: 'Reviewmomenten',
        description: 'Rustig overzicht van wat nu en de komende weken terug op tafel moet komen.',
      }
    case 'managers':
      return {
        eyebrow: 'Action Center',
        title: 'Managers toewijzen',
        description: 'Eigenaarschap blijft expliciet. Koppel per team een verantwoordelijke manager zonder extra lagen toe te voegen.',
      }
    case 'teams':
      return {
        eyebrow: 'Action Center',
        title: 'Mijn teams',
        description: 'Compact teamoverzicht op basis van dezelfde opvolgingslaag.',
      }
    default:
      return {
        eyebrow: 'Action Center',
        title: selectedTitle ? selectedTitle : 'Action Center',
        description: selectedTitle
          ? 'Eén route geopend: waarom dit dossier aandacht vraagt, wie eigenaar is en wanneer de review terugkomt.'
          : 'Van signaal naar opvolging. Zie rustig wat nu besproken moet worden, waar reviews terugkomen en waar eigenaarschap nog expliciet gemaakt moet worden.',
      }
  }
}

function getInitialFollowUpFormState(args: {
  item: ActionCenterPreviewItem | null
  assignmentOptions: ActionCenterPreviewManagerOption[]
}): FollowUpRouteFormState {
  const selectedOwnerId = args.item?.ownerId ?? null
  const defaultManagerUserId =
    (selectedOwnerId &&
    args.assignmentOptions.some((option) => option.value === selectedOwnerId)
      ? selectedOwnerId
      : args.assignmentOptions[0]?.value) ?? ''

  return {
    managerUserId: defaultManagerUserId,
    triggerReason: 'nieuw-campaign-signaal',
  }
}

function findDirectActiveFollowUpSuccessor(args: {
  items: ActionCenterPreviewItem[]
  sourceRouteId: string
}) {
  return (
    args.items.find(
      (item) =>
        item.coreSemantics.followUpSemantics?.isDirectSuccessor === true &&
        item.coreSemantics.followUpSemantics?.sourceRouteId === args.sourceRouteId &&
        !isClosedRouteStatus(item.status),
    ) ?? null
  )
}

function resolveSameScopeFollowUpTarget(args: {
  items: ActionCenterPreviewItem[]
  sourceItem: ActionCenterPreviewItem | null
}): {
  targetItem: ActionCenterPreviewItem | null
  reason: Exclude<FollowUpRouteBlockReason, 'already-has-direct-active-successor'> | null
} {
  const sourceItem = args.sourceItem
  if (!sourceItem) {
    return { targetItem: null, reason: 'no-same-scope-target' }
  }

  // V1 only supports department-scoped follow-up handoffs to one clear open route in the same department.
  const candidates = args.items.filter(
    (item) =>
      item.id !== sourceItem.id &&
      item.orgId === sourceItem.orgId &&
      item.scopeType === 'department' &&
      item.scopeType === sourceItem.scopeType &&
      item.teamId === sourceItem.teamId &&
      item.coreSemantics.route.campaignId !== sourceItem.coreSemantics.route.campaignId &&
      !isClosedRouteStatus(item.status) &&
      item.coreSemantics.followUpSemantics?.isDirectSuccessor !== true,
  )

  if (candidates.length === 1) {
    return { targetItem: candidates[0], reason: null }
  }

  return {
    targetItem: null,
    reason: candidates.length === 0 ? 'no-same-scope-target' : 'ambiguous-same-scope-target',
  }
}

function getFollowUpRouteBlockMessage(args: {
  reason: FollowUpRouteBlockReason
  directSuccessor: ActionCenterPreviewItem | null
}) {
  if (args.reason === 'already-has-direct-active-successor') {
    const triggerReasonLabel = args.directSuccessor?.coreSemantics.followUpSemantics?.triggerReasonLabel
    return triggerReasonLabel
      ? `Voor deze gesloten route loopt al een directe actieve vervolgroute (${triggerReasonLabel}).`
      : 'Voor deze gesloten route loopt al een directe actieve vervolgroute binnen dezelfde afdeling.'
  }

  if (args.reason === 'ambiguous-same-scope-target') {
    return 'Er zijn meerdere open doelroutes binnen deze afdeling. Kies in V1 eerst één eenduidige vervolgrichting.'
  }

  return 'Nog geen eenduidige open doelroute beschikbaar binnen deze afdeling.'
}

function applyOptimisticFollowUpSuccessor(args: {
  items: ActionCenterPreviewItem[]
  sourceRouteId: string
  targetItemId: string
  triggerReason: ActionCenterRouteFollowUpTriggerReason
}) {
  return args.items.map((item) => {
    if (item.id === args.targetItemId) {
      return finalizeActionCenterPreviewItem(
        {
          ...item,
          coreSemantics: {
            ...item.coreSemantics,
            lineageSummary: {
              overviewLabel: 'Vervolg op eerdere route',
              backwardLabel: 'Vervolg op eerdere route',
              backwardRouteId: args.sourceRouteId,
              forwardLabel: item.coreSemantics.lineageSummary.forwardLabel,
              forwardRouteId: item.coreSemantics.lineageSummary.forwardRouteId,
              detailLabels: [
                'Vervolg op eerdere route',
                ...item.coreSemantics.lineageSummary.detailLabels.filter(
                  (label) => label !== 'Vervolg op eerdere route',
                ),
              ],
            },
            followUpSemantics: {
              isDirectSuccessor: true,
              lineageLabel: 'Vervolg op eerdere route',
              triggerReason: args.triggerReason,
              triggerReasonLabel: getActionCenterFollowUpTriggerReasonLabel(args.triggerReason),
              sourceRouteId: args.sourceRouteId,
            },
          },
        },
        { recomputeCoreSemantics: true },
      )
    }

    if (item.coreSemantics.route.routeId === args.sourceRouteId) {
      return finalizeActionCenterPreviewItem(
        {
          ...item,
          coreSemantics: {
            ...item.coreSemantics,
            lineageSummary: {
              overviewLabel: item.coreSemantics.lineageSummary.backwardLabel ?? 'Later opgevolgd',
              backwardLabel: item.coreSemantics.lineageSummary.backwardLabel,
              backwardRouteId: item.coreSemantics.lineageSummary.backwardRouteId,
              forwardLabel: 'Later opgevolgd',
              forwardRouteId: args.targetItemId,
              detailLabels: [
                ...(item.coreSemantics.lineageSummary.backwardLabel
                  ? [item.coreSemantics.lineageSummary.backwardLabel]
                  : []),
                'Later opgevolgd',
              ],
            },
          },
        },
        { recomputeCoreSemantics: true },
      )
    }

    return item
  })
}

export function ActionCenterPreview({
  initialItems,
  initialSelectedItemId = null,
  initialView = 'overview',
  fallbackOwnerName,
  ownerOptions,
  managerOptions = [],
  canAssignManagers = false,
  managerAssignmentEndpoint,
  canRespondToRequests = false,
  managerResponseEndpoint,
  canCloseRoutes = false,
  routeCloseoutEndpoint,
  routeFollowUpEndpoint,
  currentUserId = null,
  workbenchHref,
  workbenchLabel = 'Open dossierbron',
  workspaceName,
  workspaceSubtitle = 'Admin-first opvolging',
  readOnly = false,
  itemHrefs = {},
  hideSidebar = false,
  boundedOverviewOnly = false,
}: Props) {
  const initialSelectedItem =
    initialItems.find((item) => item.id === initialSelectedItemId) ?? initialItems[0] ?? null
  const [items, setItems] = useState(() => initialItems.map((item) => finalizeActionCenterPreviewItem(item)))
  const [activeView, setActiveView] = useState<ActionCenterPreviewView>(initialView)
  const [selectedItemId, setSelectedItemId] = useState(initialSelectedItem?.id ?? null)
  const [selectedTeamId, setSelectedTeamId] = useState(initialSelectedItem?.teamId ?? initialItems[0]?.teamId ?? null)
  const [searchQuery, setSearchQuery] = useState('')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [createForm, setCreateForm] = useState<CreateActionFormState>(() => getCreateDefaults(initialItems))
  const [updateDraft, setUpdateDraft] = useState('')
  const [managerResponseForm, setManagerResponseForm] = useState<ManagerResponseFormState>(() =>
    buildManagerResponseDefaults(initialSelectedItem),
  )
  const [managerResponsePending, setManagerResponsePending] = useState(false)
  const [managerResponseError, setManagerResponseError] = useState<string | null>(null)
  const [routeCloseoutForm, setRouteCloseoutForm] = useState<RouteCloseoutFormState>(() => buildRouteCloseoutDefaults())
  const [routeCloseoutPanelOpen, setRouteCloseoutPanelOpen] = useState(false)
  const [routeCloseoutPending, setRouteCloseoutPending] = useState(false)
  const [routeCloseoutError, setRouteCloseoutError] = useState<string | null>(null)
  const [assignmentError, setAssignmentError] = useState<string | null>(null)
  const [assignmentPendingTeamId, setAssignmentPendingTeamId] = useState<string | null>(null)
  const deferredSearchQuery = useDeferredValue(searchQuery)

  useEffect(() => {
    if (!selectedItemId && items[0]) {
      setSelectedItemId(items[0].id)
    }
    if (!selectedTeamId && items[0]) {
      setSelectedTeamId(items[0].teamId)
    }
  }, [items, selectedItemId, selectedTeamId])

  const normalizedQuery = deferredSearchQuery.trim().toLowerCase()
  const filteredItems = items
    .filter((item) => {
      if (!normalizedQuery) return true
      return [
        item.title,
        item.teamLabel,
        item.ownerName ?? '',
        item.sourceLabel,
        item.code,
      ]
        .join(' ')
        .toLowerCase()
        .includes(normalizedQuery)
    })
    .sort((left, right) => {
      if (left.status !== right.status) {
        const rank: Record<ActionCenterPreviewStatus, number> = {
          'geblokkeerd': 0,
          'open-verzoek': 1,
          'te-bespreken': 2,
          'reviewbaar': 3,
          'in-uitvoering': 4,
          'afgerond': 5,
          'gestopt': 6,
        }
        return rank[left.status] - rank[right.status]
      }

      return compareReviewDate(left.reviewDate, right.reviewDate)
    })

  const selectedItem = filteredItems.find((item) => item.id === selectedItemId) ?? items.find((item) => item.id === selectedItemId) ?? filteredItems[0] ?? items[0] ?? null
  const managerActionSurfaceCopy = getManagerActionSurfaceCopy(selectedItem)
  const selectedRouteSummary = selectedItem ? getRouteSummaryDisplay(selectedItem) : null
  useEffect(() => {
    setManagerResponseForm(buildManagerResponseDefaults(selectedItem))
    setManagerResponseError(null)
  }, [selectedItem])
  useEffect(() => {
    setRouteCloseoutForm(buildRouteCloseoutDefaults())
    setRouteCloseoutPanelOpen(false)
    setRouteCloseoutError(null)
  }, [selectedItem])

  const selectedItemHref = selectedItem ? (itemHrefs[selectedItem.id] ?? workbenchHref) : workbenchHref
  const assignmentOptions = useMemo<ActionCenterPreviewManagerOption[]>(
    () =>
      managerOptions.length > 0
        ? managerOptions
        : ownerOptions.map((option) => ({
            value: option,
            label: option,
          })),
    [managerOptions, ownerOptions],
  )
  const [followUpForm, setFollowUpForm] = useState<FollowUpRouteFormState>(() =>
    getInitialFollowUpFormState({ item: initialSelectedItem, assignmentOptions }),
  )
  const [followUpPending, setFollowUpPending] = useState(false)
  const [followUpError, setFollowUpError] = useState<string | null>(null)
  const managerLabelByValue = useMemo(
    () => new Map(assignmentOptions.map((option) => [option.value, option.label])),
    [assignmentOptions],
  )
  const previewRouteIds = useMemo(() => new Set(items.map((item) => item.id)), [items])
  const previewRouteTitles = useMemo(() => new Map(items.map((item) => [item.id, item.title] as const)), [items])
  useEffect(() => {
    setFollowUpForm(getInitialFollowUpFormState({ item: selectedItem, assignmentOptions }))
    setFollowUpError(null)
  }, [assignmentOptions, selectedItem])
  const teamRows = buildActionCenterTeamRows(items)
  const selectedTeam = teamRows.find((team) => team.id === selectedTeamId) ?? teamRows[0] ?? null
  const allSources = [...new Set(items.map((item) => item.sourceLabel))]
  const workspaceReadbackSummary = useMemo(() => getLiveActionCenterSummary(items), [items])
  const selectedItemLineage = selectedItem ? buildDetailLineageEntries(selectedItem, previewRouteTitles) : []
  const today = new Date()
  const dueItems = items.filter((item) => isOpenAttentionStatus(item.status))
  const openItems = items.filter((item) => item.status !== 'afgerond' && item.status !== 'gestopt')
  const overdueReviews = items.filter((item) => getReviewBucket(item.reviewDate, today) === 'achterstallig')
  const thisWeekReviews = items.filter((item) => getReviewBucket(item.reviewDate, today) === 'deze-week')
  const nextWeekReviews = items.filter((item) => getReviewBucket(item.reviewDate, today) === 'volgende-week')
  const quarterReviews = items.filter((item) => getReviewBucket(item.reviewDate, today) === 'kwartaal')
  const visibleItems = filteredItems.length > 0 ? filteredItems : items
  const visibleDueItems = visibleItems.filter((item) => isOpenAttentionStatus(item.status))
  const upcomingReviews = [...items]
    .filter((item) => item.reviewDate)
    .sort((left, right) => compareReviewDate(left.reviewDate, right.reviewDate))
    .slice(0, 4)
  const earliestReview = upcomingReviews[0]?.reviewDateLabel ?? 'Nog niet gepland'
  const missingManagerCount = teamRows.filter((team) => !team.currentManagerName).length
  const ownerCoverageCount = teamRows.length - missingManagerCount
  const selectedTeamItems = items.filter((item) => item.teamId === selectedTeam?.id)
  const teamOpenItems = selectedTeamItems.filter((item) => item.status !== 'afgerond' && item.status !== 'gestopt')
  const focusItem = visibleDueItems[0] ?? visibleItems[0] ?? null
  const viewCopy = getViewCopy(activeView, activeView === 'overview' && selectedItem ? null : activeView === 'overview' ? null : selectedItem?.title ?? null)
  const allowLocalDraftEditing = !readOnly && !managerResponseEndpoint
  const canUseManagerResponseFlow =
    Boolean(
      canRespondToRequests &&
        managerResponseEndpoint &&
        selectedItem?.orgId &&
        supportsManagerResponseFlow(selectedItem) &&
        selectedItem?.ownerId &&
        currentUserId &&
        selectedItem.ownerId === currentUserId,
    )
  const canRenderFollowUpRoute = Boolean(
    routeFollowUpEndpoint &&
      canAssignManagers &&
      selectedItem?.orgId &&
      selectedItem.scopeType === 'department' &&
      isClosedRouteStatus(selectedItem.status),
  )
  const canRenderRouteCloseout = Boolean(
    routeCloseoutEndpoint &&
      canCloseRoutes &&
      selectedItem?.orgId &&
      (selectedItem.scopeType === 'department' || selectedItem.scopeType === 'item') &&
      !isClosedRouteStatus(selectedItem.status),
  )
  const directActiveFollowUpSuccessor = useMemo(
    () =>
      selectedItem
        ? findDirectActiveFollowUpSuccessor({
            items,
            sourceRouteId: selectedItem.coreSemantics.route.routeId,
          })
        : null,
    [items, selectedItem],
  )
  const followUpTargetResolution = useMemo(
    () =>
      resolveSameScopeFollowUpTarget({
        items,
        sourceItem: selectedItem,
      }),
    [items, selectedItem],
  )
  const followUpTargetItem = followUpTargetResolution.targetItem
  const followUpRouteBlockReason = !canRenderFollowUpRoute
    ? null
    : directActiveFollowUpSuccessor
      ? 'already-has-direct-active-successor'
      : followUpTargetResolution.reason
  const followUpRouteBlockMessage = followUpRouteBlockReason
    ? getFollowUpRouteBlockMessage({
        reason: followUpRouteBlockReason,
        directSuccessor: directActiveFollowUpSuccessor,
      })
    : null
  const canShowFollowUpRouteAffordance = Boolean(canRenderFollowUpRoute && !followUpRouteBlockReason)

  function updateItem(itemId: string, updater: (item: ActionCenterPreviewItem) => ActionCenterPreviewItem) {
    setItems((currentItems) =>
      currentItems.map((item) =>
        item.id === itemId ? finalizeActionCenterPreviewItem(updater(item), { recomputeCoreSemantics: true }) : item,
      ),
    )
  }

  const closing = selectedItem?.coreSemantics.closingSemantics ?? null
  const hasClosingPanel =
    closing !== null && (closing.status !== 'lopend' || Boolean(closing.historicalSummary ?? closing.summary))

  function handleCreateAction() {
    if (!createForm.title.trim() || !createForm.teamId) {
      return
    }

    const team = teamRows.find((entry) => entry.id === createForm.teamId)
    const nextIndex = items.length + 1040
    const newItem = finalizeActionCenterPreviewItem({
      id: `local-${nextIndex}`,
      code: `ACT-${nextIndex}`,
      title: createForm.title.trim(),
      summary: createForm.summary.trim() || 'Nieuwe opvolgactie vanuit Action Center.',
      reason: createForm.summary.trim() || 'Nieuwe actie gekoppeld aan een bestaand dossier of signaal.',
      sourceLabel: createForm.sourceLabel,
      teamId: createForm.teamId,
      teamLabel: team?.label ?? 'Nieuw team',
      ownerName: createForm.ownerName || null,
      ownerRole: createForm.ownerName ? `Manager - ${team?.label ?? 'team'}` : 'Nog niet toegewezen',
      ownerSubtitle: team?.label ?? 'Adminroute',
      reviewOwnerName: createForm.ownerName || null,
      expectedEffect: null,
      reviewReason: null,
      reviewOutcome: 'geen-uitkomst',
      priority: createForm.priority,
      status: 'te-bespreken',
      reviewDate: createForm.reviewDate || null,
      reviewDateLabel: formatShortDate(createForm.reviewDate || null),
      reviewRhythm: createForm.reviewRhythm,
      signalLabel: `${createForm.sourceLabel} - ${team?.label ?? 'teamcontext'}`,
      signalBody: createForm.summary.trim() || 'Handmatige follow-up zonder extra productkoppelingen.',
      nextStep: 'Eerste vervolgstap vastleggen en reviewdatum bevestigen.',
      peopleCount: team?.peopleCount ?? 0,
      updates: [
        {
          id: `local-update-${nextIndex}`,
          author: 'Admin',
          dateLabel: formatShortDate(new Date().toISOString()),
          note: 'Actie handmatig toegevoegd in de preview-surface.',
        },
      ],
    })

    setItems((current) => [newItem, ...current])
    setSelectedItemId(newItem.id)
    setSelectedTeamId(newItem.teamId)
    setActiveView('actions')
    setShowCreateModal(false)
    setCreateForm(getCreateDefaults([newItem, ...items]))
  }

  async function handleManagerChange(teamId: string, managerValue: string) {
    const trimmedManagerValue = managerValue.trim()
    const managerLabel = trimmedManagerValue ? (managerLabelByValue.get(trimmedManagerValue) ?? trimmedManagerValue) : null
    const team = teamRows.find((entry) => entry.id === teamId) ?? null

    setAssignmentError(null)
    setItems((currentItems) =>
      currentItems.map((item) =>
        item.teamId === teamId
          ? finalizeActionCenterPreviewItem({
              ...item,
              ownerId: trimmedManagerValue || null,
              ownerName: managerLabel,
              ownerRole: managerLabel ? `Manager - ${item.teamLabel}` : 'Nog niet toegewezen',
              ownerSubtitle: item.teamLabel,
              reviewOwnerName: managerLabel || item.reviewOwnerName,
            }, { recomputeCoreSemantics: true })
          : item,
      ),
    )

    if (!canAssignManagers || !managerAssignmentEndpoint || !team?.orgId) {
      return
    }

    setAssignmentPendingTeamId(teamId)
    try {
      const response = await fetch(managerAssignmentEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orgId: team.orgId,
          scopeType: team.scopeType ?? 'department',
          scopeValue: teamId,
          managerUserId: trimmedManagerValue || null,
        }),
      })

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as { error?: string } | null
        throw new Error(payload?.error ?? 'Managerassignment kon niet worden opgeslagen.')
      }
    } catch (error) {
      setAssignmentError(error instanceof Error ? error.message : 'Managerassignment kon niet worden opgeslagen.')
    } finally {
      setAssignmentPendingTeamId(null)
    }
  }

  async function handleManagerResponseSave() {
    if (!selectedItem || !selectedItem.orgId || !supportsManagerResponseFlow(selectedItem) || !managerResponseEndpoint) {
      return
    }

    setManagerResponsePending(true)
    setManagerResponseError(null)

    const payload = {
      campaign_id: selectedItem.coreSemantics.route.campaignId,
      org_id: selectedItem.orgId,
      route_scope_type: selectedItem.scopeType,
      route_scope_value: selectedItem.teamId,
      manager_user_id: selectedItem.ownerId ?? '',
      response_type: managerResponseForm.responseType,
      response_note: managerResponseForm.responseNote,
      review_scheduled_for: managerResponseForm.reviewScheduledFor,
      primary_action_theme_key:
        managerResponseForm.includePrimaryAction && managerResponseForm.primaryActionThemeKey
          ? managerResponseForm.primaryActionThemeKey
          : null,
      primary_action_text:
        managerResponseForm.includePrimaryAction && managerResponseForm.primaryActionText.trim()
          ? managerResponseForm.primaryActionText
          : null,
      primary_action_expected_effect:
        managerResponseForm.includePrimaryAction && managerResponseForm.primaryActionExpectedEffect.trim()
          ? managerResponseForm.primaryActionExpectedEffect
          : null,
      primary_action_status: managerResponseForm.includePrimaryAction ? 'active' : null,
    }

    try {
      const response = await fetch(managerResponseEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })
      const result = (await response.json().catch(() => null)) as
        | { response?: ActionCenterManagerResponse; detail?: string }
        | null

      if (!response.ok || !result?.response) {
        throw new Error(result?.detail ?? 'Managerreactie kon niet worden opgeslagen.')
      }

      const savedResponse = result.response
      const nextItem = finalizeActionCenterPreviewItem(applyManagerResponseToItem(selectedItem, savedResponse), {
        recomputeCoreSemantics: true,
      })

      setItems((currentItems) =>
        currentItems.map((item) =>
          item.id === selectedItem.id
            ? finalizeActionCenterPreviewItem(applyManagerResponseToItem(item, savedResponse), {
                recomputeCoreSemantics: true,
              })
            : item,
        ),
      )
      setManagerResponseForm(buildManagerResponseDefaults(nextItem))
    } catch (error) {
      setManagerResponseError(
        error instanceof Error ? error.message : 'Managerreactie kon niet worden opgeslagen.',
      )
    } finally {
      setManagerResponsePending(false)
    }
  }

  async function handleRouteCloseoutSave() {
    if (!selectedItem || !routeCloseoutEndpoint || !selectedItem.orgId) {
      return
    }

    if (selectedItem.scopeType !== 'department' && selectedItem.scopeType !== 'item') {
      setRouteCloseoutError('Deze route kan in deze surface niet expliciet worden afgesloten.')
      return
    }

    setRouteCloseoutPending(true)
    setRouteCloseoutError(null)

    try {
      const response = await fetch(routeCloseoutEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          campaign_id: selectedItem.coreSemantics.route.campaignId,
          route_scope_type: selectedItem.scopeType,
          route_scope_value: selectedItem.teamId,
          closeout_status: routeCloseoutForm.closeoutStatus,
          closeout_reason: routeCloseoutForm.closeoutReason,
          closeout_note: routeCloseoutForm.closeoutNote.trim() || null,
        }),
      })

      const result = (await response.json().catch(() => null)) as
        | { closeout?: { closedAt?: string | null }; detail?: string }
        | null

      if (!response.ok) {
        throw new Error(result?.detail ?? 'Route closeout opslaan mislukt.')
      }
      if (typeof window !== 'undefined') {
        window.location.reload()
        return
      }
    } catch (error) {
      setRouteCloseoutError(error instanceof Error ? error.message : 'Route closeout opslaan mislukt.')
    } finally {
      setRouteCloseoutPending(false)
    }
  }

  async function handleFollowUpRouteStart() {
    if (!selectedItem || !routeFollowUpEndpoint) return

    const managerUserId = followUpForm.managerUserId.trim()
    if (!managerUserId) {
      setFollowUpError('Kies eerst een manager voor deze vervolgroute.')
      return
    }

    if (!followUpTargetItem) {
      setFollowUpError('Nog geen doelroute beschikbaar voor deze afdeling.')
      return
    }

    setFollowUpPending(true)
    setFollowUpError(null)

    try {
      const response = await fetch(routeFollowUpEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          source_campaign_id: selectedItem.coreSemantics.route.campaignId,
          source_route_scope_value: selectedItem.teamId,
          target_campaign_id: followUpTargetItem.coreSemantics.route.campaignId,
          target_route_scope_value: followUpTargetItem.teamId,
          trigger_reason: followUpForm.triggerReason,
          manager_user_id: managerUserId,
        }),
      })
      const result = (await response.json().catch(() => null)) as { detail?: string } | null

      if (!response.ok) {
        throw new Error(result?.detail ?? 'Vervolgroute kon niet worden gestart.')
      }

      setItems((currentItems) =>
        applyOptimisticFollowUpSuccessor({
          items: currentItems,
          sourceRouteId: selectedItem.coreSemantics.route.routeId,
          targetItemId: followUpTargetItem.id,
          triggerReason: followUpForm.triggerReason,
        }),
      )
      focusActionRoute(followUpTargetItem.id)
    } catch (error) {
      setFollowUpError(error instanceof Error ? error.message : 'Vervolgroute kon niet worden gestart.')
    } finally {
      setFollowUpPending(false)
    }
  }

  function focusActionRoute(routeId: string) {
    setSelectedItemId(routeId)
    setActiveView('actions')
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href)
      url.searchParams.set('focus', routeId)
      window.history.replaceState(window.history.state, '', `${url.pathname}${url.search}${url.hash}`)
    }
  }

  function handleStatusChange(nextStatus: ActionCenterPreviewStatus) {
    if (!selectedItem) return

    updateItem(selectedItem.id, (item) => ({
      ...item,
      status: nextStatus,
      updates: [
        {
          id: `${item.id}-status-${Date.now()}`,
          author: 'Admin',
          dateLabel: formatShortDate(new Date().toISOString()),
          note: `Status gewijzigd naar ${getStatusMeta(nextStatus).label.toLowerCase()}.`,
        },
        ...item.updates,
      ],
    }))
  }

  function handleReviewPlanChange(reviewDate: string, reviewRhythm: string) {
    if (!selectedItem) return

    updateItem(selectedItem.id, (item) => ({
      ...item,
      reviewDate: reviewDate || null,
      reviewDateLabel: formatShortDate(reviewDate || null),
      reviewRhythm,
      updates: [
        {
          id: `${item.id}-review-${Date.now()}`,
          author: 'Admin',
          dateLabel: formatShortDate(new Date().toISOString()),
          note: reviewDate
            ? `Review gepland op ${formatLongDate(reviewDate)} met ritme ${reviewRhythm.toLowerCase()}.`
            : 'Reviewdatum verwijderd uit de preview.',
        },
        ...item.updates,
      ],
    }))
  }

  function handleAddUpdate() {
    if (!selectedItem || !updateDraft.trim()) return

    updateItem(selectedItem.id, (item) => ({
      ...item,
      updates: [
        {
          id: `${item.id}-note-${Date.now()}`,
          author: 'Admin',
          dateLabel: formatShortDate(new Date().toISOString()),
          note: updateDraft.trim(),
        },
        ...item.updates,
      ],
    }))
    setUpdateDraft('')
  }

  const navigationCounts = useMemo(() => {
    return {
      actions: openItems.length,
      reviews: overdueReviews.length + thisWeekReviews.length,
      managers: missingManagerCount,
      teams: selectedTeam ? teamOpenItems.length : 0,
    }
  }, [missingManagerCount, openItems.length, overdueReviews.length, selectedTeam, teamOpenItems.length, thisWeekReviews.length])

  const headerTabs = hideSidebar
    ? SIDEBAR_ITEMS.map((item) => ({
        key: item.key,
        label: item.label,
        active: activeView === item.key,
        count:
          item.key === 'overview'
            ? 0
            : item.key === 'actions'
              ? navigationCounts.actions
              : item.key === 'reviews'
                ? navigationCounts.reviews
                : item.key === 'managers'
                  ? navigationCounts.managers
                  : navigationCounts.teams,
        onClick: () => setActiveView(item.key),
      }))
    : []
  const showBoundedOverviewOnly = boundedOverviewOnly && activeView === 'overview'

  return (
    <div
      className={
        hideSidebar
          ? 'overflow-hidden rounded-[28px] border border-[color:var(--dashboard-frame-border)] bg-[color:var(--dashboard-surface)] shadow-[0_18px_48px_rgba(19,32,51,0.08)]'
          : 'overflow-hidden rounded-[30px] border border-[#e6dccf] bg-[#f8f3ec] shadow-[0_24px_80px_rgba(19,32,51,0.12)]'
      }
    >
      <div className={`flex flex-col lg:flex-row ${hideSidebar ? '' : 'min-h-[980px]'}`}>
        <aside className={`flex w-full shrink-0 flex-col bg-[#182231] text-[#f6f1e9] lg:w-[286px] ${hideSidebar ? 'hidden' : ''}`}>
          <div className="border-b border-white/6 px-6 py-6">
            <Link href="/dashboard" className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#ff9b4a] text-base font-semibold text-[#182231]">
                V
              </div>
              <div>
                <p className="text-[1.05rem] font-semibold tracking-[-0.02em]">Verisight</p>
                <p className="text-sm text-white/55">Duiding &amp; opvolging</p>
              </div>
            </Link>
          </div>

          <div className="flex-1 px-4 py-6">
            <SidebarGroup
              title="Werkruimte"
              items={[
                {
                  key: 'overview',
                  label: 'Overzicht',
                  active: activeView === 'overview',
                  count: 0,
                  onClick: () => setActiveView('overview'),
                },
              ]}
            />
            <SidebarGroup
              title="Action Center"
              items={SIDEBAR_ITEMS.slice(1).map((item) => ({
                key: item.key,
                label: item.label,
                active: activeView === item.key,
                count:
                  item.key === 'actions'
                    ? navigationCounts.actions
                    : item.key === 'reviews'
                      ? navigationCounts.reviews
                      : item.key === 'managers'
                        ? navigationCounts.managers
                        : navigationCounts.teams,
                onClick: () => setActiveView(item.key),
              }))}
            />

            <div className="mt-8 rounded-[18px] border border-white/10 bg-white/[0.03] p-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/45">Begeleiding</p>
              <p className="mt-3 text-base font-semibold">Volgende reviewsessie</p>
              <p className="mt-1 text-sm leading-6 text-white/68">
                Eerstvolgende reviewmoment: <span className="font-semibold text-[#ffb16e]">{earliestReview}</span>
              </p>
              <Link
                href={selectedItemHref}
                className="mt-4 inline-flex rounded-full border border-white/10 bg-white/[0.05] px-3 py-1.5 text-sm font-semibold text-white/82 transition hover:bg-white/[0.08]"
              >
                {workbenchLabel}
              </Link>
            </div>
          </div>

          <div className="border-t border-white/6 px-5 py-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/8 text-sm font-semibold">
                {getInitials(fallbackOwnerName)}
              </div>
              <div className="min-w-0">
                <p className="truncate font-semibold">{workspaceName ?? fallbackOwnerName}</p>
                <p className="truncate text-sm text-white/48">{workspaceSubtitle}</p>
              </div>
            </div>
          </div>
        </aside>

        <div className="min-w-0 flex-1">
          <div className={`border-b border-[#e6ddd2] px-6 py-6 ${hideSidebar ? 'bg-[#fcfaf7]' : 'bg-[#f7f2ea]'}`}>
            <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#8b8174]">{viewCopy.eyebrow}</p>
                <p className="mt-3 text-sm text-[#8b8174]">
                  {activeView === 'overview'
                    ? 'Suite / Action Center'
                    : activeView === 'actions'
                      ? 'Action Center / Acties'
                      : activeView === 'reviews'
                        ? 'Action Center / Reviewmomenten'
                        : activeView === 'managers'
                          ? 'Action Center / Managers'
                          : 'Action Center / Mijn teams'}
                  {activeView === 'actions' && selectedItem ? ` / ${selectedItem.code}` : ''}
                </p>
                <h1 className="mt-3 text-[2.6rem] font-semibold tracking-[-0.055em] text-[#132033]">
                  {viewCopy.title}
                </h1>
                <p className="mt-4 max-w-3xl text-[1.02rem] leading-8 text-[#42556b]">{viewCopy.description}</p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <label className="flex min-w-[320px] items-center gap-3 rounded-full border border-[#ddd3c7] bg-white px-4 py-3 text-sm text-[#6a6258] shadow-[inset_0_1px_0_rgba(255,255,255,0.75)]">
                  <SearchIcon />
                  <input
                    value={searchQuery}
                    onChange={(event) => setSearchQuery(event.target.value)}
                    placeholder="Zoek actie, team of eigenaar"
                    className="w-full bg-transparent text-[0.97rem] text-[#2a3442] outline-none placeholder:text-[#9a9084]"
                  />
                </label>
                {allowLocalDraftEditing ? (
                  <button
                    type="button"
                    className="inline-flex items-center justify-center rounded-2xl bg-[#1a2533] px-5 py-3 text-[0.97rem] font-semibold text-white transition hover:bg-[#223247]"
                    onClick={() => setShowCreateModal(true)}
                  >
                    <span className="mr-2 text-lg leading-none">+</span>
                    Actie aanmaken
                  </button>
                ) : null}
              </div>
            </div>
            {hideSidebar && !boundedOverviewOnly ? (
              <div className="mt-6 flex flex-wrap items-center gap-2 border-t border-[#eee6da] pt-4">
                {headerTabs.map((item) => (
                  <button
                    key={item.key}
                    type="button"
                    className={`inline-flex min-h-11 items-center gap-2 rounded-full border px-4.5 py-2.5 text-sm font-semibold transition ${
                      item.active
                        ? 'border-[#1a2533] bg-[#1a2533] text-white'
                        : 'border-[#e4d9cb] bg-[#f8f3ed] text-[#5f564a] hover:border-[#c5b8a8] hover:text-[#132033]'
                    }`}
                    onClick={item.onClick}
                  >
                    <span>{item.label}</span>
                    {item.count > 0 ? (
                      <span
                        className={`rounded-full px-2 py-0.5 text-[11px] ${
                          item.active ? 'bg-white/16 text-white' : 'bg-white text-[#73695d]'
                        }`}
                      >
                        {item.count}
                      </span>
                    ) : null}
                  </button>
                ))}
              </div>
            ) : null}
          </div>

          <div className="px-6 py-6">
            {activeView === 'overview' ? (
              <div className="space-y-8">
                <div className="grid gap-6 xl:grid-cols-[minmax(0,1.55fr),minmax(320px,0.95fr)]">
                  <section className="rounded-[28px] border border-[#e4d9cb] bg-[#fcfaf7] px-7 py-7 shadow-[0_12px_36px_rgba(19,32,51,0.06)]">
                    <div className="flex flex-col gap-8 xl:flex-row xl:items-end xl:justify-between">
                      <div className="max-w-2xl">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#8d8377]">
                          {showBoundedOverviewOnly ? 'Overzicht' : 'Managementritme'}
                        </p>
                        <h2 className="mt-3 text-[2rem] font-semibold tracking-[-0.05em] text-[#132033]">
                          {showBoundedOverviewOnly ? 'Wat vraagt nu aandacht?' : 'Wat moet nu gelezen en opgepakt worden?'}
                        </h2>
                        <p className="mt-4 max-w-xl text-[1rem] leading-8 text-[#4f6175]">
                          {showBoundedOverviewOnly
                            ? 'Overzicht van managementopvolging en acties.'
                            : 'Action Center bundelt live opvolging uit campagnes en dossiers tot een eerste overzicht van wat nu aandacht vraagt.'}
                        </p>
                      </div>
                      <div className={`grid gap-3 ${showBoundedOverviewOnly ? 'sm:grid-cols-2 xl:grid-cols-4' : 'sm:grid-cols-3 xl:max-w-[34rem] xl:flex-1'}`}>
                        {showBoundedOverviewOnly ? (
                          <>
                            <OverviewStat
                              label="Actieve routes"
                              value={`${workspaceReadbackSummary.activeRouteCount}`}
                              detail={`${workspaceReadbackSummary.routeCount} zichtbare routes`}
                              accent="teal"
                            />
                            <OverviewStat
                              label="Te bespreken / reviewbaar"
                              value={`${items.filter((item) => item.status === 'te-bespreken' || item.status === 'reviewbaar').length}`}
                              detail={`${overdueReviews.length + thisWeekReviews.length} reviews nu of deze week`}
                              accent="amber"
                            />
                            <OverviewStat
                              label="Geblokkeerd"
                              value={`${workspaceReadbackSummary.blockedCount}`}
                              detail={`${items.filter((item) => item.status === 'geblokkeerd').length} zichtbare blokkades`}
                              accent="red"
                            />
                            <OverviewStat
                              label="Afgerond"
                              value={`${workspaceReadbackSummary.closedRouteCount}`}
                              detail={`${workspaceReadbackSummary.closedRouteCount} routes met vastgelegd resultaat`}
                              accent="slate"
                            />
                          </>
                        ) : null}
                        {showBoundedOverviewOnly ? null : (
                          <>
                            <OverviewStat
                              label="Nu bespreken"
                              value={`${dueItems.length}`}
                              detail={`${items.filter((item) => item.status === 'te-bespreken').length} klaar voor gesprek`}
                              accent="amber"
                            />
                            <OverviewStat
                              label="Review < 14 dagen"
                              value={`${overdueReviews.length + thisWeekReviews.length + nextWeekReviews.length}`}
                              detail={`${overdueReviews.length} achterstallig`}
                              accent="red"
                            />
                            <OverviewStat
                              label="Eigenaarschap gedekt"
                              value={`${ownerCoverageCount}`}
                              detail={teamRows.length > 0 ? `van ${teamRows.length} teams expliciet gekoppeld` : 'nog geen teams zichtbaar'}
                              accent="teal"
                            />
                          </>
                        )}
                      </div>
                    </div>

                    <div className="mt-8 flex items-center justify-between gap-3 border-t border-[#ece4d8] pt-6">
                      <div>
                        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#8d8377]">Nu in beeld</p>
                        <h3 className="mt-2 text-[1.35rem] font-semibold tracking-[-0.03em] text-[#132033]">
                          {showBoundedOverviewOnly ? 'Acties en opvolging' : 'Eerste managementflow'}
                        </h3>
                      </div>
                      {showBoundedOverviewOnly ? null : (
                        <button
                          type="button"
                          className="text-sm font-semibold text-[#4a5f74] transition hover:text-[#132033]"
                          onClick={() => setActiveView('actions')}
                        >
                          Open alle acties
                        </button>
                      )}
                    </div>
                    <div className="mt-2 divide-y divide-[#ece4d8]">
                      {visibleItems.slice(0, 4).map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          className="flex w-full flex-col gap-4 py-5 text-left transition hover:bg-[#f8f2eb]"
                          onClick={() => {
                            setSelectedItemId(item.id)
                            setActiveView('actions')
                          }}
                        >
                          <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                            <div className="min-w-0">
                              <div className="flex flex-wrap items-center gap-2 text-sm text-[#6d6458]">
                                <MiniTag>{item.sourceLabel}</MiniTag>
                                <span>{item.teamLabel}</span>
                                <span className="text-[#b2a496]">/</span>
                                <span>{getOwnerDisplayName(item.ownerName)}</span>
                              </div>
                              <h3 className="mt-3 text-[1.15rem] font-semibold tracking-[-0.02em] text-[#132033]">{item.title}</h3>
                              <p className="mt-2 max-w-[44rem] text-[0.98rem] leading-7 text-[#4f6175]">{item.summary}</p>
                              <CompactLandingSummary item={item} />
                            </div>
                            <div className="flex shrink-0 items-start gap-3 xl:min-w-[198px] xl:justify-end">
                              <StatusPill status={item.status} />
                              <div className="text-right">
                                <p className="text-sm font-semibold text-[#132033]">review {item.reviewDateLabel}</p>
                                <p className="mt-1 text-sm text-[#8b8174]">Ritme {item.reviewRhythm}</p>
                              </div>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </section>

                  <aside className="rounded-[30px] bg-[#182231] px-7 py-7 text-white shadow-[0_22px_56px_rgba(19,32,51,0.18)]">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/45">
                      {showBoundedOverviewOnly ? 'Wat vraagt nu aandacht?' : 'Aanbevolen focus'}
                    </p>
                    <h2 className="mt-3 text-[1.8rem] font-semibold tracking-[-0.045em]">
                      {focusItem?.title ?? 'Action Center ritme staat klaar'}
                    </h2>
                    <p className="mt-4 text-[0.98rem] leading-8 text-white/72">
                      {focusItem?.coreSemantics.reviewSemantics.reviewReason ??
                        'Zodra live opvolging zichtbaar is, landt hier automatisch het belangrijkste gesprek voor deze week.'}
                    </p>

                    <div className="mt-6 space-y-4 border-t border-white/10 pt-6">
                      <FocusSummaryRow label="Afdeling" value={focusItem?.teamLabel ?? 'Nog niet zichtbaar'} />
                      <FocusSummaryRow label="Eigenaar" value={getOwnerDisplayName(focusItem?.ownerName ?? null)} />
                      <FocusSummaryRow label="Bron" value={focusItem?.sourceLabel ?? 'Action Center'} />
                      <FocusSummaryRow label="Volgende review" value={focusItem?.reviewDateLabel ?? earliestReview} />
                    </div>

                    <div className="mt-6 rounded-[24px] border border-white/10 bg-white/[0.04] px-5 py-5">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/48">Volgende stap</p>
                      <p className="mt-3 text-base leading-7 text-white/86">
                        {focusItem?.coreSemantics.actionFrame.firstStep ??
                          'De eerste review en eigenaar worden automatisch zichtbaar zodra een dossier live staat.'}
                      </p>
                    </div>

                    <div className="mt-6 flex flex-wrap gap-3">
                      <button
                        type="button"
                        className="inline-flex min-h-11 items-center rounded-full bg-[#ff9b4a] px-4.5 py-2.5 text-sm font-semibold text-[#132033] transition hover:brightness-[0.98]"
                        onClick={() => {
                          if (focusItem) {
                            setSelectedItemId(focusItem.id)
                            setActiveView(showBoundedOverviewOnly ? 'overview' : 'actions')
                          } else if (!showBoundedOverviewOnly) {
                            setActiveView('actions')
                          }
                        }}
                      >
                        {showBoundedOverviewOnly ? 'Open detail' : 'Open focusactie'}
                      </button>
                      <Link
                        href={focusItem ? (itemHrefs[focusItem.id] ?? workbenchHref) : workbenchHref}
                        className="inline-flex min-h-11 items-center rounded-full border border-white/12 px-4.5 py-2.5 text-sm font-semibold text-white/82 transition hover:bg-white/[0.06]"
                      >
                        {workbenchLabel}
                      </Link>
                    </div>
                  </aside>
                </div>

                <div className="grid gap-6 xl:grid-cols-[minmax(0,1.1fr),minmax(320px,0.9fr)]">
                  <section className="rounded-[28px] border border-[#e4d9cb] bg-white px-7 py-7 shadow-[0_12px_36px_rgba(19,32,51,0.06)]">
                    <div className="flex flex-col gap-5 border-b border-[#ece4d8] pb-6 lg:flex-row lg:items-end lg:justify-between">
                      <div>
                        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#8d8377]">Reviewvenster</p>
                        <h2 className="mt-2 text-[1.5rem] font-semibold tracking-[-0.04em] text-[#132033]">Komende 14 dagen</h2>
                      </div>
                      <div className="grid gap-3 sm:grid-cols-3">
                        <ReviewWindowStat label="Achterstallig" value={`${overdueReviews.length}`} tone="red" />
                        <ReviewWindowStat label="Deze week" value={`${thisWeekReviews.length}`} tone="amber" />
                        <ReviewWindowStat label="Volgende week" value={`${nextWeekReviews.length}`} tone="slate" />
                      </div>
                    </div>

                    <div className="mt-6 space-y-4">
                      {upcomingReviews.length === 0 ? (
                        <EmptyBlock text="Zodra reviewmomenten gepland zijn, komen ze hier automatisch in Action Center." />
                      ) : (
                        upcomingReviews.map((item) => (
                          <button
                            key={item.id}
                            type="button"
                            className="flex w-full items-start gap-4 rounded-[22px] border border-transparent px-1 py-2 text-left transition hover:border-[#ece4d8] hover:bg-[#fcfaf7]"
                            onClick={() => {
                              setSelectedItemId(item.id)
                              setActiveView('reviews')
                            }}
                          >
                            <div className="min-w-[72px] rounded-[18px] bg-[#fbf3ef] px-3 py-3 text-center text-[#d2574b]">
                              <p className="text-[11px] font-semibold uppercase tracking-[0.18em]">Review</p>
                              <p className="mt-1 text-xl font-semibold">{item.reviewDateLabel}</p>
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="text-[1.02rem] font-semibold leading-7 text-[#132033]">{item.title}</p>
                                <p className="mt-1 text-sm text-[#6d6458]">
                                  {getOwnerDisplayName(item.ownerName)} / {item.reviewRhythm}
                                </p>
                            </div>
                            <div className="hidden text-right text-sm text-[#8b8174] xl:block">
                              <p>{item.teamLabel}</p>
                              <p className="mt-1">{item.sourceLabel}</p>
                            </div>
                          </button>
                        ))
                      )}
                    </div>
                  </section>

                  {showBoundedOverviewOnly ? null : (
                    <section className="rounded-[28px] border border-[#e4d9cb] bg-[#fcfaf7] px-7 py-7 shadow-[0_12px_36px_rgba(19,32,51,0.06)]">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#8d8377]">Bestuurlijke teruglezing</p>
                      <h2 className="mt-3 text-[1.45rem] font-semibold tracking-[-0.04em] text-[#132033]">
                        Wat is over deze zichtbare routes al bestuurlijk leesbaar?
                      </h2>
                      <p className="mt-4 text-sm leading-8 text-[#4f6175]">
                        {readOnly
                          ? 'Deze readback blijft bewust compact: hoeveel routes nog lopen, waar expliciete besluitmomenten zichtbaar zijn en waar vervolg over tijd al in beeld komt.'
                          : 'Deze readback blijft bewust compact: routebeeld, besluitspoor, reviewdruk en vervolg over tijd blijven in dezelfde Action Center-overview leesbaar.'}
                      </p>

                      <div className="mt-6 space-y-3">
                        <SignalRow label="Routebeeld" value={getWorkspaceRouteImageSummary(workspaceReadbackSummary)} />
                        <SignalRow label="Besluitspoor" value={getWorkspaceDecisionTrailSummary(workspaceReadbackSummary)} />
                        <SignalRow label="Vervolg over tijd" value={getWorkspaceContinuationSummary(workspaceReadbackSummary)} />
                        <SignalRow label="Reviewdruk" value={getWorkspaceReviewPressureSummary(workspaceReadbackSummary)} />
                      </div>

                      <Link
                        href={workbenchHref}
                        className="mt-6 inline-flex rounded-full border border-[#ded3c6] bg-white px-4 py-2 text-sm font-semibold text-[#1a2533] transition hover:border-[#1a2533]"
                      >
                        {workbenchLabel}
                      </Link>
                    </section>
                  )}
                </div>

                {showBoundedOverviewOnly ? null : (
                <section className="rounded-[28px] border border-[#e4d9cb] bg-white shadow-[0_12px_36px_rgba(19,32,51,0.06)]">
                  <div className="flex flex-col gap-4 border-b border-[#ece4d8] px-7 py-6 lg:flex-row lg:items-end lg:justify-between">
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#8d8377]">Eigenaarschap</p>
                      <h2 className="mt-2 text-[1.45rem] font-semibold tracking-[-0.04em] text-[#132033]">Managers en toewijzing</h2>
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="inline-flex min-h-11 rounded-full border border-[#ded3c6] bg-[#fcfaf7] px-4.5 py-2.5 text-sm font-semibold text-[#5f564a]">
                        {ownerCoverageCount} van {teamRows.length} teams expliciet gekoppeld
                      </span>
                      <button
                        type="button"
                        className="min-h-11 rounded-full border border-[#ded3c6] px-4.5 py-2.5 text-sm font-semibold text-[#1a2533] transition hover:border-[#1a2533]"
                        onClick={() => setActiveView('managers')}
                      >
                        Open managers
                      </button>
                    </div>
                  </div>

                  <div className="grid gap-6 px-7 py-6 xl:grid-cols-[minmax(0,1.45fr),minmax(320px,0.75fr)]">
                    <div className="overflow-hidden rounded-[22px] border border-[#ebe1d5]">
                      <div className="grid grid-cols-[minmax(0,1.7fr),minmax(0,1.35fr),96px,112px] gap-4 border-b border-[#ebe1d5] bg-[#faf6f0] px-5 py-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#8d8377]">
                        <span>Afdeling / team</span>
                        <span>Toegewezen manager</span>
                        <span>Mensen</span>
                        <span>Open</span>
                      </div>
                      {teamRows.slice(0, 5).map((team) => (
                        <div
                          key={team.id}
                          className="grid grid-cols-[minmax(0,1.7fr),minmax(0,1.35fr),96px,112px] gap-4 border-b border-[#f2eadf] px-5 py-4 text-sm text-[#132033] last:border-b-0"
                        >
                          <div>
                            <p className="font-semibold">{team.label}</p>
                            <p className="mt-1 text-[#7c7368]">Team</p>
                          </div>
                          <div>
                            <p className="font-semibold">{team.currentManagerName ?? 'Manager toewijzen'}</p>
                            <p className="mt-1 text-[#7c7368]">
                              {readOnly
                                ? team.currentManagerName
                                  ? 'Leest live mee vanuit het dossier'
                                  : 'Nog geen expliciete eigenaar in het dossier'
                                : team.currentManagerName
                                  ? 'Wijzigbaar in preview'
                                  : 'Valt terug op admin'}
                            </p>
                          </div>
                          <p>{team.peopleCount}</p>
                          <div>
                            <span className="inline-flex min-w-[46px] items-center justify-center rounded-full border border-[#eadfce] bg-[#fbf7f1] px-3 py-2 text-sm font-semibold">
                              {team.openActions}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="rounded-[28px] bg-[#182231] px-6 py-6 text-white shadow-[0_22px_54px_rgba(19,32,51,0.2)]">
                      <div className="flex items-center gap-4">
                        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white/8 text-xl font-semibold">
                          {getInitials(getTeamManagerDisplayName(selectedTeam?.currentManagerName ?? null))}
                        </div>
                        <div>
                          <p className="text-xl font-semibold">{getTeamManagerDisplayName(selectedTeam?.currentManagerName ?? null)}</p>
                          <p className="mt-1 text-sm text-white/58">Manager - {selectedTeam?.label ?? 'Adminroute'}</p>
                        </div>
                      </div>
                      <div className="mt-6 grid grid-cols-3 gap-4">
                        <DarkMetric label="Open" value={`${selectedTeam ? teamOpenItems.length : 0}`} accent="text-white" />
                        <DarkMetric label="Review <7d" value={`${selectedTeam?.reviewSoonCount ?? 0}`} accent="text-[#ffb16e]" />
                        <DarkMetric label="Geblokkeerd" value={`${selectedTeamItems.filter((item) => item.status === 'geblokkeerd').length}`} accent="text-white" />
                      </div>
                      <p className="mt-6 text-sm leading-7 text-white/72">
                        Deze managerrail blijft onderdeel van dezelfde omgeving. Action Center voelt als een echte module en blijft tegelijk dicht bij het onderliggende dossier.
                      </p>
                    </div>
                  </div>
                </section>
                )}
              </div>
            ) : null}

            {activeView === 'actions' ? (
              selectedItem ? (
                <div className="space-y-8">
                  <div className="flex flex-wrap items-center gap-3">
                    <button
                      type="button"
                      className="inline-flex min-h-11 items-center rounded-full border border-[#ded3c6] bg-[#fcfaf7] px-4.5 py-2.5 text-sm font-semibold text-[#1a2533] transition hover:border-[#1a2533]"
                      onClick={() => setActiveView('overview')}
                    >
                      Terug naar overzicht
                    </button>
                    {allowLocalDraftEditing ? (
                      <>
                        <button
                          type="button"
                          className="inline-flex min-h-11 items-center rounded-full border border-[#ded3c6] bg-[#fcfaf7] px-4.5 py-2.5 text-sm font-semibold text-[#1a2533] transition hover:border-[#1a2533]"
                          onClick={() => handleStatusChange(selectedItem.status === 'in-uitvoering' ? 'te-bespreken' : 'in-uitvoering')}
                        >
                          Status wijzigen
                        </button>
                        <button
                          type="button"
                          className="inline-flex min-h-11 items-center rounded-full bg-[#ff9b4a] px-4.5 py-2.5 text-sm font-semibold text-[#132033] transition hover:brightness-[0.98]"
                          onClick={() => handleReviewPlanChange(selectedItem.reviewDate ?? new Date().toISOString(), selectedItem.reviewRhythm)}
                        >
                          Review plannen
                        </button>
                      </>
                    ) : null}
                  </div>

                  <div className="grid gap-6 xl:grid-cols-[minmax(0,1.55fr),minmax(320px,0.82fr)]">
                    <section className="space-y-6">
                      <div className="rounded-[28px] border border-[#e4d9cb] bg-[#fcfaf7] px-7 py-7 shadow-[0_12px_36px_rgba(19,32,51,0.06)]">
                        <div className="flex flex-wrap items-center gap-3 text-sm text-[#736b60]">
                          <MiniTag>{selectedItem.sourceLabel}</MiniTag>
                          <PriorityInline priority={selectedItem.priority} />
                          <StatusPill status={selectedItem.status} />
                          <span className="ml-auto font-semibold text-[#5a7088]">{selectedItem.code}</span>
                        </div>
                        <h2 className="mt-5 text-[2rem] font-semibold tracking-[-0.05em] text-[#132033]">{selectedItem.title}</h2>
                        <p className="mt-4 max-w-3xl text-[1rem] leading-8 text-[#4f6175]">{selectedItem.summary}</p>
                        {selectedItemLineage.length > 0 ? (
                          <div className="mt-5 flex flex-wrap items-center gap-2.5">
                            {selectedItemLineage.map((entry) => {
                              const routeId = entry.routeId
                              const href = routeId ? (itemHrefs[routeId] ?? null) : null
                              const isFocusableInPreview = routeId ? previewRouteIds.has(routeId) : false
                              const className =
                                'inline-flex min-h-10 items-center rounded-full border border-[#ded3c6] bg-white px-4 py-2 text-sm font-semibold text-[#4a5f74] transition hover:border-[#1a2533] hover:text-[#132033]'

                              if (routeId && isFocusableInPreview) {
                                return (
                                  <button
                                    key={`${selectedItem.id}-${entry.key}`}
                                    type="button"
                                    className={className}
                                    aria-label={entry.label}
                                    onClick={() => focusActionRoute(routeId)}
                                  >
                                    <span>{entry.label}</span>
                                    {entry.routeTitle ? (
                                      <span className="ml-2 text-xs font-medium text-[#7d7368]">{entry.routeTitle}</span>
                                    ) : null}
                                  </button>
                                )
                              }

                              if (href) {
                                return (
                                  <Link key={`${selectedItem.id}-${entry.key}`} href={href} className={className} aria-label={entry.label}>
                                    <span>{entry.label}</span>
                                    {entry.routeTitle ? (
                                      <span className="ml-2 text-xs font-medium text-[#7d7368]">{entry.routeTitle}</span>
                                    ) : null}
                                  </Link>
                                )
                              }

                              return (
                                <span
                                  key={`${selectedItem.id}-${entry.key}`}
                                  className="inline-flex min-h-10 items-center rounded-full border border-[#e6ddd2] bg-[#f7f2ea] px-4 py-2 text-sm font-semibold text-[#7d7368]"
                                >
                                  <span>{entry.label}</span>
                                  {entry.routeTitle ? <span className="ml-2 text-xs font-medium">{entry.routeTitle}</span> : null}
                                </span>
                              )
                            })}
                          </div>
                        ) : null}

                        <div className="mt-7 grid gap-4 xl:grid-cols-3">
                          <RouteSummaryCard label="Route-read" value={selectedRouteSummary?.stateLabel ?? 'Nog geen route-read'} />
                          <RouteSummaryCard label="Vraagt nu" value={selectedRouteSummary?.routeAsk ?? 'Nog te bepalen'} />
                          <RouteSummaryCard label="Voortgang" value={selectedRouteSummary?.progressSummary ?? 'Nog geen voortgangssamenvatting'} />
                        </div>

                        <div className="mt-7 grid gap-4 lg:grid-cols-[minmax(0,1fr),minmax(0,0.92fr)]">
                          <div className="rounded-[24px] border border-[#eadfce] bg-white px-5 py-5">
                            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#8d8377]">Waarom dit nu speelt</p>
                            <p className="mt-4 text-[1.05rem] leading-8 text-[#132033]">
                              {selectedItem.coreSemantics.reviewSemantics.reviewReason}
                            </p>
                          </div>
                          <div className="rounded-[24px] border border-[#eadfce] bg-white px-5 py-5">
                            <div className="flex items-start justify-between gap-4">
                              <div>
                                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#8d8377]">Gekoppeld signaal</p>
                                <p className="mt-3 text-lg font-semibold tracking-[-0.02em] text-[#132033]">{selectedItem.signalLabel}</p>
                                <p className="mt-2 text-sm leading-7 text-[#4f6175]">{selectedItem.signalBody}</p>
                              </div>
                              <Link href={selectedItemHref} className="text-sm font-semibold text-[#5a7088] transition hover:text-[#132033]">
                                {workbenchLabel}
                              </Link>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="rounded-[28px] border border-[#e4d9cb] bg-white px-7 py-7 shadow-[0_12px_36px_rgba(19,32,51,0.06)]">
                        <div className="flex items-center justify-between gap-3 border-b border-[#ece4d8] pb-5">
                          <div>
                            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#8d8377]">Reviewlogboek</p>
                            <h3 className="mt-2 text-[1.35rem] font-semibold tracking-[-0.03em] text-[#132033]">Wat is al besproken of vastgelegd?</h3>
                          </div>
                          <p className="text-sm text-[#736b60]">Ritme: {selectedItem.reviewRhythm}</p>
                        </div>
                        <div className="mt-6 space-y-5">
                          {selectedItem.updates.length === 0 ? (
                            <EmptyBlock text="Nog geen updates toegevoegd in deze preview." />
                          ) : (
                            selectedItem.updates.map((update) => (
                              <div key={update.id} className="flex gap-4 rounded-[22px] border border-[#efe7dc] bg-[#fcfaf7] px-5 py-5">
                                <div className="mt-2 h-3 w-3 shrink-0 rounded-full bg-[#ff9b4a]" />
                                <div className="min-w-0">
                                  <p className="font-semibold text-[#132033]">
                                    {update.author}
                                    <span className="ml-3 font-normal text-[#7c7368]">{update.dateLabel}</span>
                                  </p>
                                  <p className="mt-2 text-sm leading-7 text-[#4f6175]">{update.note}</p>
                                </div>
                              </div>
                            ))
                          )}
                        </div>

                        {allowLocalDraftEditing ? (
                          <div className="mt-8 border-t border-[#efe7dc] pt-6">
                            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#8d8377]">Update toevoegen</p>
                            <textarea
                              value={updateDraft}
                              onChange={(event) => setUpdateDraft(event.target.value)}
                              placeholder="Korte voortgang of besluit..."
                              className="mt-4 min-h-[138px] w-full rounded-[22px] border border-[#ddd3c7] bg-[#fbf8f4] px-4 py-4 text-sm leading-7 text-[#132033] outline-none transition focus:border-[#ff9b4a]"
                            />
                            <button
                              type="button"
                              className="mt-4 inline-flex min-h-11 rounded-full bg-[#ff9b4a] px-4.5 py-2.5 text-sm font-semibold text-[#132033] transition hover:brightness-[0.98]"
                              onClick={handleAddUpdate}
                            >
                              Update opslaan
                            </button>
                          </div>
                        ) : null}
                      </div>
                    </section>

                    <section className="space-y-6">
                      <div className="rounded-[30px] bg-[#182231] px-7 py-7 text-white shadow-[0_22px_56px_rgba(19,32,51,0.18)]">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/45">Behandelroute</p>
                        <div className="mt-5 flex items-center gap-4">
                          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white/8 text-xl font-semibold">
                            {getInitials(getOwnerDisplayName(selectedItem.ownerName))}
                          </div>
                          <div>
                            <p className="text-[1.45rem] font-semibold tracking-[-0.03em]">
                              {getOwnerDisplayName(selectedItem.ownerName)}
                            </p>
                            <p className="mt-1 text-sm text-white/58">{selectedItem.ownerRole}</p>
                          </div>
                        </div>

                        <div className="mt-6 grid grid-cols-3 gap-4">
                          <DarkMetric label="Mensen" value={`${selectedItem.peopleCount}`} accent="text-white" />
                          <DarkMetric label="Review" value={selectedItem.reviewDateLabel} accent="text-[#ffb16e]" />
                          <DarkMetric label="Prioriteit" value={getPriorityMeta(selectedItem.priority).label} accent="text-white" />
                        </div>

                        <div className="mt-6 space-y-5">
                          <div>
                            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/48">Beslissing</p>
                            {selectedItem.coreSemantics.latestDecision ? (
                              <div className="mt-3 grid gap-3 md:grid-cols-3">
                                <DecisionOutcomeCard decision={selectedItem.coreSemantics.latestDecision.decision} />
                                {selectedItem.coreSemantics.latestDecision.decisionReason ? (
                                  <RouteFieldCard
                                    label="Waarom dit besluit"
                                    value={selectedItem.coreSemantics.latestDecision.decisionReason}
                                  />
                                ) : null}
                                {selectedItem.coreSemantics.latestDecision.nextCheck ? (
                                  <RouteFieldCard
                                    label="Volgende toets"
                                    value={selectedItem.coreSemantics.latestDecision.nextCheck}
                                  />
                                ) : null}
                              </div>
                            ) : (
                              <div className="mt-3">
                                <EmptyBlock
                                  text={
                                    isClosedRouteStatus(selectedItem.status)
                                      ? 'Deze route is al historisch gesloten; een aparte laatste reviewbeslissing hoeft hier niet meer zichtbaar te zijn.'
                                      : 'Nog geen expliciete reviewbeslissing vastgelegd in deze route.'
                                  }
                                />
                              </div>
                            )}
                          </div>

                          <div>
                            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/48">Actievoortgang</p>
                            <div className="mt-3 grid gap-3 md:grid-cols-3">
                              {selectedItem.coreSemantics.actionProgress.currentStep ? (
                                <RouteFieldCard
                                  label="Huidige stap"
                                  value={selectedItem.coreSemantics.actionProgress.currentStep}
                                />
                              ) : null}
                              {selectedItem.coreSemantics.actionProgress.nextStep ? (
                                <RouteFieldCard
                                  label="Hierna"
                                  value={selectedItem.coreSemantics.actionProgress.nextStep}
                                />
                              ) : null}
                              {selectedItem.coreSemantics.actionProgress.expectedEffect ? (
                                <RouteFieldCard
                                  label="Verwacht effect"
                                  value={selectedItem.coreSemantics.actionProgress.expectedEffect}
                                />
                              ) : null}
                            </div>
                          </div>

                          <div>
                            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/48">Resultaatlus</p>
                            <div className="mt-3 grid gap-3 md:grid-cols-3">
                              {selectedItem.coreSemantics.resultLoop.whatWasTried ? (
                                <RouteFieldCard
                                  label="Wat is geprobeerd"
                                  value={selectedItem.coreSemantics.resultLoop.whatWasTried}
                                />
                              ) : null}
                              {selectedItem.coreSemantics.resultLoop.whatWeObserved ? (
                                <RouteFieldCard
                                  label="Wat zagen we terug"
                                  value={selectedItem.coreSemantics.resultLoop.whatWeObserved}
                                />
                              ) : null}
                              {selectedItem.coreSemantics.resultLoop.whatWasDecided ? (
                                <RouteFieldCard
                                  label="Wat is besloten"
                                  value={selectedItem.coreSemantics.resultLoop.whatWasDecided}
                                />
                              ) : null}
                            </div>
                          </div>

                          <div>
                            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/48">Resultaat over tijd</p>
                            <div className="mt-3 space-y-3">
                              {selectedItem.coreSemantics.resultProgression.length === 0 ? (
                                <EmptyBlock
                                  text={
                                    isClosedRouteStatus(selectedItem.status)
                                      ? 'Deze route is gesloten zonder extra resultaatmomenten in deze surfacelaag.'
                                      : 'Nog geen opeenvolgende resultaatmomenten zichtbaar in deze route.'
                                  }
                                />
                              ) : (
                                selectedItem.coreSemantics.resultProgression.map((entry) => (
                                  <ResultProgressionEntry key={entry.resultEntryId} entry={entry} />
                                ))
                              )}
                            </div>
                          </div>

                          <div>
                            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/48">Beslisgeschiedenis</p>
                            <div className="mt-3 space-y-3">
                              {selectedItem.coreSemantics.decisionHistory.length === 0 ? (
                                <EmptyBlock
                                  text={
                                    isClosedRouteStatus(selectedItem.status)
                                      ? 'Deze route is gesloten zonder extra beslisgeschiedenis in deze surfacelaag.'
                                      : 'Nog geen expliciete beslismomenten zichtbaar in deze route.'
                                  }
                                />
                              ) : (
                                selectedItem.coreSemantics.decisionHistory.map((entry) => (
                                  <DecisionHistoryEntry key={entry.decisionEntryId} entry={entry} />
                                ))
                              )}
                            </div>
                          </div>
                        </div>

                        {hasClosingPanel && closing ? (
                          <div className="mt-5 rounded-[18px] border border-white/10 bg-white/[0.04] px-4 py-4">
                            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/48">Afronding</p>
                            <p className="mt-2 text-sm font-semibold text-white/86">
                              {closing.status === 'lopend'
                                ? 'Eerder afgerond in deze route'
                                : closing.status === 'afgerond'
                                  ? 'Afgerond voor nu'
                                  : 'Bewust gestopt'}
                            </p>
                            <p className="mt-2 text-sm leading-7 text-white/72">
                              {closing.historicalSummary ??
                                closing.summary ??
                                'Deze route draagt een expliciet afsluitsignaal.'}
                            </p>
                          </div>
                        ) : null}

                        <div className="mt-5 space-y-3">
                          {selectedItem.openSignals.map((signal) => (
                            <div key={signal} className="rounded-[18px] border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white/82">
                              {signal.replace(/_/g, ' ')}
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="rounded-[24px] border border-[#e4d9cb] bg-white px-6 py-6 shadow-[0_12px_36px_rgba(19,32,51,0.06)]">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#8d8377]">Eigenaarschap en context</p>
                        <dl className="mt-5 grid grid-cols-[minmax(0,1fr),minmax(0,1fr)] gap-y-4 text-sm">
                          <LabelValue label="Afdeling" value={selectedItem.teamLabel} />
                          <LabelValue label="Bron" value={selectedItem.sourceLabel} />
                          <LabelValue label="Streefdatum" value={selectedItem.reviewDateLabel} />
                          <LabelValue label="Volgende review" value={formatLongDate(selectedItem.reviewDate)} />
                          <LabelValue label="Reviewritme" value={selectedItem.reviewRhythm} />
                          <LabelValue label="Review-eigenaar" value={getReviewOwnerDisplayName(selectedItem.reviewOwnerName)} />
                        </dl>
                      </div>

                      {canRenderRouteCloseout ? (
                        <div className="rounded-[24px] border border-[#e4d9cb] bg-white px-6 py-6 shadow-[0_12px_36px_rgba(19,32,51,0.06)]">
                          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#8d8377]">
                            Klaar voor closeout
                          </p>
                          <h3 className="mt-3 text-[1.35rem] font-semibold tracking-[-0.03em] text-[#132033]">
                            Route afsluiten
                          </h3>
                          <p className="mt-3 text-sm leading-7 text-[#4f6175]">
                            Gebruik deze stap als HR of Verisight wanneer deze route bestuurlijk dicht kan, zonder de historische lezing te verliezen.
                          </p>

                          {routeCloseoutPanelOpen ? (
                            <div className="mt-5 space-y-4">
                              <div className="grid gap-4 md:grid-cols-2">
                                <FormField label="Afsluitstatus">
                                  <select
                                    value={routeCloseoutForm.closeoutStatus}
                                    onChange={(event) =>
                                      setRouteCloseoutForm((current) => ({
                                        ...current,
                                        closeoutStatus: event.target.value as ActionCenterRouteCloseoutStatus,
                                      }))
                                    }
                                    disabled={routeCloseoutPending}
                                    className="w-full rounded-2xl border border-[#ddd3c7] bg-[#fbf8f4] px-4 py-3 text-sm text-[#132033] outline-none transition focus:border-[#ff9b4a]"
                                  >
                                    {ROUTE_CLOSEOUT_STATUS_OPTIONS.map((option) => (
                                      <option key={option} value={option}>
                                        {getRouteCloseoutStatusLabel(option)}
                                      </option>
                                    ))}
                                  </select>
                                </FormField>

                                <FormField label="Afsluitreden">
                                  <select
                                    value={routeCloseoutForm.closeoutReason}
                                    onChange={(event) =>
                                      setRouteCloseoutForm((current) => ({
                                        ...current,
                                        closeoutReason: event.target.value as ActionCenterRouteCloseoutReason,
                                      }))
                                    }
                                    disabled={routeCloseoutPending}
                                    className="w-full rounded-2xl border border-[#ddd3c7] bg-[#fbf8f4] px-4 py-3 text-sm text-[#132033] outline-none transition focus:border-[#ff9b4a]"
                                  >
                                    {ROUTE_CLOSEOUT_REASON_OPTIONS.map((option) => (
                                      <option key={option} value={option}>
                                        {getRouteCloseoutReasonLabel(option)}
                                      </option>
                                    ))}
                                  </select>
                                </FormField>
                              </div>

                              <FormField label="Toelichting">
                                <textarea
                                  value={routeCloseoutForm.closeoutNote}
                                  onChange={(event) =>
                                    setRouteCloseoutForm((current) => ({
                                      ...current,
                                      closeoutNote: event.target.value,
                                    }))
                                  }
                                  rows={4}
                                  disabled={routeCloseoutPending}
                                  className="w-full rounded-2xl border border-[#ddd3c7] bg-[#fbf8f4] px-4 py-3 text-sm leading-7 text-[#132033] outline-none transition focus:border-[#ff9b4a]"
                                />
                              </FormField>

                              {routeCloseoutError ? (
                                <p className="rounded-[18px] border border-[#f0d9d4] bg-[#fff1ef] px-4 py-3 text-sm text-[#b5544c]">
                                  {routeCloseoutError}
                                </p>
                              ) : null}

                              <div className="flex flex-wrap items-center justify-end gap-3">
                                <button
                                  type="button"
                                  className="rounded-full border border-[#ded3c6] px-4 py-2 text-sm font-semibold text-[#4f6175]"
                                  disabled={routeCloseoutPending}
                                  onClick={() => setRouteCloseoutPanelOpen(false)}
                                >
                                  Annuleren
                                </button>
                                <button
                                  type="button"
                                  className="rounded-full bg-[#1a2533] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#223247]"
                                  disabled={routeCloseoutPending}
                                  onClick={() => void handleRouteCloseoutSave()}
                                >
                                  {routeCloseoutPending ? 'Opslaan...' : 'Closeout opslaan'}
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
                              <p className="text-sm leading-7 text-[#4f6175]">
                                Deze route is nog open. Sluit hem expliciet zodra opvolging voor nu echt rond is.
                              </p>
                              <button
                                type="button"
                                className="rounded-full border border-[#ded3c6] bg-[#fcfaf7] px-4 py-2 text-sm font-semibold text-[#1a2533] transition hover:border-[#1a2533]"
                                onClick={() => setRouteCloseoutPanelOpen(true)}
                              >
                                Route afsluiten
                              </button>
                            </div>
                          )}
                        </div>
                      ) : null}

                      {selectedItem && isClosedRouteStatus(selectedItem.status) ? (
                        <div className="rounded-[24px] border border-[#e4d9cb] bg-white px-6 py-6 shadow-[0_12px_36px_rgba(19,32,51,0.06)]">
                          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#8d8377]">
                            Route afgesloten
                          </p>
                          <p className="mt-3 text-lg font-semibold tracking-[-0.02em] text-[#132033]">
                            {selectedItem.coreSemantics.routeCloseout.closeoutStatus
                              ? getRouteCloseoutStatusLabel(selectedItem.coreSemantics.routeCloseout.closeoutStatus)
                              : getHistoricalRouteLabel(selectedItem)}
                          </p>
                          {selectedItem.coreSemantics.routeCloseout.closeoutReason ? (
                            <p className="mt-3 text-sm font-semibold text-[#4f6175]">
                              {getRouteCloseoutReasonLabel(selectedItem.coreSemantics.routeCloseout.closeoutReason)}
                            </p>
                          ) : null}
                          <p className="mt-3 text-sm leading-7 text-[#4f6175]">
                            {selectedItem.coreSemantics.routeCloseout.closeoutNote ??
                              selectedItem.coreSemantics.closingSemantics.summary ??
                              'Deze route blijft alleen nog als historische context zichtbaar.'}
                          </p>
                        </div>
                      ) : null}

                      {canShowFollowUpRouteAffordance ? (
                        <div className="rounded-[24px] border border-[#e4d9cb] bg-white px-6 py-6 shadow-[0_12px_36px_rgba(19,32,51,0.06)]">
                          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#8d8377]">
                            Vervolgroute
                          </p>
                          <h3 className="mt-3 text-[1.35rem] font-semibold tracking-[-0.03em] text-[#132033]">
                            Start vervolgroute
                          </h3>
                          <p className="mt-3 text-sm leading-7 text-[#4f6175]">
                            Open vanuit deze gesloten route een nieuwe HR-handoff binnen dezelfde afdeling.
                          </p>

                          <div className="mt-5 space-y-5">
                            <FormField label="Kies manager">
                              <select
                                name="follow-up-manager"
                                value={followUpForm.managerUserId}
                                onChange={(event) =>
                                  setFollowUpForm((current) => ({
                                    ...current,
                                    managerUserId: event.target.value,
                                  }))
                                }
                                disabled={followUpPending}
                                className="w-full rounded-2xl border border-[#ddd3c7] bg-[#fbf8f4] px-4 py-3 text-sm text-[#132033] outline-none transition focus:border-[#ff9b4a]"
                              >
                                <option value="">Kies manager</option>
                                {assignmentOptions.map((option) => (
                                  <option key={`follow-up-${option.value}`} value={option.value}>
                                    {option.label}
                                  </option>
                                ))}
                              </select>
                            </FormField>

                            <FormField label="Kies aanleiding">
                              <div className="space-y-3">
                                {FOLLOW_UP_TRIGGER_REASON_OPTIONS.map((option) => (
                                  <label
                                    key={option}
                                    className="flex items-start gap-3 rounded-2xl border border-[#e4d9cb] bg-[#fcfaf7] px-4 py-3 text-sm text-[#132033]"
                                  >
                                    <input
                                      type="radio"
                                      name="follow-up-trigger-reason"
                                      value={option}
                                      checked={followUpForm.triggerReason === option}
                                      onChange={() =>
                                        setFollowUpForm((current) => ({
                                          ...current,
                                          triggerReason: option,
                                        }))
                                      }
                                      disabled={followUpPending}
                                      className="mt-1 h-4 w-4 border-[#c9bcad] text-[#ff9b4a] focus:ring-[#ff9b4a]"
                                    />
                                    <span>{getActionCenterFollowUpTriggerReasonLabel(option)}</span>
                                  </label>
                                ))}
                              </div>
                            </FormField>

                            {followUpError ? (
                              <p className="rounded-2xl border border-[#f0d9d4] bg-[#fff1ef] px-4 py-3 text-sm text-[#b24a43]">
                                {followUpError}
                              </p>
                            ) : null}

                            <button
                              type="button"
                              className="inline-flex min-h-11 items-center rounded-full bg-[#ff9b4a] px-4.5 py-2.5 text-sm font-semibold text-[#132033] transition hover:brightness-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
                              disabled={followUpPending}
                              onClick={() => void handleFollowUpRouteStart()}
                            >
                              {followUpPending ? 'Vervolgroute starten...' : 'Start vervolgroute'}
                            </button>
                          </div>
                        </div>
                      ) : canRenderFollowUpRoute && followUpRouteBlockMessage ? (
                        <div className="rounded-[24px] border border-[#e4d9cb] bg-[#fcfaf7] px-6 py-6 shadow-[0_12px_36px_rgba(19,32,51,0.06)]">
                          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#8d8377]">
                            Vervolgroute
                          </p>
                          <p className="mt-3 text-sm leading-7 text-[#4f6175]">{followUpRouteBlockMessage}</p>
                        </div>
                      ) : null}

                      {supportsManagerResponseFlow(selectedItem) ? (
                        <div className="rounded-[24px] border border-[#e4d9cb] bg-white px-6 py-6 shadow-[0_12px_36px_rgba(19,32,51,0.06)]">
                          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#8d8377]">
                            {managerActionSurfaceCopy.eyebrow}
                          </p>
                          <h3 className="mt-3 text-[1.35rem] font-semibold tracking-[-0.03em] text-[#132033]">
                            {managerActionSurfaceCopy.title}
                          </h3>
                          <p className="mt-3 text-sm leading-7 text-[#4f6175]">
                            {managerActionSurfaceCopy.description}
                          </p>

                          {canUseManagerResponseFlow ? (
                            <div className="mt-5 space-y-5">
                              <FormField label="Hoe pak je deze route als eerste op?">
                                <div className="grid gap-3 sm:grid-cols-2">
                                  {(['confirm', 'sharpen', 'schedule', 'watch'] as ActionCenterManagerResponseType[]).map((option) => (
                                    <button
                                      key={option}
                                      type="button"
                                      className={`rounded-2xl border px-4 py-3 text-left text-sm font-semibold transition ${
                                        managerResponseForm.responseType === option
                                          ? 'border-[#ff9b4a] bg-[#fff3e8] text-[#132033]'
                                          : 'border-[#ddd3c7] bg-[#fbf8f4] text-[#5f564a]'
                                      }`}
                                      onClick={() =>
                                        setManagerResponseForm((current) => ({
                                          ...current,
                                          responseType: option,
                                        }))
                                      }
                                    >
                                      {getActionCenterManagerResponseLabel(option)}
                                    </button>
                                  ))}
                                </div>
                              </FormField>

                              <FormField label="Wat leg je nu klein en reviewbaar vast?">
                                <textarea
                                  value={managerResponseForm.responseNote}
                                  onChange={(event) =>
                                    setManagerResponseForm((current) => ({
                                      ...current,
                                      responseNote: event.target.value,
                                    }))
                                  }
                                  placeholder="Bijv. eerst bespreken in het weekoverleg, of gericht vastleggen wat de eerstvolgende lokale stap moet zijn."
                                  className="min-h-[110px] w-full rounded-2xl border border-[#ddd3c7] bg-[#fbf8f4] px-4 py-3 text-sm leading-7 text-[#132033] outline-none transition focus:border-[#ff9b4a]"
                                />
                              </FormField>

                              <FormField label="Wanneer toetsen we deze eerste stap?">
                                <input
                                  type="date"
                                  value={managerResponseForm.reviewScheduledFor}
                                  onChange={(event) =>
                                    setManagerResponseForm((current) => ({
                                      ...current,
                                      reviewScheduledFor: event.target.value,
                                    }))
                                  }
                                  className="w-full rounded-2xl border border-[#ddd3c7] bg-[#fbf8f4] px-4 py-3 text-sm text-[#132033] outline-none transition focus:border-[#ff9b4a]"
                                />
                              </FormField>

                              <label className="flex items-start gap-3 rounded-[18px] border border-[#ece4d8] bg-[#fcfaf7] px-4 py-4 text-sm text-[#42556b]">
                                <input
                                  type="checkbox"
                                  checked={managerResponseForm.includePrimaryAction}
                                  onChange={(event) =>
                                    setManagerResponseForm((current) => ({
                                      ...current,
                                      includePrimaryAction: event.target.checked,
                                    }))
                                  }
                                  className="mt-1 h-4 w-4 rounded border-[#d6cbbb] text-[#132033]"
                                />
                                <span className="leading-7">
                                  {managerActionSurfaceCopy.primaryActionToggle}
                                </span>
                              </label>

                              {managerResponseForm.includePrimaryAction ? (
                                <div className="space-y-4 rounded-[20px] border border-[#ece4d8] bg-[#fcfaf7] px-4 py-4">
                                  <p className="text-sm leading-7 text-[#4f6175]">
                                    Deze extra stap maakt de route concreter, maar houdt de uitvoering nog steeds klein totdat aparte actiekaarten echt helpen.
                                  </p>

                                  <FormField label="Thema van deze eerste concrete stap">
                                    <select
                                      value={managerResponseForm.primaryActionThemeKey}
                                      onChange={(event) =>
                                        setManagerResponseForm((current) => ({
                                          ...current,
                                          primaryActionThemeKey: event.target.value as ActionCenterManagerActionThemeKey | '',
                                        }))
                                      }
                                      className="w-full rounded-2xl border border-[#ddd3c7] bg-white px-4 py-3 text-sm text-[#132033] outline-none transition focus:border-[#ff9b4a]"
                                    >
                                      <option value="">Kies productthema</option>
                                      {ACTION_CENTER_MANAGER_RESPONSE_THEME_OPTIONS.map((option) => (
                                        <option key={option.value} value={option.value}>
                                          {option.label}
                                        </option>
                                      ))}
                                    </select>
                                  </FormField>

                                  <FormField label="Wat is die eerste concrete stap?">
                                    <textarea
                                      value={managerResponseForm.primaryActionText}
                                      onChange={(event) =>
                                        setManagerResponseForm((current) => ({
                                          ...current,
                                          primaryActionText: event.target.value,
                                        }))
                                      }
                                      placeholder="Bijv. plan deze week een kort teamgesprek over feedbackritme en spreek daar één vaste terugkoppeling af."
                                      className="min-h-[105px] w-full rounded-2xl border border-[#ddd3c7] bg-white px-4 py-3 text-sm leading-7 text-[#132033] outline-none transition focus:border-[#ff9b4a]"
                                    />
                                  </FormField>

                                  <FormField label="Wat moet deze stap zichtbaar maken?">
                                    <textarea
                                      value={managerResponseForm.primaryActionExpectedEffect}
                                      onChange={(event) =>
                                        setManagerResponseForm((current) => ({
                                          ...current,
                                          primaryActionExpectedEffect: event.target.value,
                                        }))
                                      }
                                      placeholder="Bijv. binnen twee weken moet duidelijk worden of feedbackafspraken consistenter terugkomen in het team."
                                      className="min-h-[105px] w-full rounded-2xl border border-[#ddd3c7] bg-white px-4 py-3 text-sm leading-7 text-[#132033] outline-none transition focus:border-[#ff9b4a]"
                                    />
                                  </FormField>
                                </div>
                              ) : null}

                              {managerResponseError ? (
                                <div className="rounded-[18px] border border-[#f3c0bc] bg-[#fff1ef] px-4 py-4 text-sm leading-7 text-[#9c3f36]">
                                  {managerResponseError}
                                </div>
                              ) : null}

                              <button
                                type="button"
                                className="inline-flex min-h-11 items-center rounded-full bg-[#ff9b4a] px-4.5 py-2.5 text-sm font-semibold text-[#132033] transition hover:brightness-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
                                disabled={managerResponsePending}
                                onClick={() => void handleManagerResponseSave()}
                              >
                                {managerResponsePending ? 'Opslaan...' : managerActionSurfaceCopy.saveLabel}
                              </button>
                            </div>
                          ) : selectedItem.managerResponse ? (
                            <div className="mt-5 space-y-3">
                              <SummaryRow
                                label="Managerstap"
                                value={getActionCenterManagerResponseLabel(selectedItem.managerResponse.response_type)}
                              />
                              <SummaryRow
                                label="Reviewmoment"
                                value={formatLongDate(selectedItem.managerResponse.review_scheduled_for)}
                              />
                              <SignalRow label="Bounded stap" value={selectedItem.managerResponse.response_note} />
                              {selectedItem.managerResponse.primary_action_theme_key ? (
                                <SignalRow
                                  label="Thema"
                                  value={
                                    ACTION_CENTER_MANAGER_RESPONSE_THEME_OPTIONS.find(
                                      (option) => option.value === selectedItem.managerResponse?.primary_action_theme_key,
                                    )?.label ?? selectedItem.managerResponse.primary_action_theme_key
                                  }
                                />
                              ) : null}
                              {selectedItem.managerResponse.primary_action_text ? (
                                <SignalRow
                                  label="Primaire stap"
                                  value={selectedItem.managerResponse.primary_action_text}
                                />
                              ) : null}
                              {selectedItem.managerResponse.primary_action_expected_effect ? (
                                <SignalRow
                                  label="Zichtbaar effect"
                                  value={selectedItem.managerResponse.primary_action_expected_effect}
                                />
                              ) : null}
                              {managerActionSurfaceCopy.readOnlyHint ? (
                                <p className="rounded-[18px] border border-[#ece4d8] bg-[#fcfaf7] px-4 py-4 text-sm leading-7 text-[#4f6175]">
                                  {managerActionSurfaceCopy.readOnlyHint}
                                </p>
                              ) : null}
                            </div>
                          ) : (
                            <div className="mt-5">
                              <EmptyBlock text={managerActionSurfaceCopy.emptyText} />
                            </div>
                          )}
                        </div>
                      ) : null}

                      <div className="rounded-[24px] border border-[#e4d9cb] bg-[#fcfaf7] px-6 py-6 shadow-[0_12px_36px_rgba(19,32,51,0.06)]">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#8d8377]">Bespreekvoorbereiding</p>
                        <p className="mt-3 text-sm leading-8 text-[#4f6175]">
                          Sluit aan bij het overleg van <span className="font-semibold text-[#132033]">{selectedItem.reviewDateLabel}</span>.
                          Neem de laatste update, open signalen en de eerstvolgende stap mee.
                        </p>
                        <Link
                          href={selectedItemHref}
                          className="mt-5 inline-flex min-h-11 rounded-full border border-[#ded3c6] bg-white px-4.5 py-2.5 text-sm font-semibold text-[#1a2533] transition hover:border-[#1a2533]"
                        >
                          {workbenchLabel}
                        </Link>
                      </div>

                      {allowLocalDraftEditing ? (
                        <div className="rounded-[24px] border border-[#e4d9cb] bg-white px-6 py-6 shadow-[0_12px_36px_rgba(19,32,51,0.06)]">
                          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#8d8377]">Review plannen</p>
                          <div className="mt-4 grid gap-4">
                            <input
                              type="date"
                              value={selectedItem.reviewDate ? selectedItem.reviewDate.slice(0, 10) : ''}
                              onChange={(event) => handleReviewPlanChange(event.target.value, selectedItem.reviewRhythm)}
                              className="rounded-2xl border border-[#ddd3c7] bg-[#fbf8f4] px-4 py-3 text-sm text-[#132033] outline-none transition focus:border-[#ff9b4a]"
                            />
                            <div className="grid grid-cols-2 gap-3">
                              {REVIEW_RHYTHM_OPTIONS.map((option) => (
                                <button
                                  key={option}
                                  type="button"
                                  className={`rounded-2xl border px-4 py-3 text-sm font-semibold transition ${
                                    option === selectedItem.reviewRhythm
                                      ? 'border-[#ff9b4a] bg-[#fff3e8] text-[#132033]'
                                      : 'border-[#ddd3c7] bg-[#fbf8f4] text-[#5f564a]'
                                  }`}
                                  onClick={() => handleReviewPlanChange(selectedItem.reviewDate ?? '', option)}
                                >
                                  {option}
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>
                      ) : null}
                    </section>
                  </div>
                </div>
              ) : (
                <EmptySection
                  title="Nog geen acties beschikbaar"
                  body="Zodra er routes live staan, verschijnt hier automatisch de eerstvolgende managerstap, begrensde reactie of actiekaart."
                />
              )
            ) : null}

            {activeView === 'reviews' ? (
              <div className="space-y-8">
                <section className="rounded-[28px] border border-[#e4d9cb] bg-[#fcfaf7] px-7 py-7 shadow-[0_12px_36px_rgba(19,32,51,0.06)]">
                  <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
                    <div className="max-w-2xl">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#8d8377]">Reviewritme</p>
                      <h2 className="mt-3 text-[1.9rem] font-semibold tracking-[-0.05em] text-[#132033]">Welke gesprekken komen wanneer terug?</h2>
                      <p className="mt-4 text-[1rem] leading-8 text-[#4f6175]">
                        Deze view maakt het reviewritme rustiger leesbaar: eerst wat over tijd is, daarna wat deze en volgende week opnieuw bestuurd moet worden.
                      </p>
                    </div>
                    <div className="grid gap-3 sm:grid-cols-4">
                      <ReviewWindowStat label="Achterstallig" value={`${overdueReviews.length}`} tone="red" />
                      <ReviewWindowStat label="Deze week" value={`${thisWeekReviews.length}`} tone="amber" />
                      <ReviewWindowStat label="Volgende week" value={`${nextWeekReviews.length}`} tone="slate" />
                      <ReviewWindowStat label="Kwartaal" value={`${quarterReviews.length}`} tone="slate" />
                    </div>
                  </div>
                </section>

                <div className="grid gap-6 xl:grid-cols-[minmax(0,1.45fr),minmax(320px,0.82fr)]">
                  <section className="space-y-6">
                    <ReviewLane
                      title="Achterstallig"
                      items={overdueReviews}
                      emptyText="In deze selectie staan nu geen achterstallige reviews meer open."
                      onOpen={(item) => {
                        setSelectedItemId(item.id)
                        setActiveView('actions')
                      }}
                    />
                    <ReviewLane
                      title="Deze week"
                      items={thisWeekReviews}
                      emptyText="Voor deze week staat nu geen nieuw reviewgesprek meer open."
                      onOpen={(item) => {
                        setSelectedItemId(item.id)
                        setActiveView('actions')
                      }}
                    />
                    <ReviewLane
                      title="Volgende week"
                      items={nextWeekReviews}
                      emptyText="Voor volgende week is nog geen nieuw reviewgesprek ingepland."
                      onOpen={(item) => {
                        setSelectedItemId(item.id)
                        setActiveView('actions')
                      }}
                    />
                  </section>

                  <section className="space-y-6">
                    <div className="rounded-[30px] bg-[#182231] px-7 py-7 text-white shadow-[0_22px_56px_rgba(19,32,51,0.18)]">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/45">Reviewfocus</p>
                      <h2 className="mt-3 text-[1.7rem] font-semibold tracking-[-0.04em]">
                        {upcomingReviews[0]?.title ?? 'Nog geen reviewmoment zichtbaar'}
                      </h2>
                      <p className="mt-4 text-[0.98rem] leading-8 text-white/72">
                        {upcomingReviews[0]
                          ? `Het eerstvolgende gesprek valt op ${upcomingReviews[0].reviewDateLabel} en blijft gekoppeld aan hetzelfde dossier en dezelfde eigenaar.`
                          : 'Deze selectie heeft nu geen open reviewvenster. Zodra een route een nieuwe hercheck vraagt, verschijnt het eerstvolgende gesprek hier automatisch.'}
                      </p>

                      <div className="mt-6 space-y-4 border-t border-white/10 pt-6">
                        <FocusSummaryRow label="Eerstvolgend" value={earliestReview} />
                        <FocusSummaryRow label="Review < 14 dagen" value={`${overdueReviews.length + thisWeekReviews.length + nextWeekReviews.length}`} />
                        <FocusSummaryRow label="Komend kwartaal" value={`${quarterReviews.length}`} />
                        <FocusSummaryRow
                          label="Zonder eigenaar"
                          value={missingManagerCount > 0 ? `${missingManagerCount} team${missingManagerCount === 1 ? '' : 's'}` : 'Geen'}
                        />
                      </div>

                      <button
                        type="button"
                        className="mt-6 inline-flex min-h-11 rounded-full bg-[#ff9b4a] px-4.5 py-2.5 text-sm font-semibold text-[#132033] transition hover:brightness-[0.98]"
                        onClick={() => {
                          if (upcomingReviews[0]) {
                            setSelectedItemId(upcomingReviews[0].id)
                            setActiveView('actions')
                          }
                        }}
                      >
                        Open eerstvolgende review
                      </button>
                    </div>

                    <div className="rounded-[24px] border border-[#e4d9cb] bg-white px-6 py-6 shadow-[0_12px_36px_rgba(19,32,51,0.06)]">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#8d8377]">Reviewvenster</p>
                      <div className="mt-5 space-y-4">
                        <SummaryRow label="Achterstallig voor vandaag" value={`${overdueReviews.length}`} />
                        <SummaryRow label="Te bespreken deze week" value={`${thisWeekReviews.length}`} />
                        <SummaryRow label="Al ingepland volgende week" value={`${nextWeekReviews.length}`} />
                        <SummaryRow label="Later in het kwartaal" value={`${quarterReviews.length}`} />
                      </div>
                      <p className="mt-5 text-sm leading-7 text-[#4f6175]">
                        Reviews blijven hier bewust gekoppeld aan echte follow-through. Dat kan een primaire stap zijn, maar ook een begrensde reactie of geplande hercheck.
                      </p>
                    </div>
                  </section>
                </div>
              </div>
            ) : null}

            {activeView === 'managers' ? (
              <div className="space-y-8">
                <section className="rounded-[28px] border border-[#e4d9cb] bg-[#fcfaf7] px-7 py-7 shadow-[0_12px_36px_rgba(19,32,51,0.06)]">
                  <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
                    <div className="max-w-2xl">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#8d8377]">Eigenaarschap</p>
                      <h2 className="mt-3 text-[1.9rem] font-semibold tracking-[-0.05em] text-[#132033]">Waar eigenaarschap expliciet moet landen</h2>
                      <p className="mt-4 text-[1rem] leading-8 text-[#4f6175]">
                        Deze subview houdt manager-toewijzing rustig en controleerbaar. We tonen alleen echte teamcontext en echte managers.
                      </p>
                    </div>
                    <div className="grid gap-3 sm:grid-cols-3">
                      <OverviewStat label="Toegewezen" value={`${ownerCoverageCount}`} detail={`van ${teamRows.length} teams expliciet gekoppeld`} accent="teal" />
                      <OverviewStat
                        label="Zonder eigenaar"
                        value={`${missingManagerCount}`}
                        detail={missingManagerCount > 0 ? 'vragen nog een manager' : 'geen open gaten zichtbaar'}
                        accent="red"
                      />
                      <OverviewStat
                        label="Gemiddeld open"
                        value={
                          teamRows.length > 0
                            ? (teamRows.reduce((sum, team) => sum + team.openActions, 0) / teamRows.length).toFixed(1)
                            : '0.0'
                        }
                        detail="acties per team"
                        accent="amber"
                      />
                    </div>
                  </div>
                </section>

                <div className="grid gap-6 xl:grid-cols-[minmax(0,1.55fr),minmax(320px,0.78fr)]">
                  <section className="rounded-[28px] border border-[#e4d9cb] bg-white shadow-[0_12px_36px_rgba(19,32,51,0.06)]">
                    <div className="flex flex-col gap-4 border-b border-[#ebe1d5] px-7 py-6 lg:flex-row lg:items-end lg:justify-between">
                      <div>
                        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#8d8377]">Managers per team</p>
                        <h3 className="mt-2 text-[1.4rem] font-semibold tracking-[-0.03em] text-[#132033]">Koppel eigenaarschap zonder extra omweg</h3>
                      </div>
                      <p className="text-sm text-[#6d6458]">
                        {canAssignManagers ? 'Live toewijzing in deze omgeving' : 'Alleen lezen vanuit het dossier'}
                      </p>
                    </div>
                    <div className="grid grid-cols-[minmax(0,1.35fr),minmax(0,1.3fr),96px,112px] gap-4 border-b border-[#ebe1d5] bg-[#faf6f0] px-7 py-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#8d8377]">
                      <span>Afdeling / team</span>
                      <span>Toegewezen manager</span>
                      <span>Mensen</span>
                      <span>Open</span>
                    </div>
                    <div>
                      {teamRows.map((team) => (
                        <div
                          key={team.id}
                          className={`grid grid-cols-[minmax(0,1.35fr),minmax(0,1.3fr),96px,112px] gap-4 border-b border-[#f1e8dd] px-7 py-5 text-sm text-[#132033] last:border-b-0 ${
                            selectedTeam?.id === team.id ? 'bg-[#fcfaf7]' : 'bg-white'
                          }`}
                        >
                          <div>
                            <button
                              type="button"
                              className="text-left"
                              onClick={() => {
                                setSelectedTeamId(team.id)
                                setActiveView('teams')
                              }}
                            >
                              <p className="font-semibold">{team.label}</p>
                              <p className="mt-1 text-[#7c7368]">Open teamread</p>
                            </button>
                          </div>
                          <div className="space-y-2">
                            <div className="flex items-center gap-3">
                              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#182231] text-sm font-semibold text-white">
                                {getInitials(team.currentManagerName)}
                              </div>
                              <div className="min-w-0">
                                <p className="truncate font-semibold">{team.currentManagerName ?? 'Nog niet toegewezen'}</p>
                                <p className="truncate text-[#7c7368]">
                                  {canAssignManagers ? 'Koppeling blijft live zichtbaar in deze module' : 'Leest live mee vanuit het dossier'}
                                </p>
                              </div>
                            </div>
                            {canAssignManagers ? (
                              <select
                                value={team.currentManagerId ?? ''}
                                onChange={(event) => void handleManagerChange(team.id, event.target.value)}
                                disabled={assignmentPendingTeamId === team.id}
                                className="w-full rounded-2xl border border-[#ddd3c7] bg-[#fbf8f4] px-4 py-2.5 text-sm text-[#132033] outline-none transition focus:border-[#ff9b4a]"
                              >
                                <option value="">Manager toewijzen</option>
                                {assignmentOptions.map((option) => (
                                  <option key={`${team.id}-${option.value}`} value={option.value}>
                                    {option.label}
                                  </option>
                                ))}
                              </select>
                            ) : null}
                          </div>
                          <p className="pt-2">{team.peopleCount}</p>
                          <div className="pt-1">
                            <span className="inline-flex min-w-[46px] items-center justify-center rounded-full border border-[#eadfce] bg-[#fbf7f1] px-3 py-2 text-sm font-semibold">
                              {team.openActions}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>

                  <section className="space-y-6">
                    {assignmentError ? (
                      <div className="rounded-[24px] border border-[#f3c0bc] bg-[#fff1ef] px-6 py-5 text-sm leading-7 text-[#9c3f36] shadow-[0_12px_36px_rgba(19,32,51,0.06)]">
                        {assignmentError}
                      </div>
                    ) : null}

                    <div className="rounded-[30px] bg-[#182231] px-7 py-7 text-white shadow-[0_22px_56px_rgba(19,32,51,0.18)]">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/45">Toewijzingsfocus</p>
                      <h2 className="mt-3 text-[1.7rem] font-semibold tracking-[-0.04em]">
                        {selectedTeam?.label ?? 'Geen team geselecteerd'}
                      </h2>
                      <p className="mt-4 text-[0.98rem] leading-8 text-white/72">
                        {selectedTeam
                          ? `Voor ${selectedTeam.label} blijft ${getTeamManagerDisplayName(selectedTeam.currentManagerName)} nu de belangrijkste eigenaar in beeld.`
                          : 'Kies een team om de ownership-context te lezen.'}
                      </p>

                      <div className="mt-6 space-y-4 border-t border-white/10 pt-6">
                        <FocusSummaryRow label="Manager" value={getTeamManagerDisplayName(selectedTeam?.currentManagerName ?? null)} />
                        <FocusSummaryRow label="Open acties" value={`${selectedTeam?.openActions ?? 0}`} />
                        <FocusSummaryRow label="Reviews < 7 dagen" value={`${selectedTeam?.reviewSoonCount ?? 0}`} />
                        <FocusSummaryRow label="Mensen" value={`${selectedTeam?.peopleCount ?? 0}`} />
                      </div>
                    </div>

                    <div className="rounded-[24px] border border-[#e4d9cb] bg-white px-6 py-6 shadow-[0_12px_36px_rgba(19,32,51,0.06)]">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#8d8377]">Werkruimte</p>
                      <h3 className="mt-3 text-[1.35rem] font-semibold tracking-[-0.03em] text-[#132033]">{fallbackOwnerName}</h3>
                      <p className="mt-3 text-sm leading-7 text-[#4f6175]">
                        On toegewezen eigenaarschap blijft zichtbaar als nog niet toegewezen; deze naam laat alleen zien wie de werkruimte nu geopend heeft.
                      </p>
                      <div className="mt-5 space-y-4">
                        <SummaryRow label="Toegewezen" value={`${ownerCoverageCount} van ${teamRows.length}`} />
                        <SummaryRow label="Zonder eigenaar" value={`${missingManagerCount}`} />
                      </div>
                    </div>
                  </section>
                </div>
              </div>
            ) : null}

            {activeView === 'teams' ? (
              <ActionCenterTeamsView
                items={filteredItems}
                selectedTeamId={selectedTeamId}
                onSelectTeam={setSelectedTeamId}
                onNavigateToActions={(itemId) => {
                  setSelectedItemId(itemId)
                  setActiveView('actions')
                }}
                canAssignManagers={canAssignManagers}
              />
            ) : null}
          </div>
        </div>
      </div>

      {showCreateModal ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#132033]/35 px-4 py-8">
          <div className="w-full max-w-[800px] rounded-[28px] border border-[#e6dccf] bg-white shadow-[0_35px_120px_rgba(19,32,51,0.24)]">
            <div className="flex items-start justify-between gap-4 border-b border-[#efe7dc] px-8 py-7">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#8d8377]">Nieuwe actie</p>
                <h2 className="mt-2 text-[2rem] font-semibold tracking-[-0.05em] text-[#132033]">Actie aanmaken</h2>
                <p className="mt-3 text-base leading-8 text-[#4f6175]">
                  Koppel een concrete vervolgstap aan een Verisight-signaal of bestaand dossier in Action Center.
                </p>
              </div>
              <button
                type="button"
                className="rounded-full border border-[#ddd3c7] px-3 py-1.5 text-sm font-semibold text-[#5f564a] transition hover:border-[#1a2533] hover:text-[#1a2533]"
                onClick={() => setShowCreateModal(false)}
              >
                Sluiten
              </button>
            </div>

            <div className="grid gap-6 px-8 py-7">
              <FormField label="Titel">
                <input
                  value={createForm.title}
                  onChange={(event) => setCreateForm((current) => ({ ...current, title: event.target.value }))}
                  placeholder="Bijv. Onboardinggesprek 60 dagen herinrichten"
                  className="w-full rounded-2xl border border-[#ddd3c7] bg-[#fbf8f4] px-4 py-3 text-sm text-[#132033] outline-none transition focus:border-[#ff9b4a]"
                />
              </FormField>

              <FormField label="Korte toelichting">
                <textarea
                  value={createForm.summary}
                  onChange={(event) => setCreateForm((current) => ({ ...current, summary: event.target.value }))}
                  placeholder="Waarom is deze actie nodig? Welk signaal ligt eronder?"
                  className="min-h-[120px] w-full rounded-2xl border border-[#ddd3c7] bg-[#fbf8f4] px-4 py-3 text-sm leading-7 text-[#132033] outline-none transition focus:border-[#ff9b4a]"
                />
              </FormField>

              <div className="grid gap-4 md:grid-cols-2">
                <FormField label="Bron / route">
                  <select
                    value={createForm.sourceLabel}
                    onChange={(event) => setCreateForm((current) => ({ ...current, sourceLabel: event.target.value }))}
                    className="w-full rounded-2xl border border-[#ddd3c7] bg-[#fbf8f4] px-4 py-3 text-sm text-[#132033] outline-none transition focus:border-[#ff9b4a]"
                  >
                    {allSources.map((source) => (
                      <option key={source} value={source}>
                        {source}
                      </option>
                    ))}
                  </select>
                </FormField>
                <FormField label="Afdeling / team">
                  <select
                    value={createForm.teamId}
                    onChange={(event) => setCreateForm((current) => ({ ...current, teamId: event.target.value }))}
                    className="w-full rounded-2xl border border-[#ddd3c7] bg-[#fbf8f4] px-4 py-3 text-sm text-[#132033] outline-none transition focus:border-[#ff9b4a]"
                  >
                    <option value="">Kies team</option>
                    {teamRows.map((team) => (
                      <option key={team.id} value={team.id}>
                        {team.label}
                      </option>
                    ))}
                  </select>
                </FormField>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <FormField label="Eigenaar">
                  <select
                    value={createForm.ownerName}
                    onChange={(event) => setCreateForm((current) => ({ ...current, ownerName: event.target.value }))}
                    className="w-full rounded-2xl border border-[#ddd3c7] bg-[#fbf8f4] px-4 py-3 text-sm text-[#132033] outline-none transition focus:border-[#ff9b4a]"
                  >
                    <option value="">Nog niet toegewezen</option>
                    {ownerOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </FormField>
                <FormField label="Volgende review">
                  <input
                    type="date"
                    value={createForm.reviewDate}
                    onChange={(event) => setCreateForm((current) => ({ ...current, reviewDate: event.target.value }))}
                    className="w-full rounded-2xl border border-[#ddd3c7] bg-[#fbf8f4] px-4 py-3 text-sm text-[#132033] outline-none transition focus:border-[#ff9b4a]"
                  />
                </FormField>
                <FormField label="Prioriteit">
                  <select
                    value={createForm.priority}
                    onChange={(event) =>
                      setCreateForm((current) => ({
                        ...current,
                        priority: event.target.value as ActionCenterPreviewPriority,
                      }))
                    }
                    className="w-full rounded-2xl border border-[#ddd3c7] bg-[#fbf8f4] px-4 py-3 text-sm text-[#132033] outline-none transition focus:border-[#ff9b4a]"
                  >
                    <option value="hoog">Hoog</option>
                    <option value="midden">Midden</option>
                    <option value="laag">Laag</option>
                  </select>
                </FormField>
              </div>

              <FormField label="Reviewritme">
                <div className="grid gap-3 md:grid-cols-4">
                  {REVIEW_RHYTHM_OPTIONS.map((option) => (
                    <button
                      key={option}
                      type="button"
                      className={`rounded-2xl border px-4 py-3 text-sm font-semibold transition ${
                        createForm.reviewRhythm === option
                          ? 'border-[#ff9b4a] bg-[#fff3e8] text-[#132033]'
                          : 'border-[#ddd3c7] bg-[#fbf8f4] text-[#5f564a]'
                      }`}
                      onClick={() => setCreateForm((current) => ({ ...current, reviewRhythm: option }))}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </FormField>
            </div>

            <div className="flex items-center justify-end gap-3 border-t border-[#efe7dc] bg-[#fbf7f1] px-8 py-5">
              <button
                type="button"
                className="rounded-2xl px-4 py-2 text-sm font-semibold text-[#5f564a]"
                onClick={() => setShowCreateModal(false)}
              >
                Annuleren
              </button>
              <button
                type="button"
                className="rounded-2xl bg-[#ff9b4a] px-5 py-3 text-sm font-semibold text-[#132033] transition hover:brightness-[0.98]"
                onClick={handleCreateAction}
              >
                Actie aanmaken
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}

function SidebarGroup({
  title,
  items,
}: {
  title: string
  items: Array<{ key: string; label: string; active: boolean; count: number; onClick: () => void }>
}) {
  return (
    <div className="mb-8">
      <p className="mb-3 px-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/35">{title}</p>
      <div className="space-y-1.5">
        {items.map((item) => (
          <button
            key={item.key}
            type="button"
            className={`flex w-full items-center justify-between rounded-2xl px-4 py-3 text-left text-[1.02rem] transition ${
              item.active ? 'bg-white/[0.08] text-white' : 'text-white/70 hover:bg-white/[0.04]'
            }`}
            onClick={item.onClick}
          >
            <span>{item.label}</span>
            {item.count > 0 ? <span className="h-1.5 w-1.5 rounded-full bg-[#ff9b4a]" /> : null}
          </button>
        ))}
      </div>
    </div>
  )
}

function OverviewStat({
  label,
  value,
  detail,
  accent,
}: {
  label: string
  value: string
  detail: string
  accent: 'amber' | 'red' | 'teal'
}) {
  const accentClass =
    accent === 'amber' ? 'bg-[#ff9b4a]' : accent === 'red' ? 'bg-[#ef6e64]' : 'bg-[#70b7aa]'

  return (
    <div className="rounded-[18px] border border-[#e6ddd2] bg-white px-4 py-3.5">
      <div className="flex items-center gap-2">
        <span className={`h-2.5 w-2.5 rounded-full ${accentClass}`} />
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#7d7368]">{label}</p>
      </div>
      <p className="dash-number mt-3 text-[1.95rem] font-semibold tracking-[-0.05em] text-[#132033]">{value}</p>
      <p className="mt-1 text-sm text-[#6d6458]">{detail}</p>
    </div>
  )
}

function ReviewWindowStat({
  label,
  value,
  tone,
}: {
  label: string
  value: string
  tone: 'red' | 'amber' | 'slate'
}) {
  const textClass =
    tone === 'red' ? 'text-[#d2574b]' : tone === 'amber' ? 'text-[#bd6a16]' : 'text-[#42556b]'

  return (
    <div className="rounded-[16px] border border-[#ece4d8] bg-white px-4 py-3">
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#8d8377]">{label}</p>
      <p className={`mt-2 text-[1.4rem] font-semibold tracking-[-0.04em] ${textClass}`}>{value}</p>
    </div>
  )
}

function ReviewLane({
  title,
  items,
  emptyText,
  onOpen,
}: {
  title: string
  items: ActionCenterPreviewItem[]
  emptyText: string
  onOpen: (item: ActionCenterPreviewItem) => void
}) {
  return (
    <section className="rounded-[24px] border border-[#e4d9cb] bg-white px-6 py-6 shadow-[0_4px_12px_rgba(19,32,51,0.035)]">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-[1.45rem] font-semibold tracking-[-0.03em] text-[#132033]">{title}</h2>
        <p className="text-sm text-[#736b60]">{items.length} besprekingen</p>
      </div>
      <div className="mt-5 space-y-0">
        {items.length === 0 ? (
          <EmptyBlock text={emptyText} />
        ) : (
          items.map((item) => (
            <button
              key={item.id}
              type="button"
              className="flex w-full items-start gap-4 border-b border-[#ebe1d5] px-0 py-4 text-left transition hover:bg-[#fffdfa] last:border-b-0"
              onClick={() => onOpen(item)}
            >
              <div className="min-w-[70px] rounded-[16px] bg-[#fbf3ef] px-3 py-3 text-center text-[#d2574b]">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em]">Review</p>
                <p className="mt-1 text-xl font-semibold">{item.reviewDateLabel}</p>
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2 text-sm text-[#6d6458]">
                  <MiniTag>{item.sourceLabel}</MiniTag>
                  <span>{item.teamLabel}</span>
                </div>
                <p className="mt-3 text-[1.08rem] font-semibold tracking-[-0.02em] text-[#132033]">{item.title}</p>
                <p className="mt-2 text-sm text-[#5d6f84]">{item.ownerName ?? 'Nog niet toegewezen'}</p>
              </div>
              <StatusPill status={item.status} />
            </button>
          ))
        )}
      </div>
    </section>
  )
}

function PriorityInline({ priority }: { priority: ActionCenterPreviewPriority }) {
  const meta = getPriorityMeta(priority)
  return <span className="text-[#d05f3f]">{meta.label}</span>
}

function StatusPill({ status }: { status: ActionCenterPreviewStatus }) {
  const meta = getStatusMeta(status)
  return (
    <span className={`inline-flex items-center rounded-xl border px-3 py-1.5 text-sm font-semibold ${meta.pillClass}`}>
      <span className="mr-2 h-2 w-2 rounded-full bg-current/80" />
      {meta.label}
    </span>
  )
}

function MiniTag({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-xl border border-[#e3d8ca] bg-[#fbf7f1] px-3 py-1 text-sm text-[#675f55]">
      {children}
    </span>
  )
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-[#f1e8dd] pb-4 last:border-b-0 last:pb-0">
      <span className="text-[#5d6f84]">{label}</span>
      <span className="font-semibold text-[#132033]">{value}</span>
    </div>
  )
}

function LabelValue({ label, value }: { label: string; value: string }) {
  return (
    <>
      <dt className="text-[#5d6f84]">{label}</dt>
      <dd className="font-semibold text-[#132033]">{value}</dd>
    </>
  )
}

function DarkMetric({ label, value, accent }: { label: string; value: string; accent: string }) {
  return (
    <div>
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/45">{label}</p>
      <p className={`mt-2 text-[1.9rem] font-semibold tracking-[-0.04em] ${accent}`}>{value}</p>
    </div>
  )
}

function FocusSummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 text-sm">
      <span className="text-white/48">{label}</span>
      <span className="text-right font-semibold text-white/86">{value}</span>
    </div>
  )
}

function SignalRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[18px] border border-[#e6ddd2] bg-white px-4 py-4">
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#8d8377]">{label}</p>
      <p className="mt-2 text-sm leading-7 text-[#42556b]">{value}</p>
    </div>
  )
}

function EmptyBlock({ text }: { text: string }) {
  return (
    <div className="rounded-[18px] border border-dashed border-[#ddd3c7] bg-[#fbf8f4] px-5 py-5 text-sm leading-7 text-[#5d6f84]">
      {text}
    </div>
  )
}

function EmptySection({ title, body }: { title: string; body: string }) {
  return (
    <section className="rounded-[28px] border border-[#e4d9cb] bg-white px-6 py-10 text-center shadow-[0_12px_36px_rgba(19,32,51,0.06)]">
      <h2 className="text-[1.45rem] font-semibold tracking-[-0.03em] text-[#132033]">{title}</h2>
      <p className="mx-auto mt-3 max-w-2xl text-sm leading-7 text-[#5d6f84]">{body}</p>
    </section>
  )
}

export function buildCompactLandingSummaryLines(item: ActionCenterPreviewItem) {
  const routeSummary = getRouteSummaryDisplay(item)
  return [
    { label: 'Route', value: routeSummary.stateLabel },
    { label: 'Lezing', value: routeSummary.overviewSummary },
  ]
    .filter((entry): entry is { label: string; value: string } => Boolean(entry?.value))
    .filter((entry, index, entries) => entries.findIndex((candidate) => candidate.value === entry.value) === index)
    .slice(0, 2)
}

function CompactLandingSummary({ item }: { item: ActionCenterPreviewItem }) {
  const summaryLines = buildCompactLandingSummaryLines(item)
  const overviewLineageLabel = item.coreSemantics.lineageSummary.overviewLabel

  if (summaryLines.length === 0 && !overviewLineageLabel) {
    return null
  }

  return (
    <div className="mt-4 rounded-[18px] border border-[#eadfce] bg-white px-4 py-4">
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#8d8377]">
        {isClosedRouteStatus(item.status) ? 'Historische route-read' : 'Laatste route-read'}
      </p>
      {overviewLineageLabel ? (
        <p className="mt-3 text-sm leading-6 text-[#7d7368]">{overviewLineageLabel}</p>
      ) : null}
      {summaryLines.length > 0 ? (
        <div className="mt-3 space-y-2.5">
          {summaryLines.map((line) => (
            <div key={`${line.label}-${line.value}`} className="flex items-start justify-between gap-3 text-sm">
              <span className="shrink-0 font-semibold text-[#7d7368]">{line.label}</span>
              <span className="text-right leading-6 text-[#42556b]">{line.value}</span>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  )
}

type ActionCenterDetailLineageEntry = {
  key: 'backward' | 'forward'
  label: string
  routeId: string | null
  routeTitle: string | null
}

function buildDetailLineageEntries(
  item: ActionCenterPreviewItem,
  routeTitlesById: ReadonlyMap<string, string>,
): ActionCenterDetailLineageEntry[] {
  const { backwardLabel, backwardRouteId, forwardLabel, forwardRouteId } = item.coreSemantics.lineageSummary
  const entries: Array<ActionCenterDetailLineageEntry | null> = [
    backwardLabel
      ? {
          key: 'backward',
          label: backwardLabel,
          routeId: backwardRouteId,
          routeTitle: backwardRouteId ? (routeTitlesById.get(backwardRouteId) ?? null) : null,
        }
      : null,
    forwardLabel
      ? {
          key: 'forward',
          label: forwardLabel,
          routeId: forwardRouteId,
          routeTitle: forwardRouteId ? (routeTitlesById.get(forwardRouteId) ?? null) : null,
        }
      : null,
  ]

  return entries.filter((entry): entry is ActionCenterDetailLineageEntry => entry !== null)
}

function RouteFieldCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[18px] border border-[#eadfce] bg-[#fcfaf6] px-4 py-4">
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#8d8377]">{label}</p>
      <p className="mt-3 text-sm leading-7 text-[#32465d]">{value}</p>
    </div>
  )
}

function RouteSummaryCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[20px] border border-[#eadfce] bg-white px-5 py-5">
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#8d8377]">{label}</p>
      <p className="mt-3 text-sm leading-7 text-[#32465d]">{value}</p>
    </div>
  )
}

function DecisionOutcomeCard({ decision }: { decision: ActionCenterDecision }) {
  const label = getDecisionLabel(decision)
  const meta = getReviewOutcomeMeta(decision)

  return (
    <div className="rounded-[18px] border border-[#eadfce] bg-[#fcfaf6] px-4 py-4">
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#8d8377]">Laatste beslissing</p>
      <div className="mt-3">
        <span className={`inline-flex items-center rounded-xl border px-3 py-2 text-sm font-semibold ${meta.className}`}>
          {label}
        </span>
      </div>
    </div>
  )
}

function DecisionHistoryEntry({ entry }: { entry: ActionCenterDecisionRecord }) {
  const summaryBits = [
    entry.currentStepSnapshot ? { label: 'Stap', value: entry.currentStepSnapshot } : null,
    entry.observationSnapshot ? { label: 'Gezien', value: entry.observationSnapshot } : null,
    entry.nextCheck ? { label: 'Hierna toetsen', value: entry.nextCheck } : null,
  ].filter((bit): bit is { label: string; value: string } => Boolean(bit))

  return (
    <div className="rounded-[18px] border border-white/10 bg-white/[0.04] px-4 py-4">
      <div className="flex flex-wrap items-center gap-3">
        <span className="inline-flex items-center rounded-xl border border-white/10 bg-white/[0.06] px-3 py-1.5 text-sm font-semibold text-white/88">
          {getDecisionLabel(entry.decision)}
        </span>
        <span className="text-xs uppercase tracking-[0.16em] text-white/40">
          {formatLongDate(entry.reviewCompletedAt ?? entry.decisionRecordedAt)}
        </span>
      </div>

      {entry.decisionReason ? (
        <p className="mt-3 text-sm leading-7 text-white/78">{entry.decisionReason}</p>
      ) : null}

      {summaryBits.length > 0 ? (
        <div className="mt-4 space-y-2.5">
          {summaryBits.map((bit) => (
            <div key={`${entry.decisionEntryId}-${bit.label}`} className="flex items-start justify-between gap-3 text-sm">
              <span className="shrink-0 font-semibold text-white/46">{bit.label}</span>
              <span className="text-right leading-6 text-white/82">{bit.value}</span>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  )
}

function ResultProgressionEntry({
  entry,
}: {
  entry: ActionCenterPreviewItem['coreSemantics']['resultProgression'][number]
}) {
  const rows = [
    entry.currentStep ? { label: 'Liep', value: entry.currentStep } : null,
    entry.observation ? { label: 'Teruggezien', value: entry.observation } : null,
    { label: 'Besloten', value: getDecisionLabel(entry.decision) },
    entry.followThrough ? { label: 'Volgde daarna', value: entry.followThrough } : null,
  ].filter((row): row is { label: string; value: string } => Boolean(row))

  return (
    <div className="rounded-[18px] border border-white/10 bg-white/[0.04] px-4 py-4">
      <div className="flex flex-wrap items-center gap-3">
        <span className="inline-flex items-center rounded-xl border border-white/10 bg-white/[0.06] px-3 py-1.5 text-sm font-semibold text-white/88">
          {formatLongDate(entry.recordedAt)}
        </span>
        <span className="text-xs uppercase tracking-[0.16em] text-white/40">Resultaatmoment</span>
      </div>

      <div className="mt-4 space-y-2.5">
        {rows.map((row) => (
          <div key={`${entry.resultEntryId}-${row.label}`} className="flex items-start justify-between gap-3 text-sm">
            <span className="shrink-0 font-semibold text-white/46">{row.label}</span>
            <span className="text-right leading-6 text-white/82">{row.value}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function FormField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-semibold text-[#132033]">{label}</span>
      {children}
    </label>
  )
}

function SearchIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <circle cx="9" cy="9" r="6.5" stroke="currentColor" strokeWidth="1.6" />
      <path d="M14 14l3.5 3.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  )
}

'use client'

import Link from 'next/link'
import type { ActionCenterReviewOutcome } from '@/lib/action-center-route-contract'
import type {
  ActionCenterPreviewItem,
  ActionCenterPreviewManagerOption,
  ActionCenterPreviewPriority,
  ActionCenterPreviewStatus,
  ActionCenterPreviewView,
} from '@/lib/action-center-preview-model'
import { useDeferredValue, useEffect, useMemo, useState } from 'react'

interface Props {
  initialItems: ActionCenterPreviewItem[]
  initialSelectedItemId?: string | null
  initialView?: ActionCenterPreviewView
  fallbackOwnerName: string
  ownerOptions: string[]
  managerOptions?: ActionCenterPreviewManagerOption[]
  canAssignManagers?: boolean
  managerAssignmentEndpoint?: string
  workbenchHref: string
  workbenchLabel?: string
  workspaceName?: string
  workspaceSubtitle?: string
  readOnly?: boolean
  itemHrefs?: Record<string, string>
  hideSidebar?: boolean
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

const SIDEBAR_ITEMS: Array<{ key: ActionCenterPreviewView; label: string }> = [
  { key: 'overview', label: 'Overzicht' },
  { key: 'actions', label: 'Acties' },
  { key: 'reviews', label: 'Reviewmomenten' },
  { key: 'managers', label: 'Managers' },
  { key: 'teams', label: 'Mijn teams' },
]

const REVIEW_RHYTHM_OPTIONS = ['Wekelijks', 'Tweewekelijks', 'Maandelijks', 'Per kwartaal']

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

function getViewCopy(view: ActionCenterPreviewView, selectedTitle: string | null) {
  switch (view) {
    case 'actions':
      return {
        eyebrow: 'Action Center',
        title: 'Acties',
        description: 'Concrete vervolgacties op echte ExitScan-dossiers. Rustig, direct en gekoppeld aan echte dossiers.',
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
          ? 'Eén actie geopend: waarom dit dossier aandacht vraagt, wie eigenaar is en wanneer de review terugkomt.'
          : 'Van signaal naar opvolging. Zie rustig wat nu besproken moet worden, waar reviews terugkomen en waar eigenaarschap nog expliciet gemaakt moet worden.',
      }
  }
}

function buildTeamRows(items: ActionCenterPreviewItem[]) {
  const rows = new Map<
    string,
    {
      id: string
      orgId: string | null
      scopeType: 'department' | 'item' | 'org'
      label: string
      peopleCount: number
      currentManagerId: string | null | undefined
      currentManagerName: string | null
      openActions: number
      reviewSoonCount: number
      hasOwnerGap: boolean
    }
  >()

  for (const item of items) {
    const current = rows.get(item.teamId) ?? {
      id: item.teamId,
      orgId: item.orgId ?? null,
      scopeType: item.scopeType ?? 'department',
      label: item.teamLabel,
      peopleCount: item.peopleCount,
      currentManagerId: item.ownerId,
      currentManagerName: item.ownerName,
      openActions: 0,
      reviewSoonCount: 0,
      hasOwnerGap: false,
    }

    current.peopleCount = Math.max(current.peopleCount, item.peopleCount)
    if (!current.currentManagerId && item.ownerId) {
      current.currentManagerId = item.ownerId
    }
    if (!current.currentManagerName && item.ownerName) {
      current.currentManagerName = item.ownerName
    }
    if (item.status !== 'afgerond' && item.status !== 'gestopt') {
      current.openActions += 1
    }
    if (item.reviewDate && compareReviewDate(item.reviewDate, new Date().toISOString()) <= 0) {
      current.reviewSoonCount += 1
    }
    if (!item.ownerName) {
      current.hasOwnerGap = true
    }
    rows.set(item.teamId, current)
  }

  return [...rows.values()].sort((left, right) => {
    if (right.openActions !== left.openActions) return right.openActions - left.openActions
    return left.label.localeCompare(right.label)
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
  workbenchHref,
  workbenchLabel = 'Open dossierbron',
  workspaceName,
  workspaceSubtitle = 'Admin-first opvolging',
  readOnly = false,
  itemHrefs = {},
  hideSidebar = false,
}: Props) {
  const initialSelectedItem =
    initialItems.find((item) => item.id === initialSelectedItemId) ?? initialItems[0] ?? null
  const [items, setItems] = useState(initialItems)
  const [activeView, setActiveView] = useState<ActionCenterPreviewView>(initialView)
  const [selectedItemId, setSelectedItemId] = useState(initialSelectedItem?.id ?? null)
  const [selectedTeamId, setSelectedTeamId] = useState(initialSelectedItem?.teamId ?? initialItems[0]?.teamId ?? null)
  const [searchQuery, setSearchQuery] = useState('')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [createForm, setCreateForm] = useState<CreateActionFormState>(() => getCreateDefaults(initialItems))
  const [updateDraft, setUpdateDraft] = useState('')
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
          'te-bespreken': 1,
          'in-uitvoering': 2,
          'afgerond': 3,
          'gestopt': 4,
        }
        return rank[left.status] - rank[right.status]
      }

      return compareReviewDate(left.reviewDate, right.reviewDate)
    })

  const selectedItem = filteredItems.find((item) => item.id === selectedItemId) ?? items.find((item) => item.id === selectedItemId) ?? filteredItems[0] ?? items[0] ?? null
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
  const managerLabelByValue = useMemo(
    () => new Map(assignmentOptions.map((option) => [option.value, option.label])),
    [assignmentOptions],
  )
  const teamRows = buildTeamRows(items)
  const selectedTeam = teamRows.find((team) => team.id === selectedTeamId) ?? teamRows[0] ?? null
  const allSources = [...new Set(items.map((item) => item.sourceLabel))]
  const today = new Date()
  const dueItems = items.filter((item) => item.status === 'geblokkeerd' || item.status === 'te-bespreken')
  const openItems = items.filter((item) => item.status !== 'afgerond' && item.status !== 'gestopt')
  const overdueReviews = items.filter((item) => getReviewBucket(item.reviewDate, today) === 'achterstallig')
  const thisWeekReviews = items.filter((item) => getReviewBucket(item.reviewDate, today) === 'deze-week')
  const nextWeekReviews = items.filter((item) => getReviewBucket(item.reviewDate, today) === 'volgende-week')
  const quarterReviews = items.filter((item) => getReviewBucket(item.reviewDate, today) === 'kwartaal')
  const visibleItems = filteredItems.length > 0 ? filteredItems : items
  const visibleDueItems = visibleItems.filter((item) => item.status === 'geblokkeerd' || item.status === 'te-bespreken')
  const upcomingReviews = [...items]
    .filter((item) => item.reviewDate)
    .sort((left, right) => compareReviewDate(left.reviewDate, right.reviewDate))
    .slice(0, 4)
  const earliestReview = upcomingReviews[0]?.reviewDateLabel ?? 'Nog niet gepland'
  const missingManagerCount = teamRows.filter((team) => !team.currentManagerName).length
  const ownerCoverageCount = teamRows.length - missingManagerCount
  const selectedTeamItems = items.filter((item) => item.teamId === selectedTeam?.id)
  const teamOpenItems = selectedTeamItems.filter((item) => item.status !== 'afgerond' && item.status !== 'gestopt')
  const teamReviewItems = selectedTeamItems
    .filter((item) => item.reviewDate)
    .sort((left, right) => compareReviewDate(left.reviewDate, right.reviewDate))
    .slice(0, 3)
  const focusItem = visibleDueItems[0] ?? visibleItems[0] ?? null
  const viewCopy = getViewCopy(activeView, activeView === 'overview' && selectedItem ? null : activeView === 'overview' ? null : selectedItem?.title ?? null)

  function updateItem(itemId: string, updater: (item: ActionCenterPreviewItem) => ActionCenterPreviewItem) {
    setItems((currentItems) =>
      currentItems.map((item) => (item.id === itemId ? updater(item) : item)),
    )
  }

  function handleCreateAction() {
    if (!createForm.title.trim() || !createForm.teamId) {
      return
    }

    const team = teamRows.find((entry) => entry.id === createForm.teamId)
    const nextIndex = items.length + 1040
    const newItem: ActionCenterPreviewItem = {
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
      openSignals: ['review_due'],
      updates: [
        {
          id: `local-update-${nextIndex}`,
          author: 'Admin',
          dateLabel: formatShortDate(new Date().toISOString()),
          note: 'Actie handmatig toegevoegd in de preview-surface.',
        },
      ],
    }

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
          ? {
              ...item,
              ownerId: trimmedManagerValue || null,
              ownerName: managerLabel,
              ownerRole: managerLabel ? `Manager - ${item.teamLabel}` : 'Nog niet toegewezen',
              ownerSubtitle: item.teamLabel,
              reviewOwnerName: managerLabel || item.reviewOwnerName,
            }
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
                {!readOnly ? (
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
            {hideSidebar ? (
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
                        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#8d8377]">Managementritme</p>
                        <h2 className="mt-3 text-[2rem] font-semibold tracking-[-0.05em] text-[#132033]">Wat moet nu gelezen en opgepakt worden?</h2>
                        <p className="mt-4 max-w-xl text-[1rem] leading-8 text-[#4f6175]">
                          Action Center bundelt live opvolging uit campagnes en dossiers tot een eerste overzicht van wat nu aandacht vraagt.
                        </p>
                      </div>
                      <div className="grid gap-3 sm:grid-cols-3 xl:max-w-[34rem] xl:flex-1">
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
                      </div>
                    </div>

                    <div className="mt-8 flex items-center justify-between gap-3 border-t border-[#ece4d8] pt-6">
                      <div>
                        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#8d8377]">Nu in beeld</p>
                        <h3 className="mt-2 text-[1.35rem] font-semibold tracking-[-0.03em] text-[#132033]">Eerste managementflow</h3>
                      </div>
                      <button
                        type="button"
                        className="text-sm font-semibold text-[#4a5f74] transition hover:text-[#132033]"
                        onClick={() => setActiveView('actions')}
                      >
                        Open alle acties
                      </button>
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
                    <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/45">Aanbevolen focus</p>
                    <h2 className="mt-3 text-[1.8rem] font-semibold tracking-[-0.045em]">
                      {focusItem?.title ?? 'Action Center ritme staat klaar'}
                    </h2>
                    <p className="mt-4 text-[0.98rem] leading-8 text-white/72">
                      {focusItem?.reason ??
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
                        {focusItem?.nextStep ?? 'De eerste review en eigenaar worden automatisch zichtbaar zodra een dossier live staat.'}
                      </p>
                    </div>

                    <div className="mt-6 flex flex-wrap gap-3">
                      <button
                        type="button"
                        className="inline-flex min-h-11 items-center rounded-full bg-[#ff9b4a] px-4.5 py-2.5 text-sm font-semibold text-[#132033] transition hover:brightness-[0.98]"
                        onClick={() => {
                          if (focusItem) {
                            setSelectedItemId(focusItem.id)
                            setActiveView('actions')
                          } else {
                            setActiveView('actions')
                          }
                        }}
                      >
                        Open focusactie
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

                  <section className="rounded-[28px] border border-[#e4d9cb] bg-[#fcfaf7] px-7 py-7 shadow-[0_12px_36px_rgba(19,32,51,0.06)]">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#8d8377]">Modulewaarheid</p>
                    <h2 className="mt-3 text-[1.45rem] font-semibold tracking-[-0.04em] text-[#132033]">
                      Action Center blijft een eigen suite-module
                    </h2>
                    <p className="mt-4 text-sm leading-8 text-[#4f6175]">
                      {readOnly
                        ? 'Deze landing leest rustig mee met campagnes, uitvoering en bestaande dossiers. Bewerkbare opvolging openen we alleen waar je rol dat al toelaat.'
                        : 'Voor echte wijzigingen blijft het onderliggende dossier leidend. Deze preview laat dezelfde werkwijze zien zonder extra routes toe te voegen.'}
                    </p>

                    <div className="mt-6 space-y-3">
                      <SignalRow label="Broncampagnes" value={`${allSources.length} actief in deze selectie`} />
                      <SignalRow label="Omgeving" value={workspaceSubtitle} />
                      <SignalRow
                        label="Eigenaarschap"
                        value={
                          missingManagerCount > 0
                            ? `${missingManagerCount} team${missingManagerCount === 1 ? '' : 's'} vragen nog expliciete toewijzing`
                            : 'Alle zichtbare teams hebben een expliciete manager'
                        }
                      />
                    </div>

                    <Link
                      href={workbenchHref}
                      className="mt-6 inline-flex rounded-full border border-[#ded3c6] bg-white px-4 py-2 text-sm font-semibold text-[#1a2533] transition hover:border-[#1a2533]"
                    >
                      {workbenchLabel}
                    </Link>
                  </section>
                </div>

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
                    {!readOnly ? (
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

                        <div className="mt-7 grid gap-4 lg:grid-cols-[minmax(0,1fr),minmax(0,0.92fr)]">
                          <div className="rounded-[24px] border border-[#eadfce] bg-white px-5 py-5">
                            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#8d8377]">Waarom dit nu speelt</p>
                            <p className="mt-4 text-[1.05rem] leading-8 text-[#132033]">{selectedItem.reason}</p>
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

                        {!readOnly ? (
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

                        <div className="mt-6 rounded-[22px] border border-white/10 bg-white/[0.04] px-5 py-5">
                          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/48">Volgende stap</p>
                          <p className="mt-3 text-base leading-7 text-white/86">{selectedItem.nextStep}</p>
                        </div>

                        <div className="mt-6 grid gap-3 md:grid-cols-3">
                          <RouteFieldCard
                            label="Verwacht effect"
                            value={selectedItem.expectedEffect ?? 'Nog niet vastgelegd'}
                          />
                          <RouteFieldCard
                            label="Waarom reviewen we dit"
                            value={selectedItem.reviewReason ?? 'Nog niet vastgelegd'}
                          />
                          <RouteOutcomeCard outcome={selectedItem.reviewOutcome} />
                        </div>

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

                      {!readOnly ? (
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
                  body="Zodra er zichtbare ExitScan-dossiers zijn, toont deze view automatisch de open opvolging."
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
                      emptyText="Geen achterstallige reviews meer zichtbaar."
                      onOpen={(item) => {
                        setSelectedItemId(item.id)
                        setActiveView('actions')
                      }}
                    />
                    <ReviewLane
                      title="Deze week"
                      items={thisWeekReviews}
                      emptyText="Niets meer voor deze week."
                      onOpen={(item) => {
                        setSelectedItemId(item.id)
                        setActiveView('actions')
                      }}
                    />
                    <ReviewLane
                      title="Volgende week"
                      items={nextWeekReviews}
                      emptyText="Nog geen follow-up voor volgende week."
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
                          : 'Zodra er reviewdata live staan, verschijnt hier automatisch het eerstvolgende gesprek.'}
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
                        Reviews blijven hier bewust gekoppeld aan echte acties. Vanuit deze view open je dus steeds dezelfde detailstaat.
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
              selectedTeam ? (
                <div className="space-y-8">
                  <section className="rounded-[28px] border border-[#e4d9cb] bg-[#fcfaf7] px-7 py-7 shadow-[0_12px_36px_rgba(19,32,51,0.06)]">
                    <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
                      <div className="max-w-2xl">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#8d8377]">Teamcontext</p>
                        <h2 className="mt-3 text-[1.9rem] font-semibold tracking-[-0.05em] text-[#132033]">{selectedTeam.label}</h2>
                        <p className="mt-4 text-[1rem] leading-8 text-[#4f6175]">
                          Deze teamread houdt de managementflow compact: wat staat nog open, welke reviews komen eraan en wie is hier de expliciete eigenaar?
                        </p>
                      </div>
                      <div className="grid gap-3 sm:grid-cols-3">
                        <OverviewStat label="Open acties" value={`${teamOpenItems.length}`} detail="zichtbaar in deze teamcontext" accent="amber" />
                        <OverviewStat label="Review < 7 dagen" value={`${selectedTeam.reviewSoonCount}`} detail="vragen snel gesprek" accent="red" />
                        <OverviewStat label="Mensen" value={`${selectedTeam.peopleCount}`} detail="in deze scope" accent="teal" />
                      </div>
                    </div>
                  </section>

                  <div className="grid gap-6 xl:grid-cols-[minmax(0,1.45fr),minmax(320px,0.78fr)]">
                    <section className="rounded-[28px] border border-[#e4d9cb] bg-white px-7 py-7 shadow-[0_12px_36px_rgba(19,32,51,0.06)]">
                      <div className="flex items-center justify-between gap-3 border-b border-[#ece4d8] pb-5">
                        <div>
                          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#8d8377]">Open teamacties</p>
                          <h3 className="mt-2 text-[1.4rem] font-semibold tracking-[-0.03em] text-[#132033]">Wat ligt nu nog op tafel?</h3>
                        </div>
                        <p className="text-sm text-[#736b60]">{teamOpenItems.length} actief</p>
                      </div>
                      <div className="mt-6 space-y-4">
                        {teamOpenItems.length === 0 ? (
                          <EmptyBlock text="Voor dit team staan nu geen open opvolgacties meer zichtbaar." />
                        ) : (
                          teamOpenItems.map((item) => (
                            <button
                              key={item.id}
                              type="button"
                              className="flex w-full items-start justify-between gap-4 rounded-[22px] border border-[#ebe1d5] bg-[#fcfaf7] px-5 py-5 text-left transition hover:border-[#d7cab9]"
                              onClick={() => {
                                setSelectedItemId(item.id)
                                setActiveView('actions')
                              }}
                            >
                              <div className="min-w-0">
                                <div className="flex flex-wrap items-center gap-2 text-sm text-[#6d6458]">
                                  <MiniTag>{item.sourceLabel}</MiniTag>
                                  <span>{getPriorityMeta(item.priority).label}</span>
                                  <span className="text-[#b2a496]">/</span>
                                  <span>{getOwnerDisplayName(item.ownerName)}</span>
                                </div>
                                <p className="mt-3 text-[1.08rem] font-semibold tracking-[-0.02em] text-[#132033]">{item.title}</p>
                                <p className="mt-2 text-sm text-[#5d6f84]">
                                  Review {item.reviewDateLabel}, ritme {item.reviewRhythm}
                                </p>
                              </div>
                              <StatusPill status={item.status} />
                            </button>
                          ))
                        )}
                      </div>
                    </section>

                    <section className="space-y-6">
                      <div className="rounded-[30px] bg-[#182231] px-7 py-7 text-white shadow-[0_22px_56px_rgba(19,32,51,0.18)]">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/45">Teamverantwoordelijke</p>
                        <div className="mt-5 flex items-center gap-4">
                          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white/8 text-xl font-semibold">
                            {getInitials(getTeamManagerDisplayName(selectedTeam.currentManagerName))}
                          </div>
                          <div>
                            <p className="text-[1.4rem] font-semibold tracking-[-0.03em]">
                              {getTeamManagerDisplayName(selectedTeam.currentManagerName)}
                            </p>
                            <p className="mt-1 text-sm text-white/58">Manager - {selectedTeam.label}</p>
                          </div>
                        </div>
                        <div className="mt-6 grid grid-cols-3 gap-4">
                          <DarkMetric label="Open" value={`${teamOpenItems.length}`} accent="text-white" />
                          <DarkMetric label="Review < 7d" value={`${selectedTeam.reviewSoonCount}`} accent="text-[#ffb16e]" />
                          <DarkMetric
                            label="Geblokkeerd"
                            value={`${teamOpenItems.filter((item) => item.status === 'geblokkeerd').length}`}
                            accent="text-white"
                          />
                        </div>
                        <p className="mt-6 text-sm leading-7 text-white/72">
                          Deze teamrail blijft onderdeel van dezelfde omgeving en leest dus altijd mee met eigenaarschap en reviewplanning.
                        </p>
                      </div>

                      <div className="rounded-[24px] border border-[#e4d9cb] bg-white px-6 py-6 shadow-[0_12px_36px_rgba(19,32,51,0.06)]">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#8d8377]">Te bespreken deze week</p>
                        <div className="mt-4 space-y-4">
                          {teamReviewItems.length === 0 ? (
                            <EmptyBlock text="Geen reviews meer gepland voor dit team in de huidige selectie." />
                          ) : (
                            teamReviewItems.map((item) => (
                              <button
                                key={item.id}
                                type="button"
                                className="w-full rounded-[18px] border border-[#efe7dc] bg-[#fcfaf7] px-4 py-4 text-left transition hover:border-[#d7cab9]"
                                onClick={() => {
                                  setSelectedItemId(item.id)
                                  setActiveView('actions')
                                }}
                              >
                                <p className="font-semibold text-[#132033]">{item.title}</p>
                                <p className="mt-1 text-sm text-[#5d6f84]">Volgende bespreking {item.reviewDateLabel}</p>
                              </button>
                            ))
                          )}
                        </div>
                      </div>
                    </section>
                  </div>
                </div>
              ) : (
                <EmptySection
                  title="Nog geen teamcontext beschikbaar"
                  body="Zodra ExitScan-dossiers aan een teamcontext zijn gekoppeld, verschijnt hier de compacte teamweergave."
                />
              )
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
    <div className="rounded-[22px] border border-[#e6ddd2] bg-white px-4 py-4">
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
    <div className="rounded-[18px] border border-[#ece4d8] bg-[#fcfaf7] px-4 py-3">
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
    <section className="rounded-[28px] border border-[#e4d9cb] bg-white px-6 py-6 shadow-[0_12px_36px_rgba(19,32,51,0.06)]">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-[1.45rem] font-semibold tracking-[-0.03em] text-[#132033]">{title}</h2>
        <p className="text-sm text-[#736b60]">{items.length} besprekingen</p>
      </div>
      <div className="mt-5 grid gap-4 lg:grid-cols-2">
        {items.length === 0 ? (
          <EmptyBlock text={emptyText} />
        ) : (
          items.map((item) => (
            <button
              key={item.id}
              type="button"
              className="flex w-full items-start gap-4 rounded-[22px] border border-[#ebe1d5] bg-[#fffdfa] px-5 py-5 text-left transition hover:border-[#d7cab9]"
              onClick={() => onOpen(item)}
            >
              <div className="min-w-[70px] rounded-[20px] bg-[#fbf3ef] px-3 py-3 text-center text-[#d2574b]">
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
    <div className="rounded-[22px] border border-dashed border-[#ddd3c7] bg-[#fbf8f4] px-5 py-5 text-sm leading-7 text-[#5d6f84]">
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

function RouteFieldCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[18px] border border-[#eadfce] bg-[#fcfaf6] px-4 py-4">
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#8d8377]">{label}</p>
      <p className="mt-3 text-sm leading-7 text-[#32465d]">{value}</p>
    </div>
  )
}

function RouteOutcomeCard({ outcome }: { outcome: ActionCenterReviewOutcome }) {
  const meta = getReviewOutcomeMeta(outcome)

  return (
    <div className="rounded-[18px] border border-[#eadfce] bg-[#fcfaf6] px-4 py-4">
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#8d8377]">Laatste reviewuitkomst</p>
      <div className="mt-3">
        <span className={`inline-flex items-center rounded-xl border px-3 py-2 text-sm font-semibold ${meta.className}`}>
          {meta.label}
        </span>
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

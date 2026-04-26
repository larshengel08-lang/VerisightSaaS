'use client'

import Link from 'next/link'
import { useDeferredValue, useEffect, useMemo, useState } from 'react'

export type ActionCenterPreviewView = 'overview' | 'actions' | 'reviews' | 'managers' | 'teams'
export type ActionCenterPreviewStatus = 'te-bespreken' | 'in-uitvoering' | 'geblokkeerd' | 'afgerond' | 'gestopt'
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
  teamId: string
  teamLabel: string
  ownerName: string | null
  ownerRole: string
  ownerSubtitle: string
  reviewOwnerName: string | null
  priority: ActionCenterPreviewPriority
  status: ActionCenterPreviewStatus
  reviewDate: string | null
  reviewDateLabel: string
  reviewRhythm: string
  signalLabel: string
  signalBody: string
  nextStep: string
  peopleCount: number
  openSignals: string[]
  updates: ActionCenterPreviewUpdate[]
}

interface Props {
  initialItems: ActionCenterPreviewItem[]
  initialView?: ActionCenterPreviewView
  fallbackOwnerName: string
  ownerOptions: string[]
  workbenchHref: string
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
        description: 'Concrete vervolgacties op echte ExitScan-dossiers. Dossier-first, admin-first en zonder losse cockpitverbreding.',
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
        description: 'Eigenaarschap blijft expliciet. Koppel per team een verantwoordelijke manager zonder de shared core open te breken.',
      }
    case 'teams':
      return {
        eyebrow: 'Action Center',
        title: 'Mijn teams',
        description: 'Inspirationele teamweergave op basis van dezelfde follow-through laag, zonder consumerverbreding.',
      }
    default:
      return {
        eyebrow: 'Werkruimte',
        title: selectedTitle ? selectedTitle : 'Action Center',
        description: selectedTitle
          ? 'Eén actie geopend in de bounded adminroute: waarom dit dossier aandacht vraagt, wie eigenaar is en wanneer de review terugkomt.'
          : 'Van inzicht naar opvolging. Houd zicht op wat aandacht vraagt, wie het oppakt en wanneer het terug op tafel ligt.',
      }
  }
}

function buildTeamRows(items: ActionCenterPreviewItem[], fallbackOwnerName: string) {
  const rows = new Map<
    string,
    {
      id: string
      label: string
      peopleCount: number
      currentManagerName: string | null
      openActions: number
      reviewSoonCount: number
      hasOwnerGap: boolean
    }
  >()

  for (const item of items) {
    const current = rows.get(item.teamId) ?? {
      id: item.teamId,
      label: item.teamLabel,
      peopleCount: item.peopleCount,
      currentManagerName: item.ownerName,
      openActions: 0,
      reviewSoonCount: 0,
      hasOwnerGap: false,
    }

    current.peopleCount = Math.max(current.peopleCount, item.peopleCount)
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
  }).map((row) => ({
    ...row,
    fallbackOwnerName,
  }))
}

export function ActionCenterPreview({
  initialItems,
  initialView = 'overview',
  fallbackOwnerName,
  ownerOptions,
  workbenchHref,
}: Props) {
  const [items, setItems] = useState(initialItems)
  const [activeView, setActiveView] = useState<ActionCenterPreviewView>(initialView)
  const [selectedItemId, setSelectedItemId] = useState(initialItems[0]?.id ?? null)
  const [selectedTeamId, setSelectedTeamId] = useState(initialItems[0]?.teamId ?? null)
  const [searchQuery, setSearchQuery] = useState('')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [createForm, setCreateForm] = useState<CreateActionFormState>(() => getCreateDefaults(initialItems))
  const [updateDraft, setUpdateDraft] = useState('')
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
  const teamRows = buildTeamRows(items, fallbackOwnerName)
  const selectedTeam = teamRows.find((team) => team.id === selectedTeamId) ?? teamRows[0] ?? null
  const allSources = [...new Set(items.map((item) => item.sourceLabel))]
  const today = new Date()
  const dueItems = items.filter((item) => item.status === 'geblokkeerd' || item.status === 'te-bespreken')
  const openItems = items.filter((item) => item.status !== 'afgerond' && item.status !== 'gestopt')
  const overdueReviews = items.filter((item) => getReviewBucket(item.reviewDate, today) === 'achterstallig')
  const thisWeekReviews = items.filter((item) => getReviewBucket(item.reviewDate, today) === 'deze-week')
  const nextWeekReviews = items.filter((item) => getReviewBucket(item.reviewDate, today) === 'volgende-week')
  const quarterReviews = items.filter((item) => getReviewBucket(item.reviewDate, today) === 'kwartaal')
  const upcomingReviews = [...items]
    .filter((item) => item.reviewDate)
    .sort((left, right) => compareReviewDate(left.reviewDate, right.reviewDate))
    .slice(0, 4)
  const earliestReview = upcomingReviews[0]?.reviewDateLabel ?? 'Nog niet gepland'
  const missingManagerCount = teamRows.filter((team) => !team.currentManagerName).length
  const selectedTeamItems = items.filter((item) => item.teamId === selectedTeam?.id)
  const teamOpenItems = selectedTeamItems.filter((item) => item.status !== 'afgerond' && item.status !== 'gestopt')
  const teamReviewItems = selectedTeamItems
    .filter((item) => item.reviewDate)
    .sort((left, right) => compareReviewDate(left.reviewDate, right.reviewDate))
    .slice(0, 3)
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
      summary: createForm.summary.trim() || 'Nieuwe adminfollow-up vanuit de bounded Action Center-surface.',
      reason: createForm.summary.trim() || 'Nieuwe actie gekoppeld aan een bestaand dossier of signaal.',
      sourceLabel: createForm.sourceLabel,
      teamId: createForm.teamId,
      teamLabel: team?.label ?? 'Nieuw team',
      ownerName: createForm.ownerName || null,
      ownerRole: createForm.ownerName ? `Manager - ${team?.label ?? 'team'}` : 'Nog niet toegewezen',
      ownerSubtitle: team?.label ?? 'Adminroute',
      reviewOwnerName: createForm.ownerName || null,
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

  function handleManagerChange(teamId: string, ownerName: string) {
    const trimmedOwnerName = ownerName.trim()

    setItems((currentItems) =>
      currentItems.map((item) =>
        item.teamId === teamId
          ? {
              ...item,
              ownerName: trimmedOwnerName || null,
              ownerRole: trimmedOwnerName ? `Manager - ${item.teamLabel}` : 'Nog niet toegewezen',
              ownerSubtitle: item.teamLabel,
              reviewOwnerName: trimmedOwnerName || item.reviewOwnerName,
            }
          : item,
      ),
    )
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

  return (
    <div className="overflow-hidden rounded-[32px] border border-[#e6dccf] bg-[#f8f3ec] shadow-[0_24px_80px_rgba(19,32,51,0.12)]">
      <div className="flex min-h-[980px] flex-col lg:flex-row">
        <aside className="flex w-full shrink-0 flex-col bg-[#182231] text-[#f6f1e9] lg:w-[286px]">
          <div className="border-b border-white/6 px-6 py-6">
            <Link href="/dashboard" className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#ff9b4a] text-base font-semibold text-[#182231]">
                V
              </div>
              <div>
                <p className="text-[1.05rem] font-semibold tracking-[-0.02em]">Verisight</p>
                <p className="text-sm text-white/55">Insight &amp; opvolging</p>
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
                href={workbenchHref}
                className="mt-4 inline-flex rounded-full border border-white/10 bg-white/[0.05] px-3 py-1.5 text-sm font-semibold text-white/82 transition hover:bg-white/[0.08]"
              >
                Open dossierbron
              </Link>
            </div>
          </div>

          <div className="border-t border-white/6 px-5 py-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/8 text-sm font-semibold">
                {getInitials(fallbackOwnerName)}
              </div>
              <div className="min-w-0">
                <p className="truncate font-semibold">{fallbackOwnerName}</p>
                <p className="truncate text-sm text-white/48">Admin-first follow-through</p>
              </div>
            </div>
          </div>
        </aside>

        <div className="min-w-0 flex-1">
          <div className="border-b border-[#e4d9cb] bg-[#f7f2ea] px-6 py-5">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
              <div>
                <p className="text-sm text-[#8b8174]">
                  {activeView === 'overview'
                    ? 'Werkruimte / Action Center'
                    : activeView === 'actions'
                      ? 'Action Center / Acties'
                      : activeView === 'reviews'
                        ? 'Action Center / Reviewmomenten'
                        : activeView === 'managers'
                          ? 'Action Center / Managers'
                          : 'Action Center / Mijn teams'}
                  {activeView === 'actions' && selectedItem ? ` / ${selectedItem.code}` : ''}
                </p>
                <h1 className="mt-3 text-[2.3rem] font-semibold tracking-[-0.05em] text-[#132033]">
                  {viewCopy.title}
                </h1>
                <p className="mt-3 max-w-3xl text-lg leading-8 text-[#42556b]">{viewCopy.description}</p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <label className="flex min-w-[320px] items-center gap-3 rounded-2xl border border-[#ddd3c7] bg-white px-4 py-3 text-sm text-[#6a6258] shadow-[inset_0_1px_0_rgba(255,255,255,0.7)]">
                  <SearchIcon />
                  <input
                    value={searchQuery}
                    onChange={(event) => setSearchQuery(event.target.value)}
                    placeholder="Zoek actie, team of eigenaar"
                    className="w-full bg-transparent text-[0.97rem] text-[#2a3442] outline-none placeholder:text-[#9a9084]"
                  />
                </label>
                <button
                  type="button"
                  className="inline-flex items-center justify-center rounded-2xl bg-[#1a2533] px-5 py-3 text-[0.97rem] font-semibold text-white transition hover:bg-[#223247]"
                  onClick={() => setShowCreateModal(true)}
                >
                  <span className="mr-2 text-lg leading-none">+</span>
                  Actie aanmaken
                </button>
              </div>
            </div>
          </div>

          <div className="px-6 py-6">
            {activeView === 'overview' ? (
              <div className="space-y-6">
                <div className="grid gap-4 xl:grid-cols-5">
                  <MetricCard label="Acties open" value={`${openItems.length}`} subcopy={`${dueItems.length} vraagt aandacht`} accent="slate" />
                  <MetricCard label="Te bespreken" value={`${items.filter((item) => item.status === 'te-bespreken').length}`} subcopy="nu zichtbaar" accent="amber" />
                  <MetricCard label="Geblokkeerd" value={`${items.filter((item) => item.status === 'geblokkeerd').length}`} subcopy="vraagt interventie" accent="red" />
                  <MetricCard label="Afdelingen met aandacht" value={`${teamRows.filter((team) => team.openActions > 0).length}`} subcopy={`van ${teamRows.length}`} accent="teal" />
                  <MetricCard label="Afgerond" value={`${items.filter((item) => item.status === 'afgerond').length}`} subcopy="bounded afgesloten" accent="green" />
                </div>

                <div className="grid gap-6 xl:grid-cols-[minmax(0,1.7fr),minmax(320px,0.9fr)]">
                  <section className="rounded-[24px] border border-[#e4d9cb] bg-white px-6 py-6 shadow-[0_12px_40px_rgba(19,32,51,0.08)]">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#8d8377]">Vandaag</p>
                        <h2 className="mt-2 text-[1.55rem] font-semibold tracking-[-0.03em] text-[#132033]">Wat vraagt nu aandacht?</h2>
                      </div>
                      <button
                        type="button"
                        className="text-sm font-semibold text-[#4a5f74] transition hover:text-[#132033]"
                        onClick={() => setActiveView('actions')}
                      >
                        Volledige lijst
                      </button>
                    </div>
                    <div className="mt-6 divide-y divide-[#efe7dc]">
                      {(filteredItems.length > 0 ? filteredItems : items).slice(0, 3).map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          className="flex w-full flex-col gap-4 py-5 text-left transition hover:bg-[#fbf8f3]"
                          onClick={() => {
                            setSelectedItemId(item.id)
                            setActiveView('actions')
                          }}
                        >
                          <div className="flex flex-col gap-3 xl:flex-row xl:items-start xl:justify-between">
                            <div className="min-w-0">
                              <div className="flex flex-wrap items-center gap-2 text-sm text-[#6d6458]">
                                <MiniTag>{item.sourceLabel}</MiniTag>
                                <span>{item.teamLabel}</span>
                              </div>
                              <h3 className="mt-3 text-[1.15rem] font-semibold tracking-[-0.02em] text-[#132033]">{item.title}</h3>
                              <p className="mt-2 text-[0.98rem] leading-7 text-[#4f6175]">{item.summary}</p>
                            </div>
                            <div className="flex items-start gap-3">
                              <StatusPill status={item.status} />
                              <div className="text-right">
                                <AvatarBadge label={item.ownerName} />
                                <p className="mt-2 text-sm text-[#8b8174]">review {item.reviewDateLabel}</p>
                              </div>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </section>

                  <section className="rounded-[24px] border border-[#e4d9cb] bg-white px-6 py-6 shadow-[0_12px_40px_rgba(19,32,51,0.08)]">
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#8d8377]">Deze week</p>
                      <h2 className="mt-2 text-[1.55rem] font-semibold tracking-[-0.03em] text-[#132033]">Komende reviews</h2>
                    </div>
                    <div className="mt-5 space-y-5">
                      {upcomingReviews.length === 0 ? (
                        <EmptyBlock text="Zodra reviewmomenten gepland zijn, komen ze hier automatisch in de bounded adminlaag." />
                      ) : (
                        upcomingReviews.map((item) => (
                          <button
                            key={item.id}
                            type="button"
                            className="flex w-full items-start gap-4 text-left transition hover:text-[#132033]"
                            onClick={() => {
                              setSelectedItemId(item.id)
                              setActiveView('reviews')
                            }}
                          >
                            <div className="min-w-[64px] rounded-[18px] bg-[#fbf3ef] px-3 py-3 text-center text-[#d2574b]">
                              <p className="text-[11px] font-semibold uppercase tracking-[0.18em]">Review</p>
                              <p className="mt-1 text-xl font-semibold">{item.reviewDateLabel}</p>
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="text-[1.02rem] font-semibold leading-7 text-[#132033]">{item.title}</p>
                              <p className="mt-1 text-sm text-[#6d6458]">
                                {item.ownerName ?? fallbackOwnerName} - {item.reviewRhythm}
                              </p>
                            </div>
                          </button>
                        ))
                      )}
                    </div>
                  </section>
                </div>

                <div className="grid gap-6 xl:grid-cols-[minmax(0,1.2fr),minmax(320px,0.8fr)]">
                  <section className="rounded-[24px] border border-[#e4d9cb] bg-white px-6 py-6 shadow-[0_12px_40px_rgba(19,32,51,0.08)]">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#8d8377]">Eigenaarschap</p>
                        <h2 className="mt-2 text-[1.35rem] font-semibold tracking-[-0.03em] text-[#132033]">Managers en toewijzing</h2>
                      </div>
                      <button
                        type="button"
                        className="rounded-2xl border border-[#ded3c6] px-4 py-2 text-sm font-semibold text-[#1a2533] transition hover:border-[#1a2533]"
                        onClick={() => setActiveView('managers')}
                      >
                        Open managers
                      </button>
                    </div>

                    <div className="mt-5 overflow-hidden rounded-[20px] border border-[#ebe1d5]">
                      <div className="grid grid-cols-[minmax(0,1.6fr),minmax(0,1.4fr),110px,120px] gap-4 border-b border-[#ebe1d5] bg-[#faf6f0] px-5 py-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#8d8377]">
                        <span>Afdeling / team</span>
                        <span>Toegewezen manager</span>
                        <span>Mensen</span>
                        <span>Open acties</span>
                      </div>
                      {teamRows.slice(0, 5).map((team) => (
                        <div key={team.id} className="grid grid-cols-[minmax(0,1.6fr),minmax(0,1.4fr),110px,120px] gap-4 px-5 py-4 text-sm text-[#132033]">
                          <div>
                            <p className="font-semibold">{team.label}</p>
                            <p className="mt-1 text-[#7c7368]">Team</p>
                          </div>
                          <div>
                            <p className="font-semibold">{team.currentManagerName ?? 'Manager toewijzen'}</p>
                            <p className="mt-1 text-[#7c7368]">{team.currentManagerName ? 'Wijzigbaar in preview' : 'Valt terug op admin'}</p>
                          </div>
                          <p>{team.peopleCount}</p>
                          <div>
                            <span className="inline-flex min-w-[46px] items-center justify-center rounded-xl border border-[#eadfce] bg-[#fbf7f1] px-3 py-2 text-sm font-semibold">
                              {team.openActions}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>

                  <section className="space-y-6">
                    <div className="rounded-[24px] bg-[#182231] px-6 py-6 text-white shadow-[0_18px_50px_rgba(19,32,51,0.18)]">
                      <div className="flex items-center gap-4">
                        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white/8 text-xl font-semibold">
                          {getInitials(selectedTeam?.currentManagerName ?? fallbackOwnerName)}
                        </div>
                        <div>
                          <p className="text-xl font-semibold">{selectedTeam?.currentManagerName ?? fallbackOwnerName}</p>
                          <p className="mt-1 text-sm text-white/58">Manager - {selectedTeam?.label ?? 'Adminroute'}</p>
                        </div>
                      </div>
                      <div className="mt-6 grid grid-cols-3 gap-4">
                        <DarkMetric label="Open" value={`${selectedTeam ? teamOpenItems.length : 0}`} accent="text-white" />
                        <DarkMetric label="Review &lt;7d" value={`${selectedTeam?.reviewSoonCount ?? 0}`} accent="text-[#ffb16e]" />
                        <DarkMetric label="Geblokkeerd" value={`${selectedTeamItems.filter((item) => item.status === 'geblokkeerd').length}`} accent="text-white" />
                      </div>
                    </div>

                    <div className="rounded-[24px] border border-[#e4d9cb] bg-white px-6 py-6 shadow-[0_12px_40px_rgba(19,32,51,0.08)]">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#8d8377]">Dossier-first</p>
                      <h2 className="mt-2 text-[1.25rem] font-semibold tracking-[-0.03em] text-[#132033]">Dossierbron blijft leidend</h2>
                      <p className="mt-3 text-sm leading-7 text-[#4f6175]">
                        Voor echte wijzigingen blijft de dossierbron onder deze surface de waarheid. Deze preview houdt de adminlaag dicht bij het referentiebeeld, maar opent geen extra carriers of consumerflows.
                      </p>
                      <Link
                        href={workbenchHref}
                        className="mt-4 inline-flex rounded-2xl border border-[#ded3c6] bg-[#faf6f0] px-4 py-2 text-sm font-semibold text-[#1a2533] transition hover:border-[#1a2533]"
                      >
                        Open dossierbron
                      </Link>
                    </div>
                  </section>
                </div>
              </div>
            ) : null}

            {activeView === 'actions' ? (
              selectedItem ? (
                <div className="space-y-6">
                  <div className="flex flex-wrap items-center gap-3">
                    <button
                      type="button"
                      className="inline-flex items-center rounded-full border border-[#ded3c6] bg-white px-4 py-2 text-sm font-semibold text-[#1a2533] transition hover:border-[#1a2533]"
                      onClick={() => setActiveView('overview')}
                    >
                      Terug naar overzicht
                    </button>
                    <button
                      type="button"
                      className="inline-flex items-center rounded-full border border-[#ded3c6] bg-white px-4 py-2 text-sm font-semibold text-[#1a2533] transition hover:border-[#1a2533]"
                      onClick={() => handleStatusChange(selectedItem.status === 'in-uitvoering' ? 'te-bespreken' : 'in-uitvoering')}
                    >
                      Status wijzigen
                    </button>
                    <button
                      type="button"
                      className="inline-flex items-center rounded-full bg-[#ff9b4a] px-4 py-2 text-sm font-semibold text-[#132033] transition hover:brightness-[0.98]"
                      onClick={() => handleReviewPlanChange(selectedItem.reviewDate ?? new Date().toISOString(), selectedItem.reviewRhythm)}
                    >
                      Review plannen
                    </button>
                  </div>

                  <div className="grid gap-6 xl:grid-cols-[minmax(0,1.7fr),minmax(320px,0.85fr)]">
                    <section className="space-y-6">
                      <div className="rounded-[24px] border border-[#e4d9cb] bg-white px-6 py-6 shadow-[0_12px_40px_rgba(19,32,51,0.08)]">
                        <div className="flex flex-wrap items-center gap-3 text-sm text-[#736b60]">
                          <MiniTag>{selectedItem.sourceLabel}</MiniTag>
                          <PriorityInline priority={selectedItem.priority} />
                          <StatusPill status={selectedItem.status} />
                          <span className="ml-auto font-semibold text-[#5a7088]">{selectedItem.code}</span>
                        </div>
                        <p className="mt-6 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#8d8377]">Waarom deze actie?</p>
                        <p className="mt-4 text-[1.15rem] leading-9 text-[#132033]">{selectedItem.reason}</p>

                        <div className="mt-6 rounded-[20px] border border-[#eadfce] bg-[#fbf7f1] px-5 py-5">
                          <div className="flex items-start justify-between gap-4">
                            <div>
                              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#8d8377]">Gekoppeld signaal</p>
                              <p className="mt-3 text-lg font-semibold tracking-[-0.02em] text-[#132033]">{selectedItem.signalLabel}</p>
                              <p className="mt-2 text-sm leading-7 text-[#4f6175]">{selectedItem.signalBody}</p>
                            </div>
                            <Link href={workbenchHref} className="text-sm font-semibold text-[#5a7088] transition hover:text-[#132033]">
                              Open dossierbron
                            </Link>
                          </div>
                        </div>
                      </div>

                      <div className="rounded-[24px] border border-[#e4d9cb] bg-white px-6 py-6 shadow-[0_12px_40px_rgba(19,32,51,0.08)]">
                        <div className="flex items-center justify-between gap-3">
                          <h2 className="text-[1.4rem] font-semibold tracking-[-0.03em] text-[#132033]">Reviewlogboek</h2>
                          <p className="text-sm text-[#736b60]">Cadens: {selectedItem.reviewRhythm}</p>
                        </div>
                        <div className="mt-5 space-y-5">
                          {selectedItem.updates.length === 0 ? (
                            <EmptyBlock text="Nog geen updates toegevoegd in deze preview." />
                          ) : (
                            selectedItem.updates.map((update) => (
                              <div key={update.id} className="flex gap-3">
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

                        <div className="mt-8 border-t border-[#efe7dc] pt-6">
                          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#8d8377]">Update toevoegen</p>
                          <textarea
                            value={updateDraft}
                            onChange={(event) => setUpdateDraft(event.target.value)}
                            placeholder="Korte voortgang of besluit..."
                            className="mt-4 min-h-[138px] w-full rounded-[20px] border border-[#ddd3c7] bg-[#fbf8f4] px-4 py-4 text-sm leading-7 text-[#132033] outline-none transition focus:border-[#ff9b4a]"
                          />
                          <button
                            type="button"
                            className="mt-4 inline-flex rounded-2xl bg-[#ff9b4a] px-4 py-2 text-sm font-semibold text-[#132033] transition hover:brightness-[0.98]"
                            onClick={handleAddUpdate}
                          >
                            Update opslaan
                          </button>
                        </div>
                      </div>
                    </section>

                    <section className="space-y-6">
                      <div className="rounded-[24px] border border-[#e4d9cb] bg-white px-6 py-6 shadow-[0_12px_40px_rgba(19,32,51,0.08)]">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#8d8377]">Eigenaarschap</p>
                        <div className="mt-5 flex items-center gap-4">
                          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#182231] text-xl font-semibold text-white">
                            {getInitials(selectedItem.ownerName ?? fallbackOwnerName)}
                          </div>
                          <div>
                            <p className="text-[1.35rem] font-semibold tracking-[-0.03em] text-[#132033]">
                              {selectedItem.ownerName ?? fallbackOwnerName}
                            </p>
                            <p className="mt-1 text-sm text-[#5d6f84]">{selectedItem.ownerRole}</p>
                          </div>
                        </div>

                        <dl className="mt-6 grid grid-cols-[minmax(0,1fr),minmax(0,1fr)] gap-y-4 text-sm">
                          <LabelValue label="Afdeling" value={selectedItem.teamLabel} />
                          <LabelValue label="Bron" value={selectedItem.sourceLabel} />
                          <LabelValue label="Prioriteit" value={getPriorityMeta(selectedItem.priority).label} />
                          <LabelValue label="Streefdatum" value={selectedItem.reviewDateLabel} />
                          <LabelValue label="Volgende review" value={formatLongDate(selectedItem.reviewDate)} />
                          <LabelValue label="Reviewritme" value={selectedItem.reviewRhythm} />
                        </dl>
                      </div>

                      <div className="rounded-[24px] bg-[#182231] px-6 py-6 text-white shadow-[0_18px_50px_rgba(19,32,51,0.18)]">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/48">Voorbereiding bespreking</p>
                        <p className="mt-4 text-lg leading-8">
                          Sluit aan bij het overleg van <span className="font-semibold text-[#ffb16e]">{selectedItem.reviewDateLabel}</span>. Neem mee:
                          laatste update, open signalen en de eerstvolgende stap.
                        </p>
                        <div className="mt-5 space-y-3">
                          {selectedItem.openSignals.map((signal) => (
                            <div key={signal} className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm">
                              {signal.replace(/_/g, ' ')}
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="rounded-[24px] border border-[#e4d9cb] bg-white px-6 py-6 shadow-[0_12px_40px_rgba(19,32,51,0.08)]">
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
                    </section>
                  </div>
                </div>
              ) : (
                <EmptySection
                  title="Nog geen acties beschikbaar"
                  body="Zodra er bounded ExitScan-dossiers zichtbaar zijn, toont deze view automatisch de open follow-through."
                />
              )
            ) : null}

            {activeView === 'reviews' ? (
              <div className="space-y-6">
                <div className="grid gap-4 xl:grid-cols-4">
                  <MetricCard label="Achterstallig" value={`${overdueReviews.length}`} subcopy="voor vandaag" accent="red" />
                  <MetricCard label="Deze week" value={`${thisWeekReviews.length}`} subcopy="te bespreken" accent="amber" />
                  <MetricCard label="Volgende week" value={`${nextWeekReviews.length}`} subcopy="in queue" accent="slate" />
                  <MetricCard label="Komend kwartaal" value={`${quarterReviews.length}`} subcopy="gepland" accent="slate" />
                </div>
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
              </div>
            ) : null}

            {activeView === 'managers' ? (
              <div className="grid gap-6 xl:grid-cols-[minmax(0,1.55fr),minmax(320px,0.75fr)]">
                <section className="rounded-[24px] border border-[#e4d9cb] bg-white shadow-[0_12px_40px_rgba(19,32,51,0.08)]">
                  <div className="grid grid-cols-[minmax(0,1.4fr),minmax(0,1.2fr),110px,120px] gap-4 border-b border-[#ebe1d5] bg-[#faf6f0] px-6 py-4 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#8d8377]">
                    <span>Afdeling / team</span>
                    <span>Toegewezen manager</span>
                    <span>Mensen</span>
                    <span>Open acties</span>
                  </div>
                  <div>
                    {teamRows.map((team) => (
                      <div key={team.id} className="grid grid-cols-[minmax(0,1.4fr),minmax(0,1.2fr),110px,120px] gap-4 border-b border-[#f1e8dd] px-6 py-5 text-sm text-[#132033] last:border-b-0">
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
                            <p className="mt-1 text-[#7c7368]">Team</p>
                          </button>
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#182231] text-sm font-semibold text-white">
                              {getInitials(team.currentManagerName)}
                            </div>
                            <div className="min-w-0">
                              <p className="truncate font-semibold">{team.currentManagerName ?? 'Nog niet toegewezen'}</p>
                              <p className="truncate text-[#7c7368]">Wijzigen in preview</p>
                            </div>
                          </div>
                          <select
                            value={team.currentManagerName ?? ''}
                            onChange={(event) => handleManagerChange(team.id, event.target.value)}
                            className="w-full rounded-2xl border border-[#ddd3c7] bg-[#fbf8f4] px-4 py-2.5 text-sm text-[#132033] outline-none transition focus:border-[#ff9b4a]"
                          >
                            <option value="">Manager toewijzen</option>
                            {ownerOptions.map((option) => (
                              <option key={`${team.id}-${option}`} value={option}>
                                {option}
                              </option>
                            ))}
                          </select>
                        </div>
                        <p className="pt-2">{team.peopleCount}</p>
                        <div className="pt-1">
                          <span className="inline-flex min-w-[46px] items-center justify-center rounded-xl border border-[#eadfce] bg-[#fbf7f1] px-3 py-2 text-sm font-semibold">
                            {team.openActions}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>

                <section className="space-y-6">
                  <div className="rounded-[24px] border border-[#e4d9cb] bg-white px-6 py-6 shadow-[0_12px_40px_rgba(19,32,51,0.08)]">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#8d8377]">Fallback-eigenaar</p>
                    <h2 className="mt-3 text-[1.45rem] font-semibold tracking-[-0.03em] text-[#132033]">{fallbackOwnerName}</h2>
                    <p className="mt-3 text-sm leading-7 text-[#4f6175]">
                      Als geen manager is toegewezen, blijft eigenaarschap in deze bounded adminlaag terugvallen op Verisight beheer.
                    </p>
                  </div>

                  <div className="rounded-[24px] border border-[#e4d9cb] bg-white px-6 py-6 shadow-[0_12px_40px_rgba(19,32,51,0.08)]">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#8d8377]">Status van toewijzing</p>
                    <div className="mt-5 space-y-4 text-sm text-[#132033]">
                      <SummaryRow label="Toegewezen" value={`${teamRows.length - missingManagerCount} van ${teamRows.length}`} />
                      <SummaryRow label="Zonder eigenaar" value={`${missingManagerCount}`} />
                      <SummaryRow
                        label="Gemiddeld open per team"
                        value={
                          teamRows.length > 0
                            ? (teamRows.reduce((sum, team) => sum + team.openActions, 0) / teamRows.length).toFixed(1)
                            : '0.0'
                        }
                      />
                    </div>
                  </div>
                </section>
              </div>
            ) : null}

            {activeView === 'teams' ? (
              selectedTeam ? (
                <div className="grid gap-6 xl:grid-cols-[minmax(0,1.45fr),minmax(320px,0.75fr)]">
                  <section className="rounded-[24px] border border-[#e4d9cb] bg-white px-6 py-6 shadow-[0_12px_40px_rgba(19,32,51,0.08)]">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#8d8377]">Mijn open acties</p>
                        <h2 className="mt-2 text-[1.45rem] font-semibold tracking-[-0.03em] text-[#132033]">{selectedTeam.label}</h2>
                      </div>
                      <p className="text-sm text-[#736b60]">{teamOpenItems.length} actief</p>
                    </div>
                    <div className="mt-6 space-y-4">
                      {teamOpenItems.length === 0 ? (
                        <EmptyBlock text="Voor dit team staan nu geen open follow-through acties meer zichtbaar." />
                      ) : (
                        teamOpenItems.slice(0, 3).map((item) => (
                          <button
                            key={item.id}
                            type="button"
                            className="flex w-full items-center justify-between gap-4 rounded-[22px] border border-[#ebe1d5] bg-[#fffdfa] px-5 py-5 text-left transition hover:border-[#d7cab9]"
                            onClick={() => {
                              setSelectedItemId(item.id)
                              setActiveView('actions')
                            }}
                          >
                            <div className="min-w-0">
                              <div className="flex flex-wrap items-center gap-2 text-sm text-[#6d6458]">
                                <MiniTag>{item.sourceLabel}</MiniTag>
                                <span>{getPriorityMeta(item.priority).label}</span>
                              </div>
                              <p className="mt-3 text-[1.08rem] font-semibold tracking-[-0.02em] text-[#132033]">{item.title}</p>
                              <p className="mt-2 text-sm text-[#5d6f84]">
                                Review {item.reviewDateLabel} - Cadens {item.reviewRhythm}
                              </p>
                            </div>
                            <StatusPill status={item.status} />
                          </button>
                        ))
                      )}
                    </div>
                  </section>

                  <section className="space-y-6">
                    <div className="rounded-[24px] bg-[#182231] px-6 py-6 text-white shadow-[0_18px_50px_rgba(19,32,51,0.18)]">
                      <div className="flex items-center gap-4">
                        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white/8 text-xl font-semibold">
                          {getInitials(selectedTeam.currentManagerName ?? fallbackOwnerName)}
                        </div>
                        <div>
                          <p className="text-[1.4rem] font-semibold tracking-[-0.03em]">
                            {selectedTeam.currentManagerName ?? fallbackOwnerName}
                          </p>
                          <p className="mt-1 text-sm text-white/58">Manager - {selectedTeam.label}</p>
                        </div>
                      </div>
                      <div className="mt-6 grid grid-cols-3 gap-4">
                        <DarkMetric label="Open" value={`${teamOpenItems.length}`} accent="text-white" />
                        <DarkMetric label="Review&lt;7d" value={`${selectedTeam.reviewSoonCount}`} accent="text-[#ffb16e]" />
                        <DarkMetric
                          label="Geblokkeerd"
                          value={`${teamOpenItems.filter((item) => item.status === 'geblokkeerd').length}`}
                          accent="text-white"
                        />
                      </div>
                    </div>

                    <div className="rounded-[24px] border border-[#e4d9cb] bg-white px-6 py-6 shadow-[0_12px_40px_rgba(19,32,51,0.08)]">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#8d8377]">Te bespreken deze week</p>
                      <div className="mt-4 space-y-4">
                        {teamReviewItems.length === 0 ? (
                          <EmptyBlock text="Geen reviews meer gepland voor dit team in de huidige selectie." />
                        ) : (
                          teamReviewItems.map((item) => (
                            <button
                              key={item.id}
                              type="button"
                              className="w-full text-left"
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
                  Koppel een concrete vervolgstap aan een Verisight-signaal of bestaand dossier binnen de bounded adminlaag.
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

function MetricCard({
  label,
  value,
  subcopy,
  accent,
}: {
  label: string
  value: string
  subcopy: string
  accent: 'slate' | 'amber' | 'red' | 'teal' | 'green'
}) {
  const accentClass =
    accent === 'amber'
      ? 'before:bg-[#ff9b4a]'
      : accent === 'red'
        ? 'before:bg-[#ef6e64]'
        : accent === 'teal'
          ? 'before:bg-[#70b7aa]'
          : accent === 'green'
            ? 'before:bg-[#77b78d]'
            : 'before:bg-[#d6cdc2]'

  return (
    <div className={`relative overflow-hidden rounded-[24px] border border-[#e4d9cb] bg-white px-5 py-5 shadow-[0_12px_40px_rgba(19,32,51,0.08)] before:absolute before:inset-y-0 before:left-0 before:w-1 ${accentClass}`}>
      <p className="pl-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#7d7368]">{label}</p>
      <p className="dash-number mt-3 pl-3 text-[2.2rem] font-semibold tracking-[-0.05em] text-[#132033]">{value}</p>
      <p className="mt-1 pl-3 text-sm text-[#6d6458]">{subcopy}</p>
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
    <section className="rounded-[24px] border border-[#e4d9cb] bg-white px-6 py-6 shadow-[0_12px_40px_rgba(19,32,51,0.08)]">
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
              <div className="min-w-[70px] rounded-[18px] bg-[#fbf3ef] px-3 py-3 text-center text-[#d2574b]">
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

function AvatarBadge({ label }: { label: string | null }) {
  return (
    <div className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[#182231] text-xs font-semibold text-white">
      {getInitials(label)}
    </div>
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

function EmptyBlock({ text }: { text: string }) {
  return (
    <div className="rounded-[20px] border border-dashed border-[#ddd3c7] bg-[#fbf8f4] px-5 py-5 text-sm leading-7 text-[#5d6f84]">
      {text}
    </div>
  )
}

function EmptySection({ title, body }: { title: string; body: string }) {
  return (
    <section className="rounded-[24px] border border-[#e4d9cb] bg-white px-6 py-10 text-center shadow-[0_12px_40px_rgba(19,32,51,0.08)]">
      <h2 className="text-[1.45rem] font-semibold tracking-[-0.03em] text-[#132033]">{title}</h2>
      <p className="mx-auto mt-3 max-w-2xl text-sm leading-7 text-[#5d6f84]">{body}</p>
    </section>
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

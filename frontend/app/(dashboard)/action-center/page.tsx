import { redirect } from 'next/navigation'
import { ActionCenterPreview } from '@/components/dashboard/action-center-preview'
import { getActionCenterPageData } from '@/lib/action-center-page-data'
import { createClient } from '@/lib/supabase/server'
import { loadSuiteAccessContext } from '@/lib/suite-access-server'

function getDisplayName(email: string | null | undefined) {
  if (!email) return 'Verisight gebruiker'
  const localPart = email.split('@')[0] ?? 'verisight-gebruiker'
  return localPart
    .split(/[._-]/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}

export default async function ActionCenterPage({
  searchParams,
}: {
  searchParams?: Promise<{ focus?: string; source?: string }>
}) {
  const params = (await searchParams) ?? {}
  const focusItemId = typeof params.focus === 'string' ? params.focus : null
  const source = typeof params.source === 'string' ? params.source : null
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const {
    context,
    orgMemberships,
    workspaceMemberships: currentUserWorkspaceMemberships,
  } = await loadSuiteAccessContext(supabase, user.id)

  if (!context.canViewActionCenter) {
    redirect('/dashboard')
  }

  const orgIds = [...new Set([...context.organizationIds, ...context.workspaceOrgIds])]

  if (orgIds.length === 0 && !context.isVerisightAdmin) {
    redirect('/dashboard')
  }

  const { items, summary, ownerOptions, managerOptions, itemHrefs } = await getActionCenterPageData({
    context,
    orgMemberships,
    currentUserWorkspaceMemberships,
  })

  const initialSelectedItemId =
    focusItemId
      ? (items.find((item) => item.id === focusItemId)?.id ??
        items.find((item) => item.coreSemantics.route.campaignId === focusItemId)?.id ??
        null)
      : null
  const workspaceSubtitle =
    source === 'campaign-detail'
      ? 'Geopend vanuit campaign detail: hier worden eigenaarschap, eerste managerstap en reviewritme expliciet.'
      : summary.productCount > 0
        ? `Live opvolging over ${summary.productCount} product${summary.productCount === 1 ? '' : 'en'}`
        : 'Live opvolging'

  if (items.length === 0) {
    return (
      <div className="rounded-[30px] border border-[color:var(--dashboard-frame-border)] bg-[color:var(--dashboard-surface)] px-7 py-8 shadow-[0_18px_48px_rgba(19,32,51,0.08)]">
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[color:var(--dashboard-muted)]">
          Action Center
        </p>
        <h1 className="mt-3 text-[2.2rem] font-semibold tracking-[-0.055em] text-[color:var(--dashboard-ink)]">
          Nog geen live opvolging zichtbaar
        </h1>
        <p className="mt-4 max-w-3xl text-[1rem] leading-8 text-[color:var(--dashboard-text)]">
          Zodra er actieve campagnes, open opvolging of bestaande dossiers voor jouw organisaties of
          afdelingen zijn, opent deze module automatisch.
        </p>
        <div className="mt-7 grid gap-4 border-t border-[color:var(--dashboard-frame-border)] pt-6 xl:grid-cols-[minmax(0,1.3fr),minmax(260px,0.7fr)]">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[color:var(--dashboard-muted)]">
              Wat hier straks landt
            </p>
            <p className="mt-3 text-sm leading-7 text-[color:var(--dashboard-text)]">
              Samenvatting, reviewritme en eigenaarschap verschijnen hier pas als er echt iets op te volgen is.
              Daardoor blijft Action Center rustig en direct bruikbaar.
            </p>
          </div>
          <div className="rounded-[22px] border border-[color:var(--dashboard-frame-border)] bg-[color:var(--dashboard-muted-surface)] px-5 py-5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[color:var(--dashboard-muted)]">
              Volgende stap
            </p>
            <p className="mt-3 text-sm leading-7 text-[color:var(--dashboard-text)]">
              Wanneer de eerste opvolging live staat, zie je hier direct wat aandacht vraagt, wie eigenaar is
              en wanneer review volgt.
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <ActionCenterPreview
      initialItems={items}
      initialSelectedItemId={initialSelectedItemId}
      initialView="overview"
      fallbackOwnerName={getDisplayName(user.email)}
      ownerOptions={ownerOptions}
      managerOptions={managerOptions}
      canAssignManagers={context.canManageActionCenterAssignments}
      managerAssignmentEndpoint="/api/action-center/workspace-members"
      canRespondToRequests={context.canUpdateActionCenter}
      managerResponseEndpoint="/api/action-center-manager-responses"
      canCloseRoutes={context.canManageActionCenterAssignments}
      routeCloseoutEndpoint="/api/action-center-route-closeouts"
      routeFollowUpEndpoint="/api/action-center-route-follow-ups"
      currentUserId={user.id}
      workbenchHref={context.canViewInsights ? '/dashboard' : '/action-center'}
      workbenchLabel={context.canViewInsights ? 'Open broncampagne' : 'Blijf in Action Center'}
      workspaceName={getDisplayName(user.email)}
      workspaceSubtitle={workspaceSubtitle}
      readOnly
      itemHrefs={itemHrefs}
      hideSidebar
      boundedOverviewOnly
    />
  )
}

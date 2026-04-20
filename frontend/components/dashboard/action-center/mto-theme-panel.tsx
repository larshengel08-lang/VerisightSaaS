import { MtoPriorityThemeGrid } from './mto-priority-theme-grid'
import type { MtoActionCenterThemeCard } from '@/lib/action-center/mto-cockpit'
import type { ManagementActionDepartmentOwnerDefault } from '@/lib/management-actions'

interface Props {
  themeCards: MtoActionCenterThemeCard[]
  organizationId: string
  campaignId: string
  ownerDefaults: ManagementActionDepartmentOwnerDefault[]
  canManageCampaign?: boolean
  onOpenTheme?: (themeKey: string) => void
}

export function MtoThemePanel({
  themeCards,
  onOpenTheme,
}: Props) {
  if (themeCards.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-4 text-sm leading-6 text-slate-600">
        Nog geen themakaarten beschikbaar. De afdelingscockpit opent pas verder zodra er veilige MTO-afdelingsdata staat.
      </div>
    )
  }

  return (
    <MtoPriorityThemeGrid
      themes={themeCards}
      onOpenTheme={onOpenTheme ?? (() => {})}
    />
  )
}

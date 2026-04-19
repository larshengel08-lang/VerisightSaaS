import { MtoActionComposer } from './mto-action-composer'
import type { MtoActionCenterThemeCard } from '@/lib/action-center/mto-cockpit'
import type { ManagementActionDepartmentOwnerDefault } from '@/lib/management-actions'

interface Props {
  themeCards: MtoActionCenterThemeCard[]
  organizationId: string
  campaignId: string
  ownerDefaults: ManagementActionDepartmentOwnerDefault[]
  canManageCampaign?: boolean
}

export function MtoThemePanel({
  themeCards,
  organizationId,
  campaignId,
  ownerDefaults,
  canManageCampaign = true,
}: Props) {
  if (themeCards.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-4 text-sm leading-6 text-slate-600">
        Nog geen themakaarten beschikbaar. De afdelingscockpit opent pas verder zodra er veilige MTO-afdelingsdata staat.
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {themeCards.map((card) => {
        const ownerDefault = ownerDefaults.find((entry) => entry.department === card.departmentLabel) ?? null
        const healthToneClass =
          card.actionHealth.tone === 'amber'
            ? 'border-amber-200 bg-amber-50 text-amber-900'
            : card.actionHealth.tone === 'blue'
              ? 'border-blue-200 bg-blue-50 text-blue-800'
              : 'border-slate-200 bg-slate-100 text-slate-700'

        return (
          <div key={`${card.departmentLabel}-${card.factorKey}`} className="rounded-[22px] border border-slate-200 bg-slate-50 p-4">
            <div className="grid gap-4 xl:grid-cols-[minmax(0,1.2fr),minmax(280px,0.8fr)]">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                  {card.departmentLabel} / {card.factorLabel}
                </p>
                <h3 className="mt-2 text-base font-semibold text-slate-950">{card.departmentRead.title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-700">{card.departmentRead.decision}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${healthToneClass}`}>
                    {card.actionHealth.label}
                  </span>
                  {card.actionHealth.reviewDueCount > 0 ? (
                    <span className="inline-flex rounded-full border border-amber-200 bg-white px-3 py-1 text-xs font-semibold text-amber-900">
                      {card.actionHealth.reviewDueCount} review nu
                    </span>
                  ) : null}
                  {card.actionHealth.blockedCount > 0 ? (
                    <span className="inline-flex rounded-full border border-amber-200 bg-white px-3 py-1 text-xs font-semibold text-amber-900">
                      {card.actionHealth.blockedCount} blokkade
                    </span>
                  ) : null}
                  {card.actionHealth.quietCount > 0 ? (
                    <span className="inline-flex rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-700">
                      {card.actionHealth.quietCount} stil spoor
                    </span>
                  ) : null}
                </div>
              </div>
              {canManageCampaign ? (
                <MtoActionComposer
                  card={card}
                  organizationId={organizationId}
                  campaignId={campaignId}
                  ownerDefault={ownerDefault}
                />
              ) : null}
            </div>
          </div>
        )
      })}
    </div>
  )
}

import { DashboardPanel } from '@/components/dashboard/dashboard-primitives'
import type { MtoActionCenterViewModel } from '@/lib/action-center/mto-cockpit'

interface Props {
  overview: MtoActionCenterViewModel['departmentOverview']
}

export function MtoDepartmentOverview({ overview }: Props) {
  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <DashboardPanel
        eyebrow="Afdelingsbeeld"
        title="Open acties"
        value={`${overview.actionCount}`}
        body="Alle acties die nu zichtbaar in deze bounded MTO-cockpit lopen."
        tone={overview.actionCount > 0 ? 'blue' : 'slate'}
      />
      <DashboardPanel
        eyebrow="Reviewdruk"
        title="Acties met reviewmoment"
        value={`${overview.reviewCount}`}
        body="Gebruik dit om te zien welke acties nu expliciet een managementbesluit of effectcheck vragen."
        tone={overview.reviewCount > 0 ? 'amber' : 'slate'}
      />
      <DashboardPanel
        eyebrow="Topthema's"
        title={overview.topThemes[0]?.factorLabel ?? 'Nog geen thema open'}
        body={
          overview.topThemes.length > 0
            ? `Bovenin staan de eerste ${overview.topThemes.length} thema's die nu als cockpitprioriteit zichtbaar zijn.`
            : 'Er is nog geen veilig themabeeld beschikbaar om deze cockpit verder te openen.'
        }
        tone={overview.topThemes.length > 0 ? 'emerald' : 'slate'}
      />
    </div>
  )
}

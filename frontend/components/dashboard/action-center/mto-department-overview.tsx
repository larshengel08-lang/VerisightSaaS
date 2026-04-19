import { DashboardPanel } from '@/components/dashboard/dashboard-primitives'
import type { MtoActionCenterViewModel } from '@/lib/action-center/mto-cockpit'

interface Props {
  overview: MtoActionCenterViewModel['departmentOverview']
}

export function MtoDepartmentOverview({ overview }: Props) {
  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <DashboardPanel
        eyebrow="Afdelingsfocus"
        title={overview.primaryTheme?.factorLabel ?? 'Nog geen thema open'}
        body={
          overview.primaryTheme
            ? `${overview.primaryTheme.departmentLabel} vraagt nu als eerste managementaandacht in deze cockpit.`
            : 'Er is nog geen veilig themabeeld beschikbaar om deze cockpit verder te openen.'
        }
        tone={overview.primaryTheme ? overview.primaryTheme.actionHealth.tone : 'slate'}
      />
      <DashboardPanel
        eyebrow="Actiegezondheid"
        title={`${overview.actionCount} actief`}
        body={
          overview.urgentThemeCount > 0
            ? `${overview.urgentThemeCount} thema(s) vragen nu follow-through aandacht of reviewdruk.`
            : 'De zichtbare acties ogen nu beheerst, zonder directe extra follow-through druk.'
        }
        tone={overview.urgentThemeCount > 0 ? 'amber' : overview.actionCount > 0 ? 'blue' : 'slate'}
      />
      <DashboardPanel
        eyebrow="Reviewdruk"
        title={`${overview.reviewCount} reviewmoment(en)`}
        body={
          overview.topThemes.length > 0
            ? `De cockpit prioriteert nu ${overview.topThemes.length} thema's expliciet als managementleesroute.`
            : 'Er is nog geen veilig themabeeld beschikbaar om reviewdruk verder te openen.'
        }
        tone={overview.reviewCount > 0 ? 'amber' : overview.topThemes.length > 0 ? 'emerald' : 'slate'}
      />
    </div>
  )
}

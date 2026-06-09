'use client'

import { DashboardPanel, DashboardSection } from '@/components/dashboard/dashboard-primitives'
import type { ReviewMomentGovernanceCounts } from '@/lib/action-center-review-moments'

export function ReviewMomentGovernanceSection({
  counts,
}: {
  counts: ReviewMomentGovernanceCounts
}) {
  if (counts.overdue + counts.missingOutcome + counts.missingScope + counts.missingManager === 0) {
    return null
  }

  return (
    <DashboardSection
      id="review-governance"
      surface="ops"
      eyebrow="Governance"
      title="Reviewgovernance"
      description="Reviewmomenten blijven alleen bruikbaar als ze gekoppeld zijn aan een scope, manager of eigenaar en geldige opvolging."
    >
      <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-4">
        {counts.overdue > 0 ? (
          <DashboardPanel
            surface="ops"
            eyebrow="Achterstallig"
            title={`${counts.overdue} open`}
            body="Momenten zonder actuele status-update die de geplande datum met meer dan 48 uur hebben overschreden."
            tone="amber"
          />
        ) : null}
        {counts.missingOutcome > 0 ? (
          <DashboardPanel
            surface="ops"
            eyebrow="Uitkomst ontbreekt"
            title={`${counts.missingOutcome} open`}
            body="Reviews die wel geopend zijn maar waar geen definitieve uitkomstvlag is gezet."
            tone="slate"
          />
        ) : null}
        {counts.missingScope > 0 ? (
          <DashboardPanel
            surface="ops"
            eyebrow="Scope ontbreekt"
            title={`${counts.missingScope} open`}
            body="Momenten zonder koppeling aan een organisatorische eenheid of cluster."
            tone="slate"
          />
        ) : null}
        {counts.missingManager > 0 ? (
          <DashboardPanel
            surface="ops"
            eyebrow="Manager ontbreekt"
            title={`${counts.missingManager} open`}
            body="Reviewmomenten zonder actieve eigenaar."
            tone="slate"
          />
        ) : null}
      </div>
    </DashboardSection>
  )
}

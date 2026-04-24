import { DashboardSection } from '@/components/dashboard/dashboard-primitives'

export default function DashboardHomeLoading() {
  return (
    <div className="space-y-6" aria-busy="true">
      <DashboardSection eyebrow="Laden" title="Campagneoverzicht wordt opgebouwd">
        <div className="grid gap-4 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="h-32 animate-pulse rounded-[28px] border border-[color:var(--dashboard-frame-border)] bg-[color:var(--dashboard-soft)]"
            />
          ))}
        </div>
      </DashboardSection>
      <DashboardSection eyebrow="Laden" title="Statuscompositie laden">
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, index) => (
            <div
              key={index}
              className="h-36 animate-pulse rounded-[28px] border border-[color:var(--dashboard-frame-border)] bg-[color:var(--dashboard-surface)]"
            />
          ))}
        </div>
      </DashboardSection>
    </div>
  )
}

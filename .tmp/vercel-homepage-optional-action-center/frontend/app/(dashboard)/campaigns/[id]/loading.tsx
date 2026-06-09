import { DashboardSection } from '@/components/dashboard/dashboard-primitives'

export default function CampaignLoading() {
  return (
    <div className="space-y-6" aria-busy="true">
      <div className="h-5 w-44 animate-pulse rounded-full bg-[color:var(--dashboard-soft)]" />
      <div className="h-56 animate-pulse rounded-[32px] border border-[color:var(--dashboard-frame-border)] bg-[color:var(--dashboard-surface)]" />
      <DashboardSection eyebrow="Laden" title="Campaign state wordt opgebouwd">
        <div className="grid gap-4 lg:grid-cols-2">
          {Array.from({ length: 2 }).map((_, index) => (
            <div
              key={index}
              className="h-40 animate-pulse rounded-[28px] border border-[color:var(--dashboard-frame-border)] bg-[color:var(--dashboard-soft)]"
            />
          ))}
        </div>
      </DashboardSection>
    </div>
  )
}

import type { CampaignTimeline as CampaignTimelineData } from '@/lib/dashboard/campaign-timeline'

interface Props {
  timeline: CampaignTimelineData
  /** Vooruitblik in de wizard: gedimd, want er is nog niets gebeurd. */
  dimmed?: boolean
}

export function CampaignTimeline({ timeline, dimmed = false }: Props) {
  return (
    <div className={dimmed ? 'opacity-60' : undefined}>
      <ol className="flex flex-col gap-4 sm:flex-row sm:gap-0">
        {timeline.items.map((item, index) => (
          <li key={item.key} className="relative flex-1 pl-4">
            <span
              className={`absolute left-0 top-[5px] h-2 w-2 rounded-full ${item.done ? 'bg-[#0D1B2A]' : 'bg-[color:var(--dashboard-soft)]'}`}
            />
            {index < timeline.items.length - 1 ? (
              <span className="absolute left-2 right-0 top-[8px] hidden h-px bg-[color:var(--dashboard-frame-border)] sm:block" />
            ) : null}
            <p className={`text-xs font-medium ${item.done ? 'text-[color:var(--dashboard-ink)]' : 'text-[color:var(--dashboard-muted)]'}`}>
              {item.label}
            </p>
            <p className="mt-0.5 text-[11px] text-[color:var(--dashboard-muted)]">{item.value}</p>
          </li>
        ))}
      </ol>
      <p className="mt-3 text-[11px] text-[color:var(--dashboard-muted)]">{timeline.reportNote}</p>
    </div>
  )
}

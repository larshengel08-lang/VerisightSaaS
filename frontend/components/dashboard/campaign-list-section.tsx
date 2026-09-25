import Link from 'next/link'
import type { CampaignListItem } from '@/lib/dashboard/campaign-list'
import type { CampaignStatusKey } from '@/lib/dashboard/campaign-status'

// "Loopt" gebruikt het donkere amber #B07A10: --dashboard-accent-strong is
// merk-amber #E8A020 en haalt op de lichte pil geen leesbaar contrast.
const STATUS_PILL: Record<CampaignStatusKey, string> = {
  setup: 'border-dashed border-[color:var(--dashboard-frame-border)] text-[color:var(--dashboard-muted)]',
  running: 'border-[color:var(--dashboard-accent-soft-border)] bg-[color:var(--dashboard-accent-soft)] text-[#B07A10]',
  action: 'border-[#e7d7af] bg-[#FBF4DF] text-[#7A5410]',
  closed_no_report: 'border-[color:var(--dashboard-frame-border)] text-[color:var(--dashboard-muted)]',
  report_ready: 'border-[color:var(--dashboard-ink)] bg-[color:var(--dashboard-ink)] text-white',
  data_purged: 'border-dashed border-[color:var(--dashboard-frame-border)] text-[color:var(--dashboard-muted)]',
}

/**
 * Alle metingen van de organisatie (spec 2026-09-16 par. 6.1), onder de
 * hoofdkaart, zodra er meer dan één is. Servercomponent: geen hooks, alleen
 * links; de status komt uit dezelfde vocabulaire als /reports.
 */
export function CampaignListSection({ items }: { items: CampaignListItem[] }) {
  return (
    <section aria-labelledby="alle-metingen" className="rounded-[22px] border border-[color:var(--dashboard-frame-border)] bg-white px-6 py-6">
      <div className="flex items-baseline justify-between gap-4">
        <h2 id="alle-metingen" className="text-lg font-semibold tracking-[-0.02em] text-[color:var(--dashboard-ink)]">
          Al je metingen
        </h2>
        <p className="text-[0.72rem] font-semibold uppercase tracking-[0.2em] text-[color:var(--dashboard-muted)]">
          {items.length} {items.length === 1 ? 'meting' : 'metingen'}
        </p>
      </div>
      <ul className="mt-4 divide-y divide-[color:var(--dashboard-frame-border)]">
        {items.map((item) => (
          <li key={item.campaignId} className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 py-3">
            <div className="min-w-0">
              <Link
                href={item.href}
                className="block truncate text-sm font-semibold text-[color:var(--dashboard-ink)] underline-offset-4 hover:underline"
              >
                {item.name}
              </Link>
              <p className="mt-0.5 text-xs text-[color:var(--dashboard-muted)]">
                {item.scanLabel}
                {item.isMain ? ' · Staat hierboven' : ''}
              </p>
            </div>
            <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${STATUS_PILL[item.statusKey]}`}>
              {item.statusLabel}
            </span>
          </li>
        ))}
      </ul>
    </section>
  )
}

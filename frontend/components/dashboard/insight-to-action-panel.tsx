import { DashboardPanel, DashboardTimeline } from '@/components/dashboard/dashboard-primitives'
import type { InsightToActionBlock } from '@/lib/products/shared/insight-to-action'

export function InsightToActionPanel({ block }: { block: InsightToActionBlock }) {
  return (
    <div className="rounded-[24px] border border-[color:var(--border)] bg-white p-4 shadow-[0_10px_30px_rgba(19,32,51,0.05)] sm:p-5">
      <div className="border-b border-[color:var(--border)]/80 pb-4">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#234B57]">Insight-to-action generator</p>
        <h3 className="mt-2 text-base font-semibold text-[color:var(--ink)]">{block.title}</h3>
        <p className="mt-2 text-sm leading-6 text-[color:var(--text)]">{block.intro}</p>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        {block.managementPriorities.map((item, index) => (
          <DashboardPanel
            key={item.title}
            eyebrow={`Managementprioriteit ${index + 1}`}
            title={item.title}
            body={item.body}
            tone={index === 1 ? 'amber' : index === 2 ? 'emerald' : 'blue'}
          />
        ))}
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-[minmax(0,1.1fr),minmax(0,0.9fr)]">
        <div className="rounded-[22px] border border-[#d6e4e8] bg-[#f3f8f8] p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#234B57]">5 verificatievragen</p>
          <ul className="mt-3 space-y-2">
            {block.verificationQuestions.map((question) => (
              <li key={question} className="flex gap-2 text-sm leading-6 text-[color:var(--text)]">
                <span className="text-[color:var(--muted)]">&bull;</span>
                <span>{question}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-[22px] border border-[#d2e6e0] bg-[#eef7f4] p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#3C8D8A]">3 mogelijke eerste acties</p>
          <div className="mt-3 space-y-3">
            {block.possibleFirstActions.map((action) => (
              <div key={action.title} className="rounded-2xl border border-white/80 bg-white/80 p-3">
                <p className="text-sm font-semibold text-[color:var(--ink)]">{action.title}</p>
                <p className="mt-1 text-sm leading-6 text-[color:var(--text)]">{action.body}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-4">
        <DashboardTimeline
          title="30-60-90 follow-up"
          description="Lees dit als bounded reviewritme: eerst expliciteren, daarna reviewen en pas dan herwegen."
          items={block.followUp30_60_90.map((item) => ({
            title: `${item.window} · ${item.title}`,
            body: item.body,
            tone: item.window === '60 dagen' ? 'amber' : item.window === '90 dagen' ? 'emerald' : 'blue',
          }))}
        />
      </div>

      <div className="mt-4 rounded-[20px] border border-[#eadfbe] bg-[#faf6ea] px-4 py-3">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#8C6B1F]">Leesgrens</p>
        <p className="mt-2 text-sm leading-6 text-[color:var(--text)]">{block.guardrailNote}</p>
      </div>
    </div>
  )
}

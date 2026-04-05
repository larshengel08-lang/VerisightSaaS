import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import type { CampaignStats } from '@/lib/types'
import { RiskBadge } from '@/components/ui/risk-badge'

export default async function DashboardHomePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: stats } = await supabase
    .from('campaign_stats')
    .select('*')
    .order('created_at', { ascending: false })

  const campaigns = (stats ?? []) as CampaignStats[]

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Campaigns</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Overzicht van alle actieve en gesloten surveys
          </p>
        </div>
        <Link
          href="/beheer"
          className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
        >
          + Nieuwe campaign
        </Link>
      </div>

      {campaigns.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {campaigns.map(c => (
            <CampaignCard key={c.campaign_id} campaign={c} />
          ))}
        </div>
      )}
    </div>
  )
}

function CampaignCard({ campaign: c }: { campaign: CampaignStats }) {
  const scanLabel = c.scan_type === 'exit' ? 'ExitScan' : 'RetentieScan'
  const completionPct = c.completion_rate_pct ?? 0
  const avgRisk = c.avg_risk_score

  return (
    <Link
      href={`/campaigns/${c.campaign_id}`}
      className="block bg-white rounded-xl border border-gray-200 p-5 hover:border-blue-300 hover:shadow-md transition-all group"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <span className="inline-block text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded mb-1">
            {scanLabel}
          </span>
          <h2 className="text-sm font-semibold text-gray-900 group-hover:text-blue-600 transition-colors truncate">
            {c.campaign_name}
          </h2>
        </div>
        <span className={`ml-2 w-2 h-2 rounded-full flex-shrink-0 mt-1 ${c.is_active ? 'bg-green-400' : 'bg-gray-300'}`} />
      </div>

      <div className="grid grid-cols-3 gap-2 mb-3">
        <KpiCell label="Uitgenodigd" value={c.total_invited} />
        <KpiCell label="Ingevuld" value={c.total_completed} />
        <KpiCell label="Respons" value={`${completionPct}%`} />
      </div>

      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden mb-3">
        <div
          className="h-full bg-blue-500 rounded-full"
          style={{ width: `${Math.min(completionPct, 100)}%` }}
        />
      </div>

      <div className="flex items-center justify-between">
        <span className="text-xs text-gray-500">Gem. risico</span>
        {avgRisk ? (
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-gray-900">
              {avgRisk.toFixed(1)}
              <span className="text-xs font-normal text-gray-400"> /10</span>
            </span>
            <RiskBadge score={avgRisk} />
          </div>
        ) : (
          <span className="text-xs text-gray-400">Nog geen data</span>
        )}
      </div>
    </Link>
  )
}

function KpiCell({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="text-center">
      <div className="text-lg font-bold text-gray-900">{value}</div>
      <div className="text-xs text-gray-400">{label}</div>
    </div>
  )
}

function EmptyState() {
  return (
    <div className="bg-white rounded-xl border border-dashed border-gray-300 p-12 text-center">
      <div className="text-4xl mb-3">📋</div>
      <h2 className="text-base font-semibold text-gray-700 mb-1">Nog geen campaigns</h2>
      <p className="text-sm text-gray-400 mb-4">
        Maak je eerste organisatie en campaign aan via Beheer.
      </p>
      <Link
        href="/beheer"
        className="inline-block bg-blue-600 text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
      >
        Naar Beheer
      </Link>
    </div>
  )
}

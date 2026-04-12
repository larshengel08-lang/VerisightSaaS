import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import type { CampaignStats } from '@/lib/types'
import { RiskBadge } from '@/components/ui/risk-badge'
import { PdfDownloadButton } from '@/app/(dashboard)/campaigns/[id]/pdf-download-button'

export default async function DashboardHomePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // isAdmin = alleen accounts met is_verisight_admin = true in profiles
  const { data: profile } = await supabase
    .from('profiles')
    .select('is_verisight_admin')
    .eq('id', user.id)
    .single()

  const isAdmin = profile?.is_verisight_admin === true

  const { data: stats } = await supabase
    .from('campaign_stats')
    .select('*')
    .order('created_at', { ascending: false })

  const campaigns = (stats ?? []) as CampaignStats[]

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Campagnes</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {isAdmin
              ? 'Overzicht van scans die jij beheert voor klantorganisaties'
              : 'Overzicht van actieve en gearchiveerde scans voor jouw organisatie'}
          </p>
        </div>
        {/* Alleen Verisight-beheerders kunnen een nieuwe campaign aanmaken */}
        {isAdmin && (
          <Link
            href="/beheer"
            className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
          >
            + Nieuwe campaign →
          </Link>
        )}
      </div>

      {campaigns.length === 0 ? (
        isAdmin ? <AdminEmptyState /> : <ViewerEmptyState />
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
    <div className="bg-white rounded-xl border border-gray-200 p-5 transition-all hover:border-blue-300 hover:shadow-md">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <span className="inline-block text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded mb-1">
            {scanLabel}
          </span>
          <h2 className="text-sm font-semibold text-gray-900 truncate">
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
        <span className="text-xs text-gray-500">Gem. frictiescore</span>
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

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-gray-100 pt-4">
        <Link
          href={`/campaigns/${c.campaign_id}`}
          className="text-sm font-semibold text-blue-600 hover:text-blue-700"
        >
          Open dashboard →
        </Link>
        <PdfDownloadButton campaignId={c.campaign_id} campaignName={c.campaign_name} />
      </div>
    </div>
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

// Lege staat voor Verisight-beheerders: stap-voor-stap setup
function AdminEmptyState() {
  return (
    <div className="bg-white rounded-xl border border-dashed border-gray-200 p-10">
      <div className="max-w-lg mx-auto">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-blue-50 rounded-2xl text-2xl mb-4">
            🚀
          </div>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Welkom bij Verisight</h2>
          <p className="text-sm text-gray-500">
            Richt eerst de organisatie en campaign in. Daarna lever je een respondentbestand aan en krijgt de
            klant toegang tot het dashboard.
          </p>
        </div>
        <div className="space-y-4 mb-8">
          <Step number={1} title="Maak een organisatie aan" description="Registreer de klantorganisatie en het HR-contactpunt." />
          <Step number={2} title="Maak een campaign aan" description="Kies ExitScan of RetentieScan en geef de campagne een naam." />
          <Step number={3} title="Importeer respondenten" description="Gebruik bij voorkeur een klantbestand met e-mailadressen en segmentvelden." />
        </div>
        <div className="text-center">
          <Link
            href="/beheer"
            className="inline-flex items-center gap-2 bg-blue-600 text-white text-sm font-semibold px-6 py-2.5 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Starten →
          </Link>
        </div>
      </div>
    </div>
  )
}

// Lege staat voor HR-klanten: wachten op Verisight-begeleider
function ViewerEmptyState() {
  return (
    <div className="bg-white rounded-xl border border-dashed border-gray-200 p-10">
      <div className="max-w-md mx-auto text-center">
        <div className="inline-flex items-center justify-center w-14 h-14 bg-blue-50 rounded-2xl text-2xl mb-4">
          ⏳
        </div>
        <h2 className="text-lg font-semibold text-gray-900 mb-2">
          Jouw ExitScan wordt opgezet
        </h2>
        <p className="text-sm text-gray-500 leading-relaxed mb-6">
          Verisight zet jouw campagne op, importeert het respondentbestand en verstuurt de uitnodigingen.
          Zodra de eerste responses binnenkomen, zie je hier automatisch jouw dashboard en rapportage.
        </p>
        <p className="text-xs text-gray-400">
          Vragen? Stuur een mail naar{' '}
          <a href="mailto:hallo@verisight.nl" className="text-blue-500 hover:underline">
            hallo@verisight.nl
          </a>
        </p>
      </div>
    </div>
  )
}

function Step({ number, title, description }: { number: number; title: string; description: string }) {
  return (
    <div className="flex gap-4 items-start">
      <div className="flex-shrink-0 w-7 h-7 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center">
        {number}
      </div>
      <div>
        <p className="text-sm font-semibold text-gray-800">{title}</p>
        <p className="text-xs text-gray-400 mt-0.5">{description}</p>
      </div>
    </div>
  )
}

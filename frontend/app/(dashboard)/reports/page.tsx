import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { PdfDownloadButton } from '@/app/(dashboard)/campaigns/[id]/pdf-download-button'
import type { CampaignStats } from '@/lib/types'

export default async function ReportsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: stats } = await supabase
    .from('campaign_stats')
    .select('*')
    .order('created_at', { ascending: false })

  const campaigns = (stats ?? []) as CampaignStats[]
  const reportableCampaigns = campaigns.filter(
    (c) => c.total_completed >= 10 || !c.is_active,
  )

  return (
    <div className="space-y-7">
      {/* Page header */}
      <div>
        <h1
          className="text-[1.35rem] font-semibold tracking-[-0.02em]"
          style={{ color: 'var(--dashboard-ink)' }}
        >
          Klaar voor het overleg.
        </h1>
        <p className="mt-1 text-sm" style={{ color: 'var(--dashboard-muted)' }}>
          Download het PDF-rapport als boardroom-waardige samenvatting van je ExitScan-data.
        </p>
      </div>

      {/* Reports list */}
      {reportableCampaigns.length === 0 ? (
        <div
          className="rounded-[var(--dashboard-radius-card)] px-5 py-10 text-center text-sm"
          style={{
            background: 'var(--dashboard-surface)',
            border: '1px solid var(--dashboard-frame-border)',
            color: 'var(--dashboard-muted)',
          }}
        >
          <p className="font-medium" style={{ color: 'var(--dashboard-ink)' }}>Nog geen rapporten beschikbaar</p>
          <p className="mt-2">
            Een rapport wordt beschikbaar zodra een campagne minimaal 10 ingevulde surveys heeft of is gesloten.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {reportableCampaigns.map((campaign) => (
            <div
              key={campaign.campaign_id}
              className="flex items-center justify-between gap-4 rounded-[var(--dashboard-radius-card)] px-5 py-4"
              style={{
                background: 'var(--dashboard-surface)',
                border: '1px solid var(--dashboard-frame-border)',
              }}
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold" style={{ color: 'var(--dashboard-ink)' }}>
                  {campaign.campaign_name}
                </p>
                <p className="mt-0.5 text-[0.78rem]" style={{ color: 'var(--dashboard-muted)' }}>
                  {campaign.total_completed} ingevuld
                  {!campaign.is_active ? ' · Gesloten' : ''}
                </p>
              </div>
              <PdfDownloadButton
                campaignId={campaign.campaign_id}
                campaignName={campaign.campaign_name}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

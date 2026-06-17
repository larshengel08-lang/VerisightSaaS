import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { type CampaignStats, type Organization } from '@/lib/types'
import { isDashboardReleaseReady } from '@/lib/response-activation'
import { ClosesAtForm } from './closes-at-form'

const SCAN_LABELS: Record<string, string> = {
  exit: 'Loep Vertrek',
  retention: 'Loep Behoud',
  onboarding: 'Loep Start',
  culture_assessment: 'Cultuurbeeld',
}

function isOrgNameSuspect(name: string | null | undefined): boolean {
  if (!name || name.trim().length === 0) return true
  const trimmed = name.trim()
  if (trimmed.length < 4) return true
  // Looks like a slug: only uppercase letters, underscores, hyphens (no lowercase or spaces)
  if (/^[A-Z0-9_-]+$/.test(trimmed)) return true
  return false
}

export default async function BeheerCampagnesPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('is_verisight_admin')
    .eq('id', user.id)
    .single()

  if (profile?.is_verisight_admin !== true) {
    redirect('/dashboard')
  }

  // Fetch all campaign_stats (admin sees all via RLS or admin bypass)
  const { data: statsRaw, error: statsError } = await supabase
    .from('campaign_stats')
    .select('*')
    .order('created_at', { ascending: false })

  if (statsError) {
    throw new Error(`Campagne-stats ophalen mislukt: ${statsError.message}`)
  }

  const stats = (statsRaw ?? []) as CampaignStats[]

  const orgIds = [...new Set(stats.map((s) => s.organization_id))]
  const { data: orgsRaw } = orgIds.length
    ? await supabase.from('organizations').select('id, name').in('id', orgIds)
    : { data: [] }

  const orgMap = new Map<string, string>(
    ((orgsRaw ?? []) as Pick<Organization, 'id' | 'name'>[]).map((org) => [org.id, org.name]),
  )

  const suspectCount = stats.filter((s) => isOrgNameSuspect(orgMap.get(s.organization_id))).length

  return (
    <div className="space-y-6">
      {/* Header */}
      <section className="rounded-[28px] border border-slate-200 bg-white px-6 py-6 shadow-[0_10px_30px_rgba(19,32,51,0.05)]">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Admin · Werkbank</p>
            <div className="flex items-center gap-3">
              <Link
                href="/beheer"
                className="text-sm font-semibold text-slate-400 transition hover:text-slate-600"
              >
                ← Beheer
              </Link>
            </div>
            <h1 className="text-3xl font-semibold tracking-[-0.04em] text-slate-950">Campagne-overzicht</h1>
            <p className="max-w-2xl text-sm leading-6 text-slate-600">
              Alle campagnes over alle organisaties. Inclusief respons, status en rapportdownload.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-600">
              {stats.length} campagne{stats.length === 1 ? '' : 's'}
            </span>
            {suspectCount > 0 ? (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-300 bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-800">
                {suspectCount} org-naam check
              </span>
            ) : null}
          </div>
        </div>
      </section>

      {/* Table */}
      {stats.length === 0 ? (
        <div className="rounded-[22px] border border-slate-200 bg-white px-6 py-10 text-center text-sm text-slate-500">
          Geen campagnes gevonden.
        </div>
      ) : (
        <section className="rounded-[22px] border border-slate-200 bg-white shadow-[0_8px_24px_rgba(19,32,51,0.04)]">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                  <th className="px-5 py-3 text-left">Organisatie</th>
                  <th className="px-5 py-3 text-left">Campagne</th>
                  <th className="px-5 py-3 text-left">Scan</th>
                  <th className="px-5 py-3 text-center">Status</th>
                  <th className="px-5 py-3 text-right">Respons</th>
                  <th className="px-5 py-3 text-left">Sluitdatum</th>
                  <th className="px-5 py-3 text-right">Rapport</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {stats.map((row) => {
                  const orgName = orgMap.get(row.organization_id) ?? null
                  const suspect = isOrgNameSuspect(orgName)
                  const pct = row.completion_rate_pct ?? 0
                  const reportReady = !row.is_active && isDashboardReleaseReady(row.total_completed, {
                    scanType: row.scan_type,
                    isActive: false,
                  })

                  return (
                    <tr key={row.campaign_id} className="hover:bg-slate-50/70">
                      {/* Organisatie */}
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2">
                          <span className={suspect ? 'text-slate-400' : 'font-medium text-slate-900'}>
                            {orgName ?? <span className="italic text-slate-400">ontbreekt</span>}
                          </span>
                          {suspect ? (
                            <span className="inline-flex items-center rounded-full border border-amber-300 bg-amber-50 px-1.5 py-0.5 text-[10px] font-semibold text-amber-800">
                              check naam
                            </span>
                          ) : null}
                        </div>
                      </td>

                      {/* Campagne */}
                      <td className="px-5 py-3">
                        <Link
                          href={`/campaigns/${row.campaign_id}`}
                          className="font-medium text-slate-900 underline-offset-2 hover:text-slate-950 hover:underline"
                        >
                          {row.campaign_name}
                        </Link>
                      </td>

                      {/* Scan */}
                      <td className="px-5 py-3 text-slate-600">
                        {SCAN_LABELS[row.scan_type] ?? row.scan_type}
                      </td>

                      {/* Status */}
                      <td className="px-5 py-3 text-center">
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${
                            row.is_active
                              ? 'bg-emerald-50 text-emerald-700'
                              : 'bg-slate-100 text-slate-500'
                          }`}
                        >
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${
                              row.is_active ? 'bg-emerald-600' : 'bg-slate-400'
                            }`}
                          />
                          {row.is_active ? 'Actief' : 'Gesloten'}
                        </span>
                      </td>

                      {/* Respons */}
                      <td className="px-5 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <div className="h-1.5 w-16 overflow-hidden rounded-full bg-slate-100">
                            <div
                              className={`h-full rounded-full ${
                                pct >= 60
                                  ? 'bg-emerald-500'
                                  : pct >= 30
                                    ? 'bg-amber-400'
                                    : 'bg-red-400'
                              }`}
                              style={{ width: `${Math.min(pct, 100)}%` }}
                            />
                          </div>
                          <span className="w-20 text-xs font-semibold tabular-nums text-slate-700">
                            {pct}% ({row.total_completed}/{row.total_invited ?? '—'})
                          </span>
                        </div>
                      </td>

                      {/* Sluitdatum */}
                      <td className="px-5 py-3">
                        <ClosesAtForm campaignId={row.campaign_id} currentValue={row.closes_at ?? null} />
                      </td>

                      {/* Rapport */}
                      <td className="px-5 py-3 text-right">
                        {reportReady ? (
                          <a
                            href={`/api/campaigns/${row.campaign_id}/report`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 rounded-full border border-amber-400 bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-900 transition hover:bg-amber-100"
                          >
                            ↓ PDF
                          </a>
                        ) : (
                          <span className="text-xs text-slate-300">—</span>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  )
}

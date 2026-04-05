import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { NewOrgForm } from '@/components/dashboard/new-org-form'
import { NewCampaignForm } from '@/components/dashboard/new-campaign-form'
import { AddRespondentsForm } from '@/components/dashboard/add-respondents-form'
import type { Organization, Campaign } from '@/lib/types'

export default async function BeheerPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Organisaties van huidige user
  const { data: memberships } = await supabase
    .from('org_members')
    .select('organizations(*)')
    .eq('user_id', user.id)

  const orgs = (memberships?.flatMap(m => m.organizations).filter(Boolean) ?? []) as Organization[]

  // Campaigns van al deze organisaties
  const orgIds = orgs.map(o => o.id)
  const { data: campaignsRaw } = orgIds.length
    ? await supabase
        .from('campaigns')
        .select('*')
        .in('organization_id', orgIds)
        .order('created_at', { ascending: false })
    : { data: [] }

  const campaigns = (campaignsRaw ?? []) as Campaign[]

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-1">Beheer</h1>
      <p className="text-sm text-gray-500 mb-8">
        Organisaties, campaigns en respondenten beheren
      </p>

      <div className="grid lg:grid-cols-2 gap-6">

        {/* Nieuwe organisatie */}
        <section className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-base font-semibold text-gray-900 mb-4">
            Nieuwe organisatie
          </h2>
          <NewOrgForm />
        </section>

        {/* Nieuwe campaign */}
        <section className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-base font-semibold text-gray-900 mb-4">
            Nieuwe campaign
          </h2>
          {orgs.length === 0 ? (
            <p className="text-sm text-gray-400">
              Maak eerst een organisatie aan.
            </p>
          ) : (
            <NewCampaignForm orgs={orgs} />
          )}
        </section>

        {/* Respondenten toevoegen */}
        <section className="bg-white rounded-xl border border-gray-200 p-6 lg:col-span-2">
          <h2 className="text-base font-semibold text-gray-900 mb-4">
            Respondenten toevoegen
          </h2>
          {campaigns.length === 0 ? (
            <p className="text-sm text-gray-400">
              Maak eerst een campaign aan.
            </p>
          ) : (
            <AddRespondentsForm campaigns={campaigns} />
          )}
        </section>

        {/* Bestaande campaigns tabel */}
        {campaigns.length > 0 && (
          <section className="bg-white rounded-xl border border-gray-200 p-6 lg:col-span-2">
            <h2 className="text-base font-semibold text-gray-900 mb-4">
              Bestaande campaigns
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left py-2 px-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">Naam</th>
                    <th className="text-left py-2 px-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">Type</th>
                    <th className="text-left py-2 px-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">Status</th>
                    <th className="text-left py-2 px-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">Aangemaakt</th>
                    <th className="text-right py-2 px-3 text-xs font-semibold text-gray-400 uppercase tracking-wide"></th>
                  </tr>
                </thead>
                <tbody>
                  {campaigns.map(c => (
                    <tr key={c.id} className="border-b border-gray-50 hover:bg-gray-50">
                      <td className="py-2 px-3 font-medium text-gray-800">{c.name}</td>
                      <td className="py-2 px-3 text-gray-500">
                        {c.scan_type === 'exit' ? 'ExitScan' : 'RetentieScan'}
                      </td>
                      <td className="py-2 px-3">
                        <span className={`text-xs font-medium ${c.is_active ? 'text-green-600' : 'text-gray-400'}`}>
                          {c.is_active ? '● Actief' : '○ Gesloten'}
                        </span>
                      </td>
                      <td className="py-2 px-3 text-gray-400 text-xs">
                        {new Date(c.created_at).toLocaleDateString('nl-NL')}
                      </td>
                      <td className="py-2 px-3 text-right">
                        <a
                          href={`/campaigns/${c.id}`}
                          className="text-xs text-blue-600 hover:underline"
                        >
                          Bekijken →
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}
      </div>
    </div>
  )
}

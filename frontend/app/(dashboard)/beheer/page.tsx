import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { NewOrgForm } from '@/components/dashboard/new-org-form'
import { NewCampaignForm } from '@/components/dashboard/new-campaign-form'
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

  // Bepaal welke stappen al klaar zijn voor de voortgangsindicator
  const step1Done = orgs.length > 0
  const step2Done = campaigns.length > 0

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-1">Setup</h1>
      <p className="text-sm text-gray-500 mb-6">
        Volg de stappen om een survey te starten.
      </p>

      {/* Voortgangsindicator */}
      <div className="flex items-center gap-2 mb-8">
        <StepBadge n={1} label="Organisatie" done={step1Done} />
        <div className="h-px w-6 bg-gray-200" />
        <StepBadge n={2} label="Campaign" done={step2Done} />
        <div className="h-px w-6 bg-gray-200" />
        <StepBadge n={3} label="Uitnodigen" done={false} />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">

        {/* Stap 1: Organisatie */}
        <section className={`bg-white rounded-xl border p-6 ${step1Done ? 'border-green-200' : 'border-gray-200'}`}>
          <SectionHeader n={1} title="Organisatie aanmaken" done={step1Done} />
          {step1Done ? (
            <div className="space-y-1">
              {orgs.map(o => (
                <div key={o.id} className="flex items-center gap-2 text-sm text-gray-700">
                  <span className="text-green-500">✓</span>
                  <span className="font-medium">{o.name}</span>
                  <span className="text-gray-400 text-xs">({o.slug})</span>
                </div>
              ))}
              <div className="pt-2 border-t border-gray-100 mt-2">
                <p className="text-xs text-gray-400 mb-2">Nog een organisatie toevoegen:</p>
                <NewOrgForm />
              </div>
            </div>
          ) : (
            <NewOrgForm />
          )}
        </section>

        {/* Stap 2: Campaign */}
        <section className={`bg-white rounded-xl border p-6 ${step2Done ? 'border-green-200' : 'border-gray-200'}`}>
          <SectionHeader n={2} title="Campaign aanmaken" done={step2Done} />
          {orgs.length === 0 ? (
            <LockedStep message="Maak eerst een organisatie aan (stap 1)." />
          ) : (
            <NewCampaignForm orgs={orgs} />
          )}
        </section>

        {/* Stap 3: Respondenten uitnodigen — per campaign */}
        <section className="bg-white rounded-xl border border-gray-200 p-6 lg:col-span-2">
          <SectionHeader n={3} title="Respondenten uitnodigen" done={false} />
          {campaigns.length === 0 ? (
            <LockedStep message="Maak eerst een campaign aan (stap 2)." />
          ) : (
            <div className="space-y-2">
              <p className="text-xs text-gray-500 mb-3">
                Ga naar een actieve campaign om respondenten toe te voegen en uitnodigingen te versturen.
              </p>
              {campaigns.filter(c => c.is_active).length === 0 && (
                <p className="text-xs text-amber-700 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2">
                  Geen actieve campaigns. Maak een nieuwe campaign aan via stap 2.
                </p>
              )}
              {campaigns.map(c => (
                <div key={c.id} className="flex items-center justify-between bg-gray-50 rounded-lg px-4 py-3 border border-gray-100">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">
                        {c.scan_type === 'exit' ? 'ExitScan' : 'RetentieScan'}
                      </span>
                      <span className={`text-xs font-medium ${c.is_active ? 'text-green-600' : 'text-gray-400'}`}>
                        {c.is_active ? '● Actief' : '○ Gesloten'}
                      </span>
                    </div>
                    <p className="text-sm font-medium text-gray-800 truncate">{c.name}</p>
                    <p className="text-xs text-gray-400">
                      Aangemaakt {new Date(c.created_at).toLocaleDateString('nl-NL', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </p>
                  </div>
                  <a
                    href={`/campaigns/${c.id}`}
                    className={`ml-4 flex-shrink-0 text-sm font-semibold px-3 py-1.5 rounded-lg transition-colors ${
                      c.is_active
                        ? 'bg-blue-600 hover:bg-blue-700 text-white'
                        : 'bg-gray-100 text-gray-400 cursor-default pointer-events-none'
                    }`}
                  >
                    {c.is_active ? 'Beheer →' : 'Gesloten'}
                  </a>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  )
}

function StepBadge({ n, label, done }: { n: number; label: string; done: boolean }) {
  return (
    <div className="flex items-center gap-1.5">
      <div className={`w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center flex-shrink-0
        ${done ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-500'}`}>
        {done ? '✓' : n}
      </div>
      <span className={`text-xs font-medium hidden sm:block ${done ? 'text-green-600' : 'text-gray-500'}`}>
        {label}
      </span>
    </div>
  )
}

function SectionHeader({ n, title, done }: { n: number; title: string; done: boolean }) {
  return (
    <div className="flex items-center gap-2 mb-4">
      <div className={`w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center flex-shrink-0
        ${done ? 'bg-green-500 text-white' : 'bg-blue-600 text-white'}`}>
        {done ? '✓' : n}
      </div>
      <h2 className="text-base font-semibold text-gray-900">{title}</h2>
    </div>
  )
}

function LockedStep({ message }: { message: string }) {
  return (
    <div className="flex items-center gap-2 text-sm text-gray-400 bg-gray-50 rounded-lg px-4 py-3">
      <span>🔒</span>
      <span>{message}</span>
    </div>
  )
}

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { NewOrgForm } from '@/components/dashboard/new-org-form'
import { NewCampaignForm } from '@/components/dashboard/new-campaign-form'
import { AddRespondentsForm } from '@/components/dashboard/add-respondents-form'
import { InviteClientUserForm } from '@/components/dashboard/invite-client-user-form'
import { ClientAccessList } from '@/components/dashboard/client-access-list'
import type { Organization, Campaign, OrgInvite } from '@/lib/types'

export default async function BeheerPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('is_verisight_admin')
    .eq('id', user.id)
    .single()

  if (profile?.is_verisight_admin !== true) {
    redirect('/dashboard')
  }

  const { data: memberships } = await supabase
    .from('org_members')
    .select('organizations(*)')
    .eq('user_id', user.id)

  const orgs = (memberships?.flatMap(membership => membership.organizations).filter(Boolean) ?? []) as Organization[]

  const orgIds = orgs.map(org => org.id)
  const { data: campaignsRaw } = orgIds.length
    ? await supabase
        .from('campaigns')
        .select('*')
        .in('organization_id', orgIds)
        .order('created_at', { ascending: false })
    : { data: [] }

  const campaigns = (campaignsRaw ?? []) as Campaign[]
  const campaignIds = campaigns.map(campaign => campaign.id)
  const { count: respondentCount } = campaignIds.length
    ? await supabase
        .from('respondents')
        .select('id', { count: 'exact', head: true })
        .in('campaign_id', campaignIds)
    : { count: 0 }

  const { count: clientAccessCount } = orgIds.length
    ? await supabase
        .from('org_members')
        .select('id', { count: 'exact', head: true })
        .in('org_id', orgIds)
        .neq('user_id', user.id)
    : { count: 0 }

  const { data: invitesRaw } = orgIds.length
    ? await supabase
        .from('org_invites')
        .select('id, org_id, email, full_name, role, invited_by, invited_at, accepted_at, organizations(id, name)')
        .in('org_id', orgIds)
        .order('accepted_at', { ascending: true, nullsFirst: true })
        .order('invited_at', { ascending: false })
    : { data: [] }

  const invites = (invitesRaw ?? []).map(invite => ({
    ...invite,
    organizations: Array.isArray(invite.organizations) ? invite.organizations[0] : invite.organizations,
  })) as OrgInvite[]
  const pendingInviteCount = invites.filter(invite => !invite.accepted_at).length

  const step1Done = orgs.length > 0
  const step2Done = campaigns.length > 0
  const step3Done = (respondentCount ?? 0) > 0
  const step4Done = (clientAccessCount ?? 0) > 0 || invites.length > 0

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-1">Setup</h1>
      <p className="text-sm text-gray-500 mb-6">
        Deze flow is voor Verisight-beheerders. Jij zet organisatie, campagne en respondenten op; de klant krijgt
        daarna toegang tot het eigen dashboard en rapport.
      </p>

      <div className="rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-blue-900 mb-6">
        <p className="font-semibold mb-1">Aanbevolen werkwijze</p>
        <p className="text-blue-800">
          Verisight maakt eerst de organisatie en de campagne aan. Daarna levert de klant een eenvoudig
          respondentbestand aan. Verisight controleert de import, verstuurt uitnodigingen en activeert vervolgens
          het dashboard voor de klantorganisatie.
        </p>
      </div>

      <div className="flex items-center gap-2 mb-8">
        <StepBadge n={1} label="Organisatie" done={step1Done} />
        <div className="h-px w-6 bg-gray-200" />
        <StepBadge n={2} label="Campaign" done={step2Done} />
        <div className="h-px w-6 bg-gray-200" />
        <StepBadge n={3} label="Import & uitnodigen" done={step3Done} />
        <div className="h-px w-6 bg-gray-200" />
        <StepBadge n={4} label="Klanttoegang" done={step4Done} />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <section className={`bg-white rounded-xl border p-6 ${step1Done ? 'border-green-200' : 'border-gray-200'}`}>
          <SectionHeader n={1} title="Organisatie aanmaken" done={step1Done} />
          {step1Done ? (
            <div className="space-y-1">
              {orgs.map(org => (
                <div key={org.id} className="flex items-center gap-2 text-sm text-gray-700">
                  <span className="text-green-500">✓</span>
                  <span className="font-medium">{org.name}</span>
                  <span className="text-gray-400 text-xs">({org.slug})</span>
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

        <section className={`bg-white rounded-xl border p-6 ${step2Done ? 'border-green-200' : 'border-gray-200'}`}>
          <SectionHeader n={2} title="Campaign aanmaken" done={step2Done} />
          {orgs.length === 0 ? (
            <LockedStep message="Maak eerst een organisatie aan (stap 1)." />
          ) : (
            <NewCampaignForm orgs={orgs} />
          )}
        </section>

        <section className={`bg-white rounded-xl border p-6 lg:col-span-2 ${step3Done ? 'border-green-200' : 'border-gray-200'}`}>
          <SectionHeader n={3} title="Respondenten importeren en uitnodigen" done={step3Done} />
          {campaigns.length === 0 ? (
            <LockedStep message="Maak eerst een campaign aan (stap 2)." />
          ) : (
            <div className="space-y-5">
              <p className="text-sm text-gray-500">
                Gebruik bij voorkeur een klantbestand met e-mailadressen en optionele segmentvelden. Dat maakt de
                setup sneller, netter en beter herhaalbaar dan losse handmatige invoer.
              </p>

              {campaigns.filter(campaign => campaign.is_active).length === 0 && (
                <p className="text-xs text-amber-700 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2">
                  Geen actieve campaigns. Maak een nieuwe campaign aan via stap 2.
                </p>
              )}

              <AddRespondentsForm campaigns={campaigns} />

              <div className="space-y-2 pt-2 border-t border-gray-100">
                <p className="text-xs font-semibold text-gray-500">Bestaande campaigns</p>
                {campaigns.map(campaign => (
                  <div
                    key={campaign.id}
                    className="flex items-center justify-between bg-gray-50 rounded-lg px-4 py-3 border border-gray-100"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">
                          {campaign.scan_type === 'exit' ? 'ExitScan' : 'RetentieScan'}
                        </span>
                        <span className={`text-xs font-medium ${campaign.is_active ? 'text-green-600' : 'text-gray-400'}`}>
                          {campaign.is_active ? '● Actief' : '○ Gesloten'}
                        </span>
                      </div>
                      <p className="text-sm font-medium text-gray-800 truncate">{campaign.name}</p>
                      <p className="text-xs text-gray-400">
                        Aangemaakt{' '}
                        {new Date(campaign.created_at).toLocaleDateString('nl-NL', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                        })}
                      </p>
                    </div>
                    <a
                      href={`/campaigns/${campaign.id}`}
                      className={`ml-4 flex-shrink-0 text-sm font-semibold px-3 py-1.5 rounded-lg transition-colors ${
                        campaign.is_active
                          ? 'bg-blue-600 hover:bg-blue-700 text-white'
                          : 'bg-gray-100 text-gray-400 cursor-default pointer-events-none'
                      }`}
                    >
                      {campaign.is_active ? 'Open dashboard →' : 'Gesloten'}
                    </a>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>

        <section className={`bg-white rounded-xl border p-6 lg:col-span-2 ${step4Done ? 'border-green-200' : 'border-gray-200'}`}>
          <SectionHeader n={4} title="Klantdashboard activeren" done={step4Done} />
          {orgs.length === 0 ? (
            <LockedStep message="Maak eerst een organisatie aan (stap 1)." />
          ) : (
            <div className="space-y-5">
              <p className="text-sm text-gray-500">
                Nodig daarna een klantgebruiker uit voor het dashboard. Nieuwe gebruikers ontvangen een activatiemail;
                bestaande accounts worden direct aan de organisatie gekoppeld.
              </p>
              <InviteClientUserForm orgs={orgs} />
              <div className="border-t border-gray-100 pt-4 space-y-3">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-xs font-semibold text-gray-500">Klanttoegang en uitnodigingen</p>
                  {pendingInviteCount > 0 && (
                    <span className="rounded-full bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-700">
                      {pendingInviteCount} wacht op activatie
                    </span>
                  )}
                </div>
                <ClientAccessList invites={invites} />
              </div>
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
      <div
        className={`w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center flex-shrink-0 ${
          done ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-500'
        }`}
      >
        {done ? '✓' : n}
      </div>
      <span className={`text-xs font-medium hidden sm:block ${done ? 'text-green-600' : 'text-gray-500'}`}>{label}</span>
    </div>
  )
}

function SectionHeader({ n, title, done }: { n: number; title: string; done: boolean }) {
  return (
    <div className="flex items-center gap-2 mb-4">
      <div
        className={`w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center flex-shrink-0 ${
          done ? 'bg-green-500 text-white' : 'bg-blue-600 text-white'
        }`}
      >
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

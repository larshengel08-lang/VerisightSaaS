import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { NewOrgForm } from '@/components/dashboard/new-org-form'
import { NewCampaignForm } from '@/components/dashboard/new-campaign-form'
import { AddRespondentsForm } from '@/components/dashboard/add-respondents-form'
import { InviteClientUserForm } from '@/components/dashboard/invite-client-user-form'
import { ClientAccessList } from '@/components/dashboard/client-access-list'
import { DeleteOrgButton } from '@/components/dashboard/delete-org-button'
import { ArchiveOrgButton } from '@/components/dashboard/archive-org-button'
import { hasCampaignAddOn, REPORT_ADD_ON_LABELS, type Organization, type Campaign, type OrgInvite, type CampaignStats } from '@/lib/types'

export default async function BeheerPage() {
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

  const { data: memberships } = await supabase
    .from('org_members')
    .select('organizations(*)')
    .eq('user_id', user.id)

  const orgs = (memberships?.flatMap(membership => membership.organizations).filter(Boolean) ?? []) as Organization[]
  const activeOrgs = orgs.filter(org => org.is_active)
  const archivedOrgs = orgs.filter(org => !org.is_active)

  const orgIds = orgs.map(org => org.id)
  const { data: campaignsRaw } = orgIds.length
    ? await supabase
        .from('campaigns')
        .select('*')
        .in('organization_id', orgIds)
        .order('created_at', { ascending: false })
    : { data: [] }

  const campaigns = (campaignsRaw ?? []) as Campaign[]
  const campaignCountByOrg = campaigns.reduce<Record<string, number>>((acc, campaign) => {
    acc[campaign.organization_id] = (acc[campaign.organization_id] ?? 0) + 1
    return acc
  }, {})

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

  // Campaign stats — voor statusoverzicht onderaan
  const { data: campaignStatsRaw } = orgIds.length
    ? await supabase
        .from('campaign_stats')
        .select('*')
        .in('organization_id', orgIds)
        .order('created_at', { ascending: false })
    : { data: [] }

  const campaignStats = (campaignStatsRaw ?? []) as CampaignStats[]

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

  const step1Done = activeOrgs.length > 0
  const step2Done = campaigns.some(campaign => campaign.is_active)
  const step3Done = (respondentCount ?? 0) > 0
  const step4Done = step2Done && ((clientAccessCount ?? 0) > 0 || invites.length > 0)

  return (
    <div>
      <h1 className="mb-1 text-2xl font-bold text-gray-900">Setup</h1>
      <p className="mb-6 text-sm text-gray-500">
        Deze flow is voor Verisight-beheerders. Jij zet organisatie, campaign en respondenten op; de klant krijgt
        daarna toegang tot het eigen dashboard en rapport.
      </p>

      <div className="mb-6 rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-blue-900">
        <p className="mb-1 font-semibold">Aanbevolen werkwijze</p>
        <p className="text-blue-800">
          Verisight maakt eerst de organisatie en de campaign aan. Daarna levert de klant een eenvoudig
          respondentbestand aan. Verisight controleert de import, verstuurt uitnodigingen en activeert vervolgens
          het dashboard voor de klantorganisatie.
        </p>
      </div>

      <div className="mb-8 flex items-center gap-2">
        <StepBadge n={1} label="Organisatie" done={step1Done} />
        <div className="h-px w-6 bg-gray-200" />
        <StepBadge n={2} label="Campaign" done={step2Done} />
        <div className="h-px w-6 bg-gray-200" />
        <StepBadge n={3} label="Import & uitnodigen" done={step3Done} />
        <div className="h-px w-6 bg-gray-200" />
        <StepBadge n={4} label="Klanttoegang" done={step4Done} />
      </div>

      {/* ── Campagne statusoverzicht ───────────────────────────────────── */}
      {campaignStats.length > 0 && (
        <section className="mb-8 rounded-xl border border-gray-200 bg-white">
          <div className="border-b border-gray-100 px-5 py-4">
            <h2 className="text-sm font-semibold text-gray-900">Campagne-statusoverzicht</h2>
            <p className="mt-0.5 text-xs text-gray-400">Respons en voortgang per actieve campagne</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50 text-xs font-semibold uppercase tracking-wide text-gray-400">
                  <th className="px-5 py-3 text-left">Campagne</th>
                  <th className="px-5 py-3 text-left">Organisatie</th>
                  <th className="px-5 py-3 text-center">Status</th>
                  <th className="px-5 py-3 text-right">Uitgenodigd</th>
                  <th className="px-5 py-3 text-right">Ingevuld</th>
                  <th className="px-5 py-3 text-right">Respons</th>
                  <th className="px-5 py-3 text-right">Gem. risico</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {campaignStats.map(cs => {
                  const pct = cs.completion_rate_pct ?? 0
                  const org = orgs.find(o => o.id === cs.organization_id)
                  return (
                    <tr key={cs.campaign_id} className="hover:bg-gray-50/60">
                      <td className="px-5 py-3">
                        <div className="font-medium text-gray-900">{cs.campaign_name}</div>
                        <div className="mt-0.5 text-xs text-gray-400">
                          {cs.scan_type === 'exit' ? 'ExitScan' : 'RetentieScan'}
                        </div>
                      </td>
                      <td className="px-5 py-3 text-gray-600">{org?.name ?? '—'}</td>
                      <td className="px-5 py-3 text-center">
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${
                            cs.is_active
                              ? 'bg-green-50 text-green-700'
                              : 'bg-gray-100 text-gray-500'
                          }`}
                        >
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${
                              cs.is_active ? 'bg-green-500' : 'bg-gray-400'
                            }`}
                          />
                          {cs.is_active ? 'Actief' : 'Gesloten'}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-right tabular-nums text-gray-700">
                        {cs.total_invited ?? 0}
                      </td>
                      <td className="px-5 py-3 text-right tabular-nums text-gray-700">
                        {cs.total_completed ?? 0}
                      </td>
                      <td className="px-5 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <div className="h-1.5 w-16 overflow-hidden rounded-full bg-gray-100">
                            <div
                              className={`h-full rounded-full ${pct >= 60 ? 'bg-green-500' : pct >= 30 ? 'bg-amber-400' : 'bg-red-400'}`}
                              style={{ width: `${Math.min(pct, 100)}%` }}
                            />
                          </div>
                          <span className="w-9 text-xs font-semibold tabular-nums text-gray-700">
                            {pct}%
                          </span>
                        </div>
                      </td>
                      <td className="px-5 py-3 text-right tabular-nums text-gray-700">
                        {cs.avg_risk_score ? (
                          <span
                            className={`font-semibold ${
                              cs.avg_risk_score >= 7
                                ? 'text-red-600'
                                : cs.avg_risk_score >= 4.5
                                  ? 'text-amber-600'
                                  : 'text-green-600'
                            }`}
                          >
                            {cs.avg_risk_score.toFixed(1)}
                          </span>
                        ) : (
                          <span className="text-xs text-gray-300">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <a
                          href={`/campaigns/${cs.campaign_id}`}
                          className="rounded-md bg-gray-100 px-2.5 py-1 text-xs font-semibold text-gray-700 hover:bg-gray-200 transition-colors"
                        >
                          Open →
                        </a>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </section>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <section className={`rounded-xl border bg-white p-6 ${step1Done ? 'border-green-200' : 'border-gray-200'}`}>
          <SectionHeader n={1} title="Organisatie aanmaken" done={step1Done} />
          {orgs.length > 0 ? (
            <div className="space-y-2">
              {orgs.map(org => (
                <div key={org.id} className="flex items-start justify-between gap-3 rounded-lg border border-gray-100 bg-gray-50 px-3 py-3 text-sm text-gray-700">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={org.is_active ? 'text-green-500' : 'text-gray-400'}>{org.is_active ? '✓' : '○'}</span>
                      <span className="font-medium">{org.name}</span>
                      <span className="truncate text-xs text-gray-400">({org.slug})</span>
                      {!org.is_active && (
                        <span className="rounded-full bg-gray-200 px-2 py-0.5 text-[11px] font-medium text-gray-600">
                          Gearchiveerd
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-xs text-gray-400">
                      {campaignCountByOrg[org.id] ?? 0} campaign(s) gekoppeld
                    </p>
                  </div>
                  <div className="flex items-start gap-2">
                    <ArchiveOrgButton orgId={org.id} orgName={org.name} isActive={org.is_active} />
                    <DeleteOrgButton
                      orgId={org.id}
                      orgName={org.name}
                      campaignCount={campaignCountByOrg[org.id] ?? 0}
                    />
                  </div>
                </div>
              ))}

              {archivedOrgs.length > 0 && (
                <p className="text-xs text-gray-400">
                  Gearchiveerde organisaties blijven bestaan voor historie, maar zijn niet meer actief te kiezen in nieuwe setupstappen.
                </p>
              )}

              <div className="mt-2 border-t border-gray-100 pt-2">
                <p className="mb-2 text-xs text-gray-400">Nog een organisatie toevoegen:</p>
                <NewOrgForm />
              </div>
            </div>
          ) : (
            <NewOrgForm />
          )}
        </section>

        <section className={`rounded-xl border bg-white p-6 ${step2Done ? 'border-green-200' : 'border-gray-200'}`}>
          <SectionHeader n={2} title="Campaign aanmaken" done={step2Done} />
          {activeOrgs.length === 0 ? (
            <LockedStep message="Maak eerst een actieve organisatie aan of heractiveer een gearchiveerde organisatie." />
          ) : (
            <NewCampaignForm orgs={activeOrgs} />
          )}
        </section>

        <section className={`rounded-xl border bg-white p-6 lg:col-span-2 ${step3Done ? 'border-green-200' : 'border-gray-200'}`}>
          <SectionHeader n={3} title="Respondenten importeren en uitnodigen" done={step3Done} />
          {campaigns.length === 0 ? (
            <LockedStep message="Maak eerst een campaign aan (stap 2)." />
          ) : (
            <div className="space-y-5">
              <p className="text-sm text-gray-500">
                Gebruik bij voorkeur een klantbestand met e-mailadressen en optionele segmentvelden. Dat maakt de
                setup sneller, netter en beter herhaalbaar dan losse handmatige invoer. Als je Segment deep dive
                hebt aangezet, zijn afdeling en functieniveau sterk aanbevolen.
              </p>

              {campaigns.filter(campaign => campaign.is_active).length === 0 && (
                <p className="rounded-lg border border-amber-100 bg-amber-50 px-3 py-2 text-xs text-amber-700">
                  Geen actieve campaigns. Maak een nieuwe campaign aan via stap 2 of gebruik een bestaand archief alleen voor inzage.
                </p>
              )}

              <AddRespondentsForm campaigns={campaigns} organizations={orgs} />

              <div className="space-y-2 border-t border-gray-100 pt-2">
                <p className="text-xs font-semibold text-gray-500">Bestaande campaigns</p>
                {campaigns.map(campaign => (
                  <div
                    key={campaign.id}
                    className="flex items-center justify-between rounded-lg border border-gray-100 bg-gray-50 px-4 py-3"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="mb-0.5 flex items-center gap-2">
                        <span className="rounded bg-blue-50 px-1.5 py-0.5 text-xs font-semibold text-blue-600">
                          {campaign.scan_type === 'exit' ? 'ExitScan' : 'RetentieScan'}
                        </span>
                        <span className={`text-xs font-medium ${campaign.is_active ? 'text-green-600' : 'text-gray-400'}`}>
                          {campaign.is_active ? '● Actief' : '○ Gearchiveerd'}
                        </span>
                      </div>
                      <p className="truncate text-sm font-medium text-gray-800">{campaign.name}</p>
                      {hasCampaignAddOn(campaign, 'segment_deep_dive') && (
                        <p className="mt-1 text-xs font-medium text-blue-700">
                          Add-on actief: {REPORT_ADD_ON_LABELS.segment_deep_dive}
                        </p>
                      )}
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
                      className={`ml-4 flex-shrink-0 rounded-lg px-3 py-1.5 text-sm font-semibold transition-colors ${
                        campaign.is_active
                          ? 'bg-blue-600 text-white hover:bg-blue-700'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {campaign.is_active ? 'Open dashboard →' : 'Bekijk archief →'}
                    </a>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>

        <section className={`rounded-xl border bg-white p-6 lg:col-span-2 ${step4Done ? 'border-green-200' : 'border-gray-200'}`}>
          <SectionHeader n={4} title="Klantdashboard activeren" done={step4Done} />
          {activeOrgs.length === 0 ? (
            <LockedStep message="Maak eerst een actieve organisatie aan of heractiveer een gearchiveerde organisatie." />
          ) : campaigns.filter(campaign => campaign.is_active).length === 0 ? (
            <LockedStep message="Maak eerst een actieve campaign aan voordat je klanttoegang activeert." />
          ) : (
            <div className="space-y-5">
              <p className="text-sm text-gray-500">
                Nodig daarna een klantgebruiker uit voor het dashboard. Nieuwe gebruikers ontvangen een activatiemail;
                bestaande accounts worden direct aan de organisatie gekoppeld.
              </p>
              <InviteClientUserForm orgs={activeOrgs} />
              <div className="space-y-3 border-t border-gray-100 pt-4">
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
        className={`flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold ${
          done ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-500'
        }`}
      >
        {done ? '✓' : n}
      </div>
      <span className={`hidden text-xs font-medium sm:block ${done ? 'text-green-600' : 'text-gray-500'}`}>{label}</span>
    </div>
  )
}

function SectionHeader({ n, title, done }: { n: number; title: string; done: boolean }) {
  return (
    <div className="mb-4 flex items-center gap-2">
      <div
        className={`flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold ${
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
    <div className="flex items-center gap-2 rounded-lg bg-gray-50 px-4 py-3 text-sm text-gray-400">
      <span>🔒</span>
      <span>{message}</span>
    </div>
  )
}

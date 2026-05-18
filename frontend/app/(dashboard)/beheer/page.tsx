import Link from 'next/link'
import { redirect } from 'next/navigation'
import type { ReactNode } from 'react'
import { AddRespondentsForm } from '@/components/dashboard/add-respondents-form'
import { ArchiveOrgButton } from '@/components/dashboard/archive-org-button'
import { ClientAccessList } from '@/components/dashboard/client-access-list'
import { DashboardChip, DashboardSection } from '@/components/dashboard/dashboard-primitives'
import { DeleteOrgButton } from '@/components/dashboard/delete-org-button'
import { InviteClientUserForm } from '@/components/dashboard/invite-client-user-form'
import { NewCampaignForm } from '@/components/dashboard/new-campaign-form'
import { NewOrgForm } from '@/components/dashboard/new-org-form'
import { getDeliveryModeLabel } from '@/lib/implementation-readiness'
import { createClient } from '@/lib/supabase/server'
import { hasCampaignAddOn, REPORT_ADD_ON_LABELS, type Campaign, type CampaignStats, type Organization, type OrgInvite } from '@/lib/types'

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

  const orgs = (memberships?.flatMap((membership) => membership.organizations).filter(Boolean) ?? []) as Organization[]
  const activeOrgs = orgs.filter((org) => org.is_active)
  const archivedOrgs = orgs.filter((org) => !org.is_active)

  const orgIds = orgs.map((org) => org.id)
  const { data: campaignsRaw } = orgIds.length
    ? await supabase
        .from('campaigns')
        .select('*')
        .in('organization_id', orgIds)
        .order('created_at', { ascending: false })
    : { data: [] }

  const campaigns = (campaignsRaw ?? []) as Campaign[]
  const activeCampaignCount = campaigns.filter((campaign) => campaign.is_active).length
  const campaignCountByOrg = campaigns.reduce<Record<string, number>>((acc, campaign) => {
    acc[campaign.organization_id] = (acc[campaign.organization_id] ?? 0) + 1
    return acc
  }, {})

  const campaignIds = campaigns.map((campaign) => campaign.id)
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

  const invites = (invitesRaw ?? []).map((invite) => ({
    ...invite,
    organizations: Array.isArray(invite.organizations) ? invite.organizations[0] : invite.organizations,
  })) as OrgInvite[]

  const pendingInviteCount = invites.filter((invite) => !invite.accepted_at).length

  const step1Done = activeOrgs.length > 0
  const step2Done = campaigns.some((campaign) => campaign.is_active)
  const step3Done = (respondentCount ?? 0) > 0
  const step4Done = step2Done && (clientAccessCount ?? 0) > 0
  const liveRespondentCount = respondentCount ?? 0
  const confirmedClientAccessCount = clientAccessCount ?? 0
  const setupProgressCount = [step1Done, step2Done, step3Done, step4Done].filter(Boolean).length
  const selectedCampaign = campaigns.find((campaign) => campaign.is_active) ?? campaigns[0] ?? null
  const selectedOrganization =
    (selectedCampaign ? orgs.find((org) => org.id === selectedCampaign.organization_id) : null) ??
    activeOrgs[0] ??
    orgs[0] ??
    null

  return (
    <div className="space-y-6">
      <section className="rounded-[28px] border border-slate-200 bg-white px-6 py-6 shadow-[0_10px_30px_rgba(19,32,51,0.05)]">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Admin setup</p>
            <div className="space-y-2">
              <h1 className="text-3xl font-semibold tracking-[-0.04em] text-slate-950">Beheer</h1>
              <p className="max-w-2xl text-sm leading-6 text-slate-600">
                Zet hier de klantcontext op: organisatie, campaign, respondenten en klanttoegang.
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <DashboardChip surface="ops" label={`${setupProgressCount}/4 setupstappen`} tone={setupProgressCount === 4 ? 'emerald' : 'amber'} />
            <DashboardChip surface="ops" label={`${activeOrgs.length} actieve organisatie${activeOrgs.length === 1 ? '' : 's'}`} />
            <DashboardChip surface="ops" label={`${activeCampaignCount} actieve campaign${activeCampaignCount === 1 ? '' : 's'}`} tone="slate" />
          </div>
        </div>
      </section>

      <section className="rounded-[28px] border border-slate-900 bg-slate-950 px-6 py-5 text-white shadow-[0_14px_34px_rgba(15,23,42,0.24)]">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-300">Setupcontext</p>
            <div className="grid gap-3 md:grid-cols-2">
              <div className="rounded-[20px] border border-white/10 bg-white/5 px-4 py-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">Geselecteerde organisatie</p>
                <p className="mt-2 text-base font-semibold text-white">{selectedOrganization?.name ?? 'Nog geen organisatie gekozen'}</p>
                <p className="mt-1 text-sm text-slate-300">
                  {selectedOrganization
                    ? `${campaignCountByOrg[selectedOrganization.id] ?? 0} campaign${(campaignCountByOrg[selectedOrganization.id] ?? 0) === 1 ? '' : 's'}`
                    : 'Maak eerst een organisatie aan'}
                </p>
              </div>
              <div className="rounded-[20px] border border-white/10 bg-white/5 px-4 py-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">Geselecteerde campaign</p>
                <p className="mt-2 text-base font-semibold text-white">{selectedCampaign?.name ?? 'Nog geen campaign gekozen'}</p>
                <p className="mt-1 text-sm text-slate-300">
                  {selectedCampaign
                    ? `${selectedCampaign.scan_type === 'exit' ? 'ExitScan' : 'RetentieScan'} · ${selectedCampaign.is_active ? 'Actief' : 'Gearchiveerd'}`
                    : 'Respondenten en klanttoegang worden actief na campaign-keuze'}
                </p>
              </div>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <DashboardChip surface="ops" label={`${liveRespondentCount} respondenten`} tone={liveRespondentCount > 0 ? 'emerald' : 'slate'} />
            <DashboardChip surface="ops" label={`${confirmedClientAccessCount} klanttoegang`} tone={step4Done ? 'emerald' : 'amber'} />
            <DashboardChip surface="ops" label={selectedCampaign ? 'Campaign gekozen' : 'Campaign ontbreekt'} tone={selectedCampaign ? 'emerald' : 'amber'} />
          </div>
        </div>
      </section>

      <DashboardSection
        id="setup"
        surface="ops"
        eyebrow="Setup"
        title="Organisatie, campaign, import en klanttoegang"
        description="Werk de setup hier direct af in vaste volgorde."
        aside={<DashboardChip surface="ops" label={`${campaigns.length} campaign${campaigns.length === 1 ? '' : 's'} totaal`} />}
      >
        <div className="grid gap-5 lg:grid-cols-2">
          <StepCard done={step1Done} number={1} title="Organisatie aanmaken">
            {orgs.length > 0 ? (
              <div className="space-y-2">
                {orgs.map((org) => (
                  <div key={org.id} className="flex items-start justify-between gap-3 rounded-[18px] border border-slate-200 bg-slate-50 px-3 py-3 text-sm text-slate-700">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className={org.is_active ? 'text-emerald-600' : 'text-slate-400'}>{org.is_active ? '✓' : '○'}</span>
                        <span className="font-medium text-slate-900">{org.name}</span>
                        <span className="truncate text-xs text-slate-400">({org.slug})</span>
                        {!org.is_active ? (
                          <span className="rounded-full bg-slate-200 px-2 py-0.5 text-[11px] font-medium text-slate-600">Gearchiveerd</span>
                        ) : null}
                      </div>
                      <p className="mt-1 text-xs text-slate-500">{campaignCountByOrg[org.id] ?? 0} campaign(s) gekoppeld</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <ArchiveOrgButton orgId={org.id} orgName={org.name} isActive={org.is_active} />
                      <DeleteOrgButton orgId={org.id} orgName={org.name} campaignCount={campaignCountByOrg[org.id] ?? 0} />
                    </div>
                  </div>
                ))}

                {archivedOrgs.length > 0 ? (
                  <p className="text-xs text-slate-500">Gearchiveerde organisaties blijven beschikbaar voor historie.</p>
                ) : null}

                <div className="border-t border-slate-200 pt-3">
                  <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Nieuwe organisatie</p>
                  <NewOrgForm />
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-sm leading-6 text-slate-600">Maak eerst de organisatie aan. Daarna worden campaign en vervolgstappen beschikbaar.</p>
                <NewOrgForm />
              </div>
            )}
          </StepCard>

          <StepCard done={step2Done} number={2} title="Campaign aanmaken">
            {activeOrgs.length === 0 ? (
              <LockedStep message="Maak eerst een actieve organisatie aan of heractiveer een gearchiveerde organisatie." />
            ) : (
              <NewCampaignForm orgs={activeOrgs} />
            )}
          </StepCard>

          <StepCard done={step3Done} number={3} title="Respondenten importeren" span="full">
            {!selectedCampaign ? (
              <LockedStep message="Import wordt actief nadat je een campaign hebt gekozen." />
            ) : (
              <div className="space-y-5">
                <div className="flex flex-wrap items-center gap-2">
                  <DashboardChip surface="ops" label={selectedCampaign.name} tone="slate" />
                  <DashboardChip surface="ops" label={selectedCampaign.scan_type === 'exit' ? 'ExitScan' : 'RetentieScan'} tone="slate" />
                </div>
                <p className="text-sm leading-6 text-slate-600">
                  Gebruik het templatebestand en controleer de preview voordat je de deelnemers koppelt.
                </p>

                {campaigns.filter((campaign) => campaign.is_active).length === 0 ? (
                  <div className="rounded-[18px] border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900">
                    Geen actieve campaigns. Maak eerst een nieuwe campaign aan of gebruik archiefcampagnes alleen voor inzage.
                  </div>
                ) : null}

                <AddRespondentsForm campaigns={campaigns} organizations={orgs} />

                <div className="space-y-2 border-t border-slate-200 pt-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Bestaande campaigns</p>
                  {campaigns.map((campaign) => (
                    <div key={campaign.id} className="flex items-center justify-between rounded-[18px] border border-slate-200 bg-slate-50 px-4 py-3">
                      <div className="min-w-0 flex-1">
                        <div className="mb-0.5 flex flex-wrap items-center gap-2">
                          <DashboardChip surface="ops" label={campaign.scan_type === 'exit' ? 'ExitScan' : 'RetentieScan'} />
                          <DashboardChip surface="ops" label={getDeliveryModeLabel(campaign.delivery_mode, campaign.scan_type)} />
                          <span className={`text-xs font-medium ${campaign.is_active ? 'text-emerald-700' : 'text-slate-400'}`}>
                            {campaign.is_active ? '● Actief' : '○ Gearchiveerd'}
                          </span>
                        </div>
                        <p className="truncate text-sm font-medium text-slate-900">{campaign.name}</p>
                        {hasCampaignAddOn(campaign, 'segment_deep_dive') ? (
                          <p className="mt-1 text-xs font-medium text-slate-700">Add-on actief: {REPORT_ADD_ON_LABELS.segment_deep_dive}</p>
                        ) : null}
                        <p className="text-xs text-slate-500">
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
                        className="ml-4 flex-shrink-0 rounded-full border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-slate-50"
                      >
                        {campaign.is_active ? 'Open campaign' : 'Bekijk archief'}
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </StepCard>

          <StepCard done={step4Done} number={4} title="Klanttoegang activeren" span="full">
            {activeOrgs.length === 0 ? (
              <LockedStep message="Maak eerst een actieve organisatie aan of heractiveer een gearchiveerde organisatie." />
            ) : !selectedCampaign ? (
              <LockedStep message="Klanttoegang opent na campaign-keuze, maar blijft organisatiegebonden." />
            ) : (
              <div className="space-y-5">
                <p className="text-sm leading-6 text-slate-600">
                  Nodig de klant uit vanuit de gekozen organisatiecontext en controleer daarna de activatiestatus.
                </p>
                {pendingInviteCount > 0 && confirmedClientAccessCount === 0 ? (
                  <div className="rounded-[18px] border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900">
                    Er lopen al klantactivaties, maar er is nog geen bevestigde dashboardtoegang.
                  </div>
                ) : null}
                <InviteClientUserForm orgs={activeOrgs} />
                <div className="space-y-3 border-t border-slate-200 pt-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Klanttoegang en uitnodigingen</p>
                    {pendingInviteCount > 0 ? (
                      <DashboardChip surface="ops" label={`${pendingInviteCount} wacht op activatie`} tone="amber" />
                    ) : null}
                  </div>
                  <ClientAccessList invites={invites} />
                </div>
              </div>
            )}
          </StepCard>
        </div>
      </DashboardSection>

      <DashboardSection
        id="werkbanken"
        surface="ops"
        eyebrow="Werkbanken"
        title="Secundaire werkbanken"
        description="Open deze pas wanneer de setupcontext staat en er echt vervolgwerk ligt."
      >
        <div className="grid gap-3 lg:grid-cols-2">
          <WorkbenchLinkCard
            href="/beheer/contact-aanvragen"
            eyebrow="Instroom"
            title="Contact-aanvragen"
            body="Bekijk nieuwe aanvragen en koppel ze later aan de juiste setupcontext."
          />
          <WorkbenchLinkCard
            href="/beheer/klantlearnings"
            eyebrow="Learning"
            title="Klantlearnings"
            body="Leg klantlessen, pilotfrictie en proof-context vast buiten de setuphoofdlijn."
          />
        </div>
      </DashboardSection>

      <DashboardSection
        id="operations"
        surface="ops"
        eyebrow="Operations"
        title="Operations & registries"
        description="Lagere control-laag voor readiness- en expertregistries."
      >
        <details className="rounded-[22px] border border-slate-200 bg-white px-5 py-4 shadow-[0_8px_24px_rgba(19,32,51,0.04)]">
          <summary className="cursor-pointer list-none">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-950">Open operations & registries</p>
                <p className="mt-1 text-sm text-slate-600">Gebruik deze laag alleen wanneer je een registry of expertcontrole nodig hebt.</p>
              </div>
              <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Secundair</span>
            </div>
          </summary>
          <div className="mt-5 grid gap-3 border-t border-slate-200 pt-5 lg:grid-cols-3">
            <WorkbenchLinkCard
              href="/beheer/billing"
              eyebrow="Billing"
              title="Billing readiness"
              body="Contract, betaalwijze en assisted launch readiness blijven beschikbaar als expertlaag."
            />
            <WorkbenchLinkCard
              href="/beheer/health"
              eyebrow="Health"
              title="Health-signalen"
              body="Controleer activatie-, denied-access- en follow-through signalen wanneer daar echt reden voor is."
            />
            <WorkbenchLinkCard
              href="/beheer/proof"
              eyebrow="Proof"
              title="Proof-status"
              body="Bekijk de proof-ladder alleen wanneer learnings of casegebruik dat expliciet vragen."
            />
          </div>
        </details>
      </DashboardSection>

      {campaignStats.length > 0 ? (
        <DashboardSection
          id="campagnes"
          surface="ops"
          eyebrow="Campagnes"
          title="Campagne-statusoverzicht"
          description="Controlelaag voor bestaande campaigns."
          aside={<DashboardChip surface="ops" label={`${campaignStats.length} campaignstats`} tone="slate" />}
        >
          <details className="rounded-[22px] border border-slate-200 bg-white px-5 py-4 shadow-[0_8px_24px_rgba(19,32,51,0.04)]">
            <summary className="cursor-pointer list-none">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-950">Toon campagne-statusoverzicht</p>
                  <p className="mt-1 text-sm text-slate-600">Gebruik dit alleen wanneer je een bestaande campaign gericht wilt nalopen.</p>
                </div>
                <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">{campaignStats.length} campaigns</span>
              </div>
            </summary>
            <div className="mt-5 overflow-x-auto border-t border-slate-200 pt-5">
              <div className="overflow-x-auto rounded-[20px] border border-slate-200 bg-white">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                      <th className="px-5 py-3 text-left">Campaign</th>
                      <th className="px-5 py-3 text-left">Organisatie</th>
                      <th className="px-5 py-3 text-center">Status</th>
                      <th className="px-5 py-3 text-right">Uitgenodigd</th>
                      <th className="px-5 py-3 text-right">Ingevuld</th>
                      <th className="px-5 py-3 text-right">Respons</th>
                      <th className="px-5 py-3 text-right">Gem. risico</th>
                      <th className="px-4 py-3" />
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {campaignStats.map((stats) => {
                      const pct = stats.completion_rate_pct ?? 0
                      const org = orgs.find((item) => item.id === stats.organization_id)
                      return (
                        <tr key={stats.campaign_id} className="hover:bg-slate-50/70">
                          <td className="px-5 py-3">
                            <div className="font-medium text-slate-900">{stats.campaign_name}</div>
                            <div className="mt-0.5 text-xs text-slate-500">{stats.scan_type === 'exit' ? 'ExitScan' : 'RetentieScan'}</div>
                          </td>
                          <td className="px-5 py-3 text-slate-600">{org?.name ?? '—'}</td>
                          <td className="px-5 py-3 text-center">
                            <span
                              className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${
                                stats.is_active ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'
                              }`}
                            >
                              <span className={`h-1.5 w-1.5 rounded-full ${stats.is_active ? 'bg-emerald-600' : 'bg-slate-400'}`} />
                              {stats.is_active ? 'Actief' : 'Gesloten'}
                            </span>
                          </td>
                          <td className="px-5 py-3 text-right tabular-nums text-slate-700">{stats.total_invited ?? 0}</td>
                          <td className="px-5 py-3 text-right tabular-nums text-slate-700">{stats.total_completed ?? 0}</td>
                          <td className="px-5 py-3 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <div className="h-1.5 w-16 overflow-hidden rounded-full bg-slate-100">
                                <div
                                  className={`h-full rounded-full ${
                                    pct >= 60 ? 'bg-emerald-500' : pct >= 30 ? 'bg-amber-400' : 'bg-red-400'
                                  }`}
                                  style={{ width: `${Math.min(pct, 100)}%` }}
                                />
                              </div>
                              <span className="w-9 text-xs font-semibold tabular-nums text-slate-700">{pct}%</span>
                            </div>
                          </td>
                          <td className="px-5 py-3 text-right tabular-nums text-slate-700">
                            {stats.avg_risk_score ? (
                              <span
                                className={`font-semibold ${
                                  stats.avg_risk_score >= 7
                                    ? 'text-red-600'
                                    : stats.avg_risk_score >= 4.5
                                      ? 'text-amber-600'
                                      : 'text-emerald-700'
                                }`}
                              >
                                {stats.avg_risk_score.toFixed(1)}
                              </span>
                            ) : (
                              <span className="text-xs text-slate-300">—</span>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            <a
                              href={`/campaigns/${stats.campaign_id}`}
                              className="rounded-full border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-slate-50"
                            >
                              Open campaign
                            </a>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </details>
        </DashboardSection>
      ) : null}
    </div>
  )
}

function WorkbenchLinkCard({
  href,
  eyebrow,
  title,
  body,
}: {
  href: string
  eyebrow: string
  title: string
  body: string
}) {
  return (
    <Link
      href={href}
      className="rounded-[20px] border border-slate-200 bg-white px-5 py-5 shadow-[0_8px_24px_rgba(19,32,51,0.04)] transition hover:border-slate-300 hover:bg-slate-50"
    >
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">{eyebrow}</p>
      <p className="mt-3 text-lg font-semibold tracking-[-0.02em] text-slate-950">{title}</p>
      <p className="mt-3 text-sm leading-6 text-slate-600">{body}</p>
    </Link>
  )
}

function StepCard({
  done,
  number,
  title,
  children,
  span = 'half',
}: {
  done: boolean
  number: number
  title: string
  children: ReactNode
  span?: 'half' | 'full'
}) {
  return (
    <section
      className={`rounded-[22px] border bg-white p-5 shadow-[0_8px_24px_rgba(19,32,51,0.04)] ${
        span === 'full' ? 'lg:col-span-2' : ''
      } ${done ? 'border-emerald-200' : 'border-slate-200'}`}
    >
      <div className="mb-4 flex items-center gap-2">
        <div
          className={`flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold ${
            done ? 'bg-emerald-600 text-white' : 'bg-slate-900 text-white'
          }`}
        >
          {done ? '✓' : number}
        </div>
        <h2 className="text-base font-semibold text-slate-900">{title}</h2>
      </div>
      {children}
    </section>
  )
}

function LockedStep({ message }: { message: string }) {
  return <div className="rounded-[18px] border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-500">{message}</div>
}

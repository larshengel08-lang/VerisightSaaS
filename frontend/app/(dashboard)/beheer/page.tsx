import Link from 'next/link'
import { redirect } from 'next/navigation'
import type { ReactNode } from 'react'
import { AddRespondentsForm } from '@/components/dashboard/add-respondents-form'
import { ArchiveOrgButton } from '@/components/dashboard/archive-org-button'
import { ClientAccessList } from '@/components/dashboard/client-access-list'
import {
  DashboardChip,
  DashboardHero,
  DashboardPanel,
  DashboardSection,
  DashboardSummaryBar,
} from '@/components/dashboard/dashboard-primitives'
import { DeleteOrgButton } from '@/components/dashboard/delete-org-button'
import { InviteClientUserForm } from '@/components/dashboard/invite-client-user-form'
import { NewCampaignForm } from '@/components/dashboard/new-campaign-form'
import { NewOrgForm } from '@/components/dashboard/new-org-form'
import { getBeheerPageData } from '@/app/(dashboard)/beheer/get-beheer-page-data'
import { getDeliveryModeLabel } from '@/lib/implementation-readiness'
import { createClient } from '@/lib/supabase/server'
import { hasCampaignAddOn, REPORT_ADD_ON_LABELS } from '@/lib/types'

function normalizeSearchValue(value: string | string[] | undefined) {
  return typeof value === 'string' && value.trim().length > 0 ? value : null
}

function buildSetupHref(orgId: string | null, campaignId?: string | null) {
  const params = new URLSearchParams()
  if (orgId) params.set('org', orgId)
  if (campaignId) params.set('campaign', campaignId)
  return params.size > 0 ? `/beheer?${params.toString()}` : '/beheer'
}

export default async function BeheerPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>
}) {
  const resolvedSearchParams = searchParams ? await searchParams : undefined
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

  const data = await getBeheerPageData(supabase, user.id, {
    selectedOrganizationId: normalizeSearchValue(resolvedSearchParams?.org),
    selectedCampaignId: normalizeSearchValue(resolvedSearchParams?.campaign),
  })

  const {
    orgs,
    activeOrgs,
    archivedOrgs,
    campaigns,
    campaignStats,
    campaignCountByOrg,
    respondentCount,
    invites,
    pendingInviteCount,
    activeCampaignCount,
    selectedOrganization,
    selectedCampaign,
    respondentsLocked,
    clientAccessLocked,
    step1Done,
    step2Done,
    step3Done,
    step4Done,
  } = data

  const liveRespondentCount = respondentCount ?? 0
  const pendingActivations = pendingInviteCount ?? 0
  const setupProgressCount = [step1Done, step2Done, step3Done, step4Done].filter(Boolean).length
  const selectedOrganizationCampaigns = selectedOrganization
    ? campaigns.filter((campaign) => campaign.organization_id === selectedOrganization.id)
    : []
  const selectedOrganizationInvites = selectedOrganization
    ? invites.filter((invite) => invite.org_id === selectedOrganization.id)
    : []

  return (
    <div className="space-y-6">
      <DashboardHero
        surface="ops"
        tone="slate"
        eyebrow="Admin"
        title="Setuphub voor nieuwe klant en campaign"
        description="Zet hier organisaties, campaigns, respondentimport en klanttoegang op in een compacte vaste volgorde."
        meta={
          <>
            <DashboardChip
              surface="ops"
              label={`${activeOrgs.length} actieve organisatie${activeOrgs.length === 1 ? '' : 's'}`}
            />
            <DashboardChip
              surface="ops"
              label={`${activeCampaignCount ?? 0} actieve campaign${activeCampaignCount === 1 ? '' : 's'}`}
              tone="slate"
            />
            <DashboardChip
              surface="ops"
              label={
                pendingActivations === 0
                  ? 'Geen open activaties'
                  : `${pendingActivations} activatie${pendingActivations === 1 ? '' : 's'} wacht`
              }
              tone={pendingActivations > 0 ? 'amber' : 'slate'}
            />
          </>
        }
      />

      <DashboardSummaryBar
        surface="ops"
        items={[
          {
            label: 'Organisaties',
            value: `${activeOrgs.length}`,
            tone: activeOrgs.length > 0 ? 'emerald' : 'slate',
          },
          {
            label: 'Campaigns',
            value: `${activeCampaignCount ?? 0}`,
            tone: (activeCampaignCount ?? 0) > 0 ? 'emerald' : 'slate',
          },
          {
            label: 'Respondenten',
            value: `${liveRespondentCount} gekoppeld`,
            tone: liveRespondentCount > 0 ? 'emerald' : 'slate',
          },
          {
            label: 'Activaties',
            value: pendingActivations === 0 ? 'Geen wachtrij' : `${pendingActivations} wacht`,
            tone: pendingActivations > 0 ? 'amber' : 'slate',
          },
        ]}
        anchors={[
          { id: 'setup', label: 'Setup' },
          { id: 'werkbanken', label: 'Werkbanken' },
          { id: 'campagnes', label: 'Campagnes' },
        ]}
      />

      <DashboardSection
        id="setup"
        surface="ops"
        eyebrow="Setup"
        title="Primaire setupflow"
        description="Werk eerst organisatie, campaign, respondenten en klanttoegang af. Latere adminwerkbanken blijven beschikbaar, maar staan niet meer vooraan."
        aside={
          <DashboardChip
            surface="ops"
            label={`${setupProgressCount}/4 setupstappen actief`}
            tone={setupProgressCount === 4 ? 'emerald' : 'amber'}
          />
        }
      >
        <div className="space-y-5">
          <div className="rounded-[22px] border border-slate-200 bg-white px-5 py-5 shadow-[0_8px_24px_rgba(19,32,51,0.04)]">
            <div className="flex flex-col gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Actieve setupcontext</p>
                <p className="mt-2 text-sm text-slate-600">
                  Gekozen organisatie en campaign bepalen wanneer respondenten en klanttoegang openklappen.
                </p>
              </div>
              <div className="grid gap-4 lg:grid-cols-2">
                <div className="space-y-3">
                  <p className="text-sm font-semibold text-slate-900">Organisatie</p>
                  <div className="flex flex-wrap gap-2">
                    {activeOrgs.length === 0 ? (
                      <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-500">
                        Nog geen actieve organisaties
                      </span>
                    ) : (
                      activeOrgs.map((organization) => (
                        <Link
                          key={organization.id}
                          href={buildSetupHref(organization.id)}
                          className={`rounded-full border px-3 py-2 text-xs font-semibold transition ${
                            selectedOrganization?.id === organization.id
                              ? 'border-slate-900 bg-slate-900 text-white'
                              : 'border-slate-300 bg-slate-50 text-slate-700 hover:border-slate-400 hover:bg-white'
                          }`}
                        >
                          {selectedOrganization?.id === organization.id ? 'Actief: ' : ''}{organization.name}
                        </Link>
                      ))
                    )}
                  </div>
                </div>
                <div className="space-y-3">
                  <p className="text-sm font-semibold text-slate-900">Campaign</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedOrganizationCampaigns.length === 0 ? (
                      <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-500">
                        Kies of maak eerst een campaign
                      </span>
                    ) : (
                      selectedOrganizationCampaigns.map((campaign) => (
                        <Link
                          key={campaign.id}
                          href={buildSetupHref(selectedOrganization?.id ?? null, campaign.id)}
                          className={`rounded-full border px-3 py-2 text-xs font-semibold transition ${
                            selectedCampaign?.id === campaign.id
                              ? 'border-slate-900 bg-slate-900 text-white'
                              : 'border-slate-300 bg-slate-50 text-slate-700 hover:border-slate-400 hover:bg-white'
                          }`}
                        >
                          {selectedCampaign?.id === campaign.id ? 'Actief: ' : ''}
                          {campaign.name}
                        </Link>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid gap-5 lg:grid-cols-2">
            <StepCard done={step1Done} number={1} title="Organisatie">
              {orgs.length > 0 ? (
                <div className="space-y-3">
                  {orgs.map((org) => (
                    <div
                      key={org.id}
                      className="flex items-start justify-between gap-3 rounded-[18px] border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700"
                    >
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className={`text-xs font-semibold ${org.is_active ? 'text-emerald-700' : 'text-slate-400'}`}>
                            {org.is_active ? 'Actief' : 'Gearchiveerd'}
                          </span>
                          {selectedOrganization?.id === org.id ? (
                            <DashboardChip surface="ops" label="Setupcontext" tone="slate" />
                          ) : null}
                        </div>
                        <p className="mt-2 font-medium text-slate-900">{org.name}</p>
                        <p className="mt-1 text-xs text-slate-500">
                          {campaignCountByOrg[org.id] ?? 0} campaign(s) gekoppeld
                        </p>
                        {org.is_active ? (
                          <Link
                            href={buildSetupHref(org.id)}
                            className="mt-3 inline-flex items-center rounded-full border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-slate-50"
                          >
                            {selectedOrganization?.id === org.id ? 'Actieve organisatie' : 'Kies voor setup'}
                          </Link>
                        ) : null}
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

                  {archivedOrgs.length > 0 ? (
                    <p className="text-xs text-slate-500">
                      Gearchiveerde organisaties blijven zichtbaar voor historie, maar zijn geen standaard setupcontext.
                    </p>
                  ) : null}

                  <div className="border-t border-slate-200 pt-3">
                    <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Nieuwe organisatie</p>
                    <NewOrgForm />
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <DashboardPanel
                    surface="ops"
                    eyebrow="Start"
                    title="Nog geen organisaties zichtbaar"
                    body="Maak eerst een klantorganisatie aan. Daarna wordt campaign-setup meteen bruikbaar."
                    tone="slate"
                  />
                  <NewOrgForm />
                </div>
              )}
            </StepCard>

            <StepCard done={step2Done} number={2} title="Campaign">
              {activeOrgs.length === 0 ? (
                <LockedStep message="Maak eerst een actieve organisatie aan of heractiveer een bestaande organisatie." />
              ) : (
                <div className="space-y-4">
                  <DashboardPanel
                    surface="ops"
                    eyebrow="Context"
                    title={selectedOrganization ? `Nieuwe campaign voor ${selectedOrganization.name}` : 'Kies eerst een organisatie'}
                    body={
                      selectedOrganization
                        ? 'De campaign-selector hieronder blijft open, zodat respondenten en klanttoegang daarna direct op dezelfde setupcontext kunnen aansluiten.'
                        : 'Kies linksboven een organisatie als setupcontext. Je kunt nog steeds direct een nieuwe campaign aanmaken.'
                    }
                    tone="slate"
                  />
                  <NewCampaignForm orgs={activeOrgs} />

                  {selectedOrganizationCampaigns.length > 0 ? (
                    <div className="space-y-2 border-t border-slate-200 pt-4">
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Campaigns binnen actieve context</p>
                      {selectedOrganizationCampaigns.map((campaign) => (
                        <div
                          key={campaign.id}
                          className={`rounded-[18px] border px-4 py-3 ${
                            selectedCampaign?.id === campaign.id
                              ? 'border-slate-900 bg-slate-900 text-white'
                              : 'border-slate-200 bg-slate-50 text-slate-700'
                          }`}
                        >
                          <div className="flex flex-wrap items-center gap-2">
                            <DashboardChip surface="ops" label={getDeliveryModeLabel(campaign.delivery_mode, campaign.scan_type)} tone="slate" />
                            <span className={`text-xs font-semibold ${selectedCampaign?.id === campaign.id ? 'text-slate-200' : 'text-slate-500'}`}>
                              {campaign.is_active ? 'Actief' : 'Gearchiveerd'}
                            </span>
                          </div>
                          <p className={`mt-2 font-medium ${selectedCampaign?.id === campaign.id ? 'text-white' : 'text-slate-900'}`}>
                            {campaign.name}
                          </p>
                          {hasCampaignAddOn(campaign, 'segment_deep_dive') ? (
                            <p className={`mt-1 text-xs ${selectedCampaign?.id === campaign.id ? 'text-slate-200' : 'text-slate-500'}`}>
                              Add-on actief: {REPORT_ADD_ON_LABELS.segment_deep_dive}
                            </p>
                          ) : null}
                          <div className="mt-3 flex flex-wrap gap-2">
                            <Link
                              href={buildSetupHref(selectedOrganization?.id ?? null, campaign.id)}
                              className={`inline-flex items-center rounded-full border px-3 py-2 text-xs font-semibold transition ${
                                selectedCampaign?.id === campaign.id
                                  ? 'border-white/30 bg-white/10 text-white hover:bg-white/20'
                                  : 'border-slate-300 bg-white text-slate-700 hover:border-slate-400 hover:bg-slate-50'
                              }`}
                            >
                              {selectedCampaign?.id === campaign.id ? 'Actieve campaign' : 'Kies voor setup'}
                            </Link>
                            <Link
                              href={`/campaigns/${campaign.id}`}
                              className={`inline-flex items-center rounded-full border px-3 py-2 text-xs font-semibold transition ${
                                selectedCampaign?.id === campaign.id
                                  ? 'border-white/30 bg-white/10 text-white hover:bg-white/20'
                                  : 'border-slate-300 bg-white text-slate-700 hover:border-slate-400 hover:bg-slate-50'
                              }`}
                            >
                              Open resultaten
                            </Link>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : null}
                </div>
              )}
            </StepCard>

            <StepCard done={step3Done} number={3} title="Respondenten" span="full">
              {respondentsLocked || !selectedOrganization || !selectedCampaign ? (
                <LockedStep message="Kies eerst een actieve campaign in de setupcontext voordat je respondenten importeert." />
              ) : (
                <div className="space-y-4">
                  <DashboardPanel
                    surface="ops"
                    eyebrow="Import"
                    title={`Importeer voor ${selectedCampaign.name}`}
                    body="Deze stap opent pas zodra er een concrete campaign is gekozen. De import blijft strikt op CSV/XLSX-format en draait dan alleen op die campaign."
                    tone="slate"
                  />
                  <p className="text-xs text-slate-500">
                    Actieve setupcontext: {selectedOrganization.name} / {selectedCampaign.name}
                  </p>
                  <AddRespondentsForm campaigns={[selectedCampaign]} organizations={[selectedOrganization]} />
                </div>
              )}
            </StepCard>

            <StepCard done={step4Done} number={4} title="Klanttoegang" span="full">
              {clientAccessLocked || !selectedOrganization || !selectedCampaign ? (
                <LockedStep message="Kies eerst een actieve campaign in de setupcontext voordat je klanttoegang activeert." />
              ) : (
                <div className="space-y-4">
                  <DashboardPanel
                    surface="ops"
                    eyebrow="Toegang"
                    title={`Activeer toegang voor ${selectedOrganization.name}`}
                    body="Klanttoegang blijft organisatie-scoped, maar opent hier pas zodra de setupcontext concreet genoeg is om niet te vroeg te activeren."
                    tone="slate"
                  />
                  <p className="text-xs text-slate-500">
                    Actieve setupcontext: {selectedOrganization.name} / {selectedCampaign.name}
                  </p>
                  <InviteClientUserForm orgs={[selectedOrganization]} />
                  <div className="space-y-3 border-t border-slate-200 pt-4">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                        Uitnodigingen en toegang
                      </p>
                      {selectedOrganizationInvites.filter((invite) => !invite.accepted_at).length > 0 ? (
                        <DashboardChip
                          surface="ops"
                          label={`${selectedOrganizationInvites.filter((invite) => !invite.accepted_at).length} wacht op activatie`}
                          tone="amber"
                        />
                      ) : null}
                    </div>
                    <ClientAccessList invites={selectedOrganizationInvites} />
                  </div>
                </div>
              )}
            </StepCard>
          </div>
        </div>
      </DashboardSection>

      <DashboardSection
        id="werkbanken"
        surface="ops"
        eyebrow="Secundair"
        title="Secundaire werkbanken"
        description="Open deze werkbanken pas wanneer daar echt werk ligt. Ze blijven bereikbaar, maar zijn geen primaire setupstappen."
      >
        <div className="grid gap-3 lg:grid-cols-3">
          <WorkbenchLinkCard
            href="/beheer/contact-aanvragen"
            eyebrow="Instroom"
            title="Contactaanvragen"
            body="Bekijk intake- en afspraakaanvragen wanneer je nieuwe leads wilt triëren."
          />
          <WorkbenchLinkCard
            href="/beheer/klantlearnings"
            eyebrow="Learning"
            title="Klantlearnings"
            body="Open deze werkbank alleen wanneer vroege klantlessen of deliveryfrictie apart vastgelegd moeten worden."
          />
          <WorkbenchLinkCard
            href="/beheer/health"
            eyebrow="Health"
            title="Health"
            body="Gebruik deze werkbank voor bounded activatie- en follow-throughcontroles buiten de primaire setupflow."
          />
          <WorkbenchLinkCard
            href="/beheer/billing"
            eyebrow="Billing"
            title="Billing"
            body="Open billing alleen wanneer contract- of betaalstatus voor de klantsetup relevant wordt."
          />
          <WorkbenchLinkCard
            href="/beheer/proof"
            eyebrow="Proof"
            title="Proof"
            body="Gebruik proof apart wanneer cases van intern leerbewijs naar publiek inzetbaar bewijs moeten bewegen."
          />
        </div>
      </DashboardSection>

      {campaignStats.length > 0 ? (
        <DashboardSection
          id="campagnes"
          surface="ops"
          eyebrow="Controle"
          title="Campagne-overzicht"
          description="Gebruik dit overzicht alleen wanneer je bestaande campaigns op operationele voortgang wilt nalopen."
          aside={<DashboardChip surface="ops" label={`${campaignStats.length} campaignstats`} tone="slate" />}
        >
          <details className="rounded-[22px] border border-slate-200 bg-white px-5 py-4 shadow-[0_8px_24px_rgba(19,32,51,0.04)]">
            <summary className="cursor-pointer list-none">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-950">Toon campagne-overzicht</p>
                  <p className="mt-1 text-sm text-slate-600">
                    Deze laag blijft compact en secundair, zodat setup niet verdrinkt in operatie.
                  </p>
                </div>
                <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                  {campaignStats.length} campaigns
                </span>
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
                      <th className="px-4 py-3" />
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {campaignStats.map((stats) => {
                      const pct = stats.completion_rate_pct ?? 0
                      const organization = orgs.find((item) => item.id === stats.organization_id)
                      return (
                        <tr
                          key={stats.campaign_id}
                          className={`hover:bg-slate-50/70 ${
                            selectedCampaign?.id === stats.campaign_id ? 'bg-slate-50' : ''
                          }`}
                        >
                          <td className="px-5 py-3">
                            <div className="font-medium text-slate-900">{stats.campaign_name}</div>
                            <div className="mt-0.5 text-xs text-slate-500">
                              {selectedCampaign?.id === stats.campaign_id ? 'Actieve setupcontext' : 'Campaign'}
                            </div>
                          </td>
                          <td className="px-5 py-3 text-slate-600">{organization?.name ?? '—'}</td>
                          <td className="px-5 py-3 text-center">
                            <span
                              className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${
                                stats.is_active ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'
                              }`}
                            >
                              <span
                                className={`h-1.5 w-1.5 rounded-full ${
                                  stats.is_active ? 'bg-emerald-600' : 'bg-slate-400'
                                }`}
                              />
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
                          <td className="px-4 py-3">
                            <div className="flex justify-end gap-2">
                              <Link
                                href={buildSetupHref(stats.organization_id, stats.campaign_id)}
                                className="rounded-full border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-slate-50"
                              >
                                Kies voor setup
                              </Link>
                              <Link
                                href={`/campaigns/${stats.campaign_id}`}
                                className="rounded-full border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-slate-50"
                              >
                                Open campaign
                              </Link>
                            </div>
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
  return (
    <div className="rounded-[18px] border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-500">
      {message}
    </div>
  )
}

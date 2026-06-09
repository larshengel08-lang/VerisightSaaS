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
} from '@/components/dashboard/dashboard-primitives'
import { DeleteOrgButton } from '@/components/dashboard/delete-org-button'
import { InviteClientUserForm } from '@/components/dashboard/invite-client-user-form'
import { NewCampaignForm } from '@/components/dashboard/new-campaign-form'
import { NewOrgForm } from '@/components/dashboard/new-org-form'
import { createClient } from '@/lib/supabase/server'
import { SCAN_TYPE_LABELS } from '@/lib/types'
import { getBeheerPageData } from './get-beheer-page-data'

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

  const {
    organizationsAvailable,
    campaignsAvailable,
    accessAvailable,
    deliveryAvailable,
    orgs,
    activeOrgs,
    archivedOrgs,
    campaigns,
    topCampaigns,
    remainingCampaignCount,
    campaignCountByOrg,
    respondentCount,
    clientAccessCount,
    invites,
    pendingInviteCount,
    activeCampaignCount,
    blockedDeliveriesCount,
    setupBlockers,
    dataImportAlert,
  } = await getBeheerPageData(supabase, user.id)

  const hasSetupBlockers = setupBlockers.length > 0

  return (
    <div className="space-y-6">
      <DashboardHero
        surface="ops"
        tone="slate"
        eyebrow="Admin en configuratie"
        title="Dashboard admin setup"
        description="Configureer organisaties, toegang, campagnes en data-readiness."
        meta={
          <>
            <DashboardChip
              surface="ops"
              tone={organizationsAvailable ? 'slate' : 'amber'}
              label={organizationsAvailable ? `${orgs.length} organisaties` : 'Organisaties niet beschikbaar'}
            />
            <DashboardChip
              surface="ops"
              tone={campaignsAvailable ? 'slate' : 'amber'}
              label={campaignsAvailable ? `${campaigns.length} campaigns` : 'Campaigns niet beschikbaar'}
            />
          </>
        }
        aside={
          hasSetupBlockers ? (
            <div className="space-y-2">
              <DashboardChip surface="ops" tone="amber" label="Setup aandacht nodig" />
              <p className="text-sm font-semibold text-slate-950">
                {setupBlockers.length} open blokkade{setupBlockers.length === 1 ? '' : 's'}
              </p>
              <p className="text-xs leading-5 text-slate-500">
                Los eerst de open setupblokkades op voordat je verder gaat met toegang, campagnes of import.
              </p>
            </div>
          ) : null
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <SetupStatusCard
          label="ORGANISATIES"
          metric={organizationsAvailable ? `${activeOrgs.length}` : '—'}
          statusText={
            !organizationsAvailable ? 'Niet beschikbaar' : activeOrgs.length > 0 ? 'Geconfigureerd' : 'Ontbreekt'
          }
          tone={!organizationsAvailable ? 'amber' : activeOrgs.length > 0 ? 'emerald' : 'amber'}
        />
        <SetupStatusCard
          label="TOEGANG & ROLLEN"
          metric={accessAvailable ? `${pendingInviteCount ?? 0}` : '—'}
          statusText={
            !accessAvailable
              ? 'Niet beschikbaar'
              : (pendingInviteCount ?? 0) > 0
                ? 'Aandacht nodig'
                : 'Geconfigureerd'
          }
          tone={!accessAvailable ? 'amber' : (pendingInviteCount ?? 0) > 0 ? 'amber' : 'emerald'}
        />
        <SetupStatusCard
          label="CAMPAGNES"
          metric={campaignsAvailable ? `${campaigns.length}` : '—'}
          statusText={
            !campaignsAvailable ? 'Niet beschikbaar' : getCampaignStatusText(campaigns.length, activeCampaignCount)
          }
          tone={!campaignsAvailable ? 'amber' : activeCampaignCount && activeCampaignCount > 0 ? 'emerald' : 'slate'}
        />
        <SetupStatusCard
          label="DATA & IMPORT"
          metric={deliveryAvailable ? `${blockedDeliveriesCount ?? 0}` : '—'}
          statusText={
            !deliveryAvailable
              ? 'Niet beschikbaar'
              : (blockedDeliveriesCount ?? 0) > 0
                ? 'Blokkade'
                : 'Geconfigureerd'
          }
          tone={!deliveryAvailable ? 'amber' : (blockedDeliveriesCount ?? 0) > 0 ? 'amber' : 'emerald'}
        />
      </div>

      {hasSetupBlockers ? (
        <DashboardSection
          surface="ops"
          tone="amber"
          title="Open setupblokkades"
          description="Alleen blokkades binnen campagnes, toegang en data-import worden hier getoond."
        >
          <div className="grid gap-4 xl:grid-cols-2">
            {setupBlockers.map((blocker) => (
              <article
                key={blocker.id}
                className="rounded-[20px] border border-amber-200 bg-amber-50 px-5 py-5 shadow-[0_1px_4px_rgba(10,25,47,0.04)]"
              >
                <div className="flex flex-wrap gap-2">
                  <DashboardChip surface="ops" tone="amber" label={blocker.category} />
                  {blocker.impactLabel ? (
                    <DashboardChip surface="ops" tone="amber" label={`Impact: ${blocker.impactLabel}`} />
                  ) : null}
                </div>
                <h3 className="mt-4 text-base font-semibold text-slate-950">{blocker.title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-700">{blocker.description}</p>
                {blocker.actionHref ? (
                  <Link
                    href={blocker.actionHref}
                    className="mt-4 inline-flex items-center rounded-full border border-emerald-300 bg-white px-4 py-2 text-sm font-semibold text-emerald-800 transition hover:border-emerald-400 hover:bg-emerald-50"
                  >
                    Open setupzone
                  </Link>
                ) : null}
              </article>
            ))}
          </div>
        </DashboardSection>
      ) : null}

      <DashboardSection
        surface="ops"
        tone="slate"
        title="Setupkern"
        description="Gebruik deze vier zones alleen voor admin-configuratie en technische readiness."
      >
        <div className="grid gap-5 lg:grid-cols-2">
          <SetupPanel
            id="organisaties"
            title="Organisaties"
            summary={organizationsAvailable ? `${activeOrgs.length} actief · ${archivedOrgs.length} gearchiveerd` : 'Niet beschikbaar'}
          >
            {!organizationsAvailable ? (
              <SectionFallback />
            ) : orgs.length === 0 ? (
              <div className="space-y-4">
                <DashboardPanel
                  surface="ops"
                  title="Nog geen organisaties. Maak hieronder de eerste organisatie aan."
                  body="Zodra de eerste organisatie bestaat, worden campagnes, toegang en data-import beschikbaar."
                  tone="amber"
                />
                <NewOrgForm />
              </div>
            ) : (
              <div className="space-y-4">
                <div className="space-y-2">
                  {orgs.map((org) => (
                    <div
                      key={org.id}
                      className="flex items-start justify-between gap-3 rounded-[18px] border border-slate-200 bg-slate-50 px-4 py-3"
                    >
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className={`text-sm ${org.is_active ? 'text-emerald-600' : 'text-slate-400'}`}>
                            {org.is_active ? '●' : '○'}
                          </span>
                          <p className="text-sm font-semibold text-slate-900">{org.name}</p>
                          <span className="truncate text-xs text-slate-400">({org.slug})</span>
                          {!org.is_active ? <DashboardChip surface="ops" label="Gearchiveerd" /> : null}
                        </div>
                        <p className="mt-1 text-xs text-slate-500">
                          {campaignCountByOrg[org.id] ?? 0} campaign{campaignCountByOrg[org.id] === 1 ? '' : 's'} gekoppeld
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
                </div>
                <div className="border-t border-slate-200 pt-4">
                  <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                    Nieuwe organisatie
                  </p>
                  <NewOrgForm />
                </div>
              </div>
            )}
          </SetupPanel>

          <SetupPanel
            id="toegang"
            title="Toegang en rollen"
            summary={
              accessAvailable
                ? `${clientAccessCount ?? 0} gekoppeld · ${pendingInviteCount ?? 0} open uitnodigingen`
                : 'Niet beschikbaar'
            }
          >
            {!accessAvailable ? (
              <SectionFallback />
            ) : activeOrgs.length === 0 ? (
              <LockedState message="Maak eerst een actieve organisatie aan voordat je klanttoegang configureert." />
            ) : (
              <div className="space-y-4">
                <div className="grid gap-3 sm:grid-cols-2">
                  <DashboardPanel
                    surface="ops"
                    title="Gekoppelde klantgebruikers"
                    value={`${clientAccessCount ?? 0}`}
                    body="Toegang blijft beperkt tot dashboardtoegang en activatiebeheer."
                    tone="slate"
                  />
                  <DashboardPanel
                    surface="ops"
                    title="Open uitnodigingen"
                    value={`${pendingInviteCount ?? 0}`}
                    body={
                      (pendingInviteCount ?? 0) === 0
                        ? 'Geen openstaande uitnodigingen.'
                        : 'Er lopen nog uitnodigingen die op activatie wachten.'
                    }
                    tone={(pendingInviteCount ?? 0) > 0 ? 'amber' : 'emerald'}
                  />
                </div>
                <InviteClientUserForm orgs={activeOrgs} />
                <div className="border-t border-slate-200 pt-4">
                  <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                    Bestaande toegang
                  </p>
                  <ClientAccessList invites={invites} />
                </div>
              </div>
            )}
          </SetupPanel>

          <SetupPanel
            id="campagnes"
            title="Campagnes"
            summary={campaignsAvailable ? `${campaigns.length} totaal` : 'Niet beschikbaar'}
          >
            {!campaignsAvailable ? (
              <SectionFallback />
            ) : (
              <div className="space-y-4">
                {topCampaigns.length === 0 ? (
                  <DashboardPanel
                    surface="ops"
                    title="Geen campagnes gevonden."
                    body="Maak hieronder de eerste campaign aan zodra er een actieve organisatie beschikbaar is."
                    tone="amber"
                  />
                ) : (
                  <div className="space-y-2">
                    {topCampaigns.map((campaign) => (
                      <div
                        key={campaign.id}
                        className="flex items-center justify-between gap-3 rounded-[18px] border border-slate-200 bg-slate-50 px-4 py-3"
                      >
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <span
                              className={`text-sm ${campaign.is_active ? 'text-emerald-600' : 'text-slate-400'}`}
                            >
                              {campaign.is_active ? '●' : '○'}
                            </span>
                            <p className="truncate text-sm font-semibold text-slate-900">{campaign.name}</p>
                          </div>
                          <p className="mt-1 text-xs text-slate-500">
                            {SCAN_TYPE_LABELS[campaign.scan_type] ?? campaign.scan_type}
                            {campaign.is_active ? ' · actief' : ' · gearchiveerd'}
                          </p>
                        </div>
                        <Link
                          href={`/campaigns/${campaign.id}`}
                          className="rounded-full border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-slate-50"
                        >
                          Open campaign
                        </Link>
                      </div>
                    ))}
                    {remainingCampaignCount > 0 ? (
                      <p className="text-xs text-slate-500">
                        + {remainingCampaignCount} extra campaign{remainingCampaignCount === 1 ? '' : 's'}
                      </p>
                    ) : null}
                  </div>
                )}

                <div className="border-t border-slate-200 pt-4">
                  <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                    Nieuwe campaign
                  </p>
                  {activeOrgs.length === 0 ? (
                    <LockedState message="Maak eerst een actieve organisatie aan voordat je een campaign configureert." />
                  ) : (
                    <NewCampaignForm orgs={activeOrgs} />
                  )}
                </div>
              </div>
            )}
          </SetupPanel>

          <SetupPanel
            id="data-import"
            title="Data en import"
            summary={
              campaignsAvailable
                ? `${respondentCount === null ? '—' : respondentCount} respondent${respondentCount === 1 ? '' : 'en'}`
                : 'Niet beschikbaar'
            }
          >
            {!campaignsAvailable || !deliveryAvailable ? (
              <SectionFallback />
            ) : campaigns.length === 0 ? (
              <LockedState message="Maak eerst een campaign aan voordat je data importeert." />
            ) : (
              <div className="space-y-4">
                {dataImportAlert ? (
                  <div className="rounded-[18px] border border-amber-200 bg-amber-50 px-4 py-4 text-sm text-amber-950">
                    <div className="flex flex-wrap gap-2">
                      <DashboardChip surface="ops" tone="amber" label={dataImportAlert.category} />
                      {dataImportAlert.impactLabel ? (
                        <DashboardChip surface="ops" tone="amber" label={`Impact: ${dataImportAlert.impactLabel}`} />
                      ) : null}
                    </div>
                    <p className="mt-3 font-semibold">{dataImportAlert.title}</p>
                    <p className="mt-2 leading-6">{dataImportAlert.description}</p>
                  </div>
                ) : (
                  <DashboardPanel
                    surface="ops"
                    title="Geen importblokkades gevonden."
                    body="Data-import kan hier verder worden voorbereid zonder open setupblokkade."
                    tone="emerald"
                  />
                )}
                <AddRespondentsForm campaigns={campaigns} organizations={orgs} />
              </div>
            )}
          </SetupPanel>
        </div>
      </DashboardSection>

      <DashboardSection
        surface="ops"
        tone="slate"
        eyebrow="SECUNDAIRE ADMINMODULES"
        title="Secundaire adminmodules"
        description="Gebruik deze links alleen voor gespecialiseerde adminstromen buiten de setupkern."
      >
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          <AdminModuleLink href="/beheer/billing" label="Billing" subLabel="Naar billingmodule" />
          <AdminModuleLink href="/beheer/health" label="Health" subLabel="Naar healthmodule" />
          <AdminModuleLink href="/beheer/proof" label="Proof" subLabel="Naar proofmodule" />
          <AdminModuleLink href="/beheer/klantlearnings" label="Klantlearnings" subLabel="Naar learnings" />
          <AdminModuleLink href="/beheer/contact-aanvragen" label="Aanvragen" subLabel="Naar contact" />
        </div>
      </DashboardSection>
    </div>
  )
}

function getCampaignStatusText(campaignCount: number, activeCampaignCount: number | null) {
  if (campaignCount === 0) return 'Geen campaigns'
  if ((activeCampaignCount ?? 0) > 0) return 'Actief'
  return 'Geen actieve campaigns'
}

function SetupStatusCard({
  label,
  metric,
  statusText,
  tone,
}: {
  label: string
  metric: string
  statusText: string
  tone: 'slate' | 'emerald' | 'amber'
}) {
  return (
    <div className="rounded-[20px] border border-slate-200 bg-white px-5 py-4 shadow-[0_1px_4px_rgba(10,25,47,0.04)]">
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">{label}</p>
      <p className="mt-3 text-[1.7rem] font-bold tracking-tight text-slate-950">{metric}</p>
      <div className="mt-3 flex items-center gap-2">
        <span
          className={`h-2.5 w-2.5 rounded-full ${
            tone === 'emerald' ? 'bg-emerald-500' : tone === 'amber' ? 'bg-amber-500' : 'bg-slate-400'
          }`}
        />
        <p
          className={`text-sm font-medium ${
            tone === 'emerald' ? 'text-emerald-700' : tone === 'amber' ? 'text-amber-800' : 'text-slate-600'
          }`}
        >
          {statusText}
        </p>
      </div>
    </div>
  )
}

function SetupPanel({
  id,
  title,
  summary,
  children,
}: {
  id: string
  title: string
  summary: string
  children: ReactNode
}) {
  return (
    <section
      id={id}
      className="rounded-[22px] border border-slate-200 bg-white p-5 shadow-[0_1px_4px_rgba(10,25,47,0.04)]"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-slate-950">{title}</h2>
          <p className="mt-1 text-sm text-slate-500">{summary}</p>
        </div>
      </div>
      <div className="mt-5 border-t border-slate-200 pt-5">{children}</div>
    </section>
  )
}

function AdminModuleLink({
  href,
  label,
  subLabel,
}: {
  href: string
  label: string
  subLabel: string
}) {
  return (
    <Link
      href={href}
      className="rounded-[20px] border border-slate-200 bg-white px-4 py-4 text-left shadow-[0_1px_4px_rgba(10,25,47,0.04)] transition hover:border-emerald-300 hover:bg-emerald-50"
    >
      <p className="text-sm font-semibold text-slate-950">{label}</p>
      <p className="mt-2 text-xs text-slate-500">{subLabel}</p>
    </Link>
  )
}

function SectionFallback() {
  return (
    <DashboardPanel
      surface="ops"
      title="Niet beschikbaar — data kon niet worden geladen"
      body="Laad de pagina opnieuw of controleer of de admindata beschikbaar is voor deze gebruiker."
      tone="amber"
    />
  )
}

function LockedState({ message }: { message: string }) {
  return (
    <div className="rounded-[18px] border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-500">
      {message}
    </div>
  )
}

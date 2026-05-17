import Link from 'next/link'
import { redirect } from 'next/navigation'
import type { ReactNode } from 'react'
import { AddRespondentsForm } from '@/components/dashboard/add-respondents-form'
import { ArchiveOrgButton } from '@/components/dashboard/archive-org-button'
import { ClientAccessList } from '@/components/dashboard/client-access-list'
import {
  DashboardChip,
  DashboardDisclosure,
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
import { summarizeActionCenterOpsHealth } from '@/lib/action-center-ops-health'
import { summarizeBillingRegistry } from '@/lib/billing-registry'
import { listBillingRegistryRows } from '@/lib/billing-registry-server'
import { getDeliveryModeLabel } from '@/lib/implementation-readiness'
import { summarizeProofRegistry } from '@/lib/proof-registry'
import { listProofRegistryEntries } from '@/lib/proof-registry-server'
import { countSuiteTelemetryEventRows } from '@/lib/telemetry/events'
import { listSuiteTelemetryEventRows } from '@/lib/telemetry/store'
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

  const [data, billingRows, healthRows, proofEntries] = await Promise.all([
    getBeheerPageData(supabase, user.id, {
      selectedOrganizationId: normalizeSearchValue(resolvedSearchParams?.org),
      selectedCampaignId: normalizeSearchValue(resolvedSearchParams?.campaign),
    }),
    listBillingRegistryRows(),
    listSuiteTelemetryEventRows(),
    listProofRegistryEntries(),
  ])

  const {
    orgs,
    activeOrgs,
    archivedOrgs,
    campaigns,
    campaignCountByOrg,
    respondentCount,
    clientAccessCount,
    invites,
    accessAvailable,
    deliveryAvailable,
    pendingInviteCount,
    activeCampaignCount,
    blockedDeliveriesCount,
    setupBlockers,
    dataImportAlert,
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
  const billingSummary = summarizeBillingRegistry(billingRows)
  const healthCounts = countSuiteTelemetryEventRows(healthRows)
  const actionCenterHealth = summarizeActionCenterOpsHealth(healthRows)
  const proofSummary = summarizeProofRegistry(proofEntries)
  const billingReadyCount = billingSummary.readyCount
  const healthAttentionCount =
    (blockedDeliveriesCount ?? 0) +
    healthCounts.manager_denied_insights +
    actionCenterHealth.missingEventTypes.length
  const proofPublicCount = proofSummary.publicUsableCount

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
          { id: 'operations', label: 'Operations' },
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
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                  Actieve setupcontext
                </p>
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
                          {selectedOrganization?.id === organization.id ? 'Actief: ' : ''}
                          {organization.name}
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
                          <span
                            className={`text-xs font-semibold ${
                              org.is_active ? 'text-emerald-700' : 'text-slate-400'
                            }`}
                          >
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
                      Gearchiveerde organisaties blijven zichtbaar voor historie, maar zijn geen standaard
                      setupcontext.
                    </p>
                  ) : null}

                  <div className="border-t border-slate-200 pt-3">
                    <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                      Nieuwe organisatie
                    </p>
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
                    title={
                      selectedOrganization
                        ? `Nieuwe campaign voor ${selectedOrganization.name}`
                        : 'Kies eerst een organisatie'
                    }
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
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                        Campaigns binnen actieve context
                      </p>
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
                            <DashboardChip
                              surface="ops"
                              label={getDeliveryModeLabel(campaign.delivery_mode, campaign.scan_type)}
                              tone="slate"
                            />
                            <span
                              className={`text-xs font-semibold ${
                                selectedCampaign?.id === campaign.id ? 'text-slate-200' : 'text-slate-500'
                              }`}
                            >
                              {campaign.is_active ? 'Actief' : 'Gearchiveerd'}
                            </span>
                          </div>
                          <p
                            className={`mt-2 font-medium ${
                              selectedCampaign?.id === campaign.id ? 'text-white' : 'text-slate-900'
                            }`}
                          >
                            {campaign.name}
                          </p>
                          {hasCampaignAddOn(campaign, 'segment_deep_dive') ? (
                            <p
                              className={`mt-1 text-xs ${
                                selectedCampaign?.id === campaign.id ? 'text-slate-200' : 'text-slate-500'
                              }`}
                            >
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
        eyebrow="Primair na setup"
        title="Kernwerkbanken"
        description="Alleen leads en learnings blijven primaire specialistische routes naast setup. Billing, health en proof zakken weg naar een secundaire operationslaag."
      >
        <div className="grid gap-3 lg:grid-cols-2">
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
        </div>
      </DashboardSection>

      <DashboardSection
        id="operations"
        surface="ops"
        eyebrow="Secundair"
        title="Operations & registries"
        description="Billing, health en proof blijven beschikbaar als bounded controles. Open ze alleen wanneer setup al staat of wanneer een specifieke registry echt nagekeken moet worden."
        aside={<DashboardChip surface="ops" label="Secundaire controllaag" tone="slate" />}
      >
        <DashboardDisclosure
          surface="ops"
          title="Open operations & registries"
          description="Compacte samenvattingen houden billing, health en proof bereikbaar zonder ze als peers van setup, leads of learnings neer te zetten."
        >
          <div className="space-y-4">
            <div className="grid gap-4 lg:grid-cols-3">
              <OperationsRegistryCard
                href="/beheer/billing"
                eyebrow="Billing"
                title="Billing readiness"
                value={`${billingReadyCount}/${billingSummary.total}`}
                body={
                  billingSummary.total === 0
                    ? 'Nog geen assisted billing-rows zichtbaar.'
                    : `${billingSummary.pendingCount} organisatie${billingSummary.pendingCount === 1 ? '' : 's'} wacht op contract of betaalwijze.`
                }
                tone={billingReadyCount > 0 ? 'emerald' : 'amber'}
                detailLines={[
                  accessAvailable
                    ? `${clientAccessCount ?? 0} actieve klanttoegang${clientAccessCount === 1 ? '' : 'en'} zichtbaar`
                    : 'Klanttoegang momenteel niet leesbaar',
                  pendingActivations === 0
                    ? 'Geen activatiewachtrij op beheer'
                    : `${pendingActivations} activatie${pendingActivations === 1 ? '' : 's'} wacht op opvolging`,
                ]}
                actionLabel="Open billing registry"
              />
              <OperationsRegistryCard
                href="/beheer/health"
                eyebrow="Health"
                title="Health-signalen"
                value={`${healthAttentionCount}`}
                body={
                  healthAttentionCount === 0
                    ? 'Geen directe healthaandacht vanuit deliveryblokkades, denied insights of missende Action Center-signalen.'
                    : dataImportAlert?.description ??
                      'Minstens een bounded healthsignaal vraagt nog om opvolging buiten de setupflow.'
                }
                tone={healthAttentionCount > 0 ? 'amber' : 'emerald'}
                detailLines={[
                  deliveryAvailable
                    ? `${blockedDeliveriesCount ?? 0} deliveryblokkade${blockedDeliveriesCount === 1 ? '' : 's'} zichtbaar`
                    : 'Deliverysignalen momenteel niet leesbaar',
                  `${healthCounts.manager_denied_insights} denied insight${healthCounts.manager_denied_insights === 1 ? '' : 's'} en ${actionCenterHealth.missingEventTypes.length} ontbrekende Action Center-flow${actionCenterHealth.missingEventTypes.length === 1 ? '' : 's'}`,
                ]}
                actionLabel="Open health-signalen"
              />
              <OperationsRegistryCard
                href="/beheer/proof"
                eyebrow="Proof"
                title="Proof-status"
                value={`${proofPublicCount} publiek`}
                body={
                  proofSummary.total === 0
                    ? 'Nog geen proof-entries zichtbaar; bewijs blijft voorlopig intern en secundair.'
                    : `${proofSummary.salesUsableCount} sales-usable en ${proofSummary.lessonOnlyCount} lesson-only item${proofSummary.lessonOnlyCount === 1 ? '' : 's'} wachten nog op verdere approval.`
                }
                tone={proofPublicCount > 0 ? 'emerald' : 'slate'}
                detailLines={[
                  `${proofSummary.salesUsableCount} sales-usable`,
                  `${proofSummary.lessonOnlyCount} lesson-only`,
                ]}
                actionLabel="Open proof registry"
              />
            </div>
            <div className="rounded-[20px] border border-slate-200 bg-slate-50 px-5 py-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                Setup-first geheugensteun
              </p>
              <div className="mt-3 grid gap-3 lg:grid-cols-2">
                <p className="text-sm leading-6 text-slate-700">
                  Gebruik billing, health en proof pas nadat de setupflow staat of wanneer een specifieke
                  afwijking dat afdwingt.
                </p>
                <p className="text-sm leading-6 text-slate-700">
                  {setupBlockers.length > 0
                    ? `${setupBlockers.length} setupblokker${setupBlockers.length === 1 ? '' : 's'} staat nog open; begin dus in setup voordat je een registry induikt.`
                    : 'Er staan geen setupblokkers open; specialistische registries blijven daardoor netjes secundair.'}
                </p>
              </div>
            </div>
          </div>
        </DashboardDisclosure>
      </DashboardSection>
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

function OperationsRegistryCard({
  href,
  eyebrow,
  title,
  value,
  body,
  tone,
  detailLines,
  actionLabel,
}: {
  href: string
  eyebrow: string
  title: string
  value: string
  body: string
  tone: 'slate' | 'emerald' | 'amber'
  detailLines: [string, string]
  actionLabel: string
}) {
  return (
    <div className="rounded-[20px] border border-slate-200 bg-white p-5 shadow-[0_8px_24px_rgba(19,32,51,0.04)]">
      <DashboardPanel
        surface="ops"
        eyebrow={eyebrow}
        title={title}
        value={value}
        body={body}
        tone={tone}
      />
      <div className="mt-4 space-y-2 text-xs text-slate-600">
        <p>{detailLines[0]}</p>
        <p>{detailLines[1]}</p>
      </div>
      <Link
        href={href}
        className="mt-4 inline-flex items-center rounded-full border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-slate-50"
      >
        {actionLabel}
      </Link>
    </div>
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
          {done ? 'âœ“' : number}
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

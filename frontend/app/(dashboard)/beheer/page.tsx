import Link from 'next/link'
import { redirect } from 'next/navigation'
import type { ReactNode } from 'react'
import { AddRespondentsForm } from '@/components/dashboard/add-respondents-form'
import { ArchiveOrgButton } from '@/components/dashboard/archive-org-button'
import { ClientAccessList } from '@/components/dashboard/client-access-list'
import { DashboardChip, DashboardDisclosure, DashboardPanel } from '@/components/dashboard/dashboard-primitives'
import { DeleteOrgButton } from '@/components/dashboard/delete-org-button'
import { InviteClientUserForm } from '@/components/dashboard/invite-client-user-form'
import { NewCampaignForm } from '@/components/dashboard/new-campaign-form'
import { NewOrgForm } from '@/components/dashboard/new-org-form'
import { getBeheerPageData } from '@/app/(dashboard)/beheer/get-beheer-page-data'
import { summarizeActionCenterOpsHealth } from '@/lib/action-center-ops-health'
import {
  getBillingRegistryStatusLabel,
  getContractStateLabel,
  summarizeBillingRegistry,
} from '@/lib/billing-registry'
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

type StepCardState = 'active' | 'complete' | 'locked'

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
    invites,
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
  const latestBillingRow = billingRows[0] ?? null
  const healthAttentionCount =
    (blockedDeliveriesCount ?? 0) +
    healthCounts.manager_denied_insights +
    actionCenterHealth.missingEventTypes.length
  const proofPublicCount = proofSummary.publicUsableCount

  const step1State: StepCardState = step1Done ? 'complete' : 'active'
  const step2State: StepCardState = activeOrgs.length === 0 ? 'locked' : step2Done ? 'complete' : 'active'
  const step3State: StepCardState =
    respondentsLocked || !selectedOrganization || !selectedCampaign ? 'locked' : step3Done ? 'complete' : 'active'
  const step4State: StepCardState =
    clientAccessLocked || !selectedOrganization || !selectedCampaign ? 'locked' : step4Done ? 'complete' : 'active'

  return (
    <div className="space-y-8 pb-8">
      <section className="border border-[#d8d0c2] bg-[#f6f2ea]">
        <div className="border-b border-[#ddd5c8] px-5 py-4 sm:px-7">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.28em] text-[#6f6557]">
                Admin console
              </p>
              <h1 className="mt-2 text-[2rem] font-semibold tracking-[-0.05em] text-[#111827] sm:text-[2.45rem]">
                Beheer
              </h1>
              <p className="mt-3 max-w-3xl text-sm leading-6 text-[#4a5565]">
                Nieuwe organisatie en eerste campaign opzetten, daarna pas respondenten en klanttoegang openen.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2 lg:justify-end">
              <DashboardChip
                surface="ops"
                label={`${setupProgressCount}/4 actief`}
                tone={setupProgressCount === 4 ? 'emerald' : 'amber'}
              />
              <DashboardChip surface="ops" label={`${activeOrgs.length} org`} />
              <DashboardChip surface="ops" label={`${activeCampaignCount ?? 0} campaign`} />
            </div>
          </div>
        </div>
        <div className="grid gap-px bg-[#ddd5c8] sm:grid-cols-2 xl:grid-cols-4">
          <SetupMetric
            label="Organisaties"
            value={`${activeOrgs.length}`}
            detail={activeOrgs.length === 1 ? 'actieve organisatie' : 'actieve organisaties'}
          />
          <SetupMetric
            label="Campaigns"
            value={`${activeCampaignCount ?? 0}`}
            detail={(activeCampaignCount ?? 0) === 1 ? 'actieve campaign' : 'actieve campaigns'}
          />
          <SetupMetric
            label="Respondenten"
            value={`${liveRespondentCount}`}
            detail={liveRespondentCount > 0 ? 'gekoppeld aan campaign' : 'nog niet gekoppeld'}
          />
          <SetupMetric
            label="Activaties"
            value={pendingActivations === 0 ? '0' : `${pendingActivations}`}
            detail={pendingActivations === 0 ? 'geen wachtrij' : 'wacht op activatie'}
          />
        </div>
      </section>

      <section className="border border-[#243242] bg-[#1d2a38] px-5 py-5 text-white sm:px-7">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.28em] text-white/62">
              Setupcontext
            </p>
            <h2 className="mt-2 text-xl font-semibold tracking-[-0.04em]">Geselecteerde organisatie en campaign</h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-white/70">
              Respondenten en klanttoegang openen pas echt zodra deze context concreet is.
            </p>
          </div>
          <nav className="flex flex-wrap gap-2">
            <a
              href="#setup"
              className="rounded-full border border-white/15 bg-white/5 px-3 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-white/76 transition hover:bg-white/10"
            >
              Setup
            </a>
            <a
              href="#werkbanken"
              className="rounded-full border border-white/15 bg-white/5 px-3 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-white/76 transition hover:bg-white/10"
            >
              Werkbanken
            </a>
            <a
              href="#operations"
              className="rounded-full border border-white/15 bg-white/5 px-3 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-white/76 transition hover:bg-white/10"
            >
              Registries
            </a>
          </nav>
        </div>
        <div className="mt-5 grid gap-px bg-white/10 lg:grid-cols-2">
          <SetupContextCard
            label="ORG"
            title={selectedOrganization?.name ?? 'Nog geen actieve organisatie'}
            description={
              selectedOrganization
                ? `${selectedOrganizationCampaigns.length} campaign(s) binnen deze setupcontext`
                : 'Maak of kies eerst een organisatie om de campaignflow te openen.'
            }
          >
            <div className="flex flex-wrap gap-2">
              {activeOrgs.length === 0 ? (
                <span className="border border-white/15 bg-white/5 px-3 py-2 text-xs font-semibold text-white/60">
                  Geen actieve organisaties
                </span>
              ) : (
                activeOrgs.map((organization) => (
                  <Link
                    key={organization.id}
                    href={buildSetupHref(organization.id)}
                    className={`px-3 py-2 text-xs font-semibold uppercase tracking-[0.14em] transition ${
                      selectedOrganization?.id === organization.id
                        ? 'border border-[#c88a18] bg-[#c88a18] text-[#111827]'
                        : 'border border-white/15 bg-white/5 text-white/76 hover:bg-white/10'
                    }`}
                  >
                    {organization.name}
                  </Link>
                ))
              )}
            </div>
          </SetupContextCard>
          <SetupContextCard
            label="CAMPAGNE"
            title={selectedCampaign?.name ?? 'Nog geen campaign gekozen'}
            description={
              selectedCampaign
                ? 'Deze campaign stuurt respondentimport en opent daarna klanttoegang.'
                : 'Kies of maak eerst een campaign binnen de geselecteerde organisatie.'
            }
          >
            <div className="flex flex-wrap gap-2">
              {selectedOrganizationCampaigns.length === 0 ? (
                <span className="border border-white/15 bg-white/5 px-3 py-2 text-xs font-semibold text-white/60">
                  Geen campaign in context
                </span>
              ) : (
                selectedOrganizationCampaigns.map((campaign) => (
                  <Link
                    key={campaign.id}
                    href={buildSetupHref(selectedOrganization?.id ?? null, campaign.id)}
                    className={`px-3 py-2 text-xs font-semibold uppercase tracking-[0.14em] transition ${
                      selectedCampaign?.id === campaign.id
                        ? 'border border-[#c88a18] bg-[#c88a18] text-[#111827]'
                        : 'border border-white/15 bg-white/5 text-white/76 hover:bg-white/10'
                    }`}
                  >
                    {campaign.name}
                  </Link>
                ))
              )}
            </div>
          </SetupContextCard>
        </div>
      </section>

      <section id="setup" className="space-y-5">
        <SectionLead
          eyebrow="Setup flow"
          title="Vier vaste stappen, zonder operationsruis bovenaan"
          description="Organisatie en campaign blijven open werkblokken. Respondenten en klanttoegang worden pas actief zodra de setupcontext er klaar voor is."
        />

        <div className="grid gap-5 lg:grid-cols-2">
          <StepCard state={step1State} number={1} title="Organisatie aanmaken" kicker="Altijd open">
            {orgs.length > 0 ? (
              <div className="space-y-3">
                {orgs.map((org) => (
                  <div
                    key={org.id}
                    className="flex items-start justify-between gap-3 border border-[#ded7cb] bg-[#f9f6f0] px-4 py-4 text-sm text-slate-700"
                  >
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={`font-mono text-[11px] font-semibold uppercase tracking-[0.2em] ${
                            org.is_active ? 'text-emerald-700' : 'text-slate-400'
                          }`}
                        >
                          {org.is_active ? 'Actief' : 'Gearchiveerd'}
                        </span>
                        {selectedOrganization?.id === org.id ? (
                          <span className="border border-[#c88a18] bg-[#f4e7c8] px-2 py-1 font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-[#7a5b18]">
                            Setupcontext
                          </span>
                        ) : null}
                      </div>
                      <p className="mt-2 text-base font-semibold tracking-[-0.02em] text-[#111827]">{org.name}</p>
                      <p className="mt-1 text-xs text-slate-500">{campaignCountByOrg[org.id] ?? 0} campaign(s) gekoppeld</p>
                      {org.is_active ? (
                        <Link
                          href={buildSetupHref(org.id)}
                          className="mt-3 inline-flex items-center rounded-full border border-[#111827] bg-white px-3 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-[#111827] transition hover:bg-[#f4f1ea]"
                        >
                          {selectedOrganization?.id === org.id ? 'Actieve organisatie' : 'Kies voor setup'}
                        </Link>
                      ) : null}
                    </div>
                    <div className="flex items-start gap-2">
                      <ArchiveOrgButton orgId={org.id} orgName={org.name} isActive={org.is_active} />
                      <DeleteOrgButton orgId={org.id} orgName={org.name} campaignCount={campaignCountByOrg[org.id] ?? 0} />
                    </div>
                  </div>
                ))}

                {archivedOrgs.length > 0 ? (
                  <p className="text-xs text-slate-500">
                    Gearchiveerde organisaties blijven zichtbaar voor historie, maar zijn geen standaard setupcontext.
                  </p>
                ) : null}

                <div className="border-t border-[#ddd5c8] pt-4">
                  <p className="mb-2 font-mono text-[11px] font-semibold uppercase tracking-[0.22em] text-[#6f6557]">
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

          <StepCard state={step2State} number={2} title="Campaign aanmaken" kicker="Open na organisatie">
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
                      : 'Kies in de donkere setupcontext een organisatie. Je kunt daarna meteen een campaign vastzetten.'
                  }
                  tone="slate"
                />
                <NewCampaignForm orgs={activeOrgs} />

                {selectedOrganizationCampaigns.length > 0 ? (
                  <div className="space-y-2 border-t border-[#ddd5c8] pt-4">
                    <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.22em] text-[#6f6557]">
                      Campaigns binnen actieve context
                    </p>
                    {selectedOrganizationCampaigns.map((campaign) => (
                      <div
                        key={campaign.id}
                        className={`border px-4 py-4 ${
                          selectedCampaign?.id === campaign.id
                            ? 'border-[#111827] bg-[#111827] text-white'
                            : 'border-[#ded7cb] bg-[#f9f6f0] text-slate-700'
                        }`}
                      >
                        <div className="flex flex-wrap items-center gap-2">
                          <DashboardChip
                            surface="ops"
                            label={getDeliveryModeLabel(campaign.delivery_mode, campaign.scan_type)}
                            tone="slate"
                          />
                          <span
                            className={`font-mono text-[11px] font-semibold uppercase tracking-[0.18em] ${
                              selectedCampaign?.id === campaign.id ? 'text-slate-200' : 'text-slate-500'
                            }`}
                          >
                            {campaign.is_active ? 'Actief' : 'Gearchiveerd'}
                          </span>
                        </div>
                        <p
                          className={`mt-2 text-base font-semibold tracking-[-0.02em] ${
                            selectedCampaign?.id === campaign.id ? 'text-white' : 'text-[#111827]'
                          }`}
                        >
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
                            className={`inline-flex items-center rounded-full border px-3 py-2 text-xs font-semibold uppercase tracking-[0.14em] transition ${
                              selectedCampaign?.id === campaign.id
                                ? 'border-white/30 bg-white/10 text-white hover:bg-white/20'
                                : 'border-[#111827] bg-white text-[#111827] hover:bg-[#f4f1ea]'
                            }`}
                          >
                            {selectedCampaign?.id === campaign.id ? 'Actieve campaign' : 'Kies voor setup'}
                          </Link>
                          <Link
                            href={`/campaigns/${campaign.id}`}
                            className={`inline-flex items-center rounded-full border px-3 py-2 text-xs font-semibold uppercase tracking-[0.14em] transition ${
                              selectedCampaign?.id === campaign.id
                                ? 'border-white/30 bg-white/10 text-white hover:bg-white/20'
                                : 'border-[#111827] bg-white text-[#111827] hover:bg-[#f4f1ea]'
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

          <StepCard state={step3State} number={3} title="Respondenten importeren" kicker="Open na campaignselectie" span="full">
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

          <StepCard state={step4State} number={4} title="Klanttoegang activeren" kicker="Open na campaignselectie" span="full">
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
                <div className="space-y-3 border-t border-[#ddd5c8] pt-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.22em] text-[#6f6557]">
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
      </section>

      <section id="werkbanken" className="space-y-4">
        <SectionLead
          eyebrow="Secundair na setup"
          title="Kernwerkbanken"
          description="Leads en learnings blijven bereikbaar, maar ze onderbreken de setupflow niet meer."
        />
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
      </section>

      <section id="operations" className="space-y-4">
        <SectionLead
          eyebrow="Tertiair"
          title="Operations & registries"
          description="Billing, health en proof blijven bounded expertlagen. Ze zijn nu bewust later op de pagina gezet en standaard ingeklapt."
          aside={<DashboardChip surface="ops" label="Secundaire controllaag" tone="slate" />}
        />
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
                  latestBillingRow
                    ? `Contractstatus: ${getContractStateLabel(latestBillingRow.contractState)}`
                    : 'Contractstatus: nog geen registryrow zichtbaar',
                  latestBillingRow
                    ? `Billingstatus: ${getBillingRegistryStatusLabel(latestBillingRow.billingState)}`
                    : 'Billingstatus: nog geen registryrow zichtbaar',
                  `Betaalwijze bevestigd: ${billingRows.filter((row) => row.paymentMethodConfirmed).length}/${billingSummary.total}`,
                  `Assisted launch readiness: ${billingReadyCount}/${billingSummary.total}`,
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
                  `Owner access confirmed: ${healthCounts.owner_access_confirmed}`,
                  `First value confirmed: ${healthCounts.first_value_confirmed}`,
                  `First management use confirmed: ${healthCounts.first_management_use_confirmed}`,
                  `Denied insights: ${healthCounts.manager_denied_insights}`,
                  `Action Center follow-through: ${actionCenterHealth.coveredEventTypes.length}/4 flowtypes zichtbaar`,
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
            <div className="border border-[#ddd5c8] bg-[#f9f6f0] px-5 py-4">
              <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.22em] text-[#6f6557]">
                Setup-first geheugensteun
              </p>
              <div className="mt-3 grid gap-3 lg:grid-cols-2">
                <p className="text-sm leading-6 text-slate-700">
                  Gebruik billing, health en proof pas nadat de setupflow staat of wanneer een specifieke afwijking dat afdwingt.
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
      </section>
    </div>
  )
}

function SectionLead({
  eyebrow,
  title,
  description,
  aside,
}: {
  eyebrow: string
  title: string
  description: string
  aside?: ReactNode
}) {
  return (
    <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
      <div>
        <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.28em] text-[#6f6557]">{eyebrow}</p>
        <h2 className="mt-2 text-[1.55rem] font-semibold tracking-[-0.04em] text-[#111827]">{title}</h2>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-[#4a5565]">{description}</p>
      </div>
      {aside ? <div className="lg:text-right">{aside}</div> : null}
    </div>
  )
}

function SetupMetric({
  label,
  value,
  detail,
}: {
  label: string
  value: string
  detail: string
}) {
  return (
    <div className="bg-white px-5 py-4">
      <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.24em] text-[#6f6557]">{label}</p>
      <p className="mt-2 text-[1.6rem] font-semibold tracking-[-0.04em] text-[#111827]">{value}</p>
      <p className="mt-1 text-xs text-[#6b7280]">{detail}</p>
    </div>
  )
}

function SetupContextCard({
  label,
  title,
  description,
  children,
}: {
  label: string
  title: string
  description: string
  children: ReactNode
}) {
  return (
    <div className="bg-[#243242] px-5 py-4">
      <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.24em] text-white/55">{label}</p>
      <p className="mt-2 text-lg font-semibold tracking-[-0.03em] text-white">{title}</p>
      <p className="mt-2 text-sm leading-6 text-white/70">{description}</p>
      <div className="mt-4">{children}</div>
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
      className="border border-[#ded7cb] bg-[#fbf8f2] px-5 py-5 transition hover:border-[#c8bca8] hover:bg-white"
    >
      <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.22em] text-[#6f6557]">{eyebrow}</p>
      <p className="mt-3 text-lg font-semibold tracking-[-0.03em] text-[#111827]">{title}</p>
      <p className="mt-3 text-sm leading-6 text-[#4a5565]">{body}</p>
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
  detailLines: string[]
  actionLabel: string
}) {
  return (
    <div className="border border-[#ded7cb] bg-white p-5">
      <DashboardPanel surface="ops" eyebrow={eyebrow} title={title} value={value} body={body} tone={tone} />
      <div className="mt-4 space-y-2 text-xs text-slate-600">
        {detailLines.map((line) => (
          <p key={line}>{line}</p>
        ))}
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
  state,
  number,
  title,
  kicker,
  children,
  span = 'half',
}: {
  state: StepCardState
  number: number
  title: string
  kicker: string
  children: ReactNode
  span?: 'half' | 'full'
}) {
  const isComplete = state === 'complete'
  const isLocked = state === 'locked'

  return (
    <section
      className={`relative border bg-white p-5 ${
        span === 'full' ? 'lg:col-span-2' : ''
      } ${
        isLocked
          ? 'border-[#e3ddd1] bg-[#f7f5f1]'
          : isComplete
            ? 'border-[#d7e4dd]'
            : 'border-[#d8d0c2]'
      }`}
    >
      <div
        className={`absolute inset-x-0 top-0 h-1 ${
          isLocked ? 'bg-[#d7d1c8]' : isComplete ? 'bg-[#3c8d8a]' : 'bg-[#c88a18]'
        }`}
      />
      <div className="mb-5 flex items-start justify-between gap-3 pt-2">
        <div className="flex items-center gap-3">
          <div
            className={`flex h-8 w-8 flex-shrink-0 items-center justify-center font-mono text-[11px] font-semibold uppercase tracking-[0.16em] ${
              isLocked
                ? 'border border-[#d8d0c2] bg-white text-[#8b8174]'
                : isComplete
                  ? 'bg-[#3c8d8a] text-white'
                  : 'bg-[#111827] text-white'
            }`}
          >
            {isComplete ? 'OK' : number}
          </div>
          <div>
            <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.22em] text-[#6f6557]">{kicker}</p>
            <h2 className="mt-2 text-[1.05rem] font-semibold tracking-[-0.03em] text-[#111827]">{title}</h2>
          </div>
        </div>
        <div
          className={`border px-3 py-1 font-mono text-[10px] font-semibold uppercase tracking-[0.18em] ${
            isLocked
              ? 'border-[#d8d0c2] bg-white text-[#8b8174]'
              : isComplete
                ? 'border-[#b9d7cd] bg-[#edf7f3] text-[#3c8d8a]'
                : 'border-[#e6d6af] bg-[#fbf5e7] text-[#8c6b1f]'
          }`}
        >
          {isLocked ? 'Locked' : isComplete ? 'Complete' : 'Active'}
        </div>
      </div>
      {children}
    </section>
  )
}

function LockedStep({ message }: { message: string }) {
  return (
    <div className="border border-[#ddd5c8] bg-white px-4 py-4">
      <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.22em] text-[#8c6b1f]">
        Actief na campaignselectie
      </p>
      <p className="mt-2 text-sm leading-6 text-[#5b6573]">{message}</p>
    </div>
  )
}

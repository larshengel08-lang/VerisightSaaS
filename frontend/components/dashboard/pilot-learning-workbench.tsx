'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  DashboardChip,
  DashboardDisclosure,
  DashboardPanel,
} from '@/components/dashboard/dashboard-primitives'
import { buildCustomerExpansionResult } from '@/lib/customer-expansion-suggester'
import {
  getContactDesiredTimingLabel,
  getContactRouteLabel,
  normalizeContactRouteInterest,
} from '@/lib/contact-funnel'
import { getDeliveryModeLabel } from '@/lib/implementation-readiness'
import {
  buildLearningObjectiveSignals,
  CASE_APPROVAL_STATUS_OPTIONS,
  CASE_EVIDENCE_CLOSURE_OPTIONS,
  CASE_OUTCOME_CLASS_OPTIONS,
  CASE_OUTCOME_QUALITY_OPTIONS,
  CASE_PERMISSION_STATUS_OPTIONS,
  CASE_POTENTIAL_OPTIONS,
  getCheckpointDefinition,
  getLearningStatusLabel,
  getLearningStrengthLabel,
  getSuggestedLearningDossierTitle,
  LEARNING_DESTINATION_OPTIONS,
  LEARNING_ROUTE_OPTIONS,
  LEARNING_STRENGTH_OPTIONS,
  LEARNING_TRIAGE_STATUS_OPTIONS,
  type ContactRequestRecord,
  type LearningCheckpointKey,
  type LearningDestinationArea,
  type LearningStrength,
  type LearningTriageStatus,
  type PilotLearningCheckpoint,
  type PilotLearningDossier,
} from '@/lib/pilot-learning'
import { hasCampaignAddOn, type Campaign, type CampaignStats, type Organization } from '@/lib/types'

type DossierDraft = Pick<
  PilotLearningDossier,
  | 'id'
  | 'campaign_id'
  | 'title'
  | 'route_interest'
  | 'triage_status'
  | 'buyer_question'
  | 'expected_first_value'
  | 'buying_reason'
  | 'trust_friction'
  | 'implementation_risk'
  | 'first_management_value'
  | 'first_action_taken'
  | 'review_moment'
  | 'adoption_outcome'
  | 'management_action_outcome'
  | 'next_route'
  | 'stop_reason'
  | 'case_evidence_closure_status'
  | 'case_approval_status'
  | 'case_permission_status'
  | 'case_quote_potential'
  | 'case_reference_potential'
  | 'case_outcome_quality'
  | 'case_outcome_classes'
  | 'claimable_observations'
  | 'supporting_artifacts'
  | 'case_public_summary'
  | 'lead_contact_name'
  | 'lead_organization_name'
  | 'lead_work_email'
  | 'lead_employee_count'
>

type CheckpointDraft = Pick<
  PilotLearningCheckpoint,
  | 'id'
  | 'owner_label'
  | 'status'
  | 'objective_signal_notes'
  | 'qualitative_notes'
  | 'interpreted_observation'
  | 'confirmed_lesson'
  | 'lesson_strength'
  | 'destination_areas'
>

type CreateFormState = {
  campaign_id: string | null
  contact_request_id: string | null
  organization_id: string | null
  title: string
  route_interest: PilotLearningDossier['route_interest']
  buyer_question: string
  expected_first_value: string
  buying_reason: string
  trust_friction: string
  implementation_risk: string
  lead_contact_name: string
  lead_organization_name: string
  lead_work_email: string
  lead_employee_count: string
}

interface Props {
  orgs: Organization[]
  campaigns: Campaign[]
  campaignStats: CampaignStats[]
  leads: ContactRequestRecord[]
  dossiers: PilotLearningDossier[]
  checkpoints: PilotLearningCheckpoint[]
  activeClientAccessByOrg: Record<string, number>
  pendingClientInvitesByOrg: Record<string, number>
  initialLeadId?: string | null
  initialCampaignId?: string | null
}

function buildDossierDrafts(dossiers: PilotLearningDossier[]) {
  return Object.fromEntries(
    dossiers.map((dossier) => [
      dossier.id,
      {
        id: dossier.id,
        campaign_id: dossier.campaign_id,
        title: dossier.title,
        route_interest: dossier.route_interest,
        triage_status: dossier.triage_status,
        buyer_question: dossier.buyer_question,
        expected_first_value: dossier.expected_first_value,
        buying_reason: dossier.buying_reason,
        trust_friction: dossier.trust_friction,
        implementation_risk: dossier.implementation_risk,
        first_management_value: dossier.first_management_value,
        first_action_taken: dossier.first_action_taken,
        review_moment: dossier.review_moment,
        adoption_outcome: dossier.adoption_outcome,
        management_action_outcome: dossier.management_action_outcome,
        next_route: dossier.next_route,
        stop_reason: dossier.stop_reason,
        case_evidence_closure_status: dossier.case_evidence_closure_status,
        case_approval_status: dossier.case_approval_status,
        case_permission_status: dossier.case_permission_status,
        case_quote_potential: dossier.case_quote_potential,
        case_reference_potential: dossier.case_reference_potential,
        case_outcome_quality: dossier.case_outcome_quality,
        case_outcome_classes: dossier.case_outcome_classes,
        claimable_observations: dossier.claimable_observations,
        supporting_artifacts: dossier.supporting_artifacts,
        case_public_summary: dossier.case_public_summary,
        lead_contact_name: dossier.lead_contact_name,
        lead_organization_name: dossier.lead_organization_name,
        lead_work_email: dossier.lead_work_email,
        lead_employee_count: dossier.lead_employee_count,
      } satisfies DossierDraft,
    ]),
  ) as Record<string, DossierDraft>
}

function buildCheckpointDrafts(checkpoints: PilotLearningCheckpoint[]) {
  return Object.fromEntries(
    checkpoints.map((checkpoint) => [
      checkpoint.id,
      {
        id: checkpoint.id,
        owner_label: checkpoint.owner_label,
        status: checkpoint.status,
        objective_signal_notes: checkpoint.objective_signal_notes,
        qualitative_notes: checkpoint.qualitative_notes,
        interpreted_observation: checkpoint.interpreted_observation,
        confirmed_lesson: checkpoint.confirmed_lesson,
        lesson_strength: checkpoint.lesson_strength,
        destination_areas: checkpoint.destination_areas,
      } satisfies CheckpointDraft,
    ]),
  ) as Record<string, CheckpointDraft>
}

function emptyCreateForm(): CreateFormState {
  return {
    campaign_id: null,
    contact_request_id: null,
    organization_id: null,
    title: '',
    route_interest: 'exitscan',
    buyer_question: '',
    expected_first_value: '',
    buying_reason: '',
    trust_friction: '',
    implementation_risk: '',
    lead_contact_name: '',
    lead_organization_name: '',
    lead_work_email: '',
    lead_employee_count: '',
  }
}

function formatAmsterdamDate(value: string) {
  try {
    return new Intl.DateTimeFormat('nl-NL', {
      dateStyle: 'medium',
      timeStyle: 'short',
      timeZone: 'Europe/Amsterdam',
    }).format(new Date(value))
  } catch {
    return value
  }
}

function getCheckpointOrder(key: LearningCheckpointKey) {
  switch (key) {
    case 'lead_route_hypothesis':
      return 0
    case 'implementation_intake':
      return 1
    case 'launch_output':
      return 2
    case 'first_management_use':
      return 3
    case 'follow_up_review':
      return 4
    default:
      return 99
  }
}

function getToneForStatus(status: LearningTriageStatus) {
  switch (status) {
    case 'bevestigd':
    case 'uitgevoerd':
      return 'emerald' as const
    case 'geparkeerd':
      return 'slate' as const
    case 'verworpen':
      return 'amber' as const
    case 'nieuw':
    default:
      return 'blue' as const
  }
}

function getExpansionTone(status: 'aanbevolen' | 'te_overwegen' | 'nu_niet') {
  switch (status) {
    case 'aanbevolen':
      return 'blue' as const
    case 'te_overwegen':
      return 'emerald' as const
    case 'nu_niet':
    default:
      return 'amber' as const
  }
}

function getExpansionStatusLabel(status: 'aanbevolen' | 'te_overwegen' | 'nu_niet') {
  switch (status) {
    case 'aanbevolen':
      return 'Aanbevolen'
    case 'te_overwegen':
      return 'Te overwegen'
    case 'nu_niet':
    default:
      return 'Nu niet'
  }
}

export function PilotLearningWorkbench({
  orgs,
  campaigns,
  campaignStats,
  leads,
  dossiers,
  checkpoints,
  activeClientAccessByOrg,
  pendingClientInvitesByOrg,
  initialLeadId = null,
  initialCampaignId = null,
}: Props) {
  const router = useRouter()
  const campaignById = useMemo(() => Object.fromEntries(campaigns.map((campaign) => [campaign.id, campaign])), [campaigns]) as Record<string, Campaign>
  const orgById = useMemo(() => Object.fromEntries(orgs.map((org) => [org.id, org])), [orgs]) as Record<string, Organization>
  const campaignStatsById = useMemo(() => Object.fromEntries(campaignStats.map((stats) => [stats.campaign_id, stats])), [campaignStats]) as Record<string, CampaignStats>
  const leadById = useMemo(() => Object.fromEntries(leads.map((lead) => [lead.id, lead])), [leads]) as Record<string, ContactRequestRecord>
  const checkpointsByDossier = useMemo(() => {
    const grouped: Record<string, PilotLearningCheckpoint[]> = {}
    for (const checkpoint of checkpoints) {
      grouped[checkpoint.dossier_id] ??= []
      grouped[checkpoint.dossier_id].push(checkpoint)
    }
    return grouped
  }, [checkpoints])

  const [selectedLeadId, setSelectedLeadId] = useState(initialLeadId ?? '')
  const [selectedCampaignId, setSelectedCampaignId] = useState(initialCampaignId ?? '')
  const [createForm, setCreateForm] = useState<CreateFormState>(emptyCreateForm)
  const [createError, setCreateError] = useState<string | null>(null)
  const [createSuccess, setCreateSuccess] = useState<string | null>(null)
  const [creating, setCreating] = useState(false)
  const [dossierDrafts, setDossierDrafts] = useState<Record<string, DossierDraft>>(() => buildDossierDrafts(dossiers))
  const [checkpointDrafts, setCheckpointDrafts] = useState<Record<string, CheckpointDraft>>(() => buildCheckpointDrafts(checkpoints))
  const [saveError, setSaveError] = useState<string | null>(null)
  const [saveMessage, setSaveMessage] = useState<string | null>(null)
  const [savingDossierId, setSavingDossierId] = useState<string | null>(null)
  const [savingCheckpointId, setSavingCheckpointId] = useState<string | null>(null)

  useEffect(() => {
    setDossierDrafts(buildDossierDrafts(dossiers))
  }, [dossiers])

  useEffect(() => {
    setCheckpointDrafts(buildCheckpointDrafts(checkpoints))
  }, [checkpoints])

  useEffect(() => {
    if (!selectedLeadId) {
      setCreateForm((current) => ({
        ...current,
        contact_request_id: null,
      }))
      return
    }
    const lead = leadById[selectedLeadId]
    if (!lead) {
      return
    }
    setCreateForm((current) => ({
      ...current,
      contact_request_id: lead.id,
      route_interest: normalizeContactRouteInterest(lead.route_interest),
      title: getSuggestedLearningDossierTitle({
        routeInterest: normalizeContactRouteInterest(lead.route_interest),
        organizationName: lead.organization,
      }),
      buyer_question: lead.current_question,
      lead_contact_name: lead.name,
      lead_organization_name: lead.organization,
      lead_work_email: lead.work_email,
      lead_employee_count: lead.employee_count,
    }))
  }, [leadById, selectedLeadId])

  useEffect(() => {
    if (!selectedCampaignId) {
      setCreateForm((current) => ({
        ...current,
        organization_id: null,
        campaign_id: null,
      }))
      return
    }
    const campaign = campaignById[selectedCampaignId]
    if (!campaign) {
      return
    }
    setCreateForm((current) => ({
      ...current,
      organization_id: campaign.organization_id,
      campaign_id: campaign.id,
      route_interest: campaign.scan_type === 'exit' ? 'exitscan' : 'retentiescan',
      title: getSuggestedLearningDossierTitle({
        routeInterest: campaign.scan_type === 'exit' ? 'exitscan' : 'retentiescan',
        campaignName: campaign.name,
        organizationName: orgById[campaign.organization_id]?.name,
      }),
    }))
  }, [campaignById, orgById, selectedCampaignId])

  const openDossiers = dossiers.filter((dossier) =>
    dossier.triage_status === 'nieuw' || dossier.triage_status === 'bevestigd',
  ).length
  const confirmedDossiers = dossiers.filter((dossier) => dossier.triage_status === 'bevestigd').length
  const linkedCampaignDossiers = dossiers.filter((dossier) => dossier.campaign_id).length
  const salesUsableDossiers = dossiers.filter(
    (dossier) => dossier.case_evidence_closure_status === 'sales_usable' || dossier.case_evidence_closure_status === 'public_usable',
  ).length
  const approvedCaseProofDossiers = dossiers.filter((dossier) => dossier.case_approval_status === 'approved').length

  async function handleCreate(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setCreating(true)
    setCreateError(null)
    setCreateSuccess(null)

    const response = await fetch('/api/learning-dossiers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(createForm),
    })
    const payload = (await response.json().catch(() => null)) as { detail?: string; message?: string } | null

    if (!response.ok) {
      setCreateError(payload?.detail ?? 'Learningdossier aanmaken mislukt.')
      setCreating(false)
      return
    }

    setCreateSuccess(payload?.message ?? 'Learningdossier aangemaakt.')
    setSelectedLeadId('')
    setSelectedCampaignId('')
    setCreateForm(emptyCreateForm())
    router.refresh()
    setCreating(false)
  }

  function updateDossierDraft<K extends keyof DossierDraft>(id: string, key: K, value: DossierDraft[K]) {
    setDossierDrafts((current) => ({
      ...current,
      [id]: { ...current[id], [key]: value },
    }))
  }

  function updateCheckpointDraft<K extends keyof CheckpointDraft>(id: string, key: K, value: CheckpointDraft[K]) {
    setCheckpointDrafts((current) => ({
      ...current,
      [id]: { ...current[id], [key]: value },
    }))
  }

  async function saveDossier(id: string) {
    setSaveError(null)
    setSaveMessage(null)
    setSavingDossierId(id)
    const response = await fetch(`/api/learning-dossiers/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dossierDrafts[id]),
    })
    const payload = (await response.json().catch(() => null)) as { detail?: string; message?: string } | null
    if (!response.ok) {
      setSaveError(payload?.detail ?? 'Learningdossier opslaan mislukt.')
      setSavingDossierId(null)
      return
    }
    setSaveMessage(payload?.message ?? 'Learningdossier opgeslagen.')
    router.refresh()
    setSavingDossierId(null)
  }

  async function saveCheckpoint(id: string) {
    setSaveError(null)
    setSaveMessage(null)
    setSavingCheckpointId(id)
    const response = await fetch(`/api/learning-checkpoints/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(checkpointDrafts[id]),
    })
    const payload = (await response.json().catch(() => null)) as { detail?: string; message?: string } | null
    if (!response.ok) {
      setSaveError(payload?.detail ?? 'Learningcheckpoint opslaan mislukt.')
      setSavingCheckpointId(null)
      return
    }
    setSaveMessage(payload?.message ?? 'Learningcheckpoint opgeslagen.')
    router.refresh()
    setSavingCheckpointId(null)
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 xl:grid-cols-4">
        <DashboardPanel
          eyebrow="Dossiers"
          title="Open leerwerk"
          value={`${openDossiers}`}
          body="Nieuw en bevestigd werk blijft zichtbaar tot de les expliciet is geparkeerd, uitgevoerd of verworpen."
          tone={openDossiers > 0 ? 'blue' : 'slate'}
        />
        <DashboardPanel
          eyebrow="Triage"
          title="Bevestigde lessen"
          value={`${confirmedDossiers}`}
          body="Gebruik bevestigd voor patronen die expliciet terug moeten naar product, report, onboarding, sales of operations."
          tone={confirmedDossiers > 0 ? 'emerald' : 'slate'}
        />
        <DashboardPanel
          eyebrow="Context"
          title="Campaign-koppeling"
          value={`${linkedCampaignDossiers}/${dossiers.length || 0}`}
          body="Koppel een dossier aan een campaign zodra implementation, launch of managementgebruik in echte delivery meelopen."
          tone={linkedCampaignDossiers > 0 ? 'amber' : 'slate'}
        />
        <DashboardPanel
          eyebrow="Case-proof"
          title="Sales- of public-usable"
          value={`${salesUsableDossiers}/${approvedCaseProofDossiers}`}
          body="Links telt dossiers met closure-status sales/public usable; rechts telt dossiers die de volledige approvalflow al hebben doorlopen."
          tone={approvedCaseProofDossiers > 0 ? 'emerald' : salesUsableDossiers > 0 ? 'blue' : 'slate'}
        />
      </div>

      <form onSubmit={handleCreate} className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="border-b border-slate-100 pb-4">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">Nieuw dossier</p>
          <h2 className="mt-1 text-lg font-semibold text-slate-950">Start vanuit lead of campaign</h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
            Begin compact: kies een lead of campaign als startpunt, leg de eerste buyer-vraag vast en open daarna de vijf vaste checkpoints voor implementation, launch, managementread en follow-up.
          </p>
        </div>

        <div className="mt-5 grid gap-4 xl:grid-cols-2">
          <div>
            <FieldLabel htmlFor="learning-lead">Lead als startpunt</FieldLabel>
            <select id="learning-lead" value={selectedLeadId} onChange={(event) => setSelectedLeadId(event.target.value)} className={fieldClass}>
              <option value="">Geen lead koppelen</option>
              {leads.map((lead) => (
                <option key={lead.id} value={lead.id}>
                  {lead.organization} - {lead.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <FieldLabel htmlFor="learning-campaign">Bestaande campaign</FieldLabel>
            <select id="learning-campaign" value={selectedCampaignId} onChange={(event) => setSelectedCampaignId(event.target.value)} className={fieldClass}>
              <option value="">Nog geen campaign koppelen</option>
              {campaigns.map((campaign) => (
                <option key={campaign.id} value={campaign.id}>
                  {campaign.name} - {orgById[campaign.organization_id]?.name ?? 'Onbekende organisatie'}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-5 grid gap-4 xl:grid-cols-2">
          <TextField label="Dossiernaam" value={createForm.title} onChange={(value) => setCreateForm((current) => ({ ...current, title: value }))} />
          <div>
            <FieldLabel htmlFor="learning-route">Primaire route</FieldLabel>
            <select
              id="learning-route"
              value={createForm.route_interest}
              onChange={(event) => setCreateForm((current) => ({ ...current, route_interest: event.target.value as PilotLearningDossier['route_interest'] }))}
              className={fieldClass}
            >
              {LEARNING_ROUTE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-5 grid gap-4 xl:grid-cols-2">
          <TextAreaField label="Buyer-vraag" value={createForm.buyer_question} onChange={(value) => setCreateForm((current) => ({ ...current, buyer_question: value }))} />
          <TextAreaField label="Verwachte eerste waarde" value={createForm.expected_first_value} onChange={(value) => setCreateForm((current) => ({ ...current, expected_first_value: value }))} />
          <TextAreaField label="Koopreden" value={createForm.buying_reason} onChange={(value) => setCreateForm((current) => ({ ...current, buying_reason: value }))} />
          <TextAreaField label="Trust- of koopfrictie" value={createForm.trust_friction} onChange={(value) => setCreateForm((current) => ({ ...current, trust_friction: value }))} />
        </div>

        <div className="mt-5 grid gap-4 xl:grid-cols-[minmax(0,1fr),minmax(0,1fr)]">
          <TextAreaField label="Implementatierisico" value={createForm.implementation_risk} onChange={(value) => setCreateForm((current) => ({ ...current, implementation_risk: value }))} />
          <div className="grid gap-4 sm:grid-cols-2">
            <TextField label="Leadcontact" value={createForm.lead_contact_name} onChange={(value) => setCreateForm((current) => ({ ...current, lead_contact_name: value }))} />
            <TextField label="Werk e-mail" value={createForm.lead_work_email} onChange={(value) => setCreateForm((current) => ({ ...current, lead_work_email: value }))} />
            <TextField label="Organisatie" value={createForm.lead_organization_name} onChange={(value) => setCreateForm((current) => ({ ...current, lead_organization_name: value }))} />
            <TextField label="Organisatiegrootte" value={createForm.lead_employee_count} onChange={(value) => setCreateForm((current) => ({ ...current, lead_employee_count: value }))} />
          </div>
        </div>

        {createError ? <p className="mt-4 text-sm text-red-600">{createError}</p> : null}
        {createSuccess ? <p className="mt-4 text-sm text-emerald-700">{createSuccess}</p> : null}

        <div className="mt-5 flex flex-wrap gap-3">
          <button type="submit" disabled={creating} className={primaryButtonClass}>
            {creating ? 'Learningdossier wordt aangemaakt...' : 'Learningdossier starten'}
          </button>
          <Link
            href="/beheer/contact-aanvragen"
            className="inline-flex items-center rounded-full border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-blue-200 hover:text-blue-700"
          >
            Open leadlijst
          </Link>
        </div>
      </form>

      {saveError ? <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900">{saveError}</div> : null}
      {saveMessage ? <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">{saveMessage}</div> : null}

      {dossiers.length === 0 ? (
        <div className="rounded-[24px] border border-dashed border-slate-200 bg-slate-50 p-6 text-sm leading-6 text-slate-600">
          Er zijn nog geen learningdossiers. Start hierboven een dossier vanuit een lead of koppel meteen een bestaande campaign zodra implementation of eerste output al loopt.
        </div>
      ) : (
        <div className="space-y-4">
      {dossiers.map((dossier, index) => {
        const draft = dossierDrafts[dossier.id]
        const linkedCampaign = dossier.campaign_id ? campaignById[dossier.campaign_id] : null
        const linkedOrg = dossier.organization_id ? orgById[dossier.organization_id] : null
        const linkedLead = dossier.contact_request_id ? leadById[dossier.contact_request_id] : null
        const dossierCheckpoints = (checkpointsByDossier[dossier.id] ?? []).slice().sort((a, b) => getCheckpointOrder(a.checkpoint_key) - getCheckpointOrder(b.checkpoint_key))
        const linkedCampaignStats = linkedCampaign ? campaignStatsById[linkedCampaign.id] ?? null : null
        const firstManagementCheckpoint = dossierCheckpoints.find((checkpoint) => checkpoint.checkpoint_key === 'first_management_use')
        const expansionResult = linkedCampaign
          ? buildCustomerExpansionResult({
              scanType: linkedCampaign.scan_type,
              deliveryMode: linkedCampaign.delivery_mode ?? null,
              responsesLength: linkedCampaignStats?.total_completed ?? 0,
              hasMinDisplay: (linkedCampaignStats?.total_completed ?? 0) >= 5,
              hasEnoughData: (linkedCampaignStats?.total_completed ?? 0) >= 10,
              firstManagementUseConfirmed:
                firstManagementCheckpoint?.status === 'bevestigd' ||
                firstManagementCheckpoint?.status === 'uitgevoerd' ||
                Boolean(draft.first_management_value || draft.first_action_taken || draft.management_action_outcome),
              followUpAlreadyDecided: Boolean(draft.next_route?.trim()),
              reviewMoment: draft.review_moment,
              firstActionTaken: draft.first_action_taken,
              managementActionOutcome: draft.management_action_outcome,
              nextRouteRecorded: draft.next_route,
              hasSegmentDeepDive: hasCampaignAddOn(linkedCampaign, 'segment_deep_dive'),
              eligibleDepartmentGroupCount: 0,
            })
          : null

        return (
              <DashboardDisclosure
                key={dossier.id}
                title={dossier.title}
                description={`Laatst bijgewerkt op ${formatAmsterdamDate(dossier.updated_at)}. Gebruik dit dossier als vaste plek voor leadcontext, implementationlessen, managementgebruik en follow-up.`}
                defaultOpen={index === 0 || dossier.contact_request_id === initialLeadId || dossier.campaign_id === initialCampaignId}
                badge={<DashboardChip label={getLearningStatusLabel(dossier.triage_status)} tone={getToneForStatus(dossier.triage_status)} />}
              >
                <div className="space-y-5">
                  <div className="flex flex-wrap gap-2">
                    <DashboardChip label={getContactRouteLabel(dossier.route_interest)} tone="blue" />
                    {linkedOrg ? <DashboardChip label={linkedOrg.name} tone="slate" /> : null}
                    {linkedCampaign ? <DashboardChip label={getDeliveryModeLabel(linkedCampaign.delivery_mode ?? null, linkedCampaign.scan_type)} tone="amber" /> : null}
                    {linkedLead?.desired_timing ? <DashboardChip label={getContactDesiredTimingLabel(linkedLead.desired_timing)} tone="amber" /> : null}
                  </div>

                  <div className="grid gap-4 xl:grid-cols-2">
                    <TextField label="Dossiernaam" value={draft.title} onChange={(value) => updateDossierDraft(dossier.id, 'title', value)} />
                    <div>
                      <FieldLabel htmlFor={`dossier-status-${dossier.id}`}>Triage-status</FieldLabel>
                      <select
                        id={`dossier-status-${dossier.id}`}
                        value={draft.triage_status}
                        onChange={(event) => updateDossierDraft(dossier.id, 'triage_status', event.target.value as LearningTriageStatus)}
                        className={fieldClass}
                      >
                        {LEARNING_TRIAGE_STATUS_OPTIONS.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <FieldLabel htmlFor={`dossier-route-${dossier.id}`}>Primaire route</FieldLabel>
                      <select
                        id={`dossier-route-${dossier.id}`}
                        value={draft.route_interest}
                        onChange={(event) => updateDossierDraft(dossier.id, 'route_interest', event.target.value as PilotLearningDossier['route_interest'])}
                        className={fieldClass}
                      >
                        {LEARNING_ROUTE_OPTIONS.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <FieldLabel htmlFor={`dossier-campaign-${dossier.id}`}>Campaign-koppeling</FieldLabel>
                      <select
                        id={`dossier-campaign-${dossier.id}`}
                        value={draft.campaign_id ?? ''}
                        onChange={(event) => updateDossierDraft(dossier.id, 'campaign_id', event.target.value ? event.target.value : null)}
                        className={fieldClass}
                      >
                        <option value="">Nog geen campaign gekoppeld</option>
                        {campaigns.map((campaign) => (
                          <option key={campaign.id} value={campaign.id}>
                            {campaign.name} - {orgById[campaign.organization_id]?.name ?? 'Onbekende organisatie'}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid gap-4 xl:grid-cols-2">
                    <TextAreaField label="Buyer-vraag" value={draft.buyer_question ?? ''} onChange={(value) => updateDossierDraft(dossier.id, 'buyer_question', value)} />
                    <TextAreaField label="Verwachte eerste waarde" value={draft.expected_first_value ?? ''} onChange={(value) => updateDossierDraft(dossier.id, 'expected_first_value', value)} />
                    <TextAreaField label="Koopreden" value={draft.buying_reason ?? ''} onChange={(value) => updateDossierDraft(dossier.id, 'buying_reason', value)} />
                    <TextAreaField label="Trust- of koopfrictie" value={draft.trust_friction ?? ''} onChange={(value) => updateDossierDraft(dossier.id, 'trust_friction', value)} />
                    <TextAreaField label="Implementatierisico" value={draft.implementation_risk ?? ''} onChange={(value) => updateDossierDraft(dossier.id, 'implementation_risk', value)} />
                    <TextAreaField label="Eerste managementwaarde" value={draft.first_management_value ?? ''} onChange={(value) => updateDossierDraft(dossier.id, 'first_management_value', value)} />
                    <TextAreaField label="Eerste actie" value={draft.first_action_taken ?? ''} onChange={(value) => updateDossierDraft(dossier.id, 'first_action_taken', value)} />
                    <TextAreaField label="Reviewmoment" value={draft.review_moment ?? ''} onChange={(value) => updateDossierDraft(dossier.id, 'review_moment', value)} />
                    <TextAreaField label="Adoptionuitkomst" value={draft.adoption_outcome ?? ''} onChange={(value) => updateDossierDraft(dossier.id, 'adoption_outcome', value)} />
                    <TextAreaField label="Managementactie-uitkomst" value={draft.management_action_outcome ?? ''} onChange={(value) => updateDossierDraft(dossier.id, 'management_action_outcome', value)} />
                    <TextAreaField label="Vervolgroute" value={draft.next_route ?? ''} onChange={(value) => updateDossierDraft(dossier.id, 'next_route', value)} />
                    <TextAreaField label="Stopreden" value={draft.stop_reason ?? ''} onChange={(value) => updateDossierDraft(dossier.id, 'stop_reason', value)} />
                  </div>

                  {expansionResult ? (
                    <div className="rounded-[22px] border border-emerald-100 bg-emerald-50/50 p-5">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold text-slate-950">Customer expansion suggester</p>
                          <p className="mt-1 text-sm leading-6 text-slate-600">{expansionResult.summary}</p>
                        </div>
                        <DashboardChip
                          label={
                            expansionResult.readiness === 'already_decided'
                              ? 'Follow-up vastgelegd'
                              : expansionResult.readiness === 'ready'
                                ? 'Suggestie actief'
                                : 'Nog niet klaar'
                          }
                          tone={
                            expansionResult.readiness === 'already_decided'
                              ? 'emerald'
                              : expansionResult.readiness === 'ready'
                                ? 'blue'
                                : 'amber'
                          }
                        />
                      </div>

                      {expansionResult.blockers.length > 0 ? (
                        <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-6 text-slate-700">
                          {expansionResult.blockers.join(' ')}
                        </div>
                      ) : null}

                      <div className="mt-4 grid gap-4 xl:grid-cols-2">
                        {expansionResult.suggestions.map((suggestion) => (
                          <div key={suggestion.routeKey} className="rounded-2xl border border-white/80 bg-white px-4 py-4">
                            <div className="flex flex-wrap items-start justify-between gap-3">
                              <div>
                                <p className="text-sm font-semibold text-slate-950">{suggestion.label}</p>
                                <p className="mt-1 text-xs uppercase tracking-[0.16em] text-slate-500">
                                  {getExpansionStatusLabel(suggestion.status)}
                                </p>
                              </div>
                              <DashboardChip label={suggestion.confidence} tone={getExpansionTone(suggestion.status)} />
                            </div>
                            <p className="mt-3 text-sm leading-6 text-slate-700">{suggestion.rationale}</p>
                            <p className="mt-2 text-sm leading-6 text-slate-600">{suggestion.guardrail}</p>
                            {suggestion.status !== 'nu_niet' ? (
                              <button
                                type="button"
                                onClick={() => updateDossierDraft(dossier.id, 'next_route', suggestion.applyLabel)}
                                className="mt-4 inline-flex items-center rounded-full border border-emerald-200 bg-emerald-100 px-4 py-2 text-sm font-semibold text-emerald-900 transition hover:border-emerald-300 hover:bg-emerald-200"
                              >
                                Neem over als next route
                              </button>
                            ) : null}
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : null}

                  <div className="rounded-[22px] border border-blue-100 bg-blue-50/60 p-5">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-slate-950">Case-readiness en evidence governance</p>
                        <p className="mt-1 text-sm leading-6 text-slate-600">
                          Deze velden bepalen of een les alleen intern blijft, al bruikbaar is in sales of later pas als approved case-proof naar buiten mag.
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <DashboardChip label={draft.case_evidence_closure_status.replaceAll('_', ' ')} tone="blue" />
                        <DashboardChip label={draft.case_approval_status.replaceAll('_', ' ')} tone="slate" />
                      </div>
                    </div>

                    <div className="mt-4 grid gap-4 xl:grid-cols-3">
                      <div>
                        <FieldLabel htmlFor={`case-closure-${dossier.id}`}>Closure-status</FieldLabel>
                        <select
                          id={`case-closure-${dossier.id}`}
                          value={draft.case_evidence_closure_status}
                          onChange={(event) => updateDossierDraft(dossier.id, 'case_evidence_closure_status', event.target.value as DossierDraft['case_evidence_closure_status'])}
                          className={fieldClass}
                        >
                          {CASE_EVIDENCE_CLOSURE_OPTIONS.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <FieldLabel htmlFor={`case-approval-${dossier.id}`}>Approvalstatus</FieldLabel>
                        <select
                          id={`case-approval-${dossier.id}`}
                          value={draft.case_approval_status}
                          onChange={(event) => updateDossierDraft(dossier.id, 'case_approval_status', event.target.value as DossierDraft['case_approval_status'])}
                          className={fieldClass}
                        >
                          {CASE_APPROVAL_STATUS_OPTIONS.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <FieldLabel htmlFor={`case-permission-${dossier.id}`}>Toestemmingstatus</FieldLabel>
                        <select
                          id={`case-permission-${dossier.id}`}
                          value={draft.case_permission_status}
                          onChange={(event) => updateDossierDraft(dossier.id, 'case_permission_status', event.target.value as DossierDraft['case_permission_status'])}
                          className={fieldClass}
                        >
                          {CASE_PERMISSION_STATUS_OPTIONS.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="mt-4 grid gap-4 xl:grid-cols-3">
                      <div>
                        <FieldLabel htmlFor={`case-quote-${dossier.id}`}>Quote-potentie</FieldLabel>
                        <select
                          id={`case-quote-${dossier.id}`}
                          value={draft.case_quote_potential}
                          onChange={(event) => updateDossierDraft(dossier.id, 'case_quote_potential', event.target.value as DossierDraft['case_quote_potential'])}
                          className={fieldClass}
                        >
                          {CASE_POTENTIAL_OPTIONS.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <FieldLabel htmlFor={`case-reference-${dossier.id}`}>Referentiepotentie</FieldLabel>
                        <select
                          id={`case-reference-${dossier.id}`}
                          value={draft.case_reference_potential}
                          onChange={(event) => updateDossierDraft(dossier.id, 'case_reference_potential', event.target.value as DossierDraft['case_reference_potential'])}
                          className={fieldClass}
                        >
                          {CASE_POTENTIAL_OPTIONS.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <FieldLabel htmlFor={`case-outcome-quality-${dossier.id}`}>Outcome-kwaliteit</FieldLabel>
                        <select
                          id={`case-outcome-quality-${dossier.id}`}
                          value={draft.case_outcome_quality}
                          onChange={(event) => updateDossierDraft(dossier.id, 'case_outcome_quality', event.target.value as DossierDraft['case_outcome_quality'])}
                          className={fieldClass}
                        >
                          {CASE_OUTCOME_QUALITY_OPTIONS.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="mt-4 grid gap-4 xl:grid-cols-2">
                      <TextAreaField label="Claimbare observaties" value={draft.claimable_observations ?? ''} onChange={(value) => updateDossierDraft(dossier.id, 'claimable_observations', value)} />
                      <TextAreaField label="Supporting artifacts" value={draft.supporting_artifacts ?? ''} onChange={(value) => updateDossierDraft(dossier.id, 'supporting_artifacts', value)} />
                      <TextAreaField label="Buyer-safe summary" value={draft.case_public_summary ?? ''} onChange={(value) => updateDossierDraft(dossier.id, 'case_public_summary', value)} />
                    </div>

                    <div className="mt-4">
                      <p className="text-sm font-medium text-slate-900">Outcome-klassen</p>
                      <div className="mt-3 flex flex-wrap gap-3">
                        {CASE_OUTCOME_CLASS_OPTIONS.map((option) => {
                          const checked = draft.case_outcome_classes.includes(option.value)
                          return (
                            <label
                              key={option.value}
                              className={`inline-flex items-center gap-2 rounded-full border px-3 py-2 text-sm ${
                                checked ? 'border-blue-200 bg-white text-blue-900' : 'border-blue-100 bg-blue-50 text-slate-700'
                              }`}
                            >
                              <input
                                type="checkbox"
                                checked={checked}
                                onChange={() => {
                                  const current = draft.case_outcome_classes
                                  updateDossierDraft(
                                    dossier.id,
                                    'case_outcome_classes',
                                    checked ? current.filter((entry) => entry !== option.value) : [...current, option.value],
                                  )
                                }}
                                className="rounded"
                              />
                              {option.label}
                            </label>
                          )
                        })}
                      </div>
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    <TextField label="Leadcontact" value={draft.lead_contact_name ?? ''} onChange={(value) => updateDossierDraft(dossier.id, 'lead_contact_name', value)} />
                    <TextField label="Werk e-mail" value={draft.lead_work_email ?? ''} onChange={(value) => updateDossierDraft(dossier.id, 'lead_work_email', value)} />
                    <TextField label="Organisatie" value={draft.lead_organization_name ?? ''} onChange={(value) => updateDossierDraft(dossier.id, 'lead_organization_name', value)} />
                    <TextField label="Organisatiegrootte" value={draft.lead_employee_count ?? ''} onChange={(value) => updateDossierDraft(dossier.id, 'lead_employee_count', value)} />
                  </div>

                  <div className="flex flex-wrap gap-3">
                    <button type="button" onClick={() => void saveDossier(dossier.id)} disabled={savingDossierId === dossier.id} className={primaryButtonClass}>
                      {savingDossierId === dossier.id ? 'Dossier wordt opgeslagen...' : 'Dossier opslaan'}
                    </button>
                    {linkedCampaign ? (
                      <Link
                        href={`/campaigns/${linkedCampaign.id}`}
                        className="inline-flex items-center rounded-full border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-blue-200 hover:text-blue-700"
                      >
                        Open campaign
                      </Link>
                    ) : null}
                  </div>

                  <div className="space-y-4">
                    {dossierCheckpoints.map((checkpoint) => {
                      const checkpointDraft = checkpointDrafts[checkpoint.id]
                      const definition = getCheckpointDefinition(checkpoint.checkpoint_key)
                      const objectiveSignals = buildLearningObjectiveSignals({
                        checkpointKey: checkpoint.checkpoint_key,
                        dossier,
                        contactRequest: linkedLead ?? null,
                        campaignStats: dossier.campaign_id ? campaignStatsById[dossier.campaign_id] ?? null : null,
                        activeClientAccessCount: dossier.organization_id ? activeClientAccessByOrg[dossier.organization_id] ?? 0 : 0,
                        pendingClientInviteCount: dossier.organization_id ? pendingClientInvitesByOrg[dossier.organization_id] ?? 0 : 0,
                      })

                      return (
                        <div key={checkpoint.id} className="rounded-[22px] border border-slate-200 bg-slate-50/70 p-4">
                          <div className="flex flex-wrap items-start justify-between gap-3">
                            <div>
                              <p className="text-sm font-semibold text-slate-950">{definition?.title ?? checkpoint.checkpoint_key}</p>
                              <p className="mt-1 text-xs leading-5 text-slate-500">{definition?.description ?? 'Vaste capturestap in de learningroute.'}</p>
                            </div>
                            <div className="flex flex-wrap gap-2">
                              <DashboardChip label={getLearningStatusLabel(checkpoint.status)} tone={getToneForStatus(checkpoint.status)} />
                              <DashboardChip label={getLearningStrengthLabel(checkpoint.lesson_strength)} tone="slate" />
                            </div>
                          </div>

                          <div className="mt-4 rounded-2xl border border-white/80 bg-white/90 p-4">
                            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Systemsuggesties</p>
                            <ul className="mt-3 space-y-2 text-sm leading-6 text-slate-700">
                              {objectiveSignals.map((item) => (
                                <li key={item} className="rounded-2xl border border-slate-100 bg-slate-50 px-3 py-2">
                                  {item}
                                </li>
                              ))}
                            </ul>
                          </div>

                          <div className="mt-4 grid gap-4 xl:grid-cols-2">
                            <TextField label="Eigenaar" value={checkpointDraft.owner_label} onChange={(value) => updateCheckpointDraft(checkpoint.id, 'owner_label', value)} />
                            <div className="grid gap-4 sm:grid-cols-2">
                              <div>
                                <FieldLabel htmlFor={`checkpoint-status-${checkpoint.id}`}>Status</FieldLabel>
                                <select
                                  id={`checkpoint-status-${checkpoint.id}`}
                                  value={checkpointDraft.status}
                                  onChange={(event) => updateCheckpointDraft(checkpoint.id, 'status', event.target.value as LearningTriageStatus)}
                                  className={fieldClass}
                                >
                                  {LEARNING_TRIAGE_STATUS_OPTIONS.map((option) => (
                                    <option key={option.value} value={option.value}>
                                      {option.label}
                                    </option>
                                  ))}
                                </select>
                              </div>
                              <div>
                                <FieldLabel htmlFor={`checkpoint-strength-${checkpoint.id}`}>Patroonsterkte</FieldLabel>
                                <select
                                  id={`checkpoint-strength-${checkpoint.id}`}
                                  value={checkpointDraft.lesson_strength}
                                  onChange={(event) => updateCheckpointDraft(checkpoint.id, 'lesson_strength', event.target.value as LearningStrength)}
                                  className={fieldClass}
                                >
                                  {LEARNING_STRENGTH_OPTIONS.map((option) => (
                                    <option key={option.value} value={option.value}>
                                      {option.label}
                                    </option>
                                  ))}
                                </select>
                              </div>
                            </div>
                          </div>

                          <div className="mt-4 grid gap-4 xl:grid-cols-2">
                            <TextAreaField label="Aanvullende objective-signal notities" value={checkpointDraft.objective_signal_notes ?? ''} onChange={(value) => updateCheckpointDraft(checkpoint.id, 'objective_signal_notes', value)} />
                            <TextAreaField label="Kwalitatieve notities" value={checkpointDraft.qualitative_notes ?? ''} onChange={(value) => updateCheckpointDraft(checkpoint.id, 'qualitative_notes', value)} />
                            <TextAreaField label="Geïnterpreteerde observatie" value={checkpointDraft.interpreted_observation ?? ''} onChange={(value) => updateCheckpointDraft(checkpoint.id, 'interpreted_observation', value)} />
                            <TextAreaField label="Confirmed lesson" value={checkpointDraft.confirmed_lesson ?? ''} onChange={(value) => updateCheckpointDraft(checkpoint.id, 'confirmed_lesson', value)} />
                          </div>

                          <div className="mt-4">
                            <p className="text-sm font-medium text-slate-900">Bestemmingen</p>
                            <div className="mt-3 flex flex-wrap gap-3">
                              {LEARNING_DESTINATION_OPTIONS.map((option) => {
                                const checked = checkpointDraft.destination_areas.includes(option.value)
                                return (
                                  <label
                                    key={option.value}
                                    className={`inline-flex items-center gap-2 rounded-full border px-3 py-2 text-sm ${
                                      checked ? 'border-blue-200 bg-blue-50 text-blue-900' : 'border-slate-200 bg-white text-slate-700'
                                    }`}
                                  >
                                    <input
                                      type="checkbox"
                                      checked={checked}
                                      onChange={() => {
                                        const current = checkpointDraft.destination_areas
                                        updateCheckpointDraft(
                                          checkpoint.id,
                                          'destination_areas',
                                          checked ? current.filter((entry) => entry !== option.value) : [...current, option.value as LearningDestinationArea],
                                        )
                                      }}
                                      className="rounded"
                                    />
                                    {option.label}
                                  </label>
                                )
                              })}
                            </div>
                          </div>

                          <div className="mt-4 flex flex-wrap items-center gap-3">
                            <button type="button" onClick={() => void saveCheckpoint(checkpoint.id)} disabled={savingCheckpointId === checkpoint.id} className={primaryButtonClass}>
                              {savingCheckpointId === checkpoint.id ? 'Checkpoint wordt opgeslagen...' : 'Checkpoint opslaan'}
                            </button>
                            <span className="text-xs text-slate-500">Laatst bijgewerkt op {formatAmsterdamDate(checkpoint.updated_at)}.</span>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </DashboardDisclosure>
            )
          })}
        </div>
      )}
    </div>
  )
}

function FieldLabel({ children, htmlFor }: { children: string; htmlFor?: string }) {
  return (
    <label htmlFor={htmlFor} className="mb-1 block text-sm font-medium text-slate-700">
      {children}
    </label>
  )
}

function TextField({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <div>
      <FieldLabel>{label}</FieldLabel>
      <input type="text" value={value} onChange={(event) => onChange(event.target.value)} className={fieldClass} />
    </div>
  )
}

function TextAreaField({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <div>
      <FieldLabel>{label}</FieldLabel>
      <textarea value={value} onChange={(event) => onChange(event.target.value)} rows={4} className={`${fieldClass} min-h-28 resize-y`} />
    </div>
  )
}

const fieldClass =
  'w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100'

const primaryButtonClass =
  'inline-flex items-center rounded-full bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60'

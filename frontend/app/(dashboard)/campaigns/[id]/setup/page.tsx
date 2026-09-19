import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { readReminderChoice } from '@/lib/campaign-schedule'
import { SetupWizardCard } from '@/components/dashboard/setup-wizard-card'

interface Props {
  params: Promise<{ id: string }>
}

export default async function CampaignSetupPage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) notFound()

  const [{ data: campaign }, { data: delivery }, { data: respondentDepts }] = await Promise.all([
    supabase
      .from('campaigns')
      .select('id, public_survey_token, scan_type, name, closes_at, comms_mode, organization_id, segment_departments')
      .eq('id', id)
      .maybeSingle(),
    supabase
      .from('campaign_delivery_records')
      .select('launch_date, invited_count, launch_confirmed_at, reminder_config')
      .eq('campaign_id', id)
      .maybeSingle(),
    supabase
      .from('respondents')
      .select('department')
      .eq('campaign_id', id)
      .not('department', 'is', null),
  ])

  if (!campaign) notFound()

  // Dezelfde gate als op het dashboard (spec 2026-09-11 par. 9): zonder deze
  // check opent een meelezend lid de wizard via de directe URL en krijgt pas
  // bij opslaan een weigering.
  const [{ data: profile }, { data: membership }] = await Promise.all([
    supabase.from('profiles').select('is_verisight_admin').eq('id', user.id).maybeSingle(),
    supabase
      .from('org_members')
      .select('role')
      .eq('org_id', (campaign as Record<string, unknown>).organization_id as string)
      .eq('user_id', user.id)
      .maybeSingle(),
  ])
  if (profile?.is_verisight_admin !== true && membership?.role !== 'owner') {
    redirect(`/campaigns/${id}`)
  }

  const departmentResponseCounts: Record<string, number> = {}
  for (const r of respondentDepts ?? []) {
    const dept = r.department as string | null
    if (dept) departmentResponseCounts[dept] = (departmentResponseCounts[dept] ?? 0) + 1
  }

  // Al gelanceerd: wizard niet meer nodig
  if (delivery?.launch_confirmed_at) {
    redirect(`/campaigns/${id}`)
  }

  const { data: orgData } = await supabase
    .from('organizations')
    .select('name')
    .eq('id', (campaign as Record<string, unknown>).organization_id as string)
    .maybeSingle()

  const organizationName = orgData?.name ?? 'je organisatie'
  const frontendBaseUrl =
    process.env.NEXT_PUBLIC_FRONTEND_URL ?? 'https://getloep.nl'

  return (
    <div className="space-y-6">
      <SetupWizardCard
        campaignId={id}
        scanType={campaign.scan_type}
        organizationName={organizationName}
        publicSurveyToken={(campaign as Record<string, unknown>).public_survey_token as string}
        frontendBaseUrl={frontendBaseUrl}
        initialLaunchDate={delivery?.launch_date ?? null}
        initialInvitedCount={delivery?.invited_count ?? null}
        initialClosesAt={((campaign as Record<string, unknown>).closes_at as string | null) ?? null}
        initialReminderChoice={readReminderChoice(delivery?.reminder_config)}
        segmentDepartments={(campaign as Record<string, unknown>).segment_departments as
          | { label: string; slug: string; invited_count?: number }[]
          | null}
        departmentResponseCounts={departmentResponseCounts}
      />
    </div>
  )
}

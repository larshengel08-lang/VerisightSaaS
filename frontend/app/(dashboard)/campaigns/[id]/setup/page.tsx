import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { SetupWizardCard } from '@/components/dashboard/setup-wizard-card'

interface Props {
  params: Promise<{ id: string }>
}

export default async function CampaignSetupPage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) notFound()

  const [{ data: campaign }, { data: delivery }, { data: orgData }] = await Promise.all([
    supabase
      .from('campaigns')
      .select('id, public_survey_token, scan_type, name, closes_at, comms_mode')
      .eq('id', id)
      .maybeSingle(),
    supabase
      .from('campaign_delivery_records')
      .select('launch_date, invited_count, launch_confirmed_at')
      .eq('campaign_id', id)
      .maybeSingle(),
    supabase
      .from('org_members')
      .select('organizations(name)')
      .eq('user_id', user.id)
      .maybeSingle(),
  ])

  if (!campaign) notFound()

  // Al gelanceerd — wizard niet meer nodig
  if (delivery?.launch_confirmed_at) {
    redirect(`/campaigns/${id}`)
  }

  const organizationName =
    (orgData as { organizations?: { name?: string } | null } | null)
      ?.organizations?.name ?? 'je organisatie'
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
      />
    </div>
  )
}

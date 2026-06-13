import { redirect } from 'next/navigation'

// Thin shell: the spec's setup wizard belongs to subsystem 2 (Email/participant spec).
// Until that ships, /campaigns/[id]/setup redirects to the existing launch-config route.
// Dashboard State 1 links here so the wizard can replace this shell without changing links.
export default async function CampaignSetupPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  redirect(`/campaigns/${id}/beheer`)
}

import Link from 'next/link'
import { redirect } from 'next/navigation'
import {
  DashboardHero,
  DashboardPanel,
  DashboardSection,
} from '@/components/dashboard/dashboard-primitives'
import { createClient } from '@/lib/supabase/server'

export default async function ActionCenterRehearsalPage() {
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

  return (
    <div className="space-y-6">
      <DashboardHero
        surface="ops"
        tone="slate"
        eyebrow="Rehearsal pack"
        title="First-route onboarding and support rehearsal"
        description="Gebruik deze bounded drill voor één routefamily tegelijk, met een HR-operator, een managerparticipant en precies een support interruption drill. Geen routeverbreding en geen proof-claim."
        actions={
          <Link
            href="/beheer/action-center-governance"
            className="inline-flex items-center rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-slate-50"
          >
            Terug naar governance controls
          </Link>
        }
      />

      <DashboardSection
        title="Run"
        description="Voer eerst de HR- en managerflow uit, en pas daarna de support interruption drill."
      >
        <div className="grid gap-4 lg:grid-cols-3">
          <DashboardPanel title="Stap 1" value="Preflight" body="Controleer routefamily, eigenaar, reviewmoment en closeout-grens." tone="slate" />
          <DashboardPanel title="Stap 2" value="First route" body="Loop de eerste route door met HR en manager zonder extra uitleg buiten de pack." tone="emerald" />
          <DashboardPanel title="Stap 3" value="Support interruption drill" body="Forceer een bounded supportvraag en leg de access-log en escalatieroute vast." tone="amber" />
        </div>
      </DashboardSection>
    </div>
  )
}

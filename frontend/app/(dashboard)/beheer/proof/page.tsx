import React from 'react'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { DashboardChip, DashboardHero, DashboardPanel, DashboardSection } from '@/components/dashboard/dashboard-primitives'
import { createClient } from '@/lib/supabase/server'

export default async function ProofPage() {
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
        eyebrow="Case proof"
        title="Case proof registry"
        description="Gebruik deze laag om pilots en semireële runs door de proof ladder te bewegen zonder sample-output als klantbewijs te verkopen."
        meta={
          <>
            <DashboardChip surface="ops" label="sales_usable" tone="amber" />
            <DashboardChip surface="ops" label="public_usable" tone="emerald" />
          </>
        }
        actions={
          <Link
            href="/beheer"
            className="inline-flex items-center rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-slate-50"
          >
            Terug naar beheer
          </Link>
        }
      />

      <DashboardSection title="Approval ladder" description="Public proof ontstaat pas na expliciete approval en provenance.">
        <div className="grid gap-4 lg:grid-cols-3">
          <DashboardPanel title="lesson_only" body="Waardevolle interne les, nog geen extern bewijs." tone="slate" />
          <DashboardPanel title="sales_usable" body="Buyer-safe in directe salescontext na claim check." tone="amber" />
          <DashboardPanel title="public_usable" body="Pas geschikt voor publieke inzet na volledige approval." tone="emerald" />
        </div>
      </DashboardSection>
    </div>
  )
}

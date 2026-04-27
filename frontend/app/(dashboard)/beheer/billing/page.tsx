import React from 'react'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { DashboardChip, DashboardHero, DashboardPanel, DashboardSection } from '@/components/dashboard/dashboard-primitives'
import { getBillingReadinessCopy, getBillingRegistryStatusLabel, type BillingRegistryRow } from '@/lib/billing-registry'
import { createClient } from '@/lib/supabase/server'

const sampleRegistryRows: BillingRegistryRow[] = [
  {
    orgId: 'verisight-demo',
    legalCustomerName: 'Verisight Demo Org',
    contractState: 'signed',
    billingState: 'active_manual',
    paymentMethodConfirmed: true,
  },
]

export default async function BillingPage() {
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

  const readinessCopy = getBillingReadinessCopy({
    contractSigned: true,
    paymentMethodConfirmed: true,
  })

  return (
    <div className="space-y-6">
      <DashboardHero
        surface="ops"
        tone="slate"
        eyebrow="Billing en self-serve"
        title="Billing registry"
        description="Maak contract-, betaal- en activatiewaarheid expliciet zonder checkout-first fictie. Dit blijft een admin-only operating surface voor assisted suite-activatie."
        meta={
          <>
            <DashboardChip surface="ops" label="Actief (handmatig)" tone="emerald" />
            <DashboardChip surface="ops" label="Geen Stripe of checkout in deze fase" />
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

      <DashboardSection title="Bounded runtime truth" description={readinessCopy}>
        <div className="grid gap-4 lg:grid-cols-2">
          <DashboardPanel
            title="Registryregels"
            body="Contract en betaalwijze worden intern bevestigd voordat assisted launch readiness groen wordt."
            tone="slate"
          />
          <DashboardPanel
            title="Klantsignaal"
            body="Customer-facing readiness signal blijft bewust compact en niet-transactioneel."
            tone="emerald"
          />
        </div>
      </DashboardSection>

      <DashboardSection
        title="Actuele billing registry"
        description="Voorbeeldweergave van de huidige assisted registry. Seat- of planlogica bestaat hier bewust niet."
      >
        <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
              <tr>
                <th className="px-5 py-4">Organisatie</th>
                <th className="px-5 py-4">Contract</th>
                <th className="px-5 py-4">Billing</th>
                <th className="px-5 py-4">Betaalwijze</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {sampleRegistryRows.map((row) => (
                <tr key={row.orgId}>
                  <td className="px-5 py-4 font-medium text-slate-900">{row.legalCustomerName}</td>
                  <td className="px-5 py-4 text-slate-600">{row.contractState}</td>
                  <td className="px-5 py-4 text-slate-600">{getBillingRegistryStatusLabel(row.billingState)}</td>
                  <td className="px-5 py-4 text-slate-600">{row.paymentMethodConfirmed ? 'Bevestigd' : 'Openstaand'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </DashboardSection>
    </div>
  )
}

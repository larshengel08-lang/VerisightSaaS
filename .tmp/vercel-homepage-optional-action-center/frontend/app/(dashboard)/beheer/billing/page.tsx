import React from 'react'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { DashboardChip, DashboardHero, DashboardPanel, DashboardSection } from '@/components/dashboard/dashboard-primitives'
import {
  getBillingReadinessCopy,
  getBillingRegistryStatusLabel,
  getContractStateLabel,
  summarizeBillingRegistry,
} from '@/lib/billing-registry'
import { listBillingRegistryRows } from '@/lib/billing-registry-server'
import { createClient } from '@/lib/supabase/server'

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

  const registryRows = await listBillingRegistryRows()
  const summary = summarizeBillingRegistry(registryRows)
  const readinessCopy = getBillingReadinessCopy({
    contractSigned: summary.readyCount > 0,
    paymentMethodConfirmed: summary.readyCount > 0,
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
            <DashboardChip surface="ops" label={`${summary.readyCount} launch-ready`} tone="emerald" />
            <DashboardChip surface="ops" label={`${summary.pendingCount} nog assisted te bevestigen`} />
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
            body="Contract en betaalwijze worden intern bevestigd voordat assisted launch readiness groen wordt. Deze page leest nu direct uit de live billing_registry."
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
        description="Live assisted registry zonder seat- of planlogica. De status hieronder komt direct uit de huidige billing_registry-tabel."
      >
        <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
              <tr>
                <th className="px-5 py-4">Organisatie</th>
                <th className="px-5 py-4">Juridische naam</th>
                <th className="px-5 py-4">Contract</th>
                <th className="px-5 py-4">Billing</th>
                <th className="px-5 py-4">Betaalwijze</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {registryRows.map((row) => (
                <tr key={row.orgId}>
                  <td className="px-5 py-4 font-medium text-slate-900">{row.organizationName ?? row.legalCustomerName}</td>
                  <td className="px-5 py-4 text-slate-600">{row.legalCustomerName}</td>
                  <td className="px-5 py-4 text-slate-600">{getContractStateLabel(row.contractState)}</td>
                  <td className="px-5 py-4 text-slate-600">{getBillingRegistryStatusLabel(row.billingState)}</td>
                  <td className="px-5 py-4 text-slate-600">{row.paymentMethodConfirmed ? 'Bevestigd' : 'Openstaand'}</td>
                </tr>
              ))}
              {registryRows.length === 0 ? (
                <tr>
                  <td className="px-5 py-5 text-slate-500" colSpan={5}>
                    Nog geen live billing registryregels. Seed of assisted intake vult deze surface zodra een eerste suite-traject wordt klaargezet.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </DashboardSection>
    </div>
  )
}

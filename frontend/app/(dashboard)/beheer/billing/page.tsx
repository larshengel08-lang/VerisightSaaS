import React from 'react'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { DashboardChip, DashboardDisclosure, DashboardHero, DashboardPanel, DashboardSection } from '@/components/dashboard/dashboard-primitives'
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
        eyebrow="Transition deep link"
        title="Billing transition registry"
        description="Gebruik deze route als expert registry voor contract, betaalwijze en launch-readiness zodra setup of delivery daar expliciet om vraagt. Dit blijft een tijdelijke verdiepingslaag, geen primaire beheerbestemming."
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

      <DashboardSection
        title="Expert registry"
        description="Open deze deep link alleen wanneer billingwaarheid of assisted launch-readiness het setupspoor echt blokkeert."
      >
        <div className="grid gap-4 lg:grid-cols-3">
          <DashboardPanel title="Launch-ready" value={`${summary.readyCount}`} body="Organisaties met contract en betaalwijze op orde." tone="emerald" />
          <DashboardPanel title="Nog assisted te bevestigen" value={`${summary.pendingCount}`} body="Rows waar contract of betaalstap nog openstaat." tone="amber" />
          <DashboardPanel title="Readinessregel" body={readinessCopy} tone="slate" />
        </div>
      </DashboardSection>

      <DashboardSection
        title="Actuele billing registry"
        description="Live assisted registry zonder seat- of planlogica. De status hieronder komt direct uit de huidige billing_registry-tabel."
      >
        <DashboardDisclosure
          surface="ops"
          title="Open billing registry"
          description="Gebruik de volledige tabel alleen wanneer je een specifieke organisatie of assisted launch-ready row wilt nalopen."
          badge={<DashboardChip surface="ops" label={`${registryRows.length} rows`} tone="slate" />}
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
        </DashboardDisclosure>
      </DashboardSection>
    </div>
  )
}

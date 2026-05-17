import React from 'react'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { DashboardChip, DashboardDisclosure, DashboardHero, DashboardPanel, DashboardSection } from '@/components/dashboard/dashboard-primitives'
import { getProofApprovalLabel, getProofStateLabel, summarizeProofRegistry } from '@/lib/proof-registry'
import { listProofRegistryEntries } from '@/lib/proof-registry-server'
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

  const entries = await listProofRegistryEntries()
  const summary = summarizeProofRegistry(entries)
  const lessonOnlyCount = entries.filter((entry) => entry.proofState === 'lesson_only').length

  return (
    <div className="space-y-6">
      <DashboardHero
        surface="ops"
        tone="slate"
        eyebrow="Transition deep link"
        title="Proof transition registry"
        description="Gebruik deze route als expert registry voor proof-status en approval zodra de compacte leessamenvatting in klantlearnings niet genoeg is. Dit blijft een tijdelijke verdiepingslaag, geen primaire beheerbestemming."
        meta={
          <>
            <DashboardChip surface="ops" label={`${summary.salesUsableCount} sales-usable`} tone="amber" />
            <DashboardChip surface="ops" label={`${summary.publicUsableCount} public-usable`} tone="emerald" />
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
        description="Open deze deep link alleen wanneer een case of approvalpad expliciet moet worden nagelezen buiten de klantlearnings-samenvatting."
      >
        <div className="grid gap-4 lg:grid-cols-3">
          <DashboardPanel title="lesson_only" value={`${lessonOnlyCount}`} body="Waardevolle interne les, nog geen extern bewijs." tone="slate" />
          <DashboardPanel title="sales_usable" value={`${summary.salesUsableCount}`} body="Buyer-safe in directe salescontext na claim check." tone="amber" />
          <DashboardPanel title="public_usable" value={`${summary.publicUsableCount}`} body="Pas geschikt voor publieke inzet na volledige approval." tone="emerald" />
        </div>
      </DashboardSection>

      <DashboardSection
        title="Actuele registry"
        description="Gebruik de volledige registry alleen wanneer je een case of approvalpad echt wilt nalopen."
      >
        <DashboardDisclosure
          surface="ops"
          title="Open actuele registry"
          description="Live bewijsrecords met expliciet onderscheid tussen intern leren, sales-proof en publieke bruikbaarheid."
          badge={<DashboardChip surface="ops" label={`${entries.length} proofrows`} tone="slate" />}
        >
          <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white">
            <table className="min-w-full divide-y divide-slate-200 text-sm">
              <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                <tr>
                  <th className="px-5 py-4">Route</th>
                  <th className="px-5 py-4">Proof</th>
                  <th className="px-5 py-4">Approval</th>
                  <th className="px-5 py-4">Samenvatting</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {entries.map((entry) => (
                  <tr key={entry.id}>
                    <td className="px-5 py-4 font-medium text-slate-900">{entry.route}</td>
                    <td className="px-5 py-4 text-slate-600">{getProofStateLabel(entry.proofState)}</td>
                    <td className="px-5 py-4 text-slate-600">{getProofApprovalLabel(entry.approvalState)}</td>
                    <td className="px-5 py-4 text-slate-600">{entry.summary}</td>
                  </tr>
                ))}
                {entries.length === 0 ? (
                  <tr>
                    <td className="px-5 py-5 text-slate-500" colSpan={4}>
                      Nog geen proof-rows aanwezig. De RU-seed vult semireële lessons, sales-proof en publieke proof zodra die bewust zijn klaargezet.
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

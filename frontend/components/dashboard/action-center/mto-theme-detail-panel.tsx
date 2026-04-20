'use client'

import React from 'react'
import type { MtoActionCenterThemeCard } from '@/lib/action-center/mto-cockpit'
import type { ManagementActionDepartmentOwnerDefault } from '@/lib/management-actions'
import { MtoActionComposer } from './mto-action-composer'

export function MtoThemeDetailPanel(props: {
  theme: MtoActionCenterThemeCard
  organizationId: string
  campaignId: string
  ownerDefault?: ManagementActionDepartmentOwnerDefault | null
  canManageCampaign: boolean
  onClose: () => void
}) {
  return (
    <section className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-[0_10px_30px_rgba(15,23,42,0.05)]">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">{props.theme.departmentLabel}</p>
          <h3 className="mt-2 text-xl font-semibold text-slate-950">{props.theme.factorLabel}</h3>
          <p className="mt-2 max-w-3xl text-sm leading-7 text-slate-600">{props.theme.departmentRead.decision}</p>
        </div>
        <button
          type="button"
          onClick={props.onClose}
          className="inline-flex items-center rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-300"
        >
          Sluiten
        </button>
      </div>
      <div className="mt-5 grid gap-4 lg:grid-cols-[minmax(0,1.1fr),minmax(320px,0.9fr)]">
        <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Waarom dit thema nu bovenaan staat</p>
          <p className="mt-3 text-sm leading-7 text-slate-700">{props.theme.departmentRead.validate}</p>
          <ul className="mt-4 space-y-2 text-sm leading-7 text-slate-700">
            {props.theme.departmentRead.actions.map((action) => (
              <li key={action}>{action}</li>
            ))}
          </ul>
        </div>
        {props.canManageCampaign ? (
          <MtoActionComposer
            card={props.theme}
            organizationId={props.organizationId}
            campaignId={props.campaignId}
            ownerDefault={props.ownerDefault ?? null}
            mode="detail"
          />
        ) : (
          <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-4 text-sm leading-7 text-slate-600">
            Deze themadetail is read-only voor deze kijker. Gebruik de dossier- en reviewnavigatie om vervolg te zien.
          </div>
        )}
      </div>
    </section>
  )
}

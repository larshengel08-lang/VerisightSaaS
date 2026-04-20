import type { Metadata } from 'next'
import Link from 'next/link'
import { MtoManagerCockpit } from '@/components/dashboard/action-center/mto-manager-cockpit'
import { getActionCenterPreviewData } from '@/lib/action-center/preview-data'

export const metadata: Metadata = {
  title: 'Action Center Preview | Verisight',
  description:
    'Publieke preview van de MTO Action Center-cockpit met afdelingssignalen, verbeterdossiers en reviewritme.',
  alternates: {
    canonical: '/action-center-preview',
  },
}

const valuePillars = [
  {
    title: 'Afdeling als cockpit',
    body: 'Leidinggevenden landen op hun afdeling, zien direct welke thema’s aandacht vragen en hoeven niet door losse tabellen te zoeken.',
  },
  {
    title: 'Thema-first, vraag optioneel',
    body: 'Acties hangen standaard aan een MTO-thema en kunnen waar nodig worden verdiept naar een specifieke surveyvraag of stelling.',
  },
  {
    title: 'Dossierkwaliteit onder de motorkap',
    body: 'Elke actie heeft eigenaar, reviewmoment, blockers, updates en effectcheck zodat follow-through zichtbaar en bestuurbaar blijft.',
  },
] as const

export default function ActionCenterPreviewPage() {
  const preview = getActionCenterPreviewData()

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(59,130,246,0.12),_transparent_28%),linear-gradient(180deg,#f8fafc_0%,#eef2ff_100%)]">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
        <section className="overflow-hidden rounded-[32px] border border-slate-200/80 bg-white/90 shadow-[0_24px_80px_rgba(15,23,42,0.08)] backdrop-blur">
          <div className="grid gap-8 px-6 py-8 lg:grid-cols-[minmax(0,1.15fr),minmax(320px,0.85fr)] lg:px-10 lg:py-10">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-blue-700">Action Center preview</p>
              <h1 className="mt-3 max-w-[14ch] text-[clamp(2.3rem,5vw,4.5rem)] font-semibold tracking-[-0.05em] text-slate-950">
                MTO follow-through voor managers en HR
              </h1>
              <p className="mt-4 max-w-2xl text-base leading-8 text-slate-600 sm:text-lg">
                Dit is een read-only preview van de nieuwe Action Center-richting: afdelingssignalen bovenin,
                thematische managementaandacht in het midden en verbeterdossiers plus reviewritme daar direct onder.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <span className="rounded-full border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-900">
                  MTO-first
                </span>
                <span className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-700">
                  Suite-capable contracts
                </span>
                <span className="rounded-full border border-amber-200 bg-amber-50 px-4 py-2 text-sm font-semibold text-amber-900">
                  Preview is read-only
                </span>
              </div>
            </div>
            <div className="grid gap-4">
              <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Waarom dit scherm telt</p>
                <p className="mt-3 text-sm leading-7 text-slate-700">
                  Het Action Center is niet bedoeld als takenlijst, maar als een volwassen managementwerkplek waarin
                  signalen, acties, reviews en effectchecks in één leesbare lijn blijven staan.
                </p>
              </div>
              <div className="rounded-[24px] border border-slate-200 bg-[#132033] p-5 text-white">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-300">Preview boundaries</p>
                <ul className="mt-3 space-y-2 text-sm leading-7 text-slate-200">
                  <li>Read-only route, los van de live campaignflow</li>
                  <li>Mockdata met echte cockpitcomponenten</li>
                  <li>Geen writes naar management actions of reviews</li>
                </ul>
                <Link
                  href="/"
                  className="mt-5 inline-flex items-center rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/15"
                >
                  Terug naar Verisight
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          {valuePillars.map((pillar) => (
            <article key={pillar.title} className="rounded-[24px] border border-slate-200 bg-white/90 p-5 shadow-[0_10px_30px_rgba(15,23,42,0.05)]">
              <p className="text-sm font-semibold text-slate-950">{pillar.title}</p>
              <p className="mt-3 text-sm leading-7 text-slate-600">{pillar.body}</p>
            </article>
          ))}
        </section>

        <section className="rounded-[32px] border border-slate-200 bg-white px-4 py-5 shadow-[0_18px_60px_rgba(15,23,42,0.06)] sm:px-6 sm:py-6">
          <div className="mb-5 flex flex-col gap-3 border-b border-slate-100 pb-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Live cockpitgevoel</p>
              <h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-slate-950">
                Afdelingsbeeld, themasignalen en verbeterdossiers op één plek
              </h2>
            </div>
            <p className="max-w-xl text-sm leading-7 text-slate-600">
              De preview gebruikt representatieve MTO-signalen uit Operations, Customer Success en Engineering om te
              laten zien hoe acties, reviewdruk en follow-through straks samen landen.
            </p>
          </div>
          <MtoManagerCockpit
            organizationId={preview.organizationId}
            campaignId={preview.campaignId}
            currentViewerRole={preview.currentViewerRole}
            currentUserEmail={preview.currentUserEmail}
            canManageCampaign={preview.canManageCampaign}
            readOnly={preview.readOnly}
            departmentReads={preview.departmentReads}
            actions={preview.actions}
            updates={preview.updates}
            reviews={preview.reviews}
            ownerDefaults={preview.ownerDefaults}
          />
        </section>
      </div>
    </main>
  )
}

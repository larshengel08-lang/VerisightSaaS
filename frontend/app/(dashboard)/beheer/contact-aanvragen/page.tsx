import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import {
  getContactDesiredTimingLabel,
  getContactRouteLabel,
} from '@/lib/contact-funnel'
import { getContactRequestsForAdmin } from '@/lib/contact-requests'
import {
  DashboardChip,
  DashboardHero,
  DashboardPanel,
  DashboardSection,
} from '@/components/dashboard/dashboard-primitives'

function formatAmsterdamDate(value: string) {
  try {
    return new Intl.DateTimeFormat('nl-NL', {
      dateStyle: 'medium',
      timeStyle: 'short',
      timeZone: 'Europe/Amsterdam',
    }).format(new Date(value))
  } catch {
    return value
  }
}

export default async function ContactAanvragenPage() {
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

  const { rows, configError, loadError } = await getContactRequestsForAdmin(50)
  const pendingCount = rows.filter((row) => !row.notification_sent).length

  return (
    <div className="space-y-6">
      <DashboardHero
        eyebrow="Interne leadlijst"
        title="Contactaanvragen"
        description="Bekijk nieuwe website-aanvragen direct in de UI, inclusief routecontext, gewenste timing en afleverstatus van de notificatiemail. Gebruik vanaf hier ook meteen de learning-workbench, zodat vroege buyer-signalen niet in losse opvolgnotities verdwijnen."
        tone="blue"
        meta={
          <>
            <DashboardChip label={`${rows.length} recente aanvragen`} tone="blue" />
            <DashboardChip
              label={
                pendingCount === 0
                  ? 'Geen open mailissues'
                  : `${pendingCount} aanvraag${pendingCount === 1 ? '' : 'en'} zonder notificatiemail`
              }
              tone={pendingCount === 0 ? 'emerald' : 'amber'}
            />
          </>
        }
        actions={
          <>
            <Link
              href="/beheer"
              className="inline-flex items-center rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-blue-200 hover:text-blue-700"
            >
              Terug naar setup
            </Link>
            <Link
              href="/beheer/contact-aanvragen"
              className="inline-flex items-center rounded-2xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
            >
              Vernieuwen
            </Link>
            <Link
              href="/beheer/klantlearnings"
              className="inline-flex items-center rounded-2xl border border-blue-200 bg-white px-4 py-2 text-sm font-semibold text-blue-700 transition hover:border-blue-300 hover:bg-blue-100"
            >
              Open learning-workbench
            </Link>
          </>
        }
        aside={
          <div className="space-y-3 text-sm text-slate-700">
            <p className="font-semibold text-slate-950">Wat je hier ziet</p>
            <p>
              Elke lead wordt opgeslagen, ook als Resend of de notificatieroute vastloopt. Let vooral op
              <span className="font-semibold"> route</span>, <span className="font-semibold"> timing</span>,
              <span className="font-semibold"> notificatie</span> en{' '}
              <span className="font-semibold">foutreden</span>.
            </p>
            <p className="text-xs text-slate-500">
              Gebruik de actieknop per rij om buyer-vraag, trustfrictie en eerste hypothese meteen in het learningdossier te trekken.
            </p>
          </div>
        }
      />

      {configError ? (
        <DashboardSection
          eyebrow="Config"
          title="Interne leadlijst niet beschikbaar"
          description="De pagina is wel bereikbaar, maar de backend kan de aanvragen nog niet server-side ophalen."
        >
          <DashboardPanel title="Ontbrekende configuratie" body={configError} tone="amber" />
        </DashboardSection>
      ) : null}

      {loadError ? (
        <DashboardSection
          eyebrow="Load"
          title="Aanvragen konden niet worden geladen"
          description="De pagina werkt, maar de backendrespons was niet bruikbaar."
        >
          <DashboardPanel title="Backendfout" body={loadError} tone="amber" />
        </DashboardSection>
      ) : null}

      <DashboardSection
        eyebrow="Leads"
        title="Recente contactaanvragen"
        description="Nieuwe records staan bovenaan. Routecontext en timing helpen om de eerste opvolging meteen productspecifiek te doen en om een learningdossier direct vanuit de echte lead te starten."
        aside={<DashboardChip label="Maximaal 50 recente leads" tone="slate" />}
      >
        {rows.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50 p-6 text-sm text-slate-600">
            Er zijn nog geen contactaanvragen zichtbaar, of de lijst kon nog niet worden opgehaald.
          </div>
        ) : (
          <div className="overflow-x-auto rounded-[24px] border border-slate-200">
            <table className="min-w-full divide-y divide-slate-200 bg-white text-sm">
              <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                <tr>
                  <th className="px-4 py-3">Moment</th>
                  <th className="px-4 py-3">Naam</th>
                  <th className="px-4 py-3">Organisatie</th>
                  <th className="px-4 py-3">Werk e-mail</th>
                  <th className="px-4 py-3">Omvang</th>
                  <th className="px-4 py-3">Route</th>
                  <th className="px-4 py-3">Timing</th>
                  <th className="px-4 py-3">CTA-bron</th>
                  <th className="px-4 py-3">Notificatie</th>
                  <th className="px-4 py-3">Foutreden</th>
                  <th className="px-4 py-3">Actie</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {rows.map((row) => (
                  <tr key={row.id} className="align-top">
                    <td className="px-4 py-4 text-slate-600">
                      <div>{formatAmsterdamDate(row.created_at)}</div>
                      <div className="mt-1 text-xs text-slate-400">{row.id}</div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="font-semibold text-slate-950">{row.name}</div>
                      <div className="mt-2 max-w-md text-xs leading-6 text-slate-600">{row.current_question}</div>
                    </td>
                    <td className="px-4 py-4 text-slate-700">{row.organization}</td>
                    <td className="px-4 py-4 text-slate-700">{row.work_email}</td>
                    <td className="px-4 py-4 text-slate-700">{row.employee_count}</td>
                    <td className="px-4 py-4">
                      <DashboardChip label={getContactRouteLabel(row.route_interest)} tone="blue" />
                    </td>
                    <td className="px-4 py-4 text-slate-700">{getContactDesiredTimingLabel(row.desired_timing)}</td>
                    <td className="px-4 py-4 text-xs leading-6 text-slate-500">{row.cta_source ? row.cta_source : 'Onbekend'}</td>
                    <td className="px-4 py-4">
                      <DashboardChip
                        label={row.notification_sent ? 'Verstuurd' : 'Niet verstuurd'}
                        tone={row.notification_sent ? 'emerald' : 'amber'}
                      />
                    </td>
                    <td className="px-4 py-4 text-slate-600">{row.notification_error ? row.notification_error : 'Geen fout opgeslagen'}</td>
                    <td className="px-4 py-4">
                      <Link
                        href={`/beheer/klantlearnings?lead=${row.id}`}
                        className="inline-flex items-center rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-blue-200 hover:text-blue-700"
                      >
                        Start dossier
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </DashboardSection>
    </div>
  )
}

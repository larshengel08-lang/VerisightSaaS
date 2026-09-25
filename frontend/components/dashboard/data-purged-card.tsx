import Link from 'next/link'
import { dataPurgedMessage } from '@/lib/dashboard/data-purged'

/**
 * Deel C (bewaartermijn): één kaart voor een opgeschoonde meting, overal waar
 * die meting anders als "0 ingevuld" of "te weinig antwoorden" zou verschijnen
 * (campagnepagina, hoofdkaart op /dashboard, open antwoorden, routebeheer).
 * Dezelfde zin als de 410 van de backend. Servercomponent.
 */
export function DataPurgedCard({
  purgedAt,
  campaignName,
  campaignHref,
}: {
  purgedAt: string
  /** Toont de naam van de meting als kop, voor pagina's waar die er nog niet staat. */
  campaignName?: string
  /** Link naar de meting, voor pagina's die niet zelf de campagnepagina zijn. */
  campaignHref?: string
}) {
  return (
    <div role="status" className="rounded-[22px] border border-[color:var(--dashboard-frame-border)] bg-white px-6 py-6">
      {campaignName ? (
        <p className="mb-3 text-lg font-semibold tracking-[-0.02em] text-[color:var(--dashboard-ink)]">
          {campaignHref ? (
            <Link href={campaignHref} className="underline-offset-4 hover:underline">
              {campaignName}
            </Link>
          ) : (
            campaignName
          )}
        </p>
      ) : null}
      <p className="mb-1 text-sm font-semibold text-[color:var(--dashboard-ink)]">Gegevens verwijderd</p>
      <p className="max-w-2xl text-sm leading-6 text-[color:var(--dashboard-text)]">{dataPurgedMessage(purgedAt)}</p>
    </div>
  )
}

import { LOEP_CONTACT_EMAIL } from '@/lib/loep-contact'
import { NEW_MEASUREMENT_PRICE_LABEL, buildNewMeasurementMailto } from '@/lib/dashboard/new-measurement-request'

interface Props {
  /**
   * 'follow_up': er is al een meting, dus "dezelfde meting opnieuw" met prijs.
   * 'first': nog geen meting; geen prijs en geen "vervolgmeting", want er is
   * niets om te herhalen.
   */
  variant: 'follow_up' | 'first'
  organizationName: string | null
}

/**
 * Vast blok onderaan /dashboard en bij "gesloten zonder rapport" (spec
 * 2026-09-16 par. 6.3). Servercomponent; de mailto is de hele actie.
 */
export function RequestNewMeasurement({ variant, organizationName }: Props) {
  const heading = variant === 'first' ? (
    <>Een meting aanvragen?</>
  ) : (
    <>Klaar voor een vervolgmeting?</>
  )
  const text = variant === 'first' ? (
    <>Mail Loep welke scan je wilt starten, dan zet Loep hem voor je klaar.</>
  ) : (
    <>Dezelfde meting opnieuw kost {NEW_MEASUREMENT_PRICE_LABEL}. Mail Loep, dan zet Loep hem voor je klaar.</>
  )

  return (
    <section
      aria-labelledby="nieuwe-meting"
      className="rounded-[22px] border border-dashed border-[color:var(--dashboard-frame-border)] bg-[color:var(--dashboard-surface)] px-6 py-6"
    >
      <h2 id="nieuwe-meting" className="text-lg font-semibold tracking-[-0.02em] text-[color:var(--dashboard-ink)]">
        {heading}
      </h2>
      <p className="mt-2 max-w-2xl text-sm leading-6 text-[color:var(--dashboard-text)]">{text}</p>
      <div className="mt-4 flex flex-wrap items-center gap-4">
        <a
          href={buildNewMeasurementMailto(organizationName)}
          className="inline-flex items-center justify-center rounded-lg bg-[color:var(--dashboard-ink)] px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#1B2E45]"
        >
          Nieuwe meting aanvragen
        </a>
        <p className="text-xs text-[color:var(--dashboard-muted)]">Of mail zelf naar {LOEP_CONTACT_EMAIL}.</p>
      </div>
    </section>
  )
}

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { HELP_CONTACT, HELP_ROLES, HELP_STEPS, HELP_THRESHOLDS } from '@/lib/dashboard/help-content'

export default async function HelpPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  return (
    <div className="space-y-8">
      <section className="space-y-3 border-b border-slate-200/80 pb-6">
        <div className="flex items-center gap-3">
          <span className="h-px w-10 bg-[#C36A29]" />
          <p className="text-[0.72rem] font-semibold uppercase tracking-[0.28em] text-[color:var(--dashboard-muted)]">
            Hulp
          </p>
        </div>
        <h1 className="text-[2.4rem] font-semibold leading-none tracking-[-0.06em] text-[color:var(--dashboard-ink)] md:text-[3rem]">
          Zo werkt een meting
        </h1>
        <p className="max-w-3xl text-sm leading-6 text-[color:var(--dashboard-text)]">
          Drie stappen, twee drempels en één adres voor vragen. Alles wat je hier leest staat ook op
          de plek waar je het nodig hebt, maar hier staat het bij elkaar.
        </p>
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        {HELP_STEPS.map((step) => (
          <article key={step.title} className="rounded-[22px] border border-[color:var(--dashboard-frame-border)] bg-white px-6 py-6">
            <h2 className="text-base font-semibold text-[color:var(--dashboard-ink)]">{step.title}</h2>
            <p className="mt-2 text-sm leading-6 text-[color:var(--dashboard-text)]">{step.body}</p>
          </article>
        ))}
      </section>

      <section className="rounded-[22px] border border-[color:var(--dashboard-frame-border)] bg-white px-6 py-6">
        <h2 className="text-base font-semibold text-[color:var(--dashboard-ink)]">
          Minimaal {HELP_THRESHOLDS.total} ingevulde vragenlijsten, en {HELP_THRESHOLDS.perDepartment} per afdeling
        </h2>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-[color:var(--dashboard-text)]">{HELP_THRESHOLDS.why}</p>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <article className="rounded-[22px] border border-[color:var(--dashboard-frame-border)] bg-white px-6 py-6">
          <h2 className="text-base font-semibold text-[color:var(--dashboard-ink)]">Wat jij doet</h2>
          <ul className="mt-3 space-y-2 text-sm leading-6 text-[color:var(--dashboard-text)]">
            {HELP_ROLES.you.map((item) => (
              <li key={item} className="flex gap-2">
                <span aria-hidden className="mt-[0.55rem] h-1.5 w-1.5 shrink-0 rounded-full bg-[#E8A020]" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </article>
        <article className="rounded-[22px] border border-[color:var(--dashboard-frame-border)] bg-white px-6 py-6">
          <h2 className="text-base font-semibold text-[color:var(--dashboard-ink)]">Wat Loep doet</h2>
          <ul className="mt-3 space-y-2 text-sm leading-6 text-[color:var(--dashboard-text)]">
            {HELP_ROLES.loep.map((item) => (
              <li key={item} className="flex gap-2">
                <span aria-hidden className="mt-[0.55rem] h-1.5 w-1.5 shrink-0 rounded-full bg-[#0D1B2A]" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </article>
      </section>

      <section className="rounded-[22px] bg-[#0D1B2A] px-6 py-6 text-white">
        <p className="text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-[#E8A020]">Vragen?</p>
        <p className="mt-2 text-sm leading-6 text-white/80">
          Mail naar{' '}
          <a href={`mailto:${HELP_CONTACT.email}`} className="font-semibold text-white underline underline-offset-4">
            {HELP_CONTACT.email}
          </a>
          . {HELP_CONTACT.promise}
        </p>
      </section>
    </div>
  )
}

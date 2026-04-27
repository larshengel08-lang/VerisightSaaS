import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { SignalStatCard } from '@/components/dashboard/dashboard-primitives'

export default async function ActionCenterPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  return (
    <div className="space-y-7">
      {/* Page header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1
            className="text-[1.35rem] font-semibold tracking-[-0.02em]"
            style={{ color: 'var(--dashboard-ink)' }}
          >
            Action Center
          </h1>
          <p className="mt-1 text-sm" style={{ color: 'var(--dashboard-muted)' }}>
            Eigenaarschap, reviewdruk en follow-through op basis van je ExitScan-data.
          </p>
        </div>
        <Link
          href="/action-center/acties/nieuw"
          className="shrink-0 rounded-full px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90"
          style={{ background: 'var(--dashboard-ink)' }}
        >
          Actie aanmaken
        </Link>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
        <SignalStatCard label="Acties open" value="—" subline="Nog geen data" band="neutral" />
        <SignalStatCard label="Te bespreken" value="—" subline="Reviewmoment nodig" band="neutral" />
        <SignalStatCard label="Geblokkeerd" value="—" subline="Wacht op input" band="neutral" />
        <SignalStatCard label="Afdelingen met aandacht" value="—" subline="Op basis van signaalband" band="neutral" />
        <SignalStatCard label="Afgerond" value="—" subline="Laatste 30 dagen" band="neutral" />
      </div>

      {/* Main content */}
      <div className="grid gap-6 xl:grid-cols-[1fr,320px]">
        {/* Acties lijst */}
        <section>
          <p
            className="mb-4 text-[0.65rem] font-medium uppercase"
            style={{ color: 'var(--dashboard-muted)', letterSpacing: '0.18em' }}
          >
            Wat vraagt nu aandacht?
          </p>
          <div
            className="rounded-[var(--dashboard-radius-card)] px-5 py-10 text-center text-sm"
            style={{
              background: 'var(--dashboard-surface)',
              border: '1px solid var(--dashboard-frame-border)',
              color: 'var(--dashboard-muted)',
            }}
          >
            <p className="font-medium" style={{ color: 'var(--dashboard-ink)' }}>Nog geen acties aangemaakt</p>
            <p className="mt-2">Maak een actie aan om eigenaarschap en follow-through te starten.</p>
            <Link
              href="/action-center/acties/nieuw"
              className="mt-5 inline-flex rounded-full px-4 py-2 text-sm font-medium text-white"
              style={{ background: 'var(--dashboard-ink)' }}
            >
              Eerste actie aanmaken
            </Link>
          </div>
        </section>

        {/* Komende reviews */}
        <aside>
          <p
            className="mb-4 text-[0.65rem] font-medium uppercase"
            style={{ color: 'var(--dashboard-muted)', letterSpacing: '0.18em' }}
          >
            Komende reviews
          </p>
          <div
            className="rounded-[var(--dashboard-radius-card)] px-4 py-5 text-sm"
            style={{
              background: 'var(--dashboard-surface)',
              border: '1px solid var(--dashboard-frame-border)',
              color: 'var(--dashboard-muted)',
            }}
          >
            Nog geen reviewmomenten gepland.
          </div>
        </aside>
      </div>
    </div>
  )
}

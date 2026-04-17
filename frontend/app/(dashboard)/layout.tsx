import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { LogoutButton } from '@/components/ui/logout-button'
import { MobileNav } from '@/components/ui/mobile-nav'
import { syncPendingOrgInvitesForUser } from '@/lib/supabase/sync-org-invites'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { acceptedCount } = await syncPendingOrgInvitesForUser(supabase)

  // isAdmin = alleen accounts met is_verisight_admin = true in profiles
  // HR-klanten hebben altijd false, ook als ze owner/member zijn van een org
  const { data: profile } = await supabase
    .from('profiles')
    .select('is_verisight_admin')
    .eq('id', user.id)
    .single()

  const isAdmin = profile?.is_verisight_admin === true
  const accountLabel = isAdmin ? 'Verisight beheer' : 'Klantdashboard'

  return (
    <div className="dashboard-shell min-h-screen flex flex-col bg-[color:var(--bg)] text-[color:var(--ink)]">
      {/* Top navigatiebalk */}
      <header className="sticky top-0 z-40 border-b border-[color:var(--border)] bg-[color:var(--surface)]/95 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-4">
            {/* Hamburger voor mobiel */}
            <MobileNav isAdmin={isAdmin} />
            <Link href="/dashboard" className="text-lg font-bold tracking-tight text-[color:var(--ink)]">
              Verisight
            </Link>
            <nav className="hidden sm:flex items-center gap-1">
              <NavLink href="/dashboard">Campaigns</NavLink>
              {/* Setup is alleen zichtbaar voor Verisight-beheerders, niet voor HR-klanten */}
              {isAdmin && <NavLink href="/beheer">Setup</NavLink>}
              {isAdmin && <NavLink href="/beheer/contact-aanvragen">Leads</NavLink>}
            </nav>
          </div>
          <div className="flex items-center gap-3">
            <span
              className={`hidden sm:inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${
                isAdmin
                  ? 'border-[#d6e4e8] bg-[#f3f8f8] text-[#234B57]'
                  : 'border-[#d2e6e0] bg-[#eef7f4] text-[#3C8D8A]'
              }`}
            >
              {accountLabel}
            </span>
            <span className="hidden max-w-[160px] truncate text-xs text-[color:var(--muted)] sm:block">
              {user.email}
            </span>
            <LogoutButton />
          </div>
        </div>
      </header>

      {/* Pagina-inhoud */}
      <main className="mx-auto flex-1 w-full max-w-7xl px-4 py-8 sm:px-6">
        {acceptedCount > 0 && (
          <div className="mb-6 rounded-xl border border-[#d2e6e0] bg-[#eef7f4] px-4 py-3 text-sm text-[#234B57]">
            Jouw account is gekoppeld aan {acceptedCount} organisatie{acceptedCount === 1 ? '' : 's'}.
            Je ziet nu automatisch het juiste klantdashboard en de bijbehorende rapportages.
          </div>
        )}
        {children}
      </main>

      <footer className="border-t border-[color:var(--border)] py-4 text-center text-xs text-[color:var(--muted)]">
        Verisight v2.0 · Vertrouwelijk platform
      </footer>
    </div>
  )
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="rounded-full px-3 py-1.5 text-sm font-medium text-[color:var(--text)] transition-colors hover:bg-[color:var(--bg)] hover:text-[color:var(--ink)]"
    >
      {children}
    </Link>
  )
}

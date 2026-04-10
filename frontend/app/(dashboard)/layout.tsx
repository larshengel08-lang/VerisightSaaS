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
    <div className="min-h-screen flex flex-col">
      {/* Top navigatiebalk */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* Hamburger voor mobiel */}
            <MobileNav isAdmin={isAdmin} />
            <Link href="/dashboard" className="text-lg font-bold text-blue-600 tracking-tight">
              Verisight
            </Link>
            <nav className="hidden sm:flex items-center gap-1">
              <NavLink href="/dashboard">Campaigns</NavLink>
              {/* Setup is alleen zichtbaar voor Verisight-beheerders, niet voor HR-klanten */}
              {isAdmin && <NavLink href="/beheer">Setup</NavLink>}
            </nav>
          </div>
          <div className="flex items-center gap-3">
            <span
              className={`hidden sm:inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${
                isAdmin ? 'bg-blue-50 text-blue-700' : 'bg-emerald-50 text-emerald-700'
              }`}
            >
              {accountLabel}
            </span>
            <span className="text-xs text-gray-400 hidden sm:block truncate max-w-[160px]">
              {user.email}
            </span>
            <LogoutButton />
          </div>
        </div>
      </header>

      {/* Pagina-inhoud */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 py-8">
        {acceptedCount > 0 && (
          <div className="mb-6 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-900">
            Jouw account is gekoppeld aan {acceptedCount} organisatie{acceptedCount === 1 ? '' : 's'}.
            Je ziet nu automatisch het juiste klantdashboard en de bijbehorende rapportages.
          </div>
        )}
        {children}
      </main>

      <footer className="border-t border-gray-100 py-4 text-center text-xs text-gray-400">
        Verisight v2.0 · Vertrouwelijk platform
      </footer>
    </div>
  )
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="px-3 py-1.5 text-sm font-medium text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
    >
      {children}
    </Link>
  )
}

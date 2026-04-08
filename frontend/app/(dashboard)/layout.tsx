import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { LogoutButton } from '@/components/ui/logout-button'
import { MobileNav } from '@/components/ui/mobile-nav'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  // Bepaal of deze gebruiker beheerrechten heeft (owner/member)
  // of alleen leesrechten (viewer = HR-klant)
  const { data: memberships } = await supabase
    .from('org_members')
    .select('role')
    .eq('user_id', user.id)

  const isAdmin = !memberships?.length
    || memberships.some(m => m.role === 'owner' || m.role === 'member')

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
            <span className="text-xs text-gray-400 hidden sm:block truncate max-w-[160px]">
              {user.email}
            </span>
            <LogoutButton />
          </div>
        </div>
      </header>

      {/* Pagina-inhoud */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 py-8">
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

import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { LayoutDashboard, ListTodo, Columns, Workflow } from 'lucide-react'
import { cn } from '@/ui/lib/cn'
import { useAuth } from '@/auth/AuthContext'
import { Button } from '@/ui/components/Button'

const nav = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/tickets', label: 'Tickets', icon: ListTodo },
  { to: '/kanban', label: 'Kanban', icon: Columns },
  { to: '/workflow', label: 'Workflow', icon: Workflow },
]

export function AppLayout({ children }: { children?: React.ReactNode }) {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, logout } = useAuth()

  return (
    <div className="h-full flex flex-col">
      <div className="flex flex-1 min-h-0">
      <aside className="w-56 shrink-0 flex flex-col bg-brand-black border-r border-brand-blackLight">
        <div className="p-3">
          <Link to="/dashboard" className="flex items-center gap-2 font-semibold text-white">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-brand-gold text-brand-black">
              TW
            </span>
            <span className="text-sm">Ticketing Workflow</span>
          </Link>
        </div>

        <nav className="px-2 pb-3">
          {nav.map((item) => {
            const Icon = item.icon
            const isActive = location.pathname === item.to || location.pathname.startsWith(item.to + '/')
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={cn(
                  'flex items-center gap-2 rounded-lg px-2.5 py-2 text-sm transition',
                  isActive
                    ? 'bg-brand-gold/20 text-brand-goldLight'
                    : 'text-neutral-400 hover:bg-brand-blackLight hover:text-white',
                )}
              >
                <Icon size={17} />
                {item.label}
              </NavLink>
            )
          })}
        </nav>

        <div className="px-3 text-[10px] text-neutral-500 tracking-wider pb-2">
          Session active
        </div>

        <div className="px-3 pb-3 mt-auto">
          <div className="rounded-lg border border-brand-blackLight bg-brand-blackLight/50 p-2.5">
            <div className="text-[10px] text-neutral-500">Connecté</div>
            <div className="text-xs font-medium text-white truncate mt-0.5">{user?.name ?? user?.email ?? '—'}</div>
            <Link to="/account" className="text-[10px] text-brand-goldLight/90 hover:underline mt-1.5 inline-block">
              Mon compte
            </Link>
            <div className="mt-2">
              <Button
                variant="primary"
                className="w-full text-xs py-1.5"
                onClick={async () => {
                  await logout()
                  navigate('/login', { replace: true })
                }}
              >
                Se déconnecter
              </Button>
            </div>
          </div>
        </div>
      </aside>

      <main className="flex-1 overflow-auto bg-neutral-100">
        <div className="max-w-5xl mx-auto p-4 pb-8">{children ?? <Outlet />}</div>
      </main>
      </div>

      <footer className="shrink-0 border-t border-neutral-200 bg-white px-4 py-2.5">
        <div className="max-w-5xl mx-auto flex flex-wrap items-center justify-between gap-2 text-xs text-neutral-500">
          <span>Ticketing Workflow</span>
          <span>© {new Date().getFullYear()}</span>
        </div>
      </footer>
    </div>
  )
}

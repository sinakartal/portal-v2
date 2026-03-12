import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { LayoutDashboard, Building2, Bell, LogOut } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

const navItems = [
  { to: '/admin', icon: LayoutDashboard, label: 'Dashboard', end: true },
  { to: '/admin/tenants', icon: Building2, label: 'Tenant Yonetimi' },
]

export function AdminLayout() {
  const { logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => { logout(); navigate('/login') }

  return (
    <div className="flex h-screen bg-bg-primary">
      {/* Sidebar */}
      <aside className="w-60 bg-bg-primary border-r border-border-subtle flex flex-col shrink-0">
        <div className="p-5 border-b border-border-subtle">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center text-white font-bold text-sm">B</div>
            <div>
              <p className="text-sm font-semibold text-text-primary">Bringo Portal</p>
              <p className="text-[10px] text-text-muted">Admin Panel</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-3 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                  isActive
                    ? 'bg-accent-subtle text-accent font-medium'
                    : 'text-text-secondary hover:bg-bg-tertiary hover:text-text-primary'
                }`
              }
            >
              <item.icon size={18} />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="p-3 border-t border-border-subtle">
          <button onClick={handleLogout} className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-text-muted hover:bg-bg-tertiary hover:text-text-primary w-full cursor-pointer transition-colors">
            <LogOut size={18} /> Cikis Yap
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-14 border-b border-border-subtle flex items-center justify-between px-6 shrink-0">
          <div />
          <div className="flex items-center gap-3">
            <button className="p-2 rounded-lg hover:bg-bg-tertiary text-text-muted cursor-pointer">
              <Bell size={18} />
            </button>
            <div className="w-8 h-8 rounded-full bg-bg-tertiary flex items-center justify-center text-xs text-text-secondary font-medium">A</div>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

import { useState } from 'react'
import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { ChevronLeft, ChevronRight, LogOut, User, Bell, Sun, Moon } from 'lucide-react'
import { useAuth } from '@/store/authStore'
import { useTheme } from '@/store/themeStore'
import { PORTAL_CONFIG } from '@/constants/portalMenus'

function PortalLogo({ collapsed, config }) {
  const color = config.color

  if (collapsed) {
    return (
      <svg viewBox="0 0 40 40" className="w-9 h-9" xmlns="http://www.w3.org/2000/svg">
        <rect x="2" y="4" width="36" height="32" rx="8" fill={color} />
        <text x="20" y="27" textAnchor="middle" fill="white" fontFamily="Inter, Arial, sans-serif" fontWeight="800" fontStyle="italic" fontSize="18">hey</text>
      </svg>
    )
  }

  return (
    <div className="flex items-center gap-3">
      <svg viewBox="0 0 40 40" className="w-9 h-9 flex-shrink-0" xmlns="http://www.w3.org/2000/svg">
        <rect x="2" y="4" width="36" height="32" rx="8" fill={color} />
        <text x="20" y="27" textAnchor="middle" fill="white" fontFamily="Inter, Arial, sans-serif" fontWeight="800" fontStyle="italic" fontSize="18">hey</text>
      </svg>
      <div>
        <div className="text-sm font-bold text-slate-800 dark:text-white leading-tight">bringo</div>
        <div className="text-[10px] text-slate-400 leading-tight">{config.subtitle}</div>
      </div>
    </div>
  )
}

function PortalHeader({ config }) {
  const { user, logout } = useAuth()
  const { dark, toggle } = useTheme()
  const [showDropdown, setShowDropdown] = useState(false)
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <header className="h-16 text-white flex items-center justify-between px-6" style={{ backgroundColor: config.color }}>
      <div className="flex items-center gap-3">
        <config.icon size={22} className="text-white/80" />
        <h1 className="text-lg font-semibold">{config.title}</h1>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={toggle}
          className="p-2 text-white/70 hover:bg-white/15 rounded-lg cursor-pointer transition-colors"
          title={dark ? 'Acik mod' : 'Karanlik mod'}
        >
          {dark ? <Sun size={20} /> : <Moon size={20} />}
        </button>

        <button className="relative p-2 text-white/70 hover:bg-white/15 rounded-lg cursor-pointer transition-colors">
          <Bell size={20} />
        </button>

        <div className="relative">
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="flex items-center gap-3 cursor-pointer hover:bg-white/15 rounded-lg px-3 py-2 transition-colors"
          >
            <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center text-sm font-semibold" style={{ color: config.color }}>
              {user?.firstName?.[0]}{user?.lastName?.[0]}
            </div>
            <div className="text-left hidden md:block">
              <p className="text-sm font-medium text-white">{user?.firstName} {user?.lastName}</p>
              <p className="text-xs text-white/60 capitalize">{user?.role?.replace('_', ' ')}</p>
            </div>
          </button>
          {showDropdown && (
            <div className="absolute right-0 top-12 w-48 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 py-2 z-50">
              <button className="w-full flex items-center gap-3 px-4 py-2 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer">
                <User size={16} /> Profil
              </button>
              <hr className="my-1 border-slate-100 dark:border-slate-700" />
              <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 cursor-pointer">
                <LogOut size={16} /> Cikis Yap
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}

export default function PortalLayout({ portal }) {
  const [collapsed, setCollapsed] = useState(false)
  const config = PORTAL_CONFIG[portal]

  if (!config) return <div>Portal bulunamadi</div>

  return (
    <div className="flex min-h-screen bg-slate-100 dark:bg-slate-950">
      {/* Sidebar */}
      <aside className={`fixed left-0 top-0 h-screen bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-700 transition-all duration-300 z-50 flex flex-col ${collapsed ? 'w-[72px]' : 'w-[240px]'}`}>
        {/* Logo */}
        <div className="flex items-center gap-2 px-4 h-16 border-b border-slate-200 dark:border-slate-700">
          <PortalLogo collapsed={collapsed} config={config} />
        </div>

        {/* Menu */}
        <nav className="flex-1 py-4 overflow-y-auto">
          {config.menu.map(item => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-5 py-3 mx-2 rounded-lg transition-colors ${
                  isActive
                    ? 'font-semibold'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                }`
              }
              style={({ isActive }) => isActive ? {
                backgroundColor: `${config.color}15`,
                color: config.color,
              } : {}}
            >
              <item.icon size={20} className="flex-shrink-0" />
              {!collapsed && <span className="text-sm font-medium">{item.title}</span>}
            </NavLink>
          ))}
        </nav>

        {/* Version */}
        {!collapsed && (
          <div className="px-5 py-2 text-[10px] text-slate-400">
            v2.0.0 - {config.title}
          </div>
        )}

        {/* Collapse Toggle */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="flex items-center justify-center h-12 border-t border-slate-200 dark:border-slate-700 text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 transition-colors cursor-pointer"
        >
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </aside>

      {/* Main Content */}
      <div className={`flex-1 transition-all duration-300 ${collapsed ? 'ml-[72px]' : 'ml-[240px]'}`}>
        <PortalHeader config={config} />
        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

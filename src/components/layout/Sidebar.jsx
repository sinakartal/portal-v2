import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { MENU_ITEMS } from '@/constants/menu'
import { useAuth } from '@/store/authStore'

function BringoLogo({ collapsed }) {
  if (collapsed) {
    return (
      <svg viewBox="0 0 40 40" className="w-9 h-9" xmlns="http://www.w3.org/2000/svg">
        <rect x="2" y="4" width="36" height="32" rx="8" fill="#EF4444" />
        <text x="20" y="27" textAnchor="middle" fill="white" fontFamily="Inter, Arial, sans-serif" fontWeight="800" fontStyle="italic" fontSize="18">hey</text>
      </svg>
    )
  }
  return (
    <svg viewBox="0 0 155 42" className="h-10" xmlns="http://www.w3.org/2000/svg">
      <rect x="0" y="4" width="38" height="34" rx="8" fill="#EF4444" />
      <text x="19" y="28" textAnchor="middle" fill="white" fontFamily="Inter, Arial, sans-serif" fontWeight="800" fontStyle="italic" fontSize="19">hey</text>
      <text x="44" y="29" fill="#EF4444" fontFamily="Inter, Arial, sans-serif" fontWeight="800" fontStyle="italic" fontSize="26">bringo</text>
      <text x="45" y="40" fill="rgba(239,68,68,0.5)" fontFamily="Inter, Arial, sans-serif" fontWeight="400" fontStyle="italic" fontSize="8">her şey yolunda</text>
    </svg>
  )
}

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false)
  const { hasPermission } = useAuth()

  const filteredMenu = MENU_ITEMS.filter(
    item => !item.permission || hasPermission(item.permission)
  )

  return (
    <aside className={`fixed left-0 top-0 h-screen bg-sidebar border-r border-slate-200 transition-all duration-300 z-50 flex flex-col ${collapsed ? 'w-[72px]' : 'w-[260px]'}`}>
      {/* Logo */}
      <div className="flex items-center gap-2 px-4 h-16 border-b border-slate-200">
        <BringoLogo collapsed={collapsed} />
      </div>

      {/* Menu */}
      <nav className="flex-1 py-4 overflow-y-auto">
        {filteredMenu.map(item => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-5 py-3 mx-2 rounded-lg transition-colors ${
                isActive
                  ? 'bg-primary/10 text-primary font-semibold'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`
            }
          >
            <item.icon size={20} className="flex-shrink-0" />
            {!collapsed && <span className="text-sm font-medium">{item.title}</span>}
          </NavLink>
        ))}
      </nav>

      {/* Version Info */}
      {!collapsed && (
        <div className="px-5 py-2 text-[10px] text-slate-400">
          v2.0.0 - Admin Portal
        </div>
      )}

      {/* Collapse Toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="flex items-center justify-center h-12 border-t border-slate-200 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
      >
        {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
      </button>
    </aside>
  )
}

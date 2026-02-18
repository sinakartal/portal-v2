import { useState } from 'react'
import { useAuth } from '@/store/authStore'
import { Bell, Search, ChevronDown, LogOut, User, Settings, Sun, Moon, Package, Truck, AlertTriangle, CheckCircle, Volume2, VolumeX } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useTheme } from '@/store/themeStore'

export default function Header() {
  const { user, logout } = useAuth()
  const { dark, toggle } = useTheme()
  const [showDropdown, setShowDropdown] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  const [notifFilter, setNotifFilter] = useState('all')
  const [soundEnabled, setSoundEnabled] = useState(true)
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const notifications = [
    { id: 1, type: 'alert', title: 'Siparis #4521 gecikiyor', message: '15 dk SLA asimi', time: '2 dk once', read: false, icon: AlertTriangle, iconBg: 'bg-red-50 dark:bg-red-900/30', iconColor: 'text-red-500' },
    { id: 2, type: 'order', title: 'Yeni siparis alindi', message: 'BRN-001250 - Fatma Demir', time: '5 dk once', read: false, icon: Package, iconBg: 'bg-blue-50 dark:bg-blue-900/30', iconColor: 'text-blue-500' },
    { id: 3, type: 'delivery', title: 'Siparis #4520 teslim edildi', message: 'Ali Riza K. - Kadikoy', time: '8 dk once', read: false, icon: CheckCircle, iconBg: 'bg-green-50 dark:bg-green-900/30', iconColor: 'text-green-500' },
    { id: 4, type: 'courier', title: 'Murat Yildirim offline', message: '30 dk dir baglanti yok', time: '15 dk once', read: true, icon: Truck, iconBg: 'bg-orange-50 dark:bg-orange-900/30', iconColor: 'text-orange-500' },
    { id: 5, type: 'alert', title: 'SLA ihlali - 3 siparis', message: 'Express Teslimat projesi', time: '25 dk once', read: true, icon: AlertTriangle, iconBg: 'bg-red-50 dark:bg-red-900/30', iconColor: 'text-red-500' },
    { id: 6, type: 'order', title: 'Toplu import tamamlandi', message: '45 siparis basariyla yuklendi', time: '1 saat once', read: true, icon: Package, iconBg: 'bg-blue-50 dark:bg-blue-900/30', iconColor: 'text-blue-500' },
    { id: 7, type: 'delivery', title: 'Siparis #4515 teslim edildi', message: 'Serkan Acar - Besiktas', time: '1 saat once', read: true, icon: CheckCircle, iconBg: 'bg-green-50 dark:bg-green-900/30', iconColor: 'text-green-500' },
    { id: 8, type: 'system', title: 'Sistem bakimi planlandi', message: 'Yarin 02:00 - 04:00 arasi', time: '3 saat once', read: true, icon: Settings, iconBg: 'bg-slate-100 dark:bg-slate-700', iconColor: 'text-slate-500' },
  ]

  const unreadCount = notifications.filter(n => !n.read).length
  const filteredNotifs = notifFilter === 'all' ? notifications : notifications.filter(n => n.type === notifFilter)

  const notifTypes = [
    { key: 'all', label: 'Tumu' },
    { key: 'alert', label: 'Uyari' },
    { key: 'order', label: 'Siparis' },
    { key: 'delivery', label: 'Teslimat' },
    { key: 'courier', label: 'Kurye' },
  ]

  return (
    <header className="h-16 bg-[#EF4444] text-white flex items-center justify-between px-6">
      {/* Search */}
      <div className="relative w-80">
        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/50" />
        <input
          type="text"
          placeholder="Siparis, kurye veya musteri ara..."
          className="w-full pl-10 pr-4 py-2 bg-white/15 border border-white/20 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-white/40 placeholder:text-white/50"
        />
      </div>

      <div className="flex items-center gap-3">
        {/* Dark Mode Toggle */}
        <button
          onClick={toggle}
          className="p-2 text-white/70 hover:bg-white/15 rounded-lg cursor-pointer transition-colors"
          title={dark ? 'Acik mod' : 'Karanlik mod'}
        >
          {dark ? <Sun size={20} /> : <Moon size={20} />}
        </button>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => { setShowNotifications(!showNotifications); setShowDropdown(false) }}
            className="relative p-2 text-white/70 hover:bg-white/15 rounded-lg cursor-pointer transition-colors"
          >
            <Bell size={20} />
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-white text-primary text-[10px] font-bold rounded-full flex items-center justify-center px-1">
                {unreadCount}
              </span>
            )}
          </button>
          {showNotifications && (
            <div className="absolute right-0 top-12 w-96 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 z-50">
              <div className="p-4 border-b border-slate-100 dark:border-slate-700">
                <div className="flex justify-between items-center mb-3">
                  <span className="font-semibold text-sm text-slate-800 dark:text-white">Bildirimler ({unreadCount})</span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setSoundEnabled(!soundEnabled)}
                      className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 cursor-pointer"
                      title={soundEnabled ? 'Sesi kapat' : 'Sesi ac'}
                    >
                      {soundEnabled ? <Volume2 size={14} /> : <VolumeX size={14} />}
                    </button>
                    <button className="text-xs text-primary cursor-pointer hover:underline">Tumunu okundu isaretle</button>
                  </div>
                </div>
                <div className="flex gap-1">
                  {notifTypes.map(t => (
                    <button
                      key={t.key}
                      onClick={() => setNotifFilter(t.key)}
                      className={`px-2.5 py-1 text-xs rounded-full cursor-pointer transition-colors ${
                        notifFilter === t.key
                          ? 'bg-primary text-white'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="max-h-96 overflow-y-auto">
                {filteredNotifs.map(n => {
                  const Icon = n.icon
                  return (
                    <div key={n.id} className={`p-4 border-b border-slate-50 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors ${!n.read ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''}`}>
                      <div className="flex gap-3">
                        <div className={`w-8 h-8 ${n.iconBg} rounded-lg flex items-center justify-center flex-shrink-0`}>
                          <Icon size={14} className={n.iconColor} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start">
                            <span className={`text-sm font-medium ${!n.read ? 'text-slate-800 dark:text-white' : 'text-slate-600 dark:text-slate-400'}`}>{n.title}</span>
                            <span className="text-xs text-slate-400 ml-2 flex-shrink-0">{n.time}</span>
                          </div>
                          <p className="text-xs text-slate-500 mt-0.5">{n.message}</p>
                        </div>
                        {!n.read && <span className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />}
                      </div>
                    </div>
                  )
                })}
              </div>
              <div className="p-3 text-center border-t border-slate-100 dark:border-slate-700">
                <button className="text-xs text-primary font-medium cursor-pointer hover:underline">Tum bildirimleri gor</button>
              </div>
            </div>
          )}
        </div>

        {/* User Menu */}
        <div className="relative">
          <button
            onClick={() => { setShowDropdown(!showDropdown); setShowNotifications(false) }}
            className="flex items-center gap-3 cursor-pointer hover:bg-white/15 rounded-lg px-3 py-2 transition-colors"
          >
            <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center text-primary text-sm font-semibold">
              {user?.firstName?.[0]}{user?.lastName?.[0]}
            </div>
            <div className="text-left hidden md:block">
              <p className="text-sm font-medium text-white">{user?.firstName} {user?.lastName}</p>
              <p className="text-xs text-white/60 capitalize">{user?.role?.replace('_', ' ')}</p>
            </div>
            <ChevronDown size={16} className="text-white/60" />
          </button>
          {showDropdown && (
            <div className="absolute right-0 top-12 w-48 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 py-2 z-50">
              <button className="w-full flex items-center gap-3 px-4 py-2 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer">
                <User size={16} /> Profil
              </button>
              <button onClick={() => { navigate('/settings'); setShowDropdown(false) }} className="w-full flex items-center gap-3 px-4 py-2 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer">
                <Settings size={16} /> Ayarlar
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

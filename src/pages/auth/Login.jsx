import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/store/authStore'
import { Eye, EyeOff } from 'lucide-react'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    const result = await login(email, password)
    setLoading(false)
    if (result.success) {
      navigate('/dashboard')
    } else {
      setError(result.message)
    }
  }

  const quickLogin = (email) => {
    setEmail(email)
    setPassword('123456')
  }

  return (
    <div className="min-h-screen flex">
      {/* Left - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-[#9B2D3F] via-[#7B1D2E] to-[#4A1019] text-white flex-col justify-center items-center p-12">
        <div className="max-w-md text-center">
          <svg viewBox="0 0 200 55" className="h-16 mx-auto mb-8" xmlns="http://www.w3.org/2000/svg">
            <rect x="20" y="2" width="48" height="42" rx="10" fill="white" />
            <text x="44" y="32" textAnchor="middle" fill="#7B1D2E" fontFamily="Inter, Arial, sans-serif" fontWeight="800" fontStyle="italic" fontSize="24">hey</text>
            <text x="74" y="34" fill="white" fontFamily="Inter, Arial, sans-serif" fontWeight="800" fontStyle="italic" fontSize="32">bringo</text>
            <text x="75" y="50" fill="rgba(255,255,255,0.6)" fontFamily="Inter, Arial, sans-serif" fontWeight="400" fontStyle="italic" fontSize="10">her şey yolunda</text>
          </svg>
          <p className="text-lg text-rose-200 mb-8">Kurye ve Lojistik Yonetim Platformu</p>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
              <p className="text-2xl font-bold">500+</p>
              <p className="text-xs text-rose-200 mt-1">Aktif Kurye</p>
            </div>
            <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
              <p className="text-2xl font-bold">50K+</p>
              <p className="text-xs text-rose-200 mt-1">Aylik Teslimat</p>
            </div>
            <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
              <p className="text-2xl font-bold">%98</p>
              <p className="text-xs text-rose-200 mt-1">Basari Orani</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right - Login Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center gap-3 mb-8 justify-center">
            <svg viewBox="0 0 155 42" className="h-10" xmlns="http://www.w3.org/2000/svg">
              <rect x="0" y="4" width="38" height="34" rx="8" fill="#7B1D2E" />
              <text x="19" y="28" textAnchor="middle" fill="white" fontFamily="Inter, Arial, sans-serif" fontWeight="800" fontStyle="italic" fontSize="19">hey</text>
              <text x="44" y="29" fill="#7B1D2E" fontFamily="Inter, Arial, sans-serif" fontWeight="800" fontStyle="italic" fontSize="26">bringo</text>
              <text x="45" y="40" fill="#94a3b8" fontFamily="Inter, Arial, sans-serif" fontWeight="400" fontStyle="italic" fontSize="8">her şey yolunda</text>
            </svg>
          </div>

          <h2 className="text-2xl font-bold text-slate-800 mb-2">Giris Yap</h2>
          <p className="text-slate-500 mb-8">Admin panelinize erisim saglayin</p>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg p-3 mb-6">{error}</div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-700 mb-2">E-posta</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm"
                placeholder="admin@bringo.com"
                required
              />
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-slate-700 mb-2">Sifre</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm pr-12"
                  placeholder="Sifrenizi girin"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 cursor-pointer"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary hover:bg-primary-dark text-white py-3 rounded-lg font-medium transition-colors disabled:opacity-50 cursor-pointer"
            >
              {loading ? 'Giris yapiliyor...' : 'Giris Yap'}
            </button>
          </form>

          {/* Quick Login */}
          <div className="mt-8 pt-6 border-t border-slate-200">
            <p className="text-xs text-slate-400 text-center mb-3">Hizli giris (sifre: 123456)</p>
            <div className="flex gap-2">
              <button onClick={() => quickLogin('admin@bringo.com')} className="flex-1 py-2 px-3 bg-slate-100 hover:bg-slate-200 rounded-lg text-xs font-medium text-slate-600 transition-colors cursor-pointer">
                Super Admin
              </button>
              <button onClick={() => quickLogin('manager@bringo.com')} className="flex-1 py-2 px-3 bg-slate-100 hover:bg-slate-200 rounded-lg text-xs font-medium text-slate-600 transition-colors cursor-pointer">
                Manager
              </button>
              <button onClick={() => quickLogin('operator@bringo.com')} className="flex-1 py-2 px-3 bg-slate-100 hover:bg-slate-200 rounded-lg text-xs font-medium text-slate-600 transition-colors cursor-pointer">
                Operator
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

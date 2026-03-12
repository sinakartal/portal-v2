import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'

export function LoginPage() {
  const [tab, setTab] = useState<'merchant' | 'admin'>('merchant')
  const [key, setKey] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { loginAsMerchant, loginAsAdmin } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const result = tab === 'merchant'
      ? await loginAsMerchant(key)
      : await loginAsAdmin(key)

    setLoading(false)

    if (result.success) {
      navigate(tab === 'merchant' ? '/merchant' : '/admin')
    } else {
      setError(result.error || 'Giris basarisiz')
    }
  }

  return (
    <div className="min-h-screen bg-bg-primary flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-accent flex items-center justify-center mx-auto mb-4">
            <span className="text-white text-2xl font-bold italic">B</span>
          </div>
          <h1 className="text-xl font-bold text-text-primary">Bringo Portal</h1>
          <p className="text-sm text-text-muted mt-1">Dispatch Portal'a giris yapin</p>
        </div>

        {/* Tabs */}
        <div className="flex bg-bg-secondary rounded-lg p-1 mb-6 border border-border-subtle">
          <button
            onClick={() => { setTab('merchant'); setError('') }}
            className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors cursor-pointer ${
              tab === 'merchant' ? 'bg-bg-tertiary text-text-primary' : 'text-text-muted hover:text-text-secondary'
            }`}
          >
            Marka Girisi
          </button>
          <button
            onClick={() => { setTab('admin'); setError('') }}
            className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors cursor-pointer ${
              tab === 'admin' ? 'bg-bg-tertiary text-text-primary' : 'text-text-muted hover:text-text-secondary'
            }`}
          >
            Admin Girisi
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label={tab === 'merchant' ? 'API Key' : 'Admin Key'}
            type="password"
            value={key}
            onChange={(e) => setKey(e.target.value)}
            placeholder={tab === 'merchant' ? 'brg_live_...' : 'Admin API key'}
            required
          />

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}

          <Button type="submit" disabled={loading || !key} className="w-full">
            {loading ? 'Giris yapiliyor...' : 'Giris Yap'}
          </Button>
        </form>

        <p className="text-center text-xs text-text-muted mt-8">
          Tracking sayfasi icin: <a href="/track" className="text-accent hover:underline">/track/:orderId</a>
        </p>
      </div>
    </div>
  )
}

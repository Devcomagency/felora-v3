'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

export default function AuthCheck() {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirect = searchParams.get('redirect') || '/'

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/auth-check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      })

      const data = await res.json()

      if (data.success) {
        // Rediriger vers la page demandée
        router.push(redirect)
        router.refresh()
      } else {
        setError('Mot de passe incorrect')
        setLoading(false)
      }
    } catch (err) {
      setError('Une erreur est survenue')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-felora-obsidian via-felora-charcoal to-felora-void">
      <div className="w-full max-w-md p-8">
        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-felora-aurora via-felora-plasma to-felora-quantum bg-clip-text text-transparent">
            FELORA
          </h1>
          <p className="text-felora-silver/60 mt-2">Site en développement</p>
        </div>

        {/* Card */}
        <div className="glass-card p-8">
          <h2 className="text-2xl font-semibold text-felora-pearl mb-2">
            🔒 Accès restreint
          </h2>
          <p className="text-felora-silver/70 mb-6">
            Entrez le mot de passe pour accéder au site
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Mot de passe"
                className="w-full px-4 py-3 bg-felora-steel/50 border border-felora-silver/10 rounded-lg text-felora-pearl placeholder:text-felora-silver/40 focus:outline-none focus:ring-2 focus:ring-felora-aurora/50"
                autoFocus
                disabled={loading}
              />
            </div>

            {error && (
              <div className="px-4 py-2 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !password}
              className="w-full py-3 bg-gradient-to-r from-felora-aurora to-felora-plasma text-white font-semibold rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Vérification...' : 'Accéder au site'}
            </button>
          </form>
        </div>

        {/* Footer */}
        <p className="text-center text-felora-silver/40 text-sm mt-6">
          © 2025 Felora - Tous droits réservés
        </p>
      </div>

      <style jsx global>{`
        .glass-card {
          background: rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 16px;
        }
      `}</style>
    </div>
  )
}

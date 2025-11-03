'use client'

import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

function AuthCheckForm() {
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-felora-obsidian via-felora-charcoal to-felora-void relative overflow-hidden">
      {/* Logo en arrière-plan */}
      <div
        className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none"
        style={{
          backgroundImage: 'url(/logo-principal.png)',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          backgroundSize: '60%',
        }}
      />

      <div className="w-full max-w-md p-8 relative z-10">
        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-felora-aurora via-felora-plasma to-felora-quantum bg-clip-text text-transparent">
            FELORA
          </h1>
          <p className="text-felora-silver/60 mt-2">Site en développement</p>
        </div>

        {/* Card */}
        <div className="glass-card p-8 backdrop-blur-xl">
          <h2 className="text-2xl font-semibold text-white mb-2 flex items-center gap-2">
            <span className="text-3xl">🔒</span>
            Accès restreint
          </h2>
          <p className="text-felora-silver/80 mb-6">
            Entrez le mot de passe pour accéder au site
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Entrez le mot de passe..."
                className="w-full px-4 py-3 bg-felora-void/80 border border-felora-aurora/30 rounded-xl text-white placeholder:text-felora-silver/50 focus:outline-none focus:ring-2 focus:ring-felora-aurora focus:border-felora-aurora transition-all"
                autoFocus
                disabled={loading}
              />
            </div>

            {error && (
              <div className="px-4 py-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm flex items-center gap-2 backdrop-blur-sm">
                <span className="text-lg">⚠️</span>
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !password}
              className="w-full py-3 bg-gradient-to-r from-felora-aurora via-felora-plasma to-felora-quantum text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-felora-aurora/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Vérification...
                </span>
              ) : (
                '✨ Accéder au site'
              )}
            </button>
          </form>
        </div>

        {/* Footer */}
        <p className="text-center text-felora-silver/50 text-sm mt-8 flex items-center justify-center gap-2">
          <span className="text-felora-aurora">✦</span>
          © 2025 Felora - Tous droits réservés
          <span className="text-felora-aurora">✦</span>
        </p>
      </div>

      <style jsx global>{`
        .glass-card {
          background: rgba(13, 13, 13, 0.6);
          backdrop-filter: blur(24px);
          border: 1px solid rgba(255, 107, 157, 0.2);
          border-radius: 20px;
          box-shadow: 0 8px 32px 0 rgba(255, 107, 157, 0.1);
        }
      `}</style>
    </div>
  )
}

export default function AuthCheck() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-felora-obsidian via-felora-charcoal to-felora-void">
        <div className="text-felora-silver">Chargement...</div>
      </div>
    }>
      <AuthCheckForm />
    </Suspense>
  )
}

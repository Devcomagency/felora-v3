"use client"
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function ForgotPasswordPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await fetch('/api/auth/password/forgot', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email }) })
      setSent(true)
    } catch {}
    setLoading(false)
  }

  useEffect(() => {
    if (sent) {
      const t = setTimeout(() => {
        const msg = encodeURIComponent('Email de réinitialisation envoyé')
        router.push(`/login?message=${msg}`)
      }, 1600)
      return () => clearTimeout(t)
    }
  }, [sent, router])

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-[#0D0D0D] to-[#1A1A1A] text-white px-6 py-12 grid place-items-center">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-white/[0.06] backdrop-blur-xl p-8">
        <h1 className="text-2xl font-extrabold tracking-tight text-center mb-1">Mot de passe oublié</h1>
        <p className="text-center text-white/70 text-sm mb-6">Entrez votre email. Si un compte existe, vous recevrez un lien de réinitialisation.</p>

        {sent ? (
          <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-emerald-400 text-sm text-center">
            Si un compte existe, un email a été envoyé.
          </div>
        ) : (
          <form onSubmit={submit} className="space-y-4">
            <label className="block">
              <span className="text-xs text-white/70 mb-1 inline-block">Email</span>
              <input
                type="email"
                className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-white/40 outline-none focus:border-white/20 focus:ring-2 focus:ring-teal-400/40"
                placeholder="votre@email.com"
                value={email}
                onChange={(e)=>setEmail(e.target.value)}
                required
              />
            </label>
            <button type="submit" disabled={loading} className={`w-full rounded-lg py-3 font-semibold shadow-lg transition-all ${loading ? 'opacity-70 cursor-not-allowed bg-white/10' : 'bg-violet-600 hover:bg-violet-500 hover:shadow-xl'}`}>
              {loading ? 'Envoi…' : 'Envoyer le lien'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}

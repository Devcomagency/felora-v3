"use client"
import { useSearchParams, useRouter } from 'next/navigation'
import { useState } from 'react'

export default function ResetPasswordPage() {
  const sp = useSearchParams()
  const router = useRouter()
  const token = sp.get('token') || ''
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [ok, setOk] = useState(false)
  const [loading, setLoading] = useState(false)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!token) { setError('Lien invalide'); return }
    if (!password || password !== confirm) { setError('Les mots de passe ne correspondent pas'); return }
    setLoading(true)
    try {
      const r = await fetch('/api/auth/password/reset', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ token, password }) })
      const d = await r.json().catch(()=>({}))
      if (!r.ok || !d?.success) throw new Error(d?.error || 'reset_failed')
      setOk(true)
    } catch (e:any) {
      setError(e?.message || 'Erreur serveur')
    } finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-[#0D0D0D] to-[#1A1A1A] text-white px-6 py-12 grid place-items-center">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-white/[0.06] backdrop-blur-xl p-8">
        <h1 className="text-2xl font-extrabold tracking-tight text-center mb-1">Réinitialiser le mot de passe</h1>
        {!token && (<p className="text-center text-red-400 text-sm">Lien invalide</p>)}

        {ok ? (
          <div className="space-y-4">
            <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-emerald-400 text-sm text-center">
              Mot de passe mis à jour. Vous pouvez vous connecter.
            </div>
            <div className="text-center">
              <button onClick={()=>router.push('/login')} className="rounded-lg px-4 py-2 bg-violet-600 hover:bg-violet-500">Aller à la connexion</button>
            </div>
          </div>
        ) : (
          <form onSubmit={submit} className="space-y-4">
            <label className="block">
              <span className="text-xs text-white/70 mb-1 inline-block">Nouveau mot de passe</span>
              <input type="password" className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-white outline-none focus:border-white/20 focus:ring-2 focus:ring-teal-400/40" value={password} onChange={(e)=>setPassword(e.target.value)} required />
            </label>
            <label className="block">
              <span className="text-xs text-white/70 mb-1 inline-block">Confirmer le mot de passe</span>
              <input type="password" className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-white outline-none focus:border-white/20 focus:ring-2 focus:ring-teal-400/40" value={confirm} onChange={(e)=>setConfirm(e.target.value)} required />
            </label>
            {error && (<div className="text-red-400 text-sm">{error}</div>)}
            <button type="submit" disabled={loading || !token} className={`w-full rounded-lg py-3 font-semibold shadow-lg transition-all ${loading ? 'opacity-70 cursor-not-allowed bg-white/10' : 'bg-violet-600 hover:bg-violet-500 hover:shadow-xl'}`}>
              {loading ? 'Mise à jour…' : 'Enregistrer'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}


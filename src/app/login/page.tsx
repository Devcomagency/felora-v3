"use client"

import React, { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { signIn, getSession } from 'next-auth/react'
import { Shield, MessageCircle, Star, Lock, Mail } from 'lucide-react'

interface LoginForm {
  email: string
  password: string
  rememberMe: boolean
}

// Composant séparé pour le contenu avec useSearchParams
function LoginContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [form, setForm] = useState<LoginForm>({
    email: '',
    password: '',
    rememberMe: false
  })
  const [errors, setErrors] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [successMessage, setSuccessMessage] = useState<string>('')
  
  // Récupérer le message depuis les paramètres URL
  useEffect(() => {
    const message = searchParams.get('message')
    if (message) {
      setSuccessMessage(decodeURIComponent(message))
    }
  }, [searchParams])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrors([])
    setLoading(true)

    // Validation
    const newErrors: string[] = []
    if (!form.email || !form.email.includes('@')) {
      newErrors.push('Email invalide')
    }
    if (!form.password) {
      newErrors.push('Mot de passe requis')
    }

    if (newErrors.length > 0) {
      setErrors(newErrors)
      setLoading(false)
      return
    }

    try {
      const result = await signIn('credentials', {
        email: form.email,
        password: form.password,
        redirect: false,
      })

      if (result?.error) {
        setErrors(['Email ou mot de passe incorrect'])
      } else {
        // Récupérer la session pour connaître le rôle
        const session = await getSession()
        const userRole = session?.user?.role?.toLowerCase()
        
        // Vérifier s'il y a une redirection spécifique
        const redirect = searchParams.get('redirect')
        if (redirect) {
          router.push(redirect)
          return
        }
        
        // Redirection vers le dashboard escort profil pour éviter les erreurs de données manquantes
        router.push('/dashboard-escort/profil')
      }
    } catch (error) {
      setErrors(['Erreur de connexion'])
    } finally {
      setLoading(false)
    }
  }

  const updateForm = (field: keyof LoginForm, value: any) => {
    setForm({ ...form, [field]: value })
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-[#0D0D0D] to-[#1A1A1A] text-white px-6 py-12 grid place-items-center">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-white/[0.06] backdrop-blur-xl p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="mx-auto mb-8">
            <img
              src="/logo-principal.png"
              alt="FELORA"
              className="w-32 h-32 object-contain mx-auto filter drop-shadow-2xl"
              style={{ filter: 'drop-shadow(0 0 30px rgba(255,107,157,0.8)) drop-shadow(0 0 60px rgba(183,148,246,0.6))' }}
            />
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight">Connexion</h1>
          <p className="text-white/70 mt-1">
            Accédez à votre compte FELORA
          </p>
          <div className="mt-3 flex items-center justify-center gap-2 text-[11px] text-white/60">
            <Shield className="w-4 h-4 text-teal-300" /> Données protégées
            <span>•</span>
            <MessageCircle className="w-4 h-4 text-[#4FD1C7]" /> Messagerie sécurisée
            <span>•</span>
            <Star className="w-4 h-4 text-pink-300" /> Expérience premium
          </div>
        </div>

        {/* Message de succès */}
        {successMessage && (
          <div role="status" aria-live="polite" className="mb-4 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-emerald-400 text-sm">
            ✅ {successMessage}
          </div>
        )}

        {/* Erreurs */}
        {errors.length > 0 && (
          <div role="alert" className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-red-400 text-sm">
            {errors.map((err, i) => (
              <p key={i}>• {err}</p>
            ))}
          </div>
        )}

        {/* Formulaire */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <label className="block">
            <span className="text-xs text-white/70 mb-1 inline-flex items-center gap-2"><Mail className="w-3.5 h-3.5" /> Email</span>
            <input
              type="email"
              placeholder="votre@email.com"
              value={form.email}
              onChange={(e) => updateForm('email', e.target.value)}
              className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-white/40 outline-none focus:border-white/20 focus:ring-2 focus:ring-teal-400/40"
            />
          </label>

          <label className="block">
            <span className="text-xs text-white/70 mb-1 inline-flex items-center gap-2"><Lock className="w-3.5 h-3.5" /> Mot de passe</span>
            <input
              type="password"
              placeholder="••••••••"
              value={form.password}
              onChange={(e) => updateForm('password', e.target.value)}
              className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-white/40 outline-none focus:border-white/20 focus:ring-2 focus:ring-teal-400/40"
            />
          </label>

          <div className="flex items-center justify-between">
            <label className="inline-flex items-center gap-2 text-sm text-white/80 cursor-pointer">
              <input type="checkbox" checked={form.rememberMe} onChange={(e) => updateForm('rememberMe', e.target.checked)} className="rounded" />
              Se souvenir de moi
            </label>
            <button type="button" onClick={() => window.location.href = '/forgot-password'} className="text-sm text-[#4FD1C7] underline hover:text-teal-300">
              Mot de passe oublié ?
            </button>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full rounded-lg py-3 font-semibold shadow-lg transition-all ${loading ? 'opacity-70 cursor-not-allowed bg-white/10' : 'bg-violet-600 hover:bg-violet-500 hover:shadow-xl'}`}
          >
            {loading ? (
              <span className="inline-flex items-center gap-2">
                <span className="inline-block w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                Connexion…
              </span>
            ) : (
              'Se connecter'
            )}
          </button>
        </form>

        <div className="text-center mt-6 text-sm text-white/70">
          Pas encore de compte ?
          <button onClick={() => router.push('/register')} className="ml-2 text-[#4FD1C7] underline hover:text-teal-300">
            S'inscrire
          </button>
        </div>

        <div className="text-center mt-3">
          <button onClick={() => router.push('/')} className="text-xs px-3 py-1.5 rounded-md border border-white/10 text-white/60 hover:text-white/80 hover:border-white/20">
            ← Retour à l'accueil
          </button>
        </div>
      </div>
    </div>
  )
}

// Composant de fallback pour le Suspense
function LoginFallback() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-[#0D0D0D] to-[#1A1A1A] text-white px-6 py-12 grid place-items-center">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-white/[0.06] backdrop-blur-xl p-8">
        <div className="text-center">
          <div className="inline-block w-6 h-6 rounded-full border-2 border-white/30 border-t-white animate-spin" />
          <p className="mt-4 text-white/70">Chargement...</p>
        </div>
      </div>
    </div>
  )
}

// Composant principal avec Suspense
export default function LoginPage() {
  return (
    <Suspense fallback={<LoginFallback />}>
      <LoginContent />
    </Suspense>
  )
}
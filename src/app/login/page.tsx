"use client"

import React, { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { signIn, getSession } from 'next-auth/react'
import { motion } from 'framer-motion'
import { Shield, LogIn, Mail, Lock, ArrowRight, Sparkles } from 'lucide-react'
import { useTranslations } from 'next-intl'
import track from '@/lib/analytics/tracking'

interface LoginForm {
  email: string
  password: string
  rememberMe: boolean
}

// Composant séparé pour le contenu avec useSearchParams
function LoginContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const t = useTranslations('auth.login')
  const [form, setForm] = useState<LoginForm>({
    email: '',
    password: '',
    rememberMe: false
  })
  const [errors, setErrors] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [successMessage, setSuccessMessage] = useState<string>('')
  const [checkingSession, setCheckingSession] = useState(true)

  // Vérifier si l'utilisateur est déjà connecté
  useEffect(() => {
    const checkExistingSession = async () => {
      try {
        const session = await getSession()
        if (session?.user) {
          // L'utilisateur est déjà connecté, rediriger vers la page d'accueil
          const redirect = searchParams.get('redirect')
          if (redirect) {
            router.push(redirect)
          } else {
            router.push('/')
          }
          return
        }
      } catch (error) {
        console.error('Error checking session:', error)
      } finally {
        setCheckingSession(false)
      }
    }

    checkExistingSession()
  }, [router, searchParams])

  // Récupérer le message depuis les paramètres URL
  useEffect(() => {
    // 📊 Track login page view
    const referrer = searchParams.get('redirect') || 'direct'
    track.loginPageView(referrer)

    const message = searchParams.get('message')
    if (message) {
      setSuccessMessage(decodeURIComponent(message))
    }

    // Vérifier si l'utilisateur a été redirigé après suspension/bannissement
    const error = searchParams.get('error')
    if (error === 'suspended') {
      setErrors([t('errors.accountSuspended')])
    }
  }, [searchParams, router, t])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrors([])
    setLoading(true)

    // Validation
    const newErrors: string[] = []
    if (!form.email || !form.email.includes('@')) {
      newErrors.push(t('errors.invalidEmail'))
    }
    if (!form.password) {
      newErrors.push(t('errors.passwordRequired'))
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
        // 📊 Track login failure
        track.loginFailed(result.error, 'credentials')
        // Afficher le message d'erreur exact (suspension, ban, ou identifiants invalides)
        setErrors([result.error])
      } else {
        // Get user type from session to track success
        const session = await getSession()
        const userType = session?.user?.role || 'unknown'

        // 📊 Track login success
        track.loginSuccess('credentials', userType)

        // Vérifier s'il y a une redirection spécifique
        const redirect = searchParams.get('redirect')
        if (redirect) {
          window.location.href = redirect
          return
        }

        // Redirection vers la page d'accueil après connexion (forcer avec window.location)
        window.location.href = '/'
      }
    } catch (error) {
      // 📊 Track connection error
      track.loginFailed('connection_error', 'credentials')
      setErrors([t('errors.connectionError')])
    } finally {
      setLoading(false)
    }
  }

  const updateForm = (field: keyof LoginForm, value: any) => {
    setForm({ ...form, [field]: value })
  }

  // Afficher un loader pendant la vérification de session
  if (checkingSession) {
    return (
      <main className="fixed inset-0 bg-black text-white overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-pink-900/10 via-black to-black" />
        <div className="relative z-10 h-full flex items-center justify-center">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-white/30 border-t-pink-500 rounded-full animate-spin mx-auto mb-4" />
            <p className="text-white/70">{t('loading')}</p>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="fixed inset-0 bg-black text-white overflow-hidden">
      {/* Background Effects - same as register page */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-pink-900/10 via-black to-black" />
      <div className="absolute inset-0 bg-grid-white/[0.02]" />
      <div className="absolute top-1/4 -left-48 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-1/4 -right-48 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-700" />

      <div className="relative z-10 h-full flex items-center justify-center px-4 py-12 overflow-y-auto">
        <div className="w-full max-w-md">
          {/* Header */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-8"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="mb-6"
            >
              <img
                src="/logo-principal.png"
                alt="FELORA"
                className="w-32 h-32 md:w-40 md:h-40 object-contain mx-auto"
                style={{
                  filter: 'drop-shadow(0 0 30px rgba(255,107,157,0.5)) drop-shadow(0 0 60px rgba(183,148,246,0.3))'
                }}
              />
            </motion.div>
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              <h1 className="text-3xl md:text-4xl font-black tracking-tight mb-3 bg-gradient-to-r from-white via-white/90 to-white/80 bg-clip-text text-transparent">
                {t('title')}
              </h1>
              <p className="text-white/70 text-base md:text-lg font-light">
                {t('subtitle')}
              </p>
            </motion.div>
          </motion.div>

          {/* Form Card */}
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="rounded-2xl bg-gradient-to-br from-white/5 to-transparent border border-white/10 p-8 backdrop-blur-xl"
          >
            {/* Message de succès */}
            {successMessage && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                role="status"
                aria-live="polite"
                className="mb-6 rounded-xl border border-green-500/30 bg-green-500/10 px-4 py-3 text-green-400 text-sm flex items-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                {successMessage}
              </motion.div>
            )}

            {/* Erreurs */}
            {errors.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                role="alert"
                className="mb-6 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-red-400 text-sm"
              >
                {errors.map((err, i) => (
                  <p key={i} className="flex items-center gap-2">
                    <span className="text-red-500">•</span> {err}
                  </p>
                ))}
              </motion.div>
            )}

            {/* Formulaire */}
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block mb-2">
                  <span className="text-sm text-white/70 font-medium inline-flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    {t('form.email')}
                  </span>
                </label>
                <input
                  type="email"
                  placeholder={t('form.emailPlaceholder')}
                  value={form.email}
                  onChange={(e) => updateForm('email', e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-white placeholder-white/40 outline-none focus:border-pink-500/50 focus:ring-2 focus:ring-pink-500/20 transition-all"
                />
              </div>

              <div>
                <label className="block mb-2">
                  <span className="text-sm text-white/70 font-medium inline-flex items-center gap-2">
                    <Lock className="w-4 h-4" />
                    {t('form.password')}
                  </span>
                </label>
                <input
                  type="password"
                  placeholder={t('form.passwordPlaceholder')}
                  value={form.password}
                  onChange={(e) => updateForm('password', e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-white placeholder-white/40 outline-none focus:border-pink-500/50 focus:ring-2 focus:ring-pink-500/20 transition-all"
                />
              </div>

              <div className="flex items-center justify-between">
                <label className="inline-flex items-center gap-2 text-sm text-white/70 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.rememberMe}
                    onChange={(e) => updateForm('rememberMe', e.target.checked)}
                    className="w-4 h-4 rounded border-white/20 bg-white/5 text-pink-500 focus:ring-pink-500/20"
                  />
                  {t('form.rememberMe')}
                </label>
                <button
                  type="button"
                  onClick={() => router.push('/forgot-password')}
                  className="text-sm text-pink-300 hover:text-pink-200 transition-colors"
                >
                  {t('form.forgotPassword')}
                </button>
              </div>

              <button
                type="submit"
                disabled={loading}
                className={`w-full rounded-xl py-3.5 font-bold text-base transition-all flex items-center justify-center gap-2 ${
                  loading
                    ? 'bg-white/5 border border-white/10 text-white/40 cursor-not-allowed'
                    : 'bg-gradient-to-r from-pink-500/20 to-purple-500/20 hover:from-pink-500/30 hover:to-purple-500/30 border border-pink-500/30 hover:border-pink-500/50 text-white shadow-lg hover:shadow-pink-500/20'
                }`}
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    {t('form.loggingIn')}
                  </>
                ) : (
                  t('form.submit')
                )}
              </button>
            </form>

            {/* Footer */}
            <div className="mt-6 space-y-4">
              <div className="text-center text-sm text-white/60">
                {t('footer.noAccount')}{' '}
                <button
                  onClick={() => router.push('/register')}
                  className="text-pink-300 hover:text-pink-200 font-semibold transition-colors"
                >
                  {t('footer.register')}
                </button>
              </div>

              <div className="text-center">
                <button
                  onClick={() => router.push('/')}
                  className="text-sm px-4 py-2 rounded-lg border border-white/10 text-white/60 hover:text-white hover:border-white/20 transition-all inline-flex items-center gap-2"
                >
                  <ArrowRight size={16} className="rotate-180" />
                  {t('footer.backToHome')}
                </button>
              </div>

              {/* Trust badges */}
              <div className="pt-4 border-t border-white/10">
                <div className="flex items-center justify-center gap-4 text-xs text-white/50">
                  <div className="flex items-center gap-1.5">
                    <Shield className="w-3.5 h-3.5 text-pink-300" />
                    <span>{t('trust.secure')}</span>
                  </div>
                  <span>•</span>
                  <div className="flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-purple-300" />
                    <span>{t('trust.encrypted')}</span>
                  </div>
                  <span>•</span>
                  <div className="flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-pink-300" />
                    <span>{t('trust.premium')}</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </main>
  )
}

// Composant de fallback pour le Suspense
function LoginFallback() {
  const t = useTranslations('auth.login')
  return (
    <main className="fixed inset-0 bg-black text-white overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-pink-900/10 via-black to-black" />
      <div className="relative z-10 h-full flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-white/30 border-t-pink-500 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-white/70">{t('loading')}</p>
        </div>
      </div>
    </main>
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

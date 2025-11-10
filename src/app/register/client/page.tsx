"use client"

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { signIn } from 'next-auth/react'
import { User, Mail, Lock, Eye, EyeOff, Shield, CheckCircle, Loader2, ArrowLeft } from 'lucide-react'

export default function ClientRegisterPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    isAdult: false,
    acceptTos: false
  })

  const updateField = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear field error when user types
    if (fieldErrors[field]) {
      setFieldErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[field]
        return newErrors
      })
    }
  }

  const validateForm = () => {
    const errors: Record<string, string> = {}

    if (!formData.name.trim()) {
      errors.name = 'Le nom est requis'
    }

    if (!formData.email.trim()) {
      errors.email = 'L\'email est requis'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Email invalide'
    }

    if (!formData.password) {
      errors.password = 'Le mot de passe est requis'
    } else if (formData.password.length < 8) {
      errors.password = 'Minimum 8 caractères'
    }

    if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Les mots de passe ne correspondent pas'
    }

    if (!formData.isAdult) {
      errors.isAdult = 'Vous devez confirmer avoir 18 ans ou plus'
    }

    if (!formData.acceptTos) {
      errors.acceptTos = 'Vous devez accepter les CGU'
    }

    return errors
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setFieldErrors({})

    // Validation
    const errors = validateForm()
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors)
      return
    }

    setLoading(true)

    try {
      // Generate pseudo from email
      const emailPrefix = formData.email.split('@')[0]
      const pseudo = emailPrefix.replace(/[^a-zA-Z0-9_.-]/g, '').toLowerCase().slice(0, 20) || 'client'

      const payload = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        confirm: formData.confirmPassword,
        pseudo,
        isAdult: formData.isAdult,
        acceptTos: formData.acceptTos,
        emailVerified: true
      }

      const res = await fetch('/api/signup-v2/client', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      const data = await res.json()

      if (data?.ok) {
        // Auto login
        try {
          await signIn('credentials', {
            email: formData.email,
            password: formData.password,
            redirect: false
          })
        } catch (e) {
          console.log('Login failed, but account created:', e)
        }

        const msg = encodeURIComponent('Compte client créé avec succès !')
        router.push(`/?message=${msg}`)
      } else {
        setError(data?.error || 'Erreur lors de la création du compte')
      }
    } catch (err: any) {
      setError(err?.message || 'Erreur lors de la création du compte')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative min-h-screen bg-black text-white overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-cyan-900/10 via-black to-black" />
      <div className="absolute inset-0 bg-grid-white/[0.02]" />

      {/* Animated gradient orbs */}
      <div className="absolute top-1/4 -left-48 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-1/4 -right-48 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-700" />

      <div className="relative z-10 container mx-auto px-4 py-8 flex flex-col min-h-screen">
        {/* Back Button */}
        <motion.button
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          onClick={() => router.push('/register')}
          className="flex items-center gap-2 text-white/60 hover:text-white transition-colors mb-6 group w-fit"
        >
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          <span className="text-sm">Retour</span>
        </motion.button>

        {/* Header */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="mb-6"
          >
            <div className="inline-flex p-4 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 shadow-lg shadow-cyan-500/10">
              <User className="w-10 h-10 text-cyan-300" strokeWidth={2} />
            </div>
          </motion.div>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-3 bg-gradient-to-r from-white via-white/90 to-white/80 bg-clip-text text-transparent">
              Inscription Client
            </h1>
            <p className="text-white/60 text-sm max-w-md mx-auto">
              Créez votre compte en quelques secondes
            </p>
          </motion.div>
        </div>

        {/* Form */}
        <div className="flex-1 flex items-center justify-center">
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="w-full max-w-md"
          >
            <div className="relative rounded-3xl border border-white/10 bg-white/[0.03] backdrop-blur-xl p-8">
              {/* Gradient overlay */}
              <div className="absolute inset-0 rounded-3xl opacity-50 bg-gradient-to-br from-cyan-500/10 via-blue-500/5 to-transparent" />

              <form onSubmit={handleSubmit} className="relative space-y-6">
                {/* Global Error */}
                {error && (
                  <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-sm flex items-start gap-2">
                    <Shield className="w-5 h-5 flex-shrink-0 mt-0.5" />
                    <span>{error}</span>
                  </div>
                )}

                {/* Name */}
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">
                    Nom complet <span className="text-red-400">*</span>
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => updateField('name', e.target.value)}
                      required
                      className={`w-full pl-11 pr-4 py-3 bg-white/5 border ${
                        fieldErrors.name ? 'border-red-500/50' : 'border-white/10'
                      } rounded-xl text-white placeholder:text-white/30 focus:outline-none focus:border-cyan-500/50 transition-colors`}
                      placeholder="Jean Dupont"
                    />
                  </div>
                  {fieldErrors.name && (
                    <p className="mt-1 text-xs text-red-400">{fieldErrors.name}</p>
                  )}
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">
                    Email <span className="text-red-400">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => updateField('email', e.target.value)}
                      required
                      className={`w-full pl-11 pr-4 py-3 bg-white/5 border ${
                        fieldErrors.email ? 'border-red-500/50' : 'border-white/10'
                      } rounded-xl text-white placeholder:text-white/30 focus:outline-none focus:border-cyan-500/50 transition-colors`}
                      placeholder="jean@exemple.com"
                    />
                  </div>
                  {fieldErrors.email && (
                    <p className="mt-1 text-xs text-red-400">{fieldErrors.email}</p>
                  )}
                </div>

                {/* Password */}
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">
                    Mot de passe <span className="text-red-400">*</span>
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={formData.password}
                      onChange={(e) => updateField('password', e.target.value)}
                      required
                      minLength={8}
                      className={`w-full pl-11 pr-11 py-3 bg-white/5 border ${
                        fieldErrors.password ? 'border-red-500/50' : 'border-white/10'
                      } rounded-xl text-white placeholder:text-white/30 focus:outline-none focus:border-cyan-500/50 transition-colors`}
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/60 transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  {fieldErrors.password && (
                    <p className="mt-1 text-xs text-red-400">{fieldErrors.password}</p>
                  )}
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">
                    Confirmer le mot de passe <span className="text-red-400">*</span>
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={formData.confirmPassword}
                      onChange={(e) => updateField('confirmPassword', e.target.value)}
                      required
                      className={`w-full pl-11 pr-4 py-3 bg-white/5 border ${
                        fieldErrors.confirmPassword ? 'border-red-500/50' : 'border-white/10'
                      } rounded-xl text-white placeholder:text-white/30 focus:outline-none focus:border-cyan-500/50 transition-colors`}
                      placeholder="••••••••"
                    />
                  </div>
                  {fieldErrors.confirmPassword && (
                    <p className="mt-1 text-xs text-red-400">{fieldErrors.confirmPassword}</p>
                  )}
                </div>

                {/* Checkboxes */}
                <div className="space-y-3">
                  <label className="flex items-start gap-3 cursor-pointer group">
                    <div className="relative flex-shrink-0 mt-0.5">
                      <input
                        type="checkbox"
                        checked={formData.isAdult}
                        onChange={(e) => updateField('isAdult', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className={`w-5 h-5 border-2 rounded ${
                        fieldErrors.isAdult ? 'border-red-500/50' : 'border-white/20'
                      } peer-checked:bg-gradient-to-r peer-checked:from-cyan-500 peer-checked:to-blue-500 peer-checked:border-transparent transition-all`}>
                        {formData.isAdult && (
                          <CheckCircle className="w-full h-full text-white p-0.5" />
                        )}
                      </div>
                    </div>
                    <span className="text-sm text-white/70 group-hover:text-white/90 transition-colors">
                      Je confirme avoir 18 ans ou plus
                    </span>
                  </label>
                  {fieldErrors.isAdult && (
                    <p className="text-xs text-red-400 ml-8">{fieldErrors.isAdult}</p>
                  )}

                  <label className="flex items-start gap-3 cursor-pointer group">
                    <div className="relative flex-shrink-0 mt-0.5">
                      <input
                        type="checkbox"
                        checked={formData.acceptTos}
                        onChange={(e) => updateField('acceptTos', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className={`w-5 h-5 border-2 rounded ${
                        fieldErrors.acceptTos ? 'border-red-500/50' : 'border-white/20'
                      } peer-checked:bg-gradient-to-r peer-checked:from-cyan-500 peer-checked:to-blue-500 peer-checked:border-transparent transition-all`}>
                        {formData.acceptTos && (
                          <CheckCircle className="w-full h-full text-white p-0.5" />
                        )}
                      </div>
                    </div>
                    <span className="text-sm text-white/70 group-hover:text-white/90 transition-colors">
                      J'accepte les{' '}
                      <a href="/legal/cgu" target="_blank" className="text-cyan-400 hover:text-cyan-300 underline">
                        conditions générales d'utilisation
                      </a>
                    </span>
                  </label>
                  {fieldErrors.acceptTos && (
                    <p className="text-xs text-red-400 ml-8">{fieldErrors.acceptTos}</p>
                  )}
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 px-6 py-4 rounded-xl bg-gradient-to-r from-cyan-500/20 to-blue-500/20 hover:from-cyan-500/30 hover:to-blue-500/30 border border-cyan-500/30 hover:border-cyan-500/50 text-white font-semibold shadow-lg hover:shadow-cyan-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Création en cours...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-5 h-5" />
                      Créer mon compte
                    </>
                  )}
                </button>

                {/* Login Link */}
                <div className="text-center text-sm text-white/40">
                  Vous avez déjà un compte ?{' '}
                  <button
                    type="button"
                    onClick={() => router.push('/login')}
                    className="text-cyan-400 hover:text-cyan-300 font-semibold underline underline-offset-4 transition-colors"
                  >
                    Se connecter
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

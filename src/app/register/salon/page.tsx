"use client"

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { signIn } from 'next-auth/react'
import { Building, Mail, Lock, Eye, EyeOff, Shield, CheckCircle, Loader2, ArrowLeft, User, Phone } from 'lucide-react'
import { useTranslations } from 'next-intl'

export default function ClubRegisterPage() {
  const router = useRouter()
  const t = useTranslations('auth.registerSalon')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

  const [formData, setFormData] = useState({
    companyName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    isAdult: false,
    acceptTos: false
  })

  const updateField = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
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

    if (!formData.companyName.trim()) {
      errors.companyName = t('form.companyNameRequired')
    }

    if (!formData.email.trim()) {
      errors.email = t('form.emailRequired')
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = t('form.emailInvalid')
    }

    if (formData.phone && !/^[\d\s\+\(\)-]+$/.test(formData.phone)) {
      errors.phone = t('form.phoneInvalid')
    }

    if (!formData.password) {
      errors.password = t('form.passwordRequired')
    } else if (formData.password.length < 8) {
      errors.password = t('form.passwordMinLength')
    }

    if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = t('form.confirmPasswordMismatch')
    }

    if (!formData.isAdult) {
      errors.isAdult = t('form.isAdultRequired')
    }

    if (!formData.acceptTos) {
      errors.acceptTos = t('form.acceptTosRequired')
    }

    return errors
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setFieldErrors({})

    const errors = validateForm()
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors)
      return
    }

    setLoading(true)

    try {
      const payload = {
        companyName: formData.companyName,
        email: formData.email,
        phone: formData.phone || undefined,
        password: formData.password,
        confirm: formData.confirmPassword,
        isAdult: formData.isAdult,
        acceptTos: formData.acceptTos
      }

      const res = await fetch('/api/signup-v2/club', {
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

        router.push('/club/profile')
      } else {
        setError(data?.error || t('messages.creationError'))
      }
    } catch (err: any) {
      setError(err?.message || t('messages.creationError'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative min-h-screen bg-black text-white overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-violet-900/10 via-black to-black" />
      <div className="absolute inset-0 bg-grid-white/[0.02]" />

      {/* Animated gradient orbs */}
      <div className="absolute top-1/4 -left-48 w-96 h-96 bg-violet-500/10 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-1/4 -right-48 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-700" />

      <div className="relative z-10 container mx-auto px-4 py-8 flex flex-col min-h-screen">
        {/* Back Button */}
        <motion.button
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          onClick={() => router.push('/register')}
          className="flex items-center gap-2 text-white/60 hover:text-white transition-colors mb-6 group w-fit"
        >
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          <span className="text-sm">{t('backButton')}</span>
        </motion.button>

        {/* Header */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="mb-6"
          >
            <div className="inline-flex p-4 rounded-2xl bg-gradient-to-br from-violet-500/20 to-purple-500/20 border border-violet-500/30 shadow-lg shadow-violet-500/10">
              <Building className="w-10 h-10 text-violet-300" strokeWidth={2} />
            </div>
          </motion.div>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-3 bg-gradient-to-r from-white via-white/90 to-white/80 bg-clip-text text-transparent">
              {t('title')}
            </h1>
            <p className="text-white/60 text-sm max-w-md mx-auto">
              {t('subtitle')}
            </p>
          </motion.div>
        </div>

        {/* Form */}
        <div className="flex-1 flex items-center justify-center pb-8">
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="w-full max-w-md"
          >
            <div className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl p-8 shadow-2xl">
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Error Display */}
                {error && (
                  <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-sm flex items-start gap-2">
                    <Shield className="w-5 h-5 flex-shrink-0 mt-0.5" />
                    <span>{error}</span>
                  </div>
                )}

                {/* Company Name */}
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">
                    {t('form.companyName')} <span className="text-red-400">{t('form.required')}</span>
                  </label>
                  <div className="relative">
                    <Building className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                    <input
                      type="text"
                      value={formData.companyName}
                      onChange={(e) => updateField('companyName', e.target.value)}
                      required
                      className={`w-full pl-11 pr-4 py-3 bg-white/5 border ${
                        fieldErrors.companyName ? 'border-red-500/50' : 'border-white/10'
                      } rounded-xl text-white placeholder:text-white/30 focus:outline-none focus:border-violet-500/50 transition-colors`}
                      placeholder={t('form.companyNamePlaceholder')}
                    />
                  </div>
                  {fieldErrors.companyName && (
                    <p className="mt-1 text-xs text-red-400">{fieldErrors.companyName}</p>
                  )}
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">
                    {t('form.email')} <span className="text-red-400">{t('form.required')}</span>
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
                      } rounded-xl text-white placeholder:text-white/30 focus:outline-none focus:border-violet-500/50 transition-colors`}
                      placeholder={t('form.emailPlaceholder')}
                    />
                  </div>
                  {fieldErrors.email && (
                    <p className="mt-1 text-xs text-red-400">{fieldErrors.email}</p>
                  )}
                </div>

                {/* Phone (optional) */}
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">
                    {t('form.phone')}
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => updateField('phone', e.target.value)}
                      className={`w-full pl-11 pr-4 py-3 bg-white/5 border ${
                        fieldErrors.phone ? 'border-red-500/50' : 'border-white/10'
                      } rounded-xl text-white placeholder:text-white/30 focus:outline-none focus:border-violet-500/50 transition-colors`}
                      placeholder={t('form.phonePlaceholder')}
                    />
                  </div>
                  {fieldErrors.phone && (
                    <p className="mt-1 text-xs text-red-400">{fieldErrors.phone}</p>
                  )}
                </div>

                {/* Password */}
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">
                    {t('form.password')} <span className="text-red-400">{t('form.required')}</span>
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
                      } rounded-xl text-white placeholder:text-white/30 focus:outline-none focus:border-violet-500/50 transition-colors`}
                      placeholder={t('form.passwordPlaceholder')}
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
                    {t('form.confirmPassword')} <span className="text-red-400">{t('form.required')}</span>
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
                      } rounded-xl text-white placeholder:text-white/30 focus:outline-none focus:border-violet-500/50 transition-colors`}
                      placeholder={t('form.passwordPlaceholder')}
                    />
                  </div>
                  {fieldErrors.confirmPassword && (
                    <p className="mt-1 text-xs text-red-400">{fieldErrors.confirmPassword}</p>
                  )}
                </div>

                {/* Checkboxes */}
                <div className="space-y-3 pt-2">
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
                      } peer-checked:bg-gradient-to-r peer-checked:from-violet-500 peer-checked:to-purple-500 peer-checked:border-transparent transition-all`}>
                        {formData.isAdult && (
                          <CheckCircle className="w-full h-full text-white p-0.5" />
                        )}
                      </div>
                    </div>
                    <span className="text-sm text-white/70 group-hover:text-white/90 transition-colors">
                      {t('form.isAdultConfirm')} <span className="text-red-400">{t('form.required')}</span>
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
                      } peer-checked:bg-gradient-to-r peer-checked:from-violet-500 peer-checked:to-purple-500 peer-checked:border-transparent transition-all`}>
                        {formData.acceptTos && (
                          <CheckCircle className="w-full h-full text-white p-0.5" />
                        )}
                      </div>
                    </div>
                    <span className="text-sm text-white/70 group-hover:text-white/90 transition-colors">
                      {t('form.acceptTos')}{' '}
                      <a href="/legal/cgu" target="_blank" className="text-violet-400 hover:text-violet-300 underline">
                        {t('form.acceptTosLink')}
                      </a>{' '}
                      <span className="text-red-400">{t('form.required')}</span>
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
                  className="w-full flex items-center justify-center gap-2 px-6 py-4 rounded-xl bg-gradient-to-r from-violet-500/20 to-purple-500/20 hover:from-violet-500/30 hover:to-purple-500/30 border border-violet-500/30 hover:border-violet-500/50 text-white font-semibold shadow-lg hover:shadow-violet-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      {t('buttons.registering')}
                    </>
                  ) : (
                    <>
                      {t('buttons.register')}
                      <Building className="w-5 h-5" />
                    </>
                  )}
                </button>

                {/* Login Link */}
                <div className="text-center text-sm text-white/40 pt-2">
                  {t('messages.hasAccount')}{' '}
                  <button
                    type="button"
                    onClick={() => router.push('/login')}
                    className="text-violet-400 hover:text-violet-300 font-semibold underline underline-offset-4 transition-colors"
                  >
                    {t('buttons.login')}
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

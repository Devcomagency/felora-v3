"use client"

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { signIn } from 'next-auth/react'
import { Crown, Mail, Lock, Eye, EyeOff, Shield, CheckCircle, Loader2, ArrowLeft, Phone, User, Calendar } from 'lucide-react'
import { useTranslations } from 'next-intl'

export default function EscortRegisterPage() {
  const router = useRouter()
  const t = useTranslations('auth.registerEscort')

  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

  // Email verification states
  const [emailSending, setEmailSending] = useState(false)
  const [emailSent, setEmailSent] = useState(false)
  const [emailVerified, setEmailVerified] = useState(false)
  const [emailCode, setEmailCode] = useState('')
  const [cooldownSec, setCooldownSec] = useState(0)

  const [formData, setFormData] = useState({
    stageName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    dateOfBirth: '',
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

  const normalizeSwissPhone = (input: string): string | null => {
    if (!input) return null
    const trimmed = input.trim()
    let n = trimmed.replace(/\D+/g, '')
    if (n.startsWith('0041')) n = '41' + n.slice(4)
    if (n.startsWith('41')) {
      const rest = n.slice(2)
      if (rest.length === 9) return '+41' + rest
    }
    if (n.startsWith('0') && n.length === 10) {
      return '+41' + n.slice(1)
    }
    if (n.length === 9) {
      return '+41' + n
    }
    return null
  }

  const sendVerificationEmail = async () => {
    if (!formData.email) return
    setEmailSending(true)
    setError(null)
    try {
      const res = await fetch('/api/auth/send-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email })
      })
      const d = await res.json()
      if (!res.ok || !d?.success) throw new Error(d?.error || t('errors.emailSendError'))

      // En développement, log le code dans la console (pas d'alert)
      if (d?.developmentCode) {
        console.log('🔐 CODE DE VÉRIFICATION (dev):', d.developmentCode)
      }

      setEmailSent(true)
      setCooldownSec(60)
      const interval = setInterval(() => {
        setCooldownSec(prev => {
          if (prev <= 1) { clearInterval(interval); return 0 }
          return prev - 1
        })
      }, 1000)
    } catch (e: any) {
      setError(e?.message || t('errors.emailSendError'))
    } finally {
      setEmailSending(false)
    }
  }

  const verifyEmailCode = async () => {
    if (!emailCode || !formData.email) return
    try {
      const res = await fetch('/api/signup-v2/email/verify-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email, code: emailCode })
      })
      const d = await res.json()
      if (!res.ok || !d?.success) throw new Error(d?.error || t('errors.codeInvalid'))
      setEmailVerified(true)
      setError(null)
    } catch (e: any) {
      setError(e?.message || t('errors.codeInvalid'))
    }
  }

  const validateForm = () => {
    const errors: Record<string, string> = {}

    if (!formData.stageName.trim()) {
      errors.stageName = t('errors.stageNameRequired')
    }

    if (!formData.email.trim()) {
      errors.email = t('errors.emailRequired')
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = t('errors.emailInvalid')
    }

    if (!emailVerified) {
      errors.email = t('errors.emailNotVerified')
    }

    if (!formData.password) {
      errors.password = t('errors.passwordRequired')
    } else if (formData.password.length < 8) {
      errors.password = t('errors.passwordTooShort')
    }

    if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = t('errors.passwordMismatch')
    }

    if (!formData.phone.trim()) {
      errors.phone = t('errors.phoneRequired')
    } else {
      const normalized = normalizeSwissPhone(formData.phone)
      if (!normalized) {
        errors.phone = t('errors.phoneInvalid')
      }
    }

    if (!formData.dateOfBirth) {
      errors.dateOfBirth = t('errors.dateOfBirthRequired')
    } else {
      const birthDate = new Date(formData.dateOfBirth)
      const age = (new Date().getTime() - birthDate.getTime()) / (1000 * 60 * 60 * 24 * 365.25)
      if (age < 18) {
        errors.dateOfBirth = t('errors.mustBe18')
      }
    }

    if (!formData.isAdult) {
      errors.isAdult = t('errors.confirmAdult')
    }

    if (!formData.acceptTos) {
      errors.acceptTos = t('errors.acceptTosRequired')
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
      const normalizedPhone = normalizeSwissPhone(formData.phone)

      const payload = {
        stageName: formData.stageName,
        email: formData.email,
        password: formData.password,
        confirm: formData.confirmPassword,
        phoneE164: normalizedPhone,
        dateOfBirth: formData.dateOfBirth,
        isAdult: formData.isAdult,
        acceptTos: formData.acceptTos,
        emailVerified: true
      }

      const res = await fetch('/api/signup-v2/escort', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      const data = await res.json()

      if (data?.ok) {
        // Sauvegarder userId pour le flux de signup
        if (data.userId) {
          try {
            localStorage.setItem('felora-signup-userId', data.userId)
          } catch (e) {
            console.error('Error saving userId:', e)
          }
        }

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

        // Rediriger vers le flux de paiement et KYC
        router.push('/profile-test-signup/escort?step=3')
      } else {
        setError(data?.error || t('errors.accountCreationError'))
      }
    } catch (err: any) {
      setError(err?.message || t('errors.accountCreationError'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative min-h-screen bg-black text-white overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-pink-900/10 via-black to-black" />
      <div className="absolute inset-0 bg-grid-white/[0.02]" />

      {/* Animated gradient orbs */}
      <div className="absolute top-1/4 -left-48 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl animate-pulse" />
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
          <span className="text-sm">{t('back')}</span>
        </motion.button>

        {/* Header */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="mb-6"
          >
            <div className="inline-flex p-4 rounded-2xl bg-gradient-to-br from-pink-500/20 via-purple-500/15 to-violet-600/20 border border-pink-500/30 shadow-lg shadow-pink-500/10">
              <Crown className="w-10 h-10 text-pink-300" strokeWidth={2} />
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

                {/* Pseudo */}
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">
                    {t('form.stageName')} <span className="text-red-400">{t('form.required')}</span>
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                    <input
                      type="text"
                      value={formData.stageName}
                      onChange={(e) => updateField('stageName', e.target.value)}
                      required
                      className={`w-full pl-11 pr-4 py-3 bg-white/5 border ${
                        fieldErrors.stageName ? 'border-red-500/50' : 'border-white/10'
                      } rounded-xl text-white placeholder:text-white/30 focus:outline-none focus:border-pink-500/50 transition-colors`}
                      placeholder={t('form.stageNamePlaceholder')}
                    />
                  </div>
                  {fieldErrors.stageName && (
                    <p className="mt-1 text-xs text-red-400">{fieldErrors.stageName}</p>
                  )}
                </div>

                {/* Email avec vérification */}
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
                      disabled={emailVerified}
                      className={`w-full pl-11 pr-4 py-3 bg-white/5 border ${
                        fieldErrors.email ? 'border-red-500/50' : emailVerified ? 'border-green-500/50' : 'border-white/10'
                      } rounded-xl text-white placeholder:text-white/30 focus:outline-none focus:border-pink-500/50 transition-colors disabled:opacity-50`}
                      placeholder={t('form.emailPlaceholder')}
                    />
                    {emailVerified && (
                      <CheckCircle className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-green-400" />
                    )}
                  </div>
                  {fieldErrors.email && (
                    <p className="mt-1 text-xs text-red-400">{fieldErrors.email}</p>
                  )}

                  {/* Email verification UI */}
                  {!emailVerified && formData.email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email) && (
                    <div className="mt-3 space-y-2">
                      {!emailSent ? (
                        <button
                          type="button"
                          onClick={sendVerificationEmail}
                          disabled={emailSending || cooldownSec > 0}
                          className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white/80 hover:bg-white/10 transition-colors text-sm disabled:opacity-50"
                        >
                          {emailSending ? t('emailVerification.sending') : cooldownSec > 0 ? t('emailVerification.resend', { seconds: cooldownSec }) : t('emailVerification.sendCode')}
                        </button>
                      ) : (
                        <div className="space-y-2">
                          <p className="text-xs text-white/60">{t('emailVerification.codeSent')}</p>
                          <div className="flex gap-2">
                            <input
                              type="text"
                              value={emailCode}
                              onChange={(e) => setEmailCode(e.target.value)}
                              placeholder={t('emailVerification.codePlaceholder')}
                              className="flex-1 px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-white/30 focus:outline-none focus:border-pink-500/50"
                            />
                            <button
                              type="button"
                              onClick={verifyEmailCode}
                              className="px-4 py-2 rounded-lg bg-gradient-to-r from-pink-500/20 to-purple-500/20 hover:from-pink-500/30 hover:to-purple-500/30 border border-pink-500/30 text-white text-sm font-medium transition-all"
                            >
                              {t('emailVerification.verify')}
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">
                    {t('form.phone')} <span className="text-red-400">{t('form.required')}</span>
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => updateField('phone', e.target.value)}
                      required
                      className={`w-full pl-11 pr-4 py-3 bg-white/5 border ${
                        fieldErrors.phone ? 'border-red-500/50' : 'border-white/10'
                      } rounded-xl text-white placeholder:text-white/30 focus:outline-none focus:border-pink-500/50 transition-colors`}
                      placeholder={t('form.phonePlaceholder')}
                    />
                  </div>
                  {fieldErrors.phone && (
                    <p className="mt-1 text-xs text-red-400">{fieldErrors.phone}</p>
                  )}
                </div>

                {/* Date of Birth */}
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">
                    {t('form.dateOfBirth')} <span className="text-red-400">{t('form.required')}</span>
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                    <input
                      type="date"
                      value={formData.dateOfBirth}
                      onChange={(e) => updateField('dateOfBirth', e.target.value)}
                      required
                      max={new Date(new Date().setFullYear(new Date().getFullYear() - 18)).toISOString().split('T')[0]}
                      className={`w-full pl-11 pr-4 py-3 bg-white/5 border ${
                        fieldErrors.dateOfBirth ? 'border-red-500/50' : 'border-white/10'
                      } rounded-xl text-white placeholder:text-white/30 focus:outline-none focus:border-pink-500/50 transition-colors`}
                    />
                  </div>
                  {fieldErrors.dateOfBirth && (
                    <p className="mt-1 text-xs text-red-400">{fieldErrors.dateOfBirth}</p>
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
                      className={`w-full pl-11 pr-12 py-3 bg-white/5 border ${
                        fieldErrors.password ? 'border-red-500/50' : 'border-white/10'
                      } rounded-xl text-white placeholder:text-white/30 focus:outline-none focus:border-pink-500/50 transition-colors`}
                      placeholder={t('form.passwordPlaceholder')}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/60"
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
                      } rounded-xl text-white placeholder:text-white/30 focus:outline-none focus:border-pink-500/50 transition-colors`}
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
                      } peer-checked:bg-gradient-to-r peer-checked:from-pink-500 peer-checked:to-purple-500 peer-checked:border-transparent transition-all`}>
                        {formData.isAdult && (
                          <CheckCircle className="w-full h-full text-white p-0.5" />
                        )}
                      </div>
                    </div>
                    <span className="text-sm text-white/70 group-hover:text-white/90 transition-colors">
                      {t('form.isAdult')} <span className="text-red-400">{t('form.required')}</span>
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
                      } peer-checked:bg-gradient-to-r peer-checked:from-pink-500 peer-checked:to-purple-500 peer-checked:border-transparent transition-all`}>
                        {formData.acceptTos && (
                          <CheckCircle className="w-full h-full text-white p-0.5" />
                        )}
                      </div>
                    </div>
                    <span className="text-sm text-white/70 group-hover:text-white/90 transition-colors">
                      {t('form.acceptTos')}{' '}
                      <a href="/legal/cgu" target="_blank" className="text-pink-400 hover:text-pink-300 underline">
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
                  className="w-full flex items-center justify-center gap-2 px-6 py-4 rounded-xl bg-gradient-to-r from-pink-500/20 to-purple-500/20 hover:from-pink-500/30 hover:to-purple-500/30 border border-pink-500/30 hover:border-pink-500/50 text-white font-semibold shadow-lg hover:shadow-pink-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-6"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      {t('buttons.creating')}
                    </>
                  ) : (
                    <>
                      {t('buttons.createAccount')}
                      <Crown className="w-5 h-5" />
                    </>
                  )}
                </button>

                {/* Login Link */}
                <div className="text-center text-sm text-white/40 pt-2">
                  {t('buttons.alreadyHaveAccount')}{' '}
                  <button
                    type="button"
                    onClick={() => router.push('/login')}
                    className="text-pink-400 hover:text-pink-300 font-semibold underline underline-offset-4 transition-colors"
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

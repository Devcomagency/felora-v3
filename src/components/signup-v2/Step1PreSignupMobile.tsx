"use client"
import { useState, useEffect } from 'react'
import { Shield, Zap, Mail, Lock, User, Phone, CheckCircle, AlertCircle } from 'lucide-react'
import { z } from 'zod'
import { escortPreSignupLite, clientSignupSchema, clubPreSignupSchema } from './validation'

type Mode = 'ESCORT'|'CLIENT'|'CLUB'

export default function Step1PreSignupMobile({ mode = 'ESCORT', onSubmit }:{ mode?:Mode; onSubmit:(data:any)=>Promise<void>|void }){
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string|null>(null)
  const [form, setForm] = useState<any>({ isAdult:false, acceptTos:false, emailVerified:false })
  const [captchaOK, setCaptchaOK] = useState(false)
  const [emailSending, setEmailSending] = useState(false)
  const [emailSent, setEmailSent] = useState(false)
  const [emailCode, setEmailCode] = useState('')
  const [cooldownSec, setCooldownSec] = useState(0)
  const [devHint, setDevHint] = useState<string>('')
  const [info, setInfo] = useState<string>('')
  const [fieldErrors, setFieldErrors] = useState<Record<string,string>>({})
  const [currentStep, setCurrentStep] = useState(0)

  const schema = mode === 'ESCORT' ? escortPreSignupLite : mode === 'CLIENT' ? clientSignupSchema : clubPreSignupSchema

  const update = (k:string, v:any) => setForm((f:any)=>({ ...f, [k]: v }))

  function normalizeSwissPhone(input?: string): string | null {
    if (!input) return null
    const trimmed = (input || '').trim()
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

  const submit = async () => {
    console.log('🎯 Step1PreSignupMobile submit() called')
    setLoading(true)
    setError(null)
    setFieldErrors({})
    try {
      console.log('📋 Validating form:', form)
      
      // Normalize phone number before validation (always provide a string for phoneE164)
      const formData: any = { ...form }
      if (mode !== 'CLIENT') {
        const normalizedPhone = normalizeSwissPhone((form as any).phoneE164 || form.phone)
        formData.phoneE164 = normalizedPhone || ''
        if (normalizedPhone) {
          console.log('📞 Phone normalized:', form.phone, '→', normalizedPhone)
        } else {
          console.log('❌ Phone normalization failed for:', form.phone)
        }
      }
      
      const checks = schema.safeParse(formData)
      if (!checks.success) {
        console.log('❌ Validation failed:', checks.error)
        const errors: Record<string,string> = {}
        if (checks.error?.issues) {
          checks.error.issues.forEach((e: any) => {
            if (e.path?.[0]) errors[e.path[0] as string] = e.message
          })
        }
        setFieldErrors(errors)
        setLoading(false)
        return
      }
      console.log('✅ Validation passed, calling onSubmit with:', checks.data)
      await onSubmit(checks.data)
      console.log('✅ onSubmit completed successfully')
    } catch (e:any) { 
      console.error('💥 Submit error:', e)
      setError(e.message); 
      setLoading(false) 
    }
  }

  const sendVerificationEmail = async () => {
    if (!form.email) return
    setEmailSending(true)
    setError(null)
    try {
      const res = await fetch('/api/auth/send-verification', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ email: form.email }) })
      const d = await res.json()
      if (!res.ok || !d?.success) throw new Error(d?.error || 'send_failed')
      setEmailSent(true)
      setCooldownSec(60)
      const interval = setInterval(() => {
        setCooldownSec(prev => {
          if (prev <= 1) { clearInterval(interval); return 0 }
          return prev - 1
        })
      }, 1000)
    } catch (e:any) { setError(e?.message || 'Erreur envoi email') }
    finally { setEmailSending(false) }
  }

  const steps = [
    { id: 'email', title: 'Email', icon: Mail },
    { id: 'phone', title: 'Téléphone', icon: Phone },
    { id: 'password', title: 'Mot de passe', icon: Lock },
    { id: 'terms', title: 'Conditions', icon: Shield }
  ]

  const nextStep = () => {
    console.log('🔘 nextStep called, currentStep:', currentStep, 'steps.length:', steps.length)
    if (currentStep < steps.length - 1) {
      console.log('➡️ Moving to next step:', currentStep + 1)
      setCurrentStep(currentStep + 1)
    } else {
      console.log('🏁 Final step reached, calling submit()')
      submit()
    }
  }

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header mobile-first */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-3">
          <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center">
            <Shield className="text-white" size={32} />
          </div>
        </div>
        <div>
          <h2 className="text-white text-2xl sm:text-3xl font-bold mb-2">
            {mode === 'ESCORT' ? 'Créer votre compte Escort' : mode === 'CLIENT' ? 'Créer votre compte Client' : 'Créer votre compte Club'}
          </h2>
          <p className="text-white/70 text-base sm:text-lg max-w-md mx-auto leading-relaxed">
            {mode === 'ESCORT' ? 'Rejoignez la communauté et commencez à gagner' : mode === 'CLIENT' ? 'Découvrez et rencontrez des escorts de qualité' : 'Gérez votre établissement et vos escorts'}
          </p>
        </div>
      </div>

      {/* Progress indicator */}
      <div className="flex items-center justify-center space-x-2 mb-8">
        {steps.map((step, index) => {
          const Icon = step.icon
          const isActive = index === currentStep
          const isCompleted = index < currentStep
          
          return (
            <div key={step.id} className="flex items-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                isCompleted ? 'bg-green-500' : isActive ? 'bg-purple-500' : 'bg-white/20'
              }`}>
                <Icon size={20} className={`${isCompleted || isActive ? 'text-white' : 'text-white/60'}`} />
              </div>
              {index < steps.length - 1 && (
                <div className={`w-8 h-0.5 mx-2 ${isCompleted ? 'bg-green-500' : 'bg-white/20'}`} />
              )}
            </div>
          )
        })}
      </div>

      {/* Step content */}
      <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
        {/* Step 0: Email */}
        {currentStep === 0 && (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-white text-xl font-semibold mb-2">Votre adresse email</h3>
              <p className="text-white/70 text-sm">Nous vous enverrons un code de vérification</p>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-white/80 text-sm font-medium mb-2">Email</label>
                <div className="relative">
                  <input 
                    className={`w-full bg-white/10 border rounded-xl px-4 py-4 text-white placeholder-white/50 text-base ${
                      fieldErrors.email ? 'border-red-500/60' : 'border-white/20'
                    }`}
                    placeholder="votre@email.com"
                    type="email"
                    value={form.email || ''}
                    onChange={e => { update('email', e.target.value); setFieldErrors(prev => ({ ...prev, email: '' })) }}
                  />
                  <Mail className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white/40" size={20} />
                </div>
                {fieldErrors.email && <p className="text-red-400 text-sm mt-1">{fieldErrors.email}</p>}
              </div>

              {form.email && !form.emailVerified && (
                <div className="space-y-3">
                  <button
                    onClick={sendVerificationEmail}
                    disabled={emailSending || cooldownSec > 0}
                    className="w-full py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-medium disabled:opacity-60 flex items-center justify-center gap-2"
                  >
                    {emailSending ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Envoi...
                      </>
                    ) : (
                      <>
                        <Mail size={16} />
                        {emailSent ? 'Renvoyer le code' : 'Envoyer le code'}
                      </>
                    )}
                  </button>
                  
                  {emailSent && (
                    <div className="space-y-3">
                      <div className="relative">
                        <input
                          className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-4 text-white placeholder-white/50 text-base"
                          placeholder="Code de vérification"
                          value={emailCode}
                          onChange={e => setEmailCode(e.target.value)}
                        />
                        <CheckCircle className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white/40" size={20} />
                      </div>
                      
                      <button
                        onClick={async () => {
                          setError(null)
                          try {
                            const res = await fetch('/api/auth/verify-email', { 
                              method: 'POST', 
                              headers: { 'Content-Type': 'application/json' }, 
                              body: JSON.stringify({ email: form.email, code: emailCode }) 
                            })
                            const d = await res.json()
                            if (!res.ok || !d?.success) throw new Error(d?.error || 'code_invalid')
                            update('emailVerified', true)
                          } catch (e: any) { setError(e?.message || 'Code invalide') }
                        }}
                        disabled={!emailCode || form.emailVerified}
                        className="w-full py-3 bg-green-500 text-white rounded-xl font-medium disabled:opacity-60 flex items-center justify-center gap-2"
                      >
                        <CheckCircle size={16} />
                        Vérifier l'email
                      </button>
                    </div>
                  )}
                </div>
              )}

              {form.emailVerified && (
                <div className="flex items-center gap-2 p-3 bg-green-500/20 border border-green-500/30 rounded-xl">
                  <CheckCircle className="text-green-400" size={20} />
                  <span className="text-green-400 text-sm font-medium">Email vérifié avec succès</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Step 1: Phone */}
        {currentStep === 1 && (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-white text-xl font-semibold mb-2">Votre numéro de téléphone</h3>
              <p className="text-white/70 text-sm">Pour la sécurité et la vérification</p>
            </div>
            
            <div>
              <label className="block text-white/80 text-sm font-medium mb-2">Téléphone</label>
              <div className="relative">
                <input 
                  className={`w-full bg-white/10 border rounded-xl px-4 py-4 text-white placeholder-white/50 text-base ${
                    fieldErrors.phone ? 'border-red-500/60' : 'border-white/20'
                  }`}
                  placeholder="079 123 45 67 ou +41 79 123 45 67"
                  type="tel"
                  value={form.phone || ''}
                  onChange={e => {
                    // Conserver la saisie utilisateur telle quelle; normaliser seulement au submit
                    update('phone', e.target.value)
                    setFieldErrors(prev => ({ ...prev, phone: '' }))
                  }}
                />
                <Phone className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white/40" size={20} />
              </div>
              {fieldErrors.phone && <p className="text-red-400 text-sm mt-1">{fieldErrors.phone}</p>}
            </div>
          </div>
        )}

        {/* Step 2: Password */}
        {currentStep === 2 && (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-white text-xl font-semibold mb-2">Créez votre mot de passe</h3>
              <p className="text-white/70 text-sm">Choisissez un mot de passe sécurisé</p>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-white/80 text-sm font-medium mb-2">Mot de passe</label>
                <div className="relative">
                  <input 
                    className={`w-full bg-white/10 border rounded-xl px-4 py-4 text-white placeholder-white/50 text-base ${
                      fieldErrors.password ? 'border-red-500/60' : 'border-white/20'
                    }`}
                    placeholder="••••••••"
                    type="password"
                    value={form.password || ''}
                    onChange={e => { update('password', e.target.value); setFieldErrors(prev => ({ ...prev, password: '' })) }}
                  />
                  <Lock className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white/40" size={20} />
                </div>
                {fieldErrors.password && <p className="text-red-400 text-sm mt-1">{fieldErrors.password}</p>}
              </div>

              <div>
                <label className="block text-white/80 text-sm font-medium mb-2">Confirmer le mot de passe</label>
                <div className="relative">
                  <input 
                    className={`w-full bg-white/10 border rounded-xl px-4 py-4 text-white placeholder-white/50 text-base ${
                      fieldErrors.confirm ? 'border-red-500/60' : 'border-white/20'
                    }`}
                    placeholder="••••••••"
                    type="password"
                    value={form.confirm || ''}
                    onChange={e => { update('confirm', e.target.value); setFieldErrors(prev => ({ ...prev, confirm: '' })) }}
                  />
                  <Lock className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white/40" size={20} />
                </div>
                {fieldErrors.confirm && <p className="text-red-400 text-sm mt-1">{fieldErrors.confirm}</p>}
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Terms */}
        {currentStep === 3 && (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-white text-xl font-semibold mb-2">Conditions d'utilisation</h3>
              <p className="text-white/70 text-sm">Dernière étape avant la création de votre compte</p>
            </div>
            
            <div className="space-y-4">
              <label className="flex items-start gap-3 p-4 bg-white/5 rounded-xl border border-white/10">
                <input 
                  type="checkbox" 
                  checked={form.isAdult}
                  onChange={e => { update('isAdult', e.target.checked); setFieldErrors(prev => ({ ...prev, isAdult: '' })) }}
                  className="mt-1 w-5 h-5 text-purple-500 bg-white/10 border-white/20 rounded focus:ring-purple-500"
                />
                <div>
                  <span className="text-white font-medium text-sm">J'ai 18 ans ou plus</span>
                  <p className="text-white/60 text-xs mt-1">Je certifie être majeur(e) selon la législation suisse</p>
                </div>
              </label>
              {fieldErrors.isAdult && <p className="text-red-400 text-sm">{fieldErrors.isAdult}</p>}

              <label className="flex items-start gap-3 p-4 bg-white/5 rounded-xl border border-white/10">
                <input 
                  type="checkbox" 
                  checked={form.acceptTos}
                  onChange={e => { update('acceptTos', e.target.checked); setFieldErrors(prev => ({ ...prev, acceptTos: '' })) }}
                  className="mt-1 w-5 h-5 text-purple-500 bg-white/10 border-white/20 rounded focus:ring-purple-500"
                />
                <div>
                  <span className="text-white font-medium text-sm">J'accepte les conditions</span>
                  <p className="text-white/60 text-xs mt-1">CGU et Politique de confidentialité</p>
                </div>
              </label>
              {fieldErrors.acceptTos && <p className="text-red-400 text-sm">{fieldErrors.acceptTos}</p>}

              {process.env.NEXT_PUBLIC_CAPTCHA_DISABLED !== 'true' && (
                <label className="flex items-start gap-3 p-4 bg-white/5 rounded-xl border border-white/10">
                  <input 
                    type="checkbox" 
                    checked={captchaOK}
                    onChange={e => setCaptchaOK(e.target.checked)}
                    className="mt-1 w-5 h-5 text-purple-500 bg-white/10 border-white/20 rounded focus:ring-purple-500"
                  />
                  <div>
                    <span className="text-white font-medium text-sm">Je ne suis pas un robot</span>
                    <p className="text-white/60 text-xs mt-1">Vérification de sécurité</p>
                  </div>
                </label>
              )}
            </div>
          </div>
        )}

        {/* Error message */}
        {error && (
          <div className="flex items-center gap-2 p-3 bg-red-500/20 border border-red-500/30 rounded-xl">
            <AlertCircle className="text-red-400" size={20} />
            <span className="text-red-400 text-sm">{error}</span>
          </div>
        )}

        {/* Navigation buttons */}
        <div className="flex gap-3 pt-4">
          {currentStep > 0 && (
            <button
              onClick={prevStep}
              className="flex-1 py-3 bg-white/10 text-white rounded-xl font-medium hover:bg-white/20 transition-colors"
            >
              Précédent
            </button>
          )}
          
          <button
            onClick={nextStep}
            disabled={loading}
            className="flex-1 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-medium disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Création...
              </>
            ) : currentStep === steps.length - 1 ? (
              <>
                <Shield size={16} />
                {mode === 'CLIENT' ? 'Activer mon compte' : 'Choisir mon offre'}
              </>
            ) : (
              'Suivant'
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

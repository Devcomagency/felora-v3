"use client"
import { Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'
import Stepper from '@/components/signup-v2/Stepper'
import Step1PreSignup from '@/components/signup-v2/Step1PreSignup'
import Step1PreSignupMobile from '@/components/signup-v2/Step1PreSignupMobile'
import Step2Plan from '@/components/signup-v2/Step2Plan'
import Step2PlanMobile from '@/components/signup-v2/Step2PlanMobile'
import Step3KYC from '@/components/signup-v2/Step3KYC'
import Step3KYCMobile from '@/components/signup-v2/Step3KYCMobile'

function EscortSignupContent(){
  const sp = useSearchParams()
  const router = useRouter()
  const [userId, setUserId] = useState<string>('')
  const stepParam = Number(sp.get('step') || '1')
  const [step, setStep] = useState<number>(stepParam)
  const [routing, setRouting] = useState(false)
  const steps = useMemo(()=>[
    { id:1, label:'Pré‑inscription' },
    { id:2, label:'Offre' },
    { id:3, label:'KYC' },
  ],[])

  // Restore userId from localStorage if page reloaded or opened directly on step 2/3
  useEffect(() => {
    try {
      if (!userId) {
        const saved = localStorage.getItem('felora-signup-userId') || ''
        console.log('Restoring userId from localStorage:', saved)
        if (saved) setUserId(saved)
      }
    } catch (e) {
      console.error('Error restoring userId from localStorage:', e)
    }
  }, [userId])

  // Keep step in sync with URL (if user navigates directly to ?step=2/3)
  useEffect(() => {
    if (step !== stepParam) setStep(stepParam)
  }, [stepParam])

  return (
    <main className="relative min-h-screen bg-black text-white overflow-hidden">
      {/* Background Effects - same as register page */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-pink-900/10 via-black to-black" />
      <div className="absolute inset-0 bg-grid-white/[0.02]" />
      <div className="absolute top-1/4 -left-48 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-1/4 -right-48 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-700" />

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 py-8">
      {step === 1 && !routing && (
        <div className="max-w-2xl mx-auto">
        <Step1PreSignupMobile mode="ESCORT" onSubmit={async (data)=>{
          console.log('🚀 Step1PreSignupMobile onSubmit called with data:', data)
          try {
            console.log('📡 Setting routing to true...')
            setRouting(true)
            console.log('📡 Calling /api/signup-v2/escort...')
            const r = await fetch('/api/signup-v2/escort', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(data) })
            console.log('📡 Response status:', r.status)
            const d = await r.json()
            console.log('📡 Response data:', d)
            if (d?.ok) { 
              console.log('✅ Account created successfully, userId:', d.userId)
              setUserId(d.userId)
              try { localStorage.setItem('felora-signup-userId', d.userId) } catch {}
              setStep(2)
              router.push('/profile-test-signup/escort?step=2')
            } else {
              console.error('❌ Account creation failed:', d?.error)
              throw new Error(d?.error || 'Erreur lors de la création du compte')
            }
          } catch (e:any) {
            console.error('💥 Signup error:', e)
            alert(e?.message || 'Erreur lors de la création du compte')
          } finally {
            console.log('🏁 Setting routing to false...')
            setRouting(false)
          }
        }} />
        </div>
      )}

      {routing && (
        <div className="max-w-2xl mx-auto">
          <div className="glass-card rounded-2xl p-8 border border-white/10 bg-white/5 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mx-auto mb-4"></div>
            <p className="text-white/80">Création de votre compte...</p>
          </div>
        </div>
      )}

      {step === 2 && (
        <Step2PlanMobile onSelect={(plan)=>{
          console.log('Plan selected:', plan)
          setStep(3);
          router.push('/profile-test-signup/escort?step=3')
        }} />
      )}

      {step === 3 && (
        <div className="max-w-2xl mx-auto">
          <Step3KYCMobile userId={userId} role="ESCORT" onSubmitted={(ok)=>{
            try { if (ok) localStorage.removeItem('felora-signup-userId') } catch {}
            if (ok) {
              router.push('/dashboard-escort/statistiques?welcome=1')
            } else {
              // Vérifier plus tard: amener au dashboard escort minimal
              router.push('/dashboard-escort/profil?kyc=deferred')
            }
          }} />
        </div>
      )}
      </div>
    </main>
  )
}

export default function EscortSignupPage(){
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
      </div>
    }>
      <EscortSignupContent />
    </Suspense>
  )
}

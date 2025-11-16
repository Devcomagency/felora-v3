"use client"
import { Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'
import { useTranslations } from 'next-intl'
import Stepper from '@/components/signup-v2/Stepper'
import Step1PreSignup from '@/components/signup-v2/Step1PreSignup'
import Step1PreSignupMobile from '@/components/signup-v2/Step1PreSignupMobile'
import Step2Plan from '@/components/signup-v2/Step2Plan'
import Step2PlanMobile from '@/components/signup-v2/Step2PlanMobile'
import Step3KYC from '@/components/signup-v2/Step3KYC'
import Step3KYCMobile from '@/components/signup-v2/Step3KYCMobile'

function EscortSignupContent(){
  const t = useTranslations('signup.escort')
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

  // Restore userId from localStorage OR fetch from session if user is logged in
  useEffect(() => {
    const fetchUserId = async () => {
      try {
        if (userId) return // Already have userId

        // First, try localStorage (for signup flow)
        const saved = localStorage.getItem('felora-signup-userId') || ''
        if (saved) {
          console.log('Restoring userId from localStorage:', saved)
          setUserId(saved)
          return
        }

        // If no localStorage, try to get from session (for logged-in users clicking notification link)
        console.log('No localStorage userId, trying to fetch from session...')
        const res = await fetch('/api/auth/session')
        const session = await res.json()

        if (session?.user?.id) {
          console.log('Got userId from session:', session.user.id)
          setUserId(session.user.id)
        } else {
          console.log('No session found, user needs to sign up first')
        }
      } catch (e) {
        console.error('Error fetching userId:', e)
      }
    }

    fetchUserId()
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
              throw new Error(d?.error || t('page.errorAccount'))
            }
          } catch (e:any) {
            console.error('💥 Signup error:', e)
            alert(e?.message || t('page.errorAccount'))
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
            <p className="text-white/80">{t('page.loadingAccount')}</p>
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
          <Step3KYCMobile userId={userId} role="ESCORT" onSubmitted={async (ok)=>{
            try { if (ok) localStorage.removeItem('felora-signup-userId') } catch {}
            if (ok) {
              // Récupérer l'ID du profil escort pour rediriger vers le profil public
              try {
                const res = await fetch('/api/me/escort-profile')
                const data = await res.json()
                if (data.success && data.profile?.id) {
                  router.push(`/profile/${data.profile.id}?kycSuccess=1`)
                } else {
                  // Fallback vers le dashboard si pas de profil
                  router.push('/dashboard-escort/statistiques?welcome=1')
                }
              } catch (error) {
                console.error('Error fetching profile:', error)
                router.push('/dashboard-escort/statistiques?welcome=1')
              }
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

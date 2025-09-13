"use client"
import { Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'
import Stepper from '@/components/signup-v2/Stepper'
import Step1PreSignup from '@/components/signup-v2/Step1PreSignup'
import Step2Plan from '@/components/signup-v2/Step2Plan'
import Step3KYC from '@/components/signup-v2/Step3KYC'

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
        if (saved) setUserId(saved)
      }
    } catch {}
  }, [userId])

  // Keep step in sync with URL (if user navigates directly to ?step=2/3)
  useEffect(() => {
    if (step !== stepParam) setStep(stepParam)
  }, [stepParam])

  return (
    <main className="max-w-2xl mx-auto p-4">
      <h1 className="text-white text-2xl font-bold mb-2">Inscription Escort</h1>
      <Stepper steps={steps} current={step} />

      {step === 1 && (
        <Step1PreSignup mode="ESCORT" onSubmit={async (data)=>{
          const r = await fetch('/api/signup-v2/escort', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(data) })
          const d = await r.json(); if (d?.ok) { setUserId(d.userId); try { localStorage.setItem('felora-signup-userId', d.userId) } catch {}; setStep(2); router.push('/register/indepandante?step=2') } else alert(d?.error || 'Erreur')
        }} />
      )}

      {step === 2 && (
        <div className="space-y-4">
          <Step2Plan onSelect={(plan)=>{ setStep(3); router.push('/register/indepandante?step=3') }} />
        </div>
      )}

      {step === 3 && (
        <div className="space-y-4">
          <Step3KYC userId={userId} onSubmitted={(ok)=>{ 
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

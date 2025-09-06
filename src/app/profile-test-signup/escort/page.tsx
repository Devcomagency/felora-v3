"use client"
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useMemo, useState, Suspense } from 'react'
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
          <Step2Plan onSelect={async (plan)=>{
            try { localStorage.setItem('felora-signup-plan', plan.code) } catch {}
            setRouting(true)
            router.push('/certification')
          }} />
          <div className="flex items-center gap-2 text-sm">
            <span className="text-white/60">Paiement mock (intégration à brancher plus tard).</span>
            {routing && (<span className="text-pink-300">Redirection…</span>)}
          </div>
        </div>
      )}

      {step === 3 && userId && (
        <Step3KYC userId={userId} role="ESCORT" onSubmitted={(ok)=>{ if(ok) router.push('/admin-test/kyc') }} />
      )}
    </main>
  )
}

export default function EscortSignupPage() {
  return (
    <Suspense fallback={<div className="max-w-2xl mx-auto p-4"><div className="text-white">Loading...</div></div>}>
      <EscortSignupContent />
    </Suspense>
  )
}

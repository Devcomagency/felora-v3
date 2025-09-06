"use client"
import Step1PreSignup from '@/components/signup-v2/Step1PreSignup'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'

export default function ClientSignupPage(){
  const router = useRouter()
  return (
    <main className="max-w-xl mx-auto p-4">
      <h1 className="text-white text-2xl font-bold mb-4">Inscription Client</h1>
      <Step1PreSignup mode="CLIENT" onSubmit={async (data)=>{
        const r = await fetch('/api/signup-v2/client', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(data) })
        const d = await r.json();
        if (d?.ok) {
          // Auto login puis redirection accueil avec message
          try {
            await signIn('credentials', { email: data.email, password: data.password, redirect: false })
          } catch {}
          const msg = encodeURIComponent('Compte client créé')
          router.push(`/?message=${msg}`)
        } else {
          alert(d?.error || 'Erreur')
        }
      }} />
    </main>
  )
}

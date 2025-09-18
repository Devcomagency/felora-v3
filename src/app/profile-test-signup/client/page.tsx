"use client"
import { useRouter } from 'next/navigation'
import { signIn } from 'next-auth/react'
import Step1PreSignupMobile from '@/components/signup-v2/Step1PreSignupMobile'

export default function ClientSignupPage(){
  const router = useRouter()
  
  return (
    <main className="min-h-screen bg-black">
      {/* Header mobile-first */}
      <div className="sticky top-0 z-10 bg-black/20 backdrop-blur-sm border-b border-white/10">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-white text-xl sm:text-2xl font-bold">Inscription Client</h1>
              <p className="text-white/60 text-sm">Rejoignez la communauté Felora</p>
            </div>
            <div className="text-right ml-16">
              <div className="text-white/80 text-sm">Étape 1/1</div>
              <div className="w-16 h-1 bg-white/20 rounded-full mt-1">
                <div 
                  className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all duration-300"
                  style={{ width: '100%' }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-2xl mx-auto px-4 py-6">
        <Step1PreSignupMobile 
          mode="CLIENT" 
          onSubmit={async (data)=>{
            console.log('🚀 Client signup with data:', data)
            try {
              const r = await fetch('/api/signup-v2/client', { 
                method:'POST', 
                headers:{'Content-Type':'application/json'}, 
                body: JSON.stringify(data) 
              })
              const d = await r.json()
              
              if (d?.ok) {
                console.log('✅ Client account created successfully')
                // Auto login puis redirection accueil avec message
                try {
                  await signIn('credentials', { 
                    email: data.email, 
                    password: data.password, 
                    redirect: false 
                  })
                } catch (e) {
                  console.log('Login failed, but account created:', e)
                }
                const msg = encodeURIComponent('Compte client créé avec succès')
                router.push(`/?message=${msg}`)
              } else {
                console.error('❌ Client account creation failed:', d?.error)
                throw new Error(d?.error || 'Erreur lors de la création du compte')
              }
            } catch (e: any) {
              console.error('💥 Client signup error:', e)
              alert(e?.message || 'Erreur lors de la création du compte')
            }
          }} 
        />
      </div>
    </main>
  )
}
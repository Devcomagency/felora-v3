"use client"
import React from 'react'
import { useRouter, usePathname } from 'next/navigation'

export default function FooterLegal(){
  const router = useRouter()
  const pathname = usePathname()

  console.log('🔍 FooterLegal - pathname:', pathname)

  // Ne pas afficher le footer dans les pages admin
  if (pathname?.startsWith('/admin')) {
    console.log('✅ Footer masqué - page admin détectée')
    return null
  }

  console.log('⚠️ Footer affiché - pas une page admin')

  return (
    <footer className="w-full py-6 border-t border-white/10 bg-black/60 backdrop-blur">
      <div className="max-w-6xl mx-auto px-4 flex items-center justify-between text-xs text-white/70">
        <div>
          © {new Date().getFullYear()} Felora — Tous droits réservés
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => router.push('/legal/privacy')} className="hover:text-white underline">Confidentialité</button>
          <span className="text-white/30">•</span>
          <button onClick={() => router.push('/legal/terms')} className="hover:text-white underline">Conditions</button>
          <span className="text-white/30">•</span>
          <button onClick={() => router.push('/legal/cookies')} className="hover:text-white underline">Cookies</button>
        </div>
      </div>
    </footer>
  )
}


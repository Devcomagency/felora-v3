'use client'

import React, { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
// import { useSession } from 'next-auth/react' // Désactivé temporairement

interface AppGatewayProps {
  children: React.ReactNode
}

const SplashScreen = () => (
  <div className="fixed inset-0 bg-black flex items-center justify-center z-50">
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 1.2, opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="text-center"
    >
      <div className="w-24 h-24 mx-auto mb-6">
        <div className="w-full h-full rounded-full bg-gradient-to-br from-[#FF6B9D] via-[#B794F6] to-[#4FD1C7] p-1">
          <div className="w-full h-full rounded-full bg-black flex items-center justify-center">
            <span className="text-white text-3xl font-bold">F</span>
          </div>
        </div>
      </div>
      <h1 className="text-white text-2xl font-bold mb-2">FELORA</h1>
      <p className="text-white/60 text-sm">Plateforme Premium</p>
      
      {/* Loader animé */}
      <div className="mt-8 flex justify-center">
        <div className="flex gap-1">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.3, 1, 0.3]
              }}
              transition={{
                duration: 0.8,
                repeat: Infinity,
                delay: i * 0.2
              }}
              className="w-2 h-2 rounded-full bg-white/40"
            />
          ))}
        </div>
      </div>
    </motion.div>
  </div>
)

const PageTransition = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname()

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={pathname}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{
          duration: 0.3,
          ease: [0.22, 1, 0.36, 1]
        }}
        className="min-h-screen"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  )
}

export default function AppGateway({ children }: AppGatewayProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [isFirstLoad, setIsFirstLoad] = useState(true)
  // const { status } = useSession() // Désactivé temporairement
  const status = 'loading' // Mock status
  const pathname = usePathname()
  const [toast, setToast] = useState<{ text: string; type: 'info'|'success'|'error' } | null>(null)

  useEffect(() => {
    // Simuler un temps de chargement initial
    const timer = setTimeout(() => {
      setIsLoading(false)
      
      // Cache le splash screen après l'animation
      setTimeout(() => {
        setIsFirstLoad(false)
      }, 500)
    }, 1500)

    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    // Précharge des ressources critiques (désactivé: pas d'images critiques spécifiques)
  }, [isLoading])

  // Injecter le JSON-LD après hydratation pour éviter tout mismatch SSR/CSR
  useEffect(() => {
    try {
      const scriptId = 'app-jsonld'
      // Nettoyer s'il existe déjà
      const existing = document.getElementById(scriptId)
      if (existing) existing.remove()

      const data = {
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'FELORA',
        description: "Plateforme premium de rencontres d'escorte en Suisse",
        url: typeof window !== 'undefined' ? window.location.origin : '',
        applicationCategory: 'SocialNetworkingApplication',
        operatingSystem: 'Web',
      }
      const s = document.createElement('script')
      s.type = 'application/ld+json'
      s.id = scriptId
      s.text = JSON.stringify(data)
      document.head.appendChild(s)

      return () => {
        const el = document.getElementById(scriptId)
        if (el && el.parentNode) el.parentNode.removeChild(el)
      }
    } catch {}
  }, [])

  // État de chargement global
  useEffect(() => {
    // Mettre à jour les métadonnées en fonction de la page
    const updatePageMeta = () => {
      const routeTitles: Record<string, string> = {
        '/': 'FELORA - Découvrir',
        '/search': 'FELORA - Recherche',
        '/messages': 'FELORA - Messages',
        '/profile': 'FELORA - Profil',
        '/settings': 'FELORA - Paramètres',
        '/login': 'FELORA - Connexion',
        '/register': 'FELORA - Inscription'
      }

      const title = routeTitles[pathname] || 'FELORA'
      document.title = title
    }

    updatePageMeta()
  }, [pathname])

  // Performance monitoring
  useEffect(() => {
    if (!isLoading && !isFirstLoad) {
      // Marquer la fin du chargement pour les métriques de performance
      if (typeof window !== 'undefined' && 'performance' in window) {
        // Métriques personnalisées
        const navigationStart = performance.timing?.navigationStart
        const loadComplete = performance.now()
        
        console.log(`App loaded in ${loadComplete}ms`)
      }
    }
  }, [isLoading, isFirstLoad])

  // Gestion des erreurs globales
  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      console.error('Global error caught:', event.error)
      try { if ((window as any).Sentry) (window as any).Sentry.captureException(event.error) } catch {}
    }

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      console.error('Unhandled promise rejection:', event.reason)
      try { if ((window as any).Sentry) (window as any).Sentry.captureException(event.reason) } catch {}
    }

    window.addEventListener('error', handleError)
    window.addEventListener('unhandledrejection', handleUnhandledRejection)

    return () => {
      window.removeEventListener('error', handleError)
      window.removeEventListener('unhandledrejection', handleUnhandledRejection)
    }
  }, [])

  // Afficher un toast basé sur l'URL (?message=...)
  useEffect(() => {
    try {
      const url = new URL(window.location.href)
      const msg = url.searchParams.get('message')
      const err = url.searchParams.get('error')
      if (msg || err) {
        setToast({ text: (msg || err)!, type: err ? 'error' : 'success' })
        if (msg) url.searchParams.delete('message')
        if (err) url.searchParams.delete('error')
        window.history.replaceState({}, '', url.toString())
        const t = setTimeout(() => setToast(null), 2500)
        return () => clearTimeout(t)
      }
    } catch {}
  }, [pathname])

  // Masquer la barre de navigation statique sur les dashboards (club/escort)
  useEffect(() => {
    try {
      const isDashboard = pathname?.startsWith('/club') || pathname?.startsWith('/escort') || pathname?.startsWith('/dashboard-escort')
      if (isDashboard) {
        document.body.setAttribute('data-hide-static-nav', 'true')
      } else {
        document.body.removeAttribute('data-hide-static-nav')
      }
    } catch {}
  }, [pathname])

  // Splash screen temporairement désactivé pour debug
  // if (isFirstLoad) {
  //   return (
  //     <AnimatePresence>
  //       {isLoading && <SplashScreen />}
  //     </AnimatePresence>
  //   )
  // }

  return (
    <div className="app-gateway">
      {/* Contexte global pour les états de l'app */}
      <div id="app-root" className="min-h-screen bg-black text-white">
        <PageTransition>
          {children}
        </PageTransition>
      </div>

      {/* Portal pour les modals globales */}
      <div id="modal-portal" />
      
      {/* Portal pour les notifications toast */}
      <div id="toast-portal" />

      {/* Preloader pour les ressources (non utilisé) */}
      <div className="hidden" />

      {/* JSON-LD injecté via useEffect pour éviter toute divergence SSR/CSR */}
      {toast && (
        <div className="fixed top-4 right-4 z-[9999]">
          <div className={`rounded-lg border px-4 py-2 shadow-xl ${toast.type === 'error' ? 'border-red-500/30 bg-red-500/10 text-red-300' : 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300'}`}>
            {toast.text}
          </div>
        </div>
      )}
    </div>
  )
}

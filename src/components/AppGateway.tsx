'use client'

import React, { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
// import { useSession } from 'next-auth/react' // Désactivé temporairement

interface AppGatewayProps {
  children: React.ReactNode
}

const SplashScreen = () => (
  <motion.div
    initial={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    transition={{ duration: 0.5 }}
    className="fixed inset-0 bg-black flex items-center justify-center z-50"
  >
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="text-center"
    >
      {/* Logo avec animation de rotation du gradient */}
      <div className="relative w-28 h-28 mx-auto mb-8">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "linear"
          }}
          className="absolute inset-0 rounded-full bg-gradient-to-br from-[#FF6B9D] via-[#B794F6] to-[#4FD1C7] p-[3px]"
        >
          <div className="w-full h-full rounded-full bg-black flex items-center justify-center">
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, duration: 0.4, ease: [0.34, 1.56, 0.64, 1] }}
              className="text-white text-4xl font-bold"
              style={{
                textShadow: '0 0 20px rgba(255, 107, 157, 0.5)'
              }}
            >
              F
            </motion.span>
          </div>
        </motion.div>
      </div>

      {/* Texte Felora avec animation */}
      <motion.h1
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.5 }}
        className="text-white text-3xl font-bold mb-2"
        style={{
          background: 'linear-gradient(135deg, #FF6B9D 0%, #B794F6 50%, #4FD1C7 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text'
        }}
      >
        FELORA
      </motion.h1>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.5 }}
        className="text-white/60 text-sm tracking-wider"
      >
        Plateforme Premium
      </motion.p>
    </motion.div>
  </motion.div>
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

  useEffect(() => {
    // Masquer le splash après 1.5 secondes
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 1500)

    return () => clearTimeout(timer)
  }, [])

  return (
    <div className="app-gateway">
      <AnimatePresence mode="wait">
        {isLoading && <SplashScreen />}
      </AnimatePresence>

      <div id="app-root" className="min-h-screen bg-black text-white">
        <PageTransition>{children}</PageTransition>
      </div>
    </div>
  )
}

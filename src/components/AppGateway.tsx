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
  // Version simplifiée pour éviter les erreurs JavaScript
  return (
    <div className="app-gateway">
      <div id="app-root" className="min-h-screen bg-black text-white">
        {children}
      </div>
    </div>
  )
}

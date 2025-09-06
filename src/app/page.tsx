"use client"

import Link from 'next/link'
import { motion } from 'framer-motion'

export default function SimpleHomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-[#0D0D0D] to-[#1A1A1A] text-white">
      {/* Hero Section */}
      <div className="flex flex-col items-center justify-center min-h-screen px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center max-w-4xl mx-auto"
        >
          {/* Logo */}
          <div className="mb-8 mx-auto w-20 h-20 rounded-xl p-[3px]" style={{ background: 'linear-gradient(135deg, #FF6B9D 0%, #B794F6 50%, #4FD1C7 100%)' }}>
            <div className="w-full h-full rounded-xl bg-black grid place-items-center text-3xl font-bold">
              F
            </div>
          </div>

          {/* Titre Principal */}
          <h1 className="text-5xl md:text-7xl font-extrabold mb-6">
            <span className="bg-gradient-to-r from-[#FF6B9D] via-[#B794F6] to-[#4FD1C7] bg-clip-text text-transparent">
              FELORA
            </span>
          </h1>

          <p className="text-xl md:text-2xl text-white/80 mb-4 font-light">
            Plateforme Premium Suisse
          </p>

          <p className="text-lg text-white/60 mb-12 max-w-2xl mx-auto">
            Découvrez une expérience unique avec notre système de réactions optimisé, 
            messagerie sécurisée et interface TikTok-style.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/login">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-4 bg-gradient-to-r from-[#FF6B9D] to-[#B794F6] rounded-xl font-semibold text-lg shadow-2xl hover:shadow-[#FF6B9D]/25 transition-all duration-300"
              >
                Se connecter
              </motion.button>
            </Link>
            
            <Link href="/register">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-4 border border-white/20 rounded-xl font-semibold text-lg backdrop-blur-sm hover:bg-white/5 transition-all duration-300"
              >
                S'inscrire
              </motion.button>
            </Link>
          </div>

          {/* Features */}
          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-center"
            >
              <div className="w-12 h-12 mx-auto mb-4 rounded-lg bg-gradient-to-r from-[#FF6B9D] to-[#B794F6] flex items-center justify-center">
                ⚡
              </div>
              <h3 className="font-semibold mb-2">Performance Optimisée</h3>
              <p className="text-sm text-white/60">Réactions ultra-rapides avec cache intelligent</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-center"
            >
              <div className="w-12 h-12 mx-auto mb-4 rounded-lg bg-gradient-to-r from-[#B794F6] to-[#4FD1C7] flex items-center justify-center">
                🔒
              </div>
              <h3 className="font-semibold mb-2">Sécurité Maximale</h3>
              <p className="text-sm text-white/60">Données protégées et messagerie chiffrée</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="text-center"
            >
              <div className="w-12 h-12 mx-auto mb-4 rounded-lg bg-gradient-to-r from-[#4FD1C7] to-[#FF6B9D] flex items-center justify-center">
                ✨
              </div>
              <h3 className="font-semibold mb-2">Expérience Premium</h3>
              <p className="text-sm text-white/60">Interface moderne et intuitive</p>
            </motion.div>
          </div>
        </motion.div>
      </div>

      {/* Status */}
      <div className="fixed bottom-4 right-4">
        <div className="bg-white/10 backdrop-blur-xl rounded-lg px-3 py-2 text-xs text-white/80">
          🚀 V3 Deployed Successfully
        </div>
      </div>
    </div>
  )
}
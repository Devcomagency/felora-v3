'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'

/**
 * 🔞 Gate de vérification d'âge + sélection de langue
 * Design qui colle à l'identité Felora (glassmorphism rose-violet)
 */

interface Language {
  code: string
  name: string
  flag: string
  disclaimer: string
}

const LANGUAGES: Language[] = [
  { code: 'fr', name: 'Français', flag: '🇫🇷', disclaimer: 'J\'ai 18 ans et j\'accepte les conditions' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪', disclaimer: 'Ich bin 18 und akzeptiere die Bedingungen' },
  { code: 'en', name: 'English', flag: '🇬🇧', disclaimer: 'I am 18 and accept the terms' },
  { code: 'es', name: 'Español', flag: '🇪🇸', disclaimer: 'Tengo 18 años y acepto los términos' },
  { code: 'it', name: 'Italiano', flag: '🇮🇹', disclaimer: 'Ho 18 anni e accetto i termini' }
]

const STORAGE_KEY = 'felora_age_language'
const EXPIRY_MONTHS = 12

export default function AgeLanguageGate() {
  const [isVisible, setIsVisible] = useState(false)
  const [selectedLang, setSelectedLang] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const data = JSON.parse(stored)
        const expiryDate = new Date(data.expiresAt)
        if (new Date() < expiryDate) {
          setIsVisible(false)
          return
        }
      }
    } catch (error) {
      console.error('[AgeGate] Erreur:', error)
    }
    setIsVisible(true)
  }, [])

  const handleLanguageSelect = async (langCode: string) => {
    setSelectedLang(langCode)
    await new Promise(resolve => setTimeout(resolve, 300))

    try {
      const expiryDate = new Date()
      expiryDate.setMonth(expiryDate.getMonth() + EXPIRY_MONTHS)

      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        language: langCode,
        ageConfirmed: true,
        confirmedAt: new Date().toISOString(),
        expiresAt: expiryDate.toISOString()
      }))

      document.cookie = `NEXT_LOCALE=${langCode}; path=/; max-age=${EXPIRY_MONTHS * 30 * 24 * 60 * 60}`

      await new Promise(resolve => setTimeout(resolve, 200))
      setIsVisible(false)
      router.refresh()
    } catch (error) {
      console.error('[AgeGate] Erreur sauvegarde:', error)
      setIsVisible(false)
    }
  }

  if (!isVisible) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[99999] flex items-center justify-center p-4"
        style={{ background: 'rgba(0, 0, 0, 0.95)' }}
      >
        {/* Card principale - Style Felora */}
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="relative w-full max-w-md mx-auto"
        >
          {/* Glassmorphism card */}
          <div className="relative rounded-3xl overflow-hidden">
            {/* Gradient background Felora */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#FF6B9D]/10 via-[#B794F6]/10 to-[#4FD1C7]/10" />
            <div className="absolute inset-0 backdrop-blur-2xl bg-black/80" />

            {/* Border gradient */}
            <div className="absolute inset-0 rounded-3xl border border-white/10" />

            {/* Contenu */}
            <div className="relative p-6 sm:p-8 md:p-10">

              {/* Espacement supérieur - adaptatif */}
              <div className="h-8 sm:h-12 md:h-16"></div>

              {/* Titre */}
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-center text-white mb-2 sm:mb-1">
                Welcome to Felora
              </h1>

              {/* Logo - Responsive */}
              <div className="flex justify-center -mb-2 sm:-mb-4">
                <Image
                  src="/logo-felora.png"
                  alt="Felora"
                  width={160}
                  height={160}
                  className="w-32 h-32 sm:w-40 sm:h-40 md:w-44 md:h-44 object-contain"
                  priority
                />
              </div>

              {/* Sous-titre avec avertissement */}
              <div className="text-center mb-6 sm:mb-8">
                <p className="text-white/60 text-xs sm:text-sm">
                  🔞 Adults Only — 18+ Content
                </p>
              </div>

              {/* Sélection de langue */}
              <div className="space-y-2 sm:space-y-2.5 mb-4 sm:mb-6">
                {LANGUAGES.map((lang, index) => (
                  <motion.button
                    key={lang.code}
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.3 + index * 0.05 }}
                    onClick={() => handleLanguageSelect(lang.code)}
                    disabled={selectedLang !== null}
                    className={`
                      w-full px-4 py-3 sm:px-5 sm:py-4 rounded-xl
                      flex flex-col items-start
                      transition-all duration-200
                      ${
                        selectedLang === lang.code
                          ? 'bg-gradient-to-r from-[#FF6B9D] to-[#B794F6] shadow-lg shadow-[#FF6B9D]/30'
                          : selectedLang === null
                          ? 'bg-white/5 hover:bg-white/10 border border-white/10 hover:border-[#FF6B9D]/30'
                          : 'bg-white/5 border border-white/5 opacity-40'
                      }
                    `}
                  >
                    <div className="flex items-center justify-between w-full">
                      <div className="flex items-center gap-2 sm:gap-3">
                        <span className="text-2xl sm:text-3xl">{lang.flag}</span>
                        <span className="text-white font-medium text-sm sm:text-base">{lang.name}</span>
                      </div>

                      {selectedLang === lang.code && (
                        <motion.svg
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="w-4 h-4 sm:w-5 sm:h-5 text-white"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </motion.svg>
                      )}
                    </div>

                    <p className="text-[9px] sm:text-[10px] text-white/60 mt-1 ml-9 sm:ml-12">
                      {lang.disclaimer}
                    </p>
                  </motion.button>
                ))}
              </div>

              {/* Footer */}
              <div className="pt-4 sm:pt-6 border-t border-white/10 space-y-2 sm:space-y-3">
                <p className="text-[10px] sm:text-xs text-center text-white/40">
                  Votre choix sera mémorisé pendant 12 mois
                </p>
                <div className="flex items-center justify-center gap-3 sm:gap-4 text-[10px] sm:text-xs text-white/40">
                  <a href="https://www.felora.ch/legal/privacy" className="hover:text-white/60 transition-colors">
                    Confidentialité
                  </a>
                  <span>•</span>
                  <a href="https://www.felora.ch/auth-check?redirect=%2Flegal%2Fterms" className="hover:text-white/60 transition-colors">
                    Conditions
                  </a>
                </div>
              </div>

            </div>
          </div>

          {/* Copyright en dessous */}
          <p className="text-center text-xs text-white/30 mt-4">
            © {new Date().getFullYear()} Felora — Tous droits réservés
          </p>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

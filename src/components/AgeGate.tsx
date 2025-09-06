"use client"

import React, { useEffect, useRef, useState } from 'react'

export default function AgeGate() {
  const [open, setOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const dialogRef = useRef<HTMLDivElement>(null)
  const [confirmAge, setConfirmAge] = useState(false)
  const [remember, setRemember] = useState(true)

  useEffect(() => {
    setMounted(true)
    try {
      const accepted = typeof window !== 'undefined' && (
        localStorage.getItem('felora-age-ok') === 'true' ||
        document.cookie.includes('felora_age_ok=1')
      )
      if (!accepted) {
        setOpen(true)
        // lock scroll
        const prev = document.body.style.overflow
        document.body.style.overflow = 'hidden'
        // focus
        setTimeout(() => dialogRef.current?.focus(), 0)
        return () => { document.body.style.overflow = prev }
      }
    } catch {}
  }, [])

  const accept = () => {
    try {
      if (remember) {
        localStorage.setItem('felora-age-ok', 'true')
        document.cookie = `felora_age_ok=1; path=/; max-age=${60 * 60 * 24 * 365}; SameSite=Lax`
      } else {
        sessionStorage.setItem('felora-age-ok', 'true')
      }
    } catch {}
    // unlock scroll
    document.body.style.overflow = ''
    setOpen(false)
  }

  const leave = () => {
    // Redirige hors du site
    window.location.href = 'https://www.google.com'
  }

  if (!mounted || !open) return null

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="agegate-title"
      aria-describedby="agegate-desc"
      ref={dialogRef}
      tabIndex={-1}
      style={{ position: 'fixed', inset: 0, zIndex: 4000 }}
      className="flex items-center justify-center bg-black/75 backdrop-blur-2xl"
    >
      {/* Ambient gradients */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-24 -left-24 w-[420px] h-[420px] rounded-full opacity-25 blur-3xl"
             style={{ background: 'radial-gradient(50% 50% at 50% 50%, #B794F6 0%, rgba(183,148,246,0) 70%)', animation: 'floaty 10s ease-in-out infinite' }} />
        <div className="absolute -bottom-24 -right-24 w-[420px] h-[420px] rounded-full opacity-25 blur-3xl"
             style={{ background: 'radial-gradient(50% 50% at 50% 50%, #FF6B9D 0%, rgba(255,107,157,0) 70%)', animation: 'floaty 12s ease-in-out infinite reverse' }} />
      </div>

      <div className="glass-card relative max-w-lg w-[92%] p-6 sm:p-8">
        {/* Gradient halo badge */}
        <div className="absolute -top-6 left-1/2 -translate-x-1/2">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-xl"
               style={{ background: 'var(--grad-1)', boxShadow: '0 10px 30px rgba(0,0,0,.4)' }}>
            <span className="text-white font-extrabold text-base">18+</span>
          </div>
        </div>

        <div className="mt-6 text-center">
          <h2 id="agegate-title" className="text-2xl font-extrabold tracking-tight" style={{
            background: 'var(--grad-1)', WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent'
          }}>
            Accès réservé aux adultes
          </h2>
          <p id="agegate-desc" className="mt-3 text-sm text-white/80 leading-relaxed">
            Ce site contient du contenu explicite. En entrant, vous certifiez avoir au moins 18 ans (ou l’âge légal dans votre pays) et acceptez nos conditions d’utilisation.
          </p>
        </div>

        {/* Checklist */}
        <div className="mt-5 space-y-2 text-sm text-white/85">
          <div className="flex items-center gap-3">
            <div className="w-5 h-5 rounded-md flex items-center justify-center border border-white/15 bg-white/5">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#4FD1C7" strokeWidth="3"><path d="M20 6 9 17l-5-5"/></svg>
            </div>
            <span>J’ai 18 ans ou plus (ou l’âge légal de ma juridiction)</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-5 h-5 rounded-md flex items-center justify-center border border-white/15 bg-white/5">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#4FD1C7" strokeWidth="3"><path d="M20 6 9 17l-5-5"/></svg>
            </div>
            <span>Je comprends la nature du contenu présenté</span>
          </div>
        </div>

        {/* Controls */}
        <div className="mt-6 space-y-4">
          <div className="flex items-center justify-between gap-3">
            <label className="flex items-center gap-2 text-sm text-white/80 cursor-pointer select-none">
              <input type="checkbox" className="accent-pink-500 scale-110" checked={confirmAge} onChange={(e) => setConfirmAge(e.target.checked)} />
              <span>Je confirme avoir 18 ans ou plus</span>
            </label>
            <label className="flex items-center gap-2 text-sm text-white/60 cursor-pointer select-none">
              <input type="checkbox" className="accent-pink-500 scale-110" checked={remember} onChange={(e) => setRemember(e.target.checked)} />
              <span>Se souvenir de mon choix</span>
            </label>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={accept}
              disabled={!confirmAge}
              className={`flex-1 h-11 rounded-lg font-semibold text-white relative overflow-hidden ${confirmAge ? 'opacity-100' : 'opacity-60 cursor-not-allowed'}`}
              style={{ background: 'var(--grad-1)', boxShadow: '0 10px 30px rgba(255,107,157,0.25)' }}
            >
              <span className="relative z-10">Entrer</span>
              <span className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity" style={{
                background: 'linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,.2) 50%, rgba(255,255,255,0) 100%)'
              }} />
            </button>
            <button
              onClick={leave}
              className="flex-1 h-11 rounded-lg font-semibold text-white/90 border border-white/15 bg-white/5 hover:bg-white/10"
            >
              Quitter le site
            </button>
          </div>
        </div>

        <div className="mt-5 text-[11px] text-white/55 text-center">
          Votre choix {remember ? 'sera mémorisé pendant 12 mois.' : 's’appliquera à cette session uniquement.'}
        </div>
      </div>

      <style jsx>{`
        @keyframes floaty { 0% { transform: translateY(0px)} 50% { transform: translateY(-10px)} 100% { transform: translateY(0px)} }
      `}</style>
    </div>
  )
}

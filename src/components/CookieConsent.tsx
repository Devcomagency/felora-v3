"use client"
import { useEffect, useState } from 'react'

export default function CookieConsent(){
  const [visible, setVisible] = useState(false)
  const [analytics, setAnalytics] = useState(true)

  useEffect(() => {
    try {
      const v = localStorage.getItem('felora-consent')
      if (!v) setVisible(true)
    } catch {}
  }, [])

  const acceptAll = () => {
    try { localStorage.setItem('felora-consent', JSON.stringify({ analytics: true, ts: Date.now() })) } catch {}
    try { window.dispatchEvent(new CustomEvent('felora:consent')) } catch {}
    setVisible(false)
  }
  const save = () => {
    try { localStorage.setItem('felora-consent', JSON.stringify({ analytics, ts: Date.now() })) } catch {}
    try { window.dispatchEvent(new CustomEvent('felora:consent')) } catch {}
    setVisible(false)
  }

  if (!visible) return null
  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[9998] w-[min(95vw,680px)]">
      <div className="rounded-2xl border border-white/10 bg-black/80 backdrop-blur p-4 text-sm text-white shadow-xl">
        <div className="mb-2 font-semibold">Cookies & confidentialité</div>
        <p className="text-white/80 mb-3">Nous utilisons des cookies essentiels au fonctionnement du site et, avec votre accord, des cookies de mesure d'audience anonymisés.</p>
        <div className="flex items-center gap-3 mb-3">
          <label className="flex items-center gap-2 text-white/80">
            <input type="checkbox" checked disabled />
            <span>Essentiels (obligatoires)</span>
          </label>
          <label className="flex items-center gap-2 text-white/80">
            <input type="checkbox" checked={analytics} onChange={e=>setAnalytics(e.target.checked)} />
            <span>Mesure d'audience</span>
          </label>
        </div>
        <div className="flex items-center justify-between gap-2">
          <a href="/legal/cookies" className="text-xs text-white/70 underline">En savoir plus</a>
          <div className="flex items-center gap-2">
            <button onClick={acceptAll} className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/15">Tout accepter</button>
            <button onClick={save} className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-pink-500 to-purple-600">Sauvegarder</button>
          </div>
        </div>
      </div>
    </div>
  )
}

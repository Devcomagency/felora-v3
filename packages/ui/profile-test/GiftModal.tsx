"use client"

import React, { useMemo, useState } from 'react'

export default function GiftModal({
  open,
  onClose,
  onSubmit,
  recipientName,
}: {
  open: boolean
  onClose: () => void
  onSubmit?: (amount: number, note?: string) => Promise<void> | void
  recipientName?: string
}) {
  const [amount, setAmount] = useState<number>(50)
  const [note, setNote] = useState('')
  const [loading, setLoading] = useState(false)

  const presets = useMemo(() => [20, 50, 100, 200], [])

  if (!open) return null

  const submit = async () => {
    if (loading) return
    try {
      setLoading(true)
      await onSubmit?.(amount, note)
      onClose()
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[4100] flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-xl p-4" onClick={(e) => { if (e.target === e.currentTarget) onClose() }}>
      <div className="glass-card w-full max-w-md p-5 sm:rounded-2xl rounded-xl">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'var(--grad-1)' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2"><path d="M20 12v7a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-7"/><path d="M4 8h16"/><path d="M12 22V8"/><path d="M12 8a3 3 0 1 1 3-3"/><path d="M12 8a3 3 0 1 0-3-3"/></svg>
            </div>
            <div className="text-white font-semibold">Envoyer un cadeau {recipientName ? `à ${recipientName}` : ''}</div>
          </div>
          <button aria-label="Fermer" onClick={onClose} className="w-8 h-8 rounded-lg bg-white/10 text-white hover:bg-white/15">✕</button>
        </div>

        {/* Amount presets */}
        <div className="grid grid-cols-4 gap-2 mb-4">
          {presets.map((v) => {
            const sel = v === amount
            return (
              <button key={v} onClick={() => setAmount(v)} className={`h-10 rounded-lg border text-sm font-medium ${sel ? 'border-pink-400 text-pink-300 bg-pink-500/10' : 'border-white/15 text-white/80 bg-white/5 hover:bg-white/10'}`}>
                {v} CHF
              </button>
            )
          })}
        </div>

        {/* Custom amount */}
        <div className="mb-3">
          <label className="block text-xs text-white/60 mb-1">Montant personnalisé</label>
          <input type="number" min={1} value={amount} onChange={(e) => setAmount(Number(e.target.value || 0))} className="w-full h-11 rounded-lg bg-white/5 border border-white/15 text-white px-3 outline-none focus:ring-2 focus:ring-pink-500/40" />
        </div>

        {/* Note */}
        <div className="mb-4">
          <label className="block text-xs text-white/60 mb-1">Message (optionnel)</label>
          <textarea value={note} onChange={(e) => setNote(e.target.value)} rows={3} className="w-full rounded-lg bg-white/5 border border-white/15 text-white p-3 outline-none focus:ring-2 focus:ring-pink-500/40" placeholder="Un petit mot avec votre cadeau..." />
        </div>

        <div className="flex gap-2">
          <button onClick={submit} disabled={loading || amount <= 0} className={`flex-1 h-11 rounded-lg font-semibold text-white ${loading || amount <= 0 ? 'opacity-60 cursor-not-allowed' : ''}`} style={{ background: 'var(--grad-1)' }}>
            {loading ? 'Envoi...' : 'Envoyer'}
          </button>
          <button onClick={onClose} className="h-11 px-4 rounded-lg font-semibold text-white/90 border border-white/15 bg-white/5 hover:bg-white/10">Annuler</button>
        </div>
      </div>
    </div>
  )
}


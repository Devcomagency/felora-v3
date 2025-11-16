"use client"

import React, { useEffect, useRef, useState } from 'react'
import { useTranslations } from 'next-intl'

export default function MessageComposer({
  open,
  onClose,
  recipientId,
  recipientName,
}: {
  open: boolean
  onClose: () => void
  recipientId: string
  recipientName?: string
}) {
  const t = useTranslations('messageComposer')
  const [text, setText] = useState('')
  const [sending, setSending] = useState(false)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 50)
      document.body.style.overflow = 'hidden'
      return () => { document.body.style.overflow = '' }
    }
  }, [open])

  if (!open) return null

  const send = async () => {
    if (!text.trim()) return
    setSending(true)
    try {
      // TODO: wire to messaging API
      await new Promise(r => setTimeout(r, 500))
      setText('')
      onClose()
    } finally {
      setSending(false)
    }
  }

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'enter') {
      e.preventDefault(); void send()
    }
  }

  return (
    <div className="fixed inset-0 z-[4200] flex items-center justify-center bg-black/70 backdrop-blur-xl p-4" onClick={(e) => { if (e.target === e.currentTarget) onClose() }}>
      <div className="glass-card w-full max-w-lg p-5">
        <div className="flex items-center justify-between mb-3">
          <div className="text-white font-semibold">{t('title', { name: recipientName || '' })}</div>
          <button aria-label={t('close')} onClick={onClose} className="w-8 h-8 rounded-lg bg-white/10 text-white hover:bg-white/15">✕</button>
        </div>

        <div className="mb-3">
          <textarea
            ref={inputRef}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={onKeyDown}
            rows={5}
            className="w-full rounded-lg bg-white/5 border border-white/15 text-white p-3 outline-none focus:ring-2 focus:ring-pink-500/40"
            placeholder={t('placeholder')}
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="text-[11px] text-white/60">{t('hint')}</div>
          <div className="flex gap-2">
            <button onClick={onClose} className="h-10 px-4 rounded-lg font-semibold text-white/90 border border-white/15 bg-white/5 hover:bg-white/10">{t('cancel')}</button>
            <button onClick={send} disabled={sending || !text.trim()} className={`h-10 px-5 rounded-lg font-semibold text-white ${sending || !text.trim() ? 'opacity-60 cursor-not-allowed' : ''}`} style={{ background: 'var(--grad-1)' }}>
              {sending ? t('sending') : t('send')}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}


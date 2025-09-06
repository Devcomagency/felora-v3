'use client'

import { useEffect } from 'react'

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    // Log error in console to see the exact message/stack
    // eslint-disable-next-line no-console
    console.error('GlobalError:', error)
  }, [error])

  return (
    <div className="p-6">
      <div className="max-w-2xl mx-auto bg-white/5 border border-white/10 rounded-2xl p-6">
        <h2 className="text-white font-semibold text-xl mb-2">Une erreur est survenue</h2>
        <p className="text-white/70 text-sm mb-3">Merci de copier le message ci‑dessous pour que je corrige rapidement.</p>
        <pre className="text-white/80 text-sm bg-black/40 border border-white/10 rounded-lg p-3 whitespace-pre-wrap break-words">
          {String(error?.message || 'Erreur inconnue')}\n{error?.digest ? `digest: ${error.digest}` : ''}
        </pre>
        <button onClick={reset} className="mt-3 px-4 py-2 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 text-white font-medium">
          Réessayer
        </button>
      </div>
    </div>
  )
}

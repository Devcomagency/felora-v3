'use client'

import React, { useState } from 'react'

interface CommentFormProps {
  onSubmit: (data: { text: string; rating?: number; parentId?: string; anonymousName?: string }) => Promise<boolean>
  onCancel: () => void
  submitting?: boolean
  parentId?: string
  currentUser?: {
    id: string
    name: string
    email?: string
    avatar?: string
  }
}

export function CommentForm({
  onSubmit,
  onCancel,
  submitting = false,
  parentId
}: CommentFormProps) {
  const [text, setText] = useState('')
  const [anonymousName, setAnonymousName] = useState('')
  const [showNameField, setShowNameField] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!text.trim()) {
      alert('Veuillez entrer un commentaire')
      return
    }

    // Permettre les commentaires anonymes avec nom optionnel
    const success = await onSubmit({
      text: text.trim(),
      rating: undefined, // Plus de notes
      parentId,
      anonymousName: anonymousName.trim() || undefined
    })

    if (success) {
      setText('')
      setAnonymousName('')
      setShowNameField(false)
    }
  }

  // Retirer la vérification de connexion - permettre les commentaires anonymes

  return (
    <div className="relative">
      {/* Nouveau design moderne avec glassmorphism amélioré */}
      <div 
        className="relative rounded-2xl shadow-2xl overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, rgba(15,15,35,0.95) 0%, rgba(25,15,45,0.98) 30%, rgba(35,25,55,0.95) 100%)',
          backdropFilter: 'blur(40px)',
          border: '1px solid rgba(255,107,157,0.2)',
          boxShadow: `
            0 25px 50px -12px rgba(0, 0, 0, 0.8),
            0 0 0 1px rgba(255,107,157,0.1),
            inset 0 1px 0 rgba(255, 255, 255, 0.1)
          `
        }}
      >
        {/* Header avec effet glow */}
        <div className="relative p-6 border-b border-white/10">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-600/10 via-pink-500/10 to-blue-500/10"></div>
          <div className="relative">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-white">
                <span className="bg-gradient-to-r from-pink-400 via-purple-400 to-blue-400 bg-clip-text text-transparent">
                  ✨ {parentId ? 'Répondre' : 'Nouveau commentaire'}
                </span>
              </h3>
              <button
                onClick={onCancel}
                className="group p-2 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 transition-all duration-300 hover:scale-110"
              >
                <svg className="w-4 h-4 text-gray-400 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            {/* Infos utilisateur améliorées */}
            <div className="flex items-center gap-4">
              <div 
                className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold shadow-lg"
                style={{
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  boxShadow: '0 4px 15px rgba(102, 126, 234, 0.3)'
                }}
              >
                {anonymousName ? anonymousName.charAt(0).toUpperCase() : '👤'}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-white">
                    {anonymousName || 'Utilisateur anonyme'}
                  </span>
                  <button
                    onClick={() => setShowNameField(!showNameField)}
                    className="text-xs text-blue-400 hover:text-blue-300 transition-colors border-b border-blue-400/50 hover:border-blue-300"
                  >
                    {showNameField ? 'Masquer' : 'Changer le nom'}
                  </button>
                </div>
                <div className="text-xs text-gray-400 mt-1">
                  🌐 Commentaire public
                </div>
              </div>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-6">
            {/* Champ nom optionnel avec animation */}
            {showNameField && (
              <div className="animate-in slide-in-from-top-2 duration-300">
                <label className="block text-sm font-medium text-gray-300 mb-3">
                  🏷️ Votre nom (optionnel)
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={anonymousName}
                    onChange={(e) => setAnonymousName(e.target.value)}
                    placeholder="Comment souhaitez-vous apparaître ?"
                    className="w-full px-4 py-3 rounded-xl border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:border-blue-400/70 focus:ring-2 focus:ring-blue-400/20 transition-all duration-300"
                    style={{
                      background: 'linear-gradient(135deg, rgba(59,130,246,0.05) 0%, rgba(147,51,234,0.05) 100%)',
                      backdropFilter: 'blur(10px)'
                    }}
                    maxLength={30}
                    disabled={submitting}
                  />
                  <div className="absolute right-3 top-3 text-xs text-gray-500">
                    {anonymousName.length}/30
                  </div>
                </div>
              </div>
            )}

            {/* Champ commentaire amélioré */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-3">
                💬 {parentId ? 'Votre réponse' : 'Votre commentaire'}
              </label>
              <div className="relative">
                <textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  className="w-full px-4 py-4 rounded-xl border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:border-purple-500/70 focus:ring-2 focus:ring-purple-500/20 transition-all duration-300 resize-none"
                  style={{
                    background: 'linear-gradient(135deg, rgba(168,85,247,0.05) 0%, rgba(236,72,153,0.05) 100%)',
                    backdropFilter: 'blur(10px)',
                    minHeight: '120px'
                  }}
                  placeholder={parentId ? "Écrivez votre réponse..." : "Partagez vos pensées..."}
                  required
                  disabled={submitting}
                  maxLength={1000}
                />
                <div className="absolute bottom-3 right-3 flex items-center gap-2 text-xs">
                  <span className={`${text.length < 10 ? 'text-orange-400' : text.length > 900 ? 'text-red-400' : 'text-green-400'}`}>
                    {text.length < 10 ? `${10 - text.length} caractères minimum` : `${text.length}/1000`}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Actions avec design moderne */}
          <div className="px-6 pb-6">
            <div className="flex gap-4">
              <button
                type="button"
                onClick={onCancel}
                disabled={submitting}
                className="flex-1 py-3 px-6 rounded-xl font-medium text-gray-300 border border-white/20 hover:bg-white/5 hover:border-white/30 transition-all duration-300 disabled:opacity-50 hover:scale-[1.02]"  
                style={{
                  background: 'linear-gradient(135deg, rgba(255,255,255,0.02) 0%, rgba(255,255,255,0.05) 100%)'
                }}
              >
                🚫 Annuler
              </button>
              <button
                type="submit"
                disabled={submitting || text.length < 10 || text.length > 1000}
                className="flex-1 py-3 px-6 rounded-xl font-bold text-white transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.02] hover:shadow-xl relative overflow-hidden group"
                style={{
                  background: text.length >= 10 && text.length <= 1000
                    ? 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)'
                    : 'linear-gradient(135deg, #4a5568 0%, #2d3748 100%)',
                  boxShadow: text.length >= 10 && text.length <= 1000
                    ? '0 10px 25px rgba(102,126,234,0.3), 0 5px 10px rgba(118,75,162,0.2)'
                    : '0 4px 10px rgba(0,0,0,0.3)',
                }}
              >
                <span className="relative z-10 flex items-center justify-center gap-2">
                  {submitting ? (
                    <>
                      <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      Publication...
                    </>
                  ) : (
                    <>
                      ✨ {parentId ? 'Répondre' : 'Publier'}
                      <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                      </svg>
                    </>
                  )}
                </span>
                {/* Effet de brillance au hover */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
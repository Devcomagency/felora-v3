"use client"
import { useState } from 'react'
import { Eye, EyeOff, CheckCircle, AlertCircle } from 'lucide-react'

interface ExampleCardProps {
  title: string
  description: string
  exampleImage: string
  requirements: string[]
  tips: string[]
  isRequired?: boolean
  isUploaded?: boolean
  hasError?: boolean
}

export default function ExampleCard({
  title,
  description,
  exampleImage,
  requirements,
  tips,
  isRequired = false,
  isUploaded = false,
  hasError = false
}: ExampleCardProps) {
  const [showExample, setShowExample] = useState(false)

  return (
    <div className="glass-card p-4 rounded-xl border border-white/10 relative">
      {/* Header avec statut */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <h4 className="text-white font-semibold text-sm">{title}</h4>
          {isRequired && <span className="text-xs bg-red-500/20 text-red-400 px-2 py-1 rounded">Requis</span>}
        </div>
        <div className="flex items-center gap-2">
          {isUploaded && <CheckCircle size={16} className="text-green-400" />}
          {hasError && <AlertCircle size={16} className="text-red-400" />}
          <button
            onClick={() => setShowExample(!showExample)}
            className="flex items-center gap-1 text-xs text-white/60 hover:text-white/80 transition-colors"
          >
            {showExample ? <EyeOff size={14} /> : <Eye size={14} />}
            {showExample ? 'Masquer' : 'Voir exemple'}
          </button>
        </div>
      </div>

      {/* Description */}
      <p className="text-white/70 text-xs mb-3">{description}</p>

      {/* Exemple visuel */}
      {showExample && (
        <div className="mb-4 p-3 bg-black/20 rounded-lg border border-white/5">
          <div className="relative w-full h-32 rounded-lg overflow-hidden">
            <img 
              src={exampleImage} 
              alt={`Exemple ${title}`}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            <div className="absolute bottom-2 left-2 text-white text-xs font-medium">
              Exemple de {title.toLowerCase()}
            </div>
          </div>
        </div>
      )}

      {/* Exigences */}
      <div className="space-y-2">
        <h5 className="text-white/80 text-xs font-medium">Exigences :</h5>
        <ul className="space-y-1">
          {requirements.map((req, index) => (
            <li key={index} className="flex items-start gap-2 text-xs text-white/60">
              <div className="w-1 h-1 bg-white/40 rounded-full mt-2 flex-shrink-0" />
              {req}
            </li>
          ))}
        </ul>
      </div>

      {/* Conseils */}
      {tips.length > 0 && (
        <div className="mt-3 pt-3 border-t border-white/10">
          <h5 className="text-white/80 text-xs font-medium mb-2">💡 Conseils :</h5>
          <ul className="space-y-1">
            {tips.map((tip, index) => (
              <li key={index} className="flex items-start gap-2 text-xs text-white/60">
                <div className="w-1 h-1 bg-yellow-400/60 rounded-full mt-2 flex-shrink-0" />
                {tip}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

'use client'

import { useState, useEffect } from 'react'
import { ExternalLink } from 'lucide-react'

interface LinkPreviewProps {
  url: string
}

export default function LinkPreview({ url }: LinkPreviewProps) {
  const [preview, setPreview] = useState<{ title?: string; description?: string; image?: string } | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Extraire le domaine pour affichage simple
    try {
      const domain = new URL(url).hostname.replace('www.', '')
      setPreview({ title: domain })
      setLoading(false)
    } catch {
      setLoading(false)
    }
  }, [url])

  if (loading || !preview) return null

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="mt-2 flex items-center gap-2 p-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg transition-all group"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="flex-1 min-w-0">
        <div className="text-xs text-white/90 font-medium truncate">{preview.title}</div>
        <div className="text-[10px] text-white/50 truncate">{url}</div>
      </div>
      <ExternalLink size={14} className="text-white/40 group-hover:text-white/60 flex-shrink-0" />
    </a>
  )
}


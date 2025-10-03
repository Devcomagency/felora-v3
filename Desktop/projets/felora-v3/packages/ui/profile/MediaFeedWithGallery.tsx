'use client'

import React from 'react'

type MediaItem = {
  id?: string
  type: 'image' | 'video'
  url: string
  thumb?: string
  poster?: string
  isPrivate?: boolean
  description?: string
}

interface MediaFeedWithGalleryProps {
  media: MediaItem[]
  profileId: string
  className?: string
}

export default function MediaFeedWithGallery({ media, className = '' }: MediaFeedWithGalleryProps) {
  if (!Array.isArray(media) || media.length === 0) {
    return (
      <div className="p-4">
        <div className="text-center py-12 text-gray-400">Aucun média disponible</div>
      </div>
    )
  }

  return (
    <div className={`p-2 ${className}`}>
      <div className="grid grid-cols-3 gap-2">
        {media.map((m, i) => (
          <div key={m.id || i} className="relative aspect-square overflow-hidden rounded-lg bg-black/40 border border-white/10 group">
            {m.type === 'video' ? (
              <video src={m.url} poster={m.poster || m.thumb} className="w-full h-full object-cover" controls playsInline />
            ) : (
              <img src={m.url} alt={m.description || `media-${i+1}`} className="w-full h-full object-cover" />
            )}
            {m.description && (
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <p className="text-white text-xs line-clamp-2">{m.description}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}


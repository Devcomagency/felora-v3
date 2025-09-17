'use client'

import React from 'react'
import { Play, Crown } from 'lucide-react'

interface MediaItem {
  id?: string
  type: 'image' | 'video'
  url: string
  thumb?: string
  poster?: string
  isPrivate?: boolean
}

interface MediaFeedWithGalleryProps {
  media: MediaItem[]
  profileId: string
  profileName?: string
  userId?: string | null
  onLike?: (index: number) => Promise<void>
  onSave?: (index: number) => Promise<void>
  onReactionChange?: () => Promise<void>
  className?: string
  privateEnabled?: boolean
}

export default function MediaFeedWithGallery({
  media,
  profileId,
  profileName = '',
  onLike,
  onSave,
  onReactionChange,
  className = '',
  privateEnabled = false
}: MediaFeedWithGalleryProps) {

  if (!media || media.length === 0) {
    return (
      <div className="p-4">
        <div className="text-center py-12">
          <p className="text-gray-400">Aucun média disponible</p>
        </div>
      </div>
    )
  }

  return (
    <div className={`p-4 ${className}`}>
      <div className="grid grid-cols-2 gap-2">
        {media.map((item, index) => (
          <div
            key={index}
            className="aspect-square relative rounded-lg overflow-hidden bg-gray-800 group"
          >
            {item.type === 'image' ? (
              <img
                src={item.url}
                alt={`${profileName} - ${index + 1}`}
                className={`w-full h-full object-cover ${item.isPrivate ? 'blur-xl brightness-30' : ''}`}
              />
            ) : (
              <video
                src={item.url}
                poster={item.poster || item.thumb}
                className={`w-full h-full object-cover ${item.isPrivate ? 'blur-xl brightness-30' : ''}`}
                muted
                loop
              />
            )}

            {/* Overlay pour vidéos */}
            {item.type === 'video' && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-12 h-12 bg-black/60 backdrop-blur-sm rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                  {item.isPrivate ? (
                    <Crown size={20} className="text-white" />
                  ) : (
                    <Play size={20} className="text-white ml-0.5" />
                  )}
                </div>
              </div>
            )}

            {/* Overlay pour contenu privé */}
            {item.isPrivate && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-12 h-12 bg-black/60 backdrop-blur-sm rounded-full flex items-center justify-center">
                  <Crown size={20} className="text-yellow-500" />
                </div>
              </div>
            )}

            {/* Badge premium en haut à droite */}
            {item.isPrivate && (
              <div className="absolute top-2 right-2">
                <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-gradient-to-r from-yellow-500 to-orange-500 text-white text-xs font-medium">
                  <Crown size={12} />
                  VIP
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
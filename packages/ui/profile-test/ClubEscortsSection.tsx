'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import { BadgeCheck } from 'lucide-react'
import { useTranslations } from 'next-intl'

interface EscortPreview {
  id: string
  name: string
  avatar?: string
  verified?: boolean
  premium?: boolean
  city?: string
}

interface ClubEscortsSectionProps {
  escorts: EscortPreview[]
  isLoading?: boolean
}

export default function ClubEscortsSection({ escorts, isLoading }: ClubEscortsSectionProps) {
  const t = useTranslations('clubEscorts')
  const router = useRouter()

  if (isLoading) {
    return (
      <div className="px-4 py-6 border-b border-white/5">
        <div className="flex items-center gap-2 mb-4">
          <div className="h-5 w-32 bg-white/5 rounded animate-pulse" />
          <div className="h-4 w-8 bg-white/5 rounded-full animate-pulse" />
        </div>
        <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex-shrink-0">
              <div className="w-16 h-16 rounded-full bg-white/5 animate-pulse mb-2" />
              <div className="h-3 w-14 bg-white/5 rounded animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (!escorts || escorts.length === 0) {
    return null
  }

  return (
    <div className="px-4 py-6 border-b border-white/5">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <h2 className="text-white font-semibold text-lg">{t('title')}</h2>
        <span className="text-xs text-white/40 bg-white/5 px-2 py-1 rounded-full">
          {escorts.length}
        </span>
      </div>

      {/* Scroll horizontal des avatars */}
      <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
        {escorts.map((escort) => (
          <button
            key={escort.id}
            onClick={() => router.push(`/profile/${escort.id}`)}
            className="flex-shrink-0 group"
          >
            {/* Avatar container avec gradient border */}
            <div className="relative mb-2">
              {/* Gradient border (style Instagram story) */}
              <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-[#FF6B9D] via-[#B794F6] to-[#4FD1C7] p-[2px] group-hover:p-[3px] transition-all">
                <div className="w-full h-full rounded-full bg-black" />
              </div>

              {/* Avatar */}
              <div className="relative w-16 h-16 rounded-full overflow-hidden border-2 border-black">
                {escort.avatar ? (
                  <img
                    src={escort.avatar}
                    alt={escort.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-[#FF6B9D]/20 to-[#4FD1C7]/20 flex items-center justify-center">
                    <span className="text-white/60 text-xl font-bold">
                      {escort.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
              </div>

              {/* Badge vérifié */}
              {escort.verified && (
                <div className="absolute -bottom-0.5 -right-0.5 bg-black rounded-full p-0.5">
                  <BadgeCheck className="w-4 h-4 text-[#4FD1C7]" fill="currentColor" />
                </div>
              )}

              {/* Badge premium */}
              {escort.premium && (
                <div className="absolute -top-0.5 -right-0.5 bg-gradient-to-r from-amber-500 to-yellow-300 rounded-full p-1">
                  <svg className="w-2.5 h-2.5 text-black" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                </div>
              )}
            </div>

            {/* Nom et ville */}
            <div className="text-center max-w-[72px]">
              <p className="text-white text-xs font-medium truncate group-hover:text-[#FF6B9D] transition-colors">
                {escort.name}
              </p>
              {escort.city && (
                <p className="text-white/40 text-[10px] truncate">
                  {escort.city}
                </p>
              )}
            </div>
          </button>
        ))}
      </div>

      <style jsx global>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  )
}

'use client'

import React from 'react'
import { Crown, MapPin } from 'lucide-react'

interface ProfileHeaderProps {
  name: string
  handle?: string
  city?: string
  age?: number
  avatar?: string
  verified?: boolean
  premium?: boolean
  online?: boolean
  languages: string[]
  services: string[]
  stats?: {
    likes?: number
    followers?: number
    views?: number
  }
  mediaCount?: number
  description?: string
}

export default function ProfileHeader({
  name,
  handle,
  city,
  age,
  avatar,
  verified = false,
  premium = false,
  online = false,
  languages,
  services,
  stats,
  mediaCount = 0,
  description
}: ProfileHeaderProps) {
  return (
    <div className="px-4 pt-4 pb-6">
      <div className="flex items-start gap-4 mb-4">
        <div className="relative">
          <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-pink-500 via-purple-500 to-blue-500 p-0.5">
            <img
              src={avatar || '/placeholder-avatar.jpg'}
              alt={name}
              className="w-full h-full rounded-full object-cover border-2 border-black"
            />
          </div>
          {online && (
            <div className="absolute bottom-1 right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-black animate-pulse" />
          )}
        </div>

        <div className="flex-1">
          <div className="mb-2">
            <h2 className="font-semibold text-lg flex items-center gap-2 text-white">
              {name}
              {verified && (
                <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs">✓</span>
                </div>
              )}
              {premium && (
                <div className="w-5 h-5 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full flex items-center justify-center">
                  <Crown size={12} className="text-white" />
                </div>
              )}
            </h2>
          </div>

          <div className="flex items-start mb-3">
            <div className="flex gap-6">
              <div className="text-center">
                <div className="text-lg font-bold text-white">{stats?.views || 0}</div>
                <div className="text-xs text-gray-400">Vues</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-white">{stats?.likes || 0}</div>
                <div className="text-xs text-gray-400">React</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-white">{mediaCount}</div>
                <div className="text-xs text-gray-400">Publications</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <div>
          {handle && (
            <p className="text-gray-400 text-sm mb-2">{handle}</p>
          )}

          <div className="flex flex-wrap items-center gap-2 text-sm text-gray-400">
            {city && (
              <>
                <div className="flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  <span>{city}</span>
                </div>
                <span>•</span>
              </>
            )}
            {age && <span>{age} ans</span>}
          </div>

          {description && (
            <p className="mt-2 text-sm text-white/85 leading-relaxed">
              {description}
            </p>
          )}
        </div>

        {languages.length > 0 && (
          <div>
            <h4 className="text-white font-medium mb-2 text-sm">Langues</h4>
            <div className="flex flex-wrap gap-2">
              {languages.slice(0, 4).map((language) => (
                <span
                  key={language}
                  className="px-3 py-1 bg-blue-500/20 text-blue-300 text-xs rounded-full border border-blue-500/30 font-medium"
                >
                  {language}
                </span>
              ))}
            </div>
          </div>
        )}

        {services.length > 0 && (
          <div>
            <h4 className="text-white font-medium mb-2 text-sm">Services</h4>
            <div className="flex flex-wrap gap-1.5">
              {services.slice(0, 6).map((service, index) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-white/10 rounded-lg text-xs border border-white/10 text-gray-300"
                >
                  {service}
                </span>
              ))}
              {services.length > 6 && (
                <span className="px-2 py-1 bg-white/5 rounded-lg text-xs border border-white/5 text-gray-500">
                  +{services.length - 6} autres
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}


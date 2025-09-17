import Image from 'next/image'
import Link from 'next/link'
import { EscortProfileDTO, ClubProfileDTO } from '../../core/services/ProfileService'

interface ProfileCardProps {
  profile: EscortProfileDTO | ClubProfileDTO
  type: 'escort' | 'club'
  className?: string
}

export default function ProfileCard({ profile, type, className = '' }: ProfileCardProps) {
  const profileUrl = `/${type}/${profile.handle}`
  
  return (
    <Link href={profileUrl} className={`block ${className}`}>
      <div className="glass-card rounded-2xl p-4 hover:scale-105 transition-all duration-300 group">
        {/* Avatar */}
        <div className="relative mb-4">
          <div className="w-full aspect-square rounded-xl overflow-hidden">
            {profile.avatarUrl ? (
              <Image
                src={profile.avatarUrl}
                alt={type === 'escort' ? (profile as EscortProfileDTO).displayName : (profile as ClubProfileDTO).name}
                width={200}
                height={200}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-felora-aurora to-felora-plasma flex items-center justify-center">
                <span className="text-4xl font-bold text-felora-pearl">
                  {type === 'escort' 
                    ? (profile as EscortProfileDTO).displayName.charAt(0)
                    : (profile as ClubProfileDTO).name.charAt(0)
                  }
                </span>
              </div>
            )}
          </div>
          
          {/* Badge */}
          <div className="absolute -top-2 -right-2 w-8 h-8 bg-felora-quantum rounded-full flex items-center justify-center">
            {type === 'escort' ? (
              <svg className="w-5 h-5 text-felora-pearl" fill="currentColor" viewBox="0 0 24 24">
                <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            ) : (
              <span className="text-lg">👑</span>
            )}
          </div>
        </div>

        {/* Info */}
        <div className="space-y-2">
          <h3 className="font-bold text-felora-pearl text-lg leading-tight">
            {type === 'escort' 
              ? (profile as EscortProfileDTO).displayName
              : (profile as ClubProfileDTO).name
            }
          </h3>
          
          <p className="text-felora-aurora text-sm font-medium">
            {profile.handle}
          </p>

          {/* Type specific info */}
          {type === 'escort' && (
            <div className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <span className="text-felora-silver/70">Tarif</span>
                <span className="text-felora-quantum font-semibold">
                  {(profile as EscortProfileDTO).ratePerHour 
                    ? `${(profile as EscortProfileDTO).ratePerHour} CHF/h`
                    : 'Sur demande'
                  }
                </span>
              </div>
              <div className="flex flex-wrap gap-1">
                {(profile as EscortProfileDTO).languages.slice(0, 2).map((lang, index) => (
                  <span key={index} className="text-xs px-2 py-1 bg-felora-plasma/20 text-felora-plasma rounded-full">
                    {lang}
                  </span>
                ))}
              </div>
            </div>
          )}

          {type === 'club' && (
            <div className="space-y-1">
              <div className="text-sm text-felora-silver/70">
                📍 {(profile as ClubProfileDTO).address || 'Genève'}
              </div>
              <div className="text-sm text-felora-neural">
                🕐 {(profile as ClubProfileDTO).openingHours || '20h - 4h'}
              </div>
            </div>
          )}

          {/* Stats */}
          <div className="flex items-center justify-between text-xs text-felora-silver/60 pt-2 border-t border-felora-steel/20">
            <div className="flex items-center gap-1">
              <span className="text-felora-quantum">★</span>
              <span>4.8 (127)</span>
            </div>
            <div className="flex items-center gap-1">
              <span className={type === 'escort' ? 'text-felora-plasma' : 'text-felora-neural'}>
                {type === 'escort' ? '◉' : '👥'}
              </span>
              <span>{type === 'escort' ? 'En ligne' : '12 escorts'}</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  )
}
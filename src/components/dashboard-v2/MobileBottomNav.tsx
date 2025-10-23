"use client"

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { User, Image, Users, BarChart3, Calendar } from 'lucide-react'

export default function MobileBottomNav(){
  const pathname = usePathname() || ''
  const isClub = pathname.startsWith('/club')
  const isEscort = pathname.startsWith('/escort') || pathname.startsWith('/dashboard-escort')

  const items = isClub
    ? [
        { label: 'Mon Profil', href: '/club/profile', icon: User },
        { label: 'Médias', href: '/club/media', icon: Image },
        { label: 'Mes Escorts', href: '/club/escorts', icon: Users },
        { label: 'Stats', href: '/club/stats', icon: BarChart3 },
      ]
    : isEscort
    ? [
        { label: 'Mon Profil', href: '/escort/profile', icon: User },
        { label: 'Agenda', href: '/escort/agenda', icon: Calendar },
        { label: 'Médias', href: '/escort/media', icon: Image },
        { label: 'Mes Clubs', href: '/escort/clubs', icon: Users },
        { label: 'Stats', href: '/escort/stats', icon: BarChart3 },
      ]
    : []

  if (items.length === 0) return null

  return (
    <nav
      className="fixed bottom-0 inset-x-0 z-40 bg-gradient-to-t from-black/95 via-black/80 to-black/60 backdrop-blur-xl border-t border-white/10 shadow-[0_-8px_28px_rgba(0,0,0,0.55)] safe-area-pb"
      data-dashboard-mobile-nav
    >
      <div className="max-w-6xl mx-auto px-2">
        <div className={`grid ${items.length === 5 ? 'grid-cols-5' : 'grid-cols-4'} gap-1`}>
          {items.map((it) => {
            const active = pathname === it.href
            const Icon = it.icon
            return (
              <Link
                key={it.href}
                href={it.href}
                className={`relative flex flex-col items-center justify-center py-2.5 text-[11px] rounded-lg transition-colors ${active ? 'text-white' : 'text-white/70 hover:text-white'}`}
              >
                {/* Active indicator */}
                {active && <span className="absolute -top-1 w-6 h-0.5 rounded bg-gradient-to-r from-pink-500 to-purple-500" />}
                <Icon size={18} className={active ? 'text-pink-400' : 'text-white/80'} />
                <span className="mt-0.5">{it.label}</span>
              </Link>
            )
          })}
        </div>
      </div>
    </nav>
  )
}

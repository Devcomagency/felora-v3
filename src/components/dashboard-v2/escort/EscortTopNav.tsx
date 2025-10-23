"use client"

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function EscortTopNav(){
  const pathname = usePathname()

  const tabs = [
    { label: 'Mon Profil', href: '/escort/profile' },
    { label: 'Agenda', href: '/escort/agenda' },
    { label: 'Médias', href: '/escort/media' },
    { label: 'Mes Clubs', href: '/escort/clubs' },
    { label: 'Stats', href: '/escort/stats' },
  ]

  return (
    <div className="flex gap-1 overflow-x-auto py-2 scrollbar-hide">
      {tabs.map((tab) => {
        const isActive = pathname === tab.href || pathname?.startsWith(tab.href + '/')
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
              isActive
                ? 'bg-gradient-to-r from-pink-500/20 to-purple-500/20 text-pink-300 border border-pink-500/30'
                : 'text-white/70 hover:text-white hover:bg-white/5'
            }`}
          >
            {tab.label}
          </Link>
        )
      })}
    </div>
  )
}

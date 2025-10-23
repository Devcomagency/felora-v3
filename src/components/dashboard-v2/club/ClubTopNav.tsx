"use client"

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function ClubTopNav(){
  const pathname = usePathname()

  const tabs = [
    { label: 'Mon Profil', href: '/club/profile' },
    { label: 'Médias', href: '/club/media' },
    { label: 'Mes Escorts', href: '/club/escorts' },
    { label: 'Stats', href: '/club/stats' },
  ]

  return (
    <div className="sticky top-0 z-40 bg-gradient-to-b from-black/90 to-black/70 backdrop-blur-xl border-b border-white/10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="py-3 border-b border-white/5">
          <Link href="/club/profile" className="text-sm sm:text-base text-white/90 font-semibold">Dashboard Club</Link>
        </div>

        {/* Onglets de navigation */}
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
      </div>
    </div>
  )
}

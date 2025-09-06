"use client"

import Link from 'next/link'

export default function ClubTopNav(){
  return (
    <div className="sticky top-0 z-40 bg-gradient-to-b from-black/90 to-black/70 backdrop-blur-xl border-b border-white/10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-3">
        <Link href="/club/profile" className="text-sm sm:text-base text-white/90 font-semibold">Dashboard Club</Link>
        {/* Menu retiré — les Paramètres sont dans le menu burger global */}
        <div />
      </div>
    </div>
  )
}

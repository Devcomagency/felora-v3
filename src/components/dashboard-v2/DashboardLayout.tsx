'use client'

import { ReactNode } from 'react'
import { usePathname } from 'next/navigation'
import DashboardSidebar from './DashboardSidebar'
import DashboardHeader from './DashboardHeader'
import ClubTopNav from './club/ClubTopNav'
import MobileBottomNav from './MobileBottomNav'

interface DashboardLayoutProps {
  children: ReactNode
  title?: string
  subtitle?: string
}

export default function DashboardLayout({ children, title, subtitle }: DashboardLayoutProps) {
  const pathname = usePathname()
  const isClub = pathname?.startsWith('/club')

  if (isClub) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-900 to-black">
        {/* Top navigation (no left sidebar, no search) */}
        <ClubTopNav />
        <div>
          <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6 pb-24">
            {(title || subtitle) && (
              <div className="mb-4 sm:mb-6">
                {title && (
                  <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                    {title}
                  </h1>
                )}
                {subtitle && (
                  <p className="mt-2 text-gray-400">
                    {subtitle}
                  </p>
                )}
              </div>
            )}
            {children}
          </main>
        </div>
        <MobileBottomNav />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-900 to-black">
      {/* Main content (sans sidebar) */}
      <div className="ml-0">
        {/* Header */}
        <DashboardHeader />

        {/* Content area */}
        <main className="px-4 sm:px-6 py-8 pb-24 lg:pb-10 max-w-6xl mx-auto">
          {(title || subtitle) && (
            <div className="mb-8">
              {title && (
                <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                  {title}
                </h1>
              )}
              {subtitle && (
                <p className="mt-2 text-gray-400">
                  {subtitle}
                </p>
              )}
            </div>
          )}

          {children}
        </main>
      </div>
      <MobileBottomNav />
    </div>
  )
}

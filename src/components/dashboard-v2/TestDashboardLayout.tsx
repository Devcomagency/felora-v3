'use client'

import TestDashboardSidebar from './TestDashboardSidebar'
import TestDashboardHeader from './TestDashboardHeader'

interface TestDashboardLayoutProps {
  children: React.ReactNode
  title: string
  subtitle?: string
  userType?: 'escort' | 'club'
}

export default function TestDashboardLayout({ 
  children, 
  title, 
  subtitle, 
  userType = 'escort' 
}: TestDashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-900 to-black">
      <TestDashboardSidebar userType={userType} />
      
      <div className="ml-64">
        <TestDashboardHeader userType={userType} />
        
        <main className="px-6 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent mb-2">
              {title}
            </h1>
            {subtitle && (
              <p className="text-gray-400 text-lg">
                {subtitle}
              </p>
            )}
          </div>
          
          {children}
        </main>
      </div>
    </div>
  )
}
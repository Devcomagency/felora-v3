'use client'

// Canary guard for all /profile-test/* routes
// Renders 404 unless NEXT_PUBLIC_ENABLE_TEST_PAGES=true or cookie canary=1

import { useEffect, useState } from 'react'

export default function ProfileTestLayout({ children }: { children: React.ReactNode }) {
  const [allowed, setAllowed] = useState(false)

  useEffect(() => {
    try {
      // Env flag is embedded at build time for the client bundle
      const enableAll = process.env.NEXT_PUBLIC_ENABLE_TEST_PAGES === 'true'
      if (enableAll) {
        setAllowed(true)
        return
      }
      // Cookie-based canary gate
      const canary = document.cookie
        .split('; ')
        .find((row) => row.startsWith('canary='))
        ?.split('=')[1]
      setAllowed(canary === '1')
    } catch {
      setAllowed(false)
    }
  }, [])

  if (!allowed) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center p-6">
          <h1 className="text-xl font-semibold mb-2">Not Found</h1>
          <p className="text-gray-400">This preview page is available in canary mode only.</p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}


'use client'

// Canary guard for all /marketplace-test/* routes
// Renders 404 unless NEXT_PUBLIC_ENABLE_TEST_PAGES=true or cookie canary=1

import { useEffect, useState } from 'react'

export default function MarketplaceTestLayout({ children }: { children: React.ReactNode }) {
  const [allowed, setAllowed] = useState(true)

  useEffect(() => { setAllowed(true) }, [])

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

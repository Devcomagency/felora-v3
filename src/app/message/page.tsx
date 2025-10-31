'use client'

import { useSearchParams } from 'next/navigation'
import { useEffect, useState, Suspense } from 'react'
import { useSession } from 'next-auth/react'

function MessageContent() {
  const searchParams = useSearchParams()
  const { data: session } = useSession()
  const [isLoading, setIsLoading] = useState(true)
  
  const toUserId = searchParams.get('to')

  useEffect(() => {
    // Redirect to messages page with the conversation
    if (toUserId && session?.user?.id) {
      window.location.href = `/messages?conversation=${session.user.id}-${toUserId}`
    } else {
      window.location.href = '/messages'
    }
  }, [toUserId, session])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-felora-obsidian via-felora-charcoal to-felora-void flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-felora-aurora mx-auto mb-4"></div>
          <p className="text-felora-silver text-lg">Ouverture de la conversation...</p>
        </div>
      </div>
    )
  }

  return null
}

export default function MessagePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gradient-to-br from-felora-obsidian via-felora-charcoal to-felora-void flex items-center justify-center"><div className="text-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-felora-aurora mx-auto mb-4"></div><p className="text-felora-silver text-lg">Loading...</p></div></div>}>
      <MessageContent />
    </Suspense>
  )
}
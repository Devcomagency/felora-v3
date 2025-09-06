"use client"
import { useEffect, useState } from 'react'
import Script from 'next/script'

export default function AnalyticsLoader({ websiteId, src }:{ websiteId?: string; src?: string }){
  const [enabled, setEnabled] = useState(false)

  useEffect(() => {
    const check = () => {
      try {
        const v = localStorage.getItem('felora-consent')
        if (!v) { setEnabled(false); return }
        const parsed = JSON.parse(v)
        setEnabled(!!parsed?.analytics)
      } catch { setEnabled(false) }
    }
    check()
    const onChange = () => check()
    window.addEventListener('felora:consent', onChange as any)
    return () => window.removeEventListener('felora:consent', onChange as any)
  }, [])

  if (!websiteId || !src) return null
  if (!enabled) return null
  return (
    <Script
      async
      defer
      src={src}
      data-website-id={websiteId}
      strategy="afterInteractive"
    />
  )
}


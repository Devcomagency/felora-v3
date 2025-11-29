"use client"
import Script from 'next/script'

/**
 * Umami Analytics Loader - Privacy-friendly, cookieless analytics
 * Loads directly without consent requirement (GDPR compliant)
 */
export default function AnalyticsLoader({ websiteId, src }:{ websiteId?: string; src?: string }){
  // ✅ Umami ne nécessite PAS de consentement cookies (pas de cookies utilisés)
  // Charger directement sans attendre le consentement
  if (!websiteId || !src) return null

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


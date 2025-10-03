// Aligne le comportement de devtools comme dans next.config.ts
if (process.env.NODE_ENV !== 'production') {
  process.env.NEXT_DISABLE_DEVTOOLS = '1'
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Ne pas échouer le build sur les erreurs ESLint/TS (stabilité déploiement)
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },

  // Next.js 15+: paquets externes côté serveur
  serverExternalPackages: ['@prisma/client'],

  // Optimisations et sécurité de base
  poweredByHeader: false,
  reactStrictMode: true,

  // Images: production domains + development testing
  images: {
    domains: ['localhost'],
    remotePatterns: [
      // Production storage - Cloudflare R2
      { protocol: 'https', hostname: '*.r2.cloudflarestorage.com', port: '', pathname: '/**' },
      { protocol: 'https', hostname: '*.r2.dev', port: '', pathname: '/**' },
      { protocol: 'https', hostname: 'media.felora.ch', port: '', pathname: '/**' },

      // Fallback/legacy storage
      { protocol: 'https', hostname: '*.amazonaws.com', port: '', pathname: '/**' },
      { protocol: 'https', hostname: '*.supabase.co', port: '', pathname: '/**' },

      // Production app domains
      { protocol: 'https', hostname: 'felora-v3.vercel.app', port: '', pathname: '/**' },
      { protocol: 'https', hostname: 'felora.ch', port: '', pathname: '/**' },
      
      // Development/testing only
      { protocol: 'https', hostname: 'picsum.photos', port: '', pathname: '/**' },
      { protocol: 'https', hostname: 'images.unsplash.com', port: '', pathname: '/**' },
      { protocol: 'https', hostname: 'commondatastorage.googleapis.com', port: '', pathname: '/**' },
      
      // CMS (if used)
      { protocol: 'https', hostname: 'cdn.sanity.io', port: '', pathname: '/**' },
    ],
  },

  // Désactive les expérimentations et la surcharge Webpack pour stabiliser le build prod
  webpack: undefined,

  // Redirects: Canonical route consolidation
  async redirects() { return [] },

  // En-têtes de sécurité - CSP optimisée R2 + services
  async headers() {
    const isDev = process.env.NODE_ENV !== 'production'
    
    // Domaines de confiance spécifiques
    const trustedDomains = [
      // App domains
      'https://felora-v3.vercel.app',
      'https://felora.ch',

      // Storage R2
      'https://*.r2.cloudflarestorage.com',
      'https://*.r2.dev',
      'https://media.felora.ch',

      // Maps & Location Services
      'https://api.mapbox.com',
      'https://events.mapbox.com',
      'https://*.tiles.mapbox.com',

      // OpenStreetMap tiles
      'https://tile.openstreetmap.org',

      // Demo images (mock)
      'https://picsum.photos',

      // Observability & Analytics
      'https://*.sentry.io',
      'https://vitals.vercel-analytics.com',

      // Vercel Live (feedback / overlays)
      'https://vercel.live',
      'https://*.vercel.live',
      
      // Development only
      ...(isDev ? ['http://localhost:*', 'ws://localhost:*'] : [])
    ].join(' ')
    
    const csp = [
      "default-src 'self'",
      `script-src 'self' ${isDev ? "'unsafe-inline' 'unsafe-eval'" : "'unsafe-inline'"} blob: https://api.mapbox.com https://*.sentry.io https://vercel.live https://*.vercel.live`,
      "style-src 'self' 'unsafe-inline' https://api.mapbox.com",
      // Autoriser l'application à embarquer (iframe) des outils Vercel Live
      "frame-src 'self' https://vercel.live https://*.vercel.live",
      `img-src 'self' data: blob: ${trustedDomains}`,
      `media-src 'self' blob: data: ${trustedDomains}`,
      "worker-src 'self' blob:",
      `connect-src 'self' ${trustedDomains} wss: ws:`,
      "font-src 'self' data: https://api.mapbox.com",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      isDev ? '' : 'upgrade-insecure-requests',
    ].filter(Boolean).join('; ')

    return [
      {
        source: '/:path*',
        headers: [
          { key: 'Content-Security-Policy', value: csp },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          // Autoriser la caméra et microphone pour l'écran caméra
          { key: 'Permissions-Policy', value: 'geolocation=(self), microphone=(self), camera=(self)' },
        ],
      },
    ]
  },

  // Configuration des limites de requête (obsolète dans Next.js 15+)
  // isrMemoryCacheSize supprimé car non supporté

  // Conservé depuis .js (si utilisé par getConfig côté serveur)
  serverRuntimeConfig: {
    maxRequestBodySize: '100mb',
  },
}

module.exports = nextConfig

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

  // Server Actions: limite de taille pour uploads
  experimental: {
    serverActions: { bodySizeLimit: '10mb' },
  },

  // Webpack: WASM async + éviter les built-ins Node côté client
  webpack: (config) => {
    config.experiments = {
      ...(config.experiments || {}),
      asyncWebAssembly: true,
      layers: true,
    }
    config.resolve = config.resolve || {}
    config.resolve.fallback = {
      ...(config.resolve.fallback || {}),
      fs: false,
      path: false,
      os: false,
    }
    return config
  },

  // Redirects: Canonical route consolidation
  async redirects() {
    return [
      // Escort dashboard routes → /escort/*
      {
        source: '/dashboard-escort/:path*',
        destination: '/escort/:path*',
        permanent: true,
      },
      {
        source: '/(dashboard)/escort/:path*',
        destination: '/escort/:path*',
        permanent: true,
      },
      // API Profile standardization
      {
        source: '/api/profiles/:id',
        destination: '/api/profile/:id',
        permanent: true,
      },
      // Geographic API consolidation  
      {
        source: '/api/geocode/:path*',
        destination: '/api/geo/:path*',
        permanent: true,
      },
    ];
  },

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
      
      // Maps & Location Services
      'https://api.mapbox.com',
      'https://events.mapbox.com',
      'https://*.tiles.mapbox.com',
      
      // Observability & Analytics
      'https://*.sentry.io',
      'https://vitals.vercel-analytics.com',
      
      // Development only
      ...(isDev ? ['http://localhost:*', 'ws://localhost:*'] : [])
    ].join(' ')
    
    const csp = [
      "default-src 'self'",
      `script-src 'self' ${isDev ? "'unsafe-inline' 'unsafe-eval'" : "'unsafe-inline'"} blob: https://api.mapbox.com https://*.sentry.io`,
      "style-src 'self' 'unsafe-inline' https://api.mapbox.com",
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
          { key: 'Permissions-Policy', value: 'geolocation=(), microphone=(), camera=()' },
        ],
      },
    ]
  },

  // Conservé depuis .js (si utilisé par getConfig côté serveur)
  serverRuntimeConfig: {
    maxRequestBodySize: '50mb',
  },
}

module.exports = nextConfig

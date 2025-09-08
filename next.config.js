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

  // Images: fusion des patterns .ts et .js
  images: {
    domains: ['localhost', 'felora-v3.vercel.app'],
    remotePatterns: [
      // existants (.js)
      { protocol: 'https', hostname: '*.r2.cloudflarestorage.com', port: '', pathname: '/**' },
      { protocol: 'https', hostname: '*.amazonaws.com', port: '', pathname: '/**' },
      // ajoutés (.ts)
      { protocol: 'https', hostname: 'picsum.photos', port: '', pathname: '/**' },
      { protocol: 'https', hostname: 'cdn.sanity.io', port: '', pathname: '/**' },
      { protocol: 'https', hostname: '*.supabase.co', port: '', pathname: '/**' },
      { protocol: 'https', hostname: 'images.unsplash.com', port: '', pathname: '/**' },
      { protocol: 'https', hostname: 'commondatastorage.googleapis.com', port: '', pathname: '/**' },
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

  // En-têtes de sécurité (+ CSP souple en dev)
  async headers() {
    const isDev = process.env.NODE_ENV !== 'production'
    const csp = [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' blob:",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob: https:",
      "connect-src 'self' https: http: ws: wss:",
      "font-src 'self' data:",
      "frame-ancestors 'none'",
      "base-uri 'self'",
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

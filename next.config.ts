import type { NextConfig } from "next";

// Force-disable Next DevTools in dev to avoid broken devtools chunks
if (process.env.NODE_ENV !== 'production') {
  process.env.NEXT_DISABLE_DEVTOOLS = '1'
}

const nextConfig: NextConfig = {
  eslint: {
    // ⚠️ Temporairement ignoré pour le déploiement
    ignoreDuringBuilds: true,
  },
  typescript: {
    // ⚠️ Temporairement ignoré pour le déploiement COMPLET 
    ignoreBuildErrors: true,
  },
  // Configuration optimisée pour la production
  poweredByHeader: false,
  reactStrictMode: true,
  // Configuration des images
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https', 
        hostname: 'cdn.sanity.io',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'commondatastorage.googleapis.com',
        port: '',
        pathname: '/**',
      },
      // Cloudflare R2 public endpoints (for signed URLs if shown in UI)
      {
        protocol: 'https',
        hostname: '*.r2.cloudflarestorage.com',
        port: '',
        pathname: '/**',
      }
    ],
  },
  // Configuration des Server Actions et uploads
  output: 'standalone', // Mode déploiement pour Vercel
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb', // Limite augmentée pour les uploads de médias
    },
  },
  // Supprimé: rewrites/redirects de test → route officielle utilisée directement
  webpack: (config) => {
    // Allow async WebAssembly; needed if we later enable libsignal-client WASM
    config.experiments = {
      ...(config.experiments || {}),
      asyncWebAssembly: true,
      layers: true,
    }
    // Avoid bundling Node built-ins on the client
    config.resolve = config.resolve || {}
    config.resolve.fallback = {
      ...(config.resolve.fallback || {}),
      fs: false,
      path: false,
      os: false,
    }
    return config
  },
  async headers() {
    // Basic secure headers + CSP (libérale en dev)
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
      isDev ? '' : "upgrade-insecure-requests",
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
};

export default nextConfig;

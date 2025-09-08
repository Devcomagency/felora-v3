/** @type {import('next').NextConfig} */
const nextConfig = {
  // Do not fail the build on ESLint errors (deployment stability)
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Next.js 15+: use top-level serverExternalPackages instead of experimental
  serverExternalPackages: ['@prisma/client'],
  images: {
    domains: ['localhost', 'felora-v3.vercel.app'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.r2.cloudflarestorage.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '*.amazonaws.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
  // Configuration maximale pour Vercel
  serverRuntimeConfig: {
    maxRequestBodySize: '50mb',
  },
}

module.exports = nextConfig

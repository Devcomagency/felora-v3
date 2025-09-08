/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['@prisma/client'],
  },
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
  // Configuration pour les uploads plus volumineux
  api: {
    bodyParser: {
      sizeLimit: '50mb',
    },
  },
  // Configuration maximale pour Vercel
  serverRuntimeConfig: {
    maxRequestBodySize: '50mb',
  },
}

module.exports = nextConfig
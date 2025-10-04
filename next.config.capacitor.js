/** @type {import('next').NextConfig} */
const nextConfig = {
  // Static export pour Capacitor
  output: 'export',

  // Optimisations
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },
  poweredByHeader: false,
  reactStrictMode: true,

  // Images unoptimized pour static export
  images: {
    unoptimized: true,
  },
}

module.exports = nextConfig

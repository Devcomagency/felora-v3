import type { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const host = process.env.NEXTAUTH_URL || 'http://localhost:3000'
  const now = new Date().toISOString()
  const routes = [
    '/',
    '/search',
    '/map',
    '/profiles',
  ]
  return routes.map((path) => ({ url: `${host}${path}`, lastModified: now, changeFrequency: 'daily', priority: path === '/' ? 1 : 0.6 }))
}


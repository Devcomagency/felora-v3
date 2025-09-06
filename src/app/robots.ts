import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const host = process.env.NEXTAUTH_URL || 'http://localhost:3000'
  return {
    rules: [
      { userAgent: '*', allow: ['/', '/search', '/map', '/profiles', '/profile/*'], disallow: ['/api/*', '/admin/*', '/dashboard*', '/escort/*', '/club/*'] },
    ],
    sitemap: `${host}/sitemap.xml`,
  }
}


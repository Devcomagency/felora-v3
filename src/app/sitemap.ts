import type { MetadataRoute } from 'next'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Détection automatique du domaine en production
  const isProduction = process.env.VERCEL_ENV === 'production'
  const productionUrl = 'https://felora.ch'
  const host = isProduction
    ? productionUrl
    : (process.env.NEXT_PUBLIC_APP_URL || process.env.NEXTAUTH_URL || productionUrl)

  const now = new Date()

  // Pages statiques principales
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${host}`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${host}/landing`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.95,
    },
    {
      url: `${host}/search`,
      lastModified: now,
      changeFrequency: 'hourly',
      priority: 0.9,
    },
    {
      url: `${host}/map`,
      lastModified: now,
      changeFrequency: 'hourly',
      priority: 0.9,
    },
    {
      url: `${host}/profiles`,
      lastModified: now,
      changeFrequency: 'hourly',
      priority: 0.8,
    },
    {
      url: `${host}/clubs`,
      lastModified: now,
      changeFrequency: 'hourly',
      priority: 0.8,
    },
    {
      url: `${host}/legal/terms`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.3,
    },
    {
      url: `${host}/legal/privacy`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.3,
    },
    {
      url: `${host}/register`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${host}/login`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.4,
    },
  ]

  try {
    // Récupérer tous les profils d'escort actifs et publics
    const escortProfiles = await prisma.escortProfile.findMany({
      where: {
        user: {
          isActive: true,
          OR: [
            { suspendedUntil: null },
            { suspendedUntil: { lt: now } }
          ]
        }
      },
      select: {
        id: true,
        updatedAt: true,
      },
      take: 1000, // Limite pour éviter des sitemaps trop gros
    })

    // Ajouter les profils d'escort au sitemap
    const escortRoutes: MetadataRoute.Sitemap = escortProfiles.map((profile) => ({
      url: `${host}/profile/${profile.id}`,
      lastModified: profile.updatedAt || now,
      changeFrequency: 'daily' as const,
      priority: 0.7,
    }))

    // Récupérer les profils de clubs actifs
    const clubProfiles = await prisma.clubProfile.findMany({
      where: {
        user: {
          isActive: true,
          OR: [
            { suspendedUntil: null },
            { suspendedUntil: { lt: now } }
          ]
        }
      },
      select: {
        id: true,
        updatedAt: true,
      },
      take: 500,
    })

    // Ajouter les profils de clubs au sitemap
    const clubRoutes: MetadataRoute.Sitemap = clubProfiles.map((profile) => ({
      url: `${host}/profile/${profile.id}`,
      lastModified: profile.updatedAt || now,
      changeFrequency: 'daily' as const,
      priority: 0.7,
    }))

    await prisma.$disconnect()

    return [...staticRoutes, ...escortRoutes, ...clubRoutes]
  } catch (error) {
    console.error('Erreur génération sitemap:', error)
    await prisma.$disconnect()
    // En cas d'erreur, retourner au moins les routes statiques
    return staticRoutes
  }
}

